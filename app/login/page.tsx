import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/student/LoginForm";
import { CampusPreview } from "@/components/student/CampusPreview";

export const metadata: Metadata = { title: "Student Login · EMC", robots: { index: false }, alternates: { canonical: "/login" } };

export default function LoginPage() {
  return (
    <section className="relative overflow-hidden py-14 md:py-24">
      <div className="container-x grid items-center gap-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="mx-auto w-full max-w-md lg:mx-0">
          <p className="label !text-cyan-ink">Student login</p>
          <h1 className="heading mt-4 text-5xl">Welcome back.</h1>
          <p className="mt-4 text-[16px] text-muted">Sign in to your EMC learning space.</p>
          <div className="mt-10"><LoginForm /></div>
          <p className="mt-8 text-[14px] text-muted">
            Not a student yet? <Link href="/demo" className="font-medium text-blue">Book a free demo</Link>
          </p>
        </div>
        <CampusPreview className="hidden lg:block lg:-mr-24" />
      </div>
    </section>
  );
}
