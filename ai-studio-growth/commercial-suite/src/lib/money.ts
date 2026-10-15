import Decimal from "decimal.js";

/**
 * All monetary arithmetic goes through decimal.js — never JS floating point.
 * Rounding policy (explicit and consistent across the app):
 *   - Monetary amounts are rounded to 2 decimal places (paise) using ROUND_HALF_UP.
 *   - Rounding happens per line item for discount and tax amounts; document totals are sums of rounded line values.
 *   - Optional "nearest rupee" rounding of the grand total is shown as a separate "Round off" line.
 */
export const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
export type DecimalValue = InstanceType<typeof D>;
export type MoneyInput = string | number | DecimalValue | { toString(): string } | null | undefined;

export function dec(value: MoneyInput): DecimalValue {
  if (value === null || value === undefined || value === "") return new D(0);
  if (value instanceof D) return value;
  const str = typeof value === "string" ? value.trim().replace(/,/g, "") : value.toString();
  try {
    return new D(str);
  } catch {
    return new D(NaN);
  }
}

export function isValidNumber(value: MoneyInput): boolean {
  const d = dec(value);
  return d.isFinite() && !d.isNaN();
}

export function round2(value: MoneyInput): DecimalValue {
  return dec(value).toDecimalPlaces(2, D.ROUND_HALF_UP);
}

export function sum(values: MoneyInput[]): DecimalValue {
  return values.reduce<DecimalValue>((acc, v) => acc.plus(dec(v)), new D(0));
}

/** Fixed 2dp string for storage / transport. */
export function toMoneyString(value: MoneyInput): string {
  return round2(value).toFixed(2);
}

const CURRENCY_SYMBOLS: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "AED " };

/** Indian digit grouping (1,23,45,678.90) for INR; western grouping otherwise. */
export function formatMoney(value: MoneyInput, currency = "INR", opts: { symbol?: boolean } = {}): string {
  const d = round2(value);
  const negative = d.isNegative();
  const [intPart, frac] = d.abs().toFixed(2).split(".");
  let grouped: string;
  if (currency === "INR") {
    const last3 = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3 : last3;
  } else {
    grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  const symbol = opts.symbol === false ? "" : (CURRENCY_SYMBOLS[currency] ?? currency + " ");
  return `${negative ? "-" : ""}${symbol}${grouped}.${frac}`;
}

export function formatQuantity(value: MoneyInput): string {
  const d = dec(value);
  return d.isInteger() ? d.toFixed(0) : d.toDecimalPlaces(3).toString();
}

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return [h ? ONES[h] + " Hundred" : "", r ? twoDigits(r) : ""].filter(Boolean).join(" ");
}

/** Converts a non-negative integer (as bigint-safe string math) into Indian-system words. */
function integerToIndianWords(intStr: string): string {
  let n = BigInt(intStr);
  if (n === BigInt(0)) return "Zero";
  const parts: string[] = [];
  const crore = BigInt(10000000);
  const croreCount = n / crore;
  n = n % crore;
  if (croreCount > BigInt(0)) parts.push(integerToIndianWords(croreCount.toString()) + " Crore");
  const num = Number(n);
  const lakh = Math.floor(num / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const rest = num % 1000;
  if (lakh) parts.push(twoDigits(lakh) + " Lakh");
  if (thousand) parts.push(twoDigits(thousand) + " Thousand");
  if (rest) parts.push(threeDigits(rest));
  return parts.join(" ");
}

/** "Rupees Twenty Three Thousand Six Hundred Only" — Indian numbering (lakh/crore). */
export function amountInWords(value: MoneyInput, currency = "INR"): string {
  const d = round2(value).abs();
  const [intPart, frac] = d.toFixed(2).split(".");
  const major = currency === "INR" ? "Rupees" : currency;
  const minor = currency === "INR" ? "Paise" : "Cents";
  let words = `${major} ${integerToIndianWords(intPart)}`;
  const paise = parseInt(frac, 10);
  if (paise > 0) words += ` and ${twoDigits(paise)} ${minor}`;
  return words + " Only";
}
