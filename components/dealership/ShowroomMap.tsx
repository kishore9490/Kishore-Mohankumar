"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { dealership } from "@/data/dealership";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/format";
import { directionsUrl, mapEmbedUrl } from "./links";


/* Deterministic street network for the stylised map (800 × 600). */
const MINOR_V = [70, 150, 215, 300, 360, 470, 540, 610, 690, 760];
const MINOR_H = [60, 130, 205, 265, 360, 420, 500, 560];

/**
 * Premium location panel: a stylised, abstract city map by default; the real
 * Google Maps embed loads only after the visitor asks for it (privacy + perf).
 */
export function ShowroomMap({ className, source = "dealership" }: { className?: string; source?: string }) {
  const [live, setLive] = useState(false);
  const reduce = useReducedMotion();

  return (
    <div className={cn("relative isolate overflow-hidden rounded-[28px] border border-white/[0.08] bg-ink-2 text-bone", className)}>
      {live ? (
        <iframe
          src={mapEmbedUrl}
          title={`Map showing ${dealership.name}, ${dealership.address.city}`}
          className="absolute inset-0 size-full border-0 bg-ink-2 grayscale-[0.35]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <>
          <svg
            viewBox="0 0 800 600"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 size-full"
            role="img"
            aria-label={`Illustrated map marking ${dealership.name} in ${dealership.address.line2 ?? dealership.address.city}`}
          >
            <defs>
              <radialGradient id="map-vignette" cx="0.5" cy="0.5" r="0.7">
                <stop offset="0" stopColor="#111317" stopOpacity="0" />
                <stop offset="1" stopColor="#0a0b0d" stopOpacity="0.95" />
              </radialGradient>
              <radialGradient id="map-glow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#d8232f" stopOpacity="0.38" />
                <stop offset="0.45" stopColor="#d8232f" stopOpacity="0.08" />
                <stop offset="1" stopColor="#d8232f" stopOpacity="0" />
              </radialGradient>
              <pattern id="map-dots" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="#efece6" fillOpacity="0.12" />
              </pattern>
            </defs>

            <g transform="rotate(-9 400 300)">
              {/* blocks */}
              <rect x="372" y="138" width="120" height="58" rx="4" fill="url(#map-dots)" />
              <rect x="100" y="380" width="170" height="100" rx="6" fill="url(#map-dots)" />
              <rect x="560" y="370" width="110" height="110" rx="6" fill="#efece6" fillOpacity="0.025" />
              {/* minor grid */}
              <g stroke="#efece6" strokeOpacity="0.07" strokeWidth="1.2">
                {MINOR_V.map((x) => (
                  <line key={`v${x}`} x1={x} y1={-80} x2={x} y2={680} />
                ))}
                {MINOR_H.map((y) => (
                  <line key={`h${y}`} x1={-80} y1={y} x2={880} y2={y} />
                ))}
              </g>
              {/* secondary roads */}
              <g stroke="#efece6" strokeOpacity="0.14" strokeWidth="3" fill="none" strokeLinecap="round">
                <line x1={300} y1={-80} x2={300} y2={680} />
                <line x1={540} y1={-80} x2={540} y2={680} />
                <path d="M -80 205 C 200 215 420 190 880 205" />
              </g>
            </g>

            {/* river */}
            <path d="M -40 70 C 140 120 220 40 380 70 S 640 140 860 90" stroke="#5b7da6" strokeOpacity="0.16" strokeWidth="14" fill="none" strokeLinecap="round" />
            {/* arterial */}
            <path d="M -40 470 C 180 410 330 330 400 300 S 640 190 860 150" stroke="#efece6" strokeOpacity="0.28" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M -40 470 C 180 410 330 330 400 300 S 640 190 860 150" stroke="#0a0b0d" strokeOpacity="0.9" strokeWidth="1" strokeDasharray="10 12" fill="none" />
            {/* ring road */}
            <path d="M 120 640 C 140 470 210 380 280 320 S 380 160 340 -40" stroke="#efece6" strokeOpacity="0.12" strokeWidth="4" fill="none" />

            <rect width="800" height="600" fill="url(#map-vignette)" />

            {/* location */}
            <circle cx="400" cy="300" r="150" fill="url(#map-glow)" />
            <g fill="none" stroke="#d8232f">
              <circle cx="400" cy="300" r="34" strokeOpacity="0.35" />
              <circle cx="400" cy="300" r="64" strokeOpacity="0.15" />
            </g>
            {!reduce && (
              <circle cx="400" cy="300" r="20" fill="none" stroke="#d8232f" strokeWidth="1.5">
                <animate attributeName="r" from="16" to="70" dur="2.8s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" from="0.7" to="0" dur="2.8s" repeatCount="indefinite" />
              </circle>
            )}
            <g transform="translate(400 300)">
              <path d="M 0 0 C -4 -10 -16 -18 -16 -32 A 16 16 0 0 1 16 -32 C 16 -18 4 -10 0 0 Z" fill="#d8232f" />
              <circle cx="0" cy="-32" r="5.5" fill="#0a0b0d" />
              <ellipse cx="0" cy="2" rx="7" ry="2.5" fill="#000" fillOpacity="0.6" />
            </g>
          </svg>

          {/* Address label next to the pin */}
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 top-1/2 ml-6 -translate-y-[calc(100%+1.25rem)] rounded-xl border border-white/10 bg-ink/80 px-3.5 py-2.5 backdrop-blur-md max-sm:left-auto max-sm:right-4"
          >
            <p className="whitespace-nowrap text-[13px] font-medium">{dealership.name}</p>
            <p className="eyebrow mt-0.5 whitespace-nowrap text-[10px] text-bone/50">
              {[dealership.address.line2, dealership.address.city].filter(Boolean).join(" · ")}
            </p>
          </motion.div>
        </>
      )}

      {/* Controls */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-4 sm:p-6",
          !live && "bg-gradient-to-t from-ink/85 via-ink/40 to-transparent pt-16 sm:pt-20",
        )}
      >
        <ButtonLink
          href={directionsUrl}
          icon="arrow-up-right"
          className="pointer-events-auto"
          onClick={() => track("directions_click", { source })}
        >
          Get directions
        </ButtonLink>
        {!live ? (
          <Button variant="outline" size="md" className="pointer-events-auto border-white/25 bg-ink/40 backdrop-blur-md" iconLeft="map-pin" onClick={() => setLive(true)}>
            Load interactive map
          </Button>
        ) : (
          <a
            href={dealership.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto inline-flex h-11 items-center gap-1.5 rounded-full bg-ink/70 px-4 text-[13px] text-bone/80 backdrop-blur-md hover:text-bone"
          >
            Open in Google Maps <Icon name="arrow-up-right" size={14} />
          </a>
        )}
      </div>
      {!live && (
        <p className="eyebrow absolute left-5 top-5 text-[10px] text-bone/40 sm:left-6 sm:top-6">Map loads from Google only when you ask</p>
      )}
    </div>
  );
}
