import { pageMetadata, faqJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { CodeJourney } from "@/components/interactive/CodeJourney";
import { WhyCoding } from "@/components/sections/WhyCoding";
import { WhoFor } from "@/components/sections/WhoFor";
import { Section, SectionHeader } from "@/components/ui/Section";
import { CodingLab } from "@/components/interactive/CodingLab";
import { FAQList } from "@/components/sections/FAQList";
import { JsonLd } from "@/components/ui/JsonLd";
import { codeCategories } from "@/data/lab";
import { faqs } from "@/data/faqs";

export const metadata = pageMetadata({
  title: "What is Medical Coding?",
  description: "A plain-language introduction to medical coding: how clinical documentation becomes standardised codes, the main code sets, and who the field suits.",
  path: "/medical-coding",
});

export default function MedicalCodingPage() {
  const mcFaqs = faqs.filter((f) => f.category === "medical-coding" || f.id === "careers");
  return (
    <>
      <JsonLd data={faqJsonLd(mcFaqs)} />
      <PageHero
        label="Medical coding"
        crumbs={[{ label: "Medical coding", href: "/medical-coding" }]}
        title={<>From patient record <span className="text-blue">to standard code.</span></>}
        intro="Medical coding involves translating healthcare diagnoses, procedures and services into standardised codes used in healthcare administration, billing and related workflows. Here’s how it works — simply."
      />
      <Section aria-labelledby="codesets">
        <div className="container-x">
          <SectionHeader id="codesets" label="The main code sets" title="Three code sets, three jobs." />
          <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
            {codeCategories.map((c) => (
              <li key={c.id} className="bg-white p-8">
                <p className="code-chip inline-block rounded-md bg-ink px-2.5 py-1.5 text-[14px] text-cyan">{c.id}</p>
                <p className="mt-8 text-[20px] font-semibold tracking-tight">{c.describes}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>
      <CodeJourney />
      <WhyCoding />
      <WhoFor />
      <Section id="lab" aria-labelledby="lab2">
        <div className="container-x">
          <SectionHeader id="lab2" label="Try it" title="Practice. Code. Understand." intro="An educational simulation with fictional cases." />
          <div className="mt-10"><CodingLab /></div>
        </div>
      </Section>
      <Section tone="mist" aria-labelledby="mcfaq">
        <div className="container-x grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionHeader id="mcfaq" label="FAQ" title="Common questions." />
          <FAQList items={mcFaqs} />
        </div>
      </Section>
    </>
  );
}
