# 09 · Credibility & Risk Assessment

## 9.1 The rule

> **No opaque AI score.**

A black-box number that decides whether a business gets a contract or a person gets a job is indefensible — legally, ethically and commercially. Enterprise buyers with real compliance functions will reject it, and they are right to.

BID's assessment is **deterministic, rubric-based, fully explainable, versioned, and challengeable.** Every output can be traced to its inputs and reproduced.

## 9.2 The primary output: a factor profile

The headline is a band with visible supporting factors, not a number:

```
BID ASSESSMENT · XYZ Components · BID-BUS-100821

        ┌────────────────────┐
        │    ● LOW RISK      │
        └────────────────────┘
   Assessed 15 Aug 2026 · Rubric v2.1 · Valid to 15 Nov 2026

  Identity                VERIFIED
    Corporate identity, PAN and GST confirmed against
    authoritative sources. Legal name matched at 0.97.

  Compliance              STRONG
    All required registrations active. ISO 9001 confirmed
    with the issuing certification body. No lapses.

  Financial               VERIFIED
    Bank account ownership confirmed via credit-into-account.
    Turnover band corroborated. Filed financials current.

  Documentation           COMPLETE
    12 of 12 required items. No anomalies detected.

  Risk Screening          CLEAR
    Sanctions, PEP and litigation screening returned
    no confirmed matches. 1 potential match reviewed
    and dismissed on 14 Aug 2026 — different entity, PAN mismatch.

  Verification Freshness  CURRENT
    Oldest contributing check: 12 days.

  Continuity              ESTABLISHED
    Registered 2011. Continuous GST registration since 2017.
```

Six to seven dimensions, each with an ordinal grade and a one-paragraph, human-readable justification. A procurement manager can read this aloud in an approval meeting. That is the design target.

## 9.3 Dimension grades

| Dimension | Grades |
|---|---|
| Identity | VERIFIED · PARTIALLY VERIFIED · UNVERIFIED · DISCREPANCY |
| Compliance | STRONG · ADEQUATE · GAPS · LAPSED · NOT APPLICABLE |
| Financial | VERIFIED · PARTIALLY VERIFIED · INSUFFICIENT EVIDENCE · ADVERSE |
| Documentation | COMPLETE · PARTIAL · INSUFFICIENT · ANOMALY DETECTED |
| Risk Screening | CLEAR · POTENTIAL MATCH — UNDER REVIEW · CONFIRMED MATCH · NOT SCREENED |
| Freshness | CURRENT · AGEING · STALE · EXPIRED |
| Continuity | ESTABLISHED · DEVELOPING · NEW · DISCONTINUOUS |

## 9.4 The composite band

Bands are produced by explicit, published rules — not by a model.

| Band | Meaning |
|---|---|
| **LOW RISK** | All required dimensions verified or strong. No unresolved exceptions. |
| **MEDIUM RISK** | Verified with gaps, ageing evidence, or resolved but noted findings. |
| **HIGH RISK** | Confirmed adverse findings, material discrepancies, or lapsed critical compliance. |
| **INSUFFICIENT EVIDENCE** | Not enough verified data to assess. **This is not a risk finding.** |
| **BLOCKED** | A hard-stop condition — confirmed sanctions match, struck-off entity, confirmed fraud. |

### INSUFFICIENT EVIDENCE is the most important state in this document

A ten-person proprietorship with no filed financials, no ISO certificate and no credit history is **not** high risk. It is **unmeasured**.

Collapsing "we have no data" into "this is dangerous" would:
- systematically penalize MSMEs, new businesses and informal-sector suppliers,
- entrench incumbents by making unmeasurability look like danger,
- and turn BID into an instrument of exclusion rather than access.

That outcome is both morally wrong and commercially self-defeating — MSMEs are a large part of the intended network. **The distinction must be preserved in the data model, the API, the UI, the PDF export and the sales narrative.** Any pressure to "just give them a score" should be refused.

## 9.5 If a numeric index is published

Some enterprise buyers will insist on a number for internal thresholds. If BID publishes one, it must satisfy every condition below. If any cannot be met, publish bands only.

**1 — How it is calculated.** A published, versioned, deterministic rubric. Points awarded by explicit rules. No machine-learned weights in the headline index.

```
BID Credibility Index v2.1  ·  0–100

  Identity verification        0–25   evidence-based
  Compliance standing          0–20   registration status and currency
  Financial verification       0–20   bank ownership, turnover corroboration
  Documentation completeness   0–10   required items present and authentic
  Risk screening               0–15   clear / reviewed / adverse
  Operating continuity         0–10   registration age and continuity

  Freshness modifier          ×0.85–1.00  decay by age of oldest input
  Hard-stop overrides         → BLOCKED, regardless of points
```

**2 — Which signals contribute.** Published in full, per version.

**3 — Which signals explicitly do NOT contribute.** Equally published, and this list is a public commitment:

- Company size, turnover magnitude or number of employees — *small is not risky*
- Geography, state or pin code — *this would encode regional discrimination*
- Industry sector
- Founder, director or owner demographics — name, gender, community, religion, caste
- Whether the entity declined an over-broad disclosure request
- Whether the entity is a customer of BID or on a paid plan — **the index must never be purchasable**
- Any inference from the buyer's own commercial relationship

**4 — How it can be challenged.** A dispute workflow with intake, evidence, re-verification, a reasoned written outcome, notification to every party that received the disputed assessment, and a permanent correction record. Target turnaround: 7 working days.

**5 — How it is explained.** Every published index is accompanied by its per-factor contribution. A bare number is never displayed anywhere in the product.

**6 — When it expires.** The index carries a validity window derived from its freshest and stalest inputs. An expired index displays as expired, never as its last value.

**7 — How false positives are handled.** Screening matches are *potential* until dispositioned by a human, with a recorded reason. An undispositioned potential match never contributes negatively to a band or an index. Dismissed matches are recorded so the same false positive is not re-raised on every re-verification — the "same wrong Ramesh Kumar every quarter" problem is a real operational tax on customers.

## 9.6 Language discipline

| Never say | Say instead |
|---|---|
| "This company is trustworthy" | "Identity, compliance and financial details verified against authoritative sources on 15 Aug 2026" |
| "Safe to do business with" | "No adverse findings within the scope verified" |
| "Fraudulent" | "Discrepancy identified between submitted document and registry record" |
| "Criminal record found" | "Potential court-record match requiring review — not confirmed as the same individual" |
| "Blacklisted" | "Confirmed sanctions-list match — refer to compliance" |
| "Credit score" | "BID Credibility Index — an evidence-completeness measure, not a credit rating" |
| "Government verified" | "Verified against government registry records via authorized channel" |

The last two are legal exposures, not stylistic preferences. BID is not a credit information company and not an arm of the state, and any copy implying otherwise is a genuine risk.

## 9.7 Where machine learning is legitimate

ML is useful in BID — just never as the arbiter of an entity's standing.

| Legitimate | Not legitimate |
|---|---|
| Document tamper and anomaly detection *(flags for human review)* | Deciding the risk band |
| Name matching and entity resolution *(with published thresholds)* | Inferring risk from unrelated attributes |
| Extracting structured data from documents | Predicting "likelihood of fraud" from behavioural proxies |
| Prioritizing an analyst review queue | Auto-rejecting an entity or a person |
| Detecting duplicate or template-forged documents across tenants | Generating an unexplainable score |

**Rule:** ML may *flag*, *extract*, *rank* and *route*. It may never *conclude*. Every ML-derived signal that affects an outcome passes through a human decision with a recorded reason.

## 9.8 Assessment for people

Materially different, and deliberately constrained.

BID produces **no risk score for individuals.** No number, no band, no colour.

For a person, BID reports **check-level outcomes only**:

```
Ravi K · BID-PER-••••••  ·  Standard BGV Package
Requested by ABC Company · Purpose: pre-employment

  Identity              VERIFIED
  Address               VERIFIED
  Education             VERIFIED — B.E. Mechanical, 2014, issuer-confirmed
  Employment (1 of 2)   VERIFIED — dates and designation confirmed
  Employment (2 of 2)   UNABLE TO VERIFY — employer non-responsive after
                        3 attempts over 12 working days
  Court records         NO ADVERSE MATCH
  Professional licence  VERIFIED — active

  0 discrepancies · 1 unable to verify
```

`UNABLE TO VERIFY` is not a negative finding, and the UI must never render it as one. A former employer that has shut down, or simply does not answer email, tells you nothing about the candidate. Presenting non-response as a red flag would harm real people for reasons entirely outside their control.

The employer sees facts and makes its own decision, recording its reason. **BID never recommends a hiring outcome.** That boundary protects the candidate, protects BID, and is the only defensible position for a verification platform to hold.
