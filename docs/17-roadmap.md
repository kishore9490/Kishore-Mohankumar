# 17 · Roadmap & Build Sequence

## 17.1 Sequencing principle

Build in the order that lets you *sell*, not the order that feels architecturally complete.

The temptation is to build the entity graph, the policy engine, the orchestration layer and the assessment framework properly before showing anyone anything — and to emerge eighteen months later with an elegant platform and no customers. Resist it.

**The exception:** four things must be right from the first line of code, because retrofitting them is prohibitively expensive:

1. **The entity/relationship model** ([§02](02-entity-model.md)) — a flat schema cannot become a graph later
2. **Tenant isolation** ([§11.5](11-privacy-security.md#115-security-architecture)) — bolting this on afterwards is how data breaches happen
3. **Immutable evidence and audit logging** ([§02.4](02-entity-model.md#24-attributes-and-evidence)) — an audit trail that begins in month twelve is not an audit trail
4. **Policy versioning** ([§04.6](04-policy-engine.md#46-policy-lifecycle)) — un-versioned policies destroy the audit-grade claim permanently

Everything else can be crude at first.

## 17.2 Phase 0 — Foundation (months 0–3)

**Goal: prove the problem is real and the economics work, before building much.**

| Track | Work |
|---|---|
| **Commercial** | 30 discovery conversations. 200-company target list. 3 design partners identified. |
| **Provider** | **Obtain real quotations for the top 10 checks.** Negotiate caching/reuse rights ([§05.7](05-provider-orchestration.md#57-reuse-and-caching--the-margin-engine)). Re-run the model ([§13](13-unit-economics.md)). |
| **Legal ⚖** | Engage counsel on the DPDP role question, credit-information restrictions, AA participation, identity-verification routes ([§11.3](11-privacy-security.md#113-the-dpdp-question--counsel), [§18.2](18-risks-and-open-questions.md)). |
| **Product** | Entity model, tenancy, evidence store, audit log, policy schema. No UI polish. |
| **Team** | Founder + 2–3 engineers + 1 ops/verification lead. |

**Gate to Phase 1:** three signed paid pilots, real provider costs in the model, and a clear legal answer on what BID may and may not do. **If provider costs make the target margins impossible, reprice or re-scope now** — not after launch.

## 17.3 Phase 1 — The vendor wedge (months 3–9)

**Goal: one wedge, done properly, with paying customers.**

**Build:**
- Verification policy engine — configurable requirements, conditions, thresholds, expiry, versioning
- Campaign workflow — create, invite, track, chase, complete
- **Vendor-facing verification flow** — mobile-first, save-and-resume, regional languages. *Disproportionate effort goes here; it is the single point of failure for the whole model.*
- Provider orchestration for the top 10–12 business checks, with fallback and normalization
- Verification record, evidence store, audit trail, export
- Buyer dashboard — campaign status, exceptions, entity view
- Explainable assessment (bands + factors, no numeric index yet)
- BID ID and basic public profile
- Consent artifacts and the disclosure tiers

**Do not build yet:** BGV, workforce, monitoring, API, integrations, BID Card design polish, numeric index, mobile apps.

**Gate to Phase 2:** two pilots converted to annual contracts, vendor completion rate >75%, and measured cost per verification within 25% of model.

## 17.4 Phase 2 — Continuity & workforce (months 9–15)

**Goal: convert transactions into subscriptions, and open the second budget.**

**Build:**
- **Continuous monitoring** — signal watching, alerting, re-verification scheduling. *The retention engine; also the first genuinely differentiated capability.*
- Re-verification workflows and policy drift reporting
- **Contractor workforce module** — two-layer model, bulk worker submission, credential expiry tracking, site-access status ([§03.7](03-verification-catalog.md#37-contractor--third-party-workforce-verification))
- Digital BID Card and the full public profile
- Authorized verification request flow with consent management
- Reuse engine — freshness, scope, consent and provider-terms gates
- Basic API (read) and webhooks

**Critical:** the workforce module must be architected for **batch, low-touch operation** from the start. At ₹199–₹499 per worker with ₹48 of per-verification overhead, a per-worker support model loses money ([§13.4](13-unit-economics.md#134-the-three-findings-that-matter)). Design the operational path before writing the code.

**Gate to Phase 3:** 10+ paying customers, monitoring attached to >50% of them, workforce module live at two sites, net revenue retention trending above 110%.

## 17.5 Phase 3 — People & platform (months 15–24)

**Goal: complete the entity coverage and open the channel.**

**Build:**
- Employee and candidate BGV — packages, consent flows, candidate portal, **dispute workflow**
- Manual verification operations tooling — the analyst workbench that makes people-side checks efficient
- Automation of the expensive manual checks: statutory employment history, digital education verification, direct issuer integrations. *This is the margin roadmap ([§13.6](13-unit-economics.md#136-cost-concentration--where-to-attack)).*
- Full API, partner sandbox, developer documentation
- ERP and HRMS integrations for the two most-requested systems
- SSO/SAML, advanced RBAC, enterprise admin
- Numeric credibility index — **only if** all seven conditions in [§09.5](09-risk-assessment.md#95-if-a-numeric-index-is-published) can be met
- ISO 27001 certification; SOC 2 Type II underway

**Gate to Phase 4:** 40+ customers, three sectors referenced, reuse rate >25%, gross margin >70% blended.

## 17.6 Phase 4 — Network & scale (months 24+)

- Regional expansion beyond Karnataka, following category density rather than geography alone
- Partner channel at scale, with enablement and deal registration
- Marketplace/platform integrations
- Sector policy template library as a productized asset
- Advanced risk analytics — within the ML boundaries of [§09.7](09-risk-assessment.md#97-where-machine-learning-is-legitimate)
- Cross-border entity coverage, if customer demand justifies the complexity

## 17.7 What each phase must never compromise

| Phase | Non-negotiable |
|---|---|
| 0 | Legal clarity before building anything that depends on restricted data |
| 1 | Vendor-side experience quality; policy versioning; audit trail integrity |
| 2 | Batch economics for workforce; consent architecture correctness |
| 3 | The candidate dispute workflow; the person-data boundaries in [§11.7](11-privacy-security.md#117-things-bid-must-never-do) |
| 4 | The verified/unverified distinction; no black-box scoring; no relationship-graph leakage |

## 17.8 Team shape

| Phase | Engineering | Ops / verification | GTM | Other |
|---|---|---|---|---|
| 0 | 2–3 | 1 | Founder | — |
| 1 | 4–6 | 2 | Founder + 1 | — |
| 2 | 8–10 | 4–6 | 2–3 | Compliance lead |
| 3 | 12–16 | 8–12 | 5–8 | Legal, security, CS |
| 4 | 20+ | Scaling with volume | Scaling | Partner team |

**The ops/verification function is not overhead.** It handles exceptions, disposition, manual checks, assisted vendor onboarding and quality control — and it is where the cost model lives or dies. Hire an experienced verification operations lead early; the domain knowledge is real and not obtainable from a job description.

**Organizational rule from [§11.7](11-privacy-security.md#117-things-bid-must-never-do):** the person who owns assessment integrity must not report to the person who owns the revenue number. Set this up while the company is small enough that it costs nothing.

## 17.9 Funding shape

*Indicative, not a plan — final numbers depend on the Phase 0 cost validation.*

| Stage | Purpose | Milestone to raise on |
|---|---|---|
| **Seed** | Phases 0–1 | Design-partner pilots, validated unit economics, legal clarity |
| **Series A** | Phases 2–3 | 10+ paying customers, NRR >110%, monitoring attach rate, proven wedge |
| **Series B** | Phase 4 | Network density evidence, reuse rate, multi-sector references |

The Series A story is **not** "we built a verification platform" — it is **"we found a wedge that reliably converts, and every customer brings us 200 vendors."** Instrument the network metrics from day one so that story is provable with data rather than asserted.
