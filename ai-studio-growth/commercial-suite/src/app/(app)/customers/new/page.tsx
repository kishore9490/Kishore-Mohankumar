import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { CustomerForm } from "@/components/forms/customer-form";

export const metadata = { title: "New customer" };

export default async function NewCustomerPage() {
  await requireUser();
  return (
    <div className="max-w-4xl">
      <PageHeader title="New customer" breadcrumbs={[{ label: "Customers", href: "/customers" }, { label: "New" }]} />
      <CustomerForm />
    </div>
  );
}
