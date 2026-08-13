// The named quick ranges behind the toolbar's range picker — `{ id, label, expr }` ROWS arranged
// into a BAND × COLUMN grid (quick-range-taxonomy amendment to the relative-time-range scope).
// A preset does not resolve dates at click time: the picker commits the EXPRESSION itself
// (`?from=this-month`, one URL param) and the shared `lib/timerange` twin resolves it, live, every
// time it is read. That is what un-freezes a bookmarked "Last 7 days" — a token names itself, so
// `labelOf` reads the label straight off the expression rather than reverse-resolving a date pair.
//
// The grid's axes are the two things a reader actually has to tell apart:
//   - BAND (row) — TRAILING windows end at *now*; CALENDAR windows are a whole clock/calendar period.
//     `Last 60 minutes` and `Last hour` are NOT the same window, and they sit one band apart in the
//     same column so the headings do that explaining instead of a tooltip.
//   - COLUMN — the unit the window is counted in (minutes → years), so a longer window is always
//     further right and adding one later is dropping a row into a cell.
//
// `to` stays EXCLUSIVE and is simply ABSENT for every preset — a window token forbids one, and a
// trailing window ends at now.

import { labelOf } from "../timerange";

export interface RangePreset {
  /** Stable id (the shipped ids where one existed — callers/tests key on these). */
  id: string;
  /** The label the user reads — `labelOf(expr)`, precomputed so the popover renders a plain list. */
  label: string;
  /** The range expression the picker COMMITS to the URL (`?from=<expr>`). */
  expr: string;
}

/** The unit columns, left to right. One heading per column, shared by both bands. */
export const RANGE_COLUMNS = ["Minutes", "Hours", "Days", "Months", "Years"] as const;
export type RangeColumn = (typeof RANGE_COLUMNS)[number];

/** A band = one row of the grid: trailing (ends now) or calendar (a whole period). */
export interface RangeBand {
  id: "trailing" | "calendar";
  /** The band heading. */
  label: string;
  /** The distinction the heading is carrying — rendered small, under the label. */
  hint: string;
  /** Column heading → the presets in that cell, top to bottom. A cell may be EMPTY. */
  cells: Record<RangeColumn, RangePreset[]>;
}

const row = (id: string, expr: string): RangePreset => ({ id, label: labelOf(expr), expr });

export const RANGE_BANDS: RangeBand[] = [
  {
    id: "trailing",
    label: "Trailing",
    hint: "ends now",
    cells: {
      Minutes: [
        row("last-5m", "last-5-minutes"),
        row("last-15m", "last-15-minutes"),
        row("last-30m", "last-30-minutes"),
        row("last-60m", "last-60-minutes"),
      ],
      Hours: [
        row("last-3h", "last-3-hours"),
        row("last-6h", "last-6-hours"),
        row("last-12h", "last-12-hours"),
        row("last-24h", "last-24-hours"),
      ],
      Days: [
        row("last-7d", "last-7-days"),
        row("last-14d", "last-14-days"),
        row("last-30d", "last-30-days"),
        // Kept alongside `last-3-months` on purpose: 90 fixed days is what people type, 3 calendar
        // months is what a report schedule wants. Different columns, so the difference is visible.
        row("last-90d", "last-90-days"),
      ],
      Months: [
        row("last-2mo", "last-2-months"),
        row("last-3mo", "last-3-months"),
        row("last-6mo", "last-6-months"),
        row("last-12mo", "last-12-months"),
      ],
      // No `last-1-year`: it resolves IDENTICALLY to `last-12-months` one column left, and two
      // adjacent buttons for one window is a question the reader has to stop and answer. Nothing at
      // 5y either — series retention has GC'd it, so the click returns an empty chart, not an error.
      Years: [row("last-2y", "last-2-years"), row("last-3y", "last-3-years")],
    },
  },
  {
    id: "calendar",
    label: "Calendar",
    hint: "whole period",
    cells: {
      // No "this minute" — nobody reaches for it, and an empty cell is information, not a gap.
      Minutes: [],
      Hours: [row("this-hour", "this-hour"), row("last-hour", "last-hour")],
      Days: [
        row("today", "today"),
        row("yesterday", "yesterday"),
        row("this-week", "this-week"),
        row("last-week", "last-week"),
      ],
      Months: [
        row("this-month", "this-month"),
        row("last-month", "last-month"),
        row("this-quarter", "this-quarter"),
        row("last-quarter", "last-quarter"),
      ],
      Years: [row("this-year", "this-year"), row("last-year", "last-year")],
    },
  },
];

/** Every preset, flat — the roster callers outside the picker (and the tests) read. Grid order:
 *  band by band, column by column, so the reading order matches what the popover paints. */
export const RANGE_PRESETS: RangePreset[] = RANGE_BANDS.flatMap((band) =>
  RANGE_COLUMNS.flatMap((col) => band.cells[col]),
);
