import type { Metadata } from "next";
import Link from "next/link";
import { bikes, categoryLabels, getBike, startingPrice } from "@/data/bikes";
import type { BikeCategory } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { site } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { BikeVisual } from "@/components/bikes/BikeVisual";
import { FindYourRide } from "@/components/bikes/FindYourRide";
import { HelpMeChoose } from "@/components/bikes/HelpMeChoose";
import { BikesCtaBand } from "@/components/bikes/BikesCtaBand";

const description = `Explore every Honda scooter and motorcycle at ${site.name}. Filter by budget and riding style, compare models side by side, and find the right Honda in three questions.`;

export const metadata: Metadata = {
  title: "Honda scooters & motorcycles — the full range",
  description,
  alternates: { canonical: "/bikes" },
  openGraph: {
    title: `Honda scooters & motorcycles · ${site.name}`,
    description,
    url: "/bikes",
    type: "website",
  },
};

const lineup = ["activa-125", "shine-125", "hornet-2-0"].map((s) => getBike(s)!).filter(Boolean);

export default function BikesPage() {
  const prices = bikes.map(startingPrice);
  const categories = (Object.keys(categoryLabels) as BikeCategory[])
    .map((c) => ({ c, n: bikes.filter((b) => b.category === c).length }))
    .filter((x) => x.n > 0);

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden bg-ink pb-16 pt-[calc(var(--header-h)+3.5rem)] text-bone md:pb-24 md:pt-[calc(var(--header-h)+6rem)]">
        <div className="pointer-events-none absolute inset-0 grain" aria-hidden />
        <div className="container-x relative">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <Reveal className="eyebrow mb-6 flex items-center gap-3 text-bone/60">
                <span>The range</span>
                <span className="h-px w-8 bg-current opacity-40" aria-hidden />
                <span className="tabular">{bikes.length} models</span>
              </Reveal>
              <h1 className="font-display text-display-xl">
                <RevealLines lines={["Every", "Honda.", "One floor."]} />
              </h1>
              <Reveal delay={0.2} className="mt-8 max-w-md text-base leading-relaxed text-bone/65 md:text-lg">
                <p>
                  Scooters for the daily run, commuters that go forever, and motorcycles built for the rush — from{" "}
                  <span className="tabular text-bone">{formatINR(Math.min(...prices))}</span> to{" "}
                  <span className="tabular text-bone">{formatINR(Math.max(...prices))}</span> ex-showroom*.
                </p>
              </Reveal>
              <Reveal delay={0.3} className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <Link href="#find-your-ride" className="group inline-flex min-h-11 items-center gap-2 font-medium">
                  Browse the range
                  <Icon name="arrow-right" size={16} className="rotate-90 transition-transform group-hover:translate-y-0.5" />
                </Link>
                <Link href="#help-me-choose" className="group inline-flex min-h-11 items-center gap-2 text-bone/65 hover:text-bone">
                  Not sure? Help me choose
                  <Icon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Reveal>
            </div>

            {/* line-up */}
            <div className="relative lg:col-span-6" aria-hidden>
              <div className="studio-glow absolute inset-0 -z-0" />
              <div className="relative mx-auto aspect-[16/11] max-w-xl lg:max-w-none">
                {lineup.map((b, i) => (
                  <Reveal
                    key={b.slug}
                    delay={0.15 + i * 0.12}
                    y={20}
                    className="absolute"
                    style={{
                      width: ["56%", "62%", "74%"][i],
                      left: ["0%", "38%", "13%"][i],
                      top: ["2%", "10%", "36%"][i],
                      zIndex: i,
                    }}
                  >
                    <div style={{ opacity: [0.42, 0.7, 1][i], filter: i < 2 ? "saturate(0.7)" : undefined }}>
                      <BikeVisual bike={b} priority={i === 2} sizes="40vw" />
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>

          {/* category index */}
          <Reveal delay={0.2} className="mt-14 md:mt-20">
            <ul className="grid grid-cols-2 border-t border-white/10 md:grid-cols-4">
              {categories.map(({ c, n }, i) => (
                <li key={c} className="border-b border-white/10 py-5 pr-4 md:border-b-0 md:py-7">
                  <p className="eyebrow tabular text-bone/40">0{i + 1}</p>
                  <p className="mt-3 flex items-baseline gap-2">
                    <span className="font-display-wide text-3xl tabular md:text-4xl">{n}</span>
                    <span className="text-sm text-bone/65">{categoryLabels[c]}{n === 1 ? "" : "s"}</span>
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <FindYourRide index="01" />
      <HelpMeChoose index="02" />
      <BikesCtaBand source="bikes_page_cta" />
    </>
  );
}
