# 01 · Business Concept & Positioning

## 1.1 The core question

Everything BID Trust builds serves one question:

> **"Can I safely and compliantly do business with this entity?"**

Not *"is this document real?"* — that is a feature. Not *"what is this company's credit score?"* — that is a bureau. The question is a **decision** question, asked by a named person with accountability, about a specific counterparty, for a specific purpose, at a specific moment.

BID's job is to make that decision **fast, consistent, evidenced and defensible**.

## 1.2 The workflows BID absorbs

| Workflow | Who owns it today | What breaks |
|---|---|---|
| Vendor onboarding | Procurement | Manual doc collection, weeks of lag |
| Supplier onboarding | Supply chain / SCM | No standard, every category ad hoc |
| Business partner onboarding | BD / Legal | Diligence depth is arbitrary |
| Employee hiring | HR | Outsourced to a BGV agency, opaque |
| Candidate background verification | HR / TA | Slow, delays joining dates |
| Contractor onboarding | Operations / EHS | Contractor company checked, workers not |
| Third-party workforce verification | Site / plant / facilities | Almost entirely unmanaged |
| Consultant verification | Function head | Rarely done at all |
| Distributor verification | Sales | Done once, never refreshed |
| Service provider verification | Admin / IT | Fragmented by department |
| Compliance verification | Compliance | Point-in-time, spreadsheet-tracked |
| Periodic re-verification | Nobody | Falls through the cracks |
| Risk monitoring | Nobody | Discovered after the incident |

The last three rows are the important ones. **Re-verification and monitoring have no owner in most organizations.** That is where BID's recurring revenue and its genuine differentiation live — a one-time check is a commodity; a maintained one is not.

## 1.3 The definitive ABC example

This is the canonical narrative for the product, the pitch and the demo.

### Step 1 — ABC sets policy

ABC Company has to onboard ten new suppliers. ABC's compliance and procurement teams have already defined, once, what verification a critical supplier requires. In BID this is a **Verification Policy** — a reusable, versioned object.

```
Policy: "ABC Critical Supplier v2.1"
  Identity      GST · PAN · MCA · registered address        [REQUIRED]
  Financial     Bank account ownership · turnover band      [REQUIRED]
  Ownership     Directors · beneficial ownership            [REQUIRED]
  Compliance    ISO 9001 · category licences                [REQUIRED]
  Risk          Sanctions/AML · litigation screening        [REQUIRED]
  Freshness     12 months · re-verify annually
  Approval      Auto-approve LOW · manual review MEDIUM · block HIGH
```

### Step 2 — ABC creates a campaign

```
Campaign: BID-CAMP-4471902
Policy:   ABC Critical Supplier v2.1
Entities: 10 vendors
```

### Step 3 — Vendors are invited

Each vendor receives a secure, single-purpose invitation:

```
XYZ Components
PQR Logistics
DEF Supplies
LMN Technologies
… 6 more
```

The invitation states plainly: who is asking, why, what is required, what will be shared with ABC, and what will not.

### Step 4 — Vendors claim or create a BID profile

A vendor that already has a BID profile **claims the invitation** and reuses current, in-scope credentials. A new vendor creates a profile and submits only what the policy requires.

This is the single most important interaction in the product. If it is slow or confusing, the campaign stalls and the network never forms. **Vendor-side completion rate is a first-class product metric, tracked from day one.**

### Step 5 — BID orchestrates verification

Each required check routes to an authorized provider. Results are normalized, scored for confidence, stored as evidence with source and timestamp, and assembled into a verification record. See [§05 Provider Orchestration](05-provider-orchestration.md).

### Step 6 — ABC receives the result

```
XYZ Components
BID ID              BID-BUS-100821
Status              VERIFIED
Verification Level  Standard Supplier
Assessment          LOW RISK
Last Verified       15 Aug 2026
Valid Until         15 Aug 2027
Evidence            12 checks · 12 passed · 0 exceptions
Audit Trail         complete
```

ABC's dashboard shows the campaign in aggregate:

```
10 vendors invited
 7 verified
 2 in progress
 1 exception — PQR Logistics: GST registration status CANCELLED
```

### Step 7 — What ABC does *not* get

ABC does **not** automatically receive every raw document, every bank statement, every director's personal identifier. The platform enforces **minimum necessary disclosure**: ABC receives the verification *outcome*, the *evidence sufficient to justify reliance*, and nothing beyond its stated purpose.

Where ABC has a legitimate need for more, it makes an **Authorized Verification Request** and the vendor consents to that specific, scoped, time-boxed disclosure. See [§08](08-consent-and-authorized-view.md).

### Step 8 — It stays alive

The record does not end at onboarding. PQR's GST status change, a director disqualification, a lapsed ISO certificate, an expiring licence, a sanctions-list hit — these raise alerts against the live relationship. Re-verification triggers on the policy's schedule. **This converts a transaction into a subscription.**

## 1.4 Positioning

**Primary:**
> **Trust, backed by verification.**

**Alternative:**
> **Verify. Trust. Do Business.**

**The one-line pitch:**
> BID Trust is an enterprise verification and due-diligence platform that verifies the businesses and people you do business with — against your own policy, through authorized data sources, with an auditable record you can defend to a regulator, a customer or a court.

**The category:** *Enterprise Trust Infrastructure.* BID should not compete inside "KYC APIs" or "BGV services" — both are price-driven, commoditizing markets. It should define and own the layer above them.

## 1.5 What BID is not — and why each boundary matters

| Not a… | Why the boundary is strategic |
|---|---|
| **KYC/KYB API company** | APIs sell on price per call and race to zero. BID sells workflow, policy, evidence and continuity — and *buys* those APIs. |
| **Background verification agency** | Agencies sell labour and scale linearly with headcount. BID sells software with an orchestration layer that includes human verification as one source class among many. |
| **Vendor management system** | A VMS manages the commercial relationship — POs, catalogs, invoices, performance. BID answers a prior question and integrates with the VMS rather than replacing it. Trying to be a VMS means fighting SAP Ariba and Coupa. Don't. |
| **ERP** | Never. BID integrates with ERP master data; it is not a system of record for transactions. |
| **Government identity** | BID issues no identity of the state. A BID ID is a platform identifier that *references* government-issued identity verified through authorized channels. This distinction must survive into every piece of marketing copy. |
| **Credit bureau** | Credit information in India is regulated (CICRA 2005); bureaus and their specified users operate under a statutory regime. BID must not present its assessment as a credit rating or credit score. Where credit data is used at all, it must be through a lawfully authorized route. **Counsel required.** |
| **Account Aggregator** | An AA is an RBI-regulated NBFC-AA. BID is not one and must not describe itself as one. Where financial data is needed with consent, BID consumes it through the AA ecosystem as an authorized participant or via a regulated partner. **Counsel required.** |

**Rule for all marketing, sales and product copy:** never imply state authority, never imply a regulated licence BID does not hold, never imply a rating BID does not produce.

## 1.6 The trust model

BID does **not** say *"this company is trustworthy."* That is a judgment BID has no standing to make and enormous liability in making.

BID says:

> *"BID provides verified evidence that helps organizations make informed business decisions."*

Every assertion BID publishes carries six attributes:

| Attribute | Example |
|---|---|
| **Source** | Authoritative registry — MCA via authorized channel |
| **Method** | Registry lookup, CIN exact match |
| **Timestamp** | 15 Aug 2026, 14:22 IST |
| **Scope** | Corporate identity and status only |
| **Verification level** | L2 — Source Verified |
| **Validity** | 12 months, subject to change monitoring |

And every assertion is bounded. BID says *"verified against source X on date Y"*, never *"is legitimate"*, never *"is safe"*, never *"is guaranteed"*. Absolute language is a legal exposure and an intellectual dishonesty. The terms of service, the UI copy and the sales deck must agree on this.

## 1.7 Why now

- **Regulatory pressure is rising.** India's DPDP Act 2023 raises the cost of careless handling of personal data — which pushes ad hoc BGV and document-collection practices toward governed platforms.
- **Digital public infrastructure has matured.** GST, MCA, Udyam, DigiLocker, NPCI rails and the Account Aggregator framework mean verification can now be programmatic rather than manual — for entities authorized to use each channel.
- **Supply chains are under scrutiny.** Export customers, large buyers and ESG requirements increasingly push diligence obligations down the tiers. The mid-market supplier is now being asked to prove things it has never had to prove.
- **The verification market in India is fragmented.** Many capable point-solution vendors, no dominant workflow-and-record layer across both business and people verification.

## 1.8 The strategic bet, stated plainly

Point verification is a commodity heading to zero. **The durable asset is the maintained, consented, reusable record of who an entity is** — and the network of organizations that rely on it.

BID should be willing to run thin margins on individual checks in order to own that record.
