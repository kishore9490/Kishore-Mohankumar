import {
  Building2, FileCheck2, Landmark, ClipboardCheck, FileText, ShieldCheck,
  Calendar, MapPin, Fingerprint, Receipt, ScanLine,
} from 'lucide-react'
import { LogoApp, VerifiedShield, BRAND } from '@/brand/Logo'

/**
 * The BID Digital Card — front and back — matching the approved design.
 *
 * The card is a pointer, not a record: a screenshot proves nothing, only QR
 * resolution to the live profile does. Green is used exclusively for
 * verification state.
 */

const FRONT_CHECKS = [
  { icon: ShieldCheck, label: 'Legal Identity', value: 'Verified' },
  { icon: FileCheck2, label: 'GST Status', value: 'Verified' },
  { icon: Landmark, label: 'Bank Ownership', value: 'Verified' },
  { icon: ClipboardCheck, label: 'Compliance', value: 'Verified' },
  { icon: FileText, label: 'Documents', value: 'Verified' },
  { icon: ShieldCheck, label: 'Risk Screening', value: 'Clear' },
]

const BACK_ROWS = [
  { icon: Building2, label: 'Business Name', value: 'ABC Engineering Pvt Ltd' },
  { icon: Fingerprint, label: 'BID ID', value: 'BID-BUS-100821', mono: true },
  { icon: Receipt, label: 'Entity Type', value: 'Private Limited Company' },
  { icon: Calendar, label: 'Date of Incorporation', value: '12 Jan 2016' },
  { icon: MapPin, label: 'Registered Office', value: 'E-45, Sector 63, Noida,\nUttar Pradesh, India - 201301' },
  { icon: FileText, label: 'PAN', value: 'AABCA1234B', mono: true },
  { icon: Receipt, label: 'GSTIN', value: '09AABCA1234B1Z5', mono: true },
]

/** Simple deterministic QR-looking block. Decorative — not a scannable code. */
function QrBlock({ size = 92, dark = false }: { size?: number; dark?: boolean }) {
  const cells = 21
  const on = (r: number, c: number) => {
    if ((r < 7 && c < 7) || (r < 7 && c > cells - 8) || (r > cells - 8 && c < 7)) {
      const rr = r > cells - 8 ? r - (cells - 7) : r
      const cc = c > cells - 8 ? c - (cells - 7) : c
      const inR = rr === 0 || rr === 6 || cc === 0 || cc === 6
      const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4
      return inR || core
    }
    return ((r * 7 + c * 13 + ((r * c) % 5)) % 3) === 0
  }
  const s = size / cells
  return (
    <div className="rounded-md bg-white p-1.5 flex-none" style={{ width: size + 12, height: size + 12 }}>
      <svg viewBox={`0 0 ${cells} ${cells}`} width={size} height={size} shapeRendering="crispEdges" aria-label="QR code">
        <rect width={cells} height={cells} fill="#fff" />
        {Array.from({ length: cells }).map((_, r) =>
          Array.from({ length: cells }).map((_, c) =>
            on(r, c) ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={dark ? '#0F2440' : '#0F2440'} /> : null,
          ),
        )}
      </svg>
      <span className="sr-only">{s}</span>
    </div>
  )
}

export function BidCardFront() {
  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden shadow-2xl"
      style={{ background: `linear-gradient(150deg, #143257 0%, ${BRAND.navy} 45%, #0A1B31 100%)` }}
    >
      {/* watermark shield */}
      <div className="absolute right-4 top-16 opacity-[0.07] pointer-events-none" aria-hidden>
        <VerifiedShield size={150} />
      </div>

      <div className="relative flex items-start justify-between gap-3">
        <LogoApp size={26} tone="light" />
        <span className="flex-none rounded-md px-3 py-1.5 text-[10.5px] font-bold tracking-[0.06em] text-white"
          style={{ background: BRAND.green }}>
          VERIFIED BUSINESS
        </span>
      </div>

      <div className="relative flex items-center gap-4 mt-7">
        <span className="grid place-items-center h-[68px] w-[68px] rounded-full bg-white flex-none shadow-lg">
          <span className="text-[22px] font-bold tracking-tight" style={{ color: BRAND.navy }}>abc</span>
        </span>
        <span className="min-w-0">
          <span className="block text-[19px] font-bold leading-[1.2] text-white">ABC Engineering<br />Private Limited</span>
          <span className="block text-[10.5px] text-white/55 mt-2.5 tracking-wide">BID ID</span>
          <span className="block text-[17px] font-bold tabular-nums tracking-tight" style={{ color: BRAND.greenBright }}>
            BID-BUS-100821
          </span>
        </span>
      </div>

      <div className="relative grid grid-cols-2 gap-x-5 gap-y-3.5 mt-6">
        {FRONT_CHECKS.map((c, i) => {
          const Icon = c.icon
          return (
            <div key={i} className="flex items-start gap-2.5">
              <span className="grid place-items-center h-6 w-6 rounded-md flex-none mt-0.5"
                style={{ background: 'rgba(22,163,74,.16)' }}>
                <Icon size={13} style={{ color: BRAND.greenBright }} />
              </span>
              <span className="min-w-0">
                <span className="block text-[11.5px] text-white/80 leading-tight">{c.label}</span>
                <span className="block text-[12px] font-semibold leading-tight mt-0.5" style={{ color: BRAND.greenBright }}>
                  {c.value}
                </span>
              </span>
            </div>
          )
        })}
      </div>

      <div className="relative mt-6 pt-5 border-t border-white/12 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <VerifiedShield size={30} />
            <span>
              <span className="block text-[15px] font-bold" style={{ color: BRAND.greenBright }}>BID VERIFIED</span>
              <span className="block text-[10.5px] text-white/65 mt-0.5">Currently Verified • Valid Till 14 Aug 2027</span>
            </span>
          </div>
          <p className="text-[10.5px] text-white/45 mt-3">Verified on: 15 Aug 2026</p>
        </div>
        <QrBlock size={72} />
      </div>
    </div>
  )
}

export function BidCardBack() {
  return (
    <div className="rounded-2xl bg-white overflow-hidden shadow-2xl border border-[#E5EAF0] flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[17px] font-bold" style={{ color: BRAND.navy }}>About BID</h3>
          <LogoApp size={22} tone="dark" />
        </div>
        <p className="text-[12px] leading-relaxed text-[#5A6E88] mt-3 max-w-[46ch]">
          BID is a trusted verification platform that verifies businesses and people through
          authorized data sources and due diligence. Scan the QR code to view live verification
          status and details.
        </p>

        <div className="h-px bg-[#E5EAF0] my-5" />

        <dl className="space-y-3.5">
          {BACK_ROWS.map((r, i) => {
            const Icon = r.icon
            return (
              <div key={i} className="flex items-start gap-3">
                <span className="grid place-items-center h-6 w-6 rounded-md bg-[#F1F5FA] flex-none mt-0.5">
                  <Icon size={12} className="text-[#5A6E88]" />
                </span>
                <dt className="text-[12px] text-[#5A6E88] flex-1 min-w-0">{r.label}</dt>
                <dd className={`text-[12px] font-semibold text-right whitespace-pre-line ${r.mono ? 'tabular-nums' : ''}`}
                  style={{ color: BRAND.navy }}>
                  {r.value}
                </dd>
              </div>
            )
          })}
        </dl>
      </div>
      <div className="px-6 py-4 flex items-center justify-between gap-4"
        style={{ background: BRAND.navy }}>
        <p className="text-[10.5px] leading-relaxed text-white/70 max-w-[36ch]">
          This card is digitally issued by BID and cannot be tampered.
        </p>
        <span className="text-[11.5px] font-semibold text-white flex-none">www.bidtrust.in</span>
      </div>
    </div>
  )
}

export function BidCard() {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#5A6E88] mb-2.5">Front</p>
          <BidCardFront />
          <p className="mt-3 text-[11.5px] text-[#5A6E88] flex items-center justify-center gap-1.5">
            <ScanLine size={13} /> Tap or Scan to Verify
          </p>
        </div>
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#5A6E88] mb-2.5">Back</p>
          <BidCardBack />
        </div>
      </div>
    </div>
  )
}

/** Where the card gets used — the distribution surface. */
export const CARD_USES = [
  { label: 'Vendor\nOnboarding', icon: '🤝' },
  { label: 'Employee /\nContractor Verification', icon: '🪪' },
  { label: 'Business\nPartnerships', icon: '📋' },
  { label: 'Bank /\nFinancial KYC', icon: '🏦' },
  { label: 'Tenders &\nBids', icon: '🛡️' },
  { label: 'Marketplace\nTrust', icon: '🏪' },
]
