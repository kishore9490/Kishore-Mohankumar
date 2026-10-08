import { saveBatch } from "@/server/actions/admin";
import type { Batch, Program, PublicUser } from "@/lib/platform/types";
import { ActionForm, CheckGroup, Field, Select } from "./forms";

const day = (iso: string) => new Date(new Date(iso).getTime() + 330 * 60000).toISOString().slice(0, 10);

/** Create / edit a batch. Server-validated: dates, capacity ≥ enrolled students, faculty ids. */
export function BatchForm({ batch, programs, faculty }: { batch?: Batch; programs: Program[]; faculty: PublicUser[] }) {
  return (
    <ActionForm action={saveBatch} submit={batch ? "Save batch" : "Create batch"} submitIcon={batch ? undefined : "plus"} hidden={batch ? { id: batch.id } : undefined}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field name="name" label="Batch name" defaultValue={batch?.name} maxLength={90} placeholder="Career Program — Jan 2027 (Weekday)" />
        <Select name="programId" label="Program" defaultValue={batch?.programId} placeholder="Choose a program" options={programs.map((p) => ({ value: p.id, label: p.name }))} />
        <Select name="status" label="Status" defaultValue={batch?.status ?? "planned"} options={[{ value: "planned", label: "Planned" }, { value: "active", label: "Active" }, { value: "completed", label: "Completed" }]} />
        <Field name="startDate" label="Starts" type="date" defaultValue={batch ? day(batch.startDate) : undefined} />
        <Field name="endDate" label="Ends" type="date" defaultValue={batch ? day(batch.endDate) : undefined} />
        <Field name="capacity" label="Capacity" type="number" min={1} max={200} defaultValue={batch?.capacity ?? 20} hint={batch ? `${batch.studentIds.length} enrolled now.` : "Seats available."} />
        <Field name="schedule" label="Schedule" defaultValue={batch?.schedule} maxLength={80} placeholder="Mon–Fri · 10:00–12:00" />
      </div>
      <CheckGroup name="faculty" legend="Faculty" columns={3} defaultValues={batch?.facultyIds ?? []} groups={[{ options: faculty.map((f) => ({ value: f.id, label: f.name, hint: f.title ?? undefined })) }]} />
    </ActionForm>
  );
}
