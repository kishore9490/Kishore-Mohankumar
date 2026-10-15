import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { DOCUMENT_TYPE_META, typeFromSlug } from "@/lib/documents/meta";
import { loadEditorData, newDocumentDefaults } from "@/lib/documents/editor-data";
import { PageHeader } from "@/components/ui/page-header";
import { DocumentEditor } from "@/components/editor/document-editor";

export const dynamic = "force-dynamic";

export default async function NewDocumentPage({ params, searchParams }: { params: Promise<{ kind: string }>; searchParams: Promise<{ customer?: string }> }) {
  const user = await requireUser();
  const { kind } = await params;
  const { customer: customerId } = await searchParams;
  const type = typeFromSlug(kind);
  if (!type) notFound();
  const data = await loadEditorData();
  const company = data.companies.find((c) => c.isDefault) ?? data.companies[0];
  const customer = data.customers.find((c) => c.id === customerId);
  const meta = DOCUMENT_TYPE_META[type];
  return (
    <>
      <PageHeader title={`New ${meta.label}`} breadcrumbs={[{ label: meta.plural, href: `/documents/${meta.slug}` }, { label: "New" }]} />
      <DocumentEditor type={type} initial={newDocumentDefaults(type, company, customer)} {...data} preparedBy={user.name} />
    </>
  );
}
