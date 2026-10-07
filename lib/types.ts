/**
 * Domain model for the digital showroom.
 *
 * Every entity here maps 1:1 to a future backend / CMS resource. UI components
 * only consume these types, so swapping the static `/data` modules for API
 * calls (see `lib/api.ts`) requires no UI changes.
 */

export type BikeCategory = "scooter" | "commuter" | "sport" | "adventure";
export type RideUsage = "commute" | "family" | "long-rides" | "weekend" | "performance" | "city";
export type RidePriority = "mileage" | "performance" | "comfort" | "style" | "features";

/** Visual archetype used to draw the studio silhouette when no photography is supplied. */
export type BikeSilhouette = "scooter" | "commuter" | "street" | "naked" | "adventure";

export interface BikeColor {
  id: string;
  name: string;
  /** Primary body colour */
  hex: string;
  /** Optional secondary / graphic accent colour */
  accent?: string;
  /** Path to real photography for this colour (e.g. /bikes/activa-125/blue.webp). */
  image?: string;
}

export interface BikeVariant {
  id: string;
  name: string;
  /** Indicative ex-showroom price in INR. */
  exShowroom: number;
  highlights: string[];
  /** Colour ids available for this variant. Empty = all colours. */
  colorIds?: string[];
  availability: "in-stock" | "limited" | "on-order";
}

export interface BikeFeature {
  id: string;
  title: string;
  body: string;
  kind: "engine" | "lighting" | "brakes" | "technology" | "comfort" | "storage" | "safety";
  /** Hotspot position as % of the visual frame (x from left, y from top). */
  x: number;
  y: number;
}

export interface BikeSpecs {
  engine: string;
  displacementCc: number;
  powerPs: number;
  powerRpm?: number;
  torqueNm: number;
  torqueRpm?: number;
  /** Indicative real-world efficiency in km/l. Never an ARAI/official claim. */
  mileageKmpl?: number;
  transmission: string;
  fuelLitres: number;
  kerbKg: number;
  brakesFront: string;
  brakesRear: string;
  tyreFront: string;
  tyreRear: string;
  seatHeightMm?: number;
}

export interface Bike {
  slug: string;
  name: string;
  /** Short line used under the name. */
  tagline: string;
  /** One-paragraph editorial description. */
  story: string;
  category: BikeCategory;
  silhouette: BikeSilhouette;
  usage: RideUsage[];
  /** 1–5 scores used by discovery + recommendation. */
  scores: Record<RidePriority, number>;
  variants: BikeVariant[];
  colors: BikeColor[];
  specs: BikeSpecs;
  features: BikeFeature[];
  /** Accessory ids that fit this model. */
  accessoryIds: string[];
  /** Real hero photography. When absent the studio silhouette renders. */
  heroImage?: string;
  testRideAvailable: boolean;
}

export type AccessoryCategory = "protection" | "comfort" | "touring" | "styling" | "utility";

export interface Accessory {
  id: string;
  name: string;
  category: AccessoryCategory;
  description: string;
  /** Indicative price in INR. */
  price: number;
  /** Which silhouettes it fits (drives which bikes can show it). */
  fits: BikeSilhouette[];
  image?: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  /** Indicative duration in hours, used for slot planning. */
  durationHours: number;
  /** Display string, e.g. "From ₹450" — leave undefined if not supplied by dealership. */
  priceNote?: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  kind: "exchange" | "finance" | "accessories" | "service" | "seasonal";
  validUntil?: string;
  terms?: string;
  bikeSlugs?: string[];
}

export interface RiderStory {
  id: string;
  name: string;
  bike: string;
  quote: string;
  /** Must be a real, consented customer story. */
  consentOnFile: true;
  image?: string;
}

export interface OpeningHours {
  days: string;
  open: string;
  close: string;
}

export interface Dealership {
  name: string;
  shortName: string;
  legalName?: string;
  descriptor: string;
  /** True while the dealership details are sample content. */
  isSampleData: boolean;
  logo?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  geo: { lat: number; lng: number };
  phone: { sales: string; service: string };
  whatsapp: string;
  email: string;
  hours: { showroom: OpeningHours[]; workshop: OpeningHours[] };
  mapsUrl: string;
  showroomImage?: string;
  /** Only populate with verified figures. `null` hides the metric. */
  metrics: {
    yearsServing: number | null;
    bikesDelivered: number | null;
    serviceVisits: number | null;
    satisfactionPct: number | null;
  };
  testRideLocations: { id: string; label: string; detail: string }[];
  pickupDrop: { available: boolean; radiusKm?: number; note?: string };
  siteUrl: string;
}

/* ───────────── Leads & transactional entities ───────────── */

export type LeadType =
  | "test_ride"
  | "onroad_price"
  | "finance"
  | "callback"
  | "service_booking"
  | "accessory_enquiry";

export interface LeadBase {
  type: LeadType;
  name: string;
  mobile: string;
  source: string;
  createdAt?: string;
}

export interface TestRideRequest extends LeadBase {
  type: "test_ride";
  bikeSlug: string;
  date: string;
  slot: string;
  locationId: string;
}

export interface OnRoadPriceRequest extends LeadBase {
  type: "onroad_price";
  bikeSlug: string;
  city: string;
  callbackTime?: string;
}

export interface FinanceRequest extends LeadBase {
  type: "finance";
  bikeSlug?: string;
  price: number;
  downPayment: number;
  tenureMonths: number;
}

export interface AccessoryEnquiry extends LeadBase {
  type: "accessory_enquiry";
  bikeSlug?: string;
  accessoryIds: string[];
}

export interface CallbackRequest extends LeadBase {
  type: "callback";
  topic: string;
  callbackTime?: string;
}

export interface ServiceBookingRequest extends LeadBase {
  type: "service_booking";
  registration: string;
  bikeName: string;
  serviceTypeIds: string[];
  date: string;
  slot: string;
  pickupDrop: boolean;
  pickupAddress?: string;
  notes?: string;
}

export type LeadRequest =
  | TestRideRequest
  | OnRoadPriceRequest
  | FinanceRequest
  | AccessoryEnquiry
  | CallbackRequest
  | ServiceBookingRequest;

export interface LeadReceipt {
  reference: string;
  receivedAt: string;
}

export interface Vehicle {
  registration: string;
  bikeSlug: string;
  bikeName: string;
  colorName: string;
  purchaseDate: string;
  odometerKm: number;
}

export type ServiceStage = "check-in" | "inspection" | "estimate" | "in-progress" | "quality-check" | "ready";

export interface ServiceJob {
  jobId: string;
  vehicle: Vehicle;
  serviceTypes: string[];
  stage: ServiceStage;
  /** ISO timestamps per completed stage. */
  timeline: Partial<Record<ServiceStage, string>>;
  advisor: string;
  estimateInr?: number;
  promisedBy: string;
  notes: string[];
}

export interface ServiceHistoryEntry {
  id: string;
  date: string;
  type: string;
  odometerKm: number;
  amountInr: number;
  work: string[];
}

export interface GarageProfile {
  customerName: string;
  vehicles: {
    vehicle: Vehicle;
    lastService: string;
    nextServiceDue: string;
    nextServiceKm: number;
    warrantyUntil: string;
    insuranceRenewal: string;
    history: ServiceHistoryEntry[];
    upcoming: string[];
  }[];
  bookings: { reference: string; date: string; slot: string; type: string; registration: string }[];
}
