/**
 * "Is medical coding right for you?" — a reflective self-check, not an assessment.
 * Scores only steer the recommendation text; nothing here predicts employment.
 */
export interface QuizOption {
  label: string;
  /** Weights towards each recommendation. */
  score: { beginner?: number; advanced?: number; counselling?: number; fit?: number };
}
export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export const quiz: QuizQuestion[] = [
  {
    id: "education",
    question: "What is your educational background?",
    options: [
      { label: "Medical / dental / AYUSH", score: { beginner: 2, fit: 2 } },
      { label: "Nursing, pharmacy or allied health", score: { beginner: 2, fit: 2 } },
      { label: "Life sciences", score: { beginner: 2, fit: 1 } },
      { label: "Something else", score: { counselling: 2 } },
    ],
  },
  {
    id: "exposure",
    question: "How much healthcare or coding exposure do you have?",
    options: [
      { label: "None yet", score: { beginner: 2 } },
      { label: "Some clinical / hospital exposure", score: { beginner: 1, fit: 1 } },
      { label: "I work in coding or billing today", score: { advanced: 3, fit: 1 } },
    ],
  },
  {
    id: "interest",
    question: "How interested are you in how healthcare works behind the scenes?",
    options: [
      { label: "Very — I’m curious about it", score: { fit: 2 } },
      { label: "Somewhat", score: { fit: 1 } },
      { label: "Not sure yet", score: { counselling: 1 } },
    ],
  },
  {
    id: "detail",
    question: "How do you feel about detail-oriented, focused work?",
    options: [
      { label: "I enjoy precision and rules", score: { fit: 2 } },
      { label: "I can do it with practice", score: { fit: 1 } },
      { label: "I prefer fast, people-facing work", score: { counselling: 2 } },
    ],
  },
  {
    id: "learning",
    question: "How do you prefer to learn?",
    options: [
      { label: "Guided sessions with a mentor", score: { beginner: 1 } },
      { label: "Lots of hands-on practice", score: { fit: 1 } },
      { label: "Self-paced, at my own time", score: { counselling: 1 } },
    ],
  },
  {
    id: "goal",
    question: "What is your main goal right now?",
    options: [
      { label: "Start a new career", score: { beginner: 2 } },
      { label: "Grow in my current coding role", score: { advanced: 2 } },
      { label: "Explore options before deciding", score: { counselling: 2 } },
    ],
  },
];

export const quizResults = {
  beginner: {
    title: "Start with a structured foundation.",
    text: "Based on your answers, a beginner-friendly program that builds medical and coding foundations step by step looks like a sensible next step.",
    href: "/programs/medical-coding-career-program",
    cta: "Explore the Career Program",
  },
  advanced: {
    title: "Go deeper, sharpen accuracy.",
    text: "You already have exposure. An advanced program focused on guidelines and complex cases may suit you best.",
    href: "/programs/advanced-medical-coding",
    cta: "Explore Advanced Coding",
  },
  counselling: {
    title: "Talk it through first.",
    text: "Your answers suggest it’s worth a conversation before choosing. A counsellor can help you understand whether medical coding fits your background and goals.",
    href: "/counselling",
    cta: "Talk to a counsellor",
  },
};
