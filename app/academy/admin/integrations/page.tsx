import { requirePermission } from "@/server/auth/session";
import { integrationsOverview, providerKeys } from "@/server/repositories/admin";
import { testIntegration } from "@/server/actions/admin";
import { formatDateTime, relative } from "@/lib/platform/format";
import { DataTable, EmptyState, Notice, PageHeader, Panel, StatusPill, humanize } from "@/components/academy/ui";
import { ActionButton } from "@/components/academy/admin/forms";
import { seen } from "@/components/academy/admin/bits";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { IntegrationCategory } from "@/lib/platform/types";

export const metadata = { title: "Integrations · EMC Academy" };

const CATEGORIES: { key: IntegrationCategory; label: string; icon: IconName; intro: string }[] = [
  { key: "communication", label: "Communication", icon: "message", intro: "Email, WhatsApp Business and SMS — used only through the notification engine." },
  { key: "ai", label: "AI", icon: "sparkle", intro: "Optional drafting and tutoring help. Off until a provider is configured." },
  { key: "payments", label: "Payments", icon: "wallet", intro: "Online fee collection. No gateway is integrated until configured." },
  { key: "storage", label: "Storage", icon: "layers", intro: "Lesson files, videos, submissions and certificates." },
  { key: "analytics", label: "Analytics", icon: "chart", intro: "Platform events for funnels and learning insight." },
  { key: "authentication", label: "Authentication", icon: "lock", intro: "How people sign in and how sessions are protected." },
];

const STATUS_LABEL: Record<string, string> = { simulated: "Simulated", connected: "Connected", not_configured: "Not configured", error: "Error" };

const WEBHOOKS = [
  { path: "/api/webhooks/whatsapp", source: "whatsapp", purpose: "Delivery and read receipts for WhatsApp messages." },
  { path: "/api/webhooks/payments", source: "payments", purpose: "Payment confirmations from the gateway (inactive until configured)." },
];

export default async function IntegrationsPage() {
  await requirePermission("integrations.manage");
  const ov = integrationsOverview();
  const keys = providerKeys();

  return (
    <>
      <PageHeader
        label="Platform · Integrations"
        title="Integrations."
        intro="Every external service sits behind an adapter. Business code never talks to a provider directly, and credentials live only in server environment variables — this page shows their names, never their values."
      />
      <div className="space-y-5">
        <Notice>“Test connection” runs a safe configuration check. It never sends a message, charges a card or calls a model, and every test is written to the audit log.</Notice>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {CATEGORIES.flatMap((cat) =>
            ov.statuses.filter((x) => x.status.category === cat.key).map(({ status: s, env, lastTest }) => (
                  <article key={s.key} id={s.key} className="flex min-w-0 scroll-mt-24 flex-col rounded-2xl border border-line bg-white p-5">
                    <p className="label flex items-center gap-1.5 !text-[10px]"><Icon name={cat.icon} size={13} className="text-blue" />{cat.label}</p>
                    <div className="mt-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[15.5px] font-semibold">{s.label}</h3>
                        <p className="mt-0.5 truncate text-[13px] text-muted">{s.provider}</p>
                      </div>
                      <StatusPill status={s.status} label={STATUS_LABEL[s.status]} />
                    </div>
                    {env && (
                      <div className="mt-4">
                        <p className="label !text-[9.5px]">Configuration</p>
                        {env.selector && (
                          <p className="mt-1.5 text-[12.5px] text-muted">
                            Choose with <code className="code-chip rounded bg-mist px-1.5 py-0.5 text-ink">{env.selector}</code> · now <span className="font-mono text-ink">{keys[s.key]}</span>
                          </p>
                        )}
                        <details className="mt-2 group">
                          <summary className="cursor-pointer list-none text-[12.5px] font-medium text-blue hover:text-ink">
                            <span className="group-open:hidden">Show required variables ({env.options.length} provider{env.options.length === 1 ? "" : "s"})</span>
                            <span className="hidden group-open:inline">Hide variables</span>
                          </summary>
                          <ul className="mt-2 space-y-2">
                            {env.options.map((o) => (
                              <li key={o.provider}>
                                <p className="text-[12.5px] font-medium">{o.provider}</p>
                                <p className="mt-1 flex flex-wrap gap-1">
                                  {o.env.length ? o.env.map((e) => <code key={e} className="code-chip rounded-md border border-line bg-mist px-1.5 py-0.5 !text-[10.5px]">{e}</code>) : <span className="text-[12px] text-muted">No settings needed</span>}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </details>
                        <p className="mt-3 text-[12.5px] leading-relaxed text-muted">{env.note}</p>
                      </div>
                    )}
                    <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-dashed border-line pt-3 text-[12.5px]">
                      <div className="min-w-0"><dt className="label !text-[9px]">Last success</dt><dd className="mt-0.5 truncate font-mono">{s.lastSuccessAt ? seen(s.lastSuccessAt) : "—"}</dd></div>
                      <div className="min-w-0"><dt className="label !text-[9px]">Last error</dt><dd className={`mt-0.5 truncate ${s.lastError ? "text-orange-800" : "font-mono"}`} title={s.lastError ?? undefined}>{s.lastError ?? "—"}</dd></div>
                      <div className="col-span-2 min-w-0"><dt className="label !text-[9px]">Last test</dt><dd className="mt-0.5 truncate font-mono">{lastTest ? `${relative(lastTest.at)} · ${String(lastTest.meta.result ?? lastTest.result)}` : "Never tested"}</dd></div>
                    </dl>
                    <div className="mt-auto pt-4">
                      <ActionButton action={testIntegration} fields={{ key: s.key }} label="Test connection" icon="refresh" />
                    </div>
                  </article>
            )),
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <Panel title="Webhook endpoints" label="Inbound">
            <ul className="space-y-3">
              {WEBHOOKS.map((w) => (
                <li key={w.path} className="rounded-xl border border-line p-4">
                  <p className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-ink px-1.5 py-0.5 font-mono text-[10.5px] text-white">POST</span><code className="font-mono text-[13px]">{w.path}</code></p>
                  <p className="mt-1.5 text-[13px] text-muted">{w.purpose}</p>
                </li>
              ))}
            </ul>
            <ul className="mt-4 space-y-2 text-[13px] text-muted">
              <li className="flex gap-2"><Icon name="shield" size={14} className="mt-0.5 shrink-0 text-blue" /><span><span className="font-medium text-ink">Signature first.</span> Every request is verified with the provider’s HMAC signature before it is read; unsigned requests are rejected and logged.</span></li>
              <li className="flex gap-2"><Icon name="refresh" size={14} className="mt-0.5 shrink-0 text-blue" /><span><span className="font-medium text-ink">Idempotent.</span> Providers retry, so each event id is processed once; repeats are acknowledged as duplicates.</span></li>
              <li className="flex gap-2"><Icon name="activity" size={14} className="mt-0.5 shrink-0 text-blue" /><span><span className="font-medium text-ink">Logged.</span> Every delivery is recorded below with its outcome.</span></li>
            </ul>
          </Panel>
          <section aria-labelledby="whk-h" className="min-w-0">
            <h2 id="whk-h" className="mb-3 text-[17px] font-semibold tracking-tight">Recent webhook events</h2>
            <DataTable
              caption="Recent webhook events"
              rows={ov.webhooks}
              rowKey={(w) => w.id}
              empty={<EmptyState icon="plug" title="No webhook events yet" text="Provider callbacks appear here once a provider is connected." />}
              columns={[
                { key: "source", label: "Source", mobile: "primary", render: (w) => <span className="font-medium">{humanize(w.source)} <span className="font-mono text-[12px] font-normal text-muted">{w.type}</span></span> },
                { key: "status", label: "Result", render: (w) => <StatusPill status={w.status} /> },
                { key: "note", label: "Note", render: (w) => <span className="text-muted">{w.note ?? "—"}</span> },
                { key: "at", label: "Received", render: (w) => <span className="font-mono text-[12px] text-muted">{formatDateTime(w.receivedAt)}</span> },
              ]}
            />
          </section>
        </div>

        <section aria-labelledby="ai-h">
          <h2 id="ai-h" className="mb-1 text-[17px] font-semibold tracking-tight">Recent AI requests</h2>
          <p className="mb-3 text-[13.5px] text-muted">Purpose, provider and outcome only — prompts and outputs are never stored here.</p>
          <DataTable
            caption="Recent AI requests"
            rows={ov.ai}
            rowKey={(r) => r.id}
            empty={<EmptyState icon="sparkle" title="No AI requests yet" text="AI is off until a provider is configured. Requests will be listed here without their content." />}
            columns={[
              { key: "purpose", label: "Purpose", mobile: "primary", render: (r) => <span className="font-mono text-[13px]">{r.purpose}</span> },
              { key: "user", label: "Requested by", render: (r) => r.user },
              { key: "provider", label: "Provider", render: (r) => <span className="text-muted">{r.provider}</span> },
              { key: "status", label: "Status", render: (r) => <StatusPill status={r.status} /> },
              { key: "at", label: "When", render: (r) => <span className="font-mono text-[12px] text-muted">{relative(r.createdAt)}</span> },
            ]}
          />
        </section>
      </div>
    </>
  );
}
