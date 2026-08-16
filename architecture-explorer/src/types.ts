/** Shared domain types for the architecture explorer. */

/** Cross-cutting concerns used by the global filter bar (§29). */
export type Facet =
  | 'business'
  | 'people'
  | 'verification'
  | 'trust'
  | 'data'
  | 'security'
  | 'revenue'
  | 'lifecycle'
  | 'network'
  | 'apis'
  | 'providers'
  | 'monitoring'

/** Detail levels for the zoom control (§30). */
export type ZoomLevel = 'executive' | 'system' | 'service' | 'data' | 'infrastructure'

export type NodeTone =
  | 'primary'
  | 'brand'
  | 'verify'
  | 'caution'
  | 'adverse'
  | 'neutral'
  | 'external'

/**
 * The drawer payload (§6). Every clickable architecture component resolves to
 * one of these, so the drawer has a single shape regardless of what was clicked.
 */
export interface ArchComponent {
  id: string
  name: string
  layer: string
  purpose: string
  responsibilities: string[]
  inputs: string[]
  outputs: string[]
  dependencies: string[]
  dataHandled: string[]
  security: string[]
  events: string[]
  apis: string[]
  related: string[]
  facets: Facet[]
  /** Lowest zoom level at which this component appears. */
  minZoom: ZoomLevel
  tone?: NodeTone
}

export interface ArchLayer {
  id: string
  index: number
  name: string
  caption: string
  tone: NodeTone
  componentIds: string[]
}

/** Customer lifecycle stage (§8) — positive and negative paths. */
export interface LifecycleStage {
  id: string
  name: string
  track: 'growth' | 'risk' | 'recovery'
  definition: string
  whatHappens: string[]
  whoIsInvolved: string[]
  productActions: string[]
  billingState: string
  permissions: string[]
  dataState: string[]
  nextStates: string[]
}

export interface Relationship {
  id: string
  type: string
  sourceId: string
  targetId: string
  startDate: string
  endDate: string | null
  status: 'Active' | 'Prospective' | 'Suspended' | 'Terminated'
  risk: 'Low' | 'Medium' | 'High' | 'Insufficient evidence'
  policy: string
  verificationStatus: string
  permissions: string[]
  contractRef: string
}

export interface OrgNode {
  id: string
  bidId: string
  name: string
  kind: 'organization' | 'person'
  roles: string[]
  isCustomer: boolean
  isMember: boolean
  verified: boolean
  website?: string
  description?: string
  location?: string
}

export interface PolicyCheck {
  id: string
  name: string
  requirement: 'REQUIRED' | 'OPTIONAL'
  minLevel: 'L1' | 'L2' | 'L3' | 'L4'
  sourceClass: string
}

export interface PolicySection {
  id: string
  name: string
  checks: PolicyCheck[]
}

export interface PipelineStep {
  id: string
  name: string
  purpose: string
  owner: string
  inputs: string[]
  outputs: string[]
  sampleData: Record<string, unknown>
  failureModes: string[]
}

export interface DataEntity {
  id: string
  name: string
  group: string
  purpose: string
  keyFields: string[]
  relationships: string[]
  classification: 'PUBLIC' | 'RESTRICTED' | 'SENSITIVE' | 'HIGHLY SENSITIVE'
  retention: string
}

export interface ApiEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  summary: string
  purpose: string
  auth: string
  permissions: string[]
  request?: Record<string, unknown>
  response: Record<string, unknown>
  events: string[]
}

export interface DomainEvent {
  id: string
  name: string
  producer: string
  description: string
  consumers: string[]
  payload: Record<string, unknown>
  facets: Facet[]
}

export interface Adr {
  id: string
  title: string
  status: 'Accepted'
  context: string
  decision: string
  consequences: string[]
  alternatives: { option: string; why: string }[]
}

export interface Industry {
  id: string
  name: string
  policy: string
  relationshipTypes: string[]
  distinctiveChecks: string[]
  note: string
}

export interface StoryStep {
  n: number
  actor: string
  title: string
  detail: string
  /** Node ids that should be visible/highlighted at this step. */
  activeNodes: string[]
  /** Edge ids to animate at this step. */
  activeEdges: string[]
  stageId?: string
  billing?: string
}
