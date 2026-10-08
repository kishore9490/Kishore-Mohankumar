import { requireUser } from "@/server/auth/session";
import { notificationsFor } from "@/server/repositories/learning";
import { markAllNotificationsRead } from "@/server/actions/common";
import { EmptyState, PageHeader, Pill, humanize } from "@/components/academy/ui";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/platform/format";
import Link from "next/link";

export default async function NotificationsPage() {
  const user = await requireUser();
  const list = notificationsFor(user.id);
  return (
    <>
      <PageHeader
        label="Notifications"
        title="Everything that needs you."
        actions={list.some((n) => !n.readAt) ? <form action={markAllNotificationsRead}><Button type="submit" variant="outline" size="sm">Mark all as read</Button></form> : undefined}
      />
      {list.length === 0 ? (
        <EmptyState icon="bell" title="No notifications yet" text="Updates about your classes, work and the academy will appear here." />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {list.map((n) => (
            <li key={n.id}>
              <Link href={n.href ?? "#"} className="flex gap-4 px-5 py-4 hover:bg-mist/50">
                <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${n.readAt ? "bg-line" : "bg-cyan"}`} aria-label={n.readAt ? "Read" : "Unread"} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-medium">{n.title}</span>
                    <Pill>{humanize(n.category)}</Pill>
                  </span>
                  <span className="mt-0.5 block text-[14px] text-muted">{n.body}</span>
                </span>
                <span className="shrink-0 font-mono text-[11px] text-muted">{formatDateTime(n.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
