"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLeads } from "@/components/leads/LeadProvider";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Button } from "@/components/ui/Button";
import { ChoiceGroup, SelectField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { bikes, getBike, startingPrice } from "@/data/bikes";
import { track } from "@/lib/analytics";
import { calculateEmi, EMI_DEFAULTS, estimateOnRoad, TENURE_OPTIONS } from "@/lib/emi";
import { cn, formatINR, formatNumber } from "@/lib/format";

export interface EmiCalculatorProps {
  /** Seed on-road price in INR (₹30,000 – ₹10,00,000). Takes precedence over the bike estimate. */
  initialPrice?: number;
  /** Pre-select a bike; seeds the price with an estimated on-road figure. */
  bikeSlug?: string;
  /** Analytics / CRM source, e.g. "finance_page", "home", "product_page". */
  source: string;
  /** "full" for /finance; "compact" for embedding on home / product pages. */
  variant?: "full" | "compact";
  className?: string;
}

export const PRICE_MIN = 30_000;
export const PRICE_MAX = 10_00_000;
const RATE_MIN = 7;
const RATE_MAX = 18;
const DOWN_CHIPS = [10, 20, 30] as const;
const DEFAULT_PRICE = 1_20_000;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const roundTo = (n: number, step: number) => Math.round(n / step) * step;
const fmtRate = (r: number) => `${r.toFixed(2).replace(/\.?0+$/, "")}%`;
const tenureLabel = (m: number) => (m % 12 === 0 ? `${m / 12} yr${m > 12 ? "s" : ""}` : `${(m / 12).toFixed(1)} yrs`);

/** Interest segment pattern — distinguishes it by texture, not just tone. */
const hatch = "bg-[repeating-linear-gradient(135deg,currentColor_0_1.5px,transparent_1.5px_5px)]";

/* ───────────── Inputs ───────────── */

function Range({
  id,
  min,
  max,
  step,
  value,
  onChange,
  valueText,
  describedBy,
}: {
  id: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
  valueText: string;
  describedBy?: string;
}) {
  const pct = max > min ? ((clamp(value, min, max) - min) / (max - min)) * 100 : 0;
  return (
    <input
      id={id}
      type="range"
      className="range text-current"
      min={min}
      max={max}
      step={step}
      value={clamp(value, min, max)}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-valuetext={valueText}
      aria-describedby={describedBy}
      style={{ "--fill": `${pct.toFixed(2)}%` } as CSSProperties}
    />
  );
}

/** Rupee input that shows en-IN grouping at rest and raw digits while editing. */
function MoneyInput({
  id,
  value,
  onChange,
  onEditing,
  invalid,
  describedBy,
  size = "lg",
}: {
  id: string;
  value: number;
  onChange: (n: number) => void;
  onEditing?: (editing: boolean) => void;
  invalid?: boolean;
  describedBy?: string;
  size?: "lg" | "md";
}) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className="relative">
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 flex items-center font-display opacity-40",
          size === "lg" ? "text-2xl" : "text-lg",
        )}
        aria-hidden
      >
        ₹
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={draft ?? (value ? formatNumber(value) : "")}
        onFocus={() => {
          setDraft(value ? String(value) : "");
          onEditing?.(true);
        }}
        onBlur={() => {
          setDraft(null);
          onEditing?.(false);
        }}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
          setDraft(digits);
          onChange(digits ? Number(digits) : 0);
        }}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(
          "w-full border-b border-current/20 bg-transparent pb-2 pl-6 font-display tabular outline-none transition-colors placeholder:opacity-30 hover:border-current/40 focus:border-current aria-[invalid=true]:border-alert",
          size === "lg" ? "pl-7 text-[1.9rem] leading-tight" : "text-xl",
        )}
      />
    </div>
  );
}

function Control({
  label,
  htmlFor,
  value,
  note,
  noteId,
  tone = "muted",
  children,
}: {
  label: string;
  htmlFor?: string;
  value?: ReactNode;
  note?: ReactNode;
  noteId?: string;
  tone?: "muted" | "warn";
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-current/10 pt-5">
      <div className="flex items-baseline justify-between gap-4">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="eyebrow opacity-65">
            {label}
          </label>
        ) : (
          <span className="eyebrow opacity-65">{label}</span>
        )}
        {value && <span className="text-sm font-medium tabular">{value}</span>}
      </div>
      {children}
      {note && (
        <p
          id={noteId}
          className={cn("flex items-start gap-1.5 text-[13px] leading-snug", tone === "warn" ? "font-medium opacity-85" : "opacity-55")}
          aria-live="polite"
        >
          {tone === "warn" && <Icon name="alert" size={14} className="mt-px shrink-0 text-amber" />}
          {note}
        </p>
      )}
    </div>
  );
}

/* ───────────── Calculator ───────────── */

export function EmiCalculator({ initialPrice, bikeSlug: initialSlug, source, variant = "full", className }: EmiCalculatorProps) {
  const uid = useId();
  const ids = {
    bike: `${uid}-bike`,
    price: `${uid}-price`,
    priceRange: `${uid}-price-range`,
    priceNote: `${uid}-price-note`,
    down: `${uid}-down`,
    downRange: `${uid}-down-range`,
    downNote: `${uid}-down-note`,
    rate: `${uid}-rate`,
    results: `${uid}-results`,
  };
  const { openCallback, openOnRoadPrice } = useLeads();

  const seedBike = initialSlug ? getBike(initialSlug) : undefined;
  const validInitial = initialPrice && initialPrice >= PRICE_MIN && initialPrice <= PRICE_MAX ? initialPrice : undefined;
  const seed = validInitial ?? (seedBike ? estimateOnRoad(startingPrice(seedBike)) : DEFAULT_PRICE);

  const [bikeSlug, setBikeSlug] = useState(seedBike?.slug ?? "");
  const [priceKind, setPriceKind] = useState<"estimate" | "custom">(!validInitial && seedBike ? "estimate" : "custom");
  const [rawPrice, setRawPrice] = useState(seed);
  const [rawDown, setRawDown] = useState(roundTo(seed * EMI_DEFAULTS.downPaymentPct, 500));
  const [tenure, setTenure] = useState(EMI_DEFAULTS.tenureMonths);
  const [rate, setRate] = useState(EMI_DEFAULTS.annualRate);
  const [editing, setEditing] = useState<"price" | "down" | null>(null);
  const [live, setLive] = useState("");
  const interacted = useRef(false);

  const bike = bikeSlug ? getBike(bikeSlug) : undefined;
  const price = clamp(rawPrice, PRICE_MIN, PRICE_MAX);
  const down = clamp(rawDown, 0, price);
  const result = useMemo(
    () => calculateEmi({ price, downPayment: down, tenureMonths: tenure, annualRate: rate }),
    [price, down, tenure, rate],
  );
  const downPct = price ? (down / price) * 100 : 0;

  const priceNote =
    editing !== "price" && rawPrice < PRICE_MIN
      ? `Prices start around ${formatINR(PRICE_MIN)} — we're calculating with that for now.`
      : editing !== "price" && rawPrice > PRICE_MAX
        ? `This calculator goes up to ${formatINR(PRICE_MAX)} — we're using that for now.`
        : null;
  const downNote =
    rawDown > price && editing !== "down"
      ? `Down payment can't be more than the on-road price — we've capped it at ${formatINR(price)}.`
      : null;

  // Debounced analytics + screen-reader summary.
  useEffect(() => {
    const t = setTimeout(() => {
      setLive(`Estimated EMI ${formatINR(result.emi)} a month for ${tenure} months.`);
      if (interacted.current) track("emi_calculation", { price, down, tenure, rate, bike: bikeSlug || undefined, source });
    }, 800);
    return () => clearTimeout(t);
  }, [price, down, tenure, rate, bikeSlug, source, result.emi]);

  const touch = () => {
    interacted.current = true;
  };

  function setPrice(n: number, kind: "estimate" | "custom" = "custom") {
    touch();
    // Keep the same down-payment share when the price moves.
    const ratio = price ? down / price : EMI_DEFAULTS.downPaymentPct;
    setRawPrice(n);
    setRawDown(roundTo(clamp(n, PRICE_MIN, PRICE_MAX) * ratio, 500));
    setPriceKind(kind);
  }

  function chooseBike(slug: string) {
    touch();
    setBikeSlug(slug);
    const b = getBike(slug);
    if (b) setPrice(estimateOnRoad(startingPrice(b)), "estimate");
  }

  function setDown(n: number) {
    touch();
    setRawDown(n);
  }

  function requestAssistance() {
    const what = bike ? `Honda ${bike.name}` : "Motorcycle not chosen yet";
    openCallback({
      topic: "finance",
      title: "Finance assistance",
      details: `${what} · ${formatINR(price)} on-road · ${formatINR(down)} down · ${tenure} months`,
      source,
    });
  }

  const share = (n: number) => (result.totalPayable > 0 ? (n / result.totalPayable) * 100 : 0);
  const segments = [
    { key: "down", label: "Down payment", value: down, cls: "bg-current" },
    { key: "principal", label: "Loan principal", value: result.principal, cls: "bg-current/35" },
    { key: "interest", label: "Interest", value: result.totalInterest, cls: cn(hatch, "opacity-80") },
  ];

  const bar = (thin?: boolean) => (
    <div
      className={cn("flex w-full gap-[3px] overflow-hidden rounded-full", thin ? "h-2" : "h-3.5")}
      role="img"
      aria-label={`Of ${formatINR(result.totalPayable)} in total: ${formatINR(down)} down payment, ${formatINR(result.principal)} loan principal and ${formatINR(result.totalInterest)} interest.`}
    >
      {segments.map((s) =>
        s.value > 0 ? (
          <span
            key={s.key}
            className={cn("h-full rounded-[2px] transition-[width] duration-700 ease-[var(--ease-out-expo)] first:rounded-l-full last:rounded-r-full", s.cls)}
            style={{ width: `${share(s.value).toFixed(2)}%` }}
          />
        ) : null,
      )}
    </div>
  );

  const disclaimer =
    "Indicative only. Actual EMI depends on the lender, your credit profile, processing fees and the final on-road price. This is not a finance offer.";

  /* ───────── Compact ───────── */
  if (variant === "compact") {
    return (
      <div className={cn("rounded-[28px] border border-current/12 p-5 sm:p-7", className)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow opacity-60">Estimated EMI{bike ? ` · ${bike.name}` : ""}</p>
            <p className="mt-2 flex items-baseline gap-1.5">
              <AnimatedNumber value={result.emi} format={formatINR} className="font-display-wide text-[2.6rem] leading-none tabular sm:text-5xl" />
              <span className="text-sm opacity-60">/month</span>
            </p>
            <p className="mt-2 text-[13px] opacity-55">
              {tenure} months · {fmtRate(rate)} p.a. · {formatINR(result.principal)} loan
            </p>
          </div>
          <Icon name="calculator" size={22} className="mt-1 shrink-0 opacity-40" />
        </div>

        <div className="mt-5">
          {bar(true)}
        </div>

        <div className="mt-6 flex flex-col gap-5">
          <Control
            label="On-road price"
            htmlFor={ids.priceRange}
            value={formatINR(price)}
            note={priceKind === "estimate" && bike ? "Estimated on-road" : undefined}
          >
            <Range
              id={ids.priceRange}
              min={PRICE_MIN}
              max={Math.max(3_00_000, price)}
              step={500}
              value={price}
              onChange={(n) => setPrice(n)}
              valueText={formatINR(price)}
            />
          </Control>
          <ChoiceGroup
            legend={`Down payment · ${formatINR(down)}`}
            name={`${uid}-down-chips`}
            options={DOWN_CHIPS.map((p) => ({ value: String(p), label: `${p}%` }))}
            value={DOWN_CHIPS.find((p) => Math.abs(downPct - p) < 0.5)?.toString() ?? null}
            onChange={(v) => setDown(roundTo((price * Number(v)) / 100, 100))}
          />
          <ChoiceGroup
            legend="Loan duration"
            name={`${uid}-tenure`}
            options={TENURE_OPTIONS.map((m) => ({ value: String(m), label: `${m} mo` }))}
            value={String(tenure)}
            onChange={(v) => {
              touch();
              setTenure(Number(v));
            }}
          />
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button onClick={requestAssistance} icon="arrow-right">
            Request finance assistance
          </Button>
          <a
            href={`/finance${bike ? `?bike=${bike.slug}` : `?price=${price}`}`}
            className="inline-flex h-11 items-center gap-1.5 px-1 text-sm font-medium underline decoration-current/30 underline-offset-4 hover:decoration-current"
          >
            Full calculator
          </a>
        </div>
        <p className="mt-5 text-[12px] leading-relaxed opacity-50">{disclaimer}</p>
        <p className="sr-only" aria-live="polite">
          {live}
        </p>
      </div>
    );
  }

  /* ───────── Full ───────── */
  return (
    <div className={cn("grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16 xl:gap-24", className)}>
      {/* Controls */}
      <div className="flex min-w-0 flex-col gap-7">
        <SelectField
          label="Motorcycle"
          optional
          value={bikeSlug}
          onChange={(e) => chooseBike(e.target.value)}
          hint={bike ? `From ${formatINR(startingPrice(bike))} ex-showroom.` : "Pick a model to start from an estimated on-road price."}
        >
          <option value="">Not sure yet</option>
          {bikes.map((b) => (
            <option key={b.slug} value={b.slug}>
              Honda {b.name}
            </option>
          ))}
        </SelectField>

        <Control
          label="On-road price"
          htmlFor={ids.price}
          value={
            priceKind === "estimate" && bike ? (
              <span className="eyebrow rounded-full border border-current/15 px-2.5 py-1 text-[10px] font-normal opacity-70">
                Estimated on-road
              </span>
            ) : undefined
          }
          note={
            priceNote ??
            (priceKind === "estimate" && bike
              ? "Includes a rough allowance for registration and insurance. Ask us for the exact figure."
              : undefined)
          }
          noteId={ids.priceNote}
          tone={priceNote ? "warn" : "muted"}
        >
          <MoneyInput
            id={ids.price}
            value={rawPrice}
            onChange={(n) => setPrice(n)}
            onEditing={(e) => setEditing(e ? "price" : null)}
            invalid={!!priceNote}
            describedBy={ids.priceNote}
          />
          <Range
            id={ids.priceRange}
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={500}
            value={price}
            onChange={(n) => setPrice(n)}
            valueText={formatINR(price)}
          />
          <label htmlFor={ids.priceRange} className="sr-only">
            On-road price slider
          </label>
          <div className="-mt-1 flex justify-between text-[11px] tabular opacity-45" aria-hidden>
            <span>{formatINR(PRICE_MIN)}</span>
            <span>{formatINR(PRICE_MAX)}</span>
          </div>
        </Control>

        <Control
          label="Down payment"
          htmlFor={ids.down}
          value={<span className="opacity-60">{Math.round(downPct)}% of price</span>}
          note={downNote}
          noteId={ids.downNote}
          tone="warn"
        >
          <MoneyInput
            id={ids.down}
            value={rawDown}
            onChange={setDown}
            onEditing={(e) => setEditing(e ? "down" : null)}
            invalid={!!downNote}
            describedBy={downNote ? ids.downNote : undefined}
            size="md"
          />
          <Range
            id={ids.downRange}
            min={0}
            max={price}
            step={500}
            value={down}
            onChange={setDown}
            valueText={`${formatINR(down)}, ${Math.round(downPct)}% of price`}
          />
          <label htmlFor={ids.downRange} className="sr-only">
            Down payment slider
          </label>
          <ChoiceGroup
            legend="Quick down payment"
            hideLegend
            name={`${uid}-down-chips`}
            options={DOWN_CHIPS.map((p) => ({ value: String(p), label: `${p}%` }))}
            value={DOWN_CHIPS.find((p) => Math.abs(downPct - p) < 0.5)?.toString() ?? null}
            onChange={(v) => setDown(roundTo((price * Number(v)) / 100, 100))}
          />
        </Control>

        <div className="border-t border-current/10 pt-5">
          <ChoiceGroup
            legend="Loan duration"
            name={`${uid}-tenure`}
            options={TENURE_OPTIONS.map((m) => ({
              value: String(m),
              label: `${m} months`,
            }))}
            value={String(tenure)}
            onChange={(v) => {
              touch();
              setTenure(Number(v));
            }}
          />
          <p className="mt-2.5 text-[13px] opacity-55">
            {tenureLabel(tenure)}. Longer loans lower the EMI but add to the interest you pay.
          </p>
        </div>

        <Control label="Interest rate" htmlFor={ids.rate} value={`${fmtRate(rate)} p.a.`}>
          <Range
            id={ids.rate}
            min={RATE_MIN}
            max={RATE_MAX}
            step={0.25}
            value={rate}
            onChange={(n) => {
              touch();
              setRate(n);
            }}
            valueText={`${fmtRate(rate)} per year`}
          />
          <div className="-mt-1 flex justify-between text-[11px] tabular opacity-45" aria-hidden>
            <span>{RATE_MIN}%</span>
            <span>{RATE_MAX}%</span>
          </div>
        </Control>
      </div>

      {/* Results */}
      <div id={ids.results} className="min-w-0 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <section aria-label="Your estimate" className="relative z-10 overflow-hidden rounded-[28px] bg-ink p-6 text-bone sm:p-8">
          <div className="grain absolute inset-0" aria-hidden />
          <div className="relative">
            <p className="eyebrow text-bone/60">Estimated monthly EMI</p>
            <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
              <AnimatedNumber
                value={result.emi}
                format={formatINR}
                className="font-display-wide text-[clamp(2.9rem,13vw,4.6rem)] leading-[0.9] tabular"
              />
              <span className="text-base text-bone/55">/month</span>
            </p>
            <p className="mt-3 text-sm text-bone/60">
              for {tenure} months at {fmtRate(rate)} p.a.{bike ? ` · Honda ${bike.name}` : ""}
            </p>

            <div className="mt-8">
              {bar()}
              <ul className="mt-4 grid grid-cols-3 gap-3">
                {segments.map((s) => (
                  <li key={s.key} className="min-w-0">
                    <span className="flex items-center gap-2 text-[11.5px] text-bone/55">
                      <span className={cn("size-2.5 shrink-0 rounded-[3px]", s.cls)} aria-hidden />
                      <span className="truncate">{s.label}</span>
                    </span>
                    <span className="mt-1 block text-[15px] font-medium tabular">{formatINR(s.value)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-2.5">
              <Button size="lg" onClick={requestAssistance} icon="arrow-right" className="w-full">
                Request finance assistance
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => openOnRoadPrice({ bikeSlug: bikeSlug || undefined, source: `${source}_emi` })}
              >
                Get exact on-road price
              </Button>
            </div>
          </div>
        </section>

        {/* Receipt — "printed" out of the panel */}
        <div className="relative mx-4 -mt-3 sm:mx-6" aria-label="Payment breakdown">
          <div
            className="bg-paper-2 px-5 pb-9 pt-8 text-ink shadow-[0_18px_40px_-24px_rgb(10_11_13/0.45)] sm:px-7"
            style={{
              WebkitMask: "conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 16px 100%",
              mask: "conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 16px 100%",
            }}
          >
            <p className="eyebrow flex justify-between text-[10px] opacity-55">
              <span>Payment breakdown</span>
              <span>Estimate</span>
            </p>
            <dl className="mt-5 font-mono text-[13px]">
              <ReceiptRow label="On-road price" value={formatINR(price)} />
              <ReceiptRow label="Down payment" value={`− ${formatINR(down)}`} />
              <ReceiptRow label="Loan amount" value={formatINR(result.principal)} strong />
              <ReceiptRow label={`Interest · ${tenure} mo @ ${fmtRate(rate)}`} value={`+ ${formatINR(result.totalInterest)}`} />
              <ReceiptRow label="Total payable" value={formatINR(result.totalPayable)} strong />
            </dl>
            <div className="mt-5 border-t-2 border-double border-ink/25 pt-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="eyebrow text-[10px]">Estimated EMI</span>
                <span className="font-display text-xl tabular">
                  {formatINR(result.emi)}
                  <span className="font-sans text-xs font-normal normal-case opacity-55">/month</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-5 flex gap-2 px-1 text-[12.5px] leading-relaxed opacity-60">
          <Icon name="info" size={15} className="mt-0.5 shrink-0" />
          {disclaimer}
        </p>
      </div>

      <p className="sr-only" aria-live="polite">
        {live}
      </p>

      <MobileEmiBar emi={result.emi} targetId={ids.results} />
    </div>
  );
}

function ReceiptRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex items-baseline gap-2 py-1.5", strong && "font-medium")}>
      <dt className={cn("shrink-0 uppercase tracking-wide", !strong && "opacity-60")}>{label}</dt>
      <span className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-ink/25" aria-hidden />
      <dd className="shrink-0 tabular">{value}</dd>
    </div>
  );
}

/** Sticky EMI read-out on phones while the results panel is off-screen. */
function MobileEmiBar({ emi, targetId }: { emi: number; targetId: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top > 0), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [targetId]);

  return (
    <div
      className={cn(
        "fixed inset-x-3 bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom)+0.5rem)] z-40 transition-[transform,opacity] duration-500 ease-[var(--ease-out-expo)] lg:hidden",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
      aria-hidden={!visible}
    >
      <a
        href={`#${targetId}`}
        tabIndex={visible ? 0 : -1}
        className="flex items-center justify-between gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-bone shadow-[0_12px_30px_-10px_rgb(0_0_0/0.6)]"
      >
        <span className="flex items-baseline gap-2">
          <span className="eyebrow text-[10px] text-bone/55">EMI</span>
          <span className="font-display text-lg tabular">{formatINR(emi)}</span>
          <span className="text-xs text-bone/55">/mo</span>
        </span>
        <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-bone/10 px-4 text-[13px]">
          Breakdown <Icon name="chevron-down" size={15} />
        </span>
      </a>
    </div>
  );
}
