import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/server/auth/session";
import { db } from "@/server/db/store";
import { courseById } from "@/server/repositories/learning";
import { facultyNotes, mySessions, studentSnapshot } from "@/server/repositories/faculty";
import { formatDateTime, formatShortDate, formatWeekday, relative } from "@/lib/platform/format";
import { HBars } from "@/components/academy/charts";
import { Avatar, EmptyState, PageHeader, Panel, Pill, Ring, StatusPill, humanize } from "@/components/academy/ui";
import { NoteForm } from "@/components/academy/faculty/NoteForm";
import { cn } from "@/lib/cn";

export default async function StudentInsight({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("students.view");
  const { id } = await params;
  const s = studentSnapshot(user.id, id);
  if (!s) notFound();
  const notes = facultyNotes(user.id, id);
  const sessions = new Map(mySessions(user.id).map((x) => [x.id, x]));
  const recentAttendance = s.attendance.rows
    .map((r) => ({ r, session: sessions.get(r.sessionId)! }))
    .filter((x) => x.session)
    .sort((a, b) => b.session.startsAt.localeCompare(a.session.startsAt))
    .slice(0, 10);
  const assessments = s.best
    .map((a) => ({ attempt: a, assessment: db().assessments.find((x) => x.id === a.assessmentId)! }))
    .sort((a, b) => b.attempt.submittedAt.localeCompare(a.attempt.submittedAt));

  return (
    <>
      <PageHeader
        back={{ href: "/academy/faculty/students", label: "All students" }}
        label={s.batch.name}
        title={
          <span className="flex items-center gap-4">
            <Avatar name={s.student.name} size={52} tone="ink" />
            <span className="min-w-0">{s.student.name}</span>
          </span>
        }
        intro={<>{s.student.title ?? "Student"} · <a href={`mailto:${s.student.email}`} className="text-blue hover:underline">{s.student.email}</a></>}
        actions={s.student.status !== "active" ? <StatusPill status={s.student.status} /> : undefined}
      />

      {/* Overview */}
      <section aria-label="Overview" className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 bg-white p-5">
          <Ring value={s.progress?.percent ?? 0} size={64} stroke={6} label="Program progress" />
          <div>
            <p className="label !text-[10px]">Progress</p>
            <p className="mt-1 text-[13px] text-muted">{s.progress ? `${s.progress.done} of ${s.progress.total} lessons` : "Not enrolled"}</p>
          </div>
        </div>
        {[
          { k: "Attendance", v: s.attendance.rate !== null ? `${s.attendance.rate}%` : "—", h: `${s.attendance.total} classes marked`, bad: s.attendance.rate !== null && s.attendance.rate < 75 },
          { k: "Avg. score", v: s.avgScore !== null ? `${s.avgScore}%` : "—", h: `${s.best.length} assessments attempted`, bad: s.avgScore !== null && s.avgScore < 60 },
          { k: "Last activity", v: s.lastActivity ? relative(s.lastActivity) : "None", h: s.lastActivity ? formatDateTime(s.lastActivity) : "No lessons or submissions yet", bad: (s.inactiveDays ?? 99) > 5 },
        ].map((m) => (
          <div key={m.k} className="bg-white p-5">
            <p className="label !text-[10px]">{m.k}</p>
            <p className={cn("mt-3 text-[28px] font-semibold leading-none tracking-tight tabular-nums", m.bad && "text-orange-800")}>{m.v}</p>
            <p className="mt-2 text-[12.5px] text-muted">{m.h}</p>
          </div>
        ))}
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Panel title="Areas needing attention">
            {s.flags.length === 0 ? (
              <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-[14px] text-emerald-900">On track — no attendance, score, activity or deadline concerns.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {s.flags.map((f) => (
                  <li key={f.key} className="rounded-xl border border-orange-200 bg-orange-50/60 p-4">
                    <p className="text-[14.5px] font-semibold text-orange-900">{f.label}</p>
                    <p className="mt-1 text-[13px] text-muted">
                      {f.key === "attendance" && "Below the 75% attendance expectation."}
                      {f.key === "score" && "Average assessment score is below the 60% pass mark."}
                      {f.key === "inactive" && "No lessons, attempts or submissions in over 5 days."}
                      {f.key === "overdue" && s.overdue.map((o) => o.assignment.title).join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Assessment performance" label="Best attempt">
            {assessments.length === 0 ? (
              <EmptyState icon="file" title="No attempts yet" text="Scores appear here after the student completes an assessment." />
            ) : (
              <HBars max={100} format={(v) => `${v}%`} data={assessments.map(({ attempt, assessment }) => ({ label: assessment.title, value: Math.round((attempt.score / attempt.maxScore) * 100), note: `${attempt.score}/${attempt.maxScore}` }))} />
            )}
          </Panel>

          <Panel title="Assignments" pad={false}>
            {s.assignments.length === 0 ? (
              <div className="p-5 md:p-6"><EmptyState icon="clipboard" title="No assignments" text="Assignments for this student’s program will appear here." /></div>
            ) : (
              <ul className="mt-4 divide-y divide-line border-t border-line">
                {s.assignments.map(({ assignment: a, submission: sub }) => {
                  const mine = courseById(a.courseId)?.facultyIds.includes(user.id);
                  const body = (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-medium">{a.title}</p>
                        <p className="text-[12.5px] text-muted">{courseById(a.courseId)?.code} · due {formatShortDate(a.dueAt)}{sub?.score != null && ` · ${sub.score}/${a.maxScore}`}</p>
                      </div>
                      <StatusPill status={sub?.status ?? "not_started"} />
                    </>
                  );
                  return (
                    <li key={a.id}>
                      {mine && sub && sub.status !== "not_started" && sub.status !== "in_progress" ? (
                        <Link href={`/academy/faculty/reviews/${sub.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-mist md:px-6">{body}</Link>
                      ) : (
                        <div className="flex items-center gap-3 px-5 py-3 md:px-6">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Private notes" action={<Pill tone="info">Only you</Pill>}>
            <NoteForm studentId={s.student.id} />
            {notes.length > 0 && (
              <ul className="mt-5 space-y-3 border-t border-line pt-5">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-xl bg-mist px-4 py-3">
                    <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{n.text}</p>
                    <p className="mt-1.5 font-mono text-[10.5px] text-muted">{formatDateTime(n.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent attendance" label="Your classes" pad={false}>
            {recentAttendance.length === 0 ? (
              <p className="px-5 pb-5 text-[14px] text-muted md:px-6">No attendance marked yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line border-t border-line">
                {recentAttendance.map(({ r, session }) => (
                  <li key={r.sessionId} className="flex items-center justify-between gap-3 px-5 py-2.5 md:px-6">
                    <span className="min-w-0">
                      <span className="block truncate text-[14px]">{session.title}</span>
                      <span className="block font-mono text-[11px] text-muted">{formatWeekday(session.startsAt)}</span>
                    </span>
                    <StatusPill status={r.status} label={humanize(r.status)} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
