// Canonical react-query keys for the dashboard read cache (dashboard-query-cache-scope). "Query-key design
// is the whole ballgame" (scope, Risks): too coarse → spurious refetches (today's whole-panel-JSON key);
// too unstable (object identity, member reordering, `undefined` leaves) → cache misses that look like the
// old behaviour. Every key here is:
//   1. **ws-prefixed** — a workspace switch changes the key → different cache entries, no cross-ws bleed
//      (the host still re-checks the ws from the token regardless; the key is de-dup, not the security wall).
//   2. **canonicalised** — objects go through `canon()` (sorted keys, dropped `undefined`) so an unrelated
//      edit (member order, a title change that never reaches these fields) does NOT re-key.
//   3. **scope-narrowed** (viz keys) — the `scope` they carry is `scopeKey(spec, scope)`: the values
//      verbatim plus ONLY the built-ins the spec's own strings reference (`scopeKey.ts`). Both viz keys
//      narrow INSIDE the key function, not at the call site, so `useVizQuery` and `useVizFrames` cannot
//      drift apart and stop colliding on the entry they deliberately share.
// The token is NEVER part of a key (it lives in the shell/gateway seam; the cache never sees it).

import { scopeKey } from "./scopeKey";

/** Deterministically canonicalise a value: object keys sorted, `undefined` members dropped, arrays kept in
 *  order (order is meaningful for targets/paths). The result is stable across unrelated identity churn, so
 *  two structurally-equal specs hash to the SAME key. */
export function canon(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canon);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>).sort()) {
      const v = (value as Record<string, unknown>)[k];
      if (v !== undefined) out[k] = canon(v);
    }
    return out;
  }
  return value;
}

/** The resolved viz.query spec that actually drives the fetch — NOT the whole panel. Title/layout/option
 *  edits are absent here, so they don't re-key (scope goal 2). `tick` folds the refresh cadence into the
 *  key so a new tick is a new entry ("fresh until next tick"). */
export interface VizQuerySpec {
  sources: unknown;
  transformations: unknown;
  fieldConfig: unknown;
  source: unknown;
  scope: unknown;
  tick: number;
}

/** `viz.query` — keyed on the canonical resolved spec + scope + tick, ws-prefixed. The scope goes
 *  through `scopeKey` first: only the built-ins the spec REFERENCES ride the key (nav-context-vars
 *  Slice 1b), so `__nav.*`/`__page.*` — and the per-tick `$__from`/`$__to` — never re-key a panel whose
 *  own strings never mention them. */
export function vizQueryKey(ws: string, spec: VizQuerySpec) {
  return [
    "viz.query",
    ws,
    canon({ ...spec, scope: scopeKey(spec, spec.scope) }),
  ] as const;
}

/** The FETCH half of the split (data-studio-ux: edit-without-requery). Keyed on ONLY what a datasource
 *  read depends on — `sources`/`source`/`scope`/`tick`. Crucially, `transformations` and `fieldConfig`
 *  are ABSENT, so a transform/field-config edit does NOT re-key this → the raw frames stay cached and no
 *  datasource is re-hit. A source/SQL/time-range edit (or Run, via `tick`) DOES re-key → a fresh fetch. */
export interface VizFetchSpec {
  sources: unknown;
  source: unknown;
  scope: unknown;
  tick: number;
}
export function vizFetchKey(ws: string, spec: VizFetchSpec) {
  return [
    "viz.fetch",
    ws,
    canon({ ...spec, scope: scopeKey(spec, spec.scope) }),
  ] as const;
}

/** The SHAPE half of the split. Keyed on the RAW frames (by a cheap hash) + `transformations` — the
 *  ONLY thing the server reshapes. A transform edit re-keys this → one compute-only `viz.query` over
 *  the already-fetched raw frames, no datasource touch. No transformations at all → the caller skips
 *  the round-trip entirely and uses the raw frames as-is.
 *
 *  `fieldConfig` is deliberately ABSENT (it was in this key until 2026-08-01). It is PRESENTATION —
 *  unit, decimals, min/max, color, thresholds, mappings — applied client-side at render by
 *  `fieldconfig/resolve.ts` + `format.ts`, which every view already calls. The server never reads it:
 *  lb's frames-in path is `transform(frames, &pipeline)` and `panel_pipeline` parses ONLY
 *  `panel.transformations` (`host/src/viz/query.rs`). So keying on it bought nothing and cost a full
 *  HTTP round-trip per keystroke that returned byte-identical frames — and, because the view rendered
 *  the SETTLED shape response, made a unit change look like it did nothing until that no-op call
 *  landed. Do not re-add it: if a field-config key ever needs server compute, it belongs in
 *  `transformations`. */
export interface VizShapeSpec {
  framesHash: string;
  transformations: unknown;
}
export function vizShapeKey(ws: string, spec: VizShapeSpec) {
  return ["viz.shape", ws, canon(spec)] as const;
}

/** `flows.node_state` — one entry per (ws, flow, tick). N cells on one flow share it; each slices its own
 *  node/port/path CLIENT-SIDE from the shared whole-flow read (scope goal 4). */
export function flowNodeStateKey(ws: string, flowId: string, tick: number) {
  return ["flows.node_state", ws, flowId, tick] as const;
}

/** `series.read` backfill — one entry per (ws, series). N cells on one series share one read (scope goal 4).
 *  The live SSE tail stays OUTSIDE the cache (state vs motion) — this keys only the history backfill. */
export function seriesReadKey(ws: string, series: string) {
  return ["series.read", ws, series] as const;
}

/** The source-picker bundle — one entry per ws, shared by the page-level and editor instances (goal 3). */
export function sourcePickerKey(ws: string) {
  return ["source-picker", ws] as const;
}

/** `datasource.list` — one entry per ws (the bundle and the Query-tab dropdown read the same key). */
export function datasourceListKey(ws: string) {
  return ["datasource.list", ws] as const;
}
