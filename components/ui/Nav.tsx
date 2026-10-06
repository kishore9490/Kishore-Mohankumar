"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useActiveSection } from "@/hooks/useActiveSection";
import { scrollToTarget, getLenis } from "@/lib/scroll";
import { store, useStore } from "@/lib/store";
import { cx, pad } from "@/lib/utils";

export const SECTIONS = [
  { id: "top", label: "Introduction" },
  { id: "about", label: "About" },
  { id: "journey", label: "Journey" },
  { id: "building", label: "Building" },
  { id: "stack", label: "Stack" },
  { id: "experience", label: "Experience" },
  { id: "now", label: "Now" },
  { id: "lab", label: "Lab" },
  { id: "beyond", label: "Beyond" },
  { id: "contact", label: "Contact" },
];
const IDS = SECTIONS.map((s) => s.id);
const LINKS = ["about", "building", "experience", "lab", "now", "contact"];

export function Nav() {
  const active = useActiveSection(IDS);
  const activeIndex = Math.max(0, IDS.indexOf(active));
  const [scrolled, setScrolled] = useState(false);
  const [past, setPast] = useState(false);
  const [moved, setMoved] = useState(false);
  const [open, setOpen] = useState(false);
  const build = useStore((s) => s.buildMode);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const clicks = useRef<number[]>([]);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.6);
      setPast(window.scrollY > window.innerHeight * 0.35);
      setMoved(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    getLenis()?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      getLenis()?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Easter egg: five quick clicks on the mark toggles Build Mode.
  const onMark = () => {
    const now = performance.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 1600), now];
    const n = clicks.current.length;
    if (n >= 5) {
      clicks.current = [];
      const next = !store.get().buildMode;
      store.set({ buildMode: next });
      setHint(next ? "Build mode — on" : "Build mode — off");
      window.setTimeout(() => setHint(null), 2200);
    } else if (n >= 3) {
      setHint(`${5 - n} more`);
      window.setTimeout(() => setHint((h) => (h && h.endsWith("more") ? null : h)), 900);
    } else if (n === 1) {
      scrollToTarget("top");
    }
  };

  const go = (id: string) => {
    setOpen(false);
    scrollToTarget(id);
  };

  const current = SECTIONS[activeIndex];

  return (
    <>
      <a href="#main" className="sr-only-focusable fixed left-4 top-4 z-[90] bg-amber px-4 py-2 text-ink">
        Skip to content
      </a>

      {/* page progress */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[80] h-px origin-left bg-amber"
        style={{ scaleX: progress }}
      />

      <header className="pointer-events-none fixed inset-x-0 top-0 z-[70] page-x">
        <div className="flex items-start justify-between pt-5 md:pt-6">
          {/* Mark */}
          <div className="pointer-events-auto flex items-center gap-4">
            <button
              type="button"
              onClick={onMark}
              aria-label="KM — Kishore Mohankumar, back to top"
              data-cursor={build ? "Build" : undefined}
              className={cx(
                "grid h-11 w-11 place-items-center border font-display text-[15px] font-semibold tracking-[-0.04em] transition-colors duration-500",
                build ? "border-amber bg-amber text-ink" : "border-line-2 bg-ink/40 text-paper backdrop-blur-md hover:border-paper",
              )}
            >
              KM
            </button>
            <div
              className={cx(
                "hidden flex-col transition-all duration-700 md:flex",
                moved ? "-translate-x-2 opacity-0" : "opacity-100",
              )}
              aria-hidden={moved}
            >
              <span className="label text-paper">Kishore Mohankumar</span>
              <span className="label text-mute">Still building</span>
            </div>
            <AnimatePresence>
              {hint && (
                <motion.span
                  role="status"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="label bg-amber px-2 py-1 text-ink"
                >
                  {hint}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop capsule */}
          <nav
            aria-label="Primary"
            className={cx(
              "pointer-events-auto hidden items-center rounded-full border transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:flex",
              scrolled ? "border-line-2 bg-ink/70 py-1.5 pl-5 pr-1.5 backdrop-blur-xl" : "border-transparent bg-transparent py-1.5 pl-0 pr-0",
            )}
          >
            <div
              className={cx(
                "flex items-center gap-3 overflow-hidden whitespace-nowrap transition-all duration-700",
                scrolled ? "mr-4 max-w-[220px] opacity-100" : "mr-0 max-w-0 opacity-0",
              )}
              aria-hidden={!scrolled}
            >
              <span className="label tabular-nums text-amber">
                {pad(activeIndex)}/{pad(SECTIONS.length - 1)}
              </span>
              <span className="relative block h-[1.4em] min-w-[90px] overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={current.id}
                    className="label absolute left-0 top-0 text-paper"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-100%" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {current.label}
                  </motion.span>
                </AnimatePresence>
              </span>
            </div>
            <ul className="flex items-center">
              {LINKS.map((id) => {
                const s = SECTIONS.find((x) => x.id === id)!;
                const on = active === id;
                return (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        go(id);
                      }}
                      aria-current={on ? "true" : undefined}
                      className={cx(
                        "label relative flex items-center gap-2 rounded-full px-3.5 py-2.5 transition-colors duration-300",
                        on ? "text-paper" : "text-mute hover:text-paper",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cx("h-1 w-1 rounded-full bg-amber transition-transform duration-500", on ? "scale-100" : "scale-0")}
                      />
                      {s.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      {/* Mobile bottom capsule */}
      <div
        className={cx(
          "fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden",
          past || open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
        )}
      >
        <div className="flex items-center gap-1 rounded-full border border-line-2 bg-ink/80 p-1.5 pl-5 backdrop-blur-xl">
          <span className="pulse mr-2 scale-75" aria-hidden="true" />
          <span className="label mr-1 tabular-nums text-amber">{pad(activeIndex)}</span>
          <span className="label min-w-[86px] text-paper">{current.label}</span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="label rounded-full bg-paper px-4 py-3 text-ink"
          >
            Menu
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-[95] flex flex-col bg-ink page-x pb-8 pt-6"
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            exit={{ clipPath: "inset(100% 0 0 0)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between">
              <span className="label text-mute">Index</span>
              <button type="button" onClick={() => setOpen(false)} className="label border border-line-2 px-4 py-3" autoFocus>
                Close
              </button>
            </div>
            <nav aria-label="Mobile" className="mt-auto">
              <ul>
                {SECTIONS.map((s, i) => (
                  <li key={s.id} className="border-t border-line">
                    <a
                      href={`#${s.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        go(s.id);
                      }}
                      className="flex items-baseline gap-4 py-2.5"
                    >
                      <span className={cx("label w-6 tabular-nums", active === s.id ? "text-amber" : "text-dim")}>{pad(i)}</span>
                      <span className="display text-[9.5vw] leading-none">{s.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
