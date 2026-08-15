# `@nube/dash-kit` — the Lazybones dashboard machinery, as a kit

An extension author building a client dashboard can already call every read verb the shell calls — and
then has to hand-rebuild every piece of machinery the shell owns: the time-range picker, the source
picker, the query cache, the chart kit. So they ship a worse dashboard than the shell's, and it drifts.

This repo is the missing **publish channel**. The machinery was already built transport-agnostic for
exactly this; it just had nowhere to be published to.

**Declare a client's domain, vibecode one extension page, get the shell's real machinery — caching
included — for free.**

Scope + rationale: [`NubeIO/rubix-ai` → `docs/scope/ui/ext-ui-kit-scope.md`](https://github.com/NubeIO/rubix-ai/blob/main/docs/scope/ui/ext-ui-kit-scope.md).
Build tracker: [rubix-ai#152](https://github.com/NubeIO/rubix-ai/issues/152).

## The whole integration

```tsx
import { KitProvider, makeKitClient } from "@nube/dash-kit";
import "@nube/dash-kit/style.css";

export function App({ ctx, bridge }: { ctx: PageCtx; bridge: PageBridge }) {
  return (
    <KitProvider client={makeKitClient(bridge)} ws={ctx.workspace} theme={ctx.theme}>
      <MyClientDashboard />
    </KitProvider>
  );
}
```

In the shell the same call site passes `makeKitClient((tool, args) => invoke("mcp_call", { tool, args }))`.
**One code path, both hosts** — which is what makes "keep them in sync" mechanical instead of aspirational.

`makeKitClient` is a real mapping layer, not a pass-through: only the cache's seam is literally
`(tool, args)`. `SourceLoaders` and `InsightsClient` are typed bags of named functions, so the adapter
is where the kit records which verb each loader rides and how its rows come back.

## Installing

```jsonc
// your-extension/ui/package.json
{
  "dependencies": {
    "@nube/ext-ui-sdk": "github:NubeDev/lb-ext-ui-sdk#ui-v0.16.0",
    "@nube/dash-kit": "github:NubeDev/lb-ui-kit#kit-v0.7.2"
  }
}
```

Pinned by git tag, exactly as `@nube/ext-ui-sdk` already is. `dist/` is **committed** — a `github:` dep
installs the tree as-is with no build step. Check what tags exist before pinning:

```sh
git ls-remote --tags https://github.com/NubeDev/lb-ui-kit
```

## The manifest — paste the constant, don't hand-write the list

A kit-built page needs its verbs in **two** places, and it under-renders **silently** if one is missed.
The kit exports the lists so you cannot get it wrong:

```ts
import { DASH_KIT_READ_CAPS, DASH_KIT_READ_SCOPE } from "@nube/dash-kit";
```

```toml
[capabilities]
request = ["mcp:viz.query:call", "mcp:series.read:call", "mcp:series.latest:call", "mcp:series.find:call"]

[ui]
scope = ["viz.query", "viz.query_batch", "series.read", "series.latest", "series.find"]
```

**Five scope entries, four capabilities — that asymmetry is deliberate.** lb aliases `viz.query_batch`
onto `mcp:viz.query:call` host-side ("a fan-in of the *same* authorized read, not a new privilege"), so
no `mcp:viz.query_batch:call` exists in any role bundle. But the shell's bridge filter is a **literal
tool-name set** over `[ui] scope` and knows nothing of that alias: `["viz.query"]` alone gets every
batch call rejected client-side as `out_of_scope: viz.query_batch` before it ever reaches the gate.
No author would guess that, which is why it ships as a constant.

## What you inherit

| Property | Why it matters |
|---|---|
| **Batch fan-in** | N tiles → one `viz.query_batch` round trip, chunked to lb's 64-panel cap. Source-blind: the loader never inspects a panel's source. |
| **ws-scoped keys** | Every key is workspace-prefixed and canonicalised. A workspace switch is a different entry. **The token is never part of a key** — the kit never sees one. |
| **Scope narrowing** | Only the built-ins a spec *references* ride its key, so an unrelated variable change does not re-key a panel. |
| **Per-visit lifetime** | One client per visit, dropped on leave. |
| **Honest denials** | `retry: false`, deliberately. A capability deny surfaces immediately as **denied** — never retried into a fabricated success, never a hanging spinner. |
| **Offline mirror** | An IndexedDB mirror of the discovery slice, so warm opens survive a reload. |

### Denied ≠ empty ≠ loading

A kit surface that renders "no data" over a capability refusal is a **bug in the kit**. A denied verb
rejects and is rendered as denied, naming the missing capability. Use `isKitDenied(e)` /
`isOutOfScope(e)` to tell a refusal from a transport failure.

`InsightsClient.ack`/`resolve` are **writes**. The kit reads, and extension bridge writes are unstarted
(`U-ext-bridge-write`), so they reject as denied — never wired through silently, never fake-succeeding.

## Rules this repo is built to

1. **The kit never names an extension.** It takes a client and a workspace and is otherwise blind.
   Nothing it does can widen a grant; the host re-checks every call.
2. **The host owns the theme.** No `:root{}` / `.dark{}` token block, no `@tailwind base`. All CSS is
   scoped under `.dash-kit`; tokens are *aliases* of the host's with standalone fallbacks. Canvas
   surfaces read `ctx.theme` via `useKitTheme()`. `scripts/assert-no-theme-block.mjs` fails the build
   on a regression.
3. **One React, one query-core.** `react`/`react-dom` are externalised so a remote resolves the shell's
   one React; `@tanstack/query-core` is a **peer** dep, never bundled. Two copies are two
   structurally-incompatible `QueryClient` types, and the failure reads as an inscrutable private-field
   error rather than a cache miss. `scripts/assert-single-copy.mjs` proves it.
4. **The kit ships page bodies, never a mount.** `remoteEntry.tsx` stays one `defineRemote(...)` call.

## Development

```sh
pnpm install
pnpm check     # typecheck + test + build + both invariant guards
```

`dist/` is committed, so **rebuild and commit it in the same change** as any source edit — a git dep
serves what is in the tree.

### Releasing

PR → merge → tag `kit-vX.Y.Z` → consumers bump the pin **and regenerate their lockfiles**. A tag pushed
without a consumer lockfile regen is silently green locally and red everywhere else.

## Status

| Tag | Ships |
|---|---|
| `kit-v0.1.0` | Tier 0 — `KitProvider`, `makeKitClient`, `DASH_KIT_READ_SCOPE`, the transport vocabulary |
| `kit-v0.2.0` | Tier 1a — `lib/timerange` (the lb-pinned grammar + its conformance fixture), `DashboardRangePicker`, `rangePresets`, `PrefDateInput` |
| `kit-v0.3.0` | Tier 1b — **the read cache**: batch fan-in, ws-scoped keys, scope narrowing, the per-visit client, the IndexedDB mirror |
| `kit-v0.4.0` | Tier 1c — the substrate: `source-picker`, `insights`, `panel`, `nav-rail` (moved verbatim; `ui/packages/*` deleted) |
| `kit-v0.4.1` | Fix: `VizBatchProvider` no longer requires a `KitProvider` when a `call` is injected |
| `kit-v0.5.0` | Picks up rubix-ai#127: configurable week start (`weekStart` prop), current-period windows resolve start-of-period → now, updated lb conformance fixture, `addUnits` exported |
| `kit-v0.6.0` | **Tier 2a — the chart substrate**: `EChart` (the ONE engine wrapper), `echartsTheme` (the token bridge), `ChartState` (loading/denied/error/empty/table-only), `ShareBar`/`ShareLegend`. `echarts` is a **peer**, lazy-loaded inside the wrapper |
| `kit-v0.7.1` | **Tier 2b — the embed**: `PanelEmbed` (a ready cell / a spec / a library `panel:{id}`) + `registerPanelRenderer`. `panel.get` joins `DASH_KIT_READ_SCOPE` |

Tier 2's consumer arrived (`ext-pdnsw`, rubix-ai#170) and the cut was made from the SHELL's incumbents
rather than the consumer's re-derivations — publishing a second wrapper into a family that already has
one is the parallel-renderer drift this kit exists to stop.

### The chart substrate (Tier 2a)

```tsx
import { EChart, ChartState, echartsTheme, ShareBar } from "@nube/dash-kit";

<EChart
  ariaLabel="site demand"
  option={(theme) => ({ series: [{ type: "line", data, itemStyle: { color: theme.accent } }] })}
  summary={<ol className="sr-only">{data.map((v, i) => <li key={i}>{v}</li>)}</ol>}
/>
```

Four things you get for free, each of them a silent failure elsewhere:

- **Resize.** ECharts has no `<ResponsiveContainer>` — an instance sizes itself once at creation. The
  `ResizeObserver` is in the wrapper.
- **`notMerge`.** ECharts merges option updates by default, so a series that *disappears* keeps its old
  data on screen. Options replace whole.
- **Theme.** `option` is a **function of the resolved theme**, re-run when the host flips light/dark.
  Colours come from the **host's** CSS variables (canvas cannot read a class), so a kit chart never
  drifts from the rows beside it.
- **`summary`.** A visually-hidden, DOM-order readout of what the canvas draws. It is the accessibility
  story *and* the render-test target — which is why the renderer can stay **canvas** (`init` throws
  under jsdom; the wrapper bails quietly and the summary is still there).

**`echarts` is a peer, and it is lazy.** The wrapper `import()`s the engine from an effect, so a page
with no chart downloads none of it. The kit's default registration is small and documented
(`DASH_KIT_ECHARTS_PARTS`): `BarChart`, `LineChart`, `PieChart`, `ScatterChart`, `GridComponent`,
`LegendComponent`, `TooltipComponent`, `DatasetComponent`, `MarkLineComponent`, `MarkAreaComponent`,
`TitleComponent`, `CanvasRenderer`. **An unregistered series type fails silently** — the chart mounts,
sizes itself and draws nothing but axes — so a host with a wider vocabulary replaces the list:

```ts
import { setEchartsLoader } from "@nube/dash-kit";
// The thunk keeps it lazy. Register the kit's parts PLUS your own in that module.
setEchartsLoader(() => import("./myEchartsRegistration").then((m) => m.echarts));
```

**Not everything with proportions is a chart.** `ShareBar` draws parts-of-a-whole in CSS, because thirty
roster rows must not mean thirty canvases and thirty ResizeObservers. If the reader gets the number from
the legend, it is a `ShareBar`; if they read it off an axis, it is an `EChart`.

### The embed (Tier 2b) — the host's REAL panels on your page

This is the point of Tier 2: not lookalike components, but the shell's actual widgets.

```tsx
import { PanelEmbed } from "@nube/dash-kit";

// A panel a team already curated in the shell's library, by id:
<PanelEmbed id="panel:site-demand" range={range} />

// Or an inline spec you build yourself:
<PanelEmbed cell={{ i: "demand", view: "timeseries", sources: [{ refId: "A", tool: "viz.query", args }] }} />
```

Three modes — a ready `cell`, a `spec`, or a library **`panel:{id}`**. The library mode is the one worth
noticing: an extension page can reuse curated panels **by id** instead of re-authoring their queries.
The lens story holds — `panel.get` gates the record, and the panel's own sources re-check under the
viewer's caps at render, so embedding a shared panel never widens access.

**The kit does not draw the panel.** It owns the contract — the three modes, the fetch, the read cache
(which the renderer needs and breaks without), and the honest `denied` / `error` / `loading` states —
and delegates the drawing to whatever renderer the **host** registered:

```ts
// in the host shell, once at boot
import { registerPanelRenderer } from "@nube/dash-kit";
registerPanelRenderer(({ cell, ws, range, scope, refreshKey }) => (
  <WidgetHost cell={cell} workspace={ws} range={range} scope={scope} refreshKey={refreshKey} />
));
```

That is deliberate. A kit that shipped its own panel components would ship a SECOND renderer, which
resembles the first until the day it doesn't. Delegating means a chart on an extension page and the same
chart on a dashboard are literally the same code.

The registry is a `Symbol.for()` slot on `globalThis`, not a React context — an extension's bundle
carries its own copy of this kit, so a context created in the shell's copy is invisible to the ext's
(the provider mounts, `useContext` returns the default, nothing resolves and nothing errors). A host that
registers nothing gets an honest "no panel renderer registered" state, never an empty box.

**No grid.** The kit's Tier 2 edge is the single-panel embed; laying panels out is host product (drag,
resize, breakpoints, persistence, undo). An ext page that wants two panels side by side has CSS.

### Scoping a kit component

Utilities are compiled **nested under a scope root**, so every kit component puts that class on its own
root — including Radix **portal** content, which renders at the document root outside its trigger's
subtree and would otherwise be entirely unstyled.

There are five roots: `.dash-kit` (the kit's own) plus `.lb-panel`, `.nav-rail`, `.sp-root` and
`.ins-root`, which came in with the packages that moved here and already carried their own non-leaky
scope. They are kept verbatim rather than rewritten — re-scoping every class string would risk visual
regressions to buy nothing, since a scoped root is a scoped root. `assert-no-theme-block.mjs` fails the
build if any compiled rule targeting a class escapes all five, and adding a sixth root is a deliberate
act: it widens what may match.

## Licence

`UNLICENSED` — proprietary NubeIO product code. Public so a credential-less `github:` dep resolves on a
client's CI and a contractor's machine, which is the whole point of a publish channel. Public visibility
grants **no** licence to use it; same posture as lb's own `packages/*`.
