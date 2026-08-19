import { eq } from 'drizzle-orm'
import { CheckCircle2, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import {
  db, campaignMembers, campaigns, policyVersions, policies, workspaces, organizations,
} from '@/db'
import { Logo, CheckBadge } from '@/components/Brand'
import { parsePolicy } from '@/lib/verification'
import { CHECK_CATALOG } from '@/lib/providers/mock'
import { InviteForm } from './form'

/**
 * The invited-counterparty flow — the single highest-leverage surface in the
 * product. If this is slow or opaque, campaigns stall and the network never
 * forms. No account is required and the invitee is never charged.
 */
export default async function Invite({
  params, searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ done?: string }>
}) {
  const { token } = await params
  const { done } = await searchParams

  const [member] = await db.select().from(campaignMembers)
    .where(eq(campaignMembers.inviteToken, token)).limit(1)

  if (!member) {
    return <Shell><p className="text-[14px] text-ink-dim">This invitation link is not valid.</p></Shell>
  }

  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, member.campaignId)).limit(1)
  const [requester] = campaign
    ? await db.select({ name: organizations.legalName, bidId: organizations.bidId })
        .from(workspaces).innerJoin(organizations, eq(workspaces.organizationId, organizations.id))
        .where(eq(workspaces.id, campaign.workspaceId)).limit(1)
    : [null]
  const [pv] = campaign
    ? await db.select({ definition: policyVersions.definition, name: policies.name, version: policyVersions.version })
        .from(policyVersions).innerJoin(policies, eq(policyVersions.policyId, policies.id))
        .where(eq(policyVersions.id, campaign.policyVersionId)).limit(1)
    : [null]

  if (done || member.status !== 'INVITED') {
    const [org] = member.organizationId
      ? await db.select().from(organizations).where(eq(organizations.id, member.organizationId)).limit(1)
      : [null]
    return (
      <Shell>
        <div className="text-center">
          <CheckCircle2 size={40} className="mx-auto text-verify" />
          <h1 className="mt-4 text-[22px] font-bold">Verification complete</h1>
          <p className="mx-auto mt-2 max-w-[48ch] text-[14px] text-ink-dim">
            {requester?.name} has received the result. You now have a permanent BID profile
            you can reuse with any other buyer — at no cost, ever.
          </p>
          {org && (
            <>
              <p className="mt-5 font-mono text-[18px] font-bold text-verify">{org.bidId}</p>
              <Link href={`/p/${org.bidId}`} className="btn-verify mt-5">
                View your public profile <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </Shell>
    )
  }

  if (member.inviteExpiresAt.getTime() < Date.now()) {
    return <Shell><p className="text-[14px] text-ink-dim">This invitation has expired. Ask {requester?.name} to re-send it.</p></Shell>
  }

  const def = pv ? parsePolicy(pv.definition) : { checks: [], freshnessDays: 365, autoApprove: true }

  return (
    <Shell>
      <p className="label">Verification request</p>
      <h1 className="mt-1.5 text-[24px] font-bold leading-tight">
        {requester?.name} has asked to verify {member.legalName}
      </h1>
      <p className="mt-2 text-[13.5px] text-ink-dim">
        Requested under <strong>{pv?.name} v{pv?.version}</strong>. This takes a few minutes and
        costs you nothing.
      </p>

      {/* Stating what is and is not shared, before anything is submitted. */}
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-verify/30 bg-verify-soft p-4">
          <p className="label mb-2 text-verify">What {requester?.name} will see</p>
          <ul className="space-y-1.5 text-[12.5px] text-ink-dim">
            {['Whether each required check passed', 'Your verification level and validity dates', 'An explainable assessment', 'The audit trail of what was checked'].map((x) => (
              <li key={x} className="flex gap-2"><CheckBadge size={13} />{x}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="label mb-2">What they will not see</p>
          <ul className="space-y-1.5 text-[12.5px] text-ink-dim">
            {['Your underlying documents', 'Raw identifiers beyond what the check needs', 'Any data outside their stated purpose', 'Anything at all if you decline'].map((x) => (
              <li key={x} className="flex gap-2"><Lock size={13} className="mt-0.5 flex-none text-ink-faint" />{x}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card mt-5 p-4">
        <p className="label mb-2">Checks that will run</p>
        <div className="flex flex-wrap gap-1.5">
          {def.checks.map((c) => (
            <span key={c.code}
              className={`pill ${c.requirement === 'REQUIRED' ? 'bg-verify-soft text-verify' : 'bg-slate-100 text-slate-600'}`}>
              {CHECK_CATALOG[c.code]?.label ?? c.code}
            </span>
          ))}
        </div>
      </div>

      <InviteForm token={token} legalName={member.legalName} requester={requester?.name ?? 'The requester'} />
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="bg-navy py-4">
        <div className="mx-auto max-w-[720px] px-6"><Logo size={22} tone="light" /></div>
      </header>
      <main className="mx-auto max-w-[720px] px-6 py-10">{children}</main>
    </div>
  )
}
