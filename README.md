# BID Trust

**BID = Business Identity & Due Diligence**
`bidtrust.in`

> **Trust, backed by verification.**

An industry-agnostic enterprise trust, verification and due-diligence infrastructure platform.

---

## Run it on your machine

Everything below runs locally. Requires **Node 18+** (built and verified on Node 22)
and **Python 3.8+** for the model and PDF export.

### Get the code

**With git (macOS / Linux / Windows with Git installed):**

```bash
git clone https://github.com/kishore9490/Kishore-Mohankumar.git
cd Kishore-Mohankumar
git checkout claude/bid-trust-strategy-ah940a
```

**Windows without git — PowerShell, no install required:**

```powershell
cd $HOME
New-Item -ItemType Directory -Force -Path Projects | Out-Null
cd Projects

$url = "https://github.com/kishore9490/Kishore-Mohankumar/archive/refs/heads/claude/bid-trust-strategy-ah940a.zip"
Invoke-WebRequest -Uri $url -OutFile bidtrust.zip -UseBasicParsing
Expand-Archive -Path bidtrust.zip -DestinationPath . -Force

cd Kishore-Mohankumar-claude-bid-trust-strategy-ah940a
```

> Do not run any of this from `C:\Windows\system32`. It is a protected system
> folder and the commands will fail or need admin rights.

#### If PowerShell blocks npm

`npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running
scripts is disabled on this system` means Node is installed fine and PowerShell
is refusing to run npm's script wrapper. Either:

```powershell
npm.cmd install        # use npm.cmd — changes nothing on your system
```

or allow local scripts once, which needs no admin rights:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### 1. The Architecture Explorer (interactive app)

```bash
cd architecture-explorer
npm install
npm run dev
```

Open **http://localhost:5173** — 15 screens, 69 clickable components, the
animated network scenario, the editable policy builder, the BID Digital Card
and the public profile.

```bash
npm run build            # typecheck + production build → dist/
npm run preview          # serve the production build
npm run build:singlefile # one self-contained HTML file, no external requests
```

### 2. The investor deck

Open `deck/bid-trust-investor-deck.html` in any browser — no build step.
Arrow keys navigate, **N** toggles speaker notes, **A** shows all slides.

Ready-made PDFs are in `deck/pdf/`. To regenerate them:

```bash
pip install playwright && playwright install chromium
python3 deck/build-pdf.py
```

### 3. The financial model

```bash
python3 models/unit_economics.py     # regenerates models/OUTPUT.md
```

No dependencies. Edit the assumption CSVs in `models/` and re-run — every
downstream number moves with them.

### 4. The strategy dossier (single page)

Open `design/strategy-dossier.html` directly, or rebuild it from the markdown:

```bash
pip install markdown
python3 design/build-dossier.py
```

---

## What this repository contains

The complete strategy, product architecture, business model and go-to-market plan for BID Trust.

| # | Document | What it answers |
|---|---|---|
| 00 | [Executive Summary](docs/00-executive-summary.md) | The whole thesis in ten minutes |
| 01 | [Business Concept & Positioning](docs/01-business-concept.md) | The problem, the ABC example, what BID is and is not |
| 02 | [Entity & Relationship Model](docs/02-entity-model.md) | The domain-agnostic data model |
| 03 | [Verification Catalog](docs/03-verification-catalog.md) | Every check: business, person, contractor workforce |
| 04 | [Verification Policy Engine](docs/04-policy-engine.md) | How one engine serves every industry |
| 05 | [Provider Orchestration](docs/05-provider-orchestration.md) | The router, source classes, what BID does *not* build |
| 06 | [BID ID Architecture](docs/06-bid-id-architecture.md) | The identifier scheme |
| 07 | [BID Card & Public Profile](docs/07-bid-card-and-profile.md) | The shareable trust surface |
| 08 | [Consent & Authorized View](docs/08-consent-and-authorized-view.md) | Disclosure, consent receipts, the request workflow |
| 09 | [Credibility & Risk Assessment](docs/09-risk-assessment.md) | The explainable assessment framework |
| 10 | [Reusable Profile & Network Effect](docs/10-reusable-profile.md) | The compounding asset |
| 11 | [Privacy, Security & Compliance](docs/11-privacy-security.md) | Architecture-level privacy, DPDP posture, legal open items |
| 12 | [Revenue Model](docs/12-revenue-model.md) | Ten revenue lines, starting prices |
| 13 | [Unit Economics](docs/13-unit-economics.md) | Illustrative model + live calculator |
| 14 | [Customer Acquisition & GTM](docs/14-gtm.md) | Buyers, wedges, channels, pilot ladder |
| 15 | [Sales Pitch & Messaging](docs/15-sales-pitch.md) | The pitch, objections, demo script |
| 16 | [Competitive Landscape](docs/16-competitive-landscape.md) | Who else is in this market and where BID sits |
| 17 | [Roadmap & Build Sequence](docs/17-roadmap.md) | 0–24 months |
| 18 | [Risk Register & Open Questions](docs/18-risks-and-open-questions.md) | What can kill this, what needs answering |

## What else is in here

| Path | What it is |
|---|---|
| `docs/` | The 19 strategy documents indexed above |
| `architecture-explorer/` | React + TypeScript interactive architecture map (15 screens) |
| `deck/` | Investor deck (HTML + PDFs + PDF build script) |
| `models/` | Runnable unit-economics model driven by editable assumption CSVs |
| `design/` | Strategy dossier page, BID Card visual direction, build script |

---

**Design mockups:** [`design/bid-card.html`](design/bid-card.html) — open in a browser for the BID Card and public profile visual direction.

**Financial model:** [`models/`](models/) — editable assumption CSVs and a calculator that regenerates unit economics when real provider quotes arrive.

---

## The one-line pitch

> BID Trust is an enterprise verification and due-diligence platform that verifies the businesses and people you do business with — against your own policy, through authorized data sources, with an auditable record you can defend to a regulator, a customer or a court.

## The core question BID answers

> *"Can I safely and compliantly do business with this entity?"*

## The three strategic bets

1. **Horizontal engine, vertical policies.** Industry-specific requirements are configuration (a *Verification Policy*), never a separate product. One codebase serves manufacturing, healthcare, IT, construction, logistics, pharma and everything else.
2. **Orchestration, not data ownership.** BID does not build a hundred data sources. It builds the routing, normalization, evidence, consent and audit layer over authorized providers — the part that is hard to copy and gets better with scale.
3. **Reusable verified identity.** Every vendor invited by one buyer becomes a verified entity available to the next buyer, under consent. Verification cost falls with network density while price does not. This is the whole business.

## What BID never claims

BID does not say *"this company is trustworthy."*
BID says *"here is verified evidence, its source, its method, its timestamp and its scope — decide."*

---

## Status

Strategy and architecture definition. Pre-build. Nothing in this repository is legal, financial or regulatory advice; all pricing and cost figures are explicitly illustrative and flagged as such. See [§18](docs/18-risks-and-open-questions.md) for items requiring counsel before launch.
