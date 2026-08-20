# -*- coding: utf-8 -*-
"""
Build the Clearinghouse API & Healthcare Connectivity deliverables:
  - AI_Revenue_Recovery_OS_Clearinghouse_API_Report.pdf   (investor/technical, 25-40 pp)
  - AI_Revenue_Recovery_OS_Clearinghouse_API_Data.xlsx    (12 sheets, research-ready)

Sourced 2026 figures; quote-only items recorded "QUOTE REQUIRED — not publicly
disclosed" and never invented. No PHI. HIPAA-*aligned* (not "certified").
Reuses the proven reportlab / matplotlib / openpyxl harness from build_costmodel.py.
"""
import os
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

import clearinghouse_data as D

OUT=os.path.dirname(os.path.abspath(__file__))
ASSET=os.path.join(OUT,"_assets4"); os.makedirs(ASSET,exist_ok=True)
DATE=D.REPORT_DATE

# palette (consistent with prior deliverables)
NAVY="#0C1B30"; NAVY2="#13253F"; TEAL="#118C7E"; TEAL_L="#2FBFA6"; CYAN="#2E7FC2"
INK="#1a2433"; MUT="#6B7B90"; LINE="#D5DEE8"; GREEN="#2E9E6B"; AMBER="#D8942A"
REDX="#C7503F"; GREY="#95A3B4"; VIOLET="#6C5CE0"; ORANGE="#C77B2E"
plt.rcParams.update({"font.family":"DejaVu Sans","font.size":9,"axes.edgecolor":LINE,
 "axes.linewidth":.8,"figure.dpi":150,"savefig.dpi":150,"text.color":INK,
 "axes.labelcolor":INK,"xtick.color":MUT,"ytick.color":MUT})
def _s(ax):
    for sp in ["top","right"]: ax.spines[sp].set_visible(False)
    ax.tick_params(length=0)
def _save(name):
    p=os.path.join(ASSET,name); plt.savefig(p,bbox_inches="tight",dpi=150); plt.close(); return p

# ======================================================================
# CHARTS
# ======================================================================
def ch_scenario_cost():
    rows=D.scenario_table()
    fig,ax=plt.subplots(figsize=(8.6,3.9)); _s(ax)
    x=range(len(rows)); labels=[f"{r['claims']//1000}k" for r in rows]
    ch=[r["clearinghouse"] for r in rows]; vo=[r["voice"] for r in rows]; hu=[r["human"] for r in rows]
    import numpy as np
    ch=np.array(ch); vo=np.array(vo); hu=np.array(hu)
    ax.bar(x,ch,label="Clearinghouse (EDI/API)",color=TEAL)
    ax.bar(x,vo,bottom=ch,label="AI Voice",color=CYAN)
    ax.bar(x,hu,bottom=ch+vo,label="Human exceptions",color=AMBER)
    ax.set_xticks(list(x)); ax.set_xticklabels(labels); ax.set_xlabel("Claims / month")
    ax.set_ylabel("Monthly connectivity cost (USD)")
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda v,_:f"${v/1000:.0f}k"))
    ax.legend(frameon=False,fontsize=7.6,ncol=3,loc="upper left")
    ax.set_title("Connectivity cost by monthly claim volume (MODEL ASSUMPTION)",fontsize=9,loc="left",color=INK)
    return _save("scenario_cost.png")

def ch_per_claim():
    rows=D.scenario_table()
    fig,ax=plt.subplots(figsize=(8.6,2.7)); _s(ax)
    x=[f"{r['claims']//1000}k" for r in rows]; y=[r["per_claim"] for r in rows]
    ax.plot(x,y,marker="o",color=TEAL,lw=2)
    for xi,yi in zip(x,y): ax.annotate(f"${yi:.2f}",(xi,yi),textcoords="offset points",xytext=(0,7),ha="center",fontsize=7.6,color=INK)
    ax.set_ylabel("$ / claim"); ax.set_xlabel("Claims / month"); ax.set_ylim(0,max(y)*1.5)
    ax.set_title("All-in connectivity cost per claim (flat with volume; free tier lowers MVP)",fontsize=9,loc="left",color=INK)
    return _save("per_claim.png")

def ch_phase():
    p=D.phase_costs()
    fig,ax=plt.subplots(figsize=(5.4,3.2)); _s(ax)
    labels=["MVP\n(free tier)","Pilot\n(50k/mo)","Production\n(500k/mo)"]
    vals=[p["mvp"]["total"],p["pilot"]["total"],p["prod"]["total"]]
    bars=ax.bar(labels,vals,color=[GREEN,CYAN,TEAL])
    for b,v in zip(bars,vals): ax.annotate(f"${v:,.0f}",(b.get_x()+b.get_width()/2,v),textcoords="offset points",xytext=(0,4),ha="center",fontsize=7.8,color=INK)
    ax.set_ylabel("Connectivity $ / month"); ax.set_yscale("log")
    ax.set_title("MVP vs Pilot vs Production connectivity cost/month",fontsize=9,loc="left",color=INK)
    return _save("phase.png")

def ch_channel_cost():
    fig,ax=plt.subplots(figsize=(5.4,3.0)); _s(ax)
    items=list(D.CHANNEL_UNIT_COST.items())
    labels=[k for k,_ in items]; vals=[v for _,v in items]
    colors=[TEAL,TEAL_L,AMBER,CYAN,REDX]
    ax.barh(labels,vals,color=colors[:len(labels)]); ax.invert_yaxis()
    for i,v in enumerate(vals): ax.annotate(f"${v:.2f}",(v,i),textcoords="offset points",xytext=(4,0),va="center",fontsize=7.6,color=INK)
    ax.set_xlabel("Indicative $ per successful action")
    ax.set_title("Cost rises down the channel ladder — connect digitally first",fontsize=9,loc="left",color=INK)
    return _save("channel_cost.png")

# ---------- DIAGRAMS ----------
def _box(ax,x,y,w,h,t,fc=NAVY2,tc="white",fs=7.6,sub=None):
    ax.add_patch(FancyBboxPatch((x,y),w,h,boxstyle="round,pad=0.02,rounding_size=0.08",fc=fc,ec=LINE,lw=1))
    ax.text(x+w/2,y+h/2+(0.12 if sub else 0),t,ha="center",va="center",color=tc,fontsize=fs,fontweight="bold")
    if sub: ax.text(x+w/2,y+h/2-0.22,sub,ha="center",va="center",color="#C9D4E0",fontsize=6.0)
def _ar(ax,x1,y1,x2,y2,color=None):
    ax.add_patch(FancyArrowPatch((x1,y1),(x2,y2),arrowstyle="-|>",mutation_scale=9,color=color or MUT,lw=1.1))

def dg_ecosystem():
    fig,ax=plt.subplots(figsize=(8.8,4.4)); ax.axis("off"); ax.set_xlim(0,12); ax.set_ylim(0,10)
    _box(ax,4.3,8.7,3.4,1.0,"Provider / RCM",fc=TEAL,fs=9)
    _ar(ax,6,8.7,6,8.1)
    _box(ax,3.8,6.9,4.4,1.0,"Clearinghouse(s)",fc=NAVY,fs=8.4,sub="EDI routing to thousands of payers")
    for i,t in enumerate(["Stedi","Availity","Waystar","Optum/Change"]):
        _box(ax,0.4+i*2.95,5.2,2.6,0.7,t,fc="#1c3350",fs=7.2)
        _ar(ax,6,6.9,1.7+i*2.95,5.9)
    _box(ax,0.4,3.2,11.2,0.9,"U.S. Payers  (commercial · Medicare · Medicaid · MA · TPAs — thousands of payer IDs)",fc=NAVY2,fs=8)
    for i in range(4): _ar(ax,1.7+i*2.95,5.2,3+i*2.6,4.1)
    ax.text(6,2.3,"Payer connectivity ≠ full payer functionality — capability varies by payer & contract",
            ha="center",fontsize=7.4,color=MUT,style="italic")
    ax.text(6,1.4,"Direct payer APIs · FHIR (2027) · Portals · Voice · Human sit ALONGSIDE the clearinghouse, not replaced by it",
            ha="center",fontsize=7.4,color=MUT)
    return _save("dg_ecosystem.png")

def dg_orchestration():
    fig,ax=plt.subplots(figsize=(8.6,4.8)); ax.axis("off"); ax.set_xlim(0,12); ax.set_ylim(0,11)
    steps=[("EDI / X12",TEAL),("Payer / CH API",TEAL_L),("FHIR (SMART/Da Vinci)",CYAN),
           ("Portal (RPA)",AMBER),("AI Voice",ORANGE),("Human queue",REDX)]
    y=10
    for i,(t,c) in enumerate(steps):
        _box(ax,3.6,y-0.85,4.8,0.8,t,fc=c,fs=8.4,tc="#04121a" if c in (TEAL_L,AMBER) else "white")
        if i<len(steps)-1:
            _ar(ax,6,y-0.85,6,y-1.55)
            ax.text(6.7,y-1.2,"if not available →",fontsize=6.6,color=MUT,va="center")
        y-=1.65
    ax.text(0.2,10.6,"Preferred",fontsize=7.2,color=GREEN,fontweight="bold")
    ax.text(0.2,1.0,"Last resort",fontsize=7.2,color=REDX,fontweight="bold")
    ax.text(6,0.2,"\"Don't call when you can connect digitally.\"",ha="center",fontsize=8.2,color=INK,fontweight="bold")
    return _save("dg_orchestration.png")

def dg_architecture():
    fig,ax=plt.subplots(figsize=(9.0,5.4)); ax.axis("off"); ax.set_xlim(0,12); ax.set_ylim(0,12)
    _box(ax,4.2,11,3.6,0.85,"AI REVENUE RECOVERY OS",fc=TEAL,fs=9)
    _ar(ax,6,11,6,10.5)
    _box(ax,3.9,9.5,4.2,0.85,"CONNECTIVITY ENGINE",fc=TEAL_L,fs=8.6,tc="#04121a",sub="AI connectivity orchestrator")
    cols=[("CLEARINGHOUSE","EDI / X12",NAVY),("PAYER APIs","REST / OAuth",NAVY),("FHIR","SMART / Da Vinci",NAVY)]
    for i,(t,s,c) in enumerate(cols):
        _box(ax,0.5+i*3.9,7.7,3.4,0.9,t,fc=c,fs=8,sub=s)
        _ar(ax,6,9.5,2.2+i*3.9,8.6)
    _box(ax,3.9,6.2,4.2,0.8,"PORTALS (RPA)",fc="#1c3350",fs=7.8)
    for i in range(3): _ar(ax,2.2+i*3.9,7.7,6,7.0)
    _ar(ax,6,6.2,6,5.7); _box(ax,3.9,4.9,4.2,0.8,"AI VOICE",fc=ORANGE,fs=7.8,tc="#04121a")
    _ar(ax,6,4.9,6,4.4); _box(ax,3.9,3.6,4.2,0.8,"HUMAN",fc=REDX,fs=7.8)
    _ar(ax,6,3.6,6,3.1)
    _box(ax,3.9,2.3,4.2,0.8,"RESULT → AI WORKFLOW",fc=NAVY2,fs=7.8)
    _ar(ax,6,2.3,6,1.8); _box(ax,3.9,1.0,4.2,0.8,"REVENUE ACTION",fc=TEAL,fs=8)
    ax.text(0.2,0.3,"Intelligence plane: Payer policy RAG · denial/appeal reasoning · estimate engine · cross-channel tracking · audit · tenant isolation",
            fontsize=6.4,color=MUT)
    return _save("dg_architecture.png")

def dg_workflow(name,title,stages):
    fig,ax=plt.subplots(figsize=(8.8,2.4)); ax.axis("off"); ax.set_xlim(0,12); ax.set_ylim(0,4)
    n=len(stages); w=11.4/n
    for i,(t,c) in enumerate(stages):
        _box(ax,0.3+i*w,1.3,w-0.25,1.3,t,fc=c,fs=7.4,tc="#04121a" if c in (TEAL_L,AMBER) else "white")
        if i<n-1: _ar(ax,0.3+(i+1)*w-0.2,1.95,0.3+(i+1)*w,1.95)
    ax.text(0.3,3.4,title,fontsize=8.4,color=INK,fontweight="bold")
    return _save(name)

def build_charts():
    CH={}
    CH["scenario"]=ch_scenario_cost(); CH["perclaim"]=ch_per_claim(); CH["phase"]=ch_phase()
    CH["channel"]=ch_channel_cost()
    CH["ecosystem"]=dg_ecosystem(); CH["orchestration"]=dg_orchestration(); CH["architecture"]=dg_architecture()
    CH["wf_elig"]=dg_workflow("wf_elig.png","Eligibility (270 → 271)",
        [("Provider",NAVY),("270 inquiry",TEAL),("Clearinghouse",NAVY2),("Payer",CYAN),("271 response",TEAL_L),("Estimate engine",AMBER)])
    CH["wf_claim"]=dg_workflow("wf_claim.png","Claim submission (837 → 277CA → 835)",
        [("Provider",NAVY),("837 claim",TEAL),("Clearinghouse",NAVY2),("Payer",CYAN),("277CA ack",TEAL_L),("835 ERA",AMBER)])
    CH["wf_status"]=dg_workflow("wf_status.png","Claim status (276 → 277)",
        [("Trigger",NAVY),("276 inquiry",TEAL),("Clearinghouse",NAVY2),("Payer",CYAN),("277 status",TEAL_L),("AI triage",AMBER)])
    CH["wf_denial"]=dg_workflow("wf_denial.png","Denial workflow (835 → reasoning → appeal)",
        [("835 CARC/RARC",TEAL),("AI root-cause",TEAL_L),("Payer policy RAG",CYAN),("Recovery/appeal",AMBER),("Human approve",REDX)])
    CH["wf_pa"]=dg_workflow("wf_pa.png","Prior authorization (278 / FHIR PAS)",
        [("CRD: needed?",TEAL),("DTR: docs",TEAL_L),("278 / PAS submit",CYAN),("Payer decision",AMBER),("Portal/voice follow-up",REDX)])
    CH["wf_voice"]=dg_workflow("wf_voice.png","AI voice fallback (only when digital fails)",
        [("Digital fails",REDX),("AI voice call",ORANGE),("Payer IVR/rep",CYAN),("Capture outcome",TEAL_L),("AI workflow",TEAL)])
    return CH

CH=build_charts()
print("charts:",len(CH))

def S(sid):
    """source label+url helper -> 'Label' with url appended in workbook."""
    lbl,url,date,conf=D.SOURCES[sid]; return lbl,url,date,conf

# ======================================================================
# EXCEL  (12 sheets, research-ready)
# ======================================================================
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

XLSX=os.path.join(OUT,"AI_Revenue_Recovery_OS_Clearinghouse_API_Data.xlsx")
HFILL=PatternFill("solid",fgColor="0C1B30"); HFONT=Font(color="FFFFFF",bold=True,size=10)
TFONT=Font(color="0C1B30",bold=True,size=15); SFONT=Font(color="118C7E",bold=True,size=11)
THIN=Side(style="thin",color="D5DEE8"); BORDER=Border(left=THIN,right=THIN,top=THIN,bottom=THIN)
WRAP=Alignment(wrap_text=True,vertical="top")
CHIP={"YES":"E7F4EC","NO":"FBE9E7","PARTIAL":"FFF4E0","PAYER DEPENDENT":"FFF4E0","DATA ONLY":"E8EEF7",
      "UNKNOWN":"EEF1F5","QUOTE REQUIRED":"EFEAF9","VARIABLE":"FFF4E0"}
def hdr(ws,row,n):
    for c in range(1,n+1):
        cc=ws.cell(row=row,column=c); cc.fill=HFILL; cc.font=HFONT
        cc.alignment=Alignment(wrap_text=True,vertical="center"); cc.border=BORDER
    ws.freeze_panes=ws.cell(row=row+1,column=1); ws.auto_filter.ref=f"A{row}:{get_column_letter(n)}{row}"
    ws.row_dimensions[row].height=28
def titleblk(ws,title,sub=None,note=None):
    ws["A1"]=title; ws["A1"].font=TFONT; r=2
    if sub: ws[f"A{r}"]=sub; ws[f"A{r}"].font=SFONT; r+=1
    if note: ws[f"A{r}"]=note; ws[f"A{r}"].font=Font(italic=True,color="6B7B90",size=9); ws[f"A{r}"].alignment=WRAP; r+=1
    return r+1
def table(ws,start,headers,rows,widths=None,link_col=None,chip_cols=()):
    for j,h in enumerate(headers,1): ws.cell(row=start,column=j,value=h)
    hdr(ws,start,len(headers))
    for i,rw in enumerate(rows,start+1):
        for j,val in enumerate(rw,1):
            c=ws.cell(row=i,column=j,value=val); c.border=BORDER; c.alignment=WRAP
            if j in chip_cols and isinstance(val,str):
                key=val.split(" —")[0].strip().upper()
                for k,col in CHIP.items():
                    if key.startswith(k): c.fill=PatternFill("solid",fgColor=col); break
            if link_col and j==link_col and isinstance(val,str) and val.startswith("http"):
                c.hyperlink=val; c.font=Font(color="2E7FC2",underline="single",size=9)
    if widths:
        for j,w in enumerate(widths,1): ws.column_dimensions[get_column_letter(j)].width=w
    return start+len(rows)+1
def sh(name): return wb.create_sheet(name)

wb=Workbook(); wb.remove(wb.active)

# 1 CLEARINGHOUSE COMPARISON
ws=sh("Clearinghouse Comparison")
s=titleblk(ws,"Clearinghouse comparison","Self-serve API · pricing · payer network  ·  "+DATE,
 "QUOTE REQUIRED = pricing not publicly disclosed (never invented). conf = confidence.")
rows=[[n,d["kind"],d["self_serve"],d["sandbox"],d["pricing"],d["payers"],d["conf"]] for n,d in D.CLEARINGHOUSES.items()]
table(ws,s,["Clearinghouse","Type","Self-serve API","Sandbox","Pricing","Payer network","Confidence"],rows,
 widths=[24,30,34,40,52,34,14])

# 2 PRICING
ws=sh("Pricing")
s=titleblk(ws,"Pricing detail (2026)",note="Publicly-disclosed figures cited; undisclosed = QUOTE REQUIRED. Source URLs at right.")
rows=[]
for n,d in D.CLEARINGHOUSES.items():
    lbl,url,date,conf=S(d["src"])
    rows.append([n,d["free"],d["pricing"],d["enroll"],url])
table(ws,s,["Clearinghouse","What's free","Pricing model","Enrollment","Source URL"],rows,
 widths=[22,40,58,40,50],link_col=5)

# 3 EDI TRANSACTIONS
ws=sh("EDI Transactions")
s=titleblk(ws,"EDI / X12 transaction matrix",note="Purpose in plain language. Availability/payer-dependency are typical, not guaranteed per payer.")
rows=[[t[1],t[0],t[2],t[3],t[4],t[5],t[6],t[7],t[8],t[9],t[10]] for t in D.EDI_TX]
table(ws,s,["X12","Transaction","Purpose","CH support","Availability","Payer dependency","API","Pricing model","Free sandbox","Production cost","Notes"],
 rows,widths=[8,22,40,20,16,22,16,20,14,24,40],chip_cols=(4,))

# 4 API AVAILABILITY
ws=sh("API Availability")
s=titleblk(ws,"API availability by clearinghouse",note="Transaction API coverage as researched; PA/attachments vary most.")
rows=[[n,d["tx"],d["pa"],d["self_serve"]] for n,d in D.CLEARINGHOUSES.items()]
table(ws,s,["Clearinghouse","Transactions (API)","Prior authorization","Self-serve access"],rows,widths=[24,60,44,44])

# 5 FHIR
ws=sh("FHIR")
s=titleblk(ws,"FHIR & prior-auth standards",note="CMS-0057-F FHIR APIs generally by Jan 1, 2027 for CMS-regulated payers.")
r=table(ws,s,["Da Vinci IG","What it does"],D.DAVINCI_IGS,widths=[44,80])
r=table(ws,r+1,["CMS rule","Title","Summary"],[[a,b,c] for a,b,c in D.CMS_RULES],widths=[16,44,90])

# 6 PAYER COVERAGE
ws=sh("Payer Coverage")
s=titleblk(ws,"Payer capability classification","Payer connectivity != full payer functionality",
 "Universal / Common / Payer-specific / Contract-specific / Unavailable.")
r=table(ws,s,["Capability","Classification","Example / note"],D.PAYER_CAPABILITY,widths=[46,26,64])
r=table(ws,r+1,["Coverage row","Clearinghouse coverage","Detail"],[[a,b,c] for a,b,c in D.COVERAGE_ROWS],widths=[34,26,70],chip_cols=(2,))

# 7 FREE VS PAID
ws=sh("Free vs Paid")
s=titleblk(ws,"Free / sandbox / paid matrix",note="Free sandbox is NOT free production. Distinguish developer account, sandbox, and production.")
table(ws,s,["Provider","Sandbox","Dev account","Test data","Production","Setup fee","Monthly fee","Txn fee","Notes"],
 [list(r) for r in D.FREE_VS_PAID],widths=[18,16,16,18,14,14,22,20,44])

# 8 CONNECTIVITY COSTS
ws=sh("Connectivity Costs")
s=titleblk(ws,"Connectivity cost model (MODEL ASSUMPTION)",
 "Per-transaction UNIT costs are model assumptions; actual clearinghouse rates are usage-tiered / QUOTE REQUIRED.")
# assumptions block
ws.cell(row=s,column=1,value="Assumption").font=SFONT; ws.cell(row=s,column=2,value="Value").font=SFONT; s+=1
for k,v in D.PER_CLAIM_MIX.items():
    ws.cell(row=s,column=1,value=k).border=BORDER; ws.cell(row=s,column=2,value=v).border=BORDER; s+=1
for k,v in D.UNIT.items():
    ws.cell(row=s,column=1,value="unit_"+k).border=BORDER; c=ws.cell(row=s,column=2,value=v); c.border=BORDER; c.number_format="$#,##0.00"; s+=1
s+=1
rows=[]
for r in D.scenario_table():
    rows.append([r["claims"],round(r["clearinghouse"]),round(r["voice"]),round(r["human"]),round(r["total"]),
                 round(r["per_claim"],3),round(r["annual"])])
r2=table(ws,s,["Claims/mo","Clearinghouse $","Voice $","Human $","Total $/mo","$ / claim","Annual $"],rows,
 widths=[14,18,14,14,16,12,16])
for col in ["B","C","D","E","G"]:
    for row in range(s+1,r2): ws[f"{col}{row}"].number_format="#,##0"
ws.column_dimensions["A"].width=30

# 9-11 MVP / PILOT / PRODUCTION COST
p=D.phase_costs()
def phase_sheet(name,title,pc,claims,note):
    ws=sh(name); s=titleblk(ws,title,note=note)
    rows=[["Clearinghouse (EDI/API)",round(pc["clearinghouse"])],["Prior auth",round(pc["prior_auth"])],
          ["Attachments",round(pc["attachments"])],["AI Voice",round(pc["voice"])],["Human exceptions",round(pc["human"])],
          ["TOTAL / month",round(pc["total"])],["Per claim",round(pc["per_claim"],3)],["Annualized",round(pc["total"]*12)]]
    r=table(ws,s,["Line","USD"],rows,widths=[36,18])
    for row in range(s+1,r): ws[f"B{row}"].number_format="#,##0.000" if "claim" in str(ws[f'A{row}'].value).lower() else "#,##0"
    ws.cell(row=r+1,column=1,value=f"Volume basis: {claims:,} claims/month").font=Font(italic=True,color="6B7B90",size=9)
    return ws
phase_sheet("MVP Cost","MVP connectivity cost",p["mvp"],2000,
 "MVP/demo on FREE/SANDBOX tier — clearinghouse transactions covered by free tiers (Stedi Basic 100/mo, sandbox). Near-$0 connectivity.")
phase_sheet("Pilot Cost","Pilot connectivity cost",p["pilot"],50000,
 "First paid production pilot; clearinghouse per-transaction QUOTE REQUIRED — modeled with assumption unit costs.")
phase_sheet("Production Cost","Production connectivity cost",p["prod"],500000,
 "Medium production; verify live per-transaction pricing (usage-tiered) before commitment.")

# 12 SOURCES
ws=sh("Sources")
s=titleblk(ws,"Sources",note="Every pricing/coverage/API claim is tied to a source. Confidence: High=official, Med=secondary, Est=modeled.")
rows=[[lbl,url,date,conf] for (lbl,url,date,conf) in D.SOURCES.values()]
table(ws,s,["Source","URL","Date checked","Confidence"],rows,widths=[46,66,14,14],link_col=2)

wb.save(XLSX)
print("Excel sheets:",len(wb.sheetnames))

# ======================================================================
# PDF  (investor/technical, 35 sections)
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

PDF=os.path.join(OUT,"AI_Revenue_Recovery_OS_Clearinghouse_API_Report.pdf")
CW=6.9*inch
rNAVY=rc.HexColor("#0C1B30"); rNAVY2=rc.HexColor("#13253F"); rTEAL=rc.HexColor("#118C7E"); rCYAN=rc.HexColor("#2E7FC2")
rMUT=rc.HexColor("#6B7B90"); rLINE=rc.HexColor("#D5DEE8"); rINK=rc.HexColor("#1a2433"); rGRN=rc.HexColor("#2E9E6B"); rRED=rc.HexColor("#B23C2B")
ss=getSampleStyleSheet()
def PS(n,**k): return ParagraphStyle(n,parent=k.pop("parent",ss["Normal"]),**k)
BODY=PS("b",fontName="Helvetica",fontSize=9.5,leading=14,textColor=rINK,alignment=TA_JUSTIFY,spaceAfter=7)
BODYL=PS("bl",parent=BODY,alignment=TA_LEFT)
H1=PS("h1",fontName="Helvetica-Bold",fontSize=15,leading=19,textColor=rNAVY,spaceBefore=6,spaceAfter=8)
H2=PS("h2",fontName="Helvetica-Bold",fontSize=11.5,leading=14,textColor=rTEAL,spaceBefore=9,spaceAfter=5)
EY=PS("ey",fontName="Helvetica-Bold",fontSize=8,leading=11,textColor=rMUT,spaceAfter=2)
SMALL=PS("sm",fontName="Helvetica",fontSize=8,leading=11,textColor=rMUT,spaceAfter=4)
CELL=PS("c",fontName="Helvetica",fontSize=7.3,leading=9.2,textColor=rINK); CELLH=PS("ch",fontName="Helvetica-Bold",fontSize=7.3,leading=9.2,textColor=rc.white)
BULL=PS("bu",parent=BODYL,leftIndent=12,spaceAfter=4)
def h1(t): p=Paragraph(t,H1); p.toc_level=0; return p
def h2(t): p=Paragraph(t,H2); p.toc_level=1; return p
def para(t,s=BODY): return Paragraph(t,s)
def bullets(items): return [Paragraph("• "+t,BULL) for t in items]
def chart(key,w=CW,cap=None):
    ip=CH[key]; iw,ih=PImage.open(ip).size; fl=[Image(ip,width=w,height=w*ih/iw)]
    if cap: fl.append(Paragraph(cap,SMALL))
    fl.append(Spacer(1,6)); return fl
def vtable(headers,rows,colw,fs=7.3):
    data=[[Paragraph(str(x),CELLH) for x in headers]]
    for rw in rows: data.append([Paragraph(str(v),CELL) for v in rw])
    t=Table(data,colWidths=colw,repeatRows=1)
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),rNAVY),("GRID",(0,0),(-1,-1),0.4,rLINE),("VALIGN",(0,0),(-1,-1),"MIDDLE"),
     ("TOPPADDING",(0,0),(-1,-1),2.5),("BOTTOMPADDING",(0,0),(-1,-1),2.5),("LEFTPADDING",(0,0),(-1,-1),3.5),("RIGHTPADDING",(0,0),(-1,-1),3.5),
     ("ROWBACKGROUNDS",(0,1),(-1,-1),[rc.white,rc.HexColor("#F7FAFC")])]))
    return t
def callout(title,text,color=rTEAL):
    tb=Table([[Paragraph(f'<b>{title}</b>',PS("ct",fontName="Helvetica-Bold",fontSize=9,textColor=color,leading=12))],
              [Paragraph(text,PS("cx",fontName="Helvetica",fontSize=8.6,textColor=rINK,leading=12.2))]],colWidths=[CW])
    tb.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),rc.HexColor("#F4F8FB")),("BOX",(0,0),(-1,-1),0.6,color),
     ("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7),("LINEBEFORE",(0,0),(0,-1),2.5,color)]))
    return tb
class Doc(BaseDocTemplate):
    def afterFlowable(self,f):
        if hasattr(f,"toc_level"): self.notify("TOCEntry",(f.toc_level,f.getPlainText(),self.page))
def _dec(cv,doc):
    cv.saveState(); cv.setStrokeColor(rLINE); cv.setLineWidth(0.5); cv.line(0.8*inch,10.35*inch,7.7*inch,10.35*inch)
    cv.setFont("Helvetica-Bold",7.5); cv.setFillColor(rTEAL); cv.drawString(0.8*inch,10.45*inch,"AI REVENUE RECOVERY OS")
    cv.setFont("Helvetica",7.5); cv.setFillColor(rMUT); cv.drawRightString(7.7*inch,10.45*inch,"Clearinghouse API & Connectivity  ·  Confidential")
    cv.line(0.8*inch,0.62*inch,7.7*inch,0.62*inch); cv.drawString(0.8*inch,0.45*inch,"Prepared for AI Revenue Recovery OS  ·  "+DATE)
    cv.drawRightString(7.7*inch,0.45*inch,"Page %d"%doc.page); cv.restoreState()
frame=Frame(0.8*inch,0.75*inch,6.9*inch,9.5*inch,id="m")
doc=Doc(PDF,pagesize=letter,leftMargin=0.8*inch,rightMargin=0.8*inch,topMargin=0.95*inch,bottomMargin=0.85*inch,
    title="AI Revenue Recovery OS — Clearinghouse API & Connectivity Report",author="AI Revenue Recovery OS")
doc.addPageTemplates([PageTemplate(id="cover",frames=[frame]),PageTemplate(id="body",frames=[frame],onPage=_dec)])
st=[]
# COVER
st+=[Spacer(1,1.0*inch)]
st.append(Paragraph("Clearinghouse API &amp;<br/>Healthcare Connectivity",PS("tt",fontName="Helvetica-Bold",fontSize=27,leading=33,textColor=rNAVY)))
st.append(Spacer(1,8)); st.append(Paragraph("Cost · Coverage · Limitations · Product Opportunity",PS("s2",fontName="Helvetica",fontSize=13,textColor=rTEAL)))
st.append(Spacer(1,10)); st.append(HRFlowable(width=CW,thickness=2,color=rTEAL,spaceAfter=12))
st.append(Paragraph("Can a clearinghouse API give us most of the data we need — what does it cost, what does it <i>not</i> cover, and where do we still need direct payer APIs, FHIR, portals, AI voice and humans?",PS("st",fontName="Helvetica",fontSize=10.5,leading=15,textColor=rMUT)))
st.append(Spacer(1,30))
meta=Table([[Paragraph("PREPARED FOR",EY),Paragraph("<b>AI Revenue Recovery OS</b>",BODYL)],
 [Paragraph("DATE",EY),Paragraph(DATE,BODYL)],
 [Paragraph("SCOPE",EY),Paragraph("Stedi · Availity · Waystar · Optum/Change · Experian · Office Ally · Claim.MD · TriZetto",BODYL)],
 [Paragraph("MVP CONNECTIVITY (est.)",EY),Paragraph(f"<b>~${D.phase_costs()['mvp']['total']:,.0f}/mo</b> on free/sandbox tiers",BODYL)],
 [Paragraph("CLASSIFICATION",EY),Paragraph("Confidential · Investor &amp; technical · Sourced 2026 · MODEL ASSUMPTIONS where noted",BODYL)]],colWidths=[1.9*inch,5.0*inch])
meta.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),("LINEBELOW",(0,0),(-1,-2),0.4,rLINE)]))
st.append(meta); st.append(Spacer(1,26))
st.append(callout("Disclosures & method",
 "Pricing is researched 2026 with sources; undisclosed pricing is recorded <b>“QUOTE REQUIRED — not publicly disclosed”</b> and never invented. Free sandbox is never equated with free production; direct payer API is never equated with clearinghouse connectivity; payer connectivity is never equated with full payer functionality. Connectivity cost figures are <b>MODEL ASSUMPTIONS</b> (per-transaction clearinghouse rates are usage-tiered / quote-only). HIPAA-<i>aligned</i> architecture — not “HIPAA certified.” Final medical-necessity/coverage decisions require a qualified clinician (CMS-4201-F; CA SB 1120). No PHI."))
st.append(NextPageTemplate("body")); st.append(PageBreak())
st.append(Paragraph("Contents",H1)); toc=TableOfContents()
toc.levelStyles=[PS("t0",fontName="Helvetica-Bold",fontSize=10,leading=15,textColor=rNAVY),PS("t1",fontName="Helvetica",fontSize=9,leading=12.5,textColor=rINK,leftIndent=14)]
st.append(toc); st.append(PageBreak())
def sec(t): st.append(h1(t))
def sub(t): st.append(h2(t))
def srcline(*ids):
    parts=[]
    for i in ids:
        lbl,url,date,conf=D.SOURCES[i]; parts.append(f'<link href="{url}">{lbl}</link> ({conf})')
    st.append(Paragraph("Sources: "+" · ".join(parts),SMALL))

# 1 EXEC SUMMARY
sec("1. Executive Summary")
st.append(para("A modern healthcare clearinghouse API can deliver <b>most of the standardized transaction data</b> the platform needs — eligibility, benefits, claim submission, claim status and electronic remittance — through a single integration reaching thousands of payers. It <b>cannot</b>, on its own, deliver prior-authorization for every payer, appeals (no universal standard), payer medical policies, or the reasoning that turns a denial into a recovered dollar. Those are exactly the layers we build.",BODYL))
p=D.phase_costs()
st.append(vtable(["Question","Answer"],
 [["Is a clearinghouse API free?","Partly. Free SANDBOX and small free tiers exist (Stedi Basic 100 txns/mo; Availity Essentials portal). Free PRODUCTION at scale generally does not — most pricing is usage-based or QUOTE REQUIRED."],
  ["What can clearinghouses cover?","Eligibility (270/271), claims (837), claim status (276/277), ERA (835), acknowledgments (277CA/999/TA1); attachments (275) emerging."],
  ["What can't they cover?","Universal prior auth, appeals, payer medical policies, denial reasoning, patient-estimate logic, cross-channel orchestration."],
  ["How many payers?","Thousands via one integration (Stedi 3,500+; Availity 4,000+; TriZetto 8,000+ connections) — but connectivity ≠ full functionality."],
  ["Do we still need payer APIs / FHIR / portals / voice?","Yes — selectively. Direct payer APIs & FHIR (2027) for richer/PA data; portals, AI voice and humans as fallback."],
  ["MVP connectivity cost",f"~${p['mvp']['total']:,.0f}/month on free/sandbox tiers (near-$0)."],
  ["Production connectivity (500k claims/mo)",f"~${p['prod']['total']:,.0f}/month (MODEL ASSUMPTION; verify live rates)."]],
 [1.7*inch,5.2*inch]))
st.append(callout("Bottom line",
 "<b>Do not build a clearinghouse.</b> Build an <b>AI Revenue Recovery orchestration platform</b> that uses clearinghouses as ONE connectivity layer — alongside direct payer APIs, FHIR, portals, AI voice and human workflows — governed by an AI connectivity orchestrator. Start provider-side on clearinghouse APIs (near-$0 MVP), and invest the proprietary effort in payer intelligence, denial/appeal reasoning and orchestration."))
st.append(PageBreak())

# 2 WHAT IS A CLEARINGHOUSE
sec("2. What Is a Healthcare Clearinghouse?")
st.append(para("A clearinghouse is an intermediary that connects providers to payers. It accepts a provider's transaction (e.g. an eligibility inquiry or a claim), validates and formats it to each payer's requirements, routes it to the correct payer, and returns the response. It abstracts away thousands of payer-specific connections, formats and enrollment processes behind one integration.",BODYL))
st+=chart("ecosystem",cap="Figure 1. The clearinghouse sits between the provider and thousands of payers — but direct payer APIs, FHIR, portals, voice and humans sit alongside it, not replaced by it.")
srcline("x12_flow","cms_std")
st.append(PageBreak())

# 3 CLEARINGHOUSE vs PAYER vs API vs FHIR vs PORTAL
sec("3. Clearinghouse vs Payer vs API vs FHIR vs Portal vs Voice vs Human")
st.append(para("These are not interchangeable. Conflating them is the most common and most expensive mistake in RCM connectivity planning.",BODYL))
st.append(vtable(["Term","What it is","When it's the right channel"],
 [["Clearinghouse","Intermediary routing EDI to many payers","Standard transactions at scale (eligibility, claims, status, ERA)"],
  ["Payer","The insurer that adjudicates","N/A — the endpoint, not a channel"],
  ["Payer API","A direct programmatic interface to one payer","When a payer offers richer/real-time data than the clearinghouse relays"],
  ["FHIR","HL7 REST standard (SMART/Da Vinci)","Prior auth (PAS/CRD/DTR) & CMS-regulated payer data (2027)"],
  ["EDI / X12","The mandated transaction format (270/837/835…)","The substrate under most clearinghouse & payer transactions"],
  ["Portal","A payer's web UI for humans","When no EDI/API/FHIR path exists (auth follow-up, attachments, appeals)"],
  ["Voice","Phone call to payer IVR/rep (AI or human)","Only when no digital channel resolves it"],
  ["Human","A person doing the work","Judgment, exceptions, complex appeals — last resort"]],
 [1.2*inch,3.0*inch,2.7*inch]))
st.append(callout("Three distinctions we never blur",
 "① Free <b>sandbox</b> ≠ free <b>production</b>.  ② Direct <b>payer API</b> ≠ <b>clearinghouse</b> connectivity.  ③ Payer <b>connectivity</b> ≠ full payer <b>functionality</b>.",color=rRED))
st.append(PageBreak())

# 4 IS CLEARINGHOUSE API FREE
sec("4. Is a Clearinghouse API Free?")
st.append(para("Short answer: <b>parts are; production at scale generally is not.</b> There are genuinely free developer sandboxes and small free production tiers, but most vendors price production transactions on usage or by quote.",BODYL))
st+=bullets([
 "<b>Genuinely free (with limits):</b> Stedi Basic plan — 100 free production transactions/month (eligibility, claims, ERA, claim status), processed manually in the portal. Availity Essentials portal — free to providers for sponsored/participating payers.",
 "<b>Free sandbox / developer:</b> Stedi test-mode keys (mock data, fixed payers); Availity Demo plan (3 TPS / 500 per day). A free developer account is NOT free production.",
 "<b>Usage-based / quote:</b> Stedi pay-as-you-go (tiered, exact rates QUOTE REQUIRED); Availity/Optum/Waystar/Experian/TriZetto API pricing QUOTE REQUIRED.",
 "<b>Transparent low-cost:</b> Office Ally — free to participating payers, $44.95/month per Tax ID+NPI for non-participating; Claim.MD — published monthly tiers (~$30/$60/$120)."])
srcline("stedi_basic","stedi_payg","availity_ess","officeally_fee")
st.append(PageBreak())

# 5 FREE VS PAID MATRIX
sec("5. Free Sandbox vs Paid Production")
st.append(para("The distinction that most often misleads planning: a free developer account or sandbox says nothing about production cost. This matrix keeps them separate.",BODYL))
st.append(vtable(["Provider","Sandbox","Dev acct","Production","Setup","Monthly","Txn fee","Notes"],
 [[r[0],r[1],r[2],r[4],r[5],r[6],r[7],r[8]] for r in D.FREE_VS_PAID],
 [0.95*inch,0.75*inch,0.65*inch,0.7*inch,0.6*inch,0.95*inch,0.85*inch,1.35*inch]))
st.append(PageBreak())

# 6 MAJOR CLEARINGHOUSES
sec("6. Major Clearinghouses")
st.append(para("Eight clearinghouses were researched. They split into <b>developer-native</b> (Stedi, Claim.MD), <b>network + developer program</b> (Availity, Optum/Change), and <b>enterprise/contract</b> (Waystar, Experian, TriZetto), plus a transparent-priced web/SFTP option (Office Ally).",BODYL))
st.append(vtable(["Clearinghouse","Type","Self-serve API","Pricing","Payers"],
 [[n,d["kind"],("YES" if d["self_serve"].startswith("YES") else ("Gated" if "gated" in d["self_serve"].lower() or "rep" in d["self_serve"].lower() else "NO")),
   ("Public" if ("$" in d["pricing"] and "QUOTE" not in d["pricing"][:6]) else "QUOTE" if "QUOTE" in d["pricing"] else "Mixed"),
   d["payers"].split(";")[0]] for n,d in D.CLEARINGHOUSES.items()],
 [1.9*inch,2.0*inch,0.9*inch,0.7*inch,1.4*inch]))
srcline("stedi","availity_dev","waystar","optum_dev","experian","officeally","claimmd","trizetto")
st.append(PageBreak())

# 7-11 DEEP DIVES
def deepdive(num,key):
    d=D.CLEARINGHOUSES[key]; sec(f"{num}. {key} — Deep Dive")
    st.append(vtable(["Dimension","Detail"],
     [["Type",d["kind"]],["Self-serve / access",d["self_serve"]],["Sandbox",d["sandbox"]],
      ["What's free",d["free"]],["Pricing",d["pricing"]],["Transactions (API)",d["tx"]],
      ["Prior authorization",d["pa"]],["Payer network",d["payers"]],["Enrollment",d["enroll"]],
      ["Security",d["security"]],["Confidence",d["conf"]]],[1.5*inch,5.4*inch]))
    srcline(d["src"]); st.append(PageBreak())
deepdive("7","Stedi")
deepdive("8","Availity")
deepdive("9","Waystar")
deepdive("10","Optum / Change Healthcare")
sec("11. Other Clearinghouses")
for key in ["Experian Health","Office Ally","Claim.MD","TriZetto Provider Solutions (Cognizant)"]:
    d=D.CLEARINGHOUSES[key]; sub(key)
    st.append(vtable(["Dimension","Detail"],
     [["Type",d["kind"]],["Self-serve",d["self_serve"]],["Pricing",d["pricing"]],
      ["Transactions",d["tx"]],["Payers",d["payers"]]],[1.4*inch,5.5*inch]))
st.append(PageBreak())

# 12 EDI TRANSACTION MATRIX
sec("12. EDI Transaction Matrix")
st.append(para("The mandated X12 transactions and how reachable each is. Acknowledgments (277CA/999/TA1) are transport-level; 278 (prior auth) and 275 (attachments) are the least standardized.",BODYL))
st.append(vtable(["X12","Purpose","CH support","API","Payer dependency","Free sandbox"],
 [[t[1],t[2],t[3],t[6],t[5],t[8]] for t in D.EDI_TX],
 [0.5*inch,2.7*inch,1.0*inch,0.7*inch,1.1*inch,0.9*inch]))
srcline("x12_flow","cms_std")
st.append(PageBreak())

# 13 ELIGIBILITY
sec("13. Eligibility (270/271)")
st.append(para("Eligibility is the most-adopted transaction (96% electronic). A 271 reliably confirms active coverage and plan, but detailed benefit accumulators vary widely by payer. The field matrix below shows what is typically returned.",BODYL))
st+=chart("wf_elig")
st.append(vtable(["271 field","Availability","Note"],[[a,b,c] for a,b,c in D.ELIG_FIELDS],[2.0*inch,1.5*inch,3.4*inch]))
srcline("caqh","stedi")
st.append(PageBreak())

# 14 BENEFITS
sec("14. Benefits")
st.append(para("Benefit detail is returned in the 271 but completeness is <b>payer-dependent</b>. Do not assume every payer returns deductible-remaining, OOP-remaining or service-specific copay/coinsurance. Richer benefit data sometimes requires the payer's own API/portal or FHIR.",BODYL))
st.append(vtable(["Channel","Benefit data realistically obtainable","Limitation"],
 [["270/271 (EDI/API)","Active coverage, plan, common copay/coinsurance, some accumulators","Field completeness varies by payer; EQ service-type dependent"],
  ["Payer API","Sometimes richer real-time benefits","Only where a payer offers it; not universal"],
  ["FHIR","Coverage/benefit resources (emerging; 2027 for CMS payers)","Early adoption; patient-authorized for Patient Access"],
  ["Portal","Full benefit detail as shown to staff","Manual / RPA; brittle"]],[1.3*inch,3.5*inch,2.1*inch]))
st.append(PageBreak())

# 15 PATIENT RESPONSIBILITY
sec("15. Patient Responsibility")
st.append(para("A clearinghouse generally provides the <b>data to calculate</b> an estimate — not a final patient-responsibility figure. Our platform computes the estimate from allowed amount, deductible remaining, copay, coinsurance and OOP remaining, combined with the provider's contracted/fee-schedule amounts.",BODYL))
st.append(callout("Key distinction",
 "Clearinghouse = insurance/benefit DATA.  Our platform = the ESTIMATE. Final patient responsibility is only known after adjudication (835). Estimation quality depends on benefit-field completeness (payer-dependent) and contracted rates (ours).",color=rTEAL))
st.append(PageBreak())

# 16 CLAIMS
sec("16. Claims (837P / 837I / 837D)")
st.append(para("Claim submission is a core, universal clearinghouse function via API, SFTP, EDI, portal, batch or real-time. Payer enrollment may be required for specific payers. Pricing is per-claim, bundled or tiered — and QUOTE REQUIRED for most enterprise vendors.",BODYL))
st+=chart("wf_claim")
st.append(vtable(["Channel","Supported","Note"],
 [["API","YES (Stedi, Availity, Optum, Claim.MD)","Real-time or async"],
  ["SFTP / batch","YES (most)","High-volume nightly batches"],
  ["EDI direct","YES","Underlying format"],
  ["Portal","YES","Manual entry fallback"]],[1.3*inch,3.2*inch,2.4*inch]))
st.append(PageBreak())

# 17 CLAIM STATUS
sec("17. Claim Status (276/277)")
st.append(para("Claim status (81% electronic) is widely available real-time or batch via clearinghouse APIs. Status granularity varies — some payers return rich pending/denied/paid detail with medical-review flags; others return minimal status. This is a prime AI-voice fallback when the 277 is unhelpful.",BODYL))
st+=chart("wf_status")
srcline("caqh","availity_tx","optum_dev")
st.append(PageBreak())

# 18 ERA
sec("18. ERA / Payment (835)")
st.append(para("The 835 is the payer's electronic explanation of payment: what was paid, adjustments, CARC/RARC codes, patient responsibility and the trace/EFT reassociation number. ERA enrollment is usually required per payer. The 835 is the primary fuel for our denial-intelligence engine.",BODYL))
st.append(vtable(["835 element","Feeds"],
 [["Payment & adjustment amounts","Underpayment detection"],["CARC / RARC codes","Denial reason & root-cause reasoning"],
  ["Patient responsibility","Patient estimate reconciliation"],["Trace / EFT number","Payment reconciliation"]],[2.6*inch,4.3*inch]))
st.append(PageBreak())

# 19 PRIOR AUTH
sec("19. Prior Authorization (278 / FHIR PAS)")
st.append(para("Prior authorization is the <b>least-automated</b> workflow — only 40% electronic. Clearinghouse 278 support is <b>not universal</b>; some vendors (Availity, Optum) offer 278 APIs, others (Stedi) surface only the PA <i>requirement</i> via the 271. For CMS-regulated payers this moves to FHIR (Da Vinci PAS/CRD/DTR) by Jan 1, 2027.",BODYL))
st+=chart("wf_pa")
st.append(vtable(["Da Vinci IG","Role"],[[a,b] for a,b in D.DAVINCI_IGS],[2.9*inch,4.0*inch]))
st.append(callout("Limitation & build",
 "No single channel solves PA universally. We orchestrate: CRD (needed?) → DTR (docs) → 278/PAS submit → payer decision → portal/voice follow-up. We build the orchestration + documentation logic; we buy/partner for connectivity where it exists.",color=rTEAL))
srcline("cms_0057","davinci_pas","caqh")
st.append(PageBreak())

# 20 DENIALS
sec("20. Denials")
st.append(para("Denial <i>data</i> comes from the 835 (CARC/RARC, adjustments) and 277CA (front-end rejections). Denial <i>intelligence</i> — root cause, recovery path, appeal likelihood — is ours to build. Payer medical policy, medical documentation and human review are still required for many denials.",BODYL))
st+=chart("wf_denial")
st.append(vtable(["Available electronically","Still requires"],
 [["CARC/RARC codes (835)","Payer medical policy interpretation"],["Adjustment/payment amounts (835)","Medical documentation (records/notes)"],
  ["Front-end rejects (277CA)","Human review for complex/clinical denials"],["Status (277)","Appeal drafting & submission (no universal API)"]],[3.3*inch,3.6*inch]))
st.append(PageBreak())

# 21 APPEALS
sec("21. Appeals")
st.append(para("<b>There is no universal clearinghouse appeals API.</b> Appeals are payer-specific: proprietary portals, fax, mail or payer web forms. This is a structural gap the platform must fill with its own workflow, AI drafting and cross-channel tracking.",BODYL))
st.append(vtable(["Appeal channel","Reality"],
 [["Electronic / API","NO universal standard; a few payer-specific portals"],["FHIR","No published appeals IG"],
  ["Portal","Common — RPA/manual"],["Fax / mail","Still widespread"],
  ["Documentation","Payer-specific packets"],["Status tracking","Manual; we build it"]],[1.8*inch,5.1*inch]))
st.append(callout("What we build","Appeal workflow, AI-drafted appeal letters (human-approved), documentation assembly, deadline tracking and cross-channel status — because no vendor provides it.",color=rTEAL))
srcline("cms_std","x12_flow")
st.append(PageBreak())

# 22 PAYER POLICIES
sec("22. Payer Policies")
st.append(para("Clearinghouses do <b>not</b> provide medical/coverage policies, PA rules, documentation requirements, denial rules, timely-filing or appeal rules. Our <b>Payer Intelligence engine</b> collects and maintains these from payer manuals, websites, provider portals, FHIR/CRD, documents and human research — indexed for RAG so the platform can cite the rule behind every recommendation.",BODYL))
st.append(vtable(["Policy type","Source we collect from"],
 [["Medical / coverage policies","Payer manuals & websites; NCD/LCD for Medicare"],["PA rules","Payer PA lists; Da Vinci CRD (2027)"],
  ["Documentation requirements","Payer packets; DTR questionnaires"],["Timely-filing & appeal rules","Payer manuals; contracts"]],[2.4*inch,4.5*inch]))
st.append(PageBreak())

# 23 PAYER API
sec("23. Payer API")
st.append(para("A <b>direct payer API</b> is a programmatic interface to one payer; a <b>clearinghouse API</b> is one interface to many. Direct payer APIs are better when a payer exposes richer, real-time or PA-specific data than the clearinghouse relays — but they are rare, uneven and add per-payer integration cost.",BODYL))
st.append(vtable(["","Clearinghouse API","Direct payer API"],
 [["Reach","Thousands of payers, one integration","One payer per integration"],
  ["Data richness","Standardized (lowest common denominator)","Sometimes richer/real-time"],
  ["Effort","Low (one vendor)","High (per payer)"],
  ["When to use","Default for standard transactions","Selective, high-value payers / PA / FHIR"]],[1.0*inch,2.95*inch,2.95*inch]))
st.append(PageBreak())

# 24 FHIR
sec("24. FHIR")
st.append(para("FHIR (HL7 R4, REST + OAuth2 + SMART) is the future of payer connectivity for prior auth and patient/provider data. CMS-0057-F requires CMS-regulated payers to expose Prior Authorization, Patient Access, Provider Access and Payer-to-Payer FHIR APIs, generally by <b>Jan 1, 2027</b>. Note: the Patient Access API is <b>patient-authorized</b> — not a general provider RCM feed.",BODYL))
st.append(vtable(["CMS rule","Summary"],[[a+" — "+b,c] for a,b,c in D.CMS_RULES],[2.0*inch,4.9*inch]))
srcline("cms_0057","cms_9115","cms_0053","carin")
st.append(PageBreak())

# 25 PORTAL
sec("25. Portal")
st.append(para("Payer portals still matter because for many workflows no EDI/API/FHIR path exists — prior-auth follow-up, attachment upload, appeal submission and status, and payer-specific tasks. Portal automation (RPA) is the next channel down, but it is brittle and must be built with guardrails, only where a digital path is genuinely absent.",BODYL))
st.append(PageBreak())

# 26 AI VOICE
sec("26. AI Voice")
st.append(para("AI voice is useful for claim-status follow-up, authorization follow-up, missing-information calls, appeal follow-up and provider-services conversations — but it should <b>never be the first channel</b>. It is slow and costly relative to a digital transaction; it earns its place only when EDI, API, FHIR and portal cannot resolve the task.",BODYL))
st+=chart("wf_voice")
st.append(PageBreak())

# 27 CONNECTIVITY ORCHESTRATION
sec("27. Connectivity Orchestration")
st.append(para("Our differentiator is the orchestration model: <b>“Don't call when you can connect digitally.”</b> For every workflow the connectivity engine walks the ladder EDI → API → FHIR → Portal → AI Voice → Human, choosing the cheapest channel that can resolve the task.",BODYL))
st+=chart("orchestration",w=4.6*inch)
st.append(vtable(["Step","Channel","Use when"],[[a,b,c] for a,b,c in D.CONNECTIVITY_LADDER],[1.7*inch,2.6*inch,2.6*inch]))
st.append(PageBreak())

# 28 ARCHITECTURE
sec("28. Architecture")
st.append(para("The AI Revenue Recovery connectivity engine routes across clearinghouse, payer APIs and FHIR; falls back to portals, AI voice and humans; captures the outcome; and drives the AI workflow to a revenue action — all under an AI connectivity orchestrator with a shared intelligence, audit and tenant-isolation plane.",BODYL))
st+=chart("architecture",w=5.4*inch,cap="Figure. AI Revenue Recovery OS connectivity engine and orchestration ladder.")
st.append(PageBreak())

# 29 COST MODEL
sec("29. Cost Model")
st.append(para("A parameterized connectivity cost model across five volume scenarios. Clearinghouse per-transaction rates are usage-tiered / QUOTE REQUIRED, so unit costs here are <b>MODEL ASSUMPTIONS</b>; voice and human costs dominate the tail because they are the most expensive channels per action.",BODYL))
st+=chart("scenario")
st+=chart("perclaim")
rows=[[f"{r['claims']:,}",f"${r['clearinghouse']:,.0f}",f"${r['voice']:,.0f}",f"${r['human']:,.0f}",f"${r['total']:,.0f}",f"${r['per_claim']:.3f}",f"${r['annual']:,.0f}"] for r in D.scenario_table()]
st.append(vtable(["Claims/mo","Clearinghouse","Voice","Human","Total/mo","$/claim","Annual"],rows,
 [0.9*inch,1.15*inch,0.85*inch,0.85*inch,1.0*inch,0.75*inch,1.2*inch]))
st.append(callout("Channel economics","Cost rises sharply down the ladder — a digital transaction is cents; a voice call is dollars; a human touch is several dollars. Every workflow the orchestrator keeps digital protects margin.",color=rTEAL))
st.append(PageBreak())

# 30 MVP vs PILOT vs PRODUCTION
sec("30. MVP vs Pilot vs Production")
st.append(para("A free MVP is feasible: build the investor demonstration on free sandboxes, mock payer APIs, synthetic data, test EDI and developer accounts — paying no production transaction fees. Pilot and production then move to paid usage.",BODYL))
st+=chart("phase",w=4.4*inch)
st.append(vtable(["Phase","Volume","Connectivity $/mo","Basis"],
 [["MVP / demo","~2,000 (free tier)",f"~${p['mvp']['total']:,.0f}","Free sandbox + Stedi Basic (100 free txns); synthetic data"],
  ["Pilot","50,000",f"~${p['pilot']['total']:,.0f}","First paid production; QUOTE-based unit rates"],
  ["Production","500,000",f"~${p['prod']['total']:,.0f}","Medium production; verify live tiered pricing"]],
 [1.2*inch,1.4*inch,1.5*inch,2.8*inch]))
st.append(callout("Free MVP strategy",
 "Stedi free sandbox + Basic plan, Availity Demo, synthetic/de-identified data and mock payer responses let us build and demo the full orchestration flow at ~$0 connectivity cost — no PHI, no production fees.",color=rGRN))
st.append(PageBreak())

# 31 BUILD VS BUY VS PARTNER
sec("31. Build vs Buy vs Partner")
st.append(para("Buy commodity connectivity; build the intelligence and orchestration; partner for voice. The rule of thumb: if it is regulated, standardized and undifferentiated, buy it; if it is where our advantage lives, build it.",BODYL))
st.append(vtable(["Capability","Recommendation","Rationale"],[[a,b,c] for a,b,c in D.BUILD_BUY_PARTNER],[2.3*inch,1.5*inch,3.1*inch]))
st.append(PageBreak())

# 32 PRODUCT OPPORTUNITY
sec("32. Product Opportunity")
st.append(para("The opportunity is <b>not</b> to become another clearinghouse. It is to build the AI intelligence and orchestration layer <b>above</b> existing healthcare connectivity — working with multiple clearinghouses, direct payer APIs, FHIR, portals, voice and human workflows.",BODYL))
st.append(vtable(["Clearinghouses solve (we buy)","We build (our moat)"],
 [[D.CH_SOLVES[i] if i<len(D.CH_SOLVES) else "", D.WE_BUILD[i] if i<len(D.WE_BUILD) else ""] for i in range(max(len(D.CH_SOLVES),len(D.WE_BUILD)))],
 [3.3*inch,3.6*inch]))
st.append(PageBreak())

# 33 SECURITY
sec("33. Security / HIPAA")
st.append(para("A clearinghouse's security does <b>not</b> make our application HIPAA compliant. We run our own HIPAA-aligned program: signed BAAs with every clearinghouse and cloud provider handling PHI, encryption in transit and at rest, least-privilege access, tenant isolation, API security (OAuth2, secrets management) and immutable audit logging.",BODYL))
st.append(vtable(["Control","Our responsibility"],
 [["BAA","Signed with each clearinghouse/cloud handling PHI"],["Encryption","TLS 1.2+ in transit; AES-256 at rest; managed keys/HSM"],
  ["Access control","Least privilege; MFA; RBAC; tenant scoping"],["Tenant isolation","RLS → schema → dedicated; provider vs payer never mixed"],
  ["API security","OAuth2, key rotation, secrets vault, rate limiting"],["Audit & logging","Immutable logs of every access & AI decision"]],[1.6*inch,5.3*inch]))
st.append(callout("HIPAA posture","HIPAA-<b>aligned</b> architecture and compliance program — never “HIPAA certified.” Vendor certifications (e.g. Stedi SOC 2 Type II / HIPAA-eligible) are inputs, not a substitute for our own program.",color=rRED))
srcline("stedi_soc2","cms_4201","sb1120")
st.append(PageBreak())

# 34 INVESTOR SUMMARY
sec("34. Investor Summary")
st.append(vtable(["#","Question","Answer"],
 [["1","Is clearinghouse API free?","Partly — free sandbox & small free tiers; production usually usage-based/quote"],
  ["2","What is free?","Stedi Basic 100 txns/mo; Availity Essentials (par payers); dev sandboxes"],
  ["3","What is paid?","Production at scale — usage tiers or QUOTE REQUIRED"],
  ["4","What can clearinghouses cover?","Eligibility, claims, status, ERA, acks; attachments emerging"],
  ["5","What can't they cover?","Universal PA, appeals, payer policies, denial reasoning, orchestration"],
  ["6","How many payers?","Thousands via one integration (3,500–8,000+ connections)"],
  ["7","Need payer APIs?","Yes — selectively, for richer/PA data"],
  ["8","Need FHIR?","Yes — PA (Da Vinci) & CMS payers by 2027"],
  ["9","Need portals?","Yes — fallback where no EDI/API/FHIR"],
  ["10","Need AI voice?","Yes — last digital-fallback before humans; never first"],
  ["11","What to build?","Intelligence + orchestration + estimate/denial/appeal engines"],
  ["12","What to buy?","EDI/clearinghouse connectivity"],
  ["13","What to partner?","AI voice; niche FHIR"],
  ["14","MVP connectivity cost",f"~${p['mvp']['total']:,.0f}/mo (free/sandbox)"],
  ["15","Pilot connectivity cost",f"~${p['pilot']['total']:,.0f}/mo (50k claims)"],
  ["16","Production connectivity cost",f"~${p['prod']['total']:,.0f}/mo (500k claims)"]],
 [0.3*inch,2.2*inch,4.4*inch]))
st.append(PageBreak())

# 35 FINAL RECOMMENDATION
sec("35. Final Recommendation")
st.append(para("<b>Do not build a clearinghouse.</b> Build an AI Revenue Recovery orchestration platform that uses clearinghouses as one connectivity layer — alongside direct payer APIs, FHIR, portals, AI voice and human workflows — controlled by an AI connectivity orchestrator.",BODYL))
st+=bullets([
 "<b>Start provider-side</b> on clearinghouse APIs; a near-$0 MVP is feasible on free/sandbox tiers with synthetic data.",
 "<b>Stay multi-vendor</b> — abstract clearinghouses behind our connectivity engine so no single vendor (or its pricing) locks us in.",
 "<b>Invest the moat</b> in payer intelligence, denial/appeal reasoning, patient-estimate logic and cross-channel orchestration — the parts no clearinghouse sells.",
 "<b>Add payer-side</b> capabilities as decision-support after validation, with a qualified clinician owning every adverse medical-necessity decision.",
 "<b>Verify live pricing</b> before board commitment — most production rates are usage-tiered or QUOTE REQUIRED."])
st.append(callout("Strategic conclusion",
 "Clearinghouse + Direct Payer APIs + FHIR + Portal + AI Voice + Human — controlled by an AI Connectivity Orchestrator. The clearinghouse solves connectivity; we own the intelligence and orchestration above it. That is a differentiated platform, not another clearinghouse and not just an AI-calling app."))

# APPENDIX SOURCES
st.append(PageBreak()); sec("Appendix. Sources")
st.append(para("Every pricing, coverage and API-availability claim is tied to a source. Full URLs are hyperlinked in the workbook SOURCES sheet.",SMALL))
st.append(vtable(["Source","Date","Confidence"],[[v[0],v[2],v[3]] for v in D.SOURCES.values()],[4.9*inch,0.9*inch,1.1*inch]))

doc.multiBuild(st)
import re as _re
pdfpages=len(_re.findall(rb"/Type\s*/Page[^s]",open(PDF,"rb").read()))
print("PDF pages:",pdfpages)

if __name__=="__main__":
    print("done:",XLSX,PDF)
