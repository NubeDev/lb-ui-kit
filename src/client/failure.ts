// WHY A READ FAILED — the one classifier every kit surface reads before choosing a state.
//
// This exists because "the read didn't work" is three different facts to an operator, and telling them
// apart is the whole of the kit's honesty promise:
//
//   • **denied**      — a capability the viewer does not hold, or a verb missing from the extension's
//                       `[ui] scope`. The data exists; this viewer may not see it. The fix is a grant.
//   • **unavailable** — the host answered "not there". The fix is a different id, or a share.
//   • **error**       — anything else. The fix is a bug report.
//
// THE AWKWARD PART, and the reason this is a named function rather than a ternary at each call site:
// **lb deliberately conflates "gone" with "not yours"**. A missing OR unreadable record comes back as
// `ToolError::NotFound` → HTTP 403 with the body `no such tool`, precisely so a caller cannot probe for
// the existence of records it may not read. So `unavailable` is genuinely ambiguous on the wire, and a
// surface rendering it MUST say both things. Claiming "this failed to load" over a panel that was simply
// deleted is a wrong answer; so is claiming "you lack permission" when the id is just stale.
//
// The one case that IS unambiguous is the bridge's own local rejection (`out_of_scope: <tool>`): that is
// decided in the browser, before the wire, and it means exactly one thing.
//
// One responsibility: an unknown rejection → why. No React, no I/O.

import { isKitDenied, isOutOfScope } from "./types";

export type ReadFailure = "denied" | "unavailable" | "error";

/** Host answers that mean "no such record (or none you may see)". `no such tool` is lb's wording for
 *  `ToolError::NotFound` and reaches here for a missing panel/dashboard/asset as readily as for a verb
 *  that does not exist — see the header. */
const UNAVAILABLE = /\bno such tool\b|\bnot found\b|\b404\b/i;

/** Host answers that mean "you may not". Kept separate from {@link UNAVAILABLE} even though lb returns
 *  403 for both, because the BODY distinguishes them and the body is what we match on. */
const DENIED = /\bdenied\b|\bforbidden\b|\bunauthori[sz]ed\b|\bnot authori[sz]ed\b|\bout_of_scope\b/i;

export function classifyReadFailure(e: unknown): ReadFailure {
  // Decided client-side, before the wire — the only unambiguous signal there is.
  if (isKitDenied(e) || isOutOfScope(e)) return "denied";
  const message = e instanceof Error ? e.message : typeof e === "string" ? e : "";
  if (DENIED.test(message)) return "denied";
  if (UNAVAILABLE.test(message)) return "unavailable";
  return "error";
}
