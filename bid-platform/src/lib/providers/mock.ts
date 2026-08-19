/**
 * Mock verification provider adapters.
 *
 * NO THIRD-PARTY VERIFICATION API IS INTEGRATED. These adapters return
 * deterministic synthetic results so the orchestration, evidence, assessment
 * and audit layers can be exercised end to end.
 *
 * Real-world access to several of these channels is legally restricted, so the
 * product is deliberately built to degrade gracefully when a source is
 * unavailable rather than to assume access.
 */

export type SourceClass = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'INTERNAL'
export type Level = 'L1' | 'L2' | 'L3' | 'L4'

export interface CheckDefinition {
  code: string
  label: string
  sourceClass: SourceClass
  maxLevel: Level
  /** Illustrative only — no figure here reflects a real quotation. */
  costPaise: number
  dimension: 'identity' | 'financial' | 'compliance' | 'documentation' | 'screening'
}

export const CHECK_CATALOG: Record<string, CheckDefinition> = {
  CORPORATE_IDENTITY: { code: 'CORPORATE_IDENTITY', label: 'Corporate identity (MCA)', sourceClass: 'S1', maxLevel: 'L2', costPaise: 1500, dimension: 'identity' },
  PAN_VERIFICATION:   { code: 'PAN_VERIFICATION', label: 'PAN name-match', sourceClass: 'S1', maxLevel: 'L2', costPaise: 500, dimension: 'identity' },
  GST_REGISTRATION:   { code: 'GST_REGISTRATION', label: 'GST registration status', sourceClass: 'S1', maxLevel: 'L2', costPaise: 800, dimension: 'identity' },
  REGISTERED_ADDRESS: { code: 'REGISTERED_ADDRESS', label: 'Registered address', sourceClass: 'S1', maxLevel: 'L2', costPaise: 0, dimension: 'identity' },
  BANK_OWNERSHIP:     { code: 'BANK_OWNERSHIP', label: 'Bank account ownership', sourceClass: 'S3', maxLevel: 'L3', costPaise: 800, dimension: 'financial' },
  TURNOVER:           { code: 'TURNOVER', label: 'Turnover corroboration', sourceClass: 'S2', maxLevel: 'L2', costPaise: 2500, dimension: 'financial' },
  DIRECTORS:          { code: 'DIRECTORS', label: 'Directors and disqualification', sourceClass: 'S1', maxLevel: 'L2', costPaise: 1200, dimension: 'identity' },
  ISO_9001:           { code: 'ISO_9001', label: 'ISO 9001 certification', sourceClass: 'S4', maxLevel: 'L3', costPaise: 6000, dimension: 'compliance' },
  SANCTIONS:          { code: 'SANCTIONS', label: 'Sanctions / AML screening', sourceClass: 'S3', maxLevel: 'L2', costPaise: 600, dimension: 'screening' },
  LITIGATION:         { code: 'LITIGATION', label: 'Litigation screening', sourceClass: 'S3', maxLevel: 'L2', costPaise: 4500, dimension: 'screening' },
  DOCUMENT_AUTH:      { code: 'DOCUMENT_AUTH', label: 'Document authenticity', sourceClass: 'INTERNAL', maxLevel: 'L2', costPaise: 200, dimension: 'documentation' },
}

export interface ProviderResult {
  providerId: string
  outcome: 'VERIFIED' | 'EXCEPTION' | 'INSUFFICIENT_EVIDENCE'
  achievedLevel: Level | null
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  sourceClass: SourceClass
  detail: string
  attributes: Record<string, unknown>
  costPaise: number
  latencyMs: number
  failedOver: boolean
}

/** Deterministic pseudo-random in [0,1) so the same input always behaves the same. */
function seeded(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}

const PROVIDERS = ['Provider A', 'Provider B', 'Provider C']

export interface SubjectFacts {
  legalName: string
  gstin?: string | null
  pan?: string | null
  cin?: string | null
  bankAccount?: string | null
  /** Set on the demo seed to exercise the exception path. */
  forceException?: string[]
}

export async function runCheck(checkCode: string, subject: SubjectFacts): Promise<ProviderResult> {
  const def = CHECK_CATALOG[checkCode]
  if (!def) throw new Error(`Unknown check: ${checkCode}`)

  const roll = seeded(`${checkCode}:${subject.legalName}:${subject.gstin ?? ''}`)
  const latencyMs = 120 + Math.floor(roll * 900)

  // The router prefers the cheapest provider that can reach the required level;
  // a simulated outage on the primary triggers failover to the next.
  const failedOver = roll > 0.88
  const providerId = PROVIDERS[failedOver ? 1 : 0]

  // Missing input is INSUFFICIENT_EVIDENCE — never an adverse finding.
  const missing =
    (checkCode === 'GST_REGISTRATION' && !subject.gstin) ||
    (checkCode === 'PAN_VERIFICATION' && !subject.pan) ||
    (checkCode === 'CORPORATE_IDENTITY' && !subject.cin) ||
    (checkCode === 'BANK_OWNERSHIP' && !subject.bankAccount)

  if (missing) {
    return {
      providerId, outcome: 'INSUFFICIENT_EVIDENCE', achievedLevel: null, confidence: 'LOW',
      sourceClass: def.sourceClass,
      detail: 'Required identifier was not supplied. Recorded as insufficient evidence, not as an adverse finding.',
      attributes: {}, costPaise: 0, latencyMs, failedOver: false,
    }
  }

  if (subject.forceException?.includes(checkCode)) {
    return {
      providerId, outcome: 'EXCEPTION', achievedLevel: 'L2', confidence: 'HIGH',
      sourceClass: def.sourceClass,
      detail: exceptionDetail(checkCode),
      attributes: { status: 'CANCELLED' },
      costPaise: def.costPaise, latencyMs, failedOver,
    }
  }

  return {
    providerId, outcome: 'VERIFIED', achievedLevel: def.maxLevel,
    confidence: roll > 0.15 ? 'HIGH' : 'MEDIUM',
    sourceClass: def.sourceClass,
    detail: verifiedDetail(checkCode, subject),
    attributes: verifiedAttributes(checkCode, subject),
    costPaise: def.costPaise, latencyMs, failedOver,
  }
}

function exceptionDetail(code: string): string {
  switch (code) {
    case 'GST_REGISTRATION': return 'GST registration status returned CANCELLED. Required check failed.'
    case 'SANCTIONS': return 'Potential screening match requires human disposition before any conclusion is drawn.'
    default: return 'Required check did not pass. Referred for review.'
  }
}

function verifiedDetail(code: string, s: SubjectFacts): string {
  switch (code) {
    case 'GST_REGISTRATION': return `GST registration ACTIVE. Legal name matched to "${s.legalName}".`
    case 'PAN_VERIFICATION': return 'PAN confirmed and name-to-PAN correspondence matched.'
    case 'CORPORATE_IDENTITY': return 'Corporate identity confirmed against the registry. Status ACTIVE.'
    case 'BANK_OWNERSHIP': return 'Account ownership confirmed by credit-into-account. Name match 0.97.'
    case 'SANCTIONS': return 'No confirmed sanctions, PEP or watchlist match within the searched scope.'
    case 'LITIGATION': return 'No adverse match across searched jurisdictions. Coverage is not exhaustive.'
    case 'ISO_9001': return 'Certificate confirmed with the issuing certification body.'
    case 'DIRECTORS': return 'Directors confirmed. No disqualifications recorded.'
    case 'TURNOVER': return 'Declared turnover band corroborated against consented financial signals.'
    case 'DOCUMENT_AUTH': return 'No tampering or template anomalies detected in submitted documents.'
    default: return 'Verified against source.'
  }
}

function verifiedAttributes(code: string, s: SubjectFacts): Record<string, unknown> {
  switch (code) {
    case 'GST_REGISTRATION': return { gstin: s.gstin, status: 'ACTIVE', legalName: s.legalName }
    case 'PAN_VERIFICATION': return { pan: s.pan, nameMatch: 0.97 }
    case 'CORPORATE_IDENTITY': return { cin: s.cin, status: 'ACTIVE' }
    case 'BANK_OWNERSHIP': return { method: 'credit_into_account', nameMatch: 0.97 }
    default: return {}
  }
}
