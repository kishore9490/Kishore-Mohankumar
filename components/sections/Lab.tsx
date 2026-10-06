"use client";

import { useEffect, useRef, useState } from "react";
import { profile, type Idea } from "@/data/profile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Wireframe } from "@/components/3d/Wireframe";
import { getLenis } from "@/lib/scroll";
import { cx, pad } from "@/lib/utils";

const ideas = profile.lab;

function Corner({ className }: { className: string }) {
  return <span aria-hidden="true" className={cx("absolute h-2.5 w-2.5 border-amber/70", className)} />;
}

function Specimen({ idea, index, onOpen }: { idea: Idea; index: number; onOpen: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      data-cursor="Inspect"
      aria-haspopup="dialog"
      className="group relative flex h-full w-full flex-col p-6 text-left transition-colors duration-500 hover:bg-ink-2 md:p-8"
    >
      <Corner className="left-0 top-0 border-l border-t opacity-0 transition-opacity group-hover:opacity-100" />
      <Corner className="right-0 top-0 border-r border-t opacity-0 transition-opacity group-hover:opacity-100" />
      <Corner className="bottom-0 left-0 border-b border-l opacity-0 transition-opacity group-hover:opacity-100" />
      <Corner className="bottom-0 right-0 border-b border-r opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <span className="label text-dim">Specimen {pad(index + 1)}</span>
        <span className="label text-mute">{idea.status}</span>
      </div>
      <div className="my-8 grid place-items-center">
        <Wireframe shape={idea.shape} active={hover} size={150} />
      </div>
      <h3 className="mt-auto font-display text-2xl font-semibold uppercase tracking-[-0.035em] md:text-3xl">{idea.name}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-mute">{idea.idea}</p>
      <span className="label mt-5 text-amber opacity-70 transition-opacity group-hover:opacity-100">Open file →</span>
    </button>
  );
}

function Dossier({ idea, index, onClose, onStep }: { idea: Idea; index: number; onClose: () => void; onStep: (d: number) => void }) {
  const rows: [string, string][] = [
    ["Idea", idea.idea],
    ["Problem", idea.problem],
    ["Proposed solution", idea.solution],
    ["Business model", idea.model],
    ["Technology", idea.tech.join(" · ")],
    ["Next step", idea.next],
  ];
  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="flex flex-col justify-between border-b border-line pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-8">
        <div>
          <p className="label text-dim">Lab file {pad(index + 1)} / {pad(ideas.length)}</p>
          <h2 id="lab-dialog-title" className="mt-4 font-display text-[clamp(2.2rem,4.5vw,4rem)] font-semibold uppercase leading-[0.9] tracking-[-0.045em]">
            {idea.name}
          </h2>
          <p className="label mt-4 inline-flex items-center gap-2 border border-line-2 px-2.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber" aria-hidden="true" /> {idea.status}
          </p>
        </div>
        <div className="my-6 grid place-items-center">
          <Wireframe shape={idea.shape} active size={220} />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => onStep(-1)} className="btn h-11 px-4" aria-label="Previous idea">
            ←
          </button>
          <button type="button" onClick={() => onStep(1)} className="btn h-11 px-4" aria-label="Next idea">
            →
          </button>
          <button type="button" onClick={onClose} className="btn ml-auto h-11 px-4">
            Close
          </button>
        </div>
      </div>
      <dl className="divide-y divide-line">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
            <dt className="label pt-1 text-dim">{k}</dt>
            <dd className="text-[16px] leading-relaxed text-paper">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Lab() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<number | null>(null);

  useEffect(() => {
    const d = dialogRef.current!;
    if (current !== null && !d.open) {
      d.showModal();
      getLenis()?.stop();
    }
    if (current === null && d.open) d.close();
  }, [current]);

  useEffect(() => {
    const d = dialogRef.current!;
    const onClose = () => {
      setCurrent(null);
      getLenis()?.start();
    };
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  return (
    <section id="lab" data-section="Lab" aria-labelledby="lab-title" className="relative pt-[22vh]">
      <SectionHeader
        index="07"
        label="Product lab"
        title={
          <>
            Ideas I refuse
            <br />
            to leave alone.
          </>
        }
        id="lab-title"
        aside={<p>Concepts and experiments in various states of becoming real. Open any file to see the thinking.</p>}
      />

      <div className="page-x mt-14">
        <ul className="grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea, i) => (
            <li key={idea.id} className="border-b border-r border-line">
              <Reveal delay={(i % 3) * 0.08} className="h-full">
                <Specimen idea={idea} index={i} onOpen={() => setCurrent(i)} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="lab-dialog-title"
        className="m-auto max-h-[92svh] w-[min(1080px,calc(100vw-24px))] overflow-y-auto border border-line-2 bg-ink p-6 text-paper backdrop:bg-ink/80 backdrop:backdrop-blur-sm md:p-10"
        onClick={(e) => e.target === dialogRef.current && setCurrent(null)}
        data-lenis-prevent
      >
        {current !== null && (
          <Dossier
            idea={ideas[current]}
            index={current}
            onClose={() => setCurrent(null)}
            onStep={(d) => setCurrent((c) => ((c ?? 0) + d + ideas.length) % ideas.length)}
          />
        )}
      </dialog>
    </section>
  );
}
