import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { FacultyGrid } from "@/components/faculty/FacultyGrid";
import { DemoSection } from "@/components/sections/DemoSection";

export const metadata = pageMetadata({
  title: "Faculty",
  description: "Meet the faculty who teach medical coding at EMC — Experts Medical Coding Academy.",
  path: "/faculty",
});

export default function FacultyPage() {
  return (
    <>
      <PageHero
        label="Faculty"
        crumbs={[{ label: "Faculty", href: "/faculty" }]}
        title={<>Learn from people who <span className="text-blue">know the field.</span></>}
        intro="Every profile on this page is verified by EMC before it is published."
      />
      <section className="py-16 md:py-24">
        <div className="container-x"><FacultyGrid /></div>
      </section>
      <DemoSection />
    </>
  );
}
