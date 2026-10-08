import { Fragment } from "react";

/** Renders text with {{variables}} highlighted; unknown ones (when a known list is given) are flagged. */
export function HighlightedText({ text, known }: { text: string; known?: readonly string[] }) {
  const parts = text.split(/({{\s*\w+\s*}})/g);
  return (
    <>
      {parts.map((p, i) => {
        if (!/^{{\s*\w+\s*}}$/.test(p)) return <Fragment key={i}>{p}</Fragment>;
        const name = p.replace(/[{}\s]/g, "");
        const bad = known && !known.includes(name);
        return (
          <mark
            key={i}
            className={bad ? "rounded bg-orange-100 px-1 font-mono text-[0.88em] text-orange-900 underline decoration-wavy decoration-orange-500" : "rounded bg-cyan/15 px-1 font-mono text-[0.88em] text-cyan-ink"}
            title={bad ? "Unknown variable" : "Variable — filled in when sent"}
          >
            {p}
          </mark>
        );
      })}
    </>
  );
}
