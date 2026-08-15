import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ENDPOINTS } from '@/data/api'
import { EVENTS } from '@/data/catalog'
import { useExplorer } from '@/state/explorer'
import { Code, Note, Panel, SectionHeader } from '@/components/ui'

/** §26 — API explorer. */

const METHOD_STYLE: Record<string, string> = {
  GET: 'bg-verify/12 text-verify-deep border-verify/35',
  POST: 'bg-navy-850/[0.07] text-navy-700 border-navy-500/30',
  PATCH: 'bg-caution/12 text-[#8A5A05] border-caution/40',
  DELETE: 'bg-adverse/10 text-[#B32D33] border-adverse/35',
}

export default function ApiArchitecture() {
  const { open, highlightId } = useExplorer()
  const [selected, setSelected] = useState(ENDPOINTS[0].id)
  const ep = ENDPOINTS.find((e) => e.id === selected)!

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1400px]">
      <SectionHeader
        eyebrow="API architecture"
        title="API-first, versioned, scoped"
        subtitle="Every endpoint returns only what the caller is entitled to — the disclosure tier is resolved server-side and never trusted from the client. Demo JSON only; there is no live backend in this prototype."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
        <div className="space-y-1.5">
          {ENDPOINTS.map((e) => (
            <button
              key={e.id}
              onClick={() => { setSelected(e.id); open({ kind: 'endpoint', id: e.id }) }}
              onMouseEnter={() => setSelected(e.id)}
              className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all ${
                selected === e.id ? 'border-verify/50 bg-verify/[0.05] shadow-sm' : 'border-[var(--line)] bg-white hover:border-navy-500/40'
              } ${highlightId === e.id ? 'ring-2 ring-verify ring-offset-2' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`mono text-[9.5px] font-bold rounded border px-1.5 py-0.5 ${METHOD_STYLE[e.method]}`}>
                  {e.method}
                </span>
                <span className="mono text-[11.5px] text-navy-850 truncate">{e.path}</span>
              </div>
              <p className="text-[11.5px] text-slate-500 truncate">{e.summary}</p>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={ep.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}>
            <Panel className="mb-4">
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className={`mono text-[11px] font-bold rounded border px-2 py-1 ${METHOD_STYLE[ep.method]}`}>{ep.method}</span>
                <span className="mono text-[15px] font-medium text-navy-850">{ep.path}</span>
              </div>
              <p className="text-[13.5px] leading-relaxed text-slate-600 mb-4">{ep.purpose}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="eyebrow mb-1.5">Authentication</p>
                  <p className="text-[12.5px] text-slate-700">{ep.auth}</p>
                </div>
                <div>
                  <p className="eyebrow mb-1.5">Permissions</p>
                  {ep.permissions.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {ep.permissions.map((p) => (
                        <span key={p} className="mono text-[10.5px] rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-slate-600">{p}</span>
                      ))}
                    </div>
                  ) : <p className="text-[12.5px] text-slate-400">None — public tier</p>}
                </div>
              </div>

              {ep.request && (
                <div className="mb-4">
                  <p className="eyebrow mb-1.5">Request</p>
                  <Code value={ep.request} />
                </div>
              )}

              <div className="mb-4">
                <p className="eyebrow mb-1.5">Response</p>
                <Code value={ep.response} />
              </div>

              <div>
                <p className="eyebrow mb-1.5">Events generated</p>
                {ep.events.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {ep.events.map((e) =>
                      EVENTS.some((x) => x.id === e) ? (
                        <button key={e} onClick={() => open({ kind: 'event', id: e })}
                          className="mono text-[11px] rounded-md bg-verify/10 border border-verify/30 px-2 py-1 text-verify-deep hover:bg-verify/20">
                          {e}
                        </button>
                      ) : (
                        <span key={e} className="mono text-[11px] rounded-md bg-slate-100 border border-slate-200 px-2 py-1 text-slate-500">{e}</span>
                      ),
                    )}
                  </div>
                ) : <p className="text-[12.5px] text-slate-400">None</p>}
              </div>
            </Panel>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Note tone="primary">
          <strong>Webhook payloads carry identifiers, not detail.</strong> A consumer receives an event
          with an id and fetches the detail over an authenticated, authorized call — so a leaked
          webhook endpoint never leaks sensitive verification data.
        </Note>
        <Note tone="caution">
          <strong>Purpose is mandatory.</strong> A verification request without a stated purpose is
          rejected at the API boundary. Purpose limitation is enforced in code by the ABAC layer,
          not in a policy document.
        </Note>
      </div>
    </div>
  )
}
