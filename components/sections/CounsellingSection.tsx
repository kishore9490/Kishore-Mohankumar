import { LeadForm } from "@/components/forms/LeadForm";
import { Section } from "@/components/ui/Section";
import { WhatsAppInline } from "@/components/ui/WhatsAppInline";

export function CounsellingSection() {
  return (
    <Section id="counselling" aria-labelledby="counsel-title">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="label flex items-center gap-2">
            <span className="inline-block h-px w-6 bg-cyan" aria-hidden="true" /> Counselling
          </p>
          <h2 id="counsel-title" className="heading mt-5 text-[38px] sm:text-5xl lg:text-[60px]">
            Not sure where to start?
          </h2>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-muted">
            Tell us a little about yourself. We’ll help you understand the right learning path — honestly, including if
            medical coding isn’t the right fit.
          </p>
          <WhatsAppInline intent="eligibility" label="Ask about eligibility on WhatsApp" className="mt-8" />
        </div>
        <div className="rounded-2xl border border-line bg-mist/60 p-6 md:p-9">
          <LeadForm variant="counselling" />
        </div>
      </div>
    </Section>
  );
}
