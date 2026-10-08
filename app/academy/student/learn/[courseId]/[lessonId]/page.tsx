import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/server/auth/session";
import { lessonContext, lessonNote } from "@/server/repositories/student";
import { completeLesson } from "@/server/actions/student";
import { storageProvider } from "@/integrations/storage";
import { relative } from "@/lib/platform/format";
import { Panel, Pill, ProgressBar, humanize } from "@/components/academy/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LessonBlocks } from "@/components/academy/student/LessonBlocks";
import { Curriculum, LESSON_ICON } from "@/components/academy/student/Curriculum";
import { CurriculumDrawer } from "@/components/academy/student/CurriculumDrawer";
import { LessonNotes } from "@/components/academy/student/LessonNotes";
import { LessonAssistant } from "@/components/academy/student/LessonAssistant";
import { CompleteButton } from "@/components/academy/student/CompleteButton";

async function signed(key: string, download = false) {
  try {
    return await storageProvider().signedUrl(key, { expiresInSec: 60 * 30, download });
  } catch {
    return null;
  }
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default async function LessonPlayer({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const user = await requirePermission("learning.access");
  const { courseId, lessonId } = await params;
  const ctx = lessonContext(user.id, courseId, lessonId);
  if (!ctx) notFound();
  const { course, program, module, lesson, progress, prev, next, outline, quiz } = ctx;
  const done = progress?.status === "completed";
  const note = lessonNote(user.id, lesson.id);
  const videoUrl = lesson.type === "video" && lesson.videoKey ? await signed(lesson.videoKey) : null;
  const resources = await Promise.all(lesson.resources.map(async (r) => ({ ...r, url: await signed(r.storageKey, true) })));
  const complete = completeLesson.bind(null, course.id, lesson.id);
  const doneCount = outline.reduce((s, o) => s + o.lessons.filter((l) => l.status === "completed").length, 0);
  const total = outline.reduce((s, o) => s + o.lessons.length, 0);

  const curriculum = <Curriculum outline={outline} courseId={course.id} currentId={lesson.id} />;

  return (
    <div className="grid gap-5 min-[1180px]:grid-cols-[minmax(0,1fr)_280px] min-[1380px]:grid-cols-[240px_minmax(0,1fr)_280px]">
      {/* LEFT — curriculum (desktop) */}
      <aside className="hidden min-[1380px]:block" aria-label="Curriculum">
        <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-2xl border border-line bg-mist/40 p-2">
          <div className="px-3 pb-3 pt-2">
            <p className="label !text-[10px]">{course.code}</p>
            <p className="mt-1 text-[14.5px] font-semibold leading-snug">{course.title}</p>
            <ProgressBar value={ctx.courseProgress.percent} className="mt-3" label="Course progress" />
            <p className="mt-1.5 font-mono text-[10.5px] text-muted">{doneCount}/{total} lessons</p>
          </div>
          {curriculum}
        </div>
      </aside>

      {/* CENTER — lesson */}
      <article className="min-w-0 space-y-5">
        <div className="min-[1380px]:hidden">
          <CurriculumDrawer summary={`${ctx.position.index}/${ctx.position.total}`}>{curriculum}</CurriculumDrawer>
        </div>

        <nav aria-label="Breadcrumb" className="text-[12.5px] text-muted">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <li><Link href="/academy/student/learning" className="hover:text-ink">{program.name}</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href={`/academy/student/learning#${course.id}`} className="hover:text-ink">{course.title}</Link></li>
            <li aria-hidden="true">›</li>
            <li>{module.title}</li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="font-medium text-ink">{lesson.title}</li>
          </ol>
        </nav>

        <header>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="accent"><Icon name={LESSON_ICON[lesson.type]} size={11} /> {humanize(lesson.type)}</Pill>
            <Pill>{lesson.durationMin} min</Pill>
            <Pill>Lesson {ctx.position.index} of {ctx.position.total}</Pill>
            {done && <Pill tone="success" dot>Completed</Pill>}
          </div>
          <h1 className="heading mt-4 text-[28px] md:text-[36px]">{lesson.title}</h1>
          <p className="mt-2 max-w-2xl text-[15.5px] leading-relaxed text-muted">{lesson.summary}</p>
        </header>

        {lesson.type === "video" && (
          <section aria-label="Video" className="overflow-hidden rounded-2xl bg-ink text-white">
            <div className="relative min-h-[260px] sm:aspect-video sm:min-h-0">
              <div className="grid-bg-dark absolute inset-0" aria-hidden="true" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(18,181,212,.22),transparent_55%)]" aria-hidden="true" />
              <div className="relative flex h-full min-h-[260px] flex-col items-center justify-center px-6 py-8 text-center sm:min-h-0">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20"><Icon name="play" size={26} className="translate-x-0.5" /></span>
                <p className="mt-5 text-[16px] font-semibold">Video streaming connects once storage/CDN is configured</p>
                <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-white/60">
                  This lesson plays through a short-lived signed URL{videoUrl ? " (generated for this session)" : ""}. Until a storage provider is connected, use the lesson notes and resources below.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-[12.5px]">
              <span className="flex items-center gap-2 text-white/60"><Icon name="lock" size={13} /> Signed stream · expires in 30 min</span>
              {progress && progress.positionSec > 0 && !done ? (
                <span className="rounded-full bg-cyan px-3 py-1 font-medium text-ink">Resume from {mmss(progress.positionSec)}</span>
              ) : (
                <span className="font-mono text-white/50">{lesson.durationMin}:00</span>
              )}
            </div>
          </section>
        )}

        <Panel>
          {(lesson.type === "lab" || lesson.type === "practice") && (
            <div className="mb-6 flex flex-col gap-4 rounded-xl bg-ink p-5 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="label !text-cyan">Hands-on</p>
                <p className="mt-1.5 text-[16px] font-semibold">Complete this activity in the EMC Coding Lab</p>
                <p className="mt-1 text-[13px] text-white/60">Fictional cases — practice the workflow, then come back to mark it complete.</p>
              </div>
              <ButtonLink href="/academy/student/lab" variant="accent" size="sm">Open Coding Lab</ButtonLink>
            </div>
          )}
          {lesson.type === "quiz" && (
            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-line bg-mist/60 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="label">Checkpoint</p>
                <p className="mt-1.5 text-[16px] font-semibold">{quiz ? quiz.title : "This course’s quiz isn’t scheduled yet"}</p>
                <p className="mt-1 text-[13px] text-muted">{quiz ? `${quiz.questions.length} questions · ${quiz.durationMin} min · pass mark ${quiz.passMark}%` : "Your faculty will publish it soon."}</p>
              </div>
              {quiz && <ButtonLink href={`/academy/student/assessments/${quiz.id}`} size="sm">Go to assessment</ButtonLink>}
            </div>
          )}
          <LessonBlocks blocks={lesson.blocks} />
        </Panel>

        {/* Bottom navigation */}
        <div className="flex flex-col-reverse gap-3 rounded-2xl border border-line bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
          {prev ? (
            <ButtonLink href={`/academy/student/learn/${course.id}/${prev.id}`} variant="ghost" icon={null} iconLeft="arrow" className="[&>svg:first-child]:rotate-180">Previous</ButtonLink>
          ) : <span className="hidden sm:block" />}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <form action={complete}>
              <CompleteButton done={done} label={done ? (next ? "Continue to next" : "Back to my learning") : next ? "Mark complete & continue" : "Mark complete & finish"} />
            </form>
            {next && !done && (
              <ButtonLink href={`/academy/student/learn/${course.id}/${next.id}`} variant="outline">Next</ButtonLink>
            )}
          </div>
        </div>
      </article>

      {/* RIGHT — progress, resources, notes, assistant */}
      <aside className="min-w-0 space-y-5" aria-label="Lesson tools">
        <Panel title="Progress in this course" label={course.code}>
          <div className="flex items-baseline justify-between">
            <span className="text-[28px] font-semibold tabular-nums tracking-tight">{ctx.courseProgress.percent}%</span>
            <span className="font-mono text-[11.5px] text-muted">{doneCount}/{total} lessons</span>
          </div>
          <ProgressBar value={ctx.courseProgress.percent} className="mt-3" label="Course progress" />
          {ctx.courseProgress.lastActivity && <p className="mt-2.5 text-[12.5px] text-muted">Last activity {relative(ctx.courseProgress.lastActivity)}</p>}
        </Panel>

        <Panel title="Resources">
          {resources.length === 0 ? (
            <p className="text-[13.5px] text-muted">No resources for this lesson.</p>
          ) : (
            <ul className="space-y-1.5">
              {resources.map((r) => (
                <li key={r.storageKey}>
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex min-h-[44px] items-center gap-3 rounded-xl border border-line px-3 py-2 text-[13.5px] transition-colors hover:border-ink/30">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-soft text-blue"><Icon name={r.kind === "slides" ? "layers" : "file"} size={15} /></span>
                      <span className="min-w-0 flex-1 truncate">{r.label}</span>
                      <Icon name="download" size={14} className="shrink-0 text-muted" />
                    </a>
                  ) : (
                    <span className="flex min-h-[44px] items-center gap-3 rounded-xl border border-dashed border-line px-3 py-2 text-[13.5px] text-muted">{r.label} — available once storage is connected</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[11.5px] text-muted">Links are signed and expire after 30 minutes.</p>
        </Panel>

        <Panel title="My notes">
          <LessonNotes courseId={course.id} lessonId={lesson.id} initial={note?.text ?? ""} updatedLabel={note ? relative(note.updatedAt) : null} />
        </Panel>

        <Panel title="AI learning assistant" label="Educational · beta">
          <LessonAssistant courseId={course.id} lessonId={lesson.id} />
        </Panel>
      </aside>
    </div>
  );
}
