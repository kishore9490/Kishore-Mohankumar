"use client";

import { motion, useReducedMotion } from "motion/react";

/** Drawn checkmark used on every confirmation screen. */
export function SuccessMark({ size = 64 }: { size?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      initial={{ scale: reduce ? 1 : 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden
    >
      <circle cx="32" cy="32" r="31" fill="var(--color-go)" opacity="0.14" />
      <motion.circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke="var(--color-go)"
        strokeWidth="2"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.path
        d="M20 33l8 8 16-17"
        fill="none"
        stroke="var(--color-go)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.svg>
  );
}

export function SummaryList({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="divide-y divide-current/10 rounded-2xl border border-current/10">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-baseline justify-between gap-6 px-4 py-3.5 text-sm">
          <dt className="opacity-55">{k}</dt>
          <dd className="text-right font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
