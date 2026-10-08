import Link from "next/link";
import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/session";
import { contentCountsByState, marketingContent, userName } from "@/server/repositories/growth";
import { transitionContent } from "@/server/actions/marketing";
import { DataTable, EmptyState, Notice, PageHeader, Panel, Pill, StatusPill, Tabs } from "@/components/academy/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { NewContentForm } from "@/components/academy/marketing/NewContentForm";
import { MARKETING_KINDS, kindLabel, since } from "@/components/academy/marketing/meta";
import type { PublishState } from "@/lib/platform/types";
import type { IconName } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Content studio · EMC Academy" };

const STATES: PublishState[] = ["draft", "review", "approved", "published", "archived"];
const ACTIONS: Record<PublishState, { action: string; label: string; icon: IconName; primary?: boolean }[]> = {
  draft: [{ action: "submit", label: "Submit for review", icon: "arrow", primary: true }, { action: "archive", label: "Archive", icon: "close" }],
  review: [{ action: "approve", label: "Approve", icon: "check", primary: true }, { action: "changes", label: "Request changes", icon: "pen" }],
  approved: [{ action: "publish", label: "Publish", icon: "upload", primary: true }, { action: "changes", label: "Back to draft", icon: "pen" }],
  published: [{ action: "archive", label: "Archive", icon: "close" }],
  archived: [{ action: "restore", label: "Restore as draft", icon: "refresh" }],
};

export default async function ContentStudio({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("marketing.content");
  const sp = await searchParams;
  const state = STATES.includes(sp.state as PublishState) ? (sp.state as PublishState) : undefined;
  const kind = MARKETING_KINDS.some((k) => k.key === sp.kind) ? sp.kind : undefined;
  const items = marketingContent({ kind, state });
  const counts = contentCountsByState();
  const showNew = sp.new === "1";
  const saved = sp.saved ? marketingContent({}).find((c) => c.id === sp.saved) : null;
  const href = (p: { state?: string; kind?: string; new?: string }) => {
    const q = new URLSearchParams();
    const s = "state" in p ? p.state : state;
    const k = "kind" in p ? p.kind : kind;
    if (s) q.set("state", s);
    if (k) q.set("kind", k);
    if (p.new) q.set("new", p.new);
    const str = q.toString();
    return `/academy/marketing/content${str ? `?${str}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        label="Growth"
        title="Content studio"
        intro="Blogs, landing pages, social posts and campaigns — drafted, reviewed by a person, then published."
        actions={!showNew ? <ButtonLink href={href({ new: "1" })} iconLeft="plus" icon={null}>New draft</ButtonLink> : undefined}
      />

      {saved && <Notice>“{saved.title}” saved as a draft.{saved.aiAssisted ? " It’s marked AI-assisted and needs human review before publishing." : ""}</Notice>}

      {showNew && (
        <Panel title="New draft" label="Create">
          <NewContentForm closeHref={href({})} defaultKind={kind} />
        </Panel>
      )}

      {/* Workflow strip */}
      <ol className="grid grid-cols-5 gap-px overflow-hidden rounded-2xl border border-line bg-line" aria-label="Publishing workflow">
        {STATES.map((s, i) => (
          <li key={s} className="bg-white">
            <Link href={href({ state: state === s ? undefined : s })} aria-current={state === s ? "true" : undefined} className={cn("block h-full px-3 py-4 transition-colors hover:bg-mist/60 md:px-5", state === s && "bg-soft/60")}>
              <span className="label flex items-center gap-1.5 !text-[9.5px] md:!text-[10.5px]"><span className="hidden font-mono sm:inline">0{i + 1}</span>{s}</span>
              <span className="mt-2 block text-[22px] font-semibold leading-none tabular-nums md:text-[28px]">{counts[s]}</span>
            </Link>
          </li>
        ))}
      </ol>

      <Tabs
        current={kind ?? "all"}
        items={[{ key: "all", label: "All types", href: href({ kind: undefined }), count: counts.all }, ...MARKETING_KINDS.map((k) => ({ key: k.key, label: k.plural, href: href({ kind: k.key }) }))]}
      />

      <DataTable
        caption="Marketing content"
        rows={items}
        rowKey={(c) => c.id}
        empty={
          <EmptyState
            icon="pen"
            title={state || kind ? "Nothing matches this view" : "No marketing content yet"}
            text={state || kind ? "Try another state or content type." : "Start a draft — it goes through review before anything is published."}
            action={<ButtonLink href={href({ new: "1" })} size="sm" iconLeft="plus" icon={null}>New draft</ButtonLink>}
          />
        }
        columns={[
          {
            key: "title", label: "Title", mobile: "primary",
            render: (c) => (
              <span className="block min-w-0">
                <span className="flex items-center gap-2">
                  <span className="truncate font-medium">{c.title}</span>
                  {c.aiAssisted && <Pill tone="accent"><Icon name="sparkle" size={11} /> AI-assisted</Pill>}
                </span>
                <span className="block text-[12px] text-muted">{kindLabel(c.kind)}</span>
              </span>
            ),
          },
          { key: "state", label: "State", render: (c) => <StatusPill status={c.status} /> },
          { key: "owner", label: "Owner", render: (c) => <span className="whitespace-nowrap text-[13px]">{userName(c.ownerId)}</span> },
          { key: "updated", label: "Updated", mobile: "hide", render: (c) => <span className="whitespace-nowrap font-mono text-[12px] text-muted">{since(c.updatedAt)}</span> },
          {
            key: "actions", label: "Next step", className: "text-right", mobile: "secondary",
            render: (c) => (
              <span className="inline-flex flex-wrap justify-end gap-1.5">
                {ACTIONS[c.status].map((a) => (
                  <form key={a.action} action={transitionContent}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="action" value={a.action} />
                    <button
                      type="submit"
                      className={cn("inline-flex min-h-[36px] items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[12.5px] font-medium transition-colors", a.primary ? "bg-ink text-white hover:bg-navy-2" : "border border-line bg-white hover:border-ink")}
                      aria-label={`${a.label}: ${c.title}`}
                    >
                      <Icon name={a.icon} size={12} /> {a.label}
                    </button>
                  </form>
                ))}
              </span>
            ),
          },
        ]}
      />
      <p className="text-[12.5px] text-muted">Every change is recorded in the audit log. AI output is a draft for human review — never published automatically.</p>
    </div>
  );
}
