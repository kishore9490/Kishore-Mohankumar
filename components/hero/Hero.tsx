import Link from "next/link";
import { getBike, heroBikeSlug, heroColorId, startingPrice } from "@/data/bikes";
import { dealership } from "@/data/dealership";
import { formatINR } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { HeroStage } from "./HeroStage";

export function Hero() {
  const bike = getBike(heroBikeSlug)!;
  const color = bike.colors.find((c) => c.id === heroColorId) ?? bike.colors[0];

  return (
    <section aria-labelledby="hero-title" className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink text-bone">
      {/* atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="beam absolute -top-1/3 left-[28%] h-[140%] w-[38%] bg-[radial-gradient(closest-side,rgb(255_244_230/0.09),transparent)] blur-2xl" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(60%_60%_at_60%_100%,rgb(255_255_255/0.06),transparent)]" />
        <p className="font-display-wide absolute right-[-4vw] top-[calc(var(--header-h)+2vw)] select-none whitespace-nowrap text-[22vw] leading-none text-white/[0.03] lg:top-[14%] lg:text-[11vw]">
          {bike.name}
        </p>
      </div>

      <HeroStage bike={bike} color={color} />

      <div className="container-x relative mt-auto pb-[calc(var(--bottom-nav-h)+2rem)] pt-[calc(var(--header-h)+66vw)] sm:pt-[calc(var(--header-h)+56vw)] lg:pb-12 lg:pt-[calc(var(--header-h)+24rem)]">
        <div className="max-w-[40rem] lg:max-w-none">
          <p className="eyebrow fade-up mb-6 flex items-center gap-3 text-bone/60" style={{ animationDelay: "0.1s" }}>
            <span className="h-px w-8 bg-signal" aria-hidden />
            {dealership.descriptor} · {dealership.address.city}
          </p>
          <h1 id="hero-title" className="font-display text-[clamp(2.75rem,0.9rem+8vw,4.75rem)] leading-[0.92] lg:whitespace-nowrap lg:text-[clamp(4.25rem,5.6vw,6.75rem)]">
            <span className="block overflow-hidden pb-[0.04em]">
              <span className="rise block" style={{ animationDelay: "0.15s" }}>
                Your next ride
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span className="rise block text-bone/55" style={{ animationDelay: "0.26s" }}>
                starts here.
              </span>
            </span>
          </h1>
          <p className="fade-up mt-5 max-w-md text-pretty text-[15px] leading-relaxed text-bone/65 md:text-base" style={{ animationDelay: "0.45s" }}>
            Explore Honda scooters and motorcycles, book a test ride, know your EMI — and enjoy service that&apos;s
            built around you.
          </p>
          <div className="fade-up mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.6s" }}>
            <ButtonLink href="/bikes" size="lg" magnetic icon="arrow-right">
              Explore motorcycles
            </ButtonLink>
            <ButtonLink href="/test-ride" size="lg" variant="outline" magnetic className="text-bone">
              Book a test ride
            </ButtonLink>
            <Link
              href="/service/book"
              className="group ml-1 inline-flex h-14 items-center gap-2 text-sm text-bone/60 transition-colors hover:text-bone"
            >
              <Icon name="wrench" size={16} />
              <span className="underline decoration-bone/25 underline-offset-4 group-hover:decoration-bone">Book service</span>
            </Link>
          </div>
        </div>

        <div className="fade-up mt-10 flex items-end justify-between gap-6 border-t border-white/[0.08] pt-5 lg:mt-12" style={{ animationDelay: "0.8s" }}>
          <Link href={`/bikes/${bike.slug}`} className="group flex items-center gap-4">
            <span className="grid size-10 place-items-center rounded-full border border-white/15 transition-colors group-hover:border-white/40">
              <span className="size-3 rounded-full" style={{ background: color.hex }} aria-hidden />
            </span>
            <span className="flex flex-col">
              <span className="eyebrow text-[10px] text-bone/45">On the floor</span>
              <span className="text-sm">
                Honda {bike.name} <span className="text-bone/45">· from {formatINR(startingPrice(bike))}*</span>
              </span>
            </span>
            <Icon name="arrow-up-right" size={16} className="text-bone/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-bone" />
          </Link>
          <div className="hidden items-center gap-3 text-bone/40 md:flex" aria-hidden>
            <span className="eyebrow text-[10px]">Scroll</span>
            <span className="relative h-10 w-px overflow-hidden bg-white/10">
              <span className="scroll-cue absolute inset-0 bg-bone/70" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
