/**
 * BID Trust — single source of truth for the brand mark.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THIS IS
 *
 * A vector reconstruction of the supplied BID Trust logo: the silver/blue
 * shield with the ribbon checkmark breaking out of the top-right, the pixel
 * dissolve on the upper left, and the BID / TRUST lockup.
 *
 * It reproduces the supplied design — it is not a redesign. It is vector, so it
 * stays crisp at any size and needs no external request (the artifact/CSP build
 * cannot fetch remote images).
 *
 * The one thing it cannot reproduce exactly is the master artwork's photographic
 * chrome bevel and gradient depth. For print, decks, or anywhere the master must
 * be used verbatim, switch to the raster masters below.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TO USE THE MASTER ARTWORK INSTEAD (one flag, propagates everywhere)
 *
 *   1. Drop the two supplied files into `public/`:
 *        public/logo-on-dark.png    ← the version artworked for dark grounds
 *        public/logo-on-light.png   ← the version artworked for light grounds
 *   2. Set USE_MASTER_ASSETS = true below.
 *
 * Every surface in the app — top bar, sidebar, hero, BID Card, public profile,
 * story mode, favicon — renders through this component, so that single change
 * propagates. Nothing else needs editing.
 *
 * Note: the raster masters are full lockups (mark + wordmark + tagline). When
 * USE_MASTER_ASSETS is on, `withWordmark` is ignored because the wordmark is
 * already part of the image.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const USE_MASTER_ASSETS = false

const MASTER = {
  onDark: '/logo-on-dark.png',
  onLight: '/logo-on-light.png',
}

export type LogoProps = {
  /** Pixel height of the mark. */
  size?: number
  /** Render the BID / TRUST lockup beside the mark. */
  withWordmark?: boolean
  /** Render the VERIFY | ASSESS | BUILD TRUST tagline beneath the lockup. */
  withTagline?: boolean
  /**
   * Which ground the logo sits on.
   * 'light' = light-coloured logo, for dark surfaces (navy top bar, BID Card).
   * 'dark'  = dark-coloured logo, for light surfaces (white panels).
   */
  tone?: 'light' | 'dark'
  className?: string
}

/** The shield mark on its own — used for the favicon and compact placements. */
export function LogoMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 104 104"
      width={size}
      height={size}
      role="img"
      aria-label="BID Trust"
      className={`flex-none ${className}`}
    >
      <defs>
        <linearGradient id="bidSilver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="38%" stopColor="#DCE6F0" />
          <stop offset="62%" stopColor="#9DB0C4" />
          <stop offset="100%" stopColor="#E8EFF6" />
        </linearGradient>
        <linearGradient id="bidBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2E9BF5" />
          <stop offset="55%" stopColor="#1560D8" />
          <stop offset="100%" stopColor="#0A2E6E" />
        </linearGradient>
        <linearGradient id="bidDeep" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#12325F" />
          <stop offset="100%" stopColor="#061A3C" />
        </linearGradient>
        <linearGradient id="bidRibbon" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#1B6FE0" />
          <stop offset="60%" stopColor="#2E9BF5" />
          <stop offset="100%" stopColor="#6FC4FF" />
        </linearGradient>
      </defs>

      {/* Pixel dissolve, upper left — dense near the shield, scattering outward */}
      <g>
        <rect x="30" y="12" width="6" height="6" fill="#1560D8" />
        <rect x="21" y="19" width="7" height="7" fill="#2E9BF5" />
        <rect x="12" y="16" width="5" height="5" fill="#123A78" />
        <rect x="22" y="30" width="5" height="5" fill="#EDF3FA" />
        <rect x="13" y="27" width="6" height="6" fill="#1560D8" />
        <rect x="4" y="24" width="5" height="5" fill="#0E2E63" />
        <rect x="14" y="38" width="6" height="6" fill="#2E9BF5" />
        <rect x="6" y="35" width="4" height="4" fill="#123A78" />
        <rect x="19" y="47" width="4" height="4" fill="#1560D8" />
        <rect x="9" y="45" width="5" height="5" fill="#0E2E63" />
      </g>

      {/* Shield — outer silver edge */}
      <path
        d="M28 24 L84 24 L84 58 C84 79 69 92 56 99 C43 92 28 79 28 58 Z"
        fill="url(#bidSilver)"
      />
      {/* Shield — inner face */}
      <path
        d="M33 29 L79 29 L79 58 C79 76 66 87 56 93 C46 87 33 76 33 58 Z"
        fill="url(#bidDeep)"
      />
      {/* Inner blue rim catching light on the left */}
      <path
        d="M33 29 L38 29 L38 58 C38 71 46 80 56 86 L56 93 C46 87 33 76 33 58 Z"
        fill="url(#bidBlue)"
        opacity="0.9"
      />

      {/* The checkmark, breaking out of the shield at the top right */}
      <path
        d="M42 58 L53 70 L96 14"
        fill="none"
        stroke="url(#bidRibbon)"
        strokeWidth="12"
        strokeLinejoin="miter"
        strokeLinecap="butt"
      />
      {/* Underside fold of the ribbon, giving the arm its depth */}
      <path
        d="M53 70 L96 14"
        fill="none"
        stroke="#0A2E6E"
        strokeWidth="2.6"
        strokeLinecap="butt"
        opacity="0.55"
        transform="translate(3.2,3.4)"
      />
      {/* Highlight along the top of the ribbon */}
      <path
        d="M55.5 66.5 L94 12.5"
        fill="none"
        stroke="#BFE2FF"
        strokeWidth="1.6"
        strokeLinecap="butt"
        opacity="0.75"
      />
    </svg>
  )
}

export function Logo({
  size = 28,
  withWordmark = false,
  withTagline = false,
  tone = 'light',
  className = '',
}: LogoProps) {
  const onDark = tone === 'light'

  // Master raster lockup — already includes the wordmark and tagline.
  if (USE_MASTER_ASSETS) {
    return (
      <img
        src={onDark ? MASTER.onDark : MASTER.onLight}
        alt="BID Trust"
        style={{ height: withWordmark ? size * 1.5 : size, width: 'auto' }}
        className={`flex-none ${className}`}
      />
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
          BID
          <sup className={`ml-0.5 align-super ${inkSoft}`} style={{ fontSize: size * 0.2 }}>
            ™
          </sup>
        </span>
        <span
          className={`font-semibold ${inkSoft}`}
          style={{ fontSize: size * 0.27, letterSpacing: '0.34em', marginTop: size * 0.1 }}
        >
          TRUST
        </span>
        {withTagline && (
          <span
            className={inkSoft}
            style={{ fontSize: size * 0.2, letterSpacing: '0.14em', marginTop: size * 0.18 }}
          >
            VERIFY <span className="opacity-40">|</span> ASSESS <span className="opacity-40">|</span> BUILD TRUST
          </span>
        )}
      </span>
    </span>
  )
}

/** The tagline that ships with the mark, for use outside the lockup. */
export const BRAND_TAGLINE = 'Verify · Assess · Build Trust'

/**
 * True while the app renders the vector reconstruction rather than the supplied
 * master artwork. Surfaces a one-line note in the sidebar so nobody ships the
 * reconstruction to print thinking it is the master.
 */
export const USING_VECTOR_RECONSTRUCTION = !USE_MASTER_ASSETS
