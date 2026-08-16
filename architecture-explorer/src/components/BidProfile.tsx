import {
  Search, Copy, MapPin, Globe, Calendar, ChevronDown, ArrowRight, Lock,
  Building2, FileCheck2, Landmark, MapPinned, ClipboardCheck, ShieldCheck,
  Mail, QrCode, Linkedin, MessageCircle, Wallet, Award, PenLine, Receipt, Users,
} from 'lucide-react'
import { LogoApp, VerifiedShield, CheckBadge, BRAND } from '@/brand/Logo'

/**
 * The public BID profile at bidtrust.in/{bid_id}, matching the approved design.
 *
 * The governing rule: BID-verified information and company-provided information
 * are structurally separated, and no adverse risk finding ever appears here.
 */

const TABS = [
  'Overview', 'Verification Summary', 'Business Details', 'Documents',
  'Risk & Compliance', 'BID Credentials', 'Activity', 'Reviews',
]

const ENTITY_ROWS = [
  { icon: Building2, label: 'Entity Type', value: 'Private Limited Company' },
  { icon: FileCheck2, label: 'CIN', value: 'U28999UP2016PTC081234', mono: true },
  { icon: Receipt, label: 'GSTIN', value: '09AABCA1234B1Z5', mono: true },
  { icon: Wallet, label: 'PAN', value: 'AABCA1234B', mono: true },
  { icon: ShieldCheck, label: 'Legal Status', value: 'Active' },
  { icon: Users, label: 'Employees', value: '50 – 100' },
]

const SUMMARY = [
  { icon: ShieldCheck, label: 'Business Identity', value: 'Verified' },
  { icon: FileCheck2, label: 'GST Status', value: 'Verified' },
  { icon: Landmark, label: 'Bank Ownership', value: 'Verified' },
  { icon: MapPinned, label: 'Address Verification', value: 'Verified' },
  { icon: ClipboardCheck, label: 'Compliance', value: 'Verified' },
  { icon: ShieldCheck, label: 'Risk Screening', value: 'Clear' },
]

const CREDENTIALS = [
  { icon: ShieldCheck, label: 'Business Verified', tint: '#16A34A', bg: '#E8F5ED' },
  { icon: Landmark, label: 'Financial Verified', tint: '#2563EB', bg: '#E8F0FE' },
  { icon: ClipboardCheck, label: 'Compliance Verified', tint: '#7C3AED', bg: '#F1EBFD' },
  { icon: Award, label: 'Supplier Verified', tint: '#D97706', bg: '#FEF3E2' },
]

export function BidProfile() {
  return (
    <div className="rounded-xl overflow-hidden border border-[#E5EAF0] bg-[#F4F7FA] shadow-lg">
      {/* ── Top navigation ── */}
      <div className="flex items-center gap-5 px-5 py-3.5" style={{ background: BRAND.navy }}>
        <LogoApp size={22} tone="light" />
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-[340px] rounded-lg bg-white px-3 py-2">
          <Search size={14} className="text-[#94A3B8] flex-none" />
          <span className="text-[12px] text-[#94A3B8]">Search BID ID or Business</span>
        </div>
        <div className="ml-auto hidden lg:flex items-center gap-5 text-[12.5px] text-white/85">
          <span>Verify Now</span>
          <span className="flex items-center gap-1">Solutions <ChevronDown size={12} /></span>
          <span className="flex items-center gap-1">Resources <ChevronDown size={12} /></span>
          <span>How BID Works</span>
          <span className="rounded-lg border px-4 py-1.5 font-medium"
            style={{ borderColor: BRAND.green, color: BRAND.greenBright }}>Login</span>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="relative px-5 pt-5 pb-4"
        style={{ background: `linear-gradient(100deg, ${BRAND.navy} 0%, #143257 55%, #1B4272 100%)` }}>
        <div className="absolute inset-0 opacity-25 pointer-events-none" aria-hidden
          style={{ background: 'radial-gradient(600px 220px at 78% 0%, rgba(120,180,255,.5), transparent 70%)' }} />
        <div className="relative flex flex-wrap items-start gap-5">
          <span className="grid place-items-center h-[86px] w-[86px] rounded-xl bg-white flex-none shadow-lg">
            <span className="text-center leading-none">
              <span className="block text-[26px] font-bold tracking-tight" style={{ color: BRAND.navy }}>abc</span>
              <span className="block h-[3px] w-8 mx-auto mt-1 rounded-full" style={{ background: '#F59E0B' }} />
            </span>
          </span>

          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10.5px] font-bold tracking-[0.04em] text-white"
              style={{ background: BRAND.green }}>
              <CheckBadge size={11} /> BID VERIFIED BUSINESS
            </span>
            <h3 className="flex items-center gap-2 text-[24px] font-bold text-white mt-2.5 leading-tight">
              ABC Engineering Private Limited <CheckBadge size={17} />
            </h3>
            <p className="text-[13px] text-white/85 mt-1.5">
              BID ID: <span className="font-bold tabular-nums">BID-BUS-100821</span>
              <Copy size={12} className="inline ml-2 -mt-0.5 opacity-70" />
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-[11.5px] text-white/75">
              <span className="flex items-center gap-1.5"><MapPin size={12} /> Noida, Uttar Pradesh, India</span>
              <span className="flex items-center gap-1.5"><Globe size={12} /> www.abcepl.com</span>
              <span className="flex items-center gap-1.5"><Calendar size={12} /> Incorporated: 12 Jan 2016</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 p-4">
        {/* min-w-0 matters: a grid item defaults to min-width:auto, so the wide
            scrolling tab row would otherwise force this column past its track
            and push the right rail outside the overflow-hidden container. */}
        <div className="min-w-0">
          {/* tabs */}
          <div className="flex gap-5 overflow-x-auto border-b border-[#E5EAF0] mb-4 bg-white rounded-t-lg px-4 pt-1">
            {TABS.map((t, i) => (
              <span key={t}
                className={`whitespace-nowrap pb-2.5 pt-2 text-[11px] font-bold uppercase tracking-[0.06em] border-b-2 ${
                  i === 0 ? '' : 'border-transparent text-[#8296AD]'
                }`}
                style={i === 0 ? { color: BRAND.green, borderColor: BRAND.green } : undefined}>
                {t}
              </span>
            ))}
          </div>

          {/* about + entity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-lg border border-[#E5EAF0] mb-4">
            <div className="p-4 md:border-r border-[#E5EAF0]">
              <h4 className="text-[14px] font-bold mb-2" style={{ color: BRAND.navy }}>
                About ABC Engineering Private Limited
              </h4>
              <p className="text-[11.5px] leading-relaxed text-[#5A6E88]">
                ABC Engineering Private Limited is a leading manufacturer and supplier of precision
                engineered components and fabrication solutions. We serve industries including
                automotive, construction, energy and industrial machinery with a commitment to
                quality, innovation and customer satisfaction.
              </p>
              <span className="inline-flex items-center gap-1 text-[11.5px] font-medium mt-2.5"
                style={{ color: BRAND.green }}>View More <ChevronDown size={12} /></span>
            </div>
            <div className="p-4">
              <dl className="space-y-2.5">
                {ENTITY_ROWS.map((r, i) => {
                  const Icon = r.icon
                  return (
                    <div key={i} className="flex items-center gap-3 text-[11.5px]">
                      <Icon size={13} className="text-[#8296AD] flex-none" />
                      <dt className="text-[#5A6E88] w-[86px] flex-none">{r.label}</dt>
                      <dd className={`font-medium ${r.mono ? 'tabular-nums' : ''}`} style={{ color: BRAND.navy }}>{r.value}</dd>
                    </div>
                  )
                })}
              </dl>
            </div>
          </div>

          {/* verification summary */}
          <div className="bg-white rounded-lg border border-[#E5EAF0] p-4 mb-4">
            <h4 className="text-[14px] font-bold mb-3" style={{ color: BRAND.navy }}>Verification Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
              {SUMMARY.map((s, i) => {
                const Icon = s.icon
                return (
                  <div key={i} className="rounded-lg border border-[#E5EAF0] p-2.5 text-center">
                    <span className="grid place-items-center h-7 w-7 rounded-lg mx-auto mb-1.5"
                      style={{ background: BRAND.greenSoft }}>
                      <Icon size={14} style={{ color: BRAND.green }} />
                    </span>
                    <p className="text-[10.5px] font-semibold leading-tight" style={{ color: BRAND.navy }}>{s.label}</p>
                    <p className="text-[10.5px] mt-0.5" style={{ color: BRAND.green }}>{s.value}</p>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-[#E5EAF0]">
              <span className="flex items-center gap-1.5 text-[11px] text-[#5A6E88]">
                <ShieldCheck size={12} /> All checks completed as per Standard Supplier Verification Policy v2.1
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: BRAND.green }}>
                View Full Verification Summary <ArrowRight size={11} />
              </span>
            </div>
          </div>

          {/* credentials */}
          <div className="bg-white rounded-lg border border-[#E5EAF0] p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h4 className="text-[14px] font-bold" style={{ color: BRAND.navy }}>BID Credentials</h4>
              <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: BRAND.green }}>
                View All Credentials <ArrowRight size={11} />
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {CREDENTIALS.map((c, i) => {
                const Icon = c.icon
                return (
                  <div key={i} className="rounded-lg border border-[#E5EAF0] p-3">
                    <span className="grid place-items-center h-7 w-7 rounded-lg mb-2" style={{ background: c.bg }}>
                      <Icon size={14} style={{ color: c.tint }} />
                    </span>
                    <p className="text-[11.5px] font-semibold leading-tight" style={{ color: BRAND.navy }}>{c.label}</p>
                    <p className="text-[10.5px] text-[#8296AD] mt-1">Level 2</p>
                    <p className="text-[10.5px] text-[#8296AD]">Valid Till: 14 Aug 2027</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Right rail ── */}
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-[#E5EAF0] p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: BRAND.navy }}>
                BID Verification Status
              </p>
              <span className="flex items-center gap-1.5 text-[10.5px] text-[#5A6E88]">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: BRAND.green }} /> Live
              </span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <VerifiedShield size={46} />
              <span>
                <span className="block text-[20px] font-bold leading-none" style={{ color: BRAND.green }}>VERIFIED</span>
                <span className="block text-[10.5px] text-[#5A6E88] mt-1.5">This business is verified by BID</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[10px] text-[#8296AD] mb-0.5">Last Verified</p>
                <p className="text-[12.5px] font-bold tabular-nums" style={{ color: BRAND.navy }}>15 Aug 2026</p>
              </div>
              <div>
                <p className="text-[10px] text-[#8296AD] mb-0.5">Valid Till</p>
                <p className="text-[12.5px] font-bold tabular-nums" style={{ color: BRAND.navy }}>14 Aug 2027</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="rounded-md px-2.5 py-1 text-[10.5px] font-bold"
                style={{ background: BRAND.greenSoft, color: BRAND.green }}>ACTIVE</span>
              <span className="text-[10.5px] text-[#5A6E88]">Verification is up to date</span>
            </div>
            <button className="w-full rounded-lg py-2.5 text-[12.5px] font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: BRAND.navy }}>
              <Lock size={12} /> View Authorized Verification
            </button>
            <p className="text-[10px] text-[#8296AD] text-center mt-2 flex items-center justify-center gap-1">
              <Lock size={9} /> Authorised users only
            </p>
          </div>

          <div className="bg-white rounded-lg border border-[#E5EAF0] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: BRAND.navy }}>
              Share this Profile
            </p>
            <p className="text-[11px] text-[#5A6E88] mb-3">Share this BID Profile with your partners, customers or vendors.</p>
            <div className="flex items-center gap-2 rounded-lg border border-[#E5EAF0] bg-[#F8FAFC] px-3 py-2 mb-3">
              <span className="text-[11px] flex-1 truncate tabular-nums" style={{ color: BRAND.navy }}>
                https://bid.in/BID-BUS-100821
              </span>
              <Copy size={12} className="text-[#8296AD] flex-none" />
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { Icon: MessageCircle, label: 'WhatsApp', tint: BRAND.green },
                { Icon: Linkedin, label: 'LinkedIn', tint: '#0A66C2' },
                { Icon: Mail, label: 'Email', tint: '#5A6E88' },
                { Icon: QrCode, label: 'Copy QR', tint: BRAND.navy },
              ].map(({ Icon, label, tint }) => (
                <div key={label}>
                  <Icon size={17} style={{ color: tint }} className="mx-auto" />
                  <p className="text-[9.5px] text-[#5A6E88] mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E5EAF0] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: BRAND.navy }}>
              Need More Verification?
            </p>
            <p className="text-[11px] text-[#5A6E88] mb-3">
              Request additional verification or due diligence as per your requirement.
            </p>
            <button className="w-full rounded-lg border border-[#E5EAF0] py-2.5 text-[12px] font-medium flex items-center justify-between px-3"
              style={{ color: BRAND.navy }}>
              <span className="flex items-center gap-2"><PenLine size={12} /> Request Verification</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer disclosure ── */}
      <div className="flex items-center gap-2 px-5 py-3 text-[11px]"
        style={{ background: BRAND.greenSoft, color: '#2F6B47' }}>
        <Lock size={12} className="flex-none" />
        Information on this page is provided by BID based on verified data from authorized sources.
      </div>
    </div>
  )
}
