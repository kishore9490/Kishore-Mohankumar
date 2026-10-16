"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Mail, AlertTriangle } from "lucide-react";
import { sendDocumentEmailAction } from "@/app/actions/messaging";
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
