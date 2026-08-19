'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Brand'
import { signIn } from '@/lib/actions'

export default function SignIn() {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <div className="grid min-h-screen place-items-center px-6 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex justify-center"><Logo size={26} tone="dark" /></div>
        <div className="card p-7">
          <h1 className="text-[20px] font-bold">Sign in</h1>
          <form
            className="mt-6 space-y-4"
            action={async (fd) => {
              setBusy(true); setError(null)
              const res = await signIn(fd)
              if (res?.error) { setError(res.error); setBusy(false) }
            }}
          >
            <div>
              <label className="label mb-1.5 block" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="input" required />
            </div>
            <div>
              <label className="label mb-1.5 block" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className="input" required />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>}
            <button className="btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <div className="mt-5 rounded-lg bg-canvas p-3 text-[12.5px] text-ink-dim">
            <p className="font-semibold text-ink">Demo account</p>
            <p className="mt-1 font-mono">priya@abc.example · demo1234</p>
          </div>
          <p className="mt-4 text-center text-[13px] text-ink-dim">
            No account? <Link href="/signup" className="font-semibold text-brand">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
