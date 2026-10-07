import Link from "next/link";
import type { Insight } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export function InsightCard({ post, featured }: { post: Insight; featured?: boolean }) {
  return (
    <Link
      href={`/insights/${post.slug}`}
      className={cn(
        "group flex h-full flex-col justify-between border-t border-ink pt-5 transition-colors",
        featured && "md:border-t-2",
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="label !text-cyan-ink">{post.category}</span>
          <span className="label">{post.readingMinutes} min</span>
        </div>
        <h3 className={cn("heading mt-5 transition-colors group-hover:text-blue", featured ? "text-3xl md:text-[42px]" : "text-[22px] md:text-[24px]")}>
          {post.title}
        </h3>
        <p className={cn("mt-3 text-muted", featured ? "text-[17px] leading-relaxed" : "text-[14.5px] leading-relaxed")}>{post.excerpt}</p>
      </div>
      <p className="mt-6 text-[12.5px] text-muted">{formatDate(post.publishedAt)} · {post.author}</p>
    </Link>
  );
}
