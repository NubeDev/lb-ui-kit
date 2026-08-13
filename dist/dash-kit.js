var f = Object.defineProperty;
var d = (e, n, i) => n in e ? f(e, n, { enumerable: !0, configurable: !0, writable: !0, value: i }) : e[n] = i;
var u = (e, n, i) => d(e, typeof n != "symbol" ? n + "" : n, i);
import { jsx as m } from "react/jsx-runtime";
import { createContext as g, useMemo as w, useContext as h } from "react";
class c extends Error {
  constructor(i, t) {
    super(`denied: ${i} — ${t}`);
    u(this, "denied", !0);
    u(this, "tool");
    this.name = "KitDeniedError", this.tool = i;
  }
}
function D(e) {
  return e instanceof c;
}
function E(e) {
  return e instanceof Error && e.message.startsWith("out_of_scope:");
}
function x(e) {
  if (typeof e == "function") return e;
  const n = e;
  return (i, t) => n.call(i, t);
}
function s(e, n) {
  if (!e || typeof e != "object") return [];
  const i = e[n];
  return Array.isArray(i) ? i : [];
}
function p(e, n = {}) {
  const i = {
    listSeries: () => e("series.list", {}).then((t) => s(t, "series")),
    listExtensions: () => e("ext.list", {}).then((t) => s(t, "extensions")),
    listFlows: () => e("flows.list", {}).then((t) => s(t, "flows")),
    // `flows.get` answers the flow BARE (not enveloped). A flow the caller can list but not read
    // rejects; the picker skips it rather than failing the whole bundle, so map a rejection to null.
    getFlow: (t) => e("flows.get", { id: t }).then((r) => r && typeof r == "object" ? r : null).catch(() => null),
    listFlowNodes: () => e("flows.nodes", {}).then((t) => s(t, "nodes")),
    listDatasources: () => e("datasource.list", {}).then((t) => s(t, "datasources")),
    listRules: () => e("rules.list", {}).then((t) => s(t, "rules")),
    listQueries: () => e("query.list", {}).then((t) => s(t, "queries")),
    // `store.schema` answers the schema BARE. An absent/!object reply is an empty schema, not a throw.
    readSchema: () => e("store.schema", {}).then(
      (t) => t && typeof t == "object" ? t : { tables: [] }
    ),
    listChannels: () => e("channel.list", {}).then((t) => s(t, "channels")),
    listInsights: () => e("insight.list", {}).then((t) => s(t, "items"))
  };
  if (n.inboxChannel) {
    const t = n.inboxChannel;
    i.listInbox = () => e("inbox.list", { channel: t }).then((r) => s(r, "items"));
  }
  return i;
}
function K(e) {
  return {
    list: (n) => e("insight.list", { ...n }).then((i) => i ?? { items: [] }),
    get: (n) => e("insight.get", { id: n }).then((i) => i ?? null),
    occurrences: (n, i, t) => e("insight.occurrences", {
      insight_id: n,
      cursor: i,
      limit: t ?? 50
    }).then((r) => r ?? { items: [] }),
    ack: () => Promise.reject(
      new c(
        "insight.ack",
        "the kit is a READ kit; extension bridge writes are not implemented (U-ext-bridge-write)"
      )
    ),
    resolve: () => Promise.reject(
      new c(
        "insight.resolve",
        "the kit is a READ kit; extension bridge writes are not implemented (U-ext-bridge-write)"
      )
    )
    // No `subscribe`: a live tail needs a stream seam the leashed call does not carry. Omitting it is
    // the interface's documented "no feed" case, so the hooks fall back to act→refresh.
  };
}
function _(e, n = {}) {
  const i = x(e);
  return {
    call: i,
    loaders: p(i, n),
    insights: K(i)
  };
}
const v = [
  "viz.query",
  "viz.query_batch",
  "series.read",
  "series.latest",
  "series.find"
], A = [
  "mcp:viz.query:call",
  "mcp:series.read:call",
  "mcp:series.latest:call",
  "mcp:series.find:call"
];
function b() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
const l = g(null);
function P({ client: e, ws: n, theme: i, zone: t, children: r }) {
  const a = w(
    () => ({ client: e, ws: n, theme: i, zone: t ?? b }),
    [e, n, i, t]
  );
  return /* @__PURE__ */ m(l.Provider, { value: a, children: r });
}
function S() {
  return h(l);
}
function o() {
  const e = h(l);
  if (!e)
    throw new Error(
      "useKit: no <KitProvider>. Wrap the page: <KitProvider client={makeKitClient(bridge)} ws={ctx.workspace}>"
    );
  return e;
}
function j() {
  return o().client;
}
function I() {
  return o().ws;
}
function O() {
  return o().theme;
}
function T() {
  return o().zone;
}
export {
  A as DASH_KIT_READ_CAPS,
  v as DASH_KIT_READ_SCOPE,
  c as KitDeniedError,
  P as KitProvider,
  b as browserZone,
  D as isKitDenied,
  E as isOutOfScope,
  K as makeInsightsClient,
  _ as makeKitClient,
  p as makeSourceLoaders,
  x as toolCallOf,
  o as useKit,
  j as useKitClient,
  S as useKitOptional,
  O as useKitTheme,
  I as useKitWs,
  T as useKitZone
};
