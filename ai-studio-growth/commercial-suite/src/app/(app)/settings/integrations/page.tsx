import { CheckCircle2, CircleAlert, Mail, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { brevoStatus } from "@/lib/integrations/brevo";
import { whatsappStatus } from "@/lib/integrations/whatsapp";
import { publicAppUrl } from "@/lib/integrations/share-links";
import { DELIVERY_STATUS_META, TEMPLATE_PLACEHOLDERS } from "@/lib/integrations/messages";
import { formatDateTime } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrevoControls, TemplateEditor, WhatsAppControls } from "@/components/settings/integration-controls";

export const metadata = { title: "Integrations" };
export const dynamic = "force-dynamic";

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return ok ? <Badge tone="success"><CheckCircle2 className="size-3.5" /> {label}</Badge> : <Badge tone="warning"><CircleAlert className="size-3.5" /> {label}</Badge>;
}

function EnvTable({ rows }: { rows: [string, boolean, string][] }) {
  return (
    <table className="w-full text-[13px]">
      <tbody>
        {rows.map(([k, set, desc]) => (
          <tr key={k} className="border-b border-line last:border-0">
            <td className="py-2 pr-3 font-mono text-xs">{k}</td>
            <td className="py-2 pr-3">{set ? <span className="text-emerald-700">Set</span> : <span className="text-muted">Not set</span>}</td>
            <td className="py-2 text-muted">{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function IntegrationsPage() {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const brevo = brevoStatus();
  const wa = whatsappStatus();
  const [waCfg, templates, recent] = await Promise.all([
    prisma.integrationConfiguration.findUnique({ where: { provider: "whatsapp" } }),
    prisma.messageTemplate.findMany({ orderBy: [{ channel: "asc" }, { key: "asc" }] }),
    prisma.communicationLog.findMany({ where: { channel: { in: ["WHATSAPP", "EMAIL"] } }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  const waSettings = (waCfg?.settings ?? {}) as { documentTemplateName?: string; reminderTemplateName?: string; templateLanguage?: string; shareLinkHours?: number; lastTest?: { at: string; displayPhoneNumber?: string; verifiedName?: string } };
  const publicUrl = publicAppUrl();
  const env = (k: string) => !!process.env[k];

  return (
    <>
      <PageHeader title="Integration Settings" description="Secrets are configured as server environment variables and are never shown or sent to the browser. Missing credentials never block document creation." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title={<span className="flex items-center gap-2"><Mail className="size-4 text-brand-600" /> Brevo email</span>}
            description="Transactional email API for quotations, proposals, invoices and reminders."
            actions={<StatusPill ok={brevo.configured} label={brevo.configured ? (brevo.mode === "mock" ? "Configured · mock mode" : "Configured") : brevo.mode === "mock" ? "Dev mock mode" : "Not configured"} />}
          />
          <CardBody className="space-y-5">
            {!brevo.configured && (
              <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900 ring-1 ring-amber-200">
                Email sending is unavailable until <code>{brevo.missing.join(", ")}</code> {brevo.missing.length > 1 ? "are" : "is"} set. Documents can still be created and downloaded.
                {brevo.mode === "mock" && " Development mock mode is on: send attempts are logged as “Prepared” but nothing is sent."}
              </p>
            )}
            <dl className="grid grid-cols-[140px_1fr] gap-2 text-sm">
              <dt className="text-muted">Sender email</dt><dd>{brevo.senderEmail ?? "—"}</dd>
              <dt className="text-muted">Sender name</dt><dd>{brevo.senderName ?? "—"}</dd>
              <dt className="text-muted">Delivery mode</dt><dd>{brevo.mode === "mock" ? "Development mock (nothing is sent)" : "Live"}</dd>
            </dl>
            <EnvTable rows={[["BREVO_API_KEY", env("BREVO_API_KEY"), "API key (v3) — secret"], ["BREVO_SENDER_EMAIL", env("BREVO_SENDER_EMAIL"), "Verified sender address"], ["BREVO_SENDER_NAME", env("BREVO_SENDER_NAME"), "Display name"], ["BREVO_REPLY_TO", env("BREVO_REPLY_TO"), "Optional reply-to"], ["EMAIL_DELIVERY_MODE", env("EMAIL_DELIVERY_MODE"), "live (default) or mock — mock is ignored in production"]]} />
            {isAdmin && <BrevoControls configured={brevo.configured} />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={<span className="flex items-center gap-2"><MessageCircle className="size-4 text-emerald-600" /> WhatsApp Business (Cloud API)</span>}
            description="Official Meta WhatsApp Business Platform. Requires an approved business account, phone number and templates."
            actions={<StatusPill ok={wa.configured} label={wa.configured ? "Configured" : "Not configured"} />}
          />
          <CardBody className="space-y-5">
            {!wa.configured && (
              <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900 ring-1 ring-amber-200">
                API sending is unavailable until <code>{wa.missing.join(", ")}</code> {wa.missing.length > 1 ? "are" : "is"} set. The manual fallback (open WhatsApp with a prefilled message) remains available on each document; manual messages are never reported as delivered.
              </p>
            )}
            <dl className="grid grid-cols-[160px_1fr] gap-2 text-sm">
              <dt className="text-muted">Sender number</dt><dd>{waSettings.lastTest?.displayPhoneNumber ? `${waSettings.lastTest.displayPhoneNumber} (${waSettings.lastTest.verifiedName ?? ""})` : "Run a connection test to fetch"}</dd>
              <dt className="text-muted">Last connection test</dt><dd>{waSettings.lastTest ? formatDateTime(waSettings.lastTest.at) : "Never"}</dd>
              <dt className="text-muted">API version</dt><dd>{wa.apiVersion}</dd>
              <dt className="text-muted">Webhook</dt><dd>{wa.webhookConfigured ? "Verify token and app secret set" : "Not configured — delivery statuses will stay at “Sent to provider”"}</dd>
              <dt className="text-muted">Webhook URL</dt><dd className="break-all font-mono text-xs">{publicUrl ? `${publicUrl}/api/webhooks/whatsapp` : "Set PUBLIC_APP_URL (public HTTPS) to receive webhooks"}</dd>
              <dt className="text-muted">Secure document links</dt><dd>{publicUrl ? `Enabled (${publicUrl})` : "Disabled — localhost URLs cannot be fetched by WhatsApp"}</dd>
            </dl>
            <EnvTable rows={[
              ["WHATSAPP_ACCESS_TOKEN", env("WHATSAPP_ACCESS_TOKEN"), "System user access token — secret"],
              ["WHATSAPP_PHONE_NUMBER_ID", env("WHATSAPP_PHONE_NUMBER_ID"), "Sender phone number ID"],
              ["WHATSAPP_BUSINESS_ACCOUNT_ID", env("WHATSAPP_BUSINESS_ACCOUNT_ID"), "WABA ID (reference)"],
              ["WHATSAPP_API_VERSION", env("WHATSAPP_API_VERSION"), `Graph API version (default ${wa.apiVersion})`],
              ["WHATSAPP_WEBHOOK_VERIFY_TOKEN", env("WHATSAPP_WEBHOOK_VERIFY_TOKEN"), "Webhook verification token — secret"],
              ["WHATSAPP_APP_SECRET", env("WHATSAPP_APP_SECRET"), "App secret for signature validation — secret"],
              ["PUBLIC_APP_URL", env("PUBLIC_APP_URL"), "Public HTTPS base URL"],
            ]} />
            {isAdmin && <WhatsAppControls configured={wa.configured} settings={waSettings} />}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Message templates" description={`Reusable text for email and WhatsApp. Placeholders: ${TEMPLATE_PLACEHOLDERS.map((p) => `{{${p}}}`).join(" ")}`} />
        <CardBody className="grid gap-4 lg:grid-cols-2">
          {templates.map((t) => <TemplateEditor key={t.id} id={t.id} name={t.name} channel={t.channel} subject={t.subject} body={t.body} readOnly={!isAdmin} />)}
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Recent provider messages" />
        {recent.length === 0 ? <CardBody><p className="text-sm text-muted">No provider messages yet.</p></CardBody> : (
          <ul className="divide-y divide-line text-sm">
            {recent.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <span>{m.channel === "EMAIL" ? "Email" : "WhatsApp"} → {m.recipient} <span className="text-muted">· {formatDateTime(m.createdAt)}</span></span>
                <span className="flex items-center gap-2">{m.errorMessage && <span className="max-w-md truncate text-xs text-red-600">{m.errorMessage}</span>}<Badge tone={DELIVERY_STATUS_META[m.status].tone}>{DELIVERY_STATUS_META[m.status].label}</Badge></span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
