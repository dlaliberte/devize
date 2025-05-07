import * as P from "three";
const z = {};
function B(t) {
  z[t.name] && console.warn(`Visualization type '${t.name}' is already registered. It will be overwritten.`), z[t.name] = t;
}
function U(t) {
  return z[t];
}
function J(t) {
  return !!z[t];
}
function st() {
  return Object.values(z);
}
function ut(t) {
  return z[t] ? (delete z[t], !0) : !1;
}
function q(t, e) {
  var n, o, l, s;
  const i = F(e), r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  return r.setAttribute("x", ((n = t.x) == null ? void 0 : n.toString()) || "0"), r.setAttribute("y", ((o = t.y) == null ? void 0 : o.toString()) || "0"), r.setAttribute("width", ((l = t.width) == null ? void 0 : l.toString()) || "0"), r.setAttribute("height", ((s = t.height) == null ? void 0 : s.toString()) || "0"), t.fill && r.setAttribute("fill", t.fill), t.stroke && r.setAttribute("stroke", t.stroke), t.strokeWidth && r.setAttribute("stroke-width", t.strokeWidth.toString()), t.rx && r.setAttribute("rx", t.rx.toString()), t.ry && r.setAttribute("ry", t.ry.toString()), t.opacity && r.setAttribute("opacity", t.opacity.toString()), i.appendChild(r), {
    element: r,
    spec: t
  };
}
function H(t, e) {
  var n, o, l;
  const i = F(e), r = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  return r.setAttribute("cx", ((n = t.cx) == null ? void 0 : n.toString()) || "0"), r.setAttribute("cy", ((o = t.cy) == null ? void 0 : o.toString()) || "0"), r.setAttribute("r", ((l = t.r) == null ? void 0 : l.toString()) || "0"), t.fill && r.setAttribute("fill", t.fill), t.stroke && r.setAttribute("stroke", t.stroke), t.strokeWidth && r.setAttribute("stroke-width", t.strokeWidth.toString()), t.opacity && r.setAttribute("opacity", t.opacity.toString()), i.appendChild(r), {
    element: r,
    spec: t
  };
}
function j(t, e) {
  var n, o, l, s;
  const i = F(e), r = document.createElementNS("http://www.w3.org/2000/svg", "line");
  return r.setAttribute("x1", ((n = t.x1) == null ? void 0 : n.toString()) || "0"), r.setAttribute("y1", ((o = t.y1) == null ? void 0 : o.toString()) || "0"), r.setAttribute("x2", ((l = t.x2) == null ? void 0 : l.toString()) || "0"), r.setAttribute("y2", ((s = t.y2) == null ? void 0 : s.toString()) || "0"), t.stroke && r.setAttribute("stroke", t.stroke), t.strokeWidth && r.setAttribute("stroke-width", t.strokeWidth.toString()), t.strokeDasharray && r.setAttribute("stroke-dasharray", t.strokeDasharray), t.opacity && r.setAttribute("opacity", t.opacity.toString()), i.appendChild(r), {
    element: r,
    spec: t
  };
}
function O(t, e) {
  var n, o;
  const i = F(e), r = document.createElementNS("http://www.w3.org/2000/svg", "text");
  return r.setAttribute("x", ((n = t.x) == null ? void 0 : n.toString()) || "0"), r.setAttribute("y", ((o = t.y) == null ? void 0 : o.toString()) || "0"), t.fill && r.setAttribute("fill", t.fill), t.fontSize && r.setAttribute("font-size", t.fontSize), t.fontFamily && r.setAttribute("font-family", t.fontFamily), t.fontWeight && r.setAttribute("font-weight", t.fontWeight), t.textAnchor && r.setAttribute("text-anchor", t.textAnchor), t.dominantBaseline && r.setAttribute("dominant-baseline", t.dominantBaseline), t.opacity && r.setAttribute("opacity", t.opacity.toString()), t.transform && r.setAttribute("transform", t.transform), r.textContent = t.text || "", i.appendChild(r), {
    element: r,
    spec: t
  };
}
function ct(t, e) {
  const i = F(e), r = document.createElementNS("http://www.w3.org/2000/svg", "path");
  return t.d && r.setAttribute("d", t.d), t.fill && r.setAttribute("fill", t.fill), t.stroke && r.setAttribute("stroke", t.stroke), t.strokeWidth && r.setAttribute("stroke-width", t.strokeWidth.toString()), t.strokeDasharray && r.setAttribute("stroke-dasharray", t.strokeDasharray), t.opacity && r.setAttribute("opacity", t.opacity.toString()), i.appendChild(r), {
    element: r,
    spec: t
  };
}
function L(t, e) {
  const i = F(e), r = document.createElementNS("http://www.w3.org/2000/svg", "g");
  t.transform && r.setAttribute("transform", t.transform), t.opacity && r.setAttribute("opacity", t.opacity.toString()), t.id && r.setAttribute("id", t.id), t.className && r.setAttribute("class", t.className), i.appendChild(r);
  const n = [];
  if (t.children && Array.isArray(t.children))
    for (const o of t.children) {
      const s = $(o, {
        querySelector: () => i,
        appendChild: () => {
        }
        // No-op since we're using the existing SVG
      });
      s && s.element && (n.push(s), r.appendChild(s.element));
    }
  return {
    element: r,
    spec: t,
    children: n
  };
}
function ft(t, e) {
  const i = F(e), r = document.createElementNS("http://www.w3.org/2000/svg", "g");
  t.transform && r.setAttribute("transform", t.transform), i.appendChild(r);
  const n = Array.isArray(t.data) ? t.data : [], o = [];
  return n.forEach((l, s) => {
    let f;
    if (typeof t.template == "function" ? f = t.template(l, s, n) : t.template && (f = JSON.parse(JSON.stringify(t.template)), f._data = l, f._index = s), !f)
      return;
    const a = $(f, {
      querySelector: () => i,
      appendChild: () => {
      }
      // No-op since we're using the existing SVG
    });
    a && a.element && (o.push(a), r.appendChild(a.element), a.element._data = l, a.element._index = s, t.keyField && l[t.keyField] !== void 0 && (a.element._key = l[t.keyField]));
  }), {
    element: r,
    spec: t,
    children: o
  };
}
function $(t, e) {
  if (!t.type)
    throw new Error("Visualization spec must have a type");
  switch (t.type) {
    case "rectangle":
      return q(t, e);
    case "circle":
      return H(t, e);
    case "line":
      return j(t, e);
    case "text":
      return O(t, e);
    case "group":
      return L(t, e);
  }
  if (!J(t.type))
    throw new Error(`Unknown visualization type: ${t.type}`);
  const i = U(t.type);
  for (const l of i.requiredProps)
    if (!(l in t))
      throw new Error(`Missing required property: ${l} for type ${t.type}`);
  if (i.optionalProps)
    for (const [l, s] of Object.entries(i.optionalProps))
      l in t || (t[l] = s);
  const r = i.generateConstraints(t, { container: e }), n = X(r), o = i.decompose(t, n);
  return Y(o, e);
}
function ht(t, e) {
  if (!t || !t.element || !t.spec)
    throw new Error("Invalid visualization instance");
  const i = t.element.parentElement;
  if (!i)
    throw new Error("Visualization element has no parent");
  return i.removeChild(t.element), $({ ...t.spec, ...e }, i);
}
function X(t, e) {
  const i = t.find((r) => r.type === "fitToContainer");
  if (i && i.container) {
    const r = i.container;
    return {
      width: r.clientWidth,
      height: r.clientHeight
    };
  }
  return { width: 800, height: 400 };
}
function Y(t, e) {
  return t.type.includes("3d") || t.dimensions === 3 ? K(t, e) : I(t, e);
}
function I(t, e) {
  let i = e.querySelector("svg");
  switch (i || (i = document.createElementNS("http://www.w3.org/2000/svg", "svg"), i.setAttribute("width", "100%"), i.setAttribute("height", "100%"), e.appendChild(i)), t.type) {
    case "rectangle":
      return q(t, e);
    case "circle":
      return H(t, e);
    case "line":
      return j(t, e);
    case "text":
      return O(t, e);
    case "group":
      return L(t, e);
    default:
      throw new Error(`Unknown visualization type: ${t.type}`);
  }
}
function K(t, e) {
  const i = new P.Scene(), r = new P.PerspectiveCamera(75, e.clientWidth / e.clientHeight, 0.1, 1e3), n = new P.WebGLRenderer({ antialias: !0 });
  n.setSize(e.clientWidth, e.clientHeight), e.appendChild(n.domElement), r.position.z = 5;
  function o() {
    requestAnimationFrame(o), n.render(i, r);
  }
  return o(), window.addEventListener("resize", () => {
    r.aspect = e.clientWidth / e.clientHeight, r.updateProjectionMatrix(), n.setSize(e.clientWidth, e.clientHeight);
  }), {
    element: n.domElement,
    spec: t,
    // Add Three.js specific properties
    scene: i,
    camera: r,
    renderer: n
  };
}
function F(t) {
  let e = t.querySelector("svg");
  return e || (e = document.createElementNS("http://www.w3.org/2000/svg", "svg"), e.setAttribute("width", "100%"), e.setAttribute("height", "100%"), t.appendChild(e)), e;
}
function Q(t, e) {
  if (!e.test)
    return t;
  let i;
  if (typeof e.test == "string")
    i = new Function("d", `return ${e.test}`);
  else if (typeof e.test == "function")
    i = e.test;
  else
    return t;
  return t.filter((r) => i(r));
}
function Z(t, e) {
  if (!e.field)
    return t;
  const i = e.field;
  return [...t].sort((r, n) => {
    const o = r[i], l = n[i];
    return (e.order === "descending" ? -1 : 1) * (o - l);
  });
}
function tt(t, e) {
  if (!e.groupBy || !e.ops || !e.fields)
    return t;
  const i = e.groupBy, r = Array.isArray(e.ops) ? e.ops : [e.ops], n = Array.isArray(e.fields) ? e.fields : [e.fields], o = {};
  return t.forEach((l) => {
    const s = String(l[i]);
    o[s] || (o[s] = []), o[s].push(l);
  }), Object.entries(o).map(([l, s]) => {
    const f = { [i]: l };
    return r.forEach((u, a) => {
      const h = n[a], y = s.map((p) => p[h]);
      switch (u) {
        case "sum":
          f[`sum_${h}`] = y.reduce((p, d) => p + d, 0);
          break;
        case "avg":
          f[`avg_${h}`] = y.reduce((p, d) => p + d, 0) / y.length;
          break;
        case "min":
          f[`min_${h}`] = Math.min(...y);
          break;
        case "max":
          f[`max_${h}`] = Math.max(...y);
          break;
        case "count":
          f[`count_${h}`] = y.length;
          break;
      }
    }), f;
  });
}
function et(t, e) {
  if (!e.expr || !e.as)
    return t;
  let i;
  if (typeof e.expr == "string")
    i = new Function("d", `return ${e.expr}`);
  else if (typeof e.expr == "function")
    i = e.expr;
  else
    return t;
  return t.map((r) => {
    const n = { ...r };
    return n[e.as] = i(r), n;
  });
}
function rt(t, e) {
  if (!e.field || !e.bins || !e.as)
    return t;
  const i = e.field, r = e.bins, n = e.as;
  let o, l, s;
  Array.isArray(n) ? [o, l, s] = n : (o = `${n}_start`, l = `${n}_end`, s = `${n}_count`);
  const f = t.map((d) => d[i]), u = Math.min(...f), y = (Math.max(...f) - u) / r, p = {};
  for (let d = 0; d < r; d++)
    p[d] = 0;
  return t.forEach((d) => {
    const m = d[i], b = Math.min(Math.floor((m - u) / y), r - 1);
    p[b]++;
  }), Object.entries(p).map(([d, m]) => {
    const b = parseInt(d), S = u + b * y, C = u + (b + 1) * y, g = {};
    return g[o] = S, g[l] = C, g[s] = m, g;
  });
}
function it(t, e) {
  if (!e.from || !e.lookup || !e.as)
    return t;
  const i = e.from.values, r = e.lookup, n = e.from.key, o = Array.isArray(e.as) ? e.as : [e.as], l = /* @__PURE__ */ new Map();
  return i.forEach((s) => {
    l.set(s[n], s);
  }), t.map((s) => {
    const f = { ...s }, u = s[r], a = l.get(u);
    return a && (o.length === 1 && o[0] === "*" ? Object.entries(a).forEach(([h, y]) => {
      h !== n && (f[h] = y);
    }) : o.forEach((h) => {
      if (typeof h == "string")
        f[h] = a[h];
      else if (typeof h == "object" && h !== null) {
        const y = h;
        if ("source" in y && "target" in y) {
          const p = y.source, d = y.target;
          f[d] = a[p];
        }
      }
    })), f;
  });
}
function nt(t, e) {
  if (!e.groupBy || !e.field || !e.as)
    return t;
  const i = e.groupBy, r = e.field;
  let n, o;
  Array.isArray(e.as) ? [n, o] = e.as : (n = `${e.as}_start`, o = `${e.as}_end`);
  const l = e.offset || "zero", s = /* @__PURE__ */ new Map();
  return t.forEach((f) => {
    const u = String(f[i]);
    s.has(u) || s.set(u, []), s.get(u).push(f);
  }), s.forEach((f) => {
    let u = 0;
    f.forEach((a) => {
      const h = a[r] || 0;
      if (l === "zero")
        a[n] = u, u += h, a[o] = u;
      else if (l === "normalize") {
        const y = f.reduce((p, d) => p + (d[r] || 0), 0);
        y === 0 ? (a[n] = 0, a[o] = 0) : (a[n] = u, u += h / y, a[o] = u);
      } else if (l === "center") {
        const p = -f.reduce((d, m) => d + (m[r] || 0), 0) / 2;
        a[n] = p + u, u += h, a[o] = p + u;
      }
    });
  }), t;
}
function ot(t, e) {
  if (!e || !e.type)
    return t;
  switch (e.type) {
    case "filter":
      return Q(t, e);
    case "sort":
      return Z(t, e);
    case "aggregate":
      return tt(t, e);
    case "formula":
      return et(t, e);
    case "bin":
      return rt(t, e);
    case "lookup":
      return it(t, e);
    case "stack":
      return nt(t, e);
    default:
      return console.warn(`Unknown transform type: ${e.type}`), t;
  }
}
function R(t, e) {
  if (!e || !Array.isArray(e) || e.length === 0)
    return t;
  let i = [...t];
  for (const r of e)
    i = ot(i, r);
  return i;
}
function lt() {
  B({
    name: "barChart",
    requiredProps: ["data", "x", "y"],
    optionalProps: {
      color: "#3366CC",
      margin: { top: 40, right: 30, bottom: 60, left: 60 },
      tooltip: !1,
      title: ""
    },
    generateConstraints(t, e) {
      return [{ type: "fitToContainer", container: e.container }];
    },
    decompose(t, e) {
      const i = t.margin || { top: 40, right: 30, bottom: 60, left: 60 }, r = {
        type: "group",
        transform: `translate(${i.left}, ${i.top})`,
        children: []
      };
      let n = Array.isArray(t.data) ? [...t.data] : [];
      t.transforms && Array.isArray(t.transforms) && (n = R(n, t.transforms));
      const o = t.x.field, l = t.y.field, s = e.width || 800, f = e.height || 400, u = s - i.left - i.right, a = f - i.top - i.bottom, h = (g) => g * (u / n.length) + u / n.length * 0.5, y = n.map((g) => g[l]), p = Math.max(...y, 0), d = (g) => a - g / p * a;
      let m, b, S = [];
      const C = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];
      if (typeof t.color == "string")
        m = () => t.color;
      else if (t.color && t.color.field) {
        b = t.color.field, S = [...new Set(n.map((A) => A[b]))];
        const g = {};
        S.forEach((A, k) => {
          g[A] = C[k % C.length];
        }), m = (A) => g[A[b]];
      } else
        m = () => "#3366CC";
      if (r.children.push({
        type: "line",
        x1: 0,
        y1: a,
        x2: u,
        y2: a,
        stroke: "#333",
        strokeWidth: 1
      }), r.children.push({
        type: "text",
        x: u / 2,
        y: a + 40,
        text: o,
        fontSize: "14px",
        fontFamily: "Arial",
        fill: "#333",
        textAnchor: "middle"
      }), r.children.push({
        type: "line",
        x1: 0,
        y1: 0,
        x2: 0,
        y2: a,
        stroke: "#333",
        strokeWidth: 1
      }), r.children.push({
        type: "text",
        x: -a / 2,
        y: -40,
        text: l,
        fontSize: "14px",
        fontFamily: "Arial",
        fill: "#333",
        textAnchor: "middle",
        transform: "rotate(-90)"
      }), n.forEach((g, A) => {
        const k = u / n.length * 0.8, D = a - d(g[l]), v = h(A) - k / 2, E = d(g[l]);
        r.children.push({
          type: "rectangle",
          x: v,
          y: E,
          width: k,
          height: D,
          fill: m(g, A),
          stroke: "#fff",
          strokeWidth: 1,
          data: g,
          tooltip: !!t.tooltip
        }), r.children.push({
          type: "line",
          x1: h(A),
          y1: a,
          x2: h(A),
          y2: a + 5,
          stroke: "#333",
          strokeWidth: 1
        }), r.children.push({
          type: "text",
          x: h(A),
          y: a + 20,
          text: g[o],
          fontSize: "12px",
          fontFamily: "Arial",
          fill: "#333",
          textAnchor: "middle"
        });
      }), t.title && r.children.push({
        type: "text",
        x: u / 2,
        y: -10,
        text: t.title,
        fontSize: "16px",
        fontFamily: "Arial",
        fontWeight: "bold",
        fill: "#333",
        textAnchor: "middle"
      }), b && S.length > 0) {
        const g = {
          type: "group",
          transform: `translate(${u - 120}, 0)`,
          children: []
        };
        S.forEach((A, k) => {
          g.children.push({
            type: "rectangle",
            x: 0,
            y: k * 20,
            width: 12,
            height: 12,
            fill: C[k % C.length]
          }), g.children.push({
            type: "text",
            x: 20,
            y: k * 20 + 10,
            text: A,
            fontSize: "12px",
            fontFamily: "Arial",
            fill: "#333"
          });
        }), r.children.push(g);
      }
      return r;
    }
  });
}
function dt(t, e) {
  return lt(), $(t, e);
}
function at() {
  B({
    name: "scatterPlot",
    requiredProps: ["data", "x", "y"],
    optionalProps: {
      color: "#3366CC",
      size: 5,
      margin: { top: 40, right: 30, bottom: 60, left: 60 },
      tooltip: !1,
      title: "",
      grid: !1
    },
    generateConstraints(t, e) {
      return [{ type: "fitToContainer", container: e.container }];
    },
    decompose(t, e) {
      const i = t.margin || { top: 40, right: 30, bottom: 60, left: 60 }, r = {
        type: "group",
        transform: `translate(${i.left}, ${i.top})`,
        children: []
      };
      let n = Array.isArray(t.data) ? [...t.data] : [];
      t.transforms && Array.isArray(t.transforms) && (n = R(n, t.transforms));
      const o = t.x.field, l = t.y.field, s = e.width || 800, f = e.height || 400, u = s - i.left - i.right, a = f - i.top - i.bottom, h = n.map((c) => c[o]), y = n.map((c) => c[l]), p = Math.min(...h), d = Math.max(...h), m = Math.min(...y), b = Math.max(...y), S = p - (d - p) * 0.05, C = d + (d - p) * 0.05, g = m - (b - m) * 0.05, A = b + (b - m) * 0.05, k = (c) => (c - S) / (C - S) * u, D = (c) => a - (c - g) / (A - g) * a;
      let v, E, _ = [];
      const V = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];
      if (typeof t.color == "string")
        v = () => t.color;
      else if (t.color && t.color.field) {
        E = t.color.field, _ = [...new Set(n.map((x) => x[E]))];
        const c = {};
        _.forEach((x, w) => {
          c[x] = V[w % V.length];
        }), v = (x) => c[x[E]];
      } else
        v = () => "#3366CC";
      let T, N;
      if (typeof t.size == "number")
        T = () => t.size;
      else if (t.size && t.size.field) {
        N = t.size.field;
        const c = n.map((W) => W[N]), x = Math.min(...c), w = Math.max(...c), M = t.size.range || [5, 20];
        T = (W) => {
          const G = (W[N] - x) / (w - x);
          return M[0] + G * (M[1] - M[0]);
        };
      } else
        T = () => 5;
      if (t.grid) {
        for (let c = 0; c <= 5; c++) {
          const x = c * a / 5;
          r.children.push({
            type: "line",
            x1: 0,
            y1: x,
            x2: u,
            y2: x,
            stroke: "#ddd",
            strokeWidth: 1,
            strokeDasharray: "3,3"
          });
          const w = m + (5 - c) * (b - m) / 5;
          r.children.push({
            type: "text",
            x: -10,
            y: x,
            text: w.toLocaleString(),
            fontSize: "10px",
            fontFamily: "Arial",
            fill: "#666",
            textAnchor: "end",
            dominantBaseline: "middle"
          });
        }
        for (let c = 0; c <= 5; c++) {
          const x = c * u / 5;
          r.children.push({
            type: "line",
            x1: x,
            y1: 0,
            x2: x,
            y2: a,
            stroke: "#ddd",
            strokeWidth: 1,
            strokeDasharray: "3,3"
          });
          const w = p + c * (d - p) / 5;
          r.children.push({
            type: "text",
            x,
            y: a + 15,
            text: w.toLocaleString(),
            fontSize: "10px",
            fontFamily: "Arial",
            fill: "#666",
            textAnchor: "middle"
          });
        }
      }
      if (r.children.push({
        type: "line",
        x1: 0,
        y1: a,
        x2: u,
        y2: a,
        stroke: "#333",
        strokeWidth: 1
      }), r.children.push({
        type: "text",
        x: u / 2,
        y: a + 40,
        text: o,
        fontSize: "14px",
        fontFamily: "Arial",
        fill: "#333",
        textAnchor: "middle"
      }), r.children.push({
        type: "line",
        x1: 0,
        y1: 0,
        x2: 0,
        y2: a,
        stroke: "#333",
        strokeWidth: 1
      }), r.children.push({
        type: "text",
        x: -a / 2,
        y: -40,
        text: l,
        fontSize: "14px",
        fontFamily: "Arial",
        fill: "#333",
        textAnchor: "middle",
        transform: "rotate(-90)"
      }), n.forEach((c, x) => {
        const w = k(c[o]), M = D(c[l]), W = T(c, x);
        r.children.push({
          type: "circle",
          cx: w,
          cy: M,
          r: W,
          fill: v(c, x),
          stroke: "#fff",
          strokeWidth: 1,
          opacity: 0.7,
          data: c,
          tooltip: !!t.tooltip
        });
      }), t.title && r.children.push({
        type: "text",
        x: u / 2,
        y: -10,
        text: t.title,
        fontSize: "16px",
        fontFamily: "Arial",
        fontWeight: "bold",
        fill: "#333",
        textAnchor: "middle"
      }), E && _.length > 0) {
        const c = {
          type: "group",
          transform: `translate(${u - 120}, 0)`,
          children: []
        };
        _.forEach((x, w) => {
          c.children.push({
            type: "circle",
            cx: 6,
            cy: w * 20 + 6,
            r: 6,
            fill: V[w % V.length],
            opacity: 0.7
          }), c.children.push({
            type: "text",
            x: 20,
            y: w * 20 + 10,
            text: x,
            fontSize: "12px",
            fontFamily: "Arial",
            fill: "#333"
          });
        }), r.children.push(c);
      }
      return r;
    }
  });
}
function yt(t, e) {
  return at(), $(t, e);
}
export {
  dt as createBarChart,
  H as createCircle,
  ft as createDataMap,
  L as createGroup,
  j as createLine,
  ct as createPath,
  q as createRectangle,
  yt as createScatterPlot,
  O as createText,
  $ as buildViz,
  F as ensureSvg,
  st as getAllTypes,
  U as getType,
  J as hasType,
  lt as registerBarChartType,
  at as registerScatterPlotType,
  B as registerType,
  ut as removeType,
  ht as updateViz
};
