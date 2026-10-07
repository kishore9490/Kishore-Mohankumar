"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";
import { Icon, type IconName } from "@/components/ui/Icon";

const items: { href: string; label: string; icon: IconName; primary?: boolean }[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/bikes", label: "Bikes", icon: "bike" },
  { href: "/test-ride", label: "Test ride", icon: "helmet", primary: true },
  { href: "/service", label: "Service", icon: "wrench" },
  { href: "/contact", label: "Contact", icon: "map-pin" },
];

/** Thumb-reachable primary navigation on phones and small tablets. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-ink/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 lg:hidden"
    >
      <ul className="mx-auto grid h-[var(--bottom-nav-h)] max-w-lg grid-cols-5 px-2">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 text-[10.5px] font-medium tracking-wide transition-colors",
                  active ? "text-bone" : "text-bone/50",
                )}
              >
                <span
                  className={cn(
                    "grid place-items-center rounded-full transition-all duration-300",
                    item.primary ? "size-10 -mt-1 bg-signal text-white shadow-[0_6px_20px_-6px_rgb(216_35_47/0.8)]" : "size-7",
                    active && !item.primary && "bg-white/10",
                  )}
                >
                  <Icon name={item.icon} size={item.primary ? 20 : 19} />
                </span>
                <span className={cn(item.primary && "-mt-0.5")}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
