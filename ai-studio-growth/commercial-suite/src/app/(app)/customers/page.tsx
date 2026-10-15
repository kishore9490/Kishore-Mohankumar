import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";
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

export const metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; channel?: string }> }) {
  await requireUser();
  const { q = "", status = "active", channel = "" } = await searchParams;
  const where: Prisma.CustomerWhereInput = {
    ...(status === "archived" ? { archived: true } : status === "all" ? {} : { archived: false }),
    ...(channel ? { preferredChannel: channel as Prisma.CustomerWhereInput["preferredChannel"] } : {}),
    ...(q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { contactPerson: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { gstin: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] }
      : {}),
  };
  const customers = await prisma.customer.findMany({ where, orderBy: { name: "asc" }, include: { _count: { select: { documents: true } } }, take: 500 });
  return (
    <>
      <PageHeader title="Customers" description="Companies and contacts you prepare documents for." actions={<Link href="/customers/new" className={buttonClass()}><Plus /> New customer</Link>} />
      <Card>
        <form className="flex flex-wrap items-center gap-2 border-b border-line p-4" role="search">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <Input name="q" defaultValue={q} placeholder="Search name, contact, email, phone or GSTIN" className="pl-9" aria-label="Search customers" />
          </div>
          <Select name="status" defaultValue={status} className="w-36" aria-label="Status">
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </Select>
          <Select name="channel" defaultValue={channel} className="w-44" aria-label="Preferred channel">
            <option value="">Any channel</option>
            <option value="EMAIL">Email</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="PHONE">Phone</option>
          </Select>
          <Button type="submit" variant="outline">Apply</Button>
        </form>
        {customers.length === 0 ? (
          <EmptyState icon={Users} title={q || status !== "active" ? "No customers match your filters" : "No customers yet"} description="Add a customer to start preparing quotations, proposals and invoices." action={<Link href="/customers/new" className={buttonClass()}><Plus /> New customer</Link>} />
        ) : (
          <Table>
            <thead>
              <tr><Th>Customer</Th><Th className="hidden md:table-cell">Contact</Th><Th className="hidden lg:table-cell">GSTIN</Th><Th className="hidden sm:table-cell">State</Th><Th>Channel</Th><Th className="text-right">Documents</Th></tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/customers/${c.id}`} className="font-medium hover:text-brand-700">{c.name}</Link>
                      {c.isSample && <SampleBadge />}
                      {c.archived && <Badge>Archived</Badge>}
                    </div>
                    <div className="text-xs text-muted md:hidden">{c.email ?? c.phone ?? ""}</div>
                  </Td>
                  <Td className="hidden md:table-cell">
                    <div>{c.contactPerson ?? "—"}</div>
                    <div className="text-xs text-muted">{[c.email, c.phone].filter(Boolean).join(" · ")}</div>
                  </Td>
                  <Td className="hidden font-mono text-xs lg:table-cell">{c.gstin ?? "—"}</Td>
                  <Td className="hidden sm:table-cell">{c.state ?? "—"}</Td>
                  <Td><Badge tone={c.preferredChannel === "WHATSAPP" ? "success" : c.preferredChannel === "EMAIL" ? "info" : "neutral"}>{c.preferredChannel.toLowerCase()}</Badge></Td>
                  <Td className="text-right tabular">{c._count.documents}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
