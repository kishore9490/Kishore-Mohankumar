"use client";

import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppGlyph } from "@/components/ui/Icon";
import { dealership } from "@/data/dealership";
import { track } from "@/lib/analytics";
import { cn, formatPhone } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";

type Common = { source: string; size?: "sm" | "md" | "lg"; variant?: "primary" | "light" | "dark" | "outline" | "ghost"; className?: string };

/** Calls the service desk (tracked). */
export function CallServiceButton({ source, size = "md", variant = "outline", className, label }: Common & { label?: string }) {
  return (
    <ButtonLink
      href={`tel:${dealership.phone.service}`}
      variant={variant}
      size={size}
      iconLeft="phone"
      className={className}
      onClick={() => track("phone_click", { source, desk: "service" })}
    >
      {label ?? `Call ${formatPhone(dealership.phone.service)}`}
    </ButtonLink>
  );
}

/** Opens WhatsApp with a service-intent message (tracked). */
export function WhatsAppServiceButton({ source, size = "md", variant = "outline", className, context, label = "WhatsApp" }: Common & { context?: string; label?: string }) {
  return (
    <a
      href={whatsappUrl("service", context)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("whatsapp_click", { source, intent: "service" })}
      className={cn(
        "group/btn inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-medium transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97]",
        variant === "ghost" ? "hover:bg-current/[0.06]" : "border border-current/25 hover:border-current/60 hover:bg-current/[0.04]",
        size === "sm" ? "h-9 px-4 text-[13px]" : size === "lg" ? "h-14 px-7 text-[15px]" : "h-11 px-5 text-sm",
        className,
      )}
    >
      <WhatsAppGlyph size={18} />
      <span>{label}</span>
    </a>
  );
}

export function DirectionsButton({ source, size = "md", variant = "light", className }: Common) {
  return (
    <ButtonLink
      href={dealership.mapsUrl}
      variant={variant}
      size={size}
      iconLeft="map-pin"
      className={className}
      onClick={() => track("directions_click", { source })}
    >
      Get directions
    </ButtonLink>
  );
}
