# Deploy AI Studio Quote Studio to Hostinger (Web / Cloud hosting)

Target: **https://quote.aistudiocraft.in** — everything runs on Hostinger:

- **Database:** a Hostinger MySQL database (hPanel → Databases → Management)
- **PDFs:** a self-contained Chromium bundled with the app (no Chrome installation needed)
- **App:** a Hostinger Node.js web app

> Requires a plan with **Node.js web apps** (hPanel → Websites → Add website → *Node.js*; available on Business and
> Cloud plans). hPanel labels change from time to time — the steps describe what to look for.

---

## 1. Create the MySQL database (hPanel → Databases → Management)

1. **MySQL database name:** `quote` → becomes `u643405007_quote`
2. **MySQL username:** `quote` → becomes `u643405007_quote`
3. **Password:** a strong password using **letters and numbers only** (symbols like `@ : / # ?` break the connection URL).
4. Click **Create**. Note the **MySQL host** shown in the database list (usually `localhost`).

Your connection string (step 4):

```
mysql://u643405007_quote:YOUR_PASSWORD@localhost:3306/u643405007_quote
```

(Replace `localhost` if hPanel shows a different MySQL host.)

## 2. Subdomain + Node.js app

1. **Domains → Subdomains:** create `quote` under `aistudiocraft.in`.
2. **Websites → Add website → Node.js app**, choose **quote.aistudiocraft.in**.
3. Source code: upload **`quote-studio-app.zip`** (or connect GitHub: repo `kishore9490/Kishore-Mohankumar`, branch
   `ccr-c1686265-rhp1vi`, app directory `ai-studio-growth/commercial-suite`).
4. Build settings:
   - Node.js version: **22** (or 20)
   - Install command: `npm install`
   - Build command: **`npm run build:hosting`** — creates the database tables automatically, then builds
   - Start command: **`npm start`**

## 3. Environment variables (Node.js app → Environment variables)

| Name | Value |
|---|---|
| `DATABASE_URL` | The MySQL connection string from step 1 |
| `SESSION_SECRET` | 64 random characters — **never change it later** (encrypts MFA secrets and saved API keys). Generate with the command below. |
| `PUBLIC_APP_URL` | `https://quote.aistudiocraft.in` |
| `SETUP_TOKEN` | Any secret phrase of 16+ characters, used once on the setup page |

Generate `SESSION_SECRET` in PowerShell:

```powershell
$b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); -join ($b | ForEach-Object { $_.ToString('x2') })
```

Save → **Deploy / Rebuild**. Enable SSL for the subdomain (hPanel → Security → SSL) — sign-in requires https.

## 4. First-time setup

1. Open **https://quote.aistudiocraft.in/setup**
2. Enter the `SETUP_TOKEN`, your name and email (tick *Add sample data* if you want the Anant Motors examples) →
   **Create administrator**.
3. Set your password, scan the QR code with Google/Microsoft Authenticator, enter the 6-digit code, save the recovery
   codes → dashboard. The setup page then locks itself permanently.
4. Open any document → **Download PDF** to confirm PDFs work (the first PDF takes ~10 seconds while Chromium unpacks).

## 5. Configure in the app (Settings)

- **Company:** legal name, address, GSTIN, state, bank details, logos.
- **Integrations → Email (Brevo):** API key (`xkeysib-…`), verified sender → Save → Test connection → Send test.
  Add the shown webhook URL in Brevo → Transactional → Settings → Webhooks for delivery/open tracking.
- **Integrations → WhatsApp:** keep **WhatsApp Business app** mode, choose where chats open, enter your business number.
- **Users & invitations:** invite your team.

## Updating later

Upload the new zip (or push to the branch) → **Deploy / Rebuild**. New database changes are applied automatically
during the build; your data is kept.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails at `prisma migrate deploy` | Check `DATABASE_URL`: user/database names include the `u643405007_` prefix, host matches hPanel, password has no symbols. |
| PDF download shows “could not start the bundled Chromium” | The host blocks running bundled browsers. Add a free **Browserless** account and set `BROWSER_WS_ENDPOINT=wss://production-sfo.browserless.io?token=YOUR_TOKEN`, then redeploy. |
| Sign-in loops back to the login page | Serve the site over **https** (enable SSL for the subdomain). |
| “Setup is not available” | An administrator already exists, or `SETUP_TOKEN` is missing / shorter than 16 characters. |
| Locked out (lost phone and recovery codes) | Another admin uses *Reset access* in Settings → Users. |
