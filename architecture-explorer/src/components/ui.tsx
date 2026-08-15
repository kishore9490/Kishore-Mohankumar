import type { ReactNode } from 'react'
import type { NodeTone } from '@/types'
import { Info } from 'lucide-react'

export const TONE: Record<NodeTone, { chip: string; dot: string; border: string; text: string }> = {
  primary: { chip: 'bg-navy-850/[0.06] text-navy-700', dot: 'bg-navy-600', border: 'border-navy-600/30', text: 'text-navy-700' },
  verify: { chip: 'bg-verify/10 text-verify-deep', dot: 'bg-verify', border: 'border-verify/40', text: 'text-verify-deep' },
  caution: { chip: 'bg-caution/10 text-[#8A5A05]', dot: 'bg-caution', border: 'border-caution/45', text: 'text-[#8A5A05]' },
  adverse: { chip: 'bg-adverse/10 text-[#B32D33]', dot: 'bg-adverse', border: 'border-adverse/45', text: 'text-[#B32D33]' },
  neutral: { chip: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400', border: 'border-slate-300', text: 'text-slate-600' },
  external: { chip: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400', border: 'border-slate-300 border-dashed', text: 'text-slate-600' },
}

export function SectionHeader({
  eyebrow, title, subtitle, right,
}: { eyebrow: string; title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div className="min-w-0">
        <p className="eyebrow mb-1.5">{eyebrow}</p>
        <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.015em] text-navy-850">{title}</h1>
        {subtitle && <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600 max-w-[72ch]">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function Panel({ children, className = '', pad = true }: { children: ReactNode; className?: string; pad?: boolean }) {
  return <div className={`panel panel-shadow ${pad ? 'p-5' : ''} ${className}`}>{children}</div>
}

export function Chip({
  children, tone = 'neutral', onClick, active, title,
}: { children: ReactNode; tone?: NodeTone; onClick?: () => void; active?: boolean; title?: string }) {
  const t = TONE[tone]
  const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium border transition-colors'
  if (onClick) {
    return (
      <button
        type="button" onClick={onClick} title={title} aria-pressed={active}
        className={`${base} ${active ? `${t.chip} ${t.border}` : 'bg-white text-slate-500 border-[var(--line)] hover:border-navy-500/40 hover:text-navy-700'}`}
      >
        {children}
      </button>
    )
  }
  return <span title={title} className={`${base} ${t.chip} ${t.border}`}>{children}</span>
}

export function DemoBadge({ children = 'Demo data' }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-caution/10 border border-caution/35 px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#8A5A05]">
      <Info size={11} /> {children}
    </span>
  )
}

export function Note({ children, tone = 'neutral' }: { children: ReactNode; tone?: NodeTone }) {
  const map: Record<string, string> = {
    neutral: 'bg-slate-50 border-slate-200 text-slate-600',
    verify: 'bg-verify/[0.06] border-verify/30 text-verify-deep',
    caution: 'bg-caution/[0.07] border-caution/35 text-[#7A4F05]',
    adverse: 'bg-adverse/[0.06] border-adverse/30 text-[#9E2429]',
    primary: 'bg-navy-850/[0.04] border-navy-500/25 text-navy-700',
    external: 'bg-slate-50 border-slate-200 text-slate-600',
  }
  return (
    <div className={`rounded-lg border px-4 py-3 text-[13px] leading-relaxed ${map[tone]}`}>
      {children}
    </div>
  )
}

export function KeyValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-2.5 border-b border-[var(--line)] last:border-0">
      <dt className="eyebrow mb-1">{label}</dt>
      <dd className="text-[13.5px] leading-relaxed text-navy-850">{children}</dd>
    </div>
  )
}

export function BulletList({ items, tone = 'neutral' }: { items: string[]; tone?: NodeTone }) {
  if (!items.length) return <span className="text-slate-400 text-[13px]">—</span>
  return (
    <ul className="space-y-1.5">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-700">
          <span className={`mt-[7px] h-1 w-1 rounded-full flex-none ${TONE[tone].dot}`} />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  )
}

export function Code({ value }: { value: unknown }) {
  return (
    <pre className="mono text-[11.5px] leading-relaxed bg-navy-900 text-ink-dim rounded-lg p-4 overflow-x-auto">
      {JSON.stringify(value, null, 2)}
    </pre>
  )
}

export function Legend({ items }: { items: { tone: NodeTone; label: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-500">
          <span className={`h-2 w-2 rounded-sm ${TONE[i.tone].dot}`} />
          {i.label}
        </span>
      ))}
    </div>
  )
}
