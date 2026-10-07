"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

/** Fades/lifts content into view once. Collapses to a plain fade with reduced motion. */
export function Reveal({
  delay = 0,
  y = 28,
  className,
  children,
  as = "div",
  ...rest
}: { delay?: number; y?: number; as?: "div" | "li" | "section" | "span" } & HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: reduce ? 0.2 : 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Line-by-line masked headline reveal. The observer sits on the (unclipped) wrapper. */
export function RevealLines({ lines, className, delay = 0 }: { lines: string[]; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={className ? `block ${className}` : "block"}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -5% 0px" }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className="block"
            variants={{
              hidden: { y: reduce ? 0 : "105%", opacity: reduce ? 0 : 1 },
              shown: { y: 0, opacity: 1 },
            }}
            transition={{ duration: reduce ? 0.2 : 1.1, delay: delay + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
