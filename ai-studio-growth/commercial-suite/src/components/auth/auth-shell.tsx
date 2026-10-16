import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

/** Two-column branded frame used by sign-in, MFA and invitation screens. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-navy-900 p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -top-40 -right-40 size-[520px] rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -bottom-48 -left-24 size-[420px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative">
          <div className="text-[11px] font-semibold tracking-[0.26em] text-indigo-200 uppercase">Infinitia Hub × AI Studio Craft</div>
          <h1 className="mt-6 max-w-lg font-display text-4xl leading-tight font-bold">AI Studio Quote Studio</h1>
          <p className="mt-4 max-w-md text-indigo-100/80">Premium proposals, quotations, GST invoices and proforma invoices — sent by email and WhatsApp, with every payment tracked.</p>
        </div>
        <ul className="relative mt-auto grid max-w-md gap-3 text-sm text-indigo-100/80">
          <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-brand-300" /> Invite-only access with authenticator-app MFA</li>
          <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-brand-300" /> Decimal-safe GST calculations</li>
          <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-brand-300" /> Encrypted integration credentials</li>
        </ul>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="text-[11px] font-semibold tracking-[0.2em] text-brand-600 uppercase">Infinitia Hub × AI Studio Craft</div>
            <div className="mt-1 font-display text-2xl font-bold">AI Studio Quote Studio</div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-6 flex items-center gap-1.5" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1.5 rounded-full transition-all ${i + 1 === step ? "w-8 bg-brand-600" : i + 1 < step ? "w-4 bg-brand-300" : "w-4 bg-line"}`} />
      ))}
    </div>
  );
}
