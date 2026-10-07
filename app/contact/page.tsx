import type { Metadata } from "next";
import { DealershipSection } from "@/components/dealership/DealershipSection";
import { ContactForm } from "@/components/dealership/ContactForm";
import { dealership, formattedAddress } from "@/data/dealership";

export const metadata: Metadata = {
  title: "Contact & directions",
  description: `Visit ${dealership.name}, ${formattedAddress}. Opening hours, directions, sales and service phone numbers and WhatsApp.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <DealershipSection hero headingAs="h1" index="01" />
      <section aria-labelledby="write-title" className="surface-paper py-16 md:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-5 flex items-center gap-3 opacity-60">
              <span className="tabular">02</span>
              <span className="h-px w-8 bg-current opacity-40" aria-hidden />
              <span>Ask us anything</span>
            </p>
            <h2 id="write-title" className="font-display text-display-md">
              Leave a number.
              <br />
              We&rsquo;ll call you.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed opacity-65">
              Questions about a model, a service, finance or anything else — tell us what it&rsquo;s about and the right person
              will call you back during showroom hours.
            </p>
          </div>
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
