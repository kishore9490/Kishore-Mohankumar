"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { bikes } from "@/data/bikes";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { track } from "@/lib/analytics";

/** "Feel the ride." — the primary conversion moment on the homepage. */
export function TestRideBand() {
  const router = useRouter();
  const [bike, setBike] = useState("");
  const options = bikes.filter((b) => b.testRideAvailable);

  return (
    <section aria-labelledby="ride-title" className="relative overflow-hidden bg-ink py-24 text-bone md:py-40">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-signal/60 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[60%] w-[70%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(216_35_47/0.14),transparent)]" />
      </div>
      <div className="container-x relative text-center">
        <Reveal>
          <p className="eyebrow mb-6 text-bone/50">Test ride</p>
        </Reveal>
        <h2 id="ride-title" className="font-display-wide text-[clamp(3.2rem,1rem+10vw,10rem)] leading-[0.86]">
          <RevealLines lines={["Feel", "the ride."]} />
        </h2>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-md text-pretty text-base leading-relaxed text-bone/60">
            Specs tell you a lot. Twenty minutes in the saddle tells you everything. Choose a bike and a time — we&apos;ll
            have it ready.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <form
            className="mx-auto mt-10 flex max-w-xl flex-col gap-3 rounded-[28px] border border-white/10 bg-white/[0.03] p-2 backdrop-blur sm:flex-row sm:rounded-full"
            onSubmit={(e) => {
              e.preventDefault();
              track("test_ride_started", { source: "home_band", bike });
              router.push(bike ? `/test-ride?bike=${bike}` : "/test-ride");
            }}
          >
            <label htmlFor="band-bike" className="sr-only">
              Choose a motorcycle
            </label>
            <div className="relative flex-1">
              <select
                id="band-bike"
                value={bike}
                onChange={(e) => setBike(e.target.value)}
                className="h-14 w-full appearance-none rounded-full bg-transparent pl-6 pr-12 text-base text-bone outline-none [&>option]:text-ink"
              >
                <option value="">Which Honda would you like to ride?</option>
                {options.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    Honda {b.name}
                  </option>
                ))}
              </select>
              <Icon name="chevron-down" size={18} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-bone/50" />
            </div>
            <Button type="submit" size="lg" magnetic icon="arrow-right">
              Book test ride
            </Button>
          </form>
        </Reveal>

        <Reveal delay={0.4}>
          <ul className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-bone/50">
            {["Free, no obligation", "About 20 minutes", "Bring your driving licence"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Icon name="check" size={14} className="text-go" />
                {t}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
