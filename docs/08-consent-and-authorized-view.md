# 08 · Consent & the Authorized Verification View

## 8.1 The disclosure ladder

Information in BID sits at one of four disclosure tiers. Movement up the ladder always requires an explicit, recorded authorization.

```
TIER 0 — PUBLIC
  Anyone with the BID ID
  Verification status, level, dates, published credentials,
  company-provided profile information

TIER 1 — RELATIONSHIP
  A counterparty in an active, consented relationship
  Check-level outcomes, exceptions, assessment band and factors,
  validity dates, audit trail

TIER 2 — AUTHORIZED
  A counterparty with specific, scoped, time-boxed consent
  Financial verification detail, ownership and UBO detail,
  risk screening detail, supporting evidence

TIER 3 — RESTRICTED
  Never disclosed to counterparties under any circumstances
  Raw banking data, personal data beyond stated purpose,
  other tenants' relationships, source credentials,
  a person's background results outside the requesting employer
```

The governing rule across all tiers: **minimum necessary disclosure**. The buyer receives what it needs to make and defend its decision, and nothing more. A buyer who wants "everything" is asked what decision the extra data serves — and usually cannot answer.

## 8.2 The Authorized Verification Request flow

The public profile is deliberately limited. Deeper disclosure runs through a consent workflow.

```
1  REQUEST
   ABC requests, against XYZ's profile:
     ✓ Financial verification
     ✓ Bank account verification
     ✓ Ownership / UBO detail
     ✓ Risk screening detail

   ABC must state:
     · purpose            "Critical supplier onboarding — Contract CT-2026-88"
     · legal basis        contractual necessity / legitimate business purpose
     · retention period   36 months
     · recipients         procurement + compliance, named roles
     · duration           12 months, auto-expiring

2  NOTICE
   XYZ receives:
     "ABC Company has requested additional verification."

   Shown in plain language:
     · who is asking, and their verified identity
     · exactly what will be disclosed, item by item
     · exactly what will NOT be disclosed
     · why, for how long, and to whom
     · how to revoke later
     · what happens if they decline

3  DECISION
   XYZ can:
     · authorize in full
     · authorize selectively, item by item
     · decline, with an optional reason
     · counter-offer a narrower scope

4  CONSENT ARTIFACT
   On authorization, a consent record is created:

     BID-CON-4471902
       grantor        BID-BUS-100821  (XYZ)
       grantee        BID-BUS-100455  (ABC)
       scope          [financial_summary, bank_ownership,
                       ownership_detail, risk_screening]
       purpose        "Critical supplier onboarding — CT-2026-88"
       granted_at     2026-08-15T14:22:00+05:30
       expires_at     2027-08-15
       revocable      true
       method         authenticated portal action
       artifact_hash  sha256:7c1e…

5  EXECUTION
   BID performs or reuses the authorized checks
   and discloses only what the consent scope permits.

6  RECEIPT
   Both parties receive a consent receipt.
   XYZ sees a permanent, filterable list of every party
   holding consent, with one-click revocation on each.

7  EXPIRY / REVOCATION
   On expiry or revocation, ABC's access to Tier-2 data ends.
   ABC retains its historical verification record
   (it must, for its own audit defence) but receives
   no further updates and no renewed access.
```

Step 7's nuance matters. Consent revocation cannot retroactively erase a buyer's audit record of a decision it lawfully made — the buyer needs that record to defend the decision. What revocation stops is *ongoing* access, *future* disclosure and *continued* monitoring. This distinction must be explained clearly to the grantor at the time of granting, not discovered later.

## 8.3 Consent design principles

| Principle | Implementation |
|---|---|
| **Specific** | Consent names exact data items, never a blanket "share my information" |
| **Informed** | Plain-language notice, in English and major Indian languages, showing what is and is not shared |
| **Purpose-bound** | Every consent carries a stated purpose; use outside it is a policy violation enforced in code, not in guidelines |
| **Time-boxed** | Every consent expires. There is no perpetual consent in the system. |
| **Revocable** | One-click revocation, always available, never buried |
| **Auditable** | Immutable consent artifact with hash, timestamp, method and IP/device context |
| **Granular** | Item-level authorization, not all-or-nothing |
| **Free** | Declining must be genuinely possible — see §8.5 |

**Anti-patterns, explicitly forbidden:**
- Pre-ticked authorization boxes
- Consent bundled into terms of service acceptance
- "Authorize all" as the only path forward
- Dark patterns making decline harder than accept
- Requesting broader scope than the stated purpose requires
- Any implication that BID will penalize a decline

## 8.4 The person-side consent flow

For employee and candidate BGV, the obligations are stronger and the power imbalance is real.

```
1  Employer initiates a check under a stated policy
2  Candidate receives notice BEFORE any check runs:
     · who the employer is
     · every check to be performed
     · the sources to be contacted
     · what the employer will and will not see
     · retention period
     · dispute rights and how to exercise them
     · consequence of declining, stated honestly
3  Candidate authorizes, item by item where separable
4  Consent receipt issued to the candidate, retained by the candidate
5  Checks execute
6  Candidate can see their OWN complete result
7  Candidate can DISPUTE any finding before it is treated as final,
   with a defined turnaround (target: 5 working days)
8  Employer receives the result under its stated purpose only
```

Point 6 and 7 are not optional courtesies. A person must be able to see and challenge what is being said about them — it is fair, it is the direction of Indian data-protection law, and pragmatically it is BID's best defence against propagating an error. A platform that quietly circulates an unchallengeable wrong finding about a job applicant is doing real harm to a real person, and eventually it will do it at scale.

**The dispute workflow is a first-class product surface**, not a support email address. It needs: intake, evidence submission, re-verification, a reasoned outcome, notification to parties who received the disputed finding, and a permanent record of the correction.

## 8.5 The consent-under-pressure problem

Consent given by a supplier to a large buyer, or by a candidate to a prospective employer, is not consent between equals. This is a genuine ethical issue with the entire category, and BID cannot solve it — but it can refuse to make it worse.

**Mitigations built into the product:**

1. **Scope discipline** — BID validates that requested scope is proportionate to stated purpose, and flags requests that are not. A buyer asking for a director's personal financial detail to onboard a stationery supplier gets challenged by the platform.
2. **Templates default to narrow.** The easy path is the proportionate one. Expanding scope requires deliberate action and a justification field.
3. **Decline is a first-class outcome.** The UI never treats declining as a failure state, and never reports it to the requester as one.
4. **No retaliation surface.** BID does not report "declined" as an adverse signal, does not feed it into risk assessment, and does not surface it in a way that invites blacklisting.
5. **Buyer-side scope analytics** — a compliance head can see which of their own policies request more than they use, and tighten them.

BID should state this position publicly. It is a differentiator with sophisticated buyers, and it is the right posture regardless.

## 8.6 Consent state model

```
REQUESTED → GRANTED → ACTIVE → EXPIRED
                ↓         ↓
            DECLINED   REVOKED
                          ↓
                     Tier-2 access ends
                     Historical record retained
                     Monitoring stops
```

Every state transition is logged, timestamped, attributed and immutable.

## 8.7 What the requester actually sees

Under a standard relationship (Tier 1), with no additional authorization:

```
XYZ Components · BID-BUS-100821

Status              VERIFIED
Level               L3 — Corroborated
Assessment          LOW RISK
Verified            15 Aug 2026
Valid until         15 Aug 2027

Checks              12 required · 12 passed · 0 exceptions
  Identity          ✓ Verified          L2
  GST               ✓ Active            L2
  PAN               ✓ Verified          L2
  Bank ownership    ✓ Verified          L3
  Directors         ✓ Verified          L2
  Sanctions         ✓ Clear             L2
  Litigation        ✓ No adverse match  L2
  ISO 9001          ✓ Issuer-verified   L3

Monitoring          ACTIVE — 6 signals watched
Audit trail         [ View ]

Additional detail available on authorization  [ Request ]
```

Note what is absent: no GSTIN, no PAN, no bank number, no director names, no addresses, no documents. The buyer has everything needed to make and defend the decision. Everything further requires a reason and a consent.
