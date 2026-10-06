"use client";

import { useEffect, useRef, useState } from "react";
import { HeroLayer, type EngineState } from "./heroEngine";
import type { Tier } from "@/hooks/useCapabilities";

type Props = {
  tier: Tier;
  /** Hero registers a render callback here and calls it from its own loop. */
  register: (render: ((s: EngineState) => void) | null) => void;
  onReady: () => void;
};

function forcedQuality() {
  return new URLSearchParams(window.location.search).has("quality");
}

/** SwiftShader / llvmpipe etc. render on the CPU and would stall the main thread. */
function isSoftwareRenderer() {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return true;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|software|basic render/i.test(renderer);
  } catch {
    return true;
  }
}

/** Back + front WebGL layers. Loaded lazily — the hero is fully usable without it. */
export default function HeroCanvas({ tier, register, onReady }: Props) {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const withFront = tier === "high";

  useEffect(() => {
    if (!backRef.current) return;
    let back: HeroLayer | null = null;
    let front: HeroLayer | null = null;
    let cancelled = false;
    let idle = 0;
    const canvas = backRef.current;
    const lost = (e: Event) => {
      e.preventDefault();
      register(null);
      setReady(false);
    };

    const init = () => {
      if (cancelled) return;
      if (isSoftwareRenderer() && !forcedQuality()) return; // keep the poster — software GL costs more than it gives
      try {
        back = new HeroLayer(canvas, "back", {
          particles: tier === "high" ? 520 : 160,
          plateUrl: "/media/portrait-plate.webp",
          onTexture: () => {
            setReady(true);
            onReady();
          },
        });
        back.frontless = !withFront;
        if (withFront && frontRef.current) front = new HeroLayer(frontRef.current, "front", { particles: 26 });
      } catch (err) {
        // No WebGL: the DOM poster remains.
        console.warn("[hero] WebGL disabled:", err);
        back?.dispose();
        back = null;
        return;
      }
      register((s) => {
        back?.render(s);
        front?.render(s);
      });
      canvas.addEventListener("webglcontextlost", lost);
    };

    // Start WebGL once the page has settled — the DOM hero is already complete without it.
    const schedule = () => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      idle = ric ? ric(init, { timeout: 1500 }) : window.setTimeout(init, 300);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      (window as Window & { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback?.(idle);
      clearTimeout(idle);
      canvas.removeEventListener("webglcontextlost", lost);
      register(null);
      back?.dispose();
      front?.dispose();
    };
  }, [tier, withFront, register, onReady]);

  return (
    <>
      <canvas
        ref={backRef}
        aria-hidden="true"
        className="hero-canvas absolute inset-0 z-[1] h-full w-full"
        data-ready={ready || undefined}
      />
      {withFront && (
        <canvas
          ref={frontRef}
          aria-hidden="true"
          className="hero-canvas pointer-events-none absolute inset-0 z-[5] h-full w-full"
          data-ready={ready || undefined}
        />
      )}
    </>
  );
}
