"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Bike, BikeColor } from "@/lib/types";
import { BikeVisual } from "@/components/bikes/BikeVisual";
import { cn } from "@/lib/format";
import { accessories as catalogue } from "@/data/accessories";

/** True when licensed photography replaces the silhouette (accessories are then not drawn). */
export const hasPhoto = (bike: Bike, color?: BikeColor) => !!((color ?? bike.colors[0])?.image ?? bike.heroImage);

/** Accessories the studio silhouette can actually draw. Others are "not pictured". */
export const DRAWABLE_ACCESSORIES = new Set([
  "crash-guard",
  "frame-slider",
  "saree-guard",
  "back-rest",
  "top-box",
  "tank-pad",
  "tank-bag",
  "knee-pads",
  "side-step",
  "floor-mat",
  "mobile-holder",
]);

/**
 * Dark studio stage for the accessory configurator. The bike slides in on a
 * model change; accessory changes cross-fade so new parts "settle" onto it.
 */
export function AccessoryStudio({
  bike,
  color,
  accessoryIds,
  className,
  children,
  priority,
}: {
  bike: Bike;
  color?: BikeColor;
  accessoryIds: string[];
  className?: string;
  children?: React.ReactNode;
  priority?: boolean;
}) {
  const reduce = useReducedMotion();
  const photo = hasPhoto(bike, color);
  const drawn = photo ? [] : accessoryIds.filter((id) => DRAWABLE_ACCESSORIES.has(id)).sort();
  const fittedNames = photo ? catalogue.filter((a) => accessoryIds.includes(a.id)).map((a) => a.name) : [];
  const buildKey = `${bike.slug}:${color?.id ?? ""}:${drawn.join(",")}`;

  return (
    <div
      className={cn(
        "grain relative isolate overflow-hidden rounded-[28px] border border-white/[0.07] bg-ink-2 text-bone",
        className,
      )}
    >
      {/* Studio lighting */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_38%,rgb(255_255_255/0.09),transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgb(0_0_0/0.55),transparent)]" />
        <div className="absolute inset-x-[12%] bottom-[16%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />
      </div>

      <div className="relative grid px-[4%] pb-[9%] pt-[16%] sm:pt-[12%]">
        <AnimatePresence initial={false}>
          <motion.div
            key={buildKey}
            className="[grid-area:1/1]"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.985, filter: reduce ? "none" : "brightness(1.25)" }}
            animate={{ opacity: 1, scale: 1, filter: "brightness(1)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <BikeVisual bike={bike} color={color} accessories={drawn} priority={priority} />
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Photography can't show accessories, so list them on the stage instead. */}
      {fittedNames.length > 0 && (
        <ul aria-label="Fitted accessories" className="absolute inset-x-0 bottom-16 flex flex-wrap gap-1.5 px-5 md:bottom-20 md:px-7">
          {fittedNames.map((n) => (
            <li key={n} className="rounded-full border border-white/15 bg-ink/60 px-3 py-1 text-xs text-bone/80 backdrop-blur-md">
              + {n}
            </li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
}
