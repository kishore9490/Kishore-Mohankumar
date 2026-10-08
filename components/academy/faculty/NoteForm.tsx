"use client";
import { useActionState, useEffect, useRef } from "react";
import { saveFacultyNote, type FormState } from "@/server/actions/faculty";
import { Button } from "@/components/ui/Button";
import { Field, FormResult, errProps } from "./form";

export function NoteForm({ studentId }: { studentId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveFacultyNote, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  const err = state && !state.ok ? state.fieldErrors?.text : undefined;
  return (
    <form ref={ref} action={action} className="grid gap-3" noValidate>
      <input type="hidden" name="studentId" value={studentId} />
      <Field id="note-text" label="Add a private note" hint="Only you can see your notes. Avoid health or personal details." error={err}>
        <textarea id="note-text" name="text" rows={3} maxLength={2000} className="field resize-y" placeholder="e.g. Struggles with excludes notes — pair with a peer in Thursday’s clinic." {...errProps("note-text", err)} />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending} iconLeft="pen">{pending ? "Saving…" : "Save note"}</Button>
      </div>
      {state && !(state.ok === false && state.fieldErrors) && <FormResult state={state} />}
    </form>
  );
}
