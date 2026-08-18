# U.S. Payer API & RCM Automation — Feasibility Research

Evidence-backed feasibility research for **AI Revenue Recovery OS**: what U.S. payer RCM data
can be obtained electronically today, through which channel (EDI / API / FHIR / portal / voice),
whether it is free, whether a sandbox / production path exists, what enrollment is required, and
where portal / voice / human fallback is still necessary.

## Deliverables

**Study 1 — Provider-side payer-API feasibility**

| File | What it is |
|---|---|
| `AI_Revenue_Recovery_OS_US_Payer_API_Feasibility_Report.pdf` | 28-page report — exec summary, standards, per-workflow analysis, clearinghouse & FHIR analysis, CMS 2027, MVP/production strategy, risks, appendices, sources, glossary. |
| `AI_Revenue_Recovery_OS_Findings.md` | Condensed findings (study 1). |

**Study 2 — Two-sided (provider + payer) opportunity, pricing & regulation** *(supersedes the study-1 Excel/Master with expanded versions under the same names)*

| File | What it is |
|---|---|
| `AI_Revenue_Recovery_OS_US_Payer_API_Pricing_Report.pdf` | 28-page report — two-sided model, API landscape & pricing, free MVP stack, production stack, payer-side opportunity scoring, payment integrity, competitors, payer guidelines, coverage policies, CMS/Medicare/Medicaid, FHIR/EDI/attachments, **regulatory Models A/B/C ("billing on behalf of payers")**, build/buy/partner, architecture, MVP→V4 roadmap, risks, conclusion, appendices. Charts, TOC, page numbers. |
| `AI_Revenue_Recovery_OS_US_Payer_API_Database.xlsx` | **26-sheet** workbook — Executive Summary, Payer Master, API Master, API Pricing, 8 workflow sheets, Payer Guidelines, Coverage Policies, FHIR, EDI, Clearinghouses, Direct Payer APIs, Free API Options, Payer-Side Opportunity, Payment Integrity, Competitors, CMS 2027, Build/Buy/Partner, Sources, Research Gaps. Color-coded (YES/NO/PARTIAL/UNKNOWN/VARIABLE), frozen headers, filters, hyperlinks. |
| `AI_Revenue_Recovery_OS_Payer_Master.csv` | 43 payer organizations (26-column master per study-2 spec). |
| `AI_Revenue_Recovery_OS_API_Master.csv` | 18 per-API records (provider, standard, direct vs clearinghouse, sandbox/production, pricing, enrollment, auth). |
| `AI_Revenue_Recovery_OS_Payer_Guidelines.csv` | Timely-filing & appeal deadlines (commercial = VARIABLE; government = fixed). |
| `AI_Revenue_Recovery_OS_Executive_Findings.md` | Two-sided executive findings. |

The full 113-field per-payer capability detail lives in `payer_records.py` and the study-2 workbook's per-workflow sheets.

**Final answer (study 2): YES, WITH CONDITIONS.** Start provider-side now on existing clearinghouse APIs (near-$0 MVP via Stedi's free tier); grow into payer-side as **Model A** decision-support and **Model B** administrative services; **Model C** (delegated claims/UM/payment decisions) is long-term and heavily regulated. Final medical-necessity/coverage decisions cannot be made by AI alone (CMS-4201-F; CA SB 1120) — a qualified clinician must own any adverse determination.

## Regenerate

```
pip install reportlab openpyxl pandas matplotlib pymupdf
python3 build_report.py     # study 1 (provider-side)
python3 build_report2.py    # study 2 (two-sided) — run this second; it supersedes shared filenames
```

- `payer_universe.py` — payer identity layer (43 orgs) + 10 infrastructure vendors.
- `research_data.py` — study-1 research-verified facts (standards, adoption, clearinghouse, CMS, payer FHIR).
- `research_data2.py` — study-2 facts (API inventory, payer-side scoring, payment integrity, competitors, regulatory Models A/B/C, free stack, guidelines, coverage policies). Every claim tied to a source id.
- `payer_records.py` — shared 113-field per-payer capability rule engine + scores.
- `build_report.py` / `build_report2.py` — deliverable generators for study 1 and study 2.

## Method & integrity

- Primary sources first: CMS (rules, fact sheets, Administrative Simplification), ASC X12,
  HL7 (FHIR / Da Vinci / CARIN), CAQH (CORE rules, CAQH Index), and vendor developer docs
  (Stedi, Optum/Change, Availity, Waystar, Zelis). Trade press only corroborates figures.
- Values are `YES / PARTIAL / NO / UNKNOWN / NOT APPLICABLE` — never forced binaries.
- **Free sandbox is never equated with free production. Direct payer API is never equated with
  clearinghouse connectivity.** Both distinctions are carried as separate fields.
- Automation Readiness and Digital Coverage scores are *our* analytical constructs, not
  industry-standard measures.
- Research coverage limitation: the 43-organization set is representative, not the full universe
  of thousands of payer IDs; open gaps are enumerated in the Excel **RESEARCH GAPS** sheet. No PHI.

## Headline finding

The U.S. payer ecosystem is not API-uniform, but eligibility, benefits, claim status, claims and
remittance/denials are standardized, high-adoption and reachable **today** via clearinghouse APIs
with free sandboxes (Stedi offers a free production tier). Direct, free, provider-facing payer
APIs barely exist — payer FHIR portals are CMS-9115 *patient-authorized* data, not provider RCM
feeds (Optum is the exception). Prior authorization is the least-automated workflow, moving to
FHIR for CMS-regulated payers by **Jan 1, 2027**. Appeals have no universal standard.

**Recommendation (validated):** Hybrid. Build V1 on clearinghouse/API infrastructure for
eligibility, benefits, claim status and 835; add denial intelligence and patient-responsibility
estimation; use payer FHIR (Provider Access, 2027) selectively; portal/voice/human as fallback;
invest the proprietary effort in the **Payer Intelligence + Orchestration** layer.
