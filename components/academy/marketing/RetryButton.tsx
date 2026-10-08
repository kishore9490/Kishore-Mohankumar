"use client";
import { useActionState } from "react";
import { retryCommunication, type FormState } from "@/server/actions/marketing";
import { Icon } from "@/components/ui/Icon";

export function RetryButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(retryCommunication, { ok: false });
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[12.5px] font-medium hover:border-ink disabled:opacity-50">
        <Icon name="refresh" size={13} /> {pending ? "Retrying…" : "Retry"}
      </button>
      {state.at && <span role="status" className={`text-[12px] ${state.ok ? "text-emerald-800" : "text-orange-800"}`}>{state.ok ? state.message : state.error}</span>}
    </form>
  );
}
