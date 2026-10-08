"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { SessionUser } from "@/lib/platform/types";
import { MOBILE_NAV, NAV, type NavItem } from "@/lib/platform/nav";
import { ROLES } from "@/lib/platform/rbac";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { logoutAction } from "@/server/actions/auth";
import { CommandPalette } from "./CommandPalette";

export interface ShellNotice {
  id: string;
  title: string;
  body: string;
  href: string | null;
  createdAt: string;
  read: boolean;
}

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
}

export function AppShell({ user, notices, demo, children }: { user: SessionUser; notices: ShellNotice[]; demo: boolean; children: ReactNode }) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const role = ROLES[user.role];
  const groups = NAV[user.role]
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.permission || user.permissions.includes(i.permission)) }))
    .filter((g) => g.items.length);

  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const nav = (
    <nav aria-label={`${role.label} navigation`} className="flex flex-col gap-6">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="label mb-2 px-3 !text-[10px]">{g.label}</p>
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const on = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors",
                      on ? "bg-white font-medium text-ink shadow-[0_1px_0_rgba(7,26,51,.04),0_6px_18px_-12px_rgba(7,26,51,.35)]" : "text-ink/70 hover:bg-white/70 hover:text-ink",
                    )}
                  >
                    {on && <motion.span layoutId="nav-active" className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-full bg-cyan" />}
                    <Icon name={item.icon} size={17} className={on ? "text-blue" : "text-muted group-hover:text-ink"} />
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

  const unread = notices.filter((n) => !n.read).length;

  return (
    <div className="min-h-[100svh] bg-mist">
      <a href="#app-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[70] focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-white">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-line bg-mist/80 backdrop-blur-xl lg:flex">
        <div className="flex h-[72px] items-center px-5">
          <Logo />
        </div>
        <div className="mx-5 mb-5 flex items-center justify-between rounded-xl border border-line bg-white px-3 py-2.5">
          <div>
            <p className="label !text-[9.5px]">EMC Academy</p>
            <p className="text-[13.5px] font-semibold">{role.label}</p>
          </div>
          <span className="rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan">{role.purpose}</span>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-6">{nav}</div>
        <UserCard user={user} />
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-line bg-white/85 backdrop-blur-xl lg:ml-[264px]">
        <div className="flex h-16 items-center gap-3 px-4 md:px-8 lg:h-[72px]">
          <span className="lg:hidden"><Logo /></span>
          <button
            type="button"
            onClick={() => setPalette(true)}
            className="ml-auto hidden h-10 w-full max-w-[420px] items-center gap-2.5 rounded-full border border-line bg-mist/60 px-4 text-[14px] text-muted transition-colors hover:border-ink/30 md:flex lg:ml-0"
          >
            <Icon name="search" size={16} />
            <span className="flex-1 text-left">Search or jump to…</span>
            <kbd className="rounded-md border border-line bg-white px-1.5 py-0.5 font-mono text-[10.5px]">⌘K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            {demo && (
              <span className="label hidden items-center gap-1.5 rounded-full border border-dashed border-line px-2.5 py-1 !text-[10px] sm:inline-flex" title="All people and numbers are fictional">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan" /> Demo data
              </span>
            )}
            <button type="button" onClick={() => setPalette(true)} className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white md:hidden" aria-label="Search">
              <Icon name="search" size={18} />
            </button>
            <Notifications notices={notices} unread={unread} />
            <Link href="/academy/profile" className="hidden items-center gap-2.5 rounded-full border border-line bg-white py-1 pl-1 pr-3 sm:flex" aria-label="Your profile">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-mono text-[11px] text-white">{user.initials}</span>
              <span className="text-[13.5px] font-medium">{user.firstName}</span>
            </Link>
            <button type="button" onClick={() => setDrawer(true)} className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white lg:hidden" aria-label="Open menu" aria-expanded={drawer}>
              <Icon name="menu" size={19} />
            </button>
          </div>
        </div>
      </header>

      <main id="app-main" className="px-4 pb-28 pt-6 md:px-8 md:pt-8 lg:ml-[264px] lg:pb-16">
        <div className="mx-auto max-w-[1280px]">{children}</div>
      </main>

      {/* Mobile bottom navigation */}
      <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/92 backdrop-blur-xl lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <ul className="grid grid-cols-5">
          {MOBILE_NAV[user.role].map((item) => {
            const on = isActive(pathname, item);
            return (
              <li key={item.href}>
                <Link href={item.href} aria-current={on ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium", on ? "text-ink" : "text-muted")}>
                  <span className={cn("flex h-7 w-12 items-center justify-center rounded-full transition-colors", on && "bg-soft text-blue")}>
                    <Icon name={item.icon} size={18} />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-[340px] flex-col bg-mist lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex h-16 items-center justify-between px-4">
                <span className="text-[14px] font-semibold">{role.label} · <span className="text-muted">{role.purpose}</span></span>
                <button type="button" onClick={() => setDrawer(false)} className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white" aria-label="Close menu">
                  <Icon name="close" size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-2 pb-6">{nav}</div>
              <UserCard user={user} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <CommandPalette open={palette} onClose={() => setPalette(false)} user={user} />
    </div>
  );
}

function UserCard({ user }: { user: SessionUser }) {
  return (
    <div className="border-t border-line p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-mono text-[12px] text-white">{user.initials}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold">{user.name}</p>
          <p className="truncate text-[12px] text-muted">{user.title ?? user.email}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link href="/academy/profile" className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-line bg-white text-[12.5px] font-medium hover:border-ink">
          <Icon name="settings" size={14} /> Settings
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-line bg-white text-[12.5px] font-medium hover:border-ink">
            <Icon name="logout" size={14} /> Log out
          </button>
        </form>
      </div>
    </div>
  );
}

function Notifications({ notices, unread }: { notices: ShellNotice[]; unread: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
      >
        <Icon name="bell" size={18} />
        {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan ring-2 ring-white" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 z-40 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_80px_-30px_rgba(7,26,51,.45)]"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-[14px] font-semibold">Notifications</p>
              <Link href="/academy/notifications" className="text-[12.5px] font-medium text-blue">See all</Link>
            </div>
            {notices.length === 0 ? (
              <p className="px-4 py-8 text-center text-[14px] text-muted">You’re all caught up.</p>
            ) : (
              <ul className="max-h-[360px] divide-y divide-line overflow-y-auto">
                {notices.slice(0, 6).map((n) => (
                  <li key={n.id}>
                    <Link href={n.href ?? "/academy/notifications"} className="flex gap-3 px-4 py-3 hover:bg-mist/60">
                      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-line" : "bg-cyan")} />
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-medium">{n.title}</span>
                        <span className="block truncate text-[12.5px] text-muted">{n.body}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
