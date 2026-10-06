"use client";

import { useEffect, useRef } from "react";

/**
 * A cursor that announces intent. Elements opt in with data-cursor="Label".
 * Fine pointers only, disabled for reduced motion.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    document.documentElement.setAttribute("data-cursor", "");

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let scale = 1;
    let targetScale = 1;
    let raf = 0;
    let visible = false;

    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = pos.x;
        ringPos.y = pos.y;
        dot.current!.style.opacity = "1";
        ring.current!.style.opacity = "1";
      }
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, [role=button], input, textarea, select");
      const text = t?.dataset.cursor ?? "";
      if (label.current && label.current.textContent !== text) label.current.textContent = text;
      targetScale = text ? 3.4 : t ? 1.8 : 1;
      ring.current!.dataset.state = text ? "label" : t ? "hover" : "";
    };
    const leave = () => {
      visible = false;
      dot.current!.style.opacity = "0";
      ring.current!.style.opacity = "0";
    };
    const down = () => (targetScale *= 0.8);
    const up = () => (targetScale /= 0.8);

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      scale += (targetScale - scale) * 0.18;
      dot.current!.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      ring.current!.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      (ring.current!.firstChild as HTMLElement).style.transform = `translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.removeAttribute("data-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] hidden [@media(pointer:fine)]:block">
      <div ref={ring} className="cursor-ring absolute left-0 top-0 opacity-0 transition-opacity duration-300">
        <div className="cursor-circle absolute left-0 top-0 h-6 w-6 rounded-full border border-paper/40 transition-[background,border-color] duration-300" />
        <span
          ref={label}
          className="cursor-label label absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] text-ink opacity-0 transition-opacity duration-300"
        />
      </div>
      <div ref={dot} className="absolute left-0 top-0 opacity-0">
        <div className="h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber" />
      </div>
    </div>
  );
}
