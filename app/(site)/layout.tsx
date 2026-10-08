import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { WhatsAppWidget } from "@/components/layout/WhatsAppWidget";

/** Public website chrome. Unchanged from the original root layout. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <MobileActionBar />
      <WhatsAppWidget />
    </>
  );
}
