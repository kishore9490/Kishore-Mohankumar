import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

/** Small, shared form pieces for faculty screens (labels, inline errors, result banners). */

export function Field({ id, label, hint, error, children, className }: { id: string; label: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium">{label}</label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[12.5px] text-orange-800">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[12.5px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/** aria props that connect a control to its inline error. */
export const errProps = (id: string, error?: string) => (error ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` } : {});

export function FormResult({ state }: { state: { ok: boolean; message?: string; error?: string } | null }) {
  if (!state) return null;
  if (state.ok)
    return state.message ? (
      <p role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] text-emerald-900">
        <Icon name="check" size={16} className="mt-0.5 shrink-0" /> {state.message}
      </p>
    ) : null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-[14px] text-orange-900">
      <Icon name="alert" size={16} className="mt-0.5 shrink-0" /> {state.error}
    </p>
  );
}

export const selectCls = "field appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2352637a%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:14px] bg-[right_14px_center] bg-no-repeat pr-10";

