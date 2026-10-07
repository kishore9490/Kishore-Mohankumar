"use client";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { codeCategories, labCases, type CodeCategory } from "@/data/lab";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

const STEPS = ["Select category", "Review documentation", "Assign code", "Submit"] as const;

/**
 * MEDICAL CODING LAB — an educational simulation of the coding workflow.
 * Fictional cases, fixed answer sets. Not a coding recommendation system.
 */
export function CodingLab() {
  const [caseId, setCaseId] = useState(labCases[0].id);
  const c = labCases.find((x) => x.id === caseId)!;

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<CodeCategory | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [choice, setChoice] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const relevant = c.keyTerms.filter((k) => k.relevant).map((k) => k.term);
  const allFound = relevant.every((t) => found.includes(t));
  const selected = c.options.find((o) => o.code === choice);

  const reset = (id = caseId) => {
    setCaseId(id);
    setStep(0);
    setCategory(null);
    setFound([]);
    setChoice(null);
    setSubmitted(false);
  };

  const pickCategory = (cat: CodeCategory) => {
    setCategory(cat);
    if (cat === c.category) window.setTimeout(() => setStep(1), 450);
  };

  const toggleTerm = (term: string) => {
    if (step < 1) return;
    setFound((f) => (f.includes(term) ? f.filter((t) => t !== term) : [...f, term]));
  };

  const submit = () => {
    setSubmitted(true);
    setStep(3);
    track("lab_submitted", { case: c.id, correct: !!selected?.correct });
  };

  // Turn the note into clickable spans for each key term.
  const noteParts = useMemo(() => {
    const terms = c.keyTerms.map((k) => k.term).sort((a, b) => b.length - a.length);
    const re = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    return c.note.map((line) => line.split(re));
  }, [c]);

  return (
    <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[#0a1f3d] text-white shadow-[0_60px_140px_-60px_rgba(0,0,0,.8)]">
      {/* Window chrome */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-cyan/70" />
          </div>
          <span className="label !text-white/55">EMC Coding Lab · simulation</span>
        </div>
        <ol className="no-scrollbar flex items-center gap-1 overflow-x-auto" aria-label="Lab steps">
          {STEPS.map((s, i) => (
            <li
              key={s}
              aria-current={step === i ? "step" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] transition-colors",
                step === i ? "bg-cyan text-ink" : step > i ? "text-white/80" : "text-white/35",
              )}
            >
              {step > i ? <Icon name="check" size={12} /> : <span className="font-mono text-[10px]">{i + 1}</span>}
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr_1fr]">
        {/* LEFT · case list */}
        <aside className="border-b border-white/10 p-4 lg:border-b-0 lg:border-r md:p-5" aria-label="Fictional cases">
          <p className="label !text-white/45">Case queue</p>
          <ul className="no-scrollbar mt-3 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {labCases.map((x, i) => (
              <li key={x.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => reset(x.id)}
                  aria-pressed={x.id === caseId}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-colors",
                    x.id === caseId ? "border-cyan/60 bg-white/[.06]" : "border-white/10 hover:border-white/25",
                  )}
                >
                  <span className="font-mono text-[10px] text-white/40">CASE {String(i + 1).padStart(3, "0")}</span>
                  <span className="mt-1 block text-[14px] font-medium">{x.title}</span>
                  <span className="mt-0.5 block text-[11.5px] text-white/50">{x.specialty}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 hidden text-[11px] leading-relaxed text-white/40 lg:block">
            All patients are fictional. For learning only.
          </p>
        </aside>

        {/* MIDDLE · documentation */}
        <div className="border-b border-white/10 p-4 lg:border-b-0 lg:border-r md:p-6">
          <div className="flex items-center justify-between">
            <p className="label !text-white/45">Clinical documentation</p>
            <span className="text-[11.5px] text-white/45">{c.patient}</span>
          </div>
          <div className="mt-4 space-y-3 font-[450] text-[14.5px] leading-[1.7] text-white/85">
            {noteParts.map((parts, li) => (
              <p key={li}>
                {parts.map((part, pi) => {
                  const k = c.keyTerms.find((t) => t.term.toLowerCase() === part.toLowerCase());
                  if (!k) return <span key={pi}>{part}</span>;
                  const on = found.includes(k.term);
                  return (
                    <button
                      key={pi}
                      type="button"
                      onClick={() => toggleTerm(k.term)}
                      disabled={step < 1 || submitted}
                      aria-pressed={on}
                      title={step >= 1 ? k.meaning : undefined}
                      className={cn(
                        "rounded-[4px] px-0.5 text-left transition-colors",
                        step >= 1 && !submitted && "cursor-pointer underline decoration-white/30 decoration-dashed underline-offset-4 hover:bg-white/10",
                        on && (k.relevant ? "bg-cyan/25 !no-underline text-white" : "bg-white/15 !no-underline"),
                      )}
                    >
                      {part}
                    </button>
                  );
                })}
              </p>
            ))}
          </div>

          <AnimatePresence>
            {step >= 1 && found.length > 0 && (
              <motion.ul initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-1.5">
                {found.map((t) => {
                  const k = c.keyTerms.find((x) => x.term === t)!;
                  return (
                    <li key={t} className="flex gap-2 text-[12.5px] leading-snug">
                      <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", k.relevant ? "bg-cyan" : "bg-white/40")} />
                      <span>
                        <span className="text-white">{k.term}</span>
                        <span className="text-white/55"> — {k.meaning}</span>
                      </span>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT · coding interface */}
        <div className="p-4 md:p-6">
          <p className="label !text-white/45">Coding workspace</p>
          <p className="mt-3 text-[15px] font-medium">{c.task}</p>

          {/* Step 1 */}
          <fieldset className="mt-5">
            <legend className="text-[12px] text-white/55">1 · Which code set?</legend>
            <div className="mt-2 grid gap-1.5">
              {codeCategories.map((cat) => {
                const on = category === cat.id;
                const wrong = on && cat.id !== c.category;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => pickCategory(cat.id)}
                    disabled={step > 0}
                    aria-pressed={on}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-[13px] transition-colors disabled:cursor-default",
                      on && !wrong && "border-cyan bg-cyan/10",
                      wrong && "border-orange-400/70 bg-orange-400/10",
                      !on && "border-white/10 enabled:hover:border-white/30",
                      step > 0 && !on && "opacity-40",
                    )}
                  >
                    <span>
                      <span className="code-chip font-semibold">{cat.id}</span>
                      <span className="ml-2 text-white/55">{cat.describes}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {category && category !== c.category && (
              <p className="mt-2 text-[12px] text-orange-200" role="status">
                Not quite — this task asks for a diagnosis. {category} describes something else. Try again.
              </p>
            )}
          </fieldset>

          {/* Step 2 */}
          {step >= 1 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
              <p className="text-[12px] text-white/55">2 · Review the documentation</p>
              <p className="mt-1 text-[13px] text-white/80">
                Tap the underlined phrases in the note that determine the code.{" "}
                <span className="text-cyan">
                  {relevant.filter((t) => found.includes(t)).length}/{relevant.length} key details found
                </span>
              </p>
              {step === 1 && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!allFound}
                  className="mt-3 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-ink disabled:opacity-35"
                >
                  {allFound ? "Continue to coding →" : "Find the key details to continue"}
                </button>
              )}
            </motion.div>
          )}

          {/* Step 3 */}
          {step >= 2 && (
            <motion.fieldset initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
              <legend className="text-[12px] text-white/55">3 · Assign the code</legend>
              <div className="mt-2 grid gap-1.5" role="radiogroup">
                {c.options.map((o) => {
                  const on = choice === o.code;
                  const reveal = submitted && (on || o.correct);
                  return (
                    <button
                      key={o.code}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      disabled={submitted}
                      onClick={() => setChoice(o.code)}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-left transition-colors disabled:cursor-default",
                        !submitted && on && "border-cyan bg-cyan/10",
                        !submitted && !on && "border-white/10 hover:border-white/30",
                        reveal && o.correct && "border-emerald-400/70 bg-emerald-400/10",
                        reveal && !o.correct && "border-orange-400/70 bg-orange-400/10",
                        submitted && !reveal && "border-white/5 opacity-40",
                      )}
                    >
                      <span className="flex items-baseline gap-3">
                        <span className="code-chip w-14 shrink-0 font-semibold text-cyan">{o.code}</span>
                        <span className="text-[13px] text-white/85">{o.label}</span>
                      </span>
                      {reveal && <span className="mt-1.5 block pl-[68px] text-[12px] leading-snug text-white/65">{o.why}</span>}
                    </button>
                  );
                })}
              </div>
              {!submitted && (
                <button
                  type="button"
                  disabled={!choice}
                  onClick={submit}
                  className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-cyan px-5 text-[14px] font-medium text-ink disabled:opacity-35"
                >
                  Submit code <Icon name="arrow" size={15} />
                </button>
              )}
            </motion.fieldset>
          )}

          {/* Result */}
          <AnimatePresence>
            {submitted && selected && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 rounded-xl border border-white/10 bg-white/[.04] p-4"
                role="status"
              >
                <p className={cn("text-[15px] font-semibold", selected.correct ? "text-emerald-300" : "text-orange-200")}>
                  {selected.correct ? "Correct — well reasoned." : "Not this time — and that’s how you learn."}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/75">
                  <span className="text-white">Key takeaway: </span>
                  {c.takeaway}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => reset()} className="rounded-full border border-white/20 px-4 py-2 text-[13px] hover:border-white/50">
                    Try again
                  </button>
                  {labCases.findIndex((x) => x.id === caseId) < labCases.length - 1 && (
                    <button
                      type="button"
                      onClick={() => reset(labCases[labCases.findIndex((x) => x.id === caseId) + 1].id)}
                      className="rounded-full bg-white px-4 py-2 text-[13px] font-medium text-ink"
                    >
                      Next case →
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="border-t border-white/10 px-5 py-3 text-[11.5px] leading-relaxed text-white/45">
        Educational simulation using fictional cases and a fixed answer set — not an official coding recommendation
        system and not medical advice. Real coding depends on complete documentation, the current code-set edition and
        official guidelines. CPT® is a registered trademark of the AMA.
      </p>
    </div>
  );
}
