import Link from "next/link";
import { DOCUMENT_TYPE_META, type DocumentType } from "@/lib/documents/meta";

export function docHref(doc: { id: string; type: string }, suffix = "") {
  return `/documents/${DOCUMENT_TYPE_META[doc.type as DocumentType].slug}/${doc.id}${suffix}`;
}

export function DocNumber({ doc }: { doc: { id: string; type: string; number: string | null } }) {
  return (
    <Link href={docHref(doc)} className="font-medium whitespace-nowrap text-ink hover:text-brand-700 tabular">
      {doc.number ?? <span className="text-muted italic">Draft (unnumbered)</span>}
    </Link>
  );
}
