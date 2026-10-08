import Link from "next/link";
import { requirePermission } from "@/server/auth/session";
import { financeOverview, invoiceDetail, outstanding } from "@/server/repositories/admin";
import { recordOfflinePayment, sendPaymentReminder } from "@/server/actions/admin";
import { integrationStatuses } from "@/integrations/registry";
import { formatDate, inr } from "@/lib/platform/format";
import { can } from "@/lib/platform/rbac";
import { DataTable, DemoBadge, EmptyState, Metrics, Notice, PageHeader, Panel, ProgressBar, StatusPill, Tabs, humanize } from "@/components/academy/ui";
import { ActionButton, ActionForm, Field, Select } from "@/components/academy/admin/forms";
import { KeyValues, ManagePanel, Pager, SubHead } from "@/components/academy/admin/bits";
import { Icon } from "@/components/ui/Icon";

export const metadata = { title: "Finance · EMC Academy" };

const STATUSES = ["all", "overdue", "partially_paid", "pending", "paid", "refunded"] as const;

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ status?: string; invoice?: string; page?: string }> }) {
  const user = await requirePermission("finance.view");
  const sp = await searchParams;
  const status = (STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status! : "all";
  const fin = financeOverview(status);
  const t = fin.totals;
  const PAGE = 12;
  const pages = Math.max(1, Math.ceil(fin.invoices.length / PAGE));
  const page = Math.min(pages, Math.max(1, Number(sp.page) || 1));
  const detail = sp.invoice ? invoiceDetail(sp.invoice) : null;
  const gateway = integrationStatuses().find((i) => i.key === "payments");
  const today = new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
  const href = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status: status === "all" ? undefined : status, page: page > 1 ? String(page) : undefined, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `/academy/admin/finance${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <PageHeader
        label="Academy · Finance"
        title="Fees & payments."
        intro="Invoices, instalments and payments. Online payment collection switches on once a gateway is configured; until then, Finance records offline payments here."
        actions={<DemoBadge />}
      />
      <div className="space-y-5">
        <Metrics
          items={[
            { label: "Collected", value: inr(t.collected), hint: `${t.billed ? Math.round((t.collected / t.billed) * 100) : 0}% of ${inr(t.billed)} billed` },
            { label: "Outstanding", value: inr(t.outstanding), hint: "Not yet received", href: href({ status: "partially_paid", page: undefined }) },
            { label: "Overdue", value: <span className={t.overdue ? "text-orange-800" : ""}>{inr(t.overdue)}</span>, hint: `${t.overdueCount} invoice${t.overdueCount === 1 ? "" : "s"} past due`, href: href({ status: "overdue", page: undefined }) },
            { label: "Refunded", value: inr(t.refunded), hint: "Refunds are recorded manually for now" },
          ]}
        />

        {detail && (
          <ManagePanel
            id="manage"
            label={`Invoice · ${detail.student}`}
            title={<span className="flex flex-wrap items-center gap-2.5"><span className="font-mono text-[15px]">{detail.invoice.number}</span> <StatusPill status={detail.overdue && detail.invoice.status !== "paid" ? "overdue" : detail.invoice.status} /></span>}
            closeHref={href({})}
          >
            <div className="grid gap-8 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-line">
              <section className="min-w-0 lg:pr-7">
                <SubHead>Summary</SubHead>
                <KeyValues
                  className="mt-3"
                  items={[
                    ["Student", detail.student],
                    ["For", detail.invoice.description],
                    ["Amount", inr(detail.invoice.amount)],
                    ["Paid", inr(detail.invoice.paid)],
                    ["Outstanding", inr(outstanding(detail.invoice))],
                    ["Due", formatDate(detail.invoice.dueDate)],
                  ]}
                />
                <p className="label mt-6 !text-[10px]">Instalments</p>
                <ul className="mt-2 divide-y divide-line">
                  {detail.invoice.installments.map((i) => (
                    <li key={i.label} className="flex items-center justify-between gap-3 py-2 text-[13.5px]">
                      <span><span className="block">{i.label}</span><span className="font-mono text-[11px] text-muted">due {formatDate(i.dueDate)}</span></span>
                      <span className="flex items-center gap-2"><span className="tabular-nums">{inr(i.amount)}</span><StatusPill status={i.paid ? "paid" : new Date(i.dueDate).getTime() < Date.now() ? "overdue" : "pending"} /></span>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="min-w-0 lg:px-7">
                <SubHead>Record offline payment</SubHead>
                <p className="mt-1 text-[13px] text-muted">Cash or bank transfer received at the EMC office.</p>
                {outstanding(detail.invoice) > 0 ? (
                  <div className="mt-3">
                    <ActionForm action={recordOfflinePayment} submit="Record payment" submitIcon="check" hidden={{ invoiceId: detail.invoice.id }} confirm="Record this payment? The student is notified.">
                      <Field name="amount" label="Amount (₹)" type="number" min={1} max={outstanding(detail.invoice)} defaultValue={detail.invoice.installments.find((i) => !i.paid)?.amount ?? outstanding(detail.invoice)} />
                      <Select name="method" label="Method" defaultValue="bank_transfer" options={[{ value: "bank_transfer", label: "Bank transfer" }, { value: "cash", label: "Cash" }]} />
                      <Field name="reference" label="Reference / UTR" optional maxLength={60} hint="Required for bank transfers." />
                      <Field name="paidOn" label="Received on" type="date" optional max={today} />
                    </ActionForm>
                  </div>
                ) : <p className="mt-3 rounded-xl bg-mist px-4 py-4 text-[13.5px] text-muted">Fully paid — nothing to record.</p>}
              </section>
              <section className="min-w-0 lg:pl-7">
                <SubHead>Reminder</SubHead>
                <p className="mt-1 text-[13px] text-muted">Sends the “Payment reminder” template through the notification engine. It respects the student’s channel preferences.</p>
                <div className="mt-3">
                  {can(user, "communications.send") && outstanding(detail.invoice) > 0 ? (
                    <ActionButton action={sendPaymentReminder} fields={{ invoiceId: detail.invoice.id }} label="Send reminder" icon="bell" confirm="Send a payment reminder to this student?" />
                  ) : <p className="text-[13px] text-muted">{outstanding(detail.invoice) > 0 ? "Needs the “Send communications” permission." : "Nothing outstanding."}</p>}
                </div>
                <p className="label mt-6 !text-[10px]">Payments on this invoice</p>
                {detail.payments.length === 0 ? <p className="mt-2 text-[13.5px] text-muted">No payments yet.</p> : (
                  <ul className="mt-2 divide-y divide-line">
                    {detail.payments.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-[13.5px]">
                        <span><span className="block tabular-nums font-medium">{inr(p.amount)}</span><span className="font-mono text-[11px] text-muted">{formatDate(p.paidAt)} · {humanize(p.method)}</span></span>
                        <StatusPill status={p.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </ManagePanel>
        )}
        {sp.invoice && !detail && <Notice tone="warning">That invoice doesn’t exist.</Notice>}

        <Tabs
          current={status}
          items={STATUSES.map((s) => ({ key: s, label: s === "all" ? "All invoices" : humanize(s), href: href({ status: s === "all" ? undefined : s, page: undefined }), count: s === "overdue" ? t.overdueCount : fin.counts[s] ?? 0 }))}
        />
        <DataTable
          caption="Invoices"
          rows={fin.invoices.slice((page - 1) * PAGE, page * PAGE)}
          rowKey={(r) => r.invoice.id}
          rowHref={(r) => href({ invoice: r.invoice.id }) + "#manage"}
          empty={<EmptyState icon="wallet" title="No invoices here" text="Invoices in this state will appear here." />}
          columns={[
            { key: "number", label: "Invoice", mobile: "primary", render: (r) => <span className="block"><span className="block font-mono text-[13px]">{r.invoice.number}</span><span className="block text-[12.5px] font-normal text-muted">{r.student}</span></span> },
            { key: "amount", label: "Amount", render: (r) => <span className="tabular-nums">{inr(r.invoice.amount)}</span> },
            { key: "paid", label: "Paid", render: (r) => <span className="flex items-center gap-2"><ProgressBar value={(r.invoice.paid / r.invoice.amount) * 100} className="w-14" label="Paid" /><span className="tabular-nums text-[12.5px]">{inr(r.invoice.paid)}</span></span> },
            { key: "due", label: "Due", render: (r) => <span className={`font-mono text-[12.5px] ${r.overdue ? "text-orange-800" : "text-muted"}`}>{formatDate(r.invoice.dueDate)}</span> },
            { key: "inst", label: "Instalments", mobile: "hide", render: (r) => <span className="tabular-nums text-muted">{r.invoice.installments.filter((i) => i.paid).length}/{r.invoice.installments.length} paid</span> },
            { key: "status", label: "Status", render: (r) => <StatusPill status={r.overdue && r.invoice.status !== "paid" ? "overdue" : r.invoice.status} /> },
          ]}
        />

        <Pager page={page} pages={pages} total={fin.invoices.length} label="invoices" href={(p) => href({ page: p > 1 ? String(p) : undefined, invoice: undefined })} />

        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <Panel title="Recent payments" label="Latest 10">
            {fin.payments.length === 0 ? <EmptyState icon="wallet" title="No payments yet" text="Payments appear here as they are received or recorded." /> : (
              <ul className="divide-y divide-line">
                {fin.payments.map(({ payment: p, invoiceNumber, student }) => (
                  <li key={p.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soft text-blue"><Icon name="wallet" size={15} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium">{student}</span>
                      <span className="block truncate font-mono text-[11px] text-muted">{invoiceNumber} · {humanize(p.method)}{p.provider === "offline" ? " · offline" : ""}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block tabular-nums text-[14px] font-semibold">{inr(p.amount)}</span>
                      <span className="block font-mono text-[11px] text-muted">{formatDate(p.paidAt)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <div className="space-y-5">
            <Panel title="Payment gateway" label="Integrations">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mist text-muted"><Icon name="plug" size={17} /></span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">{gateway?.configured ? gateway.provider : "No gateway connected"} <StatusPill status={gateway?.status ?? "not_configured"} /></p>
                  <p className="mt-1 text-[13.5px] text-muted">{gateway?.configured ? "Gateway settings are present. Webhooks are verified before any invoice is marked paid." : "Not configured — no gateway is integrated until configured. Razorpay or Stripe can be added without changing this screen."}</p>
                </div>
              </div>
              <p className="mt-4 text-[13px]"><Link href="/academy/admin/integrations#payments" className="font-medium text-blue hover:text-ink">Open integrations</Link></p>
            </Panel>
            <Panel title="Refunds" label="Placeholder">
              <p className="text-[14px] text-muted">Refund requests and approvals will live here. Today, refunds are handled offline and recorded by Finance; the invoice status becomes “Refunded”.</p>
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
