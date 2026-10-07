export interface EmiInput {
  price: number;
  downPayment: number;
  tenureMonths: number;
  /** Annual interest rate in percent, e.g. 9.5 */
  annualRate: number;
}

export interface EmiResult {
  principal: number;
  emi: number;
  totalInterest: number;
  totalPayable: number;
}

/** Standard reducing-balance EMI. All outputs are estimates. */
export function calculateEmi({ price, downPayment, tenureMonths, annualRate }: EmiInput): EmiResult {
  const principal = Math.max(0, price - downPayment);
  if (principal === 0 || tenureMonths <= 0) {
    return { principal, emi: 0, totalInterest: 0, totalPayable: downPayment };
  }
  const r = annualRate / 12 / 100;
  const emi = r === 0 ? principal / tenureMonths : (principal * r * (1 + r) ** tenureMonths) / ((1 + r) ** tenureMonths - 1);
  const totalLoan = emi * tenureMonths;
  return {
    principal,
    emi,
    totalInterest: totalLoan - principal,
    totalPayable: totalLoan + downPayment,
  };
}

/**
 * Very rough on-road estimate used only to seed the EMI calculator.
 * Registration, insurance and handling vary by state and model; the UI always
 * labels this as an estimate and offers an exact on-road quote.
 */
export function estimateOnRoad(exShowroom: number) {
  return Math.round((exShowroom * 1.14) / 100) * 100;
}

export const EMI_DEFAULTS = { annualRate: 9.5, tenureMonths: 36, downPaymentPct: 0.15 };
export const TENURE_OPTIONS = [12, 18, 24, 36, 48];
