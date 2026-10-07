"use client";

import { track, type AnalyticsEvent } from "@/lib/analytics";
import type { ComponentProps } from "react";

/** Plain anchor that reports a click event (tel:, wa.me, maps …). */
export function TrackedLink({
  event,
  source,
  ...rest
}: { event: AnalyticsEvent; source: string } & ComponentProps<"a">) {
  const external = rest.href?.startsWith("http");
  return (
    <a
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
      onClick={(e) => {
        track(event, { source });
        rest.onClick?.(e);
      }}
    />
  );
}
