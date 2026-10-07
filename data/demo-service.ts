import type { GarageProfile, ServiceJob, Vehicle } from "@/lib/types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  DEMO DATA — NOT CONNECTED TO A DEALER MANAGEMENT SYSTEM
 * ─────────────────────────────────────────────────────────────────────────────
 *  Used by `lib/api.ts` while `NEXT_PUBLIC_API_BASE_URL` is unset so service
 *  lookup, tracking and the garage can be demonstrated. Every screen that
 *  renders this data shows a "Demo" label.
 */

const now = new Date();
const iso = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3_600_000).toISOString();
const day = (daysFromNow: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
};

export const demoVehicles: Vehicle[] = [
  { registration: "TN37AB1234", bikeSlug: "shine-125", bikeName: "Shine 125", colorName: "Rebel Red Metallic", purchaseDate: "2023-08-14", odometerKm: 18_420 },
  { registration: "TN66C4521", bikeSlug: "activa-125", bikeName: "Activa 125", colorName: "Pearl Siren Blue", purchaseDate: "2024-11-02", odometerKm: 6_150 },
  { registration: "TN38BZ7788", bikeSlug: "hornet-2-0", bikeName: "Hornet 2.0", colorName: "Pearl Igneous Black", purchaseDate: "2022-03-21", odometerKm: 31_900 },
];

export const demoJobs: ServiceJob[] = [
  {
    jobId: "JC-24817",
    vehicle: demoVehicles[0],
    serviceTypes: ["Periodic maintenance", "Oil change"],
    stage: "in-progress",
    timeline: { "check-in": iso(4.5), inspection: iso(3.8), estimate: iso(3.1), "in-progress": iso(2.2) },
    advisor: "Service advisor",
    estimateInr: 1_840,
    promisedBy: iso(-2.5),
    notes: ["Chain cleaned and adjusted", "Rear brake shoes at 40% — no change needed yet"],
  },
  {
    jobId: "JC-24822",
    vehicle: demoVehicles[1],
    serviceTypes: ["General service"],
    stage: "ready",
    timeline: { "check-in": iso(7), inspection: iso(6.5), estimate: iso(6), "in-progress": iso(5), "quality-check": iso(2), ready: iso(1) },
    advisor: "Service advisor",
    estimateInr: 1_120,
    promisedBy: iso(0.5),
    notes: ["Washed and polished", "Tyre pressures set"],
  },
];

export const demoGarage: GarageProfile = {
  customerName: "Demo rider",
  vehicles: [
    {
      vehicle: demoVehicles[0],
      lastService: day(-118),
      nextServiceDue: day(12),
      nextServiceKm: 20_000,
      warrantyUntil: "2028-08-13",
      insuranceRenewal: day(34),
      upcoming: ["Periodic maintenance at 20,000 km", "Air filter replacement", "Brake shoe inspection"],
      history: [
        { id: "h1", date: day(-118), type: "Periodic maintenance", odometerKm: 15_980, amountInr: 1_650, work: ["Engine oil & filter", "Chain lube", "Brake adjustment"] },
        { id: "h2", date: day(-240), type: "General service", odometerKm: 11_200, amountInr: 980, work: ["Wash & polish", "Spark plug check", "Tyre pressure"] },
        { id: "h3", date: day(-365), type: "Battery", odometerKm: 8_900, amountInr: 1_450, work: ["Battery replacement"] },
      ],
    },
  ],
  bookings: [{ reference: "SB-DEMO-7Q4", date: day(12), slot: "09:30", type: "Periodic maintenance", registration: "TN37AB1234" }],
};
