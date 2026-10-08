"use client";
import { useActionState } from "react";
import { reviewSubmission, type FormState } from "@/server/actions/faculty";
import { Button } from "@/components/ui/Button";
import { Field, FormResult, errProps } from "./form";

export function ReviewForm({ submissionId, maxScore, score, feedback, canApprove }: { submissionId: string; maxScore: number; score: number | null; feedback: string | null; canApprove: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(reviewSubmission, null);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};
  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="submissionId" value={submissionId} />
      <Field id="rv-score" label={`Score (out of ${maxScore})`} hint="Required to grade. Half points allowed." error={fe.score}>
        <div className="flex items-center gap-3">
          <input id="rv-score" name="score" type="number" inputMode="decimal" min={0} max={maxScore} step={0.5} defaultValue={score ?? ""} className="field max-w-[140px] tabular-nums" {...errProps("rv-score", fe.score)} />
          <span className="font-mono text-[13px] text-muted">/ {maxScore}</span>
        </div>
      </Field>
      <Field id="rv-feedback" label="Feedback for the student" hint="Be specific: what worked, and what to check next time." error={fe.feedback}>
        <textarea id="rv-feedback" name="feedback" rows={5} maxLength={3000} defaultValue={feedback ?? ""} className="field resize-y" {...errProps("rv-feedback", fe.feedback)} />
      </Field>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="submit" name="intent" value="grade" disabled={pending} iconLeft="check">Grade & complete</Button>
        <Button type="submit" name="intent" value="revise" variant="outline" disabled={pending} iconLeft="refresh">Request revision</Button>
        <Button type="submit" name="intent" value="comment" variant="ghost" disabled={pending} iconLeft="message" className="border border-line">Comment only</Button>
        <Button type="submit" name="intent" value="approve" variant="ghost" disabled={pending || !canApprove} iconLeft="award" className="border border-line" title={canApprove ? undefined : "Grade first, then approve"}>Approve</Button>
      </div>
      <p className="text-[12.5px] text-muted">Every action notifies the student in the app and is recorded in the audit log.</p>
      <FormResult state={state} />
    </form>
  );
}
