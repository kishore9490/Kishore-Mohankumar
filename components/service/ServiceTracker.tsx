"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { BikeVisual } from "@/components/bikes/BikeVisual";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { DemoBadge, Notice } from "@/components/ui/Notice";
import { SuccessMark } from "@/components/ui/SuccessMark";
import { serviceStages } from "@/data/services";
import { track } from "@/lib/analytics";
import { ApiError, getServiceJob, isDemoMode } from "@/lib/api";
import { cn, formatINR, formatRegistration, normaliseRegistration } from "@/lib/format";
import type { ServiceJob } from "@/lib/types";
import { validators } from "@/lib/validation";
import { HeroTitle } from "./HeroTitle";
import { RegistrationPlate } from "./RegistrationPlate";
import { CallServiceButton, DirectionsButton, WhatsAppServiceButton } from "./ServiceActions";
import { DEMO_REGISTRATIONS, findBike, findColor, friendlyDateTime, stageIndex, workshopHours } from "./utils";

type Result =
  | { status: "idle" }
  | { status: "loading"; key: string }
  | { status: "found"; job: ServiceJob; at: Date }
  | { status: "not_found"; key: string }
  | { status: "error"; key: string; message: string };

const isJobCard = (key: string) => /^JC\d{3,}$/.test(key);
const displayKey = (key: string) => (isJobCard(key) ? key.replace(/^JC/, "JC-") : formatRegistration(key));

async function resolveJob(key: string): Promise<Result> {
  try {
    const job = await getServiceJob(key);
    return { status: "found", job, at: new Date() };
  } catch (e) {
    if (e instanceof ApiError && e.code === "not_found") return { status: "not_found", key };
    return { status: "error", key, message: e instanceof ApiError ? e.message : "Something went wrong. Please try again." };
  }
}

function report(r: Result, mode: "search" | "refresh") {
  if (r.status === "found") track("service_track", { found: true, stage: r.job.stage, mode });
  else if (r.status === "not_found") track("service_track", { found: false, mode });
}

export interface ServiceTrackerProps {
  /** Registration or job-card number to look up immediately (e.g. from `?reg=`). */
  initialQuery?: string;
}

export function ServiceTracker({ initialQuery = "" }: ServiceTrackerProps) {
  const inputId = useId();
  const initialKey = normaliseRegistration(initialQuery);
  const [query, setQuery] = useState(initialKey ? displayKey(initialKey) : "");
  const [inputError, setInputError] = useState<string | null>(null);
  const [result, setResult] = useState<Result>(initialKey ? { status: "loading", key: initialKey } : { status: "idle" });
  const [refreshing, setRefreshing] = useState(false);
  const req = useRef(0);
  const resultRef = useRef<HTMLDivElement>(null);

  function fetchJob(key: string, mode: "search" | "refresh" = "search") {
    const id = ++req.current;
    return resolveJob(key).then((r) => {
      if (id !== req.current) return;
      report(r, mode);
      setResult(r);
      setRefreshing(false);
    });
  }

  // Auto-run when arriving with ?reg=
  useEffect(() => {
    if (!initialKey) return;
    const id = ++req.current;
    resolveJob(initialKey).then((r) => {
      if (id !== req.current) return;
      report(r, "search");
      setResult(r);
    });
  }, [initialKey]);

  function search(e?: React.FormEvent) {
    e?.preventDefault();
    const key = normaliseRegistration(query);
    const err = isJobCard(key) ? null : validators.registration(query);
    setInputError(err ? "Enter a registration (e.g. TN 37 AB 1234) or job card number (e.g. JC-24817)." : null);
    if (err) return;
    setQuery(displayKey(key));
    setResult({ status: "loading", key });
    // Shallow URL sync (shareable link) without a server round-trip.
    window.history.replaceState(null, "", `/service/track?reg=${encodeURIComponent(key)}`);
    void fetchJob(key);
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function refresh() {
    if (result.status !== "found") return;
    setRefreshing(true);
    void fetchJob(normaliseRegistration(result.job.vehicle.registration), "refresh");
  }

  function retry() {
    if (result.status !== "error") return;
    setResult({ status: "loading", key: result.key });
    void fetchJob(result.key);
  }

  const compact = result.status === "found" || result.status === "loading";

  return (
    <>
      {/* ───────── Search ───────── */}
      <section
        className={cn(
          "grain relative overflow-hidden bg-ink pt-[calc(var(--header-h)+2.5rem)] md:pt-[calc(var(--header-h)+4.5rem)]",
          compact ? "pb-8 md:pb-12" : "pb-16 md:pb-24",
        )}
      >
        <div className="container-x relative grid grid-cols-1 gap-10 lg:grid-cols-[1fr_minmax(0,32rem)] lg:items-end lg:gap-20">
          <div>
            <p className="eyebrow mb-5 flex items-center gap-3 opacity-70">
              <Icon name="clock" size={14} />
              Service tracking
              {isDemoMode && result.status !== "found" && <DemoBadge className="ml-1" />}
            </p>
            <h1 className="font-display text-display-lg">
              <HeroTitle lines={["Track your", "service."]} />
            </h1>
            {!compact && (
              <p className="mt-5 max-w-md text-base leading-relaxed opacity-70 md:text-lg">
                See exactly where your bike is in the workshop — from check-in to ready for pickup.
              </p>
            )}
          </div>

          <form onSubmit={search} noValidate role="search" aria-label="Track a service" className="min-w-0">
            <label htmlFor={inputId} className="mb-2.5 block text-sm font-medium">
              Registration or job card number
            </label>
            <div className="flex gap-2">
              <input
                id={inputId}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value.toUpperCase());
                  if (inputError) setInputError(null);
                }}
                placeholder="TN 37 AB 1234"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-invalid={inputError ? true : undefined}
                aria-describedby={inputError ? `${inputId}-err` : undefined}
                className={cn(
                  "h-14 min-w-0 flex-1 rounded-full border border-white/20 bg-white/[0.04] px-5 text-base font-medium uppercase tracking-[0.06em] outline-none transition-colors placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-bone/35 focus:border-white/60",
                  inputError && "border-alert",
                )}
              />
              <Button type="submit" size="lg" variant="light" loading={result.status === "loading"} className="shrink-0 px-6">
                Track
              </Button>
            </div>
            {inputError ? (
              <p id={`${inputId}-err`} role="alert" className="mt-2 flex items-center gap-1.5 px-5 text-[13px] text-[#ff8a80]">
                <Icon name="alert" size={14} />
                {inputError}
              </p>
            ) : (
              isDemoMode &&
              result.status !== "found" && (
                <p className="mt-3 flex flex-wrap items-center gap-2 px-1 text-[13px] opacity-70">
                  <span className="opacity-70">Try</span>
                  {DEMO_REGISTRATIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setQuery(r)}
                      className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[12px] tracking-wide transition-colors hover:border-white/50"
                    >
                      {r}
                    </button>
                  ))}
                </p>
              )
            )}
          </form>
        </div>
      </section>

      {/* ───────── Result ───────── */}
      <div ref={resultRef} aria-live="polite" aria-busy={result.status === "loading"} className="scroll-mt-[var(--header-h)]">
        {result.status === "loading" && <TrackerSkeleton />}
        {result.status === "not_found" && <NotFound keyText={displayKey(result.key)} />}
        {result.status === "error" && (
          <section className="bg-ink pb-24">
            <div className="container-x">
              <Notice
                tone="error"
                title="We couldn't load your service status"
                className="max-w-xl"
                action={
                  <div className="flex flex-wrap gap-2.5">
                    <Button size="sm" variant="light" iconLeft="refresh" onClick={retry}>
                      Try again
                    </Button>
                    <CallServiceButton source="service_track_error" size="sm" label="Call the service desk" />
                  </div>
                }
              >
                {result.message}
              </Notice>
            </div>
          </section>
        )}
        {result.status === "found" && <JobView job={result.job} at={result.at} refreshing={refreshing} onRefresh={refresh} />}
        {result.status === "idle" && <IdleHelp />}
      </div>
    </>
  );
}

/* ───────────── States ───────────── */

function TrackerSkeleton() {
  return (
    <section className="bg-ink pb-24" aria-label="Loading service status">
      <div className="container-x">
        <div className="rounded-[28px] border border-white/10 p-6 md:p-10">
          <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
          <div className="mt-6 h-12 w-3/4 max-w-lg animate-pulse rounded-lg bg-white/10" />
          <div className="mt-4 h-7 w-44 animate-pulse rounded bg-white/[0.07]" />
          <div className="mt-12 grid grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="size-4 animate-pulse rounded-full bg-white/15" />
                <div className="h-2.5 w-full max-w-20 animate-pulse rounded bg-white/[0.07]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function NotFound({ keyText }: { keyText: string }) {
  return (
    <section className="surface-paper py-16 md:py-24">
      <div className="container-x grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-2xl">
          <span className="grid size-12 place-items-center rounded-full border border-current/15" aria-hidden>
            <Icon name="search" size={20} />
          </span>
          <h2 className="mt-6 font-display text-display-md text-balance">No active service for {keyText}</h2>
          <p className="mt-4 text-base leading-relaxed opacity-70">
            If you dropped your bike off today, it may take a little while to appear here. If it&apos;s already home, it won&apos;t
            show an active service. Either way, we&apos;re happy to help.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
          <ButtonLink href={`/service/book?reg=${normaliseRegistration(keyText)}`} size="lg" icon="arrow-right">
            Book service
          </ButtonLink>
          <CallServiceButton source="service_track_not_found" size="lg" label="Call service desk" />
        </div>
      </div>
    </section>
  );
}

function IdleHelp() {
  return (
    <section className="surface-paper py-16 md:py-24">
      <div className="container-x">
        <p className="eyebrow mb-8 opacity-60">What you&apos;ll see</p>
        <ol className="grid border-t border-current/15 sm:grid-cols-2 lg:grid-cols-3">
          {serviceStages.map((s, i) => (
            <li key={s.id} className="flex gap-5 border-b border-current/15 py-6 sm:pr-8">
              <span className="eyebrow tabular pt-1 opacity-45">0{i + 1}</span>
              <div>
                <h2 className="text-[15px] font-medium">{s.label}</h2>
                <p className="mt-1 text-sm leading-relaxed opacity-65">{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm opacity-60">
          Your job card number is on the slip you received at check-in. Your registration works just as well.
        </p>
      </div>
    </section>
  );
}

/* ───────────── Found ───────────── */

function JobView({ job, at, refreshing, onRefresh }: { job: ServiceJob; at: Date; refreshing: boolean; onRefresh: () => void }) {
  const idx = stageIndex(job.stage);
  const current = serviceStages[idx];
  const ready = job.stage === "ready";
  const bike = findBike(job.vehicle.bikeSlug);
  const color = findColor(bike, job.vehicle.colorName);
  const estimateIdx = stageIndex("estimate");
  const reg = formatRegistration(job.vehicle.registration);
  const closing = workshopHours()[0];

  return (
    <>
      <section className="bg-ink pb-16 md:pb-24" aria-labelledby="job-title">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-ink-2">
            {/* Header */}
            <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-[1.3fr_1fr] md:p-10 lg:gap-14">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="eyebrow opacity-60">Your service status</p>
                  {isDemoMode && <DemoBadge />}
                </div>
                <h2 id="job-title" className="mt-5 font-display text-display-md text-balance">
                  <span className="block text-[0.5em] leading-none opacity-55">Honda</span>
                  {job.vehicle.bikeName}
                </h2>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <RegistrationPlate registration={job.vehicle.registration} />
                  <span className="text-sm opacity-60">{job.vehicle.colorName}</span>
                </div>
              </div>
              <div className="relative hidden md:block">
                {bike && (
                  <div className="studio-glow -my-4">
                    <BikeVisual bike={bike} color={color} className="ml-auto max-w-[24rem]" sizes="400px" />
                  </div>
                )}
              </div>
            </div>

            <dl className="grid grid-cols-2 border-t border-white/10 text-sm md:grid-cols-4">
              {[
                ["Job card", <span key="j" className="font-mono tracking-wide">{job.jobId}</span>],
                ["Advisor", job.advisor],
                [ready ? "Ready since" : "Promised by", ready && job.timeline.ready ? friendlyDateTime(job.timeline.ready) : friendlyDateTime(job.promisedBy)],
                ["Work", job.serviceTypes.join(", ")],
              ].map(([k, v], i) => (
                <div key={k as string} className={cn("border-white/10 px-5 py-4 sm:px-8 md:px-10 md:py-5", i % 2 === 1 && "border-l", i > 1 && "border-t md:border-t-0", i === 2 && "md:border-l")}>
                  <dt className="eyebrow text-[10px] opacity-50">{k}</dt>
                  <dd className="mt-1.5 font-medium leading-snug">{v}</dd>
                </div>
              ))}
            </dl>

            {/* Current stage */}
            <div className="border-t border-white/10 p-5 sm:p-8 md:p-10">
              {ready ? (
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-5">
                    <SuccessMark size={56} />
                    <div>
                      <p className="font-display text-display-sm text-balance">Your bike is ready to ride home.</p>
                      <p className="mt-2 max-w-md text-sm leading-relaxed opacity-65">
                        {current.description}
                        {closing ? ` The workshop is open until ${closing.time.split(" – ")[1]} (${closing.days}).` : ""}
                      </p>
                    </div>
                  </div>
                  <DirectionsButton source="service_track_ready" size="lg" />
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <span className="relative mt-2.5 flex size-3 shrink-0" aria-hidden>
                    <span className="absolute inset-0 animate-ping rounded-full bg-signal/60" />
                    <span className="relative size-3 rounded-full bg-signal" />
                  </span>
                  <div>
                    <p className="eyebrow text-[10px] opacity-50">Right now · step {idx + 1} of {serviceStages.length}</p>
                    <p className="mt-1.5 font-display text-display-sm">{current.label}</p>
                    <p className="mt-2 max-w-lg text-[15px] leading-relaxed opacity-70">{current.description}</p>
                  </div>
                </div>
              )}

              <StageTracker job={job} />
            </div>
          </div>
        </div>
      </section>

      {/* Details on paper */}
      <section className="surface-paper py-14 md:py-20" aria-label="Service details">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div className="flex flex-col gap-8">
            {job.estimateInr != null && idx >= estimateIdx && (
              <div className="border-t border-current/15 pt-6">
                <p className="eyebrow opacity-55">{idx > estimateIdx ? "Estimate approved" : "Estimate shared"}</p>
                <p className="mt-2 font-display-wide text-display-md tabular">{formatINR(job.estimateInr)}</p>
                <p className="mt-2 text-sm leading-relaxed opacity-65">
                  {idx > estimateIdx
                    ? "Nothing extra is added without your OK — if we find anything else, your advisor will call you first."
                    : "Your advisor will walk you through it. Work starts only once you approve."}
                </p>
              </div>
            )}
            {job.notes.length > 0 && (
              <div className="border-t border-current/15 pt-6">
                <p className="eyebrow opacity-55">Work notes</p>
                <ul className="mt-4 flex flex-col">
                  {job.notes.map((n) => (
                    <li key={n} className="flex gap-3 border-b border-current/10 py-3.5 text-[15px] leading-snug last:border-0">
                      <Icon name="check" size={16} className="mt-0.5 shrink-0 text-go" />
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="border-t border-current/15 pt-6">
            <p className="eyebrow opacity-55">Questions about your bike?</p>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed opacity-75">
              Your service advisor can explain any part of the work or the estimate. Call or message — mention job card{" "}
              <span className="font-mono">{job.jobId}</span>.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CallServiceButton source="service_track" variant="dark" label="Call service advisor" />
              <WhatsAppServiceButton source="service_track" context={`${reg}, job card ${job.jobId}`} />
              <Button variant="ghost" iconLeft="refresh" loading={refreshing} onClick={onRefresh}>
                Refresh status
              </Button>
            </div>
            <p className="mt-4 text-[13px] opacity-50" aria-live="polite">
              Last updated {at.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/** Six-stage progress: horizontal from md, vertical on phones. Line fills to the current stage on reveal. */
function StageTracker({ job }: { job: ServiceJob }) {
  const reduce = useReducedMotion();
  const idx = stageIndex(job.stage);
  const fraction = idx / (serviceStages.length - 1);
  const transition = { duration: reduce ? 0 : 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <div className="mt-10">
      {/* Desktop — horizontal */}
      <ol className="relative hidden grid-cols-6 md:grid" aria-label="Service progress">
        <span className="absolute left-[8.333%] right-[8.333%] top-[9px] h-[2px] rounded-full bg-white/10" aria-hidden />
        <span className="absolute left-[8.333%] top-[9px] h-[2px] w-[83.333%]" aria-hidden>
          <motion.span className="block h-full origin-left rounded-full bg-bone" style={{ width: `${fraction * 100}%` }} initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={transition} />
        </span>
        {serviceStages.map((s, i) => (
          <StageItem key={s.id} label={s.label} at={job.timeline[s.id]} state={i < idx || job.stage === "ready" ? "done" : i === idx ? "current" : "todo"} index={i} layout="row" />
        ))}
      </ol>

      {/* Mobile — vertical */}
      <ol className="relative flex flex-col md:hidden" aria-label="Service progress">
        <span className="absolute left-[9px] top-2 bottom-2 w-[2px] rounded-full bg-white/10" aria-hidden />
        <span className="absolute left-[9px] top-2 w-[2px]" style={{ height: `calc((100% - 1rem) * ${fraction})` }} aria-hidden>
          <motion.span className="block size-full origin-top rounded-full bg-bone" initial={reduce ? false : { scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={transition} />
        </span>
        {serviceStages.map((s, i) => (
          <StageItem
            key={s.id}
            label={s.label}
            description={i === idx && job.stage !== "ready" ? s.description : undefined}
            at={job.timeline[s.id]}
            state={i < idx || job.stage === "ready" ? "done" : i === idx ? "current" : "todo"}
            index={i}
            layout="column"
          />
        ))}
      </ol>
    </div>
  );
}

function StageItem({
  label,
  description,
  at,
  state,
  index,
  layout,
}: {
  label: string;
  description?: string;
  at?: string;
  state: "done" | "current" | "todo";
  index: number;
  layout: "row" | "column";
}) {
  const reduce = useReducedMotion();
  const dot = (
    <span className="relative grid size-5 shrink-0 place-items-center" aria-hidden>
      {state === "current" && <span className="absolute inset-0 animate-ping rounded-full bg-signal/50" />}
      <motion.span
        initial={reduce ? false : { scale: 0.4, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: reduce ? 0 : 0.2 + index * 0.18, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "relative grid size-5 place-items-center rounded-full border-2",
          state === "done" && "border-bone bg-bone text-ink",
          state === "current" && "border-signal bg-signal",
          state === "todo" && "border-white/25 bg-ink-2",
        )}
      >
        {state === "done" && <Icon name="check" size={12} strokeWidth={3} />}
        {state === "current" && <span className="size-1.5 rounded-full bg-white" />}
      </motion.span>
    </span>
  );
  const status = state === "done" ? "completed" : state === "current" ? "in progress" : "upcoming";
  const time = at ? friendlyDateTime(at) : null;

  if (layout === "row") {
    return (
      <li className="relative flex flex-col items-center gap-3 px-1 text-center" aria-current={state === "current" ? "step" : undefined}>
        {dot}
        <span className={cn("text-[13px] leading-tight", state === "current" ? "font-semibold" : state === "todo" ? "opacity-45" : "opacity-85")}>
          {label}
          <span className="sr-only"> — {status}</span>
        </span>
        <span className="min-h-4 text-[11px] tabular opacity-50">{state === "done" || state === "current" ? time : ""}</span>
      </li>
    );
  }
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0" aria-current={state === "current" ? "step" : undefined}>
      {dot}
      <div className="-mt-0.5 min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className={cn("text-[15px]", state === "current" ? "font-semibold" : state === "todo" ? "opacity-45" : "opacity-90")}>
            {label}
            <span className="sr-only"> — {status}</span>
          </span>
          {time && <span className="shrink-0 text-[12px] tabular opacity-50">{time}</span>}
        </div>
        {description && <p className="mt-1.5 text-sm leading-relaxed opacity-65">{description}</p>}
      </div>
    </li>
  );
}
