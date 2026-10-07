"use client";
import { useEffect } from "react";
import type { Program } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { track } from "@/lib/analytics";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { ButtonLink } from "@/components/ui/Button";

/** Transparent when fees are published; honest "on request" state when they aren't. */
export function FeesPanel({ program }: { program: Program }) {
  const [ref, seen] = useInViewOnce<HTMLDivElement>("0px");
  useEffect(() => {
    if (seen) track("fee_view", { program: program.slug });
  }, [seen, program.slug]);

  const f = program.fee;
  const published = f.courseFee !== null;

  return (
    <div ref={ref} className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="grid md:grid-cols-[1.1fr_1fr]">
        <div className="p-7 md:p-10">
          <p className="label">Fees · {program.shortName}</p>
          {published ? (
            <>
              <p className="display mt-5 text-5xl md:text-6xl">{formatMoney(f.courseFee!, f.currency)}</p>
              <p className="mt-2 text-[14px] text-muted">Course fee{f.notes ? ` · ${f.notes}` : ""}</p>
            </>
          ) : (
            <>
              <p className="heading mt-5 text-3xl md:text-4xl">Shared openly during counselling.</p>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
                Fees for this program are being finalised. Ask us and you’ll get the complete breakdown — course fee,
                registration and any instalment options — with no obligation.
              </p>
            </>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {published && f.paymentLink ? (
              <ButtonLink href={f.paymentLink} onClick={() => track("application_started", { program: program.slug })}>
                Pay & enrol
              </ButtonLink>
            ) : (
              <ButtonLink href={`/counselling?program=${program.slug}&topic=fees`}>Ask about fees</ButtonLink>
            )}
            <ButtonLink href="/demo" variant="outline" icon={null}>Book a free demo</ButtonLink>
          </div>
        </div>
        <dl className="grid content-start gap-px bg-line md:border-l md:border-line">
          {[
            ["Course fee", f.courseFee !== null ? formatMoney(f.courseFee, f.currency) : null],
            ["Registration fee", f.registrationFee !== null ? formatMoney(f.registrationFee, f.currency) : null],
            [
              "Instalment options",
              f.installments?.length ? f.installments.map((x) => `${x.label}: ${formatMoney(x.amount, f.currency)}`).join(" · ") : null,
            ],
            ["Scholarships / discounts", f.scholarships],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 bg-white px-7 py-5">
              <dt className="text-[14px] text-muted">{k}</dt>
              <dd className="text-right text-[14.5px] font-medium">{v ?? <span className="font-normal italic text-muted">On request</span>}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
