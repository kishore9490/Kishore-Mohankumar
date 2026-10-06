"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Idea } from "@/data/profile";

type V = [number, number, number];
type Shape = { v: V[]; e: [number, number][] };

const PHI = (1 + Math.sqrt(5)) / 2;

function edgesByDistance(v: V[], d: number, eps = 0.01): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < v.length; i++)
    for (let j = i + 1; j < v.length; j++) {
      const dist = Math.hypot(v[i][0] - v[j][0], v[i][1] - v[j][1], v[i][2] - v[j][2]);
      if (Math.abs(dist - d) < eps) out.push([i, j]);
    }
  return out;
}

function build(shape: Idea["shape"]): Shape {
  switch (shape) {
    case "icosa": {
      const v: V[] = [];
      for (const a of [-1, 1]) for (const b of [-PHI, PHI]) v.push([0, a, b], [a, b, 0], [b, 0, a]);
      return { v: v.map((p) => p.map((c) => c / 1.9) as V), e: edgesByDistance(v, 2).map((x) => x) };
    }
    case "cube": {
      const v: V[] = [];
      for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) v.push([x * 0.62, y * 0.62, z * 0.62]);
      const inner = v.map((p) => p.map((c) => c * 0.45) as V);
      const all = [...v, ...inner];
      const e = [...edgesByDistance(v, 1.24), ...edgesByDistance(inner, 1.24 * 0.45).map(([a, b]) => [a + 8, b + 8] as [number, number])];
      for (let i = 0; i < 8; i++) e.push([i, i + 8]);
      return { v: all, e };
    }
    case "octa": {
      const v: V[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map((p) => p.map((c) => c * 0.95) as V);
      return { v, e: edgesByDistance(v, Math.SQRT2 * 0.95) };
    }
    case "prism": {
      const v: V[] = [];
      const n = 6;
      for (const y of [-0.7, 0.7]) for (let i = 0; i < n; i++) v.push([Math.cos((i / n) * Math.PI * 2) * 0.75, y, Math.sin((i / n) * Math.PI * 2) * 0.75]);
      const e: [number, number][] = [];
      for (let i = 0; i < n; i++) e.push([i, (i + 1) % n], [i + n, ((i + 1) % n) + n], [i, i + n]);
      return { v, e };
    }
    case "torus": {
      const v: V[] = [];
      const e: [number, number][] = [];
      const U = 16, Vn = 6, R = 0.68, r = 0.26;
      for (let i = 0; i < U; i++)
        for (let j = 0; j < Vn; j++) {
          const u = (i / U) * Math.PI * 2, w = (j / Vn) * Math.PI * 2;
          v.push([(R + r * Math.cos(w)) * Math.cos(u), r * Math.sin(w), (R + r * Math.cos(w)) * Math.sin(u)]);
          const k = i * Vn + j;
          e.push([k, i * Vn + ((j + 1) % Vn)], [k, ((i + 1) % U) * Vn + j]);
        }
      return { v, e };
    }
    case "helix": {
      const v: V[] = [];
      const e: [number, number][] = [];
      const n = 28;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 4;
        const y = (i / (n - 1)) * 1.6 - 0.8;
        v.push([Math.cos(a) * 0.55, y, Math.sin(a) * 0.55], [Math.cos(a + Math.PI) * 0.55, y, Math.sin(a + Math.PI) * 0.55]);
        const k = i * 2;
        if (i % 2 === 0) e.push([k, k + 1]);
        if (i < n - 1) e.push([k, k + 2], [k + 1, k + 3]);
      }
      return { v, e };
    }
  }
}

/** A rotating wireframe specimen. Animates only while visible or active. */
export function Wireframe({ shape, active = false, size = 160, accentEdge = 0 }: { shape: Idea["shape"]; active?: boolean; size?: number; accentEdge?: number }) {
  const geo = useMemo(() => build(shape), [shape]);
  const svgRef = useRef<SVGSVGElement>(null);
  const linesRef = useRef<SVGLineElement[]>([]);
  const state = useRef({ ax: 0.5, ay: 0.6, speed: 0.12, visible: false });
  state.current.speed = active ? 0.9 : 0.14;

  useEffect(() => {
    const svg = svgRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw = () => {
      const { ax, ay } = state.current;
      const cxs = Math.cos(ax), sxs = Math.sin(ax), cys = Math.cos(ay), sys = Math.sin(ay);
      const proj = geo.v.map(([x, y, z]) => {
        const x1 = x * cys + z * sys;
        const z1 = -x * sys + z * cys;
        const y1 = y * cxs - z1 * sxs;
        const z2 = y * sxs + z1 * cxs;
        const s = 3 / (3 - z2);
        return [50 + x1 * s * 40, 50 + y1 * s * 40, z2];
      });
      geo.e.forEach(([a, b], i) => {
        const l = linesRef.current[i];
        if (!l) return;
        l.setAttribute("x1", proj[a][0].toFixed(2));
        l.setAttribute("y1", proj[a][1].toFixed(2));
        l.setAttribute("x2", proj[b][0].toFixed(2));
        l.setAttribute("y2", proj[b][1].toFixed(2));
        l.setAttribute("stroke-opacity", (0.25 + 0.6 * ((proj[a][2] + proj[b][2]) / 2 + 1) / 2).toFixed(2));
      });
    };
    draw();
    if (reduced) return;
    const io = new IntersectionObserver(([e]) => (state.current.visible = e.isIntersecting));
    io.observe(svg);
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (state.current.visible) {
        state.current.ay += dt * state.current.speed;
        state.current.ax += dt * state.current.speed * 0.37;
        draw();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [geo]);

  return (
    <svg ref={svgRef} viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" className="overflow-visible">
      {geo.e.map((_, i) => (
        <line
          key={i}
          ref={(el) => {
            if (el) linesRef.current[i] = el;
          }}
          stroke={i === accentEdge ? "#F2A541" : "#ECE6DC"}
          strokeWidth={i === accentEdge ? 0.9 : 0.5}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
