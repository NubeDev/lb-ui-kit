// The legend that goes with a {@link ShareBar} — HTML, deliberately, never a chart engine's own.
//
// Three requirements a drawn legend cannot meet, and all three are why the band above it is a picture
// rather than the primary rendering:
//
//   1. It carries TWO numbers per state ("24,287 · 73 %"). A drawn legend carries a swatch and a name.
//   2. It is selectable, searchable, copyable TEXT. Somebody reading a roster is going to paste one of
//      those figures into a ticket.
//   3. It stays readable when the bar itself is a picture to a screen reader — which, per `ShareBar`,
//      is the normal case.
//
// One responsibility: render the rows that name a share bar's segments.

import type { ReactNode } from "react";

export interface ShareLegendRow {
  key: string;
  label: string;
  color: string;
  /** The primary figure, already formatted by the caller — the kit does not decide a locale or a unit. */
  value: string;
  /** The secondary figure (usually the share). Omitted ⇒ one number. */
  secondary?: string;
  /** Extra context shown on hover — what this state actually means. */
  title?: string;
  hatch?: boolean;
  /** Rendered at the end of the row (a link into the rows behind the figure). */
  action?: ReactNode;
}

export function ShareLegend({
  rows,
  label,
  className,
}: {
  rows: ShareLegendRow[];
  /** Names the list for assistive tech — this IS the accessible rendering of the bar's data. */
  label: string;
  className?: string;
}) {
  return (
    <ul className={`dash-kit flex flex-wrap gap-x-4 gap-y-1 ${className ?? ""}`} aria-label={label}>
      {rows.map((r) => (
        <li key={r.key} className="flex items-center gap-1.5 text-xs" title={r.title} data-share-row={r.key}>
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{
              backgroundColor: r.color,
              ...(r.hatch
                ? {
                    backgroundImage:
                      "repeating-linear-gradient(-45deg, rgba(255,255,255,0.35) 0 1px, transparent 1px 3px)",
                  }
                : {}),
            }}
          />
          <span className="text-muted">{r.label}</span>
          <span className="tabular-nums text-fg">{r.value}</span>
          {r.secondary ? <span className="tabular-nums text-muted">· {r.secondary}</span> : null}
          {r.action}
        </li>
      ))}
    </ul>
  );
}
