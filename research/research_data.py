# -*- coding: utf-8 -*-
"""
Research-verified facts for the U.S. Payer API & RCM Feasibility Report.
Every material claim is tied to a SOURCE id. Values reflect research
completed 2026-08 via official CMS / X12 / HL7 / CAQH / vendor documentation.
Uncertainty is preserved as UNKNOWN / PARTIAL — nothing is fabricated.
"""

REPORT_DATE = "August 18, 2026"

# ----------------------------------------------------------------------
# SOURCES  (id -> title, url, type, confidence)
# type: OFFICIAL | VENDOR | STANDARD | INDUSTRY | TRADE
# ----------------------------------------------------------------------
SOURCES = {
 "cms_0057_fs":   ("CMS-0057-F Interoperability & Prior Authorization Final Rule — Fact Sheet", "https://www.cms.gov/newsroom/fact-sheets/cms-interoperability-prior-authorization-final-rule-cms-0057-f", "OFFICIAL", "High"),
 "cms_0057_fr":   ("CMS-0057-F Federal Register (89 FR 8758, doc 2024-00895)", "https://www.federalregister.gov/documents/2024/02/08/2024-00895/", "OFFICIAL", "High"),
 "cms_0057_pa":   ("CMS Prior Authorization API FAQ", "https://www.cms.gov/priorities/burden-reduction/overview/interoperability/frequently-asked-questions/prior-authorization-api", "OFFICIAL", "High"),
 "cms_0057_prov": ("CMS Provider Access API FAQ", "https://www.cms.gov/priorities/burden-reduction/overview/interoperability/frequently-asked-questions/provider-access-api", "OFFICIAL", "High"),
 "cms_9115_fs":   ("CMS-9115-F Interoperability and Patient Access — Fact Sheet", "https://www.cms.gov/newsroom/fact-sheets/interoperability-and-patient-access-fact-sheet", "OFFICIAL", "High"),
 "cms_9115_p2p":  ("CMS-9115-F Payer-to-Payer enforcement discretion FAQ", "https://www.cms.gov/files/document/cms-9115-payer-payer-enforcement-discretion-faq.pdf", "OFFICIAL", "High"),
 "cms_admin":     ("CMS Administrative Simplification — Adopted Standards & Operating Rules", "https://www.cms.gov/priorities/key-initiatives/burden-reduction/administrative-simplification/hipaa/adopted-standards-operating-rules", "OFFICIAL", "High"),
 "cms_txn":       ("CMS Health Care Transactions Basics", "https://www.cms.gov/files/document/health-care-transactions-basics.pdf", "OFFICIAL", "High"),
 "cms_oprules":   ("CMS Operating Rules for Eligibility and Claims Status", "https://www.cms.gov/Regulations-and-Guidance/Administrative-Simplification/Operating-Rules/OperatingRulesforEligibilityandClaimsStatus", "OFFICIAL", "High"),
 "cms_api_igs":   ("CMS APIs & Implementation Guides (Standards/IGs)", "https://www.cms.gov/priorities/burden-reduction/overview/interoperability/implementation-guides-standards", "OFFICIAL", "High"),
 "x12_carc":      ("X12 Claim Adjustment Reason Codes (CARC)", "https://x12.org/codes/claim-adjustment-reason-codes", "STANDARD", "High"),
 "x12_rarc":      ("X12 Remittance Advice Remark Codes (RARC)", "https://x12.org/codes/remittance-advice-remark-codes", "STANDARD", "High"),
 "caqh_idx24":    ("CAQH Index Report 2024 — From Transactions to Trust", "https://www.caqh.org/hubfs/Index/2024%20Index%20Report/CAQH_IndexReport_2024_FINAL.pdf", "INDUSTRY", "High"),
 "caqh_idx24k":   ("CAQH 2024 Index Report — Key Takeaways", "https://www.caqh.org/hubfs/Index/2024%20Index%20Report/CAQH%202024%20Index%20Report%20Key%20Takeaways%20FINAL.pdf", "INDUSTRY", "High"),
 "caqh_core_dc":  ("CAQH CORE Eligibility & Benefits (270/271) Data Content Rule", "https://www.caqh.org/sites/default/files/core/Eligibility-Benefits-270-271-Data-Content-Rule-.pdf", "STANDARD", "High"),
 "caqh_core_reassoc": ("CAQH CORE Payment & Remittance (835/EFT) Reassociation Rule", "https://www.caqh.org/sites/default/files/core/Payment-Remittance-Reassociation-CCD-835-Rule.pdf", "STANDARD", "High"),
 "caqh_pa_wp":    ("CAQH CORE Prior Authorization White Paper (2024)", "https://www.caqh.org/hubfs/CORE%20-%20Prior%20Authorization%20Whitepaper_062124-2.pdf", "INDUSTRY", "High"),
 "davinci_pas":   ("HL7 Da Vinci Prior Authorization Support (PAS) IG", "https://hl7.org/fhir/us/davinci-pas/", "STANDARD", "High"),
 "davinci_crd":   ("HL7 Da Vinci Coverage Requirements Discovery (CRD) IG", "https://hl7.org/fhir/us/davinci-crd/", "STANDARD", "High"),
 "davinci_dtr":   ("HL7 Da Vinci Documentation Templates and Rules (DTR) IG", "https://hl7.org/fhir/us/davinci-dtr/", "STANDARD", "High"),
 "davinci_cdex":  ("HL7 Da Vinci Clinical Data Exchange (CDex) IG", "https://hl7.org/fhir/us/davinci-cdex/", "STANDARD", "High"),
 "davinci_pdex":  ("HL7 Da Vinci Payer Data Exchange (PDex) IG", "https://hl7.org/fhir/us/davinci-pdex/", "STANDARD", "High"),
 "carin_bb":      ("CARIN Alliance IG for Blue Button (CARIN-BB)", "http://hl7.org/fhir/us/carin-bb/", "STANDARD", "High"),
 "stedi_hc":      ("Stedi Healthcare docs", "https://www.stedi.com/docs/healthcare", "VENDOR", "High"),
 "stedi_price":   ("Stedi pricing (pay-as-you-go)", "https://www.stedi.com/pricing", "VENDOR", "High"),
 "stedi_basic":   ("Stedi Basic (free) plan — 100 free transactions/mo", "https://www.stedi.com/blog/basic-plan", "VENDOR", "High"),
 "stedi_payg":    ("Stedi pay-as-you-go pricing announcement", "https://www.stedi.com/blog/introducing-pay-as-you-go-pricing", "VENDOR", "High"),
 "stedi_net":     ("Stedi payer network (3,500+ payers)", "https://www.stedi.com/healthcare/network", "VENDOR", "High"),
 "stedi_enroll":  ("Stedi transaction enrollment", "https://www.stedi.com/docs/healthcare/transaction-enrollment", "VENDOR", "High"),
 "availity_api":  ("Availity API Marketplace", "https://www.availity.com/api-marketplace/", "VENDOR", "High"),
 "availity_hipaa":("Availity HIPAA Transactions (developer blog)", "https://developer.availity.com/blog/2025/3/25/hipaa-transactions", "VENDOR", "High"),
 "availity_start":("Availity developer getting started (Demo vs Standard plan)", "https://developer.availity.com/partner/gettingstarted", "VENDOR", "High"),
 "optum_dev":     ("Optum (Change Healthcare) developer portal", "https://developer.optum.com/", "VENDOR", "High"),
 "optum_elig":    ("Optum Eligibility & Claims API — get started", "https://developer.optum.com/eligibilityandclaims/docs/get-started-with-optum-api", "VENDOR", "High"),
 "waystar_plat":  ("Waystar platform — claim management", "https://www.waystar.com/our-platform/claim-management/claim-manager/", "VENDOR", "Medium"),
 "zelis_prov":    ("Zelis provider payments / ERA", "https://zelis.com/providers/provider-payments-2/", "VENDOR", "High"),
 "pverify":       ("pVerify eligibility/claim-status/PA API (FHIR)", "https://www.pverify.com/api-developers/", "VENDOR", "Medium"),
 "claimmd":       ("Claim.MD clearinghouse API", "https://www.claim.md/services-software-vendors", "VENDOR", "Medium"),
 "officeally":    ("Office Ally EDI clearinghouse", "https://cms.officeally.com/products/edi-clearinghouse", "VENDOR", "Medium"),
 "inovalon":      ("Inovalon (ABILITY) provider cloud / ONE developer portal", "https://www.inovalon.com/products/provider-cloud/", "VENDOR", "Medium"),
 "lantern":       ("ONC Lantern FHIR endpoint monitoring", "https://lantern.healthit.gov/", "OFFICIAL", "High"),
 "carin_dir":     ("CARIN Alliance FHIR Directory Framework", "https://carinfhirdirectory.com/", "INDUSTRY", "Medium"),
}

# ----------------------------------------------------------------------
# HIPAA X12 TRANSACTION STANDARDS
# (std, name, hipaa_mandated, version_id, rcm_use)
# ----------------------------------------------------------------------
STANDARDS = [
 ("270/271", "Eligibility & Benefit Inquiry / Response", "Mandated", "005010X279A1", "Coverage, plan, benefits, patient financial responsibility"),
 ("276/277", "Claim Status Request / Response", "Mandated", "005010X212", "Real-time claim status"),
 ("278", "Health Care Services Review (Referral / Prior Authorization)", "Mandated", "005010X217", "Prior authorization request/response"),
 ("837P/I/D", "Health Care Claim (Professional / Institutional / Dental)", "Mandated", "005010X222A1 / X223A2 / X224A2", "Claim submission"),
 ("835", "Health Care Claim Payment/Advice (ERA)", "Mandated", "005010X221A1", "Remittance, payment, denial (CARC/RARC)"),
 ("834", "Benefit Enrollment and Maintenance", "Mandated", "005010X220A1", "Enrollment"),
 ("820", "Premium Payment", "Mandated", "005010X218", "Premium payment"),
 ("277CA", "Claim Acknowledgment", "Not mandated (widely used)", "005010X214", "Pre-adjudication accept/reject of 837"),
 ("999", "Implementation Acknowledgment", "Not mandated (industry)", "005010X231A1", "Syntax acknowledgment"),
 ("TA1", "Interchange Acknowledgment", "Not mandated", "X12 interchange", "Envelope/delivery ack"),
]

# ----------------------------------------------------------------------
# CAQH INDEX ADOPTION / COST  (transaction, electronic %, note)
# ----------------------------------------------------------------------
ADOPTION = [
 ("Eligibility & Benefit Verification (270/271)", 96, "Highest-adopted; CORE data-content rule mandates benefit detail"),
 ("Claim Submission (837)", 98, "Near-universal electronic"),
 ("Remittance Advice / ERA (835)", 97, "Near-universal; carries CARC/RARC denial detail"),
 ("Claim Status (276/277)", 81, "Strong but a real automation gap remains"),
 ("Claim Payment (EFT)", 78, "Reassociation via 835 TRN + Nacha CCD+"),
 ("Prior Authorization (278)", 33, "Least automated (~one-third); portal/fax still dominant"),
]
ADOPTION_NOTE = ("Adoption figures: CAQH Index (2023–2024 data years). Manual transactions cost on average "
                 "~$5.43 more than electronic; CAQH estimates $20B+ in remaining annual automation savings "
                 "and ~$222B avoided through existing automation.")

# ----------------------------------------------------------------------
# WORKFLOW CAPABILITY SUMMARY MATRIX  (the required table)
# cols: Standard, API, Free API, Free Sandbox, Production API, Enrollment, Portal, Voice Fallback
# ----------------------------------------------------------------------
WORKFLOW_MATRIX = [
 ("Claim Status",           "YES", "YES", "PARTIAL", "YES", "YES", "PARTIAL", "YES", "YES"),
 ("Eligibility",            "YES", "YES", "PARTIAL", "YES", "YES", "PARTIAL", "YES", "PARTIAL"),
 ("Benefits",               "PARTIAL", "YES", "PARTIAL", "YES", "YES", "PARTIAL", "YES", "PARTIAL"),
 ("Patient Responsibility", "PARTIAL", "PARTIAL", "NO", "PARTIAL", "PARTIAL", "PARTIAL", "YES", "PARTIAL"),
 ("Prior Authorization",    "YES", "PARTIAL", "NO", "PARTIAL", "PARTIAL", "YES", "YES", "YES"),
 ("Denials (835/ERA)",      "YES", "YES", "PARTIAL", "YES", "YES", "YES", "NO", "NO"),
 ("Appeals",                "NO", "PARTIAL", "NO", "NO", "PARTIAL", "YES", "YES", "YES"),
]
WORKFLOW_MATRIX_COLS = ["Workflow","Standard","API","Free API","Free Sandbox","Production API","Enrollment","Portal","Voice Fallback"]

# Per-workflow "what can we build today" traffic-light + narrative
WORKFLOW_BUILD = [
 ("Eligibility Verification", "GREEN",  "270/271 is 96% electronic and available now via clearinghouse APIs with free sandboxes (Stedi, Optum). Build first."),
 ("Benefit Verification",     "GREEN",  "Structured benefits parsed from CORE-enhanced 271 (copay, coinsurance, deductible, remaining). Some fields payer-variable → PARTIAL on completeness."),
 ("Claim Status",             "GREEN",  "276/277 real-time via clearinghouse APIs today; 81% electronic. Build first."),
 ("Denials (ERA / 835)",      "GREEN",  "835 is 97% electronic and carries CARC/RARC + 277CA. AI can derive root cause and recovery path. Enrollment required per payer for 835."),
 ("Claim Submission (837)",   "GREEN",  "98% electronic; needed to support resubmission/correction workflows."),
 ("Patient Responsibility",   "YELLOW", "Payer 271 supplies deductible/coinsurance/copay/accumulators, but exact liability must be CALCULATED by our estimation engine using allowed amounts + accumulators. Label 'Estimated'."),
 ("Prior Authorization",      "ORANGE", "278 exists but only ~one-third electronic; portal + fax dominate today. FHIR (Da Vinci PAS/CRD/DTR) mandated for CMS-regulated payers Jan 1, 2027. Portal/voice fallback now."),
 ("Appeals",                  "RED",    "No universal appeal standard or API. Payer-specific: portal, document upload, fax, mail. Human + portal/voice orchestration required."),
]

# ----------------------------------------------------------------------
# CLEARINGHOUSE / API INFRASTRUCTURE
# fields per vendor
# ----------------------------------------------------------------------
CLEARINGHOUSE_DATA = {
 "Stedi": dict(model="API-first clearinghouse (JSON + raw X12)", elig="YES", status="YES", claims="YES (P/I/D)",
   era="YES", ack="YES (277CA)", pa="NO / UNKNOWN", fhir="NO", devportal="YES", sandbox="YES (free)",
   free_prod="YES — 100 free txns/mo (Basic)", selfserve="YES", pricing="Pay-as-you-go, prepaid credits from $100, no monthly minimum, no per-provider/per-payer fee; exact cents behind calculator (verify)",
   payers="3,500+", enroll="Per provider/txn/payer; 835 always requires enrollment; eligibility usually none",
   realtime="Real-time + batch (10k/batch)", fit="Best fit for self-serve API-first MVP",
   src=["stedi_hc","stedi_price","stedi_basic","stedi_payg","stedi_net","stedi_enroll"]),
 "Availity": dict(model="Clearinghouse + payer network (REST + FHIR)", elig="YES", status="YES (276)", claims="YES (I/P/D)",
   era="YES", ack="UNKNOWN", pa="YES (278 + FHIR PA)", fhir="YES", devportal="YES", sandbox="YES (Demo — mock only)",
   free_prod="Essentials portal free for sponsored payers (not the API)", selfserve="NO (production contract-gated)",
   pricing="Production API pricing not public (contract); Essentials free for sponsored payers",
   payers="Blues-heavy; founded by/for multiple BCBS plans", enroll="EDI/payer enrollment for production",
   realtime="Real-time + batch", fit="Strong for Blues + FHIR prior auth; production requires contract",
   src=["availity_api","availity_hipaa","availity_start"]),
 "Optum (Change Healthcare)": dict(model="Largest clearinghouse (X12→JSON REST)", elig="YES", status="YES", claims="YES",
   era="YES (+275 attachments)", ack="UNKNOWN", pa="UNKNOWN", fhir="PARTIAL (Claim FHIR API)", devportal="YES", sandbox="YES (free, no obligation)",
   free_prod="NO", selfserve="NO (production contracted)", pricing="Production pricing not public (contract)",
   payers='"Most U.S. payers" (exact count not public)', enroll="Payer/EDI enrollment for production",
   realtime="Real-time + batch (mailbox)", fit="Broadest reach; the rare payer-owned direct RCM API (Optum=UHG)",
   src=["optum_dev","optum_elig"]),
 "Waystar": dict(model="Enterprise RCM platform + clearinghouse", elig="YES", status="YES", claims="YES",
   era="YES", ack="UNKNOWN", pa="YES (PA)", fhir="UNKNOWN", devportal="Partner-gated", sandbox="UNKNOWN / likely none",
   free_prod="NO", selfserve="NO", pricing="Custom/enterprise, not public",
   payers="5,000+ payer connections", enroll="Payer enrollment required",
   realtime="Real-time + batch", fit="Enterprise; not self-serve for an early MVP",
   src=["waystar_plat"]),
 "Zelis": dict(model="Payments / ERA network", elig="NO", status="NO", claims="NO",
   era="YES", ack="NO", pa="NO", fhir="NO", devportal="Limited (Enrollments API)", sandbox="UNKNOWN",
   free_prod="NO", selfserve="NO", pricing="Not public",
   payers="330+ via single ERA/EFT enrollment; 550+ insurers", enroll="EFT/ERA enrollment",
   realtime="Batch (ERA delivery)", fit="Remittance/payments layer only — not eligibility/claims",
   src=["zelis_prov"]),
 "pVerify": dict(model="Eligibility API vendor", elig="YES", status="YES", claims="PARTIAL",
   era="UNKNOWN", ack="UNKNOWN", pa="YES", fhir="YES", devportal="YES", sandbox="Free trial",
   free_prod="NO", selfserve="~YES", pricing="Tiered (third-party figures; verify)",
   payers="Many", enroll="Provider enrollment", realtime="Real-time", fit="Eligibility/estimation specialist with FHIR",
   src=["pverify"]),
 "Claim.MD": dict(model="Clearinghouse", elig="YES (400+ payers)", status="YES", claims="YES",
   era="YES", ack="UNKNOWN", pa="UNKNOWN", fhir="NO", devportal="YES (vendor)", sandbox="UNKNOWN",
   free_prod="UNKNOWN", selfserve="~YES", pricing="Not public (low-cost)",
   payers="400+ eligibility", enroll="Provider enrollment", realtime="Real-time + batch", fit="Low-cost vendor integration",
   src=["claimmd"]),
 "Office Ally": dict(model="Low-cost clearinghouse", elig="YES", status="YES", claims="YES",
   era="YES", ack="UNKNOWN", pa="NO", fhir="NO", devportal="Companion guides", sandbox="UNKNOWN",
   free_prod="Portal free (fees may apply)", selfserve="~YES", pricing="Some services free; transaction fees may apply (UNKNOWN)",
   payers="Large", enroll="Provider enrollment", realtime="Real-time + batch", fit="Budget clearinghouse",
   src=["officeally"]),
 "Inovalon (ABILITY)": dict(model="Data platform / clearinghouse", elig="YES (2,300+ payers)", status="YES", claims="YES",
   era="YES", ack="UNKNOWN", pa="UNKNOWN", fhir="PARTIAL (patient access)", devportal="YES (ONE)", sandbox="YES",
   free_prod="NO", selfserve="NO", pricing="Enterprise/contract (UNKNOWN)",
   payers="2,300+", enroll="Enrollment required", realtime="Real-time", fit="Enterprise data platform",
   src=["inovalon"]),
 "Edifecs": dict(model="EDI/FHIR engine (payer-side software)", elig="N/A", status="N/A", claims="N/A",
   era="N/A", ack="N/A", pa="N/A", fhir="X12/FHIR engine", devportal="NO", sandbox="NO",
   free_prod="NO", selfserve="NO", pricing="Enterprise license", payers="N/A", enroll="N/A",
   realtime="N/A", fit="Infrastructure software, not a provider-facing clearinghouse API",
   src=[]),
}
CLEARINGHOUSE_ORDER = ["Stedi","Availity","Optum (Change Healthcare)","Waystar","Zelis","pVerify","Claim.MD","Office Ally","Inovalon (ABILITY)","Edifecs"]

# ----------------------------------------------------------------------
# PAYER DIRECT-API / FHIR VERIFICATION  (org -> facts)
# devportal, patient_access(FHIR), provider_dir(FHIR), direct_rcm_api, fhir_ver, conf, portal_url
# ----------------------------------------------------------------------
PAYER_FHIR = {
 "UnitedHealthcare": dict(dev="YES", pa="YES", pd="YES", rcm="NO (patient-authorized only; Optum=UHG offers direct RCM API)", ver="R4", conf="High", url="https://www.uhc.com/legal/interoperability-apis"),
 "Optum (UHG)": dict(dev="YES", pa="N/A", pd="N/A", rcm="YES — direct provider-facing eligibility/claims/status/ERA REST API + free sandbox", ver="R4 (Claim FHIR API)", conf="High", url="https://developer.optum.com/"),
 "Aetna": dict(dev="YES", pa="YES", pd="YES", rcm="NO (RCM via clearinghouse)", ver="R4", conf="High", url="https://developerportal.aetna.com/"),
 "Cigna Healthcare": dict(dev="YES", pa="YES", pd="YES", rcm="NO (RCM via clearinghouse)", ver="R4", conf="High", url="https://developer.cigna.com/"),
 "Humana": dict(dev="YES", pa="YES", pd="YES", rcm="NO (RCM via clearinghouse)", ver="R4/US Core", conf="High", url="https://developers.humana.com/apis"),
 "Elevance Health (Anthem)": dict(dev="YES", pa="YES", pd="YES", rcm="NO (RCM via Availity)", ver="R4 (CARIN BB STU1)", conf="High", url="https://www.anthem.com/developers"),
 "Centene": dict(dev="YES", pa="YES", pd="YES", rcm="NO (RCM via Availity/clearinghouse)", ver="R4 (implied)", conf="High", url="https://partners.centene.com/"),
 "Molina Healthcare": dict(dev="YES", pa="YES", pd="YES", rcm="NO", ver="R4 (implied)", conf="High", url="https://developer.interop.molinahealthcare.com/"),
 "Kaiser Permanente": dict(dev="PARTIAL", pa="YES", pd="YES", rcm="NO (integrated system)", ver="R4", conf="Medium", url="https://healthy.kaiserpermanente.org/northern-california/pages/technical-information"),
 "Health Care Service Corp (HCSC)": dict(dev="YES", pa="YES", pd="YES", rcm="NO (RCM via Availity)", ver="R4 (implied)", conf="High", url="https://interoperability.hcsc.com/"),
 "Blue Shield of California": dict(dev="YES", pa="YES", pd="YES", rcm="NO", ver="R4", conf="High", url="https://devportal-dev.blueshieldca.com/bsc/fhir-sandbox/"),
 "Florida Blue": dict(dev="YES", pa="YES", pd="YES", rcm="NO (RCM via clearinghouse)", ver="R4 (implied)", conf="High", url="https://developer.bcbsfl.com/interop/interop-developer-portal/"),
 "Highmark": dict(dev="YES", pa="YES", pd="YES", rcm="NO", ver="R4 (4.0.1, explicit)", conf="High", url="https://cmsapiportal.hmhs.com/"),
 "CareFirst BCBS": dict(dev="YES", pa="YES", pd="YES", rcm="NO (patient/payer-to-payer only)", ver="R4 (implied)", conf="High", url="https://developer.carefirst.com/"),
 "Oscar Health": dict(dev="YES", pa="YES", pd="YES", rcm="NO (via 1upHealth)", ver="R4 (Da Vinci PDex STU2)", conf="High", url="https://www.hioscar.com/cms_patient_access_developer_page"),
}

# CMS 2027 timeline items (date, item, detail)
CMS_TIMELINE = [
 ("Jul 1, 2021", "CMS-9115-F Patient Access API + Provider Directory API enforced", "FHIR, patient-authorized member data + public directory (CMS-regulated payers)"),
 ("Dec 8, 2021", "CMS-9115-F Payer-to-Payer provision — enforcement discretion", "Original payer-to-payer requirement not enforced; deferred to CMS-0057-F"),
 ("Jan 1, 2026", "CMS-0057-F operational prior-authorization provisions", "72-hr expedited / 7-day standard decisions; specific denial reason; public PA metrics reporting"),
 ("Jan 1, 2027", "CMS-0057-F FHIR API implementation", "Patient Access (enhanced), Provider Access (new), Payer-to-Payer (new), Prior Authorization (new)"),
]
CMS_IMPACTED = ["Medicare Advantage organizations","State Medicaid & CHIP fee-for-service","Medicaid & CHIP managed care plans","QHP issuers on the Federally-Facilitated Exchanges"]
CMS_APIS = [
 ("Patient Access API", "Enhanced to include prior-authorization information (excl. drugs)", "Patient-authorized (SMART/OAuth)"),
 ("Provider Access API", "Claims/encounter (excl. remittances & cost-sharing), USCDI, prior-auth info", "In-network providers; attribution/bulk; patient opt-out — the RCM-relevant new API"),
 ("Payer-to-Payer API", "Claims/encounter, USCDI, prior-auth info at enrollee direction", "Replaces the unenforced CMS-9115-F provision"),
 ("Prior Authorization API", "End-to-end electronic PA (FHIR; Da Vinci CRD/DTR/PAS recommended)", "HIPAA enforcement discretion for all-FHIR implementers; X12 278 not banned"),
]

# Da Vinci IGs
DAVINCI = [
 ("CRD", "Coverage Requirements Discovery", "Surfaces coverage rules & whether PA is required (CDS Hooks)", "davinci_crd"),
 ("DTR", "Documentation Templates and Rules", "Runs payer questionnaires/CQL in the EHR to gather PA documentation", "davinci_dtr"),
 ("PAS", "Prior Authorization Support", "Submits FHIR PA request, returns decision; bridges to X12 278", "davinci_pas"),
 ("CDex", "Clinical Data Exchange", "Provider↔payer clinical data & attachments for claims/PA", "davinci_cdex"),
 ("PDex", "Payer Data Exchange", "Payer-held member data (payer-to-payer, provider access, patient access)", "davinci_pdex"),
 ("CARIN-BB", "CARIN IG for Blue Button", "Claims/EOB content for Patient Access (ExplanationOfBenefit)", "carin_bb"),
]

# Benefit fields available via CORE-enhanced 271 (field -> availability)
BENEFIT_FIELDS = [
 ("Active coverage / dates", "YES"), ("Plan / product info", "YES"), ("Copay", "YES"),
 ("Coinsurance", "YES"), ("Deductible", "YES"), ("Deductible remaining", "PARTIAL"),
 ("Out-of-pocket maximum", "PARTIAL"), ("OOP remaining", "PARTIAL"),
 ("Service-specific benefits", "PARTIAL"), ("Network / non-network benefits", "PARTIAL"),
 ("Coordination of benefits", "PARTIAL"), ("Authorization indicators", "PARTIAL"),
 ("Allowed amount", "UNKNOWN / rarely in 271"), ("Accumulators (real-time)", "PARTIAL"),
]

GLOSSARY = [
 ("270/271","Eligibility/benefit inquiry and response (X12)."),
 ("276/277","Claim status request and response (X12)."),
 ("277CA","Claim acknowledgment — pre-adjudication accept/reject of an 837."),
 ("278","Health care services review — referral/prior-authorization (X12)."),
 ("835","Electronic remittance advice (ERA) — payment/adjustment detail."),
 ("837","Electronic health care claim (P=professional, I=institutional, D=dental)."),
 ("CARC","Claim Adjustment Reason Code — why a claim/line was adjusted (X12-maintained)."),
 ("RARC","Remittance Advice Remark Code — supplemental remittance detail (CMS-maintained)."),
 ("CAQH CORE","Operating rules for eligibility/claim-status content, infrastructure & connectivity."),
 ("FHIR","HL7 Fast Healthcare Interoperability Resources (R4 = 4.0.1)."),
 ("SMART on FHIR","OAuth2/OpenID authorization framework for FHIR apps."),
 ("Patient Access API","CMS-9115-F FHIR API returning a member's own data with the member's authorization."),
 ("Provider Access API","CMS-0057-F FHIR API sharing attributed-patient data with in-network providers (2027)."),
 ("Da Vinci","HL7 accelerator publishing payer/provider FHIR IGs (CRD, DTR, PAS, CDex, PDex)."),
 ("Clearinghouse","Intermediary that translates and routes X12 transactions between providers and payers."),
 ("ERA/EFT reassociation","Matching an 835 to its EFT deposit via the TRN trace number (Nacha CCD+)."),
 ("CMS-0057-F","2024 CMS Interoperability & Prior Authorization Final Rule."),
 ("CMS-9115-F","2020 CMS Interoperability & Patient Access Final Rule."),
]

def src(idlist):
    """Return formatted source strings for a list of source ids."""
    return [f"{SOURCES[i][0]} — {SOURCES[i][1]}" for i in idlist if i in SOURCES]
