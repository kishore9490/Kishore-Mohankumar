import Link from "next/link";
import { dealership } from "@/data/dealership";
import { TrackedLink } from "@/components/layout/TrackedLink";
import { Icon, WhatsAppGlyph } from "@/components/ui/Icon";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn, formatPhone } from "@/lib/format";
import type { OpeningHours } from "@/lib/types";
import { OpenStatus } from "./OpenStatus";
import { ShowroomMap } from "./ShowroomMap";
import { directionsUrl } from "./links";
import { ShowroomImage } from "./ShowroomImage";
import { formatRange, parseDays } from "./hours";

const { address, phone, email, hours } = dealership;

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
/** Names the days with no opening hours, e.g. "Sunday". */
function closedLabel(rows: OpeningHours[]) {
  const open = new Set(rows.flatMap((r) => parseDays(r.days)));
  const closed = DAY_NAMES.filter((_, i) => !open.has(i));
  if (!closed.length) return null;
  return closed.length === 1 ? closed[0] : closed.map((d) => d.slice(0, 3)).join(", ");
}

function HoursBlock({ label, rows }: { label: string; rows: OpeningHours[] }) {
  return (
    <div className="py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h3 className="eyebrow text-bone/50">{label}</h3>
        <OpenStatus hours={rows} />
      </div>
      <dl className="mt-3 space-y-1.5">
        {rows.map((r) => (
          <div key={r.days} className="flex justify-between gap-4 text-[15px]">
            <dt className="text-bone/65">{r.days}</dt>
            <dd className="tabular">{formatRange(r)}</dd>
          </div>
        ))}
        {closedLabel(rows) && (
          <div className="flex justify-between gap-4 text-[15px]">
            <dt className="text-bone/65">{closedLabel(rows)}</dt>
            <dd className="text-bone/45">Closed</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

function ContactRow({ label, href, value, event, source, icon }: { label: string; href: string; value: string; event: "phone_click" | "whatsapp_click"; source: string; icon: "phone" | "whatsapp" }) {
  return (
    <li>
      <TrackedLink
        href={href}
        event={event}
        source={source}
        className="group flex min-h-14 items-center justify-between gap-4 border-b border-white/10 py-3 transition-colors hover:text-bone"
      >
        <span className="flex items-center gap-3.5">
          <span className="grid size-10 place-items-center rounded-full border border-white/15 transition-colors group-hover:border-white/40">
            {icon === "phone" ? <Icon name="phone" size={17} /> : <WhatsAppGlyph size={17} />}
          </span>
          <span>
            <span className="eyebrow block text-[10px] text-bone/45">{label}</span>
            <span className="tabular text-[15px]">{value}</span>
          </span>
        </span>
        <Icon name="arrow-up-right" size={16} className="text-bone/40 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-bone" />
      </TrackedLink>
    </li>
  );
}

/**
 * "Come see us." — map, address, live opening hours and every way to reach
 * the showroom. Homepage-ready; `/contact` renders it with `headingAs="h1"`.
 */
export function DealershipSection({
  index = "08",
  headingAs = "h2",
  details = true,
  hero = false,
  className,
}: {
  index?: string;
  headingAs?: "h1" | "h2";
  /** Show the test-ride / service / showroom row under the map. */
  details?: boolean;
  /** Adds top spacing for use as the first section of a page. */
  hero?: boolean;
  className?: string;
}) {
  const Heading = headingAs;
  const source = hero ? "contact" : "dealership_section";
  return (
    <section
      aria-labelledby="visit-title"
      className={cn("relative py-24 md:py-36", hero && "pt-[calc(var(--header-h)+2.5rem)] md:pt-[calc(var(--header-h)+4rem)]", className)}
    >
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Reveal className="eyebrow mb-5 flex items-center gap-3 text-bone/60">
              <span className="tabular">{index}</span>
              <span className="h-px w-8 bg-current opacity-40" aria-hidden />
              <span>Visit the showroom</span>
            </Reveal>
            <Heading id="visit-title" className={cn("font-display", headingAs === "h1" ? "text-display-xl" : "text-display-lg")}>
              <RevealLines lines={["Come", "see us."]} />
            </Heading>
          </div>
          <Reveal delay={0.15} className="max-w-sm text-pretty text-base leading-relaxed text-bone/65 md:text-lg lg:pb-2">
            <p>See the range in person, take a test ride, or bring your Honda in for service. Prefer to talk first? Call or WhatsApp — a real person replies.</p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-10 md:mt-16 lg:grid-cols-12 lg:gap-14">
          <Reveal className="min-w-0 lg:col-span-7">
            <ShowroomMap className="aspect-[4/5] sm:aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[620px]" source={source} />
          </Reveal>

          <div className="min-w-0 lg:col-span-5">
            <Reveal>
              <h3 className="eyebrow text-bone/50">Address</h3>
              <address className="mt-3 text-xl not-italic leading-snug md:text-2xl">
                {address.line1}
                <br />
                {address.line2 && (
                  <>
                    {address.line2},{" "}
                  </>
                )}
                {address.city} {address.pincode}
                <span className="block text-bone/50">{address.state}</span>
              </address>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <TrackedLink href={directionsUrl} event="directions_click" source={source} className="inline-flex min-h-11 items-center gap-1.5 underline decoration-white/25 underline-offset-4 hover:decoration-white">
                  Directions in Google Maps <Icon name="arrow-up-right" size={14} />
                </TrackedLink>
                <TrackedLink href={whatsappUrl("directions")} event="whatsapp_click" source={`${source}_directions`} className="inline-flex min-h-11 items-center gap-1.5 text-bone/65 hover:text-bone">
                  <WhatsAppGlyph size={15} /> Ask for directions
                </TrackedLink>
              </div>
            </Reveal>

            <Reveal delay={0.05} className="mt-8 border-t border-white/10">
              <HoursBlock label="Showroom" rows={hours.showroom} />
              <div className="border-t border-white/10">
                <HoursBlock label="Workshop" rows={hours.workshop} />
              </div>
              <p className="text-xs text-bone/40">Live status shown in India Standard Time.</p>
            </Reveal>

            <Reveal delay={0.1} className="mt-8">
              <h3 className="eyebrow text-bone/50">Talk to us</h3>
              <ul className="mt-2 border-t border-white/10">
                <ContactRow label="Sales" href={`tel:${phone.sales}`} value={formatPhone(phone.sales)} event="phone_click" source={`${source}_sales`} icon="phone" />
                <ContactRow label="Service" href={`tel:${phone.service}`} value={formatPhone(phone.service)} event="phone_click" source={`${source}_service`} icon="phone" />
                <ContactRow label="WhatsApp · Sales" href={whatsappUrl("sales")} value="Ask about a new Honda" event="whatsapp_click" source={`${source}_sales`} icon="whatsapp" />
                <ContactRow label="WhatsApp · Service" href={whatsappUrl("service")} value="Book or ask about service" event="whatsapp_click" source={`${source}_service`} icon="whatsapp" />
              </ul>
              <p className="mt-4 text-sm text-bone/55">
                Or write to{" "}
                <a href={`mailto:${email}`} className="text-bone underline decoration-white/25 underline-offset-4 hover:decoration-white">
                  {email}
                </a>
              </p>
            </Reveal>
          </div>
        </div>

        {details && (
          <div className="mt-16 grid gap-10 border-t border-white/10 pt-10 md:mt-24 md:grid-cols-2 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-bone/45">Test rides</p>
              <h3 className="font-display mt-3 text-display-sm">Ride before you decide.</h3>
              <ul className="mt-5 space-y-4">
                {dealership.testRideLocations.map((l) => (
                  <li key={l.id} className="flex gap-3">
                    <Icon name={l.id === "doorstep" ? "home" : "store"} size={18} className="mt-0.5 shrink-0 text-bone/50" />
                    <span>
                      <span className="block font-medium">{l.label}</span>
                      <span className="text-sm leading-relaxed text-bone/55">{l.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/test-ride" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium hover:text-bone/80">
                Book a test ride <Icon name="arrow-right" size={16} />
              </Link>
            </Reveal>
            <Reveal delay={0.05} className="lg:col-span-4">
              <p className="eyebrow text-bone/45">Service</p>
              <h3 className="font-display mt-3 text-display-sm">Genuine parts. Clear estimates.</h3>
              <ul className="mt-5 space-y-4">
                <li className="flex gap-3">
                  <Icon name="wrench" size={18} className="mt-0.5 shrink-0 text-bone/50" />
                  <span>
                    <span className="block font-medium">Workshop</span>
                    <span className="text-sm leading-relaxed text-bone/55">
                      {hours.workshop.map((h) => `${h.days}, ${formatRange(h)}`).join(" · ")}
                    </span>
                  </span>
                </li>
                {dealership.pickupDrop.available && (
                  <li className="flex gap-3">
                    <Icon name="truck" size={18} className="mt-0.5 shrink-0 text-bone/50" />
                    <span>
                      <span className="block font-medium">Pickup &amp; drop</span>
                      <span className="text-sm leading-relaxed text-bone/55">{dealership.pickupDrop.note ?? "Available on request."}</span>
                    </span>
                  </li>
                )}
              </ul>
              <Link href="/service/book" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium hover:text-bone/80">
                Book a service <Icon name="arrow-right" size={16} />
              </Link>
            </Reveal>
            <Reveal delay={0.1} className="md:col-span-2 lg:col-span-4">
              <ShowroomImage className="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[300px]" />
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
