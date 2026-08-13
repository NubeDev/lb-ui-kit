// The `[ui] scope` an extension manifest needs for a kit-built read surface. Shipped as a CONSTANT
// because getting it right by hand is a silent-under-render trap, not a typo:
//
//   • `viz.query_batch` needs a `[ui] scope` entry but NO capability of its own. lb aliases it onto
//     `mcp:viz.query:call` host-side ("a fan-in of the SAME authorized read, not a new privilege"), so
//     no `mcp:viz.query_batch:call` exists in any role bundle. But the SHELL's bridge filter is a
//     literal tool-name set over `[ui] scope` (`allowed.has(tool)`) and knows nothing of that alias —
//     `["viz.query"]` alone gets EVERY batch call rejected client-side as `out_of_scope: viz.query_batch`
//     before it ever reaches the gate. lb's `grant_ui_scope_to_admin` harmlessly skips the batch entry
//     (its cap is not in `granted`); the gate checks the aliased `mcp:viz.query:call`.
//   • Same shape as `series.latest_many` → `series.latest`.
//
// This is a CLIENT-side constant. The core learns nothing from it (rule 10) — it is the list an author
// pastes into their manifest, nothing more.
//
// One responsibility: the read-verb list. No I/O, no React.

/** The `[ui] scope` a kit-built read page needs. Paste verbatim into `extension.toml`:
 *
 * ```toml
 * [capabilities]
 * request = ["mcp:viz.query:call", "mcp:series.read:call", "mcp:series.latest:call", "mcp:series.find:call"]
 *
 * [ui]
 * scope = ["viz.query", "viz.query_batch", "series.read", "series.latest", "series.find"]
 * ```
 *
 * Note the asymmetry: five scope entries, four caps. `viz.query_batch` is the aliased one (above).
 * An admin may approve a SUBSET — the effective grant is the intersection, and every kit surface whose
 * verb was declined renders a **denied** state naming it, never an empty chart. */
export const DASH_KIT_READ_SCOPE = [
  "viz.query",
  "viz.query_batch",
  "series.read",
  "series.latest",
  "series.find",
] as const satisfies readonly string[];

/** The `[capabilities] request` list matching {@link DASH_KIT_READ_SCOPE}. Four, not five — the batch
 *  verb rides `mcp:viz.query:call` (above). Exported so an author can paste both halves and cannot
 *  accidentally request a capability that does not exist. */
export const DASH_KIT_READ_CAPS = [
  "mcp:viz.query:call",
  "mcp:series.read:call",
  "mcp:series.latest:call",
  "mcp:series.find:call",
] as const satisfies readonly string[];
