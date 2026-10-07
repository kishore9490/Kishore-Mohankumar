/**
 * Global site configuration.
 * Contact fields are intentionally null until EMC supplies verified details —
 * components hide anything that is not configured.
 */
export const site = {
  name: "EMC",
  legalName: "Experts Medical Coding Academy",
  title: "EMC — Experts Medical Coding Academy",
  description:
    "Learn medical coding through structured education, practical training and career-focused learning with EMC — Experts Medical Coding Academy.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  /**
   * OFFICIAL LOGO
   * Drop the supplied EMC logo file into /public/brand/ and point `src` at it
   * (e.g. "/brand/emc-logo.png"). Set the intrinsic width/height of the file.
   * The current file is a neutral typographic stand-in, NOT the brand mark.
   */
  logo: {
    src: "/brand/emc-logo-placeholder.svg",
    width: 200,
    height: 48,
    alt: "EMC — Experts Medical Coding Academy",
    isPlaceholder: true,
  },

  contact: {
    phone: null as string | null, // e.g. "+91 98XXX XXXXX"
    email: null as string | null,
    address: null as string | null,
    hours: null as string | null,
    mapUrl: null as string | null,
  },

  whatsapp: {
    /** Digits only, international format. Read from env so it can differ per deployment. */
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  },

  social: [] as { label: string; href: string }[],

  nav: [
    { label: "Programs", href: "/programs" },
    { label: "Why EMC", href: "/about" },
    { label: "Learning", href: "/#learning" },
    { label: "Career", href: "/career" },
    { label: "Faculty", href: "/faculty" },
    { label: "Insights", href: "/insights" },
    { label: "Contact", href: "/contact" },
  ],

  primaryCta: { label: "Book a free demo", href: "/demo" },
} as const;

export const showPlaceholders = process.env.NEXT_PUBLIC_SHOW_PLACEHOLDERS === "true";

/** Demo-class preferences shown in the demo form. Edit freely. */
export const demoAvailability = {
  /** Leave empty to let the visitor propose any date. */
  slots: ["Weekday morning", "Weekday afternoon", "Weekday evening", "Weekend"],
  modes: ["Online", "At the academy"],
  note: "Our team will confirm an exact date and time with you.",
};

export const educationOptions = [
  "MBBS / BDS / AYUSH",
  "Nursing",
  "Pharmacy (B.Pharm / Pharm.D / M.Pharm)",
  "Physiotherapy / allied health",
  "Life sciences (B.Sc / M.Sc)",
  "Other graduate",
  "Currently studying",
  "Other",
];
