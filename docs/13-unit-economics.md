# 13 · Unit Economics

> ### ⚠ Every cost figure in this section is ILLUSTRATIVE.
> No provider cost here reflects a real quotation. These numbers exist to expose the *structure* of the economics and to be replaced, cell by cell, as actual provider pricing is obtained. **Do not use them for pricing decisions, board materials or customer commitments.**

## 13.1 The live model

The model is code, not a static table:

```
models/
  assumptions_check_costs.csv   ← per-check provider + internal cost, failure rate
  assumptions_packages.csv      ← package composition and list price
  assumptions_global.csv        ← overheads, reuse rates, CAC, churn
  unit_economics.py             ← calculator
  OUTPUT.md                     ← generated results
```

```bash
python3 models/unit_economics.py
```

Every cost cell carries a `cost_confidence` column: `PLACEHOLDER`, `ESTIMATE`, `DERIVED` or (eventually) `QUOTED`. **The single most important near-term commercial task is converting `PLACEHOLDER` rows to `QUOTED`.** Until that happens, every margin number in this document is architecture, not arithmetic.

## 13.2 The cost stack

Every verification carries five cost layers:

| Layer | Nature | Illustrative |
|---|---|---|
| **Provider cost** | Per API call or per manual check, ×(1 + failure/retry rate) | Varies — ₹5 to ₹350 per check |
| **Internal processing** | Normalization, exception handling, analyst review | ₹0.50–₹70 per check |
| **Infrastructure** | Compute, storage, evidence retention, amortized | ₹8 per verification |
| **Support** | Blended, including assisted vendor onboarding | ₹25 per verification |
| **Ops / exception review** | QA sampling, disposition, escalation | ₹15 per verification |
| **Payment gateway** | On collected revenue | 2.0% |

**The failure-rate multiplier matters more than it looks.** A check that fails, times out, or returns nothing still costs money. Manual checks fail at 20–30% — a previous-employer confirmation where the employer never responds is billed labour with no result. Modelling checks at their nominal price systematically understates cost, and this is the most common error in verification-business models.

## 13.3 What the model says

Under year-1 placeholder assumptions (10% reuse):

| Package | Price | Total cost | Contribution | Margin |
|---|---:|---:|---:|---:|
| Business — Basic | ₹499 | ₹92 | ₹407 | **81.6%** |
| Business — Standard | ₹999 | ₹138 | ₹861 | **86.2%** |
| Business — Critical | ₹2,499 | ₹451 | ₹2,048 | **81.9%** |
| Contractor Company | ₹1,999 | ₹268 | ₹1,731 | **86.6%** |
| Enhanced Due Diligence | ₹999 | ₹247 | ₹752 | **75.2%** |
| BGV — Executive | ₹7,999 | ₹2,253 | ₹5,746 | **71.8%** |
| BGV — Essential | ₹499 | ₹159 | ₹340 | 68.1% ⚠ |
| BGV — Comprehensive | ₹2,999 | ₹1,637 | ₹1,362 | 45.4% ⚠ |
| Contractor Worker — Enhanced | ₹999 | ₹570 | ₹429 | 43.0% ⚠ |
| Contractor Worker — Basic | ₹199 | ₹127 | ₹72 | 36.1% ⚠ |
| Contractor Worker — Standard | ₹499 | ₹321 | ₹178 | 35.7% ⚠ |
| BGV — Standard | ₹1,499 | ₹981 | ₹518 | 34.5% ⚠ |

⚠ = below the 70% target.

## 13.4 The three findings that matter

### Finding 1 — Business verification is a software business; people verification is a services business

Business checks are registry lookups: cheap, fast, automatable, 80%+ margin. Person checks are dominated by human labour — an employer confirmation, a university registrar, a field agent — at 35–45% margin.

**These are structurally different businesses wearing the same brand.**

Implications:
- Lead with business verification. It funds everything.
- Price BGV to reflect real cost, or accept it as a strategic, deliberately loss-leading line — but never by accident.
- The stated ₹499 BGV starting price is defensible **only** for the Essential package. The moment education or employment verification enters the package, the economics change completely.
- **Automating employment and education verification is the single highest-value engineering investment on the people side.** Every manual check converted to an API call moves BGV toward software margins.

### Finding 2 — Fixed per-verification overhead destroys low-priced packages

Infra + support + ops = **₹48 per verification, regardless of package price.**

At ₹199 for Worker Basic, that is 24% of revenue consumed before a single provider is called. At ₹2,499 for Business Critical, it is 2%.

Two responses, both needed:
1. **Never price a package below roughly ₹400** unless overhead is genuinely lower for it — which means bulk-processed, self-serve, zero-touch flows.
2. **Bulk worker verification must be a genuinely different operational path**: batch submission by the contractor, batch processing, no per-worker support. If a ₹199 worker check receives ₹25 of support, the line loses money at volume — and volume is exactly what that line is for.

Model this properly before launching the workforce module at these prices. A per-batch rather than per-worker overhead assumption changes the answer entirely, and that is an operational design choice, not a spreadsheet input.

### Finding 3 — Reuse helps most where it is hardest to achieve

The model shows reuse improving BGV Standard by +24 margin points and Worker Standard by +20, versus only +3 for Business Standard — because reuse saves a proportion of provider cost, and the expensive packages have more of it.

**But this is the model being optimistic, and the flaw is worth stating plainly:**

| | Business checks | Person checks |
|---|---|---|
| Reusable across buyers? | Largely yes — a GST status is a GST status | Much less so |
| Consent constraints | Moderate | Strict, purpose-bound, employer-specific |
| Result validity | 90–365 days | Employment history is buyer-specific and time-bound |
| Ethical constraint | Few | A person's BGV result must **not** be freely reusable ([§11.7](11-privacy-security.md)) |

Applying a uniform reuse rate across both is wrong. **The next revision of the model should split reuse rate by category** — high for business checks, near-zero for the manual person-side checks. Doing so will make the BGV margin picture look worse, which is precisely why it needs doing before anyone relies on these numbers.

The honest version: **the network effect is a business-verification phenomenon.** It barely helps BGV. Plan accordingly, and do not let a blended reuse assumption hide that.

## 13.5 Account-level economics

Illustrative mid-market account (BID Growth), year 1:

| Line | Volume | Revenue | Contribution |
|---|---:|---:|---:|
| Subscription | 12 months | ₹3,00,000 | ₹2,54,990 |
| Vendor verification | 120 | ₹1,19,880 | ₹1,03,336 |
| Contractor workers | 150 | ₹74,850 | ₹26,711 |
| Employee BGV | 40 | ₹59,960 | ₹20,715 |
| Continuous monitoring | 200 entities | ₹1,17,600 | ₹82,320 |
| **Total** | | **₹6,72,278** | **₹4,88,071** |

| Metric | Illustrative |
|---|---:|
| Blended gross margin | **72.6%** |
| CAC *(assumption: founder-led, fully loaded)* | ₹2,50,000 |
| **Gross-margin payback** | **6.1 months** |
| Monthly churn *(assumption)* | 1.5% |
| LTV / CAC | **10.8×** |

Note how the mix carries the blended margin: subscription and business verification (85%+) offset workforce and BGV (35%). **The mix is the margin.** An account that skews heavily toward BGV and worker volume without proportionate subscription and vendor verification will underperform this picture badly — which is a sales-motion instruction as much as a finance observation.

**Treat LTV/CAC of 10.8× with heavy scepticism.** It rests on an assumed 1.5% monthly churn with no evidence behind it. Churn is unknowable until real cohorts exist, and if it is 4% instead, LTV falls by more than half. The payback number is the more trustworthy of the two, because it depends on one year of assumptions rather than five.

## 13.6 Cost concentration — where to attack

| Check | Effective cost | Action |
|---|---:|---|
| Physical / field address verification | ₹442 | Restrict to L4 policies only; build a partner agent network rather than employing agents |
| Institution / degree confirmation | ₹375 | Pursue digital academic depository routes and direct institution integrations |
| Previous employer confirmation | ₹310 | Automate via statutory employment records where consent permits; build employer-side self-service |
| Structured reference check | ₹255 | Highest failure rate (30%) — consider dropping from standard packages |
| Individual court record check | ₹182 | Negotiate volume rates; reduce false positives to cut the ₹40 review cost |
| Professional licence verification | ₹115 | Build direct regulator integrations for the highest-volume licence types |

The pattern is clear: **every expensive check is manual or semi-manual.** The engineering roadmap and the margin roadmap are the same roadmap.

## 13.7 What must be validated before pricing is set

Ranked by impact on the model:

| # | Unknown | Why it matters |
|---|---|---|
| 1 | **Real provider costs, per check, at volume** | Every margin number depends on it |
| 2 | **Caching and reuse rights in provider contracts** | If reuse is contractually forbidden, the network's margin expansion does not exist ([§05.7](05-provider-orchestration.md#57-reuse-and-caching--the-margin-engine)) |
| 3 | **True support cost per verification** | ₹25 is a guess; assisted MSME onboarding could make it 3× that |
| 4 | **Manual check failure rates** | 20–30% assumed; if it is 40% for employment verification, BGV Standard loses money |
| 5 | **Vendor completion rate** | Drives support cost, campaign economics and the whole network thesis |
| 6 | **Real CAC and sales cycle** | ₹2.5L and 75 days are unvalidated |
| 7 | **Monitoring cost structure** | Per-query vs per-notification pricing changes monitoring margin dramatically |
| 8 | **Churn** | Only measurable with real cohorts |

## 13.8 Pricing guardrails

Until items 1–4 are resolved:

1. **No public price list.** Quote per deal. This preserves the ability to correct pricing without a public reversal — a repricing announcement in month eight is far more damaging than a quote-based motion in month two.
2. **No multi-year fixed-price contracts** on consumption lines. Include a provider-cost pass-through clause.
3. **Every pilot must record actual cost per verification**, not just revenue. A pilot that proves customers will buy but not what it costs to serve them has answered the easier half of the question.
4. **Floor rule:** never quote below the model's break-even + 30%, and require explicit founder approval for anything below the target margin.
5. **Re-run the model monthly** as quotations land, and treat any package that drops below break-even as a stop-ship on that line.
