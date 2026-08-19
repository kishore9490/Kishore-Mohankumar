import { notFound } from 'next/navigation'
import { desc, eq } from 'drizzle-orm'
import { MapPin, Globe, Calendar, Lock } from 'lucide-react'
import {
  db, organizations, verificationRequests, assessments, credentials, verificationChecks,
} from '@/db'
import { Logo, CheckBadge, VerifiedShield } from '@/components/Brand'
import { CHECK_CATALOG } from '@/lib/providers/mock'
import { normalizeBidId } from '@/lib/bidid'

/**
 * The public BID profile.
 *
 * Two rules are absolute here:
 *   1. BID-verified and company-provided information are STRUCTURALLY separated.
 *   2. No adverse risk finding ever appears on this page. Risk detail goes only
 *      to authorised requesters under consent — publishing it would be a
 *      defamation exposure and a weapon BID has no standing to wield.
 */
export default async function PublicProfile({ params }: { params: Promise<{ bidId: string }> }) {
  const { bidId } = await params
  const normalized = normalizeBidId(bidId) ?? bidId.toUpperCase()

  const [org] = await db.select().from(organizations).where(eq(organizations.bidId, normalized)).limit(1)
  if (!org || !org.profilePublic) notFound()

  const [request] = await db.select().from(verificationRequests)
    .where(eq(verificationRequests.subjectOrgId, org.id))
    .orderBy(desc(verificationRequests.createdAt)).limit(1)

  const [assessment] = request
    ? await db.select().from(assessments).where(eq(assessments.requestId, request.id)).limit(1)
    : [null]

  const checks = request
    ? await db.select().from(verificationChecks).where(eq(verificationChecks.requestId, request.id))
    : []

  const creds = await db.select().from(credentials).where(eq(credentials.holderOrgId, org.id))

  const isVerified = request?.outcome === 'VERIFIED'
  // Only pass/fail per check is public — never the underlying detail or evidence.
  const publicChecks = checks.filter((c) => c.requirement === 'REQUIRED').map((c) => ({
    label: CHECK_CATALOG[c.checkCode]?.label ?? c.checkCode,
    ok: c.outcome === 'VERIFIED',
    outcome: c.outcome,
  }))

  return (
    <div className="min-h-screen">
      <header className="bg-navy py-3.5">
        <div className="mx-auto max-w-5xl px-6"><Logo size={22} tone="light" /></div>
      </header>

      <div className="bg-gradient-to-r from-navy via-navy-soft to-navy-mid px-6 py-7">
        <div className="mx-auto flex max-w-5xl flex-wrap items-start gap-5">
          <span className="grid h-20 w-20 flex-none place-items-center rounded-xl bg-white shadow-lg">
            <span className="text-[22px] font-bold tracking-tight text-navy">
              {org.logoText ?? org.legalName.slice(0, 3).toLowerCase()}
            </span>
          </span>
          <div className="min-w-0 flex-1">
            {isVerified ? (
              <span className="pill bg-verify text-white"><CheckBadge size={12} /> BID VERIFIED BUSINESS</span>
            ) : (
              <span className="pill bg-white/15 text-white/85">NOT YET VERIFIED</span>
            )}
            <h1 className="mt-2.5 flex flex-wrap items-center gap-2 text-[26px] font-bold leading-tight text-white">
              {org.legalName} {isVerified && <CheckBadge size={18} />}
            </h1>
            <p className="mt-1.5 text-[13px] text-white/85">
              BID ID: <span className="font-mono font-bold">{org.bidId}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-white/75">
              {(org.city || org.state) && (
                <span className="flex items-center gap-1.5"><MapPin size={12} />{[org.city, org.state].filter(Boolean).join(', ')}</span>
              )}
              {org.website && <span className="flex items-center gap-1.5"><Globe size={12} />{org.website}</span>}
              {org.incorporatedOn && <span className="flex items-center gap-1.5"><Calendar size={12} />{org.incorporatedOn}</span>}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-5xl gap-4 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          {/* ── BID-verified panel ── */}
          <section className="card overflow-hidden">
            <div className="border-b border-line bg-gradient-to-b from-verify-soft to-transparent px-5 py-4">
              <p className="label text-verify">BID-Verified Information</p>
              <p className="mt-1 text-[12px] text-ink-dim">
                Verified by BID against authorized sources. BID is an independent private platform,
                not a government authority.
              </p>
            </div>
            <div className="space-y-2.5 px-5 py-4">
              {publicChecks.length === 0 && (
                <p className="text-[13px] text-ink-dim">No verification has been completed yet.</p>
              )}
              {publicChecks.map((c) => (
                <div key={c.label} className="flex items-baseline justify-between gap-4 text-[13px]">
                  <span className="text-ink-dim">{c.label}</span>
                  <span className={`flex items-center gap-2 font-semibold ${c.ok ? 'text-verify' : 'text-ink-faint'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${c.ok ? 'bg-verify' : 'bg-slate-300'}`} />
                    {c.ok ? 'Verified' : c.outcome === 'INSUFFICIENT_EVIDENCE' ? 'Not available' : 'Under review'}
                  </span>
                </div>
              ))}
              {request?.validUntil && (
                <div className="mt-3 flex flex-wrap gap-6 border-t border-dashed border-line pt-3 text-[12px]">
                  <span><span className="block text-ink-faint">Verification level</span><b>{request.level}</b></span>
                  <span><span className="block text-ink-faint">Valid until</span><b>{request.validUntil.toDateString()}</b></span>
                </div>
              )}
            </div>
          </section>

          {/* ── Company-provided panel — visually and structurally separate ── */}
          <section className="card overflow-hidden">
            <div className="border-b border-line bg-amber-50/50 px-5 py-4">
              <p className="label text-amber-700">Company-Provided Information</p>
              <p className="mt-1 text-[12px] text-ink-dim">
                Supplied by the company. Not verified by BID.
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[13px] leading-relaxed text-ink-dim">
                {org.description || 'No description provided.'}
              </p>
            </div>
          </section>

          {creds.length > 0 && (
            <section className="card p-5">
              <h2 className="text-[15px] font-bold">BID Credentials</h2>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {creds.map((c) => (
                  <div key={c.id} className="rounded-lg border border-line p-3">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-verify-soft">
                      <CheckBadge size={13} />
                    </span>
                    <p className="mt-2 text-[12.5px] font-semibold">{c.type.replace(/_/g, ' ')}</p>
                    <p className="mt-1 text-[11px] text-ink-faint">Level {c.level}</p>
                    <p className="text-[11px] text-ink-faint">Valid till {c.validUntil.toDateString()}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Status rail ── */}
        <aside className="space-y-3">
          <div className="card p-4">
            <p className="label">BID Verification Status</p>
            <div className="mt-3 flex items-center gap-3">
              {isVerified ? <VerifiedShield size={44} /> : <span className="h-11 w-11 rounded-full bg-slate-100" />}
              <span>
                <span className={`block text-[19px] font-bold leading-none ${isVerified ? 'text-verify' : 'text-ink-faint'}`}>
                  {isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                </span>
                <span className="mt-1.5 block text-[11px] text-ink-dim">
                  {isVerified ? 'This business is verified by BID' : 'No completed verification'}
                </span>
              </span>
            </div>
            {assessment && (
              <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-[11.5px] text-ink-dim">
                Assessment is shared with authorised requesters only, never published here.
              </p>
            )}
          </div>

          <div className="card p-4">
            <p className="label mb-2">Share this profile</p>
            <code className="block truncate rounded-lg border border-line bg-canvas px-2.5 py-2 font-mono text-[11px]">
              /p/{org.bidId}
            </code>
          </div>

          <div className="card p-4">
            <p className="label mb-2">Need more verification?</p>
            <p className="text-[11.5px] text-ink-dim">
              Deeper detail requires the organization&apos;s specific, time-boxed consent.
            </p>
          </div>
        </aside>
      </main>

      <footer className="flex items-center gap-2 bg-verify-soft px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-2 text-[11.5px] text-verify">
          <Lock size={12} />
          Information on this page is provided by BID based on verified data from authorized sources.
          BID is not a government authority and does not certify trustworthiness.
        </div>
      </footer>
    </div>
  )
}
