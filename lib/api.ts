/**
 * Data access layer.
 *
 * Every customer action flows through these functions. While
 * `NEXT_PUBLIC_API_BASE_URL` is unset they resolve against local demo data
 * (with realistic latency) so the full experience can be reviewed. Point the
 * env var at the dealership's backend / DMS / CRM and the same calls become
 * real REST requests — the UI does not change.
 *
 * Endpoints expected when connected:
 *   POST /leads                       → LeadReceipt
 *   GET  /vehicles/:registration      → Vehicle
 *   GET  /service-jobs?registration=  → ServiceJob
 *   GET  /slots?kind=&date=           → { slot, available }[]
 *   GET  /garage                      → GarageProfile (authenticated)
 */
import { demoGarage, demoJobs, demoVehicles } from "@/data/demo-service";
import { serviceSlots, testRideSlots } from "@/data/services";
import { normaliseRegistration } from "./format";
import type { GarageProfile, LeadReceipt, LeadRequest, ServiceJob, Vehicle } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
export const isDemoMode = !BASE;
/** Demo mode only: submitting with this mobile number simulates a server failure. */
export const DEMO_FAILURE_MOBILE = "9000000000";

export class ApiError extends Error {
  constructor(
    message: string,
    public code: "network" | "not_found" | "unavailable" | "validation" | "server",
  ) {
    super(message);
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("We couldn't reach the showroom. Check your connection and try again.", "network");
  }
  if (res.status === 404) throw new ApiError("Not found", "not_found");
  if (res.status === 409) throw new ApiError("That slot was just taken. Please pick another.", "unavailable");
  if (!res.ok) throw new ApiError("Something went wrong on our side. Please try again.", "server");
  return res.json() as Promise<T>;
}

function offline() {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new ApiError("You appear to be offline. Reconnect and try again — your details are still here.", "network");
  }
}

function reference(prefix: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${s}`;
}

const prefixes: Record<LeadRequest["type"], string> = {
  test_ride: "TR",
  onroad_price: "OP",
  finance: "FN",
  callback: "CB",
  service_booking: "SB",
  accessory_enquiry: "AC",
};

/** Single entry point for every lead the site creates. */
export async function submitLead(lead: LeadRequest): Promise<LeadReceipt> {
  offline();
  const payload = { ...lead, createdAt: new Date().toISOString() };
  if (BASE) return http<LeadReceipt>("/leads", { method: "POST", body: JSON.stringify(payload) });

  await wait(900);
  // Demo hook: this number simulates a server failure so error states can be reviewed.
  if (lead.mobile.endsWith(DEMO_FAILURE_MOBILE)) {
    throw new ApiError("We couldn't send your request just now. Please try again, or call us directly.", "server");
  }
  return { reference: reference(prefixes[lead.type]), receivedAt: payload.createdAt };
}

export async function lookupVehicle(registration: string): Promise<Vehicle> {
  offline();
  const reg = normaliseRegistration(registration);
  if (BASE) return http<Vehicle>(`/vehicles/${reg}`);
  await wait(700);
  const v = demoVehicles.find((d) => d.registration === reg);
  if (!v) throw new ApiError("We couldn't find this registration in our records.", "not_found");
  return v;
}

export async function getServiceJob(registrationOrJob: string): Promise<ServiceJob> {
  offline();
  const key = normaliseRegistration(registrationOrJob);
  if (BASE) return http<ServiceJob>(`/service-jobs?q=${encodeURIComponent(key)}`);
  await wait(800);
  const job = demoJobs.find((j) => j.vehicle.registration === key || normaliseRegistration(j.jobId) === key);
  if (!job) throw new ApiError("There's no active service for this vehicle right now.", "not_found");
  return job;
}

export interface Slot {
  slot: string;
  available: boolean;
}

/** Deterministic pseudo-availability for demo mode. */
function seeded(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function isWorkshopClosed(date: string) {
  return new Date(`${date}T00:00:00`).getDay() === 0;
}

export async function getSlots(kind: "service" | "test_ride", date: string): Promise<Slot[]> {
  offline();
  if (BASE) return http<Slot[]>(`/slots?kind=${kind}&date=${date}`);
  await wait(350);
  if (kind === "service" && isWorkshopClosed(date)) return [];
  const all = kind === "service" ? serviceSlots : testRideSlots;
  const isSunday = new Date(`${date}T00:00:00`).getDay() === 0;
  return all
    .filter((s) => !(kind === "test_ride" && isSunday && s >= "14:00"))
    .map((slot) => ({ slot, available: seeded(`${kind}${date}${slot}`) % 4 !== 0 }));
}

export async function getGarage(): Promise<GarageProfile> {
  if (BASE) return http<GarageProfile>("/garage");
  await wait(500);
  return demoGarage;
}
