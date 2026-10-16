import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AuthShell } from "@/components/auth/auth-shell";
import { BootstrapForm } from "@/components/auth/bootstrap-form";
import { buttonClass } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "First-time setup · AI Studio Quote Studio", robots: { index: false, follow: false } };

export default async function SetupPage() {
  const available = (process.env.SETUP_TOKEN ?? "").length >= 16 && (await prisma.user.count()) === 0;
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
          <p className="mt-2 text-sm text-muted">Either the app is already set up, or no SETUP_TOKEN is configured. Sign in, or ask an administrator for an invitation.</p>
          <Link href="/login" className={buttonClass({ className: "mt-6" })}>Go to sign in</Link>
        </>
      )}
    </AuthShell>
  );
}
