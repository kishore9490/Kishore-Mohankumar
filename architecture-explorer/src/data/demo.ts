import type { OrgNode, Relationship } from '@/types'

/**
 * Seed/demo data (§35). Fictional companies and people only.
 * Every number shown in the UI from this file is labelled as demo data.
 */

export const DEMO_NOTICE =
  'Demo data — fictional organizations and people. Not real entities, not real verification outcomes.'

export const ORGS: OrgNode[] = [
  {
    id: 'abc', bidId: 'BID-BUS-00104', name: 'ABC Technologies', kind: 'organization',
    roles: ['BID Customer', 'Requester', 'Employer', 'Buyer'],
    isCustomer: true, isMember: true, verified: true,
    website: 'abctechnologies.example', location: 'Bengaluru, Karnataka',
    description: 'Enterprise IT services and systems integration. Established 2009.',
  },
  {
    id: 'xyz', bidId: 'BID-BUS-00231', name: 'XYZ HR Consultants', kind: 'organization',
    roles: ['Vendor to ABC', 'BID Customer', 'Requester', 'Employer', 'Customer of LMN', 'Supplier to OPQ'],
    isCustomer: true, isMember: true, verified: true,
    website: 'xyzhrconsultants.example', location: 'Bengaluru, Karnataka',
    description: 'Staffing, recruitment and HR advisory for mid-market technology firms. Established 2014.',
  },
  {
    id: 'lmn', bidId: 'BID-BUS-00318', name: 'LMN Components', kind: 'organization',
    roles: ['Vendor to XYZ', 'BID Member', 'Supplier'],
    isCustomer: false, isMember: true, verified: true,
    website: 'lmncomponents.example', location: 'Hosur, Tamil Nadu',
    description: 'Precision machined components for industrial and automotive applications.',
  },
  {
    id: 'opq', bidId: 'BID-BUS-00402', name: 'OPQ Logistics', kind: 'organization',
    roles: ['Vendor to XYZ', 'BID Member', 'Service provider'],
    isCustomer: false, isMember: true, verified: false,
    website: 'opqlogistics.example', location: 'Chennai, Tamil Nadu',
    description: 'Regional freight and warehousing.',
  },
  {
    id: 'rst', bidId: 'BID-BUS-00477', name: 'RST Security Services', kind: 'organization',
    roles: ['Contractor to ABC', 'BID Member', 'Employer'],
    isCustomer: false, isMember: true, verified: false,
    website: 'rstsecurity.example', location: 'Bengaluru, Karnataka',
    description: 'Manned guarding and facility security services.',
  },
  { id: 'ravi', bidId: 'BID-PER-•••••', name: 'Ravi Kumar', kind: 'person', roles: ['Employee of XYZ'], isCustomer: false, isMember: true, verified: true },
  { id: 'anil', bidId: 'BID-PER-•••••', name: 'Anil Sharma', kind: 'person', roles: ['Candidate at ABC'], isCustomer: false, isMember: true, verified: false },
  { id: 'priya', bidId: 'BID-PER-•••••', name: 'Priya Nair', kind: 'person', roles: ['Authorized signatory, XYZ'], isCustomer: false, isMember: true, verified: true },
]

export const ORG_BY_ID = new Map(ORGS.map((o) => [o.id, o]))

export const RELATIONSHIPS: Relationship[] = [
  {
    id: 'rel-abc-xyz', type: 'CONTRACTS', sourceId: 'abc', targetId: 'xyz',
    startDate: '2026-03-14', endDate: null, status: 'Active', risk: 'Low',
    policy: 'ABC Critical Supplier v2.1', verificationStatus: 'VERIFIED · L3 · valid to 14 Mar 2027',
    permissions: ['Verification summary', 'Assessment factors', 'Check-level outcomes', 'Audit trail'],
    contractRef: 'CT-2026-0088',
  },
  {
    id: 'rel-xyz-lmn', type: 'BUYS_FROM', sourceId: 'xyz', targetId: 'lmn',
    startDate: '2026-06-02', endDate: null, status: 'Active', risk: 'Low',
    policy: 'XYZ Standard Supplier v1.0', verificationStatus: 'VERIFIED · L2 · valid to 02 Jun 2027',
    permissions: ['Verification summary', 'Assessment factors'],
    contractRef: 'XYZ-PO-4471',
  },
  {
    id: 'rel-xyz-opq', type: 'USES', sourceId: 'xyz', targetId: 'opq',
    startDate: '2026-07-19', endDate: null, status: 'Prospective', risk: 'Insufficient evidence',
    policy: 'XYZ Standard Supplier v1.0', verificationStatus: 'IN PROGRESS · 4 of 9 checks complete',
    permissions: ['Verification status only'],
    contractRef: '—',
  },
  {
    id: 'rel-lmn-xyz', type: 'SUPPLIES_TO', sourceId: 'lmn', targetId: 'xyz',
    startDate: '2026-06-02', endDate: null, status: 'Active', risk: 'Low',
    policy: 'Mirror of XYZ Standard Supplier v1.0', verificationStatus: 'Counterparty view',
    permissions: ['Own record only'],
    contractRef: 'XYZ-PO-4471',
  },
  {
    id: 'rel-xyz-ravi', type: 'EMPLOYS', sourceId: 'xyz', targetId: 'ravi',
    startDate: '2024-08-01', endDate: null, status: 'Active', risk: 'Low',
    policy: 'XYZ Employee BGV v1.2', verificationStatus: 'VERIFIED · 1 unable to verify',
    permissions: ['Employer-scoped BGV result only'],
    contractRef: 'EMP-2024-0912',
  },
  {
    id: 'rel-abc-rst', type: 'CONTRACTS', sourceId: 'abc', targetId: 'rst',
    startDate: '2026-05-11', endDate: null, status: 'Active', risk: 'Medium',
    policy: 'ABC Site Contractor v1.1', verificationStatus: 'VERIFIED WITH GAPS · 2 credentials expiring',
    permissions: ['Verification summary', 'Worker credential status'],
    contractRef: 'CT-2026-0102',
  },
  {
    id: 'rel-abc-anil', type: 'CONSIDERS', sourceId: 'abc', targetId: 'anil',
    startDate: '2026-08-01', endDate: null, status: 'Prospective', risk: 'Insufficient evidence',
    policy: 'ABC Candidate BGV — Standard v2.0', verificationStatus: 'CONSENT PENDING',
    permissions: ['Nothing until consent is granted'],
    contractRef: '—',
  },
  {
    id: 'rel-xyz-priya', type: 'REPRESENTED_BY', sourceId: 'xyz', targetId: 'priya',
    startDate: '2023-04-01', endDate: null, status: 'Active', risk: 'Low',
    policy: 'Authorized signatory verification', verificationStatus: 'VERIFIED · L2',
    permissions: ['Signatory authority confirmation'],
    contractRef: 'BR-2023-11',
  },
]

/** §16 — the vendor verification campaign. */
export const CAMPAIGN = {
  id: 'BID-CAMP-4471902',
  name: 'Q3 Critical Supplier Onboarding',
  owner: 'ABC Technologies',
  policy: 'ABC Critical Supplier v2.1',
  created: '2026-08-01',
  stats: { invited: 10, registered: 8, completed: 6, pending: 1, exception: 1 },
  members: [
    { name: 'XYZ HR Consultants', bidId: 'BID-BUS-00231', status: 'COMPLETED', assessment: 'LOW RISK', level: 'L3', lastVerified: '15 Aug 2026', monitoring: 'Active — 6 signals', checks: { passed: 12, total: 12, exceptions: 0 } },
    { name: 'LMN Components', bidId: 'BID-BUS-00318', status: 'COMPLETED', assessment: 'LOW RISK', level: 'L2', lastVerified: '12 Aug 2026', monitoring: 'Active — 4 signals', checks: { passed: 11, total: 12, exceptions: 0 } },
    { name: 'RST Security Services', bidId: 'BID-BUS-00477', status: 'COMPLETED', assessment: 'MEDIUM RISK', level: 'L2', lastVerified: '10 Aug 2026', monitoring: 'Active — 5 signals', checks: { passed: 10, total: 12, exceptions: 0 } },
    { name: 'Meridian Tooling', bidId: 'BID-BUS-00501', status: 'COMPLETED', assessment: 'LOW RISK', level: 'L3', lastVerified: '09 Aug 2026', monitoring: 'Active — 6 signals', checks: { passed: 12, total: 12, exceptions: 0 } },
    { name: 'Kaveri Packaging', bidId: 'BID-BUS-00522', status: 'COMPLETED', assessment: 'INSUFFICIENT EVIDENCE', level: 'L2', lastVerified: '08 Aug 2026', monitoring: 'Active — 3 signals', checks: { passed: 9, total: 12, exceptions: 0 } },
    { name: 'Nandi Industrial', bidId: 'BID-BUS-00534', status: 'COMPLETED', assessment: 'LOW RISK', level: 'L2', lastVerified: '07 Aug 2026', monitoring: 'Active — 4 signals', checks: { passed: 11, total: 12, exceptions: 0 } },
    { name: 'OPQ Logistics', bidId: 'BID-BUS-00402', status: 'PENDING', assessment: '—', level: '—', lastVerified: '—', monitoring: 'Not started', checks: { passed: 4, total: 9, exceptions: 0 } },
    { name: 'Deccan Fabricators', bidId: 'BID-BUS-00548', status: 'EXCEPTION', assessment: 'EXCEPTION', level: 'L1', lastVerified: '06 Aug 2026', monitoring: 'Suspended', checks: { passed: 8, total: 12, exceptions: 1 } },
    { name: 'Sahyadri Chem', bidId: '—', status: 'REGISTERED', assessment: '—', level: '—', lastVerified: '—', monitoring: 'Not started', checks: { passed: 0, total: 12, exceptions: 0 } },
    { name: 'Tungabhadra Steel', bidId: '—', status: 'INVITED', assessment: '—', level: '—', lastVerified: '—', monitoring: 'Not started', checks: { passed: 0, total: 12, exceptions: 0 } },
  ],
  exceptionDetail: 'Deccan Fabricators — GST registration status returned CANCELLED. Required check failed. Referred to compliance; site onboarding blocked pending review.',
}

/** §4 — KPI cards. Demo numbers only. */
export const KPIS = [
  { label: 'Organizations', value: '12,480', delta: '+318 this month', facet: 'business' as const },
  { label: 'People', value: '38,214', delta: '+1,204 this month', facet: 'people' as const },
  { label: 'Relationships', value: '21,067', delta: '+552 this month', facet: 'network' as const },
  { label: 'Verification Requests', value: '46,930', delta: '+2,118 this month', facet: 'verification' as const },
  { label: 'Policies', value: '742', delta: 'across 118 tenants', facet: 'trust' as const },
  { label: 'Providers', value: '24', delta: '12 categories', facet: 'providers' as const },
  { label: 'Credentials', value: '9,845', delta: '412 expiring in 30d', facet: 'monitoring' as const },
  { label: 'Customers', value: '118', delta: '+9 this month', facet: 'revenue' as const },
]
