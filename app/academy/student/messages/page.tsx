import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/session";
import { announcementsFor, userName } from "@/server/repositories/learning";
import { myCommunications, myFaculty } from "@/server/repositories/student";
import { formatDateTime, relative } from "@/lib/platform/format";
import type { CommChannel } from "@/lib/platform/types";
import { Avatar, EmptyState, PageHeader, Panel, Pill, StatusPill } from "@/components/academy/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import { MessageFacultyForm } from "@/components/academy/student/MessageFacultyForm";

export const metadata: Metadata = { title: "Messages · EMC Academy" };

const CHANNEL: Record<CommChannel, { label: string; icon: IconName }> = {
  email: { label: "Email", icon: "mail" },
  whatsapp: { label: "WhatsApp", icon: "whatsapp" },
  sms: { label: "SMS", icon: "phone" },
  in_app: { label: "In-app", icon: "bell" },
};

export default async function MessagesPage() {
  const user = await requirePermission("learning.access");
  const news = announcementsFor(user);
  const history = myCommunications(user.id);
  const { batch, faculty } = myFaculty(user.id);

  return (
    <div className="space-y-5">
      <PageHeader label="Plan" title="Messages" intro="Announcements from the academy, everything we’ve sent you, and a direct line to your faculty." />

      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <div className="min-w-0 space-y-5">
          <Panel title="Announcements" label={`${news.length} for you`}>
            {news.length === 0 ? (
              <EmptyState icon="megaphone" title="No announcements" text="Announcements from your faculty and the academy will appear here." />
            ) : (
              <ul className="divide-y divide-line">
                {news.map((n) => (
                  <li key={n.id} className="flex gap-3.5 py-4 first:pt-0 last:pb-0">
                    <Avatar name={userName(n.createdBy)} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[15px] font-semibold">{n.title}</p>
                        {n.audience === "batch" && <Pill tone="info">Your batch</Pill>}
                      </div>
                      <p className="mt-1 text-[14px] leading-relaxed text-ink/80">{n.body}</p>
                      <p className="mt-1.5 font-mono text-[11px] text-muted">{userName(n.createdBy)} · {relative(n.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Communication history" label="Sent to you and by you">
            {history.length === 0 ? (
              <EmptyState icon="message" title="No messages yet" text="Emails, WhatsApp reminders and in-app messages about your learning will be listed here." />
            ) : (
              <ul className="divide-y divide-line">
                {history.map((c, i) => {
                  const ch = CHANNEL[c.channel];
                  const mine = c.direction === "inbound";
                  return (
                    <li key={`${c.id}-${i}`} className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${mine ? "bg-ink text-white" : "bg-soft text-blue"}`}><Icon name={mine ? "arrow" : ch.icon} size={15} className={mine ? "-rotate-45" : undefined} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] leading-snug">{c.preview}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted">
                          <span>{mine ? "You · " : ""}{ch.label}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatDateTime(c.createdAt)}</span>
                        </p>
                      </div>
                      <StatusPill status={c.status} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        <aside className="min-w-0 space-y-5">
          <Panel title="Message my faculty" label={batch?.name}>
            {faculty.length === 0 ? (
              <p className="rounded-xl bg-mist px-4 py-5 text-[14px] text-muted">You’ll be able to message faculty once you’re assigned to a batch.</p>
            ) : (
              <>
                <ul className="mb-5 flex flex-wrap gap-2">
                  {faculty.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-[12.5px]">
                      <Avatar name={f.name} size={26} /> {f.name}
                    </li>
                  ))}
                </ul>
                <MessageFacultyForm faculty={faculty} />
              </>
            )}
          </Panel>
          <p className="flex gap-2 px-1 text-[12px] leading-relaxed text-muted">
            <Icon name="shield" size={14} className="mt-0.5 shrink-0" /> Please don’t share real patient details in messages. Use the fictional cases from your course.
          </p>
        </aside>
      </div>
    </div>
  );
}
