"use client";

import { useState } from "react";
import { submitLead } from "@/lib/api";
import { cleanMobile, validators } from "@/lib/validation";
import { useSubmit } from "@/hooks/useSubmit";
import { ChoiceGroup, TextArea, TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { LeadSuccess } from "@/components/leads/LeadSuccess";
import { dealership } from "@/data/dealership";

type Topic = "buying" | "service" | "accessories" | "finance" | "other";
const TOPICS: { value: Topic; label: string }[] = [
  { value: "buying", label: "Buying a Honda" },
  { value: "service", label: "Service" },
  { value: "accessories", label: "Accessories" },
  { value: "finance", label: "Finance" },
  { value: "other", label: "Something else" },
];

/** Short inline contact form — sends a "general" callback lead. */
export function ContactForm({ source = "contact" }: { source?: string }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [topic, setTopic] = useState<Topic>("buying");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const { state, run, reset } = useSubmit(submitLead);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = { name: validators.name(name), mobile: validators.mobile(mobile) };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    const label = TOPICS.find((t) => t.value === topic)?.label ?? topic;
    await run({
      type: "callback",
      name: name.trim(),
      mobile: cleanMobile(mobile),
      topic: `general — ${label}${message.trim() ? `: ${message.trim()}` : ""}`,
      source,
    });
  }

  if (state.status === "success") {
    return (
      <LeadSuccess
        title="Thank you — we'll be in touch."
        body={`Someone from ${dealership.shortName} will call you back within showroom hours.`}
        reference={state.data.reference}
        rows={[["Topic", TOPICS.find((t) => t.value === topic)?.label ?? ""]]}
        onDone={() => {
          reset();
          setName("");
          setMobile("");
          setMessage("");
        }}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <ChoiceGroup legend="What's it about?" name="contact-topic" options={TOPICS} value={topic} onChange={setTopic} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <TextField
          label="Mobile number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          prefix="+91"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          error={errors.mobile}
        />
      </div>
      <TextArea label="Anything we should know?" optional value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
      {state.status === "error" && <Notice tone="error" title="We couldn't send that">{state.message}</Notice>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" icon="arrow-right" loading={state.status === "submitting"}>
          Request a callback
        </Button>
        <p className="text-xs leading-relaxed opacity-55">We only use your number to reply to this request.</p>
      </div>
    </form>
  );
}
