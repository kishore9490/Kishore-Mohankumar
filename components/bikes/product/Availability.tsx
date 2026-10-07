import type { BikeVariant } from "@/lib/types";
import { cn } from "@/lib/format";

export const availabilityLabel: Record<BikeVariant["availability"], string> = {
  "in-stock": "In stock",
  limited: "Limited stock",
  "on-order": "On order",
};

const dot: Record<BikeVariant["availability"], string> = {
  "in-stock": "bg-go",
  limited: "bg-amber",
  "on-order": "bg-smoke",
};

/** Small status dot + label. Availability is indicative — confirmed by the showroom. */
export function Availability({
  status,
  tone = "light",
  className,
}: {
  status: BikeVariant["availability"];
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[13px]", tone === "dark" ? "text-bone/70" : "opacity-75", className)}>
      <span className="relative flex size-2" aria-hidden>
        {status === "in-stock" && <span className="absolute inset-0 animate-ping rounded-full bg-go opacity-50 motion-reduce:hidden" />}
        <span className={cn("relative size-2 rounded-full", dot[status])} />
      </span>
      {availabilityLabel[status]}
    </span>
  );
}
