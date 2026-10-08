import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/session";
import { myCertificates } from "@/server/repositories/student";
import { programProgress } from "@/server/repositories/learning";
import { formatDate } from "@/lib/platform/format";
import { EmptyState, Notice, PageHeader, StatusPill } from "@/components/academy/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CertificateCard } from "@/components/academy/student/CertificateCard";
import { ShareButton } from "@/components/academy/student/ShareButton";

export const metadata: Metadata = { title: "My certificates · EMC Academy" };

export default async function CertificatesPage() {
  const user = await requirePermission("learning.access");
  const certs = myCertificates(user.id);
  const prog = programProgress(user.id);

  return (
    <div className="space-y-6">
      <PageHeader label="Plan" title="My certificates" intro="Course certificates issued by EMC Academy. Anyone can confirm a certificate with its public verification link." />

      {certs.length === 0 ? (
        <EmptyState
          icon="award"
          title="No certificates yet"
          text={prog ? `Complete your courses and meet the score requirement to earn your first certificate. You’re ${prog.percent}% through ${prog.program.name}.` : "Certificates appear here once you complete an EMC program or module."}
          action={<ButtonLink href="/academy/student/learning" variant="outline" size="sm">Continue learning</ButtonLink>}
        />
      ) : (
        <ul className="space-y-6">
          {certs.map(({ certificate: c, program, template, holder }) => (
            <li key={c.id} className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
              <CertificateCard id={c.id} holder={holder} program={program?.name ?? "EMC program"} template={template?.name ?? "Course certificate"} issuedAt={c.issuedAt} revoked={c.status === "revoked"} />
              <div className="rounded-2xl border border-line bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[15px] font-semibold">{template?.name ?? "Course certificate"}</p>
                  <StatusPill status={c.status} />
                </div>
                <dl className="mt-4 space-y-3 text-[13.5px]">
                  <div><dt className="label !text-[9.5px]">Program</dt><dd className="mt-1">{program?.name ?? "—"}</dd></div>
                  <div><dt className="label !text-[9.5px]">Issue date</dt><dd className="mt-1">{formatDate(c.issuedAt)}</dd></div>
                  <div><dt className="label !text-[9.5px]">Certificate ID</dt><dd className="mt-1 font-mono">{c.id}</dd></div>
                  {c.status === "revoked" && c.revokedReason && <div><dt className="label !text-[9.5px]">Reason</dt><dd className="mt-1">{c.revokedReason}</dd></div>}
                </dl>
                <div className="mt-5 flex flex-wrap gap-2">
                  <ButtonLink href={`/verify/${c.id}`} size="sm" target="_blank">View</ButtonLink>
                  <span title="PDF download arrives once file storage is connected" className="inline-flex">
                    <button type="button" disabled aria-describedby={`dl-${c.id}`} className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-4 text-[13px] font-medium text-muted opacity-60">
                      <Icon name="download" size={15} /> Download
                    </button>
                  </span>
                  {c.status === "valid" && <ShareButton path={`/verify/${c.id}`} />}
                </div>
                <p id={`dl-${c.id}`} className="mt-3 text-[11.5px] leading-relaxed text-muted">PDF download arrives once file storage is connected. Until then, share the verification link.</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Notice>EMC certificates recognise completion of EMC Academy courses. They are not external professional certifications (such as those awarded by coding credential bodies).</Notice>
    </div>
  );
}
