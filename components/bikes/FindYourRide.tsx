"use client";

import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useId, useMemo, useState } from "react";
import { bikes as allBikes, budgetBands, categoryLabels, priorityLabels, usageLabels } from "@/data/bikes";
import type { BikeCategory, RidePriority, RideUsage } from "@/lib/types";
import { track } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/format";
import { ChoiceGroup, type Choice } from "@/components/ui/Field";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon, WhatsAppGlyph } from "@/components/ui/Icon";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useLeads } from "@/components/leads/LeadProvider";
import { BikeCard } from "./BikeCard";
import { CompareSheet, CompareToggle, CompareTray, MAX_COMPARE } from "./Compare";
import { defaultFilters, facetCount, filterBikes, type BudgetId, type DiscoveryFilters } from "./match";

type FacetKey = "category" | "budget" | "usage";

const categories = Object.keys(categoryLabels) as BikeCategory[];
const usages = Object.keys(usageLabels) as RideUsage[];
const priorities = Object.keys(priorityLabels) as RidePriority[];

/** Horizontal, edge-to-edge chip row on phones; wraps from `lg` (or always, when `wrap`). */
const scrollRow =
  "[&>div]:-mx-5 [&>div]:flex-nowrap [&>div]:overflow-x-auto [&>div]:px-5 [&>div]:pb-1 [&>div]:[scrollbar-width:none] [&>div::-webkit-scrollbar]:hidden [&>div>label]:shrink-0 md:[&>div]:-mx-10 md:[&>div]:px-10";
const legendCls = "[&_legend]:font-mono [&_legend]:text-[11px] [&_legend]:font-medium [&_legend]:uppercase [&_legend]:tracking-[0.18em] [&_legend]:opacity-55";
const wrapFromLg = "lg:[&>div]:mx-0 lg:[&>div]:flex-wrap lg:[&>div]:overflow-visible lg:[&>div]:px-0";

/**
 * "Find your ride" — instant discovery with faceted filters and a lightweight
 * compare (up to three models).
 *
 * - Full (default): Category, Budget, Usage, Sort-by-priority; compare tray.
 * - `compact` (homepage): Category + Usage chips only, max `limit` results
 *   (default 6) and a "See all bikes" link. No compare.
 */
export function FindYourRide({
  compact = false,
  limit,
  index = "01",
  showHeading = true,
  id = "find-your-ride",
  className,
}: {
  compact?: boolean;
  /** Max results to show (compact defaults to 6). */
  limit?: number;
  /** SectionHeading index number. */
  index?: string;
  showHeading?: boolean;
  /** Anchor id of the section. */
  id?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { openCallback } = useLeads();
  const uid = useId();
  const [filters, setFilters] = useState<DiscoveryFilters>(defaultFilters);
  const [refineOpen, setRefineOpen] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const results = useMemo(() => filterBikes(filters), [filters]);
  const max = limit ?? (compact ? 6 : undefined);
  const shown = max ? results.slice(0, max) : results;
  const activeCount = (filters.category !== "all" ? 1 : 0) + (filters.budget !== "any" ? 1 : 0) + (filters.usage !== "any" ? 1 : 0);
  const refineCount = (filters.budget !== "any" ? 1 : 0) + (filters.usage !== "any" ? 1 : 0) + (filters.priority !== "curated" ? 1 : 0);
  const dirty = activeCount > 0 || filters.priority !== "curated";

  const update = <K extends keyof DiscoveryFilters>(key: K, value: DiscoveryFilters[K]) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    track("bike_filter", { filter: key, value: String(value), results: filterBikes(next).length, compact });
  };

  const clear = () => {
    setFilters(defaultFilters);
    track("bike_filter", { filter: "clear", results: allBikes.length, compact });
  };

  const toggleCompare = (slug: string) =>
    setCompare((c) => (c.includes(slug) ? c.filter((s) => s !== slug) : c.length >= MAX_COMPARE ? c : [...c, slug]));
  const compareBikes = compare.map((s) => allBikes.find((b) => b.slug === s)!).filter(Boolean);

  const withCount = <K extends FacetKey>(key: K, value: DiscoveryFilters[K], label: string): Choice<string> => {
    const n = facetCount(filters, key, value);
    return {
      value: String(value),
      label,
      meta: (
        <span className={cn("tabular text-[11px]", n === 0 ? "opacity-35" : "opacity-45")} aria-label={`${n} bikes`}>
          {n}
        </span>
      ),
    };
  };

  const categoryOptions: Choice<string>[] = [
    withCount("category", "all", "All"),
    ...categories.map((c) => withCount("category", c, categoryLabels[c])),
  ];
  const budgetOptions: Choice<string>[] = [
    withCount("budget", "any", "Any budget"),
    ...budgetBands.map((b) => withCount("budget", b.id, b.label)),
  ];
  const usageOptions: Choice<string>[] = [withCount("usage", "any", "Any"), ...usages.map((u) => withCount("usage", u, usageLabels[u]))];
  const priorityOptions: Choice<string>[] = [
    { value: "curated", label: "Showroom picks" },
    ...priorities.map((p) => ({ value: p, label: priorityLabels[p] })),
  ];

  // Empty-state suggestions: which single filter, if relaxed, gives results?
  const relaxations = (
    [
      filters.category !== "all" && { key: "category" as const, reset: "all" as const, label: categoryLabels[filters.category as BikeCategory] },
      filters.budget !== "any" && { key: "budget" as const, reset: "any" as const, label: budgetBands.find((b) => b.id === filters.budget)!.label },
      filters.usage !== "any" && { key: "usage" as const, reset: "any" as const, label: usageLabels[filters.usage as RideUsage] },
    ].filter(Boolean) as { key: FacetKey; reset: "all" | "any"; label: string }[]
  )
    .map((r) => ({ ...r, count: facetCount(filters, r.key, r.reset as never) }))
    .filter((r) => r.count > 0);

  const headingId = `${uid}-heading`;
  const refineId = `${uid}-refine`;

  return (
    <section id={id} aria-labelledby={showHeading ? headingId : undefined} aria-label={showHeading ? undefined : "Find your ride"} className={cn("surface-paper py-16 md:py-24", className)}>
      <div className="container-x">
        {showHeading && (
          <div id={headingId}>
            <SectionHeading
              index={index}
              eyebrow="Find your ride"
              title={["Find", "your ride."]}
              lede={
                compact
                  ? "Filter the range by what you ride for. Every Honda we sell, in one place."
                  : "Narrow the range by type, budget and the way you ride — then sort by what matters most to you. Results update as you choose."
              }
            />
          </div>
        )}

        <div className={cn(showHeading && "mt-10 md:mt-14", !compact && "lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-14")}>
          {/* ───────── Filters ───────── */}
          <div className={cn(!compact && "lg:col-span-3")}>
            <div className={cn("flex flex-col gap-5", !compact && "lg:sticky lg:top-24 lg:gap-8")}>
              <ChoiceGroup
                legend="Type"
                name={`${uid}-category`}
                options={categoryOptions}
                value={filters.category}
                onChange={(v) => update("category", v as DiscoveryFilters["category"])}
                className={cn(scrollRow, !compact && wrapFromLg, legendCls)}
              />

              {compact ? (
                <ChoiceGroup
                  legend="I ride for"
                  name={`${uid}-usage`}
                  options={usageOptions}
                  value={filters.usage}
                  onChange={(v) => update("usage", v as DiscoveryFilters["usage"])}
                  className={cn(scrollRow, legendCls)}
                />
              ) : (
                <>
                  <button
                    type="button"
                    className="flex h-12 items-center justify-between rounded-full border border-current/15 px-5 text-sm font-medium lg:hidden"
                    aria-expanded={refineOpen}
                    aria-controls={refineId}
                    onClick={() => setRefineOpen((o) => !o)}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon name="sliders" size={18} />
                      Budget, usage &amp; sort
                      {refineCount > 0 && (
                        <span className="grid size-5 place-items-center rounded-full bg-ink text-[11px] text-bone tabular">{refineCount}</span>
                      )}
                    </span>
                    <Icon name="chevron-down" size={18} className={cn("transition-transform duration-300", refineOpen && "rotate-180")} />
                  </button>
                  <div id={refineId} className={cn("flex-col gap-6 lg:flex lg:gap-8", refineOpen ? "flex" : "hidden")}>
                    <ChoiceGroup
                      legend="Budget (ex-showroom)"
                      name={`${uid}-budget`}
                      options={budgetOptions}
                      value={filters.budget}
                      onChange={(v) => update("budget", v as BudgetId | "any")}
                      className=legendCls
                    />
                    <ChoiceGroup
                      legend="I ride for"
                      name={`${uid}-usage`}
                      options={usageOptions}
                      value={filters.usage}
                      onChange={(v) => update("usage", v as DiscoveryFilters["usage"])}
                      className=legendCls
                    />
                    <ChoiceGroup
                      legend="What matters most — sort by"
                      name={`${uid}-priority`}
                      options={priorityOptions}
                      value={filters.priority}
                      onChange={(v) => update("priority", v as DiscoveryFilters["priority"])}
                      className=legendCls
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ───────── Results ───────── */}
          <div className={cn("mt-8", !compact && "lg:col-span-9 lg:mt-0")}>
            <div className="mb-5 flex min-h-11 items-center justify-between gap-4 border-b border-current/10 pb-4">
              <p className="text-sm" aria-live="polite" aria-atomic="true">
                <span className="font-display text-2xl tabular">{results.length}</span>
                <span className="ml-2 opacity-60">
                  {results.length === 1 ? "Honda matches" : "Hondas match"}
                  {filters.priority !== "curated" && `, sorted by ${priorityLabels[filters.priority].toLowerCase()}`}
                </span>
              </p>
              {dirty && (
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm opacity-70 transition-opacity hover:opacity-100"
                >
                  <Icon name="x" size={15} />
                  Clear
                </button>
              )}
            </div>

            <LayoutGroup id={uid}>
              {results.length > 0 ? (
                <ul className={cn("grid gap-4 sm:grid-cols-2 md:gap-5", compact ? "lg:grid-cols-3" : "xl:grid-cols-3")}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {shown.map((bike, i) => (
                      <motion.li
                        key={bike.slug}
                        layout={reduce ? false : "position"}
                        initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: reduce ? 1 : 0.96, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <BikeCard
                          bike={bike}
                          index={i}
                          priority={i < 2}
                          action={
                            compact ? undefined : (
                              <CompareToggle
                                bike={bike}
                                selected={compare.includes(bike.slug)}
                                disabled={!compare.includes(bike.slug) && compare.length >= MAX_COMPARE}
                                onToggle={() => toggleCompare(bike.slug)}
                              />
                            )
                          }
                        />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[28px] border border-dashed border-current/20 px-6 py-10 md:px-12 md:py-14"
                >
                  <p className="eyebrow opacity-55">0 results</p>
                  <h3 className="mt-3 font-display text-display-sm">No Honda matches all of that.</h3>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed opacity-70">
                    {relaxations.length
                      ? "Relax one filter and you'll see options straight away:"
                      : "Try clearing your filters to see the full range."}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {relaxations.map((r) => (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => update(r.key, r.reset as never)}
                        className="inline-flex h-11 items-center gap-2 rounded-full border border-current/20 px-4 text-sm transition-colors hover:border-current/60"
                      >
                        <Icon name="x" size={14} className="opacity-60" />
                        Drop “{r.label}”
                        <span className="tabular opacity-50">
                          · {r.count} {r.count === 1 ? "bike" : "bikes"}
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={clear}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm text-bone transition-colors hover:bg-ink-3"
                    >
                      Show all {allBikes.length}
                    </button>
                  </div>
                  <div className="mt-10 flex flex-col gap-4 border-t border-current/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-sm text-sm opacity-70">Not finding it? Tell our team what you need — we&apos;ll suggest the right Honda.</p>
                    <div className="flex flex-wrap gap-2.5">
                      <ButtonLink
                        href={whatsappUrl("sales")}
                        variant="outline"
                        size="md"
                        onClick={() => track("whatsapp_click", { source: "find_your_ride_empty" })}
                      >
                        <span className="inline-flex items-center gap-2">
                          <WhatsAppGlyph size={17} /> WhatsApp us
                        </span>
                      </ButtonLink>
                      <Button
                        variant="ghost"
                        iconLeft="phone"
                        onClick={() =>
                          openCallback({
                            topic: "Help choosing a bike",
                            source: "find_your_ride_empty",
                            title: "Ask our team",
                            details: "Couldn't find a match in Find your ride.",
                          })
                        }
                      >
                        Request a callback
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </LayoutGroup>

            {max && results.length > max && (
              <p className="mt-6 text-sm opacity-60">
                Showing {max} of {results.length}.
              </p>
            )}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-[12px] leading-relaxed opacity-55">
                *Indicative ex-showroom prices; mileage is an indicative real-world figure, not an official claim. Ask us for an exact on-road quote.
              </p>
              {compact && (
                <ButtonLink href="/bikes" variant="dark" icon="arrow-right" className="self-start">
                  See all {allBikes.length} bikes
                </ButtonLink>
              )}
              {!compact && (
                <Link href="#help-me-choose" className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-medium underline-offset-4 hover:underline">
                  Not sure? Let us help you choose
                  <Icon name="arrow-right" size={16} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {!compact && (
        <>
          <CompareTray
            items={compareBikes}
            onRemove={(s) => setCompare((c) => c.filter((x) => x !== s))}
            onClear={() => setCompare([])}
            onOpen={() => {
              setCompareOpen(true);
              track("bike_compare", { bikes: compare.join(","), count: compare.length });
            }}
          />
          <CompareSheet open={compareOpen} onClose={() => setCompareOpen(false)} items={compareBikes} />
        </>
      )}
    </section>
  );
}
