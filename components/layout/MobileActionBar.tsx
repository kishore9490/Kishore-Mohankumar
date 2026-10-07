"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/lib/analytics";
import { whatsappLink } from "@/lib/whatsapp";

/** Thumb-reach action bar for phones. Primary action is always one tap away. */
export function MobileActionBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const on = () => setVisible(window.scrollY > 320);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  if (pathname.startsWith("/demo") || pathname.startsWith("/student") || pathname.startsWith("/login")) return null;

  const wa = whatsappLink("counsellor");

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/92 px-3 pt-2 backdrop-blur-xl transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      <nav aria-label="Quick actions" className="flex items-center gap-2">
        <Link href="/programs" className="flex w-16 flex-col items-center gap-0.5 py-1 text-[10.5px] font-medium text-muted">
          <Icon name="layers" size={20} />
          Programs
        </Link>
        <Link
          href="/demo"
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-ink text-[14.5px] font-medium text-white"
        >
          Book a free demo <Icon name="arrow" size={16} />
        </Link>
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { intent: "counsellor", placement: "mobile_bar" })}
            className="flex w-16 flex-col items-center gap-0.5 py-1 text-[10.5px] font-medium text-muted"
          >
            <Icon name="whatsapp" size={20} />
            WhatsApp
          </a>
        ) : (
          <Link href="/counselling" className="flex w-16 flex-col items-center gap-0.5 py-1 text-[10.5px] font-medium text-muted">
            <Icon name="user" size={20} />
            Counsel
          </Link>
        )}
      </nav>
    </div>
  );
}
