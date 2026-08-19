import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { Plus } from 'lucide-react'
import { db, policies, policyVersions } from '@/db'
import { requirePrincipal } from '@/lib/auth'
import { parsePolicy } from '@/lib/verification'
import { CHECK_CATALOG } from '@/lib/providers/mock'

export default async function Policies() {
  const p = await requirePrincipal()
  const rows = await db
    .select({ id: policies.id, name: policies.name, version: policyVersions.version, definition: policyVersions.definition })
    .from(policies)
    .innerJoin(policyVersions, eq(policyVersions.policyId, policies.id))
    .where(eq(policies.workspaceId, p.workspaceId))

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Trust engine</p>
          <h1 className="mt-1 text-[24px] font-bold">Verification policies</h1>
          <p className="mt-1.5 max-w-[70ch] text-[13.5px] text-ink-dim">
            A policy defines what verified means for a relationship. Versions are immutable once
            active, so an auditor asking what your standard was on a given date gets an unaltered answer.
          </p>
        </div>
        <Link href="/dashboard/policies/new" className="btn-verify"><Plus size={14} /> New policy</Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {rows.map((r) => {
          const def = parsePolicy(r.definition)
          const required = def.checks.filter((c) => c.requirement === 'REQUIRED')
          return (
            <div key={r.id + r.version} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-bold">{r.name}</h2>
                  <p className="mt-0.5 font-mono text-[11.5px] text-ink-faint">version {r.version} · immutable</p>
                </div>
                <span className="pill bg-verify-soft text-verify">{required.length} required</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {def.checks.map((c) => (
                  <span key={c.code}
                    className={`pill ${c.requirement === 'REQUIRED' ? 'bg-verify-soft text-verify' : 'bg-slate-100 text-slate-600'}`}>
                    {CHECK_CATALOG[c.code]?.label ?? c.code}
                  </span>
                ))}
              </div>
              <p className="mt-4 border-t border-line pt-3 text-[12.5px] text-ink-dim">
                Re-verification every {def.freshnessDays} days.
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
