import type { Metadata } from "next";
import { BikeVisual } from "@/components/bikes/BikeVisual";
import { JsonLd } from "@/components/layout/JsonLd";
import { TestRideFlow } from "@/components/test-ride/TestRideFlow";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getBike, heroBikeSlug } from "@/data/bikes";
import { dealership } from "@/data/dealership";
import { formatPhone } from "@/lib/format";

export const metadata: Metadata = {
  title: "Book a test ride",
  description: `Book a free, no-obligation Honda test ride at ${dealership.name}, ${dealership.address.city}. Pick a motorcycle or scooter, a day and a time — at the showroom or, subject to availability, at your doorstep.`,
  alternates: { canonical: "/test-ride" },
  openGraph: { url: "/test-ride", title: `Book a test ride · ${dealership.name}` },
};

const facts: { icon: IconName; title: string; body: string }[] = [
  { icon: "check", title: "Free", body: "No cost, no obligation to buy" },
  { icon: "clock", title: "~20 minutes", body: "Plus time for your questions" },
  { icon: "shield", title: "Licence", body: "Valid two-wheeler licence needed" },
  { icon: "map-pin", title: "Your choice", body: "Showroom, or doorstep*" },
];

const faqs = [
  {
    q: "What do I need to bring?",
    a: "A valid two-wheeler driving licence (motorcycles with gears need a licence that covers geared two-wheelers). Bring your own helmet if you have one; if not, just mention it when we call to confirm.",
  },
  {
    q: "How long does a test ride take?",
    a: "The ride itself is usually around 20 minutes on a set route. Allow a little extra time to get comfortable with the controls beforehand and to ask questions afterwards.",
  },
  {
    q: "Can you bring the bike to my home or office?",
    a: "Doorstep test rides are offered within city limits, subject to availability of the model and a product specialist on your chosen day. Choose “At my doorstep” and add your area — we'll confirm on the call.",
  },
  {
    q: "Can someone ride pillion with me?",
    a: "Test rides are usually ridden solo, for safety. If you'd like to understand how the bike feels with two people, ask our team on the day — they'll tell you what's possible.",
  },
  {
    q: "Does the test ride cost anything?",
    a: "No. Test rides are free and there's no obligation to buy. Your request isn't a booking until our team calls you to confirm the slot.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function TestRidePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const bikeParam = one(sp.bike);
  const backdrop = getBike(bikeParam ?? "") ?? getBike(heroBikeSlug);

  return (
    <>
      {/* ───────── Cinematic header ───────── */}
      <section className="grain relative overflow-hidden bg-ink pb-8 pt-[calc(var(--header-h)+2.5rem)] md:pb-20 md:pt-[calc(var(--header-h)+6rem)]">
        {backdrop && (
          <div
            className="pointer-events-none absolute -right-[6%] top-[26%] hidden w-[52%] max-w-[860px] opacity-[0.22] [mask-image:linear-gradient(to_right,transparent,black_35%)] md:block"
            aria-hidden
          >
            <BikeVisual bike={backdrop} sizes="50vw" />
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-bone/15 to-transparent"
          aria-hidden
        />
        <div className="container-x relative">
          <p className="eyebrow flex items-center gap-3 text-bone/60">
            <span className="h-px w-8 bg-current" aria-hidden />
            Test ride · {dealership.name}
          </p>
          <h1 className="mt-5 font-display text-display-xl">
            Feel
            <br />
            the ride.
          </h1>
          <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-bone/70 md:text-lg">
            Twenty minutes on the road tells you more than any brochure. Free, no obligation — just bring your licence and
            we&apos;ll have the bike ready.
          </p>
          <ul className="mt-8 grid grid-cols-2 border-t border-bone/10 md:mt-14 md:max-w-4xl md:grid-cols-4">
            {facts.map((f, i) => (
              <li
                key={f.title}
                className={`flex flex-col gap-1 border-bone/10 py-4 pr-3 md:gap-1.5 md:py-5 md:pr-4 ${i % 2 === 1 ? "border-l pl-4 md:pl-6" : "md:pl-6 md:first:pl-0"} ${i > 1 ? "border-t md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
              >
                <Icon name={f.icon} size={18} className="text-bone/60" />
                <span className="mt-1 font-display text-base leading-none md:text-lg">{f.title}</span>
                <span className="text-[13px] leading-snug text-bone/55">{f.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── The flow ───────── */}
      <section className="surface-paper py-12 md:py-20" aria-label="Book your test ride">
        <div className="container-x">
          <TestRideFlow initialBike={bikeParam} initialVariant={one(sp.variant)} initialColor={one(sp.color)} source="test_ride_page" />
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="bg-ink py-16 md:py-24" aria-labelledby="tr-faq">
        <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            <p className="eyebrow flex items-center gap-3 text-bone/60">
              <span className="h-px w-8 bg-current" aria-hidden />
              Before you ride
            </p>
            <h2 id="tr-faq" className="mt-5 font-display text-display-md">
              Good to
              <br />
              know.
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-bone/60">
              Anything else? Call us on{" "}
              <a href={`tel:${dealership.phone.sales}`} className="whitespace-nowrap text-bone underline decoration-bone/30 underline-offset-4 hover:decoration-bone">
                {formatPhone(dealership.phone.sales)}
              </a>
              .
            </p>
            <p className="mt-8 text-[12.5px] text-bone/45">* Doorstep test rides are subject to availability.</p>
          </div>
          <div className="border-t border-bone/10">
            {faqs.map((f) => (
              <details key={f.q} className="group border-b border-bone/10">
                <summary className="flex min-h-16 list-none items-center justify-between gap-6 py-5 text-[17px] font-medium [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-bone/15 transition-transform duration-300 ease-[var(--ease-out-expo)] group-open:rotate-45">
                    <Icon name="plus" size={16} />
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 pr-12 text-[15px] leading-relaxed text-bone/65">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <JsonLd data={faqJsonLd} />
    </>
  );
}
