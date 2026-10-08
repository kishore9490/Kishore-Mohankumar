import Link from "next/link";
import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/session";
import { templateById, templates } from "@/server/repositories/growth";
import { DataTable, EmptyState, Notice, PageHeader, Panel, Pill, StatusPill, Tabs, humanize } from "@/components/academy/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { TemplateEditor } from "@/components/academy/marketing/TemplateEditor";
import { COMM_CHANNELS, commChannelIcon, commChannelLabel } from "@/components/academy/marketing/meta";

export const metadata: Metadata = { title: "Message templates · EMC Academy" };

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("templates.manage");
  const sp = await searchParams;
  const editing = sp.edit ? templateById(sp.edit) : null;
  const showForm = sp.new === "1" || !!editing;
  const saved = sp.saved ? templateById(sp.saved) : null;
  const channel = COMM_CHANNELS.some((c) => c.key === sp.channel) ? sp.channel : undefined;
  const all = templates();
  const rows = all.filter((t) => !channel || t.channel === channel);

  return (
    <div className="space-y-5">
      <PageHeader
        label="EMC Communication Center"
        title="Message templates"
        intro="Reusable messages for every channel. Automatic ones are sent by the notification engine when their event happens."
        actions={!showForm ? <ButtonLink href="/academy/marketing/templates?new=1" iconLeft="plus" icon={null}>New template</ButtonLink> : undefined}
      />

      {saved && (
        <Notice>
          “{saved.name}” saved.{saved.channel === "whatsapp" && saved.approval === "pending" ? " It’s pending approval with the WhatsApp provider and can’t be sent until approved." : ""}
        </Notice>
      )}

      {showForm && (
        <Panel title={editing ? `Edit “${editing.name}”` : "New template"} label="Template editor">
          <TemplateEditor key={editing?.id ?? "new"} template={editing} closeHref="/academy/marketing/templates" />
        </Panel>
      )}

      <Tabs
        current={channel ?? "all"}
        items={[
          { key: "all", label: "All", href: "/academy/marketing/templates", count: all.length },
          ...COMM_CHANNELS.map((c) => ({ key: c.key, label: c.label, href: `/academy/marketing/templates?channel=${c.key}`, count: all.filter((t) => t.channel === c.key).length })),
        ]}
      />

      <DataTable
        caption="Message templates"
        rows={rows}
        rowKey={(t) => t.id}
        empty={<EmptyState icon="file" title="No templates here" text="Create a template to reuse a message across leads and students." action={<ButtonLink href="/academy/marketing/templates?new=1" size="sm" iconLeft="plus" icon={null}>New template</ButtonLink>} />}
        columns={[
          {
            key: "name", label: "Template", mobile: "primary",
            render: (t) => (
              <span className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft text-blue md:flex"><Icon name={commChannelIcon(t.channel)} size={14} /></span>
                <span className="min-w-0">
                  <Link href={`/academy/marketing/templates?edit=${t.id}`} className="block truncate font-medium hover:text-blue">{t.name}</Link>
                  <span className="block max-w-[260px] truncate text-[12px] text-muted">{t.purpose || "—"}</span>
                </span>
              </span>
            ),
          },
          { key: "channel", label: "Channel", render: (t) => <span className="text-[13px]">{commChannelLabel(t.channel)}</span> },
          { key: "event", label: "Event · category", render: (t) => (
            <span className="block text-[13px]">
              <span className="block font-mono text-[12px]">{t.event ?? "manual"}</span>
              <span className="block text-[12px] text-muted">{humanize(t.category)}</span>
            </span>
          ) },
          { key: "vars", label: "Variables", mobile: "hide", render: (t) => (
            <span className="flex max-w-[240px] flex-wrap gap-1">
              {t.variables.length ? t.variables.map((v) => <span key={v} className="rounded bg-cyan/10 px-1.5 py-0.5 font-mono text-[10.5px] text-cyan-ink">{v}</span>) : <span className="text-[12px] text-muted">none</span>}
            </span>
          ) },
          { key: "status", label: "Status", render: (t) => <StatusPill status={t.status} /> },
          { key: "approval", label: "Approval", render: (t) => (t.approval === "not_required" ? <span className="text-[12px] text-muted">Not required</span> : <Pill tone={t.approval === "approved" ? "success" : t.approval === "rejected" ? "danger" : "warning"} dot>{humanize(t.approval)}</Pill>) },
          { key: "edit", label: "", className: "text-right", mobile: "hide", render: (t) => <Link href={`/academy/marketing/templates?edit=${t.id}`} className="inline-flex min-h-[36px] items-center rounded-full px-3 text-[12.5px] font-medium text-blue hover:bg-mist" aria-label={`Edit ${t.name}`}>Edit</Link> },
        ]}
      />
      <p className="text-[12.5px] text-muted">Security templates (password reset) are always sent, regardless of notification preferences. Marketing messages respect each person’s opt-in.</p>
    </div>
  );
}
