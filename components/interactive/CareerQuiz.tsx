"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { quiz, quizResults } from "@/data/quiz";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type Key = keyof typeof quizResults;

export function CareerQuiz() {
  const [answers, setAnswers] = useState<number[]>([]);
  const i = answers.length;
  const done = i >= quiz.length;

  const result = (() => {
    if (!done) return null;
    const t = { beginner: 0, advanced: 0, counselling: 0, fit: 0 };
    answers.forEach((a, qi) => {
      const s = quiz[qi].options[a].score;
      (Object.keys(s) as (keyof typeof t)[]).forEach((k) => (t[k] += s[k] ?? 0));
    });
    let key: Key = t.advanced >= 3 ? "advanced" : t.counselling >= 4 ? "counselling" : "beginner";
    if (key === "beginner" && t.counselling > t.beginner) key = "counselling";
    return { key, fitHigh: t.fit >= 6 };
  })();

  const answer = (a: number) => {
    const next = [...answers, a];
    setAnswers(next);
    if (next.length === quiz.length) track("quiz_completed");
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <span className="label">Self-check · 6 questions · 1 min</span>
        <span className="font-mono text-[11px] text-muted">
          {Math.min(i + 1, quiz.length)}/{quiz.length}
        </span>
      </div>
      <div className="h-[3px] bg-mist">
        <motion.div className="h-full bg-cyan" animate={{ width: `${(i / quiz.length) * 100}%` }} transition={{ duration: 0.4 }} />
      </div>
      <div className="min-h-[380px] p-6 md:p-10" aria-live="polite">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.fieldset
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <legend className="heading text-[26px] md:text-[34px]">{quiz[i].question}</legend>
              <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
                {quiz[i].options.map((o, oi) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => answer(oi)}
                    className="group flex items-center justify-between rounded-xl border border-line px-5 py-4 text-left text-[15.5px] transition-colors hover:border-ink hover:bg-mist"
                  >
                    {o.label}
                    <Icon name="arrow" size={16} className="text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
              {i > 0 && (
                <button type="button" onClick={() => setAnswers(answers.slice(0, -1))} className="label mt-6 hover:text-ink">
                  ← Back
                </button>
              )}
            </motion.fieldset>
          ) : (
            result && (
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <p className="label !text-cyan-ink">Your next step</p>
                <p className="heading mt-4 text-[32px] md:text-[44px]">{quizResults[result.key].title}</p>
                <p className="mt-4 max-w-xl text-[16.5px] leading-relaxed text-muted">{quizResults[result.key].text}</p>
                {result.fitHigh && (
                  <p className="mt-3 max-w-xl text-[15px] text-ink/80">
                    Your interest in detail-oriented, behind-the-scenes healthcare work is a good sign.
                  </p>
                )}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href={quizResults[result.key].href}>{quizResults[result.key].cta}</ButtonLink>
                  <ButtonLink href="/demo" variant="outline">Book a free demo</ButtonLink>
                </div>
                <p className="mt-8 text-[12.5px] text-muted">
                  This self-check is a starting point for reflection, not an assessment of ability or a prediction of outcomes.{" "}
                  <button type="button" onClick={() => setAnswers([])} className="underline underline-offset-2 hover:text-ink">
                    Retake
                  </button>
                </p>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
