// The scope constant exists to close a SILENT trap, so the trap itself is what gets asserted here:
// `viz.query_batch` must be in `[ui] scope` even though it has no capability of its own, because the
// shell bridge's filter is a literal tool-name set that knows nothing of lb's host-side alias.
// If someone "tidies" the batch verb out of this list, the batch loader stops working in every
// kit-built extension — and it fails as an empty chart, not as an error.

import { describe, expect, it } from "vitest";

import { DASH_KIT_READ_CAPS, DASH_KIT_READ_SCOPE } from "./scope";

describe("DASH_KIT_READ_SCOPE", () => {
  it("includes viz.query_batch — the aliased verb a manifest author would never guess", () => {
    expect(DASH_KIT_READ_SCOPE).toContain("viz.query_batch");
    expect(DASH_KIT_READ_SCOPE).toContain("viz.query");
  });

  it("has NO capability for the batch verb — it rides mcp:viz.query:call", () => {
    expect(DASH_KIT_READ_CAPS).not.toContain("mcp:viz.query_batch:call");
    expect(DASH_KIT_READ_CAPS).toContain("mcp:viz.query:call");
  });

  it("is exactly one cap shorter than the scope, and that is the point", () => {
    expect(DASH_KIT_READ_SCOPE).toHaveLength(DASH_KIT_READ_CAPS.length + 1);
  });

  it("every non-aliased scope entry has a matching capability", () => {
    const caps = new Set<string>(DASH_KIT_READ_CAPS);
    const unmatched = DASH_KIT_READ_SCOPE.filter((v) => !caps.has(`mcp:${v}:call`));
    expect(unmatched).toEqual(["viz.query_batch"]);
  });

  it("carries no duplicates and no write verb", () => {
    expect(new Set<string>(DASH_KIT_READ_SCOPE).size).toBe(DASH_KIT_READ_SCOPE.length);
    const WRITEY = /\.(save|delete|put|write|ack|resolve|create|update|remove)$/;
    expect(DASH_KIT_READ_SCOPE.filter((v) => WRITEY.test(v))).toEqual([]);
  });
});
