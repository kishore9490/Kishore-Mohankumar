import type { Metadata } from "next";
import { ResetForm } from "@/components/auth/ResetForm";

export const metadata: Metadata = { title: "Choose a new password · EMC Academy", robots: { index: false } };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <div className="w-full max-w-[420px]">
      <p className="label !text-cyan-ink">EMC Academy</p>
      <h1 className="heading mt-4 text-[40px]">Choose a new password.</h1>
      <p className="mt-3 text-[16px] text-muted">At least 10 characters, with letters and numbers. You’ll be signed out everywhere else.</p>
      <div className="mt-8"><ResetForm token={token} /></div>
    </div>
  );
}
