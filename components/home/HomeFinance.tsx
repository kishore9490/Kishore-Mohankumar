import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmiCalculator } from "@/components/finance/EmiCalculator";
import { getBike, heroBikeSlug, startingPrice } from "@/data/bikes";
import { estimateOnRoad } from "@/lib/emi";

/** Finance moment on the homepage — a working calculator, not a banner. */
export function HomeFinance({ index = "04" }: { index?: string }) {
  const bike = getBike(heroBikeSlug);
  return (
    <section aria-label="EMI calculator" className="surface-paper py-24 md:py-36">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading
            index={index}
            eyebrow="Finance"
            title={["Know your", "EMI first."]}
            lede="Move the sliders and see your monthly payment instantly. When you're ready, our finance desk helps with the paperwork."
          />
        </div>
        <div className="min-w-0 lg:col-span-7">
          <EmiCalculator
            variant="compact"
            source="home"
            bikeSlug={bike?.slug}
            initialPrice={bike ? estimateOnRoad(startingPrice(bike)) : undefined}
          />
        </div>
      </div>
    </section>
  );
}
