import Link from 'next/link'
import { desc, eq, inArray } from 'drizzle-orm'
import { Plus } from 'lucide-react'
import { db, campaigns, campaignMembers, policies, policyVersions } from '@/db'
import { requirePrincipal } from '@/lib/auth'

export default async function Campaigns() {
  const p = await requirePrincipal()
  const rows = await db
    .select({
      id: campaigns.id, name: campaigns.name, createdAt: campaigns.createdAt,
      policyName: policies.name, version: policyVersions.version,
    })
    .from(campaigns)
    .innerJoin(policyVersions, eq(campaigns.policyVersionId, policyVersions.id))
    .innerJoin(policies, eq(policyVersions.policyId, policies.id))
    .where(eq(campaigns.workspaceId, p.workspaceId))
    .orderBy(desc(campaigns.createdAt))

  const ids = rows.map((r) => r.id)
  const members = ids.length
    ? await db.select().from(campaignMembers).where(inArray(campaignMembers.campaignId, ids))
    : []

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Verification</p>
          <h1 className="mt-1 text-[24px] font-bold">Campaigns</h1>
        </div>
        <Link href="/dashboard/campaigns/new" className="btn-verify"><Plus size={14} /> New campaign</Link>
      </div>

      <div className="mt-6 space-y-3">
        {rows.length === 0 && (
          <div className="card p-8 text-center text-[13.5px] text-ink-dim">No campaigns yet.</div>
        )}
        {rows.map((c) => {
          const mine = members.filter((m) => m.campaignId === c.id)
          const done = mine.filter((m) => m.status === 'COMPLETED').length
          const exc = mine.filter((m) => m.status === 'EXCEPTION').length
          return (
            <Link key={c.id} href={`/dashboard/campaigns/${c.id}`} className="card block p-5 hover:border-brand">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-bold">{c.name}</h2>
                  <p className="mt-0.5 text-[12.5px] text-ink-dim">{c.policyName} v{c.version}</p>
                </div>
                <div className="flex gap-5 text-center">
                  <span><span className="block font-mono text-[18px] font-bold">{mine.length}</span><span className="label">Invited</span></span>
                  <span><span className="block font-mono text-[18px] font-bold text-verify">{done}</span><span className="label">Verified</span></span>
                  <span><span className="block font-mono text-[18px] font-bold text-red-600">{exc}</span><span className="label">Exception</span></span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
