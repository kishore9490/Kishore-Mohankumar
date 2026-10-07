"use client";
import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { verifiedStats } from "@/data/stats";

/** Animated, sourced statistics. Hidden entirely until EMC supplies verified numbers. */
export function Stats() {
  if (!verifiedStats.length) return null;
  return (
    <section aria-label="EMC in numbers" className="border-y border-line py-14">
      <dl className="container-x grid grid-cols-2 gap-8 md:grid-cols-4">
        {verifiedStats.map((s) => (
          <div key={s.id}>
            <dt className="label">{s.label}</dt>
            <dd className="display mt-3 text-5xl">
              {s.prefix}
              <Counter to={s.value} />
              {s.suffix}
            </dd>
            <p className="mt-2 text-[11.5px] text-muted">Source: {s.source}</p>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to, reduce]);
  return <span ref={ref}>{v.toLocaleString("en-IN")}</span>;
}
