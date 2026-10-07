import Link from "next/link";
import type { Program } from "@/lib/types";
import { curriculumById } from "@/data/curriculum";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function ProgramCard({ p, index }: { p: Program; index: number }) {
  const dark = index % 2 === 1;
  return (
    <Link
      href={`/programs/${p.slug}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border p-7 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 md:p-9",
        dark ? "border-transparent bg-ink text-white hover:shadow-[0_40px_90px_-40px_rgba(7,26,51,.9)]" : "border-line bg-white hover:shadow-[0_40px_90px_-50px_rgba(7,26,51,.5)]",
      )}
    >
      <div className={cn("absolute inset-0", dark ? "grid-bg-dark" : "grid-bg", "opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_60%)]")} aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-4">
        <span className={cn("label", dark && "!text-white/50")}>
          {p.audience === "beginner" ? "For beginners" : p.audience === "advanced" ? "For upskilling" : "All levels"}
        </span>
        <span className={cn("font-mono text-[11px]", dark ? "text-white/40" : "text-muted")}>P/{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3 className="heading relative mt-10 text-[32px] md:text-[40px]">{p.name}</h3>
      <p className={cn("relative mt-3 text-[16px]", dark ? "text-white/65" : "text-muted")}>{p.tagline}</p>

      <div className="relative mt-8 flex flex-wrap gap-1.5">
        {p.curriculum.slice(0, 7).map((id) => (
          <span
            key={id}
            className={cn("code-chip rounded-md px-2 py-1", dark ? "bg-white/[.07] text-white/80" : "bg-mist text-ink/75")}
          >
            {curriculumById[id]?.label}
          </span>
        ))}
        {p.curriculum.length > 7 && (
          <span className={cn("code-chip rounded-md px-2 py-1", dark ? "text-white/50" : "text-muted")}>+{p.curriculum.length - 7}</span>
        )}
      </div>

      <dl className={cn("relative mt-auto grid grid-cols-2 gap-4 border-t pt-6 text-[13px]", dark ? "border-white/10" : "border-line", "mt-10")}>
        <div>
          <dt className={cn("label !text-[10px]", dark && "!text-white/45")}>Duration</dt>
          <dd className="mt-1">{p.duration ?? <span className={dark ? "text-white/55" : "text-muted"}>At counselling</span>}</dd>
        </div>
        <div>
          <dt className={cn("label !text-[10px]", dark && "!text-white/45")}>Mode</dt>
          <dd className="mt-1">{p.mode ?? <span className={dark ? "text-white/55" : "text-muted"}>At counselling</span>}</dd>
        </div>
      </dl>
      <span className="relative mt-7 inline-flex items-center gap-2 text-[14px] font-medium">
        View program <Icon name="arrow" size={16} className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
