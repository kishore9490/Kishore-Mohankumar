import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, CheckCircle2, Clock, AlertTriangle, UserCheck } from 'lucide-react'
import { PIPELINE } from '@/data/catalog'
import { CAMPAIGN, DEMO_NOTICE } from '@/data/demo'
import { useExplorer } from '@/state/explorer'
import { Chip, Code, DemoBadge, Note, Panel, SectionHeader, TONE } from '@/components/ui'

/** §13, §15, §16 — pipeline, BGV flow and vendor campaign. */

const BGV_STAGES = [
  { name: 'ABC IT Company', sub: 'Employer initiates', tone: 'primary' },
  { name: 'Candidate: Ravi', sub: 'Receives notice first', tone: 'caution' },
  { name: 'BGV Policy', sub: 'Standard package', tone: 'verify' },
  { name: 'Candidate Consent', sub: 'Item-level, revocable', tone: 'verify' },
  { name: 'Checks', sub: 'Identity · Education · Employment · Address · Legal · Documents', tone: 'primary' },
  { name: 'Provider Orchestration', sub: 'Mock adapters', tone: 'neutral' },
  { name: 'Evidence', sub: 'Immutable, hashed', tone: 'verify' },
  { name: 'Assessment', sub: 'Check-level outcomes only', tone: 'verify' },
  { name: 'BGV Report', sub: 'To employer, scoped to purpose', tone: 'primary' },
]

const STATUS_TONE: Record<string, keyof typeof TONE> = {
  COMPLETED: 'verify', PENDING: 'caution', EXCEPTION: 'adverse', REGISTERED: 'primary', INVITED: 'neutral',
}

export default function VerificationLifecycle() {
  const { open } = useExplorer()
  const [active, setActive] = useState(0)
  const [tab, setTab] = useState<'pipeline' | 'bgv' | 'campaign'>('pipeline')
  const step = PIPELINE[active]

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1400px]">
      <SectionHeader
        eyebrow="Verification lifecycle"
        title="From request to continuous monitoring"
        subtitle="Fourteen steps, each clickable, with example data flowing through the pipeline. Note where the process deliberately stops: consent before execution, human disposition before any adverse conclusion, and monitoring after the report rather than an ending."
        right={
          <div className="flex gap-1 rounded-lg border border-[var(--line)] bg-white p-0.5">
            {([['pipeline', 'Pipeline'], ['bgv', 'Candidate BGV'], ['campaign', 'Vendor campaign']] as const).map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                className={`rounded-md px-3 py-1.5 text-[12.5px] transition-colors ${tab === id ? 'bg-navy-900 text-white' : 'text-slate-600 hover:text-navy-850'}`}>
                {label}
              </button>
            ))}
          </div>
        }
      />

      {tab === 'pipeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
          <div className="space-y-1">
            {PIPELINE.map((p, i) => (
              <button
                key={p.id}
                onClick={() => { setActive(i); open({ kind: 'pipeline', id: p.id }) }}
                onMouseEnter={() => setActive(i)}
                className={`w-full text-left flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all ${
                  i === active ? 'border-verify/50 bg-verify/[0.06] shadow-sm' : 'border-[var(--line)] bg-white hover:border-navy-500/40'
                }`}
              >
                <span className={`mono text-[10.5px] flex-none rounded px-1.5 py-0.5 ${i === active ? 'bg-verify text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-medium text-navy-850 truncate">{p.name}</span>
                  <span className="block text-[11px] text-slate-500 truncate">{p.owner}</span>
                </span>
                <ChevronRight size={13} className={i === active ? 'text-verify-deep' : 'text-slate-300'} />
              </button>
            ))}
          </div>

          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <Panel className="mb-4">
                  <p className="eyebrow mb-1.5">Step {active + 1} of {PIPELINE.length} · {step.owner}</p>
                  <h3 className="text-[20px] font-semibold text-navy-850 mb-2">{step.name}</h3>
                  <p className="text-[14px] leading-relaxed text-slate-600 mb-4">{step.purpose}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="eyebrow mb-2">Inputs</p>
                      <ul className="space-y-1">
                        {step.inputs.map((x) => (
                          <li key={x} className="text-[12.5px] text-slate-600 flex gap-2">
                            <span className="mt-[7px] h-1 w-1 rounded-full bg-slate-400 flex-none" />{x}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="eyebrow mb-2">Outputs</p>
                      <ul className="space-y-1">
                        {step.outputs.map((x) => (
                          <li key={x} className="text-[12.5px] text-verify-deep flex gap-2">
                            <span className="mt-[7px] h-1 w-1 rounded-full bg-verify flex-none" />{x}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="eyebrow mb-2">Example data at this step</p>
                  <Code value={step.sampleData} />

                  <div className="mt-4">
                    <p className="eyebrow mb-2">Failure modes</p>
                    <ul className="space-y-1">
                      {step.failureModes.map((x) => (
                        <li key={x} className="text-[12.5px] text-[#8A5A05] flex gap-2">
                          <AlertTriangle size={12} className="mt-[3px] flex-none" />{x}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Panel>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {tab === 'bgv' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
          <Panel>
            <p className="eyebrow mb-4">Candidate BGV flow</p>
            <div className="space-y-2">
              {BGV_STAGES.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, delay: i * 0.05 }}
                >
                  <div className={`rounded-lg border px-4 py-3 ${TONE[s.tone as keyof typeof TONE].chip} ${TONE[s.tone as keyof typeof TONE].border}`}>
                    <p className="text-[13.5px] font-semibold">{s.name}</p>
                    <p className="text-[11.5px] opacity-80 mt-0.5">{s.sub}</p>
                  </div>
                  {i < BGV_STAGES.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <span className="text-slate-300 text-[13px]">↓</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </Panel>

          <div className="space-y-4">
            <Note tone="verify">
              <div className="flex gap-2">
                <UserCheck size={15} className="flex-none mt-0.5" />
                <span>
                  <strong>The candidate pays ₹0.</strong> Always. The employer, authorized business or
                  verification partner pays per the commercial model. A candidate is never charged to
                  be verified for a job.
                </span>
              </div>
            </Note>
            <Note tone="adverse">
              <strong>No public database of people.</strong> A person's BGV result is not a shareable
              asset. It goes to the requesting employer under its stated purpose only, is never
              publicly resolvable, and is never reusable across employers without fresh consent.
            </Note>
            <Note tone="caution">
              <strong>UNABLE TO VERIFY is not a negative finding.</strong> A former employer that has
              shut down, or simply does not answer email, tells you nothing about the candidate. The
              UI must never render it as a red flag.
            </Note>
            <Panel>
              <p className="eyebrow mb-2">Candidate rights, built in</p>
              <ul className="space-y-1.5 text-[12.5px] text-slate-600">
                {['Notice before any check runs', 'Item-level, revocable consent', 'Consent receipt retained by the candidate', 'Sees their own complete result', 'Can dispute any finding before it is treated as final', 'Employer never receives a hiring recommendation'].map((x) => (
                  <li key={x} className="flex gap-2"><CheckCircle2 size={13} className="text-verify mt-[3px] flex-none" />{x}</li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      )}

      {tab === 'campaign' && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-[16px] font-semibold text-navy-850">{CAMPAIGN.name}</h3>
              <p className="mono text-[11.5px] text-slate-500">{CAMPAIGN.id} · {CAMPAIGN.policy} · owner {CAMPAIGN.owner}</p>
            </div>
            <DemoBadge />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
            {([
              ['Invited', CAMPAIGN.stats.invited, 'neutral'],
              ['Registered', CAMPAIGN.stats.registered, 'primary'],
              ['Completed', CAMPAIGN.stats.completed, 'verify'],
              ['Pending', CAMPAIGN.stats.pending, 'caution'],
              ['Exception', CAMPAIGN.stats.exception, 'adverse'],
            ] as const).map(([label, value, tone]) => (
              <Panel key={label}>
                <p className="eyebrow mb-1.5">{label}</p>
                <p className={`mono text-[26px] font-semibold leading-none ${TONE[tone].text}`}>{value}</p>
              </Panel>
            ))}
          </div>

          <Note tone="adverse">
            <div className="flex gap-2">
              <AlertTriangle size={15} className="flex-none mt-0.5" />
              <span><strong>Exception:</strong> {CAMPAIGN.exceptionDetail}</span>
            </div>
          </Note>

          <div className="mt-4">
            <Panel pad={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[var(--line)] bg-slate-50">
                      {['Vendor', 'BID ID', 'Status', 'Checks', 'Assessment', 'Level', 'Last verified', 'Monitoring'].map((h) => (
                        <th key={h} className="text-left px-4 py-2.5 eyebrow whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CAMPAIGN.members.map((m) => (
                      <tr key={m.name} className="border-b border-[var(--line)] last:border-0 hover:bg-slate-50/60">
                        <td className="px-4 py-2.5 font-medium text-navy-850 whitespace-nowrap">{m.name}</td>
                        <td className="px-4 py-2.5 mono text-[11.5px] text-slate-500 whitespace-nowrap">{m.bidId}</td>
                        <td className="px-4 py-2.5"><Chip tone={STATUS_TONE[m.status]}>{m.status}</Chip></td>
                        <td className="px-4 py-2.5 mono text-slate-600 whitespace-nowrap">{m.checks.passed}/{m.checks.total}</td>
                        <td className={`px-4 py-2.5 whitespace-nowrap ${m.assessment === 'LOW RISK' ? 'text-verify-deep' : m.assessment === 'EXCEPTION' ? 'text-[#B32D33]' : 'text-slate-500'}`}>
                          {m.assessment}
                        </td>
                        <td className="px-4 py-2.5 mono text-slate-600">{m.level}</td>
                        <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{m.lastVerified}</td>
                        <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                          {m.monitoring.startsWith('Active') ? (
                            <span className="inline-flex items-center gap-1.5 text-verify-deep"><span className="h-1.5 w-1.5 rounded-full bg-verify" />{m.monitoring}</span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5"><Clock size={11} />{m.monitoring}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
            <p className="mt-3 text-[11.5px] text-slate-500">{DEMO_NOTICE}</p>
          </div>
        </div>
      )}
    </div>
  )
}
