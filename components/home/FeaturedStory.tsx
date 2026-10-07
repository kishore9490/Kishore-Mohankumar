import Link from "next/link";
import { featuredStory, getBike, startingPrice } from "@/data/bikes";
import { formatINR } from "@/lib/format";
import { BikeVisual } from "@/components/bikes/BikeVisual";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealLines } from "@/components/ui/Reveal";

/** A single, cinematic product moment between discovery and decision. */
export function FeaturedStory() {
  const bike = getBike(featuredStory.slug);
  if (!bike) return null;
  const color = bike.colors.find((c) => c.id === featuredStory.colorId) ?? bike.colors[0];
  const stats = [
    { value: bike.specs.displacementCc.toFixed(0), unit: "cc", label: "Engine" },
    { value: String(bike.specs.powerPs), unit: "PS", label: "Power" },
    { value: String(bike.specs.torqueNm), unit: "Nm", label: "Torque" },
    { value: String(bike.specs.kerbKg), unit: "kg", label: "Kerb weight" },
  ];

  return (
    <section aria-labelledby="story-title" className="grain relative overflow-hidden bg-ink-2 py-24 text-bone md:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[70%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(31_79_143/0.22),transparent)] blur-2xl" />
      </div>
      <div className="container-x relative">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <p className="eyebrow mb-5 text-bone/50">The everyday, perfected · Honda {bike.name}</p>
            </Reveal>
            <h2 id="story-title" className="font-display text-display-lg max-w-3xl">
              <RevealLines lines={bike.tagline.split(/(?<=,)\s/)} />
            </h2>
          </div>
          <Reveal delay={0.2}>
            <p className="text-sm text-bone/55">
              From <span className="text-bone">{formatINR(startingPrice(bike))}</span> ex-showroom*
            </p>
          </Reveal>
        </div>

        <Reveal y={60} className="relative mx-auto mt-6 max-w-3xl md:mt-0">
          <Link href={`/bikes/${bike.slug}`} aria-label={`Explore the Honda ${bike.name}`} className="block">
            <BikeVisual bike={bike} color={color} sizes="(min-width: 1024px) 64rem, 100vw" />
          </Link>
        </Reveal>

        <div className="grid gap-12 border-t border-white/[0.08] pt-10 md:grid-cols-12 md:pt-14">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 md:col-span-7">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06}>
                <dt className="eyebrow text-[10px] text-bone/45">{s.label}</dt>
                <dd className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-display-wide text-4xl tabular md:text-5xl">{s.value}</span>
                  <span className="text-sm text-bone/50">{s.unit}</span>
                </dd>
              </Reveal>
            ))}
          </dl>
          <Reveal delay={0.15} className="md:col-span-5">
            <p className="text-pretty text-base leading-relaxed text-bone/65">{bike.story}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/bikes/${bike.slug}`} variant="light" icon="arrow-right">
                Explore {bike.name}
              </ButtonLink>
              <ButtonLink href={`/test-ride?bike=${bike.slug}`} variant="outline">
                Test ride
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
