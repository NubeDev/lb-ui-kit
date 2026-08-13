// Narrow a `VarScope` to the part of it a query key may honestly depend on (nav-context-vars scope,
// Slice 1b). The read cache keys every panel on `{sources, source, scope, tick}` and `scope` used to be
// the WHOLE `VarScope` — `values` AND `builtins`. That was already wasteful (`$__from`/`$__to` move on
// every range tick and re-keyed panels whose SQL never mentions them) and became a regression the moment
// the nav-context built-ins (`__nav.*` / `__page.*`) joined the map: a relabel, or simply arriving at a
// board from the rail instead of the manager, would re-key every frame on every board for byte-identical
// data.
//
// THE RULE: the key carries only the built-ins the spec's OWN strings reference. Nothing else about the
// scope changes, so a built-in that IS referenced still splits the cache — which is the point. Dropping
// the built-ins wholesale (or parking nav context in a key-excluded sibling field) would make
// `${__nav.label}` inside a query argument a WRONG-DATA bug: two nav items sharing one cached result.
//
// `values` are deliberately NOT narrowed. A value is author-scoped and changes only on a user action;
// narrowing it would buy little and risks the same wrong-data class through the chained resolver.
//
// The reference scan is the SHIPPED parse (`extractVarNamesDeep`, the same one `cellVarNames` uses for
// the "used by N panels" x-ray), so the key cannot disagree with what actually interpolates.

import { extractVarNamesDeep, isBuiltinName } from "../vars";
import type { Builtins } from "../vars";

/** The key-facing projection of a scope: the values verbatim, plus ONLY the referenced built-ins.
 *  `builtins` is ABSENT (not empty) when the spec references none, so a board of plain-SQL panels keys
 *  exactly as it did before any built-in existed. */
export interface ScopeKeyPart {
  values: unknown;
  builtins?: Builtins;
}

/** The spec member holding the scope itself — excluded from the reference scan (a built-in VALUE that
 *  happens to contain a `$name` must not pull its own namesake into the key). */
const SCOPE_MEMBER = "scope";

/** Every built-in name reachable from a spec's string leaves, ignoring the spec's own `scope` member. */
function referencedBuiltins(spec: unknown): Set<string> {
  let scanned: unknown = spec;
  if (
    spec &&
    typeof spec === "object" &&
    !Array.isArray(spec) &&
    SCOPE_MEMBER in spec
  ) {
    const { [SCOPE_MEMBER]: _dropped, ...rest } = spec as Record<
      string,
      unknown
    >;
    scanned = rest;
  }
  return new Set(extractVarNamesDeep(scanned).filter(isBuiltinName));
}

/** Narrow `scope` for `spec`'s cache key: `values` pass through, `builtins` keeps only the names `spec`
 *  actually references (and is omitted entirely when it references none). A non-object scope (or one
 *  without `builtins`) is returned unchanged — callers outside the `VarScope` contract are not rewritten. */
export function scopeKey(spec: unknown, scope: unknown): unknown {
  if (!scope || typeof scope !== "object" || Array.isArray(scope)) return scope;
  const { builtins, ...rest } = scope as { builtins?: unknown } & Record<
    string,
    unknown
  >;
  if (!builtins || typeof builtins !== "object" || Array.isArray(builtins))
    return scope;

  const referenced = referencedBuiltins(spec);
  const kept: Builtins = {};
  let any = false;
  for (const [name, value] of Object.entries(
    builtins as Record<string, string>,
  )) {
    if (referenced.has(name)) {
      kept[name] = value;
      any = true;
    }
  }
  return any ? { ...rest, builtins: kept } : { ...rest };
}
