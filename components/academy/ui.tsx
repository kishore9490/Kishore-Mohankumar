import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";

/**
 * Academy UI kit. Built on the public website's tokens (ink / cyan / blue / mist,
 * Geist + Geist Mono, hairline borders, 14–20px radii, mono uppercase labels)
 * so the platform reads as the same product.
 */

export function PageHeader({
  label,
  title,
  intro,
  actions,
  back,
}: {
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="flex flex-col gap-5 pb-6 md:flex-row md:items-end md:justify-between md:pb-8">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink">
            <Icon name="arrow" size={14} className="rotate-180" /> {back.label}
          </Link>
        )}
        <p className="label flex items-center gap-2">
          <span className="inline-block h-px w-5 bg-cyan" aria-hidden="true" />
          {label}
        </p>
        <h1 className="heading mt-3 text-[30px] md:text-[40px]">{title}</h1>
        {intro && <p className="mt-2.5 max-w-2xl text-[15.5px] leading-relaxed text-muted">{intro}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({
  title,
  label,
  action,
  children,
  className,
  pad = true,
  id,
}: {
  title?: ReactNode;
  label?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  pad?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={cn("min-w-0 rounded-2xl border border-line bg-white", className)} aria-label={typeof title === "string" ? title : label}>
      {(title || label || action) && (
        <div className="flex items-start justify-between gap-4 px-5 pt-5 md:px-6 md:pt-6">
          <div className="min-w-0">
            {label && <p className="label !text-[10.5px]">{label}</p>}
            {title && <h2 className={cn("text-[17px] font-semibold tracking-tight", label && "mt-1.5")}>{title}</h2>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(pad && "p-5 md:p-6", pad && !!(title || label) && "pt-4 md:pt-4")}>{children}</div>
    </section>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1 text-[13px] font-medium text-blue hover:text-ink">
      {children} <Icon name="arrow" size={13} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

const PILL: Record<string, string> = {
  neutral: "bg-mist text-ink/75 border-line",
  info: "bg-soft text-blue border-blue/15",
  accent: "bg-cyan/12 text-cyan-ink border-cyan/30",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  warning: "bg-amber-50 text-amber-900 border-amber-200",
  danger: "bg-orange-50 text-orange-900 border-orange-200",
  dark: "bg-ink text-white border-ink",
};

export type Tone = keyof typeof PILL;

export function Pill({ tone = "neutral", children, dot }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11.5px] font-medium", PILL[tone])}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Status → tone mapping shared by every module so states look the same everywhere. */
export function statusTone(s: string): Tone {
  if (["completed", "published", "paid", "valid", "active", "present", "converted", "delivered", "read", "processed", "connected", "approved", "enrolled", "succeeded"].includes(s)) return "success";
  if (["in_progress", "open", "review", "under_review", "submitted", "contacted", "counselling", "demo_booked", "demo_completed", "application", "sent", "queued", "partially_paid", "late", "pending", "simulated", "planned", "documents", "payment", "admitted", "batch_assigned"].includes(s)) return "info";
  if (["returned", "upcoming", "new", "draft", "excused", "paused", "skipped", "not_configured"].includes(s)) return "neutral";
  if (["overdue", "missed", "failed", "revoked", "absent", "lost", "rejected", "disabled", "error", "denied"].includes(s)) return "danger";
  return "neutral";
}

export const humanize = (s: string) => s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export function StatusPill({ status, label }: { status: string; label?: string }) {
  return <Pill tone={statusTone(status)} dot>{label ?? humanize(status)}</Pill>;
}

/** Metric row in the website's hairline-grid style — not generic stat cards. */
export function Metrics({ items, className }: { items: { label: string; value: ReactNode; hint?: ReactNode; href?: string }[]; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line", items.length >= 4 ? "lg:grid-cols-4" : items.length === 3 ? "lg:grid-cols-3" : "", className)}>
      {items.map((m) => {
        const inner = (
          <>
            <dt className="label !text-[10.5px]">{m.label}</dt>
            <dd className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.03em] tabular-nums md:text-[34px]">{m.value}</dd>
            {m.hint && <p className="mt-2 text-[12.5px] text-muted">{m.hint}</p>}
          </>
        );
        return (
          <div key={m.label} className="bg-white">
            {m.href ? (
              <Link href={m.href} className="block h-full p-5 transition-colors hover:bg-mist/60">{inner}</Link>
            ) : (
              <div className="h-full p-5">{inner}</div>
            )}
          </div>
        );
      })}
    </dl>
  );
}

export function ProgressBar({ value, tone = "cyan", className, label }: { value: number; tone?: "cyan" | "ink" | "blue"; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-1.5 overflow-hidden rounded-full bg-mist", className)}
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={cn("h-full rounded-full transition-[width] duration-700", tone === "cyan" ? "bg-cyan" : tone === "ink" ? "bg-ink" : "bg-blue")} style={{ width: `${v}%` }} />
    </div>
  );
}

export function Ring({ value, size = 88, stroke = 7, label, children }: { value: number; size?: number; stroke?: number; label: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${Math.round(value)}%`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-cyan)" strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children ?? <span className="text-[18px] font-semibold tabular-nums">{Math.round(value)}%</span>}</div>
    </div>
  );
}

export function Avatar({ name, size = 36, tone = "soft" }: { name: string; size?: number; tone?: "soft" | "ink" }) {
  const parts = name.replace(/^Dr\.\s*/, "").split(" ");
  const initials = (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-mono font-medium", tone === "ink" ? "bg-ink text-white" : "bg-soft text-blue")}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function EmptyState({ icon = "info", title, text, action }: { icon?: IconName; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white/60 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-soft text-blue"><Icon name={icon} size={22} /></span>
      <p className="mt-5 text-[17px] font-semibold tracking-tight">{title}</p>
      <p className="mt-1.5 max-w-sm text-[14.5px] text-muted">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-orange-200 bg-orange-50/60 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-800"><Icon name="alert" size={22} /></span>
      <p className="mt-5 text-[17px] font-semibold tracking-tight">{title}</p>
      <p className="mt-1.5 max-w-sm text-[14.5px] text-muted">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-line/70", className)} aria-hidden="true" />;
}

/** Link-based tabs (state lives in the URL, so it survives refresh and works without JS). */
export function Tabs({ items, current }: { items: { key: string; label: string; href: string; count?: number }[]; current: string }) {
  return (
    <nav className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1" aria-label="Views">
      {items.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={current === t.key ? "page" : undefined}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
            current === t.key ? "border-ink bg-ink text-white" : "border-line bg-white text-ink/80 hover:border-ink/40",
          )}
        >
          {t.label}
          {t.count !== undefined && <span className={cn("font-mono text-[11px]", current === t.key ? "text-cyan" : "text-muted")}>{t.count}</span>}
        </Link>
      ))}
    </nav>
  );
}

/** Responsive table: real table on desktop, stacked rows on phones. */
export function DataTable<R>({
  rows,
  columns,
  rowKey,
  rowHref,
  empty,
  caption,
}: {
  rows: R[];
  columns: { key: string; label: string; render: (r: R) => ReactNode; className?: string; mobile?: "primary" | "secondary" | "hide" }[];
  rowKey: (r: R) => string;
  rowHref?: (r: R) => string;
  empty?: ReactNode;
  caption: string;
}) {
  if (!rows.length) return <>{empty ?? <EmptyState title="Nothing here yet" text="Items will appear here as soon as they exist." />}</>;
  const primary = columns.find((c) => c.mobile === "primary") ?? columns[0];
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <table className="hidden w-full text-left text-[14px] md:table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line bg-mist/60">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn("label !text-[10.5px] px-4 py-3 font-normal", c.className)}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={rowKey(r)} className={cn("transition-colors", rowHref && "hover:bg-mist/50")}>
              {columns.map((c, i) => (
                <td key={c.key} className={cn("px-4 py-3 align-middle", c.className)}>
                  {i === 0 && rowHref ? <Link href={rowHref(r)} className="font-medium hover:text-blue">{c.render(r)}</Link> : c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="divide-y divide-line md:hidden">
        {rows.map((r) => {
          const body = (
            <>
              <div className="text-[15px] font-medium">{primary.render(r)}</div>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {columns.filter((c) => c !== primary && c.mobile !== "hide").map((c) => (
                  <div key={c.key} className="min-w-0">
                    <dt className="label !text-[9.5px]">{c.label}</dt>
                    <dd className="mt-0.5 truncate text-[13.5px]">{c.render(r)}</dd>
                  </div>
                ))}
              </dl>
            </>
          );
          return (
            <li key={rowKey(r)}>
              {rowHref ? <Link href={rowHref(r)} className="block px-4 py-4 active:bg-mist">{body}</Link> : <div className="px-4 py-4">{body}</div>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DemoBadge() {
  return (
    <span className="label inline-flex items-center gap-1.5 rounded-full border border-dashed border-line bg-white px-2.5 py-1 !text-[10px]" title="All people and numbers are fictional demo data">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden="true" /> Demo data
    </span>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warning"; children: ReactNode }) {
  return (
    <p role="status" className={cn("flex items-start gap-2.5 rounded-xl px-4 py-3 text-[14px]", tone === "info" ? "bg-soft text-ink" : "bg-amber-50 text-amber-900")}>
      <Icon name={tone === "info" ? "info" : "alert"} size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
