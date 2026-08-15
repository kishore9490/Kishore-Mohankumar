# BID Trust — Financial Model

A runnable unit-economics model. Edit the assumptions, re-run, and every downstream number moves.

```bash
python3 models/unit_economics.py
```

No dependencies. Python 3.8+. Regenerates `OUTPUT.md`.

## Files

| File | Contents |
|---|---|
| `assumptions_check_costs.csv` | Per-check provider cost, internal processing cost, failure/retry rate, source class |
| `assumptions_packages.csv` | Package composition and list price |
| `assumptions_global.csv` | Overheads, reuse rates, CAC, churn, targets |
| `unit_economics.py` | Calculator |
| `OUTPUT.md` | Generated — do not edit by hand |

## ⚠ Every provider cost is a PLACEHOLDER

No figure in these files reflects a real quotation. They exist to expose the *structure* of the
economics and to be replaced cell by cell as actual provider pricing arrives.

**Do not use these outputs for pricing decisions, board materials, fundraising or customer commitments.**

## The confidence column

Every cost row carries a `cost_confidence` value:

| Value | Meaning |
|---|---|
| `PLACEHOLDER` | Invented for modelling. Must be replaced. |
| `ESTIMATE` | Reasoned internal estimate, not externally sourced |
| `DERIVED` | Computed from another check, no separate cost |
| `QUOTED` | **A real provider quotation.** The goal. |

**The single most important near-term commercial task is converting `PLACEHOLDER` rows to `QUOTED`.**
Track progress by counting them:

```bash
grep -c PLACEHOLDER models/assumptions_check_costs.csv
```

## Known limitation to fix

The model applies one reuse rate to all checks. This is wrong: business-registry checks are highly
reusable across buyers, while manual person-side checks (employment, education, references) are
barely reusable at all — for consent, validity and ethical reasons alike.

Splitting reuse rate by category will make the BGV margin picture look worse than it currently does,
which is exactly why it needs doing before anyone relies on these numbers. See
[§13.4](../docs/13-unit-economics.md#134-the-three-findings-that-matter).

## Interpreting the output

- **§2 / §3** — package margins at year-1 and year-3 reuse rates
- **§4** — packages below the target margin, with break-even and target-margin prices
- **§5** — cost concentration; attack the top of this list first
- **§6** — account-level payback, LTV and CAC

Treat the LTV number with scepticism. It rests on an assumed churn rate with no evidence behind it.
Payback is the more trustworthy metric, because it depends on one year of assumptions rather than five.
