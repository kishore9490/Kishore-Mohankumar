"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { careerRoles } from "@/data/careers";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

export function CareerRoles() {
  const [active, setActive] = useState(careerRoles[0].id);
  const r = careerRoles.find((x) => x.id === active)!;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <ul className="grid gap-2 sm:grid-cols-2" role="tablist" aria-label="Potential roles">
        {careerRoles.map((x, i) => (
          <li key={x.id}>
            <button
              role="tab"
              aria-selected={x.id === active}
              aria-controls="role-panel"
              onClick={() => setActive(x.id)}
              className={cn(
                "flex h-full min-h-[112px] w-full flex-col justify-between rounded-xl border p-4 text-left transition-all duration-200",
                x.id === active ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40",
              )}
            >
              <span className={cn("font-mono text-[10.5px]", x.id === active ? "text-cyan" : "text-muted")}>
                R/{String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-4 text-[16px] font-semibold leading-snug tracking-tight">{x.title}</span>
            </button>
          </li>
        ))}
      </ul>
      <div id="role-panel" role="tabpanel" className="rounded-2xl border border-line bg-white p-6 md:p-9">
        <AnimatePresence mode="wait">
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <p className="label">Roles may include</p>
            <h3 className="heading mt-3 text-3xl md:text-4xl">{r.title}</h3>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">{r.involves}</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {[
                ["Typical skills", r.skills],
                ["What to learn", r.learn],
                ["Potential next steps", r.nextSteps],
              ].map(([k, list]) => (
                <div key={k as string}>
                  <p className="label">{k as string}</p>
                  <ul className="mt-3 space-y-2">
                    {(list as string[]).map((s) => (
                      <li key={s} className="flex gap-2 text-[14px] leading-snug">
                        <Icon name="check" size={14} className="mt-[3px] shrink-0 text-cyan-ink" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
