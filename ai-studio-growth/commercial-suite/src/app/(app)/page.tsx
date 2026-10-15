import Link from "next/link";
import { AlertTriangle, ArrowRight, FileSignature, FileSpreadsheet, FileText, Receipt, Send, Wallet, CircleDollarSign, FilePlus2, FileCheck2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { DOCUMENT_TYPE_META, effectiveStatus, type DocumentStatus, type DocumentType } from "@/lib/documents/meta";
import { dec, formatMoney, sum } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/dates";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SampleBadge, StatusBadge } from "@/components/ui/badge";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { DocNumber } from "@/components/documents/doc-link";
import { CreateMenu } from "@/components/shell/topbar";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const [docs, recent, activity, comms, sampleCount] = await Promise.all([
    prisma.document.findMany({ select: { id: true, type: true, status: true, validUntil: true, dueDate: true, grandTotal: true, amountPaid: true } }),
    prisma.document.findMany({ orderBy: { updatedAt: "desc" }, take: 8, include: { customer: { select: { name: true, id: true } } } }),
    prisma.auditEvent.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: { select: { name: true } } } }),
    prisma.communicationLog.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { customer: { select: { name: true } } } }),
    prisma.document.count({ where: { isSample: true } }),
  ]);

  const withStatus = docs.map((d) => ({ ...d, eff: effectiveStatus({ ...d, type: d.type as DocumentType, status: d.status as DocumentStatus }) }));
  const quotations = withStatus.filter((d) => d.type === "QUOTATION");
  const invoices = withStatus.filter((d) => d.type === "INVOICE");
  const open = invoices.filter((d) => ["ISSUED", "PARTIALLY_PAID", "OVERDUE"].includes(d.eff));
  const balance = (d: (typeof invoices)[number]) => dec(d.grandTotal.toString()).minus(dec(d.amountPaid.toString()));
  const outstanding = sum(open.map(balance));
  const overdue = open.filter((d) => d.eff === "OVERDUE");
  const paid = invoices.filter((d) => d.eff === "PAID");
  const drafts = withStatus.filter((d) => d.eff === "DRAFT");
  const collected = sum(invoices.map((d) => d.amountPaid.toString()));

  const segments = [
    { label: "Collected", value: collected, cls: "bg-emerald-500" },
    { label: "Outstanding (not yet due)", value: sum(open.filter((d) => d.eff !== "OVERDUE").map(balance)), cls: "bg-brand-500" },
    { label: "Overdue", value: sum(overdue.map(balance)), cls: "bg-red-500" },
  ];
  const segTotal = sum(segments.map((s) => s.value));

  const kpis = [
    { label: "Total quotations", value: String(quotations.length), sub: `${quotations.filter((q) => q.eff === "ACCEPTED").length} accepted · ${quotations.filter((q) => q.eff === "SENT").length} awaiting response`, icon: FileText, href: "/documents/quotations" },
    { label: "Total invoices", value: String(invoices.filter((i) => i.eff !== "DRAFT" && i.eff !== "CANCELLED").length), sub: `${invoices.filter((i) => i.eff === "DRAFT").length} draft · ${invoices.filter((i) => i.eff === "CANCELLED").length} cancelled`, icon: Receipt, href: "/documents/invoices" },
    { label: "Outstanding receivables", value: formatMoney(outstanding), sub: `${open.length} open invoice${open.length === 1 ? "" : "s"} · ${overdue.length} overdue`, icon: Wallet, href: "/documents/invoices?status=OVERDUE", warn: overdue.length > 0 },
    { label: "Paid invoices", value: String(paid.length), sub: `${formatMoney(collected)} collected in total`, icon: CircleDollarSign, href: "/documents/invoices?status=PAID" },
    { label: "Draft documents", value: String(drafts.length), sub: "Across all document types", icon: FileCheck2, href: "/history" },
  ];

  return (
    <>
      {denied && <div className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">That page is restricted to administrators.</div>}
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="An overview of your commercial documents, receivables and recent activity."
      />
      {sampleCount > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
          <SampleBadge />
          <span>This workspace includes <strong>{sampleCount} sample documents</strong> for demonstration. Figures below include them; they are not real transactions.</span>
          {user.role === "ADMIN" && <Link href="/settings/company#sample-data" className="ml-auto font-medium text-amber-900 underline underline-offset-2">Manage sample data</Link>}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="group">
            <Card className="h-full p-4 transition-shadow group-hover:shadow-md">
              <div className="flex items-start justify-between">
                <span className="text-[13px] font-medium text-muted">{k.label}</span>
                <span className={`flex size-8 items-center justify-center rounded-lg ${k.warn ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-600"}`}>
                  {k.warn ? <AlertTriangle className="size-4" /> : <k.icon className="size-4" />}
                </span>
              </div>
              <div className="mt-3 font-display text-2xl font-bold tracking-tight text-ink tabular">{k.value}</div>
              <div className="mt-1 text-xs text-muted">{k.sub}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Recent documents" description="Most recently created or updated" actions={<Link href="/history" className="text-[13px] font-medium text-brand-700 hover:underline">View history</Link>} />
          {recent.length === 0 ? (
            <EmptyState icon={FilePlus2} title="No documents yet" description="Create your first quotation, proposal or invoice to see it here." action={<CreateMenu />} />
          ) : (
            <Table>
              <thead>
                <tr><Th>Document</Th><Th>Customer</Th><Th className="hidden md:table-cell">Date</Th><Th className="text-right">Amount</Th><Th>Status</Th></tr>
              </thead>
              <tbody>
                {recent.map((d) => (
                  <Tr key={d.id}>
                    <Td>
                      <div className="flex items-center gap-2"><DocNumber doc={d} />{d.isSample && <SampleBadge />}</div>
                      <div className="text-xs text-muted">{DOCUMENT_TYPE_META[d.type as DocumentType].label}</div>
                    </Td>
                    <Td><Link href={`/customers/${d.customer.id}`} className="hover:text-brand-700">{d.customer.name}</Link></Td>
                    <Td className="hidden text-muted md:table-cell">{formatDate(d.issueDate, "short")}</Td>
                    <Td className="text-right font-medium tabular">{formatMoney(d.grandTotal.toString())}</Td>
                    <Td><StatusBadge status={effectiveStatus({ ...d, type: d.type as DocumentType, status: d.status as DocumentStatus })} /></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader title="Invoice & payment status" description="Based on recorded invoices and payments" />
          <CardBody>
            {segTotal.isZero() ? (
              <p className="text-sm text-muted">No issued invoices yet. Issued invoices and recorded payments will be summarised here.</p>
            ) : (
              <>
                <div className="flex h-3 overflow-hidden rounded-full bg-slate-100" role="img" aria-label="Invoice amounts by payment state">
                  {segments.map((s) => (
                    <div key={s.label} className={s.cls} style={{ width: `${s.value.dividedBy(segTotal).times(100).toFixed(2)}%` }} />
                  ))}
                </div>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {segments.map((s) => (
                    <li key={s.label} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-muted"><span className={`size-2.5 rounded-full ${s.cls}`} />{s.label}</span>
                      <span className="font-medium tabular">{formatMoney(s.value)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-6 grid grid-cols-2 gap-2">
              {(["PROPOSAL", "QUOTATION", "INVOICE", "PROFORMA"] as DocumentType[]).map((t) => {
                const Icon = { PROPOSAL: FileSignature, QUOTATION: FileText, INVOICE: Receipt, PROFORMA: FileSpreadsheet }[t];
                return (
                  <Link key={t} href={`/documents/${DOCUMENT_TYPE_META[t].slug}/new`} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-[13px] font-medium text-ink hover:border-brand-300 hover:bg-brand-50/50">
                    <Icon className="size-4 text-brand-600" /> New {DOCUMENT_TYPE_META[t].label.replace("Commercial ", "")}
                  </Link>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent activity" description="Document and payment events" />
          {activity.length === 0 ? (
            <CardBody><p className="text-sm text-muted">No activity recorded yet.</p></CardBody>
          ) : (
            <ul className="divide-y divide-line">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                  <span className="mt-1.5 size-2 rounded-full bg-brand-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">{a.summary}</p>
                    <p className="text-xs text-muted">{a.user?.name ?? "System"} · {formatDateTime(a.createdAt)}</p>
                  </div>
                  {a.documentId && <Link href={`/history?document=${a.documentId}`} className="text-muted hover:text-brand-700" aria-label="View document history"><ArrowRight className="size-4" /></Link>}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardHeader title="Recent customer communications" actions={<Link href="/communications" className="text-[13px] font-medium text-brand-700 hover:underline">View all</Link>} />
          {comms.length === 0 ? (
            <EmptyState icon={Send} title="No messages sent yet" description="Emails and WhatsApp messages sent from documents will appear here with their delivery status." />
          ) : (
            <ul className="divide-y divide-line">
              {comms.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate text-ink">{c.customer?.name ?? c.recipient}</p>
                    <p className="text-xs text-muted">{c.channel.replace("_", " ").toLowerCase()} · {formatDateTime(c.createdAt)}</p>
                  </div>
                  <span className="text-xs font-medium text-muted">{c.status.replaceAll("_", " ").toLowerCase()}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
