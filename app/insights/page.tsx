import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { insights, insightCategories } from "@/data/insights";
import { PageHero } from "@/components/ui/PageHero";
import { InsightCard } from "@/components/sections/InsightCard";
import { cn } from "@/lib/cn";

export const metadata = pageMetadata({
  title: "EMC Insights — Medical Coding Guides",
  description: "Plain-language guides on medical coding, ICD, CPT®, the healthcare revenue cycle, certification and careers.",
  path: "/insights",
});

export default async function InsightsPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const list = c ? insights.filter((i) => i.category === c) : insights;
  const [lead, ...rest] = list;
  return (
    <>
      <PageHero label="EMC Insights" crumbs={[{ label: "Insights", href: "/insights" }]} title={<>Understand <span className="text-blue">the field.</span></>} intro="Guides, explainers and honest advice for anyone exploring medical coding.">
        <nav aria-label="Categories" className="no-scrollbar -mx-5 mt-10 flex gap-2 overflow-x-auto px-5">
          <Link href="/insights" className={cn("shrink-0 rounded-full border px-4 py-2 text-[13.5px]", !c ? "border-ink bg-ink text-white" : "border-line bg-white")}>All</Link>
          {insightCategories.map((cat) => (
            <Link
              key={cat}
              href={`/insights?c=${encodeURIComponent(cat)}`}
              className={cn("shrink-0 rounded-full border px-4 py-2 text-[13.5px]", c === cat ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink")}
            >
              {cat}
            </Link>
          ))}
        </nav>
      </PageHero>
      <section className="py-16 md:py-24">
        <div className="container-x">
          {!lead ? (
            <p className="text-[17px] text-muted">No articles in this category yet. <Link href="/insights" className="text-blue">See all insights →</Link></p>
          ) : (
            <>
              <InsightCard post={lead} featured />
              <div className="mt-16 grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => <InsightCard key={p.slug} post={p} />)}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
