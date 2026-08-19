import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import { ArrowRight, Send, FileCheck2 } from 'lucide-react'
import { db, campaigns, campaignMembers, policies, verificationRequests, organizations } from '@/db'
import { requirePrincipal } from '@/lib/auth'
import { StatusPill } from '@/components/Brand'

export default async function Overview() {
  const p = await requirePrincipal()

  // Every read is scoped to the workspace. Nothing tenant-private is queried
  // without it — that boundary is the whole multi-tenancy model.
  const myCampaigns = await db.select().from(campaigns)
    .where(eq(campaigns.workspaceId, p.workspaceId)).orderBy(desc(campaigns.createdAt))
  const myPolicies = await db.select().from(policies).where(eq(policies.workspaceId, p.workspaceId))
  const requests = await db
    .select({
      id: verificationRequests.id, bidRef: verificationRequests.bidRef,
      status: verificationRequests.status, outcome: verificationRequests.outcome,
      level: verificationRequests.level, org: organizations.legalName, orgBid: organizations.bidId,
    })
    .from(verificationRequests)
    .innerJoin(organizations, eq(verificationRequests.subjectOrgId, organizations.id))
    .where(eq(verificationRequests.workspaceId, p.workspaceId))
    .orderBy(desc(verificationRequests.createdAt))
    .limit(8)

  const memberRows = myCampaigns.length
    ? await db.select().from(campaignMembers).where(eq(campaignMembers.campaignId, myCampaigns[0].id))
    : []

  const stats = [
    { label: 'Policies', value: myPolicies.length },
    { label: 'Campaigns', value: myCampaigns.length },
    { label: 'Verifications', value: requests.length },
    { label: 'Verified', value: requests.filter((r) => r.outcome === 'VERIFIED').length },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Workspace</p>
          <h1 className="mt-1 text-[24px] font-bold">{p.organizationName}</h1>
          <p className="mt-1 font-mono text-[12.5px] text-ink-dim">{p.organizationBidId}</p>
        </div>
        <Link href="/dashboard/campaigns/new" className="btn-verify">
          <Send size={14} /> New campaign
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="label">{s.label}</p>
            <p className="mt-2 font-mono text-[26px] font-bold leading-none">{s.value}</p>
          </div>
        ))}
      </div>

      {myCampaigns.length === 0 ? (
        <div className="card mt-6 p-8 text-center">
          <FileCheck2 size={26} className="mx-auto text-ink-faint" />
          <h2 className="mt-3 text-[17px] font-bold">Run your first verification</h2>
          <p className="mx-auto mt-1.5 max-w-[52ch] text-[13.5px] text-ink-dim">
            A campaign binds one of your policies to a list of counterparties and invites them.
            They complete verification without needing an account, and never pay.
          </p>
          <Link href="/dashboard/campaigns/new" className="btn-verify mt-5">
            Create a campaign <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="mt-6 card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="text-[15px] font-bold">Recent verifications</h2>
            <Link href="/dashboard/campaigns" className="text-[12.5px] font-semibold text-brand">All campaigns</Link>
          </div>
          {requests.length === 0 ? (
            <p className="px-5 py-6 text-[13.5px] text-ink-dim">
              {memberRows.length} counterparty invited. Results appear here as they complete.
            </p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line bg-canvas">
                  <th className="label px-5 py-2.5 text-left">Organization</th>
                  <th className="label px-5 py-2.5 text-left">BID ID</th>
                  <th className="label px-5 py-2.5 text-left">Outcome</th>
                  <th className="label px-5 py-2.5 text-left">Level</th>
                  <th className="label px-5 py-2.5 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3 font-medium">{r.org}</td>
                    <td className="px-5 py-3 font-mono text-[12px] text-ink-dim">
                      <Link href={`/p/${r.orgBid}`} className="hover:text-brand">{r.orgBid}</Link>
                    </td>
                    <td className="px-5 py-3">{r.outcome ? <StatusPill value={r.outcome} /> : '—'}</td>
                    <td className="px-5 py-3 font-mono">{r.level ?? '—'}</td>
                    <td className="px-5 py-3"><StatusPill value={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
