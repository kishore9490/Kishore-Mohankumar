"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db/store";
import { requireUser } from "@/server/auth/session";
import type { CommChannel, NotificationCategory } from "@/lib/platform/types";
import { audit } from "@/server/services/audit";

export async function markAllNotificationsRead() {
  const u = await requireUser();
  const now = new Date().toISOString();
  for (const n of db().notifications) if (n.userId === u.id && !n.readAt) n.readAt = now;
  revalidatePath("/academy", "layout");
}

const CATS: NotificationCategory[] = ["learning", "announcements", "payments", "marketing", "system"];
const CHANNELS: CommChannel[] = ["in_app", "email", "whatsapp", "sms"];

/** Security notices are mandatory and are not part of this form. */
export async function saveNotificationPreferences(form: FormData) {
  const u = await requireUser();
  const prefs = db().notificationPrefs;
  for (const category of CATS)
    for (const channel of CHANNELS) {
      const enabled = form.get(`${category}:${channel}`) === "on";
      const existing = prefs.find((p) => p.userId === u.id && p.category === category && p.channel === channel);
      if (existing) existing.enabled = enabled;
      else prefs.push({ userId: u.id, category, channel, enabled });
    }
  await audit({ user: u, action: "settings.notifications.updated", objectType: "User", objectId: u.id });
  revalidatePath("/academy/profile");
}
