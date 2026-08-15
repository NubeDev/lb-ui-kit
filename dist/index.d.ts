import { Context } from 'react';
import { ForwardRefExoticComponent } from 'react';
import { JSX as JSX_2 } from 'react';
import { LucideProps } from 'lucide-react';
import { Persister } from '@tanstack/react-query-persist-client';
import { Provider } from 'react';
import { QueryClient } from '@tanstack/react-query';
import type * as React_2 from 'react';
import { ReactNode } from 'react';
import { RefAttributes } from 'react';

/** A write action — the tool a switch/slider/button calls on interaction. `argsTemplate` carries a
 *  `{{value}}` slot the interaction fills. */
export declare interface Action {
    tool: string;
    argsTemplate?: Record<string, unknown>;
}

/** Step an instant by `n` units in `tz` — exact for s/m/h, calendar (wall-clock-preserving, with
 *  month-end clamping) for d/w/M/q/y. */
export declare function addUnits(ms: number, n: number, unit: StepUnit, tz: string): number;

/** The shared axis chrome (muted ticks, faint split lines) every echarts panel spreads onto its axes,
 *  so the panels cannot drift from each other. */
export declare function axisChrome(theme: EchartsTheme): {
    axisLine: {
        lineStyle: {
            color: string;
        };
    };
    axisTick: {
        show: boolean;
    };
    axisLabel: {
        color: string;
        fontSize: number;
    };
    splitLine: {
        lineStyle: {
            color: string;
            opacity: number;
            type: "dashed";
        };
    };
    nameTextStyle: {
        color: string;
        fontSize: number;
    };
};

/** The transport seam the loader dispatches through — the SAME `{tool, args}` a `WidgetBridge.call`
 *  takes. Injected so a test can stub the wire (the sanctioned `invoke`-boundary pattern) and so the
 *  provider can bind a bridge leashed to `viz.query`/`viz.query_batch`. */
export declare type BatchCall = (tool: string, args: Record<string, unknown>) => Promise<unknown>;

/** The sentinel a stored preference uses for "no stated preference" — treated as absent, not as a
 *  zone name. Empty string means the same thing. */
export declare const BROWSER_TZ = "browser";

/** The browser's zone, or `UTC` when the platform will not say. The default {@link ZoneResolver}.
 *  Never guesses UTC when a real zone is available — a chart silently drawn in the wrong zone is the
 *  failure mode this exists to avoid. */
export declare function browserZone(): string;

/** The builder's group list — the read groups plus the `action` (write control) group, ordered as the
 *  widget builder shows them (action before widget). A host authoring controls uses this. */
export declare const BUILDER_SOURCE_GROUPS: SourceGroup[];

/** Assemble the whole picker from loader results. Series/live from `series`; extension + widget from
 *  `extensions`; flows from `flows`+`descriptors`; the SQL entry is always offered (the host's parse
 *  gate + ws wall make it safe regardless of which tables exist). Datasources are the DROPDOWN roster
 *  (`SourceInputs.datasources`), surfaced by the UI separately from these entries. */
export declare function buildSourceEntries(inputs: SourceInputs): SourceEntry[];

/** The prefix that marks the BUILT-IN namespace. A `__`-led name resolves from `VarScope.builtins`, so a
 *  user variable named there is permanently shadowed — which is why `validateVariables` rejects it. */
export declare const BUILTIN_PREFIX = "__";

/** The shell-resolved built-in globals (`$__from`/`${__user.login}`/`${__workspace}`/…). PURE given
 *  trusted inputs — the host supplies them from the verified token + the URL time range, NEVER a cell
 *  or an iframe (un-spoofable). A flat string map keyed by the built-in's bare name (no leading `$__`). */
export declare type Builtins = Record<string, string>;

/** The freshness directive threaded onto a batch/panel (dashboard-query-acceleration §A). */
export declare interface CacheDirective {
    ttl_s: number;
}

/** Anything with a leashed `call` — an `ExtBridge`, a `PageBridge`, a `WidgetBridge`. Accepted by
 *  {@link makeKitClient} so an extension passes its bridge straight through. */
export declare interface CallLike {
    call: <T = unknown>(tool: string, args?: Record<string, unknown>) => Promise<T>;
}

/** A whole-calendar-period unit (the `this-`/`last-`/`next-` families + the snap suffix). */
export declare type CalUnit = "second" | "minute" | "hour" | "day" | "week" | "month" | "quarter" | "year";

/** Deterministically canonicalise a value: object keys sorted, `undefined` members dropped, arrays kept in
 *  order (order is meaningful for targets/paths). The result is stable across unrelated identity churn, so
 *  two structurally-equal specs hash to the SAME key. */
export declare function canon(value: unknown): unknown;

/** The canonical section registry. A host renders whichever of these its loaders cover; ids stay
 *  opaque (rule 10 — no core branch on a host's "known subsystem list"). */
export declare const CATALOG_SECTION_SPECS: CatalogSectionSpec[];

/** A teaching empty state — used by per-kind row renderers when the section is ready but holds zero
 *  rows (e.g. "No external datasources registered."). */
export declare function CatalogEmpty({ children }: {
    children: ReactNode;
}): JSX_2.Element;

/** What a click in the explorer yields — a tagged row the HOST maps onto its snippet/bind. Each kind
 *  carries ONLY the fields a host needs to form that mapping; the package owns no host semantics
 *  (rule 10). The host's `onSelect` is the one place "what this pick MEANS" is decided. */
export declare type CatalogEntry = {
    kind: "datasource";
    id: string;
    name: string;
    rowKind: string;
    endpoint?: string;
} | {
    kind: "table";
    id: string;
    table: string;
} | {
    kind: "column";
    id: string;
    table: string;
    column: string;
} | {
    kind: "series";
    id: string;
    name: string;
} | {
    kind: "channel";
    id: string;
    name: string;
} | {
    kind: "insight";
    id: string;
    title: string;
    severity?: string;
    status?: string;
} | {
    kind: "inbox";
    id: string;
    channel: string;
} | {
    kind: "query";
    id: string;
    name: string;
    target?: string;
};

/** The system-catalog explorer panel. */
export declare function CatalogExplorer({ sections, onSelect, onLoadSection, sectionSpecs, className, }: CatalogExplorerProps): JSX_2.Element;

export declare interface CatalogExplorerProps {
    /** The per-section state from `useCatalog`. Sections absent here (the host wired no loader) are
     *  skipped even if `sections` lists them — absent loader ⇒ absent section. */
    sections: CatalogSections;
    /** Called with the picked `CatalogEntry` whenever a row is clicked. The host maps the entry onto
     *  its own snippet/bind (a Rhai `source("name")`, a SQL table name, a dashboard cell source). */
    onSelect: (entry: CatalogEntry) => void;
    /** Fired the first time a user expands a section whose state is still `idle` — the host's cue to
     *  run that section's loader. Wire to `useCatalog`'s `loadSection`. Optional (a host that pre-seeds
     *  `ready` data never triggers it); omitting means every section renders open + ready (the eager
     *  contract from before lazy loading — render tests use this). */
    onLoadSection?: (kind: CatalogSectionKind) => void;
    /** Which sections to render + their labels/hints, in display order. Defaults to the canonical
     *  `CATALOG_SECTION_SPECS`. A host that wants a subset (e.g. just `datasources` + `series`) passes
     *  its own filtered list. */
    sectionSpecs?: CatalogSectionSpec[];
    /** Extra className on the root. */
    className?: string;
}

/** A table → column tree with click-to-pick, using shadcn's file-tree pattern. Tolerates an empty
 *  schema (the parent shows the teaching-empty/deny; this renders nothing for `tables: []`). */
export declare function CatalogSchemaTree({ schema, onSelect }: CatalogSchemaTreeProps): JSX_2.Element;

export declare interface CatalogSchemaTreeProps {
    schema: Schema;
    /** Called when a table header (no `column`) or a column row is clicked. */
    onSelect: (entry: CatalogEntry) => void;
}

/** A collapsible section: a clickable header (chevron + title + hint) + the body. The header toggles
 *  open/close; the first open of an `idle` section fires `onOpen` so the host can lazy-load it. */
export declare function CatalogSection<T>({ spec, state, onOpen, defaultOpen, children }: CatalogSectionProps<T>): JSX_2.Element;

/** The schema of `CatalogSections.data` per section kind. The explorer kinds carry row arrays (or
 *  `Schema` for the local-tables section, which the tree renderer walks); the picker-only kinds
 *  (`extensions`/`rules`/`flowSummaries`/`flowDescriptors`) carry the row shapes `loadSourcePicker`
 *  composes from. */
export declare interface CatalogSectionData {
    datasources: DatasourceRow[];
    schema: Schema;
    series: string[];
    channels: ChannelRow[];
    insights: PickerInsightRow[];
    inbox: InboxRow[];
    queries: QuerySummary[];
    extensions: ExtRow[];
    rules: RuleSummary[];
    flowSummaries: FlowSummary[];
    flowDescriptors: NodeDescriptor[];
}

/** The catalog's section vocabulary. Each kind is 1:1 with a single `SourceLoaders` read. Adding a
 *  section = adding a kind here + a row type + a loader entry on `SourceLoaders`. The renderer is
 *  kind-agnostic (it renders a `CatalogSectionSpec`'s label/hint + the section's `SectionState`),
 *  so a new kind needs no renderer change.
 *
 *  NOTE: this is the FULL vocabulary the catalog CAN cover (so `loadSourcePicker` projects every
 *  loader it needs off the same per-section state). `CATALOG_SECTION_SPECS` below is the SUBSET the
 *  EXPLORER skin renders today — a host composes which sections its surface shows. `extensions`,
 *  `rules`, `flowSummaries`, `flowDescriptors` are picker-only projections today (no explorer
 *  section) but share the orchestration. */
export declare type CatalogSectionKind = "datasources" | "schema" | "series" | "channels" | "insights" | "inbox" | "queries" | "extensions" | "rules" | "flowSummaries" | "flowDescriptors";

export declare interface CatalogSectionProps<T> {
    spec: CatalogSectionSpec;
    state: SectionState<T>;
    /** Fired the first time the user expands a section whose state is still `idle` — the host's cue to
     *  trigger this section's loader. The collapsible handles its own open/close thereafter; this is
     *  the lazy-load trigger, not an open/close controller. Optional (a host that pre-seeds `ready`
     *  state never triggers it). */
    onOpen?: () => void;
    /** Force the section open on first mount (default: open iff `state` is past `idle`). Tests + hosts
     *  that pre-seed `ready` data pass `defaultOpen` so rows render without a click. */
    defaultOpen?: boolean;
    /** The ready-body renderer — receives the section's data and returns the row tree. The explorer
     *  composes this per kind (datasource rows / the schema table tree / channel rows / …). */
    children: (data: T) => ReactNode;
}

/** The catalog's per-section honest state. A section is `undefined` when the host supplied no
 *  loader for it (absent ⇒ absent section); `{status:"loading"}` while in flight; `{status:"ready"}`
 *  on success; `{status:"denied"}` on throw (capability wall — never a fake list). */
export declare type CatalogSections = {
    [K in CatalogSectionKind]?: SectionState<CatalogSectionData[K]>;
};

/** A section's declarative descriptor — its kind (loader-keyed), its human label, and a one-line
 *  hint. Exported as `CATALOG_SECTION_SPECS` (the canonical list); a host composes its surface by
 *  which loaders it wires (absent loader ⇒ absent section). */
export declare interface CatalogSectionSpec {
    kind: CatalogSectionKind;
    label: string;
    hint: string;
}

/** Channel rows → catalog entries. */
export declare function channelEntries(rows: ChannelRow[]): CatalogEntry[];

/** A registered channel row (the subset of `channel.list` the catalog needs — id only; the registry
 *  record carries more, the package keeps the seam minimal). */
export declare interface ChannelRow {
    id: string;
}

/** The glyph a caller gets when it wants the chart look with its own copy. Exported so a host can keep
 *  one icon vocabulary rather than importing lucide twice. */
export declare const CHART_STATE_ICON: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

export declare function ChartState({ tone, title, detail, action, className }: ChartStateProps): JSX_2.Element;

export declare interface ChartStateProps {
    tone: ChartStateTone;
    /** Override the tone's default headline. */
    title?: string;
    /** Override the tone's default second line. Pass `null` to show none. */
    detail?: string | null;
    /** An optional way OUT of the state — a link to the page that fixes it. Never a bare "retry": a
     *  denial does not become a grant by asking again, which is the whole point of `retry: false`. */
    action?: ReactNode;
    className?: string;
}

export declare type ChartStateTone = "loading" | "denied" | "error" | "empty" | "table-only";

/** The kit's DEFAULT registration list, stated so a consumer can read it rather than infer it:
 *
 *  ```ts
 *  echarts.use([
 *    BarChart, LineChart, PieChart, ScatterChart,     // series
 *    GridComponent, LegendComponent, TooltipComponent, DatasetComponent,
 *    MarkLineComponent, MarkAreaComponent, TitleComponent,
 *    CanvasRenderer,                                   // renderer
 *  ]);
 *  ```
 *
 *  CanvasRenderer, not SVG. The kit's test/a11y contract is the visually-hidden DOM `summary` a chart
 *  renders alongside its canvas — a real element in DOM order that a screen reader reads and a jsdom
 *  test asserts on. That contract holds for every chart regardless of renderer, whereas "render SVG so
 *  jsdom can see the marks" buys a test target for the marks only, at the cost of the renderer that
 *  scales past a few thousand of them. One answer, and it is also the accessibility answer.
 */
export declare const DASH_KIT_ECHARTS_PARTS: readonly ["BarChart", "LineChart", "PieChart", "ScatterChart", "GridComponent", "LegendComponent", "TooltipComponent", "DatasetComponent", "MarkLineComponent", "MarkAreaComponent", "TitleComponent", "CanvasRenderer"];

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

/** Provide the per-visit `QueryClient` + the current `ws` to the dashboard subtree. Keyed by the caller
 *  on `ws` (see `DashboardView`) so a workspace switch remounts with a fresh client and fresh keys. */
export declare function DashboardCacheProvider({ ws, children }: {
    ws: string;
    children: ReactNode;
}): JSX_2.Element;

export declare function DashboardRangePicker({ from, to, onApply, timezone, compact, dateStyle, weekStart: weekStartProp, onUserApply, }: DashboardRangePickerProps): JSX_2.Element;

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
    /** The viewer's resolved `first_day_of_week`. INJECTED for the same reason `dateStyle` is: resolving
     *  it needs the host's session store and two network calls. Absent ⇒ Monday, the grammar the lb
     *  conformance fixture pins — so an un-injected picker is never silently on a different calendar. */
    weekStart?: WeekStart;
    /** Fired just before `onApply` when the user commits a window. The shell passes `markUserRefresh`
     *  so its panels show the refreshing indicator while the re-query lands; that is dashboard-refresh
     *  telemetry, not picker logic, so it is injected rather than shipped. Absent ⇒ nothing extra. */
    onUserApply?: () => void;
}

/** The dashboard workspace context. `null` outside a `DashboardCacheProvider` — a caller that reads it
 *  without the provider is a wiring bug, so we throw rather than silently key everything under "". */
export declare const DashboardWsContext: Context<string | null>;

/** Datasource rows → catalog entries. The id is the name (stable round-trip key). */
export declare function datasourceEntries(rows: DatasourceRow[]): CatalogEntry[];

/** `datasource.list` — one entry per ws (the bundle and the Query-tab dropdown read the same key). */
export declare function datasourceListKey(ws: string): readonly ["datasource.list", string];

/** The query options for `datasource.list` in workspace `ws`. A list-class read (generous stale window):
 *  it rarely changes mid-visit, so a burst of consumers collapses to one fetch. */
export declare function datasourceListQueryOptions(ws: string, listDatasources: ListDatasources): {
    queryKey: readonly ["datasource.list", string];
    queryFn: () => Promise<DatasourceSummary[]>;
    staleTime: number;
};

/** A registered federation datasource (from `datasource.list`). */
export declare interface DatasourceRow {
    name: string;
    kind: string;
    /** Optional endpoint label (mirrors `datasource.list`'s `endpoint`). The catalog row renders it as
     *  a `kind · endpoint` sub-label; absent ⇒ just `kind`. */
    endpoint?: string;
}

/** A registered federation datasource, as the list read returns it. The kit's own shape: the shell's
 *  `DatasourceSummary` camel-cases the wire's `secret_ref`, and the ref — never a value, never a DSN —
 *  is the only credential-adjacent field that ever crosses this boundary. */
export declare interface DatasourceSummary {
    name: string;
    kind: string;
    endpoint: string;
    /** The secret store reference (e.g. `federation/timescale`) — the ref, never the value. */
    secretRef?: string;
}

/** Human placeholder for the field, e.g. `DD/MM/YYYY`, so an empty field reads correctly per style. */
export declare function datePlaceholder(style: DateStyle): string;

/** The viewer's resolved date-field style. Vendored as a 3-value union rather than imported from the
 *  shell's prefs types: it is the whole of what this module needs, and pulling `prefs.types` in would
 *  drag the shell's preference subsystem into a pure formatter. */
export declare type DateStyle = "eu" | "iso" | "usa";

/** The app's default window when a URL carries no (or a broken) range and the board stores none. */
export declare const DEFAULT_RANGE_EXPR = "last-30-days";

/** The default cache TTL (seconds) applied when a board has neither an auto-refresh cadence nor an
 *  explicit per-page setting. Caching is ON BY DEFAULT so a fresh board opens fast without any author
 *  action (dashboard-query-acceleration §C, default-on decision). A board opts OUT to live by setting
 *  its per-page freshness to exactly `0`. Staleness is bounded by this window (≤120 s). */
export declare const DEFAULT_TTL_S = 120;

/** A client whose reads reject — models a workspace granted no `insight.list` cap. The hooks must
 *  surface this as an honest error, never a fabricated list. */
export declare function denyClient(): InsightsClient;

export declare function EChart({ option, ariaLabel, summary, className, onReady, bare }: EChartProps): JSX_2.Element;

export declare interface EChartProps {
    /** Build the echarts option from the RESOLVED theme. A function (not a plain option) so the chart
     *  re-derives its colours when the host flips light/dark. */
    option: (theme: EchartsTheme) => object;
    ariaLabel: string;
    /** A visually-hidden, DOM-order summary of what the canvas draws — the a11y text AND the render
     *  target unit tests assert. See the header. */
    summary?: ReactNode;
    className?: string;
    /** Called once the instance is live, for the events an OPTION cannot express (the hovered data index
     *  being the one that matters). Return a disposer and it runs before teardown.
     *
     *  NEVER fires under jsdom: `init` throws there, so a consumer must treat "not called" as normal. */
    onReady?: (chart: EChartsLike) => (() => void) | void;
    /** Render WITHOUT the `role="img"` wrapper, for a caller that already provides one. Two nested
     *  `role="img"` elements make `[role="img"]` ambiguous for assistive tech and for every test. */
    bare?: boolean;
}

/** The slice of the echarts instance this wrapper touches. Kept structural rather than importing
 *  echarts' type, because the module is dynamic-imported and must not become a static dependency. */
export declare interface EChartsLike {
    setOption: (o: unknown, notMerge: boolean) => void;
    resize: () => void;
    dispose: () => void;
    on: (event: string, handler: (payload: never) => void) => void;
    off: (event: string) => void;
}

export declare type EchartsLoader = () => Promise<EchartsNamespace>;

/** The slice of the echarts namespace the kit touches. Structural rather than imported, because the
 *  module is dynamic-imported and must not become a static dependency of this file. */
export declare interface EchartsNamespace {
    init: (host: HTMLElement) => unknown;
}

/** The resolved chart chrome for the current theme. Read once per render of a chart (cheap) and again
 *  whenever the theme flips — `EChart` re-reads on the documentElement class mutation. */
export declare interface EchartsTheme {
    palette: string[];
    accent: string;
    text: string;
    muted: string;
    border: string;
    surface: string;
    /** The sequential ramp a heatmap / value-colored chart interpolates across (cool → hot). */
    ramp: string[];
    /** The SINGLE-HUE sequential ramps, keyed by hue name. See {@link SequentialRamp}.
     *
     *  OPTIONAL on purpose: `echartsTheme()` always fills it, but a hand-built theme (every
     *  `plotOption/*.test.ts` fixture) predates this field, and consumers already fall back to
     *  `ramp`. Making it required would force a mechanical edit through a dozen fixtures to buy
     *  nothing — the fallback is the real contract. */
    ramps?: Record<SequentialRamp, string[]>;
}

export declare function echartsTheme(): EchartsTheme;

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

/** Installed-extension TOOL entries — split an extension's `ui`/`widgets[]` scope tools into READ
 *  sources and WRITE actions by name heuristic. (A tile's finished-widget entry is `extWidgetEntries`.) */
export declare function extensionEntries(rows: ExtRow[]): SourceEntry[];

/** Every distinct variable name referenced in `template` (in first-seen order), built-ins included. */
export declare function extractVarNames(template: string): string[];

/** Walk a JSON value tree and collect every variable name referenced in any string leaf. The deep
 *  counterpart of `extractVarNames` over a cell's `source.args` / a JSON payload template. */
export declare function extractVarNamesDeep(node: unknown): string[];

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

/** Packaged-tile entries — ONE per `row.widgets[]` `[[widget]]`. Selecting it yields a
 *  `view: ext:<id>/<widget>` (the tile owns its data via `scope ∩ grant`). A disabled ext contributes
 *  none. The `viewKey` uses the SAME `widgetIdOf` slug the renderer parses. */
export declare function extWidgetEntries(rows: ExtRow[]): SourceEntry[];

/** One manifest-declared widget option def (mirrors the node's `ExtUiOption`) — the shape the host
 *  editor renders. Opaque relay data; the picker package never interprets `control`/`scope`. */
declare interface ExtWidgetOption {
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

/** Fetch (or read warm) the datasource list through the shared cache — used by a source-picker adapter's
 *  `listDatasources` loader so the bundle and the dropdown share the one call. */
export declare function fetchDatasourceList(client: QueryClient, ws: string, listDatasources: ListDatasources): Promise<DatasourceSummary[]>;

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

/** `flows.node_state` — one entry per (ws, flow, tick). N cells on one flow share it; each slices its own
 *  node/port/path CLIENT-SIDE from the shared whole-flow read (scope goal 4). */
export declare function flowNodeStateKey(ws: string, flowId: string, tick: number): readonly ["flows.node_state", string, string, number];

/** Flows entries — one per (flow, node, INPUT/OUTPUT port). An INPUT port → a write Action
 *  (`flows.inject`, a control drives the node's retained input); an OUTPUT port → a read Source
 *  (`flows.node_state`, extract this node's port). A node whose descriptor is missing contributes no
 *  ports (honest empty, never a guess). The author sees `flow › node › port (input|output)`. */
export declare function flowsEntries(flows: Flow[], descriptors: NodeDescriptor[]): SourceEntry[];

/** A flow's summary (from `flows.list`). */
export declare interface FlowSummary {
    id: string;
    name: string;
}

/** ISO `YYYY-MM-DD` → the pref-styled display string. Empty/invalid input returns "" so the caller
 *  can show the placeholder rather than a garbled partial date. */
export declare function formatDateField(iso: string, style: DateStyle): string;

export declare const FreezeProvider: Provider<boolean>;

/** Inputs to the effective-TTL decision. */
export declare interface FreshnessInputs {
    /** The board's auto-refresh cadence in milliseconds (`useAutoRefresh.refreshMs`); `0`/absent ⇒ off. */
    refreshMs?: number;
    /** The per-page `cacheTtlS` in seconds (the dashboard record field). A POSITIVE value sets the
     *  window; an explicit `0` means LIVE (opt out of the default); `undefined` (unset) ⇒ the default. */
    cacheTtlS?: number;
}

export declare const FreshnessProvider: Provider<number>;

/** Inbox rows → catalog entries. */
export declare function inboxEntries(rows: InboxRow[]): CatalogEntry[];

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

/** The ack/resolve/dismiss button row. Renders only the actions the current status allows. */
export declare function InsightActions({ insight, actingOn, onAck, onResolve, onDismiss, }: InsightActionsProps): JSX_2.Element;

export declare interface InsightActionsProps {
    insight: Insight;
    /** The in-flight action (drives the spinner + disable), or null. */
    actingOn?: "ack" | "resolve" | null;
    onAck?: () => void;
    onResolve?: () => void;
    /** Optional local dismiss (hide the row) — distinct from `resolve` (a durable status change). */
    onDismiss?: () => void;
}

export declare interface InsightDetailState {
    insight: Insight | null;
    occurrences: OccurrencePage | null;
    error: string | null;
    loading: boolean;
    /** Ack/resolve-in-flight action, or null when idle. */
    actingOn: "ack" | "resolve" | null;
    refresh: () => void;
    act: (action: "ack" | "resolve") => Promise<void>;
}

/** Insight rows → catalog entries. */
export declare function insightEntries(rows: PickerInsightRow[]): CatalogEntry[];

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

/** Render one insight row. */
export declare function InsightRow({ insight, selected, onSelect, showStatus, showSeverity, actions, now, }: InsightRowProps): JSX_2.Element;

export declare interface InsightRowProps {
    insight: Insight;
    selected?: boolean;
    /** Click handler — present → the row is a button; absent → a static row (read-only). */
    onSelect?: (id: string) => void;
    /** Which badges to show on the side column. Status shows by default; severity is already carried by
     *  the leading dot, so its redundant chip is off by default (opt in for a legend-style row). */
    showStatus?: boolean;
    showSeverity?: boolean;
    /** Optional inline actions node (rendered below the row body) — the acknowledge widget's buttons. */
    actions?: ReactNode;
    /** `now` for the time-ago (test determinism). */
    now?: number;
}

/** Acknowledge preset — each row carries ack / resolve / dismiss. */
export declare function InsightsAckWidget(props: Omit<InsightsWidgetProps, "interactive">): JSX_2.Element;

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

/** Read-only preset — a glanceable list, no actions. */
export declare function InsightsReadWidget(props: Omit<InsightsWidgetProps, "interactive">): JSX_2.Element;

export declare interface InsightsState {
    items: Insight[];
    error: string | null;
    loading: boolean;
    /** Ack/resolve-in-flight item id, or null when idle (per-row disable + spin, the inbox pattern). */
    actingOn: string | null;
    /** The keyset cursor for the next page, or null when the current list is the last page. */
    nextCursor: PageCursor | null;
    refresh: () => Promise<void>;
    loadMore: () => Promise<void>;
    setFilter: (filter: ListQuery) => void;
    act: (id: string, action: "ack" | "resolve") => Promise<void>;
}

/** The insights widget. Read-only or acknowledge, one component. */
export declare function InsightsWidget({ client, filter, title, interactive, showRefresh, paged, onSelect, now, }: InsightsWidgetProps): JSX_2.Element;

export declare interface InsightsWidgetProps {
    /** The injected transport seam (how to reach the node's `insight.*` verbs). */
    client: InsightsClient;
    /** The starting filter (status / severity / tags / range / limit). Defaults to `{ limit: 20 }`. */
    filter?: ListQuery;
    /** Panel title. Defaults to "Insights". */
    title?: string;
    /** When true, each row carries ack / resolve / dismiss actions; when false (default), read-only. */
    interactive?: boolean;
    /** Show the header refresh button. Default: true. */
    showRefresh?: boolean;
    /** Show the "Load more" footer when a next page exists. Default: true. */
    paged?: boolean;
    /** Click a row (e.g. to open a host detail surface). Rows are static when omitted. */
    onSelect?: (id: string) => void;
    /** `now` for the time-ago (test determinism). */
    now?: number;
}

/** True if a name is a built-in global (`__from`, `__user.login`, …) rather than a user variable. */
export declare function isBuiltinName(name: string): boolean;

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

/** A dense key/value row — the ce InspectPanel `KV` look on shadcn tokens. */
export declare function KV({ k, v, keyWidth, className }: KVProps): JSX_2.Element;

export declare interface KVProps {
    k: ReactNode;
    v: ReactNode;
    /** Key-column width in px (ce uses 80). */
    keyWidth?: number;
    className?: string;
}

/** The label of a committed range: a window token names itself; an endpoint pair reads as the literal
 *  expressions ("2026-07-27 → 2026-08-03", "now-4h → now"). An unparseable value prints verbatim —
 *  labelling never throws and never lies about what the URL says. */
export declare function labelOf(from: string, to?: string): string;

/** The shared legend chrome. */
export declare function legendChrome(theme: EchartsTheme): {
    textStyle: {
        color: string;
        fontSize: number;
    };
    inactiveColor: string;
    icon: "roundRect";
    itemWidth: number;
    itemHeight: number;
};

/** The generous stale window for list-class reads (source picker bundle, datasource list, flow roster) —
 *  they rarely change mid-visit, so a burst of consumers collapses to one fetch and re-reads only after
 *  this window (or an explicit invalidate on workspace switch / editor open where a fresh list matters). */
export declare const LIST_STALE_MS = 30000;

/** How the host fetches the list. `KitClient.loaders.listDatasources` satisfies this. */
export declare type ListDatasources = () => Promise<DatasourceSummary[]>;

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

/** Live (Zenoh) entries — each series also offers a live `series.watch` stream. */
export declare function liveEntries(seriesNames: string[]): SourceEntry[];

/** Run every loader the host wired (deny-tolerant per section). Each present loader resolves to
 *  `ready`/`denied` independently; absent loaders yield an absent (undefined) section. The
 *  orchestration is the single source of truth — the picker's deny→empty collapse and the
 *  explorer's visible tri-state both project off the record this returns.
 *
 *  `publish` (optional) is invoked once per section as it resolves, with the cumulative
 *  `CatalogSections` record — so a caller (the `useCatalog` hook) can surface each section's state
 *  the moment it lands instead of waiting for every loader. Late calls after the caller is
 *  unmounted/cancelled are the caller's concern (it passes a `publish` that no-ops on cancel). */
export declare function loadCatalog(loaders: SourceLoaders, publish?: (merge: (current: CatalogSections) => CatalogSections) => void): Promise<CatalogSections>;

/** Load (and register) the engine. Every kit chart goes through here. */
export declare function loadEcharts(): Promise<EchartsNamespace>;

/** Run every loader (deny-tolerant; absent loader ⇒ absent input) and fold the results into picker
 *  entries. The Flows group composes `flows.list` + `flows.nodes` + a per-flow `flows.get` — the
 *  catalog exposes the first two as `flowSummaries`/`flowDescriptors`; `getFlow` is per-flow so it
 *  stays picker-side (the catalog is a per-loader record, not a per-item join). */
export declare function loadSourcePicker(loaders: SourceLoaders): Promise<SourcePickerResult>;

/** Mint the per-visit dashboard client. Called once by the provider (via `useState` initialiser) so the
 *  client is stable across the visit and a fresh one is created on the next mount. */
export declare function makeDashboardQueryClient(): QueryClient;

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

/** Build a viz.query batch loader over `call`. Loads are coalesced per `windowMs`, chunked to
 *  `MAX_PANELS`, and fall back to per-cell `viz.query` when the batch verb is absent. */
export declare function makeVizBatchLoader(call: BatchCall, opts?: VizBatchLoaderOptions): VizBatchLoader;

/** The lb per-batch panel cap (`viz/batch.rs::MAX_PANELS`). Over-cap the server answers `BadInput`, so
 *  we chunk to it rather than send an over-cap batch. */
export declare const MAX_PANELS = 64;

/** Build a real in-memory client over a seeded set of insights (newest-first by `last_ts`). */
export declare function memoryClient(seed: Insight[]): InsightsClient;

/** The separator for `${__nav.path}`, matching the breadcrumb. Other separators are composed by hand
 *  from `${__nav.parent.label}` and friends. */
export declare const NAV_PATH_SEP = " / ";

/** Flatten a nav chain + page record into the `__nav.*` / `__page.*` built-in keys.
 *
 *  A depth-1 path yields `__nav.label` and `__nav.path` only — the parent keys are OMITTED, so
 *  `${__nav.parent.label}` stays literal rather than rendering an empty gap in the middle of a heading.
 *  An empty/absent chain yields no `__nav.*` key at all. */
export declare function navBuiltins(nav?: NavContext, page?: PageContext): Builtins;

/** The nav chain the current URL ADDRESSES — derived by the shell from its resolved nav model, never
 *  from click state (so refresh, bookmark, deep link and shared link all resolve identically). */
export declare interface NavContext {
    /** Labels root-first, ending with the item's OWN label. Empty ⇒ no nav context. */
    path: string[];
    /** The item's stable key/slug — survives a relabel or a translation. */
    id?: string;
    /** The item's pinned heading override (Slice 4 — needs the upstream `NavItem.title_template`). */
    titleTemplate?: string;
    /** Did this chain come from a row targeting a DASHBOARD (not a surface)? A board URL lights BOTH the
     *  ext child that names it and the stock "Dashboards" surface row, and the shell prefers the former
     *  when choosing which chain to publish (`nav-context.ts`). Carried on the chain only to make that
     *  choice; it renders nothing and produces no `__nav.*` key. */
    dashboardTargeted?: boolean;
}

/** Internal: items bucketed by `group`, preserving first-seen group order. */
export declare interface NavGroup {
    /** undefined = the default, unlabeled group. */
    label?: string;
    items: NavItem[];
}

/** One entry in the rail. `icon` is a component (e.g. a lucide-react icon). */
export declare interface NavItem {
    /** Stable id echoed back through `onSelect`; also the active-match key. */
    id: string;
    label: string;
    /** Rendered at 16px; shown alone (with a tooltip) when the rail is collapsed. */
    icon?: React_2.ComponentType;
    /** Optional group heading. Items sharing a `group` render under one label, in array
     *  order; ungrouped items render in the default (unlabeled) group. */
    group?: string;
}

/**
 * An embedded vertical nav, self-themed like NavRail (`hsl(var(--nr-*))` under `.nav-rail`).
 * Ship the stylesheet with `import '@nube/nav-rail/style.css'`.
 */
export declare function NavMenu({ items, active, onSelect, badge, className, "aria-label": ariaLabel, }: NavMenuProps): JSX_2.Element;

export declare interface NavMenuProps {
    items: NavItem[];
    active: string | null;
    onSelect: (id: string) => void;
    /** Optional trailing badge per item (e.g. a count on "Overrides"). */
    badge?: (id: string) => number | undefined;
    /** Extra classes on the `.nav-rail` root — a host theming hook. */
    className?: string;
    /** aria-label for the nav landmark. */
    "aria-label"?: string;
}

/**
 * A self-contained, self-themed sidebar. Wrap once at the app's left edge:
 *
 *   <NavRail items={items} active={sel} onSelect={setSel} header={<Brand/>} />
 *
 * Colors come from `hsl(var(--nr-*))` scoped to `.nav-rail`; override at `:root`, via
 * `className`, or inline `style` to re-skin without forking. Ship the stylesheet with
 * `import '@nube/nav-rail/style.css'`.
 */
export declare function NavRail({ items, active, onSelect, header, footer, defaultCollapsed, className, }: NavRailProps): React_2.JSX.Element;

export declare interface NavRailProps {
    /** The entries to show, in order. Group with `group`; gate by caps before passing in. */
    items: NavItem[];
    /** The selected item id (or null for none). Marked `aria-current="page"`. */
    active: string | null;
    /** Called with the clicked item's id. Routing/content is the host's job. */
    onSelect: (id: string) => void;
    /** Brand/logo area at the top; collapses with the rail. */
    header?: React_2.ReactNode;
    /** Footer area (e.g. a theme switcher or sign-out). */
    footer?: React_2.ReactNode;
    /** Start collapsed to icons. Default: expanded. */
    defaultCollapsed?: boolean;
    /** Extra classes on the `.nav-rail` root — a host theming hook. */
    className?: string;
}

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

/** The producer/run meta line under a title ("rule:cpu-hot · run:abc"). Pure — the UI + a host reuse it. */
export declare function originLine(origin: {
    kind: string;
    ref: string;
    run?: string;
}): string;

/** The page-record inputs behind `${__page.*}`. */
export declare interface PageContext {
    /** The dashboard id — `${__page.id}`, an alias of the shipped `${__dashboard}`. */
    id?: string;
    /** The record's un-overridden `title` — `${__page.title}`. */
    title?: string;
    /** The `managedBy` extension id. `undefined` on a hand-authored board, which still yields an EMPTY
     *  `${__page.ext}` (see the header) as long as a page context exists at all. */
    ext?: string;
}

/** Keyset cursor — opaque to the caller; the verb parses it. */
export declare interface PageCursor {
    ts: number;
    id: string;
}

/** The reusable resizable side panel — ce InspectPanel look on shadcn primitives. */
export declare function Panel({ open, onOpenChange, title, description, headerAside, footer, "aria-label": ariaLabel, initialWidth, minWidth, maxWidth, className, children, }: PanelProps): JSX_2.Element;

export declare interface PanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** The panel heading. */
    title: ReactNode;
    /** Sub-heading under the title (optional). */
    description?: ReactNode;
    /** Trailing controls on the header row (e.g. a status chip). */
    headerAside?: ReactNode;
    /** The action row pinned to the bottom (e.g. Cancel / Save). Omit for a footer-less panel. */
    footer?: ReactNode;
    /** aria-label on the dialog content. */
    "aria-label"?: string;
    /** Initial width in px. Default 720 — roomy, unlike the old cramped `sm:max-w-3xl`. */
    initialWidth?: number;
    /** Min width in px (default 360). */
    minWidth?: number;
    /** Max width in px (default 1200 — wide enough to reveal every option column). */
    maxWidth?: number;
    /** Extra classes on the docked surface. */
    className?: string;
    /** The scrollable body — the host stacks <Section>/<PropTable>/<KV> here. */
    children: ReactNode;
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

/** Wire persistence onto a dashboard `QueryClient` for one workspace visit.
 *
 *  Restore is ASYNCHRONOUS and deliberately NON-BLOCKING: the dashboard renders immediately and the
 *  restored entries land a few milliseconds later — long before the user can open the Quick dialog,
 *  and a race merely costs the old behaviour (a live probe), never a wrong answer. Gating the whole
 *  dashboard subtree on an IndexedDB read to save a dialog that is not yet open would be the worse
 *  trade.
 *
 *  Returns the unsubscribe — call it on unmount so a dropped client stops writing. */
export declare function persistQuickCache(client: QueryClient, ws: string): () => void;

/** One `<optgroup>` for a source group, empty-tolerant (no section when it has no entries). Exported so a
 *  host that renders its own `<select>` (shadcn `Select`, a `FIELD`-classed native select) still uses the
 *  ONE grouping/labelling implementation — the `<optgroup>` carries no styling, so it drops into any select. */
export declare function PickerGroup({ entries, group, label, }: {
    entries: SourceEntry[];
    group: SourceEntry["group"];
    label: string;
}): JSX_2.Element | null;

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

export declare interface PropColumn {
    /** Column key — also the header text unless `header` is given. */
    key: string;
    header?: ReactNode;
    /** Truncate + ellipsize the cell (with a title tooltip). For long value cells. */
    ellipsize?: boolean;
    /** Fixed max width in px for the cell (pairs with ellipsize). */
    maxWidth?: number;
    className?: string;
}

export declare interface PropRow {
    /** Stable row key. */
    id: string;
    /** Cell content per column key. */
    cells: Record<string, ReactNode>;
    /** Optional per-row emphasis (e.g. a fault/override row). */
    tone?: "default" | "warn";
}

/** A dense, monospace property table — the ce InspectPanel look on shadcn tokens. */
export declare function PropTable({ columns, rows, empty, className }: PropTableProps): JSX_2.Element;

export declare interface PropTableProps {
    columns: PropColumn[];
    rows: PropRow[];
    /** Shown when rows is empty. */
    empty?: ReactNode;
    className?: string;
}

/** Saved-query rows → catalog entries. The id is the query's slug (stable round-trip key); `target`
 *  rides along so the explorer's renderer can sub-label a platform query vs a federated one. */
export declare function queryCatalogEntries(rows: QuerySummary[]): CatalogEntry[];

/** Saved-query entries — one per `query.list` row. Each ⇒ a read `query.run {id}` source: the host
 *  compiles the saved PRQL/raw text for the target's dialect and dispatches to `store.query`
 *  (platform) or `federation.query` (datasource), returning the SAME `{columns, rows}` shape every
 *  other tabular source yields. `query.run` COMPOSES the target's cap, it never widens it (rule 5):
 *  the caller needs `mcp:query.run:call` AND the underlying target cap, re-checked per call. Whether
 *  the saved text is currently valid is the author's concern — an honest failure if not. */
export declare function queryEntries(queries: QuerySummary[]): SourceEntry[];

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

/** How long a persisted entry may be restored before it is discarded outright. This is the OUTER
 *  bound, not the freshness contract: `staleTime` governs revalidation, and everything restored is
 *  refetched in the background anyway. A week keeps "open the same board next Monday" instant. */
export declare const QUICK_PERSIST_MAX_AGE_MS: number;

/** The CACHE BUSTER. Bump on ANY change to the shape a `quick-*` query resolves to — `ColumnStats`,
 *  `RelatedField`, the probe record, the table-shape map. react-query rehydrates blindly, so a shape
 *  change without a bump would feed yesterday's structure to today's `detectMetricShape` and produce
 *  a confidently wrong (or crashing) detection. A mismatched buster discards the whole store. */
export declare const QUICK_PERSIST_VERSION = "v1";

/** An IndexedDB `Persister` over `idb-keyval`. Deliberately hand-rolled rather than pulling in the
 *  async-storage-persister package: the whole contract is three methods, and IndexedDB (not
 *  localStorage) is the right store for a probe payload that can carry hundreds of distinct values. */
export declare function quickPersister(ws: string): Persister;

export declare const RANGE_BANDS: RangeBand[];

/** The unit columns, left to right. One heading per column, shared by both bands. */
export declare const RANGE_COLUMNS: readonly ["Minutes", "Hours", "Days", "Months", "Years"];

/** Every preset, flat — the roster callers outside the picker (and the tests) read. Grid order:
 *  band by band, column by column, so the reading order matches what the popover paints. */
export declare const RANGE_PRESETS: RangePreset[];

/** A band = one row of the grid: trailing (a counted duration back from now) or calendar
 *  (aligned to calendar boundaries — the whole period for last/next, period start → now for this). */
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

/** The read/source groups, in display order, with their section labels. `action` is omitted (write
 *  controls are a separate authoring intent); a host that wants them passes its own list (see
 *  `BUILDER_SOURCE_GROUPS`). Exported so every consumer renders ONE canonical label set. */
export declare const READ_SOURCE_GROUPS: SourceGroup[];

export declare interface Resizable {
    /** Current width in px. */
    width: number;
    /** Whether a drag is in progress (host can dim/limit repaint). */
    dragging: boolean;
    /** Spread onto the drag handle element. */
    handleProps: {
        onPointerDown: (e: React.PointerEvent) => void;
        onPointerMove: (e: React.PointerEvent) => void;
        onPointerUp: (e: React.PointerEvent) => void;
        onKeyDown: (e: React.KeyboardEvent) => void;
    };
}

/** The Panel's left-edge drag-to-resize grabber. */
export declare function ResizeHandle({ resizable, className, "aria-label": ariaLabel }: ResizeHandleProps): JSX_2.Element;

export declare interface ResizeHandleProps {
    resizable: Resizable;
    className?: string;
    "aria-label"?: string;
}

/** A resolved window: epoch ms, `toMs` exclusive. What `$__from`/`$__to` carry. */
export declare interface ResolvedRange {
    fromMs: number;
    toMs: number;
}

/** Resolve the single effective cache TTL in SECONDS. Returns `0` only when the board explicitly opts
 *  out to live (per-page `cacheTtlS === 0`); an unset board gets {@link DEFAULT_TTL_S}. A negative/NaN
 *  per-page value is treated as unset (defensive — a corrupt record falls back to the default). */
export declare function resolveFreshnessTtl({ refreshMs, cacheTtlS, }: FreshnessInputs): number;

/** Resolve a `from`/`to` pair against a clock + timezone. `null` = malformed (a bad token, a window
 *  token alongside a `to`, or an inverted pair) — the caller degrades to its default window.
 *
 *  `weekStart` re-anchors the week windows (`this-week`, `last-week`, `now/w`, …) at the
 *  `first_day_of_week` pref's start; absent (or `"monday"`) keeps the pinned Monday grammar the
 *  conformance fixture asserts. */
export declare function resolveRange(from: string | undefined, to: string | undefined, nowMs: number, tz: string, weekStart?: WeekStart): ResolvedRange | null;

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

/** Rules entries — one per saved rule. Each ⇒ a read `rules.run {rule_id}` source: the rule fetches
 *  from the gated sources, computes over the rows in the cage (the data-stdlib: time/stats/`Frame`),
 *  and RETURNS records the panel draws (rules-as-source-scope). A rule is the most general query — the
 *  picker offers it as one opaque tool source, re-gated at the host per call (`mcp:rules.run:call`);
 *  whether its output is chart-shaped is the rule author's concern, an honest failure if not.
 *
 *  `route:false` on the emitted source makes a panel run READ-ONLY (rules-for-widgets-scope slice 2):
 *  the host skips the `alert()` fan-out so a 30 s auto-refresh doesn't stamp a fresh Inbox item + a
 *  must-deliver Outbox entry on every repaint. The host composes the arg exactly like the params form;
 *  `viz.query` never learns the flag exists (it stays an opaque `{tool, args}` to the viz plane). */
export declare function rulesEntries(rules: RuleSummary[]): SourceEntry[];

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

/** Schema → (table, column) entries — the columns of every table, flattened. The explorer's tree
 *  groups these under their table; the package exposes them flat so a host that wants a flat
 *  column picker can also consume them. */
export declare function schemaColumnEntries(schema: Schema): CatalogEntry[];

/** One local-store table + its columns (the `store.schema` row shape). */
export declare interface SchemaTable {
    name: string;
    columns: SchemaColumn[];
}

/** Schema → table entries (one per table). Columns are addressed by the `column` kind via
 *  `schemaColumnEntries` (the explorer's table→column tree opens a table, then lists its columns). */
export declare function schemaTableEntries(schema: Schema): CatalogEntry[];

/** Narrow `scope` for `spec`'s cache key: `values` pass through, `builtins` keeps only the names `spec`
 *  actually references (and is omitted entirely when it references none). A non-object scope (or one
 *  without `builtins`) is returned unchanged — callers outside the `VarScope` contract are not rewritten. */
export declare function scopeKey(spec: unknown, scope: unknown): unknown;

/** The key-facing projection of a scope: the values verbatim, plus ONLY the referenced built-ins.
 *  `builtins` is ABSENT (not empty) when the spec references none, so a board of plain-SQL panels keys
 *  exactly as it did before any built-in existed. */
export declare interface ScopeKeyPart {
    values: unknown;
    builtins?: Builtins;
}

/** A titled, dense group — the ce InspectPanel `Section` look on shadcn tokens. */
export declare function Section({ title, aside, className, children }: SectionProps): JSX_2.Element;

export declare interface SectionProps {
    /** The uppercase group label (e.g. "Properties (12)"). */
    title: ReactNode;
    /** Optional trailing controls on the header row (a button, a count, a toggle). */
    aside?: ReactNode;
    className?: string;
    children: ReactNode;
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

/** Fold a chosen entry into a `SourceSelection` (drop the labelling fields; keep what the host stores). */
export declare function selectionOf(entry: SourceEntry): {
    id: string;
    source?: Source;
    action?: Action;
    viewKey?: string;
};

/** The sequential ramps a value-tinted chart can interpolate across.
 *
 *  `spectral` is the six-token cyan→rose rainbow, and it is the right default for a measure whose
 *  high end genuinely IS the alarming end (energy intensity, water). It is the WRONG one for a
 *  measure that never leaves a safe band: an office at 394–443 ppm CO2 painted across a rainbow
 *  reads as a severity scale and invents urgency the data does not carry. The single-hue ramps say
 *  "more of the same thing" rather than "worse".
 *
 *  Each is ONE existing token stepped by opacity — never a second palette, so they track the theme
 *  and the accent hue automatically. */
export declare type SequentialRamp = "spectral" | "accent" | "blue" | "green" | "amber";

/** Series names → catalog entries (one per series). */
export declare function seriesCatalogEntries(names: string[]): CatalogEntry[];

/** Series entries — each ⇒ `series.read` of that series. */
export declare function seriesEntries(seriesNames: string[]): SourceEntry[];

/** `series.read` backfill — one entry per (ws, series). N cells on one series share one read (scope goal 4).
 *  The live SSE tail stays OUTSIDE the cache (state vs motion) — this keys only the history backfill. */
export declare function seriesReadKey(ws: string, series: string): readonly ["series.read", string, string];

/** Point the kit's charts at a DIFFERENT registration module — a host whose chart vocabulary is wider
 *  than {@link DASH_KIT_ECHARTS_PARTS}. Pass a thunk that dynamic-imports; the engine stays lazy.
 *
 *  Call it once, at boot, before any chart mounts. Registering is additive and idempotent in echarts,
 *  so a host module that registers the kit's parts plus its own is the normal shape. */
export declare function setEchartsLoader(next: EchartsLoader): void;

export declare type Severity = "info" | "warning" | "critical";

/** Severity floor ordering (info < warning < critical) — a `severity` filter is a FLOOR: selecting
 *  `warning` means warning-and-above. The index is the numeric rank for comparisons. */
export declare const SEVERITY_ORDER: Severity[];

/** A severity chip ("CRITICAL" etc.), tinted by the tone key. */
export declare function SeverityBadge({ severity }: {
    severity: Severity;
}): JSX_2.Element;

/** Severity → the semantic color token a host paints with (the FindingsList lesson: tokens, both
 *  themes, never hex). The look-free {@link severityTone} stays the primitive — this is the ONE
 *  mapping of those tones onto the shell's CSS custom properties, promoted here (map-widget-scope
 *  decision 2) once a third view wanted it: `insight-trend`'s overlay, `fdd-matrix`'s cells, and
 *  `geomap`'s pin badges must not fork the severity palette. */
export declare function severityColor(s: Severity): string;

/** Numeric rank of a severity (info=0 … critical=2). */
export declare function severityRank(s: Severity): number;

/** Severity → tone key. */
export declare function severityTone(s: Severity): Tone;

export declare function ShareBar({ segments, label, height, className }: ShareBarProps): JSX_2.Element;

export declare interface ShareBarProps {
    segments: ShareSegment[];
    /** Describe the bar to assistive tech. Omitted ⇒ the bar is `aria-hidden` — the right default when
     *  the figures are already text beside it (see the header). */
    label?: string;
    /** Bar thickness. The default is the roster-row strip; a headline band passes something taller. */
    height?: number | string;
    className?: string;
}

export declare function ShareLegend({ rows, label, className, }: {
    rows: ShareLegendRow[];
    /** Names the list for assistive tech — this IS the accessible rendering of the bar's data. */
    label: string;
    className?: string;
}): JSX_2.Element;

export declare interface ShareLegendRow {
    key: string;
    label: string;
    color: string;
    /** The primary figure, already formatted by the caller — the kit does not decide a locale or a unit. */
    value: string;
    /** The secondary figure (usually the share). Omitted ⇒ one number. */
    secondary?: string;
    /** Extra context shown on hover — what this state actually means. */
    title?: string;
    hatch?: boolean;
    /** Rendered at the end of the row (a link into the rows behind the figure). */
    action?: ReactNode;
}

export declare interface ShareSegment {
    key: string;
    value: number;
    /** A resolved colour (a host token read through `tokenColor`, or any CSS colour). */
    color: string;
    /** Hover text — usually the value and what it means, since the bar itself carries no number. */
    title?: string;
    /** Overlay a diagonal hatch so this segment stays separable from its neighbour without colour. */
    hatch?: boolean;
}

/** The phone-width label (mobile-friendly-ui §4.2): a token label is already short; an ISO-day pair
 *  compresses to a year-less `Jul 27 – Aug 3` (the full pair is ~200px and clips at 390px). Parsed at
 *  UTC so the printed day never drifts across the viewer's zone — presentation only. */
export declare function shortLabelOf(from: string, to?: string): string;

/** A read source — ANY granted MCP tool call (re-checked at the host per call). */
export declare interface Source {
    tool: string;
    args?: Record<string, unknown>;
}

export declare function SourceCombobox({ entries, value, onSelect, onSelectEntry, loading, groups, "aria-label": ariaLabel, className, placeholder, autoFocus, }: SourceComboboxProps): JSX_2.Element;

export declare interface SourceComboboxProps {
    /** The assembled entries (from `useSourcePicker`). */
    entries: SourceEntry[];
    /** The currently-selected entry id (controlled) — "" for none. */
    value?: string;
    /** Called with the chosen entry's selection (or null when cleared). */
    onSelect: (selection: SourceSelection | null) => void;
    /** Also called with the RAW entry (or null) — for a host that keys on `entry.id` (e.g. edit-mode
     *  seeding, or a tool shared across entries like `rules.run`) where the folded selection loses the id.
     *  Optional; `onSelect` fires regardless. */
    onSelectEntry?: (entry: SourceEntry | null) => void;
    /** True while the entries load. */
    loading?: boolean;
    /** Which groups show + their order/labels (default: the read groups). */
    groups?: SourceGroup[];
    /** Accessible label (default "source"). */
    "aria-label"?: string;
    /** Extra className on the root. */
    className?: string;
    /** Placeholder for the search input. */
    placeholder?: string;
    /** Autofocus the search box on mount (Data Studio focuses it so type-to-search is the first action). */
    autoFocus?: boolean;
}

/** A friendly source entry the picker offers. `group` places it; `source`/`action`/`viewKey` is what
 *  selecting it yields (folded into a `SourceSelection` by the caller). */
export declare interface SourceEntry {
    /** Stable id for the option element + round-trip seeding. */
    id: string;
    /** The grouping origin (the picker's sections). `widget` is a packaged `[[widget]]` tile (a finished
     *  widget the developer shipped — distinct from `extension`, which offers an extension's raw tools). */
    group: "series" | "live" | "extension" | "action" | "sql" | "widget" | "flows" | "rules" | "queries";
    /** What the author sees — never a raw tool name. */
    label: string;
    /** For a `widget` entry: the icon name the tile declared (lucide id). */
    icon?: string;
    /** For a `widget` entry: the `ext:<id>/<widget>` view key the tile resolves to. */
    viewKey?: string;
    /** For a `widget` entry: `true` if the tile is a frames-in DATA view (its manifest set `data = true`).
     *  A data widget KEEPS the cell's `sources[]` (the shell resolves them to `ctx.data`) and shows the
     *  Query + Field tabs; a non-data widget owns its own data and clears targets when picked. */
    data?: boolean;
    /** The resolved read source `{tool,args}` (read/scripted views + a control's optional self-read). */
    source?: Source;
    /** The resolved write action (control views) — `argsTemplate` gets a `{{value}}` slot filled later. */
    action?: Action;
    /** True if the entry's tool writes (drives the Action group + write-capable views). */
    writes: boolean;
    /** For a `rules` entry: the rule's declared params, so a host can render a params form around the
     *  picker and fill the `rules.run` `args.params` (a rule with no params has none/empty). */
    params?: RuleParam[];
}

/** One entry in a picker's group list: which source `group` to render and its section label. */
export declare type SourceGroup = {
    group: SourceEntry["group"];
    label: string;
};

/** Inputs to `buildSourceEntries` — the loader results, each optional (absent → that group is absent). */
export declare interface SourceInputs {
    series?: string[];
    extensions?: ExtRow[];
    flows?: Flow[];
    descriptors?: NodeDescriptor[];
    datasources?: DatasourceRow[];
    rules?: RuleSummary[];
    queries?: QuerySummary[];
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

export declare function SourcePicker({ entries, value, onSelect, loading, groups, "aria-label": ariaLabel, className, }: SourcePickerProps): JSX_2.Element;

export declare interface SourcePickerData {
    entries: SourceEntry[];
    /** The installed extensions (also handed to a cell renderer for `ext:<id>/<widget>` tiles). */
    installed: ExtRow[];
    loading: boolean;
}

/** The source-picker bundle — one entry per ws, shared by the page-level and editor instances (goal 3). */
export declare function sourcePickerKey(ws: string): readonly ["source-picker", string];

export declare interface SourcePickerProps {
    /** The assembled entries (from `useSourcePicker`). */
    entries: SourceEntry[];
    /** The currently-selected entry id (controlled) — "" for none. */
    value?: string;
    /** Called with the chosen entry's selection (or null when cleared to "— pick —"). */
    onSelect: (selection: SourceSelection | null) => void;
    /** True while the entries load — shows a loading placeholder. */
    loading?: boolean;
    /** Override which groups show + their order/labels (default: the read groups above). */
    groups?: {
        group: SourceEntry["group"];
        label: string;
    }[];
    /** Accessible label for the select (default "source"). */
    "aria-label"?: string;
    /** Extra className on the root <label> (host layout). */
    className?: string;
}

/** The assembled picker data (sans loading flag — the caller owns that). */
export declare interface SourcePickerResult {
    entries: SourceEntry[];
    installed: ExtRow[];
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

/** The id of the "SQL query" entry — the visual SQL builder + raw-SQL source over `store.query`. */
export declare const SQL_SOURCE_ID = "sql:query";

/** The single "SQL query" picker entry. Its `source.tool` is `store.query` so a host's tool set
 *  includes it (the bridge's leash); the concrete `sql` is filled by the host's SQL editor. */
export declare function sqlSourceEntry(): SourceEntry;

export declare type Status = "open" | "acked" | "resolved";

/** A status chip ("OPEN" / "ACKED" / "RESOLVED"), tinted by the tone key. */
export declare function StatusBadge({ status }: {
    status: Status;
}): JSX_2.Element;

/** Status → tone key. `open` reads as the primary accent (action due), `acked` as warning (claimed),
 *  `resolved` as success (done) — the Inbox status register. */
export declare function statusTone(s: Status): Tone;

/** A step unit for offset arithmetic. `m` = minute, `M` = month (Grafana-compatible). */
export declare type StepUnit = "s" | "m" | "h" | "d" | "w" | "M" | "q" | "y";

/** A compact relative-time formatter ("2m ago", "1h 22m ago", "3d ago"). `now` defaults to the wall
 *  clock; pass it explicitly for a deterministic test (the package itself never calls `Date.now()`
 *  in a way that leaks into a snapshot). */
export declare function timeAgo(ts: number, now?: number): string;

/** Resolve one HSL-triplet token (`--chart-1` → `"217 78% 48%"`) into a canvas-usable color.
 *
 *  The COMMAS are load-bearing. Our tokens are CSS Color 4 space-separated triplets, which the browser
 *  understands everywhere — but echarts does not hand colors straight to the canvas: zrender PARSES
 *  them itself (to interpolate a visualMap ramp, to derive an emphasis shade), and its parser only
 *  knows the legacy `hsl(h, s%, l%)` / `rgb(...)` / hex forms. A space-separated triplet parses as
 *  null and every mark paints BLACK — the first thing this shipped as, and invisible to jsdom.
 *
 *  Falls back to a neutral grey when the token is missing (SSR / jsdom / a host that defines no chart
 *  tokens) so a chart still draws something honest instead of throwing. */
export declare function tokenColor(name: string, alpha?: number): string;

/** A tone KEY per severity — a stable, look-free token a host maps to its own palette. The package UI
 *  maps `critical → destructive`, `warning → warning`, `info → accent-2`; a host may map differently. */
export declare type Tone = "destructive" | "warning" | "accent-2" | "default" | "success";

/** The leashed tool call — the SAME `(tool, args)` an `ExtBridge.call` / `PageBridge.call` /
 *  `WidgetBridge.call` takes, and the same shape `vizBatchLoader`'s `BatchCall` dispatches through.
 *  Returns `unknown`: the caller owns the decode, because the kit must never assume a wire shape it
 *  did not ask for. */
export declare type ToolCall = (tool: string, args?: Record<string, unknown>) => Promise<unknown>;

/** Normalise either accepted transport shape to the bare call. A bridge's `call` is generic; the kit's
 *  `ToolCall` deliberately resolves `unknown` so no decode is assumed at the seam. */
export declare function toolCallOf(transport: KitTransport): ToolCall;

/** The shared tooltip surface — the popover token, a soft ring, the app's text color. */
export declare function tooltipChrome(theme: EchartsTheme): {
    backgroundColor: string;
    borderColor: string;
    textStyle: {
        color: string;
        fontSize: number;
    };
    extraCssText: string;
};

/** Lazy catalog. `loaders` is the host's read seam; `ws` keys the re-init (the workspace switch). The
 *  initial idle record is computed once per `loaders` reference via `useState`'s lazy initializer —
 *  every wired section starts `idle` on FIRST render (no useEffect timing gap). The `ws` effect resets
 *  the record on workspace switch (the user re-opens each section to re-fetch under the new ws). */
export declare function useCatalog(loaders: SourceLoaders, ws: string): UseCatalogResult;

/** The lazy catalog — the per-section state record plus the `loadSection(kind)` action the explorer
 *  fires on first expand. The host reads `sections` for rendering; passes `loadSection` to the
 *  `<CatalogExplorer>` so its section headers can trigger their own loads. */
declare interface UseCatalogResult {
    sections: CatalogSections;
    /** Fire one section's loader (deny-tolerant; absent loader ⇒ the section stays `undefined`).
     *  Idempotent — calling it again on an already-loaded section is a no-op (the cached state persists). */
    loadSection: (kind: CatalogSectionKind) => void;
}

/** The current dashboard workspace. Throws if read outside `DashboardCacheProvider` (a wiring bug — a
 *  read hook must never fall back to an unscoped key that would bleed across workspaces). */
export declare function useDashboardWs(): string;

/** The current dashboard workspace, or `null` outside a `DashboardCacheProvider`. For a consumer that
 *  is ALSO valid without the cache (an ext widget may mount standalone — a v2 self-fetching tile needs
 *  no frames): it reads the ws when present and does no cache read when absent. A DATA tile only reaches
 *  its `viz.query` when a provider supplies the ws, so this never keys under an unscoped ws. */
export declare function useDashboardWsOptional(): string | null;

/** Return `value` delayed by `ms` of quiet — the returned value only updates once `value` has been stable
 *  for `ms`. The FIRST value passes through on mount (nothing to wait for); each change restarts the timer. */
export declare function useDebounced<T>(value: T, ms: number): T;

/** Read the ambient freeze flag. An explicit `useVizQuery({frozen})` opt takes precedence over this. */
export declare function useFreeze(): boolean;

/** Read the ambient effective cache TTL (seconds). `0` ⇒ live (omit the directive). */
export declare function useFreshness(): number;

/** Load + drive the detail for insight `id` over `client`. Re-fetches on `id` change and after an
 *  ack/resolve lands (so the pane re-opens with the new status). `occLimit` bounds the occurrence page
 *  (default 50). `client` is read through a ref (host-stability — see `useInsights`). */
export declare function useInsight(client: InsightsClient, id: string, occLimit?: number): InsightDetailState;

/** Drive an insights list over `client`. `initial` is the starting filter (status / severity / tags /
 *  range); `setFilter` swaps it. Keyset paging appends on `loadMore`; the client's `subscribe` feed (if
 *  any) refreshes the head on each raise/ack/resolve. `client` is read through a ref so an unmemoized
 *  literal per render does not loop (the source-picker host-stability guarantee). */
export declare function useInsights(client: InsightsClient, initial: ListQuery): InsightsState;

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

/** Controls a right-docked panel's width via a left-edge drag handle. */
export declare function useResizable({ initial, min, max, step }: UseResizableOptions): Resizable;

export declare interface UseResizableOptions {
    initial: number;
    min: number;
    max: number;
    /** Arrow-key step for keyboard resize (accessibility). */
    step?: number;
}

/** Load + assemble the picker. `loaders` is the host's read seam; `ws` keys the re-load (the workspace
 *  switch). The effect keys on `ws` ONLY and reads `loaders` through a ref kept current every render —
 *  so an UNMEMOIZED `loaders` object (a fresh literal per render, the easy host mistake) does NOT loop.
 *  A host that swaps to a genuinely different transport should also change `ws` (or remount). */
export declare function useSourcePicker(loaders: SourceLoaders, ws: string): SourcePickerData;

/** Read the ambient batch loader, or `null` outside a provider (an editor / a lone panel) — the caller
 *  then uses the single `viz.query` path. */
export declare function useVizBatchLoader(): VizBatchLoader | null;

/** The fully-resolved scope an interpolation substitutes against: the user-variable selections (by
 *  name) + the built-ins. This is the contract handed to a widget as `ctx.vars`. */
export declare interface VarScope {
    /** The resolved user-variable selections, keyed by variable name. */
    values: Record<string, VarValue>;
    /** The host-resolved built-ins (token + time range derived). */
    builtins: Builtins;
}

/** A resolved variable VALUE — a single value, or a multi-value list (multi/include-all selections). */
export declare type VarValue = string | string[];

/** A batch loader instance. `load` is the per-cell entry; `supported` exposes the feature-detect state
 *  (for a status hint / test assertion). */
export declare interface VizBatchLoader {
    load(panel: unknown, cache?: CacheDirective): Promise<VizQueryResult>;
    readonly supported: boolean;
}

export declare interface VizBatchLoaderOptions {
    /** The coalescing window in ms — loads arriving within it join one batch. Small (a render's worth).
     *  Injectable so a test can flush deterministically. Default 12 ms. */
    windowMs?: number;
    /** The verb id for the batch call (defaults to the lb verb). */
    batchTool?: string;
    /** The verb id for the single/fallback call. */
    singleTool?: string;
}

/** Mount a per-visit batch loader for the subtree. One loader per mount so its feature-detect +
 *  coalescing state is scoped to this dashboard visit.
 *
 *  `call` is optional: absent, the loader binds to the `KitProvider`'s client. A host with a narrower
 *  seam for this subtree (a widget bridge leashed to the two viz verbs) passes it explicitly.
 *
 *  The kit context is read OPTIONALLY on purpose. When `call` is supplied the provider needs nothing
 *  from the context, and requiring one anyway turns "you gave me a call" into "you must ALSO give me a
 *  provider" — a coupling the injected seam exists to avoid. It is not hypothetical: the shell's
 *  `useVizQuery` tests wrap a subtree in this provider and nothing else, and a hard `useKit()` here
 *  threw in all seven of them. */
export declare function VizBatchProvider({ call, children }: {
    call?: BatchCall;
    children: ReactNode;
}): JSX_2.Element;

export declare function vizFetchKey(ws: string, spec: VizFetchSpec): readonly ["viz.fetch", string, unknown];

/** The FETCH half of the split (data-studio-ux: edit-without-requery). Keyed on ONLY what a datasource
 *  read depends on — `sources`/`source`/`scope`/`tick`. Crucially, `transformations` and `fieldConfig`
 *  are ABSENT, so a transform/field-config edit does NOT re-key this → the raw frames stay cached and no
 *  datasource is re-hit. A source/SQL/time-range edit (or Run, via `tick`) DOES re-key → a fresh fetch. */
export declare interface VizFetchSpec {
    sources: unknown;
    source: unknown;
    scope: unknown;
    tick: number;
}

/** `viz.query` — keyed on the canonical resolved spec + scope + tick, ws-prefixed. The scope goes
 *  through `scopeKey` first: only the built-ins the spec REFERENCES ride the key (nav-context-vars
 *  Slice 1b), so `__nav.*`/`__page.*` — and the per-tick `$__from`/`$__to` — never re-key a panel whose
 *  own strings never mention them. */
export declare function vizQueryKey(ws: string, spec: VizQuerySpec): readonly ["viz.query", string, unknown];

/** The `{frames, rows}` shape a single `viz.query` returns — what `load()` resolves to. */
export declare interface VizQueryResult {
    frames?: unknown[];
    rows?: Array<Record<string, unknown>>;
}

/** The resolved viz.query spec that actually drives the fetch — NOT the whole panel. Title/layout/option
 *  edits are absent here, so they don't re-key (scope goal 2). `tick` folds the refresh cadence into the
 *  key so a new tick is a new entry ("fresh until next tick"). */
export declare interface VizQuerySpec {
    sources: unknown;
    transformations: unknown;
    fieldConfig: unknown;
    source: unknown;
    scope: unknown;
    tick: number;
}

export declare function vizShapeKey(ws: string, spec: VizShapeSpec): readonly ["viz.shape", string, unknown];

/** The SHAPE half of the split. Keyed on the RAW frames (by a cheap hash) + `transformations` — the
 *  ONLY thing the server reshapes. A transform edit re-keys this → one compute-only `viz.query` over
 *  the already-fetched raw frames, no datasource touch. No transformations at all → the caller skips
 *  the round-trip entirely and uses the raw frames as-is.
 *
 *  `fieldConfig` is deliberately ABSENT (it was in this key until 2026-08-01). It is PRESENTATION —
 *  unit, decimals, min/max, color, thresholds, mappings — applied client-side at render by
 *  `fieldconfig/resolve.ts` + `format.ts`, which every view already calls. The server never reads it:
 *  lb's frames-in path is `transform(frames, &pipeline)` and `panel_pipeline` parses ONLY
 *  `panel.transformations` (`host/src/viz/query.rs`). So keying on it bought nothing and cost a full
 *  HTTP round-trip per keystroke that returned byte-identical frames — and, because the view rendered
 *  the SETTLED shape response, made a unit change look like it did nothing until that no-op call
 *  landed. Do not re-add it: if a field-config key ever needs server compute, it belongs in
 *  `transformations`. */
export declare interface VizShapeSpec {
    framesHash: string;
    transformations: unknown;
}

/** The weekday a calendar/week starts on — the closed set `first_day_of_week` may carry (the
 *  resolver's default week-start convention is Monday; a viewer's pref may override it to Sunday). */
export declare type WeekStart = "monday" | "sunday";

/** Map the resolved `first_day_of_week` axis to a `WeekStart`. Absent (unset → inherit) or any value
 *  outside the closed `monday`/`sunday` set means Monday — the grammar the conformance fixture pins. */
export declare function weekStartOf(v: string | undefined): WeekStart;

/** Derive a widget id from a tile — the label slug, lowercased, non-alnum → `-`. The renderer parses
 *  the same slug from the `ext:<id>/<widget>` key, so picker and renderer agree (one slug function).
 *  Exported so a host renderer can reuse it instead of forking a second slugger. */
export declare function widgetIdOf(w: {
    label: string;
}): string;

declare type Window_2 = 
/** `yesterday` (-1) / `today` (0) / `tomorrow` (+1): a calendar day. `today` runs midnight → now
*  ("so far today"); `yesterday`/`tomorrow` are that whole day. */
    {
    kind: "day";
    offset: -1 | 0 | 1;
}
/** `this-` (start of the current period → now) / `last-` (previous) / `next-` (next) — last and
*  next span the whole calendar period, this spans only its elapsed part. */
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

/** Wrap `children` in the dashboard read cache for a test render. Pass the test's workspace so cache keys
 *  match production; the provider mints a per-mount client so each test starts cold. */
export declare function WithDashboardCache({ ws, children }: {
    ws: string;
    children: ReactNode;
}): JSX_2.Element;

/** How the kit resolves "the viewer's time zone" when nothing more specific is set. Replaces the
 *  shell-only `preferredZone()` import that used to be `lib/timerange`'s single outside coupling —
 *  a prop rather than an SDK change, so no `ui-v*` tag is involved. Default: the browser zone. */
export declare type ZoneResolver = () => string;

/** How the kit resolves "the viewer's zone". Mirrors `KitProvider`'s `zone` prop. */
declare type ZoneResolver_2 = () => string;

export { }
