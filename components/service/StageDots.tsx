import { serviceStages } from "@/data/services";
import { cn } from "@/lib/format";
import type { ServiceStage } from "@/lib/types";

/**
 * Compact, static teaser of the six-stage service tracker. Used on the
 * homepage showcase and the service landing page.
 */
export function StageDots({ current = "in-progress", className }: { current?: ServiceStage; className?: string }) {
  const idx = serviceStages.findIndex((s) => s.id === current);
  const pct = (idx / (serviceStages.length - 1)) * 100;
  return (
    <div className={cn("relative", className)}>
      <ol className="relative grid grid-cols-6" aria-label="Service stages">
        <span className="absolute inset-x-[8.33%] top-[7px] h-px bg-current/15" aria-hidden />
        <span
          className="absolute left-[8.33%] top-[7px] h-px bg-current"
          style={{ width: `calc(${pct}% * 0.8334)` }}
          aria-hidden
        />
        {serviceStages.map((s, i) => {
          const done = i < idx;
          const now = i === idx;
          return (
            <li key={s.id} className="relative flex flex-col items-center gap-3 text-center">
              <span className="relative grid size-[15px] place-items-center">
                {now && <span className="absolute inset-0 animate-ping rounded-full bg-signal/50" aria-hidden />}
                <span
                  className={cn(
                    "relative size-[15px] rounded-full border",
                    done && "border-current bg-current",
                    now && "border-signal bg-signal",
                    !done && !now && "border-current/30 bg-[color:var(--surface-bg,var(--color-ink))]",
                  )}
                  aria-hidden
                />
              </span>
              <span className={cn("max-w-[5.5rem] text-[10px] leading-tight sm:text-[11px]", now ? "font-medium" : "opacity-55")}>
                {s.label}
                <span className="sr-only">{done ? " — done" : now ? " — in progress" : " — upcoming"}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
