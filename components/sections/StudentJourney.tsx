"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Section, SectionHeader } from "@/components/ui/Section";

const steps = [
  { k: "Discover", d: "Explore the field, try the coding lab, read our guides." },
  { k: "Counselling", d: "A conversation about your background and goals." },
  { k: "Enrol", d: "Choose the program and batch that fits you." },
  { k: "Learn", d: "Foundations first, then the code sets, step by step." },
  { k: "Practice", d: "Case after case — accuracy before speed." },
  { k: "Assess", d: "Checkpoints and mock assessments with feedback." },
  { k: "Prepare", d: "Profile, interviews and your certification plan." },
  { k: "Move forward", d: "Take the next step with skills you can demonstrate." },
];

export function StudentJourney() {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <Section tone="mist" aria-labelledby="sj-title">
      <div className="container-x">
        <SectionHeader id="sj-title" label="Student journey" title={<>From first day<br />to career ready.</>} />
        <ol ref={ref} className="relative mt-16">
          <div className="absolute bottom-0 left-[11px] top-0 w-px bg-line md:left-1/2" aria-hidden="true" />
          <motion.div
            className="absolute left-[11px] top-0 h-full w-px origin-top bg-cyan md:left-1/2"
            style={{ scaleY: reduce ? 1 : scale }}
            aria-hidden="true"
          />
          {steps.map((s, i) => {
            const left = i % 2 === 0;
            return (
              <li
                key={s.k}
                className={`relative pb-10 pl-12 md:w-1/2 md:pb-6 ${left ? "md:pl-0 md:pr-16 md:text-right" : "md:ml-[50%] md:pl-16"} ${i > 0 ? "md:-mt-6" : ""}`}
              >
                <span
                  className={`absolute left-0 top-1 flex h-[23px] w-[23px] items-center justify-center rounded-full border border-cyan bg-white ${
                    left ? "md:left-auto md:-right-[11.5px]" : "md:-left-[11.5px]"
                  }`}
                  aria-hidden="true"
                >
                  <span className="h-2 w-2 rounded-full bg-cyan" />
                </span>
                <p className="font-mono text-[11px] text-muted">{String(i + 1).padStart(2, "0")}</p>
                <p className="heading mt-1 text-[30px] md:text-[40px]">{s.k}</p>
                <p className="mt-2 text-[15px] text-muted">{s.d}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
