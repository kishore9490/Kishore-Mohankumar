import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LayoutGrid, FileCheck2, Send, LogOut } from 'lucide-react'
import { Logo } from '@/components/Brand'
import { currentPrincipal } from '@/lib/auth'
import { signOut } from '@/lib/actions'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const p = await currentPrincipal()
  if (!p) redirect('/signin')

  const nav = [
    { href: '/dashboard', label: 'Overview', icon: LayoutGrid },
    { href: '/dashboard/policies', label: 'Policies', icon: FileCheck2 },
    { href: '/dashboard/campaigns', label: 'Campaigns', icon: Send },
  ]

  return (
    <div className="min-h-screen">
      <header className="bg-navy">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-3.5">
          <Logo size={22} tone="light" />
          <span className="h-5 w-px bg-white/15" />
          <span className="text-[13px] text-white/70">{p.workspaceName}</span>
          <span className="ml-auto flex items-center gap-4">
            <span className="hidden text-right sm:block">
              <span className="block text-[12.5px] text-white">{p.name}</span>
              <span className="block font-mono text-[10.5px] text-white/55">{p.organizationBidId}</span>
            </span>
            <form action={signOut}>
              <button className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-[12.5px] text-white/85 hover:bg-white/10">
                <LogOut size={13} /> Sign out
              </button>
            </form>
          </span>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-6">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2 border-b-2 border-transparent px-3 py-2.5 text-[13px] text-white/75 hover:border-verify hover:text-white">
              <Icon size={14} /> {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
