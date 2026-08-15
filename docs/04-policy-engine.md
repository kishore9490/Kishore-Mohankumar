# 04 · Verification Policy Engine

The policy engine is what makes BID domain-agnostic. It is the most important component in the product and the hardest one to retrofit — build it properly first, or the platform quietly becomes an industry-specific tool.

## 4.1 The principle

> **Never hardcode verification requirements by industry.**

A healthcare vendor policy, a construction contractor policy and an IT employee BGV policy are the *same object with different configuration*. If any of those requires a code change, the architecture has failed.

```
        ┌──────────── ONE ENGINE ────────────┐
        │  Policy · Orchestration · Evidence │
        │  Assessment · Consent · Audit      │
        └────────────────┬───────────────────┘
                         │
    ┌──────────┬─────────┼─────────┬──────────┐
Healthcare  Construction  IT   Logistics   Pharma
  policy      policy    policy   policy    policy
```

Sector expertise ships as **policy templates**, not as product forks. Templates are the productized form of domain knowledge, and they are a defensible asset — the accumulated judgment of what a critical pharma supplier actually needs to prove is worth more than any single API integration.

## 4.2 Anatomy of a policy

```yaml
policy:
  id: BID-POL-0031
  name: "Critical Supplier"
  version: 2.1
  applies_to: BUSINESS
  relationship_types: [SUPPLIES_TO, CONTRACTS]
  owner_tenant: BID-TEN-000455
  status: ACTIVE
  effective_from: 2026-08-01

  requirements:
    identity:
      - check: CORPORATE_IDENTITY   requirement: REQUIRED  min_level: L2
      - check: PAN_VERIFICATION     requirement: REQUIRED  min_level: L2
      - check: GST_REGISTRATION     requirement: REQUIRED  min_level: L2
        conditions: [entity.gst_applicable == true]
      - check: UDYAM_REGISTRATION   requirement: OPTIONAL  min_level: L2
      - check: REGISTERED_ADDRESS   requirement: REQUIRED  min_level: L2

    financial:
      - check: BANK_ACCOUNT_OWNERSHIP requirement: REQUIRED min_level: L3
      - check: TURNOVER_VERIFICATION  requirement: REQUIRED min_level: L2
        conditions: [contract.annual_value > 5000000]

    ownership:
      - check: DIRECTORS              requirement: REQUIRED  min_level: L2
      - check: DIRECTOR_DISQUALIFICATION requirement: REQUIRED min_level: L2
      - check: BENEFICIAL_OWNERSHIP   requirement: REQUIRED  min_level: L2
      - check: RELATED_PARTY_SCREENING requirement: REQUIRED min_level: L2

    compliance:
      - check: ISO_9001               requirement: REQUIRED  min_level: L3
      - check: CATEGORY_LICENCE       requirement: CONDITIONAL min_level: L2
        conditions: [category in [CHEMICALS, FOOD, PHARMA]]

    risk:
      - check: SANCTIONS_SCREENING    requirement: REQUIRED  min_level: L2
      - check: LITIGATION_SCREENING   requirement: REQUIRED  min_level: L2
      - check: ADVERSE_MEDIA          requirement: OPTIONAL  min_level: L2

  thresholds:
    auto_approve:   assessment == LOW    and exceptions == 0
    manual_review:  assessment == MEDIUM or  exceptions > 0
    escalate:       assessment == HIGH
    block:          sanctions_match == CONFIRMED or entity_status == STRUCK_OFF

  freshness:
    default_validity: 365d
    per_check:
      SANCTIONS_SCREENING:   30d
      GST_REGISTRATION:      90d
      BANK_ACCOUNT_OWNERSHIP: 180d
    reuse_accepted_from_network: true
    max_age_for_reuse: 180d

  monitoring:
    enabled: true
    watch: [GST_STATUS, ENTITY_STATUS, DIRECTOR_CHANGE,
            SANCTIONS, CREDENTIAL_EXPIRY, LITIGATION]
    alert_to: [procurement_owner, compliance_team]

  approvals:
    - stage: COMPLIANCE_REVIEW  when: manual_review  sla: 3d
    - stage: CATEGORY_HEAD      when: escalate       sla: 5d
    - stage: CFO                when: contract.annual_value > 50000000

  escalation:
    on_sla_breach: notify_manager, then notify_head after 2d

  disclosure:
    buyer_receives:
      - verification_status
      - verification_level
      - assessment_and_factors
      - check_level_outcomes
      - validity_dates
      - audit_trail
    buyer_receives_on_consent:
      - financial_detail
      - ownership_detail
      - underlying_documents
    buyer_never_receives:
      - raw_banking_transaction_data
      - personal_data_beyond_stated_purpose
```

## 4.3 The six configurable dimensions

Enterprises must be able to define all six without engineering involvement:

| Dimension | Controls |
|---|---|
| **Required checks** | What must pass for the entity to be verified |
| **Optional checks** | Collected if available, never blocking |
| **Risk thresholds** | Which assessment bands auto-approve, review, escalate or block |
| **Verification frequency** | Re-verification cadence per relationship criticality |
| **Expiry periods** | Per-check validity, and maximum age accepted for network reuse |
| **Approval & escalation rules** | Who signs off, at what value, within what SLA, and what happens when it breaches |

## 4.4 Conditional logic

Conditions are what prevent a combinatorial explosion of near-identical policies. One "Supplier" policy with conditions beats fifteen hand-maintained variants that drift apart within a year.

Conditions evaluate against:

- **Entity facts** — entity type, GST applicability, MSME status, age of incorporation, state
- **Relationship facts** — criticality, contract value, category, site access, data access
- **Prior results** — escalate depth when a risk signal appears
- **Buyer context** — business unit, geography, regulatory exposure

```
IF contract_value > ₹50L            THEN require turnover verification
IF category IN (chemicals, pharma)  THEN require category licence
IF site_access == true              THEN require worker-level verification
IF handles_personal_data == true    THEN require security certification
IF entity_type == PROPRIETORSHIP    THEN substitute proprietor identity
                                         for corporate identity
IF sanctions_match == POTENTIAL     THEN escalate to enhanced due diligence
IF vendor_country != IN             THEN apply cross-border policy
```

That fifth rule matters more than it looks. Proprietorships have no corporate registry identity, and a policy engine that cannot gracefully substitute an alternative verification path will simply fail on a large share of the Indian supplier base.

## 4.5 Policy templates shipped by BID

BID ships a curated library. Customers clone and adapt — they never start from a blank page, because a blank policy page produces either an unusable policy or an abandoned trial.

**By relationship depth (industry-neutral, the true defaults):**
- Basic Supplier · Standard Supplier · Critical Supplier · High-Risk Vendor
- Employee BGV · Executive BGV · Contractor Worker · Consultant
- Distributor · Service Provider · Channel Partner

**By sector (illustrative starting points, requiring customer and expert review):**
- Healthcare Vendor · Pharma Supplier · IT/Software Vendor · Construction Contractor
- Logistics Provider · Facility Management · Food & Beverage Supplier
- Financial Services Vendor · Government Contractor · Manufacturing Supplier

**By obligation (the ones that sell themselves):**
- Data-processor vendor (privacy/security exposure)
- Site-access contractor (safety and statutory exposure)
- High-value payment counterparty (payment-fraud exposure)
- Export supply chain (customer-imposed diligence obligations)

Sector templates must carry a visible disclaimer: they are starting points, not compliance guarantees, and the customer's own counsel owns the final requirement set.

## 4.6 Policy lifecycle

```
DRAFT → REVIEW → ACTIVE → SUPERSEDED → ARCHIVED
```

**Versioning is mandatory and immutable.** Every verification records the exact policy version it was performed under. When an auditor asks *"what was your standard for critical suppliers in March 2026?"*, the answer must be a retrievable, unaltered object. This is a defining feature of an audit-grade platform and it is nearly impossible to add later.

Changing a policy never silently invalidates completed verifications. Instead:

```
Policy v2.1 → v2.2 adds "cyber insurance verification"

Effect on existing relationships:
  → 214 verified vendors now show GAP: cyber_insurance
  → status remains VERIFIED (v2.1)
  → new flag: POLICY_DRIFT
  → remediation campaign offered, with a deadline the customer sets
```

Policy drift reporting is quietly one of the most valuable outputs in the product: it tells a compliance head exactly how far the vendor base has fallen behind the current standard — a number they usually cannot produce at all today.

## 4.7 Policy outcomes

A policy evaluation produces a structured result, never a bare pass/fail:

```
VERIFIED              all required checks passed at required levels
VERIFIED_WITH_GAPS    required checks passed, optional gaps remain
CONDITIONAL           passed with time-bound conditions (e.g. licence renewal in 60d)
PENDING               in progress
INSUFFICIENT_EVIDENCE required data unavailable — NOT a negative finding
EXCEPTION             a required check failed or produced an adverse result
BLOCKED               a blocking condition triggered
EXPIRED               validity lapsed, re-verification required
```

`INSUFFICIENT_EVIDENCE` deserves emphasis. A small proprietorship with no filed financials and no ISO certificate is not risky — it is *unmeasured*. Collapsing "no data" into "bad" would systematically penalize exactly the MSME segment BID intends to serve, and would make the platform an instrument of exclusion rather than of access. Keep the two states distinct in the data model, the UI and the assessment logic. See [§09](09-risk-assessment.md).

## 4.8 Governance

- **Policy authoring** is a permissioned role, typically compliance or procurement leadership, never every user.
- **Approval workflow** before a policy goes ACTIVE.
- **Change log** — who changed what, when, why, and what the business justification was.
- **Simulation mode** — run a draft policy against the existing vendor base *before* activating it. Answers "how many of my 400 current vendors would fail this new standard?", which is the question that decides whether a compliance head can safely adopt a stricter policy.
- **Policy analytics** — pass rates, failure reasons, average completion time, cost per verification, and vendor drop-off by check. If one required check is where 40% of vendors abandon, the customer needs to know it is that check.
