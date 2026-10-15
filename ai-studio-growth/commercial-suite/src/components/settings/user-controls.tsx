"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { KeyRound, UserPlus } from "lucide-react";
import { adminResetPasswordAction, changeOwnPasswordAction, createUserAction } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function CreateUserDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({ name: "", email: "", role: "STAFF" as "STAFF" | "ADMIN", password: "" });
  const [pending, start] = useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}><UserPlus /> New user</Button>
      <DialogContent title="New user" description="There is no public registration — administrators create accounts.">
        <div className="grid gap-3">
          <Field label="Name" htmlFor="u-name"><Input id="u-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
          <Field label="Email" htmlFor="u-email"><Input id="u-email" type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
          <Field label="Role" htmlFor="u-role"><Select id="u-role" value={v.role} onChange={(e) => setV({ ...v, role: e.target.value as "STAFF" | "ADMIN" })}><option value="STAFF">Staff — documents, customers, payments</option><option value="ADMIN">Administrator — plus settings, users, integrations</option></Select></Field>
          <Field label="Temporary password" htmlFor="u-pw" hint="At least 10 characters with letters and numbers."><Input id="u-pw" type="password" autoComplete="new-password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} /></Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button loading={pending} onClick={() => start(async () => { const r = await createUserAction(v); if (!r.ok) return void toast.error(r.error); toast.success(r.message); setOpen(false); setV({ name: "", email: "", role: "STAFF", password: "" }); router.refresh(); })}>Create user</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ResetPasswordDialog({ userId, name }: { userId: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [pending, start] = useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}><KeyRound /> Reset password</Button>
      <DialogContent title={`Reset password for ${name}`}>
        <Field label="New password" htmlFor="rp"><Input id="rp" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button loading={pending} onClick={() => start(async () => { const r = await adminResetPasswordAction(userId, pw); if (!r.ok) return void toast.error(r.error); toast.success(r.message); setOpen(false); setPw(""); })}>Reset</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ChangeOwnPassword() {
  const [v, setV] = useState({ current: "", next: "" });
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap items-end gap-2">
      <Field label="Current password" htmlFor="cp-c" className="min-w-48 flex-1"><Input id="cp-c" type="password" autoComplete="current-password" value={v.current} onChange={(e) => setV({ ...v, current: e.target.value })} /></Field>
      <Field label="New password" htmlFor="cp-n" className="min-w-48 flex-1"><Input id="cp-n" type="password" autoComplete="new-password" value={v.next} onChange={(e) => setV({ ...v, next: e.target.value })} /></Field>
      <Button variant="outline" loading={pending} onClick={() => start(async () => { const r = await changeOwnPasswordAction(v.current, v.next); if (!r.ok) return void toast.error(r.error); toast.success(r.message); setV({ current: "", next: "" }); })}>Change password</Button>
    </div>
  );
}
