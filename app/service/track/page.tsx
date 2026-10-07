import type { Metadata } from "next";
import { ServiceTracker } from "@/components/service/ServiceTracker";
import { dealership } from "@/data/dealership";

export const metadata: Metadata = {
  title: "Track your service",
  description: `Follow your Honda's service at ${dealership.name} live — check-in, inspection, estimate, work, quality check and ready for pickup.`,
  alternates: { canonical: "/service/track" },
  openGraph: { title: `Track your service · ${dealership.name}`, url: "/service/track" },
};

export default async function TrackServicePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.reg) ? sp.reg[0] : sp.reg;
  const reg = (raw ?? "").replace(/[^A-Za-z0-9 -]/g, "").slice(0, 20);
  // Keyed so navigating to a new ?reg= remounts and re-runs the lookup.
  return <ServiceTracker key={reg} initialQuery={reg} />;
}
