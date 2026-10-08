"use client";
import { createContext, useActionState, useContext, useId, useState, type ReactNode } from "react";
import type { AdminActionState } from "@/server/actions/admin";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * Admin form kit: server-action forms with inline field errors, one-time
 * secret display and a pending state. Every action re-checks permission on
 * the server; nothing here is trusted.
 */
type Action = (state: AdminActionState, form: FormData) => Promise<AdminActionState>;
const INITIAL: AdminActionState = { ok: null };
const Ctx = createContext<{ state: AdminActionState; pending: boolean }>({ state: INITIAL, pending: false });

export function ActionForm({
  action,
  children,
  submit,
  submitIcon,
  variant = "primary",
  confirm,
  hidden,
  className,
  footer,
}: {
  action: Action;
  children?: ReactNode;
  submit: string;
  submitIcon?: IconName;
  variant?: "primary" | "accent" | "outline";
  /** Ask before submitting (destructive actions). */
  confirm?: string;
  hidden?: Record<string, string>;
  className?: string;
  footer?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL);
  return (
    <Ctx.Provider value={{ state, pending }}>
      <form
        action={formAction}
        noValidate
        className={cn("grid gap-4", className)}
        onSubmit={(e) => {
          if (confirm && !window.confirm(confirm)) e.preventDefault();
        }}
      >
        {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        {children}
        <Result state={state} />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant={variant} size="sm" iconLeft={submitIcon} disabled={pending} className="min-h-10">
            {pending ? "Working…" : submit}
          </Button>
          {footer}
        </div>
      </form>
    </Ctx.Provider>
  );
}

/** A single-button action (approve, publish, test…) with its result shown inline. */
export function ActionButton({
  action,
  fields,
  label,
  variant = "outline",
  icon,
  confirm,
}: {
  action: Action;
  fields: Record<string, string>;
  label: string;
  variant?: "primary" | "accent" | "outline" | "ghost";
  icon?: IconName;
  confirm?: string;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL);
  return (
    <form
      action={formAction}
      className="inline-flex min-w-0 flex-col items-start gap-1.5"
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <Button type="submit" variant={variant} size="sm" iconLeft={icon} disabled={pending} className="min-h-10">
        {pending ? "Working…" : label}
      </Button>
      {state.ok !== null && (
        <span role={state.ok ? "status" : "alert"} className={cn("max-w-[320px] text-[12.5px] leading-snug", state.ok ? "text-emerald-800" : "text-orange-900")}>
          {state.ok ? state.message : state.error}
        </span>
      )}
    </form>
  );
}

function Result({ state }: { state: AdminActionState }) {
  if (state.ok === null) return null;
  if (!state.ok)
    return (
      <p role="alert" className="flex gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-[14px] text-orange-900">
        <Icon name="alert" size={16} className="mt-0.5 shrink-0" /> {state.error}
      </p>
    );
  return (
    <div role="status" className="grid gap-3">
      <p className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] text-emerald-900">
        <Icon name="check" size={16} className="mt-0.5 shrink-0" /> {state.message}
      </p>
      {state.secret && <OneTimeSecret label={state.secret.label} value={state.secret.value} />}
    </div>
  );
}

function OneTimeSecret({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-xl bg-ink p-4 text-white">
      <div className="grid-bg-dark absolute inset-0" aria-hidden="true" />
      <div className="relative">
        <p className="label !text-[10px] !text-cyan">Shown once · demo only</p>
        <p className="mt-2 text-[13px] text-white/70">{label}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <code className="select-all break-all rounded-lg bg-white/10 px-3 py-2 font-mono text-[16px] tracking-wider">{value}</code>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(value).then(() => setCopied(true)).catch(() => setCopied(false))}
            className="min-h-10 rounded-full border border-white/25 px-4 text-[13px] font-medium hover:border-white"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-white/55">
          Share it privately. It won’t be shown again — only a hash is stored. In production the user receives a one-time sign-in link instead.
        </p>
      </div>
    </div>
  );
}

function useField(name: string) {
  const { state } = useContext(Ctx);
  const id = useId();
  return { id, error: state.fieldErrors?.[name], echoed: state.ok === false ? state.values?.[name] : undefined, n: state.n ?? 0 };
}

function FieldShell({ id, label, hint, error, children, optional }: { id: string; label: string; hint?: string; error?: string; children: ReactNode; optional?: boolean }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-medium">
        {label}
        {optional && <span className="text-[11.5px] font-normal text-muted">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-[12.5px] text-orange-800">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[12.5px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Field({
  name,
  label,
  type = "text",
  defaultValue,
  hint,
  optional,
  maxLength = 120,
  placeholder,
  min,
  max,
  autoComplete = "off",
}: {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "date";
  defaultValue?: string | number;
  hint?: string;
  optional?: boolean;
  maxLength?: number;
  placeholder?: string;
  min?: number | string;
  max?: number | string;
  autoComplete?: string;
}) {
  const f = useField(name);
  return (
    <FieldShell id={f.id} label={label} hint={hint} error={f.error} optional={optional}>
      <input
        key={f.n}
        id={f.id}
        name={name}
        type={type}
        className="field !py-2.5 !text-[15px]"
        defaultValue={f.echoed ?? defaultValue}
        maxLength={maxLength}
        placeholder={placeholder}
        min={min}
        max={max}
        autoComplete={autoComplete}
        aria-invalid={f.error ? true : undefined}
        aria-describedby={f.error ? `${f.id}-err` : hint ? `${f.id}-hint` : undefined}
      />
    </FieldShell>
  );
}

export function TextArea({ name, label, defaultValue, hint, optional, maxLength = 300, rows = 3 }: { name: string; label: string; defaultValue?: string; hint?: string; optional?: boolean; maxLength?: number; rows?: number }) {
  const f = useField(name);
  return (
    <FieldShell id={f.id} label={label} hint={hint} error={f.error} optional={optional}>
      <textarea
        key={f.n}
        id={f.id}
        name={name}
        rows={rows}
        className="field !py-2.5 !text-[15px]"
        defaultValue={f.echoed ?? defaultValue}
        maxLength={maxLength}
        aria-invalid={f.error ? true : undefined}
        aria-describedby={f.error ? `${f.id}-err` : hint ? `${f.id}-hint` : undefined}
      />
    </FieldShell>
  );
}

export function Select({
  name,
  label,
  options,
  defaultValue,
  hint,
  placeholder,
}: {
  name: string;
  label: string;
  options: { value: string; label: string; disabled?: boolean }[];
  defaultValue?: string;
  hint?: string;
  placeholder?: string;
}) {
  const f = useField(name);
  return (
    <FieldShell id={f.id} label={label} hint={hint} error={f.error}>
      <select
        key={f.n}
        id={f.id}
        name={name}
        className="field !py-2.5 !text-[15px]"
        defaultValue={f.echoed ?? defaultValue ?? ""}
        aria-invalid={f.error ? true : undefined}
        aria-describedby={f.error ? `${f.id}-err` : hint ? `${f.id}-hint` : undefined}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Checkbox({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  const f = useField(name);
  return (
    <div>
      <label className="flex min-h-10 items-center gap-2.5 text-[14px]">
        <input key={f.n} type="checkbox" name={name} defaultChecked={f.echoed !== undefined ? f.echoed === "on" : defaultChecked} className="h-4 w-4 accent-[var(--color-blue)]" aria-invalid={f.error ? true : undefined} />
        {label}
      </label>
      {f.error ? <p className="text-[12.5px] text-orange-800">{f.error}</p> : hint ? <p className="text-[12.5px] text-muted">{hint}</p> : null}
    </div>
  );
}

/** Grouped checkbox list (permissions, faculty). */
export function CheckGroup({
  name,
  legend,
  groups,
  defaultValues = [],
  columns = 2,
}: {
  name: string;
  legend: string;
  groups: { label?: string; options: { value: string; label: string; hint?: string; locked?: boolean }[] }[];
  defaultValues?: string[];
  columns?: 1 | 2 | 3;
}) {
  const f = useField(name);
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-[13px] font-medium">{legend}</legend>
      <div className="grid gap-4">
        {groups.map((g, gi) => (
          <div key={g.label ?? gi}>
            {g.label && <p className="label mb-1.5 !text-[10px]">{g.label}</p>}
            <div className={cn("grid gap-x-4", columns === 2 && "sm:grid-cols-2", columns === 3 && "sm:grid-cols-2 xl:grid-cols-3")}>
              {g.options.map((o) => (
                <label key={o.value} className={cn("flex min-h-10 items-start gap-2.5 py-1.5 text-[14px]", o.locked && "text-muted")}>
                  <input
                    key={f.n}
                    type="checkbox"
                    name={o.locked ? undefined : name}
                    value={o.value}
                    defaultChecked={o.locked || defaultValues.includes(o.value)}
                    disabled={o.locked}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-blue)]"
                  />
                  <span className="min-w-0">
                    <span className="block leading-snug">{o.label}</span>
                    {o.hint && <span className="block font-mono text-[10.5px] text-muted">{o.hint}</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {f.error && <p className="mt-1.5 text-[12.5px] text-orange-800">{f.error}</p>}
    </fieldset>
  );
}
