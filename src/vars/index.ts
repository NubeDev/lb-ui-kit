// The variable-reference vocabulary the read cache's key narrowing needs — the parse helpers and the
// scope types, nothing else. Deliberately NOT the shell's whole `lib/vars` (interpolation, the
// dependency graph, entity resolution): the kit needs only "which names does this spec reference?".

export { BUILTIN_PREFIX, extractVarNames, extractVarNamesDeep, isBuiltinName } from "./parse";
export { navBuiltins, NAV_PATH_SEP } from "./navBuiltins";
export type { NavContext, PageContext } from "./navBuiltins";
export type { Builtins, VarScope, VarValue } from "./types";
