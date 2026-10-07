import { ButtonLink } from "@/components/ui/Button";
import { BikeSilhouette } from "@/components/bikes/BikeSilhouette";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink pt-[var(--header-h)] text-bone">
      <div className="container-x grid items-center gap-10 py-16 md:grid-cols-2">
        <div>
          <p className="eyebrow mb-5 text-bone/50">404 · Wrong turn</p>
          <h1 className="font-display text-display-lg">This road doesn&apos;t go anywhere.</h1>
          <p className="mt-6 max-w-md text-bone/60">
            The page you were looking for has moved or never existed. Let&apos;s get you back on track.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/bikes" icon="arrow-right">
              Explore motorcycles
            </ButtonLink>
            <ButtonLink href="/" variant="outline">
              Back home
            </ButtonLink>
          </div>
        </div>
        <BikeSilhouette shape="commuter" color="#2a2d32" accent="#3a3e44" className="w-full opacity-60" title="A parked motorcycle" />
      </div>
    </section>
  );
}
