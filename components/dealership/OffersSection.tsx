import { offers as allOffers } from "@/data/offers";
import { dealership } from "@/data/dealership";
import { getBike } from "@/data/bikes";
import { TrackedLink } from "@/components/layout/TrackedLink";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn, formatDate, formatPhone } from "@/lib/format";
import type { Offer } from "@/lib/types";

const KIND_LABEL: Record<Offer["kind"], string> = {
  exchange: "Exchange",
  finance: "Finance",
  accessories: "Accessories",
  service: "Service",
  seasonal: "Seasonal",
};

/**
 * Showroom offers — rendered only from approved entries in data/offers.ts.
 * Empty list: renders nothing (`emptyFallback="hide"`, default) or a single
 * quiet line pointing to the team (`emptyFallback="note"`).
 */
export function OffersSection({
  index = "07",
  tone = "ink",
  emptyFallback = "hide",
  bikeSlug,
  className,
}: {
  index?: string;
  tone?: "ink" | "paper";
  emptyFallback?: "hide" | "note";
  /** Only show offers for this bike (plus offers not tied to a bike). */
  bikeSlug?: string;
  className?: string;
}) {
  const paper = tone === "paper";
  const today = new Date().toISOString().slice(0, 10);
  const offers = allOffers.filter(
    (o) => (!o.validUntil || o.validUntil >= today) && (!bikeSlug || !o.bikeSlugs?.length || o.bikeSlugs.includes(bikeSlug)),
  );

  if (!offers.length) {
    if (emptyFallback === "hide") return null;
    return (
      <section aria-label="Current offers" className={cn("py-10 md:py-14", paper && "surface-paper", className)}>
        <div className="container-x">
          <p className="flex flex-col gap-3 border-t border-current/10 pt-8 text-[15px] leading-relaxed sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-6">
            <span className="opacity-70">Speak with our showroom team for current availability and schemes.</span>
            <span className="flex flex-wrap gap-x-5 gap-y-2">
              <TrackedLink href={`tel:${dealership.phone.sales}`} event="phone_click" source="offers_note" className="tabular underline decoration-current/30 underline-offset-4 hover:decoration-current">
                Call {formatPhone(dealership.phone.sales)}
              </TrackedLink>
              <TrackedLink href={whatsappUrl("sales")} event="whatsapp_click" source="offers_note" className="underline decoration-current/30 underline-offset-4 hover:decoration-current">
                WhatsApp us
              </TrackedLink>
            </span>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="offers-title" className={cn("py-24 md:py-36", paper && "surface-paper", className)}>
      <div className="container-x">
        <Reveal className="eyebrow mb-5 flex items-center gap-3 opacity-60">
          <span className="tabular">{index}</span>
          <span className="h-px w-8 bg-current opacity-40" aria-hidden />
          <span>Offers</span>
        </Reveal>
        <h2 id="offers-title" className="font-display text-display-lg">
          <RevealLines lines={["Currently at", "the showroom."]} />
        </h2>

        <ul className="mt-12 border-t border-current/10 md:mt-16">
          {offers.map((o, i) => {
            const bikes = (o.bikeSlugs ?? []).map((s) => getBike(s)?.name).filter(Boolean);
            return (
              <Reveal as="li" key={o.id} delay={i * 0.05} className="grid gap-4 border-b border-current/10 py-8 md:grid-cols-12 md:gap-8 md:py-10">
                <div className="md:col-span-3">
                  <span className="eyebrow inline-flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-signal" aria-hidden />
                    {KIND_LABEL[o.kind]}
                  </span>
                  {o.validUntil && <p className="mt-2 text-sm opacity-55">Valid until {formatDate(o.validUntil)}</p>}
                </div>
                <div className="md:col-span-6">
                  <h3 className="font-display text-display-sm">{o.title}</h3>
                  <p className="mt-3 max-w-xl text-[15px] leading-relaxed opacity-70">{o.description}</p>
                  {bikes.length > 0 && <p className="mt-3 text-sm opacity-55">On {bikes.join(", ")}</p>}
                </div>
                <div className="md:col-span-3">{o.terms && <p className="text-xs leading-relaxed opacity-50">{o.terms}</p>}</div>
              </Reveal>
            );
          })}
        </ul>
        <p className="mt-6 text-xs opacity-50">Offers are set by the dealership and Honda; ask our team for full terms before you book.</p>
      </div>
    </section>
  );
}
