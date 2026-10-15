import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { loadRenderableDocument } from "@/lib/documents/load";
import { PdfRenderError, pdfFileName, renderDocumentPdf } from "@/lib/pdf/render";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/services/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/documents/:id/pdf[?download=1] — authenticated PDF preview / download. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const doc = await loadRenderableDocument(id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const pdf = await renderDocumentPdf(doc);
    const download = new URL(req.url).searchParams.get("download") === "1";
    if (download) await audit(prisma, { documentId: id, userId: user.id, action: "pdf.downloaded", summary: `PDF downloaded (${doc.number ?? "draft"})` });
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${pdfFileName(doc)}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    const message = e instanceof PdfRenderError ? e.message : "PDF generation failed.";
    console.error("[pdf]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
