import type { EligibilityProfile, LearningFeature } from "@/lib/types";

/**
 * LEARNING EXPERIENCE — toggle `enabled` to match what EMC actually provides.
 * Disabled features are never rendered.
 */
export const learningFeatures: LearningFeature[] = [
  { id: "live", title: "Guided sessions", description: "Concepts explained step by step, with room for questions.", enabled: true, status: "indicative" },
  { id: "cases", title: "Case-based learning", description: "Every concept is anchored to a realistic, fictional patient record.", enabled: true, status: "indicative" },
  { id: "exercises", title: "Coding exercises", description: "Practise code selection after each module — then review why.", enabled: true, status: "indicative" },
  { id: "assessments", title: "Practice assessments", description: "Checkpoints that show what you have mastered and what to revisit.", enabled: true, status: "indicative" },
  { id: "mentor", title: "Mentor interaction", description: "Discuss tricky cases and guideline questions with faculty.", enabled: true, status: "indicative" },
  { id: "doubts", title: "Doubt resolution", description: "A clear route to get unstuck — no question is too basic.", enabled: true, status: "indicative" },
  { id: "progress", title: "Progress tracking", description: "See your module completion and assessment performance at a glance.", enabled: true, status: "indicative" },
  { id: "mocks", title: "Mock assessments", description: "Timed practice that builds speed and accuracy together.", enabled: true, status: "indicative" },
  { id: "career", title: "Career guidance", description: "Support with your profile, interviews and next learning steps.", enabled: true, status: "indicative" },
  { id: "video", title: "Recorded lessons", description: "Revisit lessons at your own pace.", enabled: false, status: "placeholder" },
];

export const enabledLearningFeatures = learningFeatures.filter((f) => f.enabled);

/**
 * ELIGIBILITY / AUDIENCE — descriptive profiles, not admission rules.
 * Formal eligibility criteria should be defined in `eligibilityRules` once EMC confirms them.
 */
export const audienceProfiles: EligibilityProfile[] = [
  {
    id: "medical",
    title: "Medical & healthcare graduates",
    description: "MBBS, BDS, AYUSH and other clinical graduates.",
    fit: "You already speak the clinical language — coding turns that knowledge into a structured, non-clinical career skill.",
    suggestedPath: "beginner",
    status: "indicative",
  },
  {
    id: "lifescience",
    title: "Life science graduates",
    description: "Biology, biotechnology, microbiology, biochemistry and related degrees.",
    fit: "Your understanding of the human body and disease gives you a head start on anatomy and pathology.",
    suggestedPath: "beginner",
    status: "indicative",
  },
  {
    id: "pharmacy",
    title: "Pharmacy graduates",
    description: "B.Pharm, Pharm.D, M.Pharm.",
    fit: "Drug knowledge and attention to detail translate well into documentation review and coding.",
    suggestedPath: "beginner",
    status: "indicative",
  },
  {
    id: "nursing",
    title: "Nursing & allied health",
    description: "Nursing, physiotherapy, lab technology and other allied-health backgrounds.",
    fit: "You have seen clinical documentation first-hand — now learn how it is classified and used.",
    suggestedPath: "beginner",
    status: "indicative",
  },
  {
    id: "professionals",
    title: "Healthcare professionals",
    description: "People working in healthcare operations, billing or coding today.",
    fit: "Formalise and deepen what you already know with guideline-focused, case-heavy training.",
    suggestedPath: "advanced",
    status: "indicative",
  },
  {
    id: "switchers",
    title: "Career switchers",
    description: "Graduates exploring a healthcare-technology career.",
    fit: "Possible with commitment — a counsellor can tell you honestly whether it suits your background.",
    suggestedPath: "counselling",
    status: "indicative",
  },
];

/** Formal eligibility rules. Empty until EMC confirms them. */
export const eligibilityRules: { programSlug: string; rule: string }[] = [];
