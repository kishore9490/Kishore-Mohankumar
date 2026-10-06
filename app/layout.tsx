import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { profile } from "@/data/profile";
import "./globals.css";

const display = Inter_Tight({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display-family", display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body-family", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-mono-family", display: "swap" });

const title = "Kishore Mohankumar — Cloud Architect, Product Builder & AI Entrepreneur";
const description =
  "Kishore Mohankumar is a cloud architect, technology builder and AI entrepreneur building products, infrastructure and digital businesses.";

export const metadata: Metadata = {
  metadataBase: new URL(profile.url),
  title,
  description,
  applicationName: "Kishore Mohankumar",
  authors: [{ name: "Kishore Mohankumar", url: profile.url }],
  creator: "Kishore Mohankumar",
  keywords: ["Kishore Mohankumar", "Cloud Architect", "Product Builder", "AI Entrepreneur", "Azure", "AI products", "Automation", "AI Studio Craft", "Infinitia Hub"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: "Kishore Mohankumar",
    title,
    description,
    firstName: "Kishore",
    lastName: "Mohankumar",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Kishore Mohankumar — I build things that move." }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kishore Mohankumar",
  url: profile.url,
  image: `${profile.url}/media/portrait.jpg`,
  jobTitle: profile.roles.join(", "),
  description,
  knowsAbout: profile.technologies.map((t) => t.label),
  sameAs: [profile.social.linkedin, profile.social.github].filter(Boolean),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <link rel="preload" as="image" href="/media/portrait-cutout.webp" media="(min-width: 768px)" fetchPriority="high" />
        <link rel="preload" as="image" href="/media/portrait-cutout-720.webp" media="(max-width: 767px)" fetchPriority="high" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
