"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/format";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { BikeVisual } from "../BikeVisual";
import { useBikeConfig } from "./ConfigContext";
import { hotspotLayout } from "./hotspots";

const kindLabel = {
  engine: "Engine",
  lighting: "Lighting",
  brakes: "Brakes",
  technology: "Technology",
  comfort: "Comfort",
  storage: "Storage",
  safety: "Safety",
} as const;

/** Visual storytelling with hotspots placed on the bike + a synced feature list. */
export function WhyThisBike({ index = "01" }: { index?: string }) {
  const { bike, color } = useBikeConfig();
  const reduce = useReducedMotion();
  const uid = useId();
  const [active, setActive] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const lockUntil = useRef(0);
  const spots = useMemo(() => hotspotLayout(bike), [bike]);
  const features = bike.features;
  const f = features[active];
  const spot = spots[active];

  function select(i: number, scrollRail = true) {
    setActive(i);
    if (!scrollRail) return;
    lockUntil.current = performance.now() + 700;
    const el = rail.current?.children[i] as HTMLElement | undefined;
    if (el && rail.current && getComputedStyle(rail.current).display !== "none") {
      rail.current.scrollTo({ left: el.offsetLeft - parseFloat(getComputedStyle(rail.current).paddingLeft), behavior: reduce ? "auto" : "smooth" });
    }
  }

  function onRailScroll() {
    const r = rail.current;
    if (!r || performance.now() < lockUntil.current) return;
    const cards = Array.from(r.children) as HTMLElement[];
    const centre = r.scrollLeft + r.clientWidth / 2;
    let best = 0;
    let dist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.clientWidth / 2 - centre);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    if (best !== active) setActive(best);
  }

  return (
    <section aria-labelledby={`${uid}-h`} className="relative overflow-hidden bg-ink-2 py-24 text-bone md:py-36">
      <div className="container-x">
        <div id={`${uid}-h`}>
          <SectionHeading index={index} eyebrow={`Honda ${bike.name}`} title={["Why this", "bike?"]} lede={bike.story} />
        </div>

        <div className="mt-12 grid gap-10 md:mt-16 lg:grid-cols-12 lg:items-center lg:gap-14">
          {/* visual + hotspots */}
          <div className="lg:col-span-8">
            <div className="relative">
              <div className="studio-glow pointer-events-none absolute inset-0" aria-hidden />
              <div className="relative">
                <BikeVisual bike={bike} color={color} sizes="(min-width: 1024px) 60vw, 100vw" />
                <ul className="absolute inset-0" aria-label="Feature hotspots">
                  {features.map((feat, i) => {
                    const s = spots[i];
                    const on = i === active;
                    return (
                      <li key={feat.id} className="absolute" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
                        <button
                          type="button"
                          onClick={() => select(i)}
                          aria-pressed={on}
                          aria-controls={`${uid}-panel`}
                          aria-label={`${i + 1}. ${feat.title}`}
                          className="group/hs absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
                        >
                          {!on && (
                            <span className="absolute inset-1.5 animate-ping rounded-full bg-bone/30 [animation-duration:2.4s] motion-reduce:hidden" aria-hidden />
                          )}
                          <span
                            className={cn(
                              "relative grid size-7 place-items-center rounded-full border text-[11px] font-semibold tabular shadow-[0_4px_16px_rgb(0_0_0/0.5)] backdrop-blur transition-[background-color,color,transform,border-color] duration-300 ease-[var(--ease-out-expo)] md:size-8",
                              on
                                ? "scale-110 border-bone bg-bone text-ink"
                                : "border-white/40 bg-ink/70 text-bone group-hover/hs:scale-110 group-hover/hs:border-bone",
                            )}
                          >
                            {i + 1}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {/* desktop callout next to the active hotspot */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="pointer-events-none absolute hidden whitespace-nowrap rounded-full border border-white/15 bg-ink/80 px-3 py-1.5 text-[12px] font-medium backdrop-blur md:block"
                    style={{
                      left: `${spot.x}%`,
                      top: `${spot.y}%`,
                      transform: spot.x > 62 ? "translate(calc(-100% - 28px), -50%)" : "translate(28px, -50%)",
                    }}
                    aria-hidden
                  >
                    {f.title}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <p className="eyebrow mt-4 text-center text-bone/35 lg:text-left">Tap a number to explore · Studio illustration</p>
          </div>

          {/* desktop list */}
          <ol className="hidden border-t border-white/10 lg:col-span-4 lg:block" id={`${uid}-panel`} aria-live="polite">
            {features.map((feat, i) => {
              const on = i === active;
              return (
                <li key={feat.id} className="border-b border-white/10">
                  <button
                    type="button"
                    onClick={() => select(i, false)}
                    aria-expanded={on}
                    className="flex w-full items-center gap-4 py-4 text-left"
                  >
                    <span className={cn("eyebrow tabular w-6", on ? "text-signal" : "text-bone/35")}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={cn("flex-1 font-display text-lg transition-opacity", on ? "opacity-100" : "opacity-55 hover:opacity-90")}>
                      {feat.title}
                    </span>
                    <Icon name={on ? "minus" : "plus"} size={16} className="opacity-50" />
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 pl-10 text-[15px] leading-relaxed text-bone/70">
                          <span className="eyebrow mb-2 block text-bone/40">{kindLabel[feat.kind]}</span>
                          {feat.body}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>
        </div>

        {/* mobile / tablet swipe rail */}
        <div
          ref={rail}
          onScroll={onRailScroll}
          className="no-scrollbar relative -mx-5 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-2 md:-mx-10 md:scroll-px-10 md:px-10 lg:hidden"
          aria-label="Features"
          role="group"
        >
          {features.map((feat, i) => {
            const on = i === active;
            return (
              <button
                type="button"
                key={feat.id}
                onClick={() => select(i)}
                aria-pressed={on}
                className={cn(
                  "w-[78%] shrink-0 snap-start rounded-2xl border p-5 text-left transition-[border-color,background-color] duration-300 sm:w-[45%]",
                  on ? "border-white/40 bg-white/[0.06]" : "border-white/10",
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full border text-[11px] font-semibold tabular",
                      on ? "border-bone bg-bone text-ink" : "border-white/30",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="eyebrow text-bone/45">{kindLabel[feat.kind]}</span>
                </span>
                <span className="mt-4 block font-display text-lg leading-tight">{feat.title}</span>
                <span className="mt-2 block text-[14px] leading-relaxed text-bone/65">{feat.body}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 flex items-center gap-2 text-[12px] text-bone/40 lg:hidden" aria-hidden>
          <span className="tabular">
            {active + 1} / {features.length}
          </span>
          <span className="h-px flex-1 bg-white/10">
            <span
              className="block h-px bg-bone/60 transition-[width] duration-500"
              style={{ width: `${((active + 1) / features.length) * 100}%` }}
            />
          </span>
          Swipe
        </p>
      </div>
    </section>
  );
}
