import { dealership, formattedAddress } from "@/data/dealership";
import { site } from "@/lib/site";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const dayMap: Record<string, string[]> = {
  "Mon – Sat": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  Sunday: ["Sunday"],
};

/** MotorcycleDealer (a schema.org AutomotiveBusiness) — factual fields only. */
export function dealerJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MotorcycleDealer",
    "@id": `${site.url}/#dealer`,
    name: dealership.name,
    url: site.url,
    telephone: dealership.phone.sales,
    email: dealership.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: [dealership.address.line1, dealership.address.line2].filter(Boolean).join(", "),
      addressLocality: dealership.address.city,
      addressRegion: dealership.address.state,
      postalCode: dealership.address.pincode,
      addressCountry: "IN",
    },
    geo: { "@type": "GeoCoordinates", latitude: dealership.geo.lat, longitude: dealership.geo.lng },
    hasMap: dealership.mapsUrl,
    brand: { "@type": "Brand", name: "Honda" },
    openingHoursSpecification: dealership.hours.showroom.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dayMap[h.days] ?? [],
      opens: h.open,
      closes: h.close,
    })),
    description: `${dealership.descriptor}. ${formattedAddress}.`,
  };
}
