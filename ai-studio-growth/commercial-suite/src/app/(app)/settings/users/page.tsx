import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { ActionButton } from "@/components/forms/action-button";
import { ChangeOwnPassword, CreateUserDialog, ResetPasswordDialog } from "@/components/settings/user-controls";
import { setUserActiveAction } from "@/app/actions/settings";

export const metadata = { title: "Users" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] });
  return (
    <>
      <PageHeader title="Users" description="Internal accounts with role-based access. Passwords are stored as salted scrypt hashes." actions={<CreateUserDialog />} />
      <Card>
        <Table>
          <thead><tr><Th>Name</Th><Th>Role</Th><Th className="hidden md:table-cell">Last sign-in</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead>
          <tbody>
            {users.map((u) => (
              <Tr key={u.id}>
                <Td><div className="font-medium">{u.name}{u.id === me.id && <span className="ml-2 text-xs text-muted">(you)</span>}</div><div className="text-xs text-muted">{u.email}</div></Td>
                <Td><Badge tone={u.role === "ADMIN" ? "purple" : "neutral"}>{u.role === "ADMIN" ? "Administrator" : "Staff"}</Badge></Td>
                <Td className="hidden text-muted md:table-cell">{formatDateTime(u.lastLoginAt)}</Td>
                <Td>{u.active ? <Badge tone="success">Active</Badge> : <Badge>Deactivated</Badge>}</Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    {u.id !== me.id && <ResetPasswordDialog userId={u.id} name={u.name} />}
                    {u.id !== me.id && <ActionButton variant="ghost" action={setUserActiveAction.bind(null, u.id, !u.active)}>{u.active ? "Deactivate" : "Reactivate"}</ActionButton>}
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <Card className="mt-6">
        <CardHeader title="Your password" />
        <CardBody><ChangeOwnPassword /></CardBody>
      </Card>
    </>
  );
}
