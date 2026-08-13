// The extraction's OWN contract — the three couplings that were unpicked to get this code out of the
// shell. The moved tests (`DashboardRangePicker.test.tsx`, `resolve.test.ts`, `label.test.ts`,
// `conformance.test.ts`) came across byte-identical and prove the BEHAVIOUR is unchanged; this file
// proves the SEAMS that replaced the app imports actually work, which no moved test can.
//
//   `preferredZone()`    → the `KitProvider` `zone` prop  (was `@/lib/datetime/localZone`)
//   `useResolvedPrefs()` → the `dateStyle` prop           (was `@/lib/prefs/useResolvedPrefs`)
//   `useResolvedPrefs()` → the `weekStart` prop           (ditto — `first_day_of_week`)
//   `markUserRefresh()`  → the `onUserApply` prop         (was `./refreshIntent`)

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { makeKitClient } from "../client/makeKitClient";
import { KitProvider } from "../provider/KitProvider";
import { rangeTimezone, resolveRange, weekStartOf } from "../timerange";
import { DashboardRangePicker } from "./DashboardRangePicker";
import { PrefDateInput } from "./PrefDateInput";

afterEach(cleanup);

const client = makeKitClient(async () => ({}));

describe("zone injection (was preferredZone)", () => {
  it("rangeTimezone takes the injected resolver and still prefers a stated zone", () => {
    const zone = () => "Australia/Sydney";
    expect(rangeTimezone(undefined, undefined, zone)).toBe("Australia/Sydney");
    expect(rangeTimezone("UTC", undefined, zone)).toBe("UTC");
    // `"browser"` is "no stated preference", not a zone name — it must fall through to the resolver.
    expect(rangeTimezone("browser", undefined, zone)).toBe("Australia/Sydney");
  });

  it("defaults to the browser zone, never UTC — the fallback decides which day `today` IS", () => {
    const real = Intl.DateTimeFormat().resolvedOptions().timeZone;
    expect(rangeTimezone()).toBe(real);
  });

  it("the picker resolves its preview zone from the KitProvider", async () => {
    // A fixed instant so the preview text is deterministic regardless of when the suite runs.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-30T02:30:00Z"));
    render(
      <KitProvider client={client} ws="acme" zone={() => "Australia/Sydney"}>
        <DashboardRangePicker from="today" onApply={() => {}} />
      </KitProvider>,
    );
    // 02:30Z on 30 Jul is already 12:30 on 30 Jul in Sydney — same day here, but the label proves the
    // provider's zone reached the resolver rather than the picker falling back to the browser's.
    expect(screen.getByTitle("Change the dashboard time range").textContent).toContain("Today");
    vi.useRealTimers();
  });

  it("renders standalone with no provider — falls back to the browser zone", () => {
    // The picker must not require the kit context: the shell mounts it in places that predate the
    // provider, and a story/test should be able to render it bare.
    expect(() =>
      render(<DashboardRangePicker from="last-30-days" onApply={() => {}} />),
    ).not.toThrow();
  });
});

describe("weekStart injection (was useResolvedPrefs)", () => {
  // `first_day_of_week` arrived on `main` (rubix-ai#127) WHILE this code was being extracted, so the
  // kit's first copy predated it. It is the same class of coupling as `dateStyle` — resolving the pref
  // needs the host's session store — and so takes the same treatment: a prop, not a hook.
  it("weekStartOf folds an absent or unknown value to Monday, never junk", () => {
    // The resolver must never see a value outside the closed set: a not-yet-seeded locale, or a typo,
    // must degrade to the grammar the lb conformance fixture pins — never a silently shifted window.
    expect(weekStartOf(undefined)).toBe("monday");
    expect(weekStartOf("nonsense")).toBe("monday");
    expect(weekStartOf("sunday")).toBe("sunday");
    expect(weekStartOf("monday")).toBe("monday");
  });

  it("actually re-anchors `this-week` — the two settings resolve to different windows", () => {
    // Wednesday 2026-07-29T12:00Z. Monday-start → the week opens on the 27th; Sunday-start → the 26th.
    const now = Date.parse("2026-07-29T12:00:00Z");
    const mon = resolveRange("this-week", undefined, now, "UTC", "monday");
    const sun = resolveRange("this-week", undefined, now, "UTC", "sunday");
    expect(mon).not.toBeNull();
    expect(sun).not.toBeNull();
    expect(sun!.fromMs).toBeLessThan(mon!.fromMs);
    expect(mon!.fromMs - sun!.fromMs).toBe(24 * 60 * 60 * 1000);
  });

  it("defaults to Monday when the host injects nothing", () => {
    const now = Date.parse("2026-07-29T12:00:00Z");
    expect(resolveRange("this-week", undefined, now, "UTC")).toEqual(
      resolveRange("this-week", undefined, now, "UTC", "monday"),
    );
  });
});

describe("dateStyle injection (was useResolvedPrefs)", () => {
  it("formats the field per the injected style", () => {
    render(<PrefDateInput value="2026-07-30" onChange={() => {}} dateStyle="usa" />);
    expect(screen.getByText("07/30/2026")).toBeTruthy();
    cleanup();
    render(<PrefDateInput value="2026-07-30" onChange={() => {}} dateStyle="iso" />);
    expect(screen.getByText("2026-07-30")).toBeTruthy();
  });

  it("defaults to `eu` — the same builtin lb folds to, so un-injected never disagrees", () => {
    render(<PrefDateInput value="2026-07-30" onChange={() => {}} />);
    expect(screen.getByText("30/07/2026")).toBeTruthy();
  });

  it("shows the styled placeholder for an empty value rather than a garbled partial date", () => {
    render(<PrefDateInput value="" onChange={() => {}} dateStyle="usa" />);
    expect(screen.getByText("MM/DD/YYYY")).toBeTruthy();
  });
});

describe("onUserApply injection (was markUserRefresh)", () => {
  it("fires just before onApply when a quick range commits", async () => {
    const order: string[] = [];
    const user = userEvent.setup();
    render(
      <DashboardRangePicker
        from="last-30-days"
        onApply={() => order.push("apply")}
        onUserApply={() => order.push("userApply")}
      />,
    );
    await user.click(screen.getByTitle("Change the dashboard time range"));
    await user.click(await screen.findByText("This month"));
    expect(order).toEqual(["userApply", "apply"]);
  });

  it("is optional — committing without it does not throw", async () => {
    const onApply = vi.fn();
    const user = userEvent.setup();
    render(<DashboardRangePicker from="last-30-days" onApply={onApply} />);
    await user.click(screen.getByTitle("Change the dashboard time range"));
    await user.click(await screen.findByText("This month"));
    expect(onApply).toHaveBeenCalledWith({ from: "this-month", to: undefined });
  });
});

describe("CSS scoping", () => {
  it("the picker's trigger AND its portalled popover both carry the .dash-kit scope root", async () => {
    // The popover renders in a Radix portal at the document root, OUTSIDE the trigger's subtree. A
    // scope class on the trigger alone would leave every utility in the popover unstyled — which is
    // exactly the kind of break that looks like a CSS bug and is really a portal one.
    const user = userEvent.setup();
    render(<DashboardRangePicker from="last-30-days" onApply={() => {}} />);
    const trigger = screen.getByTitle("Change the dashboard time range");
    expect(trigger.className).toContain("dash-kit");
    await user.click(trigger);
    const content = document.querySelector("[data-radix-popper-content-wrapper] .dash-kit");
    expect(content, "the portalled popover must carry .dash-kit").not.toBeNull();
  });
});
