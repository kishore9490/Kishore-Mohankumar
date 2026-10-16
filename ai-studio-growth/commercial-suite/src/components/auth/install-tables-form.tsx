"use client";
import { useState, useTransition } from "react";
import { installTablesAction } from "@/app/actions/bootstrap";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function InstallTablesForm() {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form className="mt-5 space-y-3" onSubmit={(e) => { e.preventDefault(); setError(null); start(async () => { const r = await installTablesAction(token); if (r?.error) setError(r.error); }); }}>
      <Field label="Setup token" htmlFor="install-token" hint="The SETUP_TOKEN value from your hosting environment variables."><Input id="install-token" type="password" value={token} onChange={(e) => setToken(e.target.value)} /></Field>
      {error && <p className="otp-fade-up rounded-lg bg-red-50 px-3 py-2 text-sm break-words text-red-700 ring-1 ring-red-200" role="alert">{error}</p>}
      <Button type="submit" size="lg" className="w-full" loading={pending}>Create database tables</Button>
    </form>
  );
}
