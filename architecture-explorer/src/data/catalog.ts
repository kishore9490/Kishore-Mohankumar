import type { Industry, PolicySection, PipelineStep, DomainEvent, Adr } from '@/types'

/** §11 — domain-agnostic proof. Same engine, different policy. */
export const INDUSTRIES: Industry[] = [
  { id: 'manufacturing', name: 'Manufacturing', policy: 'Critical Supplier Policy', relationshipTypes: ['BUYS_FROM', 'CONTRACTS'], distinctiveChecks: ['Quality certifications', 'Capacity and turnover corroboration', 'Contract labour compliance'], note: 'Deep supplier tiers and customer-imposed diligence obligations flowing downward.' },
  { id: 'healthcare', name: 'Healthcare', policy: 'Healthcare Vendor Policy', relationshipTypes: ['BUYS_FROM', 'EMPLOYS'], distinctiveChecks: ['Drug and device licences', 'Clinical credential verification', 'Facility accreditation'], note: 'Credential-heavy on both the vendor and the staff side.' },
  { id: 'it', name: 'IT', policy: 'Employee BGV Policy', relationshipTypes: ['EMPLOYS', 'CONSIDERS', 'USES'], distinctiveChecks: ['Education verification', 'Employment history', 'Client-mandated security posture'], note: 'High hiring volume plus client security mandates flowing into vendor terms.' },
  { id: 'bpo', name: 'BPO / KPO', policy: 'Workforce Screening Policy', relationshipTypes: ['EMPLOYS', 'CONSIDERS'], distinctiveChecks: ['Identity', 'Address', 'Court record', 'Client-specific screening'], note: 'Client contracts frequently dictate the screening standard.' },
  { id: 'construction', name: 'Construction', policy: 'Critical Contractor Policy', relationshipTypes: ['CONTRACTS', 'HOSTS_WORKER'], distinctiveChecks: ['Contract labour licence', 'Safety certifications', 'Worker-level credential currency'], note: 'The two-layer contractor model matters most here — company and every deployed worker.' },
  { id: 'logistics', name: 'Logistics', policy: 'Transport Partner Policy', relationshipTypes: ['USES', 'CONTRACTS'], distinctiveChecks: ['Transport permits', 'Driver licence validity', 'Insurance coverage'], note: 'Large third-party workforce with continuously expiring credentials.' },
  { id: 'education', name: 'Education', policy: 'Institutional Vendor Policy', relationshipTypes: ['EMPLOYS', 'BUYS_FROM'], distinctiveChecks: ['Staff background checks', 'Institution recognition status'], note: 'Heightened duty of care in staff verification.' },
  { id: 'retail', name: 'Retail', policy: 'Supplier & Franchise Policy', relationshipTypes: ['BUYS_FROM', 'DISTRIBUTES_VIA'], distinctiveChecks: ['Product certifications', 'Franchise entity verification'], note: 'Long tail of small suppliers — MSME-appropriate verification depth is essential.' },
  { id: 'hospitality', name: 'Hospitality', policy: 'Service Provider Policy', relationshipTypes: ['USES', 'EMPLOYS'], distinctiveChecks: ['Food safety licences', 'Staff background checks'], note: 'High workforce churn drives re-verification volume.' },
  { id: 'pharma', name: 'Pharma', policy: 'Regulated Supply Chain Policy', relationshipTypes: ['BUYS_FROM'], distinctiveChecks: ['Manufacturing licences', 'GMP certification', 'Full ownership transparency'], note: 'Audit-heavy; the deepest default policy in the template library.' },
  { id: 'jewellery', name: 'Jewellery', policy: 'High-Value Counterparty Policy', relationshipTypes: ['BUYS_FROM', 'PARTNERS_WITH'], distinctiveChecks: ['Enhanced AML screening', 'Beneficial ownership', 'Source documentation'], note: 'High-value cash-adjacent trade raises the AML bar.' },
  { id: 'realestate', name: 'Real Estate', policy: 'Project Counterparty Policy', relationshipTypes: ['CONTRACTS', 'PARTNERS_WITH'], distinctiveChecks: ['Ownership structure', 'Litigation screening', 'Project approvals'], note: 'Ownership opacity and litigation exposure dominate.' },
  { id: 'professional', name: 'Professional Services', policy: 'Consultant Verification Policy', relationshipTypes: ['ENGAGES'], distinctiveChecks: ['Professional registration', 'Indemnity insurance', 'Conflict-of-interest screening'], note: 'Often a proprietorship — needs the alternative identity pathway.' },
  { id: 'facility', name: 'Facility Management', policy: 'Site Contractor Policy', relationshipTypes: ['CONTRACTS', 'HOSTS_WORKER'], distinctiveChecks: ['Worker identity', 'Employment link to the contractor', 'Safety training currency'], note: 'Verified workforce is itself a differentiator these firms sell to their clients.' },
  { id: 'staffing', name: 'Staffing', policy: 'Deployed Worker Policy', relationshipTypes: ['EMPLOYS', 'HOSTS_WORKER'], distinctiveChecks: ['Identity', 'Skill certification', 'Statutory compliance of the staffing entity'], note: 'Both a verified subject for clients and a heavy requester for its own workforce.' },
  { id: 'recruitment', name: 'Recruitment', policy: 'Candidate BGV Policy', relationshipTypes: ['CONSIDERS'], distinctiveChecks: ['Education', 'Employment', 'Identity', 'Court record'], note: 'Consent and dispute rights are the defining design constraints.' },
]

/** §12 — the editable policy shown in the interactive builder. */
export const DEFAULT_POLICY: PolicySection[] = [
  {
    id: 'identity', name: 'Identity',
    checks: [
      { id: 'gst', name: 'GST Registration', requirement: 'REQUIRED', minLevel: 'L2', sourceClass: 'S1 — Authoritative registry' },
      { id: 'pan', name: 'PAN Verification', requirement: 'REQUIRED', minLevel: 'L2', sourceClass: 'S1 — Authoritative registry' },
      { id: 'mca', name: 'Corporate Identity (MCA)', requirement: 'REQUIRED', minLevel: 'L2', sourceClass: 'S1 — Authoritative registry' },
      { id: 'udyam', name: 'Udyam Registration', requirement: 'OPTIONAL', minLevel: 'L2', sourceClass: 'S1 — Authoritative registry' },
    ],
  },
  {
    id: 'financial', name: 'Financial',
    checks: [
      { id: 'bank', name: 'Bank Account Ownership', requirement: 'REQUIRED', minLevel: 'L3', sourceClass: 'S3 — Licensed provider' },
      { id: 'turnover', name: 'Turnover Verification', requirement: 'REQUIRED', minLevel: 'L2', sourceClass: 'S2 — Regulated intermediary' },
    ],
  },
  {
    id: 'compliance', name: 'Compliance',
    checks: [
      { id: 'iso', name: 'ISO 9001 Certification', requirement: 'REQUIRED', minLevel: 'L3', sourceClass: 'S4 — Issuer attestation' },
      { id: 'licence', name: 'Category Licence', requirement: 'OPTIONAL', minLevel: 'L2', sourceClass: 'S1 — Authoritative registry' },
    ],
  },
  {
    id: 'risk', name: 'Risk',
    checks: [
      { id: 'aml', name: 'AML / Sanctions Screening', requirement: 'REQUIRED', minLevel: 'L2', sourceClass: 'S3 — Licensed provider' },
      { id: 'pep', name: 'PEP Screening', requirement: 'OPTIONAL', minLevel: 'L2', sourceClass: 'S3 — Licensed provider' },
      { id: 'litigation', name: 'Litigation Screening', requirement: 'REQUIRED', minLevel: 'L2', sourceClass: 'S3 — Licensed provider' },
    ],
  },
  {
    id: 'documents', name: 'Documents',
    checks: [
      { id: 'docauth', name: 'Document Authenticity', requirement: 'REQUIRED', minLevel: 'L2', sourceClass: 'Internal' },
      { id: 'address', name: 'Registered Address', requirement: 'REQUIRED', minLevel: 'L2', sourceClass: 'S1 — Authoritative registry' },
    ],
  },
]

export const ADDABLE_CHECKS = [
  { id: 'ubo', name: 'Beneficial Ownership', section: 'identity', sourceClass: 'S1 + analysis' },
  { id: 'directors', name: 'Directors & Disqualification', section: 'identity', sourceClass: 'S1 — Authoritative registry' },
  { id: 'gstfiling', name: 'GST Filing Behaviour', section: 'financial', sourceClass: 'S1 — Authoritative registry' },
  { id: 'insurance', name: 'Insurance Coverage', section: 'compliance', sourceClass: 'S4 — Issuer attestation' },
  { id: 'adverse', name: 'Adverse Media', section: 'risk', sourceClass: 'S3 — Licensed provider' },
  { id: 'relatedparty', name: 'Related-Party Screening', section: 'risk', sourceClass: 'Internal + tenant data' },
  { id: 'sitevisit', name: 'Physical Address Verification', section: 'documents', sourceClass: 'S5 — Human verification' },
  { id: 'cyber', name: 'Security Certification', section: 'compliance', sourceClass: 'S4 — Issuer attestation' },
]

/** §13 — the verification pipeline. */
export const PIPELINE: PipelineStep[] = [
  { id: 'request', name: 'Request Created', purpose: 'A requester asks for verification of a counterparty under a stated purpose.', owner: 'Campaign Service', inputs: ['Requester tenant', 'Target entity', 'Stated purpose'], outputs: ['Verification request'], sampleData: { request_id: 'BID-REQ-88123', requester: 'BID-BUS-00104', subject: 'BID-BUS-00231', purpose: 'Critical supplier onboarding — CT-2026-0088' }, failureModes: ['Missing purpose — rejected', 'Requester lacks entitlement'] },
  { id: 'policy', name: 'Policy Selected', purpose: 'The relationship’s policy version is resolved and locked to this request.', owner: 'Policy Engine', inputs: ['Relationship', 'Entity type', 'Criticality'], outputs: ['Locked policy version'], sampleData: { policy: 'ABC Critical Supplier', version: '2.1', locked_at: '2026-08-15T09:02:00+05:30', required_checks: 12, optional_checks: 3 }, failureModes: ['Policy in DRAFT — blocked', 'Conditional logic unresolvable'] },
  { id: 'consent', name: 'Consent / Authorization', purpose: 'The subject authorises disclosure; the platform authorises the requester’s scope.', owner: 'Consent + Authorization Service', inputs: ['Disclosure request', 'Subject decision'], outputs: ['Consent artifact', 'Authorized scope'], sampleData: { consent_id: 'BID-CON-4471902', scope: ['identity', 'financial_summary', 'ownership', 'risk_screening'], expires_at: '2027-08-15', revocable: true }, failureModes: ['Consent declined — request closes, never reported as adverse', 'Scope disproportionate to purpose — challenged'] },
  { id: 'plan', name: 'Verification Plan Generated', purpose: 'The policy is expanded into a concrete, costed, executable check set.', owner: 'Verification Engine', inputs: ['Locked policy', 'Authorized scope', 'Reuse cache'], outputs: ['Check set with routing hints'], sampleData: { checks: 12, reused_from_cache: 6, to_execute: 6, estimated_provider_cost_inr: 14 }, failureModes: ['No qualified route for a REQUIRED check — INSUFFICIENT_EVIDENCE'] },
  { id: 'routing', name: 'Provider Routing', purpose: 'Each check is matched to a qualified provider by capability, eligibility, confidence, health and cost.', owner: 'Provider Orchestrator', inputs: ['Check set', 'Provider registry state'], outputs: ['Provider assignments', 'Fallback chains'], sampleData: { check: 'BANK_ACCOUNT_OWNERSHIP', required_level: 'L3', selected: 'Provider A (₹8.00)', fallback: ['Provider B (₹11.00)'], rejected: 'Provider C — cannot reach L3' }, failureModes: ['All providers unhealthy — queued', 'Legal eligibility fails — route removed'] },
  { id: 'execution', name: 'Provider Execution', purpose: 'Checks execute asynchronously; human and issuer checks may take days.', owner: 'Provider adapters (mocked)', inputs: ['Routed requests'], outputs: ['Provider-native responses'], sampleData: { provider: 'Provider A', latency_ms: 812, status: 'SUCCESS', idempotency_key: 'idem_9f2c41' }, failureModes: ['Timeout — fallback', 'Definitive negative — never retried', 'Circuit open — provider removed from pool'] },
  { id: 'normalize', name: 'Response Normalization', purpose: 'Provider-native responses map to one canonical schema with a confidence rating.', owner: 'Provider Orchestrator', inputs: ['Raw provider responses'], outputs: ['Canonical check results'], sampleData: { check_type: 'GST_REGISTRATION', outcome: 'VERIFIED', level: 'L2', confidence: 'HIGH', name_match: { score: 0.97, method: 'normalized_token_jaccard' } }, failureModes: ['Unmappable response — flagged for review', 'Provider disagreement — quality signal raised'] },
  { id: 'evidence', name: 'Evidence Stored', purpose: 'Everything relied upon is written once, hashed, classified and retention-stamped.', owner: 'Evidence Service', inputs: ['Canonical results', 'Raw responses', 'Documents'], outputs: ['Immutable evidence records'], sampleData: { evidence_id: 'BID-EVD-9912004', content_hash: 'sha256:9f2c…', sensitivity: 'RESTRICTED', retention_until: '2034-08-15' }, failureModes: ['Hash mismatch on write — hard failure'] },
  { id: 'quality', name: 'Quality Check', purpose: 'Automated and sampled human QA before anything is assessed.', owner: 'Operations', inputs: ['Check results', 'Confidence ratings'], outputs: ['Validated results', 'Exception queue entries'], sampleData: { sampled: true, reviewer: 'ops-analyst-14', outcome: 'PASS', notes: 'Name match verified manually — trade name variant' }, failureModes: ['Low confidence — routed to human', 'Anomaly detected — escalated'] },
  { id: 'assessment', name: 'Assessment', purpose: 'A deterministic rubric produces per-dimension grades and a composite band.', owner: 'Assessment Engine', inputs: ['Validated results', 'Rubric version'], outputs: ['Assessment with factor contributions'], sampleData: { band: 'LOW RISK', rubric: 'v2.1', factors: { identity: 'VERIFIED', compliance: 'STRONG', financial: 'VERIFIED', documentation: 'COMPLETE', screening: 'CLEAR', freshness: 'CURRENT' } }, failureModes: ['Hard-stop override → BLOCKED', 'Insufficient inputs → INSUFFICIENT EVIDENCE, never HIGH RISK'] },
  { id: 'decision', name: 'Decision', purpose: 'The requester’s policy thresholds determine approval, review, escalation or block.', owner: 'Policy Engine + requester', inputs: ['Assessment', 'Thresholds'], outputs: ['Recorded decision with reason'], sampleData: { outcome: 'AUTO_APPROVED', rule: 'assessment == LOW and exceptions == 0', decided_at: '2026-08-15T14:40:00+05:30' }, failureModes: ['Manual review SLA breach — escalation fires'] },
  { id: 'credential', name: 'Credential', purpose: 'Verified attributes become structured, reusable credentials with validity windows.', owner: 'Credential Service', inputs: ['Verified attributes'], outputs: ['Credential records', 'BID Card'], sampleData: { credential_id: 'BID-CRED-77120043', type: 'BID_VERIFIED_BUSINESS', level: 'L3', valid_until: '2027-08-15' }, failureModes: ['Issuer revocation — credential invalidated'] },
  { id: 'report', name: 'Report', purpose: 'The requester receives outcome, evidence sufficient to justify reliance, and the audit trail.', owner: 'Profile Service', inputs: ['Assessment', 'Authorized scope'], outputs: ['Verification report'], sampleData: { disclosed: ['status', 'level', 'assessment_factors', 'check_outcomes', 'validity', 'audit_trail'], withheld: ['raw_identifiers', 'underlying_documents', 'personal_data_beyond_purpose'] }, failureModes: ['Scope violation attempt — denied and logged'] },
  { id: 'monitoring', name: 'Monitoring', purpose: 'The record stays alive — the step that turns a transaction into a subscription.', owner: 'Monitoring Engine', inputs: ['Monitoring rules', 'Change signals'], outputs: ['Alerts', 're-verification triggers'], sampleData: { watched: ['GST_STATUS', 'ENTITY_STATUS', 'DIRECTOR_CHANGE', 'SANCTIONS', 'CREDENTIAL_EXPIRY', 'LITIGATION'], next_reverification: '2027-08-15' }, failureModes: ['Consent revoked — monitoring stops', 'Provider change-feed unavailable — degraded, and disclosed as such'] },
]

/** §25 — the event catalog. */
export const EVENTS: DomainEvent[] = [
  { id: 'OrganizationCreated', name: 'OrganizationCreated', producer: 'Organization Service', description: 'A new organization record has been created or claimed.', consumers: ['BID Identity Service', 'Audit Service', 'Analytics', 'Customer Lifecycle'], payload: { organization_id: 'BID-BUS-00231', created_via: 'invitation', invited_by: 'BID-BUS-00104' }, facets: ['business', 'network'] },
  { id: 'InvitationSent', name: 'InvitationSent', producer: 'Campaign Service', description: 'A verification invitation has been issued to a counterparty.', consumers: ['Notifications', 'Audit Service', 'Analytics'], payload: { campaign_id: 'BID-CAMP-4471902', invitee: 'XYZ HR Consultants', expires_at: '2026-08-29' }, facets: ['network', 'business'] },
  { id: 'InvitationAccepted', name: 'InvitationAccepted', producer: 'Organization Service', description: 'The invited organization has claimed its profile.', consumers: ['Campaign Service', 'Customer Lifecycle', 'Analytics'], payload: { campaign_id: 'BID-CAMP-4471902', organization_id: 'BID-BUS-00231' }, facets: ['network', 'lifecycle'] },
  { id: 'ConsentGranted', name: 'ConsentGranted', producer: 'Consent Service', description: 'A subject has authorised a specific, scoped, time-boxed disclosure.', consumers: ['Verification Engine', 'Authorization Service', 'Audit Service'], payload: { consent_id: 'BID-CON-4471902', grantor: 'BID-BUS-00231', grantee: 'BID-BUS-00104', scope: ['identity', 'financial_summary'], expires_at: '2027-08-15' }, facets: ['security', 'trust'] },
  { id: 'VerificationStarted', name: 'VerificationStarted', producer: 'Verification Engine', description: 'Check execution has begun against a locked policy version.', consumers: ['Notifications', 'Usage', 'Audit Service'], payload: { request_id: 'BID-REQ-88123', policy_version: '2.1', checks: 12 }, facets: ['verification'] },
  { id: 'VerificationCompleted', name: 'VerificationCompleted', producer: 'Verification Engine', description: 'All checks have resolved. The canonical fan-out event.', consumers: ['Assessment Engine', 'Notification Service', 'Credential Service', 'Audit Service', 'Billing', 'Monitoring Engine'], payload: { request_id: 'BID-REQ-88123', outcome: 'VERIFIED', level: 'L3', passed: 12, exceptions: 0 }, facets: ['verification', 'trust'] },
  { id: 'VerificationFailed', name: 'VerificationFailed', producer: 'Verification Engine', description: 'A required check failed or could not be completed.', consumers: ['Notifications', 'Customer Success', 'Audit Service'], payload: { request_id: 'BID-REQ-88144', reason: 'REQUIRED_CHECK_FAILED', check: 'GST_REGISTRATION', detail: 'Status CANCELLED' }, facets: ['verification'] },
  { id: 'CredentialIssued', name: 'CredentialIssued', producer: 'Credential Service', description: 'A structured credential with a validity window has been issued.', consumers: ['Profile Service', 'Monitoring Engine', 'Notifications'], payload: { credential_id: 'BID-CRED-77120043', holder: 'BID-BUS-00231', valid_until: '2027-08-15' }, facets: ['trust'] },
  { id: 'PolicyCreated', name: 'PolicyCreated', producer: 'Policy Engine', description: 'A new policy version has been authored.', consumers: ['Audit Service', 'Analytics'], payload: { policy_id: 'BID-POL-0031', version: '2.2', author: 'compliance-lead' }, facets: ['trust', 'business'] },
  { id: 'MonitoringAlertCreated', name: 'MonitoringAlertCreated', producer: 'Monitoring Engine', description: 'A watched signal changed on a live relationship.', consumers: ['Notifications', 'Enterprise Portal', 'Customer Success'], payload: { entity: 'BID-BUS-00548', signal: 'GST_STATUS', from: 'ACTIVE', to: 'CANCELLED', severity: 'HIGH' }, facets: ['monitoring', 'trust'] },
  { id: 'SubscriptionCreated', name: 'SubscriptionCreated', producer: 'Subscription', description: 'A customer has started a paid plan.', consumers: ['Billing', 'Customer Lifecycle', 'Analytics'], payload: { customer: 'BID-BUS-00231', plan: 'Growth', term: 'annual' }, facets: ['revenue', 'lifecycle'] },
  { id: 'PaymentReceived', name: 'PaymentReceived', producer: 'Billing', description: 'A payment has cleared.', consumers: ['Subscription', 'Credits', 'Customer Success'], payload: { invoice: 'INV-2026-0912', amount_inr: 299988, status: 'PAID' }, facets: ['revenue'] },
  { id: 'CustomerAtRisk', name: 'CustomerAtRisk', producer: 'Customer Success', description: 'Health scoring has flagged material churn probability.', consumers: ['Notifications', 'Customer Lifecycle'], payload: { customer: 'BID-BUS-00318', score: 41, drivers: ['login_frequency', 'credit_utilisation'] }, facets: ['lifecycle', 'revenue'] },
  { id: 'CustomerChurned', name: 'CustomerChurned', producer: 'Customer Lifecycle', description: 'The commercial relationship has ended. The organization remains a member.', consumers: ['Billing', 'Data Retention', 'Analytics'], payload: { customer: 'BID-BUS-00318', reason: 'non_renewal', remains_member: true }, facets: ['lifecycle', 'revenue'] },
]

/** §37 — architecture decision records. */
export const ADRS: Adr[] = [
  {
    id: 'ADR-001', title: 'Organization is the primary business entity', status: 'Accepted',
    context: 'Verification platforms commonly model a "vendor" table and a "customer" table. That choice bakes a commercial role into identity, which then has to be duplicated the moment the same company appears in another role.',
    decision: 'Model a single Organization entity. Commercial roles are expressed as relationships, never as entity types or subclasses.',
    consequences: ['One company has exactly one record regardless of how many parties transact with it', 'Reuse across buyers becomes structurally possible', 'Entity resolution becomes a first-class problem that must be solved properly', 'No "convert vendor to customer" migration ever needs to exist'],
    alternatives: [{ option: 'Separate vendor/customer/candidate tables', why: 'Simpler at first, but duplicates entities, breaks reuse, and makes the network effect unimplementable.' }],
  },
  {
    id: 'ADR-002', title: 'Relationships are separate from organization identity', status: 'Accepted',
    context: 'Verification requirements, purpose, criticality and consent all vary by who is asking — not by who the subject is.',
    decision: 'A Relationship object carries type, purpose, policy, criticality, status and review dates. Policy binds to the relationship, not the entity.',
    consequences: ['The same vendor can be Standard for one buyer and Critical for another with no conflict', 'Purpose limitation becomes technically enforceable', 'Multi-hop chains (principal → contractor → worker) are expressible natively', 'Relationships must be tenant-private — the commercial graph is highly sensitive'],
    alternatives: [{ option: 'Attributes on the organization record', why: 'Cannot express differing requirements per counterparty, and leaks one buyer’s standard to another.' }],
  },
  {
    id: 'ADR-003', title: 'BID Member and BID Customer are different things', status: 'Accepted',
    context: 'An organization invited to be verified has no commercial relationship with BID. Charging it, or treating it as a lead-gated account, would poison the network at its root.',
    decision: 'Membership is free and permanent. Being a customer is a separate, purchased state. An organization can be a verified subject and a paying requester simultaneously.',
    consequences: ['Invitees complete verification without a paywall, so campaigns actually finish', 'The member base becomes the acquisition funnel for the requester business', 'Churn ends the commercial relationship without destroying the identity', 'Requires strict separation between organization identity and customer tenant'],
    alternatives: [{ option: 'Charge the verified party', why: 'Suppresses completion rates, hands competitors an easy attack, and destroys the flywheel.' }],
  },
  {
    id: 'ADR-004', title: 'The Policy Engine is what makes BID domain-agnostic', status: 'Accepted',
    context: 'Industry-specific requirements could be implemented as separate products, per-vertical forks, or configuration.',
    decision: 'Industry differences are expressed exclusively as Verification Policies. The core engine never contains industry logic.',
    consequences: ['One codebase serves every sector', 'Domain expertise ships as policy templates — a sellable, accumulating asset', 'A new industry is a configuration exercise, not an engineering project', 'The policy engine must be genuinely expressive, including conditional logic — this is the hardest component to get right'],
    alternatives: [{ option: 'Vertical products', why: 'Multiplies engineering cost, fragments the roadmap, and forfeits the horizontal platform thesis.' }],
  },
  {
    id: 'ADR-005', title: 'Provider abstraction is required', status: 'Accepted',
    context: 'Verification data comes from registries, regulated intermediaries, commercial providers, issuers and human agents, each with different terms, reliability and legal eligibility.',
    decision: 'All providers sit behind one internal contract with routing, fallback, normalization, cost ledger and quality monitoring. BID buys data; it does not own sources.',
    consequences: ['No vendor lock-in; providers can be swapped as configuration', 'Cost arbitrage becomes possible', 'Normalization is hard and is where much of the engineering value sits', 'Requires at least two qualified routes for every REQUIRED check', 'Caching and reuse rights must be negotiated contractually or the margin model does not exist'],
    alternatives: [{ option: 'Direct point-to-point integrations', why: 'Brittle, legally risky where channels are restricted, and produces no defensible advantage.' }],
  },
  {
    id: 'ADR-006', title: 'Consent and authorization are separate concepts', status: 'Accepted',
    context: 'These are routinely conflated. They answer different questions and are held by different parties.',
    decision: 'Consent is the subject’s permission, held by the subject and revocable by them. Authorization is the platform’s decision about whether a specific requester may see a specific item for a specific purpose.',
    consequences: ['A requester can hold valid consent and still be denied disproportionate scope', 'Revocation ends future access without erasing a buyer’s lawful historical decision record', 'Purpose limitation is enforced by the ABAC layer rather than by policy documents', 'Two distinct audit trails, which auditors and regulators expect'],
    alternatives: [{ option: 'A single permission model', why: 'Cannot express "consented but disproportionate", and makes purpose limitation unenforceable.' }],
  },
  {
    id: 'ADR-007', title: 'Verification evidence is separated from public profiles', status: 'Accepted',
    context: 'A public profile is a marketing and trust surface. Evidence is sensitive, sometimes personal, and often contractually restricted.',
    decision: 'Four disclosure tiers — public, relationship, authorized, restricted. Evidence never appears publicly. Public profiles carry status, level, dates and published credentials only.',
    consequences: ['Public profiles are safe to share and index', 'Adverse risk findings never appear publicly, avoiding defamation exposure', 'Company-provided and BID-verified data must be structurally separated in the payload, not merely styled differently', 'Deeper disclosure always requires a consent artifact'],
    alternatives: [{ option: 'One rich profile with permission flags', why: 'One bug leaks sensitive data publicly; the blast radius is unacceptable.' }],
  },
  {
    id: 'ADR-008', title: 'Monitoring is a first-class capability', status: 'Accepted',
    context: 'Point-in-time verification decays immediately. A vendor verified in January can be struck off by March.',
    decision: 'Monitoring is a core engine, not a report. Every verified attribute carries a validity window and may be watched continuously.',
    consequences: ['Converts transactional revenue into recurring revenue', 'Delivers something customers genuinely cannot do themselves today', 'Requires an event-driven architecture from the start', 'Provider cost structure for change signals must be understood before pricing monitoring'],
    alternatives: [{ option: 'Periodic manual re-verification', why: 'Nobody owns it, so it does not happen — which is precisely the gap BID exists to close.' }],
  },
  {
    id: 'ADR-009', title: 'The network model is the customer acquisition strategy', status: 'Accepted',
    context: 'Enterprise sales alone is slow and expensive. Each customer, however, arrives with hundreds of counterparties.',
    decision: 'Every invited counterparty becomes a free member with a permanent identity, and the product deliberately surfaces requester capability to members.',
    consequences: ['Customers fund the acquisition of the next generation of members', 'Marginal verification cost falls as reuse density rises, while price does not', 'The vendor-side experience becomes the single most important product surface', 'The network is worth nothing until density exists — the product must win standalone for the first 12–18 months'],
    alternatives: [{ option: 'Pure outbound enterprise sales', why: 'Ignores the most valuable asset each customer brings, and forfeits the compounding advantage.' }],
  },
  {
    id: 'ADR-010', title: 'BID is not a marketplace', status: 'Accepted',
    context: 'A verified-supplier directory with discovery and matching is an obvious adjacent product, and a tempting one.',
    decision: 'BID is trust infrastructure. It does not broker transactions, rank suppliers commercially, or monetise discovery.',
    consequences: ['No conflict of interest between verification outcomes and transaction revenue', 'Buyers can trust that ranking is not for sale — the credibility the whole platform rests on', 'Forgoes a revenue line', 'Relationship-graph data must never be used to build discovery features, which constrains the analytics roadmap'],
    alternatives: [{ option: 'Verified supplier marketplace', why: 'The moment BID earns from matching, every verification outcome becomes commercially suspect.' }],
  },
]

/** §36 — non-negotiable principles. */
export const PRINCIPLES: { n: number; text: string; facet: string }[] = [
  { n: 1, text: 'BID is domain agnostic.', facet: 'Platform' },
  { n: 2, text: 'Organization is a core entity.', facet: 'Entity model' },
  { n: 3, text: 'Organizations can have multiple relationships.', facet: 'Entity model' },
  { n: 4, text: 'Organizations are not permanently "vendors" or "customers".', facet: 'Entity model' },
  { n: 5, text: 'BID Member ≠ BID Customer.', facet: 'Commercial' },
  { n: 6, text: 'An invitee can become a customer through product adoption.', facet: 'Commercial' },
  { n: 7, text: 'A customer can become a verifier/requester.', facet: 'Commercial' },
  { n: 8, text: 'The same organization can be both verified subject and requester.', facet: 'Commercial' },
  { n: 9, text: 'The Policy Engine handles domain-specific requirements.', facet: 'Trust' },
  { n: 10, text: 'The Verification Engine executes policies.', facet: 'Trust' },
  { n: 11, text: 'Provider abstraction prevents vendor lock-in.', facet: 'Integration' },
  { n: 12, text: 'Consent and authorization are separate concepts.', facet: 'Governance' },
  { n: 13, text: 'Public profiles must not expose sensitive data.', facet: 'Governance' },
  { n: 14, text: 'Verification must have timestamp, source and scope.', facet: 'Trust' },
  { n: 15, text: 'Trust assessment must be explainable.', facet: 'Trust' },
  { n: 16, text: 'Verification is not permanently valid.', facet: 'Trust' },
  { n: 17, text: 'Continuous monitoring is a first-class capability.', facet: 'Trust' },
  { n: 18, text: 'BID does not sell personal data.', facet: 'Governance' },
  { n: 19, text: 'BID is not a government identity.', facet: 'Boundary' },
  { n: 20, text: 'BID is not a credit bureau.', facet: 'Boundary' },
  { n: 21, text: 'BID is not an ERP.', facet: 'Boundary' },
  { n: 22, text: 'BID is not a marketplace.', facet: 'Boundary' },
  { n: 23, text: 'BID is trust infrastructure.', facet: 'Boundary' },
  { n: 24, text: 'The network grows through invitations.', facet: 'Network' },
  { n: 25, text: 'The requester side is monetized.', facet: 'Commercial' },
  { n: 26, text: 'The member side can remain free.', facet: 'Commercial' },
  { n: 27, text: 'Enterprise expansion is driven by additional workflows.', facet: 'Commercial' },
  { n: 28, text: 'API-first architecture.', facet: 'Platform' },
  { n: 29, text: 'Multi-tenant architecture.', facet: 'Platform' },
  { n: 30, text: 'Auditability is fundamental.', facet: 'Governance' },
]

/** §38 — business capability → technical service mapping. */
export const CAPABILITY_MAP = [
  { capability: 'Vendor Verification', outcome: 'A counterparty is verified against the buyer’s own policy with an auditable record.', services: ['campaign-service', 'policy-engine', 'verification-engine', 'provider-orchestrator', 'evidence-service', 'assessment-engine', 'notifications', 'audit-service'] },
  { capability: 'Candidate BGV', outcome: 'A person is verified with informed consent and dispute rights.', services: ['candidate-portal', 'consent-service', 'person-service', 'policy-engine', 'verification-engine', 'provider-orchestrator', 'privacy-controls'] },
  { capability: 'Contractor Workforce', outcome: 'Both the contractor company and each deployed worker are verified and kept current.', services: ['relationship-service', 'person-service', 'credential-service', 'monitoring-engine', 'campaign-service'] },
  { capability: 'Continuous Monitoring', outcome: 'Verified records stay current; changes surface as alerts.', services: ['monitoring-engine', 'credential-service', 'provider-orchestrator', 'notifications', 'event-store'] },
  { capability: 'Customer Expansion', outcome: 'Adoption spreads across workflows and revenue grows without renegotiation.', services: ['subscription', 'usage', 'billing', 'customer-lifecycle', 'customer-success', 'credits'] },
  { capability: 'Network Growth', outcome: 'Each customer’s counterparties become members, and some become customers.', services: ['organization-service', 'relationship-service', 'campaign-service', 'bid-identity-service', 'public-profile', 'credential-service'] },
  { capability: 'Authorized Disclosure', outcome: 'A requester sees more than public data only with scoped, revocable consent.', services: ['consent-service', 'authorization-service', 'abac', 'profile-service', 'audit-service'] },
  { capability: 'Audit Defence', outcome: 'The organization can prove what it verified, when, from what source, under what policy.', services: ['audit-service', 'evidence-service', 'policy-engine', 'audit-store'] },
]
