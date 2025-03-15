const u = {
  store: Symbol("store"),
  event: Symbol("event"),
  action: Symbol("action"),
  scope: Symbol("scope"),
  region: Symbol("region")
}, h = [];
let a;
function y(t) {
  return a && h.push(a), a = t, {
    cancel() {
      a = h.pop();
    }
  };
}
function p(...t) {
  for (const e of t)
    a == null || a(e);
}
const $ = {
  store(t) {
    return t !== null && typeof t == "object" && "$$type" in t && t.$$type === u.store;
  },
  event(t) {
    return t !== null && typeof t == "object" && "$$type" in t && t.$$type === u.event;
  },
  action(t) {
    return t !== null && typeof t == "object" && "$$type" in t && t.$$type === u.action;
  },
  region(t) {
    return t !== null && typeof t == "object" && "$$type" in t && t.$$type === u.region;
  },
  scope(t) {
    return t !== null && typeof t == "object" && "$$type" in t && t.$$type === u.scope;
  }
};
function l() {
  const t = [];
  let e = [];
  const n = Object.assign(
    function(s) {
      for (const o of e)
        o.call(this, s);
    },
    {
      map: (s) => {
        const o = l();
        return n.on(function(c) {
          this.scope.touch(o, s(c));
        }), t.push(o), o;
      },
      filter: (s) => {
        const o = l();
        return n.on(function(c) {
          s(c) && this.scope.touch(o, c);
        }), t.push(o), o;
      },
      on: (s) => e.push(s)
    }
  );
  return p(n), Object.assign(n, {
    $$type: u.event,
    derivedUnits: t,
    clearHandlers() {
      e = [];
    }
  });
}
function g(t) {
  const e = l(), n = {
    defaultValue: t,
    changed: e
  };
  return p(n, e), n;
}
function d(t) {
  const e = l(), n = l(), s = l(), o = l(), c = Object.assign(
    async function(i) {
      try {
        const r = await t(i);
        return await this.scope.touch(e, { params: i, result: r }), await this.scope.touch(s, r), r;
      } catch (r) {
        const f = r;
        return await this.scope.touch(n, { params: i, result: f }), await this.scope.touch(o, f), Promise.reject(f);
      }
    },
    {
      fail: n,
      failData: o,
      done: e,
      doneData: s,
      derivedUnits: [e, n, s, o],
      clearHandler() {
      }
    }
  );
  return p(c), c;
}
function v(t) {
  const e = [], { cancel: n } = y((c) => e.push(c));
  t(), n();
  function s(c) {
    const i = [c];
    for (; i.length; ) {
      const r = i.shift();
      r.clearHandlers(), i.push(...r.derivedUnits);
    }
  }
  const o = {
    destroy() {
      for (const c of e)
        s(c);
    }
  };
  return p(o), Object.assign(o, { $$type: u.region });
}
function S() {
  const t = {
    values: /* @__PURE__ */ new WeakMap(),
    async touch(e, n) {
      $.store(e) ? t.get(e) !== n && (t.values.set(e, n), e.changed.call(t, n)) : e.call(t, n);
    },
    get: (e) => t.values.get(e) ?? e.defaultValue
  };
  return t;
}
export {
  d as createAction,
  l as createEvent,
  v as createRegion,
  S as createScope,
  g as createStore,
  $ as is
};
//# sourceMappingURL=index.mjs.map
