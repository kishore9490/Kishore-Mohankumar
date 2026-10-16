"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FileText, Plug, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/settings/company", label: "Company", icon: Building2 },
  { href: "/settings/integrations", label: "Integrations", icon: Plug, admin: true },
  { href: "/settings/templates", label: "Message templates", icon: FileText },
  { href: "/settings/users", label: "Users & invitations", icon: Users, admin: true },
  { href: "/settings/security", label: "Security", icon: ShieldCheck },
];

export function SettingsTabs({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-line" aria-label="Settings sections">
      {TABS.filter((t) => !t.admin || isAdmin).map((t) => {
        const active = pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined}
            className={cn("-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors", active ? "border-brand-600 text-brand-700" : "border-transparent text-muted hover:text-ink")}>
            <t.icon className="size-4" /> {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
