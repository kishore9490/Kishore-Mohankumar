import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { CustomerForm } from "@/components/forms/customer-form";

export const metadata = { title: "Edit customer" };

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const c = await prisma.customer.findUnique({ where: { id } });
  if (!c) notFound();
  return (
    <div className="max-w-4xl">
      <PageHeader title={`Edit ${c.name}`} breadcrumbs={[{ label: "Customers", href: "/customers" }, { label: c.name, href: `/customers/${c.id}` }, { label: "Edit" }]} />
      <CustomerForm
        id={c.id}
        defaults={{
          name: c.name, contactPerson: c.contactPerson ?? "", email: c.email ?? "", phone: c.phone ?? "", billingAddress: c.billingAddress ?? "",
          shippingAddress: c.shippingAddress ?? "", gstin: c.gstin ?? "", state: c.state ?? "", stateCode: c.stateCode ?? "", notes: c.notes ?? "",
          preferredChannel: c.preferredChannel, whatsappConsent: c.whatsappConsent,
        }}
      />
    </div>
  );
}
