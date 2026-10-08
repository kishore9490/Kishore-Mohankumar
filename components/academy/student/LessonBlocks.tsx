import type { LessonBlock } from "@/lib/platform/types";
import { Icon } from "@/components/ui/Icon";

/** Renders structured lesson content (text, pdf, slides and interactive lessons). */
export function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  if (!blocks.length) return <p className="text-[15px] text-muted">Your faculty hasn’t added content to this lesson yet.</p>;
  return (
    <div className="space-y-5 text-[16px] leading-[1.75] text-ink/90">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h":
            return <h2 key={i} className="pt-3 text-[21px] font-semibold leading-snug tracking-tight text-ink">{b.text}</h2>;
          case "p":
            return <p key={i}>{b.text}</p>;
          case "list":
            return (
              <ul key={i} className="space-y-2.5">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="mt-[9px] flex h-[18px] w-[18px] shrink-0 -translate-y-1 items-center justify-center rounded-full bg-soft font-mono text-[10px] font-medium text-blue">{j + 1}</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            );
          case "callout":
            return (
              <div key={i} className="flex gap-3 rounded-xl border-l-[3px] border-cyan bg-cyan/[.07] px-4 py-3.5 text-[15px]">
                <Icon name="info" size={17} className="mt-1 shrink-0 text-cyan-ink" />
                <p>{b.text}</p>
              </div>
            );
          case "example":
            return (
              <figure key={i} className="overflow-hidden rounded-xl border border-line">
                <figcaption className="label flex items-center gap-2 border-b border-line bg-mist/70 px-4 py-2.5 !text-[10.5px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden="true" /> {b.title}
                </figcaption>
                <p className="px-4 py-3.5 text-[15px]">{b.text}</p>
              </figure>
            );
        }
      })}
    </div>
  );
}
