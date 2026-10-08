"use client";
import { useActionState, useEffect, useRef } from "react";
import { publishAnnouncement, type FormState } from "@/server/actions/faculty";
import { Button } from "@/components/ui/Button";
import { Field, FormResult, errProps, selectCls } from "./form";

export function AnnouncementForm({ batches, allCount }: { batches: { id: string; label: string; students: number }[]; allCount: number }) {
  const [state, action, pending] = useActionState<FormState, FormData>(publishAnnouncement, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};
  return (
    <form ref={ref} action={action} className="grid gap-4" noValidate>
      <Field id="an-audience" label="Send to" error={fe.audience}>
        <select id="an-audience" name="audience" defaultValue="all" className={selectCls} {...errProps("an-audience", fe.audience)}>
          <option value="all">All my students ({allCount})</option>
          {batches.map((b) => <option key={b.id} value={b.id}>{b.label} ({b.students})</option>)}
        </select>
      </Field>
      <Field id="an-title" label="Headline" error={fe.title}>
        <input id="an-title" name="title" maxLength={120} className="field" placeholder="e.g. Case clinic moved to Thursday" {...errProps("an-title", fe.title)} />
      </Field>
      <Field id="an-body" label="Message" hint="Students see this in the app and in their notifications." error={fe.body}>
        <textarea id="an-body" name="body" rows={5} maxLength={1500} className="field resize-y" {...errProps("an-body", fe.body)} />
      </Field>
      <Button type="submit" disabled={pending} iconLeft="megaphone">{pending ? "Publishing…" : "Publish announcement"}</Button>
      <FormResult state={state} />
    </form>
  );
}
