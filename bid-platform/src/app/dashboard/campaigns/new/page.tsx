import { eq } from 'drizzle-orm'
import { db, policies, policyVersions } from '@/db'
import { requirePrincipal } from '@/lib/auth'
import { CampaignForm } from './form'

export default async function NewCampaign() {
  const p = await requirePrincipal()
  const options = await db
    .select({ id: policyVersions.id, name: policies.name, version: policyVersions.version })
    .from(policyVersions)
    .innerJoin(policies, eq(policyVersions.policyId, policies.id))
    .where(eq(policies.workspaceId, p.workspaceId))

  return (
    <div className="max-w-[640px]">
      <p className="label">Verification</p>
      <h1 className="mt-1 text-[24px] font-bold">New campaign</h1>
      <p className="mt-1.5 text-[13.5px] text-ink-dim">
        Each counterparty gets a scoped, expiring invitation link. They do not need an account,
        and they are never charged.
      </p>
      <CampaignForm options={options} />
    </div>
  )
}
