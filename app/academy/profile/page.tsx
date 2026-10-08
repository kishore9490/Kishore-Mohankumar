import { requireUser } from "@/server/auth/session";
import { db } from "@/server/db/store";
import { channelEnabled } from "@/server/services/notifications";
import { saveNotificationPreferences } from "@/server/actions/common";
import { logoutAction } from "@/server/actions/auth";
import { ROLES } from "@/lib/platform/rbac";
import { Avatar, PageHeader, Panel, Pill } from "@/components/academy/ui";
import { Button } from "@/components/ui/Button";
import type { CommChannel, NotificationCategory } from "@/lib/platform/types";

const CATS: { key: NotificationCategory; label: string; hint: string }[] = [
  { key: "learning", label: "Learning", hint: "Classes, assignments, assessments, certificates" },
  { key: "announcements", label: "Announcements", hint: "News from faculty and the academy" },
  { key: "payments", label: "Payments", hint: "Invoices and instalment reminders" },
  { key: "marketing", label: "Marketing", hint: "Programs, events and offers" },
  { key: "system", label: "System", hint: "Platform updates and alerts" },
];
const CHANNELS: { key: CommChannel; label: string }[] = [
  { key: "in_app", label: "In-app" },
  { key: "email", label: "Email" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "sms", label: "SMS" },
];

export default async function ProfilePage() {
  const user = await requireUser();
  const u = db().users.find((x) => x.id === user.id)!;
  return (
    <>
      <PageHeader label="Profile & settings" title="Your account." />
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Profile">
          <div className="flex items-center gap-4">
            <Avatar name={u.name} size={56} tone="ink" />
            <div>
              <p className="text-[18px] font-semibold">{u.name}</p>
              <p className="text-[14px] text-muted">{u.title}</p>
            </div>
          </div>
          <dl className="mt-6 grid gap-3 text-[14px]">
            {[["Email", u.email], ["Mobile", u.phone ?? "—"], ["Role", ROLES[u.role].label], ["Two-step verification", u.mfaEnabled ? "Required for this role" : "Not enabled"]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-dashed border-line pb-2.5">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <form action={logoutAction} className="mt-6">
            <Button type="submit" variant="outline" size="sm" iconLeft="logout">Log out</Button>
          </form>
        </Panel>

        <Panel title="Notification preferences" id="notifications" action={<Pill tone="info">Security alerts are always on</Pill>}>
          <form action={saveNotificationPreferences}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] text-[14px]">
                <caption className="sr-only">Choose how you hear about each kind of update</caption>
                <thead>
                  <tr>
                    <th scope="col" className="label !text-[10px] pb-3 text-left font-normal">Category</th>
                    {CHANNELS.map((c) => <th key={c.key} scope="col" className="label !text-[10px] pb-3 font-normal">{c.label}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {CATS.map((cat) => (
                    <tr key={cat.key}>
                      <th scope="row" className="py-3 pr-3 text-left font-normal">
                        <span className="block font-medium">{cat.label}</span>
                        <span className="block text-[12.5px] text-muted">{cat.hint}</span>
                      </th>
                      {CHANNELS.map((ch) => (
                        <td key={ch.key} className="text-center">
                          <input type="checkbox" name={`${cat.key}:${ch.key}`} defaultChecked={channelEnabled(u.id, cat.key, ch.key)} className="h-4 w-4 accent-[var(--color-blue)]" aria-label={`${cat.label} by ${ch.label}`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button type="submit" size="sm" className="mt-5">Save preferences</Button>
          </form>
        </Panel>
      </div>
    </>
  );
}
