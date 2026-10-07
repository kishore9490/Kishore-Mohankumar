import { ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { dealership } from "@/data/dealership";
import { cn } from "@/lib/format";
import { QuickTrack } from "./QuickTrack";
import { RegistrationPlate } from "./RegistrationPlate";
import { StageDots } from "./StageDots";
import { workshopHours } from "./utils";

export function serviceStrengths(): { icon: IconName; title: string; body: string }[] {
  const list: { icon: IconName; title: string; body: string }[] = [
    { icon: "shield", title: "Genuine parts", body: "Genuine Honda parts and recommended oils — fitted right." },
    { icon: "wrench", title: "Trained technicians", body: "People who work on Hondas every day, with the right tools for yours." },
    { icon: "receipt", title: "Transparent estimates", body: "You see the work and the cost first. Nothing extra without your OK." },
  ];
  if (dealership.pickupDrop.available) {
    list.push({
      icon: "truck",
      title: "Pickup & drop",
      body: `${dealership.pickupDrop.radiusKm ? `Within ${dealership.pickupDrop.radiusKm} km, ` : ""}subject to availability.`,
    });
  }
  return list;
}

/**
 * Homepage-ready service section — "Your bike. Always ready."
 * Dark studio surface with a live-tracker teaser and an inline quick-track field.
 */
export function ServiceShowcase({ index = "05", className, id = "service" }: { index?: string; className?: string; id?: string }) {
  const strengths = serviceStrengths();
  const hours = workshopHours()[0];
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("grain relative overflow-hidden bg-ink-2 py-24 text-bone md:py-36", className)}>
      <div
        className="pointer-events-none absolute -right-40 top-10 size-[38rem] rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.06),transparent)]"
        aria-hidden
      />
      <div className="container-x relative">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-end lg:gap-20">
          <div>
            <Reveal className="eyebrow mb-6 flex items-center gap-3 opacity-70">
              <span className="tabular opacity-60">{index}</span>
              <span className="h-px w-8 bg-current opacity-40" aria-hidden />
              <span>Service &amp; care</span>
            </Reveal>
            <h2 id={`${id}-title`} className="font-display text-display-lg text-balance">
              <RevealLines lines={["Your bike.", "Always ready."]} />
            </h2>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed opacity-70 md:text-lg">
                Book in a minute, watch every stage of the work as it happens, and ride home knowing exactly what was done — and
                why.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink href="/service/book" size="lg" icon="arrow-right">
                  Book service
                </ButtonLink>
                <ButtonLink href="/service/track" size="lg" variant="outline">
                  Track service
                </ButtonLink>
                <ButtonLink href="/garage" size="lg" variant="ghost" icon="chevron-right" className="px-4">
                  Service history
                </ButtonLink>
              </div>
              {hours && (
                <p className="mt-7 flex items-center gap-2 text-[13px] opacity-55">
                  <Icon name="clock" size={15} />
                  Workshop {hours.days}, {hours.time}
                </p>
              )}
            </Reveal>
          </div>

          <Reveal delay={0.1} y={40}>
            <div className="relative rounded-[28px] border border-white/10 bg-ink/70 p-5 shadow-[0_40px_120px_-40px_rgb(0_0_0/0.9)] backdrop-blur sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow flex items-center gap-2 opacity-60">
                  <span className="relative flex size-2" aria-hidden>
                    <span className="absolute inset-0 animate-ping rounded-full bg-signal/60" />
                    <span className="relative size-2 rounded-full bg-signal" />
                  </span>
                  Live service status
                </p>
                <span className="eyebrow text-[10px] opacity-40">Preview</span>
              </div>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-display text-display-sm">Being serviced</p>
                  <p className="mt-1.5 text-sm opacity-60">Your bike is being worked on right now.</p>
                </div>
                <RegistrationPlate registration="TN37AB1234" size="sm" className="opacity-90" />
              </div>
              <StageDots current="in-progress" className="mt-8" />
              <div className="my-7 h-px bg-white/10" aria-hidden />
              <QuickTrack label="Already with us? Track your bike" />
            </div>
          </Reveal>
        </div>

        <ul className="mt-20 grid border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4 md:mt-28">
          {strengths.map((s, i) => (
            <Reveal
              as="li"
              key={s.title}
              delay={0.06 * i}
              className={cn(
                "flex gap-4 border-b border-white/10 py-6 sm:flex-col sm:gap-5 sm:py-8 sm:pr-8 lg:border-b-0",
                i > 0 && "lg:border-l lg:pl-8",
                i % 2 === 1 && "sm:border-l sm:pl-8 lg:pl-8",
              )}
            >
              <Icon name={s.icon} size={22} className="mt-0.5 shrink-0 opacity-80" />
              <div>
                <h3 className="text-[15px] font-medium">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed opacity-60">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
