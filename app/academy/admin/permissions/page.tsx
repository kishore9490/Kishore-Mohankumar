import Link from "next/link";
import { requirePermission } from "@/server/auth/session";
import { adminUserById, permissionHolders } from "@/server/repositories/admin";
import { setExtraPermissions } from "@/server/actions/admin";
import { ALL_PERMISSIONS, ROLES } from "@/lib/platform/rbac";
import { Avatar, EmptyState, Notice, PageHeader, Panel, Pill } from "@/components/academy/ui";
import { ActionForm, CheckGroup } from "@/components/academy/admin/forms";
import { ManagePanel } from "@/components/academy/admin/bits";
import { Icon } from "@/components/ui/Icon";
import type { Permission, RoleKey } from "@/lib/platform/types";

export const metadata = { title: "Roles & permissions · EMC Academy" };

const ROLE_KEYS = Object.keys(ROLES) as RoleKey[];

/** Future bundles — documented here so they can be added to lib/platform/rbac.ts without touching screens. */
const PLANNED: { name: string; purpose: string; permissions: Permission[] }[] = [
  { name: "Counsellor", purpose: "Guide enquiries through counselling into admission.", permissions: ["leads.view", "leads.edit", "admissions.manage", "communications.send"] },
  { name: "Content manager", purpose: "Edit and publish course content after faculty review.", permissions: ["courses.view", "courses.edit", "content.manage", "courses.publish"] },
  { name: "Finance", purpose: "Invoices, offline payments and reminders.", permissions: ["finance.view", "finance.manage", "students.view", "communications.send"] },
  { name: "Support", purpose: "Help students and staff with access and accounts.", permissions: ["students.view", "communications.send", "audit.view"] },
  { name: "HR", purpose: "Faculty onboarding and records.", permissions: ["faculty.manage", "students.view"] },
];

function groups() {
  const out: { group: string; items: typeof ALL_PERMISSIONS }[] = [];
  for (const p of ALL_PERMISSIONS) {
    const g = out.find((x) => x.group === p.group) ?? (out.push({ group: p.group, items: [] }), out.at(-1)!);
    g.items.push(p);
  }
  return out;
}
const label = (k: Permission) => ALL_PERMISSIONS.find((p) => p.key === k)?.label ?? k;

export default async function PermissionsPage({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  await requirePermission("users.manage");
  const { user: userId } = await searchParams;
  const holders = permissionHolders();
  const selected = userId ? adminUserById(userId) : null;

  return (
    <>
      <PageHeader
        label="Operate · Roles & permissions"
        title="Access is a set of permissions."
        intro="Every screen and action asks for a permission — never a role name. A role is only a named bundle, so new roles can be added without changing any screen."
      />
      <div className="space-y-5">
        {selected && (
          <ManagePanel id="grants" label="Extra permissions" title={<span className="flex items-center gap-2.5">{selected.name} <Pill>{ROLES[selected.role].label}</Pill></span>} closeHref="/academy/admin/permissions">
            <p className="mb-4 text-[14px] text-muted">Permissions in the {ROLES[selected.role].label} bundle are locked on. Tick anything extra this person needs — it applies on their next request.</p>
            <ActionForm action={setExtraPermissions} submit="Save permissions" hidden={{ id: selected.id }}>
              <CheckGroup
                name="perm"
                legend="Permissions"
                columns={3}
                defaultValues={selected.extraPermissions}
                groups={groups()
                  .map((g) => ({
                    label: g.group,
                    options: g.items
                      .filter((p) => p.key !== "learning.access" || selected.role === "student")
                      .map((p) => ({ value: p.key, label: p.label, hint: p.key, locked: ROLES[selected.role].permissions.includes(p.key) })),
                  }))
                  .filter((g) => g.options.length)}
              />
            </ActionForm>
          </ManagePanel>
        )}

        <Panel title="Built-in role bundles" label="Read-only" pad={false}>
          <div className="px-5 pb-2 md:px-6">
            <Notice>Built-in bundles are defined in code and reviewed like code. To give one person more access, add an extra permission below instead of changing a role.</Notice>
          </div>
          <div className="mt-3 overflow-x-auto border-t border-line">
            <table className="w-full min-w-[620px] text-[13.5px]">
              <caption className="sr-only">Permissions held by each role</caption>
              <thead>
                <tr className="bg-mist/60">
                  <th scope="col" className="label !text-[10px] sticky left-0 bg-mist px-5 py-3 text-left font-normal md:px-6">Permission</th>
                  {ROLE_KEYS.map((r) => (
                    <th key={r} scope="col" className="px-3 py-3 text-center font-normal">
                      <span className="block text-[13px] font-semibold text-ink">{ROLES[r].label}</span>
                      <span className="label block !text-[9.5px]">{ROLES[r].purpose} · {ROLES[r].permissions.length}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              {groups().map((g) => (
                <tbody key={g.group} className="divide-y divide-line border-t border-line">
                  <tr>
                    <th colSpan={ROLE_KEYS.length + 1} scope="colgroup" className="label sticky left-0 bg-white px-5 pb-1 pt-4 text-left !text-[10px] font-normal !text-cyan-ink md:px-6">{g.group}</th>
                  </tr>
                  {g.items.map((p) => (
                    <tr key={p.key} className="hover:bg-mist/40">
                      <th scope="row" className="sticky left-0 bg-white px-5 py-2.5 text-left font-normal md:px-6">
                        <span className="block">{p.label}</span>
                        <span className="block font-mono text-[10.5px] text-muted">{p.key}</span>
                      </th>
                      {ROLE_KEYS.map((r) => {
                        const has = ROLES[r].permissions.includes(p.key);
                        return (
                          <td key={r} className="px-3 py-2.5 text-center">
                            {has ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white" aria-label={`${ROLES[r].label} has ${p.key}`}><Icon name="check" size={13} /></span>
                            ) : (
                              <span className="inline-block h-1 w-3 rounded-full bg-line" aria-label={`${ROLES[r].label} lacks ${p.key}`} />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <Panel title="Per-person grants" label="Extra permissions" id="people">
            {holders.length === 0 ? (
              <EmptyState icon="shield" title="No staff accounts" text="Staff and anyone with extra grants appear here." />
            ) : (
              <ul className="divide-y divide-line">
                {holders.map(({ user: u, extra }) => (
                  <li key={u.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Avatar name={u.name} size={34} tone={u.role === "admin" ? "ink" : "soft"} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-medium">{u.name} <span className="font-normal text-muted">· {ROLES[u.role].label}</span></p>
                      <p className="mt-1 flex flex-wrap gap-1">
                        {extra.length === 0 ? <span className="text-[12.5px] text-muted">Role bundle only</span> : extra.map((p) => <Pill key={p} tone="accent">{label(p)}</Pill>)}
                      </p>
                    </div>
                    <Link href={`/academy/admin/permissions?user=${u.id}#grants`} className="inline-flex h-10 items-center rounded-full border border-line px-4 text-[13px] font-medium hover:border-ink">Edit</Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-[12.5px] text-muted">Students are listed only when they hold extra grants. Find anyone in <Link href="/academy/admin/users" className="text-blue hover:text-ink">Users</Link>.</p>
          </Panel>

          <Panel title="Planned bundles" label="Not active yet">
            <p className="text-[14px] text-muted">Suggested permission sets for roles EMC expects to add. They become real when added to the role registry — no screen changes needed.</p>
            <ul className="mt-4 space-y-3">
              {PLANNED.map((r) => (
                <li key={r.name} className="rounded-xl border border-dashed border-line p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[15px] font-semibold">{r.name}</p>
                    <Pill>Planned</Pill>
                  </div>
                  <p className="mt-1 text-[13px] text-muted">{r.purpose}</p>
                  <p className="mt-2.5 flex flex-wrap gap-1">
                    {r.permissions.map((p) => <span key={p} className="code-chip rounded-md bg-mist px-1.5 py-0.5 !text-[11px]">{p}</span>)}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
