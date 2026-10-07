import { riderStories } from "@/data/stories";
import { dealership } from "@/data/dealership";
import { TrackedLink } from "@/components/layout/TrackedLink";
import { Icon, WhatsAppGlyph } from "@/components/ui/Icon";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { cn } from "@/lib/format";

const shareUrl = `https://wa.me/${dealership.whatsapp}?text=${encodeURIComponent(
  `Hi ${dealership.shortName}, I'd like to share my experience with my Honda.`,
)}`;

function QuoteMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden>
      <path
        d="M0 90V54C0 22 16 4 46 0l4 12C34 17 26 28 25 44h23v46H0Zm70 0V54c0-32 16-50 46-54l4 12c-16 5-24 16-25 32h23v46H70Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/**
 * Real, consented rider stories only (data/stories.ts). With none on file it
 * renders an honest invitation — never invented quotes.
 */
export function RiderStories({ index = "06", tone = "ink", className }: { index?: string; tone?: "ink" | "paper"; className?: string }) {
  const paper = tone === "paper";
  const [lead, ...rest] = riderStories;

  return (
    <section aria-labelledby="stories-title" className={cn("relative overflow-hidden py-24 md:py-36", paper && "surface-paper", className)}>
      <div className="container-x">
        <Reveal className="eyebrow mb-5 flex items-center gap-3 opacity-60">
          <span className="tabular">{index}</span>
          <span className="h-px w-8 bg-current opacity-40" aria-hidden />
          <span>Rider stories</span>
        </Reveal>

        {lead ? (
          <>
            <h2 id="stories-title" className="sr-only">
              Rider stories
            </h2>
            <figure className="relative grid gap-8 lg:grid-cols-12">
              <QuoteMark className="w-16 opacity-25 lg:col-span-2 lg:w-24" />
              <div className="lg:col-span-10">
                <blockquote className="font-display text-display-md text-balance">
                  <p>&ldquo;{lead.quote}&rdquo;</p>
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  <span className="h-px w-10 bg-current opacity-40" aria-hidden />
                  <span>
                    <span className="block font-medium">{lead.name}</span>
                    <span className="eyebrow opacity-55">Rides a Honda {lead.bike}</span>
                  </span>
                </figcaption>
              </div>
            </figure>
            {rest.length > 0 && (
              <ul className="mt-16 grid gap-px overflow-hidden border-t border-current/10 md:mt-24 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((s) => (
                  <li key={s.id} className="border-b border-current/10 py-8 md:pr-10">
                    <blockquote className="text-lg leading-relaxed">&ldquo;{s.quote}&rdquo;</blockquote>
                    <p className="mt-5 text-sm">
                      <span className="font-medium">{s.name}</span>
                      <span className="opacity-55"> · Honda {s.bike}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-14">
            <div className="relative lg:col-span-7">
              <QuoteMark className="pointer-events-none absolute -left-2 -top-6 w-28 opacity-[0.08] md:-top-10 md:w-44" />
              <h2 id="stories-title" className="relative font-display text-display-lg">
                <RevealLines lines={["Rider stories."]} />
              </h2>
              <Reveal delay={0.1}>
                <p className="relative mt-5 font-display text-display-sm opacity-45">
                  Coming from real riders, not copywriters.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.15} className="lg:col-span-5">
              <p className="text-base leading-relaxed opacity-70 md:text-lg">
                Bought or serviced your Honda with us? We&rsquo;d love to hear about your ride — the first trip, the daily commute,
                the long one you&rsquo;d do again. With your permission, we&rsquo;ll share it here.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                <TrackedLink
                  href={shareUrl}
                  event="whatsapp_click"
                  source="rider_stories"
                  className={cn(
                    "inline-flex h-12 items-center gap-2.5 rounded-full px-6 text-sm font-medium transition-colors",
                    paper ? "bg-ink text-bone hover:bg-ink-3" : "bg-bone text-ink hover:bg-white",
                  )}
                >
                  <WhatsAppGlyph size={18} /> Share your story
                </TrackedLink>
                <a href={`mailto:${dealership.email}?subject=${encodeURIComponent("My Honda story")}`} className="inline-flex min-h-11 items-center gap-1.5 text-sm opacity-70 hover:opacity-100">
                  Or write to us <Icon name="arrow-right" size={15} />
                </a>
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
