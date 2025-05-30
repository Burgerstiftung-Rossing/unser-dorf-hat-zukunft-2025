!(function (e, t) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = t())
    : "function" == typeof define && define.amd
    ? define(t)
    : ((e = "undefined" != typeof globalThis ? globalThis : e || self)
      .PocketBase = t());
})(this, function () {
  "use strict";
  class ClientResponseError extends Error {
    constructor(e) {
      super("ClientResponseError"),
        (this.url = ""),
        (this.status = 0),
        (this.response = {}),
        (this.isAbort = !1),
        (this.originalError = null),
        Object.setPrototypeOf(this, ClientResponseError.prototype),
        null !== e &&
        "object" == typeof e &&
        ((this.url = "string" == typeof e.url ? e.url : ""),
          (this.status = "number" == typeof e.status ? e.status : 0),
          (this.isAbort = !!e.isAbort),
          (this.originalError = e.originalError),
          null !== e.response && "object" == typeof e.response
            ? (this.response = e.response)
            : null !== e.data && "object" == typeof e.data
            ? (this.response = e.data)
            : (this.response = {})),
        this.originalError ||
        e instanceof ClientResponseError ||
        (this.originalError = e),
        "undefined" != typeof DOMException &&
        e instanceof DOMException &&
        (this.isAbort = !0),
        (this.name = "ClientResponseError " + this.status),
        (this.message = this.response?.message),
        this.message ||
        (this.isAbort
          ? (this.message =
            "The request was autocancelled. You can find more info in https://github.com/pocketbase/js-sdk#auto-cancellation.")
          : this.originalError?.cause?.message?.includes("ECONNREFUSED ::1")
          ? (this.message =
            "Failed to connect to the PocketBase server. Try changing the SDK URL from localhost to 127.0.0.1 (https://github.com/pocketbase/js-sdk/issues/21).")
          : (this.message =
            "Something went wrong while processing your request."));
    }
    get data() {
      return this.response;
    }
    toJSON() {
      return { ...this };
    }
  }
  const e = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
  function cookieSerialize(t, s, i) {
    const n = Object.assign({}, i || {}),
      o = n.encode || defaultEncode;
    if (!e.test(t)) throw new TypeError("argument name is invalid");
    const r = o(s);
    if (r && !e.test(r)) throw new TypeError("argument val is invalid");
    let a = t + "=" + r;
    if (null != n.maxAge) {
      const e = n.maxAge - 0;
      if (isNaN(e) || !isFinite(e)) {
        throw new TypeError("option maxAge is invalid");
      }
      a += "; Max-Age=" + Math.floor(e);
    }
    if (n.domain) {
      if (!e.test(n.domain)) throw new TypeError("option domain is invalid");
      a += "; Domain=" + n.domain;
    }
    if (n.path) {
      if (!e.test(n.path)) throw new TypeError("option path is invalid");
      a += "; Path=" + n.path;
    }
    if (n.expires) {
      if (
        !(function isDate(e) {
          return (
            "[object Date]" === Object.prototype.toString.call(e) ||
            e instanceof Date
          );
        })(n.expires) ||
        isNaN(n.expires.valueOf())
      ) {
        throw new TypeError("option expires is invalid");
      }
      a += "; Expires=" + n.expires.toUTCString();
    }
    if (
      (n.httpOnly && (a += "; HttpOnly"),
        n.secure && (a += "; Secure"),
        n.priority)
    ) {
      switch (
        "string" == typeof n.priority ? n.priority.toLowerCase() : n.priority
      ) {
        case "low":
          a += "; Priority=Low";
          break;
        case "medium":
          a += "; Priority=Medium";
          break;
        case "high":
          a += "; Priority=High";
          break;
        default:
          throw new TypeError("option priority is invalid");
      }
    }
    if (n.sameSite) {
      switch (
        "string" == typeof n.sameSite ? n.sameSite.toLowerCase() : n.sameSite
      ) {
        case !0:
          a += "; SameSite=Strict";
          break;
        case "lax":
          a += "; SameSite=Lax";
          break;
        case "strict":
          a += "; SameSite=Strict";
          break;
        case "none":
          a += "; SameSite=None";
          break;
        default:
          throw new TypeError("option sameSite is invalid");
      }
    }
    return a;
  }
  function defaultDecode(e) {
    return -1 !== e.indexOf("%") ? decodeURIComponent(e) : e;
  }
  function defaultEncode(e) {
    return encodeURIComponent(e);
  }
  const t =
    ("undefined" != typeof navigator && "ReactNative" === navigator.product) ||
    ("undefined" != typeof global && global.HermesInternal);
  let s;
  function getTokenPayload(e) {
    if (e) {
      try {
        const t = decodeURIComponent(
          s(e.split(".")[1])
            .split("")
            .map(function (e) {
              return "%" + ("00" + e.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""),
        );
        return JSON.parse(t) || {};
      } catch (e) {}
    }
    return {};
  }
  function isTokenExpired(e, t = 0) {
    let s = getTokenPayload(e);
    return !(
      Object.keys(s).length > 0 &&
      (!s.exp || s.exp - t > Date.now() / 1e3)
    );
  }
  s = "function" != typeof atob || t
    ? (e) => {
      let t = String(e).replace(/=+$/, "");
      if (t.length % 4 == 1) {
        throw new Error(
          "'atob' failed: The string to be decoded is not correctly encoded.",
        );
      }
      for (
        var s, i, n = 0, o = 0, r = "";
        (i = t.charAt(o++));
        ~i && ((s = n % 4 ? 64 * s + i : i), n++ % 4)
          ? (r += String.fromCharCode(255 & (s >> ((-2 * n) & 6))))
          : 0
      ) {
        i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
          .indexOf(
            i,
          );
      }
      return r;
    }
    : atob;
  const i = "pb_auth";
  class BaseAuthStore {
    constructor() {
      (this.baseToken = ""),
        (this.baseModel = null),
        (this._onChangeCallbacks = []);
    }
    get token() {
      return this.baseToken;
    }
    get model() {
      return this.baseModel;
    }
    get isValid() {
      return !isTokenExpired(this.token);
    }
    get isAdmin() {
      return "admin" === getTokenPayload(this.token).type;
    }
    get isAuthRecord() {
      return "authRecord" === getTokenPayload(this.token).type;
    }
    save(e, t) {
      (this.baseToken = e || ""),
        (this.baseModel = t || null),
        this.triggerChange();
    }
    clear() {
      (this.baseToken = ""), (this.baseModel = null), this.triggerChange();
    }
    loadFromCookie(e, t = i) {
      const s = (function cookieParse(e, t) {
        const s = {};
        if ("string" != typeof e) return s;
        const i = Object.assign({}, t || {}).decode || defaultDecode;
        let n = 0;
        for (; n < e.length;) {
          const t = e.indexOf("=", n);
          if (-1 === t) break;
          let o = e.indexOf(";", n);
          if (-1 === o) o = e.length;
          else if (o < t) {
            n = e.lastIndexOf(";", t - 1) + 1;
            continue;
          }
          const r = e.slice(n, t).trim();
          if (void 0 === s[r]) {
            let n = e.slice(t + 1, o).trim();
            34 === n.charCodeAt(0) && (n = n.slice(1, -1));
            try {
              s[r] = i(n);
            } catch (e) {
              s[r] = n;
            }
          }
          n = o + 1;
        }
        return s;
      })(e || "")[t] || "";
      let n = {};
      try {
        (n = JSON.parse(s)),
          (null === typeof n || "object" != typeof n || Array.isArray(n)) &&
          (n = {});
      } catch (e) {}
      this.save(n.token || "", n.model || null);
    }
    exportToCookie(e, t = i) {
      const s = { secure: !0, sameSite: !0, httpOnly: !0, path: "/" },
        n = getTokenPayload(this.token);
      (s.expires = n?.exp ? new Date(1e3 * n.exp) : new Date("1970-01-01")),
        (e = Object.assign({}, s, e));
      const o = {
        token: this.token,
        model: this.model ? JSON.parse(JSON.stringify(this.model)) : null,
      };
      let r = cookieSerialize(t, JSON.stringify(o), e);
      const a = "undefined" != typeof Blob ? new Blob([r]).size : r.length;
      if (o.model && a > 4096) {
        o.model = { id: o?.model?.id, email: o?.model?.email };
        const s = ["collectionId", "username", "verified"];
        for (const e in this.model) {
          s.includes(e) && (o.model[e] = this.model[e]);
        }
        r = cookieSerialize(t, JSON.stringify(o), e);
      }
      return r;
    }
    onChange(e, t = !1) {
      return (
        this._onChangeCallbacks.push(e), t && e(this.token, this.model), () => {
          for (let t = this._onChangeCallbacks.length - 1; t >= 0; t--) {
            if (this._onChangeCallbacks[t] == e) {
              return (
                delete this._onChangeCallbacks[t],
                  void this._onChangeCallbacks.splice(t, 1)
              );
            }
          }
        }
      );
    }
    triggerChange() {
      for (const e of this._onChangeCallbacks) e && e(this.token, this.model);
    }
  }
  class LocalAuthStore extends BaseAuthStore {
    constructor(e = "pocketbase_auth") {
      super(),
        (this.storageFallback = {}),
        (this.storageKey = e),
        this._bindStorageEvent();
    }
    get token() {
      return (this._storageGet(this.storageKey) || {}).token || "";
    }
    get model() {
      return (this._storageGet(this.storageKey) || {}).model || null;
    }
    save(e, t) {
      this._storageSet(this.storageKey, { token: e, model: t }),
        super.save(e, t);
    }
    clear() {
      this._storageRemove(this.storageKey), super.clear();
    }
    _storageGet(e) {
      if ("undefined" != typeof window && window?.localStorage) {
        const t = window.localStorage.getItem(e) || "";
        try {
          return JSON.parse(t);
        } catch (e) {
          return t;
        }
      }
      return this.storageFallback[e];
    }
    _storageSet(e, t) {
      if ("undefined" != typeof window && window?.localStorage) {
        let s = t;
        "string" != typeof t && (s = JSON.stringify(t)),
          window.localStorage.setItem(e, s);
      } else this.storageFallback[e] = t;
    }
    _storageRemove(e) {
      "undefined" != typeof window &&
      window?.localStorage &&
      window.localStorage?.removeItem(e), delete this.storageFallback[e];
    }
    _bindStorageEvent() {
      "undefined" != typeof window &&
        window?.localStorage &&
        window.addEventListener &&
        window.addEventListener("storage", (e) => {
          if (e.key != this.storageKey) return;
          const t = this._storageGet(this.storageKey) || {};
          super.save(t.token || "", t.model || null);
        });
    }
  }
  class BaseService {
    constructor(e) {
      this.client = e;
    }
  }
  class SettingsService extends BaseService {
    async getAll(e) {
      return (
        (e = Object.assign({ method: "GET" }, e)),
          this.client.send("/api/settings", e)
      );
    }
    async update(e, t) {
      return (
        (t = Object.assign({ method: "PATCH", body: e }, t)),
          this.client.send("/api/settings", t)
      );
    }
    async testS3(e = "storage", t) {
      return (
        (t = Object.assign({ method: "POST", body: { filesystem: e } }, t)),
          this.client.send("/api/settings/test/s3", t).then(() => !0)
      );
    }
    async testEmail(e, t, s) {
      return (
        (s = Object.assign(
          { method: "POST", body: { email: e, template: t } },
          s,
        )), this.client.send("/api/settings/test/email", s).then(() => !0)
      );
    }
    async generateAppleClientSecret(e, t, s, i, n, o) {
      return (
        (o = Object.assign(
          {
            method: "POST",
            body: {
              clientId: e,
              teamId: t,
              keyId: s,
              privateKey: i,
              duration: n,
            },
          },
          o,
        )), this.client.send("/api/settings/apple/generate-client-secret", o)
      );
    }
  }
  class CrudService extends BaseService {
    decode(e) {
      return e;
    }
    async getFullList(e, t) {
      if ("number" == typeof e) return this._getFullList(e, t);
      let s = 500;
      return (
        (t = Object.assign({}, e, t)).batch && ((s = t.batch), delete t.batch),
          this._getFullList(s, t)
      );
    }
    async getList(e = 1, t = 30, s) {
      return (
        ((s = Object.assign({ method: "GET" }, s)).query = Object.assign(
          { page: e, perPage: t },
          s.query,
        )),
          this.client
            .send(this.baseCrudPath, s)
            .then(
              (e) => ((e.items = e.items?.map((e) => this.decode(e)) || []), e),
            )
      );
    }
    async getFirstListItem(e, t) {
      return (
        ((t = Object.assign(
          { requestKey: "one_by_filter_" + this.baseCrudPath + "_" + e },
          t,
        )).query = Object.assign({ filter: e, skipTotal: 1 }, t.query)),
          this.getList(1, 1, t).then((e) => {
            if (!e?.items?.length) {
              throw new ClientResponseError({
                status: 404,
                response: {
                  code: 404,
                  message: "The requested resource wasn't found.",
                  data: {},
                },
              });
            }
            return e.items[0];
          })
      );
    }
    async getOne(e, t) {
      if (!e) {
        throw new ClientResponseError({
          url: this.client.buildUrl(this.baseCrudPath + "/"),
          status: 404,
          response: {
            code: 404,
            message: "Missing required record id.",
            data: {},
          },
        });
      }
      return (
        (t = Object.assign({ method: "GET" }, t)),
          this.client
            .send(this.baseCrudPath + "/" + encodeURIComponent(e), t)
            .then((e) => this.decode(e))
      );
    }
    async create(e, t) {
      return (
        (t = Object.assign({ method: "POST", body: e }, t)),
          this.client.send(this.baseCrudPath, t).then((e) => this.decode(e))
      );
    }
    async update(e, t, s) {
      return (
        (s = Object.assign({ method: "PATCH", body: t }, s)),
          this.client
            .send(this.baseCrudPath + "/" + encodeURIComponent(e), s)
            .then((e) => this.decode(e))
      );
    }
    async delete(e, t) {
      return (
        (t = Object.assign({ method: "DELETE" }, t)),
          this.client
            .send(this.baseCrudPath + "/" + encodeURIComponent(e), t)
            .then(() => !0)
      );
    }
    _getFullList(e = 500, t) {
      (t = t || {}).query = Object.assign({ skipTotal: 1 }, t.query);
      let s = [],
        request = async (i) =>
          this.getList(i, e || 500, t).then((e) => {
            const t = e.items;
            return (
              (s = s.concat(t)), t.length == e.perPage ? request(i + 1) : s
            );
          });
      return request(1);
    }
  }
  function normalizeLegacyOptionsArgs(e, t, s, i) {
    const n = void 0 !== i;
    return n || void 0 !== s
      ? n
        ? (console.warn(e),
          (t.body = Object.assign({}, t.body, s)),
          (t.query = Object.assign({}, t.query, i)),
          t)
        : Object.assign(t, s)
      : t;
  }
  function resetAutoRefresh(e) {
    e._resetAutoRefresh?.();
  }
  class AdminService extends CrudService {
    get baseCrudPath() {
      return "/api/admins";
    }
    async update(e, t, s) {
      return super
        .update(e, t, s)
        .then(
          (e) => (
            this.client.authStore.model?.id === e.id &&
            void 0 === this.client.authStore.model?.collectionId &&
            this.client.authStore.save(this.client.authStore.token, e), e
          ),
        );
    }
    async delete(e, t) {
      return super
        .delete(e, t)
        .then(
          (t) => (
            t &&
            this.client.authStore.model?.id === e &&
            void 0 === this.client.authStore.model?.collectionId &&
            this.client.authStore.clear(), t
          ),
        );
    }
    authResponse(e) {
      const t = this.decode(e?.admin || {});
      return (
        e?.token && e?.admin && this.client.authStore.save(e.token, t),
          Object.assign({}, e, { token: e?.token || "", admin: t })
      );
    }
    async authWithPassword(e, t, s, i) {
      let n = { method: "POST", body: { identity: e, password: t } };
      n = normalizeLegacyOptionsArgs(
        "This form of authWithPassword(email, pass, body?, query?) is deprecated. Consider replacing it with authWithPassword(email, pass, options?).",
        n,
        s,
        i,
      );
      const o = n.autoRefreshThreshold;
      delete n.autoRefreshThreshold,
        n.autoRefresh || resetAutoRefresh(this.client);
      let r = await this.client.send(
        this.baseCrudPath + "/auth-with-password",
        n,
      );
      return (
        (r = this.authResponse(r)),
          o &&
          (function registerAutoRefresh(e, t, s, i) {
            resetAutoRefresh(e);
            const n = e.beforeSend,
              o = e.authStore.model,
              r = e.authStore.onChange((t, s) => {
                (!t ||
                  s?.id != o?.id ||
                  ((s?.collectionId || o?.collectionId) &&
                    s?.collectionId != o?.collectionId)) &&
                  resetAutoRefresh(e);
              });
            (e._resetAutoRefresh = function () {
              r(), (e.beforeSend = n), delete e._resetAutoRefresh;
            }),
              (e.beforeSend = async (o, r) => {
                const a = e.authStore.token;
                if (r.query?.autoRefresh) {
                  return n ? n(o, r) : { url: o, sendOptions: r };
                }
                let c = e.authStore.isValid;
                if (c && isTokenExpired(e.authStore.token, t)) {
                  try {
                    await s();
                  } catch (e) {
                    c = !1;
                  }
                }
                c || (await i());
                const l = r.headers || {};
                for (let t in l) {
                  if (
                    "authorization" == t.toLowerCase() &&
                    a == l[t] &&
                    e.authStore.token
                  ) {
                    l[t] = e.authStore.token;
                    break;
                  }
                }
                return (
                  (r.headers = l), n ? n(o, r) : { url: o, sendOptions: r }
                );
              });
          })(
            this.client,
            o,
            () => this.authRefresh({ autoRefresh: !0 }),
            () =>
              this.authWithPassword(
                e,
                t,
                Object.assign({ autoRefresh: !0 }, n),
              ),
          ),
          r
      );
    }
    async authRefresh(e, t) {
      let s = { method: "POST" };
      return (
        (s = normalizeLegacyOptionsArgs(
          "This form of authRefresh(body?, query?) is deprecated. Consider replacing it with authRefresh(options?).",
          s,
          e,
          t,
        )),
          this.client
            .send(this.baseCrudPath + "/auth-refresh", s)
            .then(this.authResponse.bind(this))
      );
    }
    async requestPasswordReset(e, t, s) {
      let i = { method: "POST", body: { email: e } };
      return (
        (i = normalizeLegacyOptionsArgs(
          "This form of requestPasswordReset(email, body?, query?) is deprecated. Consider replacing it with requestPasswordReset(email, options?).",
          i,
          t,
          s,
        )),
          this.client
            .send(this.baseCrudPath + "/request-password-reset", i)
            .then(() => !0)
      );
    }
    async confirmPasswordReset(e, t, s, i, n) {
      let o = {
        method: "POST",
        body: { token: e, password: t, passwordConfirm: s },
      };
      return (
        (o = normalizeLegacyOptionsArgs(
          "This form of confirmPasswordReset(resetToken, password, passwordConfirm, body?, query?) is deprecated. Consider replacing it with confirmPasswordReset(resetToken, password, passwordConfirm, options?).",
          o,
          i,
          n,
        )),
          this.client
            .send(this.baseCrudPath + "/confirm-password-reset", o)
            .then(() => !0)
      );
    }
  }
  const n = [
    "requestKey",
    "$cancelKey",
    "$autoCancel",
    "fetch",
    "headers",
    "body",
    "query",
    "params",
    "cache",
    "credentials",
    "headers",
    "integrity",
    "keepalive",
    "method",
    "mode",
    "redirect",
    "referrer",
    "referrerPolicy",
    "signal",
    "window",
  ];
  function normalizeUnknownQueryParams(e) {
    if (e) {
      e.query = e.query || {};
      for (let t in e) n.includes(t) || ((e.query[t] = e[t]), delete e[t]);
    }
  }
  class RealtimeService extends BaseService {
    constructor() {
      super(...arguments),
        (this.clientId = ""),
        (this.eventSource = null),
        (this.subscriptions = {}),
        (this.lastSentSubscriptions = []),
        (this.maxConnectTimeout = 15e3),
        (this.reconnectAttempts = 0),
        (this.maxReconnectAttempts = 1 / 0),
        (this.predefinedReconnectIntervals = [
          200,
          300,
          500,
          1e3,
          1200,
          1500,
          2e3,
        ]),
        (this.pendingConnects = []);
    }
    get isConnected() {
      return (
        !!this.eventSource && !!this.clientId && !this.pendingConnects.length
      );
    }
    async subscribe(e, t, s) {
      if (!e) throw new Error("topic must be set.");
      let i = e;
      if (s) {
        normalizeUnknownQueryParams(s = Object.assign({}, s));
        const e = "options=" +
          encodeURIComponent(
            JSON.stringify({ query: s.query, headers: s.headers }),
          );
        i += (i.includes("?") ? "&" : "?") + e;
      }
      const listener = function (e) {
        const s = e;
        let i;
        try {
          i = JSON.parse(s?.data);
        } catch {}
        t(i || {});
      };
      return (
        this.subscriptions[i] || (this.subscriptions[i] = []),
          this.subscriptions[i].push(listener),
          this.isConnected
            ? 1 === this.subscriptions[i].length
              ? await this.submitSubscriptions()
              : this.eventSource?.addEventListener(i, listener)
            : await this.connect(),
          async () => this.unsubscribeByTopicAndListener(e, listener)
      );
    }
    async unsubscribe(e) {
      let t = !1;
      if (e) {
        const s = this.getSubscriptionsByTopic(e);
        for (let e in s) {
          if (this.hasSubscriptionListeners(e)) {
            for (let t of this.subscriptions[e]) {
              this.eventSource?.removeEventListener(e, t);
            }
            delete this.subscriptions[e], t || (t = !0);
          }
        }
      } else this.subscriptions = {};
      this.hasSubscriptionListeners()
        ? t && (await this.submitSubscriptions())
        : this.disconnect();
    }
    async unsubscribeByPrefix(e) {
      let t = !1;
      for (let s in this.subscriptions) {
        if ((s + "?").startsWith(e)) {
          t = !0;
          for (let e of this.subscriptions[s]) {
            this.eventSource?.removeEventListener(s, e);
          }
          delete this.subscriptions[s];
        }
      }
      t &&
        (this.hasSubscriptionListeners()
          ? await this.submitSubscriptions()
          : this.disconnect());
    }
    async unsubscribeByTopicAndListener(e, t) {
      let s = !1;
      const i = this.getSubscriptionsByTopic(e);
      for (let e in i) {
        if (
          !Array.isArray(this.subscriptions[e]) ||
          !this.subscriptions[e].length
        ) {
          continue;
        }
        let i = !1;
        for (let s = this.subscriptions[e].length - 1; s >= 0; s--) {
          this.subscriptions[e][s] === t &&
            ((i = !0),
              delete this.subscriptions[e][s],
              this.subscriptions[e].splice(s, 1),
              this.eventSource?.removeEventListener(e, t));
        }
        i &&
          (this.subscriptions[e].length || delete this.subscriptions[e],
            s || this.hasSubscriptionListeners(e) || (s = !0));
      }
      this.hasSubscriptionListeners()
        ? s && (await this.submitSubscriptions())
        : this.disconnect();
    }
    hasSubscriptionListeners(e) {
      if (((this.subscriptions = this.subscriptions || {}), e)) {
        return !!this.subscriptions[e]?.length;
      }
      for (let e in this.subscriptions) {
        if (this.subscriptions[e]?.length) return !0;
      }
      return !1;
    }
    async submitSubscriptions() {
      if (this.clientId) {
        return (
          this.addAllSubscriptionListeners(),
            (this.lastSentSubscriptions = this.getNonEmptySubscriptionKeys()),
            this.client
              .send("/api/realtime", {
                method: "POST",
                body: {
                  clientId: this.clientId,
                  subscriptions: this.lastSentSubscriptions,
                },
                requestKey: this.getSubscriptionsCancelKey(),
              })
              .catch((e) => {
                if (!e?.isAbort) throw e;
              })
        );
      }
    }
    getSubscriptionsCancelKey() {
      return "realtime_" + this.clientId;
    }
    getSubscriptionsByTopic(e) {
      const t = {};
      e = e.includes("?") ? e : e + "?";
      for (let s in this.subscriptions) {
        (s + "?").startsWith(e) && (t[s] = this.subscriptions[s]);
      }
      return t;
    }
    getNonEmptySubscriptionKeys() {
      const e = [];
      for (let t in this.subscriptions) {
        this.subscriptions[t].length && e.push(t);
      }
      return e;
    }
    addAllSubscriptionListeners() {
      if (this.eventSource) {
        this.removeAllSubscriptionListeners();
        for (let e in this.subscriptions) {
          for (let t of this.subscriptions[e]) {
            this.eventSource.addEventListener(e, t);
          }
        }
      }
    }
    removeAllSubscriptionListeners() {
      if (this.eventSource) {
        for (let e in this.subscriptions) {
          for (let t of this.subscriptions[e]) {
            this.eventSource.removeEventListener(e, t);
          }
        }
      }
    }
    async connect() {
      if (!(this.reconnectAttempts > 0)) {
        return new Promise((e, t) => {
          this.pendingConnects.push({ resolve: e, reject: t }),
            this.pendingConnects.length > 1 || this.initConnect();
        });
      }
    }
    initConnect() {
      this.disconnect(!0),
        clearTimeout(this.connectTimeoutId),
        (this.connectTimeoutId = setTimeout(() => {
          this.connectErrorHandler(
            new Error("EventSource connect took too long."),
          );
        }, this.maxConnectTimeout)),
        (this.eventSource = new EventSource(
          this.client.buildUrl("/api/realtime"),
        )),
        (this.eventSource.onerror = (e) => {
          this.connectErrorHandler(
            new Error("Failed to establish realtime connection."),
          );
        }),
        this.eventSource.addEventListener("PB_CONNECT", (e) => {
          const t = e;
          (this.clientId = t?.lastEventId),
            this.submitSubscriptions()
              .then(async () => {
                let e = 3;
                for (; this.hasUnsentSubscriptions() && e > 0;) {
                  e--, await this.submitSubscriptions();
                }
              })
              .then(() => {
                for (let e of this.pendingConnects) e.resolve();
                (this.pendingConnects = []),
                  (this.reconnectAttempts = 0),
                  clearTimeout(this.reconnectTimeoutId),
                  clearTimeout(this.connectTimeoutId);
                const t = this.getSubscriptionsByTopic("PB_CONNECT");
                for (let s in t) for (let i of t[s]) i(e);
              })
              .catch((e) => {
                (this.clientId = ""), this.connectErrorHandler(e);
              });
        });
    }
    hasUnsentSubscriptions() {
      const e = this.getNonEmptySubscriptionKeys();
      if (e.length != this.lastSentSubscriptions.length) return !0;
      for (const t of e) if (!this.lastSentSubscriptions.includes(t)) return !0;
      return !1;
    }
    connectErrorHandler(e) {
      if (
        (clearTimeout(this.connectTimeoutId),
          clearTimeout(this.reconnectTimeoutId),
          (!this.clientId && !this.reconnectAttempts) ||
          this.reconnectAttempts > this.maxReconnectAttempts)
      ) {
        for (let t of this.pendingConnects) {
          t.reject(new ClientResponseError(e));
        }
        return (this.pendingConnects = []), void this.disconnect();
      }
      this.disconnect(!0);
      const t = this.predefinedReconnectIntervals[this.reconnectAttempts] ||
        this.predefinedReconnectIntervals[
          this.predefinedReconnectIntervals.length - 1
        ];
      this.reconnectAttempts++,
        (this.reconnectTimeoutId = setTimeout(() => {
          this.initConnect();
        }, t));
    }
    disconnect(e = !1) {
      if (
        (clearTimeout(this.connectTimeoutId),
          clearTimeout(this.reconnectTimeoutId),
          this.removeAllSubscriptionListeners(),
          this.client.cancelRequest(this.getSubscriptionsCancelKey()),
          this.eventSource?.close(),
          (this.eventSource = null),
          (this.clientId = ""),
          !e)
      ) {
        this.reconnectAttempts = 0;
        for (let e of this.pendingConnects) e.resolve();
        this.pendingConnects = [];
      }
    }
  }
  class RecordService extends CrudService {
    constructor(e, t) {
      super(e), (this.collectionIdOrName = t);
    }
    get baseCrudPath() {
      return this.baseCollectionPath + "/records";
    }
    get baseCollectionPath() {
      return "/api/collections/" + encodeURIComponent(this.collectionIdOrName);
    }
    async subscribe(e, t, s) {
      if (!e) throw new Error("Missing topic.");
      if (!t) throw new Error("Missing subscription callback.");
      return this.client.realtime.subscribe(
        this.collectionIdOrName + "/" + e,
        t,
        s,
      );
    }
    async unsubscribe(e) {
      return e
        ? this.client.realtime.unsubscribe(this.collectionIdOrName + "/" + e)
        : this.client.realtime.unsubscribeByPrefix(this.collectionIdOrName);
    }
    async getFullList(e, t) {
      if ("number" == typeof e) return super.getFullList(e, t);
      const s = Object.assign({}, e, t);
      return super.getFullList(s);
    }
    async getList(e = 1, t = 30, s) {
      return super.getList(e, t, s);
    }
    async getFirstListItem(e, t) {
      return super.getFirstListItem(e, t);
    }
    async getOne(e, t) {
      return super.getOne(e, t);
    }
    async create(e, t) {
      return super.create(e, t);
    }
    async update(e, t, s) {
      return super
        .update(e, t, s)
        .then(
          (e) => (
            this.client.authStore.model?.id !== e?.id ||
            (this.client.authStore.model?.collectionId !==
                this.collectionIdOrName &&
              this.client.authStore.model?.collectionName !==
                this.collectionIdOrName) ||
            this.client.authStore.save(this.client.authStore.token, e), e
          ),
        );
    }
    async delete(e, t) {
      return super
        .delete(e, t)
        .then(
          (t) => (
            !t ||
            this.client.authStore.model?.id !== e ||
            (this.client.authStore.model?.collectionId !==
                this.collectionIdOrName &&
              this.client.authStore.model?.collectionName !==
                this.collectionIdOrName) ||
            this.client.authStore.clear(), t
          ),
        );
    }
    authResponse(e) {
      const t = this.decode(e?.record || {});
      return (
        this.client.authStore.save(e?.token, t),
          Object.assign({}, e, { token: e?.token || "", record: t })
      );
    }
    async listAuthMethods(e) {
      return (
        (e = Object.assign({ method: "GET" }, e)),
          this.client
            .send(this.baseCollectionPath + "/auth-methods", e)
            .then((e) =>
              Object.assign({}, e, {
                usernamePassword: !!e?.usernamePassword,
                emailPassword: !!e?.emailPassword,
                authProviders: Array.isArray(e?.authProviders)
                  ? e?.authProviders
                  : [],
              })
            )
      );
    }
    async authWithPassword(e, t, s, i) {
      let n = { method: "POST", body: { identity: e, password: t } };
      return (
        (n = normalizeLegacyOptionsArgs(
          "This form of authWithPassword(usernameOrEmail, pass, body?, query?) is deprecated. Consider replacing it with authWithPassword(usernameOrEmail, pass, options?).",
          n,
          s,
          i,
        )),
          this.client
            .send(this.baseCollectionPath + "/auth-with-password", n)
            .then((e) => this.authResponse(e))
      );
    }
    async authWithOAuth2Code(e, t, s, i, n, o, r) {
      let a = {
        method: "POST",
        body: {
          provider: e,
          code: t,
          codeVerifier: s,
          redirectUrl: i,
          createData: n,
        },
      };
      return (
        (a = normalizeLegacyOptionsArgs(
          "This form of authWithOAuth2Code(provider, code, codeVerifier, redirectUrl, createData?, body?, query?) is deprecated. Consider replacing it with authWithOAuth2Code(provider, code, codeVerifier, redirectUrl, createData?, options?).",
          a,
          o,
          r,
        )),
          this.client
            .send(this.baseCollectionPath + "/auth-with-oauth2", a)
            .then((e) => this.authResponse(e))
      );
    }
    authWithOAuth2(...e) {
      if (e.length > 1 || "string" == typeof e?.[0]) {
        return (
          console.warn(
            "PocketBase: This form of authWithOAuth2() is deprecated and may get removed in the future. Please replace with authWithOAuth2Code() OR use the authWithOAuth2() realtime form as shown in https://pocketbase.io/docs/authentication/#oauth2-integration.",
          ),
            this.authWithOAuth2Code(
              e?.[0] || "",
              e?.[1] || "",
              e?.[2] || "",
              e?.[3] || "",
              e?.[4] || {},
              e?.[5] || {},
              e?.[6] || {},
            )
        );
      }
      const t = e?.[0] || {};
      let s = null;
      t.urlCallback || (s = openBrowserPopup(void 0));
      const i = new RealtimeService(this.client);
      function cleanup() {
        s?.close(), i.unsubscribe();
      }
      const n = {},
        o = t.requestKey;
      return (
        o && (n.requestKey = o),
          this.listAuthMethods(n)
            .then((e) => {
              const n = e.authProviders.find((e) => e.name === t.provider);
              if (!n) {
                throw new ClientResponseError(
                  new Error(`Missing or invalid provider "${t.provider}".`),
                );
              }
              const r = this.client.buildUrl("/api/oauth2-redirect"),
                a = o ? this.client.cancelControllers?.[o] : void 0;
              return (
                a &&
                (a.signal.onabort = () => {
                  cleanup();
                }),
                  new Promise(async (e, o) => {
                    try {
                      await i.subscribe("@oauth2", async (s) => {
                        const c = i.clientId;
                        try {
                          if (!s.state || c !== s.state) {
                            throw new Error("State parameters don't match.");
                          }
                          if (s.error || !s.code) {
                            throw new Error(
                              "OAuth2 redirect error or missing code: " +
                                s.error,
                            );
                          }
                          const i = Object.assign({}, t);
                          delete i.provider,
                            delete i.scopes,
                            delete i.createData,
                            delete i.urlCallback,
                            a?.signal?.onabort && (a.signal.onabort = null);
                          const o = await this.authWithOAuth2Code(
                            n.name,
                            s.code,
                            n.codeVerifier,
                            r,
                            t.createData,
                            i,
                          );
                          e(o);
                        } catch (e) {
                          o(new ClientResponseError(e));
                        }
                        cleanup();
                      });
                      const c = { state: i.clientId };
                      t.scopes?.length && (c.scope = t.scopes.join(" "));
                      const l = this._replaceQueryParams(n.authUrl + r, c);
                      let h = t.urlCallback ||
                        function (e) {
                          s ? (s.location.href = e) : (s = openBrowserPopup(e));
                        };
                      await h(l);
                    } catch (e) {
                      cleanup(), o(new ClientResponseError(e));
                    }
                  })
              );
            })
            .catch((e) => {
              throw (cleanup(), e);
            })
      );
    }
    async authRefresh(e, t) {
      let s = { method: "POST" };
      return (
        (s = normalizeLegacyOptionsArgs(
          "This form of authRefresh(body?, query?) is deprecated. Consider replacing it with authRefresh(options?).",
          s,
          e,
          t,
        )),
          this.client
            .send(this.baseCollectionPath + "/auth-refresh", s)
            .then((e) => this.authResponse(e))
      );
    }
    async requestPasswordReset(e, t, s) {
      let i = { method: "POST", body: { email: e } };
      return (
        (i = normalizeLegacyOptionsArgs(
          "This form of requestPasswordReset(email, body?, query?) is deprecated. Consider replacing it with requestPasswordReset(email, options?).",
          i,
          t,
          s,
        )),
          this.client
            .send(this.baseCollectionPath + "/request-password-reset", i)
            .then(() => !0)
      );
    }
    async confirmPasswordReset(e, t, s, i, n) {
      let o = {
        method: "POST",
        body: { token: e, password: t, passwordConfirm: s },
      };
      return (
        (o = normalizeLegacyOptionsArgs(
          "This form of confirmPasswordReset(token, password, passwordConfirm, body?, query?) is deprecated. Consider replacing it with confirmPasswordReset(token, password, passwordConfirm, options?).",
          o,
          i,
          n,
        )),
          this.client
            .send(this.baseCollectionPath + "/confirm-password-reset", o)
            .then(() => !0)
      );
    }
    async requestVerification(e, t, s) {
      let i = { method: "POST", body: { email: e } };
      return (
        (i = normalizeLegacyOptionsArgs(
          "This form of requestVerification(email, body?, query?) is deprecated. Consider replacing it with requestVerification(email, options?).",
          i,
          t,
          s,
        )),
          this.client
            .send(this.baseCollectionPath + "/request-verification", i)
            .then(() => !0)
      );
    }
    async confirmVerification(e, t, s) {
      let i = { method: "POST", body: { token: e } };
      return (
        (i = normalizeLegacyOptionsArgs(
          "This form of confirmVerification(token, body?, query?) is deprecated. Consider replacing it with confirmVerification(token, options?).",
          i,
          t,
          s,
        )),
          this.client
            .send(this.baseCollectionPath + "/confirm-verification", i)
            .then(() => {
              const t = getTokenPayload(e),
                s = this.client.authStore.model;
              return (
                s &&
                !s.verified &&
                s.id === t.id &&
                s.collectionId === t.collectionId &&
                ((s.verified = !0),
                  this.client.authStore.save(this.client.authStore.token, s)),
                  !0
              );
            })
      );
    }
    async requestEmailChange(e, t, s) {
      let i = { method: "POST", body: { newEmail: e } };
      return (
        (i = normalizeLegacyOptionsArgs(
          "This form of requestEmailChange(newEmail, body?, query?) is deprecated. Consider replacing it with requestEmailChange(newEmail, options?).",
          i,
          t,
          s,
        )),
          this.client
            .send(this.baseCollectionPath + "/request-email-change", i)
            .then(() => !0)
      );
    }
    async confirmEmailChange(e, t, s, i) {
      let n = { method: "POST", body: { token: e, password: t } };
      return (
        (n = normalizeLegacyOptionsArgs(
          "This form of confirmEmailChange(token, password, body?, query?) is deprecated. Consider replacing it with confirmEmailChange(token, password, options?).",
          n,
          s,
          i,
        )),
          this.client
            .send(this.baseCollectionPath + "/confirm-email-change", n)
            .then(() => {
              const t = getTokenPayload(e),
                s = this.client.authStore.model;
              return (
                s &&
                s.id === t.id &&
                s.collectionId === t.collectionId &&
                this.client.authStore.clear(), !0
              );
            })
      );
    }
    async listExternalAuths(e, t) {
      return (
        (t = Object.assign({ method: "GET" }, t)),
          this.client.send(
            this.baseCrudPath + "/" + encodeURIComponent(e) + "/external-auths",
            t,
          )
      );
    }
    async unlinkExternalAuth(e, t, s) {
      return (
        (s = Object.assign({ method: "DELETE" }, s)),
          this.client
            .send(
              this.baseCrudPath +
                "/" +
                encodeURIComponent(e) +
                "/external-auths/" +
                encodeURIComponent(t),
              s,
            )
            .then(() => !0)
      );
    }
    _replaceQueryParams(e, t = {}) {
      let s = e,
        i = "";
      e.indexOf("?") >= 0 &&
        ((s = e.substring(0, e.indexOf("?"))),
          (i = e.substring(e.indexOf("?") + 1)));
      const n = {},
        o = i.split("&");
      for (const e of o) {
        if ("" == e) continue;
        const t = e.split("=");
        n[decodeURIComponent(t[0].replace(/\+/g, " "))] = decodeURIComponent(
          (t[1] || "").replace(/\+/g, " "),
        );
      }
      for (let e in t) {
        t.hasOwnProperty(e) && (null == t[e] ? delete n[e] : (n[e] = t[e]));
      }
      i = "";
      for (let e in n) {
        n.hasOwnProperty(e) &&
          ("" != i && (i += "&"),
            (i += encodeURIComponent(e.replace(/%20/g, "+")) +
              "=" +
              encodeURIComponent(n[e].replace(/%20/g, "+"))));
      }
      return "" != i ? s + "?" + i : s;
    }
  }
  function openBrowserPopup(e) {
    if ("undefined" == typeof window || !window?.open) {
      throw new ClientResponseError(
        new Error(
          "Not in a browser context - please pass a custom urlCallback function.",
        ),
      );
    }
    let t = 1024,
      s = 768,
      i = window.innerWidth,
      n = window.innerHeight;
    (t = t > i ? i : t), (s = s > n ? n : s);
    let o = i / 2 - t / 2,
      r = n / 2 - s / 2;
    return window.open(
      e,
      "popup_window",
      "width=" +
        t +
        ",height=" +
        s +
        ",top=" +
        r +
        ",left=" +
        o +
        ",resizable,menubar=no",
    );
  }
  class CollectionService extends CrudService {
    get baseCrudPath() {
      return "/api/collections";
    }
    async import(e, t = !1, s) {
      return (
        (s = Object.assign(
          { method: "PUT", body: { collections: e, deleteMissing: t } },
          s,
        )), this.client.send(this.baseCrudPath + "/import", s).then(() => !0)
      );
    }
  }
  class LogService extends BaseService {
    async getList(e = 1, t = 30, s) {
      return (
        ((s = Object.assign({ method: "GET" }, s)).query = Object.assign(
          { page: e, perPage: t },
          s.query,
        )), this.client.send("/api/logs", s)
      );
    }
    async getOne(e, t) {
      if (!e) {
        throw new ClientResponseError({
          url: this.client.buildUrl("/api/logs/"),
          status: 404,
          response: {
            code: 404,
            message: "Missing required log id.",
            data: {},
          },
        });
      }
      return (
        (t = Object.assign({ method: "GET" }, t)),
          this.client.send("/api/logs/" + encodeURIComponent(e), t)
      );
    }
    async getStats(e) {
      return (
        (e = Object.assign({ method: "GET" }, e)),
          this.client.send("/api/logs/stats", e)
      );
    }
  }
  class HealthService extends BaseService {
    async check(e) {
      return (
        (e = Object.assign({ method: "GET" }, e)),
          this.client.send("/api/health", e)
      );
    }
  }
  class FileService extends BaseService {
    getUrl(e, t, s = {}) {
      if (!t || !e?.id || (!e?.collectionId && !e?.collectionName)) return "";
      const i = [];
      i.push("api"),
        i.push("files"),
        i.push(encodeURIComponent(e.collectionId || e.collectionName)),
        i.push(encodeURIComponent(e.id)),
        i.push(encodeURIComponent(t));
      let n = this.client.buildUrl(i.join("/"));
      if (Object.keys(s).length) {
        !1 === s.download && delete s.download;
        const e = new URLSearchParams(s);
        n += (n.includes("?") ? "&" : "?") + e;
      }
      return n;
    }
    async getToken(e) {
      return (
        (e = Object.assign({ method: "POST" }, e)),
          this.client.send("/api/files/token", e).then((e) => e?.token || "")
      );
    }
  }
  class BackupService extends BaseService {
    async getFullList(e) {
      return (
        (e = Object.assign({ method: "GET" }, e)),
          this.client.send("/api/backups", e)
      );
    }
    async create(e, t) {
      return (
        (t = Object.assign({ method: "POST", body: { name: e } }, t)),
          this.client.send("/api/backups", t).then(() => !0)
      );
    }
    async upload(e, t) {
      return (
        (t = Object.assign({ method: "POST", body: e }, t)),
          this.client.send("/api/backups/upload", t).then(() => !0)
      );
    }
    async delete(e, t) {
      return (
        (t = Object.assign({ method: "DELETE" }, t)),
          this.client
            .send(`/api/backups/${encodeURIComponent(e)}`, t)
            .then(() => !0)
      );
    }
    async restore(e, t) {
      return (
        (t = Object.assign({ method: "POST" }, t)),
          this.client
            .send(`/api/backups/${encodeURIComponent(e)}/restore`, t)
            .then(() => !0)
      );
    }
    getDownloadUrl(e, t) {
      return this.client.buildUrl(
        `/api/backups/${encodeURIComponent(t)}?token=${encodeURIComponent(e)}`,
      );
    }
  }
  return class Client {
    constructor(e = "/", t, s = "en-US") {
      (this.cancelControllers = {}),
        (this.recordServices = {}),
        (this.enableAutoCancellation = !0),
        (this.baseUrl = e),
        (this.lang = s),
        (this.authStore = t || new LocalAuthStore()),
        (this.admins = new AdminService(this)),
        (this.collections = new CollectionService(this)),
        (this.files = new FileService(this)),
        (this.logs = new LogService(this)),
        (this.settings = new SettingsService(this)),
        (this.realtime = new RealtimeService(this)),
        (this.health = new HealthService(this)),
        (this.backups = new BackupService(this));
    }
    collection(e) {
      return (
        this.recordServices[e] ||
        (this.recordServices[e] = new RecordService(this, e)),
          this.recordServices[e]
      );
    }
    autoCancellation(e) {
      return (this.enableAutoCancellation = !!e), this;
    }
    cancelRequest(e) {
      return (
        this.cancelControllers[e] &&
        (this.cancelControllers[e].abort(), delete this.cancelControllers[e]),
          this
      );
    }
    cancelAllRequests() {
      for (let e in this.cancelControllers) this.cancelControllers[e].abort();
      return (this.cancelControllers = {}), this;
    }
    filter(e, t) {
      if (!t) return e;
      for (let s in t) {
        let i = t[s];
        switch (typeof i) {
          case "boolean":
          case "number":
            i = "" + i;
            break;
          case "string":
            i = "'" + i.replace(/'/g, "\\'") + "'";
            break;
          default:
            i = null === i
              ? "null"
              : i instanceof Date
              ? "'" + i.toISOString().replace("T", " ") + "'"
              : "'" + JSON.stringify(i).replace(/'/g, "\\'") + "'";
        }
        e = e.replaceAll("{:" + s + "}", i);
      }
      return e;
    }
    getFileUrl(e, t, s = {}) {
      return this.files.getUrl(e, t, s);
    }
    buildUrl(e) {
      let t = this.baseUrl;
      return (
        "undefined" == typeof window ||
        !window.location ||
        t.startsWith("https://") ||
        t.startsWith("http://") ||
        ((t = window.location.origin?.endsWith("/")
          ? window.location.origin.substring(
            0,
            window.location.origin.length - 1,
          )
          : window.location.origin || ""),
          this.baseUrl.startsWith("/") ||
          ((t += window.location.pathname || "/"),
            (t += t.endsWith("/") ? "" : "/")),
          (t += this.baseUrl)),
          e &&
          ((t += t.endsWith("/") ? "" : "/"),
            (t += e.startsWith("/") ? e.substring(1) : e)),
          t
      );
    }
    async send(e, t) {
      t = this.initSendOptions(e, t);
      let s = this.buildUrl(e);
      if (this.beforeSend) {
        const e = Object.assign({}, await this.beforeSend(s, t));
        void 0 !== e.url || void 0 !== e.options
          ? ((s = e.url || s), (t = e.options || t))
          : Object.keys(e).length &&
            ((t = e),
              console?.warn &&
              console.warn(
                "Deprecated format of beforeSend return: please use `return { url, options }`, instead of `return options`.",
              ));
      }
      if (void 0 !== t.query) {
        const e = this.serializeQueryParams(t.query);
        e && (s += (s.includes("?") ? "&" : "?") + e), delete t.query;
      }
      "application/json" == this.getHeader(t.headers, "Content-Type") &&
        t.body &&
        "string" != typeof t.body &&
        (t.body = JSON.stringify(t.body));
      return (t.fetch || fetch)(s, t)
        .then(async (e) => {
          let t = {};
          try {
            t = await e.json();
          } catch (e) {}
          if (
            (this.afterSend && (t = await this.afterSend(e, t)),
              e.status >= 400)
          ) {
            throw new ClientResponseError({
              url: e.url,
              status: e.status,
              data: t,
            });
          }
          return t;
        })
        .catch((e) => {
          throw new ClientResponseError(e);
        });
    }
    initSendOptions(e, t) {
      if (
        (((t = Object.assign({ method: "GET" }, t)).body = this
          .convertToFormDataIfNeeded(t.body)),
          normalizeUnknownQueryParams(t),
          (t.query = Object.assign({}, t.params, t.query)),
          void 0 === t.requestKey &&
          (!1 === t.$autoCancel || !1 === t.query.$autoCancel
            ? (t.requestKey = null)
            : (t.$cancelKey || t.query.$cancelKey) &&
              (t.requestKey = t.$cancelKey || t.query.$cancelKey)),
          delete t.$autoCancel,
          delete t.query.$autoCancel,
          delete t.$cancelKey,
          delete t.query.$cancelKey,
          null !== this.getHeader(t.headers, "Content-Type") ||
          this.isFormData(t.body) ||
          (t.headers = Object.assign({}, t.headers, {
            "Content-Type": "application/json",
          })),
          null === this.getHeader(t.headers, "Accept-Language") &&
          (t.headers = Object.assign({}, t.headers, {
            "Accept-Language": this.lang,
          })),
          this.authStore.token &&
          null === this.getHeader(t.headers, "Authorization") &&
          (t.headers = Object.assign({}, t.headers, {
            Authorization: this.authStore.token,
          })),
          this.enableAutoCancellation && null !== t.requestKey)
      ) {
        const s = t.requestKey || (t.method || "GET") + e;
        delete t.requestKey, this.cancelRequest(s);
        const i = new AbortController();
        (this.cancelControllers[s] = i), (t.signal = i.signal);
      }
      return t;
    }
    convertToFormDataIfNeeded(e) {
      if (
        "undefined" == typeof FormData ||
        void 0 === e ||
        "object" != typeof e ||
        null === e ||
        this.isFormData(e) ||
        !this.hasBlobField(e)
      ) {
        return e;
      }
      const t = new FormData();
      for (const s in e) {
        const i = e[s];
        if ("object" != typeof i || this.hasBlobField({ data: i })) {
          const e = Array.isArray(i) ? i : [i];
          for (let i of e) t.append(s, i);
        } else {
          let e = {};
          (e[s] = i), t.append("@jsonPayload", JSON.stringify(e));
        }
      }
      return t;
    }
    hasBlobField(e) {
      for (const t in e) {
        const s = Array.isArray(e[t]) ? e[t] : [e[t]];
        for (const e of s) {
          if (
            ("undefined" != typeof Blob && e instanceof Blob) ||
            ("undefined" != typeof File && e instanceof File)
          ) {
            return !0;
          }
        }
      }
      return !1;
    }
    getHeader(e, t) {
      (e = e || {}), (t = t.toLowerCase());
      for (let s in e) if (s.toLowerCase() == t) return e[s];
      return null;
    }
    isFormData(e) {
      return (
        e &&
        ("FormData" === e.constructor.name ||
          ("undefined" != typeof FormData && e instanceof FormData))
      );
    }
    serializeQueryParams(e) {
      const t = [];
      for (const s in e) {
        if (null === e[s]) continue;
        const i = e[s],
          n = encodeURIComponent(s);
        if (Array.isArray(i)) {
          for (const e of i) t.push(n + "=" + encodeURIComponent(e));
        } else {
          i instanceof Date
            ? t.push(n + "=" + encodeURIComponent(i.toISOString()))
            : null !== typeof i && "object" == typeof i
            ? t.push(n + "=" + encodeURIComponent(JSON.stringify(i)))
            : t.push(n + "=" + encodeURIComponent(i));
        }
      }
      return t.join("&");
    }
  };
});
//# sourceMappingURL=pocketbase.umd.js.map
