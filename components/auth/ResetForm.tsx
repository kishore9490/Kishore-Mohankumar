"use client";
import { useActionState } from "react";
import { resetPassword } from "@/server/actions/auth";
import { Button } from "@/components/ui/Button";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, { error: null });
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium">New password</label>
        <input id="password" name="password" type="password" className="field" autoComplete="new-password" minLength={10} required />
      </div>
      {state.error && <p role="alert" className="rounded-xl bg-orange-50 px-4 py-3 text-[14px] text-orange-900">{state.error}</p>}
      <Button type="submit" size="lg" icon="arrow" disabled={pending} className="w-full">{pending ? "Saving…" : "Save password"}</Button>
    </form>
  );
}
