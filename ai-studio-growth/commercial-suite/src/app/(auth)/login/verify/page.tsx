import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, readChallengeCookie } from "@/lib/auth/session";
import { getChallenge } from "@/lib/auth/accounts";
import { AuthShell, StepDots } from "@/components/auth/auth-shell";
import { VerifyForm } from "@/components/auth/verify-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verify · AI Studio Quote Studio" };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const challenge = await getChallenge(prisma, await readChallengeCookie(), "LOGIN");
  const { next } = await searchParams;
  // Right after a successful code the session cookie refreshes this page — keep the form mounted for the success animation.
  const signedIn = !challenge ? await getCurrentUser() : null;
  if (!challenge && !signedIn) redirect("/login?expired=1");
  return (
    <AuthShell>
      <StepDots step={2} total={2} />
      <h2 className="font-display text-xl font-bold text-ink">Two-step verification</h2>
      <p className="mt-1 mb-6 text-sm text-muted">This keeps customer and commercial data safe even if a password leaks.</p>
      <VerifyForm next={next} email={challenge?.user.email ?? signedIn!.email} signedIn={!challenge} />
    </AuthShell>
  );
}
