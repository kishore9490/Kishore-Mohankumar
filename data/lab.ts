/**
 * MEDICAL CODING LAB & CODE JOURNEY — EDUCATIONAL SIMULATION DATA
 *
 * All patients and encounters are FICTIONAL. Codes are shown to illustrate the
 * learning process only. Real-world code assignment depends on complete
 * documentation, the current code-set edition, payer rules and official guidelines.
 * This is not a coding recommendation engine and not medical advice.
 *
 * ICD-10-CM and HCPCS Level II are published by U.S. government agencies.
 * CPT® is a registered trademark of the American Medical Association; descriptions
 * here are paraphrased for teaching.
 */

export type CodeCategory = "ICD-10-CM" | "CPT®" | "HCPCS II";

export interface LabOption {
  code: string;
  label: string;
  correct: boolean;
  why: string;
}

export interface LabCase {
  id: string;
  title: string;
  specialty: string;
  patient: string;
  note: string[];
  /** Words / phrases in `note` that matter for this task. Matched case-insensitively. */
  keyTerms: { term: string; meaning: string; relevant: boolean }[];
  task: string;
  category: CodeCategory;
  options: LabOption[];
  takeaway: string;
}

export const labCases: LabCase[] = [
  {
    id: "uri",
    title: "Sore throat & cough",
    specialty: "Primary care · outpatient",
    patient: "Fictional patient · 29 y · established",
    note: [
      "Chief complaint: sore throat, nasal congestion and dry cough for 3 days.",
      "Exam: mild pharyngeal erythema, lungs clear, no respiratory distress.",
      "Assessment: acute upper respiratory infection.",
      "Plan: supportive care, fluids, review if symptoms worsen.",
    ],
    keyTerms: [
      { term: "acute upper respiratory infection", meaning: "The confirmed diagnosis documented by the clinician.", relevant: true },
      { term: "dry cough", meaning: "A symptom — integral to the diagnosis here.", relevant: false },
      { term: "sore throat", meaning: "A symptom — integral to the diagnosis here.", relevant: false },
      { term: "lungs clear", meaning: "Exam finding that argues against a lower-respiratory diagnosis.", relevant: false },
    ],
    task: "Assign the diagnosis code for this encounter.",
    category: "ICD-10-CM",
    options: [
      { code: "J06.9", label: "Acute upper respiratory infection, unspecified", correct: true, why: "Matches the documented assessment. No more specific site was documented." },
      { code: "R05.9", label: "Cough, unspecified", correct: false, why: "Cough is a symptom integral to the confirmed diagnosis, so it is generally not coded separately." },
      { code: "J20.9", label: "Acute bronchitis, unspecified", correct: false, why: "Bronchitis was not documented — and the lungs were clear." },
      { code: "J02.9", label: "Acute pharyngitis, unspecified", correct: false, why: "The clinician documented an upper respiratory infection, not pharyngitis alone." },
    ],
    takeaway: "Code what the clinician concluded. Signs and symptoms that are routinely part of a confirmed diagnosis are generally not coded separately.",
  },
  {
    id: "htn",
    title: "Blood-pressure follow-up",
    specialty: "Internal medicine · outpatient",
    patient: "Fictional patient · 56 y · established",
    note: [
      "Reason for visit: follow-up of essential hypertension.",
      "BP well controlled on current medication. No chest pain or breathlessness.",
      "No heart disease or chronic kidney disease documented.",
      "Assessment: essential hypertension, controlled. Continue current plan.",
    ],
    keyTerms: [
      { term: "essential hypertension", meaning: "Primary hypertension — the condition being managed.", relevant: true },
      { term: "No heart disease or chronic kidney disease documented", meaning: "Rules out combination codes for hypertensive heart / kidney disease.", relevant: true },
      { term: "well controlled", meaning: "Status of the condition; does not change the code here.", relevant: false },
    ],
    task: "Assign the diagnosis code for this encounter.",
    category: "ICD-10-CM",
    options: [
      { code: "I10", label: "Essential (primary) hypertension", correct: true, why: "Essential hypertension with no documented heart or kidney involvement." },
      { code: "I11.9", label: "Hypertensive heart disease without heart failure", correct: false, why: "Requires documented heart involvement — the note states there is none." },
      { code: "I15.9", label: "Secondary hypertension, unspecified", correct: false, why: "Secondary hypertension is caused by another condition; this is documented as essential." },
      { code: "R03.0", label: "Elevated blood-pressure reading, without diagnosis of hypertension", correct: false, why: "Used when there is no hypertension diagnosis — here the diagnosis is established." },
    ],
    takeaway: "Read what is documented and what is explicitly ruled out — both affect which code is supported.",
  },
  {
    id: "dm",
    title: "Diabetes review",
    specialty: "Endocrinology · outpatient",
    patient: "Fictional patient · 47 y · established",
    note: [
      "Reason for visit: routine review of type 2 diabetes mellitus.",
      "On oral medication. No documented complications.",
      "Recent results discussed; reinforced diet and activity plan.",
      "Assessment: type 2 diabetes mellitus without complications.",
    ],
    keyTerms: [
      { term: "type 2 diabetes mellitus", meaning: "The diabetes type drives the code category (E11).", relevant: true },
      { term: "without complications", meaning: "Determines the final character — no complication codes apply.", relevant: true },
      { term: "oral medication", meaning: "Medication use may be reported with an additional status code in real coding.", relevant: false },
    ],
    task: "Assign the primary diagnosis code for this encounter.",
    category: "ICD-10-CM",
    options: [
      { code: "E11.9", label: "Type 2 diabetes mellitus without complications", correct: true, why: "Type and complication status both match the documentation." },
      { code: "E10.9", label: "Type 1 diabetes mellitus without complications", correct: false, why: "The documented type is type 2, not type 1." },
      { code: "E11.65", label: "Type 2 diabetes mellitus with hyperglycemia", correct: false, why: "Hyperglycemia was not documented as a complication." },
      { code: "R73.9", label: "Hyperglycemia, unspecified", correct: false, why: "A symptom-level code is not used when the diagnosis of diabetes is confirmed." },
    ],
    takeaway: "Specificity matters: the type of diabetes and the presence or absence of complications change the code.",
  },
];

export const codeCategories: { id: CodeCategory; describes: string }[] = [
  { id: "ICD-10-CM", describes: "Diagnoses, symptoms & reasons for the encounter" },
  { id: "CPT®", describes: "Procedures & services performed by providers" },
  { id: "HCPCS II", describes: "Supplies, drugs, equipment & certain services" },
];

/* ------------------------------------------------------------------ */
/* Hero micro-demo: one fictional record → diagnosis → code → claim   */
/* ------------------------------------------------------------------ */

export const heroCase = {
  label: "Fictional encounter · demo data",
  note: "29-year-old established patient presents with sore throat, nasal congestion and dry cough for 3 days. Lungs clear. Assessment: acute upper respiratory infection.",
  highlights: ["sore throat", "dry cough", "acute upper respiratory infection"],
  diagnosis: "Acute upper respiratory infection",
  service: "Office visit · established patient",
  codes: [
    { system: "ICD-10-CM", code: "J06.9", label: "Diagnosis" },
    { system: "CPT®", code: "99213", label: "E/M service (illustrative level)" },
  ],
};

/* ------------------------------------------------------------------ */
/* THE CODE JOURNEY — signature scroll story                          */
/* ------------------------------------------------------------------ */

export const codeJourney = [
  {
    id: "encounter",
    kicker: "01 · Patient encounter",
    title: "A patient walks in.",
    text: "Every code starts with a real human moment — a visit, a test, a procedure. Here, a fictional patient visits a clinic with a sore throat and cough.",
  },
  {
    id: "documentation",
    kicker: "02 · Clinical documentation",
    title: "The clinician writes it down.",
    text: "Symptoms, findings, assessment and plan are recorded in the medical record. This documentation is the coder’s source of truth.",
  },
  {
    id: "terminology",
    kicker: "03 · Medical terminology",
    title: "You learn to read it.",
    text: "Medical language is precise. Terminology lets you understand exactly what was found — and what was ruled out.",
  },
  {
    id: "diagnosis",
    kicker: "04 · Diagnosis & service",
    title: "You identify what matters.",
    text: "From the whole note, you abstract the confirmed diagnosis and the service that was provided.",
  },
  {
    id: "coding",
    kicker: "05 · Coding",
    title: "Words become standard codes.",
    text: "Using code sets and official guidelines, the diagnosis and service are translated into standardised codes.",
  },
  {
    id: "claim",
    kicker: "06 · Claim",
    title: "Codes travel on a claim.",
    text: "Codes are used in billing and claims workflows, where accuracy affects how the encounter is processed.",
  },
  {
    id: "data",
    kicker: "07 · Healthcare data",
    title: "And become healthcare data.",
    text: "Aggregated, coded data supports reporting, research and planning across the healthcare system.",
  },
] as const;
