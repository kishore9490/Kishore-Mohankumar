# Digital Showroom — Authorised Honda Two-Wheeler Dealership

A cinematic, mobile-first digital showroom, sales and service platform for an authorised Honda two-wheeler dealership in India. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Motion and React Three Fiber.

> **What if walking into a Honda showroom started on your phone?**

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Journeys

| | Route |
|---|---|
| Home — hero, "What do you want to do?", discovery, story, test ride, finance, service, accessories, showroom | `/` |
| Find your ride + Help me choose + compare | `/bikes` |
| Product experience — hotspots, specs, configurator, live price & EMI | `/bikes/[slug]` |
| Test ride booking with calendar export | `/test-ride` |
| EMI calculator | `/finance` |
| Service hub / booking / live tracking | `/service`, `/service/book`, `/service/track` |
| My Honda garage (demo) | `/garage` |
| Accessory configurator | `/accessories` |
| Showroom, directions, hours | `/contact` |
| About, trust, rider stories, offers | `/about` |

Global: on-road price & callback sheets (from any CTA), contextual WhatsApp, mobile bottom navigation, analytics hooks.

## Before going live — replace sample content

Everything below is **sample content** and is clearly isolated:

| File | What to replace |
|---|---|
| `data/dealership.ts` | Name, logo (`logo`), address, coordinates, phones, WhatsApp, hours, site URL. Set `isSampleData: false` to remove the preview notice and enable price structured data. Add `metrics` **only** with verified numbers. |
| `data/bikes.ts` | Current price list, variants, colours and Honda-published specifications. Add licensed photography (`heroImage`, `colors[].image`) — the UI swaps from studio silhouettes to photos automatically. |
| `data/accessories.ts` | Genuine accessory price list and images. |
| `data/offers.ts` | Approved offers with terms (section is hidden while empty). |
| `data/stories.ts` | Real customer stories with consent (an honest invitation renders while empty). |
| `data/services.ts` | Service menu and slot times. |

Nothing on the site invents testimonials, offers, awards, sales figures, years of operation or certifications.

## Backend integration

All reads/writes go through `lib/api.ts`. With `NEXT_PUBLIC_API_BASE_URL` unset it serves demo data (labelled "Demo data" in the UI). Set it to connect your CRM / DMS — expected endpoints are documented at the top of that file. Types for every entity (bikes, variants, leads, vehicles, service jobs, garage) live in `lib/types.ts`.

Demo helpers for reviewing states:

* Service registrations: `TN 37 AB 1234` (in progress), `TN 66 C 4521` (ready), `TN 38 BZ 7788` (known bike, no active job); anything else → not found.
* Mobile `0000000000` → simulated submission failure.
* Workshop closed on Sundays; some slots show as booked.

## Analytics

`lib/analytics.ts` → `track(event, props)` pushes to `window.dataLayer` (GTM/GA4 if you add it) and dispatches a `showroom:analytics` DOM event. No provider is hard-wired.

## Architecture & design system

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
