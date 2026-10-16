import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { jsonStringList } from "@/lib/utils";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { ProductForm } from "@/components/forms/product-form";

export const metadata = { title: "Edit catalogue item" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const [p, cats] = await Promise.all([
    prisma.productService.findUnique({ where: { id } }),
    prisma.productService.findMany({ distinct: ["category"], select: { category: true } }),
  ]);
  if (!p) notFound();
  return (
    <div className="max-w-4xl">
      <PageHeader title={`Edit ${p.name}`} breadcrumbs={[{ label: "Products & Services", href: "/catalogue" }, { label: p.name }]} />
      <ProductForm
        id={p.id}
        categories={cats.map((c) => c.category)}
        defaults={{
          name: p.name, shortDescription: p.shortDescription ?? "", detailedDescription: p.detailedDescription ?? "", category: p.category, sku: p.sku ?? "",
          hsnSac: p.hsnSac ?? "", unit: p.unit, defaultQuantity: p.defaultQuantity.toString(), defaultPrice: p.defaultPrice.toString(), taxRate: p.taxRate.toString(),
          billingFrequency: p.billingFrequency, inclusions: jsonStringList(p.inclusions), exclusions: jsonStringList(p.exclusions), active: p.active,
        }}
      />
    </div>
  );
}
