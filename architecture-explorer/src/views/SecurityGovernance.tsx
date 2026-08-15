import { motion } from 'framer-motion'
import { ShieldAlert, Building2, Users, Lock } from 'lucide-react'
import { COMPONENT_BY_ID } from '@/data/layers'
import { useExplorer } from '@/state/explorer'
import { Note, Panel, SectionHeader, TONE } from '@/components/ui'

/** §23, §24 — security controls and the multi-tenancy model. */

const CONTROLS = [
  { name: 'Authentication', layer: 'Access', component: 'authentication', tone: 'primary' },
  { name: 'SSO', layer: 'Access', component: 'sso', tone: 'primary' },
  { name: 'MFA', layer: 'Access', component: 'authentication', tone: 'primary' },
  { name: 'RBAC', layer: 'Access', component: 'rbac', tone: 'primary' },
  { name: 'ABAC', layer: 'Access', component: 'abac', tone: 'primary' },
  { name: 'Tenant Isolation', layer: 'Access', component: 'tenant-context', tone: 'adverse' },
  { name: 'Rate Limiting', layer: 'Access', component: 'rate-limiting', tone: 'caution' },
  { name: 'API Security', layer: 'Access', component: 'api-gateway', tone: 'primary' },
  { name: 'Consent', layer: 'Governance', component: 'consent-service', tone: 'verify' },
  { name: 'Authorization', layer: 'Governance', component: 'authorization-service', tone: 'verify' },
  { name: 'Data Minimization', layer: 'Governance', component: 'privacy-controls', tone: 'verify' },
  { name: 'Data Retention', layer: 'Governance', component: 'data-retention', tone: 'verify' },
  { name: 'Audit Logging', layer: 'Governance', component: 'audit-service', tone: 'primary' },
  { name: 'Access Governance', layer: 'Governance', component: 'access-governance', tone: 'primary' },
  { name: 'Evidence Integrity', layer: 'Trust', component: 'evidence-service', tone: 'verify' },
  { name: 'Threat Detection', layer: 'Trust', component: 'document-verification', tone: 'caution' },
  { name: 'Encryption', layer: 'Data', component: 'operational-db', tone: 'primary' },
  { name: 'Secrets Management', layer: 'Data', component: 'document-storage', tone: 'primary' },
]

const LAYER_GROUPS = ['Access', 'Governance', 'Trust', 'Data']

const WORKSPACES = [
  { name: 'ABC Workspace', owner: 'ABC Technologies', sees: ['Its own vendor relationships', 'Its own policies and campaigns', 'Verification outcomes it requested'], cannotSee: ['That XYZ also sells to LMN', 'XYZ’s other buyers', 'Any other tenant’s policies'] },
  { name: 'XYZ Workspace', owner: 'XYZ HR Consultants', sees: ['Its own supplier relationships', 'Its own candidate BGV requests', 'Verification outcomes it requested'], cannotSee: ['ABC’s vendor base', 'What ABC’s policy required of it', 'Any other tenant’s data'] },
  { name: 'LMN Workspace', owner: 'LMN Components', sees: ['Nothing yet — member only, no workspace provisioned'], cannotSee: ['Everything requester-side until it activates'] },
]

export default function SecurityGovernance() {
  const { open } = useExplorer()

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1400px]">
      <SectionHeader
        eyebrow="Security & governance"
        title="Where each control sits"
        subtitle="Privacy and security are the product architecture here, not a compliance workstream bolted on before launch. Click any control to see the component that enforces it."
      />

      <div className="space-y-4 mb-9">
        {LAYER_GROUPS.map((layer, li) => (
          <motion.div key={layer} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: li * 0.05, duration: 0.25 }}>
            <Panel>
              <div className="flex items-center gap-2 mb-3">
                <Lock size={13} className="text-navy-600" />
                <p className="eyebrow">{layer} layer</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {CONTROLS.filter((c) => c.layer === layer).map((c) => {
                  const t = TONE[c.tone as keyof typeof TONE]
                  return (
                    <button
                      key={c.name}
                      onClick={() => open({ kind: 'component', id: c.component })}
                      className={`rounded-lg border px-3 py-2 text-[12.5px] font-medium transition-all hover:shadow-sm ${t.chip} ${t.border}`}
                      title={COMPONENT_BY_ID.get(c.component)?.name}
                    >
                      {c.name}
                    </button>
                  )
                })}
              </div>
            </Panel>
          </motion.div>
        ))}
      </div>

      {/* Multi-tenancy */}
      <SectionHeader
        eyebrow="Multi-tenancy"
        title="Organization identity ≠ customer tenant"
        subtitle="This distinction is critical and is the most common thing architects get wrong here. One organization has exactly one identity in the global graph. A workspace is a separate object that controls what a customer can see. XYZ has both — and they are not the same thing."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <Panel>
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={15} className="text-verify-deep" />
            <p className="eyebrow">Organization identity — global</p>
          </div>
          <ul className="space-y-2 text-[13px] text-slate-600">
            {['One record per real-world organization', 'One permanent BID ID', 'Shared, deduplicated across the network', 'Owns its own credentials and consent register', 'Exists whether or not the organization is ever a customer'].map((x) => (
              <li key={x} className="flex gap-2"><span className="mt-[7px] h-1 w-1 rounded-full bg-verify flex-none" />{x}</li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <div className="flex items-center gap-2 mb-3">
            <Users size={15} className="text-navy-700" />
            <p className="eyebrow">Customer tenant / workspace — private</p>
          </div>
          <ul className="space-y-2 text-[13px] text-slate-600">
            {['Created only when an organization becomes a requester', 'Owns policies, campaigns and relationships', 'Strictly isolated from every other workspace', 'Users, roles and entitlements live here', 'Churn deletes the commercial relationship, not the identity'].map((x) => (
              <li key={x} className="flex gap-2"><span className="mt-[7px] h-1 w-1 rounded-full bg-navy-600 flex-none" />{x}</li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        {WORKSPACES.map((w, i) => (
          <motion.div key={w.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.25 }}>
            <Panel className="h-full">
              <p className="text-[13.5px] font-semibold text-navy-850">{w.name}</p>
              <p className="text-[11.5px] text-slate-500 mb-3">{w.owner}</p>
              <p className="eyebrow mb-1.5">Can see</p>
              <ul className="space-y-1 mb-3">
                {w.sees.map((x) => <li key={x} className="text-[12px] text-verify-deep flex gap-2"><span className="mt-[7px] h-1 w-1 rounded-full bg-verify flex-none" />{x}</li>)}
              </ul>
              <p className="eyebrow mb-1.5">Cannot see</p>
              <ul className="space-y-1">
                {w.cannotSee.map((x) => <li key={x} className="text-[12px] text-[#B32D33] flex gap-2"><span className="mt-[7px] h-1 w-1 rounded-full bg-adverse flex-none" />{x}</li>)}
              </ul>
            </Panel>
          </motion.div>
        ))}
      </div>

      <Note tone="adverse">
        <div className="flex gap-2">
          <ShieldAlert size={16} className="flex-none mt-0.5" />
          <span>
            <strong>The relationship-graph rule.</strong> Supplier relationships are commercially
            sensitive, and a leak of that graph between tenants would be an extinction-level trust
            event. This constrains analytics, ML features, "similar companies" suggestions, sales
            tooling, support tooling and every export. Treat any feature that could infer the graph
            as forbidden until proven safe — and make tenant isolation the primary penetration-test
            target.
          </span>
        </div>
      </Note>
    </div>
  )
}
