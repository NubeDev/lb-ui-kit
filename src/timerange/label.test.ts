// Picker-label cases (relative-time-range scope, build item 4): a token names itself — no more
// reverse-lookup by re-resolving presets — and absolute pairs read as the literal dates.

import { describe, expect, it } from "vitest";

import { labelOf, shortLabelOf } from "./label";

describe("labelOf", () => {
  it.each([
    ["today", "Today"],
    ["yesterday", "Yesterday"],
    ["tomorrow", "Tomorrow"],
    ["this-month", "This month"],
    ["this-quarter", "This quarter"],
    ["this-year", "This year"],
    ["last-month", "Last month"], // the previous whole calendar month …
    ["last-1-month", "Last 1 month"], // … labelled apart from the trailing month (scope decision 1)
    ["last-week", "Last week"],
    ["next-week", "Next week"],
    ["last-3-months", "Last 3 months"],
    ["last-90-days", "Last 90 days"],
    ["last-90d", "Last 90 days"], // the short spelling reads the same
    ["last-6-hours", "Last 6 hours"],
    ["last-24-hours", "Last 24 hours"],
    ["last-2-years", "Last 2 years"],
  ])("labelOf(%j) → %j", (expr, label) => {
    expect(labelOf(expr)).toBe(label);
  });

  it("an absolute pair reads as the literal dates; a lone endpoint ends at now", () => {
    expect(labelOf("2026-07-27", "2026-08-03")).toBe("2026-07-27 → 2026-08-03");
    expect(labelOf("now-4h")).toBe("now-4h → now");
    expect(labelOf("now")).toBe("Now");
  });

  it("never throws on garbage — prints the URL's own words", () => {
    expect(labelOf("last-fortnight")).toBe("last-fortnight → now");
    expect(labelOf("garbage", "more")).toBe("garbage → more");
  });
});

describe("shortLabelOf (phone width)", () => {
  // The day parts are formatted in the VIEWER's locale (`toLocaleDateString(undefined, …)`), which is
  // the intended product behaviour — an en-AU user reads "26 June", an en-US user reads "Jun 26". So
  // the assertion here is the locale-INVARIANT contract: the year is dropped and the two endpoints are
  // joined by an en-dash. Pinning the US spelling literally is what made this fail for every developer
  // and CI runner outside en-US.
  it("compresses an ISO-day pair to a year-less range", () => {
    const label = shortLabelOf("2026-06-26", "2026-07-26");
    const [from, to] = label.split(" – ");
    expect(to).toBeDefined();
    // Both endpoints render, neither carries the (redundant, shared) year.
    for (const part of [from, to]) {
      expect(part).not.toContain("2026");
      expect(part).toMatch(/\d/);
    }
    // The month distinguishes them — a range that collapsed to one month would be the real bug.
    expect(from).not.toBe(to);
  });

  it("formats the day parts in the ambient locale", () => {
    // The exact spelling is the platform's to decide, so it is derived from the same locale the
    // function resolves rather than hard-coded — that keeps the test honest on any machine while
    // still pinning that `shortLabelOf` uses a short month + numeric day (not, say, an ISO passthrough).
    const fmt = new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
    const expected = `${fmt.format(new Date("2026-06-26T00:00:00Z"))} – ${fmt.format(
      new Date("2026-07-26T00:00:00Z"),
    )}`;
    expect(shortLabelOf("2026-06-26", "2026-07-26")).toBe(expected);
  });

  it("leaves tokens as their own short labels", () => {
    expect(shortLabelOf("last-30-days")).toBe("Last 30 days");
    expect(shortLabelOf("this-month")).toBe("This month");
  });
});
