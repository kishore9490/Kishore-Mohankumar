# 11 · Privacy, Security & Compliance Architecture

> **Nothing in this document is legal advice.** It describes an engineering and product posture. Items marked **⚖ COUNSEL** require a qualified Indian data-protection and sector lawyer before launch. See [§18](18-risks-and-open-questions.md) for the consolidated legal open-items list.

BID handles government identifiers, financial data, ownership structures and people's employment and background histories. A breach here is not an inconvenience — it is the end of the company. Privacy and security are not a compliance workstream bolted on before launch; they are the product architecture.

## 11.1 Principles, and how each is enforced in code

| Principle | Enforcement mechanism |
|---|---|
| **Minimum necessary disclosure** | Sensitivity classification at evidence capture; disclosure tiers ([§08](08-consent-and-authorized-view.md)); scope validation on every read |
| **Consent** | Purpose-bound, time-boxed, revocable consent artifacts required for every Tier-2 disclosure |
| **Purpose limitation** | Every relationship and consent carries a purpose; queries outside it are rejected by the authorization layer, not by policy documents |
| **Data minimization** | Verify against an identifier, store the outcome and a token — not the identifier itself, wherever possible |
| **Storage limitation** | Retention clock stamped at write time; automated deletion jobs; retention is a field, not a promise |
| **Access control** | RBAC + attribute-based rules; tenant isolation; per-record scope checks |
| **Encryption** | TLS 1.3 in transit; AES-256 at rest; field-level encryption for sensitive identifiers with separate key custody |
| **Audit logging** | Every read of sensitive data logged with actor, purpose, timestamp, record — append-only |
| **Deletion** | Defined erasure workflows with documented legal-retention exceptions |
| **Tenant isolation** | Enforced at the data layer, not the application layer |
| **Evidence integrity** | Content-addressed hashing; tamper-evident audit chain |

## 11.2 Data classification

Every field carries a classification that drives storage, access, logging, masking and retention automatically. Classification at write time is what makes the other controls enforceable rather than aspirational.

| Class | Examples | Controls |
|---|---|---|
| **PUBLIC** | Company name, CIN, GSTIN, verification status | Standard |
| **RESTRICTED** | Business PAN, addresses, director names, verification detail | Encrypted at rest, access-logged, masked by default |
| **SENSITIVE** | Individual PAN, DOB, bank details, financial data, ownership detail | Field-level encryption, purpose-checked, disclosure-gated, always logged |
| **HIGHLY SENSITIVE** | Background check results, court-record matches, health/medical fitness, biometric-adjacent data | Strictest access, separate storage, short retention, never in analytics, never in logs, never in exports without explicit authorization |

**Segregation:** HIGHLY SENSITIVE data lives in a separate store with independent keys and independent access paths. A compromise of the main application must not yield people's background results. This costs engineering effort and it is worth it.

## 11.3 The DPDP question ⚖ COUNSEL

India's Digital Personal Data Protection Act, 2023 governs personal data. BID's role under it is genuinely non-obvious and must be settled with counsel before launch, because it determines notice obligations, consent architecture, breach duties and liability allocation.

**The ambiguity:**

| Scenario | Plausible role |
|---|---|
| Running a BGV check that ABC instructed, on ABC's stated purpose | BID as **Data Processor**, ABC as Data Fiduciary |
| Maintaining a reusable person profile across buyers | BID arguably a **Data Fiduciary** in its own right |
| Business entity data (company, GST, CIN) | Largely not personal data — but director details are |
| Proprietorship data | Business and personal data are **the same data** — a genuinely hard case |

**Working position, subject to confirmation:** BID acts as Processor for buyer-instructed verification, and as Fiduciary for the reusable profile and its own platform relationship with entities and individuals. Build for the stricter interpretation — dual-role compliance is expensive to retrofit and cheap to design in.

**Capabilities to build regardless of how the question resolves:**
- Notice and consent management with receipts
- Data principal rights: access, correction, erasure, grievance
- A named Grievance Officer with a published, monitored channel and defined turnaround
- Breach notification workflow and runbook
- Consent manager integration readiness
- Processing records: what data, why, from where, to whom, for how long
- Children's data: BID should simply **not process data of individuals under 18** — there is no product need and the compliance burden is severe. Make this an explicit product boundary.

## 11.4 Sector-specific overlays ⚖ COUNSEL

| Domain | Consideration |
|---|---|
| **Credit information** | CICRA 2005 restricts access to credit information to specified users. Do not design assuming access. |
| **Financial data** | Account Aggregator framework — participation requires appropriate standing or a regulated partner. BID is not an NBFC-AA. |
| **Identity authentication** | Aadhaar-based authentication is restricted to permitted entities under the applicable framework. Prefer document-based and DigiLocker-issued alternatives. |
| **Healthcare customers** | Their own patient-data obligations flow into vendor arrangements |
| **BFSI customers** | Outsourcing, data-localization and audit-rights expectations will be imposed on BID contractually — expect intrusive vendor due diligence and be ready for it |
| **Employment** | Background verification practice, discrimination exposure, and the fairness obligations in §09.8 |
| **Contract labour** | Principal-employer statutory duties shape the workforce product |
| **Cross-border** | Transfer restrictions; keep data in India by default |

**Data localization posture:** primary storage in Indian regions from day one. It is what BFSI and government-adjacent customers will require, it removes a whole class of transfer questions, and retrofitting it later is painful.

## 11.5 Security architecture

**Identity & access**
- SSO/SAML/OIDC for enterprise tenants; MFA mandatory for privileged roles
- Least privilege by default; time-bound elevation with recorded justification
- Separate roles: policy author, campaign operator, verification reviewer, disclosure approver, auditor, admin
- Service accounts scoped per integration, rotated, never shared

**Tenant isolation**
- Row-level security enforced in the data layer with tenant context in every query path
- Cross-tenant queries are impossible by construction, not by convention
- Independent verification of isolation in every penetration test — **this is the single most important test target in the platform**

**The relationship-graph rule.** ABC must never learn who else buys from XYZ. Supplier relationships are commercially sensitive, and a leak of that graph would be an extinction-level trust event. This constrains analytics, ML features, "similar companies" suggestions, sales tooling, support tooling and every export. Treat any feature that could infer the relationship graph as forbidden until proven safe.

**Application security**
- Secure SDLC, dependency scanning, SAST/DAST in CI
- Annual third-party penetration testing plus targeted tests on major releases
- Bug bounty once mature
- Secrets in a managed vault; no credentials in code or config
- Rate limiting and bot protection on all public endpoints, especially profile resolution

**Evidence integrity**
- SHA-256 content addressing on every evidence object
- Append-only audit log with hash chaining, so tampering is detectable
- Write-once storage for evidence with legal-hold support
- Independent verifiability: an auditor can confirm that a stored evidence object has not changed since capture

**Operational security**
- Production access requires approval, is time-bound, session-recorded and reviewed
- Customer data is never used in non-production environments; test data is synthetic
- Encrypted, tested backups with documented RPO/RTO
- Documented, rehearsed incident response — including a communication plan drafted *before* it is needed

**Third-party risk (BID's own)**
- BID must run its own vendor diligence on providers and infrastructure — using its own product, which is both correct practice and an excellent reference story
- Contractual data-protection terms with every provider
- Provider breach notification obligations

## 11.6 Retention

| Data | Default retention | Rationale |
|---|---|---|
| Verification outcomes | 8 years | Audit defence; aligns with common corporate record-keeping expectations ⚖ |
| Supporting evidence | 3 years, or contract-defined | Balance of defensibility and minimization |
| Background check results | 12 months post-decision, unless a longer period is legally required ⚖ | Minimize the most sensitive category |
| Consent artifacts | Life of consent + 8 years | Proof that disclosure was authorized |
| Audit logs | 8 years | Integrity of the record |
| Declined / abandoned verifications | 90 days | No reason to keep them |
| Raw provider responses | 12 months | Reconciliation and dispute, then discard |

**Deletion is real deletion** — from primary storage, replicas, backups (on the backup cycle), caches and search indexes. A deletion feature that leaves data in a search index is a lie, and it is the most common way this fails in practice.

**Legal hold** overrides deletion for records under active dispute or litigation, with the hold itself recorded.

## 11.7 Things BID must never do

A hard list. Any of these would be an existential error, and each should be written into internal engineering standards, not just this document.

1. Build a **public or searchable database of individuals' background information**
2. Sell or license personal data to third parties
3. Use verification data for any purpose outside the stated one
4. Expose the inter-tenant commercial relationship graph
5. Scrape banking systems or handle banking credentials
6. Bypass any regulated data-sharing framework
7. Publish adverse *risk* findings about a business on a public page
8. Auto-reject a person or a business without human review
9. Retain sensitive data beyond its stated retention
10. Present unverified information as verified
11. Claim government authority, endorsement, or a licence BID does not hold
12. Let commercial pressure from a paying customer override a verification outcome

Point 12 will be tested in practice — a large customer will eventually want a result changed, or want a vendor pushed through. **The answer is no, and the org must be designed so that the person receiving that pressure is not the person who owns the revenue number.** Assessment integrity reports independently of sales.

## 11.8 Certifications roadmap

| Stage | Target |
|---|---|
| **Pre-launch** | Security policy set, DPIA, penetration test, DPDP readiness assessment ⚖ |
| **Year 1** | ISO/IEC 27001 |
| **Year 1–2** | SOC 2 Type II — increasingly demanded by mid-market and enterprise buyers |
| **Year 2** | ISO/IEC 27701 (privacy information management) |
| **Sector-driven** | Whatever BFSI, healthcare or government customers contractually require |

These are sales assets as much as security assets. An enterprise procurement team's security questionnaire is a real sales gate, and answering it well is a competitive advantage — particularly against smaller point-solution competitors.
