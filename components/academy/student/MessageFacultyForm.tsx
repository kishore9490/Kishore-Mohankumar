"use client";
import { useActionState, useEffect, useRef } from "react";
import { messageFaculty, type ActionResult } from "@/server/actions/student";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "./FormMessage";

export function MessageFacultyForm({ faculty }: { faculty: { id: string; name: string; title: string | null }[] }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(messageFaculty, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="grid gap-4">
      <div>
        <label htmlFor="msg-to" className="mb-1.5 block text-[13px] font-medium">To</label>
        <select id="msg-to" name="facultyId" className="field md:text-[14px]" defaultValue={faculty.length === 1 ? faculty[0].id : "all"}>
          {faculty.length > 1 && <option value="all">All my batch faculty</option>}
          {faculty.map((f) => <option key={f.id} value={f.id}>{f.name}{f.title ? ` — ${f.title}` : ""}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="msg-subject" className="mb-1.5 block text-[13px] font-medium">Subject</label>
        <input id="msg-subject" name="subject" required minLength={3} maxLength={120} className="field md:text-[14px]" placeholder="e.g. Question about Excludes1 notes" />
      </div>
      <div>
        <label htmlFor="msg-body" className="mb-1.5 block text-[13px] font-medium">Message</label>
        <textarea id="msg-body" name="body" required minLength={10} maxLength={2000} rows={5} className="field min-h-[130px] resize-y leading-relaxed md:text-[14px]" placeholder="Write your question. Don’t include real patient information." />
      </div>
      <FormMessage state={state} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-muted">Delivered in-app. Faculty usually reply within one working day.</p>
        <Button type="submit" icon="arrow" disabled={pending} className="w-full sm:w-auto">{pending ? "Sending…" : "Send message"}</Button>
      </div>
    </form>
  );
}
