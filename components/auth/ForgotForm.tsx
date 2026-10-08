"use client";
import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/server/actions/auth";
import { Button } from "@/components/ui/Button";

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, { sent: false });
  if (state.sent)
    return (
      <div role="status" className="rounded-2xl border border-line bg-mist p-6">
        <p className="text-[16px] font-semibold">Check your email.</p>
        <p className="mt-2 text-[14.5px] text-muted">If an account exists for that address, a reset link is on its way.</p>
        <Link href="/login" className="mt-5 inline-block text-[14px] font-medium text-blue">← Back to login</Link>
      </div>
    );
  return (
    <form action={action} className="grid gap-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium">Email</label>
        <input id="email" name="email" type="email" className="field" autoComplete="email" required />
      </div>
      <Button type="submit" size="lg" icon="arrow" disabled={pending} className="w-full">{pending ? "Sending…" : "Send reset link"}</Button>
      <Link href="/login" className="text-center text-[14px] font-medium text-muted hover:text-ink">← Back to login</Link>
    </form>
  );
}
