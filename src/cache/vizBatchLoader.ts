// The viz.query BATCH loader (dashboard-query-acceleration §B) — a DataLoader that coalesces the many
// per-cell `viz.query` fetches an open/tick produces into ONE `viz.query_batch {panels, now, cache}`
// round-trip, killing the browser's HTTP/1.1 connection ceiling (24 tiles → 24 POSTs behind a ~6-conn
// cap → ~4 serial waves → 1 call). It is a TRANSPORT optimization, not a new render path: each cell
// keeps its own `useVizQuery`/react-query entry and its one `SourceState` shape; the loader only
// changes HOW that cell's fetch reaches the wire (`load()` in place of a lone `bridge.call`).
//
// Invariants:
//   - **One data shape.** `load()` returns the SAME `{frames, rows}` a single `viz.query` returns; a
//     per-item `error`/`denied` REJECTS the load so the cell renders its existing denied/empty state
//     identically to the non-batch path (no new empty-state).
//   - **Feature-detect + graceful fallback.** A pin that predates the verb answers `viz.query_batch`
//     with NotFound/400; the loader detects that once, flips to UNSUPPORTED, and resolves every load
//     (this wave and after) via per-cell `viz.query` — so the board is correct on an un-bumped pin,
//     just without the round-trip win.
//   - **Chunked to the lb cap.** Panels beyond `MAX_PANELS` (64) are split into multiple batches — still
//     ≪ one round-trip per tile.
//   - **Source-blind (rule 10).** The loader never inspects a panel's source/tool; it forwards opaque
//     panels + a uniform `cache` directive and lets the host honor what each target cares about.

/** The lb per-batch panel cap (`viz/batch.rs::MAX_PANELS`). Over-cap the server answers `BadInput`, so
 *  we chunk to it rather than send an over-cap batch. */
export const MAX_PANELS = 64;

/** The transport seam the loader dispatches through — the SAME `{tool, args}` a `WidgetBridge.call`
 *  takes. Injected so a test can stub the wire (the sanctioned `invoke`-boundary pattern) and so the
 *  provider can bind a bridge leashed to `viz.query`/`viz.query_batch`. */
export type BatchCall = (tool: string, args: Record<string, unknown>) => Promise<unknown>;

/** The freshness directive threaded onto a batch/panel (dashboard-query-acceleration §A). */
export interface CacheDirective {
  ttl_s: number;
}

/** The `{frames, rows}` shape a single `viz.query` returns — what `load()` resolves to. */
export interface VizQueryResult {
  frames?: unknown[];
  rows?: Array<Record<string, unknown>>;
}

/** One per-panel result of `viz.query_batch` — either the query result, or a per-item failure. */
type BatchItem = (VizQueryResult & { status?: undefined }) | { status: "error" | "denied"; message?: string };

interface Pending {
  panel: unknown;
  cache?: CacheDirective;
  resolve: (r: VizQueryResult) => void;
  reject: (e: unknown) => void;
}

/** A batch loader instance. `load` is the per-cell entry; `supported` exposes the feature-detect state
 *  (for a status hint / test assertion). */
export interface VizBatchLoader {
  load(panel: unknown, cache?: CacheDirective): Promise<VizQueryResult>;
  readonly supported: boolean;
}

export interface VizBatchLoaderOptions {
  /** The coalescing window in ms — loads arriving within it join one batch. Small (a render's worth).
   *  Injectable so a test can flush deterministically. Default 12 ms. */
  windowMs?: number;
  /** The verb id for the batch call (defaults to the lb verb). */
  batchTool?: string;
  /** The verb id for the single/fallback call. */
  singleTool?: string;
}

const VIZ_QUERY_BATCH = "viz.query_batch";
const VIZ_QUERY = "viz.query";

/** Build a viz.query batch loader over `call`. Loads are coalesced per `windowMs`, chunked to
 *  `MAX_PANELS`, and fall back to per-cell `viz.query` when the batch verb is absent. */
export function makeVizBatchLoader(call: BatchCall, opts: VizBatchLoaderOptions = {}): VizBatchLoader {
  const windowMs = opts.windowMs ?? 12;
  const batchTool = opts.batchTool ?? VIZ_QUERY_BATCH;
  const singleTool = opts.singleTool ?? VIZ_QUERY;

  let pending: Pending[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;
  let supported = true;

  const schedule = () => {
    if (timer !== null) return;
    timer = setTimeout(flush, windowMs);
  };

  const flush = () => {
    timer = null;
    const wave = pending;
    pending = [];
    if (wave.length === 0) return;
    for (let i = 0; i < wave.length; i += MAX_PANELS) {
      void runChunk(wave.slice(i, i + MAX_PANELS));
    }
  };

  const runChunk = async (chunk: Pending[]) => {
    if (!supported) {
      await perItem(chunk);
      return;
    }
    const cache = maxCache(chunk);
    const args: Record<string, unknown> = { panels: chunk.map((p) => p.panel), now: 0 };
    if (cache) args.cache = cache;
    try {
      const out = (await call(batchTool, args)) as { results?: BatchItem[] } | undefined;
      const results = out?.results ?? [];
      chunk.forEach((p, idx) => settle(p, results[idx]));
    } catch (err) {
      // A batch-level failure. If it reads as an un-bumped pin (verb absent), disable batch for good so
      // subsequent waves skip straight to per-cell. Either way, resolve THIS wave per-cell so the board
      // is never blanked by a batch that couldn't run.
      if (looksUnsupported(err)) supported = false;
      await perItem(chunk);
    }
  };

  /** Fall back to one `viz.query` per pending item (the pre-batch path), carrying each item's own cache. */
  const perItem = async (chunk: Pending[]) => {
    await Promise.all(
      chunk.map(async (p) => {
        try {
          const args: Record<string, unknown> = { panel: p.panel };
          if (p.cache) args.cache = p.cache;
          const out = (await call(singleTool, args)) as VizQueryResult | undefined;
          p.resolve({ frames: out?.frames ?? [], rows: out?.rows });
        } catch (e) {
          p.reject(e);
        }
      }),
    );
  };

  /** Map one batch item onto its pending load — a result resolves; an error/denied REJECTS so the cell
   *  renders its existing denied/empty state (identical to the non-batch deny path). */
  const settle = (p: Pending, item: BatchItem | undefined) => {
    if (!item) {
      p.reject(new Error("viz.query_batch: missing result slice"));
      return;
    }
    if ("status" in item && (item.status === "error" || item.status === "denied")) {
      p.reject(new Error(item.message || item.status));
      return;
    }
    const ok = item as VizQueryResult;
    p.resolve({ frames: ok.frames ?? [], rows: ok.rows });
  };

  return {
    load(panel, cache) {
      return new Promise<VizQueryResult>((resolve, reject) => {
        pending.push({ panel, cache, resolve, reject });
        schedule();
      });
    },
    get supported() {
      return supported;
    },
  };
}

/** The largest `cache` directive across a wave — board-level freshness is uniform, but taking the max is
 *  the safe reconciliation if two ever differ (never cache SHORTER than any member asked). `undefined`
 *  when no member carries one (live). */
function maxCache(chunk: Pending[]): CacheDirective | undefined {
  let ttl = 0;
  for (const p of chunk) if (p.cache && p.cache.ttl_s > ttl) ttl = p.cache.ttl_s;
  return ttl > 0 ? { ttl_s: ttl } : undefined;
}

/** Whether a batch-level error means the verb is ABSENT (an un-bumped pin) vs a transient operational
 *  error. Only an "absent" verdict permanently disables batching; a transient error just falls back for
 *  the one wave and batching is retried next time. */
function looksUnsupported(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err ?? "")).toLowerCase();
  return /not.?found|unknown (tool|command|verb|method)|no such|unsupported|\b400\b|\b404\b|unrecognized/.test(
    msg,
  );
}
