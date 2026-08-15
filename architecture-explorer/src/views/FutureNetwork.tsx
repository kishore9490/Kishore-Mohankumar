import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowDown } from 'lucide-react'
import { Note, Panel, SectionHeader } from '@/components/ui'
import { Logo } from '@/brand/Logo'

/** §39 — the BID Trust big picture. */

const CHAIN = [
  { label: 'IDENTITY + RELATIONSHIP + TRUST', tone: 'head' },
  { label: 'VERIFY ANY ENTITY', tone: 'step' },
  { label: 'ANY INDUSTRY', tone: 'step' },
  { label: 'ANY RELATIONSHIP', tone: 'step' },
  { label: 'POLICY-DRIVEN CHECKS', tone: 'verify' },
  { label: 'AUTHORIZED VERIFICATION', tone: 'verify' },
  { label: 'EVIDENCE + ASSESSMENT', tone: 'verify' },
  { label: 'BID ID + CREDENTIALS', tone: 'verify' },
  { label: 'MONITORING', tone: 'verify' },
  { label: 'ENTERPRISE DECISION', tone: 'step' },
  { label: 'NETWORK EXPANSION', tone: 'growth' },
  { label: 'MORE MEMBERS', tone: 'growth' },
  { label: 'MORE CUSTOMERS', tone: 'growth' },
  { label: 'STRONGER NETWORK', tone: 'head' },
]

const STYLE: Record<string, string> = {
  head: 'bg-navy-900 text-white border-navy-900',
  step: 'bg-white text-navy-850 border-[var(--line)]',
  verify: 'bg-verify/[0.07] text-verify-deep border-verify/40',
  growth: 'bg-navy-850/[0.05] text-navy-700 border-navy-500/30',
}

export default function FutureNetwork() {
  const navigate = useNavigate()

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1400px]">
      <SectionHeader
        eyebrow="Future network"
        title="The BID Trust big picture"
        subtitle="Every layer of the architecture exists to sustain this chain. Read it top to bottom: identity and relationships make verification possible, policy makes it universal, evidence makes it defensible, monitoring keeps it true, and the network makes each cycle cheaper than the last."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}
            className="rounded-2xl bg-navy-900 text-white px-8 py-6 text-center shadow-xl mb-1"
          >
            <Logo size={30} className="mb-3 inline-block" />
            <p className="text-[20px] font-semibold tracking-[0.06em]">BID TRUST</p>
            <p className="text-[11.5px] text-verify-bright mt-1">Trust, backed by verification.</p>
          </motion.div>

          {CHAIN.map((c, i) => (
            <div key={c.label} className="w-full max-w-[440px] flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 22 }}
                transition={{ delay: i * 0.06, duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <ArrowDown size={15} className="text-slate-300" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 + 0.05, duration: 0.25 }}
                className={`w-full rounded-lg border px-4 py-3 text-center text-[12.5px] font-semibold tracking-[0.06em] ${STYLE[c.tone]}`}
              >
                {c.label}
              </motion.div>
            </div>
          ))}

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0, duration: 0.4 }}
            className="mt-5 text-center"
          >
            <p className="text-[12.5px] text-slate-500">↻ and the cycle repeats, one layer deeper each time</p>
          </motion.div>
        </div>

        <div className="space-y-4">
          <Panel>
            <p className="eyebrow mb-2.5">The fundamental idea</p>
            <p className="text-[14px] leading-relaxed text-slate-700">
              BID Trust is <strong className="text-navy-850">not a vendor database</strong>. It is a
              domain-agnostic trust infrastructure where organizations and people have identities,
              relationships, verification policies, evidence, credentials and continuously
              maintained trust signals.
            </p>
            <p className="text-[14px] leading-relaxed text-verify-deep font-medium mt-3">
              Any organization can be a verified subject today and a verification requester tomorrow.
            </p>
          </Panel>

          <Note tone="verify">
            <strong>What compounds.</strong> Cost per verification falls with network density because
            reuse rises. Price does not fall proportionally. That gap widens with every new member —
            and it is the only durable moat in a market where point verification is heading to zero.
          </Note>

          <Note tone="caution">
            <strong>What does not compound yet.</strong> The network is worth nothing until density
            exists. Density beats breadth: 500 verified suppliers in one region and a few adjacent
            categories is worth far more than 5,000 scattered nationally, because reuse only fires
            when two buyers want the same entity.
          </Note>

          <Panel>
            <p className="eyebrow mb-2.5">Where to go next</p>
            <div className="space-y-1.5">
              {[
                ['/network', 'Play the network scenario', '24 steps, ABC → XYZ → LMN → OPQ'],
                ['/trust-engine', 'Edit a verification policy', 'See domain-agnosticism in action'],
                ['/technical', 'Explore the nine layers', '69 clickable components'],
                ['/principles', 'Read the decision records', '30 principles, 10 ADRs'],
              ].map(([to, label, sub]) => (
                <button key={to} onClick={() => navigate(to)}
                  className="w-full text-left rounded-lg border border-[var(--line)] px-3 py-2.5 hover:border-verify/50 hover:bg-verify/[0.04] transition-colors">
                  <p className="text-[12.5px] font-medium text-navy-850">{label} →</p>
                  <p className="text-[11.5px] text-slate-500">{sub}</p>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
