'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import {
  db, organizations, workspaces, users, policies, policyVersions,
  campaigns, campaignMembers, verificationRequests, verificationChecks,
  relationships, consents, auditLog,
} from '@/db'
import { hashPassword, verifyPassword, createSession, destroySession, requirePrincipal } from './auth'
import { mintBidId, inviteToken } from './bidid'
import { parsePolicy } from './verification'
import { executeVerification } from './verification'
import { createHash } from 'node:crypto'

const DEFAULT_POLICY = {
  checks: [
    { code: 'CORPORATE_IDENTITY', requirement: 'REQUIRED', minLevel: 'L2' },
    { code: 'PAN_VERIFICATION', requirement: 'REQUIRED', minLevel: 'L2' },
    { code: 'GST_REGISTRATION', requirement: 'REQUIRED', minLevel: 'L2' },
    { code: 'REGISTERED_ADDRESS', requirement: 'REQUIRED', minLevel: 'L2' },
    { code: 'DOCUMENT_AUTH', requirement: 'REQUIRED', minLevel: 'L2' },
    { code: 'BANK_OWNERSHIP', requirement: 'REQUIRED', minLevel: 'L3' },
    { code: 'DIRECTORS', requirement: 'REQUIRED', minLevel: 'L2' },
    { code: 'SANCTIONS', requirement: 'REQUIRED', minLevel: 'L2' },
    { code: 'ISO_9001', requirement: 'OPTIONAL', minLevel: 'L3' },
    { code: 'LITIGATION', requirement: 'OPTIONAL', minLevel: 'L2' },
  ],
  freshnessDays: 365,
  autoApprove: true,
}

async function audit(workspaceId: string | null, actor: string, action: string, resource: string, detail?: unknown) {
  await db.insert(auditLog).values({
    id: randomUUID(), workspaceId, actor, action, resource,
    detail: detail ? JSON.stringify(detail) : null, at: new Date(),
  })
}

/* ── Auth ─────────────────────────────────────────────────────────────── */

export async function signUp(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const orgName = String(formData.get('orgName') ?? '').trim()

  if (!name || !email || !password || !orgName) return { error: 'All fields are required.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing.length) return { error: 'An account with that email already exists.' }

  const now = new Date()
  const orgId = randomUUID()
  const wsId = randomUUID()
  const userId = randomUUID()

  await db.insert(organizations).values({
    id: orgId, bidId: mintBidId('BUS'), legalName: orgName,
    lifecycleStage: 'MEMBER', createdAt: now,
  })
  await db.insert(workspaces).values({ id: wsId, organizationId: orgId, name: orgName, createdAt: now })
  await db.insert(users).values({
    id: userId, email, name, passwordHash: hashPassword(password),
    workspaceId: wsId, role: 'OWNER', createdAt: now,
  })

  // A workspace with no policy is a dead end, so seed the starting template.
  const policyId = randomUUID()
  await db.insert(policies).values({
    id: policyId, workspaceId: wsId, name: 'Standard Supplier', appliesTo: 'BUSINESS', createdAt: now,
  })
  await db.insert(policyVersions).values({
    id: randomUUID(), policyId, version: '1.0', status: 'ACTIVE',
    definition: JSON.stringify(DEFAULT_POLICY), createdAt: now,
  })

  await audit(wsId, email, 'WORKSPACE_CREATED', orgName)
  await createSession(userId)
  redirect('/dashboard')
}

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: 'Email or password is incorrect.' }
  }
  await createSession(user.id)
  redirect('/dashboard')
}

export async function signOut() {
  await destroySession()
  redirect('/')
}

/* ── Policies ─────────────────────────────────────────────────────────── */

export async function createPolicy(formData: FormData) {
  const p = await requirePrincipal()
  const name = String(formData.get('name') ?? '').trim()
  if (!name) return { error: 'Policy name is required.' }

  const selected = formData.getAll('checks').map(String)
  const required = new Set(formData.getAll('required').map(String))
  if (!selected.length) return { error: 'Select at least one check.' }

  const definition = {
    checks: selected.map((code) => ({
      code,
      requirement: required.has(code) ? 'REQUIRED' : 'OPTIONAL',
      minLevel: code === 'BANK_OWNERSHIP' ? 'L3' : 'L2',
    })),
    freshnessDays: Number(formData.get('freshnessDays') ?? 365),
    autoApprove: true,
  }

  const now = new Date()
  const policyId = randomUUID()
  await db.insert(policies).values({
    id: policyId, workspaceId: p.workspaceId, name, appliesTo: 'BUSINESS', createdAt: now,
  })
  await db.insert(policyVersions).values({
    id: randomUUID(), policyId, version: '1.0', status: 'ACTIVE',
    definition: JSON.stringify(definition), createdAt: now,
  })
  await audit(p.workspaceId, p.email, 'POLICY_CREATED', name, { checks: definition.checks.length })
  revalidatePath('/dashboard/policies')
  redirect('/dashboard/policies')
}

/* ── Campaigns and invitations ────────────────────────────────────────── */

export async function createCampaign(formData: FormData) {
  const p = await requirePrincipal()
  const name = String(formData.get('name') ?? '').trim()
  const policyVersionId = String(formData.get('policyVersionId') ?? '')
  const raw = String(formData.get('vendors') ?? '').trim()
  if (!name || !policyVersionId) return { error: 'Campaign name and policy are required.' }

  // One vendor per line: "Legal Name, email@example.com"
  const vendors = raw.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
    const [legalName, email] = line.split(',').map((s) => s?.trim() ?? '')
    return { legalName, email: email || '' }
  }).filter((v) => v.legalName)

  if (!vendors.length) return { error: 'Add at least one vendor.' }

  const now = new Date()
  const campaignId = randomUUID()
  await db.insert(campaigns).values({
    id: campaignId, workspaceId: p.workspaceId, name, policyVersionId, status: 'ACTIVE', createdAt: now,
  })

  for (const v of vendors) {
    await db.insert(campaignMembers).values({
      id: randomUUID(), campaignId, legalName: v.legalName, email: v.email,
      inviteToken: inviteToken(),
      inviteExpiresAt: new Date(now.getTime() + 14 * 864e5),
      status: 'INVITED', createdAt: now,
    })
  }

  await audit(p.workspaceId, p.email, 'CAMPAIGN_CREATED', name, { invited: vendors.length })
  revalidatePath('/dashboard/campaigns')
  redirect(`/dashboard/campaigns/${campaignId}`)
}

/**
 * The invitee flow. No account required — a scoped, expiring token is the
 * whole credential, because requiring a signup here would stall the campaign
 * and the network never forms.
 */
export async function acceptInvitation(formData: FormData) {
  const token = String(formData.get('token') ?? '')
  const [member] = await db.select().from(campaignMembers).where(eq(campaignMembers.inviteToken, token)).limit(1)
  if (!member) return { error: 'This invitation link is not valid.' }
  if (member.inviteExpiresAt.getTime() < Date.now()) return { error: 'This invitation has expired.' }
  if (member.status !== 'INVITED') return { error: 'This invitation has already been used.' }

  const consented = formData.get('consent') === 'on'
  if (!consented) return { error: 'Verification cannot begin without your consent.' }

  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, member.campaignId)).limit(1)
  if (!campaign) return { error: 'Campaign not found.' }
  const [pv] = await db.select().from(policyVersions).where(eq(policyVersions.id, campaign.policyVersionId)).limit(1)
  if (!pv) return { error: 'Policy version not found.' }

  const now = new Date()
  const orgId = randomUUID()

  // The invitee becomes a free BID Member. Not a customer — that is a separate,
  // purchased state they reach only if they choose to verify others.
  await db.insert(organizations).values({
    id: orgId,
    bidId: mintBidId('BUS'),
    legalName: member.legalName,
    cin: String(formData.get('cin') ?? '').trim() || null,
    gstin: String(formData.get('gstin') ?? '').trim() || null,
    pan: String(formData.get('pan') ?? '').trim() || null,
    website: String(formData.get('website') ?? '').trim() || null,
    description: String(formData.get('description') ?? '').trim() || null,
    city: String(formData.get('city') ?? '').trim() || null,
    state: String(formData.get('state') ?? '').trim() || null,
    logoText: member.legalName.slice(0, 3).toLowerCase(),
    lifecycleStage: 'MEMBER',
    createdAt: now,
  })

  const purpose = `Verification for ${campaign.name}`

  // Consent is specific, purpose-bound, time-boxed and revocable.
  const scope = ['identity', 'registration_status', 'verification_outcome']
  const artifact = JSON.stringify({ orgId, workspaceId: campaign.workspaceId, scope, purpose, at: now.toISOString() })
  await db.insert(consents).values({
    id: randomUUID(), bidRef: mintBidId('CON'),
    grantorOrgId: orgId, granteeWorkspaceId: campaign.workspaceId,
    scope: JSON.stringify(scope), purpose,
    artifactHash: `sha256:${createHash('sha256').update(artifact).digest('hex')}`,
    grantedAt: now, expiresAt: new Date(now.getTime() + 365 * 864e5),
  })

  await db.insert(relationships).values({
    id: randomUUID(), workspaceId: campaign.workspaceId,
    fromOrgId: campaign.workspaceId, toOrgId: orgId,
    type: 'BUYS_FROM', purpose, policyVersionId: pv.id,
    status: 'PROSPECTIVE', createdAt: now,
  }).catch(() => { /* relationship is advisory in the MVP */ })

  const requestId = randomUUID()
  await db.insert(verificationRequests).values({
    id: requestId, bidRef: mintBidId('REQ'),
    workspaceId: campaign.workspaceId, subjectOrgId: orgId,
    policyVersionId: pv.id, purpose, status: 'IN_PROGRESS', createdAt: now,
  })

  const def = parsePolicy(pv.definition)
  for (const c of def.checks) {
    await db.insert(verificationChecks).values({
      id: randomUUID(), requestId, checkCode: c.code,
      requirement: c.requirement, requiredLevel: c.minLevel, outcome: 'PENDING',
    })
  }

  await db.update(campaignMembers).set({
    organizationId: orgId, verificationRequestId: requestId, status: 'IN_PROGRESS',
  }).where(eq(campaignMembers.id, member.id))

  await executeVerification(requestId, member.email || member.legalName)

  const [done] = await db.select().from(verificationRequests).where(eq(verificationRequests.id, requestId)).limit(1)
  await db.update(campaignMembers).set({
    status: done?.outcome === 'VERIFIED' ? 'COMPLETED' : 'EXCEPTION',
  }).where(eq(campaignMembers.id, member.id))

  revalidatePath(`/dashboard/campaigns/${campaign.id}`)
  redirect(`/invite/${token}?done=1`)
}

/* ── Requester decision ───────────────────────────────────────────────── */

export async function decideVerification(formData: FormData) {
  const p = await requirePrincipal()
  const requestId = String(formData.get('requestId') ?? '')
  const decision = String(formData.get('decision') ?? '')
  const reason = String(formData.get('reason') ?? '').trim()

  const [req] = await db.select().from(verificationRequests)
    .where(and(eq(verificationRequests.id, requestId), eq(verificationRequests.workspaceId, p.workspaceId)))
    .limit(1)
  if (!req) return { error: 'Not found in this workspace.' }

  await db.update(verificationRequests).set({
    status: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
    decidedAt: new Date(), decidedBy: p.email,
    // The reason is recorded because the decision is the customer's, not BID's.
    decisionReason: reason || null,
  }).where(eq(verificationRequests.id, requestId))

  await audit(p.workspaceId, p.email, `VERIFICATION_${decision}D`, req.bidRef, { reason })
  revalidatePath('/dashboard')
  return { ok: true }
}
