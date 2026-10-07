import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/** Small honest disclosure used wherever content is indicative or simulated. */
export function StatusNote({ children, dark, className }: { children: React.ReactNode; dark?: boolean; className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-start gap-2 text-[12.5px] leading-snug",
        dark ? "text-white/55" : "text-muted",
        className,
      )}
    >
      <Icon name="info" size={14} className="mt-[2px] shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function Pending({ children = "Shared during counselling", className }: { children?: React.ReactNode; className?: string }) {
  return <span className={cn("text-muted italic", className)}>{children}</span>;
}
