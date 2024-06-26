function makeMap(e, t) {
  const n = Object.create(null);
  var r = e.split(",");
  for (let e = 0; e < r.length; e++) n[r[e]] = !0;
  return t ? (e) => !!n[e.toLowerCase()] : (e) => !!n[e];
}
const PatchFlagNames = {
    [1]: "TEXT",
    2: "CLASS",
    4: "STYLE",
    8: "PROPS",
    16: "FULL_PROPS",
    32: "HYDRATE_EVENTS",
    64: "STABLE_FRAGMENT",
    128: "KEYED_FRAGMENT",
    256: "UNKEYED_FRAGMENT",
    512: "NEED_PATCH",
    1024: "DYNAMIC_SLOTS",
    2048: "DEV_ROOT_FRAGMENT",
    "-1": "HOISTED",
    "-2": "BAIL",
  },
  slotFlagsText = { [1]: "STABLE", 2: "DYNAMIC", 3: "FORWARDED" },
  GLOBALS_WHITE_LISTED =
    "Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt",
  isGloballyWhitelisted = makeMap(GLOBALS_WHITE_LISTED),
  range = 2;
function generateCodeFrame(e, n = 0, r = e.length) {
  let o = e.split(/(\r?\n)/);
  var s,
    i,
    a,
    l,
    c = o.filter((e, t) => t % 2 == 1);
  o = o.filter((e, t) => t % 2 == 0);
  let p = 0;
  const u = [];
  for (let t = 0; t < o.length; t++)
    if ((p += o[t].length + ((c[t] && c[t].length) || 0)) >= n) {
      for (let e = t - range; e <= t + range || r > p; e++)
        e < 0 ||
          e >= o.length ||
          ((s = e + 1),
          u.push(
            "" +
              s +
              " ".repeat(Math.max(3 - String(s).length, 0)) +
              "|  " +
              o[e]
          ),
          (s = o[e].length),
          (i = (c[e] && c[e].length) || 0),
          e === t
            ? ((l = n - (p - (s + i))),
              (a = Math.max(1, r > p ? s - l : r - n)),
              u.push("   |  " + " ".repeat(l) + "^".repeat(a)))
            : e > t &&
              (r > p &&
                ((l = Math.max(Math.min(r - p, s), 1)),
                u.push("   |  " + "^".repeat(l))),
              (p += s + i)));
      break;
    }
  return u.join("\n");
}
function normalizeStyle(t) {
  if (isArray(t)) {
    const o = {};
    for (let e = 0; e < t.length; e++) {
      var n = t[e],
        r = (isString(n) ? parseStringStyle : normalizeStyle)(n);
      if (r) for (const s in r) o[s] = r[s];
    }
    return o;
  }
  return isString(t) || isObject(t) ? t : void 0;
}
const listDelimiterRE = /;(?![^(]*\))/g,
  propertyDelimiterRE = /:([^]+)/,
  styleCommentRE = /\/\*.*?\*\//gs;
function parseStringStyle(e) {
  const n = {};
  return (
    e
      .replace(styleCommentRE, "")
      .split(listDelimiterRE)
      .forEach((e) => {
        if (e) {
          const t = e.split(propertyDelimiterRE);
          1 < t.length && (n[t[0].trim()] = t[1].trim());
        }
      }),
    n
  );
}
function normalizeClass(t) {
  let n = "";
  if (isString(t)) n = t;
  else if (isArray(t))
    for (let e = 0; e < t.length; e++) {
      var r = normalizeClass(t[e]);
      r && (n += r + " ");
    }
  else if (isObject(t)) for (const e in t) t[e] && (n += e + " ");
  return n.trim();
}
function normalizeProps(e) {
  if (!e) return null;
  var { class: t, style: n } = e;
  return (
    t && !isString(t) && (e.class = normalizeClass(t)),
    n && (e.style = normalizeStyle(n)),
    e
  );
}
const HTML_TAGS =
    "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot",
  SVG_TAGS =
    "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistanceLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view",
  VOID_TAGS =
    "area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr",
  isHTMLTag = makeMap(HTML_TAGS),
  isSVGTag = makeMap(SVG_TAGS),
  isVoidTag = makeMap(VOID_TAGS),
  specialBooleanAttrs =
    "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",
  isSpecialBooleanAttr = makeMap(specialBooleanAttrs);
function includeBooleanAttr(e) {
  return !!e || "" === e;
}
function looseCompareArrays(t, n) {
  if (t.length !== n.length) return !1;
  let r = !0;
  for (let e = 0; r && e < t.length; e++) r = looseEqual(t[e], n[e]);
  return r;
}
function looseEqual(e, t) {
  if (e === t) return !0;
  let n = isDate(e),
    r = isDate(t);
  if (n || r) return !(!n || !r) && e.getTime() === t.getTime();
  if (((n = isSymbol(e)), (r = isSymbol(t)), n || r)) return e === t;
  if (((n = isArray(e)), (r = isArray(t)), n || r))
    return !(!n || !r) && looseCompareArrays(e, t);
  if (((n = isObject(e)), (r = isObject(t)), n || r)) {
    if (!n || !r) return !1;
    if (Object.keys(e).length !== Object.keys(t).length) return !1;
    for (const i in e) {
      var o = e.hasOwnProperty(i),
        s = t.hasOwnProperty(i);
      if ((o && !s) || (!o && s) || !looseEqual(e[i], t[i])) return !1;
    }
  }
  return String(e) === String(t);
}
function looseIndexOf(e, t) {
  return e.findIndex((e) => looseEqual(e, t));
}
const toDisplayString = (e) =>
    isString(e)
      ? e
      : null == e
      ? ""
      : isArray(e) ||
        (isObject(e) &&
          (e.toString === objectToString || !isFunction(e.toString)))
      ? JSON.stringify(e, replacer, 2)
      : String(e),
  replacer = (e, t) =>
    t && t.__v_isRef
      ? replacer(e, t.value)
      : isMap(t)
      ? {
          [`Map(${t.size})`]: [...t.entries()].reduce(
            (e, [t, n]) => ((e[t + " =>"] = n), e),
            {}
          ),
        }
      : isSet(t)
      ? { [`Set(${t.size})`]: [...t.values()] }
      : !isObject(t) || isArray(t) || isPlainObject(t)
      ? t
      : String(t),
  EMPTY_OBJ = Object.freeze({}),
  EMPTY_ARR = Object.freeze([]),
  NOOP = () => {},
  NO = () => !1,
  onRE = /^on[^a-z]/,
  isOn = (e) => onRE.test(e),
  isModelListener = (e) => e.startsWith("onUpdate:"),
  extend = Object.assign,
  remove = (e, t) => {
    t = e.indexOf(t);
    -1 < t && e.splice(t, 1);
  },
  hasOwnProperty = Object.prototype.hasOwnProperty,
  hasOwn = (e, t) => hasOwnProperty.call(e, t),
  isArray = Array.isArray,
  isMap = (e) => "[object Map]" === toTypeString(e),
  isSet = (e) => "[object Set]" === toTypeString(e),
  isDate = (e) => "[object Date]" === toTypeString(e),
  isFunction = (e) => "function" == typeof e,
  isString = (e) => "string" == typeof e,
  isSymbol = (e) => "symbol" == typeof e,
  isObject = (e) => null !== e && "object" == typeof e,
  isPromise = (e) => isObject(e) && isFunction(e.then) && isFunction(e.catch),
  objectToString = Object.prototype.toString,
  toTypeString = (e) => objectToString.call(e),
  toRawType = (e) => toTypeString(e).slice(8, -1),
  isPlainObject = (e) => "[object Object]" === toTypeString(e),
  isIntegerKey = (e) =>
    isString(e) && "NaN" !== e && "-" !== e[0] && "" + parseInt(e, 10) === e,
  isReservedProp = makeMap(
    ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
  ),
  isBuiltInDirective = makeMap(
    "bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo"
  ),
  cacheStringFunction = (t) => {
    const n = Object.create(null);
    return (e) => {
      return n[e] || (n[e] = t(e));
    };
  },
  camelizeRE = /-(\w)/g,
  camelize = cacheStringFunction((e) =>
    e.replace(camelizeRE, (e, t) => (t ? t.toUpperCase() : ""))
  ),
  hyphenateRE = /\B([A-Z])/g,
  hyphenate = cacheStringFunction((e) =>
    e.replace(hyphenateRE, "-$1").toLowerCase()
  ),
  capitalize = cacheStringFunction(
    (e) => e.charAt(0).toUpperCase() + e.slice(1)
  ),
  toHandlerKey = cacheStringFunction((e) => (e ? "on" + capitalize(e) : "")),
  hasChanged = (e, t) => !Object.is(e, t),
  invokeArrayFns = (t, n) => {
    for (let e = 0; e < t.length; e++) t[e](n);
  },
  def = (e, t, n) => {
    Object.defineProperty(e, t, { configurable: !0, enumerable: !1, value: n });
  },
  toNumber = (e) => {
    var t = parseFloat(e);
    return isNaN(t) ? e : t;
  };
let _globalThis;
const getGlobalThis = () =>
  (_globalThis =
    _globalThis ||
    ("undefined" != typeof globalThis
      ? globalThis
      : "undefined" != typeof self
      ? self
      : "undefined" != typeof window
      ? window
      : "undefined" != typeof global
      ? global
      : {}));
function warn(e, ...t) {
  console.warn("[Vue warn] " + e, ...t);
}
let activeEffectScope;
class EffectScope {
  constructor(e = !1) {
    (this.detached = e),
      (this.active = !0),
      (this.effects = []),
      (this.cleanups = []),
      (this.parent = activeEffectScope),
      !e &&
        activeEffectScope &&
        (this.index =
          (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
            this
          ) - 1);
  }
  run(e) {
    if (this.active) {
      var t = activeEffectScope;
      try {
        return (activeEffectScope = this), e();
      } finally {
        activeEffectScope = t;
      }
    } else warn("cannot run an inactive effect scope.");
  }
  on() {
    activeEffectScope = this;
  }
  off() {
    activeEffectScope = this.parent;
  }
  stop(n) {
    if (this.active) {
      let e, t;
      for (e = 0, t = this.effects.length; e < t; e++) this.effects[e].stop();
      for (e = 0, t = this.cleanups.length; e < t; e++) this.cleanups[e]();
      if (this.scopes)
        for (e = 0, t = this.scopes.length; e < t; e++) this.scopes[e].stop(!0);
      if (!this.detached && this.parent && !n) {
        const r = this.parent.scopes.pop();
        r &&
          r !== this &&
          ((this.parent.scopes[this.index] = r).index = this.index);
      }
      (this.parent = void 0), (this.active = !1);
    }
  }
}
function effectScope(e) {
  return new EffectScope(e);
}
function recordEffectScope(e, t = activeEffectScope) {
  t && t.active && t.effects.push(e);
}
function getCurrentScope() {
  return activeEffectScope;
}
function onScopeDispose(e) {
  activeEffectScope
    ? activeEffectScope.cleanups.push(e)
    : warn(
        "onScopeDispose() is called when there is no active effect scope to be associated with."
      );
}
const createDep = (e) => {
    const t = new Set(e);
    return (t.w = 0), (t.n = 0), t;
  },
  wasTracked = (e) => 0 < (e.w & trackOpBit),
  newTracked = (e) => 0 < (e.n & trackOpBit),
  initDepMarkers = ({ deps: t }) => {
    if (t.length) for (let e = 0; e < t.length; e++) t[e].w |= trackOpBit;
  },
  finalizeDepMarkers = (n) => {
    const r = n["deps"];
    if (r.length) {
      let t = 0;
      for (let e = 0; e < r.length; e++) {
        const o = r[e];
        wasTracked(o) && !newTracked(o) ? o.delete(n) : (r[t++] = o),
          (o.w &= ~trackOpBit),
          (o.n &= ~trackOpBit);
      }
      r.length = t;
    }
  },
  targetMap = new WeakMap();
let effectTrackDepth = 0,
  trackOpBit = 1;
const maxMarkerBits = 30;
let activeEffect;
const ITERATE_KEY = Symbol("iterate"),
  MAP_KEY_ITERATE_KEY = Symbol("Map key iterate");
class ReactiveEffect {
  constructor(e, t = null, n) {
    (this.fn = e),
      (this.scheduler = t),
      (this.active = !0),
      (this.deps = []),
      (this.parent = void 0),
      recordEffectScope(this, n);
  }
  run() {
    if (!this.active) return this.fn();
    let e = activeEffect;
    for (var t = shouldTrack; e; ) {
      if (e === this) return;
      e = e.parent;
    }
    try {
      return (
        (this.parent = activeEffect),
        (activeEffect = this),
        (shouldTrack = !0),
        (trackOpBit = 1 << ++effectTrackDepth),
        (effectTrackDepth <= maxMarkerBits ? initDepMarkers : cleanupEffect)(
          this
        ),
        this.fn()
      );
    } finally {
      effectTrackDepth <= maxMarkerBits && finalizeDepMarkers(this),
        (trackOpBit = 1 << --effectTrackDepth),
        (activeEffect = this.parent),
        (shouldTrack = t),
        (this.parent = void 0),
        this.deferStop && this.stop();
    }
  }
  stop() {
    activeEffect === this
      ? (this.deferStop = !0)
      : this.active &&
        (cleanupEffect(this), this.onStop && this.onStop(), (this.active = !1));
  }
}
function cleanupEffect(t) {
  const n = t["deps"];
  if (n.length) {
    for (let e = 0; e < n.length; e++) n[e].delete(t);
    n.length = 0;
  }
}
function effect(e, t) {
  e.effect && (e = e.effect.fn);
  const n = new ReactiveEffect(e),
    r =
      (t && (extend(n, t), t.scope && recordEffectScope(n, t.scope)),
      (t && t.lazy) || n.run(),
      n.run.bind(n));
  return (r.effect = n), r;
}
function stop(e) {
  e.effect.stop();
}
let shouldTrack = !0;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack), (shouldTrack = !1);
}
function resetTracking() {
  var e = trackStack.pop();
  shouldTrack = void 0 === e || e;
}
function track(n, r, o) {
  if (shouldTrack && activeEffect) {
    let e = targetMap.get(n),
      t = (e || targetMap.set(n, (e = new Map())), e.get(o));
    t || e.set(o, (t = createDep()));
    n = { effect: activeEffect, target: n, type: r, key: o };
    trackEffects(t, n);
  }
}
function trackEffects(e, t) {
  let n = !1;
  effectTrackDepth <= maxMarkerBits
    ? newTracked(e) || ((e.n |= trackOpBit), (n = !wasTracked(e)))
    : (n = !e.has(activeEffect)),
    n &&
      (e.add(activeEffect),
      activeEffect.deps.push(e),
      activeEffect.onTrack &&
        activeEffect.onTrack(Object.assign({ effect: activeEffect }, t)));
}
function trigger(e, t, r, o, s, i) {
  const a = targetMap.get(e);
  if (a) {
    let n = [];
    if ("clear" === t) n = [...a.values()];
    else if ("length" === r && isArray(e)) {
      const l = toNumber(o);
      a.forEach((e, t) => {
        ("length" === t || t >= l) && n.push(e);
      });
    } else
      switch ((void 0 !== r && n.push(a.get(r)), t)) {
        case "add":
          isArray(e)
            ? isIntegerKey(r) && n.push(a.get("length"))
            : (n.push(a.get(ITERATE_KEY)),
              isMap(e) && n.push(a.get(MAP_KEY_ITERATE_KEY)));
          break;
        case "delete":
          isArray(e) ||
            (n.push(a.get(ITERATE_KEY)),
            isMap(e) && n.push(a.get(MAP_KEY_ITERATE_KEY)));
          break;
        case "set":
          isMap(e) && n.push(a.get(ITERATE_KEY));
      }
    t = { target: e, type: t, key: r, newValue: o, oldValue: s, oldTarget: i };
    if (1 === n.length) n[0] && triggerEffects(n[0], t);
    else {
      const c = [];
      for (const p of n) p && c.push(...p);
      triggerEffects(createDep(c), t);
    }
  }
}
function triggerEffects(e, t) {
  e = isArray(e) ? e : [...e];
  for (const n of e) n.computed && triggerEffect(n, t);
  for (const r of e) r.computed || triggerEffect(r, t);
}
function triggerEffect(e, t) {
  (e === activeEffect && !e.allowRecurse) ||
    (e.onTrigger && e.onTrigger(extend({ effect: e }, t)),
    e.scheduler ? e.scheduler() : e.run());
}
const isNonTrackableKeys = makeMap("__proto__,__v_isRef,__isVue"),
  builtInSymbols = new Set(
    Object.getOwnPropertyNames(Symbol)
      .filter((e) => "arguments" !== e && "caller" !== e)
      .map((e) => Symbol[e])
      .filter(isSymbol)
  ),
  get = createGetter(),
  shallowGet = createGetter(!1, !0),
  readonlyGet = createGetter(!0),
  shallowReadonlyGet = createGetter(!0, !0),
  arrayInstrumentations = createArrayInstrumentations();
function createArrayInstrumentations() {
  const e = {};
  return (
    ["includes", "indexOf", "lastIndexOf"].forEach((r) => {
      e[r] = function (...e) {
        const n = toRaw(this);
        for (let e = 0, t = this.length; e < t; e++) track(n, "get", e + "");
        var t = n[r](...e);
        return -1 === t || !1 === t ? n[r](...e.map(toRaw)) : t;
      };
    }),
    ["push", "pop", "shift", "unshift", "splice"].forEach((t) => {
      e[t] = function (...e) {
        pauseTracking();
        e = toRaw(this)[t].apply(this, e);
        return resetTracking(), e;
      };
    }),
    e
  );
}
function createGetter(o = !1, s = !1) {
  return function (e, t, n) {
    if ("__v_isReactive" === t) return !o;
    if ("__v_isReadonly" === t) return o;
    if ("__v_isShallow" === t) return s;
    if (
      "__v_raw" === t &&
      n ===
        (o
          ? s
            ? shallowReadonlyMap
            : readonlyMap
          : s
          ? shallowReactiveMap
          : reactiveMap
        ).get(e)
    )
      return e;
    var r = isArray(e);
    if (!o && r && hasOwn(arrayInstrumentations, t))
      return Reflect.get(arrayInstrumentations, t, n);
    n = Reflect.get(e, t, n);
    return (isSymbol(t) ? builtInSymbols.has(t) : isNonTrackableKeys(t))
      ? n
      : (o || track(e, "get", t),
        s
          ? n
          : isRef(n)
          ? r && isIntegerKey(t)
            ? n
            : n.value
          : isObject(n)
          ? (o ? readonly : reactive)(n)
          : n);
  };
}
const set = createSetter(),
  shallowSet = createSetter(!0);
function createSetter(a = !1) {
  return function (e, t, n, r) {
    let o = e[t];
    if (isReadonly(o) && isRef(o) && !isRef(n)) return !1;
    if (
      !a &&
      (isShallow(n) || isReadonly(n) || ((o = toRaw(o)), (n = toRaw(n))),
      !isArray(e) && isRef(o) && !isRef(n))
    )
      return (o.value = n), !0;
    var s = isArray(e) && isIntegerKey(t) ? Number(t) < e.length : hasOwn(e, t),
      i = Reflect.set(e, t, n, r);
    return (
      e === toRaw(r) &&
        (s
          ? hasChanged(n, o) && trigger(e, "set", t, n, o)
          : trigger(e, "add", t, n)),
      i
    );
  };
}
function deleteProperty(e, t) {
  var n = hasOwn(e, t),
    r = e[t],
    o = Reflect.deleteProperty(e, t);
  return o && n && trigger(e, "delete", t, void 0, r), o;
}
function has(e, t) {
  var n = Reflect.has(e, t);
  return (isSymbol(t) && builtInSymbols.has(t)) || track(e, "has", t), n;
}
function ownKeys(e) {
  return (
    track(e, "iterate", isArray(e) ? "length" : ITERATE_KEY), Reflect.ownKeys(e)
  );
}
const mutableHandlers = {
    get: get,
    set: set,
    deleteProperty: deleteProperty,
    has: has,
    ownKeys: ownKeys,
  },
  readonlyHandlers = {
    get: readonlyGet,
    set(e, t) {
      return (
        warn(
          `Set operation on key "${String(t)}" failed: target is readonly.`,
          e
        ),
        !0
      );
    },
    deleteProperty(e, t) {
      return (
        warn(
          `Delete operation on key "${String(t)}" failed: target is readonly.`,
          e
        ),
        !0
      );
    },
  },
  shallowReactiveHandlers = extend({}, mutableHandlers, {
    get: shallowGet,
    set: shallowSet,
  }),
  shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
  }),
  toShallow = (e) => e,
  getProto = (e) => Reflect.getPrototypeOf(e);
function get$1(e, t, n = !1, r = !1) {
  var o = toRaw((e = e.__v_raw)),
    s = toRaw(t);
  n || (t !== s && track(o, "get", t), track(o, "get", s));
  const i = getProto(o)["has"],
    a = r ? toShallow : n ? toReadonly : toReactive;
  return i.call(o, t)
    ? a(e.get(t))
    : i.call(o, s)
    ? a(e.get(s))
    : void (e !== o && e.get(t));
}
function has$1(e, t = !1) {
  const n = this.__v_raw;
  var r = toRaw(n),
    o = toRaw(e);
  return (
    t || (e !== o && track(r, "has", e), track(r, "has", o)),
    e === o ? n.has(e) : n.has(e) || n.has(o)
  );
}
function size(e, t = !1) {
  return (
    (e = e.__v_raw),
    t || track(toRaw(e), "iterate", ITERATE_KEY),
    Reflect.get(e, "size", e)
  );
}
function add(e) {
  e = toRaw(e);
  const t = toRaw(this),
    n = getProto(t);
  return n.has.call(t, e) || (t.add(e), trigger(t, "add", e, e)), this;
}
function set$1(e, t) {
  t = toRaw(t);
  const n = toRaw(this),
    { has: r, get: o } = getProto(n);
  let s = r.call(n, e);
  s ? checkIdentityKeys(n, r, e) : ((e = toRaw(e)), (s = r.call(n, e)));
  var i = o.call(n, e);
  return (
    n.set(e, t),
    s
      ? hasChanged(t, i) && trigger(n, "set", e, t, i)
      : trigger(n, "add", e, t),
    this
  );
}
function deleteEntry(e) {
  const t = toRaw(this),
    { has: n, get: r } = getProto(t);
  let o = n.call(t, e);
  o ? checkIdentityKeys(t, n, e) : ((e = toRaw(e)), (o = n.call(t, e)));
  var s = r ? r.call(t, e) : void 0,
    i = t.delete(e);
  return o && trigger(t, "delete", e, void 0, s), i;
}
function clear() {
  const e = toRaw(this);
  var t = 0 !== e.size,
    n = new (isMap(e) ? Map : Set)(e),
    r = e.clear();
  return t && trigger(e, "clear", void 0, void 0, n), r;
}
function createForEach(i, a) {
  return function (n, r) {
    const o = this,
      e = o.__v_raw;
    var t = toRaw(e);
    const s = a ? toShallow : i ? toReadonly : toReactive;
    return (
      i || track(t, "iterate", ITERATE_KEY),
      e.forEach((e, t) => n.call(r, s(e), s(t), o))
    );
  };
}
function createIterableMethod(a, l, c) {
  return function (...e) {
    const t = this.__v_raw;
    var n = toRaw(t),
      r = isMap(n);
    const o = "entries" === a || (a === Symbol.iterator && r);
    r = "keys" === a && r;
    const s = t[a](...e),
      i = c ? toShallow : l ? toReadonly : toReactive;
    return (
      l || track(n, "iterate", r ? MAP_KEY_ITERATE_KEY : ITERATE_KEY),
      {
        next() {
          var { value: e, done: t } = s.next();
          return t
            ? { value: e, done: t }
            : { value: o ? [i(e[0]), i(e[1])] : i(e), done: t };
        },
        [Symbol.iterator]() {
          return this;
        },
      }
    );
  };
}
function createReadonlyMethod(t) {
  return function (...e) {
    e = e[0] ? `on key "${e[0]}" ` : "";
    return (
      console.warn(
        capitalize(t) + ` operation ${e}failed: target is readonly.`,
        toRaw(this)
      ),
      "delete" !== t && this
    );
  };
}
function createInstrumentations() {
  const t = {
      get(e) {
        return get$1(this, e);
      },
      get size() {
        return size(this);
      },
      has: has$1,
      add: add,
      set: set$1,
      delete: deleteEntry,
      clear: clear,
      forEach: createForEach(!1, !1),
    },
    n = {
      get(e) {
        return get$1(this, e, !1, !0);
      },
      get size() {
        return size(this);
      },
      has: has$1,
      add: add,
      set: set$1,
      delete: deleteEntry,
      clear: clear,
      forEach: createForEach(!1, !0),
    },
    r = {
      get(e) {
        return get$1(this, e, !0);
      },
      get size() {
        return size(this, !0);
      },
      has(e) {
        return has$1.call(this, e, !0);
      },
      add: createReadonlyMethod("add"),
      set: createReadonlyMethod("set"),
      delete: createReadonlyMethod("delete"),
      clear: createReadonlyMethod("clear"),
      forEach: createForEach(!0, !1),
    },
    o = {
      get(e) {
        return get$1(this, e, !0, !0);
      },
      get size() {
        return size(this, !0);
      },
      has(e) {
        return has$1.call(this, e, !0);
      },
      add: createReadonlyMethod("add"),
      set: createReadonlyMethod("set"),
      delete: createReadonlyMethod("delete"),
      clear: createReadonlyMethod("clear"),
      forEach: createForEach(!0, !0),
    },
    e = ["keys", "values", "entries", Symbol.iterator];
  return (
    e.forEach((e) => {
      (t[e] = createIterableMethod(e, !1, !1)),
        (r[e] = createIterableMethod(e, !0, !1)),
        (n[e] = createIterableMethod(e, !1, !0)),
        (o[e] = createIterableMethod(e, !0, !0));
    }),
    [t, r, n, o]
  );
}
const [
  mutableInstrumentations,
  readonlyInstrumentations,
  shallowInstrumentations,
  shallowReadonlyInstrumentations,
] = createInstrumentations();
function createInstrumentationGetter(r, e) {
  const o = e
    ? r
      ? shallowReadonlyInstrumentations
      : shallowInstrumentations
    : r
    ? readonlyInstrumentations
    : mutableInstrumentations;
  return (e, t, n) =>
    "__v_isReactive" === t
      ? !r
      : "__v_isReadonly" === t
      ? r
      : "__v_raw" === t
      ? e
      : Reflect.get(hasOwn(o, t) && t in e ? o : e, t, n);
}
const mutableCollectionHandlers = { get: createInstrumentationGetter(!1, !1) },
  shallowCollectionHandlers = { get: createInstrumentationGetter(!1, !0) },
  readonlyCollectionHandlers = { get: createInstrumentationGetter(!0, !1) },
  shallowReadonlyCollectionHandlers = {
    get: createInstrumentationGetter(!0, !0),
  };
function checkIdentityKeys(e, t, n) {
  var r = toRaw(n);
  r !== n &&
    t.call(e, r) &&
    ((n = toRawType(e)),
    console.warn(
      `Reactive ${n} contains both the raw and reactive ` +
        `versions of the same object${"Map" === n ? " as keys" : ""}, ` +
        "which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible."
    ));
}
const reactiveMap = new WeakMap(),
  shallowReactiveMap = new WeakMap(),
  readonlyMap = new WeakMap(),
  shallowReadonlyMap = new WeakMap();
function targetTypeMap(e) {
  switch (e) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(e) {
  return e.__v_skip || !Object.isExtensible(e)
    ? 0
    : targetTypeMap(toRawType(e));
}
function reactive(e) {
  return isReadonly(e)
    ? e
    : createReactiveObject(
        e,
        !1,
        mutableHandlers,
        mutableCollectionHandlers,
        reactiveMap
      );
}
function shallowReactive(e) {
  return createReactiveObject(
    e,
    !1,
    shallowReactiveHandlers,
    shallowCollectionHandlers,
    shallowReactiveMap
  );
}
function readonly(e) {
  return createReactiveObject(
    e,
    !0,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
function shallowReadonly(e) {
  return createReactiveObject(
    e,
    !0,
    shallowReadonlyHandlers,
    shallowReadonlyCollectionHandlers,
    shallowReadonlyMap
  );
}
function createReactiveObject(e, t, n, r, o) {
  if (!isObject(e))
    return console.warn("value cannot be made reactive: " + String(e)), e;
  if (e.__v_raw && (!t || !e.__v_isReactive)) return e;
  t = o.get(e);
  if (t) return t;
  t = getTargetType(e);
  if (0 === t) return e;
  t = new Proxy(e, 2 === t ? r : n);
  return o.set(e, t), t;
}
function isReactive(e) {
  return isReadonly(e) ? isReactive(e.__v_raw) : !(!e || !e.__v_isReactive);
}
function isReadonly(e) {
  return !(!e || !e.__v_isReadonly);
}
function isShallow(e) {
  return !(!e || !e.__v_isShallow);
}
function isProxy(e) {
  return isReactive(e) || isReadonly(e);
}
function toRaw(e) {
  var t = e && e.__v_raw;
  return t ? toRaw(t) : e;
}
function markRaw(e) {
  return def(e, "__v_skip", !0), e;
}
const toReactive = (e) => (isObject(e) ? reactive(e) : e),
  toReadonly = (e) => (isObject(e) ? readonly(e) : e);
function trackRefValue(e) {
  shouldTrack &&
    activeEffect &&
    trackEffects((e = toRaw(e)).dep || (e.dep = createDep()), {
      target: e,
      type: "get",
      key: "value",
    });
}
function triggerRefValue(e, t) {
  (e = toRaw(e)).dep &&
    triggerEffects(e.dep, {
      target: e,
      type: "set",
      key: "value",
      newValue: t,
    });
}
function isRef(e) {
  return !(!e || !0 !== e.__v_isRef);
}
function ref(e) {
  return createRef(e, !1);
}
function shallowRef(e) {
  return createRef(e, !0);
}
function createRef(e, t) {
  return isRef(e) ? e : new RefImpl(e, t);
}
class RefImpl {
  constructor(e, t) {
    (this.__v_isShallow = t),
      (this.dep = void 0),
      (this.__v_isRef = !0),
      (this._rawValue = t ? e : toRaw(e)),
      (this._value = t ? e : toReactive(e));
  }
  get value() {
    return trackRefValue(this), this._value;
  }
  set value(e) {
    var t = this.__v_isShallow || isShallow(e) || isReadonly(e);
    (e = t ? e : toRaw(e)),
      hasChanged(e, this._rawValue) &&
        ((this._rawValue = e),
        (this._value = t ? e : toReactive(e)),
        triggerRefValue(this, e));
  }
}
function triggerRef(e) {
  triggerRefValue(e, e.value);
}
function unref(e) {
  return isRef(e) ? e.value : e;
}
const shallowUnwrapHandlers = {
  get: (e, t, n) => unref(Reflect.get(e, t, n)),
  set: (e, t, n, r) => {
    const o = e[t];
    return isRef(o) && !isRef(n)
      ? ((o.value = n), !0)
      : Reflect.set(e, t, n, r);
  },
};
function proxyRefs(e) {
  return isReactive(e) ? e : new Proxy(e, shallowUnwrapHandlers);
}
class CustomRefImpl {
  constructor(e) {
    (this.dep = void 0), (this.__v_isRef = !0);
    var { get: e, set: t } = e(
      () => trackRefValue(this),
      () => triggerRefValue(this)
    );
    (this._get = e), (this._set = t);
  }
  get value() {
    return this._get();
  }
  set value(e) {
    this._set(e);
  }
}
function customRef(e) {
  return new CustomRefImpl(e);
}
function toRefs(e) {
  isProxy(e) ||
    console.warn(
      "toRefs() expects a reactive object but received a plain one."
    );
  const t = isArray(e) ? new Array(e.length) : {};
  for (const n in e) t[n] = toRef(e, n);
  return t;
}
class ObjectRefImpl {
  constructor(e, t, n) {
    (this._object = e),
      (this._key = t),
      (this._defaultValue = n),
      (this.__v_isRef = !0);
  }
  get value() {
    var e = this._object[this._key];
    return void 0 === e ? this._defaultValue : e;
  }
  set value(e) {
    this._object[this._key] = e;
  }
}
function toRef(e, t, n) {
  var r = e[t];
  return isRef(r) ? r : new ObjectRefImpl(e, t, n);
}
var _a;
class ComputedRefImpl {
  constructor(e, t, n, r) {
    (this._setter = t),
      (this.dep = void 0),
      (this.__v_isRef = !0),
      (this[_a] = !1),
      (this._dirty = !0),
      (this.effect = new ReactiveEffect(e, () => {
        this._dirty || ((this._dirty = !0), triggerRefValue(this));
      })),
      ((this.effect.computed = this).effect.active = this._cacheable = !r),
      (this.__v_isReadonly = n);
  }
  get value() {
    const e = toRaw(this);
    return (
      trackRefValue(e),
      (!e._dirty && e._cacheable) ||
        ((e._dirty = !1), (e._value = e.effect.run())),
      e._value
    );
  }
  set value(e) {
    this._setter(e);
  }
}
function computed(e, t, n = !1) {
  let r, o;
  var s = isFunction(e);
  o = s
    ? ((r = e),
      () => {
        console.warn("Write operation failed: computed value is readonly");
      })
    : ((r = e.get), e.set);
  const i = new ComputedRefImpl(r, o, s || !o, n);
  return (
    t &&
      !n &&
      ((i.effect.onTrack = t.onTrack), (i.effect.onTrigger = t.onTrigger)),
    i
  );
}
const stack = [];
function pushWarningContext(e) {
  stack.push(e);
}
function popWarningContext() {
  stack.pop();
}
function warn$1(e, ...t) {
  pauseTracking();
  const n = stack.length ? stack[stack.length - 1].component : null;
  var r = n && n.appContext.config.warnHandler;
  const o = getComponentTrace();
  if (r)
    callWithErrorHandling(r, n, 11, [
      e + t.join(""),
      n && n.proxy,
      o
        .map(({ vnode: e }) => `at <${formatComponentName(n, e.type)}>`)
        .join("\n"),
      o,
    ]);
  else {
    const s = ["[Vue warn]: " + e, ...t];
    o.length &&
      s.push(
        `
`,
        ...formatTrace(o)
      ),
      console.warn(...s);
  }
  resetTracking();
}
function getComponentTrace() {
  let e = stack[stack.length - 1];
  if (!e) return [];
  const t = [];
  for (; e; ) {
    const r = t[0];
    r && r.vnode === e
      ? r.recurseCount++
      : t.push({ vnode: e, recurseCount: 0 });
    var n = e.component && e.component.parent;
    e = n && n.vnode;
  }
  return t;
}
function formatTrace(e) {
  const n = [];
  return (
    e.forEach((e, t) => {
      n.push(
        ...(0 === t
          ? []
          : [
              `
`,
            ]),
        ...formatTraceEntry(e)
      );
    }),
    n
  );
}
function formatTraceEntry({ vnode: e, recurseCount: t }) {
  var t = 0 < t ? `... (${t} recursive calls)` : "",
    n = !!e.component && null == e.component.parent,
    n = " at <" + formatComponentName(e.component, e.type, n),
    t = ">" + t;
  return e.props ? [n, ...formatProps(e.props), t] : [n + t];
}
function formatProps(t) {
  const n = [],
    e = Object.keys(t);
  return (
    e.slice(0, 3).forEach((e) => {
      n.push(...formatProp(e, t[e]));
    }),
    3 < e.length && n.push(" ..."),
    n
  );
}
function formatProp(e, t, n) {
  return isString(t)
    ? ((t = JSON.stringify(t)), n ? t : [e + "=" + t])
    : "number" == typeof t || "boolean" == typeof t || null == t
    ? n
      ? t
      : [e + "=" + t]
    : isRef(t)
    ? ((t = formatProp(e, toRaw(t.value), !0)), n ? t : [e + "=Ref<", t, ">"])
    : isFunction(t)
    ? [e + "=fn" + (t.name ? `<${t.name}>` : "")]
    : ((t = toRaw(t)), n ? t : [e + "=", t]);
}
const ErrorTypeStrings = {
  sp: "serverPrefetch hook",
  bc: "beforeCreate hook",
  c: "created hook",
  bm: "beforeMount hook",
  m: "mounted hook",
  bu: "beforeUpdate hook",
  u: "updated",
  bum: "beforeUnmount hook",
  um: "unmounted hook",
  a: "activated hook",
  da: "deactivated hook",
  ec: "errorCaptured hook",
  rtc: "renderTracked hook",
  rtg: "renderTriggered hook",
  [0]: "setup function",
  1: "render function",
  2: "watcher getter",
  3: "watcher callback",
  4: "watcher cleanup function",
  5: "native event handler",
  6: "component event handler",
  7: "vnode hook",
  8: "directive hook",
  9: "transition hook",
  10: "app errorHandler",
  11: "app warnHandler",
  12: "ref function",
  13: "async component loader",
  14: "scheduler flush. This is likely a Vue internals bug. Please open an issue at https://new-issue.vuejs.org/?repo=vuejs/core",
};
function callWithErrorHandling(e, t, n, r) {
  let o;
  try {
    o = r ? e(...r) : e();
  } catch (e) {
    handleError(e, t, n);
  }
  return o;
}
function callWithAsyncErrorHandling(t, n, r, o) {
  if (isFunction(t)) {
    const e = callWithErrorHandling(t, n, r, o);
    return (
      e &&
        isPromise(e) &&
        e.catch((e) => {
          handleError(e, n, r);
        }),
      e
    );
  }
  const s = [];
  for (let e = 0; e < t.length; e++)
    s.push(callWithAsyncErrorHandling(t[e], n, r, o));
  return s;
}
function handleError(t, n, r, e = !0) {
  var o = n ? n.vnode : null;
  if (n) {
    let e = n.parent;
    for (var s = n.proxy, i = ErrorTypeStrings[r]; e; ) {
      const a = e.ec;
      if (a)
        for (let e = 0; e < a.length; e++) if (!1 === a[e](t, s, i)) return;
      e = e.parent;
    }
    n = n.appContext.config.errorHandler;
    if (n) return void callWithErrorHandling(n, null, 10, [t, s, i]);
  }
  logError(t, r, o, e);
}
function logError(e, t, n, r = !0) {
  t = ErrorTypeStrings[t];
  if (
    (n && pushWarningContext(n),
    warn$1("Unhandled error" + (t ? " during execution of " + t : "")),
    n && popWarningContext(),
    r)
  )
    throw e;
  console.error(e);
}
let isFlushing = !(_a = "__v_isReadonly"),
  isFlushPending = !1;
const queue = [];
let flushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null,
  postFlushIndex = 0;
const resolvedPromise = Promise.resolve();
let currentFlushPromise = null;
const RECURSION_LIMIT = 100;
function nextTick(e) {
  const t = currentFlushPromise || resolvedPromise;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function findInsertionIndex(e) {
  let t = flushIndex + 1,
    n = queue.length;
  for (; t < n; ) {
    var r = (t + n) >>> 1;
    getId(queue[r]) < e ? (t = 1 + r) : (n = r);
  }
  return t;
}
function queueJob(e) {
  (queue.length &&
    queue.includes(
      e,
      isFlushing && e.allowRecurse ? flushIndex + 1 : flushIndex
    )) ||
    (null == e.id
      ? queue.push(e)
      : queue.splice(findInsertionIndex(e.id), 0, e),
    queueFlush());
}
function queueFlush() {
  isFlushing ||
    isFlushPending ||
    ((isFlushPending = !0),
    (currentFlushPromise = resolvedPromise.then(flushJobs)));
}
function invalidateJob(e) {
  e = queue.indexOf(e);
  e > flushIndex && queue.splice(e, 1);
}
function queuePostFlushCb(e) {
  isArray(e)
    ? pendingPostFlushCbs.push(...e)
    : (activePostFlushCbs &&
        activePostFlushCbs.includes(
          e,
          e.allowRecurse ? postFlushIndex + 1 : postFlushIndex
        )) ||
      pendingPostFlushCbs.push(e),
    queueFlush();
}
function flushPreFlushCbs(e, t = isFlushing ? flushIndex + 1 : 0) {
  for (e = e || new Map(); t < queue.length; t++) {
    const n = queue[t];
    n &&
      n.pre &&
      (checkRecursiveUpdates(e, n) || (queue.splice(t, 1), t--, n()));
  }
}
function flushPostFlushCbs(e) {
  if (pendingPostFlushCbs.length) {
    var t = [...new Set(pendingPostFlushCbs)];
    if (((pendingPostFlushCbs.length = 0), activePostFlushCbs))
      activePostFlushCbs.push(...t);
    else {
      for (
        activePostFlushCbs = t,
          e = e || new Map(),
          activePostFlushCbs.sort((e, t) => getId(e) - getId(t)),
          postFlushIndex = 0;
        postFlushIndex < activePostFlushCbs.length;
        postFlushIndex++
      )
        checkRecursiveUpdates(e, activePostFlushCbs[postFlushIndex]) ||
          activePostFlushCbs[postFlushIndex]();
      (activePostFlushCbs = null), (postFlushIndex = 0);
    }
  }
}
const getId = (e) => (null == e.id ? 1 / 0 : e.id),
  comparator = (e, t) => {
    var n = getId(e) - getId(t);
    if (0 == n) {
      if (e.pre && !t.pre) return -1;
      if (t.pre && !e.pre) return 1;
    }
    return n;
  };
function flushJobs(e) {
  (isFlushPending = !1),
    (isFlushing = !0),
    (e = e || new Map()),
    queue.sort(comparator);
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      var t = queue[flushIndex];
      !t ||
        !1 === t.active ||
        checkRecursiveUpdates(e, t) ||
        callWithErrorHandling(t, null, 14);
    }
  } finally {
    (flushIndex = 0),
      (queue.length = 0),
      flushPostFlushCbs(e),
      (isFlushing = !1),
      (currentFlushPromise = null),
      (queue.length || pendingPostFlushCbs.length) && flushJobs(e);
  }
}
function checkRecursiveUpdates(e, t) {
  if (e.has(t)) {
    var n,
      r = e.get(t);
    if (r > RECURSION_LIMIT)
      return (
        warn$1(
          `Maximum recursive updates exceeded${
            (n = (n = t.ownerInstance) && getComponentName(n.type))
              ? ` in component <${n}>`
              : ""
          }. ` +
            "This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function."
        ),
        !0
      );
    e.set(t, r + 1);
  } else e.set(t, 1);
}
let isHmrUpdating = !1;
const hmrDirtyComponents = new Set(),
  map =
    ((getGlobalThis().__VUE_HMR_RUNTIME__ = {
      createRecord: tryWrap(createRecord),
      rerender: tryWrap(rerender),
      reload: tryWrap(reload),
    }),
    new Map());
function registerHMR(e) {
  var t = e.type.__hmrId;
  let n = map.get(t);
  n || (createRecord(t, e.type), (n = map.get(t))), n.instances.add(e);
}
function unregisterHMR(e) {
  map.get(e.type.__hmrId).instances.delete(e);
}
function createRecord(e, t) {
  return (
    !map.has(e) &&
    (map.set(e, {
      initialDef: normalizeClassComponent(t),
      instances: new Set(),
    }),
    !0)
  );
}
function normalizeClassComponent(e) {
  return isClassComponent(e) ? e.__vccOpts : e;
}
function rerender(e, t) {
  const n = map.get(e);
  n &&
    ((n.initialDef.render = t),
    [...n.instances].forEach((e) => {
      t && ((e.render = t), (normalizeClassComponent(e.type).render = t)),
        (e.renderCache = []),
        (isHmrUpdating = !0),
        e.update(),
        (isHmrUpdating = !1);
    }));
}
function reload(e, t) {
  var n = map.get(e);
  if (n) {
    (t = normalizeClassComponent(t)), updateComponentDef(n.initialDef, t);
    const o = [...n.instances];
    for (const s of o) {
      var r = normalizeClassComponent(s.type);
      hmrDirtyComponents.has(r) ||
        (r !== n.initialDef && updateComponentDef(r, t),
        hmrDirtyComponents.add(r)),
        s.appContext.optionsCache.delete(s.type),
        s.ceReload
          ? (hmrDirtyComponents.add(r),
            s.ceReload(t.styles),
            hmrDirtyComponents.delete(r))
          : s.parent
          ? queueJob(s.parent.update)
          : s.appContext.reload
          ? s.appContext.reload()
          : "undefined" != typeof window
          ? window.location.reload()
          : console.warn(
              "[HMR] Root or manually mounted instance modified. Full reload required."
            );
    }
    queuePostFlushCb(() => {
      for (const e of o)
        hmrDirtyComponents.delete(normalizeClassComponent(e.type));
    });
  }
}
function updateComponentDef(e, t) {
  extend(e, t);
  for (const n in e) "__file" === n || n in t || delete e[n];
}
function tryWrap(n) {
  return (e, t) => {
    try {
      return n(e, t);
    } catch (e) {
      console.error(e),
        console.warn(
          "[HMR] Something went wrong during Vue component hot-reload. Full reload required."
        );
    }
  };
}
let devtools,
  buffer = [],
  devtoolsNotInstalled = !1;
function emit(e, ...t) {
  devtools
    ? devtools.emit(e, ...t)
    : devtoolsNotInstalled || buffer.push({ event: e, args: t });
}
function setDevtoolsHook(e, t) {
  if ((devtools = e))
    (devtools.enabled = !0),
      buffer.forEach(({ event: e, args: t }) => devtools.emit(e, ...t)),
      (buffer = []);
  else if (
    "undefined" == typeof window ||
    !window.HTMLElement ||
    (null != (e = null == (e = window.navigator) ? void 0 : e.userAgent) &&
      e.includes("jsdom"))
  )
    (devtoolsNotInstalled = !0), (buffer = []);
  else {
    const n = (t.__VUE_DEVTOOLS_HOOK_REPLAY__ =
      t.__VUE_DEVTOOLS_HOOK_REPLAY__ || []);
    n.push((e) => {
      setDevtoolsHook(e, t);
    }),
      setTimeout(() => {
        devtools ||
          ((t.__VUE_DEVTOOLS_HOOK_REPLAY__ = null),
          (devtoolsNotInstalled = !0),
          (buffer = []));
      }, 3e3);
  }
}
function devtoolsInitApp(e, t) {
  emit("app:init", e, t, {
    Fragment: Fragment,
    Text: Text,
    Comment: Comment,
    Static: Static,
  });
}
function devtoolsUnmountApp(e) {
  emit("app:unmount", e);
}
const devtoolsComponentAdded = createDevtoolsComponentHook("component:added"),
  devtoolsComponentUpdated = createDevtoolsComponentHook("component:updated"),
  _devtoolsComponentRemoved = createDevtoolsComponentHook("component:removed"),
  devtoolsComponentRemoved = (e) => {
    devtools &&
      "function" == typeof devtools.cleanupBuffer &&
      !devtools.cleanupBuffer(e) &&
      _devtoolsComponentRemoved(e);
  };
function createDevtoolsComponentHook(t) {
  return (e) => {
    emit(t, e.appContext.app, e.uid, e.parent ? e.parent.uid : void 0, e);
  };
}
const devtoolsPerfStart = createDevtoolsPerformanceHook("perf:start"),
  devtoolsPerfEnd = createDevtoolsPerformanceHook("perf:end");
function createDevtoolsPerformanceHook(r) {
  return (e, t, n) => {
    emit(r, e.appContext.app, e.uid, e, t, n);
  };
}
function devtoolsComponentEmit(e, t, n) {
  emit("component:emit", e.appContext.app, e, t, n);
}
function emit$1(r, o, ...s) {
  if (!r.isUnmounted) {
    var i = r.vnode.props || EMPTY_OBJ,
      {
        emitsOptions: a,
        propsOptions: [l],
      } = r;
    if (a)
      if (o in a) {
        const p = a[o];
        isFunction(p) &&
          !p(...s) &&
          warn$1(
            `Invalid event arguments: event validation failed for event "${o}".`
          );
      } else
        (l && toHandlerKey(o) in l) ||
          warn$1(
            `Component emitted event "${o}" but it is neither declared in ` +
              `the emits option nor as an "${toHandlerKey(o)}" prop.`
          );
    let e = s;
    var a = o.startsWith("update:"),
      l = a && o.slice(7),
      c =
        (l &&
          l in i &&
          (({ number: l, trim: c } =
            i[`${"modelValue" === l ? "model" : l}Modifiers`] || EMPTY_OBJ),
          c && (e = s.map((e) => (isString(e) ? e.trim() : e))),
          l && (e = s.map(toNumber))),
        devtoolsComponentEmit(r, o, e),
        o.toLowerCase());
    c !== o &&
      i[toHandlerKey(c)] &&
      warn$1(
        `Event "${c}" is emitted in component ` +
          formatComponentName(r, r.type) +
          ` but the handler is registered for "${o}". ` +
          "Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. " +
          `You should probably use "${hyphenate(o)}" instead of "${o}".`
      );
    let t,
      n = i[(t = toHandlerKey(o))] || i[(t = toHandlerKey(camelize(o)))];
    (n = !n && a ? i[(t = toHandlerKey(hyphenate(o)))] : n) &&
      callWithAsyncErrorHandling(n, r, 6, e);
    l = i[t + "Once"];
    if (l) {
      if (r.emitted) {
        if (r.emitted[t]) return;
      } else r.emitted = {};
      (r.emitted[t] = !0), callWithAsyncErrorHandling(l, r, 6, e);
    }
  }
}
function normalizeEmitsOptions(e, t, n = !1) {
  const r = t.emitsCache;
  var o = r.get(e);
  if (void 0 !== o) return o;
  const s = e.emits;
  let i = {},
    a = !1;
  return (
    isFunction(e) ||
      ((o = (e) => {
        e = normalizeEmitsOptions(e, t, !0);
        e && ((a = !0), extend(i, e));
      }),
      !n && t.mixins.length && t.mixins.forEach(o),
      e.extends && o(e.extends),
      e.mixins && e.mixins.forEach(o)),
    s || a
      ? (isArray(s) ? s.forEach((e) => (i[e] = null)) : extend(i, s),
        isObject(e) && r.set(e, i),
        i)
      : (isObject(e) && r.set(e, null), null)
  );
}
function isEmitListener(e, t) {
  return (
    !(!e || !isOn(t)) &&
    ((t = t.slice(2).replace(/Once$/, "")),
    hasOwn(e, t[0].toLowerCase() + t.slice(1)) ||
      hasOwn(e, hyphenate(t)) ||
      hasOwn(e, t))
  );
}
let currentRenderingInstance = null,
  currentScopeId = null;
function setCurrentRenderingInstance(e) {
  var t = currentRenderingInstance;
  return (
    (currentRenderingInstance = e),
    (currentScopeId = (e && e.type.__scopeId) || null),
    t
  );
}
function pushScopeId(e) {
  currentScopeId = e;
}
function popScopeId() {
  currentScopeId = null;
}
const withScopeId = (e) => withCtx;
function withCtx(r, o = currentRenderingInstance, e) {
  if (!o) return r;
  if (r._n) return r;
  const s = (...e) => {
    s._d && setBlockTracking(-1);
    var t = setCurrentRenderingInstance(o);
    let n;
    try {
      n = r(...e);
    } finally {
      setCurrentRenderingInstance(t), s._d && setBlockTracking(1);
    }
    return devtoolsComponentUpdated(o), n;
  };
  return (s._n = !0), (s._c = !0), (s._d = !0), s;
}
let accessedAttrs = !1;
function markAttrsAccessed() {
  accessedAttrs = !0;
}
function renderComponentRoot(t) {
  const {
    type: e,
    vnode: n,
    proxy: r,
    withProxy: o,
    props: s,
    propsOptions: [i],
    slots: a,
    attrs: l,
    emit: c,
    render: p,
    renderCache: u,
    data: d,
    setupState: f,
    ctx: m,
    inheritAttrs: h,
  } = t;
  let g, v;
  var y = setCurrentRenderingInstance(t);
  accessedAttrs = !1;
  try {
    if (4 & n.shapeFlag) {
      var E = o || r;
      (g = normalizeVNode(p.call(E, E, u, s, f, d, m))), (v = l);
    } else {
      const p = e;
      l === s && markAttrsAccessed(),
        (g = normalizeVNode(
          1 < p.length
            ? p(s, {
                get attrs() {
                  return markAttrsAccessed(), l;
                },
                slots: a,
                emit: c,
              })
            : p(s, null)
        )),
        (v = e.props ? l : getFunctionalFallthrough(l));
    }
  } catch (e) {
    (blockStack.length = 0), handleError(e, t, 1), (g = createVNode(Comment));
  }
  let S = g,
    C = void 0;
  if (
    (0 < g.patchFlag && 2048 & g.patchFlag && ([S, C] = getChildRoot(g)),
    v && !1 !== h)
  ) {
    const T = Object.keys(v);
    E = S["shapeFlag"];
    if (T.length)
      if (7 & E)
        i && T.some(isModelListener) && (v = filterModelListeners(v, i)),
          (S = cloneVNode(S, v));
      else if (!accessedAttrs && S.type !== Comment) {
        var b = Object.keys(l);
        const _ = [],
          w = [];
        for (let e = 0, t = b.length; e < t; e++) {
          const x = b[e];
          isOn(x)
            ? isModelListener(x) || _.push(x[2].toLowerCase() + x.slice(3))
            : w.push(x);
        }
        w.length &&
          warn$1(
            "Extraneous non-props attributes (" +
              w.join(", ") +
              ") were passed to component but could not be automatically inherited because component renders fragment or text root nodes."
          ),
          _.length &&
            warn$1(
              "Extraneous non-emits event listeners (" +
                _.join(", ") +
                ') were passed to component but could not be automatically inherited because component renders fragment or text root nodes. If the listener is intended to be a component custom event listener only, declare it using the "emits" option.'
            );
      }
  }
  return (
    n.dirs &&
      (isElementRoot(S) ||
        warn$1(
          "Runtime directive used on component with non-element root node. The directives will not function as intended."
        ),
      ((S = cloneVNode(S)).dirs = S.dirs ? S.dirs.concat(n.dirs) : n.dirs)),
    n.transition &&
      (isElementRoot(S) ||
        warn$1(
          "Component inside <Transition> renders non-element root node that cannot be animated."
        ),
      (S.transition = n.transition)),
    C ? C(S) : (g = S),
    setCurrentRenderingInstance(y),
    g
  );
}
const getChildRoot = (t) => {
  const n = t.children,
    r = t.dynamicChildren;
  var e = filterSingleRoot(n);
  if (!e) return [t, void 0];
  const o = n.indexOf(e),
    s = r ? r.indexOf(e) : -1;
  return [
    normalizeVNode(e),
    (e) => {
      (n[o] = e),
        r &&
          (-1 < s
            ? (r[s] = e)
            : 0 < e.patchFlag && (t.dynamicChildren = [...r, e]));
    },
  ];
};
function filterSingleRoot(t) {
  let n;
  for (let e = 0; e < t.length; e++) {
    var r = t[e];
    if (!isVNode(r)) return;
    if (r.type !== Comment || "v-if" === r.children) {
      if (n) return;
      n = r;
    }
  }
  return n;
}
const getFunctionalFallthrough = (e) => {
    let t;
    for (const n in e)
      ("class" !== n && "style" !== n && !isOn(n)) || ((t = t || {})[n] = e[n]);
    return t;
  },
  filterModelListeners = (e, t) => {
    const n = {};
    for (const r in e) (isModelListener(r) && r.slice(9) in t) || (n[r] = e[r]);
    return n;
  },
  isElementRoot = (e) => 7 & e.shapeFlag || e.type === Comment;
function shouldUpdateComponent(e, t, n) {
  var { props: r, children: e, component: o } = e,
    { props: s, children: i, patchFlag: a } = t,
    l = o.emitsOptions;
  if ((e || i) && isHmrUpdating) return !0;
  if (t.dirs || t.transition) return !0;
  if (!(n && 0 <= a))
    return (
      !((!e && !i) || (i && i.$stable)) ||
      (r !== s && (r ? !s || hasPropsChanged(r, s, l) : !!s))
    );
  if (1024 & a) return !0;
  if (16 & a) return r ? hasPropsChanged(r, s, l) : !!s;
  if (8 & a) {
    var c = t.dynamicProps;
    for (let e = 0; e < c.length; e++) {
      var p = c[e];
      if (s[p] !== r[p] && !isEmitListener(l, p)) return !0;
    }
  }
  return !1;
}
function hasPropsChanged(t, n, r) {
  var o = Object.keys(n);
  if (o.length !== Object.keys(t).length) return !0;
  for (let e = 0; e < o.length; e++) {
    var s = o[e];
    if (n[s] !== t[s] && !isEmitListener(r, s)) return !0;
  }
  return !1;
}
function updateHOCHostEl({ vnode: e, parent: t }, n) {
  for (; t && t.subTree === e; ) ((e = t.vnode).el = n), (t = t.parent);
}
const isSuspense = (e) => e.__isSuspense,
  SuspenseImpl = {
    name: "Suspense",
    __isSuspense: !0,
    process(e, t, n, r, o, s, i, a, l, c) {
      null == e
        ? mountSuspense(t, n, r, o, s, i, a, l, c)
        : patchSuspense(e, t, n, r, o, i, a, l, c);
    },
    hydrate: hydrateSuspense,
    create: createSuspenseBoundary,
    normalize: normalizeSuspenseChildren,
  },
  Suspense = SuspenseImpl;
function triggerEvent(e, t) {
  const n = e.props && e.props[t];
  isFunction(n) && n();
}
function mountSuspense(e, t, n, r, o, s, i, a, l) {
  const {
    p: c,
    o: { createElement: p },
  } = l;
  var u = p("div");
  const d = (e.suspense = createSuspenseBoundary(e, o, r, t, u, n, s, i, a, l));
  c(null, (d.pendingBranch = e.ssContent), u, null, r, d, s, i),
    0 < d.deps
      ? (triggerEvent(e, "onPending"),
        triggerEvent(e, "onFallback"),
        c(null, e.ssFallback, t, n, r, null, s, i),
        setActiveBranch(d, e.ssFallback))
      : d.resolve();
}
function patchSuspense(
  e,
  t,
  n,
  r,
  o,
  s,
  i,
  a,
  { p: l, um: c, o: { createElement: p } }
) {
  const u = (t.suspense = e.suspense);
  (u.vnode = t).el = e.el;
  e = t.ssContent;
  const d = t.ssFallback;
  var {
    activeBranch: f,
    pendingBranch: m,
    isInFallback: h,
    isHydrating: g,
  } = u;
  if (m)
    isSameVNodeType((u.pendingBranch = e), m)
      ? (l(m, e, u.hiddenContainer, null, o, u, s, i, a),
        u.deps <= 0
          ? u.resolve()
          : h && (l(f, d, n, r, o, null, s, i, a), setActiveBranch(u, d)))
      : (u.pendingId++,
        g ? ((u.isHydrating = !1), (u.activeBranch = m)) : c(m, o, u),
        (u.deps = 0),
        (u.effects.length = 0),
        (u.hiddenContainer = p("div")),
        h
          ? (l(null, e, u.hiddenContainer, null, o, u, s, i, a),
            u.deps <= 0
              ? u.resolve()
              : (l(f, d, n, r, o, null, s, i, a), setActiveBranch(u, d)))
          : f && isSameVNodeType(e, f)
          ? (l(f, e, n, r, o, u, s, i, a), u.resolve(!0))
          : (l(null, e, u.hiddenContainer, null, o, u, s, i, a),
            u.deps <= 0 && u.resolve()));
  else if (f && isSameVNodeType(e, f))
    l(f, e, n, r, o, u, s, i, a), setActiveBranch(u, e);
  else if (
    (triggerEvent(t, "onPending"),
    (u.pendingBranch = e),
    u.pendingId++,
    l(null, e, u.hiddenContainer, null, o, u, s, i, a),
    u.deps <= 0)
  )
    u.resolve();
  else {
    const { timeout: v, pendingId: y } = u;
    0 < v
      ? setTimeout(() => {
          u.pendingId === y && u.fallback(d);
        }, v)
      : 0 === v && u.fallback(d);
  }
}
let hasWarned = !1;
function createSuspenseBoundary(e, t, n, r, o, s, i, c, p, a, l = !1) {
  hasWarned ||
    ((hasWarned = !0),
    console[console.info ? "info" : "log"](
      "<Suspense> is an experimental feature and its API will likely change."
    ));
  const {
    p: u,
    m: d,
    um: f,
    n: m,
    o: { parentNode: h, remove: g },
  } = a;
  a = toNumber(e.props && e.props.timeout);
  const v = {
    vnode: e,
    parent: t,
    parentComponent: n,
    isSVG: i,
    container: r,
    hiddenContainer: o,
    anchor: s,
    deps: 0,
    pendingId: 0,
    timeout: "number" == typeof a ? a : -1,
    activeBranch: null,
    pendingBranch: null,
    isInFallback: !0,
    isHydrating: l,
    isUnmounted: !1,
    effects: [],
    resolve(t = !1) {
      if (!t && !v.pendingBranch)
        throw new Error(
          "suspense.resolve() is called without a pending branch."
        );
      if (v.isUnmounted)
        throw new Error(
          "suspense.resolve() is called on an already unmounted suspense boundary."
        );
      const {
        vnode: e,
        activeBranch: n,
        pendingBranch: r,
        pendingId: o,
        effects: s,
        parentComponent: i,
        container: a,
      } = v;
      if (v.isHydrating) v.isHydrating = !1;
      else if (!t) {
        t = n && r.transition && "out-in" === r.transition.mode;
        t &&
          (n.transition.afterLeave = () => {
            o === v.pendingId && d(r, a, e, 0);
          });
        let e = v["anchor"];
        n && ((e = m(n)), f(n, i, v, !0)), t || d(r, a, e, 0);
      }
      setActiveBranch(v, r), (v.pendingBranch = null), (v.isInFallback = !1);
      let l = v.parent,
        c = !1;
      for (; l; ) {
        if (l.pendingBranch) {
          l.effects.push(...s), (c = !0);
          break;
        }
        l = l.parent;
      }
      c || queuePostFlushCb(s), (v.effects = []), triggerEvent(e, "onResolve");
    },
    fallback(e) {
      if (v.pendingBranch) {
        const {
            vnode: r,
            activeBranch: o,
            parentComponent: s,
            container: i,
            isSVG: a,
          } = v,
          l = (triggerEvent(r, "onFallback"), m(o));
        var t = () => {
            v.isInFallback &&
              (u(null, e, i, l, s, null, a, c, p), setActiveBranch(v, e));
          },
          n = e.transition && "out-in" === e.transition.mode;
        n && (o.transition.afterLeave = t),
          (v.isInFallback = !0),
          f(o, s, null, !0),
          n || t();
      }
    },
    move(e, t, n) {
      v.activeBranch && d(v.activeBranch, e, t, n), (v.container = e);
    },
    next() {
      return v.activeBranch && m(v.activeBranch);
    },
    registerDep(n, r) {
      const o = !!v.pendingBranch,
        s = (o && v.deps++, n.vnode.el);
      n.asyncDep
        .catch((e) => {
          handleError(e, n, 0);
        })
        .then((e) => {
          if (
            !n.isUnmounted &&
            !v.isUnmounted &&
            v.pendingId === n.suspenseId
          ) {
            n.asyncResolved = !0;
            const t = n["vnode"];
            pushWarningContext(t), handleSetupResult(n, e, !1), s && (t.el = s);
            e = !s && n.subTree.el;
            r(n, t, h(s || n.subTree.el), s ? null : m(n.subTree), v, i, p),
              e && g(e),
              updateHOCHostEl(n, t.el),
              popWarningContext(),
              o && 0 == --v.deps && v.resolve();
          }
        });
    },
    unmount(e, t) {
      (v.isUnmounted = !0),
        v.activeBranch && f(v.activeBranch, n, e, t),
        v.pendingBranch && f(v.pendingBranch, n, e, t);
    },
  };
  return v;
}
function hydrateSuspense(e, t, n, r, o, s, i, a, l) {
  const c = (t.suspense = createSuspenseBoundary(
    t,
    r,
    n,
    e.parentNode,
    document.createElement("div"),
    null,
    o,
    s,
    i,
    a,
    !0
  ));
  r = l(e, (c.pendingBranch = t.ssContent), n, c, s, i);
  return 0 === c.deps && c.resolve(), r;
}
function normalizeSuspenseChildren(e) {
  var { shapeFlag: t, children: n } = e,
    t = 32 & t;
  (e.ssContent = normalizeSuspenseSlot(t ? n.default : n)),
    (e.ssFallback = t
      ? normalizeSuspenseSlot(n.fallback)
      : createVNode(Comment));
}
function normalizeSuspenseSlot(t) {
  let e;
  var n;
  return (
    isFunction(t) &&
      ((n = isBlockTreeEnabled && t._c) && ((t._d = !1), openBlock()),
      (t = t()),
      n && ((t._d = !0), (e = currentBlock), closeBlock())),
    isArray(t) &&
      ((n = filterSingleRoot(t)) ||
        warn$1("<Suspense> slots expect a single root node."),
      (t = n)),
    (t = normalizeVNode(t)),
    e && !t.dynamicChildren && (t.dynamicChildren = e.filter((e) => e !== t)),
    t
  );
}
function queueEffectWithSuspense(e, t) {
  t && t.pendingBranch
    ? isArray(e)
      ? t.effects.push(...e)
      : t.effects.push(e)
    : queuePostFlushCb(e);
}
function setActiveBranch(e, t) {
  e.activeBranch = t;
  const { vnode: n, parentComponent: r } = e;
  e = n.el = t.el;
  r && r.subTree === n && ((r.vnode.el = e), updateHOCHostEl(r, e));
}
function provide(t, n) {
  if (currentInstance) {
    let e = currentInstance.provides;
    var r = currentInstance.parent && currentInstance.parent.provides;
    (e = r === e ? (currentInstance.provides = Object.create(r)) : e)[t] = n;
  } else warn$1("provide() can only be used inside setup().");
}
function inject(e, t, n = !1) {
  var r,
    o = currentInstance || currentRenderingInstance;
  if (o)
    return (r =
      null == o.parent
        ? o.vnode.appContext && o.vnode.appContext.provides
        : o.parent.provides) && e in r
      ? r[e]
      : 1 < arguments.length
      ? n && isFunction(t)
        ? t.call(o.proxy)
        : t
      : void warn$1(`injection "${String(e)}" not found.`);
  warn$1("inject() can only be used inside setup() or functional components.");
}
function watchEffect(e, t) {
  return doWatch(e, null, t);
}
function watchPostEffect(e, t) {
  return doWatch(
    e,
    null,
    Object.assign(Object.assign({}, t), { flush: "post" })
  );
}
function watchSyncEffect(e, t) {
  return doWatch(
    e,
    null,
    Object.assign(Object.assign({}, t), { flush: "sync" })
  );
}
const INITIAL_WATCHER_VALUE = {};
function watch(e, t, n) {
  return (
    isFunction(t) ||
      warn$1(
        "`watch(fn, options?)` signature has been moved to a separate API. Use `watchEffect(fn, options?)` instead. `watch` now only supports `watch(source, cb, options?) signature."
      ),
    doWatch(e, t, n)
  );
}
function doWatch(
  e,
  t,
  { immediate: n, deep: r, flush: o, onTrack: s, onTrigger: i } = EMPTY_OBJ
) {
  t ||
    (void 0 !== n &&
      warn$1(
        'watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.'
      ),
    void 0 !== r &&
      warn$1(
        'watch() "deep" option is only respected when using the watch(source, callback, options?) signature.'
      ));
  const a = (e) => {
      warn$1(
        "Invalid watch source: ",
        e,
        "A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types."
      );
    },
    l = currentInstance;
  let c,
    p = !1,
    u = !1;
  if (
    (isRef(e)
      ? ((c = () => e.value), (p = isShallow(e)))
      : isReactive(e)
      ? ((c = () => e), (r = !0))
      : isArray(e)
      ? ((u = !0),
        (p = e.some((e) => isReactive(e) || isShallow(e))),
        (c = () =>
          e.map((e) =>
            isRef(e)
              ? e.value
              : isReactive(e)
              ? traverse(e)
              : isFunction(e)
              ? callWithErrorHandling(e, l, 2)
              : void a(e)
          )))
      : isFunction(e)
      ? (c = t
          ? () => callWithErrorHandling(e, l, 2)
          : () => {
              if (!l || !l.isUnmounted)
                return d && d(), callWithAsyncErrorHandling(e, l, 3, [f]);
            })
      : ((c = NOOP), a(e)),
    t && r)
  ) {
    const y = c;
    c = () => traverse(y());
  }
  let d,
    f = (e) => {
      d = v.onStop = () => {
        callWithErrorHandling(e, l, 4);
      };
    },
    m = u
      ? new Array(e.length).fill(INITIAL_WATCHER_VALUE)
      : INITIAL_WATCHER_VALUE;
  const h = () => {
    if (v.active)
      if (t) {
        const e = v.run();
        (r ||
          p ||
          (u ? e.some((e, t) => hasChanged(e, m[t])) : hasChanged(e, m))) &&
          (d && d(),
          callWithAsyncErrorHandling(t, l, 3, [
            e,
            m === INITIAL_WATCHER_VALUE
              ? void 0
              : u && m[0] === INITIAL_WATCHER_VALUE
              ? []
              : m,
            f,
          ]),
          (m = e));
      } else v.run();
  };
  h.allowRecurse = !!t;
  let g;
  g =
    "sync" === o
      ? h
      : "post" === o
      ? () => queuePostRenderEffect(h, l && l.suspense)
      : ((h.pre = !0), l && (h.id = l.uid), () => queueJob(h));
  const v = new ReactiveEffect(c, g);
  (v.onTrack = s),
    (v.onTrigger = i),
    t
      ? n
        ? h()
        : (m = v.run())
      : "post" === o
      ? queuePostRenderEffect(v.run.bind(v), l && l.suspense)
      : v.run();
  return () => {
    v.stop(), l && l.scope && remove(l.scope.effects, v);
  };
}
function instanceWatch(e, t, n) {
  const r = this.proxy;
  var o = isString(e)
    ? e.includes(".")
      ? createPathGetter(r, e)
      : () => r[e]
    : e.bind(r, r);
  let s;
  isFunction(t) ? (s = t) : ((s = t.handler), (n = t));
  (t = currentInstance),
    setCurrentInstance(this),
    (o = doWatch(o, s.bind(r), n));
  return t ? setCurrentInstance(t) : unsetCurrentInstance(), o;
}
function createPathGetter(e, t) {
  const n = t.split(".");
  return () => {
    let t = e;
    for (let e = 0; e < n.length && t; e++) t = t[n[e]];
    return t;
  };
}
function traverse(t, n) {
  if (!isObject(t) || t.__v_skip) return t;
  if ((n = n || new Set()).has(t)) return t;
  if ((n.add(t), isRef(t))) traverse(t.value, n);
  else if (isArray(t)) for (let e = 0; e < t.length; e++) traverse(t[e], n);
  else if (isSet(t) || isMap(t))
    t.forEach((e) => {
      traverse(e, n);
    });
  else if (isPlainObject(t)) for (const e in t) traverse(t[e], n);
  return t;
}
function useTransitionState() {
  const e = {
    isMounted: !1,
    isLeaving: !1,
    isUnmounting: !1,
    leavingVNodes: new Map(),
  };
  return (
    onMounted(() => {
      e.isMounted = !0;
    }),
    onBeforeUnmount(() => {
      e.isUnmounting = !0;
    }),
    e
  );
}
const TransitionHookValidator = [Function, Array],
  BaseTransitionImpl = {
    name: "BaseTransition",
    props: {
      mode: String,
      appear: Boolean,
      persisted: Boolean,
      onBeforeEnter: TransitionHookValidator,
      onEnter: TransitionHookValidator,
      onAfterEnter: TransitionHookValidator,
      onEnterCancelled: TransitionHookValidator,
      onBeforeLeave: TransitionHookValidator,
      onLeave: TransitionHookValidator,
      onAfterLeave: TransitionHookValidator,
      onLeaveCancelled: TransitionHookValidator,
      onBeforeAppear: TransitionHookValidator,
      onAppear: TransitionHookValidator,
      onAfterAppear: TransitionHookValidator,
      onAppearCancelled: TransitionHookValidator,
    },
    setup(u, { slots: e }) {
      const d = getCurrentInstance(),
        f = useTransitionState();
      let m;
      return () => {
        var n = e.default && getTransitionRawChildren(e.default(), !0);
        if (n && n.length) {
          let t = n[0];
          if (1 < n.length) {
            let e = !1;
            for (const c of n)
              if (c.type !== Comment) {
                if (e) {
                  warn$1(
                    "<transition> can only be used on a single element or component. Use <transition-group> for lists."
                  );
                  break;
                }
                (t = c), (e = !0);
              }
          }
          var n = toRaw(u),
            r = n["mode"];
          if (
            (r &&
              "in-out" !== r &&
              "out-in" !== r &&
              "default" !== r &&
              warn$1("invalid <transition> mode: " + r),
            f.isLeaving)
          )
            return emptyPlaceholder(t);
          var o = getKeepAliveChild(t);
          if (!o) return emptyPlaceholder(t);
          const i = resolveTransitionHooks(o, n, f, d);
          setTransitionHooks(o, i);
          var s = d.subTree;
          const a = s && getKeepAliveChild(s);
          let e = !1;
          const l = o.type["getTransitionKey"];
          if (
            (l &&
              ((s = l()),
              void 0 === m ? (m = s) : s !== m && ((m = s), (e = !0))),
            a && a.type !== Comment && (!isSameVNodeType(o, a) || e))
          ) {
            const p = resolveTransitionHooks(a, n, f, d);
            if ((setTransitionHooks(a, p), "out-in" === r))
              return (
                (f.isLeaving = !0),
                (p.afterLeave = () => {
                  (f.isLeaving = !1) !== d.update.active && d.update();
                }),
                emptyPlaceholder(t)
              );
            "in-out" === r &&
              o.type !== Comment &&
              (p.delayLeave = (e, t, n) => {
                const r = getLeavingNodesForType(f, a);
                (r[String(a.key)] = a),
                  (e._leaveCb = () => {
                    t(), (e._leaveCb = void 0), delete i.delayedLeave;
                  }),
                  (i.delayedLeave = n);
              });
          }
          return t;
        }
      };
    },
  },
  BaseTransition = BaseTransitionImpl;
function getLeavingNodesForType(e, t) {
  const n = e["leavingVNodes"];
  let r = n.get(t.type);
  return r || ((r = Object.create(null)), n.set(t.type, r)), r;
}
function resolveTransitionHooks(s, t, i, n) {
  const {
      appear: a,
      mode: e,
      persisted: r = !1,
      onBeforeEnter: o,
      onEnter: l,
      onAfterEnter: c,
      onEnterCancelled: p,
      onBeforeLeave: u,
      onLeave: d,
      onAfterLeave: f,
      onLeaveCancelled: m,
      onBeforeAppear: h,
      onAppear: g,
      onAfterAppear: v,
      onAppearCancelled: y,
    } = t,
    E = String(s.key),
    S = getLeavingNodesForType(i, s),
    C = (e, t) => {
      e && callWithAsyncErrorHandling(e, n, 9, t);
    },
    b = (e, t) => {
      const n = t[1];
      C(e, t),
        isArray(e)
          ? e.every((e) => e.length <= 1) && n()
          : e.length <= 1 && n();
    },
    T = {
      mode: e,
      persisted: r,
      beforeEnter(e) {
        let t = o;
        if (!i.isMounted) {
          if (!a) return;
          t = h || o;
        }
        e._leaveCb && e._leaveCb(!0);
        const n = S[E];
        n && isSameVNodeType(s, n) && n.el._leaveCb && n.el._leaveCb(),
          C(t, [e]);
      },
      enter(t) {
        let e = l,
          n = c,
          r = p;
        if (!i.isMounted) {
          if (!a) return;
          (e = g || l), (n = v || c), (r = y || p);
        }
        let o = !1;
        var s = (t._enterCb = (e) => {
          o ||
            ((o = !0),
            e ? C(r, [t]) : C(n, [t]),
            T.delayedLeave && T.delayedLeave(),
            (t._enterCb = void 0));
        });
        e ? b(e, [t, s]) : s();
      },
      leave(t, n) {
        const r = String(s.key);
        if ((t._enterCb && t._enterCb(!0), i.isUnmounting)) return n();
        C(u, [t]);
        let o = !1;
        var e = (t._leaveCb = (e) => {
          o ||
            ((o = !0),
            n(),
            e ? C(m, [t]) : C(f, [t]),
            (t._leaveCb = void 0),
            S[r] === s && delete S[r]);
        });
        (S[r] = s), d ? b(d, [t, e]) : e();
      },
      clone(e) {
        return resolveTransitionHooks(e, t, i, n);
      },
    };
  return T;
}
function emptyPlaceholder(e) {
  if (isKeepAlive(e)) return ((e = cloneVNode(e)).children = null), e;
}
function getKeepAliveChild(e) {
  return isKeepAlive(e) ? (e.children ? e.children[0] : void 0) : e;
}
function setTransitionHooks(e, t) {
  6 & e.shapeFlag && e.component
    ? setTransitionHooks(e.component.subTree, t)
    : 128 & e.shapeFlag
    ? ((e.ssContent.transition = t.clone(e.ssContent)),
      (e.ssFallback.transition = t.clone(e.ssFallback)))
    : (e.transition = t);
}
function getTransitionRawChildren(t, n = !1, r) {
  let o = [],
    s = 0;
  for (let e = 0; e < t.length; e++) {
    var i = t[e],
      a = null == r ? i.key : String(r) + String(null != i.key ? i.key : e);
    i.type === Fragment
      ? (128 & i.patchFlag && s++,
        (o = o.concat(getTransitionRawChildren(i.children, n, a))))
      : (!n && i.type === Comment) ||
        o.push(null != a ? cloneVNode(i, { key: a }) : i);
  }
  if (1 < s) for (let e = 0; e < o.length; e++) o[e].patchFlag = -2;
  return o;
}
function defineComponent(e) {
  return isFunction(e) ? { setup: e, name: e.name } : e;
}
const isAsyncWrapper = (e) => !!e.type.__asyncLoader;
function defineAsyncComponent(e) {
  const {
    loader: n,
    loadingComponent: s,
    errorComponent: i,
    delay: a = 200,
    timeout: l,
    suspensible: c = !0,
    onError: r,
  } = (e = isFunction(e) ? { loader: e } : e);
  let p = null,
    u,
    o = 0;
  const d = () => {
    let t;
    return (
      p ||
      (t = p =
        n()
          .catch((n) => {
            if (((n = n instanceof Error ? n : new Error(String(n))), r))
              return new Promise((e, t) => {
                r(
                  n,
                  () => e((o++, (p = null), d())),
                  () => t(n),
                  o + 1
                );
              });
            throw n;
          })
          .then((e) => {
            if (t !== p && p) return p;
            if (
              (e ||
                warn$1(
                  "Async component loader resolved to undefined. If you are using retry(), make sure to return its return value."
                ),
              !(e =
                e && (e.__esModule || "Module" === e[Symbol.toStringTag])
                  ? e.default
                  : e) ||
                isObject(e) ||
                isFunction(e))
            )
              return (u = e);
            throw new Error("Invalid async component load result: " + e);
          }))
    );
  };
  return defineComponent({
    name: "AsyncComponentWrapper",
    __asyncLoader: d,
    get __asyncResolved() {
      return u;
    },
    setup() {
      const t = currentInstance;
      if (u) return () => createInnerComp(u, t);
      const n = (e) => {
        (p = null), handleError(e, t, 13, !i);
      };
      if (c && t.suspense)
        return d()
          .then((e) => () => createInnerComp(e, t))
          .catch(
            (e) => (n(e), () => (i ? createVNode(i, { error: e }) : null))
          );
      const r = ref(!1),
        o = ref(),
        e = ref(!!a);
      return (
        a &&
          setTimeout(() => {
            e.value = !1;
          }, a),
        null != l &&
          setTimeout(() => {
            var e;
            r.value ||
              o.value ||
              ((e = new Error(`Async component timed out after ${l}ms.`)),
              n(e),
              (o.value = e));
          }, l),
        d()
          .then(() => {
            (r.value = !0),
              t.parent &&
                isKeepAlive(t.parent.vnode) &&
                queueJob(t.parent.update);
          })
          .catch((e) => {
            n(e), (o.value = e);
          }),
        () =>
          r.value && u
            ? createInnerComp(u, t)
            : o.value && i
            ? createVNode(i, { error: o.value })
            : s && !e.value
            ? createVNode(s)
            : void 0
      );
    },
  });
}
function createInnerComp(e, t) {
  var { ref: n, props: r, children: o, ce: s } = t.vnode;
  const i = createVNode(e, r, o);
  return (i.ref = n), (i.ce = s), delete t.vnode.ce, i;
}
const isKeepAlive = (e) => e.type.__isKeepAlive,
  KeepAliveImpl = {
    name: "KeepAlive",
    __isKeepAlive: !0,
    props: {
      include: [String, RegExp, Array],
      exclude: [String, RegExp, Array],
      max: [String, Number],
    },
    setup(a, { slots: l }) {
      const r = getCurrentInstance(),
        e = r.ctx,
        c = new Map(),
        p = new Set();
      let u = null;
      r.__v_cache = c;
      const i = r.suspense,
        {
          p: d,
          m: f,
          um: t,
          o: { createElement: n },
        } = e["renderer"],
        o = n("div");
      function s(e) {
        resetShapeFlag(e), t(e, r, i, !0);
      }
      function m(n) {
        c.forEach((e, t) => {
          e = getComponentName(e.type);
          !e || (n && n(e)) || h(t);
        });
      }
      function h(e) {
        var t = c.get(e);
        u && t.type === u.type ? u && resetShapeFlag(u) : s(t),
          c.delete(e),
          p.delete(e);
      }
      (e.activate = (t, e, n, r, o) => {
        const s = t.component;
        f(t, e, n, 0, i),
          d(s.vnode, t, e, n, s, i, r, t.slotScopeIds, o),
          queuePostRenderEffect(() => {
            (s.isDeactivated = !1), s.a && invokeArrayFns(s.a);
            var e = t.props && t.props.onVnodeMounted;
            e && invokeVNodeHook(e, s.parent, t);
          }, i),
          devtoolsComponentAdded(s);
      }),
        (e.deactivate = (t) => {
          const n = t.component;
          f(t, o, null, 1, i),
            queuePostRenderEffect(() => {
              n.da && invokeArrayFns(n.da);
              var e = t.props && t.props.onVnodeUnmounted;
              e && invokeVNodeHook(e, n.parent, t), (n.isDeactivated = !0);
            }, i),
            devtoolsComponentAdded(n);
        }),
        watch(
          () => [a.include, a.exclude],
          ([t, n]) => {
            t && m((e) => matches(t, e)), n && m((e) => !matches(n, e));
          },
          { flush: "post", deep: !0 }
        );
      let g = null;
      var v = () => {
        null != g && c.set(g, getInnerChild(r.subTree));
      };
      return (
        onMounted(v),
        onUpdated(v),
        onBeforeUnmount(() => {
          c.forEach((e) => {
            var { subTree: t, suspense: n } = r,
              t = getInnerChild(t);
            if (e.type === t.type)
              return (
                resetShapeFlag(t),
                void ((t = t.component.da) && queuePostRenderEffect(t, n))
              );
            s(e);
          });
        }),
        () => {
          if (((g = null), !l.default)) return null;
          var e = l.default();
          const t = e[0];
          if (1 < e.length)
            return (
              warn$1("KeepAlive should contain exactly one component child."),
              (u = null),
              e
            );
          if (!(isVNode(t) && (4 & t.shapeFlag || 128 & t.shapeFlag)))
            return (u = null), t;
          let n = getInnerChild(t);
          var e = n.type,
            r = getComponentName(
              isAsyncWrapper(n) ? n.type.__asyncResolved || {} : e
            ),
            { include: o, exclude: s, max: i } = a;
          if ((o && (!r || !matches(o, r))) || (s && r && matches(s, r)))
            return (u = n), t;
          (o = null == n.key ? e : n.key), (s = c.get(o));
          return (
            n.el &&
              ((n = cloneVNode(n)), 128 & t.shapeFlag && (t.ssContent = n)),
            (g = o),
            s
              ? ((n.el = s.el),
                (n.component = s.component),
                n.transition && setTransitionHooks(n, n.transition),
                (n.shapeFlag |= 512),
                p.delete(o),
                p.add(o))
              : (p.add(o),
                i && p.size > parseInt(i, 10) && h(p.values().next().value)),
            (n.shapeFlag |= 256),
            (u = n),
            isSuspense(t.type) ? t : n
          );
        }
      );
    },
  },
  KeepAlive = KeepAliveImpl;
function matches(e, t) {
  return isArray(e)
    ? e.some((e) => matches(e, t))
    : isString(e)
    ? e.split(",").includes(t)
    : !!e.test && e.test(t);
}
function onActivated(e, t) {
  registerKeepAliveHook(e, "a", t);
}
function onDeactivated(e, t) {
  registerKeepAliveHook(e, "da", t);
}
function registerKeepAliveHook(t, n, r = currentInstance) {
  var o =
    t.__wdc ||
    (t.__wdc = () => {
      let e = r;
      for (; e; ) {
        if (e.isDeactivated) return;
        e = e.parent;
      }
      return t();
    });
  if ((injectHook(n, o, r), r)) {
    let e = r.parent;
    for (; e && e.parent; )
      isKeepAlive(e.parent.vnode) && injectToKeepAliveRoot(o, n, r, e),
        (e = e.parent);
  }
}
function injectToKeepAliveRoot(e, t, n, r) {
  const o = injectHook(t, e, r, !0);
  onUnmounted(() => {
    remove(r[t], o);
  }, n);
}
function resetShapeFlag(e) {
  (e.shapeFlag &= -257), (e.shapeFlag &= -513);
}
function getInnerChild(e) {
  return 128 & e.shapeFlag ? e.ssContent : e;
}
function injectHook(t, n, r = currentInstance, e = !1) {
  if (r) {
    const s = r[t] || (r[t] = []);
    var o =
      n.__weh ||
      (n.__weh = (...e) => {
        if (!r.isUnmounted)
          return (
            pauseTracking(),
            setCurrentInstance(r),
            (e = callWithAsyncErrorHandling(n, r, t, e)),
            unsetCurrentInstance(),
            resetTracking(),
            e
          );
      });
    return e ? s.unshift(o) : s.push(o), o;
  }
  warn$1(
    toHandlerKey(ErrorTypeStrings[t].replace(/ hook$/, "")) +
      " is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup(). If you are using async setup(), make sure to register lifecycle hooks before the first await statement."
  );
}
const createHook =
    (n) =>
    (t, e = currentInstance) =>
      (!isInSSRComponentSetup || "sp" === n) &&
      injectHook(n, (...e) => t(...e), e),
  onBeforeMount = createHook("bm"),
  onMounted = createHook("m"),
  onBeforeUpdate = createHook("bu"),
  onUpdated = createHook("u"),
  onBeforeUnmount = createHook("bum"),
  onUnmounted = createHook("um"),
  onServerPrefetch = createHook("sp"),
  onRenderTriggered = createHook("rtg"),
  onRenderTracked = createHook("rtc");
function onErrorCaptured(e, t = currentInstance) {
  injectHook("ec", e, t);
}
function validateDirectiveName(e) {
  isBuiltInDirective(e) &&
    warn$1("Do not use built-in directive ids as custom directive id: " + e);
}
function withDirectives(e, s) {
  var t = currentRenderingInstance;
  if (null === t)
    return (
      warn$1("withDirectives can only be used inside render functions."), e
    );
  var i = getExposeProxy(t) || t.proxy;
  const a = e.dirs || (e.dirs = []);
  for (let o = 0; o < s.length; o++) {
    let [e, t, n, r = EMPTY_OBJ] = s[o];
    e &&
      ((e = isFunction(e) ? { mounted: e, updated: e } : e).deep && traverse(t),
      a.push({
        dir: e,
        instance: i,
        value: t,
        oldValue: void 0,
        arg: n,
        modifiers: r,
      }));
  }
  return e;
}
function invokeDirectiveHook(t, n, r, o) {
  var s = t.dirs,
    i = n && n.dirs;
  for (let e = 0; e < s.length; e++) {
    const l = s[e];
    i && (l.oldValue = i[e].value);
    var a = l.dir[o];
    a &&
      (pauseTracking(),
      callWithAsyncErrorHandling(a, r, 8, [t.el, l, t, n]),
      resetTracking());
  }
}
const COMPONENTS = "components",
  DIRECTIVES = "directives";
function resolveComponent(e, t) {
  return resolveAsset(COMPONENTS, e, !0, t) || e;
}
const NULL_DYNAMIC_COMPONENT = Symbol();
function resolveDynamicComponent(e) {
  return isString(e)
    ? resolveAsset(COMPONENTS, e, !1) || e
    : e || NULL_DYNAMIC_COMPONENT;
}
function resolveDirective(e) {
  return resolveAsset(DIRECTIVES, e);
}
function resolveAsset(e, t, n = !0, r = !1) {
  var o = currentRenderingInstance || currentInstance;
  if (o) {
    var s = o.type;
    if (e === COMPONENTS) {
      var i = getComponentName(s, !1);
      if (i && (i === t || i === camelize(t) || i === capitalize(camelize(t))))
        return s;
    }
    i = resolve(o[e] || s[e], t) || resolve(o.appContext[e], t);
    return !i && r
      ? s
      : (n &&
          !i &&
          ((o =
            e === COMPONENTS
              ? "\nIf this is a native custom element, make sure to exclude it from component resolution via compilerOptions.isCustomElement."
              : ""),
          warn$1(`Failed to resolve ${e.slice(0, -1)}: ` + t + o)),
        i);
  }
  warn$1(
    `resolve${capitalize(e.slice(0, -1))} ` +
      "can only be used in render() or setup()."
  );
}
function resolve(e, t) {
  return e && (e[t] || e[camelize(t)] || e[capitalize(camelize(t))]);
}
function renderList(n, r, e, t) {
  let o;
  const s = e && e[t];
  if (isArray(n) || isString(n)) {
    o = new Array(n.length);
    for (let e = 0, t = n.length; e < t; e++)
      o[e] = r(n[e], e, void 0, s && s[e]);
  } else if ("number" == typeof n) {
    Number.isInteger(n) ||
      warn$1(`The v-for range expect an integer value but got ${n}.`),
      (o = new Array(n));
    for (let e = 0; e < n; e++) o[e] = r(e + 1, e, void 0, s && s[e]);
  } else if (isObject(n))
    if (n[Symbol.iterator])
      o = Array.from(n, (e, t) => r(e, t, void 0, s && s[t]));
    else {
      var i = Object.keys(n);
      o = new Array(i.length);
      for (let e = 0, t = i.length; e < t; e++) {
        var a = i[e];
        o[e] = r(n[a], a, e, s && s[e]);
      }
    }
  else o = [];
  return e && (e[t] = o), o;
}
function createSlots(t, n) {
  for (let e = 0; e < n.length; e++) {
    const r = n[e];
    if (isArray(r)) for (let e = 0; e < r.length; e++) t[r[e].name] = r[e].fn;
    else
      r &&
        (t[r.name] = r.key
          ? (...e) => {
              const t = r.fn(...e);
              return t && (t.key = r.key), t;
            }
          : r.fn);
  }
  return t;
}
function renderSlot(e, t, n = {}, r, o) {
  if (
    currentRenderingInstance.isCE ||
    (currentRenderingInstance.parent &&
      isAsyncWrapper(currentRenderingInstance.parent) &&
      currentRenderingInstance.parent.isCE)
  )
    return "default" !== t && (n.name = t), createVNode("slot", n, r && r());
  let s = e[t];
  s &&
    1 < s.length &&
    (warn$1(
      "SSR-optimized slot function detected in a non-SSR-optimized render function. You need to mark this component with $dynamic-slots in the parent template."
    ),
    (s = () => [])),
    s && s._c && (s._d = !1),
    openBlock();
  var i = s && ensureValidVNode(s(n));
  const a = createBlock(
    Fragment,
    { key: n.key || (i && i.key) || "_" + t },
    i || (r ? r() : []),
    i && 1 === e._ ? 64 : -2
  );
  return (
    !o && a.scopeId && (a.slotScopeIds = [a.scopeId + "-s"]),
    s && s._c && (s._d = !0),
    a
  );
}
function ensureValidVNode(e) {
  return e.some(
    (e) =>
      !isVNode(e) ||
      (e.type !== Comment &&
        !(e.type === Fragment && !ensureValidVNode(e.children)))
  )
    ? e
    : null;
}
function toHandlers(e, t) {
  const n = {};
  if (!isObject(e))
    return warn$1("v-on with no argument expects an object value."), n;
  for (const r in e)
    n[t && /[A-Z]/.test(r) ? "on:" + r : toHandlerKey(r)] = e[r];
  return n;
}
const getPublicInstance = (e) =>
    e
      ? isStatefulComponent(e)
        ? getExposeProxy(e) || e.proxy
        : getPublicInstance(e.parent)
      : null,
  publicPropertiesMap = extend(Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => shallowReadonly(e.props),
    $attrs: (e) => shallowReadonly(e.attrs),
    $slots: (e) => shallowReadonly(e.slots),
    $refs: (e) => shallowReadonly(e.refs),
    $parent: (e) => getPublicInstance(e.parent),
    $root: (e) => getPublicInstance(e.root),
    $emit: (e) => e.emit,
    $options: (e) => resolveMergedOptions(e),
    $forceUpdate: (e) => e.f || (e.f = () => queueJob(e.update)),
    $nextTick: (e) => e.n || (e.n = nextTick.bind(e.proxy)),
    $watch: (e) => instanceWatch.bind(e),
  }),
  isReservedPrefix = (e) => "_" === e || "$" === e,
  hasSetupBinding = (e, t) =>
    e !== EMPTY_OBJ && !e.__isScriptSetup && hasOwn(e, t),
  PublicInstanceProxyHandlers = {
    get({ _: e }, t) {
      const {
        ctx: n,
        setupState: r,
        data: o,
        props: s,
        accessCache: i,
        type: a,
        appContext: l,
      } = e;
      if ("__isVue" === t) return !0;
      if ("$" !== t[0]) {
        var c = i[t];
        if (void 0 !== c)
          switch (c) {
            case 1:
              return r[t];
            case 2:
              return o[t];
            case 4:
              return n[t];
            case 3:
              return s[t];
          }
        else {
          if (hasSetupBinding(r, t)) return (i[t] = 1), r[t];
          if (o !== EMPTY_OBJ && hasOwn(o, t)) return (i[t] = 2), o[t];
          if ((c = e.propsOptions[0]) && hasOwn(c, t)) return (i[t] = 3), s[t];
          if (n !== EMPTY_OBJ && hasOwn(n, t)) return (i[t] = 4), n[t];
          shouldCacheAccess && (i[t] = 0);
        }
      }
      const p = publicPropertiesMap[t];
      let u, d;
      return p
        ? ("$attrs" === t && (track(e, "get", t), markAttrsAccessed()), p(e))
        : (u = a.__cssModules) && (u = u[t])
        ? u
        : n !== EMPTY_OBJ && hasOwn(n, t)
        ? ((i[t] = 4), n[t])
        : ((d = l.config.globalProperties),
          hasOwn(d, t)
            ? d[t]
            : void (
                !currentRenderingInstance ||
                (isString(t) && 0 === t.indexOf("__v")) ||
                (o !== EMPTY_OBJ && isReservedPrefix(t[0]) && hasOwn(o, t)
                  ? warn$1(
                      `Property ${JSON.stringify(
                        t
                      )} must be accessed via $data because it starts with a reserved ` +
                        'character ("$" or "_") and is not proxied on the render context.'
                    )
                  : e === currentRenderingInstance &&
                    warn$1(
                      `Property ${JSON.stringify(
                        t
                      )} was accessed during render ` +
                        "but is not defined on instance."
                    ))
              ));
    },
    set({ _: e }, t, n) {
      const { data: r, setupState: o, ctx: s } = e;
      return hasSetupBinding(o, t)
        ? ((o[t] = n), !0)
        : o.__isScriptSetup && hasOwn(o, t)
        ? (warn$1(
            `Cannot mutate <script setup> binding "${t}" from Options API.`
          ),
          !1)
        : r !== EMPTY_OBJ && hasOwn(r, t)
        ? ((r[t] = n), !0)
        : hasOwn(e.props, t)
        ? (warn$1(`Attempting to mutate prop "${t}". Props are readonly.`), !1)
        : "$" === t[0] && t.slice(1) in e
        ? (warn$1(
            `Attempting to mutate public property "${t}". ` +
              "Properties starting with $ are reserved and readonly."
          ),
          !1)
        : (t in e.appContext.config.globalProperties
            ? Object.defineProperty(s, t, {
                enumerable: !0,
                configurable: !0,
                value: n,
              })
            : (s[t] = n),
          !0);
    },
    has(
      {
        _: {
          data: e,
          setupState: t,
          accessCache: n,
          ctx: r,
          appContext: o,
          propsOptions: s,
        },
      },
      i
    ) {
      return (
        !!n[i] ||
        (e !== EMPTY_OBJ && hasOwn(e, i)) ||
        hasSetupBinding(t, i) ||
        ((n = s[0]) && hasOwn(n, i)) ||
        hasOwn(r, i) ||
        hasOwn(publicPropertiesMap, i) ||
        hasOwn(o.config.globalProperties, i)
      );
    },
    defineProperty(e, t, n) {
      return (
        null != n.get
          ? (e._.accessCache[t] = 0)
          : hasOwn(n, "value") && this.set(e, t, n.value, null),
        Reflect.defineProperty(e, t, n)
      );
    },
    ownKeys: (e) => (
      warn$1(
        "Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead."
      ),
      Reflect.ownKeys(e)
    ),
  },
  RuntimeCompiledPublicInstanceProxyHandlers = extend(
    {},
    PublicInstanceProxyHandlers,
    {
      get(e, t) {
        if (t !== Symbol.unscopables)
          return PublicInstanceProxyHandlers.get(e, t, e);
      },
      has(e, t) {
        var n = "_" !== t[0] && !isGloballyWhitelisted(t);
        return (
          !n &&
            PublicInstanceProxyHandlers.has(e, t) &&
            warn$1(
              `Property ${JSON.stringify(
                t
              )} should not start with _ which is a reserved prefix for Vue internals.`
            ),
          n
        );
      },
    }
  );
function createDevRenderContext(t) {
  const n = {};
  return (
    Object.defineProperty(n, "_", {
      configurable: !0,
      enumerable: !1,
      get: () => t,
    }),
    Object.keys(publicPropertiesMap).forEach((e) => {
      Object.defineProperty(n, e, {
        configurable: !0,
        enumerable: !1,
        get: () => publicPropertiesMap[e](t),
        set: NOOP,
      });
    }),
    n
  );
}
function exposePropsOnRenderContext(t) {
  const {
    ctx: n,
    propsOptions: [e],
  } = t;
  e &&
    Object.keys(e).forEach((e) => {
      Object.defineProperty(n, e, {
        enumerable: !0,
        configurable: !0,
        get: () => t.props[e],
        set: NOOP,
      });
    });
}
function exposeSetupStateOnRenderContext(e) {
  const { ctx: t, setupState: n } = e;
  Object.keys(toRaw(n)).forEach((e) => {
    n.__isScriptSetup ||
      (isReservedPrefix(e[0])
        ? warn$1(
            `setup() return property ${JSON.stringify(
              e
            )} should not start with "$" or "_" ` +
              "which are reserved prefixes for Vue internals."
          )
        : Object.defineProperty(t, e, {
            enumerable: !0,
            configurable: !0,
            get: () => n[e],
            set: NOOP,
          }));
  });
}
function createDuplicateChecker() {
  const n = Object.create(null);
  return (e, t) => {
    n[t]
      ? warn$1(`${e} property "${t}" is already defined in ${n[t]}.`)
      : (n[t] = e);
  };
}
let shouldCacheAccess = !0;
function applyOptions(e) {
  var t = resolveMergedOptions(e);
  const n = e.proxy;
  var r = e.ctx;
  (shouldCacheAccess = !1), t.beforeCreate && callHook(t.beforeCreate, e, "bc");
  const {
      data: o,
      computed: s,
      methods: i,
      watch: a,
      provide: l,
      inject: c,
      created: p,
      beforeMount: u,
      mounted: d,
      beforeUpdate: f,
      updated: m,
      activated: h,
      deactivated: g,
      beforeUnmount: F,
      unmounted: D,
      render: v,
      renderTracked: B,
      renderTriggered: $,
      errorCaptured: H,
      serverPrefetch: L,
      expose: y,
      inheritAttrs: E,
      components: S,
      directives: C,
    } = t,
    b = createDuplicateChecker();
  var [t] = e.propsOptions;
  if (t) for (const w in t) b("Props", w);
  if (
    (c && resolveInjections(c, r, b, e.appContext.config.unwrapInjectedRef), i)
  )
    for (const x in i) {
      const R = i[x];
      isFunction(R)
        ? (Object.defineProperty(r, x, {
            value: R.bind(n),
            configurable: !0,
            enumerable: !0,
            writable: !0,
          }),
          b("Methods", x))
        : warn$1(
            `Method "${x}" has type "${typeof R}" in the component definition. ` +
              "Did you reference the function correctly?"
          );
    }
  if (o) {
    isFunction(o) ||
      warn$1(
        "The data option must be a function. Plain object usage is no longer supported."
      );
    const O = o.call(n, n);
    if (
      (isPromise(O) &&
        warn$1(
          "data() returned a Promise - note data() cannot be async; If you intend to perform data fetching before component renders, use async setup() + <Suspense>."
        ),
      isObject(O))
    ) {
      e.data = reactive(O);
      for (const k in O)
        b("Data", k),
          isReservedPrefix(k[0]) ||
            Object.defineProperty(r, k, {
              configurable: !0,
              enumerable: !0,
              get: () => O[k],
              set: NOOP,
            });
    } else warn$1("data() should return an object.");
  }
  if (((shouldCacheAccess = !0), s))
    for (const N in s) {
      const I = s[N];
      var T = isFunction(I)
          ? I.bind(n, n)
          : isFunction(I.get)
          ? I.get.bind(n, n)
          : NOOP,
        j =
          (T === NOOP && warn$1(`Computed property "${N}" has no getter.`),
          !isFunction(I) && isFunction(I.set)
            ? I.set.bind(n)
            : () => {
                warn$1(
                  `Write operation failed: computed property "${N}" is readonly.`
                );
              });
      const A = computed$1({ get: T, set: j });
      Object.defineProperty(r, N, {
        enumerable: !0,
        configurable: !0,
        get: () => A.value,
        set: (e) => (A.value = e),
      }),
        b("Computed", N);
    }
  if (a) for (const P in a) createWatcher(a[P], r, n, P);
  if (l) {
    const M = isFunction(l) ? l.call(n) : l;
    Reflect.ownKeys(M).forEach((e) => {
      provide(e, M[e]);
    });
  }
  function _(t, e) {
    isArray(e) ? e.forEach((e) => t(e.bind(n))) : e && t(e.bind(n));
  }
  if (
    (p && callHook(p, e, "c"),
    _(onBeforeMount, u),
    _(onMounted, d),
    _(onBeforeUpdate, f),
    _(onUpdated, m),
    _(onActivated, h),
    _(onDeactivated, g),
    _(onErrorCaptured, H),
    _(onRenderTracked, B),
    _(onRenderTriggered, $),
    _(onBeforeUnmount, F),
    _(onUnmounted, D),
    _(onServerPrefetch, L),
    isArray(y))
  )
    if (y.length) {
      const V = e.exposed || (e.exposed = {});
      y.forEach((t) => {
        Object.defineProperty(V, t, {
          get: () => n[t],
          set: (e) => (n[t] = e),
        });
      });
    } else e.exposed || (e.exposed = {});
  v && e.render === NOOP && (e.render = v),
    null != E && (e.inheritAttrs = E),
    S && (e.components = S),
    C && (e.directives = C);
}
function resolveInjections(e, n, r = NOOP, o = !1) {
  for (const i in (e = isArray(e) ? normalizeInject(e) : e)) {
    var s = e[i];
    let t;
    isRef(
      (t = isObject(s)
        ? "default" in s
          ? inject(s.from || i, s.default, !0)
          : inject(s.from || i)
        : inject(s))
    )
      ? o
        ? Object.defineProperty(n, i, {
            enumerable: !0,
            configurable: !0,
            get: () => t.value,
            set: (e) => (t.value = e),
          })
        : (warn$1(
            `injected property "${i}" is a ref and will be auto-unwrapped ` +
              "and no longer needs `.value` in the next minor release. To opt-in to the new behavior now, set `app.config.unwrapInjectedRef = true` (this config is temporary and will not be needed in the future.)"
          ),
          (n[i] = t))
      : (n[i] = t),
      r("Inject", i);
  }
}
function callHook(e, t, n) {
  callWithAsyncErrorHandling(
    isArray(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function createWatcher(e, t, n, r) {
  var o,
    s = r.includes(".") ? createPathGetter(n, r) : () => n[r];
  isString(e)
    ? ((o = t[e]),
      isFunction(o)
        ? watch(s, o)
        : warn$1(`Invalid watch handler specified by key "${e}"`, o))
    : isFunction(e)
    ? watch(s, e.bind(n))
    : isObject(e)
    ? isArray(e)
      ? e.forEach((e) => createWatcher(e, t, n, r))
      : ((o = isFunction(e.handler) ? e.handler.bind(n) : t[e.handler]),
        isFunction(o)
          ? watch(s, o, e)
          : warn$1(`Invalid watch handler specified by key "${e.handler}"`, o))
    : warn$1(`Invalid watch option: "${r}"`, e);
}
function resolveMergedOptions(e) {
  var t = e.type,
    { mixins: n, extends: r } = t;
  const {
    mixins: o,
    optionsCache: s,
    config: { optionMergeStrategies: i },
  } = e.appContext;
  e = s.get(t);
  let a;
  return (
    e
      ? (a = e)
      : o.length || n || r
      ? ((a = {}),
        o.length && o.forEach((e) => mergeOptions(a, e, i, !0)),
        mergeOptions(a, t, i))
      : (a = t),
    isObject(t) && s.set(t, a),
    a
  );
}
function mergeOptions(t, e, n, r = !1) {
  const { mixins: o, extends: s } = e;
  s && mergeOptions(t, s, n, !0),
    o && o.forEach((e) => mergeOptions(t, e, n, !0));
  for (const i in e)
    if (r && "expose" === i)
      warn$1(
        '"expose" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.'
      );
    else {
      const a = internalOptionMergeStrats[i] || (n && n[i]);
      t[i] = a ? a(t[i], e[i]) : e[i];
    }
  return t;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeObjectOptions,
  emits: mergeObjectOptions,
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  watch: mergeWatchOptions,
  provide: mergeDataFn,
  inject: mergeInject,
};
function mergeDataFn(e, t) {
  return t
    ? e
      ? function () {
          return extend(
            isFunction(e) ? e.call(this, this) : e,
            isFunction(t) ? t.call(this, this) : t
          );
        }
      : t
    : e;
}
function mergeInject(e, t) {
  return mergeObjectOptions(normalizeInject(e), normalizeInject(t));
}
function normalizeInject(t) {
  if (isArray(t)) {
    const n = {};
    for (let e = 0; e < t.length; e++) n[t[e]] = t[e];
    return n;
  }
  return t;
}
function mergeAsArray(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function mergeObjectOptions(e, t) {
  return e ? extend(extend(Object.create(null), e), t) : t;
}
function mergeWatchOptions(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = extend(Object.create(null), e);
  for (const r in t) n[r] = mergeAsArray(e[r], t[r]);
  return n;
}
function initProps(e, t, n, r = !1) {
  const o = {};
  var s = {};
  def(s, InternalObjectKey, 1),
    (e.propsDefaults = Object.create(null)),
    setFullProps(e, t, o, s);
  for (const i in e.propsOptions[0]) i in o || (o[i] = void 0);
  validateProps(t || {}, o, e),
    n
      ? (e.props = r ? o : shallowReactive(o))
      : e.type.props
      ? (e.props = o)
      : (e.props = s),
    (e.attrs = s);
}
function isInHmrContext(e) {
  for (; e; ) {
    if (e.type.__hmrId) return !0;
    e = e.parent;
  }
}
function updateProps(t, n, r, e) {
  const {
    props: o,
    attrs: s,
    vnode: { patchFlag: i },
  } = t;
  var a = toRaw(o),
    [l] = t.propsOptions;
  let c = !1;
  if (isInHmrContext(t) || !(e || 0 < i) || 16 & i) {
    setFullProps(t, n, o, s) && (c = !0);
    let e;
    for (const f in a)
      (n && (hasOwn(n, f) || ((e = hyphenate(f)) !== f && hasOwn(n, e)))) ||
        (l
          ? !r ||
            (void 0 === r[f] && void 0 === r[e]) ||
            (o[f] = resolvePropValue(l, a, f, void 0, t, !0))
          : delete o[f]);
    if (s !== a)
      for (const m in s) (n && hasOwn(n, m)) || (delete s[m], (c = !0));
  } else if (8 & i) {
    var p = t.vnode.dynamicProps;
    for (let e = 0; e < p.length; e++) {
      var u,
        d = p[e];
      isEmitListener(t.emitsOptions, d) ||
        ((u = n[d]),
        !l || hasOwn(s, d)
          ? u !== s[d] && ((s[d] = u), (c = !0))
          : ((d = camelize(d)), (o[d] = resolvePropValue(l, a, d, u, t, !1))));
    }
  }
  c && trigger(t, "set", "$attrs"), validateProps(n || {}, o, t);
}
function setFullProps(t, n, r, o) {
  const [s, i] = t.propsOptions;
  let a = !1,
    l;
  if (n)
    for (var c in n)
      if (!isReservedProp(c)) {
        var p = n[c];
        let e;
        s && hasOwn(s, (e = camelize(c)))
          ? i && i.includes(e)
            ? ((l = l || {})[e] = p)
            : (r[e] = p)
          : isEmitListener(t.emitsOptions, c) ||
            (c in o && p === o[c]) ||
            ((o[c] = p), (a = !0));
      }
  if (i) {
    var u = toRaw(r),
      d = l || EMPTY_OBJ;
    for (let e = 0; e < i.length; e++) {
      var f = i[e];
      r[f] = resolvePropValue(s, u, f, d[f], t, !hasOwn(d, f));
    }
  }
  return a;
}
function resolvePropValue(e, t, n, r, o, s) {
  e = e[n];
  if (null != e) {
    var i = hasOwn(e, "default");
    if (i && void 0 === r) {
      const a = e.default;
      if (e.type !== Function && isFunction(a)) {
        const l = o["propsDefaults"];
        n in l
          ? (r = l[n])
          : (setCurrentInstance(o),
            (r = l[n] = a.call(null, t)),
            unsetCurrentInstance());
      } else r = a;
    }
    e[0] &&
      (s && !i
        ? (r = !1)
        : !e[1] || ("" !== r && r !== hyphenate(n)) || (r = !0));
  }
  return r;
}
function normalizePropsOptions(e, n, t = !1) {
  const r = n.propsCache;
  var o = r.get(e);
  if (o) return o;
  var s = e.props;
  const i = {},
    a = [];
  let l = !1;
  if (
    (isFunction(e) ||
      ((o = (e) => {
        l = !0;
        var [e, t] = normalizePropsOptions(e, n, !0);
        extend(i, e), t && a.push(...t);
      }),
      !t && n.mixins.length && n.mixins.forEach(o),
      e.extends && o(e.extends),
      e.mixins && e.mixins.forEach(o)),
    !s && !l)
  )
    return isObject(e) && r.set(e, EMPTY_ARR), EMPTY_ARR;
  if (isArray(s))
    for (let e = 0; e < s.length; e++) {
      isString(s[e]) ||
        warn$1("props must be strings when using array syntax.", s[e]);
      var c = camelize(s[e]);
      validatePropName(c) && (i[c] = EMPTY_OBJ);
    }
  else if (s) {
    isObject(s) || warn$1("invalid props options", s);
    for (const f in s) {
      var p = camelize(f);
      if (validatePropName(p)) {
        var u,
          d = s[f];
        const m = (i[p] =
          isArray(d) || isFunction(d) ? { type: d } : Object.assign({}, d));
        m &&
          ((d = getTypeIndex(Boolean, m.type)),
          (u = getTypeIndex(String, m.type)),
          (m[0] = -1 < d),
          (m[1] = u < 0 || d < u),
          (-1 < d || hasOwn(m, "default")) && a.push(p));
      }
    }
  }
  t = [i, a];
  return isObject(e) && r.set(e, t), t;
}
function validatePropName(e) {
  return (
    "$" !== e[0] ||
    (warn$1(`Invalid prop name: "${e}" is a reserved property.`), !1)
  );
}
function getType(e) {
  var t = e && e.toString().match(/^\s*function (\w+)/);
  return t ? t[1] : null === e ? "null" : "";
}
function isSameType(e, t) {
  return getType(e) === getType(t);
}
function getTypeIndex(t, e) {
  return isArray(e)
    ? e.findIndex((e) => isSameType(e, t))
    : isFunction(e) && isSameType(e, t)
    ? 0
    : -1;
}
function validateProps(e, t, n) {
  var r = toRaw(t),
    o = n.propsOptions[0];
  for (const i in o) {
    var s = o[i];
    null != s &&
      validateProp(i, r[i], s, !hasOwn(e, i) && !hasOwn(e, hyphenate(i)));
  }
}
function validateProp(e, n, t, r) {
  const { type: o, required: s, validator: i } = t;
  if (s && r) warn$1('Missing required prop: "' + e + '"');
  else if (null != n || t.required) {
    if (null != o && !0 !== o) {
      let t = !1;
      var a = isArray(o) ? o : [o];
      const p = [];
      for (let e = 0; e < a.length && !t; e++) {
        var { valid: l, expectedType: c } = assertType(n, a[e]);
        p.push(c || ""), (t = l);
      }
      if (!t) return void warn$1(getInvalidTypeMessage(e, n, p));
    }
    i &&
      !i(n) &&
      warn$1(
        'Invalid prop: custom validator check failed for prop "' + e + '".'
      );
  }
}
const isSimpleType = makeMap("String,Number,Boolean,Function,Symbol,BigInt");
function assertType(e, t) {
  let n;
  const r = getType(t);
  var o;
  return (
    isSimpleType(r)
      ? ((o = typeof e),
        (n = o === r.toLowerCase()) || "object" != o || (n = e instanceof t))
      : (n =
          "Object" === r
            ? isObject(e)
            : "Array" === r
            ? isArray(e)
            : "null" === r
            ? null === e
            : e instanceof t),
    { valid: n, expectedType: r }
  );
}
function getInvalidTypeMessage(e, t, n) {
  let r =
    `Invalid prop: type check failed for prop "${e}".` +
    " Expected " +
    n.map(capitalize).join(" | ");
  var e = n[0],
    o = toRawType(t),
    s = styleValue(t, e),
    t = styleValue(t, o);
  return (
    1 === n.length &&
      isExplicable(e) &&
      !isBoolean(e, o) &&
      (r += " with value " + s),
    (r += `, got ${o} `),
    isExplicable(o) && (r += `with value ${t}.`),
    r
  );
}
function styleValue(e, t) {
  return "String" === t ? `"${e}"` : "Number" === t ? "" + Number(e) : "" + e;
}
function isExplicable(t) {
  return ["string", "number", "boolean"].some((e) => t.toLowerCase() === e);
}
function isBoolean(...e) {
  return e.some((e) => "boolean" === e.toLowerCase());
}
const isInternalKey = (e) => "_" === e[0] || "$stable" === e,
  normalizeSlotValue = (e) =>
    isArray(e) ? e.map(normalizeVNode) : [normalizeVNode(e)],
  normalizeSlot = (t, n, e) => {
    if (n._n) return n;
    const r = withCtx(
      (...e) => (
        currentInstance &&
          warn$1(
            `Slot "${t}" invoked outside of the render function: ` +
              "this will not track dependencies used in the slot. Invoke the slot function inside the render function instead."
          ),
        normalizeSlotValue(n(...e))
      ),
      e
    );
    return (r._c = !1), r;
  },
  normalizeObjectSlots = (e, t, n) => {
    var r = e._ctx;
    for (const s in e)
      if (!isInternalKey(s)) {
        var o = e[s];
        if (isFunction(o)) t[s] = normalizeSlot(s, o, r);
        else if (null != o) {
          warn$1(
            `Non-function value encountered for slot "${s}". ` +
              "Prefer function slots for better performance."
          );
          const i = normalizeSlotValue(o);
          t[s] = () => i;
        }
      }
  },
  normalizeVNodeSlots = (e, t) => {
    isKeepAlive(e.vnode) ||
      warn$1(
        "Non-function value encountered for default slot. Prefer function slots for better performance."
      );
    const n = normalizeSlotValue(t);
    e.slots.default = () => n;
  },
  initSlots = (e, t) => {
    var n;
    32 & e.vnode.shapeFlag
      ? (n = t._)
        ? ((e.slots = toRaw(t)), def(t, "_", n))
        : normalizeObjectSlots(t, (e.slots = {}))
      : ((e.slots = {}), t && normalizeVNodeSlots(e, t)),
      def(e.slots, InternalObjectKey, 1);
  },
  updateSlots = (e, t, n) => {
    const { vnode: r, slots: o } = e;
    let s = !0,
      i = EMPTY_OBJ;
    var a;
    if (
      (32 & r.shapeFlag
        ? ((a = t._)
            ? isHmrUpdating
              ? extend(o, t)
              : n && 1 === a
              ? (s = !1)
              : (extend(o, t), n || 1 !== a || delete o._)
            : ((s = !t.$stable), normalizeObjectSlots(t, o)),
          (i = t))
        : t && (normalizeVNodeSlots(e, t), (i = { default: 1 })),
      s)
    )
      for (const l in o) isInternalKey(l) || l in i || delete o[l];
  };
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {},
    },
    mixins: [],
    components: {},
    directives: {},
    provides: Object.create(null),
    optionsCache: new WeakMap(),
    propsCache: new WeakMap(),
    emitsCache: new WeakMap(),
  };
}
let uid = 0;
function createAppAPI(c, p) {
  return function (o, s = null) {
    isFunction(o) || (o = Object.assign({}, o)),
      null == s ||
        isObject(s) ||
        (warn$1("root props passed to app.mount() must be an object."),
        (s = null));
    const i = createAppContext(),
      n = new Set();
    let a = !1;
    const l = (i.app = {
      _uid: uid++,
      _component: o,
      _props: s,
      _container: null,
      _context: i,
      _instance: null,
      version: version,
      get config() {
        return i.config;
      },
      set config(e) {
        warn$1(
          "app.config cannot be replaced. Modify individual options instead."
        );
      },
      use(e, ...t) {
        return (
          n.has(e)
            ? warn$1("Plugin has already been applied to target app.")
            : e && isFunction(e.install)
            ? (n.add(e), e.install(l, ...t))
            : isFunction(e)
            ? (n.add(e), e(l, ...t))
            : warn$1(
                'A plugin must either be a function or an object with an "install" function.'
              ),
          l
        );
      },
      mixin(e) {
        return (
          i.mixins.includes(e)
            ? warn$1(
                "Mixin has already been applied to target app" +
                  (e.name ? ": " + e.name : "")
              )
            : i.mixins.push(e),
          l
        );
      },
      component(e, t) {
        return (
          validateComponentName(e, i.config),
          t
            ? (i.components[e] &&
                warn$1(
                  `Component "${e}" has already been registered in target app.`
                ),
              (i.components[e] = t),
              l)
            : i.components[e]
        );
      },
      directive(e, t) {
        return (
          validateDirectiveName(e),
          t
            ? (i.directives[e] &&
                warn$1(
                  `Directive "${e}" has already been registered in target app.`
                ),
              (i.directives[e] = t),
              l)
            : i.directives[e]
        );
      },
      mount(e, t, n) {
        if (!a) {
          e.__vue_app__ &&
            warn$1(
              "There is already an app instance mounted on the host container.\n If you want to mount another app on the same host container, you need to unmount the previous app by calling `app.unmount()` first."
            );
          const r = createVNode(o, s);
          return (
            ((r.appContext = i).reload = () => {
              c(cloneVNode(r), e, n);
            }),
            t && p ? p(r, e) : c(r, e, n),
            (a = !0),
            (((l._container = e).__vue_app__ = l)._instance = r.component),
            devtoolsInitApp(l, version),
            getExposeProxy(r.component) || r.component.proxy
          );
        }
        warn$1(
          "App has already been mounted.\nIf you want to remount the same app, move your app creation logic into a factory function and create fresh app instances for each mount - e.g. `const createMyApp = () => createApp(App)`"
        );
      },
      unmount() {
        a
          ? (c(null, l._container),
            (l._instance = null),
            devtoolsUnmountApp(l),
            delete l._container.__vue_app__)
          : warn$1("Cannot unmount an app that is not mounted.");
      },
      provide(e, t) {
        return (
          e in i.provides &&
            warn$1(
              `App already provides property with key "${String(e)}". ` +
                "It will be overwritten with the new value."
            ),
          (i.provides[e] = t),
          l
        );
      },
    });
    return l;
  };
}
function setRef(t, n, r, o, s = !1) {
  if (isArray(t))
    t.forEach((e, t) => setRef(e, n && (isArray(n) ? n[t] : n), r, o, s));
  else if (!isAsyncWrapper(o) || s) {
    const i =
        4 & o.shapeFlag
          ? getExposeProxy(o.component) || o.component.proxy
          : o.el,
      a = s ? null : i,
      { i: l, r: c } = t;
    if (l) {
      const p = n && n.r,
        u = l.refs === EMPTY_OBJ ? (l.refs = {}) : l.refs,
        d = l.setupState;
      if (
        (null != p &&
          p !== c &&
          (isString(p)
            ? ((u[p] = null), hasOwn(d, p) && (d[p] = null))
            : isRef(p) && (p.value = null)),
        isFunction(c))
      )
        callWithErrorHandling(c, l, 12, [a, u]);
      else {
        const f = isString(c),
          m = isRef(c);
        var e;
        f || m
          ? ((e = () => {
              if (t.f) {
                const e = f ? (hasOwn(d, c) ? d : u)[c] : c.value;
                s
                  ? isArray(e) && remove(e, i)
                  : isArray(e)
                  ? e.includes(i) || e.push(i)
                  : f
                  ? ((u[c] = [i]), hasOwn(d, c) && (d[c] = u[c]))
                  : ((c.value = [i]), t.k && (u[t.k] = c.value));
              } else
                f
                  ? ((u[c] = a), hasOwn(d, c) && (d[c] = a))
                  : m
                  ? ((c.value = a), t.k && (u[t.k] = a))
                  : warn$1("Invalid template ref type:", c, `(${typeof c})`);
            }),
            a ? ((e.id = -1), queuePostRenderEffect(e, r)) : e())
          : warn$1("Invalid template ref type:", c, `(${typeof c})`);
      }
    } else
      warn$1(
        "Missing ref owner context. ref cannot be used on hoisted vnodes. A vnode with ref must be created inside the render function."
      );
  }
}
let hasMismatch = !1;
const isSVGContainer = (e) =>
    /svg/.test(e.namespaceURI) && "foreignObject" !== e.tagName,
  isComment = (e) => 8 === e.nodeType;
function createHydrationFunctions(g) {
  const {
    mt: v,
    p: u,
    o: {
      patchProp: m,
      createText: y,
      nextSibling: E,
      parentNode: S,
      remove: h,
      insert: C,
      createComment: a,
    },
  } = g;
  const b = (t, n, e, r, o, s = !1) => {
      const i = isComment(t) && "[" === t.data;
      var a = () => x(t, n, e, r, o, i),
        { type: l, ref: c, shapeFlag: p, patchFlag: u } = n;
      let d = t.nodeType,
        f =
          ((n.el = t),
          -2 === u && ((s = !1), (n.dynamicChildren = null)),
          null);
      switch (l) {
        case Text:
          f =
            3 !== d
              ? "" === n.children
                ? (C((n.el = y("")), S(t), t), t)
                : a()
              : (t.data !== n.children &&
                  ((hasMismatch = !0),
                  warn$1(
                    "Hydration text mismatch:\n- Client: " +
                      JSON.stringify(t.data) +
                      `
- Server: ` +
                      JSON.stringify(n.children)
                  ),
                  (t.data = n.children)),
                E(t));
          break;
        case Comment:
          f = 8 !== d || i ? a() : E(t);
          break;
        case Static:
          if ((i && ((t = E(t)), (d = t.nodeType)), 1 === d || 3 === d)) {
            f = t;
            var m = !n.children.length;
            for (let e = 0; e < n.staticCount; e++)
              m && (n.children += 1 === f.nodeType ? f.outerHTML : f.data),
                e === n.staticCount - 1 && (n.anchor = f),
                (f = E(f));
            return i ? E(f) : f;
          }
          a();
          break;
        case Fragment:
          f = i ? w(t, n, e, r, o, s) : a();
          break;
        default:
          if (1 & p)
            f =
              1 !== d || n.type.toLowerCase() !== t.tagName.toLowerCase()
                ? a()
                : T(t, n, e, r, o, s);
          else if (6 & p) {
            n.slotScopeIds = o;
            var h = S(t);
            if (
              (v(n, h, null, e, r, isSVGContainer(h), s),
              (f = (i ? R : E)(t)) &&
                isComment(f) &&
                "teleport end" === f.data &&
                (f = E(f)),
              isAsyncWrapper(n))
            ) {
              let e;
              i
                ? ((e = createVNode(Fragment)).anchor = f
                    ? f.previousSibling
                    : h.lastChild)
                : (e =
                    3 === t.nodeType
                      ? createTextVNode("")
                      : createVNode("div")),
                (e.el = t),
                (n.component.subTree = e);
            }
          } else
            64 & p
              ? (f = 8 !== d ? a() : n.type.hydrate(t, n, e, r, o, s, g, _))
              : 128 & p
              ? (f = n.type.hydrate(
                  t,
                  n,
                  e,
                  r,
                  isSVGContainer(S(t)),
                  o,
                  s,
                  g,
                  b
                ))
              : warn$1("Invalid HostVNode type:", l, `(${typeof l})`);
      }
      return null != c && setRef(c, null, r, n), f;
    },
    T = (n, r, o, s, i, a) => {
      a = a || !!r.dynamicChildren;
      const { type: e, props: t, patchFlag: l, shapeFlag: c, dirs: p } = r;
      var u = ("input" === e && p) || "option" === e;
      {
        if ((p && invokeDirectiveHook(r, null, o, "created"), t))
          if (u || !a || 48 & l)
            for (const f in t)
              ((u && f.endsWith("value")) || (isOn(f) && !isReservedProp(f))) &&
                m(n, f, null, t[f], !1, void 0, o);
          else t.onClick && m(n, "onClick", null, t.onClick, !1, void 0, o);
        let e;
        if (
          ((e = t && t.onVnodeBeforeMount) && invokeVNodeHook(e, o, r),
          p && invokeDirectiveHook(r, null, o, "beforeMount"),
          ((e = t && t.onVnodeMounted) || p) &&
            queueEffectWithSuspense(() => {
              e && invokeVNodeHook(e, o, r),
                p && invokeDirectiveHook(r, null, o, "mounted");
            }, s),
          16 & c && (!t || (!t.innerHTML && !t.textContent)))
        ) {
          let e = _(n.firstChild, r, n, o, s, i, a),
            t = !1;
          for (; e; ) {
            (hasMismatch = !0),
              t ||
                (warn$1(
                  `Hydration children mismatch in <${r.type}>: ` +
                    "server rendered element contains more child nodes than client vdom."
                ),
                (t = !0));
            var d = e;
            (e = e.nextSibling), h(d);
          }
        } else
          8 & c &&
            n.textContent !== r.children &&
            ((hasMismatch = !0),
            warn$1(
              `Hydration text content mismatch in <${r.type}>:
` +
                `- Client: ${n.textContent}
` +
                "- Server: " +
                r.children
            ),
            (n.textContent = r.children));
      }
      return n.nextSibling;
    },
    _ = (t, e, n, r, o, s, i) => {
      i = i || !!e.dynamicChildren;
      const a = e.children;
      var l = a.length;
      let c = !1;
      for (let e = 0; e < l; e++) {
        var p = i ? a[e] : (a[e] = normalizeVNode(a[e]));
        t
          ? (t = b(t, p, r, o, s, i))
          : (p.type === Text && !p.children) ||
            ((hasMismatch = !0),
            c ||
              (warn$1(
                `Hydration children mismatch in <${n.tagName.toLowerCase()}>: ` +
                  "server rendered element contains fewer child nodes than client vdom."
              ),
              (c = !0)),
            u(null, p, n, null, r, o, isSVGContainer(n), s));
      }
      return t;
    },
    w = (e, t, n, r, o, s) => {
      var i = t["slotScopeIds"],
        i = (i && (o = o ? o.concat(i) : i), S(e)),
        e = _(E(e), t, i, n, r, o, s);
      return e && isComment(e) && "]" === e.data
        ? E((t.anchor = e))
        : ((hasMismatch = !0), C((t.anchor = a("]")), i, e), e);
    },
    x = (e, t, n, r, o, s) => {
      if (
        ((hasMismatch = !0),
        warn$1(
          `Hydration node mismatch:
- Client vnode:`,
          t.type,
          `
- Server rendered DOM:`,
          e,
          3 === e.nodeType
            ? "(text)"
            : isComment(e) && "[" === e.data
            ? "(start of fragment)"
            : ""
        ),
        (t.el = null),
        s)
      )
        for (var i = R(e); ; ) {
          const a = E(e);
          if (!a || a === i) break;
          h(a);
        }
      const a = E(e);
      s = S(e);
      return h(e), u(null, t, s, a, n, r, isSVGContainer(s), o), a;
    },
    R = (e) => {
      let t = 0;
      for (; e; )
        if (
          (e = E(e)) &&
          isComment(e) &&
          ("[" === e.data && t++, "]" === e.data)
        ) {
          if (0 === t) return E(e);
          t--;
        }
      return e;
    };
  return [
    (e, t) => {
      if (!t.hasChildNodes())
        return (
          warn$1(
            "Attempting to hydrate existing markup but container is empty. Performing full mount instead."
          ),
          u(null, e, t),
          flushPostFlushCbs(),
          void (t._vnode = e)
        );
      (hasMismatch = !1),
        b(t.firstChild, e, null, null, null),
        flushPostFlushCbs(),
        (t._vnode = e),
        hasMismatch &&
          console.error("Hydration completed but contains mismatches.");
    },
    b,
  ];
}
let supported, perf;
function startMeasure(e, t) {
  e.appContext.config.performance &&
    isSupported() &&
    perf.mark(`vue-${t}-` + e.uid),
    devtoolsPerfStart(e, t, (isSupported() ? perf : Date).now());
}
function endMeasure(e, t) {
  var n, r;
  e.appContext.config.performance &&
    isSupported() &&
    ((r = (n = `vue-${t}-` + e.uid) + ":end"),
    perf.mark(r),
    perf.measure(`<${formatComponentName(e, e.type)}> ` + t, n, r),
    perf.clearMarks(n),
    perf.clearMarks(r)),
    devtoolsPerfEnd(e, t, (isSupported() ? perf : Date).now());
}
function isSupported() {
  return (
    void 0 !== supported ||
      ("undefined" != typeof window && window.performance
        ? ((supported = !0), (perf = window.performance))
        : (supported = !1)),
    supported
  );
}
const queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(e) {
  return baseCreateRenderer(e);
}
function createHydrationRenderer(e) {
  return baseCreateRenderer(e, createHydrationFunctions);
}
function baseCreateRenderer(e, t) {
  const n = getGlobalThis(),
    {
      insert: B,
      remove: d,
      patchProp: E,
      createElement: v,
      createText: $,
      createComment: o,
      setText: H,
      setElementText: _,
      parentNode: y,
      nextSibling: L,
      setScopeId: i = NOOP,
      insertStaticContent: j,
    } = ((n.__VUE__ = !0),
    setDevtoolsHook(n.__VUE_DEVTOOLS_GLOBAL_HOOK__, n),
    e),
    O = (
      r,
      o,
      s,
      i = null,
      a = null,
      l = null,
      c = !1,
      p = null,
      u = !isHmrUpdating && !!o.dynamicChildren
    ) => {
      if (r !== o) {
        r && !isSameVNodeType(r, o) && ((i = J(r)), q(r, a, l, !0), (r = null)),
          -2 === o.patchFlag && ((u = !1), (o.dynamicChildren = null));
        const { type: k, ref: N, shapeFlag: I } = o;
        switch (k) {
          case Text:
            var e = r,
              t = o,
              n = s,
              d = i;
            if (e == null) B((t.el = $(t.children)), n, d);
            else {
              const A = (t.el = e.el);
              if (t.children !== e.children) H(A, t.children);
            }
            break;
          case Comment:
            U(r, o, s, i);
            break;
          case Static:
            if (null == r)
              (n = o),
                (d = s),
                (e = i),
                (t = c),
                ([n.el, n.anchor] = j(n.children, d, e, t, n.el, n.anchor));
            else {
              var f = r,
                m = o,
                h = s,
                g = c;
              if (m.children !== f.children) {
                const P = L(f.anchor);
                W(f);
                [m.el, m.anchor] = j(m.children, h, P, g);
              } else {
                m.el = f.el;
                m.anchor = f.anchor;
              }
            }
            break;
          case Fragment:
            {
              h = r;
              g = o;
              m = s;
              f = i;
              var v = a;
              var y = l;
              var E = c;
              var S = p;
              var C = u;
              const M = (g.el = h ? h.el : $("")),
                V = (g.anchor = h ? h.anchor : $(""));
              let { patchFlag: e, dynamicChildren: t, slotScopeIds: n } = g;
              if (isHmrUpdating || e & 2048) {
                e = 0;
                C = false;
                t = null;
              }
              if (n) S = S ? S.concat(n) : n;
              if (h == null) {
                B(M, m, f);
                B(V, m, f);
                z(g.children, m, V, v, y, E, S, C);
              } else if (e > 0 && e & 64 && t && h.dynamicChildren) {
                K(h.dynamicChildren, t, m, v, y, E, S);
                if (v && v.type.__hmrId) traverseStaticChildren(h, g);
                else if (g.key != null || (v && g === v.subTree))
                  traverseStaticChildren(h, g, true);
              } else Y(h, g, m, V, v, y, E, S, C);
            }
            break;
          default:
            if (1 & I) {
              var v = r,
                y = o,
                E = s,
                S = i,
                C = a,
                b = l,
                T = c,
                _ = p,
                w = u;
              if (((T = T || y.type === "svg"), v == null))
                X(y, E, S, C, b, T, _, w);
              else Q(v, y, C, b, T, _, w);
            } else if (6 & I) {
              var b = r,
                T = o,
                _ = s,
                w = i,
                x = a,
                F = l,
                R = c,
                D = p,
                O = u;
              if (((T.slotScopeIds = D), b == null))
                if (T.shapeFlag & 512) x.ctx.activate(T, _, w, R, O);
                else G(T, _, w, x, F, R, O);
              else ee(b, T, O);
            } else
              64 & I || 128 & I
                ? k.process(r, o, s, i, a, l, c, p, u, Z)
                : warn$1("Invalid VNode type:", k, `(${typeof k})`);
        }
        null != N && a && setRef(N, r && r.ref, l, o || r, !o);
      }
    },
    U = (e, t, n, r) => {
      null == e ? B((t.el = o(t.children || "")), n, r) : (t.el = e.el);
    },
    W = ({ el: e, anchor: t }) => {
      for (var n; e && e !== t; ) (n = L(e)), d(e), (e = n);
      d(t);
    },
    X = (e, t, n, r, o, s, i, a) => {
      let l, c;
      const { type: p, props: u, shapeFlag: d, transition: f, dirs: m } = e;
      if (
        ((l = e.el = v(e.type, s, u && u.is, u)),
        8 & d
          ? _(l, e.children)
          : 16 & d &&
            z(e.children, l, null, r, o, s && "foreignObject" !== p, i, a),
        m && invokeDirectiveHook(e, null, r, "created"),
        u)
      ) {
        for (const g in u)
          "value" === g ||
            isReservedProp(g) ||
            E(l, g, null, u[g], s, e.children, r, o, x);
        "value" in u && E(l, "value", null, u.value),
          (c = u.onVnodeBeforeMount) && invokeVNodeHook(c, r, e);
      }
      S(l, e, e.scopeId, i, r),
        Object.defineProperty(l, "__vnode", { value: e, enumerable: !1 }),
        Object.defineProperty(l, "__vueParentComponent", {
          value: r,
          enumerable: !1,
        }),
        m && invokeDirectiveHook(e, null, r, "beforeMount");
      const h = (!o || !o.pendingBranch) && f && !f.persisted;
      h && f.beforeEnter(l),
        B(l, t, n),
        ((c = u && u.onVnodeMounted) || h || m) &&
          queuePostRenderEffect(() => {
            c && invokeVNodeHook(c, r, e),
              h && f.enter(l),
              m && invokeDirectiveHook(e, null, r, "mounted");
          }, o);
    },
    S = (t, n, r, o, s) => {
      if ((r && i(t, r), o)) for (let e = 0; e < o.length; e++) i(t, o[e]);
      if (s) {
        let e = s.subTree;
        n ===
          (e =
            0 < e.patchFlag && 2048 & e.patchFlag
              ? filterSingleRoot(e.children) || e
              : e) &&
          ((r = s.vnode), S(t, r, r.scopeId, r.slotScopeIds, s.parent));
      }
    },
    z = (t, n, r, o, s, i, a, l, c = 0) => {
      for (let e = c; e < t.length; e++) {
        var p = (t[e] = (l ? cloneIfMounted : normalizeVNode)(t[e]));
        O(null, p, n, r, o, s, i, a, l);
      }
    },
    Q = (t, e, n, r, o, s, i) => {
      var a = (e.el = t.el);
      let { patchFlag: l, dynamicChildren: c, dirs: p } = e;
      l |= 16 & t.patchFlag;
      var u = t.props || EMPTY_OBJ,
        d = e.props || EMPTY_OBJ;
      let f;
      n && toggleRecurse(n, !1),
        (f = d.onVnodeBeforeUpdate) && invokeVNodeHook(f, n, e, t),
        p && invokeDirectiveHook(e, t, n, "beforeUpdate"),
        n && toggleRecurse(n, !0),
        isHmrUpdating && ((l = 0), (i = !1), (c = null));
      var m = o && "foreignObject" !== e.type;
      if (
        (c
          ? (K(t.dynamicChildren, c, a, n, r, m, s),
            n && n.type.__hmrId && traverseStaticChildren(t, e))
          : i || Y(t, e, a, null, n, r, m, s, !1),
        0 < l)
      ) {
        if (16 & l) C(a, e, u, d, n, r, o);
        else if (
          (2 & l && u.class !== d.class && E(a, "class", null, d.class, o),
          4 & l && E(a, "style", u.style, d.style, o),
          8 & l)
        ) {
          var h = e.dynamicProps;
          for (let e = 0; e < h.length; e++) {
            var g = h[e],
              v = u[g],
              y = d[g];
            (y === v && "value" !== g) || E(a, g, v, y, o, t.children, n, r, x);
          }
        }
        1 & l && t.children !== e.children && _(a, e.children);
      } else i || null != c || C(a, e, u, d, n, r, o);
      ((f = d.onVnodeUpdated) || p) &&
        queuePostRenderEffect(() => {
          f && invokeVNodeHook(f, n, e, t),
            p && invokeDirectiveHook(e, t, n, "updated");
        }, r);
    },
    K = (t, n, r, o, s, i, a) => {
      for (let e = 0; e < n.length; e++) {
        var l = t[e],
          c = n[e],
          p =
            l.el &&
            (l.type === Fragment || !isSameVNodeType(l, c) || 70 & l.shapeFlag)
              ? y(l.el)
              : r;
        O(l, c, p, null, o, s, i, a, !0);
      }
    },
    C = (e, t, n, r, o, s, i) => {
      if (n !== r) {
        if (n !== EMPTY_OBJ)
          for (const c in n)
            isReservedProp(c) ||
              c in r ||
              E(e, c, n[c], null, i, t.children, o, s, x);
        for (const p in r) {
          var a, l;
          isReservedProp(p) ||
            ((a = r[p]) !== (l = n[p]) &&
              "value" !== p &&
              E(e, p, l, a, i, t.children, o, s, x));
        }
        "value" in r && E(e, "value", n.value, r.value);
      }
    },
    G = (e, t, n, r, o, s, i) => {
      const a = (e.component = createComponentInstance(e, r, o));
      if (
        (a.type.__hmrId && registerHMR(a),
        pushWarningContext(e),
        startMeasure(a, "mount"),
        isKeepAlive(e) && (a.ctx.renderer = Z),
        startMeasure(a, "init"),
        setupComponent(a),
        endMeasure(a, "init"),
        a.asyncDep)
      )
        return (
          o && o.registerDep(a, l),
          void (
            e.el || ((r = a.subTree = createVNode(Comment)), U(null, r, t, n))
          )
        );
      l(a, e, t, n, o, s, i), popWarningContext(), endMeasure(a, "mount");
    },
    ee = (e, t, n) => {
      const r = (t.component = e.component);
      shouldUpdateComponent(e, t, n)
        ? r.asyncDep && !r.asyncResolved
          ? (pushWarningContext(t), b(r, t, n), popWarningContext())
          : ((r.next = t), invalidateJob(r.update), r.update())
        : ((t.el = e.el), (r.vnode = t));
    },
    l = (u, d, f, m, h, g, v) => {
      const e = (u.effect = new ReactiveEffect(
          () => {
            if (u.isMounted) {
              let { next: e, bu: t, u: n, parent: r, vnode: o } = u;
              var i = e;
              let s;
              pushWarningContext(e || u.vnode),
                toggleRecurse(u, !1),
                e ? ((e.el = o.el), b(u, e, v)) : (e = o),
                t && invokeArrayFns(t),
                (s = e.props && e.props.onVnodeBeforeUpdate) &&
                  invokeVNodeHook(s, r, e, o),
                toggleRecurse(u, !0),
                startMeasure(u, "render");
              var a = renderComponentRoot(u),
                l = (endMeasure(u, "render"), u.subTree);
              (u.subTree = a),
                startMeasure(u, "patch"),
                O(l, a, y(l.el), J(l), u, h, g),
                endMeasure(u, "patch"),
                (e.el = a.el),
                null === i && updateHOCHostEl(u, a.el),
                n && queuePostRenderEffect(n, h),
                (s = e.props && e.props.onVnodeUpdated) &&
                  queuePostRenderEffect(() => invokeVNodeHook(s, r, e, o), h),
                devtoolsComponentUpdated(u),
                popWarningContext();
            } else {
              let e;
              const { el: t, props: n } = d,
                { bm: r, m: o, parent: s } = u;
              l = isAsyncWrapper(d);
              if (
                (toggleRecurse(u, !1),
                r && invokeArrayFns(r),
                !l &&
                  (e = n && n.onVnodeBeforeMount) &&
                  invokeVNodeHook(e, s, d),
                toggleRecurse(u, !0),
                t && T)
              ) {
                const c = () => {
                  startMeasure(u, "render"),
                    (u.subTree = renderComponentRoot(u)),
                    endMeasure(u, "render"),
                    startMeasure(u, "hydrate"),
                    T(t, u.subTree, u, h, null),
                    endMeasure(u, "hydrate");
                };
                l
                  ? d.type.__asyncLoader().then(() => !u.isUnmounted && c())
                  : c();
              } else {
                startMeasure(u, "render");
                i = u.subTree = renderComponentRoot(u);
                endMeasure(u, "render"),
                  startMeasure(u, "patch"),
                  O(null, i, f, m, u, h, g),
                  endMeasure(u, "patch"),
                  (d.el = i.el);
              }
              if (
                (o && queuePostRenderEffect(o, h),
                !l && (e = n && n.onVnodeMounted))
              ) {
                const p = d;
                queuePostRenderEffect(() => invokeVNodeHook(e, s, p), h);
              }
              (256 & d.shapeFlag ||
                (s && isAsyncWrapper(s.vnode) && 256 & s.vnode.shapeFlag)) &&
                u.a &&
                queuePostRenderEffect(u.a, h),
                (u.isMounted = !0),
                devtoolsComponentAdded(u),
                (d = f = m = null);
            }
          },
          () => queueJob(t),
          u.scope
        )),
        t = (u.update = () => e.run());
      (t.id = u.uid),
        toggleRecurse(u, !0),
        (e.onTrack = u.rtc ? (e) => invokeArrayFns(u.rtc, e) : void 0),
        (e.onTrigger = u.rtg ? (e) => invokeArrayFns(u.rtg, e) : void 0),
        (t.ownerInstance = u),
        t();
    },
    b = (e, t, n) => {
      var r = (t.component = e).vnode.props;
      (e.vnode = t),
        (e.next = null),
        updateProps(e, t.props, r, n),
        updateSlots(e, t.children, n),
        pauseTracking(),
        flushPreFlushCbs(),
        resetTracking();
    },
    Y = (e, t, n, r, o, s, i, a, l = !1) => {
      var c = e && e.children,
        e = e ? e.shapeFlag : 0,
        p = t.children,
        { patchFlag: t, shapeFlag: u } = t;
      if (0 < t) {
        if (128 & t) return void w(c, p, n, r, o, s, i, a, l);
        if (256 & t) {
          {
            var d = c;
            var f = p;
            var m = n;
            t = r;
            var h = o;
            var g = s;
            var v = i;
            var y = a;
            var E = l;
            (d = d || EMPTY_ARR), (f = f || EMPTY_ARR);
            const S = d.length,
              C = f.length,
              b = Math.min(S, C);
            let e;
            for (e = 0; e < b; e++) {
              const T = (f[e] = E
                ? cloneIfMounted(f[e])
                : normalizeVNode(f[e]));
              O(d[e], T, m, null, h, g, v, y, E);
            }
            if (S > C) x(d, h, g, true, false, b);
            else z(f, m, t, h, g, v, y, E, b);
          }
          return;
        }
      }
      8 & u
        ? (16 & e && x(c, o, s), p !== c && _(n, p))
        : 16 & e
        ? 16 & u
          ? w(c, p, n, r, o, s, i, a, l)
          : x(c, o, s, !0)
        : (8 & e && _(n, ""), 16 & u && z(p, n, r, o, s, i, a, l));
    },
    w = (e, s, i, a, l, c, p, u, d) => {
      let f = 0;
      var m = s.length;
      let h = e.length - 1,
        g = m - 1;
      for (; f <= h && f <= g; ) {
        var t = e[f],
          n = (s[f] = (d ? cloneIfMounted : normalizeVNode)(s[f]));
        if (!isSameVNodeType(t, n)) break;
        O(t, n, i, null, l, c, p, u, d), f++;
      }
      for (; f <= h && f <= g; ) {
        var r = e[h],
          o = (s[g] = (d ? cloneIfMounted : normalizeVNode)(s[g]));
        if (!isSameVNodeType(r, o)) break;
        O(r, o, i, null, l, c, p, u, d), h--, g--;
      }
      if (f > h) {
        if (f <= g)
          for (var v = g + 1, y = v < m ? s[v].el : a; f <= g; )
            O(
              null,
              (s[f] = (d ? cloneIfMounted : normalizeVNode)(s[f])),
              i,
              y,
              l,
              c,
              p,
              u,
              d
            ),
              f++;
      } else if (f > g) for (; f <= h; ) q(e[f], l, c, !0), f++;
      else {
        var v = f,
          E = f;
        const x = new Map();
        for (f = E; f <= g; f++) {
          var S = (s[f] = (d ? cloneIfMounted : normalizeVNode)(s[f]));
          null != S.key &&
            (x.has(S.key) &&
              warn$1(
                "Duplicate keys found during update:",
                JSON.stringify(S.key),
                "Make sure keys are unique."
              ),
            x.set(S.key, f));
        }
        let t,
          n = 0;
        var C = g - E + 1;
        let r = !1,
          o = 0;
        const R = new Array(C);
        for (f = 0; f < C; f++) R[f] = 0;
        for (f = v; f <= h; f++) {
          var b = e[f];
          if (n >= C) q(b, l, c, !0);
          else {
            let e;
            if (null != b.key) e = x.get(b.key);
            else
              for (t = E; t <= g; t++)
                if (0 === R[t - E] && isSameVNodeType(b, s[t])) {
                  e = t;
                  break;
                }
            void 0 === e
              ? q(b, l, c, !0)
              : ((R[e - E] = f + 1),
                e >= o ? (o = e) : (r = !0),
                O(b, s[e], i, null, l, c, p, u, d),
                n++);
          }
        }
        var T = r ? getSequence(R) : EMPTY_ARR;
        for (t = T.length - 1, f = C - 1; 0 <= f; f--) {
          var _ = E + f,
            w = s[_],
            _ = _ + 1 < m ? s[_ + 1].el : a;
          0 === R[f]
            ? O(null, w, i, _, l, c, p, u, d)
            : r && (t < 0 || f !== T[t] ? k(w, i, _, 2) : t--);
        }
      }
    },
    k = (e, t, n, r, o = null) => {
      const { el: s, type: i, transition: a, children: l, shapeFlag: c } = e;
      if (6 & c) k(e.component.subTree, t, n, r);
      else if (128 & c) e.suspense.move(t, n, r);
      else if (64 & c) i.move(e, t, n, Z);
      else if (i === Fragment) {
        B(s, t, n);
        for (let e = 0; e < l.length; e++) k(l[e], t, n, r);
        B(e.anchor, t, n);
      } else if (i === Static) {
        for (var p, [{ el: u, anchor: d }, f, m] = [e, t, n]; u && u !== d; )
          (p = L(u)), B(u, f, m), (u = p);
        B(d, f, m);
      } else if (2 !== r && 1 & c && a)
        if (0 === r)
          a.beforeEnter(s),
            B(s, t, n),
            queuePostRenderEffect(() => a.enter(s), o);
        else {
          const { leave: h, delayLeave: g, afterLeave: v } = a,
            y = () => B(s, t, n);
          e = () => {
            h(s, () => {
              y(), v && v();
            });
          };
          g ? g(s, y, e) : e();
        }
      else B(s, t, n);
    },
    q = (t, n, r, o = !1, s = !1) => {
      var {
        type: i,
        props: a,
        ref: l,
        children: c,
        dynamicChildren: p,
        shapeFlag: u,
        patchFlag: d,
        dirs: f,
      } = t;
      if ((null != l && setRef(l, null, r, t, !0), 256 & u))
        n.ctx.deactivate(t);
      else {
        const m = 1 & u && f;
        l = !isAsyncWrapper(t);
        let e;
        if (
          (l && (e = a && a.onVnodeBeforeUnmount) && invokeVNodeHook(e, n, t),
          6 & u)
        )
          g(t.component, r, o);
        else {
          if (128 & u) return void t.suspense.unmount(r, o);
          m && invokeDirectiveHook(t, null, n, "beforeUnmount"),
            64 & u
              ? t.type.remove(t, n, r, s, Z, o)
              : p && (i !== Fragment || (0 < d && 64 & d))
              ? x(p, n, r, !1, !0)
              : ((i === Fragment && 384 & d) || (!s && 16 & u)) && x(c, n, r),
            o && h(t);
        }
        ((l && (e = a && a.onVnodeUnmounted)) || m) &&
          queuePostRenderEffect(() => {
            e && invokeVNodeHook(e, n, t),
              m && invokeDirectiveHook(t, null, n, "unmounted");
          }, r);
      }
    },
    h = (e) => {
      const { type: t, el: n, anchor: r, transition: o } = e;
      if (t === Fragment)
        if (0 < e.patchFlag && 2048 & e.patchFlag && o && !o.persisted)
          e.children.forEach((e) => {
            e.type === Comment ? d(e.el) : h(e);
          });
        else {
          var s = n;
          var i = r;
          var a;
          for (; s !== i; ) (a = L(s)), d(s), (s = a);
          d(i);
        }
      else if (t === Static) W(e);
      else {
        const c = () => {
          d(n), o && !o.persisted && o.afterLeave && o.afterLeave();
        };
        if (1 & e.shapeFlag && o && !o.persisted) {
          const { leave: p, delayLeave: u } = o;
          var l = () => p(n, c);
          u ? u(e.el, c, l) : l();
        } else c();
      }
    },
    g = (e, t, n) => {
      e.type.__hmrId && unregisterHMR(e);
      const { bum: r, scope: o, update: s, subTree: i, um: a } = e;
      r && invokeArrayFns(r),
        o.stop(),
        s && ((s.active = !1), q(i, e, t, n)),
        a && queuePostRenderEffect(a, t),
        queuePostRenderEffect(() => {
          e.isUnmounted = !0;
        }, t),
        t &&
          t.pendingBranch &&
          !t.isUnmounted &&
          e.asyncDep &&
          !e.asyncResolved &&
          e.suspenseId === t.pendingId &&
          (t.deps--, 0 === t.deps && t.resolve()),
        devtoolsComponentRemoved(e);
    },
    x = (t, n, r, o = !1, s = !1, i = 0) => {
      for (let e = i; e < t.length; e++) q(t[e], n, r, o, s);
    },
    J = (e) =>
      6 & e.shapeFlag
        ? J(e.component.subTree)
        : 128 & e.shapeFlag
        ? e.suspense.next()
        : L(e.anchor || e.el);
  var r = (e, t, n) => {
    null == e
      ? t._vnode && q(t._vnode, null, null, !0)
      : O(t._vnode || null, e, t, null, null, null, n),
      flushPreFlushCbs(),
      flushPostFlushCbs(),
      (t._vnode = e);
  };
  const Z = {
    p: O,
    um: q,
    m: k,
    r: h,
    mt: G,
    mc: z,
    pc: Y,
    pbc: K,
    n: J,
    o: e,
  };
  let s, T;
  return (
    t && ([s, T] = t(Z)),
    { render: r, hydrate: s, createApp: createAppAPI(r, s) }
  );
}
function toggleRecurse({ effect: e, update: t }, n) {
  e.allowRecurse = t.allowRecurse = n;
}
function traverseStaticChildren(e, t, n = !1) {
  var r = e.children;
  const o = t.children;
  if (isArray(r) && isArray(o))
    for (let t = 0; t < r.length; t++) {
      var s = r[t];
      let e = o[t];
      1 & e.shapeFlag &&
        !e.dynamicChildren &&
        ((e.patchFlag <= 0 || 32 === e.patchFlag) &&
          ((e = o[t] = cloneIfMounted(o[t])).el = s.el),
        n || traverseStaticChildren(s, e)),
        e.type === Text && (e.el = s.el),
        e.type !== Comment || e.el || (e.el = s.el);
    }
}
function getSequence(e) {
  const t = e.slice(),
    n = [0];
  let r, o, s, i, a;
  var l = e.length;
  for (r = 0; r < l; r++) {
    var c = e[r];
    if (0 !== c)
      if (e[(o = n[n.length - 1])] < c) (t[r] = o), n.push(r);
      else {
        for (s = 0, i = n.length - 1; s < i; )
          (a = (s + i) >> 1), e[n[a]] < c ? (s = 1 + a) : (i = a);
        c < e[n[s]] && (0 < s && (t[r] = n[s - 1]), (n[s] = r));
      }
  }
  for (s = n.length, i = n[s - 1]; 0 < s--; ) (n[s] = i), (i = t[i]);
  return n;
}
const isTeleport = (e) => e.__isTeleport,
  isTeleportDisabled = (e) => e && (e.disabled || "" === e.disabled),
  isTargetSVG = (e) =>
    "undefined" != typeof SVGElement && e instanceof SVGElement,
  resolveTarget = (e, t) => {
    var n = e && e.to;
    return isString(n)
      ? t
        ? ((t = t(n)) ||
            warn$1(
              `Failed to locate Teleport target with selector "${n}". ` +
                "Note the target element must exist before the component is mounted - i.e. the target cannot be rendered by the component itself, and ideally should be outside of the entire Vue component tree."
            ),
          t)
        : (warn$1(
            "Current renderer does not support string target for Teleports. (missing querySelector renderer option)"
          ),
          null)
      : (n || isTeleportDisabled(e) || warn$1("Invalid Teleport target: " + n),
        n);
  },
  TeleportImpl = {
    __isTeleport: !0,
    process(e, t, n, r, o, s, i, a, l, c) {
      const {
        mc: p,
        pc: u,
        pbc: d,
        o: { insert: f, querySelector: m, createText: h, createComment: g },
      } = c;
      var v,
        y,
        E,
        S,
        C,
        b = isTeleportDisabled(t.props);
      let { shapeFlag: T, children: _, dynamicChildren: w } = t;
      isHmrUpdating && ((l = !1), (w = null)),
        null == e
          ? ((E = t.el = g("teleport start")),
            (v = t.anchor = g("teleport end")),
            f(E, n, r),
            f(v, n, r),
            (E = t.target = resolveTarget(t.props, m)),
            (r = t.targetAnchor = h("")),
            E
              ? (f(r, E), (i = i || isTargetSVG(E)))
              : b ||
                warn$1("Invalid Teleport target on mount:", E, `(${typeof E})`),
            (y = (e, t) => {
              16 & T && p(_, e, t, o, s, i, a, l);
            }),
            b ? y(n, v) : E && y(E, r))
          : ((t.el = e.el),
            (v = t.anchor = e.anchor),
            (y = t.target = e.target),
            (E = t.targetAnchor = e.targetAnchor),
            (C = (r = isTeleportDisabled(e.props)) ? n : y),
            (S = r ? v : E),
            (i = i || isTargetSVG(y)),
            w
              ? (d(e.dynamicChildren, w, C, o, s, i, a),
                traverseStaticChildren(e, t, !0))
              : l || u(e, t, C, S, o, s, i, a, !1),
            b
              ? r || moveTeleport(t, n, v, c, 1)
              : (t.props && t.props.to) !== (e.props && e.props.to)
              ? (C = t.target = resolveTarget(t.props, m))
                ? moveTeleport(t, C, null, c, 0)
                : warn$1(
                    "Invalid Teleport target on update:",
                    y,
                    `(${typeof y})`
                  )
              : r && moveTeleport(t, y, E, c, 1)),
        updateCssVars(t);
    },
    remove(e, t, n, r, { um: o, o: { remove: s } }, i) {
      var {
        shapeFlag: e,
        children: a,
        anchor: l,
        targetAnchor: c,
        target: p,
        props: u,
      } = e;
      if ((p && s(c), (i || !isTeleportDisabled(u)) && (s(l), 16 & e)))
        for (let e = 0; e < a.length; e++) {
          var d = a[e];
          o(d, t, n, !0, !!d.dynamicChildren);
        }
    },
    move: moveTeleport,
    hydrate: hydrateTeleport,
  };
function moveTeleport(e, t, n, { o: { insert: r }, m: o }, s = 2) {
  0 === s && r(e.targetAnchor, t, n);
  var { el: e, anchor: i, shapeFlag: a, children: l, props: c } = e,
    s = 2 === s;
  if ((s && r(e, t, n), (!s || isTeleportDisabled(c)) && 16 & a))
    for (let e = 0; e < l.length; e++) o(l[e], t, n, 2);
  s && r(i, t, n);
}
function hydrateTeleport(
  t,
  n,
  r,
  o,
  s,
  i,
  { o: { nextSibling: a, parentNode: e, querySelector: l } },
  c
) {
  const p = (n.target = resolveTarget(n.props, l));
  if (p) {
    l = p._lpa || p.firstChild;
    if (16 & n.shapeFlag)
      if (isTeleportDisabled(n.props))
        (n.anchor = c(a(t), n, e(t), r, o, s, i)), (n.targetAnchor = l);
      else {
        n.anchor = a(t);
        let e = l;
        for (; e; )
          if ((e = a(e)) && 8 === e.nodeType && "teleport anchor" === e.data) {
            (n.targetAnchor = e),
              (p._lpa = n.targetAnchor && a(n.targetAnchor));
            break;
          }
        c(l, n, p, r, o, s, i);
      }
    updateCssVars(n);
  }
  return n.anchor && a(n.anchor);
}
const Teleport = TeleportImpl;
function updateCssVars(t) {
  const n = t.ctx;
  if (n && n.ut) {
    let e = t.children[0].el;
    for (; e !== t.targetAnchor; )
      1 === e.nodeType && e.setAttribute("data-v-owner", n.uid),
        (e = e.nextSibling);
    n.ut();
  }
}
const Fragment = Symbol("Fragment"),
  Text = Symbol("Text"),
  Comment = Symbol("Comment"),
  Static = Symbol("Static"),
  blockStack = [];
let currentBlock = null;
function openBlock(e = !1) {
  blockStack.push((currentBlock = e ? null : []));
}
function closeBlock() {
  blockStack.pop(), (currentBlock = blockStack[blockStack.length - 1] || null);
}
let isBlockTreeEnabled = 1;
function setBlockTracking(e) {
  isBlockTreeEnabled += e;
}
function setupBlock(e) {
  return (
    (e.dynamicChildren =
      0 < isBlockTreeEnabled ? currentBlock || EMPTY_ARR : null),
    closeBlock(),
    0 < isBlockTreeEnabled && currentBlock && currentBlock.push(e),
    e
  );
}
function createElementBlock(e, t, n, r, o, s) {
  return setupBlock(createBaseVNode(e, t, n, r, o, s, !0));
}
function createBlock(e, t, n, r, o) {
  return setupBlock(createVNode(e, t, n, r, o, !0));
}
function isVNode(e) {
  return !!e && !0 === e.__v_isVNode;
}
function isSameVNodeType(e, t) {
  return 6 & t.shapeFlag && hmrDirtyComponents.has(t.type)
    ? ((e.shapeFlag &= -257), (t.shapeFlag &= -513), !1)
    : e.type === t.type && e.key === t.key;
}
let vnodeArgsTransformer;
function transformVNodeArgs(e) {
  vnodeArgsTransformer = e;
}
const createVNodeWithArgsTransform = (...e) =>
    _createVNode(
      ...(vnodeArgsTransformer
        ? vnodeArgsTransformer(e, currentRenderingInstance)
        : e)
    ),
  InternalObjectKey = "__vInternal",
  normalizeKey = ({ key: e }) => (null != e ? e : null),
  normalizeRef = ({ ref: e, ref_key: t, ref_for: n }) =>
    null != e
      ? isString(e) || isRef(e) || isFunction(e)
        ? { i: currentRenderingInstance, r: e, k: t, f: !!n }
        : e
      : null;
function createBaseVNode(
  e,
  t = null,
  n = null,
  r = 0,
  o = null,
  s = e === Fragment ? 0 : 1,
  i = !1,
  a = !1
) {
  const l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && normalizeKey(t),
    ref: t && normalizeRef(t),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children: n,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: s,
    patchFlag: r,
    dynamicProps: o,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance,
  };
  return (
    a
      ? (normalizeChildren(l, n), 128 & s && e.normalize(l))
      : n && (l.shapeFlag |= isString(n) ? 8 : 16),
    l.key != l.key &&
      warn$1("VNode created with invalid key (NaN). VNode type:", l.type),
    0 < isBlockTreeEnabled &&
      !i &&
      currentBlock &&
      (0 < l.patchFlag || 6 & s) &&
      32 !== l.patchFlag &&
      currentBlock.push(l),
    l
  );
}
const createVNode = createVNodeWithArgsTransform;
function _createVNode(e, n = null, t = null, r = 0, o = null, s = !1) {
  if (
    ((e && e !== NULL_DYNAMIC_COMPONENT) ||
      (e || warn$1(`Invalid vnode type when creating vnode: ${e}.`),
      (e = Comment)),
    isVNode(e))
  ) {
    const a = cloneVNode(e, n, !0);
    return (
      t && normalizeChildren(a, t),
      0 < isBlockTreeEnabled &&
        !s &&
        currentBlock &&
        (6 & a.shapeFlag
          ? (currentBlock[currentBlock.indexOf(e)] = a)
          : currentBlock.push(a)),
      (a.patchFlag |= -2),
      a
    );
  }
  if ((isClassComponent(e) && (e = e.__vccOpts), n)) {
    let { class: e, style: t } = (n = guardReactiveProps(n));
    e && !isString(e) && (n.class = normalizeClass(e)),
      isObject(t) &&
        (isProxy(t) && !isArray(t) && (t = extend({}, t)),
        (n.style = normalizeStyle(t)));
  }
  var i = isString(e)
    ? 1
    : isSuspense(e)
    ? 128
    : isTeleport(e)
    ? 64
    : isObject(e)
    ? 4
    : isFunction(e)
    ? 2
    : 0;
  return (
    4 & i &&
      isProxy(e) &&
      warn$1(
        "Vue received a Component which was made a reactive object. This can lead to unnecessary performance overhead, and should be avoided by marking the component with `markRaw` or using `shallowRef` instead of `ref`.",
        `
Component that was made reactive: `,
        (e = toRaw(e))
      ),
    createBaseVNode(e, n, t, r, o, i, s, !0)
  );
}
function guardReactiveProps(e) {
  return e ? (isProxy(e) || InternalObjectKey in e ? extend({}, e) : e) : null;
}
function cloneVNode(e, t, n = !1) {
  const { props: r, ref: o, patchFlag: s, children: i } = e;
  var a = t ? mergeProps(r || {}, t) : r;
  return {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: a,
    key: a && normalizeKey(a),
    ref:
      t && t.ref
        ? n && o
          ? isArray(o)
            ? o.concat(normalizeRef(t))
            : [o, normalizeRef(t)]
          : normalizeRef(t)
        : o,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: -1 === s && isArray(i) ? i.map(deepCloneVNode) : i,
    target: e.target,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    patchFlag: t && e.type !== Fragment ? (-1 === s ? 16 : 16 | s) : s,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: e.transition,
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && cloneVNode(e.ssContent),
    ssFallback: e.ssFallback && cloneVNode(e.ssFallback),
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
  };
}
function deepCloneVNode(e) {
  const t = cloneVNode(e);
  return (
    isArray(e.children) && (t.children = e.children.map(deepCloneVNode)), t
  );
}
function createTextVNode(e = " ", t = 0) {
  return createVNode(Text, null, e, t);
}
function createStaticVNode(e, t) {
  const n = createVNode(Static, null, e);
  return (n.staticCount = t), n;
}
function createCommentVNode(e = "", t = !1) {
  return t
    ? (openBlock(), createBlock(Comment, null, e))
    : createVNode(Comment, null, e);
}
function normalizeVNode(e) {
  return null == e || "boolean" == typeof e
    ? createVNode(Comment)
    : isArray(e)
    ? createVNode(Fragment, null, e.slice())
    : "object" == typeof e
    ? cloneIfMounted(e)
    : createVNode(Text, null, String(e));
}
function cloneIfMounted(e) {
  return (null === e.el && -1 !== e.patchFlag) || e.memo ? e : cloneVNode(e);
}
function normalizeChildren(e, t) {
  let n = 0;
  var r = e["shapeFlag"];
  if (null == t) t = null;
  else if (isArray(t)) n = 16;
  else if ("object" == typeof t) {
    if (65 & r) {
      const s = t.default;
      return void (
        s &&
        (s._c && (s._d = !1), normalizeChildren(e, s()), s._c && (s._d = !0))
      );
    }
    n = 32;
    var o = t._;
    o || InternalObjectKey in t
      ? 3 === o &&
        currentRenderingInstance &&
        (1 === currentRenderingInstance.slots._
          ? (t._ = 1)
          : ((t._ = 2), (e.patchFlag |= 1024)))
      : (t._ctx = currentRenderingInstance);
  } else
    isFunction(t)
      ? ((t = { default: t, _ctx: currentRenderingInstance }), (n = 32))
      : ((t = String(t)),
        64 & r ? ((n = 16), (t = [createTextVNode(t)])) : (n = 8));
  (e.children = t), (e.shapeFlag |= n);
}
function mergeProps(...t) {
  const n = {};
  for (let e = 0; e < t.length; e++) {
    var r = t[e];
    for (const s in r)
      if ("class" === s)
        n.class !== r.class && (n.class = normalizeClass([n.class, r.class]));
      else if ("style" === s) n.style = normalizeStyle([n.style, r.style]);
      else if (isOn(s)) {
        const i = n[s];
        var o = r[s];
        !o ||
          i === o ||
          (isArray(i) && i.includes(o)) ||
          (n[s] = i ? [].concat(i, o) : o);
      } else "" !== s && (n[s] = r[s]);
  }
  return n;
}
function invokeVNodeHook(e, t, n, r = null) {
  callWithAsyncErrorHandling(e, t, 7, [n, r]);
}
const emptyAppContext = createAppContext();
let uid$1 = 0;
function createComponentInstance(e, t, n) {
  var r = e.type,
    o = (t || e).appContext || emptyAppContext;
  const s = {
    uid: uid$1++,
    vnode: e,
    type: r,
    parent: t,
    appContext: o,
    root: null,
    next: null,
    subTree: null,
    effect: null,
    update: null,
    scope: new EffectScope(!0),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: t ? t.provides : Object.create(o.provides),
    accessCache: null,
    renderCache: [],
    components: null,
    directives: null,
    propsOptions: normalizePropsOptions(r, o),
    emitsOptions: normalizeEmitsOptions(r, o),
    emit: null,
    emitted: null,
    propsDefaults: EMPTY_OBJ,
    inheritAttrs: r.inheritAttrs,
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    suspense: n,
    suspenseId: n ? n.pendingId : 0,
    asyncDep: null,
    asyncResolved: !1,
    isMounted: !1,
    isUnmounted: !1,
    isDeactivated: !1,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null,
  };
  return (
    (s.ctx = createDevRenderContext(s)),
    (s.root = t ? t.root : s),
    (s.emit = emit$1.bind(null, s)),
    e.ce && e.ce(s),
    s
  );
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance,
  setCurrentInstance = (e) => {
    (currentInstance = e).scope.on();
  },
  unsetCurrentInstance = () => {
    currentInstance && currentInstance.scope.off(), (currentInstance = null);
  },
  isBuiltInTag = makeMap("slot,component");
function validateComponentName(e, t) {
  const n = t.isNativeTag || NO;
  (isBuiltInTag(e) || n(e)) &&
    warn$1(
      "Do not use built-in or reserved HTML elements as component id: " + e
    );
}
function isStatefulComponent(e) {
  return 4 & e.vnode.shapeFlag;
}
let isInSSRComponentSetup = !1;
function setupComponent(e, t = !1) {
  isInSSRComponentSetup = t;
  var { props: n, children: r } = e.vnode,
    o = isStatefulComponent(e),
    n =
      (initProps(e, n, o, t),
      initSlots(e, r),
      o ? setupStatefulComponent(e, t) : void 0);
  return (isInSSRComponentSetup = !1), n;
}
function setupStatefulComponent(t, n) {
  var e = t.type;
  if (
    (e.name && validateComponentName(e.name, t.appContext.config), e.components)
  ) {
    var r = Object.keys(e.components);
    for (let e = 0; e < r.length; e++)
      validateComponentName(r[e], t.appContext.config);
  }
  if (e.directives) {
    var o = Object.keys(e.directives);
    for (let e = 0; e < o.length; e++) validateDirectiveName(o[e]);
  }
  e.compilerOptions &&
    isRuntimeOnly() &&
    warn$1(
      '"compilerOptions" is only supported when using a build of Vue that includes the runtime compiler. Since you are using a runtime-only build, the options should be passed via your build tool config instead.'
    ),
    (t.accessCache = Object.create(null)),
    (t.proxy = markRaw(new Proxy(t.ctx, PublicInstanceProxyHandlers))),
    exposePropsOnRenderContext(t);
  var s = e["setup"];
  if (s) {
    var i = (t.setupContext = 1 < s.length ? createSetupContext(t) : null);
    setCurrentInstance(t), pauseTracking();
    const a = callWithErrorHandling(s, t, 0, [shallowReadonly(t.props), i]);
    if ((resetTracking(), unsetCurrentInstance(), isPromise(a))) {
      if ((a.then(unsetCurrentInstance, unsetCurrentInstance), n))
        return a
          .then((e) => {
            handleSetupResult(t, e, n);
          })
          .catch((e) => {
            handleError(e, t, 0);
          });
      (t.asyncDep = a),
        t.suspense ||
          warn$1(
            `Component <${
              null != (s = e.name) ? s : "Anonymous"
            }>: setup function returned a promise, but no ` +
              "<Suspense> boundary was found in the parent component tree. A component with async setup() must be nested in a <Suspense> in order to be rendered."
          );
    } else handleSetupResult(t, a, n);
  } else finishComponentSetup(t, n);
}
function handleSetupResult(e, t, n) {
  isFunction(t)
    ? (e.render = t)
    : isObject(t)
    ? (isVNode(t) &&
        warn$1(
          "setup() should not return VNodes directly - return a render function instead."
        ),
      (e.devtoolsRawSetupState = t),
      (e.setupState = proxyRefs(t)),
      exposeSetupStateOnRenderContext(e))
    : void 0 !== t &&
      warn$1(
        "setup() should return an object. Received: " +
          (null === t ? "null" : typeof t)
      ),
    finishComponentSetup(e, n);
}
let compile, installWithProxy;
function registerRuntimeCompiler(e) {
  (compile = e),
    (installWithProxy = (e) => {
      e.render._rc &&
        (e.withProxy = new Proxy(
          e.ctx,
          RuntimeCompiledPublicInstanceProxyHandlers
        ));
    });
}
const isRuntimeOnly = () => !compile;
function finishComponentSetup(e, t, n) {
  const r = e.type;
  var o, s, i, a, l;
  e.render ||
    (t ||
      !compile ||
      r.render ||
      ((o = r.template || resolveMergedOptions(e).template) &&
        (startMeasure(e, "compile"),
        ({ isCustomElement: l, compilerOptions: s } = e.appContext.config),
        ({ delimiters: i, compilerOptions: a } = r),
        (l = extend(extend({ isCustomElement: l, delimiters: i }, s), a)),
        (r.render = compile(o, l)),
        endMeasure(e, "compile"))),
    (e.render = r.render || NOOP),
    installWithProxy && installWithProxy(e)),
    setCurrentInstance(e),
    pauseTracking(),
    applyOptions(e),
    resetTracking(),
    unsetCurrentInstance(),
    r.render ||
      e.render !== NOOP ||
      t ||
      (!compile && r.template
        ? warn$1(
            'Component provided template option but runtime compilation is not supported in this build of Vue. Use "vue.esm-browser.js" instead.'
          )
        : warn$1("Component is missing template or render function."));
}
function createAttrsProxy(n) {
  return new Proxy(n.attrs, {
    get(e, t) {
      return markAttrsAccessed(), track(n, "get", "$attrs"), e[t];
    },
    set() {
      return warn$1("setupContext.attrs is readonly."), !1;
    },
    deleteProperty() {
      return warn$1("setupContext.attrs is readonly."), !1;
    },
  });
}
function createSetupContext(n) {
  let e;
  return Object.freeze({
    get attrs() {
      return (e = e || createAttrsProxy(n));
    },
    get slots() {
      return shallowReadonly(n.slots);
    },
    get emit() {
      return (e, ...t) => n.emit(e, ...t);
    },
    expose: (e) => {
      n.exposed && warn$1("expose() should be called only once per setup()."),
        (n.exposed = e || {});
    },
  });
}
function getExposeProxy(n) {
  if (n.exposed)
    return (
      n.exposeProxy ||
      (n.exposeProxy = new Proxy(proxyRefs(markRaw(n.exposed)), {
        get(e, t) {
          return t in e
            ? e[t]
            : t in publicPropertiesMap
            ? publicPropertiesMap[t](n)
            : void 0;
        },
        has(e, t) {
          return t in e || t in publicPropertiesMap;
        },
      }))
    );
}
const classifyRE = /(?:^|[-_])(\w)/g,
  classify = (e) =>
    e.replace(classifyRE, (e) => e.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(e, t = !0) {
  return isFunction(e) ? e.displayName || e.name : e.name || (t && e.__name);
}
function formatComponentName(e, n, t = !1) {
  let r = getComponentName(n);
  var o;
  return (
    !(r =
      !r && n.__file && (o = n.__file.match(/([^/\\]+)\.\w+$/)) ? o[1] : r) &&
      e &&
      e.parent &&
      ((o = (e) => {
        for (const t in e) if (e[t] === n) return t;
      }),
      (r =
        o(e.components || e.parent.type.components) ||
        o(e.appContext.components))),
    r ? classify(r) : t ? "App" : "Anonymous"
  );
}
function isClassComponent(e) {
  return isFunction(e) && "__vccOpts" in e;
}
const computed$1 = (e, t) => computed(e, t, isInSSRComponentSetup),
  warnRuntimeUsage = (e) =>
    warn$1(
      e +
        "() is a compiler-hint helper that is only usable inside <script setup> of a single file component. Its arguments should be compiled away and passing it at runtime has no effect."
    );
function defineProps() {
  return warnRuntimeUsage("defineProps"), null;
}
function defineEmits() {
  return warnRuntimeUsage("defineEmits"), null;
}
function defineExpose(e) {
  warnRuntimeUsage("defineExpose");
}
function withDefaults(e, t) {
  return warnRuntimeUsage("withDefaults"), null;
}
function useSlots() {
  return getContext().slots;
}
function useAttrs() {
  return getContext().attrs;
}
function getContext() {
  const e = getCurrentInstance();
  return (
    e || warn$1("useContext() called without active instance."),
    e.setupContext || (e.setupContext = createSetupContext(e))
  );
}
function mergeDefaults(e, t) {
  const n = isArray(e) ? e.reduce((e, t) => ((e[t] = {}), e), {}) : e;
  for (const r in t) {
    const o = n[r];
    o
      ? isArray(o) || isFunction(o)
        ? (n[r] = { type: o, default: t[r] })
        : (o.default = t[r])
      : null === o
      ? (n[r] = { default: t[r] })
      : warn$1(`props default key "${r}" has no corresponding declaration.`);
  }
  return n;
}
function createPropsRestProxy(e, t) {
  var n = {};
  for (const r in e)
    t.includes(r) ||
      Object.defineProperty(n, r, { enumerable: !0, get: () => e[r] });
  return n;
}
function withAsyncContext(e) {
  const t = getCurrentInstance();
  t ||
    warn$1(
      "withAsyncContext called without active current instance. This is likely a bug."
    );
  let n = e();
  return (
    unsetCurrentInstance(),
    [
      (n = isPromise(n)
        ? n.catch((e) => {
            throw (setCurrentInstance(t), e);
          })
        : n),
      () => setCurrentInstance(t),
    ]
  );
}
function h(e, t, n) {
  var r = arguments.length;
  return 2 === r
    ? isObject(t) && !isArray(t)
      ? isVNode(t)
        ? createVNode(e, null, [t])
        : createVNode(e, t)
      : createVNode(e, null, t)
    : (3 < r
        ? (n = Array.prototype.slice.call(arguments, 2))
        : 3 === r && isVNode(n) && (n = [n]),
      createVNode(e, t, n));
}
const ssrContextKey = Symbol("ssrContext"),
  useSSRContext = () => {
    var e = inject(ssrContextKey);
    return (
      e ||
        warn$1(
          "Server rendering context not provided. Make sure to only call useSSRContext() conditionally in the server build."
        ),
      e
    );
  };
function initCustomFormatter() {
  if ("undefined" != typeof window) {
    const t = { style: "color:#3ba776" },
      s = { style: "color:#0b1bc9" },
      i = { style: "color:#b62e24" },
      a = { style: "color:#9d288c" };
    var e = {
      header(e) {
        return isObject(e)
          ? e.__isVue
            ? ["div", t, "VueInstance"]
            : isRef(e)
            ? [
                "div",
                {},
                [
                  "span",
                  t,
                  (function (e) {
                    if (isShallow(e)) return "ShallowRef";
                    if (e.effect) return "ComputedRef";
                    return "Ref";
                  })(e),
                ],
                "<",
                n(e.value),
                ">",
              ]
            : isReactive(e)
            ? [
                "div",
                {},
                ["span", t, isShallow(e) ? "ShallowReactive" : "Reactive"],
                "<",
                n(e),
                ">" + (isReadonly(e) ? " (readonly)" : ""),
              ]
            : isReadonly(e)
            ? [
                "div",
                {},
                ["span", t, isShallow(e) ? "ShallowReadonly" : "Readonly"],
                "<",
                n(e),
                ">",
              ]
            : null
          : null;
      },
      hasBody(e) {
        return e && e.__isVue;
      },
      body(e) {
        if (e && e.__isVue)
          return [
            "div",
            {},
            ...(function (e) {
              const t = [];
              e.type.props && e.props && t.push(r("props", toRaw(e.props)));
              e.setupState !== EMPTY_OBJ && t.push(r("setup", e.setupState));
              e.data !== EMPTY_OBJ && t.push(r("data", toRaw(e.data)));
              var n = o(e, "computed");
              n && t.push(r("computed", n));
              n = o(e, "inject");
              n && t.push(r("injected", n));
              return (
                t.push([
                  "div",
                  {},
                  [
                    "span",
                    { style: a.style + ";opacity:0.66" },
                    "$ (internal): ",
                  ],
                  ["object", { object: e }],
                ]),
                t
              );
            })(e.$),
          ];
      },
    };
    function r(e, t) {
      return (
        (t = extend({}, t)),
        Object.keys(t).length
          ? [
              "div",
              { style: "line-height:1.25em;margin-bottom:0.6em" },
              ["div", { style: "color:#476582" }, e],
              [
                "div",
                { style: "padding-left:1.25em" },
                ...Object.keys(t).map((e) => [
                  "div",
                  {},
                  ["span", a, e + ": "],
                  n(t[e], !1),
                ]),
              ],
            ]
          : ["span", {}]
      );
    }
    function n(e, t = !0) {
      return "number" == typeof e
        ? ["span", s, e]
        : "string" == typeof e
        ? ["span", i, JSON.stringify(e)]
        : "boolean" == typeof e
        ? ["span", a, e]
        : isObject(e)
        ? ["object", { object: t ? toRaw(e) : e }]
        : ["span", i, String(e)];
    }
    function o(e, t) {
      var n = e.type;
      if (!isFunction(n)) {
        const r = {};
        for (const o in e.ctx)
          !(function t(e, n, r) {
            const o = e[r];
            if ((isArray(o) && o.includes(n)) || (isObject(o) && n in o))
              return !0;
            if (e.extends && t(e.extends, n, r)) return !0;
            if (e.mixins && e.mixins.some((e) => t(e, n, r))) return !0;
          })(n, o, t) || (r[o] = e.ctx[o]);
        return r;
      }
    }
    window.devtoolsFormatters
      ? window.devtoolsFormatters.push(e)
      : (window.devtoolsFormatters = [e]);
  }
}
function withMemo(e, t, n, r) {
  var o = n[r];
  if (o && isMemoSame(o, e)) return o;
  const s = t();
  return (s.memo = e.slice()), (n[r] = s);
}
function isMemoSame(e, t) {
  var n = e.memo;
  if (n.length != t.length) return !1;
  for (let e = 0; e < n.length; e++) if (hasChanged(n[e], t[e])) return !1;
  return 0 < isBlockTreeEnabled && currentBlock && currentBlock.push(e), !0;
}
const version = "3.2.45",
  ssrUtils = null,
  resolveFilter = null,
  compatUtils = null,
  svgNS = "http://www.w3.org/2000/svg",
  doc = "undefined" != typeof document ? document : null,
  templateContainer = doc && doc.createElement("template"),
  nodeOps = {
    insert: (e, t, n) => {
      t.insertBefore(e, n || null);
    },
    remove: (e) => {
      const t = e.parentNode;
      t && t.removeChild(e);
    },
    createElement: (e, t, n, r) => {
      const o = t
        ? doc.createElementNS(svgNS, e)
        : doc.createElement(e, n ? { is: n } : void 0);
      return (
        "select" === e &&
          r &&
          null != r.multiple &&
          o.setAttribute("multiple", r.multiple),
        o
      );
    },
    createText: (e) => doc.createTextNode(e),
    createComment: (e) => doc.createComment(e),
    setText: (e, t) => {
      e.nodeValue = t;
    },
    setElementText: (e, t) => {
      e.textContent = t;
    },
    parentNode: (e) => e.parentNode,
    nextSibling: (e) => e.nextSibling,
    querySelector: (e) => doc.querySelector(e),
    setScopeId(e, t) {
      e.setAttribute(t, "");
    },
    insertStaticContent(e, t, n, r, o, s) {
      var i = n ? n.previousSibling : t.lastChild;
      if (o && (o === s || o.nextSibling)) {
        for (;;)
          if (
            (t.insertBefore(o.cloneNode(!0), n),
            o === s || !(o = o.nextSibling))
          )
            break;
      } else {
        templateContainer.innerHTML = r ? `<svg>${e}</svg>` : e;
        const l = templateContainer.content;
        if (r) {
          for (var a = l.firstChild; a.firstChild; )
            l.appendChild(a.firstChild);
          l.removeChild(a);
        }
        t.insertBefore(l, n);
      }
      return [
        i ? i.nextSibling : t.firstChild,
        n ? n.previousSibling : t.lastChild,
      ];
    },
  };
function patchClass(e, t, n) {
  var r = e._vtc;
  null == (t = r ? (t ? [t, ...r] : [...r]).join(" ") : t)
    ? e.removeAttribute("class")
    : n
    ? e.setAttribute("class", t)
    : (e.className = t);
}
function patchStyle(e, t, n) {
  const r = e.style;
  var o = isString(n);
  if (n && !o) {
    for (const i in n) setStyle(r, i, n[i]);
    if (t && !isString(t))
      for (const a in t) null == n[a] && setStyle(r, a, "");
  } else {
    var s = r.display;
    o ? t !== n && (r.cssText = n) : t && e.removeAttribute("style"),
      "_vod" in e && (r.display = s);
  }
}
const semicolonRE = /[^\\];\s*$/,
  importantRE = /\s*!important$/;
function setStyle(t, n, e) {
  var r;
  isArray(e)
    ? e.forEach((e) => setStyle(t, n, e))
    : (null == e && (e = ""),
      semicolonRE.test(e) &&
        warn$1(`Unexpected semicolon at the end of '${n}' style value: '${e}'`),
      n.startsWith("--")
        ? t.setProperty(n, e)
        : ((r = autoPrefix(t, n)),
          importantRE.test(e)
            ? t.setProperty(
                hyphenate(r),
                e.replace(importantRE, ""),
                "important"
              )
            : (t[r] = e)));
}
const prefixes = ["Webkit", "Moz", "ms"],
  prefixCache = {};
function autoPrefix(t, n) {
  var e = prefixCache[n];
  if (e) return e;
  let r = camelize(n);
  if ("filter" !== r && r in t) return (prefixCache[n] = r);
  r = capitalize(r);
  for (let e = 0; e < prefixes.length; e++) {
    var o = prefixes[e] + r;
    if (o in t) return (prefixCache[n] = o);
  }
  return n;
}
const xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(e, t, n, r, o) {
  r && t.startsWith("xlink:")
    ? null == n
      ? e.removeAttributeNS(xlinkNS, t.slice(6, t.length))
      : e.setAttributeNS(xlinkNS, t, n)
    : ((r = isSpecialBooleanAttr(t)),
      null == n || (r && !includeBooleanAttr(n))
        ? e.removeAttribute(t)
        : e.setAttribute(t, r ? "" : n));
}
function patchDOMProp(t, n, r, e, o, s, i) {
  if ("innerHTML" === n || "textContent" === n)
    return e && i(e, o, s), void (t[n] = null == r ? "" : r);
  if ("value" === n && "PROGRESS" !== t.tagName && !t.tagName.includes("-"))
    return (
      (i = null == (t._value = r) ? "" : r),
      (t.value === i && "OPTION" !== t.tagName) || (t.value = i),
      void (null == r && t.removeAttribute(n))
    );
  let a = !1;
  ("" !== r && null != r) ||
    ("boolean" == (e = typeof t[n])
      ? (r = includeBooleanAttr(r))
      : null == r && "string" == e
      ? ((r = ""), (a = !0))
      : "number" == e && ((r = 0), (a = !0)));
  try {
    t[n] = r;
  } catch (e) {
    a ||
      warn$1(
        `Failed setting prop "${n}" on <${t.tagName.toLowerCase()}>: ` +
          `value ${r} is invalid.`,
        e
      );
  }
  a && t.removeAttribute(n);
}
function addEventListener(e, t, n, r) {
  e.addEventListener(t, n, r);
}
function removeEventListener(e, t, n, r) {
  e.removeEventListener(t, n, r);
}
function patchEvent(e, t, n, r, o = null) {
  const s = e._vei || (e._vei = {}),
    i = s[t];
  var a, l;
  r && i
    ? (i.value = r)
    : (([a, l] = parseName(t)),
      r
        ? addEventListener(e, a, (s[t] = createInvoker(r, o)), l)
        : i && (removeEventListener(e, a, i, l), (s[t] = void 0)));
}
const optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(t) {
  let n;
  if (optionsModifierRE.test(t)) {
    n = {};
    let e;
    for (; (e = t.match(optionsModifierRE)); )
      (t = t.slice(0, t.length - e[0].length)), (n[e[0].toLowerCase()] = !0);
  }
  return [":" === t[2] ? t.slice(3) : hyphenate(t.slice(2)), n];
}
let cachedNow = 0;
const p = Promise.resolve(),
  getNow = () =>
    cachedNow || (p.then(() => (cachedNow = 0)), (cachedNow = Date.now()));
function createInvoker(e, t) {
  const n = (e) => {
    if (e._vts) {
      if (e._vts <= n.attached) return;
    } else e._vts = Date.now();
    callWithAsyncErrorHandling(
      patchStopImmediatePropagation(e, n.value),
      t,
      5,
      [e]
    );
  };
  return (n.value = e), (n.attached = getNow()), n;
}
function patchStopImmediatePropagation(e, t) {
  if (isArray(t)) {
    const n = e.stopImmediatePropagation;
    return (
      (e.stopImmediatePropagation = () => {
        n.call(e), (e._stopped = !0);
      }),
      t.map((t) => (e) => !e._stopped && t && t(e))
    );
  }
  return t;
}
const nativeOnRE = /^on[a-z]/,
  patchProp = (e, t, n, r, o = !1, s, i, a, l) => {
    "class" === t
      ? patchClass(e, r, o)
      : "style" === t
      ? patchStyle(e, n, r)
      : isOn(t)
      ? isModelListener(t) || patchEvent(e, t, n, r, i)
      : (
          "." === t[0]
            ? ((t = t.slice(1)), 1)
            : "^" === t[0]
            ? ((t = t.slice(1)), 0)
            : shouldSetAsProp(e, t, r, o)
        )
      ? patchDOMProp(e, t, r, s, i, a, l)
      : ("true-value" === t
          ? (e._trueValue = r)
          : "false-value" === t && (e._falseValue = r),
        patchAttr(e, t, r, o));
  };
function shouldSetAsProp(e, t, n, r) {
  return r
    ? "innerHTML" === t ||
        "textContent" === t ||
        !!(t in e && nativeOnRE.test(t) && isFunction(n))
    : "spellcheck" !== t &&
        "draggable" !== t &&
        "translate" !== t &&
        "form" !== t &&
        ("list" !== t || "INPUT" !== e.tagName) &&
        ("type" !== t || "TEXTAREA" !== e.tagName) &&
        (!nativeOnRE.test(t) || !isString(n)) &&
        t in e;
}
function defineCustomElement(e, t) {
  const n = defineComponent(e);
  class r extends VueElement {
    constructor(e) {
      super(n, e, t);
    }
  }
  return (r.def = n), r;
}
const defineSSRCustomElement = (e) => defineCustomElement(e, hydrate),
  BaseClass = "undefined" != typeof HTMLElement ? HTMLElement : class {};
class VueElement extends BaseClass {
  constructor(e, t = {}, n) {
    super(),
      (this._def = e),
      (this._props = t),
      (this._instance = null),
      (this._connected = !1),
      (this._resolved = !1),
      (this._numberProps = null),
      this.shadowRoot && n
        ? n(this._createVNode(), this.shadowRoot)
        : (this.shadowRoot &&
            warn$1(
              "Custom element has pre-rendered declarative shadow root but is not defined as hydratable. Use `defineSSRCustomElement`."
            ),
          this.attachShadow({ mode: "open" }),
          this._def.__asyncLoader || this._resolveProps(this._def));
  }
  connectedCallback() {
    (this._connected = !0),
      this._instance || (this._resolved ? this._update() : this._resolveDef());
  }
  disconnectedCallback() {
    (this._connected = !1),
      nextTick(() => {
        this._connected ||
          (render(null, this.shadowRoot), (this._instance = null));
      });
  }
  _resolveDef() {
    this._resolved = !0;
    for (let e = 0; e < this.attributes.length; e++)
      this._setAttr(this.attributes[e].name);
    new MutationObserver((e) => {
      for (const t of e) this._setAttr(t.attributeName);
    }).observe(this, { attributes: !0 });
    const t = (e, t = !1) => {
        var { props: n, styles: r } = e;
        let o;
        if (n && !isArray(n))
          for (const i in n) {
            var s = n[i];
            (s === Number || (s && s.type === Number)) &&
              (i in this._props && (this._props[i] = toNumber(this._props[i])),
              ((o = o || Object.create(null))[camelize(i)] = !0));
          }
        (this._numberProps = o),
          t && this._resolveProps(e),
          this._applyStyles(r),
          this._update();
      },
      e = this._def.__asyncLoader;
    e ? e().then((e) => t(e, !0)) : t(this._def);
  }
  _resolveProps(e) {
    e = e.props;
    const t = isArray(e) ? e : Object.keys(e || {});
    for (const n of Object.keys(this))
      "_" !== n[0] && t.includes(n) && this._setProp(n, this[n], !0, !1);
    for (const r of t.map(camelize))
      Object.defineProperty(this, r, {
        get() {
          return this._getProp(r);
        },
        set(e) {
          this._setProp(r, e);
        },
      });
  }
  _setAttr(e) {
    let t = this.getAttribute(e);
    e = camelize(e);
    this._numberProps && this._numberProps[e] && (t = toNumber(t)),
      this._setProp(e, t, !1);
  }
  _getProp(e) {
    return this._props[e];
  }
  _setProp(e, t, n = !0, r = !0) {
    t !== this._props[e] &&
      ((this._props[e] = t),
      r && this._instance && this._update(),
      n &&
        (!0 === t
          ? this.setAttribute(hyphenate(e), "")
          : "string" == typeof t || "number" == typeof t
          ? this.setAttribute(hyphenate(e), t + "")
          : t || this.removeAttribute(hyphenate(e))));
  }
  _update() {
    render(this._createVNode(), this.shadowRoot);
  }
  _createVNode() {
    const e = createVNode(this._def, extend({}, this._props));
    return (
      this._instance ||
        (e.ce = (e) => {
          ((this._instance = e).isCE = !0),
            (e.ceReload = (e) => {
              this._styles &&
                (this._styles.forEach((e) => this.shadowRoot.removeChild(e)),
                (this._styles.length = 0)),
                this._applyStyles(e),
                (this._instance = null),
                this._update();
            });
          const n = (e, t) => {
            this.dispatchEvent(new CustomEvent(e, { detail: t }));
          };
          e.emit = (e, ...t) => {
            n(e, t), hyphenate(e) !== e && n(hyphenate(e), t);
          };
          let t = this;
          for (; (t = t && (t.parentNode || t.host)); )
            if (t instanceof VueElement) {
              (e.parent = t._instance), (e.provides = t._instance.provides);
              break;
            }
        }),
      e
    );
  }
  _applyStyles(e) {
    e &&
      e.forEach((e) => {
        const t = document.createElement("style");
        (t.textContent = e),
          this.shadowRoot.appendChild(t),
          (this._styles || (this._styles = [])).push(t);
      });
  }
}
function useCssModule(e = "$style") {
  var t = getCurrentInstance();
  if (!t)
    return warn$1("useCssModule must be called inside setup()"), EMPTY_OBJ;
  t = t.type.__cssModules;
  if (!t)
    return (
      warn$1("Current instance does not have CSS modules injected."), EMPTY_OBJ
    );
  t = t[e];
  return (
    t ||
    (warn$1(`Current instance does not have CSS module named "${e}".`),
    EMPTY_OBJ)
  );
}
function useCssVars(n) {
  const r = getCurrentInstance();
  if (r) {
    const t = (r.ut = (t = n(r.proxy)) => {
        Array.from(
          document.querySelectorAll(`[data-v-owner="${r.uid}"]`)
        ).forEach((e) => setVarsOnNode(e, t));
      }),
      o = () => {
        var e = n(r.proxy);
        setVarsOnVNode(r.subTree, e), t(e);
      };
    watchPostEffect(o),
      onMounted(() => {
        const e = new MutationObserver(o);
        e.observe(r.subTree.el.parentNode, { childList: !0 }),
          onUnmounted(() => e.disconnect());
      });
  } else
    warn$1("useCssVars is called without current active component instance.");
}
function setVarsOnVNode(n, r) {
  if (128 & n.shapeFlag) {
    const e = n.suspense;
    (n = e.activeBranch),
      e.pendingBranch &&
        !e.isHydrating &&
        e.effects.push(() => {
          setVarsOnVNode(e.activeBranch, r);
        });
  }
  for (; n.component; ) n = n.component.subTree;
  if (1 & n.shapeFlag && n.el) setVarsOnNode(n.el, r);
  else if (n.type === Fragment) n.children.forEach((e) => setVarsOnVNode(e, r));
  else if (n.type === Static) {
    let { el: e, anchor: t } = n;
    for (; e && (setVarsOnNode(e, r), e !== t); ) e = e.nextSibling;
  }
}
function setVarsOnNode(e, t) {
  if (1 === e.nodeType) {
    const n = e.style;
    for (const r in t) n.setProperty("--" + r, t[r]);
  }
}
const TRANSITION = "transition",
  ANIMATION = "animation",
  Transition = (e, { slots: t }) =>
    h(BaseTransition, resolveTransitionProps(e), t),
  DOMTransitionPropsValidators =
    ((Transition.displayName = "Transition"),
    {
      name: String,
      type: String,
      css: { type: Boolean, default: !0 },
      duration: [String, Number, Object],
      enterFromClass: String,
      enterActiveClass: String,
      enterToClass: String,
      appearFromClass: String,
      appearActiveClass: String,
      appearToClass: String,
      leaveFromClass: String,
      leaveActiveClass: String,
      leaveToClass: String,
    }),
  TransitionPropsValidators = (Transition.props = extend(
    {},
    BaseTransition.props,
    DOMTransitionPropsValidators
  )),
  callHook$1 = (e, t = []) => {
    isArray(e) ? e.forEach((e) => e(...t)) : e && e(...t);
  },
  hasExplicitCallback = (e) =>
    !!e && (isArray(e) ? e.some((e) => 1 < e.length) : 1 < e.length);
function resolveTransitionProps(e) {
  const t = {};
  for (const R in e) R in DOMTransitionPropsValidators || (t[R] = e[R]);
  if (!1 === e.css) return t;
  const {
    name: n = "v",
    type: s,
    duration: r,
    enterFromClass: i = n + "-enter-from",
    enterActiveClass: o = n + "-enter-active",
    enterToClass: a = n + "-enter-to",
    appearFromClass: l = i,
    appearActiveClass: c = o,
    appearToClass: p = a,
    leaveFromClass: u = n + "-leave-from",
    leaveActiveClass: d = n + "-leave-active",
    leaveToClass: f = n + "-leave-to",
  } = e;
  var m = normalizeDuration(r);
  const h = m && m[0],
    g = m && m[1],
    {
      onBeforeEnter: v,
      onEnter: y,
      onEnterCancelled: E,
      onLeave: S,
      onLeaveCancelled: C,
      onBeforeAppear: b = v,
      onAppear: T = y,
      onAppearCancelled: _ = E,
    } = t,
    w = (e, t, n) => {
      removeTransitionClass(e, t ? p : a),
        removeTransitionClass(e, t ? c : o),
        n && n();
    },
    x = (e, t) => {
      (e._isLeaving = !1),
        removeTransitionClass(e, u),
        removeTransitionClass(e, f),
        removeTransitionClass(e, d),
        t && t();
    };
  m = (o) => (e, t) => {
    const n = o ? T : y,
      r = () => w(e, o, t);
    callHook$1(n, [e, r]),
      nextFrame(() => {
        removeTransitionClass(e, o ? l : i),
          addTransitionClass(e, o ? p : a),
          hasExplicitCallback(n) || whenTransitionEnds(e, s, h, r);
      });
  };
  return extend(t, {
    onBeforeEnter(e) {
      callHook$1(v, [e]), addTransitionClass(e, i), addTransitionClass(e, o);
    },
    onBeforeAppear(e) {
      callHook$1(b, [e]), addTransitionClass(e, l), addTransitionClass(e, c);
    },
    onEnter: m(!1),
    onAppear: m(!0),
    onLeave(e, t) {
      e._isLeaving = !0;
      const n = () => x(e, t);
      addTransitionClass(e, u),
        forceReflow(),
        addTransitionClass(e, d),
        nextFrame(() => {
          e._isLeaving &&
            (removeTransitionClass(e, u),
            addTransitionClass(e, f),
            hasExplicitCallback(S) || whenTransitionEnds(e, s, g, n));
        }),
        callHook$1(S, [e, n]);
    },
    onEnterCancelled(e) {
      w(e, !1), callHook$1(E, [e]);
    },
    onAppearCancelled(e) {
      w(e, !0), callHook$1(_, [e]);
    },
    onLeaveCancelled(e) {
      x(e), callHook$1(C, [e]);
    },
  });
}
function normalizeDuration(e) {
  return null == e
    ? null
    : isObject(e)
    ? [NumberOf(e.enter), NumberOf(e.leave)]
    : [(e = NumberOf(e)), e];
}
function NumberOf(e) {
  e = toNumber(e);
  return validateDuration(e), e;
}
function validateDuration(e) {
  "number" != typeof e
    ? warn$1(
        "<transition> explicit duration is not a valid number - " +
          `got ${JSON.stringify(e)}.`
      )
    : isNaN(e) &&
      warn$1(
        "<transition> explicit duration is NaN - the duration expression might be incorrect."
      );
}
function addTransitionClass(t, e) {
  e.split(/\s+/).forEach((e) => e && t.classList.add(e)),
    (t._vtc || (t._vtc = new Set())).add(e);
}
function removeTransitionClass(t, e) {
  e.split(/\s+/).forEach((e) => e && t.classList.remove(e));
  const n = t["_vtc"];
  n && (n.delete(e), n.size || (t._vtc = void 0));
}
function nextFrame(e) {
  requestAnimationFrame(() => {
    requestAnimationFrame(e);
  });
}
let endId = 0;
function whenTransitionEnds(t, e, n, r) {
  const o = (t._endId = ++endId),
    s = () => {
      o === t._endId && r();
    };
  if (n) return setTimeout(s, n);
  const { type: i, timeout: a, propCount: l } = getTransitionInfo(t, e);
  if (!i) return r();
  const c = i + "end";
  let p = 0;
  const u = () => {
      t.removeEventListener(c, d), s();
    },
    d = (e) => {
      e.target === t && ++p >= l && u();
    };
  setTimeout(() => {
    p < l && u();
  }, a + 1),
    t.addEventListener(c, d);
}
function getTransitionInfo(e, t) {
  const n = window.getComputedStyle(e);
  var e = (e) => (n[e] || "").split(", "),
    r = e(TRANSITION + "Delay"),
    o = e(TRANSITION + "Duration"),
    r = getTimeout(r, o),
    s = e(ANIMATION + "Delay"),
    i = e(ANIMATION + "Duration"),
    s = getTimeout(s, i);
  let a = null,
    l = 0,
    c = 0;
  t === TRANSITION
    ? 0 < r && ((a = TRANSITION), (l = r), (c = o.length))
    : t === ANIMATION
    ? 0 < s && ((a = ANIMATION), (l = s), (c = i.length))
    : ((l = Math.max(r, s)),
      (a = 0 < l ? (s < r ? TRANSITION : ANIMATION) : null),
      (c = a ? (a === TRANSITION ? o : i).length : 0));
  t =
    a === TRANSITION &&
    /\b(transform|all)(,|$)/.test(e(TRANSITION + "Property").toString());
  return { type: a, timeout: l, propCount: c, hasTransform: t };
}
function getTimeout(n, e) {
  for (; n.length < e.length; ) n = n.concat(n);
  return Math.max(...e.map((e, t) => toMs(e) + toMs(n[t])));
}
function toMs(e) {
  return 1e3 * Number(e.slice(0, -1).replace(",", "."));
}
function forceReflow() {
  return document.body.offsetHeight;
}
const positionMap = new WeakMap(),
  newPositionMap = new WeakMap(),
  TransitionGroupImpl = {
    name: "TransitionGroup",
    props: extend({}, TransitionPropsValidators, {
      tag: String,
      moveClass: String,
    }),
    setup(s, { slots: o }) {
      const i = getCurrentInstance(),
        a = useTransitionState();
      let l, c;
      return (
        onUpdated(() => {
          if (l.length) {
            const o = s.moveClass || `${s.name || "v"}-move`;
            if (hasCSSTransform(l[0].el, i.vnode.el, o)) {
              l.forEach(callPendingCbs), l.forEach(recordPosition);
              const e = l.filter(applyTranslation);
              forceReflow(),
                e.forEach((e) => {
                  const t = e.el,
                    n = t.style,
                    r =
                      (addTransitionClass(t, o),
                      (n.transform =
                        n.webkitTransform =
                        n.transitionDuration =
                          ""),
                      (t._moveCb = (e) => {
                        (e && e.target !== t) ||
                          (e && !/transform$/.test(e.propertyName)) ||
                          (t.removeEventListener("transitionend", r),
                          (t._moveCb = null),
                          removeTransitionClass(t, o));
                      }));
                  t.addEventListener("transitionend", r);
                });
            }
          }
        }),
        () => {
          var e = toRaw(s),
            t = resolveTransitionProps(e),
            e = e.tag || Fragment;
          (l = c), (c = o.default ? getTransitionRawChildren(o.default()) : []);
          for (let e = 0; e < c.length; e++) {
            var n = c[e];
            null != n.key
              ? setTransitionHooks(n, resolveTransitionHooks(n, t, a, i))
              : warn$1("<TransitionGroup> children must be keyed.");
          }
          if (l)
            for (let e = 0; e < l.length; e++) {
              const r = l[e];
              setTransitionHooks(r, resolveTransitionHooks(r, t, a, i)),
                positionMap.set(r, r.el.getBoundingClientRect());
            }
          return createVNode(e, null, c);
        }
      );
    },
  },
  TransitionGroup = TransitionGroupImpl;
function callPendingCbs(e) {
  const t = e.el;
  t._moveCb && t._moveCb(), t._enterCb && t._enterCb();
}
function recordPosition(e) {
  newPositionMap.set(e, e.el.getBoundingClientRect());
}
function applyTranslation(e) {
  var t = positionMap.get(e),
    n = newPositionMap.get(e),
    r = t.left - n.left,
    t = t.top - n.top;
  if (r || t) {
    const o = e.el.style;
    return (
      (o.transform = o.webkitTransform = `translate(${r}px,${t}px)`),
      (o.transitionDuration = "0s"),
      e
    );
  }
}
function hasCSSTransform(e, t, n) {
  const r = e.cloneNode(),
    o =
      (e._vtc &&
        e._vtc.forEach((e) => {
          e.split(/\s+/).forEach((e) => e && r.classList.remove(e));
        }),
      n.split(/\s+/).forEach((e) => e && r.classList.add(e)),
      (r.style.display = "none"),
      1 === t.nodeType ? t : t.parentNode);
  o.appendChild(r);
  e = getTransitionInfo(r).hasTransform;
  return o.removeChild(r), e;
}
const getModelAssigner = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return isArray(t) ? (e) => invokeArrayFns(t, e) : t;
};
function onCompositionStart(e) {
  e.target.composing = !0;
}
function onCompositionEnd(e) {
  const t = e.target;
  t.composing && ((t.composing = !1), t.dispatchEvent(new Event("input")));
}
const vModelText = {
    created(t, { modifiers: { lazy: e, trim: n, number: r } }, o) {
      t._assign = getModelAssigner(o);
      const s = r || (o.props && "number" === o.props.type);
      addEventListener(t, e ? "change" : "input", (e) => {
        if (!e.target.composing) {
          let e = t.value;
          n && (e = e.trim()), s && (e = toNumber(e)), t._assign(e);
        }
      }),
        n &&
          addEventListener(t, "change", () => {
            t.value = t.value.trim();
          }),
        e ||
          (addEventListener(t, "compositionstart", onCompositionStart),
          addEventListener(t, "compositionend", onCompositionEnd),
          addEventListener(t, "change", onCompositionEnd));
    },
    mounted(e, { value: t }) {
      e.value = null == t ? "" : t;
    },
    beforeUpdate(
      e,
      { value: t, modifiers: { lazy: n, trim: r, number: o } },
      s
    ) {
      if (((e._assign = getModelAssigner(s)), !e.composing)) {
        if (document.activeElement === e && "range" !== e.type) {
          if (n) return;
          if (r && e.value.trim() === t) return;
          if ((o || "number" === e.type) && toNumber(e.value) === t) return;
        }
        s = null == t ? "" : t;
        e.value !== s && (e.value = s);
      }
    },
  },
  vModelCheckbox = {
    deep: !0,
    created(l, e, t) {
      (l._assign = getModelAssigner(t)),
        addEventListener(l, "change", () => {
          const e = l._modelValue;
          var t = getValue(l),
            n = l.checked;
          const r = l._assign;
          if (isArray(e)) {
            var o = looseIndexOf(e, t),
              s = -1 !== o;
            if (n && !s) r(e.concat(t));
            else if (!n && s) {
              const i = [...e];
              i.splice(o, 1), r(i);
            }
          } else if (isSet(e)) {
            const a = new Set(e);
            n ? a.add(t) : a.delete(t), r(a);
          } else r(getCheckboxValue(l, n));
        });
    },
    mounted: setChecked,
    beforeUpdate(e, t, n) {
      (e._assign = getModelAssigner(n)), setChecked(e, t, n);
    },
  };
function setChecked(e, { value: t, oldValue: n }, r) {
  (e._modelValue = t),
    isArray(t)
      ? (e.checked = -1 < looseIndexOf(t, r.props.value))
      : isSet(t)
      ? (e.checked = t.has(r.props.value))
      : t !== n && (e.checked = looseEqual(t, getCheckboxValue(e, !0)));
}
const vModelRadio = {
    created(e, { value: t }, n) {
      (e.checked = looseEqual(t, n.props.value)),
        (e._assign = getModelAssigner(n)),
        addEventListener(e, "change", () => {
          e._assign(getValue(e));
        });
    },
    beforeUpdate(e, { value: t, oldValue: n }, r) {
      (e._assign = getModelAssigner(r)),
        t !== n && (e.checked = looseEqual(t, r.props.value));
    },
  },
  vModelSelect = {
    deep: !0,
    created(t, { value: e, modifiers: { number: n } }, r) {
      const o = isSet(e);
      addEventListener(t, "change", () => {
        var e = Array.prototype.filter
          .call(t.options, (e) => e.selected)
          .map((e) => (n ? toNumber(getValue(e)) : getValue(e)));
        t._assign(t.multiple ? (o ? new Set(e) : e) : e[0]);
      }),
        (t._assign = getModelAssigner(r));
    },
    mounted(e, { value: t }) {
      setSelected(e, t);
    },
    beforeUpdate(e, t, n) {
      e._assign = getModelAssigner(n);
    },
    updated(e, { value: t }) {
      setSelected(e, t);
    },
  };
function setSelected(n, r) {
  var o = n.multiple;
  if (!o || isArray(r) || isSet(r)) {
    for (let e = 0, t = n.options.length; e < t; e++) {
      const i = n.options[e];
      var s = getValue(i);
      if (o)
        isArray(r)
          ? (i.selected = -1 < looseIndexOf(r, s))
          : (i.selected = r.has(s));
      else if (looseEqual(getValue(i), r))
        return void (n.selectedIndex !== e && (n.selectedIndex = e));
    }
    o || -1 === n.selectedIndex || (n.selectedIndex = -1);
  } else
    warn$1(
      "<select multiple v-model> expects an Array or Set value for its binding, " +
        `but got ${Object.prototype.toString.call(r).slice(8, -1)}.`
    );
}
function getValue(e) {
  return "_value" in e ? e._value : e.value;
}
function getCheckboxValue(e, t) {
  var n = t ? "_trueValue" : "_falseValue";
  return n in e ? e[n] : t;
}
const vModelDynamic = {
  created(e, t, n) {
    callModelHook(e, t, n, null, "created");
  },
  mounted(e, t, n) {
    callModelHook(e, t, n, null, "mounted");
  },
  beforeUpdate(e, t, n, r) {
    callModelHook(e, t, n, r, "beforeUpdate");
  },
  updated(e, t, n, r) {
    callModelHook(e, t, n, r, "updated");
  },
};
function resolveDynamicModel(e, t) {
  switch (e) {
    case "SELECT":
      return vModelSelect;
    case "TEXTAREA":
      return vModelText;
    default:
      switch (t) {
        case "checkbox":
          return vModelCheckbox;
        case "radio":
          return vModelRadio;
        default:
          return vModelText;
      }
  }
}
function callModelHook(e, t, n, r, o) {
  const s = resolveDynamicModel(e.tagName, n.props && n.props.type)[o];
  s && s(e, t, n, r);
}
const systemModifiers = ["ctrl", "shift", "alt", "meta"],
  modifierGuards = {
    stop: (e) => e.stopPropagation(),
    prevent: (e) => e.preventDefault(),
    self: (e) => e.target !== e.currentTarget,
    ctrl: (e) => !e.ctrlKey,
    shift: (e) => !e.shiftKey,
    alt: (e) => !e.altKey,
    meta: (e) => !e.metaKey,
    left: (e) => "button" in e && 0 !== e.button,
    middle: (e) => "button" in e && 1 !== e.button,
    right: (e) => "button" in e && 2 !== e.button,
    exact: (t, n) =>
      systemModifiers.some((e) => t[e + "Key"] && !n.includes(e)),
  },
  withModifiers =
    (r, o) =>
    (t, ...e) => {
      for (let e = 0; e < o.length; e++) {
        const n = modifierGuards[o[e]];
        if (n && n(t, o)) return;
      }
      return r(t, ...e);
    },
  keyNames = {
    esc: "escape",
    space: " ",
    up: "arrow-up",
    left: "arrow-left",
    right: "arrow-right",
    down: "arrow-down",
    delete: "backspace",
  },
  withKeys = (n, r) => (e) => {
    if ("key" in e) {
      const t = hyphenate(e.key);
      return r.some((e) => e === t || keyNames[e] === t) ? n(e) : void 0;
    }
  },
  vShow = {
    beforeMount(e, { value: t }, { transition: n }) {
      (e._vod = "none" === e.style.display ? "" : e.style.display),
        n && t ? n.beforeEnter(e) : setDisplay(e, t);
    },
    mounted(e, { value: t }, { transition: n }) {
      n && t && n.enter(e);
    },
    updated(e, { value: t, oldValue: n }, { transition: r }) {
      !t != !n &&
        (r
          ? t
            ? (r.beforeEnter(e), setDisplay(e, !0), r.enter(e))
            : r.leave(e, () => {
                setDisplay(e, !1);
              })
          : setDisplay(e, t));
    },
    beforeUnmount(e, { value: t }) {
      setDisplay(e, t);
    },
  };
function setDisplay(e, t) {
  e.style.display = t ? e._vod : "none";
}
const rendererOptions = extend({ patchProp: patchProp }, nodeOps);
let renderer,
  enabledHydration = !1;
function ensureRenderer() {
  return (renderer = renderer || createRenderer(rendererOptions));
}
function ensureHydrationRenderer() {
  return (
    (renderer = enabledHydration
      ? renderer
      : createHydrationRenderer(rendererOptions)),
    (enabledHydration = !0),
    renderer
  );
}
const render = (...e) => {
    ensureRenderer().render(...e);
  },
  hydrate = (...e) => {
    ensureHydrationRenderer().hydrate(...e);
  },
  createApp = (...e) => {
    const r = ensureRenderer().createApp(...e),
      o = (injectNativeTagCheck(r), injectCompilerOptionsCheck(r), r)["mount"];
    return (
      (r.mount = (e) => {
        const t = normalizeContainer(e);
        if (t) {
          const n = r._component;
          isFunction(n) || n.render || n.template || (n.template = t.innerHTML),
            (t.innerHTML = "");
          e = o(t, !1, t instanceof SVGElement);
          return (
            t instanceof Element &&
              (t.removeAttribute("v-cloak"), t.setAttribute("data-v-app", "")),
            e
          );
        }
      }),
      r
    );
  },
  createSSRApp = (...e) => {
    const t = ensureHydrationRenderer().createApp(...e),
      n = (injectNativeTagCheck(t), injectCompilerOptionsCheck(t), t)["mount"];
    return (
      (t.mount = (e) => {
        e = normalizeContainer(e);
        if (e) return n(e, !0, e instanceof SVGElement);
      }),
      t
    );
  };
function injectNativeTagCheck(e) {
  Object.defineProperty(e.config, "isNativeTag", {
    value: (e) => isHTMLTag(e) || isSVGTag(e),
    writable: !1,
  });
}
function injectCompilerOptionsCheck(e) {
  if (isRuntimeOnly()) {
    const t = e.config.isCustomElement,
      n =
        (Object.defineProperty(e.config, "isCustomElement", {
          get() {
            return t;
          },
          set() {
            warn$1(
              "The `isCustomElement` config option is deprecated. Use `compilerOptions.isCustomElement` instead."
            );
          },
        }),
        e.config.compilerOptions),
      r =
        'The `compilerOptions` config option is only respected when using a build of Vue.js that includes the runtime compiler (aka "full build"). Since you are using the runtime-only build, `compilerOptions` must be passed to `@vue/compiler-dom` in the build setup instead.\n- For vue-loader: pass it via vue-loader\'s `compilerOptions` loader option.\n- For vue-cli: see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader\n- For vite: pass it via @vitejs/plugin-vue options. See https://github.com/vitejs/vite/tree/main/packages/plugin-vue#example-for-passing-options-to-vuecompiler-dom';
    Object.defineProperty(e.config, "compilerOptions", {
      get() {
        return warn$1(r), n;
      },
      set() {
        warn$1(r);
      },
    });
  }
}
function normalizeContainer(e) {
  var t;
  return isString(e)
    ? ((t = document.querySelector(e)) ||
        warn$1(
          `Failed to mount app: mount target selector "${e}" returned null.`
        ),
      t)
    : (window.ShadowRoot &&
        e instanceof window.ShadowRoot &&
        "closed" === e.mode &&
        warn$1(
          'mounting on a ShadowRoot with `{mode: "closed"}` may lead to unpredictable bugs'
        ),
      e);
}
const initDirectivesForSSR = NOOP;
var runtimeDom = Object.freeze({
  __proto__: null,
  render: render,
  hydrate: hydrate,
  createApp: createApp,
  createSSRApp: createSSRApp,
  initDirectivesForSSR: initDirectivesForSSR,
  defineCustomElement: defineCustomElement,
  defineSSRCustomElement: defineSSRCustomElement,
  VueElement: VueElement,
  useCssModule: useCssModule,
  useCssVars: useCssVars,
  Transition: Transition,
  TransitionGroup: TransitionGroup,
  vModelText: vModelText,
  vModelCheckbox: vModelCheckbox,
  vModelRadio: vModelRadio,
  vModelSelect: vModelSelect,
  vModelDynamic: vModelDynamic,
  withModifiers: withModifiers,
  withKeys: withKeys,
  vShow: vShow,
  reactive: reactive,
  ref: ref,
  readonly: readonly,
  unref: unref,
  proxyRefs: proxyRefs,
  isRef: isRef,
  toRef: toRef,
  toRefs: toRefs,
  isProxy: isProxy,
  isReactive: isReactive,
  isReadonly: isReadonly,
  isShallow: isShallow,
  customRef: customRef,
  triggerRef: triggerRef,
  shallowRef: shallowRef,
  shallowReactive: shallowReactive,
  shallowReadonly: shallowReadonly,
  markRaw: markRaw,
  toRaw: toRaw,
  effect: effect,
  stop: stop,
  ReactiveEffect: ReactiveEffect,
  effectScope: effectScope,
  EffectScope: EffectScope,
  getCurrentScope: getCurrentScope,
  onScopeDispose: onScopeDispose,
  computed: computed$1,
  watch: watch,
  watchEffect: watchEffect,
  watchPostEffect: watchPostEffect,
  watchSyncEffect: watchSyncEffect,
  onBeforeMount: onBeforeMount,
  onMounted: onMounted,
  onBeforeUpdate: onBeforeUpdate,
  onUpdated: onUpdated,
  onBeforeUnmount: onBeforeUnmount,
  onUnmounted: onUnmounted,
  onActivated: onActivated,
  onDeactivated: onDeactivated,
  onRenderTracked: onRenderTracked,
  onRenderTriggered: onRenderTriggered,
  onErrorCaptured: onErrorCaptured,
  onServerPrefetch: onServerPrefetch,
  provide: provide,
  inject: inject,
  nextTick: nextTick,
  defineComponent: defineComponent,
  defineAsyncComponent: defineAsyncComponent,
  useAttrs: useAttrs,
  useSlots: useSlots,
  defineProps: defineProps,
  defineEmits: defineEmits,
  defineExpose: defineExpose,
  withDefaults: withDefaults,
  mergeDefaults: mergeDefaults,
  createPropsRestProxy: createPropsRestProxy,
  withAsyncContext: withAsyncContext,
  getCurrentInstance: getCurrentInstance,
  h: h,
  createVNode: createVNode,
  cloneVNode: cloneVNode,
  mergeProps: mergeProps,
  isVNode: isVNode,
  Fragment: Fragment,
  Text: Text,
  Comment: Comment,
  Static: Static,
  Teleport: Teleport,
  Suspense: Suspense,
  KeepAlive: KeepAlive,
  BaseTransition: BaseTransition,
  withDirectives: withDirectives,
  useSSRContext: useSSRContext,
  ssrContextKey: ssrContextKey,
  createRenderer: createRenderer,
  createHydrationRenderer: createHydrationRenderer,
  queuePostFlushCb: queuePostFlushCb,
  warn: warn$1,
  handleError: handleError,
  callWithErrorHandling: callWithErrorHandling,
  callWithAsyncErrorHandling: callWithAsyncErrorHandling,
  resolveComponent: resolveComponent,
  resolveDirective: resolveDirective,
  resolveDynamicComponent: resolveDynamicComponent,
  registerRuntimeCompiler: registerRuntimeCompiler,
  isRuntimeOnly: isRuntimeOnly,
  useTransitionState: useTransitionState,
  resolveTransitionHooks: resolveTransitionHooks,
  setTransitionHooks: setTransitionHooks,
  getTransitionRawChildren: getTransitionRawChildren,
  initCustomFormatter: initCustomFormatter,
  get devtools() {
    return devtools;
  },
  setDevtoolsHook: setDevtoolsHook,
  withCtx: withCtx,
  pushScopeId: pushScopeId,
  popScopeId: popScopeId,
  withScopeId: withScopeId,
  renderList: renderList,
  toHandlers: toHandlers,
  renderSlot: renderSlot,
  createSlots: createSlots,
  withMemo: withMemo,
  isMemoSame: isMemoSame,
  openBlock: openBlock,
  createBlock: createBlock,
  setBlockTracking: setBlockTracking,
  createTextVNode: createTextVNode,
  createCommentVNode: createCommentVNode,
  createStaticVNode: createStaticVNode,
  createElementVNode: createBaseVNode,
  createElementBlock: createElementBlock,
  guardReactiveProps: guardReactiveProps,
  toDisplayString: toDisplayString,
  camelize: camelize,
  capitalize: capitalize,
  toHandlerKey: toHandlerKey,
  normalizeProps: normalizeProps,
  normalizeClass: normalizeClass,
  normalizeStyle: normalizeStyle,
  transformVNodeArgs: transformVNodeArgs,
  version: version,
  ssrUtils: ssrUtils,
  resolveFilter: resolveFilter,
  compatUtils: compatUtils,
});
function initDev() {
  console.info(
    "You are running a development build of Vue.\nMake sure to use the production build (*.prod.js) when deploying for production."
  ),
    initCustomFormatter();
}
function defaultOnError(e) {
  throw e;
}
function defaultOnWarn(e) {
  console.warn("[Vue warn] " + e.message);
}
function createCompilerError(e, t, n, r) {
  n = (n || errorMessages)[e] + (r || "");
  const o = new SyntaxError(String(n));
  return (o.code = e), (o.loc = t), o;
}
const errorMessages = {
    [0]: "Illegal comment.",
    1: "CDATA section is allowed only in XML context.",
    2: "Duplicate attribute.",
    3: "End tag cannot have attributes.",
    4: "Illegal '/' in tags.",
    5: "Unexpected EOF in tag.",
    6: "Unexpected EOF in CDATA section.",
    7: "Unexpected EOF in comment.",
    8: "Unexpected EOF in script.",
    9: "Unexpected EOF in tag.",
    10: "Incorrectly closed comment.",
    11: "Incorrectly opened comment.",
    12: "Illegal tag name. Use '&lt;' to print '<'.",
    13: "Attribute value was expected.",
    14: "End tag name was expected.",
    15: "Whitespace was expected.",
    16: "Unexpected '\x3c!--' in comment.",
    17: "Attribute name cannot contain U+0022 (\"), U+0027 ('), and U+003C (<).",
    18: "Unquoted attribute value cannot contain U+0022 (\"), U+0027 ('), U+003C (<), U+003D (=), and U+0060 (`).",
    19: "Attribute name cannot start with '='.",
    21: "'<?' is allowed only in XML context.",
    20: "Unexpected null character.",
    22: "Illegal '/' in tags.",
    23: "Invalid end tag.",
    24: "Element is missing end tag.",
    25: "Interpolation end sign was not found.",
    27: "End bracket for dynamic directive argument was not found. Note that dynamic directive argument cannot contain spaces.",
    26: "Legal directive name was expected.",
    28: "v-if/v-else-if is missing expression.",
    29: "v-if/else branches must use unique keys.",
    30: "v-else/v-else-if has no adjacent v-if or v-else-if.",
    31: "v-for is missing expression.",
    32: "v-for has invalid expression.",
    33: "<template v-for> key should be placed on the <template> tag.",
    34: "v-bind is missing expression.",
    35: "v-on is missing expression.",
    36: "Unexpected custom directive on <slot> outlet.",
    37: "Mixed v-slot usage on both the component and nested <template>.When there are multiple named slots, all slots should use <template> syntax to avoid scope ambiguity.",
    38: "Duplicate slot names found. ",
    39: "Extraneous children found when component already has explicitly named default slot. These children will be ignored.",
    40: "v-slot can only be used on components or <template> tags.",
    41: "v-model is missing expression.",
    42: "v-model value must be a valid JavaScript member expression.",
    43: "v-model cannot be used on v-for or v-slot scope variables because they are not writable.",
    44: `v-model cannot be used on a prop, because local prop bindings are not writable.
Use a v-bind binding combined with a v-on listener that emits update:x event instead.`,
    45: "Error parsing JavaScript expression: ",
    46: "<KeepAlive> expects exactly one child component.",
    47: '"prefixIdentifiers" option is not supported in this build of compiler.',
    48: "ES module mode is not supported in this build of compiler.",
    49: '"cacheHandlers" option is only supported when the "prefixIdentifiers" option is enabled.',
    50: '"scopeId" option is only supported in module mode.',
    51: "",
  },
  FRAGMENT = Symbol("Fragment"),
  TELEPORT = Symbol("Teleport"),
  SUSPENSE = Symbol("Suspense"),
  KEEP_ALIVE = Symbol("KeepAlive"),
  BASE_TRANSITION = Symbol("BaseTransition"),
  OPEN_BLOCK = Symbol("openBlock"),
  CREATE_BLOCK = Symbol("createBlock"),
  CREATE_ELEMENT_BLOCK = Symbol("createElementBlock"),
  CREATE_VNODE = Symbol("createVNode"),
  CREATE_ELEMENT_VNODE = Symbol("createElementVNode"),
  CREATE_COMMENT = Symbol("createCommentVNode"),
  CREATE_TEXT = Symbol("createTextVNode"),
  CREATE_STATIC = Symbol("createStaticVNode"),
  RESOLVE_COMPONENT = Symbol("resolveComponent"),
  RESOLVE_DYNAMIC_COMPONENT = Symbol("resolveDynamicComponent"),
  RESOLVE_DIRECTIVE = Symbol("resolveDirective"),
  RESOLVE_FILTER = Symbol("resolveFilter"),
  WITH_DIRECTIVES = Symbol("withDirectives"),
  RENDER_LIST = Symbol("renderList"),
  RENDER_SLOT = Symbol("renderSlot"),
  CREATE_SLOTS = Symbol("createSlots"),
  TO_DISPLAY_STRING = Symbol("toDisplayString"),
  MERGE_PROPS = Symbol("mergeProps"),
  NORMALIZE_CLASS = Symbol("normalizeClass"),
  NORMALIZE_STYLE = Symbol("normalizeStyle"),
  NORMALIZE_PROPS = Symbol("normalizeProps"),
  GUARD_REACTIVE_PROPS = Symbol("guardReactiveProps"),
  TO_HANDLERS = Symbol("toHandlers"),
  CAMELIZE = Symbol("camelize"),
  CAPITALIZE = Symbol("capitalize"),
  TO_HANDLER_KEY = Symbol("toHandlerKey"),
  SET_BLOCK_TRACKING = Symbol("setBlockTracking"),
  PUSH_SCOPE_ID = Symbol("pushScopeId"),
  POP_SCOPE_ID = Symbol("popScopeId"),
  WITH_CTX = Symbol("withCtx"),
  UNREF = Symbol("unref"),
  IS_REF = Symbol("isRef"),
  WITH_MEMO = Symbol("withMemo"),
  IS_MEMO_SAME = Symbol("isMemoSame"),
  helperNameMap = {
    [FRAGMENT]: "Fragment",
    [TELEPORT]: "Teleport",
    [SUSPENSE]: "Suspense",
    [KEEP_ALIVE]: "KeepAlive",
    [BASE_TRANSITION]: "BaseTransition",
    [OPEN_BLOCK]: "openBlock",
    [CREATE_BLOCK]: "createBlock",
    [CREATE_ELEMENT_BLOCK]: "createElementBlock",
    [CREATE_VNODE]: "createVNode",
    [CREATE_ELEMENT_VNODE]: "createElementVNode",
    [CREATE_COMMENT]: "createCommentVNode",
    [CREATE_TEXT]: "createTextVNode",
    [CREATE_STATIC]: "createStaticVNode",
    [RESOLVE_COMPONENT]: "resolveComponent",
    [RESOLVE_DYNAMIC_COMPONENT]: "resolveDynamicComponent",
    [RESOLVE_DIRECTIVE]: "resolveDirective",
    [RESOLVE_FILTER]: "resolveFilter",
    [WITH_DIRECTIVES]: "withDirectives",
    [RENDER_LIST]: "renderList",
    [RENDER_SLOT]: "renderSlot",
    [CREATE_SLOTS]: "createSlots",
    [TO_DISPLAY_STRING]: "toDisplayString",
    [MERGE_PROPS]: "mergeProps",
    [NORMALIZE_CLASS]: "normalizeClass",
    [NORMALIZE_STYLE]: "normalizeStyle",
    [NORMALIZE_PROPS]: "normalizeProps",
    [GUARD_REACTIVE_PROPS]: "guardReactiveProps",
    [TO_HANDLERS]: "toHandlers",
    [CAMELIZE]: "camelize",
    [CAPITALIZE]: "capitalize",
    [TO_HANDLER_KEY]: "toHandlerKey",
    [SET_BLOCK_TRACKING]: "setBlockTracking",
    [PUSH_SCOPE_ID]: "pushScopeId",
    [POP_SCOPE_ID]: "popScopeId",
    [WITH_CTX]: "withCtx",
    [UNREF]: "unref",
    [IS_REF]: "isRef",
    [WITH_MEMO]: "withMemo",
    [IS_MEMO_SAME]: "isMemoSame",
  };
function registerRuntimeHelpers(t) {
  Object.getOwnPropertySymbols(t).forEach((e) => {
    helperNameMap[e] = t[e];
  });
}
const locStub = {
  source: "",
  start: { line: 1, column: 1, offset: 0 },
  end: { line: 1, column: 1, offset: 0 },
};
function createRoot(e, t = locStub) {
  return {
    type: 0,
    children: e,
    helpers: [],
    components: [],
    directives: [],
    hoists: [],
    imports: [],
    cached: 0,
    temps: 0,
    codegenNode: void 0,
    loc: t,
  };
}
function createVNodeCall(
  e,
  t,
  n,
  r,
  o,
  s,
  i,
  a = !1,
  l = !1,
  c = !1,
  p = locStub
) {
  return (
    e &&
      (a
        ? (e.helper(OPEN_BLOCK), e.helper(getVNodeBlockHelper(e.inSSR, c)))
        : e.helper(getVNodeHelper(e.inSSR, c)),
      i && e.helper(WITH_DIRECTIVES)),
    {
      type: 13,
      tag: t,
      props: n,
      children: r,
      patchFlag: o,
      dynamicProps: s,
      directives: i,
      isBlock: a,
      disableTracking: l,
      isComponent: c,
      loc: p,
    }
  );
}
function createArrayExpression(e, t = locStub) {
  return { type: 17, loc: t, elements: e };
}
function createObjectExpression(e, t = locStub) {
  return { type: 15, loc: t, properties: e };
}
function createObjectProperty(e, t) {
  return {
    type: 16,
    loc: locStub,
    key: isString(e) ? createSimpleExpression(e, !0) : e,
    value: t,
  };
}
function createSimpleExpression(e, t = !1, n = locStub, r = 0) {
  return { type: 4, loc: n, content: e, isStatic: t, constType: t ? 3 : r };
}
function createCompoundExpression(e, t = locStub) {
  return { type: 8, loc: t, children: e };
}
function createCallExpression(e, t = [], n = locStub) {
  return { type: 14, loc: n, callee: e, arguments: t };
}
function createFunctionExpression(e, t = void 0, n = !1, r = !1, o = locStub) {
  return { type: 18, params: e, returns: t, newline: n, isSlot: r, loc: o };
}
function createConditionalExpression(e, t, n, r = !0) {
  return {
    type: 19,
    test: e,
    consequent: t,
    alternate: n,
    newline: r,
    loc: locStub,
  };
}
function createCacheExpression(e, t, n = !1) {
  return { type: 20, index: e, value: t, isVNode: n, loc: locStub };
}
function createBlockStatement(e) {
  return { type: 21, body: e, loc: locStub };
}
const isStaticExp = (e) => 4 === e.type && e.isStatic,
  isBuiltInType = (e, t) => e === t || e === hyphenate(t);
function isCoreComponent(e) {
  return isBuiltInType(e, "Teleport")
    ? TELEPORT
    : isBuiltInType(e, "Suspense")
    ? SUSPENSE
    : isBuiltInType(e, "KeepAlive")
    ? KEEP_ALIVE
    : isBuiltInType(e, "BaseTransition")
    ? BASE_TRANSITION
    : void 0;
}
const nonIdentifierRE = /^\d|[^\$\w]/,
  isSimpleIdentifier = (e) => !nonIdentifierRE.test(e),
  validFirstIdentCharRE = /[A-Za-z_$\xA0-\uFFFF]/,
  validIdentCharRE = /[\.\?\w$\xA0-\uFFFF]/,
  whitespaceRE = /\s+[.[]\s*|\s*[.[]\s+/g,
  isMemberExpressionBrowser = (t) => {
    t = t.trim().replace(whitespaceRE, (e) => e.trim());
    let n = 0,
      r = [],
      o = 0,
      s = 0,
      i = null;
    for (let e = 0; e < t.length; e++) {
      var a = t.charAt(e);
      switch (n) {
        case 0:
          if ("[" === a) r.push(n), (n = 1), o++;
          else if ("(" === a) r.push(n), (n = 2), s++;
          else if (
            !(0 === e ? validFirstIdentCharRE : validIdentCharRE).test(a)
          )
            return !1;
          break;
        case 1:
          "'" === a || '"' === a || "`" === a
            ? (r.push(n), (n = 3), (i = a))
            : "[" === a
            ? o++
            : "]" !== a || --o || (n = r.pop());
          break;
        case 2:
          if ("'" === a || '"' === a || "`" === a) r.push(n), (n = 3), (i = a);
          else if ("(" === a) s++;
          else if (")" === a) {
            if (e === t.length - 1) return !1;
            --s || (n = r.pop());
          }
          break;
        case 3:
          a === i && ((n = r.pop()), (i = null));
      }
    }
    return !o && !s;
  },
  isMemberExpression = isMemberExpressionBrowser;
function getInnerRange(e, t, n) {
  const r = {
    source: e.source.slice(t, t + n),
    start: advancePositionWithClone(e.start, e.source, t),
    end: e.end,
  };
  return (
    null != n && (r.end = advancePositionWithClone(e.start, e.source, t + n)), r
  );
}
function advancePositionWithClone(e, t, n = t.length) {
  return advancePositionWithMutation(extend({}, e), t, n);
}
function advancePositionWithMutation(e, t, n = t.length) {
  let r = 0,
    o = -1;
  for (let e = 0; e < n; e++) 10 === t.charCodeAt(e) && (r++, (o = e));
  return (
    (e.offset += n),
    (e.line += r),
    (e.column = -1 === o ? e.column + n : n - o),
    e
  );
}
function assert(e, t) {
  if (!e) throw new Error(t || "unexpected compiler condition");
}
function findDir(t, n, r = !1) {
  for (let e = 0; e < t.props.length; e++) {
    var o = t.props[e];
    if (
      7 === o.type &&
      (r || o.exp) &&
      (isString(n) ? o.name === n : n.test(o.name))
    )
      return o;
  }
}
function findProp(t, n, r = !1, o = !1) {
  for (let e = 0; e < t.props.length; e++) {
    var s = t.props[e];
    if (6 === s.type) {
      if (!r && s.name === n && (s.value || o)) return s;
    } else if ("bind" === s.name && (s.exp || o) && isStaticArgOf(s.arg, n))
      return s;
  }
}
function isStaticArgOf(e, t) {
  return !(!e || !isStaticExp(e) || e.content !== t);
}
function hasDynamicKeyVBind(e) {
  return e.props.some(
    (e) =>
      !(
        7 !== e.type ||
        "bind" !== e.name ||
        (e.arg && 4 === e.arg.type && e.arg.isStatic)
      )
  );
}
function isText(e) {
  return 5 === e.type || 2 === e.type;
}
function isVSlot(e) {
  return 7 === e.type && "slot" === e.name;
}
function isTemplateNode(e) {
  return 1 === e.type && 3 === e.tagType;
}
function isSlotOutlet(e) {
  return 1 === e.type && 2 === e.tagType;
}
function getVNodeHelper(e, t) {
  return e || t ? CREATE_VNODE : CREATE_ELEMENT_VNODE;
}
function getVNodeBlockHelper(e, t) {
  return e || t ? CREATE_BLOCK : CREATE_ELEMENT_BLOCK;
}
const propsHelperSet = new Set([NORMALIZE_PROPS, GUARD_REACTIVE_PROPS]);
function getUnnormalizedProps(e, t = []) {
  if (e && !isString(e) && 14 === e.type) {
    var n = e.callee;
    if (!isString(n) && propsHelperSet.has(n))
      return getUnnormalizedProps(e.arguments[0], t.concat(e));
  }
  return [e, t];
}
function injectProp(e, t, n) {
  let r,
    o = 13 === e.type ? e.props : e.arguments[2],
    s = [],
    i;
  var a;
  if (
    (o &&
      !isString(o) &&
      14 === o.type &&
      ((a = getUnnormalizedProps(o)),
      (o = a[0]),
      (s = a[1]),
      (i = s[s.length - 1])),
    null == o || isString(o))
  )
    r = createObjectExpression([t]);
  else if (14 === o.type) {
    const l = o.arguments[0];
    isString(l) || 15 !== l.type
      ? o.callee === TO_HANDLERS
        ? (r = createCallExpression(n.helper(MERGE_PROPS), [
            createObjectExpression([t]),
            o,
          ]))
        : o.arguments.unshift(createObjectExpression([t]))
      : hasProp(t, l) || l.properties.unshift(t),
      (r = r || o);
  } else
    15 === o.type
      ? (hasProp(t, o) || o.properties.unshift(t), (r = o))
      : ((r = createCallExpression(n.helper(MERGE_PROPS), [
          createObjectExpression([t]),
          o,
        ])),
        i && i.callee === GUARD_REACTIVE_PROPS && (i = s[s.length - 2]));
  13 === e.type
    ? i
      ? (i.arguments[0] = r)
      : (e.props = r)
    : i
    ? (i.arguments[0] = r)
    : (e.arguments[2] = r);
}
function hasProp(e, t) {
  let n = !1;
  if (4 === e.key.type) {
    const r = e.key.content;
    n = t.properties.some((e) => 4 === e.key.type && e.key.content === r);
  }
  return n;
}
function toValidAssetId(n, e) {
  return (
    `_${e}_` +
    n.replace(/[^\w]/g, (e, t) =>
      "-" === e ? "_" : n.charCodeAt(t).toString()
    )
  );
}
function getMemoedVNodeCall(e) {
  return 14 === e.type && e.callee === WITH_MEMO ? e.arguments[1].returns : e;
}
function makeBlock(e, { helper: t, removeHelper: n, inSSR: r }) {
  e.isBlock ||
    ((e.isBlock = !0),
    n(getVNodeHelper(r, e.isComponent)),
    t(OPEN_BLOCK),
    t(getVNodeBlockHelper(r, e.isComponent)));
}
const deprecationData = {
  COMPILER_IS_ON_ELEMENT: {
    message:
      'Platform-native elements with "is" prop will no longer be treated as components in Vue 3 unless the "is" value is explicitly prefixed with "vue:".',
    link: "https://v3-migration.vuejs.org/breaking-changes/custom-elements-interop.html",
  },
  COMPILER_V_BIND_SYNC: {
    message: (e) =>
      ".sync modifier for v-bind has been removed. Use v-model with " +
      `argument instead. \`v-bind:${e}.sync\` should be changed to ` +
      `\`v-model:${e}\`.`,
    link: "https://v3-migration.vuejs.org/breaking-changes/v-model.html",
  },
  COMPILER_V_BIND_PROP: {
    message:
      ".prop modifier for v-bind has been removed and no longer necessary. Vue 3 will automatically set a binding as DOM property when appropriate.",
  },
  COMPILER_V_BIND_OBJECT_ORDER: {
    message:
      'v-bind="obj" usage is now order sensitive and behaves like JavaScript object spread: it will now overwrite an existing non-mergeable attribute that appears before v-bind in the case of conflict. To retain 2.x behavior, move v-bind to make it the first attribute. You can also suppress this warning if the usage is intended.',
    link: "https://v3-migration.vuejs.org/breaking-changes/v-bind.html",
  },
  COMPILER_V_ON_NATIVE: {
    message:
      ".native modifier for v-on has been removed as is no longer necessary.",
    link: "https://v3-migration.vuejs.org/breaking-changes/v-on-native-modifier-removed.html",
  },
  COMPILER_V_IF_V_FOR_PRECEDENCE: {
    message:
      "v-if / v-for precedence when used on the same element has changed in Vue 3: v-if now takes higher precedence and will no longer have access to v-for scope variables. It is best to avoid the ambiguity with <template> tags or use a computed property that filters v-for data source.",
    link: "https://v3-migration.vuejs.org/breaking-changes/v-if-v-for.html",
  },
  COMPILER_NATIVE_TEMPLATE: {
    message:
      "<template> with no special directives will render as a native template element instead of its inner content in Vue 3.",
  },
  COMPILER_INLINE_TEMPLATE: {
    message: '"inline-template" has been removed in Vue 3.',
    link: "https://v3-migration.vuejs.org/breaking-changes/inline-template-attribute.html",
  },
  COMPILER_FILTER: {
    message:
      'filters have been removed in Vue 3. The "|" symbol will be treated as native JavaScript bitwise OR operator. Use method calls or computed properties instead.',
    link: "https://v3-migration.vuejs.org/breaking-changes/filters.html",
  },
};
function getCompatValue(e, t) {
  (t = (t.options || t).compatConfig), (t = t && t[e]);
  return "MODE" === e ? t || 3 : t;
}
function isCompatEnabled(e, t) {
  var n = getCompatValue("MODE", t),
    e = getCompatValue(e, t);
  return 3 === n ? !0 === e : !1 !== e;
}
function checkCompatEnabled(e, t, n, ...r) {
  var o = isCompatEnabled(e, t);
  return o && warnDeprecation(e, t, n, ...r), o;
}
function warnDeprecation(e, t, n, ...r) {
  var o = getCompatValue(e, t);
  if ("suppress-warning" !== o) {
    const { message: s, link: i } = deprecationData[e];
    o =
      `(deprecation ${e}) ` +
      ("function" == typeof s ? s(...r) : s) +
      (i
        ? `
  Details: ` + i
        : "");
    const a = new SyntaxError(o);
    (a.code = e), n && (a.loc = n), t.onWarn(a);
  }
}
const decodeRE = /&(gt|lt|amp|apos|quot);/g,
  decodeMap = { gt: ">", lt: "<", amp: "&", apos: "'", quot: '"' },
  defaultParserOptions = {
    delimiters: ["{{", "}}"],
    getNamespace: () => 0,
    getTextMode: () => 0,
    isVoidTag: NO,
    isPreTag: NO,
    isCustomElement: NO,
    decodeEntities: (e) => e.replace(decodeRE, (e, t) => decodeMap[t]),
    onError: defaultOnError,
    onWarn: defaultOnWarn,
    comments: !0,
  };
function baseParse(e, t = {}) {
  (e = createParserContext(e, t)), (t = getCursor(e));
  return createRoot(parseChildren(e, 0, []), getSelection(e, t));
}
function createParserContext(e, t) {
  const n = extend({}, defaultParserOptions);
  let r;
  for (r in t) n[r] = (void 0 === t[r] ? defaultParserOptions : t)[r];
  return {
    options: n,
    column: 1,
    line: 1,
    offset: 0,
    originalSource: e,
    source: e,
    inPre: !1,
    inVPre: !1,
    onWarn: n.onWarn,
  };
}
function parseChildren(n, e, r) {
  var o = last(r),
    s = o ? o.ns : 0;
  const i = [];
  for (; !isEnd(n, e, r); ) {
    var a = n.source;
    let t = void 0;
    if (0 === e || 1 === e)
      if (!n.inVPre && startsWith(a, n.options.delimiters[0]))
        t = parseInterpolation(n, e);
      else if (0 === e && "<" === a[0])
        if (1 === a.length) emitError(n, 5, 1);
        else if ("!" === a[1])
          t = startsWith(a, "\x3c!--")
            ? parseComment(n)
            : startsWith(a, "<!DOCTYPE")
            ? parseBogusComment(n)
            : startsWith(a, "<![CDATA[")
            ? 0 !== s
              ? parseCDATA(n, r)
              : (emitError(n, 1), parseBogusComment(n))
            : (emitError(n, 11), parseBogusComment(n));
        else if ("/" === a[1])
          if (2 === a.length) emitError(n, 5, 2);
          else {
            if (">" === a[2]) {
              emitError(n, 14, 2), advanceBy(n, 3);
              continue;
            }
            if (/[a-z]/i.test(a[2])) {
              emitError(n, 23), parseTag(n, 1, o);
              continue;
            }
            emitError(n, 12, 2), (t = parseBogusComment(n));
          }
        else
          /[a-z]/i.test(a[1])
            ? (t = parseElement(n, r))
            : "?" === a[1]
            ? (emitError(n, 21, 1), (t = parseBogusComment(n)))
            : emitError(n, 12, 1);
    if (((t = t || parseText(n, e)), isArray(t)))
      for (let e = 0; e < t.length; e++) pushNode(i, t[e]);
    else pushNode(i, t);
  }
  let t = !1;
  if (2 !== e && 1 !== e) {
    var l,
      c,
      p = "preserve" !== n.options.whitespace;
    for (let e = 0; e < i.length; e++) {
      const u = i[e];
      2 === u.type
        ? n.inPre
          ? (u.content = u.content.replace(/\r\n/g, "\n"))
          : /[^\t\r\n\f ]/.test(u.content)
          ? p && (u.content = u.content.replace(/[\t\r\n\f ]+/g, " "))
          : ((l = i[e - 1]),
            (c = i[e + 1]),
            !l ||
            !c ||
            (p &&
              ((3 === l.type && 3 === c.type) ||
                (3 === l.type && 1 === c.type) ||
                (1 === l.type && 3 === c.type) ||
                (1 === l.type && 1 === c.type && /[\r\n]/.test(u.content))))
              ? ((t = !0), (i[e] = null))
              : (u.content = " "))
        : 3 !== u.type || n.options.comments || ((t = !0), (i[e] = null));
    }
    if (n.inPre && o && n.options.isPreTag(o.tag)) {
      const d = i[0];
      d && 2 === d.type && (d.content = d.content.replace(/^\r?\n/, ""));
    }
  }
  return t ? i.filter(Boolean) : i;
}
function pushNode(e, t) {
  if (2 === t.type) {
    const n = last(e);
    if (n && 2 === n.type && n.loc.end.offset === t.loc.start.offset)
      return (
        (n.content += t.content),
        (n.loc.end = t.loc.end),
        void (n.loc.source += t.loc.source)
      );
  }
  e.push(t);
}
function parseCDATA(e, t) {
  advanceBy(e, 9);
  t = parseChildren(e, 3, t);
  return 0 === e.source.length ? emitError(e, 6) : advanceBy(e, 3), t;
}
function parseComment(n) {
  var e = getCursor(n);
  let r;
  var o = /--(\!)?>/.exec(n.source);
  if (o) {
    o.index <= 3 && emitError(n, 0),
      o[1] && emitError(n, 10),
      (r = n.source.slice(4, o.index));
    const s = n.source.slice(0, o.index);
    let e = 1,
      t;
    for (; -1 !== (t = s.indexOf("\x3c!--", e)); )
      advanceBy(n, t - e + 1),
        t + 4 < s.length && emitError(n, 16),
        (e = t + 1);
    advanceBy(n, o.index + o[0].length - e + 1);
  } else
    (r = n.source.slice(4)), advanceBy(n, n.source.length), emitError(n, 7);
  return { type: 3, content: r, loc: getSelection(n, e) };
}
function parseBogusComment(e) {
  var t = getCursor(e),
    n = "?" === e.source[1] ? 1 : 2;
  let r;
  var o = e.source.indexOf(">");
  return (
    -1 === o
      ? ((r = e.source.slice(n)), advanceBy(e, e.source.length))
      : ((r = e.source.slice(n, o)), advanceBy(e, o + 1)),
    { type: 3, content: r, loc: getSelection(e, t) }
  );
}
function parseElement(e, t) {
  var n = e.inPre,
    r = e.inVPre,
    o = last(t);
  const s = parseTag(e, 0, o);
  (n = e.inPre && !n), (r = e.inVPre && !r);
  if (s.isSelfClosing || e.options.isVoidTag(s.tag))
    return n && (e.inPre = !1), r && (e.inVPre = !1), s;
  t.push(s);
  var i = e.options.getTextMode(s, o),
    i = parseChildren(e, i, t);
  return (
    t.pop(),
    (s.children = i),
    startsWithEndTagOpen(e.source, s.tag)
      ? parseTag(e, 1, o)
      : (emitError(e, 24, 0, s.loc.start),
        0 === e.source.length &&
          "script" === s.tag.toLowerCase() &&
          (t = i[0]) &&
          startsWith(t.loc.source, "\x3c!--") &&
          emitError(e, 8)),
    (s.loc = getSelection(e, s.loc.start)),
    n && (e.inPre = !1),
    r && (e.inVPre = !1),
    s
  );
}
const isSpecialTemplateDirective = makeMap("if,else,else-if,for,slot");
function parseTag(t, e, n) {
  var r = getCursor(t),
    o = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(t.source),
    s = o[1],
    n = t.options.getNamespace(s, n),
    o = (advanceBy(t, o[0].length), advanceSpaces(t), getCursor(t)),
    i = t.source;
  t.options.isPreTag(s) && (t.inPre = !0);
  let a = parseAttributes(t, e),
    l =
      (0 === e &&
        !t.inVPre &&
        a.some((e) => 7 === e.type && "pre" === e.name) &&
        ((t.inVPre = !0),
        extend(t, o),
        (t.source = i),
        (a = parseAttributes(t, e).filter((e) => "v-pre" !== e.name))),
      !1);
  if (
    (0 === t.source.length
      ? emitError(t, 9)
      : ((l = startsWith(t.source, "/>")),
        1 === e && l && emitError(t, 4),
        advanceBy(t, l ? 2 : 1)),
    1 !== e)
  ) {
    let e = 0;
    return (
      t.inVPre ||
        ("slot" === s
          ? (e = 2)
          : "template" === s
          ? a.some((e) => 7 === e.type && isSpecialTemplateDirective(e.name)) &&
            (e = 3)
          : isComponent(s, a, t) && (e = 1)),
      {
        type: 1,
        ns: n,
        tag: s,
        tagType: e,
        props: a,
        isSelfClosing: l,
        children: [],
        loc: getSelection(t, r),
        codegenNode: void 0,
      }
    );
  }
}
function isComponent(e, t, n) {
  const r = n.options;
  if (r.isCustomElement(e)) return !1;
  if (
    "component" === e ||
    /^[A-Z]/.test(e) ||
    isCoreComponent(e) ||
    (r.isBuiltInComponent && r.isBuiltInComponent(e)) ||
    (r.isNativeTag && !r.isNativeTag(e))
  )
    return !0;
  for (let e = 0; e < t.length; e++) {
    const o = t[e];
    if (6 === o.type) {
      if ("is" === o.name && o.value && o.value.content.startsWith("vue:"))
        return !0;
    } else {
      if ("is" === o.name) return !0;
      "bind" === o.name && isStaticArgOf(o.arg, "is");
    }
  }
}
function parseAttributes(e, t) {
  const n = [];
  for (
    var r = new Set();
    0 < e.source.length &&
    !startsWith(e.source, ">") &&
    !startsWith(e.source, "/>");

  )
    if (startsWith(e.source, "/"))
      emitError(e, 22), advanceBy(e, 1), advanceSpaces(e);
    else {
      1 === t && emitError(e, 3);
      const o = parseAttribute(e, r);
      6 === o.type &&
        o.value &&
        "class" === o.name &&
        (o.value.content = o.value.content.replace(/\s+/g, " ").trim()),
        0 === t && n.push(o),
        /^[^\t\r\n\f />]/.test(e.source) && emitError(e, 15),
        advanceSpaces(e);
    }
  return n;
}
function parseAttribute(r, e) {
  var t,
    o = getCursor(r);
  const s = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(r.source),
    i = s[0];
  e.has(i) && emitError(r, 2), e.add(i), "=" === i[0] && emitError(r, 19);
  {
    const n = /["'<]/g;
    for (; (t = n.exec(i)); ) emitError(r, 17, t.index);
  }
  advanceBy(r, i.length);
  let a = void 0;
  /^[\t\r\n\f ]*=/.test(r.source) &&
    (advanceSpaces(r),
    advanceBy(r, 1),
    advanceSpaces(r),
    (a = parseAttributeValue(r)) || emitError(r, 13));
  const l = getSelection(r, o);
  if (r.inVPre || !/^(v-[A-Za-z0-9-]|:|\.|@|#)/.test(i))
    return (
      !r.inVPre && startsWith(i, "v-") && emitError(r, 26),
      {
        type: 6,
        name: i,
        value: a && { type: 2, content: a.content, loc: a.loc },
        loc: l,
      }
    );
  {
    const s =
      /(?:^v-([a-z0-9-]+))?(?:(?::|^\.|^@|^#)(\[[^\]]+\]|[^\.]+))?(.+)?$/i.exec(
        i
      );
    var e = startsWith(i, "."),
      c =
        s[1] ||
        (e || startsWith(i, ":") ? "bind" : startsWith(i, "@") ? "on" : "slot");
    let n;
    if (s[2]) {
      var p = "slot" === c,
        u = i.lastIndexOf(s[2]);
      const l = getSelection(
        r,
        getNewPosition(r, o, u),
        getNewPosition(r, o, u + s[2].length + ((p && s[3]) || "").length)
      );
      let e = s[2],
        t = !0;
      e.startsWith("[")
        ? ((t = !1),
          (e = e.endsWith("]")
            ? e.slice(1, e.length - 1)
            : (emitError(r, 27), e.slice(1))))
        : p && (e += s[3] || ""),
        (n = {
          type: 4,
          content: e,
          isStatic: t,
          constType: t ? 3 : 0,
          loc: l,
        });
    }
    if (a && a.isQuoted) {
      const f = a.loc;
      f.start.offset++,
        f.start.column++,
        (f.end = advancePositionWithClone(f.start, a.content)),
        (f.source = f.source.slice(1, -1));
    }
    const d = s[3] ? s[3].slice(1).split(".") : [];
    return (
      e && d.push("prop"),
      {
        type: 7,
        name: c,
        exp: a && {
          type: 4,
          content: a.content,
          isStatic: !1,
          constType: 0,
          loc: a.loc,
        },
        arg: n,
        modifiers: d,
        loc: l,
      }
    );
  }
}
function parseAttributeValue(e) {
  var t = getCursor(e);
  let n;
  var r = e.source[0],
    o = '"' === r || "'" === r;
  if (o) {
    advanceBy(e, 1);
    r = e.source.indexOf(r);
    -1 === r
      ? (n = parseTextData(e, e.source.length, 4))
      : ((n = parseTextData(e, r, 4)), advanceBy(e, 1));
  } else {
    var s,
      i = /^[^\t\r\n\f >]+/.exec(e.source);
    if (!i) return;
    const a = /["'<=`]/g;
    for (; (s = a.exec(i[0])); ) emitError(e, 18, s.index);
    n = parseTextData(e, i[0].length, 4);
  }
  return { content: n, isQuoted: o, loc: getSelection(e, t) };
}
function parseInterpolation(e, t) {
  var [n, r] = e.options.delimiters,
    o = e.source.indexOf(r, n.length);
  if (-1 !== o) {
    var s = getCursor(e),
      i = (advanceBy(e, n.length), getCursor(e)),
      a = getCursor(e),
      o = o - n.length,
      n = e.source.slice(0, o);
    const c = parseTextData(e, o, t);
    var t = c.trim(),
      l = c.indexOf(t),
      o =
        (0 < l && advancePositionWithMutation(i, n, l),
        o - (c.length - t.length - l));
    return (
      advancePositionWithMutation(a, n, o),
      advanceBy(e, r.length),
      {
        type: 5,
        content: {
          type: 4,
          isStatic: !1,
          constType: 0,
          content: t,
          loc: getSelection(e, i, a),
        },
        loc: getSelection(e, s),
      }
    );
  }
  emitError(e, 25);
}
function parseText(t, e) {
  var n = 3 === e ? ["]]>"] : ["<", t.options.delimiters[0]];
  let r = t.source.length;
  for (let e = 0; e < n.length; e++) {
    var o = t.source.indexOf(n[e], 1);
    -1 !== o && r > o && (r = o);
  }
  var s = getCursor(t);
  return { type: 2, content: parseTextData(t, r, e), loc: getSelection(t, s) };
}
function parseTextData(e, t, n) {
  const r = e.source.slice(0, t);
  return (
    advanceBy(e, t),
    2 !== n && 3 !== n && r.includes("&")
      ? e.options.decodeEntities(r, 4 === n)
      : r
  );
}
function getCursor(e) {
  var { column: e, line: t, offset: n } = e;
  return { column: e, line: t, offset: n };
}
function getSelection(e, t, n) {
  return {
    start: t,
    end: (n = n || getCursor(e)),
    source: e.originalSource.slice(t.offset, n.offset),
  };
}
function last(e) {
  return e[e.length - 1];
}
function startsWith(e, t) {
  return e.startsWith(t);
}
function advanceBy(e, t) {
  const n = e["source"];
  advancePositionWithMutation(e, n, t), (e.source = n.slice(t));
}
function advanceSpaces(e) {
  var t = /^[\t\r\n\f ]+/.exec(e.source);
  t && advanceBy(e, t[0].length);
}
function getNewPosition(e, t, n) {
  return advancePositionWithClone(t, e.originalSource.slice(t.offset, n), n);
}
function emitError(e, t, n, r = getCursor(e)) {
  n && ((r.offset += n), (r.column += n)),
    e.options.onError(createCompilerError(t, { start: r, end: r, source: "" }));
}
function isEnd(e, t, n) {
  var r = e.source;
  switch (t) {
    case 0:
      if (startsWith(r, "</"))
        for (let e = n.length - 1; 0 <= e; --e)
          if (startsWithEndTagOpen(r, n[e].tag)) return !0;
      break;
    case 1:
    case 2:
      var o = last(n);
      if (o && startsWithEndTagOpen(r, o.tag)) return !0;
      break;
    case 3:
      if (startsWith(r, "]]>")) return !0;
  }
  return !r;
}
function startsWithEndTagOpen(e, t) {
  return (
    startsWith(e, "</") &&
    e.slice(2, 2 + t.length).toLowerCase() === t.toLowerCase() &&
    /[\t\r\n\f />]/.test(e[2 + t.length] || ">")
  );
}
function hoistStatic(e, t) {
  walk(e, t, isSingleElementRoot(e, e.children[0]));
}
function isSingleElementRoot(e, t) {
  e = e.children;
  return 1 === e.length && 1 === t.type && !isSlotOutlet(t);
}
function walk(e, t, n = !1) {
  var r = e["children"],
    o = r.length;
  let s = 0;
  for (let e = 0; e < r.length; e++) {
    const a = r[e];
    if (1 === a.type && 0 === a.tagType) {
      var i = n ? 0 : getConstantType(a, t);
      if (0 < i) {
        if (2 <= i) {
          (a.codegenNode.patchFlag = "-1 /* HOISTED */"),
            (a.codegenNode = t.hoist(a.codegenNode)),
            s++;
          continue;
        }
      } else {
        const l = a.codegenNode;
        13 === l.type &&
          ((!(i = getPatchFlag(l)) || 512 === i || 1 === i) &&
            2 <= getGeneratedPropsConstantType(a, t) &&
            (i = getNodeProps(a)) &&
            (l.props = t.hoist(i)),
          l.dynamicProps && (l.dynamicProps = t.hoist(l.dynamicProps)));
      }
    }
    if (1 === a.type) {
      i = 1 === a.tagType;
      i && t.scopes.vSlot++, walk(a, t), i && t.scopes.vSlot--;
    } else if (11 === a.type) walk(a, t, 1 === a.children.length);
    else if (9 === a.type)
      for (let e = 0; e < a.branches.length; e++)
        walk(a.branches[e], t, 1 === a.branches[e].children.length);
  }
  s && t.transformHoist && t.transformHoist(r, t, e),
    s &&
      s === o &&
      1 === e.type &&
      0 === e.tagType &&
      e.codegenNode &&
      13 === e.codegenNode.type &&
      isArray(e.codegenNode.children) &&
      (e.codegenNode.children = t.hoist(
        createArrayExpression(e.codegenNode.children)
      ));
}
function getConstantType(n, r) {
  const o = r["constantCache"];
  switch (n.type) {
    case 1:
      if (0 !== n.tagType) return 0;
      var e = o.get(n);
      if (void 0 !== e) return e;
      const l = n.codegenNode;
      if (13 !== l.type) return 0;
      if (l.isBlock && "svg" !== n.tag && "foreignObject" !== n.tag) return 0;
      if (getPatchFlag(l)) return o.set(n, 0), 0;
      {
        let t = 3;
        e = getGeneratedPropsConstantType(n, r);
        if (0 === e) return o.set(n, 0), 0;
        e < t && (t = e);
        for (let e = 0; e < n.children.length; e++) {
          var s = getConstantType(n.children[e], r);
          if (0 === s) return o.set(n, 0), 0;
          s < t && (t = s);
        }
        if (1 < t)
          for (let e = 0; e < n.props.length; e++) {
            var i = n.props[e];
            if (7 === i.type && "bind" === i.name && i.exp) {
              i = getConstantType(i.exp, r);
              if (0 === i) return o.set(n, 0), 0;
              i < t && (t = i);
            }
          }
        if (l.isBlock) {
          for (let e = 0; e < n.props.length; e++)
            if (7 === n.props[e].type) return o.set(n, 0), 0;
          r.removeHelper(OPEN_BLOCK),
            r.removeHelper(getVNodeBlockHelper(r.inSSR, l.isComponent)),
            (l.isBlock = !1),
            r.helper(getVNodeHelper(r.inSSR, l.isComponent));
        }
        return o.set(n, t), t;
      }
    case 2:
    case 3:
      return 3;
    case 9:
    case 11:
    case 10:
      return 0;
    case 5:
    case 12:
      return getConstantType(n.content, r);
    case 4:
      return n.constType;
    case 8:
      let t = 3;
      for (let e = 0; e < n.children.length; e++) {
        var a = n.children[e];
        if (!isString(a) && !isSymbol(a)) {
          a = getConstantType(a, r);
          if (0 === a) return 0;
          a < t && (t = a);
        }
      }
      return t;
    default:
      return 0;
  }
}
const allowHoistedHelperSet = new Set([
  NORMALIZE_CLASS,
  NORMALIZE_STYLE,
  NORMALIZE_PROPS,
  GUARD_REACTIVE_PROPS,
]);
function getConstantTypeOfHelperCall(e, t) {
  if (
    14 === e.type &&
    !isString(e.callee) &&
    allowHoistedHelperSet.has(e.callee)
  ) {
    e = e.arguments[0];
    if (4 === e.type) return getConstantType(e, t);
    if (14 === e.type) return getConstantTypeOfHelperCall(e, t);
  }
  return 0;
}
function getGeneratedPropsConstantType(e, n) {
  let r = 3;
  e = getNodeProps(e);
  if (e && 15 === e.type) {
    var o = e["properties"];
    for (let t = 0; t < o.length; t++) {
      var { key: s, value: i } = o[t],
        s = getConstantType(s, n);
      if (0 === s) return s;
      s < r && (r = s);
      let e;
      if (
        0 ===
        (e =
          4 === i.type
            ? getConstantType(i, n)
            : 14 === i.type
            ? getConstantTypeOfHelperCall(i, n)
            : 0)
      )
        return e;
      e < r && (r = e);
    }
  }
  return r;
}
function getNodeProps(e) {
  e = e.codegenNode;
  if (13 === e.type) return e.props;
}
function getPatchFlag(e) {
  e = e.patchFlag;
  return e ? parseInt(e, 10) : void 0;
}
function createTransformContext(
  e,
  {
    filename: t = "",
    prefixIdentifiers: n = !1,
    hoistStatic: r = !1,
    cacheHandlers: o = !1,
    nodeTransforms: s = [],
    directiveTransforms: i = {},
    transformHoist: a = null,
    isBuiltInComponent: l = NOOP,
    isCustomElement: c = NOOP,
    expressionPlugins: p = [],
    scopeId: u = null,
    slotted: d = !0,
    ssr: f = !1,
    inSSR: m = !1,
    ssrCssVars: h = "",
    bindingMetadata: g = EMPTY_OBJ,
    inline: v = !1,
    isTS: y = !1,
    onError: E = defaultOnError,
    onWarn: S = defaultOnWarn,
    compatConfig: C,
  }
) {
  t = t.replace(/\?.*$/, "").match(/([^/\\]+)\.\w+$/);
  const b = {
    selfName: t && capitalize(camelize(t[1])),
    prefixIdentifiers: n,
    hoistStatic: r,
    cacheHandlers: o,
    nodeTransforms: s,
    directiveTransforms: i,
    transformHoist: a,
    isBuiltInComponent: l,
    isCustomElement: c,
    expressionPlugins: p,
    scopeId: u,
    slotted: d,
    ssr: f,
    inSSR: m,
    ssrCssVars: h,
    bindingMetadata: g,
    inline: v,
    isTS: y,
    onError: E,
    onWarn: S,
    compatConfig: C,
    root: e,
    helpers: new Map(),
    components: new Set(),
    directives: new Set(),
    hoists: [],
    imports: [],
    constantCache: new Map(),
    temps: 0,
    cached: 0,
    identifiers: Object.create(null),
    scopes: { vFor: 0, vSlot: 0, vPre: 0, vOnce: 0 },
    parent: null,
    currentNode: e,
    childIndex: 0,
    inVOnce: !1,
    helper(e) {
      var t = b.helpers.get(e) || 0;
      return b.helpers.set(e, t + 1), e;
    },
    removeHelper(e) {
      var t = b.helpers.get(e);
      t && ((t = t - 1) ? b.helpers.set(e, t) : b.helpers.delete(e));
    },
    helperString(e) {
      return "_" + helperNameMap[b.helper(e)];
    },
    replaceNode(e) {
      if (!b.currentNode)
        throw new Error("Node being replaced is already removed.");
      if (!b.parent) throw new Error("Cannot replace root node.");
      b.parent.children[b.childIndex] = b.currentNode = e;
    },
    removeNode(e) {
      if (!b.parent) throw new Error("Cannot remove root node.");
      const t = b.parent.children;
      var n = e ? t.indexOf(e) : b.currentNode ? b.childIndex : -1;
      if (n < 0)
        throw new Error("node being removed is not a child of current parent");
      e && e !== b.currentNode
        ? b.childIndex > n && (b.childIndex--, b.onNodeRemoved())
        : ((b.currentNode = null), b.onNodeRemoved()),
        b.parent.children.splice(n, 1);
    },
    onNodeRemoved: () => {},
    addIdentifiers(e) {},
    removeIdentifiers(e) {},
    hoist(e) {
      isString(e) && (e = createSimpleExpression(e)), b.hoists.push(e);
      const t = createSimpleExpression(
        "_hoisted_" + b.hoists.length,
        !1,
        e.loc,
        2
      );
      return (t.hoisted = e), t;
    },
    cache(e, t = !1) {
      return createCacheExpression(b.cached++, e, t);
    },
  };
  return b;
}
function transform(e, t) {
  const n = createTransformContext(e, t);
  traverseNode(e, n),
    t.hoistStatic && hoistStatic(e, n),
    t.ssr || createRootCodegen(e, n),
    (e.helpers = [...n.helpers.keys()]),
    (e.components = [...n.components]),
    (e.directives = [...n.directives]),
    (e.imports = n.imports),
    (e.hoists = n.hoists),
    (e.temps = n.temps),
    (e.cached = n.cached);
}
function createRootCodegen(n, r) {
  const o = r["helper"],
    s = n["children"];
  if (1 === s.length) {
    var e,
      t = s[0];
    isSingleElementRoot(n, t) && t.codegenNode
      ? (13 === (e = t.codegenNode).type && makeBlock(e, r),
        (n.codegenNode = e))
      : (n.codegenNode = t);
  } else if (1 < s.length) {
    let e = 64,
      t = PatchFlagNames[64];
    1 === s.filter((e) => 3 !== e.type).length &&
      ((e |= 2048), (t += ", " + PatchFlagNames[2048])),
      (n.codegenNode = createVNodeCall(
        r,
        o(FRAGMENT),
        void 0,
        n.children,
        e + ` /* ${t} */`,
        void 0,
        void 0,
        !0,
        void 0,
        !1
      ));
  }
}
function traverseChildren(e, t) {
  let n = 0;
  for (
    var r = () => {
      n--;
    };
    n < e.children.length;
    n++
  ) {
    var o = e.children[n];
    isString(o) ||
      ((t.parent = e),
      (t.childIndex = n),
      (t.onNodeRemoved = r),
      traverseNode(o, t));
  }
}
function traverseNode(t, n) {
  n.currentNode = t;
  const r = n["nodeTransforms"],
    o = [];
  for (let e = 0; e < r.length; e++) {
    var s = r[e](t, n);
    if ((s && (isArray(s) ? o.push(...s) : o.push(s)), !n.currentNode)) return;
    t = n.currentNode;
  }
  switch (t.type) {
    case 3:
      n.ssr || n.helper(CREATE_COMMENT);
      break;
    case 5:
      n.ssr || n.helper(TO_DISPLAY_STRING);
      break;
    case 9:
      for (let e = 0; e < t.branches.length; e++)
        traverseNode(t.branches[e], n);
      break;
    case 10:
    case 11:
    case 1:
    case 0:
      traverseChildren(t, n);
  }
  n.currentNode = t;
  let e = o.length;
  for (; e--; ) o[e]();
}
function createStructuralDirectiveTransform(t, i) {
  const a = isString(t) ? (e) => e === t : (e) => t.test(e);
  return (t, n) => {
    if (1 === t.type) {
      const o = t["props"];
      if (3 !== t.tagType || !o.some(isVSlot)) {
        const s = [];
        for (let e = 0; e < o.length; e++) {
          var r = o[e];
          7 === r.type &&
            a(r.name) &&
            (o.splice(e, 1), e--, (r = i(t, r, n)) && s.push(r));
        }
        return s;
      }
    }
  };
}
const PURE_ANNOTATION = "/*#__PURE__*/",
  aliasHelper = (e) => helperNameMap[e] + ": _" + helperNameMap[e];
function createCodegenContext(
  e,
  {
    mode: t = "function",
    prefixIdentifiers: n = "module" === t,
    sourceMap: r = !1,
    filename: o = "template.vue.html",
    scopeId: s = null,
    optimizeImports: i = !1,
    runtimeGlobalName: a = "Vue",
    runtimeModuleName: l = "vue",
    ssrRuntimeModuleName: c = "vue/server-renderer",
    ssr: p = !1,
    isTS: u = !1,
    inSSR: d = !1,
  }
) {
  const f = {
    mode: t,
    prefixIdentifiers: n,
    sourceMap: r,
    filename: o,
    scopeId: s,
    optimizeImports: i,
    runtimeGlobalName: a,
    runtimeModuleName: l,
    ssrRuntimeModuleName: c,
    ssr: p,
    isTS: u,
    inSSR: d,
    source: e.loc.source,
    code: "",
    column: 1,
    line: 1,
    offset: 0,
    indentLevel: 0,
    pure: !1,
    map: void 0,
    helper(e) {
      return "_" + helperNameMap[e];
    },
    push(e, t) {
      f.code += e;
    },
    indent() {
      m(++f.indentLevel);
    },
    deindent(e = !1) {
      e ? --f.indentLevel : m(--f.indentLevel);
    },
    newline() {
      m(f.indentLevel);
    },
  };
  function m(e) {
    f.push("\n" + "  ".repeat(e));
  }
  return f;
}
function generate(t, e = {}) {
  const n = createCodegenContext(t, e),
    {
      mode: r,
      push: o,
      prefixIdentifiers: s,
      indent: i,
      deindent: a,
      newline: l,
      ssr: c,
    } = (e.onContextCreated && e.onContextCreated(n), n);
  var e = 0 < t.helpers.length,
    p = !s && "module" !== r,
    u = (genFunctionPreamble(t, n), c ? "ssrRender" : "render");
  const d = c ? ["_ctx", "_push", "_parent", "_attrs"] : ["_ctx", "_cache"];
  var f = d.join(", ");
  if (
    (o(`function ${u}(${f}) {`),
    i(),
    p &&
      (o("with (_ctx) {"),
      i(),
      e &&
        (o(`const { ${t.helpers.map(aliasHelper).join(", ")} } = _Vue`),
        o(`
`),
        l())),
    t.components.length &&
      (genAssets(t.components, "component", n),
      (t.directives.length || 0 < t.temps) && l()),
    t.directives.length &&
      (genAssets(t.directives, "directive", n), 0 < t.temps && l()),
    0 < t.temps)
  ) {
    o("let ");
    for (let e = 0; e < t.temps; e++) o(`${0 < e ? ", " : ""}_temp` + e);
  }
  return (
    (t.components.length || t.directives.length || t.temps) &&
      (o(`
`),
      l()),
    c || o("return "),
    t.codegenNode ? genNode(t.codegenNode, n) : o("null"),
    p && (a(), o("}")),
    a(),
    o("}"),
    { ast: t, code: n.code, preamble: "", map: n.map ? n.map.toJSON() : void 0 }
  );
}
function genFunctionPreamble(t, e) {
  const { push: n, newline: r, runtimeGlobalName: o } = e;
  var s;
  0 < t.helpers.length &&
    (n(`const _Vue = ${o}
`),
    t.hoists.length &&
      ((s = [
        CREATE_VNODE,
        CREATE_ELEMENT_VNODE,
        CREATE_COMMENT,
        CREATE_TEXT,
        CREATE_STATIC,
      ]
        .filter((e) => t.helpers.includes(e))
        .map(aliasHelper)
        .join(", ")),
      n(`const { ${s} } = _Vue
`))),
    genHoists(t.hoists, e),
    r(),
    n("return ");
}
function genAssets(n, r, { helper: e, push: o, newline: s, isTS: i }) {
  var a = e("component" === r ? RESOLVE_COMPONENT : RESOLVE_DIRECTIVE);
  for (let t = 0; t < n.length; t++) {
    let e = n[t];
    var l = e.endsWith("__self");
    o(
      `const ${toValidAssetId(
        (e = l ? e.slice(0, -6) : e),
        r
      )} = ${a}(${JSON.stringify(e)}${l ? ", true" : ""})` + (i ? "!" : "")
    ),
      t < n.length - 1 && s();
  }
}
function genHoists(t, n) {
  if (t.length) {
    n.pure = !0;
    const { push: o, newline: s } = n;
    s();
    for (let e = 0; e < t.length; e++) {
      var r = t[e];
      r && (o(`const _hoisted_${e + 1} = `), genNode(r, n), s());
    }
    n.pure = !1;
  }
}
function isText$1(e) {
  return (
    isString(e) || 4 === e.type || 2 === e.type || 5 === e.type || 8 === e.type
  );
}
function genNodeListAsArray(e, t) {
  var n = 3 < e.length || e.some((e) => isArray(e) || !isText$1(e));
  t.push("["),
    n && t.indent(),
    genNodeList(e, t, n),
    n && t.deindent(),
    t.push("]");
}
function genNodeList(t, n, r = !1, o = !0) {
  const { push: s, newline: i } = n;
  for (let e = 0; e < t.length; e++) {
    var a = t[e];
    isString(a) ? s(a) : (isArray(a) ? genNodeListAsArray : genNode)(a, n),
      e < t.length - 1 && (r ? (o && s(","), i()) : o && s(", "));
  }
}
function genNode(e, t) {
  if (isString(e)) t.push(e);
  else if (isSymbol(e)) t.push(t.helper(e));
  else
    switch (e.type) {
      case 1:
      case 9:
      case 11:
        assert(
          null != e.codegenNode,
          "Codegen node is missing for element/if/for node. Apply appropriate transforms first."
        ),
          genNode(e.codegenNode, t);
        break;
      case 2:
        genText(e, t);
        break;
      case 4:
        genExpression(e, t);
        break;
      case 5:
        genInterpolation(e, t);
        break;
      case 12:
        genNode(e.codegenNode, t);
        break;
      case 8:
        genCompoundExpression(e, t);
        break;
      case 3:
        genComment(e, t);
        break;
      case 13:
        genVNodeCall(e, t);
        break;
      case 14:
        genCallExpression(e, t);
        break;
      case 15:
        genObjectExpression(e, t);
        break;
      case 17:
        genArrayExpression(e, t);
        break;
      case 18:
        genFunctionExpression(e, t);
        break;
      case 19:
        genConditionalExpression(e, t);
        break;
      case 20:
        genCacheExpression(e, t);
        break;
      case 21:
        genNodeList(e.body, t, !0, !1);
        break;
      case 22:
      case 23:
      case 24:
      case 25:
      case 26:
      case 10:
        break;
      default:
        return assert(!1, "unhandled codegen node type: " + e.type), e;
    }
}
function genText(e, t) {
  t.push(JSON.stringify(e.content), e);
}
function genExpression(e, t) {
  var { content: n, isStatic: r } = e;
  t.push(r ? JSON.stringify(n) : n, e);
}
function genInterpolation(e, t) {
  const { push: n, helper: r, pure: o } = t;
  o && n(PURE_ANNOTATION),
    n(r(TO_DISPLAY_STRING) + "("),
    genNode(e.content, t),
    n(")");
}
function genCompoundExpression(t, n) {
  for (let e = 0; e < t.children.length; e++) {
    var r = t.children[e];
    isString(r) ? n.push(r) : genNode(r, n);
  }
}
function genExpressionAsPropertyKey(e, t) {
  const n = t["push"];
  8 === e.type
    ? (n("["), genCompoundExpression(e, t), n("]"))
    : e.isStatic
    ? ((t = isSimpleIdentifier(e.content)
        ? e.content
        : JSON.stringify(e.content)),
      n(t, e))
    : n(`[${e.content}]`, e);
}
function genComment(e, t) {
  const { push: n, helper: r, pure: o } = t;
  o && n(PURE_ANNOTATION),
    n(`${r(CREATE_COMMENT)}(${JSON.stringify(e.content)})`, e);
}
function genVNodeCall(e, t) {
  const { push: n, helper: r, pure: o } = t;
  var {
      tag: s,
      props: i,
      children: a,
      patchFlag: l,
      dynamicProps: c,
      directives: p,
      isBlock: u,
      disableTracking: d,
      isComponent: f,
    } = e,
    d =
      (p && n(r(WITH_DIRECTIVES) + "("),
      u && n(`(${r(OPEN_BLOCK)}(${d ? "true" : ""}), `),
      o && n(PURE_ANNOTATION),
      (u ? getVNodeBlockHelper : getVNodeHelper)(t.inSSR, f));
  n(r(d) + "(", e),
    genNodeList(genNullableArgs([s, i, a, l, c]), t),
    n(")"),
    u && n(")"),
    p && (n(", "), genNode(p, t), n(")"));
}
function genNullableArgs(e) {
  let t = e.length;
  for (; t-- && null == e[t]; );
  return e.slice(0, t + 1).map((e) => e || "null");
}
function genCallExpression(e, t) {
  const { push: n, helper: r, pure: o } = t;
  var s = isString(e.callee) ? e.callee : r(e.callee);
  o && n(PURE_ANNOTATION), n(s + "(", e), genNodeList(e.arguments, t), n(")");
}
function genObjectExpression(e, t) {
  const { push: n, indent: r, deindent: o, newline: s } = t,
    i = e["properties"];
  if (i.length) {
    var a = 1 < i.length || i.some((e) => 4 !== e.value.type);
    n(a ? "{" : "{ "), a && r();
    for (let e = 0; e < i.length; e++) {
      var { key: l, value: c } = i[e];
      genExpressionAsPropertyKey(l, t),
        n(": "),
        genNode(c, t),
        e < i.length - 1 && (n(","), s());
    }
    a && o(), n(a ? "}" : " }");
  } else n("{}", e);
}
function genArrayExpression(e, t) {
  genNodeListAsArray(e.elements, t);
}
function genFunctionExpression(e, t) {
  const { push: n, indent: r, deindent: o } = t;
  var { params: s, returns: i, body: a, newline: l, isSlot: c } = e;
  c && n(`_${helperNameMap[WITH_CTX]}(`),
    n("(", e),
    isArray(s) ? genNodeList(s, t) : s && genNode(s, t),
    n(") => "),
    (l || a) && (n("{"), r()),
    i
      ? (l && n("return "), (isArray(i) ? genNodeListAsArray : genNode)(i, t))
      : a && genNode(a, t),
    (l || a) && (o(), n("}")),
    c && n(")");
}
function genConditionalExpression(e, t) {
  var { test: e, consequent: n, alternate: r, newline: o } = e;
  const { push: s, indent: i, deindent: a, newline: l } = t;
  4 === e.type
    ? ((c = !isSimpleIdentifier(e.content)) && s("("),
      genExpression(e, t),
      c && s(")"))
    : (s("("), genNode(e, t), s(")")),
    o && i(),
    t.indentLevel++,
    o || s(" "),
    s("? "),
    genNode(n, t),
    t.indentLevel--,
    o && l(),
    o || s(" "),
    s(": ");
  var c = 19 === r.type;
  c || t.indentLevel++, genNode(r, t), c || t.indentLevel--, o && a(!0);
}
function genCacheExpression(e, t) {
  const { push: n, helper: r, indent: o, deindent: s, newline: i } = t;
  n(`_cache[${e.index}] || (`),
    e.isVNode && (o(), n(r(SET_BLOCK_TRACKING) + "(-1),"), i()),
    n(`_cache[${e.index}] = `),
    genNode(e.value, t),
    e.isVNode &&
      (n(","),
      i(),
      n(r(SET_BLOCK_TRACKING) + "(1),"),
      i(),
      n(`_cache[${e.index}]`),
      s()),
    n(")");
}
const prohibitedKeywordRE = new RegExp(
    "\\b" +
      "do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,super,throw,while,yield,delete,export,import,return,switch,default,extends,finally,continue,debugger,function,arguments,typeof,void"
        .split(",")
        .join("\\b|\\b") +
      "\\b"
  ),
  stripStringRE =
    /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;
function validateBrowserExpression(n, r, e = !1, o = !1) {
  const s = n.content;
  if (s.trim())
    try {
      new Function(o ? ` ${s} ` : "return " + (e ? `(${s}) => {}` : `(${s})`));
    } catch (e) {
      let t = e.message;
      o = s.replace(stripStringRE, "").match(prohibitedKeywordRE);
      o && (t = `avoid using JavaScript keyword as property name: "${o[0]}"`),
        r.onError(createCompilerError(45, n.loc, void 0, t));
    }
}
const transformExpression = (t, n) => {
  if (5 === t.type) t.content = processExpression(t.content, n);
  else if (1 === t.type)
    for (let e = 0; e < t.props.length; e++) {
      const s = t.props[e];
      var r, o;
      7 === s.type &&
        "for" !== s.name &&
        ((r = s.exp),
        (o = s.arg),
        !r ||
          4 !== r.type ||
          ("on" === s.name && o) ||
          (s.exp = processExpression(r, n, "slot" === s.name)),
        o && 4 === o.type && !o.isStatic && (s.arg = processExpression(o, n)));
    }
};
function processExpression(
  e,
  t,
  n = !1,
  r = !1,
  o = Object.create(t.identifiers)
) {
  return validateBrowserExpression(e, t, n, r), e;
}
const transformIf = createStructuralDirectiveTransform(
  /^(if|else|else-if)$/,
  (e, t, a) =>
    processIf(e, t, a, (t, n, r) => {
      const e = a.parent.children;
      let o = e.indexOf(t),
        s = 0;
      for (; 0 <= o--; ) {
        var i = e[o];
        i && 9 === i.type && (s += i.branches.length);
      }
      return () => {
        if (r) t.codegenNode = createCodegenNodeForBranch(n, s, a);
        else {
          const e = getParentCondition(t.codegenNode);
          e.alternate = createCodegenNodeForBranch(
            n,
            s + t.branches.length - 1,
            a
          );
        }
      };
    })
);
function processIf(t, n, r, o) {
  if (
    ("else" === n.name ||
      (n.exp && n.exp.content.trim()) ||
      ((e = (n.exp || t).loc),
      r.onError(createCompilerError(28, n.loc)),
      (n.exp = createSimpleExpression("true", !1, e))),
    n.exp && validateBrowserExpression(n.exp, r),
    "if" === n.name)
  ) {
    var e = createIfBranch(t, n),
      s = { type: 9, loc: t.loc, branches: [e] };
    if ((r.replaceNode(s), o)) return o(s, e, !0);
  } else {
    const i = r.parent.children,
      a = [];
    let e = i.indexOf(t);
    for (; -1 <= e--; ) {
      const l = i[e];
      if (l && 3 === l.type) r.removeNode(l), a.unshift(l);
      else {
        if (!l || 2 !== l.type || l.content.trim().length) {
          if (l && 9 === l.type) {
            "else-if" === n.name &&
              void 0 === l.branches[l.branches.length - 1].condition &&
              r.onError(createCompilerError(30, t.loc)),
              r.removeNode();
            const c = createIfBranch(t, n);
            !a.length ||
              (r.parent &&
                1 === r.parent.type &&
                isBuiltInType(r.parent.tag, "transition")) ||
              (c.children = [...a, ...c.children]);
            {
              const u = c.userKey;
              u &&
                l.branches.forEach(({ userKey: e }) => {
                  isSameKey(e, u) &&
                    r.onError(createCompilerError(29, c.userKey.loc));
                });
            }
            l.branches.push(c);
            const p = o && o(l, c, !1);
            traverseNode(c, r), p && p(), (r.currentNode = null);
          } else r.onError(createCompilerError(30, t.loc));
          break;
        }
        r.removeNode(l);
      }
    }
  }
}
function createIfBranch(e, t) {
  var n = 3 === e.tagType;
  return {
    type: 10,
    loc: e.loc,
    condition: "else" === t.name ? void 0 : t.exp,
    children: n && !findDir(e, "for") ? e.children : [e],
    userKey: findProp(e, "key"),
    isTemplateIf: n,
  };
}
function createCodegenNodeForBranch(e, t, n) {
  return e.condition
    ? createConditionalExpression(
        e.condition,
        createChildrenCodegenNode(e, t, n),
        createCallExpression(n.helper(CREATE_COMMENT), ['"v-if"', "true"])
      )
    : createChildrenCodegenNode(e, t, n);
}
function createChildrenCodegenNode(n, r, o) {
  const s = o["helper"];
  r = createObjectProperty(
    "key",
    createSimpleExpression("" + r, !1, locStub, 2)
  );
  const i = n["children"];
  var e,
    t,
    a = i[0];
  if (1 === i.length && 1 === a.type)
    return (
      13 === (t = getMemoedVNodeCall((e = a.codegenNode))).type &&
        makeBlock(t, o),
      injectProp(t, r, o),
      e
    );
  if (1 === i.length && 11 === a.type)
    return injectProp((t = a.codegenNode), r, o), t;
  {
    let e = 64,
      t = PatchFlagNames[64];
    return (
      n.isTemplateIf ||
        1 !== i.filter((e) => 3 !== e.type).length ||
        ((e |= 2048), (t += ", " + PatchFlagNames[2048])),
      createVNodeCall(
        o,
        s(FRAGMENT),
        createObjectExpression([r]),
        i,
        e + ` /* ${t} */`,
        void 0,
        void 0,
        !0,
        !1,
        !1,
        n.loc
      )
    );
  }
}
function isSameKey(e, t) {
  if (!e || e.type !== t.type) return !1;
  if (6 === e.type) {
    if (e.value.content !== t.value.content) return !1;
  } else {
    (e = e.exp), (t = t.exp);
    if (e.type !== t.type) return !1;
    if (4 !== e.type || e.isStatic !== t.isStatic || e.content !== t.content)
      return !1;
  }
  return !0;
}
function getParentCondition(e) {
  for (;;)
    if (19 === e.type) {
      if (19 !== e.alternate.type) return e;
      e = e.alternate;
    } else 20 === e.type && (e = e.value);
}
const transformFor = createStructuralDirectiveTransform("for", (d, e, f) => {
  const { helper: m, removeHelper: h } = f;
  return processFor(d, e, f, (s) => {
    const i = createCallExpression(m(RENDER_LIST), [s.source]),
      a = isTemplateNode(d),
      l = findDir(d, "memo");
    var e = findProp(d, "key");
    const c =
        e &&
        (6 === e.type ? createSimpleExpression(e.value.content, !0) : e.exp),
      p = e ? createObjectProperty("key", c) : null,
      u = 4 === s.source.type && 0 < s.source.constType;
    e = u ? 64 : e ? 128 : 256;
    return (
      (s.codegenNode = createVNodeCall(
        f,
        m(FRAGMENT),
        void 0,
        i,
        e + ` /* ${PatchFlagNames[e]} */`,
        void 0,
        void 0,
        !0,
        !u,
        !1,
        d.loc
      )),
      () => {
        let e;
        var t = s["children"],
          n =
            (a &&
              d.children.some((e) => {
                if (1 === e.type) {
                  e = findProp(e, "key");
                  if (e) return f.onError(createCompilerError(33, e.loc)), !0;
                }
              }),
            1 !== t.length || 1 !== t[0].type),
          r = isSlotOutlet(d)
            ? d
            : a && 1 === d.children.length && isSlotOutlet(d.children[0])
            ? d.children[0]
            : null;
        if (
          (r
            ? ((e = r.codegenNode), a && p && injectProp(e, p, f))
            : n
            ? (e = createVNodeCall(
                f,
                m(FRAGMENT),
                p ? createObjectExpression([p]) : void 0,
                d.children,
                64 + ` /* ${PatchFlagNames[64]} */`,
                void 0,
                void 0,
                !0,
                void 0,
                !1
              ))
            : ((e = t[0].codegenNode),
              a && p && injectProp(e, p, f),
              e.isBlock !== !u &&
                (e.isBlock
                  ? (h(OPEN_BLOCK),
                    h(getVNodeBlockHelper(f.inSSR, e.isComponent)))
                  : h(getVNodeHelper(f.inSSR, e.isComponent))),
              (e.isBlock = !u),
              e.isBlock
                ? (m(OPEN_BLOCK),
                  m(getVNodeBlockHelper(f.inSSR, e.isComponent)))
                : m(getVNodeHelper(f.inSSR, e.isComponent))),
          l)
        ) {
          const o = createFunctionExpression(
            createForLoopParams(s.parseResult, [
              createSimpleExpression("_cached"),
            ])
          );
          (o.body = createBlockStatement([
            createCompoundExpression(["const _memo = (", l.exp, ")"]),
            createCompoundExpression([
              "if (_cached",
              ...(c ? [" && _cached.key === ", c] : []),
              ` && ${f.helperString(
                IS_MEMO_SAME
              )}(_cached, _memo)) return _cached`,
            ]),
            createCompoundExpression(["const _item = ", e]),
            createSimpleExpression("_item.memo = _memo"),
            createSimpleExpression("return _item"),
          ])),
            i.arguments.push(
              o,
              createSimpleExpression("_cache"),
              createSimpleExpression(String(f.cached++))
            );
        } else
          i.arguments.push(
            createFunctionExpression(createForLoopParams(s.parseResult), e, !0)
          );
      }
    );
  });
});
function processFor(e, t, n, r) {
  if (t.exp) {
    var o = parseForExpression(t.exp, n);
    if (o) {
      const c = n["scopes"];
      var { source: s, value: i, key: a, index: l } = o,
        s = {
          type: 11,
          loc: t.loc,
          source: s,
          valueAlias: i,
          keyAlias: a,
          objectIndexAlias: l,
          parseResult: o,
          children: isTemplateNode(e) ? e.children : [e],
        };
      n.replaceNode(s), c.vFor++;
      const p = r && r(s);
      return () => {
        c.vFor--, p && p();
      };
    }
    n.onError(createCompilerError(32, t.loc));
  } else n.onError(createCompilerError(31, t.loc));
}
const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/,
  forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/,
  stripParensRE = /^\(|\)$/g;
function parseForExpression(n, r) {
  var o = n.loc;
  const s = n.content;
  n = s.match(forAliasRE);
  if (n) {
    const [, e, l] = n,
      c = {
        source: createAliasExpression(o, l.trim(), s.indexOf(l, e.length)),
        value: void 0,
        key: void 0,
        index: void 0,
      };
    validateBrowserExpression(c.source, r);
    let t = e.trim().replace(stripParensRE, "").trim();
    n = e.indexOf(t);
    const p = t.match(forIteratorRE);
    if (p) {
      t = t.replace(forIteratorRE, "").trim();
      var i,
        a = p[1].trim();
      let e;
      a &&
        ((e = s.indexOf(a, n + t.length)),
        (c.key = createAliasExpression(o, a, e)),
        validateBrowserExpression(c.key, r, !0)),
        !p[2] ||
          ((i = p[2].trim()) &&
            ((c.index = createAliasExpression(
              o,
              i,
              s.indexOf(i, c.key ? e + a.length : n + t.length)
            )),
            validateBrowserExpression(c.index, r, !0)));
    }
    return (
      t &&
        ((c.value = createAliasExpression(o, t, n)),
        validateBrowserExpression(c.value, r, !0)),
      c
    );
  }
}
function createAliasExpression(e, t, n) {
  return createSimpleExpression(t, !1, getInnerRange(e, n, t.length));
}
function createForLoopParams({ value: e, key: t, index: n }, r = []) {
  return createParamsList([e, t, n, ...r]);
}
function createParamsList(e) {
  let t = e.length;
  for (; t-- && !e[t]; );
  return e
    .slice(0, t + 1)
    .map((e, t) => e || createSimpleExpression("_".repeat(t + 1), !1));
}
const defaultFallback = createSimpleExpression("undefined", !1),
  trackSlotScopes = (e, t) => {
    if (1 === e.type && (1 === e.tagType || 3 === e.tagType)) {
      e = findDir(e, "slot");
      if (e)
        return (
          e.exp,
          t.scopes.vSlot++,
          () => {
            t.scopes.vSlot--;
          }
        );
    }
  },
  buildClientSlotFn = (e, t, n) =>
    createFunctionExpression(e, t, !1, !0, t.length ? t[0].loc : n);
function buildSlots(e, r, o = buildClientSlotFn) {
  r.helper(WITH_CTX);
  const { children: s, loc: n } = e,
    i = [],
    a = [];
  let l = 0 < r.scopes.vSlot || 0 < r.scopes.vFor;
  var t,
    c = findDir(e, "slot", !0);
  c &&
    (({ arg: t, exp: C } = c),
    t && !isStaticExp(t) && (l = !0),
    i.push(
      createObjectProperty(
        t || createSimpleExpression("default", !0),
        o(C, s, n)
      )
    ));
  let p = !1,
    u = !1;
  const d = [],
    f = new Set();
  let m = 0;
  for (let n = 0; n < s.length; n++) {
    var h = s[n];
    let t;
    if (isTemplateNode(h) && (t = findDir(h, "slot", !0))) {
      if (c) {
        r.onError(createCompilerError(37, t.loc));
        break;
      }
      p = !0;
      var { children: g, loc: v } = h,
        { arg: y = createSimpleExpression("default", !0), exp: E, loc: S } = t;
      let e;
      isStaticExp(y) ? (e = y ? y.content : "default") : (l = !0);
      E = o(E, g, v);
      if ((g = findDir(h, "if")))
        (l = !0),
          a.push(
            createConditionalExpression(
              g.exp,
              buildDynamicSlot(y, E, m++),
              defaultFallback
            )
          );
      else if ((v = findDir(h, /^else(-if)?$/, !0))) {
        let e = n,
          t;
        for (; e-- && 3 === (t = s[e]).type; );
        if (t && isTemplateNode(t) && findDir(t, "if")) {
          s.splice(n, 1), n--;
          let e = a[a.length - 1];
          for (; 19 === e.alternate.type; ) e = e.alternate;
          e.alternate = v.exp
            ? createConditionalExpression(
                v.exp,
                buildDynamicSlot(y, E, m++),
                defaultFallback
              )
            : buildDynamicSlot(y, E, m++);
        } else r.onError(createCompilerError(30, v.loc));
      } else if ((g = findDir(h, "for"))) {
        l = !0;
        v = g.parseResult || parseForExpression(g.exp, r);
        v
          ? a.push(
              createCallExpression(r.helper(RENDER_LIST), [
                v.source,
                createFunctionExpression(
                  createForLoopParams(v),
                  buildDynamicSlot(y, E),
                  !0
                ),
              ])
            )
          : r.onError(createCompilerError(32, g.loc));
      } else {
        if (e) {
          if (f.has(e)) {
            r.onError(createCompilerError(38, S));
            continue;
          }
          f.add(e), "default" === e && (u = !0);
        }
        i.push(createObjectProperty(y, E));
      }
    } else 3 !== h.type && d.push(h);
  }
  c ||
    ((t = (e, t) => {
      return createObjectProperty("default", o(e, t, n));
    }),
    p
      ? d.length &&
        d.some((e) => isNonWhitespaceContent(e)) &&
        (u
          ? r.onError(createCompilerError(39, d[0].loc))
          : i.push(t(void 0, d)))
      : i.push(t(void 0, s)));
  var C = l ? 2 : hasForwardedSlots(e.children) ? 3 : 1;
  let b = createObjectExpression(
    i.concat(
      createObjectProperty(
        "_",
        createSimpleExpression(C + ` /* ${slotFlagsText[C]} */`, !1)
      )
    ),
    n
  );
  return {
    slots: (b = a.length
      ? createCallExpression(r.helper(CREATE_SLOTS), [
          b,
          createArrayExpression(a),
        ])
      : b),
    hasDynamicSlots: l,
  };
}
function buildDynamicSlot(e, t, n) {
  const r = [createObjectProperty("name", e), createObjectProperty("fn", t)];
  return (
    null != n &&
      r.push(
        createObjectProperty("key", createSimpleExpression(String(n), !0))
      ),
    createObjectExpression(r)
  );
}
function hasForwardedSlots(t) {
  for (let e = 0; e < t.length; e++) {
    var n = t[e];
    switch (n.type) {
      case 1:
        if (2 === n.tagType || hasForwardedSlots(n.children)) return !0;
        break;
      case 9:
        if (hasForwardedSlots(n.branches)) return !0;
        break;
      case 10:
      case 11:
        if (hasForwardedSlots(n.children)) return !0;
    }
  }
  return !1;
}
function isNonWhitespaceContent(e) {
  return (
    (2 !== e.type && 12 !== e.type) ||
    (2 === e.type ? !!e.content.trim() : isNonWhitespaceContent(e.content))
  );
}
const directiveImportMap = new WeakMap(),
  transformElement = (m, h) =>
    function () {
      if (
        1 === (m = h.currentNode).type &&
        (0 === m.tagType || 1 === m.tagType)
      ) {
        var { tag: l, props: c } = m,
          p = 1 === m.tagType,
          u = p ? resolveComponentType(m, h) : `"${l}"`,
          d = isObject(u) && u.callee === RESOLVE_DYNAMIC_COMPONENT;
        let e,
          t,
          n,
          r = 0,
          o,
          s,
          i,
          a =
            d ||
            u === TELEPORT ||
            u === SUSPENSE ||
            (!p && ("svg" === l || "foreignObject" === l));
        if (0 < c.length) {
          var l = buildProps(m, h, void 0, p, d);
          (e = l.props), (r = l.patchFlag), (s = l.dynamicPropNames);
          const f = l.directives;
          (i =
            f && f.length
              ? createArrayExpression(f.map((e) => buildDirectiveArgs(e, h)))
              : void 0),
            l.shouldUseBlock && (a = !0);
        }
        0 < m.children.length &&
          (u === KEEP_ALIVE &&
            ((a = !0),
            (r |= 1024),
            1 < m.children.length &&
              h.onError(
                createCompilerError(46, {
                  start: m.children[0].loc.start,
                  end: m.children[m.children.length - 1].loc.end,
                  source: "",
                })
              )),
          p && u !== TELEPORT && u !== KEEP_ALIVE
            ? (({ slots: c, hasDynamicSlots: d } = buildSlots(m, h)),
              (t = c),
              d && (r |= 1024))
            : (t =
                1 === m.children.length && u !== TELEPORT
                  ? ((d = 5 === (c = (l = m.children[0]).type) || 8 === c) &&
                      0 === getConstantType(l, h) &&
                      (r |= 1),
                    d || 2 === c ? l : m.children)
                  : m.children)),
          0 !== r &&
            ((n =
              r < 0
                ? r + ` /* ${PatchFlagNames[r]} */`
                : ((d = Object.keys(PatchFlagNames)
                    .map(Number)
                    .filter((e) => 0 < e && r & e)
                    .map((e) => PatchFlagNames[e])
                    .join(", ")),
                  r + ` /* ${d} */`)),
            s && s.length && (o = stringifyDynamicPropNames(s))),
          (m.codegenNode = createVNodeCall(
            h,
            u,
            e,
            t,
            n,
            o,
            i,
            !!a,
            !1,
            p,
            m.loc
          ));
      }
    };
function resolveComponentType(e, t, n = !1) {
  let r = e["tag"];
  var o = isComponentTag(r);
  const s = findProp(e, "is");
  if (s)
    if (o) {
      var i =
        6 === s.type
          ? s.value && createSimpleExpression(s.value.content, !0)
          : s.exp;
      if (i)
        return createCallExpression(t.helper(RESOLVE_DYNAMIC_COMPONENT), [i]);
    } else
      6 === s.type &&
        s.value.content.startsWith("vue:") &&
        (r = s.value.content.slice(4));
  i = !o && findDir(e, "is");
  if (i && i.exp)
    return createCallExpression(t.helper(RESOLVE_DYNAMIC_COMPONENT), [i.exp]);
  o = isCoreComponent(r) || t.isBuiltInComponent(r);
  return o
    ? (n || t.helper(o), o)
    : (t.helper(RESOLVE_COMPONENT),
      t.components.add(r),
      toValidAssetId(r, "component"));
}
function buildProps(t, o, n = t.props, r, F, s = !1) {
  const { tag: i, loc: a, children: D } = t;
  let l = [];
  const c = [],
    p = [];
  var u = 0 < D.length;
  let d = !1,
    e = 0,
    f = !1,
    m = !1,
    h = !1,
    g = !1,
    v = !1,
    B = !1;
  const y = [];
  var E = (e) => {
      l.length &&
        (c.push(createObjectExpression(dedupeProperties(l), a)), (l = [])),
        e && c.push(e);
    },
    $ = ({ key: e, value: t }) => {
      if (isStaticExp(e)) {
        const n = e.content;
        e = isOn(n);
        !e ||
          (r && !F) ||
          "onclick" === n.toLowerCase() ||
          "onUpdate:modelValue" === n ||
          isReservedProp(n) ||
          (g = !0),
          e && isReservedProp(n) && (B = !0),
          20 === t.type ||
            ((4 === t.type || 8 === t.type) && 0 < getConstantType(t, o)) ||
            ("ref" === n
              ? (f = !0)
              : "class" === n
              ? (m = !0)
              : "style" === n
              ? (h = !0)
              : "key" === n || y.includes(n) || y.push(n),
            !r ||
              ("class" !== n && "style" !== n) ||
              y.includes(n) ||
              y.push(n));
      } else v = !0;
    };
  for (let e = 0; e < n.length; e++) {
    var S = n[e];
    if (6 === S.type) {
      const { loc: k, name: N, value: I } = S;
      "ref" === N &&
        ((f = !0),
        0 < o.scopes.vFor &&
          l.push(
            createObjectProperty(
              createSimpleExpression("ref_for", !0),
              createSimpleExpression("true")
            )
          )),
        ("is" === N &&
          (isComponentTag(i) || (I && I.content.startsWith("vue:")))) ||
          l.push(
            createObjectProperty(
              createSimpleExpression(N, !0, getInnerRange(k, 0, N.length)),
              createSimpleExpression(I ? I.content : "", !0, I ? I.loc : k)
            )
          );
    } else {
      var { name: C, arg: b, exp: T, loc: _ } = S,
        w = "bind" === C,
        x = "on" === C;
      if ("slot" === C) r || o.onError(createCompilerError(40, _));
      else if (
        "once" !== C &&
        "memo" !== C &&
        !(
          "is" === C ||
          (w && isStaticArgOf(b, "is") && isComponentTag(i)) ||
          (x && s)
        )
      )
        if (
          (((w && isStaticArgOf(b, "key")) ||
            (x && u && isStaticArgOf(b, "vue:before-update"))) &&
            (d = !0),
          w &&
            isStaticArgOf(b, "ref") &&
            0 < o.scopes.vFor &&
            l.push(
              createObjectProperty(
                createSimpleExpression("ref_for", !0),
                createSimpleExpression("true")
              )
            ),
          b || (!w && !x))
        ) {
          const A = o.directiveTransforms[C];
          if (A) {
            const { props: n, needRuntime: P } = A(S, t, o);
            s || n.forEach($),
              x && b && !isStaticExp(b)
                ? E(createObjectExpression(n, a))
                : l.push(...n),
              P && (p.push(S), isSymbol(P) && directiveImportMap.set(S, P));
          } else isBuiltInDirective(C) || (p.push(S), u && (d = !0));
        } else
          (v = !0),
            T
              ? w
                ? (E(), c.push(T))
                : E({
                    type: 14,
                    loc: _,
                    callee: o.helper(TO_HANDLERS),
                    arguments: r ? [T] : [T, "true"],
                  })
              : o.onError(createCompilerError(w ? 34 : 35, _));
    }
  }
  let R = void 0;
  if (
    (c.length
      ? (E(),
        (R =
          1 < c.length
            ? createCallExpression(o.helper(MERGE_PROPS), c, a)
            : c[0]))
      : l.length && (R = createObjectExpression(dedupeProperties(l), a)),
    v
      ? (e |= 16)
      : (m && !r && (e |= 2),
        h && !r && (e |= 4),
        y.length && (e |= 8),
        g && (e |= 32)),
    d || (0 !== e && 32 !== e) || !(f || B || 0 < p.length) || (e |= 512),
    !o.inSSR && R)
  )
    switch (R.type) {
      case 15:
        let t = -1,
          n = -1,
          r = !1;
        for (let e = 0; e < R.properties.length; e++) {
          var O = R.properties[e].key;
          isStaticExp(O)
            ? "class" === O.content
              ? (t = e)
              : "style" === O.content && (n = e)
            : O.isHandlerKey || (r = !0);
        }
        const M = R.properties[t],
          V = R.properties[n];
        r
          ? (R = createCallExpression(o.helper(NORMALIZE_PROPS), [R]))
          : (M &&
              !isStaticExp(M.value) &&
              (M.value = createCallExpression(o.helper(NORMALIZE_CLASS), [
                M.value,
              ])),
            V &&
              (h ||
                (4 === V.value.type && "[" === V.value.content.trim()[0]) ||
                17 === V.value.type) &&
              (V.value = createCallExpression(o.helper(NORMALIZE_STYLE), [
                V.value,
              ])));
        break;
      case 14:
        break;
      default:
        R = createCallExpression(o.helper(NORMALIZE_PROPS), [
          createCallExpression(o.helper(GUARD_REACTIVE_PROPS), [R]),
        ]);
    }
  return {
    props: R,
    directives: p,
    patchFlag: e,
    dynamicPropNames: y,
    shouldUseBlock: d,
  };
}
function dedupeProperties(t) {
  const n = new Map(),
    r = [];
  for (let e = 0; e < t.length; e++) {
    var o,
      s,
      i = t[e];
    8 !== i.key.type && i.key.isStatic
      ? ((o = i.key.content),
        (s = n.get(o))
          ? ("style" !== o && "class" !== o && !isOn(o)) || mergeAsArray$1(s, i)
          : (n.set(o, i), r.push(i)))
      : r.push(i);
  }
  return r;
}
function mergeAsArray$1(e, t) {
  17 === e.value.type
    ? e.value.elements.push(t.value)
    : (e.value = createArrayExpression([e.value, t.value], e.loc));
}
function buildDirectiveArgs(e, t) {
  const n = [];
  var r = directiveImportMap.get(e),
    r = (r
      ? n.push(t.helperString(r))
      : (t.helper(RESOLVE_DIRECTIVE),
        t.directives.add(e.name),
        n.push(toValidAssetId(e.name, "directive"))),
    e)["loc"];
  if (
    (e.exp && n.push(e.exp),
    e.arg && (e.exp || n.push("void 0"), n.push(e.arg)),
    Object.keys(e.modifiers).length)
  ) {
    e.arg || (e.exp || n.push("void 0"), n.push("void 0"));
    const o = createSimpleExpression("true", !1, r);
    n.push(
      createObjectExpression(
        e.modifiers.map((e) => createObjectProperty(e, o)),
        r
      )
    );
  }
  return createArrayExpression(n, e.loc);
}
function stringifyDynamicPropNames(n) {
  let r = "[";
  for (let e = 0, t = n.length; e < t; e++)
    (r += JSON.stringify(n[e])), e < t - 1 && (r += ", ");
  return r + "]";
}
function isComponentTag(e) {
  return "component" === e || "Component" === e;
}
const transformSlotOutlet = (t, n) => {
  if (isSlotOutlet(t)) {
    var { children: r, loc: o } = t,
      { slotName: s, slotProps: i } = processSlotOutlet(t, n);
    const a = [
      n.prefixIdentifiers ? "_ctx.$slots" : "$slots",
      s,
      "{}",
      "undefined",
      "true",
    ];
    let e = 2;
    i && ((a[2] = i), (e = 3)),
      r.length &&
        ((a[3] = createFunctionExpression([], r, !1, !1, o)), (e = 4)),
      n.scopeId && !n.slotted && (e = 5),
      a.splice(e),
      (t.codegenNode = createCallExpression(n.helper(RENDER_SLOT), a, o));
  }
};
function processSlotOutlet(t, e) {
  let n = '"default"',
    r = void 0;
  const o = [];
  for (let e = 0; e < t.props.length; e++) {
    const a = t.props[e];
    6 === a.type
      ? a.value &&
        ("name" === a.name
          ? (n = JSON.stringify(a.value.content))
          : ((a.name = camelize(a.name)), o.push(a)))
      : "bind" === a.name && isStaticArgOf(a.arg, "name")
      ? a.exp && (n = a.exp)
      : ("bind" === a.name &&
          a.arg &&
          isStaticExp(a.arg) &&
          (a.arg.content = camelize(a.arg.content)),
        o.push(a));
  }
  var s, i;
  return (
    0 < o.length &&
      (({ props: s, directives: i } = buildProps(t, e, o, !1, !1)),
      (r = s),
      i.length && e.onError(createCompilerError(36, i[0].loc))),
    { slotName: n, slotProps: r }
  );
}
const fnExpRE =
    /^\s*([\w$_]+|(async\s*)?\([^)]*?\))\s*(:[^=]+)?=>|^\s*(async\s+)?function(?:\s+[\w$]+)?\s*\(/,
  transformOn = (e, t, n, r) => {
    var { loc: o, modifiers: s, arg: i } = e;
    e.exp || s.length || n.onError(createCompilerError(35, o));
    let a;
    if (4 === i.type)
      if (i.isStatic) {
        let e = i.content;
        e.startsWith("vue:") && (e = "vnode-" + e.slice(4));
        s =
          0 !== t.tagType || e.startsWith("vnode") || !/[A-Z]/.test(e)
            ? toHandlerKey(camelize(e))
            : "on:" + e;
        a = createSimpleExpression(s, !0, i.loc);
      } else
        a = createCompoundExpression([
          n.helperString(TO_HANDLER_KEY) + "(",
          i,
          ")",
        ]);
    else
      (a = i).children.unshift(n.helperString(TO_HANDLER_KEY) + "("),
        a.children.push(")");
    let l = e.exp;
    l && !l.content.trim() && (l = void 0);
    t = n.cacheHandlers && !l && !n.inVOnce;
    l &&
      ((i = !((s = isMemberExpression(l.content)) || fnExpRE.test(l.content))),
      (e = l.content.includes(";")),
      validateBrowserExpression(l, n, !1, e),
      (i || (t && s)) &&
        (l = createCompoundExpression([
          `${i ? "$event" : "(...args)"} => ` + (e ? "{" : "("),
          l,
          e ? "}" : ")",
        ])));
    let c = {
      props: [
        createObjectProperty(a, l || createSimpleExpression("() => {}", !1, o)),
      ],
    };
    return (
      r && (c = r(c)),
      t && (c.props[0].value = n.cache(c.props[0].value)),
      c.props.forEach((e) => (e.key.isHandlerKey = !0)),
      c
    );
  },
  transformBind = (e, t, n) => {
    const { exp: r, modifiers: o, loc: s } = e,
      i = e.arg;
    return (
      4 !== i.type
        ? (i.children.unshift("("), i.children.push(') || ""'))
        : i.isStatic || (i.content = i.content + ' || ""'),
      o.includes("camel") &&
        (4 === i.type
          ? i.isStatic
            ? (i.content = camelize(i.content))
            : (i.content = `${n.helperString(CAMELIZE)}(${i.content})`)
          : (i.children.unshift(n.helperString(CAMELIZE) + "("),
            i.children.push(")"))),
      n.inSSR ||
        (o.includes("prop") && injectPrefix(i, "."),
        o.includes("attr") && injectPrefix(i, "^")),
      !r || (4 === r.type && !r.content.trim())
        ? (n.onError(createCompilerError(34, s)),
          {
            props: [createObjectProperty(i, createSimpleExpression("", !0, s))],
          })
        : { props: [createObjectProperty(i, r)] }
    );
  },
  injectPrefix = (e, t) => {
    4 === e.type
      ? e.isStatic
        ? (e.content = t + e.content)
        : (e.content = `\`${t}\${${e.content}}\``)
      : (e.children.unshift(`'${t}' + (`), e.children.push(")"));
  },
  transformText = (a, l) => {
    if (0 === a.type || 1 === a.type || 11 === a.type || 10 === a.type)
      return () => {
        const n = a.children;
        let r = void 0,
          e = !1;
        for (let t = 0; t < n.length; t++) {
          var o = n[t];
          if (isText(o)) {
            e = !0;
            for (let e = t + 1; e < n.length; e++) {
              var s = n[e];
              if (!isText(s)) {
                r = void 0;
                break;
              }
              (r =
                r ||
                (n[t] = createCompoundExpression([o], o.loc))).children.push(
                " + ",
                s
              ),
                n.splice(e, 1),
                e--;
            }
          }
        }
        if (
          e &&
          (1 !== n.length ||
            (0 !== a.type &&
              (1 !== a.type ||
                0 !== a.tagType ||
                a.props.find(
                  (e) => 7 === e.type && !l.directiveTransforms[e.name]
                ))))
        )
          for (let e = 0; e < n.length; e++) {
            var t = n[e];
            if (isText(t) || 8 === t.type) {
              const i = [];
              (2 === t.type && " " === t.content) || i.push(t),
                l.ssr ||
                  0 !== getConstantType(t, l) ||
                  i.push(1 + ` /* ${PatchFlagNames[1]} */`),
                (n[e] = {
                  type: 12,
                  content: t,
                  loc: t.loc,
                  codegenNode: createCallExpression(l.helper(CREATE_TEXT), i),
                });
            }
          }
      };
  },
  seen = new WeakSet(),
  transformOnce = (e, t) => {
    if (1 === e.type && findDir(e, "once", !0) && !seen.has(e) && !t.inVOnce)
      return (
        seen.add(e),
        (t.inVOnce = !0),
        t.helper(SET_BLOCK_TRACKING),
        () => {
          t.inVOnce = !1;
          const e = t.currentNode;
          e.codegenNode && (e.codegenNode = t.cache(e.codegenNode, !0));
        }
      );
  },
  transformModel = (e, t, n) => {
    var { exp: r, arg: o } = e;
    if (!r)
      return n.onError(createCompilerError(41, e.loc)), createTransformProps();
    var s = r.loc.source;
    const i = 4 === r.type ? r.content : s;
    s = n.bindingMetadata[s];
    if ("props" === s || "props-aliased" === s)
      return n.onError(createCompilerError(44, r.loc)), createTransformProps();
    if (!i.trim() || !isMemberExpression(i))
      return n.onError(createCompilerError(42, r.loc)), createTransformProps();
    var s = o || createSimpleExpression("modelValue", !0),
      a = o
        ? isStaticExp(o)
          ? "onUpdate:" + o.content
          : createCompoundExpression(['"onUpdate:" + ', o])
        : "onUpdate:modelValue",
      n = createCompoundExpression([
        (n.isTS ? "($event: any)" : "$event") + " => ((",
        r,
        ") = $event)",
      ]);
    const l = [createObjectProperty(s, e.exp), createObjectProperty(a, n)];
    return (
      e.modifiers.length &&
        1 === t.tagType &&
        ((r = e.modifiers
          .map(
            (e) => (isSimpleIdentifier(e) ? e : JSON.stringify(e)) + ": true"
          )
          .join(", ")),
        (s = o
          ? isStaticExp(o)
            ? o.content + "Modifiers"
            : createCompoundExpression([o, ' + "Modifiers"'])
          : "modelModifiers"),
        l.push(
          createObjectProperty(
            s,
            createSimpleExpression(`{ ${r} }`, !1, e.loc, 2)
          )
        )),
      createTransformProps(l)
    );
  };
function createTransformProps(e = []) {
  return { props: e };
}
const seen$1 = new WeakSet(),
  transformMemo = (t, n) => {
    if (1 === t.type) {
      const r = findDir(t, "memo");
      if (r && !seen$1.has(t))
        return (
          seen$1.add(t),
          () => {
            var e = t.codegenNode || n.currentNode.codegenNode;
            e &&
              13 === e.type &&
              (1 !== t.tagType && makeBlock(e, n),
              (t.codegenNode = createCallExpression(n.helper(WITH_MEMO), [
                r.exp,
                createFunctionExpression(void 0, e),
                "_cache",
                String(n.cached++),
              ])));
          }
        );
    }
  };
function getBaseTransformPreset(e) {
  return [
    [
      transformOnce,
      transformIf,
      transformMemo,
      transformFor,
      transformExpression,
      transformSlotOutlet,
      transformElement,
      trackSlotScopes,
      transformText,
    ],
    { on: transformOn, bind: transformBind, model: transformModel },
  ];
}
function baseCompile(e, t = {}) {
  const n = t.onError || defaultOnError;
  var r = "module" === t.mode,
    r =
      (!0 === t.prefixIdentifiers
        ? n(createCompilerError(47))
        : r && n(createCompilerError(48)),
      t.cacheHandlers && n(createCompilerError(49)),
      t.scopeId && !r && n(createCompilerError(50)),
      isString(e) ? baseParse(e, t) : e),
    [e, o] = getBaseTransformPreset();
  return (
    transform(
      r,
      extend({}, t, {
        prefixIdentifiers: !1,
        nodeTransforms: [...e, ...(t.nodeTransforms || [])],
        directiveTransforms: extend({}, o, t.directiveTransforms || {}),
      })
    ),
    generate(r, extend({}, t, { prefixIdentifiers: !1 }))
  );
}
const noopDirectiveTransform = () => ({ props: [] }),
  V_MODEL_RADIO = Symbol("vModelRadio"),
  V_MODEL_CHECKBOX = Symbol("vModelCheckbox"),
  V_MODEL_TEXT = Symbol("vModelText"),
  V_MODEL_SELECT = Symbol("vModelSelect"),
  V_MODEL_DYNAMIC = Symbol("vModelDynamic"),
  V_ON_WITH_MODIFIERS = Symbol("vOnModifiersGuard"),
  V_ON_WITH_KEYS = Symbol("vOnKeysGuard"),
  V_SHOW = Symbol("vShow"),
  TRANSITION$1 = Symbol("Transition"),
  TRANSITION_GROUP = Symbol("TransitionGroup");
registerRuntimeHelpers({
  [V_MODEL_RADIO]: "vModelRadio",
  [V_MODEL_CHECKBOX]: "vModelCheckbox",
  [V_MODEL_TEXT]: "vModelText",
  [V_MODEL_SELECT]: "vModelSelect",
  [V_MODEL_DYNAMIC]: "vModelDynamic",
  [V_ON_WITH_MODIFIERS]: "withModifiers",
  [V_ON_WITH_KEYS]: "withKeys",
  [V_SHOW]: "vShow",
  [TRANSITION$1]: "Transition",
  [TRANSITION_GROUP]: "TransitionGroup",
});
let decoder;
function decodeHtmlBrowser(e, t = !1) {
  return (
    (decoder = decoder || document.createElement("div")),
    t
      ? ((decoder.innerHTML = `<div foo="${e.replace(/"/g, "&quot;")}">`),
        decoder.children[0].getAttribute("foo"))
      : ((decoder.innerHTML = e), decoder.textContent)
  );
}
const isRawTextContainer = makeMap("style,iframe,script,noscript", !0),
  parserOptions = {
    isVoidTag: isVoidTag,
    isNativeTag: (e) => isHTMLTag(e) || isSVGTag(e),
    isPreTag: (e) => "pre" === e,
    decodeEntities: decodeHtmlBrowser,
    isBuiltInComponent: (e) =>
      isBuiltInType(e, "Transition")
        ? TRANSITION$1
        : isBuiltInType(e, "TransitionGroup")
        ? TRANSITION_GROUP
        : void 0,
    getNamespace(e, t) {
      let n = t ? t.ns : 0;
      if (t && 2 === n)
        if ("annotation-xml" === t.tag) {
          if ("svg" === e) return 1;
          t.props.some(
            (e) =>
              6 === e.type &&
              "encoding" === e.name &&
              null != e.value &&
              ("text/html" === e.value.content ||
                "application/xhtml+xml" === e.value.content)
          ) && (n = 0);
        } else
          /^m(?:[ions]|text)$/.test(t.tag) &&
            "mglyph" !== e &&
            "malignmark" !== e &&
            (n = 0);
      else
        !t ||
          1 !== n ||
          ("foreignObject" !== t.tag &&
            "desc" !== t.tag &&
            "title" !== t.tag) ||
          (n = 0);
      if (0 === n) {
        if ("svg" === e) return 1;
        if ("math" === e) return 2;
      }
      return n;
    },
    getTextMode({ tag: e, ns: t }) {
      if (0 === t) {
        if ("textarea" === e || "title" === e) return 1;
        if (isRawTextContainer(e)) return 2;
      }
      return 0;
    },
  },
  transformStyle = (n) => {
    1 === n.type &&
      n.props.forEach((e, t) => {
        6 === e.type &&
          "style" === e.name &&
          e.value &&
          (n.props[t] = {
            type: 7,
            name: "bind",
            arg: createSimpleExpression("style", !0, e.loc),
            exp: parseInlineCSS(e.value.content, e.loc),
            modifiers: [],
            loc: e.loc,
          });
      });
  },
  parseInlineCSS = (e, t) => {
    e = parseStringStyle(e);
    return createSimpleExpression(JSON.stringify(e), !1, t, 3);
  };
function createDOMCompilerError(e, t) {
  return createCompilerError(e, t, DOMErrorMessages);
}
const DOMErrorMessages = {
    [51]: "v-html is missing expression.",
    52: "v-html will override element children.",
    53: "v-text is missing expression.",
    54: "v-text will override element children.",
    55: "v-model can only be used on <input>, <textarea> and <select> elements.",
    56: "v-model argument is not supported on plain elements.",
    57: "v-model cannot be used on file inputs since they are read-only. Use a v-on:change listener instead.",
    58: "Unnecessary value binding used alongside v-model. It will interfere with v-model's behavior.",
    59: "v-show is missing expression.",
    60: "<Transition> expects exactly one child element or component.",
    61: "Tags with side effect (<script> and <style>) are ignored in client component templates.",
  },
  transformVHtml = (e, t, n) => {
    var { exp: e, loc: r } = e;
    return (
      e || n.onError(createDOMCompilerError(51, r)),
      t.children.length &&
        (n.onError(createDOMCompilerError(52, r)), (t.children.length = 0)),
      {
        props: [
          createObjectProperty(
            createSimpleExpression("innerHTML", !0, r),
            e || createSimpleExpression("", !0)
          ),
        ],
      }
    );
  },
  transformVText = (e, t, n) => {
    var { exp: e, loc: r } = e;
    return (
      e || n.onError(createDOMCompilerError(53, r)),
      t.children.length &&
        (n.onError(createDOMCompilerError(54, r)), (t.children.length = 0)),
      {
        props: [
          createObjectProperty(
            createSimpleExpression("textContent", !0),
            e
              ? 0 < getConstantType(e, n)
                ? e
                : createCallExpression(
                    n.helperString(TO_DISPLAY_STRING),
                    [e],
                    r
                  )
              : createSimpleExpression("", !0)
          ),
        ],
      }
    );
  },
  transformModel$1 = (n, r, o) => {
    const s = transformModel(n, r, o);
    if (!s.props.length || 1 === r.tagType) return s;
    function i() {
      var e = findProp(r, "value");
      e && o.onError(createDOMCompilerError(58, e.loc));
    }
    n.arg && o.onError(createDOMCompilerError(56, n.arg.loc));
    var a = r["tag"],
      l = o.isCustomElement(a);
    if ("input" === a || "textarea" === a || "select" === a || l) {
      let e = V_MODEL_TEXT,
        t = !1;
      if ("input" === a || l) {
        l = findProp(r, "type");
        if (l) {
          if (7 === l.type) e = V_MODEL_DYNAMIC;
          else if (l.value)
            switch (l.value.content) {
              case "radio":
                e = V_MODEL_RADIO;
                break;
              case "checkbox":
                e = V_MODEL_CHECKBOX;
                break;
              case "file":
                (t = !0), o.onError(createDOMCompilerError(57, n.loc));
                break;
              default:
                i();
            }
        } else hasDynamicKeyVBind(r) ? (e = V_MODEL_DYNAMIC) : i();
      } else "select" === a ? (e = V_MODEL_SELECT) : i();
      t || (s.needRuntime = o.helper(e));
    } else o.onError(createDOMCompilerError(55, n.loc));
    return (
      (s.props = s.props.filter(
        (e) => !(4 === e.key.type && "modelValue" === e.key.content)
      )),
      s
    );
  },
  isEventOptionModifier = makeMap("passive,once,capture"),
  isNonKeyModifier = makeMap(
    "stop,prevent,self,ctrl,shift,alt,meta,exact,middle"
  ),
  maybeKeyModifier = makeMap("left,right"),
  isKeyboardEvent = makeMap("onkeyup,onkeydown,onkeypress", !0),
  resolveModifiers = (t, n, e, r) => {
    const o = [],
      s = [],
      i = [];
    for (let e = 0; e < n.length; e++) {
      var a = n[e];
      isEventOptionModifier(a)
        ? i.push(a)
        : maybeKeyModifier(a)
        ? isStaticExp(t)
          ? (isKeyboardEvent(t.content) ? o : s).push(a)
          : (o.push(a), s.push(a))
        : (isNonKeyModifier(a) ? s : o).push(a);
    }
    return { keyModifiers: o, nonKeyModifiers: s, eventOptionModifiers: i };
  },
  transformClick = (e, t) => {
    return isStaticExp(e) && "onclick" === e.content.toLowerCase()
      ? createSimpleExpression(t, !0)
      : 4 !== e.type
      ? createCompoundExpression([
          "(",
          e,
          `) === "onClick" ? "${t}" : (`,
          e,
          ")",
        ])
      : e;
  },
  transformOn$1 = (a, e, l) =>
    transformOn(a, e, l, (e) => {
      var t = a["modifiers"];
      if (!t.length) return e;
      let { key: n, value: r } = e.props[0];
      const {
        keyModifiers: o,
        nonKeyModifiers: s,
        eventOptionModifiers: i,
      } = resolveModifiers(n, t, l, a.loc);
      return (
        s.includes("right") && (n = transformClick(n, "onContextmenu")),
        s.includes("middle") && (n = transformClick(n, "onMouseup")),
        s.length &&
          (r = createCallExpression(l.helper(V_ON_WITH_MODIFIERS), [
            r,
            JSON.stringify(s),
          ])),
        !o.length ||
          (isStaticExp(n) && !isKeyboardEvent(n.content)) ||
          (r = createCallExpression(l.helper(V_ON_WITH_KEYS), [
            r,
            JSON.stringify(o),
          ])),
        i.length &&
          ((e = i.map(capitalize).join("")),
          (n = isStaticExp(n)
            ? createSimpleExpression("" + n.content + e, !0)
            : createCompoundExpression(["(", n, `) + "${e}"`]))),
        { props: [createObjectProperty(n, r)] }
      );
    }),
  transformShow = (e, t, n) => {
    var { exp: e, loc: r } = e;
    return (
      e || n.onError(createDOMCompilerError(59, r)),
      { props: [], needRuntime: n.helper(V_SHOW) }
    );
  },
  transformTransition = (n, r) => {
    if (
      1 === n.type &&
      1 === n.tagType &&
      r.isBuiltInComponent(n.tag) === TRANSITION$1
    )
      return () => {
        if (n.children.length) {
          hasMultipleChildren(n) &&
            r.onError(
              createDOMCompilerError(60, {
                start: n.children[0].loc.start,
                end: n.children[n.children.length - 1].loc.end,
                source: "",
              })
            );
          var e = n.children[0];
          if (1 === e.type)
            for (const t of e.props)
              7 === t.type &&
                "show" === t.name &&
                n.props.push({
                  type: 6,
                  name: "persisted",
                  value: void 0,
                  loc: n.loc,
                });
        }
      };
  };
function hasMultipleChildren(e) {
  e = e.children = e.children.filter(
    (e) => 3 !== e.type && !(2 === e.type && !e.content.trim())
  );
  const t = e[0];
  return (
    1 !== e.length ||
    11 === t.type ||
    (9 === t.type && t.branches.some(hasMultipleChildren))
  );
}
const ignoreSideEffectTags = (e, t) => {
    1 !== e.type ||
      0 !== e.tagType ||
      ("script" !== e.tag && "style" !== e.tag) ||
      (t.onError(createDOMCompilerError(61, e.loc)), t.removeNode());
  },
  DOMNodeTransforms = [transformStyle, transformTransition],
  DOMDirectiveTransforms = {
    cloak: noopDirectiveTransform,
    html: transformVHtml,
    text: transformVText,
    model: transformModel$1,
    on: transformOn$1,
    show: transformShow,
  };
function compile$1(e, t = {}) {
  return baseCompile(
    e,
    extend({}, parserOptions, t, {
      nodeTransforms: [
        ignoreSideEffectTags,
        ...DOMNodeTransforms,
        ...(t.nodeTransforms || []),
      ],
      directiveTransforms: extend(
        {},
        DOMDirectiveTransforms,
        t.directiveTransforms || {}
      ),
      transformHoist: null,
    })
  );
}
initDev();
const compileCache = Object.create(null);
function compileToFunction(n, e) {
  if (!isString(n)) {
    if (!n.nodeType) return warn$1("invalid template option: ", n), NOOP;
    n = n.innerHTML;
  }
  var t = n,
    r = compileCache[t];
  if (r) return r;
  "#" === n[0] &&
    ((r = document.querySelector(n)) ||
      warn$1("Template element not found or is empty: " + n),
    (n = r ? r.innerHTML : ""));
  const o = extend({ hoistStatic: !0, onError: s, onWarn: (e) => s(e, !0) }, e);
  o.isCustomElement ||
    "undefined" == typeof customElements ||
    (o.isCustomElement = (e) => !!customElements.get(e));
  r = compile$1(n, o).code;
  function s(e, t = !1) {
    (t = t ? e.message : "Template compilation error: " + e.message),
      (e = e.loc && generateCodeFrame(n, e.loc.start.offset, e.loc.end.offset));
    warn$1(
      e
        ? t +
            `
` +
            e
        : t
    );
  }
  const i = new Function("Vue", r)(runtimeDom);
  return (i._rc = !0), (compileCache[t] = i);
}
registerRuntimeCompiler(compileToFunction);
export {
  BaseTransition,
  Comment,
  EffectScope,
  Fragment,
  KeepAlive,
  ReactiveEffect,
  Static,
  Suspense,
  Teleport,
  Text,
  Transition,
  TransitionGroup,
  VueElement,
  callWithAsyncErrorHandling,
  callWithErrorHandling,
  camelize,
  capitalize,
  cloneVNode,
  compatUtils,
  compileToFunction as compile,
  computed$1 as computed,
  createApp,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createBaseVNode as createElementVNode,
  createHydrationRenderer,
  createPropsRestProxy,
  createRenderer,
  createSSRApp,
  createSlots,
  createStaticVNode,
  createTextVNode,
  createVNode,
  customRef,
  defineAsyncComponent,
  defineComponent,
  defineCustomElement,
  defineEmits,
  defineExpose,
  defineProps,
  defineSSRCustomElement,
  devtools,
  effect,
  effectScope,
  getCurrentInstance,
  getCurrentScope,
  getTransitionRawChildren,
  guardReactiveProps,
  h,
  handleError,
  hydrate,
  initCustomFormatter,
  initDirectivesForSSR,
  inject,
  isMemoSame,
  isProxy,
  isReactive,
  isReadonly,
  isRef,
  isRuntimeOnly,
  isShallow,
  isVNode,
  markRaw,
  mergeDefaults,
  mergeProps,
  nextTick,
  normalizeClass,
  normalizeProps,
  normalizeStyle,
  onActivated,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onDeactivated,
  onErrorCaptured,
  onMounted,
  onRenderTracked,
  onRenderTriggered,
  onScopeDispose,
  onServerPrefetch,
  onUnmounted,
  onUpdated,
  openBlock,
  popScopeId,
  provide,
  proxyRefs,
  pushScopeId,
  queuePostFlushCb,
  reactive,
  readonly,
  ref,
  registerRuntimeCompiler,
  render,
  renderList,
  renderSlot,
  resolveComponent,
  resolveDirective,
  resolveDynamicComponent,
  resolveFilter,
  resolveTransitionHooks,
  setBlockTracking,
  setDevtoolsHook,
  setTransitionHooks,
  shallowReactive,
  shallowReadonly,
  shallowRef,
  ssrContextKey,
  ssrUtils,
  stop,
  toDisplayString,
  toHandlerKey,
  toHandlers,
  toRaw,
  toRef,
  toRefs,
  transformVNodeArgs,
  triggerRef,
  unref,
  useAttrs,
  useCssModule,
  useCssVars,
  useSSRContext,
  useSlots,
  useTransitionState,
  vModelCheckbox,
  vModelDynamic,
  vModelRadio,
  vModelSelect,
  vModelText,
  vShow,
  version,
  warn$1 as warn,
  watch,
  watchEffect,
  watchPostEffect,
  watchSyncEffect,
  withAsyncContext,
  withCtx,
  withDefaults,
  withDirectives,
  withKeys,
  withMemo,
  withModifiers,
  withScopeId,
};
