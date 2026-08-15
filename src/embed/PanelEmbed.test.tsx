// The embed's contract, pinned at the two places it can go quietly wrong:
//
//   1. It must hand the HOST's renderer the resolved cell — not draw one itself. A regression here is
//      the parallel renderer this whole tier exists to prevent, and it would look fine on screen.
//   2. A `panel.get` refusal must render DENIED, distinct from empty and from an error. The happy path
//      is identical in all three cases, which is why this is a test rather than a review note.
//
// One responsibility: assert the three input modes and the failure states.

import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KitProvider } from "../provider/KitProvider";
import { KitDeniedError } from "../client/types";
import type { KitClient } from "../client/types";
import { PanelEmbed } from "./PanelEmbed";
import { clearPanelRenderer, registerPanelRenderer } from "./panelRenderer";

function clientWith(call: KitClient["call"]): KitClient {
  return { call, loaders: {} as KitClient["loaders"], insights: {} as KitClient["insights"] };
}

function mount(ui: React.ReactNode, call: KitClient["call"] = async () => ({})) {
  return render(
    <KitProvider client={clientWith(call)} ws="acme">
      {ui}
    </KitProvider>,
  );
}

afterEach(() => clearPanelRenderer());

describe("PanelEmbed", () => {
  it("hands a ready cell straight to the host's renderer, with no fetch", async () => {
    const call = vi.fn(async () => ({}));
    const seen: unknown[] = [];
    registerPanelRenderer((req) => {
      seen.push(req);
      return <div data-testid="drawn">{String(req.cell.i)}</div>;
    });

    mount(<PanelEmbed cell={{ i: "inline-1", view: "timeseries" }} />, call);

    expect(await screen.findByTestId("drawn")).toHaveProperty("textContent", "inline-1");
    // The renderer got the workspace and the untouched cell — an embedded panel is the same panel.
    expect(seen[0]).toMatchObject({ ws: "acme", cell: { i: "inline-1", view: "timeseries" } });
    expect(call).not.toHaveBeenCalled();
  });

  it("builds a cell from a spec without fetching", async () => {
    const call = vi.fn(async () => ({}));
    registerPanelRenderer((req) => <div data-testid="drawn">{String(req.cell.view)}</div>);

    mount(<PanelEmbed id="panel:p1" spec={{ view: "stat" }} />, call);

    expect(await screen.findByTestId("drawn")).toHaveProperty("textContent", "stat");
    expect(call).not.toHaveBeenCalled();
  });

  it("fetches a library panel by id, accepting either grammar", async () => {
    const call = vi.fn(async (_tool: string, args?: Record<string, unknown>) => ({
      id: args?.id,
      title: "Curated",
      spec: { view: "barchart" },
    }));
    registerPanelRenderer((req) => <div data-testid="drawn">{String(req.cell.view)}</div>);

    mount(<PanelEmbed id="panel:curated-load" />, call);

    await waitFor(() => expect(call).toHaveBeenCalledWith("panel.get", { id: "curated-load" }));
    expect(await screen.findByTestId("drawn")).toHaveProperty("textContent", "barchart");
  });

  it("renders DENIED — not empty, not error — when the host refuses the record", async () => {
    registerPanelRenderer(() => <div data-testid="drawn" />);
    const call = async () => {
      throw new KitDeniedError("panel.get", "out_of_scope");
    };

    const { container } = mount(<PanelEmbed id="p1" />, call);

    await waitFor(() =>
      expect(container.querySelector("[data-chart-state]")?.getAttribute("data-chart-state")).toBe(
        "denied",
      ),
    );
    expect(screen.queryByTestId("drawn")).toBeNull();
    // No retry offered: a denial does not become a grant by asking again.
    expect(container.querySelector("button")).toBeNull();
  });

  it("separates an ordinary failure from a denial", async () => {
    registerPanelRenderer(() => <div />);
    const call = async () => {
      throw new Error("network down");
    };
    const { container } = mount(<PanelEmbed id="p1" />, call);
    await waitFor(() =>
      expect(container.querySelector("[data-chart-state]")?.getAttribute("data-chart-state")).toBe(
        "error",
      ),
    );
  });

  it("says so when the host registered no renderer, rather than drawing an empty box", async () => {
    const { container } = mount(<PanelEmbed cell={{ i: "x" }} />);
    await waitFor(() => expect(container.querySelector("[data-chart-state]")).toBeTruthy());
    expect(screen.getByText(/no panel renderer registered/i)).toBeTruthy();
  });
});
