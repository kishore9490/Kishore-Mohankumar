import "@/styles/fonts";
import "../globals.css";
import type { ReactNode } from "react";

export const metadata = { title: "Sign in · AI Studio Quote Studio", robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
