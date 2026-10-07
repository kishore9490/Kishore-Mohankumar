import { pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/ui/LegalPage";
export const metadata = pageMetadata({ title: "Privacy Policy", path: "/privacy" });
export default function Page() {
  return (
    <LegalPage
      title="Privacy Policy"
      path="/privacy"
      sections={[
        { h: "What we collect", p: "When you submit a form we collect the details you provide — such as your name, phone number, email, educational background and preferences — so we can respond to your request." },
        { h: "How we use it", p: "We use your details only to respond to your enquiry, arrange demo classes or counselling, and share information about programs you asked about. We do not sell your personal data." },
        { h: "How we contact you", p: "With your consent, we may contact you by phone, WhatsApp or email. You can ask us to stop at any time." },
        { h: "Analytics", p: "We may use privacy-respecting analytics to understand how the website is used, such as which pages are visited and which forms are started." },
        { h: "Your choices", p: "You may request access to, correction of, or deletion of your personal data by contacting EMC." },
      ]}
    />
  );
}
