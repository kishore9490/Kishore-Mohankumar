import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getCurrentUser()) redirect("/");
  const { next } = await searchParams;
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-navy-900 p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -top-40 -right-40 size-[520px] rounded-full bg-brand-600/30 blur-3xl" />
        <div className="relative">
          <div className="text-[11px] font-semibold tracking-[0.26em] text-indigo-200 uppercase">Infinitia Hub × AI Studio Craft</div>
          <h1 className="mt-6 max-w-lg font-display text-4xl leading-tight font-bold">Commercial Suite</h1>
          <p className="mt-4 max-w-md text-indigo-100/80">Create premium proposals, quotations, tax invoices and proforma invoices — and track every payment and message in one place.</p>
        </div>
        <ul className="relative mt-auto grid max-w-md gap-3 text-sm text-indigo-100/80">
          <li>• Decimal-safe GST calculations (CGST/SGST/IGST)</li>
          <li>• Professionally typeset, downloadable PDFs</li>
          <li>• Brevo email and WhatsApp Business delivery</li>
        </ul>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="text-[11px] font-semibold tracking-[0.2em] text-brand-600 uppercase">Infinitia Hub × AI Studio Craft</div>
            <div className="mt-1 font-display text-2xl font-bold">Commercial Suite</div>
          </div>
          <h2 className="font-display text-xl font-bold text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-muted">Internal access only. Accounts are created by an administrator.</p>
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
