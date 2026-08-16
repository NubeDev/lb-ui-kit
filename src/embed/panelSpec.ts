// The embed's wire vocabulary — the shapes a `panel.get` returns and a renderer consumes.
//
// These are STRUCTURAL, not the host's own types. The kit deliberately does not model a `Cell`: the
// panel model is the host's (it grows view ids, option bags, transformation kinds on the host's clock),
// and a kit that re-declared it would have to be re-tagged every time the host added a field —
// and would silently DROP anything it hadn't learned about yet when it passed a panel along.
//
// So the kit treats a cell as an opaque record with the two or three keys the EMBED itself needs, and
// carries everything else through untouched. That is the same rule the host applies to an extension's
// options bag, applied in the other direction.
//
// One responsibility: the embed's types + the two pure functions that turn a spec into a cell.

/** A panel's non-layout half — what `panel.get` returns under `spec`. Opaque to the kit. */
export type EmbedPanelSpec = Record<string, unknown>;

/** One renderable panel: a spec plus grid geometry. Opaque to the kit beyond `i`. */
export interface EmbedCell extends Record<string, unknown> {
  /** The cell key. Stable per placement. */
  i: string;
}

/** A full panel record as `panel.get` returns it. */
export interface EmbedPanel {
  id: string;
  title: string;
  spec: EmbedPanelSpec;
  [k: string]: unknown;
}

/** The dashboard time range a page may pass down. Opaque — the host reads its own shape. */
export type EmbedRange = Record<string, unknown>;

/** The resolved variable scope. Opaque for the same reason. */
export type EmbedScope = Record<string, unknown>;

/** Strip the `panel:` reference prefix. Idempotent, so a bare id passes through.
 *
 *  It exists because panel references travel in BOTH grammars — a `panel:{id}` REFERENCE (what a cell
 *  ref, a map action target and a popout stack hold) and the bare record id `panel.get` keys on.
 *  Normalising at the ONE point of consumption is what makes every present and future caller immune to
 *  the mismatch; the alternative (each caller strips its own) is a bug that has already shipped once,
 *  as a "panel not accessible" over a panel that existed and the viewer could read. */
export function bareId(id: string): string {
  return id.replace(/^panel:/, "");
}

/** A spec + an id → a renderable cell. Default geometry is a full-width band: an embed has no grid to
 *  take its size from, and the host sizes the container anyway. */
export function specToCell(
  id: string,
  spec: EmbedPanelSpec,
  layout?: { x?: number; y?: number; w?: number; h?: number },
): EmbedCell {
  return {
    i: id,
    x: layout?.x ?? 0,
    y: layout?.y ?? 0,
    w: layout?.w ?? 12,
    h: layout?.h ?? 8,
    ...spec,
  };
}
