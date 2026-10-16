import Link from "next/link";
import { Package, Pencil, Plus, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Button, buttonClass } from "@/components/ui/button";
import { Table, Td, Th, Tr } from "@/components/ui/table";
import { Badge, SampleBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionButton } from "@/components/forms/action-button";
import { deleteProductAction, setProductActiveAction } from "@/app/actions/catalogue";
import { BILLING_FREQUENCY_LABEL } from "@/lib/documents/meta";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Products & Services" };
export const dynamic = "force-dynamic";

export default async function CataloguePage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; status?: string }> }) {
  const user = await requireUser();
  const { q = "", category = "", status = "active" } = await searchParams;
  const where: Prisma.ProductServiceWhereInput = {
    ...(status === "inactive" ? { active: false } : status === "all" ? {} : { active: true }),
    ...(category ? { category } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }, { shortDescription: { contains: q } }] } : {}),
  };
  const [items, cats] = await Promise.all([
    prisma.productService.findMany({ where, orderBy: [{ category: "asc" }, { name: "asc" }], include: { _count: { select: { lineItems: true } } } }),
    prisma.productService.findMany({ distinct: ["category"], select: { category: true }, orderBy: { category: "asc" } }),
  ]);
  return (
    <>
      <PageHeader title="Products & Services" description="Reusable catalogue items for quotations, proposals and invoices. Custom one-off lines can also be added directly on documents." actions={<Link href="/catalogue/new" className={buttonClass()}><Plus /> New item</Link>} />
      <Card>
        <form className="flex flex-wrap items-center gap-2 border-b border-line p-4" role="search">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <Input name="q" defaultValue={q} placeholder="Search name, SKU or description" className="pl-9" aria-label="Search catalogue" />
          </div>
          <Select name="category" defaultValue={category} className="w-56" aria-label="Category">
            <option value="">All categories</option>
            {cats.map((c) => <option key={c.category} value={c.category}>{c.category}</option>)}
          </Select>
          <Select name="status" defaultValue={status} className="w-36" aria-label="Status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </Select>
          <Button type="submit" variant="outline">Apply</Button>
        </form>
        {items.length === 0 ? (
          <EmptyState icon={Package} title="No catalogue items found" description="Create services you sell regularly to add them to documents in one click." action={<Link href="/catalogue/new" className={buttonClass()}><Plus /> New item</Link>} />
        ) : (
          <Table>
            <thead><tr><Th>Item</Th><Th className="hidden md:table-cell">Category</Th><Th className="text-right">Default price</Th><Th className="hidden sm:table-cell">GST</Th><Th className="hidden lg:table-cell">Billing</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead>
            <tbody>
              {items.map((p) => (
                <Tr key={p.id}>
                  <Td>
                    <div className="flex flex-wrap items-center gap-2"><Link href={`/catalogue/${p.id}/edit`} className="font-medium hover:text-brand-700">{p.name}</Link>{p.isSample && <SampleBadge />}</div>
                    <div className="max-w-md truncate text-xs text-muted">{p.sku ? `${p.sku} · ` : ""}{p.shortDescription}</div>
                  </Td>
                  <Td className="hidden text-muted md:table-cell">{p.category}</Td>
                  <Td className="text-right tabular">{formatMoney(p.defaultPrice.toString())}<div className="text-xs text-muted">per {p.unit}</div></Td>
                  <Td className="hidden sm:table-cell">{p.taxRate.toString()}%</Td>
                  <Td className="hidden text-muted lg:table-cell">{BILLING_FREQUENCY_LABEL[p.billingFrequency]}</Td>
                  <Td>{p.active ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/catalogue/${p.id}/edit`} className={buttonClass({ variant: "ghost", size: "sm" })} aria-label={`Edit ${p.name}`}><Pencil /></Link>
                      <ActionButton variant="ghost" action={setProductActiveAction.bind(null, p.id, !p.active)}>{p.active ? "Deactivate" : "Activate"}</ActionButton>
                      {user.role === "ADMIN" && p._count.lineItems === 0 && (
                        <ActionButton variant="ghost" danger action={deleteProductAction.bind(null, p.id)} confirm={{ title: `Delete ${p.name}?`, description: "This permanently removes the catalogue item." }} confirmLabel="Delete">Delete</ActionButton>
                      )}
                    </div>
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
