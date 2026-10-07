import type { Metadata } from "next";
import Link from "next/link";
import { dealership } from "@/data/dealership";
import { TrustSection } from "@/components/dealership/TrustSection";
import { RiderStories } from "@/components/dealership/RiderStories";
import { OffersSection } from "@/components/dealership/OffersSection";
import { OpenStatus } from "@/components/dealership/OpenStatus";
import { directionsUrl } from "@/components/dealership/links";
import { TrackedLink } from "@/components/layout/TrackedLink";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal, RevealLines } from "@/components/ui/Reveal";

/** "Authorised Honda …" → "authorised Honda …" for mid-sentence use. */
const descriptor = dealership.descriptor.charAt(0).toLowerCase() + dealership.descriptor.slice(1);

export const metadata: Metadata = {
  title: "About us",
  description: `${dealership.name} is an ${descriptor} in ${dealership.address.city} — sales, test rides, finance help, genuine-parts service and accessories under one roof.`,
  alternates: { canonical: "/about" },
};

const JOURNEYS = [
  { href: "/bikes", title: "Sales", body: "The full Honda scooter and motorcycle range, explained honestly — with help choosing the right one.", cta: "Explore bikes" },
  { href: "/test-ride", title: "Test rides", body: "Ride before you decide, from the showroom or, where we can, from your doorstep.", cta: "Book a test ride" },
  { href: "/finance", title: "Finance help", body: "Estimate your EMI and let us walk you through loan options and paperwork.", cta: "Estimate EMI" },
  { href: "/service", title: "Service & genuine parts", body: "Scheduled and repair service with genuine Honda parts and an estimate you approve first.", cta: "Book a service" },
  { href: "/accessories", title: "Accessories", body: "Genuine protection, comfort and touring accessories, fitted before delivery.", cta: "Build yours" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section aria-labelledby="about-title" className="relative overflow-hidden pb-20 pt-[calc(var(--header-h)+2.5rem)] md:pb-32 md:pt-[calc(var(--header-h)+5rem)]">
        <div aria-hidden className="studio-glow pointer-events-none absolute inset-0" />
        <div className="container-x relative">
          <Reveal className="eyebrow mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-bone/60">
            <span>{dealership.descriptor}</span>
            <span className="opacity-50" aria-hidden>
              ·
            </span>
            <span>{dealership.address.city}</span>
          </Reveal>
          <h1 id="about-title" className="font-display text-display-xl">
            <RevealLines lines={[dealership.name.replace(/ Honda$/, ""), "Honda."]} />
          </h1>
          <div className="mt-12 grid gap-8 border-t border-white/10 pt-10 md:mt-20 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-7">
              <p className="font-display text-display-md">
                Your Honda.
                <br />
                <span className="text-bone/55">Your next ride.</span>
                <br />
                <span className="text-bone/30">Your trusted service.</span>
              </p>
            </Reveal>
            <Reveal delay={0.15} className="lg:col-span-5 lg:pt-3">
              <p className="text-pretty text-lg leading-relaxed text-bone/75 md:text-xl">
                From your first test ride to every service after it, we&rsquo;re here for the whole journey — not just the day you
                collect the keys.
              </p>
              <p className="mt-5 text-base leading-relaxed text-bone/55">
                {dealership.name} is an {descriptor} in {dealership.address.line2 ? `${dealership.address.line2}, ` : ""}
                {dealership.address.city}: sales, finance help, a Honda workshop and genuine accessories, all under one roof.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section aria-labelledby="do-title" className="surface-paper py-24 md:py-36">
        <div className="container-x">
          <Reveal className="eyebrow mb-5 flex items-center gap-3 opacity-60">
            <span className="tabular">02</span>
            <span className="h-px w-8 bg-current opacity-40" aria-hidden />
            <span>What we do</span>
          </Reveal>
          <h2 id="do-title" className="font-display text-display-lg">
            <RevealLines lines={["One showroom.", "Every step."]} />
          </h2>
          <ol className="mt-12 border-t border-current/10 md:mt-16">
            {JOURNEYS.map((j, i) => (
              <Reveal as="li" key={j.href} delay={i * 0.04} className="border-b border-current/10">
                <Link
                  href={j.href}
                  className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 py-7 transition-colors md:grid-cols-[5rem_minmax(0,5fr)_minmax(0,6fr)_auto] md:gap-x-8 md:py-10"
                >
                  <span className="tabular self-start font-mono text-xs opacity-45 md:self-center">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-display-sm transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5 md:text-display-md">
                    {j.title}
                  </span>
                  <span className="col-start-2 row-start-2 mt-2 max-w-md text-[15px] leading-relaxed opacity-65 md:col-start-3 md:row-start-1 md:mt-0">
                    {j.body}
                    <span className="mt-2 block text-sm font-medium opacity-100 md:hidden">{j.cta} →</span>
                  </span>
                  <span className="col-start-3 row-span-2 row-start-1 grid size-12 place-items-center rounded-full border border-current/15 transition-[background-color,color,border-color] duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-bone md:col-start-4 md:size-14">
                    <Icon name="arrow-up-right" size={20} />
                    <span className="sr-only">{j.cta}</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <TrustSection index="03" tone="ink" />
      <RiderStories index="04" tone="paper" />
      <OffersSection emptyFallback="note" tone="paper" index="05" className="pt-0 md:pt-0" />

      {/* Visit */}
      <section aria-labelledby="visit-cta" className="relative overflow-hidden py-24 md:py-36">
        <div aria-hidden className="studio-glow pointer-events-none absolute inset-0" />
        <div className="container-x relative grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-14">
          <div className="lg:col-span-7">
            <h2 id="visit-cta" className="font-display text-display-lg">
              <RevealLines lines={["See it in", "person."]} />
            </h2>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-md text-base leading-relaxed text-bone/65 md:text-lg">
                Sit on the bike, ask every question, take it for a ride. {dealership.address.line1}, {dealership.address.city}.
              </p>
              <OpenStatus hours={dealership.hours.showroom} className="mt-5" />
            </Reveal>
          </div>
          <Reveal delay={0.15} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:col-span-5 lg:justify-end">
            <ButtonLink href="/test-ride" size="lg" icon="arrow-right">
              Book a test ride
            </ButtonLink>
            <TrackedLink
              href={directionsUrl}
              event="directions_click"
              source="about"
              className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full border border-current/25 px-7 text-[15px] font-medium transition-colors hover:border-current/60"
            >
              Get directions <Icon name="arrow-up-right" size={18} />
            </TrackedLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}
