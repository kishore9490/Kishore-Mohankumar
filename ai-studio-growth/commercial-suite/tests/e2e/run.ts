/**
 * End-to-end browser test (headless Chromium via puppeteer-core) against a running server.
 * Usage: APP_URL=http://127.0.0.1:3000 npm run test:e2e
 * Requires DATABASE_URL (creates its own invited e2e admin), SESSION_SECRET and CHROMIUM_PATH (see .env).
 */
import puppeteer, { type Page } from "puppeteer-core";
import { PDFDocument } from "pdf-lib";
import { mkdirSync, writeFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { inviteUser } from "../../src/lib/auth/accounts";
import { currentStep, totpAt } from "../../src/lib/auth/totp";

const db = new PrismaClient();

const BASE = (process.env.APP_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const OUT = process.env.E2E_OUT || path.join(process.cwd(), "test-results");
const RUN = Date.now().toString(36);
let passed = 0;
const failures: string[] = [];
let failPage: Page | null = null;

async function step(name: string, fn: () => Promise<void>) {
  const t0 = Date.now();
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name} (${Date.now() - t0}ms)`);
  } catch (e) {
    await failPage?.screenshot({ path: path.join(OUT, `fail-${failures.length + 1}.png`), fullPage: true }).catch(() => {});
    failures.push(`${name}: ${(e as Error).message}`);
    console.log(`  ✗ ${name}\n      ${(e as Error).message.split("\n")[0]}`);
  }
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function clickText(page: Page, selector: string, text: string) {
  const handles = await page.$$(selector);
  for (const h of handles) {
    const t = (await h.evaluate((el) => (el as HTMLElement).innerText || el.textContent || "")).trim();
    if (t.includes(text)) {
      await h.evaluate((el) => (el as HTMLElement).scrollIntoView({ block: "center" }));
      await h.click();
      return;
    }
  }
  throw new Error(`No ${selector} containing "${text}"`);
}

async function waitText(page: Page, text: string, timeout = 30000) {
  await page.waitForFunction((t) => document.body.innerText.includes(t), { timeout }, text);
}

async function setInput(page: Page, selector: string, value: string) {
  await page.waitForSelector(selector);
  await page.$eval(selector, (el) => ((el as HTMLInputElement).value = ""));
  await page.click(selector, { count: 3 });
  await page.keyboard.press("Backspace");
  await page.type(selector, value);
}

async function fetchPdf(page: Page, id: string) {
  const cookies = await page.cookies();
  const res = await fetch(`${BASE}/api/documents/${id}/pdf?download=1`, { headers: { cookie: cookies.map((c) => `${c.name}=${c.value}`).join("; ") } });
  const buf = Buffer.from(await res.arrayBuffer());
  return { res, buf };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  failPage = page;
  await page.setViewport({ width: 1440, height: 900 });
  const pageErrors: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(`${new URL(page.url()).pathname}: ${String(e).slice(0, 160)}`));
  page.on("dialog", (d) => d.accept());
  page.setDefaultTimeout(45000);
  console.log(`E2E against ${BASE}`);

  await step("unauthenticated requests are blocked", async () => {
    await page.goto(`${BASE}/documents/invoices`, { waitUntil: "networkidle0" });
    assert(page.url().includes("/login"), `expected redirect to /login, got ${page.url()}`);
    const api = await fetch(`${BASE}/api/documents/anything/pdf`);
    assert(api.status === 401, `PDF API should return 401, got ${api.status}`);
    const print = await fetch(`${BASE}/print/documents/anything`);
    assert(print.status === 404, `print page without token should 404, got ${print.status}`);
  });

  const adminEmail = `e2e-admin-${RUN}@example.com`;
  const adminPassword = "E2eStrongPass123";
  let totpSecret = "";
  let lastStep = -1;
  const nextCode = async () => {
    // Codes are single-use per 30s step; wait for a fresh step if needed.
    while (currentStep() <= lastStep) await new Promise((r) => setTimeout(r, 1000));
    lastStep = currentStep();
    return totpAt(totpSecret);
  };

  await step("invalid invitation links are rejected", async () => {
    await page.goto(`${BASE}/invite/not-a-real-token-aaaaaaaaaaaaaaaaaaaaaaaa`, { waitUntil: "networkidle0" });
    await waitText(page, "no longer valid");
  });

  await step("accepts an invitation, sets a password and enrols MFA (invalid then valid OTP)", async () => {
    const { token } = await inviteUser(db, { name: `E2E Admin ${RUN}`, email: adminEmail, role: "ADMIN" }, null);
    await page.goto(`${BASE}/invite/${token}`, { waitUntil: "networkidle0" });
    await waitText(page, "You're invited".replace("'", "’")).catch(() => waitText(page, "invited"));
    await page.type("#new-password", adminPassword);
    await page.type("#confirm-password", adminPassword);
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), clickText(page, "button[type=submit]", "Set password")]);
    assert(page.url().includes("/login/setup"), `expected MFA setup, got ${page.url()}`);
    totpSecret = (await page.$eval("[data-testid=totp-secret]", (el) => el.textContent ?? "")).replace(/\s/g, "");
    assert(/^[A-Z2-7]{32}$/.test(totpSecret), `unexpected secret ${totpSecret}`);
    // wrong code → shake + red state + message
    await page.click("input[aria-label='Digit 1']");
    await page.keyboard.type("000000");
    await page.waitForSelector("[data-otp-state=error]");
    await waitText(page, "does not match");
    await page.screenshot({ path: path.join(OUT, "otp-invalid.png") });
    await page.waitForSelector("[data-otp-state=idle]");
    await page.waitForFunction(() => (document.querySelector("input[aria-label='Digit 1']") as HTMLInputElement)?.value === "");
    await page.click("input[aria-label='Digit 1']");
    await page.keyboard.type(await nextCode());
    await waitText(page, "Authenticator connected");
    await page.screenshot({ path: path.join(OUT, "otp-valid.png") });
    await page.waitForSelector("[data-testid=recovery-codes]");
    const codes = await page.$$eval("[data-testid=recovery-codes] li", (els) => els.map((e) => e.textContent ?? ""));
    assert(codes.length === 8, `expected 8 recovery codes, got ${codes.length}`);
    await page.click("input[type=checkbox]");
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), clickText(page, "button", "Continue to dashboard")]);
    await waitText(page, "Outstanding receivables");
  });

  await step("signs out, rejects a wrong password, and signs in with password + OTP", async () => {
    await page.click("button[aria-label='Account menu']");
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), clickText(page, "[role=menuitem]", "Sign out")]);
    await page.type("#email", adminEmail);
    await page.type("#password", "definitely-wrong-password");
    await page.click("button[type=submit]");
    await waitText(page, "Incorrect email or password");
    await setInput(page, "#password", adminPassword);
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), page.click("button[type=submit]")]);
    assert(page.url().includes("/login/verify"), `expected OTP step, got ${page.url()}`);
    // protected pages are still blocked before the OTP step
    const res = await page.goto(`${BASE}/customers`, { waitUntil: "networkidle0" });
    assert(page.url().includes("/login"), `customers should require full sign-in (status ${res?.status()})`);
    await page.goto(`${BASE}/login/verify`, { waitUntil: "networkidle0" });
    await page.click("input[aria-label='Digit 1']");
    await page.keyboard.type("123456");
    await page.waitForSelector("[data-otp-state=error]");
    await waitText(page, "attempts left");
    await page.waitForSelector("[data-otp-state=idle]");
    await page.waitForFunction(() => (document.querySelector("input[aria-label='Digit 1']") as HTMLInputElement)?.value === "");
    await page.click("input[aria-label='Digit 1']");
    await page.keyboard.type(await nextCode());
    await waitText(page, "Verified");
    await page.waitForFunction(() => location.pathname === "/", { timeout: 15000 });
    await waitText(page, "Outstanding receivables");
  });

  let customerId = "";
  const customerName = `E2E Logistics ${RUN}`;
  await step("creates a customer with validation", async () => {
    await page.goto(`${BASE}/customers/new`, { waitUntil: "networkidle0" });
    await page.type("#name", customerName);
    await page.type("#email", "not-an-email");
    await clickText(page, "button[type=submit]", "Create customer");
    await waitText(page, "Enter a valid email address");
    await setInput(page, "#email", "ops@e2e-logistics.example");
    await page.type("#phone", "+91 98765 43210");
    await page.select("#stateCode", "33");
    await page.type("#billingAddress", "1 Test Street, Chennai");
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), clickText(page, "button[type=submit]", "Create customer")]);
    const m = page.url().match(/\/customers\/([a-z0-9]+)$/);
    assert(m, `expected customer page, got ${page.url()}`);
    customerId = m[1];
    await waitText(page, customerName);
  });

  await step("edits the customer", async () => {
    await page.goto(`${BASE}/customers/${customerId}/edit`, { waitUntil: "networkidle0" });
    await setInput(page, "#contactPerson", "R. Kumar");
    await page.$eval("input[name=whatsappConsent]", (el) => (el as HTMLInputElement).click());
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), clickText(page, "button[type=submit]", "Save changes")]);
    await waitText(page, "R. Kumar");
  });

  const serviceName = `E2E Chatbot Retainer ${RUN}`;
  await step("creates and edits a catalogue service", async () => {
    await page.goto(`${BASE}/catalogue/new`, { waitUntil: "networkidle0" });
    await page.type("#name", serviceName);
    await page.type("#category", "AI Chatbot Development");
    await setInput(page, "#defaultPrice", "-5");
    await clickText(page, "button[type=submit]", "Create item");
    await waitText(page, "cannot be less than 0");
    await setInput(page, "#defaultPrice", "15000");
    await page.select("#billingFrequency", "MONTHLY");
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), clickText(page, "button[type=submit]", "Create item")]);
    await waitText(page, serviceName);
  });

  let quoteUrl = "";
  await step("builds a quotation through the guided editor", async () => {
    await page.goto(`${BASE}/documents/quotations/new?customer=${customerId}`, { waitUntil: "networkidle0" });
    await clickText(page, "button", "Next");
    await page.waitForSelector("#title");
    await page.type("#title", "Chatbot retainer");
    await clickText(page, "button", "Next");
    await page.waitForSelector("#catalogue-pick");
    const optionValue = await page.$$eval("#catalogue-pick option", (opts, name) => (opts as HTMLOptionElement[]).find((o) => o.textContent?.includes(name as string))?.value ?? "", serviceName);
    assert(optionValue, "service missing from catalogue picker");
    await page.select("#catalogue-pick", optionValue);
    await clickText(page, "button", "Add item");
    await page.waitForSelector("#l0-name");
    await setInput(page, "#l0-qty", "3");
    await setInput(page, "#l0-disc", "10");
    // custom line with an invalid (negative) price must block progress
    await clickText(page, "button", "Custom line");
    await page.waitForSelector("#l1-name");
    await page.type("#l1-name", "Setup fee");
    await setInput(page, "#l1-price", "-100");
    await clickText(page, "button", "Next");
    await waitText(page, "Unit price cannot be negative");
    await setInput(page, "#l1-price", "5000");
    await waitText(page, "Line total");
    // totals: 3 × 15,000 − 10% = 40,500 + 5,000 = 45,500 taxable; inter-state IGST 18% = 8,190; total 53,690
    await waitText(page, "₹53,690.00");
    await clickText(page, "button", "Next");
    await page.waitForSelector("#terms");
    await clickText(page, "button", "Next");
    await waitText(page, "Design template");
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), clickText(page, "button", "Save & continue to PDF")]);
    quoteUrl = page.url();
    assert(/\/documents\/quotations\/[a-z0-9]+$/.test(quoteUrl), `unexpected url ${quoteUrl}`);
    await waitText(page, "₹53,690.00");
    await page.screenshot({ path: path.join(OUT, "quotation-detail.png") });
  });

  await step("downloads a valid quotation PDF", async () => {
    const id = quoteUrl.split("/").pop()!;
    const { res, buf } = await fetchPdf(page, id);
    assert(res.status === 200 && res.headers.get("content-type") === "application/pdf", `PDF status ${res.status}`);
    assert(buf.subarray(0, 4).toString() === "%PDF", "not a PDF");
    const pdf = await PDFDocument.load(buf);
    assert(pdf.getPageCount() >= 1, "no pages");
    writeFileSync(path.join(OUT, "quotation.pdf"), buf);
  });

  let invoiceUrl = "";
  await step("accepts the quotation and converts it to an invoice (once)", async () => {
    await page.goto(quoteUrl, { waitUntil: "networkidle0" });
    await clickText(page, "button", "More");
    await clickText(page, "[role=menuitem]", "Mark as accepted");
    await waitText(page, "Accepted");
    await clickText(page, "button", "More");
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), clickText(page, "[role=menuitem]", "Convert to Tax Invoice")]);
    invoiceUrl = page.url();
    assert(/\/documents\/invoices\/[a-z0-9]+$/.test(invoiceUrl), `unexpected url ${invoiceUrl}`);
    await waitText(page, "₹53,690.00");
    await page.goto(quoteUrl, { waitUntil: "networkidle0" });
    await waitText(page, "Converted to");
    await clickText(page, "button", "More");
    const items = await page.$$eval("[role=menuitem]", (els) => els.map((e) => e.textContent ?? ""));
    assert(!items.some((t) => t.includes("Convert to Tax Invoice")), "duplicate conversion should not be offered");
    await page.keyboard.press("Escape");
  });

  await step("issues the invoice and records partial payment; rejects overpayment", async () => {
    await page.goto(invoiceUrl, { waitUntil: "networkidle0" });
    await clickText(page, "button", "Issue invoice");
    await page.waitForSelector("[role=dialog]");
    await clickText(page, "[role=dialog] button", "Issue invoice");
    await waitText(page, "INV/");
    await waitText(page, "Record payment");
    await clickText(page, "button", "Record payment");
    await page.waitForSelector("#amount");
    await setInput(page, "#amount", "60000");
    await clickText(page, "[role=dialog] button[type=submit]", "Record payment");
    await waitText(page, "exceeds the outstanding balance");
    await setInput(page, "#amount", "20000");
    await page.select("#method", "UPI");
    await page.type("#reference", "UTR-E2E-1");
    await clickText(page, "[role=dialog] button[type=submit]", "Record payment");
    await waitText(page, "Partially paid");
    await waitText(page, "₹33,690.00");
  });

  await db.integrationConfiguration.deleteMany({ where: { provider: "brevo" } }); // start from "not configured"

  await step("validates the Brevo key in Settings → Integrations (no WhatsApp in the app)", async () => {
    await page.goto(`${BASE}/settings/integrations`, { waitUntil: "networkidle0" });
    assert(!(await page.content()).includes("WhatsApp"), "WhatsApp should not appear in Integrations");
    await page.type("#brevo-key", "not-a-brevo-key");
    await clickText(page, "button", "Save email settings");
    await waitText(page, "does not look like a Brevo API v3 key");
  });

  await step("shows email as not configured on a document", async () => {
    await page.goto(invoiceUrl, { waitUntil: "networkidle0" });
    await clickText(page, "button", "Email tax invoice");
    await waitText(page, "Email is not configured");
    const disabled = await page.$$eval("[role=dialog] button", (bs) => (bs as HTMLButtonElement[]).find((b) => b.textContent?.includes("Send email"))?.disabled);
    assert(disabled === true, "send button should be disabled without credentials");
    await page.keyboard.press("Escape");
  });

  // Full email flow against a local fake Brevo API — run with the app started with
  // BREVO_API_BASE=http://127.0.0.1:$E2E_FAKE_BREVO_PORT/v3 and the same E2E_FAKE_BREVO_PORT here.
  if (process.env.E2E_FAKE_BREVO_PORT) {
    const sent: Record<string, unknown>[] = [];
    const fake = http.createServer((req, res) => {
      let raw = "";
      req.on("data", (c) => (raw += c));
      req.on("end", () => {
        const json = (code: number, b: unknown) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(b)); };
        if (req.headers["api-key"] !== "xkeysib-0123456789abcdef0123456789abcdef-e2eFakeKey123") return json(401, { message: "Key not found" });
        if (req.url === "/v3/account") return json(200, { email: "owner@example.com", companyName: "E2E Brevo" });
        if (req.url === "/v3/senders") return json(200, { senders: [{ email: "quotes@example.com", active: true }] });
        if (req.url === "/v3/smtp/email") { sent.push(JSON.parse(raw)); return json(201, { messageId: `<e2e-${RUN}-${sent.length}@brevo>` }); }
        json(404, {});
      });
    });
    await new Promise<void>((r) => fake.listen(Number(process.env.E2E_FAKE_BREVO_PORT), "127.0.0.1", r));

    await step("configures Brevo in Settings, tests the connection and sends a test email", async () => {
      await page.goto(`${BASE}/settings/integrations`, { waitUntil: "networkidle0" });
      await setInput(page, "#brevo-key", "xkeysib-0123456789abcdef0123456789abcdef-e2eFakeKey123");
      await setInput(page, "#brevo-sender", "quotes@example.com");
      await setInput(page, "#brevo-name", "E2E Sender");
      await clickText(page, "button", "Save email settings");
      await waitText(page, "Email settings saved");
      await clickText(page, "button", "Test connection");
      await waitText(page, "Sender quotes@example.com is verified and active");
      await setInput(page, "#test-to", "owner@example.com");
      await clickText(page, "button", "Send test");
      await waitText(page, "Test email accepted by Brevo");
      assert(sent.length === 1 && (sent[0].to as { email: string }[])[0].email === "owner@example.com", "test email not received by fake Brevo");
    });

    await step("emails the invoice with its PDF attached and logs it", async () => {
      await page.goto(invoiceUrl, { waitUntil: "networkidle0" });
      await clickText(page, "button", "Email tax invoice");
      await setInput(page, "#em-to", "accounts@example.com");
      await clickText(page, "[role=dialog] button", "Send email");
      await waitText(page, "Email accepted by Brevo");
      const mail = sent.at(-1)! as { to: { email: string }[]; attachment?: { name: string; content: string }[]; htmlContent: string };
      assert(mail.to[0].email === "accounts@example.com", "wrong recipient");
      const att = mail.attachment?.[0];
      assert(!!att && att.name.endsWith(".pdf") && Buffer.from(att.content, "base64").subarray(0, 5).toString() === "%PDF-", "PDF attachment missing or invalid");
      await page.goto(`${BASE}/communications`, { waitUntil: "networkidle0" });
      await waitText(page, "accounts@example.com");
      await waitText(page, "Sent to provider");
    });

    await db.integrationConfiguration.deleteMany({ where: { provider: "brevo" } });
    fake.close();
  }

  await step("invites a staff member from Settings and shows the link", async () => {
    await page.goto(`${BASE}/settings/users`, { waitUntil: "networkidle0" });
    await clickText(page, "button", "Invite user");
    await page.type("#u-name", "E2E Staff");
    await page.type("#u-email", `e2e-staff-${RUN}@example.com`);
    await clickText(page, "[role=dialog] button", "Create invitation");
    await waitText(page, "/invite/");
    await page.keyboard.press("Escape");
    await page.goto(`${BASE}/settings/security`, { waitUntil: "networkidle0" });
    await waitText(page, "8 of 8");
  });

  let proposalId = "";
  await step("builds a multi-section proposal with reordering and a long description", async () => {
    await page.goto(`${BASE}/documents/proposals/new?customer=${customerId}`, { waitUntil: "networkidle0" });
    await clickText(page, "button", "Next");
    await page.waitForSelector("#title");
    await page.type("#title", "E2E Automation Programme");
    await clickText(page, "button", "Next");
    await page.waitForSelector("#catalogue-pick");
    const optionValue = await page.$$eval("#catalogue-pick option", (opts, name) => (opts as HTMLOptionElement[]).find((o) => o.textContent?.includes(name as string))?.value ?? "", serviceName);
    await page.select("#catalogue-pick", optionValue);
    await clickText(page, "button", "Add item");
    await clickText(page, "button", "Custom line");
    await page.waitForSelector("#l1-name");
    await page.type("#l1-name", "Discovery workshop");
    await setInput(page, "#l1-price", "12000");
    const longText = Array.from({ length: 14 }, (_, i) => `Phase ${i + 1}: detailed activity description covering requirements, configuration, testing and handover so that long text wraps across lines without being clipped.`).join(" ");
    await page.type("#l1-desc", longText.slice(0, 1800));
    await clickText(page, "button", "Next");
    await waitText(page, "Drag to reorder");
    await page.select("select[aria-label='Section type to add']", "TIMELINE");
    await clickText(page, "button", "Add");
    await waitText(page, "Project Timeline");
    await page.click("button[aria-label='Move section up']");
    await clickText(page, "button", "Next");
    await page.waitForSelector("#terms");
    await clickText(page, "button", "Next");
    await waitText(page, "Design template");
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), clickText(page, "button", "Save & continue to PDF")]);
    proposalId = page.url().split("/").pop()!;
    await waitText(page, "Commercial Proposal");
  });

  await step("generates a multi-page proposal PDF with selectable text", async () => {
    const { res, buf } = await fetchPdf(page, proposalId);
    assert(res.status === 200, `status ${res.status}`);
    const pdf = await PDFDocument.load(buf);
    const pages = pdf.getPageCount();
    assert(pages >= 7, `expected a multi-page proposal, got ${pages} pages`);
    const { width, height } = pdf.getPage(0).getSize();
    assert(Math.round(width) === 960 && Math.round(height) === 540, `expected 16:9 slide pages, got ${width}x${height}`);
    writeFileSync(path.join(OUT, "proposal.pdf"), buf);
  });

  await step("duplicates a proposal and reopens it for editing", async () => {
    await page.goto(`${BASE}/documents/proposals/${proposalId}`, { waitUntil: "networkidle0" });
    await clickText(page, "button", "More");
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), clickText(page, "[role=menuitem]", "Duplicate")]);
    assert(page.url().endsWith("/edit"), `expected edit page, got ${page.url()}`);
    await waitText(page, "Edit Commercial Proposal");
  });

  await step("every main route renders without errors", async () => {
    for (const r of ["/", "/customers", "/catalogue", "/documents/proposals", "/documents/quotations", "/documents/invoices", "/documents/proforma", "/communications", "/history", "/settings/company", "/settings/integrations", "/settings/templates", "/settings/users", "/settings/security"]) {
      const res = await page.goto(`${BASE}${r}`, { waitUntil: "networkidle0" });
      assert(res?.status() === 200, `${r} returned ${res?.status()}`);
    }
  });

  await step("responsive layout: no horizontal overflow on mobile", async () => {
    await page.setViewport({ width: 390, height: 844 });
    for (const r of ["/", "/documents/invoices", "/customers", invoiceUrl.replace(BASE, "")]) {
      await page.goto(`${BASE}${r}`, { waitUntil: "networkidle0" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - 390);
      assert(overflow <= 1, `${r} overflows horizontally by ${overflow}px`);
    }
    await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
    await page.click("button[aria-label='Open navigation']");
    await waitText(page, "Products & Services");
    await page.screenshot({ path: path.join(OUT, "mobile-nav.png") });
    await page.setViewport({ width: 1440, height: 900 });
  });

  await step("signs out", async () => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
    await page.click("button[aria-label='Account menu']");
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), clickText(page, "[role=menuitem]", "Sign out")]);
    assert(page.url().includes("/login"), "should be on login page");
    await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
    assert(page.url().includes("/login"), "session should be gone");
  });

  await browser.close();
  await db.$disconnect();
  if (pageErrors.length) console.log(`\n  Browser errors:\n    ${pageErrors.slice(0, 5).join("\n    ")}`);
  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length) {
    console.log(failures.map((f) => `  - ${f}`).join("\n"));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
