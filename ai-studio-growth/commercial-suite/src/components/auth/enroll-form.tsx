"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Copy, Download } from "lucide-react";
import { confirmEnrollmentAction, restartLoginAction } from "@/app/actions/auth";
import { OtpInput, OtpSuccess, type OtpState } from "./otp-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/input";

export function EnrollForm({ secret, qrDataUrl, next, completed }: { secret: string; qrDataUrl: string; next?: string; completed?: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<OtpState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [restart, setRestart] = useState(false);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [, start] = useTransition();

  const copy = async (text: string, what: string) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(what);
    setTimeout(() => setCopied(null), 1500);
  };

  const submit = (code: string) => {
    setState("verifying");
    setMessage(null);
    start(async () => {
      const res = await confirmEnrollmentAction(code);
      if (res.ok) {
        setState("success");
        setTimeout(() => setCodes(res.recoveryCodes), 1200);
        return;
      }
      setState("error");
      setMessage(res.attemptsLeft > 0 ? `${res.error} ${res.attemptsLeft} attempt${res.attemptsLeft === 1 ? "" : "s"} left.` : res.error);
      if (res.restart) setRestart(true);
      else setTimeout(() => setState("idle"), 700);
    });
  };

  if (codes) {
    const text = `AI Studio Quote Studio — recovery codes\nEach code can be used once if you lose your authenticator.\n\n${codes.join("\n")}\n`;
    return (
      <div className="otp-fade-up">
        <h3 className="font-display text-lg font-bold text-ink">Save your recovery codes</h3>
        <p className="mt-1 text-sm text-muted">If you lose access to your authenticator app, each code lets you sign in once. They will not be shown again.</p>
        <ul className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-navy-900 p-4 font-mono text-sm tracking-wider text-white" data-testid="recovery-codes">
          {codes.map((c) => <li key={c}>{c}</li>)}
        </ul>
        <div className="mt-3 flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => copy(codes.join("\n"), "codes")}>{copied === "codes" ? <Check /> : <Copy />} Copy</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" })); a.download = "quote-studio-recovery-codes.txt"; a.click(); }}><Download /> Download</Button>
        </div>
        <Checkbox className="mt-5" label="I have saved these recovery codes somewhere safe" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
        <Button className="mt-4 w-full" size="lg" disabled={!saved} onClick={() => router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/")}>Continue to dashboard</Button>
      </div>
    );
  }

  if (state === "success") return <div className="py-6"><OtpSuccess title="Authenticator connected" subtitle="Preparing your recovery codes…" /></div>;
  if (completed)
    return (
      <div className="py-4">
        <OtpSuccess title="All set" subtitle="Manage recovery codes any time in Settings → Security." />
        <Button className="mt-6 w-full" onClick={() => router.replace("/")}>Go to dashboard</Button>
      </div>
    );

  return (
    <div>
      <ol className="space-y-5 text-sm">
        <li>
          <div className="font-medium text-ink">1. Scan this QR code</div>
          <p className="text-[13px] text-muted">Use Google Authenticator, Microsoft Authenticator, 1Password or any TOTP app.</p>
          <div className="mt-3 flex justify-center rounded-xl border border-line bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR code for your authenticator app" width={180} height={180} />
          </div>
          <div className="mt-2 text-[12px] text-muted">
            Can&apos;t scan? Enter this key manually:
            <button type="button" onClick={() => copy(secret, "secret")} className="mt-1 flex w-full items-center justify-between gap-2 rounded-lg bg-canvas px-3 py-2 font-mono text-[12px] tracking-wider break-all text-ink ring-1 ring-line" data-testid="totp-secret">
              {secret.replace(/(.{4})/g, "$1 ").trim()}
              {copied === "secret" ? <Check className="size-4 shrink-0 text-emerald-600" /> : <Copy className="size-4 shrink-0 text-muted" />}
            </button>
          </div>
        </li>
        <li>
          <div className="mb-3 font-medium text-ink">2. Enter the 6-digit code it shows</div>
          <OtpInput state={state} onComplete={submit} onChange={() => setMessage(null)} autoFocus={false} />
        </li>
      </ol>
      <div className="mt-4 min-h-[40px] text-center" aria-live="assertive">
        {message && <p className={`otp-fade-up text-sm ${restart ? "text-amber-700" : "text-red-600"}`} role="alert">{message}</p>}
        {state === "verifying" && <p className="text-sm text-muted">Verifying…</p>}
      </div>
      {restart && <form action={restartLoginAction}><Button type="submit" className="w-full">Back to sign in</Button></form>}
    </div>
  );
}
