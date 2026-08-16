// THE non-data states — and the kit's one real opinion at this tier.
//
// A surface that draws a capability DENIAL as "no data" teaches an operator to distrust every empty
// panel on the page. So the five states a read can land in are kept distinguishable, and
// distinguishable VISUALLY rather than merely by wording: each tone drives an icon, a ring and (for
// loading) motion, so a viewer can tell them apart across a room without reading the copy.
//
// This is the render-side counterpart of the kit cache's `retry: false`. Retrying a denial into a
// fabricated success is the same lie told on the transport; both defaults exist for the same reason.
//
// The five:
//   • `loading`    — the read is in flight. Nothing is known yet.
//   • `denied`     — the host refused (a cap the viewer does not hold, a verb out of `[ui] scope`).
//                    NOT an error and NOT empty: the data exists, this viewer may not see it.
//   • `error`      — the read failed for some other reason. Distinct from `denied` on purpose — "you
//                    can't see this" and "this broke" send an operator to two different places.
//   • `empty`      — the read succeeded and returned nothing. The honest zero.
//   • `table-only` — rows came back, but nothing in them is numeric. The chart cannot be drawn; the
//                    data is fine. Telling a reader "no data" here would be simply false.
//
// Every tone carries default copy, and every piece of it is overridable — one vocabulary for a chart
// placeholder and for a page-level empty, rather than two components that drift.
//
// One responsibility: render a non-data state. No fetching, no state.

import type { ReactNode } from "react";
import { AlertTriangle, BarChart3, Inbox, Loader2, Lock, TableProperties } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ChartStateTone = "loading" | "denied" | "error" | "empty" | "table-only";

const TONE: Record<
  ChartStateTone,
  { icon: LucideIcon; title: string; detail?: string; wrap: string; chip: string; spin?: boolean }
> = {
  loading: {
    icon: Loader2,
    title: "Loading…",
    wrap: "border-border/60",
    chip: "border-border/60 bg-muted-bg/40 text-muted",
    // Motion as STATE: the spinner means "still working". `motion-reduce` drops it for a viewer who
    // asked for less movement — the copy already carries the meaning.
    spin: true,
  },
  denied: {
    icon: Lock,
    title: "No access to this source",
    detail: "This view needs a capability you have not been granted.",
    wrap: "border-warning/30 bg-warning/[0.03]",
    chip: "border-warning/30 bg-warning/10 text-warning",
  },
  error: {
    icon: AlertTriangle,
    title: "This didn't load",
    wrap: "border-destructive/30 bg-destructive/[0.03]",
    chip: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  empty: {
    icon: Inbox,
    title: "No data yet",
    detail: "This draws as soon as the query returns rows.",
    wrap: "border-border/60",
    chip: "border-border/60 bg-muted-bg/40 text-muted",
  },
  "table-only": {
    icon: TableProperties,
    title: "Nothing numeric to plot",
    detail: "Pick a numeric field for the y axis, or view the result as a table.",
    wrap: "border-border/60",
    chip: "border-border/60 bg-muted-bg/40 text-muted",
  },
};

/** The glyph a caller gets when it wants the chart look with its own copy. Exported so a host can keep
 *  one icon vocabulary rather than importing lucide twice. */
export const CHART_STATE_ICON = BarChart3;

export interface ChartStateProps {
  tone: ChartStateTone;
  /** Override the tone's default headline. */
  title?: string;
  /** Override the tone's default second line. Pass `null` to show none. */
  detail?: string | null;
  /** An optional way OUT of the state — a link to the page that fixes it. Never a bare "retry": a
   *  denial does not become a grant by asking again, which is the whole point of `retry: false`. */
  action?: ReactNode;
  className?: string;
  /** A checkable marker for a caller that renders two different CLAIMS under one tone (the embed's
   *  "not available" vs its "no access", which share the `denied` chrome). Surfaces on the root. */
  "data-embed-failure"?: string;
}

export function ChartState({ tone, title, detail, action, className, ...rest }: ChartStateProps) {
  const t = TONE[tone];
  const Icon = t.icon;
  const body = detail === null ? undefined : (detail ?? t.detail);
  return (
    <div
      // `dash-kit` is the kit's CSS scope root — see `EChart`. `role="status"` + polite: an empty or a
      // denial replacing a loading state is a change a screen-reader user needs told about, but not one
      // that should interrupt them mid-sentence.
      role="status"
      aria-live="polite"
      data-chart-state={tone}
      {...rest}
      className={`dash-kit flex h-full min-h-24 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center ${t.wrap} ${className ?? ""}`}
    >
      <span className={`rounded-xl border p-2.5 ${t.chip}`}>
        <Icon className={`size-5 ${t.spin ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden />
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-fg">{title ?? t.title}</p>
        {body ? <p className="max-w-[44ch] text-xs leading-relaxed text-muted">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}
