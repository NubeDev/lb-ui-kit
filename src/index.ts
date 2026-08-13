// `@nube/dash-kit` — the public surface. Keep it SMALL: after the first tag every export here is a
// versioned promise, and an accidental export is a contract nobody chose to make. Add a symbol only
// when a real consumer needs it.

import "./dash-kit.css";

// ── Tier 0: the whole integration ────────────────────────────────────────────────────────────────
export { makeKitClient, makeSourceLoaders, makeInsightsClient, toolCallOf } from "./client/makeKitClient";
export { KitDeniedError, isKitDenied, isOutOfScope } from "./client/types";
export type {
  CallLike,
  KitClient,
  KitClientOptions,
  KitTransport,
  ToolCall,
} from "./client/types";
export { DASH_KIT_READ_CAPS, DASH_KIT_READ_SCOPE } from "./client/scope";

export {
  browserZone,
  KitProvider,
  useKit,
  useKitClient,
  useKitOptional,
  useKitTheme,
  useKitWs,
  useKitZone,
} from "./provider/KitProvider";
export type {
  KitContextValue,
  KitProviderProps,
  KitTheme,
  ZoneResolver,
} from "./provider/KitProvider";

// ── Tier 1a: the time-range grammar + the date select ────────────────────────────────────────────
export {
  DEFAULT_RANGE_EXPR,
  isoDayOf,
  isWindowExpr,
  labelOf,
  normalizeTz,
  parseRangeExpr,
  previewBound,
  rangeTimezone,
  resolveRange,
  shortLabelOf,
} from "./timerange";
export type {
  CalUnit,
  Endpoint,
  ParseOutcome,
  RangeExpr,
  ResolvedRange,
  StepUnit,
  Window,
} from "./timerange";
export { BROWSER_TZ, preferredZone } from "./timerange/zone";

export { DashboardRangePicker } from "./range-picker/DashboardRangePicker";
export type { DashboardRangePickerProps } from "./range-picker/DashboardRangePicker";
export { PrefDateInput } from "./range-picker/PrefDateInput";
export type { PrefDateInputProps } from "./range-picker/PrefDateInput";
export {
  RANGE_BANDS,
  RANGE_COLUMNS,
  RANGE_PRESETS,
} from "./range-picker/rangePresets";
export type { RangeBand, RangeColumn, RangePreset } from "./range-picker/rangePresets";
export { datePlaceholder, formatDateField, parseDateField } from "./lib/formatDateField";
export type { DateStyle } from "./lib/formatDateField";

// ── Tier 1b: the read cache ──────────────────────────────────────────────────────────────────────
export { LIST_STALE_MS, makeDashboardQueryClient } from "./cache/dashboardQueryClient";
export { DashboardCacheProvider } from "./cache/DashboardQueryProvider";
export { datasourceListQueryOptions, fetchDatasourceList } from "./cache/datasourceListQuery";
export type { DatasourceSummary, ListDatasources } from "./cache/datasourceListQuery";
export { DEFAULT_TTL_S, resolveFreshnessTtl } from "./cache/freshness";
export type { FreshnessInputs } from "./cache/freshness";
export {
  canon,
  datasourceListKey,
  flowNodeStateKey,
  seriesReadKey,
  sourcePickerKey,
  vizFetchKey,
  vizQueryKey,
  vizShapeKey,
} from "./cache/queryKeys";
export type { VizFetchSpec, VizQuerySpec, VizShapeSpec } from "./cache/queryKeys";
export {
  persistQuickCache,
  quickPersister,
  QUICK_PERSIST_MAX_AGE_MS,
  QUICK_PERSIST_VERSION,
} from "./cache/quickPersist";
export { scopeKey } from "./cache/scopeKey";
export type { ScopeKeyPart } from "./cache/scopeKey";
export { WithDashboardCache } from "./cache/testCacheWrapper";
export {
  DashboardWsContext,
  useDashboardWs,
  useDashboardWsOptional,
} from "./cache/useDashboardWs";
export { useDebounced } from "./cache/useDebounced";
export { FreezeProvider, useFreeze } from "./cache/useFreeze";
export { FreshnessProvider, useFreshness } from "./cache/useFreshness";
export { makeVizBatchLoader, MAX_PANELS } from "./cache/vizBatchLoader";
export type {
  BatchCall,
  CacheDirective,
  VizBatchLoader,
  VizBatchLoaderOptions,
  VizQueryResult,
} from "./cache/vizBatchLoader";
export { useVizBatchLoader, VizBatchProvider } from "./cache/VizBatchProvider";

// The variable-reference vocabulary the cache's key narrowing runs on. Exported so the shell keeps ONE
// definition (it re-exports these) rather than a second copy drifting from the one the keys use.
export {
  BUILTIN_PREFIX,
  extractVarNames,
  extractVarNamesDeep,
  isBuiltinName,
  NAV_PATH_SEP,
  navBuiltins,
} from "./vars";
export type { Builtins, NavContext, PageContext, VarScope, VarValue } from "./vars";

// ── The transport vocabulary the injected seams speak ────────────────────────────────────────────
// Types only for now. The source-picker and insights COMPONENTS land in kit-v0.4.0 (Tier 1c); their
// type modules ship here first because `makeKitClient` is typed against them.
export type {
  Action,
  ChannelRow,
  DatasourceRow,
  ExtRow,
  ExtUi,
  ExtWidgetOption,
  Flow,
  FlowNode,
  FlowSummary,
  InboxRow,
  InsightRow as PickerInsightRow,
  NodeDescriptor,
  ParamKind,
  QuerySummary,
  RuleParam,
  RuleSummary,
  Schema,
  SchemaColumn,
  SchemaTable,
  SectionState,
  Source,
  SourceLoaders,
  SourceSelection,
} from "./source-picker/types";

export type {
  Evidence,
  EvidenceSeries,
  Insight,
  InsightEvent,
  InsightsClient,
  ListFilter,
  ListPage,
  ListQuery,
  OccCursor,
  Occurrence,
  OccurrencePage,
  Origin,
  OriginKind,
  PageCursor,
  Severity,
  Status,
} from "./insights/types";
