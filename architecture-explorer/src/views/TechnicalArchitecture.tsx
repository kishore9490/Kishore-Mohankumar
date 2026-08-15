import { useMemo, useState } from 'react'
import type { Node, Edge } from '@xyflow/react'
import { LAYERS, COMPONENT_BY_ID } from '@/data/layers'
import { EVENTS } from '@/data/catalog'
import { useExplorer, visibleAtZoom } from '@/state/explorer'
import { FlowCanvas, flowEdge } from '@/components/flow'
import { Chip, Legend, Note, Panel, SectionHeader } from '@/components/ui'
import { FilterHint } from '@/components/AppShell'
import { Zap } from 'lucide-react'

/** §5, §6, §25 — the nine-layer canvas, plus the event bus. */

const COL_W = 190
const ROW_H = 92
const HEADER_W = 210

export default function TechnicalArchitecture() {
  const { open, matches, zoom, highlightId } = useExplorer()
  const [tab, setTab] = useState<'layers' | 'events'>('layers')

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    let y = 0

    for (const layer of LAYERS) {
      const visible = layer.componentIds.filter((id) => visibleAtZoom(id, zoom))
      if (visible.length === 0) continue

      nodes.push({
        id: `layer-${layer.id}`,
        type: 'layer',
        position: { x: 0, y },
        data: { label: `${layer.index}. ${layer.name}`, sub: layer.caption, tone: layer.tone },
        draggable: false,
      })

      visible.forEach((cid, i) => {
        const c = COMPONENT_BY_ID.get(cid)!
        const perRow = 5
        const col = i % perRow
        const row = Math.floor(i / perRow)
        nodes.push({
          id: cid,
          type: 'box',
          position: { x: HEADER_W + 40 + col * COL_W, y: y + row * 58 },
          data: {
            label: c.name,
            tone: c.tone ?? 'primary',
            dim: !matches(c.facets),
            highlight: highlightId === cid,
            onOpen: () => open({ kind: 'component', id: cid }),
          },
          draggable: false,
        })
      })

      const rows = Math.ceil(visible.length / 5)
      y += Math.max(ROW_H, rows * 58 + 44)
    }

    // Vertical spine between layers
    const present = LAYERS.filter((l) => l.componentIds.some((id) => visibleAtZoom(id, zoom)))
    for (let i = 0; i < present.length - 1; i++) {
      edges.push(
        flowEdge(`spine-${i}`, `layer-${present[i].id}`, `layer-${present[i + 1].id}`, { tone: 'neutral' }),
      )
    }
    return { nodes, edges }
  }, [zoom, matches, open, highlightId])

  const eventFlow = useMemo(() => {
    const ev = EVENTS.find((e) => e.id === 'VerificationCompleted')!
    const nodes: Node[] = [
      { id: 'producer', type: 'box', position: { x: 0, y: 140 }, data: { label: 'Verification Engine', sub: 'producer', tone: 'verify', onOpen: () => open({ kind: 'component', id: 'verification-engine' }) }, draggable: false },
      { id: 'bus', type: 'box', position: { x: 250, y: 140 }, data: { label: 'Event Bus', sub: 'VerificationCompleted', tone: 'primary', onOpen: () => open({ kind: 'event', id: 'VerificationCompleted' }) }, draggable: false },
    ]
    const consumers = [
      ['assessment-engine', 'Assessment Service'],
      ['notifications', 'Notification Service'],
      ['credential-service', 'Credential Service'],
      ['audit-service', 'Audit Service'],
      ['billing', 'Billing Service'],
      ['monitoring-engine', 'Monitoring Service'],
    ]
    const edges: Edge[] = [flowEdge('e-prod-bus', 'producer', 'bus', { animated: true, tone: 'verify' })]
    consumers.forEach(([id, label], i) => {
      nodes.push({
        id, type: 'box', position: { x: 520, y: i * 58 },
        data: { label, tone: 'primary', onOpen: () => open({ kind: 'component', id }) }, draggable: false,
      })
      edges.push(flowEdge(`e-bus-${id}`, 'bus', id, { animated: true, tone: 'neutral' }))
    })
    void ev
    return { nodes, edges }
  }, [open])

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1400px]">
      <SectionHeader
        eyebrow="Technical architecture"
        title="Nine layers, every component clickable"
        subtitle="Click any component to open its purpose, responsibilities, inputs, outputs, dependencies, data handled, security considerations, events and APIs. Use the zoom control in the top bar to change detail density, and filters to highlight a concern across all layers."
        right={
          <div className="flex gap-1 rounded-lg border border-[var(--line)] bg-white p-0.5">
            {(['layers', 'events'] as const).map((t) => (
              <button
                key={t} onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1.5 text-[12.5px] transition-colors ${tab === t ? 'bg-navy-900 text-white' : 'text-slate-600 hover:text-navy-850'}`}
              >
                {t === 'layers' ? 'Layer map' : 'Event bus'}
              </button>
            ))}
          </div>
        }
      />

      <FilterHint />

      {tab === 'layers' ? (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <Legend items={[
              { tone: 'primary', label: 'Platform service' },
              { tone: 'verify', label: 'Trust / verification' },
              { tone: 'caution', label: 'Risk & monitoring' },
              { tone: 'adverse', label: 'Isolation boundary' },
              { tone: 'external', label: 'External provider (mocked)' },
            ]} />
            <span className="text-[11.5px] text-slate-500">
              Showing <strong className="text-navy-850">{nodes.filter((n) => n.type === 'box').length}</strong> components at <strong className="text-navy-850">{zoom}</strong> zoom
            </span>
          </div>
          <FlowCanvas nodes={nodes} edges={edges} height={700} showMiniMap />
          <Note tone="caution">
            Layer 8 providers are <strong>mock adapters</strong>. No third-party verification API is
            integrated in this prototype, and access eligibility for several real-world channels is
            legally restricted — the product must not assume access.
          </Note>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={15} className="text-verify-deep" />
            <p className="text-[13.5px] text-slate-600">
              <strong className="text-navy-850">VerificationCompleted</strong> is the canonical fan-out.
              One event, six independent consumers, no synchronous coupling.
            </p>
          </div>
          <FlowCanvas nodes={eventFlow.nodes} edges={eventFlow.edges} height={430} />

          <div className="mt-6">
            <SectionHeader eyebrow="Event catalog" title="Domain events" subtitle="Click any event for its producer, consumers and example payload." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {EVENTS.filter((e) => matches(e.facets)).map((e) => (
                <button key={e.id} onClick={() => open({ kind: 'event', id: e.id })} className="text-left">
                  <Panel className="h-full hover:border-verify/50 transition-colors">
                    <p className="mono text-[12px] font-medium text-verify-deep mb-1.5">{e.name}</p>
                    <p className="text-[12px] leading-relaxed text-slate-600 mb-2.5">{e.description}</p>
                    <div className="flex flex-wrap gap-1">
                      <Chip tone="neutral">{e.consumers.length} consumers</Chip>
                    </div>
                  </Panel>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
