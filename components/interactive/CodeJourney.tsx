"use client";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { codeJourney } from "@/data/lab";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { JourneyVisual } from "./JourneyVisual";

const N = codeJourney.length;

/**
 * THE CODE JOURNEY — EMC's signature interaction.
 * Desktop: a pinned, scroll-driven story where one fictional record grows richer at every stage.
 * Phones / reduced motion: the same story as a calm vertical sequence.
 */
export function CodeJourney() {
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)", true);
  return (
    <section id="code-journey" aria-labelledby="journey-title" className="relative bg-mist">
      <div className="container-x pt-24 md:pt-32">
        <Reveal>
          <p className="label flex items-center gap-2">
            <span className="inline-block h-px w-6 bg-cyan" aria-hidden="true" />
            The code journey
          </p>
          <h2 id="journey-title" className="heading mt-5 max-w-4xl text-[34px] sm:text-5xl lg:text-[64px]">
            So, what exactly is <span className="text-blue">medical coding?</span>
          </h2>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-muted md:text-lg">
            Medical coding translates the diagnoses, procedures and services in a patient’s record into standardised
            codes used in healthcare administration, billing and data. Follow one fictional record to see how.
          </p>
        </Reveal>
      </div>
      {desktop && !reduce ? <Pinned /> : <Stacked />}
      <Finale />
    </section>
  );
}

function Pinned() {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setProgress(v);
    setStage(Math.min(N - 1, Math.floor(v * N)));
  });

  const s = codeJourney[stage];

  return (
    <div ref={ref} style={{ height: `${N * 80 + 40}vh` }} className="relative">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="container-x grid w-full grid-cols-[0.9fr_1.1fr] items-center gap-16">
          <div>
            {/* Stage rail */}
            <ol className="mb-10 flex gap-1.5" aria-label="Journey stages">
              {codeJourney.map((c, i) => (
                <li key={c.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full bg-ink transition-[width] duration-150"
                    style={{ width: `${Math.max(0, Math.min(1, progress * N - i)) * 100}%` }}
                  />
                  <span className="sr-only">{c.kicker}</span>
                </li>
              ))}
            </ol>
            <div className="relative min-h-[260px]" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="label !text-cyan-ink">{s.kicker}</p>
                  <h3 className="heading mt-4 text-5xl xl:text-6xl">{s.title}</h3>
                  <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">{s.text}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[13px]">
              {codeJourney.map((c, i) => (
                <li key={c.id} className={cn("transition-colors", i <= stage ? "text-ink" : "text-muted/60")}>
                  <span className="font-mono text-[10.5px] text-muted">{String(i + 1).padStart(2, "0")}</span>{" "}
                  {c.kicker.split("· ")[1]}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ perspective: 1400 }} className="origin-center [@media(max-height:860px)]:scale-[.88] [@media(max-height:760px)]:scale-[.78]">
            <motion.div
              animate={{ rotateY: -6 + stage * 1, rotateX: 4 - stage * 0.6 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <JourneyVisual stage={stage} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Phones / reduced motion: a thumb-friendly stepper over the same evolving record. */
function Stacked() {
  const [i, setI] = useState(0);
  const c = codeJourney[i];
  return (
    <div className="container-x mt-12 pb-16">
      <ol className="flex gap-1.5" aria-label="Journey stages">
        {codeJourney.map((x, k) => (
          <li key={x.id} className="flex-1">
            <button
              type="button"
              onClick={() => setI(k)}
              aria-label={x.kicker}
              aria-current={k === i ? "step" : undefined}
              className="block h-6 w-full"
            >
              <span className={cn("block h-[3px] rounded-full transition-colors", k <= i ? "bg-ink" : "bg-line")} />
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-6 min-h-[168px]" aria-live="polite">
        <p className="label !text-cyan-ink">{c.kicker}</p>
        <h3 className="heading mt-3 text-3xl sm:text-4xl">{c.title}</h3>
        <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-muted">{c.text}</p>
      </div>
      <div className="mt-6 max-w-xl">
        <JourneyVisual stage={i} compact />
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white disabled:opacity-30"
          aria-label="Previous stage"
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          type="button"
          onClick={() => setI((v) => Math.min(N - 1, v + 1))}
          disabled={i === N - 1}
          className="flex h-12 flex-1 items-center justify-center rounded-full bg-ink text-[15px] font-medium text-white disabled:opacity-40"
        >
          {i === N - 1 ? "Journey complete" : `Next: ${codeJourney[i + 1].kicker.split("· ")[1]} →`}
        </button>
      </div>
    </div>
  );
}

function Finale() {
  return (
    <div className="relative overflow-hidden bg-ink py-24 text-white md:py-36">
      <div className="grid-bg-dark absolute inset-0" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(18,181,212,.22),transparent_60%)]" aria-hidden="true" />
      <div className="container-x relative text-center">
        <Reveal>
          <p className="label !text-white/50">Patient encounter → documentation → terminology → diagnosis → code → claim → data</p>
          <p className="display mt-8 text-[48px] sm:text-7xl lg:text-[104px]">
            This is <span className="text-cyan">medical coding.</span>
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-8 text-xl text-white/70 md:text-2xl">Ready to learn it?</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/demo" variant="accent" size="lg">Book a free demo</ButtonLink>
            <ButtonLink href="/medical-coding" variant="outline-light" size="lg" icon={null}>
              Learn more about the field
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
