import type { BikeSilhouette as Shape } from "@/lib/types";
import { useId } from "react";

/**
 * Studio silhouette — a hand-drawn side-profile render used whenever licensed
 * photography is not yet supplied. It is deliberately an archetype (scooter,
 * commuter, street, naked, adventure) rather than a replica of any model, and
 * takes the selected colour so the configurator stays live.
 *
 * Frame: 800 × 480, bike faces right, ground at y = 430.
 */
export function BikeSilhouette({
  shape,
  color = "#1f4f8f",
  accent,
  className,
  title,
  accessories = [],
}: {
  shape: Shape;
  color?: string;
  accent?: string;
  className?: string;
  title?: string;
  /** Accessory ids to draw on top (crash-guard, top-box, back-rest, …). */
  accessories?: string[];
}) {
  const uid = useId().replace(/:/g, "");
  const ids = {
    paint: `paint-${uid}`,
    sheen: `sheen-${uid}`,
    chrome: `chrome-${uid}`,
    tyre: `tyre-${uid}`,
    shadow: `shadow-${uid}`,
    metal: `metal-${uid}`,
  };
  const has = (id: string) => accessories.includes(id);
  const accentColor = accent ?? "#16171a";

  return (
    <svg viewBox="0 0 800 480" className={className} role="img" aria-label={title ?? "Motorcycle illustration"}>
      <defs>
        <linearGradient id={ids.paint} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="1" />
          <stop offset="0.55" stopColor={color} />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={ids.sheen} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={ids.chrome} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f2f0" />
          <stop offset="0.45" stopColor="#8f9399" />
          <stop offset="0.55" stopColor="#5c6066" />
          <stop offset="1" stopColor="#c9cbcd" />
        </linearGradient>
        <linearGradient id={ids.metal} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3e44" />
          <stop offset="1" stopColor="#15171a" />
        </linearGradient>
        <radialGradient id={ids.tyre} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.78" stopColor="#0d0e10" />
          <stop offset="0.9" stopColor="#1c1e22" />
          <stop offset="1" stopColor="#0a0b0c" />
        </radialGradient>
        <radialGradient id={ids.shadow} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="400" cy="432" rx="330" ry="16" fill={`url(#${ids.shadow})`} />

      {shape === "scooter" && <Scooter ids={ids} accent={accentColor} has={has} />}
      {shape === "commuter" && <Commuter ids={ids} accent={accentColor} has={has} />}
      {shape === "street" && <Street ids={ids} accent={accentColor} has={has} />}
      {shape === "naked" && <Naked ids={ids} accent={accentColor} has={has} />}
      {shape === "adventure" && <Adventure ids={ids} accent={accentColor} has={has} />}
    </svg>
  );
}

type Ids = { paint: string; sheen: string; chrome: string; tyre: string; shadow: string; metal: string };
type PartProps = { ids: Ids; accent: string; has: (id: string) => boolean };

/* ───────────────────────── shared parts ───────────────────────── */

function Wheel({
  cx,
  cy,
  r,
  ids,
  spokes = 5,
  disc,
  rimColor = "#2a2d32",
}: {
  cx: number;
  cy: number;
  r: number;
  ids: Ids;
  spokes?: number;
  disc?: boolean;
  rimColor?: string;
}) {
  const inner = r * 0.72;
  const hub = r * 0.14;
  const arms = Array.from({ length: spokes }, (_, i) => {
    const a = (i / spokes) * Math.PI * 2 - Math.PI / 2;
    const a2 = a + 0.16;
    return `M ${cx + Math.cos(a) * hub} ${cy + Math.sin(a) * hub} L ${cx + Math.cos(a) * inner * 0.96} ${cy + Math.sin(a) * inner * 0.96} L ${cx + Math.cos(a2) * inner * 0.96} ${cy + Math.sin(a2) * inner * 0.96} Z`;
  });
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${ids.tyre})`} />
      <circle cx={cx} cy={cy} r={r - 2} fill="none" stroke="#2b2e33" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={inner + 4} fill="none" stroke={rimColor} strokeWidth="6" />
      <circle cx={cx} cy={cy} r={inner + 7} fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1" />
      {disc && (
        <g>
          <circle cx={cx} cy={cy} r={inner * 0.62} fill="none" stroke={`url(#${ids.chrome})`} strokeWidth={inner * 0.18} opacity="0.85" />
          <rect x={cx + inner * 0.3} y={cy - inner * 0.55} width={inner * 0.32} height={inner * 0.28} rx="4" fill="#1b1d21" stroke="#3a3e44" />
        </g>
      )}
      {arms.map((d, i) => (
        <path key={i} d={d} fill={rimColor} stroke="#3b3f45" strokeWidth="0.8" />
      ))}
      <circle cx={cx} cy={cy} r={hub} fill={`url(#${ids.chrome})`} />
      <circle cx={cx} cy={cy} r={hub * 0.4} fill="#1b1d21" />
      <path
        d={`M ${cx - r * 0.7} ${cy - r * 0.7} A ${r} ${r} 0 0 1 ${cx + r * 0.2} ${cy - r * 0.98}`}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.18"
        strokeWidth="2"
      />
    </g>
  );
}

function Headlight({ x, y, r = 22 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#1b1d21" stroke="#3b3f45" />
      <circle cx={x + 3} cy={y} r={r * 0.7} fill="#f4f1e8" opacity="0.92" />
      <circle cx={x + 6} cy={y - 3} r={r * 0.25} fill="#fff" />
    </g>
  );
}

function Mirror({ x, y, h = 46 }: { x: number; y: number; h?: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x - 8} y2={y - h} stroke="#2b2e33" strokeWidth="3" />
      <ellipse cx={x - 12} cy={y - h - 6} rx="16" ry="9" fill="#17191c" stroke="#3b3f45" />
    </g>
  );
}

/* ───────────────────────── scooter ───────────────────────── */

function Scooter({ ids, accent, has }: PartProps) {
  return (
    <g>
      {/* rear wheel + hugger */}
      <Wheel cx={225} cy={366} r={64} ids={ids} spokes={5} />
      <Wheel cx={600} cy={366} r={64} ids={ids} spokes={5} disc />

      {/* engine / CVT casing */}
      <path d="M 236 352 L 330 318 Q 360 316 362 340 L 360 368 Q 356 382 330 382 L 260 380 Q 236 376 236 352 Z" fill={`url(#${ids.metal})`} />
      <path d="M 220 350 L 330 334" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2" />
      {/* muffler */}

      {/* rear body */}
      <path
        d="M 118 262 Q 112 220 168 206 L 380 196 Q 418 196 430 222 L 446 302 Q 448 320 430 324 L 350 330 Q 300 306 240 302 Q 180 300 150 300 Q 122 296 118 262 Z"
        fill={`url(#${ids.paint})`}
      />
      <path d="M 130 248 Q 140 220 190 214 L 360 206" fill="none" stroke={`url(#${ids.sheen})`} strokeWidth="10" strokeLinecap="round" opacity="0.7" />
      <path d="M 300 266 Q 360 258 420 268" stroke={accent} strokeOpacity="0.45" strokeWidth="2" fill="none" />
      {/* tail light */}
      <path d="M 116 246 L 138 236 L 140 256 L 120 264 Z" fill="#b3121c" />

      {/* seat */}
      <path d="M 150 210 Q 152 186 196 182 L 300 178 Q 340 176 380 186 Q 400 192 398 202 L 168 214 Q 150 216 150 210 Z" fill="#141518" />
      <path d="M 180 190 L 360 184" stroke="#fff" strokeOpacity="0.08" strokeWidth="3" />
      {/* grab rail */}
      <path d="M 140 214 Q 132 196 160 194" stroke="#2a2d32" strokeWidth="7" fill="none" strokeLinecap="round" />

      {/* floorboard */}
      <path d="M 420 318 L 512 318 Q 526 318 526 332 L 520 344 L 410 344 Z" fill="#1a1c20" />
      <path d="M 418 322 L 510 322" stroke="#ffffff" strokeOpacity="0.1" />

      {/* front apron / leg shield */}
      <path
        d="M 488 330 Q 500 250 532 180 Q 548 146 572 132 L 596 128 Q 612 132 606 152 Q 588 214 578 298 Q 574 330 548 340 L 500 344 Z"
        fill={`url(#${ids.paint})`}
      />
      <path d="M 590 138 Q 572 200 566 300" stroke={`url(#${ids.sheen})`} strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.8" />
      {/* front fork */}
      <path d="M 584 230 L 604 366" stroke="#2a2d32" strokeWidth="12" strokeLinecap="round" />
      <path d="M 588 240 L 604 340" stroke="#fff" strokeOpacity="0.15" strokeWidth="2" />
      {/* front fender */}
      <path d="M 548 330 Q 600 284 656 318 L 646 330 Q 600 302 560 338 Z" fill={`url(#${ids.paint})`} />

      {/* handlebar cowl + headlamp */}
      <path d="M 520 118 Q 540 96 592 98 L 628 104 Q 640 110 630 124 L 600 136 L 534 134 Q 516 130 520 118 Z" fill={`url(#${ids.paint})`} />
      <path d="M 598 108 L 628 112 L 622 124 L 600 126 Z" fill="#f4f1e8" opacity="0.95" />
      <rect x="540" y="104" width="38" height="14" rx="3" fill="#0e0f11" stroke="#3b3f45" />
      <path d="M 520 118 L 486 110" stroke="#1b1d21" strokeWidth="8" strokeLinecap="round" />
      <Mirror x={548} y={102} h={34} />
      {/* front indicator / LED signature */}
      <path d="M 594 158 L 606 152 L 602 186 L 590 190 Z" fill="#f4f1e8" opacity="0.8" />

      {has("back-rest") && <path d="M 136 196 Q 128 160 150 150 L 170 152 Q 176 176 168 202 Z" fill="#141518" stroke="#2b2e33" />}
      {has("side-step") && <path d="M 262 300 L 300 300 L 296 310 L 260 310 Z" fill="#c9cbcd" />}
      {has("floor-mat") && <path d="M 422 312 L 512 312 L 512 318 L 420 318 Z" fill="#33363c" />}
      {has("mobile-holder") && <rect x="548" y="72" width="22" height="34" rx="4" fill="#0e0f11" stroke="#6d7279" />}
    </g>
  );
}

/* ───────────────────────── commuter ───────────────────────── */

function Commuter({ ids, accent, has }: PartProps) {
  return (
    <g>
      <Wheel cx={205} cy={346} r={84} ids={ids} spokes={5} />
      <Wheel cx={604} cy={346} r={84} ids={ids} spokes={5} disc />

      {/* swingarm + chain */}
      <path d="M 205 346 L 350 336" stroke="#1b1d21" strokeWidth="14" strokeLinecap="round" />
      <path d="M 210 330 L 352 322 L 352 340 L 212 350 Z" fill="#202328" opacity="0.9" />
      {/* rear shocks */}
      <path d="M 234 226 L 216 326" stroke={`url(#${ids.chrome})`} strokeWidth="9" strokeLinecap="round" />
      <path d="M 232 244 L 222 304" stroke={accent} strokeWidth="11" strokeDasharray="3 3" opacity="0.8" />

      {/* frame down tube */}
      <path d="M 520 168 L 440 300 L 360 336" stroke="#1b1d21" strokeWidth="10" fill="none" strokeLinejoin="round" />

      {/* engine */}
      <g>
        <path d="M 352 286 L 452 270 Q 470 268 474 286 L 482 346 Q 482 366 460 368 L 368 372 Q 344 372 342 350 Z" fill={`url(#${ids.metal})`} />
        <path d="M 420 222 L 470 214 L 478 276 L 430 284 Z" fill="#2d3136" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M ${424 + i * 2} ${232 + i * 10} L ${472 + i} ${226 + i * 10}`} stroke="#4a4f56" strokeWidth="3" />
        ))}
        <circle cx="384" cy="330" r="22" fill="#2b2e33" stroke="#4a4f56" strokeWidth="2" />
        <circle cx="384" cy="330" r="9" fill={`url(#${ids.chrome})`} />
      </g>

      {/* exhaust */}
      <path d="M 466 352 Q 430 384 360 384 L 250 372" stroke="#2b2e33" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M 340 382 L 196 352 Q 180 348 182 338 L 186 330 Q 192 322 208 326 L 352 360 Z" fill={`url(#${ids.chrome})`} />
      <path d="M 200 336 L 340 366" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />

      {/* side panel */}
      <path d="M 256 224 L 350 220 Q 362 222 358 240 L 344 286 L 266 290 Q 252 288 254 274 Z" fill={`url(#${ids.paint})`} />
      <path d="M 268 246 L 340 242" stroke={accent} strokeWidth="5" />

      {/* rear fender + tail */}
      <path d="M 110 262 Q 140 228 210 214 L 260 212 L 252 226 Q 180 236 132 270 Z" fill={`url(#${ids.paint})`} />
      <path d="M 104 226 L 140 216 L 150 232 L 112 244 Z" fill="#b3121c" />
      {/* seat */}
      <path d="M 146 206 Q 148 186 190 184 L 360 180 Q 392 180 402 196 L 404 206 L 170 220 Q 146 222 146 206 Z" fill="#141518" />
      <path d="M 186 192 L 380 186" stroke="#fff" strokeOpacity="0.08" strokeWidth="3" />
      {/* grab rail */}
      <path d="M 138 212 Q 128 194 160 190 L 200 188" stroke="#2a2d32" strokeWidth="6" fill="none" strokeLinecap="round" />

      {/* tank */}
      <path
        d="M 372 196 Q 380 160 430 150 L 500 146 Q 532 148 540 172 L 534 206 Q 520 226 480 228 L 400 232 Q 372 228 372 196 Z"
        fill={`url(#${ids.paint})`}
      />
      <path d="M 392 176 Q 420 158 500 156" stroke={`url(#${ids.sheen})`} strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M 396 214 L 520 196" stroke={accent} strokeWidth="6" strokeLinecap="round" />
      <path d="M 400 222 L 512 208" stroke={accent} strokeWidth="2" strokeOpacity="0.6" />

      {/* forks */}
      <path d="M 548 152 L 604 346" stroke={`url(#${ids.chrome})`} strokeWidth="11" strokeLinecap="round" />
      <path d="M 560 212 L 604 346" stroke="#25282d" strokeWidth="15" strokeLinecap="round" />
      {/* front fender */}
      <path d="M 548 280 Q 604 238 668 270 L 664 282 Q 604 254 556 292 Z" fill={`url(#${ids.paint})`} />

      {/* headlamp cowl */}
      <path d="M 560 150 Q 592 140 620 158 L 626 192 Q 606 214 578 206 Z" fill={`url(#${ids.paint})`} />
      <Headlight x={606} y={180} r={20} />
      {/* handlebar */}
      <path d="M 520 140 Q 540 124 572 130" stroke="#1b1d21" strokeWidth="7" fill="none" strokeLinecap="round" />
      <rect x="552" y="120" width="30" height="20" rx="6" fill="#121316" stroke="#3b3f45" />
      <Mirror x={540} y={130} h={44} />

      {has("crash-guard") && <path d="M 470 230 Q 512 250 500 320 L 486 330" stroke={`url(#${ids.chrome})`} strokeWidth="8" fill="none" strokeLinecap="round" />}
      {has("saree-guard") && <path d="M 150 300 Q 170 250 230 262 L 236 330 Q 190 330 150 300 Z" fill="none" stroke="#c9cbcd" strokeWidth="4" />}
      {has("back-rest") && <path d="M 132 186 Q 126 156 146 146 L 164 148 Q 168 170 162 192 Z" fill="#141518" stroke="#2b2e33" />}
      {has("top-box") && <TopBox x={92} y={130} />}
      {has("tank-pad") && <path d="M 420 172 L 466 168 L 470 204 L 424 208 Z" fill="#0e0f11" opacity="0.8" />}
      {has("mobile-holder") && <rect x="556" y="94" width="22" height="32" rx="4" fill="#0e0f11" stroke="#6d7279" />}
    </g>
  );
}

/* ───────────────────────── street ───────────────────────── */

function Street({ ids, accent, has }: PartProps) {
  return (
    <g>
      <Wheel cx={205} cy={346} r={84} ids={ids} spokes={6} disc />
      <Wheel cx={608} cy={346} r={84} ids={ids} spokes={6} disc />

      {/* swingarm */}
      <path d="M 205 346 L 360 322" stroke="#1b1d21" strokeWidth="18" strokeLinecap="round" />
      <path d="M 220 336 L 352 316" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2" />
      {/* monoshock */}
      <path d="M 318 236 L 344 318" stroke={accent === "#16171a" ? "#c0262d" : accent} strokeWidth="10" strokeLinecap="round" opacity="0.9" />

      {/* frame */}
      <path d="M 530 166 L 452 300 L 360 330" stroke="#1b1d21" strokeWidth="11" fill="none" strokeLinejoin="round" />
      {/* engine */}
      <path d="M 356 282 L 456 266 Q 474 264 478 282 L 486 344 Q 486 364 464 366 L 372 370 Q 348 370 346 348 Z" fill={`url(#${ids.metal})`} />
      <path d="M 426 218 L 474 210 L 482 274 L 434 282 Z" fill="#2d3136" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M ${430 + i * 2} ${228 + i * 10} L ${476 + i} ${222 + i * 10}`} stroke="#4a4f56" strokeWidth="3" />
      ))}
      <circle cx="388" cy="326" r="20" fill="#2b2e33" stroke="#4a4f56" strokeWidth="2" />

      {/* exhaust — short, upswept */}
      <path d="M 470 350 Q 430 380 330 372 L 260 344" stroke="#2b2e33" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M 300 360 L 220 318 Q 206 310 214 298 L 222 290 Q 232 284 246 292 L 320 340 Z" fill="#2a2d32" />
      <path d="M 226 296 L 304 344" stroke={`url(#${ids.chrome})`} strokeWidth="5" />

      {/* rear subframe + side cover */}
      <path d="M 210 206 L 350 300 L 366 290 L 236 200 Z" fill="#1b1d21" />
      <path d="M 300 206 L 380 204 L 372 262 L 330 270 Z" fill="#202328" />
      {/* tail — sharp, upswept */}
      <path d="M 98 196 L 160 184 L 300 200 L 330 222 L 300 244 L 160 236 Q 120 228 98 196 Z" fill={`url(#${ids.paint})`} />
      <path d="M 104 196 L 286 206" stroke={accent} strokeWidth="4" strokeOpacity="0.8" />
      <path d="M 92 194 L 112 190 L 116 204 L 98 206 Z" fill="#d11b26" />
      <path d="M 140 236 Q 120 262 132 280" stroke="#1b1d21" strokeWidth="6" fill="none" />
      {/* seat — stepped */}
      <path d="M 170 192 L 260 186 Q 280 186 296 196 L 316 194 L 392 192 Q 410 194 410 206 L 332 214 L 180 206 Z" fill="#141518" />

      {/* tank with shrouds */}
      <path d="M 380 190 Q 400 152 456 142 L 520 140 Q 548 146 548 172 L 540 206 L 404 226 Q 380 222 380 190 Z" fill={`url(#${ids.paint})`} />
      <path d="M 396 172 Q 430 152 512 150" stroke={`url(#${ids.sheen})`} strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M 456 200 L 556 176 L 572 214 L 500 262 L 462 252 Z" fill={`url(#${ids.paint})`} />
      <path d="M 470 214 L 548 192 L 556 210 L 494 248 Z" fill={accent} opacity="0.85" />

      {/* forks */}
      <path d="M 552 150 L 608 346" stroke="#25282d" strokeWidth="15" strokeLinecap="round" />
      <path d="M 556 162 L 586 270" stroke={`url(#${ids.chrome})`} strokeWidth="8" strokeLinecap="round" />
      {/* front fender */}
      <path d="M 560 282 Q 608 248 664 274 L 660 286 Q 608 262 566 294 Z" fill={`url(#${ids.paint})`} />

      {/* headlamp — angular LED */}
      <path d="M 566 148 L 628 150 L 646 176 L 620 204 L 580 196 Z" fill={`url(#${ids.paint})`} />
      <path d="M 610 162 L 636 172 L 620 190 L 600 184 Z" fill="#f4f1e8" opacity="0.95" />
      <path d="M 590 156 L 622 158" stroke="#f4f1e8" strokeWidth="2" opacity="0.8" />
      {/* bar + console */}
      <path d="M 520 140 Q 544 126 574 132" stroke="#1b1d21" strokeWidth="7" fill="none" strokeLinecap="round" />
      <rect x="560" y="118" width="34" height="22" rx="4" fill="#0e0f11" stroke="#3b3f45" />
      <rect x="565" y="122" width="24" height="14" rx="2" fill="#1f4f8f" opacity="0.55" />
      <Mirror x={540} y={132} h={42} />

      {has("crash-guard") && <path d="M 476 230 Q 520 250 506 320 L 492 330" stroke={`url(#${ids.chrome})`} strokeWidth="8" fill="none" strokeLinecap="round" />}
      {has("saree-guard") && <path d="M 150 300 Q 170 250 230 262 L 236 330 Q 190 330 150 300 Z" fill="none" stroke="#c9cbcd" strokeWidth="4" />}
      {has("tank-pad") && <path d="M 428 168 L 474 162 L 478 200 L 432 206 Z" fill="#0e0f11" opacity="0.8" />}
      {has("tank-bag") && <path d="M 420 150 Q 424 112 470 108 L 520 112 Q 530 134 524 150 Z" fill="#17191c" stroke="#3b3f45" />}
      {has("top-box") && <TopBox x={88} y={110} />}
      {has("mobile-holder") && <rect x="530" y="92" width="22" height="32" rx="4" fill="#0e0f11" stroke="#6d7279" />}
    </g>
  );
}

/* ───────────────────────── naked / streetfighter ───────────────────────── */

function Naked({ ids, accent, has }: PartProps) {
  const fork = accent === "#c8a24a" ? "#c8a24a" : "#b8923f";
  return (
    <g>
      <Wheel cx={205} cy={344} r={86} ids={ids} spokes={3} disc rimColor="#1c1e22" />
      <Wheel cx={612} cy={344} r={86} ids={ids} spokes={3} disc rimColor="#1c1e22" />

      {/* box-section swingarm */}
      <path d="M 196 334 L 362 306 L 368 330 L 210 356 Z" fill="#1d2024" />
      <path d="M 214 340 L 356 316" stroke="#fff" strokeOpacity="0.15" strokeWidth="2" />
      {/* monoshock */}
      <path d="M 330 220 L 352 306" stroke="#c0262d" strokeWidth="11" strokeLinecap="round" />
      <path d="M 330 220 L 352 306" stroke="#fff" strokeOpacity="0.25" strokeWidth="11" strokeDasharray="2 4" />

      {/* frame */}
      <path d="M 532 156 L 452 290 L 360 318" stroke="#1b1d21" strokeWidth="13" fill="none" strokeLinejoin="round" />
      {/* engine */}
      <path d="M 352 276 L 462 260 Q 482 258 486 276 L 494 340 Q 494 362 470 364 L 368 368 Q 342 368 340 344 Z" fill={`url(#${ids.metal})`} />
      <path d="M 428 206 L 480 198 L 488 268 L 436 276 Z" fill="#2d3136" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M ${432 + i * 2} ${214 + i * 10} L ${482 + i} ${208 + i * 10}`} stroke="#4a4f56" strokeWidth="3" />
      ))}
      <circle cx="386" cy="324" r="22" fill="#2b2e33" stroke="#4a4f56" strokeWidth="2" />
      <circle cx="386" cy="324" r="8" fill={fork} />
      {/* belly-pan exhaust */}
      <path d="M 476 350 Q 420 386 330 376" stroke="#2b2e33" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M 336 360 L 268 352 Q 252 352 252 366 L 256 380 Q 262 392 280 390 L 344 388 Z" fill="#1d2024" />
      <path d="M 262 364 L 334 368" stroke={`url(#${ids.chrome})`} strokeWidth="4" />

      {/* rear subframe + side cover */}
      <path d="M 210 206 L 350 300 L 366 290 L 236 200 Z" fill="#1b1d21" />
      <path d="M 300 206 L 380 204 L 372 262 L 330 270 Z" fill="#202328" />
      {/* sharp tail */}
      <path d="M 104 178 L 170 172 L 316 192 L 340 214 L 310 232 L 170 222 Q 128 210 104 178 Z" fill={`url(#${ids.paint})`} />
      <path d="M 100 176 L 124 172 L 126 186 L 106 188 Z" fill="#d11b26" />
      <path d="M 130 214 L 92 258 L 120 264" stroke="#1b1d21" strokeWidth="5" fill="none" />
      {/* split seat */}
      <path d="M 170 180 L 270 180 Q 290 182 300 192 L 316 190 L 396 188 Q 414 190 412 204 L 336 210 L 180 196 Z" fill="#141518" />

      {/* muscular tank */}
      <path d="M 378 190 Q 394 136 466 124 L 530 124 Q 566 132 566 166 L 552 206 L 404 224 Q 378 220 378 190 Z" fill={`url(#${ids.paint})`} />
      <path d="M 398 164 Q 440 134 530 134" stroke={`url(#${ids.sheen})`} strokeWidth="14" fill="none" strokeLinecap="round" />
      {/* big shrouds */}
      <path d="M 444 196 L 572 160 L 594 206 L 520 270 L 456 262 Z" fill={`url(#${ids.paint})`} />
      <path d="M 466 214 L 566 184 L 578 208 L 512 256 L 470 250 Z" fill={accent} opacity="0.92" />
      <path d="M 448 240 L 520 222" stroke="#fff" strokeOpacity="0.2" strokeWidth="2" />

      {/* USD forks */}
      <path d="M 556 140 L 612 344" stroke={fork} strokeWidth="18" strokeLinecap="round" />
      <path d="M 560 150 L 590 260" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" />
      <path d="M 592 270 L 612 344" stroke="#1b1d21" strokeWidth="12" strokeLinecap="round" />
      {/* short fender */}
      <path d="M 570 276 Q 612 246 660 268 L 656 280 Q 612 258 576 288 Z" fill="#141518" />

      {/* X-headlamp */}
      <path d="M 572 136 L 630 140 L 652 170 L 628 200 L 586 194 Z" fill="#141518" />
      <path d="M 604 150 L 640 170 L 604 188" stroke="#f4f1e8" strokeWidth="5" fill="none" strokeLinejoin="round" />
      <path d="M 590 150 L 612 170 L 590 188" stroke="#f4f1e8" strokeWidth="3" fill="none" opacity="0.6" />
      {/* bar + console */}
      <path d="M 520 128 Q 548 112 582 120" stroke="#1b1d21" strokeWidth="8" fill="none" strokeLinecap="round" />
      <rect x="566" y="108" width="36" height="22" rx="4" fill="#0e0f11" stroke="#3b3f45" />
      <Mirror x={540} y={120} h={40} />

      {has("crash-guard") && <path d="M 486 222 Q 530 244 514 316 L 500 326" stroke="#1b1d21" strokeWidth="9" fill="none" strokeLinecap="round" />}
      {has("frame-slider") && <circle cx="470" cy="268" r="10" fill="#0e0f11" stroke="#c0262d" strokeWidth="3" />}
      {has("tank-pad") && <path d="M 430 150 L 480 142 L 486 190 L 436 198 Z" fill="#0e0f11" opacity="0.8" />}
      {has("tank-bag") && <path d="M 420 132 Q 426 92 476 88 L 528 94 Q 538 116 532 132 Z" fill="#17191c" stroke="#3b3f45" />}
      {has("knee-pads") && <path d="M 410 176 L 440 172 L 444 210 L 414 214 Z" fill="#0e0f11" />}
      {has("top-box") && <TopBox x={92} y={96} />}
      {has("mobile-holder") && <rect x="526" y="82" width="22" height="32" rx="4" fill="#0e0f11" stroke="#6d7279" />}
    </g>
  );
}

/* ───────────────────────── adventure ───────────────────────── */

function Adventure({ ids, accent, has }: PartProps) {
  return (
    <g>
      <Wheel cx={208} cy={344} r={86} ids={ids} spokes={3} disc rimColor="#1c1e22" />
      <Wheel cx={620} cy={344} r={86} ids={ids} spokes={3} disc rimColor="#1c1e22" />

      <path d="M 198 334 L 362 300 L 368 326 L 212 356 Z" fill="#1d2024" />
      <path d="M 330 210 L 352 300" stroke="#c0262d" strokeWidth="11" strokeLinecap="round" />

      {/* frame */}
      <path d="M 540 140 L 456 284 L 360 312" stroke="#1b1d21" strokeWidth="13" fill="none" strokeLinejoin="round" />
      {/* engine */}
      <path d="M 352 270 L 462 254 Q 482 252 486 270 L 494 334 Q 494 356 470 358 L 368 362 Q 342 362 340 338 Z" fill={`url(#${ids.metal})`} />
      <path d="M 428 200 L 480 192 L 488 262 L 436 270 Z" fill="#2d3136" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M ${432 + i * 2} ${208 + i * 10} L ${482 + i} ${202 + i * 10}`} stroke="#4a4f56" strokeWidth="3" />
      ))}
      {/* bash plate */}
      <path d="M 360 366 L 490 356 L 500 340 L 504 368 Q 480 384 380 384 Z" fill="#8f9399" />
      {/* exhaust */}
      <path d="M 476 344 Q 420 380 330 370" stroke="#2b2e33" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M 336 352 L 262 344 Q 246 344 246 358 L 250 372 Q 256 384 274 382 L 344 380 Z" fill="#1d2024" />

      {/* rear subframe + side cover */}
      <path d="M 210 206 L 350 300 L 366 290 L 236 200 Z" fill="#1b1d21" />
      <path d="M 300 206 L 380 204 L 372 262 L 330 270 Z" fill="#202328" />
      {/* tail + rack */}
      <path d="M 108 170 L 172 164 L 316 184 L 340 206 L 310 226 L 170 214 Q 130 202 108 170 Z" fill={`url(#${ids.paint})`} />
      <path d="M 104 168 L 128 164 L 130 178 L 110 180 Z" fill="#d11b26" />
      <path d="M 120 158 L 220 152" stroke="#2a2d32" strokeWidth="6" strokeLinecap="round" />
      <path d="M 170 168 L 270 170 Q 290 172 300 182 L 316 180 L 400 176 Q 420 178 418 194 L 336 202 L 180 190 Z" fill="#141518" />

      {/* tank */}
      <path d="M 384 180 Q 400 130 470 118 L 532 118 Q 566 126 566 160 L 554 198 L 408 216 Q 384 212 384 180 Z" fill={`url(#${ids.paint})`} />
      <path d="M 402 156 Q 444 128 532 128" stroke={`url(#${ids.sheen})`} strokeWidth="14" fill="none" strokeLinecap="round" />
      {/* rally-style shroud */}
      <path d="M 452 184 L 580 140 L 602 196 L 526 262 L 462 254 Z" fill={`url(#${ids.paint})`} />
      <path d="M 470 204 L 572 166 L 584 194 L 520 246 L 476 240 Z" fill={accent} opacity="0.9" />

      {/* long-travel forks */}
      <path d="M 562 120 L 620 344" stroke="#c8a24a" strokeWidth="18" strokeLinecap="round" />
      <path d="M 566 130 L 598 250" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" />
      <path d="M 600 262 L 620 344" stroke="#1b1d21" strokeWidth="12" strokeLinecap="round" />
      {/* beak fender */}
      <path d="M 588 196 L 668 222 L 664 236 L 598 224 Z" fill={`url(#${ids.paint})`} />
      <path d="M 590 266 Q 620 244 662 262 L 658 274 Q 620 256 596 278 Z" fill="#141518" />

      {/* headlamp + windscreen */}
      <path d="M 578 120 L 636 128 L 652 162 L 624 192 L 590 184 Z" fill="#141518" />
      <path d="M 604 140 L 638 156 L 616 178 L 600 170 Z" fill="#f4f1e8" opacity="0.95" />
      <path d="M 574 120 L 586 62 L 620 70 L 636 128 Z" fill="#cfd8de" opacity="0.28" stroke="#cfd8de" strokeOpacity="0.4" />
      {/* wide bar + hand guards */}
      <path d="M 520 104 Q 552 90 590 100" stroke="#1b1d21" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M 512 96 Q 498 108 512 122 L 530 112 Z" fill="#141518" stroke="#3b3f45" />
      <rect x="570" y="96" width="34" height="22" rx="4" fill="#0e0f11" stroke="#3b3f45" />
      <Mirror x={540} y={98} h={40} />

      {has("crash-guard") && <path d="M 486 216 Q 534 236 518 310 L 502 320" stroke="#1b1d21" strokeWidth="9" fill="none" strokeLinecap="round" />}
      {has("frame-slider") && <circle cx="470" cy="262" r="10" fill="#0e0f11" stroke="#c0262d" strokeWidth="3" />}
      {has("tank-pad") && <path d="M 434 146 L 484 138 L 490 184 L 440 192 Z" fill="#0e0f11" opacity="0.8" />}
      {has("tank-bag") && <path d="M 424 126 Q 430 86 480 82 L 532 88 Q 542 110 536 126 Z" fill="#17191c" stroke="#3b3f45" />}
      {has("knee-pads") && <path d="M 414 168 L 444 164 L 448 202 L 418 206 Z" fill="#0e0f11" />}
      {has("top-box") && <TopBox x={100} y={86} />}
      {has("mobile-holder") && <rect x="530" y="66" width="22" height="32" rx="4" fill="#0e0f11" stroke="#6d7279" />}
    </g>
  );
}

function TopBox({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M ${x} ${y + 12} Q ${x} ${y} ${x + 14} ${y} L ${x + 98} ${y} Q ${x + 112} ${y} ${x + 112} ${y + 14} L ${x + 108} ${y + 64} L ${x + 4} ${y + 64} Z`} fill="#17191c" stroke="#3b3f45" />
      <path d={`M ${x + 6} ${y + 30} L ${x + 106} ${y + 30}`} stroke="#3b3f45" />
      <rect x={x + 44} y={y + 36} width="24" height="6" rx="2" fill="#6d7279" />
    </g>
  );
}
