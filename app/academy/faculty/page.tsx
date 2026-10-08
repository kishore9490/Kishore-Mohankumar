import Link from "next/link";
import { requirePermission } from "@/server/auth/session";
import { batchById, courseById, notificationsFor, userName } from "@/server/repositories/learning";
import {
  attendanceTrend, facultyAnnouncements, facultyScope, myAssessments, myContent, mySessions, needsReview, reviewQueue, sessionAttendance, studentsNeedingAttention, myStudents, todaysSessions,
} from "@/server/repositories/faculty";
import { formatShortDate, formatTime, formatWeekday, greeting, relative } from "@/lib/platform/format";
import { BarChart, HBars } from "@/components/academy/charts";
import { Avatar, EmptyState, Metrics, Notice, Panel, Pill, StatusPill, TextLink, humanize } from "@/components/academy/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default async function FacultyHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  // The command center has no nav permission; gate it on the faculty-level permission to view students.
  const user = await requirePermission("students.view");
  const { denied } = await searchParams;
  const scope = facultyScope(user.id);
  const today = todaysSessions(user.id);
  const queue = reviewQueue(user.id);
  const waiting = queue.filter((q) => needsReview(q.submission));
  const students = myStudents(user.id);
  const attention = studentsNeedingAttention(user.id);
  const trend = attendanceTrend(user.id, 14);
  const assessments = myAssessments(user.id);
  const upcoming = assessments.filter((a) => a.window !== "closed").slice(0, 4);
  const scored = students.filter((s) => s.avgScore !== null);
  const avgScore = scored.length ? Math.round(scored.reduce((s, x) => s + (x.avgScore ?? 0), 0) / scored.length) : null;
  const tasks = myContent(user.id).filter((c) => c.ownerId === user.id && (c.status === "draft" || c.status === "review"));
  const news = facultyAnnouncements(user.id).slice(0, 3);
  const notices = notificationsFor(user.id).slice(0, 4);
  const now = Date.now();
  const nextClass = today.find((s) => new Date(s.startsAt).getTime() + s.durationMin * 60000 > now || !sessionAttendance(s.id).marked) ?? mySessions(user.id).find((s) => new Date(s.startsAt).getTime() > now);
  const scoreBuckets = [
    { label: "80% and above", value: scored.filter((s) => (s.avgScore ?? 0) >= 80).length },
    { label: "60–79%", value: scored.filter((s) => (s.avgScore ?? 0) >= 60 && (s.avgScore ?? 0) < 80).length },
    { label: "Below 60%", value: scored.filter((s) => (s.avgScore ?? 0) < 60).length },
  ];

  return (
    <div className="space-y-5">
      {denied && <Notice tone="warning">That area isn’t part of your account, so we brought you back to your command center.</Notice>}

      {/* Focal hero */}
      <section aria-labelledby="hello" className="relative overflow-hidden rounded-[22px] bg-ink text-white">
        <div className="grid-bg-dark absolute inset-0" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(18,181,212,.25),transparent_62%)]" aria-hidden="true" />
        <div className="relative grid gap-8 p-6 md:p-9 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="label !text-white/55">{greeting()}, {user.firstName}</p>
            <h1 id="hello" className="heading mt-4 text-[34px] md:text-[48px]">Your teaching day.</h1>
            <p className="mt-4 text-[16px] text-white/75">
              Today: <span className="font-semibold text-white">{today.length} class{today.length === 1 ? "" : "es"}</span>,{" "}
              <Link href="/academy/faculty/reviews" className="font-semibold text-cyan underline-offset-4 hover:underline">{waiting.length} review{waiting.length === 1 ? "" : "s"} waiting</Link>
              {attention.length > 0 && <>, {attention.length} student{attention.length === 1 ? "" : "s"} to check on</>}.
            </p>
            <dl className="mt-7 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
              {[
                ["Batches", String(scope.batches.length)],
                ["Students", String(scope.studentIds.length)],
                ["Attendance", trend.overall !== null ? `${trend.overall}%` : "—"],
              ].map(([k, v]) => (
                <div key={k} className="bg-ink/80 px-3 py-3">
                  <dt className="label !text-[9.5px] !text-white/50">{k}</dt>
                  <dd className="mt-1 text-[20px] font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {nextClass ? (
            <div className="rounded-2xl border border-white/10 bg-white p-5 text-ink shadow-[0_30px_80px_-30px_rgba(0,0,0,.6)] md:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="label !text-cyan-ink">{today.includes(nextClass) ? (new Date(nextClass.startsAt).getTime() < now ? "Today’s class" : "Next class today") : "Next class"}</p>
                <Pill tone="accent">{nextClass.mode === "online" ? "Online" : "Classroom"}</Pill>
              </div>
              <p className="mt-4 text-[13px] text-muted">{courseById(nextClass.courseId)?.code} · {batchById(nextClass.batchId)?.name}</p>
              <p className="mt-1 text-[21px] font-semibold leading-snug tracking-tight">{nextClass.title}</p>
              <p className="mt-3 flex items-center gap-1.5 text-[13.5px] text-muted">
                <Icon name="clock" size={14} /> {formatWeekday(nextClass.startsAt)} · {formatTime(nextClass.startsAt)} · {nextClass.durationMin} min
                {nextClass.facultyId !== user.id && <> · with {userName(nextClass.facultyId)}</>}
              </p>
              {today.includes(nextClass) ? (
                <ButtonLink href={`/academy/faculty/attendance?session=${nextClass.id}`} size="lg" className="mt-5 w-full">Take attendance</ButtonLink>
              ) : (
                <ButtonLink href="/academy/faculty/content" size="lg" variant="outline" className="mt-5 w-full">Prepare content</ButtonLink>
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-6 text-ink">
              <p className="text-[17px] font-semibold">No classes scheduled.</p>
              <p className="mt-1 text-[14px] text-muted">New sessions for your batches will appear here.</p>
            </div>
          )}
        </div>
      </section>

      {/* Today + reviews */}
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <Panel title="Today’s classes" label={formatWeekday(new Date().toISOString())} action={<TextLink href="/academy/faculty/attendance">Attendance</TextLink>}>
          {today.length === 0 ? (
            <p className="rounded-xl bg-mist px-4 py-5 text-[14px] text-muted">No classes in your batches today — a good time to clear reviews or prepare next week’s content.</p>
          ) : (
            <ul className="space-y-2">
              {today.map((s) => {
                const start = new Date(s.startsAt).getTime();
                const live = now >= start && now <= start + s.durationMin * 60000;
                const att = sessionAttendance(s.id);
                return (
                  <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-line p-4">
                    <div className="w-16 shrink-0">
                      <p className="font-mono text-[13px] font-medium">{formatTime(s.startsAt)}</p>
                      <p className="font-mono text-[10.5px] text-muted">{s.durationMin} min</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium">{s.title}</p>
                      <p className="truncate text-[12.5px] text-muted">
                        {courseById(s.courseId)?.code} · {batchById(s.batchId)?.name}
                        {s.facultyId !== user.id && ` · ${userName(s.facultyId)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {live ? <Pill tone="accent" dot>Live now</Pill> : att.marked ? <Pill tone="success">{att.percent}% present</Pill> : <Pill>{relative(s.startsAt)}</Pill>}
                      <ButtonLink href={`/academy/faculty/attendance?session=${s.id}`} size="sm" variant={att.marked ? "outline" : "primary"} icon={null}>
                        {att.marked ? "Edit attendance" : "Take attendance"}
                      </ButtonLink>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Reviews waiting" label={`${waiting.length} in queue`} action={<TextLink href="/academy/faculty/reviews">Review queue</TextLink>}>
          {waiting.length === 0 ? (
            <EmptyState icon="check" title="Queue is clear" text="New submissions for assignments in your courses will appear here." />
          ) : (
            <ul className="divide-y divide-line">
              {waiting.slice(0, 5).map(({ submission: s, assignment, studentName }) => (
                <li key={s.id}>
                  <Link href={`/academy/faculty/reviews/${s.id}`} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-mist">
                    <Avatar name={studentName} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-medium">{studentName}</p>
                      <p className="truncate text-[12.5px] text-muted">{assignment.title}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusPill status={s.status} />
                      {s.submittedAt && <span className="font-mono text-[10.5px] text-muted">{relative(s.submittedAt)}</span>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {waiting.length > 5 && <p className="mt-3 text-[13px] text-muted">+ {waiting.length - 5} more in the queue</p>}
        </Panel>
      </div>

      <Metrics
        items={[
          { label: "My students", value: students.length, hint: `${scope.batches.length} batches`, href: "/academy/faculty/students" },
          { label: "Attendance · 14 days", value: trend.overall !== null ? `${trend.overall}%` : "—", hint: `${trend.sessions} class days marked`, href: "/academy/faculty/attendance" },
          { label: "Average score", value: avgScore !== null ? `${avgScore}%` : "—", hint: "Best attempt per assessment" },
          { label: "Need attention", value: attention.length, hint: "Attendance, scores, activity", href: "/academy/faculty/students?filter=attention" },
        ]}
      />

      {/* Attendance + performance */}
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Attendance snapshot" label="My batches · last 2 weeks">
          {trend.points.length === 0 ? (
            <p className="rounded-xl bg-mist px-4 py-5 text-[14px] text-muted">No attendance has been marked in the last two weeks.</p>
          ) : (
            <BarChart
              label="Daily attendance, last two weeks"
              data={trend.points.map((p) => ({ label: new Date(new Date(p.iso).getTime() + 330 * 60000).toISOString().slice(5, 10).split("-").reverse().map(Number).join("/"), value: p.percent }))}
              format={(v) => `${v}%`}
            />
          )}
        </Panel>
        <Panel title="Student performance" label="Average assessment score">
          {scored.length === 0 ? (
            <p className="rounded-xl bg-mist px-4 py-5 text-[14px] text-muted">No assessment attempts yet.</p>
          ) : (
            <>
              <HBars data={scoreBuckets} format={(v) => `${v} student${v === 1 ? "" : "s"}`} max={scored.length} />
              <p className="mt-5 text-[13px] text-muted">{scored.length} of {students.length} students have attempted an assessment.</p>
            </>
          )}
        </Panel>
      </div>

      {/* Attention + assessments */}
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Students needing attention" action={<TextLink href="/academy/faculty/students?filter=attention">All students</TextLink>}>
          {attention.length === 0 ? (
            <EmptyState icon="users" title="Everyone is on track" text="Students with low attendance, low scores, inactivity or overdue work will be listed here." />
          ) : (
            <ul className="divide-y divide-line">
              {attention.slice(0, 6).map((s) => (
                <li key={s.student.id}>
                  <Link href={`/academy/faculty/students/${s.student.id}`} className="-mx-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg px-2 py-3 transition-colors hover:bg-mist">
                    <Avatar name={s.student.name} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-medium">{s.student.name}</p>
                      <p className="truncate text-[12.5px] text-muted">{s.batch.name}</p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {s.flags.map((f) => <Pill key={f.key} tone={f.key === "attendance" || f.key === "score" ? "danger" : "warning"}>{f.label}</Pill>)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {attention.length > 6 && <p className="mt-3 text-[13px] text-muted">+ {attention.length - 6} more</p>}
        </Panel>

        <Panel title="Upcoming assessments" action={<TextLink href="/academy/faculty/assessments">Builder</TextLink>}>
          {upcoming.length === 0 ? (
            <EmptyState icon="file" title="Nothing scheduled" text="Assessments you build for your courses will appear here." action={<ButtonLink href="/academy/faculty/assessments/new" size="sm">New assessment</ButtonLink>} />
          ) : (
            <ul className="space-y-2">
              {upcoming.map(({ assessment: a, window, attempts, avg }) => (
                <li key={a.id}>
                  <Link href={`/academy/faculty/assessments/${a.id}`} className="flex items-center gap-4 rounded-xl border border-line p-4 transition-colors hover:border-ink/30">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium">{a.title}</p>
                      <p className="mt-0.5 text-[12.5px] text-muted">
                        {humanize(a.kind)} · {window === "open" ? `closes ${relative(a.closesAt)}` : `opens ${formatShortDate(a.opensAt)}`} · {attempts} attempts{avg !== null ? ` · avg ${avg}%` : ""}
                      </p>
                    </div>
                    {a.status !== "published" ? <StatusPill status={a.status} /> : <StatusPill status={window} />}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Prepare */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="My content tasks" label="Draft & in review" action={<TextLink href="/academy/faculty/content">Studio</TextLink>}>
          {tasks.length === 0 ? (
            <p className="text-[14px] text-muted">No drafts waiting on you. Create lessons, quizzes and lab cases in the Content studio.</p>
          ) : (
            <ul className="divide-y divide-line">
              {tasks.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium">{c.title}</p>
                    <p className="truncate text-[12px] text-muted">{humanize(c.kind)} · {courseById(c.courseId ?? "")?.code}</p>
                  </div>
                  <StatusPill status={c.status} label={c.status === "review" ? "In review" : undefined} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Announcements" action={<TextLink href="/academy/faculty/announcements">Post</TextLink>}>
          {news.length === 0 ? (
            <p className="text-[14px] text-muted">No announcements yet.</p>
          ) : (
            <ul className="space-y-4">
              {news.map((n) => (
                <li key={n.id}>
                  <p className="text-[14.5px] font-medium">{n.title}</p>
                  <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-muted">{n.body}</p>
                  <p className="mt-1.5 font-mono text-[11px] text-muted">{userName(n.createdBy)} · {relative(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Messages & notices" action={<TextLink href="/academy/notifications">All</TextLink>}>
          {notices.length === 0 ? (
            <p className="text-[14px] text-muted">You’re all caught up.</p>
          ) : (
            <ul className="space-y-1">
              {notices.map((n) => {
                const body = (
                  <>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.readAt ? "bg-line" : "bg-cyan"}`} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-medium">{n.title}</span>
                      <span className="block truncate text-[12.5px] text-muted">{n.body}</span>
                      <span className="block font-mono text-[10.5px] text-muted">{relative(n.createdAt)}</span>
                    </span>
                  </>
                );
                return (
                  <li key={n.id}>
                    {n.href ? <Link href={n.href} className="-mx-2 flex gap-3 rounded-lg px-2 py-2 hover:bg-mist">{body}</Link> : <div className="flex gap-3 py-2">{body}</div>}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
