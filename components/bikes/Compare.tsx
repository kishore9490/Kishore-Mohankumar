"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import type { Bike } from "@/lib/types";
import { startingPrice } from "@/data/bikes";
import { cn, formatINR, formatNumber } from "@/lib/format";
import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import { Button, ButtonLink } from "@/components/ui/Button";
import { BikeVisual } from "./BikeVisual";

export const MAX_COMPARE = 3;

/** Toggle shown in the corner of a BikeCard. */
export function CompareToggle({
  bike,
  selected,
  disabled,
  onToggle,
}: {
  bike: Bike;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      disabled={disabled}
      aria-label={selected ? `Remove ${bike.name} from compare` : `Add ${bike.name} to compare`}
      title={disabled ? `You can compare up to ${MAX_COMPARE} bikes` : undefined}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full border px-3.5 text-[12px] font-medium backdrop-blur-md transition-[background-color,border-color,color,opacity] duration-300",
        selected
          ? "border-bone bg-bone text-ink"
          : "border-white/15 bg-ink/40 text-bone/80 hover:border-white/40 hover:text-bone",
        disabled && "opacity-35",
      )}
    >
      <span
        className={cn(
          "grid size-4 place-items-center rounded-[5px] border transition-colors",
          selected ? "border-ink bg-ink text-bone" : "border-current/50",
        )}
        aria-hidden
      >
        {selected && <Icon name="check" size={11} strokeWidth={2.6} />}
      </span>
      Compare
    </button>
  );
}

/** Floating tray — sits above the mobile bottom nav, bottom-centre on desktop. */
export function CompareTray({
  items,
  onRemove,
  onClear,
  onOpen,
}: {
  items: Bike[];
  onRemove: (slug: string) => void;
  onClear: () => void;
  onOpen: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          role="region"
          aria-label="Compare tray"
          initial={{ y: reduce ? 0 : 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: reduce ? 0 : 40, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-3 bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom)+0.75rem)] z-40 lg:inset-x-auto lg:bottom-6 lg:left-1/2 lg:-translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-ink-2/95 p-2 pl-3 text-bone shadow-[0_20px_60px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl lg:gap-4 lg:p-2.5 lg:pl-4">
            <ul className="flex min-w-0 flex-1 items-center gap-1.5 lg:flex-none" aria-label="Bikes selected to compare">
              {Array.from({ length: MAX_COMPARE }).map((_, i) => {
                const b = items[i];
                return (
                  <li key={b?.slug ?? `empty-${i}`} className="min-w-0">
                    {b ? (
                      <span className="group/chip flex items-center gap-1 rounded-full bg-white/[0.06] py-1 pl-1 pr-1">
                        <span className="w-11 shrink-0 overflow-hidden" aria-hidden>
                          <BikeVisual bike={b} sizes="44px" />
                        </span>
                        <span className="hidden max-w-[7rem] truncate text-[13px] lg:inline">{b.name}</span>
                        <button
                          type="button"
                          onClick={() => onRemove(b.slug)}
                          className="grid size-7 place-items-center rounded-full text-bone/60 hover:bg-white/10 hover:text-bone"
                          aria-label={`Remove ${b.name}`}
                        >
                          <Icon name="x" size={13} />
                        </button>
                      </span>
                    ) : (
                      <span className="block h-9 w-14 rounded-full border border-dashed border-white/15 lg:w-24" aria-hidden />
                    )}
                  </li>
                );
              })}
            </ul>
            <button type="button" onClick={onClear} className="hidden text-[13px] text-bone/55 underline-offset-4 hover:text-bone hover:underline sm:block">
              Clear
            </button>
            <Button size="sm" variant="light" onClick={onOpen} disabled={items.length < 2} className="h-11 shrink-0 px-4">
              {items.length < 2 ? "Add one more" : `Compare ${items.length}`}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type Row = {
  label: string;
  value: (b: Bike) => ReactNode;
  /** Numeric value used to flag the best figure in the row. */
  num?: (b: Bike) => number | undefined;
  best?: "max" | "min";
  note?: string;
};

const rows: { group: string; rows: Row[] }[] = [
  {
    group: "Price",
    rows: [
      {
        label: "Ex-showroom, from*",
        value: (b) => formatINR(startingPrice(b)),
        num: (b) => startingPrice(b),
        best: "min",
      },
    ],
  },
  {
    group: "Performance",
    rows: [
      { label: "Displacement", value: (b) => `${formatNumber(b.specs.displacementCc)} cc`, num: (b) => b.specs.displacementCc, best: "max" },
      {
        label: "Power",
        value: (b) => `${formatNumber(b.specs.powerPs)} PS`,
        num: (b) => b.specs.powerPs,
        best: "max",
      },
      { label: "Torque", value: (b) => `${formatNumber(b.specs.torqueNm)} Nm`, num: (b) => b.specs.torqueNm, best: "max" },
    ],
  },
  {
    group: "Efficiency",
    rows: [
      {
        label: "Mileage*",
        value: (b) => (b.specs.mileageKmpl ? `~${b.specs.mileageKmpl} km/l` : "Ask us"),
        num: (b) => b.specs.mileageKmpl,
        best: "max",
        note: "Indicative real-world figure, not an official claim.",
      },
      { label: "Fuel tank", value: (b) => `${formatNumber(b.specs.fuelLitres)} L`, num: (b) => b.specs.fuelLitres, best: "max" },
    ],
  },
  {
    group: "Chassis",
    rows: [
      { label: "Kerb weight", value: (b) => `${formatNumber(b.specs.kerbKg)} kg`, num: (b) => b.specs.kerbKg, best: "min" },
      { label: "Front brake", value: (b) => b.specs.brakesFront },
      { label: "Rear brake", value: (b) => b.specs.brakesRear },
      { label: "Transmission", value: (b) => b.specs.transmission },
    ],
  },
];

function bestIndex(items: Bike[], row: Row) {
  if (!row.num || !row.best || items.length < 2) return -1;
  const vals = items.map((b) => row.num!(b));
  if (vals.some((v) => v === undefined)) return -1;
  const nums = vals as number[];
  const target = row.best === "max" ? Math.max(...nums) : Math.min(...nums);
  // no highlight when everyone ties
  if (nums.every((v) => v === target)) return -1;
  return nums.indexOf(target);
}

/** Side-by-side comparison inside the global Sheet (widened on desktop). */
export function CompareSheet({ open, onClose, items }: { open: boolean; onClose: () => void; items: Bike[] }) {
  const cols = items.length === 3 ? "grid-cols-3" : "grid-cols-2";
  return (
    <Sheet
      open={open}
      onClose={onClose}
      eyebrow={`Comparing ${items.length} Honda models`}
      title="Side by side"
      className="md:w-[min(60rem,calc(100vw-1.5rem))]"
    >
      <table className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">Specification comparison of {items.map((b) => b.name).join(", ")}</caption>
        <thead>
          <tr className={cn("grid gap-3", cols)}>
            {items.map((b) => (
              <th key={b.slug} scope="col" className="min-w-0 align-top font-normal">
                <div className="overflow-hidden rounded-2xl bg-ink px-2 pb-2 pt-5 text-bone">
                  <div className="studio-glow">
                    <BikeVisual bike={b} sizes="200px" />
                  </div>
                </div>
                <p className="mt-3 font-display text-[1.05rem] leading-tight md:text-xl">{b.name}</p>
                <Link
                  href={`/bikes/${b.slug}`}
                  className="mt-1.5 inline-flex min-h-11 items-center gap-1 text-[13px] opacity-60 underline-offset-4 hover:underline hover:opacity-100"
                >
                  View<span className="hidden sm:inline"> details</span>
                  <Icon name="arrow-right" size={14} />
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        {rows.map((g) => (
          <tbody key={g.group}>
            <tr>
              <th scope="colgroup" colSpan={items.length} className="eyebrow block pb-2 pt-8 opacity-50">
                {g.group}
              </th>
            </tr>
            {g.rows.map((row) => {
              const best = bestIndex(items, row);
              return (
                <tr key={row.label} className={cn("grid gap-x-3 border-t border-current/10 py-3", cols)}>
                  <th scope="row" className="col-span-full pb-1.5 text-[12px] font-normal opacity-55">
                    {row.label}
                  </th>
                  {items.map((b, i) => (
                    <td key={b.slug} className={cn("min-w-0 text-[14px] leading-snug md:text-[15px]", row.num && "tabular", i === best && "font-semibold")}>
                      {row.value(b)}
                      {i === best && (
                        <span className="ml-1.5 inline-block translate-y-[-1px] rounded-full bg-go-soft px-1.5 py-0.5 align-middle text-[10px] font-medium text-go">
                          {row.best === "min" ? (row.label.startsWith("Ex") ? "Lowest" : "Lightest") : "Best"}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
      <p className="mt-8 text-[12px] leading-relaxed opacity-55">
        *Prices are indicative ex-showroom figures. Mileage is an indicative real-world figure, not an official claim. Specifications are for reference — please confirm with our team.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href={`/test-ride?bike=${items[0]?.slug ?? ""}`} icon="arrow-right">
          Book a test ride
        </ButtonLink>
      </div>
    </Sheet>
  );
}
