// The WHOLE integration: one adapter that turns a leashed `(tool, args)` call into every seam the kit
// needs. In an extension that is `makeKitClient(bridge)`; in the shell it is
// `makeKitClient((tool, args) => invoke("mcp_call", { tool, args: args ?? {} }))`. One code path,
// both hosts — which is what makes "keep them in sync" mechanical instead of aspirational.
//
// This is a real MAPPING layer, not a pass-through. Only the cache's seam is literally `(tool, args)`;
// `SourceLoaders` and `InsightsClient` are typed bags of named functions, so this file is where the
// kit records WHICH verb each loader rides and HOW its rows come back. The verb + envelope pairs below
// are lb's, read off the host tool arms — change one there and this file is the single place to follow.
//
// One responsibility: transport → seams. No React, no state.

import type {
  ChannelRow,
  DatasourceRow,
  ExtRow,
  Flow,
  FlowSummary,
  InboxRow,
  InsightRow,
  NodeDescriptor,
  QuerySummary,
  RuleSummary,
  Schema,
  SourceLoaders,
} from "../source-picker/types";
import type {
  Insight,
  InsightsClient,
  ListPage,
  ListQuery,
  OccCursor,
  OccurrencePage,
} from "../insights/types";
import {
  KitDeniedError,
  type CallLike,
  type KitClient,
  type KitClientOptions,
  type KitTransport,
  type ToolCall,
} from "./types";

/** Normalise either accepted transport shape to the bare call. A bridge's `call` is generic; the kit's
 *  `ToolCall` deliberately resolves `unknown` so no decode is assumed at the seam. */
export function toolCallOf(transport: KitTransport): ToolCall {
  if (typeof transport === "function") return transport;
  const bridge = transport as CallLike;
  return (tool, args) => bridge.call<unknown>(tool, args);
}

/** Read one array off a wire envelope (`{ series: [...] }`, `{ extensions: [...] }`, …). A missing or
 *  non-array key yields `[]` — the host answered, it just had nothing, which is NOT a denial. A denial
 *  arrives as a REJECTION and propagates; the picker's loader hook turns that into an absent group. */
function rows<T>(value: unknown, key: string): T[] {
  if (!value || typeof value !== "object") return [];
  const at = (value as Record<string, unknown>)[key];
  return Array.isArray(at) ? (at as T[]) : [];
}

/** The source picker's read seam over one leashed call. Every loader is deny-tolerant BY REJECTION:
 *  a verb the caller was not granted rejects, and `loadSourcePicker`/`loadCatalog` treat that as "that
 *  group is empty" — an honest capability-scoped offer, exactly as the shell's adapter does. */
export function makeSourceLoaders(call: ToolCall, opts: KitClientOptions = {}): SourceLoaders {
  const loaders: SourceLoaders = {
    listSeries: () => call("series.list", {}).then((r) => rows<string>(r, "series")),
    listExtensions: () => call("ext.list", {}).then((r) => rows<ExtRow>(r, "extensions")),
    listFlows: () => call("flows.list", {}).then((r) => rows<FlowSummary>(r, "flows")),
    // `flows.get` answers the flow BARE (not enveloped). A flow the caller can list but not read
    // rejects; the picker skips it rather than failing the whole bundle, so map a rejection to null.
    getFlow: (id) =>
      call("flows.get", { id })
        .then((r) => (r && typeof r === "object" ? (r as Flow) : null))
        .catch(() => null),
    listFlowNodes: () => call("flows.nodes", {}).then((r) => rows<NodeDescriptor>(r, "nodes")),
    listDatasources: () =>
      call("datasource.list", {}).then((r) => rows<DatasourceRow>(r, "datasources")),
    listRules: () => call("rules.list", {}).then((r) => rows<RuleSummary>(r, "rules")),
    listQueries: () => call("query.list", {}).then((r) => rows<QuerySummary>(r, "queries")),
    // `store.schema` answers the schema BARE. An absent/!object reply is an empty schema, not a throw.
    readSchema: () =>
      call("store.schema", {}).then((r) =>
        r && typeof r === "object" ? (r as Schema) : { tables: [] },
      ),
    listChannels: () => call("channel.list", {}).then((r) => rows<ChannelRow>(r, "channels")),
    listInsights: () => call("insight.list", {}).then((r) => rows<InsightRow>(r, "items")),
  };
  // `inbox.list` is per-channel — there is no "list every inbox" verb. A host that wants the group
  // fixes the channel; absent, the kit ships NO loader, so the picker offers no inbox group at all
  // rather than an empty one that would read as a denial.
  if (opts.inboxChannel) {
    const channel = opts.inboxChannel;
    loaders.listInbox = () =>
      call("inbox.list", { channel }).then((r) => rows<InboxRow>(r, "items"));
  }
  return loaders;
}

/** The insights seam over one leashed call.
 *
 *  READS map straight onto `insight.*`. WRITES do not: `ack`/`resolve` are required by the interface,
 *  but an extension bridge has no write path yet (`U-ext-bridge-write` is unstarted), and the kit's
 *  contract is that it READS. They therefore reject immediately with a {@link KitDeniedError} so the
 *  surface renders the standard **denied** state. They are never wired through silently and never
 *  fake-succeed — a button that appears to work and quietly does nothing is worse than a disabled one.
 *  When the bridge-write ask lands, this is the one place that changes. */
export function makeInsightsClient(call: ToolCall): InsightsClient {
  return {
    list: (query: ListQuery) =>
      call("insight.list", { ...query }).then((r) => (r ?? { items: [] }) as ListPage),
    get: (id: string) => call("insight.get", { id }).then((r) => (r ?? null) as Insight | null),
    occurrences: (insightId: string, cursor?: OccCursor, limit?: number) =>
      call("insight.occurrences", {
        insight_id: insightId,
        cursor,
        limit: limit ?? 50,
      }).then((r) => (r ?? { items: [] }) as OccurrencePage),
    ack: () =>
      Promise.reject(
        new KitDeniedError(
          "insight.ack",
          "the kit is a READ kit; extension bridge writes are not implemented (U-ext-bridge-write)",
        ),
      ),
    resolve: () =>
      Promise.reject(
        new KitDeniedError(
          "insight.resolve",
          "the kit is a READ kit; extension bridge writes are not implemented (U-ext-bridge-write)",
        ),
      ),
    // No `subscribe`: a live tail needs a stream seam the leashed call does not carry. Omitting it is
    // the interface's documented "no feed" case, so the hooks fall back to act→refresh.
  };
}

/** Build the whole kit client from one transport. THIS is the entire integration:
 *
 * ```tsx
 * // in an extension page
 * <KitProvider client={makeKitClient(bridge)} ws={ctx.workspace} theme={ctx.theme}>
 * // in the shell
 * <KitProvider client={makeKitClient((t, a) => invoke("mcp_call", { tool: t, args: a ?? {} }))} ws={ws}>
 * ```
 */
export function makeKitClient(
  transport: KitTransport,
  opts: KitClientOptions = {},
): KitClient {
  const call = toolCallOf(transport);
  return {
    call,
    loaders: makeSourceLoaders(call, opts),
    insights: makeInsightsClient(call),
  };
}
