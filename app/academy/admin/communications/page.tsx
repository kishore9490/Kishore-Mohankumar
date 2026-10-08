import Link from "next/link";
import { requirePermission } from "@/server/auth/session";
import { communicationsOverview } from "@/server/repositories/admin";
import { formatDateTime, relative } from "@/lib/platform/format";
import { DataTable, EmptyState, PageHeader, Panel, Pill, StatusPill, TextLink, humanize } from "@/components/academy/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { CommChannel } from "@/lib/platform/types";

export const metadata = { title: "Communications · EMC Academy" };

const CHANNEL: Record<CommChannel, { label: string; icon: IconName }> = {
  email: { label: "Email", icon: "mail" },
  whatsapp: { label: "WhatsApp", icon: "whatsapp" },
  sms: { label: "SMS", icon: "phone" },
  in_app: { label: "In-app", icon: "bell" },
};

const STEPS = [
  ["Something happens", "Business code emits a domain event — a student enrols, a payment is overdue, a certificate is issued. It never calls a provider directly."],
  ["Templates are matched", "The engine finds every active template linked to that event, on each channel."],
  ["Recipients are chosen", "Only the people the event is about — students, staff or the lead — and only active accounts."],
  ["Preferences are respected", "Each person’s channel choices are honoured. Marketing is opt-in; WhatsApp needs opt-in and an approved template. Security notices always go."],
  ["Delivered and recorded", "In-app notices appear instantly. Email, WhatsApp and SMS go out in the background with retries, and every attempt is logged here."],
];

export default async function AdminCommunicationsPage() {
  const user = await requirePermission("communications.view");
  const ov = communicationsOverview();
  const total = ov.byChannel.reduce((s, c) => s + c.total, 0);

  return (
    <>
      <PageHeader
        label="Growth · Communications"
        title="Communication layer."
        intro="One record for every message on every channel. See what was delivered, what failed and which events send which templates."
        actions={user.permissions.includes("templates.manage") ? <TextLink href="/academy/marketing/templates">Manage templates</TextLink> : undefined}
      />
      <div className="space-y-5">
        <section aria-label="Delivery by channel" className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
          {ov.byChannel.map((c) => {
            const rate = c.total ? Math.round((c.delivered / c.total) * 100) : 0;
            return (
              <div key={c.channel} className="bg-white p-5">
                <p className="label flex items-center gap-2 !text-[10.5px]"><Icon name={CHANNEL[c.channel].icon} size={14} />{CHANNEL[c.channel].label}</p>
                <p className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.03em] tabular-nums">{c.total}</p>
                <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-mist" role="img" aria-label={`${c.delivered} delivered, ${c.skipped} skipped, ${c.failed} failed`}>
                  <span className="bg-cyan" style={{ width: `${c.total ? (c.delivered / c.total) * 100 : 0}%` }} />
                  <span className="bg-line" style={{ width: `${c.total ? (c.skipped / c.total) * 100 : 0}%` }} />
                  <span className="bg-orange-500" style={{ width: `${c.total ? (c.failed / c.total) * 100 : 0}%` }} />
                </div>
                <p className="mt-2 text-[12.5px] text-muted">{c.total ? `${rate}% delivered` : "No messages yet"}{c.failed ? ` · ${c.failed} failed` : ""}{c.skipped ? ` · ${c.skipped} skipped` : ""}</p>
              </div>
            );
          })}
        </section>

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Panel id="failed" title="Failed messages" label="Needs follow-up" action={<Pill tone={ov.failed.length ? "danger" : "success"}>{ov.failed.length}</Pill>}>
            {ov.failed.length === 0 ? (
              <EmptyState icon="check" title="No failures" text="Every message was delivered or deliberately skipped." />
            ) : (
              <ul className="space-y-2">
                {ov.failed.map(({ c, recipient, template }, i) => (
                  <li key={`${c.id}-${i}`} className="rounded-xl border border-orange-200 bg-orange-50/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 text-[14.5px] font-medium">{recipient}</p>
                      <span className="shrink-0 font-mono text-[11px] text-muted">{relative(c.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-muted">{CHANNEL[c.channel].label} · {template ?? "No template"} · {c.event ?? "manual"}</p>
                    <p className="mt-2 flex items-start gap-1.5 text-[13px] text-orange-900"><Icon name="alert" size={14} className="mt-0.5 shrink-0" />{c.error ?? "Delivery failed"}</p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-[12.5px] text-muted">{ov.skipped} message{ov.skipped === 1 ? " was" : "s were"} skipped on purpose — usually no WhatsApp opt-in or a template awaiting approval.</p>
          </Panel>

          <Panel title="Templates" label="Library">
            <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line text-center">
              {[["Total", ov.templates.total], ["Active", ov.templates.active], ["Awaiting approval", ov.templates.pendingApproval]].map(([k, v]) => (
                <div key={k} className="bg-white px-2 py-3">
                  <dt className="label !text-[9.5px]">{k}</dt>
                  <dd className="mt-1 text-[20px] font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[13.5px] text-muted">Templates are written and approved by the growth team. WhatsApp templates also need provider approval before they can be sent.</p>
            <div className="mt-3"><TextLink href="/academy/marketing/templates">Open templates</TextLink></div>
          </Panel>
        </div>

        <Panel title="Event → template map" label="What triggers what" pad={false}>
          <ul className="grid divide-y divide-line border-t border-line md:grid-cols-2 md:divide-y-0">
            {ov.eventMap.map(({ event, templates }, i) => (
              <li key={event} className={`flex flex-col gap-2 px-5 py-3.5 md:px-6 ${i % 2 === 0 ? "md:border-r" : ""} border-line md:border-b`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[13px]">{event}</span>
                  {templates.length === 0 && <Pill>No template yet</Pill>}
                </div>
                {templates.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5">
                    {templates.map((t) => (
                      <li key={t.id} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-mist/60 px-2.5 py-1 text-[12px]">
                        <Icon name={CHANNEL[t.channel].icon} size={12} className="text-blue" />
                        {t.name}
                        {t.approval === "pending" && <span className="text-amber-800">· pending</span>}
                        {t.status !== "active" && <span className="text-muted">· {t.status}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </Panel>

        <section aria-labelledby="recent-h">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id="recent-h" className="text-[17px] font-semibold tracking-tight">Recent communications</h2>
            <span className="text-[12.5px] text-muted">{total} recorded in total</span>
          </div>
          <DataTable
            caption="Recent communications"
            rows={ov.recent}
            rowKey={(r) => `${r.c.id}:${r.c.createdAt}:${r.c.channel}:${r.c.templateId}`}
            empty={<EmptyState icon="message" title="No messages yet" text="Messages appear here as soon as the notification engine sends them." />}
            columns={[
              { key: "to", label: "Recipient", mobile: "primary", render: (r) => <span className="block min-w-0"><span className="block truncate">{r.recipient}</span><span className="block truncate text-[12px] text-muted">{r.c.preview}</span></span>, className: "max-w-[340px]" },
              { key: "channel", label: "Channel", render: (r) => <span className="inline-flex items-center gap-1.5"><Icon name={CHANNEL[r.c.channel].icon} size={14} className="text-muted" />{CHANNEL[r.c.channel].label}</span> },
              { key: "event", label: "Event", mobile: "hide", render: (r) => <span className="font-mono text-[12px] text-muted">{r.c.event ?? "manual"}</span> },
              { key: "provider", label: "Provider", mobile: "hide", className: "hidden xl:table-cell", render: (r) => <span className="text-muted">{humanize(r.c.provider || "—")}</span> },
              { key: "status", label: "Status", render: (r) => <StatusPill status={r.c.status} /> },
              { key: "at", label: "When", render: (r) => <span className="font-mono text-[12px] text-muted">{formatDateTime(r.c.createdAt)}</span> },
            ]}
          />
        </section>

        <Panel title="How the notification engine works" label="In plain words">
          <ol className="grid gap-4 md:grid-cols-5">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="relative">
                <span className="font-mono text-[12px] text-cyan-ink">0{i + 1}</span>
                <p className="mt-1 text-[14.5px] font-semibold">{title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-[13px] text-muted">Providers are configured in <Link href="/academy/admin/integrations" className="font-medium text-blue hover:text-ink">Integrations</Link>. In demo mode every external channel is simulated — nothing is actually sent.</p>
        </Panel>
      </div>
    </>
  );
}
