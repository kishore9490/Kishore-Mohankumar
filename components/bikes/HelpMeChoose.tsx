"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { budgetBands, categoryLabels, priorityLabels, startingPrice, usageLabels } from "@/data/bikes";
import type { RidePriority } from "@/lib/types";
import { track } from "@/lib/analytics";
import { cn, formatINR } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BikeVisual } from "./BikeVisual";
import { recommend, type BudgetId, type Purpose, type QuizAnswers, type Recommendation } from "./match";

type Step = 0 | 1 | 2;

const purposeOptions: { value: Purpose; hint: string }[] = [
  { value: "commute", hint: "Office, college, errands — every day" },
  { value: "family", hint: "Two-up rides, school runs, the market" },
  { value: "long-rides", hint: "Highways and out-of-town trips" },
  { value: "weekend", hint: "Riding for the joy of it" },
  { value: "performance", hint: "Power, handling and presence" },
];

const priorityOptions: { value: RidePriority; hint: string }[] = [
  { value: "mileage", hint: "The lowest running cost" },
  { value: "comfort", hint: "Easy on the body, solo or two-up" },
  { value: "performance", hint: "Strong pull and easy overtakes" },
  { value: "style", hint: "Looks that turn heads" },
  { value: "features", hint: "Smart key, displays, connectivity" },
];

const questions = [
  { key: "purpose", eyebrow: "Ride purpose", title: "What will you mostly ride for?" },
  { key: "budget", eyebrow: "Budget", title: "What's your budget?" },
  { key: "priority", eyebrow: "Priority", title: "What matters most to you?" },
] as const;

type Draft = Partial<QuizAnswers>;

function answerLabel(step: Step, d: Draft) {
  if (step === 0 && d.purpose) return usageLabels[d.purpose];
  if (step === 1 && d.budget) return budgetBands.find((b) => b.id === d.budget)!.label;
  if (step === 2 && d.priority) return priorityLabels[d.priority];
  return null;
}

/**
 * "Which Honda is right for you?" — a three-question guided quiz that scores
 * the range (usage match, budget fit with a near-budget stretch, priority
 * score) and explains its pick with reasons generated from the bike's data.
 * Anchor target: `#help-me-choose`.
 */
export function HelpMeChoose({ index = "02", className }: { index?: string; className?: string }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>(0);
  const [draft, setDraft] = useState<Draft>({});
  const [result, setResult] = useState<Recommendation[] | null>(null);
  const [dir, setDir] = useState(1);
  const focusRef = useRef<HTMLHeadingElement>(null);
  const interacted = useRef(false);

  useEffect(() => {
    if (interacted.current) focusRef.current?.focus({ preventScroll: true });
  }, [step, result]);

  function choose<K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) {
    interacted.current = true;
    const next = { ...draft, [key]: value };
    setDraft(next);
    setDir(1);
    if (step < 2) {
      setStep((s) => (s + 1) as Step);
      return;
    }
    const answers = next as QuizAnswers;
    const recs = recommend(answers);
    setResult(recs);
    track("recommendation_shown", {
      bike: recs[0].bike.slug,
      purpose: answers.purpose,
      budget: answers.budget,
      priority: answers.priority,
      fit: recs[0].fit,
      alternates: recs.slice(1, 3).map((r) => r.bike.slug).join(","),
    });
  }

  function back() {
    interacted.current = true;
    setDir(-1);
    setStep((s) => Math.max(0, s - 1) as Step);
  }

  function goTo(s: Step) {
    interacted.current = true;
    setDir(s < step ? -1 : 1);
    setResult(null);
    setStep(s);
  }

  function restart() {
    interacted.current = true;
    setDir(-1);
    setDraft({});
    setResult(null);
    setStep(0);
  }

  const q = questions[step];
  const slide = reduce ? 0 : 28;

  return (
    <section
      id="help-me-choose"
      aria-labelledby="help-me-choose-title"
      className={cn("relative overflow-hidden bg-ink py-24 text-bone md:py-36", className)}
    >
      <div className="pointer-events-none absolute inset-0 grain" aria-hidden />
      <div
        className="pointer-events-none absolute -right-[20%] top-0 h-[70%] w-[80%] bg-[radial-gradient(closest-side,rgb(255_255_255/0.06),transparent)]"
        aria-hidden
      />
      <div className="container-x relative">
        <AnimatePresence mode="wait" initial={false}>
          {!result ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="grid gap-12 lg:grid-cols-12 lg:gap-16"
            >
              <div className="lg:col-span-5">
                <div id="help-me-choose-title">
                  <SectionHeading
                    index={index}
                    eyebrow="Help me choose"
                    title={["Which Honda", "is right", "for you?"]}
                    lede="Three quick questions. One honest recommendation from the bikes on our floor — with the reasons why."
                    size="md"
                  />
                </div>
                {/* answer trail (desktop) */}
                <ol className="mt-12 hidden border-t border-white/10 lg:block">
                  {questions.map((qq, i) => {
                    const a = answerLabel(i as Step, draft);
                    const current = i === step;
                    return (
                      <li key={qq.key} className="border-b border-white/10">
                        <button
                          type="button"
                          disabled={!a && !current}
                          onClick={() => goTo(i as Step)}
                          aria-current={current ? "step" : undefined}
                          className="flex min-h-14 w-full items-center gap-4 py-3 text-left transition-opacity disabled:opacity-35"
                        >
                          <span className={cn("eyebrow tabular", current ? "text-signal" : "text-bone/40")}>0{i + 1}</span>
                          <span className="flex-1 text-sm text-bone/60">{qq.eyebrow}</span>
                          <span className={cn("text-sm", a ? "text-bone" : "text-bone/30")}>{a ?? (current ? "Now" : "—")}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-[28px] border border-white/[0.08] bg-ink-2 p-5 sm:p-8 md:p-10">
                  {/* progress */}
                  <div className="flex items-center justify-between gap-4">
                    <p className="eyebrow text-bone/55" aria-live="polite">
                      Question <span className="tabular">{step + 1}</span> of 3 · {q.eyebrow}
                    </p>
                    {step > 0 && (
                      <button
                        type="button"
                        onClick={back}
                        className="-mr-2 inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm text-bone/70 transition-colors hover:bg-white/[0.06] hover:text-bone"
                      >
                        <Icon name="arrow-left" size={16} />
                        Back
                      </button>
                    )}
                  </div>
                  <div className="mt-3 flex gap-1.5" aria-hidden>
                    {questions.map((qq, i) => (
                      <span key={qq.key} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
                        <span
                          className={cn(
                            "block h-full origin-left rounded-full transition-transform duration-700 ease-[var(--ease-out-expo)]",
                            i === step ? "bg-signal" : "bg-bone",
                          )}
                          style={{ transform: `scaleX(${i <= step ? 1 : 0})` }}
                        />
                      </span>
                    ))}
                  </div>

                  <AnimatePresence mode="wait" initial={false} custom={dir}>
                    <motion.fieldset
                      key={step}
                      initial={{ opacity: 0, x: slide * dir }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -slide * dir, transition: { duration: 0.18 } }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-8 min-w-0"
                    >
                      <legend className="contents">
                        <h3 ref={focusRef} tabIndex={-1} className="font-display text-display-sm outline-none">
                          {q.title}
                        </h3>
                      </legend>
                      <div className="mt-6 grid gap-2">
                        {step === 0 &&
                          purposeOptions.map((o, i) => (
                            <Option
                              key={o.value}
                              n={i}
                              label={usageLabels[o.value]}
                              hint={o.hint}
                              selected={draft.purpose === o.value}
                              onSelect={() => choose("purpose", o.value)}
                            />
                          ))}
                        {step === 1 &&
                          budgetBands.map((b, i) => (
                            <Option
                              key={b.id}
                              n={i}
                              label={b.label}
                              hint="Ex-showroom price"
                              selected={draft.budget === b.id}
                              onSelect={() => choose("budget", b.id as BudgetId)}
                            />
                          ))}
                        {step === 2 &&
                          priorityOptions.map((o, i) => (
                            <Option
                              key={o.value}
                              n={i}
                              label={priorityLabels[o.value]}
                              hint={o.hint}
                              selected={draft.priority === o.value}
                              onSelect={() => choose("priority", o.value)}
                            />
                          ))}
                      </div>
                    </motion.fieldset>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : (
            <Result key="result" recs={result} answers={draft as QuizAnswers} headingRef={focusRef} onRestart={restart} onEdit={goTo} />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Option({ n, label, hint, selected, onSelect }: { n: number; label: string; hint: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "group/opt flex min-h-16 w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.99] sm:px-5",
        selected ? "border-bone/80 bg-white/[0.07]" : "border-white/10 hover:border-white/30 hover:bg-white/[0.03]",
      )}
    >
      <span className="eyebrow tabular w-5 text-bone/35">{String.fromCharCode(65 + n)}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium sm:text-base">{label}</span>
        <span className="mt-0.5 block text-[13px] text-bone/55">{hint}</span>
      </span>
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,color,transform] duration-300",
          selected ? "border-bone bg-bone text-ink" : "border-white/15 text-bone/60 group-hover/opt:translate-x-0.5 group-hover/opt:border-white/40",
        )}
        aria-hidden
      >
        <Icon name={selected ? "check" : "arrow-right"} size={16} />
      </span>
    </button>
  );
}

function Result({
  recs,
  answers,
  headingRef,
  onRestart,
  onEdit,
}: {
  recs: Recommendation[];
  answers: QuizAnswers;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onRestart: () => void;
  onEdit: (s: Step) => void;
}) {
  const reduce = useReducedMotion();
  const top = recs[0];
  const alternates = recs.slice(1, 3);
  const b = top.bike;
  const chips: [Step, string][] = [
    [0, usageLabels[answers.purpose]],
    [1, budgetBands.find((x) => x.id === answers.budget)!.label],
    [2, priorityLabels[answers.priority]],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      aria-live="polite"
    >
      <div className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow flex items-center gap-3 text-bone/60">
            <span className="h-px w-8 bg-current opacity-40" aria-hidden />
            Your recommendation
          </p>
          <p className="mt-3 text-sm text-bone/55">Based on what you told us:</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {chips.map(([s, label]) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => onEdit(s)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 px-3.5 text-[13px] text-bone/80 transition-colors hover:border-white/40"
                  aria-label={`Change ${questions[s].eyebrow.toLowerCase()}: ${label}`}
                >
                  {label}
                  <Icon name="chevron-down" size={13} className="opacity-50" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex h-11 items-center gap-2 self-start rounded-full px-1 text-sm text-bone/70 underline-offset-4 hover:text-bone hover:underline md:self-auto"
        >
          <Icon name="refresh" size={16} />
          Start again
        </button>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
        {/* visual */}
        <div className="relative lg:col-span-7">
          <div className="relative overflow-hidden rounded-[28px] bg-ink-2 px-4 pb-6 pt-12 ring-1 ring-white/[0.06] sm:px-10">
            <div className="studio-glow absolute inset-0" aria-hidden />
            <p
              className="pointer-events-none absolute inset-x-0 top-5 select-none text-center font-display-wide text-[clamp(3rem,12vw,9rem)] leading-none text-white/[0.04]"
              aria-hidden
            >
              {b.name}
            </p>
            <motion.div
              initial={{ opacity: 0, x: reduce ? 0 : 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <BikeVisual bike={b} priority sizes="(min-width: 1024px) 55vw, 92vw" />
            </motion.div>
            <p className="eyebrow relative mt-2 flex items-center justify-between text-bone/45">
              <span>{categoryLabels[b.category]}</span>
              <span>{b.heroImage ? "" : "Studio illustration"}</span>
            </p>
          </div>
        </div>

        {/* story */}
        <div className="lg:col-span-5">
          <h3 ref={headingRef} tabIndex={-1} className="font-display-wide text-display-md outline-none">
            {b.name}
          </h3>
          <p className="mt-3 text-base text-bone/65 md:text-lg">{b.tagline}</p>

          <h4 className="eyebrow mt-9 text-bone/55">Why this bike?</h4>
          <ol className="mt-4 space-y-4">
            {top.reasons.map((r, i) => (
              <li key={i} className="flex gap-4 text-[15px] leading-relaxed text-bone/85">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-white/20 text-[11px] tabular text-bone/70">
                  {i + 1}
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ol>

          <div className="mt-9 border-t border-white/10 pt-6">
            <p className="text-sm text-bone/55">Starting price</p>
            <p className="mt-1 font-display-wide text-4xl tabular">
              {formatINR(startingPrice(b))}
              <span className="ml-2 align-middle font-sans text-sm font-normal normal-case tracking-normal text-bone/50">ex-showroom*</span>
            </p>
            <p className={cn("mt-2 text-sm", top.fit === "stretch" || top.fit === "over" ? "text-amber" : "text-bone/60")}>{top.budgetNote}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={`/bikes/${b.slug}`} size="lg" icon="arrow-right">
              Explore this bike
            </ButtonLink>
            <ButtonLink href={`/test-ride?bike=${b.slug}`} size="lg" variant="outline" iconLeft="helmet">
              Book a test ride
            </ButtonLink>
          </div>
          <p className="mt-5 text-[12px] leading-relaxed text-bone/45">
            *Indicative prices and real-world estimates, not official figures. Our team will confirm the on-road price and specifications.
          </p>
        </div>
      </div>

      {alternates.length > 0 && (
        <div className="mt-16">
          <h4 className="eyebrow text-bone/55">Also worth a look</h4>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {alternates.map((r) => (
              <li key={r.bike.slug}>
                <Link
                  href={`/bikes/${r.bike.slug}`}
                  className="group/alt flex items-center gap-4 rounded-2xl border border-white/10 p-3 pr-5 transition-colors hover:border-white/30 hover:bg-white/[0.03]"
                >
                  <span className="w-28 shrink-0 rounded-xl bg-ink-2 px-2 py-1.5 sm:w-36" aria-hidden>
                    <BikeVisual bike={r.bike} sizes="144px" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg leading-tight">{r.bike.name}</span>
                    <span className="mt-1 block text-[13px] text-bone/55">
                      From <span className="tabular text-bone/80">{formatINR(startingPrice(r.bike))}</span>*
                      <span className="hidden sm:inline"> · {r.bike.tagline}</span>
                    </span>
                  </span>
                  <Icon name="arrow-right" size={18} className="shrink-0 text-bone/50 transition-transform group-hover/alt:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
