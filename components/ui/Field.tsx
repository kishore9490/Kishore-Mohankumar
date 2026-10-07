"use client";

import { useId, useSyncExternalStore, type ComponentProps, type ReactNode } from "react";

const noop = () => () => {};
/** True only in the browser — avoids date/locale hydration mismatches. */
function useIsClient() {
  return useSyncExternalStore(noop, () => true, () => false);
}
import { cn, formatSlot } from "@/lib/format";
import { Icon } from "./Icon";

const fieldBox =
  "peer w-full rounded-xl border border-current/15 bg-current/[0.03] px-4 text-base outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-current/35 hover:border-current/30 focus:border-current/60 focus:bg-current/[0.05] focus-visible:outline-none focus:ring-4 focus:ring-current/[0.06] aria-[invalid=true]:border-alert aria-[invalid=true]:ring-alert/10";

export function FieldShell({
  id,
  label,
  hint,
  error,
  optional,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal opacity-50">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-[13px] text-alert" role="alert">
          <Icon name="alert" size={14} />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] opacity-55">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  hint,
  error,
  optional,
  className,
  prefix,
  ...rest
}: {
  label: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
  prefix?: string;
} & ComponentProps<"input">) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-base opacity-50">{prefix}</span>
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(fieldBox, "h-13", prefix && "pl-14")}
          {...rest}
        />
      </div>
    </FieldShell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  optional,
  className,
  children,
  ...rest
}: { label: string; hint?: string; error?: string | null; optional?: boolean } & ComponentProps<"select">) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(fieldBox, "h-13 appearance-none pr-11 [&>option]:text-ink")}
          {...rest}
        >
          {children}
        </select>
        <Icon name="chevron-down" size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 opacity-50" />
      </div>
    </FieldShell>
  );
}

export function TextArea({
  label,
  hint,
  error,
  optional,
  className,
  ...rest
}: { label: string; hint?: string; error?: string | null; optional?: boolean } & ComponentProps<"textarea">) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(fieldBox, "min-h-24 py-3")}
        {...rest}
      />
    </FieldShell>
  );
}

/* ───────────── Choice group: accessible radio / checkbox chips & cards ───────────── */

export interface Choice<T extends string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
  meta?: ReactNode;
}

export function ChoiceGroup<T extends string>({
  legend,
  hideLegend,
  name,
  options,
  value,
  onChange,
  multiple,
  layout = "chips",
  error,
  className,
  columns,
}: {
  legend: string;
  hideLegend?: boolean;
  name: string;
  options: Choice<T>[];
  value: T | T[] | null;
  onChange: (value: T) => void;
  multiple?: boolean;
  layout?: "chips" | "cards";
  error?: string | null;
  className?: string;
  columns?: string;
}) {
  const isOn = (v: T) => (Array.isArray(value) ? value.includes(v) : value === v);
  return (
    <fieldset className={cn("min-w-0", className)} aria-invalid={error ? true : undefined}>
      <legend className={cn("mb-3 text-sm font-medium", hideLegend && "sr-only")}>{legend}</legend>
      <div className={cn(layout === "chips" ? "flex flex-wrap gap-2" : cn("grid gap-2.5", columns ?? "sm:grid-cols-2"))}>
        {options.map((o) => {
          const on = isOn(o.value);
          return (
            <label
              key={o.value}
              className={cn(
                "relative cursor-pointer select-none transition-[background-color,border-color,color,transform] duration-200 ease-[var(--ease-out-expo)] active:scale-[0.98] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal",
                layout === "chips"
                  ? "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm"
                  : "flex flex-col gap-1 rounded-2xl border p-4",
                on ? "border-current bg-current/[0.08]" : "border-current/15 hover:border-current/40",
                o.disabled && "pointer-events-none opacity-35 line-through decoration-current/40",
              )}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                name={name}
                value={o.value}
                checked={on}
                disabled={o.disabled}
                onChange={() => onChange(o.value)}
                className="absolute inset-0 m-0 cursor-pointer opacity-0"
              />
              {layout === "chips" ? (
                <>
                  {on && <Icon name="check" size={15} />}
                  <span>{o.label}</span>
                  {o.meta}
                </>
              ) : (
                <>
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-medium">{o.label}</span>
                    <span
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                        multiple && "rounded-md",
                        on ? "border-current bg-current" : "border-current/30",
                      )}
                      aria-hidden
                    >
                      {on && <Icon name="check" size={13} strokeWidth={2.4} className="text-[color:var(--color-paper)] mix-blend-difference" />}
                    </span>
                  </span>
                  {o.description && <span className="text-[13px] leading-snug opacity-60">{o.description}</span>}
                  {o.meta}
                </>
              )}
            </label>
          );
        })}
      </div>
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-alert" role="alert">
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
    </fieldset>
  );
}

/* ───────────── Date strip (next N days) ───────────── */

export function upcomingDates(count = 14, startOffset = 1) {
  const out: string[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + startOffset);
  for (let i = 0; i < count; i++) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export function DateStrip({
  legend,
  name,
  value,
  onChange,
  isDisabled,
  error,
  count = 14,
}: {
  legend: string;
  name: string;
  value: string | null;
  onChange: (date: string) => void;
  isDisabled?: (date: string) => boolean;
  error?: string | null;
  count?: number;
}) {
  const isClient = useIsClient();
  const dates = isClient ? upcomingDates(count) : [];
  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 text-sm font-medium">{legend}</legend>
      <div className="no-scrollbar -mx-1 flex min-h-[5.6rem] snap-x gap-2 overflow-x-auto px-1 pb-1">
        {!isClient &&
          Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-[5.4rem] w-[4.25rem] shrink-0 animate-pulse rounded-2xl bg-current/[0.06]" />)}
        {dates.map((iso) => {
          const d = new Date(`${iso}T00:00:00`);
          const disabled = isDisabled?.(iso);
          const on = value === iso;
          return (
            <label
              key={iso}
              className={cn(
                "relative flex w-[4.25rem] shrink-0 snap-start cursor-pointer flex-col items-center gap-0.5 rounded-2xl border py-3 transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal",
                on ? "border-[color:var(--surface-fg)] bg-[color:var(--surface-fg)] text-[color:var(--surface-bg)]" : "border-current/15 hover:border-current/40",
                disabled && "pointer-events-none opacity-30",
              )}
            >
              <input
                type="radio"
                name={name}
                value={iso}
                checked={on}
                disabled={disabled}
                onChange={() => onChange(iso)}
                className="absolute inset-0 m-0 cursor-pointer opacity-0"
                aria-label={d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) + (disabled ? " — unavailable" : "")}
              />
              <span className="eyebrow text-[10px] opacity-70">{d.toLocaleDateString("en-IN", { weekday: "short" })}</span>
              <span className="font-display text-xl tabular">{d.getDate()}</span>
              <span className="text-[11px] opacity-60">{d.toLocaleDateString("en-IN", { month: "short" })}</span>
            </label>
          );
        })}
      </div>
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-alert" role="alert">
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function SlotGrid({
  legend,
  name,
  slots,
  value,
  onChange,
  loading,
  error,
}: {
  legend: string;
  name: string;
  slots: { slot: string; available: boolean }[];
  value: string | null;
  onChange: (slot: string) => void;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <fieldset className="min-w-0" aria-busy={loading || undefined}>
      <legend className="mb-3 text-sm font-medium">{legend}</legend>
      {loading ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded-full bg-current/[0.07]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.map((s) => {
            const on = value === s.slot;
            return (
              <label
                key={s.slot}
                className={cn(
                  "relative flex h-11 cursor-pointer items-center justify-center rounded-full border text-sm tabular transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal",
                  on ? "border-[color:var(--surface-fg)] bg-[color:var(--surface-fg)] text-[color:var(--surface-bg)]" : "border-current/15 hover:border-current/40",
                  !s.available && "pointer-events-none line-through opacity-30",
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={s.slot}
                  checked={on}
                  disabled={!s.available}
                  onChange={() => onChange(s.slot)}
                  className="absolute inset-0 m-0 cursor-pointer opacity-0"
                  aria-label={`${formatSlot(s.slot)}${s.available ? "" : " — fully booked"}`}
                />
                {formatSlot(s.slot)}
              </label>
            );
          })}
        </div>
      )}
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-alert" role="alert">
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
    </fieldset>
  );
}

/* ───────────── Step progress ───────────── */

export function StepProgress({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div>
      <p className="eyebrow mb-3 opacity-60" aria-live="polite">
        Step {Math.min(current + 1, steps.length)} of {steps.length} · {steps[Math.min(current, steps.length - 1)]}
      </p>
      <div className="flex gap-1.5" aria-hidden>
        {steps.map((s, i) => (
          <span key={s} className="h-[3px] flex-1 overflow-hidden rounded-full bg-current/15">
            <span
              className="block h-full origin-left rounded-full bg-current transition-transform duration-700 ease-[var(--ease-out-expo)]"
              style={{ transform: `scaleX(${i <= current ? 1 : 0})` }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
