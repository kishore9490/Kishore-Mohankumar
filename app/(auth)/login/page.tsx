import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { isDemoMode } from "@/server/db/store";
import { DEMO_ACCOUNTS } from "@/server/db/seed";
import { ROLES } from "@/lib/platform/rbac";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Login · EMC Academy", robots: { index: false }, alternates: { canonical: "/login" } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(ROLES[user.role].home);
  const notice = sp.expired ? "Your session ended. Please sign in again." : sp.signedout ? "You’ve signed out." : sp.reset ? "Password updated. Sign in with your new password." : null;
  return (
    <div className="w-full max-w-[420px]">
      <p className="label !text-cyan-ink">EMC Academy</p>
      <h1 className="heading mt-4 text-[40px] md:text-5xl">Welcome to EMC Academy.</h1>
      <p className="mt-3 text-[16px] text-muted">Sign in to continue. You’ll go straight to your own dashboard.</p>
      {notice && <p role="status" className="mt-6 rounded-xl bg-soft px-4 py-3 text-[14px]">{notice}</p>}
      <div className="mt-8">
        <LoginForm next={sp.next ?? ""} demoAccounts={isDemoMode() ? DEMO_ACCOUNTS.map((a) => ({ ...a, label: ROLES[a.role].label })) : []} />
      </div>
    </div>
  );
}
