// The canonical insights vocabulary + the injected transport seam.
//
// This package is TRANSPORT-AGNOSTIC by design (source-picker's discipline): it never imports an API
// client, `invoke`/`bridge`, or `@/`. The host supplies an `InsightsClient` — a bag of read/act
// functions — so ONE implementation works from the shell (gateway/Tauri), from a dashboard widget,
// and from a standalone extension UI (its host bridge) alike.
//
// The record shapes MIRROR the node's wire records one-to-one (the same field names the `insight.*`
// MCP verbs return — `lb_insights::Insight` etc.). They live here so the package stands alone; the
// shell's `@/lib/insights/*` types re-export / structurally match these (one shape, not two).

export type Severity = "info" | "warning" | "critical";
export type Status = "open" | "acked" | "resolved";
export type OriginKind = "rule" | "flow" | "agent" | "ext" | "manual";

/** Producer provenance — what raised it, from which run (`ref` is opaque to the host). */
export interface Origin {
  kind: OriginKind;
  ref: string;
  run?: string;
}

/** One plottable series the finding sits on. Mirrors `lb_insights::EvidenceSeries`. */
export interface EvidenceSeries {
  /** A query yielding `(time, value)` rows. Dialect is the datasource's business. */
  sql: string;
  label?: string;
  unit?: string;
}

/** The data that proves a finding — the producer's own binding. Mirrors `lb_insights::Evidence`
 *  (`docs/scope/insights/insight-evidence-scope.md`).
 *
 *  `series` is NOT the rule's judgment query: a rule that judges with a `GROUP BY` aggregate has no
 *  time axis to plot, so it states the underlying per-entity series separately. Draw `series`; treat
 *  `query` as provenance only. A reader turns each series into one panel target —
 *  `{tool: evidence.tool ?? "federation.query", args: {source, sql}}`. */
export interface Evidence {
  /** Datasource id the series resolve against, resolved by the reader per-workspace. */
  source: string;
  series?: EvidenceSeries[];
  /** The judgment query — provenance/"open evidence" only, frequently not plottable. */
  query?: string;
  /** The window judged, epoch-ms — lets a viewer open pre-ranged. */
  window?: { from: number; to: number };
  /** The threshold crossed, in the series' own units — draw as a threshold line. */
  threshold?: number;
  /** Data-plane verb the series dispatch through; absent ⇒ `"federation.query"`. */
  tool?: string;
}

/** One durable insight record. Mirrors `lb_insights::Insight`. */
export interface Insight {
  id: string;
  dedup_key: string;
  severity: Severity;
  title: string;
  body?: Record<string, unknown> | unknown[];
  /** The data that proves this finding. Echoed by `insight.get`; **absent on `insight.list` rows**
   *  (the roster omits it — page bloat + schema disclosure), so a list-driven view must `get` the
   *  record before it can bind a trend. Also absent on any record whose producer stated none. */
  evidence?: Evidence;
  origin: Origin;
  status: Status;
  status_by?: string;
  status_ts?: number;
  count: number;
  first_ts: number;
  last_ts: number;
  producer: string;
}

/** One firing in the per-insight occurrence ring. Mirrors `lb_insights::Occurrence`. */
export interface Occurrence {
  oseq: number;
  ts: number;
  severity: Severity;
  data?: Record<string, unknown> | unknown[];
}

/** A live insight event on the `insight.watch` feed. Mirrors `lb_insights::RaiseEvent`. */
export interface InsightEvent {
  kind: "raise" | "ack" | "resolve";
  id: string;
  dedup_key: string;
  status: Status;
  severity: Severity;
  count: number;
  ts: number;
}

/** Keyset cursor — opaque to the caller; the verb parses it. */
export interface PageCursor {
  ts: number;
  id: string;
}

/** The AND-composed list filter. Mirrors `lb_insights::ListFilter`. */
export interface ListFilter {
  status?: Status;
  severity?: Severity;
  origin_ref?: string;
  tags?: Record<string, string>;
  range?: [number, number];
  /** Free text over the insight's NAME (`title`), answered by the node's BM25 index.
   *
   *  Server-side on purpose: the roster's search box used to filter the rows the browser happened to
   *  hold, so it searched a WINDOW and reported its size as a total. This searches every row. Name
   *  only — widening it to the tag columns would mean indexing several more fields for a box people
   *  type a fault name into. Mirrors `lb_insights::ListFilter::search`. */
  search?: string;
}

/** The full list query (filter + paging + limit). Mirrors `lb_insights::ListQuery`. */
export interface ListQuery extends ListFilter {
  cursor?: PageCursor;
  limit?: number;
  /** Rows to SKIP before the page — random access, for a pager offering "page N of M", first and
   *  last. The keyset {@link cursor} cannot serve those: it only walks forward one page at a time.
   *
   *  Measured against this engine, offset is the better tool here rather than the usual worse one:
   *  `ORDER BY` sorts the matched set on every request anyway, so skipping costs nothing extra —
   *  page 1 and the LAST page of 20,000 rows were 97.71 ms and 101.76 ms. Mirrors
   *  `lb_insights::ListQuery::offset`. */
  offset?: number;
  /** Ask the node to tally the matching rows and return {@link ListPage.counts} alongside the page.
   *
   *  A pager needs it: without a total, "page N of M" can only be computed from the rows in hand,
   *  which is the page size — so the pager would report the window as the whole. Measured cheap
   *  (`count() GROUP ALL` ≈ 4 ms), but OFF by default: the roster asks for it, a live tail does not.
   *  Mirrors `lb_insights::ListQuery::counts`. */
  counts?: boolean;
}

/** One newest-first page of insights. Mirrors `lb_insights::ListPage`. */
export interface ListPage {
  items: Insight[];
  next?: PageCursor;
  /** The per-status tally for this filter, when the query asked for it (`counts: true`).
   *
   *  The pager needs it: "page 3 of 10" is only true if the total is the NODE's count, not the
   *  number of rows this page happens to hold. Measured cheap — `count() GROUP ALL` is ~4 ms.
   *  Mirrors `lb_insights::ListPage::counts`. */
  counts?: StatusCounts;
}

/** The four numbers the stat tiles and the pager read. Mirrors `lb_insights::StatusCounts`. */
export interface StatusCounts {
  total: number;
  open: number;
  acked: number;
  resolved: number;
}

/** The occurrence-ring cursor. Mirrors `lb_insights::OccCursor`. */
export interface OccCursor {
  seq: number;
}

/** One newest-first page of the occurrence ring. Mirrors `lb_insights::OccurrencePage`. */
export interface OccurrencePage {
  items: Occurrence[];
  next?: OccCursor;
}

/** The injected transport seam — how a host reaches the node's `insight.*` verbs. Every method maps
 *  1:1 to a verb; the host implements them over its own transport (the shell's `/mcp/call` bridge, an
 *  extension's host bridge). A read the caller isn't granted may reject — the hooks surface that as an
 *  error, never a fabricated list (CLAUDE §9). `subscribe` is OPTIONAL: a host with no live feed (the
 *  Tauri shell, tests) omits it and the hooks fall back to the act→refresh round trip.
 *
 *  `ack`/`resolve` take no timestamp: the host stamps `ts: Date.now()` at the transport (the package
 *  is pure and can't call `Date.now()` deterministically — see the shell's `insights.api.ts`). */
export interface InsightsClient {
  list(query: ListQuery): Promise<ListPage>;
  get(id: string): Promise<Insight | null>;
  ack(id: string): Promise<void>;
  resolve(id: string, note?: string): Promise<void>;
  occurrences(insightId: string, cursor?: OccCursor, limit?: number): Promise<OccurrencePage>;
  /** Optional live tail — `onEvent` per raise/ack/resolve; returns an unsubscribe. Absent → no feed. */
  subscribe?(onEvent: (event: InsightEvent) => void): () => void;
}
