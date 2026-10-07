import Link from "next/link";
import type { ReactNode } from "react";

export function PageHero({
  label,
  title,
  intro,
  crumbs = [],
  children,
}: {
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  crumbs?: { label: string; href: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line pb-16 pt-14 md:pb-24 md:pt-24">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_80%_at_80%_0%,black,transparent)]" aria-hidden="true" />
      <div className="container-x relative">
        <nav aria-label="Breadcrumb">
          <ol className="label flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-ink">Home</Link></li>
            {crumbs.map((c) => (
              <li key={c.href} className="flex items-center gap-2">
                <span aria-hidden="true">/</span>
                <Link href={c.href} className="hover:text-ink">{c.label}</Link>
              </li>
            ))}
          </ol>
        </nav>
        <p className="label mt-10 flex items-center gap-2 !text-cyan-ink">
          <span className="inline-block h-px w-6 bg-cyan" aria-hidden="true" /> {label}
        </p>
        <h1 className="display mt-5 max-w-5xl text-[42px] sm:text-6xl lg:text-[84px]">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-muted md:text-[19px]">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
