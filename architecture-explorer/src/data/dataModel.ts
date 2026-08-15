import type { DataEntity } from '@/types'

/** §22 — the data architecture. */
const e = (
  id: string, group: string, purpose: string, keyFields: string[],
  relationships: string[], classification: DataEntity['classification'], retention: string,
): DataEntity => ({ id, name: id, group, purpose, keyFields, relationships, classification, retention })

export const DATA_ENTITIES: DataEntity[] = [
  // Identity & entities
  e('organizations', 'Identity', 'The primary business entity. Independent of any commercial role.', ['id (uuidv7)', 'bid_id', 'legal_name', 'entity_type', 'status', 'incorporated_on'], ['1:N organization_identifiers', '1:1 bid_ids', '1:N relationships', '1:N credentials'], 'RESTRICTED', '8 years after last activity'),
  e('persons', 'Identity', 'Individuals — employees, candidates, workers, directors.', ['id', 'bid_id', 'display_name', 'status'], ['1:N relationships', '1:N consents', '1:N verification_requests'], 'SENSITIVE', '12 months post-decision unless legally required'),
  e('users', 'Identity', 'Authenticated humans operating inside a workspace.', ['id', 'email', 'workspace_id', 'role', 'mfa_enabled'], ['N:1 workspaces', '1:N audit_logs'], 'RESTRICTED', 'Life of account + 8 years'),
  e('workspaces', 'Identity', 'The customer tenant. Deliberately distinct from organization identity.', ['id', 'organization_id', 'plan_id', 'status'], ['N:1 organizations', '1:N users', '1:N relationships', '1:N policies'], 'RESTRICTED', 'Life of contract + 8 years'),
  e('organization_identifiers', 'Identity', 'Government and third-party identifiers held as attributes, never as identity.', ['organization_id', 'type', 'value_encrypted', 'verified_at'], ['N:1 organizations'], 'SENSITIVE', 'With parent organization'),
  e('bid_ids', 'Identity', 'Registry of minted public handles and their resolution targets.', ['bid_id', 'entity_type', 'target_id', 'status', 'redirects_to'], ['1:1 organizations/persons'], 'PUBLIC', 'Permanent — never reassigned'),
  e('relationships', 'Identity', 'How entities relate. Carries purpose, policy and criticality.', ['id', 'workspace_id', 'from_entity', 'to_entity', 'type', 'purpose', 'policy_id', 'status'], ['N:1 workspaces', 'N:1 policies', '1:N verification_requests'], 'RESTRICTED', 'Contract term + 8 years'),

  // Policy & verification
  e('policies', 'Trust', 'Verification standards owned by a workspace.', ['id', 'workspace_id', 'name', 'applies_to', 'status'], ['1:N policy_versions', '1:N relationships'], 'RESTRICTED', 'Life of workspace + 8 years'),
  e('policy_versions', 'Trust', 'Immutable snapshots. The basis of the audit-grade claim.', ['id', 'policy_id', 'version', 'definition_json', 'effective_from'], ['N:1 policies', '1:N verification_requests'], 'RESTRICTED', 'Permanent while any verification references it'),
  e('verification_requests', 'Trust', 'A request to verify an entity under a locked policy version.', ['id', 'workspace_id', 'subject_id', 'policy_version_id', 'purpose', 'status'], ['1:N verification_checks', '1:1 risk_assessments'], 'RESTRICTED', '8 years'),
  e('verification_checks', 'Trust', 'One atomic check within a request.', ['id', 'request_id', 'check_type', 'required_level', 'provider_id', 'status'], ['N:1 verification_requests', '1:1 verification_results'], 'RESTRICTED', '8 years'),
  e('verification_results', 'Trust', 'Normalized canonical outcome of a check.', ['id', 'check_id', 'outcome', 'level', 'confidence', 'valid_until'], ['N:1 verification_checks', '1:N evidence'], 'SENSITIVE', '8 years'),
  e('evidence', 'Trust', 'Immutable, content-addressed proof of what was relied upon.', ['id', 'result_id', 'content_hash', 'sensitivity', 'retention_until'], ['N:1 verification_results'], 'HIGHLY SENSITIVE', '3 years or contract-defined; legal hold overrides'),
  e('credentials', 'Trust', 'Structured certificates and licences with validity windows.', ['id', 'holder_id', 'type', 'issuer_id', 'valid_until', 'status'], ['N:1 organizations/persons', '1:N monitoring_rules'], 'RESTRICTED', 'Validity + 8 years'),
  e('risk_assessments', 'Trust', 'Explainable assessment output with per-factor contributions.', ['id', 'request_id', 'band', 'rubric_version', 'factors_json', 'valid_until'], ['1:1 verification_requests'], 'RESTRICTED', '8 years'),

  // Governance
  e('consents', 'Governance', 'Purpose-bound, time-boxed, revocable permission from the subject.', ['id', 'grantor_id', 'grantee_id', 'scope', 'purpose', 'expires_at', 'artifact_hash'], ['N:1 organizations/persons'], 'SENSITIVE', 'Life of consent + 8 years'),
  e('authorizations', 'Governance', 'The platform’s decision on whether a requester may see an item.', ['id', 'consent_id', 'requester_id', 'granted_scope', 'expires_at'], ['N:1 consents'], 'RESTRICTED', 'With parent consent'),
  e('audit_logs', 'Governance', 'Append-only, hash-chained record of every sensitive action.', ['id', 'actor_id', 'action', 'resource', 'purpose', 'ts', 'prev_hash'], ['N:1 users'], 'RESTRICTED', '8 years — append-only, no delete path'),

  // Campaigns
  e('campaigns', 'Business', 'A bulk verification programme bound to a policy.', ['id', 'workspace_id', 'policy_version_id', 'name', 'status'], ['1:N campaign_members'], 'RESTRICTED', 'Contract term + 8 years'),
  e('campaign_members', 'Business', 'One invited entity within a campaign.', ['id', 'campaign_id', 'entity_id', 'invite_status', 'verification_request_id'], ['N:1 campaigns'], 'RESTRICTED', 'With parent campaign; abandoned invites purged at 90 days'),

  // Monitoring
  e('monitoring_rules', 'Monitoring', 'What is watched, for whom, and how often.', ['id', 'workspace_id', 'entity_id', 'signals', 'frequency', 'active'], ['N:1 relationships'], 'RESTRICTED', 'Life of relationship'),
  e('monitoring_events', 'Monitoring', 'A detected change in a watched signal.', ['id', 'rule_id', 'signal', 'from_value', 'to_value', 'severity', 'detected_at'], ['N:1 monitoring_rules'], 'RESTRICTED', '8 years'),

  // Providers
  e('providers', 'Integration', 'Registry of verification sources and their capabilities.', ['id', 'name', 'capabilities', 'source_class', 'eligibility', 'health'], ['1:N provider_transactions'], 'PUBLIC', 'Life of contract'),
  e('provider_transactions', 'Integration', 'Every provider call with its cost — the basis of true unit economics.', ['id', 'provider_id', 'check_id', 'cost_paise', 'latency_ms', 'outcome', 'idempotency_key'], ['N:1 providers'], 'RESTRICTED', '12 months for reconciliation, then discarded'),

  // Commercial
  e('plans', 'Revenue', 'Plan definitions and entitlements.', ['id', 'name', 'entitlements_json', 'list_price'], ['1:N subscriptions'], 'PUBLIC', 'Permanent'),
  e('subscriptions', 'Revenue', 'A workspace’s active plan and term.', ['id', 'workspace_id', 'plan_id', 'term', 'status', 'renews_on'], ['N:1 plans', '1:N invoices'], 'RESTRICTED', 'Contract + statutory financial retention'),
  e('usage', 'Revenue', 'Metered consumption per tenant and period.', ['id', 'workspace_id', 'metric', 'quantity', 'period'], ['N:1 workspaces'], 'RESTRICTED', '8 years'),
  e('credits', 'Revenue', 'Prepaid verification balance ledger. Append-only.', ['id', 'workspace_id', 'delta', 'reason', 'expires_at'], ['N:1 workspaces'], 'RESTRICTED', '8 years'),
  e('invoices', 'Revenue', 'Issued invoices.', ['id', 'workspace_id', 'amount', 'status', 'issued_on'], ['1:N payments'], 'RESTRICTED', 'Statutory financial retention'),
  e('payments', 'Revenue', 'Received payments. No card data is stored.', ['id', 'invoice_id', 'amount', 'method', 'processor_ref'], ['N:1 invoices'], 'RESTRICTED', 'Statutory financial retention'),

  // Operations
  e('notifications', 'Business', 'Outbound message log across channels.', ['id', 'recipient', 'channel', 'template', 'status', 'sent_at'], [], 'RESTRICTED', '24 months'),
  e('support_cases', 'Business', 'Customer support interactions, a health signal.', ['id', 'workspace_id', 'subject', 'severity', 'status'], ['N:1 workspaces'], 'RESTRICTED', '3 years'),
]

export const DATA_GROUPS = ['Identity', 'Trust', 'Governance', 'Business', 'Monitoring', 'Integration', 'Revenue']

/** Edges for the ERD canvas. */
export const DATA_EDGES: [string, string, string][] = [
  ['workspaces', 'organizations', 'belongs to'],
  ['workspaces', 'users', 'has'],
  ['workspaces', 'relationships', 'owns'],
  ['workspaces', 'policies', 'owns'],
  ['organizations', 'organization_identifiers', 'has'],
  ['organizations', 'bid_ids', 'resolves'],
  ['organizations', 'relationships', 'participates'],
  ['persons', 'relationships', 'participates'],
  ['persons', 'consents', 'grants'],
  ['policies', 'policy_versions', 'versions'],
  ['policy_versions', 'verification_requests', 'locked into'],
  ['relationships', 'verification_requests', 'triggers'],
  ['verification_requests', 'verification_checks', 'expands to'],
  ['verification_checks', 'verification_results', 'produces'],
  ['verification_results', 'evidence', 'supported by'],
  ['verification_requests', 'risk_assessments', 'assessed by'],
  ['verification_results', 'credentials', 'issues'],
  ['consents', 'authorizations', 'scopes'],
  ['campaigns', 'campaign_members', 'contains'],
  ['campaign_members', 'verification_requests', 'creates'],
  ['relationships', 'monitoring_rules', 'watched by'],
  ['monitoring_rules', 'monitoring_events', 'raises'],
  ['credentials', 'monitoring_rules', 'expiry watched'],
  ['providers', 'provider_transactions', 'bills'],
  ['verification_checks', 'provider_transactions', 'costs'],
  ['plans', 'subscriptions', 'defines'],
  ['workspaces', 'subscriptions', 'holds'],
  ['subscriptions', 'invoices', 'bills'],
  ['invoices', 'payments', 'settled by'],
  ['workspaces', 'usage', 'meters'],
  ['workspaces', 'credits', 'holds'],
  ['users', 'audit_logs', 'writes'],
  ['workspaces', 'support_cases', 'raises'],
]
