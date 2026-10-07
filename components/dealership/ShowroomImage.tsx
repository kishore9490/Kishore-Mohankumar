import Image from "next/image";
import { dealership } from "@/data/dealership";
import { cn } from "@/lib/format";

/**
 * Showroom photography slot. Renders `dealership.showroomImage` when supplied;
 * otherwise an abstract architectural study — never a stock or fake photo.
 */
export function ShowroomImage({ className, sizes = "(min-width: 1024px) 40vw, 100vw" }: { className?: string; sizes?: string }) {
  if (dealership.showroomImage) {
    return (
      <div className={cn("relative overflow-hidden rounded-[28px] bg-ink-2", className)}>
        <Image src={dealership.showroomImage} alt={`${dealership.name} showroom, ${dealership.address.city}`} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }
  const mullions = Array.from({ length: 9 }, (_, i) => 90 + i * 70);
  return (
    <figure className={cn("relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-ink-2 text-bone", className)}>
      <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <linearGradient id="sr-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#efece6" stopOpacity="0.1" />
            <stop offset="0.7" stopColor="#efece6" stopOpacity="0.03" />
            <stop offset="1" stopColor="#efece6" stopOpacity="0.07" />
          </linearGradient>
          <linearGradient id="sr-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#efece6" stopOpacity="0.08" />
            <stop offset="1" stopColor="#efece6" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="sr-light" cx="0.5" cy="0" r="0.8">
            <stop offset="0" stopColor="#fff6e6" stopOpacity="0.22" />
            <stop offset="1" stopColor="#fff6e6" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* canopy */}
        <path d="M 40 150 L 760 120 L 760 142 L 40 172 Z" fill="#efece6" fillOpacity="0.14" />
        <path d="M 60 171 L 740 143" stroke="#d8232f" strokeWidth="2" strokeOpacity="0.8" />
        {/* glazing */}
        <path d="M 90 172 L 710 146 L 710 430 L 90 430 Z" fill="url(#sr-glass)" />
        <path d="M 90 172 L 710 146 L 710 430 L 90 430 Z" fill="url(#sr-light)" />
        <g stroke="#efece6" strokeOpacity="0.16" strokeWidth="2">
          {mullions.map((x) => (
            <line key={x} x1={x} y1={172 - ((x - 90) / 620) * 26} x2={x} y2={430} />
          ))}
          <line x1="90" y1="300" x2="710" y2="290" strokeOpacity="0.08" />
        </g>
        {/* bikes on the floor, as abstract wheel pairs */}
        <g fill="none" stroke="#efece6" strokeOpacity="0.22" strokeWidth="3">
          {[170, 380, 590].map((x) => (
            <g key={x}>
              <circle cx={x} cy={404} r={22} />
              <circle cx={x + 74} cy={404} r={22} />
              <path d={`M ${x} 404 L ${x + 30} 378 L ${x + 60} 378 L ${x + 74} 404`} strokeOpacity="0.14" />
            </g>
          ))}
        </g>
        {/* ground + reflection */}
        <line x1="0" y1="430" x2="800" y2="430" stroke="#efece6" strokeOpacity="0.25" />
        <rect x="90" y="431" width="620" height="120" fill="url(#sr-floor)" />
      </svg>
      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
        <span>
          <span className="eyebrow block text-bone/45">The showroom</span>
          <span className="mt-1 block text-sm text-bone/80">{[dealership.address.line2, dealership.address.city].filter(Boolean).join(", ")}</span>
        </span>
        <span className="eyebrow text-right text-[10px] text-bone/35">Illustration</span>
      </figcaption>
    </figure>
  );
}
