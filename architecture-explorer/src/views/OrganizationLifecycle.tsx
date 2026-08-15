import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Check, ExternalLink, Lock, Unlock, ArrowRight } from 'lucide-react'
import { ORGS, ORG_BY_ID, RELATIONSHIPS } from '@/data/demo'
import { useExplorer } from '@/state/explorer'
import { Chip, Note, Panel, SectionHeader, TONE } from '@/components/ui'
import { Logo } from '@/brand/Logo'

/** §7, §17, §18, §19 — organization model, BID Card, public profile, authorized view. */

const XYZ = ORGS.find((o) => o.id === 'xyz')!

const PUBLIC_ROWS = [
  ['Legal entity', 'Verified', '15 Aug 2026'],
  ['GST registration', 'Active', '15 Aug 2026'],
  ['Business status', 'Active', '15 Aug 2026'],
  ['Required certifications', 'Verified', '15 Aug 2026'],
  ['Verification status', 'BID Verified · L3', 'valid to 15 Aug 2027'],
]

const AUTHORIZED_ROWS = [
  ['Bank account ownership', 'Verified — credit-into-account, name match 0.97'],
  ['Turnover band', 'Corroborated — ₹10–25 Cr'],
  ['Directors', '3 verified · no disqualifications'],
  ['Beneficial ownership', 'Verified — 2 UBOs identified'],
  ['Risk screening detail', 'Clear · 1 potential match dismissed 14 Aug 2026'],
  ['Litigation screening', 'No adverse match across searched jurisdictions'],
]

export default function OrganizationLifecycle() {
  const { open } = useExplorer()
  const [authorized, setAuthorized] = useState(false)
  const [requesting, setRequesting] = useState(false)

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
              <Check size={20} className="text-verify-deep" />
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

      {/* BID Card + Public profile */}
      <SectionHeader
        eyebrow="Trust surfaces"
        title="Digital BID Card and public profile"
        subtitle="The card is a pointer, not a record — a screenshot proves nothing, only QR resolution to the live profile does. On the profile, company-provided and BID-verified information are structurally separated, always."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
        {/* Card */}
        <div>
          <div className="rounded-2xl bg-navy-850 text-white p-6 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-60" aria-hidden
              style={{ background: 'radial-gradient(400px 160px at 100% 0%, rgba(29,185,84,0.16), transparent 70%)' }} />
            <div className="relative">
              <Logo size={24} withWordmark tone="light" />
              <div className="mt-6">
                <h3 className="text-[19px] font-semibold leading-snug">{XYZ.name}</h3>
                <p className="mono text-[12.5px] text-ink-dim mt-1">{XYZ.bidId}</p>
              </div>
              <div className="mt-5 rounded-lg bg-verify/[0.14] border border-verify/30 px-4 py-3 flex items-center gap-3">
                <span className="grid place-items-center h-5 w-5 rounded-full bg-verify flex-none">
                  <Check size={12} className="text-[#062B12]" strokeWidth={3} />
                </span>
                <span>
                  <span className="block text-[12.5px] font-bold tracking-[0.09em]">BID VERIFIED</span>
                  <span className="block text-[11px] text-ink-dim mt-0.5">Standard Supplier · Level L3</span>
                </span>
              </div>
              <div className="mt-5 space-y-2">
                {['Identity', 'GST', 'Compliance', 'Risk'].map((k) => (
                  <div key={k} className="flex items-center justify-between text-[13px]">
                    <span className="text-ink-dim">{k}</span>
                    <span className="text-verify-bright flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-verify" />Verified
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-white/10 flex items-end justify-between gap-4">
                <div className="text-[10.5px] text-ink-faint leading-relaxed">
                  Verified <b className="text-ink-dim">15 Aug 2026</b><br />
                  Valid to <b className="text-ink-dim">15 Aug 2027</b>
                  <div className="mt-1.5">bidtrust.in/{XYZ.bidId}</div>
                </div>
                <div className="grid place-items-center h-16 w-16 rounded-lg bg-white flex-none">
                  <QrCode size={44} className="text-navy-850" />
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[11.5px] text-slate-500 leading-relaxed">
            The card exposes no sensitive information — no GSTIN, no PAN, no bank details, no director
            names. It resolves to a live profile whose status is current at the moment of scanning.
          </p>
        </div>

        {/* Profile */}
        <div>
          <Panel pad={false} className="overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--line)] bg-slate-50">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span className="mono text-[11.5px] text-slate-500">bidtrust.in/{XYZ.bidId}</span>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-verify/10 border border-verify/35 px-2.5 py-0.5 text-[10.5px] font-bold tracking-wider text-verify-deep">
                <Check size={10} strokeWidth={3} /> BID VERIFIED
              </span>
            </div>

            {/* BID verified panel */}
            <div className="px-5 py-4 bg-gradient-to-b from-verify/[0.05] to-transparent">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.13em] text-verify-deep mb-1">BID-Verified Information</p>
              <p className="text-[11.5px] text-slate-500 mb-3">Verified by BID Trust against authoritative sources through authorized channels.</p>
              <div className="space-y-2">
                {PUBLIC_ROWS.map(([k, v, d]) => (
                  <div key={k} className="flex items-baseline justify-between gap-3 text-[13px]">
                    <span className="text-slate-600">{k}</span>
                    <span className="text-verify-deep font-medium flex items-center gap-2 whitespace-nowrap">
                      <span className="h-1.5 w-1.5 rounded-full bg-verify" />{v}
                      <span className="mono text-[10.5px] text-slate-400 font-normal">{d}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Company provided panel */}
            <div className="px-5 py-4 border-t border-[var(--line)] bg-[#FEFCF7]">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.13em] text-[#8A6A28] mb-1">Company-Provided Information</p>
              <p className="text-[11.5px] text-slate-500 mb-3">Supplied by the company. Not verified by BID unless individually marked.</p>
              <p className="text-[13px] leading-relaxed text-slate-700">{XYZ.description}</p>
              <div className="flex flex-wrap gap-5 mt-3 text-[12px]">
                <span><span className="block text-[10.5px] text-slate-400 uppercase tracking-wider">Website</span><b>{XYZ.website}</b></span>
                <span><span className="block text-[10.5px] text-slate-400 uppercase tracking-wider">Employees</span><b>50–100</b></span>
                <span><span className="block text-[10.5px] text-slate-400 uppercase tracking-wider">Established</span><b>2014</b></span>
              </div>
            </div>

            {/* Authorized view */}
            <div className="px-5 py-4 border-t border-[var(--line)]">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.13em] text-slate-500 flex items-center gap-1.5">
                  {authorized ? <Unlock size={12} className="text-verify-deep" /> : <Lock size={12} />}
                  Authorized Verification View
                </p>
                {!authorized && !requesting && (
                  <button onClick={() => setRequesting(true)}
                    className="rounded-lg bg-navy-900 text-white px-3 py-1.5 text-[12px] font-medium hover:bg-navy-800">
                    Request additional verification
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!authorized && !requesting && (
                  <motion.p key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-[12.5px] text-slate-500 leading-relaxed">
                    Financial detail, ownership and risk screening detail are not public. A requester
                    must state a purpose, and the organization must consent to that specific,
                    scoped, time-boxed disclosure.
                  </motion.p>
                )}

                {requesting && !authorized && (
                  <motion.div key="requesting" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="rounded-lg border border-[var(--line)] p-4">
                    <p className="text-[12.5px] font-medium text-navy-850 mb-2">ABC Technologies has requested additional verification.</p>
                    <ul className="space-y-1 mb-3 text-[12px] text-slate-600">
                      {['Financial verification', 'Bank account verification', 'Ownership / UBO detail', 'Risk screening detail'].map((x) => (
                        <li key={x} className="flex gap-2"><Check size={12} className="text-verify mt-[3px] flex-none" />{x}</li>
                      ))}
                    </ul>
                    <div className="text-[11.5px] text-slate-500 mb-3 space-y-0.5">
                      <p><b>Purpose:</b> Critical supplier onboarding — CT-2026-0088</p>
                      <p><b>Retention:</b> 36 months · <b>Expires:</b> 15 Aug 2027 · <b>Revocable:</b> yes</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setAuthorized(true); setRequesting(false) }}
                        className="rounded-lg bg-verify text-[#06220F] px-3 py-1.5 text-[12px] font-semibold hover:bg-verify-bright">
                        Authorize disclosure
                      </button>
                      <button onClick={() => setRequesting(false)}
                        className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-[12px] text-slate-600 hover:border-navy-500/50">
                        Decline
                      </button>
                    </div>
                    <p className="text-[10.5px] text-slate-400 mt-2.5">
                      Declining is a first-class outcome — never reported to the requester as an adverse signal.
                    </p>
                  </motion.div>
                )}

                {authorized && (
                  <motion.div key="authorized" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="space-y-2 mb-3">
                      {AUTHORIZED_ROWS.map(([k, v]) => (
                        <div key={k} className="flex items-baseline justify-between gap-4 text-[12.5px]">
                          <span className="text-slate-600 flex-none">{k}</span>
                          <span className="text-navy-850 text-right">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg bg-verify/[0.06] border border-verify/30 px-3 py-2 text-[11.5px] text-verify-deep">
                      Consent <span className="mono">BID-CON-4471902</span> · granted 15 Aug 2026 · expires 15 Aug 2027 · revocable at any time
                    </div>
                    <button onClick={() => setAuthorized(false)}
                      className="mt-2 text-[11.5px] text-slate-500 underline underline-offset-2 hover:text-navy-850">
                      Revoke consent (reset demo)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="px-5 py-3.5 border-t border-[var(--line)] flex flex-wrap gap-2">
              <button className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-[12px] text-slate-600 inline-flex items-center gap-1.5">
                <ExternalLink size={12} /> Share
              </button>
              <button className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-[12px] text-slate-600 inline-flex items-center gap-1.5">
                <QrCode size={12} /> QR Code
              </button>
            </div>
          </Panel>

          <div className="mt-4">
            <Note tone="adverse">
              <strong>The most important rule in the product.</strong> Company-provided and BID-verified
              information are separated visually and structurally, with no exceptions. If that line is
              blurred even once, the entire trust proposition is compromised — because the platform's
              value rests on the claim that verified means verified.
            </Note>
          </div>
        </div>
      </div>
    </div>
  )
}
