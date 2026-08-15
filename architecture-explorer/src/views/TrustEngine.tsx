import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ShieldCheck, AlertTriangle, HelpCircle } from 'lucide-react'
import { DEFAULT_POLICY, ADDABLE_CHECKS } from '@/data/catalog'
import type { PolicySection } from '@/types'
import { useExplorer } from '@/state/explorer'
import { Chip, Note, Panel, SectionHeader, TONE } from '@/components/ui'

/** §12 — interactive policy builder, plus the explainable assessment framework (§14 of the strategy). */

const FREQUENCIES = ['Monthly', 'Quarterly', 'Half-yearly', 'Annually'] as const

const ASSESSMENT_DIMENSIONS = [
  { name: 'Identity', grade: 'VERIFIED', tone: 'verify', why: 'Corporate identity, PAN and GST confirmed against authoritative sources. Legal name matched at 0.97.' },
  { name: 'Compliance', grade: 'STRONG', tone: 'verify', why: 'All required registrations active. ISO 9001 confirmed with the issuing certification body. No lapses.' },
  { name: 'Financial', grade: 'VERIFIED', tone: 'verify', why: 'Bank account ownership confirmed via credit-into-account. Turnover band corroborated.' },
  { name: 'Documentation', grade: 'COMPLETE', tone: 'verify', why: '12 of 12 required items. No anomalies detected.' },
  { name: 'Risk Screening', grade: 'CLEAR', tone: 'verify', why: 'No confirmed matches. 1 potential match reviewed and dismissed — different entity, PAN mismatch.' },
  { name: 'Freshness', grade: 'CURRENT', tone: 'verify', why: 'Oldest contributing check: 12 days.' },
  { name: 'Continuity', grade: 'ESTABLISHED', tone: 'primary', why: 'Registered 2011. Continuous GST registration since 2017.' },
]

export default function TrustEngine() {
  const { open } = useExplorer()
  const [sections, setSections] = useState<PolicySection[]>(() =>
    DEFAULT_POLICY.map((s) => ({ ...s, checks: s.checks.map((c) => ({ ...c })) })),
  )
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>('Quarterly')
  const [addingTo, setAddingTo] = useState<string | null>(null)

  const totalChecks = sections.reduce((n, s) => n + s.checks.length, 0)
  const requiredChecks = sections.reduce((n, s) => n + s.checks.filter((c) => c.requirement === 'REQUIRED').length, 0)

  const toggleRequirement = (sectionId: string, checkId: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId ? s : {
          ...s,
          checks: s.checks.map((c) =>
            c.id !== checkId ? c : { ...c, requirement: c.requirement === 'REQUIRED' ? 'OPTIONAL' : 'REQUIRED' },
          ),
        },
      ),
    )

  const removeCheck = (sectionId: string, checkId: string) =>
    setSections((prev) =>
      prev.map((s) => (s.id !== sectionId ? s : { ...s, checks: s.checks.filter((c) => c.id !== checkId) })),
    )

  const addCheck = (sectionId: string, addable: (typeof ADDABLE_CHECKS)[number]) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId ? s : {
          ...s,
          checks: s.checks.some((c) => c.id === addable.id)
            ? s.checks
            : [...s.checks, { id: addable.id, name: addable.name, requirement: 'OPTIONAL' as const, minLevel: 'L2' as const, sourceClass: addable.sourceClass }],
        },
      ),
    )
    setAddingTo(null)
  }

  const reset = () => setSections(DEFAULT_POLICY.map((s) => ({ ...s, checks: s.checks.map((c) => ({ ...c })) })))

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1400px]">
      <SectionHeader
        eyebrow="Trust engine"
        title="Policy is the product"
        subtitle="Industry differences are configuration, never separate products. Edit the policy below — add checks, remove them, flip required/optional, change the monitoring frequency. This is a live demonstration of the configurable architecture; changes are held in component state and are not persisted."
        right={
          <button onClick={reset} className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-[12.5px] text-slate-600 hover:border-navy-500/50 hover:text-navy-850">
            Reset policy
          </button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
        {/* Builder */}
        <div>
          <Panel className="mb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow mb-1">Policy</p>
                <h3 className="text-[18px] font-semibold text-navy-850">Critical Supplier</h3>
                <p className="mono text-[11.5px] text-slate-500 mt-0.5">BID-POL-0031 · version 2.1 · immutable once activated</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="eyebrow mb-1">Checks</p>
                  <p className="mono text-[20px] font-semibold text-navy-850">{totalChecks}</p>
                </div>
                <div>
                  <p className="eyebrow mb-1">Required</p>
                  <p className="mono text-[20px] font-semibold text-verify-deep">{requiredChecks}</p>
                </div>
              </div>
            </div>
          </Panel>

          <div className="space-y-3">
            {sections.map((section) => {
              const available = ADDABLE_CHECKS.filter(
                (a) => a.section === section.id && !section.checks.some((c) => c.id === a.id),
              )
              return (
                <Panel key={section.id}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4 className="text-[13px] font-bold uppercase tracking-[0.08em] text-navy-850">{section.name}</h4>
                    <span className="text-[11.5px] text-slate-400">{section.checks.length} checks</span>
                  </div>

                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {section.checks.map((check) => (
                        <motion.div
                          key={check.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="flex items-center gap-3 rounded-lg border border-[var(--line)] px-3 py-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium text-navy-850 truncate">{check.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{check.sourceClass} · min level {check.minLevel}</p>
                          </div>
                          <button
                            onClick={() => toggleRequirement(section.id, check.id)}
                            className={`flex-none rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider border transition-colors ${
                              check.requirement === 'REQUIRED'
                                ? `${TONE.verify.chip} ${TONE.verify.border}`
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                            title="Toggle required / optional"
                          >
                            {check.requirement}
                          </button>
                          <button
                            onClick={() => removeCheck(section.id, check.id)}
                            className="flex-none rounded-md p-1 text-slate-300 hover:text-adverse hover:bg-adverse/[0.07]"
                            aria-label={`Remove ${check.name}`}
                          >
                            <X size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {available.length > 0 && (
                    <div className="mt-2.5">
                      {addingTo === section.id ? (
                        <div className="flex flex-wrap gap-1.5">
                          {available.map((a) => (
                            <button
                              key={a.id} onClick={() => addCheck(section.id, a)}
                              className="rounded-md border border-verify/40 bg-verify/[0.06] px-2.5 py-1.5 text-[12px] text-verify-deep hover:bg-verify/[0.12]"
                            >
                              + {a.name}
                            </button>
                          ))}
                          <button onClick={() => setAddingTo(null)} className="rounded-md px-2.5 py-1.5 text-[12px] text-slate-500 hover:text-navy-850">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingTo(section.id)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-[var(--line)] px-3 py-1.5 text-[12px] text-slate-500 hover:border-verify/50 hover:text-verify-deep"
                        >
                          <Plus size={13} /> Add check
                        </button>
                      )}
                    </div>
                  )}
                </Panel>
              )
            })}

            <Panel>
              <h4 className="text-[13px] font-bold uppercase tracking-[0.08em] text-navy-850 mb-3">Monitoring</h4>
              <p className="text-[12.5px] text-slate-600 mb-3">
                Re-verification frequency. Monitoring is what converts a one-time transaction into
                recurring revenue — and it is the strongest churn predictor in the model.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {FREQUENCIES.map((f) => (
                  <Chip key={f} tone="verify" active={frequency === f} onClick={() => setFrequency(f)}>{f}</Chip>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        {/* Side: what the policy produces */}
        <div className="space-y-4">
          <Panel>
            <p className="eyebrow mb-2">The equation</p>
            <div className="space-y-2 text-center py-2">
              <div className="rounded-lg bg-navy-850/[0.05] border border-navy-500/20 py-2.5 text-[12.5px] font-medium text-navy-850">CORE PLATFORM</div>
              <div className="text-slate-400 text-[15px]">+</div>
              <div className="rounded-lg bg-verify/[0.08] border border-verify/35 py-2.5 text-[12.5px] font-medium text-verify-deep">VERIFICATION POLICY</div>
              <div className="text-slate-400 text-[15px]">=</div>
              <div className="rounded-lg bg-navy-900 py-2.5 text-[12.5px] font-medium text-white">INDUSTRY WORKFLOW</div>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={15} className="text-verify-deep" />
              <p className="eyebrow">Explainable assessment</p>
            </div>
            <div className="rounded-lg border border-verify/35 bg-verify/[0.06] px-3 py-2.5 mb-3 text-center">
              <p className="text-[15px] font-bold text-verify-deep tracking-wide">● LOW RISK</p>
              <p className="text-[11px] text-slate-500 mt-1">Rubric v2.1 · valid to 15 Nov 2026</p>
            </div>
            <div className="space-y-2.5">
              {ASSESSMENT_DIMENSIONS.map((d) => (
                <div key={d.name} className="border-b border-[var(--line)] last:border-0 pb-2.5 last:pb-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[12.5px] font-medium text-navy-850">{d.name}</span>
                    <span className={`text-[11px] font-semibold ${TONE[d.tone as keyof typeof TONE].text}`}>{d.grade}</span>
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-slate-500">{d.why}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Note tone="caution">
            <div className="flex gap-2">
              <AlertTriangle size={15} className="flex-none mt-0.5" />
              <span>
                <strong>No opaque score.</strong> Every grade traces to its inputs and is reproducible.
                A black-box number deciding whether a business wins a contract is indefensible —
                legally, ethically and commercially.
              </span>
            </div>
          </Note>

          <Note tone="primary">
            <div className="flex gap-2">
              <HelpCircle size={15} className="flex-none mt-0.5" />
              <span>
                <strong>INSUFFICIENT EVIDENCE ≠ HIGH RISK.</strong> A small proprietorship with no
                filed financials is unmeasured, not dangerous. Collapsing the two would
                systematically penalise the MSMEs the network depends on.
              </span>
            </div>
          </Note>

          <button onClick={() => open({ kind: 'component', id: 'policy-engine' })} className="w-full">
            <Panel className="hover:border-verify/50 transition-colors text-left">
              <p className="text-[13px] font-medium text-navy-850">Policy Engine →</p>
              <p className="text-[12px] text-slate-500 mt-0.5">Open the full component specification</p>
            </Panel>
          </button>
        </div>
      </div>
    </div>
  )
}
