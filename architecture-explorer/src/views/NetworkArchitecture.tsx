import { useEffect, useMemo, useState } from 'react'
import type { Node, Edge } from '@xyflow/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react'
import { ORGS, RELATIONSHIPS } from '@/data/demo'
import { STORY, LIFECYCLE_BY_ID } from '@/data/lifecycle'
import { useExplorer } from '@/state/explorer'
import { FlowCanvas, flowEdge } from '@/components/flow'
import { Chip, Legend, Note, Panel, SectionHeader } from '@/components/ui'

/** §9, §10, §28 — the network flywheel and the end-to-end scenario player. */

type Toggle = 'relationships' | 'verification' | 'organizations' | 'people' | 'customers' | 'credentials'

const POS: Record<string, { x: number; y: number }> = {
  abc: { x: 340, y: 0 },
  xyz: { x: 150, y: 150 },
  lmn: { x: 530, y: 150 },
  opq: { x: 40, y: 300 },
  ravi: { x: 300, y: 300 },
  priya: { x: 530, y: 300 },
  rst: { x: 700, y: 300 },
  anil: { x: 700, y: 0 },
}

const STORY_EDGES: Record<string, [string, string, string]> = {
  'e-abc-xyz': ['abc', 'xyz', 'verifies'],
  'e-xyz-lmn': ['xyz', 'lmn', 'verifies'],
  'e-xyz-ravi': ['xyz', 'ravi', 'employs'],
  'e-lmn-opq': ['lmn', 'opq', 'verifies'],
}

export default function NetworkArchitecture() {
  const { open } = useExplorer()
  const [toggles, setToggles] = useState<Set<Toggle>>(
    new Set(['relationships', 'verification', 'organizations', 'people', 'customers']),
  )
  const [mode, setMode] = useState<'explore' | 'story'>('explore')
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)

  const toggle = (t: Toggle) =>
    setToggles((prev) => {
      const n = new Set(prev)
      n.has(t) ? n.delete(t) : n.add(t)
      return n
    })

  useEffect(() => {
    if (!playing || mode !== 'story') return
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= STORY.length - 1) { setPlaying(false); return s }
        return s + 1
      })
    }, 2600)
    return () => clearInterval(id)
  }, [playing, mode])

  const current = STORY[step]

  const { nodes, edges } = useMemo(() => {
    const showOrgs = toggles.has('organizations')
    const showPeople = toggles.has('people')
    const storyMode = mode === 'story'

    const nodes: Node[] = ORGS.filter((o) => {
      if (o.kind === 'person' && !showPeople) return false
      if (o.kind === 'organization' && !showOrgs) return false
      if (storyMode) return current.activeNodes.includes(o.id) || ['abc', 'xyz', 'lmn', 'opq'].includes(o.id)
      return true
    }).map((o) => {
      const isActive = storyMode ? current.activeNodes.includes(o.id) : true
      const tone = o.kind === 'person' ? 'caution'
        : toggles.has('customers') && o.isCustomer ? 'verify'
        : o.verified && toggles.has('verification') ? 'primary' : 'neutral'
      const badges: string[] = []
      if (toggles.has('customers') && o.isCustomer) badges.push('Customer')
      else if (o.isMember) badges.push('Member')
      if (toggles.has('credentials') && o.verified) badges.push('Verified')

      return {
        id: o.id,
        type: 'box',
        position: POS[o.id] ?? { x: 0, y: 0 },
        data: {
          label: o.name,
          sub: badges.join(' · ') || o.bidId,
          tone,
          dim: storyMode && !isActive,
          highlight: storyMode && current.activeNodes[current.activeNodes.length - 1] === o.id,
          onOpen: () => {
            const rel = RELATIONSHIPS.find((r) => r.sourceId === o.id || r.targetId === o.id)
            if (rel) open({ kind: 'relationship', id: rel.id })
          },
        },
        draggable: false,
      } as Node
    })

    const ids = new Set(nodes.map((n) => n.id))
    let edges: Edge[] = []

    if (storyMode) {
      edges = Object.entries(STORY_EDGES)
        .filter(([id, [s, t]]) => ids.has(s) && ids.has(t) && current.activeEdges.includes(id))
        .map(([id, [s, t, label]]) => flowEdge(id, s, t, { animated: true, label, tone: 'verify' }))
    } else if (toggles.has('relationships')) {
      edges = RELATIONSHIPS.filter((r) => ids.has(r.sourceId) && ids.has(r.targetId))
        .map((r) =>
          flowEdge(r.id, r.sourceId, r.targetId, {
            label: r.type.toLowerCase().replace(/_/g, ' '),
            tone: r.status === 'Active' ? 'verify' : 'neutral',
            animated: toggles.has('verification') && r.status === 'Active',
          }),
        )
    }

    return { nodes, edges }
  }, [toggles, mode, current, open])

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1400px]">
      <SectionHeader
        eyebrow="Network architecture"
        title="The acquisition flywheel"
        subtitle="The same organization holds many roles simultaneously. XYZ is a vendor to ABC, a customer of BID, a requester verifying LMN, and an employer of Ravi — all at once, from one identity record. Click any node to inspect its relationship."
        right={
          <div className="flex gap-1 rounded-lg border border-[var(--line)] bg-white p-0.5">
            {(['explore', 'story'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setStep(0); setPlaying(false) }}
                className={`rounded-md px-3 py-1.5 text-[12.5px] transition-colors ${mode === m ? 'bg-navy-900 text-white' : 'text-slate-600 hover:text-navy-850'}`}
              >
                {m === 'explore' ? 'Explore' : 'Play scenario'}
              </button>
            ))}
          </div>
        }
      />

      {mode === 'explore' && (
        <div className="flex flex-wrap gap-2 mb-4">
          {([
            ['relationships', 'Show Relationships'],
            ['verification', 'Show Verification'],
            ['organizations', 'Show Organizations'],
            ['people', 'Show People'],
            ['customers', 'Show Customers'],
            ['credentials', 'Show Credentials'],
          ] as [Toggle, string][]).map(([id, label]) => (
            <Chip key={id} tone="verify" active={toggles.has(id)} onClick={() => toggle(id)}>
              {label}
            </Chip>
          ))}
        </div>
      )}

      {mode === 'story' && (
        <Panel className="mb-4">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="inline-flex items-center gap-2 rounded-lg bg-navy-900 text-white px-4 py-2 text-[13px] font-medium hover:bg-navy-800"
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
              {playing ? 'Pause' : 'Play'}
            </button>
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-2 text-[13px] disabled:opacity-40 hover:border-navy-500/50">
              <SkipBack size={13} /> Previous
            </button>
            <button onClick={() => setStep((s) => Math.min(STORY.length - 1, s + 1))} disabled={step === STORY.length - 1}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-2 text-[13px] disabled:opacity-40 hover:border-navy-500/50">
              Next <SkipForward size={13} />
            </button>
            <button onClick={() => { setStep(0); setPlaying(false) }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-2 text-[13px] hover:border-navy-500/50">
              <RotateCcw size={13} /> Restart
            </button>
            <span className="ml-auto mono text-[12px] text-slate-500">
              Step {current.n} / {STORY.length}
            </span>
          </div>

          <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden mb-4">
            <motion.div
              className="h-full bg-verify"
              animate={{ width: `${((step + 1) / STORY.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Chip tone="primary">{current.actor}</Chip>
                {current.stageId && LIFECYCLE_BY_ID.get(current.stageId) && (
                  <button onClick={() => open({ kind: 'lifecycle', id: current.stageId! })}>
                    <Chip tone="verify">{LIFECYCLE_BY_ID.get(current.stageId)!.name}</Chip>
                  </button>
                )}
                {current.billing && <Chip tone="caution">{current.billing}</Chip>}
              </div>
              <h3 className="text-[19px] font-semibold text-navy-850 leading-snug mb-2">{current.title}</h3>
              <p className="text-[14px] leading-relaxed text-slate-600 max-w-[76ch]">{current.detail}</p>
            </motion.div>
          </AnimatePresence>
        </Panel>
      )}

      <FlowCanvas nodes={nodes} edges={edges} height={520} />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <Legend items={[
          { tone: 'verify', label: 'BID Customer' },
          { tone: 'primary', label: 'Verified member' },
          { tone: 'neutral', label: 'Member, not yet verified' },
          { tone: 'caution', label: 'Person' },
        ]} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Note tone="verify">
          <strong>ABC → XYZ → LMN → OPQ.</strong> Each generation of members is acquired by the
          previous generation of customers, at their expense rather than BID's. Marginal
          verification cost falls as reuse density rises; price does not. That gap is the business.
        </Note>
        <Note tone="caution">
          <strong>The honest constraint.</strong> The network is worth nothing until density exists.
          Assume no network value for the first 12–18 months and make the product win standalone —
          on workflow, evidence, audit trail and monitoring.
        </Note>
      </div>

      <div className="mt-6">
        <SectionHeader eyebrow="Multi-role proof" title="One organization, many roles" subtitle="Roles are relationships, never entity types. This is why a single record can serve every counterparty at once." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ORGS.filter((o) => o.kind === 'organization').map((o) => (
            <Panel key={o.id}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-navy-850 truncate">{o.name}</p>
                  <p className="mono text-[11px] text-slate-500">{o.bidId}</p>
                </div>
                {o.isCustomer ? <Chip tone="verify">Customer</Chip> : <Chip tone="neutral">Member</Chip>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {o.roles.map((r) => <Chip key={r} tone="primary">{r}</Chip>)}
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  )
}
