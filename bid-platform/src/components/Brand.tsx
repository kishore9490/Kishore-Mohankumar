export const GREEN = '#16A34A'

/** Green verification check badge. */
export function CheckBadge({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="flex-none" aria-hidden>
      <circle cx="12" cy="12" r="11" fill={GREEN} />
      <path d="M6.6 12.3 L10.2 15.8 L17.4 8.4" fill="none" stroke="#fff" strokeWidth="2.6"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function VerifiedShield({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className="flex-none" aria-hidden>
      <path d="M24 3 L42 10 V24 C42 34.5 34.2 42.4 24 45.5 C13.8 42.4 6 34.5 6 24 V10 Z" fill={GREEN} />
      <path d="M15.5 24.2 L21.4 30.4 L33 17.6" fill="none" stroke="#fff" strokeWidth="4"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * The product lockup: BID wordmark + verification check + descriptor.
 *
 * To use the supplied master artwork instead, drop it at public/logo.png and
 * swap the markup here — this is the only place the mark is defined.
 */
export function Logo({ size = 26, tone = 'light', descriptor = true }: {
  size?: number; tone?: 'light' | 'dark'; descriptor?: boolean
}) {
  const onDark = tone === 'light'
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="BID — Business Identity & Due Diligence">
      <span className="relative inline-flex items-end flex-none leading-none">
        <span style={{ fontSize: size, fontWeight: 800, letterSpacing: '-0.02em', color: onDark ? '#fff' : '#0F2440' }}>BID</span>
        <span style={{ marginLeft: '-0.14em' }}><CheckBadge size={size * 0.52} /></span>
      </span>
      {descriptor && (
        <span className="inline-flex flex-col leading-[1.25]"
          style={{ color: onDark ? 'rgba(255,255,255,.78)' : '#5A6E88' }}>
          <span style={{ fontSize: size * 0.235, fontWeight: 700 }}>BUSINESS IDENTITY &amp;</span>
          <span style={{ fontSize: size * 0.235, fontWeight: 700 }}>DUE DILIGENCE</span>
        </span>
      )}
    </span>
  )
}

const BAND_STYLE: Record<string, string> = {
  LOW: 'bg-verify-soft text-verify',
  MEDIUM: 'bg-amber-50 text-amber-700',
  HIGH: 'bg-red-50 text-red-700',
  INSUFFICIENT_EVIDENCE: 'bg-slate-100 text-slate-600',
  BLOCKED: 'bg-red-50 text-red-700',
  VERIFIED: 'bg-verify-soft text-verify',
  EXCEPTION: 'bg-red-50 text-red-700',
  PENDING: 'bg-slate-100 text-slate-600',
  INVITED: 'bg-slate-100 text-slate-600',
  REGISTERED: 'bg-blue-50 text-blue-700',
  AWAITING_CONSENT: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-verify-soft text-verify',
  APPROVED: 'bg-verify-soft text-verify',
  ACTIVE: 'bg-verify-soft text-verify',
}

export function StatusPill({ value }: { value: string }) {
  const cls = BAND_STYLE[value] ?? 'bg-slate-100 text-slate-600'
  const label = value.replace(/_/g, ' ')
  return <span className={`pill ${cls}`}>{label}</span>
}
