"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn, normaliseRegistration } from "@/lib/format";
import { validators } from "@/lib/validation";

/**
 * Inline "quick track" — registration or job-card number → /service/track?reg=…
 */
export function QuickTrack({ className, label = "Track your bike" }: { className?: string; label?: string }) {
  const router = useRouter();
  const id = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const key = normaliseRegistration(value);
    const isJobCard = /^JC\d{3,}$/.test(key);
    const err = isJobCard ? null : validators.registration(value);
    setError(err);
    if (err) return;
    router.push(`/service/track?reg=${encodeURIComponent(key)}`);
  }

  return (
    <form onSubmit={onSubmit} noValidate className={cn("w-full", className)} role="search" aria-label="Track a service">
      <label htmlFor={id} className="eyebrow mb-2.5 block opacity-60">
        {label}
      </label>
      <div
        className={cn(
          "flex h-14 items-center gap-2 rounded-full border border-current/20 bg-current/[0.04] pl-5 pr-1.5 transition-colors focus-within:border-current/60",
          error && "border-alert",
        )}
      >
        <Icon name="search" size={18} className="shrink-0 opacity-50" />
        <input
          id={id}
          value={value}
          onChange={(e) => {
            setValue(e.target.value.toUpperCase());
            if (error) setError(null);
          }}
          placeholder="TN 37 AB 1234"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          className="min-w-0 flex-1 bg-transparent text-base uppercase tracking-[0.04em] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-current/35 focus-visible:outline-none"
        />
        <button
          type="submit"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-current transition-transform duration-300 ease-[var(--ease-out-expo)] hover:scale-105 active:scale-95"
          aria-label="Track service"
        >
          <Icon name="arrow-right" size={18} className="text-[color:var(--surface-bg,var(--color-ink))]" />
        </button>
      </div>
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-2 flex items-center gap-1.5 pl-5 text-[13px] text-alert">
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
    </form>
  );
}
