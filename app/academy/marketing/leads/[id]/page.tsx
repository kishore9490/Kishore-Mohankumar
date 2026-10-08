import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/server/auth/session";
import { can } from "@/lib/platform/rbac";
import { db } from "@/server/db/store";
import { assignableUsers, campaignById, leadById, leadTimeline, leadVars, sendableTemplates, userName } from "@/server/repositories/growth";
import { formatDate, formatDateTime, relative } from "@/lib/platform/format";
import { Notice, PageHeader, Panel, Pill, StatusPill, humanize } from "@/components/academy/ui";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { ACTIVITY_ICON, ACTIVITY_LABEL, LEAD_STATUSES, channelLabel, commChannelIcon, commChannelLabel, leadStatusLabel, since, sourceLabel } from "@/components/academy/marketing/meta";
import { AISummary, ActivityForm, FollowUpForm, OwnerForm, SendMessagePanel, StatusForm } from "@/components/academy/marketing/LeadPanels";

export const metadata: Metadata = { title: "Lead · EMC Academy" };

const toLocalIST = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() + 330 * 60_000).toISOString().slice(0, 16) : "");
const STEPS = LEAD_STATUSES.filter((s) => s.key !== "lost");

export default async function LeadDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const user = await requirePermission("leads.view");
  const { id } = await params;
  const { created } = await searchParams;
  const lead = leadById(id);
  if (!lead) notFound();

  const canEdit = can(user, "leads.edit");
  const canSend = can(user, "communications.send");
  const timeline = leadTimeline(lead.id);
  const campaign = campaignById(lead.campaignId);
  const admission = db().admissions.find((a) => a.leadId === lead.id);
  const stepIndex = STEPS.findIndex((s) => s.key === lead.status);
  const lost = lead.status === "lost";
  const overdue = !!lead.nextFollowUpAt && new Date(lead.nextFollowUpAt).getTime() < Date.now() && !["converted", "lost"].includes(lead.status);

  return (
    <div className="space-y-5">
      <PageHeader
        back={{ href: "/academy/marketing/leads", label: "Leads" }}
        label={`Lead · ${sourceLabel(lead.source)}`}
        title={lead.name}
        intro={<>{lead.programInterest ?? "Program not specified"} · enquired {since(lead.createdAt)} · owner {lead.assignedTo === user.id ? "you" : userName(lead.assignedTo)}</>}
        actions={<StatusPill status={lead.status} label={leadStatusLabel(lead.status)} />}
      />

      {created && <Notice>Lead created. The growth team has been notified in-app.</Notice>}

      {/* Status stepper */}
      <section aria-label="Lead progress" className="rounded-2xl border border-line bg-white p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="label !text-[10.5px]">Journey</p>
          <p className="font-mono text-[11.5px] text-muted">{lost ? "Closed — lost" : `Step ${stepIndex + 1} of ${STEPS.length}`}</p>
        </div>
        <ol className="mt-4 flex gap-1.5">
          {STEPS.map((s, i) => {
            const done = !lost && i < stepIndex;
            const current = !lost && i === stepIndex;
            return (
              <li key={s.key} className="min-w-0 flex-1" aria-current={current ? "step" : undefined}>
                <span className={cn("block h-2 rounded-full", current ? (s.key === "converted" ? "bg-cyan" : "bg-blue") : done ? "bg-ink" : "bg-mist")} />
                <span className={cn("mt-2 hidden truncate text-[12px] md:block", current ? "font-semibold text-ink" : done ? "text-ink/75" : "text-muted")}>{s.label}</span>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-[13.5px] md:hidden"><span className="font-semibold">{leadStatusLabel(lead.status)}</span>{!lost && stepIndex < STEPS.length - 1 && <span className="text-muted"> · next: {STEPS[stepIndex + 1].label}</span>}</p>
        {lost && <p className="mt-4 rounded-xl bg-orange-50 px-4 py-3 text-[13.5px] text-orange-900"><span className="font-semibold">Lost:</span> {lead.lostReason ?? "No reason recorded"}</p>}
        {admission && <p className="mt-4 flex items-center gap-2 rounded-xl bg-soft px-4 py-3 text-[13.5px]"><Icon name="flag" size={15} className="text-blue" /> Admission record exists — stage <span className="font-semibold">{humanize(admission.stage)}</span>.</p>}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        {/* Side column (first on phones) */}
        <div className="space-y-5 lg:col-start-2 lg:row-start-1">
          <Panel title="Contact" label="Visible to the growth team only">
            <dl className="grid gap-3 text-[14px]">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soft text-blue"><Icon name="phone" size={15} /></span>
                <div className="min-w-0"><dt className="sr-only">Phone</dt><dd><a href={`tel:${lead.phone.replace(/\s/g, "")}`} className="font-mono text-[14px] hover:text-blue">{lead.phone}</a></dd></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soft text-blue"><Icon name="mail" size={15} /></span>
                <div className="min-w-0"><dt className="sr-only">Email</dt><dd className="truncate">{lead.email ? <a href={`mailto:${lead.email}`} className="hover:text-blue">{lead.email}</a> : <span className="text-muted">No email</span>}</dd></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soft text-blue"><Icon name="whatsapp" size={15} /></span>
                <div><dt className="sr-only">WhatsApp</dt><dd>{lead.whatsappOptIn ? <Pill tone="success" dot>WhatsApp opt-in</Pill> : <Pill>No WhatsApp opt-in</Pill>}</dd></div>
              </div>
            </dl>
            <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line text-[13.5px]">
              {[
                ["Program", lead.programInterest ?? "—"],
                ["Education", lead.education ?? "—"],
                ["Source", sourceLabel(lead.source)],
                ["Campaign", campaign ? `${campaign.name} (${channelLabel(campaign.channel)})` : "—"],
                ["Created", formatDate(lead.createdAt)],
                ["Last contact", lead.lastContactAt ? since(lead.lastContactAt) : "Never"],
              ].map(([k, v]) => (
                <div key={k} className="min-w-0 bg-white px-3 py-2.5">
                  <dt className="label !text-[9.5px]">{k}</dt>
                  <dd className="mt-1 line-clamp-2 break-words">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel title="Manage" label="Status, owner & follow-up">
            <div className="grid gap-5">
              <StatusForm leadId={lead.id} status={lead.status} canEdit={canEdit} />
              <div className="h-px bg-line" />
              <OwnerForm leadId={lead.id} assignedTo={lead.assignedTo} team={assignableUsers().map((u) => ({ id: u.id, name: u.name }))} canEdit={canEdit} />
              <FollowUpForm leadId={lead.id} value={toLocalIST(lead.nextFollowUpAt)} canEdit={canEdit} />
              {lead.nextFollowUpAt && <p className={cn("-mt-3 font-mono text-[11.5px]", overdue ? "text-orange-800" : "text-muted")}>{overdue ? "Overdue — " : ""}{formatDateTime(lead.nextFollowUpAt)} ({relative(lead.nextFollowUpAt)})</p>}
            </div>
          </Panel>

          {canSend && (
            <Panel title="Send message" label="Email or WhatsApp">
              <SendMessagePanel
                leadId={lead.id}
                vars={leadVars(lead)}
                templates={sendableTemplates(lead).map((t) => ({ id: t.id, name: t.name, channel: t.channel, subject: t.subject, content: t.content, blocked: t.blocked }))}
              />
            </Panel>
          )}

          <Panel title="AI summary" label="Assistant">
            <p className="mb-3 text-[13px] text-muted">A short brief from this lead’s history. Contact details are never sent to the AI. Always review before acting.</p>
            <AISummary leadId={lead.id} />
          </Panel>
        </div>

        {/* Main column */}
        <div className="space-y-5 lg:col-start-1 lg:row-start-1">
          {canEdit && (
            <Panel title="Log activity" label="Calls, notes & meetings">
              <ActivityForm leadId={lead.id} />
            </Panel>
          )}

          <Panel title="Activity timeline" label={`${timeline.length} event${timeline.length === 1 ? "" : "s"}`}>
            {timeline.length === 0 ? (
              <p className="rounded-xl bg-mist px-4 py-5 text-[14px] text-muted">No activity yet. Log the first call above.</p>
            ) : (
              <ol className="relative">
                {timeline.map((t, i) => {
                  const icon = t.kind === "activity" ? ACTIVITY_ICON[t.type] : commChannelIcon(t.channel);
                  const isMsg = t.kind === "message";
                  return (
                    <li key={t.id} className="relative flex gap-4 pb-5 last:pb-0">
                      {i < timeline.length - 1 && <span className="absolute bottom-0 left-[17px] top-10 w-px bg-line" aria-hidden="true" />}
                      <span className={cn("relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border", isMsg ? "border-cyan/30 bg-cyan/10 text-cyan-ink" : t.type === "status" ? "border-ink bg-ink text-white" : "border-line bg-white text-blue")}>
                        <Icon name={icon} size={15} />
                      </span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="text-[13px] font-semibold">
                            {t.kind === "activity" ? ACTIVITY_LABEL[t.type] : `${commChannelLabel(t.channel)} message`}
                          </p>
                          {isMsg && <StatusPill status={t.status} />}
                          <span className="font-mono text-[11px] text-muted">{formatDateTime(t.at)}</span>
                        </div>
                        <p className="mt-1 break-words text-[14px] leading-relaxed text-ink/85">{t.kind === "activity" ? t.summary : t.preview}</p>
                        <p className="mt-1 text-[12px] text-muted">
                          {t.kind === "activity"
                            ? t.by ?? "System"
                            : [t.template ?? "No template", t.event && t.event !== "manual" ? `event ${t.event}` : t.event === "manual" ? "sent manually" : null, t.provider === "simulated" ? "simulated provider" : t.provider && t.provider !== "—" ? t.provider : null].filter(Boolean).join(" · ")}
                        </p>
                        {isMsg && t.error && <p className="mt-1.5 rounded-lg bg-orange-50 px-2.5 py-1.5 text-[12.5px] text-orange-900">{t.status === "skipped" ? "Skipped" : "Failed"}: {t.error}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
