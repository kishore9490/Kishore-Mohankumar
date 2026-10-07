"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { OnRoadPriceForm } from "./OnRoadPriceForm";
import { CallbackForm } from "./CallbackForm";
import { track } from "@/lib/analytics";

type Panel =
  | { kind: "onroad"; bikeSlug?: string; source: string }
  | { kind: "callback"; topic: string; source: string; title?: string; details?: string }
  | null;

interface LeadContextValue {
  openOnRoadPrice: (opts?: { bikeSlug?: string; source?: string }) => void;
  openCallback: (opts: { topic: string; source?: string; title?: string; details?: string }) => void;
  close: () => void;
}

const LeadContext = createContext<LeadContextValue | null>(null);

export function useLeads() {
  const ctx = useContext(LeadContext);
  if (!ctx) throw new Error("useLeads must be used inside <LeadProvider>");
  return ctx;
}

/**
 * Hosts the global, non-intrusive enquiry sheets so any CTA on any page can
 * open them with context (bike, source) — without navigating away.
 */
export function LeadProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<Panel>(null);
  const close = useCallback(() => setPanel(null), []);

  const value = useMemo<LeadContextValue>(
    () => ({
      openOnRoadPrice: ({ bikeSlug, source = "unknown" } = {}) => {
        track("onroad_price_request", { stage: "opened", bike: bikeSlug, source });
        setPanel({ kind: "onroad", bikeSlug, source });
      },
      openCallback: ({ topic, source = "unknown", title, details }) => setPanel({ kind: "callback", topic, source, title, details }),
      close,
    }),
    [close],
  );

  return (
    <LeadContext.Provider value={value}>
      {children}
      <Sheet open={panel?.kind === "onroad"} onClose={close} eyebrow="No obligation · Reply within working hours" title="Get on-road price">
        {panel?.kind === "onroad" && <OnRoadPriceForm initialBike={panel.bikeSlug} source={panel.source} onDone={close} />}
      </Sheet>
      <Sheet
        open={panel?.kind === "callback"}
        onClose={close}
        eyebrow="We'll call you back"
        title={panel?.kind === "callback" ? (panel.title ?? "Request a callback") : "Request a callback"}
      >
        {panel?.kind === "callback" && (
          <CallbackForm topic={panel.topic} source={panel.source} details={panel.details} onDone={close} />
        )}
      </Sheet>
    </LeadContext.Provider>
  );
}
