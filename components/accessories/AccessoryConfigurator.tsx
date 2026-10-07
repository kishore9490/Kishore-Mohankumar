"use client";

import Link from "next/link";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { accessories as catalogue, accessoryCategoryLabels } from "@/data/accessories";
import { bikes, getBike, startingPrice } from "@/data/bikes";
import type { Accessory, AccessoryCategory, Bike } from "@/lib/types";
import { BikeSilhouette } from "@/components/bikes/BikeSilhouette";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon, WhatsAppGlyph } from "@/components/ui/Icon";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { useLeads } from "@/components/leads/LeadProvider";
import { track } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn, formatINR } from "@/lib/format";
import { AccessoryStudio, DRAWABLE_ACCESSORIES } from "./AccessoryStudio";

const CATEGORY_ORDER: AccessoryCategory[] = ["protection", "comfort", "touring", "styling", "utility"];
const DISCLAIMER = "Indicative prices for genuine accessories; fitment and availability vary by model.";

/** Accessories that fit the bike's silhouette — ones the studio can draw first. */
const fitsBike = (bike: Bike) =>
  catalogue
    .filter((a) => a.fits.includes(bike.silhouette))
    .sort((a, b) => Number(DRAWABLE_ACCESSORIES.has(b.id)) - Number(DRAWABLE_ACCESSORIES.has(a.id)));
const fmt = (n: number) => formatINR(n);

/* ─────────────────────────────── Configurator ─────────────────────────────── */

export function AccessoryConfigurator({ initialBikeSlug }: { initialBikeSlug?: string }) {
  const { openCallback } = useLeads();
  const reduce = useReducedMotion();
  const [slug, setSlug] = useState(() => (initialBikeSlug && getBike(initialBikeSlug) ? initialBikeSlug : bikes[0].slug));
  const [colorId, setColorId] = useState<string | null>(null);
  const [filter, setFilter] = useState<AccessoryCategory | "all">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [announce, setAnnounce] = useState("");

  const bike = getBike(slug) ?? bikes[0];
  const color = bike.colors.find((c) => c.id === colorId) ?? bike.colors[0];
  const available = useMemo(() => fitsBike(bike), [bike]);
  const categories = CATEGORY_ORDER.filter((c) => available.some((a) => a.category === c));
  const activeFilter = filter !== "all" && !categories.includes(filter) ? "all" : filter;
  const visible = activeFilter === "all" ? available : available.filter((a) => a.category === activeFilter);

  // Selections persist across bikes, but only those that fit the current bike count.
  const chosen = available.filter((a) => selected.includes(a.id));
  const total = chosen.reduce((s, a) => s + a.price, 0);
  const bikeFrom = startingPrice(bike);
  const list = chosen.map((a) => a.name).join(", ");

  const pickerRef = useRef<HTMLDivElement>(null);
  // Bring a deep-linked (?bike=) model into view inside the horizontal picker.
  useEffect(() => {
    const row = pickerRef.current;
    const tile = row?.querySelector<HTMLElement>("label:has(input:checked)");
    if (!row || !tile) return;
    const r = row.getBoundingClientRect();
    const t = tile.getBoundingClientRect();
    if (t.right > r.right) row.scrollLeft += t.left - r.left - (r.width - t.width) / 2;
  }, []);

  const sheetRef = useRef<HTMLDivElement>(null);
  const sheetInView = useInView(sheetRef, { margin: "0px 0px -20% 0px" });

  const chooseBike = (next: string) => {
    if (next === slug) return;
    setSlug(next);
    setColorId(null);
    const b = getBike(next);
    track("configurator_change", { context: "accessories", bike: next });
    if (b) setAnnounce(`${b.name} selected. ${fitsBike(b).length} accessories fit this model.`);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("bike", next);
      window.history.replaceState(window.history.state, "", url);
    } catch {
      /* non-critical */
    }
  };

  const toggle = (a: Accessory) => {
    const on = selected.includes(a.id);
    const next = on ? selected.filter((id) => id !== a.id) : [...selected, a.id];
    setSelected(next);
    const nextChosen = available.filter((x) => next.includes(x.id));
    const nextTotal = nextChosen.reduce((s, x) => s + x.price, 0);
    setAnnounce(
      `${a.name} ${on ? "removed" : "added"}. ${nextChosen.length} ${nextChosen.length === 1 ? "accessory" : "accessories"}, ${formatINR(nextTotal)} total.`,
    );
    track("configurator_change", { context: "accessories", bike: bike.slug, accessory: a.id, on: !on });
  };

  const clear = () => {
    setSelected([]);
    setAnnounce("All accessories removed.");
  };

  const enquire = () => {
    track("accessory_enquiry", { bike: bike.slug, count: chosen.length, source: "accessories" });
    openCallback({
      topic: "accessories",
      title: "Accessories enquiry",
      details: `${bike.name} · ${chosen.length ? list : "Help me choose"}`,
      source: "accessories",
    });
  };

  const waHref = whatsappUrl("accessories", chosen.length ? `${list} for the Honda ${bike.name}` : `for the Honda ${bike.name}`);

  return (
    <>
      {/* ── Studio ─────────────────────────────────────────────── */}
      <section aria-labelledby="acc-title" className="relative overflow-hidden pb-16 pt-[calc(var(--header-h)+2.5rem)] md:pb-24 md:pt-[calc(var(--header-h)+4rem)]">
        <div className="container-x">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Reveal className="eyebrow mb-5 flex items-center gap-3 text-bone/60">
                <span className="tabular">01</span>
                <span className="h-px w-8 bg-current opacity-40" aria-hidden />
                <span>Genuine Honda accessories</span>
              </Reveal>
              <h1 id="acc-title" className="font-display text-display-xl">
                <RevealLines lines={["Make it", "yours."]} />
              </h1>
            </div>
            <Reveal delay={0.15} className="max-w-sm text-pretty text-base leading-relaxed text-bone/65 md:text-lg lg:pb-3">
              <p>Choose your Honda, add the parts you&rsquo;d actually use, and see the build come together. We&rsquo;ll fit everything before delivery.</p>
            </Reveal>
          </div>

          {/* Bike picker */}
          <fieldset className="mt-10 min-w-0 md:mt-14">
            <legend className="eyebrow mb-4 text-bone/55">Step 1 · Choose your bike</legend>
            <div ref={pickerRef} className="-mx-5 overflow-x-auto px-5 pb-2 no-scrollbar md:-mx-10 md:px-10 xl:-mx-16 xl:px-16">
              <div className="flex w-max snap-x gap-2">
                {bikes.map((b) => {
                  const on = b.slug === bike.slug;
                  return (
                    <label
                      key={b.slug}
                      className={cn(
                        "group relative flex w-[8.75rem] shrink-0 snap-start cursor-pointer flex-col rounded-2xl border px-3 pb-3 pt-2 transition-[background-color,border-color] duration-300 ease-[var(--ease-out-expo)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal",
                        on ? "border-bone/60 bg-white/[0.07]" : "border-white/[0.08] hover:border-white/25",
                      )}
                    >
                      <input
                        type="radio"
                        name="acc-bike"
                        value={b.slug}
                        checked={on}
                        onChange={() => chooseBike(b.slug)}
                        className="sr-only"
                      />
                      <BikeSilhouette
                        shape={b.silhouette}
                        color={b.colors[0]?.hex}
                        accent={b.colors[0]?.accent}
                        className={cn("h-auto w-full transition-opacity duration-300", on ? "opacity-100" : "opacity-55 group-hover:opacity-85")}
                        title={`Honda ${b.name}`}
                      />
                      <span className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{b.name}</span>
                        <span className={cn("size-1.5 shrink-0 rounded-full transition-colors", on ? "bg-signal" : "bg-transparent")} aria-hidden />
                      </span>
                      <span className="tabular text-xs text-bone/50">from {formatINR(startingPrice(b))}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </fieldset>

          <div className="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-12 lg:gap-12">
            {/* Visual */}
            <div className="min-w-0 lg:col-span-7">
              <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
                <AccessoryStudio bike={bike} color={color} accessoryIds={chosen.map((a) => a.id)} priority>
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5 md:p-7">
                    <div className="min-w-0">
                      <p className="eyebrow text-bone/50">Honda</p>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.p
                          key={bike.slug}
                          initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: reduce ? 0 : -6 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="font-display text-display-sm"
                        >
                          {bike.name}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                    <div role="radiogroup" aria-label="Paint colour (preview only)" className="flex shrink-0 gap-1.5 pt-1">
                      {bike.colors.map((c) => {
                        const on = c.id === color?.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            aria-label={c.name}
                            title={c.name}
                            onClick={() => setColorId(c.id)}
                            className="grid size-8 place-items-center rounded-full"
                          >
                            <span
                              className={cn(
                                "size-[18px] rounded-full ring-1 ring-white/20 transition-[box-shadow,transform] duration-300",
                                on && "scale-110 ring-2 ring-bone ring-offset-2 ring-offset-ink-2",
                              )}
                              style={{ background: c.accent ? `linear-gradient(135deg, ${c.hex} 55%, ${c.accent} 55%)` : c.hex }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-7">
                    <p className="eyebrow text-bone/50">
                      <span className="tabular text-bone">{String(chosen.length).padStart(2, "0")}</span> fitted
                    </p>
                    <p className="hidden text-right sm:block">
                      <span className="eyebrow block text-bone/45">Accessories</span>
                      <AnimatedNumber value={total} format={fmt} className="tabular font-display-wide text-xl md:text-2xl" />
                    </p>
                  </div>
                </AccessoryStudio>
                <p className="mt-3 text-xs leading-relaxed text-bone/45">
                  Studio illustration. Parts marked &ldquo;not pictured&rdquo; are included in your build but not drawn.
                </p>
              </div>
            </div>

            {/* Accessory list */}
            <div className="min-w-0 lg:col-span-5">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="eyebrow text-bone/55">Step 2 · Add accessories</h2>
                <span className="tabular text-xs text-bone/45">{available.length} fit the {bike.name}</span>
              </div>

              <div className="-mx-5 mt-4 overflow-x-auto px-5 no-scrollbar md:mx-0 md:px-0">
                <div role="group" aria-label="Filter by category" className="flex w-max gap-1.5 md:w-auto md:flex-wrap">
                  {(["all", ...categories] as const).map((c) => {
                    const on = activeFilter === c;
                    const count = c === "all" ? available.length : available.filter((a) => a.category === c).length;
                    return (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setFilter(c)}
                        className={cn(
                          "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] transition-colors duration-200",
                          on ? "border-bone bg-bone text-ink" : "border-white/12 text-bone/75 hover:border-white/35 hover:text-bone",
                        )}
                      >
                        {c === "all" ? "All" : accessoryCategoryLabels[c]}
                        <span className={cn("tabular text-[11px]", on ? "text-ink/55" : "text-bone/40")}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <ul className="mt-5 border-t border-white/10">
                <AnimatePresence initial={false} mode="popLayout">
                  {visible.map((a) => {
                    const on = selected.includes(a.id);
                    return (
                      <motion.li
                        key={a.id}
                        layout={!reduce}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="border-b border-white/10"
                      >
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggle(a)}
                          className="group flex w-full items-start gap-4 py-5 text-left focus-visible:outline-offset-[-2px]"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="eyebrow flex items-center gap-2 text-bone/45">
                              {accessoryCategoryLabels[a.category]}
                              {!DRAWABLE_ACCESSORIES.has(a.id) && <span className="text-bone/30">· not pictured</span>}
                            </span>
                            <span className="mt-1.5 block text-[17px] font-medium leading-snug">{a.name}</span>
                            <span className="mt-1 block text-sm leading-relaxed text-bone/55">{a.description}</span>
                          </span>
                          <span className="flex shrink-0 flex-col items-end gap-3 pt-0.5">
                            <span className="tabular text-sm text-bone/80">{formatINR(a.price)}</span>
                            <span
                              aria-hidden
                              className={cn(
                                "grid size-11 place-items-center rounded-full border transition-[background-color,border-color,color,transform] duration-300 ease-[var(--ease-out-expo)] group-active:scale-90",
                                on ? "border-bone bg-bone text-ink" : "border-white/20 text-bone group-hover:border-white/50",
                              )}
                            >
                              <Icon name={on ? "check" : "plus"} size={18} strokeWidth={2} />
                            </span>
                          </span>
                          <span className="sr-only">{on ? "— added to build" : "— add to build"}</span>
                        </button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
              <p className="mt-5 text-xs leading-relaxed text-bone/45">{DISCLAIMER}</p>
            </div>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
      </section>

      {/* ── Build sheet ─────────────────────────────────────────── */}
      <section aria-labelledby="build-title" className="surface-paper py-16 md:py-24">
        <div ref={sheetRef} className="container-x grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-5">
            <p className="eyebrow mb-5 flex items-center gap-3 opacity-60">
              <span className="tabular">02</span>
              <span className="h-px w-8 bg-current opacity-40" aria-hidden />
              <span>Build sheet</span>
            </p>
            <h2 id="build-title" className="font-display text-display-md">
              Your {bike.name},
              <br />
              your way.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed opacity-65">
              Send us this build and our team will confirm fitment, availability and the final price — then fit it all before
              delivery, or at your next service.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button size="lg" icon="arrow-right" onClick={enquire}>
                Enquire about accessories
              </Button>
              <ButtonLink
                href={waHref}
                variant="outline"
                size="lg"
                onClick={() => track("whatsapp_click", { source: "accessories", bike: bike.slug })}
              >
                <span className="inline-flex items-center gap-2.5">
                  <WhatsAppGlyph size={18} /> Share on WhatsApp
                </span>
              </ButtonLink>
            </div>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <div className="rounded-[28px] border border-current/10 bg-paper-2/60 p-5 sm:p-8">
              <dl>
                <div className="flex items-baseline justify-between gap-4 pb-5">
                  <dt>
                    <span className="eyebrow block opacity-50">Bike</span>
                    <span className="mt-1 block text-lg font-medium">Honda {bike.name}</span>
                    <span className="text-sm opacity-55">{color?.name}</span>
                  </dt>
                  <dd className="text-right">
                    <span className="eyebrow block opacity-50">Ex-showroom from</span>
                    <span className="tabular mt-1 block text-lg">{formatINR(bikeFrom)}</span>
                  </dd>
                </div>

                <div className="border-t border-current/10 pt-5">
                  <dt className="eyebrow opacity-50">Accessories</dt>
                  <dd>
                    {chosen.length === 0 ? (
                      <div className="flex items-start gap-4 py-6">
                        <span className="grid size-11 shrink-0 place-items-center rounded-full border border-dashed border-current/30" aria-hidden>
                          <Icon name="plus" size={18} className="opacity-50" />
                        </span>
                        <div>
                          <p className="font-medium">Pick a few — we&rsquo;ll fit them before delivery.</p>
                          <p className="mt-1 text-sm leading-relaxed opacity-60">
                            Not sure where to start? Most {bike.category === "scooter" ? "scooter" : "motorcycle"} owners begin with
                            protection and a mobile holder.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ul className="mt-2">
                        <AnimatePresence initial={false}>
                          {chosen.map((a) => (
                            <motion.li
                              key={a.id}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="flex items-center justify-between gap-4 border-b border-dashed border-current/10 py-3">
                                <span className="flex min-w-0 items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => toggle(a)}
                                    aria-label={`Remove ${a.name}`}
                                    className="grid size-8 shrink-0 place-items-center rounded-full opacity-45 transition-[opacity,background-color] hover:bg-current/[0.06] hover:opacity-100"
                                  >
                                    <Icon name="x" size={15} />
                                  </button>
                                  <span className="truncate">{a.name}</span>
                                </span>
                                <span className="tabular shrink-0">{formatINR(a.price)}</span>
                              </div>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    )}
                  </dd>
                </div>

                <div className="flex items-end justify-between gap-4 pt-5">
                  <dt>
                    <span className="block font-medium">Accessories total</span>
                    {chosen.length > 0 && (
                      <button type="button" onClick={clear} className="mt-1 text-sm underline decoration-current/30 underline-offset-4 opacity-55 hover:opacity-100">
                        Clear all
                      </button>
                    )}
                  </dt>
                  <dd>
                    <AnimatedNumber value={total} format={fmt} className="tabular font-display-wide text-3xl md:text-4xl" />
                  </dd>
                </div>

                <div className="mt-6 flex items-baseline justify-between gap-4 rounded-2xl bg-ink px-5 py-4 text-bone">
                  <dt className="text-sm text-bone/65">
                    Bike + accessories
                    <span className="block text-xs text-bone/40">Ex-showroom from, before registration &amp; insurance</span>
                  </dt>
                  <dd>
                    <AnimatedNumber value={bikeFrom + total} format={fmt} className="tabular text-xl font-medium" />
                  </dd>
                </div>
              </dl>
              <p className="mt-5 text-xs leading-relaxed opacity-55">{DISCLAIMER}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile summary bar ──────────────────────────────────── */}
      <AnimatePresence>
        {!sheetInView && (
          <motion.div
            initial={{ y: "120%" }}
            animate={{ y: 0 }}
            exit={{ y: "120%" }}
            transition={{ duration: reduce ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] z-40 px-3 pb-2 lg:hidden"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-3/95 py-2 pl-4 pr-2 text-bone shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl">
              <div className="min-w-0 flex-1">
                <p className="eyebrow truncate text-bone/50">
                  {chosen.length ? `${chosen.length} ${chosen.length === 1 ? "accessory" : "accessories"}` : "No accessories yet"}
                </p>
                <AnimatedNumber value={total} format={fmt} className="tabular block text-lg font-medium leading-tight" />
              </div>
              <Button size="md" onClick={enquire} className="h-11 px-4">
                Enquire
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────── Homepage teaser ─────────────────────────────── */

const TEASER_DEFAULT = ["top-box", "crash-guard", "tank-bag", "mobile-holder"];

/**
 * Compact, striking version for the homepage: one bike, a handful of
 * toggleable accessories, a live total and a link into the full configurator.
 */
export function AccessoriesTeaser({
  bikeSlug = "nx200",
  accessoryIds = TEASER_DEFAULT,
  index = "06",
  className,
}: {
  bikeSlug?: string;
  /** 3–4 accessory ids that fit the bike (ideally ones the studio can draw). */
  accessoryIds?: string[];
  index?: string;
  className?: string;
}) {
  const bike = getBike(bikeSlug) ?? bikes[bikes.length - 1];
  const items = accessoryIds
    .map((id) => catalogue.find((a) => a.id === id))
    .filter((a): a is Accessory => !!a && a.fits.includes(bike.silhouette))
    .slice(0, 4);
  const [on, setOn] = useState<string[]>(() => items.slice(0, 2).map((a) => a.id));
  const total = items.filter((a) => on.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const color = bike.colors[0];

  return (
    <section aria-labelledby="acc-teaser-title" className={cn("relative overflow-hidden py-24 md:py-36", className)}>
      <div className="container-x grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <Reveal className="eyebrow mb-5 flex items-center gap-3 text-bone/60">
            <span className="tabular">{index}</span>
            <span className="h-px w-8 bg-current opacity-40" aria-hidden />
            <span>Genuine accessories</span>
          </Reveal>
          <h2 id="acc-teaser-title" className="font-display text-display-lg">
            <RevealLines lines={["Make it", "yours."]} />
          </h2>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-base leading-relaxed text-bone/65 md:text-lg">
              Add protection, comfort and touring kit to your {bike.name} — and we&rsquo;ll fit it all before you ride out.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <ul className="mt-8 border-t border-white/10" aria-label={`Accessories for the ${bike.name}`}>
              {items.map((a) => {
                const active = on.includes(a.id);
                return (
                  <li key={a.id} className="border-b border-white/10">
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setOn((s) => (active ? s.filter((x) => x !== a.id) : [...s, a.id]))}
                      className="group flex w-full items-center gap-4 py-3.5 text-left"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-full border transition-colors duration-300",
                          active ? "border-bone bg-bone text-ink" : "border-white/20 group-hover:border-white/50",
                        )}
                      >
                        <Icon name={active ? "check" : "plus"} size={16} strokeWidth={2} />
                      </span>
                      <span className="flex-1 font-medium">{a.name}</span>
                      <span className="tabular text-sm text-bone/60">{formatINR(a.price)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
              <p>
                <span className="eyebrow block text-bone/45">Indicative total</span>
                <AnimatedNumber value={total} format={fmt} className="tabular font-display-wide text-3xl" />
              </p>
              <ButtonLink href={`/accessories?bike=${bike.slug}`} variant="light" icon="arrow-right">
                Build yours
              </ButtonLink>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:col-span-7">
          <AccessoryStudio bike={bike} color={color} accessoryIds={on}>
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 md:p-7">
              <p>
                <span className="eyebrow block text-bone/50">Honda</span>
                <span className="font-display text-display-sm">{bike.name}</span>
              </p>
              <Link
                href={`/accessories?bike=${bike.slug}`}
                className="eyebrow inline-flex h-11 items-center gap-1.5 text-bone/60 transition-colors hover:text-bone"
              >
                {fitsBike(bike).length} accessories <Icon name="arrow-up-right" size={14} />
              </Link>
            </div>
          </AccessoryStudio>
          <p className="mt-3 text-xs text-bone/40">{DISCLAIMER}</p>
        </Reveal>
      </div>
    </section>
  );
}
