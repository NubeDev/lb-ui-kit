// The cross-implementation pin (relative-time-range scope, "one conformance fixture"): lb's Rust
// resolver generates + asserts `docs/contracts/time-range-conformance.json` upstream; the SAME rows
// are vendored here as `conformance.json` (committed by the PR that bumps the lb pin) and every row
// is asserted against the TypeScript twin. Drift between the two resolvers is a red test in one of
// the two repos, never a review question.
//
// Row shape: `{ expr: string, nowMs: number, tz: string, fromMs: number, toMs: number, to?: string }`
// — resolve `expr` as the `from`, with the row's optional `to` endpoint expression, at `nowMs` in
// `tz`, and demand EXACT ms equality on both bounds. (The generator also emits `fromIso`/`toIso` day
// projections, which the report CLI consumes upstream and this suite deliberately ignores: the ms
// pair is the thing the two resolvers must agree on.)
//
// IN THE KIT THE FIXTURE IS NOT OPTIONAL. Upstream in the shell this suite skipped when the file was
// absent, because the vendoring PR had not landed yet — and that skip was the extraction's biggest
// hazard: a wrong path after a move produces a GREEN, SILENTLY SKIPPED suite, which reads exactly like
// a passing conformance run. The kit ships the fixture, so a missing or empty one is a hard FAILURE
// here. It must pass byte-identically to the shell's, which is the whole point of vendoring it.

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { resolveRange } from "./resolve";

interface ConformanceRow {
  expr: string;
  nowMs: number;
  tz: string;
  fromMs: number;
  toMs: number;
  /** Present only on the fixture's two-endpoint rows (`from` + an explicit `to` expression). */
  to?: string;
}

/** The fixture path. Under the jsdom test environment `import.meta.url` is an http: URL, so fall back
 *  to a path rooted at the package root — the one place the vendored file can live either way. */
function fixturePath(): string {
  try {
    return fileURLToPath(new URL("./conformance.json", import.meta.url));
  } catch {
    return join(process.cwd(), "src", "timerange", "conformance.json");
  }
}

const FIXTURE = fixturePath();

function loadRows(): ConformanceRow[] {
  if (!existsSync(FIXTURE)) return [];
  try {
    const raw = JSON.parse(readFileSync(FIXTURE, "utf8")) as unknown;
    // Accept a bare array or a `{ rows: [...] }` wrapper — whichever shape the lb generator emits.
    const rows = Array.isArray(raw) ? raw : ((raw as { rows?: unknown[] })?.rows ?? []);
    return rows.filter(
      (r): r is ConformanceRow =>
        typeof r === "object" &&
        r !== null &&
        typeof (r as ConformanceRow).expr === "string" &&
        typeof (r as ConformanceRow).nowMs === "number" &&
        typeof (r as ConformanceRow).tz === "string" &&
        typeof (r as ConformanceRow).fromMs === "number" &&
        typeof (r as ConformanceRow).toMs === "number" &&
        // `to` is optional, but a row carrying a non-string `to` is a malformed row, not a
        // one-endpoint row — dropping it silently would hide exactly the drift this suite polices.
        ["undefined", "string"].includes(typeof (r as ConformanceRow).to),
    );
  } catch (e) {
    // An unreadable fixture is a FAILURE, not a skip — see the header. Throwing here surfaces the
    // real cause (a bad path, malformed JSON) instead of an empty row list that looks like a pass.
    throw new Error(`conformance fixture at ${FIXTURE} is unreadable: ${String(e)}`);
  }
}

const rows = loadRows();

describe("timerange conformance (lb fixture)", () => {
  it("the fixture is present and carries rows", () => {
    // The guard the shell's copy could not have: a move that breaks the path fails HERE, loudly,
    // rather than leaving 83 assertions silently unrun.
    expect(existsSync(FIXTURE), `conformance fixture missing at ${FIXTURE}`).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
  });

  it.each(rows.map((r) => [r.to ? `${r.expr} → ${r.to}` : r.expr, r.tz, r] as const))(
    "%s @ %s resolves to the fixture's exact ms pair",
    (_expr, _tz, row) => {
      const resolved = resolveRange(row.expr, row.to, row.nowMs, row.tz);
      expect(resolved, `resolve(${row.expr}) must not be malformed`).not.toBeNull();
      expect(resolved!.fromMs).toBe(row.fromMs);
      expect(resolved!.toMs).toBe(row.toMs);
    },
  );
});
