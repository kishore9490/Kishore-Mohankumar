import type { SVGProps } from "react";

const paths = {
  arrow: "M5 12h14M13 6l6 6-6 6",
  arrowDown: "M12 5v14M6 13l6 6 6-6",
  check: "M5 12.5l4.5 4.5L19 7.5",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6L6 18",
  menu: "M4 7h16M4 12h16M4 17h10",
  play: "M8 5.5v13l11-6.5z",
  phone:
    "M6.6 3.5l2.6.4 1.3 3.7-1.9 1.4a11 11 0 005.4 5.4l1.4-1.9 3.7 1.3.4 2.6c.1.9-.6 1.6-1.5 1.6A15.9 15.9 0 015 5c0-.9.7-1.6 1.6-1.5z",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  pin: "M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0113 0c0 5.3-6.5 11-6.5 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 20a7.5 7.5 0 0115 0",
  book: "M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5zM4 20.5A2.5 2.5 0 016.5 18H20v3H6.5",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  file: "M14 3H6v18h12V7zM14 3v4h4M9 12h6M9 16h6",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6",
  compass: "M12 21a9 9 0 100-18 9 9 0 000 18zM15.5 8.5l-2 5-5 2 2-5z",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  award: "M12 15a6 6 0 100-12 6 6 0 000 12zM8.5 14l-1.5 7 5-3 5 3-1.5-7",
  info: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v6M12 7.5v.01",
  lock: "M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 017 0v3",
  calendar: "M4 6h16v15H4zM4 10h16M8 3v4M16 3v4",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
  home: "M4 11l8-7 8 7v9H4zM10 20v-6h4v6",
  bell: "M6 16V11a6 6 0 1112 0v5l1.5 2h-15zM10 20a2 2 0 004 0",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 00-2-1.2L14 3h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 002 1.2L10 21h4l.5-2.6a7 7 0 002-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z",
  users: "M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 6.5M18 14a6 6 0 013.5 6",
  message: "M4 5h16v11H9l-5 4z",
  flag: "M5 21V4h11l-1.5 4L16 12H5",
  wallet: "M3 7h16v12H3zM3 7l12-3v3M16 13h2",
  shield: "M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z",
  plug: "M9 3v5M15 3v5M6 8h12v3a6 6 0 01-12 0zM12 17v4",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
  clipboard: "M9 4h6v3H9zM7 5H5v16h14V5h-2M9 12h6M9 16h4",
  video: "M3 6h12v12H3zM15 10l6-3v10l-6-3",
  megaphone: "M3 10v4h3l7 4V6L6 10zM17 9a4 4 0 010 6",
  target: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01",
  lab: "M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3M7.5 15h9",
  pen: "M4 20l4-1 11-11-3-3L5 16zM14 6l3 3",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  activity: "M3 12h4l3-8 4 16 3-8h4",
  chevron: "M9 6l6 6-6 6",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  share: "M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4",
  upload: "M12 20V9M7 14l5-5 5 5M5 4h14",
  filter: "M4 5h16l-6 8v6l-4-2v-4z",
  refresh: "M20 11a8 8 0 10-2.3 5.7M20 4v7h-7",
  alert: "M12 3l10 18H2zM12 10v5M12 18v.01",
  sparkle: "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z",
} as const;

export type IconName = keyof typeof paths | "whatsapp" | "linkedin";

export function Icon({ name, size = 18, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  if (name === "whatsapp")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
        <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
      </svg>
    );
  if (name === "linkedin")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
        <path d="M4.98 3.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9z" />
      </svg>
    );
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}
