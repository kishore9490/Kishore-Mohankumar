import { pageMetadata } from "@/lib/seo";
import { site } from "@/data/site";
import { PageHero } from "@/components/ui/PageHero";
import { LeadForm } from "@/components/forms/LeadForm";
import { ContactLinks } from "@/components/layout/ContactLinks";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = pageMetadata({
  title: "Contact EMC",
  description: "Contact EMC — Experts Medical Coding Academy for course enquiries, demo classes and counselling.",
  path: "/contact",
});

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ program?: string }> }) {
  const { program } = await searchParams;
  return (
    <>
      <PageHero label="Contact" crumbs={[{ label: "Contact", href: "/contact" }]} title="Let’s talk." intro="Ask about programs, fees, batches or anything else. We usually respond by phone or WhatsApp." />
      <section className="py-16 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="label">Reach us</p>
            <div className="mt-6"><ContactLinks /></div>
            {site.contact.hours && <p className="mt-6 text-[14px] text-muted">{site.contact.hours}</p>}
            <div className="mt-10 grid gap-3">
              <ButtonLink href="/demo" variant="outline">Book a free demo</ButtonLink>
              <ButtonLink href="/counselling" variant="ghost" icon={null}>Free counselling</ButtonLink>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-mist/60 p-6 md:p-9">
            <LeadForm variant="contact" defaultProgram={program} />
          </div>
        </div>
      </section>
    </>
  );
}
