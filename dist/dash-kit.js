var $n = Object.defineProperty;
var En = (e, t, n) => t in e ? $n(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Fe = (e, t, n) => En(e, typeof t != "symbol" ? t + "" : t, n);
import { jsx as i, jsxs as b, Fragment as Rn } from "react/jsx-runtime";
import * as z from "react";
import { createContext as ve, useMemo as me, useContext as ae, useRef as J, useState as M, useEffect as ee, useCallback as F } from "react";
import { Calendar as _n, CalendarRange as Mn, ChevronDown as Tn, Check as Pt, ChevronRight as Ot, Table2 as In, Inbox as Dn, Lightbulb as Ue, Hash as zn, LineChart as An, Database as Pn, X as Lt, RefreshCw as Me, CheckCheck as ht, PanelLeftIcon as On } from "lucide-react";
import { Slot as Xe } from "@radix-ui/react-slot";
import * as he from "@radix-ui/react-dropdown-menu";
import { QueryClient as Ln, QueryClientProvider as Gn } from "@tanstack/react-query";
import { persistQueryClientRestore as jn, persistQueryClientSave as Fn } from "@tanstack/react-query-persist-client";
import * as fe from "@radix-ui/react-collapsible";
import * as j from "@radix-ui/react-dialog";
import * as xe from "@radix-ui/react-tooltip";
class Qe extends Error {
  constructor(n, r) {
    super(`denied: ${n} — ${r}`);
    Fe(this, "denied", !0);
    Fe(this, "tool");
    this.name = "KitDeniedError", this.tool = n;
  }
}
function bi(e) {
  return e instanceof Qe;
}
function gi(e) {
  return e instanceof Error && e.message.startsWith("out_of_scope:");
}
function Wn(e) {
  if (typeof e == "function") return e;
  const t = e;
  return (n, r) => t.call(n, r);
}
function U(e, t) {
  if (!e || typeof e != "object") return [];
  const n = e[t];
  return Array.isArray(n) ? n : [];
}
function Kn(e, t = {}) {
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
function qn(e) {
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
function wi(e, t = {}) {
  const n = Wn(e);
  return {
    call: n,
    loaders: Kn(n, t),
    insights: qn(n)
  };
}
const xi = [
  "viz.query",
  "viz.query_batch",
  "series.read",
  "series.latest",
  "series.find"
], yi = [
  "mcp:viz.query:call",
  "mcp:series.read:call",
  "mcp:series.latest:call",
  "mcp:series.find:call"
];
function Bn() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
const Je = ve(null);
function vi({ client: e, ws: t, theme: n, zone: r, children: s }) {
  const o = me(
    () => ({ client: e, ws: t, theme: n, zone: r ?? Bn }),
    [e, t, n, r]
  );
  return /* @__PURE__ */ i(Je.Provider, { value: o, children: s });
}
function Gt() {
  return ae(Je);
}
function De() {
  const e = ae(Je);
  if (!e)
    throw new Error(
      "useKit: no <KitProvider>. Wrap the page: <KitProvider client={makeKitClient(bridge)} ws={ctx.workspace}>"
    );
  return e;
}
function ki() {
  return De().client;
}
function Ni() {
  return De().ws;
}
function Ci() {
  return De().theme;
}
function Si() {
  return De().zone;
}
const Vn = 864e5;
function pe(e, t, n) {
  e -= t <= 2 ? 1 : 0;
  const r = Math.floor((e >= 0 ? e : e - 399) / 400), s = e - r * 400, o = Math.floor((153 * (t + (t > 2 ? -3 : 9)) + 2) / 5) + n - 1, a = s * 365 + Math.floor(s / 4) - Math.floor(s / 100) + o;
  return r * 146097 + a - 719468;
}
function jt(e) {
  e += 719468;
  const t = Math.floor((e >= 0 ? e : e - 146096) / 146097), n = e - t * 146097, r = Math.floor(
    (n - Math.floor(n / 1460) + Math.floor(n / 36524) - Math.floor(n / 146096)) / 365
  ), s = r + t * 400, o = n - (365 * r + Math.floor(r / 4) - Math.floor(r / 100)), a = Math.floor((5 * o + 2) / 153), l = o - Math.floor((153 * a + 2) / 5) + 1, d = a + (a < 10 ? 3 : -9);
  return { y: s + (d <= 2 ? 1 : 0), mo: d, d: l };
}
function Ft(e, t) {
  const n = t === 12 ? { y: e + 1, mo: 1 } : { y: e, mo: t + 1 };
  return pe(n.y, n.mo, 1) - pe(e, t, 1);
}
function Un(e, t, n, r) {
  return (pe(e, t, n) % 7 + (r === "sunday" ? 4 : 3) + 7) % 7;
}
const pt = /* @__PURE__ */ new Map();
function Wt(e) {
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
    return Wt(e), e;
  } catch {
    return "UTC";
  }
}
function be(e, t) {
  const n = Wt(t).formatToParts(e), r = (s) => {
    var o;
    return Number(((o = n.find((a) => a.type === s)) == null ? void 0 : o.value) ?? 0);
  };
  return { y: r("year"), mo: r("month"), d: r("day"), h: r("hour") % 24, mi: r("minute"), s: r("second") };
}
function Kt(e) {
  return pe(e.y, e.mo, e.d) * Vn + ((e.h * 60 + e.mi) * 60 + e.s) * 1e3;
}
function bt(e, t) {
  return Kt(be(e, t)) - e;
}
function q(e, t) {
  const n = Kt(e), r = n - bt(n, t);
  return n - bt(r, t);
}
function Ye(e, t) {
  const n = be(e, t), r = (s, o = 2) => String(s).padStart(o, "0");
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
}, Qn = {
  second: "s",
  minute: "m",
  hour: "h",
  day: "d",
  week: "w",
  month: "M",
  quarter: "q",
  year: "y"
}, Yn = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  y: "year"
}, Hn = /^now(?:([+-])(\d{1,6})([smhdwMy]))?(?:\/([smhdwMy]))?$/, Zn = /^(\d{4})-(\d{2})-(\d{2})$/, Xn = /^\d{13}$/, Jn = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?$/, er = /^(this|last|next)-(hour|day|week|month|quarter|year)$/, tr = /^last-(\d{1,6})-(second|minute|hour|day|week|month|quarter|year)s?$/, nr = /^last-(\d{1,6})([smhdwMy])$/, qt = "expected now±<n><unit> (units s m h d w M y, optional /<unit> snap), an ISO day or instant, 13-digit epoch ms, today/yesterday/tomorrow, this-/last-/next-<unit>, or last-<n>-<unit>s";
function $e(e) {
  return { ok: !1, error: `unrecognized range expression "${e}" — ${qt}` };
}
function wt(e, t, n) {
  return t >= 1 && t <= 12 && n >= 1 && n <= Ft(e, t);
}
function Te(e) {
  const t = e.trim();
  if (!t) return { ok: !1, error: `empty range expression — ${qt}` };
  if (t === "today") return de({ kind: "day", offset: 0 });
  if (t === "yesterday") return de({ kind: "day", offset: -1 });
  if (t === "tomorrow") return de({ kind: "day", offset: 1 });
  const n = er.exec(t);
  if (n)
    return de({ kind: "period", rel: n[1], unit: n[2] });
  const r = tr.exec(t);
  if (r) return de({ kind: "trailing", n: Number(r[1]), unit: Qn[r[2]] });
  const s = nr.exec(t);
  if (s) return de({ kind: "trailing", n: Number(s[1]), unit: gt[s[2]] });
  const o = Hn.exec(t);
  if (o) {
    const [, d, c, u, w] = o;
    return ge({
      kind: "now",
      ...d ? { offset: { sign: d === "-" ? -1 : 1, n: Number(c), unit: gt[u] } } : {},
      ...w ? { snap: Yn[w] } : {}
    });
  }
  const a = Zn.exec(t);
  if (a) {
    const [d, c, u] = [Number(a[1]), Number(a[2]), Number(a[3])];
    return wt(d, c, u) ? ge({ kind: "isoDay", y: d, mo: c, d: u }) : $e(e);
  }
  if (Xn.test(t)) return ge({ kind: "instant", ms: Number(t) });
  const l = Jn.exec(t);
  if (l) {
    const [, d, c, u, w, y, x, m, h] = l;
    if (!wt(Number(d), Number(c), Number(u)) || Number(w) > 23 || Number(y) > 59) return $e(e);
    if (h) {
      const v = Date.parse(t);
      return Number.isFinite(v) ? ge({ kind: "instant", ms: v }) : $e(e);
    }
    return ge({
      kind: "wall",
      y: Number(d),
      mo: Number(c),
      d: Number(u),
      h: Number(w),
      mi: Number(y),
      s: Number(x ?? 0),
      ms: Number((m ?? "0").padEnd(3, "0"))
    });
  }
  return $e(e);
}
function $i(e) {
  const t = Te(e);
  return t.ok && t.expr.type === "window";
}
function de(e) {
  return { ok: !0, expr: { type: "window", window: e } };
}
function ge(e) {
  return { ok: !0, expr: { type: "endpoint", endpoint: e } };
}
const rr = "browser";
function Bt() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
function Vt(e, ...t) {
  for (const n of t)
    if (n && n !== rr) return n;
  return e();
}
const Ei = "last-30-days";
function Ri(e, t, n = Bt) {
  return et(Vt(n, e, t));
}
function sr(e, t) {
  const n = e.y * 12 + (e.mo - 1) + t, r = Math.floor(n / 12), s = (n % 12 + 12) % 12 + 1;
  return { ...e, y: r, mo: s, d: Math.min(e.d, Ft(r, s)) };
}
function ie(e, t, n, r) {
  switch (n) {
    case "s":
      return e + t * 1e3;
    case "m":
      return e + t * 6e4;
    case "h":
      return e + t * 36e5;
    case "d":
    case "w": {
      const s = be(e, r), o = n === "w" ? t * 7 : t, a = jt(pe(s.y, s.mo, s.d) + o);
      return q({ ...s, ...a }, r);
    }
    case "M":
    case "q":
    case "y": {
      const s = n === "M" ? t : n === "q" ? t * 3 : t * 12;
      return q(sr(be(e, r), s), r);
    }
  }
}
function or(e) {
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
function He(e, t, n, r) {
  if (t === "second") return Math.floor(e / 1e3) * 1e3;
  const s = be(e, n), o = r ?? "monday";
  switch (t) {
    case "minute":
      return q({ ...s, s: 0 }, n);
    case "hour":
      return q({ ...s, mi: 0, s: 0 }, n);
    case "day":
      return q({ ...s, h: 0, mi: 0, s: 0 }, n);
    case "week": {
      const a = jt(pe(s.y, s.mo, s.d) - Un(s.y, s.mo, s.d, o));
      return q({ ...s, ...a, h: 0, mi: 0, s: 0 }, n);
    }
    case "month":
      return q({ ...s, d: 1, h: 0, mi: 0, s: 0 }, n);
    case "quarter":
      return q({ ...s, mo: Math.floor((s.mo - 1) / 3) * 3 + 1, d: 1, h: 0, mi: 0, s: 0 }, n);
    case "year":
      return q({ ...s, mo: 1, d: 1, h: 0, mi: 0, s: 0 }, n);
    default:
      return e;
  }
}
function xt(e, t, n, r) {
  switch (e.kind) {
    case "now": {
      let s = t;
      return e.offset && (s = ie(s, e.offset.sign * e.offset.n, e.offset.unit, n)), e.snap && (s = He(s, e.snap, n, r)), s;
    }
    case "isoDay":
      return q({ y: e.y, mo: e.mo, d: e.d, h: 0, mi: 0, s: 0 }, n);
    case "instant":
      return e.ms;
    case "wall":
      return q({ y: e.y, mo: e.mo, d: e.d, h: e.h, mi: e.mi, s: e.s }, n) + e.ms;
  }
}
function ir(e, t, n, r) {
  switch (e.kind) {
    case "day": {
      const s = ie(He(t, "day", n), e.offset, "d", n);
      return e.offset === 0 ? { fromMs: s, toMs: t } : { fromMs: s, toMs: ie(s, 1, "d", n) };
    }
    case "period": {
      const s = He(t, e.unit, n, r), o = or(e.unit);
      return e.rel === "this" ? { fromMs: s, toMs: t } : e.rel === "last" ? { fromMs: ie(s, -1, o, n), toMs: s } : { fromMs: ie(s, 1, o, n), toMs: ie(s, 2, o, n) };
    }
    case "trailing":
      return { fromMs: ie(t, -e.n, e.unit, n), toMs: t };
  }
}
function ar(e, t, n, r, s) {
  if (!e || !e.trim()) return null;
  const o = et(r), a = Te(e);
  if (!a.ok) return null;
  if (a.expr.type === "window")
    return t && t.trim() ? null : ir(a.expr.window, n, o, s);
  const l = xt(a.expr.endpoint, n, o, s);
  let d = n;
  if (t && t.trim()) {
    const c = Te(t);
    if (!c.ok || c.expr.type !== "endpoint") return null;
    d = xt(c.expr.endpoint, n, o, s);
  }
  return l <= d ? { fromMs: l, toMs: d } : null;
}
function _i(e, t) {
  const n = et(t), r = be(e, n), s = Ye(e, n);
  if (r.h === 0 && r.mi === 0 && r.s === 0 && e % 1e3 === 0) return s;
  const o = (a) => String(a).padStart(2, "0");
  return `${s} ${o(r.h)}:${o(r.mi)}`;
}
function lr(e) {
  return e === "sunday" ? "sunday" : "monday";
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
function tt(e, t) {
  const n = Te(e);
  return n.ok && n.expr.type === "window" ? ur(n.expr.window) : t ? `${e} → ${t}` : e === "now" ? "Now" : `${e} → now`;
}
function mr(e, t) {
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
function Ut(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var s = e.length;
    for (t = 0; t < s; t++) e[t] && (n = Ut(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function ze() {
  for (var e, t, n = 0, r = "", s = arguments.length; n < s; n++) (e = arguments[n]) && (t = Ut(e)) && (r && (r += " "), r += t);
  return r;
}
const yt = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, vt = ze, nt = (e, t) => (n) => {
  var r;
  if ((t == null ? void 0 : t.variants) == null) return vt(e, n == null ? void 0 : n.class, n == null ? void 0 : n.className);
  const { variants: s, defaultVariants: o } = t, a = Object.keys(s).map((c) => {
    const u = n == null ? void 0 : n[c], w = o == null ? void 0 : o[c];
    if (u === null) return null;
    const y = yt(u) || yt(w);
    return s[c][y];
  }), l = n && Object.entries(n).reduce((c, u) => {
    let [w, y] = u;
    return y === void 0 || (c[w] = y), c;
  }, {}), d = t == null || (r = t.compoundVariants) === null || r === void 0 ? void 0 : r.reduce((c, u) => {
    let { class: w, className: y, ...x } = u;
    return Object.entries(x).every((m) => {
      let [h, v] = m;
      return Array.isArray(v) ? v.includes({
        ...o,
        ...l
      }[h]) : {
        ...o,
        ...l
      }[h] === v;
    }) ? [
      ...c,
      w,
      y
    ] : c;
  }, []);
  return vt(e, a, d, n == null ? void 0 : n.class, n == null ? void 0 : n.className);
}, fr = (e, t) => {
  const n = new Array(e.length + t.length);
  for (let r = 0; r < e.length; r++)
    n[r] = e[r];
  for (let r = 0; r < t.length; r++)
    n[e.length + r] = t[r];
  return n;
}, hr = (e, t) => ({
  classGroupId: e,
  validator: t
}), Qt = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
  nextPart: e,
  validators: t,
  classGroupId: n
}), Ie = "-", kt = [], pr = "arbitrary..", br = (e) => {
  const t = wr(e), {
    conflictingClassGroups: n,
    conflictingClassGroupModifiers: r
  } = e;
  return {
    getClassGroupId: (a) => {
      if (a.startsWith("[") && a.endsWith("]"))
        return gr(a);
      const l = a.split(Ie), d = l[0] === "" && l.length > 1 ? 1 : 0;
      return Yt(l, d, t);
    },
    getConflictingClassGroupIds: (a, l) => {
      if (l) {
        const d = r[a], c = n[a];
        return d ? c ? fr(c, d) : d : c || kt;
      }
      return n[a] || kt;
    }
  };
}, Yt = (e, t, n) => {
  if (e.length - t === 0)
    return n.classGroupId;
  const s = e[t], o = n.nextPart.get(s);
  if (o) {
    const c = Yt(e, t + 1, o);
    if (c) return c;
  }
  const a = n.validators;
  if (a === null)
    return;
  const l = t === 0 ? e.join(Ie) : e.slice(t).join(Ie), d = a.length;
  for (let c = 0; c < d; c++) {
    const u = a[c];
    if (u.validator(l))
      return u.classGroupId;
  }
}, gr = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
  return r ? pr + r : void 0;
})(), wr = (e) => {
  const {
    theme: t,
    classGroups: n
  } = e;
  return xr(n, t);
}, xr = (e, t) => {
  const n = Qt();
  for (const r in e) {
    const s = e[r];
    rt(s, n, r, t);
  }
  return n;
}, rt = (e, t, n, r) => {
  const s = e.length;
  for (let o = 0; o < s; o++) {
    const a = e[o];
    yr(a, t, n, r);
  }
}, yr = (e, t, n, r) => {
  if (typeof e == "string") {
    vr(e, t, n);
    return;
  }
  if (typeof e == "function") {
    kr(e, t, n, r);
    return;
  }
  Nr(e, t, n, r);
}, vr = (e, t, n) => {
  const r = e === "" ? t : Ht(t, e);
  r.classGroupId = n;
}, kr = (e, t, n, r) => {
  if (Cr(e)) {
    rt(e(r), t, n, r);
    return;
  }
  t.validators === null && (t.validators = []), t.validators.push(hr(n, e));
}, Nr = (e, t, n, r) => {
  const s = Object.entries(e), o = s.length;
  for (let a = 0; a < o; a++) {
    const [l, d] = s[a];
    rt(d, Ht(t, l), n, r);
  }
}, Ht = (e, t) => {
  let n = e;
  const r = t.split(Ie), s = r.length;
  for (let o = 0; o < s; o++) {
    const a = r[o];
    let l = n.nextPart.get(a);
    l || (l = Qt(), n.nextPart.set(a, l)), n = l;
  }
  return n;
}, Cr = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Sr = (e) => {
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
}, Ze = "!", Nt = ":", $r = [], Ct = (e, t, n, r, s) => ({
  modifiers: e,
  hasImportantModifier: t,
  baseClassName: n,
  maybePostfixModifierPosition: r,
  isExternal: s
}), Er = (e) => {
  const {
    prefix: t,
    experimentalParseClassName: n
  } = e;
  let r = (s) => {
    const o = [];
    let a = 0, l = 0, d = 0, c;
    const u = s.length;
    for (let h = 0; h < u; h++) {
      const v = s[h];
      if (a === 0 && l === 0) {
        if (v === Nt) {
          o.push(s.slice(d, h)), d = h + 1;
          continue;
        }
        if (v === "/") {
          c = h;
          continue;
        }
      }
      v === "[" ? a++ : v === "]" ? a-- : v === "(" ? l++ : v === ")" && l--;
    }
    const w = o.length === 0 ? s : s.slice(d);
    let y = w, x = !1;
    w.endsWith(Ze) ? (y = w.slice(0, -1), x = !0) : (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      w.startsWith(Ze) && (y = w.slice(1), x = !0)
    );
    const m = c && c > d ? c - d : void 0;
    return Ct(o, x, y, m);
  };
  if (t) {
    const s = t + Nt, o = r;
    r = (a) => a.startsWith(s) ? o(a.slice(s.length)) : Ct($r, !1, a, void 0, !0);
  }
  if (n) {
    const s = r;
    r = (o) => n({
      className: o,
      parseClassName: s
    });
  }
  return r;
}, Rr = (e) => {
  const t = /* @__PURE__ */ new Map();
  return e.orderSensitiveModifiers.forEach((n, r) => {
    t.set(n, 1e6 + r);
  }), (n) => {
    const r = [];
    let s = [];
    for (let o = 0; o < n.length; o++) {
      const a = n[o], l = a[0] === "[", d = t.has(a);
      l || d ? (s.length > 0 && (s.sort(), r.push(...s), s = []), r.push(a)) : s.push(a);
    }
    return s.length > 0 && (s.sort(), r.push(...s)), r;
  };
}, _r = (e) => ({
  cache: Sr(e.cacheSize),
  parseClassName: Er(e),
  sortModifiers: Rr(e),
  postfixLookupClassGroupIds: Mr(e),
  ...br(e)
}), Mr = (e) => {
  const t = /* @__PURE__ */ Object.create(null), n = e.postfixLookupClassGroups;
  if (n)
    for (let r = 0; r < n.length; r++)
      t[n[r]] = !0;
  return t;
}, Tr = /\s+/, Ir = (e, t) => {
  const {
    parseClassName: n,
    getClassGroupId: r,
    getConflictingClassGroupIds: s,
    sortModifiers: o,
    postfixLookupClassGroupIds: a
  } = t, l = [], d = e.trim().split(Tr);
  let c = "";
  for (let u = d.length - 1; u >= 0; u -= 1) {
    const w = d[u], {
      isExternal: y,
      modifiers: x,
      hasImportantModifier: m,
      baseClassName: h,
      maybePostfixModifierPosition: v
    } = n(w);
    if (y) {
      c = w + (c.length > 0 ? " " + c : c);
      continue;
    }
    let C = !!v, N;
    if (C) {
      const A = h.substring(0, v);
      N = r(A);
      const f = N && a[N] ? r(h) : void 0;
      f && f !== N && (N = f, C = !1);
    } else
      N = r(h);
    if (!N) {
      if (!C) {
        c = w + (c.length > 0 ? " " + c : c);
        continue;
      }
      if (N = r(h), !N) {
        c = w + (c.length > 0 ? " " + c : c);
        continue;
      }
      C = !1;
    }
    const _ = x.length === 0 ? "" : x.length === 1 ? x[0] : o(x).join(":"), S = m ? _ + Ze : _, $ = S + N;
    if (l.indexOf($) > -1)
      continue;
    l.push($);
    const T = s(N, C);
    for (let A = 0; A < T.length; ++A) {
      const f = T[A];
      l.push(S + f);
    }
    c = w + (c.length > 0 ? " " + c : c);
  }
  return c;
}, Dr = (...e) => {
  let t = 0, n, r, s = "";
  for (; t < e.length; )
    (n = e[t++]) && (r = Zt(n)) && (s && (s += " "), s += r);
  return s;
}, Zt = (e) => {
  if (typeof e == "string")
    return e;
  let t, n = "";
  for (let r = 0; r < e.length; r++)
    e[r] && (t = Zt(e[r])) && (n && (n += " "), n += t);
  return n;
}, zr = (e, ...t) => {
  let n, r, s, o;
  const a = (d) => {
    const c = t.reduce((u, w) => w(u), e());
    return n = _r(c), r = n.cache.get, s = n.cache.set, o = l, l(d);
  }, l = (d) => {
    const c = r(d);
    if (c)
      return c;
    const u = Ir(d, n);
    return s(d, u), u;
  };
  return o = a, (...d) => o(Dr(...d));
}, Ar = [], P = (e) => {
  const t = (n) => n[e] || Ar;
  return t.isThemeGetter = !0, t;
}, Xt = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, Jt = /^\((?:(\w[\w-]*):)?(.+)\)$/i, Pr = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, Or = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Lr = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Gr = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, jr = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Fr = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, X = (e) => Pr.test(e), E = (e) => !!e && !Number.isNaN(Number(e)), Q = (e) => !!e && Number.isInteger(Number(e)), We = (e) => e.endsWith("%") && E(e.slice(0, -1)), H = (e) => Or.test(e), en = () => !0, Wr = (e) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  Lr.test(e) && !Gr.test(e)
), st = () => !1, Kr = (e) => jr.test(e), qr = (e) => Fr.test(e), Br = (e) => !p(e) && !g(e), Vr = (e) => e.startsWith("@container") && (e[10] === "/" && e[11] !== void 0 || e[11] === "s" && e[16] !== void 0 && e.startsWith("-size/", 10) || e[11] === "n" && e[18] !== void 0 && e.startsWith("-normal/", 10)), Ur = (e) => te(e, rn, st), p = (e) => Xt.test(e), se = (e) => te(e, sn, Wr), St = (e) => te(e, ts, E), Qr = (e) => te(e, an, en), Yr = (e) => te(e, on, st), $t = (e) => te(e, tn, st), Hr = (e) => te(e, nn, qr), Ee = (e) => te(e, ln, Kr), g = (e) => Jt.test(e), we = (e) => le(e, sn), Zr = (e) => le(e, on), Et = (e) => le(e, tn), Xr = (e) => le(e, rn), Jr = (e) => le(e, nn), Re = (e) => le(e, ln, !0), es = (e) => le(e, an, !0), te = (e, t, n) => {
  const r = Xt.exec(e);
  return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, le = (e, t, n = !1) => {
  const r = Jt.exec(e);
  return r ? r[1] ? t(r[1]) : n : !1;
}, tn = (e) => e === "position" || e === "percentage", nn = (e) => e === "image" || e === "url", rn = (e) => e === "length" || e === "size" || e === "bg-size", sn = (e) => e === "length", ts = (e) => e === "number", on = (e) => e === "family-name", an = (e) => e === "number" || e === "weight", ln = (e) => e === "shadow", ns = () => {
  const e = P("color"), t = P("font"), n = P("text"), r = P("font-weight"), s = P("tracking"), o = P("leading"), a = P("breakpoint"), l = P("container"), d = P("spacing"), c = P("radius"), u = P("shadow"), w = P("inset-shadow"), y = P("text-shadow"), x = P("drop-shadow"), m = P("blur"), h = P("perspective"), v = P("aspect"), C = P("ease"), N = P("animate"), _ = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], S = () => [
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
  ], $ = () => [...S(), g, p], T = () => ["auto", "hidden", "clip", "visible", "scroll"], A = () => ["auto", "contain", "none"], f = () => [g, p, d], I = () => [X, "full", "auto", ...f()], V = () => [Q, "none", "subgrid", g, p], Y = () => ["auto", {
    span: ["full", Q, g, p]
  }, Q, g, p], ne = () => [Q, "auto", g, p], lt = () => ["auto", "min", "max", "fr", g, p], Pe = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"], ce = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"], K = () => ["auto", ...f()], re = () => [X, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...f()], Oe = () => [X, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...f()], Le = () => [X, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...f()], k = () => [e, g, p], ct = () => [...S(), Et, $t, {
    position: [g, p]
  }], dt = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }], ut = () => ["auto", "cover", "contain", Xr, Ur, {
    size: [g, p]
  }], Ge = () => [We, we, se], L = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    c,
    g,
    p
  ], G = () => ["", E, we, se], ke = () => ["solid", "dashed", "dotted", "double"], mt = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], O = () => [E, We, Et, $t], ft = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    m,
    g,
    p
  ], Ne = () => ["none", E, g, p], Ce = () => ["none", E, g, p], je = () => [E, g, p], Se = () => [X, "full", ...f()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [H],
      breakpoint: [H],
      color: [en],
      container: [H],
      "drop-shadow": [H],
      ease: ["in", "out", "in-out"],
      font: [Br],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [H],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [H],
      shadow: [H],
      spacing: ["px", E],
      text: [H],
      "text-shadow": [H],
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
        aspect: ["auto", "square", X, p, g, v]
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
        "@container": ["", "normal", "size", g, p]
      }],
      /**
       * Container Name
       * @see https://tailwindcss.com/docs/responsive-design#named-containers
       */
      "container-named": [Vr],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [E, p, g, l]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": _()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": _()
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
        object: $()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: T()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": T()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": T()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: A()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": A()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": A()
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
        inset: I()
      }],
      /**
       * Inset Inline
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": I()
      }],
      /**
       * Inset Block
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": I()
      }],
      /**
       * Inset Inline Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-s` in next major release
       */
      start: [{
        "inset-s": I(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        start: I()
      }],
      /**
       * Inset Inline End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-e` in next major release
       */
      end: [{
        "inset-e": I(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        end: I()
      }],
      /**
       * Inset Block Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-bs": [{
        "inset-bs": I()
      }],
      /**
       * Inset Block End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-be": [{
        "inset-be": I()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: I()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: I()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: I()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: I()
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
        z: [Q, "auto", g, p]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [X, "full", "auto", l, ...f()]
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
        flex: [E, X, "auto", "initial", "none", p]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", E, g, p]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", E, g, p]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [Q, "first", "last", "none", g, p]
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
        col: Y()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": ne()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": ne()
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
        row: Y()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": ne()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": ne()
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
        gap: f()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": f()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": f()
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
        "justify-items": [...ce(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...ce()]
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
        items: [...ce(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...ce(), {
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
        "place-items": [...ce(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...ce()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: f()
      }],
      /**
       * Padding Inline
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: f()
      }],
      /**
       * Padding Block
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: f()
      }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: f()
      }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: f()
      }],
      /**
       * Padding Block Start
       * @see https://tailwindcss.com/docs/padding
       */
      pbs: [{
        pbs: f()
      }],
      /**
       * Padding Block End
       * @see https://tailwindcss.com/docs/padding
       */
      pbe: [{
        pbe: f()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: f()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: f()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: f()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: f()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: K()
      }],
      /**
       * Margin Inline
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: K()
      }],
      /**
       * Margin Block
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: K()
      }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: K()
      }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: K()
      }],
      /**
       * Margin Block Start
       * @see https://tailwindcss.com/docs/margin
       */
      mbs: [{
        mbs: K()
      }],
      /**
       * Margin Block End
       * @see https://tailwindcss.com/docs/margin
       */
      mbe: [{
        mbe: K()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: K()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: K()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: K()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: K()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": f()
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
        "space-y": f()
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
        size: re()
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
        w: [l, "screen", ...re()]
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
          ...re()
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
          ...re()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...re()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...re()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...re()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", n, we, se]
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
        font: [r, es, Qr]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", We, p]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [Zr, Yr, t]
      }],
      /**
       * Font Feature Settings
       * @see https://tailwindcss.com/docs/font-feature-settings
       */
      "font-features": [{
        "font-features": [p]
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
        tracking: [s, g, p]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [E, "none", g, St]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          o,
          ...f()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", g, p]
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
        list: ["disc", "decimal", "none", g, p]
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
        placeholder: k()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: k()
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
        decoration: [...ke(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [E, "from-font", "auto", g, se]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: k()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": [E, "auto", g, p]
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
        indent: f()
      }],
      /**
       * Tab Size
       * @see https://tailwindcss.com/docs/tab-size
       */
      "tab-size": [{
        tab: [Q, g, p]
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", g, p]
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
        content: ["none", g, p]
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
          }, Q, g, p],
          radial: ["", g, p],
          conic: [Q, g, p]
        }, Jr, Hr]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: k()
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
        from: k()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: k()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: k()
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
        border: [...ke(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...ke(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: k()
      }],
      /**
       * Border Color Inline
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": k()
      }],
      /**
       * Border Color Block
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": k()
      }],
      /**
       * Border Color Inline Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": k()
      }],
      /**
       * Border Color Inline End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": k()
      }],
      /**
       * Border Color Block Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-bs": [{
        "border-bs": k()
      }],
      /**
       * Border Color Block End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-be": [{
        "border-be": k()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": k()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": k()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": k()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": k()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: k()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [...ke(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [E, g, p]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", E, we, se]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: k()
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
          Re,
          Ee
        ]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      "shadow-color": [{
        shadow: k()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", w, Re, Ee]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": k()
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
        ring: k()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-w": [{
        "ring-offset": [E, se]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-color": [{
        "ring-offset": k()
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
        "inset-ring": k()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", y, Re, Ee]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": k()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [E, g, p]
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
        "mask-linear": [E]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": O()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": O()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": k()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": k()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": O()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": O()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": k()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": k()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": O()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": O()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": k()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": k()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": O()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": O()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": k()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": k()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": O()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": O()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": k()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": k()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": O()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": O()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": k()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": k()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": O()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": O()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": k()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": k()
      }],
      "mask-image-radial": [{
        "mask-radial": [g, p]
      }],
      "mask-image-radial-from-pos": [{
        "mask-radial-from": O()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": O()
      }],
      "mask-image-radial-from-color": [{
        "mask-radial-from": k()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": k()
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
        "mask-radial-at": S()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [E]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": O()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": O()
      }],
      "mask-image-conic-from-color": [{
        "mask-conic-from": k()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": k()
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
        mask: ["none", g, p]
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
          g,
          p
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
        brightness: [E, g, p]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [E, g, p]
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
          x,
          Re,
          Ee
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": k()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ["", E, g, p]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [E, g, p]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", E, g, p]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [E, g, p]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", E, g, p]
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
          g,
          p
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
        "backdrop-brightness": [E, g, p]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [E, g, p]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", E, g, p]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [E, g, p]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", E, g, p]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [E, g, p]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [E, g, p]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", E, g, p]
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
        "border-spacing": f()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": f()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": f()
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
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", g, p]
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
        duration: [E, "initial", g, p]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", C, g, p]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [E, g, p]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", N, g, p]
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
        perspective: [h, g, p]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      "perspective-origin": [{
        "perspective-origin": $()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: Ne()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": Ne()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": Ne()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": Ne()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: Ce()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": Ce()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": Ce()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": Ce()
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
        transform: [g, p, "", "none", "gpu", "cpu"]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: $()
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
        translate: Se()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": Se()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": Se()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": Se()
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
        zoom: [Q, g, p]
      }],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: k()
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
        caret: k()
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
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", g, p]
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
        "scrollbar-thumb": k()
      }],
      /**
       * Scrollbar Track Color
       * @see https://tailwindcss.com/docs/scrollbar-color
       */
      "scrollbar-track-color": [{
        "scrollbar-track": k()
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
        "scroll-m": f()
      }],
      /**
       * Scroll Margin Inline
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": f()
      }],
      /**
       * Scroll Margin Block
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": f()
      }],
      /**
       * Scroll Margin Inline Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": f()
      }],
      /**
       * Scroll Margin Inline End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": f()
      }],
      /**
       * Scroll Margin Block Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbs": [{
        "scroll-mbs": f()
      }],
      /**
       * Scroll Margin Block End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbe": [{
        "scroll-mbe": f()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": f()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": f()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": f()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": f()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": f()
      }],
      /**
       * Scroll Padding Inline
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": f()
      }],
      /**
       * Scroll Padding Block
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": f()
      }],
      /**
       * Scroll Padding Inline Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": f()
      }],
      /**
       * Scroll Padding Inline End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": f()
      }],
      /**
       * Scroll Padding Block Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbs": [{
        "scroll-pbs": f()
      }],
      /**
       * Scroll Padding Block End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbe": [{
        "scroll-pbe": f()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": f()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": f()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": f()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": f()
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
        "will-change": ["auto", "scroll", "contents", "transform", g, p]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ["none", ...k()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [E, we, se, St]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...k()]
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
}, ot = /* @__PURE__ */ zr(ns);
function W(...e) {
  return ot(ze(e));
}
const rs = nt(
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
), _e = z.forwardRef(function({ className: t, variant: n, size: r, asChild: s = !1, ...o }, a) {
  return /* @__PURE__ */ i(s ? Xe : "button", { ref: a, className: W(rs({ variant: n, size: r, className: t })), ...o });
});
function ss({ ...e }) {
  return /* @__PURE__ */ i(he.Root, { "data-slot": "dropdown-menu", ...e });
}
function os({ ...e }) {
  return /* @__PURE__ */ i(he.Trigger, { "data-slot": "dropdown-menu-trigger", ...e });
}
function is({
  className: e,
  sideOffset: t = 4,
  ...n
}) {
  return /* @__PURE__ */ i(he.Portal, { children: /* @__PURE__ */ i(
    he.Content,
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
function as({
  className: e,
  inset: t,
  ...n
}) {
  return /* @__PURE__ */ i(
    he.Label,
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
    he.Separator,
    {
      "data-slot": "dropdown-menu-separator",
      className: W("bg-border -mx-1 my-1 h-px", e),
      ...t
    }
  );
}
const cn = z.forwardRef(
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
cn.displayName = "Input";
const dn = { eu: "/", iso: "-", usa: "/" };
function ls(e) {
  const t = dn[e];
  return e === "usa" ? `MM${t}DD${t}YYYY` : e === "iso" ? `YYYY${t}MM${t}DD` : `DD${t}MM${t}YYYY`;
}
function _t(e, t) {
  const n = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e ?? "");
  if (!n) return "";
  const [, r, s, o] = n, a = dn[t];
  return t === "usa" ? `${s}${a}${o}${a}${r}` : t === "iso" ? `${r}${a}${s}${a}${o}` : `${o}${a}${s}${a}${r}`;
}
function Mi(e, t) {
  const n = (e ?? "").split(/[/\-.]/).map((l) => l.trim());
  if (n.length !== 3 || n.some((l) => !/^\d+$/.test(l))) return "";
  let r, s, o;
  if (t === "usa" ? [s, o, r] = n : t === "iso" ? [r, s, o] = n : [o, s, r] = n, r.length !== 4) return "";
  const a = `${r}-${s.padStart(2, "0")}-${o.padStart(2, "0")}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(a) ? a : "";
}
function Mt({ value: e, onChange: t, dateStyle: n, className: r, ...s }) {
  const o = J(null), a = n ?? "eu", l = _t(e, a) || ls(a), d = !_t(e, a);
  return /* @__PURE__ */ b(
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
            className: W("pointer-events-none px-2.5 pr-7", d && "text-muted/60"),
            children: l
          }
        ),
        /* @__PURE__ */ i(_n, { "aria-hidden": !0, size: 13, className: "pointer-events-none absolute right-2 text-muted" }),
        /* @__PURE__ */ i(
          "input",
          {
            ...s,
            ref: o,
            type: "date",
            value: e,
            onChange: (c) => t(c.target.value),
            onClick: () => {
              var c;
              try {
                (c = o.current) == null || c.showPicker();
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
const un = ["Minutes", "Hours", "Days", "Months", "Years"], R = (e, t) => ({ id: e, label: tt(t), expr: t }), mn = [
  {
    id: "trailing",
    label: "Trailing",
    hint: "ends now",
    cells: {
      Minutes: [
        R("last-5m", "last-5-minutes"),
        R("last-15m", "last-15-minutes"),
        R("last-30m", "last-30-minutes"),
        R("last-60m", "last-60-minutes")
      ],
      Hours: [
        R("last-3h", "last-3-hours"),
        R("last-6h", "last-6-hours"),
        R("last-12h", "last-12-hours"),
        R("last-24h", "last-24-hours")
      ],
      Days: [
        R("last-7d", "last-7-days"),
        R("last-14d", "last-14-days"),
        R("last-30d", "last-30-days"),
        // Kept alongside `last-3-months` on purpose: 90 fixed days is what people type, 3 calendar
        // months is what a report schedule wants. Different columns, so the difference is visible.
        R("last-90d", "last-90-days")
      ],
      Months: [
        R("last-2mo", "last-2-months"),
        R("last-3mo", "last-3-months"),
        R("last-6mo", "last-6-months"),
        R("last-12mo", "last-12-months")
      ],
      // No `last-1-year`: it resolves IDENTICALLY to `last-12-months` one column left, and two
      // adjacent buttons for one window is a question the reader has to stop and answer. Nothing at
      // 5y either — series retention has GC'd it, so the click returns an empty chart, not an error.
      Years: [R("last-2y", "last-2-years"), R("last-3y", "last-3-years")]
    }
  },
  {
    id: "calendar",
    label: "Calendar",
    hint: "calendar-aligned",
    cells: {
      // No "this minute" — nobody reaches for it, and an empty cell is information, not a gap.
      Minutes: [],
      Hours: [R("this-hour", "this-hour"), R("last-hour", "last-hour")],
      Days: [
        R("today", "today"),
        R("yesterday", "yesterday"),
        R("this-week", "this-week"),
        R("last-week", "last-week")
      ],
      Months: [
        R("this-month", "this-month"),
        R("last-month", "last-month"),
        R("this-quarter", "this-quarter"),
        R("last-quarter", "last-quarter")
      ],
      Years: [R("this-year", "this-year"), R("last-year", "last-year")]
    }
  }
], Ti = mn.flatMap(
  (e) => un.flatMap((t) => e.cells[t])
), Ke = /^\d{4}-\d{2}-\d{2}$/;
function Ii({
  from: e,
  to: t,
  onApply: n,
  timezone: r,
  compact: s,
  dateStyle: o,
  weekStart: a,
  onUserApply: l
}) {
  const [d, c] = M(!1), u = Gt(), w = Vt((u == null ? void 0 : u.zone) ?? Bt, r), y = lr(a), x = Ke.test(e) && t ? "" : e, [m, h] = M(x), v = me(
    () => Ke.test(e) && t && Ke.test(t) ? { from: e, to: t } : { from: "", to: "" },
    [e, t]
  ), [C, N] = M(v);
  ee(() => {
    h(x), N(v);
  }, [e, t]);
  const _ = me(() => Date.now(), [d]), S = me(() => {
    const f = m.trim();
    if (!f) return null;
    const I = ar(f, void 0, _, w, y);
    return I ? {
      text: `${f} → ${Ye(I.fromMs, w)} → ${Ye(I.toMs, w)}`
    } : {
      error: "Not a range expression — try last-3-months, this-month, now-4h."
    };
  }, [m, _, w]), $ = (f) => {
    l == null || l(), n(f), c(!1);
  }, T = C.from !== e || C.to !== t, A = !!C.from && !!C.to && C.from > C.to;
  return /* @__PURE__ */ b(ss, { open: d, onOpenChange: c, children: [
    /* @__PURE__ */ i(os, { asChild: !0, children: /* @__PURE__ */ b(
      _e,
      {
        variant: "outline",
        size: "sm",
        className: W(
          "dash-kit gap-1.5 px-2.5 text-xs font-normal",
          s ? "h-11 md:h-8" : "h-8"
        ),
        title: "Change the dashboard time range",
        children: [
          /* @__PURE__ */ i(Mn, { size: 13, className: "text-muted" }),
          /* @__PURE__ */ i("span", { className: "max-w-[13rem] truncate", children: s ? mr(e, t) : tt(e, t) }),
          /* @__PURE__ */ i(Tn, { size: 13, className: "text-muted" })
        ]
      }
    ) }),
    /* @__PURE__ */ b(
      is,
      {
        align: "end",
        className: W(
          // `dash-kit` on the CONTENT too, not only the trigger: the content renders in a Radix PORTAL
          // at the document root, outside the trigger's subtree, so a scope class on the trigger alone
          // would leave every utility in the popover unstyled.
          "dash-kit max-w-[calc(100vw-2rem)] p-0",
          s ? "w-[calc(100vw-2rem)]" : "w-[42rem]"
        ),
        children: [
          /* @__PURE__ */ i(as, { className: "px-3 pt-2.5 text-[0.7rem] uppercase tracking-wide text-muted", children: "Quick ranges" }),
          /* @__PURE__ */ i("div", { className: "px-1.5 pb-2", children: mn.map((f) => /* @__PURE__ */ b("div", { className: "mb-1 last:mb-0", children: [
            /* @__PURE__ */ b("div", { className: "flex items-baseline gap-1.5 px-1 pb-0.5 pt-1", children: [
              /* @__PURE__ */ i("span", { className: "text-[0.7rem] font-medium uppercase tracking-wide text-muted", children: f.label }),
              /* @__PURE__ */ i("span", { className: "text-[0.65rem] text-muted", children: f.hint })
            ] }),
            /* @__PURE__ */ i(
              "div",
              {
                className: W(
                  "grid gap-x-1 gap-y-0.5",
                  s ? "grid-cols-2" : "grid-cols-5"
                ),
                children: un.map((I) => {
                  const V = f.cells[I];
                  return s && V.length === 0 ? null : /* @__PURE__ */ b("div", { className: "min-w-0", children: [
                    !s && /* @__PURE__ */ i("div", { className: "px-2 pb-0.5 text-[0.65rem] uppercase tracking-wide text-muted/70", children: I }),
                    V.map((Y) => {
                      const ne = !t && Y.expr === e;
                      return /* @__PURE__ */ b(
                        _e,
                        {
                          variant: "ghost",
                          size: "sm",
                          className: W(
                            "w-full justify-start gap-1.5 px-2 text-xs font-normal",
                            s ? "h-10" : "h-8",
                            ne && "bg-muted-bg font-medium text-fg"
                          ),
                          onClick: () => $({ from: Y.expr }),
                          children: [
                            /* @__PURE__ */ i(
                              Pt,
                              {
                                size: 12,
                                className: W(
                                  "shrink-0 text-accent",
                                  !ne && "invisible"
                                )
                              }
                            ),
                            /* @__PURE__ */ i("span", { className: "truncate", children: Y.label })
                          ]
                        },
                        Y.id
                      );
                    })
                  ] }, I);
                })
              }
            )
          ] }, f.id)) }),
          /* @__PURE__ */ i(Rt, { className: "my-0" }),
          /* @__PURE__ */ b("div", { className: "space-y-1.5 px-3 py-2.5", children: [
            /* @__PURE__ */ i("div", { className: "text-[0.7rem] uppercase tracking-wide text-muted", children: "Relative range" }),
            /* @__PURE__ */ b(
              "form",
              {
                className: "flex items-center gap-1.5",
                onSubmit: (f) => {
                  f.preventDefault(), m.trim() && S && !("error" in S) && $({ from: m.trim() });
                },
                children: [
                  /* @__PURE__ */ i(
                    cn,
                    {
                      "aria-label": "dashboard relative range",
                      className: "h-8 flex-1 text-xs",
                      placeholder: "last-3-months, this-quarter, now-4h…",
                      value: m,
                      onChange: (f) => h(f.target.value)
                    }
                  ),
                  /* @__PURE__ */ i(
                    _e,
                    {
                      type: "submit",
                      size: "sm",
                      className: "h-8 text-xs",
                      disabled: !m.trim() || !S || "error" in S,
                      title: "Apply this relative range — re-queries every panel",
                      children: "Apply"
                    }
                  )
                ]
              }
            ),
            S && ("error" in S ? /* @__PURE__ */ i("p", { className: "text-[0.7rem] text-danger", children: S.error }) : /* @__PURE__ */ i(
              "p",
              {
                className: "truncate text-[0.7rem] text-muted",
                title: S.text,
                children: S.text
              }
            ))
          ] }),
          /* @__PURE__ */ i(Rt, { className: "my-0" }),
          /* @__PURE__ */ b("div", { className: "space-y-2 px-3 py-2.5", children: [
            /* @__PURE__ */ i("div", { className: "text-[0.7rem] uppercase tracking-wide text-muted", children: "Absolute range" }),
            /* @__PURE__ */ b("div", { className: "flex items-center gap-1.5 text-xs text-muted", children: [
              /* @__PURE__ */ i(
                Mt,
                {
                  "aria-label": "dashboard range from",
                  dateStyle: o,
                  className: "flex-1",
                  value: C.from,
                  onChange: (f) => N((I) => ({ ...I, from: f }))
                }
              ),
              /* @__PURE__ */ i("span", { children: "to" }),
              /* @__PURE__ */ i(
                Mt,
                {
                  "aria-label": "dashboard range to",
                  dateStyle: o,
                  className: "flex-1",
                  value: C.to ?? "",
                  onChange: (f) => N((I) => ({ ...I, to: f }))
                }
              )
            ] }),
            A ? /* @__PURE__ */ i("p", { className: "text-[0.7rem] text-danger", children: "The start date must not be after the end date." }) : /* @__PURE__ */ i("p", { className: "text-[0.7rem] text-muted", children: "The end date is exclusive — it ends at the start of that day." }),
            /* @__PURE__ */ i(
              _e,
              {
                size: "sm",
                className: "h-8 w-full text-xs",
                disabled: !T || A || !C.from || !C.to,
                title: T ? "Apply this range — re-queries every panel" : "This range is already applied",
                onClick: () => $({ from: C.from, to: C.to }),
                children: "Apply range"
              }
            )
          ] })
        ]
      }
    )
  ] });
}
const fn = 3e4;
function cs() {
  return new Ln({
    defaultOptions: {
      queries: {
        // A read either resolves or honestly denies — never retry it into a fabricated success (§9).
        retry: !1,
        // No window refocus refetch: the refresh TICK (in the key) is the freshness signal, not focus.
        refetchOnWindowFocus: !1,
        // Floor stale window; tick-keyed reads are effectively "fresh until the next tick" via the key.
        staleTime: 0,
        gcTime: fn
      }
    }
  });
}
function Ae(e) {
  return new Promise((t, n) => {
    e.oncomplete = e.onsuccess = () => t(e.result), e.onabort = e.onerror = () => n(e.error);
  });
}
function ds(e, t) {
  let n;
  const r = () => {
    if (n)
      return n;
    const s = indexedDB.open(e);
    return s.onupgradeneeded = () => s.result.createObjectStore(t), n = Ae(s), n.then((o) => {
      o.onclose = () => n = void 0;
    }, () => {
      n = void 0;
    }), n;
  };
  return (s, o) => r().then((a) => o(a.transaction(t, s).objectStore(t)));
}
let qe;
function it() {
  return qe || (qe = ds("keyval-store", "keyval")), qe;
}
function us(e, t = it()) {
  return t("readonly", (n) => Ae(n.get(e)));
}
function ms(e, t, n = it()) {
  return n("readwrite", (r) => (r.put(t, e), Ae(r.transaction)));
}
function fs(e, t = it()) {
  return t("readwrite", (n) => (n.delete(e), Ae(n.transaction)));
}
const hn = "v1", hs = 7 * 24 * 60 * 6e4, ps = "quick-";
function bs(e) {
  return `lb.quick-cache.${hn}.${e}`;
}
function gs(e) {
  const t = bs(e);
  return {
    persistClient: (n) => ms(t, n).catch(() => {
    }),
    restoreClient: () => us(t).catch(() => {
    }),
    removeClient: () => fs(t).catch(() => {
    })
  };
}
const ws = 250;
function xs(e, t) {
  const [n, r] = t.queryKey;
  return typeof n == "string" && n.startsWith(ps) && r === e && t.state.status === "success";
}
function ys(e, t) {
  if (!t) return () => {
  };
  const n = {
    queryClient: e,
    persister: gs(t),
    maxAge: hs,
    // The buster is BELT AND BRACES with the versioned storage key: the key stops a stale store from
    // being found at all, this stops one that somehow was.
    buster: hn,
    dehydrateOptions: { shouldDehydrateQuery: (l) => xs(t, l) }
  };
  let r = !1, s = null, o = null;
  const a = () => {
    r || s || (s = setTimeout(() => {
      s = null, r || Fn(n);
    }, ws));
  };
  return jn(n).catch(() => {
  }).then(() => {
    r || (a(), o = e.getQueryCache().subscribe(a));
  }), () => {
    r = !0, s && clearTimeout(s), o == null || o();
  };
}
const at = ve(null);
function Di() {
  const e = ae(at);
  if (e === null) throw new Error("useDashboardWs: no DashboardCacheProvider in tree");
  return e;
}
function zi() {
  return ae(at);
}
function vs({ ws: e, children: t }) {
  const [n] = M(cs);
  return ee(() => ys(n, e), [n, e]), /* @__PURE__ */ i(at.Provider, { value: e, children: /* @__PURE__ */ i(Gn, { client: n, children: t }) });
}
const Be = "[A-Za-z_][\\w.]*", Tt = new RegExp(
  // ${name} or ${name:format}
  `\\$\\{(${Be})(?::[a-z]+)?\\}|\\[\\[(${Be})(?::[a-z]+)?\\]\\]|\\$(${Be})`,
  "g"
);
function ks(e) {
  const t = [], n = /* @__PURE__ */ new Set();
  let r;
  for (Tt.lastIndex = 0; (r = Tt.exec(e)) !== null; ) {
    const s = r[1] ?? r[2] ?? r[3];
    s && !n.has(s) && (n.add(s), t.push(s));
  }
  return t;
}
const Ns = "__";
function Cs(e) {
  return e.startsWith(Ns);
}
function Ss(e) {
  const t = [], n = /* @__PURE__ */ new Set(), r = (s) => {
    if (typeof s == "string")
      for (const o of ks(s))
        n.has(o) || (n.add(o), t.push(o));
    else Array.isArray(s) ? s.forEach(r) : s && typeof s == "object" && Object.values(s).forEach(r);
  };
  return r(e), t;
}
const $s = " / ";
function Ai(e, t) {
  var s;
  const n = {}, r = ((s = e == null ? void 0 : e.path) == null ? void 0 : s.filter((o) => o != null)) ?? [];
  return r.length > 0 && (n["__nav.label"] = r[r.length - 1], r.length > 1 && (n["__nav.parent.label"] = r[r.length - 2]), r.length > 2 && (n["__nav.parent.parent.label"] = r[r.length - 3]), n["__nav.path"] = r.join($s), (e == null ? void 0 : e.id) !== void 0 && (n["__nav.id"] = e.id)), t && (t.id !== void 0 && (n["__page.id"] = t.id), t.title !== void 0 && (n["__page.title"] = t.title), (t.id !== void 0 || t.title !== void 0) && (n["__page.ext"] = t.ext ?? "")), n;
}
const It = "scope";
function Es(e) {
  let t = e;
  if (e && typeof e == "object" && !Array.isArray(e) && It in e) {
    const { [It]: n, ...r } = e;
    t = r;
  }
  return new Set(Ss(t).filter(Cs));
}
function pn(e, t) {
  if (!t || typeof t != "object" || Array.isArray(t)) return t;
  const { builtins: n, ...r } = t;
  if (!n || typeof n != "object" || Array.isArray(n))
    return t;
  const s = Es(e), o = {};
  let a = !1;
  for (const [l, d] of Object.entries(
    n
  ))
    s.has(l) && (o[l] = d, a = !0);
  return a ? { ...r, builtins: o } : { ...r };
}
function ye(e) {
  if (Array.isArray(e)) return e.map(ye);
  if (e && typeof e == "object") {
    const t = {};
    for (const n of Object.keys(e).sort()) {
      const r = e[n];
      r !== void 0 && (t[n] = ye(r));
    }
    return t;
  }
  return e;
}
function Pi(e, t) {
  return [
    "viz.query",
    e,
    ye({ ...t, scope: pn(t, t.scope) })
  ];
}
function Oi(e, t) {
  return [
    "viz.fetch",
    e,
    ye({ ...t, scope: pn(t, t.scope) })
  ];
}
function Li(e, t) {
  return ["viz.shape", e, ye(t)];
}
function Gi(e, t, n) {
  return ["flows.node_state", e, t, n];
}
function ji(e, t) {
  return ["series.read", e, t];
}
function Fi(e) {
  return ["source-picker", e];
}
function Rs(e) {
  return ["datasource.list", e];
}
function _s(e, t) {
  return {
    queryKey: Rs(e),
    queryFn: () => t(),
    staleTime: fn
  };
}
function Wi(e, t, n) {
  return e.fetchQuery(_s(t, n));
}
const Ms = 120;
function Ki({
  refreshMs: e,
  cacheTtlS: t
}) {
  return typeof e == "number" && e > 0 ? Math.max(1, Math.round(e / 1e3)) : t === 0 ? 0 : typeof t == "number" && t > 0 ? Math.floor(t) : Ms;
}
function qi({ ws: e, children: t }) {
  return /* @__PURE__ */ i(vs, { ws: e, children: t });
}
function Bi(e, t) {
  const [n, r] = M(e);
  return ee(() => {
    const s = setTimeout(() => r(e), t);
    return () => clearTimeout(s);
  }, [e, t]), n;
}
const bn = ve(!1), Vi = bn.Provider;
function Ui() {
  return ae(bn);
}
const gn = ve(0), Qi = gn.Provider;
function Yi() {
  return ae(gn);
}
const Dt = 64, Ts = "viz.query_batch", Is = "viz.query";
function zt(e, t = {}) {
  const n = t.windowMs ?? 12, r = t.batchTool ?? Ts, s = t.singleTool ?? Is;
  let o = [], a = null, l = !0;
  const d = () => {
    a === null && (a = setTimeout(c, n));
  }, c = () => {
    a = null;
    const x = o;
    if (o = [], x.length !== 0)
      for (let m = 0; m < x.length; m += Dt)
        u(x.slice(m, m + Dt));
  }, u = async (x) => {
    if (!l) {
      await w(x);
      return;
    }
    const m = Ds(x), h = { panels: x.map((v) => v.panel), now: 0 };
    m && (h.cache = m);
    try {
      const v = await e(r, h), C = (v == null ? void 0 : v.results) ?? [];
      x.forEach((N, _) => y(N, C[_]));
    } catch (v) {
      zs(v) && (l = !1), await w(x);
    }
  }, w = async (x) => {
    await Promise.all(
      x.map(async (m) => {
        try {
          const h = { panel: m.panel };
          m.cache && (h.cache = m.cache);
          const v = await e(s, h);
          m.resolve({ frames: (v == null ? void 0 : v.frames) ?? [], rows: v == null ? void 0 : v.rows });
        } catch (h) {
          m.reject(h);
        }
      })
    );
  }, y = (x, m) => {
    if (!m) {
      x.reject(new Error("viz.query_batch: missing result slice"));
      return;
    }
    if ("status" in m && (m.status === "error" || m.status === "denied")) {
      x.reject(new Error(m.message || m.status));
      return;
    }
    const h = m;
    x.resolve({ frames: h.frames ?? [], rows: h.rows });
  };
  return {
    load(x, m) {
      return new Promise((h, v) => {
        o.push({ panel: x, cache: m, resolve: h, reject: v }), d();
      });
    },
    get supported() {
      return l;
    }
  };
}
function Ds(e) {
  let t = 0;
  for (const n of e) n.cache && n.cache.ttl_s > t && (t = n.cache.ttl_s);
  return t > 0 ? { ttl_s: t } : void 0;
}
function zs(e) {
  const t = (e instanceof Error ? e.message : String(e ?? "")).toLowerCase();
  return /not.?found|unknown (tool|command|verb|method)|no such|unsupported|\b400\b|\b404\b|unrecognized/.test(
    t
  );
}
const wn = ve(null);
function Hi() {
  return ae(wn);
}
function Zi({ call: e, children: t }) {
  const n = Gt(), r = me(() => {
    if (e) return zt(e);
    if (!n)
      throw new Error(
        "VizBatchProvider: no `call` prop and no <KitProvider>. Give it one or the other."
      );
    const s = n.client;
    return zt((o, a) => s.call(o, a));
  }, [e, n]);
  return /* @__PURE__ */ i(wn.Provider, { value: r, children: t });
}
function As(e) {
  return e.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function Ps(e) {
  return /\.(publish|write|enqueue|command|set|send|record|create|delete|resolve|derive|simulate)$/.test(
    e
  );
}
function Os(e, t) {
  const n = t.startsWith(`${e}.`) ? t.slice(e.length + 1) : t;
  return `${e} · ${n}`;
}
function Ls(e) {
  return e.map((t) => ({
    id: `series:${t}`,
    group: "series",
    label: t,
    source: { tool: "series.read", args: { series: t } },
    writes: !1
  }));
}
function Gs(e) {
  return e.map((t) => ({
    id: `live:${t}`,
    group: "live",
    label: `${t} (live)`,
    source: { tool: "series.watch", args: { series: t } },
    writes: !1
  }));
}
function js(e) {
  var n, r, s;
  const t = [];
  for (const o of e) {
    if (!o.enabled) continue;
    const a = /* @__PURE__ */ new Set();
    (r = (n = o.ui) == null ? void 0 : n.scope) == null || r.forEach((l) => a.add(l)), (s = o.widgets) == null || s.forEach((l) => {
      var d;
      return (d = l.scope) == null ? void 0 : d.forEach((c) => a.add(c));
    });
    for (const l of a) {
      const d = Ps(l);
      t.push({
        id: `ext:${o.ext}:${l}`,
        group: d ? "action" : "extension",
        label: Os(o.ext, l),
        source: d ? void 0 : { tool: l, args: {} },
        action: d ? { tool: l, argsTemplate: {} } : void 0,
        writes: d
      });
    }
  }
  return t;
}
function Fs(e) {
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
function Ws(e, t) {
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
function Ks(e) {
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
const Bs = "sql:query";
function Vs() {
  return {
    id: Bs,
    group: "sql",
    label: "SQL query (direct SurrealDB)",
    source: { tool: "store.query", args: { sql: "" } },
    writes: !1
  };
}
function Us(e) {
  return [
    ...Ls(e.series ?? []),
    ...Gs(e.series ?? []),
    ...js(e.extensions ?? []),
    ...Fs(e.extensions ?? []),
    ...Ws(e.flows ?? [], e.descriptors ?? []),
    ...Ks(e.rules ?? []),
    ...qs(e.queries ?? []),
    Vs()
  ];
}
function xn(e) {
  return { id: e.id, source: e.source, action: e.action, viewKey: e.viewKey };
}
const yn = {
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
}, Qs = Object.keys(yn);
function Ys(e) {
  return e instanceof Error ? e.message : String(e);
}
async function Hs(e, t) {
  const n = {}, r = (s, o) => {
    n[s] = o, t == null || t((a) => ({ ...a, [s]: o }));
  };
  return await Promise.all(
    Qs.map(async (s) => {
      const o = await vn(e, s);
      o && r(s, o);
    })
  ), n;
}
async function vn(e, t) {
  const n = e[yn[t]];
  if (n)
    try {
      return { status: "ready", data: await n() };
    } catch (r) {
      return { status: "denied", error: Ys(r) };
    }
}
async function Zs(e) {
  const t = await Hs(e), n = oe(t.flowSummaries, []), r = oe(t.flowDescriptors, []), s = e.getFlow, o = s ? (await Promise.all(n.map((u) => s(u.id).catch(() => null)))).filter((u) => u != null) : [], a = oe(t.series, []), l = oe(t.extensions, []);
  oe(t.datasources, []);
  const d = oe(t.rules, []), c = oe(t.queries, []);
  return {
    entries: Us({
      series: a,
      extensions: l,
      flows: o,
      descriptors: r,
      rules: d,
      queries: c
    }),
    installed: l
  };
}
function oe(e, t) {
  return (e == null ? void 0 : e.status) === "ready" ? e.data : t;
}
function Xi(e, t) {
  const [n, r] = M({
    entries: [],
    installed: [],
    loading: !0
  }), s = J(e);
  return s.current = e, ee(() => {
    const o = s.current;
    let a = !1;
    return r((l) => ({ ...l, loading: !0 })), (async () => {
      const { entries: l, installed: d } = await Zs(o);
      a || r({ entries: l, installed: d, loading: !1 });
    })(), () => {
      a = !0;
    };
  }, [t]), n;
}
const Xs = [
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
function Ji(e) {
  return e.map((t) => ({
    kind: "datasource",
    id: `datasource:${t.name}`,
    name: t.name,
    rowKind: t.kind,
    endpoint: t.endpoint
  }));
}
function ea(e) {
  return e.tables.map((t) => ({
    kind: "table",
    id: `table:${t.name}`,
    table: t.name
  }));
}
function ta(e) {
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
function na(e) {
  return e.map((t) => ({ kind: "series", id: `series:${t}`, name: t }));
}
function Js(e) {
  return e.map((t) => ({ kind: "channel", id: `channel:${t.id}`, name: t.id }));
}
function eo(e) {
  return e.map((t) => ({
    kind: "insight",
    id: `insight:${t.id}`,
    title: t.title,
    severity: t.severity,
    status: t.status
  }));
}
function to(e) {
  return e.map((t) => ({ kind: "inbox", id: `inbox:${t.id}`, channel: t.channel }));
}
function ra(e) {
  return e.map((t) => ({
    kind: "query",
    id: `query:${t.id}`,
    name: t.name || t.id,
    target: t.target
  }));
}
function no(e) {
  const t = [];
  return e.listDatasources && t.push("datasources"), e.readSchema && t.push("schema"), e.listSeries && t.push("series"), e.listChannels && t.push("channels"), e.listInsights && t.push("insights"), e.listInbox && t.push("inbox"), e.listQueries && t.push("queries"), e.listExtensions && t.push("extensions"), e.listRules && t.push("rules"), e.listFlows && t.push("flowSummaries"), e.listFlowNodes && t.push("flowDescriptors"), t;
}
function At(e) {
  const t = {};
  for (const n of no(e))
    t[n] = { status: "idle" };
  return t;
}
function sa(e, t) {
  const [n, r] = M(() => At(e)), s = J(e);
  s.current = e, ee(() => {
    r(At(s.current));
  }, [t]);
  const o = F((a) => {
    r((l) => {
      const d = l[a];
      if (d && d.status !== "idle") return l;
      const c = { ...l, [a]: { status: "loading" } };
      return vn(s.current, a).then((u) => {
        u && r((w) => ({ ...w, [a]: u }));
      }), c;
    });
  }, []);
  return { sections: n, loadSection: o };
}
const kn = [
  { group: "series", label: "Series" },
  { group: "live", label: "Live (Zenoh)" },
  { group: "sql", label: "Direct SurrealDB" },
  { group: "extension", label: "Installed extension" },
  { group: "widget", label: "Extension widgets" },
  { group: "flows", label: "Flows" },
  { group: "rules", label: "Rules" },
  { group: "queries", label: "Saved queries" }
], oa = [
  { group: "series", label: "Series" },
  { group: "live", label: "Live (Zenoh)" },
  { group: "sql", label: "Direct SurrealDB" },
  { group: "extension", label: "Installed extension" },
  { group: "action", label: "Action (control)" },
  { group: "widget", label: "Extension widgets" }
];
function ia({
  entries: e,
  value: t = "",
  onSelect: n,
  loading: r = !1,
  groups: s = kn,
  "aria-label": o = "source",
  className: a
}) {
  const l = (d) => {
    const c = e.find((u) => u.id === d) ?? null;
    n(c ? xn(c) : null);
  };
  return /* @__PURE__ */ i("label", { className: `sp-root${a ? ` ${a}` : ""}`, children: /* @__PURE__ */ b(
    "select",
    {
      className: "sp-select",
      "aria-label": o,
      value: t,
      onChange: (d) => l(d.target.value),
      children: [
        /* @__PURE__ */ i("option", { value: "", children: r ? "loading sources…" : "— pick a source —" }),
        s.map(({ group: d, label: c }) => /* @__PURE__ */ i(ro, { entries: e, group: d, label: c }, d))
      ]
    }
  ) });
}
function ro({
  entries: e,
  group: t,
  label: n
}) {
  const r = e.filter((s) => s.group === t);
  return r.length === 0 ? null : /* @__PURE__ */ i("optgroup", { label: n, children: r.map((s) => /* @__PURE__ */ i("option", { value: s.id, children: s.label }, s.id)) });
}
function aa({
  entries: e,
  value: t = "",
  onSelect: n,
  onSelectEntry: r,
  loading: s = !1,
  groups: o = kn,
  "aria-label": a = "source",
  className: l,
  placeholder: d = "Search sources…",
  autoFocus: c = !1
}) {
  const [u, w] = M(""), [y, x] = M(!1), [m, h] = M(0), v = J(null), C = e.find(($) => $.id === t) ?? null, N = me(() => {
    const $ = u.trim().toLowerCase(), T = [];
    for (const { group: A, label: f } of o)
      e.filter(
        (V) => V.group === A && ($ === "" || V.label.toLowerCase().includes($) || f.toLowerCase().includes($))
      ).forEach((V, Y) => T.push({ entry: V, groupLabel: f, firstOfGroup: Y === 0 }));
    return T;
  }, [e, o, u]), _ = ($) => {
    n($ ? xn($) : null), r == null || r($), x(!1), w("");
  }, S = ($) => {
    $.key === "ArrowDown" ? ($.preventDefault(), x(!0), h((T) => Math.min(T + 1, N.length - 1))) : $.key === "ArrowUp" ? ($.preventDefault(), h((T) => Math.max(T - 1, 0))) : $.key === "Enter" ? ($.preventDefault(), y && N[m] && _(N[m].entry)) : $.key === "Escape" && x(!1);
  };
  return /* @__PURE__ */ b("div", { className: `sp-root sp-combo${l ? ` ${l}` : ""}`, children: [
    /* @__PURE__ */ i(
      "input",
      {
        className: "sp-combo-input",
        role: "combobox",
        "aria-expanded": y,
        "aria-label": a,
        "aria-autocomplete": "list",
        autoFocus: c,
        value: y ? u : (C == null ? void 0 : C.label) ?? "",
        placeholder: s ? "loading sources…" : C ? C.label : d,
        onFocus: () => x(!0),
        onBlur: () => setTimeout(() => x(!1), 120),
        onChange: ($) => {
          w($.target.value), x(!0), h(0);
        },
        onKeyDown: S
      }
    ),
    y && /* @__PURE__ */ b("ul", { className: "sp-combo-list", role: "listbox", "aria-label": a, ref: v, children: [
      N.length === 0 && /* @__PURE__ */ i("li", { className: "sp-combo-empty", children: "No matching sources" }),
      N.map(($, T) => /* @__PURE__ */ b("li", { role: "presentation", children: [
        $.firstOfGroup && /* @__PURE__ */ i("div", { className: "sp-combo-group", children: $.groupLabel }),
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            role: "option",
            "aria-selected": T === m,
            className: `sp-combo-option${T === m ? " is-active" : ""}${$.entry.id === t ? " is-selected" : ""}`,
            onMouseDown: (A) => {
              A.preventDefault(), _($.entry);
            },
            onMouseEnter: () => h(T),
            children: $.entry.label
          }
        )
      ] }, $.entry.id))
    ] })
  ] });
}
function so({ spec: e, state: t, onOpen: n, defaultOpen: r, children: s }) {
  const [o, a] = M(r ?? t.status !== "idle"), l = t.status === "idle", d = (c) => {
    a(c), c && l && n && n();
  };
  return /* @__PURE__ */ b(
    fe.Root,
    {
      className: "sp-catalog-section",
      "aria-label": `section ${e.label}`,
      open: o,
      onOpenChange: d,
      children: [
        /* @__PURE__ */ b(
          fe.Trigger,
          {
            className: "sp-catalog-section-head",
            "aria-label": `toggle section ${e.label}`,
            children: [
              /* @__PURE__ */ i(Ot, { className: "sp-catalog-section-chevron" }),
              /* @__PURE__ */ i("h3", { className: "sp-catalog-section-title", children: e.label }),
              /* @__PURE__ */ i("p", { className: "sp-catalog-section-hint", children: e.hint })
            ]
          }
        ),
        /* @__PURE__ */ i(fe.Content, { className: "sp-catalog-section-content", children: oo(t, s) })
      ]
    }
  );
}
function oo(e, t) {
  return e.status === "idle" ? /* @__PURE__ */ i("p", { className: "sp-catalog-idle", children: "Expand to load." }) : e.status === "loading" ? /* @__PURE__ */ i("div", { "aria-label": "loading", className: "sp-catalog-skeleton" }) : e.status === "denied" ? /* @__PURE__ */ i("p", { "aria-label": "denied", className: "sp-catalog-denied", children: "Not permitted." }) : t(e.data);
}
function ue({ children: e }) {
  return /* @__PURE__ */ i("p", { className: "sp-catalog-empty", children: e });
}
function io({ schema: e, onSelect: t }) {
  return /* @__PURE__ */ i("ul", { "aria-label": "schema browser", className: "sp-catalog-tree", children: e.tables.map((n) => /* @__PURE__ */ i(ao, { name: n.name, columns: n.columns.map((r) => r.name), onSelect: t }, n.name)) });
}
function ao({
  name: e,
  columns: t,
  onSelect: n
}) {
  return /* @__PURE__ */ i("li", { children: /* @__PURE__ */ b(fe.Root, { className: "group/collapsible sp-catalog-tree-row", defaultOpen: !1, children: [
    /* @__PURE__ */ b("div", { className: "sp-catalog-tree-row-inner", children: [
      /* @__PURE__ */ i(
        fe.Trigger,
        {
          "aria-label": `toggle table ${e}`,
          className: "sp-catalog-toggle",
          children: /* @__PURE__ */ i(Ot, { className: "sp-catalog-chevron" })
        }
      ),
      /* @__PURE__ */ b(
        "button",
        {
          type: "button",
          "aria-label": `insert table ${e}`,
          className: "sp-catalog-tree-table",
          onClick: () => n({ kind: "table", id: `table:${e}`, table: e }),
          children: [
            /* @__PURE__ */ i(In, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
            /* @__PURE__ */ i("span", { className: "sp-catalog-tree-table-name", children: e })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ i(fe.Content, { className: "sp-catalog-tree-content", children: /* @__PURE__ */ i("ul", { className: "sp-catalog-tree-columns", children: t.length === 0 ? /* @__PURE__ */ i("li", { className: "sp-catalog-tree-no-columns", children: "no columns" }) : t.map((r) => /* @__PURE__ */ i("li", { children: /* @__PURE__ */ i(
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
function la({
  sections: e,
  onSelect: t,
  onLoadSection: n,
  sectionSpecs: r = Xs,
  className: s
}) {
  return /* @__PURE__ */ i("div", { "aria-label": "data explorer", className: `sp-root sp-catalog${s ? ` ${s}` : ""}`, children: r.map((o) => {
    const a = e[o.kind];
    return a ? /* @__PURE__ */ i(
      so,
      {
        spec: o,
        state: a,
        onOpen: n ? () => n(o.kind) : void 0,
        children: (l) => lo(o.kind, l, t)
      },
      o.kind
    ) : null;
  }) });
}
function lo(e, t, n) {
  switch (e) {
    case "datasources": {
      const r = t ?? [];
      return r.length === 0 ? /* @__PURE__ */ i(ue, { children: "No external datasources registered." }) : /* @__PURE__ */ i("ul", { className: "sp-catalog-list", children: r.map((s) => /* @__PURE__ */ i("li", { children: /* @__PURE__ */ b(
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
            /* @__PURE__ */ b("span", { className: "sp-catalog-row-label", children: [
              /* @__PURE__ */ i(Pn, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
              s.name
            ] }),
            /* @__PURE__ */ i("span", { className: "sp-catalog-row-sub", children: s.endpoint ? `${s.kind} · ${s.endpoint}` : s.kind })
          ]
        }
      ) }, s.name)) });
    }
    case "schema": {
      const r = t;
      return r.tables.length === 0 ? /* @__PURE__ */ i(ue, { children: "No local tables yet." }) : /* @__PURE__ */ i(io, { schema: r, onSelect: n });
    }
    case "series": {
      const r = t ?? [];
      return r.length === 0 ? /* @__PURE__ */ i(ue, { children: "No series in this workspace." }) : /* @__PURE__ */ i("ul", { className: "sp-catalog-list", children: r.map((s) => /* @__PURE__ */ i("li", { children: /* @__PURE__ */ b(
        "button",
        {
          type: "button",
          "aria-label": `insert series ${s}`,
          className: "sp-catalog-row sp-catalog-row-series",
          onClick: () => n({ kind: "series", id: `series:${s}`, name: s }),
          children: [
            /* @__PURE__ */ i(An, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
            s
          ]
        }
      ) }, s)) });
    }
    case "channels": {
      const r = t ?? [];
      return r.length === 0 ? /* @__PURE__ */ i(ue, { children: "No channels registered." }) : /* @__PURE__ */ i("ul", { className: "sp-catalog-list", children: r.map((s) => {
        const o = Js([s])[0];
        return /* @__PURE__ */ i("li", { children: /* @__PURE__ */ b(
          "button",
          {
            type: "button",
            "aria-label": `insert channel ${s.id}`,
            className: "sp-catalog-row sp-catalog-row-channel",
            onClick: () => n(o),
            children: [
              /* @__PURE__ */ i(zn, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
              s.id
            ]
          }
        ) }, o.id);
      }) });
    }
    case "insights": {
      const r = t ?? [];
      return r.length === 0 ? /* @__PURE__ */ i(ue, { children: "No insights in this workspace." }) : /* @__PURE__ */ i("ul", { className: "sp-catalog-list", children: r.map((s) => {
        const o = eo([s])[0];
        return /* @__PURE__ */ i("li", { children: /* @__PURE__ */ b(
          "button",
          {
            type: "button",
            "aria-label": `insert insight ${s.title}`,
            className: "sp-catalog-row sp-catalog-row-insight",
            onClick: () => n(o),
            children: [
              /* @__PURE__ */ b("span", { className: "sp-catalog-row-label", children: [
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
      return r.length === 0 ? /* @__PURE__ */ i(ue, { children: "No items in this inbox." }) : /* @__PURE__ */ i("ul", { className: "sp-catalog-list", children: r.map((s) => {
        const o = to([s])[0];
        return /* @__PURE__ */ i("li", { children: /* @__PURE__ */ b(
          "button",
          {
            type: "button",
            "aria-label": `insert inbox item ${s.id}`,
            className: "sp-catalog-row sp-catalog-row-inbox",
            onClick: () => n(o),
            children: [
              /* @__PURE__ */ b("span", { className: "sp-catalog-row-label", children: [
                /* @__PURE__ */ i(Dn, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
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
const co = ["info", "warning", "critical"];
function ca(e) {
  return co.indexOf(e);
}
function uo(e) {
  return e === "critical" ? "destructive" : e === "warning" ? "warning" : "accent-2";
}
function da(e) {
  switch (e) {
    case "critical":
      return "hsl(var(--destructive))";
    case "warning":
      return "hsl(var(--warning))";
    default:
      return "hsl(var(--accent-2))";
  }
}
function mo(e) {
  return e === "open" ? "default" : e === "acked" ? "warning" : "success";
}
function fo(e, t = Date.now()) {
  const n = Math.max(1, Math.floor((t - e) / 1e3));
  if (n < 60) return `${n}s ago`;
  const r = Math.floor(n / 60);
  if (r < 60) return n % 60 ? `${r}m ${n % 60}s ago` : `${r}m ago`;
  const s = Math.floor(r / 60);
  return s < 24 ? r % 60 ? `${s}h ${r % 60}m ago` : `${s}h ago` : `${Math.floor(s / 24)}d ago`;
}
function ho(e) {
  const t = `${e.kind}:${e.ref}`;
  return e.run ? `${t} · run:${e.run}` : t;
}
function po(e, t) {
  const [n, r] = M([]), [s, o] = M(null), [a, l] = M(!1), [d, c] = M(null), [u, w] = M(null), [y, x] = M(t), m = J(e);
  m.current = e;
  const h = F(async () => {
    l(!0);
    try {
      const S = await m.current.list({ ...y, cursor: void 0 });
      r(S.items), w(S.next ?? null), o(null);
    } catch (S) {
      o(S instanceof Error ? S.message : String(S));
    } finally {
      l(!1);
    }
  }, [y]), v = F(async () => {
    if (u) {
      l(!0);
      try {
        const S = await m.current.list({ ...y, cursor: u });
        r(($) => {
          const T = new Set($.map((A) => A.id));
          return [...$, ...S.items.filter((A) => !T.has(A.id))];
        }), w(S.next ?? null), o(null);
      } catch (S) {
        o(S instanceof Error ? S.message : String(S));
      } finally {
        l(!1);
      }
    }
  }, [y, u]);
  ee(() => {
    h();
  }, [h]);
  const C = J(h);
  C.current = h, ee(() => {
    const S = m.current.subscribe;
    return S ? S(() => {
      C.current();
    }) : void 0;
  }, []);
  const N = F((S) => {
    x(S);
  }, []), _ = F(
    async (S, $) => {
      c(S);
      try {
        $ === "ack" ? await m.current.ack(S) : await m.current.resolve(S), await h();
      } catch (T) {
        o(T instanceof Error ? T.message : String(T));
      } finally {
        c(null);
      }
    },
    [h]
  );
  return {
    items: n,
    error: s,
    loading: a,
    actingOn: d,
    nextCursor: u,
    refresh: h,
    loadMore: v,
    setFilter: N,
    act: _
  };
}
function ua(e, t, n = 50) {
  const [r, s] = M(null), [o, a] = M(null), [l, d] = M(null), [c, u] = M(!0), [w, y] = M(null), [x, m] = M(0), h = J(e);
  h.current = e, ee(() => {
    let N = !1;
    return (async () => {
      d(null), u(!0);
      try {
        const [_, S] = await Promise.all([
          h.current.get(t),
          h.current.occurrences(t, void 0, n)
        ]);
        if (N) return;
        s(_), a(S);
      } catch (_) {
        if (N) return;
        d(_ instanceof Error ? _.message : String(_));
      } finally {
        N || u(!1);
      }
    })(), () => {
      N = !0;
    };
  }, [t, n, x]);
  const v = F(() => m((N) => N + 1), []), C = F(
    async (N) => {
      y(N), d(null);
      try {
        N === "ack" ? await h.current.ack(t) : await h.current.resolve(t), m((_) => _ + 1);
      } catch (_) {
        d(_ instanceof Error ? _.message : String(_));
      } finally {
        y(null);
      }
    },
    [t]
  );
  return { insight: r, occurrences: o, error: l, loading: c, actingOn: w, refresh: v, act: C };
}
function bo({ severity: e }) {
  return /* @__PURE__ */ i("span", { className: `ins-badge tone-${uo(e)}`, children: e });
}
function go({ status: e }) {
  return /* @__PURE__ */ i("span", { className: `ins-badge tone-${mo(e)}`, children: e });
}
function wo({
  insight: e,
  selected: t,
  onSelect: n,
  showStatus: r = !0,
  showSeverity: s = !1,
  actions: o,
  now: a
}) {
  const l = e.severity === "critical" ? "is-critical" : e.severity === "warning" ? "is-warning" : "is-info", d = /* @__PURE__ */ b(Rn, { children: [
    /* @__PURE__ */ i("span", { className: `ins-dot ${l}`, role: "img", "aria-label": `severity: ${e.severity}` }),
    /* @__PURE__ */ b("span", { className: "ins-row-main", children: [
      /* @__PURE__ */ i("span", { className: "ins-row-title", children: e.title }),
      /* @__PURE__ */ b("span", { className: "ins-row-meta", children: [
        ho(e.origin),
        " · ×",
        e.count
      ] })
    ] }),
    /* @__PURE__ */ b("span", { className: "ins-row-side", children: [
      s && /* @__PURE__ */ i(bo, { severity: e.severity }),
      r && /* @__PURE__ */ i(go, { status: e.status }),
      /* @__PURE__ */ i("span", { className: "ins-time", children: fo(e.last_ts, a) })
    ] })
  ] });
  return /* @__PURE__ */ b("li", { children: [
    n ? /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        className: `ins-row${t ? " is-selected" : ""}`,
        "aria-selected": t,
        "aria-label": `select insight ${e.dedup_key}`,
        onClick: () => n(e.id),
        children: d
      }
    ) : /* @__PURE__ */ i("div", { className: `ins-row${t ? " is-selected" : ""}`, children: d }),
    o
  ] });
}
function xo({
  insight: e,
  actingOn: t = null,
  onAck: n,
  onResolve: r,
  onDismiss: s
}) {
  const o = t !== null;
  return /* @__PURE__ */ b("div", { className: "ins-actions", children: [
    s && /* @__PURE__ */ b("button", { type: "button", className: "ins-btn", onClick: s, disabled: o, children: [
      /* @__PURE__ */ i(Lt, { size: 13 }),
      "Dismiss"
    ] }),
    e.status === "open" && n && /* @__PURE__ */ b("button", { type: "button", className: "ins-btn", onClick: n, disabled: o, children: [
      t === "ack" ? /* @__PURE__ */ i(Me, { size: 13, className: "ins-spin" }) : /* @__PURE__ */ i(Pt, { size: 13 }),
      "Ack"
    ] }),
    e.status !== "resolved" && r && /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        className: "ins-btn is-primary",
        onClick: r,
        disabled: o,
        children: [
          t === "resolve" ? /* @__PURE__ */ i(Me, { size: 13, className: "ins-spin" }) : /* @__PURE__ */ i(ht, { size: 13 }),
          "Resolve"
        ]
      }
    ),
    e.status === "resolved" && /* @__PURE__ */ b("span", { className: "ins-badge tone-success", children: [
      /* @__PURE__ */ i(ht, { size: 12 }),
      " Resolved"
    ] })
  ] });
}
const yo = { limit: 20 };
function Nn({
  client: e,
  filter: t = yo,
  title: n = "Insights",
  interactive: r = !1,
  showRefresh: s = !0,
  paged: o = !0,
  onSelect: a,
  now: l
}) {
  const d = po(e, t), [c, u] = M(/* @__PURE__ */ new Set()), [w, y] = M(null);
  function x(h, v) {
    y(v), d.act(h, v).finally(() => y(null));
  }
  const m = d.items.filter((h) => !c.has(h.id));
  return /* @__PURE__ */ b("div", { className: "ins-root", children: [
    /* @__PURE__ */ b("div", { className: "ins-header", children: [
      /* @__PURE__ */ b("h3", { className: "ins-header-title", children: [
        /* @__PURE__ */ i(Ue, { size: 15 }),
        n,
        m.length > 0 && /* @__PURE__ */ b("span", { className: "ins-header-count", children: [
          "(",
          m.length,
          ")"
        ] })
      ] }),
      s && /* @__PURE__ */ i("div", { className: "ins-header-actions", children: /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: "ins-btn",
          onClick: () => void d.refresh(),
          disabled: d.loading,
          "aria-label": "Refresh insights",
          children: /* @__PURE__ */ i(Me, { size: 13, className: d.loading ? "ins-spin" : void 0 })
        }
      ) })
    ] }),
    d.error && m.length === 0 ? /* @__PURE__ */ i("div", { className: "ins-error", role: "alert", children: d.error }) : m.length === 0 ? /* @__PURE__ */ b("div", { className: "ins-empty", children: [
      /* @__PURE__ */ i(Ue, { size: 16, className: d.loading ? "ins-spin" : void 0 }),
      d.loading ? "Loading insights…" : "No insights match this filter."
    ] }) : /* @__PURE__ */ i("ul", { className: "ins-list", children: m.map((h) => /* @__PURE__ */ i(
      wo,
      {
        insight: h,
        onSelect: a,
        now: l,
        actions: r ? /* @__PURE__ */ i(
          xo,
          {
            insight: h,
            actingOn: d.actingOn === h.id ? w : null,
            onAck: h.status === "open" ? () => x(h.id, "ack") : void 0,
            onResolve: () => x(h.id, "resolve"),
            onDismiss: () => u((v) => new Set(v).add(h.id))
          }
        ) : void 0
      },
      h.id
    )) }),
    o && d.nextCursor !== null && m.length > 0 && /* @__PURE__ */ i("div", { className: "ins-more", children: /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        className: "ins-btn",
        onClick: () => void d.loadMore(),
        disabled: d.loading,
        "aria-label": "Load more insights",
        children: [
          /* @__PURE__ */ i(Me, { size: 13, className: d.loading ? "ins-spin" : void 0 }),
          "Load more"
        ]
      }
    ) })
  ] });
}
function ma(e) {
  return /* @__PURE__ */ i(Nn, { ...e, interactive: !1 });
}
function fa(e) {
  return /* @__PURE__ */ i(Nn, { ...e, interactive: !0 });
}
function ha(e) {
  const t = [...e];
  function n() {
    return [...t].sort((r, s) => s.last_ts - r.last_ts || s.id.localeCompare(r.id));
  }
  return {
    async list(r) {
      let s = n();
      r.status && (s = s.filter((c) => c.status === r.status)), r.severity && (s = s.filter((c) => c.severity === r.severity)), r.origin_ref && (s = s.filter((c) => c.origin.ref.includes(r.origin_ref)));
      const o = r.limit ?? 50, a = s.slice(0, o), l = s.length > o ? { ts: a[a.length - 1].last_ts, id: a[a.length - 1].id } : void 0;
      return { items: a.map(({ evidence: c, ...u }) => u), next: l };
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
function pa() {
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
  return ot(ze(e));
}
function vo({ ...e }) {
  return /* @__PURE__ */ i(j.Root, { ...e });
}
function ko({ ...e }) {
  return /* @__PURE__ */ i(j.Portal, { ...e });
}
const No = z.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ i(
    j.Overlay,
    {
      ref: r,
      className: B("fixed inset-0 z-50 bg-black/50", t),
      ...n
    }
  );
}), Co = z.forwardRef(function({ className: t, children: n, ...r }, s) {
  return /* @__PURE__ */ b(ko, { children: [
    /* @__PURE__ */ i(No, {}),
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
}), So = z.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ i(j.Title, { ref: r, className: B("text-base font-semibold text-lbp-fg", t), ...n });
}), $o = z.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ i(j.Description, { ref: r, className: B("text-xs text-lbp-muted", t), ...n });
});
function Eo({ resizable: e, className: t, "aria-label": n = "resize panel" }) {
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
function Ro({ initial: e, min: t, max: n, step: r = 24 }) {
  const s = F((m) => Math.min(n, Math.max(t, m)), [t, n]), [o, a] = M(() => s(e)), [l, d] = M(!1), c = J(null), u = F(
    (m) => {
      c.current = { x: m.clientX, w: o }, d(!0), m.currentTarget.setPointerCapture(m.pointerId), m.preventDefault();
    },
    [o]
  ), w = F(
    (m) => {
      if (!c.current) return;
      const h = c.current.x - m.clientX;
      a(s(c.current.w + h));
    },
    [s]
  ), y = F((m) => {
    c.current = null, d(!1), m.currentTarget.hasPointerCapture(m.pointerId) && m.currentTarget.releasePointerCapture(m.pointerId);
  }, []), x = F(
    (m) => {
      m.key === "ArrowLeft" ? (a((h) => s(h + r)), m.preventDefault()) : m.key === "ArrowRight" && (a((h) => s(h - r)), m.preventDefault());
    },
    [s, r]
  );
  return { width: o, dragging: l, handleProps: { onPointerDown: u, onPointerMove: w, onPointerUp: y, onKeyDown: x } };
}
function ba({
  open: e,
  onOpenChange: t,
  title: n,
  description: r,
  headerAside: s,
  footer: o,
  "aria-label": a,
  initialWidth: l = 720,
  minWidth: d = 360,
  maxWidth: c = 1200,
  className: u,
  children: w
}) {
  const y = Ro({ initial: l, min: d, max: c });
  return /* @__PURE__ */ i(vo, { open: e, onOpenChange: t, children: /* @__PURE__ */ b(
    Co,
    {
      "aria-label": a,
      style: { width: y.width },
      className: B(y.dragging && "select-none", u),
      children: [
        /* @__PURE__ */ i(Eo, { resizable: y }),
        /* @__PURE__ */ b("header", { className: "flex items-start justify-between gap-3 border-b border-lbp-border bg-lbp-secondary px-4 py-3", children: [
          /* @__PURE__ */ b("div", { className: "min-w-0", children: [
            /* @__PURE__ */ i(So, { children: n }),
            r ? /* @__PURE__ */ i($o, { className: "mt-0.5", children: r }) : null
          ] }),
          s ? /* @__PURE__ */ i("div", { className: "shrink-0", children: s }) : null
        ] }),
        /* @__PURE__ */ i("div", { className: "min-h-0 flex-1 overflow-auto", children: w }),
        o ? /* @__PURE__ */ i("footer", { className: "flex items-center justify-end gap-2 border-t border-lbp-border bg-lbp-secondary px-4 py-3", children: o }) : null
      ]
    }
  ) });
}
function ga({ title: e, aside: t, className: n, children: r }) {
  return /* @__PURE__ */ b("section", { className: B("mb-4 last:mb-0", n), children: [
    /* @__PURE__ */ b("div", { className: "mb-1.5 flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ i("div", { className: "text-[10px] font-semibold uppercase tracking-wide text-lbp-muted", children: e }),
      t
    ] }),
    r
  ] });
}
function wa({ columns: e, rows: t, empty: n = "—", className: r }) {
  return t.length === 0 ? /* @__PURE__ */ i("div", { className: "py-1 font-mono text-[11px] text-lbp-muted", children: n }) : /* @__PURE__ */ b("table", { className: B("w-full border-collapse font-mono text-[11px] tabular-nums", r), children: [
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
function xa({ k: e, v: t, keyWidth: n = 80, className: r }) {
  return /* @__PURE__ */ b("div", { className: B("flex gap-2 py-[2px] font-mono text-[11px]", r), children: [
    /* @__PURE__ */ i("span", { style: { width: n }, className: "shrink-0 text-lbp-muted", children: e }),
    /* @__PURE__ */ i("span", { className: "min-w-0 break-words text-lbp-fg", children: t })
  ] });
}
function Cn(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  for (const r of e)
    n.has(r.group) || (n.set(r.group, []), t.push(r.group)), n.get(r.group).push(r);
  return t.map((r) => ({ label: r, items: n.get(r) }));
}
const Ve = 768;
function _o() {
  const [e, t] = z.useState(void 0);
  return z.useEffect(() => {
    if (!window.matchMedia) {
      t(window.innerWidth < Ve);
      return;
    }
    const n = window.matchMedia(`(max-width: ${Ve - 1}px)`), r = () => t(window.innerWidth < Ve);
    return n.addEventListener("change", r), r(), () => n.removeEventListener("change", r);
  }, []), !!e;
}
function D(...e) {
  return ot(ze(e));
}
const Mo = nt(
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
), To = z.forwardRef(function({ className: t, variant: n, size: r, asChild: s = !1, ...o }, a) {
  return /* @__PURE__ */ i(s ? Xe : "button", { ref: a, className: D(Mo({ variant: n, size: r, className: t })), ...o });
});
function Io({ ...e }) {
  return /* @__PURE__ */ i(j.Root, { ...e });
}
function Do({ ...e }) {
  return /* @__PURE__ */ i(j.Portal, { ...e });
}
const zo = z.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ i(
    j.Overlay,
    {
      ref: r,
      className: D("fixed inset-0 z-50 bg-black/50 animate-in fade-in-0", t),
      ...n
    }
  );
}), Ao = z.forwardRef(function({ className: t, children: n, side: r = "right", ...s }, o) {
  return /* @__PURE__ */ b(Do, { children: [
    /* @__PURE__ */ i(zo, {}),
    /* @__PURE__ */ b(
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
          /* @__PURE__ */ b(j.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nr-accent/25", children: [
            /* @__PURE__ */ i(Lt, { className: "h-4 w-4" }),
            /* @__PURE__ */ i("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
});
function Po({ className: e, ...t }) {
  return /* @__PURE__ */ i("div", { className: D("flex flex-col gap-1.5 p-4", e), ...t });
}
const Oo = z.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ i(j.Title, { ref: r, className: D("font-semibold text-nr-fg", t), ...n });
}), Lo = z.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ i(j.Description, { ref: r, className: D("text-sm text-nr-muted", t), ...n });
});
function Go({
  delayDuration: e = 0,
  ...t
}) {
  return /* @__PURE__ */ i(xe.Provider, { delayDuration: e, ...t });
}
function jo({ ...e }) {
  return /* @__PURE__ */ i(xe.Root, { ...e });
}
function Fo({ ...e }) {
  return /* @__PURE__ */ i(xe.Trigger, { ...e });
}
function Wo({
  className: e,
  sideOffset: t = 6,
  ...n
}) {
  return /* @__PURE__ */ i(xe.Portal, { children: /* @__PURE__ */ i(
    xe.Content,
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
const Ko = "nav_rail_state", qo = 60 * 60 * 24 * 7, Bo = "16rem", Vo = "18rem", Uo = "3.5rem", Qo = "b", Sn = z.createContext(null);
function Z() {
  const e = z.useContext(Sn);
  if (!e)
    throw new Error("useSidebar must be used within a SidebarProvider.");
  return e;
}
function Yo({
  defaultOpen: e = !0,
  open: t,
  onOpenChange: n,
  className: r,
  style: s,
  children: o,
  ...a
}) {
  const l = _o(), [d, c] = z.useState(!1), [u, w] = z.useState(e), y = t ?? u, x = z.useCallback(
    (C) => {
      const N = typeof C == "function" ? C(y) : C;
      n ? n(N) : w(N), document.cookie = `${Ko}=${N}; path=/; max-age=${qo}`;
    },
    [y, n]
  ), m = z.useCallback(() => l ? c((C) => !C) : x((C) => !C), [l, x]);
  z.useEffect(() => {
    const C = (N) => {
      N.key === Qo && (N.metaKey || N.ctrlKey) && (N.preventDefault(), m());
    };
    return window.addEventListener("keydown", C), () => window.removeEventListener("keydown", C);
  }, [m]);
  const h = y ? "expanded" : "collapsed", v = z.useMemo(
    () => ({
      state: h,
      open: y,
      setOpen: x,
      isMobile: l,
      openMobile: d,
      setOpenMobile: c,
      toggleSidebar: m
    }),
    [h, y, x, l, d, m]
  );
  return /* @__PURE__ */ i(Sn.Provider, { value: v, children: /* @__PURE__ */ i(Go, { delayDuration: 0, children: /* @__PURE__ */ i(
    "div",
    {
      "data-slot": "sidebar-wrapper",
      style: {
        "--sidebar-width": Bo,
        "--sidebar-width-icon": Uo,
        ...s
      },
      className: D("group/sidebar-wrapper flex h-full min-h-0 w-full", r),
      ...a,
      children: o
    }
  ) }) });
}
function Ho({
  side: e = "left",
  variant: t = "sidebar",
  collapsible: n = "offcanvas",
  className: r,
  children: s,
  ...o
}) {
  const { isMobile: a, state: l, openMobile: d, setOpenMobile: c } = Z(), u = l === "collapsed" && n !== "none", w = t === "floating" || t === "inset";
  if (n === "none")
    return /* @__PURE__ */ i("div", { className: D("flex h-full w-[var(--sidebar-width)] flex-col bg-nr-panel text-nr-fg", r), ...o, children: s });
  if (a)
    return /* @__PURE__ */ i(Io, { open: d, onOpenChange: c, ...o, children: /* @__PURE__ */ b(
      Ao,
      {
        "data-sidebar": "sidebar",
        "data-mobile": "true",
        className: "w-[var(--sidebar-width)] bg-nr-panel p-0 text-nr-fg [&>button]:hidden",
        style: { "--sidebar-width": Vo },
        side: e,
        children: [
          /* @__PURE__ */ b(Po, { className: "sr-only", children: [
            /* @__PURE__ */ i(Oo, { children: "Sidebar" }),
            /* @__PURE__ */ i(Lo, { children: "Displays the mobile sidebar." })
          ] }),
          /* @__PURE__ */ i("div", { className: "flex h-full w-full flex-col", children: s })
        ]
      }
    ) });
  const y = "w-[var(--sidebar-width)]", x = w ? "w-[calc(var(--sidebar-width-icon)+1rem)]" : "w-[var(--sidebar-width-icon)]";
  return /* @__PURE__ */ b(
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
              u && n === "offcanvas" ? "w-0" : u ? x : y
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
              u && n === "icon" ? x : y,
              w && "p-2",
              !w && "border-r border-nr-border",
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
                  w && "rounded-lg border border-nr-border shadow-sm"
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
function Zo({
  className: e,
  onClick: t,
  ...n
}) {
  const { toggleSidebar: r } = Z();
  return /* @__PURE__ */ b(
    To,
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
        /* @__PURE__ */ i(On, { className: "h-4 w-4" }),
        /* @__PURE__ */ i("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
}
function Xo({ className: e, ...t }) {
  const { toggleSidebar: n } = Z();
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
function Jo({ className: e, ...t }) {
  const { state: n } = Z();
  return /* @__PURE__ */ i(
    "div",
    {
      "data-sidebar": "header",
      className: D("flex flex-col gap-2 p-2", n === "collapsed" && "items-center px-0", e),
      ...t
    }
  );
}
function ei({ className: e, ...t }) {
  const { state: n } = Z();
  return /* @__PURE__ */ i(
    "div",
    {
      "data-sidebar": "footer",
      className: D("flex flex-col gap-2 p-2", n === "collapsed" && "items-center px-0", e),
      ...t
    }
  );
}
function ti({ className: e, ...t }) {
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
function ni({ className: e, ...t }) {
  const { state: n } = Z();
  return /* @__PURE__ */ i(
    "div",
    {
      "data-sidebar": "group",
      className: D("relative flex w-full min-w-0 flex-col p-2", n === "collapsed" && "items-center px-0", e),
      ...t
    }
  );
}
function ri({ className: e, ...t }) {
  const { state: n } = Z();
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
function si({ className: e, ...t }) {
  return /* @__PURE__ */ i("div", { "data-sidebar": "group-content", className: D("w-full text-sm", e), ...t });
}
function oi({ className: e, ...t }) {
  const { state: n } = Z();
  return /* @__PURE__ */ i(
    "ul",
    {
      "data-sidebar": "menu",
      className: D("flex w-full min-w-0 flex-col gap-1", n === "collapsed" && "items-center", e),
      ...t
    }
  );
}
function ii({ className: e, ...t }) {
  return /* @__PURE__ */ i("li", { "data-sidebar": "menu-item", className: D("group/menu-item relative", e), ...t });
}
const ai = nt(
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
function li({
  asChild: e = !1,
  isActive: t = !1,
  variant: n = "default",
  size: r = "default",
  tooltip: s,
  className: o,
  ...a
}) {
  const l = e ? Xe : "button", { isMobile: d, state: c } = Z(), u = /* @__PURE__ */ i(
    l,
    {
      "data-sidebar": "menu-button",
      "data-size": r,
      "data-active": t,
      className: D(
        ai({ variant: n, size: r }),
        c === "collapsed" && "mx-auto h-8 w-8 p-2 [&>span]:sr-only",
        r === "lg" && c === "collapsed" && "mx-auto h-8 w-8 p-0",
        o
      ),
      ...a
    }
  );
  return !s || c !== "collapsed" || d ? u : /* @__PURE__ */ b(jo, { children: [
    /* @__PURE__ */ i(Fo, { asChild: !0, children: u }),
    /* @__PURE__ */ i(Wo, { side: "right", align: "center", ...typeof s == "string" ? { children: s } : s })
  ] });
}
function ya({
  items: e,
  active: t,
  onSelect: n,
  header: r,
  footer: s,
  defaultCollapsed: o = !1,
  className: a
}) {
  const l = Cn(e);
  return /* @__PURE__ */ i(Yo, { defaultOpen: !o, className: `nav-rail ${a ?? ""}`, children: /* @__PURE__ */ b(Ho, { collapsible: "icon", variant: "sidebar", children: [
    /* @__PURE__ */ b(Jo, { children: [
      r,
      /* @__PURE__ */ i("div", { className: "flex items-center justify-end px-1 group-data-[collapsible=icon]:justify-center", children: /* @__PURE__ */ i(Zo, { "aria-label": "Toggle sidebar", title: "Toggle sidebar" }) })
    ] }),
    /* @__PURE__ */ i(ti, { children: l.map((d, c) => /* @__PURE__ */ b(ni, { children: [
      d.label && /* @__PURE__ */ i(ri, { children: d.label }),
      /* @__PURE__ */ i(si, { children: /* @__PURE__ */ i(oi, { children: d.items.map((u) => {
        const w = t === u.id, y = u.icon;
        return /* @__PURE__ */ i(ii, { children: /* @__PURE__ */ b(
          li,
          {
            "aria-label": u.label,
            "aria-current": w ? "page" : void 0,
            isActive: w,
            tooltip: u.label,
            onClick: () => n(u.id),
            children: [
              y && /* @__PURE__ */ i(y, {}),
              /* @__PURE__ */ i("span", { children: u.label })
            ]
          }
        ) }, u.id);
      }) }) })
    ] }, d.label ?? `__default-${c}`)) }),
    s && /* @__PURE__ */ i(ei, { children: s }),
    /* @__PURE__ */ i(Xo, {})
  ] }) });
}
function va({
  items: e,
  active: t,
  onSelect: n,
  badge: r,
  className: s,
  "aria-label": o = "section navigation"
}) {
  const a = Cn(e);
  return /* @__PURE__ */ i(
    "nav",
    {
      "aria-label": o,
      className: D("nav-rail flex min-w-0 flex-col gap-2 text-nr-fg", s),
      children: a.map((l, d) => /* @__PURE__ */ b("div", { className: "flex flex-col gap-1", children: [
        l.label && /* @__PURE__ */ i("div", { className: "px-2 text-xs font-medium text-nr-muted", children: l.label }),
        l.items.map((c) => {
          const u = t === c.id, w = c.icon, y = r == null ? void 0 : r(c.id);
          return /* @__PURE__ */ b(
            "button",
            {
              type: "button",
              role: "tab",
              "aria-label": c.label,
              "aria-current": u ? "page" : void 0,
              "aria-selected": u,
              onClick: () => n(c.id),
              className: D(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none ring-nr-accent transition-colors focus-visible:ring-2",
                "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
                u ? "bg-nr-bg font-medium text-nr-fg" : "text-nr-muted hover:bg-nr-bg hover:text-nr-fg"
              ),
              children: [
                w && /* @__PURE__ */ i(w, {}),
                /* @__PURE__ */ i("span", { className: "min-w-0 flex-1 truncate", children: c.label }),
                y ? /* @__PURE__ */ i("span", { className: "rounded-full bg-nr-accent/15 px-1.5 text-[10px] text-nr-accent", children: y }) : null
              ]
            },
            c.id
          );
        })
      ] }, l.label ?? `__default-${d}`))
    }
  );
}
export {
  rr as BROWSER_TZ,
  oa as BUILDER_SOURCE_GROUPS,
  Ns as BUILTIN_PREFIX,
  Xs as CATALOG_SECTION_SPECS,
  ue as CatalogEmpty,
  la as CatalogExplorer,
  io as CatalogSchemaTree,
  so as CatalogSection,
  yi as DASH_KIT_READ_CAPS,
  xi as DASH_KIT_READ_SCOPE,
  Ei as DEFAULT_RANGE_EXPR,
  Ms as DEFAULT_TTL_S,
  vs as DashboardCacheProvider,
  Ii as DashboardRangePicker,
  at as DashboardWsContext,
  Vi as FreezeProvider,
  Qi as FreshnessProvider,
  xo as InsightActions,
  wo as InsightRow,
  fa as InsightsAckWidget,
  ma as InsightsReadWidget,
  Nn as InsightsWidget,
  xa as KV,
  Qe as KitDeniedError,
  vi as KitProvider,
  fn as LIST_STALE_MS,
  Dt as MAX_PANELS,
  $s as NAV_PATH_SEP,
  va as NavMenu,
  ya as NavRail,
  ba as Panel,
  ro as PickerGroup,
  Mt as PrefDateInput,
  wa as PropTable,
  hs as QUICK_PERSIST_MAX_AGE_MS,
  hn as QUICK_PERSIST_VERSION,
  mn as RANGE_BANDS,
  un as RANGE_COLUMNS,
  Ti as RANGE_PRESETS,
  kn as READ_SOURCE_GROUPS,
  Eo as ResizeHandle,
  co as SEVERITY_ORDER,
  Bs as SQL_SOURCE_ID,
  ga as Section,
  bo as SeverityBadge,
  aa as SourceCombobox,
  ia as SourcePicker,
  go as StatusBadge,
  Zi as VizBatchProvider,
  qi as WithDashboardCache,
  Bn as browserZone,
  Us as buildSourceEntries,
  ye as canon,
  Js as channelEntries,
  Ji as datasourceEntries,
  Rs as datasourceListKey,
  _s as datasourceListQueryOptions,
  ls as datePlaceholder,
  pa as denyClient,
  Fs as extWidgetEntries,
  js as extensionEntries,
  ks as extractVarNames,
  Ss as extractVarNamesDeep,
  Wi as fetchDatasourceList,
  Gi as flowNodeStateKey,
  Ws as flowsEntries,
  _t as formatDateField,
  to as inboxEntries,
  eo as insightEntries,
  Cs as isBuiltinName,
  bi as isKitDenied,
  gi as isOutOfScope,
  $i as isWindowExpr,
  Ye as isoDayOf,
  tt as labelOf,
  Gs as liveEntries,
  Hs as loadCatalog,
  Zs as loadSourcePicker,
  cs as makeDashboardQueryClient,
  qn as makeInsightsClient,
  wi as makeKitClient,
  Kn as makeSourceLoaders,
  zt as makeVizBatchLoader,
  ha as memoryClient,
  Ai as navBuiltins,
  et as normalizeTz,
  ho as originLine,
  Mi as parseDateField,
  Te as parseRangeExpr,
  ys as persistQuickCache,
  Vt as preferredZone,
  _i as previewBound,
  ra as queryCatalogEntries,
  qs as queryEntries,
  gs as quickPersister,
  Ri as rangeTimezone,
  Ki as resolveFreshnessTtl,
  ar as resolveRange,
  Ks as rulesEntries,
  ta as schemaColumnEntries,
  ea as schemaTableEntries,
  pn as scopeKey,
  xn as selectionOf,
  na as seriesCatalogEntries,
  Ls as seriesEntries,
  ji as seriesReadKey,
  da as severityColor,
  ca as severityRank,
  uo as severityTone,
  mr as shortLabelOf,
  Fi as sourcePickerKey,
  Vs as sqlSourceEntry,
  mo as statusTone,
  fo as timeAgo,
  Wn as toolCallOf,
  sa as useCatalog,
  Di as useDashboardWs,
  zi as useDashboardWsOptional,
  Bi as useDebounced,
  Ui as useFreeze,
  Yi as useFreshness,
  ua as useInsight,
  po as useInsights,
  De as useKit,
  ki as useKitClient,
  Gt as useKitOptional,
  Ci as useKitTheme,
  Ni as useKitWs,
  Si as useKitZone,
  Ro as useResizable,
  Xi as useSourcePicker,
  Hi as useVizBatchLoader,
  Oi as vizFetchKey,
  Pi as vizQueryKey,
  Li as vizShapeKey,
  lr as weekStartOf,
  As as widgetIdOf
};
