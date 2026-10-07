/**
 * EMC content & entity model.
 *
 * Everything the academy may want to edit lives in /data and is typed here so the
 * site can later be backed by a CMS / CRM / LMS without touching components.
 *
 * Honesty rule: a value that EMC has not confirmed is `null` (or `status: "pending"`).
 * Components must render a graceful "shared during counselling" state for nulls and
 * must never substitute invented numbers, fees, accreditation or outcomes.
 */

/** Where a piece of content came from. Only `confirmed` content is presented as fact. */
export type ContentStatus = "confirmed" | "indicative" | "placeholder";

export type Audience = "beginner" | "advanced" | "all";

export interface CurriculumModule {
  id: string;
  stage: number;
  title: string;
  /** Short technical label shown on the curriculum map (e.g. "ICD-10-CM"). */
  label: string;
  summary: string;
  objective: string;
  example: string;
  topics: string[];
  /** Human readable stage label: "Foundation", "Core coding", ... */
  phase: string;
}

export interface Fee {
  /** All amounts are null until EMC publishes them. */
  courseFee: number | null;
  registrationFee: number | null;
  currency: "INR" | "USD";
  installments: { label: string; amount: number }[] | null;
  scholarships: string | null;
  paymentLink: string | null;
  notes: string | null;
}

export interface FAQ {
  id: string;
  question: string;
  /** null = not yet confirmed by EMC; rendered as "we'll answer this in counselling". */
  answer: string | null;
  category: "medical-coding" | "eligibility" | "course" | "certification" | "career" | "admissions";
}

export interface Program {
  slug: string;
  name: string;
  shortName: string;
  status: ContentStatus;
  audience: Audience;
  tagline: string;
  summary: string;
  whoFor: string[];
  duration: string | null;
  mode: string | null;
  schedule: string | null;
  /** IDs from data/curriculum.ts */
  curriculum: string[];
  outcomes: string[];
  methodology: string[];
  practicalExposure: string[];
  certification: {
    /** EMC's own course-completion certificate. */
    emcCertificate: string | null;
    /** Preparation towards an external body's exam (EMC does not award these). */
    externalPreparation: string | null;
  };
  assessment: string[];
  /** IDs from data/faculty.ts */
  faculty: string[];
  fee: Fee;
  faqs: FAQ[];
}

export interface Faculty {
  id: string;
  status: ContentStatus;
  name: string;
  designation: string;
  experience: string | null;
  specialization: string[];
  bio: string;
  photo: string | null;
  linkedin: string | null;
}

export interface Testimonial {
  id: string;
  name: string;
  photo: string | null;
  background: string;
  course: string;
  quote: string;
  outcome: string | null;
  /** Must be true — only verified, consented testimonials may be published. */
  verified: boolean;
}

export interface Stat {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  /** Source / basis for the number, shown as a footnote. Required. */
  source: string;
  verified: boolean;
}

export interface CareerRole {
  id: string;
  title: string;
  status: ContentStatus;
  involves: string;
  skills: string[];
  learn: string[];
  nextSteps: string[];
}

export interface Insight {
  slug: string;
  title: string;
  category: InsightCategory;
  excerpt: string;
  readingMinutes: number;
  /** ISO date. */
  publishedAt: string;
  author: string;
  body: { type: "p" | "h2" | "ul" | "note"; text?: string; items?: string[] }[];
}

export type InsightCategory =
  | "Medical Coding"
  | "ICD"
  | "CPT"
  | "Healthcare Revenue Cycle"
  | "Career"
  | "Certification"
  | "Industry Trends"
  | "Student Guides";

export interface LearningFeature {
  id: string;
  title: string;
  description: string;
  /** Only `true` features are shown publicly. */
  enabled: boolean;
  status: ContentStatus;
}

export interface EligibilityProfile {
  id: string;
  title: string;
  description: string;
  fit: string;
  suggestedPath: "beginner" | "advanced" | "counselling";
  status: ContentStatus;
}

/* ---------- CRM / LMS-ready entities (front-end contracts only) ---------- */

export type LeadType = "demo" | "counselling" | "enquiry" | "contact" | "quiz";

export interface Lead {
  type: LeadType;
  name: string;
  phone: string;
  email?: string;
  education?: string;
  experience?: string;
  interest?: string;
  preferredContact?: "phone" | "whatsapp" | "email";
  preferredSlot?: string;
  message?: string;
  programSlug?: string;
  source?: string;
  consent: boolean;
}

export interface Batch {
  id: string;
  programSlug: string;
  startDate: string | null;
  mode: string | null;
  seats: number | null;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  enrolments: { programSlug: string; batchId: string }[];
}
