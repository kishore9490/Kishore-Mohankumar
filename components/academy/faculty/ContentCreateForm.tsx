"use client";
import { useActionState, useEffect, useRef } from "react";
import { createContentItem, type FormState } from "@/server/actions/faculty";
import { Button } from "@/components/ui/Button";
import { Field, FormResult, errProps, selectCls } from "./form";
import { CONTENT_KINDS } from "./constants";


export function ContentCreateForm({ courses }: { courses: { id: string; label: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createContentItem, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};
  return (
    <form ref={ref} action={action} className="grid gap-4" noValidate>
      <Field id="cc-title" label="Title" error={fe.title}>
        <input id="cc-title" name="title" maxLength={140} className="field" placeholder="e.g. Lab case: COPD exacerbation" {...errProps("cc-title", fe.title)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <Field id="cc-kind" label="Kind" error={fe.kind}>
          <select id="cc-kind" name="kind" defaultValue="lesson" className={selectCls} {...errProps("cc-kind", fe.kind)}>
            {CONTENT_KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
          </select>
        </Field>
        <Field id="cc-course" label="Course" error={fe.courseId}>
          <select id="cc-course" name="courseId" defaultValue={courses[0]?.id ?? ""} className={selectCls} {...errProps("cc-course", fe.courseId)}>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
      </div>
      <Button type="submit" disabled={pending} iconLeft="plus">{pending ? "Creating…" : "Create draft"}</Button>
      <FormResult state={state} />
    </form>
  );
}
