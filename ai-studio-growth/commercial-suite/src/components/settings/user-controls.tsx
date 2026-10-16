"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { KeyRound, Link2, Mail, RefreshCw, UserPlus } from "lucide-react";
import { changeOwnPasswordAction, inviteUserAction, regenerateRecoveryCodesAction, reissueInviteAction, resetAccessAction, type InviteResult } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CopyField } from "./integration-controls";
import { OtpInput, type OtpState } from "@/components/auth/otp-input";

function InviteLinkResult({ result }: { result: Extract<InviteResult, { ok: true }>["data"] }) {
  if (!result) return null;
  return (
    <div className="otp-fade-up space-y-3">
      <div className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm ring-1 ${result.emailed ? "bg-emerald-50 text-emerald-900 ring-emerald-200" : "bg-amber-50 text-amber-900 ring-amber-200"}`}>
        <Mail className="mt-0.5 size-4 shrink-0" />
        <span>{result.emailed ? "The invitation email was sent. You can also share the link below." : result.emailNote}</span>
      </div>
      <CopyField label="Single-use invitation link (expires in 72 hours)" value={result.url} />
      <p className="text-xs text-muted">Share it privately (e.g. direct message). Anyone with the link can set the password for this account until it is used.</p>
    </div>
  );
}

export function InviteUserDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({ name: "", email: "", role: "STAFF" as "STAFF" | "ADMIN" });
  const [result, setResult] = useState<Extract<InviteResult, { ok: true }>["data"] | null>(null);
  const [pending, start] = useTransition();
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setResult(null); setV({ name: "", email: "", role: "STAFF" }); } }}>
      <Button size="sm" onClick={() => setOpen(true)}><UserPlus /> Invite user</Button>
      <DialogContent title="Invite a team member" description="Only invited people can set a password and sign in. They will also set up an authenticator app.">
        {result ? (
          <>
            <InviteLinkResult result={result} />
            <div className="mt-5 flex justify-end"><Button onClick={() => setOpen(false)}>Done</Button></div>
          </>
        ) : (
          <>
            <div className="grid gap-3">
              <Field label="Name" htmlFor="u-name"><Input id="u-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
              <Field label="Email" htmlFor="u-email"><Input id="u-email" type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
              <Field label="Role" htmlFor="u-role"><Select id="u-role" value={v.role} onChange={(e) => setV({ ...v, role: e.target.value as "STAFF" | "ADMIN" })}><option value="STAFF">Staff — documents, customers, payments, promotions</option><option value="ADMIN">Administrator — plus settings, integrations and users</option></Select></Field>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button loading={pending} onClick={() => start(async () => { const r = await inviteUserAction(v); if (!r.ok) return void toast.error(r.error); toast.success(r.message); setResult(r.data!); router.refresh(); })}>Create invitation</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Re-issue an invitation, or reset access for an active user — both produce a fresh single-use link. */
export function InviteLinkButton({ userId, name, kind }: { userId: string; name: string; kind: "reissue" | "reset" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<Extract<InviteResult, { ok: true }>["data"] | null>(null);
  const [pending, start] = useTransition();
  const go = () => start(async () => {
    const r = kind === "reissue" ? await reissueInviteAction(userId) : await resetAccessAction(userId);
    if (!r.ok) return void toast.error(r.error);
    toast.success(r.message);
    setResult(r.data!);
    router.refresh();
  });
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setResult(null); }}>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>{kind === "reissue" ? <><Link2 /> New link</> : <><RefreshCw /> Reset access</>}</Button>
      <DialogContent title={kind === "reissue" ? `New invitation link for ${name}` : `Reset access for ${name}?`}>
        {result ? (
          <><InviteLinkResult result={result} /><div className="mt-5 flex justify-end"><Button onClick={() => setOpen(false)}>Done</Button></div></>
        ) : (
          <>
            <p className="text-sm text-muted">{kind === "reissue" ? "Earlier invitation links will stop working." : "Their password, authenticator and all sessions are revoked immediately. They regain access only through the new single-use link (new password + new authenticator)."}</p>
            <div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button variant={kind === "reset" ? "danger" : "primary"} loading={pending} onClick={go}>{kind === "reissue" ? "Create new link" : "Reset access"}</Button></div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CodeStep({ onCode, state }: { onCode: (c: string) => void; state: OtpState }) {
  return (
    <div>
      <div className="mb-2 text-[13px] font-medium text-ink">Authenticator code</div>
      <OtpInput state={state} onComplete={onCode} autoFocus={false} />
    </div>
  );
}

export function ChangeOwnPassword() {
  const [v, setV] = useState({ current: "", next: "" });
  const [state, setState] = useState<OtpState>("idle");
  const [key, setKey] = useState(0);
  const [, start] = useTransition();
  const submit = (code: string) => {
    setState("verifying");
    start(async () => {
      const r = await changeOwnPasswordAction(v.current, v.next, code);
      if (!r.ok) {
        setState("error");
        toast.error(r.error);
        setTimeout(() => setState("idle"), 700);
        return;
      }
      setState("success");
      toast.success(r.message);
      setTimeout(() => { setV({ current: "", next: "" }); setState("idle"); setKey((k) => k + 1); }, 1200);
    });
  };
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
      <Field label="Current password" htmlFor="cp-c"><Input id="cp-c" type="password" autoComplete="current-password" value={v.current} onChange={(e) => setV({ ...v, current: e.target.value })} /></Field>
      <Field label="New password" htmlFor="cp-n" hint="10+ characters with letters and numbers"><Input id="cp-n" type="password" autoComplete="new-password" value={v.next} onChange={(e) => setV({ ...v, next: e.target.value })} /></Field>
      <div className={!v.current || !v.next ? "pointer-events-none opacity-50" : ""}><CodeStep key={key} onCode={submit} state={state} /></div>
    </div>
  );
}

export function RegenerateRecoveryCodes() {
  const [state, setState] = useState<OtpState>("idle");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [key, setKey] = useState(0);
  const [, start] = useTransition();
  const submit = (code: string) => {
    setState("verifying");
    start(async () => {
      const r = await regenerateRecoveryCodesAction(code);
      if (!r.ok) {
        setState("error");
        toast.error(r.error);
        setTimeout(() => { setState("idle"); setKey((k) => k + 1); }, 700);
        return;
      }
      setState("success");
      setTimeout(() => setCodes(r.data!.codes), 900);
    });
  };
  if (codes)
    return (
      <div className="otp-fade-up">
        <ul className="grid grid-cols-2 gap-2 rounded-xl bg-navy-900 p-4 font-mono text-sm tracking-wider text-white sm:grid-cols-4">{codes.map((c) => <li key={c}>{c}</li>)}</ul>
        <div className="mt-3"><CopyField label="Copy all" value={codes.join("  ")} /></div>
        <p className="mt-2 text-xs text-muted">Store them safely — they will not be shown again. Previous codes no longer work.</p>
      </div>
    );
  return (
    <div className="flex flex-wrap items-center gap-4">
      <p className="max-w-sm text-sm text-muted"><KeyRound className="mr-1 inline size-4" /> Enter a current authenticator code to generate 8 new recovery codes.</p>
      <CodeStep key={key} onCode={submit} state={state} />
    </div>
  );
}
