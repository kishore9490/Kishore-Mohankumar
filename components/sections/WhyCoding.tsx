import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const reasons = [
  { k: "01", t: "Healthcare meets technology", d: "Work at the intersection of clinical knowledge and structured data — the information layer behind modern healthcare." },
  { k: "02", t: "A structured career path", d: "Clear skills, clear standards. Progress is built on accuracy, experience and continued learning." },
  { k: "03", t: "A specialised skill", d: "Reading clinical documentation and applying code sets correctly is a focused skill that takes real training." },
  { k: "04", t: "A global ecosystem", d: "Standard code sets are used across healthcare systems and organisations that serve them." },
  { k: "05", t: "Continuous learning", d: "Code sets and guidelines are updated regularly — so the work stays intellectually active." },
  { k: "06", t: "Room to grow", d: "With experience, paths may extend into specialisation, quality review, training or leadership." },
];

export function WhyCoding() {
  return (
    <Section aria-labelledby="why-title">
      <div className="container-x grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeader
            id="why-title"
            label="Why medical coding"
            title={<>A real career,<br />built on precision.</>}
            intro="Medical coding suits people who enjoy understanding how things work, reading carefully and getting details right. Here’s why many choose it."
          />
          <p className="mt-8 max-w-sm text-[13px] leading-relaxed text-muted">
            Outcomes depend on your skills, effort, certification and the job market. We will never promise a job or
            a salary — we’ll help you build the skills.
          </p>
        </div>
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {reasons.map((r, i) => (
            <Reveal as="li" key={r.k} delay={(i % 2) * 0.06} className="group bg-white p-7 md:p-8">
              <span className="font-mono text-[12px] text-cyan-ink">{r.k}</span>
              <h3 className="mt-8 text-[21px] font-semibold tracking-tight">{r.t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{r.d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
