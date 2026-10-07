import type { FAQ } from "@/lib/types";

/**
 * FAQs. `answer: null` means EMC has not confirmed the answer yet —
 * the UI shows "Ask us during counselling" and excludes it from FAQ schema.
 * Only general, factual answers about the field are pre-filled.
 */
export const faqs: FAQ[] = [
  {
    id: "what-is",
    category: "medical-coding",
    question: "What is medical coding?",
    answer:
      "Medical coding is the process of translating diagnoses, procedures, services and supplies documented in a patient’s healthcare record into standardised codes. Those codes are used in healthcare administration — for example in billing and claims workflows, reporting and healthcare data.",
  },
  {
    id: "code-sets",
    category: "medical-coding",
    question: "Which code sets are commonly used?",
    answer:
      "Commonly referenced code sets include ICD-10-CM for diagnoses, CPT® for procedures and services, and HCPCS Level II for supplies, drugs, equipment and certain services. Which code sets you use depends on the setting and region you work in.",
  },
  {
    id: "doctor",
    category: "medical-coding",
    question: "Do medical coders treat patients or give medical advice?",
    answer:
      "No. Medical coders work with documentation that clinicians have already written. Coding is an administrative and analytical role — it does not involve diagnosing, treating or advising patients.",
  },
  {
    id: "who-can",
    category: "eligibility",
    question: "Who can learn medical coding?",
    answer:
      "Medical coding is commonly pursued by people with a medical, nursing, pharmacy, allied-health or life-science background, because familiarity with clinical language helps. EMC will confirm the exact eligibility for each program during counselling.",
  },
  { id: "background", category: "eligibility", question: "What background is required to join EMC?", answer: null },
  { id: "duration", category: "course", question: "How long is the course?", answer: null },
  { id: "mode", category: "course", question: "Is the course online or offline?", answer: null },
  {
    id: "learn",
    category: "course",
    question: "What will I learn?",
    answer:
      "You can explore the indicative learning path on our Programs page — from medical terminology and anatomy through ICD-10-CM, CPT® and HCPCS Level II to practical cases and career preparation. The confirmed syllabus is shared during counselling.",
  },
  { id: "certification", category: "certification", question: "What certification is available?", answer: null },
  {
    id: "external-cert",
    category: "certification",
    question: "Is an EMC certificate the same as a professional certification?",
    answer:
      "Not necessarily. A course-completion certificate is issued by the academy that trained you. Professional certifications are awarded by independent professional bodies after you pass their own exams. We will always state clearly which is which.",
  },
  { id: "assessment", category: "course", question: "How are assessments conducted?", answer: null },
  {
    id: "careers",
    category: "career",
    question: "What career paths are available?",
    answer:
      "Roles connected to medical coding may include medical coder, coding analyst, medical billing and revenue-cycle roles, and — with experience — quality / audit-focused roles. Opportunities depend on your skills, experience, certification and the job market; no training provider can guarantee employment.",
  },
  {
    id: "enrol",
    category: "admissions",
    question: "How do I enrol?",
    answer:
      "Start by booking a free demo or a counselling session. A counsellor will understand your background, recommend a program, and walk you through the admission steps.",
  },
];
