import Link from "next/link";
import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/session";
import { studentAssessments } from "@/server/repositories/learning";
import { formatDateTime, relative } from "@/lib/platform/format";
import { EmptyState, Metrics, PageHeader, Pill, StatusPill, humanize } from "@/components/academy/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Assessments · EMC Academy" };

type Row = ReturnType<typeof studentAssessments>[number];

function AssessmentRow({ r }: { r: Row }) {
  const a = r.assessment;
  const best = r.best ? Math.round((r.best.score / r.best.maxScore) * 100) : null;
  const left = a.maxAttempts - r.attempts.length;
  const canStart = r.open && left > 0;
  return (
    <li className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center md:px-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="info">{humanize(a.kind)}</Pill>
          <StatusPill status={r.status} label={r.status === "open" && r.attempts.length ? "Open · attempted" : undefined} />
          <span className="font-mono text-[11px] text-muted">{r.course.code}</span>
        </div>
        <Link href={`/academy/student/assessments/${a.id}`} className="mt-2 block text-[16.5px] font-semibold tracking-tight hover:text-blue">{a.title}</Link>
        <dl className="mt-2.5 grid grid-cols-2 gap-x-6 gap-y-2 text-[13px] sm:flex sm:flex-wrap">
          <div><dt className="label !text-[9.5px]">Duration</dt><dd className="mt-0.5 flex items-center gap-1"><Icon name="clock" size={12} className="text-muted" />{a.durationMin} min</dd></div>
          <div><dt className="label !text-[9.5px]">Attempts</dt><dd className="mt-0.5 tabular-nums">{r.attempts.length} / {a.maxAttempts}</dd></div>
          <div><dt className="label !text-[9.5px]">Best score</dt><dd className="mt-0.5 tabular-nums">{best !== null ? <span className={best >= a.passMark ? "font-medium text-emerald-800" : "font-medium text-orange-900"}>{best}%</span> : "—"}</dd></div>
          <div>
            <dt className="label !text-[9.5px]">{r.status === "upcoming" ? "Opens" : "Deadline"}</dt>
            <dd className="mt-0.5">{formatDateTime(r.status === "upcoming" ? a.opensAt : a.closesAt)}</dd>
          </div>
        </dl>
      </div>
      <div className="flex items-center gap-2 md:justify-end">
        {canStart ? (
          <ButtonLink href={`/academy/student/assessments/${a.id}`} size="sm">{r.attempts.length ? "Try again" : "Start"}</ButtonLink>
        ) : (
          <ButtonLink href={`/academy/student/assessments/${a.id}`} size="sm" variant="outline">{r.attempts.length ? "View results" : "Details"}</ButtonLink>
        )}
        {r.status === "open" && <span className="text-[12px] text-muted">closes {relative(a.closesAt)}</span>}
      </div>
    </li>
  );
}

function Group({ title, rows, empty }: { title: string; rows: Row[]; empty: string }) {
  return (
    <section aria-labelledby={`g-${title}`}>
      <div className="mb-3 flex items-baseline gap-2.5">
        <h2 id={`g-${title}`} className="text-[17px] font-semibold tracking-tight">{title}</h2>
        <span className="font-mono text-[12px] text-muted">{rows.length}</span>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-white/60 px-5 py-6 text-[14px] text-muted">{empty}</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">{rows.map((r) => <AssessmentRow key={r.assessment.id} r={r} />)}</ul>
      )}
    </section>
  );
}

export default async function AssessmentsPage() {
  const user = await requirePermission("learning.access");
  const rows = studentAssessments(user.id);
  const open = rows.filter((r) => r.status === "open");
  const upcoming = rows.filter((r) => r.status === "upcoming");
  const done = rows.filter((r) => r.status !== "open" && r.status !== "upcoming").reverse();
  const scored = rows.filter((r) => r.best);
  const avg = scored.length ? Math.round(scored.reduce((s, r) => s + (r.best!.score / r.best!.maxScore) * 100, 0) / scored.length) : null;

  return (
    <div className="space-y-7">
      <PageHeader label="Work" title="Assessments" intro="Quizzes, module tests and mock exams for your program. Scores are calculated on the server when you submit." />
      {rows.length === 0 ? (
        <EmptyState icon="file" title="No assessments yet" text="Quizzes and tests will appear here when your faculty schedules them." />
      ) : (
        <>
          <Metrics
            items={[
              { label: "Open now", value: open.length },
              { label: "Upcoming", value: upcoming.length },
              { label: "Completed", value: done.filter((r) => r.best).length },
              { label: "Average best", value: avg !== null ? `${avg}%` : "—", hint: "Across completed assessments" },
            ]}
          />
          <Group title="Open now" rows={open} empty="Nothing is open right now. Check upcoming assessments below." />
          <Group title="Upcoming" rows={upcoming} empty="No upcoming assessments scheduled." />
          <Group title="Completed" rows={done} empty="Assessments you finish will appear here with your best score." />
        </>
      )}
    </div>
  );
}
