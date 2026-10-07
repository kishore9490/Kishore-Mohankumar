"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { formatNumber } from "@/lib/format";

const fmt = {
  number: (n: number) => formatNumber(Math.round(n)),
  plus: (n: number) => `${formatNumber(Math.round(n))}+`,
  percent: (n: number) => `${Math.round(n)}%`,
};

/** Big animated numeral for verified dealership metrics. */
export function MetricFigure({ value, kind = "number", className }: { value: number; kind?: keyof typeof fmt; className?: string }) {
  return <AnimatedNumber value={value} format={fmt[kind]} duration={1.4} className={className} />;
}
