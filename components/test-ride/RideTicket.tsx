"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { BikeVisual } from "@/components/bikes/BikeVisual";
import { dealership } from "@/data/dealership";
import { cn, formatDate, formatSlot } from "@/lib/format";
import type { Bike, BikeColor } from "@/lib/types";

export interface TicketData {
  bike?: Bike;
  color?: BikeColor;
  variantName?: string;
  date: string | null;
  slot: string | null;
  location?: string;
  rider?: string;
  reference?: string;
}

const ease = [0.16, 1, 0.3, 1] as const;

const shortDate = (iso: string) => formatDate(iso, { weekday: "short", day: "numeric", month: "short" });

/** Deterministic faux barcode — purely decorative. */
function Barcode({ seed }: { seed: string }) {
  let h = 2166136261;
  let x = 0;
  const bars: { x: number; w: number }[] = [];
  for (let i = 0; i < 34; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i % seed.length), 16777619) >>> 0;
    const w = (h % 3) + 1;
    if (i % 2 === 0) bars.push({ x, w });
    x += w + 0.6;
  }
  return (
    <svg viewBox={`0 0 ${Math.ceil(x)} 32`} className="h-8 w-[7.5rem] shrink-0" aria-hidden preserveAspectRatio="none">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={32} fill="currentColor" />
      ))}
    </svg>
  );
}

function TicketField({ label, value, placeholder, className }: { label: string; value?: ReactNode; placeholder: string; className?: string }) {
  const reduce = useReducedMotion();
  const key = typeof value === "string" ? value : value ? "set" : "empty";
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="eyebrow text-[10px] text-bone/50">{label}</dt>
      <dd className="relative mt-1.5 min-h-6 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={key}
            className={cn("block truncate", value ? "text-[15px] font-medium text-bone" : "text-[15px] text-bone/35")}
            initial={{ opacity: 0, y: reduce ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -14 }}
            transition={{ duration: 0.45, ease }}
          >
            {value || placeholder}
          </motion.span>
        </AnimatePresence>
      </dd>
    </div>
  );
}

/**
 * The "boarding pass" for a test ride. Fills in as the visitor progresses and
 * gets stamped once the request is sent.
 */
export function RideTicket({ bike, color, variantName, date, slot, location, rider, reference }: TicketData) {
  const reduce = useReducedMotion();
  const c = color ?? bike?.colors[0];
  return (
    <article
      aria-label="Your test ride summary"
      className="relative overflow-hidden rounded-[28px] bg-ink text-bone shadow-[0_50px_90px_-50px_rgb(10_11_13/0.75)]"
    >
      {/* Top: the bike */}
      <div className="grain relative px-6 pt-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-bone/60">Test ride pass</p>
          <p className="eyebrow text-bone/60">{dealership.shortName} · Honda</p>
        </div>
        <div className="studio-glow relative -mx-6 mt-2 aspect-[5/3] px-8">
          <AnimatePresence mode="popLayout" initial={false}>
            {bike ? (
              <motion.div
                key={`${bike.slug}-${c?.id}`}
                className="absolute inset-x-8 inset-y-0 flex items-center"
                initial={{ opacity: 0, x: reduce ? 0 : 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduce ? 0 : -40 }}
                transition={{ duration: 0.7, ease }}
              >
                <BikeVisual bike={bike} color={c} sizes="380px" />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="absolute inset-0 grid place-items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="eyebrow text-bone/35">Choose a motorcycle</p>
              </motion.div>
            )}
          </AnimatePresence>
          <span className="absolute inset-x-10 bottom-[9%] h-px bg-gradient-to-r from-transparent via-bone/20 to-transparent" aria-hidden />
        </div>
        <div className="pb-6">
          <p className="eyebrow text-bone/50">{bike ? `Honda · ${bike.category}` : "Honda"}</p>
          <h3 className="mt-1.5 font-display text-[1.9rem] leading-none">{bike ? bike.name : "Your ride"}</h3>
          <p className="mt-2 truncate text-[13px] text-bone/60">
            {[variantName, c?.name].filter(Boolean).join(" · ") || "Demo bike colour may vary"}
          </p>
        </div>
      </div>

      {/* Perforation */}
      <div className="relative mx-6 border-t border-dashed border-bone/20" aria-hidden>
        <span className="absolute -left-9 top-0 size-6 -translate-y-1/2 rounded-full bg-[var(--surface-bg)]" />
        <span className="absolute -right-9 top-0 size-6 -translate-y-1/2 rounded-full bg-[var(--surface-bg)]" />
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 px-6 py-6">
        <TicketField label="Date" value={date ? shortDate(date) : undefined} placeholder="Pick a day" />
        <TicketField label="Preferred time" value={slot ? formatSlot(slot) : undefined} placeholder="Pick a time" />
        <TicketField label="Location" value={location} placeholder="Showroom or doorstep" className="col-span-2" />
        <TicketField label="Rider" value={rider} placeholder="Your name" className="col-span-2" />
      </dl>

      <div className="flex items-end justify-between gap-4 border-t border-bone/10 px-6 py-5">
        <div className="min-w-0">
          <p className="eyebrow text-[10px] text-bone/50">Reference</p>
          <p className={cn("mt-1.5 font-mono text-[15px] tracking-[0.14em]", reference ? "text-bone" : "text-bone/35")}>
            {reference ?? "Issued on request"}
          </p>
        </div>
        <span className={cn("transition-opacity duration-700", reference ? "text-bone/80" : "text-bone/20")}>
          <Barcode seed={reference ?? `${bike?.slug ?? "ride"}${date ?? ""}`} />
        </span>
      </div>

      <AnimatePresence>
        {reference && (
          <motion.div
            className="pointer-events-none absolute right-5 top-14 rounded-md border-2 border-go px-3 py-1.5 text-go"
            initial={{ opacity: 0, scale: reduce ? 1 : 1.8, rotate: reduce ? -8 : -18 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            transition={{ duration: 0.55, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            aria-hidden
          >
            <span className="font-display text-sm tracking-[0.08em]">Requested</span>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

/** Compact mobile version of the pass, shown above the flow. */
export function RideTicketStrip({ bike, color, date, slot, location, reference }: TicketData) {
  const c = color ?? bike?.colors[0];
  const parts = [date ? shortDate(date) : null, slot ? formatSlot(slot) : null, location ?? null].filter(Boolean);
  return (
    <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl bg-ink p-2.5 pr-4 text-bone" aria-label="Your test ride summary">
      <div className="studio-glow grid h-14 w-[5.5rem] shrink-0 place-items-center rounded-xl bg-ink-2 px-1.5">
        {bike ? <BikeVisual bike={bike} color={c} sizes="88px" /> : <span className="eyebrow text-[9px] text-bone/35">Ride</span>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-[10px] text-bone/50">{reference ? `Ref ${reference}` : "Test ride pass"}</p>
        <p className="truncate font-display text-[15px] leading-tight">{bike ? `Honda ${bike.name}` : "Choose a motorcycle"}</p>
        <p className="truncate text-[12.5px] text-bone/60">{parts.length ? parts.join(" · ") : "Date, time & place next"}</p>
      </div>
      <span className="absolute -right-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-[var(--surface-bg)]" aria-hidden />
    </div>
  );
}
