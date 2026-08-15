# BID Trust — Architecture Explorer

An interactive architecture map for **BID Trust** (Business Identity & Due Diligence) — a
domain-agnostic trust, verification and due-diligence infrastructure platform.

> **Trust, backed by verification.**

This is **not** the BID Trust product. It is an explorer that lets founders, architects,
developers, investors and business stakeholders visually understand how the whole ecosystem
fits together — business architecture and technical architecture in one place.

---

## ⚠ Read first: the logo is a placeholder

The brief referenced an attached BID Trust logo as the authoritative brand reference. **No image
arrived with the prompt.** Rather than invent a mark and present it as yours, the app ships a
clearly-labelled placeholder that follows the established brand direction only (navy ground,
green verification check).

**To drop in the real logo — one change, propagates everywhere:**

```
Replace  public/logo.svg  with the official asset (keep the filename).
```

Every surface — top bar, sidebar, BID Card, public profile, story mode, hero, favicon — renders
through `src/brand/Logo.tsx`, which is the single source of truth. Once swapped, set
`LOGO_IS_PLACEHOLDER = false` in that file to remove the warning banner in the sidebar.

If the official mark is a raster or a more complex SVG, set `USE_INLINE_MARK = false` in
`Logo.tsx` and it will render `public/logo.svg` as an `<img>` instead.

---

## Run it

```bash
cd architecture-explorer
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run build        # typecheck + production build
npm run preview      # serve the production build
npm run typecheck    # tsc --noEmit
```

Requires Node 18+. Built and verified on Node 22.

---

## Stack

| | |
|---|---|
| React 18 + TypeScript | Strict mode, no `any` in app code |
| Vite 5 | Dev server and build |
| Tailwind CSS 3 | Brand tokens in `tailwind.config.js` |
| @xyflow/react (React Flow 12) | Layer map, network graph, ERD, provider routing, event bus |
| Framer Motion | Story mode, drawers, staged reveals |
| Recharts | Expansion and customer-health charts |
| Lucide | Icons |
| React Router 6 | 15 routes, lazy-loaded |

---

## Project structure

```
architecture-explorer/
├── public/logo.svg              ← swap this for the real logo
├── src/
│   ├── brand/Logo.tsx           single source of truth for the mark
│   ├── types.ts                 shared domain types
│   ├── state/explorer.tsx       drawer, filters, zoom, search, highlight
│   ├── components/
│   │   ├── AppShell.tsx         sidebar, top bar, filter bar, zoom control
│   │   ├── DetailDrawer.tsx     the one right-side drawer / mobile bottom sheet
│   │   ├── SearchPalette.tsx    ⌘K global architecture search
│   │   ├── flow.tsx             React Flow canvas + memoized node types
│   │   └── ui.tsx               Panel, Chip, Note, Legend, Code, tone tokens
│   ├── data/                    ← all seed/demo data lives here
│   │   ├── layers.ts            9 layers, 69 components with full drawer detail
│   │   ├── catalog.ts           industries, policy, pipeline, events, ADRs, principles
│   │   ├── dataModel.ts         32 data entities + ERD edges
│   │   ├── lifecycle.ts         20 lifecycle stages + the 24-step story
│   │   ├── api.ts               13 API endpoints with demo JSON
│   │   ├── revenue.ts           plans, revenue lines, expansion, health signals
│   │   └── demo.ts              fictional orgs, people, relationships, campaign
│   └── views/                   15 route views
```

**All content is data-driven.** Adding a component, event, endpoint, entity or ADR means editing
a file in `src/data/` — no view changes required, and it automatically appears in search,
filters and the drawer.

---

## Implemented screens

| # | Screen | What it covers |
|---|---|---|
| 1 | Overview | Hero, clickable Identity/Trust/Network pillars, 8 KPI cards, principle preview |
| 2 | Business Architecture | 16 industries × one engine; Core + Policy = Industry Workflow; business→service capability map |
| 3 | Organization Lifecycle | Organization-as-primary-entity, relationship inspector, **BID Digital Card**, **public profile**, **authorized verification view** |
| 4 | Network Architecture | Animated flywheel graph, 6 view toggles, **24-step Play Scenario** with play/pause/next/previous/restart |
| 5 | Trust Engine | **Interactive policy builder** (add/remove checks, toggle required/optional, change frequency) + explainable assessment |
| 6 | Verification Lifecycle | 14-step pipeline with example data, candidate BGV flow, vendor campaign board |
| 7 | Customer Lifecycle | 14 growth stages + risk/churn/win-back paths, customer-success health model |
| 8 | Technical Architecture | 9-layer canvas, 69 clickable components, event bus fan-out, event catalog |
| 9 | Data Architecture | 32-entity ERD, classification colouring, group filtering |
| 10 | Security & Governance | 18 controls mapped to layers, **organization identity ≠ customer tenant** |
| 11 | Revenue Architecture | Money flow, 4 plans, 10 revenue lines, land-and-expand chart |
| 12 | API Architecture | 13 endpoints with request/response/permissions/events |
| 13 | Provider Architecture | Router with **live failover simulation**, cost/SLA comparison |
| 14 | Future Network | The BID Trust big picture chain |
| 15 | Architecture Principles | 30 principles + 10 ADRs with alternatives considered |

## Interactive features

- **Detail drawer** — every component, lifecycle stage, relationship, data entity, event, endpoint, ADR, pipeline step and industry opens a structured panel. Cross-links between them are clickable.
- **Global search (⌘K / Ctrl+K)** — indexes ~160 objects; navigates to the right route, highlights the target and opens its panel.
- **Facet filters** — 12 concerns; dims non-matching components across canvases and cards.
- **Zoom levels** — Executive / System / Service / Data / Infrastructure change component density on the layer canvas.
- **Story mode** — 24-step animated scenario, ABC → XYZ → LMN → OPQ, with lifecycle stage and billing state per step.
- **Policy builder** — genuinely editable in-session (component state, not persisted, by design).
- **Provider failover** — simulate an outage and watch the router re-route.
- **Authorized view** — request → notice → authorize → disclosure, with revocation.
- **Responsive** — sidebar collapses to a drawer, right drawer becomes a bottom sheet on mobile. Verified at 390px with zero horizontal overflow.

---

## Technical decisions

1. **One drawer, many payload kinds.** `DrawerPayload` is a discriminated union so every clickable object renders through one component with one shape. Adding a new inspectable type is a new case, not a new drawer.
2. **Data separated from views.** Everything is typed data in `src/data/`. Search, filters and zoom are derived from it, so content and presentation never drift.
3. **Routes are lazy-loaded.** React Flow (~178 kB) and Recharts (~369 kB) only load when a view that uses them is opened. The initial payload is a fraction of the total.
4. **Nodes are memoized.** `BoxNode`, `LayerNode` and `EntityNode` are `memo`-wrapped; canvases carry 70+ nodes without re-render churn.
5. **Explicit pointer-events on nodes.** With dragging and selection disabled, React Flow drops `pointer-events` on nodes — which would silently make every architecture box unclickable. Overridden in `index.css`, with an `onNodeClick` fallback on the canvas.
6. **Tone tokens, not ad-hoc colours.** A single `TONE` map drives chips, notes, nodes, legends and bars, so semantic colour stays consistent: green is verification state only, amber is caution, red is exception or isolation boundary.
7. **No backend.** Every interaction is client-side state. The policy builder deliberately does not persist.

---

## Future backend integration points

Each is already shaped in the data layer, so wiring is substitution rather than rewrite:

| Area | Integration point |
|---|---|
| Components | `src/data/layers.ts` → service registry / catalog API |
| Entities & relationships | `src/data/demo.ts` → Organization + Relationship services |
| Policies | `src/data/catalog.ts` → `POST /v1/policies`, versioned |
| Verification | `PIPELINE` → `POST /v1/verification-requests` + SSE/websocket for live step state |
| Events | `EVENTS` → real event-bus subscription for a live feed |
| API explorer | `ENDPOINTS` → generate from the OpenAPI spec instead of hand-authored data |
| Data model | `DATA_ENTITIES` → generate from migrations so the ERD cannot drift |
| KPIs & health | `KPIS`, `HEALTH_DISTRIBUTION` → analytics service |

## Recommended production architecture changes

1. **Generate, don't hand-maintain.** Drive the API explorer from OpenAPI and the ERD from migrations. Hand-written architecture docs drift within one quarter; generated ones cannot.
2. **Split the component catalog per layer** once it passes ~150 entries, and lazy-load per view.
3. **Virtualize the ERD** if entity count grows materially beyond ~50 nodes.
4. **Add deep-linkable drawer state** (`?panel=policy-engine`) so architects can share a link to a specific component.
5. **Add a print/export path** — a PDF of the current view is the artifact investors and security reviewers actually ask for.
6. **Snapshot-test the canvases** to catch layout regressions when data changes.
7. **Add an auth gate** if this is ever hosted publicly — the architecture map reveals a great deal about the product roadmap.

---

## Assumptions

1. **The logo is a placeholder.** No asset was supplied. See the warning at the top.
2. **All numbers are demo data**, labelled as such in the UI. Organizations and people are fictional (ABC Technologies, XYZ HR Consultants, LMN Components, OPQ Logistics, RST Security Services; Ravi Kumar, Anil Sharma, Priya Nair).
3. **Providers are mock adapters** named Provider A/B/C or generic categories. No third-party verification API is integrated, and no claim is made that any specific provider is available. Access eligibility for several real-world channels is legally restricted.
4. **Prices are illustrative starting prices**, labelled in the UI, not final market pricing.
5. **No regulatory approvals are claimed.** BID is presented as a private platform that verifies against authoritative sources through authorized channels — explicitly not a government identity, not a credit bureau, not an Account Aggregator, not a marketplace.
6. **The 24-step story** is drawn from §9 and §28 of the brief; where the brief was truncated mid-sentence at step 1, the sequence follows the §9 narrative.
7. **Architecture content** is consistent with the strategy documents in `docs/` at the repository root — the entity model, disclosure tiers, assessment framework and lifecycle definitions are the same ones specified there.

---

## Content boundaries deliberately enforced

These are product positions expressed in the UI, not styling choices:

- `INSUFFICIENT EVIDENCE` is a distinct state from `HIGH RISK` — an unmeasured MSME is not a risky one.
- No opaque score. Every assessment grade shows its justification.
- No public database of people. Person BID IDs never resolve publicly.
- The candidate always pays ₹0.
- Company-provided and BID-verified information are structurally separated on every profile surface.
- Declining a disclosure is never reported as an adverse signal.
- No adverse risk finding is ever displayed on a public page.
