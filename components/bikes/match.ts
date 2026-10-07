import { bikes as allBikes, budgetBands, startingPrice, usageLabels } from "@/data/bikes";
import type { Bike, BikeCategory, RidePriority, RideUsage } from "@/lib/types";
import { formatINR, formatNumber } from "@/lib/format";

/* ─────────────────────────────────────────────────────────────────────────────
   Discovery + recommendation logic for the BUY journey.
   Pure functions only — shared by FindYourRide, HelpMeChoose and the PDP.
   ───────────────────────────────────────────────────────────────────────────── */

export type BudgetId = (typeof budgetBands)[number]["id"];

export interface DiscoveryFilters {
  category: BikeCategory | "all";
  budget: BudgetId | "any";
  usage: RideUsage | "any";
  /** Sort order — "curated" keeps the showroom's own order. */
  priority: RidePriority | "curated";
}

export const defaultFilters: DiscoveryFilters = { category: "all", budget: "any", usage: "any", priority: "curated" };

export function budgetBand(id: BudgetId) {
  return budgetBands.find((b) => b.id === id)!;
}

export function inBudget(bike: Bike, id: BudgetId) {
  const band = budgetBand(id);
  const p = startingPrice(bike);
  return p >= band.min && p < band.max;
}

export function matches(bike: Bike, f: DiscoveryFilters) {
  if (f.category !== "all" && bike.category !== f.category) return false;
  if (f.budget !== "any" && !inBudget(bike, f.budget)) return false;
  if (f.usage !== "any" && !bike.usage.includes(f.usage)) return false;
  return true;
}

export function filterBikes(f: DiscoveryFilters, list: Bike[] = allBikes) {
  const out = list.filter((b) => matches(b, f));
  if (f.priority !== "curated") {
    const p = f.priority;
    out.sort((a, b) => b.scores[p] - a.scores[p] || startingPrice(a) - startingPrice(b));
  }
  return out;
}

/** How many bikes would match if `key` were set to `value` (other filters unchanged). */
export function facetCount<K extends "category" | "budget" | "usage">(f: DiscoveryFilters, key: K, value: DiscoveryFilters[K], list: Bike[] = allBikes) {
  return list.filter((b) => matches(b, { ...f, [key]: value })).length;
}

/** Related models for the PDP: same category first, then nearest in price. */
export function relatedBikes(bike: Bike, count = 3, list: Bike[] = allBikes) {
  const price = startingPrice(bike);
  return list
    .filter((b) => b.slug !== bike.slug)
    .map((b) => ({
      b,
      rank: (b.category === bike.category ? 0 : 1) * 1_000_000 + Math.abs(startingPrice(b) - price),
    }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, count)
    .map((x) => x.b);
}

/* ───────────── Recommendation ("Help me choose") ───────────── */

export type Purpose = Extract<RideUsage, "commute" | "family" | "long-rides" | "weekend" | "performance">;

export interface QuizAnswers {
  purpose: Purpose;
  budget: BudgetId;
  priority: RidePriority;
}

/** Partial credit when a bike suits a closely related kind of riding. */
const nearUsage: Partial<Record<Purpose, RideUsage[]>> = {
  commute: ["city"],
  family: ["commute"],
  "long-rides": ["weekend"],
  weekend: ["performance", "long-rides"],
  performance: ["weekend"],
};

export type BudgetFit = "within" | "under" | "stretch" | "over";

export interface Recommendation {
  bike: Bike;
  score: number;
  fit: BudgetFit;
  reasons: string[];
  /** Honest note about price vs budget, shown under the price. */
  budgetNote: string;
}

const STRETCH = 0.1; // up to 10% over the band ceiling counts as a "near-budget stretch"

function budgetFit(bike: Bike, id: BudgetId): { fit: BudgetFit; points: number } {
  const band = budgetBand(id);
  const p = startingPrice(bike);
  if (p >= band.min && p < band.max) return { fit: "within", points: 30 };
  if (p < band.min) {
    // Cheaper than the band — still a fit, but less likely what the rider is after.
    const gap = (band.min - p) / band.min;
    return { fit: "under", points: Math.max(8, 26 - gap * 40) };
  }
  const over = (p - band.max) / band.max;
  if (over <= STRETCH) return { fit: "stretch", points: 12 };
  return { fit: "over", points: -40 - over * 60 };
}

export function scoreBike(bike: Bike, a: QuizAnswers) {
  let usage = 0;
  if (bike.usage.includes(a.purpose)) usage = 30;
  else if (nearUsage[a.purpose]?.some((u) => bike.usage.includes(u))) usage = 12;
  const priority = bike.scores[a.priority] * 8; // 8–40
  const { fit, points } = budgetFit(bike, a.budget);
  // tiny tie-breaker on overall balance
  const balance = Object.values(bike.scores).reduce((s, v) => s + v, 0) * 0.2;
  return { score: usage + priority + points + balance, fit };
}

function priorityReason(bike: Bike, p: RidePriority): string {
  const s = bike.specs;
  switch (p) {
    case "mileage":
      return s.mileageKmpl
        ? `Around ${s.mileageKmpl} km/l in typical real-world riding* — and a ${formatNumber(s.fuelLitres)}-litre tank.`
        : `An efficient ${Math.round(s.displacementCc)}cc fuel-injected engine with a ${formatNumber(s.fuelLitres)}-litre tank.`;
    case "performance":
      return `${formatNumber(s.powerPs)} PS and ${formatNumber(s.torqueNm)} Nm from a ${Math.round(s.displacementCc)}cc engine.`;
    case "comfort": {
      const f = bike.features.find((x) => x.kind === "comfort");
      if (f) return `${f.title}: ${lowerFirst(f.body)}`;
      return `${s.transmission} with ${s.seatHeightMm ? `a ${s.seatHeightMm} mm seat height` : "an easy, upright riding position"}.`;
    }
    case "style": {
      const f = bike.features.find((x) => x.kind === "lighting");
      const colours = `${bike.colors.length} colours, including ${bike.colors[0].name}`;
      return f ? `${f.title} — offered in ${colours}.` : `Offered in ${colours}.`;
    }
    case "features": {
      const top = [...bike.variants].sort((x, y) => y.exShowroom - x.exShowroom)[0];
      return `${bike.variants.length > 1 ? `The ${top.name} variant adds` : "Comes with"} ${joinList(top.highlights.map(lowerTech))}.`;
    }
  }
}

function usageReason(bike: Bike, u: Purpose): string {
  const s = bike.specs;
  const matched = bike.usage.includes(u);
  const label = usageLabels[u].toLowerCase();
  switch (u) {
    case "commute":
      return `${matched ? "Made for the daily commute" : "Easy to live with every day"}: ${formatNumber(s.kerbKg)} kg kerb weight and a ${lowerFirst(s.transmission)} gearbox.`;
    case "family":
      return `${matched ? "Family-friendly" : "Practical"} — ${bike.features.find((f) => f.kind === "comfort" || f.kind === "storage")?.title.toLowerCase() ?? "a comfortable two-up seat"} and ${lowerFirst(s.brakesRear)} at the rear.`;
    case "long-rides": {
      const range = s.mileageKmpl ? Math.round((s.mileageKmpl * s.fuelLitres) / 10) * 10 : null;
      return `${matched ? "Built to go the distance" : "Capable of longer trips"}: a ${formatNumber(s.fuelLitres)}-litre tank${range ? ` — roughly ${range} km between fills*` : ""}.`;
    }
    case "weekend":
    case "performance":
      return `${matched ? `Suited to ${label}` : "Lively enough for the weekend"}: ${formatNumber(s.powerPs)} PS at ${s.powerRpm ? `${formatNumber(s.powerRpm)} rpm` : "the top end"} and ${lowerFirst(s.brakesFront)} up front.`;
  }
}

/** A standout feature not already covered by the priority reason. */
function featureReason(bike: Bike, p: RidePriority) {
  const skip = p === "comfort" ? "comfort" : p === "style" ? "lighting" : p === "performance" || p === "mileage" ? "engine" : "technology";
  const f = bike.features.find((x) => x.kind !== skip) ?? bike.features[0];
  return `${f.title}: ${lowerFirst(f.body)}`;
}

function budgetNote(bike: Bike, id: BudgetId, fit: BudgetFit) {
  const p = startingPrice(bike);
  const band = budgetBand(id);
  switch (fit) {
    case "within":
      return `Starts at ${formatINR(p)} ex-showroom* — within your budget (${band.label}).`;
    case "under":
      return `Starts at ${formatINR(p)} ex-showroom* — comfortably under your budget, leaving room for accessories.`;
    case "stretch":
      return `Starts at ${formatINR(p)} ex-showroom* — about ${formatINR(p - band.max)} above your budget. An EMI plan can bridge the gap.`;
    case "over":
      return `Starts at ${formatINR(p)} ex-showroom* — above your budget. Ask us about finance options.`;
  }
}

export function recommend(a: QuizAnswers, list: Bike[] = allBikes): Recommendation[] {
  return list
    .map((bike) => {
      const { score, fit } = scoreBike(bike, a);
      return { bike, score, fit };
    })
    .sort((x, y) => y.score - x.score || startingPrice(x.bike) - startingPrice(y.bike))
    .map(({ bike, score, fit }) => ({
      bike,
      score,
      fit,
      reasons: [priorityReason(bike, a.priority), usageReason(bike, a.purpose), featureReason(bike, a.priority)],
      budgetNote: budgetNote(bike, a.budget, fit),
    }));
}

/* ───────────── helpers ───────────── */

function lowerFirst(s: string) {
  // keep acronyms like "ABS", "ACG", "TFT" intact
  if (/^[A-Z]{2,}/.test(s)) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function lowerTech(s: string) {
  return /^[A-Z0-9]{2,}|^\d|^[A-Z][a-z]+ [A-Z]/.test(s) ? s : lowerFirst(s);
}

export function joinList(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
