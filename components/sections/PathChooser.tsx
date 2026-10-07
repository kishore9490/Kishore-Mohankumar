import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

const paths = [
  {
    no: "A",
    title: "Start a career",
    sub: "I’m new to medical coding.",
    cta: "Explore beginner programs",
    href: "/programs?level=beginner",
    glyph: "M4 20h16M7 20V10l5-5 5 5v10",
  },
  {
    no: "B",
    title: "Upskill",
    sub: "I already know healthcare or coding.",
    cta: "Explore advanced programs",
    href: "/programs?level=advanced",
    glyph: "M4 18l6-6 4 4 6-8M14 8h6v6",
  },
  {
    no: "C",
    title: "Get guidance",
    sub: "I’m not sure where to start.",
    cta: "Talk to a counsellor",
    href: "/counselling",
    glyph: "M12 21a9 9 0 100-18 9 9 0 000 18zM15.5 8.5l-2 5-5 2 2-5z",
  },
];

export function PathChooser() {
  return (
    <section aria-labelledby="paths-title" className="relative border-t border-line py-16 md:py-24">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2 id="paths-title" className="heading text-3xl md:text-[44px]">
            What are you looking for?
          </h2>
          <p className="label">Choose a path · we’ll tailor the rest</p>
        </div>
        <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {paths.map((p, i) => (
            <Reveal as="li" key={p.no} delay={i * 0.08} className="bg-white">
              <Link
                href={p.href}
                className="group relative flex h-full flex-col justify-between gap-12 p-7 transition-colors duration-300 hover:bg-ink hover:text-white md:min-h-[300px] md:p-9"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[12px] text-muted transition-colors group-hover:text-white/50">{p.no}</span>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-blue transition-colors group-hover:text-cyan" aria-hidden="true">
                    <path d={p.glyph} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h3 className="heading text-[30px] md:text-[36px]">{p.title}</h3>
                  <p className="mt-2 text-[16px] text-muted transition-colors group-hover:text-white/65">{p.sub}</p>
                  <p className="mt-8 inline-flex items-center gap-2 text-[14px] font-medium">
                    {p.cta}
                    <Icon name="arrow" size={16} className="transition-transform group-hover:translate-x-1" />
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
