import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const layers = [
  { k: "Training", d: "Structured modules from medical foundations to the major code sets.", who: "EMC" },
  { k: "Assessment", d: "Checkpoints, mock tests and a final evaluation that measure real skill.", who: "EMC" },
  { k: "Course certificate", d: "Issued by EMC on completion of a program, as confirmed for each program.", who: "EMC" },
  { k: "Professional certification", d: "Awarded by independent professional bodies through their own exams. EMC can guide your preparation — it does not award these.", who: "External body" },
  { k: "Professional development", d: "Code sets and guidelines evolve; good coders keep learning.", who: "You" },
];

export function Certification() {
  return (
    <Section aria-labelledby="cert-title">
      <div className="container-x grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <SectionHeader
          id="cert-title"
          label="Certification"
          title={<>Build credible skills.</>}
          intro="Credentials matter — and so does clarity about who issues them. Here’s how the layers fit together."
        >
          <div className="mt-8 rounded-xl border-l-2 border-cyan bg-mist px-5 py-4 text-[14px] leading-relaxed text-ink/85">
            An EMC course-completion certificate is not the same as an external professional certification. We will always
            tell you exactly which one a program includes or prepares you for.
          </div>
        </SectionHeader>
        <ol className="relative">
          {layers.map((l, i) => (
            <Reveal as="li" key={l.k} delay={i * 0.06} className="relative grid grid-cols-[44px_1fr_auto] items-start gap-4 border-t border-line py-6 last:border-b">
              <span className="font-mono text-[12px] text-muted">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-[19px] font-semibold tracking-tight">{l.k}</p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{l.d}</p>
              </div>
              <span
                className={`label !text-[10px] mt-1 rounded-full px-2.5 py-1 ${
                  l.who === "EMC" ? "bg-ink !text-white" : l.who === "External body" ? "border border-blue/40 !text-blue" : "bg-soft !text-ink"
                }`}
              >
                {l.who}
              </span>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
