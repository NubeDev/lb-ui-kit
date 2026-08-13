// The freshness-TTL resolver (dashboard-query-acceleration §C). ONE responsibility: given a board's
// refresh cadence and its per-page `cacheTtlS`, decide the single effective `viz.query` cache TTL (in
// SECONDS) the fetch sends as the top-level `cache: {ttl_s}` directive.
//
// Precedence (the scope's ordered rule, mutation-checked in the sibling test):
//   1. The board's **refresh-interval** when set (a 30 s auto-refresh ⇒ ttl 30, so the cache bucket and
//      the refresh cadence agree — re-fetching every 30 s while caching for 120 s would serve stale data
//      the refresh can't shake; matching them keeps the two honest).
//   2. Else the per-page **`cacheTtlS`** (the author's opt-in on a historical board with no refresh).
//   3. Else **off (0)** — live, today's behaviour; a board is cached only when an author opts in or sets
//      a refresh (open-Q1: conservative, never-surprising).
//
// Pure + no React so the precedence is unit-testable without a render. `refreshMs` is the millisecond
// cadence `useAutoRefresh.refreshMs` already parses from the URL interval; we take ms (not the raw
// token) so this file owns no parsing and can't drift from the refresh clock.

/** The default cache TTL (seconds) applied when a board has neither an auto-refresh cadence nor an
 *  explicit per-page setting. Caching is ON BY DEFAULT so a fresh board opens fast without any author
 *  action (dashboard-query-acceleration §C, default-on decision). A board opts OUT to live by setting
 *  its per-page freshness to exactly `0`. Staleness is bounded by this window (≤120 s). */
export const DEFAULT_TTL_S = 120;

/** Inputs to the effective-TTL decision. */
export interface FreshnessInputs {
  /** The board's auto-refresh cadence in milliseconds (`useAutoRefresh.refreshMs`); `0`/absent ⇒ off. */
  refreshMs?: number;
  /** The per-page `cacheTtlS` in seconds (the dashboard record field). A POSITIVE value sets the
   *  window; an explicit `0` means LIVE (opt out of the default); `undefined` (unset) ⇒ the default. */
  cacheTtlS?: number;
}

/** Resolve the single effective cache TTL in SECONDS. Returns `0` only when the board explicitly opts
 *  out to live (per-page `cacheTtlS === 0`); an unset board gets {@link DEFAULT_TTL_S}. A negative/NaN
 *  per-page value is treated as unset (defensive — a corrupt record falls back to the default). */
export function resolveFreshnessTtl({
  refreshMs,
  cacheTtlS,
}: FreshnessInputs): number {
  // 1. Refresh cadence wins when set — floor a sub-second interval to at least 1 s so the directive is
  //    a whole-second TTL (the `cache.ttl_s` contract is seconds).
  if (typeof refreshMs === "number" && refreshMs > 0) {
    return Math.max(1, Math.round(refreshMs / 1000));
  }
  // 2. An EXPLICIT per-page `0` means the author chose live — honor it (opt out of the default).
  if (cacheTtlS === 0) {
    return 0;
  }
  // 3. A positive per-page setting sets the window.
  if (typeof cacheTtlS === "number" && cacheTtlS > 0) {
    return Math.floor(cacheTtlS);
  }
  // 4. Else (unset / corrupt) — the default-on window so a fresh board opens fast with no author action.
  return DEFAULT_TTL_S;
}
