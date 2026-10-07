import type { Metadata } from "next";
import { site } from "@/data/site";
import type { FAQ, Program } from "./types";

export function pageMetadata({
  title,
  description = site.description,
  path = "/",
}: {
  title?: string;
  description?: string;
  path?: string;
}): Metadata {
  const fullTitle = title ? `${title} · EMC` : site.title;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: path },
    openGraph: { title: fullTitle, description, url: path, siteName: site.title, type: "website", locale: "en_IN" },
    twitter: { card: "summary_large_image", title: fullTitle, description },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    description: site.description,
    ...(site.contact.email ? { email: site.contact.email } : {}),
    ...(site.contact.phone ? { telephone: site.contact.phone } : {}),
    ...(site.contact.address ? { address: site.contact.address } : {}),
  };
}

export function courseJsonLd(p: Program) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: p.name,
    description: p.summary,
    provider: { "@type": "EducationalOrganization", name: site.legalName, sameAs: site.url },
    url: `${site.url}/programs/${p.slug}`,
  };
}

/** Only confirmed answers go into FAQ schema. */
export function faqJsonLd(items: FAQ[]) {
  const answered = items.filter((f) => f.answer);
  if (!answered.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: answered.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
