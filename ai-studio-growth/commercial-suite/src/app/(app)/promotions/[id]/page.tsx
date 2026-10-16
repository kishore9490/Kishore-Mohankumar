import { notFound } from "next/navigation";
import { Archive, ArchiveRestore } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { loadWhatsApp } from "@/lib/integrations/config";
import { OPEN_WITH_LABEL } from "@/lib/integrations/phone";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ActionButton } from "@/components/forms/action-button";
import { RecipientQueue } from "@/components/promotions/recipient-queue";
import { archiveCampaignAction } from "@/app/actions/promotions";

export const dynamic = "force-dynamic";

export default async function PromotionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const [c, { settings }] = await Promise.all([
    prisma.campaign.findUnique({ where: { id }, include: { recipients: { include: { customer: { select: { name: true, contactPerson: true } } }, orderBy: { customer: { name: "asc" } } } } }),
    loadWhatsApp(),
  ]);
  if (!c) notFound();
  return (
    <>
      <PageHeader
        title={c.name}
        breadcrumbs={[{ label: "Promotions", href: "/promotions" }, { label: c.name }]}
        description={`Chats open in: ${OPEN_WITH_LABEL[settings.openWith ?? "desktop"]} (change in Settings → Integrations).`}
        actions={<ActionButton action={archiveCampaignAction.bind(null, c.id, !c.archived)}>{c.archived ? <><ArchiveRestore /> Restore</> : <><Archive /> Archive</>}</ActionButton>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <RecipientQueue rows={c.recipients.map((r) => ({ id: r.id, name: r.customer.name, contact: r.customer.contactPerson, phone: r.phone, status: r.status }))} />
        <Card className="h-fit">
          <CardHeader title="Message" description="Personalised per customer when the chat opens" />
          <CardBody className="bg-[#e5ddd5]">
            <div className="ml-auto max-w-[92%] rounded-lg rounded-tr-none bg-[#d9fdd3] px-3 py-2 text-[13.5px] whitespace-pre-wrap text-[#111b21] shadow-sm">{c.message}</div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
