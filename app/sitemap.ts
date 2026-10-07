import type { MetadataRoute } from "next";
import { bikes } from "@/data/bikes";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["", "/bikes", "/test-ride", "/finance", "/service", "/service/book", "/service/track", "/accessories", "/about", "/contact"];
  return [
    ...routes.map((r) => ({ url: `${site.url}${r}`, lastModified: now, changeFrequency: "weekly" as const, priority: r === "" ? 1 : 0.8 })),
    ...bikes.map((b) => ({ url: `${site.url}/bikes/${b.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 })),
  ];
}
