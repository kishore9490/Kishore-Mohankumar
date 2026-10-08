"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { selectCls } from "./form";

/** A labelled <select> whose value lives in the URL (search param), so views survive refresh and can be shared. */
export function UrlSelect({
  id,
  label,
  param,
  value,
  options,
  reset = [],
}: {
  id: string;
  label: string;
  param: string;
  value: string;
  options: { value: string; label: string }[];
  /** Params cleared when this one changes (e.g. picking a batch clears the session). */
  reset?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium">{label}</label>
      <select
        id={id}
        className={selectCls}
        value={value}
        aria-busy={pending}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value) next.set(param, e.target.value);
          else next.delete(param);
          for (const r of reset) next.delete(r);
          start(() => router.push(`${pathname}?${next.toString()}`));
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
