/**
 * "Watch course intro"
 * Set `src` to EMC's intro video (e.g. "/media/emc-intro.mp4" or a CDN URL) to play it.
 * Until then the site plays an animated explainer built from these slides.
 */
export const introVideo = {
  src: null as string | null,
  poster: null as string | null,
  slides: [
    {
      kicker: "01 · The field",
      title: "Every patient visit leaves a record.",
      text: "Symptoms, findings, diagnoses and procedures are documented by clinicians — in words.",
    },
    {
      kicker: "02 · The skill",
      title: "Medical coders translate those words into standard codes.",
      text: "Using code sets such as ICD-10-CM, CPT® and HCPCS Level II, and the official guidelines that govern them.",
    },
    {
      kicker: "03 · Why it matters",
      title: "Codes power healthcare administration.",
      text: "They are used in billing and claims workflows, reporting and healthcare data — so accuracy matters.",
    },
    {
      kicker: "04 · How EMC teaches",
      title: "Foundation. Code sets. Practice. Assessment.",
      text: "A structured path from medical terminology to coding real-world-style, fictional cases — with guidance on your next career step.",
    },
    {
      kicker: "05 · Your next step",
      title: "Experience a class before you decide.",
      text: "Book a free demo or talk to a counsellor about whether medical coding fits your background.",
    },
  ],
};
