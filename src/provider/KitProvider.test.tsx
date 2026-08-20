// The provider is the kit's only injection point, so what is asserted here is what a host may rely on:
// the injections arrive, the zone default is the browser's (never a silent UTC), and a surface mounted
// outside the provider FAILS LOUDLY rather than rendering an empty state that looks like "no data".

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { makeKitClient } from "../client/makeKitClient";
import {
  browserZone,
  KitProvider,
  useKit,
  useKitOptional,
  useKitWs,
  useKitZone,
  usePortalContainer,
} from "./KitProvider";

const client = makeKitClient(async () => ({}));

function ShowsWs() {
  return <span data-testid="ws">{useKitWs()}</span>;
}

function ShowsZone() {
  return <span data-testid="zone">{useKitZone()()}</span>;
}

describe("KitProvider", () => {
  it("threads the workspace to the subtree", () => {
    render(
      <KitProvider client={client} ws="acme">
        <ShowsWs />
      </KitProvider>,
    );
    expect(screen.getByTestId("ws").textContent).toBe("acme");
  });

  it("defaults the zone to the browser's, not UTC", () => {
    const real = Intl.DateTimeFormat().resolvedOptions().timeZone;
    render(
      <KitProvider client={client} ws="acme">
        <ShowsZone />
      </KitProvider>,
    );
    expect(screen.getByTestId("zone").textContent).toBe(real);
  });

  it("takes an injected zone — the replacement for the shell's preferredZone()", () => {
    render(
      <KitProvider client={client} ws="acme" zone={() => "Australia/Sydney"}>
        <ShowsZone />
      </KitProvider>,
    );
    expect(screen.getByTestId("zone").textContent).toBe("Australia/Sydney");
  });

  it("exposes the client and theme", () => {
    function Probe() {
      const kit = useKit();
      return <span data-testid="probe">{`${kit.client === client}:${kit.theme?.accent}`}</span>;
    }
    render(
      <KitProvider client={client} ws="acme" theme={{ accent: "#0af" }}>
        <Probe />
      </KitProvider>,
    );
    expect(screen.getByTestId("probe").textContent).toBe("true:#0af");
  });

  it("THROWS outside a provider — a kit surface with no client has no honest render", () => {
    function Bare() {
      useKit();
      return null;
    }
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Bare />)).toThrow(/no <KitProvider>/);
    quiet.mockRestore();
  });

  it("useKitOptional degrades to null instead of throwing", () => {
    function Bare() {
      return <span data-testid="opt">{String(useKitOptional())}</span>;
    }
    render(<Bare />);
    expect(screen.getByTestId("opt").textContent).toBe("null");
  });
});

describe("browserZone", () => {
  it("falls back to UTC only when the platform will not answer", () => {
    const real = Intl.DateTimeFormat;
    // @ts-expect-error — deliberately break the platform API
    Intl.DateTimeFormat = () => {
      throw new Error("no ICU");
    };
    expect(browserZone()).toBe("UTC");
    Intl.DateTimeFormat = real;
  });

  // The portal container. Overlay content (dropdowns, popovers, sheets, tooltips) portals to
  // `document.body` by default, which inside an extension is OUTSIDE `[data-ext-root]` — so none of
  // the ext's scoped utilities match and the overlay renders unstyled. The host injects the scoped
  // root here and the kit's primitives default their Radix `container` to it.
  describe("portalContainer", () => {
    function ShowsContainer() {
      const c = usePortalContainer();
      return <span data-testid="c">{c ? c.getAttribute("data-ext-root") ?? "el" : "null"}</span>;
    }

    it("hands the injected container to the kit's primitives", () => {
      const root = document.createElement("div");
      root.setAttribute("data-ext-root", "esr");
      render(
        <KitProvider client={client} ws="nube" portalContainer={root}>
          <ShowsContainer />
        </KitProvider>,
      );
      expect(screen.getByTestId("c").textContent).toBe("esr");
    });

    it("defaults to null so the shell keeps Radix's own container", () => {
      // The host has no `[data-ext-root]` scoping, so `document.body` is correct there. `null` is
      // exactly what Radix reads as "use the default", which is why absent must not mean "throw".
      render(
        <KitProvider client={client} ws="nube">
          <ShowsContainer />
        </KitProvider>,
      );
      expect(screen.getByTestId("c").textContent).toBe("null");
    });

    it("returns null OUTSIDE a provider rather than throwing", () => {
      // Unlike `useKit`, this must degrade: a tooltip or dropdown has to render in a story or a bare
      // test. Losing the scope there costs styling; throwing costs the page.
      render(<ShowsContainer />);
      expect(screen.getByTestId("c").textContent).toBe("null");
    });
  });
});
