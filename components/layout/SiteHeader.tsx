"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/lib/site";
import { cn, formatPhone } from "@/lib/format";
import { dealership } from "@/data/dealership";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, WhatsAppGlyph } from "@/components/ui/Icon";
import { useLeads } from "@/components/leads/LeadProvider";
import { whatsappUrl } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";
import { Wordmark } from "./Wordmark";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { openOnRoadPrice } = useLeads();
  // Pages whose first section is a dark studio can start with a transparent header.
  const darkTop = pathname === "/" || pathname.startsWith("/bikes/") || pathname === "/test-ride";

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 400 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500 ease-[var(--ease-out-expo)]",
        scrolled || !darkTop ? "border-b border-white/[0.07] bg-ink/80 backdrop-blur-xl backdrop-saturate-150" : "border-b border-transparent",
        hidden && "-translate-y-full",
      )}
    >
      <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-6 text-bone">
        <Link href="/" aria-label={`${dealership.name} — home`} className="shrink-0">
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-full px-3.5 py-2 text-[13px] font-medium tracking-wide transition-colors",
                      active ? "text-bone" : "text-bone/60 hover:text-bone",
                    )}
                  >
                    {item.label}
                    {active && <span className="absolute inset-x-3.5 -bottom-0.5 h-px bg-signal" aria-hidden />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openOnRoadPrice({ source: "header" })}
            className="hidden h-9 items-center rounded-full px-4 text-[13px] font-medium text-bone/80 transition-colors hover:bg-white/5 hover:text-bone md:inline-flex"
          >
            Get on-road price
          </button>
          <span className="hidden sm:block">
            <ButtonLink href="/test-ride" size="sm" magnetic>
              Book test ride
            </ButtonLink>
          </span>
          <a
            href={`tel:${dealership.phone.sales}`}
            onClick={() => track("phone_click", { source: "header" })}
            className="grid size-10 place-items-center rounded-full border border-white/15 text-bone transition-colors hover:bg-white/5 lg:hidden"
            aria-label={`Call ${formatPhone(dealership.phone.sales)}`}
          >
            <Icon name="phone" size={18} />
          </a>
          <a
            href={whatsappUrl("sales")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { source: "header" })}
            className="grid size-10 place-items-center rounded-full border border-white/15 text-bone transition-colors hover:bg-white/5"
            aria-label="Chat with us on WhatsApp"
          >
            <WhatsAppGlyph size={18} />
          </a>
        </div>
      </div>
    </header>
  );
}
