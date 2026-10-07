import { dealership } from "@/data/dealership";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { cn } from "@/lib/format";
import { MetricFigure } from "./MetricFigure";

type MetricKey = keyof typeof dealership.metrics;

const METRICS: { key: MetricKey; label: string; kind: "number" | "plus" | "percent" }[] = [
  { key: "yearsServing", label: `Years serving ${dealership.address.city}`, kind: "number" },
  { key: "bikesDelivered", label: "Hondas delivered", kind: "plus" },
  { key: "serviceVisits", label: "Service visits", kind: "plus" },
  { key: "satisfactionPct", label: "Customers satisfied", kind: "percent" },
];

const STRENGTHS: { title: string; body: string; icon: IconName }[] = [
  {
    title: "Authorised Honda dealership",
    body: "Every bike comes through Honda's official channel, backed by the manufacturer's warranty — with paperwork and registration handled for you.",
    icon: "shield",
  },
  {
    title: "Genuine Honda parts",
    body: "Only genuine parts and Honda-recommended oils go into your bike, so it keeps the specification it left the factory with.",
    icon: "disc",
  },
  {
    title: "Trained technicians",
    body: "Our workshop team follows Honda's service procedures and uses the right tools for your model.",
    icon: "wrench",
  },
  {
    title: "Transparent service",
    body: "You see and approve an estimate before any work begins. Anything extra is discussed with you first.",
    icon: "receipt",
  },
  {
    title: "People you can reach",
    body: "Call or WhatsApp the showroom — sales and service each have their own line, staffed by the team you'll meet in person.",
    icon: "phone",
  },
];

/**
 * "Why riders come back." Shows verified metrics only; a `null` metric is
 * never rendered. With no metrics it falls back to qualitative strengths.
 */
export function TrustSection({ index = "05", tone = "paper", className }: { index?: string; tone?: "paper" | "ink"; className?: string }) {
  const metrics = METRICS.filter((m) => typeof dealership.metrics[m.key] === "number");
  const paper = tone === "paper";

  return (
    <section aria-labelledby="trust-title" className={cn("relative py-24 md:py-36", paper && "surface-paper", className)}>
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-14">
        <header className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)]">
            <Reveal className="eyebrow mb-5 flex items-center gap-3 opacity-60">
              <span className="tabular">{index}</span>
              <span className="h-px w-8 bg-current opacity-40" aria-hidden />
              <span>Trust</span>
            </Reveal>
            <h2 id="trust-title" className="font-display text-display-lg">
              <RevealLines lines={["Why riders", "come back."]} />
            </h2>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-md text-base leading-relaxed opacity-65 md:text-lg">
                Buying the bike is one day. Owning it is years. Here&rsquo;s what you can count on from {dealership.shortName}, long
                after delivery.
              </p>
            </Reveal>
          </div>
        </header>

        <div className="min-w-0 lg:col-span-7">
          {metrics.length > 0 && (
            <dl className={cn("grid grid-cols-2 border-t border-current/10", "mb-14")}>
              {metrics.map((m, i) => (
                <Reveal key={m.key} delay={i * 0.06} className={cn("flex flex-col-reverse border-b border-current/10 py-7 pr-4", i % 2 === 1 && "border-l pl-5 md:pl-8")}>
                  <dt className="eyebrow mt-3 opacity-55">{m.label}</dt>
                  <dd className="font-display-wide tabular text-[clamp(2.5rem,1.6rem+3.6vw,5rem)] leading-none">
                    <MetricFigure value={dealership.metrics[m.key] as number} kind={m.kind} />
                  </dd>
                </Reveal>
              ))}
            </dl>
          )}

          <ol className="border-t border-current/10">
            {STRENGTHS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.05} className="grid grid-cols-[auto_1fr] gap-x-5 border-b border-current/10 py-7 md:grid-cols-[4.5rem_1fr_auto] md:gap-x-8 md:py-9">
                <span className="tabular font-mono text-xs opacity-45 md:pt-2">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-display-sm">{s.title}</h3>
                  <p className="mt-2.5 max-w-lg text-[15px] leading-relaxed opacity-65">{s.body}</p>
                </div>
                <span className={cn("hidden size-12 place-items-center rounded-full border border-current/15 md:grid", paper ? "text-ink/70" : "text-bone/70")}>
                  <Icon name={s.icon} size={20} />
                </span>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
