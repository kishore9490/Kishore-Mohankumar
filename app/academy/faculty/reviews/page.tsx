import { requirePermission } from "@/server/auth/session";
import { needsReview, reviewQueue } from "@/server/repositories/faculty";
import { formatDateTime, relative } from "@/lib/platform/format";
import { Avatar, DataTable, EmptyState, Metrics, PageHeader, StatusPill, Tabs } from "@/components/academy/ui";

type Row = ReturnType<typeof reviewQueue>[number];

const VIEWS = [
  { key: "waiting", label: "Needs review" },
  { key: "returned", label: "Revision requested" },
  { key: "completed", label: "Completed" },
  { key: "all", label: "All" },
] as const;

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const user = await requirePermission("assignments.review");
  const { view: v } = await searchParams;
  const view = VIEWS.find((x) => x.key === v)?.key ?? "waiting";
  const all = reviewQueue(user.id);
  const match = (r: Row, k: string) => (k === "waiting" ? needsReview(r.submission) : k === "all" ? true : r.submission.status === k);
  const rows = all.filter((r) => match(r, view));
  const graded = all.filter((r) => r.submission.status === "completed" && r.submission.score !== null);
  const avg = graded.length ? Math.round(graded.reduce((s, r) => s + (r.submission.score! / r.assignment.maxScore) * 100, 0) / graded.length) : null;
  const oldest = all.filter((r) => needsReview(r.submission) && r.submission.submittedAt).map((r) => r.submission.submittedAt!).sort()[0];

  return (
    <>
      <PageHeader label="Assignment reviews" title="Review queue." intro="Submissions for assignments in your courses, oldest first. Grade, comment, or send work back for revision." />
      <Metrics
        className="mb-5"
        items={[
          { label: "Waiting", value: all.filter((r) => needsReview(r.submission)).length, hint: oldest ? `Oldest ${relative(oldest)}` : "Queue is clear" },
          { label: "Revision requested", value: all.filter((r) => r.submission.status === "returned").length, hint: "Waiting on students" },
          { label: "Completed", value: all.filter((r) => r.submission.status === "completed").length, hint: "Graded" },
          { label: "Average grade", value: avg !== null ? `${avg}%` : "—", hint: "Completed work" },
        ]}
      />
      <div className="mb-4">
        <Tabs current={view} items={VIEWS.map((x) => ({ key: x.key, label: x.label, href: `/academy/faculty/reviews?view=${x.key}`, count: all.filter((r) => match(r, x.key)).length }))} />
      </div>
      <DataTable<Row>
        caption="Assignment submissions"
        rows={rows}
        rowKey={(r) => r.submission.id}
        rowHref={(r) => `/academy/faculty/reviews/${r.submission.id}`}
        empty={<EmptyState icon="check" title={view === "waiting" ? "Nothing waiting for review" : "No submissions here"} text={view === "waiting" ? "You’re all caught up. New submissions for your courses will appear here." : "Submissions in this state will appear here."} />}
        columns={[
          {
            key: "student", label: "Student", mobile: "primary",
            render: (r) => (
              <span className="flex items-center gap-3">
                <Avatar name={r.studentName} size={30} />
                <span className="min-w-0">
                  <span className="block truncate">{r.studentName}</span>
                  <span className="block truncate text-[12px] font-normal text-muted md:hidden">{r.assignment.title}</span>
                </span>
              </span>
            ),
          },
          { key: "assignment", label: "Assignment", mobile: "hide", render: (r) => <span className="block max-w-[280px] truncate">{r.assignment.title}<span className="block text-[12px] text-muted">{r.course.code}</span></span> },
          { key: "submitted", label: "Submitted", render: (r) => <span className="text-[13px] text-muted" title={r.submission.submittedAt ? formatDateTime(r.submission.submittedAt) : undefined}>{r.submission.submittedAt ? relative(r.submission.submittedAt) : "—"}</span> },
          { key: "rev", label: "Revision", render: (r) => <span className="font-mono text-[12.5px]">{r.submission.revision ? `R${r.submission.revision}` : "First"}</span> },
          { key: "score", label: "Score", render: (r) => <span className="tabular-nums">{r.submission.score !== null ? `${r.submission.score}/${r.assignment.maxScore}` : "—"}</span> },
          { key: "status", label: "Status", render: (r) => <StatusPill status={r.submission.status} /> },
        ]}
      />
    </>
  );
}
