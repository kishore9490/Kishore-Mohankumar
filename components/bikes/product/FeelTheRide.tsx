"use client";

import type { Bike } from "@/lib/types";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { useLeads } from "@/components/leads/LeadProvider";
import { BikeVisual } from "../BikeVisual";
import { testRideHref, useBikeConfig } from "./ConfigContext";

/** Closing dark band: "Feel the ride." with the configured bike. */
export function FeelTheRide({ bike }: { bike: Bike }) {
  const cfg = useBikeConfig();
  const { openOnRoadPrice } = useLeads();
  return (
    <section aria-labelledby="feel-title" className="relative isolate overflow-hidden bg-ink py-24 text-bone md:py-36">
      <div className="pointer-events-none absolute inset-0 grain" aria-hidden />
      <div className="pointer-events-none absolute -right-[10%] bottom-0 -z-10 w-[85%] opacity-25 md:w-[60%]" aria-hidden>
        <BikeVisual bike={bike} color={cfg.color} sizes="60vw" showPlaceholderLabel={false} />
      </div>
      <div className="container-x">
        <Reveal className="eyebrow mb-6 flex items-center gap-3 text-bone/55">
          <span className="h-px w-8 bg-current opacity-40" aria-hidden />
          Test ride the {bike.name}
        </Reveal>
        <h2 id="feel-title" className="font-display-wide text-display-xl">
          <RevealLines lines={["Feel", "the ride."]} />
        </h2>
        <Reveal delay={0.15} className="mt-8 max-w-md text-base leading-relaxed text-bone/65 md:text-lg">
          <p>
            Numbers only go so far. Choose a time, bring your driving licence, and ride the {bike.name}{bike.variants.length > 1 ? ` ${cfg.variant.name}` : ""} for yourself — no obligation.
          </p>
        </Reveal>
        <Reveal delay={0.25} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={testRideHref(cfg)} size="lg" icon="arrow-right" magnetic>
            Book test ride
          </ButtonLink>
          <Button size="lg" variant="outline" onClick={() => openOnRoadPrice({ bikeSlug: bike.slug, source: "pdp_closing" })}>
            Get on-road price
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
