# -*- coding: utf-8 -*-
"""Shared payer capability records (extracted). No PHI."""
import pandas as pd
from payer_universe import PAYERS
import research_data as R

COLS = [
 "Payer Organization","Parent Organization","Payer Type","Plan Type","State(s)","Payer ID","Payer ID Alias","Website","Developer Portal","Provider Portal",
 "Claim Status Electronic","Claim Status Standard","Claim Status API","Claim Status Direct Payer API","Claim Status Clearinghouse API","Claim Status FHIR","Claim Status Portal","Claim Status Voice Fallback","Claim Status Real-Time","Claim Status Batch",
 "Eligibility Electronic","Eligibility Standard","Eligibility API","Eligibility Direct Payer API","Eligibility Clearinghouse API","Eligibility FHIR","Eligibility Portal","Eligibility Real-Time","Eligibility Batch",
 "Benefits Available","Benefits via 271","Benefits via API","Deductible","Deductible Remaining","Copay","Coinsurance","OOP Maximum","OOP Remaining","Service-Specific Benefits","Network Benefits",
 "Allowed Amount Available","Accumulator Data","Patient Responsibility Data","Patient Responsibility Calculation Required","Estimation API","Estimation Confidence",
 "Prior Auth Electronic","Prior Auth X12 278","Prior Auth FHIR","Prior Auth API","Prior Auth Requirements API","Prior Auth Submission","Prior Auth Status","Prior Auth Approval","Prior Auth Denial Reason","Prior Auth Additional Info","Prior Auth Portal","Prior Auth Voice/Manual",
 "Denial Data Available","ERA 835","CARC","RARC","277CA","Claim-Level Denial","Service-Level Denial","Denial API","Denial Portal",
 "Appeal API","Electronic Appeal","Portal Appeal","Document Upload","Fax","Mail","Human Process","Appeal Status API","Appeal Tracking",
 "Public API","Free API","Free Sandbox","Production API","Production Pricing","Usage Fee","Setup Fee","Enrollment Required","Provider Credential Required","Clearinghouse Required","API Authentication","OAuth","SMART on FHIR","API Documentation",
 "FHIR Available","FHIR Version","Patient Access API","Provider Access API","Payer-to-Payer API","Prior Authorization API","Provider Directory API","FHIR Documentation","FHIR Sandbox",
 "Portal Required","Voice Required","Human Fallback","Recommended Channel","Digital Coverage Score","Automation Readiness Score",
 "Source URL 1","Source URL 2","Source URL 3","Source Type","Source Date","Last Verified Date","Confidence","Research Notes",
]

def is_impacted(plan, cat):
    p=plan.lower()
    if cat=="TPA": return False
    if any(k in p for k in ["ma","medicare advantage","medicaid","chip","exchange","marketplace"]): return True
    if cat in ("MA","MCO","QHP"): return True
    if cat=="GOV" and "medicaid" in p: return True
    return False

def build_record(org, parent, cat, plan, states, pid, website):
    fhir = R.PAYER_FHIR.get(org)
    impacted = is_impacted(plan, cat)
    gov_ffs = cat=="GOV"
    is_optum = org=="Optum (UHG)"
    devportal = fhir["url"] if fhir else ("UNKNOWN")
    fver = fhir["ver"] if fhir else ("R4 (if CMS-regulated)" if impacted else "UNKNOWN")
    pa_fhir_val = "YES" if (fhir and fhir["pa"]=="YES") else ("PARTIAL (CMS-9115)" if impacted else "UNKNOWN")
    pd_fhir_val = "YES" if (fhir and fhir["pd"]=="YES") else ("PARTIAL (CMS-9115)" if impacted else "UNKNOWN")
    # CMS-0057-F provider-facing APIs (2027) — only for impacted
    prov_access = "PARTIAL (2027)" if impacted else ("NO" if cat=="TPA" else "UNKNOWN")
    p2p_api    = "PARTIAL (2027)" if impacted else ("NO" if cat=="TPA" else "UNKNOWN")
    pa_api_057 = "PARTIAL (2027)" if impacted else ("NO" if cat=="TPA" else "UNKNOWN")
    direct_rcm = "YES" if is_optum else "UNKNOWN"
    # denial reason op-rule (2026) for impacted
    pa_denial_reason = "YES (2026)" if impacted else "PARTIAL"

    rec = {c:"" for c in COLS}
    rec.update({
     "Payer Organization":org,"Parent Organization":parent,"Payer Type":cat,"Plan Type":plan,"State(s)":states,
     "Payer ID":pid,"Payer ID Alias":"Varies by clearinghouse","Website":website,
     "Developer Portal":devportal if devportal!="UNKNOWN" else ("UNKNOWN (CMS-9115 endpoint likely)" if impacted else "UNKNOWN"),
     "Provider Portal":"YES",
     # claim status
     "Claim Status Electronic":"YES","Claim Status Standard":"276/277","Claim Status API":"YES (clearinghouse)",
     "Claim Status Direct Payer API":direct_rcm,"Claim Status Clearinghouse API":"YES","Claim Status FHIR":"NO",
     "Claim Status Portal":"YES","Claim Status Voice Fallback":"YES","Claim Status Real-Time":"YES","Claim Status Batch":"YES",
     # eligibility
     "Eligibility Electronic":"YES","Eligibility Standard":"270/271","Eligibility API":"YES (clearinghouse)",
     "Eligibility Direct Payer API":direct_rcm,"Eligibility Clearinghouse API":"YES","Eligibility FHIR":"NO",
     "Eligibility Portal":"YES","Eligibility Real-Time":"YES","Eligibility Batch":"YES",
     # benefits
     "Benefits Available":"YES","Benefits via 271":"YES","Benefits via API":"YES","Deductible":"YES","Deductible Remaining":"PARTIAL",
     "Copay":"YES","Coinsurance":"YES","OOP Maximum":"PARTIAL","OOP Remaining":"PARTIAL","Service-Specific Benefits":"PARTIAL","Network Benefits":"PARTIAL",
     # estimation
     "Allowed Amount Available":"UNKNOWN","Accumulator Data":"PARTIAL","Patient Responsibility Data":"PARTIAL",
     "Patient Responsibility Calculation Required":"YES","Estimation API":"NO (own engine)","Estimation Confidence":"Medium",
     # prior auth
     "Prior Auth Electronic":"PARTIAL","Prior Auth X12 278":"YES","Prior Auth FHIR":pa_api_057 if impacted else pa_fhir_val,
     "Prior Auth API":"PARTIAL","Prior Auth Requirements API":"PARTIAL (Da Vinci CRD)","Prior Auth Submission":"PARTIAL",
     "Prior Auth Status":"PARTIAL","Prior Auth Approval":"PARTIAL","Prior Auth Denial Reason":pa_denial_reason,
     "Prior Auth Additional Info":"PARTIAL (Da Vinci DTR)","Prior Auth Portal":"YES","Prior Auth Voice/Manual":"YES",
     # denials
     "Denial Data Available":"YES","ERA 835":"YES","CARC":"YES","RARC":"YES","277CA":"YES",
     "Claim-Level Denial":"YES","Service-Level Denial":"YES","Denial API":"YES (clearinghouse)","Denial Portal":"YES",
     # appeals
     "Appeal API":"UNKNOWN","Electronic Appeal":"PARTIAL","Portal Appeal":"YES" if not gov_ffs else "PARTIAL",
     "Document Upload":"PARTIAL","Fax":"YES","Mail":"YES","Human Process":"YES","Appeal Status API":"UNKNOWN","Appeal Tracking":"PARTIAL",
     # api access
     "Public API":"NO (direct); via clearinghouse","Free API":"PARTIAL (clearinghouse sandbox/free tier)","Free Sandbox":"YES (clearinghouse)",
     "Production API":"YES (clearinghouse)","Production Pricing":"Transaction-based (clearinghouse)","Usage Fee":"YES (per transaction)","Setup Fee":"PARTIAL",
     "Enrollment Required":"PARTIAL","Provider Credential Required":"YES","Clearinghouse Required":"YES" if not is_optum else "NO (direct Optum API)",
     "API Authentication":"OAuth2 / API key","OAuth":"YES","SMART on FHIR":"YES" if (fhir and fhir["pa"]=="YES") else ("PARTIAL" if impacted else "UNKNOWN"),
     "API Documentation":"YES" if fhir else ("PARTIAL" if impacted else "Via clearinghouse"),
     # fhir
     "FHIR Available":"YES" if (fhir and fhir["pa"]=="YES") else ("PARTIAL (CMS-9115)" if impacted else "UNKNOWN"),
     "FHIR Version":fver,"Patient Access API":pa_fhir_val,"Provider Access API":prov_access,"Payer-to-Payer API":p2p_api,
     "Prior Authorization API":pa_api_057,"Provider Directory API":pd_fhir_val,
     "FHIR Documentation":devportal if (fhir and devportal!="UNKNOWN") else ("PARTIAL" if impacted else "UNKNOWN"),
     "FHIR Sandbox":"YES" if (fhir and fhir["dev"] in ("YES","PARTIAL")) else ("PARTIAL" if impacted else "UNKNOWN"),
     # operations
     "Portal Required":"YES (PA/appeals)","Voice Required":"PARTIAL","Human Fallback":"YES",
     "Recommended Channel":"Clearinghouse EDI/API → (payer FHIR 2027) → Portal → Voice → Human" if impacted else "Clearinghouse EDI/API → Portal → Voice → Human",
     # evidence
     "Source URL 1":R.SOURCES["cms_admin"][1],
     "Source URL 2":(fhir["url"] if fhir else R.SOURCES["caqh_idx24"][1]),
     "Source URL 3":R.SOURCES["cms_0057_fs"][1] if impacted else R.SOURCES["stedi_hc"][1],
     "Source Type":"OFFICIAL/STANDARD" + ("/VENDOR" if fhir else ""),
     "Source Date":"2024–2026","Last Verified Date":R.REPORT_DATE,
     "Confidence":(fhir["conf"] if fhir else ("Medium" if impacted else "Medium")),
     "Research Notes":("Direct provider-facing RCM API (Optum=UHG clearinghouse)." if is_optum else
        ("CMS-regulated: CMS-9115 Patient Access/Provider Directory live; CMS-0057-F Provider Access/PA APIs due 2027. Provider-facing RCM (elig/status) via clearinghouse today." if impacted else
         "Commercial/self-funded: RCM transactions via clearinghouse; not subject to CMS-0057-F provider APIs.")),
    })
    # scoring
    ds, ars, cat_label = score_record(rec, impacted, gov_ffs, is_optum, fhir is not None)
    rec["Digital Coverage Score"]=ds; rec["Automation Readiness Score"]=f"{ars} ({cat_label})"
    return rec, ars, cat_label

def score_record(rec, impacted, gov_ffs, is_optum, has_fhir):
    s=0
    # Digital API/FHIR (25): clearinghouse API reachable = 18; +4 verified direct FHIR portal; +3 Optum direct
    s += 18 + (4 if has_fhir else 0) + (3 if is_optum else 0)
    # Standard EDI (15)
    s += 15
    # Real-time (10)
    s += 10
    # Portal (10)
    s += 10
    # Prior auth digital (10): impacted (2027 FHIR + denial-reason op rule) = 6; else 278-only = 4
    s += 6 if impacted else 4
    # Denial electronic data (10): 835 universal
    s += 10
    # Appeal electronic (5): portal appeal partial
    s += 3 if not gov_ffs else 2
    # Documentation (5)
    s += 5 if has_fhir else 4
    # Sandbox (5): clearinghouse sandbox
    s += 5
    # Clear enrollment path (5)
    s += 4
    s = min(s, 100)
    if s>=80: lab="HIGH"
    elif s>=60: lab="MEDIUM-HIGH"
    elif s>=40: lab="MEDIUM"
    elif s>=20: lab="LOW"
    else: lab="VERY LOW"
    # digital coverage score (electronic breadth of the 8 workflows)
    ds = 82 if impacted else 78
    if is_optum: ds=90
    return ds, s, lab

RECORDS=[]; SCORES=[]
for row in PAYERS:
    rec, ars, lab = build_record(*row)
    RECORDS.append(rec); SCORES.append((rec["Payer Organization"], rec["Payer Type"], ars, lab))
DF = pd.DataFrame(RECORDS, columns=COLS)
