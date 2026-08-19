'use client'
import { useState } from 'react'
import { createCampaign } from '@/lib/actions'

const SAMPLE = 'XYZ HR Consultants, ops@xyz.example\nLMN Components, admin@lmn.example\nDeccan Fabricators, hello@deccan.example'

export function CampaignForm({ options }: { options: { id: string; name: string; version: string }[] }) {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (options.length === 0) {
    return (
      <div className="card mt-6 p-6 text-[13.5px] text-ink-dim">
        You need a policy before you can run a campaign.
      </div>
    )
  }

  return (
    <form
      className="mt-6 space-y-5"
      action={async (fd) => {
        setBusy(true); setError(null)
        const res = await createCampaign(fd)
        if (res?.error) { setError(res.error); setBusy(false) }
      }}
    >
      <div className="card space-y-4 p-5">
        <div>
          <label className="label mb-1.5 block" htmlFor="name">Campaign name</label>
          <input id="name" name="name" className="input" placeholder="Q3 Supplier Onboarding" required />
        </div>
        <div>
          <label className="label mb-1.5 block" htmlFor="policyVersionId">Policy</label>
          <select id="policyVersionId" name="policyVersionId" className="input" required>
            {options.map((o) => <option key={o.id} value={o.id}>{o.name} v{o.version}</option>)}
          </select>
        </div>
        <div>
          <label className="label mb-1.5 block" htmlFor="vendors">Counterparties</label>
          <textarea id="vendors" name="vendors" rows={7} required
            className="input font-mono text-[12.5px]" defaultValue={SAMPLE} />
          <p className="mt-1.5 text-[11.5px] text-ink-faint">
            One per line: <span className="font-mono">Legal Name, email</span>
          </p>
        </div>
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>}
      <button className="btn-verify" disabled={busy}>
        {busy ? 'Creating…' : 'Create campaign and invite'}
      </button>
    </form>
  )
}
