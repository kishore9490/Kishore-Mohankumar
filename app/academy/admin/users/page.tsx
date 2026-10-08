import { requirePermission } from "@/server/auth/session";
import { allCourses, batchesForSelect, listUsers, programName, userWorkspace } from "@/server/repositories/admin";
import Link from "next/link";
import {
  assignCourseToFaculty, assignUserToBatch, changeUserRole, createUser, resetUserPassword, setUserStatus, updateUserProfile,
} from "@/server/actions/admin";
import { ALL_PERMISSIONS, ROLES } from "@/lib/platform/rbac";
import { formatDate, relative } from "@/lib/platform/format";
import { Avatar, DataTable, EmptyState, Notice, PageHeader, Pill, StatusPill, Tabs } from "@/components/academy/ui";
import { ActionButton, ActionForm, CheckGroup, Field, Select } from "@/components/academy/admin/forms";
import { FilterBar, FilterInput, FilterSelect, KeyValues, ManagePanel, Pager, SubHead, seen, withParams } from "@/components/academy/admin/bits";
import { ButtonLink } from "@/components/ui/Button";
import type { RoleKey } from "@/lib/platform/types";

export const metadata = { title: "Users · EMC Academy" };

type SP = { role?: string; q?: string; status?: string; user?: string; new?: string; page?: string };
const PAGE = 15;
const ROLE_OPTIONS = (Object.keys(ROLES) as RoleKey[]).map((r) => ({ value: r, label: ROLES[r].label }));

export default async function UsersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const me = await requirePermission("users.manage");
  const sp = await searchParams;
  const role = ["student", "faculty", "marketing", "admin"].includes(sp.role ?? "") ? sp.role : undefined;
  const status = ["active", "disabled", "invited"].includes(sp.status ?? "") ? sp.status : undefined;
  const q = (sp.q ?? "").slice(0, 80);
  const { rows, counts } = listUsers({ role, q, status });
  const keep = { role, q: q || undefined, status };
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const page = Math.min(pages, Math.max(1, Number(sp.page) || 1));
  const pageRows = rows.slice((page - 1) * PAGE, page * PAGE);
  const keepPage = { ...keep, page: page > 1 ? String(page) : undefined };
  const ws = sp.user ? userWorkspace(sp.user) : null;
  const closeHref = withParams("/academy/admin/users", keepPage, {});

  return (
    <>
      <PageHeader
        label="Operate · Users"
        title="People & access."
        intro="Every account on the platform. Create users, change roles, reset access and assign teaching or learning — every change is written to the audit log."
        actions={<ButtonLink href={withParams("/academy/admin/users", keep, { new: "1" })} iconLeft="plus" icon={null} size="sm">Create user</ButtonLink>}
      />

      <div className="space-y-5">
        {sp.new && (
          <ManagePanel label="New account" title="Create a user" closeHref={closeHref}>
            <ActionForm action={createUser} submit="Create user" submitIcon="plus">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field name="name" label="Full name" maxLength={80} />
                <Field name="email" label="Email" type="email" maxLength={160} hint="Becomes their sign-in." />
                <Field name="phone" label="Mobile" type="tel" optional maxLength={20} placeholder="+91 98765 43210" />
                <Select name="role" label="Role" options={ROLE_OPTIONS} defaultValue={role ?? "student"} hint="A role is a bundle of permissions." />
                <Field name="title" label="Title" optional maxLength={80} placeholder="e.g. Faculty — Procedure Coding" />
              </div>
              <details className="rounded-xl border border-line px-4 py-3">
                <summary className="cursor-pointer text-[14px] font-medium">Extra permissions <span className="font-normal text-muted">(optional — beyond the role)</span></summary>
                <div className="mt-4">
                  <CheckGroup
                    name="perm"
                    legend="Grant individually"
                    columns={3}
                    groups={groupPermissions().map((g) => ({ label: g.group, options: g.items.map((p) => ({ value: p.key, label: p.label, hint: p.key })) }))}
                  />
                </div>
              </details>
              <Notice>A one-time temporary password is generated and shown once after creation (demo). Permissions already in the role are ignored.</Notice>
            </ActionForm>
          </ManagePanel>
        )}

        {ws && <UserWorkspace ws={ws} meId={me.id} closeHref={closeHref} />}
        {sp.user && !ws && <Notice tone="warning">That user doesn’t exist any more.</Notice>}

        <div className="flex flex-col gap-3">
          <Tabs
            current={role ?? "all"}
            items={[
              { key: "all", label: "All", href: withParams("/academy/admin/users", { ...keep, role: undefined }, {}), count: counts.all },
              { key: "student", label: "Students", href: withParams("/academy/admin/users", keep, { role: "student" }), count: counts.student },
              { key: "faculty", label: "Faculty", href: withParams("/academy/admin/users", keep, { role: "faculty" }), count: counts.faculty },
              { key: "marketing", label: "Marketing", href: withParams("/academy/admin/users", keep, { role: "marketing" }), count: counts.marketing },
              { key: "admin", label: "Super Admin", href: withParams("/academy/admin/users", keep, { role: "admin" }), count: counts.admin },
            ]}
          />
          <FilterBar action="/academy/admin/users">
            {role && <input type="hidden" name="role" value={role} />}
            <FilterInput name="q" label="Search users" defaultValue={q} placeholder="Name, email or mobile" />
            <FilterSelect name="status" label="Status" defaultValue={status ?? ""} options={[{ value: "", label: "Any status" }, { value: "active", label: "Active" }, { value: "disabled", label: "Disabled" }, { value: "invited", label: "Invited" }]} />
          </FilterBar>
        </div>

        <DataTable
          caption="Users"
          rows={pageRows}
          rowKey={(u) => u.id}
          rowHref={(u) => withParams("/academy/admin/users", keepPage, { user: u.id })}
          empty={<EmptyState icon="users" title="No users match" text={q ? `Nothing matches “${q}”. Try a name, email or the last digits of a mobile number.` : "No accounts in this view yet."} />}
          columns={[
            {
              key: "name", label: "Name", mobile: "primary",
              render: (u) => (
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar name={u.name} size={32} tone={u.role === "admin" ? "ink" : "soft"} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{u.name}{u.id === me.id && <span className="ml-1.5 text-[12px] font-normal text-muted">(you)</span>}</span>
                    <span className="block truncate text-[12.5px] font-normal text-muted">{u.email}</span>
                  </span>
                </span>
              ),
            },
            { key: "role", label: "Role", render: (u) => <span className="flex flex-wrap items-center gap-1.5">{ROLES[u.role].label}{u.extraPermissions.length > 0 && <Pill tone="accent">+{u.extraPermissions.length}</Pill>}</span> },
            { key: "status", label: "Status", render: (u) => <StatusPill status={u.status} /> },
            { key: "title", label: "Title", mobile: "hide", className: "hidden xl:table-cell", render: (u) => <span className="text-muted">{u.title ?? "—"}</span> },
            { key: "login", label: "Last login", render: (u) => <span className="font-mono text-[12.5px] text-muted">{seen(u.lastLoginAt)}</span> },
          ]}
        />
        <Pager page={page} pages={pages} total={rows.length} label="accounts" href={(p) => withParams("/academy/admin/users", keep, { page: p > 1 ? String(p) : undefined })} />
        <p className="text-[12.5px] text-muted">Select a person to manage their access. Password hashes are never shown or exported.</p>
      </div>
    </>
  );
}

function groupPermissions() {
  const groups: { group: string; items: typeof ALL_PERMISSIONS }[] = [];
  for (const p of ALL_PERMISSIONS) {
    if (p.key === "learning.access") continue;
    const g = groups.find((x) => x.group === p.group) ?? (groups.push({ group: p.group, items: [] }), groups.at(-1)!);
    g.items.push(p);
  }
  return groups;
}

function UserWorkspace({ ws, meId, closeHref }: { ws: NonNullable<ReturnType<typeof userWorkspace>>; meId: string; closeHref: string }) {
  const u = ws.user;
  const self = u.id === meId;
  const batches = batchesForSelect().filter((b) => b.status !== "completed");
  return (
    <ManagePanel
      id="manage"
      label={`${ROLES[u.role].label} · ${u.id}`}
      title={<span className="flex flex-wrap items-center gap-2.5">{u.name} <StatusPill status={u.status} /></span>}
      closeHref={closeHref}
    >
      {self && <div className="mb-5"><Notice>This is your own account. You can edit your profile, but you can’t disable yourself or change your own role.</Notice></div>}
      <div className="grid gap-8 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-line">
        {/* Profile */}
        <section className="min-w-0 lg:pr-7">
          <SubHead>Profile</SubHead>
          <KeyValues
            className="mt-3"
            items={[
              ["Email", <span key="e" className="break-all">{u.email}</span>],
              ["Created", formatDate(u.createdAt)],
              ["Last login", seen(u.lastLoginAt)],
              ["Active sessions", String(ws.activeSessions)],
              ["Two-step", u.mfaEnabled ? "On" : "Off"],
            ]}
          />
          <div className="mt-5">
            <ActionForm action={updateUserProfile} submit="Save profile" variant="outline" hidden={{ id: u.id }}>
              <Field name="name" label="Full name" defaultValue={u.name} maxLength={80} />
              <Field name="title" label="Title" defaultValue={u.title ?? ""} optional maxLength={80} />
              <Field name="phone" label="Mobile" type="tel" defaultValue={u.phone ?? ""} optional maxLength={20} />
            </ActionForm>
          </div>
        </section>

        {/* Access */}
        <section className="min-w-0 lg:px-7">
          <SubHead>Access</SubHead>
          <p className="mt-1 text-[13px] text-muted">{ws.permissions.length} permissions · {u.extraPermissions.length} extra. <Link href={`/academy/admin/permissions?user=${u.id}#grants`} className="font-medium text-blue hover:text-ink">Edit extra permissions</Link></p>
          {!self && (
            <div className="mt-4">
              <ActionForm action={changeUserRole} submit="Assign role" variant="outline" hidden={{ id: u.id }} confirm={`Change ${u.name}'s role? Their permissions change immediately.`}>
                <Select name="role" label="Role" options={ROLE_OPTIONS} defaultValue={u.role} />
              </ActionForm>
            </div>
          )}
          <div className="mt-6 rounded-xl border border-line p-4">
            <p className="text-[14px] font-medium">Reset password</p>
            <p className="mt-1 text-[12.5px] text-muted">Generates a temporary password (shown once) and signs them out everywhere.</p>
            {self ? (
              <p className="mt-3 text-[13px] text-muted">Use “Forgot password” on the sign-in page for your own account.</p>
            ) : (
              <div className="mt-3">
                <ActionForm action={resetUserPassword} submit="Reset password" variant="outline" submitIcon="lock" hidden={{ id: u.id }} confirm={`Reset ${u.name}'s password and sign them out?`} />
              </div>
            )}
          </div>
          {!self && (
            <div className="mt-4 rounded-xl border border-line p-4">
              <p className="text-[14px] font-medium">{u.status === "disabled" ? "Account disabled" : "Disable account"}</p>
              <p className="mt-1 text-[12.5px] text-muted">{u.status === "disabled" ? "They can’t sign in. Enabling restores their access." : "Blocks sign-in and ends every active session immediately."}</p>
              <div className="mt-3">
                {u.status === "disabled" ? (
                  <ActionButton action={setUserStatus} fields={{ id: u.id, status: "active" }} label="Enable account" icon="check" />
                ) : (
                  <ActionButton action={setUserStatus} fields={{ id: u.id, status: "disabled" }} label="Disable account" icon="lock" confirm={`Disable ${u.name}? They will be signed out everywhere.`} />
                )}
              </div>
            </div>
          )}
        </section>

        {/* Assignments */}
        <section className="min-w-0 lg:pl-7">
          <SubHead>Assignments</SubHead>
          {u.role === "faculty" && (
            <>
              <p className="label mt-4 !text-[10px]">Courses taught</p>
              {ws.courses.length === 0 ? <p className="mt-2 text-[13.5px] text-muted">No courses yet.</p> : (
                <ul className="mt-2 divide-y divide-line">
                  {ws.courses.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0 text-[13.5px]"><span className="font-mono text-[11.5px] text-muted">{c.code}</span> <span className="block truncate">{c.title}</span></span>
                      <ActionButton action={assignCourseToFaculty} fields={{ userId: u.id, courseId: c.id, mode: "remove" }} label="Remove" variant="ghost" confirm={`Remove ${u.name} from ${c.title}?`} />
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3">
                <ActionForm action={assignCourseToFaculty} submit="Assign course" variant="outline" hidden={{ userId: u.id, mode: "add" }}>
                  <Select name="courseId" label="Add a course" placeholder="Choose a course" options={allCourses().filter((c) => !c.facultyIds.includes(u.id) && c.status !== "archived").map((c) => ({ value: c.id, label: `${c.code} · ${c.title}` }))} />
                </ActionForm>
              </div>
            </>
          )}
          {(u.role === "faculty" || u.role === "student") && (
            <>
              <p className="label mt-6 !text-[10px]">{u.role === "student" ? "Enrolment" : "Batches"}</p>
              {ws.batches.length === 0 ? <p className="mt-2 text-[13.5px] text-muted">Not in any batch.</p> : (
                <ul className="mt-2 divide-y divide-line">
                  {ws.batches.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-3 py-2">
                      <Link href={`/academy/admin/batches/${b.id}`} className="min-w-0 text-[13.5px] hover:text-blue"><span className="block truncate">{b.name}</span><span className="block text-[12px] text-muted">{programName(b.programId)}</span></Link>
                      {u.role === "faculty" ? (
                        <ActionButton action={assignUserToBatch} fields={{ userId: u.id, batchId: b.id, mode: "remove" }} label="Remove" variant="ghost" />
                      ) : <StatusPill status={b.status} />}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3">
                <ActionForm action={assignUserToBatch} submit={u.role === "student" ? "Assign batch" : "Add to batch"} variant="outline" hidden={{ userId: u.id, mode: "add" }}>
                  <Select
                    name="batchId"
                    label={u.role === "student" ? "Enrol in batch" : "Teach a batch"}
                    placeholder="Choose a batch"
                    hint={u.role === "student" ? "Moving batches pauses the previous enrolment." : undefined}
                    options={batches.filter((b) => !ws.batches.some((x) => x.id === b.id)).map((b) => ({ value: b.id, label: `${b.name}${b.full && u.role === "student" ? " (full)" : ""}`, disabled: b.full && u.role === "student" }))}
                  />
                </ActionForm>
              </div>
            </>
          )}
          {(u.role === "marketing" || u.role === "admin") && (
            <p className="mt-3 rounded-xl bg-mist px-4 py-4 text-[13.5px] text-muted">{ROLES[u.role].label} accounts don’t teach or study, so they have no course or batch assignments.</p>
          )}
          {ws.recent.length > 0 && (
            <>
              <p className="label mt-6 !text-[10px]">Recent activity</p>
              <ul className="mt-2 space-y-1.5">
                {ws.recent.map((a) => (
                  <li key={`${a.id}-${a.at}`} className="flex items-center justify-between gap-3 text-[12.5px]">
                    <span className="truncate font-mono">{a.action}</span>
                    <span className="shrink-0 font-mono text-[11px] text-muted">{relative(a.at)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </ManagePanel>
  );
}
