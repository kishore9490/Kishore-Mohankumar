# -*- coding: utf-8 -*-
"""
Payer universe (identity layer) for the AI Revenue Recovery OS
U.S. Payer API & RCM Feasibility research.

IDENTITY ONLY. Capability flags are assigned in build_report.py from
research-verified rules. Payer IDs are clearinghouse-dependent; the values
here are commonly-published EDI payer IDs for the large nationals and are
marked "varies" elsewhere to avoid over-precision. Confidence is tracked.

No PHI. All content is public organizational / infrastructure information.
"""

# Category codes:
#  NAT   national commercial
#  BCBS  Blue Cross Blue Shield licensee
#  MCO   Medicaid/CHIP managed care org
#  MA    Medicare Advantage focused
#  QHP   marketplace / exchange issuer
#  TPA   third-party administrator
#  GOV   government fee-for-service program

# (org, parent, category, plan_types, states, payer_id, website)
PAYERS = [
    # ---------------- National commercial ----------------
    ("UnitedHealthcare", "UnitedHealth Group", "NAT", "Commercial; MA; Medicaid; Exchange", "National", "87726", "https://www.uhc.com"),
    ("Optum (UHG)", "UnitedHealth Group", "NAT", "Services; PBM; care", "National", "Varies", "https://www.optum.com"),
    ("Aetna", "CVS Health", "NAT", "Commercial; MA; Medicaid; Exchange", "National", "60054", "https://www.aetna.com"),
    ("Cigna Healthcare", "The Cigna Group", "NAT", "Commercial; MA; Exchange", "National", "62308", "https://www.cigna.com"),
    ("Evernorth", "The Cigna Group", "NAT", "PBM; behavioral; services", "National", "Varies", "https://www.evernorth.com"),
    ("Humana", "Humana Inc.", "NAT", "MA; Commercial; Medicaid; TRICARE", "National", "61101", "https://www.humana.com"),
    ("Elevance Health (Anthem)", "Elevance Health", "NAT", "Commercial; MA; Medicaid; Exchange; BCBS", "14 states (BCBS) + national", "Varies", "https://www.elevancehealth.com"),
    ("Centene", "Centene Corporation", "NAT", "Medicaid; Exchange; MA", "National", "Varies", "https://www.centene.com"),
    ("Molina Healthcare", "Molina Healthcare Inc.", "NAT", "Medicaid; MA; Exchange", "Multi-state", "Varies", "https://www.molinahealthcare.com"),
    ("Kaiser Permanente", "Kaiser Foundation Health Plan", "NAT", "Integrated HMO; MA; Medicaid; Exchange", "8 states + DC", "Varies", "https://healthy.kaiserpermanente.org"),
    ("Health Net", "Centene Corporation", "NAT", "Commercial; Medicaid; MA", "CA; AZ; OR", "Varies", "https://www.healthnet.com"),
    ("WellCare", "Centene Corporation", "MA", "MA; Medicaid; PDP", "National", "Varies", "https://www.wellcare.com"),
    ("Ambetter", "Centene Corporation", "QHP", "Exchange / Marketplace", "Multi-state", "Varies", "https://www.ambetterhealth.com"),

    # ---------------- BCBS licensees ----------------
    ("Health Care Service Corp (HCSC)", "HCSC (mutual)", "BCBS", "Commercial; MA; Medicaid; Exchange", "IL; TX; OK; NM; MT", "Varies", "https://www.hcsc.com"),
    ("Independence Blue Cross", "Independence Health Group", "BCBS", "Commercial; MA; Medicaid; Exchange", "PA (SE)", "Varies", "https://www.ibx.com"),
    ("Highmark", "Highmark Health", "BCBS", "Commercial; MA; Exchange", "PA; WV; DE; NY", "Varies", "https://www.highmark.com"),
    ("CareFirst BCBS", "CareFirst Inc.", "BCBS", "Commercial; MA; Exchange", "MD; DC; VA (N)", "Varies", "https://www.carefirst.com"),
    ("Florida Blue", "GuideWell", "BCBS", "Commercial; MA; Exchange", "FL", "Varies", "https://www.floridablue.com"),
    ("Blue Shield of California", "Blue Shield of California", "BCBS", "Commercial; MA; Medicaid; Exchange", "CA", "Varies", "https://www.blueshieldca.com"),
    ("Anthem Blue Cross (CA)", "Elevance Health", "BCBS", "Commercial; MA; Medicaid; Exchange", "CA", "Varies", "https://www.anthem.com/ca"),
    ("Premera Blue Cross", "Premera", "BCBS", "Commercial; MA; Exchange", "WA; AK", "Varies", "https://www.premera.com"),
    ("Regence (Cambia)", "Cambia Health Solutions", "BCBS", "Commercial; MA; Exchange", "OR; WA; ID; UT", "Varies", "https://www.regence.com"),
    ("BCBS of Michigan", "BCBSM (mutual)", "BCBS", "Commercial; MA; Exchange", "MI", "Varies", "https://www.bcbsm.com"),
    ("Blue Cross NC", "Blue Cross Blue Shield of NC", "BCBS", "Commercial; MA; Exchange", "NC", "Varies", "https://www.bluecrossnc.com"),
    ("Horizon BCBS NJ", "Horizon Healthcare Services", "BCBS", "Commercial; MA; Medicaid; Exchange", "NJ", "Varies", "https://www.horizonblue.com"),
    ("BCBS of Tennessee", "BCBST (mutual)", "BCBS", "Commercial; MA; Exchange", "TN", "Varies", "https://www.bcbst.com"),
    ("Excellus BCBS", "Lifetime Healthcare", "BCBS", "Commercial; MA; Exchange", "NY (upstate)", "Varies", "https://www.excellusbcbs.com"),

    # ---------------- Medicaid / CHIP managed care ----------------
    ("UnitedHealthcare Community Plan", "UnitedHealth Group", "MCO", "Medicaid; CHIP; D-SNP", "Multi-state", "Varies", "https://www.uhccommunityplan.com"),
    ("Aetna Better Health", "CVS Health", "MCO", "Medicaid; CHIP; D-SNP", "Multi-state", "Varies", "https://www.aetnabetterhealth.com"),
    ("Amerigroup / Wellpoint", "Elevance Health", "MCO", "Medicaid; CHIP; MA", "Multi-state", "Varies", "https://www.wellpoint.com"),
    ("AmeriHealth Caritas", "AmeriHealth Caritas", "MCO", "Medicaid; CHIP; D-SNP", "Multi-state", "Varies", "https://www.amerihealthcaritas.com"),
    ("CareSource", "CareSource", "MCO", "Medicaid; Exchange; MA", "OH; IN; GA; KY; WV; others", "Varies", "https://www.caresource.com"),
    ("Superior HealthPlan", "Centene Corporation", "MCO", "Medicaid; CHIP; Exchange", "TX", "Varies", "https://www.superiorhealthplan.com"),

    # ---------------- Marketplace / newer ----------------
    ("Oscar Health", "Oscar Health Inc.", "QHP", "Exchange; MA; small group", "Multi-state", "Varies", "https://www.hioscar.com"),

    # ---------------- Third-party administrators ----------------
    ("UMR", "UnitedHealth Group", "TPA", "Self-funded administration", "National", "39026", "https://www.umr.com"),
    ("Meritain Health", "CVS Health (Aetna)", "TPA", "Self-funded administration", "National", "64157", "https://www.meritain.com"),
    ("GEHA", "GEHA", "TPA", "Federal employee (FEHB); dental", "National", "44054", "https://www.geha.com"),
    ("Allied Benefit Systems", "Allied Benefit Systems", "TPA", "Self-funded administration", "National", "37308", "https://www.alliedbenefit.com"),
    ("WebTPA", "GuideWell", "TPA", "Self-funded administration", "National", "Varies", "https://www.webtpa.com"),

    # ---------------- Government fee-for-service ----------------
    ("Medicare FFS (CMS / MACs)", "CMS", "GOV", "Medicare Part A/B FFS", "National (by MAC jurisdiction)", "Varies", "https://www.cms.gov"),
    ("Medicaid FFS (State agencies)", "State Medicaid agencies", "GOV", "Medicaid fee-for-service", "State-specific", "Varies", "https://www.medicaid.gov"),
    ("TRICARE", "Defense Health Agency", "GOV", "Military health", "National (regions)", "Varies", "https://www.tricare.mil"),
    ("Railroad Medicare", "CMS / Palmetto GBA", "GOV", "Medicare (railroad)", "National", "Varies", "https://www.palmettogba.com/rr"),
]

# Clearinghouse / API-infrastructure vendors (separate universe)
# (name, category, website) — capability flags assigned in build_report.py
CLEARINGHOUSES = [
    ("Stedi", "API-first clearinghouse", "https://www.stedi.com"),
    ("Availity", "Clearinghouse / payer network", "https://www.availity.com"),
    ("Optum (Change Healthcare)", "Clearinghouse / network", "https://www.optum.com"),
    ("Waystar", "RCM platform / clearinghouse", "https://www.waystar.com"),
    ("Zelis", "Payments / network", "https://www.zelis.com"),
    ("pVerify", "Eligibility API vendor", "https://www.pverify.com"),
    ("Claim.MD", "Clearinghouse", "https://www.claim.md"),
    ("Office Ally", "Clearinghouse", "https://www.officeally.com"),
    ("Inovalon", "Data platform / clearinghouse", "https://www.inovalon.com"),
    ("Edifecs", "EDI / interoperability platform", "https://www.edifecs.com"),
]

if __name__ == "__main__":
    print(f"{len(PAYERS)} payer organizations, {len(CLEARINGHOUSES)} infrastructure vendors")
