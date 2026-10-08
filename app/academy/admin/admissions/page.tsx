import Link from "next/link";
import { requirePermission } from "@/server/auth/session";
import { ADMISSION_STAGES, admissionsBoard, batchesForSelect, programs } from "@/server/repositories/admin";
import { createAdmission, moveAdmission } from "@/server/actions/admin";
import { relative } from "@/lib/platform/format";
import { Notice, PageHeader, Pill, humanize } from "@/components/academy/ui";
import { ActionForm, Checkbox, Field, Select } from "@/components/academy/admin/forms";
import { KeyValues, ManagePanel, SubHead } from "@/components/academy/admin/bits";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export const metadata = { title: "Admissions · EMC Academy" };

const maskPhone = (p: string) => p.replace(/\d(?=(?:\D*\d){4})/g, "•");

export default async function AdmissionsPage({ searchParams }: { searchParams: Promise<{ adm?: string; new?: string }> }) {
  await requirePermission("admissions.manage");
  const sp = await searchParams;
  const board = admissionsBoard();
  const all = board.flatMap((c) => c.items);
  const selected = sp.adm ? all.find((r) => r.admission.id === sp.adm) ?? null : null;
  const batches = batchesForSelect();

  return (
    <>
      <PageHeader
        label="Academy · Admissions"
        title="Admissions pipeline."
        intro="From application to enrolled student. Moving someone to “Enrolled” creates their account, reserves their seat and sends the welcome messages."
        actions={<ButtonLink href="/academy/admin/admissions?new=1" iconLeft="plus" icon={null} size="sm">New application</ButtonLink>}
      />
      <div className="space-y-5">
        {sp.new && (
          <ManagePanel label="New application" title="Add an applicant" closeHref="/academy/admin/admissions">
            <ActionForm action={createAdmission} submit="Add application" submitIcon="plus">
              <div className="grid gap-4 md:grid-cols-3">
                <Field name="name" label="Applicant name" maxLength={80} />
                <Field name="phone" label="Mobile" type="tel" maxLength={20} placeholder="+91 98765 43210" />
                <Select name="programId" label="Program" placeholder="Choose a program" options={programs().map((p) => ({ value: p.id, label: p.name }))} />
              </div>
            </ActionForm>
          </ManagePanel>
        )}

        {selected && (
          <ManagePanel id="manage" label={`Application · ${selected.admission.id}`} title={selected.admission.name} closeHref="/academy/admin/admissions">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-0 lg:divide-x lg:divide-line">
              <section className="min-w-0 lg:pr-7">
                <SubHead>Applicant</SubHead>
                <KeyValues
                  className="mt-3"
                  items={[
                    ["Program", selected.program],
                    ["Stage", humanize(selected.admission.stage)],
                    ["Mobile", maskPhone(selected.admission.phone)],
                    ["Source", selected.leadSource ? humanize(selected.leadSource) : "Direct"],
                    ["Documents", selected.admission.documentsComplete ? "Complete" : "Pending"],
                    ["Batch", selected.batch ?? "Not assigned"],
                    ["Updated", relative(selected.admission.updatedAt)],
                  ]}
                />
                {selected.admission.leadId && <p className="mt-4 text-[13px]"><Link href={`/academy/marketing/leads/${selected.admission.leadId}`} className="font-medium text-blue hover:text-ink">Open lead history</Link></p>}
              </section>
              <section className="min-w-0 lg:pl-7">
                <SubHead>Move stage</SubHead>
                {/* The form stays mounted after enrolling so the one-time password remains visible. */}
                {selected.admission.stage === "enrolled" && (
                  <div className="mt-3"><Notice>Enrolled. Manage the student from <Link href="/academy/admin/users?role=student" className="font-medium text-blue">Users</Link>.</Notice></div>
                )}
                <div className="mt-3">
                    <ActionForm action={moveAdmission} submit="Move applicant" submitIcon="arrow" hidden={{ id: selected.admission.id }} confirm="Move this applicant? Enrolling creates a student account and sends welcome messages.">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Select name="stage" label="New stage" defaultValue={nextStage(selected.admission.stage)} options={ADMISSION_STAGES.map((s) => ({ value: s.key, label: `${s.label} — ${s.hint}` }))} />
                        <Select
                          name="batchId"
                          label="Batch"
                          defaultValue={selected.admission.batchId ?? ""}
                          placeholder="Not yet"
                          hint="Required from “Batch assigned”."
                          options={batches.filter((b) => b.programId === selected.admission.programId && b.status !== "completed").map((b) => ({ value: b.id, label: `${b.name}${b.full ? " (full)" : ""}`, disabled: b.full }))}
                        />
                      </div>
                      <Field name="email" label="Student email" type="email" optional maxLength={160} hint="Needed to enrol if the lead has no email. Becomes their sign-in." />
                      <Checkbox name="documentsComplete" label="Eligibility documents verified" defaultChecked={selected.admission.documentsComplete} hint="Required before payment." />
                    </ActionForm>
                </div>
              </section>
            </div>
          </ManagePanel>
        )}
        {sp.adm && !selected && <Notice tone="warning">That application no longer exists.</Notice>}

        <section aria-label="Admissions board" className="-mx-4 md:mx-0">
          <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:px-0">
            {board.map((col, i) => (
              <div key={col.key} id={col.key} className="w-[264px] shrink-0 snap-start scroll-mt-24 rounded-2xl border border-line bg-white/60">
                <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
                  <div className="min-w-0">
                    <p className="label !text-[9.5px]">Step {i + 1}</p>
                    <h2 className="truncate text-[14.5px] font-semibold">{col.label}</h2>
                  </div>
                  <span className={cn("rounded-full px-2 py-0.5 font-mono text-[12px]", col.key === "enrolled" ? "bg-cyan/15 text-cyan-ink" : "bg-mist text-ink/70")}>{col.items.length}</span>
                </div>
                <ul className="space-y-2 p-2.5">
                  {col.items.length === 0 && <li className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-[12.5px] text-muted">No one at this stage</li>}
                  {col.items.map((r) => (
                    <li key={r.admission.id}>
                      <Link
                        href={`/academy/admin/admissions?adm=${r.admission.id}#manage`}
                        aria-current={selected?.admission.id === r.admission.id ? "true" : undefined}
                        className="block rounded-xl border border-line bg-white p-3 transition-colors hover:border-ink/30 aria-[current]:border-ink"
                      >
                        <p className="truncate text-[14px] font-medium">{r.admission.name}</p>
                        <p className="mt-0.5 truncate text-[12px] text-muted">{r.program}</p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          {r.admission.documentsComplete ? <Pill tone="success">Docs ✓</Pill> : <Pill>Docs pending</Pill>}
                          {r.batch && <Pill tone="info">{r.batch.split(" — ")[1] ?? "Batch"}</Pill>}
                        </div>
                        <p className="mt-2 flex items-center justify-between font-mono text-[10.5px] text-muted">
                          <span>{r.leadSource ? humanize(r.leadSource) : "Direct"}</span>
                          <span>{relative(r.admission.updatedAt)}</span>
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-2 flex items-center gap-1.5 px-4 text-[12.5px] text-muted md:px-0"><Icon name="arrow" size={13} /> Scroll sideways to see every stage. Select a card to move it.</p>
        </section>
      </div>
    </>
  );
}

function nextStage(s: string) {
  const i = ADMISSION_STAGES.findIndex((x) => x.key === s);
  return ADMISSION_STAGES[Math.min(ADMISSION_STAGES.length - 1, i + 1)].key;
}
