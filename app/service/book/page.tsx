import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
import { HeroTitle } from "@/components/service/HeroTitle";
import { ServiceBookingFlow } from "@/components/service/ServiceBookingFlow";
import { CallServiceButton, WhatsAppServiceButton } from "@/components/service/ServiceActions";
import { workshopHours } from "@/components/service/utils";
import { dealership } from "@/data/dealership";

export const metadata: Metadata = {
  title: "Book a service",
  description: `Book a Honda service at ${dealership.name} in about a minute — choose your service, day and time${dealership.pickupDrop.available ? ", with optional pickup & drop" : ""}.`,
  alternates: { canonical: "/service/book" },
  openGraph: { title: `Book a service · ${dealership.name}`, url: "/service/book" },
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function BookServicePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const reg = first(sp.reg)?.slice(0, 16) ?? "";
  const service = first(sp.service);
  const hours = workshopHours();

  const promises = [
    { icon: "phone" as const, text: "We call to confirm your slot — usually within working hours." },
    { icon: "receipt" as const, text: "You approve the estimate before any work begins." },
    { icon: "clock" as const, text: "Track every stage live until it's ready." },
  ];

  return (
    <section className="relative bg-ink pb-16 pt-[calc(var(--header-h)+2.5rem)] md:pb-28 md:pt-[calc(var(--header-h)+4.5rem)]">
      <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        <header className="lg:sticky lg:top-[calc(var(--header-h)+3rem)] lg:self-start">
          <p className="eyebrow mb-5 flex items-center gap-3 opacity-70">
            <Icon name="wrench" size={14} />
            Service booking
          </p>
          <h1 className="font-display text-display-lg">
            <HeroTitle lines={["Book a", "service."]} />
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed opacity-70 md:text-lg">Four short steps. About a minute. We&apos;ll take it from there.</p>

          <ul className="mt-10 hidden flex-col border-t border-white/10 lg:flex">
            {promises.map((p) => (
              <li key={p.text} className="flex gap-4 border-b border-white/10 py-4 text-sm leading-relaxed">
                <Icon name={p.icon} size={18} className="mt-0.5 shrink-0 opacity-60" />
                <span className="opacity-75">{p.text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 hidden text-sm lg:block">
            {hours.map((h) => (
              <p key={h.days} className="opacity-60">
                Workshop {h.days}, {h.time}
              </p>
            ))}
            <div className="mt-5 flex flex-wrap gap-2.5">
              <CallServiceButton source="service_book_aside" size="sm" label="Prefer to call?" />
              <WhatsAppServiceButton source="service_book_aside" size="sm" />
            </div>
          </div>
        </header>

        <div className="surface-paper -mx-5 rounded-t-[28px] px-5 pb-6 pt-7 sm:mx-0 sm:rounded-[28px] sm:p-8 md:p-12">
          <ServiceBookingFlow initialRegistration={reg} initialServiceId={service} />
        </div>

        <div className="text-sm lg:hidden">
          <ul className="flex flex-col border-t border-white/10">
            {promises.map((p) => (
              <li key={p.text} className="flex gap-4 border-b border-white/10 py-4 leading-relaxed">
                <Icon name={p.icon} size={18} className="mt-0.5 shrink-0 opacity-60" />
                <span className="opacity-75">{p.text}</span>
              </li>
            ))}
          </ul>
          {hours.map((h) => (
            <p key={h.days} className="mt-6 opacity-60">
              Workshop {h.days}, {h.time} · Closed on Sundays
            </p>
          ))}
          <div className="mt-4 flex flex-wrap gap-2.5">
            <CallServiceButton source="service_book_aside" size="sm" label="Prefer to call?" />
            <WhatsAppServiceButton source="service_book_aside" size="sm" />
          </div>
        </div>
      </div>
    </section>
  );
}
