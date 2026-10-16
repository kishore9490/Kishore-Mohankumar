# Deploy AI Studio Quote Studio to Hostinger (Web / Cloud hosting)

Target: **https://quote.aistudiocraft.in**

Hostinger web hosting runs the Node.js app. Two things it cannot provide are supplied by free external services:

| Need | Service | Why |
|---|---|---|
| PostgreSQL database | **Neon** (free tier) — neon.tech | Hostinger web hosting offers MySQL only |
| Chrome for PDF generation | **Browserless** (free tier) — browserless.io | Shared hosting cannot run Chrome |

> Requires a Hostinger plan with **Node.js web apps** (Business or Cloud plans; hPanel → Websites → Add website → Node.js).
> If your plan has no Node.js option, use a Hostinger VPS instead (see the README).
> hPanel labels change from time to time — the steps below describe what to look for.

---

## 1. Database — Neon (5 minutes)

1. Sign up at **neon.tech** → **Create project** → name `quote-studio`, Postgres 16, region **AWS Asia Pacific (Singapore)**.
2. Open **Connection details**, untick *Pooled connection* (direct connection), and copy the connection string. It looks like:
   `postgresql://neondb_owner:XXXX@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
3. Keep it for step 4 (`DATABASE_URL`).

## 2. PDF engine — Browserless (3 minutes)

1. Sign up at **browserless.io** (free plan) and copy your **API token** from the dashboard.
2. Your endpoint is (use the region shown in your dashboard if different):
   `wss://production-sfo.browserless.io?token=YOUR_TOKEN`
3. Keep it for step 4 (`BROWSER_WS_ENDPOINT`).

## 3. Subdomain + Node.js app in hPanel

1. **Domains → Subdomains**: create `quote` under `aistudiocraft.in`.
2. **Websites → Add website → Node.js app** (or *Node.js Web App*), and choose the domain **quote.aistudiocraft.in**.
3. Source code — either:
   - **Upload** the provided `quote-studio-app.zip` (the app folder only), or
   - **GitHub**: repository `kishore9490/Kishore-Mohankumar`, branch `ccr-c1686265-rhp1vi`, root/app directory
     `ai-studio-growth/commercial-suite` (if hPanel cannot set a sub-directory, use the zip).
4. Build settings:
   - Node.js version: **22** (or 20)
   - Install command: `npm install`
   - Build command: **`npm run build:hosting`** (generates Prisma client, applies database migrations, builds)
   - Start command: **`npm start`** (listens on the port Hostinger provides)

## 4. Environment variables (hPanel → your Node.js app → Environment variables)

| Name | Value |
|---|---|
| `DATABASE_URL` | Neon connection string from step 1 |
| `SESSION_SECRET` | A long random string — **never change it later** (it encrypts MFA secrets and saved API keys). Generate one in PowerShell (see the command below the table) |
| `PUBLIC_APP_URL` | `https://quote.aistudiocraft.in` |
| `BROWSER_WS_ENDPOINT` | Browserless endpoint from step 2 |
| `SETUP_TOKEN` | Any secret of 16+ characters, used once on the setup page (e.g. `QuoteStudio-Setup-2026-xyz`) |

Generate a strong `SESSION_SECRET` in PowerShell (64 hex characters, cryptographically random):

```powershell
$b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); -join ($b | ForEach-Object { $_.ToString('x2') })
```

Save, then **Deploy / Rebuild**. The first build takes a few minutes. Make sure SSL is enabled for the subdomain
(hPanel → Security → SSL; Hostinger issues free certificates).

## 5. First-time setup (2 minutes)

1. Open **https://quote.aistudiocraft.in/setup**
2. Enter the `SETUP_TOKEN`, your name and email, keep *Add sample data* ticked → **Create administrator**.
3. Set your password, scan the QR code with Google/Microsoft Authenticator, enter the 6-digit code, save the
   recovery codes → you are on the dashboard.
4. The setup page locks itself permanently once an administrator exists. You can remove `SETUP_TOKEN` afterwards.

## 6. Configure in the app (Settings)

- **Settings → Company**: legal name, address, GSTIN, state, bank details, logos.
- **Settings → Integrations → General**: public URL `https://quote.aistudiocraft.in` (enables secure PDF links in WhatsApp).
- **Settings → Integrations → Email (Brevo)**: API key (`xkeysib-…`), verified sender email/name → *Save* → *Test connection* →
  *Send test*. Copy the webhook URL into Brevo → Transactional → Settings → Webhooks (tick Delivered, Opened, bounces, Blocked, Spam).
- **Settings → Integrations → WhatsApp**: keep **WhatsApp Business app** mode, choose where chats open
  (desktop app / WhatsApp Web / phone), enter your business number → *Save*.
- **Settings → Users & invitations**: invite your team; each person sets a password and MFA through their link.

## Updating later

Upload the new zip (or push to the branch) and click **Deploy / Rebuild** in hPanel. Migrations run automatically
during `npm run build:hosting`; your data is kept.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails at `prisma migrate deploy` | Check `DATABASE_URL` (direct, not pooled; ends with `?sslmode=require`). |
| PDF download shows an error | Check `BROWSER_WS_ENDPOINT` and that `PUBLIC_APP_URL` is the public https address (the remote browser loads the print view from it). |
| Sign-in loops back to the login page | The site must be served over **https** (session cookies are secure in production). Enable SSL for the subdomain. |
| “Setup is not available” | An administrator already exists, or `SETUP_TOKEN` is missing/shorter than 16 characters. |
| Locked out (lost phone + recovery codes) | Another admin uses *Reset access*. If you are the only admin, run `npm run invite -- you@email "Name" ADMIN` against the same `DATABASE_URL` from your PC. |
