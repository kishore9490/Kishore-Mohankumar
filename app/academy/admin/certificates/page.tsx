import Link from "next/link";
import { requirePermission } from "@/server/auth/session";
import { activeStudents, certificateById, certificateOverview, nameOf, programName, programs } from "@/server/repositories/admin";
import { issueCertificate, revokeCertificate } from "@/server/actions/admin";
import { formatDate, relative } from "@/lib/platform/format";
import { DataTable, EmptyState, Metrics, Notice, PageHeader, Panel, Pill, StatusPill } from "@/components/academy/ui";
import { ActionForm, Field, Select } from "@/components/academy/admin/forms";
import { Dot, KeyValues, ManagePanel, MetaChips } from "@/components/academy/admin/bits";
import { Icon } from "@/components/ui/Icon";

export const metadata = { title: "Certificates · EMC Academy" };

const CERT_ID = /^EMC-\d{4}-[A-Z0-9]{6}$/;

export default async function CertificatesPage({ searchParams }: { searchParams: Promise<{ cert?: string; verify?: string }> }) {
  await requirePermission("certificates.manage");
  const sp = await searchParams;
  const ov = certificateOverview();
  const selected = sp.cert ? certificateById(sp.cert) : null;
  const lookup = (sp.verify ?? "").trim().toUpperCase().slice(0, 20);
  const found = lookup ? certificateById(lookup) : null;
  const valid = ov.certificates.filter((c) => c.certificate.status === "valid").length;

  return (
    <>
      <PageHeader
        label="Academy · Certificates"
        title="Course certificates."
        intro="Issue, revoke and verify EMC course certificates. Each has a public verification code. EMC certificates recognise course completion — they are not external professional certifications."
      />
      <div className="space-y-5">
        <Metrics
          items={[
            { label: "Valid certificates", value: valid },
            { label: "Revoked", value: ov.certificates.length - valid },
            { label: "Templates", value: ov.templates.length, hint: `${ov.templates.filter((t) => t.template.status === "active").length} active` },
          ]}
        />

        {selected && (
          <ManagePanel id="manage" label="Certificate" title={<span className="flex flex-wrap items-center gap-2.5"><span className="font-mono">{selected.id}</span> <StatusPill status={selected.status} /></span>} closeHref="/academy/admin/certificates">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-line">
              <div className="lg:pr-7">
                <KeyValues
                  items={[
                    ["Student", nameOf(selected.studentId)],
                    ["Program", programName(selected.programId)],
                    ["Issued", formatDate(selected.issuedAt)],
                    ["Issued by", nameOf(selected.issuedBy)],
                    ["Verification", <Link key="v" href={`/verify/${selected.id}`} className="font-mono text-blue hover:text-ink">/verify/{selected.id}</Link>],
                    ...(selected.revokedReason ? [["Revoked because", selected.revokedReason] as [string, string]] : []),
                  ]}
                />
              </div>
              <div className="lg:pl-7">
                {/* Form stays mounted after revoking so the confirmation remains visible. */}
                <p className="text-[14px] font-medium">Revoke certificate</p>
                <p className="mt-1 text-[13px] text-muted">Verification will show it as revoked. The reason is kept in the audit log.</p>
                <div className="mt-3">
                  <ActionForm action={revokeCertificate} submit="Revoke" submitIcon="close" variant="outline" hidden={{ id: selected.id }} confirm={`Revoke ${selected.id}? This can’t be undone.`}>
                    <Field name="reason" label="Reason" maxLength={200} placeholder="e.g. Issued in error" />
                  </ActionForm>
                </div>
              </div>
            </div>
          </ManagePanel>
        )}
        {sp.cert && !selected && <Notice tone="warning">That certificate doesn’t exist.</Notice>}

        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <Panel title="Issue a certificate" label="New">
            <ActionForm action={issueCertificate} submit="Issue certificate" submitIcon="award" confirm="Issue this certificate? The student is notified.">
              <Select name="studentId" label="Student" placeholder="Choose a student" options={activeStudents().map((s) => ({ value: s.id, label: `${s.name} · ${s.email}` }))} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select name="programId" label="Program" placeholder="Choose a program" options={programs().map((p) => ({ value: p.id, label: p.name }))} />
                <Select name="templateId" label="Template" placeholder="Choose a template" options={ov.templates.map((t) => ({ value: t.template.id, label: t.template.name, disabled: t.template.status !== "active" }))} />
              </div>
              <p className="text-[12.5px] text-muted">A unique code like <span className="font-mono">EMC-2026-7F3K9Q</span> is generated. The student receives an email and an in-app notice with their verification link.</p>
            </ActionForm>
          </Panel>

          <div className="space-y-5">
            <Panel title="Verify a certificate" label="Lookup">
              <form method="get" action="/academy/admin/certificates" role="search" className="flex flex-col gap-2 sm:flex-row">
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Certificate code</span>
                  <input name="verify" defaultValue={lookup} placeholder="EMC-2026-XXXXXX" maxLength={20} className="field !h-11 !py-0 font-mono uppercase !text-[15px]" />
                </label>
                <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[14px] font-medium text-white hover:bg-navy-2"><Icon name="search" size={15} />Verify</button>
              </form>
              {lookup && (
                <div className="mt-4">
                  {!CERT_ID.test(lookup) ? (
                    <Notice tone="warning">Codes look like EMC-2026-XXXXXX.</Notice>
                  ) : found ? (
                    <div className="rounded-xl border border-line p-4">
                      <p className="flex items-center gap-2 text-[15px] font-semibold"><span className="font-mono">{found.id}</span><StatusPill status={found.status} /></p>
                      <p className="mt-1 text-[13.5px] text-muted">{nameOf(found.studentId)} · {programName(found.programId)} · {formatDate(found.issuedAt)}</p>
                      <p className="mt-3 text-[13px]"><Link href={`/verify/${found.id}`} className="font-medium text-blue hover:text-ink">Open public verification page</Link></p>
                    </div>
                  ) : <Notice tone="warning">No certificate with code {lookup}.</Notice>}
                </div>
              )}
            </Panel>
            <Panel title="Templates">
              <ul className="divide-y divide-line">
                {ov.templates.map(({ template: t, issued }) => (
                  <li key={t.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="min-w-0">
                      <span className="block text-[14.5px] font-medium">{t.name}</span>
                      <span className="block text-[12.5px] text-muted">{t.description}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1"><StatusPill status={t.status} /><span className="font-mono text-[11px] text-muted">{issued} issued</span></span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>

        <section aria-labelledby="issued-h">
          <h2 id="issued-h" className="mb-3 text-[17px] font-semibold tracking-tight">Issued certificates</h2>
          <DataTable
            caption="Issued certificates"
            rows={ov.certificates}
            rowKey={(r) => r.certificate.id}
            rowHref={(r) => `/academy/admin/certificates?cert=${r.certificate.id}#manage`}
            empty={<EmptyState icon="award" title="No certificates yet" text="Certificates you issue appear here with their verification codes." />}
            columns={[
              { key: "id", label: "Certificate ID", mobile: "primary", render: (r) => <span className="font-mono text-[13px]">{r.certificate.id}</span> },
              { key: "student", label: "Student", render: (r) => r.student },
              { key: "program", label: "Program", render: (r) => <span className="text-muted">{r.program}</span> },
              { key: "template", label: "Template", mobile: "hide", render: (r) => <Pill>{r.template}</Pill> },
              { key: "issued", label: "Issued", render: (r) => <span className="font-mono text-[12.5px] text-muted">{formatDate(r.certificate.issuedAt)}</span> },
              { key: "status", label: "Status", render: (r) => <StatusPill status={r.certificate.status} /> },
            ]}
          />
        </section>

        <Panel title="History" label="From the audit log">
          {ov.history.length === 0 ? <p className="text-[14px] text-muted">No certificate activity yet.</p> : (
            <ul className="divide-y divide-line">
              {ov.history.map((a, i) => (
                <li key={`${a.id}-${i}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-[13.5px]">
                  <Dot tone={a.action.endsWith("revoked") ? "danger" : "success"} />
                  <span className="font-mono text-[12.5px]">{a.action}</span>
                  <span className="font-mono text-[12.5px] text-muted">{a.objectId}</span>
                  <span className="text-muted">by {a.userName ?? "System"}</span>
                  <MetaChips meta={a.meta} />
                  <span className="ml-auto font-mono text-[11px] text-muted">{relative(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
