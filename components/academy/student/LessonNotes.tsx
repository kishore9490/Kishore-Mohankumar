"use client";
import { useActionState } from "react";
import { saveLessonNote, type ActionResult } from "@/server/actions/student";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "./FormMessage";

export function LessonNotes({ courseId, lessonId, initial, updatedLabel }: { courseId: string; lessonId: string; initial: string; updatedLabel: string | null }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveLessonNote, null);
  return (
    <form action={action} className="grid gap-2.5">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <label htmlFor="lesson-note" className="sr-only">My notes for this lesson</label>
      <textarea
        id="lesson-note"
        name="note"
        defaultValue={initial}
        maxLength={4000}
        rows={5}
        placeholder="Key terms, questions for class, codes to revisit…"
        className="field min-h-[120px] resize-y py-2.5 md:text-[14px] leading-relaxed"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11.5px] text-muted">{updatedLabel ? `Saved ${updatedLabel}` : "Private to you"}</p>
        <Button type="submit" size="sm" variant="outline" disabled={pending}>{pending ? "Saving…" : "Save note"}</Button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
