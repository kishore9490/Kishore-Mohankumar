import { CheckCircle2, CircleAlert, Globe, Mail, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { brevoStatus, loadApp, loadBrevo, publicAppUrl, whatsappStatus } from "@/lib/integrations/config";
import { DELIVERY_STATUS_META } from "@/lib/integrations/messages";
import { formatDateTime } from "@/lib/dates";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrevoForm, CloudApiForm, GeneralForm, WhatsAppModeForm } from "@/components/settings/integration-controls";

export const metadata = { title: "Integrations" };
export const dynamic = "force-dynamic";

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return ok ? <Badge tone="success"><CheckCircle2 className="size-3.5" /> {label}</Badge> : <Badge tone="warning"><CircleAlert className="size-3.5" /> {label}</Badge>;
}

function LastTest({ test }: { test?: { at: string; ok: boolean; message: string } }) {
  if (!test) return <p className="text-xs text-muted">Not tested yet.</p>;
  return <p className={`text-xs ${test.ok ? "text-emerald-700" : "text-red-600"}`}>Last test {formatDateTime(test.at)}: {test.message}</p>;
}

export default async function IntegrationsPage() {
  await requireAdmin();
  const [app, brevo, brevoRaw, wa, publicUrl, recent] = await Promise.all([
    loadApp(),
    brevoStatus(),
    loadBrevo(),
    whatsappStatus(),
    publicAppUrl(),
    prisma.communicationLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  const s = wa.settings;
  const brevoWebhook = publicUrl && brevoRaw.secrets.webhookToken ? `${publicUrl}/api/webhooks/brevo?token=${brevoRaw.secrets.webhookToken}` : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={<span className="flex items-center gap-2"><Globe className="size-4 text-brand-600" /> General</span>} description="Credentials are stored encrypted (AES-256-GCM) and never shown again after saving." actions={<StatusPill ok={!!publicUrl} label={publicUrl ? "Public URL set" : "Local only"} />} />
        <CardBody><GeneralForm publicUrl={app.settings.publicUrl ?? ""} /></CardBody>
      </Card>

      <Card>
        <CardHeader
          title={<span className="flex items-center gap-2"><Mail className="size-4 text-brand-600" /> Email · Brevo</span>}
          description="Transactional email for quotations, proposals, invoices, payment reminders and staff invitations."
          actions={<StatusPill ok={brevo.configured} label={brevo.configured ? (brevo.mode === "mock" ? "Configured · mock mode" : "Connected") : brevo.mode === "mock" ? "Dev mock mode" : "Not configured"} />}
        />
        <CardBody className="space-y-3">
          <LastTest test={brevo.lastTest} />
          <BrevoForm
            initial={{ senderEmail: brevo.senderEmail ?? "", senderName: brevo.senderName ?? "", replyTo: brevo.replyTo ?? "", deliveryMode: brevoRaw.settings.deliveryMode === "mock" ? "mock" : "live" }}
            apiKeyMasked={brevo.apiKeyMasked}
            configured={brevo.configured}
            webhookUrl={brevoWebhook}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={<span className="flex items-center gap-2"><MessageCircle className="size-4 text-emerald-600" /> WhatsApp</span>}
          description="Send quotes, invoices, reminders and promotions over WhatsApp."
          actions={<StatusPill ok={wa.mode === "BUSINESS_APP" || wa.apiActive} label={wa.mode === "BUSINESS_APP" ? "WhatsApp Business app" : wa.apiActive ? "Cloud API connected" : "Cloud API not configured"} />}
        />
        <CardBody>
          <WhatsAppModeForm initial={{ mode: wa.mode, openWith: s.openWith ?? "desktop", businessNumber: s.businessNumber ?? "", defaultCountryCode: s.defaultCountryCode ?? "91", shareLinkHours: String(s.shareLinkHours ?? 72) }} />
        </CardBody>
      </Card>

      {wa.mode === "CLOUD_API" && (
        <Card>
          <CardHeader title="WhatsApp Cloud API credentials" description="From the Meta developer console (WhatsApp → API Setup) using a permanent system-user token." actions={<StatusPill ok={wa.configured} label={wa.configured ? "Credentials set" : `Missing ${wa.missing.join(", ")}`} />} />
          <CardBody className="space-y-3">
            <LastTest test={s.lastTest} />
            <CloudApiForm
              initial={{ phoneNumberId: s.phoneNumberId ?? "", businessAccountId: s.businessAccountId ?? "", apiVersion: wa.apiVersion, documentTemplateName: s.documentTemplateName ?? "", reminderTemplateName: s.reminderTemplateName ?? "", templateLanguage: s.templateLanguage ?? "en", testTemplateName: s.testTemplateName ?? "hello_world", testTemplateLanguage: s.testTemplateLanguage ?? "en_US" }}
              masked={{ accessToken: wa.accessTokenMasked, appSecret: wa.appSecretSet, verifyToken: wa.verifyTokenSet }}
              configured={wa.configured}
              templates={s.templates ?? []}
              webhookUrl={publicUrl ? `${publicUrl}/api/webhooks/whatsapp` : null}
            />
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Recent messages" />
        {recent.length === 0 ? <CardBody><p className="text-sm text-muted">No messages yet.</p></CardBody> : (
          <ul className="divide-y divide-line text-sm">
            {recent.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <span>{m.channel === "EMAIL" ? "Email" : m.channel === "WHATSAPP" ? "WhatsApp API" : "WhatsApp Business"} → {m.recipient} <span className="text-muted">· {formatDateTime(m.createdAt)}</span></span>
                <span className="flex items-center gap-2">{m.errorMessage && <span className="max-w-md truncate text-xs text-red-600">{m.errorMessage}</span>}<Badge tone={DELIVERY_STATUS_META[m.status].tone}>{DELIVERY_STATUS_META[m.status].label}</Badge></span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
