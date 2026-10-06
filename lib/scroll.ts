"use client";

import type Lenis from "lenis";

let lenis: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  lenis = l;
};

export const getLenis = () => lenis;

/** Scroll to an element id or a pixel offset, smoothly when allowed. */
export function scrollToTarget(target: string | number, opts: { immediate?: boolean } = {}) {
  const el = typeof target === "string" ? document.getElementById(target.replace(/^#/, "")) : null;
  if (lenis) {
    lenis.scrollTo(el ?? (target as number), { offset: 0, duration: 1.4, immediate: opts.immediate });
  } else {
    const top = el ? el.getBoundingClientRect().top + window.scrollY : (target as number);
    window.scrollTo({ top, behavior: opts.immediate ? "auto" : "smooth" });
  }
  if (el) {
    // Move keyboard focus with the scroll for screen-reader and keyboard users.
    const focusable = el.querySelector<HTMLElement>("h2, h1") ?? el;
    if (!focusable.hasAttribute("tabindex")) focusable.setAttribute("tabindex", "-1");
    focusable.focus({ preventScroll: true });
  }
}
