import { motion } from 'framer-motion'
import { ArrowDown, TrendingDown, RotateCcw } from 'lucide-react'
import { LIFECYCLE, GROWTH_PATH, RISK_PATH, CHURN_PATH, LIFECYCLE_BY_ID } from '@/data/lifecycle'
import { HEALTH_SIGNALS, HEALTH_STATES, HEALTH_DISTRIBUTION } from '@/data/revenue'
import { useExplorer } from '@/state/explorer'
import { Chip, DemoBadge, Note, Panel, SectionHeader, TONE } from '@/components/ui'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend as RLegend,
} from 'recharts'

/** §8, §27 — customer lifecycle and customer success architecture. */

function StageCard({ id, index }: { id: string; index: number }) {
  const { open } = useExplorer()
  const s = LIFECYCLE_BY_ID.get(id)
  if (!s) return null
  const tone = s.track === 'risk' ? 'caution' : s.track === 'recovery' ? 'primary' : 'verify'
  const isFree = s.billingState.toLowerCase().includes('free') || s.billingState.includes('₹0')

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: Math.min(index * 0.025, 0.4) }}
      onClick={() => open({ kind: 'lifecycle', id })}
      className="w-full text-left group"
    >
      <div className={`panel panel-shadow p-4 border-l-[3px] transition-all hover:shadow-md ${TONE[tone].border} hover:border-l-[5px]`}>
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h3 className="text-[14px] font-semibold text-navy-850 leading-snug">{s.name}</h3>
          <span className="mono text-[10px] text-slate-400 flex-none mt-0.5">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <p className="text-[12.5px] leading-relaxed text-slate-600 mb-3">{s.definition}</p>
        <div className="flex flex-wrap gap-1.5">
          <Chip tone={isFree ? 'verify' : 'primary'}>{s.billingState}</Chip>
        </div>
      </div>
    </motion.button>
  )
}

export default function CustomerLifecycle() {
  return (
    <div className="px-5 md:px-8 py-7 max-w-[1400px]">
      <SectionHeader
        eyebrow="Customer lifecycle"
        title="From unknown to network participant"
        subtitle="Every stage is clickable — definition, what happens, who is involved, product actions, billing state, permissions, data state and next possible states. The single most important transition is Member → Requester: it is where a free identity becomes a paying customer."
      />

      <Note tone="verify">
        <strong>BID Member ≠ BID Customer.</strong> Membership is free and permanent. Being a customer
        is a separate, purchased state. An organization can be a verified subject and a paying
        requester at the same time — and churn ends the commercial relationship without destroying
        the identity.
      </Note>

      {/* Growth path */}
      <div className="mt-7">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-2 w-2 rounded-full bg-verify" />
          <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-navy-850">Growth path</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {GROWTH_PATH.map((id, i) => <StageCard key={id} id={id} index={i} />)}
        </div>
      </div>

      {/* Negative paths */}
      <div className="mt-9 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={14} className="text-caution" />
            <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-navy-850">Risk & recovery path</h2>
          </div>
          <div className="space-y-2">
            {RISK_PATH.map((id, i) => (
              <div key={id}>
                <StageCard id={id} index={i} />
                {i < RISK_PATH.length - 1 && (
                  <div className="flex justify-center py-1"><ArrowDown size={13} className="text-slate-300" /></div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <RotateCcw size={14} className="text-adverse" />
            <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-navy-850">Churn & win-back path</h2>
          </div>
          <div className="space-y-2">
            {CHURN_PATH.map((id, i) => (
              <div key={id}>
                <StageCard id={id} index={i} />
                {i < CHURN_PATH.length - 1 && (
                  <div className="flex justify-center py-1"><ArrowDown size={13} className="text-slate-300" /></div>
                )}
              </div>
            ))}
          </div>
          <Note tone="caution">
            A churned customer remains a <strong>BID Member</strong>. Its verified profile, credentials
            and BID ID persist. That retained identity is the strongest win-back asset there is.
          </Note>
        </div>
      </div>

      {/* Customer success */}
      <div className="mt-10">
        <SectionHeader
          eyebrow="Customer success architecture"
          title="Health signals and states"
          subtitle="Health scoring is part of the business architecture, not a CRM afterthought. Monitoring attach rate is the single strongest churn predictor in the model."
          right={<DemoBadge />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Panel className="lg:col-span-2">
            <p className="eyebrow mb-3">Cohort distribution — demo</p>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HEALTH_DISTRIBUTION} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E9EFF5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #DFE7F0' }}
                    labelStyle={{ fontWeight: 600, color: '#0B1F3A' }}
                  />
                  <RLegend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="healthy" stackId="1" stroke="#1DB954" fill="#1DB954" fillOpacity={0.18} name="Healthy" />
                  <Area type="monotone" dataKey="atRisk" stackId="1" stroke="#F5A623" fill="#F5A623" fillOpacity={0.2} name="At risk" />
                  <Area type="monotone" dataKey="dormant" stackId="1" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.2} name="Dormant" />
                  <Area type="monotone" dataKey="churned" stackId="1" stroke="#E5484D" fill="#E5484D" fillOpacity={0.2} name="Churned" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <p className="eyebrow mb-3">Customer states</p>
            <div className="space-y-1.5">
              {HEALTH_STATES.map((s) => (
                <div key={s.state} className="flex items-start gap-2.5 text-[12.5px]">
                  <span className={`mt-[6px] h-1.5 w-1.5 rounded-full flex-none ${TONE[s.tone as keyof typeof TONE].dot}`} />
                  <span>
                    <strong className="text-navy-850">{s.state}</strong>
                    <span className="text-slate-500"> — {s.definition}</span>
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="mt-4">
          <Panel pad={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-slate-50">
                    <th className="text-left px-4 py-2.5 eyebrow">Health signal</th>
                    <th className="text-left px-4 py-2.5 eyebrow w-[70px]">Weight</th>
                    <th className="text-left px-4 py-2.5 eyebrow">Healthy</th>
                    <th className="text-left px-4 py-2.5 eyebrow">Risk indicator</th>
                  </tr>
                </thead>
                <tbody>
                  {HEALTH_SIGNALS.map((s) => (
                    <tr key={s.signal} className="border-b border-[var(--line)] last:border-0 hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 font-medium text-navy-850">{s.signal}</td>
                      <td className="px-4 py-2.5 mono text-slate-500">{s.weight}%</td>
                      <td className="px-4 py-2.5 text-verify-deep">{s.healthy}</td>
                      <td className="px-4 py-2.5 text-[#8A5A05]">{s.risk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[11.5px] text-slate-500">
          {LIFECYCLE.length} stages defined. Click any stage card above for its full specification.
        </p>
      </div>
    </div>
  )
}
