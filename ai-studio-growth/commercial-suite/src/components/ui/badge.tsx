import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { STATUS_META, type DocumentStatus } from "@/lib/documents/meta";

export type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "purple" | "sample";

const tones: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  purple: "bg-brand-50 text-brand-700 ring-brand-200",
  sample: "bg-amber-50 text-amber-800 ring-amber-200",
};

export function Badge({ tone = "neutral", children, className, dot }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset", tones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const m = STATUS_META[status];
  return (
    <Badge tone={m.tone} dot>
      {m.label}
    </Badge>
  );
}

export function SampleBadge() {
  return <Badge tone="sample">Sample</Badge>;
}
