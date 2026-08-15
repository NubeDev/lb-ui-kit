import * as o from "echarts/core";
import { BarChart as t, LineChart as e, PieChart as r, ScatterChart as n } from "echarts/charts";
import { GridComponent as a, LegendComponent as m, TooltipComponent as p, DatasetComponent as C, MarkLineComponent as i, MarkAreaComponent as s, TitleComponent as h } from "echarts/components";
import { CanvasRenderer as c } from "echarts/renderers";
o.use([
  t,
  e,
  r,
  n,
  a,
  m,
  p,
  C,
  // The reference marks (a threshold rule, a shaded window) ride the first series' `markLine`/
  // `markArea`. They are cheap and they are the difference between a chart and a chart that means
  // something, so they are in the default set rather than an opt-in.
  i,
  s,
  h,
  c
]);
const k = o;
export {
  k as echarts
};
