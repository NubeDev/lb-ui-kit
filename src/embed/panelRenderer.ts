// THE seam that makes the embed real: how the kit reaches the host's ACTUAL widget renderer.
//
// This is the tier's whole design decision, so it is worth stating plainly.
//
// The product goal is "an extension developer uses the shell's real widgets on a custom page". A kit
// that shipped its own lookalike panel components would not deliver that — it would deliver a SECOND
// renderer that resembles the first until the day it doesn't, which is precisely the parallel-renderer
// drift this programme exists to end. So the kit does not draw panels. It owns the EMBED CONTRACT (the
// three input modes, the fetch, the cache provider, the honest states) and delegates the drawing to
// whatever renderer the host registered.
//
// WHY A GLOBAL AND NOT A REACT CONTEXT. An extension's bundle carries its own copy of `@nube/dash-kit`,
// so the kit module instance an ext page imports is NOT the one the shell imported. A context created
// in one module instance is invisible to the other — the provider would be there, and `useContext`
// would return the default anyway. That is a genuinely confusing failure (everything renders, nothing
// resolves), so the registry is a `Symbol.for()`-keyed slot on `globalThis`: one cell, shared by every
// copy on the page, the same technique the shell already uses to publish its React singletons to
// remotes.
//
// The key carries a MAJOR version. If the renderer contract ever changes shape, an old host and a new
// kit miss each other loudly (no renderer → the honest "no renderer" state) instead of a new kit
// calling an old host with arguments it does not understand.
//
// RULE 10 holds: the registry is generic. The kit never names an extension, never names the shell, and
// a host that registers nothing simply gets an honest state. No capability is granted here — the
// renderer still reaches the node through the host's own gated path, and every call is re-checked
// server-side exactly as it is on a dashboard.
//
// One responsibility: hold (and hand back) the host's panel renderer.

import type { ReactNode } from "react";

import type { EmbedCell, EmbedPanelSpec, EmbedRange, EmbedScope } from "./panelSpec";

/** What the host is asked to draw. Deliberately the SAME arguments a dashboard grid hands its cells —
 *  an embedded panel is not a different kind of panel, it is the same panel outside a grid. */
export interface PanelRenderRequest {
  cell: EmbedCell;
  /** The workspace the panel reads in. A de-dup/scoping key, never the security wall. */
  ws: string;
  /** The dashboard time range, if the page has one. Absent ⇒ the panel's own/default window. */
  range?: EmbedRange;
  /** The resolved variable scope. Absent ⇒ the host's empty scope — an embed DEGRADES rather than
   *  demanding dashboard context. */
  scope?: EmbedScope;
  /** Bumped to force a re-read (an auto-refresh tick). */
  refreshKey?: number;
}

export type PanelRenderer = (req: PanelRenderRequest) => ReactNode;

// ── The renderer's OWN contract ──────────────────────────────────────────────────────────────────
//
// A registered renderer must wrap itself in whatever React context it needs — a query client, a cache
// provider, a theme. `PanelEmbed` provides NONE of it, and cannot: a provider mounted by the kit copy
// inside an extension's bundle is invisible to the host's copy, so the renderer would read the host
// instance's empty default with the provider plainly in the tree three elements up. That failure has
// already been had once (`useDashboardWs: no DashboardCacheProvider in tree`, from a renderer whose
// embed was wrapped in exactly that provider).

/** The cross-bundle slot. `Symbol.for` looks up the process-wide registry, so every copy of the kit on
 *  the page resolves the same symbol and therefore the same cell. */
const SLOT = Symbol.for("@nube/dash-kit.panelRenderer.v1");

type Slot = { [SLOT]?: PanelRenderer };

/** Register the host's widget renderer. Call once at boot, before any embed mounts.
 *
 *  The shell registers its `WidgetHost` — the ONE shipped widget path — so an extension page embedding
 *  a panel gets the shell's real chart code, not a copy of it. */
export function registerPanelRenderer(renderer: PanelRenderer): void {
  (globalThis as Slot)[SLOT] = renderer;
}

/** The registered renderer, or `undefined` when the host registered none (a bare test page, a host
 *  that does not ship widgets). Callers must render an honest state rather than an empty box. */
export function getPanelRenderer(): PanelRenderer | undefined {
  return (globalThis as Slot)[SLOT];
}

/** Drop the registration. Exists for tests; a host has no reason to call it. */
export function clearPanelRenderer(): void {
  delete (globalThis as Slot)[SLOT];
  delete (globalThis as HydratorSlot)[HYDRATE];
}

// ── The spec hydrator ────────────────────────────────────────────────────────────────────────────
//
// A stored panel spec is not always what the renderer wants. The host may persist a view id under an
// ALIAS its catalog accepts and restore the real one on read (the shell does exactly this: a `geomap`
// panel is stored as `table` plus a discriminator block). That mapping is HOST knowledge — the kit does
// not know the host's view vocabulary and must not learn it — so the host registers the transform once
// and every embed gets it, rather than each call site remembering.
//
// Unregistered ⇒ identity. A host with no aliases needs nothing here.

/** Restore a stored spec into its renderable form. */
export type SpecHydrator = (spec: EmbedPanelSpec) => EmbedPanelSpec;

const HYDRATE = Symbol.for("@nube/dash-kit.specHydrator.v1");
type HydratorSlot = { [HYDRATE]?: SpecHydrator };

/** Register the host's stored-spec → renderable-spec transform. Call once at boot, beside
 *  {@link registerPanelRenderer}. */
export function registerSpecHydrator(hydrate: SpecHydrator): void {
  (globalThis as HydratorSlot)[HYDRATE] = hydrate;
}

/** Apply the registered hydrator, or pass the spec through untouched. */
export function hydrateSpec(spec: EmbedPanelSpec): EmbedPanelSpec {
  const fn = (globalThis as HydratorSlot)[HYDRATE];
  return fn ? fn(spec) : spec;
}
