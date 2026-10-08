import Link from "next/link";
import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/session";
import { communications, deliveryStats } from "@/server/repositories/growth";
import { integrationStatuses } from "@/integrations/registry";
import { formatDateTime, formatShortDate, formatTime } from "@/lib/platform/format";
import { EmptyState, PageHeader, Panel, Pill, StatusPill, Tabs, humanize } from "@/components/academy/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { RetryButton } from "@/components/academy/marketing/RetryButton";
import { COMM_CHANNELS, COMM_STATUSES, commChannelIcon, commChannelLabel } from "@/components/academy/marketing/meta";
import type { CommChannel, CommStatus } from "@/lib/platform/types";

export const metadata: Metadata = { title: "Communication center · EMC Academy" };

const PER_PAGE = 30;

export default async function CommunicationsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("communications.view");
  const raw = await searchParams;
  const channel = COMM_CHANNELS.some((c) => c.key === raw.channel) ? (raw.channel as CommChannel) : undefined;
  const status = COMM_STATUSES.includes(raw.status as CommStatus) ? (raw.status as CommStatus) : undefined;
  const page = Math.max(1, Number.parseInt(raw.page ?? "1", 10) || 1);
  const all = communications({ channel, status });
  const pages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const rows = all.slice((Math.min(page, pages) - 1) * PER_PAGE, Math.min(page, pages) * PER_PAGE);
  const stats = deliveryStats();
  const providers = integrationStatuses().filter((i) => i.category === "communication");
  const href = (p: { channel?: string; status?: string; page?: number }) => {
    const q = new URLSearchParams();
    const c = "channel" in p ? p.channel : channel;
    const s = "status" in p ? p.status : status;
    if (c) q.set("channel", c);
    if (s) q.set("status", s);
    if (p.page && p.page > 1) q.set("page", String(p.page));
    const str = q.toString();
    return `/academy/marketing/communications${str ? `?${str}` : ""}`;
  };

  // Group the visible page by IST day for the timeline.
  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const k = formatShortDate(r.comm.createdAt);
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        label="EMC Communication Center"
        title="Every message, one history."
        intro="Email, WhatsApp, SMS and in-app notices sent to leads and students — what went out, what was delivered, and what needs attention."
      />

      {/* Provider status strip (no credentials, ever) */}
      <section aria-label="Provider status" className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
        {providers.map((p) => (
          <div key={p.key} className="flex items-center gap-3 bg-white px-5 py-4">
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", p.status === "connected" ? "bg-emerald-50 text-emerald-800" : p.status === "error" ? "bg-orange-50 text-orange-800" : "bg-soft text-blue")}>
              <Icon name={p.key === "email" ? "mail" : p.key === "whatsapp" ? "whatsapp" : "phone"} size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">{p.label}</p>
              <p className="truncate text-[12px] text-muted">{p.provider}{p.lastSuccessAt ? ` · last ok ${formatShortDate(p.lastSuccessAt)}` : ""}</p>
            </div>
            <StatusPill status={p.status} label={p.status === "simulated" ? "Simulated" : humanize(p.status)} />
          </div>
        ))}
      </section>
      <p className="-mt-2 text-[12.5px] text-muted">Simulated providers record messages but send nothing. A Super Admin connects real providers in Integrations; credentials stay on the server.</p>

      {/* Delivery stats */}
      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-6">
        {([
          ["All", stats.total, undefined],
          ["Sent", stats.sent, "sent"],
          ["Delivered", stats.delivered, "delivered"],
          ["Read", stats.read, "read"],
          ["Failed", stats.failed, "failed"],
          ["Skipped", stats.skipped, "skipped"],
        ] as const).map(([k, v, s]) => (
          <div key={k} className="bg-white">
            <Link href={href({ status: s, page: 1 })} aria-current={status === s ? "true" : undefined} className={cn("block h-full p-4 transition-colors hover:bg-mist/60 md:p-5", status === s && "bg-soft/60")}>
              <dt className="label !text-[10px]">{k}</dt>
              <dd className={cn("mt-2.5 text-[26px] font-semibold leading-none tracking-[-0.03em] tabular-nums", k === "Failed" && v > 0 && "text-orange-800")}>{v}</dd>
              {stats.total > 0 && k !== "All" && <p className="mt-1.5 font-mono text-[11px] text-muted">{Math.round((v / stats.total) * 100)}%</p>}
            </Link>
          </div>
        ))}
      </dl>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs
          current={channel ?? "all"}
          items={[{ key: "all", label: "All channels", href: href({ channel: undefined, page: 1 }) }, ...COMM_CHANNELS.map((c) => ({ key: c.key, label: c.label, href: href({ channel: c.key, page: 1 }) }))]}
        />
        {status && (
          <Link href={href({ status: undefined, page: 1 })} className="inline-flex min-h-[32px] items-center gap-1.5 self-start rounded-full border border-line bg-white px-3 text-[12.5px] hover:border-ink/40">
            Status: {humanize(status)} <Icon name="close" size={12} className="text-muted" />
          </Link>
        )}
      </div>

      <Panel title="Timeline" label={`${all.length} message${all.length === 1 ? "" : "s"}${channel ? ` · ${commChannelLabel(channel)}` : ""}${status ? ` · ${status}` : ""}`}>
        {rows.length === 0 ? (
          <EmptyState icon="message" title="No messages match" text={channel || status ? "Try another channel or status." : "Messages appear here as soon as the platform sends its first notification."} action={channel || status ? <ButtonLink href="/academy/marketing/communications" size="sm" variant="outline" icon={null}>Clear filters</ButtonLink> : undefined} />
        ) : (
          <div className="space-y-6">
            {[...groups.entries()].map(([dayLabel, items]) => (
              <section key={dayLabel} aria-label={dayLabel}>
                <p className="label sticky top-0 !text-[10px]">{dayLabel}</p>
                <ul className="mt-2 divide-y divide-line">
                  {items.map(({ comm: c, recipient, template }) => (
                    <li key={c.id} className="flex gap-3 py-3.5 md:gap-4">
                      <span className="w-12 shrink-0 pt-1 font-mono text-[11.5px] text-muted md:w-14">{formatTime(c.createdAt)}</span>
                      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", c.status === "failed" ? "bg-orange-50 text-orange-800" : "bg-soft text-blue")}>
                        <Icon name={commChannelIcon(c.channel)} size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          {recipient.href ? <Link href={recipient.href} className="text-[14px] font-medium hover:text-blue">{recipient.name}</Link> : <span className="text-[14px] font-medium">{recipient.name}</span>}
                          <Pill>{recipient.type}</Pill>
                          <StatusPill status={c.status} />
                        </div>
                        <p className="mt-1 line-clamp-2 break-words text-[13.5px] text-ink/80">{c.preview}</p>
                        <p className="mt-1 text-[12px] text-muted">
                          {[commChannelLabel(c.channel), template ?? "No template", c.event ? (c.event === "manual" ? "sent manually" : `event ${c.event}`) : null, c.provider === "simulated" ? "simulated" : c.provider && c.provider !== "—" && c.provider !== "in_app" ? c.provider : null].filter(Boolean).join(" · ")}
                        </p>
                        {c.error && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <p className="rounded-lg bg-orange-50 px-2.5 py-1.5 text-[12.5px] text-orange-900">{c.status === "skipped" ? "Skipped" : "Failed"}: {c.error}{c.failedAt ? ` · ${formatDateTime(c.failedAt)}` : ""}</p>
                            {c.status === "failed" && c.channel !== "in_app" && <RetryButton id={c.id} />}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
        {pages > 1 && (
          <nav className="mt-5 flex items-center justify-between border-t border-line pt-4" aria-label="Pagination">
            {page > 1 ? <ButtonLink href={href({ page: page - 1 })} variant="outline" size="sm" icon={null}>Newer</ButtonLink> : <span />}
            <span className="font-mono text-[12px] text-muted">Page {Math.min(page, pages)} of {pages}</span>
            {page < pages ? <ButtonLink href={href({ page: page + 1 })} variant="outline" size="sm" icon="chevron">Older</ButtonLink> : <span />}
          </nav>
        )}
      </Panel>
    </div>
  );
}
