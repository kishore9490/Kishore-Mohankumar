"use client";
import { useEffect, useRef, useState } from "react";
import type { RenderableDocument } from "@/lib/documents/render-model";
import { pageFormatFor } from "@/lib/documents/render-model";
import { DocumentRenderer } from "@/components/documents/render/document-renderer";

/** Renders a document preview scaled to fit its container (uses the exact print renderer). */
export function PreviewFrame({ doc, maxHeight }: { doc: RenderableDocument; maxHeight?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.5);
  const pageWidth = pageFormatFor(doc) === "slide" ? 1280 : 794;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setZoom(Math.min(1, (entry.contentRect.width - 24) / pageWidth)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [pageWidth]);
  return (
    <div ref={ref} className="overflow-y-auto rounded-xl bg-[#e9ebf3] p-3 ring-1 ring-line" style={{ maxHeight }}>
      <div style={{ zoom }}>
        <DocumentRenderer doc={doc} />
      </div>
    </div>
  );
}
