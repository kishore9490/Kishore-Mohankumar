import { describe, expect, it } from "vitest";
import { amountInWords, dec, formatMoney, round2, sum } from "@/lib/money";
import { calculateLine, calculateTotals, LineValidationError, suggestTaxMode, validateLine } from "@/lib/tax";

describe("money", () => {
  it("avoids floating point errors", () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(sum(["0.1", "0.2"]).toFixed(2)).toBe("0.30");
    expect(dec("19.99").times(3).toFixed(2)).toBe("59.97");
  });
  it("rounds half-up to paise", () => {
    expect(round2("2.675").toFixed(2)).toBe("2.68");
    expect(round2("2.674").toFixed(2)).toBe("2.67");
    expect(round2("-1.005").toFixed(2)).toBe("-1.01");
  });
  it("formats INR with Indian grouping", () => {
    expect(formatMoney("20000")).toBe("₹20,000.00");
    expect(formatMoney("12345678.9")).toBe("₹1,23,45,678.90");
    expect(formatMoney("999")).toBe("₹999.00");
    expect(formatMoney("1234567.5", "USD")).toBe("$1,234,567.50");
  });
  it("writes amounts in words using lakh/crore", () => {
    expect(amountInWords("23600")).toBe("Rupees Twenty Three Thousand Six Hundred Only");
    expect(amountInWords("150000.50")).toBe("Rupees One Lakh Fifty Thousand and Fifty Paise Only");
    expect(amountInWords("120500000")).toBe("Rupees Twelve Crore Five Lakh Only");
    expect(amountInWords("0")).toBe("Rupees Zero Only");
  });
});

describe("tax engine", () => {
  it("computes intra-state CGST + SGST on the reference package (₹20,000 + 18%)", () => {
    const t = calculateTotals([{ quantity: 1, unitPrice: "20000", taxRate: 18 }], "INTRA_STATE", "NEAREST_RUPEE");
    expect(t.taxableTotal.toFixed(2)).toBe("20000.00");
    expect(t.cgstTotal.toFixed(2)).toBe("1800.00");
    expect(t.sgstTotal.toFixed(2)).toBe("1800.00");
    expect(t.igstTotal.toFixed(2)).toBe("0.00");
    expect(t.grandTotal.toFixed(2)).toBe("23600.00");
  });
  it("computes inter-state IGST", () => {
    const t = calculateTotals([{ quantity: 2, unitPrice: "999.99", taxRate: 18 }], "INTER_STATE");
    expect(t.subtotal.toFixed(2)).toBe("1999.98");
    expect(t.igstTotal.toFixed(2)).toBe("360.00");
    expect(t.grandTotal.toFixed(2)).toBe("2359.98");
  });
  it("applies no tax only when explicitly chosen", () => {
    const t = calculateTotals([{ quantity: 1, unitPrice: 100, taxRate: 18 }], "NO_TAX");
    expect(t.taxTotal.toFixed(2)).toBe("0.00");
    expect(t.grandTotal.toFixed(2)).toBe("100.00");
  });
  it("handles percent and fixed discounts", () => {
    const pct = calculateLine({ quantity: 3, unitPrice: "333.33", discountType: "PERCENT", discountValue: 10, taxRate: 18 }, "INTRA_STATE");
    expect(pct.gross.toFixed(2)).toBe("999.99");
    expect(pct.discount.toFixed(2)).toBe("100.00");
    expect(pct.taxable.toFixed(2)).toBe("899.99");
    expect(pct.cgst.toFixed(2)).toBe("81.00");
    expect(pct.total.toFixed(2)).toBe("1061.99");
    const amt = calculateLine({ quantity: 1, unitPrice: 5000, discountType: "AMOUNT", discountValue: 500, taxRate: 5 }, "INTER_STATE");
    expect(amt.taxable.toFixed(2)).toBe("4500.00");
    expect(amt.igst.toFixed(2)).toBe("225.00");
  });
  it("records round-off separately", () => {
    const t = calculateTotals([{ quantity: 1, unitPrice: "100.30", taxRate: 18 }], "INTRA_STATE", "NEAREST_RUPEE");
    expect(t.totalBeforeRounding.toFixed(2)).toBe("118.36");
    expect(t.grandTotal.toFixed(2)).toBe("118.00");
    expect(t.roundOff.toFixed(2)).toBe("-0.36");
  });
  it("groups tax by rate", () => {
    const t = calculateTotals(
      [
        { quantity: 1, unitPrice: 1000, taxRate: 18 },
        { quantity: 1, unitPrice: 500, taxRate: 5 },
        { quantity: 2, unitPrice: 250, taxRate: 18 },
      ],
      "INTRA_STATE",
    );
    expect(t.taxBreakdown.map((b) => [b.rate.toString(), b.taxable.toFixed(2), b.tax.toFixed(2)])).toEqual([
      ["5", "500.00", "25.00"],
      ["18", "1500.00", "270.00"],
    ]);
  });
  it("allows zero-priced complimentary lines", () => {
    const t = calculateTotals([{ quantity: 1, unitPrice: 0, taxRate: 18 }], "INTRA_STATE");
    expect(t.grandTotal.toFixed(2)).toBe("0.00");
  });
  it("rejects invalid financial input", () => {
    expect(validateLine({ quantity: 0, unitPrice: 10, taxRate: 18 })).toContain("Quantity must be greater than zero.");
    expect(validateLine({ quantity: 1, unitPrice: -5, taxRate: 18 })).toContain("Unit price cannot be negative.");
    expect(validateLine({ quantity: 1, unitPrice: 10, taxRate: 18, discountValue: 120 })).toContain("Discount percentage cannot exceed 100%.");
    expect(validateLine({ quantity: 1, unitPrice: 10, taxRate: 18, discountType: "AMOUNT", discountValue: 11 })).toContain("Discount cannot exceed the line amount.");
    expect(validateLine({ quantity: 1, unitPrice: 10, taxRate: 150 }).length).toBe(1);
    expect(validateLine({ quantity: "abc", unitPrice: 10, taxRate: 18 })).toContain("Quantity must be a number.");
    expect(() => calculateLine({ quantity: -1, unitPrice: 10, taxRate: 18 }, "INTRA_STATE")).toThrow(LineValidationError);
  });
  it("suggests tax mode from state codes", () => {
    expect(suggestTaxMode("29", "29")).toBe("INTRA_STATE");
    expect(suggestTaxMode("29", "33")).toBe("INTER_STATE");
    expect(suggestTaxMode(null, "33")).toBe("INTRA_STATE");
  });
});
