import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/server/auth/session";
import { batchDetail, facultyUsers, programs } from "@/server/repositories/admin";
import { formatDate, formatTime, formatWeekday } from "@/lib/platform/format";
import { DataTable, EmptyState, Metrics, PageHeader, Panel, Pill, ProgressBar, StatusPill } from "@/components/academy/ui";
import { BatchForm } from "@/components/academy/admin/BatchForm";

export const metadata = { title: "Batch · EMC Academy" };

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("batches.manage");
  const { id } = await params;
  const b = batchDetail(id);
  if (!b) notFound();
  const { batch } = b;

  return (
    <>
      <PageHeader
        back={{ href: "/academy/admin/batches", label: "All batches" }}
        label={`Batch · ${b.program}`}
        title={batch.name}
        intro={<>{batch.schedule} · {formatDate(batch.startDate)} → {formatDate(batch.endDate)}</>}
        actions={<StatusPill status={batch.status} />}
      />
      <div className="space-y-5">
        <Metrics
          items={[
            { label: "Students", value: batch.studentIds.length, hint: `${Math.max(0, batch.capacity - batch.studentIds.length)} of ${batch.capacity} seats free` },
            { label: "Attendance", value: b.attendance !== null ? `${b.attendance}%` : "—", hint: `${b.past.length} classes held` },
            { label: "Upcoming classes", value: b.upcoming.length, hint: b.upcoming[0] ? `Next ${formatWeekday(b.upcoming[0].startsAt)}` : "None scheduled" },
            { label: "Faculty", value: b.faculty.length, hint: b.faculty.map((f) => f.name.replace(/^Dr\.\s*/, "")).join(", ") || "None" },
          ]}
        />

        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <section aria-labelledby="students-h" className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="students-h" className="text-[17px] font-semibold tracking-tight">Students</h2>
              <Link href="/academy/admin/users?role=student" className="text-[13px] font-medium text-blue hover:text-ink">Assign from Users</Link>
            </div>
            <DataTable
              caption="Students in this batch"
              rows={b.students}
              rowKey={(s) => s.id}
              rowHref={(s) => `/academy/admin/users?user=${s.id}#manage`}
              empty={<EmptyState icon="users" title="No students yet" text="Enrol students from Admissions or assign them a batch in Users." />}
              columns={[
                { key: "name", label: "Student", mobile: "primary", render: (s) => <span className="block min-w-0"><span className="block truncate">{s.name}</span><span className="block truncate text-[12px] font-normal text-muted">{s.email}</span></span> },
                { key: "progress", label: "Progress", render: (s) => <span className="flex items-center gap-2"><ProgressBar value={s.completion} tone="blue" className="w-16" label={`${s.name} progress`} /><span className="tabular-nums text-[12.5px]">{s.completion}%</span></span> },
                { key: "att", label: "Attendance", render: (s) => <span className={`tabular-nums ${s.attendance !== null && s.attendance < 75 ? "text-orange-800" : ""}`}>{s.attendance !== null ? `${s.attendance}%` : "—"}</span> },
                { key: "fee", label: "Fees", render: (s) => (s.invoice ? <StatusPill status={s.invoice} /> : <span className="text-muted">—</span>) },
                { key: "status", label: "Account", mobile: "hide", render: (s) => <StatusPill status={s.status} /> },
              ]}
            />
          </section>

          <Panel title="Sessions" label={`${b.upcoming.length} upcoming · ${b.past.length} held`}>
            {b.upcoming.length + b.past.length === 0 ? (
              <EmptyState icon="calendar" title="No sessions scheduled" text="Class sessions for this batch will appear here." />
            ) : (
              <>
                <ul className="space-y-2">
                  {b.upcoming.slice(0, 5).map((s) => (
                    <li key={s.id} className="flex items-center gap-4 rounded-xl border border-line p-3.5">
                      <div className="w-20 shrink-0">
                        <p className="font-mono text-[12px] font-medium">{formatWeekday(s.startsAt)}</p>
                        <p className="font-mono text-[11px] text-muted">{formatTime(s.startsAt)}</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium">{s.title}</p>
                        <p className="truncate text-[12px] text-muted">{b.courseTitle(s.courseId)}</p>
                      </div>
                      <Pill>{s.mode === "online" ? "Online" : "Classroom"}</Pill>
                    </li>
                  ))}
                </ul>
                {b.past.length > 0 && (
                  <>
                    <p className="label mt-5 !text-[10px]">Recently held</p>
                    <ul className="mt-2 divide-y divide-line">
                      {b.past.slice(0, 5).map((s) => (
                        <li key={s.id} className="flex items-center justify-between gap-3 py-2 text-[13.5px]">
                          <span className="truncate">{s.title}</span>
                          <span className="shrink-0 font-mono text-[11.5px] text-muted">{formatWeekday(s.startsAt)}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </Panel>
        </div>

        <Panel title="Edit batch" label="Settings" id="edit">
          <BatchForm batch={batch} programs={programs()} faculty={facultyUsers()} />
        </Panel>
      </div>
    </>
  );
}
