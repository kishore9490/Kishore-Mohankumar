"use client";

import { SuccessMark, SummaryList } from "@/components/ui/SuccessMark";
import { ButtonLink, Button } from "@/components/ui/Button";
import { dealership } from "@/data/dealership";
import { formatPhone } from "@/lib/format";
import { track } from "@/lib/analytics";
import type { ReactNode } from "react";

export function LeadSuccess({
  title,
  body,
  reference,
  rows = [],
  onDone,
  children,
  phone = dealership.phone.sales,
}: {
  title: string;
  body: string;
  reference: string;
  rows?: [string, ReactNode][];
  onDone?: () => void;
  children?: ReactNode;
  phone?: string;
}) {
  return (
    <div className="flex flex-col gap-6 pt-2" aria-live="polite">
      <SuccessMark />
      <div>
        <h3 className="font-display text-display-sm">{title}</h3>
        <p className="mt-3 text-[15px] leading-relaxed opacity-70">{body}</p>
      </div>
      <SummaryList rows={[...rows, ["Reference", <span key="r" className="font-mono tracking-wider">{reference}</span>]]} />
      {children}
      <div className="flex flex-wrap gap-3">
        <ButtonLink href={`tel:${phone}`} variant="outline" iconLeft="phone" onClick={() => track("phone_click", { source: "lead_success" })}>
          {formatPhone(phone)}
        </ButtonLink>
        {onDone && (
          <Button variant="dark" onClick={onDone}>
            Done
          </Button>
        )}
      </div>
    </div>
  );
}
