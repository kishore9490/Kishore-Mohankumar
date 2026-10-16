"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Mail, MessageCircle, ExternalLink, AlertTriangle } from "lucide-react";
import { confirmWhatsAppSentAction, prepareManualWhatsAppAction, sendDocumentEmailAction, sendDocumentWhatsAppAction } from "@/app/actions/messaging";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Compose = { subject: string; body: string };
type Kind = "DOCUMENT" | "PAYMENT_REMINDER";

export function EmailDialog({ documentId, defaultTo, compose, kind, configured, mockMode, missing, label }: {
  documentId: string; defaultTo: string; compose: Compose; kind: Kind; configured: boolean; mockMode: boolean; missing: string[]; label: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(compose.subject);
  const [body, setBody] = useState(compose.body);
  const [attach, setAttach] = useState(true);
  const [pending, start] = useTransition();
  const send = () =>
    start(async () => {
      const res = await sendDocumentEmailAction({ documentId, to, subject, body, messageType: kind, attachPdf: attach });
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message);
      setOpen(false);
      router.refresh();
    });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}><Mail /> {label}</Button>
      <DialogContent title={label} description="Sent through Brevo transactional email with the PDF attached." wide>
        {!configured && !mockMode && (
          <div className="mb-4 flex gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900 ring-1 ring-amber-200">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>Email is not configured — missing <code>{missing.join(", ")}</code>. You can still download the PDF and send it yourself. An administrator can configure Brevo under Integrations.</span>
          </div>
        )}
        {mockMode && <div className="mb-4 rounded-lg bg-sky-50 px-3 py-2.5 text-sm text-sky-900 ring-1 ring-sky-200"><strong>Development mock mode:</strong> the email will be logged but not sent.</div>}
        <div className="grid gap-4">
          <Field label="Recipient" htmlFor="em-to" required><Input id="em-to" type="email" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
          <Field label="Subject" htmlFor="em-subject" required><Input id="em-subject" value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
          <Field label="Message" htmlFor="em-body" required><Textarea id="em-body" rows={9} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
          <Checkbox label="Attach the document PDF" checked={attach} onChange={(e) => setAttach(e.target.checked)} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={send} loading={pending} disabled={!configured && !mockMode}><Mail /> {mockMode ? "Log (mock)" : "Send email"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function WhatsAppDialog({ documentId, defaultTo, compose, kind, label, mode, apiActive, consent, hasTemplate, inWindow, linksEnabled }: {
  documentId: string; defaultTo: string; compose: Compose; kind: Kind; label: string;
  mode: "BUSINESS_APP" | "CLOUD_API"; apiActive: boolean; consent: boolean; hasTemplate: boolean; inWindow: boolean; linksEnabled: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(defaultTo);
  const [message, setMessage] = useState(compose.body);
  const [pendingLog, setPendingLog] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const sendApi = () =>
    start(async () => {
      const res = await sendDocumentWhatsAppAction({ documentId, to, message, messageType: kind });
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message);
      setOpen(false);
      router.refresh();
    });
  const openBusiness = () =>
    start(async () => {
      const res = await prepareManualWhatsAppAction({ documentId, to, message, messageType: kind });
      if (!res.ok) return void toast.error(res.error);
      if (!res.data!.linkIncluded) {
        const a = document.createElement("a");
        a.href = `/api/documents/${documentId}/pdf?download=1`;
        a.click();
      }
      if (res.data!.url.startsWith("whatsapp://")) window.location.href = res.data!.url;
      else window.open(res.data!.url, "_blank", "noopener,noreferrer");
      setPendingLog(res.data!.logId);
      router.refresh();
    });
  const confirmSent = () =>
    start(async () => {
      const res = await confirmWhatsAppSentAction(pendingLog!);
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message);
      setPendingLog(null);
      setOpen(false);
      router.refresh();
    });
  const businessMode = mode === "BUSINESS_APP" || !apiActive;
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setPendingLog(null); }}>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}><MessageCircle /> {label}</Button>
      <DialogContent title={label} description={businessMode ? "Opens your WhatsApp Business app with the message ready — you press Send." : "Sent automatically through the WhatsApp Business Cloud API."} wide>
        {pendingLog ? (
          <div className="otp-fade-up py-2 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><MessageCircle className="size-6" /></div>
            <h3 className="mt-3 font-display text-base font-bold">Did you send it in WhatsApp Business?</h3>
            <p className="mt-1 text-sm text-muted">Confirming marks this message as sent{kind === "DOCUMENT" ? " and updates the document status" : ""}.</p>
            <div className="mt-5 flex justify-center gap-2">
              <Button variant="outline" onClick={openBusiness} loading={pending}><ExternalLink /> Open chat again</Button>
              <Button onClick={confirmSent} loading={pending}>Yes, I sent it</Button>
            </div>
          </div>
        ) : (
          <>
            {businessMode ? (
              <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900 ring-1 ring-emerald-200">
                {linksEnabled ? "A secure, expiring link to the PDF is added to the message." : "The PDF will download so you can attach it in the chat (add a public app URL in Settings to send a secure link instead)."}
              </div>
            ) : (
              <>
                {!consent && <div className="mb-3 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900 ring-1 ring-amber-200">No WhatsApp opt-in is recorded for this customer. Automated sending is blocked until consent is recorded.</div>}
                {!hasTemplate && !inWindow && <div className="mb-3 rounded-lg bg-sky-50 px-3 py-2.5 text-sm text-sky-900 ring-1 ring-sky-200">The customer has not messaged in the last 24 hours and no approved template is selected — use WhatsApp Business instead, or choose a template in Settings.</div>}
              </>
            )}
            <div className="grid gap-4">
              <Field label="WhatsApp number" htmlFor="wa-to" hint="Include the country code, e.g. +91 98765 43210" required><Input id="wa-to" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
              <Field label="Message" htmlFor="wa-msg" required><Textarea id="wa-msg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} /></Field>
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              {businessMode ? (
                <Button onClick={openBusiness} loading={pending}><ExternalLink /> Open in WhatsApp Business</Button>
              ) : (
                <>
                  <Button variant="secondary" onClick={openBusiness} loading={pending}><ExternalLink /> Use WhatsApp Business instead</Button>
                  <Button onClick={sendApi} loading={pending} disabled={!consent || (!hasTemplate && !inWindow)}><MessageCircle /> Send automatically</Button>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
