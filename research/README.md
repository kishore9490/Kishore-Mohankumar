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

**Study 3 — Product build, technology, security & investment cost model**

| File | What it is |
|---|---|
| `AI_Revenue_Recovery_OS_Product_Build_and_Investment_Report.pdf` | 29-page report — product vision & three models, functional scope, tech stack & architecture, multi-tenant, AI architecture & 20-agent workforce, security/HIPAA/compliance, Azure cost, AI runtime & dev-tool cost (Claude Max/ChatGPT), HR & development cost, milestones & plan, 12/24-month budgets, unit economics, connectivity strategy, security controls & PHI data flow, DR/BCP & governance, risks, final recommendation. Charts, TOC, page numbers. |
| `AI_Revenue_Recovery_OS_Product_Cost_Model.xlsx` | **39-sheet** workbook with **~250 assumption-driven formula cells** — edit the ASSUMPTIONS sheet (USD/INR rate, claims/month, team & tool users, per-claim AI cost, contingency) and dependent sheets recalculate. Azure cost by scale/environment, Claude Max/ChatGPT/production-AI cost, human resources, dev/security/HIPAA/compliance cost, milestones, unit economics, MVP/pilot/production & 12/24-month budgets, commercial models, risks, security controls, PHI flow, DR/BCP, AI governance, sources. |
| `AI_Revenue_Recovery_OS_Technology_Architecture.md` | Full technology architecture (design). |
| `AI_Revenue_Recovery_OS_Project_Plan.md` | Build plan, milestones, AI-augmented org. |
| `AI_Revenue_Recovery_OS_Cost_Calculator.html` | **Interactive investment & cost calculator** — a self-contained SaaS-style financial-planning app (open by double-clicking). 23-section nav; every assumption editable with instant recalculation; central assumption engine (no duplicated assumptions); custom cost-item engine (ONE-TIME / MONTHLY / ANNUAL / PER-USER / PER-TENANT / PER-CLAIM / PER-TRANSACTION / PER-MINUTE / PER-GB / PER-API-CALL / PERCENTAGE / QUOTE REQUIRED); HR (USD+INR), Claude Max 5x/20x, ChatGPT (Business + Enterprise = QUOTE REQUIRED), Production-AI model-routing calculator, Azure per-service + stage presets, Healthcare Connectivity routing, Voice/Document AI, Security/HIPAA/SOC2/HITRUST(off)/Legal, Development (AI uplift does **not** cut headcount), editable Milestones, unlimited Scenarios with comparison, Revenue/Unit-Economics, 12/24-month models, Investor View with dynamic top-5 cost drivers + a "How can we reduce cost?" optimization engine (user-approved), What-If sliders, USD/INR (FX editable), localStorage save/load/reset, JSON/CSV/Print-PDF export, sources + tooltips + validation. **All totals are computed live from editable assumptions — no PDF total is hard-coded.** Seed values are labeled *REFERENCE DEFAULT — EDITABLE*. Chart.js is loaded from CDN when online; the app is fully functional offline (charts degrade gracefully). |

Generators: `costmodel.py` (sourced 2026 pricing + scenarios + compute), `build_costmodel.py` (charts, 39-sheet Excel, PDF). The calculator seeds its editable defaults from the same researched figures but computes its own totals independently.

**Cost model headlines (MODEL ASSUMPTIONS, FX Rs 90/USD):** MVP investment ≈ **$383k**; 12-month ≈ **$1.49M**; 24-month ≈ **$4.45M**; Azure **$1.4k/mo (MVP) → $38.7k/mo (large)**; Claude Max baseline **$1,000/mo** (5 × Max 20x); all-in cost per worked claim ≈ **$0.43** (clearinghouse transaction the largest lever; Stedi free tier covers the MVP). Verify live pricing before board commitment; quote-only items (ChatGPT Enterprise, some Azure dedicated capacity) are recorded "Not publicly disclosed". HIPAA-*aligned* (not certified); payer-side is AI decision-support with human governance; no PHI.

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
