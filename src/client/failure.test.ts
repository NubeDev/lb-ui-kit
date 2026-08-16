// The classifier is the kit's honesty promise reduced to one function, so it is worth pinning hard —
// including the thing about it that is genuinely uncomfortable.
//
// lb answers a MISSING record and an UNREADABLE one identically: `ToolError::NotFound` → HTTP 403 with
// the body `no such tool`, on purpose, so a caller cannot probe for records it may not read. The kit
// therefore CANNOT separate "deleted" from "not shared with you", and must not pretend to. What it can
// do is refuse to call either of them a transport failure.
//
// One responsibility: pin what each wire answer means.

import { describe, expect, it } from "vitest";

import { classifyReadFailure } from "./failure";
import { KitDeniedError } from "./types";

describe("classifyReadFailure", () => {
  it("calls the bridge's own local rejection DENIED — the one unambiguous signal there is", () => {
    // Decided in the browser, before the wire: a verb missing from `[ui] scope`. This is the trap
    // `DASH_KIT_READ_SCOPE` exists to close, and rendering it as a generic error is what hides it.
    expect(classifyReadFailure(new Error("out_of_scope: viz.query_batch"))).toBe("denied");
    expect(classifyReadFailure(new KitDeniedError("insight.ack", "writes are unstarted"))).toBe("denied");
  });

  it("calls a host refusal DENIED", () => {
    expect(classifyReadFailure(new Error("denied: mcp:panel.get:call"))).toBe("denied");
    expect(classifyReadFailure(new Error("403 Forbidden"))).toBe("denied");
    expect(classifyReadFailure(new Error("not authorized"))).toBe("denied");
  });

  it("calls lb's not-found UNAVAILABLE — never an error", () => {
    // `no such tool` is lb's wording for `ToolError::NotFound`, and it reaches here for a deleted panel
    // as readily as for a verb that does not exist. Calling it "this broke" sends an operator to the
    // wrong place; the id is simply stale.
    expect(classifyReadFailure(new Error("no such tool"))).toBe("unavailable");
    expect(classifyReadFailure(new Error("404 not found"))).toBe("unavailable");
  });

  it("keeps everything else an ERROR — the classifier does not guess", () => {
    expect(classifyReadFailure(new Error("network request failed"))).toBe("error");
    expect(classifyReadFailure(new Error("Unexpected token < in JSON"))).toBe("error");
    expect(classifyReadFailure(undefined)).toBe("error");
    expect(classifyReadFailure({ weird: true })).toBe("error");
  });

  it("reads a bare string rejection too — not every transport throws an Error", () => {
    expect(classifyReadFailure("no such tool")).toBe("unavailable");
    expect(classifyReadFailure("out_of_scope: panel.get")).toBe("denied");
  });
});
