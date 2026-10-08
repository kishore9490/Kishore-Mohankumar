import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Lightweight SVG charts — no chart library, server-rendered, theme tokens only.
 * One accent series (cyan/blue), muted context, labels that name real values.
 */

export function BarChart({
  data,
  height = 160,
  format = (v: number) => String(v),
  highlightLast = true,
  label,
}: {
  data: { label: string; value: number }[];
  height?: number;
  format?: (v: number) => string;
  highlightLast?: boolean;
  label: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <figure aria-label={label}>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => {
          const hi = highlightLast ? i === data.length - 1 : false;
          return (
            <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5 self-stretch">
              <span className={cn("text-[11px] tabular-nums", hi ? "font-semibold text-ink" : "text-muted")}>{format(d.value)}</span>
              <div className={cn("w-full max-w-[44px] rounded-t-[5px]", hi ? "bg-cyan" : "bg-blue/20")} style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 3 : 0 }} />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2 border-t border-line pt-2">
        {data.map((d) => (
          <span key={d.label} className="min-w-0 flex-1 truncate text-center font-mono text-[10px] text-muted">{d.label}</span>
        ))}
      </div>
      <figcaption className="sr-only">{label}: {data.map((d) => `${d.label} ${format(d.value)}`).join(", ")}</figcaption>
    </figure>
  );
}

export function LineChart({
  data,
  height = 150,
  max: maxIn,
  suffix = "",
  label,
}: {
  data: { label: string; value: number }[];
  height?: number;
  max?: number;
  suffix?: string;
  label: string;
}) {
  const W = 600;
  const H = height;
  const pad = { t: 14, r: 12, b: 22, l: 30 };
  const max = maxIn ?? Math.max(1, ...data.map((d) => d.value));
  const x = (i: number) => pad.l + (i / Math.max(1, data.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const area = `${pad.l},${H - pad.b} ${pts} ${x(data.length - 1)},${H - pad.b}`;
  const last = data.at(-1);
  const ticks = [0, max / 2, max];
  return (
    <figure aria-label={label}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${label}. Latest ${last?.value}${suffix}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeDasharray={t ? "3 4" : undefined} />
            <text x={pad.l - 6} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill="var(--color-muted)" fontFamily="var(--font-mono)">{Math.round(t)}</text>
          </g>
        ))}
        <polygon points={area} fill="var(--color-cyan)" opacity="0.1" />
        <polyline points={pts} fill="none" stroke="var(--color-blue)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <text key={d.label} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--color-muted)" fontFamily="var(--font-mono)">{d.label}</text>
        ))}
        {last && (
          <g>
            <circle cx={x(data.length - 1)} cy={y(last.value)} r="4.5" fill="var(--color-cyan)" stroke="white" strokeWidth="2" />
            <text x={x(data.length - 1) - 8} y={y(last.value) - 9} textAnchor="end" fontSize="11" fontWeight="600" fill="var(--color-ink)">{last.value}{suffix}</text>
          </g>
        )}
      </svg>
    </figure>
  );
}

/** Horizontal bars for ranked lists (lead sources, strengths). */
export function HBars({ data, format = (v: number) => String(v), max: maxIn }: { data: { label: string; value: number; href?: string; note?: string }[]; format?: (v: number) => string; max?: number }) {
  const max = maxIn ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-3">
      {data.map((d, i) => {
        const row = (
          <>
            <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
              <span className="truncate">{d.label}</span>
              <span className="shrink-0 tabular-nums font-medium">{format(d.value)}{d.note && <span className="ml-1.5 font-normal text-muted">{d.note}</span>}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-mist">
              <div className={cn("h-full rounded-full", i === 0 ? "bg-cyan" : "bg-blue/35")} style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
          </>
        );
        return <li key={d.label}>{d.href ? <Link href={d.href} className="block rounded-md hover:opacity-80">{row}</Link> : row}</li>;
      })}
    </ul>
  );
}

/** The growth funnel. Each stage is a link that opens the matching leads. */
export function Funnel({ stages }: { stages: { key: string; label: string; value: number; href: string }[] }) {
  const max = Math.max(1, stages[0]?.value ?? 1);
  return (
    <ol className="grid gap-2" aria-label="Admissions funnel">
      {stages.map((s, i) => {
        const prev = stages[i - 1]?.value;
        const rate = prev ? Math.round((s.value / prev) * 100) : null;
        return (
          <li key={s.key}>
            <Link href={s.href} className="group grid grid-cols-[96px_1fr_auto] items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-mist sm:grid-cols-[130px_1fr_auto]">
              <span className="text-[13.5px] font-medium">{s.label}</span>
              <span className="relative h-9 overflow-hidden rounded-lg bg-mist">
                <span
                  className={cn("absolute inset-y-0 left-0 rounded-lg transition-[width] duration-700 group-hover:opacity-90", i === stages.length - 1 ? "bg-cyan" : "bg-ink")}
                  style={{ width: `${Math.max(4, (s.value / max) * 100)}%`, opacity: 1 - i * 0.1 }}
                />
              </span>
              <span className="w-[76px] text-right">
                <span className="block text-[15px] font-semibold tabular-nums leading-tight">{s.value.toLocaleString("en-IN")}</span>
                <span className="block font-mono text-[10.5px] text-muted">{rate !== null ? `${rate}% of prev.` : "total"}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/** 7- or 14-cell activity strip (learning streak, logins). */
export function ActivityStrip({ days, label }: { days: boolean[]; label: string }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`${label}: active on ${days.filter(Boolean).length} of ${days.length} days`}>
      {days.map((d, i) => (
        <span key={i} className={cn("h-7 flex-1 rounded-[5px]", d ? "bg-cyan" : "bg-mist")} />
      ))}
    </div>
  );
}
