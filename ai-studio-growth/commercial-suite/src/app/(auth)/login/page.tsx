import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthShell, StepDots } from "@/components/auth/auth-shell";
import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; expired?: string }> }) {
  if (await getCurrentUser()) redirect("/");
  const { next, expired } = await searchParams;
  return (
    <AuthShell>
      <StepDots step={1} total={2} />
      <h2 className="font-display text-xl font-bold text-ink">Sign in</h2>
      <p className="mt-1 text-sm text-muted">Invite-only access. You will be asked for a code from your authenticator app next.</p>
      {expired && <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200">Your verification step expired. Please sign in again.</p>}
      <LoginForm next={next} />
      <p className="mt-6 text-xs text-muted">No account? Ask an administrator to invite you — invitations arrive as a secure link.</p>
    </AuthShell>
  );
}
