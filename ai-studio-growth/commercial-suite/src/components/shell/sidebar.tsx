"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "./nav";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 font-display text-sm font-extrabold text-white shadow-inner">CS</span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-display text-[13px] font-bold text-white">Commercial Suite</span>
          <span className="block text-[11px] text-indigo-200/70">Infinitia Hub × AI Studio Craft</span>
        </span>
      )}
    </Link>
  );
}

export function SidebarNav({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));
  return (
    <nav className="space-y-6">
      {NAV_GROUPS.map((g) => (
        <div key={g.label}>
          <div className="mb-1.5 px-3 text-[10.5px] font-semibold tracking-[0.14em] text-indigo-200/50 uppercase">{g.label}</div>
          <ul className="space-y-0.5">
            {g.items
              .filter((i) => !("adminOnly" in i && i.adminOnly) || isAdmin)
              .map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                        active ? "bg-white/10 text-white shadow-[inset_2px_0_0_0_var(--color-brand-400)]" : "text-indigo-100/70 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <Icon className={cn("size-[17px]", active ? "text-brand-300" : "text-indigo-200/50 group-hover:text-indigo-100")} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
