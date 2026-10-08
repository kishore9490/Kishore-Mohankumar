import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/server/auth/session";
import { activeAttemptStart, assessmentForStudent, publicQuestions } from "@/server/repositories/student";
import { formatDateTime, relative } from "@/lib/platform/format";
import { Notice, PageHeader, Panel, Pill, StatusPill, humanize } from "@/components/academy/ui";
import { AssessmentRunner } from "@/components/academy/student/AssessmentRunner";
import { Icon } from "@/components/ui/Icon";

export default async function TakeAssessment({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("learning.access");
  const { id } = await params;
  const r = assessmentForStudent(user.id, id);
  if (!r) notFound();
  const a = r.assessment;
  const left = a.maxAttempts - r.attempts.length;
  const canTake = r.open && left > 0;
  const now = Date.now();
  const reason =
    new Date(a.opensAt).getTime() > now ? `This assessment opens ${formatDateTime(a.opensAt)} (${relative(a.opensAt)}).`
    : new Date(a.closesAt).getTime() < now ? "This assessment has closed."
    : left <= 0 ? "You’ve used all your attempts for this assessment." : null;
  const attempts = [...r.attempts].sort((x, y) => y.submittedAt.localeCompare(x.submittedAt));

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ href: "/academy/student/assessments", label: "Assessments" }}
        label={`${r.course.code} · ${humanize(a.kind)}`}
        title={a.title}
        intro={<>{a.questions.length} questions · {a.durationMin} min · pass mark {a.passMark}% · closes {formatDateTime(a.closesAt)}</>}
        actions={<StatusPill status={r.status} />}
      />

      {canTake ? (
        <AssessmentRunner
          assessmentId={a.id}
          title={a.title}
          durationMin={a.durationMin}
          questions={publicQuestions(a)}
          resumeStartedAt={activeAttemptStart(user.id, a)}
          attemptsLeft={left}
        />
      ) : (
        reason && <Notice tone={r.status === "missed" ? "warning" : "info"}>{reason}</Notice>
      )}

      <Panel title="Your attempts" label={`${r.attempts.length} of ${a.maxAttempts} used`}>
        {attempts.length === 0 ? (
          <p className="rounded-xl bg-mist px-4 py-5 text-[14px] text-muted">No attempts yet. Your results and explanations will appear here after you submit.</p>
        ) : (
          <ul className="divide-y divide-line">
            {attempts.map((t, i) => {
              const pct = Math.round((t.score / Math.max(1, t.maxScore)) * 100);
              return (
                <li key={t.id}>
                  <Link href={`/academy/student/assessments/${a.id}/result/${t.id}`} className="flex min-h-[52px] items-center gap-4 py-3 transition-colors hover:text-blue">
                    <span className="font-mono text-[11px] text-muted">#{attempts.length - i}</span>
                    <span className="min-w-0 flex-1 text-[14px]">{formatDateTime(t.submittedAt)}</span>
                    <span className="tabular-nums text-[14px] font-semibold">{t.score}/{t.maxScore}</span>
                    <Pill tone={pct >= a.passMark ? "success" : "warning"}>{pct}%</Pill>
                    <Icon name="chevron" size={14} className="text-muted" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
