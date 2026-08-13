// The kit's replacement for the shell-only `preferredZone()` — `lib/timerange`'s ONE outside coupling,
// and the only thing that stopped this code being a library.
//
// The policy is unchanged and load-bearing: the fallback is the VIEWER'S LOCAL ZONE, never UTC.
// `rangeTimezone` decides where `today`/`this-week` TRUNCATE, so a UTC fallback does not merely
// mislabel — for a UTC+7 viewer with no stated preference, `today` would open at 07:00 local and
// `yesterday` would be a 7-hour-shifted day. What changes here is only WHERE "local" comes from: an
// injected resolver (the `KitProvider` `zone` prop) instead of a direct `Intl` call, so a host with its
// own idea of the viewer's zone can supply it and a test can pin it.
//
// One responsibility: pick a zone from candidates. No React, no I/O.

/** The sentinel a stored preference uses for "no stated preference" — treated as absent, not as a
 *  zone name. Empty string means the same thing. */
export const BROWSER_TZ = "browser";

/** How the kit resolves "the viewer's zone". Mirrors `KitProvider`'s `zone` prop. */
export type ZoneResolver = () => string;

/** The browser's zone, or `UTC` when the platform will not say. The default resolver. */
export function browserZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** The first candidate that states a real zone, else whatever `zone()` says. `"browser"`/empty are
 *  "no stated preference" and fall through — they are not zone names. */
export function preferredZone(
  zone: ZoneResolver,
  ...candidates: (string | undefined | null)[]
): string {
  for (const c of candidates) {
    if (c && c !== BROWSER_TZ) return c;
  }
  return zone();
}
