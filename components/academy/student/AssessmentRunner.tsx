"use client";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { startAssessment, submitAssessment, type ActionResult } from "@/server/actions/student";
import type { PublicQuestion } from "@/server/repositories/student";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { FormMessage } from "./FormMessage";

type Answers = Record<string, number[] | string>;

const TYPE_LABEL: Record<PublicQuestion["type"], string> = {
  single: "Choose one", multiple: "Choose all that apply", true_false: "True or false", scenario: "Scenario", short: "Short answer", coding_case: "Coding case",
};

function isAnswered(v: number[] | string | undefined) {
  return Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim().length > 0;
}

/**
 * Takes an assessment. The browser only ever receives questions without answers;
 * grading, attempt limits and the time limit are enforced by the server action.
 */
export function AssessmentRunner({
  assessmentId, title, durationMin, questions, resumeStartedAt, attemptsLeft,
}: {
  assessmentId: string;
  title: string;
  durationMin: number;
  questions: PublicQuestion[];
  resumeStartedAt: string | null;
  attemptsLeft: number;
}) {
  const storeKey = `emc-asm-${assessmentId}`;
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [idx, setIdx] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(submitAssessment, null);
  const formRef = useRef<HTMLFormElement>(null);
  const autoSubmitted = useRef(false);

  const deadline = startedAt ? new Date(startedAt).getTime() + durationMin * 60000 : null;
  const remaining = deadline ? Math.max(0, Math.floor((deadline - now) / 1000)) : durationMin * 60;

  useEffect(() => {
    if (!startedAt) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [startedAt]);

  // Keep answers across a refresh during the attempt (this browser only).
  useEffect(() => {
    if (!startedAt) return;
    try {
      sessionStorage.setItem(storeKey, JSON.stringify({ startedAt, answers }));
    } catch {
      /* storage unavailable */
    }
  }, [answers, startedAt, storeKey]);

  const submitNow = useCallback(() => formRef.current?.requestSubmit(), []);

  useEffect(() => {
    if (startedAt && remaining === 0 && !autoSubmitted.current && !pending) {
      autoSubmitted.current = true;
      submitNow();
    }
  }, [remaining, startedAt, pending, submitNow]);

  const begin = async () => {
    setStarting(true);
    setStartError(null);
    const res = await startAssessment(assessmentId);
    setStarting(false);
    if (!res.ok) return setStartError(res.error);
    try {
      const saved = JSON.parse(sessionStorage.getItem(storeKey) ?? "null") as { startedAt: string; answers: Answers } | null;
      if (saved?.startedAt === res.startedAt) setAnswers(saved.answers);
    } catch {
      /* ignore */
    }
    setNow(Date.now());
    setStartedAt(res.startedAt);
  };

  if (!startedAt) {
    return (
      <div className="rounded-2xl border border-line bg-white p-5 md:p-7">
        <p className="label !text-[10.5px]">Before you begin</p>
        <ul className="mt-4 grid gap-3 text-[14px] sm:grid-cols-3">
          {[
            ["clock", `${durationMin} minutes`, "The timer starts when you press start and keeps running if you leave."],
            ["file", `${questions.length} questions`, "Move freely between questions before you submit."],
            ["refresh", `${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left`, "Your best score counts."],
          ].map(([icon, t, d]) => (
            <li key={t} className="rounded-xl bg-mist/70 p-4">
              <Icon name={icon as "clock"} size={16} className="text-blue" />
              <p className="mt-2 font-semibold">{t}</p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{d}</p>
            </li>
          ))}
        </ul>
        {startError && <div className="mt-4"><FormMessage state={{ ok: false, error: startError }} /></div>}
        <Button type="button" size="lg" icon="arrow" onClick={begin} disabled={starting} className="mt-6 w-full sm:w-auto">
          {starting ? "Preparing…" : resumeStartedAt ? "Resume attempt" : "Start assessment"}
        </Button>
      </div>
    );
  }

  const q = questions[idx];
  const answeredCount = questions.filter((x) => isAnswered(answers[x.id])).length;
  const set = (id: string, v: number[] | string) => setAnswers((a) => ({ ...a, [id]: v }));
  const low = remaining <= 60;

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={(e) => {
        if (!autoSubmitted.current && answeredCount < questions.length && !window.confirm(`You have ${questions.length - answeredCount} unanswered question(s). Submit anyway?`)) e.preventDefault();
      }}
      className="grid gap-5 lg:grid-cols-[1fr_260px]"
    >
      <input type="hidden" name="assessmentId" value={assessmentId} />
      <input type="hidden" name="answers" value={JSON.stringify(answers)} />

      {/* Sticky timer bar on phones */}
      <div className="sticky top-16 z-10 flex items-center justify-between rounded-xl border border-line bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <span className="text-[13px] text-muted">{answeredCount}/{questions.length} answered</span>
        <span className={cn("font-mono text-[15px] font-semibold tabular-nums", low && "text-orange-700")} role="timer" aria-label="Time remaining">
          {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
        </span>
      </div>

      <fieldset className="min-w-0 rounded-2xl border border-line bg-white p-5 md:p-7" aria-labelledby={`q-${q.id}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="label !text-[10.5px]">Question {idx + 1} of {questions.length} · {TYPE_LABEL[q.type]}</p>
          <span className="font-mono text-[11px] text-muted">{q.points} pt{q.points === 1 ? "" : "s"}</span>
        </div>
        {q.scenario && (
          <div className="mt-4 rounded-xl bg-ink p-4 text-white">
            <p className="label !text-[10px] !text-white/50">Fictional encounter note</p>
            <p className="mt-2 font-mono text-[13px] leading-relaxed text-white/85">{q.scenario}</p>
          </div>
        )}
        <legend className="sr-only">Question {idx + 1}</legend>
        <p id={`q-${q.id}`} className="mt-4 text-[18px] font-semibold leading-snug tracking-tight">{q.prompt}</p>

        {q.type === "short" ? (
          <div className="mt-5">
            <label htmlFor={`a-${q.id}`} className="mb-1.5 block text-[13px] font-medium">Your answer</label>
            <input
              id={`a-${q.id}`}
              className="field"
              maxLength={200}
              autoComplete="off"
              value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
              onChange={(e) => set(q.id, e.target.value)}
            />
          </div>
        ) : (
          <ul className="mt-5 grid gap-2">
            {q.options.map((o, i) => {
              const cur = Array.isArray(answers[q.id]) ? (answers[q.id] as number[]) : [];
              const checked = cur.includes(i);
              const multi = q.type === "multiple";
              return (
                <li key={i}>
                  <label className={cn("flex min-h-[48px] cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-[14.5px] transition-colors", checked ? "border-blue bg-soft" : "border-line hover:border-ink/30")}>
                    <input
                      type={multi ? "checkbox" : "radio"}
                      name={`opt-${q.id}`}
                      checked={checked}
                      onChange={() => set(q.id, multi ? (checked ? cur.filter((x) => x !== i) : [...cur, i]) : [i])}
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-blue)]"
                    />
                    <span className={cn(q.type === "coding_case" && "font-mono text-[13.5px]")}>{o}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-7 flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>Previous</Button>
          {idx < questions.length - 1 ? (
            <Button key="next" type="button" variant="outline" icon="arrow" onClick={() => setIdx((i) => Math.min(questions.length - 1, i + 1))}>Next question</Button>
          ) : (
            <Button key="submit" type="submit" icon="check" disabled={pending}>{pending ? "Submitting…" : "Submit answers"}</Button>
          )}
        </div>
        <div className="mt-4"><FormMessage state={state} /></div>
      </fieldset>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Attempt overview">
        <div className="hidden rounded-2xl border border-line bg-white p-5 lg:block">
          <p className="label !text-[10px]">Time remaining</p>
          <p className={cn("mt-2 font-mono text-[34px] font-semibold tabular-nums leading-none", low && "text-orange-700")} role="timer">
            {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-mist">
            <div className={cn("h-full rounded-full", low ? "bg-orange-500" : "bg-cyan")} style={{ width: `${(remaining / (durationMin * 60)) * 100}%` }} />
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="label !text-[10px]">{title}</p>
          <p className="mt-2 text-[13px] text-muted">{answeredCount} of {questions.length} answered</p>
          <ol className="mt-3 grid grid-cols-6 gap-1.5" aria-label="Jump to question">
            {questions.map((x, i) => (
              <li key={x.id}>
                <button
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-current={i === idx ? "step" : undefined}
                  aria-label={`Question ${i + 1}${isAnswered(answers[x.id]) ? ", answered" : ""}`}
                  className={cn(
                    "flex h-10 w-full items-center justify-center rounded-lg border font-mono text-[12px] transition-colors",
                    i === idx ? "border-ink bg-ink text-white" : isAnswered(answers[x.id]) ? "border-cyan/50 bg-cyan/15 text-ink" : "border-line hover:border-ink/30",
                  )}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ol>
          <Button type="submit" variant="primary" size="sm" disabled={pending} className="mt-4 w-full">{pending ? "Submitting…" : "Submit now"}</Button>
        </div>
      </aside>
    </form>
  );
}
