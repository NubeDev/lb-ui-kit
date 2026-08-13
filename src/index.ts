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
