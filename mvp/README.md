# AI Revenue Recovery OS — Interactive Investor MVP

**Predict. Prevent. Work. Resolve. Recover.**

An interactive, investor-facing demonstration of **AI Revenue Recovery OS** — the intelligence
and execution layer that continuously identifies healthcare revenue risk, decides the best next
action, executes it across **EDI → API/FHIR → Portal → Voice → Human**, validates the outcome,
and measures recovered revenue.

> ⚠️ **DEMO / SIMULATION ENVIRONMENT.** All data is synthetic. There is **no** live payer
> connectivity, real insurance verification, real payer calls, or real PHI. No production HIPAA,
> SOC 2 or HITRUST certification is claimed. Illustrative numbers are labeled as such.

---

## Run it

`mvp/index.html` is a **single, self-contained file** — no build step, no server, no dependencies.

```
open mvp/index.html          # macOS
xdg-open mvp/index.html      # Linux
# or just double-click it, or drag it into any modern browser
```

**Demo credentials** (pre-filled on the login screen):

- Email: `demo@airevenuerecovery.local`
- Password: `Demo@12345`
- Role: Executive / RCM Manager / AR Manager / Analyst / Admin (demo-only)

## The 90-second investor demo

Click **Run Investor Demo** (sidebar or dashboard). A guided, narrated sequence walks through:

Command center → high-risk claim → Claim 360 → EDI insufficient → API/FHIR unavailable →
portal insufficient → **AI decides a call is warranted** → AI Voice Agent runs the call →
structured extraction → follow-up scheduled → recovery forecast updates → Denial Intelligence →
Human Exception Center → Production Architecture → ROI. **Problem → Claim → AI Decision → Action →
Resolution → Revenue Impact → Production — no slides required.**

## Modules

Overview (command center) · Revenue Risk Engine · Claims · **Claim 360** (lifecycle, EDI, AI
Decision Engine, audit trail) · AR Workforce · **AI Voice Agent** · Payer Portal Agent · API/FHIR
Intelligence · Denial Intelligence · Appeal Intelligence · Payer Intelligence · Human Exception
Center · Recovery Analytics · **ROI Simulator** · Production Architecture (+ MVP vs Production
toggle) · Security & Compliance · System Activity · Interoperability 2027 · Why ARR OS · Business
Model.

## Core product principle — "don't call when you can connect"

The execution hierarchy is **1) EDI → 2) API/FHIR → 3) Portal → 4) Voice → 5) Human**. The AI
Decision Engine discovers each payer's digital capabilities and chooses the cheapest sufficient
channel; **voice is a last resort**, not the product. This right-channel orchestration is the core
differentiator, visible on every Claim 360 and in the API/FHIR module.

## What's interactive

Filterable claim tables · risk drill-downs · Claim 360 tabs · animated AI voice call with live
transcript + structured extraction · portal-automation simulation · payer capability discovery ·
denial → recovery-plan generation · appeal workspace (never auto-submits) · human-exception
accept/modify/escalate/return · **Simulate Exception** failure injection · live ROI sliders ·
interactive architecture explorer · streaming activity feed · guided investor demo.

## Accuracy — 2027 CMS positioning

The Interoperability 2027 module states, accurately: *"Beginning January 1, 2027, certain
CMS-regulated payers face new FHIR API requirements under CMS's Interoperability and Prior
Authorization rule."* It does **not** claim all insurance verification becomes API-only, and links
to the [official CMS-0057-F fact sheet](https://www.cms.gov/newsroom/fact-sheets/cms-interoperability-prior-authorization-final-rule-cms-0057-f).

---

## Architecture of this MVP

| Layer | This MVP | Production pathway |
|---|---|---|
| UI | Self-contained HTML/CSS + vanilla JS SPA (hash router, state store, inline SVG charts) | Next.js · React · TypeScript · Tailwind · shadcn/ui · Recharts |
| Decision logic | Deterministic rules engine + scripted LLM-style explanations | Rules + policy engine + ML models + LLM reasoning, with eval gates |
| Data | Seeded synthetic generator (52 claims, 10 payers, denials, exceptions, activity) | PostgreSQL + Prisma · event bus (Kafka) · workflow engine (Temporal) |
| Integrations | Simulated EDI / API / FHIR / portal / voice | Clearinghouse EDI · payer FHIR/REST · approved portal RPA · approved voice provider |
| Security | Simulated; controls shown as roadmap | HIPAA safeguards, BAA, RBAC, SSO/MFA, tenant isolation, audit, independent validation |

The production stack is documented in-app under **Architecture** (with an MVP ⇄ Production toggle)
and **Security & Compliance**. This single-file build deliberately prioritizes *"an investor can
open it in a browser and immediately understand"* over requiring a local toolchain.

### Data model (represented in the synthetic layer)

Organization · User · Patient (synthetic) · Provider · Payer · Claim · ClaimEvent · EDITransaction
· PayerInteraction · AIAction · AIRecommendation · Denial · Appeal · Recovery · FollowUp ·
Exception · AuditEvent · PayerCapability.

### AI behavior

Core logic is **deterministic rules** (e.g. `age > threshold AND status = unresolved → risk high`;
`claim-status API available → use API before voice`; `confidence < threshold → human exception`),
with LLM-style natural-language explanations layered on top — mirroring how production AI combines
rules + models + workflow state + payer intelligence.

## Production migration roadmap

EHR/PM & clearinghouse integrations · real EDI · payer FHIR/API integrations · approved portal
automation · approved voice integration · security & compliance hardening and independent
certification · enterprise deployment · production monitoring & model governance.
