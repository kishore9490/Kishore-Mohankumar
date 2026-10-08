"use client";
import Link from "next/link";
import { useActionState } from "react";
import { aiContentDraft, createContent, type FormState } from "@/server/actions/marketing";
import { Button } from "@/components/ui/Button";
import { Field, FormResult, fieldAria } from "./Field";
import { MARKETING_KINDS } from "./meta";

export function NewContentForm({ closeHref, defaultKind }: { closeHref: string; defaultKind?: string }) {
  const [state, create, creating] = useActionState<FormState, FormData>(createContent, { ok: false });
  const [ai, draft, drafting] = useActionState<FormState, FormData>(aiContentDraft, { ok: false });
  // Show whichever result is most recent; keep typed values across both.
  const latest = (ai.at ?? 0) > (state.at ?? 0) ? ai : state;
  const v = latest.values ?? {};
  const fe = latest.fieldErrors ?? {};
  const aiUsed = ai.ok && !!ai.draft;

  return (
    <form key={latest.at ?? 0} action={create} noValidate className="grid gap-4">
      <input type="hidden" name="aiAssisted" value={aiUsed ? "1" : "0"} />
      <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
        <Field id="kind" label="Type" error={fe.kind}>
          <select {...fieldAria("kind", fe.kind)} className="field" defaultValue={v.kind ?? defaultKind ?? "blog"}>
            {MARKETING_KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
          </select>
        </Field>
        <Field id="title" label="Working title" error={fe.title}>
          <input {...fieldAria("title", fe.title)} className="field" defaultValue={v.title ?? ""} maxLength={140} placeholder="e.g. 5 myths about medical coding careers" autoFocus />
        </Field>
      </div>

      {aiUsed && (
        <div className="rounded-xl border border-dashed border-cyan/50 bg-cyan/5 p-4">
          <p className="label !text-[10px] !text-cyan-ink">{ai.draftLabel ?? "AI draft — review before use"}</p>
          <p className="mt-2 max-h-72 overflow-y-auto whitespace-pre-wrap text-[14px] leading-relaxed">{ai.draft}</p>
          <p className="mt-2 text-[12px] text-muted">Saved items are marked AI-assisted and start as a draft that a person must review and approve.</p>
        </div>
      )}
      {!aiUsed && ai.at && ai.error && <p role="status" className="rounded-xl bg-mist px-4 py-3 text-[13.5px] text-muted">{ai.error}</p>}

      <FormResult state={state.at && latest === state ? state : null} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Link href={closeHref} className="inline-flex h-11 items-center justify-center rounded-full px-5 text-[14px] font-medium hover:bg-mist">Cancel</Link>
        <Button type="submit" formAction={draft} variant="outline" iconLeft="sparkle" disabled={drafting || creating}>{drafting ? "Drafting…" : "AI draft"}</Button>
        <Button type="submit" disabled={creating || drafting}>{creating ? "Saving…" : "Create draft"}</Button>
      </div>
    </form>
  );
}
