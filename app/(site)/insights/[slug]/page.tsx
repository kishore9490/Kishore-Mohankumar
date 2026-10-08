import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInsight, insights } from "@/data/insights";
import { site } from "@/data/site";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { InsightCard } from "@/components/sections/InsightCard";
import { ButtonLink } from "@/components/ui/Button";

export function generateStaticParams() {
  return insights.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getInsight(slug);
  if (!post) return {};
  return pageMetadata({ title: post.title, description: post.excerpt, path: `/insights/${post.slug}` });
}

export default async function InsightPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getInsight(slug);
  if (!post) notFound();
  const related = insights.filter((i) => i.slug !== post.slug).slice(0, 3);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          author: { "@type": "Organization", name: post.author },
          publisher: { "@type": "EducationalOrganization", name: site.legalName },
          mainEntityOfPage: `${site.url}/insights/${post.slug}`,
        }}
      />
      <PageHero label={post.category} crumbs={[{ label: "Insights", href: "/insights" }]} title={<span className="block max-w-4xl text-[38px] leading-[1.02] sm:text-6xl lg:text-[68px]">{post.title}</span>}>
        <p className="label mt-8">{formatDate(post.publishedAt)} · {post.readingMinutes} min read · {post.author}</p>
      </PageHero>
      <article className="py-16 md:py-24">
        <div className="container-x max-w-[720px]">
          <p className="text-[21px] leading-relaxed text-ink/80">{post.excerpt}</p>
          <div className="mt-10 space-y-6 text-[17.5px] leading-[1.75] text-ink/85">
            {post.body.map((b, i) => {
              if (b.type === "h2") return <h2 key={i} className="heading pt-6 text-[28px] text-ink">{b.text}</h2>;
              if (b.type === "ul")
                return (
                  <ul key={i} className="space-y-2 pl-1">
                    {b.items!.map((it) => (
                      <li key={it} className="flex gap-3"><span className="mt-[13px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />{it}</li>
                    ))}
                  </ul>
                );
              if (b.type === "note") return <p key={i} className="rounded-xl border-l-2 border-cyan bg-mist px-5 py-4 text-[15px] text-muted">{b.text}</p>;
              return <p key={i}>{b.text}</p>;
            })}
          </div>
          <div className="mt-16 rounded-2xl bg-ink p-8 text-white md:p-10">
            <p className="heading text-3xl">Want to learn this properly?</p>
            <p className="mt-3 text-white/65">Experience a class first — it’s free.</p>
            <ButtonLink href="/demo" variant="accent" className="mt-6">Book a free demo</ButtonLink>
          </div>
        </div>
      </article>
      <section className="border-t border-line py-16 md:py-24">
        <div className="container-x">
          <p className="label">Keep reading</p>
          <div className="mt-8 grid gap-10 md:grid-cols-3">
            {related.map((p) => <InsightCard key={p.slug} post={p} />)}
          </div>
        </div>
      </section>
    </>
  );
}
