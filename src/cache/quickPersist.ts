// Durable persistence for the Quick composer's DISCOVERY reads (quick-chart-discovery scope, Phase 1
// goal 2). The dashboard `QueryClient` is deliberately per-visit — it is dropped on route leave so
// panel DATA never outlives the visit. That is right for data and wrong for SHAPE: the answer to
// "what does this source look like?" is stable metadata, and re-deriving it cost the user a ~20 s
// spinner on every reload.
//
// So this mirrors exactly the `quick-*` slice of that client into IndexedDB and rehydrates it on the
// next mount, stale-while-revalidate: the dialog renders the last detection immediately and react-query
// refetches behind it. Nothing authoritative lives here — every entry is derived, evictable, and
// rebuildable from the source (the scope's "no rubix-ai-side discovery store" non-goal holds: this is
// a cache of the react-query cache, not a schema mirror).
//
// One responsibility: persist/restore the quick-* query slice, versioned and workspace-scoped.

import { del, get, set } from "idb-keyval";
import {
  persistQueryClientRestore,
  persistQueryClientSave,
} from "@tanstack/react-query-persist-client";
import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";
import type { Query, QueryClient } from "@tanstack/react-query";

/** The CACHE BUSTER. Bump on ANY change to the shape a `quick-*` query resolves to — `ColumnStats`,
 *  `RelatedField`, the probe record, the table-shape map. react-query rehydrates blindly, so a shape
 *  change without a bump would feed yesterday's structure to today's `detectMetricShape` and produce
 *  a confidently wrong (or crashing) detection. A mismatched buster discards the whole store. */
export const QUICK_PERSIST_VERSION = "v1";

/** How long a persisted entry may be restored before it is discarded outright. This is the OUTER
 *  bound, not the freshness contract: `staleTime` governs revalidation, and everything restored is
 *  refetched in the background anyway. A week keeps "open the same board next Monday" instant. */
export const QUICK_PERSIST_MAX_AGE_MS = 7 * 24 * 60 * 60_000;

/** react-query keys this persists — the discovery slice named by the scope. Panel DATA (`viz-*`) and
 *  every list-class read are deliberately NOT here: they must not survive the visit. */
const QUICK_KEY_PREFIX = "quick-";

/** The IndexedDB key for one workspace's slice. The ws is IN THE KEY (not merely in the query keys)
 *  so a workspace switch can never rehydrate another workspace's shapes even transiently — the
 *  isolation the scope requires, enforced at the storage boundary rather than by a filter. */
function storageKey(ws: string): string {
  return `lb.quick-cache.${QUICK_PERSIST_VERSION}.${ws}`;
}

/** An IndexedDB `Persister` over `idb-keyval`. Deliberately hand-rolled rather than pulling in the
 *  async-storage-persister package: the whole contract is three methods, and IndexedDB (not
 *  localStorage) is the right store for a probe payload that can carry hundreds of distinct values. */
export function quickPersister(ws: string): Persister {
  const key = storageKey(ws);
  // Every method is BEST-EFFORT. A browser with IndexedDB disabled (private mode, a locked-down
  // policy, a non-DOM test env) must lose the speed-up and nothing else — persistence failing is
  // never allowed to become the dashboard failing. A swallowed restore simply means "no cache".
  return {
    persistClient: (client: PersistedClient) => set(key, client).catch(() => undefined),
    restoreClient: () => get<PersistedClient>(key).catch(() => undefined),
    removeClient: () => del(key).catch(() => undefined),
  };
}

/** How long writes are coalesced. Discovery entries land in bursts (a probe fan-out resolves N keys
 *  within milliseconds), so a throttle turns that burst into one IndexedDB write. Short enough that
 *  a user who picks a table and immediately reloads still keeps the result. */
const PERSIST_THROTTLE_MS = 250;

/** True for a query belonging to the discovery slice of THIS workspace. Every `quick-*` key is
 *  `[name, ws, …]` by construction (see `useQuickSchema`), so the ws check is a cheap second wall
 *  behind the per-ws storage key. Only successful queries are worth restoring — an error state
 *  rehydrated as "the answer" is exactly the fabricated result rule 9 forbids. */
function isQuickQuery(ws: string, query: Query): boolean {
  const [name, keyWs] = query.queryKey as unknown[];
  return (
    typeof name === "string" &&
    name.startsWith(QUICK_KEY_PREFIX) &&
    keyWs === ws &&
    query.state.status === "success"
  );
}

/** Wire persistence onto a dashboard `QueryClient` for one workspace visit.
 *
 *  Restore is ASYNCHRONOUS and deliberately NON-BLOCKING: the dashboard renders immediately and the
 *  restored entries land a few milliseconds later — long before the user can open the Quick dialog,
 *  and a race merely costs the old behaviour (a live probe), never a wrong answer. Gating the whole
 *  dashboard subtree on an IndexedDB read to save a dialog that is not yet open would be the worse
 *  trade.
 *
 *  Returns the unsubscribe — call it on unmount so a dropped client stops writing. */
export function persistQuickCache(client: QueryClient, ws: string): () => void {
  if (!ws) return () => {};
  const opts = {
    queryClient: client,
    persister: quickPersister(ws),
    maxAge: QUICK_PERSIST_MAX_AGE_MS,
    // The buster is BELT AND BRACES with the versioned storage key: the key stops a stale store from
    // being found at all, this stops one that somehow was.
    buster: QUICK_PERSIST_VERSION,
    dehydrateOptions: { shouldDehydrateQuery: (q: Query) => isQuickQuery(ws, q) },
  };

  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let unsubscribeCache: (() => void) | null = null;

  // Coalesce: a probe fan-out resolves N keys within milliseconds, and the cache emits an event for
  // each. Writing the whole dehydrated slice N times would be pure waste, so a trailing-edge timer
  // turns the burst into one write. (`persistQueryClient` saves on EVERY event — hence the hand-wired
  // subscription here rather than that convenience wrapper.)
  const save = () => {
    if (stopped || timer) return;
    timer = setTimeout(() => {
      timer = null;
      if (!stopped) void persistQueryClientSave(opts);
    }, PERSIST_THROTTLE_MS);
  };

  void persistQueryClientRestore(opts)
    .catch(() => undefined) // a corrupt store is discarded by the restore itself; never fatal here
    .then(() => {
      if (stopped) return;
      // Save once on attach: entries that resolved DURING the (asynchronous) restore emitted their
      // cache events before the subscription existed, and would otherwise never be written.
      save();
      unsubscribeCache = client.getQueryCache().subscribe(save);
    });

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    unsubscribeCache?.();
  };
}
