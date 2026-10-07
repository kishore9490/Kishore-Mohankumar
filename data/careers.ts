import type { CareerRole } from "@/lib/types";

/**
 * Potential career pathways. Roles are commonly associated with medical coding;
 * EMC should keep only those relevant to its curriculum (set status: "confirmed").
 * Language must stay non-promissory: "roles may include", never "you will get".
 */
export const careerPath = [
  { id: "learn", title: "Learn", text: "Build the medical and coding foundation." },
  { id: "practice", title: "Practice", text: "Code cases until accuracy becomes habit." },
  { id: "certify", title: "Certification", text: "Complete assessments; explore professional certification." },
  { id: "entry", title: "Entry-level opportunity", text: "Apply for roles that match your skills." },
  { id: "experience", title: "Experience", text: "Grow accuracy, speed and domain depth on the job." },
  { id: "specialise", title: "Specialisation", text: "Focus on a specialty or a review function." },
  { id: "growth", title: "Career growth", text: "Move towards quality, audit, training or leadership." },
];

export const careerRoles: CareerRole[] = [
  {
    id: "medical-coder",
    title: "Medical Coder",
    status: "indicative",
    involves:
      "Reviewing clinical documentation and assigning diagnosis and procedure codes that accurately reflect the encounter.",
    skills: ["Medical terminology", "ICD-10-CM / CPT® / HCPCS navigation", "Attention to detail", "Guideline application"],
    learn: ["Medical foundation modules", "Core code-set modules", "Practical case coding"],
    nextSteps: ["Build accuracy on varied cases", "Explore professional certification", "Choose a specialty to deepen"],
  },
  {
    id: "coding-analyst",
    title: "Coding Analyst",
    status: "indicative",
    involves:
      "Analysing coded data and documentation patterns to support accuracy, consistency and reporting.",
    skills: ["Coding accuracy", "Data interpretation", "Guideline knowledge", "Clear communication"],
    learn: ["Official guidelines & compliance", "Practical cases", "Assessment & review"],
    nextSteps: ["Gain hands-on coding experience", "Develop spreadsheet / reporting skills"],
  },
  {
    id: "billing",
    title: "Medical Billing Specialist",
    status: "indicative",
    involves:
      "Working with coded encounters to prepare and follow up on claims within the billing workflow.",
    skills: ["Understanding of codes on a claim", "Revenue-cycle basics", "Process discipline"],
    learn: ["Coding fundamentals & the revenue cycle", "Core code sets"],
    nextSteps: ["Learn payer and claim workflows", "Move towards revenue-cycle roles"],
  },
  {
    id: "cdi",
    title: "Clinical documentation-related roles",
    status: "indicative",
    involves:
      "Supporting complete and accurate clinical documentation so it can be coded correctly — typically after clinical or coding experience.",
    skills: ["Clinical knowledge", "Documentation review", "Query writing", "Collaboration with clinicians"],
    learn: ["Medical foundation", "Guidelines & documentation queries"],
    nextSteps: ["Build clinical and coding experience", "Explore specialised CDI training"],
  },
  {
    id: "rcm",
    title: "Revenue cycle-related roles",
    status: "indicative",
    involves:
      "Contributing to the flow from patient encounter to claim and payment, where accurate coding is a core input.",
    skills: ["Revenue-cycle understanding", "Coding literacy", "Problem solving"],
    learn: ["Coding fundamentals & the revenue cycle", "Practical cases"],
    nextSteps: ["Gain exposure to multiple revenue-cycle functions"],
  },
  {
    id: "audit",
    title: "Coding quality / audit-related roles",
    status: "indicative",
    involves:
      "Reviewing coded records against documentation and guidelines to identify errors and improvement areas — usually an experienced-level path.",
    skills: ["Deep guideline expertise", "High accuracy", "Feedback & reporting"],
    learn: ["Guidelines & compliance", "Advanced case coding", "Assessment & review"],
    nextSteps: ["Accumulate coding experience", "Pursue advanced or audit-focused certification"],
  },
];
