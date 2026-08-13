// A date <input> that DISPLAYS in the viewer's resolved `date_style` (EU/ISO/USA from Settings →
// Preferences) instead of the browser locale. The native `<input type="date">` keeps the calendar
// picker and the ISO `YYYY-MM-DD` value contract (what `value`/`onChange` speak, unchanged); we only
// swap what the user SEES. The native text is made transparent and a pref-styled overlay is painted on
// top — so US browsers stop forcing MM/DD/YYYY and every field follows the one preference.
//
// Why an overlay and not a plain text field: the calendar popup is native and free, and losing it to
// honor a format would be a downgrade. The overlay honors the pref while keeping the picker.
//
// The native control is `opacity-0` (NOT `color: transparent` — Chromium keeps painting the
// datetime-edit segments regardless of `color`, which doubled the text over the overlay), so the
// facade paints everything: the pref-styled value AND the calendar glyph. Clicking anywhere opens
// the native picker via `showPicker()`.

import { useRef } from "react";
import { Calendar } from "lucide-react";

import { cn } from "../lib/cn";
import { datePlaceholder, formatDateField, type DateStyle } from "../lib/formatDateField";

export interface PrefDateInputProps {
  value: string; // ISO `YYYY-MM-DD` (the native input contract)
  onChange: (iso: string) => void;
  /** The viewer's resolved `date_style`. INJECTED rather than read from a prefs hook: resolving it
   *  needs the shell's session store and two network calls, which would drag the whole preference
   *  subsystem into the kit for one three-value enum. The host already knows the answer — it passes it.
   *  Absent ⇒ the product default (`eu`), the same builtin lb folds to, so the un-injected field order
   *  never disagrees with the resolved one. */
  dateStyle?: DateStyle;
  className?: string;
  "aria-label"?: string;
}

export function PrefDateInput({ value, onChange, dateStyle, className, ...rest }: PrefDateInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const style = dateStyle ?? "eu";
  const shown = formatDateField(value, style) || datePlaceholder(style);
  const empty = !formatDateField(value, style);

  return (
    <div
      className={cn(
        "dash-kit relative inline-flex h-8 items-center rounded-md border border-border bg-bg text-xs shadow-sm transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20",
        className,
      )}
    >
      {/* The pref-styled facade the user reads: value + our own calendar glyph (the native one is
          invisible along with the rest of the control). */}
      <span
        aria-hidden
        className={cn("pointer-events-none px-2.5 pr-7", empty && "text-muted/60")}
      >
        {shown}
      </span>
      <Calendar aria-hidden size={13} className="pointer-events-none absolute right-2 text-muted" />
      {/* The real control: fully invisible (opacity-0) but a live native calendar picker and the ISO
          value contract. Absolutely fills the box; any click opens the picker via showPicker(). A raw
          <input> is required here — the shadcn <Input> can't be the invisible, overlaid native date
          control that keeps the picker while the pref-styled span paints the visible text. */}
      {/* eslint-disable-next-line no-restricted-syntax */}
      <input
        {...rest}
        ref={ref}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={() => {
          try {
            ref.current?.showPicker();
          } catch {
            // showPicker can throw outside a user gesture / unsupported — the focused control still works.
          }
        }}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}
