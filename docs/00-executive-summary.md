# 00 · Executive Summary

## The problem

Every organization repeatedly answers the same question about a different counterparty:

> *"Can I safely and compliantly do business with this entity?"*

The entity changes — a supplier, a contractor, a candidate, a distributor, a consultant, a partner — but the work is identical: collect documents, chase the counterparty, verify against some authority, form a judgment, file the evidence, and repeat it in twelve months.

Today that work is spread across email threads, spreadsheets, a shared drive, three different verification agencies, a KYC API bolted onto a procurement tool, and an HR vendor that does background checks. Nobody owns the record. When a regulator, customer auditor or litigator asks *"how did you verify this vendor in 2024?"*, the answer is a search through inboxes.

**Three structural failures:**

1. **The work is repeated.** The same supplier is verified from zero by every buyer that onboards it. Nationally this is enormous duplicated cost.
2. **The evidence is not durable.** Verification produces a decision, not a defensible, timestamped, sourced record.
3. **It goes stale immediately.** A vendor verified in January can have a cancelled GST registration, a struck-off director and a lapsed licence by March. Nobody re-checks.

## The product

BID Trust is a horizontal verification and due-diligence platform with four layers:

| Layer | What it does |
|---|---|
| **Policy Engine** | The enterprise defines what "verified" means for *this* relationship type — checks required, thresholds, expiry, approvals, escalation. Industry differences live here as configuration. |
| **Orchestration Engine** | Routes each required check to authorized providers — registry lookups, regulated intermediaries, licensed commercial providers, issuer attestation, human field verification — with fallback, cost control and response normalization. |
| **Evidence & Consent Layer** | Every result is stored as tamper-evident evidence with source, method, timestamp, scope and validity. Every disclosure is governed by a purpose-bound, revocable consent artifact. |
| **Trust Surface** | The BID ID, the BID Card, the public profile, the authorized view — how verified status travels between organizations. |

## The ABC example, in one paragraph

ABC Company needs to onboard ten suppliers. It creates a Vendor Verification Campaign under its "Critical Supplier" policy and adds ten vendors. Each vendor receives a secure invitation, claims or creates its BID profile, and completes only what the policy requires. BID orchestrates the checks through authorized providers. ABC receives, per vendor: BID ID, verification status, verification level, an explainable risk assessment, a verification summary, permitted evidence, verification date, freshness/expiry and a full audit trail. ABC does **not** receive every raw document — the platform enforces **minimum necessary disclosure**, and the vendor controls scope where the law and the buyer's legitimate purpose allow.

## Why this compounds

Vendor XYZ was verified because ABC asked. Six months later DEF wants to onboard XYZ. XYZ already has a BID profile with current, in-scope credentials. DEF's policy decides what it will accept and what it still needs — but the marginal cost of the second verification is a fraction of the first.

```
Enterprise buys BID
        ↓
invites its vendor base
        ↓
vendors create BID profiles
        ↓
reusable verified identity
        ↓
a new buyer onboards them cheaply
        ↓
that buyer becomes a customer
        ↓
more enterprises, denser network
```

Cost per verification falls with network density. Price does not. That gap is the business.

## Revenue

Ten lines, anchored on enterprise SaaS plus consumption:

- Platform subscription — **from ₹9,999/month (Starter)** to **₹1,00,000+/month (Enterprise)**
- Per-verification charges — **from ₹499/check**
- Candidate & employee BGV packages — **from ₹499/package**
- Enhanced due diligence — **from ₹999**
- Continuous monitoring — **from ₹49/entity/month**
- API access, re-verification, contractor workforce, integrations, and an optional business-side BID Pro subscription

**All figures are starting prices for modelling, not market prices.** Final pricing follows verified provider quotations, manual verification cost, failure rates and margin targets — see [§13 Unit Economics](13-unit-economics.md).

## Go-to-market

Wedge on **vendor/supplier onboarding** — the buyer has budget, a named owner (procurement/compliance), an auditable pain, and a vendor list that seeds the network. Land with a 10-vendor paid pilot, expand to 50, then 100, then an annual contract. Bengaluru and Karnataka first, mid-market manufacturing, IT/BPO, healthcare, construction, logistics and facility management — while keeping the platform strictly industry-agnostic.

Secondary wedges, in order: candidate BGV → contractor workforce verification → continuous third-party risk monitoring.

## What must be true for this to work

1. Enterprises will pay for verification-as-workflow, not just verification-as-API. *(Validate in pilots.)*
2. Provider costs allow a defensible gross margin at ₹499-class price points. *(Validate with real quotations — the single biggest open number.)*
3. Vendors will complete an invited verification at acceptable rates. *(Completion rate is the operational metric that decides whether the network effect ever starts.)*
4. Reuse is legally and commercially acceptable to buyers under their own policies. *(Validate with counsel and with pilot customers.)*

## What BID is not

Not a KYC/KYB API company. Not a background verification agency. Not a vendor management system. Not an ERP. Not a government identity. Not a credit bureau. Not an Account Aggregator.

BID is the **trust infrastructure layer** that sits above all of those and uses them.
