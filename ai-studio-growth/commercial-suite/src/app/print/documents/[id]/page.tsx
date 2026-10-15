import { notFound } from "next/navigation";
import { loadRenderableDocument } from "@/lib/documents/load";
import { verifyRenderToken } from "@/lib/auth/tokens";
import { getCurrentUser } from "@/lib/auth/session";
import { pageFormatFor, renderParts } from "@/lib/documents/render-model";
import { DocumentRenderer } from "@/components/documents/render/document-renderer";

export const dynamic = "force-dynamic";

const PAGE_CSS = {
  slide: { size: "13.333in 7.5in", flow: "12mm 16mm 15mm 16mm" },
  a4: { size: "A4", flow: "15mm 14mm 17mm 14mm" },
};

/**
 * Print view of a document. Accessible to signed-in users (HTML preview) or to the server-side
 * PDF renderer via a short-lived signed token. `part` selects a single page group for PDF assembly.
 */
export default async function PrintDocumentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string; part?: string }> }) {
  const { id } = await params;
  const { t, part } = await searchParams;
  const authorised = verifyRenderToken(t, id) || !!(await getCurrentUser());
  if (!authorised) notFound();
  const doc = await loadRenderableDocument(id);
  if (!doc) notFound();
  const format = pageFormatFor(doc);
  const parts = renderParts(doc);
  const partIndex = part !== undefined ? Math.max(0, Math.min(parts.length - 1, Number(part) || 0)) : undefined;
  const kind = partIndex !== undefined ? parts[partIndex].kind : "flow";
  const css = `@page { size: ${PAGE_CSS[format].size}; margin: ${kind === "full" ? "0" : PAGE_CSS[format].flow}; }
  @media print { .doc-part--flow { padding: 0 !important; min-height: 0 !important; } }`;
  return (
    <>
      <style>{css}</style>
      <div id="doc-root" data-ready="true" data-parts={parts.length} style={{ padding: partIndex === undefined ? "24px 0" : 0 }}>
        <DocumentRenderer doc={doc} partIndex={partIndex} />
      </div>
    </>
  );
}
