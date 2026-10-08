import { requirePermission } from "@/server/auth/session";
import { myAssessments } from "@/server/repositories/faculty";
import { formatShortDate } from "@/lib/platform/format";
import { DataTable, EmptyState, Metrics, PageHeader, Pill, StatusPill, Tabs, humanize } from "@/components/academy/ui";
import { ButtonLink } from "@/components/ui/Button";

type Row = ReturnType<typeof myAssessments>[number];
const VIEWS = ["all", "draft", "review", "published"] as const;

export default async function AssessmentsPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const user = await requirePermission("assessments.manage");
  const { state: st } = await searchParams;
  const view = VIEWS.find((v) => v === st) ?? "all";
  const all = myAssessments(user.id);
  const rows = all.filter((r) => view === "all" || r.assessment.status === view);
  const attempted = all.filter((r) => r.avg !== null);

  return (
    <>
      <PageHeader
        label="Assessment builder"
        title="Assessments."
        intro="Quizzes, module tests, mocks and finals for your courses. Build and submit for review — an admin publishes approved assessments."
        actions={<ButtonLink href="/academy/faculty/assessments/new" iconLeft="plus" icon={null}>New assessment</ButtonLink>}
      />
      <Metrics
        className="mb-5"
        items={[
          { label: "Assessments", value: all.length, hint: "In your courses" },
          { label: "Open now", value: all.filter((r) => r.assessment.status === "published" && r.window === "open").length, hint: "Students can attempt" },
          { label: "Drafts & in review", value: all.filter((r) => r.assessment.status === "draft" || r.assessment.status === "review").length, hint: "Not visible to students" },
          { label: "Avg. score", value: attempted.length ? `${Math.round(attempted.reduce((s, r) => s + (r.avg ?? 0), 0) / attempted.length)}%` : "—", hint: "Across attempts" },
        ]}
      />
      <div className="mb-4">
        <Tabs current={view} items={VIEWS.map((v) => ({ key: v, label: v === "all" ? "All" : v === "review" ? "In review" : humanize(v), href: `/academy/faculty/assessments?state=${v}`, count: all.filter((r) => v === "all" || r.assessment.status === v).length }))} />
      </div>
      <DataTable<Row>
        caption="Assessments in your courses"
        rows={rows}
        rowKey={(r) => r.assessment.id}
        rowHref={(r) => `/academy/faculty/assessments/${r.assessment.id}`}
        empty={<EmptyState icon="file" title={view === "all" ? "No assessments yet" : `No ${view === "review" ? "assessments in review" : `${view} assessments`}`} text="Build a quiz or test from multiple-choice, scenario, short-answer and coding-case questions." action={<ButtonLink href="/academy/faculty/assessments/new" size="sm">New assessment</ButtonLink>} />}
        columns={[
          { key: "title", label: "Assessment", mobile: "primary", render: (r) => <span className="block max-w-[320px] truncate">{r.assessment.title}<span className="block text-[12px] font-normal text-muted">{r.course.code} · {humanize(r.assessment.kind)}</span></span> },
          { key: "status", label: "Status", render: (r) => <StatusPill status={r.assessment.status} label={r.assessment.status === "review" ? "In review" : undefined} /> },
          { key: "window", label: "Window", render: (r) => <span className="text-[13px] text-muted">{formatShortDate(r.assessment.opensAt)} – {formatShortDate(r.assessment.closesAt)} {r.assessment.status === "published" && r.window === "open" && <Pill tone="accent">Open</Pill>}</span> },
          { key: "q", label: "Questions", render: (r) => <span className="tabular-nums">{r.assessment.questions.length} · {r.maxScore} pts</span> },
          { key: "attempts", label: "Attempts", render: (r) => <span className="tabular-nums">{r.attempts}</span> },
          { key: "avg", label: "Avg. score", render: (r) => <span className="tabular-nums">{r.avg !== null ? `${r.avg}%` : "—"}</span> },
        ]}
      />
    </>
  );
}
