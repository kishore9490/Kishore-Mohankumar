import { describe, expect, it } from "vitest";
import { formatDocumentNumber } from "@/lib/documents/numbering";
import { financialYearLabel } from "@/lib/dates";
import { effectiveStatus } from "@/lib/documents/meta";
import { parseRichText } from "@/lib/proposal/sections";
import { renderParts, buildLinesAndTotals } from "@/lib/documents/render-model";
import { renderTemplate } from "@/lib/integrations/messages";
import { signRenderToken, verifyRenderToken } from "@/lib/auth/tokens";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { customerSchema } from "@/lib/validation/schemas";

process.env.SESSION_SECRET = process.env.SESSION_SECRET || "x".repeat(40);

describe("numbering", () => {
  it("formats with financial year and padding", () => {
    expect(formatDocumentNumber({ prefix: "INV", padding: 4, includeFinancialYear: true }, 7, "2026-10-15")).toBe("INV/2026-27/0007");
    expect(formatDocumentNumber({ prefix: "QT", padding: 3, includeFinancialYear: false }, 12, "2026-10-15")).toBe("QT/012");
    expect(financialYearLabel("2027-03-31")).toBe("2026-27");
    expect(financialYearLabel("2027-04-01")).toBe("2027-28");
  });
});

describe("effective status", () => {
  it("derives overdue and expired from dates", () => {
    expect(effectiveStatus({ type: "INVOICE", status: "ISSUED", dueDate: "2026-01-01", grandTotal: "100", amountPaid: "0" }, "2026-02-01")).toBe("OVERDUE");
    expect(effectiveStatus({ type: "INVOICE", status: "PARTIALLY_PAID", dueDate: "2026-03-01", grandTotal: "100", amountPaid: "50" }, "2026-02-01")).toBe("PARTIALLY_PAID");
    expect(effectiveStatus({ type: "INVOICE", status: "PAID", dueDate: "2026-01-01", grandTotal: "100", amountPaid: "100" }, "2026-02-01")).toBe("PAID");
    expect(effectiveStatus({ type: "QUOTATION", status: "SENT", validUntil: "2026-01-01" }, "2026-02-01")).toBe("EXPIRED");
    expect(effectiveStatus({ type: "QUOTATION", status: "ACCEPTED", validUntil: "2026-01-01" }, "2026-02-01")).toBe("ACCEPTED");
  });
});

describe("proposal rendering helpers", () => {
  it("parses paragraphs and bullet lists", () => {
    expect(parseRichText("Intro line\n\n- one\n- two\nAfter")).toEqual([{ kind: "p", text: "Intro line" }, { kind: "ul", items: ["one", "two"] }, { kind: "p", text: "After" }]);
  });
  it("splits proposals into full-bleed and flowing parts", () => {
    const s = (type: string, enabled = true) => ({ type, title: type, enabled, content: {} }) as never;
    const parts = renderParts({ type: "PROPOSAL", template: "PREMIUM_COMMERCIAL", sections: [s("COVER"), s("EXECUTIVE_SUMMARY"), s("PRICING_SUMMARY"), s("ASSUMPTIONS", false), s("CLOSING_PAGE")] });
    expect(parts).toEqual([{ kind: "full", sectionIndexes: [0] }, { kind: "flow", sectionIndexes: [1, 2] }, { kind: "full", sectionIndexes: [3] }]);
    expect(renderParts({ type: "INVOICE", template: "PROFESSIONAL_INVOICE", sections: [] })).toEqual([{ kind: "flow", sectionIndexes: [] }]);
  });
  it("skips invalid lines in live preview totals", () => {
    const r = buildLinesAndTotals([
      { name: "ok", quantity: "1", unit: "Nos", unitPrice: "100", discountType: "PERCENT", discountValue: "0", taxRate: "18" },
      { name: "bad", quantity: "-1", unit: "Nos", unitPrice: "100", discountType: "PERCENT", discountValue: "0", taxRate: "18" },
    ], "INTRA_STATE", "NONE", "50");
    expect(r.lines.length).toBe(1);
    expect(r.totals.grandTotal).toBe("118.00");
    expect(r.totals.balance).toBe("68.00");
  });
});

describe("messaging", () => {
  it("renders templates", () => {
    expect(renderTemplate("Hi {{customerName}}, {{ amount }} {{unknown}}", { customerName: "Asha", amount: "₹10" })).toBe("Hi Asha, ₹10 {{unknown}}");
  });
});

describe("security helpers", () => {
  it("signs and verifies short-lived render tokens bound to one document", () => {
    const t = signRenderToken("doc1", 60);
    expect(verifyRenderToken(t, "doc1")).toBe(true);
    expect(verifyRenderToken(t, "doc2")).toBe(false);
    expect(verifyRenderToken(t.replace(/.$/, (c) => (c === "A" ? "B" : "A")), "doc1")).toBe(false);
    expect(verifyRenderToken(signRenderToken("doc1", -10), "doc1")).toBe(false);
  });
  it("hashes passwords with scrypt", async () => {
    const h = await hashPassword("correct horse 42");
    expect(h.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse 42", h)).toBe(true);
    expect(await verifyPassword("wrong", h)).toBe(false);
  });
  it("validates customer email and optional GSTIN", () => {
    expect(customerSchema.safeParse({ name: "Acme", preferredChannel: "EMAIL", email: "bad" }).success).toBe(false);
    expect(customerSchema.safeParse({ name: "Acme", preferredChannel: "EMAIL", gstin: "" }).success).toBe(true);
    expect(customerSchema.safeParse({ name: "Acme", preferredChannel: "EMAIL", gstin: "29ABCDE1234F1Z5" }).success).toBe(true);
    expect(customerSchema.safeParse({ name: "Acme", preferredChannel: "EMAIL", gstin: "12345" }).success).toBe(false);
  });
});
