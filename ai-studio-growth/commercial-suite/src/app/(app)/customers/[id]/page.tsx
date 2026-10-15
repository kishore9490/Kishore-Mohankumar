import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, ArchiveRestore, FilePlus2, Pencil, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge, SampleBadge, StatusBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { ActionButton } from "@/components/forms/action-button";
import { DocNumber } from "@/components/documents/doc-link";
import { deleteCustomerAction, setCustomerArchivedAction } from "@/app/actions/customers";
import { DOCUMENT_TYPE_META, effectiveStatus, balanceDue, type DocumentStatus, type DocumentType } from "@/lib/documents/meta";
import { formatMoney, sum } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const c = await prisma.customer.findUnique({
    where: { id },
    include: { documents: { orderBy: { issueDate: "desc" } }, communications: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!c) notFound();
  const docs = c.documents.map((d) => ({ ...d, eff: effectiveStatus({ ...d, type: d.type as DocumentType, status: d.status as DocumentStatus }) }));
  const openInvoices = docs.filter((d) => d.type === "INVOICE" && ["ISSUED", "PARTIALLY_PAID", "OVERDUE"].includes(d.eff));
  const outstanding = sum(openInvoices.map((d) => balanceDue(d)));
  const rows: [string, string | null][] = [
    ["Contact person", c.contactPerson], ["Email", c.email], ["Phone", c.phone], ["GSTIN", c.gstin],
    ["State", c.state ? `${c.state}${c.stateCode ? ` (${c.stateCode})` : ""}` : null],
    ["Preferred channel", c.preferredChannel.toLowerCase()], ["WhatsApp opt-in", c.whatsappConsent ? "Yes" : "Not recorded"],
  ];
  return (
    <>
      <PageHeader
        title={<span className="flex flex-wrap items-center gap-2">{c.name}{c.isSample && <SampleBadge />}{c.archived && <Badge>Archived</Badge>}</span>}
        breadcrumbs={[{ label: "Customers", href: "/customers" }, { label: c.name }]}
        actions={
          <>
            {!c.archived && (
              <Link href={`/documents/quotations/new?customer=${c.id}`} className={buttonClass({ size: "sm" })}><FilePlus2 /> New quotation</Link>
            )}
            <Link href={`/customers/${c.id}/edit`} className={buttonClass({ variant: "outline", size: "sm" })}><Pencil /> Edit</Link>
            <ActionButton action={setCustomerArchivedAction.bind(null, c.id, !c.archived)} confirm={c.archived ? undefined : { title: "Archive this customer?", description: "Archived customers are hidden from lists and cannot be used for new documents. Existing documents are kept." }} confirmLabel="Archive">
              {c.archived ? <><ArchiveRestore /> Restore</> : <><Archive /> Archive</>}
            </ActionButton>
            {user.role === "ADMIN" && docs.length === 0 && (
              <ActionButton danger action={deleteCustomerAction.bind(null, c.id)} redirectTo="/customers" confirm={{ title: "Delete customer permanently?", description: "This cannot be undone. Only customers without documents can be deleted." }} confirmLabel="Delete">
                <Trash2 /> Delete
              </ActionButton>
            )}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Details" />
            <CardBody>
              <dl className="space-y-3 text-sm">
                {rows.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[130px_1fr] gap-2">
                    <dt className="text-muted">{k}</dt>
                    <dd className="break-words text-ink">{v || "—"}</dd>
                  </div>
                ))}
                <div className="grid grid-cols-[130px_1fr] gap-2"><dt className="text-muted">Billing address</dt><dd className="whitespace-pre-line">{c.billingAddress || "—"}</dd></div>
                {c.shippingAddress && <div className="grid grid-cols-[130px_1fr] gap-2"><dt className="text-muted">Shipping address</dt><dd className="whitespace-pre-line">{c.shippingAddress}</dd></div>}
              </dl>
              {c.notes && <p className="mt-4 rounded-lg bg-canvas p-3 text-sm whitespace-pre-line text-muted">{c.notes}</p>}
            </CardBody>
          </Card>
          <Card className="p-5">
            <div className="text-[13px] text-muted">Outstanding receivables</div>
            <div className="mt-1 font-display text-2xl font-bold tabular">{formatMoney(outstanding)}</div>
            <div className="text-xs text-muted">{openInvoices.length} open invoice(s)</div>
          </Card>
        </div>
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Documents" description={`${docs.length} document(s)`} />
            {docs.length === 0 ? (
              <CardBody><p className="text-sm text-muted">No documents for this customer yet.</p></CardBody>
            ) : (
              <Table>
                <thead><tr><Th>Number</Th><Th>Type</Th><Th className="hidden sm:table-cell">Date</Th><Th className="text-right">Total</Th><Th>Status</Th></tr></thead>
                <tbody>
                  {docs.map((d) => (
                    <Tr key={d.id}>
                      <Td><DocNumber doc={d} /></Td>
                      <Td className="text-muted">{DOCUMENT_TYPE_META[d.type as DocumentType].label}</Td>
                      <Td className="hidden text-muted sm:table-cell">{formatDate(d.issueDate, "short")}</Td>
                      <Td className="text-right tabular">{formatMoney(d.grandTotal.toString())}</Td>
                      <Td><StatusBadge status={d.eff} /></Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
          <Card>
            <CardHeader title="Recent communication" />
            {c.communications.length === 0 ? (
              <CardBody><p className="text-sm text-muted">No messages sent to this customer yet.</p></CardBody>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {c.communications.map((m) => (
                  <li key={m.id} className="flex justify-between gap-3 px-5 py-3">
                    <span>{m.channel.replace("_", " ").toLowerCase()} → {m.recipient}</span>
                    <span className="text-muted">{m.status.replaceAll("_", " ").toLowerCase()} · {formatDateTime(m.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
