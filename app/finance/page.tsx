import type { Metadata } from "next";
import { EmiCalculator, PRICE_MAX, PRICE_MIN } from "@/components/finance/EmiCalculator";
import { Icon } from "@/components/ui/Icon";
import { getBike } from "@/data/bikes";
import { dealership } from "@/data/dealership";
import { formatPhone } from "@/lib/format";

export const metadata: Metadata = {
  title: "EMI calculator & two-wheeler finance",
  description: `Estimate your Honda two-wheeler EMI in seconds — set the on-road price, down payment, loan duration and interest rate. Then let the ${dealership.name} finance desk help with the paperwork.`,
  alternates: { canonical: "/finance" },
  openGraph: { url: "/finance", title: `EMI calculator · ${dealership.name}` },
};

const steps = [
  {
    title: "Estimate",
    body: "Use the calculator to find a monthly figure you're comfortable with. Play with the down payment and duration — there's no sign-up and nothing is saved.",
  },
  {
    title: "Talk to our finance desk",
    body: "Share your estimate and we'll call you. We'll walk you through the lenders we work with, what they typically need and how to compare their terms.",
  },
  {
    title: "Paperwork at the showroom",
    body: "Bring your documents when you visit. Your application, approval and delivery paperwork can be handled in one place, with someone to answer questions.",
  },
];

const documents = [
  { title: "Identity proof", body: "Aadhaar, PAN, passport, voter ID or driving licence." },
  { title: "Address proof", body: "Aadhaar, utility bill, rental agreement or passport." },
  { title: "Income proof", body: "Recent salary slips, Form 16 or ITR if you're self-employed." },
  { title: "Bank statements", body: "Usually the last 3–6 months of your salary or main account." },
  { title: "Photographs", body: "A couple of recent passport-size photographs." },
];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function FinancePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const bike = getBike(one(sp.bike) ?? "");
  const priceParam = Number(one(sp.price));
  const price = Number.isFinite(priceParam) && priceParam >= PRICE_MIN && priceParam <= PRICE_MAX ? Math.round(priceParam) : undefined;

  return (
    <>
      {/* The global header is transparent with light text until scroll — give it a dark band on this paper page. */}
      <div className="h-[var(--header-h)] bg-ink" aria-hidden />
      <section className="surface-paper pb-20 pt-10 md:pb-28 md:pt-20">
        <div className="container-x">
          <header className="max-w-3xl">
            <p className="eyebrow flex items-center gap-3 opacity-60">
              <span className="h-px w-8 bg-current" aria-hidden />
              Finance · EMI calculator
            </p>
            <h1 className="mt-5 text-balance font-display text-display-lg">Know your EMI before you ride.</h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed opacity-70 md:text-lg">
              Move the sliders to see what a Honda could cost you each month. It&apos;s an estimate — when you&apos;re ready, our
              finance desk will help you find the real numbers.
            </p>
          </header>
          <div className="mt-12 md:mt-16">
            <EmiCalculator variant="full" bikeSlug={bike?.slug} initialPrice={price} source="finance_page" />
          </div>
        </div>
      </section>

      <section className="grain relative bg-ink py-16 md:py-28" aria-labelledby="fin-how">
        <div className="container-x">
          <p className="eyebrow flex items-center gap-3 text-bone/60">
            <span className="h-px w-8 bg-current" aria-hidden />
            How it works
          </p>
          <h2 id="fin-how" className="mt-5 max-w-3xl font-display text-display-md">
            How financing works with us.
          </h2>
          <ol className="mt-12 grid border-t border-bone/10 md:mt-16 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className={`flex flex-col gap-4 border-b border-bone/10 py-8 md:border-b-0 md:py-2 md:pr-10 ${i > 0 ? "md:border-l md:pl-10" : ""}`}>
                <span className="font-display-wide text-5xl leading-none text-bone/20 tabular md:mt-8">0{i + 1}</span>
                <h3 className="font-display text-xl">{s.title}</h3>
                <p className="max-w-sm text-[15px] leading-relaxed text-bone/60">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="surface-paper py-16 md:py-28" aria-labelledby="fin-docs">
        <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            <p className="eyebrow flex items-center gap-3 opacity-60">
              <span className="h-px w-8 bg-current" aria-hidden />
              Documents
            </p>
            <h2 id="fin-docs" className="mt-5 font-display text-display-md">
              What to
              <br />
              keep handy.
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed opacity-65">
              These are typically what lenders in India ask for. Your lender may ask for more, or less — we&apos;ll confirm the
              exact list when we call.
            </p>
            <p className="mt-6 text-[15px]">
              Questions?{" "}
              <a href={`tel:${dealership.phone.sales}`} className="whitespace-nowrap font-medium underline decoration-current/30 underline-offset-4 hover:decoration-current">
                {formatPhone(dealership.phone.sales)}
              </a>
            </p>
          </div>
          <ul className="border-t border-current/10">
            {documents.map((d) => (
              <li key={d.title} className="flex gap-4 border-b border-current/10 py-5">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-current/25">
                  <Icon name="check" size={13} strokeWidth={2.2} />
                </span>
                <div>
                  <p className="font-medium">{d.title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed opacity-60">{d.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
