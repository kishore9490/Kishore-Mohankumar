import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/ForgotForm";

export const metadata: Metadata = { title: "Reset password · EMC Academy", robots: { index: false } };

export default function ForgotPage() {
  return (
    <div className="w-full max-w-[420px]">
      <p className="label !text-cyan-ink">EMC Academy</p>
      <h1 className="heading mt-4 text-[40px]">Reset your password.</h1>
      <p className="mt-3 text-[16px] text-muted">Enter the email on your EMC account. We’ll send a link that works for 30 minutes.</p>
      <div className="mt-8"><ForgotForm /></div>
    </div>
  );
}
