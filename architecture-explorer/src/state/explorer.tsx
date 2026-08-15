import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Facet, ZoomLevel } from '@/types'
import { COMPONENT_BY_ID } from '@/data/layers'

/**
 * Global explorer state: the detail drawer (§6), facet filters (§29),
 * zoom level (§30) and search (§31).
 */

export type DrawerPayload =
  | { kind: 'component'; id: string }
  | { kind: 'lifecycle'; id: string }
  | { kind: 'relationship'; id: string }
  | { kind: 'entity'; id: string }
  | { kind: 'event'; id: string }
  | { kind: 'endpoint'; id: string }
  | { kind: 'adr'; id: string }
  | { kind: 'pipeline'; id: string }
  | { kind: 'industry'; id: string }
  | null

interface ExplorerState {
  drawer: DrawerPayload
  open: (p: NonNullable<DrawerPayload>) => void
  close: () => void
  facets: Set<Facet>
  toggleFacet: (f: Facet) => void
  clearFacets: () => void
  zoom: ZoomLevel
  setZoom: (z: ZoomLevel) => void
  /** True when no filter is active, or when the item matches an active facet. */
  matches: (itemFacets: Facet[] | undefined) => boolean
  searchOpen: boolean
  setSearchOpen: (v: boolean) => void
  highlightId: string | null
  setHighlightId: (id: string | null) => void
}

const Ctx = createContext<ExplorerState | null>(null)

export const ZOOM_ORDER: ZoomLevel[] = ['executive', 'system', 'service', 'data', 'infrastructure']

/** Component visibility by zoom level — executive shows only the major blocks. */
export function visibleAtZoom(componentId: string, zoom: ZoomLevel): boolean {
  const comp = COMPONENT_BY_ID.get(componentId)
  if (!comp) return true
  if (zoom === 'data') return comp.facets.includes('data') || comp.layer === 'data'
  if (zoom === 'infrastructure') return true
  // Past this point zoom is 'executive' | 'system' | 'service'.
  const order = ['executive', 'system', 'service']
  const need = order.indexOf(
    comp.minZoom === 'data' || comp.minZoom === 'infrastructure' ? 'service' : comp.minZoom,
  )
  const cur = order.indexOf(zoom)
  return (need < 0 ? 0 : need) <= (cur < 0 ? 2 : cur)
}

export function ExplorerProvider({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState<DrawerPayload>(null)
  const [facets, setFacets] = useState<Set<Facet>>(new Set())
  const [zoom, setZoom] = useState<ZoomLevel>('system')
  const [searchOpen, setSearchOpen] = useState(false)
  const [highlightId, setHighlightId] = useState<string | null>(null)

  const open = useCallback((p: NonNullable<DrawerPayload>) => setDrawer(p), [])
  const close = useCallback(() => setDrawer(null), [])

  const toggleFacet = useCallback((f: Facet) => {
    setFacets((prev) => {
      const next = new Set(prev)
      if (next.has(f)) next.delete(f)
      else next.add(f)
      return next
    })
  }, [])

  const clearFacets = useCallback(() => setFacets(new Set()), [])

  const matches = useCallback(
    (itemFacets: Facet[] | undefined) => {
      if (facets.size === 0) return true
      if (!itemFacets) return false
      return itemFacets.some((f) => facets.has(f))
    },
    [facets],
  )

  const value = useMemo(
    () => ({
      drawer, open, close,
      facets, toggleFacet, clearFacets,
      zoom, setZoom,
      matches,
      searchOpen, setSearchOpen,
      highlightId, setHighlightId,
    }),
    [drawer, open, close, facets, toggleFacet, clearFacets, zoom, matches, searchOpen, highlightId],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useExplorer() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useExplorer must be used inside ExplorerProvider')
  return v
}
