import Link from "next/link";
import { notFound } from "next/navigation";
import { FilePlus2, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { DOCUMENT_TYPE_META, FILTER_STATUSES, STATUS_META, effectiveStatus, balanceDue, typeFromSlug, type DocumentStatus, type DocumentType } from "@/lib/documents/meta";
import { formatMoney, sum } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Button, buttonClass } from "@/components/ui/button";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { SampleBadge, StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DocNumber } from "@/components/documents/doc-link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ kind: string }> }) {
  const t = typeFromSlug((await params).kind);
  return { title: t ? DOCUMENT_TYPE_META[t].plural : "Documents" };
}

export default async function DocumentListPage({ params, searchParams }: { params: Promise<{ kind: string }>; searchParams: Promise<{ q?: string; status?: string; customer?: string }> }) {
  await requireUser();
  const { kind } = await params;
  const { q = "", status = "", customer = "" } = await searchParams;
  const type = typeFromSlug(kind);
  if (!type) notFound();
  const meta = DOCUMENT_TYPE_META[type];
  const where: Prisma.DocumentWhereInput = {
    type,
    ...(customer ? { customerId: customer } : {}),
    ...(q ? { OR: [{ number: { contains: q, mode: "insensitive" } }, { title: { contains: q, mode: "insensitive" } }, { customer: { name: { contains: q, mode: "insensitive" } } }] } : {}),
  };
  const docs = await prisma.document.findMany({ where, orderBy: [{ issueDate: "desc" }, { createdAt: "desc" }], include: { customer: { select: { id: true, name: true } } }, take: 500 });
  const rows = docs
    .map((d) => ({ ...d, eff: effectiveStatus({ ...d, type: d.type as DocumentType, status: d.status as DocumentStatus }) }))
    .filter((d) => !status || d.eff === status);
  const isInvoice = type === "INVOICE";
  const openRows = rows.filter((r) => ["ISSUED", "PARTIALLY_PAID", "OVERDUE"].includes(r.eff));
  const dateLabel = meta.dateLabel === "validUntil" ? "Valid until" : "Due";

  return (
    <>
      <PageHeader
        title={meta.plural}
        description={
          type === "PROFORMA"
            ? "Proforma invoices request advance payment or approval. They are not tax invoices."
            : type === "INVOICE"
              ? "GST tax invoices. Numbers are assigned when an invoice is issued, from the configured series."
              : type === "PROPOSAL"
                ? "Premium multi-section commercial proposals."
                : "Priced offers with validity. Accepted quotations can be converted into invoices."
        }
        actions={<Link href={`/documents/${meta.slug}/new`} className={buttonClass()}><FilePlus2 /> New {meta.label}</Link>}
      />
      {isInvoice && (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Card className="p-4"><div className="text-xs text-muted">Outstanding (filtered)</div><div className="mt-1 text-lg font-semibold tabular">{formatMoney(sum(openRows.map((r) => balanceDue(r))))}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted">Overdue invoices</div><div className="mt-1 text-lg font-semibold text-red-600 tabular">{rows.filter((r) => r.eff === "OVERDUE").length}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted">Collected (filtered)</div><div className="mt-1 text-lg font-semibold text-emerald-700 tabular">{formatMoney(sum(rows.map((r) => r.amountPaid.toString())))}</div></Card>
        </div>
      )}
      <Card>
        <form className="flex flex-wrap items-center gap-2 border-b border-line p-4" role="search">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <Input name="q" defaultValue={q} placeholder="Search number, title or customer" className="pl-9" aria-label="Search documents" />
          </div>
          <Select name="status" defaultValue={status} className="w-44" aria-label="Status">
            <option value="">All statuses</option>
            {FILTER_STATUSES[type].map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
          </Select>
          <Button type="submit" variant="outline">Apply</Button>
        </form>
        {rows.length === 0 ? (
          <EmptyState icon={FilePlus2} title={q || status ? "No documents match your filters" : `No ${meta.plural.toLowerCase()} yet`} description="Create one with the guided builder." action={<Link href={`/documents/${meta.slug}/new`} className={buttonClass()}><FilePlus2 /> New {meta.label}</Link>} />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Number</Th><Th>Customer</Th><Th className="hidden lg:table-cell">Title</Th><Th className="hidden md:table-cell">Date</Th><Th className="hidden md:table-cell">{dateLabel}</Th>
                <Th className="text-right">Total</Th>{isInvoice && <Th className="hidden text-right sm:table-cell">Balance</Th>}<Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <Tr key={d.id}>
                  <Td><div className="flex items-center gap-2"><DocNumber doc={d} />{d.isSample && <SampleBadge />}</div></Td>
                  <Td><Link href={`/customers/${d.customer.id}`} className="hover:text-brand-700">{d.customer.name}</Link></Td>
                  <Td className="hidden max-w-xs truncate text-muted lg:table-cell">{d.title ?? "—"}</Td>
                  <Td className="hidden text-muted md:table-cell">{formatDate(d.issueDate, "short")}</Td>
                  <Td className="hidden text-muted md:table-cell">{formatDate(meta.dateLabel === "validUntil" ? d.validUntil : d.dueDate, "short")}</Td>
                  <Td className="text-right font-medium tabular">{formatMoney(d.grandTotal.toString())}</Td>
                  {isInvoice && <Td className="hidden text-right tabular sm:table-cell">{formatMoney(balanceDue(d))}</Td>}
                  <Td><StatusBadge status={d.eff} /></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
