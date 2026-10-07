"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { introVideo } from "@/data/intro";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const SLIDE_MS = 9000;

/**
 * "Watch course intro". Plays EMC's video when `introVideo.src` is configured,
 * otherwise a self-running animated explainer built from site content.
 */
export function IntroModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const slides = introVideo.slides;

  useEffect(() => {
    if (!open) return;
    setI(0);
    closeRef.current?.focus();
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((v) => Math.min(v + 1, slides.length - 1));
      if (e.key === "ArrowLeft") setI((v) => Math.max(v - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      prev?.focus();
    };
  }, [open, onClose, slides.length]);

  useEffect(() => {
    if (!open || paused || introVideo.src || i >= slides.length - 1) return;
    const t = window.setTimeout(() => setI((v) => v + 1), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [open, i, paused, slides.length]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/70 p-3 backdrop-blur-md md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="EMC course introduction"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-ink text-white"
          >
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close introduction"
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <Icon name="close" size={18} />
            </button>

            {introVideo.src ? (
              <video src={introVideo.src} poster={introVideo.poster ?? undefined} controls autoPlay playsInline className="aspect-video w-full" />
            ) : (
              <div
                className="relative flex aspect-[4/5] flex-col sm:aspect-video"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                <div className="grid-bg-dark absolute inset-0" aria-hidden="true" />
                <div className="relative flex gap-1.5 p-5 pr-16" aria-hidden="true">
                  {slides.map((_, idx) => (
                    <div key={idx} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/15">
                      <div
                        key={`${idx}-${i}`}
                        className="h-full bg-cyan"
                        style={{
                          width: idx < i ? "100%" : idx === i ? undefined : "0%",
                          animation: idx === i ? `grow ${SLIDE_MS}ms linear forwards` : undefined,
                          animationPlayState: paused ? "paused" : "running",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="relative flex flex-1 items-center px-6 pb-6 sm:px-12" aria-live="polite">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="max-w-2xl"
                    >
                      <p className="label !text-cyan">{slides[i].kicker}</p>
                      <p className="heading mt-4 text-3xl sm:text-5xl">{slides[i].title}</p>
                      <p className="mt-5 text-[16px] leading-relaxed text-white/70 sm:text-lg">{slides[i].text}</p>
                      {i === slides.length - 1 && (
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                          <ButtonLink href="/demo" variant="accent" size="lg">Book a free demo</ButtonLink>
                          <ButtonLink href="/programs" variant="outline-light" size="lg">Explore programs</ButtonLink>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="relative flex items-center justify-between border-t border-white/10 px-5 py-3">
                  <button
                    onClick={() => setI((v) => Math.max(0, v - 1))}
                    disabled={i === 0}
                    className="label !text-white/60 disabled:opacity-30"
                  >
                    ← Prev
                  </button>
                  <span className="label !text-white/40">
                    {i + 1} / {slides.length}
                  </span>
                  <button
                    onClick={() => setI((v) => Math.min(slides.length - 1, v + 1))}
                    disabled={i === slides.length - 1}
                    className="label !text-white/60 disabled:opacity-30"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </motion.div>
          <style>{`@keyframes grow{from{width:0}to{width:100%}}`}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
