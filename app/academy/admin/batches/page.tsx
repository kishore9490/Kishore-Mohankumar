import Link from "next/link";
import { requirePermission } from "@/server/auth/session";
import { batchRows, facultyUsers, programs } from "@/server/repositories/admin";
import { formatDate, formatWeekday, formatTime } from "@/lib/platform/format";
import { EmptyState, PageHeader, Panel, StatusPill, Tabs } from "@/components/academy/ui";
import { FillBar, ManagePanel } from "@/components/academy/admin/bits";
import { BatchForm } from "@/components/academy/admin/BatchForm";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export const metadata = { title: "Batches · EMC Academy" };

export default async function BatchesPage({ searchParams }: { searchParams: Promise<{ new?: string; status?: string }> }) {
  await requirePermission("batches.manage");
  const sp = await searchParams;
  const all = batchRows();
  const status = ["planned", "active", "completed"].includes(sp.status ?? "") ? sp.status : undefined;
  const rows = all.filter((r) => !status || r.batch.status === status).sort((a, b) => a.batch.startDate.localeCompare(b.batch.startDate));
  const count = (s: string) => all.filter((r) => r.batch.status === s).length;

  return (
    <>
      <PageHeader
        label="Academy · Batches"
        title="Batches & cohorts."
        intro="Who learns together, when, and with which faculty. Capacity, attendance and progress at a glance."
        actions={<ButtonLink href="/academy/admin/batches?new=1" iconLeft="plus" icon={null} size="sm">New batch</ButtonLink>}
      />
      <div className="space-y-5">
        {sp.new && (
          <ManagePanel label="New batch" title="Create a batch" closeHref="/academy/admin/batches">
            <BatchForm programs={programs()} faculty={facultyUsers()} />
          </ManagePanel>
        )}
        <Tabs
          current={status ?? "all"}
          items={[
            { key: "all", label: "All", href: "/academy/admin/batches", count: all.length },
            { key: "active", label: "Active", href: "/academy/admin/batches?status=active", count: count("active") },
            { key: "planned", label: "Planned", href: "/academy/admin/batches?status=planned", count: count("planned") },
            { key: "completed", label: "Completed", href: "/academy/admin/batches?status=completed", count: count("completed") },
          ]}
        />
        {rows.length === 0 ? (
          <EmptyState icon="grid" title="No batches here" text="Create a batch to start enrolling students." action={<ButtonLink href="/academy/admin/batches?new=1" size="sm">New batch</ButtonLink>} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {rows.map((r) => (
              <Link key={r.batch.id} href={`/academy/admin/batches/${r.batch.id}`} className="group block min-w-0 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-ink/30 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="label !text-[10px]">{r.program}</p>
                    <h2 className="mt-1.5 text-[17px] font-semibold leading-snug tracking-tight">{r.batch.name}</h2>
                  </div>
                  <StatusPill status={r.batch.status} />
                </div>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                  <span className="inline-flex items-center gap-1.5"><Icon name="clock" size={13} />{r.batch.schedule}</span>
                  <span className="inline-flex items-center gap-1.5"><Icon name="calendar" size={13} />{formatDate(r.batch.startDate)} → {formatDate(r.batch.endDate)}</span>
                </p>
                <FillBar used={r.batch.studentIds.length} total={r.batch.capacity} className="mt-5" />
                <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line text-center">
                  {[["Attendance", r.attendance !== null ? `${r.attendance}%` : "—"], ["Completion", r.completion !== null ? `${r.completion}%` : "—"], ["Sessions", String(r.sessions)]].map(([k, v]) => (
                    <div key={k} className="bg-white px-2 py-3">
                      <dt className="label !text-[9.5px]">{k}</dt>
                      <dd className="mt-1 text-[18px] font-semibold tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-4 flex items-center justify-between gap-3 text-[13px]">
                  <span className="min-w-0 truncate text-muted">{r.faculty.length ? r.faculty.join(", ") : "No faculty assigned"}</span>
                  <span className="shrink-0 font-mono text-[11.5px] text-muted">{r.nextSession ? `Next ${formatWeekday(r.nextSession.startsAt)} ${formatTime(r.nextSession.startsAt)}` : "No upcoming class"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
        <Panel title="How batches work" label="Notes">
          <ul className="grid gap-3 text-[14px] text-muted md:grid-cols-3">
            <li><span className="font-medium text-ink">Enrol from admissions.</span> Moving an applicant to “Enrolled” creates the student account and reserves their seat.</li>
            <li><span className="font-medium text-ink">Move students in Users.</span> Assigning a new batch pauses the previous enrolment, so history is kept.</li>
            <li><span className="font-medium text-ink">Capacity is enforced.</span> Full batches reject new students until capacity is raised.</li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
