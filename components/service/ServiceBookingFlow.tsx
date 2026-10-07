"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { BikeVisual } from "@/components/bikes/BikeVisual";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ChoiceGroup, DateStrip, StepProgress, TextArea, TextField, upcomingDates } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { DemoBadge, Notice } from "@/components/ui/Notice";
import { SuccessMark, SummaryList } from "@/components/ui/SuccessMark";
import { bikes } from "@/data/bikes";
import { dealership, formattedAddress } from "@/data/dealership";
import { serviceTypes } from "@/data/services";
import { useSubmit } from "@/hooks/useSubmit";
import { track } from "@/lib/analytics";
import { ApiError, getSlots, isDemoMode, isWorkshopClosed, lookupVehicle, submitLead, type Slot } from "@/lib/api";
import { cn, formatDate, formatPhone, formatRegistration, formatSlot, normaliseRegistration } from "@/lib/format";
import { buildIcs, downloadIcs } from "@/lib/ics";
import type { Vehicle } from "@/lib/types";
import { cleanMobile, validators } from "@/lib/validation";
import { CallServiceButton } from "./ServiceActions";
import { RegistrationPlate } from "./RegistrationPlate";
import { DEMO_REGISTRATIONS, durationLabel, findBike, findColor, plannedMinutes, serviceNames } from "./utils";

const STEPS = ["Your bike", "Service", "Day & time", "Confirm"];
const HEADINGS = ["Which bike are we looking after?", "What does it need?", "When suits you?", "Almost done."];
const OTHER = "other";

type Lookup =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "found"; vehicle: Vehicle }
  | { status: "not_found" }
  | { status: "error"; message: string };

export interface ServiceBookingFlowProps {
  /** Prefill the registration (e.g. from `?reg=`). */
  initialRegistration?: string;
  /** Preselect a service type id (e.g. from `?service=`). */
  initialServiceId?: string;
  /** Analytics / lead source label. */
  source?: string;
}

export function ServiceBookingFlow({ initialRegistration = "", initialServiceId, source = "service_book_page" }: ServiceBookingFlowProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const [step, setStep] = useState(0);

  /* ── vehicle ── */
  const [reg, setReg] = useState(formatRegistration(initialRegistration));
  const [lookup, setLookup] = useState<Lookup>({ status: "idle" });
  const [confirmed, setConfirmed] = useState<boolean | null>(null);
  const [model, setModel] = useState<string | null>(null);

  /* ── service ── */
  const [services, setServices] = useState<string[]>(
    initialServiceId && serviceTypes.some((s) => s.id === initialServiceId) ? [initialServiceId] : [],
  );

  /* ── slot ── */
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsState, setSlotsState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [slot, setSlot] = useState<string | null>(null);
  const [searchingNext, setSearchingNext] = useState(false);
  const [pickup, setPickup] = useState(false);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  /* ── contact ── */
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [live, setLive] = useState("");
  const { state, run } = useSubmit(submitLead);

  const started = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const slotReq = useRef(0);

  function markStarted() {
    if (started.current) return;
    started.current = true;
    track("service_booking_started", { source });
  }

  const view = state.status === "success" ? "done" : step;
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    const top = topRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0 || top > window.innerHeight * 0.4) {
      topRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }, [view, reduce]);

  /* ── derived ── */
  const vehicle = lookup.status === "found" && confirmed ? lookup.vehicle : null;
  const pickedBike = vehicle ? findBike(vehicle.bikeSlug) : model && model !== OTHER ? findBike(model) : undefined;
  const bikeName = vehicle ? `Honda ${vehicle.bikeName}` : model === OTHER ? "Other Honda" : pickedBike ? `Honda ${pickedBike.name}` : "";
  const manualPath = lookup.status === "not_found" || lookup.status === "error" || (lookup.status === "found" && confirmed === false);
  const vehicleReady = !!vehicle || (manualPath && !!model);

  /* ── vehicle actions ── */
  async function runLookup() {
    markStarted();
    const err = validators.registration(reg);
    setErrors((e) => ({ ...e, reg: err }));
    if (err) return;
    setLookup({ status: "loading" });
    setConfirmed(null);
    setModel(null);
    setLive("Looking up your bike…");
    try {
      const v = await lookupVehicle(reg);
      setLookup({ status: "found", vehicle: v });
      setLive(`Found a Honda ${v.bikeName} in ${v.colorName}. Please confirm it's yours.`);
    } catch (e) {
      if (e instanceof ApiError && e.code === "not_found") {
        setLookup({ status: "not_found" });
        setLive("We don't have this bike on record yet. Please choose your model.");
      } else {
        const message = e instanceof ApiError ? e.message : "We couldn't check that just now.";
        setLookup({ status: "error", message });
        setLive(message);
      }
    }
  }

  function onRegChange(v: string) {
    markStarted();
    setReg(v.toUpperCase());
    if (errors.reg) setErrors((e) => ({ ...e, reg: null }));
    if (lookup.status !== "idle" && lookup.status !== "loading") {
      setLookup({ status: "idle" });
      setConfirmed(null);
      setModel(null);
    }
  }

  /* ── slot actions ── */
  async function loadSlots(d: string) {
    const req = ++slotReq.current;
    setSlotsState("loading");
    try {
      const list = await getSlots("service", d);
      if (req !== slotReq.current) return list;
      setSlots(list);
      setSlotsState("ready");
      const open = list.filter((s) => s.available).length;
      setLive(open ? `${open} times available on ${formatDate(d, { weekday: "long", day: "numeric", month: "long" })}.` : "No times left on this day.");
      return list;
    } catch {
      if (req === slotReq.current) setSlotsState("error");
      return null;
    }
  }

  function pickDate(d: string) {
    markStarted();
    setDate(d);
    setSlot(null);
    setErrors((e) => ({ ...e, date: null, slot: null }));
    void loadSlots(d);
  }

  async function findNextAvailable() {
    if (!date) return;
    setSearchingNext(true);
    const candidates = upcomingDates(21).filter((d) => d > date && !isWorkshopClosed(d));
    for (const d of candidates) {
      setDate(d);
      setSlot(null);
      const list = await loadSlots(d);
      if (list && list.some((s) => s.available)) break;
    }
    setSearchingNext(false);
  }

  /* ── navigation ── */
  function validateStep(s: number) {
    const next: Record<string, string | null> = {};
    if (s === 0) {
      next.reg = validators.registration(reg);
      if (!next.reg && !vehicleReady) {
        if (lookup.status === "found" && confirmed === null) next.vehicle = "Please confirm whether this is your bike.";
        else if (manualPath) next.model = "Please choose your model.";
      }
    }
    if (s === 1 && services.length === 0) next.services = "Choose at least one — or “Something else”.";
    if (s === 2) {
      if (!date) next.date = "Please choose a day.";
      else if (!slot) next.slot = "Please choose a time.";
      if (pickup && !address.trim()) next.address = "Where should we collect the bike from?";
    }
    if (s === 3) {
      next.name = validators.name(name);
      next.mobile = validators.mobile(mobile);
    }
    setErrors((e) => ({ ...e, ...next }));
    return !Object.values(next).some(Boolean);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    markStarted();
    if (step === 0 && (lookup.status === "idle" || lookup.status === "loading")) {
      if (lookup.status === "idle") await runLookup();
      return;
    }
    if (!validateStep(step)) return;
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    const receipt = await run({
      type: "service_booking",
      name: name.trim(),
      mobile: cleanMobile(mobile),
      source,
      registration: normaliseRegistration(reg),
      bikeName,
      serviceTypeIds: services,
      date: date!,
      slot: slot!,
      pickupDrop: pickup,
      pickupAddress: pickup ? address.trim() : undefined,
      notes: notes.trim() || undefined,
    });
    if (receipt) track("service_booking_completed", { source, services: services.join(","), pickup });
  }

  const back = () => setStep((s) => Math.max(0, s - 1));
  const goTo = (s: number) => setStep(s);

  /* ───────────── Confirmation ───────────── */
  if (state.status === "success") {
    const regNorm = normaliseRegistration(reg);
    const rows: [string, React.ReactNode][] = [
      ["Bike", bikeName],
      ["Registration", <RegistrationPlate key="p" registration={regNorm} size="sm" />],
      ["Service", serviceNames(services).join(", ")],
      ["Day", formatDate(date!, { weekday: "short", day: "numeric", month: "short" })],
      ["Time", formatSlot(slot!)],
    ];
    if (dealership.pickupDrop.available) rows.push(["Pickup & drop", pickup ? "Requested" : "No — I'll ride in"]);
    rows.push(["Reference", <span key="r" className="font-mono tracking-wider">{state.data.reference}</span>]);

    return (
      <div ref={topRef} className="scroll-mt-[calc(var(--header-h)+1rem)]">
        <div aria-live="polite" className="flex flex-col gap-7">
          <SuccessMark />
          <div>
            <h2 ref={headingRef} tabIndex={-1} className="font-display text-display-md outline-none">
              Your service is requested.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed opacity-70">
              Thank you, {name.trim().split(" ")[0]}. Our service desk will call {formatPhone(cleanMobile(mobile))} to confirm your slot
              {pickup ? " and pickup time" : ""}. Nothing extra is done without your OK.
            </p>
          </div>
          <SummaryList rows={rows} />
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="dark"
              iconLeft="calendar"
              onClick={() =>
                downloadIcs(
                  `honda-service-${state.data.reference}.ics`,
                  buildIcs({
                    title: `${bikeName} service · ${dealership.name}`,
                    description: `${serviceNames(services).join(", ")}\nRegistration: ${formatRegistration(regNorm)}\nReference: ${state.data.reference}\nService desk: ${formatPhone(dealership.phone.service)}`,
                    location: formattedAddress,
                    date: date!,
                    time: slot!,
                    durationMinutes: plannedMinutes(services),
                    uid: `${state.data.reference}@${dealership.shortName.toLowerCase()}`,
                  }),
                )
              }
            >
              Add to calendar
            </Button>
            <CallServiceButton source="service_booking_success" label="Call service desk" />
          </div>
          <Link
            href={`/service/track?reg=${regNorm}`}
            className="group flex items-center justify-between gap-4 border-t border-current/10 pt-6 text-[15px] font-medium"
          >
            <span>
              Track this service
              <span className="mt-1 block text-[13px] font-normal opacity-60">Follow every stage once your bike is checked in.</span>
            </span>
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-current/20 transition-colors group-hover:bg-ink group-hover:text-paper">
              <Icon name="arrow-right" size={18} />
            </span>
          </Link>
        </div>
      </div>
    );
  }

  /* ───────────── Steps ───────────── */
  const foundBike = lookup.status === "found" ? findBike(lookup.vehicle.bikeSlug) : undefined;
  const foundColor = lookup.status === "found" ? findColor(foundBike, lookup.vehicle.colorName) : undefined;
  const openSlots = slots.filter((s) => s.available);

  const primaryLabel =
    step === 0
      ? lookup.status === "idle" || lookup.status === "loading"
        ? "Find my bike"
        : "Continue"
      : step === 3
        ? "Confirm booking"
        : "Continue";

  return (
    <div ref={topRef} className="scroll-mt-[calc(var(--header-h)+1rem)]">
      <StepProgress steps={STEPS} current={step} />
      <p className="sr-only" aria-live="polite">
        {live}
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: reduce ? 0 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduce ? 0 : -16 }}
            transition={{ duration: reduce ? 0.15 : 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 ref={headingRef} tabIndex={-1} className="font-display text-display-sm outline-none">
              {HEADINGS[step]}
            </h2>

            {/* ── STEP 1: vehicle ── */}
            {step === 0 && (
              <div className="mt-7 flex flex-col gap-6">
                <div>
                  <TextField
                    label="Registration number"
                    value={reg}
                    onChange={(e) => onRegChange(e.target.value)}
                    onFocus={markStarted}
                    onBlur={() => reg && setReg(formatRegistration(reg))}
                    placeholder="TN 37 AB 1234"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    maxLength={16}
                    error={errors.reg}
                    hint="As on your number plate — spaces don't matter."
                    className="[&_input]:font-medium [&_input]:uppercase [&_input]:tracking-[0.06em] [&_input]:placeholder:font-normal [&_input]:placeholder:tracking-normal"
                  />
                  {isDemoMode && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-[13px]">
                      <DemoBadge />
                      <span className="opacity-60">Try</span>
                      {DEMO_REGISTRATIONS.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => onRegChange(r)}
                          className="rounded-full border border-current/15 px-2.5 py-1 font-mono text-[12px] tracking-wide transition-colors hover:border-current/50"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {lookup.status === "loading" && (
                  <div className="flex items-center gap-4 rounded-2xl border border-current/10 p-4" aria-busy>
                    <span className="h-12 w-20 animate-pulse rounded-lg bg-current/[0.07]" />
                    <span className="flex-1 space-y-2">
                      <span className="block h-3 w-2/3 animate-pulse rounded bg-current/[0.08]" />
                      <span className="block h-3 w-1/3 animate-pulse rounded bg-current/[0.06]" />
                    </span>
                  </div>
                )}

                {lookup.status === "found" && confirmed !== false && (
                  <div className="overflow-hidden rounded-[22px] border border-current/12 bg-ink text-bone">
                    <div className="studio-glow px-6 pt-4">
                      {foundBike ? (
                        <BikeVisual bike={foundBike} color={foundColor} className="mx-auto max-w-[19rem]" sizes="320px" />
                      ) : (
                        <div className="grid h-32 place-items-center opacity-40">
                          <Icon name="bike" size={48} />
                        </div>
                      )}
                    </div>
                    <div className="border-t border-white/10 p-5">
                      {confirmed ? (
                        <div className="flex items-center justify-between gap-4">
                          <p className="flex items-center gap-2.5 text-[15px] font-medium">
                            <span className="grid size-6 place-items-center rounded-full bg-go text-white">
                              <Icon name="check" size={14} strokeWidth={2.4} />
                            </span>
                            Honda {lookup.vehicle.bikeName} · {lookup.vehicle.colorName}
                          </p>
                          <button type="button" onClick={() => setConfirmed(null)} className="text-[13px] underline underline-offset-4 opacity-70 hover:opacity-100">
                            Change
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-[15px] leading-snug">
                            Is this your <strong className="font-semibold">Honda {lookup.vehicle.bikeName}</strong>, {lookup.vehicle.colorName}?
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2.5">
                            <Button type="button" variant="light" iconLeft="check" onClick={() => { setConfirmed(true); setErrors((e) => ({ ...e, vehicle: null })); }}>
                              Yes, that&apos;s my bike
                            </Button>
                            <Button type="button" variant="ghost" className="text-bone" onClick={() => setConfirmed(false)}>
                              No, it&apos;s a different bike
                            </Button>
                          </div>
                          {errors.vehicle && (
                            <p className="mt-3 flex items-center gap-1.5 text-[13px] text-[#ff8a80]" role="alert">
                              <Icon name="alert" size={14} />
                              {errors.vehicle}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {lookup.status === "error" && (
                  <Notice
                    tone="warning"
                    title="We couldn't check our records"
                    action={
                      <Button type="button" size="sm" variant="outline" iconLeft="refresh" onClick={runLookup}>
                        Try again
                      </Button>
                    }
                  >
                    {lookup.message} You can also choose your model below and carry on.
                  </Notice>
                )}

                {manualPath && (
                  <div className="flex flex-col gap-4">
                    {lookup.status === "not_found" && (
                      <div className="flex gap-3 rounded-2xl bg-current/[0.04] p-4 text-sm leading-relaxed">
                        <Icon name="info" size={18} className="mt-0.5 shrink-0 opacity-60" />
                        <p>
                          <span className="font-medium">We don&apos;t have this bike on record yet — that&apos;s fine.</span>{" "}
                          <span className="opacity-70">Just tell us which Honda you ride.</span>
                        </p>
                      </div>
                    )}
                    <ChoiceGroup
                      legend="Your model"
                      name={`${uid}-model`}
                      options={[...bikes.map((b) => ({ value: b.slug, label: b.name })), { value: OTHER, label: "Other Honda" }]}
                      value={model}
                      onChange={(v) => {
                        setModel(v);
                        setErrors((e) => ({ ...e, model: null }));
                      }}
                      error={errors.model}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 2: service ── */}
            {step === 1 && (
              <div className="mt-7">
                <p className="mb-5 text-sm opacity-65">Choose one or more. Your advisor confirms the work with you before starting.</p>
                <ChoiceGroup
                  legend="Service type"
                  hideLegend
                  name={`${uid}-svc`}
                  layout="cards"
                  multiple
                  options={serviceTypes.map((s) => ({
                    value: s.id,
                    label: s.name,
                    description: s.description,
                    meta: <span className="mt-1.5 flex items-center gap-1.5 text-[12px] tabular opacity-55"><Icon name="clock" size={13} />{durationLabel(s.durationHours)}</span>,
                  }))}
                  value={services}
                  onChange={(v) => {
                    markStarted();
                    setServices((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));
                    setErrors((e) => ({ ...e, services: null }));
                  }}
                  error={errors.services}
                />
              </div>
            )}

            {/* ── STEP 3: day & time ── */}
            {step === 2 && (
              <div className="mt-7 flex flex-col gap-8">
                <div>
                  <DateStrip legend="Day" name={`${uid}-date`} value={date} onChange={pickDate} isDisabled={isWorkshopClosed} error={errors.date} />
                  <p className="mt-2.5 flex items-center gap-1.5 text-[13px] opacity-55">
                    <Icon name="info" size={14} />
                    Workshop closed on Sundays
                  </p>
                </div>

                {date && (
                  <div>
                    {slotsState === "error" ? (
                      <Notice
                        tone="error"
                        title="Couldn't load times"
                        action={
                          <Button type="button" size="sm" variant="outline" iconLeft="refresh" onClick={() => loadSlots(date)}>
                            Try again
                          </Button>
                        }
                      >
                        Check your connection — your choices are still here.
                      </Notice>
                    ) : slotsState === "ready" && openSlots.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-current/20 p-5">
                        <p className="font-display text-lg">Fully booked</p>
                        <p className="mt-1.5 text-sm opacity-65">
                          {formatDate(date, { weekday: "long", day: "numeric", month: "short" })} has no free times left.
                        </p>
                        <Button type="button" variant="dark" size="sm" className="mt-4" icon="arrow-right" loading={searchingNext} onClick={findNextAvailable}>
                          Next available day
                        </Button>
                      </div>
                    ) : (
                      <SlotPicker
                        name={`${uid}-slot`}
                        slots={slots}
                        loading={slotsState === "loading" || searchingNext}
                        value={slot}
                        onChange={(s) => {
                          setSlot(s);
                          setErrors((e) => ({ ...e, slot: null }));
                        }}
                        error={errors.slot}
                      />
                    )}
                  </div>
                )}

                {dealership.pickupDrop.available && (
                  <div className="border-t border-current/10 pt-6">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p id={`${uid}-pickup`} className="text-[15px] font-medium">
                          Pickup &amp; drop
                        </p>
                        <p className="mt-1 text-[13px] leading-relaxed opacity-60">
                          {dealership.pickupDrop.note ?? "Subject to availability."}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={pickup}
                        aria-labelledby={`${uid}-pickup`}
                        onClick={() => setPickup((p) => !p)}
                        className={cn(
                          "relative mt-0.5 h-8 w-[3.25rem] shrink-0 rounded-full border transition-colors duration-300",
                          pickup ? "border-ink bg-ink" : "border-current/25 bg-current/[0.06]",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1/2 size-6 -translate-y-1/2 rounded-full shadow transition-[left,background-color] duration-300 ease-[var(--ease-out-expo)]",
                            pickup ? "left-[calc(100%-1.75rem)] bg-paper" : "left-1 bg-current/50",
                          )}
                        />
                      </button>
                    </div>
                    {pickup && (
                      <div className="mt-5 flex flex-col gap-2">
                        <TextArea
                          label="Pickup address"
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            setErrors((er) => ({ ...er, address: null }));
                          }}
                          autoComplete="street-address"
                          rows={2}
                          aria-invalid={errors.address ? true : undefined}
                        />
                        {errors.address && (
                          <p className="flex items-center gap-1.5 text-[13px] text-alert" role="alert">
                            <Icon name="alert" size={14} />
                            {errors.address}
                          </p>
                        )}
                        <p className="text-[13px] opacity-55">We&apos;ll confirm the pickup time when we call.</p>
                      </div>
                    )}
                  </div>
                )}

                <TextArea
                  label="Anything we should know?"
                  optional
                  placeholder="A noise, a warning light, a part you'd like checked…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {/* ── STEP 4: confirm ── */}
            {step === 3 && (
              <div className="mt-7 flex flex-col gap-7">
                <dl className="divide-y divide-current/10 rounded-2xl border border-current/12">
                  <ReviewRow label="Bike" onEdit={() => goTo(0)}>
                    <span className="flex flex-wrap items-center justify-end gap-2">
                      {bikeName}
                      <RegistrationPlate registration={normaliseRegistration(reg)} size="sm" />
                    </span>
                  </ReviewRow>
                  <ReviewRow label="Service" onEdit={() => goTo(1)}>
                    {serviceNames(services).join(", ")}
                  </ReviewRow>
                  <ReviewRow label="When" onEdit={() => goTo(2)}>
                    {date && formatDate(date, { weekday: "short", day: "numeric", month: "short" })} · {slot && formatSlot(slot)}
                  </ReviewRow>
                  {pickup && (
                    <ReviewRow label="Pickup" onEdit={() => goTo(2)}>
                      {address.trim()}
                    </ReviewRow>
                  )}
                </dl>
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    label="Your name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((er) => ({ ...er, name: null }));
                    }}
                    error={errors.name}
                  />
                  <TextField
                    label="Mobile number"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    prefix="+91"
                    maxLength={14}
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value);
                      setErrors((er) => ({ ...er, mobile: null }));
                    }}
                    error={errors.mobile}
                  />
                </div>
                <p className="text-[13px] leading-relaxed opacity-55">
                  We&apos;ll only use your number to confirm this booking and update you about your bike.
                </p>
                {state.status === "error" && (
                  <Notice tone="error" title="Not booked yet" action={<CallServiceButton source="service_booking_error" size="sm" label="Call the service desk" />}>
                    {state.message}
                  </Notice>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Action bar ── */}
        <div className="sticky bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] z-10 -mx-5 mt-10 flex items-center gap-3 border-t border-current/10 bg-[color:var(--surface-bg)]/95 px-5 py-4 backdrop-blur md:static md:mx-0 md:bg-transparent md:px-0 md:pb-0 md:pt-6 md:backdrop-blur-none lg:bottom-0">
          {step > 0 && (
            <Button type="button" variant="ghost" iconLeft="arrow-left" onClick={back} className="px-4">
              Back
            </Button>
          )}
          <Button
            type="submit"
            size="lg"
            icon={step === 3 ? undefined : "arrow-right"}
            loading={lookup.status === "loading" || state.status === "submitting"}
            disabled={step === 0 && lookup.status === "found" && confirmed === null}
            className="ml-auto flex-1 sm:flex-none"
          >
            {primaryLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ReviewRow({ label, onEdit, children }: { label: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-3 px-4 py-3.5 text-sm">
      <dt className="opacity-55">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
      <button type="button" onClick={onEdit} className="text-[13px] underline underline-offset-4 opacity-60 hover:opacity-100">
        Edit<span className="sr-only"> {label.toLowerCase()}</span>
      </button>
    </div>
  );
}

/** Morning / afternoon grouped slot picker built on the shared SlotGrid semantics. */
function SlotPicker({
  name,
  slots,
  loading,
  value,
  onChange,
  error,
}: {
  name: string;
  slots: Slot[];
  loading: boolean;
  value: string | null;
  onChange: (s: string) => void;
  error?: string | null;
}) {
  if (loading) {
    return (
      <div aria-busy>
        <p className="mb-3 text-sm font-medium">Time</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded-full bg-current/[0.07]" />
          ))}
        </div>
      </div>
    );
  }
  const groups = [
    { label: "Morning", items: slots.filter((s) => s.slot < "12:00") },
    { label: "Afternoon", items: slots.filter((s) => s.slot >= "12:00") },
  ].filter((g) => g.items.length);
  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 text-sm font-medium">Time</legend>
      <div className="flex flex-col gap-4">
        {groups.map((g) => (
          <div key={g.label} className="grid grid-cols-[5.5rem_1fr] items-start gap-3">
            <span className="eyebrow pt-3.5 text-[10px] opacity-50">{g.label}</span>
            <div className="grid grid-cols-2 gap-2 xs:grid-cols-3 sm:grid-cols-4">
              {g.items.map((s) => {
                const on = value === s.slot;
                return (
                  <label
                    key={s.slot}
                    className={cn(
                      "flex h-11 cursor-pointer items-center justify-center rounded-full border text-sm tabular transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal",
                      on ? "border-current bg-current text-[color:var(--surface-bg,var(--color-ink))]" : "border-current/15 hover:border-current/40",
                      !s.available && "pointer-events-none line-through opacity-30",
                    )}
                  >
                    <input
                      type="radio"
                      name={name}
                      value={s.slot}
                      checked={on}
                      disabled={!s.available}
                      onChange={() => onChange(s.slot)}
                      className="sr-only"
                      aria-label={`${formatSlot(s.slot)}${s.available ? "" : " — fully booked"}`}
                    />
                    {formatSlot(s.slot)}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-alert" role="alert">
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
    </fieldset>
  );
}
