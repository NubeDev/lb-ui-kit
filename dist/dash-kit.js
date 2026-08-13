var It = Object.defineProperty;
var Dt = (e, t, r) => t in e ? It(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var ke = (e, t, r) => Dt(e, typeof t != "symbol" ? t + "" : t, r);
import { jsx as h, jsxs as I } from "react/jsx-runtime";
import * as ot from "react";
import { createContext as Ot, useMemo as me, useContext as nt, useRef as Pt, useState as ve, useEffect as Et } from "react";
import { Calendar as _t, CalendarRange as Gt, ChevronDown as Lt, Check as jt } from "lucide-react";
import { Slot as Ft } from "@radix-ui/react-slot";
import * as Q from "@radix-ui/react-dropdown-menu";
class Me extends Error {
  constructor(r, o) {
    super(`denied: ${r} — ${o}`);
    ke(this, "denied", !0);
    ke(this, "tool");
    this.name = "KitDeniedError", this.tool = r;
  }
}
function go(e) {
  return e instanceof Me;
}
function xo(e) {
  return e instanceof Error && e.message.startsWith("out_of_scope:");
}
function Wt(e) {
  if (typeof e == "function") return e;
  const t = e;
  return (r, o) => t.call(r, o);
}
function _(e, t) {
  if (!e || typeof e != "object") return [];
  const r = e[t];
  return Array.isArray(r) ? r : [];
}
function Vt(e, t = {}) {
  const r = {
    listSeries: () => e("series.list", {}).then((o) => _(o, "series")),
    listExtensions: () => e("ext.list", {}).then((o) => _(o, "extensions")),
    listFlows: () => e("flows.list", {}).then((o) => _(o, "flows")),
    // `flows.get` answers the flow BARE (not enveloped). A flow the caller can list but not read
    // rejects; the picker skips it rather than failing the whole bundle, so map a rejection to null.
    getFlow: (o) => e("flows.get", { id: o }).then((n) => n && typeof n == "object" ? n : null).catch(() => null),
    listFlowNodes: () => e("flows.nodes", {}).then((o) => _(o, "nodes")),
    listDatasources: () => e("datasource.list", {}).then((o) => _(o, "datasources")),
    listRules: () => e("rules.list", {}).then((o) => _(o, "rules")),
    listQueries: () => e("query.list", {}).then((o) => _(o, "queries")),
    // `store.schema` answers the schema BARE. An absent/!object reply is an empty schema, not a throw.
    readSchema: () => e("store.schema", {}).then(
      (o) => o && typeof o == "object" ? o : { tables: [] }
    ),
    listChannels: () => e("channel.list", {}).then((o) => _(o, "channels")),
    listInsights: () => e("insight.list", {}).then((o) => _(o, "items"))
  };
  if (t.inboxChannel) {
    const o = t.inboxChannel;
    r.listInbox = () => e("inbox.list", { channel: o }).then((n) => _(n, "items"));
  }
  return r;
}
function qt(e) {
  return {
    list: (t) => e("insight.list", { ...t }).then((r) => r ?? { items: [] }),
    get: (t) => e("insight.get", { id: t }).then((r) => r ?? null),
    occurrences: (t, r, o) => e("insight.occurrences", {
      insight_id: t,
      cursor: r,
      limit: o ?? 50
    }).then((n) => n ?? { items: [] }),
    ack: () => Promise.reject(
      new Me(
        "insight.ack",
        "the kit is a READ kit; extension bridge writes are not implemented (U-ext-bridge-write)"
      )
    ),
    resolve: () => Promise.reject(
      new Me(
        "insight.resolve",
        "the kit is a READ kit; extension bridge writes are not implemented (U-ext-bridge-write)"
      )
    )
    // No `subscribe`: a live tail needs a stream seam the leashed call does not carry. Omitting it is
    // the interface's documented "no feed" case, so the hooks fall back to act→refresh.
  };
}
function yo(e, t = {}) {
  const r = Wt(e);
  return {
    call: r,
    loaders: Vt(r, t),
    insights: qt(r)
  };
}
const wo = [
  "viz.query",
  "viz.query_batch",
  "series.read",
  "series.latest",
  "series.find"
], ko = [
  "mcp:viz.query:call",
  "mcp:series.read:call",
  "mcp:series.latest:call",
  "mcp:series.find:call"
];
function Yt() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
const ze = Ot(null);
function vo({ client: e, ws: t, theme: r, zone: o, children: n }) {
  const s = me(
    () => ({ client: e, ws: t, theme: r, zone: o ?? Yt }),
    [e, t, r, o]
  );
  return /* @__PURE__ */ h(ze.Provider, { value: s, children: n });
}
function Ut() {
  return nt(ze);
}
function he() {
  const e = nt(ze);
  if (!e)
    throw new Error(
      "useKit: no <KitProvider>. Wrap the page: <KitProvider client={makeKitClient(bridge)} ws={ctx.workspace}>"
    );
  return e;
}
function No() {
  return he().client;
}
function Co() {
  return he().ws;
}
function Mo() {
  return he().theme;
}
function So() {
  return he().zone;
}
const Kt = 864e5;
function X(e, t, r) {
  e -= t <= 2 ? 1 : 0;
  const o = Math.floor((e >= 0 ? e : e - 399) / 400), n = e - o * 400, s = Math.floor((153 * (t + (t > 2 ? -3 : 9)) + 2) / 5) + r - 1, a = n * 365 + Math.floor(n / 4) - Math.floor(n / 100) + s;
  return o * 146097 + a - 719468;
}
function st(e) {
  e += 719468;
  const t = Math.floor((e >= 0 ? e : e - 146096) / 146097), r = e - t * 146097, o = Math.floor(
    (r - Math.floor(r / 1460) + Math.floor(r / 36524) - Math.floor(r / 146096)) / 365
  ), n = o + t * 400, s = r - (365 * o + Math.floor(o / 4) - Math.floor(o / 100)), a = Math.floor((5 * s + 2) / 153), u = s - Math.floor((153 * a + 2) / 5) + 1, m = a + (a < 10 ? 3 : -9);
  return { y: n + (m <= 2 ? 1 : 0), mo: m, d: u };
}
function at(e, t) {
  const r = t === 12 ? { y: e + 1, mo: 1 } : { y: e, mo: t + 1 };
  return X(r.y, r.mo, 1) - X(e, t, 1);
}
function Bt(e, t, r) {
  return (X(e, t, r) % 7 + 3 + 7) % 7;
}
const Fe = /* @__PURE__ */ new Map();
function it(e) {
  let t = Fe.get(e);
  return t || (t = new Intl.DateTimeFormat("en-US", {
    timeZone: e,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }), Fe.set(e, t)), t;
}
function Te(e) {
  if (!e) return "UTC";
  try {
    return it(e), e;
  } catch {
    return "UTC";
  }
}
function J(e, t) {
  const r = it(t).formatToParts(e), o = (n) => {
    var s;
    return Number(((s = r.find((a) => a.type === n)) == null ? void 0 : s.value) ?? 0);
  };
  return { y: o("year"), mo: o("month"), d: o("day"), h: o("hour") % 24, mi: o("minute"), s: o("second") };
}
function lt(e) {
  return X(e.y, e.mo, e.d) * Kt + ((e.h * 60 + e.mi) * 60 + e.s) * 1e3;
}
function We(e, t) {
  return lt(J(e, t)) - e;
}
function P(e, t) {
  const r = lt(e), o = r - We(r, t);
  return r - We(o, t);
}
function Se(e, t) {
  const r = J(e, t), o = (n, s = 2) => String(n).padStart(s, "0");
  return `${o(r.y, 4)}-${o(r.mo)}-${o(r.d)}`;
}
const Ve = {
  s: "s",
  m: "m",
  h: "h",
  d: "d",
  w: "w",
  M: "M",
  y: "y"
}, Zt = {
  second: "s",
  minute: "m",
  hour: "h",
  day: "d",
  week: "w",
  month: "M",
  quarter: "q",
  year: "y"
}, Ht = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  y: "year"
}, Qt = /^now(?:([+-])(\d{1,6})([smhdwMy]))?(?:\/([smhdwMy]))?$/, Xt = /^(\d{4})-(\d{2})-(\d{2})$/, Jt = /^\d{13}$/, er = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?$/, tr = /^(this|last|next)-(hour|day|week|month|quarter|year)$/, rr = /^last-(\d{1,6})-(second|minute|hour|day|week|month|quarter|year)s?$/, or = /^last-(\d{1,6})([smhdwMy])$/, ct = "expected now±<n><unit> (units s m h d w M y, optional /<unit> snap), an ISO day or instant, 13-digit epoch ms, today/yesterday/tomorrow, this-/last-/next-<unit>, or last-<n>-<unit>s";
function le(e) {
  return { ok: !1, error: `unrecognized range expression "${e}" — ${ct}` };
}
function qe(e, t, r) {
  return t >= 1 && t <= 12 && r >= 1 && r <= at(e, t);
}
function fe(e) {
  const t = e.trim();
  if (!t) return { ok: !1, error: `empty range expression — ${ct}` };
  if (t === "today") return H({ kind: "day", offset: 0 });
  if (t === "yesterday") return H({ kind: "day", offset: -1 });
  if (t === "tomorrow") return H({ kind: "day", offset: 1 });
  const r = tr.exec(t);
  if (r)
    return H({ kind: "period", rel: r[1], unit: r[2] });
  const o = rr.exec(t);
  if (o) return H({ kind: "trailing", n: Number(o[1]), unit: Zt[o[2]] });
  const n = or.exec(t);
  if (n) return H({ kind: "trailing", n: Number(n[1]), unit: Ve[n[2]] });
  const s = Qt.exec(t);
  if (s) {
    const [, m, i, b, x] = s;
    return te({
      kind: "now",
      ...m ? { offset: { sign: m === "-" ? -1 : 1, n: Number(i), unit: Ve[b] } } : {},
      ...x ? { snap: Ht[x] } : {}
    });
  }
  const a = Xt.exec(t);
  if (a) {
    const [m, i, b] = [Number(a[1]), Number(a[2]), Number(a[3])];
    return qe(m, i, b) ? te({ kind: "isoDay", y: m, mo: i, d: b }) : le(e);
  }
  if (Jt.test(t)) return te({ kind: "instant", ms: Number(t) });
  const u = er.exec(t);
  if (u) {
    const [, m, i, b, x, k, R, $, g] = u;
    if (!qe(Number(m), Number(i), Number(b)) || Number(x) > 23 || Number(k) > 59) return le(e);
    if (g) {
      const N = Date.parse(t);
      return Number.isFinite(N) ? te({ kind: "instant", ms: N }) : le(e);
    }
    return te({
      kind: "wall",
      y: Number(m),
      mo: Number(i),
      d: Number(b),
      h: Number(x),
      mi: Number(k),
      s: Number(R ?? 0),
      ms: Number(($ ?? "0").padEnd(3, "0"))
    });
  }
  return le(e);
}
function Ao(e) {
  const t = fe(e);
  return t.ok && t.expr.type === "window";
}
function H(e) {
  return { ok: !0, expr: { type: "window", window: e } };
}
function te(e) {
  return { ok: !0, expr: { type: "endpoint", endpoint: e } };
}
const nr = "browser";
function dt() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
function ut(e, ...t) {
  for (const r of t)
    if (r && r !== nr) return r;
  return e();
}
const Ro = "last-30-days";
function zo(e, t, r = dt) {
  return Te(ut(r, e, t));
}
function sr(e, t) {
  const r = e.y * 12 + (e.mo - 1) + t, o = Math.floor(r / 12), n = (r % 12 + 12) % 12 + 1;
  return { ...e, y: o, mo: n, d: Math.min(e.d, at(o, n)) };
}
function q(e, t, r, o) {
  switch (r) {
    case "s":
      return e + t * 1e3;
    case "m":
      return e + t * 6e4;
    case "h":
      return e + t * 36e5;
    case "d":
    case "w": {
      const n = J(e, o), s = r === "w" ? t * 7 : t, a = st(X(n.y, n.mo, n.d) + s);
      return P({ ...n, ...a }, o);
    }
    case "M":
    case "q":
    case "y": {
      const n = r === "M" ? t : r === "q" ? t * 3 : t * 12;
      return P(sr(J(e, o), n), o);
    }
  }
}
function ar(e) {
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
function Ae(e, t, r) {
  if (t === "second") return Math.floor(e / 1e3) * 1e3;
  const o = J(e, r);
  switch (t) {
    case "minute":
      return P({ ...o, s: 0 }, r);
    case "hour":
      return P({ ...o, mi: 0, s: 0 }, r);
    case "day":
      return P({ ...o, h: 0, mi: 0, s: 0 }, r);
    case "week": {
      const n = st(X(o.y, o.mo, o.d) - Bt(o.y, o.mo, o.d));
      return P({ ...o, ...n, h: 0, mi: 0, s: 0 }, r);
    }
    case "month":
      return P({ ...o, d: 1, h: 0, mi: 0, s: 0 }, r);
    case "quarter":
      return P({ ...o, mo: Math.floor((o.mo - 1) / 3) * 3 + 1, d: 1, h: 0, mi: 0, s: 0 }, r);
    case "year":
      return P({ ...o, mo: 1, d: 1, h: 0, mi: 0, s: 0 }, r);
    default:
      return e;
  }
}
function Ye(e, t, r) {
  switch (e.kind) {
    case "now": {
      let o = t;
      return e.offset && (o = q(o, e.offset.sign * e.offset.n, e.offset.unit, r)), e.snap && (o = Ae(o, e.snap, r)), o;
    }
    case "isoDay":
      return P({ y: e.y, mo: e.mo, d: e.d, h: 0, mi: 0, s: 0 }, r);
    case "instant":
      return e.ms;
    case "wall":
      return P({ y: e.y, mo: e.mo, d: e.d, h: e.h, mi: e.mi, s: e.s }, r) + e.ms;
  }
}
function ir(e, t, r) {
  switch (e.kind) {
    case "day": {
      const o = q(Ae(t, "day", r), e.offset, "d", r);
      return { fromMs: o, toMs: q(o, 1, "d", r) };
    }
    case "period": {
      const o = Ae(t, e.unit, r), n = ar(e.unit);
      return e.rel === "this" ? { fromMs: o, toMs: q(o, 1, n, r) } : e.rel === "last" ? { fromMs: q(o, -1, n, r), toMs: o } : { fromMs: q(o, 1, n, r), toMs: q(o, 2, n, r) };
    }
    case "trailing":
      return { fromMs: q(t, -e.n, e.unit, r), toMs: t };
  }
}
function lr(e, t, r, o) {
  if (!e || !e.trim()) return null;
  const n = Te(o), s = fe(e);
  if (!s.ok) return null;
  if (s.expr.type === "window")
    return t && t.trim() ? null : ir(s.expr.window, r, n);
  const a = Ye(s.expr.endpoint, r, n);
  let u = r;
  if (t && t.trim()) {
    const m = fe(t);
    if (!m.ok || m.expr.type !== "endpoint") return null;
    u = Ye(m.expr.endpoint, r, n);
  }
  return a <= u ? { fromMs: a, toMs: u } : null;
}
function To(e, t) {
  const r = Te(t), o = J(e, r), n = Se(e, r);
  if (o.h === 0 && o.mi === 0 && o.s === 0 && e % 1e3 === 0) return n;
  const s = (a) => String(a).padStart(2, "0");
  return `${n} ${s(o.h)}:${s(o.mi)}`;
}
const cr = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  q: "quarter",
  y: "year"
};
function dr(e) {
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function ur(e) {
  switch (e.kind) {
    case "day":
      return e.offset === 0 ? "Today" : e.offset === -1 ? "Yesterday" : "Tomorrow";
    case "period":
      return `${dr(e.rel)} ${e.unit}`;
    case "trailing": {
      const t = cr[e.unit];
      return `Last ${e.n} ${t}${e.n === 1 ? "" : "s"}`;
    }
  }
}
function $e(e, t) {
  const r = fe(e);
  return r.ok && r.expr.type === "window" ? ur(r.expr.window) : t ? `${e} → ${t}` : e === "now" ? "Now" : `${e} → now`;
}
function mr(e, t) {
  const r = /^\d{4}-\d{2}-\d{2}$/;
  if (t && r.test(e) && r.test(t)) {
    const o = (n) => {
      const s = /* @__PURE__ */ new Date(`${n}T00:00:00Z`);
      return Number.isNaN(s.getTime()) ? n : s.toLocaleDateString(void 0, { month: "short", day: "numeric", timeZone: "UTC" });
    };
    return `${o(e)} – ${o(t)}`;
  }
  return $e(e, t);
}
function mt(e) {
  var t, r, o = "";
  if (typeof e == "string" || typeof e == "number") o += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var n = e.length;
    for (t = 0; t < n; t++) e[t] && (r = mt(e[t])) && (o && (o += " "), o += r);
  } else for (r in e) e[r] && (o && (o += " "), o += r);
  return o;
}
function ft() {
  for (var e, t, r = 0, o = "", n = arguments.length; r < n; r++) (e = arguments[r]) && (t = mt(e)) && (o && (o += " "), o += t);
  return o;
}
const Ue = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, Ke = ft, fr = (e, t) => (r) => {
  var o;
  if ((t == null ? void 0 : t.variants) == null) return Ke(e, r == null ? void 0 : r.class, r == null ? void 0 : r.className);
  const { variants: n, defaultVariants: s } = t, a = Object.keys(n).map((i) => {
    const b = r == null ? void 0 : r[i], x = s == null ? void 0 : s[i];
    if (b === null) return null;
    const k = Ue(b) || Ue(x);
    return n[i][k];
  }), u = r && Object.entries(r).reduce((i, b) => {
    let [x, k] = b;
    return k === void 0 || (i[x] = k), i;
  }, {}), m = t == null || (o = t.compoundVariants) === null || o === void 0 ? void 0 : o.reduce((i, b) => {
    let { class: x, className: k, ...R } = b;
    return Object.entries(R).every(($) => {
      let [g, N] = $;
      return Array.isArray(N) ? N.includes({
        ...s,
        ...u
      }[g]) : {
        ...s,
        ...u
      }[g] === N;
    }) ? [
      ...i,
      x,
      k
    ] : i;
  }, []);
  return Ke(e, a, m, r == null ? void 0 : r.class, r == null ? void 0 : r.className);
}, pr = (e, t) => {
  const r = new Array(e.length + t.length);
  for (let o = 0; o < e.length; o++)
    r[o] = e[o];
  for (let o = 0; o < t.length; o++)
    r[e.length + o] = t[o];
  return r;
}, hr = (e, t) => ({
  classGroupId: e,
  validator: t
}), pt = (e = /* @__PURE__ */ new Map(), t = null, r) => ({
  nextPart: e,
  validators: t,
  classGroupId: r
}), pe = "-", Be = [], br = "arbitrary..", gr = (e) => {
  const t = yr(e), {
    conflictingClassGroups: r,
    conflictingClassGroupModifiers: o
  } = e;
  return {
    getClassGroupId: (a) => {
      if (a.startsWith("[") && a.endsWith("]"))
        return xr(a);
      const u = a.split(pe), m = u[0] === "" && u.length > 1 ? 1 : 0;
      return ht(u, m, t);
    },
    getConflictingClassGroupIds: (a, u) => {
      if (u) {
        const m = o[a], i = r[a];
        return m ? i ? pr(i, m) : m : i || Be;
      }
      return r[a] || Be;
    }
  };
}, ht = (e, t, r) => {
  if (e.length - t === 0)
    return r.classGroupId;
  const n = e[t], s = r.nextPart.get(n);
  if (s) {
    const i = ht(e, t + 1, s);
    if (i) return i;
  }
  const a = r.validators;
  if (a === null)
    return;
  const u = t === 0 ? e.join(pe) : e.slice(t).join(pe), m = a.length;
  for (let i = 0; i < m; i++) {
    const b = a[i];
    if (b.validator(u))
      return b.classGroupId;
  }
}, xr = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const t = e.slice(1, -1), r = t.indexOf(":"), o = t.slice(0, r);
  return o ? br + o : void 0;
})(), yr = (e) => {
  const {
    theme: t,
    classGroups: r
  } = e;
  return wr(r, t);
}, wr = (e, t) => {
  const r = pt();
  for (const o in e) {
    const n = e[o];
    Ie(n, r, o, t);
  }
  return r;
}, Ie = (e, t, r, o) => {
  const n = e.length;
  for (let s = 0; s < n; s++) {
    const a = e[s];
    kr(a, t, r, o);
  }
}, kr = (e, t, r, o) => {
  if (typeof e == "string") {
    vr(e, t, r);
    return;
  }
  if (typeof e == "function") {
    Nr(e, t, r, o);
    return;
  }
  Cr(e, t, r, o);
}, vr = (e, t, r) => {
  const o = e === "" ? t : bt(t, e);
  o.classGroupId = r;
}, Nr = (e, t, r, o) => {
  if (Mr(e)) {
    Ie(e(o), t, r, o);
    return;
  }
  t.validators === null && (t.validators = []), t.validators.push(hr(r, e));
}, Cr = (e, t, r, o) => {
  const n = Object.entries(e), s = n.length;
  for (let a = 0; a < s; a++) {
    const [u, m] = n[a];
    Ie(m, bt(t, u), r, o);
  }
}, bt = (e, t) => {
  let r = e;
  const o = t.split(pe), n = o.length;
  for (let s = 0; s < n; s++) {
    const a = o[s];
    let u = r.nextPart.get(a);
    u || (u = pt(), r.nextPart.set(a, u)), r = u;
  }
  return r;
}, Mr = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Sr = (e) => {
  if (e < 1)
    return {
      get: () => {
      },
      set: () => {
      }
    };
  let t = 0, r = /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ Object.create(null);
  const n = (s, a) => {
    r[s] = a, t++, t > e && (t = 0, o = r, r = /* @__PURE__ */ Object.create(null));
  };
  return {
    get(s) {
      let a = r[s];
      if (a !== void 0)
        return a;
      if ((a = o[s]) !== void 0)
        return n(s, a), a;
    },
    set(s, a) {
      s in r ? r[s] = a : n(s, a);
    }
  };
}, Re = "!", Ze = ":", Ar = [], He = (e, t, r, o, n) => ({
  modifiers: e,
  hasImportantModifier: t,
  baseClassName: r,
  maybePostfixModifierPosition: o,
  isExternal: n
}), Rr = (e) => {
  const {
    prefix: t,
    experimentalParseClassName: r
  } = e;
  let o = (n) => {
    const s = [];
    let a = 0, u = 0, m = 0, i;
    const b = n.length;
    for (let g = 0; g < b; g++) {
      const N = n[g];
      if (a === 0 && u === 0) {
        if (N === Ze) {
          s.push(n.slice(m, g)), m = g + 1;
          continue;
        }
        if (N === "/") {
          i = g;
          continue;
        }
      }
      N === "[" ? a++ : N === "]" ? a-- : N === "(" ? u++ : N === ")" && u--;
    }
    const x = s.length === 0 ? n : n.slice(m);
    let k = x, R = !1;
    x.endsWith(Re) ? (k = x.slice(0, -1), R = !0) : (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      x.startsWith(Re) && (k = x.slice(1), R = !0)
    );
    const $ = i && i > m ? i - m : void 0;
    return He(s, R, k, $);
  };
  if (t) {
    const n = t + Ze, s = o;
    o = (a) => a.startsWith(n) ? s(a.slice(n.length)) : He(Ar, !1, a, void 0, !0);
  }
  if (r) {
    const n = o;
    o = (s) => r({
      className: s,
      parseClassName: n
    });
  }
  return o;
}, zr = (e) => {
  const t = /* @__PURE__ */ new Map();
  return e.orderSensitiveModifiers.forEach((r, o) => {
    t.set(r, 1e6 + o);
  }), (r) => {
    const o = [];
    let n = [];
    for (let s = 0; s < r.length; s++) {
      const a = r[s], u = a[0] === "[", m = t.has(a);
      u || m ? (n.length > 0 && (n.sort(), o.push(...n), n = []), o.push(a)) : n.push(a);
    }
    return n.length > 0 && (n.sort(), o.push(...n)), o;
  };
}, Tr = (e) => ({
  cache: Sr(e.cacheSize),
  parseClassName: Rr(e),
  sortModifiers: zr(e),
  postfixLookupClassGroupIds: $r(e),
  ...gr(e)
}), $r = (e) => {
  const t = /* @__PURE__ */ Object.create(null), r = e.postfixLookupClassGroups;
  if (r)
    for (let o = 0; o < r.length; o++)
      t[r[o]] = !0;
  return t;
}, Ir = /\s+/, Dr = (e, t) => {
  const {
    parseClassName: r,
    getClassGroupId: o,
    getConflictingClassGroupIds: n,
    sortModifiers: s,
    postfixLookupClassGroupIds: a
  } = t, u = [], m = e.trim().split(Ir);
  let i = "";
  for (let b = m.length - 1; b >= 0; b -= 1) {
    const x = m[b], {
      isExternal: k,
      modifiers: R,
      hasImportantModifier: $,
      baseClassName: g,
      maybePostfixModifierPosition: N
    } = r(x);
    if (k) {
      i = x + (i.length > 0 ? " " + i : i);
      continue;
    }
    let E = !!N, v;
    if (E) {
      const C = g.substring(0, N);
      v = o(C);
      const d = v && a[v] ? o(g) : void 0;
      d && d !== v && (v = d, E = !1);
    } else
      v = o(g);
    if (!v) {
      if (!E) {
        i = x + (i.length > 0 ? " " + i : i);
        continue;
      }
      if (v = o(g), !v) {
        i = x + (i.length > 0 ? " " + i : i);
        continue;
      }
      E = !1;
    }
    const L = R.length === 0 ? "" : R.length === 1 ? R[0] : s(R).join(":"), j = $ ? L + Re : L, F = j + v;
    if (u.indexOf(F) > -1)
      continue;
    u.push(F);
    const w = n(v, E);
    for (let C = 0; C < w.length; ++C) {
      const d = w[C];
      u.push(j + d);
    }
    i = x + (i.length > 0 ? " " + i : i);
  }
  return i;
}, Or = (...e) => {
  let t = 0, r, o, n = "";
  for (; t < e.length; )
    (r = e[t++]) && (o = gt(r)) && (n && (n += " "), n += o);
  return n;
}, gt = (e) => {
  if (typeof e == "string")
    return e;
  let t, r = "";
  for (let o = 0; o < e.length; o++)
    e[o] && (t = gt(e[o])) && (r && (r += " "), r += t);
  return r;
}, Pr = (e, ...t) => {
  let r, o, n, s;
  const a = (m) => {
    const i = t.reduce((b, x) => x(b), e());
    return r = Tr(i), o = r.cache.get, n = r.cache.set, s = u, u(m);
  }, u = (m) => {
    const i = o(m);
    if (i)
      return i;
    const b = Dr(m, r);
    return n(m, b), b;
  };
  return s = a, (...m) => s(Or(...m));
}, Er = [], M = (e) => {
  const t = (r) => r[e] || Er;
  return t.isThemeGetter = !0, t;
}, xt = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, yt = /^\((?:(\w[\w-]*):)?(.+)\)$/i, _r = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, Gr = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Lr = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, jr = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, Fr = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Wr = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, V = (e) => _r.test(e), p = (e) => !!e && !Number.isNaN(Number(e)), G = (e) => !!e && Number.isInteger(Number(e)), Ne = (e) => e.endsWith("%") && p(e.slice(0, -1)), W = (e) => Gr.test(e), wt = () => !0, Vr = (e) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  Lr.test(e) && !jr.test(e)
), De = () => !1, qr = (e) => Fr.test(e), Yr = (e) => Wr.test(e), Ur = (e) => !l(e) && !c(e), Kr = (e) => e.startsWith("@container") && (e[10] === "/" && e[11] !== void 0 || e[11] === "s" && e[16] !== void 0 && e.startsWith("-size/", 10) || e[11] === "n" && e[18] !== void 0 && e.startsWith("-normal/", 10)), Br = (e) => Y(e, Nt, De), l = (e) => xt.test(e), K = (e) => Y(e, Ct, Vr), Qe = (e) => Y(e, ro, p), Zr = (e) => Y(e, St, wt), Hr = (e) => Y(e, Mt, De), Xe = (e) => Y(e, kt, De), Qr = (e) => Y(e, vt, Yr), ce = (e) => Y(e, At, qr), c = (e) => yt.test(e), re = (e) => B(e, Ct), Xr = (e) => B(e, Mt), Je = (e) => B(e, kt), Jr = (e) => B(e, Nt), eo = (e) => B(e, vt), de = (e) => B(e, At, !0), to = (e) => B(e, St, !0), Y = (e, t, r) => {
  const o = xt.exec(e);
  return o ? o[1] ? t(o[1]) : r(o[2]) : !1;
}, B = (e, t, r = !1) => {
  const o = yt.exec(e);
  return o ? o[1] ? t(o[1]) : r : !1;
}, kt = (e) => e === "position" || e === "percentage", vt = (e) => e === "image" || e === "url", Nt = (e) => e === "length" || e === "size" || e === "bg-size", Ct = (e) => e === "length", ro = (e) => e === "number", Mt = (e) => e === "family-name", St = (e) => e === "number" || e === "weight", At = (e) => e === "shadow", oo = () => {
  const e = M("color"), t = M("font"), r = M("text"), o = M("font-weight"), n = M("tracking"), s = M("leading"), a = M("breakpoint"), u = M("container"), m = M("spacing"), i = M("radius"), b = M("shadow"), x = M("inset-shadow"), k = M("text-shadow"), R = M("drop-shadow"), $ = M("blur"), g = M("perspective"), N = M("aspect"), E = M("ease"), v = M("animate"), L = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], j = () => [
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
  ], F = () => [...j(), c, l], w = () => ["auto", "hidden", "clip", "visible", "scroll"], C = () => ["auto", "contain", "none"], d = () => [c, l, m], S = () => [V, "full", "auto", ...d()], ee = () => [G, "none", "subgrid", c, l], Oe = () => ["auto", {
    span: ["full", G, c, l]
  }, G, c, l], oe = () => [G, "auto", c, l], Pe = () => ["auto", "min", "max", "fr", c, l], be = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"], Z = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"], O = () => ["auto", ...d()], U = () => [V, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...d()], ge = () => [V, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...d()], xe = () => [V, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...d()], f = () => [e, c, l], Ee = () => [...j(), Je, Xe, {
    position: [c, l]
  }], _e = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }], Ge = () => ["auto", "cover", "contain", Jr, Br, {
    size: [c, l]
  }], ye = () => [Ne, re, K], z = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    i,
    c,
    l
  ], T = () => ["", p, re, K], ne = () => ["solid", "dashed", "dotted", "double"], Le = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], A = () => [p, Ne, Je, Xe], je = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    $,
    c,
    l
  ], se = () => ["none", p, c, l], ae = () => ["none", p, c, l], we = () => [p, c, l], ie = () => [V, "full", ...d()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [W],
      breakpoint: [W],
      color: [wt],
      container: [W],
      "drop-shadow": [W],
      ease: ["in", "out", "in-out"],
      font: [Ur],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [W],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [W],
      shadow: [W],
      spacing: ["px", p],
      text: [W],
      "text-shadow": [W],
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
        aspect: ["auto", "square", V, l, c, N]
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
        "@container": ["", "normal", "size", c, l]
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
        columns: [p, l, c, u]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": L()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": L()
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
        object: F()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: w()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": w()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": w()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: C()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": C()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": C()
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
        inset: S()
      }],
      /**
       * Inset Inline
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": S()
      }],
      /**
       * Inset Block
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": S()
      }],
      /**
       * Inset Inline Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-s` in next major release
       */
      start: [{
        "inset-s": S(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        start: S()
      }],
      /**
       * Inset Inline End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-e` in next major release
       */
      end: [{
        "inset-e": S(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        end: S()
      }],
      /**
       * Inset Block Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-bs": [{
        "inset-bs": S()
      }],
      /**
       * Inset Block End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-be": [{
        "inset-be": S()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: S()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: S()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: S()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: S()
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
        z: [G, "auto", c, l]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [V, "full", "auto", u, ...d()]
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
        flex: [p, V, "auto", "initial", "none", l]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", p, c, l]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", p, c, l]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [G, "first", "last", "none", c, l]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": ee()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: Oe()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": oe()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": oe()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": ee()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: Oe()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": oe()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": oe()
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
        "auto-cols": Pe()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": Pe()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: d()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": d()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": d()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...be(), "normal"]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": [...Z(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...Z()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...be()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: [...Z(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...Z(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": be()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": [...Z(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...Z()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: d()
      }],
      /**
       * Padding Inline
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: d()
      }],
      /**
       * Padding Block
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: d()
      }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: d()
      }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: d()
      }],
      /**
       * Padding Block Start
       * @see https://tailwindcss.com/docs/padding
       */
      pbs: [{
        pbs: d()
      }],
      /**
       * Padding Block End
       * @see https://tailwindcss.com/docs/padding
       */
      pbe: [{
        pbe: d()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: d()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: d()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: d()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: d()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: O()
      }],
      /**
       * Margin Inline
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: O()
      }],
      /**
       * Margin Block
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: O()
      }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: O()
      }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: O()
      }],
      /**
       * Margin Block Start
       * @see https://tailwindcss.com/docs/margin
       */
      mbs: [{
        mbs: O()
      }],
      /**
       * Margin Block End
       * @see https://tailwindcss.com/docs/margin
       */
      mbe: [{
        mbe: O()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: O()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: O()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: O()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: O()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": d()
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
        "space-y": d()
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
        size: U()
      }],
      /**
       * Inline Size
       * @see https://tailwindcss.com/docs/width
       */
      "inline-size": [{
        inline: ["auto", ...ge()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...ge()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...ge()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...xe()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...xe()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...xe()]
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [u, "screen", ...U()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [
          u,
          "screen",
          /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "none",
          ...U()
        ]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [
          u,
          "screen",
          "none",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "prose",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          {
            screen: [a]
          },
          ...U()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...U()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...U()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...U()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", r, re, K]
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
        font: [o, to, Zr]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", Ne, l]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [Xr, Hr, t]
      }],
      /**
       * Font Feature Settings
       * @see https://tailwindcss.com/docs/font-feature-settings
       */
      "font-features": [{
        "font-features": [l]
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
        tracking: [n, c, l]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [p, "none", c, Qe]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          s,
          ...d()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", c, l]
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
        list: ["disc", "decimal", "none", c, l]
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
        placeholder: f()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: f()
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
        decoration: [...ne(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [p, "from-font", "auto", c, K]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: f()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": [p, "auto", c, l]
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
        indent: d()
      }],
      /**
       * Tab Size
       * @see https://tailwindcss.com/docs/tab-size
       */
      "tab-size": [{
        tab: [G, c, l]
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", c, l]
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
        content: ["none", c, l]
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
        bg: Ee()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: _e()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: Ge()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, G, c, l],
          radial: ["", c, l],
          conic: [G, c, l]
        }, eo, Qr]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: f()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: ye()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: ye()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: ye()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: f()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: f()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: f()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: z()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": z()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": z()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": z()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": z()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": z()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": z()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": z()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": z()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": z()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": z()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": z()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": z()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": z()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": z()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: T()
      }],
      /**
       * Border Width Inline
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": T()
      }],
      /**
       * Border Width Block
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": T()
      }],
      /**
       * Border Width Inline Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": T()
      }],
      /**
       * Border Width Inline End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": T()
      }],
      /**
       * Border Width Block Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-bs": [{
        "border-bs": T()
      }],
      /**
       * Border Width Block End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-be": [{
        "border-be": T()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": T()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": T()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": T()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": T()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": T()
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
        "divide-y": T()
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
        border: [...ne(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...ne(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: f()
      }],
      /**
       * Border Color Inline
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": f()
      }],
      /**
       * Border Color Block
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": f()
      }],
      /**
       * Border Color Inline Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": f()
      }],
      /**
       * Border Color Inline End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": f()
      }],
      /**
       * Border Color Block Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-bs": [{
        "border-bs": f()
      }],
      /**
       * Border Color Block End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-be": [{
        "border-be": f()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": f()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": f()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": f()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": f()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: f()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [...ne(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [p, c, l]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", p, re, K]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: f()
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
          b,
          de,
          ce
        ]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      "shadow-color": [{
        shadow: f()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", x, de, ce]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": f()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      "ring-w": [{
        ring: T()
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
        ring: f()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-w": [{
        "ring-offset": [p, K]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-color": [{
        "ring-offset": f()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      "inset-ring-w": [{
        "inset-ring": T()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      "inset-ring-color": [{
        "inset-ring": f()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", k, de, ce]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": f()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [p, c, l]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...Le(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": Le()
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
        "mask-linear": [p]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": A()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": A()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": f()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": f()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": A()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": A()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": f()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": f()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": A()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": A()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": f()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": f()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": A()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": A()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": f()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": f()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": A()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": A()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": f()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": f()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": A()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": A()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": f()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": f()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": A()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": A()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": f()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": f()
      }],
      "mask-image-radial": [{
        "mask-radial": [c, l]
      }],
      "mask-image-radial-from-pos": [{
        "mask-radial-from": A()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": A()
      }],
      "mask-image-radial-from-color": [{
        "mask-radial-from": f()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": f()
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
        "mask-radial-at": j()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [p]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": A()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": A()
      }],
      "mask-image-conic-from-color": [{
        "mask-conic-from": f()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": f()
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
        mask: Ee()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: _e()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: Ge()
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
        mask: ["none", c, l]
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
          c,
          l
        ]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: je()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [p, c, l]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [p, c, l]
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
          R,
          de,
          ce
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": f()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ["", p, c, l]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [p, c, l]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", p, c, l]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [p, c, l]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", p, c, l]
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
          c,
          l
        ]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": je()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [p, c, l]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [p, c, l]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", p, c, l]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [p, c, l]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", p, c, l]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [p, c, l]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [p, c, l]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", p, c, l]
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
        "border-spacing": d()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": d()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": d()
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
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", c, l]
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
        duration: [p, "initial", c, l]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", E, c, l]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [p, c, l]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", v, c, l]
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
        perspective: [g, c, l]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      "perspective-origin": [{
        "perspective-origin": F()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: se()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": se()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": se()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": se()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: ae()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": ae()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": ae()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": ae()
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
        skew: we()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": we()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": we()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [c, l, "", "none", "gpu", "cpu"]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: F()
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
        translate: ie()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": ie()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": ie()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": ie()
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
        zoom: [G, c, l]
      }],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: f()
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
        caret: f()
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
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", c, l]
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
        "scrollbar-thumb": f()
      }],
      /**
       * Scrollbar Track Color
       * @see https://tailwindcss.com/docs/scrollbar-color
       */
      "scrollbar-track-color": [{
        "scrollbar-track": f()
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
        "scroll-m": d()
      }],
      /**
       * Scroll Margin Inline
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": d()
      }],
      /**
       * Scroll Margin Block
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": d()
      }],
      /**
       * Scroll Margin Inline Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": d()
      }],
      /**
       * Scroll Margin Inline End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": d()
      }],
      /**
       * Scroll Margin Block Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbs": [{
        "scroll-mbs": d()
      }],
      /**
       * Scroll Margin Block End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbe": [{
        "scroll-mbe": d()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": d()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": d()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": d()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": d()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": d()
      }],
      /**
       * Scroll Padding Inline
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": d()
      }],
      /**
       * Scroll Padding Block
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": d()
      }],
      /**
       * Scroll Padding Inline Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": d()
      }],
      /**
       * Scroll Padding Inline End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": d()
      }],
      /**
       * Scroll Padding Block Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbs": [{
        "scroll-pbs": d()
      }],
      /**
       * Scroll Padding Block End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbe": [{
        "scroll-pbe": d()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": d()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": d()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": d()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": d()
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
        "will-change": ["auto", "scroll", "contents", "transform", c, l]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ["none", ...f()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [p, re, K, Qe]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...f()]
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
}, no = /* @__PURE__ */ Pr(oo);
function D(...e) {
  return no(ft(e));
}
const so = fr(
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
), ue = ot.forwardRef(function({ className: t, variant: r, size: o, asChild: n = !1, ...s }, a) {
  return /* @__PURE__ */ h(n ? Ft : "button", { ref: a, className: D(so({ variant: r, size: o, className: t })), ...s });
});
function ao({ ...e }) {
  return /* @__PURE__ */ h(Q.Root, { "data-slot": "dropdown-menu", ...e });
}
function io({ ...e }) {
  return /* @__PURE__ */ h(Q.Trigger, { "data-slot": "dropdown-menu-trigger", ...e });
}
function lo({
  className: e,
  sideOffset: t = 4,
  ...r
}) {
  return /* @__PURE__ */ h(Q.Portal, { children: /* @__PURE__ */ h(
    Q.Content,
    {
      "data-slot": "dropdown-menu-content",
      sideOffset: t,
      className: D(
        "bg-panel text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border border-border p-1 shadow-md",
        e
      ),
      ...r
    }
  ) });
}
function co({
  className: e,
  inset: t,
  ...r
}) {
  return /* @__PURE__ */ h(
    Q.Label,
    {
      "data-slot": "dropdown-menu-label",
      "data-inset": t,
      className: D("px-2 py-1.5 text-xs text-muted data-[inset]:pl-8", e),
      ...r
    }
  );
}
function et({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ h(
    Q.Separator,
    {
      "data-slot": "dropdown-menu-separator",
      className: D("bg-border -mx-1 my-1 h-px", e),
      ...t
    }
  );
}
const Rt = ot.forwardRef(
  ({ className: e, type: t, ...r }, o) => /* @__PURE__ */ h(
    "input",
    {
      ref: o,
      type: t,
      "data-slot": "input",
      className: D(
        "flex h-9 w-full min-w-0 rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg shadow-sm shadow-black/0 transition-colors placeholder:text-muted/60 selection:bg-accent/20 selection:text-fg focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60",
        e
      ),
      ...r
    }
  )
);
Rt.displayName = "Input";
const zt = { eu: "/", iso: "-", usa: "/" };
function uo(e) {
  const t = zt[e];
  return e === "usa" ? `MM${t}DD${t}YYYY` : e === "iso" ? `YYYY${t}MM${t}DD` : `DD${t}MM${t}YYYY`;
}
function tt(e, t) {
  const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e ?? "");
  if (!r) return "";
  const [, o, n, s] = r, a = zt[t];
  return t === "usa" ? `${n}${a}${s}${a}${o}` : t === "iso" ? `${o}${a}${n}${a}${s}` : `${s}${a}${n}${a}${o}`;
}
function $o(e, t) {
  const r = (e ?? "").split(/[/\-.]/).map((u) => u.trim());
  if (r.length !== 3 || r.some((u) => !/^\d+$/.test(u))) return "";
  let o, n, s;
  if (t === "usa" ? [n, s, o] = r : t === "iso" ? [o, n, s] = r : [s, n, o] = r, o.length !== 4) return "";
  const a = `${o}-${n.padStart(2, "0")}-${s.padStart(2, "0")}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(a) ? a : "";
}
function rt({ value: e, onChange: t, dateStyle: r, className: o, ...n }) {
  const s = Pt(null), a = r ?? "eu", u = tt(e, a) || uo(a), m = !tt(e, a);
  return /* @__PURE__ */ I(
    "div",
    {
      className: D(
        "dash-kit relative inline-flex h-8 items-center rounded-md border border-border bg-bg text-xs shadow-sm transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20",
        o
      ),
      children: [
        /* @__PURE__ */ h(
          "span",
          {
            "aria-hidden": !0,
            className: D("pointer-events-none px-2.5 pr-7", m && "text-muted/60"),
            children: u
          }
        ),
        /* @__PURE__ */ h(_t, { "aria-hidden": !0, size: 13, className: "pointer-events-none absolute right-2 text-muted" }),
        /* @__PURE__ */ h(
          "input",
          {
            ...n,
            ref: s,
            type: "date",
            value: e,
            onChange: (i) => t(i.target.value),
            onClick: () => {
              var i;
              try {
                (i = s.current) == null || i.showPicker();
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
const Tt = ["Minutes", "Hours", "Days", "Months", "Years"], y = (e, t) => ({ id: e, label: $e(t), expr: t }), $t = [
  {
    id: "trailing",
    label: "Trailing",
    hint: "ends now",
    cells: {
      Minutes: [
        y("last-5m", "last-5-minutes"),
        y("last-15m", "last-15-minutes"),
        y("last-30m", "last-30-minutes"),
        y("last-60m", "last-60-minutes")
      ],
      Hours: [
        y("last-3h", "last-3-hours"),
        y("last-6h", "last-6-hours"),
        y("last-12h", "last-12-hours"),
        y("last-24h", "last-24-hours")
      ],
      Days: [
        y("last-7d", "last-7-days"),
        y("last-14d", "last-14-days"),
        y("last-30d", "last-30-days"),
        // Kept alongside `last-3-months` on purpose: 90 fixed days is what people type, 3 calendar
        // months is what a report schedule wants. Different columns, so the difference is visible.
        y("last-90d", "last-90-days")
      ],
      Months: [
        y("last-2mo", "last-2-months"),
        y("last-3mo", "last-3-months"),
        y("last-6mo", "last-6-months"),
        y("last-12mo", "last-12-months")
      ],
      // No `last-1-year`: it resolves IDENTICALLY to `last-12-months` one column left, and two
      // adjacent buttons for one window is a question the reader has to stop and answer. Nothing at
      // 5y either — series retention has GC'd it, so the click returns an empty chart, not an error.
      Years: [y("last-2y", "last-2-years"), y("last-3y", "last-3-years")]
    }
  },
  {
    id: "calendar",
    label: "Calendar",
    hint: "whole period",
    cells: {
      // No "this minute" — nobody reaches for it, and an empty cell is information, not a gap.
      Minutes: [],
      Hours: [y("this-hour", "this-hour"), y("last-hour", "last-hour")],
      Days: [
        y("today", "today"),
        y("yesterday", "yesterday"),
        y("this-week", "this-week"),
        y("last-week", "last-week")
      ],
      Months: [
        y("this-month", "this-month"),
        y("last-month", "last-month"),
        y("this-quarter", "this-quarter"),
        y("last-quarter", "last-quarter")
      ],
      Years: [y("this-year", "this-year"), y("last-year", "last-year")]
    }
  }
], Io = $t.flatMap(
  (e) => Tt.flatMap((t) => e.cells[t])
), Ce = /^\d{4}-\d{2}-\d{2}$/;
function Do({
  from: e,
  to: t,
  onApply: r,
  timezone: o,
  compact: n,
  dateStyle: s,
  onUserApply: a
}) {
  const [u, m] = ve(!1), i = Ut(), b = ut((i == null ? void 0 : i.zone) ?? dt, o), x = Ce.test(e) && t ? "" : e, [k, R] = ve(x), $ = me(
    () => Ce.test(e) && t && Ce.test(t) ? { from: e, to: t } : { from: "", to: "" },
    [e, t]
  ), [g, N] = ve($);
  Et(() => {
    R(x), N($);
  }, [e, t]);
  const E = me(() => Date.now(), [u]), v = me(() => {
    const w = k.trim();
    if (!w) return null;
    const C = lr(w, void 0, E, b);
    return C ? { text: `${w} → ${Se(C.fromMs, b)} → ${Se(C.toMs, b)}` } : { error: "Not a range expression — try last-3-months, this-month, now-4h." };
  }, [k, E, b]), L = (w) => {
    a == null || a(), r(w), m(!1);
  }, j = g.from !== e || g.to !== t, F = !!g.from && !!g.to && g.from > g.to;
  return /* @__PURE__ */ I(ao, { open: u, onOpenChange: m, children: [
    /* @__PURE__ */ h(io, { asChild: !0, children: /* @__PURE__ */ I(
      ue,
      {
        variant: "outline",
        size: "sm",
        className: D("dash-kit gap-1.5 px-2.5 text-xs font-normal", n ? "h-11 md:h-8" : "h-8"),
        title: "Change the dashboard time range",
        children: [
          /* @__PURE__ */ h(Gt, { size: 13, className: "text-muted" }),
          /* @__PURE__ */ h("span", { className: "max-w-[13rem] truncate", children: n ? mr(e, t) : $e(e, t) }),
          /* @__PURE__ */ h(Lt, { size: 13, className: "text-muted" })
        ]
      }
    ) }),
    /* @__PURE__ */ I(
      lo,
      {
        align: "end",
        className: D(
          "dash-kit max-w-[calc(100vw-2rem)] p-0",
          n ? "w-[calc(100vw-2rem)]" : "w-[42rem]"
        ),
        children: [
          /* @__PURE__ */ h(co, { className: "px-3 pt-2.5 text-[0.7rem] uppercase tracking-wide text-muted", children: "Quick ranges" }),
          /* @__PURE__ */ h("div", { className: "px-1.5 pb-2", children: $t.map((w) => /* @__PURE__ */ I("div", { className: "mb-1 last:mb-0", children: [
            /* @__PURE__ */ I("div", { className: "flex items-baseline gap-1.5 px-1 pb-0.5 pt-1", children: [
              /* @__PURE__ */ h("span", { className: "text-[0.7rem] font-medium uppercase tracking-wide text-muted", children: w.label }),
              /* @__PURE__ */ h("span", { className: "text-[0.65rem] text-muted", children: w.hint })
            ] }),
            /* @__PURE__ */ h("div", { className: D("grid gap-x-1 gap-y-0.5", n ? "grid-cols-2" : "grid-cols-5"), children: Tt.map((C) => {
              const d = w.cells[C];
              return n && d.length === 0 ? null : /* @__PURE__ */ I("div", { className: "min-w-0", children: [
                !n && /* @__PURE__ */ h("div", { className: "px-2 pb-0.5 text-[0.65rem] uppercase tracking-wide text-muted/70", children: C }),
                d.map((S) => {
                  const ee = !t && S.expr === e;
                  return /* @__PURE__ */ I(
                    ue,
                    {
                      variant: "ghost",
                      size: "sm",
                      className: D(
                        "w-full justify-start gap-1.5 px-2 text-xs font-normal",
                        n ? "h-10" : "h-8",
                        ee && "bg-muted-bg font-medium text-fg"
                      ),
                      onClick: () => L({ from: S.expr }),
                      children: [
                        /* @__PURE__ */ h(
                          jt,
                          {
                            size: 12,
                            className: D("shrink-0 text-accent", !ee && "invisible")
                          }
                        ),
                        /* @__PURE__ */ h("span", { className: "truncate", children: S.label })
                      ]
                    },
                    S.id
                  );
                })
              ] }, C);
            }) })
          ] }, w.id)) }),
          /* @__PURE__ */ h(et, { className: "my-0" }),
          /* @__PURE__ */ I("div", { className: "space-y-1.5 px-3 py-2.5", children: [
            /* @__PURE__ */ h("div", { className: "text-[0.7rem] uppercase tracking-wide text-muted", children: "Relative range" }),
            /* @__PURE__ */ I(
              "form",
              {
                className: "flex items-center gap-1.5",
                onSubmit: (w) => {
                  w.preventDefault(), k.trim() && v && !("error" in v) && L({ from: k.trim() });
                },
                children: [
                  /* @__PURE__ */ h(
                    Rt,
                    {
                      "aria-label": "dashboard relative range",
                      className: "h-8 flex-1 text-xs",
                      placeholder: "last-3-months, this-quarter, now-4h…",
                      value: k,
                      onChange: (w) => R(w.target.value)
                    }
                  ),
                  /* @__PURE__ */ h(
                    ue,
                    {
                      type: "submit",
                      size: "sm",
                      className: "h-8 text-xs",
                      disabled: !k.trim() || !v || "error" in v,
                      title: "Apply this relative range — re-queries every panel",
                      children: "Apply"
                    }
                  )
                ]
              }
            ),
            v && ("error" in v ? /* @__PURE__ */ h("p", { className: "text-[0.7rem] text-danger", children: v.error }) : /* @__PURE__ */ h("p", { className: "truncate text-[0.7rem] text-muted", title: v.text, children: v.text }))
          ] }),
          /* @__PURE__ */ h(et, { className: "my-0" }),
          /* @__PURE__ */ I("div", { className: "space-y-2 px-3 py-2.5", children: [
            /* @__PURE__ */ h("div", { className: "text-[0.7rem] uppercase tracking-wide text-muted", children: "Absolute range" }),
            /* @__PURE__ */ I("div", { className: "flex items-center gap-1.5 text-xs text-muted", children: [
              /* @__PURE__ */ h(
                rt,
                {
                  "aria-label": "dashboard range from",
                  dateStyle: s,
                  className: "flex-1",
                  value: g.from,
                  onChange: (w) => N((C) => ({ ...C, from: w }))
                }
              ),
              /* @__PURE__ */ h("span", { children: "to" }),
              /* @__PURE__ */ h(
                rt,
                {
                  "aria-label": "dashboard range to",
                  dateStyle: s,
                  className: "flex-1",
                  value: g.to ?? "",
                  onChange: (w) => N((C) => ({ ...C, to: w }))
                }
              )
            ] }),
            F ? /* @__PURE__ */ h("p", { className: "text-[0.7rem] text-danger", children: "The start date must not be after the end date." }) : /* @__PURE__ */ h("p", { className: "text-[0.7rem] text-muted", children: "The end date is exclusive — it ends at the start of that day." }),
            /* @__PURE__ */ h(
              ue,
              {
                size: "sm",
                className: "h-8 w-full text-xs",
                disabled: !j || F || !g.from || !g.to,
                title: j ? "Apply this range — re-queries every panel" : "This range is already applied",
                onClick: () => L({ from: g.from, to: g.to }),
                children: "Apply range"
              }
            )
          ] })
        ]
      }
    )
  ] });
}
export {
  nr as BROWSER_TZ,
  ko as DASH_KIT_READ_CAPS,
  wo as DASH_KIT_READ_SCOPE,
  Ro as DEFAULT_RANGE_EXPR,
  Do as DashboardRangePicker,
  Me as KitDeniedError,
  vo as KitProvider,
  rt as PrefDateInput,
  $t as RANGE_BANDS,
  Tt as RANGE_COLUMNS,
  Io as RANGE_PRESETS,
  Yt as browserZone,
  uo as datePlaceholder,
  tt as formatDateField,
  go as isKitDenied,
  xo as isOutOfScope,
  Ao as isWindowExpr,
  Se as isoDayOf,
  $e as labelOf,
  qt as makeInsightsClient,
  yo as makeKitClient,
  Vt as makeSourceLoaders,
  Te as normalizeTz,
  $o as parseDateField,
  fe as parseRangeExpr,
  ut as preferredZone,
  To as previewBound,
  zo as rangeTimezone,
  lr as resolveRange,
  mr as shortLabelOf,
  Wt as toolCallOf,
  he as useKit,
  No as useKitClient,
  Ut as useKitOptional,
  Mo as useKitTheme,
  Co as useKitWs,
  So as useKitZone
};
