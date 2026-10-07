"use client";

import { useId } from "react";
import { cn } from "@/lib/format";
import { useBikeConfig } from "./ConfigContext";

/** Native radio swatches (arrow keys work) bound to the shared configuration. */
export function ColorSwatches({ size = "md", tone = "dark", className }: { size?: "md" | "lg"; tone?: "dark" | "light"; className?: string }) {
  const { colors, color, setColor, bike } = useBikeConfig();
  const name = useId();
  const dim = size === "lg" ? "size-11" : "size-10";
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="sr-only">Colour for Honda {bike.name}</legend>
      <div className="flex flex-wrap items-center gap-2">
        {colors.map((c) => {
          const on = c.id === color.id;
          return (
            <label
              key={c.id}
              title={c.name}
              className={cn(
                "relative grid cursor-pointer place-items-center rounded-full transition-transform duration-300 ease-[var(--ease-out-expo)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal",
                dim,
                on ? "scale-100" : "scale-[0.86] hover:scale-95",
              )}
            >
              <input type="radio" name={name} value={c.id} checked={on} onChange={() => setColor(c.id)} className="sr-only" aria-label={c.name} />
              <span
                className={cn(
                  "absolute inset-0 rounded-full border-2 transition-colors",
                  on ? (tone === "dark" ? "border-bone" : "border-ink") : "border-transparent",
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "size-[calc(100%-8px)] rounded-full shadow-[inset_0_1px_1px_rgb(255_255_255/0.35),inset_0_-2px_4px_rgb(0_0_0/0.4)]",
                  tone === "dark" ? "ring-1 ring-white/15" : "ring-1 ring-black/10",
                )}
                style={{
                  background: c.accent ? `linear-gradient(135deg, ${c.hex} 0 55%, ${c.accent} 55% 100%)` : c.hex,
                }}
                aria-hidden
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
