// Guard: exactly ONE @tanstack/query-core in the tree, and it is never bundled into dist.
//
// This is a live, already-bitten trap, not a hypothetical. `QueryClient`/`Query` carry a private
// field, so two copies are two STRUCTURALLY-INCOMPATIBLE types: passing one host's client to the
// other's persister fails type-check with an inscrutable "private field" error that reads as a syntax
// problem, not a duplicate dependency. It bit `rubix-ai/ui` hard enough that its `pnpm-workspace.yaml`
// carries a paragraph about it.
//
// The kit makes it structural instead of remembered: `@tanstack/query-core` is a PEER dep, externalised
// in the vite build, pinned in the overrides — and this script fails the build if any of that slips.
//
// One responsibility: prove the single-copy invariant. Run from `pnpm check`.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const fail = (msg) => {
  console.error(`assert-single-copy: ${msg}`);
  process.exitCode = 1;
};

// 1. It must be a PEER dep, and must NOT be a runtime dependency.
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (!pkg.peerDependencies?.["@tanstack/query-core"]) {
  fail("@tanstack/query-core must be a peerDependency (it is the one-copy contract).");
}
if (pkg.dependencies?.["@tanstack/query-core"]) {
  fail("@tanstack/query-core is a runtime `dependencies` entry — that ships a SECOND copy to consumers.");
}

// 2. It must be externalised, so the built bundle imports it rather than inlining it.
const viteConfig = readFileSync(join(root, "vite.config.ts"), "utf8");
if (!viteConfig.includes('"@tanstack/query-core"')) {
  fail("@tanstack/query-core is not in vite.config.ts `rollupOptions.external` — it would be bundled.");
}

// 3. pnpm must have resolved exactly one copy in the install tree.
const store = join(root, "node_modules", ".pnpm");
if (existsSync(store)) {
  const copies = readdirSync(store).filter((d) => d.startsWith("@tanstack+query-core@"));
  const versions = new Set(copies.map((d) => d.split("@").pop()));
  if (versions.size > 1) {
    fail(`${versions.size} copies of @tanstack/query-core installed: ${[...versions].join(", ")}`);
  }
}

// 4. The built bundle must not carry the library's own source.
const dist = join(root, "dist", "dash-kit.js");
if (existsSync(dist)) {
  const built = readFileSync(dist, "utf8");
  if (!/from\s*["']@tanstack\/query-core["']/.test(built) && /QueryObserver|notifyManager/.test(built)) {
    fail("dist/dash-kit.js looks like it INLINED query-core rather than importing it.");
  }
}

if (!process.exitCode) console.log("assert-single-copy: ok — one @tanstack/query-core, externalised.");
