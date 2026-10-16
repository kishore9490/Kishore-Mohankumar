import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import puppeteer, { type Browser } from "puppeteer-core";
import { PDFDocument, rgb, StandardFonts, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { signRenderToken } from "../auth/tokens";
import { brandLine, pageFormatFor, renderParts, type RenderableDocument } from "../documents/render-model";
import { DOCUMENT_TYPE_META } from "../documents/meta";

export class PdfRenderError extends Error {}

const CANDIDATE_BROWSERS = [
  process.env.CHROMIUM_PATH,
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean) as string[];

export function findBrowserExecutable(): string | null {
  return CANDIDATE_BROWSERS.find((p) => existsSync(p)) ?? null;
}

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (browserPromise) {
    const b = await browserPromise.catch(() => null);
    if (b && b.connected) return b;
    browserPromise = null;
  }
  // Hosting without Chrome (e.g. shared web hosting): connect to a remote browser service such as Browserless.
  const ws = process.env.BROWSER_WS_ENDPOINT;
  if (ws) {
    browserPromise = puppeteer.connect({ browserWSEndpoint: ws });
    return browserPromise;
  }
  // PDF_ENGINE=bundled forces the bundled Chromium even if a system Chrome exists.
  const executablePath = process.env.PDF_ENGINE === "bundled" ? null : findBrowserExecutable();
  if (executablePath) {
    browserPromise = puppeteer.launch({
      executablePath,
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--font-render-hinting=none"],
    });
    return browserPromise;
  }
  // No Chrome installed (e.g. shared web hosting): use the self-contained Chromium bundled with
  // @sparticuz/chromium (Linux x64). It is unpacked to the temp directory on first use.
  if (process.platform === "linux" && process.arch === "x64") {
    browserPromise = (async () => {
      const { default: chromium } = await import("@sparticuz/chromium");
      chromium.setGraphicsMode = false;
      return puppeteer.launch({ executablePath: await chromium.executablePath(), headless: true, args: [...chromium.args, "--font-render-hinting=none"] });
    })().catch((e) => {
      browserPromise = null;
      throw new PdfRenderError(`PDF engine could not start the bundled Chromium (${(e as Error).message.split("\n")[0]}). Set BROWSER_WS_ENDPOINT to use a remote browser instead.`);
    });
    return browserPromise;
  }
  throw new PdfRenderError("PDF engine unavailable: no Chrome found. Install Chrome / set CHROMIUM_PATH, or set BROWSER_WS_ENDPOINT for a remote browser.");
}

// Limit concurrent renders to keep memory predictable on small servers.
let active = 0;
const waiting: (() => void)[] = [];
async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= 2) await new Promise<void>((r) => waiting.push(r));
  active++;
  try {
    return await fn();
  } finally {
    active--;
    waiting.shift()?.();
  }
}

function appBaseUrl(): string {
  // A remote browser cannot reach 127.0.0.1 — it must load the print view via the public URL.
  const fallback = process.env.BROWSER_WS_ENDPOINT && process.env.PUBLIC_APP_URL ? process.env.PUBLIC_APP_URL : `http://127.0.0.1:${process.env.PORT || 3000}`;
  return (process.env.INTERNAL_APP_URL || fallback).replace(/\/$/, "");
}

function loadFooterFont(): Buffer | null {
  const p = path.join(process.cwd(), "node_modules", "@fontsource", "lato", "files", "lato-latin-700-normal.woff");
  return existsSync(p) ? readFileSync(p) : null;
}

/** Renders a document to a PDF buffer with selectable text, page numbers and consistent footers. */
export async function renderDocumentPdf(doc: RenderableDocument): Promise<Buffer> {
  return withSlot(async () => {
    const browser = await getBrowser();
    const parts = renderParts(doc);
    const page = await browser.newPage();
    const chunks: { bytes: Uint8Array; kind: "full" | "flow" }[] = [];
    try {
      page.setDefaultTimeout(30_000);
      for (let i = 0; i < parts.length; i++) {
        const token = signRenderToken(doc.id);
        const url = `${appBaseUrl()}/print/documents/${encodeURIComponent(doc.id)}?part=${i}&t=${encodeURIComponent(token)}`;
        const res = await page.goto(url, { waitUntil: "networkidle0" });
        if (!res || !res.ok()) throw new PdfRenderError(`Print view failed to load (HTTP ${res?.status() ?? "no response"}).`);
        await page.waitForSelector("#doc-root[data-ready='true']");
        await page.evaluate(async () => {
          await document.fonts.ready;
          const imgs = Array.from(document.images);
          await Promise.all(imgs.map((img) => (img.complete ? null : new Promise((r) => { img.onload = r; img.onerror = r; }))));
        });
        await page.emulateMediaType("print");
        const pdf = await page.pdf({
          printBackground: true,
          preferCSSPageSize: true,
          // Full-bleed parts (cover / closing) are designed as exactly one page.
          pageRanges: parts[i].kind === "full" ? "1" : undefined,
          tagged: true,
        });
        chunks.push({ bytes: pdf, kind: parts[i].kind });
      }
    } catch (e) {
      if (e instanceof PdfRenderError) throw e;
      throw new PdfRenderError(`PDF rendering failed: ${(e as Error).message.split("\n")[0]}`);
    } finally {
      await page.close().catch(() => {});
    }
    return assemble(doc, chunks);
  });
}

async function assemble(doc: RenderableDocument, chunks: { bytes: Uint8Array; kind: "full" | "flow" }[]): Promise<Buffer> {
  const out = await PDFDocument.create();
  out.registerFontkit(fontkit);
  const flags: { kind: "full" | "flow"; firstOfPart: boolean }[] = [];
  for (const c of chunks) {
    const src = await PDFDocument.load(c.bytes);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p, i) => {
      out.addPage(p);
      flags.push({ kind: c.kind, firstOfPart: i === 0 });
    });
  }

  let font: PDFFont;
  const fontBytes = loadFooterFont();
  try {
    font = fontBytes ? await out.embedFont(fontBytes, { subset: true }) : await out.embedFont(StandardFonts.Helvetica);
  } catch {
    font = await out.embedFont(StandardFonts.Helvetica);
  }
  const safe = (text: string) => {
    try {
      font.encodeText(text);
      return text;
    } catch {
      return text.replace(/[^\x20-\x7E×]/g, "");
    }
  };

  const total = out.getPageCount();
  const slide = pageFormatFor(doc) === "slide";
  const color = rgb(0.42, 0.44, 0.56);
  const accent = rgb(0.36, 0.3, 0.9);
  const left = safe(slide ? brandLine(doc.company).toUpperCase() : `${doc.company.legalName || brandLine(doc.company)}`);
  const typeLabel = DOCUMENT_TYPE_META[doc.type].printTitle;
  const ref = doc.number ? `${typeLabel} ${doc.number}` : `${typeLabel} (draft)`;

  out.getPages().forEach((p, i) => {
    if (flags[i].kind === "full") return;
    const { width } = p.getSize();
    const size = slide ? 7.5 : 7;
    const x = slide ? 45 : 40;
    const y = slide ? 20 : 22;
    p.drawText(left, { x, y, size, font, color });
    const right = slide ? safe(`PROPOSAL FOR ${doc.customer.name.toUpperCase()}`) : safe(`${ref}  ·  Page ${i + 1} of ${total}`);
    if (slide) {
      const num = String(i + 1);
      const numW = font.widthOfTextAtSize(num, size);
      p.drawText(num, { x: width - x - numW, y, size, font, color: accent });
      const w = font.widthOfTextAtSize(right, size);
      p.drawText(right, { x: width - x - numW - 14 - w, y, size, font, color });
    } else {
      const w = font.widthOfTextAtSize(right, size);
      p.drawText(right, { x: width - x - w, y, size, font, color });
      if (!flags[i].firstOfPart) {
        const head = safe(`${ref} — continued`);
        const hw = font.widthOfTextAtSize(head, size);
        p.drawText(head, { x: width - x - hw, y: p.getSize().height - 24, size, font, color });
      }
    }
  });

  out.setTitle(`${typeLabel} ${doc.number ?? "(draft)"} — ${doc.customer.name}`);
  out.setAuthor(brandLine(doc.company));
  out.setSubject(doc.title ?? typeLabel);
  out.setCreator("AI Studio Quote Studio");
  out.setProducer("AI Studio Quote Studio (Chromium + pdf-lib)");
  return Buffer.from(await out.save());
}

export function pdfFileName(doc: Pick<RenderableDocument, "number" | "type" | "customer">): string {
  const base = `${doc.number ?? `${DOCUMENT_TYPE_META[doc.type].label}-draft`}-${doc.customer.name}`;
  return `${base.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 120)}.pdf`;
}
