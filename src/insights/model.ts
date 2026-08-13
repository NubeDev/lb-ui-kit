// Pure model helpers — the look-agnostic vocabulary of an insight (severity/status ordering + tone
// keys + a relative-time formatter). No React, no CSS: a host that brings its OWN look reads these to
// drive its own classes/badges (the "look is optional" seam). The package's own UI (`InsightBadge`
// etc.) maps the same tone keys onto scoped `--ins-*` tokens.

import type { Severity, Status } from "./types";

/** Severity floor ordering (info < warning < critical) — a `severity` filter is a FLOOR: selecting
 *  `warning` means warning-and-above. The index is the numeric rank for comparisons. */
export const SEVERITY_ORDER: Severity[] = ["info", "warning", "critical"];

/** Numeric rank of a severity (info=0 … critical=2). */
export function severityRank(s: Severity): number {
  return SEVERITY_ORDER.indexOf(s);
}

/** A tone KEY per severity — a stable, look-free token a host maps to its own palette. The package UI
 *  maps `critical → destructive`, `warning → warning`, `info → accent-2`; a host may map differently. */
export type Tone = "destructive" | "warning" | "accent-2" | "default" | "success";

/** Severity → tone key. */
export function severityTone(s: Severity): Tone {
  if (s === "critical") return "destructive";
  if (s === "warning") return "warning";
  return "accent-2";
}

/** Severity → the semantic color token a host paints with (the FindingsList lesson: tokens, both
 *  themes, never hex). The look-free {@link severityTone} stays the primitive — this is the ONE
 *  mapping of those tones onto the shell's CSS custom properties, promoted here (map-widget-scope
 *  decision 2) once a third view wanted it: `insight-trend`'s overlay, `fdd-matrix`'s cells, and
 *  `geomap`'s pin badges must not fork the severity palette. */
export function severityColor(s: Severity): string {
  switch (s) {
    case "critical":
      return "hsl(var(--destructive))";
    case "warning":
      return "hsl(var(--warning))";
    default:
      return "hsl(var(--accent-2))";
  }
}

/** Status → tone key. `open` reads as the primary accent (action due), `acked` as warning (claimed),
 *  `resolved` as success (done) — the Inbox status register. */
export function statusTone(s: Status): Tone {
  if (s === "open") return "default";
  if (s === "acked") return "warning";
  return "success";
}

/** A compact relative-time formatter ("2m ago", "1h 22m ago", "3d ago"). `now` defaults to the wall
 *  clock; pass it explicitly for a deterministic test (the package itself never calls `Date.now()`
 *  in a way that leaks into a snapshot). */
export function timeAgo(ts: number, now: number = Date.now()): string {
  const s = Math.max(1, Math.floor((now - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return s % 60 ? `${m}m ${s % 60}s ago` : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return m % 60 ? `${h}h ${m % 60}m ago` : `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/** The producer/run meta line under a title ("rule:cpu-hot · run:abc"). Pure — the UI + a host reuse it. */
export function originLine(origin: { kind: string; ref: string; run?: string }): string {
  const base = `${origin.kind}:${origin.ref}`;
  return origin.run ? `${base} · run:${origin.run}` : base;
}
