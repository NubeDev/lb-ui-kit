// The shared `datasource.list` read (dashboard-query-cache-scope). ONE definition of "how to fetch the
// workspace's federation datasources", so every consumer collapses to a single cache entry: a Query-tab
// dropdown AND the source-picker bundle (whose `listDatasources` loader routes here via `fetchQuery`)
// read the same `["datasource.list", ws]` key → `datasource.list` fires ONCE per ws, not the 2–3× the
// scope flagged. One responsibility: the datasource-list query descriptor.
//
// EXTRACTION NOTE. Upstream this imported the shell's `listDatasources()` directly, which reaches the
// IPC seam — the one genuinely impure coupling in the cache dir. The kit takes the fetcher instead: it
// is already in `KitClient.loaders.listDatasources`, mapped onto the `datasource.list` verb, so a host
// passes what it already has and no transport enters the library.

import type { QueryClient } from "@tanstack/react-query";

import { LIST_STALE_MS } from "./dashboardQueryClient";
import { datasourceListKey } from "./queryKeys";

/** A registered federation datasource, as the list read returns it. The kit's own shape: the shell's
 *  `DatasourceSummary` camel-cases the wire's `secret_ref`, and the ref — never a value, never a DSN —
 *  is the only credential-adjacent field that ever crosses this boundary. */
export interface DatasourceSummary {
  name: string;
  kind: string;
  endpoint: string;
  /** The secret store reference (e.g. `federation/timescale`) — the ref, never the value. */
  secretRef?: string;
}

/** How the host fetches the list. `KitClient.loaders.listDatasources` satisfies this. */
export type ListDatasources = () => Promise<DatasourceSummary[]>;

/** The query options for `datasource.list` in workspace `ws`. A list-class read (generous stale window):
 *  it rarely changes mid-visit, so a burst of consumers collapses to one fetch. */
export function datasourceListQueryOptions(ws: string, listDatasources: ListDatasources) {
  return {
    queryKey: datasourceListKey(ws),
    queryFn: (): Promise<DatasourceSummary[]> => listDatasources(),
    staleTime: LIST_STALE_MS,
  };
}

/** Fetch (or read warm) the datasource list through the shared cache — used by a source-picker adapter's
 *  `listDatasources` loader so the bundle and the dropdown share the one call. */
export function fetchDatasourceList(
  client: QueryClient,
  ws: string,
  listDatasources: ListDatasources,
): Promise<DatasourceSummary[]> {
  return client.fetchQuery(datasourceListQueryOptions(ws, listDatasources));
}
