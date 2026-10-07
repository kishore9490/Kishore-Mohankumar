import { PageHero } from "./PageHero";

export function LegalPage({ title, path, sections }: { title: string; path: string; sections: { h: string; p: string }[] }) {
  return (
    <>
      <PageHero label="Legal" crumbs={[{ label: title, href: path }]} title={title} />
      <section className="py-16 md:py-24">
        <div className="container-x max-w-[760px] space-y-10">
          <p className="rounded-xl bg-mist px-5 py-4 text-[14px] text-muted">
            Template text for review. EMC should have this page reviewed and finalised by a qualified legal advisor before launch.
          </p>
          {sections.map((s) => (
            <div key={s.h}>
              <h2 className="text-[22px] font-semibold tracking-tight">{s.h}</h2>
              <p className="mt-3 text-[16px] leading-relaxed text-muted">{s.p}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
