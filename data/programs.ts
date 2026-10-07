import type { Fee, Program } from "@/lib/types";

/**
 * PROGRAMS
 * Structure is production-ready; content is INDICATIVE until EMC confirms it.
 *  - duration / mode / schedule / fees are null  → UI shows "Shared during counselling".
 *  - certification fields are null               → UI explains the difference between
 *    an EMC completion certificate and external professional certification, without
 *    claiming either.
 * Replace values here (or wire this file to a CMS) — no component changes needed.
 */

const pendingFee: Fee = {
  courseFee: null,
  registrationFee: null,
  currency: "INR",
  installments: null,
  scholarships: null,
  paymentLink: null,
  notes: null,
};

export const programs: Program[] = [
  {
    slug: "medical-coding-career-program",
    name: "Medical Coding Career Program",
    shortName: "Career Program",
    status: "indicative",
    audience: "beginner",
    tagline: "From medical knowledge to coding skill — step by step.",
    summary:
      "A structured path for learners who are new to medical coding. Build the medical foundation, learn the major code sets, then apply them to practical cases and prepare for your next career step.",
    whoFor: [
      "Graduates from medical, nursing, pharmacy, allied-health or life-science backgrounds",
      "Learners new to medical coding who want a structured start",
      "Career switchers exploring healthcare-administration roles",
    ],
    duration: null,
    mode: null,
    schedule: null,
    curriculum: [
      "terminology",
      "anatomy",
      "pathology",
      "coding-foundation",
      "icd",
      "cpt",
      "hcpcs",
      "guidelines",
      "cases",
      "assessment",
      "career-prep",
    ],
    outcomes: [
      "Read and interpret clinical documentation",
      "Navigate ICD-10-CM, CPT® and HCPCS Level II code sets",
      "Apply official coding guidelines to practical cases",
      "Understand where coding fits in the healthcare revenue cycle",
      "Prepare a professional profile for entry-level opportunities",
    ],
    methodology: [
      "Concept sessions followed by guided practice",
      "Case-based learning with fictional / de-identified records",
      "Regular checkpoints with feedback",
    ],
    practicalExposure: [
      "Coding exercises after every core module",
      "End-to-end practical case coding",
      "Accuracy review and error analysis",
    ],
    certification: { emcCertificate: null, externalPreparation: null },
    assessment: ["Module checkpoints", "Mock assessments", "Final evaluation"],
    faculty: [],
    fee: pendingFee,
    faqs: [],
  },
  {
    slug: "advanced-medical-coding",
    name: "Advanced Medical Coding",
    shortName: "Advanced",
    status: "indicative",
    audience: "advanced",
    tagline: "Sharpen accuracy. Go deeper into guidelines and complex cases.",
    summary:
      "For learners who already have healthcare or coding exposure and want to strengthen guideline application, complex-case coding and quality-focused review.",
    whoFor: [
      "Working or former medical coders",
      "Healthcare professionals moving into coding",
      "Learners who have completed a foundation-level coding course",
    ],
    duration: null,
    mode: null,
    schedule: null,
    curriculum: ["icd", "cpt", "hcpcs", "guidelines", "cases", "assessment", "career-prep"],
    outcomes: [
      "Apply guidelines confidently to multi-diagnosis, multi-procedure cases",
      "Use modifiers and sequencing rules correctly",
      "Review coded records for accuracy and documentation gaps",
      "Plan a pathway towards specialisation or professional certification",
    ],
    methodology: [
      "Guideline deep-dives",
      "Complex case workshops",
      "Peer and mentor review of coded cases",
    ],
    practicalExposure: ["Specialty case sets", "Timed coding drills", "Audit-style review exercises"],
    certification: { emcCertificate: null, externalPreparation: null },
    assessment: ["Case-based assessments", "Timed mock tests"],
    faculty: [],
    fee: pendingFee,
    faqs: [],
  },
];

export const getProgram = (slug: string) => programs.find((p) => p.slug === slug);
