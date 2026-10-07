"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Bike, BikeColor, BikeVariant } from "@/lib/types";
import { getAccessory } from "@/data/accessories";
import { calculateEmi, EMI_DEFAULTS, estimateOnRoad } from "@/lib/emi";
import { track } from "@/lib/analytics";

export interface BikeConfig {
  bike: Bike;
  variant: BikeVariant;
  color: BikeColor;
  /** Colours offered for the selected variant. */
  colors: BikeColor[];
  accessoryIds: string[];
  accessoriesTotal: number;
  onRoad: number;
  emi: number;
  downPayment: number;
  setVariant: (id: string) => void;
  setColor: (id: string) => void;
  toggleAccessory: (id: string) => void;
  /** True while the hero is on screen — the mobile CTA bar hides then. */
  heroInView: boolean;
  setHeroInView: (v: boolean) => void;
}

const Ctx = createContext<BikeConfig | null>(null);

export function useBikeConfig() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useBikeConfig must be used inside <BikeConfigProvider>");
  return c;
}

export function colorsFor(bike: Bike, variant: BikeVariant) {
  return variant.colorIds?.length ? bike.colors.filter((c) => variant.colorIds!.includes(c.id)) : bike.colors;
}

/** Shared selection state for the hero swatches, hotspots and configurator. */
export function BikeConfigProvider({ bike, children }: { bike: Bike; children: ReactNode }) {
  const [variantId, setVariantId] = useState(bike.variants[0].id);
  const [colorId, setColorId] = useState(bike.colors[0].id);
  const [accessoryIds, setAccessoryIds] = useState<string[]>([]);
  const [heroInView, setHeroInView] = useState(true);

  const value = useMemo<BikeConfig>(() => {
    const variant = bike.variants.find((v) => v.id === variantId) ?? bike.variants[0];
    const colors = colorsFor(bike, variant);
    const color = colors.find((c) => c.id === colorId) ?? colors[0];
    const accessoriesTotal = accessoryIds.reduce((s, id) => s + (getAccessory(id)?.price ?? 0), 0);
    const onRoad = estimateOnRoad(variant.exShowroom) + accessoriesTotal;
    const downPayment = Math.round((onRoad * EMI_DEFAULTS.downPaymentPct) / 100) * 100;
    const { emi } = calculateEmi({
      price: onRoad,
      downPayment,
      tenureMonths: EMI_DEFAULTS.tenureMonths,
      annualRate: EMI_DEFAULTS.annualRate,
    });

    return {
      bike,
      variant,
      color,
      colors,
      accessoryIds,
      accessoriesTotal,
      onRoad,
      emi,
      downPayment,
      heroInView,
      setHeroInView,
      setVariant: (id) => {
        setVariantId(id);
        track("configurator_change", { bike: bike.slug, field: "variant", value: id });
      },
      setColor: (id) => {
        setColorId(id);
        track("configurator_change", { bike: bike.slug, field: "color", value: id });
      },
      toggleAccessory: (id) => {
        const on = !accessoryIds.includes(id);
        setAccessoryIds(on ? [...accessoryIds, id] : accessoryIds.filter((a) => a !== id));
        track("configurator_change", { bike: bike.slug, field: "accessory", value: id, selected: on });
      },
    };
  }, [bike, variantId, colorId, accessoryIds, heroInView]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function testRideHref(c: Pick<BikeConfig, "bike" | "variant" | "color">) {
  const q = new URLSearchParams({ bike: c.bike.slug, variant: c.variant.id, color: c.color.id });
  return `/test-ride?${q.toString()}`;
}
