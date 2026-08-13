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
});
