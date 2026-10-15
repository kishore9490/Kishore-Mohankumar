import "@/styles/fonts";
import "../globals.css";
import type { ReactNode } from "react";

export const metadata = { title: "Sign in · Commercial Suite", robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
