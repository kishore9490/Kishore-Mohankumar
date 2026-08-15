import { useMemo, useState } from 'react'
import type { Node, Edge } from '@xyflow/react'
import { motion } from 'framer-motion'
import { Zap, ZapOff, IndianRupee, Activity, Shuffle } from 'lucide-react'
import { useExplorer } from '@/state/explorer'
import { FlowCanvas, flowEdge } from '@/components/flow'
import { Chip, Note, Panel, SectionHeader, TONE } from '@/components/ui'

/** §14 — provider orchestration, fallback and normalization. */

const PROVIDERS = [
  { id: 'pa', name: 'Provider A', cost: 8.0, level: 'L3', latency: '812ms', sla: '99.5%' },
  { id: 'pb', name: 'Provider B', cost: 11.0, level: 'L3', latency: '1.2s', sla: '99.2%' },
  { id: 'pc', name: 'Provider C', cost: 4.0, level: 'L2', latency: '640ms', sla: '98.8%' },
]

const CAPABILITIES = [
  'Provider abstraction', 'Fallback chains', 'Cost optimization', 'Availability monitoring',
  'SLA monitoring', 'Response normalization', 'Confidence rating', 'Idempotency',
  'Circuit breaking', 'Cost ledger per call', 'Quality comparison', 'Reuse cache',
]

export default function ProviderArchitecture() {
  const { open } = useExplorer()
  const [failed, setFailed] = useState<string | null>(null)

  const selected = failed === 'pa' ? 'pb' : 'pa'

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [
      { id: 'engine', type: 'box', position: { x: 250, y: 0 }, data: { label: 'Verification Engine', sub: 'GST check required · L2', tone: 'verify', onOpen: () => open({ kind: 'component', id: 'verification-engine' }) }, draggable: false },
      { id: 'router', type: 'box', position: { x: 250, y: 110 }, data: { label: 'Provider Router', sub: 'capability · eligibility · cost · health', tone: 'primary', onOpen: () => open({ kind: 'component', id: 'provider-orchestrator' }) }, draggable: false },
      ...PROVIDERS.map((p, i) => ({
        id: p.id, type: 'box', position: { x: i * 220, y: 240 },
        data: {
          label: p.name,
          sub: failed === p.id ? 'UNAVAILABLE' : `₹${p.cost.toFixed(2)} · ${p.level} · ${p.sla}`,
          tone: failed === p.id ? 'adverse' : selected === p.id ? 'verify' : 'external',
          dim: p.level === 'L2' && failed !== p.id,
        },
        draggable: false,
      } as Node)),
      { id: 'normalizer', type: 'box', position: { x: 250, y: 370 }, data: { label: 'Normalizer', sub: 'canonical schema + confidence', tone: 'primary', onOpen: () => open({ kind: 'component', id: 'provider-orchestrator' }) }, draggable: false },
      { id: 'evidence', type: 'box', position: { x: 250, y: 480 }, data: { label: 'Evidence Service', sub: 'immutable · hashed', tone: 'verify', onOpen: () => open({ kind: 'component', id: 'evidence-service' }) }, draggable: false },
    ]

    const edges: Edge[] = [
      flowEdge('e1', 'engine', 'router', { animated: true, tone: 'verify' }),
      ...PROVIDERS.map((p) =>
        flowEdge(`r-${p.id}`, 'router', p.id, {
          animated: selected === p.id,
          tone: failed === p.id ? 'adverse' : selected === p.id ? 'verify' : 'neutral',
          label: failed === p.id ? 'failed' : selected === p.id ? 'selected' : 'fallback',
          dim: p.level === 'L2' && failed !== p.id,
        }),
      ),
      flowEdge('n1', selected, 'normalizer', { animated: true, tone: 'verify' }),
      flowEdge('n2', 'normalizer', 'evidence', { animated: true, tone: 'verify' }),
    ]
    return { nodes, edges }
  }, [failed, selected, open])

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1400px]">
      <SectionHeader
        eyebrow="Provider architecture"
        title="Orchestration, not ownership"
        subtitle="BID does not build verification data sources. It builds the layer that makes many sources usable, reliable, auditable and economical. Trigger a provider failure below to watch the fallback chain route around it."
        right={
          <button
            onClick={() => setFailed(failed === 'pa' ? null : 'pa')}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[12.5px] font-medium border transition-colors ${
              failed ? 'bg-adverse/10 border-adverse/40 text-[#B32D33]' : 'bg-white border-[var(--line)] text-slate-600 hover:border-navy-500/50'
            }`}
          >
            {failed ? <ZapOff size={14} /> : <Zap size={14} />}
            {failed ? 'Restore Provider A' : 'Simulate Provider A outage'}
          </button>
        }
      />

      <FlowCanvas nodes={nodes} edges={edges} height={560} />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {PROVIDERS.map((p) => {
          const isFailed = failed === p.id
          const isSelected = selected === p.id
          const ineligible = p.level === 'L2'
          const tone = isFailed ? 'adverse' : isSelected ? 'verify' : 'neutral'
          return (
            <motion.div key={p.id} animate={{ scale: isSelected ? 1.01 : 1 }} transition={{ duration: 0.2 }}>
              <Panel className={`h-full ${isSelected ? 'border-verify/45' : ''}`}>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <p className="text-[13.5px] font-semibold text-navy-850">{p.name}</p>
                  <Chip tone={tone}>
                    {isFailed ? 'Unavailable' : isSelected ? 'Selected' : ineligible ? 'Ineligible' : 'Fallback'}
                  </Chip>
                </div>
                <dl className="space-y-1.5 text-[12px]">
                  <div className="flex justify-between"><dt className="text-slate-500">Cost per call</dt><dd className="mono text-navy-850">₹{p.cost.toFixed(2)}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">Max level</dt><dd className="mono text-navy-850">{p.level}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">p50 latency</dt><dd className="mono text-navy-850">{p.latency}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">SLA</dt><dd className="mono text-navy-850">{p.sla}</dd></div>
                </dl>
                {ineligible && (
                  <p className="mt-2.5 text-[11px] text-[#8A5A05] leading-relaxed">
                    Cheapest, but cannot reach the required level — cost never overrides confidence.
                  </p>
                )}
              </Panel>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-7">
        <SectionHeader eyebrow="Orchestrator responsibilities" title="What the abstraction buys" />
        <div className="flex flex-wrap gap-2">
          {CAPABILITIES.map((c) => (
            <span key={c} className={`rounded-lg border px-3 py-2 text-[12.5px] ${TONE.primary.chip} ${TONE.primary.border}`}>
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Note tone="adverse">
          <div className="flex gap-2">
            <Shuffle size={15} className="flex-none mt-0.5" />
            <span>
              <strong>No named integrations.</strong> These are mock adapters. This prototype does not
              integrate any third-party verification API, and access eligibility for several
              real-world channels is legally restricted — the product must not assume access.
            </span>
          </div>
        </Note>
        <Note tone="caution">
          <div className="flex gap-2">
            <IndianRupee size={15} className="flex-none mt-0.5" />
            <span>
              <strong>Caching rights are a deal term, not a detail.</strong> If a provider contract
              forbids result reuse, the network's margin-expansion path disappears entirely. Secure
              reuse rights in the first contract signed, not the tenth.
            </span>
          </div>
        </Note>
        <Note tone="primary">
          <div className="flex gap-2">
            <Activity size={15} className="flex-none mt-0.5" />
            <span>
              <strong>Never retry a definitive negative.</strong> A "not found" from an authoritative
              registry is an answer. Retrying it is a billed way to get the same answer — and a
              common, expensive mistake.
            </span>
          </div>
        </Note>
      </div>
    </div>
  )
}
