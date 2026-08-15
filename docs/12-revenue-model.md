# 12 · Revenue Model

> ### ⚠ All prices in this document are STARTING PRICES for business modelling.
> They are **not final market prices.** Final pricing must be set only after provider quotations, manual verification costs, infrastructure costs, support costs, compliance costs, failed-verification rates, enterprise volume commitments and gross-margin targets are known. See [§13 Unit Economics](13-unit-economics.md).

## 12.1 Why not a single revenue line

Selling digital cards is not a business. Selling verifications alone is a commodity business with no retention. BID's revenue architecture rests on three legs:

```
  RECURRING PLATFORM         CONSUMPTION            SERVICES
  (predictable ARR)          (scales with usage)    (lands accounts)

  Subscription               Verifications          Implementation
  Monitoring                 BGV packages           Custom integration
  API access                 Enhanced DD            Advisory / policy design
  BID Pro (supply side)      Re-verification
```

Target mix at maturity: **~55% recurring, ~35% consumption, ~10% services.** Services should land accounts, never become the business — a services-heavy revenue mix will destroy the valuation multiple and consume the engineering team.

## 12.2 Line 1 — Enterprise SaaS subscription

The platform fee. Buys the workflow, policy engine, campaigns, dashboards, audit trail, integrations and support. Verifications are consumed on top.

| Tier | Starting price | Positioned for |
|---|---|---|
| **BID Starter** | **from ₹9,999/month** | Small companies, first vendor programme, up to ~5 users, ~50 active entities |
| **BID Growth** | **from ₹24,999/month** | Growing mid-market, multiple policies, ~15 users, ~250 active entities |
| **BID Business** | **from ₹49,999/month** | Established mid-market/enterprise, unlimited policies, SSO, API, ~1,000 active entities |
| **BID Enterprise** | **from ₹1,00,000/month** | Large enterprise, multi-entity, multi-site, custom SLA, dedicated CSM, unlimited scale |

**Tier differentiators — sequenced so that upgrades are pulled, not pushed:**

| Capability | Starter | Growth | Business | Enterprise |
|---|---|---|---|---|
| Verification policies | 3 | 10 | Unlimited | Unlimited |
| Users | 5 | 15 | 50 | Unlimited |
| Active monitored entities | 50 | 250 | 1,000 | Unlimited |
| Campaigns | ✓ | ✓ | ✓ | ✓ |
| Contractor workforce module | — | ✓ | ✓ | ✓ |
| Continuous monitoring | Basic | Standard | Full | Full + custom signals |
| API access | — | Read | Full | Full + webhooks |
| ERP/HRMS integration | — | — | ✓ | ✓ + custom |
| SSO / SAML | — | — | ✓ | ✓ |
| Custom approval workflows | — | Basic | ✓ | ✓ |
| Audit export & retention controls | Standard | Standard | Extended | Custom |
| Support | Email | Email + chat | Priority | Dedicated CSM, SLA |
| Policy simulation | — | ✓ | ✓ | ✓ |

**Annual commitment** discounted (typically 2 months free); annual invoicing materially improves cash and reduces churn.

## 12.3 Line 2 — Per-verification charges

| Verification | Starting price |
|---|---|
| Business — Basic *(identity, PAN, GST)* | **from ₹499/check-set** |
| Business — Standard *(+ bank, directors, address)* | **from ₹999** |
| Business — Critical *(+ ownership, financial, compliance, risk)* | **from ₹2,499** |
| Individual check *(à la carte)* | **from ₹99** |
| Enhanced Due Diligence | **from ₹999** |

**Consumption models offered:**

| Model | How it works | When to use it |
|---|---|---|
| **Prepaid credits** | Buy a block, draw down, expire in 12 months | Default — best cash position, produces breakage revenue |
| **Postpaid metered** | Monthly invoice on actual usage | Large enterprises that will not prepay |
| **Bundled allowance** | N verifications included in the subscription tier, overage billed | Simplifies the sale, raises perceived value |

Prepaid credit blocks with volume discounts (illustrative): ₹25,000 at list, ₹1,00,000 at −10%, ₹5,00,000 at −20%, ₹10,00,000+ negotiated. **Breakage — unused expired credits — is real revenue and should be forecast explicitly**, typically in the 3–8% range, though this must be validated against actual behaviour before it is relied upon.

## 12.4 Line 3 — Re-verification

Existing entities re-verified on the policy's schedule.

**Priced at a discount to first verification** — typically 40–60% of the initial price — because reuse and caching make the marginal provider cost genuinely lower. **Passing some of that saving to the customer is strategically correct:** it makes annual re-verification affordable enough that customers actually do it, which is what converts BID from a project into an operating system.

| | Starting price |
|---|---|
| Business re-verification — Standard | **from ₹499** |
| Business re-verification — Critical | **from ₹1,199** |
| Bulk re-verification campaign | Negotiated by volume |

## 12.5 Line 4 — Continuous monitoring

The highest-quality revenue in the model: recurring, high-margin, low-touch, and delivering visible ongoing value.

| | Starting price |
|---|---|
| **Standard monitoring** | **from ₹49 per entity per month** |
| **Enhanced monitoring** | **from ₹149 per entity per month** |
| **Worker credential monitoring** | **from ₹29 per worker per month** |

*(Derived starting prices — flagged explicitly as "starting from" and subject to provider costs. Monitoring cost is driven by how often each watched signal must be re-queried; where a provider bills per query rather than per change notification, the economics shift materially. This is a priority question for provider negotiations.)*

**Standard** watches: entity status, GST status, director changes, credential expiry, sanctions.
**Enhanced** adds: litigation, adverse media, regulatory action, financial signals, higher check frequency.

Why it matters: a customer with 400 monitored vendors at ₹49 is **₹2.35L/year** of pure recurring revenue on top of subscription — and it is the line that makes BID indispensable, because it is delivering something the customer previously could not do at all.

## 12.6 Line 5 — Candidate & employee BGV

| Package | Starting price |
|---|---|
| **Essential** | **from ₹499/candidate** |
| **Standard** | **from ₹1,499/candidate** |
| **Comprehensive** | **from ₹2,999/candidate** |
| **Executive** | **from ₹7,999/candidate** |
| Add-on checks | from ₹199 each |

Volume tiers apply — a company hiring 500 people a year will negotiate hard, and BGV is the most price-competitive line in the model. Compete on turnaround, transparency, candidate experience and the audit trail, **not on price**. A price-led BGV strategy walks straight into a margin war with established agencies that have scale advantages BID will not have for years.

## 12.7 Line 6 — Contractor & workforce verification

| | Starting price |
|---|---|
| Contractor company verification | **from ₹1,999** |
| Worker verification — Basic *(identity + employment link)* | **from ₹199/worker** |
| Worker verification — Standard *(+ certifications + safety)* | **from ₹499/worker** |
| Worker verification — Enhanced *(+ background + medical)* | **from ₹999/worker** |
| Ongoing credential monitoring | **from ₹29/worker/month** |

**The volume line.** One manufacturing customer with 2,000 contract workers at ₹499 initial plus ₹29/month monitoring is roughly **₹10L initial + ₹7L/year recurring**, from a single site relationship. This is why the workforce module deserves priority despite being the least glamorous part of the platform.

## 12.8 Line 7 — Enhanced due diligence

Human-led, analyst-produced, for high-value or high-risk counterparties.

| | Starting price |
|---|---|
| **EDD Report — Standard** | **from ₹999** |
| **EDD Report — Deep** | from ₹9,999 |
| **Site verification** | from ₹2,499 per visit |
| **Investigative due diligence** | Quoted per engagement |

Lower gross margin (human labour), but high price realization, strong differentiation, and it wins deals — an enterprise that needs occasional deep diligence will not buy a platform that cannot provide it.

## 12.9 Line 8 — API & integrations

| | Starting price |
|---|---|
| **API access — Developer** | **from ₹14,999/month + usage** |
| **API access — Business** | from ₹49,999/month + usage |
| **API access — Platform partner** | Negotiated + revenue share |
| Webhooks & event streaming | Included at Business+ |

*(Derived entry pricing, flagged as starting-from.)*

Usage is billed at per-verification rates with volume tiers. The API tier suits platforms embedding verification: procurement software, HRMS, marketplaces, lending platforms, gig platforms.

**Strategic note:** API-first customers have excellent margins and terrible retention-through-relationship. Treat them as a channel that expands reach and network density, not as the core business.

## 12.10 Line 9 — Enterprise implementation & integration

| | Starting price |
|---|---|
| **Standard implementation** | **from ₹2,00,000** *(subject to scope)* |
| ERP integration (SAP/Oracle/etc.) | from ₹3,50,000 |
| HRMS integration | from ₹2,50,000 |
| Custom policy design & migration | from ₹1,50,000 |
| Historical vendor base onboarding | Quoted by volume |
| Training & change management | from ₹75,000 |

**Discipline required.** Implementation revenue is seductive and dangerous: it looks like growth, carries low margin, consumes engineering, and creates bespoke commitments that fragment the product. Cap services at ~10% of revenue, productize repeatedly-requested work into the platform, and push delivery to certified partners as soon as volume allows.

## 12.11 Line 10 — BID Pro (supply-side subscription)

Optional, for verified businesses that want more from their own profile.

| | Starting price |
|---|---|
| **BID Pro** | **from ₹999/month** or from ₹9,999/year |
| **BID Pro+** | from ₹2,999/month |

Includes: enhanced public profile, multiple published credentials, profile view analytics, priority verification, expiry alerts, multi-buyer credential sharing, tender-ready verification packs, and (Pro+) buyer discovery visibility.

**Hard rule: a vendor must never be required to pay in order to complete a verification a buyer has requested.** Charging suppliers for the privilege of being onboarded would poison the network at its root and hand a competitor an easy attack. BID Pro is upside on top of a free verified profile — never a toll gate.

Realistic expectation: low single-digit conversion of verified businesses. Model it as a bonus, not as a pillar.

## 12.12 Illustrative account economics

**Mid-market manufacturer, BID Growth, year 1** *(illustrative)*

| Line | Calculation | Annual |
|---|---|---|
| Subscription | ₹24,999 × 12 | ₹3,00,000 |
| Initial vendor verification | 120 × ₹999 | ₹1,19,880 |
| Re-verification | 80 × ₹499 | ₹39,920 |
| Monitoring | 200 × ₹49 × 12 | ₹1,17,600 |
| Contractor workers | 150 × ₹499 | ₹74,850 |
| Worker monitoring | 150 × ₹29 × 12 | ₹52,200 |
| Employee BGV | 40 × ₹1,499 | ₹59,960 |
| **Year-1 ACV** | | **≈ ₹7,64,000** |

**Large enterprise, BID Enterprise, year 1** *(illustrative)*

| Line | | Annual |
|---|---|---|
| Subscription | ₹1,50,000 × 12 | ₹18,00,000 |
| Implementation *(one-time)* | | ₹3,50,000 |
| Vendor verification | 600 × ₹2,499 | ₹14,99,400 |
| Monitoring | 900 × ₹49 × 12 | ₹5,29,200 |
| Contractor workers | 2,000 × ₹499 | ₹9,98,000 |
| Worker monitoring | 2,000 × ₹29 × 12 | ₹6,96,000 |
| Employee BGV | 300 × ₹1,499 | ₹4,49,700 |
| EDD | 20 × ₹9,999 | ₹2,00,000 |
| **Year-1 contract value** | | **≈ ₹65,20,000** |
| **Recurring from year 2** | | **≈ ₹45,00,000+** |

These illustrate the *shape* of an account, not a forecast. The pattern to note: **subscription is under 30% of account value, and consumption plus monitoring carry the rest.** That is the model working correctly — and it also means the pricing of consumption lines, which depends entirely on unverified provider costs, is the highest-risk number in the plan.

## 12.13 Pricing principles

1. **Never price below verified cost.** Until real provider quotations exist, every price here is provisional. Discipline on this point is what prevents a growth-driven margin collapse.
2. **Price the outcome, not the API call.** "₹999 to onboard a supplier with confidence" beats "₹12 per GST lookup" — and it protects margin when provider costs fall.
3. **Land small, expand structurally.** The first contract should be easy to approve. Expansion comes from more entities, more monitoring, more relationship types — not from a renegotiated subscription.
4. **Never discount the platform fee to win.** Discount consumption instead. A discounted platform fee resets the account's value permanently; discounted credits reset next quarter.
5. **Monitoring is the retention engine.** Push it into every deal, even free at first if necessary. A customer receiving useful alerts every month does not churn.
6. **Transparency on pass-through.** Where a check's cost is dominated by a provider fee, be willing to show it. It builds credibility and makes price increases explicable when provider costs rise.
7. **Never let commercial pressure alter a verification outcome.** Not a pricing principle — a survival principle. See [§11.7](11-privacy-security.md#117-things-bid-must-never-do).
