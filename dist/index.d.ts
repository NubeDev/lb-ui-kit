import { JSX as JSX_2 } from 'react';
import { ReactNode } from 'react';

/** A write action — the tool a switch/slider/button calls on interaction. `argsTemplate` carries a
 *  `{{value}}` slot the interaction fills. */
export declare interface Action {
    tool: string;
    argsTemplate?: Record<string, unknown>;
}

/** The sentinel a stored preference uses for "no stated preference" — treated as absent, not as a
 *  zone name. Empty string means the same thing. */
export declare const BROWSER_TZ = "browser";

/** The browser's zone, or `UTC` when the platform will not say. The default {@link ZoneResolver}.
 *  Never guesses UTC when a real zone is available — a chart silently drawn in the wrong zone is the
 *  failure mode this exists to avoid. */
export declare function browserZone(): string;

/** Anything with a leashed `call` — an `ExtBridge`, a `PageBridge`, a `WidgetBridge`. Accepted by
 *  {@link makeKitClient} so an extension passes its bridge straight through. */
export declare interface CallLike {
    call: <T = unknown>(tool: string, args?: Record<string, unknown>) => Promise<T>;
}

/** A whole-calendar-period unit (the `this-`/`last-`/`next-` families + the snap suffix). */
export declare type CalUnit = "second" | "minute" | "hour" | "day" | "week" | "month" | "quarter" | "year";

/** A registered channel row (the subset of `channel.list` the catalog needs — id only; the registry
 *  record carries more, the package keeps the seam minimal). */
export declare interface ChannelRow {
    id: string;
}

/** The `[capabilities] request` list matching {@link DASH_KIT_READ_SCOPE}. Four, not five — the batch
 *  verb rides `mcp:viz.query:call` (above). Exported so an author can paste both halves and cannot
 *  accidentally request a capability that does not exist. */
export declare const DASH_KIT_READ_CAPS: readonly ["mcp:viz.query:call", "mcp:series.read:call", "mcp:series.latest:call", "mcp:series.find:call"];

/** The `[ui] scope` a kit-built read page needs. Paste verbatim into `extension.toml`:
 *
 * ```toml
 * [capabilities]
 * request = ["mcp:viz.query:call", "mcp:series.read:call", "mcp:series.latest:call", "mcp:series.find:call"]
 *
 * [ui]
 * scope = ["viz.query", "viz.query_batch", "series.read", "series.latest", "series.find"]
 * ```
 *
 * Note the asymmetry: five scope entries, four caps. `viz.query_batch` is the aliased one (above).
 * An admin may approve a SUBSET — the effective grant is the intersection, and every kit surface whose
 * verb was declined renders a **denied** state naming it, never an empty chart. */
export declare const DASH_KIT_READ_SCOPE: readonly ["viz.query", "viz.query_batch", "series.read", "series.latest", "series.find"];

export declare function DashboardRangePicker({ from, to, onApply, timezone, compact, dateStyle, onUserApply, }: DashboardRangePickerProps): JSX_2.Element;

export declare interface DashboardRangePickerProps {
    /** The committed range EXPRESSION pair (the URL contract; `to` absent for a window token). */
    from: string;
    to?: string;
    onApply: (range: {
        from: string;
        to?: string;
    }) => void;
    /** The range-anchor timezone (`rangeTimezone(...)`) the preview resolves in. Absent ⇒ the viewer's LOCAL zone. */
    timezone?: string;
    /** Phone width (mobile-friendly-ui §4.2): trigger shows the short label; popover clamps. */
    compact?: boolean;
    /** The viewer's resolved `date_style`, threaded to the absolute-tab date fields. Absent ⇒ `eu`. */
    dateStyle?: DateStyle;
    /** Fired just before `onApply` when the user commits a window. The shell passes `markUserRefresh`
     *  so its panels show the refreshing indicator while the re-query lands; that is dashboard-refresh
     *  telemetry, not picker logic, so it is injected rather than shipped. Absent ⇒ nothing extra. */
    onUserApply?: () => void;
}

/** A registered federation datasource (from `datasource.list`). */
export declare interface DatasourceRow {
    name: string;
    kind: string;
    /** Optional endpoint label (mirrors `datasource.list`'s `endpoint`). The catalog row renders it as
     *  a `kind · endpoint` sub-label; absent ⇒ just `kind`. */
    endpoint?: string;
}

/** Human placeholder for the field, e.g. `DD/MM/YYYY`, so an empty field reads correctly per style. */
export declare function datePlaceholder(style: DateStyle): string;

/** The viewer's resolved date-field style. Vendored as a 3-value union rather than imported from the
 *  shell's prefs types: it is the whole of what this module needs, and pulling `prefs.types` in would
 *  drag the shell's preference subsystem into a pure formatter. */
export declare type DateStyle = "eu" | "iso" | "usa";

/** The app's default window when a URL carries no (or a broken) range and the board stores none. */
export declare const DEFAULT_RANGE_EXPR = "last-30-days";

export declare type Endpoint = 
/** `now`, `now±<n><unit>`, optional `/<unit>` snap (truncate to the start of that unit). */
    {
    kind: "now";
    offset?: {
        sign: 1 | -1;
        n: number;
        unit: StepUnit;
    };
    snap?: CalUnit;
}
/** An ISO `yyyy-mm-dd` day — midnight in the range timezone (today's contract, unchanged). */
| {
    kind: "isoDay";
    y: number;
    mo: number;
    d: number;
}
/** A zoned ISO instant or 13-digit epoch ms — an absolute instant, timezone-independent. */
| {
    kind: "instant";
    ms: number;
}
/** A zone-less ISO instant — interpreted as a wall time in the range timezone. */
| {
    kind: "wall";
    y: number;
    mo: number;
    d: number;
    h: number;
    mi: number;
    s: number;
    ms: number;
};

/** The data that proves a finding — the producer's own binding. Mirrors `lb_insights::Evidence`
 *  (`docs/scope/insights/insight-evidence-scope.md`).
 *
 *  `series` is NOT the rule's judgment query: a rule that judges with a `GROUP BY` aggregate has no
 *  time axis to plot, so it states the underlying per-entity series separately. Draw `series`; treat
 *  `query` as provenance only. A reader turns each series into one panel target —
 *  `{tool: evidence.tool ?? "federation.query", args: {source, sql}}`. */
export declare interface Evidence {
    /** Datasource id the series resolve against, resolved by the reader per-workspace. */
    source: string;
    series?: EvidenceSeries[];
    /** The judgment query — provenance/"open evidence" only, frequently not plottable. */
    query?: string;
    /** The window judged, epoch-ms — lets a viewer open pre-ranged. */
    window?: {
        from: number;
        to: number;
    };
    /** The threshold crossed, in the series' own units — draw as a threshold line. */
    threshold?: number;
    /** Data-plane verb the series dispatch through; absent ⇒ `"federation.query"`. */
    tool?: string;
}

/** One plottable series the finding sits on. Mirrors `lb_insights::EvidenceSeries`. */
export declare interface EvidenceSeries {
    /** A query yielding `(time, value)` rows. Dialect is the datasource's business. */
    sql: string;
    label?: string;
    unit?: string;
}

/** An installed extension row (the subset the picker needs from `ext.list`). */
export declare interface ExtRow {
    ext: string;
    enabled: boolean;
    ui?: ExtUi | null;
    widgets?: ExtUi[];
}

/** A page/widget an extension contributes (mirrors the node's `ExtUi`). */
export declare interface ExtUi {
    entry: string;
    label: string;
    icon: string;
    scope: string[];
    /** `true` for a frames-in DATA widget (manifest `data = true`) — it keeps the cell's `sources[]`. */
    data?: boolean;
    /** The stable widget id (ext-widget-panel-options scope) — the `ext:<ext>/<id>` view-key segment.
     *  Absent for a page / a pre-id install (callers fall back to `widgetIdOf(label)`). */
    id?: string | null;
    /** The widget's manifest-declared panel options, relayed for the host editor. Absent = none. */
    options?: ExtWidgetOption[];
}

/** One manifest-declared widget option def (mirrors the node's `ExtUiOption`) — the shape the host
 *  editor renders. Opaque relay data; the picker package never interprets `control`/`scope`. */
export declare interface ExtWidgetOption {
    id: string;
    label: string;
    scope: "options" | "fieldConfig";
    path: string;
    control: string;
    choices?: ReadonlyArray<{
        value: string;
        label?: string;
    }>;
    default?: unknown;
}

/** A full flow (from `flows.get`) — only the fields the picker walks. */
export declare interface Flow {
    id: string;
    name: string;
    nodes?: FlowNode[];
}

/** A flow node (the subset the picker reads to enumerate ports). */
export declare interface FlowNode {
    id: string;
    type: string;
}

/** A flow's summary (from `flows.list`). */
export declare interface FlowSummary {
    id: string;
    name: string;
}

/** ISO `YYYY-MM-DD` → the pref-styled display string. Empty/invalid input returns "" so the caller
 *  can show the placeholder rather than a garbled partial date. */
export declare function formatDateField(iso: string, style: DateStyle): string;

/** An inbox item summary row (the subset of `inbox.list`'s `Item` the catalog renders). */
export declare interface InboxRow {
    id: string;
    channel: string;
}

/** One durable insight record. Mirrors `lb_insights::Insight`. */
export declare interface Insight {
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

/** A live insight event on the `insight.watch` feed. Mirrors `lb_insights::RaiseEvent`. */
export declare interface InsightEvent {
    kind: "raise" | "ack" | "resolve";
    id: string;
    dedup_key: string;
    status: Status;
    severity: Severity;
    count: number;
    ts: number;
}

/** The injected transport seam — how a host reaches the node's `insight.*` verbs. Every method maps
 *  1:1 to a verb; the host implements them over its own transport (the shell's `/mcp/call` bridge, an
 *  extension's host bridge). A read the caller isn't granted may reject — the hooks surface that as an
 *  error, never a fabricated list (CLAUDE §9). `subscribe` is OPTIONAL: a host with no live feed (the
 *  Tauri shell, tests) omits it and the hooks fall back to the act→refresh round trip.
 *
 *  `ack`/`resolve` take no timestamp: the host stamps `ts: Date.now()` at the transport (the package
 *  is pure and can't call `Date.now()` deterministically — see the shell's `insights.api.ts`). */
export declare interface InsightsClient {
    list(query: ListQuery): Promise<ListPage>;
    get(id: string): Promise<Insight | null>;
    ack(id: string): Promise<void>;
    resolve(id: string, note?: string): Promise<void>;
    occurrences(insightId: string, cursor?: OccCursor, limit?: number): Promise<OccurrencePage>;
    /** Optional live tail — `onEvent` per raise/ack/resolve; returns an unsubscribe. Absent → no feed. */
    subscribe?(onEvent: (event: InsightEvent) => void): () => void;
}

/** True for a rejection the kit itself raised as a deliberate denial. Surfaces use this to pick the
 *  denied state over the error state. */
export declare function isKitDenied(e: unknown): e is KitDeniedError;

/** The ISO `yyyy-mm-dd` day an instant falls in, in `tz` — what previews and URL projections print. */
export declare function isoDayOf(ms: number, tz: string): string;

/** True for the SHELL bridge's local out-of-scope rejection (`out_of_scope: <tool>`), which is what a
 *  missing `[ui] scope` entry produces — the `viz.query_batch` trap in `scope.ts`. A kit surface must
 *  render this as **denied**, never as empty and never as a retryable error. */
export declare function isOutOfScope(e: unknown): boolean;

/** True when the expression is a whole-window token (`today`, `this-month`, `last-3-months`, …) —
 *  the forms that forbid a `to`. */
export declare function isWindowExpr(raw: string): boolean;

/** The assembled client a {@link KitProvider} takes. `call` is the raw seam the read cache dispatches
 *  through; `loaders` and `insights` are the typed bags the picker and the insights surfaces take.
 *  All three ride the ONE transport — this is a mapping layer, not three transports. */
export declare interface KitClient {
    /** The raw leashed call. The cache's batch loader binds directly to this. */
    call: ToolCall;
    /** The source picker's read seam, mapped onto the node's list verbs. */
    loaders: SourceLoaders;
    /** The insights read seam. Its WRITE methods (`ack`/`resolve`) reject as denied — see
     *  {@link makeKitClient}. */
    insights: InsightsClient;
}

/** Options that change WHICH verbs a loader rides, for hosts whose shape differs. Deliberately tiny:
 *  the kit is source-blind (rule 10) and must never learn an extension id. */
export declare interface KitClientOptions {
    /** `inbox.list` is per-channel, so a host that wants the inbox group fixes the channel here. Absent
     *  ⇒ the kit ships NO `listInbox` loader at all and the picker simply has no inbox group — an
     *  honest absent offer, never an empty one that looks like a denial. */
    inboxChannel?: string;
}

export declare interface KitContextValue {
    client: KitClient;
    ws: string;
    theme?: KitTheme;
    zone: ZoneResolver;
}

/** A rejection the kit raises for a verb it deliberately will not carry (today: the insights writes).
 *  Carries `denied` so a surface can render the standard **denied** state rather than an error toast,
 *  and so it is distinguishable from a transport failure. */
export declare class KitDeniedError extends Error {
    readonly denied = true;
    readonly tool: string;
    constructor(tool: string, why: string);
}

/** Wrap a kit-built page. That is the entire integration:
 *
 * ```tsx
 * export function App({ ctx, bridge }: { ctx: PageCtx; bridge: PageBridge }) {
 *   return (
 *     <KitProvider client={makeKitClient(bridge)} ws={ctx.workspace} theme={ctx.theme}>
 *       <MyClientDashboard />
 *     </KitProvider>
 *   );
 * }
 * ```
 */
export declare function KitProvider({ client, ws, theme, zone, children }: KitProviderProps): JSX_2.Element;

export declare interface KitProviderProps {
    /** The whole integration — build it with `makeKitClient(bridge)` (extension) or
     *  `makeKitClient((t, a) => invoke("mcp_call", { tool: t, args: a ?? {} }))` (shell). */
    client: KitClient;
    /** The workspace this subtree reads in. Keys every kit cache entry; NOT the security wall. */
    ws: string;
    /** The host's resolved theme tokens (`ctx.theme`). Re-supply on a host light/dark toggle. */
    theme?: KitTheme;
    /** Resolve the viewer's zone. Defaults to {@link browserZone}. */
    zone?: ZoneResolver;
    children: ReactNode;
}

/** The host's resolved theme tokens — the `WidgetCtx.theme` / `PageCtx` shape the SDK ships (concrete
 *  strings, no `var()`). DOM surfaces inherit the host tokens through the CSS cascade and can ignore
 *  this; a canvas/JS surface reads it and recolors when it changes. Structurally typed so the kit does
 *  not take an SDK dependency for one shape. */
export declare interface KitTheme {
    bg?: string;
    panel?: string;
    fg?: string;
    muted?: string;
    mutedForeground?: string;
    accent?: string;
    border?: string;
    radius?: string;
    fontSans?: string;
    fontMono?: string;
    /** The categorical chart ramp. */
    chart?: string[];
    [token: string]: unknown;
}

/** What {@link makeKitClient} accepts: a bridge, or a bare tool-call function (the shell's form —
 *  `(tool, args) => invoke("mcp_call", { tool, args })`). */
export declare type KitTransport = ToolCall | CallLike;

/** The label of a committed range: a window token names itself; an endpoint pair reads as the literal
 *  expressions ("2026-07-27 → 2026-08-03", "now-4h → now"). An unparseable value prints verbatim —
 *  labelling never throws and never lies about what the URL says. */
export declare function labelOf(from: string, to?: string): string;

/** The AND-composed list filter. Mirrors `lb_insights::ListFilter`. */
export declare interface ListFilter {
    status?: Status;
    severity?: Severity;
    origin_ref?: string;
    tags?: Record<string, string>;
    range?: [number, number];
}

/** One newest-first page of insights. Mirrors `lb_insights::ListPage`. */
export declare interface ListPage {
    items: Insight[];
    next?: PageCursor;
}

/** The full list query (filter + paging + limit). Mirrors `lb_insights::ListQuery`. */
export declare interface ListQuery extends ListFilter {
    cursor?: PageCursor;
    limit?: number;
}

/** The insights seam over one leashed call.
 *
 *  READS map straight onto `insight.*`. WRITES do not: `ack`/`resolve` are required by the interface,
 *  but an extension bridge has no write path yet (`U-ext-bridge-write` is unstarted), and the kit's
 *  contract is that it READS. They therefore reject immediately with a {@link KitDeniedError} so the
 *  surface renders the standard **denied** state. They are never wired through silently and never
 *  fake-succeed — a button that appears to work and quietly does nothing is worse than a disabled one.
 *  When the bridge-write ask lands, this is the one place that changes. */
export declare function makeInsightsClient(call: ToolCall): InsightsClient;

/** Build the whole kit client from one transport. THIS is the entire integration:
 *
 * ```tsx
 * // in an extension page
 * <KitProvider client={makeKitClient(bridge)} ws={ctx.workspace} theme={ctx.theme}>
 * // in the shell
 * <KitProvider client={makeKitClient((t, a) => invoke("mcp_call", { tool: t, args: a ?? {} }))} ws={ws}>
 * ```
 */
export declare function makeKitClient(transport: KitTransport, opts?: KitClientOptions): KitClient;

/** The source picker's read seam over one leashed call. Every loader is deny-tolerant BY REJECTION:
 *  a verb the caller was not granted rejects, and `loadSourcePicker`/`loadCatalog` treat that as "that
 *  group is empty" — an honest capability-scoped offer, exactly as the shell's adapter does. */
export declare function makeSourceLoaders(call: ToolCall, opts?: KitClientOptions): SourceLoaders;

/** A node descriptor (from `flows.nodes`) — the port lists the picker offers as bindings. */
export declare interface NodeDescriptor {
    type: string;
    inputs?: string[];
    outputs?: string[];
}

/** A usable IANA timezone name: the input when Intl accepts it, else `"UTC"` (an unknown zone
 *  DEGRADES, never throws — the shell contract for anything a URL or record can carry). */
export declare function normalizeTz(tz: string | undefined): string;

/** The occurrence-ring cursor. Mirrors `lb_insights::OccCursor`. */
export declare interface OccCursor {
    seq: number;
}

/** One firing in the per-insight occurrence ring. Mirrors `lb_insights::Occurrence`. */
export declare interface Occurrence {
    oseq: number;
    ts: number;
    severity: Severity;
    data?: Record<string, unknown> | unknown[];
}

/** One newest-first page of the occurrence ring. Mirrors `lb_insights::OccurrencePage`. */
export declare interface OccurrencePage {
    items: Occurrence[];
    next?: OccCursor;
}

/** Producer provenance — what raised it, from which run (`ref` is opaque to the host). */
export declare interface Origin {
    kind: OriginKind;
    ref: string;
    run?: string;
}

export declare type OriginKind = "rule" | "flow" | "agent" | "ext" | "manual";

/** Keyset cursor — opaque to the caller; the verb parses it. */
export declare interface PageCursor {
    ts: number;
    id: string;
}

/** The declared type of a rule param — steers the host's input control + value coercion (mirrors the
 *  node's `ParamKind`). Absent → `"text"`. */
export declare type ParamKind = "text" | "number" | "date" | "enum";

/** Pref-styled display string → ISO `YYYY-MM-DD`, or "" if it doesn't parse. The inverse of
 *  `formatDateField`; used when the user edits the visible text directly. */
export declare function parseDateField(text: string, style: DateStyle): string;

export declare type ParseOutcome = {
    ok: true;
    expr: RangeExpr;
} | {
    ok: false;
    error: string;
};

/** Parse one expression — a window token or an endpoint. Never throws. */
export declare function parseRangeExpr(raw: string): ParseOutcome;

/** An insight summary row (the subset of `insight.list`'s `items[]` the catalog renders). Severity
 *  + status are optional so a host that only has `id`/`title` still renders. */
export declare interface PickerInsightRow {
    id: string;
    title: string;
    severity?: string;
    status?: string;
}

export declare function PrefDateInput({ value, onChange, dateStyle, className, ...rest }: PrefDateInputProps): JSX_2.Element;

export declare interface PrefDateInputProps {
    value: string;
    onChange: (iso: string) => void;
    /** The viewer's resolved `date_style`. INJECTED rather than read from a prefs hook: resolving it
     *  needs the shell's session store and two network calls, which would drag the whole preference
     *  subsystem into the kit for one three-value enum. The host already knows the answer — it passes it.
     *  Absent ⇒ the product default (`eu`), the same builtin lb folds to, so the un-injected field order
     *  never disagrees with the resolved one. */
    dateStyle?: DateStyle;
    className?: string;
    "aria-label"?: string;
}

/** The first candidate that states a real zone, else whatever `zone()` says. `"browser"`/empty are
 *  "no stated preference" and fall through — they are not zone names. */
export declare function preferredZone(zone: ZoneResolver_2, ...candidates: (string | undefined | null)[]): string;

/** The preview projection of a resolved bound: the ISO day when it falls on a midnight in `tz`, else
 *  the day plus wall time — what the picker's live preview prints. */
export declare function previewBound(ms: number, tz: string): string;

/** A saved query's summary (the subset of `query.list`'s `queries[]` the picker renders) — a saved
 *  query is a read source (`query.run {id}` → `{columns, rows}`), so it mirrors `RuleSummary`.
 *  `target` (optional) is the host's `"platform"` | `"datasource:<name>"` string; the catalog row
 *  renders it as a sub-label so an author can tell a platform query from a federated one at a glance.
 *  Absent ⇒ just the name (a host that only returns `{id,name}` still renders). */
export declare interface QuerySummary {
    id: string;
    name: string;
    target?: string;
}

export declare const RANGE_BANDS: RangeBand[];

/** The unit columns, left to right. One heading per column, shared by both bands. */
export declare const RANGE_COLUMNS: readonly ["Minutes", "Hours", "Days", "Months", "Years"];

/** Every preset, flat — the roster callers outside the picker (and the tests) read. Grid order:
 *  band by band, column by column, so the reading order matches what the popover paints. */
export declare const RANGE_PRESETS: RangePreset[];

/** A band = one row of the grid: trailing (ends now) or calendar (a whole period). */
export declare interface RangeBand {
    id: "trailing" | "calendar";
    /** The band heading. */
    label: string;
    /** The distinction the heading is carrying — rendered small, under the label. */
    hint: string;
    /** Column heading → the presets in that cell, top to bottom. A cell may be EMPTY. */
    cells: Record<RangeColumn, RangePreset[]>;
}

export declare type RangeColumn = (typeof RANGE_COLUMNS)[number];

export declare type RangeExpr = {
    type: "endpoint";
    endpoint: Endpoint;
} | {
    type: "window";
    window: Window_2;
};

export declare interface RangePreset {
    /** Stable id (the shipped ids where one existed — callers/tests key on these). */
    id: string;
    /** The label the user reads — `labelOf(expr)`, precomputed so the popover renders a plain list. */
    label: string;
    /** The range expression the picker COMMITS to the URL (`?from=<expr>`). */
    expr: string;
}

/** The timezone a window ANCHORS in (scope decision 3): the board's `Dashboard.timezone` if set,
 *  else the viewer's prefs timezone, else THE VIEWER'S LOCAL ZONE. (`"browser"`/empty = "no stated
 *  preference".) Distinct from `resolveTimezone` (display formatting, where prefs win) — this decides
 *  which calendar day "today" IS.
 *
 *  The fallback is `preferredZone`'s, i.e. local — NOT UTC (fixed 2026-08-07). This function decides
 *  where `today`/`this-week` TRUNCATE, so a UTC fallback did not merely mislabel: for a UTC+7 viewer
 *  with no stated pref, `today` opened at 07:00 local and `yesterday` was a 7-hour-shifted day. The
 *  lb conformance fixture passes `tz` explicitly at every row and never exercises this resolver, so
 *  the pinned grammar is untouched by the change.
 *
 *  `zone` is the injected resolver (the `KitProvider` `zone` prop) — the extraction's replacement for
 *  the shell-only `preferredZone()` import that used to be this module's single outside coupling. Its
 *  default is the browser zone, which is byte-identical to the shell's previous behaviour. */
export declare function rangeTimezone(dashboardTz?: string, prefsTz?: string, zone?: ZoneResolver_2): string;

/** A resolved window: epoch ms, `toMs` exclusive. What `$__from`/`$__to` carry. */
export declare interface ResolvedRange {
    fromMs: number;
    toMs: number;
}

/** Resolve a `from`/`to` pair against a clock + timezone. `null` = malformed (a bad token, a window
 *  token alongside a `to`, or an inverted pair) — the caller degrades to its default window. */
export declare function resolveRange(from: string | undefined, to: string | undefined, nowMs: number, tz: string): ResolvedRange | null;

/** A rule's declared parameter (mirrors the node's `RuleParam`) — a name, an optional human label, and
 *  its type. A host renders one input per param around the picker and fills the rule's `args.params`.
 *  `kind`/`required`/`options` are optional so a legacy `{name,label}` rule is unaffected. */
export declare interface RuleParam {
    name: string;
    label?: string;
    kind?: ParamKind;
    required?: boolean;
    /** Allowed values for an `enum` param (ignored otherwise). */
    options?: string[];
}

/** A saved rule's summary (the subset of `rules.list` the picker needs) — a rule is a read source
 *  (`rules.run {rule_id}` → records), so it mirrors `FlowSummary`. `params` (optional) are the rule's
 *  declared inputs; the picker carries them onto the entry so a host can offer a params form. */
export declare interface RuleSummary {
    id: string;
    name: string;
    params?: RuleParam[];
}

/** The workspace's local-store schema (every table + its columns) — the result of `readSchema`. */
export declare interface Schema {
    tables: SchemaTable[];
}

/** One column of a local-store table as `store.schema` reports it (mirrors the shell's `SchemaColumn`
 *  shape, homed here so the package stands alone — system-catalog scope). */
export declare interface SchemaColumn {
    name: string;
    type: string;
}

/** One local-store table + its columns (the `store.schema` row shape). */
export declare interface SchemaTable {
    name: string;
    columns: SchemaColumn[];
}

/** A section's load state — never a fake "ready with empty data" when the read was denied. This is
 *  the contract the EXPLORER skin surfaces visibly (loading skeleton / "Not permitted." / ready) and
 *  the COMBOBOX collapses into an empty group via projection. Moved in from the rules panel's
 *  `useDataExplorer` (system-catalog scope).
 *
 *  `idle` is the lazy-load contract: the section is collapsed and its loader has NOT fired yet. The
 *  loader fires the first time a user expands the section (the explorer's `onOpen`), then transitions
 *  to `loading` → `ready`/`denied`. Subsequent collapse/re-expand keeps the cached data (no refire). */
export declare type SectionState<T> = {
    status: "idle";
} | {
    status: "loading";
} | {
    status: "ready";
    data: T;
} | {
    status: "denied";
    error: string;
};

export declare type Severity = "info" | "warning" | "critical";

/** The phone-width label (mobile-friendly-ui §4.2): a token label is already short; an ISO-day pair
 *  compresses to a year-less `Jul 27 – Aug 3` (the full pair is ~200px and clips at 390px). Parsed at
 *  UTC so the printed day never drifts across the viewer's zone — presentation only. */
export declare function shortLabelOf(from: string, to?: string): string;

/** A read source — ANY granted MCP tool call (re-checked at the host per call). */
export declare interface Source {
    tool: string;
    args?: Record<string, unknown>;
}

/** The INJECTED read seam. The host implements each over its own transport (the shell delegates to
 *  its `@/lib/*` clients; an extension calls its `bridge.call`). Every function is allowed to reject /
 *  return empty — the loader hook treats a failure as "that group is empty" (honest, capability-scoped
 *  offer), exactly as the shipped `useSourcePicker` does. All are optional: a host that only wants
 *  series passes just `listSeries`; absent loaders yield absent groups. */
export declare interface SourceLoaders {
    /** Concrete series names (from `series.list`/`series.find`). Drives the Series + Live groups. */
    listSeries?: () => Promise<string[]>;
    /** Installed extensions (from `ext.list`). Drives the Installed-extension + Extension-widget groups. */
    listExtensions?: () => Promise<ExtRow[]>;
    /** Flow summaries the caller may reach (from `flows.list`). */
    listFlows?: () => Promise<FlowSummary[]>;
    /** One flow's full graph (from `flows.get`). Called per summary; a denied flow is skipped. */
    getFlow?: (id: string) => Promise<Flow | null>;
    /** Node descriptors (from `flows.nodes`) — the port lists for the Flows group. */
    listFlowNodes?: () => Promise<NodeDescriptor[]>;
    /** Registered federation datasources (from `datasource.list`). Drives the Datasource dropdown. */
    listDatasources?: () => Promise<DatasourceRow[]>;
    /** Saved rules the caller may run (from `rules.list`). Drives the Rules group — each ⇒ a `rules.run`
     *  read source (the rule fetches + computes in the cage and returns records the panel draws). */
    listRules?: () => Promise<RuleSummary[]>;
    /** Saved PRQL/raw queries the caller may run (from `query.list`). Drives the Queries group — each ⇒
     *  a `query.run {id}` read source (re-gated per call, no-widening: the caller still needs the
     *  target's underlying cap). Optional + deny-tolerant like every loader. */
    listQueries?: () => Promise<QuerySummary[]>;
    /** The workspace's local-store schema (from `store.schema`). Drives the explorer's Local-tables
     *  section (table → column tree). Absent ⇒ the section is absent (a host that only wants the
     *  picker groups skips it). */
    readSchema?: () => Promise<Schema>;
    /** Registered channels (from `channel.list`). Drives the explorer's Channels section. */
    listChannels?: () => Promise<ChannelRow[]>;
    /** Insights (from `insight.list`). Drives the explorer's Insights section. The host may pre-filter
     *  (status/severity) in its loader closure — the package just enumerates what it returns. */
    listInsights?: () => Promise<PickerInsightRow[]>;
    /** Inbox items (from `inbox.list`). `inbox.list` is per-channel, so the host fixes the channel in
     *  its loader closure; the package calls it with no args. */
    listInbox?: () => Promise<InboxRow[]>;
}

/** What selecting a picker entry yields — the host maps this onto whatever it persists (a dashboard
 *  cell, a scene bind, a variable query, …). Exactly one of `source`/`action`/`viewKey` is set. */
export declare interface SourceSelection {
    /** The chosen entry's id (stable, for round-trip seeding). */
    id: string;
    /** A read source `{tool,args}` (series/live/sql/extension/flows-output). */
    source?: Source;
    /** A write action `{tool,argsTemplate}` (flows-input / a write extension tool). */
    action?: Action;
    /** A packaged tile view key `ext:<id>/<widget>` (a finished extension widget). */
    viewKey?: string;
}

export declare type Status = "open" | "acked" | "resolved";

/** A step unit for offset arithmetic. `m` = minute, `M` = month (Grafana-compatible). */
export declare type StepUnit = "s" | "m" | "h" | "d" | "w" | "M" | "q" | "y";

/** The leashed tool call — the SAME `(tool, args)` an `ExtBridge.call` / `PageBridge.call` /
 *  `WidgetBridge.call` takes, and the same shape `vizBatchLoader`'s `BatchCall` dispatches through.
 *  Returns `unknown`: the caller owns the decode, because the kit must never assume a wire shape it
 *  did not ask for. */
export declare type ToolCall = (tool: string, args?: Record<string, unknown>) => Promise<unknown>;

/** Normalise either accepted transport shape to the bare call. A bridge's `call` is generic; the kit's
 *  `ToolCall` deliberately resolves `unknown` so no decode is assumed at the seam. */
export declare function toolCallOf(transport: KitTransport): ToolCall;

/** The kit context. Throws outside a `KitProvider` — a kit surface with no client has no honest
 *  behaviour available: it cannot read, and rendering empty would be indistinguishable from "no data". */
export declare function useKit(): KitContextValue;

/** The injected client. */
export declare function useKitClient(): KitClient;

/** The kit context, or `null` outside a provider. Prefer the named hooks below; this exists for a
 *  surface that must degrade rather than throw. */
export declare function useKitOptional(): KitContextValue | null;

/** The host's resolved theme tokens, if supplied. */
export declare function useKitTheme(): KitTheme | undefined;

/** The workspace this subtree reads in. */
export declare function useKitWs(): string;

/** The zone resolver — the injected replacement for the shell's `preferredZone()`. */
export declare function useKitZone(): ZoneResolver;

declare type Window_2 = 
/** `yesterday` (-1) / `today` (0) / `tomorrow` (+1): that whole calendar day. */
    {
    kind: "day";
    offset: -1 | 0 | 1;
}
/** `this-` (current) / `last-` (previous) / `next-` whole calendar period. */
| {
    kind: "period";
    rel: "this" | "last" | "next";
    unit: CalUnit;
}
/** `last-<n>-<unit>s` / `last-<n><unit>`: a trailing window ending now. `last-1-month` ≠ `last-month`. */
| {
    kind: "trailing";
    n: number;
    unit: StepUnit;
};
export { Window_2 as Window }

/** How the kit resolves "the viewer's time zone" when nothing more specific is set. Replaces the
 *  shell-only `preferredZone()` import that used to be `lib/timerange`'s single outside coupling —
 *  a prop rather than an SDK change, so no `ui-v*` tag is involved. Default: the browser zone. */
export declare type ZoneResolver = () => string;

/** How the kit resolves "the viewer's zone". Mirrors `KitProvider`'s `zone` prop. */
declare type ZoneResolver_2 = () => string;

export { }
