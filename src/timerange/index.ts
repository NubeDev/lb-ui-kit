// Barrel for the relative time-range lib (relative-time-range scope) — the TypeScript twin of lb's
// `timerange/` resolver, pinned to it by `conformance.json`. Re-exports only.

export { isoDayOf, normalizeTz } from "./civil";
export type { WeekStart } from "./civil";
export { isWindowExpr, parseRangeExpr } from "./parse";
export type { CalUnit, Endpoint, ParseOutcome, RangeExpr, StepUnit, Window } from "./parse";
export {
  DEFAULT_RANGE_EXPR,
  previewBound,
  rangeTimezone,
  resolveRange,
  type ResolvedRange,
  // rubix-ai#127's interval-ladder consumer walks calendar units directly (`$__interval` over a
  // month/quarter window), so the stepping helper is part of the surface now rather than internal.
  addUnits,
} from "./resolve";
export { weekStartOf } from "./weekStart";
export { labelOf, shortLabelOf } from "./label";
