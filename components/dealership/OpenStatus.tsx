"use client";

import { useSyncExternalStore } from "react";
import type { OpeningHours } from "@/lib/types";
import { cn } from "@/lib/format";
import { getHoursStatus } from "./hours";

/* A shared minute ticker. The server snapshot is null, so the status only
   appears after hydration — no server/client clock mismatch. */
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) timer = setInterval(() => listeners.forEach((l) => l()), 30_000);
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}
const getMinute = () => Math.floor(Date.now() / 60_000);
const getServerMinute = () => null;

/** Live "Open now · Closes at 8 PM" pill, computed in IST on the client. */
export function OpenStatus({ hours, className, compact }: { hours: OpeningHours[]; className?: string; compact?: boolean }) {
  const minute = useSyncExternalStore(subscribe, getMinute, getServerMinute);

  if (minute === null) {
    return <span className={cn("inline-block h-6 w-36 rounded-full bg-current/[0.06]", className)} aria-hidden />;
  }
  const s = getHoursStatus(hours, new Date(minute * 60_000));
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <span className="relative flex size-2">
        {s.open && !s.closingSoon && <span className="absolute inset-0 animate-ping rounded-full bg-go opacity-60" />}
        <span className={cn("relative size-2 rounded-full", s.open ? (s.closingSoon ? "bg-amber" : "bg-go") : "bg-current opacity-40")} />
      </span>
      <span className="font-medium">{s.headline}</span>
      {!compact && <span className="opacity-60">· {s.detail}</span>}
    </span>
  );
}
