# 02 · Entity & Relationship Model

The single most important architectural decision in BID Trust:

> **Model relationships and entities. Never model industries.**

An industry-shaped data model produces an industry-shaped product, and every new sector becomes a rewrite. A relationship-shaped model makes sector differences a matter of *policy configuration* — which is the whole domain-agnostic thesis.

## 2.1 The five primitives

```
ENTITY ──── has ────► ATTRIBUTE ──── proven by ────► EVIDENCE
   │                                                     ▲
   │                                                     │
   └──── participates in ────► RELATIONSHIP              │
                                    │                    │
                                    └── governed by ──► POLICY
                                                         │
                                              produces ──┘
                                                    VERIFICATION
```

Everything in the platform is one of: **Entity**, **Relationship**, **Attribute**, **Evidence**, **Verification**. Policies, campaigns, consents and credentials are compositions of these.

## 2.2 Entities

### Business entities

| Type | Notes |
|---|---|
| Private / Public Limited Company | CIN-anchored, MCA-verifiable |
| Partnership Firm | Registration varies by state |
| Limited Liability Partnership | LLPIN-anchored |
| Sole Proprietorship | **Hardest case.** No corporate registry identity; identity rests on the proprietor plus GST/Udyam/bank. Requires its own verification pathway — do not treat as a degenerate company. |
| Hindu Undivided Family (HUF) | PAN-anchored, rare but real in trading |
| Trust / Society / Section 8 | Relevant for healthcare, education, NGO procurement |
| Government body / PSU | Different verification logic entirely; usually exempt from most checks |
| Foreign entity | Out of scope for v1; design the schema so it is not blocked forever |

**Critical design point:** *Supplier*, *vendor*, *distributor*, *partner*, *contractor company* and *service provider* are **not entity types**. They are **relationship roles**. XYZ Components is one business entity; it is a *supplier* to ABC and a *customer* of PQR simultaneously. Modelling "supplier" as an entity type duplicates records and destroys reusability — the exact thing BID exists to create.

### Person entities

| Type | Notes |
|---|---|
| Employee | Current relationship with an employer entity |
| Candidate | Pre-employment; heightened consent obligations |
| Contractor worker | Employed by a contractor company, working at a principal's site |
| Consultant / professional | Often also a proprietorship business entity |
| Technician / skilled worker | Certification- and licence-heavy |
| Authorized representative | Acts *for* a business entity — signatory authority matters |
| Director / partner / owner | Linked to a business entity by a governance relationship |

Same rule: *candidate* and *employee* are **relationship states**, not different people. A candidate who is hired must not become a second person record.

### Documents & credentials

Certificates, licences, registrations, qualifications, compliance documents, insurance policies, training records, test reports.

A **credential** in BID is not a file. It is a structured object:

```
credential_id      BID-CRED-77120043
holder             BID-BUS-100821
type               ISO_9001_2015
issuer             <certification body entity>
identifier         CERT-IN-2024-88213
issued_on          2024-03-01
valid_until        2027-02-28
verification_level L3 — Corroborated (issuer-confirmed)
evidence           [BID-EVD-…, BID-EVD-…]
status             ACTIVE | EXPIRING | EXPIRED | REVOKED | DISPUTED
```

The file is *evidence supporting* the credential. This separation is what makes expiry monitoring, renewal alerts and revocation possible — none of which work if you only store PDFs.

## 2.3 Relationships

The relationship is the unit of verification, because it carries the **purpose** — and purpose is what makes data collection lawful, proportionate and explainable.

```
RELATIONSHIP
  id                BID-REL-XXXXXXXX
  from_entity       BID-BUS-100455   (ABC Company)
  to_entity         BID-BUS-100821   (XYZ Components)
  type              SUPPLIES_TO
  purpose           "Critical raw material supply — direct production input"
  policy            BID-POL-0031  (ABC Critical Supplier v2.1)
  status            PROSPECTIVE | ACTIVE | SUSPENDED | TERMINATED
  criticality       CRITICAL | HIGH | STANDARD | LOW
  started_on        2026-08-15
  next_review       2027-08-15
  verification      BID-VER-88123
```

### Relationship types

```
ABC ──EMPLOYS──────────► Ravi                    (person)
ABC ──CONSIDERS─────────► Priya                   (candidate)
ABC ──BUYS_FROM─────────► XYZ Components          (supplier)
ABC ──CONTRACTS─────────► DEF Services            (contractor company)
ABC ──PARTNERS_WITH─────► GHI Ventures            (business partner)
ABC ──USES──────────────► LMN Technologies        (service provider)
ABC ──DISTRIBUTES_VIA───► PQR Traders             (distributor)
ABC ──ENGAGES───────────► Suresh                  (consultant)

DEF ──EMPLOYS───────────► Worker #1..#50          (contractor's workforce)
ABC ──HOSTS_WORKER──────► Worker #1..#50          (site access relationship)

XYZ ──GOVERNED_BY───────► Director A, Director B  (governance)
XYZ ──REPRESENTED_BY────► Anil (authorized signatory)
XYZ ──HOLDS─────────────► ISO 9001 credential
```

### Why this unlocks everything

**Two-hop risk.** The contractor workforce case is a chain: `ABC → CONTRACTS → DEF → EMPLOYS → Worker`. ABC has a legitimate interest in the worker's identity and safety certification but does not employ them. A relationship graph expresses this natively. A flat "vendors table + employees table" schema cannot, and this is precisely where the highest-value, least-served enterprise pain sits ([§03.4](03-verification-catalog.md)).

**Reuse.** XYZ is verified once as an entity. Its relationship to ABC and its future relationship to DEF are separate objects referencing the same verified entity. That is the reusable-profile mechanism in one sentence.

**Purpose limitation.** Each relationship carries a stated purpose. Data collected under it is scoped to that purpose — the technical implementation of a legal principle, and a real defence under DPDP.

**Policy attachment.** Policy binds to the relationship, not the entity. The same vendor can be *Standard* for ABC and *Critical* for DEF, verified to different depths, with no conflict.

## 2.4 Attributes and evidence

An **Attribute** is a claim about an entity. Every attribute carries its own verification state — this is what prevents a false binary of "verified company / unverified company".

```
ATTRIBUTE
  entity            BID-BUS-100821
  key               gst_registration
  value             29AABCX1234M1ZP
  status            VERIFIED
  source_class      S1 — Authoritative registry
  method            GST registry lookup via authorized channel
  verified_at       2026-08-15T14:22:00+05:30
  valid_until       2027-08-15
  confidence        HIGH
  evidence          [BID-EVD-9912004]
  monitored         true
```

An **Evidence** record is immutable and content-addressed:

```
EVIDENCE
  id                BID-EVD-9912004
  type              PROVIDER_RESPONSE | DOCUMENT | ATTESTATION | FIELD_REPORT
  content_hash      sha256:9f2c…            ← integrity
  provider          <provider entity>
  captured_at       2026-08-15T14:22:00+05:30
  retention_until   2033-08-15               ← retention policy applied at write time
  access_scope      [tenants permitted to view]
  sensitivity       PUBLIC | RESTRICTED | SENSITIVE | HIGHLY_SENSITIVE
```

Evidence is written once, never edited, hashed for tamper-evidence, classified for sensitivity at capture, and stamped with its retention clock at creation rather than at deletion time. Sensitivity classification at capture is what makes minimum-necessary-disclosure enforceable by the system instead of by discipline.

## 2.5 Verification levels

A single vocabulary, used identically for businesses, people and credentials. This is what "verification level" means everywhere in the product.

| Level | Name | Meaning |
|---|---|---|
| **L0** | Claimed | Entity asserted it. No verification. Never displayed as verified. |
| **L1** | Registered | Existence confirmed and control of a channel proven (email/phone/domain). |
| **L2** | Source Verified | Confirmed against an authoritative source — registry, issuer, regulated intermediary. |
| **L3** | Corroborated | Multiple independent sources agree **and** control is proven (e.g. bank account ownership confirmed by a credit-into-account check, not just a document). |
| **L4** | Assured | L3 plus human/physical assurance — site visit, in-person verification, direct issuer confirmation, enhanced due diligence. |

Rules:
- Level is per-attribute; entity level is the **weakest required** attribute, never an average. Averaging hides gaps, and hidden gaps are how a verification platform gets someone hurt.
- Level decays with time according to policy freshness rules.
- **Level never expresses risk.** An L4-verified entity can be high risk. Verification depth and risk assessment are orthogonal axes and must never be collapsed into one badge.

## 2.6 Tenancy

```
TENANT (enterprise customer)
  ├── Users, roles, permissions
  ├── Policies
  ├── Campaigns
  ├── Relationships          ← tenant-owned, private
  └── Verification requests  ← tenant-owned, private

GLOBAL ENTITY GRAPH
  ├── Business entities      ← shared, deduplicated
  ├── Person entities        ← shared only under explicit consent
  ├── Verified attributes    ← shared under consent + freshness rules
  └── Evidence               ← never shared by default
```

The hard architectural line: **entities are global, relationships are tenant-private.** ABC must never be able to discover who else buys from XYZ. Supplier relationships are commercially sensitive; a single leak of that graph would be an extinction-level trust event for BID.

Person entities warrant a stronger rule still: a person's record is shared across tenants **only** with that person's specific consent for that specific purpose. BID must never become a searchable database of people's employment and background histories. See [§11 Privacy & Security](11-privacy-security.md).

## 2.7 Entity resolution

Making entities global requires deduplication — and getting it wrong is dangerous in both directions. Merging two real companies is a catastrophic data breach between unrelated parties; splitting one company into duplicates destroys the reuse economics.

**Deterministic keys (safe to merge on):** CIN, LLPIN, PAN, GSTIN, Udyam registration number.

**Probabilistic signals (never auto-merge on alone):** legal name, trade name, registered address, domain, director overlap, phone/email.

**Rules:**
1. Auto-merge only on an exact match of a strong government identifier plus one corroborating signal.
2. Everything else goes to a human-reviewed merge queue.
3. Every merge is reversible, logged, and attributed to an actor.
4. Never auto-merge person entities. Ever. Names collide constantly in India, and the consequences of merging two people's background records are severe and irreversible in reputational terms.

## 2.8 Model summary

| Object | Prefix | Scope |
|---|---|---|
| Business entity | `BID-BUS-` | Global |
| Person entity | `BID-PER-` | Global, consent-gated |
| Relationship | `BID-REL-` | Tenant-private |
| Verification | `BID-VER-` | Tenant-scoped, reusable under consent |
| Credential | `BID-CRED-` | Entity-owned, shareable |
| Evidence | `BID-EVD-` | Restricted |
| Policy | `BID-POL-` | Tenant-owned |
| Campaign | `BID-CAMP-` | Tenant-owned |
| Request | `BID-REQ-` | Tenant ↔ entity |
| Consent | `BID-CON-` | Entity-owned |

See [§06 BID ID Architecture](06-bid-id-architecture.md) for the identifier scheme itself.
