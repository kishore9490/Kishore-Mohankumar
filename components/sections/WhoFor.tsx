"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { audienceProfiles } from "@/data/learning";
import { cn } from "@/lib/cn";
import { ButtonLink } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { StatusNote } from "@/components/ui/StatusNote";

const pathCopy = {
  beginner: { label: "Suggested start: Career Program", href: "/programs/medical-coding-career-program" },
  advanced: { label: "Suggested start: Advanced Coding", href: "/programs/advanced-medical-coding" },
  counselling: { label: "Suggested start: talk to a counsellor", href: "/counselling" },
};

export function WhoFor() {
  const [active, setActive] = useState(audienceProfiles[0].id);
  const p = audienceProfiles.find((a) => a.id === active)!;
  const next = pathCopy[p.suggestedPath];

  return (
    <Section tone="mist" aria-labelledby="who-title">
      <div className="container-x">
        <SectionHeader
          id="who-title"
          label="Who it’s for"
          title="Is medical coding for you?"
          intro="Pick the background closest to yours."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div role="tablist" aria-label="Backgrounds" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {audienceProfiles.map((a) => (
              <button
                key={a.id}
                role="tab"
                id={`who-tab-${a.id}`}
                aria-selected={a.id === active}
                aria-controls="who-panel"
                onClick={() => setActive(a.id)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-5 py-4 text-left transition-all duration-200",
                  a.id === active ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40",
                )}
              >
                <span className="text-[15.5px] font-medium">{a.title}</span>
                <span className={cn("font-mono text-[11px]", a.id === active ? "text-cyan" : "text-muted")}>
                  {a.id === active ? "●" : "○"}
                </span>
              </button>
            ))}
          </div>
          <div
            id="who-panel"
            role="tabpanel"
            aria-labelledby={`who-tab-${p.id}`}
            className="relative min-h-[360px] overflow-hidden rounded-2xl border border-line bg-white p-7 md:p-10"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex h-full flex-col"
              >
                <p className="label">{p.description}</p>
                <p className="heading mt-6 text-3xl md:text-[40px]">{p.title}</p>
                <p className="mt-5 text-[17px] leading-relaxed text-muted">{p.fit}</p>
                <div className="mt-auto pt-10">
                  <ButtonLink href={next.href} variant="outline">{next.label}</ButtonLink>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <StatusNote className="mt-6">
          These are common backgrounds, not admission criteria. EMC confirms exact eligibility for each program during
          counselling.
        </StatusNote>
      </div>
    </Section>
  );
}
