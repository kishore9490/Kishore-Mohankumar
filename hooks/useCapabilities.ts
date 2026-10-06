"use client";

import { useEffect, useState } from "react";

export type Tier = "high" | "low" | "static";

export type Capabilities = {
  tier: Tier;
  reducedMotion: boolean;
  finePointer: boolean;
  mobile: boolean;
  ready: boolean;
};

const SSR: Capabilities = { tier: "low", reducedMotion: false, finePointer: false, mobile: true, ready: false };

export function detectCapabilities(): Capabilities {
  if (typeof window === "undefined") return SSR;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const mobile = window.innerWidth < 768 || !finePointer;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const saveData = nav.connection?.saveData ?? false;
  let tier: Tier = "high";
  if (mobile || cores <= 4 || memory <= 4) tier = "low";
  if (reducedMotion || saveData) tier = "static";
  // Manual override for testing: ?quality=high|low|static
  const forced = new URLSearchParams(window.location.search).get("quality");
  if (forced === "high" || forced === "low" || forced === "static") tier = forced;
  return { tier, reducedMotion, finePointer, mobile, ready: true };
}

/** Device capability tier — decides particle counts, layers and cursor. */
export function useCapabilities(): Capabilities {
  const [caps, setCaps] = useState<Capabilities>(SSR);
  useEffect(() => {
    const update = () => setCaps(detectCapabilities());
    update();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return caps;
}
