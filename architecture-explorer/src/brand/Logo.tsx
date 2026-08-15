/**
 * Single source of truth for the BID Trust mark.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠ PLACEHOLDER — the official logo did not arrive with the brief.
 *
 * The mark rendered here follows the established brand direction (navy ground,
 * green verification check) but it is NOT the authoritative logo and has not
 * been redesigned from any supplied asset.
 *
 * TO SWAP IN THE REAL LOGO:
 *   Option A (recommended) — replace `public/logo.svg` with the official file.
 *   Option B — set `USE_INLINE_MARK = false` below and drop the official asset
 *              at `public/logo.svg`; this component will render it as an <img>.
 *
 * Every surface in the app (top bar, BID Card, public profile, story mode)
 * renders through this component, so a single swap propagates everywhere.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const USE_INLINE_MARK = true

export type LogoProps = {
  /** Pixel size of the square mark. */
  size?: number
  /** Render the "BID TRUST" wordmark beside the mark. */
  withWordmark?: boolean
  /** Wordmark colour treatment for light vs dark surfaces. */
  tone?: 'light' | 'dark'
  className?: string
}

export function Logo({ size = 28, withWordmark = false, tone = 'light', className = '' }: LogoProps) {
  const mark = USE_INLINE_MARK ? (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      role="img"
      aria-label="BID Trust"
      className="flex-none"
    >
      <rect width="32" height="32" rx="8" fill="#1DB954" />
      <path
        d="M8.5 16.6 L13.6 21.5 L23.5 10.8"
        fill="none"
        stroke="#06220F"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <img src="/logo.svg" width={size} height={size} alt="BID Trust" className="flex-none" />
  )

  if (!withWordmark) return <span className={className}>{mark}</span>

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {mark}
      <span
        className={`text-[13px] font-bold uppercase tracking-[0.18em] leading-none ${
          tone === 'light' ? 'text-white' : 'text-navy-850'
        }`}
      >
        BID{' '}
        <span className={tone === 'light' ? 'text-ink-faint font-medium' : 'text-navy-500 font-medium'}>
          TRUST
        </span>
      </span>
    </span>
  )
}

/** Shown once in the top bar so nobody mistakes the placeholder for the real mark. */
export const LOGO_IS_PLACEHOLDER = true
