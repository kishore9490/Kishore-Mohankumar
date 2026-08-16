import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ORGS, ORG_BY_ID, RELATIONSHIPS } from '@/data/demo'
import { useExplorer } from '@/state/explorer'
import { Chip, Note, Panel, SectionHeader, TONE } from '@/components/ui'
import { CheckBadge } from '@/brand/Logo'
import { BidCard, CARD_USES } from '@/components/BidCard'
import { BidProfile } from '@/components/BidProfile'

/** §7, §17, §18, §19 — organization model, BID Card, public profile, authorized view. */

const XYZ = ORGS.find((o) => o.id === 'xyz')!

export default function OrganizationLifecycle() {
  const { open } = useExplorer()

  const xyzRels = RELATIONSHIPS.filter((r) => r.sourceId === 'xyz' || r.targetId === 'xyz')

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1400px]">
      <SectionHeader
        eyebrow="Organization lifecycle"
        title="Organizations are not permanently vendors or customers"
        subtitle="The primary entity is the Organization. Vendor, supplier, customer, employer and requester are relationship roles held simultaneously from one identity record — never entity types. Modelling them as types would duplicate records and destroy the reuse the whole business depends on."
      />

      {/* Org model */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 mb-9">
        <Panel>
          <div className="text-center py-3">
            <div className="mx-auto mb-3 grid place-items-center h-12 w-12 rounded-xl bg-verify/10 border border-verify/30">
              <CheckBadge size={22} />
            </div>
            <p className="text-[15px] font-semibold text-navy-850">{XYZ.name}</p>
            <p className="mono text-[12px] text-slate-500 mt-1">{XYZ.bidId}</p>
            <p className="text-[11.5px] text-slate-500 mt-3 leading-relaxed">{XYZ.location}</p>
          </div>
          <div className="border-t border-[var(--line)] pt-3 mt-2">
            <p className="eyebrow mb-2">Roles held simultaneously</p>
            <div className="flex flex-wrap gap-1.5">
              {XYZ.roles.map((r) => <Chip key={r} tone="primary">{r}</Chip>)}
            </div>
          </div>
        </Panel>

        <div>
          <p className="eyebrow mb-3">Relationships — click any for full detail</p>
          <div className="space-y-2">
            {xyzRels.map((r, i) => {
              const src = ORG_BY_ID.get(r.sourceId), tgt = ORG_BY_ID.get(r.targetId)
              const tone = r.status === 'Active' ? 'verify' : 'caution'
              return (
                <motion.button
                  key={r.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, delay: i * 0.04 }}
                  onClick={() => open({ kind: 'relationship', id: r.id })}
                  className="w-full text-left"
                >
                  <div className={`panel panel-shadow px-4 py-3 border-l-[3px] hover:shadow-md transition-all ${TONE[tone].border}`}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="text-[13px] font-medium text-navy-850">{src?.name}</span>
                      <span className="mono text-[11px] rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-slate-600">
                        {r.type}
                      </span>
                      <span className="text-[13px] font-medium text-navy-850">{tgt?.name}</span>
                      <span className="ml-auto flex items-center gap-2">
                        <Chip tone={tone}>{r.status}</Chip>
                        <ArrowRight size={13} className="text-slate-300" />
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 mt-1.5">{r.policy} · {r.verificationStatus}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── BID Digital Card ── */}
      <SectionHeader
        eyebrow="Trust surfaces"
        title="The BID Digital Card"
        subtitle="The card is not the product — it is the visible identity layer over the trust infrastructure. A screenshot proves nothing; only QR resolution to the live profile does, so an expired verification always resolves to an expired profile."
      />
      <BidCard />

      <div className="mt-5 mb-10">
        <p className="eyebrow mb-3">How the BID Card gets used</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {CARD_USES.map((u) => (
            <Panel key={u.label} className="text-center py-4">
              <span className="block text-[20px] mb-1.5" aria-hidden>{u.icon}</span>
              <p className="text-[11.5px] leading-tight text-navy-850 whitespace-pre-line">{u.label}</p>
            </Panel>
          ))}
        </div>
      </div>

      {/* ── Public profile ── */}
      <SectionHeader
        eyebrow="Public profile"
        title="bidtrust.in/BID-BUS-100821"
        subtitle="The shareable trust surface. BID-verified information and company-provided information are structurally separated, and no adverse risk finding ever appears on a public page — that is a defamation exposure and a weapon BID has no standing to wield."
      />
      <BidProfile />

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Note tone="verify">
          <strong>What BID controls.</strong> Verification status, level, dates, validity and badge
          authenticity. A company can make its profile private, but it cannot alter or soften a
          verification result while keeping the profile public.
        </Note>
        <Note tone="primary">
          <strong>What the company controls.</strong> Logo, description, website, categories,
          public contact details, and which credentials to publish.
        </Note>
        <Note tone="adverse">
          <strong>The line that must never blur.</strong> If company-provided data is ever presented
          as verified, the platform's entire value — the claim that verified means verified — is gone.
        </Note>
      </div>
    </div>
  )
}
