"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Copy, Download, MessageCircle, PlugZap, RefreshCw, Save, Send, Smartphone, Zap } from "lucide-react";
import {
  generateWhatsAppVerifyTokenAction, loadWhatsAppTemplatesAction, regenerateBrevoWebhookTokenAction, saveBrevoSettingsAction, saveGeneralSettingsAction,
  saveMessageTemplateAction, saveWhatsAppModeAction, saveWhatsAppSettingsAction, sendTestEmailAction, sendWhatsAppTestAction, testBrevoAction, testWhatsAppAction,
} from "@/app/actions/messaging";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/services/errors";

function useRun() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = <T,>(fn: () => Promise<ActionResult<T>>, after?: (r: ActionResult<T>) => void) =>
    start(async () => {
      const r = await fn();
      if (r.ok) toast.success(r.message ?? "Saved");
      else toast.error(r.error);
      after?.(r);
      router.refresh();
    });
  return { pending, run };
}

export function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div className="mb-1 text-[13px] font-medium text-ink">{label}</div>
      <button type="button" onClick={async () => { await navigator.clipboard.writeText(value).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        className="flex w-full items-center justify-between gap-2 rounded-lg bg-canvas px-3 py-2 text-left font-mono text-xs break-all text-ink ring-1 ring-line hover:ring-brand-300">
        <span>{value}</span>{copied ? <Check className="size-4 shrink-0 text-emerald-600" /> : <Copy className="size-4 shrink-0 text-muted" />}
      </button>
    </div>
  );
}

function SecretInput({ id, label, masked, value, onChange, clear, onClear, placeholder, hint }: { id: string; label: string; masked: string | null; value: string; onChange: (v: string) => void; clear: boolean; onClear: (v: boolean) => void; placeholder?: string; hint?: string }) {
  return (
    <Field label={label} htmlFor={id} hint={hint ?? (masked ? `Stored: ${masked}. Leave blank to keep it.` : "Not set yet.")}>
      <Input id={id} type="password" autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} placeholder={masked ? "•••••••• (unchanged)" : placeholder} disabled={clear} />
      {masked && <Checkbox className="mt-1.5" label="Remove stored value" checked={clear} onChange={(e) => onClear(e.target.checked)} />}
    </Field>
  );
}

export function GeneralForm({ publicUrl }: { publicUrl: string }) {
  const { pending, run } = useRun();
  const [url, setUrl] = useState(publicUrl);
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="Public app URL" htmlFor="public-url" className="min-w-72 flex-1" hint="The https address customers and providers can reach (e.g. https://quotes.yourdomain.com). Enables secure PDF links in WhatsApp and the webhooks.">
        <Input id="public-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://quotes.example.com" />
      </Field>
      <Button loading={pending} onClick={() => run(() => saveGeneralSettingsAction({ publicUrl: url }))}><Save /> Save</Button>
    </div>
  );
}

export function BrevoForm({ initial, apiKeyMasked, configured, webhookUrl }: { initial: { senderEmail: string; senderName: string; replyTo: string; deliveryMode: "live" | "mock" }; apiKeyMasked: string | null; configured: boolean; webhookUrl: string | null }) {
  const { pending, run } = useRun();
  const [v, setV] = useState(initial);
  const [apiKey, setApiKey] = useState("");
  const [clearKey, setClearKey] = useState(false);
  const [testTo, setTestTo] = useState("");
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <SecretInput id="brevo-key" label="Brevo API key (v3)" masked={apiKeyMasked} value={apiKey} onChange={setApiKey} clear={clearKey} onClear={setClearKey} placeholder="xkeysib-…" />
        <Field label="Delivery mode" htmlFor="brevo-mode" hint="Mock logs emails without sending (development only; ignored in production).">
          <Select id="brevo-mode" value={v.deliveryMode} onChange={(e) => setV({ ...v, deliveryMode: e.target.value as "live" | "mock" })}><option value="live">Live</option><option value="mock">Development mock</option></Select>
        </Field>
        <Field label="Sender email" htmlFor="brevo-sender" hint="Must be a verified sender in Brevo."><Input id="brevo-sender" type="email" value={v.senderEmail} onChange={(e) => setV({ ...v, senderEmail: e.target.value })} placeholder="quotes@yourdomain.com" /></Field>
        <Field label="Sender name" htmlFor="brevo-name"><Input id="brevo-name" value={v.senderName} onChange={(e) => setV({ ...v, senderName: e.target.value })} placeholder="Infinitia Hub × AI Studio Craft" /></Field>
        <Field label="Reply-to email (optional)" htmlFor="brevo-reply"><Input id="brevo-reply" type="email" value={v.replyTo} onChange={(e) => setV({ ...v, replyTo: e.target.value })} /></Field>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button loading={pending} onClick={() => run(() => saveBrevoSettingsAction({ ...v, apiKey: apiKey || undefined, clearApiKey: clearKey }), (r) => { if (r.ok) { setApiKey(""); setClearKey(false); } })}><Save /> Save email settings</Button>
        <Button variant="outline" disabled={!configured} loading={pending} onClick={() => run(testBrevoAction)}><PlugZap /> Test connection</Button>
      </div>
      <div className="flex flex-wrap items-end gap-2 border-t border-line pt-4">
        <Field label="Send a test email to" htmlFor="test-to" className="min-w-60 flex-1"><Input id="test-to" type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@company.com" disabled={!configured} /></Field>
        <Button variant="outline" disabled={!configured || !testTo} loading={pending} onClick={() => run(() => sendTestEmailAction(testTo))}><Send /> Send test</Button>
      </div>
      <div className="space-y-2 border-t border-line pt-4">
        <div className="text-[13px] text-muted">Delivery tracking: in Brevo → Transactional → Settings → Webhook, add this URL and tick <em>Delivered, Opened, Hard bounce, Blocked, Invalid, Error, Spam</em>.</div>
        {webhookUrl ? <CopyField label="Brevo webhook URL" value={webhookUrl} /> : <p className="text-[13px] text-amber-700">Set the public app URL above and generate a webhook URL.</p>}
        <Button size="sm" variant="ghost" loading={pending} onClick={() => run(regenerateBrevoWebhookTokenAction)}><RefreshCw /> {webhookUrl ? "Regenerate webhook URL" : "Generate webhook URL"}</Button>
      </div>
    </div>
  );
}

export function WhatsAppModeForm({ initial }: { initial: { mode: "BUSINESS_APP" | "CLOUD_API"; openWith: "desktop" | "web" | "phone"; businessNumber: string; defaultCountryCode: string; shareLinkHours: string } }) {
  const { pending, run } = useRun();
  const [v, setV] = useState(initial);
  const modes = [
    { key: "BUSINESS_APP" as const, icon: Smartphone, title: "WhatsApp Business app", badge: "Recommended", text: "Messages open in your WhatsApp Business app, ready to send — quotes, invoices and promotions. No Meta approval, templates or 24-hour rule." },
    { key: "CLOUD_API" as const, icon: Zap, title: "WhatsApp Cloud API (advanced)", badge: "Automated", text: "Fully automatic sending with delivery receipts. Needs a Meta-verified business, a dedicated number and approved templates." },
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2" role="radiogroup" aria-label="WhatsApp sending mode">
        {modes.map((m) => (
          <button key={m.key} type="button" role="radio" aria-checked={v.mode === m.key} onClick={() => setV({ ...v, mode: m.key })}
            className={cn("rounded-xl border p-4 text-left transition-colors", v.mode === m.key ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20" : "border-line hover:border-brand-300")}>
            <div className="flex items-center gap-2"><m.icon className="size-4 text-brand-600" /><span className="text-sm font-semibold text-ink">{m.title}</span><span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-brand-700 ring-1 ring-brand-200">{m.badge}</span></div>
            <p className="mt-1.5 text-[13px] text-muted">{m.text}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Open chats in" htmlFor="wa-open" hint="Where “Open in WhatsApp” takes you on this computer.">
          <Select id="wa-open" value={v.openWith} onChange={(e) => setV({ ...v, openWith: e.target.value as typeof v.openWith })}>
            <option value="desktop">WhatsApp Business desktop app (Windows/Mac)</option>
            <option value="web">WhatsApp Web in the browser</option>
            <option value="phone">wa.me link (phone / any device)</option>
          </Select>
        </Field>
        <Field label="Your WhatsApp Business number" htmlFor="wa-biz" hint="For reference on screen and in messages."><Input id="wa-biz" value={v.businessNumber} onChange={(e) => setV({ ...v, businessNumber: e.target.value })} placeholder="+91 81472 62999" /></Field>
        <Field label="Default country code" htmlFor="wa-cc" hint="Used for 10-digit customer numbers."><Input id="wa-cc" inputMode="numeric" value={v.defaultCountryCode} onChange={(e) => setV({ ...v, defaultCountryCode: e.target.value })} /></Field>
        <Field label="Secure PDF link validity (hours)" htmlFor="wa-hours" hint="Requires the public app URL."><Input id="wa-hours" inputMode="numeric" value={v.shareLinkHours} onChange={(e) => setV({ ...v, shareLinkHours: e.target.value })} /></Field>
      </div>
      <Button loading={pending} onClick={() => run(() => saveWhatsAppModeAction({ ...v, shareLinkHours: Number(v.shareLinkHours) }))}><Save /> Save WhatsApp settings</Button>
    </div>
  );
}

type Tpl = { name: string; language: string; status: string; hasDocumentHeader: boolean; bodyParams: number };

export function CloudApiForm({ initial, masked, configured, templates, webhookUrl }: {
  initial: { phoneNumberId: string; businessAccountId: string; apiVersion: string; documentTemplateName: string; reminderTemplateName: string; templateLanguage: string; testTemplateName: string; testTemplateLanguage: string };
  masked: { accessToken: string | null; appSecret: boolean; verifyToken: boolean };
  configured: boolean;
  templates: Tpl[];
  webhookUrl: string | null;
}) {
  const { pending, run } = useRun();
  const [v, setV] = useState(initial);
  const [accessToken, setAccessToken] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [clear, setClear] = useState<("accessToken" | "appSecret" | "verifyToken")[]>([]);
  const [verifyToken, setVerifyToken] = useState<string | null>(null);
  const [testTo, setTestTo] = useState("");
  const toggle = (k: (typeof clear)[number], on: boolean) => setClear((c) => (on ? [...c, k] : c.filter((x) => x !== k)));
  const approved = templates.filter((t) => t.status === "APPROVED");
  const tplSelect = (id: string, value: string, onChange: (v: string) => void, docOnly: boolean) =>
    approved.length ? (
      <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">None (24-hour window only)</option>
        {approved.filter((t) => !docOnly || t.hasDocumentHeader).map((t) => <option key={`${t.name}-${t.language}`} value={t.name}>{t.name} ({t.language}) · {t.bodyParams} variables</option>)}
      </Select>
    ) : (
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="template_name" />
    );
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <SecretInput id="wa-token" label="Access token (system user)" masked={masked.accessToken} value={accessToken} onChange={setAccessToken} clear={clear.includes("accessToken")} onClear={(b) => toggle("accessToken", b)} placeholder="EAAG…" />
        <Field label="Phone number ID" htmlFor="wa-pnid"><Input id="wa-pnid" value={v.phoneNumberId} onChange={(e) => setV({ ...v, phoneNumberId: e.target.value })} /></Field>
        <Field label="WhatsApp Business Account ID" htmlFor="wa-waba" hint="Needed to load approved templates."><Input id="wa-waba" value={v.businessAccountId} onChange={(e) => setV({ ...v, businessAccountId: e.target.value })} /></Field>
        <Field label="Graph API version" htmlFor="wa-ver"><Input id="wa-ver" value={v.apiVersion} onChange={(e) => setV({ ...v, apiVersion: e.target.value })} /></Field>
        <SecretInput id="wa-secret" label="App secret (webhook signatures)" masked={masked.appSecret ? "••••••••set" : null} value={appSecret} onChange={setAppSecret} clear={clear.includes("appSecret")} onClear={(b) => toggle("appSecret", b)} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button loading={pending} onClick={() => run(() => saveWhatsAppSettingsAction({ ...v, accessToken: accessToken || undefined, appSecret: appSecret || undefined, clear }), (r) => { if (r.ok) { setAccessToken(""); setAppSecret(""); setClear([]); } })}><Save /> Save Cloud API settings</Button>
        <Button variant="outline" disabled={!configured} loading={pending} onClick={() => run(testWhatsAppAction)}><PlugZap /> Test connection</Button>
        <Button variant="outline" disabled={!configured} loading={pending} onClick={() => run(loadWhatsAppTemplatesAction)}><Download /> Load approved templates</Button>
      </div>
      <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
        <Field label="Document template" htmlFor="wa-doc-t" hint="Approved template with a DOCUMENT header; variables filled with customer name, document number and amount.">{tplSelect("wa-doc-t", v.documentTemplateName, (x) => setV({ ...v, documentTemplateName: x }), true)}</Field>
        <Field label="Payment reminder template" htmlFor="wa-rem-t" hint="Falls back to the document template.">{tplSelect("wa-rem-t", v.reminderTemplateName, (x) => setV({ ...v, reminderTemplateName: x }), true)}</Field>
        <Field label="Template language (fallback)" htmlFor="wa-lang"><Input id="wa-lang" value={v.templateLanguage} onChange={(e) => setV({ ...v, templateLanguage: e.target.value })} /></Field>
      </div>
      <div className="flex flex-wrap items-end gap-2 border-t border-line pt-4">
        <Field label="Test template" htmlFor="wa-test-t" className="w-44"><Input id="wa-test-t" value={v.testTemplateName} onChange={(e) => setV({ ...v, testTemplateName: e.target.value })} /></Field>
        <Field label="Language" htmlFor="wa-test-l" className="w-24"><Input id="wa-test-l" value={v.testTemplateLanguage} onChange={(e) => setV({ ...v, testTemplateLanguage: e.target.value })} /></Field>
        <Field label="Send test to" htmlFor="wa-test-to" className="min-w-48 flex-1"><Input id="wa-test-to" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="+91 98765 43210" /></Field>
        <Button variant="outline" disabled={!configured || !testTo} loading={pending} onClick={() => run(() => sendWhatsAppTestAction(testTo))}><MessageCircle /> Send test</Button>
      </div>
      <div className="space-y-2 border-t border-line pt-4">
        <div className="text-[13px] text-muted">Webhook (delivery/read receipts and the 24-hour window): in the Meta developer console → WhatsApp → Configuration, use this callback URL and verify token, and subscribe to <em>messages</em>.</div>
        {webhookUrl ? <CopyField label="Callback URL" value={webhookUrl} /> : <p className="text-[13px] text-amber-700">Set the public app URL to get the callback URL.</p>}
        {verifyToken && <CopyField label="Verify token (shown once — copy it now)" value={verifyToken} />}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="ghost" loading={pending} onClick={() => run(generateWhatsAppVerifyTokenAction, (r) => r.ok && r.data && setVerifyToken(r.data.token))}><RefreshCw /> {masked.verifyToken ? "Regenerate verify token" : "Generate verify token"}</Button>
          <span className="text-xs text-muted">{masked.verifyToken ? "Verify token is set." : "No verify token yet."} {masked.appSecret ? "App secret is set." : "App secret missing — webhooks will be rejected."}</span>
        </div>
      </div>
    </div>
  );
}

export function TemplateEditor({ id, name, channel, subject, body, readOnly }: { id: string; name: string; channel: string; subject: string | null; body: string; readOnly: boolean }) {
  const { pending, run } = useRun();
  const [s, setS] = useState(subject ?? "");
  const [b, setB] = useState(body);
  return (
    <div className="rounded-xl border border-line p-4">
      <div className="mb-3 flex items-center justify-between"><span className="text-sm font-medium">{name}</span><span className="text-xs text-muted">{channel === "EMAIL" ? "Email" : "WhatsApp"}</span></div>
      {channel === "EMAIL" && <Field label="Subject" htmlFor={`s-${id}`}><Input id={`s-${id}`} value={s} onChange={(e) => setS(e.target.value)} disabled={readOnly} /></Field>}
      <Field label="Body" htmlFor={`b-${id}`} className="mt-3"><Textarea id={`b-${id}`} rows={channel === "EMAIL" ? 7 : 3} value={b} onChange={(e) => setB(e.target.value)} disabled={readOnly} /></Field>
      {!readOnly && <div className="mt-3 flex justify-end"><Button size="sm" variant="outline" loading={pending} onClick={() => run(() => saveMessageTemplateAction({ id, subject: s, body: b }))}>Save template</Button></div>}
    </div>
  );
}
