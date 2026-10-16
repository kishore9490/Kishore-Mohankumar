"use client";
import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { acceptInviteAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AcceptInviteForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const rules = [
    { ok: password.length >= 10, label: "At least 10 characters" },
    { ok: /[A-Za-z]/.test(password) && /\d/.test(password), label: "Letters and numbers" },
    { ok: password.length > 0 && password === confirm, label: "Passwords match" },
  ];
  const valid = rules.every((r) => r.ok);
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const res = await acceptInviteAction({ token, password, confirm });
          if (res && !res.ok) setError(res.error);
        });
      }}
    >
      <Field label="Create a password" htmlFor="new-password">
        <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
      </Field>
      <Field label="Confirm password" htmlFor="confirm-password">
        <Input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </Field>
      <ul className="space-y-1 text-[13px]">
        {rules.map((r) => (
          <li key={r.label} className={cn("flex items-center gap-2 transition-colors", r.ok ? "text-emerald-700" : "text-muted")}>
            {r.ok ? <Check className="size-3.5" /> : <X className="size-3.5" />} {r.label}
          </li>
        ))}
      </ul>
      {error && <p className="otp-fade-up rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200" role="alert">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={!valid} loading={pending}>Set password &amp; continue</Button>
    </form>
  );
}
