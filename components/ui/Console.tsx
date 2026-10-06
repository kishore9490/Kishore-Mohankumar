"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { profile } from "@/data/profile";
import { getLenis, scrollToTarget } from "@/lib/scroll";
import { store, useStore } from "@/lib/store";
import { SECTIONS } from "./Nav";

type Line = { kind: "in" | "out" | "accent"; text: string };

const BANNER: Line[] = [
  { kind: "accent", text: "km-os 1.0 — builder console" },
  { kind: "out", text: "type `help` to see what this can do. `exit` or Esc to leave." },
];

function run(raw: string): Line[] | "clear" | "exit" {
  const [cmd, ...args] = raw.trim().split(/\s+/);
  const out = (...t: string[]): Line[] => t.map((text) => ({ kind: "out", text }));
  switch ((cmd ?? "").toLowerCase()) {
    case "":
      return [];
    case "help":
      return out(
        "whoami        who is this",
        "now           what's happening right now",
        "projects      what I build",
        "stack         technologies, grouped",
        "lab           ideas I refuse to leave alone",
        "uptime        how long I've been at this",
        "goto <name>   jump to a section (about, journey, building …)",
        "build         toggle build mode",
        "contact       open a channel",
        "clear / exit",
      );
    case "whoami":
      return out(`${profile.name.first} ${profile.name.last}`, profile.roles.join(" · "), profile.positioning);
    case "now":
      return profile.now.groups.flatMap((g) => [
        { kind: "accent" as const, text: g.label.toUpperCase() },
        ...out(...g.items.map((i) => `  · ${i}`)),
      ]);
    case "projects":
      return out(...profile.projects.map((p) => `${p.status.padEnd(13)} ${p.name}`));
    case "stack": {
      const groups = new Map<string, string[]>();
      profile.technologies.forEach((t) => groups.set(t.cluster, [...(groups.get(t.cluster) ?? []), t.label]));
      return out(...[...groups].map(([k, v]) => `${k.padEnd(19)} ${v.join(", ")}`));
    }
    case "lab":
      return out(...profile.lab.map((i) => `${i.status.padEnd(12)} ${i.name} — ${i.idea}`));
    case "uptime": {
      const start = new Date("2013-01-01").getTime();
      const days = Math.floor((Date.now() - start) / 86400000);
      return out(`up ${Math.floor(days / 365)} years, ${days % 365} days. load average: building, building, building.`);
    }
    case "goto": {
      const q = (args[0] ?? "").toLowerCase();
      const s = SECTIONS.find((x) => x.id.startsWith(q) || x.label.toLowerCase().startsWith(q));
      if (!q || !s) return out(`unknown section. try: ${SECTIONS.map((x) => x.id).join(", ")}`);
      window.setTimeout(() => scrollToTarget(s.id), 50);
      return out(`→ ${s.label}`);
    }
    case "build": {
      const next = !store.get().buildMode;
      store.set({ buildMode: next });
      return [{ kind: "accent", text: `build mode ${next ? "on — the scaffolding is showing" : "off"}` }];
    }
    case "contact": {
      window.setTimeout(() => scrollToTarget("contact"), 50);
      return out("→ opening a conversation");
    }
    case "sudo":
      return out("permission denied. but I like the confidence.");
    case "ls":
      return out(SECTIONS.map((s) => s.id).join("  "));
    case "clear":
      return "clear";
    case "exit":
    case "quit":
      return "exit";
    default:
      return out(`command not found: ${cmd}. try \`help\`.`);
  }
}

export function Console() {
  const open = useStore((s) => s.consoleOpen);
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.closest("input, textarea, select, [contenteditable=true]") && t !== inputRef.current;
      if ((e.key === "`" || e.key === "~") && !typing) {
        e.preventDefault();
        if (!store.get().consoleOpen) opener.current = document.activeElement;
        store.set({ consoleOpen: !store.get().consoleOpen });
      } else if (e.key === "Escape" && store.get().consoleOpen) {
        store.set({ consoleOpen: false });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      getLenis()?.stop();
      window.setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      getLenis()?.start();
      (opener.current as HTMLElement | null)?.focus?.();
    }
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  const submit = () => {
    const result = run(value);
    if (value.trim()) setHistory((h) => [value, ...h].slice(0, 30));
    setHIndex(-1);
    setValue("");
    if (result === "clear") return setLines([]);
    if (result === "exit") return store.set({ consoleOpen: false });
    setLines((l) => [...l, { kind: "in", text: value }, ...result]);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit();
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = Math.min(history.length - 1, hIndex + 1);
      if (history[i] !== undefined) {
        setHIndex(i);
        setValue(history[i]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = hIndex - 1;
      setHIndex(Math.max(-1, i));
      setValue(i < 0 ? "" : history[i]);
    } else if (e.key === "`") {
      e.preventDefault();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Builder console"
          className="fixed inset-x-0 bottom-20 z-[96] mx-auto w-[min(640px,calc(100vw-32px))] border border-line-2 bg-ink/95 font-mono text-[12.5px] leading-relaxed shadow-[0_40px_120px_rgba(0,0,0,0.6)] backdrop-blur-xl lg:bottom-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => inputRef.current?.focus()}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="label text-mute">
              <span className="text-amber">●</span> km-os / console
            </span>
            <button type="button" className="label text-mute hover:text-paper" onClick={() => store.set({ consoleOpen: false })}>
              Esc
            </button>
          </div>
          <div ref={bodyRef} className="max-h-[46vh] overflow-y-auto px-4 py-3" data-lenis-prevent aria-live="polite">
            {lines.map((l, i) => (
              <div
                key={i}
                className={l.kind === "in" ? "text-paper" : l.kind === "accent" ? "text-amber" : "whitespace-pre-wrap text-mute"}
              >
                {l.kind === "in" ? <span className="text-dim">km@build ~ $ </span> : null}
                {l.text}
              </div>
            ))}
            <label className="flex items-center gap-0 text-paper">
              <span className="text-dim">km@build ~ $&nbsp;</span>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                className="min-w-0 flex-1 bg-transparent caret-amber outline-none"
                aria-label="Console command"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </label>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
