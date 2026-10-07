import type { Bike } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { StatNumber } from "./StatNumber";

const decimalsOf = (n: number) => Math.min(2, (n.toString().split(".")[1] ?? "").length);

/** Specifications as an editorial sheet: four hero numerals, then grouped definition lists. */
export function SpecSheet({ bike, index = "02" }: { bike: Bike; index?: string }) {
  const s = bike.specs;
  const stats = [
    { label: "Displacement", value: s.displacementCc, decimals: 0, unit: "cc", note: s.engine.split(",")[0] },
    { label: "Power", value: s.powerPs, decimals: decimalsOf(s.powerPs), unit: "PS", note: s.powerRpm ? `@ ${formatNumber(s.powerRpm)} rpm` : undefined },
    { label: "Torque", value: s.torqueNm, decimals: decimalsOf(s.torqueNm), unit: "Nm", note: s.torqueRpm ? `@ ${formatNumber(s.torqueRpm)} rpm` : undefined },
    ...(s.mileageKmpl
      ? [{ label: "Mileage*", value: s.mileageKmpl, decimals: 0, unit: "km/l", note: "Indicative, real-world" }]
      : []),
  ];

  const groups: { title: string; rows: [string, string][] }[] = [
    {
      title: "Performance",
      rows: [
        ["Engine", s.engine],
        ["Displacement", `${formatNumber(s.displacementCc)} cc`],
        ["Max power", `${formatNumber(s.powerPs)} PS${s.powerRpm ? ` @ ${formatNumber(s.powerRpm)} rpm` : ""}`],
        ["Max torque", `${formatNumber(s.torqueNm)} Nm${s.torqueRpm ? ` @ ${formatNumber(s.torqueRpm)} rpm` : ""}`],
      ],
    },
    {
      title: "Efficiency",
      rows: [
        ["Mileage*", s.mileageKmpl ? `~${s.mileageKmpl} km/l` : "Ask our team"],
        ["Fuel capacity", `${formatNumber(s.fuelLitres)} litres`],
      ],
    },
    {
      title: "Chassis",
      rows: [
        ["Kerb weight", `${formatNumber(s.kerbKg)} kg`],
        ["Front brake", s.brakesFront],
        ["Rear brake", s.brakesRear],
        ["Front tyre", s.tyreFront],
        ["Rear tyre", s.tyreRear],
        ...(s.seatHeightMm ? ([["Seat height", `${formatNumber(s.seatHeightMm)} mm`]] as [string, string][]) : []),
      ],
    },
    { title: "Transmission", rows: [["Gearbox", s.transmission]] },
  ];

  return (
    <section aria-labelledby="specs-title" className="surface-paper py-24 md:py-36">
      <div className="container-x">
        <div id="specs-title">
          <SectionHeading index={index} eyebrow="Specifications" title={["The numbers", "behind it."]} />
        </div>

        <dl className="mt-14 grid grid-cols-2 border-t border-current/15 md:mt-20 lg:grid-cols-4">
          {stats.map((st, i) => (
            <Reveal
              key={st.label}
              delay={i * 0.08}
              className="flex flex-col border-b border-current/10 py-7 pr-4 even:border-l even:pl-5 md:py-10 lg:border-b-0 lg:border-l lg:pl-8 lg:first:border-l-0 lg:first:pl-0"
            >
              <dt className="eyebrow order-1 opacity-55">{st.label}</dt>
              <dd className="order-2 mt-4 flex items-baseline gap-1.5">
                <StatNumber value={st.value} decimals={st.decimals} className="font-display-wide tabular text-[clamp(2.6rem,1.6rem+4vw,5.5rem)] leading-none" />
                <span className="text-base font-medium opacity-60 md:text-lg">{st.unit}</span>
              </dd>
              {st.note && <dd className="order-3 mt-2 text-[13px] opacity-55">{st.note}</dd>}
            </Reveal>
          ))}
        </dl>

        <div className="mt-16 grid gap-x-12 gap-y-12 md:mt-24 md:grid-cols-2 xl:grid-cols-4">
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="eyebrow flex items-center gap-3 opacity-60">
                <span className="size-1.5 rounded-full bg-current" aria-hidden />
                {g.title}
              </h3>
              <dl className="mt-5 border-t border-current/15">
                {g.rows.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-current/10 py-3.5 text-[14px] leading-snug xl:grid-cols-1 xl:gap-1">
                    <dt className="opacity-55">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              {g.title === "Efficiency" && (
                <p className="mt-3 text-[12px] leading-relaxed opacity-55">*Mileage is an indicative real-world figure, not an official figure. It varies with riding style, load and conditions.</p>
              )}
            </div>
          ))}
        </div>

        <p className="mt-14 max-w-2xl text-[13px] leading-relaxed opacity-60">
          Specifications are for reference; confirm with our team. Figures can vary by variant and model year.
        </p>
      </div>
    </section>
  );
}
