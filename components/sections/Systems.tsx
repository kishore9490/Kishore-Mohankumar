"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { profile } from "@/data/profile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { cx, pad } from "@/lib/utils";

export function Systems() {
  const [open, setOpen] = useState(0);
  const cv = profile.cvUrl;

  return (
    <section id="experience" data-section="Experience" aria-labelledby="experience-title" className="relative pt-[22vh]">
      <SectionHeader
        index="05"
        label="Experience"
        title={
          <>
            Systems
            <br />
            I&apos;ve built.
          </>
        }
        id="experience-title"
        aside={<p>Job titles change. The problems stay recognisable. These are the kinds of problems I have owned.</p>}
      />

      <ul className="page-x mt-16 border-b border-line">
        {profile.systems.map((s, i) => {
          const on = open === i;
          return (
            <li key={s.name} className="border-t border-line">
              <Reveal delay={i * 0.04}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(on ? -1 : i)}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(i)}
                    aria-expanded={on}
                    aria-controls={`sys-${i}`}
                    className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-6 text-left md:grid-cols-[4rem_1fr_1fr_auto] md:py-7"
                  >
                    <span className={cx("label tabular-nums transition-colors", on ? "text-amber" : "text-dim")}>{pad(i + 1)}</span>
                    <span
                      className={cx(
                        "font-display text-[clamp(1.6rem,3.6vw,3.6rem)] font-semibold uppercase leading-none tracking-[-0.04em] transition-all duration-500",
                        on ? "translate-x-2 text-paper" : "text-mute group-hover:text-paper",
                      )}
                    >
                      {s.name}
                    </span>
                    <span className="hidden text-mute md:block">{s.line}</span>
                    <span aria-hidden="true" className={cx("label transition-transform duration-500", on ? "rotate-45 text-amber" : "text-dim")}>
                      +
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      id={`sys-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pl-[calc(2.5rem+1rem)] text-mute md:hidden">{s.line}</p>
                      <ul className="grid gap-4 pb-8 pl-[calc(2.5rem+1rem)] pt-4 md:grid-cols-3 md:pl-[calc(4rem+1rem)]">
                        {s.problems.map((p) => (
                          <li key={p} className="border-l border-amber/60 pl-4 text-[15px] leading-relaxed text-paper">
                            {p}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            </li>
          );
        })}
      </ul>

      <div className="page-x mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="label text-dim">Prefer the conventional format?</p>
        {cv ? (
          <a href={cv} download className="label link-u text-mute hover:text-paper" data-cursor="Download">
            Download CV (PDF) ↓
          </a>
        ) : (
          <a href="#contact" className="label link-u text-mute hover:text-paper">
            CV available on request →
          </a>
        )}
      </div>
    </section>
  );
}
