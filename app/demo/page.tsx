import { pageMetadata } from "@/lib/seo";
import { DemoSection } from "@/components/sections/DemoSection";
import { Section } from "@/components/ui/Section";
import { CodingLab } from "@/components/interactive/CodingLab";
import { SectionHeader } from "@/components/ui/Section";

export const metadata = pageMetadata({
  title: "Book a Free Demo Class",
  description: "Experience an EMC medical coding class before you enrol. Book a free, no-obligation demo.",
  path: "/demo",
});

export default function DemoPage() {
  return (
    <>
      <div className="pt-4" />
      <DemoSection id="book-demo" />
      <Section aria-labelledby="warmup">
        <div className="container-x">
          <SectionHeader id="warmup" label="While you wait" title="Warm up in the Coding Lab." intro="Try a fictional case and see how coders think." />
          <div className="mt-10">
            <CodingLab />
          </div>
        </div>
      </Section>
    </>
  );
}
