# -*- coding: utf-8 -*-
"""
AI Revenue Recovery OS — Clearinghouse API & Healthcare Connectivity data.

Standard/factual content (EDI transactions, connectivity orchestration,
architecture, build/buy/partner, capability matrices) and a parameterized
connectivity COST MODEL. Clearinghouse-specific pricing/capabilities live in
CLEARINGHOUSES / SOURCES and are researched 2026 figures — quote-only items
are recorded "QUOTE REQUIRED — not publicly disclosed" and never invented.

Distinctions enforced throughout:
  Clearinghouse != Payer != Payer API != FHIR != EDI != Portal != Voice != Human
  Free sandbox != Free production.  Direct payer API != clearinghouse connectivity.
  Payer connectivity != full payer functionality.
No PHI. HIPAA-*aligned* architecture (not "HIPAA certified").
"""
REPORT_DATE = "August 20, 2026"

# ============================================================================
# EDI TRANSACTION REFERENCE  (X12 5010; plain-English purpose)
# transaction, x12, purpose, ch_support, availability, payer_dependency,
# api_availability, pricing_model, free_sandbox, production_cost, notes
# ============================================================================
EDI_TX = [
 ("Eligibility inquiry","270","Ask a payer if a patient is covered and what the benefits are",
  "YES — universal","Real-time","Low — HIPAA-mandated standard","YES (most CH APIs)",
  "Per-transaction or bundled","YES (most)","Cents/transaction or free tier",
  "Highest-adoption transaction; response is the 271"),
 ("Eligibility response","271","The payer's answer to a 270 — active/inactive, plan, benefits",
  "YES — universal","Real-time","Low","YES","Returned with 270","YES","Returned with 270",
  "Benefit detail returned VARIES by payer; not all fields populated"),
 ("Claim status inquiry","276","Ask a payer what happened to a submitted claim",
  "YES — common","Real-time / batch","Medium — payer variability","YES (most CH APIs)",
  "Per-transaction or bundled","YES (most)","Cents/transaction or free tier",
  "Response is the 277; some payers return limited status"),
 ("Claim status response","277","The payer's answer to a 276 — pending/paid/denied/in review",
  "YES — common","Real-time / batch","Medium","YES","Returned with 276","YES","Returned with 276",
  "Status granularity varies by payer"),
 ("Claim acknowledgment","277CA","Confirms a claim was accepted or rejected at intake (front-end edits)",
  "YES — common","Batch (post-submission)","Low-Medium","PARTIAL (via CH)","Bundled with claims",
  "YES","Bundled","First signal of a front-end rejection; precedes adjudication"),
 ("Prior authorization / referral","278","Request approval before a service and get the payer's decision",
  "PARTIAL — payer-dependent","Real-time / batch / pended","HIGH — least standardized","PARTIAL",
  "Per-transaction where supported","PARTIAL","Varies / QUOTE REQUIRED",
  "Least-automated workflow; moving to FHIR PAS for CMS-regulated payers by 2027"),
 ("Professional claim","837P","Submit a physician / professional services claim",
  "YES — universal","Batch / real-time","Low — HIPAA-mandated","YES (most CH APIs)",
  "Per-claim / bundled / tiered","YES (test)","Per-claim or free-to-participating-payer",
  "Core claim submission; payer enrollment may be required"),
 ("Institutional claim","837I","Submit a hospital / facility claim",
  "YES — universal","Batch / real-time","Low","YES","Per-claim / bundled","YES (test)",
  "Per-claim","Same rails as 837P; different form/loop content"),
 ("Dental claim","837D","Submit a dental claim",
  "YES — common","Batch","Low","PARTIAL","Per-claim / bundled","YES (test)","Per-claim",
  "Dental payer network narrower than medical"),
 ("Remittance advice (ERA)","835","The payer's electronic explanation of payment and adjustments",
  "YES — universal","Batch (post-adjudication)","Low","YES (most CH APIs)","Often included / per-claim",
  "YES (test)","Often bundled / free","Feeds denial intelligence: CARC/RARC, payments, patient resp."),
 ("Functional acknowledgment","999","Confirms an EDI file was syntactically accepted or rejected",
  "YES — universal","Batch","None — transport layer","N/A (transport)","Included","YES","Included",
  "Envelope-level ACK; not business status"),
 ("Interchange acknowledgment","TA1","Confirms the EDI interchange envelope was received/valid",
  "YES — universal","Batch","None — transport","N/A (transport)","Included","YES","Included",
  "Lowest-level ACK; precedes 999"),
 ("Additional information / attachment","275","Send supporting documentation (records, notes) to a payer",
  "PARTIAL — emerging","Batch / solicited","HIGH — payer-dependent","PARTIAL (CH/FHIR)",
  "Varies / QUOTE REQUIRED","PARTIAL","Varies","Attachments often still fax/portal; FHIR DocumentReference emerging"),
]

# ============================================================================
# ELIGIBILITY (271) FIELD AVAILABILITY MATRIX
# field -> typical availability classification
#   YES = standard-returned by most payers; PAYER DEPENDENT = varies widely;
#   PARTIAL = often present but inconsistent; NO = generally not in 271
# ============================================================================
ELIG_FIELDS = [
 ("Active / inactive coverage","YES","Core EB segment; near-universal"),
 ("Effective date","YES","Usually present"),
 ("Termination date","PARTIAL","Present when coverage ended/known; often blank if active"),
 ("Member ID","YES","Echoed/normalized in 271"),
 ("Plan / group","YES","Plan name/number typically returned"),
 ("Product (HMO/PPO/EPO)","PARTIAL","Sometimes in plan description; not a discrete field for all payers"),
 ("Network status","PAYER DEPENDENT","In/out-of-network benefit differentiation varies"),
 ("Deductible (individual/family)","PARTIAL","Common for many payers; not guaranteed"),
 ("Deductible remaining","PAYER DEPENDENT","High-value but inconsistently returned"),
 ("Copay","PARTIAL","Service-type dependent; often returned for common service types"),
 ("Coinsurance","PARTIAL","Service-type dependent"),
 ("Out-of-pocket maximum","PAYER DEPENDENT","Returned by some payers"),
 ("Out-of-pocket remaining","PAYER DEPENDENT","Inconsistent; high-value when present"),
 ("Service-specific benefits","PAYER DEPENDENT","Depends on service type codes requested (EQ) and payer support"),
 ("Authorization/referral requirement","PAYER DEPENDENT","Some 271s flag 'auth required'; not reliable across payers"),
]

# ============================================================================
# CLEARINGHOUSE COVERAGE MATRIX  (capability -> typical coverage classification)
# Applies to the clearinghouse channel generally; individual vendors vary (see CLEARINGHOUSES)
# ============================================================================
COVERAGE_ROWS = [
 ("Eligibility (270/271)","YES — universal","270/271 API is the most widely supported clearinghouse capability"),
 ("Benefits detail","PARTIAL — payer dependent","Returned in 271 but field completeness varies by payer"),
 ("Patient responsibility","DATA ONLY","CH returns benefit data; the platform CALCULATES the estimate"),
 ("Prior authorization (278)","PARTIAL — payer dependent","Supported by some CH/payers; not universal; FHIR PAS by 2027"),
 ("Claims (837P/I/D)","YES — universal","Core clearinghouse function"),
 ("Claim status (276/277)","YES — common","Widely supported; status granularity varies"),
 ("ERA / payment (835)","YES — universal","Standard remittance delivery"),
 ("Denials (from 835/277CA)","DATA ONLY","CARC/RARC + status returned; reasoning/appeal logic is ours"),
 ("Appeals","NO — payer specific","No universal clearinghouse appeals API"),
 ("Payer policies","NO","Not a clearinghouse function; requires Payer Intelligence engine"),
 ("Payer communication","PARTIAL","Some messaging via portals; not a standard API"),
 ("Insurance discovery","PARTIAL — add-on","Offered by some vendors (Waystar/Experian/Optum) as a paid product"),
 ("Coordination of benefits (COB)","PARTIAL","Some 271 COB info; full COB often payer/portal"),
 ("MBI lookup","PARTIAL — add-on","Medicare MBI lookup offered by some vendors; CMS has its own tool"),
 ("Documents / attachments (275)","PARTIAL — emerging","Attachment support inconsistent; often portal/fax today"),
]

# ============================================================================
# CONNECTIVITY ORCHESTRATION MODEL  ("Don't call when you can connect digitally")
# EDI -> API -> FHIR -> Portal -> AI Voice -> Human
# ============================================================================
CONNECTIVITY_LADDER = [
 ("1. EDI / X12","Standardized, cheapest, highest-volume: eligibility, claims, status, ERA","Preferred for all HIPAA-mandated transactions"),
 ("2. Payer / clearinghouse API","REST/JSON convenience layer over EDI, or direct payer API where richer","When EDI insufficient or a richer direct API exists"),
 ("3. FHIR","SMART-on-FHIR / Da Vinci for prior auth (PAS/CRD/DTR) and payer data (2027)","For CMS-regulated payers and modern payer APIs"),
 ("4. Payer portal (RPA)","Web automation when no EDI/API/FHIR path exists","Fallback for auth follow-up, attachments, appeals status"),
 ("5. AI Voice","Automated phone call to payer IVR/rep for status/auth/missing-info","Only when no digital channel resolves it"),
 ("6. Human work queue","Exception handling, judgment calls, complex appeals","Last resort; most expensive per action"),
]

# per-channel indicative cost per successful action (USD) — MODEL ASSUMPTION
CHANNEL_UNIT_COST = {
 "EDI / API":0.10,        # blended per-transaction (free tier can be $0 at MVP)
 "FHIR":0.05,             # marginal; infra-amortized
 "Portal (RPA)":0.35,     # compute + maintenance amortized per successful automation
 "AI Voice":0.72,         # ~6 min @ $0.12/min blended
 "Human":4.00,            # loaded minutes per manual touch
}

# ============================================================================
# BUILD vs BUY vs PARTNER
# capability, recommendation, rationale
# ============================================================================
BUILD_BUY_PARTNER = [
 ("EDI / X12 engine & payer routing","BUY (clearinghouse)","Commodity, regulated, high-maintenance; clearinghouses do this at scale"),
 ("Eligibility / benefits (270/271)","BUY (clearinghouse)","Universal clearinghouse capability; no edge in rebuilding"),
 ("Claim submission (837) & ERA (835)","BUY (clearinghouse)","Core clearinghouse rails + payer enrollment handled"),
 ("Claim status (276/277)","BUY (clearinghouse)","Widely available via CH APIs"),
 ("Insurance / coverage discovery","BUY / PARTNER","Available as paid add-on (Waystar/Experian/Optum); buy vs build by ROI"),
 ("Prior auth connectivity (278/FHIR PAS)","PARTNER + BUILD","Use CH/payer where available; build orchestration + DTR logic"),
 ("Patient responsibility estimate","BUILD","Our calculation engine over CH benefit data — differentiator"),
 ("Denial intelligence (CARC/RARC reasoning)","BUILD","AI reasoning over 835/277CA is core IP"),
 ("Appeal intelligence & drafting","BUILD","No universal API; AI drafting + tracking is core IP"),
 ("Payer policy intelligence (RAG)","BUILD","Collect/maintain payer rules; not a clearinghouse function"),
 ("FHIR gateway (SMART/Da Vinci)","BUILD / PARTNER","Build the gateway; partner for niche IGs"),
 ("Portal automation (RPA)","BUILD carefully","Brittle; build with guardrails only where no digital path exists"),
 ("AI Voice","PARTNER","Use a voice platform (Retell/Vapi/Twilio-based); orchestrate, don't rebuild telephony"),
 ("Workflow orchestration & connectivity engine","BUILD","The differentiated orchestration layer — our product"),
 ("Analytics / audit / tenant isolation","BUILD","Product-specific; security-critical"),
]

# ============================================================================
# WHAT CLEARINGHOUSES SOLVE  vs  WHAT WE BUILD
# ============================================================================
CH_SOLVES = [
 "EDI connectivity and X12 envelope handling",
 "Payer routing across thousands of payer connections",
 "Eligibility & benefits (270/271)",
 "Claim submission (837P/I/D) and payer enrollment plumbing",
 "Claim status (276/277)",
 "Electronic remittance (835 / ERA)",
 "Acknowledgments (277CA / 999 / TA1)",
]
WE_BUILD = [
 "Payer intelligence & coverage-policy RAG",
 "AI reasoning and denial analysis (CARC/RARC → root cause → recovery)",
 "Appeal intelligence, drafting and tracking (no universal API)",
 "Patient responsibility estimate engine",
 "Connectivity orchestration (EDI→API→FHIR→Portal→Voice→Human)",
 "Portal automation orchestration (guarded RPA)",
 "AI voice fallback orchestration",
 "Cross-channel tracking and outcome capture",
 "Human exception management",
 "Analytics, audit, and multi-tenant isolation",
 "Its own HIPAA-aligned security & compliance program",
]

# ============================================================================
# CONNECTIVITY COST MODEL  (parameterized; MODEL ASSUMPTION)
# Volumes are per 100 claims to derive mix; scenarios scale claims/month.
# ============================================================================
# transaction volume assumptions per claim (MODEL ASSUMPTION)
PER_CLAIM_MIX = dict(
 eligibility_checks=1.3,   # some claims re-checked / multi-DOS
 claim_status_checks=1.1,  # follow-ups
 claim_submissions=1.0,
 era=1.0,
 prior_auth=0.15,          # 15% of claims need PA
 attachments=0.10,
 appeals=0.06,             # 6% denied-and-appealed
 voice_calls=0.05,         # 5% escalate to voice
 voice_minutes_per_call=6,
 human_touches=0.03,       # 3% hit human queue
)
# indicative unit costs (USD) — MODEL ASSUMPTION; production, post-free-tier
UNIT = dict(
 eligibility=0.08,     # per 270/271 (many CH free or cents)
 claim_status=0.08,    # per 276/277
 claim_submit=0.12,    # per 837 (participating-payer often lower/free)
 era=0.00,             # often bundled/free
 prior_auth=0.50,      # per 278 where supported (QUOTE REQUIRED for some)
 attachment=0.25,      # per 275/document
 appeal=0.00,          # no CH fee; cost is human/AI time (counted in human)
 voice_per_min=0.12,   # blended voice-AI
 human_per_touch=4.00, # loaded human minutes per exception
)
SCENARIOS = [10000, 50000, 100000, 500000, 1000000]

def connectivity_cost(claims_per_month, free_tier=False, unit=None):
    u = dict(UNIT);
    if unit: u.update(unit)
    m = PER_CLAIM_MIX; c = claims_per_month
    elig = c*m["eligibility_checks"]*u["eligibility"]
    status = c*m["claim_status_checks"]*u["claim_status"]
    submit = c*m["claim_submissions"]*u["claim_submit"]
    era = c*m["era"]*u["era"]
    pa = c*m["prior_auth"]*u["prior_auth"]
    attach = c*m["attachments"]*u["attachment"]
    voice = c*m["voice_calls"]*m["voice_minutes_per_call"]*u["voice_per_min"]
    human = c*m["human_touches"]*u["human_per_touch"]
    clearinghouse = elig+status+submit+era+pa+attach
    if free_tier:
        # MVP: clearinghouse transactions covered by free/sandbox tier
        clearinghouse = 0.0
    total = clearinghouse+voice+human
    return dict(eligibility=elig, claim_status=status, claim_submit=submit, era=era,
                prior_auth=pa, attachments=attach, clearinghouse=clearinghouse,
                voice=voice, human=human, total=total,
                per_claim=total/c if c else 0)

def scenario_table():
    rows=[]
    for c in SCENARIOS:
        r=connectivity_cost(c)
        rows.append(dict(claims=c, clearinghouse=r["clearinghouse"], voice=r["voice"],
                         human=r["human"], total=r["total"], per_claim=r["per_claim"],
                         annual=r["total"]*12))
    return rows

# MVP / PILOT / PRODUCTION connectivity cost
def phase_costs():
    mvp = connectivity_cost(2000, free_tier=True)        # dev/demo volume on free/sandbox tier
    pilot = connectivity_cost(50000, free_tier=False)    # first paid production pilot
    prod = connectivity_cost(500000, free_tier=False)    # medium production
    return dict(mvp=mvp, pilot=pilot, prod=prod)

# ============================================================================
# CLEARINGHOUSE PROFILES  (researched 2026; QUOTE REQUIRED where undisclosed)
# key: name -> dict of fields. conf = confidence (High/Med/Low).
# Pricing NEVER invented; "QUOTE REQUIRED — not publicly disclosed" where so.
# ============================================================================
CLEARINGHOUSES = {
 "Stedi": dict(
    kind="API-first clearinghouse (developer-native)",
    self_serve="YES — public docs, self-serve sign-up, MCP/Agent tooling",
    sandbox="YES — free test-mode keys; mock 270/271 for a fixed payer set (Aetna, Cigna, UHC, CMS); "
            "cannot submit test claims via API/SFTP (production account required)",
    free="Basic plan: 100 free PRODUCTION transactions/month (eligibility, claims, ERA, claim status "
         "each), processed manually in the portal",
    pricing="Pay-as-you-go, 100% usage-based tiered (per-unit price falls with volume); no monthly minimum, "
            "no setup fee, no per-provider/per-payer fees; prepaid balance from $100. Exact per-transaction "
            "rates: QUOTE REQUIRED — not publicly disclosed (interactive estimator only).",
    tx="270/271, 276/277 (real-time), 837P/I/D, 835, 275 attachments, 277CA, 999",
    pa="No dedicated 278 API; surfaces PA REQUIREMENT via 271 authOrCertIndicator only",
    payers="3,500+ payers (aggregate); one-click enrollment for 850+",
    enroll="ERA always requires enrollment; claims/eligibility payer-dependent; no Stedi enrollment fees",
    security="HIPAA-covered clearinghouse; signed BAA required for production PHI; SOC 2 Type II; HIPAA-eligible (audited)",
    conf="High", src="stedi"),
 "Availity": dict(
    kind="Network/clearinghouse + free provider portal + developer program",
    self_serve="YES — Developer Portal: Demo plan auto-approved; Standard (production) via subscription + Contact Sales",
    sandbox="YES — Demo plan sandbox (3 TPS / 500 txns per day; OAuth2 required)",
    free="Availity Essentials portal free to providers for SPONSORED/participating payers (no setup/monthly fee); "
         "non-sponsoring payers need paid Essentials Plus",
    pricing="API/production pricing QUOTE REQUIRED — not publicly disclosed. Rate tiers published (Demo 3 TPS/500 per day; "
            "Standard 100 TPS/100,000 per day) but not dollar prices.",
    tx="270/271 (Coverages API), 276/277 (Enhanced Claim Status), 837 (claims), 835 (ERA), 278 (Service Reviews), "
       "Claim Attachments API; FHIR prior-auth; CORE-certified",
    pa="YES — Service Reviews API (278) + IsAuthRequired + Auth Attachments; end-to-end FHIR prior auth; 'Intelligentum' AI",
    payers="4,000+ payers; 95%+ of payers; 3.5M+ providers; 17,000+ trading partners; ~8.8M daily txns",
    enroll="Payer registration/agreements via Trading Partner Management",
    security="HIPAA covered entity/BA; OAuth2 over HTTPS; CORE-certified (2024)",
    conf="High", src="availity_dev"),
 "Waystar": dict(
    kind="Enterprise RCM platform (clearinghouse + AI)",
    self_serve="NO — REST/batch APIs exist but partner/contract-gated; no public self-serve developer portal or sandbox",
    sandbox="Partner-gated (no public sandbox)",
    free="None (enterprise/contract)",
    pricing="QUOTE REQUIRED — not publicly disclosed (custom/contract). Third-party estimates exist but are NOT official.",
    tx="Eligibility, 837 claims (API or SFTP batch), claim status, 835 ERA, denial/appeal mgmt, prior auth, coverage discovery",
    pa="YES — Authorization Suite (Digitize.AI); rules engine checks ~6.8M payer rules",
    payers="5,000+ payer connections (varies by page); 1M+ providers; 100,000+ live integrations; $200B+ payments/yr",
    enroll="Enrollment + payer agreements + EHR/PM integration via implementation services",
    security="Enterprise HIPAA/BA; contract-based",
    conf="High(quote)/Med(figures)", src="waystar"),
 "Optum / Change Healthcare": dict(
    kind="Largest clearinghouse (~50% of U.S. medical claims) + developer marketplace",
    self_serve="Dev portal + sandbox (developer.optum.com / marketplace.optum.com) but access issued by Optum rep / contract",
    sandbox="YES — sandbox access via Optum rep",
    free="None self-serve (contract)",
    pricing="QUOTE REQUIRED — not publicly disclosed",
    tx="270/271 (Enhanced Eligibility), 276/277 (Claim Status v2), 837P/I, 835, 278 (Prior Auth Submission API, real-time), "
       "275 (Attachments API), Coverage Discovery, MBI lookup, COB",
    pa="YES — Prior Authorization Submission API (real-time)",
    payers="~2,400 payers (Optum Medical Network/EDI page)",
    enroll="Payer-specific transaction enrollment (837/835/EFT); fees not public",
    security="HIPAA; post-2024-breach services operational under Optum brand",
    conf="High(caps)/Med(figures)", src="optum_dev"),
 "Experian Health": dict(
    kind="Enterprise RCM + data (eligibility, discovery, AI denials)",
    self_serve="NO public self-serve program (enterprise/contract; EDI + EHR connectors)",
    sandbox="UNKNOWN (enterprise onboarding)",
    free="None (enterprise)",
    pricing="QUOTE REQUIRED — not publicly disclosed (volume/complexity-based)",
    tx="270/271 (real-time), 276/277 (Enhanced Claim Status), 837 (ClaimSource), 835, MBI lookup, COB (CAQH), "
       "insurance/coverage discovery (Wave HDC)",
    pa="Authorizations product; 278 standalone API not confirmed",
    payers="900+ U.S. payers/MCOs/TPAs/government (direct connections)",
    enroll="Not public — QUOTE REQUIRED",
    security="HIPAA; enterprise",
    conf="High(payers)/Med(other)", src="experian"),
 "Office Ally": dict(
    kind="Web/SFTP clearinghouse + free practice tools",
    self_serve="No prominent public developer API (web + SFTP; enterprise EDI gateway custom)",
    sandbox="UNKNOWN",
    free="Participating (Par) payers: no setup, no monthly, no per-claim fee — FREE. Practice Mate free to start.",
    pricing="Non-Par payers: $44.95/month per unique Tax ID + Rendering NPI in any month Non-Par claims are sent "
            "(criteria updated eff. 2026-01-01). EHR ~$39.95–$44.95/provider/mo (secondary).",
    tx="837P/I/D, real-time 270/271, 835 ERA, claim status",
    pa="Not a focus",
    payers="'Hundreds' of payers (exact count UNKNOWN)",
    enroll="Payer-specific enrollment for some payers/ERA; Non-Par status drives the $44.95 fee",
    security="HIPAA",
    conf="High(Par/NonPar)/Med(other)", src="officeally"),
 "Claim.MD": dict(
    kind="Low-cost transparent clearinghouse (small/solo/billing cos)",
    self_serve="YES — public developer docs (docs.claim.md); API quick-start for claims/eligibility/ERA",
    sandbox="Developer docs; sandbox UNKNOWN",
    free="No setup fee, no per-provider fee",
    pricing="Published monthly tiers (secondary; confirm on official page): Basic ~$30/mo; Small Volume ~$60/mo "
            "(100 claims + 100 ERA + 100 eligibility); Unlimited ~$120/mo (unlimited claims + ERA + 1,000 eligibility). "
            "Per-claim option referenced (~$0.10–$0.30) but inconsistent → treat as UNKNOWN.",
    tx="837 claims, 270/271 eligibility, 835 ERA, attachments, claim status",
    pa="Not a focus",
    payers="~2,800+ payers (secondary)",
    enroll="Payer list flags enrollment need; ERA enrollment reroutes remits to Claim.MD",
    security="HIPAA",
    conf="Med", src="claimmd"),
 "TriZetto Provider Solutions (Cognizant)": dict(
    kind="Enterprise clearinghouse (650+ PM/EHR interfaces)",
    self_serve="Enterprise/contract-only; 'Unify' headless API (AI agents as consumers) emerging",
    sandbox="Enterprise onboarding",
    free="None (enterprise)",
    pricing="QUOTE REQUIRED — not publicly disclosed. Secondary ~$0.15–$0.40/claim estimate is UNVERIFIED.",
    tx="837P/I/D, 835 (incl. EOB→835 conversion), 270/271, 276/277, prior auth/denials workflow",
    pa="Prior auth / denials workflow",
    payers="8,000+ payer connections; 875,000+ providers; ~4.4B annual transactions",
    enroll="Transaction enrollments for 837/835/EFT; fees not public",
    security="HIPAA; enterprise",
    conf="Med", src="trizetto"),
}

# ============================================================================
# FREE / SANDBOX / PAID MATRIX
# provider, sandbox, dev_account, test_data, production, setup, monthly, txn_fee, notes
# ============================================================================
FREE_VS_PAID = [
 ("Stedi","YES (test keys)","YES (self-serve)","Mock (fixed payers)","YES","None","None (PAYG)",
  "Tiered PAYG — QUOTE","Basic plan: 100 free production txns/mo; prepaid from $100"),
 ("Availity","YES (Demo plan)","YES","Demo sandbox","YES","QUOTE","Essentials free (par payers)",
  "QUOTE","Free provider portal for sponsored payers; API pricing quote-only"),
 ("Waystar","Partner-gated","Partner only","Partner","YES","QUOTE","QUOTE","QUOTE","Enterprise/contract; no public sandbox"),
 ("Optum/Change","YES (rep-issued)","Gated","Sandbox","YES","QUOTE","QUOTE","QUOTE","Dev portal but contract-gated"),
 ("Experian Health","UNKNOWN","No public","Enterprise","YES","QUOTE","QUOTE","QUOTE","Enterprise; 900+ payers"),
 ("Office Ally","UNKNOWN","No public API","—","YES","None (Par)","None (Par)","$0 Par / $44.95 Non-Par/mo","Par payers free; Non-Par monthly fee"),
 ("Claim.MD","UNKNOWN","YES (docs)","—","YES","None","~$30–$120/mo","Tier-inclusive","Transparent monthly tiers (confirm official)"),
 ("TriZetto","Enterprise","No public","Enterprise","YES","QUOTE","QUOTE","QUOTE","Enterprise; 8,000+ connections"),
]

# ============================================================================
# PAYER CAPABILITY CLASSIFICATION  (payer connectivity != full functionality)
# capability -> classification with example
# ============================================================================
PAYER_CAPABILITY = [
 ("Eligibility active/inactive","Universal","HIPAA-mandated 270/271; nearly all payers"),
 ("Detailed benefit accumulators (deductible/OOP remaining)","Payer-specific","Some payers omit; high-value when present"),
 ("Claim submission (837)","Universal","Mandated; all payers via clearinghouse"),
 ("Claim status (276/277)","Common","81% electronic adoption; granularity varies"),
 ("ERA (835)","Common","78% electronic; enrollment often required"),
 ("Prior authorization (278/FHIR)","Payer-specific","Only 40% electronic; CMS payers → FHIR PAS by 2027"),
 ("Attachments (275)","Payer-specific","~24% electronic; CMS-0053-F standardizes (eff. May 2026)"),
 ("Appeals","Unavailable (no standard)","Payer portal/fax/mail; proprietary"),
 ("Coverage / insurance discovery","Contract-specific","Paid add-on (Waystar/Experian/Optum)"),
 ("MBI lookup","Contract-specific","Some vendors; CMS has its own tool"),
 ("Medical/coverage policies","Unavailable (not a CH function)","Requires Payer Intelligence engine"),
]

# ============================================================================
# CAQH INDEX ADOPTION (2025 Index / 2024 data) — corroborated secondary
# transaction -> (electronic_adoption_pct, note)
# ============================================================================
CAQH_ADOPTION = [
 ("Eligibility & benefits (270/271)","96%","Highest-adoption; dental 82%"),
 ("Claim status (276/277)","81%","Up from 74% (2023 Index)"),
 ("Claim payment / ERA (835)","78%","Up from 73%; dental 33%"),
 ("Prior authorization (278)","40%","Up from 31%; LEAST electronic core transaction"),
 ("Attachments (275)","~24%","Low; CMS-0053-F standardization eff. May 2026"),
]

# ============================================================================
# CMS / REGULATORY FACTS
# ============================================================================
CMS_RULES = [
 ("CMS-0057-F","Interoperability & Prior Authorization Final Rule (Jan 2024)",
  "MA, Medicaid/CHIP FFS & managed care, QHP issuers on FFEs must build 4 FHIR R4 APIs: Prior Authorization "
  "(Da Vinci PAS/CRD/DTR), Patient Access (+PA info), Provider Access, Payer-to-Payer. API build generally by "
  "Jan 1, 2027. PA decision windows: 72h expedited / 7 days standard; specific denial reason required from 2026. "
  "Enforcement discretion: an all-FHIR PA API need not also use X12 278."),
 ("CMS-9115-F","Interoperability & Patient Access Final Rule (May 2020)",
  "Patient Access API on FHIR R4 — PATIENT-AUTHORIZED data (CARIN Blue Button EOB); NOT a provider RCM feed. "
  "Provider Access API (provider-directed) is the separate 2027 requirement."),
 ("CMS-0053-F","Claims Attachments & Electronic Signatures (issued Mar 20, 2026; eff. May 26, 2026)",
  "Adopts X12 v006020 275 (006020X314) & 277 (006020X313) as HIPAA attachment standards + HL7 C-CDA/Attachments "
  "IGs and an e-signature standard. Standardizes the historically fax/portal attachment workflow."),
 ("CMS-4201-F","2024 MA & Part D Final Rule (Apr 2023) + Feb 2024 FAQ",
  "MA medical-necessity/coverage decisions must reflect the individual's circumstances (NCD/LCD). An algorithm "
  "deciding coverage from a broad dataset (not the individual) is non-compliant — AI may assist but cannot replace "
  "individualized human medical-necessity determinations."),
 ("CA SB 1120","'Physicians Make Decisions Act' (eff. Jan 1, 2025)",
  "Denial/delay/modification of care based on medical necessity must be made by a licensed physician/qualified "
  "provider with relevant expertise; AI may assist but cannot be the sole authority."),
]
DAVINCI_IGS = [
 ("CRD — Coverage Requirements Discovery (v2.2.1)","At order time (CDS Hooks): does this need PA / documentation?"),
 ("DTR — Documentation Templates and Rules (v2.2.0)","Smart payer questionnaires auto-populated from the EHR"),
 ("PAS — Prior Authorization Support (v2.1.0)","Submits the PA request/response over FHIR; may map to X12 278 behind the scenes"),
]

# ============================================================================
# SOURCES  (id -> (label, url, date_checked, confidence))
# ============================================================================
SOURCES = {
 "stedi":("Stedi pricing / docs / billing","https://www.stedi.com/pricing","2026-08-20","High"),
 "stedi_basic":("Stedi Basic plan (100 free txns/mo)","https://www.stedi.com/blog/basic-plan","2026-08-20","High"),
 "stedi_payg":("Stedi pay-as-you-go pricing","https://www.stedi.com/blog/introducing-pay-as-you-go-pricing","2026-08-20","High"),
 "stedi_test":("Stedi test mode / sandbox","https://www.stedi.com/docs/healthcare/test-mode","2026-08-20","High"),
 "stedi_enroll":("Stedi transaction enrollment","https://www.stedi.com/docs/healthcare/transaction-enrollment","2026-08-20","High"),
 "stedi_soc2":("Stedi SOC 2 Type II & HIPAA eligibility","https://www.stedi.com/blog/stedi-achieves-soc-2-type-ii-and-hipaa-eligibility-certification","2026-08-20","High"),
 "availity_dev":("Availity Developer Portal getting started","https://developer.availity.com/partner/gettingstarted","2026-08-20","High"),
 "availity_ess":("Availity Essentials (free portal)","https://www.availity.com/essentials/","2026-08-20","High"),
 "availity_tx":("Availity HIPAA transactions (APIs)","https://developer.availity.com/blog/2025/3/25/hipaa-transactions","2026-08-20","High"),
 "availity_net":("Availity network size (Apr 2026)","https://www.businesswire.com/news/home/20260428607674/en/","2026-04-28","High"),
 "waystar":("Waystar platform (financial clearance/denials)","https://www.waystar.com/our-platform/","2026-08-20","High"),
 "waystar_cov":("Waystar Coverage Detection","https://www.waystar.com/our-platform/financial-clearance/coverage-detection/","2026-08-20","High"),
 "waystar_hubble":("Waystar Hubble AI platform","https://www.waystar.com/news/waystar-launches-hubble-an-artificial-intelligence-platform-that-automates-revenue-cycle-processes/","2026-08-20","High"),
 "optum_dev":("Optum developer — access the APIs","https://developer.optum.com/eligibilityandclaims/docs/access-the-apis","2026-08-20","High"),
 "optum_elig":("Optum Enhanced Eligibility (Coverage Discovery)","https://marketplace.optum.com/products/eligibility_and_claims/enhanced_eligibility.html","2026-08-20","High"),
 "optum_pa":("Optum Prior Authorization Submission API","https://marketplace.optum.com/products/eligibility_and_claims/prior-authorization-submission-api.html","2026-08-20","High"),
 "optum_edi":("Optum Medical Network EDI (payer count)","https://business.optum.com/en/operations-technology/network-connectivity/medical/edi.html","2026-08-20","Med"),
 "chc_breach":("Change Healthcare cyberattack recovery","https://www.cybersecuritydive.com/news/change-healthcare-cyberattack-recovery/709760/","2026-08-20","High"),
 "experian":("Experian Health eligibility (900+ payers)","https://www.experian.com/healthcare/products/patient-access-registration/insurance-eligibility-verification","2026-08-20","High"),
 "experian_ai":("Experian Health AI Advantage denials","https://www.experianplc.com/newsroom/press-releases/2023/new-ai-powered-products-from-experian-health","2023-11-30","High"),
 "officeally":("Office Ally pricing (Par/Non-Par)","https://cms.officeally.com/products/pricing","2026-08-20","High"),
 "officeally_fee":("Office Ally Par vs Non-Par fees ($44.95)","https://support.officeally.com/claims/how-par-vs-non-par-payers-affect-your-office-ally-claim-fees-2","2026-08-20","High"),
 "claimmd":("Claim.MD quick-start / pricing","https://docs.claim.md/docs/quick-start-guide","2026-08-20","Med"),
 "trizetto":("TriZetto Provider Solutions clearinghouse","https://www.cognizant.com/us/en/industries/healthcare-technology-solutions/revenue-cycle-management-solutions/clearinghouse-solution","2026-08-20","Med"),
 "x12_flow":("X12 Health Care Transaction Flow","https://x12.org/flow/health-care","2026-08-20","High"),
 "cms_std":("CMS Adopted Standards & Operating Rules","https://www.cms.gov/Regulations-and-Guidance/Administrative-Simplification/HIPAA-ACA/AdoptedStandardsandOperatingRules","2026-08-20","High"),
 "cms_0057":("CMS-0057-F Interoperability & Prior Auth Final Rule","https://www.cms.gov/newsroom/fact-sheets/cms-interoperability-prior-authorization-final-rule-cms-0057-f","2026-08-20","High"),
 "cms_9115":("CMS-9115-F Interoperability & Patient Access","https://www.cms.gov/newsroom/fact-sheets/interoperability-and-patient-access-fact-sheet","2026-08-20","High"),
 "cms_0053":("CMS-0053-F Claims Attachments Final Rule (2026)","https://www.federalregister.gov/documents/2026/03/24/2026-05676/administrative-simplification-adoption-of-standards-for-health-care-claims-attachments-transactions","2026-03-24","High"),
 "cms_4201":("CMS-4201-F 2024 MA & Part D Final Rule","https://www.cms.gov/newsroom/fact-sheets/2024-medicare-advantage-and-part-d-final-rule-cms-4201-f","2026-08-20","High"),
 "sb1120":("CA SB 1120 Physicians Make Decisions Act","https://sd13.senate.ca.gov/news/press-release/september-30-2024/governor-signs-physicians-make-decisions-act-keeping-medical","2026-08-20","High"),
 "davinci_pas":("HL7 Da Vinci PAS (Prior Auth Support)","https://hl7.org/fhir/us/davinci-pas/","2026-08-20","High"),
 "davinci_crd":("HL7 Da Vinci CRD","https://hl7.org/fhir/us/davinci-crd/2.2.1/en/","2026-08-20","High"),
 "davinci_dtr":("HL7 Da Vinci DTR","https://hl7.org/fhir/us/davinci-dtr/en/","2026-08-20","High"),
 "carin":("HL7 CARIN Blue Button (Patient Access)","http://hl7.org/fhir/us/carin-bb/Background.html","2026-08-20","High"),
 "caqh":("2025 CAQH Index (adoption / savings)","https://www.caqh.org/insights/caqh-index-report","2026-02-19","Med-High"),
 "voice":("AI voice per-minute (blended estimate)","https://www.retellai.com/blog/ai-voice-agent-pricing-full-cost-breakdown-platform-comparison-roi-analysis","2026-08-20","Est"),
}

if __name__=="__main__":
    for r in scenario_table():
        print(f"{r['claims']:>9,} claims/mo  CH ${r['clearinghouse']:>10,.0f}  voice ${r['voice']:>8,.0f}  "
              f"human ${r['human']:>9,.0f}  TOTAL ${r['total']:>10,.0f}/mo  ${r['per_claim']:.3f}/claim")
    p=phase_costs()
    print("MVP/mo   $%.0f (free tier)"%p["mvp"]["total"])
    print("PILOT/mo $%.0f"%p["pilot"]["total"])
    print("PROD/mo  $%.0f"%p["prod"]["total"])
