# U.S. Payer API & RCM Automation — Feasibility Research

Evidence-backed feasibility research for **AI Revenue Recovery OS**: what U.S. payer RCM data
can be obtained electronically today, through which channel (EDI / API / FHIR / portal / voice),
whether it is free, whether a sandbox / production path exists, what enrollment is required, and
where portal / voice / human fallback is still necessary.

## Deliverables

| File | What it is |
|---|---|
| `AI_Revenue_Recovery_OS_US_Payer_API_Feasibility_Report.pdf` | 28-page report — exec summary, standards, per-workflow analysis, clearinghouse & FHIR analysis, CMS 2027, MVP/production strategy, risks, appendices, sources, glossary. Charts, TOC, page numbers. |
| `AI_Revenue_Recovery_OS_US_Payer_API_Database.xlsx` | 17-sheet workbook — Executive Summary, Payer Master (113 fields), 7 workflow sheets, Payer Intelligence, Direct Payer APIs, Clearinghouse APIs, Free vs Paid, FHIR, CMS 2027, Sources, Research Gaps. Color-coded, frozen headers, filters, hyperlinks. |
| `AI_Revenue_Recovery_OS_Payer_Master.csv` | 43 payer organizations × 113 capability fields. |
| `AI_Revenue_Recovery_OS_Findings.md` | Condensed findings. |

## Regenerate

```
pip install reportlab openpyxl pandas matplotlib pymupdf
python3 build_report.py
```

- `payer_universe.py` — payer identity layer (43 orgs) + 10 infrastructure vendors.
- `research_data.py` — research-verified facts, every claim tied to a source id.
- `build_report.py` — rule engine (capability flags + scores), charts, and all four outputs.

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
