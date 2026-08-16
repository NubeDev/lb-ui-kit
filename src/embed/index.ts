// Tier 2b — THE EMBED. The tier that delivers the product goal: an extension developer puts a REAL
// shell panel on a custom page (an inline cell, a spec, or a curated library `panel:{id}`), and it is
// drawn by the host's own renderer through the host's own gated path.
//
// The kit owns the CONTRACT, not the drawing — see `panelRenderer` for why that boundary is where it
// is, and why the registry is a cross-bundle global rather than a React context.
//
// No grid: the kit's Tier 2 edge is the single-panel embed. Laying panels out is host product.

export { PanelEmbed } from "./PanelEmbed";
export type { PanelEmbedProps } from "./PanelEmbed";
export {
  clearPanelRenderer,
  getPanelRenderer,
  hydrateSpec,
  registerPanelRenderer,
  registerSpecHydrator,
  type PanelRenderer,
  type PanelRenderRequest,
  type SpecHydrator,
} from "./panelRenderer";
export { bareId, specToCell } from "./panelSpec";
export type {
  EmbedCell,
  EmbedPanel,
  EmbedPanelSpec,
  EmbedRange,
  EmbedScope,
} from "./panelSpec";
