# 10 · Reusable Profile & the Network Effect

## 10.1 The core asset

A business should not start from zero every time it is onboarded.

Today, a supplier serving twenty customers submits the same documents twenty times, to twenty portals, in twenty formats, and is verified twenty times at twenty separate costs. The national waste is enormous and entirely structural.

```
WITHOUT BID
  XYZ → ABC   full verification   ₹X  ·  9 days
  XYZ → DEF   full verification   ₹X  ·  9 days
  XYZ → GHI   full verification   ₹X  ·  9 days

WITH BID
  XYZ → ABC   full verification   ₹X   ·  9 days   ← first buyer pays
  XYZ → DEF   delta verification  ₹X/6 ·  1 day
  XYZ → GHI   delta verification  ₹X/8 ·  hours
```

The second and third verifications cost a fraction because most attributes are already verified, current, and disclosable under consent. **Price does not fall proportionally. That gap is the business.**

## 10.2 The honest constraint

> **One verification is never automatically valid for every future buyer.**

This must be stated plainly in product, sales and contracts. Overpromising here is the single most likely way BID loses an enterprise deal on technical scrutiny — a competent compliance head will immediately ask "so I'm just trusting someone else's diligence?" and the answer must already be no.

**The receiving organization's policy always decides.** Reuse is subject to four gates:

| Gate | Question |
|---|---|
| **Freshness** | Is this result within the age the new buyer's policy accepts? |
| **Scope** | Does it cover what this buyer requires, at the level required? |
| **Consent** | Has the entity authorized disclosure to this buyer for this purpose? |
| **Policy** | Does the buyer accept network-sourced evidence for this check at all? |

Some buyers will accept none of it and re-run everything. That is their right, and BID should support it without friction — a policy flag turns reuse off entirely. Even then BID wins on workflow, evidence and monitoring.

## 10.3 What reuse looks like

```
DEF Manufacturing invites XYZ Components
Policy: DEF Standard Supplier v1.4 · 9 required checks

  Corporate identity   ✓ REUSED    verified 40d ago, policy allows 365d
  PAN                  ✓ REUSED    verified 40d ago
  GST registration     ✓ REUSED    verified 12d ago, policy allows 90d
  Directors            ✓ REUSED    verified 40d ago
  Bank ownership       ⟳ RE-RUN    DEF requires bank verified for its own
                                   payment records — policy override
  Sanctions            ⟳ RE-RUN    45d old, DEF policy allows 30d
  ISO 9001             ✓ REUSED    issuer-confirmed, valid to Feb 2027
  Address              ✓ REUSED    verified 40d ago
  Turnover             + NEW       not previously verified in scope

  6 reused · 2 re-run · 1 new
  Vendor effort:   1 consent action, 0 documents re-submitted
  Completion:      4 hours instead of 9 days
```

The vendor-side experience is the point. **One consent action instead of a document pack.** That experience is what makes vendors willing to be invited again, which is what makes the network grow.

## 10.4 The flywheel

```
        ┌──────────────────────────────────────────────┐
        │                                              │
        ▼                                              │
  Enterprise buys BID                                  │
        │                                              │
        ▼                                              │
  Invites its vendor base  (50 · 200 · 500)            │
        │                                              │
        ▼                                              │
  Vendors create BID profiles                          │
        │                                              │
        ▼                                              │
  Reusable verified identity accumulates               │
        │                                              │
        ├──────────────► Vendor shares BID ID          │
        │                with its other buyers         │
        │                       │                      │
        ▼                       ▼                      │
  A new buyer finds        Those buyers see            │
  onboarding cheap         the verified profile        │
  and fast                       │                     │
        │                        │                     │
        └────────┬───────────────┘                     │
                 ▼                                     │
        New enterprise customer ───────────────────────┘
                 │
                 ▼
        Denser network · lower marginal cost · stronger moat
```

### The five compounding loops

| Loop | Mechanism |
|---|---|
| **Supply loop** | Each enterprise brings hundreds of vendors into the network at its own expense |
| **Demand loop** | Verified vendors expose their BID ID to their other buyers, who become leads |
| **Cost loop** | Denser data means higher reuse rates means lower marginal cost per verification |
| **Data loop** | More entities means better entity resolution, better name matching, better anomaly detection across tenants |
| **Standard loop** | As BID Verified appears in more RFPs and POs, being un-verified becomes a commercial disadvantage |

The fifth loop is the endgame. When a mid-market supplier's customer asks for a BID ID in a tender, BID has stopped being software and become infrastructure.

## 10.5 The cold-start problem

Network effects are worthless until the network exists. Assume **no network value for the first 12–18 months** and make the product win on standalone merit.

**Sequencing:**

| Phase | What sells | Network state |
|---|---|---|
| **0–12 months** | Workflow, speed, evidence, audit trail, monitoring — value to a single customer with zero reuse | Seeding |
| **12–24 months** | The above plus meaningful reuse in dense categories | Regional density |
| **24+ months** | Reuse becomes a headline benefit; buyers ask for BID IDs | Compounding |

**Density beats breadth.** 500 verified suppliers in Karnataka automotive components is worth far more than 5,000 scattered across every sector in India, because reuse only fires when two buyers want the *same* entity. Concentrate deliberately: one region, a handful of adjacent categories, saturate, then expand.

**Anchor-customer strategy.** A single large manufacturer with 400 suppliers instantly creates category density that would take a year to build one mid-market customer at a time. Price the first two or three anchors aggressively — their vendor base is the asset being bought.

## 10.6 Making vendor completion work

The network dies at step three if vendors do not complete. **Vendor completion rate is the single most important operational metric in the company** for the first two years, tracked per campaign, per policy and per check.

| Failure mode | Countermeasure |
|---|---|
| Vendor doesn't understand who's asking | Buyer branding, verified buyer identity, human-language notice |
| Too many documents requested | Policy scope analytics; challenge over-broad policies at design time |
| Process too long | Progressive disclosure; save and resume; mobile-first |
| Vendor lacks digital capability | WhatsApp flow, regional languages, assisted onboarding, phone support |
| No incentive to finish | The reusable profile itself — completed once, reused across buyers |
| Fear of data misuse | Explicit "what ABC will and will not see" panel before anything is submitted |
| Wrong person received it | Role-based routing; let the recipient forward to the right colleague inside the flow |

**Design targets:** >80% completion within 7 days for a standard supplier policy; median vendor effort under 20 minutes for a first profile, under 3 minutes for a reuse.

Assisted onboarding — a BID operations person who calls the vendor and walks them through it — is expensive and unglamorous, and it will be necessary. Budget for it explicitly in [§13](13-unit-economics.md) rather than pretending self-serve will carry the MSME segment.

## 10.7 The vendor's own value proposition

BID must be worth something to the *vendor*, not just to the buyer that invited them. Otherwise every invitation is friction and the network never compounds.

**What the vendor gets:**
- A verified profile reusable across all buyers — submit once, not twenty times
- A shareable BID Card and public profile that signals credibility in tenders
- Advance warning of their own expiring licences and certifications
- Discoverability by other buyers, if they opt in
- Correction rights over their own record
- Control over who sees what, with visible revocation

**The optional BID Pro subscription** ([§12](12-revenue-model.md)) sits here: enhanced profile, multiple credentials, analytics on who viewed the profile, priority verification, and lead visibility. It should always remain optional — a vendor must never have to pay to be verified when a buyer has asked for it. Charging the supplier for the privilege of being onboarded would poison the network at its root.
