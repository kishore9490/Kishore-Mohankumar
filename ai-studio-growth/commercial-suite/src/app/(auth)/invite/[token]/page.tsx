import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { resolveInvitation } from "@/lib/auth/accounts";
import { AuthShell, StepDots } from "@/components/auth/auth-shell";
import { AcceptInviteForm } from "@/components/auth/accept-invite-form";
import { buttonClass } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Accept invitation · AI Studio Quote Studio", robots: { index: false, follow: false } };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await resolveInvitation(prisma, token);
  if (!inv) {
    return (
      <AuthShell>
        <h2 className="font-display text-xl font-bold text-ink">This invitation is no longer valid</h2>
        <p className="mt-2 text-sm text-muted">The link may have expired, been replaced by a newer invitation, or already been used. Ask an administrator to send you a new invitation.</p>
        <Link href="/login" className={buttonClass({ className: "mt-6" })}>Go to sign in</Link>
      </AuthShell>
    );
  }
  return (
    <AuthShell>
      <StepDots step={1} total={3} />
      <h2 className="font-display text-xl font-bold text-ink">You&apos;re invited</h2>
      <p className="mt-1 mb-6 text-sm text-muted">
        {inv.user.name} · <span className="text-ink">{inv.user.email}</span><br />
        Set a password, then connect an authenticator app. This link expires {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(inv.expiresAt)}.
      </p>
      <AcceptInviteForm token={token} />
    </AuthShell>
  );
}
