"use client";

import { useState } from "react";
import { submitLead } from "@/lib/api";
import { cleanMobile, validators } from "@/lib/validation";
import { useSubmit } from "@/hooks/useSubmit";
import { TextField, ChoiceGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { LeadSuccess } from "./LeadSuccess";
import { track } from "@/lib/analytics";

export function CallbackForm({ topic, source, details, onDone }: { topic: string; source: string; details?: string; onDone?: () => void }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [time, setTime] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const { state, run } = useSubmit(submitLead);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = { name: validators.name(name), mobile: validators.mobile(mobile) };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    const receipt = await run({
      type: "callback",
      name: name.trim(),
      mobile: cleanMobile(mobile),
      topic: details ? `${topic} — ${details}` : topic,
      callbackTime: time ?? undefined,
      source,
    });
    if (receipt && topic === "finance") track("finance_request", { source });
    if (receipt && topic === "accessories") track("accessory_enquiry", { source, stage: "submitted" });
  }

  if (state.status === "success") {
    return (
      <LeadSuccess
        title="We'll call you shortly."
        body="A member of our team will call you back during showroom hours."
        reference={state.data.reference}
        rows={details ? [["About", details]] : []}
        onDone={onDone}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 pt-2">
      {details && (
        <div className="rounded-2xl border border-ink/10 bg-ink/[0.03] p-4 text-sm leading-relaxed">
          <p className="eyebrow mb-1.5 opacity-55">You&apos;re asking about</p>
          <p className="font-medium">{details}</p>
        </div>
      )}
      <TextField label="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
      <TextField
        label="Mobile number"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        prefix="+91"
        maxLength={14}
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        error={errors.mobile}
      />
      <ChoiceGroup
        legend="Best time to call (optional)"
        name="cb-time"
        options={[
          { value: "morning", label: "Morning" },
          { value: "afternoon", label: "Afternoon" },
          { value: "evening", label: "Evening" },
        ]}
        value={time}
        onChange={(v) => setTime(time === v ? null : v)}
      />
      {state.status === "error" && <Notice tone="error" title="Not sent yet">{state.message}</Notice>}
      <Button type="submit" size="lg" loading={state.status === "submitting"} icon="arrow-right" className="w-full">
        {state.status === "submitting" ? "Sending" : "Request callback"}
      </Button>
    </form>
  );
}
