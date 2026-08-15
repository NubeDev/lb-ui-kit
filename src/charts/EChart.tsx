// THE React wrapper over Apache ECharts — the ONE place an echarts instance is created, updated,
// resized, re-themed and disposed. Every kit chart, and every host chart drawn through the kit, goes
// through here, so those five decisions are made once instead of once per page.
//
// Each of them is a silent failure somewhere it is not made:
//
//   • **Resize.** ECharts has no `<ResponsiveContainer>`: an instance sizes itself at creation and
//     never again unless something calls `resize()`. A chart in a flex column inside a collapsible card
//     is drawn at whatever width first paint gave it and stays there. The `ResizeObserver` lives here.
//   • **`notMerge`.** ECharts MERGES option updates by default, so a series that disappears from a new
//     option keeps its old data on screen — a site that stopped being dark stays drawn dark. The option
//     is derived whole from the data, so it replaces whole.
//   • **Theme.** The option is a FUNCTION of the resolved theme, not a value, so a chart re-derives its
//     colours when the host flips light/dark without the caller threading theme state. The flip is
//     observed as a CLASS mutation on `<html>` — the host's prefs are the authority, not
//     `prefers-color-scheme`.
//   • **Lazy engine.** echarts is `import()`ed inside the effect (see `echartsLoader`), so a page with
//     no chart downloads no engine.
//   • **The `summary`.** A canvas is opaque to a screen reader AND to jsdom. `summary` is a
//     visually-hidden, DOM-order readout of what the chart draws: it is the accessibility story and the
//     render-test target, and it is why this wrapper does not need an SVG renderer to be testable.
//     Under jsdom `init` throws (no canvas 2D context) and this bails QUIETLY — the container and the
//     summary are already in the DOM, and that is what a non-browser test asserts.
//
// One responsibility: mount/update/dispose an echarts instance for a themed option builder.

import { useEffect, useRef, useState, type ReactNode } from "react";

import { loadEcharts } from "./echartsLoader";
import { echartsTheme, type EchartsTheme } from "./echartsTheme";

export interface EChartProps {
  /** Build the echarts option from the RESOLVED theme. A function (not a plain option) so the chart
   *  re-derives its colours when the host flips light/dark. */
  option: (theme: EchartsTheme) => object;
  ariaLabel: string;
  /** A visually-hidden, DOM-order summary of what the canvas draws — the a11y text AND the render
   *  target unit tests assert. See the header. */
  summary?: ReactNode;
  className?: string;
  /** Called once the instance is live, for the events an OPTION cannot express (the hovered data index
   *  being the one that matters). Return a disposer and it runs before teardown.
   *
   *  NEVER fires under jsdom: `init` throws there, so a consumer must treat "not called" as normal. */
  onReady?: (chart: EChartsLike) => (() => void) | void;
  /** Render WITHOUT the `role="img"` wrapper, for a caller that already provides one. Two nested
   *  `role="img"` elements make `[role="img"]` ambiguous for assistive tech and for every test. */
  bare?: boolean;
}

/** The slice of the echarts instance this wrapper touches. Kept structural rather than importing
 *  echarts' type, because the module is dynamic-imported and must not become a static dependency. */
export interface EChartsLike {
  setOption: (o: unknown, notMerge: boolean) => void;
  resize: () => void;
  dispose: () => void;
  on: (event: string, handler: (payload: never) => void) => void;
  off: (event: string) => void;
}

/** Observe the theme flip: a host switches light/dark by a CLASS on `<html>` (not a media query — the
 *  host's prefs are the authority), so re-resolving tokens keys off a class mutation. */
function useThemeTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (typeof MutationObserver === "undefined") return;
    const obs = new MutationObserver(() => setTick((t) => t + 1));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    return () => obs.disconnect();
  }, []);
  return tick;
}

export function EChart({ option, ariaLabel, summary, className, onReady, bare }: EChartProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  // The live instance, kept in a ref so the option effect can update WITHOUT re-initialising (an
  // init-per-option would drop the chart's own interaction state and thrash the canvas).
  const chartRef = useRef<EChartsLike | null>(null);
  // Held in a ref so binding the instance events does not depend on the caller memoising `onReady`.
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const themeTick = useThemeTick();

  useEffect(() => {
    let disposed = false;
    let release: (() => void) | void;
    const host = hostRef.current;
    if (!host) return;

    void (async () => {
      const echarts = await loadEcharts();
      if (disposed || !hostRef.current) return;
      try {
        chartRef.current = echarts.init(hostRef.current) as EChartsLike;
        chartRef.current?.setOption(option(echartsTheme()), true);
        if (chartRef.current) release = onReadyRef.current?.(chartRef.current);
      } catch {
        // jsdom has no canvas 2D context (it THROWS rather than being absent). Bail quietly — see the
        // header: the container and the summary are already rendered, and they are the contract.
        chartRef.current = null;
      }
    })();

    return () => {
      disposed = true;
      release?.();
      chartRef.current?.dispose();
      chartRef.current = null;
    };
    // Mount once per host; option/theme updates ride the second effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option(echartsTheme()), true);
  }, [option, themeTick]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof ResizeObserver === "undefined") return;
    const obs = new ResizeObserver(() => chartRef.current?.resize());
    obs.observe(host);
    return () => obs.disconnect();
  }, []);

  return (
    // `dash-kit` is the kit's CSS scope root — every utility the kit compiles lives under it, so a kit
    // surface that forgets the class renders unstyled (and, more importantly, a kit rule can never
    // match a host element). `widget-no-drag` so dragging INSIDE the chart pans/brushes rather than
    // moving a host grid cell. `min-h-0 flex-1` because a flex-column parent otherwise collapses a
    // canvas child to zero height.
    <div
      className={`dash-kit widget-no-drag relative min-h-0 w-full flex-1 ${className ?? ""}`}
      role={bare ? undefined : "img"}
      aria-label={bare ? undefined : ariaLabel}
    >
      {summary}
      <div ref={hostRef} className="h-full w-full" data-echart={ariaLabel} />
    </div>
  );
}
