import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/session";
import { campaignStats, followUpSla, funnelCounts, growthSummary, leadsBySource, leadsOverTime } from "@/server/repositories/growth";
import { integrationStatuses } from "@/integrations/registry";
import { inr } from "@/lib/platform/format";
import { BarChart, HBars, LineChart } from "@/components/academy/charts";
import { DemoBadge, Metrics, PageHeader, Panel, ProgressBar, Ring } from "@/components/academy/ui";
import { Icon } from "@/components/ui/Icon";
import { FUNNEL_STAGES, sourceLabel } from "@/components/academy/marketing/meta";

export const metadata: Metadata = { title: "Analytics · EMC Academy" };

export default async function AnalyticsPage() {
  await requirePermission("analytics.view");
  const s = growthSummary();
  const weekly = leadsOverTime(12);
  const sources = leadsBySource().filter((x) => x.total >= 3).sort((a, b) => b.rate - a.rate || b.total - a.total);
  const funnel = funnelCounts();
  const camps = campaignStats().filter((c) => c.cpl !== null).sort((a, b) => a.cpl! - b.cpl!);
  const sla = followUpSla();
  const analytics = integrationStatuses().find((i) => i.key === "analytics");
  const last4 = weekly.slice(-4).reduce((n, w) => n + w.value, 0);
  const prev4 = weekly.slice(-8, -4).reduce((n, w) => n + w.value, 0);
  const trend = prev4 ? Math.round(((last4 - prev4) / prev4) * 100) : null;

  return (
    <div className="space-y-5">
      <PageHeader
        label="Measure"
        title="Growth analytics"
        intro="How enquiries turn into admissions — computed from lead records, so every number traces back to a lead."
        actions={<DemoBadge />}
      />

      <Metrics
        items={[
          { label: "Leads (12 wks)", value: weekly.reduce((n, w) => n + w.value, 0), hint: trend !== null ? `${trend >= 0 ? "+" : ""}${trend}% last 4 wks vs prior 4` : "not enough history" },
          { label: "Conversion rate", value: `${s.conversionRate}%`, hint: `${s.admissions} of ${s.leads} leads admitted` },
          { label: "Contacted < 24 h", value: sla.rate !== null ? `${sla.rate}%` : "—", hint: `${sla.within} of ${sla.eligible} leads` },
          { label: "Page views", value: <span className="text-muted">—</span>, hint: "Not connected" },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Leads over time" label="Weekly, last 12 weeks">
          <LineChart data={weekly} label="Leads created per week" height={190} />
        </Panel>
        <Panel title="Follow-up SLA" label="First human contact within 24 h">
          <div className="flex items-center gap-5">
            <Ring value={sla.rate ?? 0} size={104} stroke={8} label="Leads contacted within 24 hours" />
            <dl className="grid flex-1 gap-2.5 text-[13.5px]">
              <div className="flex justify-between gap-2"><dt className="text-muted">Within 24 h</dt><dd className="font-semibold tabular-nums">{sla.within}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted">Later</dt><dd className="font-semibold tabular-nums">{sla.eligible - sla.within - sla.never}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted">Never contacted</dt><dd className={`font-semibold tabular-nums ${sla.never ? "text-orange-800" : ""}`}>{sla.never}</dd></div>
            </dl>
          </div>
          <p className="mt-4 text-[12.5px] text-muted">Counts leads older than 24 h (or already contacted). Contact = a call, message, counselling or demo logged by a team member.</p>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Funnel conversion" label="Stage-to-stage rates">
          <ol className="space-y-3.5">
            {FUNNEL_STAGES.map((st, i) => {
              const v = funnel.find((f) => f.key === st.key)?.value ?? 0;
              const prev = i ? funnel.find((f) => f.key === FUNNEL_STAGES[i - 1].key)?.value ?? 0 : null;
              const rate = prev ? Math.round((v / prev) * 100) : null;
              const ofAll = s.leads ? Math.round((v / s.leads) * 100) : 0;
              return (
                <li key={st.key}>
                  <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                    <span className="font-medium">{st.label}</span>
                    <span className="tabular-nums"><span className="font-semibold">{v}</span><span className="ml-2 font-mono text-[11px] text-muted">{rate !== null ? `${rate}% of ${FUNNEL_STAGES[i - 1].label.toLowerCase()}` : "all leads"}</span></span>
                  </div>
                  <ProgressBar value={ofAll} tone={i === FUNNEL_STAGES.length - 1 ? "cyan" : "ink"} className="mt-1.5 !h-2" label={`${st.label}: ${ofAll}% of leads`} />
                </li>
              );
            })}
          </ol>
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-dashed border-line px-3.5 py-2.5 text-[12.5px] text-muted">
            <Icon name="plug" size={14} /> Visitor → lead rate needs website analytics. Not connected.
          </div>
        </Panel>

        <Panel title="Conversion by source" label="Sources with 3+ leads">
          {sources.length === 0 ? <p className="text-[14px] text-muted">Not enough leads per source yet.</p> : (
            <HBars max={100} format={(v) => `${v}%`} data={sources.map((x) => ({ label: sourceLabel(x.source), value: x.rate, note: `${x.converted}/${x.total}`, href: `/academy/marketing/leads?source=${x.source}` }))} />
          )}
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Cost per lead by campaign" label="Lower is better · demo spend">
          {camps.length === 0 ? <p className="text-[14px] text-muted">No campaign has tagged leads yet.</p> : (
            <>
              <BarChart highlightLast={false} data={camps.map((c) => ({ label: c.campaign.name.split(/[—-]/)[0].trim().slice(0, 14), value: c.cpl! }))} format={(v) => inr(v)} label="Cost per lead by campaign" height={180} />
              <ul className="mt-4 grid gap-1.5 text-[12.5px] text-muted sm:grid-cols-2">
                {camps.map((c) => <li key={c.campaign.id} className="truncate"><span className="font-medium text-ink">{inr(c.cpl!)}</span> · {c.campaign.name} ({c.leads} leads)</li>)}
              </ul>
            </>
          )}
        </Panel>
        <Panel title="Needs the analytics integration" label="Not connected">
          <ul className="divide-y divide-line">
            {["Website visitors", "Page views", "Visitor → lead rate", "Traffic sources & UTM attribution", "Landing page performance"].map((m) => (
              <li key={m} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                <span>{m}</span>
                <span className="font-mono text-[11px] text-muted">Not connected</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12.5px] text-muted">
            Current analytics provider: {analytics?.provider ?? "none"} (events only). We don’t estimate these numbers — connect a web analytics provider to see them.
          </p>
        </Panel>
      </div>
    </div>
  );
}
