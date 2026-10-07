import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionHeader } from "@/components/ui/Section";
import { CareerPath } from "@/components/career/CareerPath";
import { CareerRoles } from "@/components/career/CareerRoles";
import { CareerQuiz } from "@/components/interactive/CareerQuiz";
import { StatusNote } from "@/components/ui/StatusNote";
import { DemoSection } from "@/components/sections/DemoSection";

export const metadata = pageMetadata({
  title: "Medical Coding Career Pathways",
  description: "Potential career pathways in medical coding — the roles involved, the skills they need, and how learning builds towards them.",
  path: "/career",
});

export default function CareerPage() {
  return (
    <>
      <PageHero
        label="Career"
        crumbs={[{ label: "Career", href: "/career" }]}
        title={<>Where can this <span className="text-blue">take you?</span></>}
        intro="Potential career pathways in and around medical coding. Outcomes depend on your skills, experience, certification and the job market — we will never promise a job or a salary."
      />
      <Section aria-label="Career pathway">
        <div className="container-x"><CareerPath /></div>
      </Section>
      <Section tone="mist" aria-labelledby="roles">
        <div className="container-x">
          <SectionHeader id="roles" label="Roles may include" title="Explore the roles." intro="Select a role to see what it involves, typical skills, what to learn and potential next steps." />
          <div className="mt-12"><CareerRoles /></div>
          <StatusNote className="mt-8">Role list is indicative and will be aligned to EMC’s confirmed curriculum. Many roles require experience beyond a training program.</StatusNote>
        </div>
      </Section>
      <Section aria-labelledby="cq">
        <div className="container-x grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionHeader id="cq" label="Self-check" title="Is medical coding right for you?" />
          <CareerQuiz />
        </div>
      </Section>
      <DemoSection />
    </>
  );
}
