import Image from "next/image";
import { publishedTestimonials } from "@/data/testimonials";
import { Section, SectionHeader } from "@/components/ui/Section";

/** CMS-ready. Renders nothing until real, verified testimonials exist. */
export function Testimonials() {
  if (!publishedTestimonials.length) return null;
  return (
    <Section aria-labelledby="testimonials-title">
      <div className="container-x">
        <SectionHeader id="testimonials-title" label="Student stories" title="In their words." />
        <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {publishedTestimonials.map((t) => (
            <li key={t.id} className="flex flex-col rounded-2xl border border-line bg-white p-7">
              <blockquote className="text-[17px] leading-relaxed">“{t.quote}”</blockquote>
              {t.outcome && <p className="mt-4 text-[13px] text-cyan-ink">{t.outcome}</p>}
              <figcaption className="mt-auto flex items-center gap-3 pt-8">
                {t.photo && <Image src={t.photo} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />}
                <div>
                  <p className="text-[14.5px] font-semibold">{t.name}</p>
                  <p className="text-[12.5px] text-muted">{t.background} · {t.course}</p>
                </div>
              </figcaption>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
