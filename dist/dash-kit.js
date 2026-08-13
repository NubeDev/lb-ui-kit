var Qt = Object.defineProperty;
var Zt = (e, t, r) => t in e ? Qt(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Se = (e, t, r) => Zt(e, typeof t != "symbol" ? t + "" : t, r);
import { jsx as p, jsxs as I } from "react/jsx-runtime";
import * as pt from "react";
import { createContext as ae, useMemo as ne, useContext as Y, useRef as Ht, useState as se, useEffect as $e } from "react";
import { Calendar as Xt, CalendarRange as Jt, ChevronDown as er, Check as tr } from "lucide-react";
import { Slot as rr } from "@radix-ui/react-slot";
import * as X from "@radix-ui/react-dropdown-menu";
import { QueryClient as or, QueryClientProvider as nr } from "@tanstack/react-query";
import { persistQueryClientRestore as sr, persistQueryClientSave as ir } from "@tanstack/react-query-persist-client";
class Re extends Error {
  constructor(r, o) {
    super(`denied: ${r} — ${o}`);
    Se(this, "denied", !0);
    Se(this, "tool");
    this.name = "KitDeniedError", this.tool = r;
  }
}
function mn(e) {
  return e instanceof Re;
}
function fn(e) {
  return e instanceof Error && e.message.startsWith("out_of_scope:");
}
function ar(e) {
  if (typeof e == "function") return e;
  const t = e;
  return (r, o) => t.call(r, o);
}
function L(e, t) {
  if (!e || typeof e != "object") return [];
  const r = e[t];
  return Array.isArray(r) ? r : [];
}
function lr(e, t = {}) {
  const r = {
    listSeries: () => e("series.list", {}).then((o) => L(o, "series")),
    listExtensions: () => e("ext.list", {}).then((o) => L(o, "extensions")),
    listFlows: () => e("flows.list", {}).then((o) => L(o, "flows")),
    // `flows.get` answers the flow BARE (not enveloped). A flow the caller can list but not read
    // rejects; the picker skips it rather than failing the whole bundle, so map a rejection to null.
    getFlow: (o) => e("flows.get", { id: o }).then((n) => n && typeof n == "object" ? n : null).catch(() => null),
    listFlowNodes: () => e("flows.nodes", {}).then((o) => L(o, "nodes")),
    listDatasources: () => e("datasource.list", {}).then((o) => L(o, "datasources")),
    listRules: () => e("rules.list", {}).then((o) => L(o, "rules")),
    listQueries: () => e("query.list", {}).then((o) => L(o, "queries")),
    // `store.schema` answers the schema BARE. An absent/!object reply is an empty schema, not a throw.
    readSchema: () => e("store.schema", {}).then(
      (o) => o && typeof o == "object" ? o : { tables: [] }
    ),
    listChannels: () => e("channel.list", {}).then((o) => L(o, "channels")),
    listInsights: () => e("insight.list", {}).then((o) => L(o, "items"))
  };
  if (t.inboxChannel) {
    const o = t.inboxChannel;
    r.listInbox = () => e("inbox.list", { channel: o }).then((n) => L(n, "items"));
  }
  return r;
}
function cr(e) {
  return {
    list: (t) => e("insight.list", { ...t }).then((r) => r ?? { items: [] }),
    get: (t) => e("insight.get", { id: t }).then((r) => r ?? null),
    occurrences: (t, r, o) => e("insight.occurrences", {
      insight_id: t,
      cursor: r,
      limit: o ?? 50
    }).then((n) => n ?? { items: [] }),
    ack: () => Promise.reject(
      new Re(
        "insight.ack",
        "the kit is a READ kit; extension bridge writes are not implemented (U-ext-bridge-write)"
      )
    ),
    resolve: () => Promise.reject(
      new Re(
        "insight.resolve",
        "the kit is a READ kit; extension bridge writes are not implemented (U-ext-bridge-write)"
      )
    )
    // No `subscribe`: a live tail needs a stream seam the leashed call does not carry. Omitting it is
    // the interface's documented "no feed" case, so the hooks fall back to act→refresh.
  };
}
function hn(e, t = {}) {
  const r = ar(e);
  return {
    call: r,
    loaders: lr(r, t),
    insights: cr(r)
  };
}
const pn = [
  "viz.query",
  "viz.query_batch",
  "series.read",
  "series.latest",
  "series.find"
], bn = [
  "mcp:viz.query:call",
  "mcp:series.read:call",
  "mcp:series.latest:call",
  "mcp:series.find:call"
];
function dr() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
const De = ae(null);
function gn({ client: e, ws: t, theme: r, zone: o, children: n }) {
  const s = ne(
    () => ({ client: e, ws: t, theme: r, zone: o ?? dr }),
    [e, t, r, o]
  );
  return /* @__PURE__ */ p(De.Provider, { value: s, children: n });
}
function ur() {
  return Y(De);
}
function le() {
  const e = Y(De);
  if (!e)
    throw new Error(
      "useKit: no <KitProvider>. Wrap the page: <KitProvider client={makeKitClient(bridge)} ws={ctx.workspace}>"
    );
  return e;
}
function yn() {
  return le().client;
}
function xn() {
  return le().ws;
}
function wn() {
  return le().theme;
}
function vn() {
  return le().zone;
}
const mr = 864e5;
function J(e, t, r) {
  e -= t <= 2 ? 1 : 0;
  const o = Math.floor((e >= 0 ? e : e - 399) / 400), n = e - o * 400, s = Math.floor((153 * (t + (t > 2 ? -3 : 9)) + 2) / 5) + r - 1, i = n * 365 + Math.floor(n / 4) - Math.floor(n / 100) + s;
  return o * 146097 + i - 719468;
}
function bt(e) {
  e += 719468;
  const t = Math.floor((e >= 0 ? e : e - 146096) / 146097), r = e - t * 146097, o = Math.floor(
    (r - Math.floor(r / 1460) + Math.floor(r / 36524) - Math.floor(r / 146096)) / 365
  ), n = o + t * 400, s = r - (365 * o + Math.floor(o / 4) - Math.floor(o / 100)), i = Math.floor((5 * s + 2) / 153), d = s - Math.floor((153 * i + 2) / 5) + 1, m = i + (i < 10 ? 3 : -9);
  return { y: n + (m <= 2 ? 1 : 0), mo: m, d };
}
function gt(e, t) {
  const r = t === 12 ? { y: e + 1, mo: 1 } : { y: e, mo: t + 1 };
  return J(r.y, r.mo, 1) - J(e, t, 1);
}
function fr(e, t, r) {
  return (J(e, t, r) % 7 + 3 + 7) % 7;
}
const Ze = /* @__PURE__ */ new Map();
function yt(e) {
  let t = Ze.get(e);
  return t || (t = new Intl.DateTimeFormat("en-US", {
    timeZone: e,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }), Ze.set(e, t)), t;
}
function Oe(e) {
  if (!e) return "UTC";
  try {
    return yt(e), e;
  } catch {
    return "UTC";
  }
}
function ee(e, t) {
  const r = yt(t).formatToParts(e), o = (n) => {
    var s;
    return Number(((s = r.find((i) => i.type === n)) == null ? void 0 : s.value) ?? 0);
  };
  return { y: o("year"), mo: o("month"), d: o("day"), h: o("hour") % 24, mi: o("minute"), s: o("second") };
}
function xt(e) {
  return J(e.y, e.mo, e.d) * mr + ((e.h * 60 + e.mi) * 60 + e.s) * 1e3;
}
function He(e, t) {
  return xt(ee(e, t)) - e;
}
function O(e, t) {
  const r = xt(e), o = r - He(r, t);
  return r - He(o, t);
}
function Ee(e, t) {
  const r = ee(e, t), o = (n, s = 2) => String(n).padStart(s, "0");
  return `${o(r.y, 4)}-${o(r.mo)}-${o(r.d)}`;
}
const Xe = {
  s: "s",
  m: "m",
  h: "h",
  d: "d",
  w: "w",
  M: "M",
  y: "y"
}, hr = {
  second: "s",
  minute: "m",
  hour: "h",
  day: "d",
  week: "w",
  month: "M",
  quarter: "q",
  year: "y"
}, pr = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  y: "year"
}, br = /^now(?:([+-])(\d{1,6})([smhdwMy]))?(?:\/([smhdwMy]))?$/, gr = /^(\d{4})-(\d{2})-(\d{2})$/, yr = /^\d{13}$/, xr = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?$/, wr = /^(this|last|next)-(hour|day|week|month|quarter|year)$/, vr = /^last-(\d{1,6})-(second|minute|hour|day|week|month|quarter|year)s?$/, kr = /^last-(\d{1,6})([smhdwMy])$/, wt = "expected now±<n><unit> (units s m h d w M y, optional /<unit> snap), an ISO day or instant, 13-digit epoch ms, today/yesterday/tomorrow, this-/last-/next-<unit>, or last-<n>-<unit>s";
function he(e) {
  return { ok: !1, error: `unrecognized range expression "${e}" — ${wt}` };
}
function Je(e, t, r) {
  return t >= 1 && t <= 12 && r >= 1 && r <= gt(e, t);
}
function ye(e) {
  const t = e.trim();
  if (!t) return { ok: !1, error: `empty range expression — ${wt}` };
  if (t === "today") return H({ kind: "day", offset: 0 });
  if (t === "yesterday") return H({ kind: "day", offset: -1 });
  if (t === "tomorrow") return H({ kind: "day", offset: 1 });
  const r = wr.exec(t);
  if (r)
    return H({ kind: "period", rel: r[1], unit: r[2] });
  const o = vr.exec(t);
  if (o) return H({ kind: "trailing", n: Number(o[1]), unit: hr[o[2]] });
  const n = kr.exec(t);
  if (n) return H({ kind: "trailing", n: Number(n[1]), unit: Xe[n[2]] });
  const s = br.exec(t);
  if (s) {
    const [, m, a, y, v] = s;
    return re({
      kind: "now",
      ...m ? { offset: { sign: m === "-" ? -1 : 1, n: Number(a), unit: Xe[y] } } : {},
      ...v ? { snap: pr[v] } : {}
    });
  }
  const i = gr.exec(t);
  if (i) {
    const [m, a, y] = [Number(i[1]), Number(i[2]), Number(i[3])];
    return Je(m, a, y) ? re({ kind: "isoDay", y: m, mo: a, d: y }) : he(e);
  }
  if (yr.test(t)) return re({ kind: "instant", ms: Number(t) });
  const d = xr.exec(t);
  if (d) {
    const [, m, a, y, v, C, w, x, h] = d;
    if (!Je(Number(m), Number(a), Number(y)) || Number(v) > 23 || Number(C) > 59) return he(e);
    if (h) {
      const b = Date.parse(t);
      return Number.isFinite(b) ? re({ kind: "instant", ms: b }) : he(e);
    }
    return re({
      kind: "wall",
      y: Number(m),
      mo: Number(a),
      d: Number(y),
      h: Number(v),
      mi: Number(C),
      s: Number(w ?? 0),
      ms: Number((x ?? "0").padEnd(3, "0"))
    });
  }
  return he(e);
}
function kn(e) {
  const t = ye(e);
  return t.ok && t.expr.type === "window";
}
function H(e) {
  return { ok: !0, expr: { type: "window", window: e } };
}
function re(e) {
  return { ok: !0, expr: { type: "endpoint", endpoint: e } };
}
const Cr = "browser";
function vt() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
function kt(e, ...t) {
  for (const r of t)
    if (r && r !== Cr) return r;
  return e();
}
const Cn = "last-30-days";
function Nn(e, t, r = vt) {
  return Oe(kt(r, e, t));
}
function Nr(e, t) {
  const r = e.y * 12 + (e.mo - 1) + t, o = Math.floor(r / 12), n = (r % 12 + 12) % 12 + 1;
  return { ...e, y: o, mo: n, d: Math.min(e.d, gt(o, n)) };
}
function K(e, t, r, o) {
  switch (r) {
    case "s":
      return e + t * 1e3;
    case "m":
      return e + t * 6e4;
    case "h":
      return e + t * 36e5;
    case "d":
    case "w": {
      const n = ee(e, o), s = r === "w" ? t * 7 : t, i = bt(J(n.y, n.mo, n.d) + s);
      return O({ ...n, ...i }, o);
    }
    case "M":
    case "q":
    case "y": {
      const n = r === "M" ? t : r === "q" ? t * 3 : t * 12;
      return O(Nr(ee(e, o), n), o);
    }
  }
}
function Mr(e) {
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
function Ie(e, t, r) {
  if (t === "second") return Math.floor(e / 1e3) * 1e3;
  const o = ee(e, r);
  switch (t) {
    case "minute":
      return O({ ...o, s: 0 }, r);
    case "hour":
      return O({ ...o, mi: 0, s: 0 }, r);
    case "day":
      return O({ ...o, h: 0, mi: 0, s: 0 }, r);
    case "week": {
      const n = bt(J(o.y, o.mo, o.d) - fr(o.y, o.mo, o.d));
      return O({ ...o, ...n, h: 0, mi: 0, s: 0 }, r);
    }
    case "month":
      return O({ ...o, d: 1, h: 0, mi: 0, s: 0 }, r);
    case "quarter":
      return O({ ...o, mo: Math.floor((o.mo - 1) / 3) * 3 + 1, d: 1, h: 0, mi: 0, s: 0 }, r);
    case "year":
      return O({ ...o, mo: 1, d: 1, h: 0, mi: 0, s: 0 }, r);
    default:
      return e;
  }
}
function et(e, t, r) {
  switch (e.kind) {
    case "now": {
      let o = t;
      return e.offset && (o = K(o, e.offset.sign * e.offset.n, e.offset.unit, r)), e.snap && (o = Ie(o, e.snap, r)), o;
    }
    case "isoDay":
      return O({ y: e.y, mo: e.mo, d: e.d, h: 0, mi: 0, s: 0 }, r);
    case "instant":
      return e.ms;
    case "wall":
      return O({ y: e.y, mo: e.mo, d: e.d, h: e.h, mi: e.mi, s: e.s }, r) + e.ms;
  }
}
function Sr(e, t, r) {
  switch (e.kind) {
    case "day": {
      const o = K(Ie(t, "day", r), e.offset, "d", r);
      return { fromMs: o, toMs: K(o, 1, "d", r) };
    }
    case "period": {
      const o = Ie(t, e.unit, r), n = Mr(e.unit);
      return e.rel === "this" ? { fromMs: o, toMs: K(o, 1, n, r) } : e.rel === "last" ? { fromMs: K(o, -1, n, r), toMs: o } : { fromMs: K(o, 1, n, r), toMs: K(o, 2, n, r) };
    }
    case "trailing":
      return { fromMs: K(t, -e.n, e.unit, r), toMs: t };
  }
}
function Ar(e, t, r, o) {
  if (!e || !e.trim()) return null;
  const n = Oe(o), s = ye(e);
  if (!s.ok) return null;
  if (s.expr.type === "window")
    return t && t.trim() ? null : Sr(s.expr.window, r, n);
  const i = et(s.expr.endpoint, r, n);
  let d = r;
  if (t && t.trim()) {
    const m = ye(t);
    if (!m.ok || m.expr.type !== "endpoint") return null;
    d = et(m.expr.endpoint, r, n);
  }
  return i <= d ? { fromMs: i, toMs: d } : null;
}
function Mn(e, t) {
  const r = Oe(t), o = ee(e, r), n = Ee(e, r);
  if (o.h === 0 && o.mi === 0 && o.s === 0 && e % 1e3 === 0) return n;
  const s = (i) => String(i).padStart(2, "0");
  return `${n} ${s(o.h)}:${s(o.mi)}`;
}
const _r = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  q: "quarter",
  y: "year"
};
function Tr(e) {
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function zr(e) {
  switch (e.kind) {
    case "day":
      return e.offset === 0 ? "Today" : e.offset === -1 ? "Yesterday" : "Tomorrow";
    case "period":
      return `${Tr(e.rel)} ${e.unit}`;
    case "trailing": {
      const t = _r[e.unit];
      return `Last ${e.n} ${t}${e.n === 1 ? "" : "s"}`;
    }
  }
}
function Le(e, t) {
  const r = ye(e);
  return r.ok && r.expr.type === "window" ? zr(r.expr.window) : t ? `${e} → ${t}` : e === "now" ? "Now" : `${e} → now`;
}
function Rr(e, t) {
  const r = /^\d{4}-\d{2}-\d{2}$/;
  if (t && r.test(e) && r.test(t)) {
    const o = (n) => {
      const s = /* @__PURE__ */ new Date(`${n}T00:00:00Z`);
      return Number.isNaN(s.getTime()) ? n : s.toLocaleDateString(void 0, { month: "short", day: "numeric", timeZone: "UTC" });
    };
    return `${o(e)} – ${o(t)}`;
  }
  return Le(e, t);
}
function Ct(e) {
  var t, r, o = "";
  if (typeof e == "string" || typeof e == "number") o += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var n = e.length;
    for (t = 0; t < n; t++) e[t] && (r = Ct(e[t])) && (o && (o += " "), o += r);
  } else for (r in e) e[r] && (o && (o += " "), o += r);
  return o;
}
function Nt() {
  for (var e, t, r = 0, o = "", n = arguments.length; r < n; r++) (e = arguments[r]) && (t = Ct(e)) && (o && (o += " "), o += t);
  return o;
}
const tt = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, rt = Nt, Er = (e, t) => (r) => {
  var o;
  if ((t == null ? void 0 : t.variants) == null) return rt(e, r == null ? void 0 : r.class, r == null ? void 0 : r.className);
  const { variants: n, defaultVariants: s } = t, i = Object.keys(n).map((a) => {
    const y = r == null ? void 0 : r[a], v = s == null ? void 0 : s[a];
    if (y === null) return null;
    const C = tt(y) || tt(v);
    return n[a][C];
  }), d = r && Object.entries(r).reduce((a, y) => {
    let [v, C] = y;
    return C === void 0 || (a[v] = C), a;
  }, {}), m = t == null || (o = t.compoundVariants) === null || o === void 0 ? void 0 : o.reduce((a, y) => {
    let { class: v, className: C, ...w } = y;
    return Object.entries(w).every((x) => {
      let [h, b] = x;
      return Array.isArray(b) ? b.includes({
        ...s,
        ...d
      }[h]) : {
        ...s,
        ...d
      }[h] === b;
    }) ? [
      ...a,
      v,
      C
    ] : a;
  }, []);
  return rt(e, i, m, r == null ? void 0 : r.class, r == null ? void 0 : r.className);
}, Ir = (e, t) => {
  const r = new Array(e.length + t.length);
  for (let o = 0; o < e.length; o++)
    r[o] = e[o];
  for (let o = 0; o < t.length; o++)
    r[e.length + o] = t[o];
  return r;
}, Pr = (e, t) => ({
  classGroupId: e,
  validator: t
}), Mt = (e = /* @__PURE__ */ new Map(), t = null, r) => ({
  nextPart: e,
  validators: t,
  classGroupId: r
}), xe = "-", ot = [], $r = "arbitrary..", Dr = (e) => {
  const t = Lr(e), {
    conflictingClassGroups: r,
    conflictingClassGroupModifiers: o
  } = e;
  return {
    getClassGroupId: (i) => {
      if (i.startsWith("[") && i.endsWith("]"))
        return Or(i);
      const d = i.split(xe), m = d[0] === "" && d.length > 1 ? 1 : 0;
      return St(d, m, t);
    },
    getConflictingClassGroupIds: (i, d) => {
      if (d) {
        const m = o[i], a = r[i];
        return m ? a ? Ir(a, m) : m : a || ot;
      }
      return r[i] || ot;
    }
  };
}, St = (e, t, r) => {
  if (e.length - t === 0)
    return r.classGroupId;
  const n = e[t], s = r.nextPart.get(n);
  if (s) {
    const a = St(e, t + 1, s);
    if (a) return a;
  }
  const i = r.validators;
  if (i === null)
    return;
  const d = t === 0 ? e.join(xe) : e.slice(t).join(xe), m = i.length;
  for (let a = 0; a < m; a++) {
    const y = i[a];
    if (y.validator(d))
      return y.classGroupId;
  }
}, Or = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const t = e.slice(1, -1), r = t.indexOf(":"), o = t.slice(0, r);
  return o ? $r + o : void 0;
})(), Lr = (e) => {
  const {
    theme: t,
    classGroups: r
  } = e;
  return jr(r, t);
}, jr = (e, t) => {
  const r = Mt();
  for (const o in e) {
    const n = e[o];
    je(n, r, o, t);
  }
  return r;
}, je = (e, t, r, o) => {
  const n = e.length;
  for (let s = 0; s < n; s++) {
    const i = e[s];
    Gr(i, t, r, o);
  }
}, Gr = (e, t, r, o) => {
  if (typeof e == "string") {
    Fr(e, t, r);
    return;
  }
  if (typeof e == "function") {
    Wr(e, t, r, o);
    return;
  }
  Vr(e, t, r, o);
}, Fr = (e, t, r) => {
  const o = e === "" ? t : At(t, e);
  o.classGroupId = r;
}, Wr = (e, t, r, o) => {
  if (Kr(e)) {
    je(e(o), t, r, o);
    return;
  }
  t.validators === null && (t.validators = []), t.validators.push(Pr(r, e));
}, Vr = (e, t, r, o) => {
  const n = Object.entries(e), s = n.length;
  for (let i = 0; i < s; i++) {
    const [d, m] = n[i];
    je(m, At(t, d), r, o);
  }
}, At = (e, t) => {
  let r = e;
  const o = t.split(xe), n = o.length;
  for (let s = 0; s < n; s++) {
    const i = o[s];
    let d = r.nextPart.get(i);
    d || (d = Mt(), r.nextPart.set(i, d)), r = d;
  }
  return r;
}, Kr = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, qr = (e) => {
  if (e < 1)
    return {
      get: () => {
      },
      set: () => {
      }
    };
  let t = 0, r = /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ Object.create(null);
  const n = (s, i) => {
    r[s] = i, t++, t > e && (t = 0, o = r, r = /* @__PURE__ */ Object.create(null));
  };
  return {
    get(s) {
      let i = r[s];
      if (i !== void 0)
        return i;
      if ((i = o[s]) !== void 0)
        return n(s, i), i;
    },
    set(s, i) {
      s in r ? r[s] = i : n(s, i);
    }
  };
}, Pe = "!", nt = ":", Ur = [], st = (e, t, r, o, n) => ({
  modifiers: e,
  hasImportantModifier: t,
  baseClassName: r,
  maybePostfixModifierPosition: o,
  isExternal: n
}), Br = (e) => {
  const {
    prefix: t,
    experimentalParseClassName: r
  } = e;
  let o = (n) => {
    const s = [];
    let i = 0, d = 0, m = 0, a;
    const y = n.length;
    for (let h = 0; h < y; h++) {
      const b = n[h];
      if (i === 0 && d === 0) {
        if (b === nt) {
          s.push(n.slice(m, h)), m = h + 1;
          continue;
        }
        if (b === "/") {
          a = h;
          continue;
        }
      }
      b === "[" ? i++ : b === "]" ? i-- : b === "(" ? d++ : b === ")" && d--;
    }
    const v = s.length === 0 ? n : n.slice(m);
    let C = v, w = !1;
    v.endsWith(Pe) ? (C = v.slice(0, -1), w = !0) : (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      v.startsWith(Pe) && (C = v.slice(1), w = !0)
    );
    const x = a && a > m ? a - m : void 0;
    return st(s, w, C, x);
  };
  if (t) {
    const n = t + nt, s = o;
    o = (i) => i.startsWith(n) ? s(i.slice(n.length)) : st(Ur, !1, i, void 0, !0);
  }
  if (r) {
    const n = o;
    o = (s) => r({
      className: s,
      parseClassName: n
    });
  }
  return o;
}, Yr = (e) => {
  const t = /* @__PURE__ */ new Map();
  return e.orderSensitiveModifiers.forEach((r, o) => {
    t.set(r, 1e6 + o);
  }), (r) => {
    const o = [];
    let n = [];
    for (let s = 0; s < r.length; s++) {
      const i = r[s], d = i[0] === "[", m = t.has(i);
      d || m ? (n.length > 0 && (n.sort(), o.push(...n), n = []), o.push(i)) : n.push(i);
    }
    return n.length > 0 && (n.sort(), o.push(...n)), o;
  };
}, Qr = (e) => ({
  cache: qr(e.cacheSize),
  parseClassName: Br(e),
  sortModifiers: Yr(e),
  postfixLookupClassGroupIds: Zr(e),
  ...Dr(e)
}), Zr = (e) => {
  const t = /* @__PURE__ */ Object.create(null), r = e.postfixLookupClassGroups;
  if (r)
    for (let o = 0; o < r.length; o++)
      t[r[o]] = !0;
  return t;
}, Hr = /\s+/, Xr = (e, t) => {
  const {
    parseClassName: r,
    getClassGroupId: o,
    getConflictingClassGroupIds: n,
    sortModifiers: s,
    postfixLookupClassGroupIds: i
  } = t, d = [], m = e.trim().split(Hr);
  let a = "";
  for (let y = m.length - 1; y >= 0; y -= 1) {
    const v = m[y], {
      isExternal: C,
      modifiers: w,
      hasImportantModifier: x,
      baseClassName: h,
      maybePostfixModifierPosition: b
    } = r(v);
    if (C) {
      a = v + (a.length > 0 ? " " + a : a);
      continue;
    }
    let E = !!b, N;
    if (E) {
      const S = h.substring(0, b);
      N = o(S);
      const u = N && i[N] ? o(h) : void 0;
      u && u !== N && (N = u, E = !1);
    } else
      N = o(h);
    if (!N) {
      if (!E) {
        a = v + (a.length > 0 ? " " + a : a);
        continue;
      }
      if (N = o(h), !N) {
        a = v + (a.length > 0 ? " " + a : a);
        continue;
      }
      E = !1;
    }
    const $ = w.length === 0 ? "" : w.length === 1 ? w[0] : s(w).join(":"), G = x ? $ + Pe : $, F = G + N;
    if (d.indexOf(F) > -1)
      continue;
    d.push(F);
    const M = n(N, E);
    for (let S = 0; S < M.length; ++S) {
      const u = M[S];
      d.push(G + u);
    }
    a = v + (a.length > 0 ? " " + a : a);
  }
  return a;
}, Jr = (...e) => {
  let t = 0, r, o, n = "";
  for (; t < e.length; )
    (r = e[t++]) && (o = _t(r)) && (n && (n += " "), n += o);
  return n;
}, _t = (e) => {
  if (typeof e == "string")
    return e;
  let t, r = "";
  for (let o = 0; o < e.length; o++)
    e[o] && (t = _t(e[o])) && (r && (r += " "), r += t);
  return r;
}, eo = (e, ...t) => {
  let r, o, n, s;
  const i = (m) => {
    const a = t.reduce((y, v) => v(y), e());
    return r = Qr(a), o = r.cache.get, n = r.cache.set, s = d, d(m);
  }, d = (m) => {
    const a = o(m);
    if (a)
      return a;
    const y = Xr(m, r);
    return n(m, y), y;
  };
  return s = i, (...m) => s(Jr(...m));
}, to = [], A = (e) => {
  const t = (r) => r[e] || to;
  return t.isThemeGetter = !0, t;
}, Tt = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, zt = /^\((?:(\w[\w-]*):)?(.+)\)$/i, ro = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, oo = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, no = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, so = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, io = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, ao = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, V = (e) => ro.test(e), g = (e) => !!e && !Number.isNaN(Number(e)), j = (e) => !!e && Number.isInteger(Number(e)), Ae = (e) => e.endsWith("%") && g(e.slice(0, -1)), W = (e) => oo.test(e), Rt = () => !0, lo = (e) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  no.test(e) && !so.test(e)
), Ge = () => !1, co = (e) => io.test(e), uo = (e) => ao.test(e), mo = (e) => !l(e) && !c(e), fo = (e) => e.startsWith("@container") && (e[10] === "/" && e[11] !== void 0 || e[11] === "s" && e[16] !== void 0 && e.startsWith("-size/", 10) || e[11] === "n" && e[18] !== void 0 && e.startsWith("-normal/", 10)), ho = (e) => q(e, Pt, Ge), l = (e) => Tt.test(e), B = (e) => q(e, $t, lo), it = (e) => q(e, ko, g), po = (e) => q(e, Ot, Rt), bo = (e) => q(e, Dt, Ge), at = (e) => q(e, Et, Ge), go = (e) => q(e, It, uo), pe = (e) => q(e, Lt, co), c = (e) => zt.test(e), oe = (e) => Q(e, $t), yo = (e) => Q(e, Dt), lt = (e) => Q(e, Et), xo = (e) => Q(e, Pt), wo = (e) => Q(e, It), be = (e) => Q(e, Lt, !0), vo = (e) => Q(e, Ot, !0), q = (e, t, r) => {
  const o = Tt.exec(e);
  return o ? o[1] ? t(o[1]) : r(o[2]) : !1;
}, Q = (e, t, r = !1) => {
  const o = zt.exec(e);
  return o ? o[1] ? t(o[1]) : r : !1;
}, Et = (e) => e === "position" || e === "percentage", It = (e) => e === "image" || e === "url", Pt = (e) => e === "length" || e === "size" || e === "bg-size", $t = (e) => e === "length", ko = (e) => e === "number", Dt = (e) => e === "family-name", Ot = (e) => e === "number" || e === "weight", Lt = (e) => e === "shadow", Co = () => {
  const e = A("color"), t = A("font"), r = A("text"), o = A("font-weight"), n = A("tracking"), s = A("leading"), i = A("breakpoint"), d = A("container"), m = A("spacing"), a = A("radius"), y = A("shadow"), v = A("inset-shadow"), C = A("text-shadow"), w = A("drop-shadow"), x = A("blur"), h = A("perspective"), b = A("aspect"), E = A("ease"), N = A("animate"), $ = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], G = () => [
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
  ], F = () => [...G(), c, l], M = () => ["auto", "hidden", "clip", "visible", "scroll"], S = () => ["auto", "contain", "none"], u = () => [c, l, m], _ = () => [V, "full", "auto", ...u()], te = () => [j, "none", "subgrid", c, l], Ve = () => ["auto", {
    span: ["full", j, c, l]
  }, j, c, l], ce = () => [j, "auto", c, l], Ke = () => ["auto", "min", "max", "fr", c, l], ve = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"], Z = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"], D = () => ["auto", ...u()], U = () => [V, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...u()], ke = () => [V, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...u()], Ce = () => [V, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...u()], f = () => [e, c, l], qe = () => [...G(), lt, at, {
    position: [c, l]
  }], Ue = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }], Be = () => ["auto", "cover", "contain", xo, ho, {
    size: [c, l]
  }], Ne = () => [Ae, oe, B], z = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    a,
    c,
    l
  ], R = () => ["", g, oe, B], de = () => ["solid", "dashed", "dotted", "double"], Ye = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], T = () => [g, Ae, lt, at], Qe = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    x,
    c,
    l
  ], ue = () => ["none", g, c, l], me = () => ["none", g, c, l], Me = () => [g, c, l], fe = () => [V, "full", ...u()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [W],
      breakpoint: [W],
      color: [Rt],
      container: [W],
      "drop-shadow": [W],
      ease: ["in", "out", "in-out"],
      font: [mo],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [W],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [W],
      shadow: [W],
      spacing: ["px", g],
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
        aspect: ["auto", "square", V, l, c, b]
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
      "container-named": [fo],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [g, l, c, d]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": $()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": $()
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
        overflow: M()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": M()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": M()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: S()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": S()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": S()
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
        inset: _()
      }],
      /**
       * Inset Inline
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": _()
      }],
      /**
       * Inset Block
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": _()
      }],
      /**
       * Inset Inline Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-s` in next major release
       */
      start: [{
        "inset-s": _(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        start: _()
      }],
      /**
       * Inset Inline End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-e` in next major release
       */
      end: [{
        "inset-e": _(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        end: _()
      }],
      /**
       * Inset Block Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-bs": [{
        "inset-bs": _()
      }],
      /**
       * Inset Block End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-be": [{
        "inset-be": _()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: _()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: _()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: _()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: _()
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
        z: [j, "auto", c, l]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [V, "full", "auto", d, ...u()]
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
        flex: [g, V, "auto", "initial", "none", l]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", g, c, l]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", g, c, l]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [j, "first", "last", "none", c, l]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": te()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: Ve()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": ce()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": ce()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": te()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: Ve()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": ce()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": ce()
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
        "auto-cols": Ke()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": Ke()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: u()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": u()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": u()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...ve(), "normal"]
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
        content: ["normal", ...ve()]
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
        "place-content": ve()
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
        p: u()
      }],
      /**
       * Padding Inline
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: u()
      }],
      /**
       * Padding Block
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: u()
      }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: u()
      }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: u()
      }],
      /**
       * Padding Block Start
       * @see https://tailwindcss.com/docs/padding
       */
      pbs: [{
        pbs: u()
      }],
      /**
       * Padding Block End
       * @see https://tailwindcss.com/docs/padding
       */
      pbe: [{
        pbe: u()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: u()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: u()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: u()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: u()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: D()
      }],
      /**
       * Margin Inline
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: D()
      }],
      /**
       * Margin Block
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: D()
      }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: D()
      }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: D()
      }],
      /**
       * Margin Block Start
       * @see https://tailwindcss.com/docs/margin
       */
      mbs: [{
        mbs: D()
      }],
      /**
       * Margin Block End
       * @see https://tailwindcss.com/docs/margin
       */
      mbe: [{
        mbe: D()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: D()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: D()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: D()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: D()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": u()
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
        "space-y": u()
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
        inline: ["auto", ...ke()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...ke()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...ke()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...Ce()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...Ce()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...Ce()]
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [d, "screen", ...U()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [
          d,
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
          d,
          "screen",
          "none",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "prose",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          {
            screen: [i]
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
        text: ["base", r, oe, B]
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
        font: [o, vo, po]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", Ae, l]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [yo, bo, t]
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
        "line-clamp": [g, "none", c, it]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          s,
          ...u()
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
        decoration: [...de(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [g, "from-font", "auto", c, B]
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
        "underline-offset": [g, "auto", c, l]
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
        indent: u()
      }],
      /**
       * Tab Size
       * @see https://tailwindcss.com/docs/tab-size
       */
      "tab-size": [{
        tab: [j, c, l]
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
        bg: qe()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: Ue()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: Be()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, j, c, l],
          radial: ["", c, l],
          conic: [j, c, l]
        }, wo, go]
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
        from: Ne()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: Ne()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: Ne()
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
        border: R()
      }],
      /**
       * Border Width Inline
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": R()
      }],
      /**
       * Border Width Block
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": R()
      }],
      /**
       * Border Width Inline Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": R()
      }],
      /**
       * Border Width Inline End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": R()
      }],
      /**
       * Border Width Block Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-bs": [{
        "border-bs": R()
      }],
      /**
       * Border Width Block End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-be": [{
        "border-be": R()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": R()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": R()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": R()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": R()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": R()
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
        "divide-y": R()
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
        border: [...de(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...de(), "hidden", "none"]
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
        outline: [...de(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [g, c, l]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", g, oe, B]
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
          y,
          be,
          pe
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
        "inset-shadow": ["none", v, be, pe]
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
        ring: R()
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
        "ring-offset": [g, B]
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
        "inset-ring": R()
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
        "text-shadow": ["none", C, be, pe]
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
        opacity: [g, c, l]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...Ye(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": Ye()
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
        "mask-linear": [g]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": T()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": T()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": f()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": f()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": T()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": T()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": f()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": f()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": T()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": T()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": f()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": f()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": T()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": T()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": f()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": f()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": T()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": T()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": f()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": f()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": T()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": T()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": f()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": f()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": T()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": T()
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
        "mask-radial-from": T()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": T()
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
        "mask-radial-at": G()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [g]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": T()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": T()
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
        mask: qe()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: Ue()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: Be()
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
        blur: Qe()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [g, c, l]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [g, c, l]
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
          w,
          be,
          pe
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
        grayscale: ["", g, c, l]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [g, c, l]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", g, c, l]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [g, c, l]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", g, c, l]
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
        "backdrop-blur": Qe()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [g, c, l]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [g, c, l]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", g, c, l]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [g, c, l]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", g, c, l]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [g, c, l]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [g, c, l]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", g, c, l]
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
        "border-spacing": u()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": u()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": u()
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
        duration: [g, "initial", c, l]
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
        delay: [g, c, l]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", N, c, l]
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
        perspective: [h, c, l]
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
        rotate: ue()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": ue()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": ue()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": ue()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: me()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": me()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": me()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": me()
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
        skew: Me()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": Me()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": Me()
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
        translate: fe()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": fe()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": fe()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": fe()
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
        zoom: [j, c, l]
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
        "scroll-m": u()
      }],
      /**
       * Scroll Margin Inline
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": u()
      }],
      /**
       * Scroll Margin Block
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": u()
      }],
      /**
       * Scroll Margin Inline Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": u()
      }],
      /**
       * Scroll Margin Inline End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": u()
      }],
      /**
       * Scroll Margin Block Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbs": [{
        "scroll-mbs": u()
      }],
      /**
       * Scroll Margin Block End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbe": [{
        "scroll-mbe": u()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": u()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": u()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": u()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": u()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": u()
      }],
      /**
       * Scroll Padding Inline
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": u()
      }],
      /**
       * Scroll Padding Block
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": u()
      }],
      /**
       * Scroll Padding Inline Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": u()
      }],
      /**
       * Scroll Padding Inline End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": u()
      }],
      /**
       * Scroll Padding Block Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbs": [{
        "scroll-pbs": u()
      }],
      /**
       * Scroll Padding Block End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbe": [{
        "scroll-pbe": u()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": u()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": u()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": u()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": u()
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
        stroke: [g, oe, B, it]
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
}, No = /* @__PURE__ */ eo(Co);
function P(...e) {
  return No(Nt(e));
}
const Mo = Er(
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
), ge = pt.forwardRef(function({ className: t, variant: r, size: o, asChild: n = !1, ...s }, i) {
  return /* @__PURE__ */ p(n ? rr : "button", { ref: i, className: P(Mo({ variant: r, size: o, className: t })), ...s });
});
function So({ ...e }) {
  return /* @__PURE__ */ p(X.Root, { "data-slot": "dropdown-menu", ...e });
}
function Ao({ ...e }) {
  return /* @__PURE__ */ p(X.Trigger, { "data-slot": "dropdown-menu-trigger", ...e });
}
function _o({
  className: e,
  sideOffset: t = 4,
  ...r
}) {
  return /* @__PURE__ */ p(X.Portal, { children: /* @__PURE__ */ p(
    X.Content,
    {
      "data-slot": "dropdown-menu-content",
      sideOffset: t,
      className: P(
        "bg-panel text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border border-border p-1 shadow-md",
        e
      ),
      ...r
    }
  ) });
}
function To({
  className: e,
  inset: t,
  ...r
}) {
  return /* @__PURE__ */ p(
    X.Label,
    {
      "data-slot": "dropdown-menu-label",
      "data-inset": t,
      className: P("px-2 py-1.5 text-xs text-muted data-[inset]:pl-8", e),
      ...r
    }
  );
}
function ct({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ p(
    X.Separator,
    {
      "data-slot": "dropdown-menu-separator",
      className: P("bg-border -mx-1 my-1 h-px", e),
      ...t
    }
  );
}
const jt = pt.forwardRef(
  ({ className: e, type: t, ...r }, o) => /* @__PURE__ */ p(
    "input",
    {
      ref: o,
      type: t,
      "data-slot": "input",
      className: P(
        "flex h-9 w-full min-w-0 rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg shadow-sm shadow-black/0 transition-colors placeholder:text-muted/60 selection:bg-accent/20 selection:text-fg focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60",
        e
      ),
      ...r
    }
  )
);
jt.displayName = "Input";
const Gt = { eu: "/", iso: "-", usa: "/" };
function zo(e) {
  const t = Gt[e];
  return e === "usa" ? `MM${t}DD${t}YYYY` : e === "iso" ? `YYYY${t}MM${t}DD` : `DD${t}MM${t}YYYY`;
}
function dt(e, t) {
  const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e ?? "");
  if (!r) return "";
  const [, o, n, s] = r, i = Gt[t];
  return t === "usa" ? `${n}${i}${s}${i}${o}` : t === "iso" ? `${o}${i}${n}${i}${s}` : `${s}${i}${n}${i}${o}`;
}
function Sn(e, t) {
  const r = (e ?? "").split(/[/\-.]/).map((d) => d.trim());
  if (r.length !== 3 || r.some((d) => !/^\d+$/.test(d))) return "";
  let o, n, s;
  if (t === "usa" ? [n, s, o] = r : t === "iso" ? [o, n, s] = r : [s, n, o] = r, o.length !== 4) return "";
  const i = `${o}-${n.padStart(2, "0")}-${s.padStart(2, "0")}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(i) ? i : "";
}
function ut({ value: e, onChange: t, dateStyle: r, className: o, ...n }) {
  const s = Ht(null), i = r ?? "eu", d = dt(e, i) || zo(i), m = !dt(e, i);
  return /* @__PURE__ */ I(
    "div",
    {
      className: P(
        "dash-kit relative inline-flex h-8 items-center rounded-md border border-border bg-bg text-xs shadow-sm transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20",
        o
      ),
      children: [
        /* @__PURE__ */ p(
          "span",
          {
            "aria-hidden": !0,
            className: P("pointer-events-none px-2.5 pr-7", m && "text-muted/60"),
            children: d
          }
        ),
        /* @__PURE__ */ p(Xt, { "aria-hidden": !0, size: 13, className: "pointer-events-none absolute right-2 text-muted" }),
        /* @__PURE__ */ p(
          "input",
          {
            ...n,
            ref: s,
            type: "date",
            value: e,
            onChange: (a) => t(a.target.value),
            onClick: () => {
              var a;
              try {
                (a = s.current) == null || a.showPicker();
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
const Ft = ["Minutes", "Hours", "Days", "Months", "Years"], k = (e, t) => ({ id: e, label: Le(t), expr: t }), Wt = [
  {
    id: "trailing",
    label: "Trailing",
    hint: "ends now",
    cells: {
      Minutes: [
        k("last-5m", "last-5-minutes"),
        k("last-15m", "last-15-minutes"),
        k("last-30m", "last-30-minutes"),
        k("last-60m", "last-60-minutes")
      ],
      Hours: [
        k("last-3h", "last-3-hours"),
        k("last-6h", "last-6-hours"),
        k("last-12h", "last-12-hours"),
        k("last-24h", "last-24-hours")
      ],
      Days: [
        k("last-7d", "last-7-days"),
        k("last-14d", "last-14-days"),
        k("last-30d", "last-30-days"),
        // Kept alongside `last-3-months` on purpose: 90 fixed days is what people type, 3 calendar
        // months is what a report schedule wants. Different columns, so the difference is visible.
        k("last-90d", "last-90-days")
      ],
      Months: [
        k("last-2mo", "last-2-months"),
        k("last-3mo", "last-3-months"),
        k("last-6mo", "last-6-months"),
        k("last-12mo", "last-12-months")
      ],
      // No `last-1-year`: it resolves IDENTICALLY to `last-12-months` one column left, and two
      // adjacent buttons for one window is a question the reader has to stop and answer. Nothing at
      // 5y either — series retention has GC'd it, so the click returns an empty chart, not an error.
      Years: [k("last-2y", "last-2-years"), k("last-3y", "last-3-years")]
    }
  },
  {
    id: "calendar",
    label: "Calendar",
    hint: "whole period",
    cells: {
      // No "this minute" — nobody reaches for it, and an empty cell is information, not a gap.
      Minutes: [],
      Hours: [k("this-hour", "this-hour"), k("last-hour", "last-hour")],
      Days: [
        k("today", "today"),
        k("yesterday", "yesterday"),
        k("this-week", "this-week"),
        k("last-week", "last-week")
      ],
      Months: [
        k("this-month", "this-month"),
        k("last-month", "last-month"),
        k("this-quarter", "this-quarter"),
        k("last-quarter", "last-quarter")
      ],
      Years: [k("this-year", "this-year"), k("last-year", "last-year")]
    }
  }
], An = Wt.flatMap(
  (e) => Ft.flatMap((t) => e.cells[t])
), _e = /^\d{4}-\d{2}-\d{2}$/;
function _n({
  from: e,
  to: t,
  onApply: r,
  timezone: o,
  compact: n,
  dateStyle: s,
  onUserApply: i
}) {
  const [d, m] = se(!1), a = ur(), y = kt((a == null ? void 0 : a.zone) ?? vt, o), v = _e.test(e) && t ? "" : e, [C, w] = se(v), x = ne(
    () => _e.test(e) && t && _e.test(t) ? { from: e, to: t } : { from: "", to: "" },
    [e, t]
  ), [h, b] = se(x);
  $e(() => {
    w(v), b(x);
  }, [e, t]);
  const E = ne(() => Date.now(), [d]), N = ne(() => {
    const M = C.trim();
    if (!M) return null;
    const S = Ar(M, void 0, E, y);
    return S ? { text: `${M} → ${Ee(S.fromMs, y)} → ${Ee(S.toMs, y)}` } : { error: "Not a range expression — try last-3-months, this-month, now-4h." };
  }, [C, E, y]), $ = (M) => {
    i == null || i(), r(M), m(!1);
  }, G = h.from !== e || h.to !== t, F = !!h.from && !!h.to && h.from > h.to;
  return /* @__PURE__ */ I(So, { open: d, onOpenChange: m, children: [
    /* @__PURE__ */ p(Ao, { asChild: !0, children: /* @__PURE__ */ I(
      ge,
      {
        variant: "outline",
        size: "sm",
        className: P("dash-kit gap-1.5 px-2.5 text-xs font-normal", n ? "h-11 md:h-8" : "h-8"),
        title: "Change the dashboard time range",
        children: [
          /* @__PURE__ */ p(Jt, { size: 13, className: "text-muted" }),
          /* @__PURE__ */ p("span", { className: "max-w-[13rem] truncate", children: n ? Rr(e, t) : Le(e, t) }),
          /* @__PURE__ */ p(er, { size: 13, className: "text-muted" })
        ]
      }
    ) }),
    /* @__PURE__ */ I(
      _o,
      {
        align: "end",
        className: P(
          "dash-kit max-w-[calc(100vw-2rem)] p-0",
          n ? "w-[calc(100vw-2rem)]" : "w-[42rem]"
        ),
        children: [
          /* @__PURE__ */ p(To, { className: "px-3 pt-2.5 text-[0.7rem] uppercase tracking-wide text-muted", children: "Quick ranges" }),
          /* @__PURE__ */ p("div", { className: "px-1.5 pb-2", children: Wt.map((M) => /* @__PURE__ */ I("div", { className: "mb-1 last:mb-0", children: [
            /* @__PURE__ */ I("div", { className: "flex items-baseline gap-1.5 px-1 pb-0.5 pt-1", children: [
              /* @__PURE__ */ p("span", { className: "text-[0.7rem] font-medium uppercase tracking-wide text-muted", children: M.label }),
              /* @__PURE__ */ p("span", { className: "text-[0.65rem] text-muted", children: M.hint })
            ] }),
            /* @__PURE__ */ p("div", { className: P("grid gap-x-1 gap-y-0.5", n ? "grid-cols-2" : "grid-cols-5"), children: Ft.map((S) => {
              const u = M.cells[S];
              return n && u.length === 0 ? null : /* @__PURE__ */ I("div", { className: "min-w-0", children: [
                !n && /* @__PURE__ */ p("div", { className: "px-2 pb-0.5 text-[0.65rem] uppercase tracking-wide text-muted/70", children: S }),
                u.map((_) => {
                  const te = !t && _.expr === e;
                  return /* @__PURE__ */ I(
                    ge,
                    {
                      variant: "ghost",
                      size: "sm",
                      className: P(
                        "w-full justify-start gap-1.5 px-2 text-xs font-normal",
                        n ? "h-10" : "h-8",
                        te && "bg-muted-bg font-medium text-fg"
                      ),
                      onClick: () => $({ from: _.expr }),
                      children: [
                        /* @__PURE__ */ p(
                          tr,
                          {
                            size: 12,
                            className: P("shrink-0 text-accent", !te && "invisible")
                          }
                        ),
                        /* @__PURE__ */ p("span", { className: "truncate", children: _.label })
                      ]
                    },
                    _.id
                  );
                })
              ] }, S);
            }) })
          ] }, M.id)) }),
          /* @__PURE__ */ p(ct, { className: "my-0" }),
          /* @__PURE__ */ I("div", { className: "space-y-1.5 px-3 py-2.5", children: [
            /* @__PURE__ */ p("div", { className: "text-[0.7rem] uppercase tracking-wide text-muted", children: "Relative range" }),
            /* @__PURE__ */ I(
              "form",
              {
                className: "flex items-center gap-1.5",
                onSubmit: (M) => {
                  M.preventDefault(), C.trim() && N && !("error" in N) && $({ from: C.trim() });
                },
                children: [
                  /* @__PURE__ */ p(
                    jt,
                    {
                      "aria-label": "dashboard relative range",
                      className: "h-8 flex-1 text-xs",
                      placeholder: "last-3-months, this-quarter, now-4h…",
                      value: C,
                      onChange: (M) => w(M.target.value)
                    }
                  ),
                  /* @__PURE__ */ p(
                    ge,
                    {
                      type: "submit",
                      size: "sm",
                      className: "h-8 text-xs",
                      disabled: !C.trim() || !N || "error" in N,
                      title: "Apply this relative range — re-queries every panel",
                      children: "Apply"
                    }
                  )
                ]
              }
            ),
            N && ("error" in N ? /* @__PURE__ */ p("p", { className: "text-[0.7rem] text-danger", children: N.error }) : /* @__PURE__ */ p("p", { className: "truncate text-[0.7rem] text-muted", title: N.text, children: N.text }))
          ] }),
          /* @__PURE__ */ p(ct, { className: "my-0" }),
          /* @__PURE__ */ I("div", { className: "space-y-2 px-3 py-2.5", children: [
            /* @__PURE__ */ p("div", { className: "text-[0.7rem] uppercase tracking-wide text-muted", children: "Absolute range" }),
            /* @__PURE__ */ I("div", { className: "flex items-center gap-1.5 text-xs text-muted", children: [
              /* @__PURE__ */ p(
                ut,
                {
                  "aria-label": "dashboard range from",
                  dateStyle: s,
                  className: "flex-1",
                  value: h.from,
                  onChange: (M) => b((S) => ({ ...S, from: M }))
                }
              ),
              /* @__PURE__ */ p("span", { children: "to" }),
              /* @__PURE__ */ p(
                ut,
                {
                  "aria-label": "dashboard range to",
                  dateStyle: s,
                  className: "flex-1",
                  value: h.to ?? "",
                  onChange: (M) => b((S) => ({ ...S, to: M }))
                }
              )
            ] }),
            F ? /* @__PURE__ */ p("p", { className: "text-[0.7rem] text-danger", children: "The start date must not be after the end date." }) : /* @__PURE__ */ p("p", { className: "text-[0.7rem] text-muted", children: "The end date is exclusive — it ends at the start of that day." }),
            /* @__PURE__ */ p(
              ge,
              {
                size: "sm",
                className: "h-8 w-full text-xs",
                disabled: !G || F || !h.from || !h.to,
                title: G ? "Apply this range — re-queries every panel" : "This range is already applied",
                onClick: () => $({ from: h.from, to: h.to }),
                children: "Apply range"
              }
            )
          ] })
        ]
      }
    )
  ] });
}
const Vt = 3e4;
function Ro() {
  return new or({
    defaultOptions: {
      queries: {
        // A read either resolves or honestly denies — never retry it into a fabricated success (§9).
        retry: !1,
        // No window refocus refetch: the refresh TICK (in the key) is the freshness signal, not focus.
        refetchOnWindowFocus: !1,
        // Floor stale window; tick-keyed reads are effectively "fresh until the next tick" via the key.
        staleTime: 0,
        gcTime: Vt
      }
    }
  });
}
function we(e) {
  return new Promise((t, r) => {
    e.oncomplete = e.onsuccess = () => t(e.result), e.onabort = e.onerror = () => r(e.error);
  });
}
function Eo(e, t) {
  let r;
  const o = () => {
    if (r)
      return r;
    const n = indexedDB.open(e);
    return n.onupgradeneeded = () => n.result.createObjectStore(t), r = we(n), r.then((s) => {
      s.onclose = () => r = void 0;
    }, () => {
      r = void 0;
    }), r;
  };
  return (n, s) => o().then((i) => s(i.transaction(t, n).objectStore(t)));
}
let Te;
function Fe() {
  return Te || (Te = Eo("keyval-store", "keyval")), Te;
}
function Io(e, t = Fe()) {
  return t("readonly", (r) => we(r.get(e)));
}
function Po(e, t, r = Fe()) {
  return r("readwrite", (o) => (o.put(t, e), we(o.transaction)));
}
function $o(e, t = Fe()) {
  return t("readwrite", (r) => (r.delete(e), we(r.transaction)));
}
const Kt = "v1", Do = 7 * 24 * 60 * 6e4, Oo = "quick-";
function Lo(e) {
  return `lb.quick-cache.${Kt}.${e}`;
}
function jo(e) {
  const t = Lo(e);
  return {
    persistClient: (r) => Po(t, r).catch(() => {
    }),
    restoreClient: () => Io(t).catch(() => {
    }),
    removeClient: () => $o(t).catch(() => {
    })
  };
}
const Go = 250;
function Fo(e, t) {
  const [r, o] = t.queryKey;
  return typeof r == "string" && r.startsWith(Oo) && o === e && t.state.status === "success";
}
function Wo(e, t) {
  if (!t) return () => {
  };
  const r = {
    queryClient: e,
    persister: jo(t),
    maxAge: Do,
    // The buster is BELT AND BRACES with the versioned storage key: the key stops a stale store from
    // being found at all, this stops one that somehow was.
    buster: Kt,
    dehydrateOptions: { shouldDehydrateQuery: (d) => Fo(t, d) }
  };
  let o = !1, n = null, s = null;
  const i = () => {
    o || n || (n = setTimeout(() => {
      n = null, o || ir(r);
    }, Go));
  };
  return sr(r).catch(() => {
  }).then(() => {
    o || (i(), s = e.getQueryCache().subscribe(i));
  }), () => {
    o = !0, n && clearTimeout(n), s == null || s();
  };
}
const We = ae(null);
function Tn() {
  const e = Y(We);
  if (e === null) throw new Error("useDashboardWs: no DashboardCacheProvider in tree");
  return e;
}
function zn() {
  return Y(We);
}
function Vo({ ws: e, children: t }) {
  const [r] = se(Ro);
  return $e(() => Wo(r, e), [r, e]), /* @__PURE__ */ p(We.Provider, { value: e, children: /* @__PURE__ */ p(nr, { client: r, children: t }) });
}
const ze = "[A-Za-z_][\\w.]*", mt = new RegExp(
  // ${name} or ${name:format}
  `\\$\\{(${ze})(?::[a-z]+)?\\}|\\[\\[(${ze})(?::[a-z]+)?\\]\\]|\\$(${ze})`,
  "g"
);
function Ko(e) {
  const t = [], r = /* @__PURE__ */ new Set();
  let o;
  for (mt.lastIndex = 0; (o = mt.exec(e)) !== null; ) {
    const n = o[1] ?? o[2] ?? o[3];
    n && !r.has(n) && (r.add(n), t.push(n));
  }
  return t;
}
const qo = "__";
function Uo(e) {
  return e.startsWith(qo);
}
function Bo(e) {
  const t = [], r = /* @__PURE__ */ new Set(), o = (n) => {
    if (typeof n == "string")
      for (const s of Ko(n))
        r.has(s) || (r.add(s), t.push(s));
    else Array.isArray(n) ? n.forEach(o) : n && typeof n == "object" && Object.values(n).forEach(o);
  };
  return o(e), t;
}
const Yo = " / ";
function Rn(e, t) {
  var n;
  const r = {}, o = ((n = e == null ? void 0 : e.path) == null ? void 0 : n.filter((s) => s != null)) ?? [];
  return o.length > 0 && (r["__nav.label"] = o[o.length - 1], o.length > 1 && (r["__nav.parent.label"] = o[o.length - 2]), o.length > 2 && (r["__nav.parent.parent.label"] = o[o.length - 3]), r["__nav.path"] = o.join(Yo), (e == null ? void 0 : e.id) !== void 0 && (r["__nav.id"] = e.id)), t && (t.id !== void 0 && (r["__page.id"] = t.id), t.title !== void 0 && (r["__page.title"] = t.title), (t.id !== void 0 || t.title !== void 0) && (r["__page.ext"] = t.ext ?? "")), r;
}
const ft = "scope";
function Qo(e) {
  let t = e;
  if (e && typeof e == "object" && !Array.isArray(e) && ft in e) {
    const { [ft]: r, ...o } = e;
    t = o;
  }
  return new Set(Bo(t).filter(Uo));
}
function qt(e, t) {
  if (!t || typeof t != "object" || Array.isArray(t)) return t;
  const { builtins: r, ...o } = t;
  if (!r || typeof r != "object" || Array.isArray(r))
    return t;
  const n = Qo(e), s = {};
  let i = !1;
  for (const [d, m] of Object.entries(
    r
  ))
    n.has(d) && (s[d] = m, i = !0);
  return i ? { ...o, builtins: s } : { ...o };
}
function ie(e) {
  if (Array.isArray(e)) return e.map(ie);
  if (e && typeof e == "object") {
    const t = {};
    for (const r of Object.keys(e).sort()) {
      const o = e[r];
      o !== void 0 && (t[r] = ie(o));
    }
    return t;
  }
  return e;
}
function En(e, t) {
  return [
    "viz.query",
    e,
    ie({ ...t, scope: qt(t, t.scope) })
  ];
}
function In(e, t) {
  return [
    "viz.fetch",
    e,
    ie({ ...t, scope: qt(t, t.scope) })
  ];
}
function Pn(e, t) {
  return ["viz.shape", e, ie(t)];
}
function $n(e, t, r) {
  return ["flows.node_state", e, t, r];
}
function Dn(e, t) {
  return ["series.read", e, t];
}
function On(e) {
  return ["source-picker", e];
}
function Zo(e) {
  return ["datasource.list", e];
}
function Ho(e, t) {
  return {
    queryKey: Zo(e),
    queryFn: () => t(),
    staleTime: Vt
  };
}
function Ln(e, t, r) {
  return e.fetchQuery(Ho(t, r));
}
const Xo = 120;
function jn({
  refreshMs: e,
  cacheTtlS: t
}) {
  return typeof e == "number" && e > 0 ? Math.max(1, Math.round(e / 1e3)) : t === 0 ? 0 : typeof t == "number" && t > 0 ? Math.floor(t) : Xo;
}
function Gn({ ws: e, children: t }) {
  return /* @__PURE__ */ p(Vo, { ws: e, children: t });
}
function Fn(e, t) {
  const [r, o] = se(e);
  return $e(() => {
    const n = setTimeout(() => o(e), t);
    return () => clearTimeout(n);
  }, [e, t]), r;
}
const Ut = ae(!1), Wn = Ut.Provider;
function Vn() {
  return Y(Ut);
}
const Bt = ae(0), Kn = Bt.Provider;
function qn() {
  return Y(Bt);
}
const ht = 64, Jo = "viz.query_batch", en = "viz.query";
function tn(e, t = {}) {
  const r = t.windowMs ?? 12, o = t.batchTool ?? Jo, n = t.singleTool ?? en;
  let s = [], i = null, d = !0;
  const m = () => {
    i === null && (i = setTimeout(a, r));
  }, a = () => {
    i = null;
    const w = s;
    if (s = [], w.length !== 0)
      for (let x = 0; x < w.length; x += ht)
        y(w.slice(x, x + ht));
  }, y = async (w) => {
    if (!d) {
      await v(w);
      return;
    }
    const x = rn(w), h = { panels: w.map((b) => b.panel), now: 0 };
    x && (h.cache = x);
    try {
      const b = await e(o, h), E = (b == null ? void 0 : b.results) ?? [];
      w.forEach((N, $) => C(N, E[$]));
    } catch (b) {
      on(b) && (d = !1), await v(w);
    }
  }, v = async (w) => {
    await Promise.all(
      w.map(async (x) => {
        try {
          const h = { panel: x.panel };
          x.cache && (h.cache = x.cache);
          const b = await e(n, h);
          x.resolve({ frames: (b == null ? void 0 : b.frames) ?? [], rows: b == null ? void 0 : b.rows });
        } catch (h) {
          x.reject(h);
        }
      })
    );
  }, C = (w, x) => {
    if (!x) {
      w.reject(new Error("viz.query_batch: missing result slice"));
      return;
    }
    if ("status" in x && (x.status === "error" || x.status === "denied")) {
      w.reject(new Error(x.message || x.status));
      return;
    }
    const h = x;
    w.resolve({ frames: h.frames ?? [], rows: h.rows });
  };
  return {
    load(w, x) {
      return new Promise((h, b) => {
        s.push({ panel: w, cache: x, resolve: h, reject: b }), m();
      });
    },
    get supported() {
      return d;
    }
  };
}
function rn(e) {
  let t = 0;
  for (const r of e) r.cache && r.cache.ttl_s > t && (t = r.cache.ttl_s);
  return t > 0 ? { ttl_s: t } : void 0;
}
function on(e) {
  const t = (e instanceof Error ? e.message : String(e ?? "")).toLowerCase();
  return /not.?found|unknown (tool|command|verb|method)|no such|unsupported|\b400\b|\b404\b|unrecognized/.test(
    t
  );
}
const Yt = ae(null);
function Un() {
  return Y(Yt);
}
function Bn({ call: e, children: t }) {
  const r = le(), o = ne(
    () => tn(e ?? ((n, s) => r.client.call(n, s))),
    [e, r.client]
  );
  return /* @__PURE__ */ p(Yt.Provider, { value: o, children: t });
}
export {
  Cr as BROWSER_TZ,
  qo as BUILTIN_PREFIX,
  bn as DASH_KIT_READ_CAPS,
  pn as DASH_KIT_READ_SCOPE,
  Cn as DEFAULT_RANGE_EXPR,
  Xo as DEFAULT_TTL_S,
  Vo as DashboardCacheProvider,
  _n as DashboardRangePicker,
  We as DashboardWsContext,
  Wn as FreezeProvider,
  Kn as FreshnessProvider,
  Re as KitDeniedError,
  gn as KitProvider,
  Vt as LIST_STALE_MS,
  ht as MAX_PANELS,
  Yo as NAV_PATH_SEP,
  ut as PrefDateInput,
  Do as QUICK_PERSIST_MAX_AGE_MS,
  Kt as QUICK_PERSIST_VERSION,
  Wt as RANGE_BANDS,
  Ft as RANGE_COLUMNS,
  An as RANGE_PRESETS,
  Bn as VizBatchProvider,
  Gn as WithDashboardCache,
  dr as browserZone,
  ie as canon,
  Zo as datasourceListKey,
  Ho as datasourceListQueryOptions,
  zo as datePlaceholder,
  Ko as extractVarNames,
  Bo as extractVarNamesDeep,
  Ln as fetchDatasourceList,
  $n as flowNodeStateKey,
  dt as formatDateField,
  Uo as isBuiltinName,
  mn as isKitDenied,
  fn as isOutOfScope,
  kn as isWindowExpr,
  Ee as isoDayOf,
  Le as labelOf,
  Ro as makeDashboardQueryClient,
  cr as makeInsightsClient,
  hn as makeKitClient,
  lr as makeSourceLoaders,
  tn as makeVizBatchLoader,
  Rn as navBuiltins,
  Oe as normalizeTz,
  Sn as parseDateField,
  ye as parseRangeExpr,
  Wo as persistQuickCache,
  kt as preferredZone,
  Mn as previewBound,
  jo as quickPersister,
  Nn as rangeTimezone,
  jn as resolveFreshnessTtl,
  Ar as resolveRange,
  qt as scopeKey,
  Dn as seriesReadKey,
  Rr as shortLabelOf,
  On as sourcePickerKey,
  ar as toolCallOf,
  Tn as useDashboardWs,
  zn as useDashboardWsOptional,
  Fn as useDebounced,
  Vn as useFreeze,
  qn as useFreshness,
  le as useKit,
  yn as useKitClient,
  ur as useKitOptional,
  wn as useKitTheme,
  xn as useKitWs,
  vn as useKitZone,
  Un as useVizBatchLoader,
  In as vizFetchKey,
  En as vizQueryKey,
  Pn as vizShapeKey
};
