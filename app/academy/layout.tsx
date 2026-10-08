import type { Metadata } from "next";
import { requireUser } from "@/server/auth/session";
import { isDemoMode } from "@/server/db/store";
import { notificationsFor } from "@/server/repositories/learning";
import { AppShell } from "@/components/academy/AppShell";

export const metadata: Metadata = { title: "EMC Academy", robots: { index: false, follow: false } };

/** Every academy request is authenticated here, on the server. */
export default async function AcademyLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const notices = notificationsFor(user.id).slice(0, 8).map((n) => ({ id: n.id, title: n.title, body: n.body, href: n.href, createdAt: n.createdAt, read: !!n.readAt }));
  return (
    <AppShell user={user} notices={notices} demo={isDemoMode()}>
      {children}
    </AppShell>
  );
}
