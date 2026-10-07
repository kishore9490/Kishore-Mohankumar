import type { Bike, BikeFeature, BikeSilhouette } from "@/lib/types";

/**
 * Hotspot placement for the studio silhouettes.
 *
 * `feature.x / feature.y` in data/bikes.ts are approximate. These anchors are
 * measured on the drawn silhouettes (800 × 480 frame) so hotspots land on the
 * right part. Photography (`heroImage`) uses the data coordinates as-is.
 */
type Part =
  | "headlamp"
  | "console"
  | "tank"
  | "seat"
  | "engine"
  | "frontBrake"
  | "rearWheel"
  | "forks"
  | "rearShock"
  | "sideStand"
  | "handlebar"
  | "rack"
  | "floor";

type Px = [number, number];

const anchors: Record<BikeSilhouette, Partial<Record<Part, Px>>> = {
  scooter: {
    headlamp: [613, 116],
    console: [559, 111],
    handlebar: [540, 112],
    seat: [275, 192],
    engine: [300, 350],
    frontBrake: [614, 344],
    rearWheel: [225, 366],
    forks: [592, 270],
    floor: [468, 328],
    sideStand: [300, 396],
    rack: [150, 200],
    tank: [470, 240],
  },
  commuter: {
    headlamp: [608, 180],
    console: [567, 130],
    handlebar: [535, 136],
    tank: [455, 186],
    seat: [280, 194],
    engine: [415, 322],
    frontBrake: [626, 318],
    rearWheel: [205, 346],
    forks: [578, 252],
    rearShock: [226, 276],
    sideStand: [330, 402],
    rack: [150, 196],
  },
  street: {
    headlamp: [622, 176],
    console: [577, 129],
    handlebar: [540, 134],
    tank: [465, 176],
    seat: [300, 198],
    engine: [415, 320],
    frontBrake: [632, 318],
    rearWheel: [205, 346],
    forks: [582, 252],
    rearShock: [331, 277],
    sideStand: [330, 402],
    rack: [150, 196],
  },
  naked: {
    headlamp: [620, 170],
    console: [584, 119],
    handlebar: [540, 124],
    tank: [470, 166],
    seat: [300, 192],
    engine: [415, 316],
    frontBrake: [637, 316],
    rearWheel: [205, 344],
    forks: [583, 240],
    rearShock: [341, 263],
    sideStand: [330, 402],
    rack: [150, 186],
  },
  adventure: {
    headlamp: [622, 158],
    console: [587, 107],
    handlebar: [540, 100],
    tank: [475, 160],
    seat: [300, 186],
    engine: [415, 306],
    frontBrake: [645, 316],
    rearWheel: [208, 344],
    forks: [590, 230],
    rearShock: [341, 255],
    sideStand: [330, 402],
    rack: [165, 158],
  },
};

/** Ordered keyword rules (title + body), then a default part per feature kind. */
const keywordRules: [RegExp, Part][] = [
  [/side-stand|side stand/i, "sideStand"],
  [/rear pedal/i, "rearWheel"],
  [/\bforks?\b/i, "forks"],
  [/mono-?shock|mono-suspension|suspension/i, "rearShock"],
  [/handlebar|ergonomic/i, "handlebar"],
  [/\babs\b|disc|brake/i, "frontBrake"],
  [/tft|display|meter|navigation|smart key/i, "console"],
  [/\bled\b|headlamp|lighting|face/i, "headlamp"],
  [/touring|top box|saddle/i, "rack"],
  [/storage|seat/i, "seat"],
];

const kindDefault: Record<BikeFeature["kind"], Part> = {
  engine: "engine",
  lighting: "headlamp",
  brakes: "frontBrake",
  technology: "console",
  comfort: "seat",
  storage: "seat",
  safety: "frontBrake",
};

/** Exported so the mapping can be inspected or extended per silhouette. */
export const hotspotOverrides = { anchors, keywordRules, kindDefault };

export function hotspotPosition(bike: Bike, f: BikeFeature): { x: number; y: number } {
  if (bike.heroImage) return { x: f.x, y: f.y };
  const text = `${f.title} ${f.body}`;
  const part = keywordRules.find(([re]) => re.test(text))?.[1] ?? kindDefault[f.kind];
  const px = anchors[bike.silhouette][part] ?? anchors[bike.silhouette][kindDefault[f.kind]];
  if (!px) return { x: f.x, y: f.y };
  return { x: (px[0] / 800) * 100, y: (px[1] / 480) * 100 };
}

/** Spread hotspots that would overlap (e.g. two features on the console). */
export function hotspotLayout(bike: Bike) {
  const placed: { id: string; x: number; y: number }[] = [];
  for (const f of bike.features) {
    const p = hotspotPosition(bike, f);
    let { x, y } = p;
    let guard = 0;
    while (placed.some((q) => Math.abs(q.x - x) < 4.5 && Math.abs(q.y - y) < 7) && guard++ < 6) {
      x -= 5;
      y += 3;
    }
    placed.push({ id: f.id, x, y });
  }
  return placed;
}
