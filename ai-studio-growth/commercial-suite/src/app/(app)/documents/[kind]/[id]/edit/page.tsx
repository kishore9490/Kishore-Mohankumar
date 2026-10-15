import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { DOCUMENT_TYPE_META, isEditable, typeFromSlug, type DocumentStatus } from "@/lib/documents/meta";
import { documentToInput, loadEditorData } from "@/lib/documents/editor-data";
import { PageHeader } from "@/components/ui/page-header";
import { DocumentEditor } from "@/components/editor/document-editor";
import { buttonClass } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function EditDocumentPage({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const user = await requireUser();
  const { kind, id } = await params;
  const type = typeFromSlug(kind);
  const found = await documentToInput(id);
  if (!type || !found || found.type !== type) notFound();
  const meta = DOCUMENT_TYPE_META[type];
  const crumbs = [{ label: meta.plural, href: `/documents/${meta.slug}` }, { label: found.number ?? "Draft", href: `/documents/${meta.slug}/${id}` }, { label: "Edit" }];
  if (!isEditable({ type, status: found.status as DocumentStatus })) {
    return (
      <>
        <PageHeader title="This document can no longer be edited" breadcrumbs={crumbs} />
        <p className="text-sm text-muted">Issued, accepted, paid or cancelled documents are locked to preserve an accurate record. Duplicate it to create an editable copy.</p>
        <Link href={`/documents/${meta.slug}/${id}`} className={buttonClass({ className: "mt-4" })}>Back to document</Link>
      </>
    );
  }
  const data = await loadEditorData(found.customerId);
  return (
    <>
      <PageHeader title={`Edit ${meta.label} ${found.number ?? "(draft)"}`} breadcrumbs={crumbs} />
      <DocumentEditor type={type} documentId={id} documentNumber={found.number} initial={found.input} {...data} preparedBy={user.name} />
    </>
  );
}
