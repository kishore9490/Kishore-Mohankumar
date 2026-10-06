"use client";

import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { getLenis } from "@/lib/scroll";
import { cx, pad } from "@/lib/utils";

const chapters = profile.journey;

function HorizontalTrack() {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 32, restDelta: 0.0005 });
  const x = useTransform(smooth, (p) => -p * distance);
  const fill = useTransform(smooth, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) setDistance(trackRef.current.scrollWidth - window.innerWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.min(chapters.length - 1, Math.round(p * (chapters.length - 1))));
  });

  const goTo = (i: number) => {
    const el = ref.current!;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + (i / (chapters.length - 1)) * (el.offsetHeight - window.innerHeight);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div ref={ref} style={{ height: `${chapters.length * 62}vh` }} className="relative mt-16">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <motion.div ref={trackRef} style={{ x }} className="flex w-max items-stretch pl-[var(--margin)] pr-[30vw] will-change-transform">
          {chapters.map((c, i) => {
            const on = i === active;
            return (
              <article
                key={c.title}
                aria-label={`Chapter ${i + 1}: ${c.title}`}
                className="relative w-[44vw] max-w-[640px] shrink-0 pr-[6vw]"
              >
                <div
                  className={cx(
                    "display text-[clamp(5rem,11vw,12rem)] transition-colors duration-700",
                    on ? "text-paper" : "text-ink-3 [-webkit-text-stroke:1px_rgb(236_230_220/0.2)]",
                  )}
                >
                  {c.marker}
                </div>
                {/* timeline rail */}
                <div className="relative my-8 h-px bg-line">
                  <span
                    className={cx(
                      "absolute -top-[5px] left-0 h-[11px] w-[11px] border transition-colors duration-500",
                      on ? "border-amber bg-amber" : "border-line-2 bg-ink",
                    )}
                    aria-hidden="true"
                  />
                </div>
                <p className="label text-amber">
                  Chapter {pad(i + 1)}
                </p>
                <h3 className="mt-3 font-display text-[clamp(1.8rem,2.6vw,2.8rem)] font-semibold uppercase leading-none tracking-[-0.035em]">
                  {c.title}
                </h3>
                <div className={cx("mt-5 max-w-[34ch] space-y-2 text-lg transition-colors duration-700", on ? "text-paper" : "text-mute")}>
                  {c.lines.map((l) => (
                    <p key={l}>{l}</p>
                  ))}
                </div>
                <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1">
                  {c.keywords.map((k) => (
                    <li key={k} className="label text-dim">
                      / {k}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </motion.div>

        {/* chapter rail */}
        <div className="page-x absolute inset-x-0 bottom-8">
          <div className="relative h-px bg-line">
            <motion.div className="absolute inset-y-0 left-0 bg-amber" style={{ width: fill }} />
          </div>
          <ol className="mt-4 grid" style={{ gridTemplateColumns: `repeat(${chapters.length}, minmax(0, 1fr))` }}>
            {chapters.map((c, i) => (
              <li key={c.title}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === active ? "step" : undefined}
                  className={cx("label text-left transition-colors", i === active ? "text-paper" : "text-dim hover:text-mute")}
                  data-cursor="Go"
                >
                  {pad(i + 1)} {c.title}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function VerticalTrack() {
  return (
    <ol className="page-x mt-14 border-l border-line">
      {chapters.map((c, i) => (
        <li key={c.title} className="relative pb-14 pl-6">
          <span className="absolute -left-[6px] top-3 h-[11px] w-[11px] border border-amber bg-ink" aria-hidden="true" />
          <Reveal>
            <div className="display text-[22vw] text-ink-3 [-webkit-text-stroke:1px_rgb(236_230_220/0.25)]">{c.marker}</div>
            <p className="label mt-4 text-amber">Chapter {pad(i + 1)}</p>
            <h3 className="mt-2 font-display text-3xl font-semibold uppercase tracking-[-0.035em]">{c.title}</h3>
            <div className="mt-3 space-y-1 text-mute">
              {c.lines.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
            <p className="label mt-4 text-dim">{c.keywords.join(" / ")}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

export function Journey() {
  const [wide, setWide] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section id="journey" data-section="Journey" aria-labelledby="journey-title" className="relative pt-[22vh]">
      <SectionHeader
        index="02"
        label="How I got here"
        title={
          <>
            Seven chapters.
            <br />
            One direction.
          </>
        }
        id="journey-title"
        aside={<p>From the server room to the product launch. Each chapter added a layer — none replaced the last.</p>}
      />
      {wide ? <HorizontalTrack /> : <VerticalTrack />}
    </section>
  );
}
