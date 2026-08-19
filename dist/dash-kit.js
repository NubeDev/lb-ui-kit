var Dr = Object.defineProperty;
var Pr = (e, t, r) => t in e ? Dr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var qe = (e, t, r) => Pr(e, typeof t != "symbol" ? t + "" : t, r);
import { jsx as a, jsxs as b, Fragment as Or } from "react/jsx-runtime";
import * as z from "react";
import { createContext as Ne, useMemo as fe, useContext as le, useRef as V, useState as _, useEffect as G, useCallback as B } from "react";
import { Calendar as Lr, CalendarRange as Fr, ChevronDown as Gr, Check as qt, ChevronRight as Vt, Table2 as jr, Inbox as Ut, Lightbulb as Xe, Hash as Br, LineChart as Wr, Database as Kr, X as Ht, RefreshCw as Ae, CheckCheck as vt, PanelLeftIcon as qr, BarChart3 as Vr, TableProperties as Ur, AlertTriangle as Hr, Lock as Yr, Loader2 as Qr } from "lucide-react";
import { Slot as nt } from "@radix-ui/react-slot";
import * as pe from "@radix-ui/react-dropdown-menu";
import { QueryClient as Zr, QueryClientProvider as Xr } from "@tanstack/react-query";
import { persistQueryClientRestore as Jr, persistQueryClientSave as en } from "@tanstack/react-query-persist-client";
import * as he from "@radix-ui/react-collapsible";
import * as j from "@radix-ui/react-dialog";
import * as ve from "@radix-ui/react-tooltip";
class Je extends Error {
  constructor(r, n) {
    super(`denied: ${r} — ${n}`);
    qe(this, "denied", !0);
    qe(this, "tool");
    this.name = "KitDeniedError", this.tool = r;
  }
}
function tn(e) {
  return e instanceof Je;
}
function rn(e) {
  return e instanceof Error && e.message.startsWith("out_of_scope:");
}
function nn(e) {
  if (typeof e == "function") return e;
  const t = e;
  return (r, n) => t.call(r, n);
}
function Y(e, t) {
  if (!e || typeof e != "object") return [];
  const r = e[t];
  return Array.isArray(r) ? r : [];
}
function on(e, t = {}) {
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
function sn(e) {
  return {
    list: (t) => e("insight.list", { ...t }).then((r) => r ?? { items: [] }),
    get: (t) => e("insight.get", { id: t }).then((r) => r ?? null),
    occurrences: (t, r, n) => e("insight.occurrences", {
      insight_id: t,
      cursor: r,
      limit: n ?? 50
    }).then((o) => o ?? { items: [] }),
    ack: () => Promise.reject(
      new Je(
        "insight.ack",
        "the kit is a READ kit; extension bridge writes are not implemented (U-ext-bridge-write)"
      )
    ),
    resolve: () => Promise.reject(
      new Je(
        "insight.resolve",
        "the kit is a READ kit; extension bridge writes are not implemented (U-ext-bridge-write)"
      )
    )
    // No `subscribe`: a live tail needs a stream seam the leashed call does not carry. Omitting it is
    // the interface's documented "no feed" case, so the hooks fall back to act→refresh.
  };
}
function qa(e, t = {}) {
  const r = nn(e);
  return {
    call: r,
    loaders: on(r, t),
    insights: sn(r)
  };
}
const an = /\bno such tool\b|\bnot found\b|\b404\b/i, ln = /\bdenied\b|\bforbidden\b|\bunauthori[sz]ed\b|\bnot authori[sz]ed\b|\bout_of_scope\b/i;
function cn(e) {
  if (tn(e) || rn(e)) return "denied";
  const t = e instanceof Error ? e.message : typeof e == "string" ? e : "";
  return ln.test(t) ? "denied" : an.test(t) ? "unavailable" : "error";
}
const Va = [
  "viz.query",
  "viz.query_batch",
  "series.read",
  "series.latest",
  "series.find",
  // Tier 2b: `PanelEmbed`'s library mode reads a curated panel by id. Without this entry the embed's
  // `panel.get` is rejected client-side as `out_of_scope` and the page renders a denial over a panel
  // the viewer can actually read — the same silent-under-render trap the batch verb has.
  "panel.get"
], Ua = [
  "mcp:viz.query:call",
  "mcp:series.read:call",
  "mcp:series.latest:call",
  "mcp:series.find:call",
  // Needed only by a page that embeds a LIBRARY panel (`PanelEmbed id=…`); an inline-cell embed does
  // not read the record. Requested anyway rather than left to be discovered: an admin who does not want
  // it declines it, and the embed renders an honest denial naming the verb.
  "mcp:panel.get:call"
];
function dn() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
const ot = Ne(null);
function Ha({ client: e, ws: t, theme: r, zone: n, children: o }) {
  const s = fe(
    () => ({ client: e, ws: t, theme: r, zone: n ?? dn }),
    [e, t, r, n]
  );
  return /* @__PURE__ */ a(ot.Provider, { value: s, children: o });
}
function Pe() {
  return le(ot);
}
function Oe() {
  const e = le(ot);
  if (!e)
    throw new Error(
      "useKit: no <KitProvider>. Wrap the page: <KitProvider client={makeKitClient(bridge)} ws={ctx.workspace}>"
    );
  return e;
}
function Ya() {
  return Oe().client;
}
function Qa() {
  return Oe().ws;
}
function Za() {
  return Oe().theme;
}
function Xa() {
  return Oe().zone;
}
const un = 864e5;
function be(e, t, r) {
  e -= t <= 2 ? 1 : 0;
  const n = Math.floor((e >= 0 ? e : e - 399) / 400), o = e - n * 400, s = Math.floor((153 * (t + (t > 2 ? -3 : 9)) + 2) / 5) + r - 1, i = o * 365 + Math.floor(o / 4) - Math.floor(o / 100) + s;
  return n * 146097 + i - 719468;
}
function Yt(e) {
  e += 719468;
  const t = Math.floor((e >= 0 ? e : e - 146096) / 146097), r = e - t * 146097, n = Math.floor(
    (r - Math.floor(r / 1460) + Math.floor(r / 36524) - Math.floor(r / 146096)) / 365
  ), o = n + t * 400, s = r - (365 * n + Math.floor(n / 4) - Math.floor(n / 100)), i = Math.floor((5 * s + 2) / 153), l = s - Math.floor((153 * i + 2) / 5) + 1, c = i + (i < 10 ? 3 : -9);
  return { y: o + (c <= 2 ? 1 : 0), mo: c, d: l };
}
function Qt(e, t) {
  const r = t === 12 ? { y: e + 1, mo: 1 } : { y: e, mo: t + 1 };
  return be(r.y, r.mo, 1) - be(e, t, 1);
}
function mn(e, t, r, n) {
  return (be(e, t, r) % 7 + (n === "sunday" ? 4 : 3) + 7) % 7;
}
const kt = /* @__PURE__ */ new Map();
function Zt(e) {
  let t = kt.get(e);
  return t || (t = new Intl.DateTimeFormat("en-US", {
    timeZone: e,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }), kt.set(e, t)), t;
}
function st(e) {
  if (!e) return "UTC";
  try {
    return Zt(e), e;
  } catch {
    return "UTC";
  }
}
function ge(e, t) {
  const r = Zt(t).formatToParts(e), n = (o) => {
    var s;
    return Number(((s = r.find((i) => i.type === o)) == null ? void 0 : s.value) ?? 0);
  };
  return { y: n("year"), mo: n("month"), d: n("day"), h: n("hour") % 24, mi: n("minute"), s: n("second") };
}
function Xt(e) {
  return be(e.y, e.mo, e.d) * un + ((e.h * 60 + e.mi) * 60 + e.s) * 1e3;
}
function Nt(e, t) {
  return Xt(ge(e, t)) - e;
}
function q(e, t) {
  const r = Xt(e), n = r - Nt(r, t);
  return r - Nt(n, t);
}
function et(e, t) {
  const r = ge(e, t), n = (o, s = 2) => String(o).padStart(s, "0");
  return `${n(r.y, 4)}-${n(r.mo)}-${n(r.d)}`;
}
const Ct = {
  s: "s",
  m: "m",
  h: "h",
  d: "d",
  w: "w",
  M: "M",
  y: "y"
}, fn = {
  second: "s",
  minute: "m",
  hour: "h",
  day: "d",
  week: "w",
  month: "M",
  quarter: "q",
  year: "y"
}, hn = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  y: "year"
}, pn = /^now(?:([+-])(\d{1,6})([smhdwMy]))?(?:\/([smhdwMy]))?$/, bn = /^(\d{4})-(\d{2})-(\d{2})$/, gn = /^\d{13}$/, wn = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?$/, xn = /^(this|last|next)-(hour|day|week|month|quarter|year)$/, yn = /^last-(\d{1,6})-(second|minute|hour|day|week|month|quarter|year)s?$/, vn = /^last-(\d{1,6})([smhdwMy])$/, Jt = "expected now±<n><unit> (units s m h d w M y, optional /<unit> snap), an ISO day or instant, 13-digit epoch ms, today/yesterday/tomorrow, this-/last-/next-<unit>, or last-<n>-<unit>s";
function Ee(e) {
  return { ok: !1, error: `unrecognized range expression "${e}" — ${Jt}` };
}
function St(e, t, r) {
  return t >= 1 && t <= 12 && r >= 1 && r <= Qt(e, t);
}
function ze(e) {
  const t = e.trim();
  if (!t) return { ok: !1, error: `empty range expression — ${Jt}` };
  if (t === "today") return ue({ kind: "day", offset: 0 });
  if (t === "yesterday") return ue({ kind: "day", offset: -1 });
  if (t === "tomorrow") return ue({ kind: "day", offset: 1 });
  const r = xn.exec(t);
  if (r)
    return ue({ kind: "period", rel: r[1], unit: r[2] });
  const n = yn.exec(t);
  if (n) return ue({ kind: "trailing", n: Number(n[1]), unit: fn[n[2]] });
  const o = vn.exec(t);
  if (o) return ue({ kind: "trailing", n: Number(o[1]), unit: Ct[o[2]] });
  const s = pn.exec(t);
  if (s) {
    const [, c, d, u, h] = s;
    return we({
      kind: "now",
      ...c ? { offset: { sign: c === "-" ? -1 : 1, n: Number(d), unit: Ct[u] } } : {},
      ...h ? { snap: hn[h] } : {}
    });
  }
  const i = bn.exec(t);
  if (i) {
    const [c, d, u] = [Number(i[1]), Number(i[2]), Number(i[3])];
    return St(c, d, u) ? we({ kind: "isoDay", y: c, mo: d, d: u }) : Ee(e);
  }
  if (gn.test(t)) return we({ kind: "instant", ms: Number(t) });
  const l = wn.exec(t);
  if (l) {
    const [, c, d, u, h, x, N, p, m] = l;
    if (!St(Number(c), Number(d), Number(u)) || Number(h) > 23 || Number(x) > 59) return Ee(e);
    if (m) {
      const v = Date.parse(t);
      return Number.isFinite(v) ? we({ kind: "instant", ms: v }) : Ee(e);
    }
    return we({
      kind: "wall",
      y: Number(c),
      mo: Number(d),
      d: Number(u),
      h: Number(h),
      mi: Number(x),
      s: Number(N ?? 0),
      ms: Number((p ?? "0").padEnd(3, "0"))
    });
  }
  return Ee(e);
}
function Ja(e) {
  const t = ze(e);
  return t.ok && t.expr.type === "window";
}
function ue(e) {
  return { ok: !0, expr: { type: "window", window: e } };
}
function we(e) {
  return { ok: !0, expr: { type: "endpoint", endpoint: e } };
}
const kn = "browser";
function er() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
function tr(e, ...t) {
  for (const r of t)
    if (r && r !== kn) return r;
  return e();
}
const ei = "last-30-days";
function ti(e, t, r = er) {
  return st(tr(r, e, t));
}
function Nn(e, t) {
  const r = e.y * 12 + (e.mo - 1) + t, n = Math.floor(r / 12), o = (r % 12 + 12) % 12 + 1;
  return { ...e, y: n, mo: o, d: Math.min(e.d, Qt(n, o)) };
}
function ie(e, t, r, n) {
  switch (r) {
    case "s":
      return e + t * 1e3;
    case "m":
      return e + t * 6e4;
    case "h":
      return e + t * 36e5;
    case "d":
    case "w": {
      const o = ge(e, n), s = r === "w" ? t * 7 : t, i = Yt(be(o.y, o.mo, o.d) + s);
      return q({ ...o, ...i }, n);
    }
    case "M":
    case "q":
    case "y": {
      const o = r === "M" ? t : r === "q" ? t * 3 : t * 12;
      return q(Nn(ge(e, n), o), n);
    }
  }
}
function Cn(e) {
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
function tt(e, t, r, n) {
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
      const i = Yt(be(o.y, o.mo, o.d) - mn(o.y, o.mo, o.d, s));
      return q({ ...o, ...i, h: 0, mi: 0, s: 0 }, r);
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
function $t(e, t, r, n) {
  switch (e.kind) {
    case "now": {
      let o = t;
      return e.offset && (o = ie(o, e.offset.sign * e.offset.n, e.offset.unit, r)), e.snap && (o = tt(o, e.snap, r, n)), o;
    }
    case "isoDay":
      return q({ y: e.y, mo: e.mo, d: e.d, h: 0, mi: 0, s: 0 }, r);
    case "instant":
      return e.ms;
    case "wall":
      return q({ y: e.y, mo: e.mo, d: e.d, h: e.h, mi: e.mi, s: e.s }, r) + e.ms;
  }
}
function Sn(e, t, r, n) {
  switch (e.kind) {
    case "day": {
      const o = ie(tt(t, "day", r), e.offset, "d", r);
      return e.offset === 0 ? { fromMs: o, toMs: t } : { fromMs: o, toMs: ie(o, 1, "d", r) };
    }
    case "period": {
      const o = tt(t, e.unit, r, n), s = Cn(e.unit);
      return e.rel === "this" ? { fromMs: o, toMs: t } : e.rel === "last" ? { fromMs: ie(o, -1, s, r), toMs: o } : { fromMs: ie(o, 1, s, r), toMs: ie(o, 2, s, r) };
    }
    case "trailing":
      return { fromMs: ie(t, -e.n, e.unit, r), toMs: t };
  }
}
function $n(e, t, r, n, o) {
  if (!e || !e.trim()) return null;
  const s = st(n), i = ze(e);
  if (!i.ok) return null;
  if (i.expr.type === "window")
    return t && t.trim() ? null : Sn(i.expr.window, r, s, o);
  const l = $t(i.expr.endpoint, r, s, o);
  let c = r;
  if (t && t.trim()) {
    const d = ze(t);
    if (!d.ok || d.expr.type !== "endpoint") return null;
    c = $t(d.expr.endpoint, r, s, o);
  }
  return l <= c ? { fromMs: l, toMs: c } : null;
}
function ri(e, t) {
  const r = st(t), n = ge(e, r), o = et(e, r);
  if (n.h === 0 && n.mi === 0 && n.s === 0 && e % 1e3 === 0) return o;
  const s = (i) => String(i).padStart(2, "0");
  return `${o} ${s(n.h)}:${s(n.mi)}`;
}
function Tn(e) {
  return e === "sunday" ? "sunday" : "monday";
}
const En = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  q: "quarter",
  y: "year"
};
function Rn(e) {
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function _n(e) {
  switch (e.kind) {
    case "day":
      return e.offset === 0 ? "Today" : e.offset === -1 ? "Yesterday" : "Tomorrow";
    case "period":
      return `${Rn(e.rel)} ${e.unit}`;
    case "trailing": {
      const t = En[e.unit];
      return `Last ${e.n} ${t}${e.n === 1 ? "" : "s"}`;
    }
  }
}
function at(e, t) {
  const r = ze(e);
  return r.ok && r.expr.type === "window" ? _n(r.expr.window) : t ? `${e} → ${t}` : e === "now" ? "Now" : `${e} → now`;
}
function Mn(e, t) {
  const r = /^\d{4}-\d{2}-\d{2}$/;
  if (t && r.test(e) && r.test(t)) {
    const n = (o) => {
      const s = /* @__PURE__ */ new Date(`${o}T00:00:00Z`);
      return Number.isNaN(s.getTime()) ? o : s.toLocaleDateString(void 0, { month: "short", day: "numeric", timeZone: "UTC" });
    };
    return `${n(e)} – ${n(t)}`;
  }
  return at(e, t);
}
function rr(e) {
  var t, r, n = "";
  if (typeof e == "string" || typeof e == "number") n += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (r = rr(e[t])) && (n && (n += " "), n += r);
  } else for (r in e) e[r] && (n && (n += " "), n += r);
  return n;
}
function Le() {
  for (var e, t, r = 0, n = "", o = arguments.length; r < o; r++) (e = arguments[r]) && (t = rr(e)) && (n && (n += " "), n += t);
  return n;
}
const Tt = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, Et = Le, it = (e, t) => (r) => {
  var n;
  if ((t == null ? void 0 : t.variants) == null) return Et(e, r == null ? void 0 : r.class, r == null ? void 0 : r.className);
  const { variants: o, defaultVariants: s } = t, i = Object.keys(o).map((d) => {
    const u = r == null ? void 0 : r[d], h = s == null ? void 0 : s[d];
    if (u === null) return null;
    const x = Tt(u) || Tt(h);
    return o[d][x];
  }), l = r && Object.entries(r).reduce((d, u) => {
    let [h, x] = u;
    return x === void 0 || (d[h] = x), d;
  }, {}), c = t == null || (n = t.compoundVariants) === null || n === void 0 ? void 0 : n.reduce((d, u) => {
    let { class: h, className: x, ...N } = u;
    return Object.entries(N).every((p) => {
      let [m, v] = p;
      return Array.isArray(v) ? v.includes({
        ...s,
        ...l
      }[m]) : {
        ...s,
        ...l
      }[m] === v;
    }) ? [
      ...d,
      h,
      x
    ] : d;
  }, []);
  return Et(e, i, c, r == null ? void 0 : r.class, r == null ? void 0 : r.className);
}, In = (e, t) => {
  const r = new Array(e.length + t.length);
  for (let n = 0; n < e.length; n++)
    r[n] = e[n];
  for (let n = 0; n < t.length; n++)
    r[e.length + n] = t[n];
  return r;
}, An = (e, t) => ({
  classGroupId: e,
  validator: t
}), nr = (e = /* @__PURE__ */ new Map(), t = null, r) => ({
  nextPart: e,
  validators: t,
  classGroupId: r
}), De = "-", Rt = [], zn = "arbitrary..", Dn = (e) => {
  const t = On(e), {
    conflictingClassGroups: r,
    conflictingClassGroupModifiers: n
  } = e;
  return {
    getClassGroupId: (i) => {
      if (i.startsWith("[") && i.endsWith("]"))
        return Pn(i);
      const l = i.split(De), c = l[0] === "" && l.length > 1 ? 1 : 0;
      return or(l, c, t);
    },
    getConflictingClassGroupIds: (i, l) => {
      if (l) {
        const c = n[i], d = r[i];
        return c ? d ? In(d, c) : c : d || Rt;
      }
      return r[i] || Rt;
    }
  };
}, or = (e, t, r) => {
  if (e.length - t === 0)
    return r.classGroupId;
  const o = e[t], s = r.nextPart.get(o);
  if (s) {
    const d = or(e, t + 1, s);
    if (d) return d;
  }
  const i = r.validators;
  if (i === null)
    return;
  const l = t === 0 ? e.join(De) : e.slice(t).join(De), c = i.length;
  for (let d = 0; d < c; d++) {
    const u = i[d];
    if (u.validator(l))
      return u.classGroupId;
  }
}, Pn = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const t = e.slice(1, -1), r = t.indexOf(":"), n = t.slice(0, r);
  return n ? zn + n : void 0;
})(), On = (e) => {
  const {
    theme: t,
    classGroups: r
  } = e;
  return Ln(r, t);
}, Ln = (e, t) => {
  const r = nr();
  for (const n in e) {
    const o = e[n];
    lt(o, r, n, t);
  }
  return r;
}, lt = (e, t, r, n) => {
  const o = e.length;
  for (let s = 0; s < o; s++) {
    const i = e[s];
    Fn(i, t, r, n);
  }
}, Fn = (e, t, r, n) => {
  if (typeof e == "string") {
    Gn(e, t, r);
    return;
  }
  if (typeof e == "function") {
    jn(e, t, r, n);
    return;
  }
  Bn(e, t, r, n);
}, Gn = (e, t, r) => {
  const n = e === "" ? t : sr(t, e);
  n.classGroupId = r;
}, jn = (e, t, r, n) => {
  if (Wn(e)) {
    lt(e(n), t, r, n);
    return;
  }
  t.validators === null && (t.validators = []), t.validators.push(An(r, e));
}, Bn = (e, t, r, n) => {
  const o = Object.entries(e), s = o.length;
  for (let i = 0; i < s; i++) {
    const [l, c] = o[i];
    lt(c, sr(t, l), r, n);
  }
}, sr = (e, t) => {
  let r = e;
  const n = t.split(De), o = n.length;
  for (let s = 0; s < o; s++) {
    const i = n[s];
    let l = r.nextPart.get(i);
    l || (l = nr(), r.nextPart.set(i, l)), r = l;
  }
  return r;
}, Wn = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Kn = (e) => {
  if (e < 1)
    return {
      get: () => {
      },
      set: () => {
      }
    };
  let t = 0, r = /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null);
  const o = (s, i) => {
    r[s] = i, t++, t > e && (t = 0, n = r, r = /* @__PURE__ */ Object.create(null));
  };
  return {
    get(s) {
      let i = r[s];
      if (i !== void 0)
        return i;
      if ((i = n[s]) !== void 0)
        return o(s, i), i;
    },
    set(s, i) {
      s in r ? r[s] = i : o(s, i);
    }
  };
}, rt = "!", _t = ":", qn = [], Mt = (e, t, r, n, o) => ({
  modifiers: e,
  hasImportantModifier: t,
  baseClassName: r,
  maybePostfixModifierPosition: n,
  isExternal: o
}), Vn = (e) => {
  const {
    prefix: t,
    experimentalParseClassName: r
  } = e;
  let n = (o) => {
    const s = [];
    let i = 0, l = 0, c = 0, d;
    const u = o.length;
    for (let m = 0; m < u; m++) {
      const v = o[m];
      if (i === 0 && l === 0) {
        if (v === _t) {
          s.push(o.slice(c, m)), c = m + 1;
          continue;
        }
        if (v === "/") {
          d = m;
          continue;
        }
      }
      v === "[" ? i++ : v === "]" ? i-- : v === "(" ? l++ : v === ")" && l--;
    }
    const h = s.length === 0 ? o : o.slice(c);
    let x = h, N = !1;
    h.endsWith(rt) ? (x = h.slice(0, -1), N = !0) : (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      h.startsWith(rt) && (x = h.slice(1), N = !0)
    );
    const p = d && d > c ? d - c : void 0;
    return Mt(s, N, x, p);
  };
  if (t) {
    const o = t + _t, s = n;
    n = (i) => i.startsWith(o) ? s(i.slice(o.length)) : Mt(qn, !1, i, void 0, !0);
  }
  if (r) {
    const o = n;
    n = (s) => r({
      className: s,
      parseClassName: o
    });
  }
  return n;
}, Un = (e) => {
  const t = /* @__PURE__ */ new Map();
  return e.orderSensitiveModifiers.forEach((r, n) => {
    t.set(r, 1e6 + n);
  }), (r) => {
    const n = [];
    let o = [];
    for (let s = 0; s < r.length; s++) {
      const i = r[s], l = i[0] === "[", c = t.has(i);
      l || c ? (o.length > 0 && (o.sort(), n.push(...o), o = []), n.push(i)) : o.push(i);
    }
    return o.length > 0 && (o.sort(), n.push(...o)), n;
  };
}, Hn = (e) => ({
  cache: Kn(e.cacheSize),
  parseClassName: Vn(e),
  sortModifiers: Un(e),
  postfixLookupClassGroupIds: Yn(e),
  ...Dn(e)
}), Yn = (e) => {
  const t = /* @__PURE__ */ Object.create(null), r = e.postfixLookupClassGroups;
  if (r)
    for (let n = 0; n < r.length; n++)
      t[r[n]] = !0;
  return t;
}, Qn = /\s+/, Zn = (e, t) => {
  const {
    parseClassName: r,
    getClassGroupId: n,
    getConflictingClassGroupIds: o,
    sortModifiers: s,
    postfixLookupClassGroupIds: i
  } = t, l = [], c = e.trim().split(Qn);
  let d = "";
  for (let u = c.length - 1; u >= 0; u -= 1) {
    const h = c[u], {
      isExternal: x,
      modifiers: N,
      hasImportantModifier: p,
      baseClassName: m,
      maybePostfixModifierPosition: v
    } = r(h);
    if (x) {
      d = h + (d.length > 0 ? " " + d : d);
      continue;
    }
    let k = !!v, g;
    if (k) {
      const D = m.substring(0, v);
      g = n(D);
      const f = g && i[g] ? n(m) : void 0;
      f && f !== g && (g = f, k = !1);
    } else
      g = n(m);
    if (!g) {
      if (!k) {
        d = h + (d.length > 0 ? " " + d : d);
        continue;
      }
      if (g = n(m), !g) {
        d = h + (d.length > 0 ? " " + d : d);
        continue;
      }
      k = !1;
    }
    const E = N.length === 0 ? "" : N.length === 1 ? N[0] : s(N).join(":"), C = p ? E + rt : E, $ = C + g;
    if (l.indexOf($) > -1)
      continue;
    l.push($);
    const M = o(g, k);
    for (let D = 0; D < M.length; ++D) {
      const f = M[D];
      l.push(C + f);
    }
    d = h + (d.length > 0 ? " " + d : d);
  }
  return d;
}, Xn = (...e) => {
  let t = 0, r, n, o = "";
  for (; t < e.length; )
    (r = e[t++]) && (n = ar(r)) && (o && (o += " "), o += n);
  return o;
}, ar = (e) => {
  if (typeof e == "string")
    return e;
  let t, r = "";
  for (let n = 0; n < e.length; n++)
    e[n] && (t = ar(e[n])) && (r && (r += " "), r += t);
  return r;
}, Jn = (e, ...t) => {
  let r, n, o, s;
  const i = (c) => {
    const d = t.reduce((u, h) => h(u), e());
    return r = Hn(d), n = r.cache.get, o = r.cache.set, s = l, l(c);
  }, l = (c) => {
    const d = n(c);
    if (d)
      return d;
    const u = Zn(c, r);
    return o(c, u), u;
  };
  return s = i, (...c) => s(Xn(...c));
}, eo = [], P = (e) => {
  const t = (r) => r[e] || eo;
  return t.isThemeGetter = !0, t;
}, ir = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, lr = /^\((?:(\w[\w-]*):)?(.+)\)$/i, to = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, ro = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, no = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, oo = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, so = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, ao = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, ee = (e) => to.test(e), T = (e) => !!e && !Number.isNaN(Number(e)), Q = (e) => !!e && Number.isInteger(Number(e)), Ve = (e) => e.endsWith("%") && T(e.slice(0, -1)), X = (e) => ro.test(e), cr = () => !0, io = (e) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  no.test(e) && !oo.test(e)
), ct = () => !1, lo = (e) => so.test(e), co = (e) => ao.test(e), uo = (e) => !w(e) && !y(e), mo = (e) => e.startsWith("@container") && (e[10] === "/" && e[11] !== void 0 || e[11] === "s" && e[16] !== void 0 && e.startsWith("-size/", 10) || e[11] === "n" && e[18] !== void 0 && e.startsWith("-normal/", 10)), fo = (e) => re(e, mr, ct), w = (e) => ir.test(e), se = (e) => re(e, fr, io), It = (e) => re(e, vo, T), ho = (e) => re(e, pr, cr), po = (e) => re(e, hr, ct), At = (e) => re(e, dr, ct), bo = (e) => re(e, ur, co), Re = (e) => re(e, br, lo), y = (e) => lr.test(e), xe = (e) => ce(e, fr), go = (e) => ce(e, hr), zt = (e) => ce(e, dr), wo = (e) => ce(e, mr), xo = (e) => ce(e, ur), _e = (e) => ce(e, br, !0), yo = (e) => ce(e, pr, !0), re = (e, t, r) => {
  const n = ir.exec(e);
  return n ? n[1] ? t(n[1]) : r(n[2]) : !1;
}, ce = (e, t, r = !1) => {
  const n = lr.exec(e);
  return n ? n[1] ? t(n[1]) : r : !1;
}, dr = (e) => e === "position" || e === "percentage", ur = (e) => e === "image" || e === "url", mr = (e) => e === "length" || e === "size" || e === "bg-size", fr = (e) => e === "length", vo = (e) => e === "number", hr = (e) => e === "family-name", pr = (e) => e === "number" || e === "weight", br = (e) => e === "shadow", ko = () => {
  const e = P("color"), t = P("font"), r = P("text"), n = P("font-weight"), o = P("tracking"), s = P("leading"), i = P("breakpoint"), l = P("container"), c = P("spacing"), d = P("radius"), u = P("shadow"), h = P("inset-shadow"), x = P("text-shadow"), N = P("drop-shadow"), p = P("blur"), m = P("perspective"), v = P("aspect"), k = P("ease"), g = P("animate"), E = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], C = () => [
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
  ], $ = () => [...C(), y, w], M = () => ["auto", "hidden", "clip", "visible", "scroll"], D = () => ["auto", "contain", "none"], f = () => [y, w, c], I = () => [ee, "full", "auto", ...f()], H = () => [Q, "none", "subgrid", y, w], Z = () => ["auto", {
    span: ["full", Q, y, w]
  }, Q, y, w], ne = () => [Q, "auto", y, w], pt = () => ["auto", "min", "max", "fr", y, w], Ge = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"], de = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"], K = () => ["auto", ...f()], oe = () => [ee, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...f()], je = () => [ee, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...f()], Be = () => [ee, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...f()], S = () => [e, y, w], bt = () => [...C(), zt, At, {
    position: [y, w]
  }], gt = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }], wt = () => ["auto", "cover", "contain", wo, fo, {
    size: [y, w]
  }], We = () => [Ve, xe, se], L = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    d,
    y,
    w
  ], F = () => ["", T, xe, se], Ce = () => ["solid", "dashed", "dotted", "double"], xt = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], O = () => [T, Ve, zt, At], yt = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    p,
    y,
    w
  ], Se = () => ["none", T, y, w], $e = () => ["none", T, y, w], Ke = () => [T, y, w], Te = () => [ee, "full", ...f()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [X],
      breakpoint: [X],
      color: [cr],
      container: [X],
      "drop-shadow": [X],
      ease: ["in", "out", "in-out"],
      font: [uo],
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
      "container-named": [mo],
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
        "break-after": E()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": E()
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
        basis: [ee, "full", "auto", l, ...f()]
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
        "auto-cols": pt()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": pt()
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
        justify: [...Ge(), "normal"]
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
        content: ["normal", ...Ge()]
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
        "place-content": Ge()
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
        size: oe()
      }],
      /**
       * Inline Size
       * @see https://tailwindcss.com/docs/width
       */
      "inline-size": [{
        inline: ["auto", ...je()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...je()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...je()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...Be()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...Be()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...Be()]
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
            screen: [i]
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
        font: [n, yo, ho]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", Ve, w]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [go, po, t]
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
        "line-clamp": [T, "none", y, It]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          s,
          ...f()
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
        placeholder: S()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: S()
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
        decoration: [...Ce(), "wavy"]
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
        decoration: S()
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
        indent: f()
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
        bg: bt()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: gt()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: wt()
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
        }, xo, bo]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: S()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: We()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: We()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: We()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: S()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: S()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: S()
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
        border: [...Ce(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...Ce(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: S()
      }],
      /**
       * Border Color Inline
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": S()
      }],
      /**
       * Border Color Block
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": S()
      }],
      /**
       * Border Color Inline Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": S()
      }],
      /**
       * Border Color Inline End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": S()
      }],
      /**
       * Border Color Block Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-bs": [{
        "border-bs": S()
      }],
      /**
       * Border Color Block End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-be": [{
        "border-be": S()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": S()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": S()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": S()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": S()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: S()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [...Ce(), "none", "hidden"]
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
        outline: S()
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
        shadow: S()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", h, _e, Re]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": S()
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
        ring: S()
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
        "ring-offset": S()
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
        "inset-ring": S()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", x, _e, Re]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": S()
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
        "mix-blend": [...xt(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": xt()
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
        "mask-linear-from": S()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": S()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": O()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": O()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": S()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": S()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": O()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": O()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": S()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": S()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": O()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": O()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": S()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": S()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": O()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": O()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": S()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": S()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": O()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": O()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": S()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": S()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": O()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": O()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": S()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": S()
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
        "mask-radial-from": S()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": S()
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
        "mask-radial-at": C()
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
        "mask-conic-from": S()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": S()
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
        mask: bt()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: gt()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: wt()
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
        blur: yt()
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
          N,
          _e,
          Re
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": S()
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
        "backdrop-blur": yt()
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
        ease: ["linear", "initial", k, y, w]
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
        animate: ["none", g, y, w]
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
        perspective: [m, y, w]
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
        rotate: Se()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": Se()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": Se()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": Se()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: $e()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": $e()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": $e()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": $e()
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
        skew: Ke()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": Ke()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": Ke()
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
        translate: Te()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": Te()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": Te()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": Te()
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
        accent: S()
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
        caret: S()
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
        "scrollbar-thumb": S()
      }],
      /**
       * Scrollbar Track Color
       * @see https://tailwindcss.com/docs/scrollbar-color
       */
      "scrollbar-track-color": [{
        "scrollbar-track": S()
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
        fill: ["none", ...S()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [T, xe, se, It]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...S()]
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
}, dt = /* @__PURE__ */ Jn(ko);
function W(...e) {
  return dt(Le(e));
}
const No = it(
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
), Me = z.forwardRef(function({ className: t, variant: r, size: n, asChild: o = !1, ...s }, i) {
  return /* @__PURE__ */ a(o ? nt : "button", { ref: i, className: W(No({ variant: r, size: n, className: t })), ...s });
});
function Co({ ...e }) {
  return /* @__PURE__ */ a(pe.Root, { "data-slot": "dropdown-menu", ...e });
}
function So({ ...e }) {
  return /* @__PURE__ */ a(pe.Trigger, { "data-slot": "dropdown-menu-trigger", ...e });
}
function $o({
  className: e,
  sideOffset: t = 4,
  ...r
}) {
  return /* @__PURE__ */ a(pe.Portal, { children: /* @__PURE__ */ a(
    pe.Content,
    {
      "data-slot": "dropdown-menu-content",
      sideOffset: t,
      className: W(
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
  return /* @__PURE__ */ a(
    pe.Label,
    {
      "data-slot": "dropdown-menu-label",
      "data-inset": t,
      className: W("px-2 py-1.5 text-xs text-muted data-[inset]:pl-8", e),
      ...r
    }
  );
}
function Dt({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ a(
    pe.Separator,
    {
      "data-slot": "dropdown-menu-separator",
      className: W("bg-border -mx-1 my-1 h-px", e),
      ...t
    }
  );
}
const gr = z.forwardRef(
  ({ className: e, type: t, ...r }, n) => /* @__PURE__ */ a(
    "input",
    {
      ref: n,
      type: t,
      "data-slot": "input",
      className: W(
        "flex h-9 w-full min-w-0 rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg shadow-sm shadow-black/0 transition-colors placeholder:text-muted/60 selection:bg-accent/20 selection:text-fg focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60",
        e
      ),
      ...r
    }
  )
);
gr.displayName = "Input";
const wr = { eu: "/", iso: "-", usa: "/" };
function Eo(e) {
  const t = wr[e];
  return e === "usa" ? `MM${t}DD${t}YYYY` : e === "iso" ? `YYYY${t}MM${t}DD` : `DD${t}MM${t}YYYY`;
}
function Pt(e, t) {
  const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e ?? "");
  if (!r) return "";
  const [, n, o, s] = r, i = wr[t];
  return t === "usa" ? `${o}${i}${s}${i}${n}` : t === "iso" ? `${n}${i}${o}${i}${s}` : `${s}${i}${o}${i}${n}`;
}
function ni(e, t) {
  const r = (e ?? "").split(/[/\-.]/).map((l) => l.trim());
  if (r.length !== 3 || r.some((l) => !/^\d+$/.test(l))) return "";
  let n, o, s;
  if (t === "usa" ? [o, s, n] = r : t === "iso" ? [n, o, s] = r : [s, o, n] = r, n.length !== 4) return "";
  const i = `${n}-${o.padStart(2, "0")}-${s.padStart(2, "0")}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(i) ? i : "";
}
function Ot({ value: e, onChange: t, dateStyle: r, className: n, ...o }) {
  const s = V(null), i = r ?? "eu", l = Pt(e, i) || Eo(i), c = !Pt(e, i);
  return /* @__PURE__ */ b(
    "div",
    {
      className: W(
        "dash-kit relative inline-flex h-8 items-center rounded-md border border-border bg-bg text-xs shadow-sm transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20",
        n
      ),
      children: [
        /* @__PURE__ */ a(
          "span",
          {
            "aria-hidden": !0,
            className: W("pointer-events-none px-2.5 pr-7", c && "text-muted/60"),
            children: l
          }
        ),
        /* @__PURE__ */ a(Lr, { "aria-hidden": !0, size: 13, className: "pointer-events-none absolute right-2 text-muted" }),
        /* @__PURE__ */ a(
          "input",
          {
            ...o,
            ref: s,
            type: "date",
            value: e,
            onChange: (d) => t(d.target.value),
            onClick: () => {
              var d;
              try {
                (d = s.current) == null || d.showPicker();
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
const xr = ["Minutes", "Hours", "Days", "Months", "Years"], R = (e, t) => ({ id: e, label: at(t), expr: t }), yr = [
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
], oi = yr.flatMap(
  (e) => xr.flatMap((t) => e.cells[t])
), Ue = /^\d{4}-\d{2}-\d{2}$/;
function si({
  from: e,
  to: t,
  onApply: r,
  timezone: n,
  compact: o,
  dateStyle: s,
  weekStart: i,
  onUserApply: l
}) {
  const [c, d] = _(!1), u = Pe(), h = tr((u == null ? void 0 : u.zone) ?? er, n), x = Tn(i), N = Ue.test(e) && t ? "" : e, [p, m] = _(N), v = fe(
    () => Ue.test(e) && t && Ue.test(t) ? { from: e, to: t } : { from: "", to: "" },
    [e, t]
  ), [k, g] = _(v);
  G(() => {
    m(N), g(v);
  }, [e, t]);
  const E = fe(() => Date.now(), [c]), C = fe(() => {
    const f = p.trim();
    if (!f) return null;
    const I = $n(f, void 0, E, h, x);
    return I ? {
      text: `${f} → ${et(I.fromMs, h)} → ${et(I.toMs, h)}`
    } : {
      error: "Not a range expression — try last-3-months, this-month, now-4h."
    };
  }, [p, E, h]), $ = (f) => {
    l == null || l(), r(f), d(!1);
  }, M = k.from !== e || k.to !== t, D = !!k.from && !!k.to && k.from > k.to;
  return /* @__PURE__ */ b(Co, { open: c, onOpenChange: d, children: [
    /* @__PURE__ */ a(So, { asChild: !0, children: /* @__PURE__ */ b(
      Me,
      {
        variant: "outline",
        size: "sm",
        className: W(
          "dash-kit gap-1.5 px-2.5 text-xs font-normal",
          o ? "h-11 md:h-8" : "h-8"
        ),
        title: "Change the dashboard time range",
        children: [
          /* @__PURE__ */ a(Fr, { size: 13, className: "text-muted" }),
          /* @__PURE__ */ a("span", { className: "max-w-[13rem] truncate", children: o ? Mn(e, t) : at(e, t) }),
          /* @__PURE__ */ a(Gr, { size: 13, className: "text-muted" })
        ]
      }
    ) }),
    /* @__PURE__ */ b(
      $o,
      {
        align: "end",
        className: W(
          // `dash-kit` on the CONTENT too, not only the trigger: the content renders in a Radix PORTAL
          // at the document root, outside the trigger's subtree, so a scope class on the trigger alone
          // would leave every utility in the popover unstyled.
          "dash-kit max-w-[calc(100vw-2rem)] p-0",
          o ? "w-[calc(100vw-2rem)]" : "w-[42rem]"
        ),
        children: [
          /* @__PURE__ */ a(To, { className: "px-3 pt-2.5 text-[0.7rem] uppercase tracking-wide text-muted", children: "Quick ranges" }),
          /* @__PURE__ */ a("div", { className: "px-1.5 pb-2", children: yr.map((f) => /* @__PURE__ */ b("div", { className: "mb-1 last:mb-0", children: [
            /* @__PURE__ */ b("div", { className: "flex items-baseline gap-1.5 px-1 pb-0.5 pt-1", children: [
              /* @__PURE__ */ a("span", { className: "text-[0.7rem] font-medium uppercase tracking-wide text-muted", children: f.label }),
              /* @__PURE__ */ a("span", { className: "text-[0.65rem] text-muted", children: f.hint })
            ] }),
            /* @__PURE__ */ a(
              "div",
              {
                className: W(
                  "grid gap-x-1 gap-y-0.5",
                  o ? "grid-cols-2" : "grid-cols-5"
                ),
                children: xr.map((I) => {
                  const H = f.cells[I];
                  return o && H.length === 0 ? null : /* @__PURE__ */ b("div", { className: "min-w-0", children: [
                    !o && /* @__PURE__ */ a("div", { className: "px-2 pb-0.5 text-[0.65rem] uppercase tracking-wide text-muted/70", children: I }),
                    H.map((Z) => {
                      const ne = !t && Z.expr === e;
                      return /* @__PURE__ */ b(
                        Me,
                        {
                          variant: "ghost",
                          size: "sm",
                          className: W(
                            "w-full justify-start gap-1.5 px-2 text-xs font-normal",
                            o ? "h-10" : "h-8",
                            ne && "bg-muted-bg font-medium text-fg"
                          ),
                          onClick: () => $({ from: Z.expr }),
                          children: [
                            /* @__PURE__ */ a(
                              qt,
                              {
                                size: 12,
                                className: W(
                                  "shrink-0 text-accent",
                                  !ne && "invisible"
                                )
                              }
                            ),
                            /* @__PURE__ */ a("span", { className: "truncate", children: Z.label })
                          ]
                        },
                        Z.id
                      );
                    })
                  ] }, I);
                })
              }
            )
          ] }, f.id)) }),
          /* @__PURE__ */ a(Dt, { className: "my-0" }),
          /* @__PURE__ */ b("div", { className: "space-y-1.5 px-3 py-2.5", children: [
            /* @__PURE__ */ a("div", { className: "text-[0.7rem] uppercase tracking-wide text-muted", children: "Relative range" }),
            /* @__PURE__ */ b(
              "form",
              {
                className: "flex items-center gap-1.5",
                onSubmit: (f) => {
                  f.preventDefault(), p.trim() && C && !("error" in C) && $({ from: p.trim() });
                },
                children: [
                  /* @__PURE__ */ a(
                    gr,
                    {
                      "aria-label": "dashboard relative range",
                      className: "h-8 flex-1 text-xs",
                      placeholder: "last-3-months, this-quarter, now-4h…",
                      value: p,
                      onChange: (f) => m(f.target.value)
                    }
                  ),
                  /* @__PURE__ */ a(
                    Me,
                    {
                      type: "submit",
                      size: "sm",
                      className: "h-8 text-xs",
                      disabled: !p.trim() || !C || "error" in C,
                      title: "Apply this relative range — re-queries every panel",
                      children: "Apply"
                    }
                  )
                ]
              }
            ),
            C && ("error" in C ? /* @__PURE__ */ a("p", { className: "text-[0.7rem] text-danger", children: C.error }) : /* @__PURE__ */ a(
              "p",
              {
                className: "truncate text-[0.7rem] text-muted",
                title: C.text,
                children: C.text
              }
            ))
          ] }),
          /* @__PURE__ */ a(Dt, { className: "my-0" }),
          /* @__PURE__ */ b("div", { className: "space-y-2 px-3 py-2.5", children: [
            /* @__PURE__ */ a("div", { className: "text-[0.7rem] uppercase tracking-wide text-muted", children: "Absolute range" }),
            /* @__PURE__ */ b("div", { className: "flex items-center gap-1.5 text-xs text-muted", children: [
              /* @__PURE__ */ a(
                Ot,
                {
                  "aria-label": "dashboard range from",
                  dateStyle: s,
                  className: "flex-1",
                  value: k.from,
                  onChange: (f) => g((I) => ({ ...I, from: f }))
                }
              ),
              /* @__PURE__ */ a("span", { children: "to" }),
              /* @__PURE__ */ a(
                Ot,
                {
                  "aria-label": "dashboard range to",
                  dateStyle: s,
                  className: "flex-1",
                  value: k.to ?? "",
                  onChange: (f) => g((I) => ({ ...I, to: f }))
                }
              )
            ] }),
            D ? /* @__PURE__ */ a("p", { className: "text-[0.7rem] text-danger", children: "The start date must not be after the end date." }) : /* @__PURE__ */ a("p", { className: "text-[0.7rem] text-muted", children: "The end date is exclusive — it ends at the start of that day." }),
            /* @__PURE__ */ a(
              Me,
              {
                size: "sm",
                className: "h-8 w-full text-xs",
                disabled: !M || D || !k.from || !k.to,
                title: M ? "Apply this range — re-queries every panel" : "This range is already applied",
                onClick: () => $({ from: k.from, to: k.to }),
                children: "Apply range"
              }
            )
          ] })
        ]
      }
    )
  ] });
}
const vr = 3e4;
function Ro() {
  return new Zr({
    defaultOptions: {
      queries: {
        // A read either resolves or honestly denies — never retry it into a fabricated success (§9).
        retry: !1,
        // No window refocus refetch: the refresh TICK (in the key) is the freshness signal, not focus.
        refetchOnWindowFocus: !1,
        // Floor stale window; tick-keyed reads are effectively "fresh until the next tick" via the key.
        staleTime: 0,
        gcTime: vr
      }
    }
  });
}
function Fe(e) {
  return new Promise((t, r) => {
    e.oncomplete = e.onsuccess = () => t(e.result), e.onabort = e.onerror = () => r(e.error);
  });
}
function _o(e, t) {
  let r;
  const n = () => {
    if (r)
      return r;
    const o = indexedDB.open(e);
    return o.onupgradeneeded = () => o.result.createObjectStore(t), r = Fe(o), r.then((s) => {
      s.onclose = () => r = void 0;
    }, () => {
      r = void 0;
    }), r;
  };
  return (o, s) => n().then((i) => s(i.transaction(t, o).objectStore(t)));
}
let He;
function ut() {
  return He || (He = _o("keyval-store", "keyval")), He;
}
function Mo(e, t = ut()) {
  return t("readonly", (r) => Fe(r.get(e)));
}
function Io(e, t, r = ut()) {
  return r("readwrite", (n) => (n.put(t, e), Fe(n.transaction)));
}
function Ao(e, t = ut()) {
  return t("readwrite", (r) => (r.delete(e), Fe(r.transaction)));
}
const kr = "v1", zo = 7 * 24 * 60 * 6e4, Do = "quick-";
function Po(e) {
  return `lb.quick-cache.${kr}.${e}`;
}
function Oo(e) {
  const t = Po(e);
  return {
    persistClient: (r) => Io(t, r).catch(() => {
    }),
    restoreClient: () => Mo(t).catch(() => {
    }),
    removeClient: () => Ao(t).catch(() => {
    })
  };
}
const Lo = 250;
function Fo(e, t) {
  const [r, n] = t.queryKey;
  return typeof r == "string" && r.startsWith(Do) && n === e && t.state.status === "success";
}
function Go(e, t) {
  if (!t) return () => {
  };
  const r = {
    queryClient: e,
    persister: Oo(t),
    maxAge: zo,
    // The buster is BELT AND BRACES with the versioned storage key: the key stops a stale store from
    // being found at all, this stops one that somehow was.
    buster: kr,
    dehydrateOptions: { shouldDehydrateQuery: (l) => Fo(t, l) }
  };
  let n = !1, o = null, s = null;
  const i = () => {
    n || o || (o = setTimeout(() => {
      o = null, n || en(r);
    }, Lo));
  };
  return Jr(r).catch(() => {
  }).then(() => {
    n || (i(), s = e.getQueryCache().subscribe(i));
  }), () => {
    n = !0, o && clearTimeout(o), s == null || s();
  };
}
const mt = Ne(null);
function ai() {
  const e = le(mt);
  if (e === null) throw new Error("useDashboardWs: no DashboardCacheProvider in tree");
  return e;
}
function ii() {
  return le(mt);
}
function jo({ ws: e, children: t }) {
  const [r] = _(Ro);
  return G(() => Go(r, e), [r, e]), /* @__PURE__ */ a(mt.Provider, { value: e, children: /* @__PURE__ */ a(Xr, { client: r, children: t }) });
}
const Ye = "[A-Za-z_][\\w.]*", Lt = new RegExp(
  // ${name} or ${name:format}
  `\\$\\{(${Ye})(?::[a-z]+)?\\}|\\[\\[(${Ye})(?::[a-z]+)?\\]\\]|\\$(${Ye})`,
  "g"
);
function Bo(e) {
  const t = [], r = /* @__PURE__ */ new Set();
  let n;
  for (Lt.lastIndex = 0; (n = Lt.exec(e)) !== null; ) {
    const o = n[1] ?? n[2] ?? n[3];
    o && !r.has(o) && (r.add(o), t.push(o));
  }
  return t;
}
const Wo = "__";
function Ko(e) {
  return e.startsWith(Wo);
}
function qo(e) {
  const t = [], r = /* @__PURE__ */ new Set(), n = (o) => {
    if (typeof o == "string")
      for (const s of Bo(o))
        r.has(s) || (r.add(s), t.push(s));
    else Array.isArray(o) ? o.forEach(n) : o && typeof o == "object" && Object.values(o).forEach(n);
  };
  return n(e), t;
}
const Vo = " / ";
function li(e, t) {
  var o;
  const r = {}, n = ((o = e == null ? void 0 : e.path) == null ? void 0 : o.filter((s) => s != null)) ?? [];
  return n.length > 0 && (r["__nav.label"] = n[n.length - 1], n.length > 1 && (r["__nav.parent.label"] = n[n.length - 2]), n.length > 2 && (r["__nav.parent.parent.label"] = n[n.length - 3]), r["__nav.path"] = n.join(Vo), (e == null ? void 0 : e.id) !== void 0 && (r["__nav.id"] = e.id)), t && (t.id !== void 0 && (r["__page.id"] = t.id), t.title !== void 0 && (r["__page.title"] = t.title), (t.id !== void 0 || t.title !== void 0) && (r["__page.ext"] = t.ext ?? "")), r;
}
const Ft = "scope";
function Uo(e) {
  let t = e;
  if (e && typeof e == "object" && !Array.isArray(e) && Ft in e) {
    const { [Ft]: r, ...n } = e;
    t = n;
  }
  return new Set(qo(t).filter(Ko));
}
function Nr(e, t) {
  if (!t || typeof t != "object" || Array.isArray(t)) return t;
  const { builtins: r, ...n } = t;
  if (!r || typeof r != "object" || Array.isArray(r))
    return t;
  const o = Uo(e), s = {};
  let i = !1;
  for (const [l, c] of Object.entries(
    r
  ))
    o.has(l) && (s[l] = c, i = !0);
  return i ? { ...n, builtins: s } : { ...n };
}
function ke(e) {
  if (Array.isArray(e)) return e.map(ke);
  if (e && typeof e == "object") {
    const t = {};
    for (const r of Object.keys(e).sort()) {
      const n = e[r];
      n !== void 0 && (t[r] = ke(n));
    }
    return t;
  }
  return e;
}
function ci(e, t) {
  return [
    "viz.query",
    e,
    ke({ ...t, scope: Nr(t, t.scope) })
  ];
}
function di(e, t) {
  return [
    "viz.fetch",
    e,
    ke({ ...t, scope: Nr(t, t.scope) })
  ];
}
function ui(e, t) {
  return ["viz.shape", e, ke(t)];
}
function mi(e, t, r) {
  return ["flows.node_state", e, t, r];
}
function fi(e, t) {
  return ["series.read", e, t];
}
function hi(e) {
  return ["source-picker", e];
}
function Ho(e) {
  return ["datasource.list", e];
}
function Yo(e, t) {
  return {
    queryKey: Ho(e),
    queryFn: () => t(),
    staleTime: vr
  };
}
function pi(e, t, r) {
  return e.fetchQuery(Yo(t, r));
}
const Qo = 120;
function bi({
  refreshMs: e,
  cacheTtlS: t
}) {
  return typeof e == "number" && e > 0 ? Math.max(1, Math.round(e / 1e3)) : t === 0 ? 0 : typeof t == "number" && t > 0 ? Math.floor(t) : Qo;
}
function gi({ ws: e, children: t }) {
  return /* @__PURE__ */ a(jo, { ws: e, children: t });
}
function wi(e, t) {
  const [r, n] = _(e);
  return G(() => {
    const o = setTimeout(() => n(e), t);
    return () => clearTimeout(o);
  }, [e, t]), r;
}
const Cr = Ne(!1), xi = Cr.Provider;
function yi() {
  return le(Cr);
}
const Sr = Ne(0), vi = Sr.Provider;
function ki() {
  return le(Sr);
}
const Gt = 64, Zo = "viz.query_batch", Xo = "viz.query";
function jt(e, t = {}) {
  const r = t.windowMs ?? 12, n = t.batchTool ?? Zo, o = t.singleTool ?? Xo, s = t.streamCall;
  let i = [], l = null, c = !0, d = !!s;
  const u = () => {
    l === null && (l = setTimeout(h, r));
  }, h = () => {
    l = null;
    const m = i;
    if (i = [], m.length !== 0)
      for (let v = 0; v < m.length; v += Gt)
        x(m.slice(v, v + Gt));
  }, x = async (m) => {
    if (!c && !d) {
      await N(m);
      return;
    }
    const v = Jo(m), k = { panels: m.map((g) => g.panel), now: 0 };
    if (v && (k.cache = v), d && s) {
      const g = /* @__PURE__ */ new Set();
      try {
        await s(k, (E, C) => {
          const $ = m[E];
          !$ || g.has(E) || (g.add(E), p($, C));
        }), m.forEach((E, C) => {
          g.has(C) || E.reject(new Error("viz.query_batch stream ended before this panel"));
        });
        return;
      } catch (E) {
        if (Bt(E) && (d = !1), m = m.filter((C, $) => !g.has($)), m.length === 0) return;
        k.panels = m.map((C) => C.panel);
      }
    }
    if (!c) {
      await N(m);
      return;
    }
    try {
      const g = await e(n, k), E = (g == null ? void 0 : g.results) ?? [];
      m.forEach((C, $) => p(C, E[$]));
    } catch (g) {
      Bt(g) && (c = !1), await N(m);
    }
  }, N = async (m) => {
    await Promise.all(
      m.map(async (v) => {
        try {
          const k = { panel: v.panel };
          v.cache && (k.cache = v.cache);
          const g = await e(o, k);
          v.resolve({ frames: (g == null ? void 0 : g.frames) ?? [], rows: g == null ? void 0 : g.rows });
        } catch (k) {
          v.reject(k);
        }
      })
    );
  }, p = (m, v) => {
    if (!v) {
      m.reject(new Error("viz.query_batch: missing result slice"));
      return;
    }
    if ("status" in v && (v.status === "error" || v.status === "denied")) {
      m.reject(new Error(v.message || v.status));
      return;
    }
    const k = v;
    m.resolve({ frames: k.frames ?? [], rows: k.rows });
  };
  return {
    load(m, v) {
      return new Promise((k, g) => {
        i.push({ panel: m, cache: v, resolve: k, reject: g }), u();
      });
    },
    get supported() {
      return c;
    },
    get streaming() {
      return d;
    }
  };
}
function Jo(e) {
  let t = 0;
  for (const r of e) r.cache && r.cache.ttl_s > t && (t = r.cache.ttl_s);
  return t > 0 ? { ttl_s: t } : void 0;
}
function Bt(e) {
  const t = (e instanceof Error ? e.message : String(e ?? "")).toLowerCase();
  return /not.?found|unknown (tool|command|verb|method)|no such|unsupported|\b400\b|\b404\b|unrecognized/.test(
    t
  );
}
const $r = Ne(null);
function Ni() {
  return le($r);
}
function Ci({
  call: e,
  streamCall: t,
  children: r
}) {
  const n = Pe(), o = fe(() => {
    if (e) return jt(e, { streamCall: t });
    if (!n)
      throw new Error(
        "VizBatchProvider: no `call` prop and no <KitProvider>. Give it one or the other."
      );
    const s = n.client;
    return jt((i, l) => s.call(i, l), { streamCall: t });
  }, [e, n, t]);
  return /* @__PURE__ */ a($r.Provider, { value: o, children: r });
}
function es(e) {
  return e.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function ts(e) {
  return /\.(publish|write|enqueue|command|set|send|record|create|delete|resolve|derive|simulate)$/.test(
    e
  );
}
function rs(e, t) {
  const r = t.startsWith(`${e}.`) ? t.slice(e.length + 1) : t;
  return `${e} · ${r}`;
}
function ns(e) {
  return e.map((t) => ({
    id: `series:${t}`,
    group: "series",
    label: t,
    source: { tool: "series.read", args: { series: t } },
    writes: !1
  }));
}
function os(e) {
  return e.map((t) => ({
    id: `live:${t}`,
    group: "live",
    label: `${t} (live)`,
    source: { tool: "series.watch", args: { series: t } },
    writes: !1
  }));
}
function ss(e) {
  var r, n, o;
  const t = [];
  for (const s of e) {
    if (!s.enabled) continue;
    const i = /* @__PURE__ */ new Set();
    (n = (r = s.ui) == null ? void 0 : r.scope) == null || n.forEach((l) => i.add(l)), (o = s.widgets) == null || o.forEach((l) => {
      var c;
      return (c = l.scope) == null ? void 0 : c.forEach((d) => i.add(d));
    });
    for (const l of i) {
      const c = ts(l);
      t.push({
        id: `ext:${s.ext}:${l}`,
        group: c ? "action" : "extension",
        label: rs(s.ext, l),
        source: c ? void 0 : { tool: l, args: {} },
        action: c ? { tool: l, argsTemplate: {} } : void 0,
        writes: c
      });
    }
  }
  return t;
}
function as(e) {
  const t = [];
  for (const r of e)
    if (r.enabled)
      for (const n of r.widgets ?? []) {
        const o = n.id ?? es(n);
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
function is(e, t) {
  const r = new Map(t.map((o) => [o.type, o])), n = [];
  for (const o of e)
    for (const s of o.nodes ?? []) {
      const i = r.get(s.type);
      if (i) {
        for (const l of i.inputs ?? [])
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
        for (const l of i.outputs ?? [])
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
function ls(e) {
  return e.map((t) => ({
    id: `rule:${t.id}`,
    group: "rules",
    label: t.name || t.id,
    source: { tool: "rules.run", args: { rule_id: t.id, route: !1 } },
    writes: !1,
    params: t.params ?? []
  }));
}
function cs(e) {
  return e.map((t) => ({
    id: `query:${t.id}`,
    group: "queries",
    label: t.name || t.id,
    source: { tool: "query.run", args: { id: t.id } },
    writes: !1
  }));
}
const ds = "sql:query";
function us() {
  return {
    id: ds,
    group: "sql",
    label: "SQL query (direct SurrealDB)",
    source: { tool: "store.query", args: { sql: "" } },
    writes: !1
  };
}
function ms(e) {
  return [
    ...ns(e.series ?? []),
    ...os(e.series ?? []),
    ...ss(e.extensions ?? []),
    ...as(e.extensions ?? []),
    ...is(e.flows ?? [], e.descriptors ?? []),
    ...ls(e.rules ?? []),
    ...cs(e.queries ?? []),
    us()
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
}, fs = Object.keys(Er);
function hs(e) {
  return e instanceof Error ? e.message : String(e);
}
async function ps(e, t) {
  const r = {}, n = (o, s) => {
    r[o] = s, t == null || t((i) => ({ ...i, [o]: s }));
  };
  return await Promise.all(
    fs.map(async (o) => {
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
      return { status: "denied", error: hs(n) };
    }
}
async function bs(e) {
  const t = await ps(e), r = ae(t.flowSummaries, []), n = ae(t.flowDescriptors, []), o = e.getFlow, s = o ? (await Promise.all(r.map((u) => o(u.id).catch(() => null)))).filter((u) => u != null) : [], i = ae(t.series, []), l = ae(t.extensions, []);
  ae(t.datasources, []);
  const c = ae(t.rules, []), d = ae(t.queries, []);
  return {
    entries: ms({
      series: i,
      extensions: l,
      flows: s,
      descriptors: n,
      rules: c,
      queries: d
    }),
    installed: l
  };
}
function ae(e, t) {
  return (e == null ? void 0 : e.status) === "ready" ? e.data : t;
}
function Si(e, t) {
  const [r, n] = _({
    entries: [],
    installed: [],
    loading: !0
  }), o = V(e);
  return o.current = e, G(() => {
    const s = o.current;
    let i = !1;
    return n((l) => ({ ...l, loading: !0 })), (async () => {
      const { entries: l, installed: c } = await bs(s);
      i || n({ entries: l, installed: c, loading: !1 });
    })(), () => {
      i = !0;
    };
  }, [t]), r;
}
const gs = [
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
function $i(e) {
  return e.map((t) => ({
    kind: "datasource",
    id: `datasource:${t.name}`,
    name: t.name,
    rowKind: t.kind,
    endpoint: t.endpoint
  }));
}
function Ti(e) {
  return e.tables.map((t) => ({
    kind: "table",
    id: `table:${t.name}`,
    table: t.name
  }));
}
function Ei(e) {
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
function Ri(e) {
  return e.map((t) => ({ kind: "series", id: `series:${t}`, name: t }));
}
function ws(e) {
  return e.map((t) => ({ kind: "channel", id: `channel:${t.id}`, name: t.id }));
}
function xs(e) {
  return e.map((t) => ({
    kind: "insight",
    id: `insight:${t.id}`,
    title: t.title,
    severity: t.severity,
    status: t.status
  }));
}
function ys(e) {
  return e.map((t) => ({ kind: "inbox", id: `inbox:${t.id}`, channel: t.channel }));
}
function _i(e) {
  return e.map((t) => ({
    kind: "query",
    id: `query:${t.id}`,
    name: t.name || t.id,
    target: t.target
  }));
}
function vs(e) {
  const t = [];
  return e.listDatasources && t.push("datasources"), e.readSchema && t.push("schema"), e.listSeries && t.push("series"), e.listChannels && t.push("channels"), e.listInsights && t.push("insights"), e.listInbox && t.push("inbox"), e.listQueries && t.push("queries"), e.listExtensions && t.push("extensions"), e.listRules && t.push("rules"), e.listFlows && t.push("flowSummaries"), e.listFlowNodes && t.push("flowDescriptors"), t;
}
function Wt(e) {
  const t = {};
  for (const r of vs(e))
    t[r] = { status: "idle" };
  return t;
}
function Mi(e, t) {
  const [r, n] = _(() => Wt(e)), o = V(e);
  o.current = e, G(() => {
    n(Wt(o.current));
  }, [t]);
  const s = B((i) => {
    n((l) => {
      const c = l[i];
      if (c && c.status !== "idle") return l;
      const d = { ...l, [i]: { status: "loading" } };
      return Rr(o.current, i).then((u) => {
        u && n((h) => ({ ...h, [i]: u }));
      }), d;
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
], Ii = [
  { group: "series", label: "Series" },
  { group: "live", label: "Live (Zenoh)" },
  { group: "sql", label: "Direct SurrealDB" },
  { group: "extension", label: "Installed extension" },
  { group: "action", label: "Action (control)" },
  { group: "widget", label: "Extension widgets" }
];
function Ai({
  entries: e,
  value: t = "",
  onSelect: r,
  loading: n = !1,
  groups: o = _r,
  "aria-label": s = "source",
  className: i
}) {
  const l = (c) => {
    const d = e.find((u) => u.id === c) ?? null;
    r(d ? Tr(d) : null);
  };
  return /* @__PURE__ */ a("label", { className: `sp-root${i ? ` ${i}` : ""}`, children: /* @__PURE__ */ b(
    "select",
    {
      className: "sp-select",
      "aria-label": s,
      value: t,
      onChange: (c) => l(c.target.value),
      children: [
        /* @__PURE__ */ a("option", { value: "", children: n ? "loading sources…" : "— pick a source —" }),
        o.map(({ group: c, label: d }) => /* @__PURE__ */ a(ks, { entries: e, group: c, label: d }, c))
      ]
    }
  ) });
}
function ks({
  entries: e,
  group: t,
  label: r
}) {
  const n = e.filter((o) => o.group === t);
  return n.length === 0 ? null : /* @__PURE__ */ a("optgroup", { label: r, children: n.map((o) => /* @__PURE__ */ a("option", { value: o.id, children: o.label }, o.id)) });
}
function zi({
  entries: e,
  value: t = "",
  onSelect: r,
  onSelectEntry: n,
  loading: o = !1,
  groups: s = _r,
  "aria-label": i = "source",
  className: l,
  placeholder: c = "Search sources…",
  autoFocus: d = !1
}) {
  const [u, h] = _(""), [x, N] = _(!1), [p, m] = _(0), v = V(null), k = e.find(($) => $.id === t) ?? null, g = fe(() => {
    const $ = u.trim().toLowerCase(), M = [];
    for (const { group: D, label: f } of s)
      e.filter(
        (H) => H.group === D && ($ === "" || H.label.toLowerCase().includes($) || f.toLowerCase().includes($))
      ).forEach((H, Z) => M.push({ entry: H, groupLabel: f, firstOfGroup: Z === 0 }));
    return M;
  }, [e, s, u]), E = ($) => {
    r($ ? Tr($) : null), n == null || n($), N(!1), h("");
  }, C = ($) => {
    $.key === "ArrowDown" ? ($.preventDefault(), N(!0), m((M) => Math.min(M + 1, g.length - 1))) : $.key === "ArrowUp" ? ($.preventDefault(), m((M) => Math.max(M - 1, 0))) : $.key === "Enter" ? ($.preventDefault(), x && g[p] && E(g[p].entry)) : $.key === "Escape" && N(!1);
  };
  return /* @__PURE__ */ b("div", { className: `sp-root sp-combo${l ? ` ${l}` : ""}`, children: [
    /* @__PURE__ */ a(
      "input",
      {
        className: "sp-combo-input",
        role: "combobox",
        "aria-expanded": x,
        "aria-label": i,
        "aria-autocomplete": "list",
        autoFocus: d,
        value: x ? u : (k == null ? void 0 : k.label) ?? "",
        placeholder: o ? "loading sources…" : k ? k.label : c,
        onFocus: () => N(!0),
        onBlur: () => setTimeout(() => N(!1), 120),
        onChange: ($) => {
          h($.target.value), N(!0), m(0);
        },
        onKeyDown: C
      }
    ),
    x && /* @__PURE__ */ b("ul", { className: "sp-combo-list", role: "listbox", "aria-label": i, ref: v, children: [
      g.length === 0 && /* @__PURE__ */ a("li", { className: "sp-combo-empty", children: "No matching sources" }),
      g.map(($, M) => /* @__PURE__ */ b("li", { role: "presentation", children: [
        $.firstOfGroup && /* @__PURE__ */ a("div", { className: "sp-combo-group", children: $.groupLabel }),
        /* @__PURE__ */ a(
          "button",
          {
            type: "button",
            role: "option",
            "aria-selected": M === p,
            className: `sp-combo-option${M === p ? " is-active" : ""}${$.entry.id === t ? " is-selected" : ""}`,
            onMouseDown: (D) => {
              D.preventDefault(), E($.entry);
            },
            onMouseEnter: () => m(M),
            children: $.entry.label
          }
        )
      ] }, $.entry.id))
    ] })
  ] });
}
function Ns({ spec: e, state: t, onOpen: r, defaultOpen: n, children: o }) {
  const [s, i] = _(n ?? t.status !== "idle"), l = t.status === "idle", c = (d) => {
    i(d), d && l && r && r();
  };
  return /* @__PURE__ */ b(
    he.Root,
    {
      className: "sp-catalog-section",
      "aria-label": `section ${e.label}`,
      open: s,
      onOpenChange: c,
      children: [
        /* @__PURE__ */ b(
          he.Trigger,
          {
            className: "sp-catalog-section-head",
            "aria-label": `toggle section ${e.label}`,
            children: [
              /* @__PURE__ */ a(Vt, { className: "sp-catalog-section-chevron" }),
              /* @__PURE__ */ a("h3", { className: "sp-catalog-section-title", children: e.label }),
              /* @__PURE__ */ a("p", { className: "sp-catalog-section-hint", children: e.hint })
            ]
          }
        ),
        /* @__PURE__ */ a(he.Content, { className: "sp-catalog-section-content", children: Cs(t, o) })
      ]
    }
  );
}
function Cs(e, t) {
  return e.status === "idle" ? /* @__PURE__ */ a("p", { className: "sp-catalog-idle", children: "Expand to load." }) : e.status === "loading" ? /* @__PURE__ */ a("div", { "aria-label": "loading", className: "sp-catalog-skeleton" }) : e.status === "denied" ? /* @__PURE__ */ a("p", { "aria-label": "denied", className: "sp-catalog-denied", children: "Not permitted." }) : t(e.data);
}
function me({ children: e }) {
  return /* @__PURE__ */ a("p", { className: "sp-catalog-empty", children: e });
}
function Ss({ schema: e, onSelect: t }) {
  return /* @__PURE__ */ a("ul", { "aria-label": "schema browser", className: "sp-catalog-tree", children: e.tables.map((r) => /* @__PURE__ */ a($s, { name: r.name, columns: r.columns.map((n) => n.name), onSelect: t }, r.name)) });
}
function $s({
  name: e,
  columns: t,
  onSelect: r
}) {
  return /* @__PURE__ */ a("li", { children: /* @__PURE__ */ b(he.Root, { className: "group/collapsible sp-catalog-tree-row", defaultOpen: !1, children: [
    /* @__PURE__ */ b("div", { className: "sp-catalog-tree-row-inner", children: [
      /* @__PURE__ */ a(
        he.Trigger,
        {
          "aria-label": `toggle table ${e}`,
          className: "sp-catalog-toggle",
          children: /* @__PURE__ */ a(Vt, { className: "sp-catalog-chevron" })
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
            /* @__PURE__ */ a(jr, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
            /* @__PURE__ */ a("span", { className: "sp-catalog-tree-table-name", children: e })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ a(he.Content, { className: "sp-catalog-tree-content", children: /* @__PURE__ */ a("ul", { className: "sp-catalog-tree-columns", children: t.length === 0 ? /* @__PURE__ */ a("li", { className: "sp-catalog-tree-no-columns", children: "no columns" }) : t.map((n) => /* @__PURE__ */ a("li", { children: /* @__PURE__ */ a(
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
function Di({
  sections: e,
  onSelect: t,
  onLoadSection: r,
  sectionSpecs: n = gs,
  className: o
}) {
  return /* @__PURE__ */ a("div", { "aria-label": "data explorer", className: `sp-root sp-catalog${o ? ` ${o}` : ""}`, children: n.map((s) => {
    const i = e[s.kind];
    return i ? /* @__PURE__ */ a(
      Ns,
      {
        spec: s,
        state: i,
        onOpen: r ? () => r(s.kind) : void 0,
        children: (l) => Ts(s.kind, l, t)
      },
      s.kind
    ) : null;
  }) });
}
function Ts(e, t, r) {
  switch (e) {
    case "datasources": {
      const n = t ?? [];
      return n.length === 0 ? /* @__PURE__ */ a(me, { children: "No external datasources registered." }) : /* @__PURE__ */ a("ul", { className: "sp-catalog-list", children: n.map((o) => /* @__PURE__ */ a("li", { children: /* @__PURE__ */ b(
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
              /* @__PURE__ */ a(Kr, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
              o.name
            ] }),
            /* @__PURE__ */ a("span", { className: "sp-catalog-row-sub", children: o.endpoint ? `${o.kind} · ${o.endpoint}` : o.kind })
          ]
        }
      ) }, o.name)) });
    }
    case "schema": {
      const n = t;
      return n.tables.length === 0 ? /* @__PURE__ */ a(me, { children: "No local tables yet." }) : /* @__PURE__ */ a(Ss, { schema: n, onSelect: r });
    }
    case "series": {
      const n = t ?? [];
      return n.length === 0 ? /* @__PURE__ */ a(me, { children: "No series in this workspace." }) : /* @__PURE__ */ a("ul", { className: "sp-catalog-list", children: n.map((o) => /* @__PURE__ */ a("li", { children: /* @__PURE__ */ b(
        "button",
        {
          type: "button",
          "aria-label": `insert series ${o}`,
          className: "sp-catalog-row sp-catalog-row-series",
          onClick: () => r({ kind: "series", id: `series:${o}`, name: o }),
          children: [
            /* @__PURE__ */ a(Wr, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
            o
          ]
        }
      ) }, o)) });
    }
    case "channels": {
      const n = t ?? [];
      return n.length === 0 ? /* @__PURE__ */ a(me, { children: "No channels registered." }) : /* @__PURE__ */ a("ul", { className: "sp-catalog-list", children: n.map((o) => {
        const s = ws([o])[0];
        return /* @__PURE__ */ a("li", { children: /* @__PURE__ */ b(
          "button",
          {
            type: "button",
            "aria-label": `insert channel ${o.id}`,
            className: "sp-catalog-row sp-catalog-row-channel",
            onClick: () => r(s),
            children: [
              /* @__PURE__ */ a(Br, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
              o.id
            ]
          }
        ) }, s.id);
      }) });
    }
    case "insights": {
      const n = t ?? [];
      return n.length === 0 ? /* @__PURE__ */ a(me, { children: "No insights in this workspace." }) : /* @__PURE__ */ a("ul", { className: "sp-catalog-list", children: n.map((o) => {
        const s = xs([o])[0];
        return /* @__PURE__ */ a("li", { children: /* @__PURE__ */ b(
          "button",
          {
            type: "button",
            "aria-label": `insert insight ${o.title}`,
            className: "sp-catalog-row sp-catalog-row-insight",
            onClick: () => r(s),
            children: [
              /* @__PURE__ */ b("span", { className: "sp-catalog-row-label", children: [
                /* @__PURE__ */ a(Xe, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
                o.title
              ] }),
              (o.severity || o.status) && /* @__PURE__ */ a("span", { className: "sp-catalog-row-sub", children: [o.severity, o.status].filter(Boolean).join(" · ") })
            ]
          }
        ) }, s.id);
      }) });
    }
    case "inbox": {
      const n = t ?? [];
      return n.length === 0 ? /* @__PURE__ */ a(me, { children: "No items in this inbox." }) : /* @__PURE__ */ a("ul", { className: "sp-catalog-list", children: n.map((o) => {
        const s = ys([o])[0];
        return /* @__PURE__ */ a("li", { children: /* @__PURE__ */ b(
          "button",
          {
            type: "button",
            "aria-label": `insert inbox item ${o.id}`,
            className: "sp-catalog-row sp-catalog-row-inbox",
            onClick: () => r(s),
            children: [
              /* @__PURE__ */ b("span", { className: "sp-catalog-row-label", children: [
                /* @__PURE__ */ a(Ut, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
                o.id
              ] }),
              /* @__PURE__ */ a("span", { className: "sp-catalog-row-sub", children: o.channel })
            ]
          }
        ) }, s.id);
      }) });
    }
    default:
      return null;
  }
}
const Es = ["info", "warning", "critical"];
function Pi(e) {
  return Es.indexOf(e);
}
function Rs(e) {
  return e === "critical" ? "destructive" : e === "warning" ? "warning" : "accent-2";
}
function Oi(e) {
  switch (e) {
    case "critical":
      return "hsl(var(--destructive))";
    case "warning":
      return "hsl(var(--warning))";
    default:
      return "hsl(var(--accent-2))";
  }
}
function _s(e) {
  return e === "open" ? "default" : e === "acked" ? "warning" : "success";
}
function Ms(e, t = Date.now()) {
  const r = Math.max(1, Math.floor((t - e) / 1e3));
  if (r < 60) return `${r}s ago`;
  const n = Math.floor(r / 60);
  if (n < 60) return r % 60 ? `${n}m ${r % 60}s ago` : `${n}m ago`;
  const o = Math.floor(n / 60);
  return o < 24 ? n % 60 ? `${o}h ${n % 60}m ago` : `${o}h ago` : `${Math.floor(o / 24)}d ago`;
}
function Is(e) {
  const t = `${e.kind}:${e.ref}`;
  return e.run ? `${t} · run:${e.run}` : t;
}
function As(e, t) {
  const [r, n] = _([]), [o, s] = _(null), [i, l] = _(!1), [c, d] = _(null), [u, h] = _(null), [x, N] = _(t), p = V(e);
  p.current = e;
  const m = B(async () => {
    l(!0);
    try {
      const C = await p.current.list({ ...x, cursor: void 0 });
      n(C.items), h(C.next ?? null), s(null);
    } catch (C) {
      s(C instanceof Error ? C.message : String(C));
    } finally {
      l(!1);
    }
  }, [x]), v = B(async () => {
    if (u) {
      l(!0);
      try {
        const C = await p.current.list({ ...x, cursor: u });
        n(($) => {
          const M = new Set($.map((D) => D.id));
          return [...$, ...C.items.filter((D) => !M.has(D.id))];
        }), h(C.next ?? null), s(null);
      } catch (C) {
        s(C instanceof Error ? C.message : String(C));
      } finally {
        l(!1);
      }
    }
  }, [x, u]);
  G(() => {
    m();
  }, [m]);
  const k = V(m);
  k.current = m, G(() => {
    const C = p.current.subscribe;
    return C ? C(() => {
      k.current();
    }) : void 0;
  }, []);
  const g = B((C) => {
    N(C);
  }, []), E = B(
    async (C, $) => {
      d(C);
      try {
        $ === "ack" ? await p.current.ack(C) : await p.current.resolve(C), await m();
      } catch (M) {
        s(M instanceof Error ? M.message : String(M));
      } finally {
        d(null);
      }
    },
    [m]
  );
  return {
    items: r,
    error: o,
    loading: i,
    actingOn: c,
    nextCursor: u,
    refresh: m,
    loadMore: v,
    setFilter: g,
    act: E
  };
}
function Li(e, t, r = 50) {
  const [n, o] = _(null), [s, i] = _(null), [l, c] = _(null), [d, u] = _(!0), [h, x] = _(null), [N, p] = _(0), m = V(e);
  m.current = e, G(() => {
    let g = !1;
    return (async () => {
      c(null), u(!0);
      try {
        const [E, C] = await Promise.all([
          m.current.get(t),
          m.current.occurrences(t, void 0, r)
        ]);
        if (g) return;
        o(E), i(C);
      } catch (E) {
        if (g) return;
        c(E instanceof Error ? E.message : String(E));
      } finally {
        g || u(!1);
      }
    })(), () => {
      g = !0;
    };
  }, [t, r, N]);
  const v = B(() => p((g) => g + 1), []), k = B(
    async (g) => {
      x(g), c(null);
      try {
        g === "ack" ? await m.current.ack(t) : await m.current.resolve(t), p((E) => E + 1);
      } catch (E) {
        c(E instanceof Error ? E.message : String(E));
      } finally {
        x(null);
      }
    },
    [t]
  );
  return { insight: n, occurrences: s, error: l, loading: d, actingOn: h, refresh: v, act: k };
}
function zs({ severity: e }) {
  return /* @__PURE__ */ a("span", { className: `ins-badge tone-${Rs(e)}`, children: e });
}
function Ds({ status: e }) {
  return /* @__PURE__ */ a("span", { className: `ins-badge tone-${_s(e)}`, children: e });
}
function Ps({
  insight: e,
  selected: t,
  onSelect: r,
  showStatus: n = !0,
  showSeverity: o = !1,
  actions: s,
  now: i
}) {
  const l = e.severity === "critical" ? "is-critical" : e.severity === "warning" ? "is-warning" : "is-info", c = /* @__PURE__ */ b(Or, { children: [
    /* @__PURE__ */ a("span", { className: `ins-dot ${l}`, role: "img", "aria-label": `severity: ${e.severity}` }),
    /* @__PURE__ */ b("span", { className: "ins-row-main", children: [
      /* @__PURE__ */ a("span", { className: "ins-row-title", children: e.title }),
      /* @__PURE__ */ b("span", { className: "ins-row-meta", children: [
        Is(e.origin),
        " · ×",
        e.count
      ] })
    ] }),
    /* @__PURE__ */ b("span", { className: "ins-row-side", children: [
      o && /* @__PURE__ */ a(zs, { severity: e.severity }),
      n && /* @__PURE__ */ a(Ds, { status: e.status }),
      /* @__PURE__ */ a("span", { className: "ins-time", children: Ms(e.last_ts, i) })
    ] })
  ] });
  return /* @__PURE__ */ b("li", { children: [
    r ? /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        className: `ins-row${t ? " is-selected" : ""}`,
        "aria-selected": t,
        "aria-label": `select insight ${e.dedup_key}`,
        onClick: () => r(e.id),
        children: c
      }
    ) : /* @__PURE__ */ a("div", { className: `ins-row${t ? " is-selected" : ""}`, children: c }),
    s
  ] });
}
function Os({
  insight: e,
  actingOn: t = null,
  onAck: r,
  onResolve: n,
  onDismiss: o
}) {
  const s = t !== null;
  return /* @__PURE__ */ b("div", { className: "ins-actions", children: [
    o && /* @__PURE__ */ b("button", { type: "button", className: "ins-btn", onClick: o, disabled: s, children: [
      /* @__PURE__ */ a(Ht, { size: 13 }),
      "Dismiss"
    ] }),
    e.status === "open" && r && /* @__PURE__ */ b("button", { type: "button", className: "ins-btn", onClick: r, disabled: s, children: [
      t === "ack" ? /* @__PURE__ */ a(Ae, { size: 13, className: "ins-spin" }) : /* @__PURE__ */ a(qt, { size: 13 }),
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
          t === "resolve" ? /* @__PURE__ */ a(Ae, { size: 13, className: "ins-spin" }) : /* @__PURE__ */ a(vt, { size: 13 }),
          "Resolve"
        ]
      }
    ),
    e.status === "resolved" && /* @__PURE__ */ b("span", { className: "ins-badge tone-success", children: [
      /* @__PURE__ */ a(vt, { size: 12 }),
      " Resolved"
    ] })
  ] });
}
const Ls = { limit: 20 };
function Mr({
  client: e,
  filter: t = Ls,
  title: r = "Insights",
  interactive: n = !1,
  showRefresh: o = !0,
  paged: s = !0,
  onSelect: i,
  now: l
}) {
  const c = As(e, t), [d, u] = _(/* @__PURE__ */ new Set()), [h, x] = _(null);
  function N(m, v) {
    x(v), c.act(m, v).finally(() => x(null));
  }
  const p = c.items.filter((m) => !d.has(m.id));
  return /* @__PURE__ */ b("div", { className: "ins-root", children: [
    /* @__PURE__ */ b("div", { className: "ins-header", children: [
      /* @__PURE__ */ b("h3", { className: "ins-header-title", children: [
        /* @__PURE__ */ a(Xe, { size: 15 }),
        r,
        p.length > 0 && /* @__PURE__ */ b("span", { className: "ins-header-count", children: [
          "(",
          p.length,
          ")"
        ] })
      ] }),
      o && /* @__PURE__ */ a("div", { className: "ins-header-actions", children: /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          className: "ins-btn",
          onClick: () => void c.refresh(),
          disabled: c.loading,
          "aria-label": "Refresh insights",
          children: /* @__PURE__ */ a(Ae, { size: 13, className: c.loading ? "ins-spin" : void 0 })
        }
      ) })
    ] }),
    c.error && p.length === 0 ? /* @__PURE__ */ a("div", { className: "ins-error", role: "alert", children: c.error }) : p.length === 0 ? /* @__PURE__ */ b("div", { className: "ins-empty", children: [
      /* @__PURE__ */ a(Xe, { size: 16, className: c.loading ? "ins-spin" : void 0 }),
      c.loading ? "Loading insights…" : "No insights match this filter."
    ] }) : /* @__PURE__ */ a("ul", { className: "ins-list", children: p.map((m) => /* @__PURE__ */ a(
      Ps,
      {
        insight: m,
        onSelect: i,
        now: l,
        actions: n ? /* @__PURE__ */ a(
          Os,
          {
            insight: m,
            actingOn: c.actingOn === m.id ? h : null,
            onAck: m.status === "open" ? () => N(m.id, "ack") : void 0,
            onResolve: () => N(m.id, "resolve"),
            onDismiss: () => u((v) => new Set(v).add(m.id))
          }
        ) : void 0
      },
      m.id
    )) }),
    s && c.nextCursor !== null && p.length > 0 && /* @__PURE__ */ a("div", { className: "ins-more", children: /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        className: "ins-btn",
        onClick: () => void c.loadMore(),
        disabled: c.loading,
        "aria-label": "Load more insights",
        children: [
          /* @__PURE__ */ a(Ae, { size: 13, className: c.loading ? "ins-spin" : void 0 }),
          "Load more"
        ]
      }
    ) })
  ] });
}
function Fi(e) {
  return /* @__PURE__ */ a(Mr, { ...e, interactive: !1 });
}
function Gi(e) {
  return /* @__PURE__ */ a(Mr, { ...e, interactive: !0 });
}
function ji(e) {
  const t = [...e];
  function r() {
    return [...t].sort((n, o) => o.last_ts - n.last_ts || o.id.localeCompare(n.id));
  }
  return {
    async list(n) {
      let o = r();
      n.status && (o = o.filter((d) => d.status === n.status)), n.severity && (o = o.filter((d) => d.severity === n.severity)), n.origin_ref && (o = o.filter((d) => d.origin.ref.includes(n.origin_ref)));
      const s = n.limit ?? 50, i = o.slice(0, s), l = o.length > s ? { ts: i[i.length - 1].last_ts, id: i[i.length - 1].id } : void 0;
      return { items: i.map(({ evidence: d, ...u }) => u), next: l };
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
function Bi() {
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
  return dt(Le(e));
}
function Fs({ ...e }) {
  return /* @__PURE__ */ a(j.Root, { ...e });
}
function Gs({ ...e }) {
  return /* @__PURE__ */ a(j.Portal, { ...e });
}
const js = z.forwardRef(function({ className: t, ...r }, n) {
  return /* @__PURE__ */ a(
    j.Overlay,
    {
      ref: n,
      className: U("fixed inset-0 z-50 bg-black/50", t),
      ...r
    }
  );
}), Bs = z.forwardRef(function({ className: t, children: r, ...n }, o) {
  return /* @__PURE__ */ b(Gs, { children: [
    /* @__PURE__ */ a(js, {}),
    /* @__PURE__ */ a(
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
}), Ws = z.forwardRef(function({ className: t, ...r }, n) {
  return /* @__PURE__ */ a(j.Title, { ref: n, className: U("text-base font-semibold text-lbp-fg", t), ...r });
}), Ks = z.forwardRef(function({ className: t, ...r }, n) {
  return /* @__PURE__ */ a(j.Description, { ref: n, className: U("text-xs text-lbp-muted", t), ...r });
});
function qs({ resizable: e, className: t, "aria-label": r = "resize panel" }) {
  return /* @__PURE__ */ a(
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
      children: /* @__PURE__ */ a(
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
function Vs({ initial: e, min: t, max: r, step: n = 24 }) {
  const o = B((p) => Math.min(r, Math.max(t, p)), [t, r]), [s, i] = _(() => o(e)), [l, c] = _(!1), d = V(null), u = B(
    (p) => {
      d.current = { x: p.clientX, w: s }, c(!0), p.currentTarget.setPointerCapture(p.pointerId), p.preventDefault();
    },
    [s]
  ), h = B(
    (p) => {
      if (!d.current) return;
      const m = d.current.x - p.clientX;
      i(o(d.current.w + m));
    },
    [o]
  ), x = B((p) => {
    d.current = null, c(!1), p.currentTarget.hasPointerCapture(p.pointerId) && p.currentTarget.releasePointerCapture(p.pointerId);
  }, []), N = B(
    (p) => {
      p.key === "ArrowLeft" ? (i((m) => o(m + n)), p.preventDefault()) : p.key === "ArrowRight" && (i((m) => o(m - n)), p.preventDefault());
    },
    [o, n]
  );
  return { width: s, dragging: l, handleProps: { onPointerDown: u, onPointerMove: h, onPointerUp: x, onKeyDown: N } };
}
function Wi({
  open: e,
  onOpenChange: t,
  title: r,
  description: n,
  headerAside: o,
  footer: s,
  "aria-label": i,
  initialWidth: l = 720,
  minWidth: c = 360,
  maxWidth: d = 1200,
  className: u,
  children: h
}) {
  const x = Vs({ initial: l, min: c, max: d });
  return /* @__PURE__ */ a(Fs, { open: e, onOpenChange: t, children: /* @__PURE__ */ b(
    Bs,
    {
      "aria-label": i,
      style: { width: x.width },
      className: U(x.dragging && "select-none", u),
      children: [
        /* @__PURE__ */ a(qs, { resizable: x }),
        /* @__PURE__ */ b("header", { className: "flex items-start justify-between gap-3 border-b border-lbp-border bg-lbp-secondary px-4 py-3", children: [
          /* @__PURE__ */ b("div", { className: "min-w-0", children: [
            /* @__PURE__ */ a(Ws, { children: r }),
            n ? /* @__PURE__ */ a(Ks, { className: "mt-0.5", children: n }) : null
          ] }),
          o ? /* @__PURE__ */ a("div", { className: "shrink-0", children: o }) : null
        ] }),
        /* @__PURE__ */ a("div", { className: "min-h-0 flex-1 overflow-auto", children: h }),
        s ? /* @__PURE__ */ a("footer", { className: "flex items-center justify-end gap-2 border-t border-lbp-border bg-lbp-secondary px-4 py-3", children: s }) : null
      ]
    }
  ) });
}
function Ki({ title: e, aside: t, className: r, children: n }) {
  return /* @__PURE__ */ b("section", { className: U("mb-4 last:mb-0", r), children: [
    /* @__PURE__ */ b("div", { className: "mb-1.5 flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ a("div", { className: "text-[10px] font-semibold uppercase tracking-wide text-lbp-muted", children: e }),
      t
    ] }),
    n
  ] });
}
function qi({ columns: e, rows: t, empty: r = "—", className: n }) {
  return t.length === 0 ? /* @__PURE__ */ a("div", { className: "py-1 font-mono text-[11px] text-lbp-muted", children: r }) : /* @__PURE__ */ b("table", { className: U("w-full border-collapse font-mono text-[11px] tabular-nums", n), children: [
    /* @__PURE__ */ a("thead", { children: /* @__PURE__ */ a("tr", { className: "text-left text-lbp-muted", children: e.map((o) => /* @__PURE__ */ a("th", { className: "px-0 pb-1 pr-2 font-medium", children: o.header ?? o.key }, o.key)) }) }),
    /* @__PURE__ */ a("tbody", { children: t.map((o) => /* @__PURE__ */ a("tr", { className: "border-t border-lbp-border align-top", children: e.map((s) => {
      const i = o.cells[s.key], l = s.ellipsize && typeof i == "string" ? i : void 0;
      return /* @__PURE__ */ a(
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
          children: i ?? "—"
        },
        s.key
      );
    }) }, o.id)) })
  ] });
}
function Vi({ k: e, v: t, keyWidth: r = 80, className: n }) {
  return /* @__PURE__ */ b("div", { className: U("flex gap-2 py-[2px] font-mono text-[11px]", n), children: [
    /* @__PURE__ */ a("span", { style: { width: r }, className: "shrink-0 text-lbp-muted", children: e }),
    /* @__PURE__ */ a("span", { className: "min-w-0 break-words text-lbp-fg", children: t })
  ] });
}
function Ir(e) {
  const t = [], r = /* @__PURE__ */ new Map();
  for (const n of e)
    r.has(n.group) || (r.set(n.group, []), t.push(n.group)), r.get(n.group).push(n);
  return t.map((n) => ({ label: n, items: r.get(n) }));
}
const Qe = 768;
function Us() {
  const [e, t] = z.useState(void 0);
  return z.useEffect(() => {
    if (!window.matchMedia) {
      t(window.innerWidth < Qe);
      return;
    }
    const r = window.matchMedia(`(max-width: ${Qe - 1}px)`), n = () => t(window.innerWidth < Qe);
    return r.addEventListener("change", n), n(), () => r.removeEventListener("change", n);
  }, []), !!e;
}
function A(...e) {
  return dt(Le(e));
}
const Hs = it(
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
), Ys = z.forwardRef(function({ className: t, variant: r, size: n, asChild: o = !1, ...s }, i) {
  return /* @__PURE__ */ a(o ? nt : "button", { ref: i, className: A(Hs({ variant: r, size: n, className: t })), ...s });
});
function Qs({ ...e }) {
  return /* @__PURE__ */ a(j.Root, { ...e });
}
function Zs({ ...e }) {
  return /* @__PURE__ */ a(j.Portal, { ...e });
}
const Xs = z.forwardRef(function({ className: t, ...r }, n) {
  return /* @__PURE__ */ a(
    j.Overlay,
    {
      ref: n,
      className: A("fixed inset-0 z-50 bg-black/50 animate-in fade-in-0", t),
      ...r
    }
  );
}), Js = z.forwardRef(function({ className: t, children: r, side: n = "right", ...o }, s) {
  return /* @__PURE__ */ b(Zs, { children: [
    /* @__PURE__ */ a(Xs, {}),
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
            /* @__PURE__ */ a(Ht, { className: "h-4 w-4" }),
            /* @__PURE__ */ a("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
});
function ea({ className: e, ...t }) {
  return /* @__PURE__ */ a("div", { className: A("flex flex-col gap-1.5 p-4", e), ...t });
}
const ta = z.forwardRef(function({ className: t, ...r }, n) {
  return /* @__PURE__ */ a(j.Title, { ref: n, className: A("font-semibold text-nr-fg", t), ...r });
}), ra = z.forwardRef(function({ className: t, ...r }, n) {
  return /* @__PURE__ */ a(j.Description, { ref: n, className: A("text-sm text-nr-muted", t), ...r });
});
function na({
  delayDuration: e = 0,
  ...t
}) {
  return /* @__PURE__ */ a(ve.Provider, { delayDuration: e, ...t });
}
function oa({ ...e }) {
  return /* @__PURE__ */ a(ve.Root, { ...e });
}
function sa({ ...e }) {
  return /* @__PURE__ */ a(ve.Trigger, { ...e });
}
function aa({
  className: e,
  sideOffset: t = 6,
  ...r
}) {
  return /* @__PURE__ */ a(ve.Portal, { children: /* @__PURE__ */ a(
    ve.Content,
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
const ia = "nav_rail_state", la = 60 * 60 * 24 * 7, ca = "16rem", da = "18rem", ua = "3.5rem", ma = "b", Ar = z.createContext(null);
function J() {
  const e = z.useContext(Ar);
  if (!e)
    throw new Error("useSidebar must be used within a SidebarProvider.");
  return e;
}
function fa({
  defaultOpen: e = !0,
  open: t,
  onOpenChange: r,
  className: n,
  style: o,
  children: s,
  ...i
}) {
  const l = Us(), [c, d] = z.useState(!1), [u, h] = z.useState(e), x = t ?? u, N = z.useCallback(
    (k) => {
      const g = typeof k == "function" ? k(x) : k;
      r ? r(g) : h(g), document.cookie = `${ia}=${g}; path=/; max-age=${la}`;
    },
    [x, r]
  ), p = z.useCallback(() => l ? d((k) => !k) : N((k) => !k), [l, N]);
  z.useEffect(() => {
    const k = (g) => {
      g.key === ma && (g.metaKey || g.ctrlKey) && (g.preventDefault(), p());
    };
    return window.addEventListener("keydown", k), () => window.removeEventListener("keydown", k);
  }, [p]);
  const m = x ? "expanded" : "collapsed", v = z.useMemo(
    () => ({
      state: m,
      open: x,
      setOpen: N,
      isMobile: l,
      openMobile: c,
      setOpenMobile: d,
      toggleSidebar: p
    }),
    [m, x, N, l, c, p]
  );
  return /* @__PURE__ */ a(Ar.Provider, { value: v, children: /* @__PURE__ */ a(na, { delayDuration: 0, children: /* @__PURE__ */ a(
    "div",
    {
      "data-slot": "sidebar-wrapper",
      style: {
        "--sidebar-width": ca,
        "--sidebar-width-icon": ua,
        ...o
      },
      className: A("group/sidebar-wrapper flex h-full min-h-0 w-full", n),
      ...i,
      children: s
    }
  ) }) });
}
function ha({
  side: e = "left",
  variant: t = "sidebar",
  collapsible: r = "offcanvas",
  className: n,
  children: o,
  ...s
}) {
  const { isMobile: i, state: l, openMobile: c, setOpenMobile: d } = J(), u = l === "collapsed" && r !== "none", h = t === "floating" || t === "inset";
  if (r === "none")
    return /* @__PURE__ */ a("div", { className: A("flex h-full w-[var(--sidebar-width)] flex-col bg-nr-panel text-nr-fg", n), ...s, children: o });
  if (i)
    return /* @__PURE__ */ a(Qs, { open: c, onOpenChange: d, ...s, children: /* @__PURE__ */ b(
      Js,
      {
        "data-sidebar": "sidebar",
        "data-mobile": "true",
        className: "w-[var(--sidebar-width)] bg-nr-panel p-0 text-nr-fg [&>button]:hidden",
        style: { "--sidebar-width": da },
        side: e,
        children: [
          /* @__PURE__ */ b(ea, { className: "sr-only", children: [
            /* @__PURE__ */ a(ta, { children: "Sidebar" }),
            /* @__PURE__ */ a(ra, { children: "Displays the mobile sidebar." })
          ] }),
          /* @__PURE__ */ a("div", { className: "flex h-full w-full flex-col", children: o })
        ]
      }
    ) });
  const x = "w-[var(--sidebar-width)]", N = h ? "w-[calc(var(--sidebar-width-icon)+1rem)]" : "w-[var(--sidebar-width-icon)]";
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
        /* @__PURE__ */ a(
          "div",
          {
            "data-slot": "sidebar-gap",
            className: A(
              "relative h-full bg-transparent transition-[width] duration-200 ease-linear",
              u && r === "offcanvas" ? "w-0" : u ? N : x
            )
          }
        ),
        /* @__PURE__ */ a(
          "div",
          {
            "data-slot": "sidebar-container",
            className: A(
              "fixed inset-y-0 z-10 hidden h-full transition-[left,right,width] duration-200 ease-linear md:flex",
              e === "left" ? "left-0" : "right-0",
              u && r === "offcanvas" && e === "left" && "-left-[var(--sidebar-width)]",
              u && r === "offcanvas" && e === "right" && "-right-[var(--sidebar-width)]",
              u && r === "icon" ? N : x,
              h && "p-2",
              !h && "border-r border-nr-border",
              n
            ),
            ...s,
            children: /* @__PURE__ */ a(
              "div",
              {
                "data-sidebar": "sidebar",
                "data-slot": "sidebar-inner",
                className: A(
                  "flex h-full w-full flex-col bg-nr-panel text-nr-fg",
                  h && "rounded-lg border border-nr-border shadow-sm"
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
function pa({
  className: e,
  onClick: t,
  ...r
}) {
  const { toggleSidebar: n } = J();
  return /* @__PURE__ */ b(
    Ys,
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
        /* @__PURE__ */ a(qr, { className: "h-4 w-4" }),
        /* @__PURE__ */ a("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
}
function ba({ className: e, ...t }) {
  const { toggleSidebar: r } = J();
  return /* @__PURE__ */ a(
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
function ga({ className: e, ...t }) {
  const { state: r } = J();
  return /* @__PURE__ */ a(
    "div",
    {
      "data-sidebar": "header",
      className: A("flex flex-col gap-2 p-2", r === "collapsed" && "items-center px-0", e),
      ...t
    }
  );
}
function wa({ className: e, ...t }) {
  const { state: r } = J();
  return /* @__PURE__ */ a(
    "div",
    {
      "data-sidebar": "footer",
      className: A("flex flex-col gap-2 p-2", r === "collapsed" && "items-center px-0", e),
      ...t
    }
  );
}
function xa({ className: e, ...t }) {
  return /* @__PURE__ */ a(
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
function ya({ className: e, ...t }) {
  const { state: r } = J();
  return /* @__PURE__ */ a(
    "div",
    {
      "data-sidebar": "group",
      className: A("relative flex w-full min-w-0 flex-col p-2", r === "collapsed" && "items-center px-0", e),
      ...t
    }
  );
}
function va({ className: e, ...t }) {
  const { state: r } = J();
  return /* @__PURE__ */ a(
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
function ka({ className: e, ...t }) {
  return /* @__PURE__ */ a("div", { "data-sidebar": "group-content", className: A("w-full text-sm", e), ...t });
}
function Na({ className: e, ...t }) {
  const { state: r } = J();
  return /* @__PURE__ */ a(
    "ul",
    {
      "data-sidebar": "menu",
      className: A("flex w-full min-w-0 flex-col gap-1", r === "collapsed" && "items-center", e),
      ...t
    }
  );
}
function Ca({ className: e, ...t }) {
  return /* @__PURE__ */ a("li", { "data-sidebar": "menu-item", className: A("group/menu-item relative", e), ...t });
}
const Sa = it(
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
function $a({
  asChild: e = !1,
  isActive: t = !1,
  variant: r = "default",
  size: n = "default",
  tooltip: o,
  className: s,
  ...i
}) {
  const l = e ? nt : "button", { isMobile: c, state: d } = J(), u = /* @__PURE__ */ a(
    l,
    {
      "data-sidebar": "menu-button",
      "data-size": n,
      "data-active": t,
      className: A(
        Sa({ variant: r, size: n }),
        d === "collapsed" && "mx-auto h-8 w-8 p-2 [&>span]:sr-only",
        n === "lg" && d === "collapsed" && "mx-auto h-8 w-8 p-0",
        s
      ),
      ...i
    }
  );
  return !o || d !== "collapsed" || c ? u : /* @__PURE__ */ b(oa, { children: [
    /* @__PURE__ */ a(sa, { asChild: !0, children: u }),
    /* @__PURE__ */ a(aa, { side: "right", align: "center", ...typeof o == "string" ? { children: o } : o })
  ] });
}
function Ui({
  items: e,
  active: t,
  onSelect: r,
  header: n,
  footer: o,
  defaultCollapsed: s = !1,
  className: i
}) {
  const l = Ir(e);
  return /* @__PURE__ */ a(fa, { defaultOpen: !s, className: `nav-rail ${i ?? ""}`, children: /* @__PURE__ */ b(ha, { collapsible: "icon", variant: "sidebar", children: [
    /* @__PURE__ */ b(ga, { children: [
      n,
      /* @__PURE__ */ a("div", { className: "flex items-center justify-end px-1 group-data-[collapsible=icon]:justify-center", children: /* @__PURE__ */ a(pa, { "aria-label": "Toggle sidebar", title: "Toggle sidebar" }) })
    ] }),
    /* @__PURE__ */ a(xa, { children: l.map((c, d) => /* @__PURE__ */ b(ya, { children: [
      c.label && /* @__PURE__ */ a(va, { children: c.label }),
      /* @__PURE__ */ a(ka, { children: /* @__PURE__ */ a(Na, { children: c.items.map((u) => {
        const h = t === u.id, x = u.icon;
        return /* @__PURE__ */ a(Ca, { children: /* @__PURE__ */ b(
          $a,
          {
            "aria-label": u.label,
            "aria-current": h ? "page" : void 0,
            isActive: h,
            tooltip: u.label,
            onClick: () => r(u.id),
            children: [
              x && /* @__PURE__ */ a(x, {}),
              /* @__PURE__ */ a("span", { children: u.label })
            ]
          }
        ) }, u.id);
      }) }) })
    ] }, c.label ?? `__default-${d}`)) }),
    o && /* @__PURE__ */ a(wa, { children: o }),
    /* @__PURE__ */ a(ba, {})
  ] }) });
}
function Hi({
  items: e,
  active: t,
  onSelect: r,
  badge: n,
  className: o,
  "aria-label": s = "section navigation"
}) {
  const i = Ir(e);
  return /* @__PURE__ */ a(
    "nav",
    {
      "aria-label": s,
      className: A("nav-rail flex min-w-0 flex-col gap-2 text-nr-fg", o),
      children: i.map((l, c) => /* @__PURE__ */ b("div", { className: "flex flex-col gap-1", children: [
        l.label && /* @__PURE__ */ a("div", { className: "px-2 text-xs font-medium text-nr-muted", children: l.label }),
        l.items.map((d) => {
          const u = t === d.id, h = d.icon, x = n == null ? void 0 : n(d.id);
          return /* @__PURE__ */ b(
            "button",
            {
              type: "button",
              role: "tab",
              "aria-label": d.label,
              "aria-current": u ? "page" : void 0,
              "aria-selected": u,
              onClick: () => r(d.id),
              className: A(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none ring-nr-accent transition-colors focus-visible:ring-2",
                "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
                u ? "bg-nr-bg font-medium text-nr-fg" : "text-nr-muted hover:bg-nr-bg hover:text-nr-fg"
              ),
              children: [
                h && /* @__PURE__ */ a(h, {}),
                /* @__PURE__ */ a("span", { className: "min-w-0 flex-1 truncate", children: d.label }),
                x ? /* @__PURE__ */ a("span", { className: "rounded-full bg-nr-accent/15 px-1.5 text-[10px] text-nr-accent", children: x }) : null
              ]
            },
            d.id
          );
        })
      ] }, l.label ?? `__default-${c}`))
    }
  );
}
const Yi = [
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
function Qi(e) {
  zr = e;
}
function Ta() {
  return zr();
}
const Ea = [
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
  const n = ((typeof window > "u" ? "" : getComputedStyle(document.documentElement).getPropertyValue(e).trim()) || "215 16% 60%").replace(/,/g, " ").split(/\s+/).filter(Boolean), [o, s, i] = n;
  return !o || !s || !i ? t === void 0 ? "#808a99" : `rgba(128,138,153,${t})` : t === void 0 ? `hsl(${o}, ${s}, ${i})` : `hsla(${o}, ${s}, ${i}, ${t})`;
}
const Ra = [0.1, 0.28, 0.46, 0.64, 0.82, 1];
function Ie(e) {
  return Ra.map((t) => te(e, t));
}
function Kt() {
  const e = ["--chart-4", "--chart-2", "--chart-6", "--chart-7", "--chart-3", "--chart-5"].map(
    (t) => te(t)
  );
  return {
    palette: Ea.map((t) => te(t)),
    accent: te("--accent"),
    text: te("--foreground"),
    muted: te("--muted"),
    border: te("--border"),
    surface: te("--popover"),
    ramp: e,
    ramps: {
      spectral: e,
      accent: Ie("--accent"),
      blue: Ie("--chart-1"),
      green: Ie("--chart-6"),
      amber: Ie("--chart-7")
    }
  };
}
function Zi(e) {
  return {
    axisLine: { lineStyle: { color: e.border } },
    axisTick: { show: !1 },
    axisLabel: { color: e.muted, fontSize: 11 },
    splitLine: { lineStyle: { color: e.border, opacity: 0.38, type: "dashed" } },
    nameTextStyle: { color: e.muted, fontSize: 11 }
  };
}
function Xi(e) {
  return {
    backgroundColor: e.surface,
    borderColor: e.border,
    textStyle: { color: e.text, fontSize: 12 },
    extraCssText: "border-radius:8px;box-shadow:0 8px 24px hsl(0 0% 0% / 0.18);"
  };
}
function Ji(e) {
  return {
    textStyle: { color: e.muted, fontSize: 11 },
    inactiveColor: e.border,
    icon: "roundRect",
    itemWidth: 10,
    itemHeight: 10
  };
}
function _a() {
  const [e, t] = _(0);
  return G(() => {
    if (typeof MutationObserver > "u") return;
    const r = new MutationObserver(() => t((n) => n + 1));
    return r.observe(document.documentElement, { attributes: !0, attributeFilter: ["class", "style"] }), () => r.disconnect();
  }, []), e;
}
function el({ option: e, ariaLabel: t, summary: r, className: n, onReady: o, bare: s }) {
  const i = V(null), l = V(null), c = V(o);
  c.current = o;
  const d = _a();
  return G(() => {
    let u = !1, h;
    if (i.current)
      return (async () => {
        var p, m;
        const N = await Ta();
        if (!(u || !i.current))
          try {
            l.current = N.init(i.current), (p = l.current) == null || p.setOption(e(Kt()), !0), l.current && (h = (m = c.current) == null ? void 0 : m.call(c, l.current));
          } catch {
            l.current = null;
          }
      })(), () => {
        var N;
        u = !0, h == null || h(), (N = l.current) == null || N.dispose(), l.current = null;
      };
  }, []), G(() => {
    var u;
    (u = l.current) == null || u.setOption(e(Kt()), !0);
  }, [e, d]), G(() => {
    const u = i.current;
    if (!u || typeof ResizeObserver > "u") return;
    const h = new ResizeObserver(() => {
      var x;
      return (x = l.current) == null ? void 0 : x.resize();
    });
    return h.observe(u), () => h.disconnect();
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
        /* @__PURE__ */ a("div", { ref: i, className: "h-full w-full", "data-echart": t })
      ]
    }
  );
}
const Ma = {
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
    icon: Ut,
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
}, tl = Vr;
function ye({ tone: e, title: t, detail: r, action: n, className: o, ...s }) {
  const i = Ma[e], l = i.icon, c = r === null ? void 0 : r ?? i.detail;
  return /* @__PURE__ */ b(
    "div",
    {
      role: "status",
      "aria-live": "polite",
      "data-chart-state": e,
      ...s,
      className: `dash-kit flex h-full min-h-24 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center ${i.wrap} ${o ?? ""}`,
      children: [
        /* @__PURE__ */ a("span", { className: `rounded-xl border p-2.5 ${i.chip}`, children: /* @__PURE__ */ a(l, { className: `size-5 ${i.spin ? "animate-spin motion-reduce:animate-none" : ""}`, "aria-hidden": !0 }) }),
        /* @__PURE__ */ b("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ a("p", { className: "text-sm font-medium text-fg", children: t ?? i.title }),
          c ? /* @__PURE__ */ a("p", { className: "max-w-[44ch] text-xs leading-relaxed text-muted", children: c }) : null
        ] }),
        n
      ]
    }
  );
}
const Ia = "repeating-linear-gradient(-45deg, rgba(255,255,255,0.35) 0 1px, transparent 1px 5px)";
function rl({ segments: e, label: t, height: r = 6, className: n }) {
  const o = e.filter((i) => Number.isFinite(i.value) && i.value > 0), s = o.reduce((i, l) => i + l.value, 0);
  return /* @__PURE__ */ a(
    "div",
    {
      className: `dash-kit flex w-full overflow-hidden rounded-full bg-muted-bg/40 ${n ?? ""}`,
      style: { height: typeof r == "number" ? `${r}px` : r },
      role: t ? "img" : void 0,
      "aria-label": t,
      "aria-hidden": t ? void 0 : !0,
      "data-share-segments": o.length,
      children: s > 0 && o.map((i) => /* @__PURE__ */ a(
        "div",
        {
          title: i.title,
          "data-share-key": i.key,
          className: i.className,
          style: {
            width: `${i.value / s * 100}%`,
            ...i.color ? { backgroundColor: i.color } : {},
            ...i.hatch ? { backgroundImage: Ia } : {}
          }
        },
        i.key
      ))
    }
  );
}
function nl({
  rows: e,
  label: t,
  className: r
}) {
  return /* @__PURE__ */ a("ul", { className: `dash-kit flex flex-wrap gap-x-4 gap-y-1 ${r ?? ""}`, "aria-label": t, children: e.map((n) => /* @__PURE__ */ b("li", { className: "flex items-center gap-1.5 text-xs", title: n.title, "data-share-row": n.key, children: [
    /* @__PURE__ */ a(
      "span",
      {
        "aria-hidden": !0,
        className: `h-2 w-2 shrink-0 rounded-[2px] ${n.className ?? ""}`,
        style: {
          ...n.color ? { backgroundColor: n.color } : {},
          ...n.hatch ? {
            backgroundImage: "repeating-linear-gradient(-45deg, rgba(255,255,255,0.35) 0 1px, transparent 1px 3px)"
          } : {}
        }
      }
    ),
    /* @__PURE__ */ a("span", { className: "text-muted", children: n.label }),
    /* @__PURE__ */ a("span", { className: "tabular-nums text-fg", children: n.value }),
    n.secondary ? /* @__PURE__ */ b("span", { className: "tabular-nums text-muted", children: [
      "· ",
      n.secondary
    ] }) : null,
    n.action
  ] }, n.key)) });
}
const ft = Symbol.for("@nube/dash-kit.panelRenderer.v1");
function ol(e) {
  globalThis[ft] = e;
}
function Aa() {
  return globalThis[ft];
}
function sl() {
  delete globalThis[ft], delete globalThis[ht];
}
const ht = Symbol.for("@nube/dash-kit.specHydrator.v1");
function al(e) {
  globalThis[ht] = e;
}
function za(e) {
  const t = globalThis[ht];
  return t ? t(e) : e;
}
function Da(e) {
  return e.replace(/^panel:/, "");
}
function Ze(e, t, r) {
  return {
    i: e,
    x: (r == null ? void 0 : r.x) ?? 0,
    y: (r == null ? void 0 : r.y) ?? 0,
    w: (r == null ? void 0 : r.w) ?? 12,
    h: (r == null ? void 0 : r.h) ?? 8,
    ...t
  };
}
function il(e) {
  const t = Pe(), r = e.ws ?? (t == null ? void 0 : t.ws) ?? "";
  return /* @__PURE__ */ a(Pa, { ...e, ws: r }, r);
}
function Pa({
  ws: e,
  id: t,
  spec: r,
  cell: n,
  range: o,
  scope: s,
  refreshKey: i,
  className: l
}) {
  const c = Pe(), d = t ? Da(t) : void 0, u = n ?? (d && r ? Ze(d, r) : null), [h, x] = _(u), [N, p] = _(null);
  if (G(() => {
    if (n || r || !d) {
      x(n ?? (d && r ? Ze(d, r) : null)), p(null);
      return;
    }
    if (!(c != null && c.client)) {
      p("error");
      return;
    }
    let v = !0;
    return x(null), p(null), c.client.call("panel.get", { id: d }).then((k) => {
      if (!v) return;
      const g = k;
      x(Ze(d, za((g == null ? void 0 : g.spec) ?? {})));
    }).catch((k) => {
      v && p(cn(k));
    }), () => {
      v = !1;
    };
  }, [c, d, r, n, e]), N) return /* @__PURE__ */ a(Oa, { failure: N, id: d, className: l });
  if (!h) return /* @__PURE__ */ a(ye, { tone: "loading", className: l });
  const m = Aa();
  return m ? /* @__PURE__ */ a("div", { className: `dash-kit flex min-h-0 flex-1 flex-col ${l ?? ""}`, "data-testid": "panel-embed", children: m({ cell: h, ws: e, range: o, scope: s, refreshKey: i }) }) : /* @__PURE__ */ a(
    ye,
    {
      tone: "error",
      className: l,
      title: "No panel renderer registered",
      detail: "The host has not registered a widget renderer with the kit, so this panel cannot be drawn."
    }
  );
}
function Oa({
  failure: e,
  id: t,
  className: r
}) {
  return e === "denied" ? /* @__PURE__ */ a(
    ye,
    {
      tone: "denied",
      className: r,
      title: "No access to this panel",
      detail: `\`panel.get\` is not in this extension's granted scope${t ? ` (asked for \`${t}\`)` : ""}.`
    }
  ) : e === "unavailable" ? /* @__PURE__ */ a(
    ye,
    {
      tone: "denied",
      className: r,
      "data-embed-failure": "unavailable",
      title: "Panel not available",
      detail: `${t ? `\`${t}\` ` : "This panel "}may have been deleted, or it isn't shared with you.`
    }
  ) : /* @__PURE__ */ a(
    ye,
    {
      tone: "error",
      className: r,
      title: "This panel didn't load",
      detail: "The panel definition could not be fetched."
    }
  );
}
export {
  kn as BROWSER_TZ,
  Ii as BUILDER_SOURCE_GROUPS,
  Wo as BUILTIN_PREFIX,
  gs as CATALOG_SECTION_SPECS,
  tl as CHART_STATE_ICON,
  me as CatalogEmpty,
  Di as CatalogExplorer,
  Ss as CatalogSchemaTree,
  Ns as CatalogSection,
  ye as ChartState,
  Yi as DASH_KIT_ECHARTS_PARTS,
  Ua as DASH_KIT_READ_CAPS,
  Va as DASH_KIT_READ_SCOPE,
  ei as DEFAULT_RANGE_EXPR,
  Qo as DEFAULT_TTL_S,
  jo as DashboardCacheProvider,
  si as DashboardRangePicker,
  mt as DashboardWsContext,
  el as EChart,
  xi as FreezeProvider,
  vi as FreshnessProvider,
  Os as InsightActions,
  Ps as InsightRow,
  Gi as InsightsAckWidget,
  Fi as InsightsReadWidget,
  Mr as InsightsWidget,
  Vi as KV,
  Je as KitDeniedError,
  Ha as KitProvider,
  vr as LIST_STALE_MS,
  Gt as MAX_PANELS,
  Vo as NAV_PATH_SEP,
  Hi as NavMenu,
  Ui as NavRail,
  Wi as Panel,
  il as PanelEmbed,
  ks as PickerGroup,
  Ot as PrefDateInput,
  qi as PropTable,
  zo as QUICK_PERSIST_MAX_AGE_MS,
  kr as QUICK_PERSIST_VERSION,
  yr as RANGE_BANDS,
  xr as RANGE_COLUMNS,
  oi as RANGE_PRESETS,
  _r as READ_SOURCE_GROUPS,
  qs as ResizeHandle,
  Es as SEVERITY_ORDER,
  ds as SQL_SOURCE_ID,
  Ki as Section,
  zs as SeverityBadge,
  rl as ShareBar,
  nl as ShareLegend,
  zi as SourceCombobox,
  Ai as SourcePicker,
  Ds as StatusBadge,
  Ci as VizBatchProvider,
  gi as WithDashboardCache,
  ie as addUnits,
  Zi as axisChrome,
  Da as bareId,
  dn as browserZone,
  ms as buildSourceEntries,
  ke as canon,
  ws as channelEntries,
  cn as classifyReadFailure,
  sl as clearPanelRenderer,
  $i as datasourceEntries,
  Ho as datasourceListKey,
  Yo as datasourceListQueryOptions,
  Eo as datePlaceholder,
  Bi as denyClient,
  Kt as echartsTheme,
  as as extWidgetEntries,
  ss as extensionEntries,
  Bo as extractVarNames,
  qo as extractVarNamesDeep,
  pi as fetchDatasourceList,
  mi as flowNodeStateKey,
  is as flowsEntries,
  Pt as formatDateField,
  Aa as getPanelRenderer,
  za as hydrateSpec,
  ys as inboxEntries,
  xs as insightEntries,
  Ko as isBuiltinName,
  tn as isKitDenied,
  rn as isOutOfScope,
  Ja as isWindowExpr,
  et as isoDayOf,
  at as labelOf,
  Ji as legendChrome,
  os as liveEntries,
  ps as loadCatalog,
  Ta as loadEcharts,
  bs as loadSourcePicker,
  Ro as makeDashboardQueryClient,
  sn as makeInsightsClient,
  qa as makeKitClient,
  on as makeSourceLoaders,
  jt as makeVizBatchLoader,
  ji as memoryClient,
  li as navBuiltins,
  st as normalizeTz,
  Is as originLine,
  ni as parseDateField,
  ze as parseRangeExpr,
  Go as persistQuickCache,
  tr as preferredZone,
  ri as previewBound,
  _i as queryCatalogEntries,
  cs as queryEntries,
  Oo as quickPersister,
  ti as rangeTimezone,
  ol as registerPanelRenderer,
  al as registerSpecHydrator,
  bi as resolveFreshnessTtl,
  $n as resolveRange,
  ls as rulesEntries,
  Ei as schemaColumnEntries,
  Ti as schemaTableEntries,
  Nr as scopeKey,
  Tr as selectionOf,
  Ri as seriesCatalogEntries,
  ns as seriesEntries,
  fi as seriesReadKey,
  Qi as setEchartsLoader,
  Oi as severityColor,
  Pi as severityRank,
  Rs as severityTone,
  Mn as shortLabelOf,
  hi as sourcePickerKey,
  Ze as specToCell,
  us as sqlSourceEntry,
  _s as statusTone,
  Ms as timeAgo,
  te as tokenColor,
  nn as toolCallOf,
  Xi as tooltipChrome,
  Mi as useCatalog,
  ai as useDashboardWs,
  ii as useDashboardWsOptional,
  wi as useDebounced,
  yi as useFreeze,
  ki as useFreshness,
  Li as useInsight,
  As as useInsights,
  Oe as useKit,
  Ya as useKitClient,
  Pe as useKitOptional,
  Za as useKitTheme,
  Qa as useKitWs,
  Xa as useKitZone,
  Vs as useResizable,
  Si as useSourcePicker,
  Ni as useVizBatchLoader,
  di as vizFetchKey,
  ci as vizQueryKey,
  ui as vizShapeKey,
  Tn as weekStartOf,
  es as widgetIdOf
};
