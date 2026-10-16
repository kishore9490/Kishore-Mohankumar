import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { documentSchema, type DocumentInput } from "@/lib/validation/schemas";
import { convertDocument, deletePayment, duplicateDocument, issueInvoice, recordPayment, saveDocument, setDocumentStatus } from "@/lib/services/documents";
import { ServiceError } from "@/lib/services/errors";
import { addDaysISO, todayISO } from "@/lib/dates";
import { seedBase, seedSampleData } from "@/lib/sample-data";

const url = process.env.TEST_DATABASE_URL;
const d = url ? describe : describe.skip;
const db = new PrismaClient({ datasources: { db: { url: url ?? "postgresql://invalid" } } });

let companyId = "";
let customerId = "";
let userId = "";

function input(over: Partial<DocumentInput> = {}): ReturnType<typeof documentSchema.parse> {
  return documentSchema.parse({
    type: "QUOTATION",
    companyId,
    customerId,
    template: "PROFESSIONAL_QUOTATION",
    issueDate: todayISO(),
    validUntil: addDaysISO(todayISO(), 15),
    taxMode: "INTRA_STATE",
    lineItems: [{ name: "Annual package", quantity: "1", unit: "Package", unitPrice: "20000", discountType: "PERCENT", discountValue: "0", taxRate: "18" }],
    sections: [],
    ...over,
  });
}

async function issuedInvoice(total = "20000") {
  const id = await saveDocument(db, input({ type: "INVOICE", template: "PROFESSIONAL_INVOICE", validUntil: "", dueDate: addDaysISO(todayISO(), 10), lineItems: [{ name: "Work", quantity: "1", unit: "Nos", unitPrice: total, discountType: "PERCENT", discountValue: "0", taxRate: "18" }] }), userId);
  await issueInvoice(db, id, userId);
  return id;
}

d("document services (PostgreSQL)", () => {
  beforeAll(async () => {
    const company = await seedBase(db);
    companyId = company.id;
    userId = (await db.user.findFirstOrThrow()).id;
    customerId = (await db.customer.create({ data: { name: "Test Customer", state: "Karnataka", stateCode: "29" } })).id;
  });
  afterAll(async () => db.$disconnect());
  beforeEach(async () => {
    await db.payment.deleteMany();
    await db.document.updateMany({ data: { convertedFromId: null } });
    await db.document.deleteMany();
  });

  it("computes and stores totals server-side (₹20,000 + 18% GST = ₹23,600)", async () => {
    const id = await saveDocument(db, input(), userId);
    const doc = await db.document.findUniqueOrThrow({ where: { id } });
    expect(doc.number).toMatch(/^QT\/\d{4}-\d{2}\/\d{4}$/);
    expect(doc.cgstTotal.toFixed(2)).toBe("1800.00");
    expect(doc.sgstTotal.toFixed(2)).toBe("1800.00");
    expect(doc.grandTotal.toFixed(2)).toBe("23600.00");
  });

  it("allocates unique numbers under concurrent creation", async () => {
    const ids = await Promise.all(Array.from({ length: 12 }, () => saveDocument(db, input(), userId)));
    const docs = await db.document.findMany({ where: { id: { in: ids } } });
    const numbers = docs.map((x) => x.number);
    expect(new Set(numbers).size).toBe(12);
  });

  it("skips over manually-created clashes instead of duplicating invoice numbers", async () => {
    const seq = await db.documentSequence.findFirstOrThrow({ where: { companyId, type: "INVOICE" } });
    const first = await issuedInvoice();
    const firstNo = (await db.document.findUniqueOrThrow({ where: { id: first } })).number;
    await db.documentSequence.update({ where: { id: seq.id }, data: { nextNumber: seq.nextNumber } }); // roll the counter back
    const second = await issuedInvoice();
    const secondNo = (await db.document.findUniqueOrThrow({ where: { id: second } })).number;
    expect(secondNo).not.toBe(firstNo);
  });

  it("numbers tax invoices only when issued and rejects issuing invalid documents", async () => {
    const empty = await saveDocument(db, input({ type: "INVOICE", template: "PROFESSIONAL_INVOICE", validUntil: "", dueDate: addDaysISO(todayISO(), 5), lineItems: [] }), userId);
    expect((await db.document.findUniqueOrThrow({ where: { id: empty } })).number).toBeNull();
    await expect(issueInvoice(db, empty, userId)).rejects.toThrow(/at least one line item/);
    const zero = await saveDocument(db, input({ type: "INVOICE", template: "PROFESSIONAL_INVOICE", validUntil: "", dueDate: addDaysISO(todayISO(), 5), lineItems: [{ name: "Free", quantity: "1", unit: "Nos", unitPrice: "0", discountType: "PERCENT", discountValue: "0", taxRate: "18" }] }), userId);
    await expect(issueInvoice(db, zero, userId)).rejects.toThrow(/greater than zero/);
  });

  it("rejects invalid financial input at validation", () => {
    expect(documentSchema.safeParse({ ...input(), lineItems: [{ name: "x", quantity: "0", unit: "Nos", unitPrice: "10", discountType: "PERCENT", discountValue: "0", taxRate: "18" }] }).success).toBe(false);
    expect(documentSchema.safeParse({ ...input(), lineItems: [{ name: "x", quantity: "1", unit: "Nos", unitPrice: "-10", discountType: "PERCENT", discountValue: "0", taxRate: "18" }] }).success).toBe(false);
    expect(documentSchema.safeParse({ ...input(), lineItems: [{ name: "x", quantity: "1", unit: "Nos", unitPrice: "10", discountType: "PERCENT", discountValue: "150", taxRate: "18" }] }).success).toBe(false);
    expect(documentSchema.safeParse({ ...input(), validUntil: addDaysISO(todayISO(), -1) }).success).toBe(false);
  });

  it("supports partial payments and blocks overpayment", async () => {
    const id = await issuedInvoice(); // 23,600
    await recordPayment(db, { documentId: id, paymentDate: todayISO(), amount: "10000", method: "UPI" }, userId);
    let doc = await db.document.findUniqueOrThrow({ where: { id } });
    expect(doc.status).toBe("PARTIALLY_PAID");
    expect(doc.amountPaid.toFixed(2)).toBe("10000.00");
    await expect(recordPayment(db, { documentId: id, paymentDate: todayISO(), amount: "13600.01", method: "UPI" }, userId)).rejects.toThrow(/exceeds the outstanding balance/);
    await recordPayment(db, { documentId: id, paymentDate: todayISO(), amount: "13600", method: "BANK_TRANSFER" }, userId);
    doc = await db.document.findUniqueOrThrow({ where: { id } });
    expect(doc.status).toBe("PAID");
    await expect(recordPayment(db, { documentId: id, paymentDate: todayISO(), amount: "1", method: "UPI" }, userId)).rejects.toThrow(ServiceError);
  });

  it("serialises concurrent payments so the total never exceeds the invoice", async () => {
    const id = await issuedInvoice(); // 23,600
    const results = await Promise.allSettled(Array.from({ length: 5 }, () => recordPayment(db, { documentId: id, paymentDate: todayISO(), amount: "8000", method: "UPI" }, userId)));
    const ok = results.filter((r) => r.status === "fulfilled").length;
    expect(ok).toBe(2);
    const doc = await db.document.findUniqueOrThrow({ where: { id } });
    expect(doc.amountPaid.toFixed(2)).toBe("16000.00");
  });

  it("removing a payment recalculates status", async () => {
    const id = await issuedInvoice();
    const pid = await recordPayment(db, { documentId: id, paymentDate: todayISO(), amount: "23600", method: "CASH" }, userId);
    await deletePayment(db, pid, userId);
    const doc = await db.document.findUniqueOrThrow({ where: { id } });
    expect(doc.status).toBe("ISSUED");
    expect(doc.amountPaid.toFixed(2)).toBe("0.00");
  });

  it("rejects payments on draft invoices and payments dated in the future", async () => {
    const draft = await saveDocument(db, input({ type: "INVOICE", template: "PROFESSIONAL_INVOICE", validUntil: "", dueDate: addDaysISO(todayISO(), 5) }), userId);
    await expect(recordPayment(db, { documentId: draft, paymentDate: todayISO(), amount: "100", method: "UPI" }, userId)).rejects.toThrow(/Issue the invoice/);
    const id = await issuedInvoice();
    await expect(recordPayment(db, { documentId: id, paymentDate: addDaysISO(todayISO(), 2), amount: "100", method: "UPI" }, userId)).rejects.toThrow(/future/);
  });

  it("converts an accepted quotation into an invoice exactly once", async () => {
    const q = await saveDocument(db, input({ lineItems: [
      { name: "A", quantity: "2", unit: "Nos", unitPrice: "999.99", discountType: "PERCENT", discountValue: "10", taxRate: "18" },
      { name: "B", quantity: "1", unit: "Nos", unitPrice: "500", discountType: "AMOUNT", discountValue: "50", taxRate: "5" },
    ] }), userId);
    await expect(convertDocument(db, q, "INVOICE", userId)).rejects.toThrow(/accepted/);
    await setDocumentStatus(db, q, "ACCEPTED", userId);
    const inv = await convertDocument(db, q, "INVOICE", userId);
    const [src, out] = await Promise.all([
      db.document.findUniqueOrThrow({ where: { id: q }, include: { lineItems: { orderBy: { position: "asc" } } } }),
      db.document.findUniqueOrThrow({ where: { id: inv }, include: { lineItems: { orderBy: { position: "asc" } } } }),
    ]);
    expect(out.type).toBe("INVOICE");
    expect(out.status).toBe("DRAFT");
    expect(out.grandTotal.toFixed(2)).toBe(src.grandTotal.toFixed(2));
    expect(out.customerSnapshot).toEqual(src.customerSnapshot);
    expect(out.lineItems.map((l) => [l.name, l.quantity.toString(), l.unitPrice.toFixed(2), l.totalAmount.toFixed(2)])).toEqual(src.lineItems.map((l) => [l.name, l.quantity.toString(), l.unitPrice.toFixed(2), l.totalAmount.toFixed(2)]));
    await expect(convertDocument(db, q, "INVOICE", userId)).rejects.toThrow(/Already converted/);
    // concurrent duplicate attempts for another target type
    const results = await Promise.allSettled([convertDocument(db, q, "PROFORMA", userId), convertDocument(db, q, "PROFORMA", userId)]);
    expect(results.filter((r) => r.status === "fulfilled").length).toBe(1);
  });

  it("prevents accepting an expired quotation", async () => {
    const q = await saveDocument(db, input({ issueDate: addDaysISO(todayISO(), -30), validUntil: addDaysISO(todayISO(), -1) }), userId);
    await expect(setDocumentStatus(db, q, "ACCEPTED", userId)).rejects.toThrow(/expired/);
  });

  it("locks issued invoices and blocks manual paid status", async () => {
    const id = await issuedInvoice();
    await expect(saveDocument(db, input({ type: "INVOICE", template: "PROFESSIONAL_INVOICE", validUntil: "", dueDate: addDaysISO(todayISO(), 5) }), userId, id)).rejects.toThrow(/no longer be edited/);
    await expect(setDocumentStatus(db, id, "PAID", userId)).rejects.toThrow(/automatically/);
  });

  it("duplicates a proposal with sections as a new numbered draft", async () => {
    const p = await saveDocument(db, input({ type: "PROPOSAL", template: "PREMIUM_COMMERCIAL", sections: [{ type: "COVER", title: "Cover", enabled: true, content: { body: "Tagline" } }, { type: "EXECUTIVE_SUMMARY", title: "Summary", enabled: true, content: { items: [{ title: "x" }] } }] }), userId);
    const copy = await duplicateDocument(db, p, userId);
    const [a, b] = await Promise.all([
      db.document.findUniqueOrThrow({ where: { id: p }, include: { sections: true } }),
      db.document.findUniqueOrThrow({ where: { id: copy }, include: { sections: true } }),
    ]);
    expect(b.number).not.toBe(a.number);
    expect(b.status).toBe("DRAFT");
    expect(b.sections.length).toBe(2);
  });

  it("seeds and resets sample data idempotently", async () => {
    await seedSampleData(db, userId);
    await seedSampleData(db, userId);
    expect(await db.document.count({ where: { isSample: true } })).toBe(7);
    expect(await db.customer.count({ where: { name: "Anant Motors", isSample: true } })).toBe(1);
    const proposal = await db.document.findFirstOrThrow({ where: { type: "PROPOSAL", isSample: true }, include: { sections: true } });
    expect(proposal.taxableTotal.toFixed(2)).toBe("20000.00");
    expect(proposal.sections.length).toBe(8);
  });
});
