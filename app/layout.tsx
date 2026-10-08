import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { site } from "@/data/site";
import { organizationJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: "%s" },
  description: site.description,
  applicationName: site.title,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.title,
    title: site.title,
    description: site.description,
    url: "/",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-white">
        <JsonLd data={organizationJsonLd()} />
        {children}
      </body>
    </html>
  );
}
