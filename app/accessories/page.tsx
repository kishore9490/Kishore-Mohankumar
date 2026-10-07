import type { Metadata } from "next";
import { AccessoryConfigurator } from "@/components/accessories/AccessoryConfigurator";
import { getBike } from "@/data/bikes";
import { dealership } from "@/data/dealership";

export const metadata: Metadata = {
  title: "Genuine Honda accessories — build yours",
  description: `Choose your Honda, add genuine accessories and see an indicative total. ${dealership.name} fits everything before delivery.`,
  alternates: { canonical: "/accessories" },
};

export default async function AccessoriesPage({ searchParams }: { searchParams: Promise<{ bike?: string | string[] }> }) {
  const { bike } = await searchParams;
  const slug = typeof bike === "string" && getBike(bike) ? bike : undefined;
  return <AccessoryConfigurator key={slug ?? "default"} initialBikeSlug={slug} />;
}
