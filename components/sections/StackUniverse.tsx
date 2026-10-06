"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { profile, type Tech } from "@/data/profile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cx } from "@/lib/utils";

const W = 1000;
const H = 660;

/** Hand-placed layout. New technologies without a position orbit their cluster automatically. */
const POS: Record<string, [number, number]> = {
  cloud: [300, 150], azure: [440, 104], kubernetes: [372, 250],
  vmware: [96, 250], docker: [236, 336], linux: [126, 440],
  networking: [330, 476], fortigate: [200, 576], security: [440, 590],
  devops: [530, 300], automation: [660, 350], monitoring: [556, 456],
  ai: [770, 176], openai: [900, 116],
  whatsapp: [900, 330], rcs: [950, 446],
  apis: [784, 462], python: [650, 580], typescript: [820, 590], javascript: [940, 588],
};
const CLUSTER_ANCHOR: Record<Tech["cluster"], [number, number]> = {
  Cloud: [370, 160], Infrastructure: [150, 340], "Network & Security": [320, 560], Operations: [580, 380],
  AI: [830, 140], Messaging: [920, 390], Code: [800, 560],
};

const techs = profile.technologies;

function usePositions() {
  return useMemo(() => {
    const out: Record<string, [number, number]> = {};
    const counts: Record<string, number> = {};
    techs.forEach((t) => {
      if (POS[t.id]) out[t.id] = POS[t.id];
      else {
        const n = (counts[t.cluster] = (counts[t.cluster] ?? 0) + 1);
        const [ax, ay] = CLUSTER_ANCHOR[t.cluster];
        const a = n * 2.4;
        out[t.id] = [ax + Math.cos(a) * 70, ay + Math.sin(a) * 60];
      }
    });
    return out;
  }, []);
}

function useEdges() {
  return useMemo(() => {
    const seen = new Set<string>();
    const edges: [string, string][] = [];
    const ids = new Set(techs.map((t) => t.id));
    techs.forEach((t) =>
      t.links.forEach((l) => {
        if (!ids.has(l)) return;
        const k = [t.id, l].sort().join("|");
        if (seen.has(k)) return;
        seen.add(k);
        edges.push([t.id, l]);
      }),
    );
    return edges;
  }, []);
}

export function StackUniverse() {
  const pos = usePositions();
  const edges = useEdges();
  const [selected, setSelected] = useState<string>("automation");
  const [hover, setHover] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  // On narrow screens the graph scrolls sideways — start it centred.
  useEffect(() => {
    const el = scroller.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);
  const focus = hover ?? selected;

  const neighbours = useMemo(() => {
    const s = new Set<string>([focus]);
    edges.forEach(([a, b]) => {
      if (a === focus) s.add(b);
      if (b === focus) s.add(a);
    });
    return s;
  }, [focus, edges]);

  const sel = techs.find((t) => t.id === selected)!;
  const [sx, sy] = pos[selected];
  const zoom = `translate(${(W / 2 - sx) * 0.08}px, ${(H / 2 - sy) * 0.08}px) translate(${sx}px, ${sy}px) scale(1.06) translate(${-sx}px, ${-sy}px)`;

  const clusters = useMemo(() => {
    const m = new Map<string, Tech[]>();
    techs.forEach((t) => m.set(t.cluster, [...(m.get(t.cluster) ?? []), t]));
    return [...m];
  }, []);

  const onNodeKey = (e: KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelected(id);
    }
  };

  return (
    <section id="stack" data-section="Stack" aria-labelledby="stack-title" className="relative pt-[22vh]">
      <SectionHeader
        index="04"
        label="What I know"
        title={
          <>
            A connected
            <br />
            stack.
          </>
        }
        id="stack-title"
        aside={<p>No percentages. What matters is how the pieces connect — select any technology to see where it shows up in my work.</p>}
      />

      <div className="page-x mt-14 grid gap-10 lg:grid-cols-12">
        <div ref={scroller} className="-mx-[var(--margin)] overflow-x-auto px-[var(--margin)] lg:col-span-8 lg:mx-0 lg:overflow-visible lg:px-0" data-lenis-prevent-touch>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-[860px] max-w-none select-none lg:w-full"
            role="group"
            aria-label="Technology constellation"
            onPointerLeave={() => setHover(null)}
          >
            <g style={{ transform: zoom, transition: "transform 1.2s cubic-bezier(0.16,1,0.3,1)" }}>
              {/* edges */}
              {edges.map(([a, b]) => {
                const on = a === focus || b === focus;
                const [x1, y1] = pos[a];
                const [x2, y2] = pos[b];
                return (
                  <line
                    key={`${a}-${b}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={on ? "#F2A541" : "rgb(236 230 220)"}
                    strokeOpacity={on ? 0.85 : 0.09}
                    strokeDasharray={on ? "3 5" : undefined}
                    className={on ? "edge-flow" : undefined}
                    style={{ transition: "stroke-opacity .4s" }}
                    aria-hidden="true"
                  />
                );
              })}

              {/* nodes */}
              {techs.map((t) => {
                const [x, y] = pos[t.id];
                const isSel = t.id === selected;
                const near = neighbours.has(t.id);
                return (
                  <g
                    key={t.id}
                    transform={`translate(${x} ${y})`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSel}
                    aria-label={`${t.label} — ${t.cluster}`}
                    onClick={() => setSelected(t.id)}
                    onKeyDown={(e) => onNodeKey(e, t.id)}
                    onPointerEnter={() => setHover(t.id)}
                    onFocus={() => setHover(t.id)}
                    onBlur={() => setHover(null)}
                    data-cursor="Select"
                    className="cursor-pointer outline-none [&:focus-visible>rect:first-child]:stroke-amber"
                    style={{ opacity: near ? 1 : 0.32, transition: "opacity .4s" }}
                  >
                    <rect x={-34} y={-22} width={68} height={50} fill="transparent" stroke="transparent" />
                    {isSel && (
                      <circle r="14" fill="none" stroke="#F2A541" strokeOpacity="0.5">
                        <animate attributeName="r" values="8;20" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="stroke-opacity" values="0.7;0" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <rect
                      x={isSel ? -6 : -4}
                      y={isSel ? -6 : -4}
                      width={isSel ? 12 : 8}
                      height={isSel ? 12 : 8}
                      fill={isSel ? "#F2A541" : "#0A0A0B"}
                      stroke={isSel || t.id === hover ? "#F2A541" : "rgb(236 230 220 / 0.7)"}
                    />
                    <text
                      y={26}
                      textAnchor="middle"
                      className={cx(
                        "font-mono text-[12.5px] uppercase tracking-[0.1em]",
                        isSel ? "fill-paper" : near ? "fill-paper" : "fill-mute",
                      )}
                    >
                      {t.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Detail */}
        <div className="lg:col-span-4 lg:pt-10" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={sel.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="border-t border-amber pt-6"
            >
              <p className="label text-amber">{sel.cluster}</p>
              <h3 className="mt-3 font-display text-5xl font-semibold uppercase tracking-[-0.045em]">{sel.label}</h3>
              <p className="mt-5 text-lg leading-relaxed text-paper">{sel.context}</p>
              <p className="label mt-8 text-dim">Connected to</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {sel.links
                  .map((l) => techs.find((t) => t.id === l))
                  .filter(Boolean)
                  .map((t) => (
                    <li key={t!.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(t!.id)}
                        className="label border border-line-2 px-3 py-2 text-mute transition-colors hover:border-amber hover:text-paper"
                      >
                        {t!.label}
                      </button>
                    </li>
                  ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Index — fast access on touch, and a plain list for everyone */}
      <div className="page-x mt-14 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-8 sm:grid-cols-4 lg:grid-cols-7">
        {clusters.map(([name, list]) => (
          <div key={name}>
            <p className="label text-dim">{name}</p>
            <ul className="mt-3 space-y-1.5">
              {list.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(t.id)}
                    className={cx("text-left text-[15px] transition-colors", t.id === selected ? "text-amber" : "text-mute hover:text-paper")}
                  >
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
