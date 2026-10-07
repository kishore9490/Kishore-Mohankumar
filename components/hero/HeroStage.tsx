"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Bike, BikeColor } from "@/lib/types";
import { BikeVisual } from "@/components/bikes/BikeVisual";
import { cn } from "@/lib/format";

const ShowroomScene = dynamic(() => import("@/components/3d/ShowroomScene"), { ssr: false });

function canUse3D() {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia("(min-width: 1024px)").matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return false;
  if ((nav.hardwareConcurrency ?? 8) < 4 || (nav.deviceMemory ?? 8) < 4) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The hero motorcycle. Everyone gets the instant, lightweight CSS studio
 * (image + floor reflection + pointer parallax). Capable desktops then
 * progressively upgrade to the WebGL showroom once the browser is idle.
 */
export function HeroStage({ bike, color }: { bike: Bike; color: BikeColor }) {
  const root = useRef<HTMLDivElement>(null);
  const source = useRef<HTMLDivElement>(null);
  const cssStage = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [ready3D, setReady3D] = useState(false);
  const [inView, setInView] = useState(true);

  // Pointer → shared ref (no re-renders) + CSS parallax.
  useEffect(() => {
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = cssStage.current;
        if (el && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          el.style.transform = `translate3d(${pointer.current.x * -14}px, ${pointer.current.y * 6}px, 0) rotateY(${pointer.current.x * 3}deg)`;
        }
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Pause WebGL when scrolled away.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Decide on WebGL after first paint, when idle.
  useEffect(() => {
    if (!canUse3D()) return;
    const start = () => {
      if (bike.heroImage) {
        setImageSrc(bike.heroImage);
        return;
      }
      const svg = source.current?.querySelector("svg");
      if (!svg) return;
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("width", "2000");
      clone.setAttribute("height", "1200");
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      setImageSrc(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`);
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(start, { timeout: 2000 });
      return () => window.cancelIdleCallback?.(id);
    }
    const t = setTimeout(start, 600);
    return () => clearTimeout(t);
  }, [bike.heroImage]);

  const onReady = useCallback(() => setReady3D(true), []);

  return (
    <div ref={root} className="absolute inset-0" aria-hidden>
      {/* Source for rasterising the silhouette into the WebGL scene */}
      <div ref={source} className="pointer-events-none absolute -left-[9999px] top-0 w-[800px]" aria-hidden>
        <BikeVisual bike={bike} color={color} />
      </div>

      {/* CSS studio — instant, and the permanent experience on phones */}
      <div
        className={cn(
          "absolute left-1/2 top-[calc(var(--header-h)+0.5rem)] w-[min(112vw,720px)] -translate-x-[48%] transition-opacity duration-1000 lg:left-auto lg:right-[3%] lg:top-[calc(var(--header-h)+1.5rem)] lg:w-[min(50vw,860px)] lg:translate-x-0",
          ready3D && "opacity-0",
        )}
        style={{ perspective: "1400px" }}
      >
        <div className="hero-float">
          <div ref={cssStage} className="relative transition-transform duration-700 ease-[var(--ease-out-expo)] will-change-transform">
            <div className="absolute inset-x-[10%] bottom-[6%] h-[30%] rounded-[50%] bg-white/[0.06] blur-3xl" />
            <BikeVisual bike={bike} color={color} priority />
            {/* floor reflection */}
            <div
              className="pointer-events-none absolute inset-x-0 top-full -mt-[11%] origin-top scale-y-[-1] opacity-[0.16] blur-[1.5px]"
              style={{ maskImage: "linear-gradient(to bottom, black, transparent 45%)", WebkitMaskImage: "linear-gradient(to bottom, black, transparent 45%)" }}
            >
              <BikeVisual bike={bike} color={color} />
            </div>
          </div>
        </div>
      </div>

      {/* WebGL showroom (desktop, capable devices) */}
      {imageSrc && (
        <div
          className={cn(
            "absolute inset-y-0 right-0 w-[78%] transition-opacity duration-[1600ms] ease-out",
            ready3D ? "opacity-100" : "opacity-0",
          )}
          style={{
            maskImage: "linear-gradient(to right, transparent, black 26%), linear-gradient(to bottom, black 80%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 26%)",
          }}
        >
          <ShowroomScene imageSrc={imageSrc} pointer={pointer} active={inView} onReady={onReady} />
        </div>
      )}
    </div>
  );
}
