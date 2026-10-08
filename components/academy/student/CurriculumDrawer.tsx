"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

/** Curriculum as a bottom sheet / side drawer on smaller screens (native <dialog> for focus + Escape). */
export function CurriculumDrawer({ children, summary }: { children: ReactNode; summary: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    ref.current?.close();
  }, [pathname]);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-2.5 text-left text-[14px] font-medium transition-colors hover:border-ink/30"
        aria-haspopup="dialog"
      >
        <span className="flex items-center gap-2.5"><Icon name="layers" size={16} className="text-blue" /> Course curriculum</span>
        <span className="font-mono text-[11.5px] text-muted">{summary}</span>
      </button>
      <dialog
        ref={ref}
        aria-label="Course curriculum"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
        className="m-0 mt-auto max-h-[85dvh] w-full max-w-none overflow-hidden rounded-t-[22px] bg-mist p-0 backdrop:bg-ink/50 sm:ml-0 sm:mt-0 sm:h-dvh sm:max-h-none sm:w-[380px] sm:rounded-none sm:rounded-r-[22px]"
      >
        <div className="flex max-h-[85dvh] flex-col sm:h-full sm:max-h-none">
          <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
            <p className="text-[15px] font-semibold">Course curriculum</p>
            <button type="button" onClick={() => ref.current?.close()} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-mist" aria-label="Close curriculum">
              <Icon name="close" size={18} />
            </button>
          </div>
          <div className="overflow-y-auto p-3">{children}</div>
        </div>
      </dialog>
    </>
  );
}
