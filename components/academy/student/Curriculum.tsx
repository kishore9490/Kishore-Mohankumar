import Link from "next/link";
import type { LessonType, Module, ProgressStatus } from "@/lib/platform/types";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";

export const LESSON_ICON: Record<LessonType, IconName> = {
  video: "play", text: "file", pdf: "file", slides: "layers", interactive: "sparkle", quiz: "clipboard", practice: "target", lab: "lab",
};

interface Row {
  module: Module;
  lessons: { id: string; title: string; type: LessonType; durationMin: number; status: ProgressStatus }[];
}

/** Modules → lessons with completion ticks; the current lesson is highlighted. */
export function Curriculum({ outline, courseId, currentId }: { outline: Row[]; courseId: string; currentId: string }) {
  return (
    <nav aria-label="Lessons in this course">
      <ol className="space-y-1">
        {outline.map((o) => {
          const done = o.lessons.filter((l) => l.status === "completed").length;
          const open = o.lessons.some((l) => l.id === currentId);
          return (
            <li key={o.module.id}>
              <details open={open} className="group/m rounded-xl [&[open]]:bg-white">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-white [&::-webkit-details-marker]:hidden">
                  <span className="mt-0.5 font-mono text-[10.5px] text-muted">{String(o.module.order).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold leading-snug">{o.module.title}</span>
                    <span className="mt-0.5 block font-mono text-[10.5px] text-muted">{done}/{o.lessons.length} done</span>
                  </span>
                  <Icon name="chevron" size={14} className="mt-1 shrink-0 text-muted transition-transform group-open/m:rotate-90" />
                </summary>
                <ol className="pb-2">
                  {o.lessons.map((l) => {
                    const current = l.id === currentId;
                    return (
                      <li key={l.id}>
                        <Link
                          href={`/academy/student/learn/${courseId}/${l.id}`}
                          aria-current={current ? "page" : undefined}
                          className={cn(
                            "mx-1.5 flex min-h-[40px] items-start gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                            current ? "bg-ink text-white" : "hover:bg-mist",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border",
                              l.status === "completed" ? "border-cyan bg-cyan text-ink" : current ? "border-white/40" : l.status === "in_progress" ? "border-blue" : "border-line",
                            )}
                            aria-hidden="true"
                          >
                            {l.status === "completed" ? <Icon name="check" size={11} /> : l.status === "in_progress" ? <span className={cn("h-1.5 w-1.5 rounded-full", current ? "bg-cyan" : "bg-blue")} /> : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block leading-snug">{l.title}</span>
                            <span className={cn("mt-0.5 flex items-center gap-1.5 font-mono text-[10px]", current ? "text-white/55" : "text-muted")}>
                              <Icon name={LESSON_ICON[l.type]} size={10} /> {l.type} · {l.durationMin} min
                            </span>
                          </span>
                          <span className="sr-only">{l.status === "completed" ? "(completed)" : l.status === "in_progress" ? "(in progress)" : ""}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </details>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
