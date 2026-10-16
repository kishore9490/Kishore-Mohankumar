import "@/styles/fonts";
import "@/styles/documents.css";
import type { ReactNode } from "react";

export const metadata = { title: "Document", robots: { index: false, follow: false } };

export default function PrintLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ margin: 0, background: "#eef0f7" }}>{children}</body>
    </html>
  );
}
