// The share bar's two load-bearing properties: proportions are computed against the SHOWN total (so a
// zero segment does not steal width), and the bar is silent to a screen reader unless it is the only
// rendering of its figures.
//
// One responsibility: pin the proportion maths and the a11y default.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShareBar } from "./ShareBar";

const seg = (key: string, value: number) => ({ key, value, color: "hsl(1, 2%, 3%)" });

describe("ShareBar", () => {
  it("splits the width by share and drops empty segments entirely", () => {
    const { container } = render(
      <ShareBar segments={[seg("live", 25), seg("silent", 75), seg("never", 0)]} />,
    );
    const parts = [...container.querySelectorAll<HTMLElement>("[data-share-key]")];
    expect(parts.map((p) => p.dataset.shareKey)).toEqual(["live", "silent"]);
    expect(parts[0].style.width).toBe("25%");
    expect(parts[1].style.width).toBe("75%");
  });

  it("renders nothing but the track when every value is zero — never one segment owning the bar", () => {
    const { container } = render(<ShareBar segments={[seg("a", 0), seg("b", 0)]} />);
    expect(container.querySelectorAll("[data-share-key]")).toHaveLength(0);
  });

  it("is aria-hidden by default (the numbers are text beside it) and described when asked", () => {
    const { container, rerender } = render(<ShareBar segments={[seg("a", 1)]} />);
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");

    rerender(<ShareBar segments={[seg("a", 1)]} label="coverage" />);
    expect(screen.getByRole("img", { name: "coverage" })).toBeTruthy();
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBeNull();
  });

  it("takes a CLASS for its colour — a DOM bar follows a re-theme through the cascade, for free", () => {
    // The point of this over a resolved colour string: no `getComputedStyle`, and no per-bar
    // MutationObserver watching the theme. Thirty roster rows must not mean thirty observers either.
    const { container } = render(
      <ShareBar segments={[{ key: "live", value: 1, className: "bg-success" }]} />,
    );
    const seg = container.querySelector<HTMLElement>('[data-share-key="live"]');
    expect(seg?.className).toContain("bg-success");
    expect(seg?.style.backgroundColor).toBe("");
  });

  it("hatches a segment so two categories stay separable without colour", () => {
    const { container } = render(
      <ShareBar segments={[{ ...seg("never", 1), hatch: true }, seg("dark", 1)]} />,
    );
    const hatched = container.querySelector<HTMLElement>('[data-share-key="never"]');
    expect(hatched?.style.backgroundImage).toContain("repeating-linear-gradient");
  });
});
