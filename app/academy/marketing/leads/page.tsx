import Link from "next/link";
import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/session";
import { can } from "@/lib/platform/rbac";
import { db } from "@/server/db/store";
import { assignableUsers, campaignName, filterLeads, followUpDue, isStage, startOfTodayIST, userName, type LeadFilters } from "@/server/repositories/growth";
import { formatShortDate } from "@/lib/platform/format";
import { DataTable, EmptyState, PageHeader, Pill, StatusPill, Tabs } from "@/components/academy/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { NewLeadDrawer } from "@/components/academy/marketing/NewLeadDrawer";
import { FUNNEL_STAGES, LEAD_SOURCES, LEAD_STATUSES, leadStatusLabel, since, sourceLabel } from "@/components/academy/marketing/meta";
import type { Lead } from "@/lib/platform/types";

export const metadata: Metadata = { title: "Leads · EMC Academy" };

const PER_PAGE = 25;
type SP = LeadFilters & { page?: string; new?: string };

function qs(base: SP, patch: Partial<SP>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...base, ...patch })) if (v) p.set(k, String(v));
  const s = p.toString();
  return `/academy/marketing/leads${s ? `?${s}` : ""}`;
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requirePermission("leads.view");
  const raw = await searchParams;
  const clip = (v?: string, n = 40) => (v ? v.slice(0, n) : undefined);
  const sp: SP = {
    stage: isStage(raw.stage) ? raw.stage : undefined,
    status: LEAD_STATUSES.some((s) => s.key === raw.status) ? raw.status : undefined,
    source: LEAD_SOURCES.some((s) => s.key === raw.source) ? raw.source : undefined,
    assigned: raw.assigned === "me" || raw.assigned === "none" ? raw.assigned : undefined,
    followup: raw.followup === "due" ? "due" : undefined,
    campaign: clip(raw.campaign),
    q: clip(raw.q, 80),
  };
  const page = Math.max(1, Number.parseInt(raw.page ?? "1", 10) || 1);
  const all = filterLeads(sp, user.id);
  const pages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const current = Math.min(page, pages);
  const rows = all.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const canEdit = can(user, "leads.edit");
  const showNew = raw.new === "1" && canEdit;
  const base: SP = { ...sp, page: current > 1 ? String(current) : undefined };
  const filtersOn = Object.values(sp).some(Boolean);
  const startToday = startOfTodayIST();

  const quick = sp.followup === "due" && !sp.assigned ? "due" : sp.assigned === "me" && !sp.followup ? "mine" : sp.assigned === "none" ? "unassigned" : !filtersOn ? "all" : "custom";
  const d = db();
  const count = (f: LeadFilters) => filterLeads(f, user.id).length;

  const chips: { label: string; clear: Partial<SP> }[] = [];
  if (sp.stage) chips.push({ label: `Stage: ${FUNNEL_STAGES.find((s) => s.key === sp.stage)?.label} and beyond`, clear: { stage: undefined } });
  if (sp.status) chips.push({ label: `Status: ${leadStatusLabel(sp.status as Lead["status"])}`, clear: { status: undefined } });
  if (sp.source) chips.push({ label: `Source: ${sourceLabel(sp.source as Lead["source"])}`, clear: { source: undefined } });
  if (sp.campaign) chips.push({ label: `Campaign: ${campaignName(sp.campaign)}`, clear: { campaign: undefined } });
  if (sp.assigned) chips.push({ label: sp.assigned === "me" ? "Assigned to me" : "Unassigned", clear: { assigned: undefined } });
  if (sp.followup) chips.push({ label: "Follow-up due", clear: { followup: undefined } });
  if (sp.q) chips.push({ label: `“${sp.q}”`, clear: { q: undefined } });

  return (
    <div className="space-y-5">
      <PageHeader
        label="Lead management"
        title="Leads"
        intro="Every enquiry from the website, campaigns and walk-ins — with who owns it and what happens next."
        actions={canEdit ? <ButtonLink href={qs(base, { new: "1" })} scroll={false} iconLeft="plus" icon={null}>New lead</ButtonLink> : undefined}
      />

      <Tabs
        current={quick}
        items={[
          { key: "all", label: "All leads", href: "/academy/marketing/leads", count: d.leads.length },
          { key: "due", label: "Follow-up due", href: "/academy/marketing/leads?followup=due", count: count({ followup: "due" }) },
          { key: "mine", label: "My leads", href: "/academy/marketing/leads?assigned=me", count: count({ assigned: "me" }) },
          { key: "unassigned", label: "Unassigned", href: "/academy/marketing/leads?assigned=none", count: count({ assigned: "none" }) },
        ]}
      />

      {/* Filters — a plain GET form, so filters live in the URL and work without JavaScript */}
      <form method="get" action="/academy/marketing/leads" className="grid grid-cols-2 gap-2 rounded-2xl border border-line bg-white p-3 lg:grid-cols-[1.6fr_repeat(4,1fr)_auto]" role="search" aria-label="Filter leads">
        <label className="relative col-span-2 block lg:col-span-1">
          <span className="sr-only">Search by name, phone, email or program</span>
          <Icon name="search" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={sp.q} placeholder="Search name, phone, email…" className="field !py-2 !pl-10 !text-[14px] min-h-[40px]" maxLength={80} />
        </label>
        <label className="block"><span className="sr-only">Stage</span>
          <select name="stage" defaultValue={sp.stage ?? ""} className="field !py-2 !text-[14px] min-h-[40px]">
            <option value="">Any stage</option>
            {FUNNEL_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}{s.key === "leads" ? "" : " +"}</option>)}
          </select>
        </label>
        <label className="block"><span className="sr-only">Status</span>
          <select name="status" defaultValue={sp.status ?? ""} className="field !py-2 !text-[14px] min-h-[40px]">
            <option value="">Any status</option>
            {LEAD_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </label>
        <label className="block"><span className="sr-only">Source</span>
          <select name="source" defaultValue={sp.source ?? ""} className="field !py-2 !text-[14px] min-h-[40px]">
            <option value="">Any source</option>
            {LEAD_SOURCES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </label>
        <label className="block"><span className="sr-only">Owner</span>
          <select name="assigned" defaultValue={sp.assigned ?? ""} className="field !py-2 !text-[14px] min-h-[40px]">
            <option value="">Anyone</option>
            <option value="me">Assigned to me</option>
            <option value="none">Unassigned</option>
          </select>
        </label>
        {sp.followup && <input type="hidden" name="followup" value={sp.followup} />}
        {sp.campaign && <input type="hidden" name="campaign" value={sp.campaign} />}
        <button type="submit" className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full bg-ink px-5 text-[13.5px] font-medium text-white hover:bg-navy-2 col-span-2 lg:col-span-1">
          <Icon name="filter" size={15} /> Apply
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13.5px] text-muted" aria-live="polite">
          <span className="font-semibold text-ink tabular-nums">{all.length}</span> lead{all.length === 1 ? "" : "s"}
          {all.length > PER_PAGE && <> · showing {(current - 1) * PER_PAGE + 1}–{Math.min(current * PER_PAGE, all.length)}</>}
        </p>
        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {chips.map((c) => (
              <Link key={c.label} href={qs(sp, c.clear)} className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[12.5px] hover:border-ink/40" aria-label={`Remove filter ${c.label}`}>
                {c.label} <Icon name="close" size={12} className="text-muted" />
              </Link>
            ))}
            <Link href="/academy/marketing/leads" className="px-2 text-[12.5px] font-medium text-blue hover:text-ink">Clear all</Link>
          </div>
        )}
      </div>

      <DataTable
        caption="Leads"
        rows={rows}
        rowKey={(l) => l.id}
        rowHref={(l) => `/academy/marketing/leads/${l.id}`}
        empty={
          <EmptyState
            icon="users"
            title={filtersOn ? "No leads match these filters" : "No leads yet"}
            text={filtersOn ? "Try removing a filter or searching by phone number." : "Enquiries from the website and campaigns will appear here. You can also add one by hand."}
            action={filtersOn ? <ButtonLink href="/academy/marketing/leads" variant="outline" size="sm" icon={null}>Clear filters</ButtonLink> : canEdit ? <ButtonLink href="/academy/marketing/leads?new=1" size="sm" iconLeft="plus" icon={null}>New lead</ButtonLink> : undefined}
          />
        }
        columns={[
          {
            key: "name", label: "Lead", mobile: "primary",
            render: (l) => (
              <span className="block min-w-0">
                <span className="block truncate">{l.name}</span>
                <span className="block max-w-[200px] truncate text-[12px] font-normal text-muted">{l.programInterest ?? "Program not specified"}</span>
              </span>
            ),
          },
          {
            key: "contact", label: "Contact", mobile: "secondary",
            render: (l) => (
              <span className="block min-w-0 text-[13px]">
                <span className="block whitespace-nowrap font-mono text-[12.5px]">{l.phone}</span>
                <span className="block max-w-[180px] truncate text-[12px] text-muted">{l.email ?? "No email"}</span>
              </span>
            ),
          },
          {
            key: "source", label: "Source · campaign",
            render: (l) => (
              <span className="block min-w-0 text-[13px]">
                <span className="block">{sourceLabel(l.source)}</span>
                <span className="block max-w-[150px] truncate text-[12px] text-muted">{l.campaignId ? campaignName(l.campaignId) : "No campaign"}</span>
              </span>
            ),
          },
          { key: "status", label: "Status", render: (l) => <StatusPill status={l.status} label={leadStatusLabel(l.status)} /> },
          { key: "owner", label: "Owner", render: (l) => <span className={`whitespace-nowrap text-[13px] ${l.assignedTo ? "" : "text-muted"}`}>{l.assignedTo === user.id ? "You" : userName(l.assignedTo)}</span> },
          {
            key: "last", label: "Contacted · created", mobile: "hide",
            render: (l) => (
              <span className="block whitespace-nowrap font-mono text-[12px]">
                <span className="block">{l.lastContactAt ? since(l.lastContactAt) : "Never"}</span>
                <span className="block text-[11px] text-muted">{formatShortDate(l.createdAt)}</span>
              </span>
            ),
          },
          {
            key: "next", label: "Follow-up",
            render: (l) => {
              if (!l.nextFollowUpAt) return <span className="text-[12px] text-muted">—</span>;
              const overdue = followUpDue(l) && new Date(l.nextFollowUpAt).getTime() < startToday;
              const today = followUpDue(l) && !overdue;
              return overdue ? <span title="Overdue"><Pill tone="danger" dot>{formatShortDate(l.nextFollowUpAt)}<span className="sr-only"> overdue</span></Pill></span> : today ? <Pill tone="accent">Today</Pill> : <span className="whitespace-nowrap font-mono text-[12px]">{formatShortDate(l.nextFollowUpAt)}</span>;
            },
          },
        ]}
      />

      {pages > 1 && (
        <nav className="flex items-center justify-between gap-3" aria-label="Pagination">
          {current > 1 ? <ButtonLink href={qs(sp, { page: String(current - 1) })} variant="outline" size="sm" icon={null} iconLeft="chevron" className="[&>svg]:rotate-180">Previous</ButtonLink> : <span />}
          <span className="font-mono text-[12px] text-muted">Page {current} of {pages}</span>
          {current < pages ? <ButtonLink href={qs(sp, { page: String(current + 1) })} variant="outline" size="sm" icon="chevron">Next</ButtonLink> : <span />}
        </nav>
      )}

      {showNew && (
        <NewLeadDrawer
          closeHref={qs(base, {})}
          programs={d.programs.map((p) => p.name)}
          campaigns={d.campaigns.filter((c) => c.status !== "ended").map((c) => ({ id: c.id, name: c.name }))}
          team={assignableUsers().map((u) => ({ id: u.id, name: u.name }))}
          currentUserId={user.id}
        />
      )}
    </div>
  );
}
