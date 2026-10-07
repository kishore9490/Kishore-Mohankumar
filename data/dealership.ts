import type { Dealership } from "@/lib/types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  DEALERSHIP PROFILE — REPLACE BEFORE GOING LIVE
 * ─────────────────────────────────────────────────────────────────────────────
 *  Everything in this file is SAMPLE content so the experience can be reviewed
 *  end-to-end. Replace name, address, phone numbers, coordinates and hours with
 *  the dealership's verified details, then set `isSampleData: false` (this also
 *  removes the "preview" notice in the footer).
 *
 *  `metrics` must only ever contain real, verifiable numbers. Leave `null` to
 *  hide a metric — the trust section then falls back to qualitative strengths.
 */
export const dealership: Dealership = {
  name: "Meridian Honda",
  shortName: "Meridian",
  descriptor: "Authorised Honda two-wheeler dealership",
  isSampleData: true,
  address: {
    line1: "Showroom & Workshop, 412 Avinashi Road",
    line2: "Peelamedu",
    city: "Coimbatore",
    state: "Tamil Nadu",
    pincode: "641004",
  },
  geo: { lat: 11.0283, lng: 77.0273 },
  phone: { sales: "+919876543210", service: "+919876543211" },
  whatsapp: "919876543210",
  email: "hello@example.com",
  hours: {
    showroom: [
      { days: "Mon – Sat", open: "09:30", close: "20:00" },
      { days: "Sunday", open: "10:00", close: "14:00" },
    ],
    workshop: [{ days: "Mon – Sat", open: "08:30", close: "18:30" }],
  },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=11.0283,77.0273",
  metrics: {
    yearsServing: null,
    bikesDelivered: null,
    serviceVisits: null,
    satisfactionPct: null,
  },
  testRideLocations: [
    { id: "showroom", label: "At the showroom", detail: "Ride from our showroom with a product specialist." },
    { id: "doorstep", label: "At my doorstep", detail: "Subject to availability within city limits." },
  ],
  pickupDrop: { available: true, radiusKm: 10, note: "Pickup & drop within 10 km, subject to slot availability." },
  siteUrl: "https://www.example.com",
};

export const formattedAddress = [
  dealership.address.line1,
  dealership.address.line2,
  `${dealership.address.city} ${dealership.address.pincode}`,
  dealership.address.state,
]
  .filter(Boolean)
  .join(", ");
