"use client";
import { useActionState, useMemo, useState } from "react";
import type { LeadStatus } from "@/lib/platform/types";
import { assignLead, leadAISummary, logActivity, sendLeadMessage, setFollowUp, updateLeadStatus, type FormState } from "@/server/actions/marketing";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { Field, FormResult, compact, fieldAria } from "./Field";
import { LEAD_STATUSES, LOGGABLE_ACTIVITIES } from "./meta";
import { HighlightedText } from "./HighlightedText";

const initial: FormState = { ok: false };
const shown = (s: FormState) => (s.at ? s : null);

/* ---------------- status ---------------- */

export function StatusForm({ leadId, status, canEdit }: { leadId: string; status: LeadStatus; canEdit: boolean }) {
  const [state, action, pending] = useActionState(updateLeadStatus, initial);
  const suggested = (cur: LeadStatus): LeadStatus => {
    const i = LEAD_STATUSES.findIndex((x) => x.key === cur);
    return LEAD_STATUSES.find((s, j) => j > i && s.key !== "lost")?.key ?? (cur === "new" ? "contacted" : "new");
  };
  const [picked, setNext] = useState<LeadStatus>(suggested(status));
  const next = picked === status ? suggested(status) : picked;
  const fe = state.fieldErrors ?? {};
  if (!canEdit) return <p className="text-[13.5px] text-muted">You can view this lead but not change it.</p>;
  return (
    <form action={action} noValidate className="grid gap-3">
      <input type="hidden" name="leadId" value={leadId} />
      <Field id="status" label="Move to" error={fe.status}>
        <select {...fieldAria("status", fe.status)} className={compact} value={next} onChange={(e) => setNext(e.target.value as LeadStatus)}>
          {LEAD_STATUSES.map((s) => <option key={s.key} value={s.key} disabled={s.key === status}>{s.label}{s.key === status ? " (current)" : ""}</option>)}
        </select>
      </Field>
      {next === "lost" && (
        <Field id="reason" label="Reason lost" error={fe.reason}>
          <input {...fieldAria("reason", fe.reason)} className={compact} maxLength={200} placeholder="e.g. Chose another institute" list="lost-reasons" />
          <datalist id="lost-reasons">
            {["Chose another institute", "Not eligible yet", "Budget", "No response", "Timing"].map((r) => <option key={r} value={r} />)}
          </datalist>
        </Field>
      )}
      {next === "demo_booked" && (
        <Field id="classDate" label="Demo class (IST)" error={fe.classDate} hint="The lead gets an approved WhatsApp confirmation if they opted in.">
          <input {...fieldAria("classDate", fe.classDate, true)} type="datetime-local" className={compact} />
        </Field>
      )}
      {next === "converted" && <p className="rounded-lg bg-soft px-3 py-2 text-[12.5px]">Converting creates an admission record for the admissions team if one doesn’t exist.</p>}
      <FormResult state={shown(state)} />
      <Button type="submit" size="sm" disabled={pending} className="w-full sm:w-auto sm:justify-self-start">{pending ? "Updating…" : "Update status"}</Button>
    </form>
  );
}

/* ---------------- owner & follow-up ---------------- */

export function OwnerForm({ leadId, assignedTo, team, canEdit }: { leadId: string; assignedTo: string | null; team: { id: string; name: string }[]; canEdit: boolean }) {
  const [state, action, pending] = useActionState(assignLead, initial);
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="leadId" value={leadId} />
      <label htmlFor="assignedTo" className="text-[13px] font-medium">Owner</label>
      <div className="flex gap-2">
        <select id="assignedTo" name="assignedTo" defaultValue={assignedTo ?? ""} disabled={!canEdit} className={cn(compact, "flex-1")} aria-invalid={state.fieldErrors?.assignedTo ? true : undefined}>
          <option value="">Unassigned</option>
          {team.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        {canEdit && <Button type="submit" size="sm" variant="outline" disabled={pending} className="!h-10">Assign</Button>}
      </div>
      <FormResult state={shown(state.fieldErrors?.assignedTo ? { ok: false, error: state.fieldErrors.assignedTo } : state)} />
    </form>
  );
}

export function FollowUpForm({ leadId, value, canEdit }: { leadId: string; value: string; canEdit: boolean }) {
  const [state, action, pending] = useActionState(setFollowUp, initial);
  const err = state.fieldErrors?.nextFollowUpAt;
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="leadId" value={leadId} />
      <label htmlFor="nextFollowUpAt" className="text-[13px] font-medium">Next follow-up (IST)</label>
      <div className="flex gap-2">
        <input id="nextFollowUpAt" name="nextFollowUpAt" type="datetime-local" defaultValue={value} disabled={!canEdit} className={cn(compact, "min-w-0 flex-1")} aria-invalid={err ? true : undefined} aria-describedby={err ? "fu-error" : undefined} />
        {canEdit && <Button type="submit" size="sm" variant="outline" disabled={pending} className="!h-10">Set</Button>}
      </div>
      {err && <p id="fu-error" className="text-[12.5px] text-orange-800">{err}</p>}
      <FormResult state={err ? null : shown(state)} />
    </form>
  );
}

/* ---------------- log activity ---------------- */

export function ActivityForm({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState(logActivity, initial);
  const [type, setType] = useState("call");
  const fe = state.fieldErrors ?? {};
  return (
    <form key={state.ok ? state.at : "form"} action={action} noValidate className="grid gap-3">
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="type" value={type} />
      <fieldset>
        <legend className="mb-1.5 text-[13px] font-medium">Activity</legend>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Activity type">
          {LOGGABLE_ACTIVITIES.map((a) => (
            <button
              type="button"
              key={a.key}
              role="radio"
              aria-checked={type === a.key}
              onClick={() => setType(a.key)}
              className={cn("min-h-[36px] rounded-full border px-3 text-[13px] font-medium transition-colors", type === a.key ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40")}
            >
              {a.label}
            </button>
          ))}
        </div>
        {fe.type && <p className="mt-1.5 text-[12.5px] text-orange-800">{fe.type}</p>}
      </fieldset>
      <Field id="summary" label="Summary" error={fe.summary}>
        <textarea {...fieldAria("summary", fe.summary)} defaultValue={state.ok ? "" : state.values?.summary} className="field min-h-[84px] !text-[14px]" maxLength={500} placeholder="What happened, and what’s next?" />
      </Field>
      <FormResult state={shown(state)} />
      <Button type="submit" size="sm" disabled={pending} className="w-full sm:w-auto sm:justify-self-start">{pending ? "Saving…" : "Log activity"}</Button>
    </form>
  );
}

/* ---------------- send message ---------------- */

interface TemplateOption {
  id: string;
  name: string;
  channel: "email" | "whatsapp" | "sms" | "in_app";
  subject: string | null;
  content: string;
  blocked: string | null;
}

const render = (t: string, vars: Record<string, string>) => t.replace(/{{\s*(\w+)\s*}}/g, (m, k: string) => vars[k] ?? m);

export function SendMessagePanel({ leadId, templates, vars }: { leadId: string; templates: TemplateOption[]; vars: Record<string, string> }) {
  const [state, action, pending] = useActionState(sendLeadMessage, initial);
  const firstOk = templates.find((t) => !t.blocked)?.id ?? "";
  const [picked, setId] = useState(firstOk);
  // If the chosen template became unavailable (e.g. the lead moved on), fall back to one that can be sent.
  const id = templates.some((x) => x.id === picked && !x.blocked) ? picked : firstOk;
  const t = useMemo(() => templates.find((x) => x.id === id), [templates, id]);
  const fe = state.fieldErrors ?? {};
  if (!templates.length) return <p className="text-[13.5px] text-muted">No active marketing email or WhatsApp templates yet. Create one in Templates.</p>;
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="leadId" value={leadId} />
      <Field id="templateId" label="Template" error={fe.templateId}>
        <select {...fieldAria("templateId", fe.templateId)} className={compact} value={id} onChange={(e) => setId(e.target.value)}>
          {!firstOk && <option value="">No template can be sent to this lead</option>}
          {(["email", "whatsapp"] as const).map((ch) => (
            <optgroup key={ch} label={ch === "email" ? "Email" : "WhatsApp"}>
              {templates.filter((x) => x.channel === ch).map((x) => (
                <option key={x.id} value={x.id} disabled={!!x.blocked}>{x.name}{x.blocked ? ` — ${x.blocked}` : ""}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>
      {t && (
        <div className="rounded-xl border border-line bg-mist/60 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="label !text-[10px]">Preview · {t.channel === "email" ? "Email" : "WhatsApp"}</p>
            <Icon name={t.channel === "email" ? "mail" : "whatsapp"} size={15} className="text-muted" />
          </div>
          {t.subject && <p className="mt-2 text-[13.5px] font-semibold">{render(t.subject, vars)}</p>}
          <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed"><HighlightedText text={render(t.content, vars)} /></p>
        </div>
      )}
      {!firstOk && <p className="rounded-lg bg-mist px-3 py-2 text-[12.5px] text-muted">None of the templates can go to this lead yet. WhatsApp needs the lead’s opt-in and a provider-approved template; email needs an address. <a href="/academy/marketing/templates?new=1" className="font-medium text-blue">Create an email template</a></p>}
      <p className="flex items-center gap-1.5 text-[12px] text-muted"><Icon name="info" size={13} /> Simulated provider: nothing is actually sent.</p>
      <FormResult state={shown(state)} />
      <Button type="submit" size="sm" icon="arrow" disabled={pending || !t || !!t.blocked} className="w-full sm:w-auto sm:justify-self-start">{pending ? "Sending…" : "Send message"}</Button>
    </form>
  );
}

/* ---------------- AI summary ---------------- */

export function AISummary({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState(leadAISummary, initial);
  return (
    <div>
      <form action={action}>
        <input type="hidden" name="leadId" value={leadId} />
        <Button type="submit" variant="outline" size="sm" iconLeft="sparkle" disabled={pending}>{pending ? "Summarising…" : "AI summary"}</Button>
      </form>
      {state.at && state.ok && state.draft && (
        <div className="mt-3 rounded-xl border border-dashed border-cyan/50 bg-cyan/5 p-4">
          <p className="label !text-[10px] !text-cyan-ink">{state.draftLabel ?? "AI draft — review before use"}</p>
          <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed">{state.draft}</p>
        </div>
      )}
      {state.at && !state.ok && state.error && <p role="status" className="mt-3 rounded-xl bg-mist px-3.5 py-2.5 text-[13px] text-muted">{state.error}</p>}
    </div>
  );
}
