"use client";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { HeroConsole, type HeroStage } from "./HeroConsole";
import { IntroModal } from "./IntroModal";

const DataFlowScene = dynamic(() => import("@/components/3d/DataFlowScene"), { ssr: false });

const PIPE = [
  { label: "Clinical information", short: "Clinical info", stages: [0, 1] },
  { label: "Medical coding", short: "Coding", stages: [2, 3] },
  { label: "Revenue cycle", short: "Revenue cycle", stages: [4] },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const [stage, setStage] = useState<HeroStage>(0);
  const [visible, setVisible] = useState(true);
  const [introOpen, setIntroOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const onStage = useCallback((s: HeroStage) => setStage(s), []);

  // Pause the 3D loop when the hero is off-screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const show3D = desktop && !reduce;
  const d = (n: number) => (reduce ? 0 : n);

  return (
    <section
      ref={ref}
      aria-labelledby="hero-title"
      className="relative -mt-16 overflow-hidden pb-16 pt-28 md:-mt-[72px] md:pt-36 lg:min-h-[100svh] lg:pb-20"
    >
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_80%_70%_at_70%_40%,black,transparent)] opacity-70" />
        <div className="absolute -right-40 -top-40 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(18,181,212,.13),transparent_65%)]" />
        <div className="absolute -left-40 top-1/2 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(31,95,209,.08),transparent_65%)]" />
      </div>

      <div className="container-x relative grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.08fr] lg:gap-10">
        {/* Copy */}
        <div className="relative z-10 min-w-0">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: d(0.1), ease }}
            className="label flex items-center gap-2"
          >
            <span className="inline-block h-px w-6 bg-cyan" aria-hidden="true" />
            Experts Medical Coding Academy
          </motion.p>

          <h1 id="hero-title" className="display mt-6 text-[44px] sm:text-[64px] lg:text-[76px] xl:text-[88px]">
            <motion.span
              className="block"
              initial={{ opacity: 0, y: reduce ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: d(0.25), ease }}
            >
              Turn medical
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: reduce ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: d(0.38), ease }}
            >
              knowledge
            </motion.span>
            <motion.span
              className="block text-blue"
              initial={{ opacity: 0, y: reduce ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: d(0.51), ease }}
            >
              into a career<span className="text-cyan">.</span>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: d(0.7), ease }}
            className="mt-7 max-w-[34rem] text-[17px] leading-relaxed text-muted md:text-[19px]"
          >
            Learn medical coding through structured training, practical learning and career-focused guidance — and
            understand exactly how a patient record becomes standardised healthcare data.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: d(0.85), ease }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <ButtonLink href="/programs" size="lg">Explore programs</ButtonLink>
            <ButtonLink href="/counselling" size="lg" variant="outline" icon={null}>
              Book a free counselling session
            </ButtonLink>
          </motion.div>
          <motion.button
            type="button"
            onClick={() => setIntroOpen(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: d(1) }}
            className="group mt-6 inline-flex items-center gap-3 text-[14px] font-medium text-ink"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white transition-colors group-hover:border-ink">
              <Icon name="play" size={14} className="translate-x-[1px] fill-ink" />
            </span>
            Watch course intro
            <span className="label !text-[10px]">· 60 sec</span>
          </motion.button>
        </div>

        {/* Visual */}
        <div className="relative min-w-0">
          {show3D && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.6, delay: 0.2 }}
              className="absolute -inset-x-24 -top-20 h-[340px]"
            >
              <DataFlowScene active={visible} />
            </motion.div>
          )}

          {/* Pipeline labels — mapped to the console stages */}
          <ol
            className={cn(
              "relative z-10 mb-5 grid grid-cols-3 gap-2 text-center lg:mb-0 lg:h-[250px] lg:items-start lg:pt-0",
            )}
            aria-label="What medical coding does"
          >
            {PIPE.map((p, i) => {
              const on = p.stages.includes(stage);
              const done = Math.max(...p.stages) < stage;
              return (
                <li key={p.label} className="flex flex-col items-center gap-2">
                  <span
                    className={cn(
                      "label whitespace-nowrap !text-[9.5px] !tracking-[0.08em] sm:!text-[10.5px] sm:!tracking-[0.14em] rounded-full border px-2.5 py-1 transition-all duration-500",
                      on ? "border-cyan bg-white !text-ink shadow-[0_0_0_4px_rgba(18,181,212,.12)]" : "border-line bg-white/80",
                      done && "!text-ink",
                    )}
                  >
                    <span className="sm:hidden">{p.short}</span>
                    <span className="hidden sm:inline">{p.label}</span>
                  </span>
                  <span className="font-mono text-[10px] text-muted/70">{String(i + 1).padStart(2, "0")}</span>
                </li>
              );
            })}
          </ol>


          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: d(0.6), ease }}
            className="relative z-10"
          >
            <HeroConsole onStage={onStage} startDelay={reduce ? 0 : 1.2} />
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="container-x relative mt-14 hidden items-center gap-3 lg:flex" aria-hidden="true">
        <span className="h-px w-10 bg-line" />
        <span className="label">Scroll to follow a record’s journey</span>
      </div>

      <IntroModal open={introOpen} onClose={() => setIntroOpen(false)} />
    </section>
  );
}
