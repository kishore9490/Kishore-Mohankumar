import Link from "next/link";
import { requirePermission } from "@/server/auth/session";
import { db } from "@/server/db/store";
import { batchById, courseById, userName } from "@/server/repositories/learning";
import { facultyScope, isTodayIst, mySessions, sessionAttendance, sessionMarkable, studentAttendance } from "@/server/repositories/faculty";
import { formatDate, formatTime, formatWeekday, formatShortDate } from "@/lib/platform/format";
import { EmptyState, PageHeader, Panel, Pill, ProgressBar } from "@/components/academy/ui";
import { AttendanceSheet, type SheetStudent } from "@/components/academy/faculty/AttendanceSheet";
import { UrlSelect } from "@/components/academy/faculty/UrlSelect";
import { cn } from "@/lib/cn";

export default async function AttendancePage({ searchParams }: { searchParams: Promise<{ batch?: string; course?: string; session?: string }> }) {
  const user = await requirePermission("attendance.manage");
  const sp = await searchParams;
  const { batches } = facultyScope(user.id);
  const all = mySessions(user.id);

  if (!batches.length || !all.length)
    return (
      <>
        <PageHeader label="Classes & attendance" title="Take attendance." />
        <EmptyState icon="calendar" title="No classes yet" text="Once classes are scheduled for your batches, you can mark attendance here." />
      </>
    );

  const requested = sp.session ? all.find((s) => s.id === sp.session) : undefined;
  const batchId = batches.some((b) => b.id === sp.batch) ? sp.batch! : requested?.batchId ?? (all.find((s) => isTodayIst(s.startsAt))?.batchId ?? batches.find((b) => all.some((s) => s.batchId === b.id && sessionMarkable(s)))?.id ?? batches[0].id);
  const batchSessions = all.filter((s) => s.batchId === batchId);
  const courseIds = Array.from(new Set(batchSessions.map((s) => s.courseId)));
  const courseId = sp.course && courseIds.includes(sp.course) ? sp.course : "";
  const filtered = batchSessions.filter((s) => !courseId || s.courseId === courseId);
  const past = filtered.filter(sessionMarkable);
  const session =
    (requested && requested.batchId === batchId && (!courseId || requested.courseId === courseId) ? requested : undefined) ??
    past.find((s) => isTodayIst(s.startsAt)) ??
    past.at(-1) ??
    filtered[0];

  const batch = batchById(batchId)!;
  const markable = session ? sessionMarkable(session) : false;
  const records = session ? db().attendance.filter((a) => a.sessionId === session.id) : [];
  const students: SheetStudent[] = batch.studentIds.map((id) => ({
    id,
    name: userName(id),
    rate: studentAttendance(user.id, id).rate,
    status: records.find((r) => r.studentId === id)?.status ?? null,
  }));
  const summary = session ? sessionAttendance(session.id) : null;
  const lastMark = records.map((r) => r.markedAt).sort().at(-1);
  const history = past.slice().reverse().slice(0, 14);
  const pickable = [...filtered.filter((s) => sessionMarkable(s)).reverse(), ...filtered.filter((s) => !sessionMarkable(s)).slice(0, 5)];

  return (
    <>
      <PageHeader label="Classes & attendance" title="Take attendance." intro="Pick a class, mark each student, and save. Changes are logged with your name and time." />

      <div className="grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-3 md:p-5">
        <UrlSelect id="f-batch" label="Batch" param="batch" value={batchId} reset={["session", "course"]} options={batches.map((b) => ({ value: b.id, label: b.name }))} />
        <UrlSelect id="f-course" label="Course" param="course" value={courseId} reset={["session"]} options={[{ value: "", label: "All courses" }, ...courseIds.map((c) => ({ value: c, label: `${courseById(c)?.code} · ${courseById(c)?.title}` }))]} />
        <UrlSelect
          id="f-session"
          label="Class"
          param="session"
          value={session?.id ?? ""}
          options={pickable.length ? pickable.map((s) => ({ value: s.id, label: `${formatWeekday(s.startsAt)} · ${s.title}${isTodayIst(s.startsAt) ? " (today)" : ""}` })) : [{ value: "", label: "No classes" }]}
        />
      </div>

      {!session ? (
        <div className="mt-5"><EmptyState icon="calendar" title="No classes for this batch" text={`${batch.name} has no scheduled classes${courseId ? " for this course" : ""} yet.`} /></div>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <Panel
            label={`${formatDate(session.startsAt)} · ${formatTime(session.startsAt)}`}
            title={session.title}
            action={isTodayIst(session.startsAt) ? <Pill tone="accent" dot>Today</Pill> : markable ? <Pill>Past class</Pill> : <Pill tone="info">Upcoming</Pill>}
          >
            <p className="-mt-1 mb-5 text-[13.5px] text-muted">
              {courseById(session.courseId)?.code} · {batch.name} · {session.mode === "online" ? "Online" : "Classroom"} · {userName(session.facultyId)}
              {lastMark && <> · last saved {formatShortDate(lastMark)}, {formatTime(lastMark)}</>}
            </p>
            <AttendanceSheet key={session.id} sessionId={session.id} students={students} markable={markable} />
          </Panel>

          <div className="space-y-5">
            <Panel title="This class" label="Summary">
              {summary && summary.marked ? (
                <>
                  <p className="text-[34px] font-semibold leading-none tracking-tight tabular-nums">{summary.percent}%<span className="ml-2 text-[14px] font-normal text-muted">attended</span></p>
                  <ProgressBar value={summary.percent ?? 0} className="mt-4" label="Attendance for this class" />
                  <dl className="mt-5 grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-line bg-line text-center">
                    {(["present", "late", "absent", "excused"] as const).map((k) => (
                      <div key={k} className="bg-white px-1 py-2.5">
                        <dt className="label !text-[9px]">{k}</dt>
                        <dd className="mt-1 text-[17px] font-semibold tabular-nums">{summary.counts[k]}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              ) : (
                <p className="text-[14px] text-muted">Not marked yet. {summary?.expected ?? 0} students expected.</p>
              )}
            </Panel>

            <Panel title="Session history" label={batch.name} pad={false}>
              {history.length === 0 ? (
                <p className="px-5 pb-5 text-[14px] text-muted md:px-6">No past classes yet.</p>
              ) : (
                <ul className="mt-4 divide-y divide-line border-t border-line">
                  {history.map((s) => {
                    const a = sessionAttendance(s.id);
                    const current = s.id === session.id;
                    return (
                      <li key={s.id}>
                        <Link
                          href={`/academy/faculty/attendance?batch=${batchId}${courseId ? `&course=${courseId}` : ""}&session=${s.id}`}
                          aria-current={current ? "true" : undefined}
                          className={cn("flex items-center gap-3 px-5 py-3 transition-colors hover:bg-mist md:px-6", current && "bg-soft/60")}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-medium">{s.title}</p>
                            <p className="font-mono text-[11px] text-muted">{formatWeekday(s.startsAt)} · {courseById(s.courseId)?.code}</p>
                          </div>
                          <div className="w-24 shrink-0 text-right">
                            {a.percent !== null ? (
                              <>
                                <p className={cn("text-[14px] font-semibold tabular-nums", a.percent < 75 && "text-orange-800")}>{a.percent}%</p>
                                <ProgressBar value={a.percent} className="mt-1" tone={a.percent < 75 ? "ink" : "cyan"} label={`${s.title} attendance`} />
                              </>
                            ) : (
                              <Pill tone="warning">Not marked</Pill>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
