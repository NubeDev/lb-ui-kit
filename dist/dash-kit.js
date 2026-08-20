var Pn = Object.defineProperty;
var On = (e, t, n) => t in e ? Pn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Ve = (e, t, n) => On(e, typeof t != "symbol" ? t + "" : t, n);
import { jsx as a, jsxs as b, Fragment as Ln } from "react/jsx-runtime";
import * as z from "react";
import { createContext as Ne, useContext as le, useMemo as fe, useRef as V, useState as R, useEffect as G, useCallback as B } from "react";
import { Calendar as Fn, CalendarRange as Gn, ChevronDown as jn, Check as qt, ChevronRight as Vt, Table2 as Bn, Inbox as Ut, Lightbulb as Je, Hash as Wn, LineChart as Kn, Database as qn, X as Ht, RefreshCw as ze, CheckCheck as kt, PanelLeftIcon as Vn, BarChart3 as Un, TableProperties as Hn, AlertTriangle as Yn, Lock as Qn, Loader2 as Zn } from "lucide-react";
import { Slot as ot } from "@radix-ui/react-slot";
import * as ge from "@radix-ui/react-dropdown-menu";
import { QueryClient as Xn, QueryClientProvider as Jn } from "@tanstack/react-query";
import { persistQueryClientRestore as er, persistQueryClientSave as tr } from "@tanstack/react-query-persist-client";
import * as he from "@radix-ui/react-collapsible";
import * as j from "@radix-ui/react-dialog";
import * as ye from "@radix-ui/react-tooltip";
class et extends Error {
  constructor(n, r) {
    super(`denied: ${n} — ${r}`);
    Ve(this, "denied", !0);
    Ve(this, "tool");
    this.name = "KitDeniedError", this.tool = n;
  }
}
function nr(e) {
  return e instanceof et;
}
function rr(e) {
  return e instanceof Error && e.message.startsWith("out_of_scope:");
}
function or(e) {
  if (typeof e == "function") return e;
  const t = e;
  return (n, r) => t.call(n, r);
}
function Y(e, t) {
  if (!e || typeof e != "object") return [];
  const n = e[t];
  return Array.isArray(n) ? n : [];
}
function sr(e, t = {}) {
  const n = {
    listSeries: () => e("series.list", {}).then((r) => Y(r, "series")),
    listExtensions: () => e("ext.list", {}).then((r) => Y(r, "extensions")),
    listFlows: () => e("flows.list", {}).then((r) => Y(r, "flows")),
    // `flows.get` answers the flow BARE (not enveloped). A flow the caller can list but not read
    // rejects; the picker skips it rather than failing the whole bundle, so map a rejection to null.
    getFlow: (r) => e("flows.get", { id: r }).then((o) => o && typeof o == "object" ? o : null).catch(() => null),
    listFlowNodes: () => e("flows.nodes", {}).then((r) => Y(r, "nodes")),
    listDatasources: () => e("datasource.list", {}).then((r) => Y(r, "datasources")),
    listRules: () => e("rules.list", {}).then((r) => Y(r, "rules")),
    listQueries: () => e("query.list", {}).then((r) => Y(r, "queries")),
    // `store.schema` answers the schema BARE. An absent/!object reply is an empty schema, not a throw.
    readSchema: () => e("store.schema", {}).then(
      (r) => r && typeof r == "object" ? r : { tables: [] }
    ),
    listChannels: () => e("channel.list", {}).then((r) => Y(r, "channels")),
    listInsights: () => e("insight.list", {}).then((r) => Y(r, "items"))
  };
  if (t.inboxChannel) {
    const r = t.inboxChannel;
    n.listInbox = () => e("inbox.list", { channel: r }).then((o) => Y(o, "items"));
  }
  return n;
}
function ar(e) {
  return {
    list: (t) => e("insight.list", { ...t }).then((n) => n ?? { items: [] }),
    get: (t) => e("insight.get", { id: t }).then((n) => n ?? null),
    occurrences: (t, n, r) => e("insight.occurrences", {
      insight_id: t,
      cursor: n,
      limit: r ?? 50
    }).then((o) => o ?? { items: [] }),
    ack: () => Promise.reject(
      new et(
        "insight.ack",
        "the kit is a READ kit; extension bridge writes are not implemented (U-ext-bridge-write)"
      )
    ),
    resolve: () => Promise.reject(
      new et(
        "insight.resolve",
        "the kit is a READ kit; extension bridge writes are not implemented (U-ext-bridge-write)"
      )
    )
    // No `subscribe`: a live tail needs a stream seam the leashed call does not carry. Omitting it is
    // the interface's documented "no feed" case, so the hooks fall back to act→refresh.
  };
}
function Ua(e, t = {}) {
  const n = or(e);
  return {
    call: n,
    loaders: sr(n, t),
    insights: ar(n)
  };
}
const ir = /\bno such tool\b|\bnot found\b|\b404\b/i, lr = /\bdenied\b|\bforbidden\b|\bunauthori[sz]ed\b|\bnot authori[sz]ed\b|\bout_of_scope\b/i;
function cr(e) {
  if (nr(e) || rr(e)) return "denied";
  const t = e instanceof Error ? e.message : typeof e == "string" ? e : "";
  return lr.test(t) ? "denied" : ir.test(t) ? "unavailable" : "error";
}
const Ha = [
  "viz.query",
  "viz.query_batch",
  "series.read",
  "series.latest",
  "series.find",
  // Tier 2b: `PanelEmbed`'s library mode reads a curated panel by id. Without this entry the embed's
  // `panel.get` is rejected client-side as `out_of_scope` and the page renders a denial over a panel
  // the viewer can actually read — the same silent-under-render trap the batch verb has.
  "panel.get"
], Ya = [
  "mcp:viz.query:call",
  "mcp:series.read:call",
  "mcp:series.latest:call",
  "mcp:series.find:call",
  // Needed only by a page that embeds a LIBRARY panel (`PanelEmbed id=…`); an inline-cell embed does
  // not read the record. Requested anyway rather than left to be discovered: an admin who does not want
  // it declines it, and the embed renders an honest denial naming the verb.
  "mcp:panel.get:call"
];
function dr() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
const st = Ne(null);
function Qa({
  client: e,
  ws: t,
  theme: n,
  zone: r,
  portalContainer: o = null,
  children: s
}) {
  const i = fe(
    () => ({ client: e, ws: t, theme: n, zone: r ?? dr, portalContainer: o }),
    [e, t, n, r, o]
  );
  return /* @__PURE__ */ a(st.Provider, { value: i, children: s });
}
function Ce() {
  return le(st);
}
function Oe() {
  const e = le(st);
  if (!e)
    throw new Error(
      "useKit: no <KitProvider>. Wrap the page: <KitProvider client={makeKitClient(bridge)} ws={ctx.workspace}>"
    );
  return e;
}
function Za() {
  return Oe().client;
}
function Le() {
  var e;
  return ((e = Ce()) == null ? void 0 : e.portalContainer) ?? null;
}
function Xa() {
  return Oe().ws;
}
function Ja() {
  return Oe().theme;
}
function ei() {
  return Oe().zone;
}
const ur = 864e5;
function pe(e, t, n) {
  e -= t <= 2 ? 1 : 0;
  const r = Math.floor((e >= 0 ? e : e - 399) / 400), o = e - r * 400, s = Math.floor((153 * (t + (t > 2 ? -3 : 9)) + 2) / 5) + n - 1, i = o * 365 + Math.floor(o / 4) - Math.floor(o / 100) + s;
  return r * 146097 + i - 719468;
}
function Yt(e) {
  e += 719468;
  const t = Math.floor((e >= 0 ? e : e - 146096) / 146097), n = e - t * 146097, r = Math.floor(
    (n - Math.floor(n / 1460) + Math.floor(n / 36524) - Math.floor(n / 146096)) / 365
  ), o = r + t * 400, s = n - (365 * r + Math.floor(r / 4) - Math.floor(r / 100)), i = Math.floor((5 * s + 2) / 153), l = s - Math.floor((153 * i + 2) / 5) + 1, c = i + (i < 10 ? 3 : -9);
  return { y: o + (c <= 2 ? 1 : 0), mo: c, d: l };
}
function Qt(e, t) {
  const n = t === 12 ? { y: e + 1, mo: 1 } : { y: e, mo: t + 1 };
  return pe(n.y, n.mo, 1) - pe(e, t, 1);
}
function mr(e, t, n, r) {
  return (pe(e, t, n) % 7 + (r === "sunday" ? 4 : 3) + 7) % 7;
}
const Nt = /* @__PURE__ */ new Map();
function Zt(e) {
  let t = Nt.get(e);
  return t || (t = new Intl.DateTimeFormat("en-US", {
    timeZone: e,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }), Nt.set(e, t)), t;
}
function at(e) {
  if (!e) return "UTC";
  try {
    return Zt(e), e;
  } catch {
    return "UTC";
  }
}
function be(e, t) {
  const n = Zt(t).formatToParts(e), r = (o) => {
    var s;
    return Number(((s = n.find((i) => i.type === o)) == null ? void 0 : s.value) ?? 0);
  };
  return { y: r("year"), mo: r("month"), d: r("day"), h: r("hour") % 24, mi: r("minute"), s: r("second") };
}
function Xt(e) {
  return pe(e.y, e.mo, e.d) * ur + ((e.h * 60 + e.mi) * 60 + e.s) * 1e3;
}
function Ct(e, t) {
  return Xt(be(e, t)) - e;
}
function q(e, t) {
  const n = Xt(e), r = n - Ct(n, t);
  return n - Ct(r, t);
}
function tt(e, t) {
  const n = be(e, t), r = (o, s = 2) => String(o).padStart(s, "0");
  return `${r(n.y, 4)}-${r(n.mo)}-${r(n.d)}`;
}
const St = {
  s: "s",
  m: "m",
  h: "h",
  d: "d",
  w: "w",
  M: "M",
  y: "y"
}, fr = {
  second: "s",
  minute: "m",
  hour: "h",
  day: "d",
  week: "w",
  month: "M",
  quarter: "q",
  year: "y"
}, hr = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  y: "year"
}, pr = /^now(?:([+-])(\d{1,6})([smhdwMy]))?(?:\/([smhdwMy]))?$/, br = /^(\d{4})-(\d{2})-(\d{2})$/, gr = /^\d{13}$/, wr = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?$/, xr = /^(this|last|next)-(hour|day|week|month|quarter|year)$/, vr = /^last-(\d{1,6})-(second|minute|hour|day|week|month|quarter|year)s?$/, yr = /^last-(\d{1,6})([smhdwMy])$/, Jt = "expected now±<n><unit> (units s m h d w M y, optional /<unit> snap), an ISO day or instant, 13-digit epoch ms, today/yesterday/tomorrow, this-/last-/next-<unit>, or last-<n>-<unit>s";
function Re(e) {
  return { ok: !1, error: `unrecognized range expression "${e}" — ${Jt}` };
}
function $t(e, t, n) {
  return t >= 1 && t <= 12 && n >= 1 && n <= Qt(e, t);
}
function De(e) {
  const t = e.trim();
  if (!t) return { ok: !1, error: `empty range expression — ${Jt}` };
  if (t === "today") return ue({ kind: "day", offset: 0 });
  if (t === "yesterday") return ue({ kind: "day", offset: -1 });
  if (t === "tomorrow") return ue({ kind: "day", offset: 1 });
  const n = xr.exec(t);
  if (n)
    return ue({ kind: "period", rel: n[1], unit: n[2] });
  const r = vr.exec(t);
  if (r) return ue({ kind: "trailing", n: Number(r[1]), unit: fr[r[2]] });
  const o = yr.exec(t);
  if (o) return ue({ kind: "trailing", n: Number(o[1]), unit: St[o[2]] });
  const s = pr.exec(t);
  if (s) {
    const [, c, d, u, p] = s;
    return we({
      kind: "now",
      ...c ? { offset: { sign: c === "-" ? -1 : 1, n: Number(d), unit: St[u] } } : {},
      ...p ? { snap: hr[p] } : {}
    });
  }
  const i = br.exec(t);
  if (i) {
    const [c, d, u] = [Number(i[1]), Number(i[2]), Number(i[3])];
    return $t(c, d, u) ? we({ kind: "isoDay", y: c, mo: d, d: u }) : Re(e);
  }
  if (gr.test(t)) return we({ kind: "instant", ms: Number(t) });
  const l = wr.exec(t);
  if (l) {
    const [, c, d, u, p, x, g, m, f] = l;
    if (!$t(Number(c), Number(d), Number(u)) || Number(p) > 23 || Number(x) > 59) return Re(e);
    if (f) {
      const y = Date.parse(t);
      return Number.isFinite(y) ? we({ kind: "instant", ms: y }) : Re(e);
    }
    return we({
      kind: "wall",
      y: Number(c),
      mo: Number(d),
      d: Number(u),
      h: Number(p),
      mi: Number(x),
      s: Number(g ?? 0),
      ms: Number((m ?? "0").padEnd(3, "0"))
    });
  }
  return Re(e);
}
function ti(e) {
  const t = De(e);
  return t.ok && t.expr.type === "window";
}
function ue(e) {
  return { ok: !0, expr: { type: "window", window: e } };
}
function we(e) {
  return { ok: !0, expr: { type: "endpoint", endpoint: e } };
}
const kr = "browser";
function en() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
function tn(e, ...t) {
  for (const n of t)
    if (n && n !== kr) return n;
  return e();
}
const ni = "last-30-days";
function ri(e, t, n = en) {
  return at(tn(n, e, t));
}
function Nr(e, t) {
  const n = e.y * 12 + (e.mo - 1) + t, r = Math.floor(n / 12), o = (n % 12 + 12) % 12 + 1;
  return { ...e, y: r, mo: o, d: Math.min(e.d, Qt(r, o)) };
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
      const o = be(e, r), s = n === "w" ? t * 7 : t, i = Yt(pe(o.y, o.mo, o.d) + s);
      return q({ ...o, ...i }, r);
    }
    case "M":
    case "q":
    case "y": {
      const o = n === "M" ? t : n === "q" ? t * 3 : t * 12;
      return q(Nr(be(e, r), o), r);
    }
  }
}
function Cr(e) {
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
function nt(e, t, n, r) {
  if (t === "second") return Math.floor(e / 1e3) * 1e3;
  const o = be(e, n), s = r ?? "monday";
  switch (t) {
    case "minute":
      return q({ ...o, s: 0 }, n);
    case "hour":
      return q({ ...o, mi: 0, s: 0 }, n);
    case "day":
      return q({ ...o, h: 0, mi: 0, s: 0 }, n);
    case "week": {
      const i = Yt(pe(o.y, o.mo, o.d) - mr(o.y, o.mo, o.d, s));
      return q({ ...o, ...i, h: 0, mi: 0, s: 0 }, n);
    }
    case "month":
      return q({ ...o, d: 1, h: 0, mi: 0, s: 0 }, n);
    case "quarter":
      return q({ ...o, mo: Math.floor((o.mo - 1) / 3) * 3 + 1, d: 1, h: 0, mi: 0, s: 0 }, n);
    case "year":
      return q({ ...o, mo: 1, d: 1, h: 0, mi: 0, s: 0 }, n);
    default:
      return e;
  }
}
function Tt(e, t, n, r) {
  switch (e.kind) {
    case "now": {
      let o = t;
      return e.offset && (o = ie(o, e.offset.sign * e.offset.n, e.offset.unit, n)), e.snap && (o = nt(o, e.snap, n, r)), o;
    }
    case "isoDay":
      return q({ y: e.y, mo: e.mo, d: e.d, h: 0, mi: 0, s: 0 }, n);
    case "instant":
      return e.ms;
    case "wall":
      return q({ y: e.y, mo: e.mo, d: e.d, h: e.h, mi: e.mi, s: e.s }, n) + e.ms;
  }
}
function Sr(e, t, n, r) {
  switch (e.kind) {
    case "day": {
      const o = ie(nt(t, "day", n), e.offset, "d", n);
      return e.offset === 0 ? { fromMs: o, toMs: t } : { fromMs: o, toMs: ie(o, 1, "d", n) };
    }
    case "period": {
      const o = nt(t, e.unit, n, r), s = Cr(e.unit);
      return e.rel === "this" ? { fromMs: o, toMs: t } : e.rel === "last" ? { fromMs: ie(o, -1, s, n), toMs: o } : { fromMs: ie(o, 1, s, n), toMs: ie(o, 2, s, n) };
    }
    case "trailing":
      return { fromMs: ie(t, -e.n, e.unit, n), toMs: t };
  }
}
function $r(e, t, n, r, o) {
  if (!e || !e.trim()) return null;
  const s = at(r), i = De(e);
  if (!i.ok) return null;
  if (i.expr.type === "window")
    return t && t.trim() ? null : Sr(i.expr.window, n, s, o);
  const l = Tt(i.expr.endpoint, n, s, o);
  let c = n;
  if (t && t.trim()) {
    const d = De(t);
    if (!d.ok || d.expr.type !== "endpoint") return null;
    c = Tt(d.expr.endpoint, n, s, o);
  }
  return l <= c ? { fromMs: l, toMs: c } : null;
}
function oi(e, t) {
  const n = at(t), r = be(e, n), o = tt(e, n);
  if (r.h === 0 && r.mi === 0 && r.s === 0 && e % 1e3 === 0) return o;
  const s = (i) => String(i).padStart(2, "0");
  return `${o} ${s(r.h)}:${s(r.mi)}`;
}
function Tr(e) {
  return e === "sunday" ? "sunday" : "monday";
}
const Er = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  M: "month",
  q: "quarter",
  y: "year"
};
function Rr(e) {
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function _r(e) {
  switch (e.kind) {
    case "day":
      return e.offset === 0 ? "Today" : e.offset === -1 ? "Yesterday" : "Tomorrow";
    case "period":
      return `${Rr(e.rel)} ${e.unit}`;
    case "trailing": {
      const t = Er[e.unit];
      return `Last ${e.n} ${t}${e.n === 1 ? "" : "s"}`;
    }
  }
}
function it(e, t) {
  const n = De(e);
  return n.ok && n.expr.type === "window" ? _r(n.expr.window) : t ? `${e} → ${t}` : e === "now" ? "Now" : `${e} → now`;
}
function Mr(e, t) {
  const n = /^\d{4}-\d{2}-\d{2}$/;
  if (t && n.test(e) && n.test(t)) {
    const r = (o) => {
      const s = /* @__PURE__ */ new Date(`${o}T00:00:00Z`);
      return Number.isNaN(s.getTime()) ? o : s.toLocaleDateString(void 0, { month: "short", day: "numeric", timeZone: "UTC" });
    };
    return `${r(e)} – ${r(t)}`;
  }
  return it(e, t);
}
function nn(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (n = nn(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function Fe() {
  for (var e, t, n = 0, r = "", o = arguments.length; n < o; n++) (e = arguments[n]) && (t = nn(e)) && (r && (r += " "), r += t);
  return r;
}
const Et = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, Rt = Fe, lt = (e, t) => (n) => {
  var r;
  if ((t == null ? void 0 : t.variants) == null) return Rt(e, n == null ? void 0 : n.class, n == null ? void 0 : n.className);
  const { variants: o, defaultVariants: s } = t, i = Object.keys(o).map((d) => {
    const u = n == null ? void 0 : n[d], p = s == null ? void 0 : s[d];
    if (u === null) return null;
    const x = Et(u) || Et(p);
    return o[d][x];
  }), l = n && Object.entries(n).reduce((d, u) => {
    let [p, x] = u;
    return x === void 0 || (d[p] = x), d;
  }, {}), c = t == null || (r = t.compoundVariants) === null || r === void 0 ? void 0 : r.reduce((d, u) => {
    let { class: p, className: x, ...g } = u;
    return Object.entries(g).every((m) => {
      let [f, y] = m;
      return Array.isArray(y) ? y.includes({
        ...s,
        ...l
      }[f]) : {
        ...s,
        ...l
      }[f] === y;
    }) ? [
      ...d,
      p,
      x
    ] : d;
  }, []);
  return Rt(e, i, c, n == null ? void 0 : n.class, n == null ? void 0 : n.className);
}, Ir = (e, t) => {
  const n = new Array(e.length + t.length);
  for (let r = 0; r < e.length; r++)
    n[r] = e[r];
  for (let r = 0; r < t.length; r++)
    n[e.length + r] = t[r];
  return n;
}, Ar = (e, t) => ({
  classGroupId: e,
  validator: t
}), rn = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
  nextPart: e,
  validators: t,
  classGroupId: n
}), Pe = "-", _t = [], zr = "arbitrary..", Dr = (e) => {
  const t = Or(e), {
    conflictingClassGroups: n,
    conflictingClassGroupModifiers: r
  } = e;
  return {
    getClassGroupId: (i) => {
      if (i.startsWith("[") && i.endsWith("]"))
        return Pr(i);
      const l = i.split(Pe), c = l[0] === "" && l.length > 1 ? 1 : 0;
      return on(l, c, t);
    },
    getConflictingClassGroupIds: (i, l) => {
      if (l) {
        const c = r[i], d = n[i];
        return c ? d ? Ir(d, c) : c : d || _t;
      }
      return n[i] || _t;
    }
  };
}, on = (e, t, n) => {
  if (e.length - t === 0)
    return n.classGroupId;
  const o = e[t], s = n.nextPart.get(o);
  if (s) {
    const d = on(e, t + 1, s);
    if (d) return d;
  }
  const i = n.validators;
  if (i === null)
    return;
  const l = t === 0 ? e.join(Pe) : e.slice(t).join(Pe), c = i.length;
  for (let d = 0; d < c; d++) {
    const u = i[d];
    if (u.validator(l))
      return u.classGroupId;
  }
}, Pr = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
  return r ? zr + r : void 0;
})(), Or = (e) => {
  const {
    theme: t,
    classGroups: n
  } = e;
  return Lr(n, t);
}, Lr = (e, t) => {
  const n = rn();
  for (const r in e) {
    const o = e[r];
    ct(o, n, r, t);
  }
  return n;
}, ct = (e, t, n, r) => {
  const o = e.length;
  for (let s = 0; s < o; s++) {
    const i = e[s];
    Fr(i, t, n, r);
  }
}, Fr = (e, t, n, r) => {
  if (typeof e == "string") {
    Gr(e, t, n);
    return;
  }
  if (typeof e == "function") {
    jr(e, t, n, r);
    return;
  }
  Br(e, t, n, r);
}, Gr = (e, t, n) => {
  const r = e === "" ? t : sn(t, e);
  r.classGroupId = n;
}, jr = (e, t, n, r) => {
  if (Wr(e)) {
    ct(e(r), t, n, r);
    return;
  }
  t.validators === null && (t.validators = []), t.validators.push(Ar(n, e));
}, Br = (e, t, n, r) => {
  const o = Object.entries(e), s = o.length;
  for (let i = 0; i < s; i++) {
    const [l, c] = o[i];
    ct(c, sn(t, l), n, r);
  }
}, sn = (e, t) => {
  let n = e;
  const r = t.split(Pe), o = r.length;
  for (let s = 0; s < o; s++) {
    const i = r[s];
    let l = n.nextPart.get(i);
    l || (l = rn(), n.nextPart.set(i, l)), n = l;
  }
  return n;
}, Wr = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Kr = (e) => {
  if (e < 1)
    return {
      get: () => {
      },
      set: () => {
      }
    };
  let t = 0, n = /* @__PURE__ */ Object.create(null), r = /* @__PURE__ */ Object.create(null);
  const o = (s, i) => {
    n[s] = i, t++, t > e && (t = 0, r = n, n = /* @__PURE__ */ Object.create(null));
  };
  return {
    get(s) {
      let i = n[s];
      if (i !== void 0)
        return i;
      if ((i = r[s]) !== void 0)
        return o(s, i), i;
    },
    set(s, i) {
      s in n ? n[s] = i : o(s, i);
    }
  };
}, rt = "!", Mt = ":", qr = [], It = (e, t, n, r, o) => ({
  modifiers: e,
  hasImportantModifier: t,
  baseClassName: n,
  maybePostfixModifierPosition: r,
  isExternal: o
}), Vr = (e) => {
  const {
    prefix: t,
    experimentalParseClassName: n
  } = e;
  let r = (o) => {
    const s = [];
    let i = 0, l = 0, c = 0, d;
    const u = o.length;
    for (let f = 0; f < u; f++) {
      const y = o[f];
      if (i === 0 && l === 0) {
        if (y === Mt) {
          s.push(o.slice(c, f)), c = f + 1;
          continue;
        }
        if (y === "/") {
          d = f;
          continue;
        }
      }
      y === "[" ? i++ : y === "]" ? i-- : y === "(" ? l++ : y === ")" && l--;
    }
    const p = s.length === 0 ? o : o.slice(c);
    let x = p, g = !1;
    p.endsWith(rt) ? (x = p.slice(0, -1), g = !0) : (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      p.startsWith(rt) && (x = p.slice(1), g = !0)
    );
    const m = d && d > c ? d - c : void 0;
    return It(s, g, x, m);
  };
  if (t) {
    const o = t + Mt, s = r;
    r = (i) => i.startsWith(o) ? s(i.slice(o.length)) : It(qr, !1, i, void 0, !0);
  }
  if (n) {
    const o = r;
    r = (s) => n({
      className: s,
      parseClassName: o
    });
  }
  return r;
}, Ur = (e) => {
  const t = /* @__PURE__ */ new Map();
  return e.orderSensitiveModifiers.forEach((n, r) => {
    t.set(n, 1e6 + r);
  }), (n) => {
    const r = [];
    let o = [];
    for (let s = 0; s < n.length; s++) {
      const i = n[s], l = i[0] === "[", c = t.has(i);
      l || c ? (o.length > 0 && (o.sort(), r.push(...o), o = []), r.push(i)) : o.push(i);
    }
    return o.length > 0 && (o.sort(), r.push(...o)), r;
  };
}, Hr = (e) => ({
  cache: Kr(e.cacheSize),
  parseClassName: Vr(e),
  sortModifiers: Ur(e),
  postfixLookupClassGroupIds: Yr(e),
  ...Dr(e)
}), Yr = (e) => {
  const t = /* @__PURE__ */ Object.create(null), n = e.postfixLookupClassGroups;
  if (n)
    for (let r = 0; r < n.length; r++)
      t[n[r]] = !0;
  return t;
}, Qr = /\s+/, Zr = (e, t) => {
  const {
    parseClassName: n,
    getClassGroupId: r,
    getConflictingClassGroupIds: o,
    sortModifiers: s,
    postfixLookupClassGroupIds: i
  } = t, l = [], c = e.trim().split(Qr);
  let d = "";
  for (let u = c.length - 1; u >= 0; u -= 1) {
    const p = c[u], {
      isExternal: x,
      modifiers: g,
      hasImportantModifier: m,
      baseClassName: f,
      maybePostfixModifierPosition: y
    } = n(p);
    if (x) {
      d = p + (d.length > 0 ? " " + d : d);
      continue;
    }
    let C = !!y, N;
    if (C) {
      const D = f.substring(0, y);
      N = r(D);
      const h = N && i[N] ? r(f) : void 0;
      h && h !== N && (N = h, C = !1);
    } else
      N = r(f);
    if (!N) {
      if (!C) {
        d = p + (d.length > 0 ? " " + d : d);
        continue;
      }
      if (N = r(f), !N) {
        d = p + (d.length > 0 ? " " + d : d);
        continue;
      }
      C = !1;
    }
    const _ = g.length === 0 ? "" : g.length === 1 ? g[0] : s(g).join(":"), S = m ? _ + rt : _, $ = S + N;
    if (l.indexOf($) > -1)
      continue;
    l.push($);
    const M = o(N, C);
    for (let D = 0; D < M.length; ++D) {
      const h = M[D];
      l.push(S + h);
    }
    d = p + (d.length > 0 ? " " + d : d);
  }
  return d;
}, Xr = (...e) => {
  let t = 0, n, r, o = "";
  for (; t < e.length; )
    (n = e[t++]) && (r = an(n)) && (o && (o += " "), o += r);
  return o;
}, an = (e) => {
  if (typeof e == "string")
    return e;
  let t, n = "";
  for (let r = 0; r < e.length; r++)
    e[r] && (t = an(e[r])) && (n && (n += " "), n += t);
  return n;
}, Jr = (e, ...t) => {
  let n, r, o, s;
  const i = (c) => {
    const d = t.reduce((u, p) => p(u), e());
    return n = Hr(d), r = n.cache.get, o = n.cache.set, s = l, l(c);
  }, l = (c) => {
    const d = r(c);
    if (d)
      return d;
    const u = Zr(c, n);
    return o(c, u), u;
  };
  return s = i, (...c) => s(Xr(...c));
}, eo = [], P = (e) => {
  const t = (n) => n[e] || eo;
  return t.isThemeGetter = !0, t;
}, ln = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, cn = /^\((?:(\w[\w-]*):)?(.+)\)$/i, to = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, no = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, ro = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, oo = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, so = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, ao = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, ee = (e) => to.test(e), T = (e) => !!e && !Number.isNaN(Number(e)), Q = (e) => !!e && Number.isInteger(Number(e)), Ue = (e) => e.endsWith("%") && T(e.slice(0, -1)), X = (e) => no.test(e), dn = () => !0, io = (e) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  ro.test(e) && !oo.test(e)
), dt = () => !1, lo = (e) => so.test(e), co = (e) => ao.test(e), uo = (e) => !w(e) && !v(e), mo = (e) => e.startsWith("@container") && (e[10] === "/" && e[11] !== void 0 || e[11] === "s" && e[16] !== void 0 && e.startsWith("-size/", 10) || e[11] === "n" && e[18] !== void 0 && e.startsWith("-normal/", 10)), fo = (e) => ne(e, fn, dt), w = (e) => ln.test(e), se = (e) => ne(e, hn, io), At = (e) => ne(e, yo, T), ho = (e) => ne(e, bn, dn), po = (e) => ne(e, pn, dt), zt = (e) => ne(e, un, dt), bo = (e) => ne(e, mn, co), _e = (e) => ne(e, gn, lo), v = (e) => cn.test(e), xe = (e) => ce(e, hn), go = (e) => ce(e, pn), Dt = (e) => ce(e, un), wo = (e) => ce(e, fn), xo = (e) => ce(e, mn), Me = (e) => ce(e, gn, !0), vo = (e) => ce(e, bn, !0), ne = (e, t, n) => {
  const r = ln.exec(e);
  return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, ce = (e, t, n = !1) => {
  const r = cn.exec(e);
  return r ? r[1] ? t(r[1]) : n : !1;
}, un = (e) => e === "position" || e === "percentage", mn = (e) => e === "image" || e === "url", fn = (e) => e === "length" || e === "size" || e === "bg-size", hn = (e) => e === "length", yo = (e) => e === "number", pn = (e) => e === "family-name", bn = (e) => e === "number" || e === "weight", gn = (e) => e === "shadow", ko = () => {
  const e = P("color"), t = P("font"), n = P("text"), r = P("font-weight"), o = P("tracking"), s = P("leading"), i = P("breakpoint"), l = P("container"), c = P("spacing"), d = P("radius"), u = P("shadow"), p = P("inset-shadow"), x = P("text-shadow"), g = P("drop-shadow"), m = P("blur"), f = P("perspective"), y = P("aspect"), C = P("ease"), N = P("animate"), _ = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], S = () => [
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
  ], $ = () => [...S(), v, w], M = () => ["auto", "hidden", "clip", "visible", "scroll"], D = () => ["auto", "contain", "none"], h = () => [v, w, c], I = () => [ee, "full", "auto", ...h()], H = () => [Q, "none", "subgrid", v, w], Z = () => ["auto", {
    span: ["full", Q, v, w]
  }, Q, v, w], re = () => [Q, "auto", v, w], bt = () => ["auto", "min", "max", "fr", v, w], je = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"], de = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"], K = () => ["auto", ...h()], oe = () => [ee, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...h()], Be = () => [ee, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...h()], We = () => [ee, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...h()], k = () => [e, v, w], gt = () => [...S(), Dt, zt, {
    position: [v, w]
  }], wt = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }], xt = () => ["auto", "cover", "contain", wo, fo, {
    size: [v, w]
  }], Ke = () => [Ue, xe, se], L = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    d,
    v,
    w
  ], F = () => ["", T, xe, se], Se = () => ["solid", "dashed", "dotted", "double"], vt = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], O = () => [T, Ue, Dt, zt], yt = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    m,
    v,
    w
  ], $e = () => ["none", T, v, w], Te = () => ["none", T, v, w], qe = () => [T, v, w], Ee = () => [ee, "full", ...h()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [X],
      breakpoint: [X],
      color: [dn],
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
        aspect: ["auto", "square", ee, w, v, y]
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
        "@container": ["", "normal", "size", v, w]
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
        columns: [T, w, v, l]
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
        z: [Q, "auto", v, w]
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
        grow: ["", T, v, w]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", T, v, w]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [Q, "first", "last", "none", v, w]
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
        "col-start": re()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": re()
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
        "row-start": re()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": re()
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
        "auto-cols": bt()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": bt()
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
        justify: [...je(), "normal"]
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
        content: ["normal", ...je()]
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
        "place-content": je()
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
        inline: ["auto", ...Be()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...Be()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...Be()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...We()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...We()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...We()]
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
        text: ["base", n, xe, se]
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
        font: [r, vo, ho]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", Ue, w]
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
        tracking: [o, v, w]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [T, "none", v, At]
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
        "list-image": ["none", v, w]
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
        list: ["disc", "decimal", "none", v, w]
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
        decoration: [...Se(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [T, "from-font", "auto", v, se]
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
        "underline-offset": [T, "auto", v, w]
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
        tab: [Q, v, w]
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", v, w]
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
        content: ["none", v, w]
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
        bg: gt()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: wt()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: xt()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, Q, v, w],
          radial: ["", v, w],
          conic: [Q, v, w]
        }, xo, bo]
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
        from: Ke()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: Ke()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: Ke()
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
        border: [...Se(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...Se(), "hidden", "none"]
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
        outline: [...Se(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [T, v, w]
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
          Me,
          _e
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
        "inset-shadow": ["none", p, Me, _e]
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
        "text-shadow": ["none", x, Me, _e]
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
        opacity: [T, v, w]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...vt(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": vt()
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
        "mask-radial": [v, w]
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
        mask: gt()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: wt()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: xt()
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
        mask: ["none", v, w]
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
          v,
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
        brightness: [T, v, w]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [T, v, w]
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
          Me,
          _e
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
        grayscale: ["", T, v, w]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [T, v, w]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", T, v, w]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [T, v, w]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", T, v, w]
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
          v,
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
        "backdrop-brightness": [T, v, w]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [T, v, w]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", T, v, w]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [T, v, w]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", T, v, w]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [T, v, w]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [T, v, w]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", T, v, w]
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
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", v, w]
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
        duration: [T, "initial", v, w]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", C, v, w]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [T, v, w]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", N, v, w]
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
        perspective: [f, v, w]
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
        rotate: $e()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": $e()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": $e()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": $e()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: Te()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": Te()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": Te()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": Te()
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
        skew: qe()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": qe()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": qe()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [v, w, "", "none", "gpu", "cpu"]
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
        translate: Ee()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": Ee()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": Ee()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": Ee()
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
        zoom: [Q, v, w]
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
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", v, w]
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
        "will-change": ["auto", "scroll", "contents", "transform", v, w]
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
        stroke: [T, xe, se, At]
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
}, ut = /* @__PURE__ */ Jr(ko);
function W(...e) {
  return ut(Fe(e));
}
const No = lt(
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
), Ie = z.forwardRef(function({ className: t, variant: n, size: r, asChild: o = !1, ...s }, i) {
  return /* @__PURE__ */ a(o ? ot : "button", { ref: i, className: W(No({ variant: n, size: r, className: t })), ...s });
});
function Co({ ...e }) {
  return /* @__PURE__ */ a(ge.Root, { "data-slot": "dropdown-menu", ...e });
}
function So({ ...e }) {
  return /* @__PURE__ */ a(ge.Trigger, { "data-slot": "dropdown-menu-trigger", ...e });
}
function $o({
  container: e,
  ...t
}) {
  const n = Le();
  return /* @__PURE__ */ a(ge.Portal, { container: e ?? n ?? void 0, ...t });
}
function To({
  className: e,
  sideOffset: t = 4,
  container: n,
  ...r
}) {
  return /* @__PURE__ */ a($o, { container: n, children: /* @__PURE__ */ a(
    ge.Content,
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
function Eo({
  className: e,
  inset: t,
  ...n
}) {
  return /* @__PURE__ */ a(
    ge.Label,
    {
      "data-slot": "dropdown-menu-label",
      "data-inset": t,
      className: W("px-2 py-1.5 text-xs text-muted data-[inset]:pl-8", e),
      ...n
    }
  );
}
function Pt({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ a(
    ge.Separator,
    {
      "data-slot": "dropdown-menu-separator",
      className: W("bg-border -mx-1 my-1 h-px", e),
      ...t
    }
  );
}
const wn = z.forwardRef(
  ({ className: e, type: t, ...n }, r) => /* @__PURE__ */ a(
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
wn.displayName = "Input";
const xn = { eu: "/", iso: "-", usa: "/" };
function Ro(e) {
  const t = xn[e];
  return e === "usa" ? `MM${t}DD${t}YYYY` : e === "iso" ? `YYYY${t}MM${t}DD` : `DD${t}MM${t}YYYY`;
}
function Ot(e, t) {
  const n = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e ?? "");
  if (!n) return "";
  const [, r, o, s] = n, i = xn[t];
  return t === "usa" ? `${o}${i}${s}${i}${r}` : t === "iso" ? `${r}${i}${o}${i}${s}` : `${s}${i}${o}${i}${r}`;
}
function si(e, t) {
  const n = (e ?? "").split(/[/\-.]/).map((l) => l.trim());
  if (n.length !== 3 || n.some((l) => !/^\d+$/.test(l))) return "";
  let r, o, s;
  if (t === "usa" ? [o, s, r] = n : t === "iso" ? [r, o, s] = n : [s, o, r] = n, r.length !== 4) return "";
  const i = `${r}-${o.padStart(2, "0")}-${s.padStart(2, "0")}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(i) ? i : "";
}
function Lt({ value: e, onChange: t, dateStyle: n, className: r, ...o }) {
  const s = V(null), i = n ?? "eu", l = Ot(e, i) || Ro(i), c = !Ot(e, i);
  return /* @__PURE__ */ b(
    "div",
    {
      className: W(
        "dash-kit relative inline-flex h-8 items-center rounded-md border border-border bg-bg text-xs shadow-sm transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20",
        r
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
        /* @__PURE__ */ a(Fn, { "aria-hidden": !0, size: 13, className: "pointer-events-none absolute right-2 text-muted" }),
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
const vn = ["Minutes", "Hours", "Days", "Months", "Years"], E = (e, t) => ({ id: e, label: it(t), expr: t }), yn = [
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
], ai = yn.flatMap(
  (e) => vn.flatMap((t) => e.cells[t])
), He = /^\d{4}-\d{2}-\d{2}$/;
function ii({
  from: e,
  to: t,
  onApply: n,
  timezone: r,
  compact: o,
  dateStyle: s,
  weekStart: i,
  onUserApply: l
}) {
  const [c, d] = R(!1), u = Ce(), p = tn((u == null ? void 0 : u.zone) ?? en, r), x = Tr(i), g = He.test(e) && t ? "" : e, [m, f] = R(g), y = fe(
    () => He.test(e) && t && He.test(t) ? { from: e, to: t } : { from: "", to: "" },
    [e, t]
  ), [C, N] = R(y);
  G(() => {
    f(g), N(y);
  }, [e, t]);
  const _ = fe(() => Date.now(), [c]), S = fe(() => {
    const h = m.trim();
    if (!h) return null;
    const I = $r(h, void 0, _, p, x);
    return I ? {
      text: `${h} → ${tt(I.fromMs, p)} → ${tt(I.toMs, p)}`
    } : {
      error: "Not a range expression — try last-3-months, this-month, now-4h."
    };
  }, [m, _, p]), $ = (h) => {
    l == null || l(), n(h), d(!1);
  }, M = C.from !== e || C.to !== t, D = !!C.from && !!C.to && C.from > C.to;
  return /* @__PURE__ */ b(Co, { open: c, onOpenChange: d, children: [
    /* @__PURE__ */ a(So, { asChild: !0, children: /* @__PURE__ */ b(
      Ie,
      {
        variant: "outline",
        size: "sm",
        className: W(
          "dash-kit gap-1.5 px-2.5 text-xs font-normal",
          o ? "h-11 md:h-8" : "h-8"
        ),
        title: "Change the dashboard time range",
        children: [
          /* @__PURE__ */ a(Gn, { size: 13, className: "text-muted" }),
          /* @__PURE__ */ a("span", { className: "max-w-[13rem] truncate", children: o ? Mr(e, t) : it(e, t) }),
          /* @__PURE__ */ a(jn, { size: 13, className: "text-muted" })
        ]
      }
    ) }),
    /* @__PURE__ */ a(To, { align: "end", className: "dash-kit p-0", children: /* @__PURE__ */ b(
      "div",
      {
        className: W(
          "max-w-[calc(100vw-2rem)]",
          o ? "w-[calc(100vw-2rem)]" : "w-[42rem]"
        ),
        children: [
          /* @__PURE__ */ a(Eo, { className: "px-3 pt-2.5 text-[0.7rem] uppercase tracking-wide text-muted", children: "Quick ranges" }),
          /* @__PURE__ */ a("div", { className: "px-1.5 pb-2", children: yn.map((h) => /* @__PURE__ */ b("div", { className: "mb-1 last:mb-0", children: [
            /* @__PURE__ */ b("div", { className: "flex items-baseline gap-1.5 px-1 pb-0.5 pt-1", children: [
              /* @__PURE__ */ a("span", { className: "text-[0.7rem] font-medium uppercase tracking-wide text-muted", children: h.label }),
              /* @__PURE__ */ a("span", { className: "text-[0.65rem] text-muted", children: h.hint })
            ] }),
            /* @__PURE__ */ a(
              "div",
              {
                className: W(
                  "grid gap-x-1 gap-y-0.5",
                  o ? "grid-cols-2" : "grid-cols-5"
                ),
                children: vn.map((I) => {
                  const H = h.cells[I];
                  return o && H.length === 0 ? null : /* @__PURE__ */ b("div", { className: "min-w-0", children: [
                    !o && /* @__PURE__ */ a("div", { className: "px-2 pb-0.5 text-[0.65rem] uppercase tracking-wide text-muted/70", children: I }),
                    H.map((Z) => {
                      const re = !t && Z.expr === e;
                      return /* @__PURE__ */ b(
                        Ie,
                        {
                          variant: "ghost",
                          size: "sm",
                          className: W(
                            "w-full justify-start gap-1.5 px-2 text-xs font-normal",
                            o ? "h-10" : "h-8",
                            re && "bg-muted-bg font-medium text-fg"
                          ),
                          onClick: () => $({ from: Z.expr }),
                          children: [
                            /* @__PURE__ */ a(
                              qt,
                              {
                                size: 12,
                                className: W(
                                  "shrink-0 text-accent",
                                  !re && "invisible"
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
          ] }, h.id)) }),
          /* @__PURE__ */ a(Pt, { className: "my-0" }),
          /* @__PURE__ */ b("div", { className: "space-y-1.5 px-3 py-2.5", children: [
            /* @__PURE__ */ a("div", { className: "text-[0.7rem] uppercase tracking-wide text-muted", children: "Relative range" }),
            /* @__PURE__ */ b(
              "form",
              {
                className: "flex items-center gap-1.5",
                onSubmit: (h) => {
                  h.preventDefault(), m.trim() && S && !("error" in S) && $({ from: m.trim() });
                },
                children: [
                  /* @__PURE__ */ a(
                    wn,
                    {
                      "aria-label": "dashboard relative range",
                      className: "h-8 flex-1 text-xs",
                      placeholder: "last-3-months, this-quarter, now-4h…",
                      value: m,
                      onChange: (h) => f(h.target.value)
                    }
                  ),
                  /* @__PURE__ */ a(
                    Ie,
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
            S && ("error" in S ? /* @__PURE__ */ a("p", { className: "text-[0.7rem] text-danger", children: S.error }) : /* @__PURE__ */ a(
              "p",
              {
                className: "truncate text-[0.7rem] text-muted",
                title: S.text,
                children: S.text
              }
            ))
          ] }),
          /* @__PURE__ */ a(Pt, { className: "my-0" }),
          /* @__PURE__ */ b("div", { className: "space-y-2 px-3 py-2.5", children: [
            /* @__PURE__ */ a("div", { className: "text-[0.7rem] uppercase tracking-wide text-muted", children: "Absolute range" }),
            /* @__PURE__ */ b("div", { className: "flex items-center gap-1.5 text-xs text-muted", children: [
              /* @__PURE__ */ a(
                Lt,
                {
                  "aria-label": "dashboard range from",
                  dateStyle: s,
                  className: "flex-1",
                  value: C.from,
                  onChange: (h) => N((I) => ({ ...I, from: h }))
                }
              ),
              /* @__PURE__ */ a("span", { children: "to" }),
              /* @__PURE__ */ a(
                Lt,
                {
                  "aria-label": "dashboard range to",
                  dateStyle: s,
                  className: "flex-1",
                  value: C.to ?? "",
                  onChange: (h) => N((I) => ({ ...I, to: h }))
                }
              )
            ] }),
            D ? /* @__PURE__ */ a("p", { className: "text-[0.7rem] text-danger", children: "The start date must not be after the end date." }) : /* @__PURE__ */ a("p", { className: "text-[0.7rem] text-muted", children: "The end date is exclusive — it ends at the start of that day." }),
            /* @__PURE__ */ a(
              Ie,
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
    ) })
  ] });
}
const kn = 3e4;
function _o() {
  return new Xn({
    defaultOptions: {
      queries: {
        // A read either resolves or honestly denies — never retry it into a fabricated success (§9).
        retry: !1,
        // No window refocus refetch: the refresh TICK (in the key) is the freshness signal, not focus.
        refetchOnWindowFocus: !1,
        // Floor stale window; tick-keyed reads are effectively "fresh until the next tick" via the key.
        staleTime: 0,
        gcTime: kn
      }
    }
  });
}
function Ge(e) {
  return new Promise((t, n) => {
    e.oncomplete = e.onsuccess = () => t(e.result), e.onabort = e.onerror = () => n(e.error);
  });
}
function Mo(e, t) {
  let n;
  const r = () => {
    if (n)
      return n;
    const o = indexedDB.open(e);
    return o.onupgradeneeded = () => o.result.createObjectStore(t), n = Ge(o), n.then((s) => {
      s.onclose = () => n = void 0;
    }, () => {
      n = void 0;
    }), n;
  };
  return (o, s) => r().then((i) => s(i.transaction(t, o).objectStore(t)));
}
let Ye;
function mt() {
  return Ye || (Ye = Mo("keyval-store", "keyval")), Ye;
}
function Io(e, t = mt()) {
  return t("readonly", (n) => Ge(n.get(e)));
}
function Ao(e, t, n = mt()) {
  return n("readwrite", (r) => (r.put(t, e), Ge(r.transaction)));
}
function zo(e, t = mt()) {
  return t("readwrite", (n) => (n.delete(e), Ge(n.transaction)));
}
const Nn = "v1", Do = 7 * 24 * 60 * 6e4, Po = "quick-";
function Oo(e) {
  return `lb.quick-cache.${Nn}.${e}`;
}
function Lo(e) {
  const t = Oo(e);
  return {
    persistClient: (n) => Ao(t, n).catch(() => {
    }),
    restoreClient: () => Io(t).catch(() => {
    }),
    removeClient: () => zo(t).catch(() => {
    })
  };
}
const Fo = 250;
function Go(e, t) {
  const [n, r] = t.queryKey;
  return typeof n == "string" && n.startsWith(Po) && r === e && t.state.status === "success";
}
function jo(e, t) {
  if (!t) return () => {
  };
  const n = {
    queryClient: e,
    persister: Lo(t),
    maxAge: Do,
    // The buster is BELT AND BRACES with the versioned storage key: the key stops a stale store from
    // being found at all, this stops one that somehow was.
    buster: Nn,
    dehydrateOptions: { shouldDehydrateQuery: (l) => Go(t, l) }
  };
  let r = !1, o = null, s = null;
  const i = () => {
    r || o || (o = setTimeout(() => {
      o = null, r || tr(n);
    }, Fo));
  };
  return er(n).catch(() => {
  }).then(() => {
    r || (i(), s = e.getQueryCache().subscribe(i));
  }), () => {
    r = !0, o && clearTimeout(o), s == null || s();
  };
}
const ft = Ne(null);
function li() {
  const e = le(ft);
  if (e === null) throw new Error("useDashboardWs: no DashboardCacheProvider in tree");
  return e;
}
function ci() {
  return le(ft);
}
function Bo({ ws: e, children: t }) {
  const [n] = R(_o);
  return G(() => jo(n, e), [n, e]), /* @__PURE__ */ a(ft.Provider, { value: e, children: /* @__PURE__ */ a(Jn, { client: n, children: t }) });
}
const Qe = "[A-Za-z_][\\w.]*", Ft = new RegExp(
  // ${name} or ${name:format}
  `\\$\\{(${Qe})(?::[a-z]+)?\\}|\\[\\[(${Qe})(?::[a-z]+)?\\]\\]|\\$(${Qe})`,
  "g"
);
function Wo(e) {
  const t = [], n = /* @__PURE__ */ new Set();
  let r;
  for (Ft.lastIndex = 0; (r = Ft.exec(e)) !== null; ) {
    const o = r[1] ?? r[2] ?? r[3];
    o && !n.has(o) && (n.add(o), t.push(o));
  }
  return t;
}
const Ko = "__";
function qo(e) {
  return e.startsWith(Ko);
}
function Vo(e) {
  const t = [], n = /* @__PURE__ */ new Set(), r = (o) => {
    if (typeof o == "string")
      for (const s of Wo(o))
        n.has(s) || (n.add(s), t.push(s));
    else Array.isArray(o) ? o.forEach(r) : o && typeof o == "object" && Object.values(o).forEach(r);
  };
  return r(e), t;
}
const Uo = " / ";
function di(e, t) {
  var o;
  const n = {}, r = ((o = e == null ? void 0 : e.path) == null ? void 0 : o.filter((s) => s != null)) ?? [];
  return r.length > 0 && (n["__nav.label"] = r[r.length - 1], r.length > 1 && (n["__nav.parent.label"] = r[r.length - 2]), r.length > 2 && (n["__nav.parent.parent.label"] = r[r.length - 3]), n["__nav.path"] = r.join(Uo), (e == null ? void 0 : e.id) !== void 0 && (n["__nav.id"] = e.id)), t && (t.id !== void 0 && (n["__page.id"] = t.id), t.title !== void 0 && (n["__page.title"] = t.title), (t.id !== void 0 || t.title !== void 0) && (n["__page.ext"] = t.ext ?? "")), n;
}
const Gt = "scope";
function Ho(e) {
  let t = e;
  if (e && typeof e == "object" && !Array.isArray(e) && Gt in e) {
    const { [Gt]: n, ...r } = e;
    t = r;
  }
  return new Set(Vo(t).filter(qo));
}
function Cn(e, t) {
  if (!t || typeof t != "object" || Array.isArray(t)) return t;
  const { builtins: n, ...r } = t;
  if (!n || typeof n != "object" || Array.isArray(n))
    return t;
  const o = Ho(e), s = {};
  let i = !1;
  for (const [l, c] of Object.entries(
    n
  ))
    o.has(l) && (s[l] = c, i = !0);
  return i ? { ...r, builtins: s } : { ...r };
}
function ke(e) {
  if (Array.isArray(e)) return e.map(ke);
  if (e && typeof e == "object") {
    const t = {};
    for (const n of Object.keys(e).sort()) {
      const r = e[n];
      r !== void 0 && (t[n] = ke(r));
    }
    return t;
  }
  return e;
}
function ui(e, t) {
  return [
    "viz.query",
    e,
    ke({ ...t, scope: Cn(t, t.scope) })
  ];
}
function mi(e, t) {
  return [
    "viz.fetch",
    e,
    ke({ ...t, scope: Cn(t, t.scope) })
  ];
}
function fi(e, t) {
  return ["viz.shape", e, ke(t)];
}
function hi(e, t, n) {
  return ["flows.node_state", e, t, n];
}
function pi(e, t) {
  return ["series.read", e, t];
}
function bi(e) {
  return ["source-picker", e];
}
function Yo(e) {
  return ["datasource.list", e];
}
function Qo(e, t) {
  return {
    queryKey: Yo(e),
    queryFn: () => t(),
    staleTime: kn
  };
}
function gi(e, t, n) {
  return e.fetchQuery(Qo(t, n));
}
const Zo = 120;
function wi({
  refreshMs: e,
  cacheTtlS: t
}) {
  return typeof e == "number" && e > 0 ? Math.max(1, Math.round(e / 1e3)) : t === 0 ? 0 : typeof t == "number" && t > 0 ? Math.floor(t) : Zo;
}
function xi({ ws: e, children: t }) {
  return /* @__PURE__ */ a(Bo, { ws: e, children: t });
}
function vi(e, t) {
  const [n, r] = R(e);
  return G(() => {
    const o = setTimeout(() => r(e), t);
    return () => clearTimeout(o);
  }, [e, t]), n;
}
const Sn = Ne(!1), yi = Sn.Provider;
function ki() {
  return le(Sn);
}
const $n = Ne(0), Ni = $n.Provider;
function Ci() {
  return le($n);
}
const jt = 64, Xo = "viz.query_batch", Jo = "viz.query";
function Bt(e, t = {}) {
  const n = t.windowMs ?? 12, r = t.batchTool ?? Xo, o = t.singleTool ?? Jo;
  let s = [], i = null, l = !0;
  const c = () => {
    i === null && (i = setTimeout(d, n));
  }, d = () => {
    i = null;
    const g = s;
    if (s = [], g.length !== 0)
      for (let m = 0; m < g.length; m += jt)
        u(g.slice(m, m + jt));
  }, u = async (g) => {
    if (!l) {
      await p(g);
      return;
    }
    const m = es(g), f = { panels: g.map((y) => y.panel), now: 0 };
    m && (f.cache = m);
    try {
      const y = await e(r, f), C = (y == null ? void 0 : y.results) ?? [];
      g.forEach((N, _) => x(N, C[_]));
    } catch (y) {
      ts(y) && (l = !1), await p(g);
    }
  }, p = async (g) => {
    await Promise.all(
      g.map(async (m) => {
        try {
          const f = { panel: m.panel };
          m.cache && (f.cache = m.cache);
          const y = await e(o, f);
          m.resolve({ frames: (y == null ? void 0 : y.frames) ?? [], rows: y == null ? void 0 : y.rows });
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
      return new Promise((f, y) => {
        s.push({ panel: g, cache: m, resolve: f, reject: y }), c();
      });
    },
    get supported() {
      return l;
    }
  };
}
function es(e) {
  let t = 0;
  for (const n of e) n.cache && n.cache.ttl_s > t && (t = n.cache.ttl_s);
  return t > 0 ? { ttl_s: t } : void 0;
}
function ts(e) {
  const t = (e instanceof Error ? e.message : String(e ?? "")).toLowerCase();
  return /not.?found|unknown (tool|command|verb|method)|no such|unsupported|\b400\b|\b404\b|unrecognized/.test(
    t
  );
}
const Tn = Ne(null);
function Si() {
  return le(Tn);
}
function $i({ call: e, children: t }) {
  const n = Ce(), r = fe(() => {
    if (e) return Bt(e);
    if (!n)
      throw new Error(
        "VizBatchProvider: no `call` prop and no <KitProvider>. Give it one or the other."
      );
    const o = n.client;
    return Bt((s, i) => o.call(s, i));
  }, [e, n]);
  return /* @__PURE__ */ a(Tn.Provider, { value: r, children: t });
}
function ns(e) {
  return e.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function rs(e) {
  return /\.(publish|write|enqueue|command|set|send|record|create|delete|resolve|derive|simulate)$/.test(
    e
  );
}
function os(e, t) {
  const n = t.startsWith(`${e}.`) ? t.slice(e.length + 1) : t;
  return `${e} · ${n}`;
}
function ss(e) {
  return e.map((t) => ({
    id: `series:${t}`,
    group: "series",
    label: t,
    source: { tool: "series.read", args: { series: t } },
    writes: !1
  }));
}
function as(e) {
  return e.map((t) => ({
    id: `live:${t}`,
    group: "live",
    label: `${t} (live)`,
    source: { tool: "series.watch", args: { series: t } },
    writes: !1
  }));
}
function is(e) {
  var n, r, o;
  const t = [];
  for (const s of e) {
    if (!s.enabled) continue;
    const i = /* @__PURE__ */ new Set();
    (r = (n = s.ui) == null ? void 0 : n.scope) == null || r.forEach((l) => i.add(l)), (o = s.widgets) == null || o.forEach((l) => {
      var c;
      return (c = l.scope) == null ? void 0 : c.forEach((d) => i.add(d));
    });
    for (const l of i) {
      const c = rs(l);
      t.push({
        id: `ext:${s.ext}:${l}`,
        group: c ? "action" : "extension",
        label: os(s.ext, l),
        source: c ? void 0 : { tool: l, args: {} },
        action: c ? { tool: l, argsTemplate: {} } : void 0,
        writes: c
      });
    }
  }
  return t;
}
function ls(e) {
  const t = [];
  for (const n of e)
    if (n.enabled)
      for (const r of n.widgets ?? []) {
        const o = r.id ?? ns(r);
        t.push({
          id: `widget:${n.ext}/${o}`,
          group: "widget",
          label: `${n.ext} · ${r.label}`,
          icon: r.icon,
          viewKey: `ext:${n.ext}/${o}`,
          data: r.data === !0,
          writes: !1
        });
      }
  return t;
}
function cs(e, t) {
  const n = new Map(t.map((o) => [o.type, o])), r = [];
  for (const o of e)
    for (const s of o.nodes ?? []) {
      const i = n.get(s.type);
      if (i) {
        for (const l of i.inputs ?? [])
          r.push({
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
          r.push({
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
  return r;
}
function ds(e) {
  return e.map((t) => ({
    id: `rule:${t.id}`,
    group: "rules",
    label: t.name || t.id,
    source: { tool: "rules.run", args: { rule_id: t.id, route: !1 } },
    writes: !1,
    params: t.params ?? []
  }));
}
function us(e) {
  return e.map((t) => ({
    id: `query:${t.id}`,
    group: "queries",
    label: t.name || t.id,
    source: { tool: "query.run", args: { id: t.id } },
    writes: !1
  }));
}
const ms = "sql:query";
function fs() {
  return {
    id: ms,
    group: "sql",
    label: "SQL query (direct SurrealDB)",
    source: { tool: "store.query", args: { sql: "" } },
    writes: !1
  };
}
function hs(e) {
  return [
    ...ss(e.series ?? []),
    ...as(e.series ?? []),
    ...is(e.extensions ?? []),
    ...ls(e.extensions ?? []),
    ...cs(e.flows ?? [], e.descriptors ?? []),
    ...ds(e.rules ?? []),
    ...us(e.queries ?? []),
    fs()
  ];
}
function En(e) {
  return { id: e.id, source: e.source, action: e.action, viewKey: e.viewKey };
}
const Rn = {
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
}, ps = Object.keys(Rn);
function bs(e) {
  return e instanceof Error ? e.message : String(e);
}
async function gs(e, t) {
  const n = {}, r = (o, s) => {
    n[o] = s, t == null || t((i) => ({ ...i, [o]: s }));
  };
  return await Promise.all(
    ps.map(async (o) => {
      const s = await _n(e, o);
      s && r(o, s);
    })
  ), n;
}
async function _n(e, t) {
  const n = e[Rn[t]];
  if (n)
    try {
      return { status: "ready", data: await n() };
    } catch (r) {
      return { status: "denied", error: bs(r) };
    }
}
async function ws(e) {
  const t = await gs(e), n = ae(t.flowSummaries, []), r = ae(t.flowDescriptors, []), o = e.getFlow, s = o ? (await Promise.all(n.map((u) => o(u.id).catch(() => null)))).filter((u) => u != null) : [], i = ae(t.series, []), l = ae(t.extensions, []);
  ae(t.datasources, []);
  const c = ae(t.rules, []), d = ae(t.queries, []);
  return {
    entries: hs({
      series: i,
      extensions: l,
      flows: s,
      descriptors: r,
      rules: c,
      queries: d
    }),
    installed: l
  };
}
function ae(e, t) {
  return (e == null ? void 0 : e.status) === "ready" ? e.data : t;
}
function Ti(e, t) {
  const [n, r] = R({
    entries: [],
    installed: [],
    loading: !0
  }), o = V(e);
  return o.current = e, G(() => {
    const s = o.current;
    let i = !1;
    return r((l) => ({ ...l, loading: !0 })), (async () => {
      const { entries: l, installed: c } = await ws(s);
      i || r({ entries: l, installed: c, loading: !1 });
    })(), () => {
      i = !0;
    };
  }, [t]), n;
}
const xs = [
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
function Ei(e) {
  return e.map((t) => ({
    kind: "datasource",
    id: `datasource:${t.name}`,
    name: t.name,
    rowKind: t.kind,
    endpoint: t.endpoint
  }));
}
function Ri(e) {
  return e.tables.map((t) => ({
    kind: "table",
    id: `table:${t.name}`,
    table: t.name
  }));
}
function _i(e) {
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
function Mi(e) {
  return e.map((t) => ({ kind: "series", id: `series:${t}`, name: t }));
}
function vs(e) {
  return e.map((t) => ({ kind: "channel", id: `channel:${t.id}`, name: t.id }));
}
function ys(e) {
  return e.map((t) => ({
    kind: "insight",
    id: `insight:${t.id}`,
    title: t.title,
    severity: t.severity,
    status: t.status
  }));
}
function ks(e) {
  return e.map((t) => ({ kind: "inbox", id: `inbox:${t.id}`, channel: t.channel }));
}
function Ii(e) {
  return e.map((t) => ({
    kind: "query",
    id: `query:${t.id}`,
    name: t.name || t.id,
    target: t.target
  }));
}
function Ns(e) {
  const t = [];
  return e.listDatasources && t.push("datasources"), e.readSchema && t.push("schema"), e.listSeries && t.push("series"), e.listChannels && t.push("channels"), e.listInsights && t.push("insights"), e.listInbox && t.push("inbox"), e.listQueries && t.push("queries"), e.listExtensions && t.push("extensions"), e.listRules && t.push("rules"), e.listFlows && t.push("flowSummaries"), e.listFlowNodes && t.push("flowDescriptors"), t;
}
function Wt(e) {
  const t = {};
  for (const n of Ns(e))
    t[n] = { status: "idle" };
  return t;
}
function Ai(e, t) {
  const [n, r] = R(() => Wt(e)), o = V(e);
  o.current = e, G(() => {
    r(Wt(o.current));
  }, [t]);
  const s = B((i) => {
    r((l) => {
      const c = l[i];
      if (c && c.status !== "idle") return l;
      const d = { ...l, [i]: { status: "loading" } };
      return _n(o.current, i).then((u) => {
        u && r((p) => ({ ...p, [i]: u }));
      }), d;
    });
  }, []);
  return { sections: n, loadSection: s };
}
const Mn = [
  { group: "series", label: "Series" },
  { group: "live", label: "Live (Zenoh)" },
  { group: "sql", label: "Direct SurrealDB" },
  { group: "extension", label: "Installed extension" },
  { group: "widget", label: "Extension widgets" },
  { group: "flows", label: "Flows" },
  { group: "rules", label: "Rules" },
  { group: "queries", label: "Saved queries" }
], zi = [
  { group: "series", label: "Series" },
  { group: "live", label: "Live (Zenoh)" },
  { group: "sql", label: "Direct SurrealDB" },
  { group: "extension", label: "Installed extension" },
  { group: "action", label: "Action (control)" },
  { group: "widget", label: "Extension widgets" }
];
function Di({
  entries: e,
  value: t = "",
  onSelect: n,
  loading: r = !1,
  groups: o = Mn,
  "aria-label": s = "source",
  className: i
}) {
  const l = (c) => {
    const d = e.find((u) => u.id === c) ?? null;
    n(d ? En(d) : null);
  };
  return /* @__PURE__ */ a("label", { className: `sp-root${i ? ` ${i}` : ""}`, children: /* @__PURE__ */ b(
    "select",
    {
      className: "sp-select",
      "aria-label": s,
      value: t,
      onChange: (c) => l(c.target.value),
      children: [
        /* @__PURE__ */ a("option", { value: "", children: r ? "loading sources…" : "— pick a source —" }),
        o.map(({ group: c, label: d }) => /* @__PURE__ */ a(Cs, { entries: e, group: c, label: d }, c))
      ]
    }
  ) });
}
function Cs({
  entries: e,
  group: t,
  label: n
}) {
  const r = e.filter((o) => o.group === t);
  return r.length === 0 ? null : /* @__PURE__ */ a("optgroup", { label: n, children: r.map((o) => /* @__PURE__ */ a("option", { value: o.id, children: o.label }, o.id)) });
}
function Pi({
  entries: e,
  value: t = "",
  onSelect: n,
  onSelectEntry: r,
  loading: o = !1,
  groups: s = Mn,
  "aria-label": i = "source",
  className: l,
  placeholder: c = "Search sources…",
  autoFocus: d = !1
}) {
  const [u, p] = R(""), [x, g] = R(!1), [m, f] = R(0), y = V(null), C = e.find(($) => $.id === t) ?? null, N = fe(() => {
    const $ = u.trim().toLowerCase(), M = [];
    for (const { group: D, label: h } of s)
      e.filter(
        (H) => H.group === D && ($ === "" || H.label.toLowerCase().includes($) || h.toLowerCase().includes($))
      ).forEach((H, Z) => M.push({ entry: H, groupLabel: h, firstOfGroup: Z === 0 }));
    return M;
  }, [e, s, u]), _ = ($) => {
    n($ ? En($) : null), r == null || r($), g(!1), p("");
  }, S = ($) => {
    $.key === "ArrowDown" ? ($.preventDefault(), g(!0), f((M) => Math.min(M + 1, N.length - 1))) : $.key === "ArrowUp" ? ($.preventDefault(), f((M) => Math.max(M - 1, 0))) : $.key === "Enter" ? ($.preventDefault(), x && N[m] && _(N[m].entry)) : $.key === "Escape" && g(!1);
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
        value: x ? u : (C == null ? void 0 : C.label) ?? "",
        placeholder: o ? "loading sources…" : C ? C.label : c,
        onFocus: () => g(!0),
        onBlur: () => setTimeout(() => g(!1), 120),
        onChange: ($) => {
          p($.target.value), g(!0), f(0);
        },
        onKeyDown: S
      }
    ),
    x && /* @__PURE__ */ b("ul", { className: "sp-combo-list", role: "listbox", "aria-label": i, ref: y, children: [
      N.length === 0 && /* @__PURE__ */ a("li", { className: "sp-combo-empty", children: "No matching sources" }),
      N.map(($, M) => /* @__PURE__ */ b("li", { role: "presentation", children: [
        $.firstOfGroup && /* @__PURE__ */ a("div", { className: "sp-combo-group", children: $.groupLabel }),
        /* @__PURE__ */ a(
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
function Ss({ spec: e, state: t, onOpen: n, defaultOpen: r, children: o }) {
  const [s, i] = R(r ?? t.status !== "idle"), l = t.status === "idle", c = (d) => {
    i(d), d && l && n && n();
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
        /* @__PURE__ */ a(he.Content, { className: "sp-catalog-section-content", children: $s(t, o) })
      ]
    }
  );
}
function $s(e, t) {
  return e.status === "idle" ? /* @__PURE__ */ a("p", { className: "sp-catalog-idle", children: "Expand to load." }) : e.status === "loading" ? /* @__PURE__ */ a("div", { "aria-label": "loading", className: "sp-catalog-skeleton" }) : e.status === "denied" ? /* @__PURE__ */ a("p", { "aria-label": "denied", className: "sp-catalog-denied", children: "Not permitted." }) : t(e.data);
}
function me({ children: e }) {
  return /* @__PURE__ */ a("p", { className: "sp-catalog-empty", children: e });
}
function Ts({ schema: e, onSelect: t }) {
  return /* @__PURE__ */ a("ul", { "aria-label": "schema browser", className: "sp-catalog-tree", children: e.tables.map((n) => /* @__PURE__ */ a(Es, { name: n.name, columns: n.columns.map((r) => r.name), onSelect: t }, n.name)) });
}
function Es({
  name: e,
  columns: t,
  onSelect: n
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
          onClick: () => n({ kind: "table", id: `table:${e}`, table: e }),
          children: [
            /* @__PURE__ */ a(Bn, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
            /* @__PURE__ */ a("span", { className: "sp-catalog-tree-table-name", children: e })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ a(he.Content, { className: "sp-catalog-tree-content", children: /* @__PURE__ */ a("ul", { className: "sp-catalog-tree-columns", children: t.length === 0 ? /* @__PURE__ */ a("li", { className: "sp-catalog-tree-no-columns", children: "no columns" }) : t.map((r) => /* @__PURE__ */ a("li", { children: /* @__PURE__ */ a(
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
function Oi({
  sections: e,
  onSelect: t,
  onLoadSection: n,
  sectionSpecs: r = xs,
  className: o
}) {
  return /* @__PURE__ */ a("div", { "aria-label": "data explorer", className: `sp-root sp-catalog${o ? ` ${o}` : ""}`, children: r.map((s) => {
    const i = e[s.kind];
    return i ? /* @__PURE__ */ a(
      Ss,
      {
        spec: s,
        state: i,
        onOpen: n ? () => n(s.kind) : void 0,
        children: (l) => Rs(s.kind, l, t)
      },
      s.kind
    ) : null;
  }) });
}
function Rs(e, t, n) {
  switch (e) {
    case "datasources": {
      const r = t ?? [];
      return r.length === 0 ? /* @__PURE__ */ a(me, { children: "No external datasources registered." }) : /* @__PURE__ */ a("ul", { className: "sp-catalog-list", children: r.map((o) => /* @__PURE__ */ a("li", { children: /* @__PURE__ */ b(
        "button",
        {
          type: "button",
          "aria-label": `insert datasource ${o.name}`,
          className: "sp-catalog-row sp-catalog-row-datasource",
          onClick: () => n({
            kind: "datasource",
            id: `datasource:${o.name}`,
            name: o.name,
            rowKind: o.kind,
            endpoint: o.endpoint
          }),
          children: [
            /* @__PURE__ */ b("span", { className: "sp-catalog-row-label", children: [
              /* @__PURE__ */ a(qn, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
              o.name
            ] }),
            /* @__PURE__ */ a("span", { className: "sp-catalog-row-sub", children: o.endpoint ? `${o.kind} · ${o.endpoint}` : o.kind })
          ]
        }
      ) }, o.name)) });
    }
    case "schema": {
      const r = t;
      return r.tables.length === 0 ? /* @__PURE__ */ a(me, { children: "No local tables yet." }) : /* @__PURE__ */ a(Ts, { schema: r, onSelect: n });
    }
    case "series": {
      const r = t ?? [];
      return r.length === 0 ? /* @__PURE__ */ a(me, { children: "No series in this workspace." }) : /* @__PURE__ */ a("ul", { className: "sp-catalog-list", children: r.map((o) => /* @__PURE__ */ a("li", { children: /* @__PURE__ */ b(
        "button",
        {
          type: "button",
          "aria-label": `insert series ${o}`,
          className: "sp-catalog-row sp-catalog-row-series",
          onClick: () => n({ kind: "series", id: `series:${o}`, name: o }),
          children: [
            /* @__PURE__ */ a(Kn, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
            o
          ]
        }
      ) }, o)) });
    }
    case "channels": {
      const r = t ?? [];
      return r.length === 0 ? /* @__PURE__ */ a(me, { children: "No channels registered." }) : /* @__PURE__ */ a("ul", { className: "sp-catalog-list", children: r.map((o) => {
        const s = vs([o])[0];
        return /* @__PURE__ */ a("li", { children: /* @__PURE__ */ b(
          "button",
          {
            type: "button",
            "aria-label": `insert channel ${o.id}`,
            className: "sp-catalog-row sp-catalog-row-channel",
            onClick: () => n(s),
            children: [
              /* @__PURE__ */ a(Wn, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
              o.id
            ]
          }
        ) }, s.id);
      }) });
    }
    case "insights": {
      const r = t ?? [];
      return r.length === 0 ? /* @__PURE__ */ a(me, { children: "No insights in this workspace." }) : /* @__PURE__ */ a("ul", { className: "sp-catalog-list", children: r.map((o) => {
        const s = ys([o])[0];
        return /* @__PURE__ */ a("li", { children: /* @__PURE__ */ b(
          "button",
          {
            type: "button",
            "aria-label": `insert insight ${o.title}`,
            className: "sp-catalog-row sp-catalog-row-insight",
            onClick: () => n(s),
            children: [
              /* @__PURE__ */ b("span", { className: "sp-catalog-row-label", children: [
                /* @__PURE__ */ a(Je, { "aria-hidden": "true", className: "sp-catalog-icon", size: 12 }),
                o.title
              ] }),
              (o.severity || o.status) && /* @__PURE__ */ a("span", { className: "sp-catalog-row-sub", children: [o.severity, o.status].filter(Boolean).join(" · ") })
            ]
          }
        ) }, s.id);
      }) });
    }
    case "inbox": {
      const r = t ?? [];
      return r.length === 0 ? /* @__PURE__ */ a(me, { children: "No items in this inbox." }) : /* @__PURE__ */ a("ul", { className: "sp-catalog-list", children: r.map((o) => {
        const s = ks([o])[0];
        return /* @__PURE__ */ a("li", { children: /* @__PURE__ */ b(
          "button",
          {
            type: "button",
            "aria-label": `insert inbox item ${o.id}`,
            className: "sp-catalog-row sp-catalog-row-inbox",
            onClick: () => n(s),
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
const _s = ["info", "warning", "critical"];
function Li(e) {
  return _s.indexOf(e);
}
function Ms(e) {
  return e === "critical" ? "destructive" : e === "warning" ? "warning" : "accent-2";
}
function Fi(e) {
  switch (e) {
    case "critical":
      return "hsl(var(--destructive))";
    case "warning":
      return "hsl(var(--warning))";
    default:
      return "hsl(var(--accent-2))";
  }
}
function Is(e) {
  return e === "open" ? "default" : e === "acked" ? "warning" : "success";
}
function As(e, t = Date.now()) {
  const n = Math.max(1, Math.floor((t - e) / 1e3));
  if (n < 60) return `${n}s ago`;
  const r = Math.floor(n / 60);
  if (r < 60) return n % 60 ? `${r}m ${n % 60}s ago` : `${r}m ago`;
  const o = Math.floor(r / 60);
  return o < 24 ? r % 60 ? `${o}h ${r % 60}m ago` : `${o}h ago` : `${Math.floor(o / 24)}d ago`;
}
function zs(e) {
  const t = `${e.kind}:${e.ref}`;
  return e.run ? `${t} · run:${e.run}` : t;
}
function Ds(e, t) {
  const [n, r] = R([]), [o, s] = R(null), [i, l] = R(!1), [c, d] = R(null), [u, p] = R(null), [x, g] = R(t), m = V(e);
  m.current = e;
  const f = B(async () => {
    l(!0);
    try {
      const S = await m.current.list({ ...x, cursor: void 0 });
      r(S.items), p(S.next ?? null), s(null);
    } catch (S) {
      s(S instanceof Error ? S.message : String(S));
    } finally {
      l(!1);
    }
  }, [x]), y = B(async () => {
    if (u) {
      l(!0);
      try {
        const S = await m.current.list({ ...x, cursor: u });
        r(($) => {
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
  const N = B((S) => {
    g(S);
  }, []), _ = B(
    async (S, $) => {
      d(S);
      try {
        $ === "ack" ? await m.current.ack(S) : await m.current.resolve(S), await f();
      } catch (M) {
        s(M instanceof Error ? M.message : String(M));
      } finally {
        d(null);
      }
    },
    [f]
  );
  return {
    items: n,
    error: o,
    loading: i,
    actingOn: c,
    nextCursor: u,
    refresh: f,
    loadMore: y,
    setFilter: N,
    act: _
  };
}
function Gi(e, t, n = 50) {
  const [r, o] = R(null), [s, i] = R(null), [l, c] = R(null), [d, u] = R(!0), [p, x] = R(null), [g, m] = R(0), f = V(e);
  f.current = e, G(() => {
    let N = !1;
    return (async () => {
      c(null), u(!0);
      try {
        const [_, S] = await Promise.all([
          f.current.get(t),
          f.current.occurrences(t, void 0, n)
        ]);
        if (N) return;
        o(_), i(S);
      } catch (_) {
        if (N) return;
        c(_ instanceof Error ? _.message : String(_));
      } finally {
        N || u(!1);
      }
    })(), () => {
      N = !0;
    };
  }, [t, n, g]);
  const y = B(() => m((N) => N + 1), []), C = B(
    async (N) => {
      x(N), c(null);
      try {
        N === "ack" ? await f.current.ack(t) : await f.current.resolve(t), m((_) => _ + 1);
      } catch (_) {
        c(_ instanceof Error ? _.message : String(_));
      } finally {
        x(null);
      }
    },
    [t]
  );
  return { insight: r, occurrences: s, error: l, loading: d, actingOn: p, refresh: y, act: C };
}
function Ps({ severity: e }) {
  return /* @__PURE__ */ a("span", { className: `ins-badge tone-${Ms(e)}`, children: e });
}
function Os({ status: e }) {
  return /* @__PURE__ */ a("span", { className: `ins-badge tone-${Is(e)}`, children: e });
}
function Ls({
  insight: e,
  selected: t,
  onSelect: n,
  showStatus: r = !0,
  showSeverity: o = !1,
  actions: s,
  now: i
}) {
  const l = e.severity === "critical" ? "is-critical" : e.severity === "warning" ? "is-warning" : "is-info", c = /* @__PURE__ */ b(Ln, { children: [
    /* @__PURE__ */ a("span", { className: `ins-dot ${l}`, role: "img", "aria-label": `severity: ${e.severity}` }),
    /* @__PURE__ */ b("span", { className: "ins-row-main", children: [
      /* @__PURE__ */ a("span", { className: "ins-row-title", children: e.title }),
      /* @__PURE__ */ b("span", { className: "ins-row-meta", children: [
        zs(e.origin),
        " · ×",
        e.count
      ] })
    ] }),
    /* @__PURE__ */ b("span", { className: "ins-row-side", children: [
      o && /* @__PURE__ */ a(Ps, { severity: e.severity }),
      r && /* @__PURE__ */ a(Os, { status: e.status }),
      /* @__PURE__ */ a("span", { className: "ins-time", children: As(e.last_ts, i) })
    ] })
  ] });
  return /* @__PURE__ */ b("li", { children: [
    n ? /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        className: `ins-row${t ? " is-selected" : ""}`,
        "aria-selected": t,
        "aria-label": `select insight ${e.dedup_key}`,
        onClick: () => n(e.id),
        children: c
      }
    ) : /* @__PURE__ */ a("div", { className: `ins-row${t ? " is-selected" : ""}`, children: c }),
    s
  ] });
}
function Fs({
  insight: e,
  actingOn: t = null,
  onAck: n,
  onResolve: r,
  onDismiss: o
}) {
  const s = t !== null;
  return /* @__PURE__ */ b("div", { className: "ins-actions", children: [
    o && /* @__PURE__ */ b("button", { type: "button", className: "ins-btn", onClick: o, disabled: s, children: [
      /* @__PURE__ */ a(Ht, { size: 13 }),
      "Dismiss"
    ] }),
    e.status === "open" && n && /* @__PURE__ */ b("button", { type: "button", className: "ins-btn", onClick: n, disabled: s, children: [
      t === "ack" ? /* @__PURE__ */ a(ze, { size: 13, className: "ins-spin" }) : /* @__PURE__ */ a(qt, { size: 13 }),
      "Ack"
    ] }),
    e.status !== "resolved" && r && /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        className: "ins-btn is-primary",
        onClick: r,
        disabled: s,
        children: [
          t === "resolve" ? /* @__PURE__ */ a(ze, { size: 13, className: "ins-spin" }) : /* @__PURE__ */ a(kt, { size: 13 }),
          "Resolve"
        ]
      }
    ),
    e.status === "resolved" && /* @__PURE__ */ b("span", { className: "ins-badge tone-success", children: [
      /* @__PURE__ */ a(kt, { size: 12 }),
      " Resolved"
    ] })
  ] });
}
const Gs = { limit: 20 };
function In({
  client: e,
  filter: t = Gs,
  title: n = "Insights",
  interactive: r = !1,
  showRefresh: o = !0,
  paged: s = !0,
  onSelect: i,
  now: l
}) {
  const c = Ds(e, t), [d, u] = R(/* @__PURE__ */ new Set()), [p, x] = R(null);
  function g(f, y) {
    x(y), c.act(f, y).finally(() => x(null));
  }
  const m = c.items.filter((f) => !d.has(f.id));
  return /* @__PURE__ */ b("div", { className: "ins-root", children: [
    /* @__PURE__ */ b("div", { className: "ins-header", children: [
      /* @__PURE__ */ b("h3", { className: "ins-header-title", children: [
        /* @__PURE__ */ a(Je, { size: 15 }),
        n,
        m.length > 0 && /* @__PURE__ */ b("span", { className: "ins-header-count", children: [
          "(",
          m.length,
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
          children: /* @__PURE__ */ a(ze, { size: 13, className: c.loading ? "ins-spin" : void 0 })
        }
      ) })
    ] }),
    c.error && m.length === 0 ? /* @__PURE__ */ a("div", { className: "ins-error", role: "alert", children: c.error }) : m.length === 0 ? /* @__PURE__ */ b("div", { className: "ins-empty", children: [
      /* @__PURE__ */ a(Je, { size: 16, className: c.loading ? "ins-spin" : void 0 }),
      c.loading ? "Loading insights…" : "No insights match this filter."
    ] }) : /* @__PURE__ */ a("ul", { className: "ins-list", children: m.map((f) => /* @__PURE__ */ a(
      Ls,
      {
        insight: f,
        onSelect: i,
        now: l,
        actions: r ? /* @__PURE__ */ a(
          Fs,
          {
            insight: f,
            actingOn: c.actingOn === f.id ? p : null,
            onAck: f.status === "open" ? () => g(f.id, "ack") : void 0,
            onResolve: () => g(f.id, "resolve"),
            onDismiss: () => u((y) => new Set(y).add(f.id))
          }
        ) : void 0
      },
      f.id
    )) }),
    s && c.nextCursor !== null && m.length > 0 && /* @__PURE__ */ a("div", { className: "ins-more", children: /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        className: "ins-btn",
        onClick: () => void c.loadMore(),
        disabled: c.loading,
        "aria-label": "Load more insights",
        children: [
          /* @__PURE__ */ a(ze, { size: 13, className: c.loading ? "ins-spin" : void 0 }),
          "Load more"
        ]
      }
    ) })
  ] });
}
function ji(e) {
  return /* @__PURE__ */ a(In, { ...e, interactive: !1 });
}
function Bi(e) {
  return /* @__PURE__ */ a(In, { ...e, interactive: !0 });
}
function Wi(e) {
  const t = [...e];
  function n() {
    return [...t].sort((r, o) => o.last_ts - r.last_ts || o.id.localeCompare(r.id));
  }
  return {
    async list(r) {
      let o = n();
      r.status && (o = o.filter((d) => d.status === r.status)), r.severity && (o = o.filter((d) => d.severity === r.severity)), r.origin_ref && (o = o.filter((d) => d.origin.ref.includes(r.origin_ref)));
      const s = r.limit ?? 50, i = o.slice(0, s), l = o.length > s ? { ts: i[i.length - 1].last_ts, id: i[i.length - 1].id } : void 0;
      return { items: i.map(({ evidence: d, ...u }) => u), next: l };
    },
    async get(r) {
      return t.find((o) => o.id === r) ?? null;
    },
    async ack(r) {
      const o = t.find((s) => s.id === r);
      o && (o.status = "acked");
    },
    async resolve(r) {
      const o = t.find((s) => s.id === r);
      o && (o.status = "resolved");
    },
    async occurrences() {
      return { items: [] };
    }
  };
}
function Ki() {
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
  return ut(Fe(e));
}
function js({ ...e }) {
  return /* @__PURE__ */ a(j.Root, { ...e });
}
function Bs({ container: e, ...t }) {
  const n = Le();
  return /* @__PURE__ */ a(j.Portal, { container: e ?? n ?? void 0, ...t });
}
const Ws = z.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ a(
    j.Overlay,
    {
      ref: r,
      className: U("fixed inset-0 z-50 bg-black/50", t),
      ...n
    }
  );
}), Ks = z.forwardRef(function({ className: t, children: n, ...r }, o) {
  return /* @__PURE__ */ b(Bs, { children: [
    /* @__PURE__ */ a(Ws, {}),
    /* @__PURE__ */ a(
      j.Content,
      {
        ref: o,
        className: U(
          "lb-panel fixed inset-y-0 right-0 z-50 flex h-full max-w-[95vw] flex-col border-l border-lbp-border bg-lbp-panel font-sans text-lbp-fg shadow-2xl outline-none",
          t
        ),
        ...r,
        children: n
      }
    )
  ] });
}), qs = z.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ a(j.Title, { ref: r, className: U("text-base font-semibold text-lbp-fg", t), ...n });
}), Vs = z.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ a(j.Description, { ref: r, className: U("text-xs text-lbp-muted", t), ...n });
});
function Us({ resizable: e, className: t, "aria-label": n = "resize panel" }) {
  return /* @__PURE__ */ a(
    "div",
    {
      role: "separator",
      "aria-orientation": "vertical",
      "aria-label": n,
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
function Hs({ initial: e, min: t, max: n, step: r = 24 }) {
  const o = B((m) => Math.min(n, Math.max(t, m)), [t, n]), [s, i] = R(() => o(e)), [l, c] = R(!1), d = V(null), u = B(
    (m) => {
      d.current = { x: m.clientX, w: s }, c(!0), m.currentTarget.setPointerCapture(m.pointerId), m.preventDefault();
    },
    [s]
  ), p = B(
    (m) => {
      if (!d.current) return;
      const f = d.current.x - m.clientX;
      i(o(d.current.w + f));
    },
    [o]
  ), x = B((m) => {
    d.current = null, c(!1), m.currentTarget.hasPointerCapture(m.pointerId) && m.currentTarget.releasePointerCapture(m.pointerId);
  }, []), g = B(
    (m) => {
      m.key === "ArrowLeft" ? (i((f) => o(f + r)), m.preventDefault()) : m.key === "ArrowRight" && (i((f) => o(f - r)), m.preventDefault());
    },
    [o, r]
  );
  return { width: s, dragging: l, handleProps: { onPointerDown: u, onPointerMove: p, onPointerUp: x, onKeyDown: g } };
}
function qi({
  open: e,
  onOpenChange: t,
  title: n,
  description: r,
  headerAside: o,
  footer: s,
  "aria-label": i,
  initialWidth: l = 720,
  minWidth: c = 360,
  maxWidth: d = 1200,
  className: u,
  children: p
}) {
  const x = Hs({ initial: l, min: c, max: d });
  return /* @__PURE__ */ a(js, { open: e, onOpenChange: t, children: /* @__PURE__ */ b(
    Ks,
    {
      "aria-label": i,
      style: { width: x.width },
      className: U(x.dragging && "select-none", u),
      children: [
        /* @__PURE__ */ a(Us, { resizable: x }),
        /* @__PURE__ */ b("header", { className: "flex items-start justify-between gap-3 border-b border-lbp-border bg-lbp-secondary px-4 py-3", children: [
          /* @__PURE__ */ b("div", { className: "min-w-0", children: [
            /* @__PURE__ */ a(qs, { children: n }),
            r ? /* @__PURE__ */ a(Vs, { className: "mt-0.5", children: r }) : null
          ] }),
          o ? /* @__PURE__ */ a("div", { className: "shrink-0", children: o }) : null
        ] }),
        /* @__PURE__ */ a("div", { className: "min-h-0 flex-1 overflow-auto", children: p }),
        s ? /* @__PURE__ */ a("footer", { className: "flex items-center justify-end gap-2 border-t border-lbp-border bg-lbp-secondary px-4 py-3", children: s }) : null
      ]
    }
  ) });
}
function Vi({ title: e, aside: t, className: n, children: r }) {
  return /* @__PURE__ */ b("section", { className: U("mb-4 last:mb-0", n), children: [
    /* @__PURE__ */ b("div", { className: "mb-1.5 flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ a("div", { className: "text-[10px] font-semibold uppercase tracking-wide text-lbp-muted", children: e }),
      t
    ] }),
    r
  ] });
}
function Ui({ columns: e, rows: t, empty: n = "—", className: r }) {
  return t.length === 0 ? /* @__PURE__ */ a("div", { className: "py-1 font-mono text-[11px] text-lbp-muted", children: n }) : /* @__PURE__ */ b("table", { className: U("w-full border-collapse font-mono text-[11px] tabular-nums", r), children: [
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
function Hi({ k: e, v: t, keyWidth: n = 80, className: r }) {
  return /* @__PURE__ */ b("div", { className: U("flex gap-2 py-[2px] font-mono text-[11px]", r), children: [
    /* @__PURE__ */ a("span", { style: { width: n }, className: "shrink-0 text-lbp-muted", children: e }),
    /* @__PURE__ */ a("span", { className: "min-w-0 break-words text-lbp-fg", children: t })
  ] });
}
function An(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  for (const r of e)
    n.has(r.group) || (n.set(r.group, []), t.push(r.group)), n.get(r.group).push(r);
  return t.map((r) => ({ label: r, items: n.get(r) }));
}
const Ze = 768;
function Ys() {
  const [e, t] = z.useState(void 0);
  return z.useEffect(() => {
    if (!window.matchMedia) {
      t(window.innerWidth < Ze);
      return;
    }
    const n = window.matchMedia(`(max-width: ${Ze - 1}px)`), r = () => t(window.innerWidth < Ze);
    return n.addEventListener("change", r), r(), () => n.removeEventListener("change", r);
  }, []), !!e;
}
function A(...e) {
  return ut(Fe(e));
}
const Qs = lt(
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
), Zs = z.forwardRef(function({ className: t, variant: n, size: r, asChild: o = !1, ...s }, i) {
  return /* @__PURE__ */ a(o ? ot : "button", { ref: i, className: A(Qs({ variant: n, size: r, className: t })), ...s });
});
function Xs({ ...e }) {
  return /* @__PURE__ */ a(j.Root, { ...e });
}
function Js({ container: e, ...t }) {
  const n = Le();
  return /* @__PURE__ */ a(j.Portal, { container: e ?? n ?? void 0, ...t });
}
const ea = z.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ a(
    j.Overlay,
    {
      ref: r,
      className: A("fixed inset-0 z-50 bg-black/50 animate-in fade-in-0", t),
      ...n
    }
  );
}), ta = z.forwardRef(function({ className: t, children: n, side: r = "right", ...o }, s) {
  return /* @__PURE__ */ b(Js, { children: [
    /* @__PURE__ */ a(ea, {}),
    /* @__PURE__ */ b(
      j.Content,
      {
        ref: s,
        className: A(
          "fixed z-50 flex flex-col gap-4 bg-nr-bg text-nr-fg shadow-lg transition ease-in-out animate-in",
          r === "right" && "inset-y-0 right-0 h-full w-3/4 border-l border-nr-border sm:max-w-sm",
          r === "left" && "inset-y-0 left-0 h-full w-3/4 border-r border-nr-border sm:max-w-sm",
          r === "top" && "inset-x-0 top-0 h-auto border-b border-nr-border",
          r === "bottom" && "inset-x-0 bottom-0 h-auto border-t border-nr-border",
          t
        ),
        ...o,
        children: [
          n,
          /* @__PURE__ */ b(j.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nr-accent/25", children: [
            /* @__PURE__ */ a(Ht, { className: "h-4 w-4" }),
            /* @__PURE__ */ a("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
});
function na({ className: e, ...t }) {
  return /* @__PURE__ */ a("div", { className: A("flex flex-col gap-1.5 p-4", e), ...t });
}
const ra = z.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ a(j.Title, { ref: r, className: A("font-semibold text-nr-fg", t), ...n });
}), oa = z.forwardRef(function({ className: t, ...n }, r) {
  return /* @__PURE__ */ a(j.Description, { ref: r, className: A("text-sm text-nr-muted", t), ...n });
});
function sa({
  delayDuration: e = 0,
  ...t
}) {
  return /* @__PURE__ */ a(ye.Provider, { delayDuration: e, ...t });
}
function aa({ ...e }) {
  return /* @__PURE__ */ a(ye.Root, { ...e });
}
function ia({ ...e }) {
  return /* @__PURE__ */ a(ye.Trigger, { ...e });
}
function la({
  className: e,
  sideOffset: t = 6,
  ...n
}) {
  const r = Le();
  return /* @__PURE__ */ a(ye.Portal, { container: r ?? void 0, children: /* @__PURE__ */ a(
    ye.Content,
    {
      sideOffset: t,
      className: A(
        "z-50 overflow-hidden rounded-md border border-nr-border bg-nr-panel px-2.5 py-1.5 text-xs text-nr-fg shadow-md animate-in fade-in-0 zoom-in-95",
        e
      ),
      ...n
    }
  ) });
}
const ca = "nav_rail_state", da = 60 * 60 * 24 * 7, ua = "16rem", ma = "18rem", fa = "3.5rem", ha = "b", zn = z.createContext(null);
function J() {
  const e = z.useContext(zn);
  if (!e)
    throw new Error("useSidebar must be used within a SidebarProvider.");
  return e;
}
function pa({
  defaultOpen: e = !0,
  open: t,
  onOpenChange: n,
  className: r,
  style: o,
  children: s,
  ...i
}) {
  const l = Ys(), [c, d] = z.useState(!1), [u, p] = z.useState(e), x = t ?? u, g = z.useCallback(
    (C) => {
      const N = typeof C == "function" ? C(x) : C;
      n ? n(N) : p(N), document.cookie = `${ca}=${N}; path=/; max-age=${da}`;
    },
    [x, n]
  ), m = z.useCallback(() => l ? d((C) => !C) : g((C) => !C), [l, g]);
  z.useEffect(() => {
    const C = (N) => {
      N.key === ha && (N.metaKey || N.ctrlKey) && (N.preventDefault(), m());
    };
    return window.addEventListener("keydown", C), () => window.removeEventListener("keydown", C);
  }, [m]);
  const f = x ? "expanded" : "collapsed", y = z.useMemo(
    () => ({
      state: f,
      open: x,
      setOpen: g,
      isMobile: l,
      openMobile: c,
      setOpenMobile: d,
      toggleSidebar: m
    }),
    [f, x, g, l, c, m]
  );
  return /* @__PURE__ */ a(zn.Provider, { value: y, children: /* @__PURE__ */ a(sa, { delayDuration: 0, children: /* @__PURE__ */ a(
    "div",
    {
      "data-slot": "sidebar-wrapper",
      style: {
        "--sidebar-width": ua,
        "--sidebar-width-icon": fa,
        ...o
      },
      className: A("group/sidebar-wrapper flex h-full min-h-0 w-full", r),
      ...i,
      children: s
    }
  ) }) });
}
function ba({
  side: e = "left",
  variant: t = "sidebar",
  collapsible: n = "offcanvas",
  className: r,
  children: o,
  ...s
}) {
  const { isMobile: i, state: l, openMobile: c, setOpenMobile: d } = J(), u = l === "collapsed" && n !== "none", p = t === "floating" || t === "inset";
  if (n === "none")
    return /* @__PURE__ */ a("div", { className: A("flex h-full w-[var(--sidebar-width)] flex-col bg-nr-panel text-nr-fg", r), ...s, children: o });
  if (i)
    return /* @__PURE__ */ a(Xs, { open: c, onOpenChange: d, ...s, children: /* @__PURE__ */ b(
      ta,
      {
        "data-sidebar": "sidebar",
        "data-mobile": "true",
        className: "w-[var(--sidebar-width)] bg-nr-panel p-0 text-nr-fg [&>button]:hidden",
        style: { "--sidebar-width": ma },
        side: e,
        children: [
          /* @__PURE__ */ b(na, { className: "sr-only", children: [
            /* @__PURE__ */ a(ra, { children: "Sidebar" }),
            /* @__PURE__ */ a(oa, { children: "Displays the mobile sidebar." })
          ] }),
          /* @__PURE__ */ a("div", { className: "flex h-full w-full flex-col", children: o })
        ]
      }
    ) });
  const x = "w-[var(--sidebar-width)]", g = p ? "w-[calc(var(--sidebar-width-icon)+1rem)]" : "w-[var(--sidebar-width-icon)]";
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
        /* @__PURE__ */ a(
          "div",
          {
            "data-slot": "sidebar-gap",
            className: A(
              "relative h-full bg-transparent transition-[width] duration-200 ease-linear",
              u && n === "offcanvas" ? "w-0" : u ? g : x
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
              u && n === "offcanvas" && e === "left" && "-left-[var(--sidebar-width)]",
              u && n === "offcanvas" && e === "right" && "-right-[var(--sidebar-width)]",
              u && n === "icon" ? g : x,
              p && "p-2",
              !p && "border-r border-nr-border",
              r
            ),
            ...s,
            children: /* @__PURE__ */ a(
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
function ga({
  className: e,
  onClick: t,
  ...n
}) {
  const { toggleSidebar: r } = J();
  return /* @__PURE__ */ b(
    Zs,
    {
      "data-sidebar": "trigger",
      variant: "ghost",
      size: "icon",
      className: A("h-8 w-8 text-nr-muted hover:bg-nr-bg hover:text-nr-fg", e),
      onClick: (o) => {
        t == null || t(o), r();
      },
      ...n,
      children: [
        /* @__PURE__ */ a(Vn, { className: "h-4 w-4" }),
        /* @__PURE__ */ a("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
}
function wa({ className: e, ...t }) {
  const { toggleSidebar: n } = J();
  return /* @__PURE__ */ a(
    "button",
    {
      "data-sidebar": "rail",
      "aria-label": "Toggle Sidebar",
      tabIndex: -1,
      onClick: n,
      title: "Toggle Sidebar",
      className: A(
        "absolute inset-y-0 -right-3 z-20 hidden w-4 transition-all after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 hover:after:bg-nr-border sm:flex",
        e
      ),
      ...t
    }
  );
}
function xa({ className: e, ...t }) {
  const { state: n } = J();
  return /* @__PURE__ */ a(
    "div",
    {
      "data-sidebar": "header",
      className: A("flex flex-col gap-2 p-2", n === "collapsed" && "items-center px-0", e),
      ...t
    }
  );
}
function va({ className: e, ...t }) {
  const { state: n } = J();
  return /* @__PURE__ */ a(
    "div",
    {
      "data-sidebar": "footer",
      className: A("flex flex-col gap-2 p-2", n === "collapsed" && "items-center px-0", e),
      ...t
    }
  );
}
function ya({ className: e, ...t }) {
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
function ka({ className: e, ...t }) {
  const { state: n } = J();
  return /* @__PURE__ */ a(
    "div",
    {
      "data-sidebar": "group",
      className: A("relative flex w-full min-w-0 flex-col p-2", n === "collapsed" && "items-center px-0", e),
      ...t
    }
  );
}
function Na({ className: e, ...t }) {
  const { state: n } = J();
  return /* @__PURE__ */ a(
    "div",
    {
      "data-sidebar": "group-label",
      className: A(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-nr-muted transition-[margin,opacity] duration-200",
        n === "collapsed" && "-mt-8 opacity-0",
        e
      ),
      ...t
    }
  );
}
function Ca({ className: e, ...t }) {
  return /* @__PURE__ */ a("div", { "data-sidebar": "group-content", className: A("w-full text-sm", e), ...t });
}
function Sa({ className: e, ...t }) {
  const { state: n } = J();
  return /* @__PURE__ */ a(
    "ul",
    {
      "data-sidebar": "menu",
      className: A("flex w-full min-w-0 flex-col gap-1", n === "collapsed" && "items-center", e),
      ...t
    }
  );
}
function $a({ className: e, ...t }) {
  return /* @__PURE__ */ a("li", { "data-sidebar": "menu-item", className: A("group/menu-item relative", e), ...t });
}
const Ta = lt(
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
function Ea({
  asChild: e = !1,
  isActive: t = !1,
  variant: n = "default",
  size: r = "default",
  tooltip: o,
  className: s,
  ...i
}) {
  const l = e ? ot : "button", { isMobile: c, state: d } = J(), u = /* @__PURE__ */ a(
    l,
    {
      "data-sidebar": "menu-button",
      "data-size": r,
      "data-active": t,
      className: A(
        Ta({ variant: n, size: r }),
        d === "collapsed" && "mx-auto h-8 w-8 p-2 [&>span]:sr-only",
        r === "lg" && d === "collapsed" && "mx-auto h-8 w-8 p-0",
        s
      ),
      ...i
    }
  );
  return !o || d !== "collapsed" || c ? u : /* @__PURE__ */ b(aa, { children: [
    /* @__PURE__ */ a(ia, { asChild: !0, children: u }),
    /* @__PURE__ */ a(la, { side: "right", align: "center", ...typeof o == "string" ? { children: o } : o })
  ] });
}
function Yi({
  items: e,
  active: t,
  onSelect: n,
  header: r,
  footer: o,
  defaultCollapsed: s = !1,
  className: i
}) {
  const l = An(e);
  return /* @__PURE__ */ a(pa, { defaultOpen: !s, className: `nav-rail ${i ?? ""}`, children: /* @__PURE__ */ b(ba, { collapsible: "icon", variant: "sidebar", children: [
    /* @__PURE__ */ b(xa, { children: [
      r,
      /* @__PURE__ */ a("div", { className: "flex items-center justify-end px-1 group-data-[collapsible=icon]:justify-center", children: /* @__PURE__ */ a(ga, { "aria-label": "Toggle sidebar", title: "Toggle sidebar" }) })
    ] }),
    /* @__PURE__ */ a(ya, { children: l.map((c, d) => /* @__PURE__ */ b(ka, { children: [
      c.label && /* @__PURE__ */ a(Na, { children: c.label }),
      /* @__PURE__ */ a(Ca, { children: /* @__PURE__ */ a(Sa, { children: c.items.map((u) => {
        const p = t === u.id, x = u.icon;
        return /* @__PURE__ */ a($a, { children: /* @__PURE__ */ b(
          Ea,
          {
            "aria-label": u.label,
            "aria-current": p ? "page" : void 0,
            isActive: p,
            tooltip: u.label,
            onClick: () => n(u.id),
            children: [
              x && /* @__PURE__ */ a(x, {}),
              /* @__PURE__ */ a("span", { children: u.label })
            ]
          }
        ) }, u.id);
      }) }) })
    ] }, c.label ?? `__default-${d}`)) }),
    o && /* @__PURE__ */ a(va, { children: o }),
    /* @__PURE__ */ a(wa, {})
  ] }) });
}
function Qi({
  items: e,
  active: t,
  onSelect: n,
  badge: r,
  className: o,
  "aria-label": s = "section navigation"
}) {
  const i = An(e);
  return /* @__PURE__ */ a(
    "nav",
    {
      "aria-label": s,
      className: A("nav-rail flex min-w-0 flex-col gap-2 text-nr-fg", o),
      children: i.map((l, c) => /* @__PURE__ */ b("div", { className: "flex flex-col gap-1", children: [
        l.label && /* @__PURE__ */ a("div", { className: "px-2 text-xs font-medium text-nr-muted", children: l.label }),
        l.items.map((d) => {
          const u = t === d.id, p = d.icon, x = r == null ? void 0 : r(d.id);
          return /* @__PURE__ */ b(
            "button",
            {
              type: "button",
              role: "tab",
              "aria-label": d.label,
              "aria-current": u ? "page" : void 0,
              "aria-selected": u,
              onClick: () => n(d.id),
              className: A(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none ring-nr-accent transition-colors focus-visible:ring-2",
                "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
                u ? "bg-nr-bg font-medium text-nr-fg" : "text-nr-muted hover:bg-nr-bg hover:text-nr-fg"
              ),
              children: [
                p && /* @__PURE__ */ a(p, {}),
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
const Zi = [
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
let Dn = () => import("./echartsDefault-CWN45a00.js").then((e) => e.echarts);
function Xi(e) {
  Dn = e;
}
function Ra() {
  return Dn();
}
const _a = [
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
  const r = ((typeof window > "u" ? "" : getComputedStyle(document.documentElement).getPropertyValue(e).trim()) || "215 16% 60%").replace(/,/g, " ").split(/\s+/).filter(Boolean), [o, s, i] = r;
  return !o || !s || !i ? t === void 0 ? "#808a99" : `rgba(128,138,153,${t})` : t === void 0 ? `hsl(${o}, ${s}, ${i})` : `hsla(${o}, ${s}, ${i}, ${t})`;
}
const Ma = [0.1, 0.28, 0.46, 0.64, 0.82, 1];
function Ae(e) {
  return Ma.map((t) => te(e, t));
}
function Kt() {
  const e = ["--chart-4", "--chart-2", "--chart-6", "--chart-7", "--chart-3", "--chart-5"].map(
    (t) => te(t)
  );
  return {
    palette: _a.map((t) => te(t)),
    accent: te("--accent"),
    text: te("--foreground"),
    muted: te("--muted"),
    border: te("--border"),
    surface: te("--popover"),
    ramp: e,
    ramps: {
      spectral: e,
      accent: Ae("--accent"),
      blue: Ae("--chart-1"),
      green: Ae("--chart-6"),
      amber: Ae("--chart-7")
    }
  };
}
function Ji(e) {
  return {
    axisLine: { lineStyle: { color: e.border } },
    axisTick: { show: !1 },
    axisLabel: { color: e.muted, fontSize: 11 },
    splitLine: { lineStyle: { color: e.border, opacity: 0.38, type: "dashed" } },
    nameTextStyle: { color: e.muted, fontSize: 11 }
  };
}
function el(e) {
  return {
    backgroundColor: e.surface,
    borderColor: e.border,
    textStyle: { color: e.text, fontSize: 12 },
    extraCssText: "border-radius:8px;box-shadow:0 8px 24px hsl(0 0% 0% / 0.18);"
  };
}
function tl(e) {
  return {
    textStyle: { color: e.muted, fontSize: 11 },
    inactiveColor: e.border,
    icon: "roundRect",
    itemWidth: 10,
    itemHeight: 10
  };
}
function Ia() {
  const [e, t] = R(0);
  return G(() => {
    if (typeof MutationObserver > "u") return;
    const n = new MutationObserver(() => t((r) => r + 1));
    return n.observe(document.documentElement, { attributes: !0, attributeFilter: ["class", "style"] }), () => n.disconnect();
  }, []), e;
}
function nl({ option: e, ariaLabel: t, summary: n, className: r, onReady: o, bare: s }) {
  const i = V(null), l = V(null), c = V(o);
  c.current = o;
  const d = Ia();
  return G(() => {
    let u = !1, p;
    if (i.current)
      return (async () => {
        var m, f;
        const g = await Ra();
        if (!(u || !i.current))
          try {
            l.current = g.init(i.current), (m = l.current) == null || m.setOption(e(Kt()), !0), l.current && (p = (f = c.current) == null ? void 0 : f.call(c, l.current));
          } catch {
            l.current = null;
          }
      })(), () => {
        var g;
        u = !0, p == null || p(), (g = l.current) == null || g.dispose(), l.current = null;
      };
  }, []), G(() => {
    var u;
    (u = l.current) == null || u.setOption(e(Kt()), !0);
  }, [e, d]), G(() => {
    const u = i.current;
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
      className: `dash-kit widget-no-drag relative min-h-0 w-full flex-1 ${r ?? ""}`,
      role: s ? void 0 : "img",
      "aria-label": s ? void 0 : t,
      children: [
        n,
        /* @__PURE__ */ a("div", { ref: i, className: "h-full w-full", "data-echart": t })
      ]
    }
  );
}
const Aa = {
  loading: {
    icon: Zn,
    title: "Loading…",
    wrap: "border-border/60",
    chip: "border-border/60 bg-muted-bg/40 text-muted",
    // Motion as STATE: the spinner means "still working". `motion-reduce` drops it for a viewer who
    // asked for less movement — the copy already carries the meaning.
    spin: !0
  },
  denied: {
    icon: Qn,
    title: "No access to this source",
    detail: "This view needs a capability you have not been granted.",
    wrap: "border-warning/30 bg-warning/[0.03]",
    chip: "border-warning/30 bg-warning/10 text-warning"
  },
  error: {
    icon: Yn,
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
    icon: Hn,
    title: "Nothing numeric to plot",
    detail: "Pick a numeric field for the y axis, or view the result as a table.",
    wrap: "border-border/60",
    chip: "border-border/60 bg-muted-bg/40 text-muted"
  }
}, rl = Un;
function ve({ tone: e, title: t, detail: n, action: r, className: o, ...s }) {
  const i = Aa[e], l = i.icon, c = n === null ? void 0 : n ?? i.detail;
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
        r
      ]
    }
  );
}
const za = "repeating-linear-gradient(-45deg, rgba(255,255,255,0.35) 0 1px, transparent 1px 5px)";
function ol({ segments: e, label: t, height: n = 6, className: r }) {
  const o = e.filter((i) => Number.isFinite(i.value) && i.value > 0), s = o.reduce((i, l) => i + l.value, 0);
  return /* @__PURE__ */ a(
    "div",
    {
      className: `dash-kit flex w-full overflow-hidden rounded-full bg-muted-bg/40 ${r ?? ""}`,
      style: { height: typeof n == "number" ? `${n}px` : n },
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
            ...i.hatch ? { backgroundImage: za } : {}
          }
        },
        i.key
      ))
    }
  );
}
function sl({
  rows: e,
  label: t,
  className: n
}) {
  return /* @__PURE__ */ a("ul", { className: `dash-kit flex flex-wrap gap-x-4 gap-y-1 ${n ?? ""}`, "aria-label": t, children: e.map((r) => /* @__PURE__ */ b("li", { className: "flex items-center gap-1.5 text-xs", title: r.title, "data-share-row": r.key, children: [
    /* @__PURE__ */ a(
      "span",
      {
        "aria-hidden": !0,
        className: `h-2 w-2 shrink-0 rounded-[2px] ${r.className ?? ""}`,
        style: {
          ...r.color ? { backgroundColor: r.color } : {},
          ...r.hatch ? {
            backgroundImage: "repeating-linear-gradient(-45deg, rgba(255,255,255,0.35) 0 1px, transparent 1px 3px)"
          } : {}
        }
      }
    ),
    /* @__PURE__ */ a("span", { className: "text-muted", children: r.label }),
    /* @__PURE__ */ a("span", { className: "tabular-nums text-fg", children: r.value }),
    r.secondary ? /* @__PURE__ */ b("span", { className: "tabular-nums text-muted", children: [
      "· ",
      r.secondary
    ] }) : null,
    r.action
  ] }, r.key)) });
}
const ht = Symbol.for("@nube/dash-kit.panelRenderer.v1");
function al(e) {
  globalThis[ht] = e;
}
function Da() {
  return globalThis[ht];
}
function il() {
  delete globalThis[ht], delete globalThis[pt];
}
const pt = Symbol.for("@nube/dash-kit.specHydrator.v1");
function ll(e) {
  globalThis[pt] = e;
}
function Pa(e) {
  const t = globalThis[pt];
  return t ? t(e) : e;
}
function Oa(e) {
  return e.replace(/^panel:/, "");
}
function Xe(e, t, n) {
  return {
    i: e,
    x: (n == null ? void 0 : n.x) ?? 0,
    y: (n == null ? void 0 : n.y) ?? 0,
    w: (n == null ? void 0 : n.w) ?? 12,
    h: (n == null ? void 0 : n.h) ?? 8,
    ...t
  };
}
function cl(e) {
  const t = Ce(), n = e.ws ?? (t == null ? void 0 : t.ws) ?? "";
  return /* @__PURE__ */ a(La, { ...e, ws: n }, n);
}
function La({
  ws: e,
  id: t,
  spec: n,
  cell: r,
  range: o,
  scope: s,
  refreshKey: i,
  className: l
}) {
  const c = Ce(), d = t ? Oa(t) : void 0, u = r ?? (d && n ? Xe(d, n) : null), [p, x] = R(u), [g, m] = R(null);
  if (G(() => {
    if (r || n || !d) {
      x(r ?? (d && n ? Xe(d, n) : null)), m(null);
      return;
    }
    if (!(c != null && c.client)) {
      m("error");
      return;
    }
    let y = !0;
    return x(null), m(null), c.client.call("panel.get", { id: d }).then((C) => {
      if (!y) return;
      const N = C;
      x(Xe(d, Pa((N == null ? void 0 : N.spec) ?? {})));
    }).catch((C) => {
      y && m(cr(C));
    }), () => {
      y = !1;
    };
  }, [c, d, n, r, e]), g) return /* @__PURE__ */ a(Fa, { failure: g, id: d, className: l });
  if (!p) return /* @__PURE__ */ a(ve, { tone: "loading", className: l });
  const f = Da();
  return f ? /* @__PURE__ */ a("div", { className: `dash-kit flex min-h-0 flex-1 flex-col ${l ?? ""}`, "data-testid": "panel-embed", children: f({ cell: p, ws: e, range: o, scope: s, refreshKey: i }) }) : /* @__PURE__ */ a(
    ve,
    {
      tone: "error",
      className: l,
      title: "No panel renderer registered",
      detail: "The host has not registered a widget renderer with the kit, so this panel cannot be drawn."
    }
  );
}
function Fa({
  failure: e,
  id: t,
  className: n
}) {
  return e === "denied" ? /* @__PURE__ */ a(
    ve,
    {
      tone: "denied",
      className: n,
      title: "No access to this panel",
      detail: `\`panel.get\` is not in this extension's granted scope${t ? ` (asked for \`${t}\`)` : ""}.`
    }
  ) : e === "unavailable" ? /* @__PURE__ */ a(
    ve,
    {
      tone: "denied",
      className: n,
      "data-embed-failure": "unavailable",
      title: "Panel not available",
      detail: `${t ? `\`${t}\` ` : "This panel "}may have been deleted, or it isn't shared with you.`
    }
  ) : /* @__PURE__ */ a(
    ve,
    {
      tone: "error",
      className: n,
      title: "This panel didn't load",
      detail: "The panel definition could not be fetched."
    }
  );
}
export {
  kr as BROWSER_TZ,
  zi as BUILDER_SOURCE_GROUPS,
  Ko as BUILTIN_PREFIX,
  xs as CATALOG_SECTION_SPECS,
  rl as CHART_STATE_ICON,
  me as CatalogEmpty,
  Oi as CatalogExplorer,
  Ts as CatalogSchemaTree,
  Ss as CatalogSection,
  ve as ChartState,
  Zi as DASH_KIT_ECHARTS_PARTS,
  Ya as DASH_KIT_READ_CAPS,
  Ha as DASH_KIT_READ_SCOPE,
  ni as DEFAULT_RANGE_EXPR,
  Zo as DEFAULT_TTL_S,
  Bo as DashboardCacheProvider,
  ii as DashboardRangePicker,
  ft as DashboardWsContext,
  nl as EChart,
  yi as FreezeProvider,
  Ni as FreshnessProvider,
  Fs as InsightActions,
  Ls as InsightRow,
  Bi as InsightsAckWidget,
  ji as InsightsReadWidget,
  In as InsightsWidget,
  Hi as KV,
  et as KitDeniedError,
  Qa as KitProvider,
  kn as LIST_STALE_MS,
  jt as MAX_PANELS,
  Uo as NAV_PATH_SEP,
  Qi as NavMenu,
  Yi as NavRail,
  qi as Panel,
  cl as PanelEmbed,
  Cs as PickerGroup,
  Lt as PrefDateInput,
  Ui as PropTable,
  Do as QUICK_PERSIST_MAX_AGE_MS,
  Nn as QUICK_PERSIST_VERSION,
  yn as RANGE_BANDS,
  vn as RANGE_COLUMNS,
  ai as RANGE_PRESETS,
  Mn as READ_SOURCE_GROUPS,
  Us as ResizeHandle,
  _s as SEVERITY_ORDER,
  ms as SQL_SOURCE_ID,
  Vi as Section,
  Ps as SeverityBadge,
  ol as ShareBar,
  sl as ShareLegend,
  Pi as SourceCombobox,
  Di as SourcePicker,
  Os as StatusBadge,
  $i as VizBatchProvider,
  xi as WithDashboardCache,
  ie as addUnits,
  Ji as axisChrome,
  Oa as bareId,
  dr as browserZone,
  hs as buildSourceEntries,
  ke as canon,
  vs as channelEntries,
  cr as classifyReadFailure,
  il as clearPanelRenderer,
  Ei as datasourceEntries,
  Yo as datasourceListKey,
  Qo as datasourceListQueryOptions,
  Ro as datePlaceholder,
  Ki as denyClient,
  Kt as echartsTheme,
  ls as extWidgetEntries,
  is as extensionEntries,
  Wo as extractVarNames,
  Vo as extractVarNamesDeep,
  gi as fetchDatasourceList,
  hi as flowNodeStateKey,
  cs as flowsEntries,
  Ot as formatDateField,
  Da as getPanelRenderer,
  Pa as hydrateSpec,
  ks as inboxEntries,
  ys as insightEntries,
  qo as isBuiltinName,
  nr as isKitDenied,
  rr as isOutOfScope,
  ti as isWindowExpr,
  tt as isoDayOf,
  it as labelOf,
  tl as legendChrome,
  as as liveEntries,
  gs as loadCatalog,
  Ra as loadEcharts,
  ws as loadSourcePicker,
  _o as makeDashboardQueryClient,
  ar as makeInsightsClient,
  Ua as makeKitClient,
  sr as makeSourceLoaders,
  Bt as makeVizBatchLoader,
  Wi as memoryClient,
  di as navBuiltins,
  at as normalizeTz,
  zs as originLine,
  si as parseDateField,
  De as parseRangeExpr,
  jo as persistQuickCache,
  tn as preferredZone,
  oi as previewBound,
  Ii as queryCatalogEntries,
  us as queryEntries,
  Lo as quickPersister,
  ri as rangeTimezone,
  al as registerPanelRenderer,
  ll as registerSpecHydrator,
  wi as resolveFreshnessTtl,
  $r as resolveRange,
  ds as rulesEntries,
  _i as schemaColumnEntries,
  Ri as schemaTableEntries,
  Cn as scopeKey,
  En as selectionOf,
  Mi as seriesCatalogEntries,
  ss as seriesEntries,
  pi as seriesReadKey,
  Xi as setEchartsLoader,
  Fi as severityColor,
  Li as severityRank,
  Ms as severityTone,
  Mr as shortLabelOf,
  bi as sourcePickerKey,
  Xe as specToCell,
  fs as sqlSourceEntry,
  Is as statusTone,
  As as timeAgo,
  te as tokenColor,
  or as toolCallOf,
  el as tooltipChrome,
  Ai as useCatalog,
  li as useDashboardWs,
  ci as useDashboardWsOptional,
  vi as useDebounced,
  ki as useFreeze,
  Ci as useFreshness,
  Gi as useInsight,
  Ds as useInsights,
  Oe as useKit,
  Za as useKitClient,
  Ce as useKitOptional,
  Ja as useKitTheme,
  Xa as useKitWs,
  ei as useKitZone,
  Le as usePortalContainer,
  Hs as useResizable,
  Ti as useSourcePicker,
  Si as useVizBatchLoader,
  mi as vizFetchKey,
  ui as vizQueryKey,
  fi as vizShapeKey,
  Tr as weekStartOf,
  ns as widgetIdOf
};
