import { useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutGrid, Building2, Workflow, Share2, ShieldCheck, GitBranch, Users,
  Layers, Database, Lock, IndianRupee, Code2, Network, Sparkles, Compass,
  Search, Menu, X, Filter,
} from 'lucide-react'
import { Logo, USING_VECTOR_RECONSTRUCTION } from '@/brand/Logo'
import { useExplorer, ZOOM_ORDER } from '@/state/explorer'
import type { Facet, ZoomLevel } from '@/types'
import { Chip } from './ui'

export const NAV = [
  { to: '/', label: 'Overview', icon: LayoutGrid },
  { to: '/business', label: 'Business Architecture', icon: Building2 },
  { to: '/organization', label: 'Organization Lifecycle', icon: Workflow },
  { to: '/network', label: 'Network Architecture', icon: Share2 },
  { to: '/trust-engine', label: 'Trust Engine', icon: ShieldCheck },
  { to: '/verification', label: 'Verification Lifecycle', icon: GitBranch },
  { to: '/customer-lifecycle', label: 'Customer Lifecycle', icon: Users },
  { to: '/technical', label: 'Technical Architecture', icon: Layers },
  { to: '/data', label: 'Data Architecture', icon: Database },
  { to: '/security', label: 'Security & Governance', icon: Lock },
  { to: '/revenue', label: 'Revenue Architecture', icon: IndianRupee },
  { to: '/api', label: 'API Architecture', icon: Code2 },
  { to: '/providers', label: 'Provider Architecture', icon: Network },
  { to: '/future', label: 'Future Network', icon: Sparkles },
  { to: '/principles', label: 'Architecture Principles', icon: Compass },
]

const FACETS: { id: Facet; label: string }[] = [
  { id: 'business', label: 'Business' },
  { id: 'people', label: 'People' },
  { id: 'verification', label: 'Verification' },
  { id: 'trust', label: 'Trust' },
  { id: 'data', label: 'Data' },
  { id: 'security', label: 'Security' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'lifecycle', label: 'Customer Lifecycle' },
  { id: 'network', label: 'Network' },
  { id: 'apis', label: 'APIs' },
  { id: 'providers', label: 'Providers' },
  { id: 'monitoring', label: 'Monitoring' },
]

const ZOOM_LABEL: Record<ZoomLevel, string> = {
  executive: 'Executive', system: 'System', service: 'Service', data: 'Data', infrastructure: 'Infrastructure',
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false)
  const { setSearchOpen, facets, toggleFacet, clearFacets, zoom, setZoom } = useExplorer()
  const [showFilters, setShowFilters] = useState(false)
  const loc = useLocation()

  const sidebar = (
    <nav className="flex flex-col gap-0.5 px-3 py-4" aria-label="Sections">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to} to={to} end={to === '/'}
          onClick={() => setMobileNav(false)}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors ${
              isActive
                ? 'bg-white/[0.09] text-white font-medium'
                : 'text-ink-dim hover:bg-white/[0.05] hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={`h-4 w-[2px] rounded-full flex-none ${isActive ? 'bg-brand-400' : 'bg-transparent'}`} />
              <Icon size={15} className="flex-none" />
              <span className="truncate">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="h-full flex flex-col">
      {/* ── Top bar ── */}
      <header className="flex-none bg-navy-900 border-b border-white/[0.08]">
        <div className="flex items-center gap-4 px-4 md:px-5 h-14">
          <button
            className="lg:hidden text-ink-dim hover:text-white p-1"
            onClick={() => setMobileNav(true)} aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <Logo size={26} withWordmark tone="light" />

          <span className="hidden sm:block h-5 w-px bg-white/15" />
          <span className="hidden sm:block text-[13px] text-ink-dim">Architecture Explorer</span>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 px-3 py-1.5 text-[12.5px] text-ink-dim transition-colors"
            >
              <Search size={14} />
              <span className="hidden md:inline">Search architecture</span>
              <kbd className="hidden md:inline mono text-[10px] border border-white/15 rounded px-1 py-px ml-1">⌘K</kbd>
            </button>

            <span className="hidden lg:inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] border border-white/10 px-2.5 py-1 text-[11px] text-ink-dim">
              Version <span className="mono text-white">v1.0</span>
            </span>
            <span className="hidden xl:inline-flex items-center gap-1.5 rounded-md bg-caution/15 border border-caution/30 px-2.5 py-1 text-[11px] text-caution">
              Environment: Architecture Demo
            </span>
          </div>
        </div>

        {/* ── Filters + zoom (§29, §30) ── */}
        <div className="flex items-center gap-3 px-4 md:px-5 h-11 border-t border-white/[0.06] overflow-x-auto">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex-none flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] border transition-colors ${
              facets.size ? 'bg-brand-400/15 border-brand-400/45 text-brand-300' : 'bg-white/[0.06] border-white/10 text-ink-dim hover:text-white'
            }`}
          >
            <Filter size={12} />
            Filters{facets.size > 0 && ` (${facets.size})`}
          </button>

          <div className="flex-none flex items-center gap-1 rounded-md bg-white/[0.06] border border-white/10 p-0.5">
            {ZOOM_ORDER.map((z) => (
              <button
                key={z} onClick={() => setZoom(z)}
                className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                  zoom === z ? 'bg-white text-navy-900 font-medium' : 'text-ink-dim hover:text-white'
                }`}
                title={`${ZOOM_LABEL[z]} view`}
              >
                {ZOOM_LABEL[z]}
              </button>
            ))}
          </div>

          {facets.size > 0 && (
            <button onClick={clearFacets} className="flex-none text-[11.5px] text-ink-faint hover:text-white underline underline-offset-2">
              Clear
            </button>
          )}
          <span className="flex-none ml-auto text-[11px] text-ink-faint hidden md:block">
            {loc.pathname === '/' ? 'Executive overview' : NAV.find((n) => n.to === loc.pathname)?.label}
          </span>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/[0.06] bg-navy-950/40"
            >
              <div className="flex flex-wrap gap-2 px-4 md:px-5 py-3">
                {FACETS.map((f) => (
                  <button
                    key={f.id} onClick={() => toggleFacet(f.id)} aria-pressed={facets.has(f.id)}
                    className={`rounded-full px-3 py-1 text-[11.5px] border transition-colors ${
                      facets.has(f.id)
                        ? 'bg-brand-400/20 border-brand-400/50 text-brand-300 font-medium'
                        : 'bg-white/[0.05] border-white/10 text-ink-dim hover:text-white hover:border-white/25'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:block w-[248px] flex-none bg-navy-900 overflow-y-auto border-r border-white/[0.06]">
          {sidebar}
          <div className="mx-3 mb-4 mt-3 px-3 py-3 rounded-lg border border-white/[0.07] bg-white/[0.03]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-300 mb-1.5">
              Verify <span className="text-white/25">|</span> Assess <span className="text-white/25">|</span> Build Trust
            </p>
            {USING_VECTOR_RECONSTRUCTION && (
              <p className="text-[10px] leading-relaxed text-ink-faint">
                Mark rendered as vector, reproducing the supplied logo. For exact master artwork see{' '}
                <span className="mono text-ink-dim">src/brand/Logo.tsx</span>.
              </p>
            )}
          </div>
        </aside>

        {/* ── Mobile drawer nav ── */}
        <AnimatePresence>
          {mobileNav && (
            <>
              <motion.div className="lg:hidden fixed inset-0 bg-navy-950/50 z-[55]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMobileNav(false)} aria-hidden />
              <motion.aside
                className="lg:hidden fixed inset-y-0 left-0 w-[264px] bg-navy-900 z-[56] overflow-y-auto"
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              >
                <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.08]">
                  <Logo size={24} withWordmark tone="light" />
                  <button onClick={() => setMobileNav(false)} className="text-ink-dim p-1" aria-label="Close navigation">
                    <X size={18} />
                  </button>
                </div>
                {sidebar}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export function FilterHint() {
  const { facets, clearFacets } = useExplorer()
  if (facets.size === 0) return null
  return (
    <div className="mb-4 flex items-center gap-2 flex-wrap">
      <span className="text-[12px] text-slate-500">Filtered by</span>
      {[...facets].map((f) => <Chip key={f} tone="brand">{f}</Chip>)}
      <button onClick={clearFacets} className="text-[12px] text-slate-500 underline underline-offset-2 hover:text-navy-850">
        clear
      </button>
    </div>
  )
}
