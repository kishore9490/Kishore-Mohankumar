import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { ProductForm } from "@/components/forms/product-form";

export const metadata = { title: "New catalogue item" };

export default async function NewProductPage() {
  await requireUser();
  const cats = await prisma.productService.findMany({ distinct: ["category"], select: { category: true } });
  return (
    <div className="max-w-4xl">
      <PageHeader title="New catalogue item" breadcrumbs={[{ label: "Products & Services", href: "/catalogue" }, { label: "New" }]} />
      <ProductForm categories={cats.map((c) => c.category)} />
    </div>
  );
}
