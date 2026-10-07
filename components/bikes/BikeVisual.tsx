import Image from "next/image";
import type { Bike, BikeColor } from "@/lib/types";
import { BikeSilhouette } from "./BikeSilhouette";
import { cn } from "@/lib/format";

/**
 * All bike imagery in the UI goes through here.
 *
 * Real photography (from /public/bikes, prepared with
 * scripts/prepare-bike-photo.py into a 5:3 frame, ground at 90%) is used
 * whenever it exists: the colour's own photo first, then the model's hero
 * photo. Models still waiting for photography show a quiet monochrome
 * placeholder outline — never a coloured illustration posing as the bike.
 */
export function BikeVisual({
  bike,
  color,
  accessories,
  className,
  priority,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  showPlaceholderLabel = true,
}: {
  bike: Bike;
  color?: BikeColor;
  accessories?: string[];
  className?: string;
  priority?: boolean;
  sizes?: string;
  showPlaceholderLabel?: boolean;
}) {
  const c = color ?? bike.colors[0];
  const src = c?.image ?? bike.heroImage;
  if (src) {
    return (
      <div className={cn("relative aspect-[5/3] w-full", className)}>
        <Image
          src={src}
          alt={`Honda ${bike.name}${c?.image ? ` in ${c.name}` : ""}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain"
        />
      </div>
    );
  }
  return (
    <div className={cn("relative aspect-[5/3] w-full", className)}>
      <BikeSilhouette
        shape={bike.silhouette}
        color="#2b2e33"
        accent="#3a3e44"
        accessories={accessories}
        className="block h-auto w-full opacity-60 grayscale"
        title={`Honda ${bike.name} — photo coming soon`}
      />
      {showPlaceholderLabel && (
        <span className="eyebrow pointer-events-none absolute bottom-[4%] left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-current opacity-40">
          Photo coming soon
        </span>
      )}
    </div>
  );
}

/** True when real photography exists for this bike/colour. */
export function hasBikePhoto(bike: Bike, color?: BikeColor) {
  return Boolean((color ?? bike.colors[0])?.image ?? bike.heroImage);
}
