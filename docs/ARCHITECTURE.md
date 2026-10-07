# Digital Showroom — Architecture & Design System

## 1. Customer journeys (the spine of the site)

| Journey | Path | Primary conversion |
|---|---|---|
| **BUY** | Discover (`/bikes`) → Help me choose → Product (`/bikes/[slug]`) → Configure → EMI → Test ride / On-road price | Book test ride |
| **RIDE** | Product → Book test ride (`/test-ride?bike=`) → Date / slot / location → Confirmation (+ calendar) | Test-ride request |
| **SERVICE** | `/service` → Book (`/service/book`) → Track (`/service/track`) → Garage (`/garage`) | Service booking |

Every page answers "what should the user do next?" with one primary action (signal red) and at most one or two secondary actions.

Conversion priority: **Book test ride** › **Get on-road price** › **Book service** › **Call / WhatsApp**.

## 2. Folder structure

```
app/                     routes (App Router, Next 16)
components/ui            primitives — Button, Field, Sheet, Notice, Reveal, Icon …
components/layout        header, mobile bottom nav, footer, JSON-LD
components/leads         LeadProvider (global On-road price & Callback sheets)
components/hero          homepage hero
components/3d            React Three Fiber scenes (lazy, desktop only)
components/bikes         discovery, recommendation, product experience
components/test-ride     test ride flow
components/finance       EMI calculator
components/service       service booking, tracking, garage
components/accessories   accessory configurator
components/dealership    showroom / contact / trust / stories / offers
data/                    content — swap for CMS/API without touching UI
lib/                     types, api (data access), analytics, emi, formatting, validation
hooks/                   shared hooks
```

## 3. Data & backend readiness

* All entities are typed in `lib/types.ts` (Bike, Variant, Color, Accessory, Offer, ServiceType, Dealership, Vehicle, ServiceJob, GarageProfile and every Lead type).
* UI never fetches directly. All mutations and lookups go through `lib/api.ts`. With `NEXT_PUBLIC_API_BASE_URL` unset it serves demo data with realistic latency; when set, the same functions call REST endpoints (documented at the top of the file).
* **Demo data is labelled.** Anything served from `data/demo-service.ts` is shown with `<DemoBadge />` when `isDemoMode` is true.
* **Never fabricate**: testimonials (`data/stories.ts`), offers (`data/offers.ts`), metrics (`dealership.metrics`) are empty/null until real values are supplied; their sections hide or render an honest placeholder.
* Demo hooks for reviewing error states: mobile `9000000000` → submission failure; registration `TN37AB1234` → in-progress service, `TN66C4521` → ready; `TN38BZ7788` → known vehicle, no active job; Sundays → workshop closed; some slots are booked.

## 4. Analytics

`track(event, props)` in `lib/analytics.ts` — provider-agnostic (pushes to `window.dataLayer` and dispatches a `showroom:analytics` DOM event). Required events: `bike_view, bike_compare, emi_calculation, test_ride_started, test_ride_completed, service_booking_started, service_booking_completed, onroad_price_request, whatsapp_click, phone_click, directions_click, accessory_enquiry`.

## 5. Design system — "Showroom"

**Idea:** the motorcycle lives in a dark studio; decisions happen on warm paper. Sections alternate between the two to create rhythm and breathing space.

### Colour (Tailwind tokens)
* Dark surfaces: `bg-ink` (#0a0b0d), `bg-ink-2`, `bg-ink-3`, `bg-ink-4`. Text `text-bone`, secondary `text-bone/60`, `text-smoke`.
* Light surfaces: add class `surface-paper` (sets bg, text colour and `--surface-bg`). Variants `bg-paper-2`, `bg-paper-3`.
* Accent: `signal` (#d8232f) — **only** for the primary action, active indicators and tiny details. Never large fills, never gradients.
* Status: `go` / `go-soft`, `amber` / `amber-soft`, `alert` / `alert-soft`.
* Borders: prefer `border-current/10–15` so components work on both surfaces.

### Type
* `font-display` (Archivo, expanded, uppercase, tight) for headlines. Sizes: `text-display-xl | lg | md | sm`.
* `font-display-wide` for the wordmark and big numerals.
* Body: Inter (default). Lede: `text-base md:text-lg opacity-70`.
* `eyebrow` (mono, uppercase, tracked) for labels; `tabular` for numbers.

### Layout & components
* Page gutter: `container-x`. Section vertical rhythm: `py-24 md:py-36` (big moments) / `py-16 md:py-24`.
* Section headers: `<SectionHeading index="02" eyebrow="Find your ride" title={["Find", "your ride."]} lede="…" />`.
* Avoid card soup. Prefer hairline dividers (`border-t border-current/10`), lists, and large type. Rounded radius: `rounded-2xl`/`rounded-[28px]` for panels, `rounded-full` for buttons and chips.
* Buttons: `Button` / `ButtonLink` — variants `primary` (signal), `light`, `dark`, `outline`, `ghost`; sizes `sm|md|lg`; `icon="arrow-right"`; `magnetic` for hero-level CTAs.
* Forms: `TextField`, `SelectField`, `TextArea`, `ChoiceGroup` (chips or cards, radio/checkbox, keyboard accessible), `DateStrip`, `SlotGrid`, `StepProgress`. Validation via `lib/validation.ts`. Errors inline; never `alert()`.
* Feedback: `Notice` (info/success/warning/error), `SuccessMark` + `SummaryList`, `LeadSuccess`.
* Global sheets: `useLeads().openOnRoadPrice({ bikeSlug, source })`, `useLeads().openCallback({ topic, title, details, source })`.
* Bike imagery: always `BikeVisual` (photo if supplied, else colour-aware `BikeSilhouette`).
* Motion: `Reveal`, `RevealLines`, `AnimatedNumber`. Easing `ease-[var(--ease-out-expo)]`. Durations 200–900 ms. Respect reduced motion (`useReducedMotion` from `motion/react` or `usePrefersReducedMotion`).
* WhatsApp: `whatsappUrl(intent, context)` from `lib/whatsapp.ts` — always contextual, never the only contact method.

### Mobile
* Bottom nav is fixed (height `var(--bottom-nav-h)`). Any sticky mobile CTA bar must sit **above** it: `bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))]` and be `lg:hidden`.
* Minimum touch target 44 px. Inputs ≥ 16 px font (no iOS zoom).

### Accessibility
Semantic landmarks, one `h1` per page, labelled controls, visible focus, `aria-live` for async results, reduced-motion fallbacks, AA contrast (bone on ink, ink on paper; use opacity ≥ 0.55 for text).
