// Resolve a range expression pair to concrete epoch-ms bounds (relative-time-range scope) — the
// TypeScript twin of lb's `timerange/resolve.rs`, pinned to it by the shared conformance fixture.
//
// The contract:
//   - `resolveRange(from, to, nowMs, tz)` → `{ fromMs, toMs }` or `null`. NEVER throws — the shell
//     degrades malformed input to its default window (the caller's job; `null` is the signal).
//   - `to` is EXCLUSIVE. A window token (`today`, `this-month`, …) is legal only in `from` with `to`
//     absent — a window + a `to` is malformed (`null` here; the host refuses loudly).
//   - An endpoint `from` with no `to` ends at `now`.
//   - Month/quarter/year (and day/week) arithmetic is CALENDAR-AWARE in `tz`: `last-1-month` on
//     31 March is 28 February; day steps preserve the wall clock across a DST change. Second/minute/
//     hour steps are exact durations (the moment.js rule the Grafana grammar inherits).
//   - Weeks start Monday; quarters are Jan/Apr/Jul/Oct.

import {
  civilFromDays,
  daysFromCivil,
  daysInMonth,
  isoDayOf,
  msFromWall,
  normalizeTz,
  wallOf,
  weekdayMon0,
  type Wall,
} from "./civil";
import { browserZone, preferredZone, type ZoneResolver } from "./zone";
import { parseRangeExpr, type CalUnit, type Endpoint, type StepUnit, type Window } from "./parse";

/** A resolved window: epoch ms, `toMs` exclusive. What `$__from`/`$__to` carry. */
export interface ResolvedRange {
  fromMs: number;
  toMs: number;
}

/** The app's default window when a URL carries no (or a broken) range and the board stores none. */
export const DEFAULT_RANGE_EXPR = "last-30-days";

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
export function rangeTimezone(
  dashboardTz?: string,
  prefsTz?: string,
  zone: ZoneResolver = browserZone,
): string {
  return normalizeTz(preferredZone(zone, dashboardTz, prefsTz));
}

// --- calendar stepping -------------------------------------------------------------------------

function clampedAddMonths(w: Wall, n: number): Wall {
  const total = w.y * 12 + (w.mo - 1) + n;
  const y = Math.floor(total / 12);
  const mo = ((total % 12) + 12) % 12 + 1;
  return { ...w, y, mo, d: Math.min(w.d, daysInMonth(y, mo)) };
}

/** Step an instant by `n` units in `tz` — exact for s/m/h, calendar (wall-clock-preserving, with
 *  month-end clamping) for d/w/M/q/y. */
export function addUnits(ms: number, n: number, unit: StepUnit, tz: string): number {
  switch (unit) {
    case "s":
      return ms + n * 1000;
    case "m":
      return ms + n * 60_000;
    case "h":
      return ms + n * 3_600_000;
    case "d":
    case "w": {
      const w = wallOf(ms, tz);
      const days = unit === "w" ? n * 7 : n;
      const civil = civilFromDays(daysFromCivil(w.y, w.mo, w.d) + days);
      return msFromWall({ ...w, ...civil }, tz);
    }
    case "M":
    case "q":
    case "y": {
      const months = unit === "M" ? n : unit === "q" ? n * 3 : n * 12;
      return msFromWall(clampedAddMonths(wallOf(ms, tz), months), tz);
    }
  }
}

/** One whole calendar period as a step (`this-week` → +1w, `last-quarter` → -1q, …). */
function stepOf(unit: CalUnit): StepUnit {
  const map: Record<CalUnit, StepUnit> = {
    second: "s",
    minute: "m",
    hour: "h",
    day: "d",
    week: "w",
    month: "M",
    quarter: "q",
    year: "y",
  };
  return map[unit];
}

/** Truncate an instant to the start of its calendar `unit` in `tz` (Monday weeks, Jan/Apr/Jul/Oct
 *  quarters). */
export function startOfUnit(ms: number, unit: CalUnit, tz: string): number {
  if (unit === "second") return Math.floor(ms / 1000) * 1000;
  const w = wallOf(ms, tz);
  switch (unit) {
    case "minute":
      return msFromWall({ ...w, s: 0 }, tz);
    case "hour":
      return msFromWall({ ...w, mi: 0, s: 0 }, tz);
    case "day":
      return msFromWall({ ...w, h: 0, mi: 0, s: 0 }, tz);
    case "week": {
      const civil = civilFromDays(daysFromCivil(w.y, w.mo, w.d) - weekdayMon0(w.y, w.mo, w.d));
      return msFromWall({ ...w, ...civil, h: 0, mi: 0, s: 0 }, tz);
    }
    case "month":
      return msFromWall({ ...w, d: 1, h: 0, mi: 0, s: 0 }, tz);
    case "quarter":
      return msFromWall({ ...w, mo: Math.floor((w.mo - 1) / 3) * 3 + 1, d: 1, h: 0, mi: 0, s: 0 }, tz);
    case "year":
      return msFromWall({ ...w, mo: 1, d: 1, h: 0, mi: 0, s: 0 }, tz);
    default:
      return ms;
  }
}

// --- endpoint / window resolution --------------------------------------------------------------

/** Resolve one endpoint expression to an instant. */
export function resolveEndpoint(ep: Endpoint, nowMs: number, tz: string): number {
  switch (ep.kind) {
    case "now": {
      let ms = nowMs;
      if (ep.offset) ms = addUnits(ms, ep.offset.sign * ep.offset.n, ep.offset.unit, tz);
      if (ep.snap) ms = startOfUnit(ms, ep.snap, tz);
      return ms;
    }
    case "isoDay":
      return msFromWall({ y: ep.y, mo: ep.mo, d: ep.d, h: 0, mi: 0, s: 0 }, tz);
    case "instant":
      return ep.ms;
    case "wall":
      return msFromWall({ y: ep.y, mo: ep.mo, d: ep.d, h: ep.h, mi: ep.mi, s: ep.s }, tz) + ep.ms;
  }
}

/** Resolve one window token to its whole range (`to` exclusive). */
export function resolveWindow(win: Window, nowMs: number, tz: string): ResolvedRange {
  switch (win.kind) {
    case "day": {
      const start = addUnits(startOfUnit(nowMs, "day", tz), win.offset, "d", tz);
      return { fromMs: start, toMs: addUnits(start, 1, "d", tz) };
    }
    case "period": {
      const cur = startOfUnit(nowMs, win.unit, tz);
      const step = stepOf(win.unit);
      if (win.rel === "this") return { fromMs: cur, toMs: addUnits(cur, 1, step, tz) };
      if (win.rel === "last") return { fromMs: addUnits(cur, -1, step, tz), toMs: cur };
      const next = addUnits(cur, 1, step, tz);
      return { fromMs: next, toMs: addUnits(cur, 2, step, tz) };
    }
    case "trailing":
      // A trailing window ends NOW exactly — `last-1-month` ≠ `last-month` (scope decision 1).
      return { fromMs: addUnits(nowMs, -win.n, win.unit, tz), toMs: nowMs };
  }
}

/** Resolve a `from`/`to` pair against a clock + timezone. `null` = malformed (a bad token, a window
 *  token alongside a `to`, or an inverted pair) — the caller degrades to its default window. */
export function resolveRange(
  from: string | undefined,
  to: string | undefined,
  nowMs: number,
  tz: string,
): ResolvedRange | null {
  if (!from || !from.trim()) return null;
  const zone = normalizeTz(tz);
  const f = parseRangeExpr(from);
  if (!f.ok) return null;

  if (f.expr.type === "window") {
    // A range token with a `to` present is malformed (scope decision 2).
    if (to && to.trim()) return null;
    return resolveWindow(f.expr.window, nowMs, zone);
  }

  const fromMs = resolveEndpoint(f.expr.endpoint, nowMs, zone);
  let toMs = nowMs;
  if (to && to.trim()) {
    const t = parseRangeExpr(to);
    if (!t.ok || t.expr.type !== "endpoint") return null; // a window token is never legal in `to`
    toMs = resolveEndpoint(t.expr.endpoint, nowMs, zone);
  }
  return fromMs <= toMs ? { fromMs, toMs } : null;
}

/** The preview projection of a resolved bound: the ISO day when it falls on a midnight in `tz`, else
 *  the day plus wall time — what the picker's live preview prints. */
export function previewBound(ms: number, tz: string): string {
  const zone = normalizeTz(tz);
  const w = wallOf(ms, zone);
  const day = isoDayOf(ms, zone);
  if (w.h === 0 && w.mi === 0 && w.s === 0 && ms % 1000 === 0) return day;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${day} ${pad(w.h)}:${pad(w.mi)}`;
}
