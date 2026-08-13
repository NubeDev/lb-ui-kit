// The quick-range rows (relative-time-range scope, build item 5; quick-range-taxonomy amendment):
// presets are `{ id, label, expr }` data arranged into a BAND × UNIT grid — the picker commits the
// EXPRESSION and the shared lib resolves it. These tests pin (1) the roster (every shipped id
// survives the regrid, plus the sub-hour rows), (2) that every expression actually resolves through
// the shared resolver, (3) the grid's shape and the deliberate empty cells, (4) that the two bands
// really do mean different things, and (5) the semantics the old resolve-at-click presets owned:
// exclusive `to` (a zero-width "Today" would draw nothing) and Monday-start weeks.

import { describe, expect, it } from "vitest";

import { RANGE_BANDS, RANGE_COLUMNS, RANGE_PRESETS } from "./rangePresets";
import { labelOf, resolveRange } from "../timerange";

const NOW = Date.parse("2026-08-05T10:30:00.000Z"); // a Wednesday

describe("RANGE_PRESETS", () => {
  it("keeps every shipped id through the regrid", () => {
    const ids = RANGE_PRESETS.map((p) => p.id);
    for (const shipped of [
      "today",
      "yesterday",
      "last-6h",
      "last-24h",
      "last-7d",
      "last-30d",
      "last-90d",
      "this-week",
      "last-week",
      "this-month",
      "last-month",
      "this-year",
      "last-year",
    ]) {
      expect(ids).toContain(shipped);
    }
  });

  it("adds the sub-hour windows a live board needs", () => {
    const ids = RANGE_PRESETS.map((p) => p.id);
    for (const added of ["last-5m", "last-15m", "last-30m", "last-60m", "this-hour", "last-hour"]) {
      expect(ids).toContain(added);
    }
  });

  it("has no duplicate id and no duplicate expression (one window, one button)", () => {
    const ids = RANGE_PRESETS.map((p) => p.id);
    const exprs = RANGE_PRESETS.map((p) => p.expr);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(exprs).size).toBe(exprs.length);
  });

  it("never offers `last-1-year` beside `last-12-months` — they resolve identically", () => {
    const exprs = RANGE_PRESETS.map((p) => p.expr);
    expect(exprs).toContain("last-12-months");
    expect(exprs).not.toContain("last-1-year");
    // The reason, asserted rather than trusted: the two are the same window.
    const a = resolveRange("last-12-months", undefined, NOW, "UTC")!;
    const b = resolveRange("last-1-year", undefined, NOW, "UTC")!;
    expect(a).toEqual(b);
  });

  it("every preset expression resolves through the shared lib and labels itself", () => {
    for (const p of RANGE_PRESETS) {
      expect(resolveRange(p.expr, undefined, NOW, "UTC"), p.expr).not.toBeNull();
      expect(p.label).toBe(labelOf(p.expr));
    }
  });

  it("Today is a whole exclusive-to day (never the zero-width window that draws nothing)", () => {
    const today = RANGE_PRESETS.find((p) => p.id === "today")!;
    const r = resolveRange(today.expr, undefined, NOW, "UTC")!;
    expect(r.fromMs).toBe(Date.parse("2026-08-05T00:00:00.000Z"));
    expect(r.toMs).toBe(Date.parse("2026-08-06T00:00:00.000Z"));
  });

  it("This week starts Monday (the calendar the picker paints)", () => {
    const week = RANGE_PRESETS.find((p) => p.id === "this-week")!;
    const r = resolveRange(week.expr, undefined, NOW, "UTC")!;
    expect(r.fromMs).toBe(Date.parse("2026-08-03T00:00:00.000Z")); // Monday
    expect(r.toMs).toBe(Date.parse("2026-08-10T00:00:00.000Z"));
  });

  it("the flat roster is exactly the grid, in reading order", () => {
    const fromGrid = RANGE_BANDS.flatMap((b) => RANGE_COLUMNS.flatMap((c) => b.cells[c]));
    expect(RANGE_PRESETS).toEqual(fromGrid);
  });

  it("every trailing cell holds four rows except Years, which is deliberately short", () => {
    const trailing = RANGE_BANDS.find((b) => b.id === "trailing")!;
    for (const col of ["Minutes", "Hours", "Days", "Months"] as const) {
      expect(trailing.cells[col], col).toHaveLength(4);
    }
    // Two, not four: `last-1-year` duplicates `last-12-months` and 5y is past retention.
    expect(trailing.cells.Years).toHaveLength(2);
  });

  it("the calendar band has no Minutes cell (nobody reaches for `this minute`)", () => {
    const calendar = RANGE_BANDS.find((b) => b.id === "calendar")!;
    expect(calendar.cells.Minutes).toHaveLength(0);
  });

  it("a trailing window ends at now; a calendar window of the same unit does not", () => {
    // The pair the two-band layout exists to disambiguate, asserted as different windows.
    const trailing = resolveRange("last-60-minutes", undefined, NOW, "UTC")!;
    const calendar = resolveRange("last-hour", undefined, NOW, "UTC")!;
    expect(trailing.toMs).toBe(NOW); // ends now
    expect(calendar.toMs).toBe(Date.parse("2026-08-05T10:00:00.000Z")); // the whole 09:00–10:00 hour
    expect(calendar.fromMs).toBe(Date.parse("2026-08-05T09:00:00.000Z"));
    expect(trailing.fromMs).not.toBe(calendar.fromMs);
  });

  it("Last month is the previous CALENDAR month — distinct from a trailing last-1-month", () => {
    const lastMonth = RANGE_PRESETS.find((p) => p.id === "last-month")!;
    expect(lastMonth.expr).toBe("last-month");
    expect(lastMonth.label).toBe("Last month");
    const r = resolveRange(lastMonth.expr, undefined, NOW, "UTC")!;
    expect(r.fromMs).toBe(Date.parse("2026-07-01T00:00:00.000Z"));
    expect(r.toMs).toBe(Date.parse("2026-08-01T00:00:00.000Z"));
  });
});
