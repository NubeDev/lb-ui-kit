var Dr = Object.defineProperty;
var Pr = (e, t, r) => t in e ? Dr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Be = (e, t, r) => Pr(e, typeof t != "symbol" ? t + "" : t, r);
import { jsx as i, jsxs as b, Fragment as Or } from "react/jsx-runtime";
import * as z from "react";
import { createContext as ke, useMemo as fe, useContext as le, useRef as V, useState as R, useEffect as G, useCallback as W } from "react";
import { Calendar as Lr, CalendarRange as Fr, ChevronDown as Gr, Check as Bt, ChevronRight as Kt, Table2 as jr, Inbox as qt, Lightbulb as Ze, Hash as Wr, LineChart as Br, Database as Kr, X as Vt, RefreshCw as Ie, CheckCheck as yt, PanelLeftIcon as qr, BarChart3 as Vr, TableProperties as Ur, AlertTriangle as Hr, Lock as Yr, Loader2 as Qr } from "lucide-react";
import { Slot as rt } from "@radix-ui/react-slot";
import * as pe from "@radix-ui/react-dropdown-menu";
import { QueryClient as Zr, QueryClientProvider as Xr } from "@tanstack/react-query";
import { persistQueryClientRestore as Jr, persistQueryClientSave as en } from "@tanstack/react-query-persist-client";
import * as he from "@radix-ui/react-collapsible";
import * as j from "@radix-ui/react-dialog";
import * as ye from "@radix-ui/react-tooltip";
class Xe extends Error {
  constructor(r, n) {
    super(`denied: ${r} — ${n}`);
    Be(this, "denied", !0);
    Be(this, "tool");
    this.name = "KitDeniedError", this.tool = r;
  }
}
function tn(e) {
  return e instanceof Xe;
}
function Wi(e) {
  return e instanceof Error && e.message.startsWith("out_of_scope:");
}
function rn(e) {
  if (typeof e == "function") return e;
  const t = e;
  return (r, n) => t.call(r, n);
}
function Y(e, t) {
  if (!e || typeof e != "object") return [];
  const r = e[t];
  return Array.isArray(r) ? r : [];
}
function nn(e, t = {}) {
  const r = {
    listSeries: () => e("series.list", {}).then((n) => Y(n, "series")),
    listExtensions: () => e("ext.list", {}).then((n) => Y(n, "extensions")),
    listFlows: () => e("flows.list", {}).then((n) => Y(n, "flows")),
    // `flows.get` answers the flow BARE (not enveloped). A flow the caller can list but not read
    // rejects; the picker skips it rather than failing the whole bundle, so map a rejection to null.
    getFlow: (n) => e("flows.get", { id: n }).then((o) => o && typeof o == "object" ? o : null).catch(() => null),
    listFlowNodes: () => e("flows.nodes", {}).then((n) => Y(n, "nodes")),
    listDatasources: () => e("datasource.list", {}).then((n) => Y(n, "datasources")),
    listRules: () => e("rules.list", {}).then((n) => Y(n, "rules")),
    listQueries: () => e("query.list", {}).then((n) => Y(n, "queries")),
    // `store.schema` answers the schema BARE. An absent/!object reply is an empty schema, not a throw.
    readSchema: () => e("store.schema", {}).then(
      (n) => n && typeof n == "object" ? n : { tables: [] }
    ),
    listChannels: () => e("channel.list", {}).then((n) => Y(n, "channels")),
    listInsights: () => e("insight.list", {}).then((n) => Y(n, "items"))
  };
  if (t.inboxChannel) {
    const n = t.inboxChannel;
    r.listInbox = () => e("inbox.list", { channel: n }).then((o) => Y(o, "items"));
  }
  return r;
}
function on(e) {
  return {
    list: (t) => e("insight.list", { ...t }).then((r) => r ?? { items: [] }),
    get: (t) => e("insight.get", { id: t }).then((r) => r ?? null),
    occurrences: (t, r, n) => e("insight.occurrences", {
      insight_id: t,
      cursor: r,
      limit: n ?? 50
    }).then((o) => o ?? { items: [] }),
    ack: () => Promise.reject(
      new Xe(
        "insight.ack",
        "the kit is a READ kit; extension bridge writes are not implemented (U-ext-bridge-write)"
      )
    ),
    resolve: () => Promise.reject(
      new Xe(
        "insight.resolve",
        "the kit is a READ kit; extension bridge writes are not implemented (U-ext-bridge-write)"
      )
    )
    // No `subscribe`: a live tail needs a stream seam the leashed call does not carry. Omitting it is
    // the interface's documented "no feed" case, so the hooks fall back to act→refresh.
  };
}
function Bi(e, t = {}) {
  const r = rn(e);
  return {
    call: r,
    loaders: nn(r, t),
    insights: on(r)
  };
}
const Ki = [
  "viz.query",
  "viz.query_batch",
  "series.read",
  "series.latest",
  "series.find",
  // Tier 2b: `PanelEmbed`'s library mode reads a curated panel by id. Without this entry the embed's
  // `panel.get` is rejected client-side as `out_of_scope` and the page renders a denial over a panel
  // the viewer can actually read — the same silent-under-render trap the batch verb has.
  "panel.get"
], qi = [
  "mcp:viz.query:call",
  "mcp:series.read:call",
  "mcp:series.latest:call",
  "mcp:series.find:call",
  // Needed only by a page that embeds a LIBRARY panel (`PanelEmbed id=…`); an inline-cell embed does
  // not read the record. Requested anyway rather than left to be discovered: an admin who does not want
  // it declines it, and the embed renders an honest denial naming the verb.
  "mcp:panel.get:call"
];
function sn() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
const nt = ke(null);
function Vi({ client: e, ws: t, theme: r, zone: n, children: o }) {
  const s = fe(
    () => ({ client: e, ws: t, theme: r, zone: n ?? sn }),
    [e, t, r, n]
  );
  return /* @__PURE__ */ i(nt.Provider, { value: s, children: o });
}
function Ut() {
  return le(nt);
}
function De() {
  const e = le(nt);
  if (!e)
    throw new Error(
      "useKit: no <KitProvider>. Wrap the page: <KitProvider client={makeKitClient(bridge)} ws={ctx.workspace}>"
    );
  return e;
}
function an() {
  return De().client;
}
function ln() {
  return De().ws;
}
function Ui() {
  return De().theme;
}
function Hi() {
  return De().zone;
}
const cn = 864e5;
function be(e, t, r) {
  e -= t <= 2 ? 1 : 0;
  const n = Math.floor((e >= 0 ? e : e - 399) / 400), o = e - n * 400, s = Math.floor((153 * (t + (t > 2 ? -3 : 9)) + 2) / 5) + r - 1, a = o * 365 + Math.floor(o / 4) - Math.floor(o / 100) + s;
  return n * 146097 + a - 719468;
}
function Ht(e) {
  e += 719468;
  const t = Math.floor((e >= 0 ? e : e - 146096) / 146097), r = e - t * 146097, n = Math.floor(
    (r - Math.floor(r / 1460) + Math.floor(r / 36524) - Math.floor(r / 146096)) / 365
  ), o = n + t * 400, s = r - (365 * n + Math.floor(n / 4) - Math.floor(n / 100)), a = Math.floor((5 * s + 2) / 153), l = s - Math.floor((153 * a + 2) / 5) + 1, d = a + (a < 10 ? 3 : -9);
  return { y: o + (d <= 2 ? 1 : 0), mo: d, d: l };
}
function Yt(e, t) {
  const r = t === 12 ? { y: e + 1, mo: 1 } : { y: e, mo: t + 1 };
  return be(r.y, r.mo, 1) - be(e, t, 1);
}
function dn(e, t, r, n) {
  return (be(e, t, r) % 7 + (n === "sunday" ? 4 : 3) + 7) % 7;
}
const vt = /* @__PURE__ */ new Map();
function Qt(e) {
  let t = vt.get(e);
  return t || (t = new Intl.DateTimeFormat("en-US", {
    timeZone: e,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }), vt.set(e, t)), t;
}
function ot(e) {
  if (!e) return "UTC";
  try {
    return Qt(e), e;
  } catch {
    return "UTC";
  }
}
function ge(e, t) {
  const r = Qt(t).formatToParts(e), n = (o) => {
    var s;
    return Number(((s = r.find((a) => a.type === o)) == null ? void 0 : s.value) ?? 0);
  };
  return { y: n("year"), mo: n("month"), d: n("day"), h: n("hour") % 24, mi: n("minute"), s: n("second") };
}
function Zt(e) {
  return be(e.y, e.mo, e.d) * cn + ((e.h * 60 + e.mi) * 60 + e.s) * 1e3;
}
function kt(e, t) {
  return Zt(ge(e, t)) - e;
}
function q(e, t) {
  const r = Zt(e), n = r - kt(r, t);
  return r - kt(n, t);
}
function Je(e, t) {
  const r = ge(e, t), n = (o, s = 2) => String(o).padStart(s, "0");
  return `${n(r.y, 4)}-${n(r.mo)}-${n(r.d)}`;
}
const Nt = {
  s: "s",
  m: "m",
  h: "h",
  d: "d",
  w: "w",
  M: "M",
  y: "y"
}, un = {
  second: "s",
  minute: "m",
  hour: "h",
  day: "d",
  week: "w",
  month: "M",
  quarter: "q",
  year: "y"
}, mn = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  y: "year"
}, fn = /^now(?:([+-])(\d{1,6})([smhdwMy]))?(?:\/([smhdwMy]))?$/, hn = /^(\d{4})-(\d{2})-(\d{2})$/, pn = /^\d{13}$/, bn = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?$/, gn = /^(this|last|next)-(hour|day|week|month|quarter|year)$/, wn = /^last-(\d{1,6})-(second|minute|hour|day|week|month|quarter|year)s?$/, xn = /^last-(\d{1,6})([smhdwMy])$/, Xt = "expected now±<n><unit> (units s m h d w M y, optional /<unit> snap), an ISO day or instant, 13-digit epoch ms, today/yesterday/tomorrow, this-/last-/next-<unit>, or last-<n>-<unit>s";
function Te(e) {
  return { ok: !1, error: `unrecognized range expression "${e}" — ${Xt}` };
}
function Ct(e, t, r) {
  return t >= 1 && t <= 12 && r >= 1 && r <= Yt(e, t);
}
function Ae(e) {
  const t = e.trim();
  if (!t) return { ok: !1, error: `empty range expression — ${Xt}` };
  if (t === "today") return ue({ kind: "day", offset: 0 });
  if (t === "yesterday") return ue({ kind: "day", offset: -1 });
  if (t === "tomorrow") return ue({ kind: "day", offset: 1 });
  const r = gn.exec(t);
  if (r)
    return ue({ kind: "period", rel: r[1], unit: r[2] });
  const n = wn.exec(t);
  if (n) return ue({ kind: "trailing", n: Number(n[1]), unit: un[n[2]] });
  const o = xn.exec(t);
  if (o) return ue({ kind: "trailing", n: Number(o[1]), unit: Nt[o[2]] });
  const s = fn.exec(t);
  if (s) {
    const [, d, c, u, p] = s;
    return we({
      kind: "now",
      ...d ? { offset: { sign: d === "-" ? -1 : 1, n: Number(c), unit: Nt[u] } } : {},
      ...p ? { snap: mn[p] } : {}
    });
  }
  const a = hn.exec(t);
  if (a) {
    const [d, c, u] = [Number(a[1]), Number(a[2]), Number(a[3])];
    return Ct(d, c, u) ? we({ kind: "isoDay", y: d, mo: c, d: u }) : Te(e);
  }
  if (pn.test(t)) return we({ kind: "instant", ms: Number(t) });
  const l = bn.exec(t);
  if (l) {
    const [, d, c, u, p, x, g, m, f] = l;
    if (!Ct(Number(d), Number(c), Number(u)) || Number(p) > 23 || Number(x) > 59) return Te(e);
    if (f) {
      const v = Date.parse(t);
      return Number.isFinite(v) ? we({ kind: "instant", ms: v }) : Te(e);
    }
    return we({
      kind: "wall",
      y: Number(d),
      mo: Number(c),
      d: Number(u),
      h: Number(p),
      mi: Number(x),
      s: Number(g ?? 0),
      ms: Number((m ?? "0").padEnd(3, "0"))
    });
  }
  return Te(e);
}
function Yi(e) {
  const t = Ae(e);
  return t.ok && t.expr.type === "window";
}
function ue(e) {
  return { ok: !0, expr: { type: "window", window: e } };
}
function we(e) {
  return { ok: !0, expr: { type: "endpoint", endpoint: e } };
}
const yn = "browser";
function Jt() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
function er(e, ...t) {
  for (const r of t)
    if (r && r !== yn) return r;
  return e();
}
const Qi = "last-30-days";
function Zi(e, t, r = Jt) {
  return ot(er(r, e, t));
}
function vn(e, t) {
  const r = e.y * 12 + (e.mo - 1) + t, n = Math.floor(r / 12), o = (r % 12 + 12) % 12 + 1;
  return { ...e, y: n, mo: o, d: Math.min(e.d, Yt(n, o)) };
}
function ae(e, t, r, n) {
  switch (r) {
    case "s":
      return e + t * 1e3;
    case "m":
      return e + t * 6e4;
    case "h":
      return e + t * 36e5;
    case "d":
    case "w": {
      const o = ge(e, n), s = r === "w" ? t * 7 : t, a = Ht(be(o.y, o.mo, o.d) + s);
      return q({ ...o, ...a }, n);
    }
    case "M":
    case "q":
    case "y": {
      const o = r === "M" ? t : r === "q" ? t * 3 : t * 12;
      return q(vn(ge(e, n), o), n);
    }
  }
}
function kn(e) {
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
function et(e, t, r, n) {
  if (t === "second") return Math.floor(e / 1e3) * 1e3;
  const o = ge(e, r), s = n ?? "monday";
  switch (t) {
    case "minute":
      return q({ ...o, s: 0 }, r);
    case "hour":
      return q({ ...o, mi: 0, s: 0 }, r);
    case "day":
      return q({ ...o, h: 0, mi: 0, s: 0 }, r);
    case "week": {
      const a = Ht(be(o.y, o.mo, o.d) - dn(o.y, o.mo, o.d, s));
      return q({ ...o, ...a, h: 0, mi: 0, s: 0 }, r);
    }
    case "month":
      return q({ ...o, d: 1, h: 0, mi: 0, s: 0 }, r);
    case "quarter":
      return q({ ...o, mo: Math.floor((o.mo - 1) / 3) * 3 + 1, d: 1, h: 0, mi: 0, s: 0 }, r);
    case "year":
      return q({ ...o, mo: 1, d: 1, h: 0, mi: 0, s: 0 }, r);
    default:
      return e;
  }
}
function St(e, t, r, n) {
  switch (e.kind) {
    case "now": {
      let o = t;
      return e.offset && (o = ae(o, e.offset.sign * e.offset.n, e.offset.unit, r)), e.snap && (o = et(o, e.snap, r, n)), o;
    }
    case "isoDay":
      return q({ y: e.y, mo: e.mo, d: e.d, h: 0, mi: 0, s: 0 }, r);
    case "instant":
      return e.ms;
    case "wall":
      return q({ y: e.y, mo: e.mo, d: e.d, h: e.h, mi: e.mi, s: e.s }, r) + e.ms;
  }
}
function Nn(e, t, r, n) {
  switch (e.kind) {
    case "day": {
      const o = ae(et(t, "day", r), e.offset, "d", r);
      return e.offset === 0 ? { fromMs: o, toMs: t } : { fromMs: o, toMs: ae(o, 1, "d", r) };
    }
    case "period": {
      const o = et(t, e.unit, r, n), s = kn(e.unit);
      return e.rel === "this" ? { fromMs: o, toMs: t } : e.rel === "last" ? { fromMs: ae(o, -1, s, r), toMs: o } : { fromMs: ae(o, 1, s, r), toMs: ae(o, 2, s, r) };
    }
    case "trailing":
      return { fromMs: ae(t, -e.n, e.unit, r), toMs: t };
  }
}
function Cn(e, t, r, n, o) {
  if (!e || !e.trim()) return null;
  const s = ot(n), a = Ae(e);
  if (!a.ok) return null;
  if (a.expr.type === "window")
    return t && t.trim() ? null : Nn(a.expr.window, r, s, o);
  const l = St(a.expr.endpoint, r, s, o);
  let d = r;
  if (t && t.trim()) {
    const c = Ae(t);
    if (!c.ok || c.expr.type !== "endpoint") return null;
    d = St(c.expr.endpoint, r, s, o);
  }
  return l <= d ? { fromMs: l, toMs: d } : null;
}
function Xi(e, t) {
  const r = ot(t), n = ge(e, r), o = Je(e, r);
  if (n.h === 0 && n.mi === 0 && n.s === 0 && e % 1e3 === 0) return o;
  const s = (a) => String(a).padStart(2, "0");
  return `${o} ${s(n.h)}:${s(n.mi)}`;
}
function Sn(e) {
  return e === "sunday" ? "sunday" : "monday";
}
const $n = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  q: "quarter",
  y: "year"
};
function Tn(e) {
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function En(e) {
  switch (e.kind) {
    case "day":
      return e.offset === 0 ? "Today" : e.offset === -1 ? "Yesterday" : "Tomorrow";
    case "period":
      return `${Tn(e.rel)} ${e.unit}`;
    case "trailing": {
      const t = $n[e.unit];
      return `Last ${e.n} ${t}${e.n === 1 ? "" : "s"}`;
    }
  }
}
function st(e, t) {
  const r = Ae(e);
  return r.ok && r.expr.type === "window" ? En(r.expr.window) : t ? `${e} → ${t}` : e === "now" ? "Now" : `${e} → now`;
}
function Rn(e, t) {
  const r = /^\d{4}-\d{2}-\d{2}$/;
  if (t && r.test(e) && r.test(t)) {
    const n = (o) => {
      const s = /* @__PURE__ */ new Date(`${o}T00:00:00Z`);
      return Number.isNaN(s.getTime()) ? o : s.toLocaleDateString(void 0, { month: "short", day: "numeric", timeZone: "UTC" });
    };
    return `${n(e)} – ${n(t)}`;
  }
  return st(e, t);
}
function tr(e) {
  var t, r, n = "";
  if (typeof e == "string" || typeof e == "number") n += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (r = tr(e[t])) && (n && (n += " "), n += r);
  } else for (r in e) e[r] && (n && (n += " "), n += r);
  return n;
}
function Pe() {
  for (var e, t, r = 0, n = "", o = arguments.length; r < o; r++) (e = arguments[r]) && (t = tr(e)) && (n && (n += " "), n += t);
  return n;
}
const $t = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, Tt = Pe, it = (e, t) => (r) => {
  var n;
  if ((t == null ? void 0 : t.variants) == null) return Tt(e, r == null ? void 0 : r.class, r == null ? void 0 : r.className);
  const { variants: o, defaultVariants: s } = t, a = Object.keys(o).map((c) => {
    const u = r == null ? void 0 : r[c], p = s == null ? void 0 : s[c];
    if (u === null) return null;
    const x = $t(u) || $t(p);
    return o[c][x];
  }), l = r && Object.entries(r).reduce((c, u) => {
    let [p, x] = u;
    return x === void 0 || (c[p] = x), c;
  }, {}), d = t == null || (n = t.compoundVariants) === null || n === void 0 ? void 0 : n.reduce((c, u) => {
    let { class: p, className: x, ...g } = u;
    return Object.entries(g).every((m) => {
      let [f, v] = m;
      return Array.isArray(v) ? v.includes({
        ...s,
        ...l
      }[f]) : {
        ...s,
        ...l
      }[f] === v;
    }) ? [
      ...c,
      p,
      x
    ] : c;
  }, []);
  return Tt(e, a, d, r == null ? void 0 : r.class, r == null ? void 0 : r.className);
}, _n = (e, t) => {
  const r = new Array(e.length + t.length);
  for (let n = 0; n < e.length; n++)
    r[n] = e[n];
  for (let n = 0; n < t.length; n++)
    r[e.length + n] = t[n];
  return r;
}, Mn = (e, t) => ({
  classGroupId: e,
  validator: t
}), rr = (e = /* @__PURE__ */ new Map(), t = null, r) => ({
  nextPart: e,
  validators: t,
  classGroupId: r
}), ze = "-", Et = [], In = "arbitrary..", An = (e) => {
  const t = Dn(e), {
    conflictingClassGroups: r,
    conflictingClassGroupModifiers: n
  } = e;
  return {
    getClassGroupId: (a) => {
      if (a.startsWith("[") && a.endsWith("]"))
        return zn(a);
      const l = a.split(ze), d = l[0] === "" && l.length > 1 ? 1 : 0;
      return nr(l, d, t);
    },
    getConflictingClassGroupIds: (a, l) => {
      if (l) {
        const d = n[a], c = r[a];
        return d ? c ? _n(c, d) : d : c || Et;
      }
      return r[a] || Et;
    }
  };
}, nr = (e, t, r) => {
  if (e.length - t === 0)
    return r.classGroupId;
  const o = e[t], s = r.nextPart.get(o);
  if (s) {
    const c = nr(e, t + 1, s);
    if (c) return c;
  }
  const a = r.validators;
  if (a === null)
    return;
  const l = t === 0 ? e.join(ze) : e.slice(t).join(ze), d = a.length;
  for (let c = 0; c < d; c++) {
    const u = a[c];
    if (u.validator(l))
      return u.classGroupId;
  }
}, zn = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const t = e.slice(1, -1), r = t.indexOf(":"), n = t.slice(0, r);
  return n ? In + n : void 0;
})(), Dn = (e) => {
  const {
    theme: t,
    classGroups: r
  } = e;
  return Pn(r, t);
}, Pn = (e, t) => {
  const r = rr();
  for (const n in e) {
    const o = e[n];
    at(o, r, n, t);
  }
  return r;
}, at = (e, t, r, n) => {
  const o = e.length;
  for (let s = 0; s < o; s++) {
    const a = e[s];
    On(a, t, r, n);
  }
}, On = (e, t, r, n) => {
  if (typeof e == "string") {
    Ln(e, t, r);
    return;
  }
  if (typeof e == "function") {
    Fn(e, t, r, n);
    return;
  }
  Gn(e, t, r, n);
}, Ln = (e, t, r) => {
  const n = e === "" ? t : or(t, e);
  n.classGroupId = r;
}, Fn = (e, t, r, n) => {
  if (jn(e)) {
    at(e(n), t, r, n);
    return;
  }
  t.validators === null && (t.validators = []), t.validators.push(Mn(r, e));
}, Gn = (e, t, r, n) => {
  const o = Object.entries(e), s = o.length;
  for (let a = 0; a < s; a++) {
    const [l, d] = o[a];
    at(d, or(t, l), r, n);
  }
}, or = (e, t) => {
  let r = e;
  const n = t.split(ze), o = n.length;
  for (let s = 0; s < o; s++) {
    const a = n[s];
    let l = r.nextPart.get(a);
    l || (l = rr(), r.nextPart.set(a, l)), r = l;
  }
  return r;
}, jn = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Wn = (e) => {
  if (e < 1)
    return {
      get: () => {
      },
      set: () => {
      }
    };
  let t = 0, r = /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null);
  const o = (s, a) => {
    r[s] = a, t++, t > e && (t = 0, n = r, r = /* @__PURE__ */ Object.create(null));
  };
  return {
    get(s) {
      let a = r[s];
      if (a !== void 0)
        return a;
      if ((a = n[s]) !== void 0)
        return o(s, a), a;
    },
    set(s, a) {
      s in r ? r[s] = a : o(s, a);
    }
  };
}, tt = "!", Rt = ":", Bn = [], _t = (e, t, r, n, o) => ({
  modifiers: e,
  hasImportantModifier: t,
  baseClassName: r,
  maybePostfixModifierPosition: n,
  isExternal: o
}), Kn = (e) => {
  const {
    prefix: t,
    experimentalParseClassName: r
  } = e;
  let n = (o) => {
    const s = [];
    let a = 0, l = 0, d = 0, c;
    const u = o.length;
    for (let f = 0; f < u; f++) {
      const v = o[f];
      if (a === 0 && l === 0) {
        if (v === Rt) {
          s.push(o.slice(d, f)), d = f + 1;
          continue;
        }
        if (v === "/") {
          c = f;
          continue;
        }
      }
      v === "[" ? a++ : v === "]" ? a-- : v === "(" ? l++ : v === ")" && l--;
    }
    const p = s.length === 0 ? o : o.slice(d);
    let x = p, g = !1;
    p.endsWith(tt) ? (x = p.slice(0, -1), g = !0) : (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      p.startsWith(tt) && (x = p.slice(1), g = !0)
    );
    const m = c && c > d ? c - d : void 0;
    return _t(s, g, x, m);
  };
  if (t) {
    const o = t + Rt, s = n;
    n = (a) => a.startsWith(o) ? s(a.slice(o.length)) : _t(Bn, !1, a, void 0, !0);
  }
  if (r) {
    const o = n;
    n = (s) => r({
      className: s,
      parseClassName: o
    });
  }
  return n;
}, qn = (e) => {
  const t = /* @__PURE__ */ new Map();
  return e.orderSensitiveModifiers.forEach((r, n) => {
    t.set(r, 1e6 + n);
  }), (r) => {
    const n = [];
    let o = [];
    for (let s = 0; s < r.length; s++) {
      const a = r[s], l = a[0] === "[", d = t.has(a);
      l || d ? (o.length > 0 && (o.sort(), n.push(...o), o = []), n.push(a)) : o.push(a);
    }
    return o.length > 0 && (o.sort(), n.push(...o)), n;
  };
}, Vn = (e) => ({
  cache: Wn(e.cacheSize),
  parseClassName: Kn(e),
  sortModifiers: qn(e),
  postfixLookupClassGroupIds: Un(e),
  ...An(e)
}), Un = (e) => {
  const t = /* @__PURE__ */ Object.create(null), r = e.postfixLookupClassGroups;
  if (r)
    for (let n = 0; n < r.length; n++)
      t[r[n]] = !0;
  return t;
}, Hn = /\s+/, Yn = (e, t) => {
  const {
    parseClassName: r,
    getClassGroupId: n,
    getConflictingClassGroupIds: o,
    sortModifiers: s,
    postfixLookupClassGroupIds: a
  } = t, l = [], d = e.trim().split(Hn);
  let c = "";
  for (let u = d.length - 1; u >= 0; u -= 1) {
    const p = d[u], {
      isExternal: x,
      modifiers: g,
      hasImportantModifier: m,
      baseClassName: f,
      maybePostfixModifierPosition: v
    } = r(p);
    if (x) {
      c = p + (c.length > 0 ? " " + c : c);
      continue;
    }
    let C = !!v, N;
    if (C) {
      const D = f.substring(0, v);
      N = n(D);
      const h = N && a[N] ? n(f) : void 0;
      h && h !== N && (N = h, C = !1);
    } else
      N = n(f);
    if (!N) {
      if (!C) {
        c = p + (c.length > 0 ? " " + c : c);
        continue;
      }
      if (N = n(f), !N) {
        c = p + (c.length > 0 ? " " + c : c);
        continue;
      }
      C = !1;
    }
    const _ = g.length === 0 ? "" : g.length === 1 ? g[0] : s(g).join(":"), S = m ? _ + tt : _, $ = S + N;
    if (l.indexOf($) > -1)
      continue;
    l.push($);
    const M = o(N, C);
    for (let D = 0; D < M.length; ++D) {
      const h = M[D];
      l.push(S + h);
    }
    c = p + (c.length > 0 ? " " + c : c);
  }
  return c;
}, Qn = (...e) => {
  let t = 0, r, n, o = "";
  for (; t < e.length; )
    (r = e[t++]) && (n = sr(r)) && (o && (o += " "), o += n);
  return o;
}, sr = (e) => {
  if (typeof e == "string")
    return e;
  let t, r = "";
  for (let n = 0; n < e.length; n++)
    e[n] && (t = sr(e[n])) && (r && (r += " "), r += t);
  return r;
}, Zn = (e, ...t) => {
  let r, n, o, s;
  const a = (d) => {
    const c = t.reduce((u, p) => p(u), e());
    return r = Vn(c), n = r.cache.get, o = r.cache.set, s = l, l(d);
  }, l = (d) => {
    const c = n(d);
    if (c)
      return c;
    const u = Yn(d, r);
    return o(d, u), u;
  };
  return s = a, (...d) => s(Qn(...d));
}, Xn = [], P = (e) => {
  const t = (r) => r[e] || Xn;
  return t.isThemeGetter = !0, t;
}, ir = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, ar = /^\((?:(\w[\w-]*):)?(.+)\)$/i, Jn = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, eo = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, to = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, ro = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, no = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, oo = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, ee = (e) => Jn.test(e), T = (e) => !!e && !Number.isNaN(Number(e)), Q = (e) => !!e && Number.isInteger(Number(e)), Ke = (e) => e.endsWith("%") && T(e.slice(0, -1)), X = (e) => eo.test(e), lr = () => !0, so = (e) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  to.test(e) && !ro.test(e)
), lt = () => !1, io = (e) => no.test(e), ao = (e) => oo.test(e), lo = (e) => !w(e) && !y(e), co = (e) => e.startsWith("@container") && (e[10] === "/" && e[11] !== void 0 || e[11] === "s" && e[16] !== void 0 && e.startsWith("-size/", 10) || e[11] === "n" && e[18] !== void 0 && e.startsWith("-normal/", 10)), uo = (e) => re(e, ur, lt), w = (e) => ir.test(e), se = (e) => re(e, mr, so), Mt = (e) => re(e, xo, T), mo = (e) => re(e, hr, lr), fo = (e) => re(e, fr, lt), It = (e) => re(e, cr, lt), ho = (e) => re(e, dr, ao), Ee = (e) => re(e, pr, io), y = (e) => ar.test(e), xe = (e) => ce(e, mr), po = (e) => ce(e, fr), At = (e) => ce(e, cr), bo = (e) => ce(e, ur), go = (e) => ce(e, dr), Re = (e) => ce(e, pr, !0), wo = (e) => ce(e, hr, !0), re = (e, t, r) => {
  const n = ir.exec(e);
  return n ? n[1] ? t(n[1]) : r(n[2]) : !1;
}, ce = (e, t, r = !1) => {
  const n = ar.exec(e);
  return n ? n[1] ? t(n[1]) : r : !1;
}, cr = (e) => e === "position" || e === "percentage", dr = (e) => e === "image" || e === "url", ur = (e) => e === "length" || e === "size" || e === "bg-size", mr = (e) => e === "length", xo = (e) => e === "number", fr = (e) => e === "family-name", hr = (e) => e === "number" || e === "weight", pr = (e) => e === "shadow", yo = () => {
  const e = P("color"), t = P("font"), r = P("text"), n = P("font-weight"), o = P("tracking"), s = P("leading"), a = P("breakpoint"), l = P("container"), d = P("spacing"), c = P("radius"), u = P("shadow"), p = P("inset-shadow"), x = P("text-shadow"), g = P("drop-shadow"), m = P("blur"), f = P("perspective"), v = P("aspect"), C = P("ease"), N = P("animate"), _ = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], S = () => [
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
  ], $ = () => [...S(), y, w], M = () => ["auto", "hidden", "clip", "visible", "scroll"], D = () => ["auto", "contain", "none"], h = () => [y, w, d], I = () => [ee, "full", "auto", ...h()], H = () => [Q, "none", "subgrid", y, w], Z = () => ["auto", {
    span: ["full", Q, y, w]
  }, Q, y, w], ne = () => [Q, "auto", y, w], ht = () => ["auto", "min", "max", "fr", y, w], Le = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"], de = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"], K = () => ["auto", ...h()], oe = () => [ee, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...h()], Fe = () => [ee, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...h()], Ge = () => [ee, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...h()], k = () => [e, y, w], pt = () => [...S(), At, It, {
    position: [y, w]
  }], bt = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }], gt = () => ["auto", "cover", "contain", bo, uo, {
    size: [y, w]
  }], je = () => [Ke, xe, se], L = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    c,
    y,
    w
  ], F = () => ["", T, xe, se], Ne = () => ["solid", "dashed", "dotted", "double"], wt = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], O = () => [T, Ke, At, It], xt = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    m,
    y,
    w
  ], Ce = () => ["none", T, y, w], Se = () => ["none", T, y, w], We = () => [T, y, w], $e = () => [ee, "full", ...h()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [X],
      breakpoint: [X],
      color: [lr],
      container: [X],
      "drop-shadow": [X],
      ease: ["in", "out", "in-out"],
      font: [lo],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [X],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [X],
      shadow: [X],
      spacing: ["px", T],
      text: [X],
      "text-shadow": [X],
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
        aspect: ["auto", "square", ee, w, y, v]
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
        "@container": ["", "normal", "size", y, w]
      }],
      /**
       * Container Name
       * @see https://tailwindcss.com/docs/responsive-design#named-containers
       */
      "container-named": [co],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [T, w, y, l]
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
        overscroll: D()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": D()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": D()
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
        z: [Q, "auto", y, w]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [ee, "full", "auto", l, ...h()]
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
        flex: [T, ee, "auto", "initial", "none", w]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", T, y, w]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", T, y, w]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [Q, "first", "last", "none", y, w]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": H()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: Z()
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
        "grid-rows": H()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: Z()
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
        "auto-cols": ht()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": ht()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: h()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": h()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": h()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...Le(), "normal"]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": [...de(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...de()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...Le()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: [...de(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...de(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": Le()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": [...de(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...de()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: h()
      }],
      /**
       * Padding Inline
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: h()
      }],
      /**
       * Padding Block
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: h()
      }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: h()
      }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: h()
      }],
      /**
       * Padding Block Start
       * @see https://tailwindcss.com/docs/padding
       */
      pbs: [{
        pbs: h()
      }],
      /**
       * Padding Block End
       * @see https://tailwindcss.com/docs/padding
       */
      pbe: [{
        pbe: h()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: h()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: h()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: h()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: h()
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
        "space-x": h()
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
        "space-y": h()
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
        size: oe()
      }],
      /**
       * Inline Size
       * @see https://tailwindcss.com/docs/width
       */
      "inline-size": [{
        inline: ["auto", ...Fe()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...Fe()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...Fe()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...Ge()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...Ge()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...Ge()]
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [l, "screen", ...oe()]
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
          ...oe()
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
          ...oe()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...oe()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...oe()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...oe()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", r, xe, se]
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
        font: [n, wo, mo]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", Ke, w]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [po, fo, t]
      }],
      /**
       * Font Feature Settings
       * @see https://tailwindcss.com/docs/font-feature-settings
       */
      "font-features": [{
        "font-features": [w]
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
        tracking: [o, y, w]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [T, "none", y, Mt]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          s,
          ...h()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", y, w]
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
        list: ["disc", "decimal", "none", y, w]
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
        decoration: [...Ne(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [T, "from-font", "auto", y, se]
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
        "underline-offset": [T, "auto", y, w]
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
        indent: h()
      }],
      /**
       * Tab Size
       * @see https://tailwindcss.com/docs/tab-size
       */
      "tab-size": [{
        tab: [Q, y, w]
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", y, w]
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
        content: ["none", y, w]
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
        bg: pt()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: bt()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: gt()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, Q, y, w],
          radial: ["", y, w],
          conic: [Q, y, w]
        }, go, ho]
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
        from: je()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: je()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: je()
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
        border: F()
      }],
      /**
       * Border Width Inline
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": F()
      }],
      /**
       * Border Width Block
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": F()
      }],
      /**
       * Border Width Inline Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": F()
      }],
      /**
       * Border Width Inline End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": F()
      }],
      /**
       * Border Width Block Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-bs": [{
        "border-bs": F()
      }],
      /**
       * Border Width Block End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-be": [{
        "border-be": F()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": F()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": F()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": F()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": F()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": F()
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
        "divide-y": F()
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
        outline: [...Ne(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [T, y, w]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", T, xe, se]
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
        "inset-shadow": ["none", p, Re, Ee]
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
        ring: F()
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
        "ring-offset": [T, se]
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
        "inset-ring": F()
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
        "text-shadow": ["none", x, Re, Ee]
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
        opacity: [T, y, w]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...wt(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": wt()
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
        "mask-linear": [T]
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
        "mask-radial": [y, w]
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
        "mask-conic": [T]
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
        mask: pt()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: bt()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: gt()
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
        mask: ["none", y, w]
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
          y,
          w
        ]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: xt()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [T, y, w]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [T, y, w]
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
          g,
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
        grayscale: ["", T, y, w]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [T, y, w]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", T, y, w]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [T, y, w]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", T, y, w]
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
          y,
          w
        ]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": xt()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [T, y, w]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [T, y, w]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", T, y, w]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [T, y, w]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", T, y, w]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [T, y, w]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [T, y, w]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", T, y, w]
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
        "border-spacing": h()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": h()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": h()
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
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", y, w]
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
        duration: [T, "initial", y, w]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", C, y, w]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [T, y, w]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", N, y, w]
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
        perspective: [f, y, w]
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
        skew: We()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": We()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": We()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [y, w, "", "none", "gpu", "cpu"]
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
        zoom: [Q, y, w]
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
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", y, w]
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
        "scroll-m": h()
      }],
      /**
       * Scroll Margin Inline
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": h()
      }],
      /**
       * Scroll Margin Block
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": h()
      }],
      /**
       * Scroll Margin Inline Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": h()
      }],
      /**
       * Scroll Margin Inline End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": h()
      }],
      /**
       * Scroll Margin Block Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbs": [{
        "scroll-mbs": h()
      }],
      /**
       * Scroll Margin Block End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbe": [{
        "scroll-mbe": h()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": h()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": h()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": h()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": h()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": h()
      }],
      /**
       * Scroll Padding Inline
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": h()
      }],
      /**
       * Scroll Padding Block
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": h()
      }],
      /**
       * Scroll Padding Inline Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": h()
      }],
      /**
       * Scroll Padding Inline End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": h()
      }],
      /**
       * Scroll Padding Block Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbs": [{
        "scroll-pbs": h()
      }],
      /**
       * Scroll Padding Block End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbe": [{
        "scroll-pbe": h()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": h()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": h()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": h()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": h()
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
        "will-change": ["auto", "scroll", "contents", "transform", y, w]
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
        stroke: [T, xe, se, Mt]
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
}, ct = /* @__PURE__ */ Zn(yo);
function B(...e) {
  return ct(Pe(e));
}
const vo = it(
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
), _e = z.forwardRef(function({ className: t, variant: r, size: n, asChild: o = !1, ...s }, a) {
  return /* @__PURE__ */ i(o ? rt : "button", { ref: a, className: B(vo({ variant: r, size: n, className: t })), ...s });
});
function ko({ ...e }) {
  return /* @__PURE__ */ i(pe.Root, { "data-slot": "dropdown-menu", ...e });
}
function No({ ...e }) {
  return /* @__PURE__ */ i(pe.Trigger, { "data-slot": "dropdown-menu-trigger", ...e });
}
function Co({
  className: e,
  sideOffset: t = 4,
  ...r
}) {
  return /* @__PURE__ */ i(pe.Portal, { children: /* @__PURE__ */ i(
    pe.Content,
    {
      "data-slot": "dropdown-menu-content",
      sideOffset: t,
      className: B(
        "bg-panel text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border border-border p-1 shadow-md",
        e
      ),
      ...r
    }
  ) });
}
function So({
  className: e,
  inset: t,
  ...r
}) {
  return /* @__PURE__ */ i(
    pe.Label,
    {
      "data-slot": "dropdown-menu-label",
      "data-inset": t,
      className: B("px-2 py-1.5 text-xs text-muted data-[inset]:pl-8", e),
      ...r
    }
  );
}
function zt({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ i(
    pe.Separator,
    {
      "data-slot": "dropdown-menu-separator",
      className: B("bg-border -mx-1 my-1 h-px", e),
      ...t
    }
  );
}
const br = z.forwardRef(
  ({ className: e, type: t, ...r }, n) => /* @__PURE__ */ i(
    "input",
    {
      ref: n,
      type: t,
      "data-slot": "input",
      className: B(
        "flex h-9 w-full min-w-0 rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg shadow-sm shadow-black/0 transition-colors placeholder:text-muted/60 selection:bg-accent/20 selection:text-fg focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60",
        e
      ),
      ...r
    }
  )
);
br.displayName = "Input";
const gr = { eu: "/", iso: "-", usa: "/" };
function $o(e) {
  const t = gr[e];
  return e === "usa" ? `MM${t}DD${t}YYYY` : e === "iso" ? `YYYY${t}MM${t}DD` : `DD${t}MM${t}YYYY`;
}
function Dt(e, t) {
  const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e ?? "");
  if (!r) return "";
  const [, n, o, s] = r, a = gr[t];
  return t === "usa" ? `${o}${a}${s}${a}${n}` : t === "iso" ? `${n}${a}${o}${a}${s}` : `${s}${a}${o}${a}${n}`;
}
function Ji(e, t) {
  const r = (e ?? "").split(/[/\-.]/).map((l) => l.trim());
  if (r.length !== 3 || r.some((l) => !/^\d+$/.test(l))) return "";
  let n, o, s;
  if (t === "usa" ? [o, s, n] = r : t === "iso" ? [n, o, s] = r : [s, o, n] = r, n.length !== 4) return "";
  const a = `${n}-${o.padStart(2, "0")}-${s.padStart(2, "0")}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(a) ? a : "";
}
function Pt({ value: e, onChange: t, dateStyle: r, className: n, ...o }) {
  const s = V(null), a = r ?? "eu", l = Dt(e, a) || $o(a), d = !Dt(e, a);
  return /* @__PURE__ */ b(
    "div",
    {
      className: B(
        "dash-kit relative inline-flex h-8 items-center rounded-md border border-border bg-bg text-xs shadow-sm transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20",
        n
      ),
      children: [
        /* @__PURE__ */ i(
          "span",
          {
            "aria-hidden": !0,
            className: B("pointer-events-none px-2.5 pr-7", d && "text-muted/60"),
            children: l
          }
        ),
        /* @__PURE__ */ i(Lr, { "aria-hidden": !0, size: 13, className: "pointer-events-none absolute right-2 text-muted" }),
        /* @__PURE__ */ i(
          "input",
          {
            ...o,
            ref: s,
            type: "date",
            value: e,
            onChange: (c) => t(c.target.value),
            onClick: () => {
              var c;
              try {
                (c = s.current) == null || c.showPicker();
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
const wr = ["Minutes", "Hours", "Days", "Months", "Years"], E = (e, t) => ({ id: e, label: st(t), expr: t }), xr = [
  {
    id: "trailing",
    label: "Trailing",
    hint: "ends now",
    cells: {
      Minutes: [
        E("last-5m", "last-5-minutes"),
        E("last-15m", "last-15-minutes"),
        E("last-30m", "last-30-minutes"),
        E("last-60m", "last-60-minutes")
      ],
      Hours: [
        E("last-3h", "last-3-hours"),
        E("last-6h", "last-6-hours"),
        E("last-12h", "last-12-hours"),
        E("last-24h", "last-24-hours")
      ],
      Days: [
        E("last-7d", "last-7-days"),
        E("last-14d", "last-14-days"),
        E("last-30d", "last-30-days"),
        // Kept alongside `last-3-months` on purpose: 90 fixed days is what people type, 3 calendar
        // months is what a report schedule wants. Different columns, so the difference is visible.
        E("last-90d", "last-90-days")
      ],
      Months: [
        E("last-2mo", "last-2-months"),
        E("last-3mo", "last-3-months"),
        E("last-6mo", "last-6-months"),
        E("last-12mo", "last-12-months")
      ],
      // No `last-1-year`: it resolves IDENTICALLY to `last-12-months` one column left, and two
      // adjacent buttons for one window is a question the reader has to stop and answer. Nothing at
      // 5y either — series retention has GC'd it, so the click returns an empty chart, not an error.
      Years: [E("last-2y", "last-2-years"), E("last-3y", "last-3-years")]
    }
  },
  {
    id: "calendar",
    label: "Calendar",
    hint: "calendar-aligned",
    cells: {
      // No "this minute" — nobody reaches for it, and an empty cell is information, not a gap.
      Minutes: [],
      Hours: [E("this-hour", "this-hour"), E("last-hour", "last-hour")],
      Days: [
        E("today", "today"),
        E("yesterday", "yesterday"),
        E("this-week", "this-week"),
        E("last-week", "last-week")
      ],
      Months: [
        E("this-month", "this-month"),
        E("last-month", "last-month"),
        E("this-quarter", "this-quarter"),
        E("last-quarter", "last-quarter")
      ],
      Years: [E("this-year", "this-year"), E("last-year", "last-year")]
    }
  }
], ea = xr.flatMap(
  (e) => wr.flatMap((t) => e.cells[t])
), qe = /^\d{4}-\d{2}-\d{2}$/;
function ta({
  from: e,
  to: t,
  onApply: r,
  timezone: n,
  compact: o,
  dateStyle: s,
  weekStart: a,
  onUserApply: l
}) {
  const [d, c] = R(!1), u = Ut(), p = er((u == null ? void 0 : u.zone) ?? Jt, n), x = Sn(a), g = qe.test(e) && t ? "" : e, [m, f] = R(g), v = fe(
    () => qe.test(e) && t && qe.test(t) ? { from: e, to: t } : { from: "", to: "" },
    [e, t]
  ), [C, N] = R(v);
  G(() => {
    f(g), N(v);
  }, [e, t]);
  const _ = fe(() => Date.now(), [d]), S = fe(() => {
    const h = m.trim();
    if (!h) return null;
    const I = Cn(h, void 0, _, p, x);
    return I ? {
      text: `${h} → ${Je(I.fromMs, p)} → ${Je(I.toMs, p)}`
    } : {
      error: "Not a range expression — try last-3-months, this-month, now-4h."
    };
  }, [m, _, p]), $ = (h) => {
    l == null || l(), r(h), c(!1);
  }, M = C.from !== e || C.to !== t, D = !!C.from && !!C.to && C.from > C.to;
  return /* @__PURE__ */ b(ko, { open: d, onOpenChange: c, children: [
    /* @__PURE__ */ i(No, { asChild: !0, children: /* @__PURE__ */ b(
      _e,
      {
        variant: "outline",
        size: "sm",
        className: B(
          "dash-kit gap-1.5 px-2.5 text-xs font-normal",
          o ? "h-11 md:h-8" : "h-8"
        ),
        title: "Change the dashboard time range",
        children: [
          /* @__PURE__ */ i(Fr, { size: 13, className: "text-muted" }),
          /* @__PURE__ */ i("span", { className: "max-w-[13rem] truncate", children: o ? Rn(e, t) : st(e, t) }),
          /* @__PURE__ */ i(Gr, { size: 13, className: "text-muted" })
        ]
      }
    ) }),
    /* @__PURE__ */ b(
      Co,
      {
        align: "end",
        className: B(
          // `dash-kit` on the CONTENT too, not only the trigger: the content renders in a Radix PORTAL
          // at the document root, outside the trigger's subtree, so a scope class on the trigger alone
          // would leave every utility in the popover unstyled.
          "dash-kit max-w-[calc(100vw-2rem)] p-0",
          o ? "w-[calc(100vw-2rem)]" : "w-[42rem]"
        ),
        children: [
          /* @__PURE__ */ i(So, { className: "px-3 pt-2.5 text-[0.7rem] uppercase tracking-wide text-muted", children: "Quick ranges" }),
          /* @__PURE__ */ i("div", { className: "px-1.5 pb-2", children: xr.map((h) => /* @__PURE__ */ b("div", { className: "mb-1 last:mb-0", children: [
            /* @__PURE__ */ b("div", { className: "flex items-baseline gap-1.5 px-1 pb-0.5 pt-1", children: [
              /* @__PURE__ */ i("span", { className: "text-[0.7rem] font-medium uppercase tracking-wide text-muted", children: h.label }),
              /* @__PURE__ */ i("span", { className: "text-[0.65rem] text-muted", children: h.hint })
            ] }),
            /* @__PURE__ */ i(
              "div",
              {
                className: B(
                  "grid gap-x-1 gap-y-0.5",
                  o ? "grid-cols-2" : "grid-cols-5"
                ),
                children: wr.map((I) => {
                  const H = h.cells[I];
                  return o && H.length === 0 ? null : /* @__PURE__ */ b("div", { className: "min-w-0", children: [
                    !o && /* @__PURE__ */ i("div", { className: "px-2 pb-0.5 text-[0.65rem] uppercase tracking-wide text-muted/70", children: I }),
                    H.map((Z) => {
                      const ne = !t && Z.expr === e;
                      return /* @__PURE__ */ b(
                        _e,
                        {
                          variant: "ghost",
                          size: "sm",
                          className: B(
                            "w-full justify-start gap-1.5 px-2 text-xs font-normal",
                            o ? "h-10" : "h-8",
                            ne && "bg-muted-bg font-medium text-fg"
                          ),
                          onClick: () => $({ from: Z.expr }),
                          children: [
                            /* @__PURE__ */ i(
                              Bt,
                              {
                                size: 12,
                                className: B(
                                  "shrink-0 text-accent",
                                  !ne && "invisible"
                                )
                              }
                            ),
                            /* @__PURE__ */ i("span", { className: "truncate", children: Z.label })
                          ]
                        },
                        Z.id
                      );
                    })
                  ] }, I);
                })
              }
            )
          ] }, h.id)) }),
          /* @__PURE__ */ i(zt, { className: "my-0" }),
          /* @__PURE__ */ b("div", { className: "space-y-1.5 px-3 py-2.5", children: [
            /* @__PURE__ */ i("div", { className: "text-[0.7rem] uppercase tracking-wide text-muted", children: "Relative range" }),
            /* @__PURE__ */ b(
              "form",
              {
                className: "flex items-center gap-1.5",
                onSubmit: (h) => {
                  h.preventDefault(), m.trim() && S && !("error" in S) && $({ from: m.trim() });
                },
                children: [
                  /* @__PURE__ */ i(
                    br,
                    {
                      "aria-label": "dashboard relative range",
                      className: "h-8 flex-1 text-xs",
                      placeholder: "last-3-months, this-quarter, now-4h…",
                      value: m,
                      onChange: (h) => f(h.target.value)
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
          /* @__PURE__ */ i(zt, { className: "my-0" }),
          /* @__PURE__ */ b("div", { className: "space-y-2 px-3 py-2.5", children: [
            /* @__PURE__ */ i("div", { className: "text-[0.7rem] uppercase tracking-wide text-muted", children: "Absolute range" }),
            /* @__PURE__ */ b("div", { className: "flex items-center gap-1.5 text-xs text-muted", children: [
              /* @__PURE__ */ i(
                Pt,
                {
                  "aria-label": "dashboard range from",
                  dateStyle: s,
                  className: "flex-1",
                  value: C.from,
                  onChange: (h) => N((I) => ({ ...I, from: h }))
                }
              ),
              /* @__PURE__ */ i("span", { children: "to" }),
              /* @__PURE__ */ i(
                Pt,
                {
                  "aria-label": "dashboard range to",
                  dateStyle: s,
                  className: "flex-1",
                  value: C.to ?? "",
                  onChange: (h) => N((I) => ({ ...I, to: h }))
                }
              )
            ] }),
            D ? /* @__PURE__ */ i("p", { className: "text-[0.7rem] text-danger", children: "The start date must not be after the end date." }) : /* @__PURE__ */ i("p", { className: "text-[0.7rem] text-muted", children: "The end date is exclusive — it ends at the start of that day." }),
            /* @__PURE__ */ i(
              _e,
              {
                size: "sm",
                className: "h-8 w-full text-xs",
                disabled: !M || D || !C.from || !C.to,
                title: M ? "Apply this range — re-queries every panel" : "This range is already applied",
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
const yr = 3e4;
function To() {
  return new Zr({
    defaultOptions: {
      queries: {
        // A read either resolves or honestly denies — never retry it into a fabricated success (§9).
        retry: !1,
        // No window refocus refetch: the refresh TICK (in the key) is the freshness signal, not focus.
        refetchOnWindowFocus: !1,
        // Floor stale window; tick-keyed reads are effectively "fresh until the next tick" via the key.
        staleTime: 0,
        gcTime: yr
      }
    }
  });
}
function Oe(e) {
  return new Promise((t, r) => {
    e.oncomplete = e.onsuccess = () => t(e.result), e.onabort = e.onerror = () => r(e.error);
  });
}
function Eo(e, t) {
  let r;
  const n = () => {
    if (r)
      return r;
    const o = indexedDB.open(e);
    return o.onupgradeneeded = () => o.result.createObjectStore(t), r = Oe(o), r.then((s) => {
      s.onclose = () => r = void 0;
    }, () => {
      r = void 0;
    }), r;
  };
  return (o, s) => n().then((a) => s(a.transaction(t, o).objectStore(t)));
}
let Ve;
function dt() {
  return Ve || (Ve = Eo("keyval-store", "keyval")), Ve;
}
function Ro(e, t = dt()) {
  return t("readonly", (r) => Oe(r.get(e)));
}
function _o(e, t, r = dt()) {
  return r("readwrite", (n) => (n.put(t, e), Oe(n.transaction)));
}
function Mo(e, t = dt()) {
  return t("readwrite", (r) => (r.delete(e), Oe(r.transaction)));
}
const vr = "v1", Io = 7 * 24 * 60 * 6e4, Ao = "quick-";
function zo(e) {
  return `lb.quick-cache.${vr}.${e}`;
}
function Do(e) {
  const t = zo(e);
  return {
    persistClient: (r) => _o(t, r).catch(() => {
    }),
    restoreClient: () => Ro(t).catch(() => {
    }),
    removeClient: () => Mo(t).catch(() => {
    })
  };
}
const Po = 250;
function Oo(e, t) {
  const [r, n] = t.queryKey;
  return typeof r == "string" && r.startsWith(Ao) && n === e && t.state.status === "success";
}
function Lo(e, t) {
  if (!t) return () => {
  };
  const r = {
    queryClient: e,
    persister: Do(t),
    maxAge: Io,
    // The buster is BELT AND BRACES with the versioned storage key: the key stops a stale store from
    // being found at all, this stops one that somehow was.
    buster: vr,
    dehydrateOptions: { shouldDehydrateQuery: (l) => Oo(t, l) }
  };
  let n = !1, o = null, s = null;
  const a = () => {
    n || o || (o = setTimeout(() => {
      o = null, n || en(r);
    }, Po));
  };
  return Jr(r).catch(() => {
  }).then(() => {
    n || (a(), s = e.getQueryCache().subscribe(a));
  }), () => {
    n = !0, o && clearTimeout(o), s == null || s();
  };
}
const ut = ke(null);
function ra() {
  const e = le(ut);
  if (e === null) throw new Error("useDashboardWs: no DashboardCacheProvider in tree");
  return e;
}
function na() {
  return le(ut);
}
function kr({ ws: e, children: t }) {
  const [r] = R(To);
  return G(() => Lo(r, e), [r, e]), /* @__PURE__ */ i(ut.Provider, { value: e, children: /* @__PURE__ */ i(Xr, { client: r, children: t }) });
}
const Ue = "[A-Za-z_][\\w.]*", Ot = new RegExp(
  // ${name} or ${name:format}
  `\\$\\{(${Ue})(?::[a-z]+)?\\}|\\[\\[(${Ue})(?::[a-z]+)?\\]\\]|\\$(${Ue})`,
  "g"
);
function Fo(e) {
  const t = [], r = /* @__PURE__ */ new Set();
  let n;
  for (Ot.lastIndex = 0; (n = Ot.exec(e)) !== null; ) {
    const o = n[1] ?? n[2] ?? n[3];
    o && !r.has(o) && (r.add(o), t.push(o));
  }
  return t;
}
const Go = "__";
function jo(e) {
  return e.startsWith(Go);
}
function Wo(e) {
  const t = [], r = /* @__PURE__ */ new Set(), n = (o) => {
    if (typeof o == "string")
      for (const s of Fo(o))
        r.has(s) || (r.add(s), t.push(s));
    else Array.isArray(o) ? o.forEach(n) : o && typeof o == "object" && Object.values(o).forEach(n);
  };
  return n(e), t;
}
const Bo = " / ";
function oa(e, t) {
  var o;
  const r = {}, n = ((o = e == null ? void 0 : e.path) == null ? void 0 : o.filter((s) => s != null)) ?? [];
  return n.length > 0 && (r["__nav.label"] = n[n.length - 1], n.length > 1 && (r["__nav.parent.label"] = n[n.length - 2]), n.length > 2 && (r["__nav.parent.parent.label"] = n[n.length - 3]), r["__nav.path"] = n.join(Bo), (e == null ? void 0 : e.id) !== void 0 && (r["__nav.id"] = e.id)), t && (t.id !== void 0 && (r["__page.id"] = t.id), t.title !== void 0 && (r["__page.title"] = t.title), (t.id !== void 0 || t.title !== void 0) && (r["__page.ext"] = t.ext ?? "")), r;
}
const Lt = "scope";
function Ko(e) {
  let t = e;
  if (e && typeof e == "object" && !Array.isArray(e) && Lt in e) {
    const { [Lt]: r, ...n } = e;
    t = n;
  }
  return new Set(Wo(t).filter(jo));
}
function Nr(e, t) {
  if (!t || typeof t != "object" || Array.isArray(t)) return t;
  const { builtins: r, ...n } = t;
  if (!r || typeof r != "object" || Array.isArray(r))
    return t;
  const o = Ko(e), s = {};
  let a = !1;
  for (const [l, d] of Object.entries(
    r
  ))
    o.has(l) && (s[l] = d, a = !0);
  return a ? { ...n, builtins: s } : { ...n };
}
function ve(e) {
  if (Array.isArray(e)) return e.map(ve);
  if (e && typeof e == "object") {
    const t = {};
    for (const r of Object.keys(e).sort()) {
      const n = e[r];
      n !== void 0 && (t[r] = ve(n));
    }
    return t;
  }
  return e;
}
function sa(e, t) {
  return [
    "viz.query",
    e,
    ve({ ...t, scope: Nr(t, t.scope) })
  ];
}
function ia(e, t) {
  return [
    "viz.fetch",
    e,
    ve({ ...t, scope: Nr(t, t.scope) })
  ];
}
function aa(e, t) {
  return ["viz.shape", e, ve(t)];
}
function la(e, t, r) {
  return ["flows.node_state", e, t, r];
}
function ca(e, t) {
  return ["series.read", e, t];
}
function da(e) {
  return ["source-picker", e];
}
function qo(e) {
  return ["datasource.list", e];
}
function Vo(e, t) {
  return {
    queryKey: qo(e),
    queryFn: () => t(),
    staleTime: yr
  };
}
function ua(e, t, r) {
  return e.fetchQuery(Vo(t, r));
}
const Uo = 120;
function ma({
  refreshMs: e,
  cacheTtlS: t
}) {
  return typeof e == "number" && e > 0 ? Math.max(1, Math.round(e / 1e3)) : t === 0 ? 0 : typeof t == "number" && t > 0 ? Math.floor(t) : Uo;
}
function fa({ ws: e, children: t }) {
  return /* @__PURE__ */ i(kr, { ws: e, children: t });
}
function ha(e, t) {
  const [r, n] = R(e);
  return G(() => {
    const o = setTimeout(() => n(e), t);
    return () => clearTimeout(o);
  }, [e, t]), r;
}
const Cr = ke(!1), pa = Cr.Provider;
function ba() {
  return le(Cr);
}
const Sr = ke(0), ga = Sr.Provider;
function wa() {
  return le(Sr);
}
const Ft = 64, Ho = "viz.query_batch", Yo = "viz.query";
function Gt(e, t = {}) {
  const r = t.windowMs ?? 12, n = t.batchTool ?? Ho, o = t.singleTool ?? Yo;
  let s = [], a = null, l = !0;
  const d = () => {
    a === null && (a = setTimeout(c, r));
  }, c = () => {
    a = null;
    const g = s;
    if (s = [], g.length !== 0)
      for (let m = 0; m < g.length; m += Ft)
        u(g.slice(m, m + Ft));
  }, u = async (g) => {
    if (!l) {
      await p(g);
      return;
    }
    const m = Qo(g), f = { panels: g.map((v) => v.panel), now: 0 };
    m && (f.cache = m);
    try {
      const v = await e(n, f), C = (v == null ? void 0 : v.results) ?? [];
      g.forEach((N, _) => x(N, C[_]));
    } catch (v) {
      Zo(v) && (l = !1), await p(g);
    }
  }, p = async (g) => {
    await Promise.all(
      g.map(async (m) => {
        try {
          const f = { panel: m.panel };
          m.cache && (f.cache = m.cache);
          const v = await e(o, f);
          m.resolve({ frames: (v == null ? void 0 : v.frames) ?? [], rows: v == null ? void 0 : v.rows });
        } catch (f) {
          m.reject(f);
        }
      })
    );
  }, x = (g, m) => {
    if (!m) {
      g.reject(new Error("viz.query_batch: missing result slice"));
      return;
    }
    if ("status" in m && (m.status === "error" || m.status === "denied")) {
      g.reject(new Error(m.message || m.status));
      return;
    }
    const f = m;
    g.resolve({ frames: f.frames ?? [], rows: f.rows });
  };
  return {
    load(g, m) {
      return new Promise((f, v) => {
        s.push({ panel: g, cache: m, resolve: f, reject: v }), d();
      });
    },
    get supported() {
      return l;
    }
  };
}
function Qo(e) {
  let t = 0;
  for (const r of e) r.cache && r.cache.ttl_s > t && (t = r.cache.ttl_s);
  return t > 0 ? { ttl_s: t } : void 0;
}
function Zo(e) {
  const t = (e instanceof Error ? e.message : String(e ?? "")).toLowerCase();
  return /not.?found|unknown (tool|command|verb|method)|no such|unsupported|\b400\b|\b404\b|unrecognized/.test(
    t
  );
}
const $r = ke(null);
function xa() {
  return le($r);
}
function ya({ call: e, children: t }) {
  const r = Ut(), n = fe(() => {
    if (e) return Gt(e);
    if (!r)
      throw new Error(
        "VizBatchProvider: no `call` prop and no <KitProvider>. Give it one or the other."
      );
    const o = r.client;
    return Gt((s, a) => o.call(s, a));
  }, [e, r]);
  return /* @__PURE__ */ i($r.Provider, { value: n, children: t });
}
function Xo(e) {
  return e.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function Jo(e) {
  return /\.(publish|write|enqueue|command|set|send|record|create|delete|resolve|derive|simulate)$/.test(
    e
  );
}
function es(e, t) {
  const r = t.startsWith(`${e}.`) ? t.slice(e.length + 1) : t;
  return `${e} · ${r}`;
}
function ts(e) {
  return e.map((t) => ({
    id: `series:${t}`,
    group: "series",
    label: t,
    source: { tool: "series.read", args: { series: t } },
    writes: !1
  }));
}
function rs(e) {
  return e.map((t) => ({
    id: `live:${t}`,
    group: "live",
    label: `${t} (live)`,
    source: { tool: "series.watch", args: { series: t } },
    writes: !1
  }));
}
function ns(e) {
  var r, n, o;
  const t = [];
  for (const s of e) {
    if (!s.enabled) continue;
    const a = /* @__PURE__ */ new Set();
    (n = (r = s.ui) == null ? void 0 : r.scope) == null || n.forEach((l) => a.add(l)), (o = s.widgets) == null || o.forEach((l) => {
      var d;
      return (d = l.scope) == null ? void 0 : d.forEach((c) => a.add(c));
    });
    for (const l of a) {
      const d = Jo(l);
      t.push({
        id: `ext:${s.ext}:${l}`,
        group: d ? "action" : "extension",
        label: es(s.ext, l),
        source: d ? void 0 : { tool: l, args: {} },
        action: d ? { tool: l, argsTemplate: {} } : void 0,
        writes: d
      });
    }
  }
  return t;
}
function os(e) {
  const t = [];
  for (const r of e)
    if (r.enabled)
      for (const n of r.widgets ?? []) {
        const o = n.id ?? Xo(n);
        t.push({
          id: `widget:${r.ext}/${o}`,
          group: "widget",
          label: `${r.ext} · ${n.label}`,
          icon: n.icon,
          viewKey: `ext:${r.ext}/${o}`,
          data: n.data === !0,
          writes: !1
        });
      }
  return t;
}
function ss(e, t) {
  const r = new Map(t.map((o) => [o.type, o])), n = [];
  for (const o of e)
    for (const s of o.nodes ?? []) {
      const a = r.get(s.type);
      if (a) {
        for (const l of a.inputs ?? [])
          n.push({
            id: `flows:in:${o.id}:${s.id}:${l}`,
            group: "flows",
            label: `${o.name || o.id} › ${s.id} › ${l} (input)`,
            action: {
              tool: "flows.inject",
              argsTemplate: { id: o.id, node: s.id, port: l, value: "{{value}}" }
            },
            writes: !0
          });
        for (const l of a.outputs ?? [])
          n.push({
            id: `flows:out:${o.id}:${s.id}:${l}`,
            group: "flows",
            label: `${o.name || o.id} › ${s.id} › ${l} (output)`,
            source: {
              tool: "flows.node_state",
              args: { id: o.id, __flowNode: s.id, __flowPort: l }
            },
            writes: !1
          });
      }
    }
  return n;
}
function is(e) {
  return e.map((t) => ({
    id: `rule:${t.id}`,
    group: "rules",
    label: t.name || t.id,
    source: { tool: "rules.run", args: { rule_id: t.id, route: !1 } },
    writes: !1,
    params: t.params ?? []
  }));
}
function as(e) {
  return e.map((t) => ({
    id: `query:${t.id}`,
    group: "queries",
    label: t.name || t.id,
    source: { tool: "query.run", args: { id: t.id } },
    writes: !1
  }));
}
const ls = "sql:query";
function cs() {
  return {
    id: ls,
    group: "sql",
    label: "SQL query (direct SurrealDB)",
    source: { tool: "store.query", args: { sql: "" } },
    writes: !1
  };
}
function ds(e) {
  return [
    ...ts(e.series ?? []),
    ...rs(e.series ?? []),
    ...ns(e.extensions ?? []),
    ...os(e.extensions ?? []),
    ...ss(e.flows ?? [], e.descriptors ?? []),
    ...is(e.rules ?? []),
    ...as(e.queries ?? []),
    cs()
  ];
}
function Tr(e) {
  return { id: e.id, source: e.source, action: e.action, viewKey: e.viewKey };
}
const Er = {
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
}, us = Object.keys(Er);
function ms(e) {
  return e instanceof Error ? e.message : String(e);
}
async function fs(e, t) {
  const r = {}, n = (o, s) => {
    r[o] = s, t == null || t((a) => ({ ...a, [o]: s }));
  };
  return await Promise.all(
    us.map(async (o) => {
      const s = await Rr(e, o);
      s && n(o, s);
    })
  ), r;
}
async function Rr(e, t) {
  const r = e[Er[t]];
  if (r)
    try {
      return { status: "ready", data: await r() };
    } catch (n) {
      return { status: "denied", error: ms(n) };
    }
}
async function hs(e) {
  const t = await fs(e), r = ie(t.flowSummaries, []), n = ie(t.flowDescriptors, []), o = e.getFlow, s = o ? (await Promise.all(r.map((u) => o(u.id).catch(() => null)))).filter((u) => u != null) : [], a = ie(t.series, []), l = ie(t.extensions, []);
  ie(t.datasources, []);
  const d = ie(t.rules, []), c = ie(t.queries, []);
  return {
    entries: ds({
      series: a,
      extensions: l,
      flows: s,
      descriptors: n,
      rules: d,
      queries: c
    }),
    installed: l
  };
}
function ie(e, t) {
  return (e == null ? void 0 : e.status) === "ready" ? e.data : t;
}
function va(e, t) {
  const [r, n] = R({
    entries: [],
    installed: [],
    loading: !0
  }), o = V(e);
  return o.current = e, G(() => {
    const s = o.current;
    let a = !1;
    return n((l) => ({ ...l, loading: !0 })), (async () => {
      const { entries: l, installed: d } = await hs(s);
      a || n({ entries: l, installed: d, loading: !1 });
    })(), () => {
      a = !0;
    };
  }, [t]), r;
}
const ps = [
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
function ka(e) {
  return e.map((t) => ({
    kind: "datasource",
    id: `datasource:${t.name}`,
    name: t.name,
    rowKind: t.kind,
    endpoint: t.endpoint
  }));
}
function Na(e) {
  return e.tables.map((t) => ({
    kind: "table",
    id: `table:${t.name}`,
    table: t.name
  }));
}
function Ca(e) {
  const t = [];
  for (const r of e.tables)
    for (const n of r.columns)
      t.push({
        kind: "column",
        id: `column:${r.name}.${n.name}`,
        table: r.name,
        column: n.name
      });
  return t;
}
function Sa(e) {
  return e.map((t) => ({ kind: "series", id: `series:${t}`, name: t }));
}
function bs(e) {
  return e.map((t) => ({ kind: "channel", id: `channel:${t.id}`, name: t.id }));
}
function gs(e) {
  return e.map((t) => ({
    kind: "insight",
    id: `insight:${t.id}`,
    title: t.title,
    severity: t.severity,
    status: t.status
  }));
}
function ws(e) {
  return e.map((t) => ({ kind: "inbox", id: `inbox:${t.id}`, channel: t.channel }));
}
function $a(e) {
  return e.map((t) => ({
    kind: "query",
    id: `query:${t.id}`,
    name: t.name || t.id,
    target: t.target
  }));
}
function xs(e) {
  const t = [];
  return e.listDatasources && t.push("datasources"), e.readSchema && t.push("schema"), e.listSeries && t.push("series"), e.listChannels && t.push("channels"), e.listInsights && t.push("insights"), e.listInbox && t.push("inbox"), e.listQueries && t.push("queries"), e.listExtensions && t.push("extensions"), e.listRules && t.push("rules"), e.listFlows && t.push("flowSummaries"), e.listFlowNodes && t.push("flowDescriptors"), t;
}
function jt(e) {
  const t = {};
  for (const r of xs(e))
    t[r] = { status: "idle" };
  return t;
}
function Ta(e, t) {
  const [r, n] = R(() => jt(e)), o = V(e);
  o.current = e, G(() => {
    n(jt(o.current));
  }, [t]);
  const s = W((a) => {
    n((l) => {
      const d = l[a];
      if (d && d.status !== "idle") return l;
      const c = { ...l, [a]: { status: "loading" } };
      return Rr(o.current, a).then((u) => {
        u && n((p) => ({ ...p, [a]: u }));
      }), c;
    });
  }, []);
  return { sections: r, loadSection: s };
}
const _r = [
  { group: "series", label: "Series" },
  { group: "live", label: "Live (Zenoh)" },
  { group: "sql", label: "Direct SurrealDB" },
  { group: "extension", label: "Installed extension" },
  { group: "widget", label: "Extension widgets" },
  { group: "flows", label: "Flows" },
  { group: "rules", label: "Rules" },
  { group: "queries", label: "Saved queries" }
], Ea = [
  { group: "series", label: "Series" },
  { group: "live", label: "Live (Zenoh)" },
  { group: "sql", label: "Direct SurrealDB" },
  { group: "extension", label: "Installed extension" },
  { group: "action", label: "Action (control)" },
  { group: "widget", label: "Extension widgets" }
];
function Ra({
  entries: e,
  value: t = "",
  onSelect: r,
  loading: n = !1,
  groups: o = _r,
  "aria-label": s = "source",
  className: a
}) {
  const l = (d) => {
    const c = e.find((u) => u.id === d) ?? null;
    r(c ? Tr(c) : null);
  };
  return /* @__PURE__ */ i("label", { className: `sp-root${a ? ` ${a}` : ""}`, children: /* @__PURE__ */ b(
    "select",
    {
      className: "sp-select",
      "aria-label": s,
      value: t,
      onChange: (d) => l(d.target.value),
      children: [
        /* @__PURE__ */ i("option", { value: "", children: n ? "loading sources…" : "— pick a source —" }),
        o.map(({ group: d, label: c }) => /* @__PURE__ */ i(ys, { entries: e, group: d, label: c }, d))
      ]
    }
  ) });
}
function ys({
  entries: e,
  group: t,
  label: r
}) {
  const n = e.filter((o) => o.group === t);
  return n.length === 0 ? null : /* @__PURE__ */ i("optgroup", { label: r, children: n.map((o) => /* @__PURE__ */ i("option", { value: o.id, children: o.label }, o.id)) });
}
function _a({
  entries: e,
  value: t = "",
  onSelect: r,
  onSelectEntry: n,
  loading: o = !1,
  groups: s = _r,
  "aria-label": a = "source",
  className: l,
  placeholder: d = "Search sources…",
  autoFocus: c = !1
}) {
  const [u, p] = R(""), [x, g] = R(!1), [m, f] = R(0), v = V(null), C = e.find(($) => $.id === t) ?? null, N = fe(() => {
    const $ = u.trim().toLowerCase(), M = [];
    for (const { group: D, label: h } of s)
      e.filter(
        (H) => H.group === D && ($ === "" || H.label.toLowerCase().includes($) || h.toLowerCase().includes($))
      ).forEach((H, Z) => M.push({ entry: H, groupLabel: h, firstOfGroup: Z === 0 }));
    return M;
  }, [e, s, u]), _ = ($) => {
    r($ ? Tr($) : null), n == null || n($), g(!1), p("");
  }, S = ($) => {
    $.key === "ArrowDown" ? ($.preventDefault(), g(!0), f((M) => Math.min(M + 1, N.length - 1))) : $.key === "ArrowUp" ? ($.preventDefault(), f((M) => Math.max(M - 1, 0))) : $.key === "Enter" ? ($.preventDefault(), x && N[m] && _(N[m].entry)) : $.key === "Escape" && g(!1);
  };
  return /* @__PURE__ */ b("div", { className: `sp-root sp-combo${l ? ` ${l}` : ""}`, children: [
    /* @__PURE__ */ i(
      "input",
      {
        className: "sp-combo-input",
        role: "combobox",
        "aria-expanded": x,
        "aria-label": a,
        "aria-autocomplete": "list",
        autoFocus: c,
        value: x ? u : (C == null ? void 0 : C.label) ?? "",
        placeholder: o ? "loading sources…" : C ? C.label : d,
        onFocus: () => g(!0),
        onBlur: () => setTimeout(() => g(!1), 120),
        onChange: ($) => {
          p($.target.value), g(!0), f(0);
        },
        onKeyDown: S
      }
    ),
    x && /* @__PURE__ */ b("ul", { className: "sp-combo-list", role: "listbox", "aria-label": a, ref: v, children: [
      N.length === 0 && /* @__PURE__ */ i("li", { className: "sp-combo-empty", children: "No matching sources" }),
      N.map(($, M) => /* @__PURE__ */ b("li", { role: "presentation", children: [
        $.firstOfGroup && /* @__PURE__ */ i("div", { className: "sp-combo-group", children: $.groupLabel }),
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            role: "option",
            "aria-selected": M === m,
            className: `sp-combo-option${M === m ? " is-active" : ""}${$.entry.id === t ? " is-selected" : ""}`,
            onMouseDown: (D) => {
              D.preventDefault(), _($.entry);
            },
            onMouseEnter: () => f(M),
            children: $.entry.label
          }
        )
      ] }, $.entry.id))
    ] })
  ] });
}
function vs({ spec: e, state: t, onOpen: r, defaultOpen: n, children: o }) {
  const [s, a] = R(n ?? t.status !== "idle"), l = t.status === "idle", d = (c) => {
    a(c), c && l && r && r();
  };
  return /* @__PURE__ */ b(
    he.Root,
    {
      className: "sp-catalog-section",
      "aria-label": `section ${e.label}`,
      open: s,
      onOpenChange: d,
      children: [
        /* @__PURE__ */ b(
          he.Trigger,
          {
            className: "sp-catalog-section-head",
            "aria-label": `toggle section ${e.label}`,
            children: [
              /* @__PURE__ */ i(Kt, { className: "sp-catalog-section-chevron" }),
              /* @__PURE__ */ i("h3", { className: "sp-catalog-section-title", children: e.label }),
              /* @__PURE__ */ i("p", { className: "sp-catalog-section-hint", children: e.hint })
            ]
          }
        ),
        /* @__PURE__ */ i(he.Content, { className: "sp-catalog-section-content", children: ks(t, o) })
      ]
    }
  );
}
function ks(e, t) {
  return e.status === "idle" ? /* @__PURE__ */ i("p", { className: "sp-catalog-idle", children: "Expand to load." }) : e.status === "loading" ? /* @__PURE__ */ i("div", { "aria-label": "loading", className: "sp-catalog-skeleton" }) : e.status === "denied" ? /* @__PURE__ */ i("p", { "aria-label": "denied", className: "sp-catalog-denied", children: "Not permitted." }) : t(e.data);
}
function me({ children: e }) {
  return /* @__PURE__ */ i("p", { className: "sp-catalog-empty", children: e });
}
function Ns({ schema: e, onSelect: t }) {
  return /* @__PURE__ */ i("ul", { "aria-label": "schema browser", className: "sp-catalog-tree", children: e.tables.map((r) => /* @__PURE__ */ i(Cs, { name: r.name, columns: r.columns.map((n) => n.name), onSelect: t }, r.name)) });
}
function Cs({
  name: e,
  columns: t,
  onSelect: r
}) {
  return /* @__PURE__ */ i("li", { children: /* @__PURE__ */ b(he.Root, { className: "group/collapsible sp-catalog-tree-row", defaultOpen: !1, children: [
    /* @__PURE__ */ b("div", { className: "sp-catalog-tree-row-inner", children: [
      /* @__PURE__ */ i(
        he.Trigger,
        {
          "aria-label": `toggle table ${e}`,
          className: "sp-catalog-toggle",
          children: /* @__PURE__ */ i(Kt, { className: "sp-catalog-chevron" })
        }
      ),
      /* @__PURE__ */ b(
        "button",
        {
          type: "button",
          "aria-label": `insert table ${e}`,
          className: "sp-catalog-tree-table",
          onClick: () => r({ kind: "table", id: `table:${e}`, table: e }),
          children: [
            /* @__PURE__ */ i(jr, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
            /* @__PURE__ */ i("span", { className: "sp-catalog-tree-table-name", children: e })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ i(he.Content, { className: "sp-catalog-tree-content", children: /* @__PURE__ */ i("ul", { className: "sp-catalog-tree-columns", children: t.length === 0 ? /* @__PURE__ */ i("li", { className: "sp-catalog-tree-no-columns", children: "no columns" }) : t.map((n) => /* @__PURE__ */ i("li", { children: /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        "aria-label": `insert column ${e}.${n}`,
        className: "sp-catalog-tree-column",
        onClick: () => r({ kind: "column", id: `column:${e}.${n}`, table: e, column: n }),
        children: n
      }
    ) }, n)) }) })
  ] }) });
}
function Ma({
  sections: e,
  onSelect: t,
  onLoadSection: r,
  sectionSpecs: n = ps,
  className: o
}) {
  return /* @__PURE__ */ i("div", { "aria-label": "data explorer", className: `sp-root sp-catalog${o ? ` ${o}` : ""}`, children: n.map((s) => {
    const a = e[s.kind];
    return a ? /* @__PURE__ */ i(
      vs,
      {
        spec: s,
        state: a,
        onOpen: r ? () => r(s.kind) : void 0,
        children: (l) => Ss(s.kind, l, t)
      },
      s.kind
    ) : null;
  }) });
}
function Ss(e, t, r) {
  switch (e) {
    case "datasources": {
      const n = t ?? [];
      return n.length === 0 ? /* @__PURE__ */ i(me, { children: "No external datasources registered." }) : /* @__PURE__ */ i("ul", { className: "sp-catalog-list", children: n.map((o) => /* @__PURE__ */ i("li", { children: /* @__PURE__ */ b(
        "button",
        {
          type: "button",
          "aria-label": `insert datasource ${o.name}`,
          className: "sp-catalog-row sp-catalog-row-datasource",
          onClick: () => r({
            kind: "datasource",
            id: `datasource:${o.name}`,
            name: o.name,
            rowKind: o.kind,
            endpoint: o.endpoint
          }),
          children: [
            /* @__PURE__ */ b("span", { className: "sp-catalog-row-label", children: [
              /* @__PURE__ */ i(Kr, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
              o.name
            ] }),
            /* @__PURE__ */ i("span", { className: "sp-catalog-row-sub", children: o.endpoint ? `${o.kind} · ${o.endpoint}` : o.kind })
          ]
        }
      ) }, o.name)) });
    }
    case "schema": {
      const n = t;
      return n.tables.length === 0 ? /* @__PURE__ */ i(me, { children: "No local tables yet." }) : /* @__PURE__ */ i(Ns, { schema: n, onSelect: r });
    }
    case "series": {
      const n = t ?? [];
      return n.length === 0 ? /* @__PURE__ */ i(me, { children: "No series in this workspace." }) : /* @__PURE__ */ i("ul", { className: "sp-catalog-list", children: n.map((o) => /* @__PURE__ */ i("li", { children: /* @__PURE__ */ b(
        "button",
        {
          type: "button",
          "aria-label": `insert series ${o}`,
          className: "sp-catalog-row sp-catalog-row-series",
          onClick: () => r({ kind: "series", id: `series:${o}`, name: o }),
          children: [
            /* @__PURE__ */ i(Br, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
            o
          ]
        }
      ) }, o)) });
    }
    case "channels": {
      const n = t ?? [];
      return n.length === 0 ? /* @__PURE__ */ i(me, { children: "No channels registered." }) : /* @__PURE__ */ i("ul", { className: "sp-catalog-list", children: n.map((o) => {
        const s = bs([o])[0];
        return /* @__PURE__ */ i("li", { children: /* @__PURE__ */ b(
          "button",
          {
            type: "button",
            "aria-label": `insert channel ${o.id}`,
            className: "sp-catalog-row sp-catalog-row-channel",
            onClick: () => r(s),
            children: [
              /* @__PURE__ */ i(Wr, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
              o.id
            ]
          }
        ) }, s.id);
      }) });
    }
    case "insights": {
      const n = t ?? [];
      return n.length === 0 ? /* @__PURE__ */ i(me, { children: "No insights in this workspace." }) : /* @__PURE__ */ i("ul", { className: "sp-catalog-list", children: n.map((o) => {
        const s = gs([o])[0];
        return /* @__PURE__ */ i("li", { children: /* @__PURE__ */ b(
          "button",
          {
            type: "button",
            "aria-label": `insert insight ${o.title}`,
            className: "sp-catalog-row sp-catalog-row-insight",
            onClick: () => r(s),
            children: [
              /* @__PURE__ */ b("span", { className: "sp-catalog-row-label", children: [
                /* @__PURE__ */ i(Ze, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
                o.title
              ] }),
              (o.severity || o.status) && /* @__PURE__ */ i("span", { className: "sp-catalog-row-sub", children: [o.severity, o.status].filter(Boolean).join(" · ") })
            ]
          }
        ) }, s.id);
      }) });
    }
    case "inbox": {
      const n = t ?? [];
      return n.length === 0 ? /* @__PURE__ */ i(me, { children: "No items in this inbox." }) : /* @__PURE__ */ i("ul", { className: "sp-catalog-list", children: n.map((o) => {
        const s = ws([o])[0];
        return /* @__PURE__ */ i("li", { children: /* @__PURE__ */ b(
          "button",
          {
            type: "button",
            "aria-label": `insert inbox item ${o.id}`,
            className: "sp-catalog-row sp-catalog-row-inbox",
            onClick: () => r(s),
            children: [
              /* @__PURE__ */ b("span", { className: "sp-catalog-row-label", children: [
                /* @__PURE__ */ i(qt, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
                o.id
              ] }),
              /* @__PURE__ */ i("span", { className: "sp-catalog-row-sub", children: o.channel })
            ]
          }
        ) }, s.id);
      }) });
    }
    default:
      return null;
  }
}
const $s = ["info", "warning", "critical"];
function Ia(e) {
  return $s.indexOf(e);
}
function Ts(e) {
  return e === "critical" ? "destructive" : e === "warning" ? "warning" : "accent-2";
}
function Aa(e) {
  switch (e) {
    case "critical":
      return "hsl(var(--destructive))";
    case "warning":
      return "hsl(var(--warning))";
    default:
      return "hsl(var(--accent-2))";
  }
}
function Es(e) {
  return e === "open" ? "default" : e === "acked" ? "warning" : "success";
}
function Rs(e, t = Date.now()) {
  const r = Math.max(1, Math.floor((t - e) / 1e3));
  if (r < 60) return `${r}s ago`;
  const n = Math.floor(r / 60);
  if (n < 60) return r % 60 ? `${n}m ${r % 60}s ago` : `${n}m ago`;
  const o = Math.floor(n / 60);
  return o < 24 ? n % 60 ? `${o}h ${n % 60}m ago` : `${o}h ago` : `${Math.floor(o / 24)}d ago`;
}
function _s(e) {
  const t = `${e.kind}:${e.ref}`;
  return e.run ? `${t} · run:${e.run}` : t;
}
function Ms(e, t) {
  const [r, n] = R([]), [o, s] = R(null), [a, l] = R(!1), [d, c] = R(null), [u, p] = R(null), [x, g] = R(t), m = V(e);
  m.current = e;
  const f = W(async () => {
    l(!0);
    try {
      const S = await m.current.list({ ...x, cursor: void 0 });
      n(S.items), p(S.next ?? null), s(null);
    } catch (S) {
      s(S instanceof Error ? S.message : String(S));
    } finally {
      l(!1);
    }
  }, [x]), v = W(async () => {
    if (u) {
      l(!0);
      try {
        const S = await m.current.list({ ...x, cursor: u });
        n(($) => {
          const M = new Set($.map((D) => D.id));
          return [...$, ...S.items.filter((D) => !M.has(D.id))];
        }), p(S.next ?? null), s(null);
      } catch (S) {
        s(S instanceof Error ? S.message : String(S));
      } finally {
        l(!1);
      }
    }
  }, [x, u]);
  G(() => {
    f();
  }, [f]);
  const C = V(f);
  C.current = f, G(() => {
    const S = m.current.subscribe;
    return S ? S(() => {
      C.current();
    }) : void 0;
  }, []);
  const N = W((S) => {
    g(S);
  }, []), _ = W(
    async (S, $) => {
      c(S);
      try {
        $ === "ack" ? await m.current.ack(S) : await m.current.resolve(S), await f();
      } catch (M) {
        s(M instanceof Error ? M.message : String(M));
      } finally {
        c(null);
      }
    },
    [f]
  );
  return {
    items: r,
    error: o,
    loading: a,
    actingOn: d,
    nextCursor: u,
    refresh: f,
    loadMore: v,
    setFilter: N,
    act: _
  };
}
function za(e, t, r = 50) {
  const [n, o] = R(null), [s, a] = R(null), [l, d] = R(null), [c, u] = R(!0), [p, x] = R(null), [g, m] = R(0), f = V(e);
  f.current = e, G(() => {
    let N = !1;
    return (async () => {
      d(null), u(!0);
      try {
        const [_, S] = await Promise.all([
          f.current.get(t),
          f.current.occurrences(t, void 0, r)
        ]);
        if (N) return;
        o(_), a(S);
      } catch (_) {
        if (N) return;
        d(_ instanceof Error ? _.message : String(_));
      } finally {
        N || u(!1);
      }
    })(), () => {
      N = !0;
    };
  }, [t, r, g]);
  const v = W(() => m((N) => N + 1), []), C = W(
    async (N) => {
      x(N), d(null);
      try {
        N === "ack" ? await f.current.ack(t) : await f.current.resolve(t), m((_) => _ + 1);
      } catch (_) {
        d(_ instanceof Error ? _.message : String(_));
      } finally {
        x(null);
      }
    },
    [t]
  );
  return { insight: n, occurrences: s, error: l, loading: c, actingOn: p, refresh: v, act: C };
}
function Is({ severity: e }) {
  return /* @__PURE__ */ i("span", { className: `ins-badge tone-${Ts(e)}`, children: e });
}
function As({ status: e }) {
  return /* @__PURE__ */ i("span", { className: `ins-badge tone-${Es(e)}`, children: e });
}
function zs({
  insight: e,
  selected: t,
  onSelect: r,
  showStatus: n = !0,
  showSeverity: o = !1,
  actions: s,
  now: a
}) {
  const l = e.severity === "critical" ? "is-critical" : e.severity === "warning" ? "is-warning" : "is-info", d = /* @__PURE__ */ b(Or, { children: [
    /* @__PURE__ */ i("span", { className: `ins-dot ${l}`, role: "img", "aria-label": `severity: ${e.severity}` }),
    /* @__PURE__ */ b("span", { className: "ins-row-main", children: [
      /* @__PURE__ */ i("span", { className: "ins-row-title", children: e.title }),
      /* @__PURE__ */ b("span", { className: "ins-row-meta", children: [
        _s(e.origin),
        " · ×",
        e.count
      ] })
    ] }),
    /* @__PURE__ */ b("span", { className: "ins-row-side", children: [
      o && /* @__PURE__ */ i(Is, { severity: e.severity }),
      n && /* @__PURE__ */ i(As, { status: e.status }),
      /* @__PURE__ */ i("span", { className: "ins-time", children: Rs(e.last_ts, a) })
    ] })
  ] });
  return /* @__PURE__ */ b("li", { children: [
    r ? /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        className: `ins-row${t ? " is-selected" : ""}`,
        "aria-selected": t,
        "aria-label": `select insight ${e.dedup_key}`,
        onClick: () => r(e.id),
        children: d
      }
    ) : /* @__PURE__ */ i("div", { className: `ins-row${t ? " is-selected" : ""}`, children: d }),
    s
  ] });
}
function Ds({
  insight: e,
  actingOn: t = null,
  onAck: r,
  onResolve: n,
  onDismiss: o
}) {
  const s = t !== null;
  return /* @__PURE__ */ b("div", { className: "ins-actions", children: [
    o && /* @__PURE__ */ b("button", { type: "button", className: "ins-btn", onClick: o, disabled: s, children: [
      /* @__PURE__ */ i(Vt, { size: 13 }),
      "Dismiss"
    ] }),
    e.status === "open" && r && /* @__PURE__ */ b("button", { type: "button", className: "ins-btn", onClick: r, disabled: s, children: [
      t === "ack" ? /* @__PURE__ */ i(Ie, { size: 13, className: "ins-spin" }) : /* @__PURE__ */ i(Bt, { size: 13 }),
      "Ack"
    ] }),
    e.status !== "resolved" && n && /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        className: "ins-btn is-primary",
        onClick: n,
        disabled: s,
        children: [
          t === "resolve" ? /* @__PURE__ */ i(Ie, { size: 13, className: "ins-spin" }) : /* @__PURE__ */ i(yt, { size: 13 }),
          "Resolve"
        ]
      }
    ),
    e.status === "resolved" && /* @__PURE__ */ b("span", { className: "ins-badge tone-success", children: [
      /* @__PURE__ */ i(yt, { size: 12 }),
      " Resolved"
    ] })
  ] });
}
const Ps = { limit: 20 };
function Mr({
  client: e,
  filter: t = Ps,
  title: r = "Insights",
  interactive: n = !1,
  showRefresh: o = !0,
  paged: s = !0,
  onSelect: a,
  now: l
}) {
  const d = Ms(e, t), [c, u] = R(/* @__PURE__ */ new Set()), [p, x] = R(null);
  function g(f, v) {
    x(v), d.act(f, v).finally(() => x(null));
  }
  const m = d.items.filter((f) => !c.has(f.id));
  return /* @__PURE__ */ b("div", { className: "ins-root", children: [
    /* @__PURE__ */ b("div", { className: "ins-header", children: [
      /* @__PURE__ */ b("h3", { className: "ins-header-title", children: [
        /* @__PURE__ */ i(Ze, { size: 15 }),
        r,
        m.length > 0 && /* @__PURE__ */ b("span", { className: "ins-header-count", children: [
          "(",
          m.length,
          ")"
        ] })
      ] }),
      o && /* @__PURE__ */ i("div", { className: "ins-header-actions", children: /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: "ins-btn",
          onClick: () => void d.refresh(),
          disabled: d.loading,
          "aria-label": "Refresh insights",
          children: /* @__PURE__ */ i(Ie, { size: 13, className: d.loading ? "ins-spin" : void 0 })
        }
      ) })
    ] }),
    d.error && m.length === 0 ? /* @__PURE__ */ i("div", { className: "ins-error", role: "alert", children: d.error }) : m.length === 0 ? /* @__PURE__ */ b("div", { className: "ins-empty", children: [
      /* @__PURE__ */ i(Ze, { size: 16, className: d.loading ? "ins-spin" : void 0 }),
      d.loading ? "Loading insights…" : "No insights match this filter."
    ] }) : /* @__PURE__ */ i("ul", { className: "ins-list", children: m.map((f) => /* @__PURE__ */ i(
      zs,
      {
        insight: f,
        onSelect: a,
        now: l,
        actions: n ? /* @__PURE__ */ i(
          Ds,
          {
            insight: f,
            actingOn: d.actingOn === f.id ? p : null,
            onAck: f.status === "open" ? () => g(f.id, "ack") : void 0,
            onResolve: () => g(f.id, "resolve"),
            onDismiss: () => u((v) => new Set(v).add(f.id))
          }
        ) : void 0
      },
      f.id
    )) }),
    s && d.nextCursor !== null && m.length > 0 && /* @__PURE__ */ i("div", { className: "ins-more", children: /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        className: "ins-btn",
        onClick: () => void d.loadMore(),
        disabled: d.loading,
        "aria-label": "Load more insights",
        children: [
          /* @__PURE__ */ i(Ie, { size: 13, className: d.loading ? "ins-spin" : void 0 }),
          "Load more"
        ]
      }
    ) })
  ] });
}
function Da(e) {
  return /* @__PURE__ */ i(Mr, { ...e, interactive: !1 });
}
function Pa(e) {
  return /* @__PURE__ */ i(Mr, { ...e, interactive: !0 });
}
function Oa(e) {
  const t = [...e];
  function r() {
    return [...t].sort((n, o) => o.last_ts - n.last_ts || o.id.localeCompare(n.id));
  }
  return {
    async list(n) {
      let o = r();
      n.status && (o = o.filter((c) => c.status === n.status)), n.severity && (o = o.filter((c) => c.severity === n.severity)), n.origin_ref && (o = o.filter((c) => c.origin.ref.includes(n.origin_ref)));
      const s = n.limit ?? 50, a = o.slice(0, s), l = o.length > s ? { ts: a[a.length - 1].last_ts, id: a[a.length - 1].id } : void 0;
      return { items: a.map(({ evidence: c, ...u }) => u), next: l };
    },
    async get(n) {
      return t.find((o) => o.id === n) ?? null;
    },
    async ack(n) {
      const o = t.find((s) => s.id === n);
      o && (o.status = "acked");
    },
    async resolve(n) {
      const o = t.find((s) => s.id === n);
      o && (o.status = "resolved");
    },
    async occurrences() {
      return { items: [] };
    }
  };
}
function La() {
  const e = () => Promise.reject(new Error("Denied: mcp:insight.list:call"));
  return {
    list: e,
    get: e,
    ack: e,
    resolve: e,
    occurrences: e
  };
}
function U(...e) {
  return ct(Pe(e));
}
function Os({ ...e }) {
  return /* @__PURE__ */ i(j.Root, { ...e });
}
function Ls({ ...e }) {
  return /* @__PURE__ */ i(j.Portal, { ...e });
}
const Fs = z.forwardRef(function({ className: t, ...r }, n) {
  return /* @__PURE__ */ i(
    j.Overlay,
    {
      ref: n,
      className: U("fixed inset-0 z-50 bg-black/50", t),
      ...r
    }
  );
}), Gs = z.forwardRef(function({ className: t, children: r, ...n }, o) {
  return /* @__PURE__ */ b(Ls, { children: [
    /* @__PURE__ */ i(Fs, {}),
    /* @__PURE__ */ i(
      j.Content,
      {
        ref: o,
        className: U(
          "lb-panel fixed inset-y-0 right-0 z-50 flex h-full max-w-[95vw] flex-col border-l border-lbp-border bg-lbp-panel font-sans text-lbp-fg shadow-2xl outline-none",
          t
        ),
        ...n,
        children: r
      }
    )
  ] });
}), js = z.forwardRef(function({ className: t, ...r }, n) {
  return /* @__PURE__ */ i(j.Title, { ref: n, className: U("text-base font-semibold text-lbp-fg", t), ...r });
}), Ws = z.forwardRef(function({ className: t, ...r }, n) {
  return /* @__PURE__ */ i(j.Description, { ref: n, className: U("text-xs text-lbp-muted", t), ...r });
});
function Bs({ resizable: e, className: t, "aria-label": r = "resize panel" }) {
  return /* @__PURE__ */ i(
    "div",
    {
      role: "separator",
      "aria-orientation": "vertical",
      "aria-label": r,
      tabIndex: 0,
      ...e.handleProps,
      className: U(
        "group absolute left-0 top-0 z-10 h-full w-1.5 -translate-x-1/2 cursor-col-resize touch-none select-none",
        "outline-none",
        t
      ),
      children: /* @__PURE__ */ i(
        "div",
        {
          className: U(
            "mx-auto h-full w-px bg-lbp-border transition-colors",
            "group-hover:w-0.5 group-hover:bg-lbp-accent group-focus-visible:w-0.5 group-focus-visible:bg-lbp-accent",
            e.dragging && "w-0.5 bg-lbp-accent"
          )
        }
      )
    }
  );
}
function Ks({ initial: e, min: t, max: r, step: n = 24 }) {
  const o = W((m) => Math.min(r, Math.max(t, m)), [t, r]), [s, a] = R(() => o(e)), [l, d] = R(!1), c = V(null), u = W(
    (m) => {
      c.current = { x: m.clientX, w: s }, d(!0), m.currentTarget.setPointerCapture(m.pointerId), m.preventDefault();
    },
    [s]
  ), p = W(
    (m) => {
      if (!c.current) return;
      const f = c.current.x - m.clientX;
      a(o(c.current.w + f));
    },
    [o]
  ), x = W((m) => {
    c.current = null, d(!1), m.currentTarget.hasPointerCapture(m.pointerId) && m.currentTarget.releasePointerCapture(m.pointerId);
  }, []), g = W(
    (m) => {
      m.key === "ArrowLeft" ? (a((f) => o(f + n)), m.preventDefault()) : m.key === "ArrowRight" && (a((f) => o(f - n)), m.preventDefault());
    },
    [o, n]
  );
  return { width: s, dragging: l, handleProps: { onPointerDown: u, onPointerMove: p, onPointerUp: x, onKeyDown: g } };
}
function Fa({
  open: e,
  onOpenChange: t,
  title: r,
  description: n,
  headerAside: o,
  footer: s,
  "aria-label": a,
  initialWidth: l = 720,
  minWidth: d = 360,
  maxWidth: c = 1200,
  className: u,
  children: p
}) {
  const x = Ks({ initial: l, min: d, max: c });
  return /* @__PURE__ */ i(Os, { open: e, onOpenChange: t, children: /* @__PURE__ */ b(
    Gs,
    {
      "aria-label": a,
      style: { width: x.width },
      className: U(x.dragging && "select-none", u),
      children: [
        /* @__PURE__ */ i(Bs, { resizable: x }),
        /* @__PURE__ */ b("header", { className: "flex items-start justify-between gap-3 border-b border-lbp-border bg-lbp-secondary px-4 py-3", children: [
          /* @__PURE__ */ b("div", { className: "min-w-0", children: [
            /* @__PURE__ */ i(js, { children: r }),
            n ? /* @__PURE__ */ i(Ws, { className: "mt-0.5", children: n }) : null
          ] }),
          o ? /* @__PURE__ */ i("div", { className: "shrink-0", children: o }) : null
        ] }),
        /* @__PURE__ */ i("div", { className: "min-h-0 flex-1 overflow-auto", children: p }),
        s ? /* @__PURE__ */ i("footer", { className: "flex items-center justify-end gap-2 border-t border-lbp-border bg-lbp-secondary px-4 py-3", children: s }) : null
      ]
    }
  ) });
}
function Ga({ title: e, aside: t, className: r, children: n }) {
  return /* @__PURE__ */ b("section", { className: U("mb-4 last:mb-0", r), children: [
    /* @__PURE__ */ b("div", { className: "mb-1.5 flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ i("div", { className: "text-[10px] font-semibold uppercase tracking-wide text-lbp-muted", children: e }),
      t
    ] }),
    n
  ] });
}
function ja({ columns: e, rows: t, empty: r = "—", className: n }) {
  return t.length === 0 ? /* @__PURE__ */ i("div", { className: "py-1 font-mono text-[11px] text-lbp-muted", children: r }) : /* @__PURE__ */ b("table", { className: U("w-full border-collapse font-mono text-[11px] tabular-nums", n), children: [
    /* @__PURE__ */ i("thead", { children: /* @__PURE__ */ i("tr", { className: "text-left text-lbp-muted", children: e.map((o) => /* @__PURE__ */ i("th", { className: "px-0 pb-1 pr-2 font-medium", children: o.header ?? o.key }, o.key)) }) }),
    /* @__PURE__ */ i("tbody", { children: t.map((o) => /* @__PURE__ */ i("tr", { className: "border-t border-lbp-border align-top", children: e.map((s) => {
      const a = o.cells[s.key], l = s.ellipsize && typeof a == "string" ? a : void 0;
      return /* @__PURE__ */ i(
        "td",
        {
          title: l,
          style: s.maxWidth ? { maxWidth: s.maxWidth } : void 0,
          className: U(
            "py-[3px] pr-2 pt-[3px]",
            s.ellipsize && "overflow-hidden text-ellipsis whitespace-nowrap",
            o.tone === "warn" && "text-lbp-amber",
            s.className
          ),
          children: a ?? "—"
        },
        s.key
      );
    }) }, o.id)) })
  ] });
}
function Wa({ k: e, v: t, keyWidth: r = 80, className: n }) {
  return /* @__PURE__ */ b("div", { className: U("flex gap-2 py-[2px] font-mono text-[11px]", n), children: [
    /* @__PURE__ */ i("span", { style: { width: r }, className: "shrink-0 text-lbp-muted", children: e }),
    /* @__PURE__ */ i("span", { className: "min-w-0 break-words text-lbp-fg", children: t })
  ] });
}
function Ir(e) {
  const t = [], r = /* @__PURE__ */ new Map();
  for (const n of e)
    r.has(n.group) || (r.set(n.group, []), t.push(n.group)), r.get(n.group).push(n);
  return t.map((n) => ({ label: n, items: r.get(n) }));
}
const He = 768;
function qs() {
  const [e, t] = z.useState(void 0);
  return z.useEffect(() => {
    if (!window.matchMedia) {
      t(window.innerWidth < He);
      return;
    }
    const r = window.matchMedia(`(max-width: ${He - 1}px)`), n = () => t(window.innerWidth < He);
    return r.addEventListener("change", n), n(), () => r.removeEventListener("change", n);
  }, []), !!e;
}
function A(...e) {
  return ct(Pe(e));
}
const Vs = it(
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
), Us = z.forwardRef(function({ className: t, variant: r, size: n, asChild: o = !1, ...s }, a) {
  return /* @__PURE__ */ i(o ? rt : "button", { ref: a, className: A(Vs({ variant: r, size: n, className: t })), ...s });
});
function Hs({ ...e }) {
  return /* @__PURE__ */ i(j.Root, { ...e });
}
function Ys({ ...e }) {
  return /* @__PURE__ */ i(j.Portal, { ...e });
}
const Qs = z.forwardRef(function({ className: t, ...r }, n) {
  return /* @__PURE__ */ i(
    j.Overlay,
    {
      ref: n,
      className: A("fixed inset-0 z-50 bg-black/50 animate-in fade-in-0", t),
      ...r
    }
  );
}), Zs = z.forwardRef(function({ className: t, children: r, side: n = "right", ...o }, s) {
  return /* @__PURE__ */ b(Ys, { children: [
    /* @__PURE__ */ i(Qs, {}),
    /* @__PURE__ */ b(
      j.Content,
      {
        ref: s,
        className: A(
          "fixed z-50 flex flex-col gap-4 bg-nr-bg text-nr-fg shadow-lg transition ease-in-out animate-in",
          n === "right" && "inset-y-0 right-0 h-full w-3/4 border-l border-nr-border sm:max-w-sm",
          n === "left" && "inset-y-0 left-0 h-full w-3/4 border-r border-nr-border sm:max-w-sm",
          n === "top" && "inset-x-0 top-0 h-auto border-b border-nr-border",
          n === "bottom" && "inset-x-0 bottom-0 h-auto border-t border-nr-border",
          t
        ),
        ...o,
        children: [
          r,
          /* @__PURE__ */ b(j.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nr-accent/25", children: [
            /* @__PURE__ */ i(Vt, { className: "h-4 w-4" }),
            /* @__PURE__ */ i("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
});
function Xs({ className: e, ...t }) {
  return /* @__PURE__ */ i("div", { className: A("flex flex-col gap-1.5 p-4", e), ...t });
}
const Js = z.forwardRef(function({ className: t, ...r }, n) {
  return /* @__PURE__ */ i(j.Title, { ref: n, className: A("font-semibold text-nr-fg", t), ...r });
}), ei = z.forwardRef(function({ className: t, ...r }, n) {
  return /* @__PURE__ */ i(j.Description, { ref: n, className: A("text-sm text-nr-muted", t), ...r });
});
function ti({
  delayDuration: e = 0,
  ...t
}) {
  return /* @__PURE__ */ i(ye.Provider, { delayDuration: e, ...t });
}
function ri({ ...e }) {
  return /* @__PURE__ */ i(ye.Root, { ...e });
}
function ni({ ...e }) {
  return /* @__PURE__ */ i(ye.Trigger, { ...e });
}
function oi({
  className: e,
  sideOffset: t = 6,
  ...r
}) {
  return /* @__PURE__ */ i(ye.Portal, { children: /* @__PURE__ */ i(
    ye.Content,
    {
      sideOffset: t,
      className: A(
        "z-50 overflow-hidden rounded-md border border-nr-border bg-nr-panel px-2.5 py-1.5 text-xs text-nr-fg shadow-md animate-in fade-in-0 zoom-in-95",
        e
      ),
      ...r
    }
  ) });
}
const si = "nav_rail_state", ii = 60 * 60 * 24 * 7, ai = "16rem", li = "18rem", ci = "3.5rem", di = "b", Ar = z.createContext(null);
function J() {
  const e = z.useContext(Ar);
  if (!e)
    throw new Error("useSidebar must be used within a SidebarProvider.");
  return e;
}
function ui({
  defaultOpen: e = !0,
  open: t,
  onOpenChange: r,
  className: n,
  style: o,
  children: s,
  ...a
}) {
  const l = qs(), [d, c] = z.useState(!1), [u, p] = z.useState(e), x = t ?? u, g = z.useCallback(
    (C) => {
      const N = typeof C == "function" ? C(x) : C;
      r ? r(N) : p(N), document.cookie = `${si}=${N}; path=/; max-age=${ii}`;
    },
    [x, r]
  ), m = z.useCallback(() => l ? c((C) => !C) : g((C) => !C), [l, g]);
  z.useEffect(() => {
    const C = (N) => {
      N.key === di && (N.metaKey || N.ctrlKey) && (N.preventDefault(), m());
    };
    return window.addEventListener("keydown", C), () => window.removeEventListener("keydown", C);
  }, [m]);
  const f = x ? "expanded" : "collapsed", v = z.useMemo(
    () => ({
      state: f,
      open: x,
      setOpen: g,
      isMobile: l,
      openMobile: d,
      setOpenMobile: c,
      toggleSidebar: m
    }),
    [f, x, g, l, d, m]
  );
  return /* @__PURE__ */ i(Ar.Provider, { value: v, children: /* @__PURE__ */ i(ti, { delayDuration: 0, children: /* @__PURE__ */ i(
    "div",
    {
      "data-slot": "sidebar-wrapper",
      style: {
        "--sidebar-width": ai,
        "--sidebar-width-icon": ci,
        ...o
      },
      className: A("group/sidebar-wrapper flex h-full min-h-0 w-full", n),
      ...a,
      children: s
    }
  ) }) });
}
function mi({
  side: e = "left",
  variant: t = "sidebar",
  collapsible: r = "offcanvas",
  className: n,
  children: o,
  ...s
}) {
  const { isMobile: a, state: l, openMobile: d, setOpenMobile: c } = J(), u = l === "collapsed" && r !== "none", p = t === "floating" || t === "inset";
  if (r === "none")
    return /* @__PURE__ */ i("div", { className: A("flex h-full w-[var(--sidebar-width)] flex-col bg-nr-panel text-nr-fg", n), ...s, children: o });
  if (a)
    return /* @__PURE__ */ i(Hs, { open: d, onOpenChange: c, ...s, children: /* @__PURE__ */ b(
      Zs,
      {
        "data-sidebar": "sidebar",
        "data-mobile": "true",
        className: "w-[var(--sidebar-width)] bg-nr-panel p-0 text-nr-fg [&>button]:hidden",
        style: { "--sidebar-width": li },
        side: e,
        children: [
          /* @__PURE__ */ b(Xs, { className: "sr-only", children: [
            /* @__PURE__ */ i(Js, { children: "Sidebar" }),
            /* @__PURE__ */ i(ei, { children: "Displays the mobile sidebar." })
          ] }),
          /* @__PURE__ */ i("div", { className: "flex h-full w-full flex-col", children: o })
        ]
      }
    ) });
  const x = "w-[var(--sidebar-width)]", g = p ? "w-[calc(var(--sidebar-width-icon)+1rem)]" : "w-[var(--sidebar-width-icon)]";
  return /* @__PURE__ */ b(
    "div",
    {
      className: "group peer hidden text-nr-fg md:block",
      "data-state": l,
      "data-collapsible": u ? r : "",
      "data-variant": t,
      "data-side": e,
      "data-slot": "sidebar",
      children: [
        /* @__PURE__ */ i(
          "div",
          {
            "data-slot": "sidebar-gap",
            className: A(
              "relative h-full bg-transparent transition-[width] duration-200 ease-linear",
              u && r === "offcanvas" ? "w-0" : u ? g : x
            )
          }
        ),
        /* @__PURE__ */ i(
          "div",
          {
            "data-slot": "sidebar-container",
            className: A(
              "fixed inset-y-0 z-10 hidden h-full transition-[left,right,width] duration-200 ease-linear md:flex",
              e === "left" ? "left-0" : "right-0",
              u && r === "offcanvas" && e === "left" && "-left-[var(--sidebar-width)]",
              u && r === "offcanvas" && e === "right" && "-right-[var(--sidebar-width)]",
              u && r === "icon" ? g : x,
              p && "p-2",
              !p && "border-r border-nr-border",
              n
            ),
            ...s,
            children: /* @__PURE__ */ i(
              "div",
              {
                "data-sidebar": "sidebar",
                "data-slot": "sidebar-inner",
                className: A(
                  "flex h-full w-full flex-col bg-nr-panel text-nr-fg",
                  p && "rounded-lg border border-nr-border shadow-sm"
                ),
                children: o
              }
            )
          }
        )
      ]
    }
  );
}
function fi({
  className: e,
  onClick: t,
  ...r
}) {
  const { toggleSidebar: n } = J();
  return /* @__PURE__ */ b(
    Us,
    {
      "data-sidebar": "trigger",
      variant: "ghost",
      size: "icon",
      className: A("h-8 w-8 text-nr-muted hover:bg-nr-bg hover:text-nr-fg", e),
      onClick: (o) => {
        t == null || t(o), n();
      },
      ...r,
      children: [
        /* @__PURE__ */ i(qr, { className: "h-4 w-4" }),
        /* @__PURE__ */ i("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
}
function hi({ className: e, ...t }) {
  const { toggleSidebar: r } = J();
  return /* @__PURE__ */ i(
    "button",
    {
      "data-sidebar": "rail",
      "aria-label": "Toggle Sidebar",
      tabIndex: -1,
      onClick: r,
      title: "Toggle Sidebar",
      className: A(
        "absolute inset-y-0 -right-3 z-20 hidden w-4 transition-all after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 hover:after:bg-nr-border sm:flex",
        e
      ),
      ...t
    }
  );
}
function pi({ className: e, ...t }) {
  const { state: r } = J();
  return /* @__PURE__ */ i(
    "div",
    {
      "data-sidebar": "header",
      className: A("flex flex-col gap-2 p-2", r === "collapsed" && "items-center px-0", e),
      ...t
    }
  );
}
function bi({ className: e, ...t }) {
  const { state: r } = J();
  return /* @__PURE__ */ i(
    "div",
    {
      "data-sidebar": "footer",
      className: A("flex flex-col gap-2 p-2", r === "collapsed" && "items-center px-0", e),
      ...t
    }
  );
}
function gi({ className: e, ...t }) {
  return /* @__PURE__ */ i(
    "div",
    {
      "data-sidebar": "content",
      className: A(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        e
      ),
      ...t
    }
  );
}
function wi({ className: e, ...t }) {
  const { state: r } = J();
  return /* @__PURE__ */ i(
    "div",
    {
      "data-sidebar": "group",
      className: A("relative flex w-full min-w-0 flex-col p-2", r === "collapsed" && "items-center px-0", e),
      ...t
    }
  );
}
function xi({ className: e, ...t }) {
  const { state: r } = J();
  return /* @__PURE__ */ i(
    "div",
    {
      "data-sidebar": "group-label",
      className: A(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-nr-muted transition-[margin,opacity] duration-200",
        r === "collapsed" && "-mt-8 opacity-0",
        e
      ),
      ...t
    }
  );
}
function yi({ className: e, ...t }) {
  return /* @__PURE__ */ i("div", { "data-sidebar": "group-content", className: A("w-full text-sm", e), ...t });
}
function vi({ className: e, ...t }) {
  const { state: r } = J();
  return /* @__PURE__ */ i(
    "ul",
    {
      "data-sidebar": "menu",
      className: A("flex w-full min-w-0 flex-col gap-1", r === "collapsed" && "items-center", e),
      ...t
    }
  );
}
function ki({ className: e, ...t }) {
  return /* @__PURE__ */ i("li", { "data-sidebar": "menu-item", className: A("group/menu-item relative", e), ...t });
}
const Ni = it(
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
function Ci({
  asChild: e = !1,
  isActive: t = !1,
  variant: r = "default",
  size: n = "default",
  tooltip: o,
  className: s,
  ...a
}) {
  const l = e ? rt : "button", { isMobile: d, state: c } = J(), u = /* @__PURE__ */ i(
    l,
    {
      "data-sidebar": "menu-button",
      "data-size": n,
      "data-active": t,
      className: A(
        Ni({ variant: r, size: n }),
        c === "collapsed" && "mx-auto h-8 w-8 p-2 [&>span]:sr-only",
        n === "lg" && c === "collapsed" && "mx-auto h-8 w-8 p-0",
        s
      ),
      ...a
    }
  );
  return !o || c !== "collapsed" || d ? u : /* @__PURE__ */ b(ri, { children: [
    /* @__PURE__ */ i(ni, { asChild: !0, children: u }),
    /* @__PURE__ */ i(oi, { side: "right", align: "center", ...typeof o == "string" ? { children: o } : o })
  ] });
}
function Ba({
  items: e,
  active: t,
  onSelect: r,
  header: n,
  footer: o,
  defaultCollapsed: s = !1,
  className: a
}) {
  const l = Ir(e);
  return /* @__PURE__ */ i(ui, { defaultOpen: !s, className: `nav-rail ${a ?? ""}`, children: /* @__PURE__ */ b(mi, { collapsible: "icon", variant: "sidebar", children: [
    /* @__PURE__ */ b(pi, { children: [
      n,
      /* @__PURE__ */ i("div", { className: "flex items-center justify-end px-1 group-data-[collapsible=icon]:justify-center", children: /* @__PURE__ */ i(fi, { "aria-label": "Toggle sidebar", title: "Toggle sidebar" }) })
    ] }),
    /* @__PURE__ */ i(gi, { children: l.map((d, c) => /* @__PURE__ */ b(wi, { children: [
      d.label && /* @__PURE__ */ i(xi, { children: d.label }),
      /* @__PURE__ */ i(yi, { children: /* @__PURE__ */ i(vi, { children: d.items.map((u) => {
        const p = t === u.id, x = u.icon;
        return /* @__PURE__ */ i(ki, { children: /* @__PURE__ */ b(
          Ci,
          {
            "aria-label": u.label,
            "aria-current": p ? "page" : void 0,
            isActive: p,
            tooltip: u.label,
            onClick: () => r(u.id),
            children: [
              x && /* @__PURE__ */ i(x, {}),
              /* @__PURE__ */ i("span", { children: u.label })
            ]
          }
        ) }, u.id);
      }) }) })
    ] }, d.label ?? `__default-${c}`)) }),
    o && /* @__PURE__ */ i(bi, { children: o }),
    /* @__PURE__ */ i(hi, {})
  ] }) });
}
function Ka({
  items: e,
  active: t,
  onSelect: r,
  badge: n,
  className: o,
  "aria-label": s = "section navigation"
}) {
  const a = Ir(e);
  return /* @__PURE__ */ i(
    "nav",
    {
      "aria-label": s,
      className: A("nav-rail flex min-w-0 flex-col gap-2 text-nr-fg", o),
      children: a.map((l, d) => /* @__PURE__ */ b("div", { className: "flex flex-col gap-1", children: [
        l.label && /* @__PURE__ */ i("div", { className: "px-2 text-xs font-medium text-nr-muted", children: l.label }),
        l.items.map((c) => {
          const u = t === c.id, p = c.icon, x = n == null ? void 0 : n(c.id);
          return /* @__PURE__ */ b(
            "button",
            {
              type: "button",
              role: "tab",
              "aria-label": c.label,
              "aria-current": u ? "page" : void 0,
              "aria-selected": u,
              onClick: () => r(c.id),
              className: A(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none ring-nr-accent transition-colors focus-visible:ring-2",
                "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
                u ? "bg-nr-bg font-medium text-nr-fg" : "text-nr-muted hover:bg-nr-bg hover:text-nr-fg"
              ),
              children: [
                p && /* @__PURE__ */ i(p, {}),
                /* @__PURE__ */ i("span", { className: "min-w-0 flex-1 truncate", children: c.label }),
                x ? /* @__PURE__ */ i("span", { className: "rounded-full bg-nr-accent/15 px-1.5 text-[10px] text-nr-accent", children: x }) : null
              ]
            },
            c.id
          );
        })
      ] }, l.label ?? `__default-${d}`))
    }
  );
}
const qa = [
  "BarChart",
  "LineChart",
  "PieChart",
  "ScatterChart",
  "GridComponent",
  "LegendComponent",
  "TooltipComponent",
  "DatasetComponent",
  "MarkLineComponent",
  "MarkAreaComponent",
  "TitleComponent",
  "CanvasRenderer"
];
let zr = () => import("./echartsDefault-CWN45a00.js").then((e) => e.echarts);
function Va(e) {
  zr = e;
}
function Si() {
  return zr();
}
const $i = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--chart-6",
  "--chart-7",
  "--chart-8"
];
function te(e, t) {
  const n = ((typeof window > "u" ? "" : getComputedStyle(document.documentElement).getPropertyValue(e).trim()) || "215 16% 60%").replace(/,/g, " ").split(/\s+/).filter(Boolean), [o, s, a] = n;
  return !o || !s || !a ? t === void 0 ? "#808a99" : `rgba(128,138,153,${t})` : t === void 0 ? `hsl(${o}, ${s}, ${a})` : `hsla(${o}, ${s}, ${a}, ${t})`;
}
const Ti = [0.1, 0.28, 0.46, 0.64, 0.82, 1];
function Me(e) {
  return Ti.map((t) => te(e, t));
}
function Wt() {
  const e = ["--chart-4", "--chart-2", "--chart-6", "--chart-7", "--chart-3", "--chart-5"].map(
    (t) => te(t)
  );
  return {
    palette: $i.map((t) => te(t)),
    accent: te("--accent"),
    text: te("--foreground"),
    muted: te("--muted"),
    border: te("--border"),
    surface: te("--popover"),
    ramp: e,
    ramps: {
      spectral: e,
      accent: Me("--accent"),
      blue: Me("--chart-1"),
      green: Me("--chart-6"),
      amber: Me("--chart-7")
    }
  };
}
function Ua(e) {
  return {
    axisLine: { lineStyle: { color: e.border } },
    axisTick: { show: !1 },
    axisLabel: { color: e.muted, fontSize: 11 },
    splitLine: { lineStyle: { color: e.border, opacity: 0.38, type: "dashed" } },
    nameTextStyle: { color: e.muted, fontSize: 11 }
  };
}
function Ha(e) {
  return {
    backgroundColor: e.surface,
    borderColor: e.border,
    textStyle: { color: e.text, fontSize: 12 },
    extraCssText: "border-radius:8px;box-shadow:0 8px 24px hsl(0 0% 0% / 0.18);"
  };
}
function Ya(e) {
  return {
    textStyle: { color: e.muted, fontSize: 11 },
    inactiveColor: e.border,
    icon: "roundRect",
    itemWidth: 10,
    itemHeight: 10
  };
}
function Ei() {
  const [e, t] = R(0);
  return G(() => {
    if (typeof MutationObserver > "u") return;
    const r = new MutationObserver(() => t((n) => n + 1));
    return r.observe(document.documentElement, { attributes: !0, attributeFilter: ["class", "style"] }), () => r.disconnect();
  }, []), e;
}
function Qa({ option: e, ariaLabel: t, summary: r, className: n, onReady: o, bare: s }) {
  const a = V(null), l = V(null), d = V(o);
  d.current = o;
  const c = Ei();
  return G(() => {
    let u = !1, p;
    if (a.current)
      return (async () => {
        var m, f;
        const g = await Si();
        if (!(u || !a.current))
          try {
            l.current = g.init(a.current), (m = l.current) == null || m.setOption(e(Wt()), !0), l.current && (p = (f = d.current) == null ? void 0 : f.call(d, l.current));
          } catch {
            l.current = null;
          }
      })(), () => {
        var g;
        u = !0, p == null || p(), (g = l.current) == null || g.dispose(), l.current = null;
      };
  }, []), G(() => {
    var u;
    (u = l.current) == null || u.setOption(e(Wt()), !0);
  }, [e, c]), G(() => {
    const u = a.current;
    if (!u || typeof ResizeObserver > "u") return;
    const p = new ResizeObserver(() => {
      var x;
      return (x = l.current) == null ? void 0 : x.resize();
    });
    return p.observe(u), () => p.disconnect();
  }, []), // `dash-kit` is the kit's CSS scope root — every utility the kit compiles lives under it, so a kit
  // surface that forgets the class renders unstyled (and, more importantly, a kit rule can never
  // match a host element). `widget-no-drag` so dragging INSIDE the chart pans/brushes rather than
  // moving a host grid cell. `min-h-0 flex-1` because a flex-column parent otherwise collapses a
  // canvas child to zero height.
  /* @__PURE__ */ b(
    "div",
    {
      className: `dash-kit widget-no-drag relative min-h-0 w-full flex-1 ${n ?? ""}`,
      role: s ? void 0 : "img",
      "aria-label": s ? void 0 : t,
      children: [
        r,
        /* @__PURE__ */ i("div", { ref: a, className: "h-full w-full", "data-echart": t })
      ]
    }
  );
}
const Ri = {
  loading: {
    icon: Qr,
    title: "Loading…",
    wrap: "border-border/60",
    chip: "border-border/60 bg-muted-bg/40 text-muted",
    // Motion as STATE: the spinner means "still working". `motion-reduce` drops it for a viewer who
    // asked for less movement — the copy already carries the meaning.
    spin: !0
  },
  denied: {
    icon: Yr,
    title: "No access to this source",
    detail: "This view needs a capability you have not been granted.",
    wrap: "border-warning/30 bg-warning/[0.03]",
    chip: "border-warning/30 bg-warning/10 text-warning"
  },
  error: {
    icon: Hr,
    title: "This didn't load",
    wrap: "border-destructive/30 bg-destructive/[0.03]",
    chip: "border-destructive/30 bg-destructive/10 text-destructive"
  },
  empty: {
    icon: qt,
    title: "No data yet",
    detail: "This draws as soon as the query returns rows.",
    wrap: "border-border/60",
    chip: "border-border/60 bg-muted-bg/40 text-muted"
  },
  "table-only": {
    icon: Ur,
    title: "Nothing numeric to plot",
    detail: "Pick a numeric field for the y axis, or view the result as a table.",
    wrap: "border-border/60",
    chip: "border-border/60 bg-muted-bg/40 text-muted"
  }
}, Za = Vr;
function Ye({ tone: e, title: t, detail: r, action: n, className: o }) {
  const s = Ri[e], a = s.icon, l = r === null ? void 0 : r ?? s.detail;
  return /* @__PURE__ */ b(
    "div",
    {
      role: "status",
      "aria-live": "polite",
      "data-chart-state": e,
      className: `dash-kit flex h-full min-h-24 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center ${s.wrap} ${o ?? ""}`,
      children: [
        /* @__PURE__ */ i("span", { className: `rounded-xl border p-2.5 ${s.chip}`, children: /* @__PURE__ */ i(a, { className: `size-5 ${s.spin ? "animate-spin motion-reduce:animate-none" : ""}`, "aria-hidden": !0 }) }),
        /* @__PURE__ */ b("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ i("p", { className: "text-sm font-medium text-fg", children: t ?? s.title }),
          l ? /* @__PURE__ */ i("p", { className: "max-w-[44ch] text-xs leading-relaxed text-muted", children: l }) : null
        ] }),
        n
      ]
    }
  );
}
const _i = "repeating-linear-gradient(-45deg, rgba(255,255,255,0.35) 0 1px, transparent 1px 5px)";
function Xa({ segments: e, label: t, height: r = 6, className: n }) {
  const o = e.filter((a) => Number.isFinite(a.value) && a.value > 0), s = o.reduce((a, l) => a + l.value, 0);
  return /* @__PURE__ */ i(
    "div",
    {
      className: `dash-kit flex w-full overflow-hidden rounded-full bg-muted-bg/40 ${n ?? ""}`,
      style: { height: typeof r == "number" ? `${r}px` : r },
      role: t ? "img" : void 0,
      "aria-label": t,
      "aria-hidden": t ? void 0 : !0,
      "data-share-segments": o.length,
      children: s > 0 && o.map((a) => /* @__PURE__ */ i(
        "div",
        {
          title: a.title,
          "data-share-key": a.key,
          style: {
            width: `${a.value / s * 100}%`,
            backgroundColor: a.color,
            ...a.hatch ? { backgroundImage: _i } : {}
          }
        },
        a.key
      ))
    }
  );
}
function Ja({
  rows: e,
  label: t,
  className: r
}) {
  return /* @__PURE__ */ i("ul", { className: `dash-kit flex flex-wrap gap-x-4 gap-y-1 ${r ?? ""}`, "aria-label": t, children: e.map((n) => /* @__PURE__ */ b("li", { className: "flex items-center gap-1.5 text-xs", title: n.title, "data-share-row": n.key, children: [
    /* @__PURE__ */ i(
      "span",
      {
        "aria-hidden": !0,
        className: "h-2 w-2 shrink-0 rounded-[2px]",
        style: {
          backgroundColor: n.color,
          ...n.hatch ? {
            backgroundImage: "repeating-linear-gradient(-45deg, rgba(255,255,255,0.35) 0 1px, transparent 1px 3px)"
          } : {}
        }
      }
    ),
    /* @__PURE__ */ i("span", { className: "text-muted", children: n.label }),
    /* @__PURE__ */ i("span", { className: "tabular-nums text-fg", children: n.value }),
    n.secondary ? /* @__PURE__ */ b("span", { className: "tabular-nums text-muted", children: [
      "· ",
      n.secondary
    ] }) : null,
    n.action
  ] }, n.key)) });
}
const mt = Symbol.for("@nube/dash-kit.panelRenderer.v1");
function el(e) {
  globalThis[mt] = e;
}
function Mi() {
  return globalThis[mt];
}
function tl() {
  delete globalThis[mt], delete globalThis[ft];
}
const ft = Symbol.for("@nube/dash-kit.specHydrator.v1");
function rl(e) {
  globalThis[ft] = e;
}
function Ii(e) {
  const t = globalThis[ft];
  return t ? t(e) : e;
}
function Ai(e) {
  return e.replace(/^panel:/, "");
}
function Qe(e, t, r) {
  return {
    i: e,
    x: (r == null ? void 0 : r.x) ?? 0,
    y: (r == null ? void 0 : r.y) ?? 0,
    w: (r == null ? void 0 : r.w) ?? 12,
    h: (r == null ? void 0 : r.h) ?? 8,
    ...t
  };
}
function nl(e) {
  const t = ln(), r = e.ws ?? t;
  return (
    // Keyed on `ws`: a workspace switch mints a fresh cache rather than serving another workspace's
    // frames. (The workspace WALL is still the host's — this is de-dup, not security.)
    /* @__PURE__ */ i(kr, { ws: r, children: /* @__PURE__ */ i(zi, { ...e, ws: r }) }, r)
  );
}
function zi({
  ws: e,
  id: t,
  spec: r,
  cell: n,
  range: o,
  scope: s,
  refreshKey: a,
  className: l
}) {
  const d = an(), c = t ? Ai(t) : void 0, u = n ?? (c && r ? Qe(c, r) : null), [p, x] = R(u), [g, m] = R(null);
  if (G(() => {
    if (n || r || !c) {
      x(n ?? (c && r ? Qe(c, r) : null)), m(null);
      return;
    }
    let v = !0;
    return x(null), m(null), d.call("panel.get", { id: c }).then((C) => {
      if (!v) return;
      const N = C;
      x(Qe(c, Ii((N == null ? void 0 : N.spec) ?? {})));
    }).catch((C) => {
      v && m(tn(C) ? "denied" : "error");
    }), () => {
      v = !1;
    };
  }, [d, c, r, n, e]), g)
    return /* @__PURE__ */ i(
      Ye,
      {
        tone: g,
        className: l,
        title: g === "denied" ? "No access to this panel" : "This panel didn't load",
        detail: g === "denied" ? "`panel.get` is not in this extension's granted scope, or the panel isn't shared with you." : "The panel definition could not be fetched."
      }
    );
  if (!p) return /* @__PURE__ */ i(Ye, { tone: "loading", className: l });
  const f = Mi();
  return f ? /* @__PURE__ */ i("div", { className: `dash-kit flex min-h-0 flex-1 flex-col ${l ?? ""}`, "data-testid": "panel-embed", children: f({ cell: p, ws: e, range: o, scope: s, refreshKey: a }) }) : /* @__PURE__ */ i(
    Ye,
    {
      tone: "error",
      className: l,
      title: "No panel renderer registered",
      detail: "The host has not registered a widget renderer with the kit, so this panel cannot be drawn."
    }
  );
}
export {
  yn as BROWSER_TZ,
  Ea as BUILDER_SOURCE_GROUPS,
  Go as BUILTIN_PREFIX,
  ps as CATALOG_SECTION_SPECS,
  Za as CHART_STATE_ICON,
  me as CatalogEmpty,
  Ma as CatalogExplorer,
  Ns as CatalogSchemaTree,
  vs as CatalogSection,
  Ye as ChartState,
  qa as DASH_KIT_ECHARTS_PARTS,
  qi as DASH_KIT_READ_CAPS,
  Ki as DASH_KIT_READ_SCOPE,
  Qi as DEFAULT_RANGE_EXPR,
  Uo as DEFAULT_TTL_S,
  kr as DashboardCacheProvider,
  ta as DashboardRangePicker,
  ut as DashboardWsContext,
  Qa as EChart,
  pa as FreezeProvider,
  ga as FreshnessProvider,
  Ds as InsightActions,
  zs as InsightRow,
  Pa as InsightsAckWidget,
  Da as InsightsReadWidget,
  Mr as InsightsWidget,
  Wa as KV,
  Xe as KitDeniedError,
  Vi as KitProvider,
  yr as LIST_STALE_MS,
  Ft as MAX_PANELS,
  Bo as NAV_PATH_SEP,
  Ka as NavMenu,
  Ba as NavRail,
  Fa as Panel,
  nl as PanelEmbed,
  ys as PickerGroup,
  Pt as PrefDateInput,
  ja as PropTable,
  Io as QUICK_PERSIST_MAX_AGE_MS,
  vr as QUICK_PERSIST_VERSION,
  xr as RANGE_BANDS,
  wr as RANGE_COLUMNS,
  ea as RANGE_PRESETS,
  _r as READ_SOURCE_GROUPS,
  Bs as ResizeHandle,
  $s as SEVERITY_ORDER,
  ls as SQL_SOURCE_ID,
  Ga as Section,
  Is as SeverityBadge,
  Xa as ShareBar,
  Ja as ShareLegend,
  _a as SourceCombobox,
  Ra as SourcePicker,
  As as StatusBadge,
  ya as VizBatchProvider,
  fa as WithDashboardCache,
  ae as addUnits,
  Ua as axisChrome,
  Ai as bareId,
  sn as browserZone,
  ds as buildSourceEntries,
  ve as canon,
  bs as channelEntries,
  tl as clearPanelRenderer,
  ka as datasourceEntries,
  qo as datasourceListKey,
  Vo as datasourceListQueryOptions,
  $o as datePlaceholder,
  La as denyClient,
  Wt as echartsTheme,
  os as extWidgetEntries,
  ns as extensionEntries,
  Fo as extractVarNames,
  Wo as extractVarNamesDeep,
  ua as fetchDatasourceList,
  la as flowNodeStateKey,
  ss as flowsEntries,
  Dt as formatDateField,
  Mi as getPanelRenderer,
  Ii as hydrateSpec,
  ws as inboxEntries,
  gs as insightEntries,
  jo as isBuiltinName,
  tn as isKitDenied,
  Wi as isOutOfScope,
  Yi as isWindowExpr,
  Je as isoDayOf,
  st as labelOf,
  Ya as legendChrome,
  rs as liveEntries,
  fs as loadCatalog,
  Si as loadEcharts,
  hs as loadSourcePicker,
  To as makeDashboardQueryClient,
  on as makeInsightsClient,
  Bi as makeKitClient,
  nn as makeSourceLoaders,
  Gt as makeVizBatchLoader,
  Oa as memoryClient,
  oa as navBuiltins,
  ot as normalizeTz,
  _s as originLine,
  Ji as parseDateField,
  Ae as parseRangeExpr,
  Lo as persistQuickCache,
  er as preferredZone,
  Xi as previewBound,
  $a as queryCatalogEntries,
  as as queryEntries,
  Do as quickPersister,
  Zi as rangeTimezone,
  el as registerPanelRenderer,
  rl as registerSpecHydrator,
  ma as resolveFreshnessTtl,
  Cn as resolveRange,
  is as rulesEntries,
  Ca as schemaColumnEntries,
  Na as schemaTableEntries,
  Nr as scopeKey,
  Tr as selectionOf,
  Sa as seriesCatalogEntries,
  ts as seriesEntries,
  ca as seriesReadKey,
  Va as setEchartsLoader,
  Aa as severityColor,
  Ia as severityRank,
  Ts as severityTone,
  Rn as shortLabelOf,
  da as sourcePickerKey,
  Qe as specToCell,
  cs as sqlSourceEntry,
  Es as statusTone,
  Rs as timeAgo,
  te as tokenColor,
  rn as toolCallOf,
  Ha as tooltipChrome,
  Ta as useCatalog,
  ra as useDashboardWs,
  na as useDashboardWsOptional,
  ha as useDebounced,
  ba as useFreeze,
  wa as useFreshness,
  za as useInsight,
  Ms as useInsights,
  De as useKit,
  an as useKitClient,
  Ut as useKitOptional,
  Ui as useKitTheme,
  ln as useKitWs,
  Hi as useKitZone,
  Ks as useResizable,
  va as useSourcePicker,
  xa as useVizBatchLoader,
  ia as vizFetchKey,
  sa as vizQueryKey,
  aa as vizShapeKey,
  Sn as weekStartOf,
  Xo as widgetIdOf
};
