// Ambient freshness TTL for the panel-data fetch (dashboard-query-acceleration §A). Like `useFreeze`,
// the effective cache TTL must reach `useVizQuery` deep inside every view WITHOUT threading a prop
// through the render path (a dozen files, re-coupling the views). The dashboard wraps its grid subtree
// in `FreshnessProvider value={ttlS}`; `useVizQuery` reads it and, when > 0, sends the top-level
// `cache: {ttl_s}` directive. Outside a provider (the editor probe/preview/plot) there is no context →
// TTL 0 → no directive → today's live fetch. One responsibility: carry the effective TTL to the fetch.
//
// The TTL is a SERVER freshness HINT, never a data selector — it is deliberately NOT part of any
// react-query key (`cache/queryKeys.ts`), so a TTL change never fragments the client cache or forces a
// refetch (the scope's headline risk). This context only carries it to the call site.

import { createContext, useContext } from "react";

/** The effective `viz.query` cache TTL in seconds. `0` (the default, no provider) ⇒ live: the fetch
 *  sends no `cache` directive, exactly as before this scope. */
const FreshnessContext = createContext(0);

export const FreshnessProvider = FreshnessContext.Provider;

/** Read the ambient effective cache TTL (seconds). `0` ⇒ live (omit the directive). */
export function useFreshness(): number {
  return useContext(FreshnessContext);
}
