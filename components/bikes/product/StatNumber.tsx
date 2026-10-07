"use client";

import { useCallback } from "react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { formatINR } from "@/lib/format";

/** Serializable wrapper around AnimatedNumber for server components. */
export function StatNumber({ value, decimals = 0, currency, className }: { value: number; decimals?: number; currency?: boolean; className?: string }) {
  const format = useCallback(
    (n: number) =>
      currency
        ? formatINR(n)
        : n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    [decimals, currency],
  );
  return <AnimatedNumber value={value} format={format} className={className} />;
}
