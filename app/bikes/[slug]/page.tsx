import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bikes, categoryLabels, getBike, startingPrice } from "@/data/bikes";
import { site } from "@/lib/site";
import { formatINR } from "@/lib/format";
import { JsonLd } from "@/components/layout/JsonLd";
import { BikeConfigProvider } from "@/components/bikes/product/ConfigContext";
import { ProductHero } from "@/components/bikes/product/ProductHero";
import { WhyThisBike } from "@/components/bikes/product/WhyThisBike";
import { SpecSheet } from "@/components/bikes/product/SpecSheet";
import { Configurator } from "@/components/bikes/product/Configurator";
import { FinanceTeaser } from "@/components/bikes/product/FinanceTeaser";
import { RelatedBikes } from "@/components/bikes/product/RelatedBikes";
import { FeelTheRide } from "@/components/bikes/product/FeelTheRide";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return bikes.map((b) => ({ slug: b.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bike = getBike(slug);
  if (!bike) return {};
  const title = `Honda ${bike.name} — price, specs & test ride`;
  const description = `${bike.tagline} Honda ${bike.name} from ${formatINR(startingPrice(bike))} ex-showroom (indicative). Explore colours, variants and specifications, estimate your EMI and book a test ride at ${site.name}.`;
  return {
    title,
    description,
    alternates: { canonical: `/bikes/${bike.slug}` },
    openGraph: {
      title: `${title} · ${site.name}`,
      description,
      url: `/bikes/${bike.slug}`,
      type: "website",
      ...(bike.heroImage ? { images: [{ url: bike.heroImage, alt: `Honda ${bike.name}` }] } : {}),
    },
  };
}

function productJsonLd(slug: string) {
  const bike = getBike(slug)!;
  const prices = bike.variants.map((v) => v.exShowroom);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Honda ${bike.name}`,
    brand: { "@type": "Brand", name: "Honda" },
    category: categoryLabels[bike.category],
    description: bike.story,
    url: `${site.url}/bikes/${bike.slug}`,
    ...(bike.heroImage ? { image: `${site.url}${bike.heroImage}` } : {}),
    ...(site.publishPricingSchema
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "INR",
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
            offerCount: bike.variants.length,
            seller: { "@id": `${site.url}/#dealer` },
          },
        }
      : {}),
  };
}

export default async function BikePage({ params }: Props) {
  const { slug } = await params;
  const bike = getBike(slug);
  if (!bike) notFound();

  return (
    <BikeConfigProvider bike={bike}>
      <ProductHero />
      <WhyThisBike index="01" />
      <SpecSheet bike={bike} index="02" />
      <Configurator index="03" />
      <FinanceTeaser bike={bike} />
      <RelatedBikes bike={bike} index="04" />
      <FeelTheRide bike={bike} />
      {/* room for the mobile quick-action bar so it never hides the last content */}
      <div className="h-16 bg-ink lg:hidden" aria-hidden />
      <JsonLd data={productJsonLd(bike.slug)} />
    </BikeConfigProvider>
  );
}
