import { cn, formatRegistration } from "@/lib/format";

/**
 * Registration rendered as a small Indian high-security plate — an instantly
 * recognisable "this is my bike" cue. Purely presentational.
 */
export function RegistrationPlate({
  registration,
  size = "md",
  className,
}: {
  registration: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const text = formatRegistration(registration);
  return (
    <span
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-[6px] border border-black/80 bg-[#f7f6f2] text-[#0a0b0d] shadow-[0_1px_0_rgb(255_255_255/0.4)_inset,0_6px_18px_-8px_rgb(0_0_0/0.5)]",
        className,
      )}
      aria-label={`Registration ${text}`}
      role="img"
    >
      <span
        className={cn(
          "flex flex-col items-center justify-center bg-[#1d3a8a] font-mono font-medium leading-none text-white",
          size === "sm" ? "px-1 text-[6px]" : size === "lg" ? "px-2 text-[9px]" : "px-1.5 text-[7px]",
        )}
        aria-hidden
      >
        <span className={cn("mb-0.5 rounded-full border border-white/70", size === "lg" ? "size-2.5" : "size-1.5")} />
        IND
      </span>
      <span
        className={cn(
          "whitespace-nowrap font-display tabular tracking-[0.06em]",
          size === "sm" ? "px-2 py-0.5 text-[13px]" : size === "lg" ? "px-4 py-1.5 text-2xl md:text-[28px]" : "px-3 py-1 text-base",
        )}
        aria-hidden
      >
        {text}
      </span>
    </span>
  );
}
