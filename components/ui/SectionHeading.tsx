import { cn } from "@/lib/format";
import { Reveal, RevealLines } from "./Reveal";

export function SectionHeading({
  index,
  eyebrow,
  title,
  lede,
  align = "left",
  className,
  size = "lg",
}: {
  index?: string;
  eyebrow: string;
  title: string | string[];
  lede?: string;
  align?: "left" | "center";
  className?: string;
  size?: "lg" | "md";
}) {
  const lines = Array.isArray(title) ? title : [title];
  return (
    <header className={cn("max-w-4xl", align === "center" && "mx-auto text-center", className)}>
      <Reveal className={cn("eyebrow mb-5 flex items-center gap-3 opacity-70", align === "center" && "justify-center")}>
        {index && <span className="tabular opacity-60">{index}</span>}
        {index && <span className="h-px w-8 bg-current opacity-40" aria-hidden />}
        <span>{eyebrow}</span>
      </Reveal>
      <h2 className={cn("font-display text-balance", size === "lg" ? "text-display-lg" : "text-display-md")}>
        <RevealLines lines={lines} />
      </h2>
      {lede && (
        <Reveal delay={0.15} className={cn("mt-6 max-w-2xl text-pretty text-base leading-relaxed opacity-70 md:text-lg", align === "center" && "mx-auto")}>
          <p>{lede}</p>
        </Reveal>
      )}
    </header>
  );
}
