import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, CornerDownLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useExplorer, type DrawerPayload } from '@/state/explorer'
import { COMPONENTS } from '@/data/layers'
import { LIFECYCLE } from '@/data/lifecycle'
import { DATA_ENTITIES } from '@/data/dataModel'
import { EVENTS, ADRS, PIPELINE, INDUSTRIES } from '@/data/catalog'
import { ENDPOINTS } from '@/data/api'

type Hit = {
  id: string
  label: string
  kind: string
  hint: string
  route: string
  payload: NonNullable<DrawerPayload>
  haystack: string
}

/** §31 — global architecture search. Opens the matching component's panel. */
function buildIndex(): Hit[] {
  const hits: Hit[] = []
  for (const c of COMPONENTS) {
    hits.push({
      id: `c:${c.id}`, label: c.name, kind: 'Component', hint: `${c.layer} layer`,
      route: '/technical', payload: { kind: 'component', id: c.id },
      haystack: [c.name, c.layer, c.purpose, ...c.responsibilities, ...c.facets].join(' ').toLowerCase(),
    })
  }
  for (const s of LIFECYCLE) {
    hits.push({
      id: `l:${s.id}`, label: s.name, kind: 'Lifecycle stage', hint: `${s.track} track`,
      route: '/customer-lifecycle', payload: { kind: 'lifecycle', id: s.id },
      haystack: [s.name, s.definition, ...s.whatHappens].join(' ').toLowerCase(),
    })
  }
  for (const e of DATA_ENTITIES) {
    hits.push({
      id: `d:${e.id}`, label: e.name, kind: 'Data entity', hint: e.group,
      route: '/data', payload: { kind: 'entity', id: e.id },
      haystack: [e.name, e.group, e.purpose, ...e.keyFields].join(' ').toLowerCase(),
    })
  }
  for (const ev of EVENTS) {
    hits.push({
      id: `e:${ev.id}`, label: ev.name, kind: 'Event', hint: ev.producer,
      route: '/technical', payload: { kind: 'event', id: ev.id },
      haystack: [ev.name, ev.description, ev.producer, ...ev.consumers].join(' ').toLowerCase(),
    })
  }
  for (const ep of ENDPOINTS) {
    hits.push({
      id: `a:${ep.id}`, label: `${ep.method} ${ep.path}`, kind: 'API', hint: ep.summary,
      route: '/api', payload: { kind: 'endpoint', id: ep.id },
      haystack: [ep.path, ep.summary, ep.purpose, ep.method].join(' ').toLowerCase(),
    })
  }
  for (const a of ADRS) {
    hits.push({
      id: `r:${a.id}`, label: `${a.id} — ${a.title}`, kind: 'ADR', hint: 'Decision record',
      route: '/principles', payload: { kind: 'adr', id: a.id },
      haystack: [a.id, a.title, a.context, a.decision].join(' ').toLowerCase(),
    })
  }
  for (const p of PIPELINE) {
    hits.push({
      id: `p:${p.id}`, label: p.name, kind: 'Pipeline step', hint: p.owner,
      route: '/verification', payload: { kind: 'pipeline', id: p.id },
      haystack: [p.name, p.purpose, p.owner].join(' ').toLowerCase(),
    })
  }
  for (const i of INDUSTRIES) {
    hits.push({
      id: `i:${i.id}`, label: i.name, kind: 'Industry', hint: i.policy,
      route: '/business', payload: { kind: 'industry', id: i.id },
      haystack: [i.name, i.policy, i.note, ...i.distinctiveChecks].join(' ').toLowerCase(),
    })
  }
  return hits
}

export function SearchPalette() {
  const { searchOpen, setSearchOpen, open, setHighlightId } = useExplorer()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const index = useMemo(buildIndex, [])

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return index.slice(0, 8)
    const scored = index
      .map((h) => {
        const label = h.label.toLowerCase()
        let score = 0
        if (label === term) score = 100
        else if (label.startsWith(term)) score = 80
        else if (label.includes(term)) score = 60
        else if (h.haystack.includes(term)) score = 30
        return { h, score }
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
    return scored.map((x) => x.h)
  }, [q, index])

  useEffect(() => { setSel(0) }, [q])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 40)
    else setQ('')
  }, [searchOpen])

  const choose = (h: Hit) => {
    navigate(h.route)
    setSearchOpen(false)
    setHighlightId(h.payload.id)
    setTimeout(() => open(h.payload), 120)
    setTimeout(() => setHighlightId(null), 2600)
  }

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div className="fixed inset-0 bg-navy-950/40 z-[60]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)} aria-hidden />
          <motion.div
            role="dialog" aria-modal="true" aria-label="Search architecture"
            className="fixed z-[61] left-1/2 top-[12vh] w-[min(620px,92vw)] -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-[var(--line)] overflow-hidden"
            initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.16 }}
          >
            <div className="flex items-center gap-3 px-4 border-b border-[var(--line)]">
              <Search size={17} className="text-slate-400 flex-none" />
              <input
                ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search components, events, APIs, entities, decisions…"
                className="flex-1 py-4 text-[15px] outline-none placeholder:text-slate-400"
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)) }
                  if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
                  if (e.key === 'Enter' && results[sel]) { e.preventDefault(); choose(results[sel]) }
                }}
              />
              <kbd className="mono text-[10px] text-slate-400 border border-[var(--line)] rounded px-1.5 py-0.5 flex-none">ESC</kbd>
            </div>
            <ul className="max-h-[52vh] overflow-y-auto py-2">
              {results.length === 0 && (
                <li className="px-4 py-8 text-center text-[13.5px] text-slate-400">No matches for “{q}”</li>
              )}
              {results.map((h, i) => (
                <li key={h.id}>
                  <button
                    onClick={() => choose(h)} onMouseEnter={() => setSel(i)}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 ${i === sel ? 'bg-navy-850/[0.05]' : ''}`}
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13.5px] font-medium text-navy-850 truncate">{h.label}</span>
                      <span className="block text-[11.5px] text-slate-500 truncate">{h.hint}</span>
                    </span>
                    <span className="flex-none text-[10.5px] uppercase tracking-wider text-slate-400">{h.kind}</span>
                    {i === sel && <CornerDownLeft size={13} className="flex-none text-slate-400" />}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
