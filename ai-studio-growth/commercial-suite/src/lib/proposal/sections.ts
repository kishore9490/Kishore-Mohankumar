/**
 * Proposal section definitions. Every proposal is assembled from ordered, reusable sections.
 * Each section type has a renderer (src/components/documents/render/proposal-sections.tsx) and
 * declares which content fields its editor exposes.
 */

export type ProposalSectionType =
  | "COVER" | "EXECUTIVE_SUMMARY" | "CUSTOMER_REQUIREMENTS" | "PROPOSED_SOLUTION" | "SERVICE_OVERVIEW"
  | "FEATURE_BREAKDOWN" | "SCOPE_OF_WORK" | "DELIVERABLES" | "IMPLEMENTATION_PLAN" | "TIMELINE"
  | "PRICING_SUMMARY" | "COMMERCIAL_TERMS" | "BUSINESS_VALUE" | "ASSUMPTIONS" | "EXCLUSIONS"
  | "ACCEPTANCE" | "CLOSING_PAGE";

export interface SectionItem {
  title: string;
  detail?: string;
  tag?: string;
}

export interface SectionContent {
  eyebrow?: string;
  body?: string;
  highlightLabel?: string;
  highlight?: string;
  itemsLabel?: string;
  items?: SectionItem[];
  secondaryLabel?: string;
  secondaryItems?: SectionItem[];
  note?: string;
}

export interface ProposalSectionData {
  id?: string;
  type: ProposalSectionType;
  title: string;
  enabled: boolean;
  content: SectionContent;
}

type Field = "eyebrow" | "body" | "highlight" | "items" | "secondary" | "note";

export const SECTION_META: Record<
  ProposalSectionType,
  { label: string; description: string; fields: Field[]; fullPage?: boolean; itemHint?: string; tagHint?: string }
> = {
  COVER: { label: "Cover", description: "Branded cover with title, customer, tagline and package price.", fields: ["eyebrow", "body", "highlight", "note"], fullPage: true },
  EXECUTIVE_SUMMARY: { label: "Executive Summary", description: "Overview, objective and package components with a total price band.", fields: ["eyebrow", "body", "highlight", "items", "note"], itemHint: "Package component", tagHint: "Badge, e.g. INCLUDED, FREE" },
  CUSTOMER_REQUIREMENTS: { label: "Customer Requirements", description: "What the customer needs, as understood.", fields: ["eyebrow", "body", "items", "note"], itemHint: "Requirement" },
  PROPOSED_SOLUTION: { label: "Proposed Solution", description: "How the solution addresses the requirements.", fields: ["eyebrow", "body", "highlight", "items", "note"], itemHint: "Solution element" },
  SERVICE_OVERVIEW: { label: "Service Detail Pages", description: "One detail page per service line item, using the line's description, metric, applications and benefits.", fields: ["eyebrow", "note"] },
  FEATURE_BREAKDOWN: { label: "Feature Breakdown", description: "Grid of capability cards.", fields: ["eyebrow", "body", "items", "note"], itemHint: "Feature" },
  SCOPE_OF_WORK: { label: "Scope of Work", description: "Numbered scope items.", fields: ["eyebrow", "body", "items", "secondary", "note"], itemHint: "Scope item" },
  DELIVERABLES: { label: "Deliverables", description: "Checklist of deliverables.", fields: ["eyebrow", "body", "items", "note"], itemHint: "Deliverable" },
  IMPLEMENTATION_PLAN: { label: "Implementation Plan", description: "Ordered implementation steps.", fields: ["eyebrow", "body", "items", "note"], itemHint: "Step" },
  TIMELINE: { label: "Timeline", description: "Phases with durations.", fields: ["eyebrow", "body", "items", "note"], itemHint: "Phase", tagHint: "Duration, e.g. Week 1–2" },
  PRICING_SUMMARY: { label: "Commercial Summary", description: "Line items, commercial treatment, totals and the package price panel.", fields: ["eyebrow", "body", "note"] },
  COMMERCIAL_TERMS: { label: "Commercial Terms", description: "Numbered commercial notes with an optional 'to be confirmed' list.", fields: ["eyebrow", "body", "items", "secondary", "note"], itemHint: "Term" },
  BUSINESS_VALUE: { label: "Business Value", description: "Value cards with an objective panel.", fields: ["eyebrow", "body", "highlight", "items", "note"], itemHint: "Value point" },
  ASSUMPTIONS: { label: "Assumptions", description: "Assumptions the proposal relies on.", fields: ["eyebrow", "body", "items", "note"], itemHint: "Assumption" },
  EXCLUSIONS: { label: "Exclusions", description: "What is not included.", fields: ["eyebrow", "body", "items", "note"], itemHint: "Exclusion" },
  ACCEPTANCE: { label: "Acceptance", description: "Acceptance statement with signature blocks.", fields: ["eyebrow", "body", "note"] },
  CLOSING_PAGE: { label: "Closing Page", description: "Thank-you page with proposal contact details.", fields: ["eyebrow", "body", "highlight", "items"], fullPage: true, itemHint: "Contact detail label", tagHint: "" },
};

export const SECTION_ORDER: ProposalSectionType[] = Object.keys(SECTION_META) as ProposalSectionType[];

export interface SectionContext {
  customerName: string;
  brandLine: string; // e.g. "Infinitia Hub × AI Studio Craft"
  companyPhone?: string | null;
  companyEmail?: string | null;
  preparedBy?: string | null;
}

export function defaultSection(type: ProposalSectionType, ctx: SectionContext): ProposalSectionData {
  const c = ctx.customerName || "the customer";
  const meta = SECTION_META[type];
  const base = (title: string, content: SectionContent): ProposalSectionData => ({ type, title, enabled: true, content });
  switch (type) {
    case "COVER":
      return base("Cover", { eyebrow: "Proposal for", body: "Smarter customer communication. Intelligent automation. Better customer experiences.", highlightLabel: "Package price", highlight: "" });
    case "EXECUTIVE_SUMMARY":
      return base(`One Integrated Package for ${c}`, {
        eyebrow: "Executive summary",
        body: `${ctx.brandLine} proposes an integrated solution for ${c}, combining the services below in one commercial package.`,
        highlightLabel: "Objective",
        highlight: "To support customer engagement, streamline routine interactions, and reduce repetitive manual work.",
        items: [],
      });
    case "CUSTOMER_REQUIREMENTS":
      return base("Understanding Your Requirements", { eyebrow: "Customer requirements", body: `Based on our discussions with ${c}, we understand the following requirements:`, items: [{ title: "Requirement", detail: "Describe the requirement." }] });
    case "PROPOSED_SOLUTION":
      return base("Our Proposed Solution", { eyebrow: "Proposed solution", body: "Describe the proposed solution and how it addresses the requirements.", items: [] });
    case "SERVICE_OVERVIEW":
      return base("Service Details", { eyebrow: "Service" });
    case "FEATURE_BREAKDOWN":
      return base("What the Solution Can Be Configured to Do", { eyebrow: "Feature breakdown", items: [{ title: "Feature", detail: "Describe the capability." }], note: "Supported channels, integrations and advanced functionality depend on the agreed implementation scope." });
    case "SCOPE_OF_WORK":
      return base("Scope of Work", { eyebrow: "Scope", items: [{ title: "Discovery and configuration", detail: "Requirement confirmation and initial configuration." }] });
    case "DELIVERABLES":
      return base("Deliverables", { eyebrow: "Deliverables", items: [{ title: "Configured solution", detail: "Deployed and handed over." }] });
    case "IMPLEMENTATION_PLAN":
      return base("Implementation Plan", { eyebrow: "Implementation", items: [{ title: "Kick-off", detail: "Confirm scope, access and timelines." }, { title: "Configuration", detail: "Configure and test the solution." }, { title: "Go-live", detail: "Launch and hand over." }] });
    case "TIMELINE":
      return base("Project Timeline", { eyebrow: "Timeline", items: [{ title: "Discovery", tag: "Week 1", detail: "Requirements and access." }, { title: "Build & configure", tag: "Week 2–3", detail: "Configuration and testing." }, { title: "Launch", tag: "Week 4", detail: "Go-live and handover." }] });
    case "PRICING_SUMMARY":
      return base("Commercial Summary", { eyebrow: "Commercial summary", body: "", note: "Payment schedule, service dates and other terms will be confirmed in the final commercial agreement." });
    case "COMMERCIAL_TERMS":
      return base("Implementation & Commercial Notes", {
        eyebrow: "Transparency",
        itemsLabel: "Scope & commercials",
        items: [
          { title: "Implementation scope", detail: `Final implementation scope and configuration will be agreed with ${c}.` },
          { title: "GST", detail: "Applicable GST will be charged in addition to the package price." },
        ],
        secondaryLabel: "To be confirmed in the final commercial agreement",
        secondaryItems: [{ title: "Contract commencement date" }, { title: "Payment schedule and deadline" }, { title: "Cancellation and renewal terms" }],
      });
    case "BUSINESS_VALUE":
      return base("How This Solution Supports Your Business", {
        eyebrow: "Business value",
        items: [{ title: "Structured customer communication", detail: "Describe the value." }],
        highlightLabel: "Our objective",
        highlight: `Our objective is to help ${c} establish a more structured, convenient and AI-enabled customer experience.`,
      });
    case "ASSUMPTIONS":
      return base("Assumptions", { eyebrow: "Assumptions", items: [{ title: "Timely access", detail: "Required accounts, content and approvals are provided on time." }] });
    case "EXCLUSIONS":
      return base("Exclusions", { eyebrow: "Exclusions", items: [{ title: "Third-party charges", detail: "Platform, telecom or third-party fees unless explicitly stated." }] });
    case "ACCEPTANCE":
      return base("Acceptance", { eyebrow: "Acceptance", body: `By signing below, ${c} accepts this proposal and its commercial terms. A final commercial agreement will follow where required.` });
    case "CLOSING_PAGE":
      return base("Let’s Build a Smarter Customer Experience", {
        eyebrow: "Thank you",
        body: `Thank you, ${c}, for the opportunity to work together.\n\nThrough ${ctx.brandLine}, we look forward to supporting you with practical AI-powered solutions.`,
        highlight: "",
        items: [
          ...(ctx.preparedBy ? [{ title: "Prepared by", detail: ctx.preparedBy }] : []),
          ...(ctx.companyPhone ? [{ title: "Phone number", detail: ctx.companyPhone }] : []),
          ...(ctx.companyEmail ? [{ title: "Email address", detail: ctx.companyEmail }] : []),
        ],
      });
    default:
      return base(meta.label, {});
  }
}

export const DEFAULT_PROPOSAL_SECTIONS: ProposalSectionType[] = [
  "COVER", "EXECUTIVE_SUMMARY", "SERVICE_OVERVIEW", "PRICING_SUMMARY", "BUSINESS_VALUE", "COMMERCIAL_TERMS", "CLOSING_PAGE",
];

/** Splits body text into paragraphs and bullet lists ("- " or "• " prefixed lines). */
export function parseRichText(text?: string | null): ({ kind: "p"; text: string } | { kind: "ul"; items: string[] })[] {
  if (!text) return [];
  const blocks: ({ kind: "p"; text: string } | { kind: "ul"; items: string[] })[] = [];
  for (const chunk of text.replace(/\r\n/g, "\n").split(/\n{2,}/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    let para: string[] = [];
    let list: string[] = [];
    const flushPara = () => { if (para.length) blocks.push({ kind: "p", text: para.join(" ") }); para = []; };
    const flushList = () => { if (list.length) blocks.push({ kind: "ul", items: list }); list = []; };
    for (const line of lines) {
      const m = line.match(/^[-•*]\s+(.*)$/);
      if (m) { flushPara(); list.push(m[1]); } else { flushList(); para.push(line); }
    }
    flushPara();
    flushList();
  }
  return blocks;
}
