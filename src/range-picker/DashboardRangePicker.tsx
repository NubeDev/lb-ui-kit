// The toolbar's time-range control (relative-time-range scope): a Grafana-style named-window menu
// over a range EXPRESSION pair. Three ways to commit a window, cheapest first:
//   - a QUICK RANGE commits its expression (`?from=this-month`, ONE URL param) — a click IS the
//     intent, and the shared link keeps meaning "this month" forever. The quick ranges are laid out
//     as a BAND × UNIT grid (see rangePresets.ts) so trailing-vs-calendar is shown, not explained;
//   - the RELATIVE field takes free text (`last-3-months`, `now-4h`) with a live-parsed preview
//     ("last-3-months → 2026-05-03 → 2026-08-03", or a red parse error) and an explicit Apply;
//   - the ABSOLUTE tab is unchanged: two date fields, Apply commits the ISO day pair (`to` EXCLUSIVE).
// Every committed range re-navigates and re-queries the board, so nothing commits on an intermediate
// keystroke/calendar click — presets excepted (one click, one commit).
//
// The trigger label comes from `labelOf` — a token names itself, so the old `matchPreset`
// reverse-lookup (re-resolving every preset to compare dates) is gone. Resolution/preview go through
// the shared `lib/timerange` twin; this file renders, it never does date maths.

import { useEffect, useMemo, useState } from "react";
import { CalendarRange, Check, ChevronDown } from "lucide-react";

import { Button } from "../primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../primitives/dropdown-menu";
import { Input } from "../primitives/input";
import { PrefDateInput } from "./PrefDateInput";
import type { DateStyle } from "../lib/formatDateField";
import { cn } from "../lib/cn";
import { isoDayOf, labelOf, resolveRange, shortLabelOf } from "../timerange";
import { browserZone, preferredZone } from "../timerange/zone";
import { useKitOptional } from "../provider/KitProvider";
import { RANGE_BANDS, RANGE_COLUMNS } from "./rangePresets";

export interface DashboardRangePickerProps {
  /** The committed range EXPRESSION pair (the URL contract; `to` absent for a window token). */
  from: string;
  to?: string;
  onApply: (range: { from: string; to?: string }) => void;
  /** The range-anchor timezone (`rangeTimezone(...)`) the preview resolves in. Absent ⇒ the viewer's LOCAL zone. */
  timezone?: string;
  /** Phone width (mobile-friendly-ui §4.2): trigger shows the short label; popover clamps. */
  compact?: boolean;
  /** The viewer's resolved `date_style`, threaded to the absolute-tab date fields. Absent ⇒ `eu`. */
  dateStyle?: DateStyle;
  /** Fired just before `onApply` when the user commits a window. The shell passes `markUserRefresh`
   *  so its panels show the refreshing indicator while the re-query lands; that is dashboard-refresh
   *  telemetry, not picker logic, so it is injected rather than shipped. Absent ⇒ nothing extra. */
  onUserApply?: () => void;
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export function DashboardRangePicker({
  from,
  to,
  onApply,
  timezone,
  compact,
  dateStyle,
  onUserApply,
}: DashboardRangePickerProps) {
  const [open, setOpen] = useState(false);
  // Absent ⇒ the viewer's LOCAL zone, never UTC — the preview must name the same day the window
  // actually resolves to (`rangeTimezone`), or it tells the operator the wrong date. The zone comes
  // from the `KitProvider` when there is one; the picker still renders standalone (a story, a test)
  // and falls back to the browser zone, which is what the shell did before the extraction.
  const kit = useKitOptional();
  const tz = preferredZone(kit?.zone ?? browserZone, timezone);

  // The RELATIVE free-text draft, seeded from the committed expression when it isn't an absolute pair
  // (an absolute pair belongs to the tab below). Follows outside commits so it never shows stale text.
  const seedRel = ISO_DAY.test(from) && to ? "" : from;
  const [rel, setRel] = useState(seedRel);
  // The ABSOLUTE draft. Seeded from the committed pair when it IS one, else empty until edited.
  const seedAbs = useMemo(
    () => (ISO_DAY.test(from) && to && ISO_DAY.test(to) ? { from, to } : { from: "", to: "" }),
    [from, to],
  );
  const [draft, setDraft] = useState(seedAbs);
  useEffect(() => {
    setRel(seedRel);
    setDraft(seedAbs);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- follow the COMMITTED range only
  }, [from, to]);

  // One clock per open, so every preview and the active-check agree — and a tab left open overnight
  // re-reads "today" on the next open. `open` IS the dependency (re-running is the point).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const nowMs = useMemo(() => Date.now(), [open]);

  // The relative field's live preview: resolved bounds, or the honest parse failure.
  const relPreview = useMemo(() => {
    const text = rel.trim();
    if (!text) return null;
    const r = resolveRange(text, undefined, nowMs, tz);
    if (!r) return { error: `Not a range expression — try last-3-months, this-month, now-4h.` };
    return { text: `${text} → ${isoDayOf(r.fromMs, tz)} → ${isoDayOf(r.toMs, tz)}` };
  }, [rel, nowMs, tz]);

  const commit = (range: { from: string; to?: string }) => {
    // A new window is a USER-driven refresh, so the host may want its panels to show the refreshing
    // indicator while the re-query lands. It never bumps `refreshKey` (the scope re-keys the query
    // directly), which is why the intent is signalled here rather than only in `useAutoRefresh`.
    onUserApply?.();
    onApply(range);
    setOpen(false);
  };

  const absDirty = draft.from !== from || draft.to !== to;
  const absInvalid = !!draft.from && !!draft.to && draft.from > draft.to;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          // 44px tap target on a phone (compact), compact 32px row on desktop.
          className={cn("dash-kit gap-1.5 px-2.5 text-xs font-normal", compact ? "h-11 md:h-8" : "h-8")}
          title="Change the dashboard time range"
        >
          <CalendarRange size={13} className="text-muted" />
          <span className="max-w-[13rem] truncate">
            {compact ? shortLabelOf(from, to) : labelOf(from, to)}
          </span>
          <ChevronDown size={13} className="text-muted" />
        </Button>
      </DropdownMenuTrigger>

      {/* The grid needs real width on desktop (5 unit columns); on a phone it collapses to one
          column per band, so the popover keeps the viewport clamp it always had. */}
      <DropdownMenuContent
        align="end"
        // `dash-kit` on the CONTENT too, not only the trigger: the content renders in a Radix PORTAL
        // at the document root, outside the trigger's subtree, so a scope class on the trigger alone
        // would leave every utility in the popover unstyled.
        className={cn(
          "dash-kit max-w-[calc(100vw-2rem)] p-0",
          compact ? "w-[calc(100vw-2rem)]" : "w-[42rem]",
        )}
      >
        <DropdownMenuLabel className="px-3 pt-2.5 text-[0.7rem] uppercase tracking-wide text-muted">
          Quick ranges
        </DropdownMenuLabel>

        {/* BAND × COLUMN (rangePresets.ts): the band headings carry the trailing-vs-calendar
            distinction, so `Last 60 minutes` sitting one band above `Last hour` in the same column
            explains itself. On a phone the unit columns stack — the grid is a desktop affordance,
            and a 5-wide grid at 390px would clip every label. */}
        <div className="px-1.5 pb-2">
          {RANGE_BANDS.map((band) => (
            <div key={band.id} className="mb-1 last:mb-0">
              <div className="flex items-baseline gap-1.5 px-1 pb-0.5 pt-1">
                <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted">
                  {band.label}
                </span>
                <span className="text-[0.65rem] text-muted">{band.hint}</span>
              </div>
              <div className={cn("grid gap-x-1 gap-y-0.5", compact ? "grid-cols-2" : "grid-cols-5")}>
                {RANGE_COLUMNS.map((col) => {
                  const cell = band.cells[col];
                  // An empty cell still occupies its column on desktop, so the units stay aligned
                  // across both bands; on a phone it would be a blank hole, so it is dropped.
                  if (compact && cell.length === 0) return null;
                  return (
                    <div key={col} className="min-w-0">
                      {!compact && (
                        <div className="px-2 pb-0.5 text-[0.65rem] uppercase tracking-wide text-muted/70">
                          {col}
                        </div>
                      )}
                      {cell.map((preset) => {
                        // Active = the URL literally carries this expression — no reverse-resolution.
                        const selected = !to && preset.expr === from;
                        return (
                          <Button
                            key={preset.id}
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full justify-start gap-1.5 px-2 text-xs font-normal",
                              compact ? "h-10" : "h-8",
                              selected && "bg-muted-bg font-medium text-fg",
                            )}
                            onClick={() => commit({ from: preset.expr })}
                          >
                            <Check
                              size={12}
                              className={cn("shrink-0 text-accent", !selected && "invisible")}
                            />
                            <span className="truncate">{preset.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <DropdownMenuSeparator className="my-0" />

        {/* The RELATIVE expression — anything the grammar speaks that the preset list doesn't. */}
        <div className="space-y-1.5 px-3 py-2.5">
          <div className="text-[0.7rem] uppercase tracking-wide text-muted">Relative range</div>
          <form
            className="flex items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              if (rel.trim() && relPreview && !("error" in relPreview)) commit({ from: rel.trim() });
            }}
          >
            <Input
              aria-label="dashboard relative range"
              className="h-8 flex-1 text-xs"
              placeholder="last-3-months, this-quarter, now-4h…"
              value={rel}
              onChange={(e) => setRel(e.target.value)}
            />
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs"
              disabled={!rel.trim() || !relPreview || "error" in relPreview}
              title="Apply this relative range — re-queries every panel"
            >
              Apply
            </Button>
          </form>
          {relPreview &&
            ("error" in relPreview ? (
              <p className="text-[0.7rem] text-danger">{relPreview.error}</p>
            ) : (
              <p className="truncate text-[0.7rem] text-muted" title={relPreview.text}>
                {relPreview.text}
              </p>
            ))}
        </div>

        <DropdownMenuSeparator className="my-0" />

        {/* The absolute window. Edited as a draft and committed by Apply — see the header note. */}
        <div className="space-y-2 px-3 py-2.5">
          <div className="text-[0.7rem] uppercase tracking-wide text-muted">Absolute range</div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <PrefDateInput
              aria-label="dashboard range from"
              dateStyle={dateStyle}
              className="flex-1"
              value={draft.from}
              onChange={(next) => setDraft((d) => ({ ...d, from: next }))}
            />
            <span>to</span>
            <PrefDateInput
              aria-label="dashboard range to"
              dateStyle={dateStyle}
              className="flex-1"
              value={draft.to ?? ""}
              onChange={(next) => setDraft((d) => ({ ...d, to: next }))}
            />
          </div>
          {absInvalid ? (
            <p className="text-[0.7rem] text-danger">The start date must not be after the end date.</p>
          ) : (
            <p className="text-[0.7rem] text-muted">
              The end date is exclusive — it ends at the start of that day.
            </p>
          )}
          <Button
            size="sm"
            className="h-8 w-full text-xs"
            disabled={!absDirty || absInvalid || !draft.from || !draft.to}
            title={
              absDirty ? "Apply this range — re-queries every panel" : "This range is already applied"
            }
            onClick={() => commit({ from: draft.from, to: draft.to })}
          >
            Apply range
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
