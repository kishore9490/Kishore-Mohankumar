import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/session";
import { performanceFor } from "@/server/repositories/student";
import { ActivityStrip, HBars, LineChart } from "@/components/academy/charts";
import { EmptyState, Metrics, PageHeader, Panel, TextLink } from "@/components/academy/ui";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "My performance · EMC Academy" };

function TagList({ rows, tone, empty }: { rows: { tag: string; accuracy: number; total: number }[]; tone: "good" | "work"; empty: string }) {
  if (!rows.length) return <p className="text-[13.5px] text-muted">{empty}</p>;
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.tag} className="flex items-center gap-3 rounded-xl border border-line px-4 py-3">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone === "good" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
            <Icon name={tone === "good" ? "check" : "target"} size={15} />
          </span>
          <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{r.tag}</span>
          <span className="shrink-0 text-right">
            <span className="block text-[14px] font-semibold tabular-nums">{r.accuracy}%</span>
            <span className="block font-mono text-[10.5px] text-muted">{r.total} questions</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default async function PerformancePage() {
  const user = await requirePermission("learning.access");
  const p = performanceFor(user.id);
  const active = p.activity.filter(Boolean).length;
  const enoughTags = p.strengths.length + p.improve.length > 0;

  return (
    <div className="space-y-5">
      <PageHeader label="Work" title="My performance" intro="How your learning is going — completion, scores, attendance and where to focus next." />

      <Metrics
        items={[
          { label: "Course completion", value: `${p.completion}%`, hint: `${p.doneLessons} of ${p.totalLessons} lessons` },
          { label: "Average best score", value: p.averageScore !== null ? `${p.averageScore}%` : "—", hint: `${p.assessmentsTaken} assessment${p.assessmentsTaken === 1 ? "" : "s"} taken`, href: "/academy/student/assessments" },
          { label: "Attendance", value: p.attendance !== null ? `${p.attendance}%` : "—", hint: p.attendanceCounts.total ? `${p.attendanceCounts.present + p.attendanceCounts.late} of ${p.attendanceCounts.total} classes` : "No classes marked yet" },
          { label: "Active days", value: `${active}/14`, hint: "Last two weeks" },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Assessment scores over time" label="Percent per attempt">
          {p.scores.length < 2 ? (
            <EmptyState icon="chart" title={p.scores.length ? "One score so far" : "No scores yet"} text="Your trend line appears after two or more assessment attempts." action={<TextLink href="/academy/student/assessments">Go to assessments</TextLink>} />
          ) : (
            <>
              <LineChart data={p.scores.map((s) => ({ label: s.label, value: s.value }))} max={100} suffix="%" label="Assessment scores over time" />
              <ul className="mt-4 divide-y divide-line text-[13px]">
                {p.scores.slice(-4).reverse().map((s, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 py-2">
                    <span className="min-w-0 truncate">{s.title}</span>
                    <span className="shrink-0 font-mono text-[12px] text-muted">{s.label} · <span className="font-semibold text-ink">{s.value}%</span></span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>

        <Panel title="Course completion">
          {p.courses.length === 0 ? (
            <p className="text-[14px] text-muted">You’re not enrolled in any courses yet.</p>
          ) : (
            <HBars data={p.courses.map((c) => ({ label: c.course.title, value: c.progress.percent, href: `/academy/student/learning#${c.course.id}`, note: `${c.progress.done}/${c.progress.total}` }))} max={100} format={(v) => `${v}%`} />
          )}
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Panel title="Learning activity" label="Last 14 days">
          <ActivityStrip days={p.activity} label="Learning activity, last 14 days" />
          <div className="mt-2 flex justify-between font-mono text-[10.5px] text-muted"><span>2 weeks ago</span><span>Today</span></div>
          <p className="mt-4 text-[13.5px] text-muted">
            {active >= 10 ? "Excellent consistency — keep the rhythm going." : active >= 5 ? "Good rhythm. A short session on the quiet days keeps things fresh." : "Try short, regular sessions — 20 minutes a day beats one long weekend session."}
          </p>
        </Panel>
        <Panel title="Attendance" label={p.attendanceCounts.total ? `${p.attendanceCounts.total} classes` : undefined}>
          {p.attendanceCounts.total === 0 ? (
            <p className="text-[14px] text-muted">Attendance appears once your faculty marks your first class.</p>
          ) : (
            <dl className="grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-line bg-line text-center">
              {(["present", "late", "absent", "excused"] as const).map((k) => (
                <div key={k} className="bg-white px-2 py-3">
                  <dt className="label !text-[9.5px]">{k}</dt>
                  <dd className="mt-1 text-[20px] font-semibold tabular-nums">{p.attendanceCounts[k]}</dd>
                </div>
              ))}
            </dl>
          )}
        </Panel>
      </div>

      <Panel title="Strengths & areas to improve" label="From your answered questions">
        {!enoughTags ? (
          <div className="rounded-xl bg-mist px-4 py-5 text-[14px] text-muted">
            Not enough data yet. Insights appear once you’ve answered at least two questions on a topic in assessments taken here
            {p.answeredQuestions ? ` (${p.answeredQuestions} answered so far)` : ""}. Earlier attempts without recorded answers aren’t included.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-[13px] font-semibold">Strengths</p>
              <TagList rows={p.strengths} tone="good" empty="No topic above 70% yet — keep practising." />
            </div>
            <div>
              <p className="mb-3 text-[13px] font-semibold">Areas to improve</p>
              <TagList rows={p.improve} tone="work" empty="Nothing below 70% — great work." />
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
