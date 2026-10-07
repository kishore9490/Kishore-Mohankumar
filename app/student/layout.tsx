import type { Metadata } from "next";
import { StudentNav } from "@/components/student/StudentNav";
import { Icon } from "@/components/ui/Icon";
import { authEnabled } from "@/lib/auth";

export const metadata: Metadata = { title: "Student · EMC", robots: { index: false, follow: false } };

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-mist">
      {!authEnabled && (
        <div className="border-b border-line bg-soft">
          <p className="container-x flex items-center gap-2 py-2.5 text-[13px] text-ink">
            <Icon name="info" size={15} className="shrink-0 text-blue" />
            Concept preview — the student area connects to EMC’s learning platform at launch. No real student data is shown.
          </p>
        </div>
      )}
      <div className="container-x grid gap-8 py-10 md:py-14 lg:grid-cols-[220px_1fr]">
        <StudentNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
