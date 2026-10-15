# AI Studio Craft Commercial Suite

**Infinitia Hub × AI Studio Craft** — an internal commercial document platform for creating premium
commercial proposals, quotations, GST tax invoices and proforma invoices, recording payments, and
sending documents by email (Brevo) and WhatsApp (Business Cloud API).

This is an **internal company application**. It has no public sign-up, no subscriptions and no multi-tenancy.
Administrators create user accounts.

---

## Features

| Area | What it does |
|---|---|
| **Dashboard** | Quotation/invoice counts, outstanding receivables, paid invoices, drafts, payment-status bar (real amounts only), recent documents, activity and communications. Sample data is flagged. |
| **Customers** | Create, edit, view, search, filter (status/channel), archive/restore, delete (only without documents). GSTIN optional and validated; state/state code; WhatsApp opt-in. |
| **Products & Services** | Reusable catalogue: descriptions, category, SKU, HSN/SAC, unit, default qty/price, GST rate, billing frequency, inclusions/exclusions, active flag. Custom one-off lines are supported on documents. |
| **Document builder** | Guided steps: Customer → Details → Services & pricing → (Proposal sections) → Terms → Design & preview. Inline validation, live totals, live preview using the PDF renderer, save draft, unsaved-changes warning. |
| **Commercial proposals** | Assembled from 17 reusable section types (cover, executive summary, service detail pages, features, scope, deliverables, implementation plan, timeline, commercial summary, terms, business value, assumptions, exclusions, acceptance, closing…). Add/remove/hide, drag-and-drop or move up/down, edit content, duplicate, reopen. |
| **Quotations** | Draft → Sent → Accepted/Rejected; Expired derived from validity. Accepted quotations convert to invoice/proforma exactly once. |
| **Tax invoices** | Numbered when issued (gap-free series for drafts), Issued → Partially paid → Paid (from payments only), Overdue derived from due date, Cancel. Payment recording with method/reference; overpayment rejected. |
| **Proforma invoices** | Clearly titled "Proforma Invoice" with a not-a-tax-invoice disclaimer; convertible to a tax invoice. |
| **GST engine** | Decimal-safe (`decimal.js`), CGST+SGST / IGST / No-tax chosen per document (suggested from supplier state vs place of supply), per-line half-up paise rounding, optional nearest-rupee grand total with explicit round-off, per-rate tax summary, amount in words (lakh/crore). |
| **Templates** | Premium Commercial (16:9 slide proposals modelled on the Anant Motors reference; navy A4 variant for other documents), Professional Quotation, Professional Invoice, Detailed Project Proposal (A4, numbered sections with contents). |
| **PDF** | Real PDFs with selectable, embedded fonts via headless Chromium + `pdf-lib`: page breaks, repeating table headers, running footers, "Page n of N", continuation headers, full-bleed cover/closing pages, watermarks for Draft/Sample/Cancelled. |
| **Brevo email** | Send quotation/proposal/invoice/payment reminder with PDF attached, test connection, test email, editable templates, logged attempts and safe error messages. |
| **WhatsApp** | Cloud API: PDF uploaded as media (no public URLs needed), approved-template or 24-hour-window sending, consent enforcement, signature-verified webhook with de-duplication and non-regressing statuses. Manual `wa.me` fallback (logged as *Prepared*, never as delivered), with optional short-lived secure link. |
| **Communications** | Evidence-based statuses: Prepared, Queued, Sent to provider, Delivered, Read, Failed. Message bodies and secrets are not stored. |
| **Document history** | Audit trail of document, payment, communication and settings events. |
| **Company settings** | Multiple company profiles; branding (two configurable logos with light/dark tiles, colours) kept separate from legal/tax/bank details; numbering per series; default terms; rounding; sample-data reset. |
| **Security** | Real authentication (scrypt hashes, DB sessions with hashed tokens, httpOnly cookies), role-based access (Admin/Staff), login rate limiting, edge gate + server-side checks on every page/action/API, Zod validation on the server, signed render tokens, upload magic-byte checks, no secrets in client code. |

---

## Technology stack

- **Next.js 15.5** (App Router, Server Actions) · **React 19** · **TypeScript**
- **Tailwind CSS 4** with hand-written shadcn-style components (Radix Dialog/Dropdown), **Lucide** icons, **Sonner** toasts
- **React Hook Form** + **Zod** (shared client/server schemas)
- **PostgreSQL 16** + **Prisma 6** (DECIMAL money columns, transactions, unique constraints)
- **decimal.js** for all monetary arithmetic
- **puppeteer-core** (headless Chromium) + **pdf-lib** for PDF generation
- **Vitest** (unit + PostgreSQL integration tests) and a **puppeteer-core** end-to-end browser test
- Self-hosted fonts via **Fontsource** (Lato for documents, Inter / Plus Jakarta Sans for the UI)

Project layout:

```
prisma/              schema, migrations, seed, seed assets (logos from the reference proposal)
src/app/(app)/       authenticated application pages
src/app/(auth)/      login
src/app/print/       print view used by the PDF renderer (signed-token access)
src/app/api/         PDF endpoint, WhatsApp webhook
src/app/share/       short-lived secure document links
src/app/actions/     server actions (validated, authorised)
src/lib/             money & GST engine, services, auth, integrations, PDF, validation
src/components/      UI kit, shell, editor, document renderers
tests/               unit, integration (PostgreSQL), e2e (browser)
```

---

## Prerequisites

- Node.js **20+** (developed on 22) and npm
- PostgreSQL **14+** (developed on 16)
- Chromium or Google Chrome (for PDF generation), path set in `CHROMIUM_PATH`

## Installation

```bash
cd ai-studio-growth/commercial-suite
npm install                      # also runs `prisma generate`
cp .env.example .env             # then fill in DATABASE_URL, SESSION_SECRET, SEED_ADMIN_*, CHROMIUM_PATH
```

### Database setup

```bash
# create a role and database (example)
psql -U postgres -c "CREATE ROLE commercial WITH LOGIN PASSWORD 'change-me' CREATEDB;"
createdb -U postgres -O commercial commercial_suite

npm run db:migrate               # prisma migrate deploy (non-destructive)
npm run db:seed                  # company profile, admin user, templates (+ sample data unless SEED_SAMPLE_DATA=false)
```

During development use `npm run db:migrate:dev` to create new migrations.
`npm run db:reset-samples` deletes and recreates **only** the sample records (also available to admins in Company Settings).

## Development

```bash
npm run dev                      # http://localhost:3000 (bound to 0.0.0.0)
```

Sign in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. Change the password under **Settings → Users** and create staff accounts there.

## Build & run in production mode

```bash
npm run build
npm run start                    # next start -H 0.0.0.0 -p 3000
```

## Testing

```bash
npm run typecheck                # tsc --noEmit
npm run lint                     # eslint
TEST_DATABASE_URL=postgresql://…/commercial_suite_test npm test   # unit + integration (applies migrations to the test DB)
APP_URL=http://127.0.0.1:3000 npm run test:e2e                     # browser workflow test against a running server
```

The integration tests use a **separate** database and clear its document tables. Never point `TEST_DATABASE_URL` at real data.

## Environment variables

See `.env.example` for the full list. Summary:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection |
| `SESSION_SECRET` | 32+ char secret (signs PDF render tokens) |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | First administrator (password generated & printed once if empty) |
| `CHROMIUM_PATH` | Chromium/Chrome executable for PDFs |
| `INTERNAL_APP_URL` | How the server reaches itself for rendering (default `http://127.0.0.1:$PORT`) |
| `PUBLIC_APP_URL` | Public HTTPS URL (WhatsApp webhooks, secure document links) |
| `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, `BREVO_REPLY_TO` | Brevo transactional email |
| `EMAIL_DELIVERY_MODE` | `live` (default) or `mock` (development only; logs, does not send) |
| `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_API_VERSION`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` | WhatsApp Cloud API |

All secrets are read on the server only. Missing integration credentials never block document creation;
the Integrations page shows exactly what is configured.

### WhatsApp notes

- Business-initiated messages require an **approved template**. Configure the template name in
  Integrations: a template with a **DOCUMENT header** and three body variables (customer name, document number, amount).
  Without a template, document messages are only delivered within 24 hours of the customer's last message.
- API sending requires a recorded customer **opt-in** (customer record → WhatsApp opt-in).
- Webhook: point Meta to `https://YOUR_DOMAIN/api/webhooks/whatsapp`, use `WHATSAPP_WEBHOOK_VERIFY_TOKEN`,
  and set `WHATSAPP_APP_SECRET` so signatures (`X-Hub-Signature-256`) can be verified.

## Sandbox vs production persistence

The sandbox uses the same stack as production — **PostgreSQL + Prisma** — so there is no persistence difference.
Company logos are stored in the database (bytea) and PDFs are generated on demand (not stored), so no file
storage is required.

## Tax & compliance disclaimer

The GST engine performs arithmetic according to the treatment you choose; it does not certify statutory
compliance. Verify rates, HSN/SAC codes, place of supply and invoice requirements (and e-invoicing obligations,
if applicable) with your tax adviser.

## Company details

Legal name, address, GSTIN, PAN and bank details are intentionally **blank** in the seed — enter them in
**Company Settings**. The logos and contact details seeded for Infinitia Hub × AI Studio Craft were taken from the
supplied reference proposal and can be replaced at any time.

---

## Future deployment (Hostinger)

Next.js server rendering and Chromium-based PDFs need a **Node.js server**, so use a **Hostinger VPS** (shared
web hosting cannot run this app). Recommended setup on Ubuntu:

1. `apt install -y nodejs npm postgresql chromium nginx` (Node 20+ via NodeSource if needed); install fonts
   (`fonts-crosextra-carlito fonts-dejavu`) for consistent PDF glyph fallback.
2. Create the PostgreSQL role/database; set `.env` with production values, `PUBLIC_APP_URL=https://your-domain`,
   `CHROMIUM_PATH=/usr/bin/chromium` and real Brevo/WhatsApp credentials.
3. `npm ci && npm run build && npm run db:migrate && SEED_SAMPLE_DATA=false npm run db:seed`.
4. Run with a process manager: `pm2 start npm --name commercial-suite -- start` and `pm2 save`.
5. Nginx reverse proxy to `127.0.0.1:3000` with HTTPS (Let's Encrypt / Certbot). Session cookies are `Secure`
   in production, so HTTPS is required.
6. Daily `pg_dump` backups; keep `.env` outside version control.
7. In Meta's developer console, configure the webhook URL and subscribe to message status updates.
