import type { ServiceStage, ServiceType } from "@/lib/types";

/**
 * Service menu. `priceNote` is intentionally empty — add the dealership's
 * published labour/price guidance if and when it should be shown.
 */
export const serviceTypes: ServiceType[] = [
  { id: "general", name: "General service", description: "Complete check-up, cleaning, adjustments and a road test.", durationHours: 3 },
  { id: "periodic", name: "Periodic maintenance", description: "Scheduled service as per your owner's manual and odometer.", durationHours: 4 },
  { id: "oil", name: "Oil change", description: "Genuine Honda engine oil and filter, as recommended.", durationHours: 1 },
  { id: "brakes", name: "Brake service", description: "Pads, shoes, fluid and adjustment for confident stopping.", durationHours: 2 },
  { id: "tyre", name: "Tyres", description: "Puncture, pressure, alignment or replacement.", durationHours: 1 },
  { id: "battery", name: "Battery", description: "Health check, charging or replacement.", durationHours: 1 },
  { id: "accident", name: "Accident repair", description: "Inspection, estimate and insurance-assisted repair.", durationHours: 24 },
  { id: "other", name: "Something else", description: "Tell us what you've noticed — a noise, a warning light, anything.", durationHours: 2 },
];

export const serviceStages: { id: ServiceStage; label: string; description: string }[] = [
  { id: "check-in", label: "Checked in", description: "Your bike is with us and logged into the workshop." },
  { id: "inspection", label: "Inspection", description: "A technician is going over your bike, front to back." },
  { id: "estimate", label: "Estimate shared", description: "We've shared the work and cost — nothing extra happens without your OK." },
  { id: "in-progress", label: "Being serviced", description: "Your bike is being worked on right now." },
  { id: "quality-check", label: "Quality check", description: "A senior technician checks the work and road-tests the bike." },
  { id: "ready", label: "Ready for pickup", description: "Washed, checked and ready to ride home." },
];

/** Bookable time windows. Real availability comes from `api.getSlots`. */
export const serviceSlots = ["08:30", "09:30", "10:30", "11:30", "13:30", "14:30", "15:30"];
export const testRideSlots = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
