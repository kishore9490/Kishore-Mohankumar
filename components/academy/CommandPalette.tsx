"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { SessionUser } from "@/lib/platform/types";
import { COMMANDS } from "@/lib/platform/nav";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";

interface Hit {
  type: string;
  label: string;
  sub: string;
  href: string;
}

const TYPE_ICON: Record<string, IconName> = {
  Student: "user", Faculty: "user", User: "user", Course: "book", Lesson: "book", Batch: "grid",
  Lead: "target", Certificate: "award", Campaign: "megaphone", Message: "message",
};

/** ⌘K / Ctrl+K: permission-aware actions + search. Results come from the server, which re-checks access. */
export function CommandPalette({ open, onClose, user }: { open: boolean; onClose: () => void; user: SessionUser }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const actions = useMemo(
    () =>
      COMMANDS.filter((c) => (!c.permission || user.permissions.includes(c.permission)) && (!c.roles || c.roles.includes(user.role)))
        .filter((c) => !q || `${c.label} ${c.keywords ?? ""}`.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 6),
    [q, user],
  );

  useEffect(() => {
    if (!open) return;
    setQ("");
    setHits([]);
    setActive(0);
    setTimeout(() => input.current?.focus(), 30);
  }, [open]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/academy/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((d) => setHits(d.results ?? []))
        .catch(() => {});
    }, 140);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const items = [...hits.map((h) => ({ kind: "hit" as const, ...h })), ...actions.map((a) => ({ kind: "action" as const, type: "Action", label: a.label, sub: "", href: a.href, icon: a.icon }))];

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/40 px-4 pt-[12vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search and commands"
            initial={{ opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[600px] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_40px_120px_-40px_rgba(7,26,51,.6)]"
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
              if (e.key === "Enter" && items[active]) go(items[active].href);
            }}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Icon name="search" size={18} className="text-muted" />
              <input
                ref={input}
                value={q}
                onChange={(e) => { setQ(e.target.value); setActive(0); }}
                placeholder="Search students, leads, courses… or type a command"
                className="h-14 flex-1 bg-transparent text-[16px] outline-none placeholder:text-muted"
                aria-label="Search"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={items[active] ? `pal-${active}` : undefined}
              />
              <kbd className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[10.5px] text-muted">Esc</kbd>
            </div>
            <ul id="palette-list" role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
              {items.length === 0 && <li className="px-3 py-8 text-center text-[14px] text-muted">No matches you have access to.</li>}
              {items.map((it, i) => (
                <li key={`${it.kind}-${it.href}-${i}`} id={`pal-${i}`} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(it.href)}
                    className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left", i === active ? "bg-mist" : "")}
                  >
                    <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", it.kind === "action" ? "bg-ink text-cyan" : "bg-soft text-blue")}>
                      <Icon name={it.kind === "action" ? it.icon : TYPE_ICON[it.type] ?? "file"} size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium">{it.label}</span>
                      {it.sub && <span className="block truncate text-[12px] text-muted">{it.sub}</span>}
                    </span>
                    <span className="label !text-[9.5px]">{it.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
