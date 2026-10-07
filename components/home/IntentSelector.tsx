import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

const intents: { href: string; title: string; body: string; icon: IconName; cta: string; primary?: boolean }[] = [
  { href: "/bikes", title: "Buy a bike", body: "Explore the range and find the one that fits your life.", icon: "bike", cta: "Explore" },
  { href: "/test-ride", title: "Book a test ride", body: "Feel it for yourself — free, and it takes about 20 minutes.", icon: "helmet", cta: "Book", primary: true },
  { href: "/finance", title: "Calculate EMI", body: "Know your monthly payment in seconds.", icon: "calculator", cta: "Calculate" },
  { href: "/service/book", title: "Book service", body: "Pick a slot. We'll take it from there.", icon: "wrench", cta: "Book" },
  { href: "/contact", title: "Visit showroom", body: "Directions, hours and a direct line to our team.", icon: "map-pin", cta: "Directions" },
];

/** "What do you want to do?" — the first decision after the hero. */
export function IntentSelector() {
  return (
    <section aria-labelledby="intent-title" className="relative bg-ink py-20 text-bone md:py-28">
      <div className="container-x">
        <Reveal className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-4 text-bone/50">Start here</p>
            <h2 id="intent-title" className="font-display text-display-md">
              What do you want to do?
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-bone/55">
            Buying your next Honda or looking after the one you have — everything starts with one tap.
          </p>
        </Reveal>

        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:flex">
          {intents.map((it, i) => (
            <Reveal
              as="li"
              key={it.href}
              delay={i * 0.06}
              className="group/intent bg-ink transition-[flex-grow] duration-700 ease-[var(--ease-out-expo)] lg:flex-1 lg:hover:flex-[1.55] sm:last:col-span-2 lg:last:col-span-1"
            >
              <Link
                href={it.href}
                className="relative flex h-full min-h-[7.5rem] items-center gap-5 overflow-hidden p-6 transition-colors duration-500 hover:bg-ink-2 focus-visible:bg-ink-2 lg:min-h-[21rem] lg:flex-col lg:items-start lg:justify-between lg:p-8"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-24 -right-24 size-64 rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.07),transparent)] opacity-0 transition-opacity duration-700 group-hover/intent:opacity-100"
                />
                <span
                  className={
                    it.primary
                      ? "grid size-12 shrink-0 place-items-center rounded-full bg-signal text-white"
                      : "grid size-12 shrink-0 place-items-center rounded-full border border-white/15 text-bone transition-colors group-hover/intent:border-white/40"
                  }
                >
                  <Icon name={it.icon} size={22} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1.5 lg:flex-none">
                  <span className="eyebrow text-[10px] text-bone/35 tabular">0{i + 1}</span>
                  <span className="font-display text-[1.35rem] leading-none lg:text-[1.6rem]">{it.title}</span>
                  <span className="text-sm leading-snug text-bone/55 lg:max-w-[16rem]">{it.body}</span>
                  <span className="mt-3 hidden items-center gap-2 text-sm font-medium text-bone/80 lg:inline-flex">
                    {it.cta}
                    <Icon name="arrow-right" size={16} className="transition-transform duration-500 group-hover/intent:translate-x-1" />
                  </span>
                </span>
                <Icon name="chevron-right" size={20} className="shrink-0 text-bone/35 lg:hidden" />
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
