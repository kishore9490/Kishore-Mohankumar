import { Icon } from "@/components/ui/Icon";

/** Inline result line for forms that call server actions. */
export function FormMessage({ state, id }: { state: { ok: boolean; error?: string; message?: string } | null; id?: string }) {
  if (!state) return null;
  if (!state.ok)
    return (
      <p id={id} role="alert" className="flex gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-2.5 text-[13.5px] text-orange-900">
        <Icon name="alert" size={15} className="mt-0.5 shrink-0" /> {state.error}
      </p>
    );
  if (!state.message) return null;
  return (
    <p id={id} role="status" className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[13.5px] text-emerald-900">
      <Icon name="check" size={15} className="mt-0.5 shrink-0" /> {state.message}
    </p>
  );
}
