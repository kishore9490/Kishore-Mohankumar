import type { Accessory, AccessoryCategory } from "@/lib/types";

/**
 * Genuine accessory catalogue — SAMPLE DATA.
 * Prices are indicative placeholders. Replace with the dealership's current
 * genuine-accessory price list (and add photography via `image`).
 */
export const accessories: Accessory[] = [
  { id: "crash-guard", name: "Crash guard", category: "protection", description: "Powder-coated steel guard that protects the engine and your legs in a tip-over.", price: 1_450, fits: ["commuter", "street", "naked", "adventure"] },
  { id: "frame-slider", name: "Frame sliders", category: "protection", description: "Low-profile sliders that save bodywork and the frame from scrapes.", price: 1_850, fits: ["naked", "adventure"] },
  { id: "saree-guard", name: "Saree guard", category: "protection", description: "Keeps loose clothing away from the rear wheel — essential for pillion safety.", price: 750, fits: ["commuter", "street"] },
  { id: "body-cover", name: "Body cover", category: "protection", description: "Water-resistant, breathable cover that keeps dust, rain and sun off the paint.", price: 690, fits: ["scooter", "commuter", "street", "naked", "adventure"] },
  { id: "helmet", name: "Half-face helmet", category: "protection", description: "ISI-certified helmet with a clear visor, in sizes M–XL.", price: 1_650, fits: ["scooter", "commuter", "street", "naked", "adventure"] },
  { id: "seat-cover", name: "Premium seat cover", category: "comfort", description: "Stitched, weather-resistant cover with improved grip for rider and pillion.", price: 890, fits: ["scooter", "commuter", "street", "naked", "adventure"] },
  { id: "back-rest", name: "Pillion back-rest", category: "comfort", description: "Padded back-rest that makes longer rides far more comfortable for your passenger.", price: 1_350, fits: ["scooter", "commuter"] },
  { id: "knee-pads", name: "Tank knee pads", category: "comfort", description: "Rubber knee grips for better control and less fatigue on long rides.", price: 990, fits: ["naked", "adventure"] },
  { id: "top-box", name: "Top box", category: "touring", description: "Lockable top box that holds a full-face helmet; quick-release mounting.", price: 4_900, fits: ["commuter", "street", "naked", "adventure"] },
  { id: "tank-bag", name: "Magnetic tank bag", category: "touring", description: "Expandable tank bag with a clear phone window and rain cover.", price: 2_200, fits: ["street", "naked", "adventure"] },
  { id: "tank-pad", name: "Tank pad", category: "styling", description: "Protects the tank paint from zips and buckles, with a subtle finish.", price: 450, fits: ["commuter", "street", "naked", "adventure"] },
  { id: "floor-mat", name: "Floor mat", category: "styling", description: "Moulded floor mat that's easy to clean and protects the footboard.", price: 390, fits: ["scooter"] },
  { id: "side-step", name: "Side step", category: "utility", description: "Fold-out step for easier, safer pillion mounting.", price: 650, fits: ["scooter"] },
  { id: "mobile-holder", name: "Mobile holder", category: "utility", description: "Vibration-damped, handlebar-mounted holder for navigation.", price: 1_100, fits: ["scooter", "commuter", "street", "naked", "adventure"] },
];

export const accessoryCategoryLabels: Record<AccessoryCategory, string> = {
  protection: "Protection",
  comfort: "Comfort",
  touring: "Touring",
  styling: "Styling",
  utility: "Utility",
};

export function getAccessory(id: string) {
  return accessories.find((a) => a.id === id);
}
