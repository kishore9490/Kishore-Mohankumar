import Link from "next/link";
import { requirePermission } from "@/server/auth/session";
import { userName } from "@/server/repositories/learning";
import { courseTree, facultyScope, myContent } from "@/server/repositories/faculty";
import { transitionContent } from "@/server/actions/faculty";
import { relative } from "@/lib/platform/format";
import { EmptyState, PageHeader, Panel, Pill, StatusPill, Tabs, humanize } from "@/components/academy/ui";
import { ContentCreateForm } from "@/components/academy/faculty/ContentCreateForm";
import { CONTENT_KINDS } from "@/components/academy/faculty/constants";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { PublishState } from "@/lib/platform/types";

const STATES: { key: PublishState; label: string; hint: string }[] = [
  { key: "draft", label: "Draft", hint: "Being written" },
  { key: "review", label: "Submitted for review", hint: "Waiting on an admin" },
  { key: "approved", label: "Approved", hint: "Ready to publish" },
  { key: "published", label: "Published", hint: "Visible to students" },
  { key: "archived", label: "Archived", hint: "Retired" },
];

const ACTIONS: Partial<Record<PublishState, { to: string; label: string; primary?: boolean }[]>> = {
  draft: [{ to: "submit", label: "Submit for review", primary: true }, { to: "archive", label: "Archive" }],
  review: [{ to: "withdraw", label: "Back to draft" }, { to: "archive", label: "Archive" }],
  approved: [{ to: "archive", label: "Archive" }],
  published: [{ to: "archive", label: "Archive" }],
  archived: [{ to: "restore", label: "Restore as draft" }],
};

export default async function ContentStudio({ searchParams }: { searchParams: Promise<{ state?: string; kind?: string }> }) {
  const user = await requirePermission("content.manage");
  const sp = await searchParams;
  const { courses } = facultyScope(user.id);
  const all = myContent(user.id);
  const state = STATES.find((s) => s.key === sp.state)?.key ?? "all";
  const kind = CONTENT_KINDS.find((k) => k.key === sp.kind)?.key ?? "";
  const byKind = all.filter((c) => !kind || c.kind === kind);
  const items = byKind.filter((c) => state === "all" || c.status === state);
  const href = (st: string, k: string) => `/academy/faculty/content?state=${st}${k ? `&kind=${k}` : ""}`;
  const courseLabel = (id: string | null) => courses.find((c) => c.id === id)?.code ?? "—";

  return (
    <>
      <PageHeader label="Content studio" title="Prepare content." intro="Lessons, videos, documents, quizzes, practice cases and Coding Lab cases for your courses. Submit drafts for review — an admin publishes." />

      {/* Pipeline */}
      <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-5" aria-label="Content pipeline">
        {STATES.map((s, i) => {
          const n = byKind.filter((c) => c.status === s.key).length;
          return (
            <li key={s.key} className={cn("relative bg-white", i === 4 && "col-span-2 sm:col-span-1")}>
              <Link href={href(s.key, kind)} aria-current={state === s.key ? "true" : undefined} className={cn("block h-full p-4 transition-colors hover:bg-mist/60 md:p-5", state === s.key && "bg-soft/60")}>
                <p className="label !text-[10px] flex items-center gap-1.5"><span className="font-mono text-cyan-ink">0{i + 1}</span> {s.label}</p>
                <p className="mt-3 text-[30px] font-semibold leading-none tracking-tight tabular-nums">{n}</p>
                <p className="mt-1.5 text-[12px] text-muted">{s.hint}</p>
              </Link>
              {i < 4 && <Icon name="chevron" size={14} className="absolute -right-[7px] top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white text-muted sm:block" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="min-w-0 space-y-4">
          <Tabs current={state} items={[{ key: "all", label: "All", href: href("all", kind), count: byKind.length }, ...STATES.map((s) => ({ key: s.key, label: s.key === "review" ? "In review" : s.label, href: href(s.key, kind), count: byKind.filter((c) => c.status === s.key).length }))]} />
          <nav className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1" aria-label="Filter by kind">
            {[{ key: "", label: "All kinds" }, ...CONTENT_KINDS].map((k) => (
              <Link key={k.key || "all"} href={href(state, k.key)} aria-current={kind === k.key ? "true" : undefined} className={cn("shrink-0 rounded-lg border px-3 py-1.5 text-[12.5px] transition-colors", kind === k.key ? "border-blue/40 bg-soft text-blue" : "border-transparent text-muted hover:text-ink")}>
                {k.label}
              </Link>
            ))}
          </nav>

          {items.length === 0 ? (
            <EmptyState icon="pen" title={all.length ? "Nothing in this view" : "No content yet"} text={all.length ? "Try another state or kind, or create a new draft." : "Create your first lesson, quiz or Coding Lab case with the form on this page."} />
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
              {items.map((c) => (
                <li key={c.id} className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:px-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-medium">{c.title}</p>
                      {c.aiAssisted && <Pill tone="accent">AI-assisted</Pill>}
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-muted">
                      {humanize(c.kind)} · {courseLabel(c.courseId)} · {c.ownerId === user.id ? "You" : userName(c.ownerId)} · updated {relative(c.updatedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={c.status} label={c.status === "review" ? "In review" : undefined} />
                    {(ACTIONS[c.status] ?? []).map((a) => (
                      <form key={a.to} action={transitionContent}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="to" value={a.to} />
                        <button type="submit" className={cn("h-9 rounded-full px-3.5 text-[13px] font-medium transition-colors", a.primary ? "bg-ink text-white hover:bg-navy-2" : "border border-line bg-white hover:border-ink")}>
                          {a.label}
                        </button>
                      </form>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Panel title="Create new" label="Starts as a draft">
          {courses.length ? <ContentCreateForm courses={courses.map((c) => ({ id: c.id, label: `${c.code} · ${c.title}` }))} /> : <p className="text-[14px] text-muted">You aren’t assigned to any course yet.</p>}
        </Panel>
      </div>

      {/* Course tree */}
      <section aria-labelledby="tree" className="mt-8">
        <p className="label flex items-center gap-2"><span className="inline-block h-px w-5 bg-cyan" aria-hidden="true" /> Read only</p>
        <h2 id="tree" className="heading mt-2 text-[24px]">Course structure</h2>
        {courses.length === 0 ? (
          <div className="mt-4"><EmptyState icon="book" title="No courses" text="Courses you teach will appear here." /></div>
        ) : (
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            {courses.map((course) => {
              const tree = courseTree(course.id);
              const lessons = tree.flatMap((t) => t.lessons);
              return (
                <Panel key={course.id} label={course.code} title={course.title} action={<StatusPill status={course.status} />}>
                  <p className="-mt-1 mb-4 text-[13px] text-muted">{tree.length} modules · {lessons.length} lessons · {lessons.filter((l) => l.status === "published").length} published</p>
                  {tree.length === 0 ? (
                    <p className="text-[14px] text-muted">No modules yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {tree.map(({ module: m, lessons }) => (
                        <details key={m.id} className="group rounded-xl border border-line">
                          <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-3 px-4 py-2.5 [&::-webkit-details-marker]:hidden">
                            <Icon name="chevron" size={14} className="shrink-0 text-muted transition-transform group-open:rotate-90" />
                            <span className="font-mono text-[11.5px] text-muted">M{m.order}</span>
                            <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium">{m.title}</span>
                            <span className="font-mono text-[11px] text-muted">{lessons.length}</span>
                          </summary>
                          <ul className="mt-4 divide-y divide-line border-t border-line">
                            {lessons.map((l) => (
                              <li key={l.id} className="flex items-center gap-3 px-4 py-2 pl-11">
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-[13.5px]">{l.order}. {l.title}</span>
                                  <span className="font-mono text-[10.5px] text-muted">{humanize(l.type)} · {l.durationMin} min</span>
                                </span>
                                <StatusPill status={l.status} />
                              </li>
                            ))}
                          </ul>
                        </details>
                      ))}
                    </div>
                  )}
                </Panel>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
