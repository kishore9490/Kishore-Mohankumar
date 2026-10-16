"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { KeyRound, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { verifyLoginOtpAction, restartLoginAction } from "@/app/actions/auth";
import { OtpInput, OtpSuccess, type OtpState } from "./otp-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VerifyForm({ next, email, signedIn }: { next?: string; email: string; signedIn?: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<OtpState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [restart, setRestart] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [otpKey, setOtpKey] = useState(0);
  const [, start] = useTransition();
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  useEffect(() => {
    if (!signedIn || state === "success") return;
    const t = setTimeout(() => router.replace(target), 300);
    return () => clearTimeout(t);
  }, [signedIn, state, router, target]);

  const submit = (code: string) => {
    setState("verifying");
    setMessage(null);
    start(async () => {
      const res = await verifyLoginOtpAction(code, next);
      if (res.ok) {
        setState("success");
        if (res.notice) toast.warning(res.notice, { duration: 8000 });
        setTimeout(() => router.replace(res.redirectTo), 1100);
        return;
      }
      setState("error");
      setMessage(res.attemptsLeft > 0 ? `${res.error} ${res.attemptsLeft} attempt${res.attemptsLeft === 1 ? "" : "s"} left.` : res.error);
      if (res.restart) setRestart(true);
      else setTimeout(() => setState("idle"), 700);
    });
  };

  if (signedIn && state !== "success") {
    return <div className="py-6"><OtpSuccess title="Verified" subtitle="Opening your dashboard…" /></div>;
  }
  if (state === "success") return <div className="py-6"><OtpSuccess title="Verified" subtitle="Opening your dashboard…" /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3 rounded-xl bg-brand-50/70 p-3 ring-1 ring-brand-100">
        <span className="flex size-9 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm"><Smartphone className="size-5" /></span>
        <div className="text-[13px] text-ink">Open your authenticator app and enter the 6-digit code for <strong>{email}</strong>.</div>
      </div>
      {!recovery ? (
        <OtpInput key={otpKey} state={restart ? "error" : state} onComplete={submit} onChange={() => setMessage(null)} />
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); submit(recoveryCode); }} className="space-y-3">
          <Input value={recoveryCode} onChange={(e) => setRecoveryCode(e.target.value)} placeholder="XXXX-XXXX" className={`text-center font-mono tracking-widest uppercase ${state === "error" ? "otp-shake border-red-500" : ""}`} aria-label="Recovery code" autoFocus />
          <Button type="submit" className="w-full" loading={state === "verifying"} disabled={restart}>Verify recovery code</Button>
        </form>
      )}
      <div className="mt-4 min-h-[40px] text-center" aria-live="assertive">
        {message && <p className={`otp-fade-up text-sm ${restart ? "text-amber-700" : "text-red-600"}`} role="alert">{message}</p>}
        {state === "verifying" && <p className="text-sm text-muted">Verifying…</p>}
      </div>
      {restart ? (
        <form action={restartLoginAction}><Button type="submit" className="w-full">Back to sign in</Button></form>
      ) : (
        <div className="mt-2 flex items-center justify-between text-[13px]">
          <button type="button" className="flex items-center gap-1.5 font-medium text-brand-700 hover:underline" onClick={() => { setRecovery(!recovery); setState("idle"); setMessage(null); setOtpKey((k) => k + 1); }}>
            <KeyRound className="size-3.5" /> {recovery ? "Use authenticator code" : "Use a recovery code"}
          </button>
          <form action={restartLoginAction}><button type="submit" className="text-muted hover:text-ink">Cancel</button></form>
        </div>
      )}
    </div>
  );
}
