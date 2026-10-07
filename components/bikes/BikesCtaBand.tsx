"use client";

import { ButtonLink, Button } from "@/components/ui/Button";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { useLeads } from "@/components/leads/LeadProvider";
import { cn } from "@/lib/format";

/**
 * Closing conversion band: Book a test ride (primary) + Get on-road price.
 * `bikeSlug` pre-fills both journeys when used on a product page.
 */
export function BikesCtaBand({
  bikeSlug,
  source = "bikes_cta",
  eyebrow = "Next step",
  title = ["Ride it", "before you decide."],
  lede = "A test ride takes about 20 minutes. Bring your licence — we'll handle the rest. Prefer numbers first? Get an exact on-road price for your city, with no obligation.",
  className,
}: {
  bikeSlug?: string;
  source?: string;
  eyebrow?: string;
  title?: string[];
  lede?: string;
  className?: string;
}) {
  const { openOnRoadPrice } = useLeads();
  return (
    <section aria-label="Book a test ride or get an on-road price" className={cn("surface-paper relative overflow-hidden py-24 md:py-36", className)}>
      <div className="container-x relative grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <Reveal className="eyebrow mb-5 flex items-center gap-3 opacity-60">
            <span className="h-px w-8 bg-current opacity-40" aria-hidden />
            {eyebrow}
          </Reveal>
          <h2 className="font-display text-display-lg text-balance">
            <RevealLines lines={title} />
          </h2>
          <Reveal delay={0.15} className="mt-6 max-w-xl text-base leading-relaxed opacity-70 md:text-lg">
            <p>{lede}</p>
          </Reveal>
        </div>
        <Reveal delay={0.2} className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col lg:items-stretch">
          <ButtonLink href={bikeSlug ? `/test-ride?bike=${bikeSlug}` : "/test-ride"} size="lg" icon="arrow-right" magnetic>
            Book a test ride
          </ButtonLink>
          <Button size="lg" variant="outline" iconLeft="receipt" onClick={() => openOnRoadPrice({ bikeSlug, source })}>
            Get on-road price
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
