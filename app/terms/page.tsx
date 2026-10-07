import { pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/ui/LegalPage";
export const metadata = pageMetadata({ title: "Terms of Use", path: "/terms" });
export default function Page() {
  return (
    <LegalPage
      title="Terms of Use"
      path="/terms"
      sections={[
        { h: "Use of this website", p: "This website provides information about EMC’s educational programs. Content may change as programs are updated." },
        { h: "Program information", p: "Program details, schedules and fees are confirmed at the time of admission. Information on this website is indicative unless stated otherwise." },
        { h: "Intellectual property", p: "Website content is owned by EMC unless otherwise noted. CPT® is a registered trademark of the American Medical Association. Other names may be trademarks of their respective owners." },
        { h: "Interactive tools", p: "The Coding Lab, Code Journey and self-check are educational illustrations using fictional data. They are not professional coding tools or advice." },
      ]}
    />
  );
}
