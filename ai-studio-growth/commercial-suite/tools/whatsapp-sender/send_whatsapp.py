#!/usr/bin/env python3
"""
WhatsApp sender for AI Studio Quote Studio.

Sends a personalised message (and optionally a PDF such as a quotation) to a list of
contacts from YOUR OWN WhatsApp / WhatsApp Business account, by driving WhatsApp Web
in a real Chromium window. You scan the QR code once; the login is kept in a local
profile folder.

Important: this automates WhatsApp Web, which WhatsApp does not officially support.
Message only customers who expect to hear from you (the default sends to opted-in
contacts only), keep volumes modest, and expect that WhatsApp may restrict numbers
that are reported or that send bulk messages to strangers.

Examples
  python send_whatsapp.py --csv customers.csv --message-file offer.txt --dry-run
  python send_whatsapp.py --csv customers.csv --message-file offer.txt --campaign diwali-offer
  python send_whatsapp.py --to "+91 98765 43210" --name "Anant Motors" \
      --message "Hi {name}, please find our quotation attached." --attach QUO-2026-0007.pdf
"""
from __future__ import annotations

import argparse
import csv
import random
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from urllib.parse import quote

HERE = Path(__file__).resolve().parent
DEFAULT_PROFILE = HERE / "wa-profile"
DEFAULT_LOG = HERE / "sent-log.csv"
WA_URL = "https://web.whatsapp.com"

# WhatsApp Web changes its markup from time to time; each element has several candidates.
SEL_LOGGED_IN = ["#pane-side", "div[aria-label='Chat list']", "[data-icon='new-chat-outline']"]
SEL_QR = ["canvas[aria-label*='Scan']", "div[data-ref] canvas", "canvas"]
SEL_COMPOSE = ["footer div[contenteditable='true'][role='textbox']", "footer div[contenteditable='true']"]
SEL_ATTACH = ["button[title='Attach']", "div[title='Attach']", "[aria-label='Attach']", "span[data-icon='plus-rounded']", "span[data-icon='plus']", "span[data-icon='attach-menu-plus']", "span[data-icon='clip']"]
SEL_SEND = ["div[role='button'][aria-label='Send']", "button[aria-label='Send']", "span[data-icon='wds-ic-send-filled']", "span[data-icon='send']"]
SEL_OUTGOING = "div.message-out"
SEL_PENDING = "div.message-out span[data-icon='msg-time']"
INVALID_TEXT = re.compile(r"phone number shared via url is invalid|isn.t on whatsapp|not on whatsapp", re.I)


class SafeDict(dict):
    def __missing__(self, key):  # leave unknown {placeholders} untouched
        return "{" + key + "}"


def normalize_phone(raw: str, country_code: str) -> str | None:
    digits = re.sub(r"\D", "", raw or "")
    if raw.strip().startswith("00"):
        digits = digits[2:]
    digits = digits.lstrip("0") if len(digits) == 11 and digits.startswith("0") else digits
    if len(digits) == 10:
        digits = country_code + digits
    return digits if 11 <= len(digits) <= 15 else None


def truthy(v: str | None) -> bool:
    return (v or "").strip().lower() in {"yes", "y", "true", "1", "opted in", "opted-in"}


def render(template: str, row: dict) -> str:
    values = SafeDict({k.strip(): (v or "").strip() for k, v in row.items() if k})
    first = (values.get("contact_person") or values.get("name") or "").split(" ")[0]
    values.setdefault("first_name", first)
    return template.format_map(values)


def load_contacts(args) -> list[dict]:
    if args.to:
        return [{"phone": args.to, "name": args.name or "", "opted_in": "yes"}]
    with open(args.csv, newline="", encoding="utf-8-sig") as f:
        rows = [{(k or "").strip().lower(): v for k, v in r.items()} for r in csv.DictReader(f)]
    if rows and "phone" not in rows[0]:
        sys.exit(f"{args.csv} needs a 'phone' column (found: {', '.join(rows[0].keys())}).")
    return rows


def read_log(path: Path) -> set[tuple[str, str]]:
    if not path.exists():
        return set()
    with open(path, newline="", encoding="utf-8") as f:
        return {(r["campaign"], r["phone"]) for r in csv.DictReader(f) if r.get("status") == "sent"}


def write_log(path: Path, campaign: str, phone: str, name: str, status: str, detail: str = "") -> None:
    new = not path.exists()
    with open(path, "a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        if new:
            w.writerow(["time", "campaign", "phone", "name", "status", "detail"])
        w.writerow([datetime.now().isoformat(timespec="seconds"), campaign, phone, name, status, detail])


def plan(args) -> list[dict]:
    """Builds the send list: who gets what, and why anyone is skipped."""
    template = Path(args.message_file).read_text(encoding="utf-8") if args.message_file else args.message
    if not template or not template.strip():
        sys.exit("Provide --message or --message-file.")
    already = read_log(Path(args.log))
    has_consent_col = False
    items, seen = [], set()
    for row in load_contacts(args):
        has_consent_col = has_consent_col or "opted_in" in row
        name = (row.get("name") or row.get("contact_person") or "").strip()
        phone = normalize_phone(row.get("phone") or "", args.country_code)
        attach = (row.get("file") or row.get("attachment") or args.attach or "").strip()
        item = {"name": name, "phone": phone or (row.get("phone") or "").strip(), "message": render(template, row).strip(), "attach": attach, "skip": ""}
        if not phone:
            item["skip"] = "invalid phone number"
        elif phone in seen:
            item["skip"] = "duplicate in list"
        elif not args.include_not_opted_in and "opted_in" in row and not truthy(row.get("opted_in")):
            item["skip"] = "not opted in"
        elif (args.campaign, phone) in already:
            item["skip"] = "already sent in this campaign"
        elif attach and not Path(attach).is_file():
            item["skip"] = f"attachment not found: {attach}"
        if phone:
            seen.add(phone)
        items.append(item)
    if args.csv and not has_consent_col and not args.include_not_opted_in:
        print("Note: the CSV has no 'opted_in' column, so every valid number is included. Only message people who expect it.")
    return items


def first_visible(page, selectors, timeout_ms: int):
    """Returns the first selector that becomes visible within the timeout, or None."""
    deadline = time.time() + timeout_ms / 1000
    while time.time() < deadline:
        for s in selectors:
            loc = page.locator(s).first
            try:
                if loc.count() and loc.is_visible():
                    return loc
            except Exception:
                pass
        time.sleep(0.4)
    return None


def wait_for_login(page) -> None:
    page.goto(args.wa_url, wait_until="domcontentloaded")
    print("Opening WhatsApp Web… (first time: scan the QR code with WhatsApp → Linked devices → Link a device)")
    if first_visible(page, SEL_LOGGED_IN, 15_000):
        return
    print("Waiting for you to scan the QR code (up to 3 minutes)…")
    if not first_visible(page, SEL_LOGGED_IN, 180_000):
        sys.exit("Not logged in to WhatsApp Web. Run again and scan the QR code.")


def type_multiline(page, text: str) -> None:
    lines = text.split("\n")
    for i, line in enumerate(lines):
        if line:
            page.keyboard.insert_text(line)
        if i < len(lines) - 1:
            page.keyboard.down("Shift")
            page.keyboard.press("Enter")
            page.keyboard.up("Shift")


def open_chat(page, phone: str, text: str | None) -> tuple[bool, str]:
    url = f"{args.wa_url}/send?phone={phone}" + (f"&text={quote(text)}" if text else "")
    page.goto(url, wait_until="domcontentloaded")
    deadline = time.time() + 45
    while time.time() < deadline:
        if first_visible(page, SEL_COMPOSE, 500):
            return True, ""
        try:
            body = page.locator("body").inner_text(timeout=1000)
            if INVALID_TEXT.search(body):
                return False, "number is not on WhatsApp"
        except Exception:
            pass
    return False, "chat did not open (slow connection or WhatsApp Web changed)"


def confirm_sent(page, before: int) -> tuple[str, str]:
    deadline = time.time() + 30
    while time.time() < deadline and page.locator(SEL_OUTGOING).count() <= before:
        time.sleep(0.5)
    if page.locator(SEL_OUTGOING).count() <= before:
        return "unverified", "could not see the message in the chat — check WhatsApp"
    deadline = time.time() + 90
    while time.time() < deadline and page.locator(SEL_PENDING).count():
        time.sleep(1)
    return ("sent", "") if not page.locator(SEL_PENDING).count() else ("unverified", "still pending (clock icon)")


def send_one(page, item: dict) -> tuple[str, str]:
    if not item["attach"]:
        ok, why = open_chat(page, item["phone"], item["message"])
        if not ok:
            return "failed", why
        before = page.locator(SEL_OUTGOING).count()
        compose = first_visible(page, SEL_COMPOSE, 5000)
        compose.click()
        time.sleep(0.5)
        page.keyboard.press("Enter")
        return confirm_sent(page, before)

    ok, why = open_chat(page, item["phone"], None)
    if not ok:
        return "failed", why
    before = page.locator(SEL_OUTGOING).count()
    attach_btn = first_visible(page, SEL_ATTACH, 8000)
    if not attach_btn:
        return "failed", "attach button not found (WhatsApp Web changed)"
    attach_btn.click()
    time.sleep(1)
    inputs = page.locator("input[type='file']")
    target = None
    for i in range(inputs.count()):
        accept = (inputs.nth(i).get_attribute("accept") or "").lower()
        if not accept.startswith("image") and "image/" not in accept:  # the "Document" input accepts any file
            target = inputs.nth(i)
            break
    if target is None:
        return "failed", "document upload input not found (WhatsApp Web changed)"
    target.set_input_files(str(Path(item["attach"]).resolve()))
    send_btn = first_visible(page, SEL_SEND, 30_000)
    if not send_btn:
        return "failed", "file preview did not open"
    if item["message"]:
        time.sleep(1)
        type_multiline(page, item["message"])  # focus is in the caption box of the preview
        time.sleep(0.5)
    first_visible(page, SEL_SEND, 5000).click()
    return confirm_sent(page, before)


def main() -> None:
    items = plan(args)
    todo = [i for i in items if not i["skip"]][: args.limit]
    skipped = [i for i in items if i["skip"]]
    print(f"\nCampaign '{args.campaign}': {len(todo)} to send, {len(skipped)} skipped, limit {args.limit}.")
    for i in skipped:
        print(f"  skip  {i['phone'] or '-':>15}  {i['name'][:30]:30}  {i['skip']}")

    if args.dry_run or not todo:
        for i in todo:
            print(f"\n→ {i['phone']}  {i['name']}" + (f"  [+ {Path(i['attach']).name}]" if i["attach"] else ""))
            print("  " + i["message"].replace("\n", "\n  "))
        print("\nDry run — nothing was sent." if args.dry_run else "\nNothing to send.")
        return

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("Playwright is not installed. Run:  pip install -r requirements.txt  and  python -m playwright install chromium")

    if not args.yes:
        answer = input(f"\nSend {len(todo)} WhatsApp message(s) now? Type 'yes' to continue: ")
        if answer.strip().lower() != "yes":
            sys.exit("Cancelled.")

    log = Path(args.log)
    counts = {"sent": 0, "unverified": 0, "failed": 0}
    with sync_playwright() as p:
        launch = {"headless": args.headless, "viewport": {"width": 1280, "height": 860}}
        if args.browser_path:
            launch["executable_path"] = args.browser_path
        elif args.chrome:
            launch["channel"] = "chrome"
        ctx = p.chromium.launch_persistent_context(str(Path(args.profile).resolve()), **launch)
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        wait_for_login(page)
        for n, item in enumerate(todo, 1):
            print(f"[{n}/{len(todo)}] {item['phone']} {item['name']} … ", end="", flush=True)
            try:
                status, detail = send_one(page, item)
            except Exception as e:  # keep going; record the error
                status, detail = "failed", f"{type(e).__name__}: {str(e).splitlines()[0][:150]}"
            counts[status] += 1
            write_log(log, args.campaign, item["phone"], item["name"], status, detail)
            print(status + (f" — {detail}" if detail else ""))
            if n < len(todo):
                wait = random.uniform(args.delay_min, args.delay_max)
                print(f"    waiting {wait:.0f}s before the next message")
                time.sleep(wait)
        time.sleep(3)
        ctx.close()
    print(f"\nDone: {counts['sent']} sent, {counts['unverified']} unverified, {counts['failed']} failed. Log: {log}")


def parse_args(argv=None):
    ap = argparse.ArgumentParser(description="Send WhatsApp messages / PDFs to your customers via WhatsApp Web.")
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--csv", help="Contacts CSV with a 'phone' column (e.g. Customers → Export CSV from the app). Optional columns: name, contact_person, opted_in, file, and any others for {placeholders}.")
    src.add_argument("--to", help="A single phone number")
    ap.add_argument("--name", help="Name for --to (used in {name})")
    msg = ap.add_mutually_exclusive_group()
    msg.add_argument("--message", help="Message text. Placeholders: {name}, {first_name}, {contact_person} or any CSV column.")
    msg.add_argument("--message-file", help="Text file with the message (keeps line breaks)")
    ap.add_argument("--attach", help="File (e.g. PDF) to send to everyone; a 'file' column in the CSV overrides it per contact")
    ap.add_argument("--campaign", default=datetime.now().strftime("send-%Y-%m-%d"), help="Name used in the log to avoid sending twice (default: send-YYYY-MM-DD)")
    ap.add_argument("--country-code", default="91", help="Added to 10-digit numbers (default 91)")
    ap.add_argument("--limit", type=int, default=50, help="Maximum messages this run (default 50)")
    ap.add_argument("--delay-min", type=float, default=20, help="Minimum seconds between messages (default 20)")
    ap.add_argument("--delay-max", type=float, default=45, help="Maximum seconds between messages (default 45)")
    ap.add_argument("--include-not-opted-in", action="store_true", help="Also message contacts whose opted_in is not yes")
    ap.add_argument("--dry-run", action="store_true", help="Show what would be sent without opening WhatsApp")
    ap.add_argument("--yes", action="store_true", help="Do not ask for confirmation")
    ap.add_argument("--headless", action="store_true", help="Run the browser hidden (log in once without it first)")
    ap.add_argument("--chrome", action="store_true", help="Use your installed Google Chrome instead of Playwright's Chromium")
    ap.add_argument("--profile", default=str(DEFAULT_PROFILE), help="Folder that keeps the WhatsApp Web login")
    ap.add_argument("--log", default=str(DEFAULT_LOG), help="CSV log of every attempt")
    ap.add_argument("--browser-path", help=argparse.SUPPRESS)
    ap.add_argument("--wa-url", default=WA_URL, help=argparse.SUPPRESS)  # for testing against a local page
    a = ap.parse_args(argv)
    if a.delay_max < a.delay_min:
        ap.error("--delay-max must be >= --delay-min")
    return a


if __name__ == "__main__":
    args = parse_args()
    main()
