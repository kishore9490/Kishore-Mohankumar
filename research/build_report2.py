# -*- coding: utf-8 -*-
"""
Build the EXPANDED two-sided (provider + payer) feasibility deliverables:
  - AI_Revenue_Recovery_OS_US_Payer_API_Pricing_Report.pdf
  - AI_Revenue_Recovery_OS_US_Payer_API_Database.xlsx  (26 sheets)
  - AI_Revenue_Recovery_OS_Payer_Master.csv
  - AI_Revenue_Recovery_OS_API_Master.csv
  - AI_Revenue_Recovery_OS_Payer_Guidelines.csv
  - AI_Revenue_Recovery_OS_Executive_Findings.md
No fabricated pricing; UNKNOWN/VARIABLE preserved; no PHI.
"""
import os
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import pandas as pd

import research_data as R
import research_data2 as R2
from payer_records import RECORDS, DF, COLS, SCORES

OUT=os.path.dirname(os.path.abspath(__file__))
ASSET=os.path.join(OUT,"_assets2"); os.makedirs(ASSET,exist_ok=True)
DATE=R.REPORT_DATE

# palette
NAVY="#0C1B30"; NAVY2="#13253F"; TEAL="#118C7E"; TEAL_L="#2FBFA6"; CYAN="#2E7FC2"
INK="#1a2433"; MUT="#6B7B90"; LINE="#D5DEE8"; GREEN="#2E9E6B"; AMBER="#D8942A"
REDX="#C7503F"; GREY="#95A3B4"; VIOLET="#6C5CE0"; ORANGE="#C77B2E"
plt.rcParams.update({"font.family":"DejaVu Sans","font.size":9,"axes.edgecolor":LINE,
 "axes.linewidth":.8,"figure.dpi":150,"savefig.dpi":150,"text.color":INK,
 "axes.labelcolor":INK,"xtick.color":MUT,"ytick.color":MUT})
def _style(ax):
    for s in ["top","right"]: ax.spines[s].set_visible(False)
    ax.tick_params(length=0)

ALLSRC=R2.ALLSOURCES()

# ======================================================================
# PAYER-SIDE OPPORTUNITY SCORING
# tuple: (wf, market, feasibility, api, reg_complexity, integration, human_dep, ai_opp, revenue, model, note)
# ======================================================================
def payer_side_score(t):
    _,market,feas,api,reg,integ,human,ai,rev,model,note=t
    s = market*2 + feas*1.5 + api*1.0 + (10-reg)*1.5 + ai*1.5 + rev*1.5 + (10-human)*1.0
    s = round(min(s,100))
    lab = "HIGH" if s>=70 else ("MEDIUM" if s>=45 else "LOW")
    return s, lab
PS_SCORED=[(t[0],*payer_side_score(t),t[9],t[10],t) for t in R2.PAYER_SIDE]  # (wf, score, band, model, note, raw)

# ======================================================================
# CHARTS
# ======================================================================
def chart_twosided():
    fig,ax=plt.subplots(figsize=(8.8,4.6)); ax.axis("off"); ax.set_xlim(0,12); ax.set_ylim(0,10)
    def box(x,y,w,h,t,fc=NAVY2,tc="white",fs=7.6,sub=None):
        ax.add_patch(FancyBboxPatch((x,y),w,h,boxstyle="round,pad=0.02,rounding_size=0.1",fc=fc,ec=LINE,lw=1))
        ax.text(x+w/2,y+h/2+(0.14 if sub else 0),t,ha="center",va="center",color=tc,fontsize=fs,fontweight="bold")
        if sub: ax.text(x+w/2,y+h/2-0.26,sub,ha="center",va="center",color="#C9D4E0",fontsize=6.2)
    box(4,8.6,4,1.1,"AI Revenue Recovery OS",fc=TEAL,fs=10,sub="Payer Intelligence + Orchestration")
    ax.text(1.75,8.35,"PROVIDER / RCM SIDE",ha="center",fontsize=8,fontweight="bold",color=TEAL_L)
    ax.text(10.25,8.35,"PAYER / ADMINISTRATOR SIDE",ha="center",fontsize=8,fontweight="bold",color=VIOLET)
    # provider side (left)
    prov=["Eligibility","Benefits","Prior Auth","Claims","Claim Status","Denials","Appeals","Recovery"]
    for i,p in enumerate(prov):
        box(0.2,7.1-i*0.88,3.1,0.68,p,fc="#1c3350",fs=6.8)
        ax.add_patch(FancyArrowPatch((3.3,7.44-i*0.88),(4.0,8.75),arrowstyle="-|>",mutation_scale=7,color="#3a5a80",lw=.7))
    # payer side (right)
    pay=["Claim Intake","Validation","Adjudication Support","Payment Integrity","Denial Support","Provider Comms","Appeals/Grievances","Analytics"]
    for i,p in enumerate(pay):
        box(8.7,7.1-i*0.88,3.1,0.68,p,fc="#2a2140",fs=6.8)
        ax.add_patch(FancyArrowPatch((8.7,7.44-i*0.88),(8.0,8.75),arrowstyle="-|>",mutation_scale=7,color="#5a4a80",lw=.7))
    box(2.9,0.2,6.2,0.8,"EDI  →  API/FHIR  →  Portal  →  Voice  →  Human",fc=NAVY,fs=7.4)
    ax.add_patch(FancyArrowPatch((6,8.6),(6,1.0),arrowstyle="-|>",mutation_scale=9,color=MUT,lw=1))
    p=os.path.join(ASSET,"twosided.png"); plt.savefig(p,bbox_inches="tight",dpi=150); plt.close(); return p

def chart_payerside():
    labs=[x[0] for x in PS_SCORED]; scores=[x[1] for x in PS_SCORED]
    colors=[GREEN if s>=70 else (AMBER if s>=45 else REDX) for s in scores]
    fig,ax=plt.subplots(figsize=(8.4,5.0)); y=range(len(labs))
    ax.barh(list(y),scores,color=colors,height=.66)
    for i,s in enumerate(scores): ax.text(s+1,i,f"{s} · {PS_SCORED[i][2]}",va="center",fontsize=7.4,fontweight="bold",color=INK)
    ax.set_yticks(list(y)); ax.set_yticklabels(labs,fontsize=7.8); ax.invert_yaxis(); ax.set_xlim(0,105)
    ax.set_xlabel("Payer-side opportunity score (our analytical composite)"); _style(ax)
    p=os.path.join(ASSET,"payerside.png"); plt.savefig(p,bbox_inches="tight"); plt.close(); return p

def chart_regscatter():
    fig,ax=plt.subplots(figsize=(8.0,4.6))
    for t in R2.PAYER_SIDE:
        wf,market,feas,api,reg,integ,human,ai,rev,model,note=t
        c=GREEN if "A" in model and "C" not in model else (AMBER if "B" in model else REDX)
        ax.scatter(reg,ai,s=rev*22,color=c,alpha=.7,edgecolor="white",linewidth=1)
        ax.text(reg,ai+0.18,wf.split(" (")[0][:22],fontsize=6.3,ha="center",color=INK)
    ax.set_xlabel("Regulatory complexity  (higher = harder)"); ax.set_ylabel("AI opportunity")
    ax.set_xlim(1,10.5); ax.set_ylim(3,10.5); _style(ax)
    ax.text(2,10.2,"Bubble size = revenue potential",fontsize=7,color=MUT)
    ax.text(2.5,4,"START HERE\n(low reg · high AI)",fontsize=7.5,color=GREEN,fontweight="bold",ha="center")
    p=os.path.join(ASSET,"regscatter.png"); plt.savefig(p,bbox_inches="tight"); plt.close(); return p

def chart_apicompare():
    vend=["Stedi","Optum","Availity","Waystar","pVerify","CMS BB2.0"]
    fsb=[1,1,1,0,1,1]; fprod=[1,0,0,0,0,1]; selfserve=[1,0,0,0,1,1]
    import numpy as np; x=np.arange(len(vend)); w=.26
    fig,ax=plt.subplots(figsize=(8.4,3.6))
    ax.bar(x-w,fsb,w,label="Free sandbox",color=TEAL_L); ax.bar(x,fprod,w,label="Free production tier",color=GREEN); ax.bar(x+w,selfserve,w,label="Self-serve production",color=CYAN)
    ax.set_xticks(x); ax.set_xticklabels(vend,fontsize=8); ax.set_yticks([0,1]); ax.set_yticklabels(["No","Yes"])
    ax.legend(fontsize=8,frameon=False,ncol=3,loc="upper center",bbox_to_anchor=(.5,1.16)); _style(ax)
    ax.text(0,-.5,"CMS Blue Button 2.0 = free but Medicare-FFS, patient-authorized (not general RCM)",fontsize=6.6,color=MUT)
    p=os.path.join(ASSET,"apicompare.png"); plt.savefig(p,bbox_inches="tight"); plt.close(); return p

def chart_models():
    fig,ax=plt.subplots(figsize=(8.6,3.4)); ax.axis("off"); ax.set_xlim(0,12); ax.set_ylim(0,6)
    cols=[("Model A","Tech assists payer staff\n(SaaS + BAA)","Lowest — HIPAA BA","Feasible now",GREEN),
          ("Model B","Delegated administrative\nservices (BPO)","TPA likely + FDR oversight","Contracts + compliance",AMBER),
          ("Model C","Delegated claims / UM /\npayment decisions","TPA + UR agent + fiduciary +\nAI-decision limits","Long-term · legal review",REDX)]
    for i,(t,d,reg,feas,c) in enumerate(cols):
        x=0.4+i*3.9
        ax.add_patch(FancyBboxPatch((x,0.6),3.5,4.6,boxstyle="round,pad=0.03,rounding_size=0.15",fc="#F7FAFC",ec=c,lw=1.6))
        ax.text(x+1.75,4.7,t,ha="center",fontsize=11,fontweight="bold",color=c)
        ax.text(x+1.75,3.7,d,ha="center",fontsize=7.6,color=INK)
        ax.text(x+1.75,2.4,reg,ha="center",fontsize=7,color=MUT)
        ax.text(x+1.75,1.1,feas,ha="center",fontsize=7.4,fontweight="bold",color=c)
        if i<2: ax.annotate("",xy=(x+3.9,2.9),xytext=(x+3.5,2.9),arrowprops=dict(arrowstyle="-|>",color=MUT))
    ax.text(6,5.6,"Regulatory exposure rises A → B → C",ha="center",fontsize=8,color=MUT,fontweight="bold")
    p=os.path.join(ASSET,"models.png"); plt.savefig(p,bbox_inches="tight",dpi=150); plt.close(); return p

def chart_roadmap():
    fig,ax=plt.subplots(figsize=(8.8,3.2)); ax.axis("off"); ax.set_xlim(0,10); ax.set_ylim(0,5)
    phases=[("MVP","Eligibility · Benefits ·\nClaim Status","free/low-cost APIs",GREEN),
            ("V1","+ Denials · Prior Auth ·\nEstimation","clearinghouse prod",TEAL_L),
            ("V2","+ Appeals · Payment est ·\nPayer Intelligence","orchestration moat",CYAN),
            ("V3","Payer-side: claims support ·\npayment integrity · denial admin","Model A/B · legal review",AMBER),
            ("V4","Delegated payer ops\n(where feasible)","Model C · TPA/UM",REDX)]
    for i,(p_,d,s,c) in enumerate(phases):
        x=0.2+i*1.95
        ax.add_patch(FancyBboxPatch((x,1.0),1.75,3.0,boxstyle="round,pad=0.03,rounding_size=0.12",fc="#F7FAFC",ec=c,lw=1.4))
        ax.text(x+0.875,3.5,p_,ha="center",fontsize=11,fontweight="bold",color=c)
        ax.text(x+0.875,2.5,d,ha="center",fontsize=6.6,color=INK)
        ax.text(x+0.875,1.35,s,ha="center",fontsize=6.2,color=MUT,style="italic")
        if i<4: ax.annotate("",xy=(x+1.95,2.5),xytext=(x+1.75,2.5),arrowprops=dict(arrowstyle="-|>",color=MUT))
    p=os.path.join(ASSET,"roadmap.png"); plt.savefig(p,bbox_inches="tight",dpi=150); plt.close(); return p

CHARTS={k:f() for k,f in {"twosided":chart_twosided,"payerside":chart_payerside,"regscatter":chart_regscatter,
 "apicompare":chart_apicompare,"models":chart_models,"roadmap":chart_roadmap}.items()}
print("charts:",len(CHARTS))

# ======================================================================
# CSVs
# ======================================================================
# Payer Master (spec columns)
pm_cols=["Payer Organization","Parent","Payer Type","Plan Type","State","Payer ID","Aliases","Website","Provider Portal",
 "Eligibility","Benefits","Claim Status","Prior Auth","Claims","Denials","Appeals","FHIR","Direct API","Clearinghouse","Portal","Voice","Recommended Channel","Automation Score","Source","Last Verified","Confidence"]
pm_rows=[]
for r in RECORDS:
    pm_rows.append([r["Payer Organization"],r["Parent Organization"],r["Payer Type"],r["Plan Type"],r["State(s)"],r["Payer ID"],r["Payer ID Alias"],r["Website"],"YES",
     r["Eligibility Electronic"],r["Benefits Available"],r["Claim Status Electronic"],r["Prior Auth Electronic"],"YES (837)",r["Denial Data Available"],r["Portal Appeal"],r["FHIR Available"],r["Eligibility Direct Payer API"],"YES","YES",r["Voice Required"],r["Recommended Channel"],r["Automation Readiness Score"],r["Source URL 1"],DATE,r["Confidence"]])
PM=pd.DataFrame(pm_rows,columns=pm_cols); PM.to_csv(os.path.join(OUT,"AI_Revenue_Recovery_OS_Payer_Master.csv"),index=False)

# API Master
am_cols=["Provider","Payer","API Name","Workflow","Standard","FHIR","REST","X12","Direct","Intermediary","Public","Sandbox","Free Sandbox","Production","Free Production","Paid Production","Pricing","Provider Enrollment","Payer Enrollment","Authentication","OAuth","SMART","Real-Time","Batch","Source","Last Verified","Confidence"]
am_rows=[]
for a in R2.API_MASTER:
    srcurl = ALLSRC[a["src"][0]][1] if a["src"] else ""
    am_rows.append([a["provider"],a["payer"],a["api_name"],a["workflow"],a["standard"],a["fhir"],a["rest"],a["x12"],a["direct"],a["intermediary"],a["public"],a["sandbox"],a["free_sandbox"],a["production"],a["free_prod"],a["paid_prod"],a["pricing"],a["enroll_provider"],a["enroll_payer"],a["auth"],a["oauth"],a["smart"],a["realtime"],a["batch"],srcurl,DATE,a["conf"]])
AM=pd.DataFrame(am_rows,columns=am_cols); AM.to_csv(os.path.join(OUT,"AI_Revenue_Recovery_OS_API_Master.csv"),index=False)

# Payer Guidelines
pg_cols=["Payer","Timely Filing","Appeal Deadline","Submission Method","Provider Manual / Source","Last Verified","Confidence"]
pg_rows=[[g[0],g[1],g[2],g[3],ALLSRC[g[4]][1] if g[4] in ALLSRC else g[4],DATE,g[5]] for g in R2.PAYER_GUIDELINES]
PG=pd.DataFrame(pg_rows,columns=pg_cols); PG.to_csv(os.path.join(OUT,"AI_Revenue_Recovery_OS_Payer_Guidelines.csv"),index=False)
print("CSVs: PayerMaster",PM.shape,"APIMaster",AM.shape,"Guidelines",PG.shape)

# ======================================================================
# MARKDOWN EXECUTIVE FINDINGS
# ======================================================================
def mdt(h,rows): return "| "+" | ".join(h)+" |\n| "+" | ".join(["---"]*len(h))+" |\n"+"".join("| "+" | ".join(str(x) for x in r)+" |\n" for r in rows)+"\n"
md=[]
md.append("# AI Revenue Recovery OS — Two-Sided Feasibility: Executive Findings\n")
md.append(f"_Prepared {DATE}. Provider-side + payer-side opportunity, API pricing, guidelines and regulatory analysis. "
 "Evidence-backed from CMS / X12 / HL7 / CAQH / eCFR / NAIC / vendor docs. Values: YES/NO/PARTIAL/UNKNOWN/VARIABLE. "
 "Not legal advice — payer-side models require regulatory/legal review. No PHI._\n")
md.append("## The final question\n")
md.append("> Can AI Revenue Recovery OS start as a provider/RCM-side platform on existing APIs/clearinghouses, and eventually become a payer-side claims-intelligence and operations platform?\n\n")
md.append("**YES, WITH CONDITIONS.** Provider-side is buildable now on clearinghouse APIs (Stedi free tier enables a near-$0 MVP). Payer-side is a real, large opportunity as *decision-support* (Model A) and *administrative services* (Model B); *delegated decisioning* (Model C) is long-term and heavily regulated — AI cannot make final medical-necessity/coverage decisions alone (CMS-4201-F; CA SB 1120).\n\n")
md.append("## Payer-side opportunity scores (our analytical composite)\n")
md.append(mdt(["Payer-side workflow","Score","Band","Model"],[[x[0],x[1],x[2],x[3]] for x in PS_SCORED]))
md.append("## Payment integrity landscape\n")
md.append(mdt(["Vendor","Category","Orientation"],[[p[0],p[1],p[3]] for p in R2.PAYMENT_INTEGRITY]))
md.append(R2.PI_MARKET_NOTE+"\n\n")
md.append("## Free MVP API stack (near-$0 build)\n")
md.append(mdt(["Resource","Provider","Free?","Sandbox/Prod","Purpose"],[[f[0],f[1],f[3],f[4],f[2]] for f in R2.FREE_STACK]))
md.append(R2.FREE_STACK_NOTE+"\n\n")
md.append("## Regulatory models\n")
md.append(mdt(["Model","What the vendor does","Exposure","Feasibility"],[[m[0].split(" — ")[0],m[0].split(" — ")[1] if " — " in m[0] else "",m[2][:60],m[3]] for m in R2.MODELS]))
md.append("**Bottom line:** Final medical-necessity/coverage decisions cannot be made by AI alone (CMS-4201-F for MA; CA SB 1120). A qualified clinician must own any adverse determination. Model B/C likely trigger TPA licensing + FDR/subcontractor oversight.\n\n")
md.append("## Build / Buy / Partner\n")
md.append(mdt(["Capability","Decision","Rationale"],[[b[0],b[1],b[2]] for b in R2.BUILD_BUY_PARTNER]))
md.append("## Payer guidelines (key finding)\n")
md.append(R2.PAYER_GUIDELINES_NOTE+"\n\n")
md.append(mdt(["Payer","Timely Filing","Appeal Deadline","Confidence"],[[g[0],g[1],g[2],g[5]] for g in R2.PAYER_GUIDELINES]))
md.append("## Recommended sequence\n")
md.append("- **MVP:** Eligibility + Benefits + Claim Status (clearinghouse API; Stedi free tier).\n- **V1:** + Denial intelligence (835), Prior-auth intelligence, Patient-responsibility estimation.\n- **V2:** + Appeals orchestration, Payer Intelligence layer.\n- **V3:** Payer-side claims-support / payment-integrity / denial-support as **Model A** decision-support (legal review).\n- **V4:** Delegated payer operations (**Model C**) only where legally/contractually feasible.\n")
open(os.path.join(OUT,"AI_Revenue_Recovery_OS_Executive_Findings.md"),"w").write("".join(md))
print("MD written")

# ======================================================================
# EXCEL WORKBOOK (26 sheets)
# ======================================================================
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

XLSX=os.path.join(OUT,"AI_Revenue_Recovery_OS_US_Payer_API_Database.xlsx")
HEAD_FILL=PatternFill("solid",fgColor="0C1B30"); HEAD_FONT=Font(color="FFFFFF",bold=True,size=10)
TITLE_FONT=Font(color="0C1B30",bold=True,size=15); SUB_FONT=Font(color="118C7E",bold=True,size=11)
THIN=Side(style="thin",color="D5DEE8"); BORDER=Border(left=THIN,right=THIN,top=THIN,bottom=THIN)
WRAP=Alignment(wrap_text=True,vertical="top")
XL_FILL={"YES":"E4F3EA","PARTIAL":"FBF0DA","NO":"F7E1DD","UNKNOWN":"EDF1F5","VARIABLE":"EDE9F7"}
XL_FONT={"YES":"2E9E6B","PARTIAL":"9A6410","NO":"B23C2B","UNKNOWN":"6B7B90","VARIABLE":"5A4A9A"}
def cvs(cell):
    v=str(cell.value or ""); key=None
    for k in ("YES","PARTIAL","NO","UNKNOWN","VARIABLE"):
        if v.strip().upper().startswith(k): key=k; break
    if v.strip().upper() in ("N/A","NOT APPLICABLE"): key="UNKNOWN"
    if key: cell.fill=PatternFill("solid",fgColor=XL_FILL[key]); cell.font=Font(color=XL_FONT[key],size=9,bold=(key=="YES"))
def hdr(ws,row,ncols):
    for c in range(1,ncols+1):
        cell=ws.cell(row=row,column=c); cell.fill=HEAD_FILL; cell.font=HEAD_FONT; cell.alignment=Alignment(wrap_text=True,vertical="center"); cell.border=BORDER
    ws.freeze_panes=ws.cell(row=row+1,column=1); ws.auto_filter.ref=f"A{row}:{get_column_letter(ncols)}{row}"; ws.row_dimensions[row].height=30
def titleblk(ws,title,sub=None,note=None):
    ws["A1"]=title; ws["A1"].font=TITLE_FONT; r=2
    if sub: ws[f"A{r}"]=sub; ws[f"A{r}"].font=SUB_FONT; r+=1
    if note: ws[f"A{r}"]=note; ws[f"A{r}"].font=Font(italic=True,color="6B7B90",size=9); ws[f"A{r}"].alignment=WRAP; r+=1
    return r+1
def table(ws,start,headers,rows,widths=None,colorize=True,links_col=None):
    for j,htxt in enumerate(headers,1): ws.cell(row=start,column=j,value=htxt)
    hdr(ws,start,len(headers))
    for i,rw in enumerate(rows,start+1):
        for j,val in enumerate(rw,1):
            cell=ws.cell(row=i,column=j,value=val); cell.border=BORDER; cell.alignment=WRAP
            if colorize: cvs(cell)
            if links_col and j==links_col and isinstance(val,str) and val.startswith("http"):
                cell.hyperlink=val; cell.font=Font(color="2E7FC2",underline="single",size=9)
    if widths:
        for j,w in enumerate(widths,1): ws.column_dimensions[get_column_letter(j)].width=w
    return start+len(rows)+1

wb=Workbook(); wb.remove(wb.active)

def wf_sheet(name,title,cols_subset,note=None):
    ws=wb.create_sheet(name); s=titleblk(ws,title,note=note)
    headers=["Payer Organization","Payer Type"]+cols_subset
    rows=[[r["Payer Organization"],r["Payer Type"]]+[r[c] for c in cols_subset] for r in RECORDS]
    table(ws,s,headers,rows,widths=[26,10]+[15]*len(cols_subset)); return ws

# 1 EXECUTIVE SUMMARY
ws=wb.create_sheet("EXECUTIVE SUMMARY")
r=titleblk(ws,"AI Revenue Recovery OS — Two-Sided Feasibility (Provider + Payer)","Payer APIs · Pricing · Guidelines · Payer-side opportunity  ·  "+DATE,
 "Evidence-backed from CMS/X12/HL7/CAQH/eCFR/NAIC/vendor docs. YES/NO/PARTIAL/UNKNOWN/VARIABLE. Not legal advice — payer-side models need regulatory/legal review. No PHI.")
ws.cell(row=r,column=1,value="FINAL ANSWER: Can we start provider-side and become a payer-side platform?  →  YES, WITH CONDITIONS").font=SUB_FONT; r+=2
for f in ["Provider-side is buildable now on clearinghouse APIs; Stedi's free tier enables a near-$0 MVP (eligibility, claim status, claims, ERA — 100/mo each).",
 "Payer FHIR portals are CMS-9115 patient-authorized data, not provider RCM feeds. Direct provider-facing payer RCM APIs barely exist (Optum is the exception).",
 "Payer-side opportunity is real & large as Model A (SaaS decision-support) and Model B (administrative services). Payment integrity is the highest-scoring payer-side wedge.",
 "Model C (delegated claims/UM/payment decisions) is long-term & heavily regulated: TPA licensing, UR clinician requirements, MA/Medicaid delegation, ERISA. AI cannot make final medical-necessity decisions alone (CMS-4201-F; CA SB 1120).",
 "Prior authorization is the least-automated workflow; FHIR PA mandated for CMS-regulated payers Jan 1, 2027.",
 "Commercial timely-filing & appeal windows are contract/plan/state-VARIABLE (90 days–18 months); only government frameworks are fixed."]:
    ws.cell(row=r,column=1,value="•  "+f).alignment=WRAP; ws.merge_cells(start_row=r,start_column=1,end_row=r,end_column=8); ws.row_dimensions[r].height=30; r+=1
ws.column_dimensions["A"].width=30
for c in "BCDEFGH": ws.column_dimensions[c].width=12

# 2 PAYER MASTER
ws=wb.create_sheet("PAYER MASTER"); s=titleblk(ws,"Payer Master")
table(ws,s,list(PM.columns),PM.values.tolist(),widths=[26,20,10,24,16,12,16,26,12]+[14]*17)
for i in range(s+1,s+1+len(PM)):
    c=ws.cell(row=i,column=8)
    if isinstance(c.value,str) and c.value.startswith("http"): c.hyperlink=c.value; c.font=Font(color="2E7FC2",underline="single",size=8)

# 3 API MASTER
ws=wb.create_sheet("API MASTER"); s=titleblk(ws,"API Master — per-API inventory",note="Direct=payer's own API; Intermediary=clearinghouse. Free Sandbox ≠ Free Production. No fabricated pricing.")
table(ws,s,list(AM.columns),AM.values.tolist(),widths=[16,18,24,18,16]+[9]*6+[9,9,9,9,9,34,14,14,10,9,9,10,9,9,40,12,10],links_col=25)

# 4 API PRICING
ws=wb.create_sheet("API PRICING"); s=titleblk(ws,"API pricing landscape",note="Never invented. 'Not publicly disclosed' where sales-gated. Free sandbox is not free production.")
rows=[[a["provider"],a["api_name"],a["free_sandbox"],a["free_prod"],a["paid_prod"],a["pricing"],a["enroll_provider"],a["enroll_payer"]] for a in R2.API_MASTER]
table(ws,s,["Provider","API","Free Sandbox","Free Production","Paid Production","Pricing model","Provider Enroll","Payer Enroll"],rows,widths=[16,24,14,16,15,40,15,14])

# 5-12 workflow sheets
wf_sheet("ELIGIBILITY","Eligibility",["Eligibility Electronic","Eligibility Standard","Eligibility API","Eligibility Direct Payer API","Eligibility Clearinghouse API","Eligibility Real-Time","Eligibility Portal"])
wf_sheet("BENEFITS","Benefits",["Benefits Available","Benefits via 271","Deductible","Copay","Coinsurance","OOP Maximum","Service-Specific Benefits","Network Benefits"])
wf_sheet("PATIENT ESTIMATION","Patient Responsibility Estimation",["Allowed Amount Available","Accumulator Data","Patient Responsibility Data","Patient Responsibility Calculation Required","Estimation API","Estimation Confidence"])
wf_sheet("PRIOR AUTH","Prior Authorization",["Prior Auth Electronic","Prior Auth X12 278","Prior Auth FHIR","Prior Auth Requirements API","Prior Auth Submission","Prior Auth Status","Prior Auth Denial Reason","Prior Auth Portal","Prior Auth Voice/Manual"])
wf_sheet("CLAIMS","Claims (837)",["Claim Status Electronic","Eligibility Electronic","Denial Data Available","ERA 835","277CA"],note="837 claim submission is ~98% electronic via clearinghouse for all HIPAA-covered payers.")
wf_sheet("CLAIM STATUS","Claim Status",["Claim Status Electronic","Claim Status Standard","Claim Status API","Claim Status Direct Payer API","Claim Status Clearinghouse API","Claim Status Real-Time","Claim Status Voice Fallback"])
wf_sheet("DENIALS","Denials",["Denial Data Available","ERA 835","CARC","RARC","277CA","Claim-Level Denial","Service-Level Denial","Denial API"])
wf_sheet("APPEALS","Appeals",["Appeal API","Electronic Appeal","Portal Appeal","Document Upload","Fax","Mail","Human Process","Appeal Status API"])

# 13 PAYER GUIDELINES
ws=wb.create_sheet("PAYER GUIDELINES"); s=titleblk(ws,"Payer guidelines — timely filing & appeals",note=R2.PAYER_GUIDELINES_NOTE)
rows=[[g[0],g[1],g[2],g[3],ALLSRC[g[4]][1] if g[4] in ALLSRC else g[4],g[5]] for g in R2.PAYER_GUIDELINES]
table(ws,s,["Payer","Timely Filing","Appeal Deadline","Submission Method","Provider Manual / Source","Confidence"],rows,widths=[24,34,40,26,44,14],colorize=False,links_col=5)

# 14 COVERAGE POLICIES
ws=wb.create_sheet("COVERAGE POLICIES"); s=titleblk(ws,"Coverage-policy infrastructure",note="CMS NCD/LCD are free & code-mappable. InterQual/MCG are license-gated (cannot scrape).")
rows=[[c[0],c[1],c[2],c[3],ALLSRC[c[4]][1] if c[4] in ALLSRC else ""] for c in R2.COVERAGE_POLICIES]
table(ws,s,["Policy source","Type","Code-mappable (CPT/HCPCS/ICD-10)","Access","Source"],rows,widths=[34,34,26,34,44],colorize=False,links_col=5)

# 15 FHIR
ws=wb.create_sheet("FHIR"); s=titleblk(ws,"FHIR resources & CMS-mandated APIs",note="Patient Access/Provider Directory = CMS-9115 (live). Provider Access/Payer-to-Payer/Prior Auth = CMS-0057-F (2027).")
table(ws,s,["Resource / API","Rule / Source","Data","Access","Status","RCM relevance"],[list(x) for x in R2.FHIR_RESOURCES],widths=[26,16,34,22,14,30],colorize=False)

# 16 EDI
ws=wb.create_sheet("EDI"); s=titleblk(ws,"EDI (X12) standards matrix")
table(ws,s,["X12","Purpose","Sender→Receiver","HIPAA","Common use","Clearinghouse dependency"],[list(x) for x in R2.EDI_MATRIX],widths=[10,26,22,16,34,16],colorize=False)

# 17 CLEARINGHOUSES
ws=wb.create_sheet("CLEARINGHOUSES"); s=titleblk(ws,"Clearinghouse / API infrastructure vendors",note="Clearinghouse connectivity ≠ direct payer API. Exact per-transaction pricing behind calculators is UNKNOWN (verify).")
chd=R.CLEARINGHOUSE_DATA
rows=[[v,chd[v]["elig"],chd[v]["status"],chd[v]["claims"],chd[v]["era"],chd[v]["pa"],chd[v]["fhir"],chd[v]["sandbox"],chd[v]["free_prod"],chd[v]["pricing"],chd[v]["payers"]] for v in R.CLEARINGHOUSE_ORDER]
table(ws,s,["Vendor","Elig","Status","Claims","835","Prior Auth","FHIR","Free Sandbox","Free Prod","Pricing","Payers"],rows,widths=[16,12,12,12,10,16,12,16,20,34,14])

# 18 DIRECT PAYER APIS
ws=wb.create_sheet("DIRECT PAYER APIS"); s=titleblk(ws,"Direct payer developer / FHIR APIs (verified)",note="Nearly all are CMS-9115 PATIENT-AUTHORIZED, not provider RCM. Optum (UHG) is the exception.")
rows=[[o,f["dev"],f["pa"],f["pd"],f["rcm"],f["ver"],f["conf"],f["url"]] for o,f in R.PAYER_FHIR.items()]
table(ws,s,["Payer / Org","Dev Portal","Patient Access FHIR","Provider Directory FHIR","Direct provider-facing RCM API","FHIR Ver","Conf","Source"],rows,widths=[26,14,16,17,40,16,10,40],links_col=8)

# 19 FREE API OPTIONS
ws=wb.create_sheet("FREE API OPTIONS"); s=titleblk(ws,"Free MVP API stack (near-$0 build/test)",note=R2.FREE_STACK_NOTE)
rows=[[f[0],f[1],f[2],f[3],f[4],f[5],ALLSRC[f[6]][1] if f[6] in ALLSRC else "",f[7]] for f in R2.FREE_STACK]
table(ws,s,["Resource","Provider","Purpose","Free?","Sandbox/Production","Limits","Source","Confidence"],rows,widths=[24,14,30,10,26,34,40,12],links_col=7)

# 20 PAYER SIDE OPPORTUNITY
ws=wb.create_sheet("PAYER SIDE OPPORTUNITY"); s=titleblk(ws,"Payer-side opportunity scoring",note="Our analytical composite (0–100). Model C = delegated decisioning (heavily regulated; legal review required).")
rows=[[x[0],x[1],x[2],x[3],x[4]] for x in PS_SCORED]
table(ws,s,["Payer-side workflow","Score","Band","Model","Note"],rows,widths=[30,8,12,18,60],colorize=False)
for i in range(s+1,s+1+len(PS_SCORED)):
    band=ws.cell(row=i,column=3).value
    col={"HIGH":"E4F3EA","MEDIUM":"FBF0DA","LOW":"F7E1DD"}.get(band)
    if col: ws.cell(row=i,column=3).fill=PatternFill("solid",fgColor=col)

# 21 PAYMENT INTEGRITY
ws=wb.create_sheet("PAYMENT INTEGRITY"); s=titleblk(ws,"Payment integrity landscape",note=R2.PI_MARKET_NOTE)
table(ws,s,["Vendor","Category","Positioning","Orientation","Confidence"],[[p[0],p[1],p[2],p[3],p[4]] for p in R2.PAYMENT_INTEGRITY],widths=[20,28,60,14,12],colorize=False)

# 22 COMPETITORS
ws=wb.create_sheet("COMPETITORS"); s=titleblk(ws,"Competitive landscape",note="Positioning as of mid-2026; not a claim about missing features.")
table(ws,s,["Company","Category","Positioning","Side","Confidence"],[[c[0],c[1],c[2],c[3],c[4]] for c in R2.COMPETITORS],widths=[22,24,60,12,12],colorize=False)

# 23 CMS 2027
ws=wb.create_sheet("CMS 2027"); r=titleblk(ws,"CMS interoperability & prior authorization","CMS-0057-F (2024) — CMS-regulated payers only, not commercial/ERISA.",note="Source: CMS-0057-F fact sheet & Federal Register 2024-00895; CMS-9115-F.")
ws.cell(row=r,column=1,value="TIMELINE").font=SUB_FONT; r+=1
r=table(ws,r,["Date","Milestone","Detail"],[list(x) for x in R.CMS_TIMELINE],widths=[14,44,60],colorize=False); r+=1
ws.cell(row=r,column=1,value="THE FOUR APIs").font=SUB_FONT; r+=1
r=table(ws,r,["API","Data / scope","Notes"],[list(x) for x in R.CMS_APIS],widths=[24,52,50],colorize=False); r+=1
ws.cell(row=r,column=1,value="GOVERNMENT APPEAL FRAMEWORKS").font=SUB_FONT; r+=1
table(ws,r,["Program","Appeal ladder"],[[a[0],a[1]] for a in R2.APPEAL_FRAMEWORKS],widths=[24,90],colorize=False)

# 24 BUILD BUY PARTNER
ws=wb.create_sheet("BUILD BUY PARTNER"); s=titleblk(ws,"Build / Buy / Partner")
table(ws,s,["Capability","Decision","Rationale"],[list(x) for x in R2.BUILD_BUY_PARTNER],widths=[30,26,70],colorize=False)

# 25 SOURCES
ws=wb.create_sheet("SOURCES"); s=titleblk(ws,"Sources & evidence")
rows=[[v[0],v[1],v[2],v[3]] for v in ALLSRC.values()]
table(ws,s,["Source","URL","Type","Confidence"],rows,widths=[58,70,16,12],colorize=False,links_col=2)

# 26 RESEARCH GAPS
ws=wb.create_sheet("RESEARCH GAPS"); s=titleblk(ws,"Research coverage limitations & gaps",note="Explicitly enumerated. Require primary-source or per-payer/state verification before production commitments.")
gaps=[
 ["Exact clearinghouse per-transaction pricing","Stedi/Optum/Availity per-unit $ behind calculators/contracts","Capture from stedi.com/pricing; request quotes","High"],
 ["Commercial timely-filing / appeal deadlines","Contract/plan/state-VARIABLE (90d–18mo); UHC/Anthem have no single value","Store as configurable per-payer/plan/state values from live manual + contract","High"],
 ["Payment-integrity market size","Firm estimates vary widely by definition","Cite a range; verify per source","Medium"],
 ["Payer-side regulatory specifics (TPA/UM/ERISA)","State-by-state; discretion-dependent","Legal review per state and per model","High"],
 ["FHIR exact versions & Provider Access readiness","R4 implied; 2027 APIs not yet live","Read CapabilityStatements; monitor payer rollout","Medium"],
 ["InterQual/MCG licensing terms","License-gated criteria; pricing not public","Commercial license negotiation","Medium"],
 ["DPC / Logica status","DPC production paused; Logica retiring to Meld","Verify current status before depending","Medium"],
 ["Full payer universe","43 orgs representative, not exhaustive (thousands of payer IDs)","Expand via clearinghouse network lists","High"],
]
table(ws,s,["Gap","Description","How to close","Impact"],gaps,widths=[34,52,44,12],colorize=False)

wb.save(XLSX); print("XLSX sheets:",len(wb.sheetnames))

# ======================================================================
# PDF REPORT
# ======================================================================
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors as rc
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
    Table, TableStyle, Image, PageBreak, HRFlowable, NextPageTemplate)
from reportlab.platypus.tableofcontents import TableOfContents
from PIL import Image as PImage

PDF=os.path.join(OUT,"AI_Revenue_Recovery_OS_US_Payer_API_Pricing_Report.pdf")
CW=6.9*inch
rNAVY=rc.HexColor("#0C1B30"); rNAVY2=rc.HexColor("#13253F"); rTEAL=rc.HexColor("#118C7E")
rCYAN=rc.HexColor("#2E7FC2"); rMUT=rc.HexColor("#6B7B90"); rLINE=rc.HexColor("#D5DEE8"); rINK=rc.HexColor("#1a2433")
rGREEN=rc.HexColor("#2E9E6B"); rAMBER=rc.HexColor("#9A6410"); rRED=rc.HexColor("#B23C2B"); rGREY=rc.HexColor("#6B7B90"); rVIO=rc.HexColor("#5A4A9A")
RBG={"YES":rc.HexColor("#E4F3EA"),"PARTIAL":rc.HexColor("#FBF0DA"),"NO":rc.HexColor("#F7E1DD"),"UNKNOWN":rc.HexColor("#EDF1F5"),"VARIABLE":rc.HexColor("#EDE9F7")}
RTX={"YES":rGREEN,"PARTIAL":rAMBER,"NO":rRED,"UNKNOWN":rGREY,"VARIABLE":rVIO}
ss=getSampleStyleSheet()
def PS(n,**k): return ParagraphStyle(n,parent=k.pop("parent",ss["Normal"]),**k)
BODY=PS("b",fontName="Helvetica",fontSize=9.5,leading=14,textColor=rINK,alignment=TA_JUSTIFY,spaceAfter=7)
BODYL=PS("bl",parent=BODY,alignment=TA_LEFT)
H1=PS("h1",fontName="Helvetica-Bold",fontSize=17,leading=21,textColor=rNAVY,spaceBefore=6,spaceAfter=10)
H2=PS("h2",fontName="Helvetica-Bold",fontSize=12.5,leading=16,textColor=rTEAL,spaceBefore=12,spaceAfter=6)
EY=PS("ey",fontName="Helvetica-Bold",fontSize=8,leading=11,textColor=rMUT,spaceAfter=2)
SMALL=PS("sm",fontName="Helvetica",fontSize=8,leading=11,textColor=rMUT,spaceAfter=4)
CELL=PS("c",fontName="Helvetica",fontSize=7.4,leading=9.2,textColor=rINK)
CELLH=PS("ch",fontName="Helvetica-Bold",fontSize=7.4,leading=9.2,textColor=rc.white)
BULL=PS("bu",parent=BODYL,leftIndent=12,spaceAfter=4)
def h1(t): p=Paragraph(t,H1); p.toc_level=0; return p
def h2(t): p=Paragraph(t,H2); p.toc_level=1; return p
def para(t,s=BODY): return Paragraph(t,s)
def bullets(items): return [Paragraph("• "+t,BULL) for t in items]
def chart(key,w=CW,cap=None):
    ip=CHARTS[key]; iw,ih=PImage.open(ip).size; flow=[Image(ip,width=w,height=w*ih/iw)]
    if cap: flow.append(Paragraph(cap,SMALL))
    flow.append(Spacer(1,6)); return flow
def vtable(headers,rows,colw,fs=7.4,colorize=True,left_cols=(0,)):
    data=[[Paragraph(str(x),CELLH) for x in headers]]
    style=[("BACKGROUND",(0,0),(-1,0),rNAVY),("GRID",(0,0),(-1,-1),0.4,rLINE),("VALIGN",(0,0),(-1,-1),"MIDDLE"),
     ("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3),("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4),
     ("ROWBACKGROUNDS",(0,1),(-1,-1),[rc.white,rc.HexColor("#F7FAFC")])]
    for i,rw in enumerate(rows,1):
        drow=[]
        for j,val in enumerate(rw):
            v=str(val); key=None
            for k in ("YES","PARTIAL","NO","UNKNOWN","VARIABLE"):
                if v.strip().upper().startswith(k): key=k; break
            if v.strip().upper() in ("N/A","NOT APPLICABLE"): key="UNKNOWN"
            cs=CELL
            if colorize and key and j not in left_cols:
                cs=PS(f"c{i}{j}",parent=CELL,textColor=RTX[key],fontName="Helvetica-Bold"); style.append(("BACKGROUND",(j,i),(j,i),RBG[key]))
            if j in left_cols: cs=PS(f"l{i}{j}",parent=CELL,fontName="Helvetica-Bold",textColor=rNAVY2)
            drow.append(Paragraph(v,cs))
        data.append(drow)
    t=Table(data,colWidths=colw,repeatRows=1); t.setStyle(TableStyle(style)); return t
def callout(title,text,color=rTEAL):
    tb=Table([[Paragraph(f'<b>{title}</b>',PS("ct",fontName="Helvetica-Bold",fontSize=9,textColor=color,leading=12))],
              [Paragraph(text,PS("cx",fontName="Helvetica",fontSize=8.8,textColor=rINK,leading=12.5))]],colWidths=[CW])
    tb.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),rc.HexColor("#F4F8FB")),("BOX",(0,0),(-1,-1),0.6,color),
     ("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7),("LINEBEFORE",(0,0),(0,-1),2.5,color)]))
    return tb
class Doc(BaseDocTemplate):
    def afterFlowable(self,f):
        if hasattr(f,"toc_level"): self.notify("TOCEntry",(f.toc_level,f.getPlainText(),self.page))
def _dec(canvas,doc):
    canvas.saveState(); canvas.setStrokeColor(rLINE); canvas.setLineWidth(0.5)
    canvas.line(0.8*inch,10.35*inch,7.7*inch,10.35*inch)
    canvas.setFont("Helvetica-Bold",7.5); canvas.setFillColor(rTEAL); canvas.drawString(0.8*inch,10.45*inch,"AI REVENUE RECOVERY OS")
    canvas.setFont("Helvetica",7.5); canvas.setFillColor(rMUT); canvas.drawRightString(7.7*inch,10.45*inch,"Payer API, Pricing & Payer-Side Opportunity  ·  Confidential")
    canvas.line(0.8*inch,0.62*inch,7.7*inch,0.62*inch); canvas.drawString(0.8*inch,0.45*inch,"Prepared for AI Revenue Recovery OS  ·  "+DATE)
    canvas.drawRightString(7.7*inch,0.45*inch,"Page %d"%doc.page); canvas.restoreState()
frame=Frame(0.8*inch,0.75*inch,6.9*inch,9.5*inch,id="m")
doc=Doc(PDF,pagesize=letter,leftMargin=0.8*inch,rightMargin=0.8*inch,topMargin=0.95*inch,bottomMargin=0.85*inch,
    title="AI Revenue Recovery OS — U.S. Payer API, Pricing & Payer-Side Feasibility",author="AI Revenue Recovery OS")
doc.addPageTemplates([PageTemplate(id="cover",frames=[frame]),PageTemplate(id="body",frames=[frame],onPage=_dec)])

story=[]
# COVER
story+=[Spacer(1,1.05*inch)]
story.append(Paragraph("U.S. Payer API, Pricing<br/>&amp; Payer-Side Opportunity",PS("tt",fontName="Helvetica-Bold",fontSize=29,leading=35,textColor=rNAVY)))
story.append(Spacer(1,8)); story.append(Paragraph("A Two-Sided Feasibility Study",PS("tt2",fontName="Helvetica",fontSize=15,textColor=rTEAL))); story.append(Spacer(1,10))
story.append(HRFlowable(width=CW,thickness=2,color=rTEAL,spaceAfter=12))
story.append(Paragraph("Provider / RCM workflows &nbsp;·&nbsp; Payer-side claims intelligence &nbsp;·&nbsp; API pricing &nbsp;·&nbsp; Payer guidelines &nbsp;·&nbsp; Payment integrity &nbsp;·&nbsp; Regulatory models",PS("st",fontName="Helvetica",fontSize=10.5,leading=16,textColor=rTEAL)))
story.append(Spacer(1,40))
meta=Table([[Paragraph("PREPARED FOR",EY),Paragraph("<b>AI Revenue Recovery OS</b>",BODYL)],
 [Paragraph("DATE",EY),Paragraph(DATE,BODYL)],
 [Paragraph("SCOPE",EY),Paragraph("Can we start provider-side on existing APIs/clearinghouses, and become a payer-side claims intelligence &amp; operations platform? Data availability, source, standard, pricing, enrollment, and legal/operational boundaries.",BODYL)],
 [Paragraph("CLASSIFICATION",EY),Paragraph("Confidential · Investor & product/engineering feasibility · Not legal advice",BODYL)]],colWidths=[1.4*inch,5.5*inch])
meta.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),("LINEBELOW",(0,0),(-1,-2),0.4,rLINE)]))
story.append(meta); story.append(Spacer(1,34))
story.append(callout("Disclosures",
 "Evidence-backed from official CMS / X12 / HL7 / CAQH / eCFR / NAIC and vendor documentation (research August 2026). Values are YES / NO / PARTIAL / UNKNOWN / VARIABLE. Free sandbox is never equated with free production; direct payer API never with clearinghouse connectivity. No pricing is invented. Payer-side sections describe the regulatory landscape and are <b>not legal advice</b> — Models B/C require regulatory/legal review. No PHI."))
story.append(NextPageTemplate("body")); story.append(PageBreak())
# TOC
story.append(Paragraph("Contents",H1)); toc=TableOfContents()
toc.levelStyles=[PS("t0",fontName="Helvetica-Bold",fontSize=10,leading=17,textColor=rNAVY),PS("t1",fontName="Helvetica",fontSize=9,leading=14,textColor=rINK,leftIndent=14)]
story.append(toc); story.append(PageBreak())

def sec(t): story.append(h1(t))
def sub(t): story.append(h2(t))

# 1 EXEC SUMMARY
sec("1. Executive Summary")
story.append(para("This study extends the provider-side payer-API feasibility analysis to a <b>two-sided</b> question: can AI Revenue Recovery OS begin as a provider/RCM platform on existing APIs and clearinghouses, and evolve into a payer-side claims-intelligence and operations platform? The short answer is <b>yes, with conditions</b>.",BODYL))
story+=chart("twosided",cap="Figure 1. The two-sided model — one orchestration + payer-intelligence core serving provider-side RCM workflows and payer-side claims operations.")
story.append(callout("Final answer — YES, WITH CONDITIONS",
 "Provider-side is buildable now on clearinghouse APIs, with a near-$0 MVP via free sandboxes and Stedi's free production tier. The payer side is a real, large opportunity as <b>Model A</b> (SaaS decision-support) and <b>Model B</b> (administrative services); <b>Model C</b> (delegated claims/UM/payment decisions) is a long-term, heavily-regulated frontier. Across every model, <b>final medical-necessity / coverage decisions cannot be made by AI alone</b> — a qualified clinician must own any adverse determination (CMS-4201-F for Medicare Advantage; California SB 1120)."))
story.append(PageBreak())

# 2 METHODOLOGY
sec("2. Research Methodology")
story.append(para("Primary sources first: CMS (rules, fact sheets, appeals, Medicare Coverage Database), eCFR (Titles 42/29/45), NAIC (TPA model), URAC/NCQA (UM accreditation), ASC X12, HL7 (FHIR / Da Vinci / CARIN), CAQH, and vendor developer/pricing documentation. Trade press only corroborates figures.",BODYL))
story+=bullets([
 "Values are YES / NO / PARTIAL / UNKNOWN / <b>VARIABLE</b> (used for contract/plan/state-dependent payer rules). Never forced binaries.",
 "Distinctions preserved: standard vs electronic vs API vs public vs free-sandbox vs free-production vs paid; and direct payer API vs clearinghouse connectivity.",
 "Scores (payer-side opportunity, automation readiness) are <i>our</i> analytical constructs, not industry standards.",
 "Payer-side legal/regulatory content is a sourced landscape overview, <b>not legal advice</b>; it flags where regulatory/legal review is required.",
 "Coverage limitation: 43 payer organizations are representative, not exhaustive; open items are enumerated in the Research Gaps appendix.",
])
story.append(PageBreak())

# 3 PROVIDER-SIDE (condensed)
sec("3. Provider-Side Workflows")
story.append(para("The provider-side foundation is established (see the companion feasibility report for the full 113-field payer matrix). In summary, the standardized transactions are reachable today via clearinghouse APIs; prior authorization and appeals are the human-heavy frontier.",BODYL))
story.append(vtable(["Workflow","Standard","API today","Free path","Build status"],
 [["Eligibility","270/271","YES (clearinghouse)","Stedi free tier","GREEN"],
  ["Benefits","271 (CORE)","YES","Stedi/Optum","GREEN"],
  ["Claim Status","276/277","YES","Stedi free tier","GREEN"],
  ["Claims (837)","837P/I/D","YES","Stedi/Optum/Availity","GREEN"],
  ["Denials (835)","835 + CARC/RARC","YES","Stedi (enroll)","GREEN"],
  ["Patient Responsibility","271 + calc","PARTIAL (own engine)","N/A","YELLOW"],
  ["Prior Authorization","278 / FHIR PAS","PARTIAL (2027 FHIR)","Availity/portal","ORANGE"],
  ["Appeals","(no standard)","PARTIAL (payer-specific)","portal/fax/mail","RED"]],
 [1.7*inch,1.3*inch,1.6*inch,1.4*inch,0.9*inch],colorize=True,left_cols=(0,1)))
story.append(PageBreak())

# 4 API LANDSCAPE
sec("4. API Landscape")
story.append(para("The per-API inventory (Excel: API MASTER) records each API separately with its standard, direct-vs-intermediary status, sandbox/production, pricing and enrollment. The pattern: connectivity is intermediated by clearinghouses; direct free provider-facing payer APIs are the exception.",BODYL))
rows=[[a["provider"],a["api_name"],a["workflow"],a["standard"],("Direct" if a["direct"]=="YES" else "Interm."),a["free_sandbox"],a["free_prod"],a["conf"]] for a in R2.API_MASTER[:14]]
story.append(vtable(["Provider","API","Workflow","Standard","Type","Free Sandbox","Free Prod","Conf"],rows,
 [0.95*inch,1.35*inch,1.15*inch,1.0*inch,0.7*inch,0.75*inch,0.7*inch,0.5*inch],fs=6.8,left_cols=(0,1,2,3,4,7)))
story.append(Spacer(1,4)); story.append(para("Full inventory (18 APIs incl. CMS Blue Button 2.0, DPC, AB2D, NPPES and payer Patient/Provider Access FHIR) is in the workbook.",SMALL))
story.append(PageBreak())

# 5 PRICING LANDSCAPE
sec("5. Pricing Landscape")
story.append(para("The investor question — are the APIs free? — resolves precisely: free sandboxes are common; a free production tier is rare (Stedi, and CMS's patient-authorized Medicare APIs). Optum and Availity gate production behind contracts; Waystar is enterprise. No per-transaction price is invented — where sales-gated, it is recorded 'not publicly disclosed'.",BODYL))
story+=chart("apicompare",cap="Figure 2. Free sandbox vs free production vs self-serve production across leading API providers.")
story.append(callout("Do not conflate",
 "'Free sandbox' ≠ 'free production API'. 'Clearinghouse supports payer X' ≠ 'payer X provides an API'. 'Patient Access FHIR' ≠ 'provider RCM feed'. Each is a separate field in the database."))
story.append(PageBreak())

# 6 FREE MVP STACK
sec("6. Free MVP API Stack")
story.append(para("A genuine $0 build/test MVP is achievable by combining synthetic data, public FHIR test servers, CMS sandboxes and free provider/coverage data. Real production payer transactions still require enrollment and — beyond Stedi's free tier — usage fees.",BODYL))
rows=[[f[0],f[1],f[3],f[4],f[5]] for f in R2.FREE_STACK]
story.append(vtable(["Resource","Provider","Free?","Sandbox/Production","Limits"],rows,[1.5*inch,0.95*inch,0.6*inch,1.55*inch,2.3*inch],fs=6.9,left_cols=(0,1,2)))
story.append(Spacer(1,4)); story.append(para(R2.FREE_STACK_NOTE,SMALL))
story.append(PageBreak())

# 7 PRODUCTION STACK
sec("7. Production API Stack")
story.append(para("Recommended production connectivity per capability. The principle: one clearinghouse integration reaches thousands of payers; add payer FHIR selectively (2027 Provider Access), and keep portal/voice/human as fallback.",BODYL))
story.append(vtable(["Capability","Recommended (why)","Fallback"],
 [["Eligibility / Benefits","Stedi (self-serve, free tier, JSON+X12)","Optum · Availity"],
  ["Claim Status","Stedi (real-time)","Optum · portal · voice"],
  ["Claims (837)","Stedi / Optum (broad reach)","Availity"],
  ["ERA / Denials (835)","Stedi (+ per-payer enrollment)","Zelis (payments)"],
  ["Prior Authorization","Availity (278 + FHIR PA); payer portals","Voice; FHIR PAS (2027)"],
  ["FHIR / member data","Payer Patient Access; CMS Blue Button","Provider Access API (2027)"],
  ["Attachments","Optum (275)","Da Vinci CDex (emerging)"],
  ["Broad payer connectivity","Optum/Change (widest) + Availity (Blues)","Waystar (enterprise)"]],
 [1.6*inch,3.1*inch,2.2*inch],colorize=False,left_cols=(0,1,2)))
story.append(PageBreak())

# 8 PAYER-SIDE OPPORTUNITY
sec("8. Payer-Side Opportunity")
story.append(para("Beyond serving providers and RCM BPOs, AI Revenue Recovery OS could serve <b>payers</b>. We scored ten payer-side workflows on market, feasibility, API availability, regulatory complexity, integration, human dependency, AI opportunity and revenue potential. The sweet spot is <b>low-regulatory, high-AI</b> work — claim intake/validation, payment integrity, and provider communication — delivered first as decision-support (Model A).",BODYL))
story+=chart("payerside",cap="Figure 3. Payer-side opportunity scores (our analytical composite). Green = HIGH, amber = MEDIUM, red = LOW.")
story+=chart("regscatter",cap="Figure 4. Regulatory complexity vs AI opportunity (bubble = revenue potential). Start where regulation is low and AI leverage is high.")
story.append(PageBreak())

# 9 PAYMENT INTEGRITY
sec("9. Payment Integrity")
story.append(para("Payment integrity — prepay/postpay review, overpayment/duplicate detection, DRG validation, coordination-of-benefits and fraud/waste/abuse — is the highest-scoring payer-side wedge, and a large, consolidating market. A new entrant needs a specific wedge (a claim type, clean prepay integration, or an orchestration/operating-system play), not head-on breadth.",BODYL))
story.append(vtable(["Vendor","Category","Orientation"],[[p[0],p[1],p[3]] for p in R2.PAYMENT_INTEGRITY],[1.5*inch,2.9*inch,2.5*inch],colorize=False,left_cols=(0,1,2)))
story.append(Spacer(1,4)); story.append(para(R2.PI_MARKET_NOTE,SMALL))
story.append(PageBreak())

# 10 COMPETITIVE LANDSCAPE
sec("10. Competitive Landscape")
story.append(para("The landscape splits by orientation: payer-side decisioning (Cohere, Anterior), provider-side submission (Develop Health, Myndshft), connecting networks (Availity, Rhyme), and provider-side RCM AI (Waystar, Adonis, Candid, Infinitus, Fathom). CMS-0057-F FHIR prior-auth (2027) is a tailwind shaping all of them.",BODYL))
story.append(vtable(["Company","Category","Side"],[[c[0],c[1],c[3]] for c in R2.COMPETITORS],[1.7*inch,3.0*inch,1.2*inch],colorize=False,left_cols=(0,1,2)))
story.append(PageBreak())

# 11 PAYER GUIDELINES
sec("11. Payer Guidelines")
story.append(para("Provider guidelines — timely filing, appeal deadlines and submission methods — are a critical operational input. The key finding: <b>commercial windows are contract/plan/state-variable</b> (documented range ~90 days to 12–18 months) and must be stored as configurable values, never hard-coded. Only the government frameworks are fixed rules.",BODYL))
story.append(vtable(["Payer","Timely Filing","Appeal Deadline","Method","Conf"],
 [[g[0],g[1],g[2],g[3],g[5]] for g in R2.PAYER_GUIDELINES],[1.35*inch,1.7*inch,1.9*inch,1.35*inch,0.6*inch],fs=6.8,left_cols=(0,1,2,3,4)))
story.append(Spacer(1,4)); story.append(para("CY2026 Medicare appeal amount-in-controversy thresholds: $200 (ALJ), $1,960 (federal court). The Part C IRE changed from Maximus to C2C Innovative Solutions effective May 1, 2026.",SMALL))
story.append(PageBreak())

# 12 COVERAGE POLICIES
sec("12. Coverage Policies")
story.append(para("Coverage/medical-necessity policy is retrievable and, for CMS, highly machine-mappable. CMS NCDs and LCDs (with coding Articles) live in the free Medicare Coverage Database and map to CPT/HCPCS/ICD-10 — the richest free source for denial-prevention logic. Commercial medical policies (e.g., Aetna CPBs, UHC policies) are retrievable but non-uniform. InterQual (Optum) and MCG (Hearst) UM criteria are <b>license-gated</b> — budget for licensing, not scraping.",BODYL))
story.append(vtable(["Policy source","Code-mappable","Access"],[[c[0],c[2],c[3]] for c in R2.COVERAGE_POLICIES],[2.2*inch,2.1*inch,2.6*inch],colorize=False,left_cols=(0,)))
story.append(callout("Boundary",
 "AI can retrieve, parse and map coverage policy to codes for denial-prevention (provider-side) and decision-support (payer-side). It cannot be the sole basis for a final medical-necessity determination — a qualified clinician must make and own any adverse decision."))
story.append(PageBreak())

# 13 CMS / MEDICARE / MEDICAID
sec("13. CMS, Medicare & Medicaid")
story.append(para("The programs must not be conflated. Medicare FFS, Medicare Advantage, Medicaid (FFS and managed care), CHIP and QHPs each carry distinct rules, appeal ladders and interoperability obligations.",BODYL))
story.append(vtable(["Program","Appeal ladder"],[[a[0],a[1]] for a in R2.APPEAL_FRAMEWORKS],[1.6*inch,5.3*inch],colorize=False,left_cols=(0,1)))
story.append(Spacer(1,6))
story.append(para("Under <b>CMS-0057-F</b>, CMS-regulated payers (MA, Medicaid & CHIP, FFE QHPs) must implement FHIR Patient Access (enhanced), Provider Access, Payer-to-Payer and Prior Authorization APIs — API build-out generally due <b>Jan 1, 2027</b>; operational PA rules (72-hour expedited / 7-day standard; specific denial reason; public metrics) from <b>Jan 1, 2026</b>. It does not apply to commercial/employer (ERISA) plans and does not make eligibility API-only.",BODYL))
story.append(PageBreak())

# 14 FHIR & EDI
sec("14. FHIR & EDI Standards")
sub("14.1 FHIR resources")
story.append(vtable(["Resource / API","Rule","Status","RCM relevance"],[[f[0],f[1],f[4],f[5]] for f in R2.FHIR_RESOURCES],[1.9*inch,1.2*inch,1.0*inch,2.8*inch],colorize=False,left_cols=(0,1,2,3)))
sub("14.2 EDI (X12) matrix")
story.append(vtable(["X12","Purpose","HIPAA","Clearinghouse dep."],[[e[0],e[1],e[3],e[5]] for e in R2.EDI_MATRIX],[0.8*inch,2.6*inch,1.6*inch,1.9*inch],colorize=False,left_cols=(0,1,2)))
sub("14.3 Attachments")
story.append(para("Claim/PA supporting documentation moves via the legacy <b>X12 275</b> ('Additional Information') or the emerging FHIR <b>Da Vinci CDex</b> ($submit-attachment). There is no finalized federal claims-attachments mandate (status UNKNOWN); CDex adoption is early. AI can identify missing documents, classify and extract, associate to claims, and route — a strong near-term capability.",BODYL))
story.append(PageBreak())

# 15 REGULATORY MODELS
sec("15. Regulatory Models & 'Billing on Behalf of Payers'")
story.append(para("Doing claims/denial/UM/appeal work for payers spans a spectrum. Obligations attach to <b>who exercises discretion</b>: as a vendor moves from decision-support to delegated decision-making, it progressively becomes the regulated actor (TPA, UR agent, potential ERISA fiduciary, MA/Medicaid FDR/subcontractor).",BODYL))
story+=chart("models",cap="Figure 5. Three models of payer-side engagement — regulatory exposure rises A → B → C.")
for topic,note,srcids in R2.REG_NOTES:
    story.append(Paragraph(f"<b>{topic}.</b> {note}",PS("rn",fontName="Helvetica",fontSize=8.6,leading=12,textColor=rINK,spaceAfter=5,leftIndent=4)))
story.append(callout("Not legal advice — review required",
 "Model A (SaaS decision-support under a BAA) is the startup-appropriate entry. Models B and C likely trigger state TPA licensing, UR/UM accreditation and clinician-review requirements, MA (42 CFR 422)/Medicaid (42 CFR 438) delegation and FDR oversight, and potential ERISA fiduciary status. AI cannot make final medical-necessity/coverage decisions alone (CMS-4201-F; CA SB 1120). Each payer-side model requires comprehensive regulatory/legal review.",color=rRED))
story.append(PageBreak())

# 16 BUILD BUY PARTNER
sec("16. Build / Buy / Partner")
story.append(vtable(["Capability","Decision","Rationale"],[list(x) for x in R2.BUILD_BUY_PARTNER],[1.9*inch,1.5*inch,3.5*inch],colorize=False,left_cols=(0,1)))
story.append(PageBreak())

# 17 ARCHITECTURE
sec("17. Recommended Architecture")
story.append(para("One Payer-Intelligence + Orchestration core serves both sides, selecting the cheapest sufficient channel per payer and workflow — EDI → API/FHIR → Portal → Voice → Human — with human exception handling and full audit. Provider-side capabilities ship first; payer-side capabilities layer on as decision-support (Model A) and administrative services (Model B).",BODYL))
story+=chart("twosided",cap="Figure 6. Two-sided architecture over existing connectivity, with the proprietary intelligence + orchestration layer as the moat.")
story.append(PageBreak())

# 18 ROADMAP
sec("18. Product Roadmap")
story+=chart("roadmap",cap="Figure 7. MVP → V4. Provider-side first on free/low-cost APIs; payer-side as decision-support; delegated payer operations only where legally/contractually feasible.")
story+=bullets([
 "<b>MVP:</b> Eligibility + Benefits + Claim Status (clearinghouse API; Stedi free tier → near-$0).",
 "<b>V1:</b> + Denial intelligence (835), Prior-auth intelligence, Patient-responsibility estimation.",
 "<b>V2:</b> + Appeals orchestration, Payer Intelligence layer (the moat).",
 "<b>V3:</b> Payer-side claims-support / payment-integrity / denial-support as Model A decision-support (legal review).",
 "<b>V4:</b> Delegated payer operations (Model C) only where legally and contractually feasible.",
])
story.append(PageBreak())

# 19 RISKS
sec("19. Risks & Regulatory Considerations")
story+=bullets([
 "<b>Pricing opacity.</b> Exact clearinghouse per-transaction pricing is behind calculators/contracts — model economics only after capturing real numbers.",
 "<b>Payer-side regulation.</b> Models B/C likely require TPA licensing, UM accreditation and clinician review; multi-state and fact-specific. Legal review required before any delegated function.",
 "<b>AI-decision limits.</b> CMS-4201-F and CA SB 1120 (and a growing multi-state trend) bar AI-alone medical-necessity decisions — architect human-in-the-loop from day one.",
 "<b>Guideline variability.</b> Commercial timely-filing/appeal windows are contract/plan/state-variable — store as configurable values, never hard-coded.",
 "<b>Coverage-content licensing.</b> InterQual/MCG are license-gated; budget for licensing rather than scraping.",
 "<b>Competitive consolidation.</b> Payment integrity is consolidating (New Mountain, Cotiviti, Optum) — enter with a wedge, not breadth.",
 "<b>Coverage limitation.</b> 43 orgs are representative; several data points are UNKNOWN/VARIABLE pending per-payer/state verification (Research Gaps appendix).",
])
story.append(PageBreak())

# 20 CONCLUSION
sec("20. Conclusion")
story.append(para("AI Revenue Recovery OS can realistically <b>start as a provider/RCM-side platform</b> using existing healthcare APIs and clearinghouses — with a near-$0 MVP — and <b>eventually become a payer-side claims intelligence and operations platform</b>. The provider side is a build-and-integrate problem largely solved by clearinghouse infrastructure; the durable asset is the Payer-Intelligence + Orchestration layer. The payer side is a large adjacent opportunity, best entered as decision-support and administrative services, with delegated decisioning reserved for a later, carefully-regulated stage.",BODYL))
story.append(callout("Final answer",
 "<b>YES, WITH CONDITIONS.</b> Provider-side now on existing rails; payer-side as Model A/B decision-support and administrative services; Model C (delegated claims/UM/payment) long-term and only after comprehensive regulatory/legal review. Final medical-necessity/coverage decisions remain with qualified clinicians — AI assists, humans decide."))
story.append(PageBreak())

# APPENDIX A payer-side scores
sec("Appendix A. Payer-Side Opportunity Scores")
story.append(vtable(["Payer-side workflow","Score","Band","Model"],[[x[0],x[1],x[2],x[3]] for x in PS_SCORED],[2.6*inch,0.7*inch,1.0*inch,2.6*inch],colorize=False,left_cols=(0,1,3)))
story.append(PageBreak())
# APPENDIX B sources
sec("Appendix B. Sources")
srows=[[v[0],v[2],v[3]] for v in ALLSRC.values()]
story.append(vtable(["Source","Type","Confidence"],srows,[4.6*inch,1.3*inch,1.0*inch],colorize=False,left_cols=(0,)))
story.append(Spacer(1,6)); story.append(para("Full URLs are hyperlinked in the Excel SOURCES sheet. Primary hubs: cms.gov, ecfr.gov (Titles 42/29/45), x12.org, hl7.org, caqh.org, naic.org, and vendor developer/pricing portals.",SMALL))
story.append(PageBreak())
# APPENDIX C gaps
sec("Appendix C. Research Gaps")
story.append(para("Explicitly enumerated coverage limitations requiring primary-source or per-payer/state verification before production commitments:",BODYL))
story+=bullets([
 "Exact clearinghouse per-transaction pricing (Stedi calculator; Optum/Availity quotes).",
 "Commercial timely-filing / appeal deadlines — contract/plan/state-variable; UHC/Anthem have no single value.",
 "Payment-integrity market size — firm estimates vary widely; cite a range.",
 "Payer-side regulatory specifics (TPA/UM/ERISA) — state-by-state; legal review required.",
 "FHIR versions & Provider Access readiness — R4 implied; 2027 APIs not yet live.",
 "InterQual/MCG licensing terms — proprietary, not public.",
 "DPC production paused; Logica retiring to Meld — verify current status.",
 "Full payer universe — 43 orgs representative, not exhaustive (thousands of payer IDs).",
])
story.append(Spacer(1,8))
story.append(para("<b>Research coverage limitation.</b> This is a feasibility analysis from public documentation, not legal advice. Payer-side models B and C, and any delegated function, require comprehensive regulatory/legal review before commitment.",SMALL))

doc.multiBuild(story)
import re as _re
_pdf=open(PDF,"rb").read(); print("PDF pages:",len(_re.findall(rb"/Type\s*/Page[^s]",_pdf)))
print("\n=== VALIDATION ===")
print("PDF:",PDF)
print("XLSX:",XLSX,"->",len(wb.sheetnames),"sheets")
print("CSVs:","PayerMaster",PM.shape,"| APIMaster",AM.shape,"| Guidelines",PG.shape)
print("No-PHI: organizational/API/regulatory content only.")


