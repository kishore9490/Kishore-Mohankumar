# 05 · Verification Provider Orchestration

## 5.1 The principle

> **BID does not build verification data sources. BID builds the layer that makes many sources usable, reliable, auditable and economical.**

Attempting to build direct integrations to every registry, bureau and institution is a strategic error: it is slow, some channels are legally restricted, and it produces no defensible advantage. The defensible advantage is the **orchestration layer** — routing, fallback, normalization, confidence, evidence, cost control and audit.

```
        Verification Request
                │
        ┌───────▼────────┐
        │ Policy Engine  │  what checks are required, at what level
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │ Reuse & Cache  │  is there a valid, in-scope, consented result?
        └───────┬────────┘   ← the margin engine (§5.7)
                │ miss
        ┌───────▼────────┐
        │ Provider Router│  capability · eligibility · cost · health · confidence
        └───────┬────────┘
                │
    ┌───────┬───┴───┬───────┬────────┐
Provider  Provider Provider Human   Issuer
   A         B        C     ops    attestation
    └───────┴───┬───┴───────┴────────┘
                │
        ┌───────▼────────┐
        │  Normalizer    │  → canonical schema, confidence, exceptions
        └───────┬────────┘
        ┌───────▼────────┐
        │ Evidence Store │  immutable, hashed, classified, retention-stamped
        └────────────────┘
```

## 5.2 Source classes — and being honest about access

**Do not claim that every government API is directly available to BID.** Marketing, sales decks and product copy must distinguish these clearly. Conflating them is both a credibility risk with sophisticated enterprise buyers and, potentially, a regulatory one.

| Class | What it is | Access reality |
|---|---|---|
| **S1 — Authoritative registry** | The government system of record (MCA, GST, Udyam, IEC) | Access is typically via official portals, authorized intermediaries (e.g. GST Suvidha Providers), or licensed data providers. Terms, rate limits and permitted uses vary per source. |
| **S2 — Regulated intermediary** | Account Aggregator ecosystem, credit information companies | Statutorily regulated. Participation requires specific authorization or a regulated partner. **Counsel required before design assumes access.** |
| **S3 — Licensed commercial provider** | Verification, screening and data vendors | Commercially contracted. The bulk of day-one coverage. |
| **S4 — Issuer attestation** | The body that issued the credential confirms it | Highest trust for credentials. Often manual, often slow. |
| **S5 — Human verification** | Field agents, telephonic, in-person | Required for L4. Real cost, real margin pressure, real value. |
| **S6 — Self-declared + document** | Entity submits, BID checks authenticity | The floor, never the ceiling. |
| **S7 — Public information** | Websites, published listings, media | Corroborating signal only. Never sufficient alone. |

**Absolute constraints — non-negotiable, enforced in architecture and contract:**

1. **BID never scrapes bank accounts** and never asks for or stores banking credentials. Financial data flows only through the consent-based, regulated ecosystem or a regulated partner.
2. **BID never bypasses a regulated data-sharing framework**, and never uses an unauthorized route because it is cheaper or faster.
3. **BID never presents restricted data it is not authorized to access**, and product design must not assume access pending legal confirmation.
4. **BID honours each provider's terms** on permitted use, retention, redistribution and caching. Reuse economics ([§5.7](#57-reuse-and-caching--the-margin-engine)) depend entirely on contract terms that permit it — negotiate this explicitly in every provider agreement, because a no-caching clause silently destroys the business model.

## 5.3 The provider abstraction

Every provider implements the same internal contract, so that swapping one costs configuration rather than engineering:

```
interface VerificationProvider {
  capabilities()   → [check types, entity types, jurisdictions]
  eligibility()    → [authorizations held, permitted uses, restrictions]
  execute(request) → RawResponse
  cost(request)    → expected cost
  sla()            → expected latency, availability
  health()         → live status
}
```

And every response normalizes into one canonical shape:

```json
{
  "check_type": "GST_REGISTRATION",
  "entity": "BID-BUS-100821",
  "outcome": "VERIFIED",
  "verification_level": "L2",
  "confidence": "HIGH",
  "source_class": "S1",
  "provider": "BID-PRV-0007",
  "attributes": {
    "gstin": "29AABCX1234M1ZP",
    "legal_name": "XYZ Components Private Limited",
    "status": "ACTIVE",
    "registration_date": "2019-07-01",
    "taxpayer_type": "REGULAR"
  },
  "name_match": { "score": 0.97, "method": "normalized_token_jaccard" },
  "exceptions": [],
  "evidence": ["BID-EVD-9912004"],
  "executed_at": "2026-08-15T14:22:00+05:30",
  "valid_until": "2026-11-13",
  "cost_paise": 1200
}
```

**Normalization is the hard, valuable part.** Every provider returns different field names, different status vocabularies, different name formats and different error semantics. The canonical schema is what lets a customer switch providers without noticing, lets BID arbitrage cost, and lets the assessment engine reason consistently. It is genuinely difficult and it is where much of the engineering value sits.

## 5.4 Routing

The router selects a provider per check using, in order:

1. **Capability** — can this provider perform this check for this entity type and jurisdiction?
2. **Eligibility** — is this route legally permitted for this purpose, with consent in place?
3. **Confidence requirement** — does the policy demand a level this provider can reach? (An S6 route cannot satisfy an L3 requirement.)
4. **Health** — is the provider currently up and inside SLA?
5. **Cost** — cheapest qualifying route.
6. **Customer preference** — some enterprises mandate a specific provider; honour it.

```
Check: BANK_ACCOUNT_OWNERSHIP  ·  required level L3

  Provider A  ✓ capable  ✓ eligible  ✓ L3  ✓ healthy  ₹8.00   ← selected
  Provider B  ✓ capable  ✓ eligible  ✓ L3  ✓ healthy  ₹11.00  ← fallback 1
  Provider C  ✓ capable  ✓ eligible  ✗ L2  ✓ healthy  ₹4.00   ← ineligible: level
```

## 5.5 Reliability

| Mechanism | Behaviour |
|---|---|
| **Fallback chain** | On failure or timeout, retry the next qualifying provider automatically. |
| **Retry policy** | Exponential backoff for transient errors. **Never retry a definitive negative** — a "not found" from an authoritative registry is an answer, and retrying it is a billed way to get the same answer. |
| **Circuit breaker** | Trip a provider out of the pool after an error-rate threshold; probe for recovery. |
| **Idempotency** | Every request carries an idempotency key. Network failures must never cause double-billing or duplicate checks. |
| **Timeout budget** | Per check and per campaign, so one slow source cannot stall an entire onboarding. |
| **Graceful degradation** | If no provider can satisfy a check, return `INSUFFICIENT_EVIDENCE` with the reason — never a fabricated or implied result, and never a silent pass. |
| **Async by default** | Human and issuer-attested checks take days. The architecture is event-driven end to end; anything else will not survive first contact with a university registrar. |

## 5.6 Provider management

- **Cost ledger** — every call records provider, check, cost and outcome. Cost per verification must be knowable per tenant, per policy and per check on any given day; without this the unit economics in [§13](13-unit-economics.md) are guesses forever.
- **SLA monitoring** — latency percentiles, success rate, error taxonomy, availability, tracked against contract.
- **Quality monitoring** — disagreement rate between providers on the same entity. When two sources disagree, that is a data-quality signal worth acting on, and occasionally a fraud signal.
- **Reconciliation** — provider invoices matched against the internal call ledger. Billing disputes with data vendors are routine.
- **Contract terms to secure explicitly:** permitted use, redistribution rights, **caching and reuse rights**, retention obligations, volume pricing tiers, liability, and data-protection terms.
- **Concentration risk** — no single provider should be unreplaceable for a check type that a signed enterprise policy requires. Maintain at least two qualified routes for every REQUIRED check in a shipped template.

## 5.7 Reuse and caching — the margin engine

This is where BID's economics are actually made, and it deserves engineering and legal attention far beyond its apparent size.

```
Request: verify XYZ Components under ABC's Critical Supplier policy

  GST_REGISTRATION     cached, 12 days old, policy allows 90d  → REUSE  ₹0
  CORPORATE_IDENTITY   cached, 40 days old, policy allows 365d → REUSE  ₹0
  PAN_VERIFICATION     cached, 40 days old                     → REUSE  ₹0
  BANK_OWNERSHIP       not cached for this scope               → FETCH  ₹8
  SANCTIONS            cached, 45 days old, policy allows 30d  → FETCH  ₹6
  DIRECTORS            cached, 40 days old                     → REUSE  ₹0

  Marginal provider cost: ₹14 against a first-verification cost of ₹120+
```

Reuse is governed by four gates, all of which must pass:

1. **Freshness** — within the requesting policy's maximum accepted age.
2. **Scope** — the cached result covers what is being asked, at the required level.
3. **Consent** — the entity has authorized disclosure to this requester for this purpose.
4. **Provider terms** — the provider contract permits reuse and redistribution.

Gate 4 is a commercial negotiation, not a technical detail. **Secure caching and reuse rights in every provider contract from the first one signed.** A provider agreement that forbids result reuse turns BID into a pass-through reseller with no margin expansion path, and renegotiating it later from a position of dependency is far harder than negotiating it at the start.

## 5.8 Building selectively

BID should build, rather than buy, only where the capability is core, differentiating and not restricted:

**Build:** orchestration, policy, normalization, evidence, consent, assessment, audit, monitoring, document anomaly detection, entity resolution, the network graph, and the human-operations workflow tooling.

**Buy:** every registry and screening data source, identity infrastructure, banking rails, credit and financial data, court records, media monitoring.

**Partner:** human field verification networks, sector certification bodies, and regional operational coverage.

**Never:** anything requiring an authorization BID does not hold, or a route that circumvents a regulated framework.
