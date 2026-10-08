import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

/** Sign-in screens: same brand, no marketing chrome. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-[100svh] lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:p-12" aria-hidden="true">
        <div className="grid-bg-dark absolute inset-0" />
        <div className="absolute -right-32 top-1/3 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(18,181,212,.22),transparent_62%)]" />
        <div className="relative"><Logo invert /></div>
        <div className="relative">
          <p className="label !text-white/50">EMC Academy</p>
          <p className="display mt-6 text-6xl xl:text-7xl">
            Learn. Practice.<br /><span className="text-cyan">Become a coder.</span>
          </p>
          <ol className="mt-12 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">
            {["Lessons", "Coding Lab", "Assessments", "Certificate"].map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <span className={i === 1 ? "rounded-full border border-cyan px-3 py-1 text-white" : "rounded-full border border-white/15 px-3 py-1"}>{s}</span>
                {i < 3 && <span className="text-white/30">→</span>}
              </li>
            ))}
          </ol>
        </div>
        <p className="relative text-[12.5px] text-white/40">Experts Medical Coding Academy · Educational platform. Not a healthcare service.</p>
      </aside>
      <main id="main" className="flex flex-col">
        <div className="flex items-center justify-between px-5 py-5 md:px-10">
          <span className="lg:hidden"><Logo /></span>
          <Link href="/" className="ml-auto text-[13.5px] font-medium text-muted hover:text-ink">← Back to website</Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-16 md:px-10">{children}</div>
      </main>
    </div>
  );
}
