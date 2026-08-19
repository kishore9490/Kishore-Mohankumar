'use client'
import { useState } from 'react'
import { CHECK_CATALOG } from '@/lib/providers/mock'
import { createPolicy } from '@/lib/actions'

const CHECKS = Object.values(CHECK_CATALOG)

export default function NewPolicy() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(['CORPORATE_IDENTITY', 'PAN_VERIFICATION', 'GST_REGISTRATION', 'BANK_OWNERSHIP', 'SANCTIONS']),
  )
  const [required, setRequired] = useState<Set<string>>(
    new Set(['CORPORATE_IDENTITY', 'PAN_VERIFICATION', 'GST_REGISTRATION', 'BANK_OWNERSHIP', 'SANCTIONS']),
  )
  const [error, setError] = useState<string | null>(null)

  const toggle = (code: string) => setSelected((prev) => {
    const n = new Set(prev)
    if (n.has(code)) { n.delete(code); setRequired((r) => { const x = new Set(r); x.delete(code); return x }) }
    else n.add(code)
    return n
  })

  const toggleRequired = (code: string) => setRequired((prev) => {
    const n = new Set(prev)
    n.has(code) ? n.delete(code) : n.add(code)
    return n
  })

  const byDimension = CHECKS.reduce<Record<string, typeof CHECKS>>((acc, c) => {
    (acc[c.dimension] ??= []).push(c)
    return acc
  }, {})

  return (
    <div className="max-w-[720px]">
      <p className="label">Trust engine</p>
      <h1 className="mt-1 text-[24px] font-bold">New verification policy</h1>
      <p className="mt-1.5 text-[13.5px] text-ink-dim">
        Pick the checks and mark which are required. Required checks must pass for the
        counterparty to be verified; optional ones are collected but never block.
      </p>

      <form className="mt-6 space-y-5" action={async (fd) => {
        setError(null)
        const res = await createPolicy(fd)
        if (res?.error) setError(res.error)
      }}>
        <div className="card p-5">
          <label className="label mb-1.5 block" htmlFor="name">Policy name</label>
          <input id="name" name="name" className="input" placeholder="Critical Supplier" required />
          <label className="label mb-1.5 mt-4 block" htmlFor="freshnessDays">Re-verify every (days)</label>
          <input id="freshnessDays" name="freshnessDays" type="number" className="input" defaultValue={365} min={30} />
        </div>

        {Object.entries(byDimension).map(([dim, list]) => (
          <div key={dim} className="card p-5">
            <h2 className="label mb-3">{dim}</h2>
            <div className="space-y-2">
              {list.map((c) => (
                <div key={c.code} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5">
                  <input type="checkbox" name="checks" value={c.code}
                    checked={selected.has(c.code)} onChange={() => toggle(c.code)} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium">{c.label}</span>
                    <span className="block text-[11.5px] text-ink-faint">
                      Source class {c.sourceClass} · max level {c.maxLevel}
                    </span>
                  </span>
                  <button type="button" disabled={!selected.has(c.code)}
                    onClick={() => toggleRequired(c.code)}
                    className={`pill ${required.has(c.code) ? 'bg-verify-soft text-verify' : 'bg-slate-100 text-slate-500'} disabled:opacity-40`}>
                    {required.has(c.code) ? 'REQUIRED' : 'OPTIONAL'}
                  </button>
                  {required.has(c.code) && <input type="hidden" name="required" value={c.code} />}
                </div>
              ))}
            </div>
          </div>
        ))}

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>}
        <button className="btn-verify">Create policy</button>
      </form>
    </div>
  )
}
