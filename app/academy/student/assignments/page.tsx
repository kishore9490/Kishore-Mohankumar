import Link from "next/link";
import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/session";
import { studentAssignments, userName } from "@/server/repositories/learning";
import { storageProvider } from "@/integrations/storage";
import { formatDateTime, relative } from "@/lib/platform/format";
import { EmptyState, PageHeader, Pill, StatusPill, Tabs } from "@/components/academy/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { SubmissionStatus } from "@/lib/platform/types";
import { ASSIGNMENT_LABEL, ASSIGNMENT_STATUSES as STATUSES, CAN_SUBMIT } from "@/components/academy/student/assignmentStatus";

export const metadata: Metadata = { title: "Assignments · EMC Academy" };

async function signed(key: string) {
  try {
    return await storageProvider().signedUrl(key, { expiresInSec: 1800, download: true });
  } catch {
    return null;
  }
}

export default async function AssignmentsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requirePermission("learning.access");
  const { status = "all" } = await searchParams;
  const all = studentAssignments(user.id).map((r) => ({ ...r, status: (r.submission?.status ?? "not_started") as SubmissionStatus }));
  const current = status === "all" || STATUSES.some((s) => s.key === status) ? status : "all";
  const rows = current === "all" ? all : all.filter((r) => r.status === current);
  const withLinks = await Promise.all(rows.map(async (r) => ({ ...r, links: await Promise.all(r.assignment.attachments.map(async (x) => ({ ...x, url: await signed(x.storageKey) }))) })));

  return (
    <div className="space-y-5">
      <PageHeader label="Work" title="Assignments" intro="Submit your work, follow its review and read faculty feedback." />
      <Tabs
        current={current}
        items={[
          { key: "all", label: "All", href: "/academy/student/assignments", count: all.length },
          ...STATUSES.map((s) => ({ key: s.key, label: s.label, href: `/academy/student/assignments?status=${s.key}`, count: all.filter((r) => r.status === s.key).length })),
        ]}
      />

      {withLinks.length === 0 ? (
        <EmptyState
          icon="clipboard"
          title={current === "all" ? "No assignments yet" : `Nothing ${ASSIGNMENT_LABEL[current as SubmissionStatus]?.toLowerCase() ?? "here"}`}
          text={current === "all" ? "Assignments created by your faculty will appear here." : "Try another filter to see the rest of your assignments."}
          action={current !== "all" ? <ButtonLink href="/academy/student/assignments" variant="outline" size="sm">Show all</ButtonLink> : undefined}
        />
      ) : (
        <ul className="grid gap-3">
          {withLinks.map(({ assignment: a, course, module, submission, status: st, links }) => {
            const overdue = CAN_SUBMIT.includes(st) && new Date(a.dueAt).getTime() < Date.now();
            return (
              <li key={a.id} className="rounded-2xl border border-line bg-white">
                <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:p-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={st} label={ASSIGNMENT_LABEL[st]} />
                      {overdue && <Pill tone="danger">Overdue</Pill>}
                      <span className="font-mono text-[11px] text-muted">{course.code}</span>
                    </div>
                    <Link href={`/academy/student/assignments/${a.id}`} className="mt-2 block text-[17px] font-semibold tracking-tight hover:text-blue">{a.title}</Link>
                    <p className="mt-0.5 text-[13px] text-muted">{course.title} · {module.title}</p>
                  </div>
                  <div className="flex items-start gap-6 md:text-right">
                    <div>
                      <p className="label !text-[9.5px]">Due</p>
                      <p className="mt-1 text-[13.5px] font-medium">{formatDateTime(a.dueAt)}</p>
                      <p className="text-[12px] text-muted">{relative(a.dueAt)}</p>
                    </div>
                    <div>
                      <p className="label !text-[9.5px]">Score</p>
                      <p className="mt-1 text-[20px] font-semibold tabular-nums leading-none">{submission?.score != null ? submission.score : "—"}<span className="text-[13px] font-normal text-muted">/{a.maxScore}</span></p>
                    </div>
                  </div>
                </div>
                {(submission?.feedback || links.length > 0) && (
                  <div className="grid gap-3 border-t border-line px-5 py-4 md:grid-cols-[1fr_auto] md:items-center md:px-6">
                    {submission?.feedback ? (
                      <p className="flex gap-2.5 text-[13.5px] leading-relaxed">
                        <Icon name="message" size={15} className="mt-0.5 shrink-0 text-blue" />
                        <span><span className="font-medium">{userName(submission.reviewedBy)}:</span> <span className="text-ink/80">“{submission.feedback}”</span></span>
                      </p>
                    ) : <span className="hidden md:block" />}
                    <div className="flex flex-wrap items-center gap-2">
                      {links.map((l) => l.url ? (
                        <a key={l.storageKey} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-line px-3 text-[12.5px] hover:border-ink/40">
                          <Icon name="download" size={13} /> {l.label}
                        </a>
                      ) : <span key={l.storageKey} className="text-[12.5px] text-muted">{l.label}</span>)}
                      <ButtonLink href={`/academy/student/assignments/${a.id}`} size="sm" variant={CAN_SUBMIT.includes(st) ? "primary" : "ghost"}>
                        {st === "returned" ? "Revise" : ["not_started", "in_progress"].includes(st) ? "Open & submit" : "View"}
                      </ButtonLink>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
