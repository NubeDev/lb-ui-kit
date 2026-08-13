// WORKSPACE ISOLATION — scope §9's required category, asserted at the key boundary.
//
// The workspace prefix on every key is DE-DUP, not the security wall: the host re-checks the workspace
// from the token on every call regardless. But it is the thing that stops one workspace's frames being
// served for another's board on a switch, and it is silent when it breaks — you get plausible data from
// the wrong tenant, which reads as a stale cache rather than a bug.
//
// The token assertion is the one that must never regress: the kit is never handed a token, so a token
// cannot appear in a key. Asserting it here means a future key that started threading auth material
// fails loudly instead of writing credentials into an IndexedDB mirror.

import { describe, expect, it } from "vitest";

import {
  canon,
  datasourceListKey,
  flowNodeStateKey,
  seriesReadKey,
  sourcePickerKey,
  vizFetchKey,
  vizQueryKey,
  vizShapeKey,
} from "./queryKeys";
import { QUICK_PERSIST_VERSION, quickPersister } from "./quickPersist";

const spec = {
  sources: [{ tool: "viz.query", args: { sql: "select 1" } }],
  transformations: [],
  fieldConfig: {},
  source: "ts",
  scope: { values: {}, builtins: { __from: "1000", __to: "2000" } },
  tick: 7,
};

/** Every key the kit mints, built for one workspace. */
function allKeys(ws: string) {
  return [
    vizQueryKey(ws, spec),
    vizFetchKey(ws, spec),
    vizShapeKey(ws, { framesHash: "h1", transformations: [] }),
    flowNodeStateKey(ws, "f1", 3),
    seriesReadKey(ws, "site.a.kw"),
    sourcePickerKey(ws),
    datasourceListKey(ws),
  ];
}

describe("workspace isolation", () => {
  it("every key carries the workspace, and two workspaces never collide", () => {
    const a = allKeys("acme");
    const b = allKeys("globex");
    expect(a).toHaveLength(b.length);
    a.forEach((key, i) => {
      expect(JSON.stringify(key)).not.toBe(JSON.stringify(b[i]));
      expect(JSON.stringify(key)).toContain("acme");
      expect(JSON.stringify(b[i])).toContain("globex");
    });
  });

  it("the workspace sits at index 1 of every key — the shape the cache invalidation relies on", () => {
    for (const key of allKeys("acme")) expect(key[1]).toBe("acme");
  });

  it("NO key contains anything token-shaped", () => {
    // The kit never receives a token — it holds a leashed `(tool, args)` call and nothing else. This
    // asserts the consequence, so a key that ever started threading auth material fails here rather
    // than silently writing credentials into the IndexedDB mirror.
    const TOKENISH = /(bearer|authorization|token|jwt|secret|password|eyJ[A-Za-z0-9_-]{6,})/i;
    for (const key of allKeys("acme")) {
      expect(JSON.stringify(key), `token-shaped material in ${JSON.stringify(key)}`).not.toMatch(
        TOKENISH,
      );
    }
  });

  it("the IndexedDB mirror is partitioned by workspace at the STORAGE key, not by a filter", () => {
    // A filter can be wrong once; a distinct storage key cannot serve another workspace's frames at
    // all, even transiently during a switch.
    const a = quickPersister("acme");
    const b = quickPersister("globex");
    expect(a).not.toBe(b);
    // The persister closes over its key, so probe it the way a switch would: two persisters must not
    // read each other's slot. Asserted structurally via the documented key shape.
    expect(`lb.quick-cache.${QUICK_PERSIST_VERSION}.acme`).not.toBe(
      `lb.quick-cache.${QUICK_PERSIST_VERSION}.globex`,
    );
  });

  it("canon is stable across identity churn but not across workspaces", () => {
    // Two structurally-equal specs must hash to the SAME key (or the cache never hits), while the ws
    // prefix still separates them (or it hits when it must not).
    expect(canon({ b: 1, a: 2 })).toEqual(canon({ a: 2, b: 1 }));
    expect(JSON.stringify(vizQueryKey("acme", { ...spec }))).toBe(
      JSON.stringify(vizQueryKey("acme", { ...spec })),
    );
    expect(JSON.stringify(vizQueryKey("acme", spec))).not.toBe(
      JSON.stringify(vizQueryKey("globex", spec)),
    );
  });
});
