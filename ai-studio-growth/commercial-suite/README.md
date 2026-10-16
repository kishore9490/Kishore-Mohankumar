# AI Studio Quote Studio

**Infinitia Hub × AI Studio Craft** — an internal commercial document platform for creating premium
commercial proposals, quotations, GST tax invoices and proforma invoices, recording payments, and
sending documents by email (Brevo) and WhatsApp (Business Cloud API).

This is an **internal company application**. It has no public sign-up, no subscriptions and no multi-tenancy.
Access is **invite-only** with **authenticator-app MFA** for every user.

## Quick start (Windows / macOS / Linux)

Prerequisites: Node.js 20+ and an empty MySQL 8 / MariaDB 10.6+ database (e.g. Hostinger). Chrome is optional — a bundled Chromium is used on Linux.

```bash
git clone -b ccr-c1686265-rhp1vi https://github.com/kishore9490/Kishore-Mohankumar.git
cd Kishore-Mohankumar/ai-studio-growth/commercial-suite
npm install
npm run setup -- "mysql://USER:PASSWORD@localhost:3306/DATABASE" you@company.com "Your Name"
npm run dev
```

On Windows PowerShell use `npm.cmd` instead of `npm` (or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once).
`npm run setup` writes `.env` (with a permanent `SESSION_SECRET`), applies migrations, seeds sample data and prints a
**one-time invitation link** for the first administrator. Open it, set a password, scan the QR code with an
authenticator app, save the recovery codes — done. Then configure email and WhatsApp in **Settings → Integrations**.

> Keep `SESSION_SECRET` unchanged forever — it encrypts MFA secrets and the integration credentials stored in the database.


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
| **Brevo email** | Configured in Settings (API key encrypted). Send quotation/proposal/invoice/payment reminder with PDF attached, sender-verification check, test email, editable templates, delivery & open tracking via a token-protected webhook, invitation emails. |
| **WhatsApp Business app (default)** | Click-to-send: messages open in your WhatsApp Business desktop app, WhatsApp Web or phone with the text and a secure expiring PDF link prefilled — no Meta approval, templates or 24-hour rule. Staff confirm “I sent it”, which is logged. |
| **Promotions** | Personalised promotional messages to customers who opted in, worked through as a one-tap-per-customer queue in WhatsApp Business, with progress and logging. |
| **WhatsApp Cloud API (optional)** | Automated sending for teams with a Meta-verified number: PDF uploaded as media, approved templates loaded from Meta, 24-hour-window tracking from inbound messages, signature-verified webhook with de-duplicated, non-regressing statuses, test messages. |
| **Communications** | Evidence-based statuses: Prepared, Queued, Sent to provider, Delivered, Read, Failed. Message bodies and secrets are not stored. |
| **Document history** | Audit trail of document, payment, communication and settings events. |
| **Company settings** | Multiple company profiles; branding (two configurable logos with light/dark tiles, colours) kept separate from legal/tax/bank details; numbering per series; default terms; rounding; sample-data reset. |
| **Security** | Invite-only accounts (single-use, 72-hour links; admins never set passwords), mandatory TOTP MFA (RFC 6238, replay-protected, 5-attempt lockout, 8 one-time recovery codes) with animated valid/invalid OTP feedback, scrypt password hashes, DB sessions with hashed tokens, “Reset access” that revokes password/MFA/sessions, role-based access (Admin/Staff), rate limiting, AES-256-GCM encryption for stored secrets, server-side checks on every page/action/API. |
| **Settings** | One Settings area: Company · Integrations (public URL, Brevo, WhatsApp) · Message templates · Users & invitations · Security (recovery codes, password change). |

---

## Technology stack

- **Next.js 15.5** (App Router, Server Actions) · **React 19** · **TypeScript**
- **Tailwind CSS 4** with hand-written shadcn-style components (Radix Dialog/Dropdown), **Lucide** icons, **Sonner** toasts
- **React Hook Form** + **Zod** (shared client/server schemas)
- **MySQL 8 / MariaDB** (Hostinger) + **Prisma 6** (DECIMAL money columns, transactions, row locks, unique constraints)
- **decimal.js** for all monetary arithmetic
- **puppeteer-core** (installed Chrome, bundled `@sparticuz/chromium`, or a remote browser) + **pdf-lib** for PDF generation
- **Vitest** (unit + MySQL/MariaDB integration tests) and a **puppeteer-core** end-to-end browser test
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
tests/               unit, integration (MySQL/MariaDB), e2e (browser)
```

---

## Prerequisites

- Node.js **20+** (developed on 22) and npm
- MySQL **8+** or MariaDB **10.6+** (developed on MariaDB 10.11)
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
mysql -u root -e "CREATE DATABASE quote_studio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER 'qs'@'localhost' IDENTIFIED BY 'change-me'; GRANT ALL ON quote_studio.* TO 'qs'@'localhost';"

npm run db:migrate               # prisma migrate deploy (non-destructive)
npm run db:seed                  # company profile, admin user, templates (+ sample data unless SEED_SAMPLE_DATA=false)
```

During development use `npm run db:migrate:dev` to create new migrations.
`npm run db:reset-samples` deletes and recreates **only** the sample records (also available to admins in Company Settings).

## Development

```bash
npm run dev                      # http://localhost:3000 (bound to 0.0.0.0)
```

Accept the invitation link printed by the seed/setup (or create one with `npm run invite -- email "Name" ADMIN`).
Invite team members under **Settings → Users & invitations**. If someone loses their phone and recovery codes, an
administrator uses **Reset access** (or the CLI) to issue a new link.

## Build & run in production mode

```bash
npm run build
npm run start                    # next start -H 0.0.0.0 -p 3000
```

## Testing

```bash
npm run typecheck                # tsc --noEmit
npm run lint                     # eslint
TEST_DATABASE_URL=mysql://…/quote_studio_test npm test   # unit + integration (applies migrations to the test DB)
APP_URL=http://127.0.0.1:3000 npm run test:e2e                     # browser workflow test against a running server
```

The integration tests use a **separate** database and clear its document tables. Never point `TEST_DATABASE_URL` at real data.

## Environment variables

See `.env.example` for the full list. Summary:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL / MariaDB connection (`mysql://user:pass@host:3306/db`) |
| `SESSION_SECRET` | 32+ chars; signs render tokens and encrypts stored secrets — never change it |
| `ENCRYPTION_KEY` | Optional dedicated encryption key (defaults to `SESSION_SECRET`) |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_NAME` | First administrator (created as an invitation) |
| `CHROMIUM_PATH` | Chrome/Chromium/Edge executable for PDFs (common paths auto-detected) |
| `APP_URL` | Base URL used in CLI-printed invitation links |

Email (Brevo), WhatsApp and the public URL are configured **in the app** (Settings → Integrations) and stored
encrypted in the database — no environment variables needed.

### WhatsApp notes

- **WhatsApp Business app mode (default):** nothing to set up. Choose where chats open (desktop app, WhatsApp Web or
  phone) in Settings. Set the *Public app URL* to include a secure, expiring PDF link in messages; otherwise the PDF
  downloads for you to attach. Fully automatic sending from the WhatsApp Business app is intentionally not offered —
  WhatsApp provides no permitted API for it and unofficial automation risks a permanent ban of the number.
- **Promotions:** only customers with WhatsApp opt-in recorded are included; keep an opt-out line in the message.
- **Cloud API mode (optional):** enter the token, phone number ID and business account ID in Settings, load your
  approved templates, then set the webhook in the Meta console to `https://YOUR_DOMAIN/api/webhooks/whatsapp` with the
  generated verify token and your app secret.
- **Brevo tracking:** add the webhook URL shown in Settings to Brevo → Transactional → Settings → Webhooks.

## Sandbox vs production persistence

The sandbox was tested with **MariaDB 10.11 + Prisma** (the same family as Hostinger's MySQL), so there is no persistence difference.
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

## Deployment

**Hostinger Web/Cloud hosting:** follow [DEPLOY-HOSTINGER.md](./DEPLOY-HOSTINGER.md) — Hostinger MySQL database, bundled Chromium for PDFs, `/setup` first-run page. No external services needed.

### Hostinger VPS

Next.js server rendering and Chromium-based PDFs need a **Node.js server**, so use a **Hostinger VPS** (shared
web hosting cannot run this app). Recommended setup on Ubuntu:

1. `apt install -y nodejs npm mariadb-server chromium nginx` (Node 20+ via NodeSource if needed); install fonts
   (`fonts-crosextra-carlito fonts-dejavu`) for consistent PDF glyph fallback.
2. Create the MySQL database and user; set `.env` with production values, `PUBLIC_APP_URL=https://your-domain`,
   `CHROMIUM_PATH=/usr/bin/chromium` and real Brevo/WhatsApp credentials.
3. `npm ci && npm run build && npm run db:migrate && SEED_SAMPLE_DATA=false npm run db:seed`.
4. Run with a process manager: `pm2 start npm --name commercial-suite -- start` and `pm2 save`.
5. Nginx reverse proxy to `127.0.0.1:3000` with HTTPS (Let's Encrypt / Certbot). Session cookies are `Secure`
   in production, so HTTPS is required.
6. Daily `pg_dump` backups; keep `.env` outside version control.
7. In Meta's developer console, configure the webhook URL and subscribe to message status updates.
