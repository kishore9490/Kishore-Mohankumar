import "@/styles/fonts";
import "../globals.css";
import "@/styles/documents.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { requireUser } from "@/lib/auth/session";
import { BrandMark, SidebarNav } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

export const metadata: Metadata = {
  title: { default: "Commercial Suite", template: "%s · Commercial Suite" },
  description: "AI Studio Craft Commercial Suite — internal commercial document management",
  robots: { index: false, follow: false },
};

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-screen lg:pl-64">
          <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto bg-navy-900 px-3 py-5 lg:flex">
            <div className="mb-7 px-2">
              <BrandMark />
            </div>
            <SidebarNav isAdmin={user.role === "ADMIN"} />
            <div className="mt-auto px-3 pt-6 text-[11px] leading-relaxed text-indigo-200/40">Internal use only · Infinitia Hub × AI Studio Craft</div>
          </aside>
          <Topbar user={user} />
          <main className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
