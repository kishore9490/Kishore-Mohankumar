import { useMemo, useState } from 'react'
import type { Node, Edge } from '@xyflow/react'
import { DATA_ENTITIES, DATA_EDGES, DATA_GROUPS } from '@/data/dataModel'
import { useExplorer } from '@/state/explorer'
import { FlowCanvas, flowEdge } from '@/components/flow'
import { Chip, Legend, Note, Panel, SectionHeader, TONE } from '@/components/ui'

/** §22 — data architecture. */

const GROUP_X: Record<string, number> = {
  Identity: 0, Trust: 260, Governance: 520, Business: 780, Monitoring: 1040, Integration: 1300, Revenue: 1560,
}

const CLASS_TONE: Record<string, keyof typeof TONE> = {
  PUBLIC: 'verify', RESTRICTED: 'primary', SENSITIVE: 'caution', 'HIGHLY SENSITIVE': 'adverse',
}

export default function DataArchitecture() {
  const { open, highlightId } = useExplorer()
  const [group, setGroup] = useState<string | null>(null)

  const { nodes, edges } = useMemo(() => {
    const counters: Record<string, number> = {}
    const nodes: Node[] = DATA_ENTITIES.map((e) => {
      const i = counters[e.group] ?? 0
      counters[e.group] = i + 1
      return {
        id: e.id,
        type: 'entity',
        position: { x: GROUP_X[e.group] ?? 0, y: i * 74 },
        data: {
          label: e.name,
          sub: e.classification,
          tone: 'primary',
          classification: e.classification,
          dim: group !== null && e.group !== group,
          highlight: highlightId === e.id,
          onOpen: () => open({ kind: 'entity', id: e.id }),
        },
        draggable: false,
      } as Node
    })

    const ids = new Set(nodes.map((n) => n.id))
    const edges: Edge[] = DATA_EDGES.filter(([s, t]) => ids.has(s) && ids.has(t)).map(([s, t, label], i) => {
      const se = DATA_ENTITIES.find((x) => x.id === s)
      const te = DATA_ENTITIES.find((x) => x.id === t)
      const dim = group !== null && se?.group !== group && te?.group !== group
      return flowEdge(`de-${i}`, s, t, { label, tone: 'neutral', dim })
    })

    return { nodes, edges }
  }, [group, open, highlightId])

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1400px]">
      <SectionHeader
        eyebrow="Data architecture"
        title={`${DATA_ENTITIES.length} core entities`}
        subtitle="Click any entity for its purpose, key fields, relationships, security classification and retention considerations. The colour bar on each entity is its classification — note how few entities carry HIGHLY SENSITIVE, and that they are deliberately isolated."
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Chip tone="primary" active={group === null} onClick={() => setGroup(null)}>All groups</Chip>
        {DATA_GROUPS.map((g) => (
          <Chip key={g} tone="verify" active={group === g} onClick={() => setGroup(group === g ? null : g)}>{g}</Chip>
        ))}
      </div>

      <FlowCanvas nodes={nodes} edges={edges} height={640} showMiniMap minZoom={0.1} />

      <div className="mt-3">
        <Legend items={[
          { tone: 'verify', label: 'PUBLIC' },
          { tone: 'primary', label: 'RESTRICTED' },
          { tone: 'caution', label: 'SENSITIVE' },
          { tone: 'adverse', label: 'HIGHLY SENSITIVE' },
        ]} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Note tone="adverse">
          <strong>Evidence is the only HIGHLY SENSITIVE store.</strong> It lives in a separate partition
          with independent keys and independent access paths, so a compromise of the main application
          does not yield people's background results.
        </Note>
        <Note tone="primary">
          <strong>Relationships are tenant-private.</strong> ABC must never learn who else buys from
          XYZ. Row-level security carries tenant context in every query path — enforced in the data
          layer, not the application layer.
        </Note>
      </div>

      <div className="mt-7">
        <SectionHeader eyebrow="Classification summary" title="Where the sensitive data lives" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['PUBLIC', 'RESTRICTED', 'SENSITIVE', 'HIGHLY SENSITIVE'] as const).map((c) => {
            const list = DATA_ENTITIES.filter((e) => e.classification === c)
            return (
              <Panel key={c}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`h-2 w-2 rounded-sm ${TONE[CLASS_TONE[c]].dot}`} />
                  <p className="eyebrow">{c}</p>
                </div>
                <p className="mono text-[24px] font-semibold text-navy-850 leading-none mb-2.5">{list.length}</p>
                <div className="space-y-0.5">
                  {list.slice(0, 6).map((e) => (
                    <button key={e.id} onClick={() => open({ kind: 'entity', id: e.id })}
                      className="block mono text-[10.5px] text-slate-500 hover:text-navy-850 truncate w-full text-left">
                      {e.name}
                    </button>
                  ))}
                  {list.length > 6 && <p className="text-[10.5px] text-slate-400">+{list.length - 6} more</p>}
                </div>
              </Panel>
            )
          })}
        </div>
      </div>
    </div>
  )
}
