"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/** "Currently building →" with a rotating status line. */
export function StatusTicker({ items, label = "Currently" }: { items: readonly string[]; label?: string }) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % items.length), 3200);
    return () => clearInterval(t);
  }, [items.length]);

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <span className="pulse" aria-hidden="true" />
      <span className="label shrink-0 whitespace-nowrap text-mute">
        {label} <span className="text-amber">→</span>
      </span>
      <span className="relative block h-[1.6em] min-w-0 flex-1 overflow-hidden sm:min-w-[16rem] sm:flex-none text-[15px] text-paper" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={i}
            className="absolute left-0 top-0 whitespace-nowrap"
            initial={reduced ? { opacity: 0 } : { y: "100%", opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {items[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}
