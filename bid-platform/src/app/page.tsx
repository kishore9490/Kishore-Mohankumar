import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, ShieldCheck, Network, FileCheck2 } from 'lucide-react'
import { Logo, CheckBadge } from '@/components/Brand'
import { currentPrincipal } from '@/lib/auth'

export default async function Home() {
  if (await currentPrincipal()) redirect('/dashboard')

  return (
    <div className="min-h-screen">
      <header className="bg-navy">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <Logo size={24} tone="light" />
          <div className="ml-auto flex items-center gap-3">
            <Link href="/signin" className="text-[13.5px] text-white/85 hover:text-white">Sign in</Link>
            <Link href="/signup" className="btn bg-verify text-white hover:bg-verify-bright">Get started</Link>
          </div>
        </div>
      </header>

      <section className="bg-navy pb-20 pt-10">
        <div className="mx-auto max-w-6xl px-6">
          <span className="pill bg-white/10 text-white/85">Verify · Assess · Build Trust</span>
          <h1 className="mt-5 max-w-[20ch] text-[42px] font-bold leading-[1.08] tracking-[-0.02em] text-white">
            Verify the businesses and people your organization does business with.
          </h1>
          <p className="mt-5 max-w-[62ch] text-[16px] leading-relaxed text-white/75">
            Define what verified means for each relationship, invite your counterparties,
            and get an evidence-backed record you can defend to an auditor.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/signup" className="btn bg-verify text-white hover:bg-verify-bright">
              Create a workspace <ArrowRight size={15} />
            </Link>
            <Link href="/signin" className="btn border border-white/20 text-white hover:bg-white/10">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: FileCheck2, title: 'Your policy, not ours', body: 'Define the checks, thresholds and expiry that count as verified for each relationship type. Industry differences are configuration.' },
            { icon: ShieldCheck, title: 'Evidence, not opinions', body: 'Every result carries its source, method, timestamp and scope. BID never says a company is trustworthy — it shows you what was verified.' },
            { icon: Network, title: 'Invited counterparties join free', body: 'The organization being verified never pays. They keep a reusable profile and can verify their own network when they choose to.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="card p-5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-verify-soft">
                <Icon size={17} className="text-verify" />
              </span>
              <h3 className="mt-3 text-[15px] font-bold">{title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-dim">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 card flex flex-wrap items-center gap-4 p-5">
          <CheckBadge size={22} />
          <p className="text-[13.5px] text-ink-dim">
            Every verified organization gets a public profile at{' '}
            <code className="rounded bg-canvas px-1.5 py-0.5 font-mono text-[12.5px]">/p/BID-BUS-…</code>{' '}
            where BID-verified information is kept structurally separate from company-provided information.
          </p>
        </div>
      </section>
    </div>
  )
}
