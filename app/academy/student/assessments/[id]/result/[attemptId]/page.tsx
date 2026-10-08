import { notFound } from "next/navigation";
import { requirePermission } from "@/server/auth/session";
import { assessmentForStudent, attemptForStudent, gradeQuestion } from "@/server/repositories/student";
import { formatDateTime } from "@/lib/platform/format";
import { Notice, PageHeader, Pill, Ring, humanize } from "@/components/academy/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export default async function AttemptResult({ params }: { params: Promise<{ id: string; attemptId: string }> }) {
  const user = await requirePermission("learning.access");
  const { id, attemptId } = await params;
  const r = assessmentForStudent(user.id, id);
  const t = attemptForStudent(user.id, attemptId);
  if (!r || !t || t.assessmentId !== r.assessment.id) notFound();
  const a = r.assessment;
  const pct = Math.round((t.score / Math.max(1, t.maxScore)) * 100);
  const passed = pct >= a.passMark;
  const recorded = Object.keys(t.answers).length > 0;
  const left = a.maxAttempts - r.attempts.length;
  const mins = Math.max(1, Math.round((new Date(t.submittedAt).getTime() - new Date(t.startedAt).getTime()) / 60000));

  return (
    <div className="space-y-6">
      <PageHeader back={{ href: `/academy/student/assessments/${a.id}`, label: a.title }} label="Result" title={a.title} intro={`Submitted ${formatDateTime(t.submittedAt)} · ${mins} min`} />

      <section aria-label="Score" className="relative overflow-hidden rounded-[22px] bg-ink text-white">
        <div className="grid-bg-dark absolute inset-0" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center md:p-8">
          <div className="w-fit rounded-full bg-white p-1.5 text-ink"><Ring value={pct} size={104} stroke={8} label="Score" /></div>
          <div className="min-w-0 flex-1">
            <Pill tone={passed ? "success" : "warning"} dot>{passed ? "Passed" : "Below pass mark"}</Pill>
            <p className="mt-3 text-[30px] font-semibold tabular-nums tracking-tight">{t.score} <span className="text-[17px] font-normal text-white/55">/ {t.maxScore} points</span></p>
            <p className="mt-1 text-[14px] text-white/60">Pass mark {a.passMark}% · {r.attempts.length} of {a.maxAttempts} attempts used</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {r.open && left > 0 && <ButtonLink href={`/academy/student/assessments/${a.id}`} variant="accent" size="sm">Try again</ButtonLink>}
            <ButtonLink href="/academy/student/assessments" variant="outline-light" size="sm">All assessments</ButtonLink>
          </div>
        </div>
      </section>

      {!recorded ? (
        <Notice>Answers weren’t recorded for this attempt, so a question-by-question review isn’t available. Your score is shown above.</Notice>
      ) : (
        <ol className="space-y-3">
          {a.questions.map((q, i) => {
            const ans = t.answers[q.id];
            const g = gradeQuestion(q, ans);
            const picked = Array.isArray(ans) ? ans : [];
            return (
              <li key={q.id} className="rounded-2xl border border-line bg-white p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="label !text-[10.5px]">Question {i + 1} · {humanize(q.type)}</p>
                  <Pill tone={g.correct ? "success" : g.answered ? "danger" : "neutral"} dot>{g.correct ? `Correct · ${q.points}/${q.points}` : g.answered ? `Incorrect · 0/${q.points}` : "Not answered"}</Pill>
                </div>
                {q.scenario && <p className="mt-3 rounded-xl bg-mist px-4 py-3 font-mono text-[12.5px] leading-relaxed text-ink/80">{q.scenario}</p>}
                <p className="mt-3 text-[16px] font-semibold leading-snug">{q.prompt}</p>
                {q.type === "short" ? (
                  <dl className="mt-3 grid gap-2 text-[14px] sm:grid-cols-2">
                    <div className="rounded-xl border border-line px-4 py-3"><dt className="label !text-[9.5px]">Your answer</dt><dd className="mt-1">{typeof ans === "string" ? ans : "—"}</dd></div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3"><dt className="label !text-[9.5px]">Accepted</dt><dd className="mt-1">{(q.acceptedAnswers ?? []).join(" · ")}</dd></div>
                  </dl>
                ) : (
                  <ul className="mt-3 grid gap-1.5">
                    {q.options.map((o, oi) => {
                      const isCorrect = q.correct.includes(oi);
                      const mine = picked.includes(oi);
                      return (
                        <li key={oi} className={cn("flex items-start gap-3 rounded-xl border px-4 py-2.5 text-[14px]", isCorrect ? "border-emerald-200 bg-emerald-50/60" : mine ? "border-orange-200 bg-orange-50/60" : "border-line")}>
                          <span className="mt-0.5 shrink-0">
                            {isCorrect ? <Icon name="check" size={15} className="text-emerald-700" /> : mine ? <Icon name="close" size={15} className="text-orange-700" /> : <span className="block h-[15px] w-[15px]" />}
                          </span>
                          <span className={cn("min-w-0 flex-1", q.type === "coding_case" && "font-mono text-[13px]")}>{o}</span>
                          {mine && <span className="shrink-0 text-[11.5px] text-muted">Your answer</span>}
                        </li>
                      );
                    })}
                  </ul>
                )}
                <p className="mt-3 flex gap-2 rounded-xl bg-soft px-4 py-3 text-[14px] leading-relaxed">
                  <Icon name="info" size={15} className="mt-0.5 shrink-0 text-blue" /> {q.explanation}
                </p>
              </li>
            );
          })}
        </ol>
      )}
      <p className="text-[12px] text-muted">Explanations are for learning with fictional cases. They are not authoritative coding decisions.</p>
    </div>
  );
}
