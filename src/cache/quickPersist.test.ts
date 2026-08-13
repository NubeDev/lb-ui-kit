// The discovery-cache persistence contract (quick-chart-discovery scope, Phase 1 goal 2). What must
// hold, in order of how badly each would bite:
//
//   - WORKSPACE ISOLATION: workspace B must never rehydrate workspace A's shapes. Enforced at the
//     storage boundary (the ws is in the IndexedDB key), not merely by a key filter.
//   - VERSIONING: a panel-kit shape change must not rehydrate incompatible data into
//     `detectMetricShape`. The buster is in the storage key too.
//   - SCOPE: only the `quick-*` discovery slice is persisted. Panel DATA stays per-visit — that is
//     the whole reason the dashboard client is minted per mount.
//   - HONESTY: a failed/denied read is never persisted as if it were an answer (rule 9).
//
// `idb-keyval` is stubbed with an in-memory map (jsdom has no IndexedDB); everything else — the real
// persister, the real `persistQueryClient`, a real `QueryClient` — runs for real.

import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, unknown>();
vi.mock("idb-keyval", () => ({
  get: (k: string) => Promise.resolve(store.get(k)),
  set: (k: string, v: unknown) => {
    store.set(k, v);
    return Promise.resolve();
  },
  del: (k: string) => {
    store.delete(k);
    return Promise.resolve();
  },
}));

import { persistQuickCache, quickPersister, QUICK_PERSIST_VERSION } from "./quickPersist";

/** A client whose entries survive long enough to be dehydrated (the dashboard default gcTime is a
 *  de-dup window in seconds; the real `quick-*` reads override it — see `useQuickSchema`). */
function client(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 60_000, staleTime: 60_000 } },
  });
}

/** Seed a resolved query and let the throttled persist write settle. */
async function seed(qc: QueryClient, key: unknown[], data: unknown) {
  await qc.fetchQuery({ queryKey: key, queryFn: () => Promise.resolve(data) });
  await vi.waitFor(() => expect(store.size).toBeGreaterThan(0), { timeout: 3000 });
}

beforeEach(() => store.clear());
afterEach(() => vi.restoreAllMocks());

describe("quick cache persistence", () => {
  it("persists the quick-* discovery slice and nothing else", async () => {
    const qc = client();
    const stop = persistQuickCache(qc, "nube");
    await seed(qc, ["quick-tables", "nube", "demo"], [{ name: "reading" }]);
    await qc.fetchQuery({ queryKey: ["viz-frame", "nube", "panel-1"], queryFn: () => Promise.resolve([1]) });

    const persisted = store.get(`lb.quick-cache.${QUICK_PERSIST_VERSION}.nube`) as {
      clientState: { queries: { queryKey: unknown[] }[] };
    };
    const keys = persisted.clientState.queries.map((q) => q.queryKey[0]);
    expect(keys).toContain("quick-tables");
    expect(keys).not.toContain("viz-frame");
    stop();
  });

  it("restores into a fresh client — a reload renders the last detection instantly", async () => {
    const a = client();
    const stopA = persistQuickCache(a, "nube");
    await seed(a, ["quick-tables", "nube", "demo"], [{ name: "reading" }]);
    stopA();

    const b = client();
    const stopB = persistQuickCache(b, "nube");
    await vi.waitFor(() =>
      expect(b.getQueryData(["quick-tables", "nube", "demo"])).toEqual([{ name: "reading" }]),
    );
    stopB();
  });

  it("never rehydrates another workspace's shapes", async () => {
    const a = client();
    const stopA = persistQuickCache(a, "nube");
    await seed(a, ["quick-tables", "nube", "demo"], [{ name: "nube-only" }]);
    stopA();

    const b = client();
    const stopB = persistQuickCache(b, "other");
    await new Promise((r) => setTimeout(r, 20));
    expect(b.getQueryData(["quick-tables", "nube", "demo"])).toBeUndefined();
    expect(b.getQueryData(["quick-tables", "other", "demo"])).toBeUndefined();
    stopB();
  });

  it("discards a store written under a different cache-buster version", async () => {
    const qc = client();
    const stop = persistQuickCache(qc, "nube");
    await seed(qc, ["quick-tables", "nube", "demo"], [{ name: "reading" }]);
    stop();

    // Simulate a panel-kit shape change: the same bytes, found under the OLD version's key.
    const old = store.get(`lb.quick-cache.${QUICK_PERSIST_VERSION}.nube`);
    store.clear();
    store.set("lb.quick-cache.v0.nube", old);

    const fresh = client();
    const stopFresh = persistQuickCache(fresh, "nube");
    await new Promise((r) => setTimeout(r, 20));
    expect(fresh.getQueryData(["quick-tables", "nube", "demo"])).toBeUndefined();
    stopFresh();
  });

  it("does not persist a failed read as an answer", async () => {
    const qc = client();
    const stop = persistQuickCache(qc, "nube");
    await seed(qc, ["quick-tables", "nube", "demo"], [{ name: "reading" }]);
    await qc
      .fetchQuery({ queryKey: ["quick-probe", "nube", "demo"], queryFn: () => Promise.reject(new Error("Denied")) })
      .catch(() => {});

    const persisted = store.get(`lb.quick-cache.${QUICK_PERSIST_VERSION}.nube`) as {
      clientState: { queries: { queryKey: unknown[] }[] };
    };
    expect(persisted.clientState.queries.map((q) => q.queryKey[0])).not.toContain("quick-probe");
    stop();
  });

  it("exposes a persister keyed per workspace and version", async () => {
    const p = quickPersister("nube");
    await p.persistClient({ buster: "b", timestamp: 1, clientState: { mutations: [], queries: [] } });
    expect([...store.keys()]).toEqual([`lb.quick-cache.${QUICK_PERSIST_VERSION}.nube`]);
    await p.removeClient();
    expect(store.size).toBe(0);
  });
});
