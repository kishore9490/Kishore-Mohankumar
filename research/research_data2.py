# -*- coding: utf-8 -*-
"""
Expansion research data for the two-sided (provider + payer) feasibility
report. Reuses research_data.py (imported as R by the builder). Stable,
domain/known content here; research-fed sections (payment integrity,
competitors, regulatory models, free stack, payer guidelines) are populated
from the parallel research agents. Every material claim ties to a source.
No fabricated pricing; UNKNOWN preserved.
"""
import research_data as R

# Additional sources
SOURCES2 = {
 "bb2":       ("CMS Blue Button 2.0 (Medicare FFS claims FHIR API)", "https://bluebutton.cms.gov/", "OFFICIAL", "High"),
 "dpc":       ("CMS Data at the Point of Care (DPC)", "https://dpc.cms.gov/", "OFFICIAL", "High"),
 "ab2d":      ("CMS AB2D (claims data for MA/Part D)", "https://ab2d.cms.gov/", "OFFICIAL", "Medium"),
 "nppes":     ("NPPES NPI Registry API", "https://npiregistry.cms.gov/api-page", "OFFICIAL", "High"),
 "synthea":   ("Synthea synthetic patient generator", "https://synthetichealth.github.io/synthea/", "STANDARD", "High"),
 "inferno":   ("ONC Inferno / (g)(10) FHIR test kit", "https://inferno.healthit.gov/", "OFFICIAL", "High"),
 "logica":    ("Logica Health FHIR sandbox", "https://www.logicahealth.org/", "STANDARD", "Medium"),
 "mcd":       ("CMS Medicare Coverage Database (NCD/LCD)", "https://www.cms.gov/medicare-coverage-database", "OFFICIAL", "High"),
 "ma_appeals":("CMS Medicare Advantage appeals (Part C)", "https://www.cms.gov/medicare/appeals-grievances/managed-care", "OFFICIAL", "High"),
 "ffs_appeals":("CMS Original Medicare (FFS) appeals — 5 levels", "https://www.cms.gov/medicare/appeals-grievances/fee-for-service", "OFFICIAL", "High"),
 "cfr422":    ("42 CFR Part 422 (Medicare Advantage)", "https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-422", "OFFICIAL", "High"),
 "cfr438":    ("42 CFR Part 438 (Medicaid managed care)", "https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-C/part-438", "OFFICIAL", "High"),
 "erisa503":  ("29 CFR 2560.503-1 (ERISA claims procedure)", "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XXV/subchapter-L/part-2560/section-2560.503-1", "OFFICIAL", "High"),
 "naic_tpa":  ("NAIC TPA (Registration & Regulation) model / state licensing", "https://content.naic.org/", "OFFICIAL", "Medium"),
 "urac_um":   ("URAC Health Utilization Management accreditation", "https://www.urac.org/accreditation-cert/health-utilization-management/", "INDUSTRY", "Medium"),
 "ncqa_um":   ("NCQA Utilization Management accreditation", "https://www.ncqa.org/programs/health-plans/utilization-management-credentialing-um-cr/", "INDUSTRY", "Medium"),
 "cms_fdr":   ("CMS first-tier, downstream & related entities (FDR) oversight", "https://www.cms.gov/medicare/health-drug-plans/compliance-audits", "OFFICIAL", "Medium"),
 "davinci_cdex2":("HL7 Da Vinci CDex — attachments for claims/PA (FHIR)", "https://hl7.org/fhir/us/davinci-cdex/", "STANDARD", "High"),
 "x12_275":   ("X12 275 — Additional Information / claim attachment", "https://x12.org/", "STANDARD", "Medium"),
 "cms4201":   ("CMS-4201-F (2024 MA & Part D final rule — AI/algorithm coverage-decision limits)", "https://www.cms.gov/newsroom/fact-sheets/2024-medicare-advantage-and-part-d-final-rule-cms-4201-f", "OFFICIAL", "High"),
 "sb1120":    ("California SB 1120 — Physicians Make Decisions Act (AI in UM, eff. Jan 1, 2025)", "https://sd13.senate.ca.gov/news/press-release/september-30-2024/governor-signs-physicians-make-decisions-act-keeping-medical", "OFFICIAL", "High"),
 "hipaa_ba":  ("HHS HIPAA Business Associate guidance (45 CFR 160.103 / 164.504(e))", "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html", "OFFICIAL", "High"),
 "aca_extrev":("ACA external review / IRO (45 CFR 147.136)", "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-B/part-147/section-147.136", "OFFICIAL", "High"),
 "cotiviti":  ("Cotiviti payment accuracy", "https://www.cotiviti.com/solutions/payment-accuracy", "VENDOR", "High"),
 "optum_pi":  ("Optum payment integrity", "https://business.optum.com/en/financial-solutions/payment-integrity.html", "VENDOR", "High"),
 "zelis_pi":  ("Zelis payment integrity / ZIPP", "https://www.zelis.com/solutions/payment-integrity/", "VENDOR", "High"),
 "cohere":    ("Cohere Health (payer UM/PA AI)", "https://www.coherehealth.com/", "VENDOR", "High"),
 "anterior":  ("Anterior (payer clinical decisioning AI)", "https://www.anterior.com/", "VENDOR", "High"),
 "davinci_cdex_att":("Da Vinci CDex attachments ($submit-attachment)", "https://hl7.org/fhir/us/davinci-cdex/STU2.1/", "STANDARD", "High"),
}

# ----------------------------------------------------------------------
# API MASTER  (per-API inventory)
# fields: provider, payer, api_name, workflow, standard, fhir, rest, x12,
#         direct, intermediary, public_docs, sandbox, free_sandbox,
#         production, free_prod, paid_prod, pricing, enroll_provider,
#         enroll_payer, auth, oauth, smart, realtime, batch, src, conf
# ----------------------------------------------------------------------
def api(provider,payer,name,workflow,standard,fhir,rest,x12,direct,inter,pub,sb,fsb,prod,fprod,pprod,pricing,ep,epay,auth,oauth,smart,rt,batch,src,conf):
    return dict(provider=provider,payer=payer,api_name=name,workflow=workflow,standard=standard,fhir=fhir,rest=rest,x12=x12,
        direct=direct,intermediary=inter,public=pub,sandbox=sb,free_sandbox=fsb,production=prod,free_prod=fprod,paid_prod=pprod,
        pricing=pricing,enroll_provider=ep,enroll_payer=epay,auth=auth,oauth=oauth,smart=smart,realtime=rt,batch=batch,src=src,conf=conf)

API_MASTER = [
 # Stedi
 api("Stedi","Multi (3,500+)","Eligibility API","Eligibility","270/271","NO","YES","YES","NO","YES","YES","YES","YES","YES","YES (100/mo)","YES","Pay-as-you-go from $100; exact ¢/txn behind calculator (verify)","PARTIAL","NO","API key","NO","NO","YES","YES",["stedi_hc","stedi_price","stedi_basic"],"High"),
 api("Stedi","Multi (3,500+)","Claim Status API","Claim Status","276/277","NO","YES","YES","NO","YES","YES","YES","YES","YES","YES (100/mo)","YES","Pay-as-you-go","PARTIAL","NO","API key","NO","NO","YES","YES",["stedi_hc","stedi_price"],"High"),
 api("Stedi","Multi (3,500+)","Claims API (837)","Claims","837P/I/D","NO","YES","YES","NO","YES","YES","YES","YES","YES","YES (100/mo)","YES","Pay-as-you-go","YES","NO","API key","NO","NO","YES","YES",["stedi_hc"],"High"),
 api("Stedi","Multi (3,500+)","Remittance (835) API","Denials","835","NO","YES","YES","NO","YES","YES","YES","YES","YES","YES (100/mo)","YES","Pay-as-you-go","YES (835 enroll)","NO","API key","NO","NO","YES","YES",["stedi_hc","stedi_enroll"],"High"),
 # Availity
 api("Availity","Blues-heavy","Eligibility & Benefits API","Eligibility/Benefits","270/271","YES","YES","YES","NO","YES","YES","YES (mock)","YES","YES","NO","YES","Not publicly disclosed (contract)","YES","YES","OAuth2","YES","NO","YES","YES",["availity_api","availity_start"],"High"),
 api("Availity","Blues-heavy","Claim Status API","Claim Status","276/277","NO","YES","YES","NO","YES","YES","YES (mock)","YES","YES","NO","YES","Not publicly disclosed","YES","YES","OAuth2","YES","NO","YES","YES",["availity_api"],"High"),
 api("Availity","Blues-heavy","Authorization/Referral (278) + FHIR PA","Prior Auth","278 / FHIR PAS","YES","YES","YES","NO","YES","YES","YES (mock)","YES","YES","NO","YES","Not publicly disclosed","YES","YES","OAuth2","YES","PARTIAL","YES","NO",["availity_api","availity_hipaa"],"High"),
 # Optum / Change
 api("Optum (Change)","Most U.S. payers","Eligibility API","Eligibility","270/271","NO","YES","YES","NO","YES","YES","YES","YES","YES","NO","YES","Not publicly disclosed (contract)","YES","YES","OAuth2","YES","NO","YES","YES",["optum_dev","optum_elig"],"High"),
 api("Optum (Change)","Most U.S. payers","Claim Status API","Claim Status","276/277","NO","YES","YES","NO","YES","YES","YES","YES","YES","NO","YES","Not publicly disclosed","YES","YES","OAuth2","YES","NO","YES","YES",["optum_dev"],"High"),
 api("Optum (Change)","Most U.S. payers","Claims + ERA + Attachments (275)","Claims/Denials","837/835/275","PARTIAL","YES","YES","NO","YES","YES","YES","YES","YES","NO","YES","Not publicly disclosed","YES","YES","OAuth2","YES","NO","YES","YES",["optum_dev"],"High"),
 # Waystar / Zelis / pVerify
 api("Waystar","5,000+","Eligibility/Status/Claims/ERA","Multiple","270/271·276/277·837·835","UNKNOWN","YES","YES","NO","YES","PARTIAL","UNKNOWN","UNKNOWN","YES","NO","YES","Custom/enterprise (not public)","YES","YES","OAuth2","YES","NO","YES","YES",["waystar_plat"],"Medium"),
 api("Zelis","330–550+ (ERA)","ERA/EFT enrollment + delivery","Denials/Payment","835","NO","YES","YES","NO","YES","PARTIAL","UNKNOWN","YES","NO","NO","YES","Not public","YES (EFT/ERA)","NO","API key","NO","NO","NO","YES",["zelis_prov"],"High"),
 api("pVerify","Many","Eligibility/Status/PA API","Eligibility/Estimation","270/271 + FHIR","YES","YES","YES","NO","YES","YES","Free trial","YES","YES","NO","YES","Tiered (3rd-party; verify)","YES","NO","API key","PARTIAL","PARTIAL","YES","NO",["pverify"],"Medium"),
 # CMS / government (patient-authorized / free)
 api("CMS","Medicare FFS","Blue Button 2.0","Patient claims (Medicare FFS)","FHIR R4 (CARIN)","YES","YES","NO","YES","NO","YES","YES","YES","YES","YES","NO","Free (patient-authorized)","NO","N/A","OAuth2 / SMART","YES","YES","YES","YES",["bb2"],"High"),
 api("CMS","Medicare FFS","Data at the Point of Care (DPC)","Provider access to Medicare claims","FHIR R4 (Bulk)","YES","YES","NO","YES","NO","YES","YES","YES","YES","YES","NO","Free (attribution-based pilot)","YES","N/A","OAuth2","YES","NO","NO","YES",["dpc"],"Medium"),
 api("CMS","N/A","NPPES NPI Registry API","Provider directory (NPI)","REST/JSON","NO","YES","NO","NO","NO","YES","N/A (live free)","N/A","YES","YES","NO","Free, public","NO","NO","None","NO","NO","YES","NO",["nppes"],"High"),
 # Payer patient-access (representative — patient-authorized, free)
 api("Health plans (CMS-regulated)","MA/Medicaid/CHIP/QHP","Patient Access API (FHIR)","Member data access","FHIR R4 (CARIN/PDex)","YES","YES","NO","YES","NO","YES","YES","YES","YES","YES","NO","Free (patient-authorized; NOT provider RCM)","NO","N/A","OAuth2 / SMART","YES","PARTIAL","YES","YES",["cms_9115_fs"],"High"),
 api("Health plans (CMS-regulated)","MA/Medicaid/CHIP/QHP","Provider Access API (FHIR) — 2027","Attributed-patient data to providers","FHIR R4 (PDex)","YES","YES","NO","YES","NO","YES","PARTIAL","PARTIAL (2027)","UNKNOWN","UNKNOWN","UNKNOWN","Mandated 2027 (CMS-0057-F); pricing UNKNOWN","YES","NO","OAuth2","YES","NO","NO","YES",["cms_0057_prov"],"Medium"),
]

# ----------------------------------------------------------------------
# EDI STANDARDS MATRIX (extended: sender/receiver/clearinghouse dep)
# ----------------------------------------------------------------------
EDI_MATRIX = [
 ("270","Eligibility inquiry","Provider→Payer","Mandated","Real-time via clearinghouse","YES"),
 ("271","Eligibility response","Payer→Provider","Mandated","Benefit detail (CORE-enhanced)","YES"),
 ("276","Claim status inquiry","Provider→Payer","Mandated","Real-time","YES"),
 ("277","Claim status response","Payer→Provider","Mandated","Status detail","YES"),
 ("277CA","Claim acknowledgment","Payer/CH→Provider","Not mandated","Accept/reject of 837","YES"),
 ("278","Services review / prior auth","Provider↔Payer","Mandated","Low adoption; portal/fax common","YES"),
 ("837P","Professional claim","Provider→Payer","Mandated","Submission","YES"),
 ("837I","Institutional claim","Provider→Payer","Mandated","Submission","YES"),
 ("837D","Dental claim","Provider→Payer","Mandated","Submission","YES"),
 ("835","Remittance advice (ERA)","Payer→Provider","Mandated","CARC/RARC denial detail; enroll req","YES"),
 ("275","Additional information/attachment","Provider→Payer","Not mandated (proposed)","Claim/PA attachments; FHIR CDex emerging","PARTIAL"),
 ("999","Implementation acknowledgment","Any↔Any","Not mandated","Syntax ack","YES"),
 ("TA1","Interchange acknowledgment","Any↔Any","Not mandated","Envelope ack","YES"),
]

# ----------------------------------------------------------------------
# FHIR RESOURCES / APIS
# ----------------------------------------------------------------------
FHIR_RESOURCES = [
 ("Patient Access API","CMS-9115-F","Coverage, ExplanationOfBenefit, USCDI","Patient-authorized (SMART)","Live (2021)","Member data — NOT provider RCM"),
 ("Provider Directory API","CMS-9115-F","Practitioner, Organization, Location (Plan-Net)","Public","Live (2021)","Directory data"),
 ("Provider Access API","CMS-0057-F","Claims/encounter, USCDI, PA info","Attributed providers; opt-out","2027","RCM-relevant new API"),
 ("Payer-to-Payer API","CMS-0057-F","Claims/encounter, USCDI, PA info","Enrollee-directed","2027","Data follows patient"),
 ("Prior Authorization API","CMS-0057-F","PA request/response (Da Vinci PAS)","SMART/OAuth","2027","Wraps X12 278"),
 ("Coverage Requirements Discovery (CRD)","Da Vinci","Is PA required? coverage rules","CDS Hooks","Emerging","Denial prevention"),
 ("Documentation Templates & Rules (DTR)","Da Vinci","PA documentation gathering (CQL)","In-EHR","Emerging","PA docs"),
 ("Clinical Data Exchange (CDex)","Da Vinci","Attachments for claims/PA","FHIR Task/Query","Emerging","Attachments"),
 ("CARIN Blue Button","CARIN","ExplanationOfBenefit (claims/EOB)","Patient-authorized","Live","Claims content for Patient Access"),
]

# ----------------------------------------------------------------------
# TWO-SIDED WORKFLOWS
# ----------------------------------------------------------------------
PROVIDER_WORKFLOWS = ["Eligibility","Benefits","Prior Authorization","Claim Submission","Claim Status","Payment/ERA","Denials","Appeals","Recovery"]
PAYER_WORKFLOWS = ["Claim Intake","Claim Validation","Eligibility/Benefit Validation","Coding/Policy Checks","Medical Necessity/UM","Adjudication Support","Payment/Denial Decision Support","Provider Communication","Appeals/Grievances","Payment Integrity","Analytics"]

# ----------------------------------------------------------------------
# PAYER-SIDE OPPORTUNITY SCORING
# (workflow, market, feasibility, api_avail, reg_complexity(1-10 higher=worse),
#  integration, human_dep(1-10 higher=more), ai_opp, revenue, model, note)
# composite computed in builder
# ----------------------------------------------------------------------
PAYER_SIDE = [
 ("Claim Intake & Validation AI", 8, 8, 7, 3, 6, 4, 9, 7, "Model A (SaaS)", "Parse/validate 837, detect missing/duplicate/mismatch — non-discretionary, low regulatory risk."),
 ("Eligibility/Benefit Validation", 7, 8, 8, 3, 6, 3, 8, 6, "Model A", "Confirm coverage/plan/network against member data — decision support."),
 ("Coding/Policy Checks (edits)", 8, 7, 6, 5, 6, 5, 8, 8, "Model A/B", "Claim editing vs. policy (NCCI, payer rules); mature market (Lyric, Optum)."),
 ("Adjudication Decision Support", 8, 6, 5, 8, 7, 7, 8, 8, "Model A → C", "AI assists rules engine/staff; FINAL coverage/payment decisions cannot be AI-alone. Regulatory/legal review required."),
 ("Payment Integrity (prepay/postpay)", 9, 6, 6, 6, 7, 6, 9, 9, "Model A/B", "Duplicate/overpayment/FWA/DRG/COB; large market (Cotiviti, Optum, EXL). Strong AI fit."),
 ("Denial Decision Support", 7, 7, 6, 7, 6, 7, 8, 7, "Model A", "Identify likely denial reason vs policy/auth/docs; human makes the denial (clinical denials need a clinician)."),
 ("Provider Communication", 8, 8, 7, 4, 5, 4, 8, 6, "Model A/B", "Status, missing-info, denial-explanation, appeal-requirement messaging."),
 ("Appeal/Grievance Workflow", 7, 7, 5, 7, 6, 7, 7, 6, "Model B", "Intake/classify/route/draft + SLA monitoring; final determinations follow regulated appeal processes."),
 ("Utilization Mgmt / Prior Auth Admin", 8, 5, 5, 9, 7, 8, 7, 8, "Model C (delegated)", "Highly regulated: UR laws, URAC/NCQA, clinician denials, MA/Medicaid rules, AI limits. Regulatory/legal review required."),
 ("Delegated Claims Operations / TPA", 7, 4, 6, 9, 8, 8, 6, 8, "Model C (TPA)", "Likely TPA licensing + delegation agreement + oversight/audit. Regulatory/legal review required."),
]

# ----------------------------------------------------------------------
# BUILD / BUY / PARTNER
# ----------------------------------------------------------------------
BUILD_BUY_PARTNER = [
 ("Eligibility (270/271)", "BUY / PARTNER", "Clearinghouse API (Stedi/Optum/Availity); commoditized. Don't rebuild connectivity."),
 ("Benefits (271 parsing)", "BUY + BUILD", "Buy the transaction; build structured benefit normalization."),
 ("Claim Status (276/277)", "BUY / PARTNER", "Clearinghouse API; commoditized."),
 ("Claim Submission (837)", "BUY / PARTNER", "Clearinghouse; add validation/scrubbing (BUILD)."),
 ("ERA/Denials (835)", "BUY + BUILD", "Buy the 835; build denial intelligence (root cause, recovery)."),
 ("Patient Responsibility Estimation", "BUILD", "Own estimation engine over payer data; label as estimate."),
 ("Prior Authorization", "PARTNER + BUILD", "Portal/voice now; FHIR PAS (2027); build requirements/denial intelligence."),
 ("Appeals", "BUILD + HUMAN", "No standard API; build drafting/orchestration; human authors clinical appeals."),
 ("AI Voice", "BUY / INTEGRATE", "Voice provider/telephony; orchestrate as last resort."),
 ("Payer Intelligence", "BUILD", "Proprietary moat — payer behavior, channels, outcomes."),
 ("Orchestration engine", "BUILD", "Proprietary moat — right-channel decisioning + audit."),
 ("Payment Integrity", "BUILD (later) / PARTNER", "Large regulated market; enter after provider-side base."),
 ("Payer-side Adjudication", "PARTNER / HIGHLY REGULATED", "Decision support only; delegated functions need contract + oversight + legal review."),
 ("Coverage-policy retrieval/parsing", "BUILD", "Retrieve NCD/LCD + payer medical policies; map to CPT/HCPCS/ICD-10 for denial prevention."),
]

# Regulatory models (skeleton — enriched by regulatory research below)
MODELS = [
 ("Model A — Technology assists payer staff",
  "SaaS decision-support under a HIPAA Business Associate Agreement. The payer's qualified personnel make every final coverage/payment/medical-necessity decision; the platform surfaces evidence, edits, likely denial reasons and drafts.",
  "Lowest barrier. BAA + security/compliance. No delegation, no TPA license, no clinical licensure by the vendor. Feasible for a startup.",
  "Feasible (startup-appropriate)"),
 ("Model B — Delegated administrative / operational services",
  "Non-discretionary administrative/BPO services under a payer contract (e.g., claim intake/validation, correspondence, appeal intake & routing, SLA monitoring). No discretionary coverage decisions.",
  "Payer contract + delegation of administrative functions; oversight/audit obligations; potential TPA registration depending on state and scope; FDR obligations for MA/Medicaid.",
  "Feasible with contracts & compliance"),
 ("Model C — Delegated claims / UM / payment functions",
  "Discretionary functions performed on the payer's behalf (claims adjudication, utilization management/prior-auth determinations, payment decisions).",
  "Heavily regulated: likely TPA licensing; UR/UM laws and URAC/NCQA accreditation; clinician-made medical-necessity denials; 42 CFR 422 (MA) / 438 (Medicaid) delegation & oversight; ERISA claims procedure; state approval. AI cannot make final medical-necessity/coverage decisions alone.",
  "Long-term only — regulatory/legal review required"),
]

# ----------------------------------------------------------------------
# PAYMENT INTEGRITY VENDORS  (vendor, category, positioning, side, conf)
# ----------------------------------------------------------------------
PAYMENT_INTEGRITY = [
 ("Cotiviti","Payment accuracy (prepay+postpay)","Leading payer platform: coding correction, medical-record validation, prepay claim integrity & COB; champions postpay→prepay shift.","Payer","High"),
 ("Optum (Optum Insight)","Payment integrity across claim lifecycle","AI-driven claim selection/review, FWA, 'payment precision' pushing edits upstream; owns InterQual UM criteria; cites 8–10% medical-cost savings.","Payer","High"),
 ("Zelis","Claims pricing + payment integrity","Zelis Intelligent Pricing Platform (2025) unifies pricing + integrity; prices ~$155B claims/yr, 750+ payers; prepay error/coding minimization.","Payer","High"),
 ("EXL Health","Payment integrity analytics + services","AI/ML predictive modeling + anomaly detection moving payers upstream to prepay prevention; managed service or hosted platform.","Payer","High"),
 ("Gainwell (incl. HMS)","Government/Medicaid payment integrity","COB/TPL ('payer of last resort'), FWA, clinical claim review, program-integrity — heavily Medicaid/state agencies.","Payer (govt)","High"),
 ("Lyric (ex-ClaimsXten)","Prepay claims editing / payment accuracy","35-yr claims-editing lineage (ex-Change Healthcare); AI/ML prepay editing; cites $14B annual customer savings, 9 of top-10 payers.","Payer","High"),
 ("ClarisHealth","Payment-integrity operating system (SaaS)","Pareo platform unifies prepay+postpay, insourced+outsourced overpayment inventory, vendor optimization, FWA case mgmt.","Payer","High"),
 ("Machinify (New Mountain)","AI-native payment integrity","New Mountain combined Machinify + Rawlings + Apixio PI + Varis (~$5B, 60+ plans, 160M+ lives): subrogation, COB, pharmacy PI.","Payer","High"),
 ("Codoxo","GenAI FWA + payment integrity","Unified Cost Containment (pre-claim→prepay→postpay), FWA, provider education; $35M Series C.","Payer","High"),
]
PI_MARKET_NOTE = ("U.S. payment-integrity market-size estimates vary widely by definition (software-only vs services-inclusive): "
 "e.g., Precedence Research ~$10.3B by 2033; other firms range ~$1–15B across 2024–2025 bases. Cite a range, not a point — Low confidence.")

# ----------------------------------------------------------------------
# COMPETITIVE LANDSCAPE  (company, category, positioning, side, conf)
# ----------------------------------------------------------------------
COMPETITORS = [
 ("Cohere Health","Payer UM / prior auth AI","Cohere Unify (350+ clinical models): UM, PA, payment integrity, appeals; up to ~85% real-time auth approvals; smart gold-carding.","Payer","High"),
 ("Availity (AuthAI)","Clearinghouse + auth AI","Payer-provider 'front door' (3.4M+ providers); End-to-End Authorizations render <90s determinations; positioned for CMS-0057 FHIR PA.","Both","High"),
 ("Rhyme (ex-PriorAuthNow)","EHR-integrated PA network","Touchless PA connecting providers & payers, point-of-care gold-carding; 4M+ auths/yr, 80+ systems.","Both","High"),
 ("Myndshft (DrFirst)","PA + benefits verification","End-to-end PA/patient-access (medical + pharmacy); real-time eligibility ~94% covered lives; acquired by DrFirst 2024.","Provider","High"),
 ("Anterior (ex-Co:Helm)","Payer clinical decisioning AI","'Florence' automates PA record prep & clinical reasoning for payers (~74% faster); ~$64M raised; deployed with plans.","Payer","High"),
 ("Develop Health","GenAI medication-access / PA","EHR-integrated LLM PA + benefits for prescribers; AI fax/phone fallback; $14.3M Series A.","Provider","High"),
 ("MCG / InterQual","UM clinical criteria","Two dominant medical-necessity criteria sets (InterQual owned by Optum; MCG by Hearst) applied in UM/PA.","Payer","High"),
 ("Waystar","End-to-end RCM software","Category leader ($1.1B 2025 rev); agentic AI across denials, prior auth, recoupment; acquired Iodine.","Provider","High"),
 ("Adonis","AI RCM orchestration","Intelligence + AI agents for provider revenue ops; $40M Series C (2026).","Provider","High"),
 ("Candid Health","Autonomous RCM / billing","Auto-corrects claims pre-submission; $120M Series D (2026); 200+ provider orgs.","Provider","High"),
 ("Smarter Technologies (Thoughtful AI)","Enterprise AI RCM","New Mountain merger of Thoughtful.ai + Access Healthcare + SmarterDx (~$800M projected rev).","Provider","High"),
 ("Infinitus","Agentic voice AI","Automates provider↔payer phone calls (benefit verification, PA, status); 35,000+ providers.","Provider","High"),
 ("Fathom","Autonomous medical coding","90%+ automation multi-specialty coding; CVS Health Ventures investment (2026).","Provider","High"),
]

# ----------------------------------------------------------------------
# FREE MVP API STACK  (resource, provider, purpose, free, sandbox_prod, limits, src, conf)
# ----------------------------------------------------------------------
FREE_STACK = [
 ("Blue Button 2.0","CMS","Medicare FFS claims (FHIR R4), beneficiary OAuth","YES","Sandbox (synthetic) + prod (app review)","10k synthetic users; ~4 yrs history; 60M+ beneficiaries","bb2","High"),
 ("Data at the Point of Care","CMS","Bulk Medicare FFS claims to treating providers (Bulk FHIR)","YES","Sandbox open; prod pilot (apps paused — verify)","Provider-treatment relationship; production onboarding paused","dpc","High"),
 ("AB2D","CMS","Bulk Medicare A/B claims for standalone PDP sponsors","YES","Public sandbox; prod gated to PDP sponsors","Only active PDP sponsors","ab2d","High"),
 ("Synthea / SyntheticMass","MITRE","Synthetic patients (FHIR R4/STU3, C-CDA, CSV)","YES","Generate locally / download","Synthetic only; SyntheticMass API is STU3","synthea","High"),
 ("HAPI FHIR public server","HAPI/Smile","Open FHIR R4/STU3 test endpoint","YES","Public test server","Data periodically wiped; no SLA; not for PHI","inferno","High"),
 ("Da Vinci reference implementations","HL7 Da Vinci","PAS/CRD/DTR/PDex/PCDE reference servers","YES","Public RIs / self-host","Demos, not production payers","davinci_pas","High"),
 ("Logica / Meld sandbox","Logica Health","SMART-on-FHIR sandbox + EHR simulator","YES","Sandbox","Retiring to Meld CE — verify current status","logica","Medium"),
 ("Inferno / ONC (g)(10)","ONC / HHS","FHIR conformance & certification testing","YES","Hosted + self-host","Testing tool, not a data source","inferno","High"),
 ("NPPES NPI Registry API","CMS/HHS","Public provider (NPI) lookup (REST/JSON)","YES","Public production, no token","Undocumented rate limits; ~200 results/req","nppes","High"),
 ("CMS datasets (PDC, MCD, fee schedules)","CMS","Provider data; NCD/LCD coverage DB; fee schedules","YES","Public download / data.cms.gov","Reference/bulk, not real-time claims","mcd","High"),
 ("Stedi (free tier)","Stedi","270/271, 276/277, 837, 835 — real production","YES","Sandbox + free Basic production","100 free/mo each; then pay-as-you-go","stedi_basic","High"),
 ("Availity (Demo)","Availity","Payer-connectivity APIs (mock)","YES (sandbox)","Demo (mock); production gated","No PHI in demo; production application required","availity_start","High"),
 ("Optum (sandbox)","Optum","Eligibility/claims APIs (mock)","YES (sandbox)","Sandbox; production paid subscription","No production-data testing in sandbox","optum_dev","High"),
 ("CARIN Blue Button RI","HL7/CARIN","Payer→consumer claims FHIR IG + RI","YES","Reference implementation / self-host","RI + samples, not a live payer","carin_bb","High"),
]
FREE_STACK_NOTE = ("A genuine $0 build/test MVP is achievable (Synthea + HAPI/Da Vinci/CARIN RIs + Inferno + NPPES/CMS data + CMS Blue Button/DPC/AB2D sandboxes). "
 "Real production payer transactions generally require payer enrollment and — beyond Stedi's free Basic tier (100/mo each) — usage-based clearinghouse fees. "
 "Verify current status of DPC (production paused) and Logica (retiring to Meld).")

# ----------------------------------------------------------------------
# REGULATORY NOTES  (topic, note, src ids)
# ----------------------------------------------------------------------
REG_NOTES = [
 ("Who the rules attach to","Regulatory obligations attach to who exercises discretion. Moving Model A→B→C, the vendor progressively becomes the regulated actor (TPA / UR agent / potential ERISA fiduciary / FDR) rather than a tool supplier.",["cfr422"]),
 ("TPA licensing","Most states license/register Third-Party Administrators that adjust/settle/administer claims for plans (NAIC TPA model act). Pure SaaS (Model A) is usually not a TPA; adjudicating/processing claims (Model B) typically triggers TPA licensure. State-by-state — legal review required.",["naic_tpa"]),
 ("Utilization management","State UR laws + URAC/NCQA accreditation govern UM conduct/timeframes. Adverse medical-necessity determinations must be made by a qualified clinician (licensed physician/peer in specialty) — not AI alone. If the vendor renders determinations it becomes a UR agent.",["urac_um","ncqa_um","cfr422"]),
 ("Medicare Advantage","42 CFR 422: MA org retains responsibility; contractors are first-tier/downstream/related entities (FDRs) subject to CMS oversight/audit. Adverse determinations need physician review (422.566(d)). CMS-4201-F: medical-necessity must be individualized, not based on an algorithm ignoring the patient — AI cannot be the sole basis.",["cfr422","cms4201","cms_fdr"]),
 ("Medicaid managed care","42 CFR 438: MCO retains full responsibility; subcontractors (438.230) inherit oversight, 10-yr audit access, appeals-record retention; states may require prior approval.",["cfr438"]),
 ("ERISA","29 CFR 2560.503-1 governs claims/appeals timeframes and 'full and fair review' for self-funded plans. A vendor exercising discretion over claims/appeals (Model C) may become an ERISA fiduciary. Decision-support (A) / ministerial (B) generally are not — fact-specific.",["erisa503"]),
 ("HIPAA / BAA","A vendor handling PHI is a business associate under a BAA in all models — but a BAA is a floor, not a ceiling. It governs PHI safeguards; it does not authorize the TPA/UR/fiduciary/FDR obligations that attach when the vendor makes decisions.",["hipaa_ba"]),
 ("External review / prompt pay","State prompt-pay laws apply to anyone adjudicating/paying claims (B/C). ACA requires external review via independent IROs (45 CFR 147.136); vendors handling appeals must interoperate with — not substitute for — that layer.",["aca_extrev"]),
 ("AI restriction trend","Restrictions on AI in coverage/PA decisions are accelerating: CMS-4201-F (MA, individualized determinations) and California SB 1120 (eff. Jan 1, 2025 — final medical-necessity decisions by a licensed clinician, not AI). Multi-state, fast-moving — per-state legal review required.",["cms4201","sb1120"]),
]

# Government appeal frameworks (well-documented)
APPEAL_FRAMEWORKS = [
 ("Medicare FFS","5 levels: 1) Redetermination (MAC), 2) Reconsideration (QIC), 3) ALJ/OMHA hearing, 4) Medicare Appeals Council, 5) Federal court.","ffs_appeals"),
 ("Medicare Advantage","Organization determination → reconsideration → Independent Review Entity (IRE/Maximus) → ALJ → Council → court.","ma_appeals"),
 ("Medicaid managed care","Plan appeal (42 CFR 438 subpart F) → state fair hearing; external review where applicable.","cfr438"),
 ("Commercial / ERISA","Internal appeal(s) per 29 CFR 2560.503-1 → external review (IRO) under ACA (45 CFR 147.136).","erisa503"),
]

# manual / appeals / coverage sources
SOURCES3 = {
 "uhc_guide":("UnitedHealthcare Care Provider Administrative Guide", "https://www.uhcprovider.com/en/admin-guides.html", "OFFICIAL", "Medium"),
 "aetna_cpb":("Aetna Clinical Policy Bulletins (CPBs)", "https://www.aetna.com/health-care-professionals/clinical-policy-bulletins/medical-clinical-policy-bulletins.html", "OFFICIAL", "Medium"),
 "cigna_app":("Cigna appeals & disputes (180-day appeal)", "https://www.cigna.com/health-care-providers/coverage-and-claims/appeals-disputes", "OFFICIAL", "High"),
 "humana_app":("Humana reconsiderations & appeals", "https://provider.humana.com/coverage-claims/payment-integrity/reconsiderations-appeals", "OFFICIAL", "Medium"),
 "anthem_pol":("Anthem/Elevance provider news & policies (via Availity)", "https://providernews.anthem.com", "OFFICIAL", "Low"),
 "fl_blue":("Florida Blue provider (appeals via Availity PASSPORT)", "https://www.floridablue.com/providers", "OFFICIAL", "Low"),
 "cms_aic":("CMS Medicare appeals AIC thresholds CY2026 (Federal Register)", "https://www.federalregister.gov/documents/2025/12/04/2025-21879/", "OFFICIAL", "High"),
 "interqual":("Optum InterQual clinical criteria (license-gated)", "https://business.optum.com/en/operations-technology/clinical-decision-support/interqual.html", "VENDOR", "High"),
}

# PAYER GUIDELINES
# (payer, timely_filing, appeal_deadline, method, manual_src, conf)
PAYER_GUIDELINES = [
 ("UnitedHealthcare","VARIABLE (per participation agreement; MA claims 365d floor)","VARIABLE by LOB (~65d MA reconsideration)","Provider portal / Availity","uhc_guide","VARIABLE"),
 ("Aetna","VARIABLE (~90d in-net / 12mo OON per contract; 180d Medicaid MC)","Reconsideration ~180d → 2nd-level ~60d (verify)","Availity / fax / mail","aetna_cpb","Medium"),
 ("Cigna","VARIABLE (~90d in / 180d OON; CA 365d)","Appeal within 180 calendar days (per Cigna appeals page)","CignaforHCP / payment-review form / mail / fax","cigna_app","Medium-High"),
 ("Humana","MA 365d from DOS (fixed); commercial VARIABLE","MA reconsideration 65d (fixed); commercial ~180d","provider.humana.com","humana_app","MA: High"),
 ("Elevance / Anthem","UNKNOWN / VARIABLE by state (90 vs 180d cited)","Provider Dispute Resolution: 2-step, state-specific","Availity Payment Appeal Tool","anthem_pol","Low/Variable"),
 ("Florida Blue (BCBS)","VARIABLE (~365d default; contract may be shorter)","~1yr most denials; MA 60d","Availity PASSPORT (Electronic Appeal)","fl_blue","Low/Variable"),
 ("Medicare FFS (CMS)","1 year from DOS (fixed rule)","Redetermination 120d → Reconsideration 180d → ALJ 60d → Council 60d → court 60d","MAC","ffs_appeals","High"),
 ("Medicare Advantage","MA 365d claim floor","Plan reconsideration 65d → IRE (C2C from 5/1/2026) → ALJ → Council → court","Plan portal / CMS","ma_appeals","High"),
 ("Medicaid managed care","State-set (fixed by 42 CFR 438)","Plan appeal ≤30d resolution → state fair hearing (request 90–120d)","Plan portal / state","cfr438","High"),
]
PAYER_GUIDELINES_NOTE = ("Commercial timely-filing and appeal windows are contract/plan/state-specific (documented range ~90 days to 12–18 months) — "
 "store them as configurable per-payer/plan/state values sourced from the live manual + signed contract, never a single hard-coded number. "
 "Only the government frameworks are fixed rules. CY2026 Medicare AIC thresholds: $200 (ALJ), $1,960 (federal court). "
 "Part C IRE changed from Maximus to C2C Innovative Solutions effective May 1, 2026.")

# COVERAGE POLICY INFRASTRUCTURE  (source, type, code-mappable, access)
COVERAGE_POLICIES = [
 ("CMS NCDs (National Coverage Determinations)","Nationwide Medicare coverage policy","YES (CPT/HCPCS/ICD-10 via MCD)","Free, public (Medicare Coverage Database)","mcd"),
 ("CMS LCDs + Articles (Local Coverage)","MAC 'reasonable & necessary' policy; Articles carry coding","YES (richest machine-mappable source)","Free, public (MCD)","mcd"),
 ("Payer medical policies / Clinical Policy Bulletins","Per-payer medical-necessity definitions","PARTIAL (CPT/HCPCS referenced; format varies)","Public per payer; not uniform","aetna_cpb"),
 ("InterQual (Optum)","Proprietary UM clinical criteria","YES (within product)","LICENSE-GATED — cannot scrape; commercial license/API","interqual"),
 ("MCG (Hearst Health)","Proprietary UM care-pathway criteria","YES (within product)","LICENSE-GATED — commercial license","interqual"),
]

def ALLSOURCES():
    return {**R.SOURCES, **SOURCES2, **SOURCES3}
def src2(idlist):
    allsrc=ALLSOURCES()
    return [f"{allsrc[i][0]} — {allsrc[i][1]}" for i in idlist if i in allsrc]
