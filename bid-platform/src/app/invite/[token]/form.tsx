'use client'
import { useState } from 'react'
import { acceptInvitation } from '@/lib/actions'

export function InviteForm({ token, legalName, requester }: {
  token: string; legalName: string; requester: string
}) {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="mt-5 space-y-4"
      action={async (fd) => {
        setBusy(true); setError(null)
        const res = await acceptInvitation(fd)
        if (res?.error) { setError(res.error); setBusy(false) }
      }}
    >
      <input type="hidden" name="token" value={token} />

      <div className="card space-y-4 p-5">
        <p className="label">Your business details</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Legal name" name="legalName" defaultValue={legalName} readOnly />
          <Field label="GSTIN" name="gstin" placeholder="29AABCX1234M1ZP" />
          <Field label="PAN" name="pan" placeholder="AABCX1234M" />
          <Field label="CIN" name="cin" placeholder="U74999KA2014PTC012345" />
          <Field label="City" name="city" placeholder="Bengaluru" />
          <Field label="State" name="state" placeholder="Karnataka" />
        </div>
        <Field label="Website" name="website" placeholder="example.com" />
        <div>
          <label className="label mb-1.5 block" htmlFor="description">
            About your business <span className="font-normal normal-case text-ink-faint">— shown as company-provided, never as verified</span>
          </label>
          <textarea id="description" name="description" rows={3} className="input"
            placeholder="What your business does." />
        </div>
        <p className="text-[11.5px] text-ink-faint">
          Leave a field blank if it does not apply. A missing identifier is recorded as
          insufficient evidence — never as an adverse finding.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-white p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="consent" className="mt-1" />
          <span className="text-[13px] leading-relaxed text-ink-dim">
            I authorise BID to verify the details above and to disclose the verification
            outcome to <strong className="text-ink">{requester}</strong> for the stated purpose.
            This consent expires in 12 months and I can revoke it at any time.
          </span>
        </label>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-verify" disabled={busy}>
          {busy ? 'Verifying…' : 'Consent and verify'}
        </button>
        <span className="text-[12.5px] text-ink-faint">
          Declining is a valid outcome and is never reported as an adverse signal.
        </span>
      </div>
    </form>
  )
}

function Field({ label, name, ...rest }: {
  label: string; name: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="label mb-1.5 block" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="input" {...rest} />
    </div>
  )
}
