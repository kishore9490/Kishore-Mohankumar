"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import { useCapabilities } from "@/hooks/useCapabilities";
import { easeOut, type EngineState } from "@/components/3d/heroEngine";
import { StatusTicker } from "@/components/ui/StatusTicker";
import { Magnetic } from "@/components/ui/Magnetic";
import { scrollToTarget } from "@/lib/scroll";
import { store, useStore } from "@/lib/store";
import { clamp, lerp } from "@/lib/utils";

const HeroCanvas = dynamic(() => import("@/components/3d/HeroCanvas"), { ssr: false });

const CUTOUT = "/media/portrait-cutout.webp";
const CUTOUT_SM = "/media/portrait-cutout-720.webp";

export function Hero() {
  const caps = useCapabilities();
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const renderRef = useRef<((s: EngineState) => void) | null>(null);
  const revealStart = useRef<number | null>(null);
  const build = useStore((s) => s.buildMode);
  const buildRef = useRef(0);
  buildRef.current = build ? 1 : 0;

  const register = useCallback((fn: ((s: EngineState) => void) | null) => {
    renderRef.current = fn;
  }, []);
  const onReady = useCallback(() => {
    if (revealStart.current === null) revealStart.current = performance.now();
  }, []);

  useEffect(() => {
    if (!caps.ready) return;
    const section = sectionRef.current!;
    const frameEl = frameRef.current!;
    const animated = caps.tier !== "static";
    // A url() inside a custom property can resolve against the stylesheet that uses it;
    // an absolute URL keeps the silhouette mask working under any base path.
    section.style.setProperty("--cutout", `url("${new URL(CUTOUT, document.baseURI).href}")`);
    const interactive = caps.finePointer && animated;

    const s: EngineState = {
      width: section.clientWidth,
      height: section.clientHeight,
      dpr: Math.min(window.devicePixelRatio || 1, caps.tier === "high" ? 1.5 : 1),
      frame: { x: 0, y: 0, w: 1, h: 1 },
      mouse: [0, 0],
      cursor: [-9999, -9999],
      cursorActive: 0,
      time: 0,
      reveal: animated ? 0 : 1,
      scroll: 0,
      build: 0,
    };
    const target = { mx: 0, my: 0, cx: -9999, cy: -9999, active: 0 };

    const measure = () => {
      const r = section.getBoundingClientRect();
      const f = frameEl.getBoundingClientRect();
      s.width = section.clientWidth;
      s.height = section.clientHeight;
      s.frame = { x: f.left - r.left, y: f.top - r.top, w: f.width, h: f.height };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);

    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      target.mx = ((e.clientX - r.left) / r.width) * 2 - 1;
      target.my = ((e.clientY - r.top) / r.height) * 2 - 1;
      target.cx = e.clientX - r.left;
      target.cy = e.clientY - r.top;
      target.active = 1;
    };
    const onLeave = () => (target.active = 0);
    if (interactive) {
      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);
    }

    // Fallback: begin the reveal even if the texture is slow.
    const fallback = window.setTimeout(onReady, 1400);

    let raf = 0;
    let running = false;
    let last = performance.now();
    let frame = 0;
    const lastVars: Record<string, string> = {};
    const setVar = (k: string, v: string) => {
      if (lastVars[k] === v) return;
      lastVars[k] = v;
      section.style.setProperty(k, v);
    };
    const tick = (now: number) => {
      // Low tier: 30 fps is plenty for drifting dust.
      if (caps.tier === "low" && running && frame++ % 2 === 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      s.time += dt;

      if (!interactive && animated) {
        // Touch devices: a slow drift keeps the scene alive.
        target.mx = Math.sin(s.time * 0.31) * 0.35;
        target.my = Math.cos(s.time * 0.23) * 0.2;
      }
      const k = 1 - Math.pow(0.001, dt); // frame-rate independent smoothing
      s.mouse[0] = lerp(s.mouse[0], target.mx, k * 0.9);
      s.mouse[1] = lerp(s.mouse[1], target.my, k * 0.9);
      if (s.cursor[0] < -999) s.cursor = [target.cx, target.cy];
      s.cursor[0] = lerp(s.cursor[0], target.cx, k * 2.4 > 1 ? 1 : k * 2.4);
      s.cursor[1] = lerp(s.cursor[1], target.cy, k * 2.4 > 1 ? 1 : k * 2.4);
      s.cursorActive = lerp(s.cursorActive, target.active, k * 0.8);
      s.build = lerp(s.build, buildRef.current, k);

      const r = section.getBoundingClientRect();
      s.scroll = clamp(-r.top / r.height);
      if (revealStart.current !== null && animated) s.reveal = easeOut((now - revealStart.current) / 2600);

      // DOM parallax only for real pointers; touch devices keep the DOM still.
      if (interactive) {
        setVar("--mx", s.mouse[0].toFixed(3));
        setVar("--my", s.mouse[1].toFixed(3));
        setVar("--lx", `${(((s.cursor[0] - s.frame.x) / s.frame.w) * 100).toFixed(1)}%`);
        setVar("--ly", `${(((s.cursor[1] - s.frame.y) / s.frame.h) * 100).toFixed(1)}%`);
        setVar("--la", s.cursorActive.toFixed(2));
      }
      setVar("--sp", s.scroll.toFixed(3));

      renderRef.current?.(s);
      if (running) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || !animated) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Pause when off-screen or hidden.
    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop()));
    io.observe(section);
    const onVis = () => (document.hidden ? stop() : section.getBoundingClientRect().bottom > 0 && start());
    document.addEventListener("visibilitychange", onVis);

    // Static tier: draw once the texture arrives, then stay still.
    let staticTimer = 0;
    if (!animated) {
      const draw = () => tick(performance.now());
      draw();
      staticTimer = window.setInterval(draw, 400);
      window.setTimeout(() => clearInterval(staticTimer), 3000);
    }

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      clearTimeout(fallback);
      clearInterval(staticTimer);
      document.removeEventListener("visibilitychange", onVis);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, [caps.ready, caps.tier, caps.finePointer, onReady]);

  useEffect(() => {
    const t = window.setTimeout(() => store.set({ introDone: true }), 2400);
    return () => clearTimeout(t);
  }, []);

  const { first, last } = profile.name;

  return (
    <section
      ref={sectionRef}
      id="top"
      data-section="Hero"
      aria-label="Introduction"
      className="hero relative isolate min-h-[100svh] overflow-hidden lg:h-[100svh] lg:min-h-[680px]"
      style={{ ["--cutout" as string]: `url(${CUTOUT})` }}
    >
      {/* Poster: the plate as a plain image — visible without JS / WebGL */}
      <div className="hero-frame pointer-events-none z-0" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/portrait-plate.webp" alt="" className="hero-plate-poster" decoding="async" />
      </div>

      {caps.ready && <HeroCanvas tier={caps.tier} register={register} onReady={onReady} />}

      {/* Subject */}
      <div ref={frameRef} className="hero-frame z-[3]" style={{ perspective: "1200px" }}>
        <div className="hero-subject absolute inset-0">
          <div className="hero-subject-inner absolute inset-0">
            <picture>
              <source media="(max-width: 767px)" srcSet={CUTOUT_SM} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CUTOUT}
                alt="Kishore Mohankumar in a bronze suit, leaning against a stone wall in a softly lit corridor"
                width={1086}
                height={1448}
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full select-none"
                draggable={false}
              />
            </picture>
            <div className="hero-rim" aria-hidden="true" />
            <div className="hero-light" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Mobile legibility: darken the bottom of the portrait */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[34svh] z-[4] bg-[linear-gradient(to_bottom,transparent,rgb(10_10_11/0.8)_45%,#0a0a0b_80%)] md:top-[42svh] lg:hidden"
      />

      {/* Desktop: dissolve the bottom of the scene into the page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] hidden h-[22svh] bg-gradient-to-b from-transparent to-ink lg:block"
      />

      {/* UI — on desktop this container creates no stacking context, so the name
          (z-2) falls behind the subject (z-3) while the copy (z-10) stays in front. */}
      <div className="relative z-[10] flex min-h-[100svh] flex-col page-x pb-8 pt-24 lg:pointer-events-none lg:absolute lg:inset-0 lg:z-auto lg:min-h-0 lg:pb-10">
        <div className="fade-up relative z-[10] flex items-center gap-3 text-mute" style={{ animationDelay: "1.6s" }}>
          <span className="label">00</span>
          <span className="hairline w-10" />
          <span className="label">Introduction</span>
        </div>

        {/* Mobile spacer — the portrait lives here */}
        <div className="h-[calc(50svh-6rem-18px)] shrink-0 lg:hidden" aria-hidden="true" />

        <div className="hero-name relative z-[2] lg:mt-auto">
          <h1 className="display text-[13.6vw] text-paper md:text-[11vw] lg:text-[clamp(64px,min(7.9vw,15svh),176px)]">
            <span className="sr-only">
              {first} {last} — {profile.roles.join(", ")}
            </span>
            <span aria-hidden="true" className="mask-line">
              <span style={{ animationDelay: "0.28s" }}>{first}</span>
            </span>
            <span aria-hidden="true" className="mask-line">
              <span style={{ animationDelay: "0.38s" }}>{last}</span>
            </span>
          </h1>
        </div>

        <div className="relative z-[10] mt-7 lg:mt-9 lg:grid lg:grid-cols-12 lg:items-end lg:gap-6">
          <div className="lg:col-span-5">
            <p className="fade-up label text-mute" style={{ animationDelay: "1.5s" }}>
              {profile.roles.map((r, i) => (
                <span key={r} className="inline-block whitespace-nowrap">
                  {r}
                  {i < profile.roles.length - 1 && (
                    <span className="mx-3 text-amber" aria-hidden="true">
                      ·
                    </span>
                  )}
                </span>
              ))}
            </p>
            <p
              className="fade-up mt-5 font-display text-[clamp(1.75rem,3.1vw,3.2rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-paper"
              style={{ animationDelay: "1.7s" }}
            >
              {profile.hero.statement}
            </p>
            <p className="fade-up mt-4 max-w-[30rem] text-[15px] leading-relaxed text-mute md:text-base" style={{ animationDelay: "1.85s" }}>
              {profile.hero.sub}
            </p>
          </div>
        </div>

        <div className="relative z-[10] mt-8 flex flex-col gap-6 border-t border-line pt-5 lg:mt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="fade-up" style={{ animationDelay: "2s" }}>
            <StatusTicker items={profile.hero.status} />
          </div>
          <div className="fade-up flex flex-wrap items-center gap-3 lg:pointer-events-auto" style={{ animationDelay: "2.1s" }}>
            <Magnetic>
              <button type="button" className="btn btn-solid" onClick={() => scrollToTarget("contact")} data-cursor="Talk">
                Start a conversation <span aria-hidden="true">→</span>
              </button>
            </Magnetic>
            <Magnetic>
              <button type="button" className="btn" onClick={() => scrollToTarget("building")} data-cursor="View">
                View my work <span aria-hidden="true">↓</span>
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
