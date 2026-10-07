import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { HeroTitle } from "@/components/service/HeroTitle";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CallServiceButton, WhatsAppServiceButton } from "@/components/service/ServiceActions";
import { QuickTrack } from "@/components/service/QuickTrack";
import { StageDots } from "@/components/service/StageDots";
import { serviceStrengths } from "@/components/service/ServiceShowcase";
import { durationLabel, workshopHours } from "@/components/service/utils";
import { dealership, formattedAddress } from "@/data/dealership";
import { serviceTypes } from "@/data/services";
import { formatPhone } from "@/lib/format";

export const metadata: Metadata = {
  title: "Service",
  description: `Book a Honda service at ${dealership.name}, ${dealership.address.city}, track your bike live through every stage of the work, and see your service history.`,
  alternates: { canonical: "/service" },
  openGraph: { title: `Service · ${dealership.name}`, url: "/service" },
};

const steps = [
  { title: "Book", body: "Pick your service, a day and a time. It takes about a minute." },
  {
    title: dealership.pickupDrop.available ? "Drop or pickup" : "Drop off",
    body: dealership.pickupDrop.available
      ? "Ride in at your slot, or ask us to collect it — subject to availability."
      : "Ride in at your slot. We'll check your bike in and talk you through it.",
  },
  { title: "Track live", body: "Follow each stage from check-in to quality check. Nothing extra without your OK." },
  { title: "Ride home", body: "Washed, checked and road-tested — with a clear note of what was done." },
];

export default function ServicePage() {
  const hours = workshopHours();
  const strengths = serviceStrengths();
  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="grain relative overflow-hidden bg-ink pb-20 pt-[calc(var(--header-h)+3.5rem)] md:pb-28 md:pt-[calc(var(--header-h)+6rem)]">
        <div
          className="pointer-events-none absolute -left-40 bottom-0 size-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.05),transparent)]"
          aria-hidden
        />
        <div className="container-x relative grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-20">
          <div>
            <Reveal className="eyebrow mb-6 flex items-center gap-3 opacity-70">
              <Icon name="wrench" size={14} />
              <span>Service &amp; care · {dealership.name}</span>
            </Reveal>
            <h1 className="font-display text-display-xl text-balance">
              <HeroTitle lines={["Your bike.", "Always ready."]} />
            </h1>
            <Reveal delay={0.2}>
              <p className="mt-7 max-w-xl text-pretty text-base leading-relaxed opacity-70 md:text-lg">
                Genuine parts, trained hands and an estimate you approve before any work begins. Book in a minute, then
                watch your bike move through the workshop — live.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink href="/service/book" size="lg" icon="arrow-right" magnetic>
                  Book service
                </ButtonLink>
                <ButtonLink href="/service/track" size="lg" variant="outline">
                  Track service
                </ButtonLink>
                <ButtonLink href="/garage" size="lg" variant="ghost" icon="chevron-right" className="px-4">
                  Service history
                </ButtonLink>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.25} y={36}>
            <div className="rounded-[28px] border border-white/10 bg-ink-2/80 p-5 sm:p-8">
              <p className="eyebrow flex items-center gap-2 opacity-60">
                <span className="relative flex size-2" aria-hidden>
                  <span className="absolute inset-0 animate-ping rounded-full bg-signal/60" />
                  <span className="relative size-2 rounded-full bg-signal" />
                </span>
                Every stage, as it happens
              </p>
              <StageDots current="estimate" className="mt-7" />
              <div className="my-7 h-px bg-white/10" aria-hidden />
              <QuickTrack label="Bike already with us?" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── Service menu ───────── */}
      <section className="surface-paper py-20 md:py-32" aria-label="Service menu">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
              <SectionHeading
                index="01"
                eyebrow="Service menu"
                title={["What we", "take care of."]}
                lede="Not sure which one you need? Choose “Something else” and tell us what you've noticed — we'll take it from there."
                size="md"
              />
              <p className="mt-8 max-w-sm text-[13px] leading-relaxed opacity-55">
                Times are typical and help us plan your slot. Your service advisor confirms the work and the cost with you
                before starting.
              </p>
            </div>
            <ol className="border-t border-current/15">
              {serviceTypes.map((s, i) => (
                <Reveal as="li" key={s.id} delay={Math.min(i * 0.04, 0.2)} y={16} className="border-b border-current/15">
                  <Link
                    href={`/service/book?service=${s.id}`}
                    className="group grid grid-cols-[2.25rem_1fr_auto] items-start gap-x-3 py-6 transition-colors md:grid-cols-[3rem_1fr_9rem_2rem] md:gap-x-6 md:py-7"
                  >
                    <span className="eyebrow tabular pt-1.5 opacity-45">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0">
                      <span className="block font-display text-[1.35rem] leading-none transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1 md:text-[1.75rem]">
                        {s.name}
                      </span>
                      <span className="mt-2.5 block max-w-md text-sm leading-relaxed opacity-65">{s.description}</span>
                      <span className="mt-2 block text-[13px] tabular opacity-55 md:hidden">{durationLabel(s.durationHours)}</span>
                    </span>
                    <span className="hidden pt-1.5 text-sm tabular opacity-60 md:block">{durationLabel(s.durationHours)}</span>
                    <span className="grid size-9 place-items-center rounded-full border border-current/15 transition-colors duration-300 group-hover:border-current group-hover:bg-ink group-hover:text-paper md:size-8">
                      <Icon name="arrow-right" size={16} />
                      <span className="sr-only">Book {s.name}</span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section className="bg-ink py-20 md:py-32" aria-label="How it works">
        <div className="container-x">
          <SectionHeading index="02" eyebrow="How it works" title={["Four steps.", "No surprises."]} size="md" />
          <ol className="relative mt-14 grid gap-0 md:mt-20 md:grid-cols-4">
            <span className="absolute left-[11px] top-3 bottom-3 w-px bg-white/12 md:left-0 md:right-0 md:top-[11px] md:bottom-auto md:h-px md:w-auto" aria-hidden />
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.08} className="relative flex gap-6 pb-10 last:pb-0 md:flex-col md:gap-7 md:pb-0 md:pr-8">
                <span className="relative grid size-[23px] shrink-0 place-items-center rounded-full border border-white/25 bg-ink" aria-hidden>
                  <span className={i === 0 ? "size-2 rounded-full bg-signal" : "size-1.5 rounded-full bg-bone/60"} />
                </span>
                <div>
                  <p className="eyebrow tabular opacity-45">0{i + 1}</p>
                  <h3 className="mt-2 font-display text-display-sm">{s.title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed opacity-65">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <ul className="mt-20 grid border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {strengths.map((s, i) => (
              <li key={s.title} className={`flex gap-4 border-b border-white/10 py-6 sm:pr-6 ${i % 2 === 1 ? "sm:border-l sm:pl-6" : ""} ${i > 0 ? "lg:border-l lg:pl-6" : ""} lg:border-b-0`}>
                <Icon name={s.icon} size={20} className="mt-0.5 shrink-0 opacity-75" />
                <div>
                  <h3 className="text-[15px] font-medium">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed opacity-60">{s.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── Hours & contact ───────── */}
      <section className="surface-paper bg-paper-2 py-20 md:py-28" aria-labelledby="desk-title">
        <div className="container-x grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <p className="eyebrow mb-5 flex items-center gap-3 opacity-70">
              <span className="tabular opacity-60">03</span>
              <span className="h-px w-8 bg-current opacity-40" aria-hidden />
              <span>Service desk</span>
            </p>
            <h2 id="desk-title" className="font-display text-display-md text-balance">
              Talk to the people looking after your bike.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed opacity-70">
              Questions about a booking, a noise you&apos;ve noticed or an estimate? The service desk is a call or a message away.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CallServiceButton source="service_page" variant="dark" size="lg" />
              <WhatsAppServiceButton source="service_page" size="lg" />
            </div>
          </div>
          <dl className="grid content-start border-t border-current/15 text-sm">
            <div className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-current/15 py-5">
              <dt className="eyebrow pt-0.5 opacity-55">Workshop</dt>
              <dd className="space-y-1.5">
                {hours.map((h) => (
                  <p key={h.days} className="flex flex-wrap justify-between gap-x-4">
                    <span className="font-medium">{h.days}</span>
                    <span className="tabular opacity-75">{h.time}</span>
                  </p>
                ))}
                <p className="opacity-55">Closed on Sundays</p>
              </dd>
            </div>
            <div className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-current/15 py-5">
              <dt className="eyebrow pt-0.5 opacity-55">Service line</dt>
              <dd className="font-medium tabular">{formatPhone(dealership.phone.service)}</dd>
            </div>
            <div className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-current/15 py-5">
              <dt className="eyebrow pt-0.5 opacity-55">Address</dt>
              <dd className="leading-relaxed opacity-80">{formattedAddress}</dd>
            </div>
            {dealership.pickupDrop.available && (
              <div className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-current/15 py-5">
                <dt className="eyebrow pt-0.5 opacity-55">Pickup</dt>
                <dd className="leading-relaxed opacity-80">{dealership.pickupDrop.note ?? "Available on request, subject to availability."}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>
    </>
  );
}
