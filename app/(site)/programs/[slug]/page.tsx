import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProgram, programs } from "@/data/programs";
import { curriculumById } from "@/data/curriculum";
import { faqs as globalFaqs } from "@/data/faqs";
import { courseJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StatusNote, Pending } from "@/components/ui/StatusNote";
import { JsonLd } from "@/components/ui/JsonLd";
import { TrackView } from "@/components/ui/TrackView";
import { WhatsAppInline } from "@/components/ui/WhatsAppInline";
import { CurriculumMap } from "@/components/curriculum/CurriculumMap";
import { FacultyGrid } from "@/components/faculty/FacultyGrid";
import { FeesPanel } from "@/components/sections/FeesPanel";
import { FAQList } from "@/components/sections/FAQList";
import { LeadForm } from "@/components/forms/LeadForm";

export function generateStaticParams() {
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProgram(slug);
  if (!p) return {};
  return pageMetadata({ title: p.name, description: p.summary, path: `/programs/${p.slug}` });
}

const admission = [
  { k: "Enquire", d: "Book a demo or a counselling call." },
  { k: "Counselling", d: "We understand your background and goals." },
  { k: "Confirm", d: "Choose your batch; complete the admission form." },
  { k: "Begin", d: "Get your schedule and start learning." },
];

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProgram(slug);
  if (!p) notFound();
  const modules = p.curriculum.map((id) => curriculumById[id]).filter(Boolean);
  const faqs = p.faqs.length ? p.faqs : globalFaqs.filter((f) => ["duration", "mode", "certification", "assessment", "background", "enrol"].includes(f.id));

  const facts = [
    ["Duration", p.duration],
    ["Mode", p.mode],
    ["Schedule", p.schedule],
    ["Level", p.audience === "beginner" ? "Beginner-friendly" : p.audience === "advanced" ? "Prior exposure helpful" : "All levels"],
  ] as const;

  return (
    <>
      <TrackView event="course_view" props={{ program: p.slug }} />
      <JsonLd data={courseJsonLd(p)} />
      <JsonLd data={faqJsonLd(faqs)} />

      <PageHero
        label={p.audience === "advanced" ? "Upskill" : "Start a career"}
        crumbs={[{ label: "Programs", href: "/programs" }, { label: p.shortName, href: `/programs/${p.slug}` }]}
        title={p.name}
        intro={p.summary}
      >
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <ButtonLink href={`/contact?program=${p.slug}`} size="lg">Enquire now</ButtonLink>
          <ButtonLink href="/demo" size="lg" variant="outline">Book a demo</ButtonLink>
          <ButtonLink href={`/counselling?program=${p.slug}`} size="lg" variant="ghost" icon={null}>Talk to a counsellor</ButtonLink>
        </div>
        <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
          {facts.map(([k, v]) => (
            <div key={k} className="bg-white p-5">
              <dt className="label">{k}</dt>
              <dd className="mt-2 text-[15.5px] font-medium">{v ?? <Pending>At counselling</Pending>}</dd>
            </div>
          ))}
        </dl>
        {p.status !== "confirmed" && (
          <StatusNote className="mt-5">Indicative program outline — EMC will confirm final details.</StatusNote>
        )}
      </PageHero>

      {/* Who it's for + outcomes */}
      <Section aria-labelledby="who-title">
        <div className="container-x grid gap-16 lg:grid-cols-2">
          <div>
            <SectionHeader id="who-title" label="Who it’s for" title="Is this program for you?" />
            <ul className="mt-8 space-y-4">
              {p.whoFor.map((w) => (
                <li key={w} className="flex gap-3 text-[16px] leading-relaxed">
                  <Icon name="check" size={18} className="mt-1 shrink-0 text-cyan-ink" /> {w}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeader label="Learning outcomes" title="By the end, you can…" />
            <ol className="mt-8 divide-y divide-line border-y border-line">
              {p.outcomes.map((o, i) => (
                <li key={o} className="flex gap-5 py-4 text-[16px]">
                  <span className="font-mono text-[12px] text-muted">{String(i + 1).padStart(2, "0")}</span> {o}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* Curriculum */}
      <Section tone="mist" aria-labelledby="curr-title">
        <div className="container-x">
          <SectionHeader id="curr-title" label="Curriculum" title="What you’ll study." intro="Select a module to explore it." />
          <div className="mt-12">
            <CurriculumMap modules={modules} />
          </div>
        </div>
      </Section>

      {/* Method / practical / assessment */}
      <Section aria-label="How you will learn">
        <div className="container-x grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {[
            ["Training methodology", p.methodology],
            ["Practical exposure", p.practicalExposure],
            ["Assessment", p.assessment],
          ].map(([k, list]) => (
            <div key={k as string} className="bg-white p-7 md:p-9">
              <p className="label">{k as string}</p>
              <ul className="mt-6 space-y-3">
                {(list as string[]).map((x) => (
                  <li key={x} className="flex gap-3 text-[15px] leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Certification */}
      <Section tone="mist" aria-labelledby="cert-title">
        <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader id="cert-title" label="Certification" title="What you receive — clearly stated." />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-7">
              <p className="label">EMC course certificate</p>
              <p className="mt-4 text-[15.5px] leading-relaxed">
                {p.certification.emcCertificate ?? <Pending>Details confirmed during counselling.</Pending>}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-7">
              <p className="label">External professional certification</p>
              <p className="mt-4 text-[15.5px] leading-relaxed">
                {p.certification.externalPreparation ?? (
                  <Pending>Awarded only by independent professional bodies. Ask us how this program relates to them.</Pending>
                )}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Faculty */}
      <Section aria-labelledby="fac-title">
        <div className="container-x">
          <SectionHeader id="fac-title" label="Faculty" title="Who will teach you." />
          <div className="mt-10">
            <FacultyGrid ids={p.faculty} />
          </div>
        </div>
      </Section>

      {/* Fees */}
      <Section tone="mist" aria-labelledby="fees-title" id="fees">
        <div className="container-x">
          <SectionHeader id="fees-title" label="Fees" title="No hidden costs." />
          <div className="mt-10">
            <FeesPanel program={p} />
          </div>
        </div>
      </Section>

      {/* Admission */}
      <Section aria-labelledby="adm-title">
        <div className="container-x">
          <SectionHeader id="adm-title" label="Admission process" title="How to start." />
          <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {admission.map((a, i) => (
              <li key={a.k} className="bg-white p-7">
                <span className="font-mono text-[12px] text-cyan-ink">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-8 text-[22px] font-semibold tracking-tight">{a.k}</p>
                <p className="mt-2 text-[14.5px] text-muted">{a.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="mist" aria-labelledby="pfaq-title">
        <div className="container-x grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionHeader id="pfaq-title" label="FAQ" title="Program questions." />
          <FAQList items={faqs} />
        </div>
      </Section>

      {/* Enquiry */}
      <Section aria-labelledby="enq-title">
        <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeader id="enq-title" label="Enquire" title={<>Interested in the {p.shortName}?</>} intro="Leave your details and we’ll share full program information — duration, mode, fees and upcoming batches." />
            <WhatsAppInline intent="program" program={p.name} label="Ask on WhatsApp" className="mt-8" />
          </div>
          <div className="rounded-2xl border border-line bg-mist/60 p-6 md:p-9">
            <LeadForm variant="contact" defaultProgram={p.slug} />
          </div>
        </div>
      </Section>
    </>
  );
}
