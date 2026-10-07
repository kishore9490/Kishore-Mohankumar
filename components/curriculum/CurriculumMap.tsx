"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { CurriculumModule } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

/**
 * Interactive curriculum map. Nodes are grouped by phase; selecting a node opens
 * its description, objective, example and stage. Works with any subset of modules.
 */
export function CurriculumMap({ modules, dark }: { modules: CurriculumModule[]; dark?: boolean }) {
  const [active, setActive] = useState(modules[0]?.id);
  const m = modules.find((x) => x.id === active) ?? modules[0];
  const idx = modules.findIndex((x) => x.id === m.id);
  const phases = Array.from(new Set(modules.map((x) => x.phase)));

  return (
    <div className={cn("grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12", dark && "text-white")}>
      {/* Map */}
      <div>
        {phases.map((phase) => (
          <div key={phase} className="relative mb-7 last:mb-0">
            <p className={cn("label mb-3", dark && "!text-white/50")}>{phase}</p>
            <ol className="flex flex-wrap gap-2">
              {modules
                .filter((x) => x.phase === phase)
                .map((x) => {
                  const i = modules.indexOf(x);
                  const on = x.id === m.id;
                  const past = i < idx;
                  return (
                    <li key={x.id}>
                      <button
                        type="button"
                        onClick={() => setActive(x.id)}
                        aria-pressed={on}
                        aria-controls="curriculum-detail"
                        className={cn(
                          "group relative flex items-center gap-2.5 rounded-full border py-2 pl-2 pr-4 text-[14px] font-medium transition-all duration-200",
                          on
                            ? "border-cyan bg-cyan text-ink shadow-[0_10px_30px_-12px_rgba(18,181,212,.9)]"
                            : dark
                              ? "border-white/15 bg-white/[.03] text-white/85 hover:border-white/40"
                              : "border-line bg-white text-ink hover:border-ink/40",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-full font-mono text-[10.5px]",
                            on ? "bg-ink text-white" : past ? (dark ? "bg-white/15" : "bg-soft text-blue") : dark ? "bg-white/5 text-white/60" : "bg-mist text-muted",
                          )}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {x.label}
                      </button>
                    </li>
                  );
                })}
            </ol>
          </div>
        ))}
        {/* Progress line */}
        <div className={cn("mt-8 h-[3px] w-full overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-line")} aria-hidden="true">
          <motion.div
            className="h-full bg-cyan"
            animate={{ width: `${((idx + 1) / modules.length) * 100}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Detail */}
      <div
        id="curriculum-detail"
        aria-live="polite"
        className={cn(
          "relative overflow-hidden rounded-2xl border p-6 md:p-8 lg:min-h-[440px]",
          dark ? "border-white/10 bg-white/[.04]" : "border-line bg-white shadow-[0_30px_80px_-50px_rgba(7,26,51,.4)]",
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between">
              <span className={cn("label", dark && "!text-white/50")}>
                Stage {idx + 1} of {modules.length} · {m.phase}
              </span>
              <span className="code-chip rounded-md bg-ink px-2 py-1 text-cyan">{m.label}</span>
            </div>
            <h3 className="heading mt-6 text-[28px] md:text-[34px]">{m.title}</h3>
            <p className={cn("mt-4 text-[16px] leading-relaxed", dark ? "text-white/70" : "text-muted")}>{m.summary}</p>

            <dl className="mt-7 space-y-5">
              <div>
                <dt className={cn("label", dark && "!text-white/50")}>Learning objective</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed">{m.objective}</dd>
              </div>
              <div>
                <dt className={cn("label", dark && "!text-white/50")}>Example</dt>
                <dd className={cn("mt-1.5 rounded-lg border-l-2 border-cyan py-1 pl-3 text-[15px] leading-relaxed", dark ? "text-white/80" : "text-ink/85")}>
                  {m.example}
                </dd>
              </div>
              <div>
                <dt className={cn("label", dark && "!text-white/50")}>Topics</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {m.topics.map((t) => (
                    <span key={t} className={cn("rounded-md px-2 py-1 text-[12.5px]", dark ? "bg-white/8 text-white/80" : "bg-mist text-ink/80")}>
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex gap-2">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => setActive(modules[idx - 1].id)}
                className={cn("flex h-10 w-10 items-center justify-center rounded-full border disabled:opacity-30", dark ? "border-white/20" : "border-line")}
                aria-label="Previous module"
              >
                <Icon name="arrow" size={16} className="rotate-180" />
              </button>
              <button
                type="button"
                disabled={idx === modules.length - 1}
                onClick={() => setActive(modules[idx + 1].id)}
                className={cn("flex h-10 w-10 items-center justify-center rounded-full border disabled:opacity-30", dark ? "border-white/20" : "border-line")}
                aria-label="Next module"
              >
                <Icon name="arrow" size={16} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
