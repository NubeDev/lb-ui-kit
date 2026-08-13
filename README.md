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
    "@nube/dash-kit": "github:NubeDev/lb-ui-kit#kit-v0.1.0"
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

Tier 1c (source-picker / insights / panel / nav-rail) follows as `kit-v0.4.0`. Tier 2 (genui, the viz/chart kit) is deliberately out until a real consumer defines
its edge.

### Scoping a kit component

Utilities are compiled **nested under `.dash-kit`**, so every kit component puts that class on its own
root — including Radix **portal** content, which renders at the document root outside its trigger's
subtree and would otherwise be entirely unstyled. `assert-no-theme-block.mjs` fails the build if any
compiled rule targeting a class escapes that scope.

## Licence

`UNLICENSED` — proprietary NubeIO product code. Public so a credential-less `github:` dep resolves on a
client's CI and a contractor's machine, which is the whole point of a publish channel. Public visibility
grants **no** licence to use it; same posture as lb's own `packages/*`.
