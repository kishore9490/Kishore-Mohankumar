import type { CurriculumModule } from "@/lib/types";

/**
 * INDICATIVE CURRICULUM
 * A standard medical-coding learning path used to structure the site.
 * EMC should replace / reorder / remove modules to match the confirmed syllabus.
 * Status for the whole map is shown to visitors as "Indicative learning path".
 */
export const curriculumStatus = "indicative" as const;

export const curriculum: CurriculumModule[] = [
  {
    id: "terminology",
    stage: 1,
    phase: "Medical foundation",
    label: "Terminology",
    title: "Medical terminology",
    summary:
      "The language of medicine — prefixes, roots and suffixes that let you read a clinical note with confidence.",
    objective: "Break down unfamiliar clinical terms and understand what the clinician actually documented.",
    example: "“Pharyngitis” → pharyng (throat) + itis (inflammation).",
    topics: ["Word roots, prefixes & suffixes", "Abbreviations in clinical notes", "Body-system vocabulary"],
  },
  {
    id: "anatomy",
    stage: 2,
    phase: "Medical foundation",
    label: "A&P",
    title: "Anatomy & physiology",
    summary: "How the body is organised and how its systems work — the context behind every diagnosis and procedure.",
    objective: "Locate structures and understand normal function so documentation makes sense.",
    example: "Knowing where the femur sits helps you read an orthopaedic procedure note.",
    topics: ["Body systems overview", "Directional & positional terms", "Organ function"],
  },
  {
    id: "pathology",
    stage: 3,
    phase: "Medical foundation",
    label: "Pathology",
    title: "Pathology & pharmacology basics",
    summary: "Disease processes and common medications — what changes when something goes wrong.",
    objective: "Recognise conditions, complications and treatments described in documentation.",
    example: "Distinguishing an acute condition from a chronic one changes how it is coded.",
    topics: ["Disease processes", "Acute vs chronic conditions", "Common drug classes"],
  },
  {
    id: "coding-foundation",
    stage: 4,
    phase: "Coding foundation",
    label: "Fundamentals",
    title: "Coding fundamentals & the revenue cycle",
    summary: "What code sets exist, why they exist, and where coding sits in the healthcare revenue cycle.",
    objective: "Explain the purpose of diagnosis, procedure and supply code sets and how they connect to claims.",
    example: "A single outpatient visit can produce a diagnosis code and a procedure / service code.",
    topics: ["Code-set landscape", "Documentation → code → claim", "Compliance & ethics basics"],
  },
  {
    id: "icd",
    stage: 5,
    phase: "Core coding",
    label: "ICD-10-CM",
    title: "ICD-10-CM diagnosis coding",
    summary: "Classify diagnoses, symptoms and reasons for encounters using the ICD-10-CM code set.",
    objective: "Navigate the Alphabetic Index and Tabular List and apply conventions to reach a specific code.",
    example: "Index → Tabular → verify conventions → assign the most specific supported code.",
    topics: ["Index & Tabular navigation", "Conventions & instructional notes", "Chapter-specific guidelines"],
  },
  {
    id: "cpt",
    stage: 6,
    phase: "Core coding",
    label: "CPT®",
    title: "CPT® procedure & service coding",
    summary: "Report procedures and services performed by providers, including evaluation & management.",
    objective: "Select procedure / service codes and modifiers supported by documentation.",
    example: "Reading an operative note to identify what was actually performed.",
    topics: ["Section structure", "Evaluation & Management (E/M)", "Modifiers"],
  },
  {
    id: "hcpcs",
    stage: 7,
    phase: "Core coding",
    label: "HCPCS II",
    title: "HCPCS Level II",
    summary: "Codes for supplies, drugs, equipment and services not covered by CPT®.",
    objective: "Identify when a HCPCS Level II code applies and select it accurately.",
    example: "Durable medical equipment and certain injectable drugs are reported with HCPCS Level II.",
    topics: ["Code structure", "Drugs & supplies", "HCPCS modifiers"],
  },
  {
    id: "guidelines",
    stage: 8,
    phase: "Core coding",
    label: "Guidelines",
    title: "Official guidelines & compliance",
    summary: "The rules that govern code selection, sequencing and reporting.",
    objective: "Apply official coding guidelines and understand why compliance matters.",
    example: "Signs and symptoms integral to a confirmed diagnosis are generally not coded separately.",
    topics: ["Sequencing rules", "Outpatient vs inpatient principles", "Documentation queries"],
  },
  {
    id: "cases",
    stage: 9,
    phase: "Application",
    label: "Practical cases",
    title: "Practical case coding",
    summary: "Code de-identified / fictional cases end-to-end, the way you would on the job.",
    objective: "Combine everything you have learned to code complete records accurately.",
    example: "Read the record → abstract diagnoses & procedures → assign codes → review.",
    topics: ["Specialty-based cases", "Accuracy review", "Common errors"],
  },
  {
    id: "assessment",
    stage: 10,
    phase: "Application",
    label: "Assessment",
    title: "Assessment & mock tests",
    summary: "Timed practice and assessments that measure accuracy and speed.",
    objective: "Demonstrate readiness through structured assessment.",
    example: "Mock assessments that mirror the format of the programme’s final evaluation.",
    topics: ["Module assessments", "Mock tests", "Feedback & revision"],
  },
  {
    id: "career-prep",
    stage: 11,
    phase: "Career readiness",
    label: "Career prep",
    title: "Career preparation",
    summary: "Translate your skills into applications, interviews and a plan for continuous learning.",
    objective: "Present your skills professionally and plan your next steps.",
    example: "Résumé review, interview practice and guidance on professional certification pathways.",
    topics: ["Résumé & profile", "Interview preparation", "Certification pathway guidance"],
  },
];

export const curriculumById = Object.fromEntries(curriculum.map((m) => [m.id, m])) as Record<
  string,
  CurriculumModule
>;
