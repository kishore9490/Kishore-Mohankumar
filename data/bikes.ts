import type { Bike, BikeCategory, RidePriority, RideUsage } from "@/lib/types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SHOWROOM INVENTORY — SAMPLE DATA
 * ─────────────────────────────────────────────────────────────────────────────
 *  Model names are real Honda two-wheelers sold through Honda (Red Wing)
 *  dealerships in India. Prices, variants, colours and specifications are
 *  INDICATIVE placeholders for this preview and must be replaced with the
 *  dealership's current price list and Honda's published specifications
 *  before launch. `mileageKmpl` is a rough real-world indication, not an
 *  official figure — it is always displayed with that caveat.
 *
 *  Photography: drop licensed images in /public/bikes/<slug>/ and set
 *  `heroImage` (and `colors[].image`) — the UI switches from the studio
 *  silhouette to the photograph automatically.
 */
export const bikes: Bike[] = [
  {
    slug: "activa-125",
    name: "Activa 125",
    tagline: "The family favourite, made smarter.",
    story:
      "Everything that made Activa India's most trusted scooter, with a bigger heart. Smooth 125cc performance, a connected TFT display on the H-Smart variant and space for the everyday.",
    category: "scooter",
    silhouette: "scooter",
    usage: ["commute", "family", "city"],
    scores: { mileage: 4, performance: 3, comfort: 5, style: 3, features: 4 },
    variants: [
      { id: "dlx", name: "DLX", exShowroom: 88_300, highlights: ["Front disc option", "LED headlamp", "Silent start"], availability: "in-stock" },
      { id: "h-smart", name: "H-Smart", exShowroom: 92_100, highlights: ["Smart Key", "4.2\" TFT with Bluetooth", "USB Type-C charging"], availability: "in-stock" },
    ],
    colors: [
      { id: "pearl-siren-blue", name: "Pearl Siren Blue", hex: "#1f4f8f" },
      { id: "rebel-red", name: "Rebel Red Metallic", hex: "#9b1b22" },
      { id: "pearl-white", name: "Pearl Precious White", hex: "#e9e7e1" },
      { id: "matte-grey", name: "Matte Axis Grey", hex: "#5c6066" },
      { id: "black", name: "Pearl Igneous Black", hex: "#16171a" },
    ],
    specs: {
      engine: "Single-cylinder, 4-stroke, fan-cooled",
      displacementCc: 123.92,
      powerPs: 8.4,
      powerRpm: 6500,
      torqueNm: 10.5,
      torqueRpm: 5000,
      mileageKmpl: 47,
      transmission: "Automatic (CVT)",
      fuelLitres: 5.3,
      kerbKg: 109,
      brakesFront: "190 mm disc / 130 mm drum",
      brakesRear: "130 mm drum, combi-brake",
      tyreFront: "90/90-12 tubeless",
      tyreRear: "90/100-10 tubeless",
      seatHeightMm: 766,
    },
    features: [
      { id: "tft", kind: "technology", title: "Connected TFT", body: "Turn-by-turn navigation, call and message alerts on a 4.2-inch colour display (H-Smart).", x: 50, y: 30 },
      { id: "led", kind: "lighting", title: "LED headlamp", body: "A brighter, whiter beam for night rides and a crisp signature by day.", x: 76, y: 38 },
      { id: "engine", kind: "engine", title: "Silent start", body: "ACG starter fires the engine without the familiar crank noise — and idle-stop saves fuel at signals.", x: 42, y: 70 },
      { id: "storage", kind: "storage", title: "Under-seat storage", body: "Room for a half-face helmet and the day's essentials, with a front glovebox and charging port.", x: 32, y: 42 },
      { id: "brakes", kind: "brakes", title: "Combi-brake system", body: "Applying the left lever brakes both wheels together for stable, shorter stops.", x: 80, y: 74 },
    ],
    accessoryIds: ["floor-mat", "seat-cover", "body-cover", "back-rest", "side-step", "mobile-holder", "helmet"],
    testRideAvailable: true,
  },
  {
    slug: "activa-110",
    name: "Activa 110",
    tagline: "Effortless, every single day.",
    story:
      "The scooter India rides to work, to school and to the market. Light, easy and famously reliable — with a smart-key option for a little more convenience.",
    category: "scooter",
    silhouette: "scooter",
    usage: ["commute", "family", "city"],
    scores: { mileage: 5, performance: 2, comfort: 4, style: 3, features: 3 },
    variants: [
      { id: "std", name: "STD", exShowroom: 74_400, highlights: ["Steel wheels", "Combi-brake", "LED headlamp"], availability: "in-stock" },
      { id: "dlx", name: "DLX", exShowroom: 82_000, highlights: ["Alloy wheels", "Digital-analogue meter", "Chrome detailing"], availability: "in-stock" },
      { id: "h-smart", name: "H-Smart", exShowroom: 85_800, highlights: ["Smart Key with answer-back", "Keyless start", "Smart find"], availability: "limited" },
    ],
    colors: [
      { id: "decent-blue", name: "Decent Blue Metallic", hex: "#27466e" },
      { id: "pearl-white", name: "Pearl Precious White", hex: "#e9e7e1" },
      { id: "matte-grey", name: "Matte Axis Grey", hex: "#5c6066" },
      { id: "black", name: "Black", hex: "#141518" },
    ],
    specs: {
      engine: "Single-cylinder, 4-stroke, fan-cooled",
      displacementCc: 109.51,
      powerPs: 7.8,
      powerRpm: 8000,
      torqueNm: 8.9,
      torqueRpm: 5500,
      mileageKmpl: 50,
      transmission: "Automatic (CVT)",
      fuelLitres: 5.3,
      kerbKg: 106,
      brakesFront: "130 mm drum",
      brakesRear: "130 mm drum, combi-brake",
      tyreFront: "90/90-12 tubeless",
      tyreRear: "90/100-10 tubeless",
      seatHeightMm: 765,
    },
    features: [
      { id: "smart-key", kind: "technology", title: "Smart Key", body: "Keyless ignition, answer-back to find your scooter in a car park and an immobiliser (H-Smart).", x: 52, y: 32 },
      { id: "led", kind: "lighting", title: "LED headlamp", body: "Efficient, bright and long-lasting — for a clearer view after sunset.", x: 76, y: 38 },
      { id: "comfort", kind: "comfort", title: "Long, flat seat", body: "Space for two adults with a low seat height that's easy for every rider.", x: 34, y: 40 },
      { id: "brakes", kind: "brakes", title: "Combi-brake system", body: "Balances braking between both wheels from a single lever.", x: 80, y: 74 },
    ],
    accessoryIds: ["floor-mat", "seat-cover", "body-cover", "back-rest", "side-step", "mobile-holder", "helmet"],
    testRideAvailable: true,
  },
  {
    slug: "dio-125",
    name: "Dio 125",
    tagline: "Sharp lines. Sharper city.",
    story:
      "Dio is the scooter that doesn't blend in. Sporty styling, a lively 125cc engine and smart-key convenience for riders who like their commute with a little attitude.",
    category: "scooter",
    silhouette: "scooter",
    usage: ["city", "commute"],
    scores: { mileage: 4, performance: 3, comfort: 3, style: 5, features: 4 },
    variants: [
      { id: "std", name: "STD", exShowroom: 87_000, highlights: ["Front disc", "LED lighting", "Digital meter"], availability: "in-stock" },
      { id: "h-smart", name: "H-Smart", exShowroom: 91_800, highlights: ["Smart Key", "TFT display", "Keyless start"], availability: "on-order" },
    ],
    colors: [
      { id: "sports-red", name: "Sports Red", hex: "#b4161f", accent: "#16171a" },
      { id: "matte-marvel-blue", name: "Matte Marvel Blue", hex: "#2c4d7c", accent: "#d4d6d8" },
      { id: "pearl-black", name: "Pearl Nightstar Black", hex: "#121316", accent: "#9aa0a6" },
    ],
    specs: {
      engine: "Single-cylinder, 4-stroke, fan-cooled",
      displacementCc: 123.92,
      powerPs: 8.3,
      powerRpm: 6250,
      torqueNm: 10.4,
      torqueRpm: 5000,
      mileageKmpl: 46,
      transmission: "Automatic (CVT)",
      fuelLitres: 5.3,
      kerbKg: 105,
      brakesFront: "190 mm disc",
      brakesRear: "130 mm drum, combi-brake",
      tyreFront: "90/90-12 tubeless",
      tyreRear: "100/90-10 tubeless",
    },
    features: [
      { id: "style", kind: "lighting", title: "Sporty LED face", body: "Twin-element LED headlamp and sharp body lines give Dio its unmistakable stance.", x: 76, y: 38 },
      { id: "tech", kind: "technology", title: "Smart Key", body: "Keyless start, answer-back and anti-theft immobiliser (H-Smart).", x: 50, y: 32 },
      { id: "brakes", kind: "brakes", title: "Front disc", body: "Confident stopping power for busy city traffic.", x: 80, y: 74 },
      { id: "engine", kind: "engine", title: "125cc punch", body: "Quick off the line with idle-stop to save fuel at signals.", x: 42, y: 70 },
    ],
    accessoryIds: ["floor-mat", "seat-cover", "body-cover", "back-rest", "mobile-holder", "helmet"],
    testRideAvailable: true,
  },
  {
    slug: "shine-100",
    name: "Shine 100",
    tagline: "Honda reliability, made accessible.",
    story:
      "The simplest way into a Honda motorcycle. A frugal 100cc engine, a comfortable seat for two and the kind of low running cost that makes every kilometre count.",
    category: "commuter",
    silhouette: "commuter",
    usage: ["commute", "family"],
    scores: { mileage: 5, performance: 1, comfort: 3, style: 2, features: 2 },
    variants: [
      { id: "std", name: "Standard", exShowroom: 63_200, highlights: ["Combi-brake", "Long 677 mm seat", "Tubeless tyres"], availability: "in-stock" },
    ],
    colors: [
      { id: "black-red", name: "Black with Red", hex: "#151619", accent: "#c0262d" },
      { id: "black-blue", name: "Black with Blue", hex: "#151619", accent: "#2a62b8" },
      { id: "black-grey", name: "Black with Grey", hex: "#151619", accent: "#8b9096" },
    ],
    specs: {
      engine: "Single-cylinder, 4-stroke, air-cooled, PGM-FI",
      displacementCc: 98.98,
      powerPs: 7.4,
      powerRpm: 7500,
      torqueNm: 8.05,
      torqueRpm: 5000,
      mileageKmpl: 65,
      transmission: "4-speed manual",
      fuelLitres: 9,
      kerbKg: 99,
      brakesFront: "130 mm drum",
      brakesRear: "110 mm drum, combi-brake",
      tyreFront: "2.75-17 tubeless",
      tyreRear: "3.00-17 tubeless",
      seatHeightMm: 786,
    },
    features: [
      { id: "engine", kind: "engine", title: "Frugal 100cc", body: "Fuel-injected for easy starts and excellent economy, every single day.", x: 45, y: 66 },
      { id: "comfort", kind: "comfort", title: "Long seat", body: "A generous seat that comfortably carries two.", x: 36, y: 36 },
      { id: "brakes", kind: "brakes", title: "Combi-brake", body: "Balanced braking from the rear pedal for more stable stops.", x: 22, y: 72 },
      { id: "safety", kind: "safety", title: "Side-stand cut-off", body: "The engine won't start with the side-stand down — a simple safety habit built in.", x: 52, y: 84 },
    ],
    accessoryIds: ["crash-guard", "saree-guard", "seat-cover", "body-cover", "tank-pad", "mobile-holder", "helmet"],
    testRideAvailable: true,
  },
  {
    slug: "shine-125",
    name: "Shine 125",
    tagline: "The 125 India trusts.",
    story:
      "Refined, smooth and wonderfully easy to live with. Shine 125 is the commuter motorcycle that has quietly carried millions of riders to work and back.",
    category: "commuter",
    silhouette: "commuter",
    usage: ["commute", "family", "long-rides"],
    scores: { mileage: 5, performance: 2, comfort: 4, style: 3, features: 3 },
    variants: [
      { id: "drum", name: "Drum", exShowroom: 79_000, highlights: ["Combi-brake", "Silent start", "Tubeless tyres"], availability: "in-stock" },
      { id: "disc", name: "Disc", exShowroom: 83_500, highlights: ["Front disc", "Digital meter", "USB Type-C charging"], availability: "in-stock" },
    ],
    colors: [
      { id: "black", name: "Black", hex: "#141518", accent: "#9aa0a6" },
      { id: "rebel-red", name: "Rebel Red Metallic", hex: "#9b1b22", accent: "#e8e6e1" },
      { id: "geny-grey", name: "Geny Grey Metallic", hex: "#6a6e73", accent: "#151619" },
      { id: "decent-blue", name: "Decent Blue Metallic", hex: "#27466e", accent: "#e8e6e1" },
    ],
    specs: {
      engine: "Single-cylinder, 4-stroke, air-cooled, PGM-FI",
      displacementCc: 123.94,
      powerPs: 10.7,
      powerRpm: 7500,
      torqueNm: 11,
      torqueRpm: 6000,
      mileageKmpl: 55,
      transmission: "5-speed manual",
      fuelLitres: 10.5,
      kerbKg: 113,
      brakesFront: "240 mm disc / 130 mm drum",
      brakesRear: "130 mm drum, combi-brake",
      tyreFront: "80/100-18 tubeless",
      tyreRear: "80/100-18 tubeless",
      seatHeightMm: 791,
    },
    features: [
      { id: "engine", kind: "engine", title: "Silent start", body: "ACG starter for a quiet, instant start — no gear clatter, no fuss.", x: 45, y: 66 },
      { id: "tech", kind: "technology", title: "Digital meter", body: "Real-time mileage, distance-to-empty and gear position (Disc).", x: 70, y: 22 },
      { id: "comfort", kind: "comfort", title: "Plush seat", body: "Long, well-padded seat tuned for daily distances.", x: 36, y: 36 },
      { id: "brakes", kind: "brakes", title: "240 mm disc", body: "Strong, progressive stopping at the front (Disc variant).", x: 78, y: 70 },
      { id: "safety", kind: "safety", title: "Engine cut-off", body: "Side-stand engine inhibitor for everyday peace of mind.", x: 52, y: 84 },
    ],
    accessoryIds: ["crash-guard", "saree-guard", "seat-cover", "body-cover", "tank-pad", "mobile-holder", "helmet", "back-rest"],
    testRideAvailable: true,
  },
  {
    slug: "sp-125",
    name: "SP 125",
    tagline: "Commute, with a sharper edge.",
    story:
      "SP 125 takes everything good about a 125cc commuter and adds attitude — sharp styling, a full-digital display and a smooth, efficient engine.",
    category: "commuter",
    silhouette: "street",
    usage: ["commute", "city", "weekend"],
    scores: { mileage: 5, performance: 3, comfort: 3, style: 4, features: 4 },
    variants: [
      { id: "drum", name: "Drum", exShowroom: 86_000, highlights: ["LED headlamp", "Digital meter", "Combi-brake"], availability: "in-stock" },
      { id: "disc", name: "Disc", exShowroom: 91_000, highlights: ["Front disc", "4.2\" TFT with navigation", "USB Type-C"], availability: "in-stock" },
    ],
    colors: [
      { id: "pearl-siren-blue", name: "Pearl Siren Blue", hex: "#1f4f8f", accent: "#16171a" },
      { id: "imperial-red", name: "Imperial Red Metallic", hex: "#a3141d", accent: "#16171a" },
      { id: "matte-grey", name: "Matte Axis Grey", hex: "#5c6066", accent: "#d0d2d4" },
      { id: "black", name: "Black", hex: "#141518", accent: "#7b8188" },
    ],
    specs: {
      engine: "Single-cylinder, 4-stroke, air-cooled, PGM-FI",
      displacementCc: 123.94,
      powerPs: 10.9,
      powerRpm: 7500,
      torqueNm: 10.9,
      torqueRpm: 6000,
      mileageKmpl: 58,
      transmission: "5-speed manual",
      fuelLitres: 11.2,
      kerbKg: 116,
      brakesFront: "240 mm disc / 130 mm drum",
      brakesRear: "130 mm drum, combi-brake",
      tyreFront: "80/100-18 tubeless",
      tyreRear: "100/80-18 tubeless",
      seatHeightMm: 790,
    },
    features: [
      { id: "tft", kind: "technology", title: "TFT with navigation", body: "Turn-by-turn navigation and call alerts via the Honda RoadSync app (Disc).", x: 70, y: 22 },
      { id: "led", kind: "lighting", title: "LED headlamp", body: "A sharp LED beam that matches the bike's aggressive stance.", x: 84, y: 36 },
      { id: "engine", kind: "engine", title: "Smooth 125cc", body: "Fuel-injected engine tuned for efficiency without losing its eagerness.", x: 46, y: 66 },
      { id: "brakes", kind: "brakes", title: "240 mm disc", body: "Confident front braking with combi-brake balance.", x: 78, y: 70 },
    ],
    accessoryIds: ["crash-guard", "saree-guard", "seat-cover", "body-cover", "tank-pad", "mobile-holder", "helmet"],
    testRideAvailable: true,
  },
  {
    slug: "unicorn",
    name: "Unicorn",
    tagline: "Unshakeable. Unhurried. Unicorn.",
    story:
      "A legend of refinement. Unicorn's 160cc engine is smooth at any speed, its ride is famously composed, and it simply keeps going — year after year.",
    category: "commuter",
    silhouette: "commuter",
    usage: ["commute", "family", "long-rides"],
    scores: { mileage: 4, performance: 3, comfort: 5, style: 3, features: 3 },
    variants: [
      { id: "std", name: "Standard", exShowroom: 1_11_300, highlights: ["Single-channel ABS", "Full-LED headlamp", "Digital meter"], availability: "in-stock" },
    ],
    colors: [
      { id: "pearl-black", name: "Pearl Igneous Black", hex: "#141518", accent: "#b5b8bc" },
      { id: "radiant-red", name: "Radiant Red Metallic", hex: "#8e1a1f", accent: "#d9d9d6" },
      { id: "pearl-white", name: "Pearl Shining White", hex: "#e6e4de", accent: "#16171a" },
    ],
    specs: {
      engine: "Single-cylinder, 4-stroke, air-cooled, PGM-FI",
      displacementCc: 162.71,
      powerPs: 13,
      powerRpm: 7500,
      torqueNm: 14.58,
      torqueRpm: 5500,
      mileageKmpl: 50,
      transmission: "5-speed manual",
      fuelLitres: 13,
      kerbKg: 140,
      brakesFront: "240 mm disc, single-channel ABS",
      brakesRear: "130 mm drum",
      tyreFront: "80/100-18 tubeless",
      tyreRear: "100/90-18 tubeless",
      seatHeightMm: 798,
    },
    features: [
      { id: "safety", kind: "safety", title: "Single-channel ABS", body: "Prevents front-wheel lock under hard braking on slippery roads.", x: 78, y: 70 },
      { id: "engine", kind: "engine", title: "Refined 160cc", body: "Famously smooth power delivery with a strong mid-range for highways.", x: 46, y: 64 },
      { id: "comfort", kind: "comfort", title: "Mono-shock comfort", body: "Rear mono-suspension soaks up bad roads, solo or two-up.", x: 30, y: 56 },
      { id: "led", kind: "lighting", title: "Full-LED headlamp", body: "Brighter, wider beam for night highway runs.", x: 84, y: 36 },
    ],
    accessoryIds: ["crash-guard", "saree-guard", "seat-cover", "body-cover", "tank-pad", "mobile-holder", "helmet", "back-rest"],
    testRideAvailable: true,
  },
  {
    slug: "sp-160",
    name: "SP 160",
    tagline: "Step up. Stand out.",
    story:
      "A 160cc motorcycle with a sporty heart and everyday manners. Sharp design, strong brakes and a connected display for riders ready for more.",
    category: "sport",
    silhouette: "street",
    usage: ["commute", "weekend", "performance"],
    scores: { mileage: 4, performance: 4, comfort: 3, style: 4, features: 4 },
    variants: [
      { id: "single-disc", name: "Single Disc", exShowroom: 1_14_800, highlights: ["Front disc", "Single-channel ABS", "LED headlamp"], availability: "in-stock" },
      { id: "dual-disc", name: "Dual Disc", exShowroom: 1_19_500, highlights: ["Front & rear disc", "4.2\" TFT", "USB Type-C"], availability: "limited" },
    ],
    colors: [
      { id: "pearl-spartan-red", name: "Pearl Spartan Red", hex: "#a8161e", accent: "#16171a" },
      { id: "matte-marvel-blue", name: "Matte Marvel Blue", hex: "#2c4d7c", accent: "#16171a" },
      { id: "matte-dark-blue", name: "Matte Dark Blue", hex: "#1c2a44", accent: "#9aa0a6" },
      { id: "pearl-black", name: "Pearl Igneous Black", hex: "#141518", accent: "#c0262d" },
    ],
    specs: {
      engine: "Single-cylinder, 4-stroke, air-cooled, PGM-FI",
      displacementCc: 162.71,
      powerPs: 13.3,
      powerRpm: 7500,
      torqueNm: 14.58,
      torqueRpm: 5500,
      mileageKmpl: 50,
      transmission: "5-speed manual",
      fuelLitres: 12,
      kerbKg: 141,
      brakesFront: "276 mm disc, single-channel ABS",
      brakesRear: "220 mm disc / 130 mm drum",
      tyreFront: "80/100-17 tubeless",
      tyreRear: "130/70-17 tubeless",
      seatHeightMm: 796,
    },
    features: [
      { id: "tft", kind: "technology", title: "Connected TFT", body: "Navigation, call alerts and ride data on a 4.2-inch colour display (Dual Disc).", x: 70, y: 22 },
      { id: "brakes", kind: "brakes", title: "276 mm front disc", body: "Large disc with ABS for strong, stable stops.", x: 78, y: 70 },
      { id: "engine", kind: "engine", title: "160cc performance", body: "Eager mid-range that makes overtakes effortless.", x: 46, y: 64 },
      { id: "style", kind: "lighting", title: "Sharp LED face", body: "A sculpted LED headlamp and muscular tank shrouds.", x: 84, y: 36 },
    ],
    accessoryIds: ["crash-guard", "saree-guard", "seat-cover", "body-cover", "tank-pad", "mobile-holder", "helmet", "tank-bag"],
    testRideAvailable: true,
  },
  {
    slug: "hornet-2-0",
    name: "Hornet 2.0",
    tagline: "Built for the rush.",
    story:
      "The streetfighter of the range. A 184cc engine, golden upside-down forks and a muscular stance — Hornet 2.0 is for riders who want their everyday ride to feel like an event.",
    category: "sport",
    silhouette: "naked",
    usage: ["performance", "weekend", "city"],
    scores: { mileage: 3, performance: 5, comfort: 3, style: 5, features: 4 },
    variants: [
      { id: "std", name: "Standard", exShowroom: 1_43_000, highlights: ["Upside-down forks", "Dual-channel ABS", "Assist & slipper clutch"], availability: "in-stock" },
    ],
    colors: [
      { id: "pearl-igneous-black", name: "Pearl Igneous Black", hex: "#121316", accent: "#c8a24a" },
      { id: "sports-red", name: "Sports Red", hex: "#b4161f", accent: "#121316" },
      { id: "matte-grey", name: "Matte Axis Grey Metallic", hex: "#4f5359", accent: "#c8a24a" },
      { id: "pearl-blue", name: "Pearl Siren Blue", hex: "#1f4f8f", accent: "#121316" },
    ],
    specs: {
      engine: "Single-cylinder, 4-stroke, air-cooled, PGM-FI",
      displacementCc: 184.4,
      powerPs: 17.26,
      powerRpm: 8500,
      torqueNm: 15.9,
      torqueRpm: 6000,
      mileageKmpl: 45,
      transmission: "5-speed manual, assist & slipper clutch",
      fuelLitres: 12,
      kerbKg: 142,
      brakesFront: "276 mm petal disc, dual-channel ABS",
      brakesRear: "220 mm petal disc, dual-channel ABS",
      tyreFront: "110/70-17 tubeless",
      tyreRear: "140/70-17 tubeless",
      seatHeightMm: 790,
    },
    features: [
      { id: "usd", kind: "comfort", title: "Upside-down forks", body: "Golden USD forks sharpen steering and keep the front planted over broken roads.", x: 80, y: 52 },
      { id: "engine", kind: "engine", title: "184cc engine", body: "The strongest motor in the Red Wing range, with an assist & slipper clutch for lighter, safer downshifts.", x: 46, y: 62 },
      { id: "safety", kind: "safety", title: "Dual-channel ABS", body: "ABS on both wheels with petal discs front and rear.", x: 22, y: 72 },
      { id: "led", kind: "lighting", title: "Full-LED lighting", body: "LED headlamp, tail lamp and indicators with an aggressive X-signature.", x: 86, y: 34 },
      { id: "tech", kind: "technology", title: "Smart display", body: "Full-digital, negative-LCD display with gear position and connected features.", x: 72, y: 20 },
    ],
    accessoryIds: ["crash-guard", "seat-cover", "body-cover", "tank-pad", "mobile-holder", "helmet", "tank-bag", "frame-slider"],
    testRideAvailable: true,
  },
  {
    slug: "nx200",
    name: "NX200",
    tagline: "City by week. Anywhere by weekend.",
    story:
      "An adventure-styled tourer for riders whose map doesn't end at city limits. Upright ergonomics, a tall stance and the Hornet's 184cc engine make NX200 the range's go-anywhere companion.",
    category: "adventure",
    silhouette: "adventure",
    usage: ["long-rides", "weekend", "performance"],
    scores: { mileage: 3, performance: 4, comfort: 5, style: 4, features: 4 },
    variants: [
      { id: "std", name: "Standard", exShowroom: 1_50_500, highlights: ["Upside-down forks", "Dual-channel ABS", "Knuckle guards"], availability: "on-order" },
    ],
    colors: [
      { id: "pearl-nightstar-black", name: "Pearl Nightstar Black", hex: "#121316", accent: "#c0262d" },
      { id: "radiant-red", name: "Radiant Red Metallic", hex: "#a3141d", accent: "#e8e6e1" },
      { id: "athletic-blue", name: "Athletic Blue Metallic", hex: "#244a86", accent: "#e8e6e1" },
    ],
    specs: {
      engine: "Single-cylinder, 4-stroke, air-cooled, PGM-FI",
      displacementCc: 184.4,
      powerPs: 17.26,
      powerRpm: 8500,
      torqueNm: 15.9,
      torqueRpm: 6000,
      mileageKmpl: 43,
      transmission: "5-speed manual, assist & slipper clutch",
      fuelLitres: 12,
      kerbKg: 147,
      brakesFront: "276 mm petal disc, dual-channel ABS",
      brakesRear: "220 mm petal disc, dual-channel ABS",
      tyreFront: "110/70-17 tubeless",
      tyreRear: "140/70-17 tubeless",
      seatHeightMm: 817,
    },
    features: [
      { id: "comfort", kind: "comfort", title: "Upright ergonomics", body: "Wide handlebar and a neutral riding position for long, fatigue-free days.", x: 62, y: 24 },
      { id: "safety", kind: "safety", title: "Dual-channel ABS", body: "Confident braking on wet highways and loose surfaces.", x: 22, y: 74 },
      { id: "led", kind: "lighting", title: "Multi-reflector LED", body: "A wide, bright beam built for unlit roads.", x: 86, y: 34 },
      { id: "engine", kind: "engine", title: "184cc torque", body: "Strong low-down pull with an assist & slipper clutch.", x: 46, y: 62 },
      { id: "storage", kind: "storage", title: "Touring ready", body: "Pairs with tank bags, saddle stays and top boxes from our accessory range.", x: 24, y: 40 },
    ],
    accessoryIds: ["crash-guard", "seat-cover", "body-cover", "tank-pad", "mobile-holder", "helmet", "tank-bag", "top-box", "frame-slider", "knee-pads"],
    testRideAvailable: true,
  },
];

export const categoryLabels: Record<BikeCategory, string> = {
  scooter: "Scooter",
  commuter: "Commuter",
  sport: "Sport",
  adventure: "Adventure-tourer",
};

export const usageLabels: Record<RideUsage, string> = {
  commute: "Daily commute",
  family: "Family",
  "long-rides": "Long rides",
  weekend: "Weekend rides",
  performance: "Performance",
  city: "City",
};

export const priorityLabels: Record<RidePriority, string> = {
  mileage: "Mileage",
  performance: "Performance",
  comfort: "Comfort",
  style: "Style",
  features: "Features",
};

export function getBike(slug: string) {
  return bikes.find((b) => b.slug === slug);
}

export function startingPrice(bike: Bike) {
  return Math.min(...bike.variants.map((v) => v.exShowroom));
}

/** Price ceiling used across discovery filters. */
export const budgetBands = [
  { id: "u1", label: "Under ₹1 lakh", min: 0, max: 1_00_000 },
  { id: "1-1.5", label: "₹1 – 1.5 lakh", min: 1_00_000, max: 1_50_000 },
  { id: "1.5-2", label: "₹1.5 – 2 lakh", min: 1_50_000, max: 2_00_000 },
  { id: "2+", label: "₹2 lakh +", min: 2_00_000, max: Infinity },
] as const;

/** The model shown in the homepage hero. */
export const heroBikeSlug = "hornet-2-0";
