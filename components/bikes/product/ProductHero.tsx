"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { categoryLabels, startingPrice } from "@/data/bikes";
import { track } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn, formatINR } from "@/lib/format";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Icon, WhatsAppGlyph } from "@/components/ui/Icon";
import { useLeads } from "@/components/leads/LeadProvider";
import { BikeVisual } from "../BikeVisual";
import { useBikeConfig } from "./ConfigContext";
import { ColorSwatches } from "./ColorSwatches";
import { Availability } from "./Availability";

/** Cinematic dark-studio hero: huge name, bike on a reflective floor, colours, CTAs. */
export function ProductHero() {
  const { bike, color, variant, setHeroInView } = useBikeConfig();
  const { openOnRoadPrice } = useLeads();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const viewed = useRef(false);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    track("bike_view", { bike: bike.slug, category: bike.category });
  }, [bike.slug, bike.category]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setHeroInView(e.isIntersecting), { rootMargin: "0px 0px -35% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [setHeroInView]);

  const letters = bike.name.length;
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section
      ref={ref}
      aria-labelledby="product-title"
      className="relative isolate overflow-hidden bg-ink pb-10 pt-[calc(var(--header-h)+1.75rem)] text-bone md:pb-14 md:pt-[calc(var(--header-h)+2.5rem)]"
    >
      <div className="pointer-events-none absolute inset-0 grain" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-[-10%] -z-10 h-[90%] w-[120%] -translate-x-1/2 bg-[radial-gradient(50%_50%_at_50%_45%,rgb(255_255_255/0.08),transparent_70%)]"
        aria-hidden
      />

      <div className="container-x relative">
        {/* crumbs */}
        <div className="flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb">
            <ol className="eyebrow flex items-center gap-2 text-bone/50">
              <li>
                <Link href="/bikes" className="inline-flex min-h-11 items-center hover:text-bone">
                  Bikes
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <span aria-current="page">{categoryLabels[bike.category]}</span>
              </li>
            </ol>
          </nav>
          <Availability status={variant.availability} tone="dark" />
        </div>

        {/* name */}
        <h1
          id="product-title"
          className="mt-4 whitespace-nowrap text-center font-display-wide leading-[0.84] md:mt-6"
          style={{ fontSize: `min(11rem, calc((min(100vw, 88rem) - 2.5rem) / ${(letters * 0.9 + 0.4).toFixed(2)}))` }}
        >
          <span className="sr-only">Honda </span>
          <motion.span
            className="block"
            initial={{ opacity: 0, y: reduce ? 0 : "0.25em", letterSpacing: reduce ? "-0.03em" : "0.04em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "-0.03em" }}
            transition={{ duration: 1.2, ease }}
          >
            {bike.name}
          </motion.span>
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mx-auto mt-4 max-w-md text-center text-base text-bone/65 md:mt-5 md:text-lg"
        >
          {bike.tagline}
        </motion.p>

        {/* stage */}
        <div className="relative mx-auto mt-2 max-w-5xl md:-mt-2">
          <div className="pointer-events-none absolute inset-x-[8%] bottom-[6%] h-[30%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(255_255_255/0.09),transparent)]" aria-hidden />
          <motion.div
            initial={{ opacity: 0, x: reduce ? 0 : 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.3, delay: 0.15, ease }}
            className="relative"
          >
            <div className="grid">
              <AnimatePresence initial={false}>
                <motion.div
                  key={color.id}
                  className="[grid-area:1/1]"
                  initial={{ opacity: 0, filter: reduce ? "none" : "brightness(1.6)" }}
                  animate={{ opacity: 1, filter: "brightness(1)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease }}
                >
                  <BikeVisual bike={bike} color={color} priority sizes="(min-width: 1024px) 64rem, 100vw" />
                  {/* floor reflection — geometry tuned to the silhouette's ground line */}
                  {!bike.heroImage && (
                  <div
                    className="pointer-events-none -mt-[12.5%] -scale-y-100 opacity-30 [mask-image:linear-gradient(to_top,black,transparent_38%)]"
                    aria-hidden
                  >
                    <BikeVisual bike={bike} color={color} sizes="(min-width: 1024px) 64rem, 100vw" />
                  </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
          <div className="absolute inset-x-0 bottom-[22%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden />
        </div>

        {/* deck */}
        <div className={cn("relative grid gap-8 border-t border-white/10 pt-6 md:pt-8 lg:grid-cols-12 lg:items-center", bike.heroImage ? "mt-6" : "-mt-[14%] sm:-mt-[12%]")}>
          <div className="lg:col-span-4">
            <p className="text-sm text-bone/55">Starting</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
              <span className="font-display-wide text-3xl tabular md:text-4xl">{formatINR(startingPrice(bike))}</span>
              <span className="text-sm text-bone/55">ex-showroom*</span>
            </p>
          </div>
          <div className="lg:col-span-3">
            <p className="text-sm text-bone/55">
              Colour · <span className="text-bone">{color.name}</span>
            </p>
            <ColorSwatches className="mt-2" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:col-span-5 lg:justify-end">
            <ButtonLink
              href={`/test-ride?bike=${bike.slug}`}
              size="lg"
              icon="arrow-right"
              magnetic
            >
              Book test ride
            </ButtonLink>
            <Button size="lg" variant="outline" onClick={() => openOnRoadPrice({ bikeSlug: bike.slug, source: "pdp_hero" })}>
              Get on-road price
            </Button>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2 text-[13px] text-bone/50 sm:flex-row sm:items-center sm:justify-between">
          <p>*Indicative ex-showroom price. Exact on-road price varies by city and insurance.</p>
          <a
            href={whatsappUrl("bike", bike.name)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { source: "pdp_hero", bike: bike.slug })}
            className={cn("inline-flex min-h-11 items-center gap-2 text-bone/80 underline-offset-4 hover:text-bone hover:underline")}
          >
            <WhatsAppGlyph size={16} />
            Ask about this bike on WhatsApp
            <Icon name="arrow-up-right" size={14} className="opacity-60" />
          </a>
        </div>
      </div>
    </section>
  );
}
