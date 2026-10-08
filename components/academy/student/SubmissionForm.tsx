"use client";
import { useActionState, useId, useState } from "react";
import { submitAssignment, type ActionResult } from "@/server/actions/student";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FormMessage } from "./FormMessage";

const EXT: Record<string, string> = {
  "application/pdf": "PDF",
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word (.docx)",
};

/**
 * Assignment submission. The file is validated here and again on the server; only
 * its name, type and size are sent, because object storage isn't connected yet.
 */
export function SubmissionForm({
  assignmentId, initialText, rules, resubmission,
}: {
  assignmentId: string;
  initialText: string;
  rules: { maxBytes: number; types: readonly string[] };
  resubmission: boolean;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(submitAssignment, null);
  const [file, setFile] = useState<{ name: string; type: string; size: number } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const id = useId();
  const maxMb = Math.round(rules.maxBytes / 1024 / 1024);
  const accepted = rules.types.map((t) => EXT[t] ?? t).join(", ");

  if (state?.ok) return <FormMessage state={state} />;

  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <input type="hidden" name="fileName" value={file?.name ?? ""} />
      <input type="hidden" name="fileType" value={file?.type ?? ""} />
      <input type="hidden" name="fileSize" value={file?.size ?? ""} />
      <div>
        <label htmlFor={`${id}-text`} className="mb-1.5 block text-[13px] font-medium">Your answer and reasoning</label>
        <textarea
          id={`${id}-text`}
          name="text"
          rows={8}
          maxLength={8000}
          defaultValue={initialText}
          placeholder="Explain each step: the main term you looked up, where you verified it, and why you chose the final code."
          className="field min-h-[180px] resize-y leading-relaxed md:text-[15px]"
        />
      </div>
      <div>
        <label htmlFor={`${id}-file`} className="mb-1.5 block text-[13px] font-medium">Attachment <span className="font-normal text-muted">(optional)</span></label>
        <label
          htmlFor={`${id}-file`}
          className="flex min-h-[72px] cursor-pointer items-center gap-4 rounded-xl border border-dashed border-line bg-mist/50 px-4 py-4 transition-colors hover:border-ink/30 focus-within:border-blue"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue"><Icon name="upload" size={18} /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-medium">{file ? file.name : "Choose a file"}</span>
            <span className="block text-[12px] text-muted">{file ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${accepted} · up to ${maxMb} MB`}</span>
          </span>
          {file && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setFile(null);
                const input = document.getElementById(`${id}-file`) as HTMLInputElement | null;
                if (input) input.value = "";
              }}
              className="rounded-full px-3 py-1.5 text-[12.5px] font-medium text-muted hover:bg-white hover:text-ink"
            >
              Remove
            </button>
          )}
        </label>
        <input
          id={`${id}-file`}
          type="file"
          className="sr-only"
          accept={rules.types.join(",")}
          aria-describedby={`${id}-file-help`}
          aria-invalid={fileError ? true : undefined}
          onChange={(e) => {
            const f = e.target.files?.[0];
            setFileError(null);
            if (!f) return setFile(null);
            if (!rules.types.includes(f.type)) {
              e.target.value = "";
              setFile(null);
              return setFileError(`“${f.name}” isn’t an accepted type. Use ${accepted}.`);
            }
            if (f.size > rules.maxBytes) {
              e.target.value = "";
              setFile(null);
              return setFileError(`“${f.name}” is larger than ${maxMb} MB.`);
            }
            setFile({ name: f.name, type: f.type, size: f.size });
          }}
        />
        <p id={`${id}-file-help`} className="mt-2 text-[12px] leading-relaxed text-muted">
          File storage isn’t connected yet, so only the file’s name and size are recorded with your submission. Keep your original file until storage is switched on.
        </p>
        {fileError && <div className="mt-2"><FormMessage state={{ ok: false, error: fileError }} /></div>}
      </div>
      <FormMessage state={state} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12.5px] text-muted">{resubmission ? "This will send a revised version to your faculty." : "You can’t edit after submitting unless your faculty returns it."}</p>
        <Button type="submit" icon="arrow" disabled={pending} className="w-full sm:w-auto">{pending ? "Submitting…" : resubmission ? "Resubmit" : "Submit assignment"}</Button>
      </div>
    </form>
  );
}
