# AI Revenue Recovery OS — Two-Sided Feasibility: Executive Findings
_Prepared August 18, 2026. Provider-side + payer-side opportunity, API pricing, guidelines and regulatory analysis. Evidence-backed from CMS / X12 / HL7 / CAQH / eCFR / NAIC / vendor docs. Values: YES/NO/PARTIAL/UNKNOWN/VARIABLE. Not legal advice — payer-side models require regulatory/legal review. No PHI._
## The final question
> Can AI Revenue Recovery OS start as a provider/RCM-side platform on existing APIs/clearinghouses, and eventually become a payer-side claims-intelligence and operations platform?

**YES, WITH CONDITIONS.** Provider-side is buildable now on clearinghouse APIs (Stedi free tier enables a near-$0 MVP). Payer-side is a real, large opportunity as *decision-support* (Model A) and *administrative services* (Model B); *delegated decisioning* (Model C) is long-term and heavily regulated — AI cannot make final medical-necessity/coverage decisions alone (CMS-4201-F; CA SB 1120).

## Payer-side opportunity scores (our analytical composite)
| Payer-side workflow | Score | Band | Model |
| --- | --- | --- | --- |
| Claim Intake & Validation AI | 76 | HIGH | Model A (SaaS) |
| Eligibility/Benefit Validation | 72 | HIGH | Model A |
| Coding/Policy Checks (edits) | 69 | MEDIUM | Model A/B |
| Adjudication Decision Support | 60 | MEDIUM | Model A → C |
| Payment Integrity (prepay/postpay) | 70 | HIGH | Model A/B |
| Denial Decision Support | 60 | MEDIUM | Model A |
| Provider Communication | 71 | HIGH | Model A/B |
| Appeal/Grievance Workflow | 56 | MEDIUM | Model B |
| Utilization Mgmt / Prior Auth Admin | 54 | MEDIUM | Model C (delegated) |
| Delegated Claims Operations / TPA | 50 | MEDIUM | Model C (TPA) |

## Payment integrity landscape
| Vendor | Category | Orientation |
| --- | --- | --- |
| Cotiviti | Payment accuracy (prepay+postpay) | Payer |
| Optum (Optum Insight) | Payment integrity across claim lifecycle | Payer |
| Zelis | Claims pricing + payment integrity | Payer |
| EXL Health | Payment integrity analytics + services | Payer |
| Gainwell (incl. HMS) | Government/Medicaid payment integrity | Payer (govt) |
| Lyric (ex-ClaimsXten) | Prepay claims editing / payment accuracy | Payer |
| ClarisHealth | Payment-integrity operating system (SaaS) | Payer |
| Machinify (New Mountain) | AI-native payment integrity | Payer |
| Codoxo | GenAI FWA + payment integrity | Payer |

U.S. payment-integrity market-size estimates vary widely by definition (software-only vs services-inclusive): e.g., Precedence Research ~$10.3B by 2033; other firms range ~$1–15B across 2024–2025 bases. Cite a range, not a point — Low confidence.

## Free MVP API stack (near-$0 build)
| Resource | Provider | Free? | Sandbox/Prod | Purpose |
| --- | --- | --- | --- | --- |
| Blue Button 2.0 | CMS | YES | Sandbox (synthetic) + prod (app review) | Medicare FFS claims (FHIR R4), beneficiary OAuth |
| Data at the Point of Care | CMS | YES | Sandbox open; prod pilot (apps paused — verify) | Bulk Medicare FFS claims to treating providers (Bulk FHIR) |
| AB2D | CMS | YES | Public sandbox; prod gated to PDP sponsors | Bulk Medicare A/B claims for standalone PDP sponsors |
| Synthea / SyntheticMass | MITRE | YES | Generate locally / download | Synthetic patients (FHIR R4/STU3, C-CDA, CSV) |
| HAPI FHIR public server | HAPI/Smile | YES | Public test server | Open FHIR R4/STU3 test endpoint |
| Da Vinci reference implementations | HL7 Da Vinci | YES | Public RIs / self-host | PAS/CRD/DTR/PDex/PCDE reference servers |
| Logica / Meld sandbox | Logica Health | YES | Sandbox | SMART-on-FHIR sandbox + EHR simulator |
| Inferno / ONC (g)(10) | ONC / HHS | YES | Hosted + self-host | FHIR conformance & certification testing |
| NPPES NPI Registry API | CMS/HHS | YES | Public production, no token | Public provider (NPI) lookup (REST/JSON) |
| CMS datasets (PDC, MCD, fee schedules) | CMS | YES | Public download / data.cms.gov | Provider data; NCD/LCD coverage DB; fee schedules |
| Stedi (free tier) | Stedi | YES | Sandbox + free Basic production | 270/271, 276/277, 837, 835 — real production |
| Availity (Demo) | Availity | YES (sandbox) | Demo (mock); production gated | Payer-connectivity APIs (mock) |
| Optum (sandbox) | Optum | YES (sandbox) | Sandbox; production paid subscription | Eligibility/claims APIs (mock) |
| CARIN Blue Button RI | HL7/CARIN | YES | Reference implementation / self-host | Payer→consumer claims FHIR IG + RI |

A genuine $0 build/test MVP is achievable (Synthea + HAPI/Da Vinci/CARIN RIs + Inferno + NPPES/CMS data + CMS Blue Button/DPC/AB2D sandboxes). Real production payer transactions generally require payer enrollment and — beyond Stedi's free Basic tier (100/mo each) — usage-based clearinghouse fees. Verify current status of DPC (production paused) and Logica (retiring to Meld).

## Regulatory models
| Model | What the vendor does | Exposure | Feasibility |
| --- | --- | --- | --- |
| Model A | Technology assists payer staff | Lowest barrier. BAA + security/compliance. No delegation, no | Feasible (startup-appropriate) |
| Model B | Delegated administrative / operational services | Payer contract + delegation of administrative functions; ove | Feasible with contracts & compliance |
| Model C | Delegated claims / UM / payment functions | Heavily regulated: likely TPA licensing; UR/UM laws and URAC | Long-term only — regulatory/legal review required |

**Bottom line:** Final medical-necessity/coverage decisions cannot be made by AI alone (CMS-4201-F for MA; CA SB 1120). A qualified clinician must own any adverse determination. Model B/C likely trigger TPA licensing + FDR/subcontractor oversight.

## Build / Buy / Partner
| Capability | Decision | Rationale |
| --- | --- | --- |
| Eligibility (270/271) | BUY / PARTNER | Clearinghouse API (Stedi/Optum/Availity); commoditized. Don't rebuild connectivity. |
| Benefits (271 parsing) | BUY + BUILD | Buy the transaction; build structured benefit normalization. |
| Claim Status (276/277) | BUY / PARTNER | Clearinghouse API; commoditized. |
| Claim Submission (837) | BUY / PARTNER | Clearinghouse; add validation/scrubbing (BUILD). |
| ERA/Denials (835) | BUY + BUILD | Buy the 835; build denial intelligence (root cause, recovery). |
| Patient Responsibility Estimation | BUILD | Own estimation engine over payer data; label as estimate. |
| Prior Authorization | PARTNER + BUILD | Portal/voice now; FHIR PAS (2027); build requirements/denial intelligence. |
| Appeals | BUILD + HUMAN | No standard API; build drafting/orchestration; human authors clinical appeals. |
| AI Voice | BUY / INTEGRATE | Voice provider/telephony; orchestrate as last resort. |
| Payer Intelligence | BUILD | Proprietary moat — payer behavior, channels, outcomes. |
| Orchestration engine | BUILD | Proprietary moat — right-channel decisioning + audit. |
| Payment Integrity | BUILD (later) / PARTNER | Large regulated market; enter after provider-side base. |
| Payer-side Adjudication | PARTNER / HIGHLY REGULATED | Decision support only; delegated functions need contract + oversight + legal review. |
| Coverage-policy retrieval/parsing | BUILD | Retrieve NCD/LCD + payer medical policies; map to CPT/HCPCS/ICD-10 for denial prevention. |

## Payer guidelines (key finding)
Commercial timely-filing and appeal windows are contract/plan/state-specific (documented range ~90 days to 12–18 months) — store them as configurable per-payer/plan/state values sourced from the live manual + signed contract, never a single hard-coded number. Only the government frameworks are fixed rules. CY2026 Medicare AIC thresholds: $200 (ALJ), $1,960 (federal court). Part C IRE changed from Maximus to C2C Innovative Solutions effective May 1, 2026.

| Payer | Timely Filing | Appeal Deadline | Confidence |
| --- | --- | --- | --- |
| UnitedHealthcare | VARIABLE (per participation agreement; MA claims 365d floor) | VARIABLE by LOB (~65d MA reconsideration) | VARIABLE |
| Aetna | VARIABLE (~90d in-net / 12mo OON per contract; 180d Medicaid MC) | Reconsideration ~180d → 2nd-level ~60d (verify) | Medium |
| Cigna | VARIABLE (~90d in / 180d OON; CA 365d) | Appeal within 180 calendar days (per Cigna appeals page) | Medium-High |
| Humana | MA 365d from DOS (fixed); commercial VARIABLE | MA reconsideration 65d (fixed); commercial ~180d | MA: High |
| Elevance / Anthem | UNKNOWN / VARIABLE by state (90 vs 180d cited) | Provider Dispute Resolution: 2-step, state-specific | Low/Variable |
| Florida Blue (BCBS) | VARIABLE (~365d default; contract may be shorter) | ~1yr most denials; MA 60d | Low/Variable |
| Medicare FFS (CMS) | 1 year from DOS (fixed rule) | Redetermination 120d → Reconsideration 180d → ALJ 60d → Council 60d → court 60d | High |
| Medicare Advantage | MA 365d claim floor | Plan reconsideration 65d → IRE (C2C from 5/1/2026) → ALJ → Council → court | High |
| Medicaid managed care | State-set (fixed by 42 CFR 438) | Plan appeal ≤30d resolution → state fair hearing (request 90–120d) | High |

## Recommended sequence
- **MVP:** Eligibility + Benefits + Claim Status (clearinghouse API; Stedi free tier).
- **V1:** + Denial intelligence (835), Prior-auth intelligence, Patient-responsibility estimation.
- **V2:** + Appeals orchestration, Payer Intelligence layer.
- **V3:** Payer-side claims-support / payment-integrity / denial-support as **Model A** decision-support (legal review).
- **V4:** Delegated payer operations (**Model C**) only where legally/contractually feasible.
