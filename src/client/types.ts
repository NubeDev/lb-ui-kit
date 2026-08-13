// The kit's ONE injected seam. Every surface in the kit reaches the node through this and nothing
// else — no `@/` import, no fetch, no token. That is what makes the same code path work from the
// shell gateway AND an extension bridge, and it is why the kit can never widen a grant: the host
// re-checks every call regardless of what the kit asks for.
//
// One responsibility: the transport vocabulary. No React, no I/O.

import type { InsightsClient } from "../insights/types";
import type { SourceLoaders } from "../source-picker/types";

/** The leashed tool call — the SAME `(tool, args)` an `ExtBridge.call` / `PageBridge.call` /
 *  `WidgetBridge.call` takes, and the same shape `vizBatchLoader`'s `BatchCall` dispatches through.
 *  Returns `unknown`: the caller owns the decode, because the kit must never assume a wire shape it
 *  did not ask for. */
export type ToolCall = (tool: string, args?: Record<string, unknown>) => Promise<unknown>;

/** Anything with a leashed `call` — an `ExtBridge`, a `PageBridge`, a `WidgetBridge`. Accepted by
 *  {@link makeKitClient} so an extension passes its bridge straight through. */
export interface CallLike {
  call: <T = unknown>(tool: string, args?: Record<string, unknown>) => Promise<T>;
}

/** What {@link makeKitClient} accepts: a bridge, or a bare tool-call function (the shell's form —
 *  `(tool, args) => invoke("mcp_call", { tool, args })`). */
export type KitTransport = ToolCall | CallLike;

/** The assembled client a {@link KitProvider} takes. `call` is the raw seam the read cache dispatches
 *  through; `loaders` and `insights` are the typed bags the picker and the insights surfaces take.
 *  All three ride the ONE transport — this is a mapping layer, not three transports. */
export interface KitClient {
  /** The raw leashed call. The cache's batch loader binds directly to this. */
  call: ToolCall;
  /** The source picker's read seam, mapped onto the node's list verbs. */
  loaders: SourceLoaders;
  /** The insights read seam. Its WRITE methods (`ack`/`resolve`) reject as denied — see
   *  {@link makeKitClient}. */
  insights: InsightsClient;
}

/** Options that change WHICH verbs a loader rides, for hosts whose shape differs. Deliberately tiny:
 *  the kit is source-blind (rule 10) and must never learn an extension id. */
export interface KitClientOptions {
  /** `inbox.list` is per-channel, so a host that wants the inbox group fixes the channel here. Absent
   *  ⇒ the kit ships NO `listInbox` loader at all and the picker simply has no inbox group — an
   *  honest absent offer, never an empty one that looks like a denial. */
  inboxChannel?: string;
}

/** A rejection the kit raises for a verb it deliberately will not carry (today: the insights writes).
 *  Carries `denied` so a surface can render the standard **denied** state rather than an error toast,
 *  and so it is distinguishable from a transport failure. */
export class KitDeniedError extends Error {
  readonly denied = true;
  readonly tool: string;
  constructor(tool: string, why: string) {
    super(`denied: ${tool} — ${why}`);
    this.name = "KitDeniedError";
    this.tool = tool;
  }
}

/** True for a rejection the kit itself raised as a deliberate denial. Surfaces use this to pick the
 *  denied state over the error state. */
export function isKitDenied(e: unknown): e is KitDeniedError {
  return e instanceof KitDeniedError;
}

/** True for the SHELL bridge's local out-of-scope rejection (`out_of_scope: <tool>`), which is what a
 *  missing `[ui] scope` entry produces — the `viz.query_batch` trap in `scope.ts`. A kit surface must
 *  render this as **denied**, never as empty and never as a retryable error. */
export function isOutOfScope(e: unknown): boolean {
  return e instanceof Error && e.message.startsWith("out_of_scope:");
}
