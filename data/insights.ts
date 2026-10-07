import type { Insight, InsightCategory } from "@/lib/types";

export const insightCategories: InsightCategory[] = [
  "Medical Coding",
  "ICD",
  "CPT",
  "Healthcare Revenue Cycle",
  "Career",
  "Certification",
  "Industry Trends",
  "Student Guides",
];

/**
 * EMC INSIGHTS — editorial content. Articles below are general explainers;
 * EMC should review them before launch and add its own author bylines.
 */
export const insights: Insight[] = [
  {
    slug: "what-is-medical-coding",
    title: "What is medical coding? A plain-language guide",
    category: "Medical Coding",
    excerpt:
      "Behind every visit, test and procedure is a record — and behind every record, a set of standard codes. Here’s what that means.",
    readingMinutes: 5,
    publishedAt: "2026-09-01",
    author: "EMC Editorial",
    body: [
      { type: "p", text: "When a patient visits a clinic or hospital, the clinician documents what happened: symptoms, findings, the diagnosis and any procedures or services provided. Medical coding is the process of translating that documentation into standardised codes." },
      { type: "h2", text: "Why codes?" },
      { type: "p", text: "Free text is hard to compare, count or process at scale. Standard codes give every diagnosis and service a consistent identifier, so information can move reliably through healthcare administration — including billing and claims workflows, reporting and healthcare data analysis." },
      { type: "h2", text: "The main code sets" },
      { type: "ul", items: ["ICD-10-CM — diagnoses, symptoms and reasons for an encounter", "CPT® — procedures and services performed by providers", "HCPCS Level II — supplies, drugs, equipment and certain services"] },
      { type: "h2", text: "What a coder actually does" },
      { type: "p", text: "A coder reads the clinical documentation, identifies the diagnoses and services that are supported by it, and assigns the most accurate codes according to official guidelines. Coders do not diagnose or treat patients — they work with what the clinician has documented." },
      { type: "note", text: "Examples on this site use fictional patients and are for learning only." },
    ],
  },
  {
    slug: "icd-cpt-hcpcs-difference",
    title: "ICD vs CPT® vs HCPCS: what’s the difference?",
    category: "ICD",
    excerpt: "Three code sets, three jobs. A quick way to remember which one describes what.",
    readingMinutes: 4,
    publishedAt: "2026-09-08",
    author: "EMC Editorial",
    body: [
      { type: "p", text: "A simple way to remember it: ICD answers “why was the patient seen?”, CPT® answers “what did the provider do?”, and HCPCS Level II covers “what else was supplied?”." },
      { type: "h2", text: "ICD-10-CM" },
      { type: "p", text: "Used to report diagnoses, signs, symptoms and reasons for encounters. Codes are alphanumeric and become more specific with each character." },
      { type: "h2", text: "CPT®" },
      { type: "p", text: "Used to report medical, surgical and diagnostic procedures and services, including evaluation and management visits. CPT® is maintained by the American Medical Association." },
      { type: "h2", text: "HCPCS Level II" },
      { type: "p", text: "Used for items and services not included in CPT® — for example durable medical equipment, certain drugs and supplies." },
    ],
  },
  {
    slug: "revenue-cycle-explained",
    title: "Where coding fits in the healthcare revenue cycle",
    category: "Healthcare Revenue Cycle",
    excerpt: "From registration to payment: why accurate codes matter at every step.",
    readingMinutes: 4,
    publishedAt: "2026-09-15",
    author: "EMC Editorial",
    body: [
      { type: "p", text: "The healthcare revenue cycle is the sequence of administrative steps from the moment a patient is registered to the moment an encounter is fully processed and paid." },
      { type: "ul", items: ["Registration & eligibility", "Encounter & documentation", "Coding", "Charge entry & claim submission", "Payment posting & follow-up"] },
      { type: "p", text: "Coding sits in the middle. Codes that do not match the documentation can lead to claim rejections, rework or compliance risk — which is why accuracy is the core skill of a coder." },
    ],
  },
  {
    slug: "is-medical-coding-right-for-you",
    title: "Is medical coding right for you? Honest questions to ask",
    category: "Student Guides",
    excerpt: "Before you enrol anywhere, ask yourself these questions — and ask any academy these too.",
    readingMinutes: 6,
    publishedAt: "2026-09-22",
    author: "EMC Editorial",
    body: [
      { type: "p", text: "Medical coding suits people who enjoy precision, reading carefully and applying rules consistently. It is a focused, largely desk-based role." },
      { type: "h2", text: "Questions to ask yourself" },
      { type: "ul", items: ["Do I enjoy detail-oriented work?", "Am I comfortable with medical terminology — or willing to learn it?", "Am I ready for continuous learning as code sets update?"] },
      { type: "h2", text: "Questions to ask any academy" },
      { type: "ul", items: ["What exactly is in the syllabus?", "How much practical case work is included?", "Is the certificate issued by the academy, or by an external professional body?", "Who are the faculty and what is their experience?", "Are placement claims verifiable?"] },
      { type: "note", text: "No training provider can guarantee a job or a salary. Be cautious of anyone who does." },
    ],
  },
  {
    slug: "academy-vs-professional-certification",
    title: "Course certificate or professional certification?",
    category: "Certification",
    excerpt: "They are not the same thing. Here’s how to tell them apart.",
    readingMinutes: 3,
    publishedAt: "2026-09-29",
    author: "EMC Editorial",
    body: [
      { type: "p", text: "A course-completion certificate shows you completed a training program at a particular academy. A professional certification is awarded by an independent professional body after you pass that body’s examination and meet its requirements." },
      { type: "p", text: "Both can be valuable. What matters is that you know which one you are getting. EMC will always state clearly what its programs award and what they prepare you for." },
    ],
  },
  {
    slug: "reading-a-clinical-note",
    title: "How coders read a clinical note",
    category: "Career",
    excerpt: "Chief complaint, history, exam, assessment, plan — and what to look for in each.",
    readingMinutes: 5,
    publishedAt: "2026-10-03",
    author: "EMC Editorial",
    body: [
      { type: "p", text: "Most outpatient notes follow a familiar structure. Learning where information lives makes coding faster and more accurate." },
      { type: "ul", items: ["Chief complaint — why the patient came in", "History — background and context", "Examination — what the clinician observed", "Assessment — the clinician’s conclusion (diagnosis)", "Plan — what happens next"] },
      { type: "p", text: "The assessment usually carries the confirmed diagnosis. Symptoms elsewhere in the note are context — whether they are coded depends on guidelines and on what was concluded." },
    ],
  },
];

export const getInsight = (slug: string) => insights.find((i) => i.slug === slug);
