# WhatsApp sender (Python)

Sends quotations, invoices and promotional messages from **your own WhatsApp / WhatsApp Business number**, linked
like WhatsApp Web (scan a QR code once). Messages are personalised per customer, PDFs can be
attached, and every attempt is logged so a campaign never sends twice to the same number.

## Which open-source engine?

| Engine | Library | How it works | Notes |
|---|---|---|---|
| `neonize` **(default)** | [neonize](https://github.com/krypton-byte/neonize) (Python, Apache-2.0) on [whatsmeow](https://github.com/tulir/whatsmeow) (Go) | Connects as a linked device directly — no browser | Actively maintained, Windows/macOS/Linux wheels; PDFs with captions; checks each number is on WhatsApp first |
| `browser` | [Playwright](https://playwright.dev/python/) + WhatsApp Web | Clicks through WhatsApp Web in Chromium | Fallback; breaks when WhatsApp changes its web page |

Also evaluated: **pywhatkit** (not updated since 2022, types with the mouse/keyboard via WhatsApp Web — unreliable,
no PDFs), and Node.js options **whatsapp-web.js**, **Baileys**, **WAHA** / **Evolution API** (servers to host; good
if you later want an always-on API, but more to run than a Python script).

> **Read first.** All of these are unofficial clients that WhatsApp does not support. Numbers that send bulk messages to
> people who don't expect them, or get reported, can be restricted or banned. The script therefore only messages
> customers marked **opted in** by default, sends at most 50 per run, and waits 20–45 seconds between messages.
> Keep an opt-out line ("Reply STOP to opt out") in promotions and honour it.

## 1. Install (once)

Windows (PowerShell), macOS or Linux, with Python 3.9+:

```powershell
cd tools\whatsapp-sender
pip install -r requirements.txt
```

That's all for the default engine. (Only for `--engine browser`: `pip install playwright` and
`python -m playwright install chromium`, or add `--chrome` to use your installed Google Chrome.)

## 2. Get your contacts and PDFs from Quote Studio

- **Customers → Export CSV** gives `customers.csv` with `name, contact_person, phone, email, opted_in`.
  Tick *"Customer has opted in to receive WhatsApp messages"* on a customer to set `opted_in = yes`.
- **Download PDF** on a quotation/invoice saves the PDF. To send different PDFs to different customers, add a
  `file` column to the CSV with each PDF's path.

See `contacts.example.csv` for the format. Phone numbers can be written any way (`+91 98765 43210`, `9876543210`);
10-digit numbers get the `--country-code` (default 91).

## 3. Write the message

Put it in a text file (line breaks are kept). Placeholders are filled from the CSV:
`{name}`, `{first_name}`, `{contact_person}`, or any other column such as `{amount}`. See `offer.example.txt`.

## 4. Preview, then send

```powershell
# Preview — nothing is sent
python send_whatsapp.py --csv customers.csv --message-file offer.txt --campaign diwali-offer --dry-run

# Send (asks for confirmation; first run shows a QR code in the terminal — scan it once)
python send_whatsapp.py --csv customers.csv --message-file offer.txt --campaign diwali-offer
```

Send one quotation to one customer:

```powershell
python send_whatsapp.py --to "+91 98765 43210" --name "Anant Motors" --message "Hi {name}, please find our quotation attached." --attach "QUO-2026-0007.pdf"
```

Scan the QR code from your phone: WhatsApp (Business) → ⋮ / Settings → **Linked devices → Link a device**. Make the
PowerShell window big enough to show the whole QR code. The login is saved in `wa-session.db` (browser engine:
`wa-profile` folder), so later runs start immediately. Keep these private — they are a logged-in WhatsApp session.
Delete them (or log out under Linked devices) to disconnect.

## Options

| Option | Meaning |
|---|---|
| `--csv FILE` / `--to NUMBER` | Contacts file, or a single number (`--name` for its name) |
| `--message TEXT` / `--message-file FILE` | The message, with `{placeholders}` |
| `--attach FILE` | PDF/file for everyone (a `file` column overrides it per contact); the message becomes the caption |
| `--campaign NAME` | Name in the log; contacts already sent in this campaign are skipped (default: today's date) |
| `--dry-run` | Show the send list and messages only |
| `--limit N` | Max messages per run (default 50) |
| `--delay-min S` / `--delay-max S` | Seconds to wait between messages (default 20–45) |
| `--include-not-opted-in` | Also message contacts whose `opted_in` is not yes |
| `--country-code CC` | Added to 10-digit numbers (default 91) |
| `--engine neonize\|browser` | Sending engine (default neonize) |
| `--chrome` | Browser engine: use installed Google Chrome |
| `--headless` | Browser engine: hide the browser (log in once without it first) |
| `--yes` | Skip the confirmation prompt |

## Results

Each attempt is appended to `sent-log.csv` (`time, campaign, phone, name, status, detail`):

- **sent** — accepted by WhatsApp's servers (neonize), or shown as sent in the chat (browser).
- **unverified** — browser engine only: WhatsApp Web did not confirm in time; check the chat.
- **failed** — e.g. *number is not on WhatsApp*, or WhatsApp Web changed its layout. Failed contacts are retried
  on the next run of the same campaign.

If neonize stops working after a WhatsApp update, run `pip install -U neonize`. With the browser engine, failures like
"not found (WhatsApp Web changed)" mean the selectors at the top of `send_whatsapp.py` need updating.
