import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/academy", "/login", "/api/", "/verify"] }],
    sitemap: `${site.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
