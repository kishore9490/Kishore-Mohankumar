"use client";
import { track } from "@/lib/analytics";
import { whatsappLink, type WhatsAppIntent } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/** Contextual WhatsApp link. Renders nothing if WhatsApp isn't configured. */
export function WhatsAppInline({
  intent,
  label,
  program,
  className,
  dark,
}: {
  intent: WhatsAppIntent;
  label: string;
  program?: string;
  className?: string;
  dark?: boolean;
}) {
  const href = whatsappLink(intent, { program });
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("whatsapp_click", { intent, program })}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors",
        dark ? "border-white/20 text-white hover:border-white/50" : "border-line text-ink hover:border-ink",
        className,
      )}
    >
      <Icon name="whatsapp" size={17} className="text-[#25D366]" />
      {label}
    </a>
  );
}
