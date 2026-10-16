# WhatsApp sender (Python)

Sends quotations, invoices and promotional messages from **your own WhatsApp / WhatsApp Business number** by
driving WhatsApp Web in a Chromium window on your computer. Messages are personalised per customer, PDFs can be
attached, and every attempt is logged so a campaign never sends twice to the same number.

> **Read first.** WhatsApp does not officially support automating WhatsApp Web. Numbers that send bulk messages to
> people who don't expect them, or get reported, can be restricted or banned. The script therefore only messages
> customers marked **opted in** by default, sends at most 50 per run, and waits 20–45 seconds between messages.
> Keep an opt-out line ("Reply STOP to opt out") in promotions and honour it.

## 1. Install (once)

Windows (PowerShell), macOS or Linux, with Python 3.9+:

```powershell
cd tools\whatsapp-sender
pip install -r requirements.txt
python -m playwright install chromium
```

(If you prefer your installed Google Chrome, skip the last line and add `--chrome` to every command.)

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

# Send (asks for confirmation; first run opens WhatsApp Web — scan the QR code once)
python send_whatsapp.py --csv customers.csv --message-file offer.txt --campaign diwali-offer
```

Send one quotation to one customer:

```powershell
python send_whatsapp.py --to "+91 98765 43210" --name "Anant Motors" --message "Hi {name}, please find our quotation attached." --attach "QUO-2026-0007.pdf"
```

Scan the QR code from your phone: WhatsApp (Business) → ⋮ / Settings → **Linked devices → Link a device**. The login
is saved in the `wa-profile` folder, so later runs start immediately. Keep this folder private — it is a logged-in
WhatsApp session. Delete it (or log out under Linked devices) to disconnect.

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
| `--chrome` | Use installed Google Chrome |
| `--headless` | Hide the browser (log in once without it first) |
| `--yes` | Skip the confirmation prompt |

## Results

Each attempt is appended to `sent-log.csv` (`time, campaign, phone, name, status, detail`):

- **sent** — the message appeared in the chat and left the "clock" state.
- **unverified** — WhatsApp Web did not confirm in time; check the chat.
- **failed** — e.g. *number is not on WhatsApp*, or WhatsApp Web changed its layout. Failed contacts are retried
  on the next run of the same campaign.

If many sends fail with "not found (WhatsApp Web changed)", WhatsApp has updated its web app: update the selectors
at the top of `send_whatsapp.py`, or tell your developer.
