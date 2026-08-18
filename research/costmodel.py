# -*- coding: utf-8 -*-
"""
AI Revenue Recovery OS — cost & investment model data.
All prices are researched 2026 figures with sources; secondary-sourced or
usage-derived monthly figures are labeled MODEL ASSUMPTION. Nothing quote-only
is invented (recorded 'Not publicly disclosed'). Configurable via ASSUMPTIONS.
"""
DATE = "August 18, 2026"
FX_DEFAULT = 90  # USD -> INR, MODEL ASSUMPTION (configurable)

# ---------------- SOURCES ----------------
CM_SOURCES = {
 "claude_max":("Anthropic Claude Max plan","https://support.claude.com/en/articles/11049741-what-is-the-max-plan","High"),
 "claude_team":("Anthropic Claude Team plan","https://support.claude.com/en/articles/9266767-what-is-the-team-plan","High"),
 "claude_ent":("Anthropic Claude Enterprise billing","https://support.claude.com/en/articles/11526368","Med-High"),
 "claude_code":("Claude Code with Pro/Max","https://support.claude.com/en/articles/11145838","High"),
 "cgpt_biz":("OpenAI ChatGPT Business pricing","https://openai.com/business/pricing/","High"),
 "cgpt_ent":("OpenAI ChatGPT Enterprise (quote-only)","https://openai.com/chatgpt/enterprise/","High"),
 "anthropic_api":("Anthropic API pricing (secondary-corroborated)","https://claude.com/pricing","Med"),
 "openai_api":("OpenAI API pricing","https://openai.com/api/pricing/","Med"),
 "aoai":("Azure OpenAI Service pricing + HIPAA BAA","https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/","Med"),
 "aoai_baa":("Azure OpenAI HIPAA eligibility (Microsoft Learn)","https://learn.microsoft.com/en-us/azure/compliance/offerings/offering-hipaa-us","High"),
 "ai_search":("Azure AI Search pricing","https://azure.microsoft.com/en-us/pricing/details/search/","Med"),
 "aca":("Azure Container Apps pricing","https://azure.microsoft.com/en-us/pricing/details/container-apps/","High"),
 "pg":("Azure Database for PostgreSQL Flexible Server pricing","https://azure.microsoft.com/en-us/pricing/details/postgresql/flexible-server/","Med"),
 "afd":("Azure Front Door pricing","https://azure.microsoft.com/en-us/pricing/details/frontdoor/","High"),
 "apim":("Azure API Management pricing","https://azure.microsoft.com/en-us/pricing/details/api-management/","Med"),
 "sb":("Azure Service Bus pricing","https://azure.microsoft.com/en-us/pricing/details/service-bus/","Med"),
 "redis":("Azure Cache for Redis pricing","https://azure.microsoft.com/en-us/pricing/details/cache/","Med"),
 "blob":("Azure Blob Storage pricing","https://azure.microsoft.com/en-us/pricing/details/storage/blobs/","High"),
 "kv":("Azure Key Vault / Managed HSM pricing","https://azure.microsoft.com/en-us/pricing/details/key-vault/","Med"),
 "defender":("Microsoft Defender for Cloud pricing","https://azure.microsoft.com/en-us/pricing/details/defender-for-cloud/","High"),
 "sentinel":("Microsoft Sentinel pricing","https://azure.microsoft.com/en-us/pricing/details/microsoft-sentinel/","High"),
 "monitor":("Azure Monitor / Log Analytics pricing","https://azure.microsoft.com/en-us/pricing/details/monitor/","High"),
 "fw":("Azure Firewall pricing","https://azure.microsoft.com/en-us/pricing/details/azure-firewall/","High"),
 "bastion":("Azure Bastion pricing","https://azure.microsoft.com/en-us/pricing/details/azure-bastion/","Med"),
 "acr":("Azure Container Registry pricing","https://azure.microsoft.com/en-us/pricing/details/container-registry/","High"),
 "bw":("Azure Bandwidth pricing","https://azure.microsoft.com/en-us/pricing/details/bandwidth/","High"),
 "hipaa_baa":("Microsoft HIPAA BAA (Product Terms/DPA)","https://learn.microsoft.com/en-us/azure/compliance/offerings/offering-hipaa-us","High"),
 "doc_ai":("Azure AI Document Intelligence pricing","https://azure.microsoft.com/en-us/pricing/details/ai-document-intelligence/","Med"),
 "voice":("Voice-AI stack per-minute (blended estimate)","https://www.retellai.com/blog/ai-voice-agent-pricing-full-cost-breakdown-platform-comparison-roi-analysis","Est"),
 "stedi":("Stedi clearinghouse pricing (free tier + PAYG)","https://www.stedi.com/pricing","High"),
 "soc2":("SOC 2 cost benchmarks (Secureframe/Drata)","https://secureframe.com/hub/soc-2/audit-cost","Med-High"),
 "hitrust":("HITRUST CSF cost benchmarks (Thoropass/Sprinto)","https://www.thoropass.com/blog/hitrust-audit-cost-a-guide","Med"),
 "hipaa_cost":("HIPAA risk assessment cost (Secureframe)","https://secureframe.com/hub/hipaa/costs","Med"),
 "pentest":("Penetration test cost (Bright Defense)","https://www.brightdefense.com/resources/penetration-testing-pricing/","Med-High"),
 "vanta":("Compliance automation tooling cost","https://www.secureleap.tech/blog/vanta-review-pricing-top-alternatives-for-compliance-automation","Med-High"),
 "vciso":("vCISO / fractional CISO cost","https://sidechannel.com/blog/the-ultimate-guide-to-vciso-pricing-everything-you-need-to-know/","Med-High"),
 "salary":("India developer salary benchmarks (Glassdoor/6figr/Levels)","https://6figr.com/","Med"),
}

# ---------------- AI DEV TOOL SUBSCRIPTIONS (per user / month) ----------------
CLAUDE_MAX_5X = 100
CLAUDE_MAX_20X = 200
CLAUDE_TEAM_STD = 20      # annual/user/mo (2-seat min)
CLAUDE_TEAM_PREM = 100
CGPT_BIZ_STD = 20         # annual/user/mo (2-seat min)
CGPT_BIZ_PREM = 100
CGPT_ENT = None           # quote-only

# ---------------- PRODUCTION AI API ($/1M tokens) — MODEL ASSUMPTION (2026, verify live) ----------------
AI_PRICES = {  # (input, output)
 "Claude Haiku 4.5":(1.00,5.00),
 "Claude Sonnet 4.6":(3.00,15.00),
 "Claude Opus 4.8":(5.00,25.00),
 "Azure OpenAI GPT-4o (PHI/BAA path)":(2.50,10.00),
 "OpenAI text-embedding-3-small":(0.02,0.0),
}
CACHE_READ_MULT = 0.10; CACHE_WRITE_MULT = 1.25; BATCH_DISCOUNT = 0.50
AI_SEARCH_MONTHLY = {"Basic":75,"S1":250,"S2":1000,"S3":1900}  # S2/S3 est
VOICE_PER_MIN = 0.12       # blended estimate ($0.05-0.15; premium up to $0.40)
DOC_AI_PER_1K = {"Read":1.50,"Layout":10,"Prebuilt":10,"Custom":30}

# per-claim AI usage assumptions (MODEL ASSUMPTION) — blended over claim lifecycle
PER_CLAIM = dict(
 light_actions=4, light_in=2000, light_out=500,           # Haiku classification/extraction
 mid_actions=1.5, mid_in=6000, mid_out=1500,              # Sonnet reasoning
 heavy_actions=0.5, heavy_in=15000, heavy_out=3000,       # Opus denials/appeals
 voice_rate=0.08, voice_minutes=6,                        # 8% escalate to voice, ~6 min
 doc_rate=0.15, doc_pages=3,                              # 15% need attachment OCR (custom)
 clearinghouse_txn=0.12,                                  # est per-transaction (Stedi PAYG; free tier for MVP)
 txns_per_claim=2.0,                                      # eligibility+status etc.
)
def ai_cost_per_claim(caching=True):
    hi,ho=AI_PRICES["Claude Haiku 4.5"]; si,so=AI_PRICES["Claude Sonnet 4.6"]; oi,oo=AI_PRICES["Claude Opus 4.8"]
    cf = CACHE_READ_MULT if caching else 1.0  # crude: assume ~50% of input cacheable -> blended factor
    infac = (0.5*cf + 0.5)  # half input cached at 0.1x
    p=PER_CLAIM
    light = p["light_actions"]*(p["light_in"]/1e6*hi*infac + p["light_out"]/1e6*ho)
    mid   = p["mid_actions"]*(p["mid_in"]/1e6*si*infac + p["mid_out"]/1e6*so)
    heavy = p["heavy_actions"]*(p["heavy_in"]/1e6*oi*infac + p["heavy_out"]/1e6*oo)
    return round(light+mid+heavy,4)
def voice_cost_per_claim():
    return round(PER_CLAIM["voice_rate"]*PER_CLAIM["voice_minutes"]*VOICE_PER_MIN,4)
def doc_cost_per_claim():
    return round(PER_CLAIM["doc_rate"]*PER_CLAIM["doc_pages"]*DOC_AI_PER_1K["Custom"]/1000,4)
def clearinghouse_per_claim():
    return round(PER_CLAIM["txns_per_claim"]*PER_CLAIM["clearinghouse_txn"],4)

# ---------------- SCENARIOS ----------------
SCENARIOS = {
 "DEV":     dict(claims=2000, orgs=1, payers=0, users=10,  label="Development"),
 "MVP":     dict(claims=50000, orgs=10, payers=1, users=100, label="MVP / Pilot"),
 "MEDIUM":  dict(claims=500000, orgs=50, payers=5, users=500, label="Medium Production"),
 "LARGE":   dict(claims=5000000, orgs=250, payers=20, users=2500, label="Large Production"),
}

# ---------------- AZURE MONTHLY LINE ITEMS BY SCENARIO (USD) ----------------
# (service, tier, monthly_usd, source_id)  — monthly_usd is MODEL ASSUMPTION from unit rates
AZURE = {
 "DEV":[
  ("Container Apps","Consumption",40,"aca"),("PostgreSQL Flexible Server","GP D2ds_v5 (no HA)",200,"pg"),
  ("Blob Storage","Hot LRS",10,"blob"),("Service Bus","Standard",10,"sb"),("Cache for Redis","Basic C0",12,"redis"),
  ("Key Vault","Standard",5,"kv"),("Front Door","Standard",35,"afd"),("API Management","Developer",48,"apim"),
  ("Log Analytics / Monitor","PAYG (~5GB)",20,"monitor"),("Container Registry","Basic",5,"acr"),
 ],
 "MVP":[
  ("Container Apps","Consumption (scaled)",120,"aca"),("PostgreSQL Flexible Server","GP D4ds_v5 + HA",500,"pg"),
  ("Cache for Redis","Standard C1",52,"redis"),("Blob Storage","Hot LRS",40,"blob"),("Service Bus","Standard",30,"sb"),
  ("Key Vault","Standard",15,"kv"),("Front Door","Standard + custom WAF",35,"afd"),("API Management","Basic v2",210,"apim"),
  ("Defender for Cloud","Servers P2 (few)",60,"defender"),("Sentinel + Log Analytics","~30 GB/mo",150,"sentinel"),
  ("Azure Monitor / App Insights","PAYG",40,"monitor"),("Container Registry","Standard",20,"acr"),
  ("Bandwidth / Egress","~300 GB",30,"bw"),("Azure AI Search","Basic",75,"ai_search"),
 ],
 "MEDIUM":[
  ("Container Apps","Consumption (autoscale)",600,"aca"),("PostgreSQL Flexible Server","GP large + HA + replica",1400,"pg"),
  ("Cache for Redis","Standard C2/C3",250,"redis"),("Blob Storage","Hot + lifecycle",200,"blob"),
  ("Service Bus","Premium 1 MU",700,"sb"),("Key Vault","Premium (HSM-keys)",50,"kv"),
  ("Front Door","Premium (WAF+PL) + traffic",530,"afd"),("API Management","Standard v2",734,"apim"),
  ("Defender for Cloud","Servers/DB/Containers",300,"defender"),("Sentinel + Log Analytics","~150 GB/mo",700,"sentinel"),
  ("Azure Monitor / App Insights","PAYG",150,"monitor"),("Azure Firewall","Standard",912,"fw"),
  ("Azure Bastion","Standard",150,"bastion"),("Container Registry","Premium",50,"acr"),
  ("Bandwidth / Egress","~2 TB",200,"bw"),("Azure AI Search","S1",250,"ai_search"),
 ],
 "LARGE":[
  ("Compute (Container Apps / AKS)","Enterprise autoscale",3000,"aca"),("PostgreSQL Flexible Server","Large + HA + replicas + geo",6000,"pg"),
  ("Cache for Redis","Enterprise / Managed Redis",1500,"redis"),("Blob Storage","Hot + GRS + geo",1200,"blob"),
  ("Service Bus","Premium 4 MU",2700,"sb"),("Key Vault + Managed HSM","Premium + HSM pool",2200,"kv"),
  ("Front Door","Premium + high traffic",2000,"afd"),("API Management","Premium (multi-region)",6000,"apim"),
  ("Defender for Cloud","Broad coverage",1500,"defender"),("Sentinel + Log Analytics","~500 GB/mo",2500,"sentinel"),
  ("Azure Monitor / App Insights","PAYG",600,"monitor"),("Azure Firewall","Premium + DR region",2600,"fw"),
  ("Azure Bastion","Standard (multi)",300,"bastion"),("Container Registry","Premium geo-replicated",150,"acr"),
  ("Bandwidth / Egress","~15 TB",1500,"bw"),("Azure AI Search","S2/S3",2000,"ai_search"),
  ("DDoS Network Protection","Standard",2944,"afd"),
 ],
}
def azure_monthly(scn): return sum(x[2] for x in AZURE[scn])

# ---------------- AI RUNTIME MONTHLY BY SCENARIO ----------------
def ai_runtime_monthly(scn):
    c=SCENARIOS[scn]["claims"]
    ai=c*ai_cost_per_claim(); voice=c*voice_cost_per_claim(); doc=c*doc_cost_per_claim()
    search=AI_SEARCH_MONTHLY["Basic"] if scn in("DEV","MVP") else (AI_SEARCH_MONTHLY["S1"] if scn=="MEDIUM" else AI_SEARCH_MONTHLY["S2"])
    return dict(ai=round(ai,2),voice=round(voice,2),doc=round(doc,2),search=search,
                total=round(ai+voice+doc+search,2))
def clearinghouse_monthly(scn):
    return round(SCENARIOS[scn]["claims"]*clearinghouse_per_claim(),2)

# ---------------- INDIA SALARY BANDS (annual base USD; ~87 INR/USD) ----------------
# role -> (low, mid, high)
SALARY = {
 "CTO / Principal Architect":(46000,86000,172000),
 "Product Manager":(23000,40000,63000),
 "Healthcare / RCM Business Analyst":(7000,14000,23000),
 "Senior Backend Engineer":(21000,34000,57000),
 "Senior Frontend Engineer":(17000,30000,52000),
 "AI / ML Engineer":(23000,40000,69000),
 "Integration Engineer (EDI/FHIR)":(14000,25000,44000),
 "DevOps / SRE Engineer":(21000,32000,57000),
 "Security Engineer":(17000,32000,52000),
 "QA Engineer":(9000,17000,29000),
 "Data Engineer":(14000,28000,48000),
 "Compliance Consultant (fractional)":(18000,36000,60000),  # annualized retainer
}
LOAD_FACTOR = 1.4  # fully-loaded employer cost multiplier (MODEL ASSUMPTION)

TEAM_COMP = {
 "Lean MVP (5)":["CTO / Principal Architect","Senior Backend Engineer","Senior Frontend Engineer","AI / ML Engineer","DevOps / SRE Engineer"],
 "Balanced MVP (8)":["CTO / Principal Architect","Senior Backend Engineer","Senior Frontend Engineer","AI / ML Engineer","Integration Engineer (EDI/FHIR)","DevOps / SRE Engineer","QA Engineer","Security Engineer"],
 "Production (13)":["CTO / Principal Architect","Product Manager","Healthcare / RCM Business Analyst","Senior Backend Engineer","Senior Frontend Engineer","AI / ML Engineer","Integration Engineer (EDI/FHIR)","DevOps / SRE Engineer","Security Engineer","QA Engineer","Data Engineer","Compliance Consultant (fractional)","Security Engineer"],
}
def team_annual(model, band="mid"):
    idx={"low":0,"mid":1,"high":2}[band]
    return round(sum(SALARY[r][idx] for r in TEAM_COMP[model])*LOAD_FACTOR)

# ---------------- SECURITY & COMPLIANCE (USD) ----------------
# item -> (one_time_low, one_time_high, annual_low, annual_high, category)
SECURITY = [
 ("HIPAA risk / gap assessment",5000,20000,0,0,"one-time"),
 ("HIPAA policies / SOPs + training",4000,12000,0,0,"one-time"),
 ("Compliance automation tooling (Vanta/Drata)",0,0,7500,50000,"annual"),
 ("Penetration test (web + API)",8000,25000,0,0,"per engagement"),
 ("vCISO / fractional CISO",0,0,30000,180000,"annual"),
 ("SIEM / managed SOC (MDR)",0,0,6000,60000,"annual"),
 ("SOC 2 Type I",15000,35000,0,0,"one-time"),
 ("SOC 2 Type II (all-in first year)",30000,80000,0,0,"one-time"),
 ("HITRUST i1 (roadmap)",60000,200000,0,0,"one-time (later)"),
 ("Security training (per employee/yr)",0,0,85,150,"annual/employee"),
]
COMPLIANCE_ROADMAP = [
 ("SOC 2 Type I","M10–M11","$15k–35k","Readiness + point-in-time audit","Provider trust; sales enabler"),
 ("SOC 2 Type II","M12 + 6-mo window","$30k–80k","6-month observation + audit","Enterprise/payer requirement"),
 ("HITRUST i1","Year 2","$60k–200k","If a payer/enterprise customer demands it","Payer contracts; high assurance"),
 ("HIPAA program","M10 ongoing","$20k–40k + tooling","Risk assessment, policies, training, evidence","Table stakes for PHI"),
]

# ---------------- BUILD/PHASE DURATIONS (months, realistic) ----------------
MVP_BUILD_MONTHS = 8      # through M8-M9 (MVP-capable)
PROD_BUILD_MONTHS = 11.5  # through M12

# ---------------- CONTINGENCY ----------------
CONTINGENCY = {"low":0.10,"mid":0.15,"high":0.20}

# ---------------- HELPERS ----------------
def claude_matrix():
    rows=[]
    for users in [3,5,10,15]:
        for plan,price in [("Max 5x",CLAUDE_MAX_5X),("Max 20x",CLAUDE_MAX_20X)]:
            m=users*price; rows.append((users,plan,m,m*12,m*12,m*24))
    return rows  # (users, plan, monthly, annual, 12mo, 24mo)
def chatgpt_matrix():
    rows=[]
    for users in [5,10,15,20]:
        m=users*CGPT_BIZ_STD; rows.append((users,"Business Standard",m,m*12,m*12,m*24))
    return rows

def compute():
    """Headline numbers for the report."""
    r={}
    r["ai_per_claim"]=ai_cost_per_claim(); r["voice_per_claim"]=voice_cost_per_claim()
    r["doc_per_claim"]=doc_cost_per_claim(); r["ch_per_claim"]=clearinghouse_per_claim()
    r["all_in_per_claim"]=round(r["ai_per_claim"]+r["voice_per_claim"]+r["doc_per_claim"]+r["ch_per_claim"],4)
    r["azure"]={s:azure_monthly(s) for s in SCENARIOS}
    r["ai_rt"]={s:ai_runtime_monthly(s) for s in SCENARIOS}
    r["clearinghouse"]={s:clearinghouse_monthly(s) for s in SCENARIOS}
    r["claude_baseline_mo"]=5*CLAUDE_MAX_20X          # 5 users x Max 20x
    r["chatgpt_baseline_mo"]=5*CGPT_BIZ_STD
    r["team"]={m:{b:team_annual(m,b) for b in ["low","mid","high"]} for m in TEAM_COMP}
    # dev cost (build) = lean team (mid) * MVP months ; prod team * prod months
    r["mvp_dev_cost"]=round(team_annual("Lean MVP (5)","mid")/12*MVP_BUILD_MONTHS)
    r["prod_dev_cost"]=round(team_annual("Balanced MVP (8)","mid")/12*PROD_BUILD_MONTHS)
    # security one-time (MVP) mid
    sec_mvp_onetime = 12000+8000+16000  # risk assessment + policies/training + pentest (mid)
    sec_mvp_annual = 12000+60000        # tooling + fractional vCISO (mid-low)
    r["sec_mvp_onetime"]=sec_mvp_onetime; r["sec_mvp_annual"]=sec_mvp_annual
    # MVP investment (one-time build phase, ~8 months)
    dev=r["mvp_dev_cost"]
    azure_build = (azure_monthly("DEV")+azure_monthly("MVP"))*MVP_BUILD_MONTHS/2  # ramp
    ai_subs = (r["claude_baseline_mo"]+r["chatgpt_baseline_mo"])*MVP_BUILD_MONTHS
    ai_api_pilot = ai_runtime_monthly("MVP")["total"]*3  # ~3 months pilot volume
    clearinghouse_setup = 5000
    legal = 25000; testing = 15000
    subtotal = dev+azure_build+ai_subs+ai_api_pilot+sec_mvp_onetime+clearinghouse_setup+legal+testing
    r["mvp_investment"]=round(subtotal*(1+CONTINGENCY["mid"]))
    r["mvp_investment_parts"]=dict(dev=round(dev),azure=round(azure_build),ai_subs=round(ai_subs),
        ai_api=round(ai_api_pilot),security=sec_mvp_onetime,clearinghouse=clearinghouse_setup,legal=legal,testing=testing,
        contingency=round(subtotal*CONTINGENCY["mid"]))
    # 12-month: build + run to medium-ish
    team12 = team_annual("Balanced MVP (8)","mid")
    azure12 = azure_monthly("MVP")*6 + azure_monthly("MEDIUM")*6
    aiapi12 = ai_runtime_monthly("MVP")["total"]*6 + ai_runtime_monthly("MEDIUM")["total"]*6
    subs12 = (r["claude_baseline_mo"]+r["chatgpt_baseline_mo"])*12
    sec12 = sec_mvp_onetime + sec_mvp_annual + 30000  # + SOC2 Type I start
    other12 = legal+testing+clearinghouse_setup
    sub12 = team12+azure12+aiapi12+subs12+sec12+other12
    r["inv_12mo"]=round(sub12*(1+CONTINGENCY["mid"]))
    # 24-month: scale to production
    team24 = team_annual("Balanced MVP (8)","mid") + team_annual("Production (13)","mid")
    azure24 = azure_monthly("MEDIUM")*12 + azure_monthly("LARGE")*0 + azure_monthly("MEDIUM")*12
    aiapi24 = ai_runtime_monthly("MEDIUM")["total"]*24
    subs24 = (r["claude_baseline_mo"]+r["chatgpt_baseline_mo"])*24
    sec24 = sec12 + 80000 + 12000  # SOC2 Type II + ongoing
    sub24 = team24+azure24+aiapi24+subs24+sec24+other12*2
    r["inv_24mo"]=round(sub24*(1+CONTINGENCY["mid"]))
    # monthly burn (12-mo avg)
    r["monthly_burn_12"]=round(r["inv_12mo"]/12)
    return r

if __name__=="__main__":
    import json
    r=compute()
    print(json.dumps({k:v for k,v in r.items() if not isinstance(v,dict)},indent=1))
    print("AI/claim $",r["ai_per_claim"],"all-in/claim $",r["all_in_per_claim"])
    print("Azure monthly:",r["azure"])
    print("MVP investment $",f"{r['mvp_investment']:,}")
    print("12-mo $",f"{r['inv_12mo']:,}","24-mo $",f"{r['inv_24mo']:,}")
