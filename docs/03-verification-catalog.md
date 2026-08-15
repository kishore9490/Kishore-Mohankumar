# 03 · Verification Catalog

The complete inventory of checks BID orchestrates, across business entities, people and contractor workforces.

**Read this alongside [§05 Provider Orchestration](05-provider-orchestration.md).** BID does not build most of these data sources. Every check below is annotated with its **source class** and, where relevant, an **access-eligibility caveat** — several of these channels are restricted to entities holding specific authorizations, and assuming access is the fastest way to build a product that cannot legally ship.

### Source class legend

| Class | Meaning |
|---|---|
| **S1** | Authoritative registry — the system of record, accessed via an official or authorized channel |
| **S2** | Regulated intermediary — a licensed entity in a statutory framework (AA ecosystem, credit information companies) |
| **S3** | Licensed commercial verification provider |
| **S4** | Issuer attestation — direct confirmation from the body that issued the credential |
| **S5** | Human verification — field, telephonic, in-person |
| **S6** | Self-declared with supporting document |
| **S7** | Public / open-source information |

Verification level achievable generally rises S6 → S1/S4, with S5 required to reach L4.

---

## 3.1 Business identity

| Check | Source class | Achievable level | Notes & caveats |
|---|---|---|---|
| Corporate identity (CIN/LLPIN) | S1 — MCA | L2 | Company/LLP existence, incorporation date, status (active/struck-off/under liquidation) |
| PAN validation | S1 via authorized channel | L2 | Verify **name-to-PAN correspondence**, not just format. Format-only validation is not verification and must never be labelled as such. |
| GST registration | S1 via authorized channel (GSP) | L2 | Status, legal name, trade name, principal place of business, registration/cancellation dates, taxpayer type. **The single highest-signal business check in India.** |
| GST filing behaviour | S1/S3 | L2 | Return-filing regularity is a strong operational-health signal. Availability depends on channel and data-sharing terms. |
| Udyam / MSME registration | S1 | L2 | Enterprise classification, activity. Relevant for MSME procurement mandates and payment-terms obligations. |
| Business status | S1 | L2 | Derived: active, dormant, struck off, under liquidation, cancelled |
| Registered address | S1 | L2 | Registry address ≠ operating address. Never conflate the two in the UI. |
| Operating address | S5 / S3 | L3–L4 | Physical or geo-tagged field verification |
| Import/export code (IEC) | S1/S3 | L2 | Trade-facing entities |
| Trade name / brand | S6/S7 | L1 | Self-declared unless a trademark registry check is run |
| Website & domain control | S3/S7 | L1–L2 | Domain age, registration, control proof via DNS/email challenge |
| Statutory registrations | S1/S3 | L2 | EPFO, ESIC, professional tax, shops & establishments, factory licence — varies by state and applicability |

## 3.2 Banking & financial

| Check | Source class | Achievable level | Notes & caveats |
|---|---|---|---|
| Bank account ownership | S3 via NPCI rails | **L3** | Credit-into-account ("penny drop") or equivalent name-match validation. This is a *control* proof, not a document check — one of the strongest signals in the catalog and a direct fraud control on payment redirection. |
| Bank account validity | S3 | L2 | Account exists and is active |
| Name match quality | Internal | — | Fuzzy-match scoring against registry legal name. **Publish the match logic; never hide it behind a score.** |
| Financial statements | S1 (MCA filings) / S6 | L2 / L1 | Filed financials for companies and LLPs. Proprietorships and partnerships generally have no public filings — a structural gap, not a product failure, and must be shown as *insufficient evidence*, not as risk. |
| Turnover verification | S2 / S6 + S4 | L2–L3 | Options: GST-derived turnover signals; auditor/CA attestation; consent-based financial data. |
| Bank statement analysis | **S2 — Account Aggregator ecosystem** | L3 | **Only** via the RBI-regulated AA framework with the entity's consent, as an authorized participant or through a regulated partner. **BID must never scrape net banking, never ask for banking credentials, and never accept screen-scraped statements.** This is an absolute product constraint, not a preference. |
| Credit / commercial bureau information | **S2 — CIC under CICRA 2005** | L2 | Access to credit information is statutorily restricted to specified users under the Credit Information Companies (Regulation) Act 2005. **Legal counsel required before any credit data is used, displayed, or referenced.** Do not design UI that assumes availability. |
| Payment/default signals | S3 | L2 | Commercial data providers, trade references. Quality varies enormously — validate before relying. |
| Insurance coverage | S4 / S6 | L2–L3 | Policy existence, coverage limits, validity — confirmed with the insurer where possible |

## 3.3 Ownership & control

| Check | Source class | Achievable level | Notes |
|---|---|---|---|
| Directors / partners | S1 — MCA | L2 | Current and past, with DIN |
| Director disqualification | S1 | L2 | Disqualified-director listings |
| Director's other directorships | S1 | L2 | Reveals shell-company patterns and undisclosed related parties |
| Shareholding pattern | S1 | L2 | From filings; timeliness limited by filing cycles |
| Beneficial ownership (UBO) | S1 + S6 + analysis | L2–L3 | Layered structures often require declaration plus corroboration. Genuinely hard; be honest about limits rather than implying certainty. |
| Authorized signatory | S6 + S4 | L2–L3 | Board resolution, authority letter, signatory verification |
| Group / related entities | S1 + analysis | L2 | Common directors, addresses, PAN linkages |
| Related-party / conflict-of-interest screening | Internal + tenant data | L2 | Match counterparty officers against the buyer's own employee/officer data. **High-value, low-cost, rarely offered — a strong differentiator for procurement fraud control.** |

## 3.4 Compliance & credentials

| Check | Source class | Achievable level | Notes |
|---|---|---|---|
| ISO and management-system certificates | S4 / S3 | L3 | Verify with the certification body or accreditation registry. **Fake ISO certificates are common; document-only checks are near-worthless here.** |
| Industry licences | S1 / S4 | L2–L3 | Drug licence, food licence, pollution consent, factory licence, contractor labour licence, transport permits — sector- and state-specific |
| Statutory compliance | S1 / S6 | L2 | EPFO/ESIC remittance status, statutory returns |
| Quality / test certifications | S4 | L3 | Product certifications, lab reports |
| Environmental & safety | S1/S4 | L2–L3 | Consent to operate, safety certifications |
| Expiry monitoring | Internal | — | **The recurring-revenue engine.** Every credential has a validity window; BID watches all of them. |

## 3.5 Risk screening

| Check | Source class | Notes & caveats |
|---|---|---|
| Sanctions screening | S3 | UN, OFAC, EU, UK, and Indian designated lists as applicable. Name-matching produces false positives at high rates; a **disposition workflow is mandatory**, not optional. |
| PEP screening | S3 | Politically exposed persons. A PEP match is **not** an adverse finding — it is a trigger for enhanced due diligence. UI copy must make this unmistakable or BID will cause unfair exclusions. |
| Adverse media | S3/S7 | Requires human review. Never auto-penalize on an automated media match. |
| Litigation / court records | S1 (eCourts and related) / S3 | Coverage across Indian courts and tribunals is genuinely uneven, and matching on common names is unreliable. **Present as "potential matches requiring review", never as fact.** A wrongly attributed case is a defamation exposure. |
| Regulatory action | S1/S3 | Regulator orders and enforcement listings, where published |
| Insolvency proceedings | S1/S3 | IBC-related proceedings |
| Fraud-signal analysis | Internal | Cross-tenant pattern analysis on **verification-integrity signals only** — e.g. the same forged certificate template submitted by unrelated entities, or one bank account claimed by many entities. Must never leak commercial relationship data between tenants. |
| Document anomaly detection | Internal / S3 | Tamper detection, metadata analysis, template matching, font/layout inconsistency |

**Governing rule for this entire section:** screening produces *potential matches*, not conclusions. Every risk hit enters a disposition workflow with a human decision, a reason, and an audit record. Automated adverse conclusions about businesses and people are the fastest route to both legal liability and destroyed customer trust.

---

## 3.6 Employee & candidate BGV

The person side of the platform. Everything here is subject to notice, consent/authorization and purpose limitation ([§11](11-privacy-security.md)).

| Check | Source class | Notes |
|---|---|---|
| **Identity** | | |
| Identity verification | S1/S3 via authorized channels | Use consent-based, compliant routes (e.g. offline/document-based verification, DigiLocker-issued documents). Aadhaar-based authentication is restricted to entities permitted under the applicable framework — **do not assume access; counsel required.** |
| PAN verification | S1 | Name-to-PAN correspondence |
| Address verification | S3/S5 | Digital, postal or physical, per policy depth |
| **Education** | | |
| Degree / qualification | S4 / S1 | University or issuing institution confirmation; digital academic depositories where the institution participates |
| Institution legitimacy | S1/S7 | Recognition status of the institution — catches "verified degree from a fake university" |
| Certificate authenticity | S4 | Direct issuer confirmation |
| **Employment** | | |
| Previous employment | S4/S5 | HR confirmation with the former employer |
| Employment dates & designation | S4/S5 | Availability of designation varies by employer policy |
| Statutory employment record | S1 | UAN/EPFO-based employment history where the employer contributed and the individual consents. **Strong signal — but only covers formal, EPF-covered employment.** |
| Exit type / rehire eligibility | S4/S5 | Frequently withheld by employers; do not promise it |
| **Professional** | | |
| Professional licences | S1/S4 | Medical, nursing, engineering, CA/CS/CMA, legal, driving, trade licences |
| Certifications | S4 | Skills, technical and safety certifications |
| Registration status | S1/S4 | Active vs lapsed vs disciplinary action |
| **Legal & risk** | | |
| Court-record check | S1/S3 | Same coverage and name-matching caveats as §3.5. **Never present an unconfirmed match as a criminal record.** |
| Sanctions / watchlist | S3 | Where proportionate to the role |
| Global database checks | S3 | For roles with international exposure |
| **Documents** | | |
| Document authenticity | Internal/S3 | Tamper and anomaly detection |
| Reference checks | S5 | Structured, consented |

**Standard packages** (marketed as levels, priced as packages — see [§12](12-revenue-model.md)):

| Package | Contents |
|---|---|
| **Essential** | Identity, PAN, one address, one employment |
| **Standard** | Essential + education + two employments + court record |
| **Comprehensive** | Standard + full employment history + professional licence + reference checks |
| **Executive** | Comprehensive + directorship search + adverse media + financial/regulatory checks + global watchlist |

**Non-negotiable rules for the person side:**
1. The person receives clear notice of who is verifying, what is checked, and why — before the check begins.
2. Consent is specific, informed, purpose-bound and revocable, and a consent receipt is issued.
3. The person can see their own result and **dispute** any finding, with a defined turnaround.
4. Results go to the requesting employer under its stated purpose only, and are never repurposed.
5. **BID never builds a public or searchable database of people's background information.** A person's BGV result is not a shareable public asset. This is a hard architectural boundary, not a policy setting.
6. Adverse findings never auto-reject a candidate. BID surfaces evidence; the employer decides and records the reason.

---

## 3.7 Contractor & third-party workforce verification

The most under-served, highest-value enterprise pain in the catalog — and the clearest wedge into operations, EHS and plant management budgets rather than only procurement.

### The scenario

A factory engages a contractor. The contractor deploys fifty workers onto the site. The principal employer carries real legal, safety and reputational exposure for people it does not employ and cannot see. Today this is managed with a gate register and a folder of photocopies.

### The two-layer model

```
LAYER 1 — Contractor company (BID-BUS)
  ├── Corporate identity, GST, PAN
  ├── Contract labour licence / registration, as applicable
  ├── EPFO & ESIC registration and remittance status
  ├── Workmen's compensation / liability insurance
  ├── Safety record and certifications
  └── Financial stability signals

LAYER 2 — Each deployed worker (BID-PER)
  ├── Identity verification
  ├── Employment relationship with the contractor (the link that is almost never checked)
  ├── Skill and trade certification
  ├── Safety training currency
  ├── Statutory licences (electrical, height work, hot work, driving, forklift…)
  ├── Medical fitness, where required
  ├── Background check, proportionate to site access and role
  └── Site induction record
```

Layer 2's second line is the one that matters most and is almost universally missing: **is this worker actually employed by this contractor?** Unverified labour substitution — a different person turning up with a borrowed gate pass — is a genuine safety, security and statutory-liability problem.

### What the principal sees

```
Contractor: DEF Services            BID-BUS-200145
Site: Plant 2 · Contract CT-2026-88

Workers submitted        50
Verified                 47
Pending                   2
Exceptions                1

Exceptions
  Worker BID-PER-556231 — height-work certification EXPIRED 02 Aug 2026
                          → site access BLOCKED pending renewal

Expiring in 30 days
  4 safety training certificates
  1 electrical licence
```

### Why this is strategically important

- **It is a compliance obligation, not a nice-to-have** — principal employers carry statutory duties toward contract labour, and enforcement is real.
- **It is a safety obligation** — an uncertified worker on a height or hot-work job is an incident waiting to happen, and incidents generate inquiries that ask exactly the question BID answers.
- **The volume is enormous.** One manufacturing customer can mean thousands of workers with certifications that expire continuously — recurring verification revenue with genuine ongoing value delivered.
- **Nobody owns it today.** No VMS covers Layer 2, no HRMS covers non-employees, no BGV agency covers credential expiry monitoring.
- **It seeds the network at scale.** Every contractor verified for one principal becomes verifiable for the next.

**Proportionality caution:** contract workers are frequently among the most economically vulnerable people BID will touch. Verification depth must be proportionate to role and site risk. A helper on a general site does not need an executive-grade background check, and pushing one would be both wrong and a serious reputational risk. **Build proportionality into policy defaults so the easy path is also the right one.**

---

## 3.8 Coverage honesty

Some things in this catalog are reliable, fast and cheap. Some are slow, patchy or unavailable. Product, sales and marketing must reflect that distinction accurately.

| Reliable & programmatic | Slow, partial or human-dependent | Restricted / needs counsel |
|---|---|---|
| GST, MCA, PAN, Udyam, IEC | Court records (coverage and name matching) | Credit information (CICRA) |
| Bank account ownership | Employment verification (employer cooperation) | Aadhaar-based authentication |
| Document anomaly detection | Education verification (institutional response times) | Bank statement data (AA framework) |
| Credential expiry monitoring | Physical address verification | Certain sectoral databases |
| Sanctions/PEP screening (with disposition) | UBO for layered structures | Cross-border data |

**Never sell what the middle and right columns cannot deliver.** The fastest way to lose an enterprise account is a promised turnaround that depends on a university registrar answering the phone.
