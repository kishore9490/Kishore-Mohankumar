"use client";

import { useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity, motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";

/** A band that drifts on its own and accelerates with scroll velocity. */
export function VelocityMarquee({ children, baseSpeed = 2.4 }: { children: ReactNode; baseSpeed?: number }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 300 });
  const factor = useTransform(velocity, [-2000, 0, 2000], [-4, 0, 4], { clamp: false });
  const dir = useRef(1);
  const tx = useTransform(x, (v) => `${((v % 50) - 50) % 50}%`);

  useAnimationFrame((_, delta) => {
    if (reduced || !inView) return;
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    const move = dir.current * baseSpeed * (delta / 1000) * (1 + Math.abs(f));
    x.set(x.get() - move);
  });

  return (
    <div ref={ref} className="overflow-hidden" aria-hidden="true">
      <motion.div className="marquee-track" style={{ x: tx }}>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0">{children}</div>
      </motion.div>
    </div>
  );
}
