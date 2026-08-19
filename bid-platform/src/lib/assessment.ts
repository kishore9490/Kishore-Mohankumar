/**
 * Explainable assessment.
 *
 * Deterministic rubric, no machine-learned weights, no opaque score. Every band
 * traces to its inputs and is reproducible from the same evidence.
 *
 * The most important rule in this file: INSUFFICIENT_EVIDENCE is a distinct
 * state from HIGH risk. A small proprietorship with no filed financials is
 * unmeasured, not dangerous. Collapsing the two would systematically penalise
 * exactly the MSME segment the network depends on.
 */

import { CHECK_CATALOG } from './providers/mock'

export const RUBRIC_VERSION = '1.0'

export type Band = 'LOW' | 'MEDIUM' | 'HIGH' | 'INSUFFICIENT_EVIDENCE' | 'BLOCKED'

export interface CheckOutcome {
  checkCode: string
  requirement: 'REQUIRED' | 'OPTIONAL'
  outcome: 'VERIFIED' | 'EXCEPTION' | 'INSUFFICIENT_EVIDENCE' | 'PENDING'
  detail?: string | null
}

export interface Factor {
  dimension: string
  grade: string
  why: string
}

export interface AssessmentResult {
  band: Band
  factors: Factor[]
  rubricVersion: string
}

const DIMENSION_LABEL: Record<string, string> = {
  identity: 'Identity',
  financial: 'Financial',
  compliance: 'Compliance',
  documentation: 'Documentation',
  screening: 'Risk Screening',
}

export function assess(checks: CheckOutcome[]): AssessmentResult {
  const byDimension = new Map<string, CheckOutcome[]>()
  for (const c of checks) {
    const dim = CHECK_CATALOG[c.checkCode]?.dimension ?? 'identity'
    const list = byDimension.get(dim) ?? []
    list.push(c)
    byDimension.set(dim, list)
  }

  const factors: Factor[] = []
  let anyRequiredException = false
  let anyRequiredInsufficient = false
  let anyOptionalGap = false

  for (const [dim, list] of byDimension) {
    const label = DIMENSION_LABEL[dim] ?? dim
    const verified = list.filter((c) => c.outcome === 'VERIFIED')
    const exceptions = list.filter((c) => c.outcome === 'EXCEPTION')
    const insufficient = list.filter((c) => c.outcome === 'INSUFFICIENT_EVIDENCE')

    const requiredExceptions = exceptions.filter((c) => c.requirement === 'REQUIRED')
    const requiredInsufficient = insufficient.filter((c) => c.requirement === 'REQUIRED')

    if (requiredExceptions.length) anyRequiredException = true
    if (requiredInsufficient.length) anyRequiredInsufficient = true
    if (insufficient.some((c) => c.requirement === 'OPTIONAL')) anyOptionalGap = true

    let grade: string
    let why: string

    if (requiredExceptions.length) {
      grade = dim === 'screening' ? 'REQUIRES REVIEW' : 'ADVERSE'
      why = requiredExceptions.map((c) => c.detail ?? `${label} check did not pass.`).join(' ')
    } else if (requiredInsufficient.length) {
      grade = 'INSUFFICIENT EVIDENCE'
      why = `${requiredInsufficient.length} required check(s) could not be completed because the underlying data was not available. This is not an adverse finding.`
    } else if (verified.length && insufficient.length === 0) {
      grade = dim === 'screening' ? 'CLEAR' : dim === 'compliance' ? 'STRONG' : dim === 'documentation' ? 'COMPLETE' : 'VERIFIED'
      why = `${verified.length} of ${list.length} check(s) verified against source. ${verified[0]?.detail ?? ''}`.trim()
    } else if (verified.length) {
      grade = 'PARTIALLY VERIFIED'
      why = `${verified.length} of ${list.length} check(s) verified; ${insufficient.length} could not be completed.`
    } else {
      grade = 'INSUFFICIENT EVIDENCE'
      why = 'No check in this dimension produced a result.'
    }

    factors.push({ dimension: label, grade, why })
  }

  // Hard stop: a confirmed adverse screening result blocks regardless of the rest.
  const blocked = checks.some(
    (c) => c.requirement === 'REQUIRED' && c.outcome === 'EXCEPTION' &&
      CHECK_CATALOG[c.checkCode]?.dimension === 'screening',
  )

  let band: Band
  if (blocked) band = 'BLOCKED'
  else if (anyRequiredException) band = 'HIGH'
  else if (anyRequiredInsufficient) band = 'INSUFFICIENT_EVIDENCE'
  else if (anyOptionalGap) band = 'MEDIUM'
  else band = 'LOW'

  factors.push({
    dimension: 'Verification Freshness',
    grade: 'CURRENT',
    why: 'All contributing checks were executed as part of this request.',
  })

  return { band, factors, rubricVersion: RUBRIC_VERSION }
}

export function bandLabel(band: Band): string {
  return band === 'INSUFFICIENT_EVIDENCE' ? 'INSUFFICIENT EVIDENCE'
    : band === 'LOW' ? 'LOW RISK'
    : band === 'MEDIUM' ? 'MEDIUM RISK'
    : band === 'HIGH' ? 'HIGH RISK'
    : 'BLOCKED'
}
