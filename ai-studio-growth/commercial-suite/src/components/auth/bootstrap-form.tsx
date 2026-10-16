"use client";
import { useState, useTransition } from "react";
import { bootstrapAction } from "@/app/actions/bootstrap";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/input";

export function BootstrapForm() {
  const [v, setV] = useState({ token: "", name: "", email: "", samples: true });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setError(null); start(async () => { const r = await bootstrapAction(v); if (r?.error) setError(r.error); }); }}>
      <Field label="Setup token" htmlFor="setup-token" hint="The SETUP_TOKEN value you added in your hosting environment variables."><Input id="setup-token" type="password" value={v.token} onChange={(e) => setV({ ...v, token: e.target.value })} autoFocus /></Field>
      <Field label="Your name" htmlFor="setup-name"><Input id="setup-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
      <Field label="Your email" htmlFor="setup-email"><Input id="setup-email" type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
      <Checkbox label="Add sample data (Anant Motors proposal, quotes and invoices)" description="Clearly labelled demo records you can remove later in Settings → Company." checked={v.samples} onChange={(e) => setV({ ...v, samples: e.target.checked })} />
      {error && <p className="otp-fade-up rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200" role="alert">{error}</p>}
      <Button type="submit" size="lg" className="w-full" loading={pending}>Create administrator</Button>
    </form>
  );
}
