"use client";
import Link from "next/link";
import { useActionState } from "react";
import type { Campaign } from "@/lib/platform/types";
import { saveCampaign, type FormState } from "@/server/actions/marketing";
import { Button } from "@/components/ui/Button";
import { Field, FormResult, fieldAria } from "./Field";
import { CAMPAIGN_CHANNELS } from "./meta";

const day = (iso: string | null | undefined) => (iso ? new Date(new Date(iso).getTime() + 330 * 60_000).toISOString().slice(0, 10) : "");

export function CampaignForm({ campaign, closeHref }: { campaign: Campaign | null; closeHref: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCampaign, { ok: false });
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};
  const val = (k: string, fallback: string) => v[k] ?? fallback;
  return (
    <form key={state.at ?? 0} action={action} noValidate className="grid gap-4">
      {campaign && <input type="hidden" name="id" value={campaign.id} />}
      <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
        <Field id="name" label="Campaign name" error={fe.name}>
          <input {...fieldAria("name", fe.name)} className="field" defaultValue={val("name", campaign?.name ?? "")} maxLength={120} autoFocus />
        </Field>
        <Field id="channel" label="Channel" error={fe.channel}>
          <select {...fieldAria("channel", fe.channel)} className="field" defaultValue={val("channel", campaign?.channel ?? "google")}>
            {CAMPAIGN_CHANNELS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </Field>
        <Field id="status" label="Status" error={fe.status}>
          <select {...fieldAria("status", fe.status)} className="field" defaultValue={val("status", campaign?.status ?? "draft")}>
            {["draft", "active", "paused", "ended"].map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="budget" label="Budget (₹)" error={fe.budget}>
          <input {...fieldAria("budget", fe.budget)} className="field" inputMode="numeric" defaultValue={val("budget", String(campaign?.budget ?? ""))} />
        </Field>
        <Field id="spend" label="Spend to date (₹)" error={fe.spend}>
          <input {...fieldAria("spend", fe.spend)} className="field" inputMode="numeric" defaultValue={val("spend", String(campaign?.spend ?? 0))} />
        </Field>
        <Field id="revenue" label="Attributed revenue (₹)" error={fe.revenue} hint="Demo figure until payments are connected.">
          <input {...fieldAria("revenue", fe.revenue, true)} className="field" inputMode="numeric" defaultValue={val("revenue", String(campaign?.revenue ?? 0))} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="startDate" label="Start date" error={fe.startDate}>
          <input {...fieldAria("startDate", fe.startDate)} type="date" className="field" defaultValue={val("startDate", day(campaign?.startDate) || day(new Date().toISOString()))} />
        </Field>
        <Field id="endDate" label="End date" error={fe.endDate} optional>
          <input {...fieldAria("endDate", fe.endDate)} type="date" className="field" defaultValue={val("endDate", day(campaign?.endDate))} />
        </Field>
        <div className="flex items-end gap-2 sm:justify-end">
          <Link href={closeHref} className="inline-flex h-11 items-center justify-center rounded-full px-5 text-[14px] font-medium hover:bg-mist">Cancel</Link>
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : campaign ? "Save changes" : "Create campaign"}</Button>
        </div>
      </div>
      <p className="text-[12.5px] text-muted">Leads, cost per lead and conversions are counted from leads tagged with this campaign — you don’t enter them.</p>
      <FormResult state={state.at ? state : null} />
    </form>
  );
}
