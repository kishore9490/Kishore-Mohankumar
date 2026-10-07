import { pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/ui/LegalPage";
export const metadata = pageMetadata({ title: "Disclaimer", path: "/disclaimer" });
export default function Page() {
  return (
    <LegalPage
      title="Disclaimer"
      path="/disclaimer"
      sections={[
        { h: "Education, not healthcare", p: "EMC is an education provider. We do not provide medical advice, diagnosis or treatment, and this website is not a healthcare service." },
        { h: "Fictional cases", p: "All patient cases, records and codes shown on this website are fictional and for learning purposes only. Real-world code assignment depends on complete documentation, the current code-set edition, payer rules and official guidelines." },
        { h: "No guarantees", p: "EMC does not guarantee employment, placement, salary or the outcome of any external examination. Career outcomes depend on individual effort, skills, experience and market conditions." },
        { h: "Certification", p: "An EMC course-completion certificate is issued by EMC. Professional certifications are awarded only by independent professional bodies through their own processes." },
      ]}
    />
  );
}
