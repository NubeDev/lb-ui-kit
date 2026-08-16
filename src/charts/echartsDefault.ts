// The kit's DEFAULT echarts registration — the module `echartsLoader` dynamic-imports when a host has
// not replaced the loader. Everything it registers is listed (and argued for) in
// `echartsLoader.DASH_KIT_ECHARTS_PARTS`; this file is that list, executed.
//
// Kept separate from `echartsLoader.ts` so the loader itself — which `EChart` imports STATICALLY — has
// no static reference to `echarts`. If these two were one file the engine would be in the main chunk of
// every consumer, and the "a page with no chart downloads no engine" promise would be quietly false.
//
// One responsibility: `echarts.use([...])` and re-export the namespace.

import * as echartsCore from "echarts/core";
import { BarChart, LineChart, PieChart, ScatterChart } from "echarts/charts";
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

import type { EchartsNamespace } from "./echartsLoader";

echartsCore.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  DatasetComponent,
  // The reference marks (a threshold rule, a shaded window) ride the first series' `markLine`/
  // `markArea`. They are cheap and they are the difference between a chart and a chart that means
  // something, so they are in the default set rather than an opt-in.
  MarkLineComponent,
  MarkAreaComponent,
  TitleComponent,
  CanvasRenderer,
]);

export const echarts = echartsCore as unknown as EchartsNamespace;
