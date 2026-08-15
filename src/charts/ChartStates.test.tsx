// The honesty invariant, pinned. `denied` ≠ `error` ≠ `empty` ≠ `table-only` ≠ `loading` must be
// distinguishable at the DOM level — not merely differently worded — because that is what makes them
// distinguishable on screen. A regression here reads as "the panel is empty" over a capability refusal,
// which is the failure the whole tier exists to refuse.
//
// One responsibility: assert the five states are separable, and that none of them offers a retry.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChartState, type ChartStateTone } from "./ChartStates";

const TONES: ChartStateTone[] = ["loading", "denied", "error", "empty", "table-only"];

describe("ChartState", () => {
  it("marks every tone distinctly, with its own copy and its own glyph", () => {
    const titles = new Set<string>();
    const glyphs = new Set<string>();
    for (const tone of TONES) {
      const { container, unmount } = render(<ChartState tone={tone} />);
      const node = container.querySelector<HTMLElement>("[data-chart-state]");
      expect(node?.dataset.chartState).toBe(tone);
      titles.add(node?.querySelector("p")?.textContent ?? "");
      // lucide stamps its icon name onto the svg's class list, so this is the drawn glyph, not a proxy.
      glyphs.add(node?.querySelector("svg")?.getAttribute("class") ?? "");
      unmount();
    }
    // Five states, five headlines, five glyphs — no two collapse into each other.
    expect(titles.size).toBe(TONES.length);
    expect(glyphs.size).toBe(TONES.length);
  });

  it("gives the two states an operator must ACT on their own colour chrome", () => {
    // `denied` (ask for a grant) and `error` (something broke) send a reader to two different places,
    // so neither may look like the quiet neutral states.
    const wrapOf = (tone: ChartStateTone) => {
      const { container, unmount } = render(<ChartState tone={tone} />);
      const cls = container.querySelector<HTMLElement>("[data-chart-state]")?.className ?? "";
      unmount();
      return cls;
    };
    const denied = wrapOf("denied");
    const error = wrapOf("error");
    const empty = wrapOf("empty");
    expect(denied).not.toBe(error);
    expect(denied).not.toBe(empty);
    expect(error).not.toBe(empty);
  });

  it("says WHY on a denial rather than calling it empty", () => {
    render(<ChartState tone="denied" />);
    expect(screen.getByText(/no access/i)).toBeTruthy();
    expect(screen.queryByText(/no data/i)).toBeNull();
  });

  it("never offers a retry — a denial does not become a grant by asking again", () => {
    for (const tone of TONES) {
      const { container, unmount } = render(<ChartState tone={tone} />);
      expect(container.querySelector("button")).toBeNull();
      expect(container.textContent?.toLowerCase()).not.toContain("retry");
      unmount();
    }
  });

  it("keeps the tone's chrome while letting the caller own the words", () => {
    render(<ChartState tone="denied" title="No access to sites" detail="Ask an admin for assets.list" />);
    expect(screen.getByText("No access to sites")).toBeTruthy();
    expect(screen.getByText(/assets.list/)).toBeTruthy();
  });

  it("announces politely — a state change is news, not an interruption", () => {
    render(<ChartState tone="empty" />);
    const node = screen.getByRole("status");
    expect(node.getAttribute("aria-live")).toBe("polite");
  });

  it("scopes itself under the kit's CSS root so no rule can match a host element", () => {
    const { container } = render(<ChartState tone="empty" />);
    expect(container.querySelector(".dash-kit")).toBeTruthy();
  });
});
