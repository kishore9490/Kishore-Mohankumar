"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { profile, type Project } from "@/data/profile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProjectGlyph } from "@/components/3d/ProjectGlyph";
import { Reveal } from "@/components/ui/Reveal";
import { getLenis } from "@/lib/scroll";
import { cx, pad } from "@/lib/utils";

const projects = profile.projects;
const N = projects.length;

function StatusTag({ status }: { status: string }) {
  const live = status === "Building" || status === "Live" || status === "Ongoing";
  return (
    <span className="label inline-flex items-center gap-2 border border-line-2 px-2.5 py-1.5 text-paper">
      <span className={cx("h-1.5 w-1.5 rounded-full", live ? "bg-amber" : "bg-mute")} aria-hidden="true" />
      {status}
    </span>
  );
}

function Dossier({ p, index }: { p: Project; index: number }) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="label tabular-nums text-amber">
          {pad(index + 1)} / {pad(N)}
        </span>
        <StatusTag status={p.status} />
      </div>
      <h3 className="mt-6 font-display text-[clamp(2.2rem,4vw,4.4rem)] font-semibold uppercase leading-[0.9] tracking-[-0.045em]">{p.name}</h3>
      <p className="label mt-3 text-mute">{p.kind}</p>
      <p className="mt-6 max-w-[40ch] text-lg text-paper">{p.summary}</p>
      <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
        {p.capabilities.map((c) => (
          <li key={c} className="label text-mute">
            <span className="text-amber">+</span> {c}
          </li>
        ))}
      </ul>
      <dl className="mt-8 grid gap-6 border-t border-line pt-6 xl:grid-cols-2">
        <div>
          <dt className="label text-dim">The problem</dt>
          <dd className="mt-2 text-[15px] leading-relaxed text-mute">{p.problem}</dd>
        </div>
        <div>
          <dt className="label text-dim">What I learned</dt>
          <dd className="mt-2 text-[15px] leading-relaxed text-mute">{p.learned}</dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
        <p className="label text-dim">{p.tech.join(" · ")}</p>
        {p.link?.href && (
          <a href={p.link.href} target="_blank" rel="noreferrer" className="label link-u text-amber" data-cursor="Visit">
            {p.link.label} ↗
          </a>
        )}
      </div>
    </div>
  );
}

function Orbit() {
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const pos = useSpring(0, { stiffness: 90, damping: 22, restDelta: 0.001 });
  const geom = useRef({ cx: 0, cy: 0, r: 300, ry: 90 });
  const [ring, setRing] = useState({ r: 300, ry: 90 });

  const layout = (f: number) => {
    const { cx: cxp, cy, r, ry } = geom.current;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const a = ((i - f) / N) * Math.PI * 2;
      const depth = Math.cos(a);
      const t = (depth + 1) / 2;
      const x = cxp + Math.sin(a) * r;
      const y = cy + depth * ry;
      const s = 0.55 + 0.55 * t;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${s.toFixed(3)})`;
      el.style.opacity = (0.3 + 0.7 * t * t).toFixed(3);
      el.style.zIndex = String(Math.round(t * 100));
    });
  };

  useEffect(() => {
    const measure = () => {
      const st = stageRef.current!;
      const w = st.clientWidth;
      const h = st.clientHeight;
      geom.current = { cx: w / 2, cy: h * 0.72, r: Math.min(w * 0.42, 380), ry: Math.min(w * 0.42, 380) * 0.3 };
      setRing({ r: geom.current.r, ry: geom.current.ry });
      layout(pos.get());
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stageRef.current!);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    // Dwell on each project: rotation happens in the middle half of each step.
    const f = p * (N - 1);
    const base = Math.floor(f);
    const frac = f - base;
    const t = Math.min(1, Math.max(0, (frac - 0.25) / 0.5));
    const eased = base + t * t * (3 - 2 * t);
    pos.set(eased);
    setActive(Math.min(N - 1, Math.round(eased)));
  });
  useMotionValueEvent(pos, "change", layout);

  const goTo = (i: number) => {
    const el = ref.current!;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + (i / (N - 1)) * (el.offsetHeight - window.innerHeight) + 2;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : -1) + N) % N;
    goTo(next);
    itemRefs.current[next]?.focus({ preventScroll: true });
  };

  const { r, ry } = ring;
  const p = projects[active];

  return (
    <div ref={ref} style={{ height: `${N * 48 + 60}vh` }} className="relative mt-10">
      <div className="sticky top-0 grid h-[100svh] grid-cols-12 items-center gap-6 page-x">
        {/* Stage */}
        <div ref={stageRef} className="relative col-span-7 h-[82svh]" onKeyDown={onKey}>
          {/* rings */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <ellipse cx="50%" cy="72%" rx={r} ry={ry} fill="none" stroke="rgb(236 230 220 / 0.16)" />
            <ellipse cx="50%" cy="72%" rx={r * 1.18} ry={ry * 1.18} fill="none" stroke="rgb(236 230 220 / 0.08)" strokeDasharray="2 6" />
            <ellipse cx="50%" cy="72%" rx={r * 0.32} ry={ry * 0.32} fill="none" stroke="rgb(242 165 65 / 0.4)" />
            <line x1="50%" y1="44%" x2="50%" y2="72%" stroke="url(#axis)" />
            <defs>
              <linearGradient id="axis" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#F2A541" stopOpacity="0" />
                <stop offset="1" stopColor="#F2A541" stopOpacity="0.7" />
              </linearGradient>
            </defs>
          </svg>

          {/* active preview, floating above the axis */}
          <div className="pointer-events-none absolute left-1/2 top-[2%] aspect-square h-[44%] -translate-x-1/2" aria-hidden="true">
            <AnimatePresence mode="wait">
              <motion.div
                key={p.id}
                className="h-full w-full"
                initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProjectGlyph glyph={p.glyph} className="h-full w-full" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* orbiting projects */}
          <div role="group" aria-label="Projects — use arrow keys to rotate">
            {projects.map((proj, i) => (
              <button
                key={proj.id}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                type="button"
                onClick={() => goTo(i)}
                aria-pressed={i === active}
                aria-label={`${proj.name} — ${proj.status}`}
                data-cursor={i === active ? undefined : "Open"}
                className="absolute left-0 top-0 flex flex-col items-center will-change-transform"
              >
                <span
                  className={cx(
                    "grid h-24 w-24 place-items-center border bg-ink transition-colors duration-500",
                    i === active ? "border-amber" : "border-line-2",
                  )}
                >
                  <ProjectGlyph glyph={proj.glyph} className="h-16 w-16" />
                </span>
                <span className={cx("label mt-3 whitespace-nowrap", i === active ? "text-paper" : "text-mute")}>{proj.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dossier */}
        <div className="col-span-5" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Dossier p={p} index={active} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Stack() {
  return (
    <ol className="page-x mt-14 space-y-4">
      {projects.map((p, i) => (
        <li key={p.id}>
          <Reveal className="border-t border-line pt-6">
            <ProjectGlyph glyph={p.glyph} className="h-28 w-28 border border-line" />
            <div className="mt-6">
              <Dossier p={p} index={i} />
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

export function Building() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section id="building" data-section="Building" aria-labelledby="building-title" className="relative pt-[22vh]">
      <SectionHeader
        index="03"
        label="What I build"
        title={
          <>
            Things that
            <br />
            actually run.
          </>
        }
        id="building-title"
        aside={<p>Platforms, infrastructure and experiments. Some are live, some are being built right now, all of them taught me something.</p>}
      />
      {wide ? <Orbit /> : <Stack />}
    </section>
  );
}
