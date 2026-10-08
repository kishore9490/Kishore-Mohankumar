import { notFound } from "next/navigation";
import { requirePermission } from "@/server/auth/session";
import { studentAssignments, userName } from "@/server/repositories/learning";
import { storageProvider, UPLOAD_RULES } from "@/integrations/storage";
import { formatDateTime, relative } from "@/lib/platform/format";
import { Notice, PageHeader, Panel, Pill, StatusPill } from "@/components/academy/ui";
import { Icon } from "@/components/ui/Icon";
import { SubmissionForm } from "@/components/academy/student/SubmissionForm";
import { ASSIGNMENT_LABEL, CAN_SUBMIT } from "@/components/academy/student/assignmentStatus";
import type { SubmissionStatus } from "@/lib/platform/types";

async function signed(key: string) {
  try {
    return await storageProvider().signedUrl(key, { expiresInSec: 1800, download: true });
  } catch {
    return null;
  }
}

export default async function AssignmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("learning.access");
  const { id } = await params;
  const row = studentAssignments(user.id).find((r) => r.assignment.id === id);
  if (!row) notFound();
  const { assignment: a, course, module, submission: s } = row;
  const status: SubmissionStatus = s?.status ?? "not_started";
  const open = CAN_SUBMIT.includes(status);
  const overdue = open && new Date(a.dueAt).getTime() < Date.now();
  const attachments = await Promise.all(a.attachments.map(async (x) => ({ ...x, url: await signed(x.storageKey) })));
  const files = s ? await Promise.all(s.files.map(async (f) => ({ ...f, url: await signed(f.storageKey) }))) : [];

  return (
    <div className="space-y-5">
      <PageHeader
        back={{ href: "/academy/student/assignments", label: "Assignments" }}
        label={`${course.code} · ${module.title}`}
        title={a.title}
        actions={<div className="flex gap-2"><StatusPill status={status} label={ASSIGNMENT_LABEL[status]} />{overdue && <Pill tone="danger">Overdue</Pill>}</div>}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-5">
          <Panel title="Brief">
            <p className="text-[15px] leading-relaxed text-ink/85">{a.description}</p>
            {attachments.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {attachments.map((x) => (
                  <li key={x.storageKey}>
                    {x.url ? (
                      <a href={x.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-line px-3.5 text-[13px] hover:border-ink/40">
                        <Icon name="download" size={14} /> {x.label}
                      </a>
                    ) : <span className="text-[13px] text-muted">{x.label} (available once storage is connected)</span>}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {s?.feedback && (
            <Panel title="Faculty feedback" label={userName(s.reviewedBy)}>
              <blockquote className="border-l-[3px] border-cyan pl-4 text-[15px] leading-relaxed">{s.feedback}</blockquote>
            </Panel>
          )}

          {open ? (
            <Panel title={status === "returned" ? "Revise and resubmit" : "Your submission"}>
              <SubmissionForm assignmentId={a.id} initialText={s?.text ?? ""} rules={UPLOAD_RULES.submission} resubmission={status === "returned"} />
            </Panel>
          ) : (
            <Panel title="Your submission" label={s?.submittedAt ? `Submitted ${formatDateTime(s.submittedAt)}` : undefined}>
              {s?.text ? <p className="whitespace-pre-line text-[14.5px] leading-relaxed">{s.text}</p> : <p className="text-[14px] text-muted">No written answer.</p>}
              {files.length > 0 && (
                <ul className="mt-4 space-y-1.5">
                  {files.map((f) => (
                    <li key={f.storageKey} className="flex min-h-[44px] items-center gap-3 rounded-xl border border-line px-3 py-2 text-[13.5px]">
                      <Icon name="file" size={15} className="text-blue" />
                      <span className="min-w-0 flex-1 truncate">{f.name}</span>
                      <span className="font-mono text-[11px] text-muted">{f.sizeKb} KB</span>
                      {f.url && <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-medium text-blue hover:text-ink">Open</a>}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4"><Notice>{status === "completed" ? "This assignment is complete." : "Your faculty is reviewing this submission. You’ll get a notification when feedback is ready."}</Notice></div>
            </Panel>
          )}
        </div>

        <aside className="space-y-5">
          <Panel title="Details">
            <dl className="space-y-3.5 text-[14px]">
              <div><dt className="label !text-[9.5px]">Course</dt><dd className="mt-1">{course.title}</dd></div>
              <div><dt className="label !text-[9.5px]">Module</dt><dd className="mt-1">{module.title}</dd></div>
              <div><dt className="label !text-[9.5px]">Due</dt><dd className="mt-1">{formatDateTime(a.dueAt)} <span className="text-muted">· {relative(a.dueAt)}</span></dd></div>
              <div><dt className="label !text-[9.5px]">Score</dt><dd className="mt-1 text-[22px] font-semibold tabular-nums">{s?.score ?? "—"}<span className="text-[14px] font-normal text-muted"> / {a.maxScore}</span></dd></div>
              {s && s.revision > 0 && <div><dt className="label !text-[9.5px]">Revision</dt><dd className="mt-1">{s.revision}</dd></div>}
            </dl>
          </Panel>
          <p className="px-1 text-[12px] leading-relaxed text-muted">All records in assignments are fictional. Show your reasoning — faculty grade the process as well as the final code.</p>
        </aside>
      </div>
    </div>
  );
}
