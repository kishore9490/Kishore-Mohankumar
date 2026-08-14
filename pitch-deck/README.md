# AI Revenue Recovery OS — Investor Pitch Deck

A self-contained, 22-slide investor pitch deck for **AI Revenue Recovery OS** — the
intelligence and execution layer for autonomous healthcare revenue cycle management (RCM).

## Files

- **`index.html`** — the interactive source deck (navigable, self-contained)
- **`AI-Revenue-Recovery-OS-Deck.pptx`** — PowerPoint export, one slide per page
- **`AI-Revenue-Recovery-OS-Deck.pdf`** — PDF export, one slide per page

The PPTX and PDF are rendered from the HTML at 2× resolution (2560×1800 px per slide),
so they match the web deck pixel-for-pixel. To regenerate them after editing
`index.html`, re-run the capture-and-build steps (Playwright screenshots → Pillow for
PDF, python-pptx for PPTX).

## View it

Open `index.html` in any modern browser. No build step, no dependencies — all CSS,
JavaScript and diagrams are inline and self-contained.

- **Navigate:** `↑` / `↓` arrows, `J` / `K`, `PageUp` / `PageDown`, or `Home` / `End`
- **Jump:** click the dot navigation on the right edge
- **Print / PDF:** the deck is print-styled (one slide per page)

## Slides

1. Cover · 2. The Problem · 3. The Status Quo *(RCM machine + human bottleneck)* ·
4. Why Existing Software Isn't Enough · 5. Why Now · 6. The 2026–2027 Interoperability
Inflection · 7. The Solution (architecture) · 8. How One Claim Is Worked · 9. AI AR
Workforce · 10. AI Payer Calling · 11. Intelligence Engines *(Revenue Risk + Denial)* ·
12. Payer Intelligence Graph · 13. The Platform Loop · 14. Market *(opportunity +
growth)* · 15. Competitive Landscape · 16. Why We Win · 17. Customer & Beachhead ·
18. Product Roadmap · 19. Business Model & ROI · 20. Go-to-Market & Pilot ·
21. Technology Architecture · 22. Closing

*Compressed from an earlier 28-slide cut by merging six related pairs (marked above).*

## Sourcing & accuracy notes

Factual slides are backed by cited, public sources and deliberately avoid inflated or
fabricated claims:

- **Regulatory (Slide 7):** CMS Interoperability & Prior Authorization Final Rule
  (CMS-0057-F, 2024). Operational prior-auth rules begin Jan 1, 2026; the FHIR API
  build-out (Prior Authorization, Provider Access, Payer-to-Payer, Patient Access APIs)
  is generally due Jan 1, 2027. Impacted payers: Medicare Advantage, Medicaid & CHIP
  (FFS + managed care), and QHP issuers on the FFEs. The rule does **not** make all
  eligibility/verification API-only and does not cover all commercial/employer plans.
  Source: cms.gov fact sheet & Federal Register (2024-00895).
- **Market (Slides 16–17):** TAM/SAM/SOM presented with the definitional caveat that RCM
  estimates diverge ~5–6× by firm. Figures attributed to Grand View Research, Precedence,
  MarketsandMarkets, CAQH, Optum and MGMA (2024–2025). ACV is to be derived bottom-up in
  pilots rather than cited from an unsourced figure.
- **Competitive landscape (Slide 18):** Company positioning reflects public framing as of
  mid-2026; placement is illustrative and not a claim about specific missing features.

Illustrative figures (ROI, pricing) are labeled as such and are to be validated in pilots.
