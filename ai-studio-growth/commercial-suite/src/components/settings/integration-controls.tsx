"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Copy, PlugZap, RefreshCw, Save, Send } from "lucide-react";
import {
  regenerateBrevoWebhookTokenAction, saveBrevoSettingsAction, saveGeneralSettingsAction, saveMessageTemplateAction, sendTestEmailAction, testBrevoAction,
} from "@/app/actions/messaging";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
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
      <Field label="Public app URL" htmlFor="public-url" className="min-w-72 flex-1" hint="The https address customers and providers can reach (e.g. https://quotes.yourdomain.com). Used for the Brevo webhook and links in emails.">
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
