import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Promotions" };
export const dynamic = "force-dynamic";

export default async function PromotionsPage({ searchParams }: { searchParams: Promise<{ archived?: string }> }) {
  await requireUser();
  const { archived } = await searchParams;
  const campaigns = await prisma.campaign.findMany({ where: { archived: archived === "1" }, orderBy: { createdAt: "desc" }, include: { recipients: { select: { status: true } } } });
  return (
    <>
      <PageHeader
        title="Promotions"
        description="Send promotional WhatsApp messages from your WhatsApp Business app to customers who opted in — personalised, one tap per customer, fully logged."
        actions={<Link href="/promotions/new" className={buttonClass()}><Plus /> New promotion</Link>}
      />
      <div className="mb-4 flex gap-3 text-sm">
        <Link href="/promotions" className={archived ? "text-muted hover:text-ink" : "font-medium text-brand-700"}>Active</Link>
        <Link href="/promotions?archived=1" className={archived ? "font-medium text-brand-700" : "text-muted hover:text-ink"}>Archived</Link>
      </div>
      <Card>
        {campaigns.length === 0 ? (
          <EmptyState icon={Megaphone} title="No promotions yet" description="Create a promotion, choose opted-in customers and send it from WhatsApp Business." action={<Link href="/promotions/new" className={buttonClass()}><Plus /> New promotion</Link>} />
        ) : (
          <Table>
            <thead><tr><Th>Promotion</Th><Th>Progress</Th><Th className="hidden md:table-cell">Created</Th></tr></thead>
            <tbody>
              {campaigns.map((c) => {
                const total = c.recipients.length;
                const sent = c.recipients.filter((r) => r.status === "SENT").length;
                return (
                  <Tr key={c.id}>
                    <Td><Link href={`/promotions/${c.id}`} className="font-medium hover:text-brand-700">{c.name}</Link><div className="max-w-md truncate text-xs text-muted">{c.message}</div></Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-emerald-500" style={{ width: `${total ? (sent / total) * 100 : 0}%` }} /></div>
                        <span className="text-xs text-muted tabular">{sent}/{total} sent</span>
                        {sent === total && total > 0 && <Badge tone="success">Complete</Badge>}
                      </div>
                    </Td>
                    <Td className="hidden text-muted md:table-cell">{formatDateTime(c.createdAt)}</Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
