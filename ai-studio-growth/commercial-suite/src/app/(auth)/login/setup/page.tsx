import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, readChallengeCookie } from "@/lib/auth/session";
import { enrollmentSecret } from "@/lib/auth/accounts";
import { otpauthUrl } from "@/lib/auth/totp";
import { AuthShell, StepDots } from "@/components/auth/auth-shell";
import { EnrollForm } from "@/components/auth/enroll-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Set up two-step verification · AI Studio Quote Studio" };

export default async function SetupMfaPage({ searchParams }: { searchParams: Promise<{ next?: string; welcome?: string }> }) {
  const data = await enrollmentSecret(prisma, await readChallengeCookie());
  const { next, welcome } = await searchParams;
  if (!data) {
    // Just finished enrolment (the session cookie refreshes this page): keep the form mounted so the
    // recovery codes stay on screen. Anyone else without a setup session goes back to sign in.
    const user = await getCurrentUser();
    if (!user) redirect("/login?expired=1");
    return (
      <AuthShell>
        <StepDots step={welcome ? 3 : 2} total={welcome ? 3 : 2} />
        <h2 className="font-display text-xl font-bold text-ink">Two-step verification is on</h2>
        <p className="mt-1 mb-6 text-sm text-muted">Your account is protected by your authenticator app.</p>
        <EnrollForm secret="" qrDataUrl="" next={next} completed />
      </AuthShell>
    );
  }
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl(data.secret, data.email), { margin: 1, width: 360, color: { dark: "#0D1235", light: "#FFFFFF" } });
  return (
    <AuthShell>
      <StepDots step={2} total={welcome ? 3 : 2} />
      <h2 className="font-display text-xl font-bold text-ink">{welcome ? `Welcome, ${data.name.split(" ")[0]}` : "Set up two-step verification"}</h2>
      <p className="mt-1 mb-6 text-sm text-muted">Two-step verification is required for every account. It takes about a minute.</p>
      <EnrollForm secret={data.secret} qrDataUrl={qrDataUrl} next={next} />
    </AuthShell>
  );
}
