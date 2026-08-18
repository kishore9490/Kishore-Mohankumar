# AI Revenue Recovery OS — U.S. Payer API & RCM Feasibility: Findings
_Prepared August 18, 2026. Evidence-backed analytical database from official CMS / X12 / HL7 / CAQH and vendor documentation. Values: YES / PARTIAL / NO / UNKNOWN. No PHI._
## Workflow capability summary matrix
| Workflow | Standard | API | Free API | Free Sandbox | Production API | Enrollment | Portal | Voice Fallback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Claim Status | YES | YES | PARTIAL | YES | YES | PARTIAL | YES | YES |
| Eligibility | YES | YES | PARTIAL | YES | YES | PARTIAL | YES | PARTIAL |
| Benefits | PARTIAL | YES | PARTIAL | YES | YES | PARTIAL | YES | PARTIAL |
| Patient Responsibility | PARTIAL | PARTIAL | NO | PARTIAL | PARTIAL | PARTIAL | YES | PARTIAL |
| Prior Authorization | YES | PARTIAL | NO | PARTIAL | PARTIAL | YES | YES | YES |
| Denials (835/ERA) | YES | YES | PARTIAL | YES | YES | YES | NO | NO |
| Appeals | NO | PARTIAL | NO | NO | PARTIAL | YES | YES | YES |

## Key findings
- Eligibility (270/271), claim status (276/277), claims (837) and remittance/denials (835) are standardized, high-adoption, and available today through clearinghouse APIs with free sandboxes.
- Almost no payer offers a FREE, public, provider-facing eligibility/claim-status REST API. Payer FHIR portals are CMS-9115 patient-authorized data, not provider RCM feeds. Exception: Optum (UHG) offers a direct provider-facing RCM API.
- Prior authorization is the least-automated workflow (~one-third electronic); portal + fax dominate. FHIR PA APIs are mandated for CMS-regulated payers by Jan 1, 2027 (operational PA rules by Jan 1, 2026).
- Appeals have no universal standard or API — portal, document upload, fax, mail and human processes prevail.
- Patient responsibility is not a single API answer: payer 271 supplies deductible/coinsurance/copay/accumulators, but exact liability must be CALCULATED by our own estimation engine.
- Recommendation: HYBRID. Build V1 on clearinghouse/API infrastructure (Stedi primary; Optum/Availity secondary) for eligibility, benefits, claim status and 835; use payer FHIR (Provider Access, 2027) selectively; portal/voice/human as fallback; the proprietary moat is the Payer Intelligence + Orchestration layer.

## Electronic adoption (CAQH Index)
| Transaction | Electronic % | Note |
| --- | --- | --- |
| Eligibility & Benefit Verification (270/271) | 96% | Highest-adopted; CORE data-content rule mandates benefit detail |
| Claim Submission (837) | 98% | Near-universal electronic |
| Remittance Advice / ERA (835) | 97% | Near-universal; carries CARC/RARC denial detail |
| Claim Status (276/277) | 81% | Strong but a real automation gap remains |
| Claim Payment (EFT) | 78% | Reassociation via 835 TRN + Nacha CCD+ |
| Prior Authorization (278) | 33% | Least automated (~one-third); portal/fax still dominant |

Adoption figures: CAQH Index (2023–2024 data years). Manual transactions cost on average ~$5.43 more than electronic; CAQH estimates $20B+ in remaining annual automation savings and ~$222B avoided through existing automation.

## Clearinghouse / API infrastructure
| Vendor | Elig | Status | Claims | 835 | Prior Auth | FHIR | Free Sandbox | Free Prod | Payers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Stedi | YES | YES | YES (P/I/D) | YES | NO / UNKNOWN | NO | YES (free) | YES — 100 free txns/mo (Basic) | 3,500+ |
| Availity | YES | YES (276) | YES (I/P/D) | YES | YES (278 + FHIR PA) | YES | YES (Demo — mock only) | Essentials portal free for sponsored payers (not the API) | Blues-heavy; founded by/for multiple BCBS plans |
| Optum (Change Healthcare) | YES | YES | YES | YES (+275 attachments) | UNKNOWN | PARTIAL (Claim FHIR API) | YES (free, no obligation) | NO | "Most U.S. payers" (exact count not public) |
| Waystar | YES | YES | YES | YES | YES (PA) | UNKNOWN | UNKNOWN / likely none | NO | 5,000+ payer connections |
| Zelis | NO | NO | NO | YES | NO | NO | UNKNOWN | NO | 330+ via single ERA/EFT enrollment; 550+ insurers |
| pVerify | YES | YES | PARTIAL | UNKNOWN | YES | YES | Free trial | NO | Many |
| Claim.MD | YES (400+ payers) | YES | YES | YES | UNKNOWN | NO | UNKNOWN | UNKNOWN | 400+ eligibility |
| Office Ally | YES | YES | YES | YES | NO | NO | UNKNOWN | Portal free (fees may apply) | Large |
| Inovalon (ABILITY) | YES (2,300+ payers) | YES | YES | YES | UNKNOWN | PARTIAL (patient access) | YES | NO | 2,300+ |
| Edifecs | N/A | N/A | N/A | N/A | N/A | X12/FHIR engine | NO | NO | N/A |

## Direct payer APIs (verified)
Nearly all payer FHIR portals are CMS-9115 **patient-authorized** (Patient Access + Provider Directory), not provider RCM feeds. **Optum (UHG)** is the exception with a direct provider-facing RCM API.

| Payer | Dev Portal | Patient Access FHIR | Direct RCM API | FHIR Ver | Conf |
| --- | --- | --- | --- | --- | --- |
| UnitedHealthcare | YES | YES | NO (patient-authorized only; Optum=UHG offers di | R4 | High |
| Optum (UHG) | YES | N/A | YES — direct provider-facing eligibility/claims/ | R4 (Claim FHIR API) | High |
| Aetna | YES | YES | NO (RCM via clearinghouse) | R4 | High |
| Cigna Healthcare | YES | YES | NO (RCM via clearinghouse) | R4 | High |
| Humana | YES | YES | NO (RCM via clearinghouse) | R4/US Core | High |
| Elevance Health (Anthem) | YES | YES | NO (RCM via Availity) | R4 (CARIN BB STU1) | High |
| Centene | YES | YES | NO (RCM via Availity/clearinghouse) | R4 (implied) | High |
| Molina Healthcare | YES | YES | NO | R4 (implied) | High |
| Kaiser Permanente | PARTIAL | YES | NO (integrated system) | R4 | Medium |
| Health Care Service Corp (HCSC) | YES | YES | NO (RCM via Availity) | R4 (implied) | High |
| Blue Shield of California | YES | YES | NO | R4 | High |
| Florida Blue | YES | YES | NO (RCM via clearinghouse) | R4 (implied) | High |
| Highmark | YES | YES | NO | R4 (4.0.1, explicit) | High |
| CareFirst BCBS | YES | YES | NO (patient/payer-to-payer only) | R4 (implied) | High |
| Oscar Health | YES | YES | NO (via 1upHealth) | R4 (Da Vinci PDex STU2) | High |

## CMS 2027 (CMS-0057-F)
| Date | Milestone | Detail |
| --- | --- | --- |
| Jul 1, 2021 | CMS-9115-F Patient Access API + Provider Directory API enforced | FHIR, patient-authorized member data + public directory (CMS-regulated payers) |
| Dec 8, 2021 | CMS-9115-F Payer-to-Payer provision — enforcement discretion | Original payer-to-payer requirement not enforced; deferred to CMS-0057-F |
| Jan 1, 2026 | CMS-0057-F operational prior-authorization provisions | 72-hr expedited / 7-day standard decisions; specific denial reason; public PA metrics reporting |
| Jan 1, 2027 | CMS-0057-F FHIR API implementation | Patient Access (enhanced), Provider Access (new), Payer-to-Payer (new), Prior Authorization (new) |

Impacted payers: Medicare Advantage organizations, State Medicaid & CHIP fee-for-service, Medicaid & CHIP managed care plans, QHP issuers on the Federally-Facilitated Exchanges. **Not** commercial/employer (ERISA) plans.

## Recommendation (validated hypothesis)
**Hybrid.** V1 on clearinghouse/API infrastructure (Stedi primary; Optum/Availity secondary) for eligibility, benefits, claim status and 835; selective payer FHIR (Provider Access, 2027); portal/voice/human fallback; proprietary **Payer Intelligence + Orchestration** layer as the moat.

### What we can build
- **MVP (2–3):** Eligibility, Benefit verification, Claim status (clearinghouse API).
- **V1 (5–6):** + Denial intelligence (835), Patient-responsibility estimation, Claim submission.
- **Production:** + Prior auth (portal/voice → FHIR 2027), Appeals orchestration, payer FHIR Provider Access, Payer Intelligence layer.

### Traffic-light: build feasibility today
| Capability | Status | Note |
| --- | --- | --- |
| Eligibility Verification | GREEN | 270/271 is 96% electronic and available now via clearinghouse APIs with free sandboxes (Stedi, Optum). Build first. |
| Benefit Verification | GREEN | Structured benefits parsed from CORE-enhanced 271 (copay, coinsurance, deductible, remaining). Some fields payer-variable → PARTIAL on completeness. |
| Claim Status | GREEN | 276/277 real-time via clearinghouse APIs today; 81% electronic. Build first. |
| Denials (ERA / 835) | GREEN | 835 is 97% electronic and carries CARC/RARC + 277CA. AI can derive root cause and recovery path. Enrollment required per payer for 835. |
| Claim Submission (837) | GREEN | 98% electronic; needed to support resubmission/correction workflows. |
| Patient Responsibility | YELLOW | Payer 271 supplies deductible/coinsurance/copay/accumulators, but exact liability must be CALCULATED by our estimation engine using allowed amounts + accumulators. Label 'Estimated'. |
| Prior Authorization | ORANGE | 278 exists but only ~one-third electronic; portal + fax dominate today. FHIR (Da Vinci PAS/CRD/DTR) mandated for CMS-regulated payers Jan 1, 2027. Portal/voice fallback now. |
| Appeals | RED | No universal appeal standard or API. Payer-specific: portal, document upload, fax, mail. Human + portal/voice orchestration required. |

## Investor-ready conclusion
> The U.S. payer ecosystem is not API-uniform. However, significant portions of eligibility, benefits, claims, claim status and remittance workflows already have standardized electronic transactions and API infrastructure. Prior authorization is moving toward FHIR-based APIs for CMS-regulated payers (Jan 1, 2027). The opportunity is not to build a new payer network from scratch, but to build an intelligent orchestration layer over existing EDI, clearinghouse, payer API, FHIR, portal and voice infrastructure.

## Research coverage limitation
The 43-organization set is representative, not exhaustive (thousands of payer IDs exist). Exact clearinghouse per-transaction pricing, per-payer 271 field completeness, per-payer appeal channels, and some FHIR versions remain UNKNOWN pending primary-source/per-payer verification (see Excel RESEARCH GAPS).
