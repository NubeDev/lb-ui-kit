// The kit's ONE provider. Everything the kit needs from its host arrives here and nowhere else:
// how to reach the node (`client`), which workspace it is in (`ws`), the host's resolved theme tokens
// (`theme`, for canvas/JS surfaces that cannot read a CSS var), and how to resolve "the viewer's zone"
// (`zone`).
//
// It is deliberately NOT a QueryClient provider. The shell keeps its own client and re-points only its
// cache consumers; an extension composes the kit's cache provider inside this one. Minting a client
// here would make every host adopt the kit's cache wholesale, which is a separate cleanup.
//
// WORKSPACE: `ws` is a cache-de-dup key, not the security wall. Every kit cache key is ws-prefixed so a
// workspace switch is a different entry, but the host still re-checks the workspace from the token on
// every call. The kit never sees a token and must never be handed one.
//
// One responsibility: hold the host injections. No I/O, no fetching.

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { KitClient } from "../client/types";

/** The host's resolved theme tokens — the `WidgetCtx.theme` / `PageCtx` shape the SDK ships (concrete
 *  strings, no `var()`). DOM surfaces inherit the host tokens through the CSS cascade and can ignore
 *  this; a canvas/JS surface reads it and recolors when it changes. Structurally typed so the kit does
 *  not take an SDK dependency for one shape. */
export interface KitTheme {
  bg?: string;
  panel?: string;
  fg?: string;
  muted?: string;
  mutedForeground?: string;
  accent?: string;
  border?: string;
  radius?: string;
  fontSans?: string;
  fontMono?: string;
  /** The categorical chart ramp. */
  chart?: string[];
  [token: string]: unknown;
}

/** How the kit resolves "the viewer's time zone" when nothing more specific is set. Replaces the
 *  shell-only `preferredZone()` import that used to be `lib/timerange`'s single outside coupling —
 *  a prop rather than an SDK change, so no `ui-v*` tag is involved. Default: the browser zone. */
export type ZoneResolver = () => string;

/** The browser's zone, or `UTC` when the platform will not say. The default {@link ZoneResolver}.
 *  Never guesses UTC when a real zone is available — a chart silently drawn in the wrong zone is the
 *  failure mode this exists to avoid. */
export function browserZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export interface KitContextValue {
  client: KitClient;
  ws: string;
  theme?: KitTheme;
  zone: ZoneResolver;
  /** Where overlay content portals to. `null`/absent ⇒ Radix's default (`document.body`). */
  portalContainer: HTMLElement | null;
}

const KitContext = createContext<KitContextValue | null>(null);

export interface KitProviderProps {
  /** The whole integration — build it with `makeKitClient(bridge)` (extension) or
   *  `makeKitClient((t, a) => invoke("mcp_call", { tool: t, args: a ?? {} }))` (shell). */
  client: KitClient;
  /** The workspace this subtree reads in. Keys every kit cache entry; NOT the security wall. */
  ws: string;
  /** The host's resolved theme tokens (`ctx.theme`). Re-supply on a host light/dark toggle. */
  theme?: KitTheme;
  /** Resolve the viewer's zone. Defaults to {@link browserZone}. */
  zone?: ZoneResolver;
  /**
   * Where the kit's overlay content (dropdowns, popovers, selects, dialogs, tooltips) portals to.
   *
   * **Extensions must pass this.** Radix portals overlay content to `document.body` so it escapes an
   * ancestor's `overflow` clipping. Standalone that is fine — the kit tags its portal content with its
   * own `.dash-kit` scope class, which matches anywhere in the document. But an extension's build ALSO
   * scopes every utility under `[data-ext-root]` (the SDK's `extTailwindPreset`), and `document.body`
   * is outside that root — so inside an ext, portalled content matches NONE of the compiled CSS and
   * renders as an unstyled, transparent, full-width overlay. Nothing errors; it just looks broken.
   *
   * In an extension: `portalContainer={usePortalContainer()}` (from `@nube/ext-ui-sdk`, which returns
   * the ext's scoped root). In the shell, omit it — the host has no such scoping and the default is
   * correct.
   *
   * Absent ⇒ `null` ⇒ Radix's default container, so every existing caller is unaffected.
   */
  portalContainer?: HTMLElement | null;
  children: ReactNode;
}

/** Wrap a kit-built page. That is the entire integration:
 *
 * ```tsx
 * export function App({ ctx, bridge }: { ctx: PageCtx; bridge: PageBridge }) {
 *   return (
 *     <KitProvider client={makeKitClient(bridge)} ws={ctx.workspace} theme={ctx.theme}>
 *       <MyClientDashboard />
 *     </KitProvider>
 *   );
 * }
 * ```
 */
export function KitProvider({
  client,
  ws,
  theme,
  zone,
  portalContainer = null,
  children,
}: KitProviderProps) {
  const value = useMemo<KitContextValue>(
    () => ({ client, ws, theme, zone: zone ?? browserZone, portalContainer }),
    [client, ws, theme, zone, portalContainer],
  );
  return <KitContext.Provider value={value}>{children}</KitContext.Provider>;
}

/** The kit context, or `null` outside a provider. Prefer the named hooks below; this exists for a
 *  surface that must degrade rather than throw. */
export function useKitOptional(): KitContextValue | null {
  return useContext(KitContext);
}

/** The kit context. Throws outside a `KitProvider` — a kit surface with no client has no honest
 *  behaviour available: it cannot read, and rendering empty would be indistinguishable from "no data". */
export function useKit(): KitContextValue {
  const ctx = useContext(KitContext);
  if (!ctx) {
    throw new Error(
      "useKit: no <KitProvider>. Wrap the page: <KitProvider client={makeKitClient(bridge)} ws={ctx.workspace}>",
    );
  }
  return ctx;
}

/** The injected client. */
export function useKitClient(): KitClient {
  return useKit().client;
}

/** Where overlay content should portal to — the value every kit primitive passes to its Radix
 *  `Portal container`. `null` (no provider, or a host that did not inject one) is exactly what Radix
 *  reads as "use the default container", so a kit primitive works standalone and inside an ext alike.
 *
 *  Deliberately built on `useKitOptional`, NOT `useKit`: a primitive like a tooltip or dropdown must
 *  render outside a `KitProvider` (a story, a bare test) rather than throw. Losing the scope there
 *  costs styling; throwing costs the page. */
export function usePortalContainer(): HTMLElement | null {
  return useKitOptional()?.portalContainer ?? null;
}

/** The workspace this subtree reads in. */
export function useKitWs(): string {
  return useKit().ws;
}

/** The host's resolved theme tokens, if supplied. */
export function useKitTheme(): KitTheme | undefined {
  return useKit().theme;
}

/** The zone resolver — the injected replacement for the shell's `preferredZone()`. */
export function useKitZone(): ZoneResolver {
  return useKit().zone;
}
