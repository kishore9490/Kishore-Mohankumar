import Link from "next/link";
import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/session";
import { can } from "@/lib/platform/rbac";
import {
  campaignStats, followUps, funnelCounts, growthSummary, leadsBySource, recentEnquiries, userName, weeklyLeads,
} from "@/server/repositories/growth";
import { formatTime, formatShortDate, greeting, inr } from "@/lib/platform/format";
import { BarChart, Funnel, HBars } from "@/components/academy/charts";
import { DemoBadge, EmptyState, Metrics, Notice, Panel, Pill, StatusPill, TextLink } from "@/components/academy/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FUNNEL_STAGES, channelLabel, leadStatusLabel, since, sourceLabel } from "@/components/academy/marketing/meta";

export const metadata: Metadata = { title: "Growth center · EMC Academy" };

export default async function GrowthCenter({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requirePermission("leads.view");
  const { denied } = await searchParams;
  const s = growthSummary();
  const funnel = funnelCounts();
  const due = followUps(user.id);
  const dueMine = due.filter((d) => d.mine).length;
  const overdue = due.filter((d) => d.overdue).length;
  const sources = leadsBySource();
  const camps = campaignStats().filter((c) => c.leads > 0).sort((a, b) => b.conversions - a.conversions || (a.cpl ?? Infinity) - (b.cpl ?? Infinity)).slice(0, 3);
  const recent = recentEnquiries(6);
  const weekly = weeklyLeads(8);
  const freshWeb = recent.filter((l) => l.source === "website" && l.status === "new").length;
  const canEdit = can(user, "leads.edit");

  return (
    <div className="space-y-5">
      {denied && <Notice tone="warning">That area isn’t part of your account, so we brought you back to the Growth center.</Notice>}

      {/* Focal band */}
      <section aria-labelledby="growth-title" className="relative overflow-hidden rounded-[22px] bg-ink text-white">
        <div className="grid-bg-dark absolute inset-0" aria-hidden="true" />
        <div className="absolute -right-24 -top-28 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(18,181,212,.24),transparent_62%)]" aria-hidden="true" />
        <div className="relative grid gap-8 p-6 md:p-9 lg:grid-cols-[1.15fr_1fr] lg:items-end">
          <div>
            <p className="label flex items-center gap-2 !text-white/55"><span className="inline-block h-px w-5 bg-cyan" aria-hidden="true" />EMC Growth Center</p>
            <h1 id="growth-title" className="heading mt-4 text-[34px] md:text-[48px]">{greeting()}, {user.firstName}.</h1>
            <p className="mt-3 max-w-md text-[15.5px] leading-relaxed text-white/65">
              {due.length ? <>You have <span className="font-semibold text-white">{due.length} follow-up{due.length === 1 ? "" : "s"}</span> due today{overdue ? <>, {overdue} overdue</> : null}.</> : "No follow-ups due today."}{" "}
              {freshWeb ? <>{freshWeb} new website enquir{freshWeb === 1 ? "y is" : "ies are"} waiting for a first call.</> : null}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {canEdit && <ButtonLink href="/academy/marketing/leads?new=1" variant="accent" iconLeft="plus" icon={null}>New lead</ButtonLink>}
              <ButtonLink href="/academy/marketing/leads?followup=due" variant="outline-light">Work follow-ups</ButtonLink>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
            {[
              { k: "Due today", v: due.length, h: `${dueMine} mine`, href: "/academy/marketing/leads?followup=due" },
              { k: "Demos booked", v: s.demosBooked, h: "upcoming", href: "/academy/marketing/leads?status=demo_booked" },
              { k: "New this week", v: s.newThisWeek, h: "enquiries", href: "/academy/marketing/leads" },
            ].map((m) => (
              <div key={m.k} className="bg-ink/80">
                <Link href={m.href} className="block p-4 transition-colors hover:bg-white/5 md:p-5">
                  <dt className="label !text-[9.5px] !text-white/50">{m.k}</dt>
                  <dd className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.03em] tabular-nums md:text-[36px]">{m.v}</dd>
                  <p className="mt-2 font-mono text-[11px] text-cyan">{m.h}</p>
                </Link>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Metrics */}
      <Metrics
        items={[
          { label: "Visitors", value: <span className="text-muted">—</span>, hint: <span className="inline-flex items-center gap-1"><Icon name="plug" size={12} /> Connect analytics</span> },
          { label: "Leads", value: s.leads, hint: `${s.newThisWeek} this week`, href: "/academy/marketing/leads" },
          { label: "Counselling", value: s.counselling, hint: "reached counselling", href: "/academy/marketing/leads?stage=counselling" },
          { label: "Demo requests", value: s.demos, hint: `${s.demosBooked} booked, not yet held`, href: "/academy/marketing/leads?stage=demo" },
          { label: "Applications", value: s.applications, hint: "applied or admitted", href: "/academy/marketing/leads?stage=application" },
          { label: "Admissions", value: s.admissions, hint: "converted leads", href: "/academy/marketing/leads?stage=admission" },
          { label: "Conversion rate", value: `${s.conversionRate}%`, hint: "leads → admission" },
          { label: "Lost", value: s.lost, hint: "with a recorded reason", href: "/academy/marketing/leads?status=lost" },
        ]}
      />

      {/* Funnel + follow-ups */}
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Admissions funnel" label="Where are our leads?" action={<DemoBadge />}>
          <div className="mb-2 grid grid-cols-[96px_1fr_auto] items-center gap-3 rounded-xl px-2 py-1.5 sm:grid-cols-[130px_1fr_auto]">
            <span className="text-[13.5px] font-medium text-muted">Visitors</span>
            <span className="flex h-9 min-w-0 items-center truncate rounded-lg border border-dashed border-line px-3 text-[12.5px] text-muted">Not tracked<span className="hidden sm:inline">&nbsp;yet — connect analytics</span></span>
            <span className="w-[76px] text-right text-[15px] font-semibold text-muted">—</span>
          </div>
          <Funnel stages={FUNNEL_STAGES.map((st) => ({ key: st.key, label: st.label, value: funnel.find((f) => f.key === st.key)?.value ?? 0, href: `/academy/marketing/leads?stage=${st.key}` }))} />
          <p className="mt-4 text-[12.5px] text-muted">Counts are cumulative — a converted lead also passed counselling, demo and application. Select a stage to open those leads.</p>
        </Panel>

        <Panel title="Follow-ups" label="Due today & overdue" action={<TextLink href="/academy/marketing/leads?followup=due">All {due.length}</TextLink>}>
          {due.length === 0 ? (
            <EmptyState icon="check" title="You’re all caught up" text="No follow-ups are due today. New enquiries will show up here." />
          ) : (
            <ul className="space-y-2">
              {due.slice(0, 6).map(({ lead, overdue: od, mine }) => (
                <li key={lead.id}>
                  <Link href={`/academy/marketing/leads/${lead.id}`} className="flex items-center gap-3 rounded-xl border border-line p-3.5 transition-colors hover:border-ink/30">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${od ? "bg-orange-50 text-orange-800" : "bg-soft text-blue"}`}>
                      <Icon name={od ? "alert" : "phone"} size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] font-medium">{lead.name}</span>
                      <span className="block truncate text-[12.5px] text-muted">{leadStatusLabel(lead.status)} · {mine ? "You" : userName(lead.assignedTo)}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className={`block font-mono text-[12px] ${od ? "text-orange-800" : ""}`}>{od ? formatShortDate(lead.nextFollowUpAt!) : formatTime(lead.nextFollowUpAt!)}</span>
                      <span className="block font-mono text-[10.5px] text-muted">{od ? "overdue" : "today"}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Sources, campaigns, weekly */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Leads by source" label="Where leads come from">
          {sources.length === 0 ? <p className="text-[14px] text-muted">No leads yet.</p> : (
            <HBars data={sources.slice(0, 7).map((x) => ({ label: sourceLabel(x.source), value: x.total, note: x.converted ? `${x.converted} conv.` : undefined, href: `/academy/marketing/leads?source=${x.source}` }))} />
          )}
        </Panel>
        <Panel title="Campaigns that work" label="Conversions, then cost per lead" action={<TextLink href="/academy/marketing/campaigns">All</TextLink>}>
          {camps.length === 0 ? (
            <EmptyState icon="target" title="No campaign leads yet" text="Leads tagged with a campaign will be ranked here." />
          ) : (
            <ol className="space-y-2">
              {camps.map((c, i) => (
                <li key={c.campaign.id} className="flex items-center gap-3 rounded-xl border border-line p-3.5">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[12px] ${i === 0 ? "bg-cyan text-ink" : "bg-mist text-ink"}`}>{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium">{c.campaign.name}</span>
                    <span className="block truncate text-[12px] text-muted">{channelLabel(c.campaign.channel)} · {c.leads} leads · {c.conversions} conv.</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[14px] font-semibold tabular-nums">{c.cpl !== null ? inr(c.cpl) : "—"}</span>
                    <span className="block font-mono text-[10px] text-muted">CPL</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-3 text-[11.5px] text-muted">Spend and revenue are demo figures.</p>
        </Panel>
        <Panel title="Leads per week" label="Last 8 weeks">
          <BarChart data={weekly} label="Leads created per week, last 8 weeks" />
          <div className="mt-4"><TextLink href="/academy/marketing/analytics">Open analytics</TextLink></div>
        </Panel>
      </div>

      {/* Recent enquiries */}
      <Panel title="Recent enquiries" label="New website enquiries first" action={<TextLink href="/academy/marketing/leads">All leads</TextLink>}>
        {recent.length === 0 ? (
          <EmptyState icon="users" title="No enquiries yet" text="Enquiries from the website forms and campaigns appear here as they arrive." />
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((l) => {
              const fresh = l.source === "website" && l.status === "new";
              return (
                <li key={l.id}>
                  <Link href={`/academy/marketing/leads/${l.id}`} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-mist/60">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soft font-mono text-[12px] text-blue" aria-hidden="true">
                      {l.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[14.5px] font-medium">{l.name}</span>
                        {fresh && <Pill tone="accent" dot>Website</Pill>}
                      </span>
                      <span className="block truncate text-[12.5px] text-muted">{l.programInterest ?? "Program not specified"} · {sourceLabel(l.source)}</span>
                    </span>
                    <span className="hidden sm:block"><StatusPill status={l.status} label={leadStatusLabel(l.status)} /></span>
                    <span className="w-[72px] shrink-0 text-right font-mono text-[11.5px] text-muted">{since(l.createdAt)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
