// Pure client-side format/parse for an EDITABLE date field (no time), keyed on the viewer's resolved
// `date_style`. This is deliberately NOT `format.datetime` (the host round-trip): that verb renders a
// canonical UTC *instant* for display, whereas a date <input> holds a bare calendar date (`YYYY-MM-DD`,
// no tz, no time) that the user types/picks. The two must not be conflated — a field has no instant to
// place in a timezone. Here we only reorder the Y/M/D parts per style; the stored/emitted value stays
// the ISO `YYYY-MM-DD` the native input contract uses.

/** The viewer's resolved date-field style. Vendored as a 3-value union rather than imported from the
 *  shell's prefs types: it is the whole of what this module needs, and pulling `prefs.types` in would
 *  drag the shell's preference subsystem into a pure formatter. */
export type DateStyle = "eu" | "iso" | "usa";

/** The separator + field order for each style. ISO is the canonical wire form. */
const SEP: Record<DateStyle, string> = { eu: "/", iso: "-", usa: "/" };

/** Human placeholder for the field, e.g. `DD/MM/YYYY`, so an empty field reads correctly per style. */
export function datePlaceholder(style: DateStyle): string {
  const s = SEP[style];
  if (style === "usa") return `MM${s}DD${s}YYYY`;
  if (style === "iso") return `YYYY${s}MM${s}DD`;
  return `DD${s}MM${s}YYYY`;
}

/** ISO `YYYY-MM-DD` → the pref-styled display string. Empty/invalid input returns "" so the caller
 *  can show the placeholder rather than a garbled partial date. */
export function formatDateField(iso: string, style: DateStyle): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!m) return "";
  const [, y, mo, d] = m;
  const s = SEP[style];
  if (style === "usa") return `${mo}${s}${d}${s}${y}`;
  if (style === "iso") return `${y}${s}${mo}${s}${d}`;
  return `${d}${s}${mo}${s}${y}`;
}

/** Pref-styled display string → ISO `YYYY-MM-DD`, or "" if it doesn't parse. The inverse of
 *  `formatDateField`; used when the user edits the visible text directly. */
export function parseDateField(text: string, style: DateStyle): string {
  const parts = (text ?? "").split(/[/\-.]/).map((p) => p.trim());
  if (parts.length !== 3 || parts.some((p) => !/^\d+$/.test(p))) return "";
  let y: string, mo: string, d: string;
  if (style === "usa") [mo, d, y] = parts;
  else if (style === "iso") [y, mo, d] = parts;
  else [d, mo, y] = parts;
  if (y.length !== 4) return "";
  const iso = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : "";
}
