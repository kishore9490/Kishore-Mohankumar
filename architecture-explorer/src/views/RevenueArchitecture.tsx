import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, TrendingUp } from 'lucide-react'
import { PLANS, REVENUE_LINES, EXPANSION_STEPS, PRICING_DISCLAIMER } from '@/data/revenue'
import { Chip, DemoBadge, Note, Panel, SectionHeader, TONE } from '@/components/ui'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts'

/** §20, §21 — revenue architecture and land-and-expand. */
export default function RevenueArchitecture() {
  const [step, setStep] = useState(EXPANSION_STEPS.length - 1)

  const chartData = EXPANSION_STEPS.map((s, i) => ({
    name: s.stage.replace('+ ', ''),
    arr: s.arr,
    active: i <= step,
  }))

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1400px]">
      <SectionHeader
        eyebrow="Revenue architecture"
        title="Money flow and expansion"
        subtitle="Ten revenue lines across three legs — recurring platform, consumption, and services. Services should land accounts, never become the business."
        right={<DemoBadge>Illustrative</DemoBadge>}
      />

      <Note tone="caution">
        <strong>{PRICING_DISCLAIMER}</strong>
      </Note>

      {/* Money flow */}
      <div className="mt-6 mb-9">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-4">
          <Panel className="text-center">
            <p className="eyebrow mb-2">Customer</p>
            <p className="text-[13.5px] font-semibold text-navy-850">Requester organization</p>
            <p className="text-[11.5px] text-slate-500 mt-1.5">Pays subscription + consumption</p>
          </Panel>
          <div className="flex justify-center"><ArrowDown size={18} className="text-slate-300 md:-rotate-90" /></div>
          <Panel className="text-center border-verify/40 bg-verify/[0.04]">
            <p className="eyebrow mb-2 text-verify-deep">BID Trust</p>
            <p className="text-[13.5px] font-semibold text-navy-850">Orchestration + workflow + evidence</p>
            <p className="text-[11.5px] text-slate-500 mt-1.5">Gross margin lives here</p>
          </Panel>
          <div className="flex justify-center"><ArrowDown size={18} className="text-slate-300 md:-rotate-90" /></div>
          <Panel className="text-center border-dashed">
            <p className="eyebrow mb-2">Provider costs</p>
            <p className="text-[13.5px] font-semibold text-navy-850">Per-check fees</p>
            <p className="text-[11.5px] text-slate-500 mt-1.5">Falls as reuse density rises</p>
          </Panel>
        </div>
        <p className="text-center text-[12px] text-slate-500 mt-3">
          The member being verified pays <strong className="text-verify-deep">₹0</strong> — always. The requester side is monetized.
        </p>
      </div>

      {/* Plans */}
      <SectionHeader eyebrow="Platform subscription" title="Plans" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-9">
        {PLANS.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.25 }}>
            <Panel className={`h-full ${i === 1 ? 'border-verify/45' : ''}`}>
              <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-navy-850">BID {p.name}</p>
              <p className="mt-2.5">
                <span className="text-[11px] text-slate-500">Starting at </span>
                <span className="mono text-[22px] font-semibold text-navy-850">{p.price}</span>
                <span className="text-[12px] text-slate-500">{p.period}</span>
              </p>
              <p className="text-[12px] text-slate-500 mt-2 leading-relaxed">{p.for}</p>
              <ul className="mt-3 space-y-1">
                {p.limits.map((l) => (
                  <li key={l} className="text-[12px] text-slate-600 flex gap-2">
                    <span className="mt-[7px] h-1 w-1 rounded-full bg-verify flex-none" />{l}
                  </li>
                ))}
              </ul>
            </Panel>
          </motion.div>
        ))}
      </div>

      {/* Revenue lines */}
      <SectionHeader eyebrow="Ten lines" title="Revenue sources" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-9">
        {REVENUE_LINES.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.22 }}>
            <Panel className="h-full">
              <div className="flex items-start gap-3">
                <span className="mono text-[11px] font-semibold text-slate-400 flex-none mt-0.5">{String(r.n).padStart(2, '0')}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <p className="text-[13.5px] font-semibold text-navy-850">{r.name}</p>
                    <span className="mono text-[12px] text-verify-deep">{r.price}</span>
                    <Chip tone={r.type.includes('Recurring') ? 'verify' : r.type === 'One-time' ? 'caution' : 'primary'}>{r.type}</Chip>
                  </div>
                  <p className="text-[12px] leading-relaxed text-slate-500 mt-1.5">{r.note}</p>
                </div>
              </div>
            </Panel>
          </motion.div>
        ))}
      </div>

      {/* Expansion */}
      <SectionHeader
        eyebrow="Land and expand"
        title="Revenue expansion path"
        subtitle="Expansion comes from more entities, more relationship types and more functions — not from a renegotiated subscription. Click a stage to see the account at that point."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        <Panel>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-verify-deep" />
            <p className="eyebrow">Annual contribution (₹ thousands) — illustrative</p>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 46, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9EFF5" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} angle={-32} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(11,31,58,0.04)' }}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #DFE7F0' }}
                  formatter={(v: number) => [`₹${v}k`, 'Annual contribution']}
                />
                <Bar dataKey="arr" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.active ? '#1DB954' : '#CBD8E6'} cursor="pointer" onClick={() => setStep(i)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="space-y-2">
          {EXPANSION_STEPS.map((s, i) => (
            <button key={s.stage} onClick={() => setStep(i)} className="w-full text-left">
              <div className={`panel px-3.5 py-2.5 border-l-[3px] transition-all ${
                i <= step ? `${TONE.verify.border} bg-verify/[0.04]` : 'border-l-slate-200'
              }`}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12.5px] font-medium text-navy-850">{s.stage}</span>
                  <span className="mono text-[12px] text-verify-deep flex-none">₹{s.arr}k</span>
                </div>
                {i === step && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="text-[11.5px] text-slate-500 mt-1.5 leading-relaxed">
                    {s.note}
                  </motion.p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Note tone="verify">
          <strong>Monitoring is the retention engine.</strong> A customer receiving useful alerts every
          month does not churn. Push it into every deal — free at first if necessary — and charge for
          it at renewal.
        </Note>
      </div>
    </div>
  )
}
