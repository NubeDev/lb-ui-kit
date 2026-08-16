// What the wrapper promises when there is no canvas — which is every headless test, and is exactly
// where a canvas-backed chart normally goes untestable.
//
// The contract: the container and the visually-hidden `summary` are in the DOM regardless, `init` is
// allowed to throw, and nothing crashes. That contract is what makes the CANVAS renderer affordable —
// the alternative (ship SVG so jsdom can see the marks) buys a test target for the marks and gives up
// the renderer that scales past a few thousand of them.
//
// Also pinned: the engine is not imported until a chart mounts. That is the "a page with no chart
// downloads no engine" promise, and it is only true while the import stays inside the effect.
//
// One responsibility: assert the wrapper's no-canvas and lazy-load contracts.

import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EChart } from "./EChart";
import { setEchartsLoader } from "./echartsLoader";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("EChart", () => {
  it("renders its summary and container even though init throws under jsdom", async () => {
    const loader = vi.fn(async () => ({
      init: () => {
        throw new Error("no canvas 2d context");
      },
    }));
    setEchartsLoader(loader);

    render(
      <EChart
        ariaLabel="site trend"
        option={() => ({})}
        summary={
          <ol className="sr-only" aria-label="samples">
            <li>12.5</li>
            <li>13.1</li>
          </ol>
        }
      />,
    );

    // The landmark and the readout are the contract — both present with no engine at all.
    expect(screen.getByRole("img", { name: "site trend" })).toBeTruthy();
    expect(screen.getByLabelText("samples").textContent).toContain("13.1");
    await waitFor(() => expect(loader).toHaveBeenCalled());
  });

  it("loads the engine only when a chart mounts", async () => {
    const loader = vi.fn(async () => ({ init: () => ({}) }));
    setEchartsLoader(loader);

    // A page with no chart on it.
    const { rerender } = render(<div>no chart here</div>);
    expect(loader).not.toHaveBeenCalled();

    rerender(<EChart ariaLabel="now there is one" option={() => ({})} />);
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));
  });

  it("drops the landmark under `bare` so an outer figure owns it", () => {
    setEchartsLoader(async () => ({ init: () => ({}) }));
    const { container } = render(<EChart bare ariaLabel="inner" option={() => ({})} />);
    expect(container.querySelector('[role="img"]')).toBeNull();
  });

  it("scopes itself under the kit's CSS root", () => {
    setEchartsLoader(async () => ({ init: () => ({}) }));
    const { container } = render(<EChart ariaLabel="x" option={() => ({})} />);
    expect(container.querySelector(".dash-kit")).toBeTruthy();
  });
});
