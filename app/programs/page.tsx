import { programs } from "@/data/programs";
import { curriculum } from "@/data/curriculum";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { CurriculumMap } from "@/components/curriculum/CurriculumMap";
import { Section, SectionHeader } from "@/components/ui/Section";
import { StatusNote } from "@/components/ui/StatusNote";
import { ButtonLink } from "@/components/ui/Button";
import { DemoSection } from "@/components/sections/DemoSection";
import { cn } from "@/lib/cn";
import Link from "next/link";

export const metadata = pageMetadata({
  title: "Medical Coding Programs",
  description: "Explore EMC's medical coding programs for beginners and for learners who want to upskill — curriculum, learning outcomes and how to enrol.",
  path: "/programs",
});

const filters = [
  { key: "all", label: "All programs" },
  { key: "beginner", label: "Start a career" },
  { key: "advanced", label: "Upskill" },
];

export default async function ProgramsPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const { level = "all" } = await searchParams;
  const list = level === "all" ? programs : programs.filter((p) => p.audience === level || p.audience === "all");
  return (
    <>
      <PageHero
        label="Programs"
        crumbs={[{ label: "Programs", href: "/programs" }]}
        title={<>Choose where <span className="text-blue">you begin.</span></>}
        intro="Two clear starting points — one for learners new to medical coding, one for those who want to go deeper. Not sure? A counsellor will help you decide."
      >
        <nav aria-label="Filter programs" className="mt-10 flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/programs" : `/programs?level=${f.key}`}
              aria-current={level === f.key ? "page" : undefined}
              className={cn(
                "rounded-full border px-4 py-2 text-[14px] font-medium transition-colors",
                level === f.key ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink",
              )}
            >
              {f.label}
            </Link>
          ))}
          <Link href="/counselling" className="rounded-full px-4 py-2 text-[14px] font-medium text-blue">Get guidance →</Link>
        </nav>
      </PageHero>

      <Section>
        <div className="container-x">
          <div className={cn("grid gap-5", list.length > 1 && "md:grid-cols-2")}>
            {list.map((p) => (
              <ProgramCard key={p.slug} p={p} index={programs.indexOf(p)} />
            ))}
          </div>
          <StatusNote className="mt-6">
            Program names, structure and details are indicative and will be confirmed by EMC. Duration, mode and fees are shared during counselling.
          </StatusNote>
        </div>
      </Section>

      <Section tone="mist" aria-labelledby="map-title">
        <div className="container-x">
          <SectionHeader id="map-title" label="Curriculum map" title="What you’ll actually study." intro="Select any stage to see its objective and an example." />
          <div className="mt-12">
            <CurriculumMap modules={curriculum} />
          </div>
          <div className="mt-12">
            <ButtonLink href="/counselling" variant="outline">Ask which program fits you</ButtonLink>
          </div>
        </div>
      </Section>
      <DemoSection />
    </>
  );
}
