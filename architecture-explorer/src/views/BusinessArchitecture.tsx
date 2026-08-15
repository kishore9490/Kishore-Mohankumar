import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Layers3 } from 'lucide-react'
import { INDUSTRIES, CAPABILITY_MAP } from '@/data/catalog'
import { COMPONENT_BY_ID } from '@/data/layers'
import { useExplorer } from '@/state/explorer'
import { Chip, Note, Panel, SectionHeader } from '@/components/ui'

/** §11, §38 — domain-agnostic proof and the business→technical capability map. */
export default function BusinessArchitecture() {
  const { open } = useExplorer()
  const [selected, setSelected] = useState(INDUSTRIES[0].id)
  const industry = INDUSTRIES.find((i) => i.id === selected)!

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1400px]">
      <SectionHeader
        eyebrow="Business architecture"
        title="One engine, every industry"
        subtitle="Selecting an industry does not open a different application. It changes exactly one thing — the verification policy. The core platform underneath is byte-for-byte identical, and that is the whole domain-agnostic thesis."
      />

      <div className="flex flex-wrap gap-2 mb-5">
        {INDUSTRIES.map((i) => (
          <Chip key={i.id} tone="verify" active={selected === i.id} onClick={() => setSelected(i.id)}>
            {i.name}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 mb-9">
        <Panel>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-4">
            <div className="rounded-xl border border-navy-500/25 bg-navy-850/[0.04] p-4 text-center">
              <Layers3 size={18} className="mx-auto mb-2 text-navy-700" />
              <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-navy-850">Core Platform</p>
              <p className="text-[11.5px] text-slate-500 mt-1.5 leading-relaxed">
                Identity · Relationships · Verification · Evidence · Consent · Monitoring
              </p>
              <p className="mono text-[10.5px] text-slate-400 mt-2">unchanged for every industry</p>
            </div>

            <div className="text-center text-[20px] text-slate-300 font-light">+</div>

            <AnimatePresence mode="wait">
              <motion.div
                key={industry.id}
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="rounded-xl border border-verify/40 bg-verify/[0.07] p-4 text-center"
              >
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-verify-deep">Verification Policy</p>
                <p className="text-[13.5px] font-semibold text-navy-850 mt-1.5">{industry.policy}</p>
                <p className="mono text-[10.5px] text-slate-500 mt-2">configuration, not code</p>
              </motion.div>
            </AnimatePresence>

            <div className="text-center text-[20px] text-slate-300 font-light">=</div>

            <div className="rounded-xl bg-navy-900 p-4 text-center text-white">
              <p className="text-[12px] font-bold uppercase tracking-[0.1em]">Industry Workflow</p>
              <p className="text-[13.5px] font-semibold mt-1.5">{industry.name}</p>
              <p className="mono text-[10.5px] text-ink-faint mt-2">zero new services</p>
            </div>
          </div>
        </Panel>

        <Panel>
          <p className="eyebrow mb-2">{industry.name}</p>
          <p className="text-[13px] leading-relaxed text-slate-600 mb-4">{industry.note}</p>
          <p className="eyebrow mb-2">Distinctive checks</p>
          <ul className="space-y-1.5 mb-4">
            {industry.distinctiveChecks.map((c) => (
              <li key={c} className="text-[12.5px] text-slate-700 flex gap-2">
                <span className="mt-[7px] h-1 w-1 rounded-full bg-verify flex-none" />{c}
              </li>
            ))}
          </ul>
          <button onClick={() => open({ kind: 'industry', id: industry.id })}
            className="inline-flex items-center gap-1.5 text-[12.5px] text-navy-700 hover:text-verify-deep">
            Full configuration <ArrowRight size={12} />
          </button>
        </Panel>
      </div>

      <Note tone="verify">
        <strong>Sixteen industries, one codebase.</strong> Domain expertise ships as policy templates,
        which are a sellable and accumulating asset. A new sector is a configuration exercise, not an
        engineering project.
      </Note>

      {/* Capability map */}
      <div className="mt-9">
        <SectionHeader
          eyebrow="Business ↔ technical"
          title="Every capability maps to services"
          subtitle="A technical architecture that ignores the business is decoration. Each business capability below lists the exact services that deliver it — click any service to open its specification."
        />
        <div className="space-y-3">
          {CAPABILITY_MAP.map((cap, i) => (
            <motion.div
              key={cap.capability}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: i * 0.04 }}
            >
              <Panel>
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
                  <div>
                    <p className="text-[14px] font-semibold text-navy-850">{cap.capability}</p>
                    <p className="text-[12px] leading-relaxed text-slate-500 mt-1">{cap.outcome}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 content-start">
                    {cap.services.map((sid) => {
                      const c = COMPONENT_BY_ID.get(sid)
                      if (!c) return null
                      return (
                        <button
                          key={sid} onClick={() => open({ kind: 'component', id: sid })}
                          className="rounded-md border border-[var(--line)] bg-white px-2.5 py-1.5 text-[11.5px] text-navy-700 hover:border-verify/50 hover:bg-verify/[0.05] transition-colors"
                        >
                          {c.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </Panel>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
