// The three variable-scope types the read cache's key narrowing depends on. Vendored here rather than
// imported from the shell because `scopeKey` is PURE and synchronous — it runs inside `vizQueryKey`,
// outside React, at every key build — so its vocabulary cannot come from a provider without making
// every key call site async or context-bound. The shell re-exports these so there is still exactly one
// definition, not two.
//
// One responsibility: the scope vocabulary. No I/O, no React.

/** The shell-resolved built-in globals (`$__from`/`${__user.login}`/`${__workspace}`/…). PURE given
 *  trusted inputs — the host supplies them from the verified token + the URL time range, NEVER a cell
 *  or an iframe (un-spoofable). A flat string map keyed by the built-in's bare name (no leading `$__`). */
export type Builtins = Record<string, string>;

/** A resolved variable VALUE — a single value, or a multi-value list (multi/include-all selections). */
export type VarValue = string | string[];

/** The fully-resolved scope an interpolation substitutes against: the user-variable selections (by
 *  name) + the built-ins. This is the contract handed to a widget as `ctx.vars`. */
export interface VarScope {
  /** The resolved user-variable selections, keyed by variable name. */
  values: Record<string, VarValue>;
  /** The host-resolved built-ins (token + time range derived). */
  builtins: Builtins;
}
