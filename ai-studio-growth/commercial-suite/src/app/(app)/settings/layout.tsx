import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth/session";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <div className="mb-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">Everything is configured here in the app — company, email, WhatsApp, templates, users and security.</p>
      </div>
      <div className="mt-5"><SettingsTabs isAdmin={user.role === "ADMIN"} /></div>
      {children}
    </>
  );
}
