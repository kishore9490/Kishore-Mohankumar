"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { enabledLearningFeatures } from "@/data/learning";
import { cn } from "@/lib/cn";
import { Section, SectionHeader } from "@/components/ui/Section";
import { StatusNote } from "@/components/ui/StatusNote";
import { Icon } from "@/components/ui/Icon";

export function LearningExperience() {
  const [active, setActive] = useState(enabledLearningFeatures[0]?.id);
  if (!enabledLearningFeatures.length) return null;
  const f = enabledLearningFeatures.find((x) => x.id === active)!;

  return (
    <Section id="learning" tone="dark" aria-labelledby="learning-title" className="overflow-hidden">
      <div className="grid-bg-dark absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="container-x relative">
        <SectionHeader
          dark
          id="learning-title"
          label="Learning experience"
          title={<>What studying at EMC <span className="text-cyan">feels like.</span></>}
          intro="Concept, case, practice, feedback — repeated until accuracy becomes instinct."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <ul role="tablist" aria-label="Learning features" className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-1">
            {enabledLearningFeatures.map((x, i) => (
              <li key={x.id}>
                <button
                  role="tab"
                  aria-selected={x.id === active}
                  aria-controls="learning-panel"
                  onClick={() => setActive(x.id)}
                  className={cn(
                    "group flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-colors",
                    x.id === active ? "bg-white text-ink" : "text-white/70 hover:bg-white/[.05] hover:text-white",
                  )}
                >
                  <span className={cn("font-mono text-[11px]", x.id === active ? "text-cyan-ink" : "text-white/35")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[15.5px] font-medium">{x.title}</span>
                  <Icon name="arrow" size={15} className={cn("ml-auto transition-opacity", x.id === active ? "opacity-100" : "opacity-0")} />
                </button>
              </li>
            ))}
          </ul>

          <div id="learning-panel" role="tabpanel" className="relative min-h-[420px] overflow-hidden rounded-2xl border border-white/10 bg-white/[.03] p-6 md:p-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <h3 className="heading text-3xl md:text-4xl">{f.title}</h3>
                <p className="mt-3 max-w-md text-[16px] text-white/65">{f.description}</p>
                <div className="mt-9">
                  <Mock id={f.id} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <StatusNote dark className="mt-6">
          Features shown are configurable and reflect EMC’s intended learning model; exact delivery is confirmed during counselling.
        </StatusNote>
      </div>
    </Section>
  );
}

/** Small UI vignettes — purely illustrative, no data. */
function Mock({ id }: { id: string }) {
  const card = "rounded-xl border border-white/10 bg-ink/60 p-4";
  switch (id) {
    case "live":
      return (
        <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
          <div className={cn(card, "flex aspect-video items-center justify-center")}>
            <div className="text-center">
              <p className="code-chip text-cyan">ICD-10-CM · Conventions</p>
              <p className="mt-2 text-[13px] text-white/60">Session in progress</p>
            </div>
          </div>
          <div className={cn(card, "space-y-2")}>
            <p className="label !text-white/45">Notes</p>
            {["“Use” vs “code also”", "Excludes1 vs Excludes2", "Laterality"].map((t) => (
              <p key={t} className="text-[13px] text-white/80">— {t}</p>
            ))}
          </div>
        </div>
      );
    case "cases":
      return (
        <div className={card}>
          <p className="label !text-white/45">Case · fictional</p>
          <p className="mt-3 text-[14px] leading-relaxed text-white/85">
            “56-year-old presents for follow-up of <mark className="rounded bg-cyan/25 px-0.5 text-white">essential hypertension</mark>,
            well controlled…”
          </p>
          <div className="mt-4 flex gap-2">
            <span className="code-chip rounded bg-white/10 px-2 py-1">Abstract</span>
            <span className="code-chip rounded bg-white/10 px-2 py-1">Code</span>
            <span className="code-chip rounded bg-cyan px-2 py-1 text-ink">Review</span>
          </div>
        </div>
      );
    case "exercises":
      return (
        <div className={cn(card, "space-y-2")}>
          {["I10", "I11.9", "I15.9"].map((c, i) => (
            <div key={c} className={cn("flex items-center gap-3 rounded-lg border px-3 py-2.5", i === 0 ? "border-cyan bg-cyan/10" : "border-white/10")}>
              <span className="code-chip w-12 text-cyan">{c}</span>
              <span className="h-2 flex-1 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      );
    case "assessments":
    case "mocks":
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className={card}>
            <p className="label !text-white/45">Time</p>
            <p className="mt-3 font-mono text-4xl tracking-tight">24:10</p>
          </div>
          <div className={cn(card, "flex items-center justify-center")}>
            <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90" aria-hidden="true">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#12b5d4" strokeWidth="3" strokeDasharray="97" strokeDashoffset="30" strokeLinecap="round" />
            </svg>
          </div>
          <p className="col-span-2 text-[12px] text-white/45">Illustration — no real scores.</p>
        </div>
      );
    case "mentor":
    case "doubts":
      return (
        <div className={cn(card, "space-y-3")}>
          <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-white px-3.5 py-2 text-[13px] text-ink">
            When do I code a symptom separately?
          </p>
          <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-white/10 px-3.5 py-2 text-[13px] text-white/85">
            Good question — let’s look at the guideline together and apply it to your case.
          </p>
        </div>
      );
    case "progress":
      return (
        <div className={cn(card, "space-y-3")}>
          {["Terminology", "Anatomy", "ICD-10-CM", "CPT®"].map((m, i) => (
            <div key={m}>
              <div className="flex justify-between text-[12.5px] text-white/70">
                <span>{m}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-cyan"
                  initial={{ width: 0 }}
                  animate={{ width: `${[100, 100, 60, 15][i]}%` }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                />
              </div>
            </div>
          ))}
        </div>
      );
    default:
      return (
        <ul className={cn(card, "space-y-2.5")}>
          {["Résumé review", "Interview practice", "Certification pathway guidance", "Next-step plan"].map((t) => (
            <li key={t} className="flex items-center gap-3 text-[14px] text-white/85">
              <Icon name="check" size={16} className="text-cyan" /> {t}
            </li>
          ))}
        </ul>
      );
  }
}
