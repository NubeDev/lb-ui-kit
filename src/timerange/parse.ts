// The relative-range grammar (relative-time-range scope, "The grammar") — string → typed expression.
// This is the TypeScript twin of lb's `timerange/grammar.rs`; the semantics are pinned by the shared
// conformance fixture, so every decision here is the scope's, not this file's.
//
// An ENDPOINT expression resolves to an instant (`now`, `now-4h`, `now-1d/d`, an ISO day, an ISO
// instant, 13-digit epoch ms). A WINDOW token resolves to a whole range and is legal only in `from`
// with no `to` (`today`, `this-month`, `last-month`, `last-3-months`, `last-90d`, …).
//
// Parsing never throws: the outcome is `{ ok: true, expr }` or `{ ok: false, error }` with the bad
// token named. Resolution (the calendar maths) lives in resolve.ts.

import { daysInMonth } from "./civil";

/** A step unit for offset arithmetic. `m` = minute, `M` = month (Grafana-compatible). */
export type StepUnit = "s" | "m" | "h" | "d" | "w" | "M" | "q" | "y";

/** A whole-calendar-period unit (the `this-`/`last-`/`next-` families + the snap suffix). */
export type CalUnit = "second" | "minute" | "hour" | "day" | "week" | "month" | "quarter" | "year";

/** Short-letter → step unit (identity; typed narrowing for the regex captures). */
const SHORT_UNITS: Record<string, StepUnit> = {
  s: "s",
  m: "m",
  h: "h",
  d: "d",
  w: "w",
  M: "M",
  y: "y",
};

/** Long unit word → step unit (the `last-<n>-<unit>s` spelling). */
const LONG_UNITS: Record<string, StepUnit> = {
  second: "s",
  minute: "m",
  hour: "h",
  day: "d",
  week: "w",
  month: "M",
  quarter: "q",
  year: "y",
};

/** Short-letter → the calendar unit a snap suffix truncates to. */
export const SNAP_UNITS: Record<string, CalUnit> = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  y: "year",
};

export type Endpoint =
  /** `now`, `now±<n><unit>`, optional `/<unit>` snap (truncate to the start of that unit). */
  | { kind: "now"; offset?: { sign: 1 | -1; n: number; unit: StepUnit }; snap?: CalUnit }
  /** An ISO `yyyy-mm-dd` day — midnight in the range timezone (today's contract, unchanged). */
  | { kind: "isoDay"; y: number; mo: number; d: number }
  /** A zoned ISO instant or 13-digit epoch ms — an absolute instant, timezone-independent. */
  | { kind: "instant"; ms: number }
  /** A zone-less ISO instant — interpreted as a wall time in the range timezone. */
  | { kind: "wall"; y: number; mo: number; d: number; h: number; mi: number; s: number; ms: number };

export type Window =
  /** `yesterday` (-1) / `today` (0) / `tomorrow` (+1): a calendar day. `today` runs midnight → now
   *  ("so far today"); `yesterday`/`tomorrow` are that whole day. */
  | { kind: "day"; offset: -1 | 0 | 1 }
  /** `this-` (start of the current period → now) / `last-` (previous) / `next-` (next) — last and
   *  next span the whole calendar period, this spans only its elapsed part. */
  | { kind: "period"; rel: "this" | "last" | "next"; unit: CalUnit }
  /** `last-<n>-<unit>s` / `last-<n><unit>`: a trailing window ending now. `last-1-month` ≠ `last-month`. */
  | { kind: "trailing"; n: number; unit: StepUnit };

export type RangeExpr = { type: "endpoint"; endpoint: Endpoint } | { type: "window"; window: Window };

export type ParseOutcome = { ok: true; expr: RangeExpr } | { ok: false; error: string };

const NOW_RE = /^now(?:([+-])(\d{1,6})([smhdwMy]))?(?:\/([smhdwMy]))?$/;
const ISO_DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const EPOCH_MS_RE = /^\d{13}$/;
const ISO_INSTANT_RE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?$/;
const PERIOD_RE = /^(this|last|next)-(hour|day|week|month|quarter|year)$/;
const TRAILING_LONG_RE = /^last-(\d{1,6})-(second|minute|hour|day|week|month|quarter|year)s?$/;
const TRAILING_SHORT_RE = /^last-(\d{1,6})([smhdwMy])$/;

const LEGAL =
  "expected now±<n><unit> (units s m h d w M y, optional /<unit> snap), an ISO day or instant, " +
  "13-digit epoch ms, today/yesterday/tomorrow, this-/last-/next-<unit>, or last-<n>-<unit>s";

function bad(raw: string): ParseOutcome {
  return { ok: false, error: `unrecognized range expression "${raw}" — ${LEGAL}` };
}

function validDay(y: number, mo: number, d: number): boolean {
  return mo >= 1 && mo <= 12 && d >= 1 && d <= daysInMonth(y, mo);
}

/** Parse one expression — a window token or an endpoint. Never throws. */
export function parseRangeExpr(raw: string): ParseOutcome {
  const s = raw.trim();
  if (!s) return { ok: false, error: `empty range expression — ${LEGAL}` };

  // --- window tokens (legal only in `from`, with `to` absent — resolve.ts enforces that) ---
  if (s === "today") return win({ kind: "day", offset: 0 });
  if (s === "yesterday") return win({ kind: "day", offset: -1 });
  if (s === "tomorrow") return win({ kind: "day", offset: 1 });

  const period = PERIOD_RE.exec(s);
  if (period) {
    return win({ kind: "period", rel: period[1] as "this" | "last" | "next", unit: period[2] as CalUnit });
  }
  const long = TRAILING_LONG_RE.exec(s);
  if (long) return win({ kind: "trailing", n: Number(long[1]), unit: LONG_UNITS[long[2]] });
  const short = TRAILING_SHORT_RE.exec(s);
  if (short) return win({ kind: "trailing", n: Number(short[1]), unit: SHORT_UNITS[short[2]] });

  // --- endpoints ---
  const now = NOW_RE.exec(s);
  if (now) {
    const [, sign, n, unit, snap] = now;
    return end({
      kind: "now",
      ...(sign ? { offset: { sign: sign === "-" ? -1 : 1, n: Number(n), unit: SHORT_UNITS[unit] } } : {}),
      ...(snap ? { snap: SNAP_UNITS[snap] } : {}),
    });
  }
  const day = ISO_DAY_RE.exec(s);
  if (day) {
    const [y, mo, d] = [Number(day[1]), Number(day[2]), Number(day[3])];
    return validDay(y, mo, d) ? end({ kind: "isoDay", y, mo, d }) : bad(raw);
  }
  if (EPOCH_MS_RE.test(s)) return end({ kind: "instant", ms: Number(s) });
  const instant = ISO_INSTANT_RE.exec(s);
  if (instant) {
    const [, y, mo, d, h, mi, sec, frac, zone] = instant;
    if (!validDay(Number(y), Number(mo), Number(d)) || Number(h) > 23 || Number(mi) > 59) return bad(raw);
    if (zone) {
      const ms = Date.parse(s);
      return Number.isFinite(ms) ? end({ kind: "instant", ms }) : bad(raw);
    }
    // Zone-less: a wall time, anchored in the range timezone at resolve time (deterministic — never
    // the machine's local zone).
    return end({
      kind: "wall",
      y: Number(y),
      mo: Number(mo),
      d: Number(d),
      h: Number(h),
      mi: Number(mi),
      s: Number(sec ?? 0),
      ms: Number((frac ?? "0").padEnd(3, "0")),
    });
  }
  return bad(raw);
}

/** True when the expression is a whole-window token (`today`, `this-month`, `last-3-months`, …) —
 *  the forms that forbid a `to`. */
export function isWindowExpr(raw: string): boolean {
  const p = parseRangeExpr(raw);
  return p.ok && p.expr.type === "window";
}

function win(window: Window): ParseOutcome {
  return { ok: true, expr: { type: "window", window } };
}
function end(endpoint: Endpoint): ParseOutcome {
  return { ok: true, expr: { type: "endpoint", endpoint } };
}
