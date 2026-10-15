import type { RenderableDocument } from "@/lib/documents/render-model";
import { pageFormatFor, renderParts } from "@/lib/documents/render-model";
import { PremiumCommercial, ProfessionalCommercial } from "./commercial";
import { ProposalPart } from "./proposal";
import { docVars } from "./shared";

/**
 * Entry point for rendering any document. Picks the layout from type + template.
 * `partIndex` renders a single part (used by the PDF pipeline); otherwise all parts render in sequence.
 */
export function DocumentRenderer({ doc, partIndex }: { doc: RenderableDocument; partIndex?: number }) {
  const format = pageFormatFor(doc);
  const tpl =
    doc.template === "DETAILED_PROPOSAL" ? "tpl-detailed" : doc.template === "PREMIUM_COMMERCIAL" ? "tpl-premium" : "tpl-professional";
  let content;
  if (doc.type === "PROPOSAL") {
    const parts = renderParts(doc);
    const selected = partIndex === undefined ? parts : parts.slice(partIndex, partIndex + 1);
    content = selected.map((p, i) => <ProposalPart key={i} doc={doc} part={p} />);
  } else {
    content = doc.template === "PREMIUM_COMMERCIAL" ? <PremiumCommercial doc={doc} /> : <ProfessionalCommercial doc={doc} />;
  }
  return (
    <div className={`doc doc--${format} ${tpl}`} style={docVars(doc.company)}>
      {content}
    </div>
  );
}
