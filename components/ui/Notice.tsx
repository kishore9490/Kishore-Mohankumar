import { cn } from "@/lib/format";
import { Icon } from "./Icon";

const tones = {
  info: { cls: "bg-current/[0.05] border-current/15", icon: "info" as const },
  success: { cls: "bg-go-soft border-go/40 text-current", icon: "check" as const },
  warning: { cls: "bg-amber-soft border-amber/40", icon: "alert" as const },
  error: { cls: "bg-alert-soft border-alert/40", icon: "alert" as const },
};

/** Inline status feedback — never a browser alert. */
export function Notice({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: keyof typeof tones;
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed", t.cls, className)}
    >
      <Icon
        name={t.icon}
        size={18}
        className={cn("mt-0.5 shrink-0", tone === "error" && "text-alert", tone === "success" && "text-go", tone === "warning" && "text-amber")}
      />
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn(title && "mt-0.5", "opacity-80")}>{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}

export function DemoBadge({ className, label = "Demo data" }: { className?: string; label?: string }) {
  return (
    <span className={cn("eyebrow inline-flex items-center gap-1.5 rounded-full border border-amber/50 bg-amber-soft px-2.5 py-1 text-[10px] text-amber", className)}>
      <span className="size-1.5 rounded-full bg-amber" aria-hidden />
      {label}
    </span>
  );
}
