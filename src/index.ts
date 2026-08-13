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
