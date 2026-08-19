'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Brand'
import { signUp } from '@/lib/actions'

export default function SignUp() {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <div className="grid min-h-screen place-items-center px-6 py-12">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex justify-center"><Logo size={26} tone="dark" /></div>
        <div className="card p-7">
          <h1 className="text-[20px] font-bold">Create your workspace</h1>
          <p className="mt-1.5 text-[13.5px] text-ink-dim">
            Your organization gets a BID ID. You can start verifying counterparties straight away.
          </p>
          <form
            className="mt-6 space-y-4"
            action={async (fd) => {
              setBusy(true); setError(null)
              const res = await signUp(fd)
              if (res?.error) { setError(res.error); setBusy(false) }
            }}
          >
            <div>
              <label className="label mb-1.5 block" htmlFor="orgName">Organization</label>
              <input id="orgName" name="orgName" className="input" placeholder="ABC Technologies Pvt Ltd" required />
            </div>
            <div>
              <label className="label mb-1.5 block" htmlFor="name">Your name</label>
              <input id="name" name="name" className="input" placeholder="Priya Nair" required />
            </div>
            <div>
              <label className="label mb-1.5 block" htmlFor="email">Work email</label>
              <input id="email" name="email" type="email" className="input" placeholder="priya@abc.example" required />
            </div>
            <div>
              <label className="label mb-1.5 block" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className="input" minLength={8} required />
              <p className="mt-1 text-[11.5px] text-ink-faint">At least 8 characters.</p>
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>}
            <button className="btn-verify w-full" disabled={busy}>
              {busy ? 'Creating…' : 'Create workspace'}
            </button>
          </form>
          <p className="mt-5 text-center text-[13px] text-ink-dim">
            Already have an account? <Link href="/signin" className="font-semibold text-brand">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
