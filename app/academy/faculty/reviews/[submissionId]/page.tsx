import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/server/auth/session";
import { db } from "@/server/db/store";
import { userName } from "@/server/repositories/learning";
import { needsReview, reviewQueue, submissionForFaculty } from "@/server/repositories/faculty";
import { storageProvider } from "@/integrations/storage";
import { formatDateTime, relative } from "@/lib/platform/format";
import { Avatar, PageHeader, Panel, Pill, StatusPill } from "@/components/academy/ui";
import { ReviewForm } from "@/components/academy/faculty/ReviewForm";
import { Icon } from "@/components/ui/Icon";

async function signed(key: string) {
  try {
    return await storageProvider().signedUrl(key, { expiresInSec: 600 });
  } catch {
    return null;
  }
}

export default async function ReviewDetail({ params }: { params: Promise<{ submissionId: string }> }) {
  const user = await requirePermission("assignments.review");
  const { submissionId } = await params;
  const d = submissionForFaculty(user.id, submissionId);
  if (!d) notFound();
  const { submission: s, assignment: a, course, module, student, batch } = d;
  const files = await Promise.all(s.files.map(async (f) => ({ ...f, url: await signed(f.storageKey) })));
  const brief = await Promise.all(a.attachments.map(async (f) => ({ ...f, url: await signed(f.storageKey) })));
  const queue = reviewQueue(user.id).filter((r) => needsReview(r.submission) && r.submission.id !== s.id);
  const next = queue[0];
  const history = db().auditLogs.filter((l) => l.objectType === "Submission" && l.objectId === s.id).slice(0, 6);
  const overdueBy = s.submittedAt && new Date(s.submittedAt) > new Date(a.dueAt);

  return (
    <>
      <PageHeader
        back={{ href: "/academy/faculty/reviews", label: "Review queue" }}
        label={`${course.code} · ${module?.title ?? "Assignment"}`}
        title={a.title}
        actions={next ? <Link href={`/academy/faculty/reviews/${next.submission.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-[13px] font-medium hover:border-ink">Next in queue <Icon name="arrow" size={14} /></Link> : undefined}
      />

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <Panel>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar name={student.name} size={44} />
              <div className="min-w-0 flex-1">
                <Link href={`/academy/faculty/students/${student.id}`} className="text-[16px] font-semibold hover:text-blue">{student.name}</Link>
                <p className="truncate text-[13px] text-muted">{batch?.name}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <StatusPill status={s.status} />
                <Pill>{s.revision ? `Revision ${s.revision}` : "First submission"}</Pill>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
              {[
                ["Submitted", s.submittedAt ? formatDateTime(s.submittedAt) : "—"],
                ["Due", formatDateTime(a.dueAt)],
                ["Score", s.score !== null ? `${s.score} / ${a.maxScore}` : `— / ${a.maxScore}`],
              ].map(([k, v]) => (
                <div key={k} className="bg-white px-4 py-3">
                  <dt className="label !text-[9.5px]">{k}</dt>
                  <dd className="mt-1 text-[14px] font-medium tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            {overdueBy && <p className="mt-3 text-[13px] text-orange-800">Submitted after the due date.</p>}
          </Panel>

          <Panel title="Submission">
            {s.text ? <p className="whitespace-pre-wrap rounded-xl bg-mist px-4 py-4 text-[14.5px] leading-relaxed">{s.text}</p> : <p className="text-[14px] text-muted">No written answer — see attached files.</p>}
            <p className="label mt-6 !text-[10px]">Files</p>
            {files.length === 0 ? (
              <p className="mt-2 text-[14px] text-muted">No files attached.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {files.map((f) => (
                  <li key={f.storageKey} className="flex items-center gap-3 rounded-xl border border-line px-4 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-soft text-blue"><Icon name="file" size={16} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium">{f.name}</span>
                      <span className="block font-mono text-[11px] text-muted">{f.sizeKb} KB · link expires in 10 min</span>
                    </span>
                    {f.url ? (
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-4 text-[13px] font-medium hover:border-ink">
                        <Icon name="download" size={14} /> Open
                      </a>
                    ) : (
                      <Pill tone="warning">Storage not connected</Pill>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Assignment brief">
            <p className="text-[14.5px] leading-relaxed text-ink/85">{a.description}</p>
            {brief.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {brief.map((f) => (
                  <li key={f.storageKey}>
                    {f.url ? <a href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[13px] hover:border-ink"><Icon name="file" size={13} /> {f.label}</a> : <span className="text-[13px] text-muted">{f.label}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Review" label={s.reviewedBy ? `Last reviewed by ${userName(s.reviewedBy)}` : "Not reviewed yet"}>
            <ReviewForm submissionId={s.id} maxScore={a.maxScore} score={s.score} feedback={s.feedback} canApprove={s.score !== null && s.status !== "completed"} />
          </Panel>
          <Panel title="History">
            {history.length === 0 ? (
              <p className="text-[14px] text-muted">No review actions recorded yet.</p>
            ) : (
              <ol className="space-y-3">
                {history.map((h) => (
                  <li key={h.id} className="flex gap-3 text-[13.5px]">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue/40" aria-hidden="true" />
                    <span>
                      <span className="font-medium">{h.action.replace("submission.", "").replace(/[._]/g, " ")}</span>
                      {h.action === "grade.changed" && <span className="text-muted"> · {String(h.meta.from ?? "—")} → {String(h.meta.to ?? "—")}</span>}
                      <span className="block font-mono text-[11px] text-muted">{h.userName} · {relative(h.at)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
