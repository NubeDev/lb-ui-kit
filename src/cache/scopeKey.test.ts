// The cache-key narrowing (nav-context-vars scope, Slice 1b). This is the highest-blast-radius change in
// that scope — every panel on every board reads through `vizFetchKey`/`vizQueryKey` — so the pins are the
// two failure modes in opposite directions:
//   - TOO COARSE (the regression this prevents): a built-in the spec never mentions rides the key, so
//     arriving from the nav re-fetches what the manager already cached, and every range tick re-keys a
//     panel whose SQL has no `$__from`.
//   - TOO NARROW (the wrong-data bug the rejected sibling-field design would have caused): a spec that
//     DOES reference `${__nav.label}` must key differently per nav item, or two items share one result.

import { describe, expect, it } from "vitest";

import { vizFetchKey, vizQueryKey } from "./queryKeys";
import { scopeKey } from "./scopeKey";
import { navBuiltins } from "../vars";
import type { VarScope } from "../vars";

/** The existing panel fixture the builder tests use: one federation source, plain SQL, no built-in. */
function plainSpec(tick = 0) {
  return {
    sources: [
      {
        refId: "A",
        tool: "federation.query",
        args: { sql: "select 1" },
        datasource: { type: "federation" },
      },
    ],
    source: undefined,
    scope: emptyScopeWith({}),
    tick,
  };
}

/** The same fixture, but its SQL interpolates the nav label (the referencing case). */
function navRefSpec(tick = 0) {
  return {
    ...plainSpec(tick),
    sources: [
      {
        refId: "A",
        tool: "federation.query",
        args: { sql: "select * from t where site = '${__nav.label}'" },
        datasource: { type: "federation" },
      },
    ],
  };
}

function emptyScopeWith(builtins: Record<string, string>): VarScope {
  return { values: {}, builtins };
}

/** A scope carrying real nav context (via the shipped `navBuiltins`) plus the time built-ins. */
function scopeFor(path: string[], from = "1000", to = "2000"): VarScope {
  return {
    values: { device: "ahu-1" },
    builtins: {
      __from: from,
      __to: to,
      ...navBuiltins(
        { path, id: path.join("/") },
        { id: "d1", title: "Board" },
      ),
    },
  };
}

describe("scopeKey — narrowing", () => {
  it("keeps only the built-ins the spec references", () => {
    const spec = navRefSpec();
    const out = scopeKey(spec, scopeFor(["Site A", "AHU 1"])) as VarScope;
    expect(out.builtins).toEqual({ "__nav.label": "AHU 1" });
    // `values` are NOT narrowed — out of scope by design.
    expect(out.values).toEqual({ device: "ahu-1" });
  });

  it("yields a key with NO `builtins` member at all when the spec references none", () => {
    const out = scopeKey(plainSpec(), scopeFor(["Site A", "AHU 1"])) as Record<
      string,
      unknown
    >;
    expect("builtins" in out).toBe(false);
    expect(out).toEqual({ values: { device: "ahu-1" } });
  });

  it("never scans the scope's own values/built-ins for references (a `$name`-shaped VALUE must not self-key)", () => {
    const spec = {
      ...plainSpec(),
      scope: {
        values: { a: "${__nav.label}" },
        builtins: { "__nav.label": "X" },
      },
    };
    const out = scopeKey(spec, spec.scope) as Record<string, unknown>;
    expect("builtins" in out).toBe(false);
  });

  it("passes a non-VarScope scope through untouched", () => {
    expect(scopeKey(plainSpec(), undefined)).toBeUndefined();
    expect(scopeKey(plainSpec(), { values: {} })).toEqual({ values: {} });
  });
});

describe("vizFetchKey / vizQueryKey — cache behaviour", () => {
  it("gives two different nav paths the SAME key for a query that references no built-in", () => {
    const a = { ...plainSpec(), scope: scopeFor(["Site A", "AHU 1"]) };
    const b = {
      ...plainSpec(),
      scope: scopeFor(["Site B", "Chiller 3", "Pump"]),
    };
    expect(vizFetchKey("nube", a)).toEqual(vizFetchKey("nube", b));
    expect(
      vizQueryKey("nube", {
        ...a,
        transformations: [],
        fieldConfig: undefined,
      }),
    ).toEqual(
      vizQueryKey("nube", {
        ...b,
        transformations: [],
        fieldConfig: undefined,
      }),
    );
  });

  it("gives two different nav labels DIFFERENT keys when the query DOES reference ${__nav.label}", () => {
    const a = { ...navRefSpec(), scope: scopeFor(["Site A", "AHU 1"]) };
    const b = { ...navRefSpec(), scope: scopeFor(["Site A", "AHU 2"]) };
    expect(vizFetchKey("nube", a)).not.toEqual(vizFetchKey("nube", b));
  });

  it("REGRESSION GUARD: adding nav context to a scope does not change the key for existing panel fixtures", () => {
    const before = {
      ...plainSpec(),
      scope: {
        values: { device: "ahu-1" },
        builtins: { __from: "1000", __to: "2000" },
      },
    };
    const after = { ...plainSpec(), scope: scopeFor(["Site A", "AHU 1"]) };
    expect(vizFetchKey("nube", after)).toEqual(vizFetchKey("nube", before));
    expect(
      vizQueryKey("nube", {
        ...after,
        transformations: [],
        fieldConfig: undefined,
      }),
    ).toEqual(
      vizQueryKey("nube", {
        ...before,
        transformations: [],
        fieldConfig: undefined,
      }),
    );
  });

  it("keeps its key across a range tick when the spec never mentions $__from/$__to (the pre-existing win)", () => {
    const t0 = { ...plainSpec(), scope: scopeFor(["Site A"], "1000", "2000") };
    const t1 = { ...plainSpec(), scope: scopeFor(["Site A"], "9000", "9999") };
    expect(vizFetchKey("nube", t1)).toEqual(vizFetchKey("nube", t0));
  });

  it("still re-keys on a range tick when the SQL DOES mention $__from (correctness, not just thrift)", () => {
    const sql = "select * from t where ts > $__from and ts < $__to";
    const withMacro = (from: string, to: string) => ({
      ...plainSpec(),
      sources: [
        {
          refId: "A",
          tool: "federation.query",
          args: { sql },
          datasource: { type: "federation" },
        },
      ],
      scope: scopeFor(["Site A"], from, to),
    });
    expect(vizFetchKey("nube", withMacro("9000", "9999"))).not.toEqual(
      vizFetchKey("nube", withMacro("1000", "2000")),
    );
  });

  it("keeps the workspace prefix and the tick doing their jobs", () => {
    const spec = { ...plainSpec(), scope: scopeFor(["Site A"]) };
    expect(vizFetchKey("nube", spec)).not.toEqual(vizFetchKey("other", spec));
    expect(vizFetchKey("nube", { ...spec, tick: 1 })).not.toEqual(
      vizFetchKey("nube", spec),
    );
  });
});
