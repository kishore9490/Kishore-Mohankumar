import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function AboutTeaser() {
  return (
    <section aria-labelledby="about-teaser" className="relative overflow-hidden border-t border-line py-24 md:py-36">
      <div className="container-x grid gap-12 lg:grid-cols-[0.5fr_1.5fr]">
        <p className="label flex items-start gap-2 pt-3">
          <span className="mt-[7px] inline-block h-px w-6 bg-cyan" aria-hidden="true" /> Why EMC exists
        </p>
        <div>
          <Reveal>
            <h2 id="about-teaser" className="heading text-[30px] leading-[1.15] sm:text-[42px] lg:text-[50px]">
              Healthcare runs on information.{" "}
              <span className="text-muted">
                Behind every patient record, diagnosis and healthcare transaction is a complex information workflow.
              </span>{" "}
              EMC exists to help learners understand that world — and build the practical skills to work in it.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <ButtonLink href="/about" variant="outline" className="mt-10">Read our story</ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
