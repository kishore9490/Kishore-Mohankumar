import { careerPath } from "@/data/careers";
import { Reveal } from "@/components/ui/Reveal";

/** Learn → … → Career growth. A non-promissory pathway, not a timeline guarantee. */
export function CareerPath() {
  return (
    <ol className="relative grid gap-0 md:grid-cols-7">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-line md:left-0 md:right-0 md:top-[15px] md:bottom-auto md:h-px md:w-auto" aria-hidden="true" />
      <div className="absolute left-[15px] top-2 h-1/3 w-px bg-gradient-to-b from-cyan to-transparent md:left-0 md:top-[15px] md:h-px md:w-1/3 md:bg-gradient-to-r" aria-hidden="true" />
      {careerPath.map((s, i) => (
        <Reveal as="li" key={s.id} delay={i * 0.06} className="relative flex gap-5 pb-8 md:block md:pb-0 md:pr-4">
          <span
            className={`relative z-10 flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full border font-mono text-[10.5px] ${
              i < 3 ? "border-cyan bg-white text-ink" : "border-line bg-white text-muted"
            }`}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="md:mt-6">
            <p className="text-[17px] font-semibold tracking-tight">{s.title}</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{s.text}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
