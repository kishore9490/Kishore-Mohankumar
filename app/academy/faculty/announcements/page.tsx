import { requirePermission } from "@/server/auth/session";
import { batchById, userName } from "@/server/repositories/learning";
import { facultyAnnouncements, facultyScope } from "@/server/repositories/faculty";
import { formatDateTime, relative } from "@/lib/platform/format";
import { EmptyState, PageHeader, Panel, Pill } from "@/components/academy/ui";
import { AnnouncementForm } from "@/components/academy/faculty/AnnouncementForm";
import type { Announcement } from "@/lib/platform/types";

export default async function AnnouncementsPage() {
  const user = await requirePermission("communications.send");
  const { batches, studentIds } = facultyScope(user.id);
  const open = batches.filter((b) => b.status !== "completed");
  // "All my students" posts one record per batch; show them as a single announcement.
  const groups = new Map<string, Announcement[]>();
  for (const a of facultyAnnouncements(user.id)) {
    const key = `${a.createdBy}|${a.createdAt}|${a.title}`;
    groups.set(key, [...(groups.get(key) ?? []), a]);
  }
  const list = Array.from(groups.values());

  return (
    <>
      <PageHeader label="Announcements" title="Tell your students." intro="Post to one batch or every student you teach. They’re notified in the app straight away." />
      <div className="grid gap-5 lg:grid-cols-[380px_1fr] lg:items-start">
        <Panel title="New announcement" className="lg:sticky lg:top-24">
          {open.length ? (
            <AnnouncementForm allCount={studentIds.length} batches={open.map((b) => ({ id: b.id, label: b.name, students: b.studentIds.length }))} />
          ) : (
            <p className="text-[14px] text-muted">You don’t have an active batch to post to.</p>
          )}
        </Panel>
        <section aria-labelledby="past" className="min-w-0">
          <h2 id="past" className="label mb-3 !text-[10.5px]">Past announcements · {list.length}</h2>
          {list.length === 0 ? (
            <EmptyState icon="megaphone" title="No announcements yet" text="Announcements you post, and ones sent to your batches, will appear here." />
          ) : (
            <ul className="space-y-3">
              {list.map((g) => {
                const a = g[0];
                const audience =
                  a.audience === "batch" ? g.map((x) => batchById(x.batchId ?? "")?.name ?? "Batch").join(" · ") : a.audience === "faculty" ? "Faculty" : a.audience === "students" ? "All students" : "Everyone";
                return (
                  <li key={a.id} className="rounded-2xl border border-line bg-white p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={a.audience === "faculty" ? "neutral" : "info"}>{audience}</Pill>
                      {a.createdBy === user.id && <Pill tone="accent">You</Pill>}
                    </div>
                    <p className="mt-3 text-[16px] font-semibold tracking-tight">{a.title}</p>
                    <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed text-ink/80">{a.body}</p>
                    <p className="mt-3 font-mono text-[11px] text-muted" title={formatDateTime(a.createdAt)}>{userName(a.createdBy)} · {relative(a.createdAt)}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
