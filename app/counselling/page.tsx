import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { LeadForm } from "@/components/forms/LeadForm";
import { WhatsAppInline } from "@/components/ui/WhatsAppInline";
import { Icon } from "@/components/ui/Icon";
import { getProgram } from "@/data/programs";

export const metadata = pageMetadata({
  title: "Free Career Counselling",
  description: "Not sure where to start? Talk to an EMC counsellor about medical coding, eligibility and the right learning path for you.",
  path: "/counselling",
});

const expect = [
  "An honest view of whether medical coding fits your background",
  "Which program — if any — suits you",
  "Duration, mode, fees and batch details",
  "Answers to anything you’re unsure about",
];

export default async function CounsellingPage({ searchParams }: { searchParams: Promise<{ program?: string; topic?: string }> }) {
  const { program, topic } = await searchParams;
  const p = program ? getProgram(program) : undefined;
  const interest = topic === "eligibility" ? "Checking my eligibility" : topic === "fees" ? "Fees & payment options" : undefined;
  return (
    <>
      <PageHero
        label="Counselling"
        crumbs={[{ label: "Counselling", href: "/counselling" }]}
        title={<>Not sure where <span className="text-blue">to start?</span></>}
        intro="Tell us a little about yourself. We’ll help you understand the right learning path."
      />
      <section className="py-16 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="label">In your session</p>
            <ul className="mt-6 space-y-4">
              {expect.map((e) => (
                <li key={e} className="flex gap-3 text-[16px] leading-relaxed">
                  <Icon name="check" size={18} className="mt-1 shrink-0 text-cyan-ink" /> {e}
                </li>
              ))}
            </ul>
            {p && <p className="mt-8 rounded-xl bg-mist px-4 py-3 text-[14px]">You’re asking about: <strong>{p.name}</strong></p>}
            <WhatsAppInline intent="counsellor" label="Prefer WhatsApp? Message us" className="mt-8" />
          </div>
          <div className="rounded-2xl border border-line bg-mist/60 p-6 md:p-9">
            <LeadForm variant="counselling" defaultInterest={interest} defaultProgram={p?.slug} />
          </div>
        </div>
      </section>
    </>
  );
}
