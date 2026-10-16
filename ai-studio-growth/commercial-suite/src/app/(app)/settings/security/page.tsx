import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/dates";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChangeOwnPassword, RegenerateRecoveryCodes } from "@/components/settings/user-controls";

export const metadata = { title: "Security" };
export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const me = await requireUser();
  const [user, remaining, sessions, events] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: me.id } }),
    prisma.recoveryCode.count({ where: { userId: me.id, usedAt: null } }),
    prisma.session.count({ where: { userId: me.id, expiresAt: { gt: new Date() } } }),
    prisma.auditEvent.findMany({ where: { userId: me.id, action: { startsWith: "auth." } }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Card>
          <CardHeader title="Two-step verification" description="Your account is protected by an authenticator app." actions={user.mfaEnabled ? <Badge tone="success">Enabled</Badge> : <Badge tone="warning">Not set up</Badge>} />
          <CardBody className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Recovery codes remaining</span><span className={remaining <= 2 ? "font-semibold text-amber-700" : ""}>{remaining} of 8</span></div>
            <div className="flex justify-between"><span className="text-muted">Active sessions</span><span>{sessions}</span></div>
            <p className="pt-2 text-xs text-muted">Lost your phone? Sign in with a recovery code, or ask an administrator to reset your access.</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Recovery codes" description="One-time codes for when your authenticator is unavailable." />
          <CardBody><RegenerateRecoveryCodes /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Change password" description="Requires your current password and an authenticator code." />
          <CardBody><ChangeOwnPassword /></CardBody>
        </Card>
      </div>
      <Card className="h-fit">
        <CardHeader title="Recent security activity" />
        <ul className="divide-y divide-line text-sm">
          {events.length === 0 && <li className="px-5 py-3 text-muted">No activity yet.</li>}
          {events.map((e) => <li key={e.id} className="px-5 py-3"><div>{e.summary}</div><div className="text-xs text-muted">{formatDateTime(e.createdAt)}</div></li>)}
        </ul>
      </Card>
    </div>
  );
}
