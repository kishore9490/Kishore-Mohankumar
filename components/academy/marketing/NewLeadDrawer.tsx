"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { createLead, type FormState } from "@/server/actions/marketing";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, FormResult, fieldAria } from "./Field";
import { LEAD_SOURCES } from "./meta";

export function NewLeadDrawer({
  closeHref,
  programs,
  campaigns,
  team,
  currentUserId,
}: {
  closeHref: string;
  programs: string[];
  campaigns: { id: string; name: string }[];
  team: { id: string; name: string }[];
  currentUserId: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(createLead, { ok: false });
  const router = useRouter();
  const first = useRef<HTMLInputElement>(null);
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};

  useEffect(() => {
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && router.push(closeHref, { scroll: false });
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [router, closeHref]);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="new-lead-title">
      <Link href={closeHref} scroll={false} className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" aria-label="Close" tabIndex={-1} />
      <div className="relative flex h-full w-full max-w-[520px] flex-col overflow-y-auto bg-white shadow-[0_30px_80px_-20px_rgba(7,26,51,.45)]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-white/95 px-5 py-4 backdrop-blur md:px-7 md:py-5">
          <div>
            <p className="label flex items-center gap-2 !text-[10.5px]"><span className="inline-block h-px w-4 bg-cyan" aria-hidden="true" />Lead management</p>
            <h2 id="new-lead-title" className="mt-1.5 text-[21px] font-semibold tracking-tight">New lead</h2>
          </div>
          <Link href={closeHref} scroll={false} className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted hover:border-ink hover:text-ink" aria-label="Close new lead form">
            <Icon name="close" size={16} />
          </Link>
        </div>
        <form key={state.at ?? 0} action={action} noValidate className="grid gap-4 px-5 py-5 md:px-7 md:py-6">
          <Field id="name" label="Full name" error={fe.name}>
            <input ref={first} {...fieldAria("name", fe.name)} defaultValue={v.name} className="field" autoComplete="off" required maxLength={120} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="phone" label="Mobile number" error={fe.phone} hint="10+ digits. Used to prevent duplicates.">
              <input {...fieldAria("phone", fe.phone, true)} defaultValue={v.phone} className="field" inputMode="tel" required maxLength={20} placeholder="+91 98xxxxxxxx" />
            </Field>
            <Field id="email" label="Email" error={fe.email} optional>
              <input {...fieldAria("email", fe.email)} defaultValue={v.email} type="email" className="field" maxLength={160} />
            </Field>
          </div>
          <Field id="programInterest" label="Program of interest" optional>
            <select {...fieldAria("programInterest")} defaultValue={v.programInterest ?? ""} className="field">
              <option value="">Not sure yet</option>
              {programs.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="source" label="Source" error={fe.source}>
              <select {...fieldAria("source", fe.source)} className="field" defaultValue={v.source ?? "walk_in"}>
                {LEAD_SOURCES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </Field>
            <Field id="campaignId" label="Campaign" error={fe.campaignId} optional>
              <select {...fieldAria("campaignId", fe.campaignId)} defaultValue={v.campaignId ?? ""} className="field">
                <option value="">None</option>
                {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <Field id="assignedTo" label="Assign to" error={fe.assignedTo}>
            <select {...fieldAria("assignedTo", fe.assignedTo)} className="field" defaultValue={v.assignedTo ?? currentUserId}>
              <option value="">Unassigned</option>
              {team.map((u) => <option key={u.id} value={u.id}>{u.name}{u.id === currentUserId ? " (me)" : ""}</option>)}
            </select>
          </Field>
          <Field id="note" label="Note" optional>
            <textarea {...fieldAria("note")} defaultValue={v.note} className="field min-h-[88px]" maxLength={500} placeholder="What did they ask about?" />
          </Field>
          <label className="flex min-h-[40px] items-center gap-3 rounded-xl border border-line px-3.5 py-2.5 text-[14px]">
            <input type="checkbox" name="whatsappOptIn" defaultChecked={v.whatsappOptIn === "on"} className="h-4 w-4 accent-[var(--color-blue)]" />
            <span>The lead agreed to receive WhatsApp messages</span>
          </label>
          <FormResult state={state.at ? state : null} />
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Link href={closeHref} scroll={false} className="inline-flex h-11 items-center justify-center rounded-full px-5 text-[14px] font-medium hover:bg-mist">Cancel</Link>
            <Button type="submit" icon="arrow" disabled={pending}>{pending ? "Saving…" : "Create lead"}</Button>
          </div>
          <p className="text-[12px] text-muted">The growth team is notified in-app. An acknowledgement goes to the lead only through approved templates and their opt-in.</p>
        </form>
      </div>
    </div>
  );
}
