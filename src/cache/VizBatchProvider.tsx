// Provides the viz.query BATCH loader to a dashboard's cells (dashboard-query-acceleration §B). Mounted
// around the grid so every cell's fetch coalesces into ONE `viz.query_batch` per open/tick. NOT mounted
// around an editor probe/preview/plot (a single draft panel), so those keep the lone `viz.query` path —
// `useVizBatchLoader()` returns `null` there and the caller falls back to its direct call. One
// responsibility: own the per-visit loader instance + hand it down. The feature-detect/fallback lives in
// the loader; this file is pure wiring.
//
// EXTRACTION NOTE. Upstream this built its own bridge (`makeWidgetBridge(["viz.query","viz.query_batch"])`),
// which reached the shell's IPC seam. The kit takes the call from the `KitProvider` instead — the same
// leashed `(tool, args)` the host already injected. That is strictly better than the shell's version: the
// leash is now whatever the HOST granted rather than a list this file names, so an extension's batch
// rides its own `[ui] scope` and the kit never asserts a verb set of its own. (An out-of-scope batch
// rejects locally with `out_of_scope: viz.query_batch` — which is exactly what `DASH_KIT_READ_SCOPE`
// exists to prevent, and what the loader's feature-detect degrades from.)

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useKit } from "../provider/KitProvider";
import { makeVizBatchLoader, type BatchCall, type VizBatchLoader } from "./vizBatchLoader";

const VizBatchContext = createContext<VizBatchLoader | null>(null);

/** Read the ambient batch loader, or `null` outside a provider (an editor / a lone panel) — the caller
 *  then uses the single `viz.query` path. */
export function useVizBatchLoader(): VizBatchLoader | null {
  return useContext(VizBatchContext);
}

/** Mount a per-visit batch loader for the subtree. One loader per mount so its feature-detect +
 *  coalescing state is scoped to this dashboard visit.
 *
 *  `call` is optional: absent, the loader binds to the `KitProvider`'s client. A host with a narrower
 *  seam for this subtree (a widget bridge leashed to the two viz verbs) passes it explicitly. */
export function VizBatchProvider({ call, children }: { call?: BatchCall; children: ReactNode }) {
  const kit = useKit();
  const loader = useMemo(
    () => makeVizBatchLoader(call ?? ((tool, args) => kit.client.call(tool, args))),
    [call, kit.client],
  );
  return <VizBatchContext.Provider value={loader}>{children}</VizBatchContext.Provider>;
}
