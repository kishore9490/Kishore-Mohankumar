import Link from "next/link";
import { requirePermission } from "@/server/auth/session";
import {
  announcementsFor, attendanceRate, calendarFor, isSameDay, learningStreak, nextStep, notificationsFor, programProgress,
  studentAssessments, studentAssignments, userName,
} from "@/server/repositories/learning";
import { db } from "@/server/db/store";
import { greeting, formatTime, formatWeekday, relative, formatShortDate } from "@/lib/platform/format";
import { ActivityStrip } from "@/components/academy/charts";
import { EmptyState, Notice, Panel, Pill, ProgressBar, Ring, StatusPill, TextLink, humanize } from "@/components/academy/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default async function StudentHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requirePermission("learning.access");
  const { denied } = await searchParams;
  const next = nextStep(user.id);
  const prog = programProgress(user.id);
  const streak = learningStreak(user.id);
  const events = calendarFor(user.id);
  const today = events.filter((e) => e.kind === "class" && isSameDay(e.startsAt));
  const upcoming = events.filter((e) => new Date(e.startsAt).getTime() > Date.now() && !isSameDay(e.startsAt)).slice(0, 4);
  const assignments = studentAssignments(user.id).filter((a) => !["completed"].includes(a.submission?.status ?? "not_started") && new Date(a.assignment.dueAt).getTime() > Date.now() - 86400000).slice(0, 3);
  const assessments = studentAssessments(user.id).filter((a) => a.status === "open" || a.status === "upcoming").slice(0, 3);
  const scored = studentAssessments(user.id).filter((a) => a.best);
  const avg = scored.length ? Math.round(scored.reduce((s, a) => s + (a.best!.score / a.best!.maxScore) * 100, 0) / scored.length) : null;
  const attendance = attendanceRate(user.id);
  const certs = db().certificates.filter((c) => c.studentId === user.id && c.status === "valid");
  const news = announcementsFor(user).slice(0, 2);
  const unread = notificationsFor(user.id).filter((n) => !n.readAt).length;

  return (
    <div className="space-y-5">
      {denied && <Notice tone="warning">That area isn’t part of your account, so we brought you back home.</Notice>}

      {/* Greeting + next step */}
      <section aria-labelledby="hello" className="relative overflow-hidden rounded-[22px] bg-ink text-white">
        <div className="grid-bg-dark absolute inset-0" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(18,181,212,.25),transparent_62%)]" aria-hidden="true" />
        <div className="relative grid gap-8 p-6 md:p-9 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="label !text-white/55">{greeting()}, {user.firstName}</p>
            <h1 id="hello" className="heading mt-4 text-[34px] md:text-[48px]">Your learning journey.</h1>
            {prog && (
              <div className="mt-7 max-w-md">
                <div className="flex items-baseline justify-between text-[14px]">
                  <span className="text-white/75">{prog.program.name}</span>
                  <span className="font-mono text-[13px] text-cyan">{prog.percent}%</span>
                </div>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={prog.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Program progress">
                  <div className="h-full rounded-full bg-cyan" style={{ width: `${prog.percent}%` }} />
                </div>
                <p className="mt-2.5 text-[12.5px] text-white/50">{prog.done} of {prog.total} lessons complete · {prog.batch.name}</p>
              </div>
            )}
          </div>

          {next ? (
            <div className="rounded-2xl border border-white/10 bg-white p-5 text-ink shadow-[0_30px_80px_-30px_rgba(0,0,0,.6)] md:p-6">
              <div className="flex items-center justify-between">
                <p className="label !text-cyan-ink">Your next step</p>
                <Pill tone="accent">{humanize(next.lesson.type)}</Pill>
              </div>
              <p className="mt-4 text-[13px] text-muted">{next.course.title} · {next.module.title} — Lesson {next.lesson.order}</p>
              <p className="mt-1 text-[21px] font-semibold leading-snug tracking-tight">{next.lesson.title}</p>
              <p className="mt-3 flex items-center gap-1.5 text-[13.5px] text-muted">
                <Icon name="clock" size={14} /> {next.remainingMin} min {next.started ? "remaining" : "estimated"}
              </p>
              <ButtonLink href={next.href} size="lg" className="mt-5 w-full">{next.started ? "Continue learning" : "Start lesson"}</ButtonLink>
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-6 text-ink">
              <p className="text-[17px] font-semibold">You’re all caught up.</p>
              <p className="mt-1 text-[14px] text-muted">New lessons from your faculty will appear here.</p>
            </div>
          )}
        </div>
      </section>

      {/* Today */}
      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <Panel title="Today" label={formatWeekday(new Date().toISOString())} action={<TextLink href="/academy/student/calendar">Calendar</TextLink>}>
          {today.length === 0 ? (
            <p className="rounded-xl bg-mist px-4 py-5 text-[14px] text-muted">No live classes today. A good day to finish your next lesson or try a lab case.</p>
          ) : (
            <ul className="space-y-2">
              {today.map((c) => {
                const live = Date.now() >= new Date(c.startsAt).getTime() && Date.now() <= new Date(c.endsAt!).getTime();
                return (
                  <li key={c.id} className="flex items-center gap-4 rounded-xl border border-line p-4">
                    <div className="w-16 shrink-0">
                      <p className="font-mono text-[13px] font-medium">{formatTime(c.startsAt)}</p>
                      <p className="font-mono text-[10.5px] text-muted">{formatTime(c.endsAt!)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium">{c.title}</p>
                      <p className="truncate text-[12.5px] text-muted">{c.meta}</p>
                    </div>
                    {live ? <Pill tone="accent" dot>Live now</Pill> : <Pill>{relative(c.startsAt)}</Pill>}
                  </li>
                );
              })}
            </ul>
          )}
          {upcoming.length > 0 && (
            <>
              <p className="label mt-6 !text-[10px]">Coming up</p>
              <ul className="mt-2 divide-y divide-line">
                {upcoming.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${e.kind === "class" ? "bg-blue" : e.kind === "assessment" ? "bg-cyan" : "bg-amber-500"}`} aria-hidden="true" />
                      <span className="truncate">{e.title}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[11.5px] text-muted">{formatShortDate(e.startsAt)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>

        <Panel title="Momentum" label="This week">
          <div className="flex items-center gap-5">
            <Ring value={prog?.percent ?? 0} label="Program completion" />
            <div className="min-w-0 flex-1">
              <p className="text-[28px] font-semibold leading-none tracking-tight">{streak.streak} <span className="text-[14px] font-normal text-muted">day streak</span></p>
              <div className="mt-3"><ActivityStrip days={streak.week} label="Learning activity, last 7 days" /></div>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line text-center">
            {[["Avg. score", avg !== null ? `${avg}%` : "—"], ["Attendance", attendance !== null ? `${attendance}%` : "—"], ["Certificates", String(certs.length)]].map(([k, v]) => (
              <div key={k} className="bg-white px-2 py-3">
                <dt className="label !text-[9.5px]">{k}</dt>
                <dd className="mt-1 text-[19px] font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4"><TextLink href="/academy/student/performance">See my performance</TextLink></div>
        </Panel>
      </div>

      {/* Work */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Assignments" action={<TextLink href="/academy/student/assignments">All</TextLink>}>
          {assignments.length === 0 ? (
            <EmptyState icon="clipboard" title="No assignments due" text="Assignments created by your faculty will appear here." />
          ) : (
            <ul className="space-y-2">
              {assignments.map(({ assignment: a, course, submission }) => (
                <li key={a.id}>
                  <Link href="/academy/student/assignments" className="flex items-center gap-4 rounded-xl border border-line p-4 transition-colors hover:border-ink/30">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium">{a.title}</p>
                      <p className="mt-0.5 text-[12.5px] text-muted">{course.title} · due {relative(a.dueAt)}</p>
                    </div>
                    <StatusPill status={submission?.status ?? "not_started"} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Assessments" action={<TextLink href="/academy/student/assessments">All</TextLink>}>
          {assessments.length === 0 ? (
            <EmptyState icon="file" title="Nothing scheduled" text="Quizzes and tests will appear here when your faculty schedules them." />
          ) : (
            <ul className="space-y-2">
              {assessments.map(({ assessment: a, status, attempts }) => (
                <li key={a.id} className="flex items-center gap-4 rounded-xl border border-line p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium">{a.title}</p>
                    <p className="mt-0.5 text-[12.5px] text-muted">
                      {a.durationMin} min · {status === "open" ? `closes ${relative(a.closesAt)}` : `opens ${formatShortDate(a.opensAt)}`} · {attempts.length}/{a.maxAttempts} attempts
                    </p>
                  </div>
                  {status === "open" ? <ButtonLink href={`/academy/student/assessments/${a.id}`} size="sm">Start</ButtonLink> : <StatusPill status={status} />}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Bottom row */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr_0.9fr]">
        <Panel title="Announcements">
          {news.length === 0 ? <p className="text-[14px] text-muted">No announcements.</p> : (
            <ul className="space-y-4">
              {news.map((n) => (
                <li key={n.id}>
                  <p className="text-[14.5px] font-medium">{n.title}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{n.body}</p>
                  <p className="mt-1.5 font-mono text-[11px] text-muted">{userName(n.createdBy)} · {relative(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Certificates" action={<TextLink href="/academy/student/certificates">View</TextLink>}>
          {certs.length === 0 ? (
            <p className="text-[14px] text-muted">Complete a module to earn your first certificate.</p>
          ) : (
            <div className="rounded-xl border border-line bg-mist/60 p-4">
              <Icon name="award" size={22} className="text-blue" />
              <p className="mt-3 text-[15px] font-semibold">{certs.length} certificate{certs.length > 1 ? "s" : ""} earned</p>
              <p className="mt-0.5 font-mono text-[11.5px] text-muted">{certs[0].id}</p>
            </div>
          )}
        </Panel>
        <Panel title="Quick actions">
          <ul className="grid gap-2">
            {[
              { href: "/academy/student/lab", icon: "lab" as const, label: "Practice in the Coding Lab" },
              { href: "/academy/student/assignments", icon: "upload" as const, label: "Submit an assignment" },
              { href: "/academy/student/messages", icon: "message" as const, label: "Message my faculty" },
              { href: "/academy/notifications", icon: "bell" as const, label: `Notifications${unread ? ` (${unread} new)` : ""}` },
            ].map((q) => (
              <li key={q.href}>
                <Link href={q.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors hover:bg-mist">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-soft text-blue"><Icon name={q.icon} size={15} /></span>
                  {q.label}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
