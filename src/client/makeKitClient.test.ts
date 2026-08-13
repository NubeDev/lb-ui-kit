// The adapter is the whole integration, so it is where the contract is pinned. These tests assert the
// three things that would fail SILENTLY in production if they drifted:
//   • which verb each loader rides and which envelope key its rows come off (a wrong key returns `[]`
//     — an empty picker group that looks exactly like "the workspace has none");
//   • that a denial PROPAGATES as a rejection rather than being swallowed into an empty list (rule 9:
//     denied ≠ empty);
//   • that the insights WRITES reject as denied rather than fake-succeeding.

import { describe, expect, it, vi } from "vitest";

import { makeKitClient, toolCallOf } from "./makeKitClient";
import { isKitDenied, isOutOfScope } from "./types";

/** A stub wire: answers from a verb→value table, rejects anything not in it (as the host would). */
function stubCall(table: Record<string, unknown>) {
  return vi.fn(async (tool: string, _args?: Record<string, unknown>) => {
    if (!(tool in table)) throw new Error(`out_of_scope: ${tool}`);
    return table[tool];
  });
}

describe("makeKitClient — transport shapes", () => {
  it("accepts a bare tool-call function (the shell's form)", async () => {
    const call = stubCall({ "series.list": { series: ["a"] } });
    const kit = makeKitClient(call);
    await expect(kit.loaders.listSeries!()).resolves.toEqual(["a"]);
    expect(call).toHaveBeenCalledWith("series.list", {});
  });

  it("accepts a bridge (the extension's form) — the SAME code path", async () => {
    const call = stubCall({ "series.list": { series: ["a"] } });
    const kit = makeKitClient({ call: call as never });
    await expect(kit.loaders.listSeries!()).resolves.toEqual(["a"]);
  });

  it("exposes the raw call for the read cache to bind to", async () => {
    const call = stubCall({ "viz.query_batch": { results: [] } });
    const kit = makeKitClient(call);
    await kit.call("viz.query_batch", { panels: [] });
    expect(call).toHaveBeenCalledWith("viz.query_batch", { panels: [] });
  });

  it("toolCallOf is idempotent on a function", () => {
    const fn = stubCall({});
    expect(toolCallOf(fn)).toBe(fn);
  });
});

describe("makeSourceLoaders — verb + envelope map", () => {
  const table = {
    "series.list": { series: ["s1", "s2"] },
    "ext.list": { extensions: [{ ext: "nabers", enabled: true }] },
    "flows.list": { flows: [{ id: "f1", name: "Flow" }] },
    "flows.get": { id: "f1", name: "Flow", nodes: [] },
    "flows.nodes": { nodes: [{ type: "math" }] },
    "datasource.list": { datasources: [{ name: "ts", kind: "timescale" }] },
    "rules.list": { rules: [{ id: "r1", name: "Rule" }] },
    "query.list": { queries: [{ id: "q1", name: "Query" }] },
    "store.schema": { tables: [{ name: "t", columns: [] }] },
    "channel.list": { channels: [{ id: "c1" }] },
    "insight.list": { items: [{ id: "i1", title: "T" }] },
  };

  it("rides the right verb and unwraps the right envelope key for every loader", async () => {
    const call = stubCall(table);
    const l = makeKitClient(call).loaders;

    await expect(l.listSeries!()).resolves.toEqual(["s1", "s2"]);
    await expect(l.listExtensions!()).resolves.toHaveLength(1);
    await expect(l.listFlows!()).resolves.toEqual([{ id: "f1", name: "Flow" }]);
    await expect(l.getFlow!("f1")).resolves.toMatchObject({ id: "f1" });
    await expect(l.listFlowNodes!()).resolves.toEqual([{ type: "math" }]);
    await expect(l.listDatasources!()).resolves.toHaveLength(1);
    await expect(l.listRules!()).resolves.toEqual([{ id: "r1", name: "Rule" }]);
    await expect(l.listQueries!()).resolves.toEqual([{ id: "q1", name: "Query" }]);
    await expect(l.readSchema!()).resolves.toEqual({ tables: [{ name: "t", columns: [] }] });
    await expect(l.listChannels!()).resolves.toEqual([{ id: "c1" }]);
    await expect(l.listInsights!()).resolves.toEqual([{ id: "i1", title: "T" }]);

    expect(call.mock.calls.map((c) => c[0])).toEqual([
      "series.list",
      "ext.list",
      "flows.list",
      "flows.get",
      "flows.nodes",
      "datasource.list",
      "rules.list",
      "query.list",
      "store.schema",
      "channel.list",
      "insight.list",
    ]);
  });

  it("a DENIED verb rejects — it never resolves to an empty list", async () => {
    // denied ≠ empty. If this ever resolved to `[]`, a capability refusal would render as "the
    // workspace has no series", which is the exact dishonesty the deny path exists to prevent.
    const l = makeKitClient(stubCall({})).loaders;
    await expect(l.listSeries!()).rejects.toThrow(/out_of_scope: series\.list/);
    expect(isOutOfScope(await l.listSeries!().catch((e) => e))).toBe(true);
  });

  it("an EMPTY-but-answered envelope resolves to [] — that IS honest emptiness", async () => {
    const l = makeKitClient(stubCall({ "series.list": { series: [] } })).loaders;
    await expect(l.listSeries!()).resolves.toEqual([]);
  });

  it("a malformed envelope yields [] rather than throwing (the host answered)", async () => {
    const l = makeKitClient(stubCall({ "series.list": { nope: 1 } })).loaders;
    await expect(l.listSeries!()).resolves.toEqual([]);
  });

  it("getFlow maps a per-flow denial to null so one unreadable flow cannot fail the bundle", async () => {
    const l = makeKitClient(stubCall({ "flows.list": { flows: [] } })).loaders;
    await expect(l.getFlow!("secret")).resolves.toBeNull();
  });

  it("ships NO listInbox without a channel — inbox.list is per-channel", async () => {
    expect(makeKitClient(stubCall({})).loaders.listInbox).toBeUndefined();
  });

  it("ships listInbox bound to the configured channel when one is given", async () => {
    const call = stubCall({ "inbox.list": { items: [{ id: "m1", channel: "ops" }] } });
    const l = makeKitClient(call, { inboxChannel: "ops" }).loaders;
    await expect(l.listInbox!()).resolves.toEqual([{ id: "m1", channel: "ops" }]);
    expect(call).toHaveBeenCalledWith("inbox.list", { channel: "ops" });
  });
});

describe("makeInsightsClient — reads map, writes deny", () => {
  it("maps the read verbs", async () => {
    const call = stubCall({
      "insight.list": { items: [{ id: "i1" }] },
      "insight.get": { id: "i1" },
      "insight.occurrences": { items: [{ oseq: 1 }] },
    });
    const ins = makeKitClient(call).insights;
    await expect(ins.list({})).resolves.toEqual({ items: [{ id: "i1" }] });
    await expect(ins.get("i1")).resolves.toEqual({ id: "i1" });
    await expect(ins.occurrences("i1")).resolves.toEqual({ items: [{ oseq: 1 }] });
    expect(call).toHaveBeenCalledWith("insight.occurrences", {
      insight_id: "i1",
      cursor: undefined,
      limit: 50,
    });
  });

  it("ack/resolve reject as DENIED and never touch the wire", async () => {
    // The alternative — wiring them through, or resolving void — would give the user a button that
    // appears to work and silently does nothing. Until U-ext-bridge-write lands, denied is the truth.
    const call = stubCall({ "insight.ack": { ok: true }, "insight.resolve": { ok: true } });
    const ins = makeKitClient(call).insights;

    const ackErr = await ins.ack("i1").catch((e) => e);
    const resErr = await ins.resolve("i1").catch((e) => e);
    expect(isKitDenied(ackErr)).toBe(true);
    expect(isKitDenied(resErr)).toBe(true);
    expect(call).not.toHaveBeenCalled();
  });

  it("omits `subscribe` — a leashed call carries no stream", () => {
    expect(makeKitClient(stubCall({})).insights.subscribe).toBeUndefined();
  });
});
