"use client";
import { useActionState } from "react";
import { askLessonAssistant } from "@/server/actions/student";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type State = { ok: true; text: string; label: string } | { ok: false; error: string } | null;

/** AI learning assistant scoped to the current lesson. Educational only. */
export function LessonAssistant({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const [state, action, pending] = useActionState<State, FormData>(askLessonAssistant, null);
  return (
    <div>
      <form action={action} className="grid gap-2.5">
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="lessonId" value={lessonId} />
        <label htmlFor="ai-prompt" className="text-[13px] font-medium">Ask about this lesson</label>
        <textarea
          id="ai-prompt"
          name="prompt"
          rows={3}
          maxLength={1000}
          required
          placeholder="e.g. Explain the difference between the Index and the Tabular List in simple words."
          className="field min-h-[84px] resize-y py-2.5 md:text-[14px] leading-relaxed"
        />
        <Button type="submit" size="sm" iconLeft="sparkle" disabled={pending}>{pending ? "Thinking…" : "Ask the assistant"}</Button>
      </form>
      <div aria-live="polite" className="mt-3">
        {state?.ok === true && (
          <div className="rounded-xl border border-line bg-mist/60 p-3.5">
            <p className="label !text-[9.5px]">{state.label}</p>
            <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed">{state.text}</p>
          </div>
        )}
        {state?.ok === false && (
          <p className="flex gap-2 rounded-xl bg-soft px-3.5 py-3 text-[13.5px] text-ink">
            <Icon name="info" size={15} className="mt-0.5 shrink-0 text-blue" /> {state.error}
          </p>
        )}
      </div>
      <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
        Educational help only — not medical advice and not an authoritative coding decision. Always check official guidelines and ask your faculty.
      </p>
    </div>
  );
}
