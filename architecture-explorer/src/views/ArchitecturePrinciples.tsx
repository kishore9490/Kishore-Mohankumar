import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldOff } from 'lucide-react'
import { PRINCIPLES, ADRS } from '@/data/catalog'
import { useExplorer } from '@/state/explorer'
import { Chip, Note, Panel, SectionHeader } from '@/components/ui'

/** §36, §37 — principles and architecture decision records. */

const FACET_ORDER = ['Platform', 'Entity model', 'Commercial', 'Trust', 'Governance', 'Integration', 'Network', 'Boundary']

export default function ArchitecturePrinciples() {
  const { open } = useExplorer()
  const [facet, setFacet] = useState<string | null>(null)

  const shown = facet ? PRINCIPLES.filter((p) => p.facet === facet) : PRINCIPLES

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1400px]">
      <SectionHeader
        eyebrow="Architecture principles"
        title="Thirty non-negotiables"
        subtitle="These govern every decision in the explorer. Where a principle constrains what BID may become — the Boundary group — it is doing its most valuable work: naming the adjacent product that would be profitable and is nevertheless off the table."
      />

      <div className="flex flex-wrap gap-2 mb-5">
        <Chip tone="primary" active={facet === null} onClick={() => setFacet(null)}>All ({PRINCIPLES.length})</Chip>
        {FACET_ORDER.map((f) => {
          const n = PRINCIPLES.filter((p) => p.facet === f).length
          if (!n) return null
          return (
            <Chip key={f} tone={f === 'Boundary' ? 'adverse' : 'verify'} active={facet === f} onClick={() => setFacet(facet === f ? null : f)}>
              {f} ({n})
            </Chip>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-10">
        {shown.map((p, i) => (
          <motion.div
            key={p.n}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.3) }}
          >
            <Panel className={`h-full ${p.facet === 'Boundary' ? 'border-adverse/30 bg-adverse/[0.02]' : ''}`}>
              <div className="flex gap-3">
                <span className={`mono text-[10.5px] font-semibold rounded px-1.5 py-0.5 flex-none h-fit ${
                  p.facet === 'Boundary' ? 'bg-adverse/10 text-[#B32D33] border border-adverse/25' : 'bg-verify/10 text-verify-deep border border-verify/25'
                }`}>
                  {String(p.n).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] leading-relaxed text-navy-850 font-medium">{p.text}</p>
                  <p className="text-[10.5px] uppercase tracking-wider text-slate-400 mt-1.5">{p.facet}</p>
                </div>
              </div>
            </Panel>
          </motion.div>
        ))}
      </div>

      <Note tone="adverse">
        <div className="flex gap-2">
          <ShieldOff size={16} className="flex-none mt-0.5" />
          <span>
            <strong>The boundary principles are the load-bearing ones.</strong> "Not a credit bureau",
            "not a government identity", "not a marketplace" each rule out a plausible, profitable
            adjacent product. They exist because the moment BID earns from matching or ranking,
            every verification outcome it publishes becomes commercially suspect — and the
            credibility the entire platform rests on is gone.
          </span>
        </div>
      </Note>

      {/* ADRs */}
      <div className="mt-10">
        <SectionHeader
          eyebrow="Decision records"
          title="Ten ADRs"
          subtitle="Each records the context, the decision, its consequences and the alternative that was rejected — including what the rejected option would have cost. Click for the full record."
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {ADRS.map((a, i) => (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: Math.min(i * 0.04, 0.4) }}
              onClick={() => open({ kind: 'adr', id: a.id })}
              className="text-left group"
            >
              <Panel className="h-full hover:border-verify/50 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="mono text-[11px] text-slate-400 mb-1">{a.id}</p>
                    <h3 className="text-[14.5px] font-semibold text-navy-850 leading-snug">{a.title}</h3>
                  </div>
                  <Chip tone="verify">{a.status}</Chip>
                </div>
                <p className="text-[12.5px] leading-relaxed text-slate-600 line-clamp-3">{a.decision}</p>
                <span className="inline-flex items-center gap-1.5 text-[12px] text-navy-700 mt-3 group-hover:text-verify-deep">
                  Full record <ArrowRight size={12} />
                </span>
              </Panel>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
