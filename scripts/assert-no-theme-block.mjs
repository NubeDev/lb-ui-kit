// Guard: the kit's compiled CSS never redefines the host's theme.
//
// An extension UI renders INSIDE the host DOM. A `:root { --bg: … }` or `.dark { … }` block in a kit
// stylesheet does not theme the kit — it repaints the WHOLE host application, because those selectors
// match host elements. This exact failure already shipped once in the family (the modbus extension
// turned every page amber), which is why the extensions contract states it as a hard rule and why the
// kit proves it mechanically rather than by review.
//
// The one legitimate `:root,:host{…}` in the output is Tailwind v4's own `theme.css` defaults inside
// `@layer theme` (`--font-sans`, `--spacing`, …). Those are Tailwind's design tokens, not the host's
// app tokens, so they are allowed by name — every `--bg`/`--panel`/`--fg`/`--accent`-class token is not.
//
// One responsibility: prove the CSS-isolation invariant on the BUILT artifact. Run from `pnpm check`.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const css = join(root, "dist", "dash-kit.css");

if (!existsSync(css)) {
  console.error("assert-no-theme-block: dist/dash-kit.css missing — run `pnpm build` first.");
  process.exit(1);
}

const text = readFileSync(css, "utf8");
const problems = [];

// A `.dark` selector has no legitimate use in a kit stylesheet at all: the host owns the mode.
for (const m of text.matchAll(/\.dark\b[^{,]*/g)) {
  problems.push(`\`.dark\` selector: ${m[0].trim()}`);
}

// A `:root`/`:host` rule is allowed ONLY if every custom property it declares is a Tailwind theme
// default. Any host app token (`--bg`, `--panel`, `--fg`, `--accent`, `--border`, `--muted`, `--radius`)
// declared at `:root` would leak into the host.
const HOST_TOKENS = /--(bg|panel|panel2|fg|muted|muted-fg|mutedForeground|accent|accent2|border|radius|surface|overlay)\s*:/;
for (const m of text.matchAll(/(:root|:host)[^{]*\{([^}]*)\}/g)) {
  if (HOST_TOKENS.test(m[2])) {
    problems.push(`\`${m[1]}\` block declares a HOST theme token — it would repaint the host app.`);
  }
}

if (problems.length) {
  console.error("assert-no-theme-block: the kit stylesheet leaks into the host:");
  for (const p of problems) console.error(`  • ${p}`);
  console.error("\nKit CSS must alias host tokens under `.dash-kit`, never define them at `:root`/`.dark`.");
  process.exit(1);
}

console.log("assert-no-theme-block: ok — no host theme block in dist/dash-kit.css.");
