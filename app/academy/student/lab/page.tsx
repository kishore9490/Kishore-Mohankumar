import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/session";
import { CodingLab } from "@/components/interactive/CodingLab";
import { Notice, PageHeader } from "@/components/academy/ui";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Coding Lab · EMC Academy" };

const FLOW = [
  ["Read case", "Read the fictional encounter note from start to finish."],
  ["Understand documentation", "Work out what the clinician confirmed versus suspected."],
  ["Identify relevant information", "Mark the phrases that actually decide the code."],
  ["Select code", "Choose the code set and the most accurate code."],
  ["Submit", "Lock in your answer — no peeking first."],
  ["Review explanation", "Compare your reasoning with the explanation for every option."],
] as const;

export default async function LabPage() {
  await requirePermission("learning.access");
  return (
    <div className="space-y-6">
      <PageHeader
        label="Practice"
        title="EMC Coding Lab"
        intro="Practise the real coding workflow on fictional cases. The goal is the reasoning, not just the final code."
        actions={<ButtonLink href="/academy/student/assessments" variant="outline" size="sm">Graded lab assessments</ButtonLink>}
      />

      <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3 xl:grid-cols-6" aria-label="Coding workflow">
        {FLOW.map(([title, text], i) => (
          <li key={title} className="relative bg-white p-4 md:p-5">
            <span className="font-mono text-[11px] text-cyan-ink">{String(i + 1).padStart(2, "0")}</span>
            <p className="mt-2 text-[12px] font-semibold uppercase leading-snug tracking-[0.06em]">{title}</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{text}</p>
          </li>
        ))}
      </ol>

      <CodingLab />

      <Notice>
        Educational simulation only. All patients and encounters are fictional and the answer sets are fixed for teaching. This is not medical advice and not an
        authoritative coding decision — real code assignment depends on complete documentation, the current code-set edition, payer rules and official guidelines.
      </Notice>
    </div>
  );
}
