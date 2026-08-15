// The echarts ↔ design-token bridge — THE token bridge, and the reason a kit chart never drifts from
// the host it is drawn inside.
//
// ECharts draws to a CANVAS, so it cannot be handed `hsl(var(--chart-8))` the way a DOM surface is:
// canvas needs a RESOLVED colour string. This reads the HOST's HSL-triplet tokens off the live document
// and hands back concrete `hsl(...)` strings, so a chart in an extension page tracks the shell's
// light/dark toggle and its accent hue without the extension knowing anything about either.
//
// It reads the host's tokens rather than declaring its own — declaring them is precisely the CSS-leak
// the kit's `assert-no-theme-block` guard exists to refuse.
//
// One responsibility: token name → resolved color + the shared axis/tooltip/legend chrome for echarts.

/** The categorical ramp — the host's eight `--chart-N` tokens, in order, so category N is the same
 *  colour in a kit chart as in every other chart on the page. */
const PALETTE_TOKENS = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--chart-6",
  "--chart-7",
  "--chart-8",
];

/** Resolve one HSL-triplet token (`--chart-1` → `"217 78% 48%"`) into a canvas-usable color.
 *
 *  The COMMAS are load-bearing. Our tokens are CSS Color 4 space-separated triplets, which the browser
 *  understands everywhere — but echarts does not hand colors straight to the canvas: zrender PARSES
 *  them itself (to interpolate a visualMap ramp, to derive an emphasis shade), and its parser only
 *  knows the legacy `hsl(h, s%, l%)` / `rgb(...)` / hex forms. A space-separated triplet parses as
 *  null and every mark paints BLACK — the first thing this shipped as, and invisible to jsdom.
 *
 *  Falls back to a neutral grey when the token is missing (SSR / jsdom / a host that defines no chart
 *  tokens) so a chart still draws something honest instead of throwing. */
export function tokenColor(name: string, alpha?: number): string {
  const raw =
    typeof window === "undefined"
      ? ""
      : getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const parts = (raw || "215 16% 60%").replace(/,/g, " ").split(/\s+/).filter(Boolean);
  const [h, s, l] = parts;
  if (!h || !s || !l) return alpha === undefined ? "#808a99" : `rgba(128,138,153,${alpha})`;
  return alpha === undefined ? `hsl(${h}, ${s}, ${l})` : `hsla(${h}, ${s}, ${l}, ${alpha})`;
}

/** The resolved chart chrome for the current theme. Read once per render of a chart (cheap) and again
 *  whenever the theme flips — `EChart` re-reads on the documentElement class mutation. */
export interface EchartsTheme {
  palette: string[];
  accent: string;
  text: string;
  muted: string;
  border: string;
  surface: string;
  /** The sequential ramp a heatmap / value-colored chart interpolates across (cool → hot). */
  ramp: string[];
  /** The SINGLE-HUE sequential ramps, keyed by hue name. See {@link SequentialRamp}.
   *
   *  OPTIONAL on purpose: `echartsTheme()` always fills it, but a hand-built theme (every
   *  `plotOption/*.test.ts` fixture) predates this field, and consumers already fall back to
   *  `ramp`. Making it required would force a mechanical edit through a dozen fixtures to buy
   *  nothing — the fallback is the real contract. */
  ramps?: Record<SequentialRamp, string[]>;
}

/** The sequential ramps a value-tinted chart can interpolate across.
 *
 *  `spectral` is the six-token cyan→rose rainbow, and it is the right default for a measure whose
 *  high end genuinely IS the alarming end (energy intensity, water). It is the WRONG one for a
 *  measure that never leaves a safe band: an office at 394–443 ppm CO2 painted across a rainbow
 *  reads as a severity scale and invents urgency the data does not carry. The single-hue ramps say
 *  "more of the same thing" rather than "worse".
 *
 *  Each is ONE existing token stepped by opacity — never a second palette, so they track the theme
 *  and the accent hue automatically. */
export type SequentialRamp = "spectral" | "accent" | "blue" | "green" | "amber";

/** The alpha steps a single-hue ramp walks. Starts at 0.10 rather than 0 so the lowest bucket is
 *  still visible against the surface — a cell that fades to invisible reads as missing data. */
const HUE_STEPS = [0.1, 0.28, 0.46, 0.64, 0.82, 1];

/** One token → a faint-to-full ramp. */
function hueRamp(token: string): string[] {
  return HUE_STEPS.map((a) => tokenColor(token, a));
}

export function echartsTheme(): EchartsTheme {
  // A perceptually-ordered sequential ramp built from the SAME tokens (cyan → teal → green → gold →
  // orange → rose). Energy/water intensity reads hot-at-the-top without a second hardcoded palette.
  const spectral = ["--chart-4", "--chart-2", "--chart-6", "--chart-7", "--chart-3", "--chart-5"].map(
    (t) => tokenColor(t),
  );

  return {
    palette: PALETTE_TOKENS.map((t) => tokenColor(t)),
    accent: tokenColor("--accent"),
    text: tokenColor("--foreground"),
    muted: tokenColor("--muted"),
    border: tokenColor("--border"),
    surface: tokenColor("--popover"),
    ramp: spectral,
    ramps: {
      spectral,
      accent: hueRamp("--accent"),
      blue: hueRamp("--chart-1"),
      green: hueRamp("--chart-6"),
      amber: hueRamp("--chart-7"),
    },
  };
}

/** The shared axis chrome (muted ticks, faint split lines) every echarts panel spreads onto its axes,
 *  so the panels cannot drift from each other. */
export function axisChrome(theme: EchartsTheme) {
  return {
    axisLine: { lineStyle: { color: theme.border } },
    axisTick: { show: false },
    axisLabel: { color: theme.muted, fontSize: 11 },
    splitLine: { lineStyle: { color: theme.border, opacity: 0.38, type: "dashed" as const } },
    nameTextStyle: { color: theme.muted, fontSize: 11 },
  };
}

/** The shared tooltip surface — the popover token, a soft ring, the app's text color. */
export function tooltipChrome(theme: EchartsTheme) {
  return {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    textStyle: { color: theme.text, fontSize: 12 },
    extraCssText: "border-radius:8px;box-shadow:0 8px 24px hsl(0 0% 0% / 0.18);",
  };
}

/** The shared legend chrome. */
export function legendChrome(theme: EchartsTheme) {
  return {
    textStyle: { color: theme.muted, fontSize: 11 },
    inactiveColor: theme.border,
    icon: "roundRect" as const,
    itemWidth: 10,
    itemHeight: 10,
  };
}
