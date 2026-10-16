"use client";
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export type OtpState = "idle" | "verifying" | "error" | "success";

/**
 * Six-box one-time-code input. Supports typing, backspace/arrow navigation, paste and
 * SMS/password-manager autofill (autocomplete="one-time-code"). Animates invalid (shake + red)
 * and valid (staggered green pop) states.
 */
export function OtpInput({ length = 6, state, onComplete, onChange, autoFocus = true, label = "Authentication code" }: {
  length?: number;
  state: OtpState;
  onComplete: (code: string) => void;
  onChange?: () => void;
  autoFocus?: boolean;
  label?: string;
}) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const disabled = state === "verifying" || state === "success";

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  // After an error animation, clear the boxes and return focus to the first one.
  useEffect(() => {
    if (state !== "error") return;
    const t = setTimeout(() => {
      setDigits(Array(length).fill(""));
      refs.current[0]?.focus();
    }, 650);
    return () => clearTimeout(t);
  }, [state, length]);

  const update = (next: string[]) => {
    setDigits(next);
    onChange?.();
    if (next.every((d) => d !== "")) onComplete(next.join(""));
  };

  const setAt = (i: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) return;
    if (clean.length > 1) {
      // autofill or fast typing into one box
      const next = [...digits];
      clean.slice(0, length - i).split("").forEach((c, k) => (next[i + k] = c));
      update(next);
      refs.current[Math.min(length - 1, i + clean.length)]?.focus();
      return;
    }
    const next = [...digits];
    next[i] = clean;
    update(next);
    if (i < length - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[i]) next[i] = "";
      else if (i > 0) {
        next[i - 1] = "";
        refs.current[i - 1]?.focus();
      }
      setDigits(next);
      onChange?.();
    } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    e.preventDefault();
    const next = Array(length).fill("").map((_, k) => text[k] ?? "");
    update(next);
    refs.current[Math.min(text.length, length - 1)]?.focus();
  };

  return (
    <div role="group" aria-label={label} className={cn("flex justify-center gap-2 sm:gap-2.5", state === "error" && "otp-shake")} data-otp-state={state}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={i === 0 ? length : 1}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => setAt(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
          style={state === "success" ? { animationDelay: `${i * 55}ms` } : undefined}
          className={cn(
            "size-11 rounded-xl border-2 bg-white text-center font-display text-xl font-bold text-ink tabular shadow-sm transition-colors duration-200 outline-none sm:size-12",
            "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15",
            state === "idle" && (d ? "border-brand-300" : "border-line"),
            state === "verifying" && "otp-verifying border-brand-400 bg-brand-50",
            state === "error" && "border-red-500 bg-red-50 text-red-700",
            state === "success" && "otp-cell-success border-emerald-500 bg-emerald-50 text-emerald-700",
          )}
        />
      ))}
    </div>
  );
}

/** Animated success badge (ring + drawn check). */
export function OtpSuccess({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="otp-fade-up flex flex-col items-center text-center" role="status" aria-live="polite">
      <div className="otp-ring flex size-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
        <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path className="otp-check" d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <div className="mt-4 font-display text-lg font-bold text-ink">{title}</div>
      {subtitle && <div className="mt-1 text-sm text-muted">{subtitle}</div>}
    </div>
  );
}
