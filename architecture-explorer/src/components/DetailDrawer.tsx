import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useExplorer } from '@/state/explorer'
import { COMPONENT_BY_ID } from '@/data/layers'
import { LIFECYCLE_BY_ID } from '@/data/lifecycle'
import { RELATIONSHIPS, ORG_BY_ID } from '@/data/demo'
import { DATA_ENTITIES } from '@/data/dataModel'
import { EVENTS, ADRS, PIPELINE, INDUSTRIES } from '@/data/catalog'
import { ENDPOINTS } from '@/data/api'
import { BulletList, Chip, Code, KeyValue, TONE } from './ui'

/**
 * The single right-side drawer (§6). On narrow screens it becomes a bottom
 * sheet (§33). Every clickable thing in the app resolves to one shape here.
 */
export function DetailDrawer() {
  const { drawer, close, open } = useExplorer()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const body = drawer ? renderBody(drawer, open) : null

  return (
    <AnimatePresence>
      {drawer && body && (
        <>
          <motion.div
            className="fixed inset-0 bg-navy-950/25 z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close} aria-hidden
          />
          <motion.aside
            role="dialog" aria-modal="true" aria-label={body.title}
            className="fixed z-50 bg-white shadow-2xl flex flex-col
                       inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl
                       md:inset-y-0 md:right-0 md:left-auto md:w-[460px] md:max-h-none md:rounded-none md:border-l md:border-[var(--line)]"
            initial={{ y: '100%', x: 0 }} animate={{ y: 0, x: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[var(--line)] flex-none">
              <div className="min-w-0">
                <p className="eyebrow mb-1">{body.eyebrow}</p>
                <h2 className="text-[17px] font-semibold leading-snug text-navy-850">{body.title}</h2>
              </div>
              <button
                onClick={close} aria-label="Close"
                className="flex-none rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-850"
              >
                <X size={18} />
              </button>
            </header>
            <div className="overflow-y-auto px-5 py-4 flex-1">{body.content}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

type Body = { eyebrow: string; title: string; content: ReactNode }

function renderBody(
  d: NonNullable<ReturnType<typeof useExplorer>['drawer']>,
  open: ReturnType<typeof useExplorer>['open'],
): Body | null {
  switch (d.kind) {
    case 'component': {
      const c = COMPONENT_BY_ID.get(d.id)
      if (!c) return null
      return {
        eyebrow: `${c.layer} layer · component`,
        title: c.name,
        content: (
          <>
            <p className="text-[14px] leading-relaxed text-slate-700 mb-4">{c.purpose}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {c.facets.map((f) => <Chip key={f} tone="primary">{f}</Chip>)}
            </div>
            <dl>
              <KeyValue label="Responsibilities"><BulletList items={c.responsibilities} tone={c.tone ?? 'primary'} /></KeyValue>
              <KeyValue label="Inputs"><BulletList items={c.inputs} /></KeyValue>
              <KeyValue label="Outputs"><BulletList items={c.outputs} /></KeyValue>
              <KeyValue label="Dependencies"><BulletList items={c.dependencies} /></KeyValue>
              <KeyValue label="Data handled"><BulletList items={c.dataHandled} /></KeyValue>
              <KeyValue label="Security considerations"><BulletList items={c.security} tone="adverse" /></KeyValue>
              <KeyValue label="Events emitted">
                {c.events.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {c.events.map((e) => {
                      const known = EVENTS.some((x) => x.id === e)
                      return known
                        ? <button key={e} onClick={() => open({ kind: 'event', id: e })} className="mono text-[11px] rounded-md bg-verify/10 border border-verify/30 px-2 py-1 text-verify-deep hover:bg-verify/20">{e}</button>
                        : <span key={e} className="mono text-[11px] rounded-md bg-slate-100 border border-slate-200 px-2 py-1 text-slate-500">{e}</span>
                    })}
                  </div>
                ) : <span className="text-slate-400 text-[13px]">—</span>}
              </KeyValue>
              <KeyValue label="APIs">
                {c.apis.length ? (
                  <div className="space-y-1">
                    {c.apis.map((a) => <div key={a} className="mono text-[11.5px] text-navy-700">{a}</div>)}
                  </div>
                ) : <span className="text-slate-400 text-[13px]">—</span>}
              </KeyValue>
              <KeyValue label="Related services">
                <div className="flex flex-wrap gap-1.5">
                  {c.related.map((r) => {
                    const rc = COMPONENT_BY_ID.get(r)
                    return rc ? (
                      <button key={r} onClick={() => open({ kind: 'component', id: r })}
                        className="rounded-md border border-[var(--line)] px-2 py-1 text-[11.5px] text-navy-700 hover:border-navy-500/50 hover:bg-navy-850/[0.03]">
                        {rc.name}
                      </button>
                    ) : null
                  })}
                </div>
              </KeyValue>
            </dl>
          </>
        ),
      }
    }
    case 'lifecycle': {
      const s = LIFECYCLE_BY_ID.get(d.id)
      if (!s) return null
      return {
        eyebrow: `Customer lifecycle · ${s.track} track`,
        title: s.name,
        content: (
          <>
            <p className="text-[14px] leading-relaxed text-slate-700 mb-4">{s.definition}</p>
            <dl>
              <KeyValue label="What happens"><BulletList items={s.whatHappens} tone="primary" /></KeyValue>
              <KeyValue label="Who is involved"><BulletList items={s.whoIsInvolved} /></KeyValue>
              <KeyValue label="Product actions"><BulletList items={s.productActions} tone="verify" /></KeyValue>
              <KeyValue label="Billing state"><span className="font-medium">{s.billingState}</span></KeyValue>
              <KeyValue label="Permissions"><BulletList items={s.permissions} /></KeyValue>
              <KeyValue label="Data state"><BulletList items={s.dataState} /></KeyValue>
              <KeyValue label="Next possible states">
                <div className="flex flex-wrap gap-1.5">
                  {s.nextStates.map((n) => {
                    const t = LIFECYCLE_BY_ID.get(n)
                    return t ? (
                      <button key={n} onClick={() => open({ kind: 'lifecycle', id: n })}
                        className="rounded-md border border-[var(--line)] px-2 py-1 text-[11.5px] text-navy-700 hover:border-navy-500/50 hover:bg-navy-850/[0.03]">
                        {t.name} →
                      </button>
                    ) : null
                  })}
                </div>
              </KeyValue>
            </dl>
          </>
        ),
      }
    }
    case 'relationship': {
      const r = RELATIONSHIPS.find((x) => x.id === d.id)
      if (!r) return null
      const src = ORG_BY_ID.get(r.sourceId), tgt = ORG_BY_ID.get(r.targetId)
      const riskTone = r.risk === 'Low' ? 'verify' : r.risk === 'High' ? 'adverse' : r.risk === 'Medium' ? 'caution' : 'neutral'
      return {
        eyebrow: 'Relationship',
        title: `${src?.name} → ${tgt?.name}`,
        content: (
          <dl>
            <KeyValue label="Relationship type"><span className="mono text-[12.5px]">{r.type}</span></KeyValue>
            <KeyValue label="Source">{src?.name} <span className="mono text-[11.5px] text-slate-500">{src?.bidId}</span></KeyValue>
            <KeyValue label="Target">{tgt?.name} <span className="mono text-[11.5px] text-slate-500">{tgt?.bidId}</span></KeyValue>
            <KeyValue label="Start date"><span className="mono">{r.startDate}</span></KeyValue>
            <KeyValue label="End date"><span className="mono">{r.endDate ?? '—'}</span></KeyValue>
            <KeyValue label="Status"><Chip tone={r.status === 'Active' ? 'verify' : 'neutral'}>{r.status}</Chip></KeyValue>
            <KeyValue label="Risk"><Chip tone={riskTone}>{r.risk}</Chip></KeyValue>
            <KeyValue label="Policy">{r.policy}</KeyValue>
            <KeyValue label="Verification status">{r.verificationStatus}</KeyValue>
            <KeyValue label="Permissions"><BulletList items={r.permissions} /></KeyValue>
            <KeyValue label="Contract reference"><span className="mono">{r.contractRef}</span></KeyValue>
          </dl>
        ),
      }
    }
    case 'entity': {
      const e = DATA_ENTITIES.find((x) => x.id === d.id)
      if (!e) return null
      const tone = e.classification === 'HIGHLY SENSITIVE' ? 'adverse' : e.classification === 'SENSITIVE' ? 'caution' : e.classification === 'PUBLIC' ? 'verify' : 'primary'
      return {
        eyebrow: `Data entity · ${e.group}`,
        title: e.name,
        content: (
          <>
            <p className="text-[14px] leading-relaxed text-slate-700 mb-4">{e.purpose}</p>
            <dl>
              <KeyValue label="Key fields">
                <div className="flex flex-wrap gap-1.5">
                  {e.keyFields.map((f) => <span key={f} className="mono text-[11px] rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-slate-600">{f}</span>)}
                </div>
              </KeyValue>
              <KeyValue label="Relationships"><BulletList items={e.relationships} /></KeyValue>
              <KeyValue label="Security classification"><Chip tone={tone}>{e.classification}</Chip></KeyValue>
              <KeyValue label="Retention considerations">{e.retention}</KeyValue>
            </dl>
          </>
        ),
      }
    }
    case 'event': {
      const ev = EVENTS.find((x) => x.id === d.id)
      if (!ev) return null
      return {
        eyebrow: 'Domain event',
        title: ev.name,
        content: (
          <>
            <p className="text-[14px] leading-relaxed text-slate-700 mb-4">{ev.description}</p>
            <dl>
              <KeyValue label="Producer">{ev.producer}</KeyValue>
              <KeyValue label="Consumers"><BulletList items={ev.consumers} tone="verify" /></KeyValue>
              <KeyValue label="Example payload"><Code value={ev.payload} /></KeyValue>
            </dl>
          </>
        ),
      }
    }
    case 'endpoint': {
      const ep = ENDPOINTS.find((x) => x.id === d.id)
      if (!ep) return null
      return {
        eyebrow: `API · ${ep.method}`,
        title: ep.path,
        content: (
          <>
            <p className="text-[14px] leading-relaxed text-slate-700 mb-4">{ep.purpose}</p>
            <dl>
              <KeyValue label="Authentication">{ep.auth}</KeyValue>
              <KeyValue label="Permissions">
                {ep.permissions.length
                  ? <div className="flex flex-wrap gap-1.5">{ep.permissions.map((p) => <span key={p} className="mono text-[11px] rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-slate-600">{p}</span>)}</div>
                  : <span className="text-slate-400 text-[13px]">None — public tier</span>}
              </KeyValue>
              {ep.request && <KeyValue label="Request"><Code value={ep.request} /></KeyValue>}
              <KeyValue label="Response"><Code value={ep.response} /></KeyValue>
              <KeyValue label="Events generated">
                {ep.events.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {ep.events.map((e) => EVENTS.some((x) => x.id === e)
                      ? <button key={e} onClick={() => open({ kind: 'event', id: e })} className="mono text-[11px] rounded-md bg-verify/10 border border-verify/30 px-2 py-1 text-verify-deep hover:bg-verify/20">{e}</button>
                      : <span key={e} className="mono text-[11px] rounded-md bg-slate-100 border border-slate-200 px-2 py-1 text-slate-500">{e}</span>)}
                  </div>
                ) : <span className="text-slate-400 text-[13px]">—</span>}
              </KeyValue>
            </dl>
          </>
        ),
      }
    }
    case 'adr': {
      const a = ADRS.find((x) => x.id === d.id)
      if (!a) return null
      return {
        eyebrow: `${a.id} · ${a.status}`,
        title: a.title,
        content: (
          <dl>
            <KeyValue label="Context"><p className="leading-relaxed">{a.context}</p></KeyValue>
            <KeyValue label="Decision"><p className="leading-relaxed font-medium text-navy-850">{a.decision}</p></KeyValue>
            <KeyValue label="Consequences"><BulletList items={a.consequences} tone="verify" /></KeyValue>
            <KeyValue label="Alternatives considered">
              <div className="space-y-2.5">
                {a.alternatives.map((alt) => (
                  <div key={alt.option} className="rounded-lg border border-[var(--line)] p-3">
                    <p className="font-medium text-[13px] text-navy-850 mb-1">{alt.option}</p>
                    <p className="text-[12.5px] leading-relaxed text-slate-600">{alt.why}</p>
                  </div>
                ))}
              </div>
            </KeyValue>
          </dl>
        ),
      }
    }
    case 'pipeline': {
      const p = PIPELINE.find((x) => x.id === d.id)
      if (!p) return null
      return {
        eyebrow: 'Verification pipeline step',
        title: p.name,
        content: (
          <>
            <p className="text-[14px] leading-relaxed text-slate-700 mb-4">{p.purpose}</p>
            <dl>
              <KeyValue label="Owner">{p.owner}</KeyValue>
              <KeyValue label="Inputs"><BulletList items={p.inputs} /></KeyValue>
              <KeyValue label="Outputs"><BulletList items={p.outputs} tone="verify" /></KeyValue>
              <KeyValue label="Example data at this step"><Code value={p.sampleData} /></KeyValue>
              <KeyValue label="Failure modes"><BulletList items={p.failureModes} tone="caution" /></KeyValue>
            </dl>
          </>
        ),
      }
    }
    case 'industry': {
      const i = INDUSTRIES.find((x) => x.id === d.id)
      if (!i) return null
      return {
        eyebrow: 'Industry configuration',
        title: i.name,
        content: (
          <>
            <div className={`rounded-lg border p-4 mb-4 ${TONE.verify.chip} ${TONE.verify.border}`}>
              <p className="text-[12px] font-semibold uppercase tracking-wider mb-1">Same core engine</p>
              <p className="text-[13.5px] leading-relaxed">
                No separate application. The only thing that changes for {i.name} is the policy:
                <strong className="block mt-1">{i.policy}</strong>
              </p>
            </div>
            <dl>
              <KeyValue label="Typical relationship types">
                <div className="flex flex-wrap gap-1.5">
                  {i.relationshipTypes.map((r) => <span key={r} className="mono text-[11px] rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-slate-600">{r}</span>)}
                </div>
              </KeyValue>
              <KeyValue label="Distinctive checks in this policy"><BulletList items={i.distinctiveChecks} tone="verify" /></KeyValue>
              <KeyValue label="Why this sector differs">{i.note}</KeyValue>
            </dl>
          </>
        ),
      }
    }
    default:
      return null
  }
}
