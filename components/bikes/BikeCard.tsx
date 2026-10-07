import Link from "next/link";
import type { ReactNode } from "react";
import type { Bike } from "@/lib/types";
import { categoryLabels, startingPrice } from "@/data/bikes";
import { cn, formatINR, formatNumber } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { BikeVisual } from "./BikeVisual";

/**
 * Studio tile for a model. The whole tile links to the product page.
 * `action` renders above the link (top-right corner) so interactive controls
 * such as "Compare" never nest inside the anchor.
 *
 * Server-compatible — no client hooks.
 */
export function BikeCard({
  bike,
  index,
  action,
  headingLevel = "h3",
  className,
  priority,
}: {
  bike: Bike;
  /** Optional running number shown in the eyebrow ("01"). */
  index?: number;
  /** Control rendered in the top-right corner, outside the link. */
  action?: ReactNode;
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
  priority?: boolean;
}) {
  const Heading = headingLevel;
  const from = startingPrice(bike);
  const s = bike.specs;
  return (
    <article className={cn("group/card relative", className)}>
      <Link
        href={`/bikes/${bike.slug}`}
        className="block overflow-hidden rounded-[28px] bg-ink text-bone ring-1 ring-white/[0.06] transition-[box-shadow,transform] duration-500 ease-[var(--ease-out-expo)] hover:shadow-[0_30px_60px_-30px_rgb(0_0_0/0.55)] focus-visible:outline-offset-4"
      >
        {/* studio */}
        <div className="relative aspect-[16/11] overflow-hidden">
          <div className="studio-glow absolute inset-0" aria-hidden />
          <div className="absolute inset-x-6 bottom-[19%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden />
          {/* light sweep */}
          <div
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent opacity-0 transition-[transform,opacity] duration-[1100ms] ease-[var(--ease-out-expo)] group-hover/card:translate-x-[320%] group-hover/card:opacity-100 motion-reduce:hidden"
            aria-hidden
          />
          <p className="eyebrow absolute left-5 top-5 flex items-center gap-2 text-bone/60">
            {index !== undefined && <span className="tabular text-bone/40">{String(index + 1).padStart(2, "0")}</span>}
            <span>{categoryLabels[bike.category]}</span>
          </p>
          <div className="absolute inset-x-[5%] bottom-[8%] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/card:-translate-y-1 group-hover/card:translate-x-2 motion-reduce:transform-none">
            <BikeVisual bike={bike} priority={priority} sizes="(min-width: 1024px) 30vw, 90vw" />
          </div>

        </div>

        {/* caption */}
        <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <Heading className="font-display text-[1.65rem] leading-none">{bike.name}</Heading>
          <p className="mt-2 text-sm text-bone/60">{bike.tagline}</p>
          <p className="eyebrow mt-4 text-[10px] text-bone/45">
            <span className="tabular">{Math.round(s.displacementCc)}</span> cc · <span className="tabular">{formatNumber(s.powerPs)}</span> PS
            {s.mileageKmpl ? (
              <>
                {" "}
                · ~<span className="tabular">{s.mileageKmpl}</span> km/l*
              </>
            ) : null}
          </p>
          <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/10 pt-4">
            <p className="min-w-0">
              <span className="block text-[12px] text-bone/50">From · ex-showroom*</span>
              <span className="mt-0.5 block text-xl font-medium tabular tracking-tight">{formatINR(from)}</span>
            </p>
            <span
              className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 transition-[background-color,border-color,color] duration-300 group-hover/card:border-bone group-hover/card:bg-bone group-hover/card:text-ink"
              aria-hidden
            >
              <Icon name="arrow-right" size={18} />
            </span>
          </div>
        </div>
      </Link>
      {action && <div className="absolute right-4 top-4 z-10">{action}</div>}
    </article>
  );
}
