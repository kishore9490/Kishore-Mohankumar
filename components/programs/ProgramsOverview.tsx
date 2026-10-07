import { programs } from "@/data/programs";
import { curriculum } from "@/data/curriculum";
import { Section, SectionHeader } from "@/components/ui/Section";
import { StatusNote } from "@/components/ui/StatusNote";
import { Reveal } from "@/components/ui/Reveal";
import { CurriculumMap } from "@/components/curriculum/CurriculumMap";
import { ProgramCard } from "./ProgramCard";

export function ProgramsOverview() {
  return (
    <Section id="programs" aria-labelledby="programs-title">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeader
            id="programs-title"
            label="Programs & curriculum"
            title={<>Learn with <span className="text-blue">purpose.</span></>}
            intro="Every module builds on the last — from the language of medicine to coding complete cases. Select a stage to see what you’ll actually study."
          />
        </div>
        <div className="mt-14">
          <CurriculumMap modules={curriculum} />
          <StatusNote className="mt-6">
            Indicative learning path. The confirmed syllabus for each program is shared during counselling.
          </StatusNote>
        </div>

        <div className="mt-20 grid gap-5 md:grid-cols-2">
          {programs.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}>
              <ProgramCard p={p} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
