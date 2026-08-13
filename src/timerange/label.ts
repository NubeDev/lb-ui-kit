// The human label of a range expression pair (relative-time-range scope, build item 4) — what the
// range picker's trigger reads. `labelOf("last-3-months")` → "Last 3 months"; a token names itself,
// so the old `matchPreset` reverse-lookup (re-resolving every preset to compare dates) is gone.
// Absolute pairs read as the literal dates, exactly as the shipped picker printed a custom range.

import { parseRangeExpr, type StepUnit, type Window } from "./parse";

/** Step unit → its long name (singular). */
const UNIT_NAMES: Record<StepUnit, string> = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  q: "quarter",
  y: "year",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function windowLabel(win: Window): string {
  switch (win.kind) {
    case "day":
      return win.offset === 0 ? "Today" : win.offset === -1 ? "Yesterday" : "Tomorrow";
    case "period":
      return `${capitalize(win.rel)} ${win.unit}`; // "This month", "Last quarter", "Next week"
    case "trailing": {
      // The counted spelling stays counted — "Last 1 month" is NOT "Last month" (scope decision 1).
      const unit = UNIT_NAMES[win.unit];
      return `Last ${win.n} ${unit}${win.n === 1 ? "" : "s"}`;
    }
  }
}

/** The label of a committed range: a window token names itself; an endpoint pair reads as the literal
 *  expressions ("2026-07-27 → 2026-08-03", "now-4h → now"). An unparseable value prints verbatim —
 *  labelling never throws and never lies about what the URL says. */
export function labelOf(from: string, to?: string): string {
  const p = parseRangeExpr(from);
  if (p.ok && p.expr.type === "window") return windowLabel(p.expr.window);
  return to ? `${from} → ${to}` : from === "now" ? "Now" : `${from} → now`;
}

/** The phone-width label (mobile-friendly-ui §4.2): a token label is already short; an ISO-day pair
 *  compresses to a year-less `Jul 27 – Aug 3` (the full pair is ~200px and clips at 390px). Parsed at
 *  UTC so the printed day never drifts across the viewer's zone — presentation only. */
export function shortLabelOf(from: string, to?: string): string {
  const isoDay = /^\d{4}-\d{2}-\d{2}$/;
  if (to && isoDay.test(from) && isoDay.test(to)) {
    const short = (day: string) => {
      const d = new Date(`${day}T00:00:00Z`);
      if (Number.isNaN(d.getTime())) return day;
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
    };
    return `${short(from)} – ${short(to)}`;
  }
  return labelOf(from, to);
}
