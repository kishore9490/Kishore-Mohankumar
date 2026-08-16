#!/usr/bin/env python3
"""
Render the BID Trust investor deck to PDF.

    pip install playwright && playwright install chromium
    python3 deck/build-pdf.py

Produces two files in deck/pdf/:

    BID-Trust-Investor-Deck.pdf              slides only — the one you send
    BID-Trust-Investor-Deck-Speaker-Notes.pdf  slide, then its notes — the one you present from

──────────────────────────────────────────────────────────────────────────────
USING THE MASTER LOGO

Drop the supplied artwork into deck/assets/ and re-run. Nothing else changes:

    deck/assets/logo-on-dark.png    ← version artworked for dark grounds
    deck/assets/logo-on-light.png   ← version artworked for light grounds  (optional)

Every mark in the deck is tagged `svg.bidmark`. When the master file is present
this script replaces those marks with the raster before printing, so the PDF
carries the real artwork. When it is absent, the vector reconstruction is used
and the script says so.
──────────────────────────────────────────────────────────────────────────────
"""
import base64
import pathlib
import sys

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit("playwright not installed — run: pip install playwright && playwright install chromium")

HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE / "bid-trust-investor-deck.html"
OUT = HERE / "pdf"
ASSETS = HERE / "assets"

# 16:9 at a size that keeps type crisp without bloating the file.
PAGE_W, PAGE_H = 1440, 810

# Chromium ships in this image at a known path; fall back to the bundled one.
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"


def master_logo_data_uri() -> str | None:
    """Base64 the dark-ground master if the user has supplied it."""
    for name in ("logo-on-dark.png", "logo-on-dark.jpg", "logo.png"):
        f = ASSETS / name
        if f.exists():
            mime = "image/jpeg" if f.suffix.lower() in (".jpg", ".jpeg") else "image/png"
            b64 = base64.b64encode(f.read_bytes()).decode()
            print(f"  master logo: {f.name} ({f.stat().st_size / 1024:.0f} kB)")
            return f"data:{mime};base64,{b64}"
    return None


# Injected only for the PDF render: fixed page geometry, one slide per page.
PRINT_CSS = """
  @page { size: %dpx %dpx; margin: 0; }
  html, body { background: #040F26 !important; }
  .topbar, .nav { display: none !important; }
  .deck { max-width: none !important; padding: 0 !important; }
  .slide {
    display: flex !important; flex-direction: column;
    width: %dpx !important; height: %dpx !important;
    aspect-ratio: auto !important; min-height: 0 !important;
    border-radius: 0 !important; border: none !important; box-shadow: none !important;
    margin: 0 !important; padding: 52px 60px !important;
    page-break-after: always; break-after: page; overflow: hidden;
  }
  .slide:last-of-type { page-break-after: auto; break-after: auto; }
""" % (PAGE_W, PAGE_H, PAGE_W, PAGE_H)

NOTES_OFF = ".notes { display: none !important; }"

NOTES_ON = """
  .notes {
    display: flex !important; flex-direction: column; justify-content: center;
    width: %dpx !important; height: %dpx !important;
    margin: 0 !important; padding: 60px 72px !important;
    background: #071A33 !important; border: none !important; border-radius: 0 !important;
    page-break-after: always; break-after: page;
  }
  .notes h4 { font-size: 13px !important; margin-bottom: 10px !important; }
  .notes p { font-size: 17px !important; line-height: 1.65 !important; max-width: none !important; }
  .notes .qa .q { font-size: 16px !important; }
  .notes .qa .a { font-size: 16px !important; line-height: 1.6 !important; }
""" % (PAGE_W, PAGE_H)

# Replace every tagged vector mark with the master raster.
SWAP_JS = """
(uri) => {
  document.querySelectorAll('svg.bidmark').forEach((el) => {
    const h = parseInt(el.dataset.h || '32', 10);
    const img = document.createElement('img');
    img.src = uri;
    img.alt = 'BID Trust';
    // Master artwork is a full lockup (mark + wordmark), so scale by height
    // and let width follow, rather than forcing the square mark ratio.
    img.style.height = (h * 1.25) + 'px';
    img.style.width = 'auto';
    img.style.display = 'inline-block';
    if (el.getAttribute('style')) img.style.cssText += ';' + el.getAttribute('style');
    el.replaceWith(img);
  });
  return document.querySelectorAll('img[alt="BID Trust"]').length;
}
"""


def render(page, path: pathlib.Path, with_notes: bool, logo_uri: str | None):
    page.goto(SRC.as_uri(), wait_until="load")
    page.wait_for_timeout(500)

    if logo_uri:
        n = page.evaluate(SWAP_JS, logo_uri)
        print(f"  swapped {n} mark(s) for master artwork")

    if with_notes:
        # .notes lives inside .slide, which is a fixed-height overflow:hidden box —
        # a child cannot break onto its own page from inside one. Reparent each
        # notes block to be a sibling immediately after its slide so it paginates.
        moved = page.evaluate("""() => {
          let n = 0;
          document.querySelectorAll('.slide').forEach((s) => {
            const notes = s.querySelector(':scope > .notes');
            if (notes) { s.after(notes); n++; }
          });
          return n;
        }""")
        print(f"  reparented {moved} notes block(s) for pagination")

    page.add_style_tag(content=PRINT_CSS + (NOTES_ON if with_notes else NOTES_OFF))
    page.emulate_media(media="print")
    page.wait_for_timeout(400)

    page.pdf(
        path=str(path),
        width=f"{PAGE_W}px",
        height=f"{PAGE_H}px",
        print_background=True,
        margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
        prefer_css_page_size=True,
    )
    kb = path.stat().st_size / 1024
    print(f"✓ {path.name}  ({kb:,.0f} kB)")


def main():
    if not SRC.exists():
        sys.exit(f"deck source not found: {SRC}")
    OUT.mkdir(exist_ok=True)
    ASSETS.mkdir(exist_ok=True)

    logo_uri = master_logo_data_uri()
    if not logo_uri:
        print("  master logo: NOT FOUND — using the vector reconstruction.")
        print(f"               drop logo-on-dark.png into {ASSETS} and re-run to embed the real artwork.")

    exe = CHROME if pathlib.Path(CHROME).exists() else None
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=exe)
        page = browser.new_page(viewport={"width": PAGE_W, "height": PAGE_H})
        render(page, OUT / "BID-Trust-Investor-Deck.pdf", False, logo_uri)
        render(page, OUT / "BID-Trust-Investor-Deck-Speaker-Notes.pdf", True, logo_uri)
        browser.close()


if __name__ == "__main__":
    main()
