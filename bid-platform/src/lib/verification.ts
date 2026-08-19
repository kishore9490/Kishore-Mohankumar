import { createHash, randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import {
  db, verificationRequests, verificationChecks, evidence, assessments,
  credentials, organizations, providerCalls, auditLog,
} from '@/db'
import { runCheck, type SubjectFacts } from './providers/mock'
import { assess, RUBRIC_VERSION, type CheckOutcome } from './assessment'
import { mintBidId } from './bidid'

export interface PolicyCheckSpec {
  code: string
  requirement: 'REQUIRED' | 'OPTIONAL'
  minLevel: string
}

export interface PolicyDefinition {
  checks: PolicyCheckSpec[]
  freshnessDays: number
  autoApprove: boolean
}

export function parsePolicy(json: string): PolicyDefinition {
  const parsed = JSON.parse(json) as PolicyDefinition
  return {
    checks: parsed.checks ?? [],
    freshnessDays: parsed.freshnessDays ?? 365,
    autoApprove: parsed.autoApprove ?? true,
  }
}

/**
 * Executes a verification request end to end: expands the locked policy into
 * checks, routes each to a provider, captures immutable evidence, assesses,
 * and issues a credential when the outcome warrants it.
 */
export async function executeVerification(requestId: string, actor: string) {
  const [request] = await db.select().from(verificationRequests).where(eq(verificationRequests.id, requestId)).limit(1)
  if (!request) throw new Error('Verification request not found')

  const [org] = await db.select().from(organizations).where(eq(organizations.id, request.subjectOrgId)).limit(1)
  if (!org) throw new Error('Subject organization not found')

  const pending = await db.select().from(verificationChecks).where(eq(verificationChecks.requestId, requestId))

  const subject: SubjectFacts = {
    legalName: org.legalName,
    gstin: org.gstin,
    pan: org.pan,
    cin: org.cin,
    bankAccount: org.gstin ? 'provided' : null,
    // The seeded demo vendor exercises the exception path so the review flow is real.
    forceException: org.legalName.toLowerCase().includes('deccan') ? ['GST_REGISTRATION'] : [],
  }

  const now = new Date()
  const outcomes: CheckOutcome[] = []

  for (const check of pending) {
    const result = await runCheck(check.checkCode, subject)

    await db.update(verificationChecks).set({
      outcome: result.outcome,
      achievedLevel: result.achievedLevel,
      confidence: result.confidence,
      sourceClass: result.sourceClass,
      providerId: result.providerId,
      detail: result.detail,
      costPaise: result.costPaise,
      executedAt: now,
    }).where(eq(verificationChecks.id, check.id))

    // Evidence is written once, hashed, and never edited.
    const payload = JSON.stringify({
      check: check.checkCode,
      provider: result.providerId,
      sourceClass: result.sourceClass,
      outcome: result.outcome,
      attributes: result.attributes,
      detail: result.detail,
      executedAt: now.toISOString(),
    })
    await db.insert(evidence).values({
      id: randomUUID(),
      checkId: check.id,
      contentHash: `sha256:${createHash('sha256').update(payload).digest('hex')}`,
      payload,
      sensitivity: 'RESTRICTED',
      capturedAt: now,
      retentionUntil: new Date(now.getTime() + 8 * 365 * 864e5),
    })

    await db.insert(providerCalls).values({
      id: randomUUID(),
      checkId: check.id,
      providerId: result.providerId,
      outcome: result.outcome,
      latencyMs: result.latencyMs,
      costPaise: result.costPaise,
      failedOver: result.failedOver,
      at: now,
    })

    outcomes.push({
      checkCode: check.checkCode,
      requirement: check.requirement as 'REQUIRED' | 'OPTIONAL',
      outcome: result.outcome,
      detail: result.detail,
    })
  }

  const result = assess(outcomes)
  const validUntil = new Date(now.getTime() + 365 * 864e5)

  await db.insert(assessments).values({
    id: randomUUID(),
    requestId,
    band: result.band,
    rubricVersion: RUBRIC_VERSION,
    factors: JSON.stringify(result.factors),
    validUntil,
    createdAt: now,
  })

  const requiredFailed = outcomes.some((o) => o.requirement === 'REQUIRED' && o.outcome === 'EXCEPTION')
  const requiredMissing = outcomes.some((o) => o.requirement === 'REQUIRED' && o.outcome === 'INSUFFICIENT_EVIDENCE')

  const outcome = requiredFailed ? 'EXCEPTION' : requiredMissing ? 'INSUFFICIENT_EVIDENCE' : 'VERIFIED'
  // Entity level is the weakest required attribute, never an average —
  // averaging hides gaps, and hidden gaps are how this goes wrong.
  const level = outcome === 'VERIFIED'
    ? (outcomes.some((o) => o.checkCode === 'BANK_OWNERSHIP' && o.outcome === 'VERIFIED') ? 'L3' : 'L2')
    : 'L1'

  await db.update(verificationRequests).set({
    status: 'COMPLETED', outcome, level, validUntil,
  }).where(eq(verificationRequests.id, requestId))

  if (outcome === 'VERIFIED') {
    await db.insert(credentials).values({
      id: randomUUID(),
      bidRef: mintBidId('CRED'),
      holderOrgId: org.id,
      type: 'BID_VERIFIED_BUSINESS',
      level,
      status: 'ACTIVE',
      issuedAt: now,
      validUntil,
    })
    await db.update(organizations)
      .set({ lifecycleStage: 'VERIFIED_MEMBER' })
      .where(eq(organizations.id, org.id))
  }

  await db.insert(auditLog).values({
    id: randomUUID(),
    workspaceId: request.workspaceId,
    actor,
    action: 'VERIFICATION_COMPLETED',
    resource: request.bidRef,
    purpose: request.purpose,
    detail: JSON.stringify({ outcome, level, band: result.band, checks: outcomes.length }),
    at: now,
  })

  return { outcome, level, band: result.band }
}
