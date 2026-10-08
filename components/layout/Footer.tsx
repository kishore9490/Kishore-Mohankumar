import Link from "next/link";
import { site } from "@/data/site";
import { programs } from "@/data/programs";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { ContactLinks } from "@/components/layout/ContactLinks";

const cols = [
  {
    title: "Learn",
    links: [
      { label: "All programs", href: "/programs" },
      ...programs.map((p) => ({ label: p.name, href: `/programs/${p.slug}` })),
      { label: "What is medical coding?", href: "/medical-coding" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Career pathways", href: "/career" },
      { label: "Faculty", href: "/faculty" },
      { label: "EMC Insights", href: "/insights" },
      { label: "About EMC", href: "/about" },
    ],
  },
  {
    title: "Start",
    links: [
      { label: "Book a free demo", href: "/demo" },
      { label: "Free counselling", href: "/counselling" },
      { label: "Contact", href: "/contact" },
      { label: "Academy login", href: "/login" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="grid-bg-dark pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="container-x relative pb-28 pt-20 md:pb-12">
        <div className="flex flex-col gap-10 border-b border-white/10 pb-14 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="label text-white/50">Ready when you are</p>
            <p className="heading mt-4 max-w-xl text-4xl md:text-5xl">
              Experience EMC <span className="text-cyan">before</span> you enrol.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/demo" variant="accent" size="lg">Book a free demo</ButtonLink>
            <ButtonLink href="/counselling" variant="outline-light" size="lg">Talk to a counsellor</ButtonLink>
          </div>
        </div>

        <div className="grid gap-12 pt-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          <div>
            <Logo invert />
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-white/60">
              {site.legalName}. A professional gateway into the world of medical coding.
            </p>
          </div>
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <p className="label text-white/45">{c.title}</p>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[14px] text-white/75 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div>
            <p className="label text-white/45">Contact</p>
            <div className="mt-4">
              <ContactLinks dark />
            </div>
            {site.social.length > 0 && (
              <ul className="mt-6 flex gap-3">
                {site.social.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/70 hover:text-white">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 text-[12.5px] text-white/45 lg:flex-row lg:items-start lg:justify-between">
          <p className="max-w-2xl leading-relaxed">
            EMC is an education provider. We do not provide medical advice or healthcare services. Patient cases on
            this website are fictional and for learning only. Career outcomes depend on individual effort, skills and
            market conditions; we do not guarantee employment or salaries. CPT® is a registered trademark of the
            American Medical Association.
          </p>
          <div className="flex shrink-0 flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/disclaimer" className="hover:text-white">Disclaimer</Link>
            <span>© {new Date().getFullYear()} {site.legalName}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
