"use client";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import type { MessageTemplate } from "@/lib/platform/types";
import { saveTemplate, type FormState } from "@/server/actions/marketing";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { Field, FormResult, fieldAria } from "./Field";
import { HighlightedText } from "./HighlightedText";
import { COMM_CHANNELS, NOTIFICATION_CATEGORIES, TEMPLATE_EVENTS, TEMPLATE_VARS, extractVars } from "./meta";

const SAMPLE: Record<string, string> = {
  student_name: "Ananya", lead_name: "Meghna", course_name: "Medical Coding Career Program", batch_name: "October batch",
  class_title: "ICD-10-CM conventions", class_date: "12 Oct, 6:00 pm", faculty_name: "Dr. Kavya Menon", assignment_title: "Case write-up",
  due_date: "15 Oct", payment_amount: "₹15,000", certificate_id: "EMC-2026-XXXXXX", verify_url: "emc.example/verify", lead_source: "website", reset_url: "emc.example/reset",
};

export function TemplateEditor({ template, closeHref }: { template: MessageTemplate | null; closeHref: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveTemplate, { ok: false });
  const v = state.values ?? {};
  const fe = state.fieldErrors ?? {};
  const [channel, setChannel] = useState(v.channel ?? template?.channel ?? "email");
  const [subject, setSubject] = useState(v.subject ?? template?.subject ?? "");
  const [content, setContent] = useState(v.content ?? template?.content ?? "");
  const [sample, setSample] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  const used = extractVars(`${subject} ${content}`);
  const unknown = used.filter((x) => !(TEMPLATE_VARS as readonly string[]).includes(x));

  const insert = (name: string) => {
    const el = area.current;
    const token = `{{${name}}}`;
    if (!el) return setContent((c) => c + token);
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = content.slice(0, start) + token + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  };
  const fill = (t: string) => (sample ? t.replace(/{{\s*(\w+)\s*}}/g, (m, k: string) => SAMPLE[k] ?? m) : t);

  return (
    <form key={state.at ?? 0} action={action} noValidate className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
      {template && <input type="hidden" name="id" value={template.id} />}
      <div className="grid content-start gap-4">
        <Field id="name" label="Template name" error={fe.name}>
          <input {...fieldAria("name", fe.name)} className="field" defaultValue={v.name ?? template?.name ?? ""} maxLength={80} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="channel" label="Channel" error={fe.channel}>
            <select {...fieldAria("channel", fe.channel)} className="field" value={channel} onChange={(e) => setChannel(e.target.value as MessageTemplate["channel"])}>
              {COMM_CHANNELS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </Field>
          <Field id="category" label="Category" error={fe.category}>
            <select {...fieldAria("category", fe.category)} className="field" defaultValue={v.category ?? template?.category ?? "marketing"}>
              {NOTIFICATION_CATEGORIES.map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="event" label="Sent automatically on" error={fe.event} optional>
            <select {...fieldAria("event", fe.event)} className="field" defaultValue={v.event ?? template?.event ?? ""}>
              <option value="">Manual use only</option>
              {template?.event && !(TEMPLATE_EVENTS as readonly string[]).includes(template.event) && <option value={template.event}>{template.event}</option>}
              {TEMPLATE_EVENTS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </Field>
          <Field id="status" label="Status">
            <select {...fieldAria("status")} className="field" defaultValue={v.status ?? template?.status ?? "draft"}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
        </div>
        <Field id="purpose" label="Purpose" optional>
          <input {...fieldAria("purpose")} className="field" defaultValue={v.purpose ?? template?.purpose ?? ""} maxLength={160} placeholder="e.g. Invite a lead to the demo week" />
        </Field>
        {channel === "email" && (
          <Field id="subject" label="Subject" error={fe.subject}>
            <input {...fieldAria("subject", fe.subject)} className="field" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={160} />
          </Field>
        )}
        <Field id="content" label="Message" error={fe.content} hint={`${content.length}/2000 characters`}>
          <textarea ref={area} {...fieldAria("content", fe.content, true)} className="field min-h-[150px]" value={content} onChange={(e) => setContent(e.target.value)} maxLength={2000} />
        </Field>
        <div>
          <p className="mb-1.5 text-[13px] font-medium">Insert a variable</p>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATE_VARS.map((name) => (
              <button key={name} type="button" onClick={() => insert(name)} className={cn("min-h-[32px] rounded-full border px-2.5 font-mono text-[11.5px] transition-colors", used.includes(name) ? "border-cyan/40 bg-cyan/10 text-cyan-ink" : "border-line bg-white hover:border-ink/40")}>
                {`{{${name}}}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid content-start gap-4">
        <div className="rounded-2xl border border-line bg-mist/60 p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="label !text-[10px]">Live preview · {COMM_CHANNELS.find((c) => c.key === channel)?.label}</p>
            <label className="flex items-center gap-2 text-[12.5px] text-muted">
              <input type="checkbox" checked={sample} onChange={(e) => setSample(e.target.checked)} className="h-4 w-4 accent-[var(--color-blue)]" /> Sample data
            </label>
          </div>
          <div className={cn("mt-4 rounded-xl bg-white p-4 shadow-[0_10px_30px_-20px_rgba(7,26,51,.35)]", channel === "whatsapp" && "rounded-tl-sm border-l-4 border-emerald-400")}>
            {channel === "email" && <p className="border-b border-line pb-2 text-[14px] font-semibold">{subject ? <HighlightedText text={fill(subject)} known={TEMPLATE_VARS} /> : <span className="text-muted">No subject</span>}</p>}
            <p className={cn("whitespace-pre-wrap break-words text-[14px] leading-relaxed", channel === "email" && "pt-2")}>
              {content ? <HighlightedText text={fill(content)} known={TEMPLATE_VARS} /> : <span className="text-muted">Start typing to see the message.</span>}
            </p>
          </div>
          <p className="mt-3 text-[12px] text-muted">Highlighted variables are filled in for each recipient when the message is sent.</p>
        </div>

        {unknown.length > 0 && (
          <p role="alert" className="flex gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-[13.5px] text-orange-900">
            <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
            <span>Unknown variable{unknown.length > 1 ? "s" : ""}: {unknown.map((u) => `{{${u}}}`).join(", ")}. Use one from the list — unknown variables can’t be filled in.</span>
          </p>
        )}

        {channel === "whatsapp" ? (
          <div className="rounded-xl bg-soft px-4 py-3 text-[13.5px]">
            <p className="font-semibold">WhatsApp approval</p>
            <p className="mt-1 text-muted">WhatsApp only allows pre-approved templates for business messages. Saving a new or changed WhatsApp template sets it to <span className="font-medium text-ink">pending</span>; approval happens with the WhatsApp provider (Meta / BSP). It can’t be sent to leads until approved.</p>
            {template?.channel === "whatsapp" && <p className="mt-2 font-mono text-[11.5px]">Current: {template.approval}</p>}
          </div>
        ) : null}

        <FormResult state={state.at ? state : null} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link href={closeHref} className="inline-flex h-11 items-center justify-center rounded-full px-5 text-[14px] font-medium hover:bg-mist">Cancel</Link>
          <Button type="submit" disabled={pending || unknown.length > 0}>{pending ? "Saving…" : template ? "Save template" : "Create template"}</Button>
        </div>
      </div>
    </form>
  );
}
