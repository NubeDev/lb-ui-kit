// The regression this pins shipped once and was invisible to every unit test: our design tokens are
// CSS Color 4 space-separated HSL triplets, and echarts' own color parser (zrender) understands only
// the LEGACY comma form. A space-separated `hsl(258 88% 70%)` parses as null there and every mark
// paints black — on a canvas jsdom never rasterises.
//
// One responsibility: assert the token bridge emits a zrender-parseable color.

import { afterEach, describe, expect, it, vi } from "vitest";

import { tokenColor } from "./echartsTheme";

function withToken(value: string) {
  vi.spyOn(window, "getComputedStyle").mockReturnValue({
    getPropertyValue: () => value,
  } as unknown as CSSStyleDeclaration);
}

afterEach(() => vi.restoreAllMocks());

describe("tokenColor", () => {
  it("emits the COMMA form echarts can parse, not the space-separated token", () => {
    withToken("258 88% 70%");
    expect(tokenColor("--chart-1")).toBe("hsl(258, 88%, 70%)");
  });

  it("emits hsla for a translucent color", () => {
    withToken("217 14% 21%");
    expect(tokenColor("--border", 0.38)).toBe("hsla(217, 14%, 21%, 0.38)");
  });

  it("accepts a token already written with commas", () => {
    withToken("197, 85%, 60%");
    expect(tokenColor("--chart-4")).toBe("hsl(197, 85%, 60%)");
  });

  it("falls back to a concrete grey when the token is missing (jsdom/SSR), never an unparseable string", () => {
    withToken("");
    expect(tokenColor("--nope")).toBe("hsl(215, 16%, 60%)");
  });

  it("never returns a bare space-separated triplet — the black-canvas shape", () => {
    for (const raw of ["258 88% 70%", "", "197, 85%, 60%"]) {
      withToken(raw);
      expect(tokenColor("--x")).toMatch(/^hsl\(\d+(\.\d+)?, /);
    }
  });
});
