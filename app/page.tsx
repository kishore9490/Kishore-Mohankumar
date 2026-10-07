import { Hero } from "@/components/hero/Hero";
import { PathChooser } from "@/components/sections/PathChooser";
import { CodeJourney } from "@/components/interactive/CodeJourney";
import { WhyCoding } from "@/components/sections/WhyCoding";
import { WhoFor } from "@/components/sections/WhoFor";
import { ProgramsOverview } from "@/components/programs/ProgramsOverview";
import { LearningExperience } from "@/components/sections/LearningExperience";
import { CodingLab } from "@/components/interactive/CodingLab";
import { CareerPath } from "@/components/career/CareerPath";
import { CareerRoles } from "@/components/career/CareerRoles";
import { FacultyGrid } from "@/components/faculty/FacultyGrid";
import { Certification } from "@/components/sections/Certification";
import { StudentJourney } from "@/components/sections/StudentJourney";
import { CareerQuiz } from "@/components/interactive/CareerQuiz";
import { DemoSection } from "@/components/sections/DemoSection";
import { CounsellingSection } from "@/components/sections/CounsellingSection";
import { Testimonials } from "@/components/sections/Testimonials";
import { Stats } from "@/components/sections/Stats";
import { FAQList } from "@/components/sections/FAQList";
import { InsightCard } from "@/components/sections/InsightCard";
import { AboutTeaser } from "@/components/sections/AboutTeaser";
import { CampusPreview } from "@/components/student/CampusPreview";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { StatusNote } from "@/components/ui/StatusNote";
import { JsonLd } from "@/components/ui/JsonLd";
import { faqs } from "@/data/faqs";
import { insights } from "@/data/insights";
import { faqJsonLd } from "@/lib/seo";

export default function Home() {
  const homeFaqs = faqs.slice(0, 8);
  return (
    <>
      <Hero />
      <PathChooser />
      <CodeJourney />
      <Stats />
      <WhyCoding />
      <WhoFor />
      <ProgramsOverview />
      <LearningExperience />

      {/* MEDICAL CODING LAB */}
      <Section id="lab" aria-labelledby="lab-title" className="overflow-hidden">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeader
              id="lab-title"
              label="The coding lab"
              title={<>Practice. Code. <span className="text-blue">Understand.</span></>}
              intro="A simulated coding workspace. Pick a fictional case, choose the code set, find the details that matter, then assign and submit your code."
            />
            <StatusNote className="max-w-xs lg:mb-2">Educational simulation with fictional cases — not a clinical coding tool.</StatusNote>
          </div>
          <div className="mt-12">
            <CodingLab />
          </div>
        </div>
      </Section>

      {/* CAREER */}
      <Section tone="mist" id="career" aria-labelledby="career-title">
        <div className="container-x">
          <SectionHeader
            id="career-title"
            label="Potential career pathways"
            title={<>Where can this <span className="text-blue">take you?</span></>}
            intro="Every career is different. This is a common progression — your own path depends on your skills, experience, certification and the job market."
          />
          <div className="mt-16">
            <CareerPath />
          </div>
          <div className="mt-24">
            <h3 className="heading text-[28px] md:text-[36px]">Roles may include…</h3>
            <p className="mt-3 max-w-xl text-[15.5px] text-muted">Select a role to see what it involves and what to learn.</p>
            <div className="mt-10">
              <CareerRoles />
            </div>
          </div>
          <StatusNote className="mt-8">EMC does not guarantee employment, placement or salary outcomes.</StatusNote>
        </div>
      </Section>

      {/* FACULTY */}
      <Section aria-labelledby="faculty-title">
        <div className="container-x">
          <SectionHeader
            id="faculty-title"
            label="Faculty"
            title={<>Learn from people who <span className="text-blue">know the field.</span></>}
          />
          <div className="mt-12">
            <FacultyGrid />
          </div>
        </div>
      </Section>

      <Certification />
      <StudentJourney />

      {/* DIGITAL CAMPUS */}
      <Section aria-labelledby="campus-title" className="overflow-hidden">
        <div className="container-x grid items-center gap-14 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <SectionHeader
              id="campus-title"
              label="Digital campus"
              title="Your learning space."
              intro="Progress, current module, practice cases, assessments, sessions and certificates — in one calm, focused place."
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/login" variant="outline">Student login</ButtonLink>
            </div>
            <StatusNote className="mt-6">Concept preview. The student dashboard will connect to EMC’s learning platform.</StatusNote>
          </div>
          <CampusPreview className="lg:-mr-24" />
        </div>
      </Section>

      {/* QUIZ */}
      <Section tone="mist" id="quiz" aria-labelledby="quiz-title">
        <div className="container-x grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionHeader
            id="quiz-title"
            label="Self-check"
            title={<>Is medical coding right for you?</>}
            intro="Six quick questions. An honest, personalised suggestion for your next step."
          />
          <CareerQuiz />
        </div>
      </Section>

      <DemoSection />
      <Testimonials />
      <CounsellingSection />

      {/* FAQ */}
      <Section tone="mist" aria-labelledby="faq-title">
        <JsonLd data={faqJsonLd(homeFaqs)} />
        <div className="container-x grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionHeader id="faq-title" label="FAQ" title="Questions, answered." intro="Can’t find yours? Ask a counsellor — it’s free.">
            <ButtonLink href="/counselling" variant="outline" className="mt-8">Ask a question</ButtonLink>
          </SectionHeader>
          <FAQList items={homeFaqs} />
        </div>
      </Section>

      {/* INSIGHTS */}
      <Section aria-labelledby="insights-title">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeader id="insights-title" label="EMC Insights" title="Understand the field." />
            <ButtonLink href="/insights" variant="outline">All insights</ButtonLink>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
            {insights.slice(0, 3).map((p, i) => (
              <InsightCard key={p.slug} post={p} featured={i === 0} />
            ))}
          </div>
        </div>
      </Section>

      <AboutTeaser />
    </>
  );
}
