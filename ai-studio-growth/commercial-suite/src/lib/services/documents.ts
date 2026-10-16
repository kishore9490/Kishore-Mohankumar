import { Prisma, type PrismaClient } from "@prisma/client";
import { calculateTotals, type TaxMode } from "../tax";
import { dec, toMoneyString } from "../money";
import { parseISODate, todayISO, toISODate, addDaysISO } from "../dates";
import { allocateDocumentNumber } from "../documents/numbering";
import { allowedConversions, DOCUMENT_TYPE_META, effectiveStatus, STORED_STATUSES, type DocumentStatus, type DocumentType } from "../documents/meta";
import type { DocumentParsed } from "../validation/schemas";
import { ServiceError } from "./errors";
import { audit } from "./audit";

export interface CustomerSnapshot {
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  gstin?: string | null;
  state?: string | null;
  stateCode?: string | null;
}

type LineLike = DocumentParsed["lineItems"][number];

/** Computes server-side line values and totals. The client's numbers are never trusted. */
export function computeDocument(lines: LineLike[], taxMode: TaxMode, roundingMode: "NONE" | "NEAREST_RUPEE") {
  const totals = calculateTotals(
    lines.map((l) => ({ quantity: l.quantity, unitPrice: l.unitPrice, discountType: l.discountType, discountValue: l.discountValue || "0", taxRate: l.taxRate })),
    taxMode,
    roundingMode,
  );
  const lineRows = lines.map((l, i) => {
    const r = totals.lines[i];
    return {
      position: i,
      productServiceId: l.productServiceId || null,
      name: l.name,
      description: l.description ?? null,
      details: (l.details ?? undefined) as Prisma.InputJsonValue | undefined,
      hsnSac: l.hsnSac ?? null,
      quantity: dec(l.quantity).toDecimalPlaces(3).toString(),
      unit: l.unit,
      unitPrice: toMoneyString(l.unitPrice),
      discountType: l.discountType,
      discountValue: toMoneyString(l.discountValue || "0"),
      taxRate: dec(l.taxRate).toDecimalPlaces(2).toString(),
      billingFrequency: l.billingFrequency ?? null,
      grossAmount: r.gross.toFixed(2),
      discountAmount: r.discount.toFixed(2),
      taxableAmount: r.taxable.toFixed(2),
      taxAmount: r.tax.toFixed(2),
      totalAmount: r.total.toFixed(2),
    };
  });
  const totalsRow = {
    subtotal: totals.subtotal.toFixed(2),
    discountTotal: totals.discountTotal.toFixed(2),
    taxableTotal: totals.taxableTotal.toFixed(2),
    cgstTotal: totals.cgstTotal.toFixed(2),
    sgstTotal: totals.sgstTotal.toFixed(2),
    igstTotal: totals.igstTotal.toFixed(2),
    taxTotal: totals.taxTotal.toFixed(2),
    roundOff: totals.roundOff.toFixed(2),
    grandTotal: totals.grandTotal.toFixed(2),
  };
  return { lineRows, totalsRow, totals };
}

function snapshotOf(c: CustomerSnapshot): CustomerSnapshot {
  return {
    name: c.name,
    contactPerson: c.contactPerson ?? null,
    email: c.email ?? null,
    phone: c.phone ?? null,
    billingAddress: c.billingAddress ?? null,
    shippingAddress: c.shippingAddress ?? null,
    gstin: c.gstin ?? null,
    state: c.state ?? null,
    stateCode: c.stateCode ?? null,
  };
}

/** Creates or updates a document (always as an editable document; issuing is a separate step). */
export async function saveDocument(db: PrismaClient, input: DocumentParsed, userId: string | null, existingId?: string, opts: { isSample?: boolean } = {}) {
  if (!DOCUMENT_TYPE_META[input.type].templates.includes(input.template))
    throw new ServiceError(`The ${input.template} template is not available for this document type.`);

  return db.$transaction(async (tx) => {
    const [company, customer] = await Promise.all([
      tx.companyProfile.findUnique({ where: { id: input.companyId } }),
      tx.customer.findUnique({ where: { id: input.customerId } }),
    ]);
    if (!company) throw new ServiceError("The selected company profile no longer exists.");
    if (!customer) throw new ServiceError("The selected customer no longer exists.");
    if (customer.archived && !existingId) throw new ServiceError("This customer is archived. Restore the customer before creating new documents.");

    const { lineRows, totalsRow } = computeDocument(input.lineItems, input.taxMode, company.roundingMode);

    const common = {
      companyId: company.id,
      customerId: customer.id,
      template: input.template,
      title: input.title ?? null,
      reference: input.reference ?? null,
      issueDate: parseISODate(input.issueDate),
      validUntil: input.validUntil ? parseISODate(input.validUntil) : null,
      dueDate: input.dueDate ? parseISODate(input.dueDate) : null,
      placeOfSupply: input.placeOfSupply ?? customer.state ?? null,
      placeOfSupplyCode: input.placeOfSupplyCode ?? customer.stateCode ?? null,
      taxMode: input.taxMode,
      customerSnapshot: snapshotOf(customer) as unknown as Prisma.InputJsonValue,
      notes: input.notes ?? null,
      terms: input.terms ?? null,
      paymentTerms: input.paymentTerms ?? null,
      roundingMode: company.roundingMode,
      ...totalsRow,
    };

    let id: string;
    if (existingId) {
      const existing = await tx.document.findUnique({ where: { id: existingId } });
      if (!existing) throw new ServiceError("Document not found.");
      if (existing.type !== input.type) throw new ServiceError("Document type cannot be changed.");
      const editable = existing.type === "INVOICE" ? existing.status === "DRAFT" : ["DRAFT", "SENT"].includes(existing.status);
      if (!editable) throw new ServiceError("This document can no longer be edited. Duplicate it to make changes.");
      if (existing.companyId !== company.id && existing.number)
        throw new ServiceError("The company profile cannot be changed after a number has been assigned. Duplicate the document instead.");
      await tx.documentLineItem.deleteMany({ where: { documentId: existingId } });
      await tx.proposalSection.deleteMany({ where: { documentId: existingId } });
      await tx.document.update({ where: { id: existingId }, data: common });
      id = existingId;
      await audit(tx, { documentId: id, userId, action: "document.updated", summary: `${DOCUMENT_TYPE_META[input.type].label} ${existing.number ?? "draft"} updated` });
    } else {
      // Tax invoices get their number at issue time; other types are numbered immediately.
      const number = input.type === "INVOICE" ? null : await allocateDocumentNumber(tx, company.id, input.type, input.issueDate);
      const created = await tx.document.create({
        data: { ...common, type: input.type, number, status: "DRAFT", createdById: userId, isSample: opts.isSample ?? false },
      });
      id = created.id;
      await audit(tx, { documentId: id, userId, action: "document.created", summary: `${DOCUMENT_TYPE_META[input.type].label} ${number ?? "draft"} created for ${customer.name}` });
    }

    if (lineRows.length) await tx.documentLineItem.createMany({ data: lineRows.map((r) => ({ ...r, documentId: id, details: r.details ?? Prisma.JsonNull })) });
    if (input.type === "PROPOSAL" && input.sections.length) {
      await tx.proposalSection.createMany({
        data: input.sections.map((s, i) => ({
          documentId: id,
          position: i,
          type: s.type as Prisma.ProposalSectionCreateManyInput["type"],
          title: s.title,
          enabled: s.enabled,
          content: s.content as Prisma.InputJsonValue,
        })),
      });
    }
    return id;
  });
}

/** Issues a draft tax invoice: validates totals, allocates the invoice number atomically. */
export async function issueInvoice(db: PrismaClient, id: string, userId: string | null) {
  return db.$transaction(async (tx) => {
    const doc = await tx.document.findUnique({ where: { id }, include: { lineItems: true, company: true } });
    if (!doc) throw new ServiceError("Document not found.");
    if (doc.type !== "INVOICE") throw new ServiceError("Only tax invoices are issued. Use 'Mark as sent' for other documents.");
    if (doc.status !== "DRAFT") throw new ServiceError("Only draft invoices can be issued.");
    assertIssuable(doc.lineItems, doc.taxMode, doc.roundingMode, doc.grandTotal);
    if (!doc.dueDate) throw new ServiceError("Set a due date before issuing the invoice.");
    const number = doc.number ?? (await allocateDocumentNumber(tx, doc.companyId, "INVOICE", toISODate(doc.issueDate)));
    await tx.document.update({ where: { id }, data: { status: "ISSUED", number, issuedAt: new Date() } });
    await audit(tx, { documentId: id, userId, action: "invoice.issued", summary: `Tax invoice ${number} issued` });
    return number;
  });
}

type StoredLine = { quantity: Prisma.Decimal; unitPrice: Prisma.Decimal; discountType: "PERCENT" | "AMOUNT"; discountValue: Prisma.Decimal; taxRate: Prisma.Decimal };

/** Re-validates stored lines and totals before a document leaves draft. */
export function assertIssuable(lines: StoredLine[], taxMode: TaxMode, rounding: "NONE" | "NEAREST_RUPEE", storedGrandTotal: Prisma.Decimal | string) {
  if (!lines.length) throw new ServiceError("Add at least one line item before issuing or sending.");
  let recomputed;
  try {
    recomputed = calculateTotals(
      lines.map((l) => ({ quantity: l.quantity.toString(), unitPrice: l.unitPrice.toString(), discountType: l.discountType, discountValue: l.discountValue.toString(), taxRate: l.taxRate.toString() })),
      taxMode,
      rounding,
    );
  } catch (e) {
    throw new ServiceError(`The document has invalid line items: ${(e as Error).message}`);
  }
  if (!recomputed.grandTotal.equals(dec(storedGrandTotal.toString())))
    throw new ServiceError("Stored totals do not match the line items. Open the document and save it again.");
  if (recomputed.grandTotal.lte(0)) throw new ServiceError("The document total must be greater than zero.");
}

export async function setDocumentStatus(db: PrismaClient, id: string, status: DocumentStatus, userId: string | null) {
  return db.$transaction(async (tx) => {
    const doc = await tx.document.findUnique({ where: { id }, include: { lineItems: true, _count: { select: { payments: true } } } });
    if (!doc) throw new ServiceError("Document not found.");
    const type = doc.type as DocumentType;
    if (!STORED_STATUSES[type].includes(status)) throw new ServiceError("That status is not valid for this document type.");
    if (type === "INVOICE") {
      if (status === "ISSUED" || status === "PAID" || status === "PARTIALLY_PAID")
        throw new ServiceError(status === "ISSUED" ? "Use 'Issue invoice' to issue a draft." : "Paid status is set automatically from recorded payments.");
      if (status === "CANCELLED" && doc._count.payments > 0) throw new ServiceError("Invoices with recorded payments cannot be cancelled. Remove the payments first.");
      if (status === "DRAFT") throw new ServiceError("Issued invoices cannot return to draft. Cancel the invoice instead.");
    }
    if (doc.status === "CANCELLED") throw new ServiceError("Cancelled documents cannot change status.");
    if (status === "SENT" || status === "ACCEPTED") assertIssuable(doc.lineItems, doc.taxMode, doc.roundingMode, doc.grandTotal);
    if (status === "ACCEPTED" && doc.validUntil && toISODate(doc.validUntil) < todayISO())
      throw new ServiceError(`This ${DOCUMENT_TYPE_META[type].label.toLowerCase()} expired on ${toISODate(doc.validUntil)}. Extend the validity date (Edit) before marking it accepted.`);
    await tx.document.update({ where: { id }, data: { status, sentAt: status === "SENT" && !doc.sentAt ? new Date() : doc.sentAt } });
    await audit(tx, { documentId: id, userId, action: "document.status", summary: `${DOCUMENT_TYPE_META[type].label} ${doc.number ?? "draft"} marked ${status.toLowerCase().replace("_", " ")}` });
  });
}

/**
 * Converts an accepted quotation/proposal (or a proforma) into an invoice or proforma.
 * Customer details, line items and terms are copied exactly. The unique index on
 * (convertedFromId, type) guarantees a source cannot be converted to the same type twice,
 * even under concurrent requests.
 */
export async function convertDocument(db: PrismaClient, sourceId: string, targetType: DocumentType, userId: string | null) {
  try {
    return await db.$transaction(async (tx) => {
      const src = await tx.document.findUnique({ where: { id: sourceId }, include: { lineItems: { orderBy: { position: "asc" } } } });
      if (!src) throw new ServiceError("Source document not found.");
      const type = src.type as DocumentType;
      if (!allowedConversions(type).includes(targetType)) throw new ServiceError("This conversion is not supported.");
      if ((type === "QUOTATION" || type === "PROPOSAL") && src.status !== "ACCEPTED")
        throw new ServiceError("Only accepted quotations and proposals can be converted. Mark it as accepted first.");
      if (type === "PROFORMA" && src.status === "CANCELLED") throw new ServiceError("Cancelled proforma invoices cannot be converted.");
      const existing = await tx.document.findFirst({ where: { convertedFromId: src.id, type: targetType }, select: { id: true, number: true } });
      if (existing) throw new ServiceError(`Already converted to ${DOCUMENT_TYPE_META[targetType].label} ${existing.number ?? "(draft)"}.`, "DUPLICATE_CONVERSION");
      if (!src.lineItems.length) throw new ServiceError("The source document has no line items to convert.");

      const today = todayISO();
      const number = targetType === "INVOICE" ? null : await allocateDocumentNumber(tx, src.companyId, targetType, today);
      const company = await tx.companyProfile.findUniqueOrThrow({ where: { id: src.companyId } });
      const created = await tx.document.create({
        data: {
          type: targetType,
          number,
          companyId: src.companyId,
          customerId: src.customerId,
          template: DOCUMENT_TYPE_META[targetType].templates[0],
          status: "DRAFT",
          title: src.title,
          reference: src.number ? `Ref: ${src.number}` : src.reference,
          issueDate: parseISODate(today),
          dueDate: parseISODate(addDaysISO(today, 15)),
          placeOfSupply: src.placeOfSupply,
          placeOfSupplyCode: src.placeOfSupplyCode,
          taxMode: src.taxMode,
          customerSnapshot: src.customerSnapshot as Prisma.InputJsonValue,
          notes: src.notes,
          terms: company.termsInvoice ?? src.terms,
          paymentTerms: src.paymentTerms,
          subtotal: src.subtotal,
          discountTotal: src.discountTotal,
          taxableTotal: src.taxableTotal,
          cgstTotal: src.cgstTotal,
          sgstTotal: src.sgstTotal,
          igstTotal: src.igstTotal,
          taxTotal: src.taxTotal,
          roundOff: src.roundOff,
          grandTotal: src.grandTotal,
          roundingMode: src.roundingMode,
          convertedFromId: src.id,
          isSample: src.isSample,
          createdById: userId,
          lineItems: {
            create: src.lineItems.map((l) => ({
              position: l.position,
              productServiceId: l.productServiceId,
              name: l.name,
              description: l.description,
              details: l.details ?? Prisma.JsonNull,
              hsnSac: l.hsnSac,
              quantity: l.quantity,
              unit: l.unit,
              unitPrice: l.unitPrice,
              discountType: l.discountType,
              discountValue: l.discountValue,
              taxRate: l.taxRate,
              billingFrequency: l.billingFrequency,
              grossAmount: l.grossAmount,
              discountAmount: l.discountAmount,
              taxableAmount: l.taxableAmount,
              taxAmount: l.taxAmount,
              totalAmount: l.totalAmount,
            })),
          },
        },
      });
      await audit(tx, { documentId: created.id, userId, action: "document.converted", summary: `${DOCUMENT_TYPE_META[targetType].label} created from ${DOCUMENT_TYPE_META[type].label} ${src.number ?? ""}` });
      await audit(tx, { documentId: src.id, userId, action: "document.converted", summary: `Converted to ${DOCUMENT_TYPE_META[targetType].label}` });
      return created.id;
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      throw new ServiceError(`This document has already been converted to a ${DOCUMENT_TYPE_META[targetType].label}.`, "DUPLICATE_CONVERSION");
    throw e;
  }
}

export async function duplicateDocument(db: PrismaClient, id: string, userId: string | null) {
  return db.$transaction(async (tx) => {
    const src = await tx.document.findUnique({ where: { id }, include: { lineItems: { orderBy: { position: "asc" } }, sections: { orderBy: { position: "asc" } } } });
    if (!src) throw new ServiceError("Document not found.");
    const today = todayISO();
    const type = src.type as DocumentType;
    const number = type === "INVOICE" ? null : await allocateDocumentNumber(tx, src.companyId, type, today);
    const span = (a: Date | null) => (a ? Math.max(0, Math.round((a.getTime() - src.issueDate.getTime()) / 86_400_000)) : null);
    const validSpan = span(src.validUntil);
    const dueSpan = span(src.dueDate);
    const { id: _id, number: _n, status: _s, createdAt: _c, updatedAt: _u, issuedAt: _i, sentAt: _se, amountPaid: _a, convertedFromId: _cf, isSample: _is, customerSnapshot, ...rest } = src;
    void _id; void _n; void _s; void _c; void _u; void _i; void _se; void _a; void _cf; void _is;
    const created = await tx.document.create({
      data: {
        ...rest,
        lineItems: undefined,
        sections: undefined,
        customerSnapshot: customerSnapshot as Prisma.InputJsonValue,
        number,
        status: "DRAFT",
        title: src.title ? `${src.title}` : null,
        issueDate: parseISODate(today),
        validUntil: validSpan !== null ? parseISODate(addDaysISO(today, validSpan)) : null,
        dueDate: dueSpan !== null ? parseISODate(addDaysISO(today, dueSpan)) : null,
        createdById: userId,
      } as Prisma.DocumentUncheckedCreateInput,
    });
    if (src.lineItems.length)
      await tx.documentLineItem.createMany({
        data: src.lineItems.map(({ id: _lid, documentId: _d, ...l }) => { void _lid; void _d; return { ...l, details: l.details ?? Prisma.JsonNull, documentId: created.id }; }),
      });
    if (src.sections.length)
      await tx.proposalSection.createMany({
        data: src.sections.map(({ id: _sid, documentId: _d, ...s }) => { void _sid; void _d; return { ...s, content: s.content as Prisma.InputJsonValue, documentId: created.id }; }),
      });
    await audit(tx, { documentId: created.id, userId, action: "document.duplicated", summary: `Duplicated from ${src.number ?? "draft"}` });
    return created.id;
  });
}

export async function deleteDraft(db: PrismaClient, id: string, userId: string | null) {
  return db.$transaction(async (tx) => {
    const doc = await tx.document.findUnique({ where: { id }, include: { _count: { select: { payments: true, conversions: true } } } });
    if (!doc) throw new ServiceError("Document not found.");
    if (doc.status !== "DRAFT") throw new ServiceError("Only drafts can be deleted. Cancel or mark the document instead.");
    if (doc.type === "INVOICE" && doc.number) throw new ServiceError("Numbered invoices cannot be deleted. Cancel the invoice instead.");
    if (doc._count.conversions > 0) throw new ServiceError("This document has been converted and cannot be deleted.");
    await tx.document.delete({ where: { id } });
    await audit(tx, { documentId: null, userId, action: "document.deleted", summary: `${DOCUMENT_TYPE_META[doc.type as DocumentType].label} ${doc.number ?? "draft"} deleted` });
  });
}

/**
 * Records a payment against an issued tax invoice. The invoice row is locked (SELECT … FOR UPDATE)
 * so concurrent payments cannot together exceed the outstanding balance.
 */
export async function recordPayment(
  db: PrismaClient,
  input: { documentId: string; paymentDate: string; amount: string; method: string; reference?: string; notes?: string },
  userId: string | null,
) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM \`Document\` WHERE id = ${input.documentId} FOR UPDATE`;
    const doc = await tx.document.findUnique({ where: { id: input.documentId } });
    if (!doc) throw new ServiceError("Invoice not found.");
    if (doc.type !== "INVOICE") throw new ServiceError("Payments can only be recorded against tax invoices.");
    if (doc.status !== "ISSUED" && doc.status !== "PARTIALLY_PAID")
      throw new ServiceError(doc.status === "DRAFT" ? "Issue the invoice before recording payments." : `Payments cannot be recorded on a ${doc.status.toLowerCase().replace("_", " ")} invoice.`);
    const amount = dec(input.amount);
    if (!amount.isFinite() || amount.lte(0)) throw new ServiceError("Payment amount must be greater than zero.");
    if (amount.decimalPlaces() > 2) throw new ServiceError("Payment amount can have at most 2 decimal places.");
    const balance = dec(doc.grandTotal.toString()).minus(dec(doc.amountPaid.toString()));
    if (amount.gt(balance))
      throw new ServiceError(`Payment exceeds the outstanding balance of ${balance.toFixed(2)}. Record at most the outstanding amount.`);
    if (input.paymentDate < toISODate(doc.issueDate)) throw new ServiceError("Payment date cannot be before the invoice date.");
    if (input.paymentDate > todayISO()) throw new ServiceError("Payment date cannot be in the future.");
    const payment = await tx.payment.create({
      data: {
        documentId: doc.id,
        paymentDate: parseISODate(input.paymentDate),
        amount: amount.toFixed(2),
        method: input.method as Prisma.PaymentCreateInput["method"],
        reference: input.reference ?? null,
        notes: input.notes ?? null,
        recordedById: userId,
      },
    });
    const newPaid = dec(doc.amountPaid.toString()).plus(amount);
    const status = newPaid.equals(dec(doc.grandTotal.toString())) ? "PAID" : "PARTIALLY_PAID";
    await tx.document.update({ where: { id: doc.id }, data: { amountPaid: newPaid.toFixed(2), status } });
    await audit(tx, { documentId: doc.id, userId, action: "payment.recorded", summary: `Payment of ${amount.toFixed(2)} recorded on ${doc.number} (${input.method.replace("_", " ").toLowerCase()})` });
    return payment.id;
  });
}

export async function deletePayment(db: PrismaClient, paymentId: string, userId: string | null) {
  return db.$transaction(async (tx) => {
    const p = await tx.payment.findUnique({ where: { id: paymentId } });
    if (!p) throw new ServiceError("Payment not found.");
    await tx.$queryRaw`SELECT id FROM \`Document\` WHERE id = ${p.documentId} FOR UPDATE`;
    const doc = await tx.document.findUniqueOrThrow({ where: { id: p.documentId } });
    const newPaid = dec(doc.amountPaid.toString()).minus(dec(p.amount.toString()));
    await tx.payment.delete({ where: { id: paymentId } });
    await tx.document.update({ where: { id: doc.id }, data: { amountPaid: newPaid.toFixed(2), status: newPaid.gt(0) ? "PARTIALLY_PAID" : "ISSUED" } });
    await audit(tx, { documentId: doc.id, userId, action: "payment.deleted", summary: `Payment of ${p.amount.toFixed(2)} removed from ${doc.number}` });
  });
}

export { effectiveStatus };
