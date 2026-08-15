// The SHARE BAR — parts of a whole, as one CSS bar. The kit's counterweight to "reach for a chart".
//
// This is here because the alternative is measurably worse and was already being paid for twice. A
// roster row that draws its three-way coverage split with a chart engine costs one instance, one
// canvas and one ResizeObserver PER ROW — thirty rows, thirty of each — to draw what three divs draw
// exactly. And a single stacked 100% bar (four categories, one holding 73%) is a chart only in the
// sense that it has proportions: it has no scale, no axis and no tick a reader consults. The numbers
// that matter are written beside it, in the legend, as text.
//
// So: if the reader gets the number from the legend, the bar is a picture of a proportion and belongs
// in CSS. If the reader gets the number off an axis, it belongs in `EChart`.
//
// The bar is `aria-hidden` by default for the same reason — it restates numbers that are already text
// on the page, and announcing three more percentages is noise, not access. A caller whose bar is the
// ONLY rendering of its figures passes `label` and gets a described `role="img"` instead.
//
// DECALS, not colour alone. A `hatch` segment carries a diagonal overlay so two categories stay
// separable for a viewer who cannot distinguish their hues — the same reason the legend repeats the
// state in words.
//
// The kit knows NO domain vocabulary here: a segment is a value, a colour and a label. "live / silent /
// never", "pass / fail", "HVAC / lighting" are the caller's words, and stay in the caller.
//
// One responsibility: segments -> a proportional bar.

export interface ShareSegment {
  key: string;
  value: number;
  /** A resolved colour (a host token read through `tokenColor`, or any CSS colour). */
  color: string;
  /** Hover text — usually the value and what it means, since the bar itself carries no number. */
  title?: string;
  /** Overlay a diagonal hatch so this segment stays separable from its neighbour without colour. */
  hatch?: boolean;
}

export interface ShareBarProps {
  segments: ShareSegment[];
  /** Describe the bar to assistive tech. Omitted ⇒ the bar is `aria-hidden` — the right default when
   *  the figures are already text beside it (see the header). */
  label?: string;
  /** Bar thickness. The default is the roster-row strip; a headline band passes something taller. */
  height?: number | string;
  className?: string;
}

/** The CSS a hatched segment overlays. Inline rather than a utility because it is a generated gradient,
 *  and a kit utility would have to be compiled under the scope root for something no host will restyle. */
const HATCH =
  "repeating-linear-gradient(-45deg, rgba(255,255,255,0.35) 0 1px, transparent 1px 5px)";

export function ShareBar({ segments, label, height = 6, className }: ShareBarProps) {
  const shown = segments.filter((s) => Number.isFinite(s.value) && s.value > 0);
  const total = shown.reduce((a, s) => a + s.value, 0);
  return (
    <div
      // `dash-kit` is the kit's CSS scope root — every utility the kit compiles lives under it.
      className={`dash-kit flex w-full overflow-hidden rounded-full bg-muted-bg/40 ${className ?? ""}`}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-share-segments={shown.length}
    >
      {total > 0 &&
        shown.map((s) => (
          <div
            key={s.key}
            title={s.title}
            data-share-key={s.key}
            // `backgroundImage` + `backgroundColor` rather than the `background` shorthand: the
            // shorthand drops a gradient when a colour is also given in some engines (jsdom among
            // them), which silently loses the hatch that keeps two categories separable.
            style={{
              width: `${(s.value / total) * 100}%`,
              backgroundColor: s.color,
              ...(s.hatch ? { backgroundImage: HATCH } : {}),
            }}
          />
        ))}
    </div>
  );
}
