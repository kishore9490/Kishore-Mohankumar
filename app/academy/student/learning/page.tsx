import Link from "next/link";
import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/session";
import { programProgress } from "@/server/repositories/learning";
import { myCourses } from "@/server/repositories/student";
import { formatDate, relative } from "@/lib/platform/format";
import { EmptyState, PageHeader, Pill, ProgressBar, Ring, StatusPill, humanize } from "@/components/academy/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LESSON_ICON } from "@/components/academy/student/Curriculum";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "My learning · EMC Academy" };

export default async function MyLearning() {
  const user = await requirePermission("learning.access");
  const prog = programProgress(user.id);
  const courses = myCourses(user.id);

  if (!prog) {
    return (
      <>
        <PageHeader label="My learning" title="Your courses" />
        <EmptyState icon="book" title="You’re not enrolled in a program yet" text="Once admissions assigns you to a batch, your courses and lessons will appear here." action={<ButtonLink href="/academy/student/messages" variant="outline">Contact the academy</ButtonLink>} />
      </>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        label="My learning"
        title={prog.program.name}
        intro={<>{prog.batch.name} · {prog.batch.schedule} · ends {formatDate(prog.batch.endDate)}</>}
      />

      <section aria-label="Program progress" className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-5 bg-white p-5 md:p-6">
          <Ring value={prog.percent} size={96} label="Program completion" />
          <div>
            <p className="label !text-[10px]">Program</p>
            <p className="mt-1.5 text-[22px] font-semibold tabular-nums tracking-tight">{prog.done}<span className="text-[15px] font-normal text-muted"> / {prog.total} lessons</span></p>
          </div>
        </div>
        <ol className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
          {courses.map((c) => (
            <li key={c.course.id} className="bg-white">
              <Link href={`#${c.course.id}`} className="block h-full p-4 transition-colors hover:bg-mist/60 md:p-5">
                <p className="font-mono text-[10.5px] text-muted">{c.course.code}</p>
                <p className="mt-1 line-clamp-2 text-[13.5px] font-medium leading-snug">{c.course.title}</p>
                <ProgressBar value={c.progress.percent} className="mt-3" label={`${c.course.title} progress`} tone={c.state === "completed" ? "ink" : "cyan"} />
                <p className="mt-1.5 font-mono text-[11px] tabular-nums text-muted">{c.progress.percent}%</p>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {courses.length === 0 ? (
        <EmptyState icon="book" title="No published courses yet" text="Your faculty is preparing the courses for this program. They’ll appear here when published." />
      ) : (
        <ol className="space-y-4">
          {courses.map((c, i) => (
            <li key={c.course.id} id={c.course.id} className="scroll-mt-24">
              <article className="overflow-hidden rounded-2xl border border-line bg-white">
                <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:p-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] text-muted">Course {String(i + 1).padStart(2, "0")} · {c.course.code}</span>
                      <StatusPill status={c.state} />
                    </div>
                    <h2 className="mt-2 text-[21px] font-semibold leading-snug tracking-tight">{c.course.title}</h2>
                    <p className="mt-1 text-[14px] text-muted">{c.course.description}</p>
                    <p className="mt-2 text-[12.5px] text-muted">{c.faculty.join(", ")} · {c.outline.length} modules · {Math.round(c.minutes / 60 * 10) / 10} h</p>
                  </div>
                  <div className="flex items-center gap-4 md:flex-col md:items-end">
                    <Ring value={c.progress.percent} size={72} stroke={6} label={`${c.course.title} completion`}>
                      <span className="text-[15px] font-semibold tabular-nums">{c.progress.percent}%</span>
                    </Ring>
                  </div>
                </div>

                <dl className="grid grid-cols-2 gap-px border-y border-line bg-line lg:grid-cols-4">
                  {[
                    ["Completion", `${c.progress.done} of ${c.progress.total} lessons`],
                    ["Current module", c.state === "completed" ? "All modules done" : c.currentModule?.title ?? "—"],
                    ["Next lesson", c.state === "completed" ? "—" : c.next?.title ?? "—"],
                    ["Last activity", c.progress.lastActivity ? relative(c.progress.lastActivity) : "Not started"],
                  ].map(([k, v]) => (
                    <div key={k} className="min-w-0 bg-white px-5 py-3.5">
                      <dt className="label !text-[9.5px]">{k}</dt>
                      <dd className="mt-1 truncate text-[13.5px] font-medium" title={v}>{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between md:px-6">
                  <details className="group/o min-w-0 flex-1">
                    <summary className="inline-flex min-h-[40px] cursor-pointer list-none items-center gap-2 text-[13.5px] font-medium text-blue hover:text-ink [&::-webkit-details-marker]:hidden">
                      <Icon name="chevron" size={14} className="transition-transform group-open/o:rotate-90" /> Module outline
                    </summary>
                    <ol className="mt-3 grid gap-3 lg:grid-cols-2">
                      {c.outline.map((o) => (
                        <li key={o.module.id} className="rounded-xl border border-line p-4">
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="text-[14px] font-semibold"><span className="mr-2 font-mono text-[11px] text-muted">{String(o.module.order).padStart(2, "0")}</span>{o.module.title}</p>
                            <span className="shrink-0 font-mono text-[11px] text-muted">{o.done}/{o.lessons.length}</span>
                          </div>
                          <ul className="mt-2.5 space-y-0.5">
                            {o.lessons.map(({ lesson: l, status }) => (
                              <li key={l.id}>
                                <Link href={`/academy/student/learn/${c.course.id}/${l.id}`} className="flex min-h-[36px] items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] hover:bg-mist">
                                  <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", status === "completed" ? "border-cyan bg-cyan text-ink" : status === "in_progress" ? "border-blue" : "border-line")} aria-hidden="true">
                                    {status === "completed" && <Icon name="check" size={10} />}
                                    {status === "in_progress" && <span className="h-1.5 w-1.5 rounded-full bg-blue" />}
                                  </span>
                                  <span className="min-w-0 flex-1 truncate">{l.title}</span>
                                  <span className="flex shrink-0 items-center gap-1 font-mono text-[10.5px] text-muted"><Icon name={LESSON_ICON[l.type]} size={10} />{l.durationMin}m</span>
                                  <span className="sr-only">{humanize(status)}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ol>
                  </details>
                  {c.next ? (
                    <ButtonLink href={`/academy/student/learn/${c.course.id}/${c.next.id}`} size="sm" className="shrink-0 self-start sm:self-auto" variant={c.state === "in_progress" ? "primary" : "outline"}>
                      {c.state === "in_progress" ? "Continue" : "Start course"}
                    </ButtonLink>
                  ) : (
                    <span className="self-start sm:self-auto"><Pill tone="success" dot>Course complete</Pill></span>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
