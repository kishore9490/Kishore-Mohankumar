"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PlugZap, Send, Save } from "lucide-react";
import { saveMessageTemplateAction, saveWhatsAppSettingsAction, sendTestEmailAction, testBrevoAction, testWhatsAppAction } from "@/app/actions/messaging";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";

function useRun() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string; message?: string }>) =>
    start(async () => {
      const r = await fn();
      if (r.ok) toast.success(r.message ?? "Done");
      else toast.error(r.error ?? "Failed");
      router.refresh();
    });
  return { pending, run };
}

export function BrevoControls({ configured }: { configured: boolean }) {
  const { pending, run } = useRun();
  const [to, setTo] = useState("");
  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" disabled={!configured} loading={pending} onClick={() => run(testBrevoAction)}><PlugZap /> Test connection</Button>
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Send a test email to" htmlFor="test-to" className="min-w-60 flex-1"><Input id="test-to" type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="you@company.com" disabled={!configured} /></Field>
        <Button size="sm" disabled={!configured || !to} loading={pending} onClick={() => run(() => sendTestEmailAction(to))}><Send /> Send test</Button>
      </div>
    </div>
  );
}

export function WhatsAppControls({ configured, settings }: { configured: boolean; settings: { documentTemplateName?: string; reminderTemplateName?: string; templateLanguage?: string; shareLinkHours?: number } }) {
  const { pending, run } = useRun();
  const [v, setV] = useState({ documentTemplateName: settings.documentTemplateName ?? "", reminderTemplateName: settings.reminderTemplateName ?? "", templateLanguage: settings.templateLanguage ?? "en", shareLinkHours: String(settings.shareLinkHours ?? 72) });
  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" disabled={!configured} loading={pending} onClick={() => run(testWhatsAppAction)}><PlugZap /> Test connection</Button>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Document template name" htmlFor="wa-doc-t" hint="Approved template with a DOCUMENT header and 3 body variables (name, number, amount). Leave blank to send within the 24-hour window only.">
          <Input id="wa-doc-t" value={v.documentTemplateName} onChange={(e) => setV({ ...v, documentTemplateName: e.target.value })} placeholder="e.g. document_share" />
        </Field>
        <Field label="Payment reminder template name" htmlFor="wa-rem-t" hint="Falls back to the document template if blank.">
          <Input id="wa-rem-t" value={v.reminderTemplateName} onChange={(e) => setV({ ...v, reminderTemplateName: e.target.value })} placeholder="e.g. payment_reminder" />
        </Field>
        <Field label="Template language code" htmlFor="wa-lang"><Input id="wa-lang" value={v.templateLanguage} onChange={(e) => setV({ ...v, templateLanguage: e.target.value })} /></Field>
        <Field label="Secure link validity (hours)" htmlFor="wa-hours" hint="For manual WhatsApp links (requires PUBLIC_APP_URL)."><Input id="wa-hours" inputMode="numeric" value={v.shareLinkHours} onChange={(e) => setV({ ...v, shareLinkHours: e.target.value })} /></Field>
      </div>
      <Button size="sm" loading={pending} onClick={() => run(() => saveWhatsAppSettingsAction({ ...v, shareLinkHours: Number(v.shareLinkHours) }))}><Save /> Save WhatsApp settings</Button>
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
