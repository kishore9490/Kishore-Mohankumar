import Link from 'next/link'
import { notFound } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import { Copy, ExternalLink } from 'lucide-react'
import {
  db, campaigns, campaignMembers, policies, policyVersions,
  verificationRequests, verificationChecks, assessments, organizations,
} from '@/db'
import { requirePrincipal } from '@/lib/auth'
import { StatusPill } from '@/components/Brand'
import { bandLabel, type Band } from '@/lib/assessment'
import { CHECK_CATALOG } from '@/lib/providers/mock'

export default async function CampaignDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = await requirePrincipal()

  const [campaign] = await db.select().from(campaigns)
    .where(and(eq(campaigns.id, id), eq(campaigns.workspaceId, p.workspaceId)))
    .limit(1)
  if (!campaign) notFound()

  const [pv] = await db
    .select({ name: policies.name, version: policyVersions.version })
    .from(policyVersions).innerJoin(policies, eq(policyVersions.policyId, policies.id))
    .where(eq(policyVersions.id, campaign.policyVersionId)).limit(1)

  const members = await db.select().from(campaignMembers).where(eq(campaignMembers.campaignId, id))

  const detail = await Promise.all(members.map(async (m) => {
    if (!m.verificationRequestId) return { member: m, request: null, checks: [], band: null, org: null }
    const [req] = await db.select().from(verificationRequests)
      .where(eq(verificationRequests.id, m.verificationRequestId)).limit(1)
    const checks = await db.select().from(verificationChecks)
      .where(eq(verificationChecks.requestId, m.verificationRequestId))
    const [a] = await db.select().from(assessments)
      .where(eq(assessments.requestId, m.verificationRequestId)).limit(1)
    const [org] = m.organizationId
      ? await db.select().from(organizations).where(eq(organizations.id, m.organizationId)).limit(1)
      : [null]
    return { member: m, request: req ?? null, checks, band: (a?.band as Band) ?? null, org: org ?? null }
  }))

  const stats = {
    invited: members.length,
    completed: members.filter((m) => m.status === 'COMPLETED').length,
    exception: members.filter((m) => m.status === 'EXCEPTION').length,
    pending: members.filter((m) => m.status === 'INVITED').length,
  }

  return (
    <div>
      <Link href="/dashboard/campaigns" className="text-[12.5px] text-ink-dim hover:text-brand">← Campaigns</Link>
      <h1 className="mt-2 text-[24px] font-bold">{campaign.name}</h1>
      <p className="mt-1 text-[13px] text-ink-dim">{pv?.name} v{pv?.version}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Invited', stats.invited, ''],
          ['Verified', stats.completed, 'text-verify'],
          ['Exception', stats.exception, 'text-red-600'],
          ['Awaiting', stats.pending, 'text-amber-600'],
        ].map(([label, value, cls]) => (
          <div key={String(label)} className="card p-4">
            <p className="label">{label}</p>
            <p className={`mt-2 font-mono text-[24px] font-bold leading-none ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {detail.map(({ member, request, checks, band, org }) => (
          <div key={member.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[16px] font-bold">{member.legalName}</h2>
                <p className="mt-0.5 text-[12.5px] text-ink-dim">{member.email}</p>
                {org && (
                  <Link href={`/p/${org.bidId}`} className="mt-1 inline-flex items-center gap-1.5 font-mono text-[12px] text-brand">
                    {org.bidId} <ExternalLink size={11} />
                  </Link>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill value={member.status} />
                {band && <StatusPill value={band} />}
                {request?.level && <span className="pill bg-slate-100 text-slate-600">{request.level}</span>}
              </div>
            </div>

            {member.status === 'INVITED' && (
              <div className="mt-4 rounded-lg bg-canvas p-3">
                <p className="label mb-1.5">Invitation link — send this to the counterparty</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded border border-line bg-white px-2.5 py-1.5 font-mono text-[11.5px]">
                    /invite/{member.inviteToken}
                  </code>
                  <Link href={`/invite/${member.inviteToken}`} className="btn-ghost py-1.5 text-[12px]">
                    <Copy size={12} /> Open
                  </Link>
                </div>
                <p className="mt-2 text-[11.5px] text-ink-faint">
                  In production this is emailed. Expires {member.inviteExpiresAt.toDateString()}.
                </p>
              </div>
            )}

            {checks.length > 0 && (
              <div className="mt-4 border-t border-line pt-4">
                <p className="label mb-2">Checks — {checks.filter((c) => c.outcome === 'VERIFIED').length} of {checks.length} verified</p>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {checks.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2">
                      <span className="min-w-0">
                        <span className="block truncate text-[12.5px] font-medium">
                          {CHECK_CATALOG[c.checkCode]?.label ?? c.checkCode}
                        </span>
                        <span className="block truncate text-[11px] text-ink-faint">
                          {c.sourceClass ?? '—'} · {c.providerId ?? 'not routed'}
                        </span>
                      </span>
                      <StatusPill value={c.outcome} />
                    </div>
                  ))}
                </div>
                {band && (
                  <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-[12.5px] text-ink-dim">
                    Assessment: <strong className="text-ink">{bandLabel(band)}</strong>
                    {band === 'INSUFFICIENT_EVIDENCE' &&
                      ' — data was unavailable, which is not an adverse finding.'}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
