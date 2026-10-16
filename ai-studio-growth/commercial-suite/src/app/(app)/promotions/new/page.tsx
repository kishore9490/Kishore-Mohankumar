import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { brandLine } from "@/lib/documents/render-model";
import { PageHeader } from "@/components/ui/page-header";
import { CampaignForm } from "@/components/promotions/campaign-form";

export const metadata = { title: "New promotion" };
export const dynamic = "force-dynamic";

export default async function NewPromotionPage() {
  await requireUser();
  const [audience, company] = await Promise.all([
    prisma.customer.findMany({ where: { archived: false, whatsappConsent: true, phone: { not: null } }, orderBy: { name: "asc" }, select: { id: true, name: true, contactPerson: true, phone: true, state: true } }),
    prisma.companyProfile.findFirst({ where: { isDefault: true } }),
  ]);
  return (
    <>
      <PageHeader title="New promotion" breadcrumbs={[{ label: "Promotions", href: "/promotions" }, { label: "New" }]} />
      <CampaignForm audience={audience.map((a) => ({ ...a, phone: a.phone! }))} companyName={company ? brandLine(company) : ""} />
    </>
  );
}
