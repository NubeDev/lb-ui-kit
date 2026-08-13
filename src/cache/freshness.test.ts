// The freshness-TTL resolver precedence (dashboard-query-acceleration §C). The scope pins an ORDERED
// rule — refresh-interval → per-page `cacheTtlS` → off — and asks for a mutation check per step: change
// exactly one input and the effective TTL must move (or hold) as the order dictates, so the precedence
// can't silently invert. Pure resolver, so this is a plain unit test (no render).

import { describe, expect, it } from "vitest";

import { DEFAULT_TTL_S, resolveFreshnessTtl } from "./freshness";

describe("resolveFreshnessTtl — precedence", () => {
  it("defaults ON to DEFAULT_TTL_S when neither refresh nor per-page TTL is set (default-on: fast without author action)", () => {
    expect(resolveFreshnessTtl({})).toBe(DEFAULT_TTL_S);
    expect(resolveFreshnessTtl({ refreshMs: 0 })).toBe(DEFAULT_TTL_S);
    expect(DEFAULT_TTL_S).toBe(120);
  });

  it("goes LIVE (0) only when the board explicitly opts out with per-page cacheTtlS === 0", () => {
    expect(resolveFreshnessTtl({ cacheTtlS: 0 })).toBe(0);
    expect(resolveFreshnessTtl({ refreshMs: 0, cacheTtlS: 0 })).toBe(0);
    // Mutation check: an UNSET board (undefined) is NOT live — it takes the default.
    expect(resolveFreshnessTtl({ cacheTtlS: undefined })).toBe(DEFAULT_TTL_S);
  });

  it("uses the per-page cacheTtlS when no refresh interval is set (step 2)", () => {
    expect(resolveFreshnessTtl({ cacheTtlS: 60 })).toBe(60);
    // Mutation check: changing ONLY the per-page value moves the result (step 2 is live).
    expect(resolveFreshnessTtl({ cacheTtlS: 30 })).toBe(30);
  });

  it("lets the refresh interval WIN over the per-page TTL (step 1 precedence)", () => {
    // A 30 s refresh with a 120 s per-page setting resolves to 30 (the cadence wins, so the cache bucket
    // and the refresh agree). This is THE precedence assertion.
    expect(resolveFreshnessTtl({ refreshMs: 30_000, cacheTtlS: 120 })).toBe(30);
    // Mutation check: drop the refresh interval to 0 and the SAME inputs fall through to the per-page
    // value — proving the ordering, not a coincidence.
    expect(resolveFreshnessTtl({ refreshMs: 0, cacheTtlS: 120 })).toBe(120);
    // Mutation check: change ONLY the refresh cadence and the result tracks it (not the per-page value).
    expect(resolveFreshnessTtl({ refreshMs: 5_000, cacheTtlS: 120 })).toBe(5);
  });

  it("converts a refresh cadence in ms to whole seconds, flooring sub-second to 1", () => {
    expect(resolveFreshnessTtl({ refreshMs: 900 })).toBe(1);
    expect(resolveFreshnessTtl({ refreshMs: 60_000 })).toBe(60);
  });

  it("treats a negative/NaN per-page input as unset → the default (defensive — a corrupt record never yields a nonsense TTL)", () => {
    expect(resolveFreshnessTtl({ refreshMs: -1, cacheTtlS: -5 })).toBe(
      DEFAULT_TTL_S,
    );
    expect(resolveFreshnessTtl({ cacheTtlS: Number.NaN })).toBe(DEFAULT_TTL_S);
    // A negative refresh falls through to a valid per-page value rather than poisoning it.
    expect(resolveFreshnessTtl({ refreshMs: -1, cacheTtlS: 45 })).toBe(45);
  });
});
