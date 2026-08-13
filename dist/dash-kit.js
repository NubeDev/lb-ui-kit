var Cn = Object.defineProperty;
var Sn = (e, t, n) => t in e ? Cn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Fe = (e, t, n) => Sn(e, typeof t != "symbol" ? t + "" : t, n);
import { jsx as i, jsxs as p, Fragment as $n } from "react/jsx-runtime";
import * as A from "react";
import { createContext as xe, useMemo as de, useContext as oe, useRef as J, useState as I, useEffect as ee, useCallback as F } from "react";
import { Calendar as En, CalendarRange as Rn, ChevronDown as _n, Check as zt, ChevronRight as Pt, Table2 as Mn, Inbox as Tn, Lightbulb as Ue, Hash as In, LineChart as Dn, Database as An, X as Ot, RefreshCw as Te, CheckCheck as ht, PanelLeftIcon as zn } from "lucide-react";
import { Slot as Xe } from "@radix-ui/react-slot";
import * as me from "@radix-ui/react-dropdown-menu";
import { QueryClient as Pn, QueryClientProvider as On } from "@tanstack/react-query";
import { persistQueryClientRestore as Ln, persistQueryClientSave as Gn } from "@tanstack/react-query-persist-client";
import * as ue from "@radix-ui/react-collapsible";
import * as j from "@radix-ui/react-dialog";
import * as ge from "@radix-ui/react-tooltip";
class Qe extends Error {
  constructor(n, r) {
    super(`denied: ${n} — ${r}`);
    Fe(this, "denied", !0);
    Fe(this, "tool");
    this.name = "KitDeniedError", this.tool = n;
  }
}
function pi(e) {
  return e instanceof Qe;
}
function bi(e) {
  return e instanceof Error && e.message.startsWith("out_of_scope:");
}
function jn(e) {
  if (typeof e == "function") return e;
  const t = e;
  return (n, r) => t.call(n, r);
}
function U(e, t) {
  if (!e || typeof e != "object") return [];
  const n = e[t];
  return Array.isArray(n) ? n : [];
}
function Fn(e, t = {}) {
  const n = {
    listSeries: () => e("series.list", {}).then((r) => U(r, "series")),
    listExtensions: () => e("ext.list", {}).then((r) => U(r, "extensions")),
    listFlows: () => e("flows.list", {}).then((r) => U(r, "flows")),
    // `flows.get` answers the flow BARE (not enveloped). A flow the caller can list but not read
    // rejects; the picker skips it rather than failing the whole bundle, so map a rejection to null.
    getFlow: (r) => e("flows.get", { id: r }).then((s) => s && typeof s == "object" ? s : null).catch(() => null),
    listFlowNodes: () => e("flows.nodes", {}).then((r) => U(r, "nodes")),
    listDatasources: () => e("datasource.list", {}).then((r) => U(r, "datasources")),
    listRules: () => e("rules.list", {}).then((r) => U(r, "rules")),
    listQueries: () => e("query.list", {}).then((r) => U(r, "queries")),
    // `store.schema` answers the schema BARE. An absent/!object reply is an empty schema, not a throw.
    readSchema: () => e("store.schema", {}).then(
      (r) => r && typeof r == "object" ? r : { tables: [] }
    ),
    listChannels: () => e("channel.list", {}).then((r) => U(r, "channels")),
    listInsights: () => e("insight.list", {}).then((r) => U(r, "items"))
  };
  if (t.inboxChannel) {
    const r = t.inboxChannel;
    n.listInbox = () => e("inbox.list", { channel: r }).then((s) => U(s, "items"));
  }
  return n;
}
function Wn(e) {
  return {
    list: (t) => e("insight.list", { ...t }).then((n) => n ?? { items: [] }),
    get: (t) => e("insight.get", { id: t }).then((n) => n ?? null),
    occurrences: (t, n, r) => e("insight.occurrences", {
      insight_id: t,
      cursor: n,
      limit: r ?? 50
    }).then((s) => s ?? { items: [] }),
    ack: () => Promise.reject(
      new Qe(
        "insight.ack",
        "the kit is a READ kit; extension bridge writes are not implemented (U-ext-bridge-write)"
      )
    ),
    resolve: () => Promise.reject(
      new Qe(
        "insight.resolve",
        "the kit is a READ kit; extension bridge writes are not implemented (U-ext-bridge-write)"
      )
    )
    // No `subscribe`: a live tail needs a stream seam the leashed call does not carry. Omitting it is
    // the interface's documented "no feed" case, so the hooks fall back to act→refresh.
  };
}
function gi(e, t = {}) {
  const n = jn(e);
  return {
    call: n,
    loaders: Fn(n, t),
    insights: Wn(n)
  };
}
const wi = [
  "viz.query",
  "viz.query_batch",
  "series.read",
  "series.latest",
  "series.find"
], xi = [
  "mcp:viz.query:call",
  "mcp:series.read:call",
  "mcp:series.latest:call",
  "mcp:series.find:call"
];
function qn() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
const Je = xe(null);
function yi({ client: e, ws: t, theme: n, zone: r, children: s }) {
  const o = de(
    () => ({ client: e, ws: t, theme: n, zone: r ?? qn }),
    [e, t, n, r]
  );
  return /* @__PURE__ */ i(Je.Provider, { value: o, children: s });
}
function Kn() {
  return oe(Je);
}
function ye() {
  const e = oe(Je);
  if (!e)
    throw new Error(
      "useKit: no <KitProvider>. Wrap the page: <KitProvider client={makeKitClient(bridge)} ws={ctx.workspace}>"
    );
  return e;
}
function vi() {
  return ye().client;
}
function ki() {
  return ye().ws;
}
function Ni() {
  return ye().theme;
}
function Ci() {
  return ye().zone;
}
const Bn = 864e5;
function fe(e, t, n) {
  e -= t <= 2 ? 1 : 0;
  const r = Math.floor((e >= 0 ? e : e - 399) / 400), s = e - r * 400, o = Math.floor((153 * (t + (t > 2 ? -3 : 9)) + 2) / 5) + n - 1, a = s * 365 + Math.floor(s / 4) - Math.floor(s / 100) + o;
  return r * 146097 + a - 719468;
}
function Lt(e) {
  e += 719468;
  const t = Math.floor((e >= 0 ? e : e - 146096) / 146097), n = e - t * 146097, r = Math.floor(
    (n - Math.floor(n / 1460) + Math.floor(n / 36524) - Math.floor(n / 146096)) / 365
  ), s = r + t * 400, o = n - (365 * r + Math.floor(r / 4) - Math.floor(r / 100)), a = Math.floor((5 * o + 2) / 153), l = o - Math.floor((153 * a + 2) / 5) + 1, c = a + (a < 10 ? 3 : -9);
  return { y: s + (c <= 2 ? 1 : 0), mo: c, d: l };
}
function Gt(e, t) {
  const n = t === 12 ? { y: e + 1, mo: 1 } : { y: e, mo: t + 1 };
  return fe(n.y, n.mo, 1) - fe(e, t, 1);
}
function Vn(e, t, n) {
  return (fe(e, t, n) % 7 + 3 + 7) % 7;
}
const pt = /* @__PURE__ */ new Map();
function jt(e) {
  let t = pt.get(e);
  return t || (t = new Intl.DateTimeFormat("en-US", {
    timeZone: e,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }), pt.set(e, t)), t;
}
function et(e) {
  if (!e) return "UTC";
  try {
    return jt(e), e;
  } catch {
    return "UTC";
  }
}
function he(e, t) {
  const n = jt(t).formatToParts(e), r = (s) => {
    var o;
    return Number(((o = n.find((a) => a.type === s)) == null ? void 0 : o.value) ?? 0);
  };
  return { y: r("year"), mo: r("month"), d: r("day"), h: r("hour") % 24, mi: r("minute"), s: r("second") };
}
function Ft(e) {
  return fe(e.y, e.mo, e.d) * Bn + ((e.h * 60 + e.mi) * 60 + e.s) * 1e3;
}
function bt(e, t) {
  return Ft(he(e, t)) - e;
}
function K(e, t) {
  const n = Ft(e), r = n - bt(n, t);
  return n - bt(r, t);
}
function Ye(e, t) {
  const n = he(e, t), r = (s, o = 2) => String(s).padStart(o, "0");
  return `${r(n.y, 4)}-${r(n.mo)}-${r(n.d)}`;
}
const gt = {
  s: "s",
  m: "m",
  h: "h",
  d: "d",
  w: "w",
  M: "M",
  y: "y"
}, Un = {
  second: "s",
  minute: "m",
  hour: "h",
  day: "d",
  week: "w",
  month: "M",
  quarter: "q",
  year: "y"
}, Qn = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  y: "year"
}, Yn = /^now(?:([+-])(\d{1,6})([smhdwMy]))?(?:\/([smhdwMy]))?$/, Hn = /^(\d{4})-(\d{2})-(\d{2})$/, Zn = /^\d{13}$/, Xn = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?$/, Jn = /^(this|last|next)-(hour|day|week|month|quarter|year)$/, er = /^last-(\d{1,6})-(second|minute|hour|day|week|month|quarter|year)s?$/, tr = /^last-(\d{1,6})([smhdwMy])$/, Wt = "expected now±<n><unit> (units s m h d w M y, optional /<unit> snap), an ISO day or instant, 13-digit epoch ms, today/yesterday/tomorrow, this-/last-/next-<unit>, or last-<n>-<unit>s";
function Ee(e) {
  return { ok: !1, error: `unrecognized range expression "${e}" — ${Wt}` };
}
function wt(e, t, n) {
  return t >= 1 && t <= 12 && n >= 1 && n <= Gt(e, t);
}
function Ie(e) {
  const t = e.trim();
  if (!t) return { ok: !1, error: `empty range expression — ${Wt}` };
  if (t === "today") return le({ kind: "day", offset: 0 });
  if (t === "yesterday") return le({ kind: "day", offset: -1 });
  if (t === "tomorrow") return le({ kind: "day", offset: 1 });
  const n = Jn.exec(t);
  if (n)
    return le({ kind: "period", rel: n[1], unit: n[2] });
  const r = er.exec(t);
  if (r) return le({ kind: "trailing", n: Number(r[1]), unit: Un[r[2]] });
  const s = tr.exec(t);
  if (s) return le({ kind: "trailing", n: Number(s[1]), unit: gt[s[2]] });
  const o = Yn.exec(t);
  if (o) {
    const [, c, d, u, g] = o;
    return pe({
      kind: "now",
      ...c ? { offset: { sign: c === "-" ? -1 : 1, n: Number(d), unit: gt[u] } } : {},
      ...g ? { snap: Qn[g] } : {}
    });
  }
  const a = Hn.exec(t);
  if (a) {
    const [c, d, u] = [Number(a[1]), Number(a[2]), Number(a[3])];
    return wt(c, d, u) ? pe({ kind: "isoDay", y: c, mo: d, d: u }) : Ee(e);
  }
  if (Zn.test(t)) return pe({ kind: "instant", ms: Number(t) });
  const l = Xn.exec(t);
  if (l) {
    const [, c, d, u, g, w, y, f, m] = l;
    if (!wt(Number(c), Number(d), Number(u)) || Number(g) > 23 || Number(w) > 59) return Ee(e);
    if (m) {
      const v = Date.parse(t);
      return Number.isFinite(v) ? pe({ kind: "instant", ms: v }) : Ee(e);
    }
    return pe({
      kind: "wall",
      y: Number(c),
      mo: Number(d),
      d: Number(u),
      h: Number(g),
      mi: Number(w),
      s: Number(y ?? 0),
      ms: Number((f ?? "0").padEnd(3, "0"))
    });
  }
  return Ee(e);
}
function Si(e) {
  const t = Ie(e);
  return t.ok && t.expr.type === "window";
}
function le(e) {
  return { ok: !0, expr: { type: "window", window: e } };
}
function pe(e) {
  return { ok: !0, expr: { type: "endpoint", endpoint: e } };
}
const nr = "browser";
function qt() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
function Kt(e, ...t) {
  for (const n of t)
    if (n && n !== nr) return n;
  return e();
}
const $i = "last-30-days";
function Ei(e, t, n = qt) {
  return et(Kt(n, e, t));
}
function rr(e, t) {
  const n = e.y * 12 + (e.mo - 1) + t, r = Math.floor(n / 12), s = (n % 12 + 12) % 12 + 1;
  return { ...e, y: r, mo: s, d: Math.min(e.d, Gt(r, s)) };
}
function X(e, t, n, r) {
  switch (n) {
    case "s":
      return e + t * 1e3;
    case "m":
      return e + t * 6e4;
    case "h":
      return e + t * 36e5;
    case "d":
    case "w": {
      const s = he(e, r), o = n === "w" ? t * 7 : t, a = Lt(fe(s.y, s.mo, s.d) + o);
      return K({ ...s, ...a }, r);
    }
    case "M":
    case "q":
    case "y": {
      const s = n === "M" ? t : n === "q" ? t * 3 : t * 12;
      return K(rr(he(e, r), s), r);
    }
  }
}
function sr(e) {
  return {
    second: "s",
    minute: "m",
    hour: "h",
    day: "d",
    week: "w",
    month: "M",
    quarter: "q",
    year: "y"
  }[e];
}
function He(e, t, n) {
  if (t === "second") return Math.floor(e / 1e3) * 1e3;
  const r = he(e, n);
  switch (t) {
    case "minute":
      return K({ ...r, s: 0 }, n);
    case "hour":
      return K({ ...r, mi: 0, s: 0 }, n);
    case "day":
      return K({ ...r, h: 0, mi: 0, s: 0 }, n);
    case "week": {
      const s = Lt(fe(r.y, r.mo, r.d) - Vn(r.y, r.mo, r.d));
      return K({ ...r, ...s, h: 0, mi: 0, s: 0 }, n);
    }
    case "month":
      return K({ ...r, d: 1, h: 0, mi: 0, s: 0 }, n);
    case "quarter":
      return K({ ...r, mo: Math.floor((r.mo - 1) / 3) * 3 + 1, d: 1, h: 0, mi: 0, s: 0 }, n);
    case "year":
      return K({ ...r, mo: 1, d: 1, h: 0, mi: 0, s: 0 }, n);
    default:
      return e;
  }
}
function xt(e, t, n) {
  switch (e.kind) {
    case "now": {
      let r = t;
      return e.offset && (r = X(r, e.offset.sign * e.offset.n, e.offset.unit, n)), e.snap && (r = He(r, e.snap, n)), r;
    }
    case "isoDay":
      return K({ y: e.y, mo: e.mo, d: e.d, h: 0, mi: 0, s: 0 }, n);
    case "instant":
      return e.ms;
    case "wall":
      return K({ y: e.y, mo: e.mo, d: e.d, h: e.h, mi: e.mi, s: e.s }, n) + e.ms;
  }
}
function or(e, t, n) {
  switch (e.kind) {
    case "day": {
      const r = X(He(t, "day", n), e.offset, "d", n);
      return { fromMs: r, toMs: X(r, 1, "d", n) };
    }
    case "period": {
      const r = He(t, e.unit, n), s = sr(e.unit);
      return e.rel === "this" ? { fromMs: r, toMs: X(r, 1, s, n) } : e.rel === "last" ? { fromMs: X(r, -1, s, n), toMs: r } : { fromMs: X(r, 1, s, n), toMs: X(r, 2, s, n) };
    }
    case "trailing":
      return { fromMs: X(t, -e.n, e.unit, n), toMs: t };
  }
}
function ir(e, t, n, r) {
  if (!e || !e.trim()) return null;
  const s = et(r), o = Ie(e);
  if (!o.ok) return null;
  if (o.expr.type === "window")
    return t && t.trim() ? null : or(o.expr.window, n, s);
  const a = xt(o.expr.endpoint, n, s);
  let l = n;
  if (t && t.trim()) {
    const c = Ie(t);
    if (!c.ok || c.expr.type !== "endpoint") return null;
    l = xt(c.expr.endpoint, n, s);
  }
  return a <= l ? { fromMs: a, toMs: l } : null;
}
function Ri(e, t) {
  const n = et(t), r = he(e, n), s = Ye(e, n);
  if (r.h === 0 && r.mi === 0 && r.s === 0 && e % 1e3 === 0) return s;
  const o = (a) => String(a).padStart(2, "0");
  return `${s} ${o(r.h)}:${o(r.mi)}`;
}
const ar = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  q: "quarter",
  y: "year"
};
function lr(e) {
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function cr(e) {
  switch (e.kind) {
    case "day":
      return e.offset === 0 ? "Today" : e.offset === -1 ? "Yesterday" : "Tomorrow";
    case "period":
      return `${lr(e.rel)} ${e.unit}`;
    case "trailing": {
      const t = ar[e.unit];
      return `Last ${e.n} ${t}${e.n === 1 ? "" : "s"}`;
    }
  }
}
function tt(e, t) {
  const n = Ie(e);
  return n.ok && n.expr.type === "window" ? cr(n.expr.window) : t ? `${e} → ${t}` : e === "now" ? "Now" : `${e} → now`;
}
function dr(e, t) {
  const n = /^\d{4}-\d{2}-\d{2}$/;
  if (t && n.test(e) && n.test(t)) {
    const r = (s) => {
      const o = /* @__PURE__ */ new Date(`${s}T00:00:00Z`);
      return Number.isNaN(o.getTime()) ? s : o.toLocaleDateString(void 0, { month: "short", day: "numeric", timeZone: "UTC" });
    };
    return `${r(e)} – ${r(t)}`;
  }
  return tt(e, t);
}
function Bt(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var s = e.length;
    for (t = 0; t < s; t++) e[t] && (n = Bt(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function Ae() {
  for (var e, t, n = 0, r = "", s = arguments.length; n < s; n++) (e = arguments[n]) && (t = Bt(e)) && (r && (r += " "), r += t);
  return r;
}
const yt = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, vt = Ae, nt = (e, t) => (n) => {
  var r;
  if ((t == null ? void 0 : t.variants) == null) return vt(e, n == null ? void 0 : n.class, n == null ? void 0 : n.className);
  const { variants: s, defaultVariants: o } = t, a = Object.keys(s).map((d) => {
    const u = n == null ? void 0 : n[d], g = o == null ? void 0 : o[d];
    if (u === null) return null;
    const w = yt(u) || yt(g);
    return s[d][w];
  }), l = n && Object.entries(n).reduce((d, u) => {
    let [g, w] = u;
    return w === void 0 || (d[g] = w), d;
  }, {}), c = t == null || (r = t.compoundVariants) === null || r === void 0 ? void 0 : r.reduce((d, u) => {
    let { class: g, className: w, ...y } = u;
    return Object.entries(y).every((f) => {
      let [m, v] = f;
      return Array.isArray(v) ? v.includes({
        ...o,
        ...l
      }[m]) : {
        ...o,
        ...l
      }[m] === v;
    }) ? [
      ...d,
      g,
      w
    ] : d;
  }, []);
  return vt(e, a, c, n == null ? void 0 : n.class, n == null ? void 0 : n.className);
}, ur = (e, t) => {
  const n = new Array(e.length + t.length);
  for (let r = 0; r < e.length; r++)
    n[r] = e[r];
  for (let r = 0; r < t.length; r++)
    n[e.length + r] = t[r];
  return n;
}, mr = (e, t) => ({
  classGroupId: e,
  validator: t
}), Vt = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
  nextPart: e,
  validators: t,
  classGroupId: n
}), De = "-", kt = [], fr = "arbitrary..", hr = (e) => {
  const t = br(e), {
    conflictingClassGroups: n,
    conflictingClassGroupModifiers: r
  } = e;
  return {
    getClassGroupId: (a) => {
      if (a.startsWith("[") && a.endsWith("]"))
        return pr(a);
      const l = a.split(De), c = l[0] === "" && l.length > 1 ? 1 : 0;
      return Ut(l, c, t);
    },
    getConflictingClassGroupIds: (a, l) => {
      if (l) {
        const c = r[a], d = n[a];
        return c ? d ? ur(d, c) : c : d || kt;
      }
      return n[a] || kt;
    }
  };
}, Ut = (e, t, n) => {
  if (e.length - t === 0)
    return n.classGroupId;
  const s = e[t], o = n.nextPart.get(s);
  if (o) {
    const d = Ut(e, t + 1, o);
    if (d) return d;
  }
  const a = n.validators;
  if (a === null)
    return;
  const l = t === 0 ? e.join(De) : e.slice(t).join(De), c = a.length;
  for (let d = 0; d < c; d++) {
    const u = a[d];
    if (u.validator(l))
      return u.classGroupId;
  }
}, pr = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
  return r ? fr + r : void 0;
})(), br = (e) => {
  const {
    theme: t,
    classGroups: n
  } = e;
  return gr(n, t);
}, gr = (e, t) => {
  const n = Vt();
  for (const r in e) {
    const s = e[r];
    rt(s, n, r, t);
  }
  return n;
}, rt = (e, t, n, r) => {
  const s = e.length;
  for (let o = 0; o < s; o++) {
    const a = e[o];
    wr(a, t, n, r);
  }
}, wr = (e, t, n, r) => {
  if (typeof e == "string") {
    xr(e, t, n);
    return;
  }
  if (typeof e == "function") {
    yr(e, t, n, r);
    return;
  }
  vr(e, t, n, r);
}, xr = (e, t, n) => {
  const r = e === "" ? t : Qt(t, e);
  r.classGroupId = n;
}, yr = (e, t, n, r) => {
  if (kr(e)) {
    rt(e(r), t, n, r);
    return;
  }
  t.validators === null && (t.validators = []), t.validators.push(mr(n, e));
}, vr = (e, t, n, r) => {
  const s = Object.entries(e), o = s.length;
  for (let a = 0; a < o; a++) {
    const [l, c] = s[a];
    rt(c, Qt(t, l), n, r);
  }
}, Qt = (e, t) => {
  let n = e;
  const r = t.split(De), s = r.length;
  for (let o = 0; o < s; o++) {
    const a = r[o];
    let l = n.nextPart.get(a);
    l || (l = Vt(), n.nextPart.set(a, l)), n = l;
  }
  return n;
}, kr = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Nr = (e) => {
  if (e < 1)
    return {
      get: () => {
      },
      set: () => {
      }
    };
  let t = 0, n = /* @__PURE__ */ Object.create(null), r = /* @__PURE__ */ Object.create(null);
  const s = (o, a) => {
    n[o] = a, t++, t > e && (t = 0, r = n, n = /* @__PURE__ */ Object.create(null));
  };
  return {
    get(o) {
      let a = n[o];
      if (a !== void 0)
        return a;
      if ((a = r[o]) !== void 0)
        return s(o, a), a;
    },
    set(o, a) {
      o in n ? n[o] = a : s(o, a);
    }
  };
}, Ze = "!", Nt = ":", Cr = [], Ct = (e, t, n, r, s) => ({
  modifiers: e,
  hasImportantModifier: t,
  baseClassName: n,
  maybePostfixModifierPosition: r,
  isExternal: s
}), Sr = (e) => {
  const {
    prefix: t,
    experimentalParseClassName: n
  } = e;
  let r = (s) => {
    const o = [];
    let a = 0, l = 0, c = 0, d;
    const u = s.length;
    for (let m = 0; m < u; m++) {
      const v = s[m];
      if (a === 0 && l === 0) {
        if (v === Nt) {
          o.push(s.slice(c, m)), c = m + 1;
          continue;
        }
        if (v === "/") {
          d = m;
          continue;
        }
      }
      v === "[" ? a++ : v === "]" ? a-- : v === "(" ? l++ : v === ")" && l--;
    }
    const g = o.length === 0 ? s : s.slice(c);
    let w = g, y = !1;
    g.endsWith(Ze) ? (w = g.slice(0, -1), y = !0) : (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      g.startsWith(Ze) && (w = g.slice(1), y = !0)
    );
    const f = d && d > c ? d - c : void 0;
    return Ct(o, y, w, f);
  };
  if (t) {
    const s = t + Nt, o = r;
    r = (a) => a.startsWith(s) ? o(a.slice(s.length)) : Ct(Cr, !1, a, void 0, !0);
  }
  if (n) {
    const s = r;
    r = (o) => n({
      className: o,
      parseClassName: s
    });
  }
  return r;
}, $r = (e) => {
  const t = /* @__PURE__ */ new Map();
  return e.orderSensitiveModifiers.forEach((n, r) => {
    t.set(n, 1e6 + r);
  }), (n) => {
    const r = [];
    let s = [];
    for (let o = 0; o < n.length; o++) {
      const a = n[o], l = a[0] === "[", c = t.has(a);
      l || c ? (s.length > 0 && (s.sort(), r.push(...s), s = []), r.push(a)) : s.push(a);
    }
    return s.length > 0 && (s.sort(), r.push(...s)), r;
  };
}, Er = (e) => ({
  cache: Nr(e.cacheSize),
  parseClassName: Sr(e),
  sortModifiers: $r(e),
  postfixLookupClassGroupIds: Rr(e),
  ...hr(e)
}), Rr = (e) => {
  const t = /* @__PURE__ */ Object.create(null), n = e.postfixLookupClassGroups;
  if (n)
    for (let r = 0; r < n.length; r++)
      t[n[r]] = !0;
  return t;
}, _r = /\s+/, Mr = (e, t) => {
  const {
    parseClassName: n,
    getClassGroupId: r,
    getConflictingClassGroupIds: s,
    sortModifiers: o,
    postfixLookupClassGroupIds: a
  } = t, l = [], c = e.trim().split(_r);
  let d = "";
  for (let u = c.length - 1; u >= 0; u -= 1) {
    const g = c[u], {
      isExternal: w,
      modifiers: y,
      hasImportantModifier: f,
      baseClassName: m,
      maybePostfixModifierPosition: v
    } = n(g);
    if (w) {
      d = g + (d.length > 0 ? " " + d : d);
      continue;
    }
    let R = !!v, k;
    if (R) {
      const M = m.substring(0, v);
      k = r(M);
      const x = k && a[k] ? r(m) : void 0;
      x && x !== k && (k = x, R = !1);
    } else
      k = r(m);
    if (!k) {
      if (!R) {
        d = g + (d.length > 0 ? " " + d : d);
        continue;
      }
      if (k = r(m), !k) {
        d = g + (d.length > 0 ? " " + d : d);
        continue;
      }
      R = !1;
    }
    const T = y.length === 0 ? "" : y.length === 1 ? y[0] : o(y).join(":"), E = f ? T + Ze : T, C = E + k;
    if (l.indexOf(C) > -1)
      continue;
    l.push(C);
    const S = s(k, R);
    for (let M = 0; M < S.length; ++M) {
      const x = S[M];
      l.push(E + x);
    }
    d = g + (d.length > 0 ? " " + d : d);
  }
  return d;
}, Tr = (...e) => {
  let t = 0, n, r, s = "";
  for (; t < e.length; )
    (n = e[t++]) && (r = Yt(n)) && (s && (s += " "), s += r);
  return s;
}, Yt = (e) => {
  if (typeof e == "string")
    return e;
  let t, n = "";
  for (let r = 0; r < e.length; r++)
    e[r] && (t = Yt(e[r])) && (n && (n += " "), n += t);
  return n;
}, Ir = (e, ...t) => {
  let n, r, s, o;
  const a = (c) => {
    const d = t.reduce((u, g) => g(u), e());
    return n = Er(d), r = n.cache.get, s = n.cache.set, o = l, l(c);
  }, l = (c) => {
    const d = r(c);
    if (d)
      return d;
    const u = Mr(c, n);
    return s(c, u), u;
  };
  return o = a, (...c) => o(Tr(...c));
}, Dr = [], P = (e) => {
  const t = (n) => n[e] || Dr;
  return t.isThemeGetter = !0, t;
}, Ht = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, Zt = /^\((?:(\w[\w-]*):)?(.+)\)$/i, Ar = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, zr = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Pr = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Or = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, Lr = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Gr = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, Z = (e) => Ar.test(e), $ = (e) => !!e && !Number.isNaN(Number(e)), Q = (e) => !!e && Number.isInteger(Number(e)), We = (e) => e.endsWith("%") && $(e.slice(0, -1)), Y = (e) => zr.test(e), Xt = () => !0, jr = (e) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  Pr.test(e) && !Or.test(e)
), st = () => !1, Fr = (e) => Lr.test(e), Wr = (e) => Gr.test(e), qr = (e) => !h(e) && !b(e), Kr = (e) => e.startsWith("@container") && (e[10] === "/" && e[11] !== void 0 || e[11] === "s" && e[16] !== void 0 && e.startsWith("-size/", 10) || e[11] === "n" && e[18] !== void 0 && e.startsWith("-normal/", 10)), Br = (e) => te(e, tn, st), h = (e) => Ht.test(e), re = (e) => te(e, nn, jr), St = (e) => te(e, Jr, $), Vr = (e) => te(e, sn, Xt), Ur = (e) => te(e, rn, st), $t = (e) => te(e, Jt, st), Qr = (e) => te(e, en, Wr), Re = (e) => te(e, on, Fr), b = (e) => Zt.test(e), be = (e) => ie(e, nn), Yr = (e) => ie(e, rn), Et = (e) => ie(e, Jt), Hr = (e) => ie(e, tn), Zr = (e) => ie(e, en), _e = (e) => ie(e, on, !0), Xr = (e) => ie(e, sn, !0), te = (e, t, n) => {
  const r = Ht.exec(e);
  return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, ie = (e, t, n = !1) => {
  const r = Zt.exec(e);
  return r ? r[1] ? t(r[1]) : n : !1;
}, Jt = (e) => e === "position" || e === "percentage", en = (e) => e === "image" || e === "url", tn = (e) => e === "length" || e === "size" || e === "bg-size", nn = (e) => e === "length", Jr = (e) => e === "number", rn = (e) => e === "family-name", sn = (e) => e === "number" || e === "weight", on = (e) => e === "shadow", es = () => {
  const e = P("color"), t = P("font"), n = P("text"), r = P("font-weight"), s = P("tracking"), o = P("leading"), a = P("breakpoint"), l = P("container"), c = P("spacing"), d = P("radius"), u = P("shadow"), g = P("inset-shadow"), w = P("text-shadow"), y = P("drop-shadow"), f = P("blur"), m = P("perspective"), v = P("aspect"), R = P("ease"), k = P("animate"), T = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], E = () => [
    "center",
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-top",
    "top-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-top",
    "bottom-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-bottom",
    "bottom-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-bottom"
  ], C = () => [...E(), b, h], S = () => ["auto", "hidden", "clip", "visible", "scroll"], M = () => ["auto", "contain", "none"], x = () => [b, h, c], z = () => [Z, "full", "auto", ...x()], V = () => [Q, "none", "subgrid", b, h], ve = () => ["auto", {
    span: ["full", Q, b, h]
  }, Q, b, h], ke = () => [Q, "auto", b, h], lt = () => ["auto", "min", "max", "fr", b, h], Pe = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"], ae = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"], q = () => ["auto", ...x()], ne = () => [Z, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...x()], Oe = () => [Z, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...x()], Le = () => [Z, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...x()], N = () => [e, b, h], ct = () => [...E(), Et, $t, {
    position: [b, h]
  }], dt = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }], ut = () => ["auto", "cover", "contain", Hr, Br, {
    size: [b, h]
  }], Ge = () => [We, be, re], L = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    d,
    b,
    h
  ], G = () => ["", $, be, re], Ne = () => ["solid", "dashed", "dotted", "double"], mt = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], O = () => [$, We, Et, $t], ft = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    f,
    b,
    h
  ], Ce = () => ["none", $, b, h], Se = () => ["none", $, b, h], je = () => [$, b, h], $e = () => [Z, "full", ...x()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [Y],
      breakpoint: [Y],
      color: [Xt],
      container: [Y],
      "drop-shadow": [Y],
      ease: ["in", "out", "in-out"],
      font: [qr],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [Y],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [Y],
      shadow: [Y],
      spacing: ["px", $],
      text: [Y],
      "text-shadow": [Y],
      tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"]
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", Z, h, b, v]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ["container"],
      /**
       * Container Type
       * @see https://tailwindcss.com/docs/responsive-design#container-queries
       */
      "container-type": [{
        "@container": ["", "normal", "size", b, h]
      }],
      /**
       * Container Name
       * @see https://tailwindcss.com/docs/responsive-design#named-containers
       */
      "container-named": [Kr],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [$, h, b, l]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": T()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": T()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: C()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: S()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": S()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": S()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: M()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": M()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": M()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Inset
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: z()
      }],
      /**
       * Inset Inline
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": z()
      }],
      /**
       * Inset Block
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": z()
      }],
      /**
       * Inset Inline Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-s` in next major release
       */
      start: [{
        "inset-s": z(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        start: z()
      }],
      /**
       * Inset Inline End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-e` in next major release
       */
      end: [{
        "inset-e": z(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        end: z()
      }],
      /**
       * Inset Block Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-bs": [{
        "inset-bs": z()
      }],
      /**
       * Inset Block End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-be": [{
        "inset-be": z()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: z()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: z()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: z()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: z()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [Q, "auto", b, h]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [Z, "full", "auto", l, ...x()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["nowrap", "wrap", "wrap-reverse"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [$, Z, "auto", "initial", "none", h]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", $, b, h]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", $, b, h]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [Q, "first", "last", "none", b, h]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": V()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: ve()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": ke()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": ke()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": V()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: ve()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": ke()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": ke()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": lt()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": lt()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: x()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": x()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": x()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...Pe(), "normal"]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": [...ae(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...ae()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...Pe()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: [...ae(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...ae(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": Pe()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": [...ae(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...ae()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: x()
      }],
      /**
       * Padding Inline
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: x()
      }],
      /**
       * Padding Block
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: x()
      }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: x()
      }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: x()
      }],
      /**
       * Padding Block Start
       * @see https://tailwindcss.com/docs/padding
       */
      pbs: [{
        pbs: x()
      }],
      /**
       * Padding Block End
       * @see https://tailwindcss.com/docs/padding
       */
      pbe: [{
        pbe: x()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: x()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: x()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: x()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: x()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: q()
      }],
      /**
       * Margin Inline
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: q()
      }],
      /**
       * Margin Block
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: q()
      }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: q()
      }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: q()
      }],
      /**
       * Margin Block Start
       * @see https://tailwindcss.com/docs/margin
       */
      mbs: [{
        mbs: q()
      }],
      /**
       * Margin Block End
       * @see https://tailwindcss.com/docs/margin
       */
      mbe: [{
        mbe: q()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: q()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: q()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: q()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: q()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": x()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y": [{
        "space-y": x()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y-reverse": ["space-y-reverse"],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: ne()
      }],
      /**
       * Inline Size
       * @see https://tailwindcss.com/docs/width
       */
      "inline-size": [{
        inline: ["auto", ...Oe()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...Oe()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...Oe()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...Le()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...Le()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...Le()]
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [l, "screen", ...ne()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [
          l,
          "screen",
          /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "none",
          ...ne()
        ]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [
          l,
          "screen",
          "none",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "prose",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          {
            screen: [a]
          },
          ...ne()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...ne()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...ne()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...ne()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", n, be, re]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: [r, Xr, Vr]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", We, h]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [Yr, Ur, t]
      }],
      /**
       * Font Feature Settings
       * @see https://tailwindcss.com/docs/font-feature-settings
       */
      "font-features": [{
        "font-features": [h]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [s, b, h]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [$, "none", b, St]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          o,
          ...x()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", b, h]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["disc", "decimal", "none", b, h]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: N()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: N()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...Ne(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [$, "from-font", "auto", b, re]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: N()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": [$, "auto", b, h]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: x()
      }],
      /**
       * Tab Size
       * @see https://tailwindcss.com/docs/tab-size
       */
      "tab-size": [{
        tab: [Q, b, h]
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", b, h]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Overflow Wrap
       * @see https://tailwindcss.com/docs/overflow-wrap
       */
      wrap: [{
        wrap: ["break-word", "anywhere", "normal"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", b, h]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: ct()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: dt()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: ut()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, Q, b, h],
          radial: ["", b, h],
          conic: [Q, b, h]
        }, Zr, Qr]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: N()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: Ge()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: Ge()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: Ge()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: N()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: N()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: N()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: L()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": L()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": L()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": L()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": L()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": L()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": L()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": L()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": L()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": L()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": L()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": L()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": L()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": L()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": L()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: G()
      }],
      /**
       * Border Width Inline
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": G()
      }],
      /**
       * Border Width Block
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": G()
      }],
      /**
       * Border Width Inline Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": G()
      }],
      /**
       * Border Width Inline End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": G()
      }],
      /**
       * Border Width Block Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-bs": [{
        "border-bs": G()
      }],
      /**
       * Border Width Block End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-be": [{
        "border-be": G()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": G()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": G()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": G()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": G()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": G()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y": [{
        "divide-y": G()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...Ne(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...Ne(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: N()
      }],
      /**
       * Border Color Inline
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": N()
      }],
      /**
       * Border Color Block
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": N()
      }],
      /**
       * Border Color Inline Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": N()
      }],
      /**
       * Border Color Inline End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": N()
      }],
      /**
       * Border Color Block Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-bs": [{
        "border-bs": N()
      }],
      /**
       * Border Color Block End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-be": [{
        "border-be": N()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": N()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": N()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": N()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": N()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: N()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [...Ne(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [$, b, h]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", $, be, re]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: N()
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          u,
          _e,
          Re
        ]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      "shadow-color": [{
        shadow: N()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", g, _e, Re]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": N()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      "ring-w": [{
        ring: G()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      "ring-color": [{
        ring: N()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-w": [{
        "ring-offset": [$, re]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-color": [{
        "ring-offset": N()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      "inset-ring-w": [{
        "inset-ring": G()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      "inset-ring-color": [{
        "inset-ring": N()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", w, _e, Re]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": N()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [$, b, h]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...mt(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": mt()
      }],
      /**
       * Mask Clip
       * @see https://tailwindcss.com/docs/mask-clip
       */
      "mask-clip": [{
        "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"]
      }, "mask-no-clip"],
      /**
       * Mask Composite
       * @see https://tailwindcss.com/docs/mask-composite
       */
      "mask-composite": [{
        mask: ["add", "subtract", "intersect", "exclude"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image-linear-pos": [{
        "mask-linear": [$]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": O()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": O()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": N()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": N()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": O()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": O()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": N()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": N()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": O()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": O()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": N()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": N()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": O()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": O()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": N()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": N()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": O()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": O()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": N()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": N()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": O()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": O()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": N()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": N()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": O()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": O()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": N()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": N()
      }],
      "mask-image-radial": [{
        "mask-radial": [b, h]
      }],
      "mask-image-radial-from-pos": [{
        "mask-radial-from": O()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": O()
      }],
      "mask-image-radial-from-color": [{
        "mask-radial-from": N()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": N()
      }],
      "mask-image-radial-shape": [{
        "mask-radial": ["circle", "ellipse"]
      }],
      "mask-image-radial-size": [{
        "mask-radial": [{
          closest: ["side", "corner"],
          farthest: ["side", "corner"]
        }]
      }],
      "mask-image-radial-pos": [{
        "mask-radial-at": E()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [$]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": O()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": O()
      }],
      "mask-image-conic-from-color": [{
        "mask-conic-from": N()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": N()
      }],
      /**
       * Mask Mode
       * @see https://tailwindcss.com/docs/mask-mode
       */
      "mask-mode": [{
        mask: ["alpha", "luminance", "match"]
      }],
      /**
       * Mask Origin
       * @see https://tailwindcss.com/docs/mask-origin
       */
      "mask-origin": [{
        "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"]
      }],
      /**
       * Mask Position
       * @see https://tailwindcss.com/docs/mask-position
       */
      "mask-position": [{
        mask: ct()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: dt()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: ut()
      }],
      /**
       * Mask Type
       * @see https://tailwindcss.com/docs/mask-type
       */
      "mask-type": [{
        "mask-type": ["alpha", "luminance"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image": [{
        mask: ["none", b, h]
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          b,
          h
        ]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: ft()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [$, b, h]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [$, b, h]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          y,
          _e,
          Re
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": N()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ["", $, b, h]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [$, b, h]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", $, b, h]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [$, b, h]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", $, b, h]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          b,
          h
        ]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": ft()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [$, b, h]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [$, b, h]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", $, b, h]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [$, b, h]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", $, b, h]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [$, b, h]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [$, b, h]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", $, b, h]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": x()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": x()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": x()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", b, h]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      "transition-behavior": [{
        transition: ["normal", "discrete"]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [$, "initial", b, h]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", R, b, h]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [$, b, h]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", k, b, h]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ["hidden", "visible"]
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [m, b, h]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      "perspective-origin": [{
        "perspective-origin": C()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: Ce()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": Ce()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": Ce()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": Ce()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: Se()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": Se()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": Se()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": Se()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-3d": ["scale-3d"],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: je()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": je()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": je()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [b, h, "", "none", "gpu", "cpu"]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: C()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      "transform-style": [{
        transform: ["3d", "flat"]
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: $e()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": $e()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": $e()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": $e()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-none": ["translate-none"],
      /**
       * Zoom
       * @see https://tailwindcss.com/docs/zoom
       */
      zoom: [{
        zoom: [Q, b, h]
      }],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: N()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: N()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      "color-scheme": [{
        scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", b, h]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      "field-sizing": [{
        "field-sizing": ["fixed", "content"]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["auto", "none"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "", "y", "x"]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scrollbar Thumb Color
       * @see https://tailwindcss.com/docs/scrollbar-color
       */
      "scrollbar-thumb-color": [{
        "scrollbar-thumb": N()
      }],
      /**
       * Scrollbar Track Color
       * @see https://tailwindcss.com/docs/scrollbar-color
       */
      "scrollbar-track-color": [{
        "scrollbar-track": N()
      }],
      /**
       * Scrollbar Gutter
       * @see https://tailwindcss.com/docs/scrollbar-gutter
       */
      "scrollbar-gutter": [{
        "scrollbar-gutter": ["auto", "stable", "both"]
      }],
      /**
       * Scrollbar Width
       * @see https://tailwindcss.com/docs/scrollbar-width
       */
      "scrollbar-w": [{
        scrollbar: ["auto", "thin", "none"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": x()
      }],
      /**
       * Scroll Margin Inline
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": x()
      }],
      /**
       * Scroll Margin Block
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": x()
      }],
      /**
       * Scroll Margin Inline Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": x()
      }],
      /**
       * Scroll Margin Inline End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": x()
      }],
      /**
       * Scroll Margin Block Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbs": [{
        "scroll-mbs": x()
      }],
      /**
       * Scroll Margin Block End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbe": [{
        "scroll-mbe": x()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": x()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": x()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": x()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": x()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": x()
      }],
      /**
       * Scroll Padding Inline
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": x()
      }],
      /**
       * Scroll Padding Block
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": x()
      }],
      /**
       * Scroll Padding Inline Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": x()
      }],
      /**
       * Scroll Padding Inline End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": x()
      }],
      /**
       * Scroll Padding Block Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbs": [{
        "scroll-pbs": x()
      }],
      /**
       * Scroll Padding Block End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbe": [{
        "scroll-pbe": x()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": x()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": x()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": x()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": x()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", b, h]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ["none", ...N()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [$, be, re, St]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...N()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      "container-named": ["container-type"],
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "inset-bs", "inset-be", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pbs", "pbe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mbs", "mbe", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-bs", "border-w-be", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-bs", "border-color-be", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      translate: ["translate-x", "translate-y", "translate-none"],
      "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mbs", "scroll-mbe", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pbs", "scroll-pbe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    },
    postfixLookupClassGroups: ["container-type"],
    orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"]
  };
}, ot = /* @__PURE__ */ Ir(es);
function W(...e) {
  return ot(Ae(e));
}
const ts = nt(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // The default chrome reads the `--btn-*` vars (globals.css) so a look can swap the house
        // tinted wash for stock shadcn's solid primary via `data-buttons` — no variant branch here.
        default: "border border-(--btn-border) bg-(--btn-bg) text-(--btn-fg) hover:bg-(--btn-bg-hover) active:bg-(--btn-bg-active)",
        solid: "bg-accent text-bg hover:bg-accent/90",
        outline: "border border-border bg-bg text-fg hover:bg-panel",
        ghost: "hover:bg-panel hover:text-fg",
        destructive: "border border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive/15 active:bg-destructive/20"
      },
      size: {
        default: "h-9 px-3 py-2",
        sm: "h-8 px-3 text-xs",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
), Me = A.forwardRef(function({ className: t, variant: n, size: r, asChild: s = !1, ...o }, a) {
  return /* @__PURE__ */ i(s ? Xe : "button", { ref: a, className: W(ts({ variant: n, size: r, className: t })), ...o });
});
function ns({ ...e }) {
  return /* @__PURE__ */ i(me.Root, { "data-slot": "dropdown-menu", ...e });
}
function rs({ ...e }) {
  return /* @__PURE__ */ i(me.Trigger, { "data-slot": "dropdown-menu-trigger", ...e });
}
function ss({
  className: e,
  sideOffset: t = 4,
  ...n
}) {
  return /* @__PURE__ */ i(me.Portal, { children: /* @__PURE__ */ i(
    me.Content,
    {
      "data-slot": "dropdown-menu-content",
      sideOffset: t,
      className: W(
        "bg-panel text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border border-border p-1 shadow-md",
        e
      ),
      ...n
    }
  ) });
}
function os({
  className: e,
  inset: t,
  ...n
}) {
  return /* @__PURE__ */ i(
    me.Label,
    {
      "data-slot": "dropdown-menu-label",
      "data-inset": t,
      className: W("px-2 py-1.5 text-xs text-muted data-[inset]:pl-8", e),
      ...n
    }
  );
}
function Rt({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ i(
    me.Separator,
    {
      "data-slot": "dropdown-menu-separator",
      className: W("bg-border -mx-1 my-1 h-px", e),
      ...t
    }
  );
}
const an = A.forwardRef(
  ({ className: e, type: t, ...n }, r) => /* @__PURE__ */ i(
    "input",
    {
      ref: r,
      type: t,
      "data-slot": "input",
      className: W(
        "flex h-9 w-full min-w-0 rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg shadow-sm shadow-black/0 transition-colors placeholder:text-muted/60 selection:bg-accent/20 selection:text-fg focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60",
        e
      ),
      ...n
    }
  )
);
an.displayName = "Input";
const ln = { eu: "/", iso: "-", usa: "/" };
function is(e) {
  const t = ln[e];
  return e === "usa" ? `MM${t}DD${t}YYYY` : e === "iso" ? `YYYY${t}MM${t}DD` : `DD${t}MM${t}YYYY`;
}
function _t(e, t) {
  const n = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e ?? "");
  if (!n) return "";
  const [, r, s, o] = n, a = ln[t];
  return t === "usa" ? `${s}${a}${o}${a}${r}` : t === "iso" ? `${r}${a}${s}${a}${o}` : `${o}${a}${s}${a}${r}`;
}
function _i(e, t) {
  const n = (e ?? "").split(/[/\-.]/).map((l) => l.trim());
  if (n.length !== 3 || n.some((l) => !/^\d+$/.test(l))) return "";
  let r, s, o;
  if (t === "usa" ? [s, o, r] = n : t === "iso" ? [r, s, o] = n : [o, s, r] = n, r.length !== 4) return "";
  const a = `${r}-${s.padStart(2, "0")}-${o.padStart(2, "0")}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(a) ? a : "";
}
function Mt({ value: e, onChange: t, dateStyle: n, className: r, ...s }) {
  const o = J(null), a = n ?? "eu", l = _t(e, a) || is(a), c = !_t(e, a);
  return /* @__PURE__ */ p(
    "div",
    {
      className: W(
        "dash-kit relative inline-flex h-8 items-center rounded-md border border-border bg-bg text-xs shadow-sm transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20",
        r
      ),
      children: [
        /* @__PURE__ */ i(
          "span",
          {
            "aria-hidden": !0,
            className: W("pointer-events-none px-2.5 pr-7", c && "text-muted/60"),
            children: l
          }
        ),
        /* @__PURE__ */ i(En, { "aria-hidden": !0, size: 13, className: "pointer-events-none absolute right-2 text-muted" }),
        /* @__PURE__ */ i(
          "input",
          {
            ...s,
            ref: o,
            type: "date",
            value: e,
            onChange: (d) => t(d.target.value),
            onClick: () => {
              var d;
              try {
                (d = o.current) == null || d.showPicker();
              } catch {
              }
            },
            className: "absolute inset-0 h-full w-full cursor-pointer opacity-0"
          }
        )
      ]
    }
  );
}
const cn = ["Minutes", "Hours", "Days", "Months", "Years"], _ = (e, t) => ({ id: e, label: tt(t), expr: t }), dn = [
  {
    id: "trailing",
    label: "Trailing",
    hint: "ends now",
    cells: {
      Minutes: [
        _("last-5m", "last-5-minutes"),
        _("last-15m", "last-15-minutes"),
        _("last-30m", "last-30-minutes"),
        _("last-60m", "last-60-minutes")
      ],
      Hours: [
        _("last-3h", "last-3-hours"),
        _("last-6h", "last-6-hours"),
        _("last-12h", "last-12-hours"),
        _("last-24h", "last-24-hours")
      ],
      Days: [
        _("last-7d", "last-7-days"),
        _("last-14d", "last-14-days"),
        _("last-30d", "last-30-days"),
        // Kept alongside `last-3-months` on purpose: 90 fixed days is what people type, 3 calendar
        // months is what a report schedule wants. Different columns, so the difference is visible.
        _("last-90d", "last-90-days")
      ],
      Months: [
        _("last-2mo", "last-2-months"),
        _("last-3mo", "last-3-months"),
        _("last-6mo", "last-6-months"),
        _("last-12mo", "last-12-months")
      ],
      // No `last-1-year`: it resolves IDENTICALLY to `last-12-months` one column left, and two
      // adjacent buttons for one window is a question the reader has to stop and answer. Nothing at
      // 5y either — series retention has GC'd it, so the click returns an empty chart, not an error.
      Years: [_("last-2y", "last-2-years"), _("last-3y", "last-3-years")]
    }
  },
  {
    id: "calendar",
    label: "Calendar",
    hint: "whole period",
    cells: {
      // No "this minute" — nobody reaches for it, and an empty cell is information, not a gap.
      Minutes: [],
      Hours: [_("this-hour", "this-hour"), _("last-hour", "last-hour")],
      Days: [
        _("today", "today"),
        _("yesterday", "yesterday"),
        _("this-week", "this-week"),
        _("last-week", "last-week")
      ],
      Months: [
        _("this-month", "this-month"),
        _("last-month", "last-month"),
        _("this-quarter", "this-quarter"),
        _("last-quarter", "last-quarter")
      ],
      Years: [_("this-year", "this-year"), _("last-year", "last-year")]
    }
  }
], Mi = dn.flatMap(
  (e) => cn.flatMap((t) => e.cells[t])
), qe = /^\d{4}-\d{2}-\d{2}$/;
function Ti({
  from: e,
  to: t,
  onApply: n,
  timezone: r,
  compact: s,
  dateStyle: o,
  onUserApply: a
}) {
  const [l, c] = I(!1), d = Kn(), u = Kt((d == null ? void 0 : d.zone) ?? qt, r), g = qe.test(e) && t ? "" : e, [w, y] = I(g), f = de(
    () => qe.test(e) && t && qe.test(t) ? { from: e, to: t } : { from: "", to: "" },
    [e, t]
  ), [m, v] = I(f);
  ee(() => {
    y(g), v(f);
  }, [e, t]);
  const R = de(() => Date.now(), [l]), k = de(() => {
    const S = w.trim();
    if (!S) return null;
    const M = ir(S, void 0, R, u);
    return M ? { text: `${S} → ${Ye(M.fromMs, u)} → ${Ye(M.toMs, u)}` } : { error: "Not a range expression — try last-3-months, this-month, now-4h." };
  }, [w, R, u]), T = (S) => {
    a == null || a(), n(S), c(!1);
  }, E = m.from !== e || m.to !== t, C = !!m.from && !!m.to && m.from > m.to;
  return /* @__PURE__ */ p(ns, { open: l, onOpenChange: c, children: [
    /* @__PURE__ */ i(rs, { asChild: !0, children: /* @__PURE__ */ p(
      Me,
      {
        variant: "outline",
        size: "sm",
        className: W("dash-kit gap-1.5 px-2.5 text-xs font-normal", s ? "h-11 md:h-8" : "h-8"),
        title: "Change the dashboard time range",
        children: [
          /* @__PURE__ */ i(Rn, { size: 13, className: "text-muted" }),
          /* @__PURE__ */ i("span", { className: "max-w-[13rem] truncate", children: s ? dr(e, t) : tt(e, t) }),
          /* @__PURE__ */ i(_n, { size: 13, className: "text-muted" })
        ]
      }
    ) }),
    /* @__PURE__ */ p(
      ss,
      {
        align: "end",
        className: W(
          "dash-kit max-w-[calc(100vw-2rem)] p-0",
          s ? "w-[calc(100vw-2rem)]" : "w-[42rem]"
        ),
        children: [
          /* @__PURE__ */ i(os, { className: "px-3 pt-2.5 text-[0.7rem] uppercase tracking-wide text-muted", children: "Quick ranges" }),
          /* @__PURE__ */ i("div", { className: "px-1.5 pb-2", children: dn.map((S) => /* @__PURE__ */ p("div", { className: "mb-1 last:mb-0", children: [
            /* @__PURE__ */ p("div", { className: "flex items-baseline gap-1.5 px-1 pb-0.5 pt-1", children: [
              /* @__PURE__ */ i("span", { className: "text-[0.7rem] font-medium uppercase tracking-wide text-muted", children: S.label }),
              /* @__PURE__ */ i("span", { className: "text-[0.65rem] text-muted", children: S.hint })
            ] }),
            /* @__PURE__ */ i("div", { className: W("grid gap-x-1 gap-y-0.5", s ? "grid-cols-2" : "grid-cols-5"), children: cn.map((M) => {
              const x = S.cells[M];
              return s && x.length === 0 ? null : /* @__PURE__ */ p("div", { className: "min-w-0", children: [
                !s && /* @__PURE__ */ i("div", { className: "px-2 pb-0.5 text-[0.65rem] uppercase tracking-wide text-muted/70", children: M }),
                x.map((z) => {
                  const V = !t && z.expr === e;
                  return /* @__PURE__ */ p(
                    Me,
                    {
                      variant: "ghost",
                      size: "sm",
                      className: W(
                        "w-full justify-start gap-1.5 px-2 text-xs font-normal",
                        s ? "h-10" : "h-8",
                        V && "bg-muted-bg font-medium text-fg"
                      ),
                      onClick: () => T({ from: z.expr }),
                      children: [
                        /* @__PURE__ */ i(
                          zt,
                          {
                            size: 12,
                            className: W("shrink-0 text-accent", !V && "invisible")
                          }
                        ),
                        /* @__PURE__ */ i("span", { className: "truncate", children: z.label })
                      ]
                    },
                    z.id
                  );
                })
              ] }, M);
            }) })
          ] }, S.id)) }),
          /* @__PURE__ */ i(Rt, { className: "my-0" }),
          /* @__PURE__ */ p("div", { className: "space-y-1.5 px-3 py-2.5", children: [
            /* @__PURE__ */ i("div", { className: "text-[0.7rem] uppercase tracking-wide text-muted", children: "Relative range" }),
            /* @__PURE__ */ p(
              "form",
              {
                className: "flex items-center gap-1.5",
                onSubmit: (S) => {
                  S.preventDefault(), w.trim() && k && !("error" in k) && T({ from: w.trim() });
                },
                children: [
                  /* @__PURE__ */ i(
                    an,
                    {
                      "aria-label": "dashboard relative range",
                      className: "h-8 flex-1 text-xs",
                      placeholder: "last-3-months, this-quarter, now-4h…",
                      value: w,
                      onChange: (S) => y(S.target.value)
                    }
                  ),
                  /* @__PURE__ */ i(
                    Me,
                    {
                      type: "submit",
                      size: "sm",
                      className: "h-8 text-xs",
                      disabled: !w.trim() || !k || "error" in k,
                      title: "Apply this relative range — re-queries every panel",
                      children: "Apply"
                    }
                  )
                ]
              }
            ),
            k && ("error" in k ? /* @__PURE__ */ i("p", { className: "text-[0.7rem] text-danger", children: k.error }) : /* @__PURE__ */ i("p", { className: "truncate text-[0.7rem] text-muted", title: k.text, children: k.text }))
          ] }),
          /* @__PURE__ */ i(Rt, { className: "my-0" }),
          /* @__PURE__ */ p("div", { className: "space-y-2 px-3 py-2.5", children: [
            /* @__PURE__ */ i("div", { className: "text-[0.7rem] uppercase tracking-wide text-muted", children: "Absolute range" }),
            /* @__PURE__ */ p("div", { className: "flex items-center gap-1.5 text-xs text-muted", children: [
              /* @__PURE__ */ i(
                Mt,
                {
                  "aria-label": "dashboard range from",
                  dateStyle: o,
                  className: "flex-1",
                  value: m.from,
                  onChange: (S) => v((M) => ({ ...M, from: S }))
                }
              ),
              /* @__PURE__ */ i("span", { children: "to" }),
              /* @__PURE__ */ i(
                Mt,
                {
                  "aria-label": "dashboard range to",
                  dateStyle: o,
                  className: "flex-1",
                  value: m.to ?? "",
                  onChange: (S) => v((M) => ({ ...M, to: S }))
                }
              )
            ] }),
            C ? /* @__PURE__ */ i("p", { className: "text-[0.7rem] text-danger", children: "The start date must not be after the end date." }) : /* @__PURE__ */ i("p", { className: "text-[0.7rem] text-muted", children: "The end date is exclusive — it ends at the start of that day." }),
            /* @__PURE__ */ i(
              Me,
              {
                size: "sm",
                className: "h-8 w-full text-xs",
                disabled: !E || C || !m.from || !m.to,
                title: E ? "Apply this range — re-queries every panel" : "This range is already applied",
                onClick: () => T({ from: m.from, to: m.to }),
                children: "Apply range"
              }
            )
          ] })
        ]
      }
    )
  ] });
}
const un = 3e4;
function as() {
  return new Pn({
    defaultOptions: {
      queries: {
        // A read either resolves or honestly denies — never retry it into a fabricated success (§9).
        retry: !1,
        // No window refocus refetch: the refresh TICK (in the key) is the freshness signal, not focus.
        refetchOnWindowFocus: !1,
        // Floor stale window; tick-keyed reads are effectively "fresh until the next tick" via the key.
        staleTime: 0,
        gcTime: un
      }
    }
  });
}
function ze(e) {
  return new Promise((t, n) => {
    e.oncomplete = e.onsuccess = () => t(e.result), e.onabort = e.onerror = () => n(e.error);
  });
}
function ls(e, t) {
  let n;
  const r = () => {
    if (n)
      return n;
    const s = indexedDB.open(e);
    return s.onupgradeneeded = () => s.result.createObjectStore(t), n = ze(s), n.then((o) => {
      o.onclose = () => n = void 0;
    }, () => {
      n = void 0;
    }), n;
  };
  return (s, o) => r().then((a) => o(a.transaction(t, s).objectStore(t)));
}
let Ke;
function it() {
  return Ke || (Ke = ls("keyval-store", "keyval")), Ke;
}
function cs(e, t = it()) {
  return t("readonly", (n) => ze(n.get(e)));
}
function ds(e, t, n = it()) {
  return n("readwrite", (r) => (r.put(t, e), ze(r.transaction)));
}
function us(e, t = it()) {
  return t("readwrite", (n) => (n.delete(e), ze(n.transaction)));
}
const mn = "v1", ms = 7 * 24 * 60 * 6e4, fs = "quick-";
function hs(e) {
  return `lb.quick-cache.${mn}.${e}`;
}
function ps(e) {
  const t = hs(e);
  return {
    persistClient: (n) => ds(t, n).catch(() => {
    }),
    restoreClient: () => cs(t).catch(() => {
    }),
    removeClient: () => us(t).catch(() => {
    })
  };
}
const bs = 250;
function gs(e, t) {
  const [n, r] = t.queryKey;
  return typeof n == "string" && n.startsWith(fs) && r === e && t.state.status === "success";
}
function ws(e, t) {
  if (!t) return () => {
  };
  const n = {
    queryClient: e,
    persister: ps(t),
    maxAge: ms,
    // The buster is BELT AND BRACES with the versioned storage key: the key stops a stale store from
    // being found at all, this stops one that somehow was.
    buster: mn,
    dehydrateOptions: { shouldDehydrateQuery: (l) => gs(t, l) }
  };
  let r = !1, s = null, o = null;
  const a = () => {
    r || s || (s = setTimeout(() => {
      s = null, r || Gn(n);
    }, bs));
  };
  return Ln(n).catch(() => {
  }).then(() => {
    r || (a(), o = e.getQueryCache().subscribe(a));
  }), () => {
    r = !0, s && clearTimeout(s), o == null || o();
  };
}
const at = xe(null);
function Ii() {
  const e = oe(at);
  if (e === null) throw new Error("useDashboardWs: no DashboardCacheProvider in tree");
  return e;
}
function Di() {
  return oe(at);
}
function xs({ ws: e, children: t }) {
  const [n] = I(as);
  return ee(() => ws(n, e), [n, e]), /* @__PURE__ */ i(at.Provider, { value: e, children: /* @__PURE__ */ i(On, { client: n, children: t }) });
}
const Be = "[A-Za-z_][\\w.]*", Tt = new RegExp(
  // ${name} or ${name:format}
  `\\$\\{(${Be})(?::[a-z]+)?\\}|\\[\\[(${Be})(?::[a-z]+)?\\]\\]|\\$(${Be})`,
  "g"
);
function ys(e) {
  const t = [], n = /* @__PURE__ */ new Set();
  let r;
  for (Tt.lastIndex = 0; (r = Tt.exec(e)) !== null; ) {
    const s = r[1] ?? r[2] ?? r[3];
    s && !n.has(s) && (n.add(s), t.push(s));
  }
  return t;
}
const vs = "__";
function ks(e) {
  return e.startsWith(vs);
}
function Ns(e) {
  const t = [], n = /* @__PURE__ */ new Set(), r = (s) => {
    if (typeof s == "string")
      for (const o of ys(s))
        n.has(o) || (n.add(o), t.push(o));
    else Array.isArray(s) ? s.forEach(r) : s && typeof s == "object" && Object.values(s).forEach(r);
  };
  return r(e), t;
}
const Cs = " / ";
function Ai(e, t) {
  var s;
  const n = {}, r = ((s = e == null ? void 0 : e.path) == null ? void 0 : s.filter((o) => o != null)) ?? [];
  return r.length > 0 && (n["__nav.label"] = r[r.length - 1], r.length > 1 && (n["__nav.parent.label"] = r[r.length - 2]), r.length > 2 && (n["__nav.parent.parent.label"] = r[r.length - 3]), n["__nav.path"] = r.join(Cs), (e == null ? void 0 : e.id) !== void 0 && (n["__nav.id"] = e.id)), t && (t.id !== void 0 && (n["__page.id"] = t.id), t.title !== void 0 && (n["__page.title"] = t.title), (t.id !== void 0 || t.title !== void 0) && (n["__page.ext"] = t.ext ?? "")), n;
}
const It = "scope";
function Ss(e) {
  let t = e;
  if (e && typeof e == "object" && !Array.isArray(e) && It in e) {
    const { [It]: n, ...r } = e;
    t = r;
  }
  return new Set(Ns(t).filter(ks));
}
function fn(e, t) {
  if (!t || typeof t != "object" || Array.isArray(t)) return t;
  const { builtins: n, ...r } = t;
  if (!n || typeof n != "object" || Array.isArray(n))
    return t;
  const s = Ss(e), o = {};
  let a = !1;
  for (const [l, c] of Object.entries(
    n
  ))
    s.has(l) && (o[l] = c, a = !0);
  return a ? { ...r, builtins: o } : { ...r };
}
function we(e) {
  if (Array.isArray(e)) return e.map(we);
  if (e && typeof e == "object") {
    const t = {};
    for (const n of Object.keys(e).sort()) {
      const r = e[n];
      r !== void 0 && (t[n] = we(r));
    }
    return t;
  }
  return e;
}
function zi(e, t) {
  return [
    "viz.query",
    e,
    we({ ...t, scope: fn(t, t.scope) })
  ];
}
function Pi(e, t) {
  return [
    "viz.fetch",
    e,
    we({ ...t, scope: fn(t, t.scope) })
  ];
}
function Oi(e, t) {
  return ["viz.shape", e, we(t)];
}
function Li(e, t, n) {
  return ["flows.node_state", e, t, n];
}
function Gi(e, t) {
  return ["series.read", e, t];
}
function ji(e) {
  return ["source-picker", e];
}
function $s(e) {
  return ["datasource.list", e];
}
function Es(e, t) {
  return {
    queryKey: $s(e),
    queryFn: () => t(),
    staleTime: un
  };
}
function Fi(e, t, n) {
  return e.fetchQuery(Es(t, n));
}
const Rs = 120;
function Wi({
  refreshMs: e,
  cacheTtlS: t
}) {
  return typeof e == "number" && e > 0 ? Math.max(1, Math.round(e / 1e3)) : t === 0 ? 0 : typeof t == "number" && t > 0 ? Math.floor(t) : Rs;
}
function qi({ ws: e, children: t }) {
  return /* @__PURE__ */ i(xs, { ws: e, children: t });
}
function Ki(e, t) {
  const [n, r] = I(e);
  return ee(() => {
    const s = setTimeout(() => r(e), t);
    return () => clearTimeout(s);
  }, [e, t]), n;
}
const hn = xe(!1), Bi = hn.Provider;
function Vi() {
  return oe(hn);
}
const pn = xe(0), Ui = pn.Provider;
function Qi() {
  return oe(pn);
}
const Dt = 64, _s = "viz.query_batch", Ms = "viz.query";
function Ts(e, t = {}) {
  const n = t.windowMs ?? 12, r = t.batchTool ?? _s, s = t.singleTool ?? Ms;
  let o = [], a = null, l = !0;
  const c = () => {
    a === null && (a = setTimeout(d, n));
  }, d = () => {
    a = null;
    const y = o;
    if (o = [], y.length !== 0)
      for (let f = 0; f < y.length; f += Dt)
        u(y.slice(f, f + Dt));
  }, u = async (y) => {
    if (!l) {
      await g(y);
      return;
    }
    const f = Is(y), m = { panels: y.map((v) => v.panel), now: 0 };
    f && (m.cache = f);
    try {
      const v = await e(r, m), R = (v == null ? void 0 : v.results) ?? [];
      y.forEach((k, T) => w(k, R[T]));
    } catch (v) {
      Ds(v) && (l = !1), await g(y);
    }
  }, g = async (y) => {
    await Promise.all(
      y.map(async (f) => {
        try {
          const m = { panel: f.panel };
          f.cache && (m.cache = f.cache);
          const v = await e(s, m);
          f.resolve({ frames: (v == null ? void 0 : v.frames) ?? [], rows: v == null ? void 0 : v.rows });
        } catch (m) {
          f.reject(m);
        }
      })
    );
  }, w = (y, f) => {
    if (!f) {
      y.reject(new Error("viz.query_batch: missing result slice"));
      return;
    }
    if ("status" in f && (f.status === "error" || f.status === "denied")) {
      y.reject(new Error(f.message || f.status));
      return;
    }
    const m = f;
    y.resolve({ frames: m.frames ?? [], rows: m.rows });
  };
  return {
    load(y, f) {
      return new Promise((m, v) => {
        o.push({ panel: y, cache: f, resolve: m, reject: v }), c();
      });
    },
    get supported() {
      return l;
    }
  };
}
function Is(e) {
  let t = 0;
  for (const n of e) n.cache && n.cache.ttl_s > t && (t = n.cache.ttl_s);
  return t > 0 ? { ttl_s: t } : void 0;
}
function Ds(e) {
  const t = (e instanceof Error ? e.message : String(e ?? "")).toLowerCase();
  return /not.?found|unknown (tool|command|verb|method)|no such|unsupported|\b400\b|\b404\b|unrecognized/.test(
    t
  );
}
const bn = xe(null);
function Yi() {
  return oe(bn);
}
function Hi({ call: e, children: t }) {
  const n = ye(), r = de(
    () => Ts(e ?? ((s, o) => n.client.call(s, o))),
    [e, n.client]
  );
  return /* @__PURE__ */ i(bn.Provider, { value: r, children: t });
}
function As(e) {
  return e.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function zs(e) {
  return /\.(publish|write|enqueue|command|set|send|record|create|delete|resolve|derive|simulate)$/.test(
    e
  );
}
function Ps(e, t) {
  const n = t.startsWith(`${e}.`) ? t.slice(e.length + 1) : t;
  return `${e} · ${n}`;
}
function Os(e) {
  return e.map((t) => ({
    id: `series:${t}`,
    group: "series",
    label: t,
    source: { tool: "series.read", args: { series: t } },
    writes: !1
  }));
}
function Ls(e) {
  return e.map((t) => ({
    id: `live:${t}`,
    group: "live",
    label: `${t} (live)`,
    source: { tool: "series.watch", args: { series: t } },
    writes: !1
  }));
}
function Gs(e) {
  var n, r, s;
  const t = [];
  for (const o of e) {
    if (!o.enabled) continue;
    const a = /* @__PURE__ */ new Set();
    (r = (n = o.ui) == null ? void 0 : n.scope) == null || r.forEach((l) => a.add(l)), (s = o.widgets) == null || s.forEach((l) => {
      var c;
      return (c = l.scope) == null ? void 0 : c.forEach((d) => a.add(d));
    });
    for (const l of a) {
      const c = zs(l);
      t.push({
        id: `ext:${o.ext}:${l}`,
        group: c ? "action" : "extension",
        label: Ps(o.ext, l),
        source: c ? void 0 : { tool: l, args: {} },
        action: c ? { tool: l, argsTemplate: {} } : void 0,
        writes: c
      });
    }
  }
  return t;
}
function js(e) {
  const t = [];
  for (const n of e)
    if (n.enabled)
      for (const r of n.widgets ?? []) {
        const s = r.id ?? As(r);
        t.push({
          id: `widget:${n.ext}/${s}`,
          group: "widget",
          label: `${n.ext} · ${r.label}`,
          icon: r.icon,
          viewKey: `ext:${n.ext}/${s}`,
          data: r.data === !0,
          writes: !1
        });
      }
  return t;
}
function Fs(e, t) {
  const n = new Map(t.map((s) => [s.type, s])), r = [];
  for (const s of e)
    for (const o of s.nodes ?? []) {
      const a = n.get(o.type);
      if (a) {
        for (const l of a.inputs ?? [])
          r.push({
            id: `flows:in:${s.id}:${o.id}:${l}`,
            group: "flows",
            label: `${s.name || s.id} › ${o.id} › ${l} (input)`,
            action: {
              tool: "flows.inject",
              argsTemplate: { id: s.id, node: o.id, port: l, value: "{{value}}" }
            },
            writes: !0
          });
        for (const l of a.outputs ?? [])
          r.push({
            id: `flows:out:${s.id}:${o.id}:${l}`,
            group: "flows",
            label: `${s.name || s.id} › ${o.id} › ${l} (output)`,
            source: {
              tool: "flows.node_state",
              args: { id: s.id, __flowNode: o.id, __flowPort: l }
            },
            writes: !1
          });
      }
    }
  return r;
}
function Ws(e) {
  return e.map((t) => ({
    id: `rule:${t.id}`,
    group: "rules",
    label: t.name || t.id,
    source: { tool: "rules.run", args: { rule_id: t.id, route: !1 } },
    writes: !1,
    params: t.params ?? []
  }));
}
function qs(e) {
  return e.map((t) => ({
    id: `query:${t.id}`,
    group: "queries",
    label: t.name || t.id,
    source: { tool: "query.run", args: { id: t.id } },
    writes: !1
  }));
}
const Ks = "sql:query";
function Bs() {
  return {
    id: Ks,
    group: "sql",
    label: "SQL query (direct SurrealDB)",
    source: { tool: "store.query", args: { sql: "" } },
    writes: !1
  };
}
function Vs(e) {
  return [
    ...Os(e.series ?? []),
    ...Ls(e.series ?? []),
    ...Gs(e.extensions ?? []),
    ...js(e.extensions ?? []),
    ...Fs(e.flows ?? [], e.descriptors ?? []),
    ...Ws(e.rules ?? []),
    ...qs(e.queries ?? []),
    Bs()
  ];
}
function gn(e) {
  return { id: e.id, source: e.source, action: e.action, viewKey: e.viewKey };
}
const wn = {
  datasources: "listDatasources",
  schema: "readSchema",
  series: "listSeries",
  channels: "listChannels",
  insights: "listInsights",
  inbox: "listInbox",
  queries: "listQueries",
  extensions: "listExtensions",
  rules: "listRules",
  flowSummaries: "listFlows",
  flowDescriptors: "listFlowNodes"
}, Us = Object.keys(wn);
function Qs(e) {
  return e instanceof Error ? e.message : String(e);
}
async function Ys(e, t) {
  const n = {}, r = (s, o) => {
    n[s] = o, t == null || t((a) => ({ ...a, [s]: o }));
  };
  return await Promise.all(
    Us.map(async (s) => {
      const o = await xn(e, s);
      o && r(s, o);
    })
  ), n;
}
async function xn(e, t) {
  const n = e[wn[t]];
  if (n)
    try {
      return { status: "ready", data: await n() };
    } catch (r) {
      return { status: "denied", error: Qs(r) };
    }
}
async function Hs(e) {
  const t = await Ys(e), n = se(t.flowSummaries, []), r = se(t.flowDescriptors, []), s = e.getFlow, o = s ? (await Promise.all(n.map((u) => s(u.id).catch(() => null)))).filter((u) => u != null) : [], a = se(t.series, []), l = se(t.extensions, []);
  se(t.datasources, []);
  const c = se(t.rules, []), d = se(t.queries, []);
  return {
    entries: Vs({
      series: a,
      extensions: l,
      flows: o,
      descriptors: r,
      rules: c,
      queries: d
    }),
    installed: l
  };
}
function se(e, t) {
  return (e == null ? void 0 : e.status) === "ready" ? e.data : t;
}
function Zi(e, t) {
  const [n, r] = I({
    entries: [],
    installed: [],
    loading: !0
  }), s = J(e);
  return s.current = e, ee(() => {
    const o = s.current;
    let a = !1;
    return r((l) => ({ ...l, loading: !0 })), (async () => {
      const { entries: l, installed: c } = await Hs(o);
      a || r({ entries: l, installed: c, loading: !1 });
    })(), () => {
      a = !0;
    };
  }, [t]), n;
}
const Zs = [
  {
    kind: "datasources",
    label: "Datasources",
    hint: "Registered external sources — click to query by name."
  },
  {
    kind: "schema",
    label: "Local tables",
    hint: "Tables in this workspace's store — click to insert a name."
  },
  {
    kind: "series",
    label: "Series",
    hint: "Discoverable timeseries — click to read 24h of history."
  },
  {
    kind: "channels",
    label: "Channels",
    hint: "Registered channels in this workspace — click to reference one."
  },
  {
    kind: "insights",
    label: "Insights",
    hint: "Open data findings — click to reference one."
  },
  {
    kind: "inbox",
    label: "Inbox",
    hint: "Items in this channel's inbox — click to reference one."
  },
  {
    kind: "queries",
    label: "Saved queries",
    hint: "Saved PRQL/raw queries — click to run or reference one."
  }
];
function Xi(e) {
  return e.map((t) => ({
    kind: "datasource",
    id: `datasource:${t.name}`,
    name: t.name,
    rowKind: t.kind,
    endpoint: t.endpoint
  }));
}
function Ji(e) {
  return e.tables.map((t) => ({
    kind: "table",
    id: `table:${t.name}`,
    table: t.name
  }));
}
function ea(e) {
  const t = [];
  for (const n of e.tables)
    for (const r of n.columns)
      t.push({
        kind: "column",
        id: `column:${n.name}.${r.name}`,
        table: n.name,
        column: r.name
      });
  return t;
}
function ta(e) {
  return e.map((t) => ({ kind: "series", id: `series:${t}`, name: t }));
}
function Xs(e) {
  return e.map((t) => ({ kind: "channel", id: `channel:${t.id}`, name: t.id }));
}
function Js(e) {
  return e.map((t) => ({
    kind: "insight",
    id: `insight:${t.id}`,
    title: t.title,
    severity: t.severity,
    status: t.status
  }));
}
function eo(e) {
  return e.map((t) => ({ kind: "inbox", id: `inbox:${t.id}`, channel: t.channel }));
}
function na(e) {
  return e.map((t) => ({
    kind: "query",
    id: `query:${t.id}`,
    name: t.name || t.id,
    target: t.target
  }));
}
function to(e) {
  const t = [];
  return e.listDatasources && t.push("datasources"), e.readSchema && t.push("schema"), e.listSeries && t.push("series"), e.listChannels && t.push("channels"), e.listInsights && t.push("insights"), e.listInbox && t.push("inbox"), e.listQueries && t.push("queries"), e.listExtensions && t.push("extensions"), e.listRules && t.push("rules"), e.listFlows && t.push("flowSummaries"), e.listFlowNodes && t.push("flowDescriptors"), t;
}
function At(e) {
  const t = {};
  for (const n of to(e))
    t[n] = { status: "idle" };
  return t;
}
function ra(e, t) {
  const [n, r] = I(() => At(e)), s = J(e);
  s.current = e, ee(() => {
    r(At(s.current));
  }, [t]);
  const o = F((a) => {
    r((l) => {
      const c = l[a];
      if (c && c.status !== "idle") return l;
      const d = { ...l, [a]: { status: "loading" } };
      return xn(s.current, a).then((u) => {
        u && r((g) => ({ ...g, [a]: u }));
      }), d;
    });
  }, []);
  return { sections: n, loadSection: o };
}
const yn = [
  { group: "series", label: "Series" },
  { group: "live", label: "Live (Zenoh)" },
  { group: "sql", label: "Direct SurrealDB" },
  { group: "extension", label: "Installed extension" },
  { group: "widget", label: "Extension widgets" },
  { group: "flows", label: "Flows" },
  { group: "rules", label: "Rules" },
  { group: "queries", label: "Saved queries" }
], sa = [
  { group: "series", label: "Series" },
  { group: "live", label: "Live (Zenoh)" },
  { group: "sql", label: "Direct SurrealDB" },
  { group: "extension", label: "Installed extension" },
  { group: "action", label: "Action (control)" },
  { group: "widget", label: "Extension widgets" }
];
function oa({
  entries: e,
  value: t = "",
  onSelect: n,
  loading: r = !1,
  groups: s = yn,
  "aria-label": o = "source",
  className: a
}) {
  const l = (c) => {
    const d = e.find((u) => u.id === c) ?? null;
    n(d ? gn(d) : null);
  };
  return /* @__PURE__ */ i("label", { className: `sp-root${a ? ` ${a}` : ""}`, children: /* @__PURE__ */ p(
    "select",
    {
      className: "sp-select",
      "aria-label": o,
      value: t,
      onChange: (c) => l(c.target.value),
      children: [
        /* @__PURE__ */ i("option", { value: "", children: r ? "loading sources…" : "— pick a source —" }),
        s.map(({ group: c, label: d }) => /* @__PURE__ */ i(no, { entries: e, group: c, label: d }, c))
      ]
    }
  ) });
}
function no({
  entries: e,
  group: t,
  label: n
}) {
  const r = e.filter((s) => s.group === t);
  return r.length === 0 ? null : /* @__PURE__ */ i("optgroup", { label: n, children: r.map((s) => /* @__PURE__ */ i("option", { value: s.id, children: s.label }, s.id)) });
}
function ia({
  entries: e,
  value: t = "",
  onSelect: n,
  onSelectEntry: r,
  loading: s = !1,
  groups: o = yn,
  "aria-label": a = "source",
  className: l,
  placeholder: c = "Search sources…",
  autoFocus: d = !1
}) {
  const [u, g] = I(""), [w, y] = I(!1), [f, m] = I(0), v = J(null), R = e.find((C) => C.id === t) ?? null, k = de(() => {
    const C = u.trim().toLowerCase(), S = [];
    for (const { group: M, label: x } of o)
      e.filter(
        (V) => V.group === M && (C === "" || V.label.toLowerCase().includes(C) || x.toLowerCase().includes(C))
      ).forEach((V, ve) => S.push({ entry: V, groupLabel: x, firstOfGroup: ve === 0 }));
    return S;
  }, [e, o, u]), T = (C) => {
    n(C ? gn(C) : null), r == null || r(C), y(!1), g("");
  }, E = (C) => {
    C.key === "ArrowDown" ? (C.preventDefault(), y(!0), m((S) => Math.min(S + 1, k.length - 1))) : C.key === "ArrowUp" ? (C.preventDefault(), m((S) => Math.max(S - 1, 0))) : C.key === "Enter" ? (C.preventDefault(), w && k[f] && T(k[f].entry)) : C.key === "Escape" && y(!1);
  };
  return /* @__PURE__ */ p("div", { className: `sp-root sp-combo${l ? ` ${l}` : ""}`, children: [
    /* @__PURE__ */ i(
      "input",
      {
        className: "sp-combo-input",
        role: "combobox",
        "aria-expanded": w,
        "aria-label": a,
        "aria-autocomplete": "list",
        autoFocus: d,
        value: w ? u : (R == null ? void 0 : R.label) ?? "",
        placeholder: s ? "loading sources…" : R ? R.label : c,
        onFocus: () => y(!0),
        onBlur: () => setTimeout(() => y(!1), 120),
        onChange: (C) => {
          g(C.target.value), y(!0), m(0);
        },
        onKeyDown: E
      }
    ),
    w && /* @__PURE__ */ p("ul", { className: "sp-combo-list", role: "listbox", "aria-label": a, ref: v, children: [
      k.length === 0 && /* @__PURE__ */ i("li", { className: "sp-combo-empty", children: "No matching sources" }),
      k.map((C, S) => /* @__PURE__ */ p("li", { role: "presentation", children: [
        C.firstOfGroup && /* @__PURE__ */ i("div", { className: "sp-combo-group", children: C.groupLabel }),
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            role: "option",
            "aria-selected": S === f,
            className: `sp-combo-option${S === f ? " is-active" : ""}${C.entry.id === t ? " is-selected" : ""}`,
            onMouseDown: (M) => {
              M.preventDefault(), T(C.entry);
            },
            onMouseEnter: () => m(S),
            children: C.entry.label
          }
        )
      ] }, C.entry.id))
    ] })
  ] });
}
function ro({ spec: e, state: t, onOpen: n, defaultOpen: r, children: s }) {
  const [o, a] = I(r ?? t.status !== "idle"), l = t.status === "idle", c = (d) => {
    a(d), d && l && n && n();
  };
  return /* @__PURE__ */ p(
    ue.Root,
    {
      className: "sp-catalog-section",
      "aria-label": `section ${e.label}`,
      open: o,
      onOpenChange: c,
      children: [
        /* @__PURE__ */ p(
          ue.Trigger,
          {
            className: "sp-catalog-section-head",
            "aria-label": `toggle section ${e.label}`,
            children: [
              /* @__PURE__ */ i(Pt, { className: "sp-catalog-section-chevron" }),
              /* @__PURE__ */ i("h3", { className: "sp-catalog-section-title", children: e.label }),
              /* @__PURE__ */ i("p", { className: "sp-catalog-section-hint", children: e.hint })
            ]
          }
        ),
        /* @__PURE__ */ i(ue.Content, { className: "sp-catalog-section-content", children: so(t, s) })
      ]
    }
  );
}
function so(e, t) {
  return e.status === "idle" ? /* @__PURE__ */ i("p", { className: "sp-catalog-idle", children: "Expand to load." }) : e.status === "loading" ? /* @__PURE__ */ i("div", { "aria-label": "loading", className: "sp-catalog-skeleton" }) : e.status === "denied" ? /* @__PURE__ */ i("p", { "aria-label": "denied", className: "sp-catalog-denied", children: "Not permitted." }) : t(e.data);
}
function ce({ children: e }) {
  return /* @__PURE__ */ i("p", { className: "sp-catalog-empty", children: e });
}
function oo({ schema: e, onSelect: t }) {
  return /* @__PURE__ */ i("ul", { "aria-label": "schema browser", className: "sp-catalog-tree", children: e.tables.map((n) => /* @__PURE__ */ i(io, { name: n.name, columns: n.columns.map((r) => r.name), onSelect: t }, n.name)) });
}
function io({
  name: e,
  columns: t,
  onSelect: n
}) {
  return /* @__PURE__ */ i("li", { children: /* @__PURE__ */ p(ue.Root, { className: "group/collapsible sp-catalog-tree-row", defaultOpen: !1, children: [
    /* @__PURE__ */ p("div", { className: "sp-catalog-tree-row-inner", children: [
      /* @__PURE__ */ i(
        ue.Trigger,
        {
          "aria-label": `toggle table ${e}`,
          className: "sp-catalog-toggle",
          children: /* @__PURE__ */ i(Pt, { className: "sp-catalog-chevron" })
        }
      ),
      /* @__PURE__ */ p(
        "button",
        {
          type: "button",
          "aria-label": `insert table ${e}`,
          className: "sp-catalog-tree-table",
          onClick: () => n({ kind: "table", id: `table:${e}`, table: e }),
          children: [
            /* @__PURE__ */ i(Mn, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
            /* @__PURE__ */ i("span", { className: "sp-catalog-tree-table-name", children: e })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ i(ue.Content, { className: "sp-catalog-tree-content", children: /* @__PURE__ */ i("ul", { className: "sp-catalog-tree-columns", children: t.length === 0 ? /* @__PURE__ */ i("li", { className: "sp-catalog-tree-no-columns", children: "no columns" }) : t.map((r) => /* @__PURE__ */ i("li", { children: /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        "aria-label": `insert column ${e}.${r}`,
        className: "sp-catalog-tree-column",
        onClick: () => n({ kind: "column", id: `column:${e}.${r}`, table: e, column: r }),
        children: r
      }
    ) }, r)) }) })
  ] }) });
}
function aa({
  sections: e,
  onSelect: t,
  onLoadSection: n,
  sectionSpecs: r = Zs,
  className: s
}) {
  return /* @__PURE__ */ i("div", { "aria-label": "data explorer", className: `sp-root sp-catalog${s ? ` ${s}` : ""}`, children: r.map((o) => {
    const a = e[o.kind];
    return a ? /* @__PURE__ */ i(
      ro,
      {
        spec: o,
        state: a,
        onOpen: n ? () => n(o.kind) : void 0,
        children: (l) => ao(o.kind, l, t)
      },
      o.kind
    ) : null;
  }) });
}
function ao(e, t, n) {
  switch (e) {
    case "datasources": {
      const r = t ?? [];
      return r.length === 0 ? /* @__PURE__ */ i(ce, { children: "No external datasources registered." }) : /* @__PURE__ */ i("ul", { className: "sp-catalog-list", children: r.map((s) => /* @__PURE__ */ i("li", { children: /* @__PURE__ */ p(
        "button",
        {
          type: "button",
          "aria-label": `insert datasource ${s.name}`,
          className: "sp-catalog-row sp-catalog-row-datasource",
          onClick: () => n({
            kind: "datasource",
            id: `datasource:${s.name}`,
            name: s.name,
            rowKind: s.kind,
            endpoint: s.endpoint
          }),
          children: [
            /* @__PURE__ */ p("span", { className: "sp-catalog-row-label", children: [
              /* @__PURE__ */ i(An, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
              s.name
            ] }),
            /* @__PURE__ */ i("span", { className: "sp-catalog-row-sub", children: s.endpoint ? `${s.kind} · ${s.endpoint}` : s.kind })
          ]
        }
      ) }, s.name)) });
    }
    case "schema": {
      const r = t;
      return r.tables.length === 0 ? /* @__PURE__ */ i(ce, { children: "No local tables yet." }) : /* @__PURE__ */ i(oo, { schema: r, onSelect: n });
    }
    case "series": {
      const r = t ?? [];
      return r.length === 0 ? /* @__PURE__ */ i(ce, { children: "No series in this workspace." }) : /* @__PURE__ */ i("ul", { className: "sp-catalog-list", children: r.map((s) => /* @__PURE__ */ i("li", { children: /* @__PURE__ */ p(
        "button",
        {
          type: "button",
          "aria-label": `insert series ${s}`,
          className: "sp-catalog-row sp-catalog-row-series",
          onClick: () => n({ kind: "series", id: `series:${s}`, name: s }),
          children: [
            /* @__PURE__ */ i(Dn, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
            s
          ]
        }
      ) }, s)) });
    }
    case "channels": {
      const r = t ?? [];
      return r.length === 0 ? /* @__PURE__ */ i(ce, { children: "No channels registered." }) : /* @__PURE__ */ i("ul", { className: "sp-catalog-list", children: r.map((s) => {
        const o = Xs([s])[0];
        return /* @__PURE__ */ i("li", { children: /* @__PURE__ */ p(
          "button",
          {
            type: "button",
            "aria-label": `insert channel ${s.id}`,
            className: "sp-catalog-row sp-catalog-row-channel",
            onClick: () => n(o),
            children: [
              /* @__PURE__ */ i(In, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
              s.id
            ]
          }
        ) }, o.id);
      }) });
    }
    case "insights": {
      const r = t ?? [];
      return r.length === 0 ? /* @__PURE__ */ i(ce, { children: "No insights in this workspace." }) : /* @__PURE__ */ i("ul", { className: "sp-catalog-list", children: r.map((s) => {
        const o = Js([s])[0];
        return /* @__PURE__ */ i("li", { children: /* @__PURE__ */ p(
          "button",
          {
            type: "button",
            "aria-label": `insert insight ${s.title}`,
            className: "sp-catalog-row sp-catalog-row-insight",
            onClick: () => n(o),
            children: [
              /* @__PURE__ */ p("span", { className: "sp-catalog-row-label", children: [
                /* @__PURE__ */ i(Ue, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
                s.title
              ] }),
              (s.severity || s.status) && /* @__PURE__ */ i("span", { className: "sp-catalog-row-sub", children: [s.severity, s.status].filter(Boolean).join(" · ") })
            ]
          }
        ) }, o.id);
      }) });
    }
    case "inbox": {
      const r = t ?? [];
      return r.length === 0 ? /* @__PURE__ */ i(ce, { children: "No items in this inbox." }) : /* @__PURE__ */ i("ul", { className: "sp-catalog-list", children: r.map((s) => {
        const o = eo([s])[0];
        return /* @__PURE__ */ i("li", { children: /* @__PURE__ */ p(
          "button",
          {
            type: "button",
            "aria-label": `insert inbox item ${s.id}`,
            className: "sp-catalog-row sp-catalog-row-inbox",
            onClick: () => n(o),
            children: [
              /* @__PURE__ */ p("span", { className: "sp-catalog-row-label", children: [
                /* @__PURE__ */ i(Tn, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
                s.id
              ] }),
              /* @__PURE__ */ i("span", { className: "sp-catalog-row-sub", children: s.channel })
            ]
          }
        ) }, o.id);
      }) });
    }
    default:
      return null;
  }
}
const lo = ["info", "warning", "critical"];
function la(e) {
  return lo.indexOf(e);
}
function co(e) {
  return e === "critical" ? "destructive" : e === "warning" ? "warning" : "accent-2";
}
function ca(e) {
  switch (e) {
    case "critical":
      return "hsl(var(--destructive))";
    case "warning":
      return "hsl(var(--warning))";
    default:
      return "hsl(var(--accent-2))";
  }
}
function uo(e) {
  return e === "open" ? "default" : e === "acked" ? "warning" : "success";
}
function mo(e, t = Date.now()) {
  const n = Math.max(1, Math.floor((t - e) / 1e3));
  if (n < 60) return `${n}s ago`;
  const r = Math.floor(n / 60);
  if (r < 60) return n % 60 ? `${r}m ${n % 60}s ago` : `${r}m ago`;
  const s = Math.floor(r / 60);
  return s < 24 ? r % 60 ? `${s}h ${r % 60}m ago` : `${s}h ago` : `${Math.floor(s / 24)}d ago`;
}
function fo(e) {
  const t = `${e.kind}:${e.ref}`;
  return e.run ? `${t} · run:${e.run}` : t;
}
function ho(e, t) {
  const [n, r] = I([]), [s, o] = I(null), [a, l] = I(!1), [c, d] = I(null), [u, g] = I(null), [w, y] = I(t), f = J(e);
  f.current = e;
  const m = F(async () => {
    l(!0);
    try {
      const E = await f.current.list({ ...w, cursor: void 0 });
      r(E.items), g(E.next ?? null), o(null);
    } catch (E) {
      o(E instanceof Error ? E.message : String(E));
    } finally {
      l(!1);
    }
  }, [w]), v = F(async () => {
    if (u) {
      l(!0);
      try {
        const E = await f.current.list({ ...w, cursor: u });
        r((C) => {
          const S = new Set(C.map((M) => M.id));
          return [...C, ...E.items.filter((M) => !S.has(M.id))];
        }), g(E.next ?? null), o(null);
      } catch (E) {
        o(E instanceof Error ? E.message : String(E));
      } finally {
        l(!1);
      }
    }
  }, [w, u]);
  ee(() => {
    m();
  }, [m]);
  const R = J(m);
  R.current = m, ee(() => {
    const E = f.current.subscribe;
    return E ? E(() => {
      R.current();
    }) : void 0;
  }, []);
  const k = F((E) => {
    y(E);
  }, []), T = F(
    async (E, C) => {
      d(E);
      try {
        C === "ack" ? await f.current.ack(E) : await f.current.resolve(E), await m();
      } catch (S) {
        o(S instanceof Error ? S.message : String(S));
      } finally {
        d(null);
      }
    },
    [m]
  );
  return {
    items: n,
    error: s,
    loading: a,
    actingOn: c,
    nextCursor: u,
    refresh: m,
    loadMore: v,
    setFilter: k,
    act: T
  };
}
function da(e, t, n = 50) {
  const [r, s] = I(null), [o, a] = I(null), [l, c] = I(null), [d, u] = I(!0), [g, w] = I(null), [y, f] = I(0), m = J(e);
  m.current = e, ee(() => {
    let k = !1;
    return (async () => {
      c(null), u(!0);
      try {
        const [T, E] = await Promise.all([
          m.current.get(t),
          m.current.occurrences(t, void 0, n)
        ]);
        if (k) return;
        s(T), a(E);
      } catch (T) {
        if (k) return;
        c(T instanceof Error ? T.message : String(T));
      } finally {
        k || u(!1);
      }
    })(), () => {
      k = !0;
    };
  }, [t, n, y]);
  const v = F(() => f((k) => k + 1), []), R = F(
    async (k) => {
      w(k), c(null);
      try {
        k === "ack" ? await m.current.ack(t) : await m.current.resolve(t), f((T) => T + 1);
      } catch (T) {
        c(T instanceof Error ? T.message : String(T));
      } finally {
        w(null);
      }
    },
    [t]
  );
  return { insight: r, occurrences: o, error: l, loading: d, actingOn: g, refresh: v, act: R };
}
function po({ severity: e }) {
  return /* @__PURE__ */ i("span", { className: `ins-badge tone-${co(e)}`, children: e });
}
function bo({ status: e }) {
  return /* @__PURE__ */ i("span", { className: `ins-badge tone-${uo(e)}`, children: e });
}
function go({
  insight: e,
  selected: t,
  onSelect: n,
  showStatus: r = !0,
  showSeverity: s = !1,
  actions: o,
  now: a
}) {
  const l = e.severity === "critical" ? "is-critical" : e.severity === "warning" ? "is-warning" : "is-info", c = /* @__PURE__ */ p($n, { children: [
    /* @__PURE__ */ i("span", { className: `ins-dot ${l}`, role: "img", "aria-label": `severity: ${e.severity}` }),
    /* @__PURE__ */ p("span", { className: "ins-row-main", children: [
      /* @__PURE__ */ i("span", { className: "ins-row-title", children: e.title }),
      /* @__PURE__ */ p("span", { className: "ins-row-meta", children: [
        fo(e.origin),
        " · ×",
        e.count
      ] })
    ] }),
    /* @__PURE__ */ p("span", { className: "ins-row-side", children: [
      s && /* @__PURE__ */ i(po, { severity: e.severity }),
      r && /* @__PURE__ */ i(bo, { status: e.status }),
      /* @__PURE__ */ i("span", { className: "ins-time", children: mo(e.last_ts, a) })
    ] })
  ] });
  return /* @__PURE__ */ p("li", { children: [
    n ? /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        className: `ins-row${t ? " is-selected" : ""}`,
        "aria-selected": t,
        "aria-label": `select insight ${e.dedup_key}`,
        onClick: () => n(e.id),
        children: c
      }
    ) : /* @__PURE__ */ i("div", { className: `ins-row${t ? " is-selected" : ""}`, children: c }),
    o
  ] });
}
function wo({
  insight: e,
  actingOn: t = null,
  onAck: n,
  onResolve: r,
  onDismiss: s
}) {
  const o = t !== null;
  return /* @__PURE__ */ p("div", { className: "ins-actions", children: [
    s && /* @__PURE__ */ p("button", { type: "button", className: "ins-btn", onClick: s, disabled: o, children: [
      /* @__PURE__ */ i(Ot, { size: 13 }),
      "Dismiss"
    ] }),
    e.status === "open" && n && /* @__PURE__ */ p("button", { type: "button", className: "ins-btn", onClick: n, disabled: o, children: [
      t === "ack" ? /* @__PURE__ */ i(Te, { size: 13, className: "ins-spin" }) : /* @__PURE__ */ i(zt, { size: 13 }),
      "Ack"
    ] }),
    e.status !== "resolved" && r && /* @__PURE__ */ p(
      "button",
      {
        type: "button",
        className: "ins-btn is-primary",
        onClick: r,
        disabled: o,
        children: [
          t === "resolve" ? /* @__PURE__ */ i(Te, { size: 13, className: "ins-spin" }) : /* @__PURE__ */ i(ht, { size: 13 }),
          "Resolve"
        ]
      }
    ),
    e.status === "resolved" && /* @__PURE__ */ p("span", { className: "ins-badge tone-success", children: [
      /* @__PURE__ */ i(ht, { size: 12 }),
      " Resolved"
    ] })
  ] });
}
const xo = { limit: 20 };
function vn({
  client: e,
  filter: t = xo,
  title: n = "Insights",
  interactive: r = !1,
  showRefresh: s = !0,
  paged: o = !0,
  onSelect: a,
  now: l
}) {
  const c = ho(e, t), [d, u] = I(/* @__PURE__ */ new Set()), [g, w] = I(null);
  function y(m, v) {
    w(v), c.act(m, v).finally(() => w(null));
  }
  const f = c.items.filter((m) => !d.has(m.id));
  return /* @__PURE__ */ p("div", { className: "ins-root", children: [
    /* @__PURE__ */ p("div", { className: "ins-header", children: [
      /* @__PURE__ */ p("h3", { className: "ins-header-title", children: [
        /* @__PURE__ */ i(Ue, { size: 15 }),
        n,
        f.length > 0 && /* @__PURE__ */ p("span", { className: "ins-header-count", children: [
          "(",
          f.length,
          ")"
        ] })
      ] }),
      s && /* @__PURE__ */ i("div", { className: "ins-header-actions", children: /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: "ins-btn",
          onClick: () => void c.refresh(),
          disabled: c.loading,
          "aria-label": "Refresh insights",
          children: /* @__PURE__ */ i(Te, { size: 13, className: c.loading ? "ins-spin" : void 0 })
        }
      ) })
    ] }),
    c.error && f.length === 0 ? /* @__PURE__ */ i("div", { className: "ins-error", role: "alert", children: c.error }) : f.length === 0 ? /* @__PURE__ */ p("div", { className: "ins-empty", children: [
      /* @__PURE__ */ i(Ue, { size: 16, className: c.loading ? "ins-spin" : void 0 }),
      c.loading ? "Loading insights…" : "No insights match this filter."
    ] }) : /* @__PURE__ */ i("ul", { className: "ins-list", children: f.map((m) => /* @__PURE__ */ i(
      go,
      {
        insight: m,
        onSelect: a,
        now: l,
        actions: r ? /* @__PURE__ */ i(
          wo,
          {
            insight: m,
            actingOn: c.actingOn === m.id ? g : null,
            onAck: m.status === "open" ? () => y(m.id, "ack") : void 0,
            onResolve: () => y(m.id, "resolve"),
            onDismiss: () => u((v) => new Set(v).add(m.id))
          }
        ) : void 0
      },
      m.id
    )) }),
    o && c.nextCursor !== null && f.length > 0 && /* @__PURE__ */ i("div", { className: "ins-more", children: /* @__PURE__ */ p(
      "button",
      {
        type: "button",
        className: "ins-btn",
        onClick: () => void c.loadMore(),
        disabled: c.loading,
        "aria-label": "Load more insights",
        children: [
          /* @__PURE__ */ i(Te, { size: 13, className: c.loading ? "ins-spin" : void 0 }),
          "Load more"
        ]
      }
    ) })
  ] });
}
function ua(e) {
  return /* @__PURE__ */ i(vn, { ...e, interactive: !1 });
}
function ma(e) {
  return /* @__PURE__ */ i(vn, { ...e, interactive: !0 });
}
function fa(e) {
  const t = [...e];
  function n() {
    return [...t].sort((r, s) => s.last_ts - r.last_ts || s.id.localeCompare(r.id));
  }
  return {
    async list(r) {
      let s = n();
      r.status && (s = s.filter((d) => d.status === r.status)), r.severity && (s = s.filter((d) => d.severity === r.severity)), r.origin_ref && (s = s.filter((d) => d.origin.ref.includes(r.origin_ref)));
      const o = r.limit ?? 50, a = s.slice(0, o), l = s.length > o ? { ts: a[a.length - 1].last_ts, id: a[a.length - 1].id } : void 0;
      return { items: a.map(({ evidence: d, ...u }) => u), next: l };
    },
    async get(r) {
      return t.find((s) => s.id === r) ?? null;
    },
    async ack(r) {
      const s = t.find((o) => o.id === r);
      s && (s.status = "acked");
    },
    async resolve(r) {
      const s = t.find((o) => o.id === r);
      s && (s.status = "resolved");
    },
    async occurrences() {
      return { items: [] };
    }
  };
}
function ha() {
  const e = () => Promise.reject(new Error("Denied: mcp:insight.list:call"));
  return {
    list: e,
    get: e,
    ack: e,
    resolve: e,
    occurrences: e
  };
}
function B(...e) {
  return ot(Ae(e));
}
function yo({ ...e }) {
  return /* @__PURE__ */ i(j.Root, { ...e });
}
function vo({ ...e }) {
  return /* @__PURE__ */ i(j.Portal, { ...e });
}
const ko = A.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ i(
    j.Overlay,
    {
      ref: r,
      className: B("fixed inset-0 z-50 bg-black/50", t),
      ...n
    }
  );
}), No = A.forwardRef(function({ className: t, children: n, ...r }, s) {
  return /* @__PURE__ */ p(vo, { children: [
    /* @__PURE__ */ i(ko, {}),
    /* @__PURE__ */ i(
      j.Content,
      {
        ref: s,
        className: B(
          "lb-panel fixed inset-y-0 right-0 z-50 flex h-full max-w-[95vw] flex-col border-l border-lbp-border bg-lbp-panel font-sans text-lbp-fg shadow-2xl outline-none",
          t
        ),
        ...r,
        children: n
      }
    )
  ] });
}), Co = A.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ i(j.Title, { ref: r, className: B("text-base font-semibold text-lbp-fg", t), ...n });
}), So = A.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ i(j.Description, { ref: r, className: B("text-xs text-lbp-muted", t), ...n });
});
function $o({ resizable: e, className: t, "aria-label": n = "resize panel" }) {
  return /* @__PURE__ */ i(
    "div",
    {
      role: "separator",
      "aria-orientation": "vertical",
      "aria-label": n,
      tabIndex: 0,
      ...e.handleProps,
      className: B(
        "group absolute left-0 top-0 z-10 h-full w-1.5 -translate-x-1/2 cursor-col-resize touch-none select-none",
        "outline-none",
        t
      ),
      children: /* @__PURE__ */ i(
        "div",
        {
          className: B(
            "mx-auto h-full w-px bg-lbp-border transition-colors",
            "group-hover:w-0.5 group-hover:bg-lbp-accent group-focus-visible:w-0.5 group-focus-visible:bg-lbp-accent",
            e.dragging && "w-0.5 bg-lbp-accent"
          )
        }
      )
    }
  );
}
function Eo({ initial: e, min: t, max: n, step: r = 24 }) {
  const s = F((f) => Math.min(n, Math.max(t, f)), [t, n]), [o, a] = I(() => s(e)), [l, c] = I(!1), d = J(null), u = F(
    (f) => {
      d.current = { x: f.clientX, w: o }, c(!0), f.currentTarget.setPointerCapture(f.pointerId), f.preventDefault();
    },
    [o]
  ), g = F(
    (f) => {
      if (!d.current) return;
      const m = d.current.x - f.clientX;
      a(s(d.current.w + m));
    },
    [s]
  ), w = F((f) => {
    d.current = null, c(!1), f.currentTarget.hasPointerCapture(f.pointerId) && f.currentTarget.releasePointerCapture(f.pointerId);
  }, []), y = F(
    (f) => {
      f.key === "ArrowLeft" ? (a((m) => s(m + r)), f.preventDefault()) : f.key === "ArrowRight" && (a((m) => s(m - r)), f.preventDefault());
    },
    [s, r]
  );
  return { width: o, dragging: l, handleProps: { onPointerDown: u, onPointerMove: g, onPointerUp: w, onKeyDown: y } };
}
function pa({
  open: e,
  onOpenChange: t,
  title: n,
  description: r,
  headerAside: s,
  footer: o,
  "aria-label": a,
  initialWidth: l = 720,
  minWidth: c = 360,
  maxWidth: d = 1200,
  className: u,
  children: g
}) {
  const w = Eo({ initial: l, min: c, max: d });
  return /* @__PURE__ */ i(yo, { open: e, onOpenChange: t, children: /* @__PURE__ */ p(
    No,
    {
      "aria-label": a,
      style: { width: w.width },
      className: B(w.dragging && "select-none", u),
      children: [
        /* @__PURE__ */ i($o, { resizable: w }),
        /* @__PURE__ */ p("header", { className: "flex items-start justify-between gap-3 border-b border-lbp-border bg-lbp-secondary px-4 py-3", children: [
          /* @__PURE__ */ p("div", { className: "min-w-0", children: [
            /* @__PURE__ */ i(Co, { children: n }),
            r ? /* @__PURE__ */ i(So, { className: "mt-0.5", children: r }) : null
          ] }),
          s ? /* @__PURE__ */ i("div", { className: "shrink-0", children: s }) : null
        ] }),
        /* @__PURE__ */ i("div", { className: "min-h-0 flex-1 overflow-auto", children: g }),
        o ? /* @__PURE__ */ i("footer", { className: "flex items-center justify-end gap-2 border-t border-lbp-border bg-lbp-secondary px-4 py-3", children: o }) : null
      ]
    }
  ) });
}
function ba({ title: e, aside: t, className: n, children: r }) {
  return /* @__PURE__ */ p("section", { className: B("mb-4 last:mb-0", n), children: [
    /* @__PURE__ */ p("div", { className: "mb-1.5 flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ i("div", { className: "text-[10px] font-semibold uppercase tracking-wide text-lbp-muted", children: e }),
      t
    ] }),
    r
  ] });
}
function ga({ columns: e, rows: t, empty: n = "—", className: r }) {
  return t.length === 0 ? /* @__PURE__ */ i("div", { className: "py-1 font-mono text-[11px] text-lbp-muted", children: n }) : /* @__PURE__ */ p("table", { className: B("w-full border-collapse font-mono text-[11px] tabular-nums", r), children: [
    /* @__PURE__ */ i("thead", { children: /* @__PURE__ */ i("tr", { className: "text-left text-lbp-muted", children: e.map((s) => /* @__PURE__ */ i("th", { className: "px-0 pb-1 pr-2 font-medium", children: s.header ?? s.key }, s.key)) }) }),
    /* @__PURE__ */ i("tbody", { children: t.map((s) => /* @__PURE__ */ i("tr", { className: "border-t border-lbp-border align-top", children: e.map((o) => {
      const a = s.cells[o.key], l = o.ellipsize && typeof a == "string" ? a : void 0;
      return /* @__PURE__ */ i(
        "td",
        {
          title: l,
          style: o.maxWidth ? { maxWidth: o.maxWidth } : void 0,
          className: B(
            "py-[3px] pr-2 pt-[3px]",
            o.ellipsize && "overflow-hidden text-ellipsis whitespace-nowrap",
            s.tone === "warn" && "text-lbp-amber",
            o.className
          ),
          children: a ?? "—"
        },
        o.key
      );
    }) }, s.id)) })
  ] });
}
function wa({ k: e, v: t, keyWidth: n = 80, className: r }) {
  return /* @__PURE__ */ p("div", { className: B("flex gap-2 py-[2px] font-mono text-[11px]", r), children: [
    /* @__PURE__ */ i("span", { style: { width: n }, className: "shrink-0 text-lbp-muted", children: e }),
    /* @__PURE__ */ i("span", { className: "min-w-0 break-words text-lbp-fg", children: t })
  ] });
}
function kn(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  for (const r of e)
    n.has(r.group) || (n.set(r.group, []), t.push(r.group)), n.get(r.group).push(r);
  return t.map((r) => ({ label: r, items: n.get(r) }));
}
const Ve = 768;
function Ro() {
  const [e, t] = A.useState(void 0);
  return A.useEffect(() => {
    if (!window.matchMedia) {
      t(window.innerWidth < Ve);
      return;
    }
    const n = window.matchMedia(`(max-width: ${Ve - 1}px)`), r = () => t(window.innerWidth < Ve);
    return n.addEventListener("change", r), r(), () => n.removeEventListener("change", r);
  }, []), !!e;
}
function D(...e) {
  return ot(Ae(e));
}
const _o = nt(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nr-accent/25 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border border-nr-accent/20 bg-nr-accent/10 text-nr-accent hover:bg-nr-accent/20",
        ghost: "hover:bg-nr-bg hover:text-nr-fg"
      },
      size: {
        default: "h-9 px-3 py-2",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
), Mo = A.forwardRef(function({ className: t, variant: n, size: r, asChild: s = !1, ...o }, a) {
  return /* @__PURE__ */ i(s ? Xe : "button", { ref: a, className: D(_o({ variant: n, size: r, className: t })), ...o });
});
function To({ ...e }) {
  return /* @__PURE__ */ i(j.Root, { ...e });
}
function Io({ ...e }) {
  return /* @__PURE__ */ i(j.Portal, { ...e });
}
const Do = A.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ i(
    j.Overlay,
    {
      ref: r,
      className: D("fixed inset-0 z-50 bg-black/50 animate-in fade-in-0", t),
      ...n
    }
  );
}), Ao = A.forwardRef(function({ className: t, children: n, side: r = "right", ...s }, o) {
  return /* @__PURE__ */ p(Io, { children: [
    /* @__PURE__ */ i(Do, {}),
    /* @__PURE__ */ p(
      j.Content,
      {
        ref: o,
        className: D(
          "fixed z-50 flex flex-col gap-4 bg-nr-bg text-nr-fg shadow-lg transition ease-in-out animate-in",
          r === "right" && "inset-y-0 right-0 h-full w-3/4 border-l border-nr-border sm:max-w-sm",
          r === "left" && "inset-y-0 left-0 h-full w-3/4 border-r border-nr-border sm:max-w-sm",
          r === "top" && "inset-x-0 top-0 h-auto border-b border-nr-border",
          r === "bottom" && "inset-x-0 bottom-0 h-auto border-t border-nr-border",
          t
        ),
        ...s,
        children: [
          n,
          /* @__PURE__ */ p(j.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nr-accent/25", children: [
            /* @__PURE__ */ i(Ot, { className: "h-4 w-4" }),
            /* @__PURE__ */ i("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
});
function zo({ className: e, ...t }) {
  return /* @__PURE__ */ i("div", { className: D("flex flex-col gap-1.5 p-4", e), ...t });
}
const Po = A.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ i(j.Title, { ref: r, className: D("font-semibold text-nr-fg", t), ...n });
}), Oo = A.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ i(j.Description, { ref: r, className: D("text-sm text-nr-muted", t), ...n });
});
function Lo({
  delayDuration: e = 0,
  ...t
}) {
  return /* @__PURE__ */ i(ge.Provider, { delayDuration: e, ...t });
}
function Go({ ...e }) {
  return /* @__PURE__ */ i(ge.Root, { ...e });
}
function jo({ ...e }) {
  return /* @__PURE__ */ i(ge.Trigger, { ...e });
}
function Fo({
  className: e,
  sideOffset: t = 6,
  ...n
}) {
  return /* @__PURE__ */ i(ge.Portal, { children: /* @__PURE__ */ i(
    ge.Content,
    {
      sideOffset: t,
      className: D(
        "z-50 overflow-hidden rounded-md border border-nr-border bg-nr-panel px-2.5 py-1.5 text-xs text-nr-fg shadow-md animate-in fade-in-0 zoom-in-95",
        e
      ),
      ...n
    }
  ) });
}
const Wo = "nav_rail_state", qo = 60 * 60 * 24 * 7, Ko = "16rem", Bo = "18rem", Vo = "3.5rem", Uo = "b", Nn = A.createContext(null);
function H() {
  const e = A.useContext(Nn);
  if (!e)
    throw new Error("useSidebar must be used within a SidebarProvider.");
  return e;
}
function Qo({
  defaultOpen: e = !0,
  open: t,
  onOpenChange: n,
  className: r,
  style: s,
  children: o,
  ...a
}) {
  const l = Ro(), [c, d] = A.useState(!1), [u, g] = A.useState(e), w = t ?? u, y = A.useCallback(
    (R) => {
      const k = typeof R == "function" ? R(w) : R;
      n ? n(k) : g(k), document.cookie = `${Wo}=${k}; path=/; max-age=${qo}`;
    },
    [w, n]
  ), f = A.useCallback(() => l ? d((R) => !R) : y((R) => !R), [l, y]);
  A.useEffect(() => {
    const R = (k) => {
      k.key === Uo && (k.metaKey || k.ctrlKey) && (k.preventDefault(), f());
    };
    return window.addEventListener("keydown", R), () => window.removeEventListener("keydown", R);
  }, [f]);
  const m = w ? "expanded" : "collapsed", v = A.useMemo(
    () => ({
      state: m,
      open: w,
      setOpen: y,
      isMobile: l,
      openMobile: c,
      setOpenMobile: d,
      toggleSidebar: f
    }),
    [m, w, y, l, c, f]
  );
  return /* @__PURE__ */ i(Nn.Provider, { value: v, children: /* @__PURE__ */ i(Lo, { delayDuration: 0, children: /* @__PURE__ */ i(
    "div",
    {
      "data-slot": "sidebar-wrapper",
      style: {
        "--sidebar-width": Ko,
        "--sidebar-width-icon": Vo,
        ...s
      },
      className: D("group/sidebar-wrapper flex h-full min-h-0 w-full", r),
      ...a,
      children: o
    }
  ) }) });
}
function Yo({
  side: e = "left",
  variant: t = "sidebar",
  collapsible: n = "offcanvas",
  className: r,
  children: s,
  ...o
}) {
  const { isMobile: a, state: l, openMobile: c, setOpenMobile: d } = H(), u = l === "collapsed" && n !== "none", g = t === "floating" || t === "inset";
  if (n === "none")
    return /* @__PURE__ */ i("div", { className: D("flex h-full w-[var(--sidebar-width)] flex-col bg-nr-panel text-nr-fg", r), ...o, children: s });
  if (a)
    return /* @__PURE__ */ i(To, { open: c, onOpenChange: d, ...o, children: /* @__PURE__ */ p(
      Ao,
      {
        "data-sidebar": "sidebar",
        "data-mobile": "true",
        className: "w-[var(--sidebar-width)] bg-nr-panel p-0 text-nr-fg [&>button]:hidden",
        style: { "--sidebar-width": Bo },
        side: e,
        children: [
          /* @__PURE__ */ p(zo, { className: "sr-only", children: [
            /* @__PURE__ */ i(Po, { children: "Sidebar" }),
            /* @__PURE__ */ i(Oo, { children: "Displays the mobile sidebar." })
          ] }),
          /* @__PURE__ */ i("div", { className: "flex h-full w-full flex-col", children: s })
        ]
      }
    ) });
  const w = "w-[var(--sidebar-width)]", y = g ? "w-[calc(var(--sidebar-width-icon)+1rem)]" : "w-[var(--sidebar-width-icon)]";
  return /* @__PURE__ */ p(
    "div",
    {
      className: "group peer hidden text-nr-fg md:block",
      "data-state": l,
      "data-collapsible": u ? n : "",
      "data-variant": t,
      "data-side": e,
      "data-slot": "sidebar",
      children: [
        /* @__PURE__ */ i(
          "div",
          {
            "data-slot": "sidebar-gap",
            className: D(
              "relative h-full bg-transparent transition-[width] duration-200 ease-linear",
              u && n === "offcanvas" ? "w-0" : u ? y : w
            )
          }
        ),
        /* @__PURE__ */ i(
          "div",
          {
            "data-slot": "sidebar-container",
            className: D(
              "fixed inset-y-0 z-10 hidden h-full transition-[left,right,width] duration-200 ease-linear md:flex",
              e === "left" ? "left-0" : "right-0",
              u && n === "offcanvas" && e === "left" && "-left-[var(--sidebar-width)]",
              u && n === "offcanvas" && e === "right" && "-right-[var(--sidebar-width)]",
              u && n === "icon" ? y : w,
              g && "p-2",
              !g && "border-r border-nr-border",
              r
            ),
            ...o,
            children: /* @__PURE__ */ i(
              "div",
              {
                "data-sidebar": "sidebar",
                "data-slot": "sidebar-inner",
                className: D(
                  "flex h-full w-full flex-col bg-nr-panel text-nr-fg",
                  g && "rounded-lg border border-nr-border shadow-sm"
                ),
                children: s
              }
            )
          }
        )
      ]
    }
  );
}
function Ho({
  className: e,
  onClick: t,
  ...n
}) {
  const { toggleSidebar: r } = H();
  return /* @__PURE__ */ p(
    Mo,
    {
      "data-sidebar": "trigger",
      variant: "ghost",
      size: "icon",
      className: D("h-8 w-8 text-nr-muted hover:bg-nr-bg hover:text-nr-fg", e),
      onClick: (s) => {
        t == null || t(s), r();
      },
      ...n,
      children: [
        /* @__PURE__ */ i(zn, { className: "h-4 w-4" }),
        /* @__PURE__ */ i("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
}
function Zo({ className: e, ...t }) {
  const { toggleSidebar: n } = H();
  return /* @__PURE__ */ i(
    "button",
    {
      "data-sidebar": "rail",
      "aria-label": "Toggle Sidebar",
      tabIndex: -1,
      onClick: n,
      title: "Toggle Sidebar",
      className: D(
        "absolute inset-y-0 -right-3 z-20 hidden w-4 transition-all after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 hover:after:bg-nr-border sm:flex",
        e
      ),
      ...t
    }
  );
}
function Xo({ className: e, ...t }) {
  const { state: n } = H();
  return /* @__PURE__ */ i(
    "div",
    {
      "data-sidebar": "header",
      className: D("flex flex-col gap-2 p-2", n === "collapsed" && "items-center px-0", e),
      ...t
    }
  );
}
function Jo({ className: e, ...t }) {
  const { state: n } = H();
  return /* @__PURE__ */ i(
    "div",
    {
      "data-sidebar": "footer",
      className: D("flex flex-col gap-2 p-2", n === "collapsed" && "items-center px-0", e),
      ...t
    }
  );
}
function ei({ className: e, ...t }) {
  return /* @__PURE__ */ i(
    "div",
    {
      "data-sidebar": "content",
      className: D(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        e
      ),
      ...t
    }
  );
}
function ti({ className: e, ...t }) {
  const { state: n } = H();
  return /* @__PURE__ */ i(
    "div",
    {
      "data-sidebar": "group",
      className: D("relative flex w-full min-w-0 flex-col p-2", n === "collapsed" && "items-center px-0", e),
      ...t
    }
  );
}
function ni({ className: e, ...t }) {
  const { state: n } = H();
  return /* @__PURE__ */ i(
    "div",
    {
      "data-sidebar": "group-label",
      className: D(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-nr-muted transition-[margin,opacity] duration-200",
        n === "collapsed" && "-mt-8 opacity-0",
        e
      ),
      ...t
    }
  );
}
function ri({ className: e, ...t }) {
  return /* @__PURE__ */ i("div", { "data-sidebar": "group-content", className: D("w-full text-sm", e), ...t });
}
function si({ className: e, ...t }) {
  const { state: n } = H();
  return /* @__PURE__ */ i(
    "ul",
    {
      "data-sidebar": "menu",
      className: D("flex w-full min-w-0 flex-col gap-1", n === "collapsed" && "items-center", e),
      ...t
    }
  );
}
function oi({ className: e, ...t }) {
  return /* @__PURE__ */ i("li", { "data-sidebar": "menu-item", className: D("group/menu-item relative", e), ...t });
}
const ii = nt(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm text-nr-muted outline-none ring-nr-accent transition-[width,height,padding,color,background-color] hover:bg-nr-bg hover:text-nr-fg focus-visible:ring-2 active:bg-nr-accent/10 active:text-nr-fg disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-nr-bg data-[active=true]:font-medium data-[active=true]:text-nr-fg [&>span:last-child]:truncate [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-nr-bg hover:text-nr-fg",
        outline: "bg-nr-bg shadow-[0_0_0_1px_hsl(var(--nr-border))] hover:bg-nr-bg hover:text-nr-fg"
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function ai({
  asChild: e = !1,
  isActive: t = !1,
  variant: n = "default",
  size: r = "default",
  tooltip: s,
  className: o,
  ...a
}) {
  const l = e ? Xe : "button", { isMobile: c, state: d } = H(), u = /* @__PURE__ */ i(
    l,
    {
      "data-sidebar": "menu-button",
      "data-size": r,
      "data-active": t,
      className: D(
        ii({ variant: n, size: r }),
        d === "collapsed" && "mx-auto h-8 w-8 p-2 [&>span]:sr-only",
        r === "lg" && d === "collapsed" && "mx-auto h-8 w-8 p-0",
        o
      ),
      ...a
    }
  );
  return !s || d !== "collapsed" || c ? u : /* @__PURE__ */ p(Go, { children: [
    /* @__PURE__ */ i(jo, { asChild: !0, children: u }),
    /* @__PURE__ */ i(Fo, { side: "right", align: "center", ...typeof s == "string" ? { children: s } : s })
  ] });
}
function xa({
  items: e,
  active: t,
  onSelect: n,
  header: r,
  footer: s,
  defaultCollapsed: o = !1,
  className: a
}) {
  const l = kn(e);
  return /* @__PURE__ */ i(Qo, { defaultOpen: !o, className: `nav-rail ${a ?? ""}`, children: /* @__PURE__ */ p(Yo, { collapsible: "icon", variant: "sidebar", children: [
    /* @__PURE__ */ p(Xo, { children: [
      r,
      /* @__PURE__ */ i("div", { className: "flex items-center justify-end px-1 group-data-[collapsible=icon]:justify-center", children: /* @__PURE__ */ i(Ho, { "aria-label": "Toggle sidebar", title: "Toggle sidebar" }) })
    ] }),
    /* @__PURE__ */ i(ei, { children: l.map((c, d) => /* @__PURE__ */ p(ti, { children: [
      c.label && /* @__PURE__ */ i(ni, { children: c.label }),
      /* @__PURE__ */ i(ri, { children: /* @__PURE__ */ i(si, { children: c.items.map((u) => {
        const g = t === u.id, w = u.icon;
        return /* @__PURE__ */ i(oi, { children: /* @__PURE__ */ p(
          ai,
          {
            "aria-label": u.label,
            "aria-current": g ? "page" : void 0,
            isActive: g,
            tooltip: u.label,
            onClick: () => n(u.id),
            children: [
              w && /* @__PURE__ */ i(w, {}),
              /* @__PURE__ */ i("span", { children: u.label })
            ]
          }
        ) }, u.id);
      }) }) })
    ] }, c.label ?? `__default-${d}`)) }),
    s && /* @__PURE__ */ i(Jo, { children: s }),
    /* @__PURE__ */ i(Zo, {})
  ] }) });
}
function ya({
  items: e,
  active: t,
  onSelect: n,
  badge: r,
  className: s,
  "aria-label": o = "section navigation"
}) {
  const a = kn(e);
  return /* @__PURE__ */ i(
    "nav",
    {
      "aria-label": o,
      className: D("nav-rail flex min-w-0 flex-col gap-2 text-nr-fg", s),
      children: a.map((l, c) => /* @__PURE__ */ p("div", { className: "flex flex-col gap-1", children: [
        l.label && /* @__PURE__ */ i("div", { className: "px-2 text-xs font-medium text-nr-muted", children: l.label }),
        l.items.map((d) => {
          const u = t === d.id, g = d.icon, w = r == null ? void 0 : r(d.id);
          return /* @__PURE__ */ p(
            "button",
            {
              type: "button",
              role: "tab",
              "aria-label": d.label,
              "aria-current": u ? "page" : void 0,
              "aria-selected": u,
              onClick: () => n(d.id),
              className: D(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none ring-nr-accent transition-colors focus-visible:ring-2",
                "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
                u ? "bg-nr-bg font-medium text-nr-fg" : "text-nr-muted hover:bg-nr-bg hover:text-nr-fg"
              ),
              children: [
                g && /* @__PURE__ */ i(g, {}),
                /* @__PURE__ */ i("span", { className: "min-w-0 flex-1 truncate", children: d.label }),
                w ? /* @__PURE__ */ i("span", { className: "rounded-full bg-nr-accent/15 px-1.5 text-[10px] text-nr-accent", children: w }) : null
              ]
            },
            d.id
          );
        })
      ] }, l.label ?? `__default-${c}`))
    }
  );
}
export {
  nr as BROWSER_TZ,
  sa as BUILDER_SOURCE_GROUPS,
  vs as BUILTIN_PREFIX,
  Zs as CATALOG_SECTION_SPECS,
  ce as CatalogEmpty,
  aa as CatalogExplorer,
  oo as CatalogSchemaTree,
  ro as CatalogSection,
  xi as DASH_KIT_READ_CAPS,
  wi as DASH_KIT_READ_SCOPE,
  $i as DEFAULT_RANGE_EXPR,
  Rs as DEFAULT_TTL_S,
  xs as DashboardCacheProvider,
  Ti as DashboardRangePicker,
  at as DashboardWsContext,
  Bi as FreezeProvider,
  Ui as FreshnessProvider,
  wo as InsightActions,
  go as InsightRow,
  ma as InsightsAckWidget,
  ua as InsightsReadWidget,
  vn as InsightsWidget,
  wa as KV,
  Qe as KitDeniedError,
  yi as KitProvider,
  un as LIST_STALE_MS,
  Dt as MAX_PANELS,
  Cs as NAV_PATH_SEP,
  ya as NavMenu,
  xa as NavRail,
  pa as Panel,
  no as PickerGroup,
  Mt as PrefDateInput,
  ga as PropTable,
  ms as QUICK_PERSIST_MAX_AGE_MS,
  mn as QUICK_PERSIST_VERSION,
  dn as RANGE_BANDS,
  cn as RANGE_COLUMNS,
  Mi as RANGE_PRESETS,
  yn as READ_SOURCE_GROUPS,
  $o as ResizeHandle,
  lo as SEVERITY_ORDER,
  Ks as SQL_SOURCE_ID,
  ba as Section,
  po as SeverityBadge,
  ia as SourceCombobox,
  oa as SourcePicker,
  bo as StatusBadge,
  Hi as VizBatchProvider,
  qi as WithDashboardCache,
  qn as browserZone,
  Vs as buildSourceEntries,
  we as canon,
  Xs as channelEntries,
  Xi as datasourceEntries,
  $s as datasourceListKey,
  Es as datasourceListQueryOptions,
  is as datePlaceholder,
  ha as denyClient,
  js as extWidgetEntries,
  Gs as extensionEntries,
  ys as extractVarNames,
  Ns as extractVarNamesDeep,
  Fi as fetchDatasourceList,
  Li as flowNodeStateKey,
  Fs as flowsEntries,
  _t as formatDateField,
  eo as inboxEntries,
  Js as insightEntries,
  ks as isBuiltinName,
  pi as isKitDenied,
  bi as isOutOfScope,
  Si as isWindowExpr,
  Ye as isoDayOf,
  tt as labelOf,
  Ls as liveEntries,
  Ys as loadCatalog,
  Hs as loadSourcePicker,
  as as makeDashboardQueryClient,
  Wn as makeInsightsClient,
  gi as makeKitClient,
  Fn as makeSourceLoaders,
  Ts as makeVizBatchLoader,
  fa as memoryClient,
  Ai as navBuiltins,
  et as normalizeTz,
  fo as originLine,
  _i as parseDateField,
  Ie as parseRangeExpr,
  ws as persistQuickCache,
  Kt as preferredZone,
  Ri as previewBound,
  na as queryCatalogEntries,
  qs as queryEntries,
  ps as quickPersister,
  Ei as rangeTimezone,
  Wi as resolveFreshnessTtl,
  ir as resolveRange,
  Ws as rulesEntries,
  ea as schemaColumnEntries,
  Ji as schemaTableEntries,
  fn as scopeKey,
  gn as selectionOf,
  ta as seriesCatalogEntries,
  Os as seriesEntries,
  Gi as seriesReadKey,
  ca as severityColor,
  la as severityRank,
  co as severityTone,
  dr as shortLabelOf,
  ji as sourcePickerKey,
  Bs as sqlSourceEntry,
  uo as statusTone,
  mo as timeAgo,
  jn as toolCallOf,
  ra as useCatalog,
  Ii as useDashboardWs,
  Di as useDashboardWsOptional,
  Ki as useDebounced,
  Vi as useFreeze,
  Qi as useFreshness,
  da as useInsight,
  ho as useInsights,
  ye as useKit,
  vi as useKitClient,
  Kn as useKitOptional,
  Ni as useKitTheme,
  ki as useKitWs,
  Ci as useKitZone,
  Eo as useResizable,
  Zi as useSourcePicker,
  Yi as useVizBatchLoader,
  Pi as vizFetchKey,
  zi as vizQueryKey,
  Oi as vizShapeKey,
  As as widgetIdOf
};
