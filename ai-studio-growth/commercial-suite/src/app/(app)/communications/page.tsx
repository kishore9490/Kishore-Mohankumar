import Link from "next/link";
import { Send } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { DELIVERY_STATUS_META } from "@/lib/integrations/messages";
import { formatDateTime } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { docHref } from "@/components/documents/doc-link";

export const metadata = { title: "Communications" };
export const dynamic = "force-dynamic";

const CHANNEL_LABEL: Record<string, string> = { EMAIL: "Email (Brevo)", WHATSAPP: "WhatsApp API", WHATSAPP_MANUAL: "WhatsApp Business app" };

export default async function CommunicationsPage({ searchParams }: { searchParams: Promise<{ channel?: string; status?: string; document?: string }> }) {
  await requireUser();
  const { channel = "", status = "", document = "" } = await searchParams;
  const where: Prisma.CommunicationLogWhereInput = {
    ...(channel ? { channel: channel as Prisma.CommunicationLogWhereInput["channel"] } : {}),
    ...(status ? { status: status as Prisma.CommunicationLogWhereInput["status"] } : {}),
    ...(document ? { documentId: document } : {}),
  };
  const logs = await prisma.communicationLog.findMany({ where, orderBy: { createdAt: "desc" }, take: 300, include: { customer: { select: { id: true, name: true } }, document: { select: { id: true, type: true, number: true } }, createdBy: { select: { name: true } } } });
  return (
    <>
      <PageHeader title="Communications" description="Every email attempt with evidence-based delivery status. Message bodies and credentials are not stored." />
      <div className="mb-4 grid gap-2 text-xs text-muted sm:grid-cols-3 lg:grid-cols-7">
        {Object.entries(DELIVERY_STATUS_META).map(([k, m]) => (
          <div key={k} className="rounded-lg border border-line bg-white p-2.5"><Badge tone={m.tone}>{m.label}</Badge><p className="mt-1.5">{m.help}</p></div>
        ))}
      </div>
      <Card>
        <form className="flex flex-wrap items-center gap-2 border-b border-line p-4">
          {document && <input type="hidden" name="document" value={document} />}
          <Select name="channel" defaultValue={channel} className="w-52" aria-label="Channel">
            <option value="">All channels</option>
            {Object.entries(CHANNEL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Select name="status" defaultValue={status} className="w-48" aria-label="Status">
            <option value="">All statuses</option>
            {Object.entries(DELIVERY_STATUS_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
          </Select>
          <Button type="submit" variant="outline">Apply</Button>
          {document && <Link href="/communications" className="text-sm text-brand-700">Clear document filter</Link>}
        </form>
        {logs.length === 0 ? (
          <EmptyState icon={Send} title="No communication yet" description="Send a document by email from its detail page. Attempts are recorded here." />
        ) : (
          <Table>
            <thead><tr><Th>When</Th><Th>Channel</Th><Th>Recipient</Th><Th className="hidden md:table-cell">Document</Th><Th className="hidden lg:table-cell">Type</Th><Th>Status</Th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <Tr key={l.id}>
                  <Td className="whitespace-nowrap text-muted">{formatDateTime(l.createdAt)}<div className="text-xs">{l.createdBy?.name ?? "System"}</div></Td>
                  <Td>{CHANNEL_LABEL[l.channel]}{l.mode === "DEV_MOCK" && <Badge tone="info" className="ml-1">mock</Badge>}</Td>
                  <Td><div>{l.recipient}</div>{l.customer && <Link href={`/customers/${l.customer.id}`} className="text-xs text-muted hover:text-brand-700">{l.customer.name}</Link>}</Td>
                  <Td className="hidden md:table-cell">{l.document ? <Link href={docHref(l.document)} className="text-brand-700">{l.document.number ?? "Draft"}</Link> : "—"}</Td>
                  <Td className="hidden text-muted lg:table-cell">{l.messageType.replace("_", " ").toLowerCase()}</Td>
                  <Td>
                    <Badge tone={DELIVERY_STATUS_META[l.status].tone}>{DELIVERY_STATUS_META[l.status].label}</Badge>
                    {l.providerMessageId && <div className="mt-1 max-w-[180px] truncate font-mono text-[10px] text-muted" title={l.providerMessageId}>{l.providerMessageId}</div>}
                    {l.errorMessage && <div className="mt-1 max-w-xs text-xs text-red-600">{l.errorMessage}</div>}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
