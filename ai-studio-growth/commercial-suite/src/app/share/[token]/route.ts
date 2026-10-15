import { NextResponse } from "next/server";
import { consumeShareLink } from "@/lib/integrations/share-links";
import { loadRenderableDocument } from "@/lib/documents/load";
import { pdfFileName, renderDocumentPdf } from "@/lib/pdf/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Short-lived customer link: serves exactly one document PDF while the link is valid. */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const documentId = await consumeShareLink(token);
  if (!documentId) return new NextResponse("This link is invalid or has expired.", { status: 404, headers: { "content-type": "text/plain" } });
  const doc = await loadRenderableDocument(documentId);
  if (!doc || doc.status === "CANCELLED") return new NextResponse("This document is no longer available.", { status: 410 });
  const pdf = await renderDocumentPdf(doc);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${pdfFileName(doc)}"`,
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
