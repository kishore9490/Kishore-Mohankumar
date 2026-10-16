import Link from "next/link";
import { History } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/dates";
import { DOCUMENT_TYPE_META, type DocumentType } from "@/lib/documents/meta";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { docHref } from "@/components/documents/doc-link";

export const metadata = { title: "Document History" };
export const dynamic = "force-dynamic";

const ACTION_GROUPS: Record<string, string> = { "document.": "Documents", "invoice.": "Invoices", "payment.": "Payments", "email.": "Email", "whatsapp.": "WhatsApp", "pdf.": "PDF", "company.": "Settings", "numbering.": "Settings", "user.": "Users", "samples.": "Sample data" };

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ q?: string; action?: string; document?: string }> }) {
  await requireUser();
  const { q = "", action = "", document = "" } = await searchParams;
  const where: Prisma.AuditEventWhereInput = {
    ...(action ? { action: { startsWith: action } } : {}),
    ...(document ? { documentId: document } : {}),
    ...(q ? { summary: { contains: q } } : {}),
  };
  const events = await prisma.auditEvent.findMany({ where, orderBy: { createdAt: "desc" }, take: 300, include: { user: { select: { name: true } }, document: { select: { id: true, type: true, number: true, customer: { select: { name: true } } } } } });
  return (
    <>
      <PageHeader title="Document History" description="Audit trail of document, payment, communication and settings events." />
      <Card>
        <form className="flex flex-wrap items-center gap-2 border-b border-line p-4">
          {document && <input type="hidden" name="document" value={document} />}
          <Input name="q" defaultValue={q} placeholder="Search events" className="min-w-56 flex-1" aria-label="Search events" />
          <Select name="action" defaultValue={action} className="w-48" aria-label="Event type">
            <option value="">All events</option>
            {Object.entries(ACTION_GROUPS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Button type="submit" variant="outline">Apply</Button>
          {document && <Link href="/history" className="text-sm text-brand-700">Clear document filter</Link>}
        </form>
        {events.length === 0 ? (
          <EmptyState icon={History} title="No events found" />
        ) : (
          <Table>
            <thead><tr><Th>When</Th><Th>Event</Th><Th className="hidden md:table-cell">Document</Th><Th className="hidden sm:table-cell">By</Th></tr></thead>
            <tbody>
              {events.map((e) => (
                <Tr key={e.id}>
                  <Td className="whitespace-nowrap text-muted">{formatDateTime(e.createdAt)}</Td>
                  <Td>{e.summary}<div className="font-mono text-[11px] text-muted">{e.action}</div></Td>
                  <Td className="hidden md:table-cell">{e.document ? <Link href={docHref(e.document)} className="text-brand-700">{DOCUMENT_TYPE_META[e.document.type as DocumentType].label} {e.document.number ?? "(draft)"}</Link> : <span className="text-muted">—</span>}{e.document && <div className="text-xs text-muted">{e.document.customer.name}</div>}</Td>
                  <Td className="hidden sm:table-cell">{e.user?.name ?? "System"}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
