import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/** Chapter marker + giant heading. Every section opens the same way. */
export function SectionHeader({
  index,
  label,
  title,
  aside,
  id,
}: {
  index: string;
  label: string;
  title: ReactNode;
  aside?: ReactNode;
  id?: string;
}) {
  return (
    <header className="page-x">
      <Reveal className="flex items-center gap-3 text-mute">
        <span className="label">{index}</span>
        <span className="hairline w-10" aria-hidden="true" />
        <span className="label">{label}</span>
      </Reveal>
      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end">
        <h2 id={id} className="h-section lg:col-span-9">
          <Reveal as="span" lines>
            {title}
          </Reveal>
        </h2>
        {aside && (
          <Reveal className="text-mute lg:col-span-3 lg:pb-3" delay={0.15}>
            {aside}
          </Reveal>
        )}
      </div>
    </header>
  );
}
