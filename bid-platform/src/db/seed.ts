/**
 * Demo seed. Fictional organizations and people only.
 *
 * Creates ABC Technologies as a workspace with a policy and a campaign whose
 * invitations are unclaimed, so the invite flow can be walked end to end.
 */
import { randomUUID } from 'node:crypto'
import { db, organizations, workspaces, users, policies, policyVersions, campaigns, campaignMembers } from './index'
import { hashPassword } from '../lib/auth'
import { mintBidId, inviteToken } from '../lib/bidid'

const POLICY = {
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

async function main() {
  const now = new Date()
  const orgId = randomUUID(), wsId = randomUUID(), policyId = randomUUID(), pvId = randomUUID()

  await db.insert(organizations).values({
    id: orgId, bidId: mintBidId('BUS'), legalName: 'ABC Technologies Pvt Ltd',
    cin: 'U72900KA2009PTC050123', gstin: '29AABCA1234B1Z5', pan: 'AABCA1234B',
    website: 'abctechnologies.example', city: 'Bengaluru', state: 'Karnataka',
    incorporatedOn: '2009-06-11', logoText: 'abc',
    description: 'Enterprise IT services and systems integration.',
    lifecycleStage: 'MEMBER', createdAt: now,
  })
  await db.insert(workspaces).values({
    id: wsId, organizationId: orgId, name: 'ABC Technologies', plan: 'TRIAL', createdAt: now,
  })
  await db.insert(users).values({
    id: randomUUID(), email: 'priya@abc.example', name: 'Priya Nair',
    passwordHash: hashPassword('demo1234'), workspaceId: wsId, role: 'OWNER', createdAt: now,
  })
  await db.insert(policies).values({
    id: policyId, workspaceId: wsId, name: 'Critical Supplier', appliesTo: 'BUSINESS', createdAt: now,
  })
  await db.insert(policyVersions).values({
    id: pvId, policyId, version: '2.1', status: 'ACTIVE',
    definition: JSON.stringify(POLICY), createdAt: now,
  })

  const campaignId = randomUUID()
  await db.insert(campaigns).values({
    id: campaignId, workspaceId: wsId, name: 'Q3 Supplier Onboarding',
    policyVersionId: pvId, status: 'ACTIVE', createdAt: now,
  })

  const vendors = [
    ['XYZ HR Consultants', 'ops@xyz.example'],
    ['LMN Components', 'admin@lmn.example'],
    // Seeded to fail GST so the exception and review path is real, not theoretical.
    ['Deccan Fabricators', 'hello@deccan.example'],
  ]
  const tokens: string[] = []
  for (const [legalName, email] of vendors) {
    const t = inviteToken()
    tokens.push(t)
    await db.insert(campaignMembers).values({
      id: randomUUID(), campaignId, legalName, email, inviteToken: t,
      inviteExpiresAt: new Date(now.getTime() + 14 * 864e5), status: 'INVITED', createdAt: now,
    })
  }

  console.log('\n  Seeded.\n')
  console.log('  Sign in:  priya@abc.example  /  demo1234\n')
  console.log('  Invitation links (normally emailed):')
  vendors.forEach(([name], i) => console.log(`    ${name.padEnd(22)} /invite/${tokens[i]}`))
  console.log()
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
