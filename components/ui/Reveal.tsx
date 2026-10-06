"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "span" | "p" | "li";
  /** Slide up from a mask (for display headings) instead of a fade. */
  lines?: boolean;
};

/** Enters once when scrolled into view. Reduced motion → plain fade. */
export function Reveal({ children, className, delay = 0, as = "div", lines }: Props) {
  const reduced = useReducedMotion();
  const Tag = motion[as];
  if (lines) {
    return (
      // Observe the (unclipped) wrapper; the inner line slides up from its mask.
      <Tag
        className={`block overflow-hidden pb-[0.06em] ${className ?? ""}`}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      >
        <motion.span
          className="block"
          variants={{
            hidden: reduced ? { opacity: 0 } : { y: "105%" },
            show: reduced ? { opacity: 1 } : { y: 0 },
          }}
          transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.span>
      </Tag>
    );
  }
  return (
    <Tag
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}
