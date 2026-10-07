import type { Bike } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { BikeCard } from "../BikeCard";
import { relatedBikes } from "../match";

/** "You might also consider" — same category first, then nearest price. */
export function RelatedBikes({ bike, index = "04" }: { bike: Bike; index?: string }) {
  const related = relatedBikes(bike, 3);
  return (
    <section aria-labelledby="related-title" className="surface-paper py-24 md:py-32">
      <div className="container-x">
        <div id="related-title">
          <SectionHeading index={index} eyebrow="Compare the range" title={["You might", "also consider."]} size="md" />
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {related.map((b, i) => (
            <Reveal as="li" key={b.slug} delay={i * 0.08}>
              <BikeCard bike={b} />
            </Reveal>
          ))}
        </ul>
        <p className="mt-6 text-[12px] opacity-55">*Indicative ex-showroom prices; mileage is an indicative real-world figure.</p>
      </div>
    </section>
  );
}
