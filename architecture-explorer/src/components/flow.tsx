import { memo, useMemo } from 'react'
import {
  ReactFlow, Background, Controls, Handle, Position, MiniMap,
  type Node, type Edge, type NodeProps, BackgroundVariant,
} from '@xyflow/react'
import type { NodeTone } from '@/types'

/**
 * Shared React Flow surface and node types.
 * Nodes are memoized (§34) — these canvases can carry 70+ nodes.
 */

const NODE_STYLE: Record<NodeTone, string> = {
  primary: 'bg-white border-navy-500/35 text-navy-850 hover:border-navy-600',
  brand: 'bg-brand-50 border-brand-500/40 text-brand-800 hover:border-brand-500',
  verify: 'bg-verify/[0.07] border-verify/45 text-verify-deep hover:border-verify',
  caution: 'bg-caution/[0.09] border-caution/50 text-[#7A4F05] hover:border-caution',
  adverse: 'bg-adverse/[0.07] border-adverse/50 text-[#9E2429] hover:border-adverse',
  neutral: 'bg-slate-50 border-slate-300 text-slate-600 hover:border-slate-400',
  external: 'bg-white border-slate-300 border-dashed text-slate-600 hover:border-slate-500',
}

export type BoxData = {
  label: string
  sub?: string
  tone: NodeTone
  dim?: boolean
  highlight?: boolean
  onOpen?: () => void
}

/** Standard clickable architecture box. */
export const BoxNode = memo(function BoxNode({ data }: NodeProps) {
  const d = data as BoxData
  return (
    <div
      role="button" tabIndex={0}
      onClick={d.onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); d.onOpen?.() } }}
      className={`rounded-lg border px-3 py-2 text-center transition-all cursor-pointer select-none
        ${NODE_STYLE[d.tone]}
        ${d.dim ? 'opacity-25' : 'opacity-100'}
        ${d.highlight ? 'ring-2 ring-verify ring-offset-2 shadow-lg' : 'shadow-sm hover:shadow-md'}`}
      style={{ width: 168 }}
      title={d.sub ? `${d.label} — ${d.sub}` : d.label}
    >
      <Handle type="target" position={Position.Top} />
      <div className="text-[12px] font-medium leading-tight">{d.label}</div>
      {d.sub && <div className="text-[10px] opacity-70 mt-0.5 leading-tight">{d.sub}</div>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})

/** Wide banner used as a layer header. */
export const LayerNode = memo(function LayerNode({ data }: NodeProps) {
  const d = data as BoxData
  return (
    <div className="rounded-lg bg-navy-900 text-white px-4 py-2 shadow-sm" style={{ width: 200 }}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em]">{d.label}</div>
      {d.sub && <div className="text-[10px] text-ink-faint mt-0.5 leading-snug">{d.sub}</div>}
    </div>
  )
})

/** Entity node for the ERD. */
export const EntityNode = memo(function EntityNode({ data }: NodeProps) {
  const d = data as BoxData & { classification?: string }
  const cls = d.classification
  const bar =
    cls === 'HIGHLY SENSITIVE' ? 'bg-adverse'
    : cls === 'SENSITIVE' ? 'bg-caution'
    : cls === 'PUBLIC' ? 'bg-verify' : 'bg-navy-600'
  return (
    <div
      role="button" tabIndex={0} onClick={d.onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter') d.onOpen?.() }}
      className={`rounded-md border bg-white overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer
        ${d.dim ? 'opacity-20' : ''} ${d.highlight ? 'ring-2 ring-verify ring-offset-2' : ''}
        border-[var(--line)] hover:border-navy-500/50`}
      style={{ width: 170 }}
    >
      <Handle type="target" position={Position.Left} />
      <div className={`h-[3px] ${bar}`} />
      <div className="px-3 py-2">
        <div className="mono text-[11px] font-medium text-navy-850 truncate">{d.label}</div>
        <div className="text-[9.5px] uppercase tracking-wider text-slate-400 mt-0.5">{d.sub}</div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
})

export const nodeTypes = { box: BoxNode, layer: LayerNode, entity: EntityNode }

export function FlowCanvas({
  nodes, edges, height = 620, fitView = true, minZoom = 0.15, showMiniMap = false,
}: {
  nodes: Node[]; edges: Edge[]; height?: number | string
  fitView?: boolean; minZoom?: number; showMiniMap?: boolean
}) {
  const types = useMemo(() => nodeTypes, [])
  return (
    <div style={{ height }} className="panel panel-shadow overflow-hidden">
      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={types}
        fitView={fitView} minZoom={minZoom} maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        // Canvas-level fallback so a click anywhere on a node opens its drawer,
        // even if the inner element does not receive the event directly.
        onNodeClick={(_, node) => (node.data as BoxData)?.onOpen?.()}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#CBD8E6" />
        <Controls showInteractive={false} position="bottom-right" />
        {showMiniMap && (
          <MiniMap
            pannable zoomable position="bottom-left"
            nodeColor={(n) => {
              const t = (n.data as BoxData)?.tone
              return t === 'verify' ? '#1DB954' : t === 'caution' ? '#F5A623' : t === 'adverse' ? '#E5484D' : t === 'external' ? '#94A3B8' : '#1B3A66'
            }}
            maskColor="rgba(11,31,58,0.06)"
            style={{ background: '#F6F8FB', border: '1px solid #DFE7F0', borderRadius: 8 }}
          />
        )}
      </ReactFlow>
    </div>
  )
}

/** Edge helper with the animated-dash treatment for "data is flowing". */
export function flowEdge(
  id: string, source: string, target: string,
  opts: { animated?: boolean; label?: string; tone?: NodeTone; dim?: boolean } = {},
): Edge {
  const color =
    opts.tone === 'verify' ? '#1DB954'
    : opts.tone === 'caution' ? '#F5A623'
    : opts.tone === 'adverse' ? '#E5484D'
    : '#94A3B8'
  return {
    id, source, target, type: 'smoothstep',
    animated: opts.animated,
    label: opts.label,
    labelStyle: { fontSize: 10, fill: '#64748B' },
    labelBgStyle: { fill: '#fff' },
    labelBgPadding: [4, 2] as [number, number],
    style: { stroke: color, strokeWidth: opts.animated ? 2 : 1.4, opacity: opts.dim ? 0.12 : 0.85 },
    markerEnd: { type: 'arrowclosed' as const, color, width: 14, height: 14 },
  }
}
