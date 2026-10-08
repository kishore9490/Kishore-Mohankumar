import Link from "next/link";
import { requirePermission } from "@/server/auth/session";
import { academicReviewQueue, courseById, courseCatalog, facultyUsers, programName, programs } from "@/server/repositories/admin";
import { createCourse, reviewContent, setCertificateRule, setCourseFaculty, setCourseStatus, updateCourse } from "@/server/actions/admin";
import { relative } from "@/lib/platform/format";
import { can } from "@/lib/platform/rbac";
import { EmptyState, Notice, PageHeader, Panel, Pill, StatusPill, humanize } from "@/components/academy/ui";
import { ActionButton, ActionForm, CheckGroup, Field, Select, TextArea } from "@/components/academy/admin/forms";
import { ManagePanel, SubHead } from "@/components/academy/admin/bits";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export const metadata = { title: "Courses · EMC Academy" };

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ course?: string; new?: string }> }) {
  const user = await requirePermission("courses.view");
  const sp = await searchParams;
  const catalog = courseCatalog();
  const queue = academicReviewQueue();
  const selected = sp.course ? courseById(sp.course) : null;
  const canEdit = can(user, "courses.edit");
  const canPublish = can(user, "courses.publish");
  const faculty = facultyUsers();

  return (
    <>
      <PageHeader
        label="Academy · Courses"
        title="Programs & courses."
        intro="Program → course → module → lesson. Faculty build the content; you decide what is published and what earns a certificate."
        actions={can(user, "courses.create") ? <ButtonLink href="/academy/admin/courses?new=1" iconLeft="plus" icon={null} size="sm">New course</ButtonLink> : undefined}
      />
      <div className="space-y-5">
        {sp.new && can(user, "courses.create") && (
          <ManagePanel label="New course" title="Create a draft course" closeHref="/academy/admin/courses">
            <ActionForm action={createCourse} submit="Create draft" submitIcon="plus">
              <div className="grid gap-4 md:grid-cols-3">
                <Select name="programId" label="Program" options={programs().map((p) => ({ value: p.id, label: p.name }))} placeholder="Choose a program" />
                <Field name="code" label="Course code" maxLength={12} placeholder="ADV-403" hint="Letters, a dash, three digits." />
                <Field name="title" label="Title" maxLength={100} />
              </div>
              <TextArea name="description" label="Short description" optional maxLength={300} />
            </ActionForm>
          </ManagePanel>
        )}

        {selected && (
          <ManagePanel
            id="manage"
            label={`${selected.code} · ${programName(selected.programId)}`}
            title={<span className="flex flex-wrap items-center gap-2.5">{selected.title} <StatusPill status={selected.status} /></span>}
            closeHref="/academy/admin/courses"
          >
            <div className="grid gap-8 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-line">
              <section className="min-w-0 lg:pr-7">
                <SubHead>Details</SubHead>
                {canEdit ? (
                  <div className="mt-3">
                    <ActionForm action={updateCourse} submit="Save details" variant="outline" hidden={{ id: selected.id }}>
                      <Field name="title" label="Title" defaultValue={selected.title} maxLength={100} />
                      <TextArea name="description" label="Description" defaultValue={selected.description} maxLength={300} />
                    </ActionForm>
                  </div>
                ) : <p className="mt-2 text-[14px] text-muted">{selected.description}</p>}
                <p className="label mt-6 !text-[10px]">Status</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selected.status !== "published" && canPublish && <ActionButton action={setCourseStatus} fields={{ id: selected.id, status: "published" }} label="Publish" variant="primary" icon="check" confirm={`Publish ${selected.code} to students?`} />}
                  {selected.status === "draft" && canEdit && <ActionButton action={setCourseStatus} fields={{ id: selected.id, status: "review" }} label="Send to review" />}
                  {selected.status === "published" && canEdit && <ActionButton action={setCourseStatus} fields={{ id: selected.id, status: "draft" }} label="Unpublish" confirm="Unpublish? Students lose access to new lessons until it is published again." />}
                  {selected.status !== "archived" && canEdit && <ActionButton action={setCourseStatus} fields={{ id: selected.id, status: "archived" }} label="Archive" variant="ghost" confirm={`Archive ${selected.code}?`} />}
                  {selected.status === "archived" && canEdit && <ActionButton action={setCourseStatus} fields={{ id: selected.id, status: "draft" }} label="Restore to draft" />}
                </div>
              </section>
              <section className="min-w-0 lg:px-7">
                <SubHead>Teaching team</SubHead>
                {canEdit ? (
                  <div className="mt-3">
                    <ActionForm action={setCourseFaculty} submit="Save team" variant="outline" hidden={{ id: selected.id }}>
                      <CheckGroup name="faculty" legend="Faculty assigned" columns={1} defaultValues={selected.facultyIds} groups={[{ options: faculty.map((f) => ({ value: f.id, label: f.name, hint: f.title ?? undefined })) }]} />
                    </ActionForm>
                  </div>
                ) : <p className="mt-2 text-[14px] text-muted">{selected.facultyIds.length} faculty</p>}
              </section>
              <section className="min-w-0 lg:pl-7">
                <SubHead>Certificate requirements</SubHead>
                <p className="mt-1 text-[13px] text-muted">What a student needs to earn the EMC course certificate.</p>
                {canEdit ? (
                  <div className="mt-3">
                    <ActionForm action={setCertificateRule} submit="Save requirements" variant="outline" hidden={{ id: selected.id }}>
                      <div className="grid grid-cols-2 gap-3">
                        <Field name="minCompletion" label="Min. completion %" type="number" min={0} max={100} defaultValue={selected.certificateRule.minCompletion} />
                        <Field name="minAverageScore" label="Min. average %" type="number" min={0} max={100} defaultValue={selected.certificateRule.minAverageScore} />
                      </div>
                    </ActionForm>
                  </div>
                ) : null}
              </section>
            </div>
          </ManagePanel>
        )}
        {sp.course && !selected && <Notice tone="warning">That course doesn’t exist any more.</Notice>}

        {/* Review queue */}
        <Panel id="review" title="Awaiting academic review" label="Faculty submissions" action={<Pill tone={queue.length ? "warning" : "success"}>{queue.length} waiting</Pill>}>
          {queue.length === 0 ? (
            <EmptyState icon="check" title="Review queue is clear" text="When faculty submit lessons, quizzes or cases for review they appear here for approval." />
          ) : (
            <ul className="divide-y divide-line">
              {queue.map(({ item, owner, course }) => (
                <li key={item.id} className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-[15px] font-medium">{item.title} <StatusPill status={item.status} label={item.status === "review" ? "In review" : "Approved"} /></p>
                    <p className="mt-0.5 text-[12.5px] text-muted">{humanize(item.kind)} · {course} · by {owner} · updated {relative(item.updatedAt)}{item.aiAssisted ? " · AI-assisted draft" : ""}</p>
                  </div>
                  <div className="flex flex-wrap items-start gap-2">
                    {item.status === "review" && canEdit && <ActionButton action={reviewContent} fields={{ id: item.id, decision: "approve" }} label="Approve" icon="check" />}
                    {canPublish && <ActionButton action={reviewContent} fields={{ id: item.id, decision: "publish" }} label="Publish" variant="primary" confirm={`Publish “${item.title}” to students?`} />}
                    {canEdit && (
                      <details className="group relative">
                        <summary className="inline-flex h-10 cursor-pointer list-none items-center rounded-full px-4 text-[13px] font-medium text-ink hover:bg-mist">Return…</summary>
                        <div className="mt-2 w-[min(320px,80vw)] rounded-xl border border-line bg-white p-4 shadow-lg md:absolute md:right-0 md:z-10">
                          <ActionForm action={reviewContent} submit="Return to faculty" variant="outline" hidden={{ id: item.id, decision: "return" }}>
                            <Field name="note" label="What should change?" maxLength={200} />
                          </ActionForm>
                        </div>
                      </details>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Catalog */}
        {catalog.map(({ program, courses }) => (
          <Panel key={program.id} label="Program" title={program.name} pad={false}>
            <p className="px-5 pb-4 text-[14px] text-muted md:px-6">{program.description}</p>
            {courses.length === 0 ? (
              <div className="px-5 pb-5 md:px-6"><EmptyState icon="book" title="No courses yet" text="Create a draft course for this program." /></div>
            ) : (
              <ul className="divide-y divide-line border-t border-line">
                {courses.map(({ course: c, modules, lessons, faculty: f }) => (
                  <li key={c.id}>
                    <Link href={`/academy/admin/courses?course=${c.id}#manage`} className="grid gap-3 px-5 py-4 transition-colors hover:bg-mist/50 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center md:px-6">
                      <div className="min-w-0">
                        <p className="font-mono text-[11.5px] text-muted">{c.code}</p>
                        <p className="truncate text-[15px] font-medium">{c.title}</p>
                      </div>
                      <div className="flex gap-4 text-[13px]">
                        <span><span className="font-semibold tabular-nums">{modules}</span> <span className="text-muted">modules</span></span>
                        <span><span className="font-semibold tabular-nums">{lessons}</span> <span className="text-muted">lessons</span></span>
                      </div>
                      <div className="min-w-0 text-[13px]">
                        <p className="truncate">{f.length ? f.map((x) => x.name).join(", ") : <span className="text-orange-800">No faculty assigned</span>}</p>
                        <p className="font-mono text-[11px] text-muted">Certificate: {c.certificateRule.minCompletion}% done · {c.certificateRule.minAverageScore}% avg</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusPill status={c.status} />
                        <Icon name="chevron" size={15} className="hidden text-muted md:block" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        ))}
        <p className="text-[12.5px] text-muted">EMC certificates are course certificates issued by EMC. They are not external professional certifications.</p>
      </div>
    </>
  );
}
