import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Panel } from "@/components/academy/ui";

/** Small server-rendered pieces shared by the Super Admin screens. */

/** Capacity / fill bar — turns amber when a batch is nearly full. */
export function FillBar({ used, total, className }: { used: number; total: number; className?: string }) {
  const pct = total ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const tone = pct >= 100 ? "bg-orange-500" : pct >= 85 ? "bg-amber-500" : "bg-cyan";
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-baseline justify-between gap-2 text-[12.5px]">
        <span className="tabular-nums font-medium">{used}<span className="text-muted">/{total} seats</span></span>
        <span className="font-mono text-[11px] text-muted">{pct}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-mist" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Seats filled">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function KeyValues({ items, className }: { items: [string, ReactNode][]; className?: string }) {
  return (
    <dl className={cn("grid gap-2.5 text-[14px]", className)}>
      {items.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 border-b border-dashed border-line pb-2.5 last:border-0 last:pb-0">
          <dt className="shrink-0 text-muted">{k}</dt>
          <dd className="min-w-0 text-right font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function MetaChips({ meta }: { meta: Record<string, string | number | boolean | null> }) {
  const entries = Object.entries(meta).filter(([, v]) => v !== "" && v !== null);
  if (!entries.length) return <span className="text-muted">—</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {entries.map(([k, v]) => (
        <span key={k} className="code-chip max-w-[240px] truncate rounded-md bg-mist px-1.5 py-0.5 !text-[11px] text-ink/80" title={`${k}: ${String(v)}`}>
          {k}={String(v)}
        </span>
      ))}
    </span>
  );
}

/** Contextual "manage" panel opened via a URL param, with a close link. */
export function ManagePanel({ label, title, closeHref, children, id }: { label: string; title: ReactNode; closeHref: string; children: ReactNode; id?: string }) {
  return (
    <Panel
      id={id}
      label={label}
      title={title}
      className="border-ink/20 shadow-[0_24px_60px_-40px_rgba(7,26,51,.45)]"
      action={
        <Link href={closeHref} scroll={false} className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-muted hover:bg-mist hover:text-ink">
          <Icon name="close" size={14} /> Close
        </Link>
      }
    >
      {children}
    </Panel>
  );
}

/** Sub-heading inside a panel. */
export function SubHead({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-[14.5px] font-semibold tracking-tight", className)}>{children}</h3>;
}

/** GET filter bar (search + selects). State lives in the URL. */
export function FilterBar({ action, children }: { action: string; children: ReactNode }) {
  return (
    <form action={action} method="get" role="search" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
      {children}
      <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[14px] font-medium text-white hover:bg-navy-2">
        <Icon name="filter" size={15} /> Apply
      </button>
    </form>
  );
}

export function FilterInput({ name, label, defaultValue, placeholder, icon = "search" }: { name: string; label: string; defaultValue?: string; placeholder?: string; icon?: IconName }) {
  return (
    <label className="relative block min-w-0 sm:w-72">
      <span className="sr-only">{label}</span>
      <Icon name={icon} size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
      <input name={name} defaultValue={defaultValue} placeholder={placeholder} maxLength={80} className="field !h-11 !py-0 !pl-10 !text-[15px]" />
    </label>
  );
}

export function FilterSelect({ name, label, defaultValue, options }: { name: string; label: string; defaultValue?: string; options: { value: string; label: string }[] }) {
  return (
    <label className="block min-w-0 sm:w-48">
      <span className="sr-only">{label}</span>
      <select name={name} defaultValue={defaultValue ?? ""} className="field !h-11 !py-0 !text-[15px]" aria-label={label}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

/** Tone dot used in compact lists. */
export function Dot({ tone }: { tone: "danger" | "warning" | "info" | "success" | "muted" }) {
  const c = { danger: "bg-orange-500", warning: "bg-amber-500", info: "bg-blue", success: "bg-emerald-500", muted: "bg-line" }[tone];
  return <span className={cn("inline-block h-2 w-2 shrink-0 rounded-full", c)} aria-hidden="true" />;
}

/** Build a URL that keeps current filters while changing one param. */
export function withParams(base: string, current: Record<string, string | undefined>, patch: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...current, ...patch })) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

/** "Last seen" text that never shows a future time (demo data can be ahead of the clock). */
export function seen(iso: string | null) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return "Today";
  const m = Math.round(diff / 60000);
  const h = Math.round(diff / 3600000);
  const d = Math.round(diff / 86400000);
  return m < 60 ? `${m} min ago` : h < 24 ? `${h} h ago` : `${d} day${d === 1 ? "" : "s"} ago`;
}

/** Previous / next pager; page state lives in the URL. */
export function Pager({ page, pages, href, total, label }: { page: number; pages: number; href: (p: number) => string; total: number; label: string }) {
  return (
    <nav aria-label={`${label} pages`} className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted">
      <span>{total} {label} · page {page} of {pages}</span>
      {pages > 1 && (
        <span className="flex gap-2">
          {page > 1 ? (
            <Link href={href(page - 1)} className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-white px-4 font-medium text-ink hover:border-ink"><Icon name="arrow" size={14} className="rotate-180" />Previous</Link>
          ) : <span className="inline-flex h-10 items-center rounded-full border border-line px-4 opacity-40" aria-disabled="true">Previous</span>}
          {page < pages ? (
            <Link href={href(page + 1)} className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-white px-4 font-medium text-ink hover:border-ink">Next<Icon name="arrow" size={14} /></Link>
          ) : <span className="inline-flex h-10 items-center rounded-full border border-line px-4 opacity-40" aria-disabled="true">Next</span>}
        </span>
      )}
    </nav>
  );
}
