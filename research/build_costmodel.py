# -*- coding: utf-8 -*-
"""
Generate the product build & investment deliverables:
  - AI_Revenue_Recovery_OS_Product_Cost_Model.xlsx  (39 sheets, assumption-driven formulas)
  - AI_Revenue_Recovery_OS_Product_Build_and_Investment_Report.pdf (charts, TOC, page numbers)
No fabricated quote-only pricing; MODEL ASSUMPTIONS labeled; no PHI.
"""
import os
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import costmodel as CM

OUT=os.path.dirname(os.path.abspath(__file__))
ASSET=os.path.join(OUT,"_assets3"); os.makedirs(ASSET,exist_ok=True)
R=CM.compute(); DATE=CM.DATE
money=lambda n: "$"+format(round(n),",")

# palette
NAVY="#0C1B30"; TEAL="#118C7E"; TEAL_L="#2FBFA6"; CYAN="#2E7FC2"; INK="#1a2433"; MUT="#6B7B90"; LINE="#D5DEE8"
GREEN="#2E9E6B"; AMBER="#D8942A"; REDX="#C7503F"; VIOLET="#6C5CE0"
plt.rcParams.update({"font.family":"DejaVu Sans","font.size":9,"axes.edgecolor":LINE,"axes.linewidth":.8,
 "figure.dpi":150,"savefig.dpi":150,"text.color":INK,"axes.labelcolor":INK,"xtick.color":MUT,"ytick.color":MUT})
def _s(ax):
    for s in ["top","right"]: ax.spines[s].set_visible(False)
    ax.tick_params(length=0)

# ======================================================================
# CHARTS
# ======================================================================
def ch_investment():
    labs=["MVP","12-month","24-month"]; vals=[R["mvp_investment"],R["inv_12mo"],R["inv_24mo"]]
    fig,ax=plt.subplots(figsize=(7.6,3.6)); b=ax.bar(labs,vals,color=[TEAL,CYAN,NAVY],width=.55)
    for r,v in zip(b,vals): ax.text(r.get_x()+r.get_width()/2,v,money(v),ha="center",va="bottom",fontsize=9,fontweight="bold")
    ax.set_ylabel("USD"); ax.set_title("Total investment",fontsize=10,loc="left"); _s(ax)
    p=os.path.join(ASSET,"invest.png"); plt.savefig(p,bbox_inches="tight"); plt.close(); return p
def ch_azure():
    labs=[CM.SCENARIOS[s]["label"] for s in CM.SCENARIOS]; vals=[R["azure"][s] for s in CM.SCENARIOS]
    fig,ax=plt.subplots(figsize=(7.6,3.6)); b=ax.bar(labs,vals,color=[GREEN,TEAL_L,CYAN,NAVY],width=.6)
    for r,v in zip(b,vals): ax.text(r.get_x()+r.get_width()/2,v,money(v),ha="center",va="bottom",fontsize=8.5,fontweight="bold")
    ax.set_ylabel("USD / month"); ax.set_title("Azure monthly cost by scale (MODEL ASSUMPTION)",fontsize=9.5,loc="left"); _s(ax)
    p=os.path.join(ASSET,"azure.png"); plt.savefig(p,bbox_inches="tight"); plt.close(); return p
def ch_aicost():
    labs=[CM.SCENARIOS[s]["label"] for s in CM.SCENARIOS]; vals=[R["ai_rt"][s]["total"] for s in CM.SCENARIOS]
    fig,ax=plt.subplots(figsize=(7.6,3.6)); b=ax.bar(labs,vals,color=VIOLET,width=.6)
    for r,v in zip(b,vals): ax.text(r.get_x()+r.get_width()/2,v,money(v),ha="center",va="bottom",fontsize=8.5,fontweight="bold")
    ax.set_ylabel("USD / month"); ax.set_title("Production AI runtime cost by scale (AI+voice+doc+search)",fontsize=9.5,loc="left"); _s(ax)
    p=os.path.join(ASSET,"aicost.png"); plt.savefig(p,bbox_inches="tight"); plt.close(); return p
def ch_perclaim():
    labs=["AI (LLM)","Voice","Document AI","Clearinghouse txn"]; vals=[R["ai_per_claim"],R["voice_per_claim"],R["doc_per_claim"],R["ch_per_claim"]]
    fig,ax=plt.subplots(figsize=(7.6,3.4)); b=ax.barh(labs,vals,color=[VIOLET,REDX,AMBER,CYAN]); ax.invert_yaxis()
    for i,v in enumerate(vals): ax.text(v,i,f" ${v:.3f}",va="center",fontsize=9,fontweight="bold")
    ax.set_xlabel("USD per worked claim"); ax.set_title(f"Cost per worked claim ≈ ${R['all_in_per_claim']:.2f} (MODEL ASSUMPTION)",fontsize=9.5,loc="left"); _s(ax)
    p=os.path.join(ASSET,"perclaim.png"); plt.savefig(p,bbox_inches="tight"); plt.close(); return p
def ch_team():
    models=list(CM.TEAM_COMP); vals=[R["team"][m]["mid"] for m in models]
    fig,ax=plt.subplots(figsize=(7.6,3.4)); b=ax.bar([m.split(" (")[0] for m in models],vals,color=[GREEN,TEAL_L,CYAN],width=.55)
    for r,v in zip(b,vals): ax.text(r.get_x()+r.get_width()/2,v,money(v),ha="center",va="bottom",fontsize=8.5,fontweight="bold")
    ax.set_ylabel("USD / year (loaded, mid)"); ax.set_title("Annual human-resource cost by team model (India, mid-band ×1.4)",fontsize=9,loc="left"); _s(ax)
    p=os.path.join(ASSET,"team.png"); plt.savefig(p,bbox_inches="tight"); plt.close(); return p
def ch_security():
    items=[("HIPAA assess.",12000),("Policies/train",8000),("Pen test",18000),("Tooling/yr",15000),("vCISO/yr",60000),("SOC2 Type II",50000)]
    fig,ax=plt.subplots(figsize=(7.6,3.4)); b=ax.bar([i[0] for i in items],[i[1] for i in items],color=REDX,width=.6)
    for r,(_,v) in zip(b,items): ax.text(r.get_x()+r.get_width()/2,v,money(v),ha="center",va="bottom",fontsize=8,fontweight="bold")
    ax.set_ylabel("USD (mid)"); ax.set_title("Security & compliance cost items (ranges → mid)",fontsize=9.5,loc="left"); _s(ax)
    p=os.path.join(ASSET,"security.png"); plt.savefig(p,bbox_inches="tight"); plt.close(); return p
def ch_timeline():
    ms=["M0","M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12"]
    dur=[2,3,4,4,3,4,4,3,4,3,4,4,4]
    fig,ax=plt.subplots(figsize=(8.4,3.6)); start=0; ys=range(len(ms))
    for i,(m,d) in enumerate(zip(ms,dur)):
        c=GREEN if i<=8 else (AMBER if i<11 else CYAN)
        ax.barh(i,d,left=start,color=c,height=.6); ax.text(start+d/2,i,f"{m}",ha="center",va="center",fontsize=7,color="white",fontweight="bold"); start+=d
    ax.set_yticks(list(ys)); ax.set_yticklabels(ms,fontsize=7); ax.invert_yaxis(); ax.set_xlabel("Weeks (realistic, cumulative)")
    ax.set_title("Milestone timeline M0–M12 (~46 weeks)",fontsize=9.5,loc="left"); _s(ax)
    p=os.path.join(ASSET,"timeline.png"); plt.savefig(p,bbox_inches="tight"); plt.close(); return p
def ch_cumulative():
    months=list(range(1,25))
    # simple cumulative burn approximation
    m12=R["inv_12mo"]/12; m24=(R["inv_24mo"]-R["inv_12mo"])/12
    cum=[]; t=0
    for mo in months:
        t += m12 if mo<=12 else m24; cum.append(t)
    fig,ax=plt.subplots(figsize=(8.0,3.4)); ax.plot(months,cum,color=TEAL,lw=2.4)
    ax.fill_between(months,cum,color=TEAL,alpha=.12)
    ax.axvline(12,color=MUT,ls="--",lw=.8); ax.text(12.2,cum[-1]*0.2,"Year 1",fontsize=8,color=MUT)
    ax.scatter([12,24],[cum[11],cum[23]],color=TEAL,zorder=3)
    ax.text(12,cum[11],f" {money(cum[11])}",fontsize=8,fontweight="bold",va="bottom")
    ax.text(24,cum[23],f" {money(cum[23])}",fontsize=8,fontweight="bold",va="bottom",ha="right")
    ax.set_xlabel("Month"); ax.set_ylabel("Cumulative USD"); ax.set_title("Cumulative investment (24 months)",fontsize=9.5,loc="left"); _s(ax)
    p=os.path.join(ASSET,"cumulative.png"); plt.savefig(p,bbox_inches="tight"); plt.close(); return p
def ch_burn():
    parts=R["mvp_investment_parts"]; labs=["Dev","Azure","AI subs","AI API","Security","Legal","Testing","Contingency"]
    vals=[parts["dev"],parts["azure"],parts["ai_subs"],parts["ai_api"],parts["security"],parts["legal"],parts["testing"],parts["contingency"]]
    fig,ax=plt.subplots(figsize=(7.8,3.6)); b=ax.bar(labs,vals,color=[NAVY,GREEN,TEAL_L,VIOLET,REDX,MUT,AMBER,"#B0BAC7"],width=.62)
    for r,v in zip(b,vals): ax.text(r.get_x()+r.get_width()/2,v,money(v),ha="center",va="bottom",fontsize=7.4,fontweight="bold",rotation=0)
    ax.set_ylabel("USD"); ax.set_title(f"MVP investment breakdown ≈ {money(R['mvp_investment'])}",fontsize=9.5,loc="left"); _s(ax); plt.xticks(fontsize=8)
    p=os.path.join(ASSET,"burn.png"); plt.savefig(p,bbox_inches="tight"); plt.close(); return p
def ch_devtools():
    rows=CM.claude_matrix(); u5=[r for r in rows if r[0]==5]
    labs=["3×5x","5×5x","10×5x","15×5x","3×20x","5×20x","10×20x","15×20x"]
    vals=[r[2] for r in rows]
    fig,ax=plt.subplots(figsize=(7.8,3.4)); b=ax.bar(labs,vals,color=[TEAL_L]*4+[NAVY]*4,width=.6)
    for r,v in zip(b,vals): ax.text(r.get_x()+r.get_width()/2,v,f"${v:,}",ha="center",va="bottom",fontsize=7.4,fontweight="bold")
    ax.set_ylabel("USD / month"); ax.set_title("Claude Max monthly cost (users × plan) — baseline 5 × Max 20x = $1,000/mo",fontsize=8.8,loc="left"); _s(ax)
    p=os.path.join(ASSET,"devtools.png"); plt.savefig(p,bbox_inches="tight"); plt.close(); return p
def ch_arch():
    from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
    fig,ax=plt.subplots(figsize=(8.4,4.2)); ax.axis("off"); ax.set_xlim(0,10); ax.set_ylim(0,10)
    def box(x,y,w,h,t,fc=NAVY,fs=7.6,tc="white"):
        ax.add_patch(FancyBboxPatch((x,y),w,h,boxstyle="round,pad=0.02,rounding_size=0.1",fc=fc,ec=LINE,lw=1)); ax.text(x+w/2,y+h/2,t,ha="center",va="center",color=tc,fontsize=fs,fontweight="bold")
    def ar(x1,y1,x2,y2): ax.add_patch(FancyArrowPatch((x1,y1),(x2,y2),arrowstyle="-|>",mutation_scale=8,color=MUT,lw=1))
    box(3.5,9.1,3,0.7,"Front Door · WAF · APIM · Entra ID",fc=TEAL,fs=7.2)
    ar(5,9.1,5,8.5)
    for i,(t) in enumerate(["Provider API","Payer API","Admin API"]): box(0.6+i*3.2,7.7,2.8,0.7,t,fc="#1c3350",fs=7.4)
    ar(5,7.7,5,7.1)
    box(3.2,6.3,3.6,0.7,"AI ORCHESTRATION",fc=TEAL_L,fs=8,tc="#04121a")
    for i,t in enumerate(["Rules","Agents","RAG"]): box(1.2+i*2.6,5.1,2.2,0.6,t,fc=NAVY,fs=7.4)
    ar(5,6.3,5,5.7)
    box(3.2,3.9,3.6,0.7,"Workflow Engine",fc="#1c3350",fs=7.6); ar(5,5.1,5,4.6)
    for i,t in enumerate(["PostgreSQL","Service Bus","Redis"]): box(0.8+i*3.1,2.6,2.7,0.6,t,fc=NAVY,fs=7.2)
    ar(5,3.9,5,3.2)
    box(2.6,0.9,4.8,0.7,"PHI/Tenant Data · Blob · Audit · DR",fc="#2a2140",fs=7.4); ar(5,2.6,5,1.6)
    ax.text(0.2,0.2,"Security plane: Entra · Key Vault · Private Link · Firewall · Defender · Sentinel · Monitor · Backup/DR",fontsize=6.4,color=MUT)
    p=os.path.join(ASSET,"arch.png"); plt.savefig(p,bbox_inches="tight",dpi=150); plt.close(); return p

CH={k:f() for k,f in {"invest":ch_investment,"azure":ch_azure,"aicost":ch_aicost,"perclaim":ch_perclaim,
 "team":ch_team,"security":ch_security,"timeline":ch_timeline,"cumulative":ch_cumulative,"burn":ch_burn,
 "devtools":ch_devtools,"arch":ch_arch}.items()}
print("charts:",len(CH))

# ======================================================================
# EXCEL
# ======================================================================
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

XLSX=os.path.join(OUT,"AI_Revenue_Recovery_OS_Product_Cost_Model.xlsx")
HFILL=PatternFill("solid",fgColor="0C1B30"); HFONT=Font(color="FFFFFF",bold=True,size=10)
TFONT=Font(color="0C1B30",bold=True,size=15); SFONT=Font(color="118C7E",bold=True,size=11)
ASSUM_FILL=PatternFill("solid",fgColor="FFF7E6"); CALC_FILL=PatternFill("solid",fgColor="EAF3EF")
THIN=Side(style="thin",color="D5DEE8"); BORDER=Border(left=THIN,right=THIN,top=THIN,bottom=THIN)
WRAP=Alignment(wrap_text=True,vertical="top"); RIGHT=Alignment(horizontal="right")
MONEY="#,##0"; MONEY2="#,##0.0000"
def hdr(ws,row,n):
    for c in range(1,n+1):
        cc=ws.cell(row=row,column=c); cc.fill=HFILL; cc.font=HFONT; cc.alignment=Alignment(wrap_text=True,vertical="center"); cc.border=BORDER
    ws.freeze_panes=ws.cell(row=row+1,column=1); ws.auto_filter.ref=f"A{row}:{get_column_letter(n)}{row}"; ws.row_dimensions[row].height=28
def titleblk(ws,title,sub=None,note=None):
    ws["A1"]=title; ws["A1"].font=TFONT; r=2
    if sub: ws[f"A{r}"]=sub; ws[f"A{r}"].font=SFONT; r+=1
    if note: ws[f"A{r}"]=note; ws[f"A{r}"].font=Font(italic=True,color="6B7B90",size=9); ws[f"A{r}"].alignment=WRAP; r+=1
    return r+1
def table(ws,start,headers,rows,widths=None,money_cols=(),link_col=None):
    for j,h in enumerate(headers,1): ws.cell(row=start,column=j,value=h)
    hdr(ws,start,len(headers))
    for i,rw in enumerate(rows,start+1):
        for j,val in enumerate(rw,1):
            cc=ws.cell(row=i,column=j,value=val); cc=cc; c=ws.cell(row=i,column=j); c.border=BORDER; c.alignment=WRAP
            if j in money_cols and isinstance(val,(int,float)): c.number_format=MONEY
            if link_col and j==link_col and isinstance(val,str) and val.startswith("http"):
                c.hyperlink=val; c.font=Font(color="2E7FC2",underline="single",size=9)
    if widths:
        for j,w in enumerate(widths,1): ws.column_dimensions[get_column_letter(j)].width=w
    return start+len(rows)+1

wb=Workbook(); wb.remove(wb.active)

# ---- Sheet 2 ASSUMPTIONS (drives formulas) — build first so refs exist ----
wsA=wb.create_sheet("ASSUMPTIONS")
titleblk(wsA,"Assumptions (edit these — dependent sheets recalculate)","Yellow cells are inputs.",
 "MODEL ASSUMPTIONS. Prices are researched 2026 figures (see SOURCES). Quote-only items are 'Not publicly disclosed' and never invented.")
A={}  # name -> cell ref like 'ASSUMPTIONS'!$B$6
arows=[
 ("USD to INR exchange rate",CM.FX_DEFAULT,"fx"),
 ("Contingency %",0.15,"cont"),
 ("Claims / month (MVP)",CM.SCENARIOS["MVP"]["claims"],"claims_mvp"),
 ("Claims / month (Medium)",CM.SCENARIOS["MEDIUM"]["claims"],"claims_med"),
 ("Claims / month (Large)",CM.SCENARIOS["LARGE"]["claims"],"claims_lg"),
 ("AI cost per claim (USD)",R["ai_per_claim"],"ai_pc"),
 ("Voice cost per claim (USD)",R["voice_per_claim"],"voice_pc"),
 ("Document AI per claim (USD)",R["doc_per_claim"],"doc_pc"),
 ("Clearinghouse per claim (USD)",R["ch_per_claim"],"ch_pc"),
 ("Claude Max 20x ($/user/mo)",CM.CLAUDE_MAX_20X,"cmax"),
 ("Claude Max users (baseline)",5,"cmax_u"),
 ("ChatGPT Business ($/user/mo)",CM.CGPT_BIZ_STD,"cgpt"),
 ("ChatGPT users",5,"cgpt_u"),
 ("Team fully-loaded factor",CM.LOAD_FACTOR,"load"),
]
r=6
for lab,val,key in arows:
    wsA.cell(row=r,column=1,value=lab).font=Font(bold=True,size=10)
    c=wsA.cell(row=r,column=2,value=val); c.fill=ASSUM_FILL; c.border=BORDER
    if "%" in lab or "factor" in lab: c.number_format="0%" if "%" in lab else "0.0"
    A[key]=f"'ASSUMPTIONS'!$B${r}"; r+=1
wsA.column_dimensions["A"].width=34; wsA.column_dimensions["B"].width=16
wsA.cell(row=r+1,column=1,value="Yellow = input; green = calculated. Changing an input recalculates dependent sheets on open.").font=Font(italic=True,color="6B7B90",size=9)

# helper to write a USD + INR(formula) pair
def usd_inr_row(ws,row,label,usd_value_or_formula,src="",is_formula=False,startcol=1):
    ws.cell(row=row,column=startcol,value=label).alignment=WRAP
    uc=ws.cell(row=row,column=startcol+1);
    if is_formula: uc.value=usd_value_or_formula
    else: uc.value=usd_value_or_formula
    uc.number_format=MONEY; uc.border=BORDER
    ic=ws.cell(row=row,column=startcol+2,value=f"={get_column_letter(startcol+1)}{row}*{A['fx']}"); ic.number_format=MONEY; ic.border=BORDER; ic.fill=CALC_FILL
    if src: ws.cell(row=row,column=startcol+3,value=src)
    return uc

def sh(name): return wb.create_sheet(name)
FXN=f"{A['fx']}"

# 1 EXECUTIVE SUMMARY
ws=sh("EXECUTIVE SUMMARY")
r=titleblk(ws,"AI Revenue Recovery OS — Product Build & Investment Model","Provider + Payer platform · Azure · AI workforce  ·  "+DATE,
 "MODEL ASSUMPTIONS with sourced 2026 pricing. Not HIPAA-certified — HIPAA-aligned architecture + program. Quote-only prices marked 'Not publicly disclosed'. No PHI.")
kpis=[
 ("Total MVP investment (est.)",R["mvp_investment"]),
 ("12-month investment (est.)",R["inv_12mo"]),
 ("24-month investment (est.)",R["inv_24mo"]),
 ("Avg monthly burn — year 1",R["monthly_burn_12"]),
 ("Azure — MVP / month",R["azure"]["MVP"]),
 ("Azure — Medium production / month",R["azure"]["MEDIUM"]),
 ("Claude Max baseline / month (5 × 20x)",R["claude_baseline_mo"]),
 ("ChatGPT baseline / month (5 users)",R["chatgpt_baseline_mo"]),
 ("Production AI runtime — Medium / month",R["ai_rt"]["MEDIUM"]["total"]),
 ("All-in cost per worked claim",R["all_in_per_claim"]),
]
ws.cell(row=r,column=1,value="Headline").font=SFONT; ws.cell(row=r,column=2,value="USD").font=SFONT; ws.cell(row=r,column=3,value="INR").font=SFONT; r+=1
for lab,val in kpis:
    ws.cell(row=r,column=1,value=lab).alignment=WRAP
    uc=ws.cell(row=r,column=2,value=val); uc.number_format=(MONEY2 if val<10 else MONEY); uc.border=BORDER; uc.font=Font(bold=True)
    ic=ws.cell(row=r,column=3,value=f"=B{r}*{FXN}"); ic.number_format=(MONEY2 if val<10 else MONEY); ic.fill=CALC_FILL; ic.border=BORDER
    r+=1
ws.cell(row=r+1,column=1,value="Recommendation: build the common platform from day one; launch Provider/RCM first; add Payer (decision-support) after validation. Baseline team 5 FTE × Claude Max 20x; Azure Container Apps + PostgreSQL Flexible Server + private networking at production; HIPAA-aligned with SOC 2 on the roadmap.").alignment=WRAP
ws.merge_cells(start_row=r+1,start_column=1,end_row=r+1,end_column=6); ws.row_dimensions[r+1].height=44
ws.column_dimensions["A"].width=40; ws.column_dimensions["B"].width=16; ws.column_dimensions["C"].width=18

# 3 THREE PRODUCT MODELS
ws=sh("THREE PRODUCT MODELS"); s=titleblk(ws,"Three product models")
table(ws,s,["Model","Customer","Positioning","Regulatory posture"],
 [["A — Provider / RCM","Billing/RCM cos, hospitals, health systems, groups","Provider revenue automation across the RCM lifecycle","BAA; standard SaaS"],
  ["B — Payer","Insurers, health plans, MA orgs, Medicaid MCOs, TPAs","AI decision-support + workflow automation with payer governance","Model A/B; delegated funcs need legal review"],
  ["C — Provider + Payer","Long-term platform","Shared foundation with strict tenant isolation","Never mix tenant data; authorized cross-party only"]],
 widths=[20,34,44,34])

# 4-6 ARCHITECTURE text sheets
def arch_sheet(name,title,rows):
    ws=sh(name); s=titleblk(ws,title); table(ws,s,["Layer / Component","Description"],rows,widths=[30,72]); return ws
arch_sheet("PROVIDER ARCHITECTURE","Provider architecture",[
 ["Ingress","Front Door → WAF → APIM → Entra ID"],["Provider API","Eligibility, benefits, estimation, prior auth, claims, status, denials, appeals, recovery"],
 ["Orchestration","Right-channel engine: EDI → API → FHIR → Portal → Voice → Human"],["Data","PostgreSQL (RLS by tenant), Blob (claims/docs), Redis"],
 ["AI","AI Gateway + RAG (payer policies), denial/appeal intelligence"],["Connectivity","Clearinghouse APIs (Stedi/Optum/Availity), payer FHIR (2027)"]])
arch_sheet("PAYER ARCHITECTURE","Payer architecture (decision-support)",[
 ["Ingress","Same secured ingress; payer tenant isolation"],["Payer API","Claim intake, validation, adjudication decision-support, payment integrity, denial ops, appeals, provider comms"],
 ["Governance","AI recommendation → rules validation → human/payer approval → execution → audit"],["Guardrail","No final coverage/medical-necessity/payment decision by AI alone (CMS-4201-F; SB 1120)"],
 ["Data","Payer tenant DB / dedicated for enterprise; never visible to provider tenants"],["Intelligence","Payer Intelligence + coverage-policy RAG (NCD/LCD; license InterQual/MCG)"]])
arch_sheet("COMBINED ARCHITECTURE","Combined (provider + payer) architecture",[
 ["Tenancy","PLATFORM · PROVIDER · PAYER · RCM/BPO · ENTERPRISE; every record tenant_id/org_id/env_id"],
 ["Isolation","App + DB RLS (MVP) → schema/keys (V1) → dedicated DB/env (Enterprise)"],
 ["Cross-party","Authorized, purpose-limited, logged, encrypted, tenant-aware, contractual only"],
 ["Shared core","Orchestration, Payer Intelligence, audit, security — built once"],
 ["Separation","Provider data never auto-visible to payer, and vice versa"]])

# 7 TECHNOLOGY STACK
ws=sh("TECHNOLOGY STACK"); s=titleblk(ws,"Technology stack")
table(ws,s,["Layer","Technology"],[
 ["Cloud","Microsoft Azure (East US 2 primary)"],["Compute","Azure Container Apps (AKS only when justified)"],
 ["Data","PostgreSQL Flexible Server (RLS, HA, PITR)"],["Cache","Azure Cache for Redis / Managed Redis"],
 ["Messaging","Azure Service Bus"],["Storage","Azure Blob (private, encrypted, lifecycle)"],
 ["Search/RAG","Azure AI Search (vector)"],["Identity","Microsoft Entra ID (MFA, CA, PIM, Managed Identity)"],
 ["API","Azure API Management + Front Door + WAF"],["AI","AI Gateway → Azure OpenAI (PHI/BAA) · Anthropic · OpenAI"],
 ["Security","Key Vault/HSM, Private Link, Firewall, Defender, Sentinel, Monitor"],["CI/CD","GitHub + Actions; SAST/DAST/SCA/secret/container/IaC scanning"]],widths=[20,60])

# 8 AZURE ARCHITECTURE
ws=sh("AZURE ARCHITECTURE"); s=titleblk(ws,"Azure architecture — tiers",note="Do not over-engineer the MVP; add premium networking/security at production.")
table(ws,s,["Tier","Footprint"],[
 ["MVP","Container Apps · PostgreSQL Flex · Blob · Service Bus · Key Vault · Entra ID · App Insights · Monitor · WAF · (APIM)"],
 ["Production","+ HA · Private endpoints · Azure Firewall · Defender · Sentinel · advanced monitoring · DR · geo-redundancy · HSM (where justified)"],
 ["Large enterprise","+ Dedicated env/DB/keys/networking/logging · optional regional deployment"]],widths=[18,84])

# 9 AZURE COST (MVP line items with INR formula)
ws=sh("AZURE COST"); s=titleblk(ws,"Azure cost — MVP line items (USD + INR)",note="INR = USD × exchange rate (ASSUMPTIONS). Monthly figures are MODEL ASSUMPTIONS derived from unit rates.")
for j,h in enumerate(["Service","Tier","Monthly USD","Monthly INR","Annual USD","Source"],1): ws.cell(row=s,column=j,value=h)
hdr(ws,s,6); rr=s+1
for svc,tier,usd,src in CM.AZURE["MVP"]:
    ws.cell(row=rr,column=1,value=svc).border=BORDER; ws.cell(row=rr,column=2,value=tier).border=BORDER
    c=ws.cell(row=rr,column=3,value=usd); c.number_format=MONEY; c.border=BORDER
    ic=ws.cell(row=rr,column=4,value=f"=C{rr}*{FXN}"); ic.number_format=MONEY; ic.fill=CALC_FILL; ic.border=BORDER
    ac=ws.cell(row=rr,column=5,value=f"=C{rr}*12"); ac.number_format=MONEY; ac.border=BORDER
    ws.cell(row=rr,column=6,value=CM.CM_SOURCES[src][1]).font=Font(color="2E7FC2",underline="single",size=8)
    rr+=1
tc=ws.cell(row=rr,column=3,value=f"=SUM(C{s+1}:C{rr-1})"); tc.number_format=MONEY; tc.font=Font(bold=True)
ws.cell(row=rr,column=1,value="TOTAL (MVP / month)").font=Font(bold=True)
ws.cell(row=rr,column=4,value=f"=C{rr}*{FXN}").number_format=MONEY
for col,w in zip("ABCDEF",[30,26,14,16,14,42]): ws.column_dimensions[col].width=w

# 10 AZURE COST BY ENVIRONMENT (dev/test/staging/prod shares)
ws=sh("AZURE COST BY ENVIRONMENT"); s=titleblk(ws,"Azure cost by environment (share of production)")
env=[("DEV","10%",0.10),("TEST","10%",0.10),("STAGING","25%",0.25),("PRODUCTION","100%",1.0)]
for j,h in enumerate(["Environment","Sizing vs prod","Monthly USD (est.)","Monthly INR"],1): ws.cell(row=s,column=j,value=h)
hdr(ws,s,4); rr=s+1
for name,pct,f in env:
    ws.cell(row=rr,column=1,value=name).border=BORDER; ws.cell(row=rr,column=2,value=pct).border=BORDER
    c=ws.cell(row=rr,column=3,value=round(R["azure"]["MEDIUM"]*f)); c.number_format=MONEY; c.border=BORDER
    ws.cell(row=rr,column=4,value=f"=C{rr}*{FXN}").number_format=MONEY; rr+=1
for col,w in zip("ABCD",[16,16,18,18]): ws.column_dimensions[col].width=w

# 11 AZURE COST BY SCALE
ws=sh("AZURE COST BY SCALE"); s=titleblk(ws,"Azure monthly cost by scale (all line items)",note="Per-service monthly MODEL ASSUMPTIONS from unit rates; INR via exchange rate.")
for j,h in enumerate(["Scenario","Service","Tier","Monthly USD","Monthly INR"],1): ws.cell(row=s,column=j,value=h)
hdr(ws,s,5); rr=s+1
for scn in CM.SCENARIOS:
    for svc,tier,usd,src in CM.AZURE[scn]:
        ws.cell(row=rr,column=1,value=CM.SCENARIOS[scn]["label"]).border=BORDER
        ws.cell(row=rr,column=2,value=svc).border=BORDER; ws.cell(row=rr,column=3,value=tier).border=BORDER
        c=ws.cell(row=rr,column=4,value=usd); c.number_format=MONEY; c.border=BORDER
        ws.cell(row=rr,column=5,value=f"=D{rr}*{FXN}").number_format=MONEY; rr+=1
for col,w in zip("ABCDE",[18,28,26,14,16]): ws.column_dimensions[col].width=w

# 12 CLAUDE MAX COST (formula-driven)
ws=sh("CLAUDE MAX COST"); s=titleblk(ws,"Claude Max cost","Baseline: 5 users × Max 20x. NOT one subscription per AI agent.",
 note="Claude Code is included in Max (no separate subscription). Production API tokens are billed separately (see PRODUCTION AI COST).")
for j,h in enumerate(["Users","Plan","$/user/mo","Monthly USD","Annual USD","12-mo USD","24-mo USD"],1): ws.cell(row=s,column=j,value=h)
hdr(ws,s,7); rr=s+1
for users,plan,mo,an,y1,y2 in CM.claude_matrix():
    price=CM.CLAUDE_MAX_5X if "5x" in plan else CM.CLAUDE_MAX_20X
    ws.cell(row=rr,column=1,value=users).border=BORDER; ws.cell(row=rr,column=2,value=plan).border=BORDER
    ws.cell(row=rr,column=3,value=price).number_format=MONEY
    ws.cell(row=rr,column=4,value=f"=A{rr}*C{rr}").number_format=MONEY
    ws.cell(row=rr,column=5,value=f"=D{rr}*12").number_format=MONEY
    ws.cell(row=rr,column=6,value=f"=D{rr}*12").number_format=MONEY
    ws.cell(row=rr,column=7,value=f"=D{rr}*24").number_format=MONEY; rr+=1
ws.cell(row=rr+1,column=1,value="Baseline (from ASSUMPTIONS)").font=Font(bold=True)
ws.cell(row=rr+1,column=4,value=f"={A['cmax_u']}*{A['cmax']}").number_format=MONEY
for col,w in zip("ABCDEFG",[10,14,12,14,14,14,14]): ws.column_dimensions[col].width=w

# 13 CHATGPT COST
ws=sh("CHATGPT COST"); s=titleblk(ws,"ChatGPT cost","ChatGPT Business (formerly Team). Enterprise is quote-only.",
 note="A ChatGPT subscription is NOT production API credits (see PRODUCTION AI COST).")
for j,h in enumerate(["Users","Plan","$/user/mo","Monthly USD","Annual USD","12-mo USD","24-mo USD"],1): ws.cell(row=s,column=j,value=h)
hdr(ws,s,7); rr=s+1
for users,plan,mo,an,y1,y2 in CM.chatgpt_matrix():
    ws.cell(row=rr,column=1,value=users).border=BORDER; ws.cell(row=rr,column=2,value=plan).border=BORDER
    ws.cell(row=rr,column=3,value=CM.CGPT_BIZ_STD).number_format=MONEY
    ws.cell(row=rr,column=4,value=f"=A{rr}*C{rr}").number_format=MONEY
    ws.cell(row=rr,column=5,value=f"=D{rr}*12").number_format=MONEY
    ws.cell(row=rr,column=6,value=f"=D{rr}*12").number_format=MONEY
    ws.cell(row=rr,column=7,value=f"=D{rr}*24").number_format=MONEY; rr+=1
ws.cell(row=rr+1,column=1,value="ChatGPT Enterprise").font=Font(bold=True); ws.cell(row=rr+1,column=2,value="Not publicly disclosed (quote-only)")
for col,w in zip("ABCDEFG",[10,18,12,14,14,14,14]): ws.column_dimensions[col].width=w

# 14 PRODUCTION AI COST (formula: claims × per-claim)
ws=sh("PRODUCTION AI COST"); s=titleblk(ws,"Production AI runtime cost","Per-token / per-minute usage — separate from dev-tool subscriptions.",
 note="AI API token prices are 2026 MODEL ASSUMPTIONS (verify live). Azure OpenAI is the PHI path (covered by Microsoft BAA).")
for j,h in enumerate(["Scenario","Claims/mo","AI/claim","Voice/claim","Doc/claim","AI+Voice+Doc /mo USD","AI Search /mo","Total /mo USD","Total /mo INR"],1): ws.cell(row=s,column=j,value=h)
hdr(ws,s,9); rr=s+1
claim_ref={"MVP":A["claims_mvp"],"MEDIUM":A["claims_med"],"LARGE":A["claims_lg"]}
for scn in ["MVP","MEDIUM","LARGE"]:
    ws.cell(row=rr,column=1,value=CM.SCENARIOS[scn]["label"]).border=BORDER
    ws.cell(row=rr,column=2,value=f"={claim_ref[scn]}").number_format=MONEY
    ws.cell(row=rr,column=3,value=f"={A['ai_pc']}").number_format=MONEY2
    ws.cell(row=rr,column=4,value=f"={A['voice_pc']}").number_format=MONEY2
    ws.cell(row=rr,column=5,value=f"={A['doc_pc']}").number_format=MONEY2
    ws.cell(row=rr,column=6,value=f"=B{rr}*(C{rr}+D{rr}+E{rr})").number_format=MONEY
    ws.cell(row=rr,column=7,value=R["ai_rt"][scn]["search"]).number_format=MONEY
    ws.cell(row=rr,column=8,value=f"=F{rr}+G{rr}").number_format=MONEY
    ws.cell(row=rr,column=9,value=f"=H{rr}*{FXN}").number_format=MONEY; rr+=1
# token price reference
rr+=1; ws.cell(row=rr,column=1,value="AI token prices ($/1M) — MODEL ASSUMPTION").font=SFONT; rr+=1
ws.cell(row=rr,column=1,value="Model"); ws.cell(row=rr,column=2,value="Input"); ws.cell(row=rr,column=3,value="Output"); hdr(ws,rr,3); rr+=1
for m,(i,o) in CM.AI_PRICES.items():
    ws.cell(row=rr,column=1,value=m).border=BORDER; ws.cell(row=rr,column=2,value=i).number_format=MONEY2; ws.cell(row=rr,column=3,value=o).number_format=MONEY2; rr+=1
for col,w in zip("ABCDEFGHI",[18,12,10,10,10,20,12,16,16]): ws.column_dimensions[col].width=w

# 15 AI AGENT WORKFORCE
ws=sh("AI AGENT WORKFORCE"); s=titleblk(ws,"AI agent workforce (20 agents)","Operated by humans via AI tools — NOT one subscription per agent.")
agents=["Product Manager","Project Manager","Business Analyst","Healthcare RCM","Payer Research","Architecture","Backend Developer","Frontend Developer","AI Engineer","EDI","FHIR","Integration","Database","QA","Security","DevOps","FinOps","Documentation","Compliance Research","Test Data"]
table(ws,s,["#","AI Agent","Governance"],[[i+1,a,"Scoped tool/data/tenant/action permissions + audit; high-risk actions human-approved"] for i,a in enumerate(agents)],widths=[6,26,64])

# 16 HUMAN RESOURCES
ws=sh("HUMAN RESOURCES"); s=titleblk(ws,"Human resources — India salary bands (annual base USD)",note="Loaded cost = base × factor (ASSUMPTIONS). Ranges, not quotes. Sources: Glassdoor/6figr/Levels.")
for j,h in enumerate(["Role","Low USD","Mid USD","High USD","Loaded Mid USD","Loaded Mid INR"],1): ws.cell(row=s,column=j,value=h)
hdr(ws,s,6); rr=s+1
for role,(lo,mid,hi) in CM.SALARY.items():
    ws.cell(row=rr,column=1,value=role).border=BORDER
    ws.cell(row=rr,column=2,value=lo).number_format=MONEY; ws.cell(row=rr,column=3,value=mid).number_format=MONEY; ws.cell(row=rr,column=4,value=hi).number_format=MONEY
    ws.cell(row=rr,column=5,value=f"=C{rr}*{A['load']}").number_format=MONEY
    ws.cell(row=rr,column=6,value=f"=E{rr}*{FXN}").number_format=MONEY; rr+=1
for col,w in zip("ABCDEF",[32,12,12,12,16,18]): ws.column_dimensions[col].width=w

# 17 DEVELOPMENT COST
ws=sh("DEVELOPMENT COST"); s=titleblk(ws,"Development cost by team model (annual, loaded)")
for j,h in enumerate(["Team model","Roles","Low USD","Mid USD","High USD"],1): ws.cell(row=s,column=j,value=h)
hdr(ws,s,5); rr=s+1
for m in CM.TEAM_COMP:
    ws.cell(row=rr,column=1,value=m).border=BORDER; ws.cell(row=rr,column=2,value=len(CM.TEAM_COMP[m])).border=BORDER
    for k,band in enumerate(["low","mid","high"]): ws.cell(row=rr,column=3+k,value=R["team"][m][band]).number_format=MONEY
    rr+=1
ws.cell(row=rr+1,column=1,value=f"MVP build (Lean team × {CM.MVP_BUILD_MONTHS} mo)").font=Font(bold=True); ws.cell(row=rr+1,column=4,value=R["mvp_dev_cost"]).number_format=MONEY
ws.cell(row=rr+2,column=1,value=f"To production (Balanced × {CM.PROD_BUILD_MONTHS} mo)").font=Font(bold=True); ws.cell(row=rr+2,column=4,value=R["prod_dev_cost"]).number_format=MONEY
for col,w in zip("ABCDE",[24,10,14,14,14]): ws.column_dimensions[col].width=w

# 18 SECURITY COST
ws=sh("SECURITY COST"); s=titleblk(ws,"Security & compliance cost",note="Ranges from benchmarks (Secureframe/Drata/Bright Defense). Not quotes.")
table(ws,s,["Item","One-time Low","One-time High","Annual Low","Annual High","Category"],
 [[i[0],i[1] or "",i[2] or "",i[3] or "",i[4] or "",i[5]] for i in CM.SECURITY],
 widths=[38,14,14,12,12,18],money_cols=(2,3,4,5))

# 19 HIPAA / PHI COST
ws=sh("HIPAA _ PHI COST"); s=titleblk(ws,"HIPAA / PHI program cost",note="HIPAA is a program, not a certification. Azure BAA is included (Product Terms/DPA).")
table(ws,s,["Item","Low USD","High USD","Note"],
 [["HIPAA gap/risk assessment",5000,20000,"HHS SRA tool (DIY) → external engagement"],
  ["Policies / SOPs + training",4000,12000,"Training ~$85/employee/yr"],
  ["Technical safeguards (in Azure cost)","","","Encryption, Key Vault, private networking, audit"],
  ["Security testing / pen test",8000,25000,"Web + API"],
  ["Azure HIPAA BAA","0","0","Included via Microsoft Product Terms/DPA"],
  ["Incident response readiness",5000,20000,"Runbooks + retainer"]],
 widths=[32,12,12,46],money_cols=(2,3))

# 20 COMPLIANCE (roadmap)
ws=sh("COMPLIANCE"); s=titleblk(ws,"Compliance roadmap (SOC 2 / HITRUST)",note="Do not claim certification before achieved.")
table(ws,s,["Framework","Timing","Cost range","Effort","Business value"],[list(x) for x in CM.COMPLIANCE_ROADMAP],widths=[18,18,18,40,34])

# 21 MILESTONES
ws=sh("MILESTONES"); s=titleblk(ws,"Milestones M0–M12 (realistic weeks)")
mrows=[["M0","Discovery",2,"—","Requirements, payer/API/security research"],
 ["M1","Architecture + Security foundation",3,"M0","Azure, Entra, networking, tenant model, CI/CD"],
 ["M2","Multi-tenant core",4,"M1","Tenants, RBAC, orgs, users, audit, admin"],
 ["M3","Eligibility + Benefits",4,"M2","270/271, integration framework, payer config"],
 ["M4","Claim Status",3,"M3","276/277, timeline, status agent"],
 ["M5","Prior Authorization",4,"M3","278/FHIR, PA workflow, document workflow"],
 ["M6","Denial Intelligence",4,"M4","835/CARC/RARC, analysis, recovery"],
 ["M7","Appeals",3,"M6","Draft, human approval, tracking"],
 ["M8","Payer Intelligence",4,"M3-M7","Payer DB, RAG, recommendation engine"],
 ["M9","AI Workforce",3,"M8","Agent orchestration, registry, audit"],
 ["M10","Security / HIPAA hardening",4,"M1-M9","Risk assessment, pen test, PHI controls"],
 ["M11","Pilot",4,"M10","Design partner, approved data, metrics"],
 ["M12","Production readiness",4,"M11","HA, DR, monitoring, runbooks, release"]]
table(ws,s,["#","Milestone","Weeks","Depends on","Key deliverables"],mrows,widths=[6,30,8,12,50])
ws.cell(row=s+len(mrows)+2,column=1,value="Aggressive ≈ 0.8× · Realistic = 1.0× (~46 wk) · Conservative ≈ 1.3×").font=Font(italic=True,color="6B7B90",size=9)

# 22 PROJECT PLAN
ws=sh("PROJECT PLAN"); s=titleblk(ws,"Project plan summary")
table(ws,s,["Area","Approach"],[
 ["PM platform","GitHub Projects (recommended) → Linear/Jira as team scales"],
 ["Workflow","Requirement → AI PM → story → AI architect → AI dev → AI QA/Security → PR → human review → CI/CD → staging → human approval → prod"],
 ["Git","main (protected), develop, feature/*, bugfix/*, security/*; mandatory PR + scans"],
 ["Team","Lean 5 → Balanced 8 → Production 12–15; 5 × Claude Max 20x baseline"],
 ["AI productivity","+10/20/30/40% scenarios; plan on +30%"],
 ["Timeline","MVP ~M8–M9 (~32 wk), pilot ~M11 (~40 wk), production ~M12 (~46 wk) realistic"]],widths=[18,84])

# 23 CLOUD COST (summary of Azure+AI+voice+clearinghouse per scenario)
ws=sh("CLOUD COST"); s=titleblk(ws,"Cloud + runtime cost summary by scenario (monthly USD)")
for j,h in enumerate(["Scenario","Azure","AI runtime","Clearinghouse","Total /mo","Total /mo INR"],1): ws.cell(row=s,column=j,value=h)
hdr(ws,s,6); rr=s+1
for scn in CM.SCENARIOS:
    ws.cell(row=rr,column=1,value=CM.SCENARIOS[scn]["label"]).border=BORDER
    ws.cell(row=rr,column=2,value=R["azure"][scn]).number_format=MONEY
    ws.cell(row=rr,column=3,value=R["ai_rt"][scn]["total"]).number_format=MONEY
    ws.cell(row=rr,column=4,value=R["clearinghouse"][scn]).number_format=MONEY
    ws.cell(row=rr,column=5,value=f"=B{rr}+C{rr}+D{rr}").number_format=MONEY
    ws.cell(row=rr,column=6,value=f"=E{rr}*{FXN}").number_format=MONEY; rr+=1
for col,w in zip("ABCDEF",[20,14,14,16,14,16]): ws.column_dimensions[col].width=w

# 24 UNIT ECONOMICS
ws=sh("UNIT ECONOMICS"); s=titleblk(ws,"Unit economics (cost per action)",note="AI + channel cost. Clearinghouse per transaction is a MODEL ASSUMPTION (Stedi free tier covers MVP).")
ue=[["Eligibility check",0.005,0.12,"Haiku parse + 270/271 txn"],
 ["Benefit verification",0.006,0.12,"271 parse + txn"],
 ["Claim status",0.005,0.12,"276/277 txn"],
 ["Prior authorization",0.05,0.12,"reasoning + 278/portal"],
 ["Denial analysis",0.10,0.0,"Opus root-cause (835 already received)"],
 ["Appeal draft",0.15,0.0,"Opus draft + human review"],
 ["AI agent action (generic)",0.02,0.0,"orchestration step"]]
for j,h in enumerate(["Action","AI cost USD","Channel cost USD","Total USD","Note"],1): ws.cell(row=s,column=j,value=h)
hdr(ws,s,5); rr=s+1
for name,ai,ch,note in ue:
    ws.cell(row=rr,column=1,value=name).border=BORDER
    ws.cell(row=rr,column=2,value=ai).number_format=MONEY2; ws.cell(row=rr,column=3,value=ch).number_format=MONEY2
    ws.cell(row=rr,column=4,value=f"=B{rr}+C{rr}").number_format=MONEY2; ws.cell(row=rr,column=5,value=note)
    rr+=1
ws.cell(row=rr+1,column=1,value="All-in cost per worked claim (blended)").font=Font(bold=True)
ws.cell(row=rr+1,column=4,value=R["all_in_per_claim"]).number_format=MONEY2
for col,w in zip("ABCDE",[28,14,16,12,44]): ws.column_dimensions[col].width=w

# 25-27 MVP / PILOT / PRODUCTION COST
def phase_sheet(name,title,parts,total):
    ws=sh(name); s=titleblk(ws,title)
    for j,h in enumerate(["Line item","USD","INR"],1): ws.cell(row=s,column=j,value=h)
    hdr(ws,s,3); rr=s+1
    for lab,val in parts:
        ws.cell(row=rr,column=1,value=lab).border=BORDER
        ws.cell(row=rr,column=2,value=val).number_format=MONEY
        ws.cell(row=rr,column=3,value=f"=B{rr}*{FXN}").number_format=MONEY; rr+=1
    ws.cell(row=rr,column=1,value="TOTAL").font=Font(bold=True)
    tc=ws.cell(row=rr,column=2,value=f"=SUM(B{s+1}:B{rr-1})"); tc.number_format=MONEY; tc.font=Font(bold=True)
    ws.cell(row=rr,column=3,value=f"=B{rr}*{FXN}").number_format=MONEY
    for col,w in zip("ABC",[34,16,18]): ws.column_dimensions[col].width=w
    return ws
p=R["mvp_investment_parts"]
phase_sheet("MVP COST","MVP investment (one-time, ~8 months)",
 [("Development (lean team)",p["dev"]),("Azure (build ramp)",p["azure"]),("AI dev subscriptions",p["ai_subs"]),
  ("AI API (pilot volume)",p["ai_api"]),("Security / HIPAA (one-time)",p["security"]),("Clearinghouse setup",p["clearinghouse"]),
  ("Legal (BAA/contracts)",p["legal"]),("Testing",p["testing"]),("Contingency (15%)",p["contingency"])],R["mvp_investment"])
phase_sheet("PILOT COST","Pilot phase (incremental)",
 [("Design-partner enablement",20000),("Azure (MVP tier × 3 mo)",R["azure"]["MVP"]*3),("AI runtime (pilot × 3 mo)",R["ai_rt"]["MVP"]["total"]*3),
  ("Security monitoring",15000),("Support",10000)],0)
phase_sheet("PRODUCTION COST","Production readiness (incremental)",
 [("Development to production",R["prod_dev_cost"]-R["mvp_dev_cost"]),("Azure (Medium × 6 mo)",R["azure"]["MEDIUM"]*6),
  ("AI runtime (Medium × 6 mo)",R["ai_rt"]["MEDIUM"]["total"]*6),("SOC 2 Type II",50000),("Pen test (annual)",18000),("DR + monitoring",20000)],0)

# 28-29 BUDGETS
def budget_sheet(name,title,total,parts):
    ws=sh(name); s=titleblk(ws,title)
    for j,h in enumerate(["Category","USD","INR"],1): ws.cell(row=s,column=j,value=h)
    hdr(ws,s,3); rr=s+1
    for lab,val in parts:
        ws.cell(row=rr,column=1,value=lab).border=BORDER; ws.cell(row=rr,column=2,value=val).number_format=MONEY
        ws.cell(row=rr,column=3,value=f"=B{rr}*{FXN}").number_format=MONEY; rr+=1
    ws.cell(row=rr,column=1,value="TOTAL (incl. contingency)").font=Font(bold=True)
    ws.cell(row=rr,column=2,value=total).number_format=MONEY; ws.cell(row=rr,column=2).font=Font(bold=True)
    ws.cell(row=rr,column=3,value=f"=B{rr}*{FXN}").number_format=MONEY
    for col,w in zip("ABC",[34,16,18]): ws.column_dimensions[col].width=w
budget_sheet("12 MONTH BUDGET","12-month budget",R["inv_12mo"],
 [("Team (Balanced 8, loaded)",R["team"]["Balanced MVP (8)"]["mid"]),("Azure (MVP→Medium)",R["azure"]["MVP"]*6+R["azure"]["MEDIUM"]*6),
  ("AI runtime",R["ai_rt"]["MVP"]["total"]*6+R["ai_rt"]["MEDIUM"]["total"]*6),("AI dev subscriptions",(R["claude_baseline_mo"]+R["chatgpt_baseline_mo"])*12),
  ("Security + SOC2 Type I",R["sec_mvp_onetime"]+R["sec_mvp_annual"]+30000),("Legal + testing + clearinghouse",45000)])
budget_sheet("24 MONTH BUDGET","24-month budget",R["inv_24mo"],
 [("Team (scale to production)",R["team"]["Balanced MVP (8)"]["mid"]+R["team"]["Production (13)"]["mid"]),
  ("Azure (Medium × 24 mo)",R["azure"]["MEDIUM"]*24),("AI runtime (Medium × 24 mo)",R["ai_rt"]["MEDIUM"]["total"]*24),
  ("AI dev subscriptions × 24 mo",(R["claude_baseline_mo"]+R["chatgpt_baseline_mo"])*24),("Security + SOC2 Type II",162000),("Legal + testing × 2",90000)])

# 30-32 COMMERCIAL MODELS
def comm_sheet(name,title,rows):
    ws=sh(name); s=titleblk(ws,title,note="Illustrative gross-margin structure; validate with pricing pilots.")
    table(ws,s,["Cost component","Nature"],rows,widths=[34,52]); return ws
comm_sheet("PROVIDER MODEL","Provider-only commercial model",[
 ["Infrastructure (Azure)","Variable with claims volume"],["AI runtime","Variable per claim"],["Security/compliance","Fixed + annual"],
 ["Clearinghouse/integration","Variable (per txn) — Stedi free tier for MVP"],["Support","Semi-fixed"],["Gross margin","Target 70–80% at scale (SaaS + usage)"]])
comm_sheet("PAYER MODEL","Payer-only commercial model",[
 ["Infrastructure","Fixed + variable"],["Security/compliance","Higher (payer trust, delegation)"],["Integration","Enterprise, per-payer"],
 ["AI runtime","Variable"],["Human oversight","Required for regulated functions"],["Gross margin","Target 60–75% (enterprise, longer cycles)"]])
comm_sheet("COMBINED MODEL","Combined provider + payer model",[
 ["Shared platform","One codebase, amortized build"],["Tenant isolation","Adds engineering + possibly dedicated infra (enterprise)"],
 ["Integration","Both sides"],["Compliance","Highest (both parties)"],["Gross margin","Blended 65–78%; strongest LTV via cross-side data network effects (governed)"]])

# 33 BUILD BUY PARTNER
ws=sh("BUILD BUY PARTNER"); s=titleblk(ws,"Build / Buy / Partner")
table(ws,s,["Capability","Decision","Rationale"],[
 ["Payer connectivity (EDI/API)","BUY/PARTNER","Clearinghouse (Stedi/Optum/Availity)"],
 ["Denial/appeal/estimation intelligence","BUILD","Proprietary value"],
 ["Payer Intelligence + Orchestration","BUILD","The moat"],["AI voice","BUY/INTEGRATE","Voice provider under BAA"],
 ["Cloud/security primitives","BUY","Azure managed services"],["Coverage criteria (InterQual/MCG)","PARTNER/LICENSE","License-gated"],
 ["Payer-side adjudication","PARTNER/REGULATED","Decision-support only; legal review"]],widths=[34,20,48])

# 34 RISKS
ws=sh("RISKS"); s=titleblk(ws,"Risks")
table(ws,s,["Risk","Mitigation"],[
 ["Clearinghouse per-txn pricing opacity","Capture Stedi cents; start on free tier; multi-vendor"],
 ["AI decision-limit regulation (CMS-4201-F, SB 1120)","Human-in-the-loop; AI decision-support only"],
 ["PHI/security incident","Zero Trust, encryption, private networking, SIEM, IR readiness"],
 ["Tenant data leakage","RLS + app authz + isolation testing"],
 ["Payer onboarding delays","Clearinghouse reach; portal/voice fallback"],
 ["AI cost overrun","Model routing, caching, batch; per-claim budget guardrails"],
 ["Talent/timeline","AI productivity uplift; realistic plan; contingency 15%"],
 ["Compliance cost","Phase SOC2 → HITRUST; tooling automation"]],widths=[40,60])

# 35 SECURITY CONTROLS
ws=sh("SECURITY CONTROLS"); s=titleblk(ws,"Security controls")
table(ws,s,["Domain","Controls"],[
 ["Identity","Entra ID, MFA, Conditional Access, PIM/JIT, Managed Identity"],
 ["Network","Hub-spoke, Private Link/Endpoints, Firewall, WAF, DDoS, no public DB"],
 ["Data","TLS 1.2+, AES-256 at rest, Key Vault/CMK, HSM (where justified), RLS"],
 ["AI","AI Gateway: PHI detection → policy → redaction → approved model → validation → audit"],
 ["Monitoring","Defender for Cloud, Sentinel SIEM, Monitor/App Insights, immutable audit"],
 ["SDLC","SAST/DAST/SCA/secret/container/IaC scanning; protected main; PR review"],
 ["Governance","Least privilege (humans + AI agents); high-risk actions human-approved"]],widths=[18,84])

# 36 PHI DATA FLOW
ws=sh("PHI DATA FLOW"); s=titleblk(ws,"PHI data flow (AI Gateway)",note="Dev uses synthetic/de-identified data only. Production PHI via approved services under BAA.")
table(ws,s,["Step","Action"],[
 ["1 Ingress","Authenticated request (Entra) over TLS"],["2 PHI detection","Classify & detect PHI in payload"],
 ["3 Policy engine","Apply tenant + PHI policy; decide model + redaction"],["4 Redaction/tokenization","Where appropriate before model call"],
 ["5 Approved model","Azure OpenAI (BAA) for PHI path; provider-agnostic gateway"],["6 Response validation","Validate output; confidence scoring"],
 ["7 Audit","Immutable log: input refs, decision, model, confidence, approver"]],widths=[18,72])

# 37 DR_BCP
ws=sh("DR_BCP"); s=titleblk(ws,"Disaster recovery & business continuity")
table(ws,s,["Tier","RPO","RTO","Measures"],[
 ["MVP","≤ 24h","≤ 8h","Backups, PITR"],["Production","≤ 1h","≤ 4h","Geo-redundancy, failover, DR testing"],
 ["Enterprise","≤ 15m","≤ 1h","Active-passive multi-region, ransomware recovery"]],widths=[16,10,10,54])
table(ws,s+5,["Continuity scenario","Response"],[
 ["AI provider outage","Fallback: primary → secondary model → rules → human"],
 ["Clearinghouse/payer API outage","Alternate channel; queue & retry; portal/voice"],
 ["Azure/DB outage","Failover, restore from PITR/geo-backup"],
 ["Cyberattack/ransomware","IR plan, isolation, immutable backups, restore"]],widths=[30,66])

# 38 AI GOVERNANCE
ws=sh("AI GOVERNANCE"); s=titleblk(ws,"AI agent governance",note="Agents are privileged software identities, not employees.")
table(ws,s,["Control","Detail"],[
 ["Agent identity","Each agent has an identity + scoped permissions"],
 ["Permissions","Tool / data / tenant / action — least privilege"],
 ["No unrestricted access","No prod DB, prod deploy, or PHI without controls"],
 ["Human approval gates","Prod deploy, DB/IAM/security/PHI changes, deletions, and any adjudication/medical-necessity/coverage/financial decision"],
 ["Audit","Every agent action logged (input, decision, reason, confidence, channel, approver)"]],widths=[24,78])

# 39 SOURCES
ws=sh("SOURCES"); s=titleblk(ws,"Sources & evidence",note="Prices are 2026 researched figures; verify live before board commitment. Quote-only items not invented.")
table(ws,s,["Item","URL","Confidence"],[[v[0],v[1],v[2]] for v in CM.CM_SOURCES.values()],widths=[46,66,14],link_col=2)

# reorder: EXECUTIVE SUMMARY first, ASSUMPTIONS second
order=["EXECUTIVE SUMMARY","ASSUMPTIONS"]+[n for n in wb.sheetnames if n not in ("EXECUTIVE SUMMARY","ASSUMPTIONS")]
wb._sheets.sort(key=lambda x: order.index(x.title))
wb.save(XLSX); print("XLSX sheets:",len(wb.sheetnames))

# ======================================================================
# PDF
# ======================================================================
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors as rc
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    Image, PageBreak, HRFlowable, NextPageTemplate)
from reportlab.platypus.tableofcontents import TableOfContents
from PIL import Image as PImage

PDF=os.path.join(OUT,"AI_Revenue_Recovery_OS_Product_Build_and_Investment_Report.pdf")
CW=6.9*inch
rNAVY=rc.HexColor("#0C1B30"); rNAVY2=rc.HexColor("#13253F"); rTEAL=rc.HexColor("#118C7E"); rCYAN=rc.HexColor("#2E7FC2")
rMUT=rc.HexColor("#6B7B90"); rLINE=rc.HexColor("#D5DEE8"); rINK=rc.HexColor("#1a2433"); rGRN=rc.HexColor("#2E9E6B"); rRED=rc.HexColor("#B23C2B")
ss=getSampleStyleSheet()
def PS(n,**k): return ParagraphStyle(n,parent=k.pop("parent",ss["Normal"]),**k)
BODY=PS("b",fontName="Helvetica",fontSize=9.5,leading=14,textColor=rINK,alignment=TA_JUSTIFY,spaceAfter=7)
BODYL=PS("bl",parent=BODY,alignment=TA_LEFT)
H1=PS("h1",fontName="Helvetica-Bold",fontSize=16,leading=20,textColor=rNAVY,spaceBefore=6,spaceAfter=9)
H2=PS("h2",fontName="Helvetica-Bold",fontSize=12,leading=15,textColor=rTEAL,spaceBefore=10,spaceAfter=5)
EY=PS("ey",fontName="Helvetica-Bold",fontSize=8,leading=11,textColor=rMUT,spaceAfter=2)
SMALL=PS("sm",fontName="Helvetica",fontSize=8,leading=11,textColor=rMUT,spaceAfter=4)
CELL=PS("c",fontName="Helvetica",fontSize=7.6,leading=9.6,textColor=rINK); CELLH=PS("ch",fontName="Helvetica-Bold",fontSize=7.6,leading=9.6,textColor=rc.white)
BULL=PS("bu",parent=BODYL,leftIndent=12,spaceAfter=4)
def h1(t): p=Paragraph(t,H1); p.toc_level=0; return p
def h2(t): p=Paragraph(t,H2); p.toc_level=1; return p
def para(t,s=BODY): return Paragraph(t,s)
def bullets(items): return [Paragraph("• "+t,BULL) for t in items]
def chart(key,w=CW,cap=None):
    ip=CH[key]; iw,ih=PImage.open(ip).size; fl=[Image(ip,width=w,height=w*ih/iw)]
    if cap: fl.append(Paragraph(cap,SMALL))
    fl.append(Spacer(1,6)); return fl
def vtable(headers,rows,colw,fs=7.6,left_cols=None):
    left_cols=left_cols or tuple(range(len(headers)))
    data=[[Paragraph(str(x),CELLH) for x in headers]]
    for rw in rows: data.append([Paragraph(str(v),CELL) for v in rw])
    t=Table(data,colWidths=colw,repeatRows=1)
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),rNAVY),("GRID",(0,0),(-1,-1),0.4,rLINE),("VALIGN",(0,0),(-1,-1),"MIDDLE"),
     ("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3),("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4),
     ("ROWBACKGROUNDS",(0,1),(-1,-1),[rc.white,rc.HexColor("#F7FAFC")])]))
    return t
def callout(title,text,color=rTEAL):
    tb=Table([[Paragraph(f'<b>{title}</b>',PS("ct",fontName="Helvetica-Bold",fontSize=9,textColor=color,leading=12))],
              [Paragraph(text,PS("cx",fontName="Helvetica",fontSize=8.8,textColor=rINK,leading=12.5))]],colWidths=[CW])
    tb.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),rc.HexColor("#F4F8FB")),("BOX",(0,0),(-1,-1),0.6,color),
     ("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7),("LINEBEFORE",(0,0),(0,-1),2.5,color)]))
    return tb
class Doc(BaseDocTemplate):
    def afterFlowable(self,f):
        if hasattr(f,"toc_level"): self.notify("TOCEntry",(f.toc_level,f.getPlainText(),self.page))
def _dec(cv,doc):
    cv.saveState(); cv.setStrokeColor(rLINE); cv.setLineWidth(0.5); cv.line(0.8*inch,10.35*inch,7.7*inch,10.35*inch)
    cv.setFont("Helvetica-Bold",7.5); cv.setFillColor(rTEAL); cv.drawString(0.8*inch,10.45*inch,"AI REVENUE RECOVERY OS")
    cv.setFont("Helvetica",7.5); cv.setFillColor(rMUT); cv.drawRightString(7.7*inch,10.45*inch,"Product Build & Investment  ·  Confidential")
    cv.line(0.8*inch,0.62*inch,7.7*inch,0.62*inch); cv.drawString(0.8*inch,0.45*inch,"Prepared for AI Revenue Recovery OS  ·  "+DATE)
    cv.drawRightString(7.7*inch,0.45*inch,"Page %d"%doc.page); cv.restoreState()
frame=Frame(0.8*inch,0.75*inch,6.9*inch,9.5*inch,id="m")
doc=Doc(PDF,pagesize=letter,leftMargin=0.8*inch,rightMargin=0.8*inch,topMargin=0.95*inch,bottomMargin=0.85*inch,
    title="AI Revenue Recovery OS — Product Build & Investment Report",author="AI Revenue Recovery OS")
doc.addPageTemplates([PageTemplate(id="cover",frames=[frame]),PageTemplate(id="body",frames=[frame],onPage=_dec)])
st=[]
# COVER
st+=[Spacer(1,1.1*inch)]
st.append(Paragraph("Product Build &amp;<br/>Investment Report",PS("tt",fontName="Helvetica-Bold",fontSize=30,leading=36,textColor=rNAVY)))
st.append(Spacer(1,8)); st.append(Paragraph("AI Revenue Recovery OS — Technology · Security · Cost · AI Workforce",PS("s2",fontName="Helvetica",fontSize=13,textColor=rTEAL)))
st.append(Spacer(1,10)); st.append(HRFlowable(width=CW,thickness=2,color=rTEAL,spaceAfter=12))
st.append(Paragraph("“Predict. Prevent. Work. Resolve. Recover.”  —  an AI orchestration &amp; intelligence layer for healthcare revenue.",PS("st",fontName="Helvetica",fontSize=10.5,leading=15,textColor=rMUT)))
st.append(Spacer(1,34))
meta=Table([[Paragraph("PREPARED FOR",EY),Paragraph("<b>AI Revenue Recovery OS</b>",BODYL)],
 [Paragraph("DATE",EY),Paragraph(DATE,BODYL)],
 [Paragraph("MVP INVESTMENT (est.)",EY),Paragraph(f"<b>{money(R['mvp_investment'])}</b> (Rs {round(R['mvp_investment']*CM.FX_DEFAULT/1e7,2)} Cr)",BODYL)],
 [Paragraph("12 / 24-MONTH (est.)",EY),Paragraph(f"{money(R['inv_12mo'])} / {money(R['inv_24mo'])}",BODYL)],
 [Paragraph("CLASSIFICATION",EY),Paragraph("Confidential · Investor & engineering · MODEL ASSUMPTIONS",BODYL)]],colWidths=[1.7*inch,5.2*inch])
meta.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),("LINEBELOW",(0,0),(-1,-2),0.4,rLINE)]))
st.append(meta); st.append(Spacer(1,30))
st.append(callout("Disclosures",
 "Prices are researched 2026 figures with sources; usage-derived monthly figures are labeled MODEL ASSUMPTION and are configurable in the workbook. Quote-only prices (ChatGPT Enterprise, some Azure dedicated capacity) are recorded 'Not publicly disclosed' — never invented. “HIPAA-aligned architecture / HIPAA program” — never “HIPAA certified”; Azure BAA availability does not by itself make the application compliant. Development uses synthetic/de-identified data only. Payer-side is AI decision-support with human/payer governance. No PHI."))
st.append(NextPageTemplate("body")); st.append(PageBreak())
st.append(Paragraph("Contents",H1)); toc=TableOfContents()
toc.levelStyles=[PS("t0",fontName="Helvetica-Bold",fontSize=10,leading=16,textColor=rNAVY),PS("t1",fontName="Helvetica",fontSize=9,leading=13,textColor=rINK,leftIndent=14)]
st.append(toc); st.append(PageBreak())
def sec(t): st.append(h1(t))
def sub(t): st.append(h2(t))

# 1 EXEC SUMMARY
sec("1. Executive Summary")
st.append(para(f"AI Revenue Recovery OS is an AI-native orchestration and intelligence layer for U.S. healthcare revenue, spanning provider/RCM and (later) payer workflows across EDI → API → FHIR → payer portal → AI voice → human. This report models the technology, security, team and cost to build it — MVP through 24 months — on Microsoft Azure with an AI-augmented engineering organization.",BODYL))
st+=chart("invest",cap="Figure 1. Estimated total investment: MVP, 12-month and 24-month (MODEL ASSUMPTION).")
st.append(vtable(["Headline","USD","INR (Rs , FX 90)"],
 [["MVP investment",money(R["mvp_investment"]),f"Rs {R['mvp_investment']*90:,.0f}"],
  ["12-month investment",money(R["inv_12mo"]),f"Rs {R['inv_12mo']*90:,.0f}"],
  ["24-month investment",money(R["inv_24mo"]),f"Rs {R['inv_24mo']*90:,.0f}"],
  ["Avg monthly burn (yr 1)",money(R["monthly_burn_12"]),f"Rs {R['monthly_burn_12']*90:,.0f}"],
  ["Azure — MVP / month",money(R["azure"]["MVP"]),f"Rs {R['azure']['MVP']*90:,.0f}"],
  ["Claude Max baseline / month (5×20x)",money(R["claude_baseline_mo"]),f"Rs {R['claude_baseline_mo']*90:,.0f}"],
  ["All-in cost per worked claim",f"${R['all_in_per_claim']:.2f}",f"Rs {R['all_in_per_claim']*90:.0f}"]],
 [2.9*inch,2.0*inch,2.0*inch],left_cols=(0,1,2)))
st.append(callout("Recommendation",
 "Build the common platform from day one; <b>launch Provider/RCM first</b>; add Payer (decision-support) after validation. Baseline team of <b>5 FTE × Claude Max 20x</b>; Azure Container Apps + PostgreSQL Flexible Server for the MVP, private networking + Defender/Sentinel at production; HIPAA-aligned with SOC 2 on the roadmap. Do not over-engineer the MVP."))
st.append(PageBreak())

# 2 PRODUCT VISION + models
sec("2. Product Vision & Models")
st.append(para("The platform determines what needs to happen, why, through which channel, whether it can be solved digitally, and — only when digital fails — whether a portal, AI voice or human should act; then captures the outcome and the revenue protected or recovered. It is positioned as an orchestration and intelligence layer, not a chatbot, caller, billing app or dashboard.",BODYL))
st.append(vtable(["Model","Customer","Positioning"],
 [["A — Provider / RCM","Billing/RCM, hospitals, health systems, groups","Provider revenue automation across the RCM lifecycle"],
  ["B — Payer","Insurers, health plans, MA orgs, Medicaid MCOs, TPAs","AI decision-support + workflow automation with governance"],
  ["C — Provider + Payer","Long-term","Shared foundation; strict tenant isolation"]],[1.5*inch,2.7*inch,2.7*inch]))
st.append(callout("Payer-side guardrail",
 "Final coverage / medical-necessity / payment / adjudication decisions remain with the payer's qualified personnel. AI cannot be the sole basis for a medical-necessity decision (CMS-4201-F; California SB 1120). Delegated payer operations require separate regulatory/legal review.",color=rRED))
st.append(PageBreak())

# 3 FUNCTIONAL SCOPE
sec("3. Functional Scope")
st+=bullets(["<b>Provider:</b> Eligibility · Benefits · Patient Responsibility Estimation · Prior Auth · Claims · Claim Status · Denial Intelligence · Appeals · Revenue Recovery · Payer Intelligence.",
 "<b>Payer:</b> Claim Intake · Validation · Eligibility/Benefit Validation · Adjudication Decision-Support · Payment Integrity · Denial Ops · Appeal Admin · Provider Communication · Payer Intelligence · Analytics.",
 "<b>Platform:</b> AI Workforce · Human Exception Center · Analytics · Audit · Security · Administration.",
 "<b>Standards:</b> X12 270/271, 276/277, 277CA, 278, 837P/I/D, 835, 999, TA1, 275; FHIR R4 (Coverage, Claim, ClaimResponse, EOB, CoverageEligibility*, Task, DocumentReference, Questionnaire); HL7 Da Vinci; CMS interoperability (CMS-0057-F FHIR APIs by 2027 for CMS-regulated payers)."])
st.append(PageBreak())

# 4 TECH STACK + ARCHITECTURE
sec("4. Technology Stack & Architecture")
st.append(para("Microsoft Azure is the primary cloud. The MVP is deliberately lean; premium networking and security are added at production.",BODYL))
st+=chart("arch",cap="Figure 2. Conceptual architecture — secured ingress, provider/payer/admin APIs, AI orchestration (rules + agents + RAG), workflow engine, tenant-isolated data, and a full security plane.")
st.append(vtable(["Layer","Technology"],
 [["Compute","Azure Container Apps (AKS when justified)"],["Data","PostgreSQL Flexible Server (RLS, HA, PITR); Redis"],
  ["Messaging/Storage","Service Bus; Blob (private, encrypted)"],["AI","AI Gateway → Azure OpenAI (PHI/BAA) · Anthropic · OpenAI; Azure AI Search (RAG)"],
  ["Edge/API","Front Door + WAF + API Management; Entra ID"],["Security","Key Vault/HSM, Private Link, Firewall, Defender, Sentinel, Monitor"]],[1.6*inch,5.3*inch]))
st.append(PageBreak())

# 5 MULTI-TENANT
sec("5. Multi-Tenant Architecture")
st.append(para("Tenant types: PLATFORM · PROVIDER · PAYER · RCM/BPO · ENTERPRISE. Every record carries tenant_id, organization_id, environment_id. Provider and payer data never automatically cross; any permitted exchange is authorized, purpose-limited, logged, encrypted and tenant-aware.",BODYL))
st.append(vtable(["Stage","Isolation model"],
 [["MVP","Shared DB + Row-Level Security + app authorization + RBAC + encryption + audit"],
  ["V1","+ schema separation for large tenants; ABAC; per-tenant keys where justified"],
  ["Enterprise","Database-per-tenant / dedicated environment, keys, networking, logging; optional regional deployment"]],[1.3*inch,5.6*inch]))
st.append(PageBreak())

# 6 AI ARCHITECTURE + agents
sec("6. AI Architecture & Agent Workforce")
st.append(para("A provider-agnostic AI Gateway routes by task, cost, latency, reasoning need, PHI policy and confidence: small/fast models for classification/extraction, strong models for reasoning/appeals/exceptions, with a fallback chain of primary → secondary → rules → human. A secure, tenant-filtered RAG pipeline grounds answers in payer/CMS/medical policies with citations and confidence.",BODYL))
st.append(para("Twenty specialized AI agents (Product/Project Manager, Business Analyst, Healthcare RCM, Payer Research, Architecture, Backend/Frontend/AI Dev, EDI, FHIR, Integration, Database, QA, Security, DevOps, FinOps, Documentation, Compliance Research, Test Data) are operated by the human team through AI tools — <b>not</b> one paid subscription per agent. Each agent has scoped tool/data/tenant/action permissions and full audit; high-risk actions require human approval.",BODYL))
st.append(callout("PHI AI security","AI Gateway: PHI detection → policy engine → redaction/tokenization → approved model (Azure OpenAI under BAA for the PHI path) → response validation → audit. Development uses synthetic/de-identified data only; developer AI tools (Claude Max, ChatGPT) are never production PHI infrastructure."))
st.append(PageBreak())

# 7 SECURITY & HIPAA
sec("7. Security, HIPAA & Compliance")
st.append(para("Zero-Trust, least-privilege, defense-in-depth. Entra ID (MFA/CA/PIM/JIT), Key Vault/CMK/HSM, Private Link, Firewall, WAF, DDoS, Defender for Cloud, Sentinel SIEM, immutable audit, encrypted backup + DR. HIPAA is an ongoing program (risk assessment, policies/SOPs, safeguards, training, evidence) — the Azure BAA is included via Microsoft Product Terms/DPA but does not by itself confer compliance.",BODYL))
st+=chart("security",cap="Figure 3. Security & compliance cost items (benchmark ranges → mid).")
st.append(vtable(["Framework","Timing","Cost range","Business value"],[[c[0],c[1],c[2],c[4]] for c in CM.COMPLIANCE_ROADMAP],[1.4*inch,1.5*inch,1.4*inch,2.6*inch]))
st.append(PageBreak())

# 8 AZURE COST
sec("8. Azure Cost")
st.append(para("Azure monthly cost scales from a lean MVP to enterprise production. Figures are MODEL ASSUMPTIONS built from published unit rates; the workbook lets every line and the USD/INR rate be edited.",BODYL))
st+=chart("azure",cap="Figure 4. Azure monthly cost by scale.")
st.append(vtable(["Service (MVP)","Tier","Monthly USD"],[[x[0],x[1],money(x[2])] for x in CM.AZURE["MVP"]][:10],[2.4*inch,2.5*inch,1.4*inch]))
st.append(Spacer(1,3)); st.append(para(f"MVP Azure total ≈ {money(R['azure']['MVP'])}/mo; Medium ≈ {money(R['azure']['MEDIUM'])}/mo; Large ≈ {money(R['azure']['LARGE'])}/mo. Full line items by scale are in the workbook (AZURE COST BY SCALE).",SMALL))
st.append(PageBreak())

# 9 AI COST + dev tools
sec("9. AI Cost — Runtime & Developer Tools")
st.append(para("Two separate budgets: (a) production AI runtime (per-token/per-minute), and (b) AI developer subscriptions. A ChatGPT/Claude subscription is never production API credit.",BODYL))
st+=chart("perclaim",cap="Figure 5. Cost per worked claim (AI + voice + document AI + clearinghouse transaction).")
st+=chart("aicost",cap="Figure 6. Production AI runtime cost by scale.")
sub("9.1 Claude Max (developer productivity)")
st.append(para(f"Claude Max 5x is ${CM.CLAUDE_MAX_5X}/user/mo and Max 20x is ${CM.CLAUDE_MAX_20X}/user/mo (per individual; Claude Code included). Baseline: 5 users × Max 20x = {money(R['claude_baseline_mo'])}/mo ({money(R['claude_baseline_mo']*12)}/yr). Do not create one subscription per AI agent.",BODYL))
st.append(vtable(["Users","Plan","Monthly","Annual"],[[u,p,money(m),money(a)] for u,p,m,a,_,_ in CM.claude_matrix()],[1.0*inch,1.6*inch,1.5*inch,1.5*inch]))
sub("9.2 ChatGPT")
st.append(para(f"ChatGPT Business (formerly Team) is ${CM.CGPT_BIZ_STD}/user/mo (annual, 2-seat min); Enterprise is quote-only (not publicly disclosed). Model separately from the OpenAI/Azure OpenAI production API.",BODYL))
st.append(PageBreak())

# 10 HR + DEV COST
sec("10. Human Resources & Development Cost")
st.append(para("An India-based engineering team (US customers) with an AI productivity uplift. Salary bands are benchmark ranges (Glassdoor/6figr/Levels), fully-loaded at ×1.4.",BODYL))
st+=chart("team",cap="Figure 7. Annual human-resource cost by team model (mid-band, loaded).")
st.append(vtable(["Team model","Roles","Annual (mid, loaded)"],[[m,len(CM.TEAM_COMP[m]),money(R["team"][m]["mid"])] for m in CM.TEAM_COMP],[2.4*inch,1.2*inch,2.2*inch]))
st.append(Spacer(1,3)); st.append(para(f"MVP build (lean team × {CM.MVP_BUILD_MONTHS} mo) ≈ {money(R['mvp_dev_cost'])}. AI productivity scenarios of +10/20/30/40% are modeled; plan on +30%.",SMALL))
st.append(PageBreak())

# 11 MILESTONES + plan
sec("11. Milestones & Project Plan")
st+=chart("timeline",cap="Figure 8. M0–M12 milestone timeline (~46 weeks realistic).")
st.append(vtable(["Scenario","MVP (M9)","Pilot (M11)","Production (M12)"],
 [["Aggressive (0.8×)","~26 wk","~30 wk","~37 wk"],["Realistic (1.0×)","~32 wk","~40 wk","~46 wk"],["Conservative (1.3×)","~42 wk","~52 wk","~60 wk"]],[1.7*inch,1.6*inch,1.6*inch,1.9*inch]))
st.append(para("PM platform: GitHub Projects (recommended). Workflow: Requirement → AI PM → story → AI architect → AI dev → AI QA/Security → PR → human review → CI/CD → staging → human approval → production. Protected main; mandatory PR + SAST/DAST/SCA/secret/container/IaC scanning.",BODYL))
st.append(PageBreak())

# 12 INVESTMENT
sec("12. Investment & Budgets")
st+=chart("burn",cap="Figure 9. MVP investment breakdown.")
st+=chart("cumulative",cap="Figure 10. Cumulative investment over 24 months.")
st.append(vtable(["Phase","Investment (USD)","INR (Rs )"],
 [["MVP (one-time, ~8 mo)",money(R["mvp_investment"]),f"Rs {R['mvp_investment']*90:,.0f}"],
  ["12-month",money(R["inv_12mo"]),f"Rs {R['inv_12mo']*90:,.0f}"],
  ["24-month",money(R["inv_24mo"]),f"Rs {R['inv_24mo']*90:,.0f}"]],[2.4*inch,2.2*inch,2.2*inch]))
st.append(para("Contingency scenarios of 10% / 15% / 20% are modeled (15% used above). Every cost is classified one-time / monthly / annual / usage / fixed / variable / estimated / publicly-priced / quote-required in the workbook.",SMALL))
st.append(PageBreak())

# 13 UNIT ECONOMICS
sec("13. Unit Economics")
st.append(para(f"Blended all-in cost per worked claim ≈ ${R['all_in_per_claim']:.2f} (AI ${R['ai_per_claim']:.2f} + voice ${R['voice_per_claim']:.2f} + document AI ${R['doc_per_claim']:.2f} + clearinghouse ${R['ch_per_claim']:.2f}). The clearinghouse transaction is the largest per-claim variable cost; Stedi's free tier covers the MVP, and model routing + prompt caching + batch keep AI cost low.",BODYL))
st.append(vtable(["Action","AI $","Channel $","Total $"],
 [["Eligibility check","0.005","0.12","0.125"],["Claim status","0.005","0.12","0.125"],["Prior authorization","0.05","0.12","0.17"],
  ["Denial analysis","0.10","0.00","0.10"],["Appeal draft","0.15","0.00","0.15"],["AI agent action","0.02","0.00","0.02"]],[2.4*inch,1.3*inch,1.5*inch,1.3*inch]))
st.append(PageBreak())

# 14 PROVIDER & PAYER ARCHITECTURE (dedicated)
sec("14. Provider & Payer Architecture")
sub("14.1 Provider architecture")
st.append(vtable(["Layer","Description"],
 [["Ingress","Front Door → WAF → API Management → Entra ID"],
  ["Provider API","Eligibility · Benefits · Estimation · Prior Auth · Claims · Status · Denials · Appeals · Recovery"],
  ["Orchestration","Right-channel engine: EDI → API → FHIR → Portal → Voice → Human"],
  ["Data","PostgreSQL (RLS by tenant) · Blob (claims/docs) · Redis"],
  ["Connectivity","Clearinghouse APIs (Stedi/Optum/Availity); payer FHIR (2027)"]],[1.4*inch,5.5*inch]))
sub("14.2 Payer architecture (decision-support)")
st.append(vtable(["Layer","Description"],
 [["Payer API","Claim intake · validation · adjudication decision-support · payment integrity · denial ops · appeals · provider comms"],
  ["Governance","AI recommendation → rules validation → human/payer approval → execution → audit"],
  ["Guardrail","No final coverage/medical-necessity/payment decision by AI alone"],
  ["Data","Payer tenant DB / dedicated for enterprise; never visible to provider tenants"],
  ["Intelligence","Payer Intelligence + coverage-policy RAG (free CMS NCD/LCD; license InterQual/MCG)"]],[1.4*inch,5.5*inch]))
st.append(PageBreak())

# 15 AI AGENT WORKFORCE (dedicated table)
sec("15. AI Agent Workforce")
st.append(para("Twenty specialized agents operated by the human team through AI tools — not one subscription per agent. Each has scoped tool/data/tenant/action permissions and full audit; high-risk actions are human-approved.",BODYL))
ags=["Product Manager","Project Manager","Business Analyst","Healthcare RCM","Payer Research","Architecture","Backend Developer","Frontend Developer","AI Engineer","EDI","FHIR","Integration","Database","QA","Security","DevOps","FinOps","Documentation","Compliance Research","Test Data"]
half=10
st.append(vtable(["#","Agent","#","Agent"],[[i+1,ags[i],i+11,ags[i+10]] for i in range(half)],[0.5*inch,2.9*inch,0.5*inch,2.9*inch]))
st.append(PageBreak())

# 16 AZURE COST BY SCALE (full)
sec("16. Azure Cost by Scale")
st.append(para("Full monthly line items per scenario (MODEL ASSUMPTIONS from published unit rates). The workbook exposes every cell plus the USD/INR rate.",BODYL))
for scn in ["MEDIUM","LARGE"]:
    sub(f"16.{1 if scn=='MEDIUM' else 2} {CM.SCENARIOS[scn]['label']} — {money(R['azure'][scn])}/month")
    st.append(vtable(["Service","Tier","Monthly USD"],[[x[0],x[1],money(x[2])] for x in CM.AZURE[scn]],[2.5*inch,2.6*inch,1.3*inch]))
    st.append(Spacer(1,4))
st.append(PageBreak())

# 17 HUMAN RESOURCES (full salary table)
sec("17. Human Resources — Salary Bands")
st.append(para("India annual base salary bands (benchmark ranges; fully-loaded at ×1.4). Ranges, not quotes.",BODYL))
st.append(vtable(["Role","Low $","Mid $","High $","Loaded Mid $"],
 [[role,money(lo),money(mid),money(hi),money(round(mid*CM.LOAD_FACTOR))] for role,(lo,mid,hi) in CM.SALARY.items()],
 [2.5*inch,1.1*inch,1.1*inch,1.1*inch,1.3*inch]))
st.append(PageBreak())

# 18 MILESTONES (full)
sec("18. Milestones — Full Detail")
mrows=[["M0","Discovery","2 wk","Requirements, payer/API/security research"],
 ["M1","Architecture + Security","3 wk","Azure, Entra, networking, tenant model, CI/CD"],
 ["M2","Multi-tenant core","4 wk","Tenants, RBAC, orgs, users, audit, admin"],
 ["M3","Eligibility + Benefits","4 wk","270/271, integration framework, payer config"],
 ["M4","Claim Status","3 wk","276/277, timeline, status agent"],
 ["M5","Prior Authorization","4 wk","278/FHIR, PA workflow, documents"],
 ["M6","Denial Intelligence","4 wk","835/CARC/RARC, analysis, recovery"],
 ["M7","Appeals","3 wk","Draft, human approval, tracking"],
 ["M8","Payer Intelligence","4 wk","Payer DB, RAG, recommendation engine"],
 ["M9","AI Workforce","3 wk","Agent orchestration, registry, audit"],
 ["M10","Security / HIPAA hardening","4 wk","Risk assessment, pen test, PHI controls"],
 ["M11","Pilot","4 wk","Design partner, approved data, metrics"],
 ["M12","Production readiness","4 wk","HA, DR, monitoring, runbooks, release"]]
st.append(vtable(["#","Milestone","Dur.","Key deliverables"],mrows,[0.5*inch,2.0*inch,0.7*inch,3.7*inch]))
st.append(Spacer(1,3)); st.append(para("Total realistic ≈ 46 weeks. MVP-capable by ~M8–M9; pilot ~M11; production ~M12.",SMALL))
st.append(PageBreak())

# 19 BUDGETS (12 & 24 month detail)
sec("19. 12-Month & 24-Month Budgets")
sub("19.1 12-month budget")
st.append(vtable(["Category","USD"],
 [["Team (Balanced 8, loaded)",money(R["team"]["Balanced MVP (8)"]["mid"])],
  ["Azure (MVP→Medium)",money(R["azure"]["MVP"]*6+R["azure"]["MEDIUM"]*6)],
  ["AI runtime",money(R["ai_rt"]["MVP"]["total"]*6+R["ai_rt"]["MEDIUM"]["total"]*6)],
  ["AI dev subscriptions",money((R["claude_baseline_mo"]+R["chatgpt_baseline_mo"])*12)],
  ["Security + SOC2 Type I",money(R["sec_mvp_onetime"]+R["sec_mvp_annual"]+30000)],
  ["Legal + testing + clearinghouse",money(45000)],
  ["TOTAL (incl. 15% contingency)",money(R["inv_12mo"])]],[3.6*inch,2.4*inch]))
sub("19.2 24-month budget")
st.append(vtable(["Category","USD"],
 [["Team (scale to production)",money(R["team"]["Balanced MVP (8)"]["mid"]+R["team"]["Production (13)"]["mid"])],
  ["Azure (Medium × 24 mo)",money(R["azure"]["MEDIUM"]*24)],
  ["AI runtime (Medium × 24 mo)",money(R["ai_rt"]["MEDIUM"]["total"]*24)],
  ["AI dev subscriptions × 24 mo",money((R["claude_baseline_mo"]+R["chatgpt_baseline_mo"])*24)],
  ["Security + SOC2 Type II",money(162000)],["Legal + testing × 2",money(90000)],
  ["TOTAL (incl. 15% contingency)",money(R["inv_24mo"])]],[3.6*inch,2.4*inch]))
st.append(PageBreak())

# 20 COMMERCIAL MODELS
sec("20. Commercial Cost Models")
st.append(vtable(["Model","Cost structure","Gross-margin target"],
 [["Provider-only","Azure + AI (variable/claim) + security (fixed) + clearinghouse (per txn)","70–80% at scale"],
  ["Payer-only","Higher security/compliance + enterprise integration + human oversight","60–75%"],
  ["Combined","Shared platform (amortized build) + tenant isolation + both-side integration","65–78% blended"]],[1.4*inch,3.9*inch,1.6*inch]))
st.append(para("Illustrative gross-margin structures; validate through pricing pilots. The combined model has the strongest LTV via governed cross-side network effects.",SMALL))
sub("20.1 Build / Buy / Partner")
st.append(vtable(["Capability","Decision","Rationale"],
 [["Payer connectivity","BUY/PARTNER","Clearinghouse (Stedi/Optum/Availity)"],
  ["Denial/appeal/estimation AI","BUILD","Proprietary value"],
  ["Payer Intelligence + Orchestration","BUILD","The moat"],
  ["AI voice","BUY/INTEGRATE","Voice provider under BAA"],
  ["Coverage criteria (InterQual/MCG)","PARTNER/LICENSE","License-gated"],
  ["Payer-side adjudication","PARTNER/REGULATED","Decision-support only; legal review"]],[2.4*inch,1.7*inch,2.8*inch]))
st.append(PageBreak())

# 21 DR/BCP + GOVERNANCE
sec("21. Disaster Recovery, Continuity & Governance")
sub("21.1 RPO / RTO")
st.append(vtable(["Tier","RPO","RTO","Measures"],
 [["MVP","≤ 24h","≤ 8h","Backups, PITR"],["Production","≤ 1h","≤ 4h","Geo-redundancy, failover, DR testing"],
  ["Enterprise","≤ 15m","≤ 1h","Active-passive multi-region, ransomware recovery"]],[1.3*inch,0.9*inch,0.9*inch,3.8*inch]))
sub("21.2 Continuity responses")
st.append(vtable(["Scenario","Response"],
 [["AI provider outage","Fallback: primary → secondary model → rules → human"],
  ["Clearinghouse/payer API outage","Alternate channel; queue & retry; portal/voice"],
  ["Azure / DB outage","Failover; restore from PITR/geo-backup"],
  ["Cyberattack / ransomware","IR plan; isolation; immutable backups; restore"]],[2.4*inch,4.5*inch]))
sub("21.3 AI agent governance")
st.append(para("AI agents are privileged software identities: agent identity → scoped tool/data/tenant/action permissions → audit. High-risk actions (production deploy, DB/IAM/security/PHI changes, deletions, and any adjudication/medical-necessity/coverage/financial decision) require human approval.",BODYL))
st.append(PageBreak())

# 22 CONNECTIVITY STRATEGY
sec("22. Connectivity Strategy")
st.append(para("The orchestration engine follows one principle — <b>don't call when you can connect digitally</b> — selecting the cheapest sufficient channel per payer and workflow. Voice is a last resort after EDI, API, FHIR and portal; humans handle exceptions.",BODYL))
st.append(vtable(["Workflow","Digital-first path","Fallback"],
 [["Eligibility","270/271 → API → FHIR (CoverageEligibility*)","Portal → Voice → Human"],
  ["Claim Status","276/277 → API → FHIR (Claim/ClaimResponse)","Portal → Voice → Human"],
  ["Prior Auth","FHIR PAS / X12 278 / payer API","Portal → Voice → Human"],
  ["Denials","835 / 277CA (electronic — no call)","Human review of exceptions"],
  ["Appeals","Payer-specific: API / portal / upload","Fax → Mail → Human"]],[1.3*inch,3.3*inch,2.3*inch]))
st.append(para("Each execution captures outcome + evidence + confidence, schedules the next action, and escalates to a human below a confidence threshold. This right-channel routing is the core cost lever: it keeps the expensive channels (voice, human) rare.",BODYL))
st.append(PageBreak())

# 23 SECURITY CONTROLS & PHI DATA FLOW
sec("23. Security Controls & PHI Data Flow")
st.append(vtable(["Domain","Controls"],
 [["Identity","Entra ID · MFA · Conditional Access · PIM/JIT · Managed Identity"],
  ["Network","Hub-spoke · Private Link/Endpoints · Firewall · WAF · DDoS · no public DB"],
  ["Data","TLS 1.2+ · AES-256 at rest · Key Vault/CMK · HSM (where justified) · RLS"],
  ["AI","AI Gateway: PHI detection → policy → redaction → approved model → validation → audit"],
  ["Monitoring","Defender for Cloud · Sentinel SIEM · Monitor/App Insights · immutable audit"],
  ["SDLC","SAST/DAST/SCA/secret/container/IaC scanning · protected main · PR review"],
  ["Governance","Least privilege (humans + AI agents); high-risk actions human-approved"]],[1.3*inch,5.6*inch]))
sub("23.1 PHI data flow (AI Gateway)")
st.append(vtable(["Step","Action"],
 [["1 Ingress","Authenticated request (Entra) over TLS"],["2 PHI detection","Classify & detect PHI in payload"],
  ["3 Policy engine","Apply tenant + PHI policy; choose model + redaction"],["4 Redaction","Tokenize/redact where appropriate before the model call"],
  ["5 Approved model","Azure OpenAI (BAA) for the PHI path; provider-agnostic gateway"],["6 Validation","Validate output; confidence scoring"],
  ["7 Audit","Immutable log: input refs, decision, model, confidence, approver"]],[1.4*inch,5.5*inch]))
st.append(callout("Development data rule","Development uses synthetic / de-identified data only. Developer AI tools (Claude Max, ChatGPT subscriptions) are never production PHI infrastructure — production PHI uses only approved services under appropriate contractual/BAA arrangements."))
st.append(PageBreak())

# 24 RISKS + RECOMMENDATION
sec("24. Risks")
st+=bullets(["<b>Clearinghouse pricing opacity</b> — capture Stedi cents; start on the free tier; keep multi-vendor.",
 "<b>AI-decision regulation</b> (CMS-4201-F, CA SB 1120) — human-in-the-loop; decision-support only.",
 "<b>PHI/security</b> — Zero Trust, encryption, private networking, SIEM, incident-response readiness.",
 "<b>Tenant leakage</b> — RLS + app authorization + isolation testing.",
 "<b>AI cost overrun</b> — model routing, caching, batch, per-claim budget guardrails.",
 "<b>Timeline/talent</b> — AI productivity uplift, realistic plan, 15% contingency."])
sec("25. Final Recommendation")
st.append(para("<b>Build the common platform from day one; launch Provider/RCM first; add Payer capabilities after validation.</b> The research supports this: provider-side connectivity is solved by clearinghouses (a near-$0 MVP is feasible on free tiers), the durable moat is the Payer-Intelligence + Orchestration layer, and payer-side is a large adjacent opportunity best entered as decision-support. Provider-first minimizes regulatory complexity, capital and sales-cycle risk while proving the shared foundation.",BODYL))
st.append(callout("Investor summary",
 f"MVP ≈ {money(R['mvp_investment'])}; 12-month ≈ {money(R['inv_12mo'])}; 24-month ≈ {money(R['inv_24mo'])}; avg monthly burn (yr 1) ≈ {money(R['monthly_burn_12'])}. Team: 5 FTE (lean) → 8 (balanced) → 12–15 (production), India-based, AI-augmented, 5 × Claude Max 20x. Azure {money(R['azure']['MVP'])}→{money(R['azure']['LARGE'])}/mo across scale. HIPAA-aligned, SOC 2 on the roadmap. All figures are MODEL ASSUMPTIONS — verify live pricing before board commitment."))
# APPENDIX sources
st.append(PageBreak()); sec("Appendix. Pricing Sources")
st.append(vtable(["Item","Confidence"],[[v[0],v[2]] for v in CM.CM_SOURCES.values()],[5.5*inch,1.4*inch]))
st.append(Spacer(1,6)); st.append(para("Full URLs are hyperlinked in the workbook SOURCES sheet. Primary hubs: Azure pricing pages / Microsoft Learn, Anthropic & OpenAI official pricing, CMS/HHS/HL7/X12/CAQH, and named benchmark sources for security/salary ranges.",SMALL))

doc.multiBuild(st)
import re as _re
pdfpages=len(_re.findall(rb"/Type\s*/Page[^s]",open(PDF,"rb").read()))
print("PDF pages:",pdfpages)
print("\n=== VALIDATION ===")
print("XLSX:",XLSX,"sheets:",len(wb.sheetnames))
print("PDF:",PDF,"pages:",pdfpages)
print(f"MVP {money(R['mvp_investment'])} | 12mo {money(R['inv_12mo'])} | 24mo {money(R['inv_24mo'])} | Azure MVP {money(R['azure']['MVP'])}/mo | Claude 5x20x {money(R['claude_baseline_mo'])}/mo")


