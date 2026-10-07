"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/lib/analytics";
import { whatsappEnabled, whatsappIntents, whatsappLink } from "@/lib/whatsapp";

/**
 * Contextual WhatsApp launcher (tablet / desktop). If no number is configured,
 * each option routes to the matching on-site form instead — WhatsApp is never the only path.
 */
const fallback: Record<string, string> = {
  courses: "/programs",
  counsellor: "/counselling",
  demo: "/demo",
  eligibility: "/counselling?topic=eligibility",
  info: "/contact",
};

export function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const enabled = whatsappEnabled();

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
    <div ref={ref} className="fixed bottom-6 right-6 z-40 hidden md:block">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-[300px] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_80px_-30px_rgba(7,26,51,.45)]"
            role="dialog"
            aria-label="Chat with EMC"
          >
            <div className="bg-ink px-5 py-4 text-white">
              <p className="label text-white/55">{enabled ? "WhatsApp" : "Quick help"}</p>
              <p className="mt-1 text-[15px] font-medium">How can we help you today?</p>
            </div>
            <ul className="p-2">
              {whatsappIntents.map(({ intent, label }) => {
                const href = whatsappLink(intent);
                const cls =
                  "flex items-center justify-between rounded-xl px-3 py-3 text-[14px] text-ink hover:bg-mist transition-colors";
                return (
                  <li key={intent}>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cls}
                        onClick={() => track("whatsapp_click", { intent, placement: "widget" })}
                      >
                        {label} <Icon name="arrow" size={15} className="text-muted" />
                      </a>
                    ) : (
                      <Link href={fallback[intent]} className={cls} onClick={() => setOpen(false)}>
                        {label} <Icon name="arrow" size={15} className="text-muted" />
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close help menu" : enabled ? "Chat with EMC on WhatsApp" : "Get help"}
        className="flex h-13 w-13 items-center justify-center rounded-full bg-ink text-white shadow-[0_16px_40px_-14px_rgba(7,26,51,.7)] transition-transform hover:scale-105"
      >
        <Icon name={open ? "close" : enabled ? "whatsapp" : "spark"} size={22} />
      </button>
    </div>
  );
}
