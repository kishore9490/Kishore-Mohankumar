import Link from "next/link";
import type { Bike } from "@/lib/types";
import { startingPrice } from "@/data/bikes";
import { calculateEmi, EMI_DEFAULTS, estimateOnRoad } from "@/lib/emi";
import { formatINR } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

/** "Finance in a minute" — a quick EMI teaser linking to the full calculator. */
export function FinanceTeaser({ bike }: { bike: Bike }) {
  const onRoad = estimateOnRoad(startingPrice(bike));
  const down = Math.round((onRoad * EMI_DEFAULTS.downPaymentPct) / 100) * 100;
  const { emi } = calculateEmi({ price: onRoad, downPayment: down, tenureMonths: EMI_DEFAULTS.tenureMonths, annualRate: EMI_DEFAULTS.annualRate });
  const href = `/finance?bike=${bike.slug}&price=${onRoad}`;

  return (
    <section aria-labelledby="finance-teaser" className="surface-paper pb-16 md:pb-24" style={{ background: "var(--color-paper-2)" }}>
      <div className="container-x">
        <Link
          href={href}
          className="group grid gap-6 rounded-[28px] border border-current/15 bg-paper p-6 transition-[border-color,box-shadow] duration-500 hover:border-current/40 hover:shadow-[0_30px_60px_-40px_rgb(0_0_0/0.4)] md:grid-cols-12 md:items-center md:p-10"
        >
          <div className="md:col-span-5">
            <p className="eyebrow flex items-center gap-2 opacity-55">
              <Icon name="calculator" size={14} />
              Finance in a minute
            </p>
            <h2 id="finance-teaser" className="mt-3 font-display text-display-sm">
              Plan your {bike.name} EMI.
            </h2>
          </div>
          <dl className="grid grid-cols-3 gap-4 md:col-span-5">
            <div>
              <dt className="text-[12px] opacity-55">From</dt>
              <dd className="mt-1 font-display-wide text-xl tabular md:text-2xl">{formatINR(emi)}</dd>
              <dd className="text-[12px] opacity-55">per month*</dd>
            </div>
            <div>
              <dt className="text-[12px] opacity-55">Down payment</dt>
              <dd className="mt-1 font-display-wide text-xl tabular md:text-2xl">{formatINR(down)}</dd>
              <dd className="text-[12px] opacity-55">{Math.round(EMI_DEFAULTS.downPaymentPct * 100)}% of on-road*</dd>
            </div>
            <div>
              <dt className="text-[12px] opacity-55">Tenure</dt>
              <dd className="mt-1 font-display-wide text-xl tabular md:text-2xl">{EMI_DEFAULTS.tenureMonths}</dd>
              <dd className="text-[12px] opacity-55">months</dd>
            </div>
          </dl>
          <div className="flex items-center justify-between gap-4 md:col-span-2 md:justify-end">
            <span className="text-sm font-medium md:sr-only">Open the EMI calculator</span>
            <span className="grid size-12 place-items-center rounded-full bg-ink text-bone transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
              <Icon name="arrow-right" size={18} />
            </span>
          </div>
          <p className="text-[12px] leading-relaxed opacity-55 md:col-span-12">
            *Illustration on an estimated on-road price of {formatINR(onRoad)} at {EMI_DEFAULTS.annualRate}% p.a. Actual rates depend on the lender and your profile. Not a finance offer.
          </p>
        </Link>
      </div>
    </section>
  );
}
