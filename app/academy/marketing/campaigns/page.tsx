import Link from "next/link";
import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/session";
import { campaignStats } from "@/server/repositories/growth";
import { toggleCampaign } from "@/server/actions/marketing";
import { formatShortDate, inr } from "@/lib/platform/format";
import { DataTable, DemoBadge, EmptyState, Notice, PageHeader, Panel, StatusPill } from "@/components/academy/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CampaignForm } from "@/components/academy/marketing/CampaignForm";
import { channelLabel } from "@/components/academy/marketing/meta";

export const metadata: Metadata = { title: "Campaigns · EMC Academy" };

export default async function CampaignsPage({ searchParams }: { searchParams: Promise<{ new?: string; edit?: string; saved?: string }> }) {
  await requirePermission("campaigns.manage");
  const sp = await searchParams;
  const stats = campaignStats().sort((a, b) => Number(b.campaign.status === "active") - Number(a.campaign.status === "active") || b.leads - a.leads);
  const editing = sp.edit ? stats.find((s) => s.campaign.id === sp.edit)?.campaign ?? null : null;
  const showForm = sp.new === "1" || !!editing;
  const saved = sp.saved ? stats.find((s) => s.campaign.id === sp.saved)?.campaign : null;

  const totals = stats.reduce((t, s) => ({ budget: t.budget + s.campaign.budget, spend: t.spend + s.campaign.spend, leads: t.leads + s.leads, conv: t.conv + s.conversions, revenue: t.revenue + s.campaign.revenue }), { budget: 0, spend: 0, leads: 0, conv: 0, revenue: 0 });
  const roi = totals.spend ? Math.round(((totals.revenue - totals.spend) / totals.spend) * 100) : null;
  const best = stats.filter((s) => s.cpl !== null).sort((a, b) => a.cpl! - b.cpl!)[0];

  return (
    <div className="space-y-5">
      <PageHeader
        label="Growth"
        title="Campaigns"
        intro="What each channel costs and what it brings in. Leads and conversions come from tagged leads; spend and revenue are demo figures."
        actions={<><DemoBadge />{!showForm && <ButtonLink href="/academy/marketing/campaigns?new=1" iconLeft="plus" icon={null}>New campaign</ButtonLink>}</>}
      />

      {saved && <Notice>“{saved.name}” saved.</Notice>}

      {showForm && (
        <Panel title={editing ? `Edit “${editing.name}”` : "New campaign"} label={editing ? "Campaign settings" : "Create"}>
          <CampaignForm campaign={editing} closeHref="/academy/marketing/campaigns" />
        </Panel>
      )}

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Budget", inr(totals.budget), `${stats.length} campaigns`],
          ["Spend", inr(totals.spend), totals.budget ? `${Math.round((totals.spend / totals.budget) * 100)}% of budget` : "—"],
          ["Leads", String(totals.leads), "tagged to a campaign"],
          ["Blended CPL", totals.leads ? inr(Math.round(totals.spend / totals.leads)) : "—", best ? `best: ${channelLabel(best.campaign.channel)}` : "—"],
          ["Conversions", String(totals.conv), `${totals.leads ? Math.round((totals.conv / totals.leads) * 100) : 0}% of campaign leads`],
          ["ROI", roi !== null ? `${roi}%` : "—", `${inr(totals.revenue)} revenue`],
        ].map(([k, v, h]) => (
          <div key={k} className="bg-white p-5">
            <dt className="label !text-[10.5px]">{k}</dt>
            <dd className="mt-3 truncate text-[24px] font-semibold leading-none tracking-[-0.03em] tabular-nums md:text-[26px]">{v}</dd>
            <p className="mt-2 truncate text-[12px] text-muted">{h}</p>
          </div>
        ))}
      </dl>

      <DataTable
        caption="Campaign performance"
        rows={stats}
        rowKey={(s) => s.campaign.id}
        empty={<EmptyState icon="target" title="No campaigns yet" text="Create a campaign, then tag leads with it to see cost per lead and conversions." action={<ButtonLink href="/academy/marketing/campaigns?new=1" size="sm" iconLeft="plus" icon={null}>New campaign</ButtonLink>} />}
        columns={[
          {
            key: "name", label: "Campaign", mobile: "primary",
            render: (s) => (
              <span className="block min-w-0">
                <Link href={`/academy/marketing/campaigns?edit=${s.campaign.id}`} className="block truncate font-medium hover:text-blue">{s.campaign.name}</Link>
                <span className="block text-[12px] text-muted">{channelLabel(s.campaign.channel)} · from {formatShortDate(s.campaign.startDate)}</span>
              </span>
            ),
          },
          { key: "status", label: "Status", render: (s) => <StatusPill status={s.campaign.status} /> },
          {
            key: "budget", label: "Spend / budget", className: "text-right",
            render: (s) => (
              <span className="block whitespace-nowrap text-[13px] tabular-nums">
                {inr(s.campaign.spend)}<span className="text-muted"> / {inr(s.campaign.budget)}</span>
                <span className="mt-1 block h-1 overflow-hidden rounded-full bg-mist"><span className="block h-full rounded-full bg-blue/50" style={{ width: `${Math.min(100, s.campaign.budget ? (s.campaign.spend / s.campaign.budget) * 100 : 0)}%` }} /></span>
              </span>
            ),
          },
          { key: "leads", label: "Leads", className: "text-right", render: (s) => <Link href={`/academy/marketing/leads?campaign=${s.campaign.id}`} className="tabular-nums hover:text-blue">{s.leads}</Link> },
          { key: "cpl", label: "CPL", className: "text-right", render: (s) => <span className="tabular-nums">{s.cpl !== null ? inr(s.cpl) : "—"}</span> },
          { key: "conv", label: "Conv.", className: "text-right", render: (s) => <span className="tabular-nums">{s.conversions}<span className="text-[11px] text-muted"> · {s.conversionRate}%</span></span> },
          { key: "rev", label: "Revenue", className: "text-right", render: (s) => <span className="tabular-nums">{inr(s.campaign.revenue)}</span> },
          { key: "roi", label: "ROI", className: "text-right", render: (s) => <span className={`font-medium tabular-nums ${s.roi !== null && s.roi < 0 ? "text-orange-800" : ""}`}>{s.roi !== null ? `${s.roi}%` : "—"}</span> },
          {
            key: "act", label: "Actions", className: "text-right", mobile: "secondary",
            render: (s) => (
              <span className="inline-flex items-center gap-1">
                {(s.campaign.status === "active" || s.campaign.status === "paused") && (
                  <form action={toggleCampaign}>
                    <input type="hidden" name="id" value={s.campaign.id} />
                    <button type="submit" className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[12.5px] font-medium hover:border-ink" aria-label={`${s.campaign.status === "active" ? "Pause" : "Resume"} ${s.campaign.name}`}>
                      <Icon name={s.campaign.status === "active" ? "clock" : "play"} size={13} />
                      {s.campaign.status === "active" ? "Pause" : "Resume"}
                    </button>
                  </form>
                )}
                <Link href={`/academy/marketing/campaigns?edit=${s.campaign.id}`} className="inline-flex min-h-[36px] items-center rounded-full px-3 text-[12.5px] font-medium text-blue hover:bg-mist" aria-label={`Edit ${s.campaign.name}`}>Edit</Link>
              </span>
            ),
          },
        ]}
      />
      <p className="text-[12.5px] text-muted">CPL = spend ÷ leads tagged to the campaign. ROI = (revenue − spend) ÷ spend. Conversions count leads marked Converted.</p>
    </div>
  );
}
