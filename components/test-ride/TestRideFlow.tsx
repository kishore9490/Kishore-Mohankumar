"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { BikeVisual } from "@/components/bikes/BikeVisual";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ChoiceGroup, DateStrip, SlotGrid, StepProgress, TextField, upcomingDates } from "@/components/ui/Field";
import { Icon, WhatsAppGlyph } from "@/components/ui/Icon";
import { Notice } from "@/components/ui/Notice";
import { SuccessMark, SummaryList } from "@/components/ui/SuccessMark";
import { bikes } from "@/data/bikes";
import { dealership, formattedAddress } from "@/data/dealership";
import { useSubmit } from "@/hooks/useSubmit";
import { track } from "@/lib/analytics";
import { ApiError, getSlots, submitLead, type Slot } from "@/lib/api";
import { cn, formatDate, formatPhone, formatSlot } from "@/lib/format";
import { buildIcs, downloadIcs } from "@/lib/ics";
import type { TestRideRequest } from "@/lib/types";
import { cleanMobile, validators } from "@/lib/validation";
import { RideTicket, RideTicketStrip } from "./RideTicket";

export interface TestRideFlowProps {
  /** Bike slug to pre-select. When valid, the flow opens on "When & where". */
  initialBike?: string;
  /** Variant id (shown on the pass and sent with the request). */
  initialVariant?: string;
  /** Colour id used for the pass visual. */
  initialColor?: string;
  /** Analytics / CRM source, e.g. "test_ride_page", "product_page". */
  source: string;
  /** Embedded mode: no side ticket, compact strip on every breakpoint. */
  compact?: boolean;
  className?: string;
}

type Step = 0 | 1 | 2;
const STEPS = ["Your ride", "When & where", "About you"];
const HEADINGS = ["Pick your ride.", "When & where?", "Who's riding?"];
const LEDES = [
  "Every model below is available to test ride. Choose one — you can ask to try another on the day.",
  "Choose a day and a time that suits you. We'll call to confirm before you set out.",
  "Last step. We'll call this number to confirm your slot — nothing else.",
];

const rideBikes = bikes.filter((b) => b.testRideAvailable);
const DOORSTEP = "doorstep";
const ease = [0.16, 1, 0.3, 1] as const;

type SlotState =
  | { status: "idle" }
  | { status: "loading"; date: string }
  | { status: "ready"; date: string; slots: Slot[] }
  | { status: "error"; date: string; message: string };

const noop = () => () => {};
/** True only after hydration — dates depend on the visitor's clock and locale. */
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

const longDate = (iso: string) => formatDate(iso, { weekday: "long", day: "numeric", month: "long" });
const shortDate = (iso: string) => formatDate(iso, { weekday: "short", day: "numeric", month: "short" });

export function TestRideFlow({ initialBike, initialVariant, initialColor, source, compact, className }: TestRideFlowProps) {
  const reduce = useReducedMotion();
  const preset = rideBikes.find((b) => b.slug === initialBike);

  const [step, setStep] = useState<Step>(preset ? 1 : 0);
  const [bikeSlug, setBikeSlug] = useState(preset?.slug ?? "");
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotState>({ status: "idle" });
  const [searching, setSearching] = useState(false);
  const [locationId, setLocationId] = useState(dealership.testRideLocations[0]?.id ?? "showroom");
  const [area, setArea] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [announce, setAnnounce] = useState("");

  const { state, run } = useSubmit(submitLead);
  const hydrated = useHydrated();
  const done = state.status === "success";

  const started = useRef(false);
  const requestId = useRef(0);
  const focusPending = useRef(false);

  const bike = rideBikes.find((b) => b.slug === bikeSlug);
  const isPreset = !!bike && bike.slug === preset?.slug;
  const color = (isPreset && bike.colors.find((c) => c.id === initialColor)) || bike?.colors[0];
  const variant = isPreset ? bike.variants.find((v) => v.id === initialVariant) : undefined;
  const location = dealership.testRideLocations.find((l) => l.id === locationId);
  const isDoorstep = locationId === DOORSTEP;
  const locationText = location ? (isDoorstep ? `Doorstep${area.trim() ? ` · ${area.trim()}` : ""}` : "Showroom") : undefined;
  const firstName = name.trim().split(/\s+/)[0];

  // Focus moves to the new step heading once it mounts (after the exit animation).
  const headingRef = useCallback((el: HTMLHeadingElement | null) => {
    if (el && focusPending.current) {
      focusPending.current = false;
      el.focus();
    }
  }, []);

  function goTo(s: Step) {
    focusPending.current = true;
    setStep(s);
  }

  function markStarted() {
    if (started.current) return;
    started.current = true;
    track("test_ride_started", { source, bike: bikeSlug || undefined });
  }

  function clearError(...keys: string[]) {
    setErrors((e) => {
      const next = { ...e };
      for (const k of keys) next[k] = null;
      return next;
    });
  }

  async function loadSlots(d: string) {
    const id = ++requestId.current;
    setSlots({ status: "loading", date: d });
    try {
      const list = await getSlots("test_ride", d);
      if (id !== requestId.current) return;
      setSlots({ status: "ready", date: d, slots: list });
      const open = list.filter((s) => s.available).length;
      setAnnounce(open ? `${open} times open on ${longDate(d)}.` : `All slots are taken on ${longDate(d)}.`);
    } catch (e) {
      if (id !== requestId.current) return;
      setSlots({
        status: "error",
        date: d,
        message: e instanceof ApiError ? e.message : "We couldn't load times for this day.",
      });
    }
  }

  function chooseDate(d: string) {
    setDate(d);
    setSlot(null);
    clearError("date", "slot");
    void loadSlots(d);
  }

  async function nextAvailableDay() {
    if (!date) return;
    const dates = upcomingDates(14);
    setSearching(true);
    const id = ++requestId.current;
    try {
      for (let i = dates.indexOf(date) + 1; i < dates.length; i++) {
        const list = await getSlots("test_ride", dates[i]);
        if (id !== requestId.current) return;
        if (list.some((s) => s.available)) {
          setDate(dates[i]);
          setSlot(null);
          setSlots({ status: "ready", date: dates[i], slots: list });
          setAnnounce(`Moved to ${longDate(dates[i])} — ${list.filter((s) => s.available).length} times open.`);
          return;
        }
      }
      setAnnounce("No open times in the next two weeks. Please call the showroom.");
    } catch (e) {
      if (id === requestId.current)
        setSlots({ status: "error", date, message: e instanceof ApiError ? e.message : "We couldn't load times." });
    } finally {
      setSearching(false);
    }
  }

  function validate(s: Step): Record<string, string | null> {
    if (s === 0) return { bike: bike ? null : "Choose a motorcycle to ride." };
    if (s === 1)
      return {
        date: date ? null : "Pick a day for your ride.",
        slot: date && !slot ? "Pick a time that suits you." : null,
        location: location ? null : "Choose where you'd like to ride.",
      };
    return { name: validators.name(name), mobile: validators.mobile(mobile) };
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    markStarted();
    const errs = validate(step);
    setErrors(errs);
    const count = Object.values(errs).filter(Boolean).length;
    if (count) {
      setAnnounce(count === 1 ? "One thing needs your attention." : `${count} things need your attention.`);
      return;
    }
    if (step < 2) {
      goTo((step + 1) as Step);
      return;
    }
    if (!bike || !date || !slot || !location) return;
    // `area`, `variantId` and `colorId` ride along until TestRideRequest gains these fields.
    const lead: TestRideRequest & { area?: string; variantId?: string; colorId?: string } = {
      type: "test_ride",
      name: name.trim(),
      mobile: cleanMobile(mobile),
      source,
      bikeSlug: bike.slug,
      date,
      slot,
      locationId: location.id,
      area: isDoorstep && area.trim() ? area.trim() : undefined,
      variantId: variant?.id,
      colorId: color?.id,
    };
    focusPending.current = true;
    const receipt = await run(lead);
    if (!receipt) focusPending.current = false;
    if (receipt) track("test_ride_completed", { source, bike: bike.slug, location: location.id, date, slot });
  }

  function back() {
    if (step > 0) goTo((step - 1) as Step);
  }

  const ticket = {
    bike,
    color,
    variantName: variant?.name,
    date,
    slot,
    location: locationText,
    rider: name.trim() || undefined,
    reference: done ? state.data.reference : undefined,
  };

  const stepMotion = {
    initial: { opacity: 0, y: reduce ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduce ? 0 : -10 },
    transition: { duration: 0.5, ease },
  };

  return (
    <div
      className={cn("grid gap-8", !compact && "lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-14 xl:gap-20", className)}
      onChangeCapture={markStarted}
    >
      <div className="min-w-0">
        <div className={cn("mb-7", !compact && "lg:hidden")}>
          <RideTicketStrip {...ticket} />
        </div>

        <p className="sr-only" aria-live="polite" role="status">
          {announce}
        </p>

        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div key="done" {...stepMotion}>
              <Confirmation
                headingRef={headingRef}
                bikeName={bike?.name ?? ""}
                date={date!}
                slot={slot!}
                isDoorstep={isDoorstep}
                area={area.trim()}
                locationLabel={location?.label ?? ""}
                mobile={cleanMobile(mobile)}
                reference={state.data.reference}
                firstName={firstName}
                source={source}
                compact={compact}
              />
            </motion.div>
          ) : (
            <motion.form key={step} noValidate onSubmit={onSubmit} {...stepMotion}>
              <StepProgress steps={STEPS} current={step} />
              <h2
                ref={headingRef}
                tabIndex={-1}
                className={cn("mt-7 font-display outline-none", compact ? "text-display-sm" : "text-display-md")}
              >
                {HEADINGS[step]}
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed opacity-65">{LEDES[step]}</p>

              <div className="mt-8 flex flex-col gap-9">
                {step === 0 && (
                  <BikePicker
                    value={bikeSlug}
                    onChange={(slug) => {
                      setBikeSlug(slug);
                      clearError("bike");
                    }}
                    error={errors.bike}
                    compact={compact}
                  />
                )}

                {step === 1 && (
                  <>
                    {bike && (
                      <div className="flex items-center justify-between gap-4 border-y border-current/10 py-3 text-sm">
                        <span className="min-w-0 truncate">
                          <span className="opacity-55">Riding </span>
                          <span className="font-medium">Honda {bike.name}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => goTo(0)}
                          className="shrink-0 rounded-full px-2 py-1 text-[13px] font-medium underline decoration-current/30 underline-offset-4 hover:decoration-current"
                        >
                          Change
                        </button>
                      </div>
                    )}
                    {hydrated ? (
                      <DateStrip legend="Day" name="tr-date" value={date} onChange={chooseDate} error={errors.date} />
                    ) : (
                      <div aria-hidden>
                        <p className="mb-3 text-sm font-medium">Day</p>
                        <div className="flex gap-2 overflow-hidden">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-[5.5rem] w-[4.25rem] shrink-0 animate-pulse rounded-2xl bg-current/[0.06]" />
                          ))}
                        </div>
                      </div>
                    )}
                    <TimeSlots
                      state={slots}
                      value={slot}
                      onChange={(s) => {
                        setSlot(s);
                        clearError("slot");
                      }}
                      onRetry={() => date && void loadSlots(date)}
                      onNextDay={nextAvailableDay}
                      searching={searching}
                      error={errors.slot}
                    />
                    <div className="flex flex-col gap-4">
                      <ChoiceGroup
                        legend="Where would you like to ride?"
                        name="tr-location"
                        layout="cards"
                        columns="grid-cols-1 sm:grid-cols-2"
                        options={dealership.testRideLocations.map((l) => ({
                          value: l.id,
                          label: l.label,
                          description: l.id === DOORSTEP ? `${l.detail} We'll confirm on the call.` : l.detail,
                        }))}
                        value={locationId}
                        onChange={(v) => {
                          setLocationId(v);
                          clearError("location");
                        }}
                        error={errors.location}
                      />
                      <AnimatePresence initial={false}>
                        {isDoorstep && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease }}
                            className="overflow-hidden"
                          >
                            <TextField
                              label="Area or locality"
                              optional
                              hint="Helps us check doorstep availability before we call."
                              placeholder="e.g. Saibaba Colony"
                              autoComplete="address-level3"
                              value={area}
                              onChange={(e) => setArea(e.target.value)}
                              maxLength={80}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <div className="flex max-w-md flex-col gap-5">
                    <TextField
                      label="Your name"
                      autoComplete="name"
                      autoCapitalize="words"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) clearError("name");
                      }}
                      onBlur={() => name && setErrors((er) => ({ ...er, name: validators.name(name) }))}
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
                        if (errors.mobile) clearError("mobile");
                      }}
                      onBlur={() => mobile && setErrors((er) => ({ ...er, mobile: validators.mobile(mobile) }))}
                      error={errors.mobile}
                      hint="We'll call to confirm. No spam, ever."
                    />
                    <p className="flex items-start gap-2 text-[13px] leading-relaxed opacity-60">
                      <Icon name="shield" size={16} className="mt-0.5 shrink-0" />
                      Free and without obligation. Bring a valid two-wheeler driving licence on the day.
                    </p>
                  </div>
                )}

                {state.status === "error" && step === 2 && (
                  <Notice
                    tone="error"
                    title="Your request didn't go through"
                    action={
                      <div className="flex flex-wrap gap-2">
                        <Button type="submit" size="sm" variant="dark" iconLeft="refresh">
                          Try again
                        </Button>
                        <ButtonLink
                          href={`tel:${dealership.phone.sales}`}
                          size="sm"
                          variant="outline"
                          iconLeft="phone"
                          onClick={() => track("phone_click", { source: `${source}_error` })}
                        >
                          Call {formatPhone(dealership.phone.sales)}
                        </ButtonLink>
                      </div>
                    }
                  >
                    {state.message}
                    {!/details/i.test(state.message) && " Your details are saved — just try again."}
                  </Notice>
                )}
              </div>

              <div className="mt-10 flex items-center gap-3 border-t border-current/10 pt-6">
                {step > 0 && (
                  <Button type="button" variant="ghost" iconLeft="arrow-left" onClick={back} className="-ml-3">
                    Back
                  </Button>
                )}
                <div className="ml-auto flex items-center gap-4">
                  {step < 2 ? (
                    <Button type="submit" variant="dark" size="lg" icon="arrow-right">
                      {step === 0 ? "Choose a day" : "Almost done"}
                    </Button>
                  ) : (
                    <Button type="submit" variant="primary" size="lg" icon="arrow-right" loading={state.status === "submitting"}>
                      {state.status === "submitting" ? "Sending" : "Request test ride"}
                    </Button>
                  )}
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {!compact && (
        <aside className="hidden lg:block" aria-label="Test ride pass">
          <div className="sticky top-[calc(var(--header-h)+1.5rem)]">
            <RideTicket {...ticket} />
            <p className="mt-4 px-2 text-[12.5px] leading-relaxed opacity-55">
              This is a request, not a confirmed booking. Our team will call to confirm your slot.
            </p>
          </div>
        </aside>
      )}
    </div>
  );
}

/* ───────────── Bike picker ───────────── */

function BikePicker({
  value,
  onChange,
  error,
  compact,
}: {
  value: string;
  onChange: (slug: string) => void;
  error?: string | null;
  compact?: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  // Bring a pre-selected bike into view inside the horizontal scroller (mobile).
  useEffect(() => {
    const el = scroller.current;
    const on = el?.querySelector<HTMLElement>("[data-on='true']");
    if (el && on && el.scrollWidth > el.clientWidth) el.scrollLeft = on.offsetLeft - 20;
  }, []);

  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 flex w-full items-baseline justify-between text-sm font-medium">
        <span>Motorcycle</span>
        <span className="eyebrow text-[10px] opacity-50 sm:hidden">Swipe for more</span>
      </legend>
      <div
        ref={scroller}
        className={cn(
          "no-scrollbar -mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-px-5 px-5 pb-2",
          "sm:mx-0 sm:grid sm:snap-none sm:grid-cols-3 sm:overflow-visible sm:px-0",
          !compact && "xl:grid-cols-4",
        )}
      >
        {rideBikes.map((b) => {
          const on = b.slug === value;
          return (
            <label
              key={b.slug}
              data-on={on}
              className={cn(
                "group relative flex w-[9.5rem] shrink-0 snap-start cursor-pointer flex-col rounded-2xl border p-2 transition-[border-color,background-color,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98] sm:w-auto",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal",
                on ? "border-current bg-current/[0.06]" : "border-current/12 hover:border-current/35",
              )}
            >
              <input
                type="radio"
                name="tr-bike"
                value={b.slug}
                checked={on}
                onChange={() => onChange(b.slug)}
                className="sr-only"
              />
              <span className="studio-glow relative grid aspect-[5/3] place-items-center overflow-hidden rounded-xl bg-ink px-2.5">
                <BikeVisual
                  bike={b}
                  sizes="160px"
                  className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                />
              </span>
              <span className="flex items-end justify-between gap-2 px-1.5 pb-1 pt-2.5">
                <span className="min-w-0">
                  <span className="eyebrow block text-[9.5px] opacity-50">{b.category}</span>
                  <span className="block truncate text-[14px] font-medium leading-tight">{b.name}</span>
                </span>
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                    on ? "border-signal bg-signal text-white" : "border-current/25",
                  )}
                  aria-hidden
                >
                  {on && <Icon name="check" size={12} strokeWidth={2.6} />}
                </span>
              </span>
            </label>
          );
        })}
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

/* ───────────── Slots ───────────── */

function TimeSlots({
  state,
  value,
  onChange,
  onRetry,
  onNextDay,
  searching,
  error,
}: {
  state: SlotState;
  value: string | null;
  onChange: (slot: string) => void;
  onRetry: () => void;
  onNextDay: () => void;
  searching: boolean;
  error?: string | null;
}) {
  if (state.status === "idle") {
    return (
      <div>
        <p className="mb-3 text-sm font-medium">Preferred time</p>
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-current/20 px-4 py-5 text-sm opacity-65">
          <Icon name="clock" size={18} className="shrink-0" />
          Choose a day above to see open times.
        </div>
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div>
        <p className="mb-3 text-sm font-medium">Preferred time</p>
        <Notice
          tone="error"
          title="Couldn't load times"
          action={
            <Button type="button" size="sm" variant="outline" iconLeft="refresh" onClick={onRetry}>
              Try again
            </Button>
          }
        >
          {state.message}
        </Notice>
      </div>
    );
  }
  const list = state.status === "ready" ? state.slots : [];
  const loading = state.status === "loading" || searching;
  const open = list.filter((s) => s.available).length;
  const booked = list.length - open;
  return (
    <div className="flex flex-col gap-3">
      <SlotGrid
        legend={state.status === "ready" ? `Preferred time · ${shortDate(state.date)}` : "Preferred time"}
        name="tr-slot"
        slots={list}
        value={value}
        onChange={onChange}
        loading={loading}
        error={error}
      />
      {!loading && open > 0 && booked > 0 && (
        <p className="flex items-center gap-2 text-[12.5px] opacity-55">
          <span className="inline-block h-px w-5 bg-current" aria-hidden />
          Struck-through times are already booked.
        </p>
      )}
      {!loading && list.length > 0 && open === 0 && (
        <Notice
          tone="warning"
          title="All slots are taken that day — try the next day"
          action={
            <Button type="button" size="sm" variant="dark" icon="arrow-right" onClick={onNextDay}>
              Next available day
            </Button>
          }
        >
          Popular days fill up quickly. We&apos;ll jump to the next day with an open slot.
        </Notice>
      )}
      {!loading && list.length === 0 && state.status === "ready" && (
        <Notice tone="warning" title="No test rides that day">
          <button type="button" onClick={onNextDay} className="font-medium underline underline-offset-4">
            Show the next available day
          </button>
        </Notice>
      )}
    </div>
  );
}

/* ───────────── Confirmation ───────────── */

function Confirmation({
  headingRef,
  bikeName,
  date,
  slot,
  isDoorstep,
  area,
  locationLabel,
  mobile,
  reference,
  firstName,
  source,
  compact,
}: {
  headingRef: (el: HTMLHeadingElement | null) => void;
  bikeName: string;
  date: string;
  slot: string;
  isDoorstep: boolean;
  area: string;
  locationLabel: string;
  mobile: string;
  reference: string;
  firstName: string;
  source: string;
  compact?: boolean;
}) {
  const reduce = useReducedMotion();
  const where = isDoorstep ? `Doorstep${area ? ` — ${area}` : " — address confirmed on the call"}` : `${dealership.name}, ${formattedAddress}`;

  function addToCalendar() {
    const ics = buildIcs({
      title: `Honda ${bikeName} test ride (requested)`,
      description: `Test ride request ${reference} with ${dealership.name}. The team will call to confirm. Bring a valid two-wheeler driving licence (and your helmet if you have one). Showroom: ${formatPhone(dealership.phone.sales)}.`,
      location: where,
      date,
      time: slot,
      durationMinutes: 45,
      uid: `${reference}@${new URL(dealership.siteUrl).hostname}`,
    });
    downloadIcs(`test-ride-${reference}.ics`, ics);
  }

  const waText = `Hi ${dealership.shortName}, I've just requested a test ride of the Honda ${bikeName} on ${shortDate(date)} at ${formatSlot(slot)} (${isDoorstep ? `doorstep${area ? `, ${area}` : ""}` : "at the showroom"}). My reference is ${reference}.`;
  const waUrl = `https://wa.me/${dealership.whatsapp}?text=${encodeURIComponent(waText)}`;

  const item = (i: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: 0.15 + i * 0.08, ease },
  });

  return (
    <div className="flex flex-col gap-8">
      <motion.div {...item(0)} className="flex items-center gap-4">
        <SuccessMark size={56} />
        <p className="eyebrow opacity-60">Request received{firstName ? ` · Thank you, ${firstName}` : ""}</p>
      </motion.div>
      <motion.div {...item(1)}>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className={cn("font-display text-balance outline-none", compact ? "text-display-sm" : "text-display-md")}
        >
          Your test ride is requested.
        </h2>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed opacity-70">
          We&apos;ll call you on <span className="font-medium tabular">{formatPhone(mobile)}</span> to confirm the slot, usually
          within showroom hours. Until then it&apos;s a request, not a guaranteed booking — times can shift if the bike is out on
          another ride.
        </p>
      </motion.div>

      <motion.div {...item(2)}>
        <SummaryList
          rows={[
            ["Motorcycle", `Honda ${bikeName}`],
            ["Date", longDate(date)],
            ["Preferred time", formatSlot(slot)],
            ["Location", isDoorstep ? `${locationLabel}${area ? ` · ${area}` : ""}` : locationLabel],
            [
              "Dealership",
              <span key="d" className="block max-w-[16rem] text-right">
                {dealership.name}
                <span className="mt-0.5 block text-[12.5px] font-normal opacity-60">{formattedAddress}</span>
              </span>,
            ],
            ["Reference", <span key="r" className="font-mono tracking-[0.14em]">{reference}</span>],
          ]}
        />
      </motion.div>

      <motion.div {...item(3)} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button type="button" variant="dark" size="lg" iconLeft="calendar" onClick={addToCalendar}>
          Add to calendar
        </Button>
        <ButtonLink
          href={`tel:${dealership.phone.sales}`}
          variant="outline"
          size="lg"
          iconLeft="phone"
          onClick={() => track("phone_click", { source: `${source}_confirmation` })}
        >
          Call showroom
        </ButtonLink>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_click", { source: `${source}_confirmation`, intent: "test_ride" })}
          className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full border border-current/25 px-7 text-[15px] font-medium transition-colors duration-300 hover:border-current/60 hover:bg-current/[0.04]"
        >
          <WhatsAppGlyph size={18} />
          WhatsApp us
        </a>
      </motion.div>

      <motion.div {...item(4)} className="grid gap-5 border-t border-current/10 pt-7 sm:grid-cols-[auto_1fr] sm:gap-8">
        <p className="eyebrow pt-1 opacity-55">What to bring</p>
        <ul className="grid gap-3 text-[15px]">
          <li className="flex items-start gap-3">
            <Icon name="shield" size={20} className="mt-px shrink-0 opacity-70" />
            <span>
              A valid two-wheeler driving licence
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Icon name="helmet" size={20} className="mt-px shrink-0 opacity-70" />
            <span>
              Your helmet, if you have one <span className="opacity-55">— otherwise just ask when we call</span>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Icon name="clock" size={20} className="mt-px shrink-0 opacity-70" />
            <span>
              About 20 minutes <span className="opacity-55">— plus time for questions</span>
            </span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
