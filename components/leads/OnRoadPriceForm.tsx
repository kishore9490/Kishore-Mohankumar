"use client";

import { useState } from "react";
import { bikes, getBike } from "@/data/bikes";
import { dealership } from "@/data/dealership";
import { submitLead } from "@/lib/api";
import { track } from "@/lib/analytics";
import { cleanMobile, validators } from "@/lib/validation";
import { useSubmit } from "@/hooks/useSubmit";
import { SelectField, TextField, ChoiceGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { LeadSuccess } from "./LeadSuccess";

const callbackTimes = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
] as const;

export function OnRoadPriceForm({ initialBike, source, onDone }: { initialBike?: string; source: string; onDone?: () => void }) {
  const [form, setForm] = useState({ name: "", mobile: "", bike: initialBike ?? "", city: dealership.address.city, time: "" });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const { state, run } = useSubmit(submitLead);

  const set = (k: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: null }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = {
      name: validators.name(form.name),
      mobile: validators.mobile(form.mobile),
      bike: form.bike ? null : "Choose the model you're interested in.",
      city: form.city.trim() ? null : "Tell us your city so we can include the right taxes.",
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    const receipt = await run({
      type: "onroad_price",
      name: form.name.trim(),
      mobile: cleanMobile(form.mobile),
      bikeSlug: form.bike,
      city: form.city.trim(),
      callbackTime: form.time || undefined,
      source,
    });
    if (receipt) track("onroad_price_request", { stage: "submitted", bike: form.bike, source });
  }

  if (state.status === "success") {
    const bike = getBike(form.bike);
    return (
      <LeadSuccess
        title="Your price is on its way."
        body={`Our sales team will share the complete on-road price for ${bike ? `the Honda ${bike.name}` : "your Honda"} in ${form.city} — including registration, insurance and any current schemes.`}
        reference={state.data.reference}
        rows={[
          ["Model", bike?.name ?? "—"],
          ["City", form.city],
          ["Callback", form.time ? callbackTimes.find((t) => t.value === form.time)?.label : "Any time"],
        ]}
        onDone={onDone}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 pt-2">
      <p className="text-[15px] leading-relaxed opacity-70">
        Ex-showroom is only part of the story. We&apos;ll send the exact on-road price — registration, insurance and accessories included.
      </p>
      <SelectField label="Motorcycle" value={form.bike} onChange={(e) => set("bike")(e.target.value)} error={errors.bike}>
        <option value="">Choose a model</option>
        {bikes.map((b) => (
          <option key={b.slug} value={b.slug}>
            Honda {b.name}
          </option>
        ))}
      </SelectField>
      <TextField label="Your name" autoComplete="name" value={form.name} onChange={(e) => set("name")(e.target.value)} error={errors.name} />
      <TextField
        label="Mobile number"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        prefix="+91"
        maxLength={14}
        value={form.mobile}
        onChange={(e) => set("mobile")(e.target.value)}
        error={errors.mobile}
      />
      <TextField label="City" autoComplete="address-level2" value={form.city} onChange={(e) => set("city")(e.target.value)} error={errors.city} />
      <ChoiceGroup
        legend="Best time to call (optional)"
        name="onroad-time"
        options={callbackTimes.map((t) => ({ value: t.value, label: t.label }))}
        value={form.time || null}
        onChange={(v) => set("time")(form.time === v ? "" : v)}
      />
      {state.status === "error" && <Notice tone="error" title="Not sent yet">{state.message}</Notice>}
      <Button type="submit" size="lg" loading={state.status === "submitting"} icon="arrow-right" className="w-full">
        {state.status === "submitting" ? "Sending" : "Get my on-road price"}
      </Button>
      <p className="text-xs leading-relaxed opacity-50">
        We&apos;ll only use your number to share this quote. No spam, no sign-up.
      </p>
    </form>
  );
}
