// The range picker (relative-time-range scope, build item 4): quick ranges commit EXPRESSIONS (one
// URL param), the trigger label comes from `labelOf` (no reverse-lookup), and the new Relative field
// live-parses free text — a resolved preview or a red parse error, Apply gated on validity.

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DashboardRangePicker } from "./DashboardRangePicker";

afterEach(cleanup);

describe("DashboardRangePicker", () => {
  it("labels the trigger straight off the committed expression (no matchPreset reverse-lookup)", () => {
    render(<DashboardRangePicker from="this-month" onApply={() => {}} />);
    expect(screen.getByTitle("Change the dashboard time range").textContent).toContain("This month");
    cleanup();
    render(<DashboardRangePicker from="last-3-months" onApply={() => {}} />);
    expect(screen.getByTitle("Change the dashboard time range").textContent).toContain(
      "Last 3 months",
    );
    cleanup();
    // An absolute pair still reads as its dates.
    render(<DashboardRangePicker from="2026-07-27" to="2026-08-03" onApply={() => {}} />);
    expect(screen.getByTitle("Change the dashboard time range").textContent).toContain(
      "2026-07-27 → 2026-08-03",
    );
  });

  it("a quick-range click commits the EXPRESSION — one param, no resolved dates", async () => {
    const onApply = vi.fn();
    const user = userEvent.setup();
    render(<DashboardRangePicker from="last-30-days" onApply={onApply} />);
    await user.click(screen.getByTitle("Change the dashboard time range"));
    await user.click(await screen.findByText("Last month"));
    expect(onApply).toHaveBeenCalledWith({ from: "last-month" });
  });

  it("the Relative field previews a parsed expression and Apply commits it", async () => {
    const onApply = vi.fn();
    const user = userEvent.setup();
    render(<DashboardRangePicker from="last-30-days" onApply={onApply} />);
    await user.click(screen.getByTitle("Change the dashboard time range"));
    const input = await screen.findByLabelText("dashboard relative range");
    await user.clear(input);
    await user.type(input, "last-3-months");
    // The live preview names the resolved window: "last-3-months → <day> → <day>".
    const preview = await screen.findByText(/^last-3-months → \d{4}-\d{2}-\d{2} → \d{4}-\d{2}-\d{2}$/);
    expect(preview).toBeTruthy();
    await user.click(screen.getByTitle("Apply this relative range — re-queries every panel"));
    expect(onApply).toHaveBeenCalledWith({ from: "last-3-months" });
  });

  it("a parse failure shows the red error and gates Apply — never throws, never commits", async () => {
    const onApply = vi.fn();
    const user = userEvent.setup();
    render(<DashboardRangePicker from="last-30-days" onApply={onApply} />);
    await user.click(screen.getByTitle("Change the dashboard time range"));
    const input = await screen.findByLabelText("dashboard relative range");
    await user.clear(input);
    await user.type(input, "last-fortnight");
    expect(await screen.findByText(/Not a range expression/)).toBeTruthy();
    const apply = screen.getByTitle("Apply this relative range — re-queries every panel");
    expect((apply as HTMLButtonElement).disabled).toBe(true);
    expect(onApply).not.toHaveBeenCalled();
  });
});
