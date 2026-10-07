"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";

const items: { href: string; label: string; icon: IconName }[] = [
  { href: "/student", label: "Overview", icon: "layers" },
  { href: "/student/courses", label: "My courses", icon: "book" },
  { href: "/student/progress", label: "Progress", icon: "chart" },
  { href: "/student/assessments", label: "Assessments", icon: "file" },
  { href: "/student/certificates", label: "Certificates", icon: "award" },
];

export function StudentNav() {
  const path = usePathname();
  return (
    <nav aria-label="Student" className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:px-0">
      {items.map((i) => {
        const on = path === i.href;
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] transition-colors",
              on ? "bg-white font-medium text-ink shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            <Icon name={i.icon} size={16} /> {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
