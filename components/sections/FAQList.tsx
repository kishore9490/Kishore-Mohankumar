"use client";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import type { FAQ } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

export function FAQList({ items }: { items: FAQ[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((f) => {
        const on = open === f.id;
        return (
          <li key={f.id}>
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`faq-${f.id}`}
                id={`faq-q-${f.id}`}
                onClick={() => setOpen(on ? null : f.id)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left text-[17px] font-medium tracking-tight md:py-6 md:text-[19px]"
              >
                {f.question}
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line transition-transform duration-300", on && "rotate-45 border-ink bg-ink text-white")}>
                  <Icon name="plus" size={15} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  id={`faq-${f.id}`}
                  role="region"
                  aria-labelledby={`faq-q-${f.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="max-w-3xl pb-6 text-[15.5px] leading-relaxed text-muted">
                    {f.answer ?? (
                      <>
                        We’ll confirm this for your specific program during a free counselling session.{" "}
                        <Link href="/counselling" className="font-medium text-blue underline-offset-2 hover:underline">
                          Ask a counsellor →
                        </Link>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
