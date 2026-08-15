// Tier 2a — THE chart substrate. Extracted from the rubix-ai shell (which is where the mature
// incumbents lived), not re-derived from a consumer: publishing a second wrapper into a family that
// already has one is the exact parallel-renderer drift this kit exists to stop.
//
// Four things, and the boundary between them is the point:
//
//   • `EChart`        — the ONE engine wrapper. Resize, `notMerge`, theme re-read, disposal, the lazy
//                       chunk and the a11y/test `summary`, in one place.
//   • `echartsTheme`  — the ONE token bridge. Canvas cannot read a CSS var; this resolves the HOST's
//                       tokens so a kit chart follows the host's theme.
//   • `ChartState`    — the ONE honesty surface. loading / denied / error / empty / table-only, kept
//                       visually distinguishable.
//   • `ShareBar`      — the counterweight. Proportions with no axis are CSS, not a chart engine.
//
// echarts is a PEER and loads lazily — see `echartsLoader`, including how a host with a wider chart
// vocabulary replaces the registration list.

export { EChart } from "./EChart";
export type { EChartProps, EChartsLike } from "./EChart";

export {
  DASH_KIT_ECHARTS_PARTS,
  loadEcharts,
  setEchartsLoader,
  type EchartsLoader,
  type EchartsNamespace,
} from "./echartsLoader";

export {
  axisChrome,
  echartsTheme,
  legendChrome,
  tokenColor,
  tooltipChrome,
  type EchartsTheme,
  type SequentialRamp,
} from "./echartsTheme";

export { ChartState, CHART_STATE_ICON } from "./ChartStates";
export type { ChartStateProps, ChartStateTone } from "./ChartStates";

export { ShareBar } from "./ShareBar";
export type { ShareBarProps, ShareSegment } from "./ShareBar";
export { ShareLegend } from "./ShareLegend";
export type { ShareLegendRow } from "./ShareLegend";
