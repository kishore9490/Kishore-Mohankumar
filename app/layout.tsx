import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileNav } from "@/components/layout/MobileNav";
import { LeadProvider } from "@/components/leads/LeadProvider";
import { JsonLd, dealerJsonLd } from "@/components/layout/JsonLd";
import { site } from "@/lib/site";
import "./fonts.css";
import "./globals.css";

/** Latin subsets used above the fold — preloaded so headlines render in the right face first time. */
const preloadFonts = ["/fonts/inter-7.woff2", "/fonts/archivo-3.woff2", "/fonts/jetbrains-mono-6.woff2"];

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Honda scooters & motorcycles`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — Your next ride starts here`,
    description: site.description,
    locale: "en_IN",
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        {preloadFonts.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-bone focus:px-5 focus:py-3 focus:text-ink"
        >
          Skip to content
        </a>
        <LeadProvider>
          <SiteHeader />
          <main id="main" className="pb-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] lg:pb-0">
            {children}
          </main>
          <SiteFooter />
          <MobileNav />
        </LeadProvider>
        <JsonLd data={dealerJsonLd()} />
      </body>
    </html>
  );
}
