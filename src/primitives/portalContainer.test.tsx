// The portal-container contract, asserted on REAL Radix content rather than on the hook alone.
//
// This is the bug's actual shape: a dropdown's content renders through a portal, Radix sends it to
// `document.body` by default, and inside an extension that is OUTSIDE `[data-ext-root]` — so every
// utility the ext compiled (`[data-ext-root] :is(.dash-kit .p-0)`) fails to match and the popover
// renders with no width, no background and no padding. Nothing throws, which is why it survived.
//
// Asserting on the hook only would have missed the real defect: `DropdownMenuContent` rendered the
// RAW `DropdownMenuPrimitive.Portal`, bypassing the wrapper that carries the default.

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { makeKitClient } from "../client/makeKitClient";
import { KitProvider } from "../provider/KitProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const client = makeKitClient(async () => ({}));

/** An open menu, so its portalled content is in the DOM to inspect. */
function OpenMenu() {
  return (
    <DropdownMenu open>
      <DropdownMenuTrigger>open</DropdownMenuTrigger>
      <DropdownMenuContent className="dash-kit">
        <DropdownMenuItem>
          <span data-testid="item">Last 30 days</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("overlay content portals into the kit's container", () => {
  it("lands INSIDE the ext's scoped root when one is injected", () => {
    // The scoped root, as `mountScoped` builds it.
    const extRoot = document.createElement("div");
    extRoot.setAttribute("data-ext-root", "esr");
    document.body.appendChild(extRoot);

    render(
      <KitProvider client={client} ws="nube" portalContainer={extRoot}>
        <OpenMenu />
      </KitProvider>,
      { container: document.body.appendChild(document.createElement("div")) },
    );

    const item = screen.getByTestId("item");
    // THE assertion. Without the container the item's closest ext root is null, and every
    // `[data-ext-root]`-scoped rule misses it.
    expect(item.closest("[data-ext-root]")).toBe(extRoot);

    extRoot.remove();
  });

  it("falls back to Radix's own container in the shell (no injection)", () => {
    // The host has no `[data-ext-root]` scoping, so `document.body` is the right place and the kit
    // must not force a container it was never given.
    render(
      <KitProvider client={client} ws="nube">
        <OpenMenu />
      </KitProvider>,
    );
    expect(screen.getByTestId("item").closest("[data-ext-root]")).toBeNull();
  });

  it("an explicit container prop still wins over the injected default", () => {
    const injected = document.createElement("div");
    injected.setAttribute("data-ext-root", "esr");
    document.body.appendChild(injected);
    const explicit = document.createElement("div");
    explicit.setAttribute("data-explicit", "1");
    document.body.appendChild(explicit);

    render(
      <KitProvider client={client} ws="nube" portalContainer={injected}>
        <DropdownMenu open>
          <DropdownMenuTrigger>open</DropdownMenuTrigger>
          <DropdownMenuContent container={explicit}>
            <DropdownMenuItem>
              <span data-testid="explicit-item">x</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </KitProvider>,
    );

    expect(screen.getByTestId("explicit-item").closest("[data-explicit]")).toBe(explicit);
    injected.remove();
    explicit.remove();
  });
});
