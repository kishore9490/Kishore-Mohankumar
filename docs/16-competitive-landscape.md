# 16 · Competitive Landscape

> **⚠ Verify before relying on this.** The company names below are illustrative of *categories*, drawn from general market knowledge that may be out of date. Positioning, ownership, funding and product scope change constantly, and several of these markets have consolidated in recent years. **Commission proper desk research and validate against current sources before using any of this in a pitch, a board deck or an investor conversation.** What is durable here is the *structure* of the landscape, not the roster.

## 16.1 The five competing categories

BID does not have one competitor. It has five categories that each own a slice of the problem, plus the incumbent that beats everyone.

```
                         DEPTH OF WORKFLOW
                    shallow ──────────────► deep
        broad  ┌─────────────────┬─────────────────┐
               │  KYC/KYB API    │   ★ BID TRUST   │
   BREADTH     │  providers      │                 │
   OF ENTITY   ├─────────────────┼─────────────────┤
   COVERAGE    │  Point tools    │  TPRM platforms │
               │  Doc verifiers  │  BGV agencies   │
       narrow  └─────────────────┴─────────────────┘
```

### Category 1 — KYC/KYB API providers

*Indian examples to verify: IDfy, Signzy, HyperVerge, Perfios/Karza, Bureau, and similar.*

**They have:** deep data-source coverage, mature APIs, scale, established BFSI relationships, real capital.
**They lack:** enterprise workflow, policy engines, vendor-facing experience, continuous monitoring as a product, cross-entity coverage (business *and* people *and* workforce), and an audit-grade record.
**How they compete:** on price per call and on source coverage.
**BID's answer:** *they are potential suppliers, not just rivals.* BID buys from this layer. The risk is that one of them moves up into workflow — which is a genuine threat, and the mitigation is that moving up-stack requires an enterprise sales motion and a product culture that API companies typically find difficult.

### Category 2 — Background verification agencies

*Indian examples to verify: AuthBridge, OnGrid, SpringVerify, First Advantage India, and others.*

**They have:** operational scale, employer relationships, institutional verification networks, brand trust in HR.
**They lack:** business/vendor verification depth, policy configurability, self-serve workflow, monitoring, and software margins.
**How they compete:** on price and turnaround, with a services model.
**BID's answer:** do **not** compete head-on in commodity BGV ([§13.4](13-unit-economics.md#134-the-three-findings-that-matter)). Enter BGV as an *extension* of an existing vendor-verification relationship. Some of these agencies are better partners than competitors — BID can be their orchestration and record layer.

### Category 3 — Third-party risk management platforms

*Global examples to verify: Certa, Aravo, Coupa Risk Assess, Prevalent, Venminder, and similar; plus emerging Indian entrants.*

**They have:** mature enterprise workflow, established large-enterprise footprints, strong compliance positioning.
**They lack:** Indian data-source depth, Indian pricing, MSME-appropriate vendor experience, people/workforce coverage, and the network reuse model.
**How they compete:** enterprise-grade features and global consistency, at global prices.
**BID's answer:** win on Indian data depth, Indian price points, the vendor-side experience for MSMEs, and coverage of contract workforce that none of them address. Assume they will come downmarket eventually; build the network before they do.

### Category 4 — Vendor management & procurement suites

*Examples to verify: SAP Ariba, Coupa, Zycus, GEP, JAGGAER.*

**They have:** the system of record, the buyer relationship, the vendor master data, enormous distribution.
**They lack:** verification depth. Onboarding modules typically collect documents rather than verify them.
**How they compete:** *"this is already in your suite."* — the most dangerous objection BID will face in large accounts.
**BID's answer:** **integrate, never compete.** Position as the verification layer that plugs into the suite. *"Ariba collects the documents. We verify them and keep them current."* Being the verification engine inside a procurement suite is a better outcome than fighting one.

### Category 5 — Manual and internal processes

**This is the real incumbent and it wins most deals.**

Spreadsheets, email, a shared drive, a CA firm, and a person who has always done it this way. It is free at the point of use, nobody has to be convinced, and it carries no procurement cycle.

**How it wins:** inertia, no budget line, no perceived urgency.
**BID's answer:** find the trigger event ([§14.1](14-gtm.md#141-who-actually-buys)). Organizations do not replace a working-enough manual process without a precipitating incident — a failed audit, a fraud, a lost contract, a safety incident. Prospecting should target those triggers rather than company attributes alone.

## 16.2 Where BID is genuinely differentiated

Honest assessment — three real differentiators, one qualified, and one that is currently just a claim.

| # | Differentiator | Strength | Defensibility |
|---|---|---|---|
| 1 | **Business + people + workforce in one policy engine** | Genuinely rare. Nobody credibly covers vendors, contractors *and* employees in one configurable engine. | **Strong** — it is an architectural choice competitors cannot retrofit cheaply |
| 2 | **Contractor workforce verification (Layer 2)** | Almost entirely unserved. Real statutory and safety pain. | **Strong** — hard, unglamorous, high-volume; incumbents have ignored it |
| 3 | **Continuous monitoring as a product, not a report** | Most competitors do point-in-time verification. | **Medium** — copyable, but requires an architecture built for it |
| 4 | **Reusable verified identity / network** | The biggest long-term moat *if it works*. | **Potentially very strong, currently unproven** — worth nothing until density exists ([§10.5](10-reusable-profile.md#105-the-cold-start-problem)) |
| 5 | **Explainable, non-black-box assessment** | Correct and differentiating with sophisticated buyers. | **Weak as a moat** — easily copied; it is a trust position, not a technology advantage |

**What BID does *not* have:** data-source depth (competitors have years of integrations), brand, scale, capital, enterprise references, or certifications. Every one of those is a real disadvantage in an enterprise sale, and the GTM plan compensates by selling to mid-market first, where those gaps matter less.

## 16.3 The competitive risks that actually matter

| Risk | Likelihood | Impact | Response |
|---|---|---|---|
| A well-capitalized KYB API provider moves up into workflow | **High** | High | Move fast on workflow depth and the vendor-side experience; build network density early; make the contractor workforce module a beachhead they have no reason to enter |
| A procurement suite adds real verification | Medium | High | Become their integration partner before they build; the ROI on building it themselves is poor if BID is already embedded |
| A BGV agency builds a business-verification platform | Medium | Medium | Partner with them; their culture is services, and services companies rarely build good software |
| A global TPRM platform localizes for India | Medium | Medium | Own the MSME vendor experience and Indian data depth — the parts that are hardest to localize |
| Price war in commodity verification | **High** | Medium | Do not participate. Compete on workflow, record and continuity ([§12.13](12-revenue-model.md#1213-pricing-principles)) |
| A provider becomes a competitor | Medium | High | Multi-source every REQUIRED check ([§05.6](05-provider-orchestration.md#56-provider-management)); never depend on a single provider for a check a signed policy requires |

That last row deserves attention: BID's suppliers are the most natural competitors it has. Provider concentration is therefore a *strategic* risk, not just an operational one, and the two-qualified-routes rule should be treated as non-negotiable.

## 16.4 The strategic position

> BID should not try to be the best KYB API, the cheapest BGV provider, or a vendor management system.
>
> It should be **the layer that makes verification usable** — the policy, the workflow, the evidence, the continuity and the network — and buy the data from everyone else.

This position is defensible because:
- It requires enterprise workflow depth that API companies find culturally hard to build
- It requires data-source breadth that workflow companies find expensive to acquire
- It requires a vendor-side network that neither can build without a buyer-side customer base
- It requires being trusted by both sides of a transaction, which is a slow, compounding asset

And it is vulnerable because:
- It sits between two well-capitalized layers, either of which could expand into it
- The network moat does not exist until it exists
- Nothing here is protected by patents or by switching costs in year one

**Therefore: speed on the workflow, discipline on the wedge, and relentless focus on network density in one region before expanding.** The window in which this position is available is measured in a few years, not many.
