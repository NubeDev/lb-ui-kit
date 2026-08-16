// PanelEmbed — ONE panel rendered outside a grid, from an extension page.
//
// This is the tier's product goal, in one component: an extension developer puts a real shell panel on
// a custom page. Not a lookalike built from kit primitives — the actual panel, drawn by the actual
// renderer, reading through the actual gated path, so a chart on an ext page and the same chart on a
// dashboard cannot drift.
//
// Three input modes, exactly one required:
//   • `cell` — a ready cell (an inline spec). Rendered directly, no fetch.
//   • `spec` (+ `id`) — a spec the caller already holds. Turned into a cell, no fetch.
//   • `id`   — a library panel id, in either grammar (`panel:{id}` or bare). Fetched via `panel.get`.
//
// The `id` mode is the one that matters most and is easiest to under-value: it means an ext page can
// reuse the panels a team already CURATED in the shell's library, by id, rather than re-authoring their
// queries in the extension. The lens story holds — `panel.get` gates the record, and the panel's own
// sources re-check under the viewer's caps at render, so embedding a shared panel never widens access.
//
// NO GRID. The kit's Tier 2 edge is the single-panel embed; laying panels out is the host's job. A grid
// drags in drag/resize/breakpoint/persistence machinery that is dashboard product, not substrate — and
// an ext page that wants two panels beside each other has CSS.
//
// THE RENDERER OWNS ITS OWN CONTEXT, and this component deliberately provides none of it. That is not
// a shortcut — it is forced by the same fact that makes the registry a global (see `panelRenderer`):
// an extension's bundle carries its own copy of this kit, so a React provider mounted HERE lives in the
// EXT's module instance, while the host's renderer reads the HOST's instance and sees nothing.
//
// It fails exactly as badly as that sounds. Wrapping the embed in the kit's own `DashboardCacheProvider`
// looked right, passed every same-bundle test, and then threw
// `useDashboardWs: no DashboardCacheProvider in tree` out of the host's renderer the first time a real
// extension page mounted one — with the provider plainly in the tree, three elements up. A host
// registering a renderer must wrap it in whatever context that renderer needs; the shell does exactly
// that in `registerPanelHost`.
//
// One responsibility: resolve a panel to a cell and hand it to the host's renderer.

import { useEffect, useState } from "react";

import { ChartState } from "../charts/ChartStates";
import { classifyReadFailure, type ReadFailure } from "../client/failure";
import { useKitOptional } from "../provider/KitProvider";
import { getPanelRenderer, hydrateSpec } from "./panelRenderer";
import {
  bareId,
  specToCell,
  type EmbedCell,
  type EmbedPanel,
  type EmbedPanelSpec,
  type EmbedRange,
  type EmbedScope,
} from "./panelSpec";

export interface PanelEmbedProps {
  /** The workspace to read in. Defaults to the `KitProvider`'s. */
  ws?: string;
  /** A library panel id — `panel:{id}` or bare. Fetched unless `cell`/`spec` is given. */
  id?: string;
  /** A spec the caller already holds — skips the fetch. Needs `id` for the cell key. */
  spec?: EmbedPanelSpec;
  /** A ready cell — rendered directly. */
  cell?: EmbedCell;
  range?: EmbedRange;
  scope?: EmbedScope;
  /** Bump to force a re-read. */
  refreshKey?: number;
  className?: string;
}

/** Render one panel outside any grid. */
export function PanelEmbed(props: PanelEmbedProps) {
  // The provider is OPTIONAL here, deliberately. A caller that hands over a ready `cell` (or a `spec`)
  // and its own `ws` needs no client at all — an embed should DEGRADE rather than demand context, the
  // same rule the absent `scope`/`range` follow. Only the library-`id` mode reaches the wire, and it
  // says so honestly below rather than throwing a provider error out of a render.
  const kit = useKitOptional();
  const ws = props.ws ?? kit?.ws ?? "";
  // Keyed on `ws` so a workspace switch remounts rather than reusing another workspace's resolved
  // panel. (The workspace WALL is still the host's — this is de-dup, not security.)
  return <PanelEmbedInner key={ws} {...props} ws={ws} />;
}

function PanelEmbedInner({
  ws,
  id: rawId,
  spec,
  cell,
  range,
  scope,
  refreshKey,
  className,
}: PanelEmbedProps & { ws: string }) {
  const kit = useKitOptional();
  // Accept either grammar at the ONE point of consumption — see `bareId`.
  const id = rawId ? bareId(rawId) : undefined;
  const seed = cell ?? (id && spec ? specToCell(id, spec) : null);
  const [resolved, setResolved] = useState<EmbedCell | null>(seed);
  const [failure, setFailure] = useState<ReadFailure | null>(null);

  useEffect(() => {
    // Only a bare `id` needs the wire.
    if (cell || spec || !id) {
      setResolved(cell ?? (id && spec ? specToCell(id, spec) : null));
      setFailure(null);
      return;
    }
    if (!kit?.client) {
      // A library id with no way to reach the node. A HOST wiring gap, named as one.
      setFailure("error");
      return;
    }
    let live = true;
    setResolved(null);
    setFailure(null);
    kit.client
      .call("panel.get", { id })
      .then((p) => {
        if (!live) return;
        const panel = p as EmbedPanel;
        // `hydrateSpec` is the host's stored → renderable transform (wire-aliased view ids). Identity
        // when the host registered none.
        setResolved(specToCell(id, hydrateSpec(panel?.spec ?? {})));
      })
      .catch((e) => {
        if (!live) return;
        // A capability refusal is NOT an error, a missing record is NOT a transport failure, and
        // neither is an empty panel. Keeping the three apart is the same rule `ChartState` exists for
        // and the same rule the cache's `retry: false` protects: a page that renders a denial as
        // "nothing here" — or a deleted panel as "this broke" — teaches an operator to distrust every
        // state it shows them. See `classifyReadFailure` for what the wire can and cannot tell us.
        setFailure(classifyReadFailure(e));
      });
    return () => {
      live = false;
    };
  }, [kit, id, spec, cell, ws]);

  if (failure) return <EmbedFailure failure={failure} id={id} className={className} />;
  if (!resolved) return <ChartState tone="loading" className={className} />;

  const render = getPanelRenderer();
  if (!render) {
    // Honest, and specific enough to fix: this is a HOST wiring gap (nobody called
    // `registerPanelRenderer`), not a data problem and not a permission problem.
    return (
      <ChartState
        tone="error"
        className={className}
        title="No panel renderer registered"
        detail="The host has not registered a widget renderer with the kit, so this panel cannot be drawn."
      />
    );
  }

  return (
    <div className={`dash-kit flex min-h-0 flex-1 flex-col ${className ?? ""}`} data-testid="panel-embed">
      {render({ cell: resolved, ws, range, scope, refreshKey })}
    </div>
  );
}

/** The three ways a panel read fails, each stated as what it IS.
 *
 *  `unavailable` carries the awkward truth rather than picking a side: lb answers a missing record and
 *  an unreadable one identically, on purpose (see `classifyReadFailure`), so this names both. It wears
 *  the `denied` CHROME because either way an operator has to do something — but it does not claim a
 *  permission problem it cannot prove. */
function EmbedFailure({
  failure,
  id,
  className,
}: {
  failure: ReadFailure;
  id?: string;
  className?: string;
}) {
  if (failure === "denied") {
    return (
      <ChartState
        tone="denied"
        className={className}
        title="No access to this panel"
        detail={`\`panel.get\` is not in this extension's granted scope${id ? ` (asked for \`${id}\`)` : ""}.`}
      />
    );
  }
  if (failure === "unavailable") {
    return (
      <ChartState
        tone="denied"
        className={className}
        data-embed-failure="unavailable"
        title="Panel not available"
        detail={`${id ? `\`${id}\` ` : "This panel "}may have been deleted, or it isn't shared with you.`}
      />
    );
  }
  return (
    <ChartState
      tone="error"
      className={className}
      title="This panel didn't load"
      detail="The panel definition could not be fetched."
    />
  );
}
