"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Above-the-fold masked headline. Animates on mount (not in-view) so the
 * clipped lines can never get stuck hidden at very large display sizes.
 */
export function HeroTitle({ lines, className, delay = 0 }: { lines: string[]; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className="block"
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            transition={{ duration: reduce ? 0.2 : 1.1, delay: delay + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
