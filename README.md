# Infinitia Links — Student Digital Identity Demo

**Digital Identity for the Next Generation** · *One link. Infinite possibilities.*

An interactive, presentation-ready demo of a premium student digital ID experience, built for showing to principals, deans, VCs and management teams. It uses a **fictional institution, Nova Institute of Technology**, and sample data throughout.

> ⚠️ **DEMO / NOT VALID FOR IDENTIFICATION.** Every card, profile and verification result is clearly labelled as a demonstration. No real student data is used and nothing connects to any institutional system.

---

## Quick start

No build step, no backend, no install.

1. Download or clone this repository.
2. Open **`index.html`** in any modern browser (Chrome, Edge, Safari, Firefox).

That's it. Optional: serve it over HTTP for the best experience (native share sheet, QR codes that point at your hosted pages):

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Works offline. With an internet connection the page loads the *Plus Jakarta Sans* and *JetBrains Mono* fonts from Google Fonts; offline it falls back to system fonts.

---

## What's inside

| Page | File | Highlights |
|---|---|---|
| **Digital ID (hero)** | `index.html` | 3D flip card with pointer tilt & shine, 6 card designs, PNG download (front/back), simulated phone wallet, full-screen QR, copy/share profile link, institution info |
| **Student profile** | `profile.html` | Profile header, academic info, digital ID, QR verification, campus shortcuts (website, library, LMS, support), announcements, events with “interest” toggles, fictional emergency contacts |
| **QR verification** | `verify.html` | Animated scan → **DEMO IDENTITY VERIFICATION** result with prominent “not an official student credential” warning; reflects active/inactive status; scan simulator for every sample student |
| **Admin preview** | `admin.html` | KPIs (IDs, active profiles, QR scans, views, departments, programmes), charts, activity feed; create/edit profiles with live card preview; activate/deactivate; generate & download QR; bulk CSV import with validation; branding (name, crest upload, colours, custom domain); template selection; CSV export; reset demo data |

Also: light & dark themes, page transitions, splash loader, toast notifications, mobile bottom tab bar, keyboard shortcuts on the ID page (`F` flip, `Q` QR).

### Demo script (≈3 minutes)

1. **Digital ID** — tap the card to flip it, switch designs, *Add to Wallet*, open the full-screen QR.
2. Tap the QR → **Verify** shows the demo verification result.
3. **Admin Preview → Student profiles** — switch off Aarav Sharma, then re-open *Verify*: status becomes **DEMO INACTIVE**.
4. **Admin → Branding** — type your college's name, pick colours, upload a crest, set `id.yourcollege.edu`, save, then choose the *Institution Brand* template. Every page now carries the new brand.
5. **Admin → Bulk import** — *Load sample CSV* to show validation, then import.
6. Use **Reset demo data** in the admin sidebar to restore the original state.

---

## How it works

```
index.html, profile.html, verify.html, admin.html
css/styles.css      Design system: tokens, light/dark themes, card, components, layouts
js/data.js          Fictional sample data + localStorage store (Store)
js/qr.js            Dependency-free QR encoder (byte mode, level M, v1–10) → SVG / canvas
js/ui.js            App shell, theme, icons, toasts, modals, copy/share, helpers (UI)
js/card.js          ID card engine: avatars, templates, flip/tilt, canvas PNG export (Card)
js/wallet.js        Digital ID page          js/profile.js   Student profile page
js/verify.js        Verification page        js/admin.js     Admin dashboard
assets/favicon.svg
```

- **Plain HTML, CSS and JavaScript** — classic scripts (no ES modules) so it runs straight from `file://`.
- **No external libraries, APIs or authentication.** QR codes, avatars and PNG export are generated in the browser.
- **Data** lives in `localStorage` on the viewing device only (key `infinitia.links.demo`). If storage is unavailable the demo still works in memory.
- **Avatars** are generated illustrations — no photos of real people.
- **Card scaling** uses CSS container query units, so the same card renders crisply from wallet thumbnails to the full hero.

### QR codes & links

- Opened from disk, QR codes and share links use the institution's configured **custom domain** (default `id.nova-institute.example`, a reserved example domain) — e.g. `https://id.nova-institute.example/verify/DEMO-2026-1042`. Inside the app, tapping a QR always opens the local simulated verification page.
- Served over HTTP(S), QR codes point at the hosted `verify.html?id=…`, so scanning a card with a phone opens the live demo verification.

---

## Customising

- **Sample data:** edit `js/data.js` (`DEFAULT_BRANDING`, `PROGRAMMES`, `NAMES`, `TEMPLATES`). Bump `VERSION` so browsers pick up the new seed.
- **Card designs:** add an entry to `TEMPLATES` in `js/data.js` (three background stops plus text, muted, accent, glow and footer colours).
- **Brand colours & fonts:** CSS tokens at the top of `css/styles.css`.

## Scope

This is a front-end demonstration of the student identity experience only. It is **not** an HRMS, ERP, attendance or examination system, and it does not issue, store or verify real credentials.

---

Powered by **Infinitia Links** – A product by Infinitia Hub
