"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { cn } from "@/lib/format";

/**
 * Accessible modal sheet: bottom sheet on mobile, side panel on desktop.
 * Focus is trapped and restored; Escape and backdrop close it.
 */
export function Sheet({
  open,
  onClose,
  title,
  eyebrow,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      const first = panel.current?.querySelector<HTMLElement>("input, select, textarea, button:not([data-close])");
      (first ?? panel.current)?.focus();
    }, 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panel.current) return;
      const els = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={cn(
              "surface-paper absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-[28px] outline-none md:inset-y-3 md:left-auto md:right-3 md:max-h-none md:w-[30rem] md:rounded-[28px]",
              className,
            )}
            initial={reduce ? { opacity: 0 } : { y: "100%", x: 0 }}
            animate={reduce ? { opacity: 1 } : { y: 0, x: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-paper/95 px-6 pb-4 pt-5 backdrop-blur md:px-8 md:pt-7">
              <div>
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15 md:hidden" aria-hidden />
                {eyebrow && <p className="eyebrow mb-2 opacity-60">{eyebrow}</p>}
                <h2 id={titleId} className="font-display text-display-sm">
                  {title}
                </h2>
              </div>
              <button
                data-close
                onClick={onClose}
                className="mt-1 grid size-10 shrink-0 place-items-center rounded-full border border-ink/15 transition-colors hover:bg-ink/5"
                aria-label="Close"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] md:px-8">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
