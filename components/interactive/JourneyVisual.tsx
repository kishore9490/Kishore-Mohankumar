"use client";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

const fade = {
  initial: { opacity: 0, y: 10, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -6, filter: "blur(4px)" },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
};

const NOTE = [
  { k: "CC", v: "Sore throat, nasal congestion, dry cough × 3 days." },
  { k: "EXAM", v: "Mild pharyngeal erythema. Lungs clear." },
  { k: "ASSESSMENT", v: "Acute upper respiratory infection." },
  { k: "PLAN", v: "Supportive care. Review if worse." },
];

const TERMS = [
  { t: "pharyngeal erythema", d: "redness of the throat" },
  { t: "upper respiratory", d: "nose, sinuses & throat" },
  { t: "acute", d: "sudden onset, short duration" },
];

const BARS = [0.82, 0.56, 0.68, 0.38, 0.74, 0.46, 0.6, 0.3];

/**
 * The fictional record at each stage of the Code Journey.
 * Content is cumulative: each stage adds a richer layer to the same record.
 */
export function JourneyVisual({ stage, compact }: { stage: number; compact?: boolean }) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[20px] border border-line bg-white shadow-[0_50px_120px_-50px_rgba(7,26,51,.5)]",
        compact ? "p-4" : "p-5 md:p-7",
      )}
    >
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />

      {/* Header: the encounter */}
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-soft text-blue">
            <Icon name="user" size={20} />
            {stage === 0 && (
              <span className="absolute inset-0 animate-ping rounded-full border border-cyan/60" aria-hidden="true" />
            )}
          </div>
          <div>
            <p className="text-[14px] font-semibold">Fictional patient · 29 y</p>
            <p className="text-[12px] text-muted">Outpatient clinic · established patient</p>
          </div>
        </div>
        <span className="label !text-[9.5px] shrink-0 rounded-full border border-line bg-white px-2 py-1">Demo data</span>
      </div>

      {/* Documentation */}
      <div className="relative mt-5 min-h-[188px] rounded-xl border border-line bg-white/90 p-4">
        <p className="label !text-[9.5px]">Clinical documentation</p>
        <AnimatePresence>
          {stage >= 1 ? (
            <motion.dl key="note" {...fade} className="mt-3 space-y-2">
              {NOTE.map((n, i) => (
                <motion.div
                  key={n.k}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.4 }}
                  className={cn(
                    "grid grid-cols-[92px_1fr] gap-2 text-[13px] leading-snug",
                    stage >= 3 && n.k !== "ASSESSMENT" && n.k !== "CC" && "opacity-45",
                  )}
                >
                  <dt className="font-mono text-[10.5px] tracking-wider text-muted">{n.k}</dt>
                  <dd className="text-ink/90">
                    {stage >= 2 ? <Highlight text={n.v} stage={stage} /> : n.v}
                  </dd>
                </motion.div>
              ))}
            </motion.dl>
          ) : (
            <motion.div key="empty" {...fade} className="mt-4 space-y-2.5" aria-hidden="true">
              {[82, 64, 74, 48].map((w, i) => (
                <div key={i} className="h-2.5 rounded-full bg-mist" style={{ width: `${w}%` }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Terminology glossary */}
      <AnimatePresence>
        {stage === 2 && (
          <motion.ul key="terms" {...fade} className="relative mt-3 flex flex-wrap gap-2">
            {TERMS.map((t) => (
              <li key={t.t} className="rounded-lg border border-cyan/40 bg-cyan/5 px-2.5 py-1.5 text-[12px]">
                <span className="font-medium">{t.t}</span> <span className="text-muted">→ {t.d}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Abstraction + coding */}
      <AnimatePresence>
        {stage >= 3 && (
          <motion.div key="abs" {...fade} className="relative mt-3 grid gap-2 sm:grid-cols-2">
            <AbsCard
              k="Diagnosis"
              v="Acute upper respiratory infection"
              code={stage >= 4 ? "J06.9" : undefined}
              system="ICD-10-CM"
            />
            <AbsCard k="Service" v="Office visit · established" code={stage >= 4 ? "99213" : undefined} system="CPT®" />
            {stage === 3 && (
              <p className="text-[11.5px] text-muted sm:col-span-2">
                Sore throat & cough are part of the confirmed diagnosis — generally not coded separately.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Claim */}
      <AnimatePresence>
        {stage >= 5 && (
          <motion.div key="claim" {...fade} className="relative mt-3 rounded-xl bg-ink p-4 text-white">
            <div className="flex items-center justify-between">
              <p className="label !text-[9.5px] !text-white/55">Claim · sample</p>
              <span className="code-chip rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-cyan">READY</span>
            </div>
            <div className="code-chip mt-3 grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-1.5 text-[11.5px]">
              <span className="text-white/45">01</span>
              <span className="text-white/80">Diagnosis pointer A</span>
              <span>J06.9</span>
              <span className="text-white/45">02</span>
              <span className="text-white/80">Service line</span>
              <span>99213</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Healthcare data */}
      <AnimatePresence>
        {stage >= 6 && (
          <motion.div key="data" {...fade} className="relative mt-3 rounded-xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="label !text-[9.5px]">Aggregated healthcare data</p>
              <span className="text-[10.5px] text-muted">Illustrative · no real data</span>
            </div>
            <div className="mt-3 flex h-16 items-end gap-1.5" aria-hidden="true">
              {BARS.map((b, i) => (
                <motion.div
                  key={i}
                  className={cn("flex-1 rounded-t-[3px]", i === 0 ? "bg-cyan" : "bg-blue/25")}
                  initial={{ height: 0 }}
                  animate={{ height: `${b * 100}%` }}
                  transition={{ delay: i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AbsCard({ k, v, code, system }: { k: string; v: string; code?: string; system: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-3">
      <p className="label !text-[9.5px]">{k}</p>
      <p className="mt-1 text-[13px] font-medium leading-snug">{v}</p>
      <AnimatePresence>
        {code && (
          <motion.p
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="code-chip mt-2 inline-flex items-center gap-2 rounded-md bg-ink px-2 py-1 text-white"
          >
            <span className="text-white/55">{system}</span>
            <span className="font-semibold text-cyan">{code}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Highlight({ text, stage }: { text: string; stage: number }) {
  const terms = ["pharyngeal erythema", "Acute upper respiratory infection", "Sore throat", "dry cough"];
  const re = new RegExp(`(${terms.join("|")})`, "gi");
  return (
    <>
      {text.split(re).map((part, i) => {
        const hit = terms.some((t) => t.toLowerCase() === part.toLowerCase());
        if (!hit) return <span key={i}>{part}</span>;
        const isDx = part.toLowerCase().startsWith("acute");
        return (
          <mark
            key={i}
            className={cn(
              "rounded-[4px] px-0.5 text-ink",
              isDx ? "bg-cyan/20 shadow-[inset_0_-1.5px_0_var(--color-cyan)]" : "bg-soft",
              stage >= 3 && !isDx && "line-through decoration-muted/60",
            )}
          >
            {part}
          </mark>
        );
      })}
    </>
  );
}
