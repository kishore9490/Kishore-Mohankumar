import { LeadForm } from "@/components/forms/LeadForm";
import { Icon } from "@/components/ui/Icon";

const points = [
  "Sit in on a real EMC-style session",
  "See how a case is coded, step by step",
  "Ask faculty anything about the field",
  "No fee, no obligation",
];

export function DemoSection({ id = "demo" }: { id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative overflow-hidden bg-ink py-20 text-white md:py-28">
      <div className="grid-bg-dark absolute inset-0" aria-hidden="true" />
      <div className="absolute -right-40 top-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(18,181,212,.18),transparent_65%)]" aria-hidden="true" />
      <div className="container-x relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="label flex items-center gap-2 !text-white/55">
            <span className="inline-block h-px w-6 bg-cyan" aria-hidden="true" /> Free demo class
          </p>
          <h2 id={`${id}-title`} className="heading mt-5 text-[38px] sm:text-5xl lg:text-[64px]">
            Experience EMC <span className="text-cyan">before you enrol.</span>
          </h2>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-white/65">
            The best way to know if medical coding is right for you is to try it. Tell us when suits you — we’ll do the rest.
          </p>
          <ul className="mt-10 space-y-3.5">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[15.5px] text-white/85">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan/15 text-cyan">
                  <Icon name="check" size={13} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-6 backdrop-blur md:p-9">
          <LeadForm variant="demo" dark />
        </div>
      </div>
    </section>
  );
}
