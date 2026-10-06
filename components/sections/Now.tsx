"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cx, pad } from "@/lib/utils";

const groups = profile.now.groups;

function formatUpdated(v: string) {
  const [y, m] = v.split("-").map(Number);
  if (!y || !m) return v;
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** A signal trace across the top of the board. */
function Trace() {
  const pts = Array.from({ length: 80 }, (_, i) => {
    const x = (i / 79) * 1000;
    const spike = i % 19 === 7 ? -26 : i % 19 === 8 ? 18 : 0;
    const y = 30 + Math.sin(i * 0.7) * 3 + spike;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 1000 60" preserveAspectRatio="none" className="h-12 w-full" aria-hidden="true">
      <polyline points={pts} fill="none" stroke="rgb(236 230 220 / 0.12)" />
      <polyline points={pts} fill="none" stroke="#F2A541" strokeWidth="1.2" className="trace" pathLength={1} />
    </svg>
  );
}

export function Now() {
  const [focus, setFocus] = useState(0);
  const [auto, setAuto] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });

  useEffect(() => {
    if (!auto || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setFocus((f) => (f + 1) % groups.length), 3600);
    return () => clearInterval(t);
  }, [auto, inView]);

  const pick = (i: number) => {
    setAuto(false);
    setFocus(i);
  };

  return (
    <section id="now" data-section="Now" aria-labelledby="now-title" className="relative pt-[22vh]">
      <SectionHeader
        index="06"
        label="Live status"
        title={
          <>
            What&apos;s happening
            <br />
            now.
          </>
        }
        id="now-title"
        aside={
          <p className="flex items-center gap-3">
            <span className="pulse" aria-hidden="true" />
            <span>
              Updated <span className="text-paper">{formatUpdated(profile.now.updated)}</span>
            </span>
          </p>
        }
      />

      <div ref={ref} className="page-x mt-14">
        <div className="border border-line bg-ink-2/60">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <span className="label text-mute">
              <span className="text-amber">●</span> km / now
            </span>
            <span className="label text-dim">{groups.reduce((n, g) => n + g.items.length, 0)} active threads</span>
          </div>
          <div className="px-5">
            <Trace />
          </div>

          {/* Tabs (all sizes) — on desktop every column stays visible, focus dims the rest */}
          <div role="tablist" aria-label="Status categories" className="grid grid-cols-2 border-t border-line lg:grid-cols-4">
            {groups.map((g, i) => (
              <button
                key={g.label}
                role="tab"
                id={`now-tab-${i}`}
                aria-selected={focus === i}
                aria-controls={`now-panel-${i}`}
                onClick={() => pick(i)}
                onPointerEnter={(e) => e.pointerType === "mouse" && pick(i)}
                className={cx(
                  "relative flex items-center justify-between border-line px-5 py-4 text-left transition-colors [&:nth-child(odd)]:border-r lg:border-r lg:last:border-r-0",
                  i < 2 && "border-b lg:border-b-0",
                  focus === i ? "text-paper" : "text-dim hover:text-mute",
                )}
              >
                <span className="label">{g.label}</span>
                <span className="label tabular-nums">{pad(g.items.length)}</span>
                <span
                  aria-hidden="true"
                  className={cx(
                    "absolute inset-x-0 top-0 h-px origin-left bg-amber transition-transform duration-700",
                    focus === i ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            ))}
          </div>

          <div className="grid border-t border-line lg:grid-cols-4">
            {groups.map((g, i) => (
              <div
                key={g.label}
                role="tabpanel"
                id={`now-panel-${i}`}
                aria-labelledby={`now-tab-${i}`}
                className={cx(
                  "border-line px-5 py-6 transition-opacity duration-700 lg:block lg:border-r lg:last:border-r-0",
                  focus === i ? "block opacity-100" : "hidden opacity-30",
                )}
              >
                <ul className="space-y-4">
                  {g.items.map((item, j) => (
                    <li key={item} className="flex items-baseline gap-3">
                      <span className="label tabular-nums text-dim">{pad(j + 1)}</span>
                      <span className="font-display text-[clamp(1.25rem,1.7vw,1.6rem)] font-medium leading-tight tracking-[-0.025em]">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
