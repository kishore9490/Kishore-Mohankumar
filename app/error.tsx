"use client";

import { Button, ButtonLink } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="flex min-h-[80svh] items-center bg-ink pt-[var(--header-h)] text-bone">
      <div className="container-x py-16">
        <p className="eyebrow mb-5 text-bone/50">Something went wrong</p>
        <h1 className="font-display text-display-md max-w-2xl">We hit a bump. Your details are safe.</h1>
        <p className="mt-5 max-w-md text-bone/60">Please try again — or call us and we&apos;ll help straight away.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={reset} icon="refresh">
            Try again
          </Button>
          <ButtonLink href="/contact" variant="outline">
            Contact the showroom
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
