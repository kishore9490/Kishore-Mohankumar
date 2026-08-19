import { pgTable, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core'

/**
 * BID Trust data model (PostgreSQL).
 *
 * Two rules govern this schema and are worth stating up front:
 *
 *  1. ORGANIZATION IS THE PRIMARY ENTITY. There is no "vendor" table and no
 *     "customer" table. Commercial roles are relationships. The same company
 *     can be a verified subject for one workspace and a paying requester in
 *     its own, from one record.
 *
 *  2. ORGANIZATION IDENTITY  !=  CUSTOMER TENANT. `organizations` is global and
 *     deduplicated. `workspaces` is the tenant. Everything tenant-private
 *     carries workspaceId and is always filtered by it.
 */

const id = () => text('id').primaryKey()
const ts = (n: string) => timestamp(n, { withTimezone: true, mode: 'date' })

/* ── Identity ─────────────────────────────────────────────────────────── */

export const organizations = pgTable(
  'organizations',
  {
    id: id(),
    bidId: text('bid_id').notNull().unique(),
    legalName: text('legal_name').notNull(),
    entityType: text('entity_type').notNull().default('PRIVATE_LIMITED'),
    status: text('status').notNull().default('ACTIVE'),
    // Government identifiers are attributes, never identity.
    cin: text('cin'),
    gstin: text('gstin'),
    pan: text('pan'),
    // Company-provided — never presented as verified.
    website: text('website'),
    description: text('description'),
    city: text('city'),
    state: text('state'),
    incorporatedOn: text('incorporated_on'),
    employeeBand: text('employee_band'),
    logoText: text('logo_text'),
    // UNKNOWN → INVITED → REGISTERED → MEMBER → VERIFIED_MEMBER → …
    lifecycleStage: text('lifecycle_stage').notNull().default('REGISTERED'),
    profilePublic: boolean('profile_public').notNull().default(true),
    createdAt: ts('created_at').notNull(),
  },
  (t) => [index('org_gstin_idx').on(t.gstin)],
)

export const workspaces = pgTable('workspaces', {
  id: id(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  plan: text('plan').notNull().default('TRIAL'),
  createdAt: ts('created_at').notNull(),
})

export const users = pgTable('users', {
  id: id(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  role: text('role').notNull().default('OWNER'),
  createdAt: ts('created_at').notNull(),
})

export const sessions = pgTable('sessions', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id),
  expiresAt: ts('expires_at').notNull(),
  createdAt: ts('created_at').notNull(),
})

/* ── Relationships — tenant-private ───────────────────────────────────── */

export const relationships = pgTable(
  'relationships',
  {
    id: id(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    fromOrgId: text('from_org_id').notNull(),
    toOrgId: text('to_org_id').notNull().references(() => organizations.id),
    type: text('type').notNull(),
    // Purpose is what makes collection lawful and proportionate. Required.
    purpose: text('purpose').notNull(),
    policyVersionId: text('policy_version_id'),
    status: text('status').notNull().default('PROSPECTIVE'),
    criticality: text('criticality').notNull().default('STANDARD'),
    createdAt: ts('created_at').notNull(),
  },
  (t) => [index('rel_ws_idx').on(t.workspaceId)],
)

/* ── Policy — versions are immutable once active ──────────────────────── */

export const policies = pgTable('policies', {
  id: id(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  name: text('name').notNull(),
  appliesTo: text('applies_to').notNull().default('BUSINESS'),
  createdAt: ts('created_at').notNull(),
})

export const policyVersions = pgTable('policy_versions', {
  id: id(),
  policyId: text('policy_id').notNull().references(() => policies.id),
  version: text('version').notNull(),
  status: text('status').notNull().default('ACTIVE'),
  /** JSON: { checks: [{code, requirement, minLevel}], freshnessDays, autoApprove } */
  definition: text('definition').notNull(),
  createdAt: ts('created_at').notNull(),
})

/* ── Campaigns and invitations ────────────────────────────────────────── */

export const campaigns = pgTable('campaigns', {
  id: id(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  name: text('name').notNull(),
  policyVersionId: text('policy_version_id').notNull().references(() => policyVersions.id),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: ts('created_at').notNull(),
})

export const campaignMembers = pgTable(
  'campaign_members',
  {
    id: id(),
    campaignId: text('campaign_id').notNull().references(() => campaigns.id),
    legalName: text('legal_name').notNull(),
    email: text('email').notNull(),
    /** Scoped, expiring invitation token. The invitee never needs an account. */
    inviteToken: text('invite_token').notNull().unique(),
    inviteExpiresAt: ts('invite_expires_at').notNull(),
    organizationId: text('organization_id').references(() => organizations.id),
    verificationRequestId: text('verification_request_id'),
    status: text('status').notNull().default('INVITED'),
    createdAt: ts('created_at').notNull(),
  },
  (t) => [index('cm_campaign_idx').on(t.campaignId)],
)

/* ── Verification ─────────────────────────────────────────────────────── */

export const verificationRequests = pgTable('verification_requests', {
  id: id(),
  bidRef: text('bid_ref').notNull().unique(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  subjectOrgId: text('subject_org_id').notNull().references(() => organizations.id),
  policyVersionId: text('policy_version_id').notNull().references(() => policyVersions.id),
  purpose: text('purpose').notNull(),
  status: text('status').notNull().default('AWAITING_CONSENT'),
  outcome: text('outcome'),
  level: text('level'),
  decidedAt: ts('decided_at'),
  decidedBy: text('decided_by'),
  decisionReason: text('decision_reason'),
  validUntil: ts('valid_until'),
  createdAt: ts('created_at').notNull(),
})

export const verificationChecks = pgTable(
  'verification_checks',
  {
    id: id(),
    requestId: text('request_id').notNull().references(() => verificationRequests.id),
    checkCode: text('check_code').notNull(),
    requirement: text('requirement').notNull(),
    requiredLevel: text('required_level').notNull(),
    providerId: text('provider_id'),
    /** VERIFIED | EXCEPTION | INSUFFICIENT_EVIDENCE | PENDING */
    outcome: text('outcome').notNull().default('PENDING'),
    achievedLevel: text('achieved_level'),
    confidence: text('confidence'),
    sourceClass: text('source_class'),
    detail: text('detail'),
    reused: boolean('reused').notNull().default(false),
    costPaise: integer('cost_paise').notNull().default(0),
    executedAt: ts('executed_at'),
  },
  (t) => [index('vc_req_idx').on(t.requestId)],
)

/** Immutable, content-addressed. Never edited — only appended. */
export const evidence = pgTable('evidence', {
  id: id(),
  checkId: text('check_id').notNull().references(() => verificationChecks.id),
  contentHash: text('content_hash').notNull(),
  payload: text('payload').notNull(),
  sensitivity: text('sensitivity').notNull().default('RESTRICTED'),
  capturedAt: ts('captured_at').notNull(),
  retentionUntil: ts('retention_until').notNull(),
})

export const assessments = pgTable('assessments', {
  id: id(),
  requestId: text('request_id').notNull().references(() => verificationRequests.id),
  /** LOW | MEDIUM | HIGH | INSUFFICIENT_EVIDENCE | BLOCKED — never a bare score. */
  band: text('band').notNull(),
  rubricVersion: text('rubric_version').notNull(),
  /** JSON: [{ dimension, grade, why }] — every band traces to its inputs. */
  factors: text('factors').notNull(),
  validUntil: ts('valid_until'),
  createdAt: ts('created_at').notNull(),
})

export const credentials = pgTable('credentials', {
  id: id(),
  bidRef: text('bid_ref').notNull().unique(),
  holderOrgId: text('holder_org_id').notNull().references(() => organizations.id),
  type: text('type').notNull(),
  level: text('level').notNull(),
  status: text('status').notNull().default('ACTIVE'),
  issuedAt: ts('issued_at').notNull(),
  validUntil: ts('valid_until').notNull(),
})

/* ── Governance ───────────────────────────────────────────────────────── */

export const consents = pgTable('consents', {
  id: id(),
  bidRef: text('bid_ref').notNull().unique(),
  grantorOrgId: text('grantor_org_id').notNull().references(() => organizations.id),
  granteeWorkspaceId: text('grantee_workspace_id').notNull().references(() => workspaces.id),
  /** JSON array of disclosure scopes. Specific, never blanket. */
  scope: text('scope').notNull(),
  purpose: text('purpose').notNull(),
  artifactHash: text('artifact_hash').notNull(),
  grantedAt: ts('granted_at').notNull(),
  expiresAt: ts('expires_at').notNull(),
  revokedAt: ts('revoked_at'),
})

/** Append-only. No service has an update or delete path to this table. */
export const auditLog = pgTable(
  'audit_log',
  {
    id: id(),
    workspaceId: text('workspace_id'),
    actor: text('actor').notNull(),
    action: text('action').notNull(),
    resource: text('resource').notNull(),
    purpose: text('purpose'),
    detail: text('detail'),
    at: ts('at').notNull(),
  },
  (t) => [index('audit_ws_idx').on(t.workspaceId)],
)

export const providerCalls = pgTable('provider_calls', {
  id: id(),
  checkId: text('check_id').notNull(),
  providerId: text('provider_id').notNull(),
  outcome: text('outcome').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  costPaise: integer('cost_paise').notNull(),
  failedOver: boolean('failed_over').notNull().default(false),
  at: ts('at').notNull(),
})
