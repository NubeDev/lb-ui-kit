// The `first_day_of_week` pref → the resolver's `WeekStart` (relative-time-range scope, user-prefs
// consumer). One responsibility: fold the closed enum (or its absence) to the resolver's default.
// The resolver must never see an unknown value — junk or a not-yet-seeded locale's value degrades to
// the pinned Monday grammar, never a changed window.

import type { WeekStart } from "./civil";

/** Map the resolved `first_day_of_week` axis to a `WeekStart`. Absent (unset → inherit) or any value
 *  outside the closed `monday`/`sunday` set means Monday — the grammar the conformance fixture pins. */
export function weekStartOf(v: string | undefined): WeekStart {
  return v === "sunday" ? "sunday" : "monday";
}
