/**
 * BID Trust — single source of truth for the brand marks.
 *
 * Two lockups, matching the supplied artwork:
 *
 *   <Logo/>      The full mark — silver/blue shield with the ribbon check and
 *                pixel dissolve, plus the BID / TRUST wordmark and the
 *                VERIFY | ASSESS | BUILD TRUST tagline. Marketing, decks, hero.
 *
 *   <LogoApp/>   The compact product lockup — BID wordmark with the green
 *                verification check, plus the BUSINESS IDENTITY & DUE DILIGENCE
 *                descriptor. App chrome, cards, profile headers.
 *
 * Both are vector reproductions of the supplied design, not redesigns. Vector
 * because the CSP/single-file build cannot fetch external images and the mark
 * has to hold from a 16px favicon to a hero.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TO USE THE MASTER RASTER ARTWORK
 *   1. Drop the supplied files into public/
 *        public/logo-on-dark.png
 *        public/logo-on-light.png
 *   2. Set USE_MASTER_ASSETS = true.
 * Only <Logo/> switches — <LogoApp/> stays vector, because the compact lockup
 * is used at sizes where a raster would soften.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const USE_MASTER_ASSETS = false
const MASTER = { onDark: '/logo-on-dark.png', onLight: '/logo-on-light.png' }

/* ── Brand constants, sampled from the supplied artwork ──────────────────── */
export const BRAND = {
  navy: '#0F2440',
  navyDeep: '#0A1B31',
  navyMid: '#12325F',
  blue: '#1560D8',
  blueBright: '#2E9BF5',
  silver: '#DCE6F0',
  /** Verification green — used for verified state only, never as decoration. */
  green: '#16A34A',
  greenBright: '#22C55E',
  greenSoft: '#E8F5ED',
}

export const BRAND_TAGLINE = 'Verify | Assess | Build Trust'
export const BRAND_DESCRIPTOR = 'Business Identity & Due Diligence'

/* ── The shield mark ─────────────────────────────────────────────────────── */
export function LogoMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 104 104" width={size} height={size} role="img" aria-label="BID Trust" className={`flex-none ${className}`}>
      <defs>
        <linearGradient id="bidSilver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" /><stop offset="38%" stopColor="#DCE6F0" />
          <stop offset="62%" stopColor="#9DB0C4" /><stop offset="100%" stopColor="#E8EFF6" />
        </linearGradient>
        <linearGradient id="bidBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2E9BF5" /><stop offset="55%" stopColor="#1560D8" /><stop offset="100%" stopColor="#0A2E6E" />
        </linearGradient>
        <linearGradient id="bidDeep" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#12325F" /><stop offset="100%" stopColor="#061A3C" />
        </linearGradient>
        <linearGradient id="bidRibbon" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#1B6FE0" /><stop offset="60%" stopColor="#2E9BF5" /><stop offset="100%" stopColor="#6FC4FF" />
        </linearGradient>
      </defs>
      <g>
        <rect x="30" y="12" width="6" height="6" fill="#1560D8" /><rect x="21" y="19" width="7" height="7" fill="#2E9BF5" />
        <rect x="12" y="16" width="5" height="5" fill="#123A78" /><rect x="22" y="30" width="5" height="5" fill="#EDF3FA" />
        <rect x="13" y="27" width="6" height="6" fill="#1560D8" /><rect x="4" y="24" width="5" height="5" fill="#0E2E63" />
        <rect x="14" y="38" width="6" height="6" fill="#2E9BF5" /><rect x="6" y="35" width="4" height="4" fill="#123A78" />
        <rect x="19" y="47" width="4" height="4" fill="#1560D8" /><rect x="9" y="45" width="5" height="5" fill="#0E2E63" />
      </g>
      <path d="M28 24 L84 24 L84 58 C84 79 69 92 56 99 C43 92 28 79 28 58 Z" fill="url(#bidSilver)" />
      <path d="M33 29 L79 29 L79 58 C79 76 66 87 56 93 C46 87 33 76 33 58 Z" fill="url(#bidDeep)" />
      <path d="M33 29 L38 29 L38 58 C38 71 46 80 56 86 L56 93 C46 87 33 76 33 58 Z" fill="url(#bidBlue)" opacity="0.9" />
      <path d="M42 58 L53 70 L96 14" fill="none" stroke="url(#bidRibbon)" strokeWidth="12" strokeLinejoin="miter" />
      <path d="M55.5 66.5 L94 12.5" fill="none" stroke="#BFE2FF" strokeWidth="1.6" opacity="0.75" />
    </svg>
  )
}

/* ── The green verification check badge used in the product lockup ───────── */
export function CheckBadge({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={`flex-none ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill={BRAND.green} />
      <path d="M6.6 12.3 L10.2 15.8 L17.4 8.4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Full marketing lockup ───────────────────────────────────────────────── */
export type LogoProps = {
  size?: number
  withWordmark?: boolean
  withTagline?: boolean
  tone?: 'light' | 'dark'
  className?: string
}

export function Logo({ size = 28, withWordmark = false, withTagline = false, tone = 'light', className = '' }: LogoProps) {
  const onDark = tone === 'light'

  if (USE_MASTER_ASSETS) {
    return (
      <img src={onDark ? MASTER.onDark : MASTER.onLight} alt="BID Trust"
        style={{ height: withWordmark ? size * 1.5 : size, width: 'auto' }}
        className={`flex-none ${className}`} />
    )
  }

  if (!withWordmark) return <LogoMark size={size} className={className} />

  const ink = onDark ? 'text-white' : 'text-[#0A2A5E]'
  const inkSoft = onDark ? 'text-[#A9BCD1]' : 'text-[#3A5A87]'
  const rule = onDark ? 'bg-white/20' : 'bg-[#0A2A5E]/20'

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span aria-hidden className={`w-px self-stretch ${rule}`} />
      <span className="inline-flex flex-col justify-center leading-none">
        <span className={`font-extrabold tracking-[-0.01em] ${ink}`} style={{ fontSize: size * 0.62 }}>
          BID<sup className={`ml-0.5 align-super ${inkSoft}`} style={{ fontSize: size * 0.2 }}>™</sup>
        </span>
        <span className={`font-semibold ${inkSoft}`}
          style={{ fontSize: size * 0.27, letterSpacing: '0.34em', marginTop: size * 0.1 }}>TRUST</span>
        {withTagline && (
          <span className={inkSoft} style={{ fontSize: size * 0.2, letterSpacing: '0.14em', marginTop: size * 0.18 }}>
            VERIFY <span className="opacity-40">|</span> ASSESS <span className="opacity-40">|</span> BUILD TRUST
          </span>
        )}
      </span>
    </span>
  )
}

/* ── Compact product lockup — BID ✓ + descriptor ─────────────────────────── */
export function LogoApp({
  size = 30,
  tone = 'light',
  withDescriptor = true,
  className = '',
}: {
  /** Cap height of the BID wordmark in px. */
  size?: number
  /** 'light' = white mark for dark grounds. 'dark' = navy mark for light grounds. */
  tone?: 'light' | 'dark'
  withDescriptor?: boolean
  className?: string
}) {
  const onDark = tone === 'light'
  const ink = onDark ? '#FFFFFF' : BRAND.navy
  const desc = onDark ? 'rgba(255,255,255,.78)' : '#5A6E88'

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label="BID — Business Identity & Due Diligence">
      <span className="relative inline-flex items-end flex-none" style={{ lineHeight: 1 }}>
        <span style={{ fontSize: size, fontWeight: 800, letterSpacing: '-0.02em', color: ink }}>BID</span>
        <CheckBadge size={size * 0.52} className="-ml-[0.16em] mb-[0.02em] relative" />
      </span>
      {withDescriptor && (
        <span className="inline-flex flex-col leading-[1.25]" style={{ color: desc }}>
          <span style={{ fontSize: size * 0.235, fontWeight: 700, letterSpacing: '0.02em' }}>BUSINESS IDENTITY &amp;</span>
          <span style={{ fontSize: size * 0.235, fontWeight: 700, letterSpacing: '0.02em' }}>DUE DILIGENCE</span>
        </span>
      )}
    </span>
  )
}

/** Green shield used for VERIFIED status blocks. */
export function VerifiedShield({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" className="flex-none">
      <path d="M24 3 L42 10 V24 C42 34.5 34.2 42.4 24 45.5 C13.8 42.4 6 34.5 6 24 V10 Z" fill={BRAND.green} />
      <path d="M15.5 24.2 L21.4 30.4 L33 17.6" fill="none" stroke="#fff" strokeWidth="4"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const USING_VECTOR_RECONSTRUCTION = !USE_MASTER_ASSETS
