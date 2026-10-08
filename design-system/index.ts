/**
 * EMC DESIGN SYSTEM — one import surface for the public website and the academy.
 *
 * Tokens live once, in app/globals.css (@theme): colors (ink, navy, blue, cyan,
 * cyan-ink, soft, mist, line, muted), fonts (Geist / Geist Mono), easing, radii.
 * Utility classes: .label (technical mono label), .heading, .display, .field,
 * .grid-bg / .grid-bg-dark, .container-x, .code-chip.
 *
 * Components below are the only button, icon, logo and surface primitives —
 * don't create parallel versions. Breakpoints are Tailwind's defaults
 * (sm 640, md 768, lg 1024, xl 1280). Motion uses the --ease-out-expo curve and
 * respects prefers-reduced-motion.
 */
export { Button, ButtonLink } from "@/components/ui/Button";
export { Icon, type IconName } from "@/components/ui/Icon";
export { Logo } from "@/components/ui/Logo";
export { Reveal } from "@/components/ui/Reveal";
export { StatusNote, Pending } from "@/components/ui/StatusNote";
export * from "@/components/academy/ui";
export * from "@/components/academy/charts";

export const tokens = {
  color: {
    ink: "#071a33",
    navy: "#0b2547",
    blue: "#1f5fd1",
    cyan: "#12b5d4",
    cyanInk: "#0a7f97",
    soft: "#e9f2fb",
    mist: "#f4f7fa",
    line: "#dfe6ee",
    muted: "#52637a",
  },
  radius: { control: 10, card: 14, panel: 16, hero: 22, pill: 999 },
  font: { sans: "Geist", mono: "Geist Mono" },
} as const;
