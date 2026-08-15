/** §20, §21, §27 — revenue, expansion and customer-success data. */

export const PRICING_DISCLAIMER =
  'Illustrative starting prices — final pricing depends on verification scope, provider costs, volume and enterprise requirements. These are not final market prices.'

export const PLANS = [
  { name: 'Starter', price: '₹9,999', period: '/month', from: true, for: 'Small companies, first vendor programme', limits: ['3 policies', '5 users', '50 monitored entities'] },
  { name: 'Growth', price: '₹24,999', period: '/month', from: true, for: 'Growing mid-market, multiple policies', limits: ['10 policies', '15 users', '250 monitored entities', 'Workforce module'] },
  { name: 'Business', price: '₹49,999', period: '/month', from: true, for: 'Established mid-market and enterprise', limits: ['Unlimited policies', '50 users', '1,000 monitored entities', 'API + SSO'] },
  { name: 'Enterprise', price: '₹1,00,000', period: '/month', from: true, for: 'Large enterprise, multi-site, custom SLA', limits: ['Unlimited everything', 'Connectors', 'Dedicated CSM'] },
]

export const REVENUE_LINES = [
  { id: 'subscription', n: 1, name: 'SaaS Subscription', price: 'from ₹9,999/month', type: 'Recurring', note: 'Platform fee — workflow, policy engine, campaigns, audit trail.' },
  { id: 'verification', n: 2, name: 'Verification Usage', price: 'from ₹499/check', type: 'Consumption', note: 'Per business verification, priced by package depth.' },
  { id: 'reverification', n: 3, name: 'Re-verification', price: 'from ₹499', type: 'Consumption', note: 'Discounted against first verification because reuse lowers marginal cost.' },
  { id: 'monitoring', n: 4, name: 'Continuous Monitoring', price: 'from ₹49/entity/month', type: 'Recurring', note: 'Highest-quality revenue — recurring, high margin, low touch.' },
  { id: 'bgv', n: 5, name: 'Candidate BGV', price: 'from ₹499/package', type: 'Consumption', note: 'Person-side verification. Manual checks make this a thinner-margin line.' },
  { id: 'employee', n: 6, name: 'Employee Verification', price: 'from ₹499/package', type: 'Consumption', note: 'Existing workforce verification and periodic re-checks.' },
  { id: 'contractor', n: 7, name: 'Contractor Verification', price: 'from ₹199/worker', type: 'Consumption', note: 'Highest volume line. Requires batch, low-touch operations to work economically.' },
  { id: 'api', n: 8, name: 'API Usage', price: 'from ₹14,999/month + usage', type: 'Recurring + consumption', note: 'For platforms embedding verification.' },
  { id: 'integration', n: 9, name: 'Enterprise Integration', price: 'from ₹2,00,000', type: 'One-time', note: 'Cap at ~10% of revenue — services should land accounts, not become the business.' },
  { id: 'pro', n: 10, name: 'BID Pro (optional)', price: 'from ₹999/month', type: 'Recurring', note: 'Supply-side upsell. Never a toll gate — a member is never required to pay to be verified.' },
]

/** §21 — land and expand. Illustrative annual contribution. */
export const EXPANSION_STEPS = [
  { stage: '10 vendor verifications', arr: 60, workflows: ['Vendor'], note: 'Pilot. One policy, one category, one champion.' },
  { stage: '100 vendors', arr: 300, workflows: ['Vendor'], note: 'Function-wide adoption in procurement.' },
  { stage: '+ Employee verification', arr: 420, workflows: ['Vendor', 'Employee'], note: 'HR budget joins. Same engine, new policy.' },
  { stage: '+ Candidate BGV', arr: 540, workflows: ['Vendor', 'Employee', 'BGV'], note: 'Hiring workflow absorbed.' },
  { stage: '+ Contractor verification', arr: 760, workflows: ['Vendor', 'Employee', 'BGV', 'Workforce'], note: 'Operations and EHS budget — a different wallet entirely.' },
  { stage: '+ Monitoring', arr: 940, workflows: ['Vendor', 'Employee', 'BGV', 'Workforce', 'Monitoring'], note: 'Transaction becomes subscription. Churn drops sharply.' },
  { stage: '+ API', arr: 1120, workflows: ['Vendor', 'Employee', 'BGV', 'Workforce', 'Monitoring', 'API'], note: 'Embedded in customer systems. Switching cost rises.' },
  { stage: 'Enterprise', arr: 1500, workflows: ['All'], note: 'SSO, connectors, custom workflows, dedicated success.' },
]

/** §27 — customer success health signals. */
export const HEALTH_SIGNALS = [
  { signal: 'Login activity', weight: 10, healthy: 'Weekly active users across ≥2 functions', risk: 'Single user, monthly logins' },
  { signal: 'Verification volume', weight: 20, healthy: 'Consistent or growing month on month', risk: 'Two consecutive months below baseline' },
  { signal: 'Policy usage', weight: 10, healthy: '≥2 active policies in use', risk: 'One policy, unchanged since onboarding' },
  { signal: 'API usage', weight: 10, healthy: 'Steady integration traffic', risk: 'Integration built then abandoned' },
  { signal: 'Monitoring usage', weight: 20, healthy: 'Monitoring attached to most verified entities', risk: 'Monitoring never enabled — the strongest churn predictor' },
  { signal: 'Credit utilisation', weight: 15, healthy: '60–90% of purchased credits consumed', risk: 'Large unused balance approaching expiry' },
  { signal: 'Support tickets', weight: 5, healthy: 'Low volume, quickly resolved', risk: 'Repeat escalations on the same theme' },
  { signal: 'Payment status', weight: 10, healthy: 'On time', risk: 'Failed or late payments' },
]

export const HEALTH_STATES = [
  { state: 'New', tone: 'neutral', definition: 'Contract signed, onboarding not complete.' },
  { state: 'Activated', tone: 'primary', definition: 'Workspace configured, first policy authored.' },
  { state: 'Trial', tone: 'primary', definition: 'Evaluating on trial credits.' },
  { state: 'First Value', tone: 'verify', definition: 'First verification completed end to end.' },
  { state: 'Active', tone: 'verify', definition: 'Habitual use in at least one workflow.' },
  { state: 'Expanding', tone: 'verify', definition: 'Adoption spreading across workflows and functions.' },
  { state: 'Healthy', tone: 'verify', definition: 'Strong health score, renewal likely.' },
  { state: 'At Risk', tone: 'caution', definition: 'Health score indicates material churn probability.' },
  { state: 'Dormant', tone: 'caution', definition: 'Paying but effectively unused.' },
  { state: 'Churned', tone: 'adverse', definition: 'Commercial relationship ended. Organization remains a member.' },
  { state: 'Win-back', tone: 'primary', definition: 'Re-engagement in progress.' },
]

/** Demo cohort for the health chart. */
export const HEALTH_DISTRIBUTION = [
  { month: 'Mar', healthy: 42, atRisk: 8, dormant: 3, churned: 1 },
  { month: 'Apr', healthy: 51, atRisk: 9, dormant: 4, churned: 2 },
  { month: 'May', healthy: 63, atRisk: 11, dormant: 4, churned: 2 },
  { month: 'Jun', healthy: 74, atRisk: 12, dormant: 5, churned: 3 },
  { month: 'Jul', healthy: 88, atRisk: 10, dormant: 5, churned: 3 },
  { month: 'Aug', healthy: 96, atRisk: 13, dormant: 6, churned: 4 },
]
