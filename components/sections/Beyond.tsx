"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { profile } from "@/data/profile";
import { cx } from "@/lib/utils";

export function Beyond() {
  const [on, setOn] = useState<number | null>(null);
  const items = profile.beyond;
  const current = on === null ? null : items[on];

  return (
    <section id="beyond" data-section="Beyond" aria-labelledby="beyond-title" className="relative pt-[22vh]">
      <div className="page-x flex items-center gap-3 text-mute">
        <span className="label">08</span>
        <span className="hairline w-10" aria-hidden="true" />
        <h2 id="beyond-title" className="label">
          Beyond the stack
        </h2>
      </div>

      <div className="page-x mt-10" onPointerLeave={() => setOn(null)}>
        <ul className="display flex flex-wrap items-baseline text-[clamp(2.6rem,8.2vw,9rem)] leading-[0.95]">
          {items.map((it, i) => (
            <li key={it.word} className="flex items-baseline">
              <button
                type="button"
                onPointerEnter={(e) => e.pointerType === "mouse" && setOn(i)}
                onFocus={() => setOn(i)}
                onClick={() => setOn(on === i ? null : i)}
                aria-describedby={on === i ? "beyond-line" : undefined}
                className={cx(
                  "uppercase transition-colors duration-500",
                  on === null ? "text-paper/85" : on === i ? "text-paper" : "text-ink-3 [-webkit-text-stroke:1px_rgb(236_230_220/0.18)]",
                )}
              >
                {it.word}
              </button>
              <span aria-hidden="true" className="text-amber">
                {i < items.length - 1 ? "," : "."}
              </span>
              <span aria-hidden="true">&nbsp;</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex min-h-[3.5rem] items-start gap-4 border-t border-line pt-5">
          <span className="label text-dim">Note</span>
          <AnimatePresence mode="wait">
            <motion.p
              key={current?.word ?? "none"}
              id="beyond-line"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="text-lg text-paper"
            >
              {current ? current.line : <span className="text-mute">Hover a word. There&apos;s a person behind the stack.</span>}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
