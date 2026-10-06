"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { profile } from "@/data/profile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { VelocityMarquee } from "@/components/ui/VelocityMarquee";
import { Reveal } from "@/components/ui/Reveal";
import { useMedia } from "@/hooks/useMedia";

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {word}&nbsp;
    </motion.span>
  );
}

function Paragraph({ text, start, end, progress, indent }: { text: string; start: number; end: number; progress: MotionValue<number>; indent: number }) {
  const words = text.split(" ");
  const drift = indent < 0 ? 0 : 4;
  const base = Math.max(0, indent);
  const x = useTransform(progress, [start - 0.08, end], [`${drift + base}vw`, `${base}vw`]);
  return (
    <motion.p style={{ x }} className="max-w-[22ch] will-change-transform md:max-w-[26ch]">
      {words.map((w, i) => {
        const a = start + ((end - start) * i) / words.length;
        const b = start + ((end - start) * (i + 1)) / words.length;
        return <Word key={i} word={w} range={[a, b]} progress={progress} />;
      })}
    </motion.p>
  );
}

export function About() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.55"] });
  const story = profile.about.story;
  const total = story.join(" ").split(" ").length;
  const wide = useMedia("(min-width: 768px)");
  let acc = 0;

  return (
    <section id="about" data-section="About" aria-labelledby="about-title" className="relative pt-[18vh] md:pt-[24vh]">
      <SectionHeader index="01" label="Who I am" title={profile.about.title} id="about-title" />

      <div
        ref={ref}
        className="page-x mt-[10vh] space-y-[0.5em] font-display text-[clamp(1.9rem,4.6vw,4.9rem)] font-medium leading-[1.02] tracking-[-0.035em] text-paper"
      >
        <span className="sr-only">{story.join(" ")}</span>
        <div aria-hidden="true" className="space-y-[0.5em]">
          {story.map((p, i) => {
            const n = p.split(" ").length;
            const start = acc / total;
            acc += n;
            const end = acc / total;
            return <Paragraph key={i} text={p} start={start} end={end} progress={scrollYProgress} indent={wide ? [0, 8, 16, 4][i % 4] : -1} />;
          })}
        </div>
      </div>

      <div className="mt-[16vh] border-y border-line py-6">
        <VelocityMarquee>
          {profile.about.flow.map((f) => (
            <span key={f} className="display flex items-center whitespace-nowrap pr-[0.5em] text-[clamp(3rem,9vw,8rem)] text-ink-3 [-webkit-text-stroke:1px_rgb(236_230_220/0.28)]">
              {f}
              <span className="ml-[0.5em] text-amber [-webkit-text-stroke:0]">→</span>
            </span>
          ))}
        </VelocityMarquee>
      </div>

      <dl className="page-x grid grid-cols-1 sm:grid-cols-3">
        {profile.about.facts.map((f, i) => (
          <Reveal key={f.label} delay={i * 0.08} className="border-b border-line py-6 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0">
            <dt className="label text-mute">{f.label}</dt>
            <dd className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] md:text-3xl">{f.value}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
