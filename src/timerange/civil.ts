// The calendar maths behind the relative time-range grammar (relative-time-range scope) — the
// TypeScript twin of lb's `timerange/civil.rs`. Two halves:
//
//   1. Proleptic-Gregorian day arithmetic (Hinnant `days_from_civil`/`civil_from_days`) — exact
//      integer maths, no Date object, no timezone.
//   2. Wall-clock ⇄ instant conversion for an IANA timezone, derived with `Intl.DateTimeFormat`
//      (the ONE timezone database every browser ships — no luxon/dayjs/date-fns; the scope's rule).
//
// Everything downstream (resolve.ts) speaks these; nothing else in the lib touches Date/Intl.
// Ambiguous/skipped wall times (a DST transition) resolve deterministically via the two-pass offset
// probe — the conformance fixture pins the exact answers against the Rust twin.

/** A wall-clock time in some timezone (1-based month/day, 24h clock). */
export interface Wall {
  y: number;
  mo: number;
  d: number;
  h: number;
  mi: number;
  s: number;
}

export const DAY_MS = 86_400_000;

/** Days since 1970-01-01 for a civil date (Hinnant `days_from_civil`). */
export function daysFromCivil(y: number, mo: number, d: number): number {
  y -= mo <= 2 ? 1 : 0;
  const era = Math.floor((y >= 0 ? y : y - 399) / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (mo + (mo > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

/** Civil date for days since 1970-01-01 (Hinnant `civil_from_days`). */
export function civilFromDays(z: number): { y: number; mo: number; d: number } {
  z += 719468;
  const era = Math.floor((z >= 0 ? z : z - 146096) / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365,
  );
  const y = yoe + era * 400;
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const mo = mp + (mp < 10 ? 3 : -9);
  return { y: y + (mo <= 2 ? 1 : 0), mo, d };
}

/** Days in a civil month — exact, via the day-number difference of consecutive month starts. */
export function daysInMonth(y: number, mo: number): number {
  const next = mo === 12 ? { y: y + 1, mo: 1 } : { y, mo: mo + 1 };
  return daysFromCivil(next.y, next.mo, 1) - daysFromCivil(y, mo, 1);
}

/** The weekday a calendar/week starts on — the closed set `first_day_of_week` may carry (the
 *  resolver's default week-start convention is Monday; a viewer's pref may override it to Sunday). */
export type WeekStart = "monday" | "sunday";

/** Weekday index (0 = the week's first day … 6) of a civil date, for the given `start`. 1970-01-01
 *  was a Thursday. The epoch offsets: Monday-start counts Thu at 3 (Mon0…Sun6); Sunday-start counts
 *  Thu at 4 (Sun0…Sat6). */
export function weekdayOf(y: number, mo: number, d: number, start: WeekStart): number {
  const z = daysFromCivil(y, mo, d);
  return ((z % 7) + (start === "sunday" ? 4 : 3) + 7) % 7;
}

// --- timezone bridge (Intl) --------------------------------------------------------------------

/** One cached formatter per timezone — `formatToParts` is the hot call on every resolve. */
const FORMATTERS = new Map<string, Intl.DateTimeFormat>();

function formatterFor(tz: string): Intl.DateTimeFormat {
  let f = FORMATTERS.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    FORMATTERS.set(tz, f);
  }
  return f;
}

/** A usable IANA timezone name: the input when Intl accepts it, else `"UTC"` (an unknown zone
 *  DEGRADES, never throws — the shell contract for anything a URL or record can carry). */
export function normalizeTz(tz: string | undefined): string {
  if (!tz) return "UTC";
  try {
    formatterFor(tz);
    return tz;
  } catch {
    return "UTC";
  }
}

/** The wall-clock reading of an instant in `tz`. `tz` must be pre-normalized (`normalizeTz`). */
export function wallOf(ms: number, tz: string): Wall {
  const parts = formatterFor(tz).formatToParts(ms);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { y: get("year"), mo: get("month"), d: get("day"), h: get("hour") % 24, mi: get("minute"), s: get("second") };
}

/** A wall time projected as-if UTC — the pivot both offset derivations share. */
function utcOfWall(w: Wall): number {
  return daysFromCivil(w.y, w.mo, w.d) * DAY_MS + ((w.h * 60 + w.mi) * 60 + w.s) * 1000;
}

/** The zone's UTC offset (ms, positive east) at `ms`. */
export function zoneOffset(ms: number, tz: string): number {
  return utcOfWall(wallOf(ms, tz)) - ms;
}

/** The instant a wall-clock time names in `tz` — the two-pass offset probe. A wall time inside a DST
 *  gap or overlap resolves deterministically (the second probe's offset wins); the conformance fixture
 *  pins those rows against the Rust twin. */
export function msFromWall(w: Wall, tz: string): number {
  const guess = utcOfWall(w);
  const first = guess - zoneOffset(guess, tz);
  const second = guess - zoneOffset(first, tz);
  return second;
}

/** The ISO `yyyy-mm-dd` day an instant falls in, in `tz` — what previews and URL projections print. */
export function isoDayOf(ms: number, tz: string): string {
  const w = wallOf(ms, tz);
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  return `${pad(w.y, 4)}-${pad(w.mo)}-${pad(w.d)}`;
}
