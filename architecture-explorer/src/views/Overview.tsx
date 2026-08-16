import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Share2, Fingerprint } from 'lucide-react'
import { useExplorer } from '@/state/explorer'
import { KPIS, DEMO_NOTICE } from '@/data/demo'
import { PRINCIPLES } from '@/data/catalog'
import { Chip, DemoBadge, Panel, SectionHeader, Note } from '@/components/ui'
import { FilterHint } from '@/components/AppShell'
import { Logo } from '@/brand/Logo'

/** §4 — executive overview. */

const PILLARS = [
  {
    id: 'identity', name: 'IDENTITY', icon: Fingerprint, tone: 'primary' as const,
    blurb: 'Who the entity is, independent of any commercial role.',
    items: [
      { label: 'Organizations', component: 'organization-service' },
      { label: 'People', component: 'person-service' },
      { label: 'Documents', component: 'document-verification' },
      { label: 'Credentials', component: 'credential-service' },
    ],
  },
  {
    id: 'trust', name: 'TRUST', icon: ShieldCheck, tone: 'verify' as const,
    blurb: 'What was checked, against what source, when, and to what depth.',
    items: [
      { label: 'Verification', component: 'verification-engine' },
      { label: 'Policies', component: 'policy-engine' },
      { label: 'Assessment', component: 'assessment-engine' },
      { label: 'Evidence', component: 'evidence-service' },
    ],
  },
  {
    id: 'network', name: 'NETWORK', icon: Share2, tone: 'primary' as const,
    blurb: 'How verified trust travels between organizations, under consent.',
    items: [
      { label: 'Relationships', component: 'relationship-service' },
      { label: 'Credentials', component: 'credential-service' },
      { label: 'Monitoring', component: 'monitoring-engine' },
      { label: 'Sharing', component: 'consent-service' },
    ],
  },
]

export default function Overview() {
  const { open, matches } = useExplorer()
  const navigate = useNavigate()

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1400px]">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="rounded-2xl bg-navy-900 text-white overflow-hidden relative mb-7"
      >
        <div
          className="absolute inset-0 opacity-[0.55]"
          style={{ background: 'radial-gradient(900px 380px at 88% -10%, rgba(46,155,245,0.20), transparent 62%)' }}
          aria-hidden
        />
        <div className="relative px-6 md:px-10 py-9 md:py-12">
          <Logo size={34} className="mb-5 inline-block" />
          <h1 className="text-[32px] md:text-[42px] leading-[1.06] font-semibold tracking-[-0.025em] max-w-[18ch]">
            BID Trust
            <span className="block text-ink-dim font-normal">Architecture Explorer</span>
          </h1>
          <p className="mt-5 text-[15px] md:text-[16px] leading-relaxed text-ink-dim max-w-[62ch]">
            An industry-agnostic trust, verification and due-diligence infrastructure for
            businesses and people.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-400/15 border border-brand-400/40 px-3.5 py-1.5 text-[12.5px] font-medium text-brand-300">
              <ShieldCheck size={13} /> Verify · Assess · Build Trust
            </span>
            <button
              onClick={() => navigate('/network')}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 px-3.5 py-1.5 text-[12.5px] text-white transition-colors"
            >
              Play the network scenario <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </motion.div>

      <FilterHint />

      {/* Core architecture — clickable */}
      <SectionHeader
        eyebrow="Core architecture"
        title="Three pillars, one engine"
        subtitle="Every block below opens its detailed architecture. Identity establishes who an entity is; Trust establishes what has been verified about it; Network moves that verified trust between organizations under consent."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {PILLARS.map((p, i) => {
          const Icon = p.icon
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <Panel className="h-full">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className={`grid place-items-center h-8 w-8 rounded-lg ${p.tone === 'verify' ? 'bg-verify/12 text-verify-deep' : 'bg-navy-850/[0.06] text-navy-700'}`}>
                    <Icon size={16} />
                  </span>
                  <h3 className="text-[13px] font-bold tracking-[0.1em] text-navy-850">{p.name}</h3>
                </div>
                <p className="text-[13px] leading-relaxed text-slate-600 mb-4">{p.blurb}</p>
                <div className="grid grid-cols-2 gap-2">
                  {p.items.map((it) => (
                    <button
                      key={it.label}
                      onClick={() => open({ kind: 'component', id: it.component })}
                      className="text-left rounded-lg border border-[var(--line)] px-3 py-2.5 text-[12.5px] text-navy-850 hover:border-verify/50 hover:bg-verify/[0.05] transition-colors group"
                    >
                      <span className="flex items-center justify-between gap-2">
                        {it.label}
                        <ArrowRight size={12} className="opacity-0 group-hover:opacity-60 transition-opacity flex-none" />
                      </span>
                    </button>
                  ))}
                </div>
              </Panel>
            </motion.div>
          )
        })}
      </div>

      <Note tone="verify">
        <strong>The one idea this whole explorer exists to convey:</strong> BID is not a vendor
        database. It is trust infrastructure where organizations and people hold identities,
        relationships, policies, evidence and credentials — and where{' '}
        <em>any organization can be a verified subject today and a verification requester tomorrow.</em>
      </Note>

      {/* KPIs */}
      <div className="mt-8">
        <SectionHeader
          eyebrow="Platform state"
          title="Key metrics"
          right={<DemoBadge>Demo numbers only</DemoBadge>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {KPIS.map((k, i) => {
            const dim = !matches([k.facet])
            return (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: dim ? 0.3 : 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
              >
                <Panel className="h-full">
                  <p className="eyebrow mb-2">{k.label}</p>
                  <p className="mono text-[26px] font-semibold leading-none text-navy-850 tracking-tight">{k.value}</p>
                  <p className="text-[11.5px] text-slate-500 mt-2">{k.delta}</p>
                </Panel>
              </motion.div>
            )
          })}
        </div>
        <p className="mt-3 text-[11.5px] text-slate-500">{DEMO_NOTICE}</p>
      </div>

      {/* Principles preview */}
      <div className="mt-9">
        <SectionHeader
          eyebrow="Non-negotiable"
          title="Architecture principles"
          subtitle="Thirty principles govern every design decision in this explorer. These four are the ones that most often get violated by well-meaning shortcuts."
          right={
            <button onClick={() => navigate('/principles')} className="inline-flex items-center gap-1.5 text-[13px] text-navy-700 hover:text-verify-deep">
              All 30 principles <ArrowRight size={13} />
            </button>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[4, 5, 12, 22].map((n) => {
            const p = PRINCIPLES.find((x) => x.n === n)!
            return (
              <Panel key={n} className="flex gap-3.5 items-start">
                <span className="mono text-[11px] font-semibold text-verify-deep bg-verify/10 border border-verify/25 rounded px-1.5 py-0.5 flex-none mt-0.5">
                  {String(p.n).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] leading-relaxed text-navy-850 font-medium">{p.text}</p>
                  <Chip tone="neutral">{p.facet}</Chip>
                </div>
              </Panel>
            )
          })}
        </div>
      </div>
    </div>
  )
}
