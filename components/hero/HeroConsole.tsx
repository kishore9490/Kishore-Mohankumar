"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { heroCase } from "@/data/lab";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

const STAGES = ["Note", "Terms", "Abstract", "Code", "Claim"] as const;
export type HeroStage = 0 | 1 | 2 | 3 | 4;

/** Splits the note so highlight phrases can be wrapped. */
function segments(note: string, phrases: string[]) {
  const re = new RegExp(`(${phrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return note.split(re).map((text) => ({ text, hit: phrases.some((p) => p.toLowerCase() === text.toLowerCase()) }));
}

/**
 * "Medical record → code" micro-demo. Auto-plays once after the hero intro,
 * then lets the visitor step through. Fictional data, illustration only.
 */
export function HeroConsole({ onStage, startDelay = 1.1 }: { onStage?: (s: HeroStage) => void; startDelay?: number }) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<HeroStage>(reduce ? 4 : 0);
  const [typed, setTyped] = useState(reduce ? heroCase.note.length : 0);
  const [auto, setAuto] = useState(!reduce);
  const timers = useRef<number[]>([]);

  useEffect(() => onStage?.(stage), [stage, onStage]);

  // Typewriter for the clinical note, then auto-advance through the stages once.
  useEffect(() => {
    if (!auto) return;
    const t = timers.current;
    let i = 0;
    const start = window.setTimeout(() => {
      const iv = window.setInterval(() => {
        i += 3;
        setTyped(Math.min(i, heroCase.note.length));
        if (i >= heroCase.note.length) {
          window.clearInterval(iv);
          [1, 2, 3, 4].forEach((s, idx) =>
            t.push(window.setTimeout(() => setStage(s as HeroStage), 700 + idx * 1500)),
          );
          t.push(window.setTimeout(() => setAuto(false), 700 + 4 * 1500));
        }
      }, 18);
      t.push(iv as unknown as number);
    }, startDelay * 1000);
    t.push(start);
    return () => t.forEach((id) => (window.clearTimeout(id), window.clearInterval(id)));
  }, [auto, startDelay]);

  const go = (s: HeroStage) => {
    timers.current.forEach((id) => (window.clearTimeout(id), window.clearInterval(id)));
    setAuto(false);
    setTyped(heroCase.note.length);
    setStage(s);
  };

  const replay = () => {
    timers.current.forEach((id) => (window.clearTimeout(id), window.clearInterval(id)));
    setStage(0);
    setTyped(0);
    setAuto(true);
  };

  const shown = heroCase.note.slice(0, typed);
  const segs = segments(shown, heroCase.highlights);

  return (
    <div className="relative w-full overflow-hidden rounded-[18px] border border-line bg-white/90 shadow-[0_40px_100px_-40px_rgba(7,26,51,.45)] backdrop-blur-xl">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-[pulse-dot_1.8s_ease-in-out_infinite] rounded-full bg-cyan" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
          </span>
          <span className="label !text-[10px] !tracking-[0.1em]">{heroCase.label}</span>
        </div>
        <button
          type="button"
          onClick={replay}
          className="label shrink-0 !text-[10px] rounded-md px-1.5 py-1 transition-colors hover:text-ink"
          aria-label="Replay the demonstration"
        >
          ↻<span className="hidden sm:inline"> Replay</span>
        </button>
      </div>

      {/* Stage tabs */}
      <div role="tablist" aria-label="Coding steps" className="no-scrollbar flex overflow-x-auto border-b border-line px-2">
        {STAGES.map((s, i) => (
          <button
            key={s}
            role="tab"
            aria-selected={stage === i}
            onClick={() => go(i as HeroStage)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-[12.5px] font-medium transition-colors",
              stage >= i ? "text-ink" : "text-muted/70 hover:text-muted",
            )}
          >
            <span className="font-mono text-[10px] text-muted">{String(i + 1).padStart(2, "0")}</span>
            {s}
            {stage === i && (
              <motion.span layoutId="hero-tab" className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-cyan" />
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-0 sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* Clinical note */}
        <div className="border-b border-line p-4 sm:border-b-0 sm:border-r md:p-5">
          <p className="label !text-[10px]">Clinical documentation</p>
          <p className="mt-3 min-h-[124px] text-[14px] leading-[1.65] text-ink/85" aria-live="off">
            {segs.map((seg, i) =>
              seg.hit ? (
                <mark
                  key={i}
                  className={cn(
                    "rounded-[4px] px-0.5 transition-colors duration-500",
                    stage >= 1 ? "bg-cyan/15 text-ink shadow-[inset_0_-1.5px_0_var(--color-cyan)]" : "bg-transparent text-inherit",
                  )}
                >
                  {seg.text}
                </mark>
              ) : (
                <Fragment key={i}>{seg.text}</Fragment>
              ),
            )}
            {typed < heroCase.note.length && (
              <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-[caret_1s_steps(1)_infinite] bg-ink" />
            )}
          </p>
        </div>

        {/* Structured output */}
        <div className="relative bg-mist/60 p-4 md:p-5">
          <p className="label !text-[10px]">Structured output</p>
          <div className="mt-3 space-y-2.5">
            <AnimatePresence initial={false}>
              {stage >= 2 && (
                <motion.div
                  key="abs"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1.5"
                >
                  <Row k="Diagnosis" v={heroCase.diagnosis} />
                  <Row k="Service" v={heroCase.service} />
                </motion.div>
              )}
              {stage >= 3 && (
                <motion.div key="codes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 pt-1">
                  {heroCase.codes.map((c, i) => (
                    <motion.span
                      key={c.code}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.15 }}
                      className="code-chip inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-white px-2 py-1.5"
                    >
                      <span className="text-muted">{c.system}</span>
                      <span className="font-semibold text-ink">{c.code}</span>
                    </motion.span>
                  ))}
                </motion.div>
              )}
              {stage >= 4 && (
                <motion.div
                  key="claim"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-ink p-3 text-white"
                >
                  <div className="flex items-center justify-between">
                    <span className="label !text-[9.5px] !text-white/55">Claim line · sample</span>
                    <Icon name="check" size={14} className="text-cyan" />
                  </div>
                  <div className="code-chip mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-white/85">
                    <span className="text-white/45">DX</span>
                    <span>{heroCase.codes[0].code}</span>
                    <span className="text-white/45">SVC</span>
                    <span>{heroCase.codes[1].code}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {stage < 2 && (
              <div className="space-y-2" aria-hidden="true">
                {[70, 52, 84].map((w, i) => (
                  <div key={i} className="h-2.5 rounded-full bg-line/80" style={{ width: `${w}%` }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="border-t border-line px-4 py-2.5 text-[11px] leading-snug text-muted">
        Educational illustration with fictional data — not a coding recommendation. Real coding depends on full
        documentation and current guidelines.
      </p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-line pb-1.5 text-[13px]">
      <span className="shrink-0 text-muted">{k}</span>
      <span className="min-w-0 text-right font-medium text-ink">{v}</span>
    </div>
  );
}
