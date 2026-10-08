import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

/** Labelled form control with inline error and hint. Pass the control as children with matching id. */
export function Field({ id, label, error, hint, children, className, optional }: { id: string; label: string; error?: string; hint?: ReactNode; children: ReactNode; className?: string; optional?: boolean }) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-medium">
        <span>{label}</span>
        {optional && <span className="font-mono text-[10.5px] font-normal text-muted">optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[12.5px] text-orange-800">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[12.5px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/** aria props for a control inside <Field>. */
export const fieldAria = (id: string, error?: string, hint?: boolean) => ({
  id,
  name: id,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
});

/** Compact select/input styling for dense panels (40px touch target). */
export const compact = "field !py-2 !text-[14px] min-h-[40px]";

export function FormResult({ state }: { state: { ok: boolean; error?: string; message?: string; existingId?: string } | null }) {
  if (!state) return null;
  if (state.ok && state.message)
    return (
      <p role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[13.5px] text-emerald-900">
        <Icon name="check" size={15} className="mt-0.5 shrink-0" /> {state.message}
      </p>
    );
  if (!state.ok && state.error)
    return (
      <p role="alert" className="flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-2.5 text-[13.5px] text-orange-900">
        <Icon name="info" size={15} className="mt-0.5 shrink-0" />
        <span>
          {state.error}
          {state.existingId && (
            <>
              {" "}
              <Link href={`/academy/marketing/leads/${state.existingId}`} className="font-medium text-blue underline underline-offset-2">Open the existing lead</Link>
            </>
          )}
        </span>
      </p>
    );
  return null;
}
