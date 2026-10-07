import Image from "next/image";
import { dealership } from "@/data/dealership";

/** Dealership identity. Uses the supplied logo when `dealership.logo` is set. */
export function Wordmark({ compact = false }: { compact?: boolean }) {
  if (dealership.logo) {
    return <Image src={dealership.logo} alt={dealership.name} width={160} height={40} className="h-8 w-auto" priority />;
  }
  return (
    <span className="flex items-center gap-3">
      <span aria-hidden className="relative grid size-8 place-items-center rounded-[9px] border border-current/25">
        <span className="font-display-wide text-[13px] leading-none">{dealership.shortName.charAt(0)}</span>
        <span className="absolute -bottom-px left-1/2 h-[2px] w-3 -translate-x-1/2 bg-signal" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display-wide text-[15px] tracking-[-0.01em]">{dealership.shortName}</span>
        {!compact && <span className="eyebrow mt-1 text-[9px] opacity-55">Honda · Authorised dealer</span>}
      </span>
    </span>
  );
}
