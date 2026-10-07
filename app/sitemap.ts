import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { programs } from "@/data/programs";
import { insights } from "@/data/insights";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const now = new Date();
  const statics = ["", "/programs", "/medical-coding", "/career", "/faculty", "/demo", "/counselling", "/insights", "/about", "/contact", "/privacy", "/terms", "/disclaimer"];
  return [
    ...statics.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })),
    ...programs.map((p) => ({ url: `${base}/programs/${p.slug}`, lastModified: now, priority: 0.9 })),
    ...insights.map((i) => ({ url: `${base}/insights/${i.slug}`, lastModified: new Date(i.publishedAt), priority: 0.6 })),
  ];
}
