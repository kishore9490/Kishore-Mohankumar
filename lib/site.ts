import { dealership } from "@/data/dealership";

export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? dealership.siteUrl,
  name: dealership.name,
  tagline: "Your Honda. Your next ride. Your trusted service.",
  description: `Explore Honda scooters and motorcycles at ${dealership.name}, ${dealership.address.city}. Book a test ride, estimate your EMI, get an on-road price and book service online.`,
  /** Include Product/Offer prices in structured data only once the price list is verified. */
  publishPricingSchema: !dealership.isSampleData,
};

export const nav = [
  { href: "/bikes", label: "Bikes" },
  { href: "/test-ride", label: "Test ride" },
  { href: "/service", label: "Service" },
  { href: "/finance", label: "Finance" },
  { href: "/accessories", label: "Accessories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
