"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { getAccessory } from "@/data/accessories";
import type { Accessory } from "@/lib/types";
import { EMI_DEFAULTS } from "@/lib/emi";
import { cn, formatINR } from "@/lib/format";
import { ChoiceGroup } from "@/components/ui/Field";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useLeads } from "@/components/leads/LeadProvider";
import { BikeVisual } from "../BikeVisual";
import { testRideHref, useBikeConfig } from "./ConfigContext";
import { ColorSwatches } from "./ColorSwatches";
import { Availability, availabilityLabel } from "./Availability";

const inr = (n: number) => formatINR(n);
const ACC_PREVIEW = 4;

function Step({ n, title, aside, children }: { n: string; title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-t border-current/15 pt-6">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h3 className="flex items-baseline gap-3">
          <span className="eyebrow tabular opacity-45">{n}</span>
          <span className="font-display text-xl md:text-2xl">{title}</span>
        </h3>
        {aside}
      </div>
      {children}
    </div>
  );
}

/** Variant / colour / accessory configurator with a live, sticky summary. */
export function Configurator({ index = "03" }: { index?: string }) {
  const cfg = useBikeConfig();
  const { bike, variant, color, accessoryIds, accessoriesTotal, onRoad, emi, heroInView } = cfg;
  const { openOnRoadPrice } = useLeads();
  const uid = useId();
  const reduce = useReducedMotion();
  const summaryRef = useRef<HTMLDivElement>(null);
  const [summaryInView, setSummaryInView] = useState(false);
  const [allAccessories, setAllAccessories] = useState(false);

  useEffect(() => {
    const el = summaryRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSummaryInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const accessories = bike.accessoryIds
    .map((id) => getAccessory(id))
    .filter((a): a is Accessory => !!a && a.fits.includes(bike.silhouette));
  const selectedAccessories = accessories.filter((a) => accessoryIds.includes(a.id));
  const showBar = !heroInView && !summaryInView;
  const href = testRideHref(cfg);

  const visual = (compact: boolean) => (
    <div className={cn("relative overflow-hidden rounded-[24px] bg-ink text-bone", compact ? "px-4 pb-2 pt-8" : "px-4 pb-4 pt-10")}>
      <div className="studio-glow absolute inset-0" aria-hidden />
      <div className="absolute inset-x-6 bottom-[20%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden />
      <div className={cn("relative", compact && "mx-auto max-w-[72%]")}>
        <BikeVisual bike={bike} color={color} accessories={accessoryIds} sizes="(min-width: 1024px) 34vw, 92vw" />
      </div>
      <p className="eyebrow absolute left-5 top-4 text-bone/45">
        {variant.name} · {color.name}
      </p>
    </div>
  );

  return (
    <section id="configure" aria-labelledby={`${uid}-h`} className="surface-paper py-24 md:py-36" style={{ background: "var(--color-paper-2)" }}>
      <div className="container-x">
        <div id={`${uid}-h`}>
          <SectionHeading
            index={index}
            eyebrow="Configure"
            title={["Make it", "yours."]}
            lede="Choose a variant, a colour and genuine accessories. Your summary updates as you go — with an estimated on-road price and monthly EMI."
          />
        </div>

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12 lg:gap-14">
          {/* steps */}
          <div className="flex flex-col gap-12 lg:col-span-7">
            <div className="lg:hidden">{visual(false)}</div>

            <Step n="01" title="Variant" aside={<span className="text-[13px] opacity-55">{bike.variants.length} available</span>}>
              <ChoiceGroup
                legend="Variant"
                hideLegend
                name={`${uid}-variant`}
                layout="cards"
                columns={bike.variants.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"}
                value={variant.id}
                onChange={cfg.setVariant}
                options={bike.variants.map((v) => ({
                  value: v.id,
                  label: v.name,
                  description: v.highlights.join(" · "),
                  meta: (
                    <span className="mt-3 flex items-center justify-between gap-3 border-t border-current/10 pt-3">
                      <span className="text-[15px] font-medium tabular">{formatINR(v.exShowroom)}*</span>
                      <Availability status={v.availability} />
                    </span>
                  ),
                }))}
              />
            </Step>

            <Step n="02" title="Colour" aside={<span className="text-[13px] opacity-70">{color.name}</span>}>
              <ColorSwatches size="lg" tone="light" />
              <p className="mt-4 text-[13px] opacity-55">
                {cfg.colors.length} colours for the {variant.name}. Shades on screen are a guide — see them in person at the showroom.
              </p>
            </Step>

            {accessories.length > 0 && (
              <Step
                n="03"
                title="Genuine accessories"
                aside={
                  <span className="text-[13px] opacity-70 tabular" aria-live="polite">
                    {selectedAccessories.length ? `${selectedAccessories.length} added · ${formatINR(accessoriesTotal)}` : "Optional"}
                  </span>
                }
              >
                <ChoiceGroup
                  legend="Accessories"
                  hideLegend
                  multiple
                  name={`${uid}-acc`}
                  layout="cards"
                  columns="sm:grid-cols-2"
                  value={accessoryIds}
                  onChange={cfg.toggleAccessory}
                  options={(allAccessories ? accessories : accessories.slice(0, ACC_PREVIEW)).map((a) => ({
                    value: a.id,
                    label: a.name,
                    description: a.description,
                    meta: <span className="mt-2 text-sm font-medium tabular">+ {formatINR(a.price)}*</span>,
                  }))}
                />
                {accessories.length > ACC_PREVIEW && (
                  <button
                    type="button"
                    onClick={() => setAllAccessories((v) => !v)}
                    aria-expanded={allAccessories}
                    className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border border-current/20 px-5 text-sm font-medium transition-colors hover:border-current/50"
                  >
                    {allAccessories ? "Show fewer" : `Show all ${accessories.length} accessories`}
                    <Icon name="chevron-down" size={16} className={cn("transition-transform", allAccessories && "rotate-180")} />
                  </button>
                )}
                <p className="mt-4 text-[12px] opacity-55">
                  Prices are indicative; any fitment charges are confirmed by our team.
                </p>
              </Step>
            )}
          </div>

          {/* summary */}
          <div className="lg:col-span-5">
            <div ref={summaryRef} className="lg:sticky lg:top-20">
              <div className="overflow-hidden rounded-[28px] bg-ink text-bone shadow-[0_40px_80px_-40px_rgb(0_0_0/0.6)]">
                <div className="hidden p-2 lg:block">{visual(true)}</div>
                <div className="p-6 md:p-8 lg:px-7 lg:pb-7 lg:pt-4">
                  <p className="eyebrow text-bone/50">Your configuration</p>
                  <p className="mt-3 font-display text-2xl leading-tight md:text-3xl">Honda {bike.name}</p>
                  <p className="mt-1 text-sm text-bone/60">
                    {variant.name} · {color.name}
                  </p>

                  <dl className="mt-6 divide-y divide-white/10 border-y border-white/10 text-sm">
                    <div className="flex items-baseline justify-between gap-4 py-3">
                      <dt className="text-bone/60">Ex-showroom*</dt>
                      <dd className="tabular">
                        <AnimatedNumber value={variant.exShowroom} format={inr} />
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 py-3">
                      <dt className="text-bone/60">
                        Accessories
                        {selectedAccessories.length > 0 && <span className="text-bone/40"> ({selectedAccessories.length})</span>}
                      </dt>
                      <dd className="tabular">
                        {accessoriesTotal ? (
                          <>
                            + <AnimatedNumber value={accessoriesTotal} format={inr} />
                          </>
                        ) : (
                          <span className="text-bone/40">None</span>
                        )}
                      </dd>
                    </div>
                    {selectedAccessories.length > 0 && (
                      <div className="py-3">
                        <dt className="sr-only">Accessories selected</dt>
                        <dd>
                          <ul className="flex flex-wrap gap-1.5">
                            {selectedAccessories.map((a) => (
                              <li key={a.id}>
                                <button
                                  type="button"
                                  onClick={() => cfg.toggleAccessory(a.id)}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/15 px-3 text-[12px] text-bone/80 hover:border-white/40"
                                  aria-label={`Remove ${a.name}`}
                                >
                                  {a.name}
                                  <span aria-hidden className="text-bone/45">×</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                    <div className="flex items-baseline justify-between gap-4 py-3">
                      <dt className="text-bone/60">Availability</dt>
                      <dd>
                        <Availability status={variant.availability} tone="dark" />
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[12px] text-bone/55">Estimated on-road*</p>
                      <p className="mt-1 font-display-wide text-[1.3rem] leading-none tabular xs:text-[1.5rem] md:text-3xl">
                        <AnimatedNumber value={onRoad} format={inr} />
                      </p>
                    </div>
                    <div className="border-l border-white/10 pl-4">
                      <p className="text-[12px] text-bone/55">Estimated EMI*</p>
                      <p className="mt-1 font-display-wide text-[1.3rem] leading-none tabular xs:text-[1.5rem] md:text-3xl">
                        <AnimatedNumber value={emi} format={inr} />
                        <span className="ml-1 font-sans text-xs font-normal normal-case tracking-normal text-bone/50">/mo</span>
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-bone/45">
                    {Math.round(EMI_DEFAULTS.downPaymentPct * 100)}% down · {EMI_DEFAULTS.tenureMonths} months · {EMI_DEFAULTS.annualRate}% p.a. (illustrative)
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                    <ButtonLink href={href} size="lg" icon="arrow-right" className="sm:flex-1">
                      Book test ride
                    </ButtonLink>
                    <Button
                      size="lg"
                      variant="outline"
                      className="sm:flex-1"
                      onClick={() => openOnRoadPrice({ bikeSlug: bike.slug, source: "pdp_configurator" })}
                    >
                      Get on-road price
                    </Button>
                  </div>
                  <p className="mt-5 text-[12px] leading-relaxed text-bone/45">
                    *Prices are indicative and may change. The on-road figure is an estimate (registration and insurance vary by city) and the EMI is an
                    illustration, not a finance offer. We&apos;ll confirm the exact numbers for you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* mobile sticky CTA bar — above the bottom nav */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ y: reduce ? 0 : "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduce ? 0 : "100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] z-40 border-t border-white/[0.08] bg-ink-2/95 text-bone backdrop-blur-xl lg:hidden"
            role="region"
            aria-label={`Honda ${bike.name} quick actions`}
          >
            <div className="container-x flex h-16 items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[11px] text-bone/55">
                  {bike.name} {variant.name} · est. on-road*
                </p>
                <p className="flex items-baseline gap-2 text-[17px] font-semibold leading-tight tabular">
                  <AnimatedNumber value={onRoad} format={inr} />
                  <span className="text-[12px] font-normal text-bone/50">
                    ~<AnimatedNumber value={emi} format={inr} />
                    /mo
                  </span>
                </p>
              </div>
              <ButtonLink href={href} size="sm" className={cn("h-11 shrink-0 px-5")} aria-label={`Book a test ride on the Honda ${bike.name}`}>
                Test ride
              </ButtonLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">
        {`${variant.name}, ${color.name}, ${availabilityLabel[variant.availability]}. Estimated on-road ${formatINR(onRoad)}.`}
      </span>
    </section>
  );
}
