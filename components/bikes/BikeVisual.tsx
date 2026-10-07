import Image from "next/image";
import type { Bike, BikeColor } from "@/lib/types";
import { BikeSilhouette } from "./BikeSilhouette";
import { cn } from "@/lib/format";

/**
 * Renders licensed photography when supplied (colour image → hero image),
 * otherwise the colour-aware studio silhouette. All bike imagery in the UI
 * goes through here so swapping in real assets is a data-only change.
 */
export function BikeVisual({
  bike,
  color,
  accessories,
  className,
  priority,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: {
  bike: Bike;
  color?: BikeColor;
  accessories?: string[];
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const c = color ?? bike.colors[0];
  const src = c?.image ?? bike.heroImage;
  if (src) {
    return (
      <div className={cn("relative aspect-[5/3]", className)}>
        <Image src={src} alt={`Honda ${bike.name} in ${c?.name ?? "studio"}`} fill sizes={sizes} priority={priority} className="object-contain" />
      </div>
    );
  }
  return (
    <BikeSilhouette
      shape={bike.silhouette}
      color={c?.hex}
      accent={c?.accent}
      accessories={accessories}
      className={cn("block h-auto w-full", className)}
      title={`Honda ${bike.name}${c ? ` in ${c.name}` : ""} — illustration`}
    />
  );
}
