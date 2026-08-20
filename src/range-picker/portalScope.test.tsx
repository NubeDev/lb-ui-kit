// The popover's CSS scope, pinned at the two places it silently broke.
//
// The kit compiles its utilities as `.dash-kit .p-4` — a DESCENDANT selector. So a utility written
// beside the scope class on ONE element matches nothing at all. The range picker did exactly that
// (`className="dash-kit max-w-… p-0 w-[42rem]"`), which is invisible in review and produces no error:
// the popover still had a background, because that rule comes from an ancestor, while its width and
// padding silently dropped — a full-width sheet across the page.
//
// Asserted on the rendered DOM rather than on the class string, so it stays true if the markup moves.

import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DashboardRangePicker } from "./DashboardRangePicker";

/** Open the picker and return its portalled content. A real pointer interaction, not `.click()`:
 *  Radix opens on pointerdown, which a bare DOM click does not produce. */
async function openPicker(): Promise<HTMLElement> {
  render(<DashboardRangePicker from="now-30d" onApply={() => {}} />);
  await userEvent.click(screen.getAllByRole("button")[0]);
  return await waitFor(() => {
    const el = document.querySelector<HTMLElement>("[data-slot='dropdown-menu-content']");
    if (!el) throw new Error("popover did not open");
    return el;
  });
}

describe("range-picker popover keeps its CSS scope", () => {
  it("puts the scope class on the content, not only the trigger", async () => {
    // The content is portalled OUT of the trigger's subtree, so a scope class on the trigger alone
    // leaves every utility in the popover unmatched.
    const content = await openPicker();
    expect(content.className).toContain("dash-kit");
  });

  it("never puts a sizing utility on the SAME element as the scope class", async () => {
    // THE regression. `.dash-kit .w-[42rem]` cannot match `class="dash-kit w-[42rem]"`, so any
    // width/padding utility must live on a wrapper INSIDE the scope element.
    const content = await openPicker();
    const cls = content.className;
    // These are the utilities that were silently dead. None may sit beside `dash-kit`.
    for (const dead of ["w-[42rem]", "w-[calc(100vw-2rem)]", "max-w-[calc(100vw-2rem)]"]) {
      expect(cls, `"${dead}" is on the scope element, where it cannot match`).not.toContain(dead);
    }
  });

  it("carries the width on a wrapper inside the scope element", async () => {
    // The other half: having removed it from the scope element, it must actually exist somewhere —
    // otherwise the popover is merely broken in a new way.
    const content = await openPicker();
    // Walked rather than queried: an attribute selector containing `[` needs escaping and reads worse
    // than the scan it replaces.
    const sized = Array.from(content.querySelectorAll("*")).find((el) =>
      /w-\[(42rem|calc\(100vw-2rem\))\]/.test(el.className.toString()),
    );
    expect(sized, "no sized wrapper inside the popover").toBeDefined();
  });
});
