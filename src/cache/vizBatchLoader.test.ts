// The viz.query BATCH loader (dashboard-query-acceleration §B). The load-bearing claims, each pinned:
//   - N concurrent loads coalesce into ONE `viz.query_batch` (the connection-ceiling fix); each load
//     reads its own slice by INDEX.
//   - The uniform `cache` directive rides the batch args.
//   - A per-item `error`/`denied` REJECTS just that load (partial failure), siblings resolve.
//   - A batch `NotFound`/400 (an un-bumped pin) → the loader flips UNSUPPORTED and falls back to per-cell
//     `viz.query` for the wave; the NEXT wave skips the batch entirely (feature-detect, one-shot).
//   - Over the 64-panel cap → multiple batches (chunking).
// The `call` seam is a plain stub (the transport boundary), so the real loader logic runs unmocked.

import { describe, expect, it, vi } from "vitest";

import { makeVizBatchLoader, MAX_PANELS, type BatchItem } from "./vizBatchLoader";

/** A frames result for panel `p`, tagged so a slice can be traced back to its panel by index. */
const frameFor = (tag: string) => ({ frames: [{ refId: "A", tag }], rows: [{ tag }] });

describe("makeVizBatchLoader — coalescing", () => {
  it("gathers concurrent loads into ONE viz.query_batch and slices each by index", async () => {
    const call = vi.fn(async (_tool: string, _args: Record<string, unknown>) => ({
      results: [frameFor("p0"), frameFor("p1"), frameFor("p2")],
    }));
    const loader = makeVizBatchLoader(call, { windowMs: 1 });

    const [r0, r1, r2] = await Promise.all([
      loader.load({ id: "p0" }),
      loader.load({ id: "p1" }),
      loader.load({ id: "p2" }),
    ]);

    // ONE round-trip for three cells — the ceiling fix.
    expect(call).toHaveBeenCalledTimes(1);
    const [tool, args] = call.mock.calls[0];
    expect(tool).toBe("viz.query_batch");
    expect(args.panels).toEqual([{ id: "p0" }, { id: "p1" }, { id: "p2" }]);
    // Each cell read ITS slice (index-aligned).
    expect(r0.rows).toEqual([{ tag: "p0" }]);
    expect(r1.rows).toEqual([{ tag: "p1" }]);
    expect(r2.rows).toEqual([{ tag: "p2" }]);
  });

  it("threads the uniform cache directive onto the batch args (and omits it when live)", async () => {
    const call = vi.fn(async (_t: string, _a: Record<string, unknown>) => ({ results: [frameFor("p0")] }));
    const loader = makeVizBatchLoader(call, { windowMs: 1 });
    await loader.load({ id: "p0" }, { ttl_s: 60 });
    expect(call.mock.calls[0][1].cache).toEqual({ ttl_s: 60 });

    const call2 = vi.fn(async (_t: string, _a: Record<string, unknown>) => ({ results: [frameFor("p0")] }));
    const loader2 = makeVizBatchLoader(call2, { windowMs: 1 });
    await loader2.load({ id: "p0" }); // no cache ⇒ live
    expect(call2.mock.calls[0][1]).not.toHaveProperty("cache");
  });

  it("rejects only the failed item on a per-item error/denied; siblings resolve", async () => {
    const call = vi.fn(async (_t: string, _a: Record<string, unknown>) => ({
      results: [frameFor("ok"), { status: "error", message: "No field named foo" }, { status: "denied" }],
    }));
    const loader = makeVizBatchLoader(call, { windowMs: 1 });

    const ok = loader.load({ id: "ok" });
    const bad = loader.load({ id: "bad" });
    const denied = loader.load({ id: "denied" });

    await expect(ok).resolves.toEqual({ frames: [{ refId: "A", tag: "ok" }], rows: [{ tag: "ok" }] });
    await expect(bad).rejects.toThrow("No field named foo");
    await expect(denied).rejects.toThrow("denied");
    expect(call).toHaveBeenCalledTimes(1); // still one batch — a bad tile never fans back out
  });

  it("falls back to per-cell viz.query when the batch verb is absent, then stops trying it", async () => {
    const call = vi.fn(async (tool: string, args: Record<string, unknown>) => {
      if (tool === "viz.query_batch") throw new Error("tool not found: viz.query_batch");
      // The per-cell fallback: `viz.query {panel}` — echo the panel id so we can prove it resolved.
      return frameFor(((args.panel as { id: string }).id));
    });
    const loader = makeVizBatchLoader(call, { windowMs: 1 });

    // Wave 1: batch 404s → per-item fallback still resolves every cell.
    const [a, b] = await Promise.all([loader.load({ id: "a" }), loader.load({ id: "b" })]);
    expect(a.rows).toEqual([{ tag: "a" }]);
    expect(b.rows).toEqual([{ tag: "b" }]);
    expect(loader.supported).toBe(false);
    // One failed batch + two per-cell viz.query.
    expect(call.mock.calls.filter((c) => c[0] === "viz.query_batch")).toHaveLength(1);
    expect(call.mock.calls.filter((c) => c[0] === "viz.query")).toHaveLength(2);

    // Wave 2: now UNSUPPORTED — it must skip the batch entirely and go straight to per-cell.
    call.mockClear();
    const c = await loader.load({ id: "c" });
    expect(c.rows).toEqual([{ tag: "c" }]);
    expect(call.mock.calls.some((cl) => cl[0] === "viz.query_batch")).toBe(false);
    expect(call).toHaveBeenCalledWith("viz.query", { panel: { id: "c" } });
  });

  it("chunks a wave over the 64-panel cap into multiple batches", async () => {
    const call = vi.fn(async (_tool: string, args: Record<string, unknown>) => ({
      results: (args.panels as unknown[]).map((_, i) => frameFor(`x${i}`)),
    }));
    const loader = makeVizBatchLoader(call, { windowMs: 1 });

    const loads = Array.from({ length: MAX_PANELS + 1 }, (_, i) => loader.load({ id: i }));
    await Promise.all(loads);

    expect(call).toHaveBeenCalledTimes(2); // 64 + 1
    expect((call.mock.calls[0][1].panels as unknown[]).length).toBe(MAX_PANELS);
    expect((call.mock.calls[1][1].panels as unknown[]).length).toBe(1);
  });
});

// ── §C: the STREAMED transport ─────────────────────────────────────────────────────────────────────
// The claims that make progressive paint safe:
//   - Injected `streamCall` wins over the batch verb, and each panel settles on ITS item (not the wave).
//   - A panel that arrives EARLY resolves before its slow siblings — the whole point of the transport.
//   - A per-item error/denied still rejects just that load.
//   - A stream that ends short rejects only the panels that never arrived (an honest transport error).
//   - A missing route retires streaming for the visit and falls back to the batch verb, without
//     re-requesting the panels the stream already delivered.
describe("makeVizBatchLoader — streamed transport", () => {
  it("settles each panel as its item arrives, ahead of slower siblings", async () => {
    const gate: Array<() => void> = [];
    const streamCall = vi.fn(async (_args: Record<string, unknown>, onItem: (i: number, item: BatchItem) => void) => {
      onItem(1, frameFor("fast"));
      await new Promise<void>((r) => gate.push(r));
      onItem(0, frameFor("slow"));
    });
    const call = vi.fn(async () => ({ results: [] }));
    const loader = makeVizBatchLoader(call, { windowMs: 1, streamCall });

    const slow = loader.load({ id: "slow" });
    const fast = loader.load({ id: "fast" });

    // The fast panel resolves while the stream is still open — no batch verb call at all.
    expect(await fast).toEqual({ frames: [{ refId: "A", tag: "fast" }], rows: [{ tag: "fast" }] });
    expect(loader.streaming).toBe(true);
    expect(call).not.toHaveBeenCalled();

    gate.forEach((release) => release());
    expect((await slow).rows).toEqual([{ tag: "slow" }]);
  });

  it("rejects only the panel whose item is an error", async () => {
    const streamCall = async (_args: Record<string, unknown>, onItem: (i: number, item: BatchItem) => void) => {
      onItem(0, { status: "error", message: "bad sql" });
      onItem(1, frameFor("ok"));
    };
    const loader = makeVizBatchLoader(vi.fn(), { windowMs: 1, streamCall });

    const bad = loader.load({ id: "bad" });
    const good = loader.load({ id: "good" });

    await expect(bad).rejects.toThrow("bad sql");
    expect((await good).rows).toEqual([{ tag: "ok" }]);
  });

  it("rejects the panels a truncated stream never delivered", async () => {
    const streamCall = async (_args: Record<string, unknown>, onItem: (i: number, item: BatchItem) => void) => {
      onItem(0, frameFor("delivered"));
    };
    const loader = makeVizBatchLoader(vi.fn(), { windowMs: 1, streamCall });

    const delivered = loader.load({ id: "a" });
    const dropped = loader.load({ id: "b" });

    expect((await delivered).rows).toEqual([{ tag: "delivered" }]);
    await expect(dropped).rejects.toThrow(/stream ended/i);
  });

  it("falls back to the batch verb when the route is absent, and retires streaming for the visit", async () => {
    const streamCall = vi.fn(async () => {
      throw new Error("404 not found");
    });
    const call = vi.fn(async (_tool: string, args: Record<string, unknown>) => ({
      results: (args.panels as unknown[]).map((_, i) => frameFor(`v${i}`)),
    }));
    const loader = makeVizBatchLoader(call, { windowMs: 1, streamCall });

    const [a, b] = await Promise.all([loader.load({ id: "a" }), loader.load({ id: "b" })]);
    expect(a.rows).toEqual([{ tag: "v0" }]);
    expect(b.rows).toEqual([{ tag: "v1" }]);
    expect(loader.streaming).toBe(false);
    expect(call).toHaveBeenCalledWith("viz.query_batch", expect.objectContaining({ panels: [{ id: "a" }, { id: "b" }] }));

    // Wave 2: streaming is retired — the batch verb is used directly, the stream is not re-tried.
    streamCall.mockClear();
    await loader.load({ id: "c" });
    expect(streamCall).not.toHaveBeenCalled();
  });

  it("re-batches only the panels a mid-stream failure left unsettled", async () => {
    const streamCall = async (_args: Record<string, unknown>, onItem: (i: number, item: BatchItem) => void) => {
      onItem(0, frameFor("streamed"));
      throw new Error("connection reset");
    };
    const call = vi.fn(async (_tool: string, args: Record<string, unknown>) => ({
      results: (args.panels as unknown[]).map(() => frameFor("recovered")),
    }));
    const loader = makeVizBatchLoader(call, { windowMs: 1, streamCall });

    const first = loader.load({ id: "a" });
    const second = loader.load({ id: "b" });

    expect((await first).rows).toEqual([{ tag: "streamed" }]);
    expect((await second).rows).toEqual([{ tag: "recovered" }]);
    // Only the undelivered panel is re-sent — the streamed one is not queried twice.
    expect(call).toHaveBeenCalledWith("viz.query_batch", expect.objectContaining({ panels: [{ id: "b" }] }));
  });
});
