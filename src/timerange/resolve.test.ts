// The resolver's own unit suite (relative-time-range scope, "Testing plan" key cases) — every token
// family, both `last-month` spellings, the leap day, the 31-March month clamp, the year boundary,
// Monday weeks, quarters, and a real DST transition in Australia/Sydney. Deterministic: the clock is
// an injected `nowMs`, the timezone an explicit IANA name. The cross-implementation pin against lb's
// Rust twin is `conformance.test.ts`; this file is the semantics spelled out by hand.

import { describe, expect, it } from "vitest";

import { resolveRange, rangeTimezone, DEFAULT_RANGE_EXPR } from "./resolve";
import { normalizeTz } from "./civil";

const UTC = "UTC";
const utc = (iso: string) => Date.parse(iso);

/** Monday 2026-08-03 → the fixed "now" most cases anchor on: Wed 2026-08-05 10:30:00Z. */
const NOW = utc("2026-08-05T10:30:00.000Z");

describe("resolveRange — endpoints", () => {
  it("an absolute ISO day pair resolves to UTC midnights (today's contract, byte-for-byte)", () => {
    const r = resolveRange("2026-07-27", "2026-08-03", NOW, UTC);
    expect(r).toEqual({
      fromMs: utc("2026-07-27T00:00:00.000Z"),
      toMs: utc("2026-08-03T00:00:00.000Z"),
    });
  });

  it("now / now±<n><unit>: offsets from the injected clock; a bare endpoint `from` ends at now", () => {
    expect(resolveRange("now-4h", undefined, NOW, UTC)).toEqual({
      fromMs: NOW - 4 * 3_600_000,
      toMs: NOW,
    });
    expect(resolveRange("now-90d", "now", NOW, UTC)).toEqual({
      fromMs: utc("2026-05-07T10:30:00.000Z"),
      toMs: NOW,
    });
    expect(resolveRange("now", "now+1d", NOW, UTC)).toEqual({
      fromMs: NOW,
      toMs: utc("2026-08-06T10:30:00.000Z"),
    });
  });

  it("Grafana snap suffixes truncate: now-1d/d, now/M, now/w (Monday)", () => {
    expect(resolveRange("now-1d/d", undefined, NOW, UTC)?.fromMs).toBe(utc("2026-08-04T00:00:00.000Z"));
    expect(resolveRange("now/M", undefined, NOW, UTC)?.fromMs).toBe(utc("2026-08-01T00:00:00.000Z"));
    // 2026-08-05 is a Wednesday; the Monday of its week is 2026-08-03.
    expect(resolveRange("now/w", undefined, NOW, UTC)?.fromMs).toBe(utc("2026-08-03T00:00:00.000Z"));
  });

  it("ISO instants and 13-digit epoch ms are absolute endpoints", () => {
    expect(resolveRange("2026-07-27T09:30:00Z", "2026-07-27T10:00:00Z", NOW, UTC)).toEqual({
      fromMs: utc("2026-07-27T09:30:00.000Z"),
      toMs: utc("2026-07-27T10:00:00.000Z"),
    });
    const epoch = String(utc("2026-07-27T00:00:00.000Z"));
    expect(resolveRange(epoch, undefined, NOW, UTC)?.fromMs).toBe(Number(epoch));
  });

  it("a zone-less ISO instant anchors in the RANGE timezone, never the machine's", () => {
    // 09:30 wall-clock in Sydney (AEST, +10) = 23:30Z the previous day.
    expect(resolveRange("2026-08-05T09:30:00", undefined, NOW, "Australia/Sydney")?.fromMs).toBe(
      utc("2026-08-04T23:30:00.000Z"),
    );
  });

  it("an ISO day anchors at midnight in the range timezone", () => {
    expect(resolveRange("2026-08-05", undefined, NOW, "Australia/Sydney")?.fromMs).toBe(
      utc("2026-08-04T14:00:00.000Z"), // midnight AEST = 14:00Z the day before
    );
  });
});

describe("resolveRange — window tokens", () => {
  it("today / yesterday / tomorrow are whole days, `to` exclusive", () => {
    expect(resolveRange("today", undefined, NOW, UTC)).toEqual({
      fromMs: utc("2026-08-05T00:00:00.000Z"),
      toMs: utc("2026-08-06T00:00:00.000Z"),
    });
    expect(resolveRange("yesterday", undefined, NOW, UTC)).toEqual({
      fromMs: utc("2026-08-04T00:00:00.000Z"),
      toMs: utc("2026-08-05T00:00:00.000Z"),
    });
    expect(resolveRange("tomorrow", undefined, NOW, UTC)).toEqual({
      fromMs: utc("2026-08-06T00:00:00.000Z"),
      toMs: utc("2026-08-07T00:00:00.000Z"),
    });
  });

  it("this-week starts Monday; last-week is the previous Monday-start week", () => {
    expect(resolveRange("this-week", undefined, NOW, UTC)).toEqual({
      fromMs: utc("2026-08-03T00:00:00.000Z"),
      toMs: utc("2026-08-10T00:00:00.000Z"),
    });
    expect(resolveRange("last-week", undefined, NOW, UTC)).toEqual({
      fromMs: utc("2026-07-27T00:00:00.000Z"),
      toMs: utc("2026-08-03T00:00:00.000Z"),
    });
  });

  it("this-month / this-quarter (Jan/Apr/Jul/Oct) / this-year are whole calendar periods", () => {
    expect(resolveRange("this-month", undefined, NOW, UTC)).toEqual({
      fromMs: utc("2026-08-01T00:00:00.000Z"),
      toMs: utc("2026-09-01T00:00:00.000Z"),
    });
    expect(resolveRange("this-quarter", undefined, NOW, UTC)).toEqual({
      fromMs: utc("2026-07-01T00:00:00.000Z"),
      toMs: utc("2026-10-01T00:00:00.000Z"),
    });
    expect(resolveRange("this-year", undefined, NOW, UTC)).toEqual({
      fromMs: utc("2026-01-01T00:00:00.000Z"),
      toMs: utc("2027-01-01T00:00:00.000Z"),
    });
  });

  it("last-month is the PREVIOUS whole calendar month; last-1-month a trailing month ending now", () => {
    expect(resolveRange("last-month", undefined, NOW, UTC)).toEqual({
      fromMs: utc("2026-07-01T00:00:00.000Z"),
      toMs: utc("2026-08-01T00:00:00.000Z"),
    });
    expect(resolveRange("last-1-month", undefined, NOW, UTC)).toEqual({
      fromMs: utc("2026-07-05T10:30:00.000Z"),
      toMs: NOW,
    });
  });

  it("next-<unit> is the next whole period", () => {
    expect(resolveRange("next-month", undefined, NOW, UTC)).toEqual({
      fromMs: utc("2026-09-01T00:00:00.000Z"),
      toMs: utc("2026-10-01T00:00:00.000Z"),
    });
  });

  it("trailing windows: long and short spellings agree; hours are exact durations", () => {
    expect(resolveRange("last-90-days", undefined, NOW, UTC)).toEqual(
      resolveRange("last-90d", undefined, NOW, UTC),
    );
    expect(resolveRange("last-3-months", undefined, NOW, UTC)).toEqual(
      resolveRange("last-3M", undefined, NOW, UTC),
    );
    expect(resolveRange("last-6-hours", undefined, NOW, UTC)).toEqual({
      fromMs: NOW - 6 * 3_600_000,
      toMs: NOW,
    });
    expect(resolveRange("last-24-hours", undefined, NOW, UTC)?.fromMs).toBe(NOW - 24 * 3_600_000);
  });

  it("calendar-aware month clamp: last-1-month on 31 March lands on 28 February", () => {
    const mar31 = utc("2026-03-31T10:00:00.000Z");
    expect(resolveRange("last-1-month", undefined, mar31, UTC)?.fromMs).toBe(
      utc("2026-02-28T10:00:00.000Z"),
    );
  });

  it("leap day: last-1-year on 29 Feb 2028 clamps to 28 Feb 2027; this-month spans the leap Feb", () => {
    const leap = utc("2028-02-29T12:00:00.000Z");
    expect(resolveRange("last-1-year", undefined, leap, UTC)?.fromMs).toBe(
      utc("2027-02-28T12:00:00.000Z"),
    );
    expect(resolveRange("this-month", undefined, leap, UTC)).toEqual({
      fromMs: utc("2028-02-01T00:00:00.000Z"),
      toMs: utc("2028-03-01T00:00:00.000Z"),
    });
  });

  it("year boundary: last-month in January crosses into December", () => {
    const jan = utc("2026-01-15T09:00:00.000Z");
    expect(resolveRange("last-month", undefined, jan, UTC)).toEqual({
      fromMs: utc("2025-12-01T00:00:00.000Z"),
      toMs: utc("2026-01-01T00:00:00.000Z"),
    });
    expect(resolveRange("last-year", undefined, jan, UTC)).toEqual({
      fromMs: utc("2025-01-01T00:00:00.000Z"),
      toMs: utc("2026-01-01T00:00:00.000Z"),
    });
  });
});

describe("resolveRange — DST (Australia/Sydney; AEST +10 / AEDT +11)", () => {
  const SYD = "Australia/Sydney";

  it("`today` across the spring-forward day (2026-10-04) is a 23-hour window", () => {
    // Noon AEDT on the transition day (DST started 02:00 that morning).
    const now = utc("2026-10-04T01:00:00.000Z");
    const r = resolveRange("today", undefined, now, SYD);
    expect(r).toEqual({
      fromMs: utc("2026-10-03T14:00:00.000Z"), // midnight Oct 4, still AEST +10
      toMs: utc("2026-10-04T13:00:00.000Z"), // midnight Oct 5, AEDT +11
    });
    expect(r!.toMs - r!.fromMs).toBe(23 * 3_600_000);
  });

  it("now-1d preserves the wall clock across the transition (a 23-hour step)", () => {
    const now = utc("2026-10-04T00:00:00.000Z"); // Oct 4, 11:00 AEDT (DST began 02:00 that morning)
    expect(resolveRange("now-1d", undefined, now, SYD)?.fromMs).toBe(
      utc("2026-10-03T01:00:00.000Z"), // Oct 3, 11:00 AEST — 23 real hours earlier, wall clock kept
    );
  });
});

describe("resolveRange — malformed input degrades (null, never a throw)", () => {
  it.each([
    ["last-fortnight", undefined],
    ["this-month", "2026-08-03"], // a window token forbids a `to`
    ["", undefined],
    ["now-4x", undefined],
    ["2026-13-40", undefined],
    ["2026-08-03", "2026-07-01"], // inverted
    ["2026-08-03", "this-month"], // a window token is never legal in `to`
  ])("resolveRange(%j, %j) → null", (from, to) => {
    expect(resolveRange(from as string, to as string | undefined, NOW, UTC)).toBeNull();
  });

  it("an unknown timezone degrades to UTC rather than throwing", () => {
    expect(resolveRange("today", undefined, NOW, "Not/AZone")).toEqual(
      resolveRange("today", undefined, NOW, UTC),
    );
  });

  it("the default expression always resolves (the degradation target must never itself fail)", () => {
    expect(resolveRange(DEFAULT_RANGE_EXPR, undefined, NOW, UTC)).not.toBeNull();
  });
});

describe("rangeTimezone — the anchor precedence (dashboard → viewer prefs → LOCAL)", () => {
  it("the board's stated timezone wins for the WINDOW anchor", () => {
    expect(rangeTimezone("Australia/Sydney", "Asia/Saigon")).toBe("Australia/Sydney");
  });
  it("falls to the viewer's prefs timezone, then the LOCAL zone; `browser`/empty are 'no preference'", () => {
    expect(rangeTimezone(undefined, "Asia/Saigon")).toBe("Asia/Saigon");
    // THE REGRESSION (fixed 2026-08-07): this used to be UTC. It is not a labelling detail — this tz
    // decides where `today`/`this-week` TRUNCATE, so a UTC+7 viewer's `today` opened at 07:00 local.
    // Asserted against the runtime's own zone rather than a hardcoded name, so the test states the
    // RULE and travels between machines/CI.
    const local = normalizeTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    expect(rangeTimezone("", "")).toBe(local);
    expect(rangeTimezone("browser", undefined)).toBe(local);
    expect(rangeTimezone(undefined, undefined)).toBe(local);
  });
  it("an unknown zone degrades to UTC", () => {
    expect(rangeTimezone("Not/AZone", undefined)).toBe("UTC");
  });
});
