import { afterAll, beforeAll, describe, expect, it } from "vitest";
import http from "node:http";
import type { AddressInfo } from "node:net";

/**
 * Email (Brevo) end-to-end against a local fake Brevo API and the real test database:
 * settings storage (encrypted key), connection/sender check, sending with a PDF attachment and
 * branded HTML, error mapping, and the delivery/open webhook updating the communication log.
 */
const url = process.env.TEST_DATABASE_URL;
const d = url ? describe : describe.skip;

type Captured = { method: string; path: string; apiKey: string | undefined; body: Record<string, unknown> | null };
const requests: Captured[] = [];
const RUN_ID = Date.now().toString(36);
let failNextSend: number | null = null;

const fake = http.createServer((req, res) => {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    requests.push({ method: req.method!, path: req.url!, apiKey: req.headers["api-key"] as string | undefined, body: raw ? JSON.parse(raw) : null });
    const json = (status: number, b: unknown) => { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(b)); };
    if (req.headers["api-key"] !== "xkeysib-test-key") return json(401, { code: "unauthorized", message: "Key not found" });
    if (req.url === "/v3/account") return json(200, { email: "owner@aistudiocraft.in", companyName: "AI Studio Craft" });
    if (req.url === "/v3/senders") return json(200, { senders: [{ email: "quotes@aistudiocraft.in", active: true }] });
    if (req.url === "/v3/smtp/email") {
      if (failNextSend) { const s = failNextSend; failNextSend = null; return json(s, { code: "x", message: "Sender not valid" }); }
      return json(201, { messageId: `<msg-${requests.length}@smtp-relay.brevo.com>` });
    }
    json(404, {});
  });
});

let prisma: typeof import("@/lib/prisma").prisma;
let brevo: typeof import("@/lib/integrations/brevo");
let config: typeof import("@/lib/integrations/config");

d("email via Brevo (fake API)", () => {
  beforeAll(async () => {
    await new Promise<void>((r) => fake.listen(0, "127.0.0.1", r));
    process.env.BREVO_API_BASE = `http://127.0.0.1:${(fake.address() as AddressInfo).port}/v3`;
    process.env.DATABASE_URL = url;
    process.env.SESSION_SECRET = process.env.SESSION_SECRET || "x".repeat(40);
    ({ prisma } = await import("@/lib/prisma"));
    brevo = await import("@/lib/integrations/brevo");
    config = await import("@/lib/integrations/config");
    await prisma.integrationConfiguration.deleteMany({ where: { provider: "brevo" } });
    if (!(await prisma.companyProfile.count())) await prisma.companyProfile.create({ data: { brandName: "Infinitia Hub", coBrandName: "AI Studio Craft" } });
    await prisma.companyProfile.updateMany({ data: { legalName: "AI Studio Craft LLP", gstin: "29ABCDE1234F1Z5", email: "hello@aistudiocraft.in" } });
  });
  afterAll(async () => {
    await prisma.integrationConfiguration.deleteMany({ where: { provider: "brevo" } });
    await prisma.$disconnect();
    fake.close();
  });

  it("reports what is missing before configuration", async () => {
    const s = await config.brevoStatus();
    expect(s.configured).toBe(false);
    await expect(brevo.brevoSendEmail({ to: "a@example.com", subject: "x", text: "y" })).rejects.toThrow(/not configured/);
  });

  it("can be configured with BREVO_* environment variables (Settings values take priority)", async () => {
    process.env.BREVO_API_KEY = "xkeysib-test-key";
    process.env.BREVO_SENDER_EMAIL = "quotes@aistudiocraft.in";
    process.env.BREVO_SENDER_NAME = "Env Sender";
    try {
      const s = await config.brevoStatus();
      expect(s.configured).toBe(true);
      expect(await config.brevoKeyFromEnv()).toBe(true);
      await brevo.brevoSendEmail({ to: "env@example.com", subject: "env", text: "from env" });
      const sent = requests.filter((q) => q.path === "/v3/smtp/email").at(-1)!;
      expect(sent.apiKey).toBe("xkeysib-test-key");
      expect((sent.body as { sender: unknown }).sender).toEqual({ email: "quotes@aistudiocraft.in", name: "Env Sender" });
      await config.saveBrevo({ senderName: "Settings Sender" });
      expect((await config.brevoStatus()).senderName).toBe("Settings Sender");
      const row = await prisma.integrationConfiguration.findUniqueOrThrow({ where: { provider: "brevo" } });
      expect(JSON.stringify(row)).not.toContain("quotes@aistudiocraft.in"); // env values are never copied into the database
    } finally {
      delete process.env.BREVO_API_KEY;
      delete process.env.BREVO_SENDER_EMAIL;
      delete process.env.BREVO_SENDER_NAME;
      await prisma.integrationConfiguration.deleteMany({ where: { provider: "brevo" } });
    }
  });

  it("stores the API key encrypted and checks the connection and sender", async () => {
    await config.saveBrevo({ senderEmail: "quotes@aistudiocraft.in", senderName: "AI Studio Craft", replyTo: "owner@aistudiocraft.in", deliveryMode: "live" }, { apiKey: "xkeysib-test-key" });
    const row = await prisma.integrationConfiguration.findUniqueOrThrow({ where: { provider: "brevo" } });
    expect(JSON.stringify(row)).not.toContain("xkeysib-test-key");
    const s = await config.brevoStatus();
    expect(s.configured).toBe(true);
    expect(s.apiKeyMasked).not.toContain("test-key");
    const t = await brevo.brevoTestConnection();
    expect(t.email).toBe("owner@aistudiocraft.in");
    expect(t.senderVerified).toBe(true);
  });

  it("sends with sender, reply-to, PDF attachment and branded HTML", async () => {
    const pdf = Buffer.from("%PDF-1.4 test");
    const r = await brevo.brevoSendEmail({ to: "client@example.com", toName: "R. Kumar", subject: "Quotation QUO-1", text: "Hello R. Kumar,\n\nPlease find the quotation attached.\nhttps://quote.aistudiocraft.in", tags: ["quotation"], attachments: [{ name: "QUO-1.pdf", contentBase64: pdf.toString("base64") }] });
    expect(r.messageId).toMatch(/^<msg-/);
    const sent = requests.filter((q) => q.path === "/v3/smtp/email").at(-1)!;
    expect(sent.apiKey).toBe("xkeysib-test-key");
    const b = sent.body as { sender: unknown; replyTo: unknown; to: unknown; attachment: unknown; textContent: string; htmlContent: string };
    expect(b.sender).toEqual({ email: "quotes@aistudiocraft.in", name: "AI Studio Craft" });
    expect(b.replyTo).toEqual({ email: "owner@aistudiocraft.in" });
    expect(b.to).toEqual([{ email: "client@example.com", name: "R. Kumar" }]);
    expect(b.attachment).toEqual([{ name: "QUO-1.pdf", content: pdf.toString("base64") }]);
    expect(b.textContent).toContain("Please find the quotation attached.");
    expect(b.htmlContent).toContain("Infinitia Hub &times; AI Studio Craft");
    expect(b.htmlContent).toContain("GSTIN 29ABCDE1234F1Z5");
    expect(b.htmlContent).toContain('<a href="https://quote.aistudiocraft.in"');
  });

  it("escapes HTML in message text and turns provider errors into clear messages", async () => {
    expect(brevo.renderEmailHtml("<script>x</script>", null)).not.toContain("<script>");
    failNextSend = 400;
    await expect(brevo.brevoSendEmail({ to: "c@example.com", subject: "s", text: "t" })).rejects.toThrow(/Brevo rejected the request: Sender not valid/);
    await config.saveBrevo({}, { apiKey: "xkeysib-wrong" });
    await expect(brevo.brevoTestConnection()).rejects.toThrow(/rejected the API key/);
    await config.saveBrevo({}, { apiKey: "xkeysib-test-key" });
  });

  it("webhook moves the log to Delivered then Opened, never backwards, and rejects bad tokens", async () => {
    const { POST } = await import("@/app/api/webhooks/brevo/route");
    await config.saveBrevo({}, { webhookToken: "tok-1234567890abcdefghij" });
    const log = await prisma.communicationLog.create({ data: { channel: "EMAIL", messageType: "TEST", mode: "LIVE", recipient: "client@example.com", status: "SENT_TO_PROVIDER", providerMessageId: `<wh-${RUN_ID}@brevo>` } });
    const call = (token: string, body: unknown) => POST(new Request(`http://localhost/api/webhooks/brevo?token=${token}`, { method: "POST", body: JSON.stringify(body) }));
    expect((await call("wrong-token-wrong-token-", { event: "delivered", "message-id": `<wh-${RUN_ID}@brevo>` })).status).toBe(403);
    await call("tok-1234567890abcdefghij", { event: "delivered", "message-id": `<wh-${RUN_ID}@brevo>` });
    expect((await prisma.communicationLog.findUniqueOrThrow({ where: { id: log.id } })).status).toBe("DELIVERED");
    await call("tok-1234567890abcdefghij", { event: "opened", "message-id": `<wh-${RUN_ID}@brevo>` });
    await call("tok-1234567890abcdefghij", { event: "delivered", "message-id": `<wh-${RUN_ID}@brevo>` }); // duplicate / late
    expect((await prisma.communicationLog.findUniqueOrThrow({ where: { id: log.id } })).status).toBe("READ");
    await prisma.communicationLog.delete({ where: { id: log.id } });
  });
});
