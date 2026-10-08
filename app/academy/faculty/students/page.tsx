import { requirePermission } from "@/server/auth/session";
import { facultyScope, myStudents, type StudentSnapshot } from "@/server/repositories/faculty";
import { relative } from "@/lib/platform/format";
import { Avatar, DataTable, EmptyState, Metrics, PageHeader, Pill, ProgressBar, Tabs } from "@/components/academy/ui";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export default async function FacultyStudents({ searchParams }: { searchParams: Promise<{ filter?: string; batch?: string; q?: string }> }) {
  const user = await requirePermission("students.view");
  const sp = await searchParams;
  const { batches } = facultyScope(user.id);
  const all = myStudents(user.id);
  const q = (sp.q ?? "").trim().slice(0, 60).toLowerCase();
  const batch = batches.find((b) => b.id === sp.batch);
  const filter = sp.filter === "attention" ? "attention" : batch ? batch.id : "all";
  const rows = all
    .filter((s) => (filter === "attention" ? s.flags.length > 0 : batch ? s.batch.id === batch.id : true))
    .filter((s) => !q || s.student.name.toLowerCase().includes(q) || s.student.email.toLowerCase().includes(q));
  const withAtt = all.filter((s) => s.attendance.rate !== null);
  const withScore = all.filter((s) => s.avgScore !== null);
  const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
  const qs = (extra: string) => `/academy/faculty/students?${extra}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <>
      <PageHeader label="Student insights" title="Your students." intro="Students in the batches you teach. Open a student to see progress, attendance, scores and your private notes." />

      <Metrics
        className="mb-5"
        items={[
          { label: "Students", value: all.length, hint: `${batches.length} batches` },
          { label: "Avg. attendance", value: avg(withAtt.map((s) => s.attendance.rate ?? 0)) !== null ? `${avg(withAtt.map((s) => s.attendance.rate ?? 0))}%` : "—", hint: "Across your classes" },
          { label: "Avg. score", value: avg(withScore.map((s) => s.avgScore ?? 0)) !== null ? `${avg(withScore.map((s) => s.avgScore ?? 0))}%` : "—", hint: "Best attempt per assessment" },
          { label: "Need attention", value: all.filter((s) => s.flags.length).length, hint: "Flagged below", href: qs("filter=attention") },
        ]}
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs
          current={filter}
          items={[
            { key: "all", label: "All", href: qs(""), count: all.length },
            { key: "attention", label: "Needs attention", href: qs("filter=attention"), count: all.filter((s) => s.flags.length).length },
            ...batches.map((b) => ({ key: b.id, label: b.name.replace("Career Program — ", ""), href: qs(`batch=${b.id}`), count: b.studentIds.length })),
          ]}
        />
        <form className="relative md:w-72" role="search">
          {sp.filter === "attention" && <input type="hidden" name="filter" value="attention" />}
          {batch && <input type="hidden" name="batch" value={batch.id} />}
          <label htmlFor="q" className="sr-only">Search students</label>
          <Icon name="search" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input id="q" name="q" defaultValue={sp.q ?? ""} placeholder="Search by name or email" className="field !py-2.5 pl-10" />
        </form>
      </div>

      <DataTable<StudentSnapshot>
        caption="Students in your batches"
        rows={rows}
        rowKey={(s) => s.student.id}
        rowHref={(s) => `/academy/faculty/students/${s.student.id}`}
        empty={
          <EmptyState
            icon="users"
            title={q ? "No students match your search" : filter === "attention" ? "No one needs attention right now" : "No students yet"}
            text={q ? "Try a different name or clear the search." : filter === "attention" ? "Students with attendance under 75%, scores under 60%, 5+ days of inactivity or overdue work will appear here." : "Students appear here once they are enrolled in one of your batches."}
          />
        }
        columns={[
          {
            key: "name", label: "Student", mobile: "primary",
            render: (s) => (
              <span className="flex items-center gap-3">
                <Avatar name={s.student.name} size={32} />
                <span className="min-w-0">
                  <span className="block truncate">{s.student.name}</span>
                  <span className="block truncate text-[12px] font-normal text-muted">{s.student.email}</span>
                </span>
              </span>
            ),
          },
          { key: "batch", label: "Batch", render: (s) => <span className="text-[13px] text-muted">{s.batch.name.replace("Career Program — ", "")}</span>, className: "hidden lg:table-cell", mobile: "hide" },
          {
            key: "progress", label: "Progress",
            render: (s) => (
              <span className="flex items-center gap-2">
                <ProgressBar value={s.progress?.percent ?? 0} className="w-16 shrink-0" label={`${s.student.name} progress`} />
                <span className="font-mono text-[12px] tabular-nums">{s.progress?.percent ?? 0}%</span>
              </span>
            ),
          },
          { key: "att", label: "Attendance", render: (s) => <span className={cn("tabular-nums", s.attendance.rate !== null && s.attendance.rate < 75 && "font-semibold text-orange-800")}>{s.attendance.rate !== null ? `${s.attendance.rate}%` : "—"}</span> },
          { key: "score", label: "Avg. score", render: (s) => <span className={cn("tabular-nums", s.avgScore !== null && s.avgScore < 60 && "font-semibold text-orange-800")}>{s.avgScore !== null ? `${s.avgScore}%` : "—"}</span> },
          { key: "last", label: "Last activity", render: (s) => <span className="text-[13px] text-muted">{s.lastActivity ? relative(s.lastActivity) : "None yet"}</span> },
          {
            key: "flags", label: "Attention",
            render: (s) => s.flags.length ? (
              <span className="flex flex-wrap gap-1">{s.flags.slice(0, 2).map((f) => <Pill key={f.key} tone={f.key === "attendance" || f.key === "score" ? "danger" : "warning"}>{f.label}</Pill>)}{s.flags.length > 2 && <Pill>+{s.flags.length - 2}</Pill>}</span>
            ) : <Pill tone="success" dot>On track</Pill>,
          },
        ]}
      />
    </>
  );
}
