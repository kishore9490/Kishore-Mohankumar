import { D, dec, round2, sum, type DecimalValue, type MoneyInput } from "./money";

/**
 * GST calculation engine — pure functions, independent of the UI and the database.
 *
 * Tax treatment is chosen explicitly per document (TaxMode):
 *   INTRA_STATE  → CGST (rate/2) + SGST (rate/2), each computed on the line's taxable value and rounded to paise.
 *   INTER_STATE  → IGST (full rate) on the line's taxable value, rounded to paise.
 *   NO_TAX       → no tax applied (must be chosen deliberately, e.g. exempt supply / export).
 *
 * This engine performs arithmetic only. It does not certify statutory compliance;
 * rates, place of supply and treatment must be verified by the business for each transaction.
 */

export type TaxMode = "INTRA_STATE" | "INTER_STATE" | "NO_TAX";
export type DiscountType = "PERCENT" | "AMOUNT";
export type RoundingMode = "NONE" | "NEAREST_RUPEE";

export interface LineInput {
  quantity: MoneyInput;
  unitPrice: MoneyInput;
  discountType?: DiscountType;
  discountValue?: MoneyInput;
  taxRate: MoneyInput;
}

export interface LineResult {
  gross: DecimalValue;
  discount: DecimalValue;
  taxable: DecimalValue;
  cgst: DecimalValue;
  sgst: DecimalValue;
  igst: DecimalValue;
  tax: DecimalValue;
  total: DecimalValue;
}

export interface TotalsResult {
  subtotal: DecimalValue;
  discountTotal: DecimalValue;
  taxableTotal: DecimalValue;
  cgstTotal: DecimalValue;
  sgstTotal: DecimalValue;
  igstTotal: DecimalValue;
  taxTotal: DecimalValue;
  totalBeforeRounding: DecimalValue;
  roundOff: DecimalValue;
  grandTotal: DecimalValue;
  lines: LineResult[];
  /** Per-rate breakdown for the tax summary table. */
  taxBreakdown: { rate: DecimalValue; taxable: DecimalValue; cgst: DecimalValue; sgst: DecimalValue; igst: DecimalValue; tax: DecimalValue }[];
}

export class LineValidationError extends Error {}

/** Validates a single line; returns a list of human-readable problems (empty when valid). */
export function validateLine(line: LineInput): string[] {
  const errors: string[] = [];
  const qty = dec(line.quantity);
  const price = dec(line.unitPrice);
  const rate = dec(line.taxRate);
  const discountValue = dec(line.discountValue ?? 0);
  if (!qty.isFinite()) errors.push("Quantity must be a number.");
  else if (qty.lte(0)) errors.push("Quantity must be greater than zero.");
  if (!price.isFinite()) errors.push("Unit price must be a number.");
  else if (price.isNegative()) errors.push("Unit price cannot be negative.");
  if (!rate.isFinite() || rate.isNegative() || rate.gt(100)) errors.push("Tax rate must be between 0 and 100.");
  if (!discountValue.isFinite() || discountValue.isNegative()) errors.push("Discount cannot be negative.");
  else if ((line.discountType ?? "PERCENT") === "PERCENT" && discountValue.gt(100)) errors.push("Discount percentage cannot exceed 100%.");
  else if (line.discountType === "AMOUNT" && qty.isFinite() && price.isFinite() && discountValue.gt(round2(qty.times(price))))
    errors.push("Discount cannot exceed the line amount.");
  return errors;
}

export function calculateLine(line: LineInput, mode: TaxMode): LineResult {
  const problems = validateLine(line);
  if (problems.length) throw new LineValidationError(problems.join(" "));
  const gross = round2(dec(line.quantity).times(dec(line.unitPrice)));
  const dv = dec(line.discountValue ?? 0);
  const discount = (line.discountType ?? "PERCENT") === "PERCENT" ? round2(gross.times(dv).dividedBy(100)) : round2(dv);
  const taxable = gross.minus(discount);
  const rate = dec(line.taxRate);
  let cgst = new D(0);
  let sgst = new D(0);
  let igst = new D(0);
  if (mode === "INTRA_STATE") {
    cgst = round2(taxable.times(rate).dividedBy(200));
    sgst = round2(taxable.times(rate).dividedBy(200));
  } else if (mode === "INTER_STATE") {
    igst = round2(taxable.times(rate).dividedBy(100));
  }
  const tax = cgst.plus(sgst).plus(igst);
  return { gross, discount, taxable, cgst, sgst, igst, tax, total: taxable.plus(tax) };
}

export function calculateTotals(lines: LineInput[], mode: TaxMode, rounding: RoundingMode = "NONE"): TotalsResult {
  const results = lines.map((l) => calculateLine(l, mode));
  const subtotal = sum(results.map((r) => r.gross));
  const discountTotal = sum(results.map((r) => r.discount));
  const taxableTotal = sum(results.map((r) => r.taxable));
  const cgstTotal = sum(results.map((r) => r.cgst));
  const sgstTotal = sum(results.map((r) => r.sgst));
  const igstTotal = sum(results.map((r) => r.igst));
  const taxTotal = cgstTotal.plus(sgstTotal).plus(igstTotal);
  const totalBeforeRounding = taxableTotal.plus(taxTotal);
  const grandTotal = rounding === "NEAREST_RUPEE" ? totalBeforeRounding.toDecimalPlaces(0, D.ROUND_HALF_UP) : totalBeforeRounding;
  const roundOff = grandTotal.minus(totalBeforeRounding);

  const byRate = new Map<string, { rate: DecimalValue; taxable: DecimalValue; cgst: DecimalValue; sgst: DecimalValue; igst: DecimalValue; tax: DecimalValue }>();
  results.forEach((r, i) => {
    const rate = dec(lines[i].taxRate);
    const key = rate.toFixed(2);
    const cur = byRate.get(key) ?? { rate, taxable: new D(0), cgst: new D(0), sgst: new D(0), igst: new D(0), tax: new D(0) };
    byRate.set(key, {
      rate,
      taxable: cur.taxable.plus(r.taxable),
      cgst: cur.cgst.plus(r.cgst),
      sgst: cur.sgst.plus(r.sgst),
      igst: cur.igst.plus(r.igst),
      tax: cur.tax.plus(r.tax),
    });
  });

  return {
    subtotal,
    discountTotal,
    taxableTotal,
    cgstTotal,
    sgstTotal,
    igstTotal,
    taxTotal,
    totalBeforeRounding,
    roundOff,
    grandTotal,
    lines: results,
    taxBreakdown: [...byRate.values()].sort((a, b) => a.rate.comparedTo(b.rate)),
  };
}

/** Suggests the tax mode from supplier and place-of-supply state codes. The user can always override. */
export function suggestTaxMode(supplierStateCode?: string | null, placeOfSupplyCode?: string | null): TaxMode {
  if (!supplierStateCode || !placeOfSupplyCode) return "INTRA_STATE";
  return supplierStateCode.trim() === placeOfSupplyCode.trim() ? "INTRA_STATE" : "INTER_STATE";
}
