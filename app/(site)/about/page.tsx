import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Certification } from "@/components/sections/Certification";
import { StudentJourney } from "@/components/sections/StudentJourney";
import { DemoSection } from "@/components/sections/DemoSection";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = pageMetadata({
  title: "About EMC — Why EMC Exists",
  description: "EMC — Experts Medical Coding Academy helps learners understand the healthcare information workflow and build practical medical coding skills.",
  path: "/about",
});

/** Replace `story` with EMC's own founding story when supplied. */
const story = [
  "Healthcare is becoming increasingly dependent on structured information.",
  "Behind every patient record, diagnosis and healthcare transaction is a complex information workflow — and people who understand both the clinical language and the rules that turn it into standard codes.",
  "EMC exists to help learners understand that world and develop practical medical coding skills: step by step, case by case, with honest guidance about where those skills can lead.",
];

const principles = [
  { k: "Clarity over claims", d: "We publish only what we can verify — no invented statistics, testimonials or guarantees." },
  { k: "Practice over theory", d: "Coding is learned by coding. Every concept is anchored to a case." },
  { k: "Guidance over selling", d: "If medical coding isn’t right for you, we’ll tell you." },
  { k: "Learning that continues", d: "Code sets evolve; we teach habits that keep you current." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero label="About EMC" crumbs={[{ label: "About", href: "/about" }]} title={<>Why EMC <span className="text-blue">exists.</span></>} />
      <section className="py-20 md:py-32">
        <div className="container-x max-w-5xl space-y-10">
          {story.map((s, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <p className={i === 0 ? "heading text-3xl md:text-5xl" : "text-[20px] leading-relaxed text-muted md:text-[26px]"}>{s}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <Section tone="mist" aria-labelledby="principles">
        <div className="container-x">
          <SectionHeader id="principles" label="What we stand for" title="How we teach." />
          <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
            {principles.map((p, i) => (
              <li key={p.k} className="bg-white p-8 md:p-10">
                <span className="font-mono text-[12px] text-cyan-ink">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-6 text-[24px] font-semibold tracking-tight">{p.k}</p>
                <p className="mt-2 text-[15.5px] text-muted">{p.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>
      <Certification />
      <StudentJourney />
      <DemoSection />
    </>
  );
}
