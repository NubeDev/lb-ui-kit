// `@nube/panel` — public surface.
//
// A reusable, right-docked, RESIZABLE side panel: the ce-wiresheet InspectPanel look
// rebuilt on shadcn/ui primitives, self-themed via scoped `hsl(var(--lbp-*))` tokens
// (host-overridable by re-declaring them under `.lb-panel`). Data-driven — the host
// composes <Section>/<PropTable>/<KV> into the panel body. Drag the left edge (or focus
// it + arrow keys) to widen and reveal more option columns.
//
// The stylesheet is NOT a separate import any more: inside the kit every surface's CSS lands in the
// one `@nube/dash-kit/style.css` (theme + scoped utilities only, NO preflight — a library must not
// reset its host). The panel's section rail is the kit's own NavMenu, re-exported below so a host
// still gets one import for "panel + its nav".
import "./panel.css";

export { Panel, type PanelProps } from "./Panel";
export { Section, type SectionProps } from "./Section";
export { PropTable, type PropTableProps, type PropColumn, type PropRow } from "./PropTable";
export { KV, type KVProps } from "./KV";
export { ResizeHandle, type ResizeHandleProps } from "./ResizeHandle";
export { useResizable, type Resizable, type UseResizableOptions } from "./useResizable";

// Re-export the section rail so hosts get one import for "panel + its nav".
export { NavMenu, type NavItem, type NavMenuProps } from "../nav-rail";
