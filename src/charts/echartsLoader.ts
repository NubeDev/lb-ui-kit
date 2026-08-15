// HOW THE ENGINE ARRIVES — the one seam between the kit and Apache ECharts.
//
// Three rules, and each of them is a bug somebody has already had:
//
//  1. **echarts is a PEER, never a dependency.** It is ~1 MB. A kit that bundled it would push that
//     megabyte into every consumer, including the ones whose page has no chart at all. The consumer
//     declares it, the consumer's bundler resolves it, and there is exactly one copy on the page.
//
//  2. **It loads LAZILY, inside the wrapper.** `EChart` `import()`s the module below from an effect, so
//     a page that never mounts a chart never downloads the engine. That is why this is a separate
//     module from `EChart.tsx` at all — a static import at the top of the wrapper would defeat it.
//
//  3. **An unregistered part fails SILENTLY.** echarts' `use()` registry is opt-in: ask for a series
//     type nobody registered and the chart mounts, sizes itself, and draws axes with no marks. No
//     error, no warning — the single most expensive failure mode in this whole surface. So the default
//     list below is DOCUMENTED, and a host that draws beyond it replaces the loader rather than
//     discovering the gap in production.
//
// {@link setEchartsLoader} is that replacement seam. A host with a larger chart vocabulary (the shell
// draws sankey/treemap/calendar/boxplot/…) points the loader at its OWN module, which registers its own
// list and returns the same `echarts` object. The call is cheap and eager-safe: it stores a thunk, so
// the engine is still not loaded until a chart mounts.
//
// One responsibility: hand back a registered `echarts` namespace, lazily.

/** The slice of the echarts namespace the kit touches. Structural rather than imported, because the
 *  module is dynamic-imported and must not become a static dependency of this file. */
export interface EchartsNamespace {
  init: (host: HTMLElement) => unknown;
}

export type EchartsLoader = () => Promise<EchartsNamespace>;

/** The kit's DEFAULT registration list, stated so a consumer can read it rather than infer it:
 *
 *  ```ts
 *  echarts.use([
 *    BarChart, LineChart, PieChart, ScatterChart,     // series
 *    GridComponent, LegendComponent, TooltipComponent, DatasetComponent,
 *    MarkLineComponent, MarkAreaComponent, TitleComponent,
 *    CanvasRenderer,                                   // renderer
 *  ]);
 *  ```
 *
 *  CanvasRenderer, not SVG. The kit's test/a11y contract is the visually-hidden DOM `summary` a chart
 *  renders alongside its canvas — a real element in DOM order that a screen reader reads and a jsdom
 *  test asserts on. That contract holds for every chart regardless of renderer, whereas "render SVG so
 *  jsdom can see the marks" buys a test target for the marks only, at the cost of the renderer that
 *  scales past a few thousand of them. One answer, and it is also the accessibility answer.
 */
export const DASH_KIT_ECHARTS_PARTS = [
  "BarChart",
  "LineChart",
  "PieChart",
  "ScatterChart",
  "GridComponent",
  "LegendComponent",
  "TooltipComponent",
  "DatasetComponent",
  "MarkLineComponent",
  "MarkAreaComponent",
  "TitleComponent",
  "CanvasRenderer",
] as const;

let loader: EchartsLoader = () => import("./echartsDefault").then((m) => m.echarts);

/** Point the kit's charts at a DIFFERENT registration module — a host whose chart vocabulary is wider
 *  than {@link DASH_KIT_ECHARTS_PARTS}. Pass a thunk that dynamic-imports; the engine stays lazy.
 *
 *  Call it once, at boot, before any chart mounts. Registering is additive and idempotent in echarts,
 *  so a host module that registers the kit's parts plus its own is the normal shape. */
export function setEchartsLoader(next: EchartsLoader): void {
  loader = next;
}

/** Load (and register) the engine. Every kit chart goes through here. */
export function loadEcharts(): Promise<EchartsNamespace> {
  return loader();
}
