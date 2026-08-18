# AI Revenue Recovery OS — Technology Architecture

**Predict. Prevent. Work. Resolve. Recover.**

An AI-native orchestration and intelligence layer for U.S. healthcare revenue — connecting
provider, RCM and payer workflows across **EDI → API → FHIR → Payer Portal → AI Voice → Human**.

> **Positioning.** Not a chatbot, not an AI caller, not a billing app, not a claims dashboard,
> not a generic RCM system. It is the **decisioning + orchestration layer** that determines what
> needs to happen, why, through which channel, with what confidence, and what revenue was
> protected or recovered.

> **Disclosures.** HIPAA-*aligned* architecture (never "HIPAA certified"). Azure BAA availability
> does not by itself make the application compliant — compliance is an administrative, physical
> and technical program. Development uses **synthetic / de-identified data only**. Payer-side
> capabilities are **AI decision-support + workflow automation** with human/payer governance;
> the platform does not independently make final coverage, medical-necessity, payment or
> adjudication decisions. Delegated payer operations require separate regulatory/legal review.

---

## 1. Three product models

| Model | Customer | Positioning |
|---|---|---|
| **A — Provider / RCM** | Billing/RCM companies, hospitals, health systems, medical groups, practices, specialty providers | Provider revenue automation across the RCM lifecycle |
| **B — Payer** | Insurers, health plans, MA orgs, Medicaid MCOs, TPAs, administrators | AI **decision-support + workflow automation** with payer governance |
| **C — Provider + Payer** | Long-term platform | Shared foundation; strict tenant isolation between parties |

**Model A workflows:** Eligibility · Benefits · Patient Responsibility · Prior Auth · Claim
Submission · Claim Status · Denial Intelligence · Appeals · Revenue Recovery · Payer Intelligence.

**Model B capabilities:** Claim Intake · Claim Validation · Eligibility/Benefit Validation ·
Claims Processing Support · **Adjudication Decision Support** · Payment Integrity · Denial
Operations · Appeal Administration · Provider Communication · Payer Intelligence · Analytics.

**Model B guardrail.** Final coverage / medical-necessity / payment / adjudication decisions
remain with the payer's qualified personnel. AI produces *recommendations*; a rules/policy engine
validates; a human/payer approves where required; execution and audit follow. AI cannot be the
sole basis for a medical-necessity decision (CMS-4201-F for Medicare Advantage; CA SB 1120).

**Model C separation.** Provider data never automatically becomes visible to a payer, and vice
versa. Any permitted cross-party exchange is authorized, purpose-limited, logged, encrypted,
tenant-aware and contractually supported.

---

## 2. Core modules

Eligibility · Benefit Verification · Patient Responsibility Estimation · Prior Authorization ·
Claims · Claim Status · Denials · Appeals · Payer Intelligence · Revenue Recovery · **AI
Workforce** · **Human Exception Center** · Analytics · Audit · Security · Administration.

---

## 3. Connectivity strategy — "don't call when you can connect digitally"

The orchestration engine selects the cheapest sufficient channel per payer and workflow:

```
1. EDI  →  2. API  →  3. FHIR  →  4. Payer Portal  →  5. AI Voice  →  6. Human
```

| Workflow | Digital-first path | Fallback |
|---|---|---|
| Eligibility | 270/271 → API → FHIR (CoverageEligibility*) | Portal → Voice → Human |
| Claim Status | 276/277 → API → FHIR (Claim/ClaimResponse) | Portal → Voice → Human |
| Prior Auth | FHIR PAS / X12 278 / payer API | Portal → Voice → Human |
| Denials | 835 / 277CA (electronic — no call) | Human review of exceptions |
| Appeals | Payer-specific: API / portal / upload | Fax → Mail → Human |

Each execution captures outcome + evidence + confidence, schedules the next action, and escalates
to a human when confidence is below threshold.

---

## 4. Healthcare standards

**X12 (ASC X12 005010):** 270/271 · 276/277 · 277CA · 278 · 837P/I/D · 835 · 999 · TA1 · 275
(attachments). All HIPAA-mandated transactions are supported through clearinghouse connectivity
plus direct payer APIs where available.

**HL7 FHIR (R4):** Coverage · Patient · Practitioner · Organization · Claim · ClaimResponse ·
ExplanationOfBenefit · CoverageEligibilityRequest/Response · Task · DocumentReference ·
Questionnaire/QuestionnaireResponse · prior-authorization resources.

**Implementation guides:** HL7 Da Vinci (CRD, DTR, PAS, CDex, PDex), CARIN Blue Button, and CMS
interoperability APIs (Patient Access, Provider Access, Payer-to-Payer, Prior Authorization).
Under **CMS-0057-F**, impacted payers (Medicare Advantage, Medicaid & CHIP, FFE QHPs) must
implement FHIR APIs generally by **Jan 1, 2027** (operational prior-auth rules from Jan 1, 2026).
The rule does **not** make eligibility API-only and does **not** apply to commercial/ERISA plans.

---

## 5. Provider-side workflows (summary)

- **Eligibility** (270/271): active/inactive, effective/termination dates, member ID, plan,
  product, network, coverage type, coordination of benefits.
- **Benefits** (271, CORE-enhanced): deductible / remaining, copay, coinsurance, OOP max /
  remaining, service-specific & network benefits, visit limits, auth requirements — represented
  as YES / NO / PARTIAL / UNKNOWN because payer field coverage varies.
- **Patient Responsibility Estimation:** an **estimation engine** over benefits + accumulators +
  allowed amount (where available) + CPT/HCPCS + network + location. Output is always an
  **estimate**, never final adjudication.
- **Prior Authorization** (278 / FHIR PAS / CRD / DTR / payer API): is auth required, documentation
  requirements, submission, status, approval/denial + reason, additional-info requests, auth
  number, expiration.
- **Claims** (837P/I/D): creation, validation, submission, tracking, correction, history, status,
  ERA reconciliation.
- **Claim Status** (276/277/277CA): submitted/accepted/rejected/pending/paid/denied, medical
  review, documentation/additional-info required, reference number, follow-up date.
- **Denial Intelligence** (835 + CARC/RARC + 837 + 277CA + history + eligibility + benefits +
  auth + payer policy): denial reason, root cause, financial impact, recovery probability,
  corrective action, resubmission/appeal recommendation, human-review flag.
- **Appeals:** denial analysis, eligibility, deadline, required documentation, policy references,
  AI draft → human approval → channel (API/electronic/portal/upload/fax/mail/human) → tracking.
  No universal appeal API is assumed.

---

## 6. Payer Intelligence (central layer)

Structured, per-payer operational knowledge: payer/plan/state/payer-ID/network, API/FHIR/EDI
support, portal, prior-auth rules, eligibility rules, benefits, claims requirements, denial
patterns, appeal rules, timely filing, coverage/medical policies, provider manuals. The engine
answers: **"what is the best way to work this payer?"** Built from permitted, tenant-isolated
customer data and outcomes; PHI from one tenant is never shared with another.

**Payer-side flow (Model B), governed:** Claim Intake → Validation → Eligibility → Benefits →
Authorization → Policy Rules → **Adjudication Decision Support** → Payment Integrity → Denial →
Provider Communication → Appeal → Resolution. Every step: *AI recommendation → rules validation →
human/payer approval where required → execution → audit.*

---

## 7. Multi-tenant architecture

**Tenant types:** PLATFORM · PROVIDER · PAYER · RCM/BPO · ENTERPRISE.

```
Platform
├── Provider Tenant → Organization → Locations → Departments → Users → Patients → Claims
├── Payer Tenant    → Plans → Regions → Users → Claims
└── RCM Tenant      → Client Organizations → Users → Claims
```

Every record carries `tenant_id`, `organization_id`, `environment_id`.

### Isolation strategy (phased)

| Stage | Model | Isolation |
|---|---|---|
| **MVP** | Shared database + **Row-Level Security (RLS)** | App-level + RLS by `tenant_id`; RBAC; encryption; audit |
| **V1** | Shared DB + RLS + **schema separation for large tenants** | Adds ABAC, per-tenant keys where justified |
| **Enterprise** | **Database-per-tenant / dedicated environment** | Dedicated DB, keys, networking, logging; optional regional deployment |

Isolation is defense-in-depth: application authorization + database RLS + RBAC/ABAC + encryption
+ immutable audit. High-value enterprise customers may elect dedicated databases or environments.

---

## 8. Azure architecture

```
Internet → Azure Front Door → WAF → (App Gateway) → API Management → Microsoft Entra ID
        → Application Layer (Azure Container Apps; AKS only when justified)
        → Service Bus → Functions/Jobs → PostgreSQL Flexible Server → Redis
        → Blob Storage → Azure AI Search → AI Gateway → Approved AI Models
Security plane: Entra ID · Key Vault · Managed HSM (when justified) · Private Link · Private DNS
        · Defender for Cloud · Microsoft Sentinel · Azure Monitor · App Insights · Log Analytics
        · Azure Firewall · Bastion · Backup · DR
```

### MVP vs Production vs Enterprise (avoid over-engineering the MVP)

| Tier | Cloud footprint |
|---|---|
| **MVP** | Container Apps · PostgreSQL Flexible Server · Blob · Service Bus · Key Vault · Entra ID · App Insights · Monitor · WAF · (APIM where justified) |
| **Production** | + High availability · Private endpoints · Azure Firewall · Defender · Sentinel · advanced monitoring · DR · geo-redundancy · HSM (where justified) · enterprise networking |
| **Large enterprise** | + Dedicated tenant environment · dedicated database · dedicated keys · dedicated networking · dedicated logging · optional regional deployment |

### Network security — hub-spoke

- **Hub:** Azure Firewall · Bastion · central monitoring · Private DNS.
- **Spokes:** DEV · TEST · STAGING · PRODUCTION.
- **Production:** no unnecessary public endpoints; **database has NO public access** — Private
  Endpoints, NSGs, Firewall, WAF, DDoS protection (where appropriate), Private DNS.

### Identity — Microsoft Entra ID

MFA · Conditional Access · RBAC · PIM · JIT access · Managed Identity · Workload Identity ·
service principals (only where necessary) · OAuth2/OIDC · SSO. Enterprise: SCIM · SAML · OIDC.

---

## 9. HIPAA / PHI

**Data types:** PHI/ePHI · PII · insurance information · claims · clinical documents · patient
identifiers · financial information.

**Principles:** Zero Trust · least privilege · defense in depth · encryption · tenant isolation ·
data minimization · auditability.

**Controls:** TLS 1.2+ · encryption at rest (AES-256) · Key Vault · customer-managed keys (where
appropriate) · private endpoints · immutable audit logs · backup · DR · SIEM · security
monitoring.

**Wording.** "HIPAA-aligned architecture / HIPAA compliance program" — never "HIPAA certified."
A signed Microsoft BAA covers in-scope Azure services; the application's compliance is a separate,
ongoing program (risk assessment, policies/SOPs, administrative/physical/technical safeguards,
training, incident response, audit evidence).

### PHI AI security — the AI Gateway

```
Application → PHI Detection → Policy Engine → Redaction/Tokenization (where appropriate)
           → Approved Model → Response Validation → Audit
```

- **Development:** synthetic data, de-identified data, mock claims, fake patients, fake payer
  data **only**. Production PHI is never used with development AI subscriptions or tools.
- **Production AI:** only services with appropriate contractual, security and data-processing
  arrangements for the intended healthcare use (e.g., Azure OpenAI under BAA). Developer AI tools
  (Claude Max, ChatGPT subscriptions) are **not** production PHI infrastructure.

---

## 10. AI model architecture (provider-agnostic)

```
AI Gateway
├── Azure OpenAI (production PHI path, under BAA)
├── OpenAI API
├── Anthropic API
└── other approved models
```

Route by task · cost · latency · reasoning need · PHI policy · reliability · confidence.

- **Small/fast models:** classification, extraction, summarization.
- **Strong models:** complex reasoning, appeals, policy interpretation, exception handling.
- **Fallback chain:** primary model → secondary model → rules engine → human.

### RAG (secure, tenant-aware)

```
Document → Classification → PHI Detection → Chunking → Embedding → Vector Search (Azure AI Search)
        → Metadata + Tenant Filtering → Retrieval → LLM → Citation → Confidence
```

Corpus: payer manuals, payer/CMS/medical/prior-auth policies, denial rules, internal SOPs. Every
answer carries source traceability and a confidence score wherever possible. Retrieval is tenant-
filtered so no tenant can retrieve another tenant's content.

---

## 11. AI agent workforce & governance

**Human roles** (12): CTO/Architect · Product Manager · Healthcare/RCM BA · Backend · Frontend ·
AI · Integration · DevOps/SRE · Security · QA · Data · Compliance.

**AI agents** (20): Product Manager · Project Manager · Business Analyst · Healthcare RCM · Payer
Research · Architecture · Backend Dev · Frontend Dev · AI Engineer · EDI · FHIR · Integration ·
Database · QA · Security · DevOps · FinOps · Documentation · Compliance Research · Test Data.

**Governance — AI agents are privileged software identities, not employees.** Human engineers
operate multiple specialized agents through AI tools; there is **no paid subscription per agent**.

```
Agent Identity → Policy → Tool Permission → Data Permission → Tenant Permission
             → Action Permission → Audit
```

**Least privilege for AI agents:** no unrestricted production database access, no unrestricted
production deployment, no unrestricted PHI access. **High-risk actions require human approval:**
production deployment · production DB changes · IAM changes · security/PHI policy changes ·
production deletion · and any claims-adjudication / medical-necessity / coverage / financial
decision.

---

## 12. Data model

Tenant · Organization · User · Role · Permission · Patient · Provider · Payer · Plan · Claim ·
ClaimEvent · Eligibility · Benefit · PriorAuthorization · Denial · Appeal · Recovery · PayerPolicy
· PayerGuideline · PayerInteraction · AIAction · AIDecision · AIAgent · AuditEvent · Integration ·
APIConnection · Document · Attachment.

**Database:** Azure Database for PostgreSQL Flexible Server — HA, backups, PITR, private
networking, encryption, monitoring, RLS where appropriate.

**Storage:** Azure Blob — containers `raw · claims · documents · attachments · clinical · exports
· audit`; private access, encryption, lifecycle policies, retention, immutability where required.

---

## 13. Disaster recovery & business continuity

| Tier | RPO | RTO |
|---|---|---|
| MVP | ≤ 24 h | ≤ 8 h |
| Production | ≤ 1 h | ≤ 4 h |
| Enterprise | ≤ 15 min | ≤ 1 h |

Includes backup, point-in-time recovery, geo-redundancy, failover, DR testing, ransomware
recovery, database/storage recovery.

**Continuity responses:** Azure outage · database outage · payer-API outage · clearinghouse
outage · AI-provider outage · voice-provider outage · cyberattack · credential compromise ·
ransomware · data corruption. **AI fallback:** primary model → secondary model → rules engine →
human.

---

## 14. Security testing & AI-specific security

**Testing:** SAST · DAST · SCA · secrets scanning · container scanning · IaC scanning · API
security · penetration testing · **tenant-isolation testing** · **PHI-leakage testing** · prompt
injection · RAG poisoning · agent tool-abuse · LLM output validation.

**Security controls (summary):** Zero Trust; Entra ID + MFA + Conditional Access + PIM/JIT;
Key Vault + CMK + HSM (where justified); Private Link/Private DNS; WAF + Firewall + DDoS;
Defender for Cloud; Sentinel SIEM; immutable audit; encrypted backup + DR; least-privilege RBAC/
ABAC; supply-chain scanning in CI/CD.

---

## 15. Final conceptual architecture

```
                              USERS
                                │
                       Azure Front Door
                                │
                               WAF
                                │
                        API Management
                                │
                           Entra ID
                                │
                     APPLICATION LAYER
                                │
        ┌───────────────────────┼───────────────────────┐
     PROVIDER API            PAYER API                ADMIN API
        └───────────────────────┼───────────────────────┘
                                │
                        AI ORCHESTRATION
                                │
        ┌──────────────┬────────┼────────┬──────────────┐
      RULES          AGENTS            RAG
        └──────────────┴────────┼────────┴──────────────┘
                                │
                        WORKFLOW ENGINE
                                │
        ┌──────────────┬────────┼────────┬──────────────┐
   PostgreSQL      Service Bus         Redis
        │
   PHI / Tenant Data → Encrypted Blob → Audit / Monitoring

SECURITY PLANE: Entra ID · Key Vault · HSM (where justified) · Private Link · Firewall
              · Defender · Sentinel · Monitor · Audit · Backup · DR
```

**Optimize for:** security · healthcare interoperability · multi-tenancy · AI orchestration ·
auditability · scalability · time-to-pilot · time-to-revenue · production readiness · investor
credibility — while **not over-engineering the MVP**.
