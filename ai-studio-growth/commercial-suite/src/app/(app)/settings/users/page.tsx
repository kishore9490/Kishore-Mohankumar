import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/dates";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { ActionButton } from "@/components/forms/action-button";
import { InviteLinkButton, InviteUserDialog } from "@/components/settings/user-controls";
import { revokeInviteAction, setUserActiveAction } from "@/app/actions/settings";

export const metadata = { title: "Users & invitations" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: { invitations: { where: { usedAt: null, revokedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return (
    <Card>
      <CardHeader title="Users & invitations" description="Access is invite-only. Every account uses a password plus an authenticator app (MFA)." actions={<InviteUserDialog />} />
      <Table>
        <thead><tr><Th>Name</Th><Th>Role</Th><Th>Status</Th><Th className="hidden lg:table-cell">MFA</Th><Th className="hidden md:table-cell">Last sign-in</Th><Th className="text-right">Actions</Th></tr></thead>
        <tbody>
          {users.map((u) => {
            const invited = !u.passwordHash;
            const pendingInvite = u.invitations[0];
            return (
              <Tr key={u.id}>
                <Td><div className="font-medium">{u.name}{u.id === me.id && <span className="ml-2 text-xs text-muted">(you)</span>}</div><div className="text-xs text-muted">{u.email}</div></Td>
                <Td><Badge tone={u.role === "ADMIN" ? "purple" : "neutral"}>{u.role === "ADMIN" ? "Administrator" : "Staff"}</Badge></Td>
                <Td>
                  {!u.active ? <Badge>Deactivated</Badge> : invited ? <Badge tone="warning">Invited</Badge> : <Badge tone="success">Active</Badge>}
                  {invited && u.active && <div className="mt-1 text-[11px] text-muted">{pendingInvite ? `Link valid until ${formatDateTime(pendingInvite.expiresAt)}` : "No valid link"}</div>}
                </Td>
                <Td className="hidden lg:table-cell">{u.mfaEnabled ? <Badge tone="success">Enabled</Badge> : <Badge tone="warning">Not set up</Badge>}</Td>
                <Td className="hidden text-muted md:table-cell">{formatDateTime(u.lastLoginAt)}</Td>
                <Td className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    {u.active && invited && <InviteLinkButton userId={u.id} name={u.name} kind="reissue" />}
                    {u.active && invited && pendingInvite && <ActionButton variant="ghost" action={revokeInviteAction.bind(null, u.id)}>Revoke link</ActionButton>}
                    {u.active && !invited && u.id !== me.id && <InviteLinkButton userId={u.id} name={u.name} kind="reset" />}
                    {u.id !== me.id && <ActionButton variant="ghost" action={setUserActiveAction.bind(null, u.id, !u.active)} confirm={u.active ? { title: `Deactivate ${u.name}?`, description: "They are signed out immediately and pending invitation links stop working." } : undefined} confirmLabel="Deactivate">{u.active ? "Deactivate" : "Reactivate"}</ActionButton>}
                  </div>
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </Card>
  );
}
