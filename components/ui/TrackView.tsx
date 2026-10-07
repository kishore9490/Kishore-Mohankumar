"use client";
import { useEffect } from "react";
import { track, type TrackEvent } from "@/lib/analytics";

export function TrackView({ event, props }: { event: TrackEvent; props?: Record<string, string> }) {
  const key = JSON.stringify(props);
  useEffect(() => {
    track(event, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, key]);
  return null;
}
