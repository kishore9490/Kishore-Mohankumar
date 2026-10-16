import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { describeDbError } from "@/lib/db-health";
import { AuthShell } from "@/components/auth/auth-shell";
import { BootstrapForm } from "@/components/auth/bootstrap-form";
import { buttonClass } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "First-time setup · AI Studio Quote Studio", robots: { index: false, follow: false } };

export default async function SetupPage() {
  const tokenOk = (process.env.SETUP_TOKEN ?? "").length >= 16;
  let users = 0;
  try {
    users = await prisma.user.count();
  } catch (e) {
    const err = describeDbError(e);
    return (
      <AuthShell>
        <h2 className="font-display text-xl font-bold text-ink">Database connection problem</h2>
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200" role="alert">
          <div className="font-semibold">{err.title}</div>
          <p className="mt-1">{err.detail}</p>
        </div>
        <p className="mt-4 text-xs text-muted">After fixing the environment variable, redeploy or restart the app and reload this page.</p>
      </AuthShell>
    );
  }
  const available = tokenOk && users === 0;
  return (
    <AuthShell>
      {available ? (
        <>
          <h2 className="font-display text-xl font-bold text-ink">First-time setup</h2>
          <p className="mt-1 mb-6 text-sm text-muted">Create the first administrator. You will then set a password and connect your authenticator app.</p>
          <BootstrapForm />
        </>
      ) : (
        <>
          <h2 className="font-display text-xl font-bold text-ink">Setup is not available</h2>
          <p className="mt-2 text-sm text-muted">{users > 0 ? "The app is already set up. Sign in, or ask an administrator for an invitation." : "SETUP_TOKEN is missing or shorter than 16 characters. Add it in the hosting environment variables and restart the app."}</p>
          <Link href="/login" className={buttonClass({ className: "mt-6" })}>Go to sign in</Link>
        </>
      )}
    </AuthShell>
  );
}
