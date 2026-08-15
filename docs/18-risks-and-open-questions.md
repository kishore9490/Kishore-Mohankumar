# 18 · Risk Register & Open Questions

## 18.1 The risks that can kill this

Ranked by expected damage, not by likelihood.

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| 1 | **A data breach exposing personal or background data** | Low | **Fatal** | Data segregation, field-level encryption, tenant isolation testing, minimal retention, ISO 27001/SOC 2, incident runbook rehearsed before it is needed | CTO |
| 2 | **Provider costs make the price points unviable** | **Medium-High** | Severe | Obtain quotations in Phase 0 *before* committing to pricing; no public price list until validated; pass-through clauses in contracts | Founder |
| 3 | **Vendors don't complete verification** | **Medium-High** | Severe | Disproportionate investment in the vendor flow; assisted onboarding; regional languages; measure completion from campaign one | Product |
| 4 | **Legal restriction on a data source the product assumes** | Medium | Severe | Counsel in Phase 0; design for graceful absence of any single source; never build a flow that only works with restricted data | Founder + counsel |
| 5 | **Providers forbid caching/reuse** | Medium | Severe | Negotiate reuse rights in every contract from the first one; treat it as a deal term, not a detail | Founder |
| 6 | **A wrong verification result causes customer harm** | Medium | Severe | Confidence levels, human disposition of all adverse findings, dispute workflow, insurance, careful liability terms | Ops + legal |
| 7 | **A KYB API provider moves up-stack** | **High** | High | Speed on workflow depth; network density; the workforce beachhead they have no reason to enter | Founder |
| 8 | **Network effect never materializes** | Medium | High | Product must win standalone for 18 months; treat reuse as upside, not as the plan | Founder |
| 9 | **Enterprise sales cycle longer than funded runway** | Medium | High | Mid-market first; paid pilots; land-small motion; annual prepay | Founder |
| 10 | **Relationship-graph leakage between tenants** | Low | **Fatal to trust** | Data-layer isolation; forbid features that could infer the graph; make it the primary penetration-test target | CTO |
| 11 | **BGV margins structurally unviable** | **Medium-High** | Medium | Split reuse assumptions by category; automate manual checks; reprice or descope; treat BGV as an expansion line, not a wedge | Founder |
| 12 | **Commercial pressure to alter a verification outcome** | **High** *(will happen)* | High | Assessment integrity reports outside the revenue line; documented refusal policy; make the answer "no" before the situation arises | Founder |
| 13 | **Key-person dependency on founder-led sales** | High | Medium | Document the motion; hire only after it is proven; build partner channels | Founder |
| 14 | **Services revenue crowds out product** | Medium | Medium | Cap services at ~10% of revenue; productize repeated requests; push delivery to partners | Founder |
| 15 | **False positives cause unfair exclusion of businesses/people** | **High** | Medium + ethical | Potential-match framing, mandatory human disposition, dispute rights, "insufficient evidence" ≠ risk | Ops |

**Risk 12 will happen.** A large customer will eventually want a result changed or a vendor pushed through, and the request will come with revenue attached. Decide the answer now, in writing, while it is abstract.

## 18.2 Legal open items ⚖ — resolve before launch

These require a qualified Indian data-protection and sector lawyer. **Do not design product flows that assume a favourable answer to any of them.**

| # | Question | Blocks |
|---|---|---|
| 1 | Is BID a Data Fiduciary, a Data Processor, or both under DPDP 2023 — and does the answer differ between buyer-instructed verification and the reusable profile? | Consent architecture, notice obligations, liability allocation |
| 2 | What consent and notice mechanics are required for reusing a person's verified data across employers? | The person-side reuse model |
| 3 | Under what conditions, if any, may BID access or display credit information (CICRA 2005)? | The financial verification module |
| 4 | What is the lawful route for BID to consume financial data — direct AA ecosystem participation, or via a regulated partner? | Financial and turnover verification |
| 5 | Which identity-verification routes are available to a private platform, and what are the restrictions on each? | Person identity verification |
| 6 | What liability does BID carry for a verification result a customer relies on and which proves wrong? | Terms of service, insurance, pricing |
| 7 | May BID publish a business risk assessment to a third party, and what defamation exposure attaches? | The assessment product and public profile |
| 8 | What are the obligations when court-record or sanctions screening produces a false match about an identifiable person? | Screening workflow, dispute process |
| 9 | What retention periods are legally required or prohibited for each data category? | Retention configuration ([§11.6](11-privacy-security.md#116-retention)) |
| 10 | Do provider contracts permit result caching, reuse and redistribution to other BID customers? | **The entire network economics** |
| 11 | What are BID's obligations toward contract workers whose data is processed on a principal employer's instruction? | The workforce module |
| 12 | What terms are required for BFSI, healthcare or government customers to procure BID? | Enterprise sales in regulated sectors |

Items 1, 3, 4, 10 and 6 are the blocking ones. Item 10 is legal *and* commercial and should be raised in the very first provider negotiation.

## 18.3 Commercial open questions

| # | Question | How to answer |
|---|---|---|
| 1 | What does a verification actually cost? | Provider quotations — Phase 0 |
| 2 | What is the real vendor completion rate? | First three pilots |
| 3 | Will customers pay a platform fee, or only per verification? | Pilot conversion negotiations |
| 4 | What is the true support cost per verification? | Instrument pilots; measure assisted-onboarding time |
| 5 | Is ₹499 a credible entry price for business verification? | Model + quotations + pilot pricing tests |
| 6 | Which wedge converts fastest — vendor, BGV or workforce? | Run all three in discovery; count conversion |
| 7 | Will buyers accept network-sourced evidence under their own policies? | Ask directly in discovery; it determines the reuse thesis |
| 8 | What is the real sales cycle and CAC? | First 10 deals |
| 9 | Is monitoring priced per entity or bundled? | Test both in pilots |
| 10 | Does the vendor side justify a paid subscription (BID Pro)? | Offer it to verified vendors in year 1; measure |

**Question 7 is the one most likely to be skipped and most likely to matter.** If enterprise compliance functions will not accept another buyer's verification under any circumstances, the reuse model collapses to a cost saving on BID's side only — still valuable, but a materially different business. Ask it explicitly, in every discovery call, and record the answers.

## 18.4 Product open questions

| # | Question |
|---|---|
| 1 | Should the numeric credibility index exist at all, or are bands sufficient? *(Default: bands only, until a customer proves a real need.)* |
| 2 | How much verification depth is proportionate for a low-wage contract worker? *(Ethical as well as product question — see [§03.7](03-verification-catalog.md#37-contractor--third-party-workforce-verification).)* |
| 3 | Should the public profile be opt-in or opt-out for verified businesses? *(Default: opt-in.)* |
| 4 | How should a proprietorship be verified when business and personal identity are the same? |
| 5 | What happens to a verified profile when a business is acquired, merges or changes legal form? |
| 6 | How is a disputed verification presented to a buyer who already relied on it? |
| 7 | Should BID ever show a buyer that an entity declined a disclosure request? *(Default: no — see [§08.5](08-consent-and-authorized-view.md#85-the-consent-under-pressure-problem).)* |
| 8 | How long should a person's BGV result be retained and by whom? |

## 18.5 Ethical commitments

These are positions, not open questions. They should be written into the company's operating principles and referenced in the terms of service, because each one will eventually be commercially inconvenient — which is precisely when a written commitment is worth something.

1. **"No data" is never "bad."** Insufficient evidence is reported as insufficient evidence, never as risk. MSMEs and new businesses must not be penalized for being unmeasurable.
2. **No public database of people.** A person's background information is never publicly searchable, never sold, never reusable without their specific consent.
3. **Every entity can see and challenge what is said about it.** Dispute rights are a product surface with defined turnarounds, not a support inbox.
4. **Automated systems flag; humans conclude.** No entity or person is ever auto-rejected by an algorithm.
5. **Declining a disclosure is never penalized.** Not in the assessment, not in the record, not in what the requester sees.
6. **Verification depth must be proportionate.** Especially for low-wage workers, where the power imbalance is greatest and the harm from over-collection is real.
7. **No verification outcome is ever altered for commercial reasons.** The answer is no, regardless of the account size.
8. **Never imply authority BID does not hold.** No suggestion of government backing, official status, or a regulatory licence BID does not have.

## 18.6 The four things to validate first

If only four things can be done in the next 90 days:

1. **Get real provider quotations for the top 10 checks, including caching and reuse rights.** Everything financial depends on this.
2. **Get a legal opinion on items 1, 3, 4 and 10 of §18.2.** Everything architectural depends on this.
3. **Run three paid pilots and measure vendor completion rate and true cost per verification.** Everything operational depends on this.
4. **Ask 30 procurement and compliance heads whether they would accept another buyer's verification.** The entire network thesis depends on this, and it costs nothing but conversations.

Everything else in this repository is a plan. These four are the facts the plan is waiting on.
