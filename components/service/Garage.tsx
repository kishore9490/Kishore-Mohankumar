"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { BikeVisual } from "@/components/bikes/BikeVisual";
import { useLeads } from "@/components/leads/LeadProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { DemoBadge, Notice } from "@/components/ui/Notice";
import { Reveal } from "@/components/ui/Reveal";
import { ApiError, getGarage, isDemoMode } from "@/lib/api";
import { cn, formatDate, formatINR, formatNumber, formatSlot, normaliseRegistration } from "@/lib/format";
import type { GarageProfile } from "@/lib/types";
import { HeroTitle } from "./HeroTitle";
import { RegistrationPlate } from "./RegistrationPlate";
import { daysUntil, findBike, findColor, relativeDays } from "./utils";

type GarageVehicle = GarageProfile["vehicles"][number];

/* ───────────── Loader (swap getGarage for an authenticated call later) ───────────── */

type LoadState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; profile: GarageProfile };

/**
 * Fetches the rider's garage via `api.getGarage()` and renders it, with
 * loading and error states. When sign-in exists, only this loader changes.
 */
export function GarageLoader() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(() => {
    return getGarage().then(
      (profile) => setState({ status: "ready", profile }),
      (e) => setState({ status: "error", message: e instanceof ApiError ? e.message : "We couldn't load your garage just now." }),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (state.status === "ready") return <Garage profile={state.profile} demo={isDemoMode} />;
  return (
    <>
      <GarageHeader />
      <section className="bg-ink pb-24" aria-live="polite" aria-busy={state.status === "loading"}>
        <div className="container-x">
          {state.status === "loading" ? (
            <div className="grid gap-10 md:grid-cols-2" aria-label="Loading your garage">
              <div className="aspect-[5/3] animate-pulse rounded-[28px] bg-white/[0.05]" />
              <div className="space-y-4 pt-4">
                <div className="h-10 w-2/3 animate-pulse rounded-lg bg-white/10" />
                <div className="h-7 w-40 animate-pulse rounded bg-white/[0.07]" />
                <div className="h-24 w-full animate-pulse rounded-2xl bg-white/[0.05]" />
              </div>
            </div>
          ) : (
            <Notice
              tone="error"
              title="Your garage didn't load"
              className="max-w-xl"
              action={
                <Button
                  size="sm"
                  variant="light"
                  iconLeft="refresh"
                  onClick={() => {
                    setState({ status: "loading" });
                    void load();
                  }}
                >
                  Try again
                </Button>
              }
            >
              {state.message}
            </Notice>
          )}
        </div>
      </section>
    </>
  );
}

function GarageHeader({ name, demo = isDemoMode }: { name?: string; demo?: boolean }) {
  return (
    <section className="grain relative overflow-hidden bg-ink pb-10 pt-[calc(var(--header-h)+2.5rem)] md:pb-14 md:pt-[calc(var(--header-h)+4.5rem)]">
      <div className="container-x relative grid grid-cols-1 gap-8 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-end">
        <div>
          <p className="eyebrow mb-5 flex flex-wrap items-center gap-3 opacity-80">
            <Icon name="user" size={14} className="opacity-70" />
            <span className="opacity-70">Rider account</span>
            {demo && <DemoBadge label="Demo preview" />}
          </p>
          <h1 className="font-display text-display-lg">
            <HeroTitle lines={["My Honda", "garage."]} />
          </h1>
          {name && <p className="mt-5 text-base opacity-70 md:text-lg">Welcome back, {name}.</p>}
        </div>
        {demo && (
          <div className="flex gap-3 rounded-2xl border border-amber/30 bg-amber-soft p-4 text-sm leading-relaxed">
            <Icon name="info" size={18} className="mt-0.5 shrink-0 text-amber" />
            <p className="opacity-85">
              This is a preview of the rider account. Sign-in will connect to your service records.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ───────────── Garage (presentational — single data prop) ───────────── */

export interface GarageProps {
  profile: GarageProfile;
  /** Show demo labelling. */
  demo?: boolean;
}

export function Garage({ profile, demo = false }: GarageProps) {
  const [active, setActive] = useState(0);
  const v = profile.vehicles[active];

  return (
    <>
      <GarageHeader name={profile.customerName} demo={demo} />

      {profile.vehicles.length > 1 && (
        <div className="bg-ink">
          <div className="container-x flex gap-2 overflow-x-auto pb-6" role="tablist" aria-label="Your motorcycles">
            {profile.vehicles.map((x, i) => (
              <button
                key={x.vehicle.registration}
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className={cn("h-11 shrink-0 rounded-full border px-4 text-sm", i === active ? "border-bone bg-bone text-ink" : "border-white/15")}
              >
                {x.vehicle.bikeName}
              </button>
            ))}
          </div>
        </div>
      )}

      {v ? <VehicleSections data={v} bookings={profile.bookings} /> : <EmptyGarage />}
    </>
  );
}

function EmptyGarage() {
  return (
    <section className="bg-ink pb-24">
      <div className="container-x">
        <p className="max-w-md text-base opacity-70">No motorcycles are linked to this account yet. Book a service and we&apos;ll add yours.</p>
        <ButtonLink href="/service/book" className="mt-6" icon="arrow-right">
          Book service
        </ButtonLink>
      </div>
    </section>
  );
}

function VehicleSections({ data, bookings }: { data: GarageVehicle; bookings: GarageProfile["bookings"] }) {
  const { vehicle } = data;
  const bike = findBike(vehicle.bikeSlug);
  const color = findColor(bike, vehicle.colorName);
  const regKey = normaliseRegistration(vehicle.registration);
  const myBookings = bookings.filter((b) => normaliseRegistration(b.registration) === regKey);
  const { openCallback } = useLeads();

  const dueDays = daysUntil(data.nextServiceDue);
  const insDays = daysUntil(data.insuranceRenewal);
  const lastDays = daysUntil(data.lastService);
  const warrantyActive = daysUntil(data.warrantyUntil) >= 0;
  const kmToGo = data.nextServiceKm - vehicle.odometerKm;
  const insuranceSoon = insDays < 45;

  const statuses: { icon: IconName; label: string; value: string; detail: string; tone?: "amber" | "go"; action?: React.ReactNode }[] = [
    {
      icon: "wrench",
      label: "Next service due",
      value: formatDate(data.nextServiceDue, { day: "numeric", month: "short", year: "numeric" }),
      detail: `${capitalise(relativeDays(dueDays))} · or at ${formatNumber(data.nextServiceKm)} km${kmToGo > 0 ? ` (${formatNumber(kmToGo)} km to go)` : ""}`,
      action: (
        <ButtonLink href={`/service/book?reg=${regKey}&service=periodic`} size="sm" icon="arrow-right" className="mt-4">
          Book service
        </ButtonLink>
      ),
    },
    {
      icon: "calendar",
      label: "Last service",
      value: formatDate(data.lastService, { day: "numeric", month: "short", year: "numeric" }),
      detail: capitalise(relativeDays(lastDays)),
    },
    {
      icon: "shield",
      label: "Warranty",
      value: `Until ${formatDate(data.warrantyUntil, { month: "short", year: "numeric" })}`,
      detail: warrantyActive ? "Active" : "Ended",
      tone: warrantyActive ? "go" : undefined,
    },
    {
      icon: "receipt",
      label: "Insurance renewal",
      value: formatDate(data.insuranceRenewal, { day: "numeric", month: "short", year: "numeric" }),
      detail: insDays < 0 ? "Overdue — please renew" : `Renew ${relativeDays(insDays)}`,
      tone: insuranceSoon ? "amber" : undefined,
      action: insuranceSoon ? (
        <Button
          size="sm"
          variant="outline"
          className="mt-4"
          onClick={() =>
            openCallback({
              topic: "insurance",
              source: "garage",
              title: "Insurance renewal",
              details: `Insurance renewal for Honda ${vehicle.bikeName} (${vehicle.registration})`,
            })
          }
        >
          Ask about renewal
        </Button>
      ) : undefined,
    },
  ];

  return (
    <>
      {/* ── My motorcycle ── */}
      <section className="bg-ink pb-16 md:pb-24" aria-labelledby="my-bike">
        <div className="container-x">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1.15fr_1fr] md:gap-14">
            <Reveal className="studio-glow relative -mx-5 rounded-[28px] px-5 md:mx-0 md:border md:border-white/10 md:bg-ink-2 md:p-10">
              {bike ? (
                <BikeVisual bike={bike} color={color} priority sizes="(min-width: 768px) 50vw, 100vw" />
              ) : (
                <div className="grid aspect-[5/3] place-items-center opacity-30">
                  <Icon name="bike" size={64} />
                </div>
              )}
            </Reveal>
            <div>
              <p className="eyebrow opacity-55">My motorcycle</p>
              <h2 id="my-bike" className="mt-4 font-display text-display-md">
                <span className="block text-[0.5em] leading-none opacity-55">Honda</span>
                {vehicle.bikeName}
              </h2>
              <div className="mt-5">
                <RegistrationPlate registration={vehicle.registration} size="lg" />
              </div>
              <dl className="mt-8 grid grid-cols-3 border-t border-white/10 text-sm">
                {[
                  ["Colour", vehicle.colorName],
                  ["Purchased", formatDate(vehicle.purchaseDate, { month: "short", year: "numeric" })],
                  ["Odometer", `${formatNumber(vehicle.odometerKm)} km`],
                ].map(([k, val], i) => (
                  <div key={k} className={cn("py-4 pr-3", i > 0 && "border-l border-white/10 pl-3 sm:pl-5")}>
                    <dt className="eyebrow text-[10px] opacity-50">{k}</dt>
                    <dd className="mt-1.5 font-medium leading-snug tabular">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Status strip */}
          <ul className="mt-14 grid grid-cols-1 border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4 md:mt-20">
            {statuses.map((s, i) => (
              <li
                key={s.label}
                className={cn(
                  "relative border-b border-white/10 py-6 sm:pr-6 lg:border-b-0 lg:py-8",
                  i % 2 === 1 && "sm:border-l sm:pl-6",
                  i > 0 && "lg:border-l lg:pl-6",
                  s.tone === "amber" && "before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-amber sm:before:left-6 lg:before:left-6",
                )}
              >
                <p className="eyebrow flex items-center gap-2 text-[10px] opacity-55">
                  <Icon name={s.icon} size={14} />
                  {s.label}
                </p>
                <p className="mt-3 font-display text-[1.35rem] leading-tight">{s.value}</p>
                <p className={cn("mt-1.5 text-sm", s.tone === "amber" ? "text-amber" : s.tone === "go" ? "text-go" : "opacity-60")}>
                  {s.tone && <span className={cn("mr-1.5 inline-block size-1.5 -translate-y-0.5 rounded-full", s.tone === "amber" ? "bg-amber" : "bg-go")} aria-hidden />}
                  {s.detail}
                </p>
                {s.action}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Coming up + history ── */}
      <section className="surface-paper py-16 md:py-24" aria-label="Maintenance and service history">
        <div className="container-x grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
          <div className="flex flex-col gap-12">
            <div>
              <h2 className="eyebrow opacity-60">Service bookings</h2>
              {myBookings.length ? (
                <ul className="mt-4 border-t border-current/15">
                  {myBookings.map((b) => (
                    <li key={b.reference} className="flex items-center gap-4 border-b border-current/15 py-5">
                      <span className="grid w-14 shrink-0 place-items-center rounded-2xl bg-ink py-2 text-paper">
                        <span className="eyebrow text-[9px] opacity-70">{formatDate(b.date, { month: "short" })}</span>
                        <span className="font-display text-xl tabular leading-none">{new Date(`${b.date}T00:00:00`).getDate()}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{b.type}</span>
                        <span className="mt-0.5 block text-sm opacity-60">
                          {formatDate(b.date, { weekday: "long" })}, {formatSlot(b.slot)} · {capitalise(relativeDays(daysUntil(b.date)))}
                        </span>
                      </span>
                      <span className="hidden font-mono text-[12px] tracking-wide opacity-50 sm:block">{b.reference}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 border-t border-current/15 pt-5 text-sm opacity-65">No upcoming bookings.</p>
              )}
            </div>

            <div>
              <h2 className="eyebrow opacity-60">Upcoming maintenance</h2>
              <ul className="mt-4 border-t border-current/15">
                {data.upcoming.map((u) => (
                  <li key={u} className="flex items-center gap-3 border-b border-current/15 py-4 text-[15px]">
                    <span className="size-1.5 shrink-0 rounded-full bg-current opacity-40" aria-hidden />
                    {u}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[13px] leading-relaxed opacity-55">
                Based on your last service and odometer reading. Your advisor will confirm what&apos;s actually needed.
              </p>
            </div>
          </div>

          <div>
            <h2 className="eyebrow opacity-60">Service history</h2>
            <ol className="relative mt-4">
              <span className="absolute bottom-6 left-[7px] top-6 w-px bg-current/15" aria-hidden />
              {data.history.map((h, i) => (
                <HistoryItem key={h.id} entry={h} defaultOpen={i === 0} />
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Shortcuts ── */}
      <section className="bg-ink py-16 md:py-20" aria-label="More for your Honda">
        <div className="container-x">
        <div className="grid grid-cols-1 border-t border-white/10 md:grid-cols-3">
          <ShortcutLink href="/accessories" icon="helmet" title="Accessories" body={`Genuine add-ons that fit your ${vehicle.bikeName}.`} />
          <button
            type="button"
            onClick={() =>
              openCallback({
                topic: "offers",
                source: "garage",
                title: "Ask about current offers",
                details: `Current offers for my Honda ${vehicle.bikeName}`,
              })
            }
            className="group flex items-start justify-between gap-6 border-b border-white/10 py-7 text-left md:border-b-0 md:border-l md:px-8"
          >
            <ShortcutBody icon="sparkle" title="Ask about current offers" body="Service, exchange or accessory offers — we'll tell you what applies today." />
          </button>
          <ShortcutLink href={`/service/track?reg=${regKey}`} icon="clock" title="Track a service" body="See live status whenever your bike is with us." className="md:border-l md:px-8" />
        </div>
        </div>
      </section>
    </>
  );
}

function HistoryItem({ entry, defaultOpen }: { entry: GarageVehicle["history"][number]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const reduce = useReducedMotion();
  const panelId = `hist-${entry.id}`;
  return (
    <li className="relative pl-9">
      <span className="absolute left-0 top-[1.6rem] grid size-[15px] place-items-center rounded-full border border-current/30 bg-[color:var(--surface-bg)]" aria-hidden>
        <span className="size-[5px] rounded-full bg-current opacity-70" />
      </span>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-4 border-b border-current/15 py-5 text-left"
      >
        <span className="min-w-0">
          <span className="block text-[13px] tabular opacity-55">{formatDate(entry.date)}</span>
          <span className="mt-1 block font-display text-lg leading-tight md:text-xl">{entry.type}</span>
          <span className="mt-1.5 block text-sm tabular opacity-60">
            {formatNumber(entry.odometerKm)} km · {formatINR(entry.amountInr)}
          </span>
        </span>
        <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-current/15">
          <Icon name={open ? "minus" : "plus"} size={16} />
          <span className="sr-only">{open ? "Hide" : "Show"} work done</span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <ul className="flex flex-col gap-2 py-4 text-sm">
              {entry.work.map((w) => (
                <li key={w} className="flex gap-2.5">
                  <Icon name="check" size={15} className="mt-0.5 shrink-0 text-go" />
                  {w}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function ShortcutBody({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <>
      <span className="flex gap-4">
        <Icon name={icon} size={22} className="mt-0.5 shrink-0 opacity-75" />
        <span>
          <span className="block text-[15px] font-medium">{title}</span>
          <span className="mt-1 block text-sm leading-relaxed opacity-60">{body}</span>
        </span>
      </span>
      <Icon name="arrow-right" size={18} className="mt-1 shrink-0 opacity-60 transition-transform duration-300 group-hover:translate-x-1" />
    </>
  );
}

function ShortcutLink({ href, icon, title, body, className }: { href: string; icon: IconName; title: string; body: string; className?: string }) {
  return (
    <Link href={href} className={cn("group flex items-start justify-between gap-6 border-b border-white/10 py-7 md:border-b-0", className)}>
      <ShortcutBody icon={icon} title={title} body={body} />
    </Link>
  );
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
