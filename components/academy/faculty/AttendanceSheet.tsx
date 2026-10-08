"use client";
import { useMemo, useState, useTransition } from "react";
import { markAttendance, type ActionResult } from "@/server/actions/faculty";
import { Avatar } from "@/components/academy/ui";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { FormResult } from "./form";

type Status = "present" | "absent" | "late" | "excused";
const OPTIONS: { key: Status; label: string; on: string }[] = [
  { key: "present", label: "Present", on: "border-emerald-600 bg-emerald-600 text-white" },
  { key: "absent", label: "Absent", on: "border-orange-700 bg-orange-700 text-white" },
  { key: "late", label: "Late", on: "border-blue bg-blue text-white" },
  { key: "excused", label: "Excused", on: "border-ink bg-ink text-white" },
];

export interface SheetStudent {
  id: string;
  name: string;
  rate: number | null;
  status: Status | null;
}

export function AttendanceSheet({ sessionId, students, markable }: { sessionId: string; students: SheetStudent[]; markable: boolean }) {
  const initial = useMemo(() => Object.fromEntries(students.map((s) => [s.id, s.status])) as Record<string, Status | null>, [students]);
  const [marks, setMarks] = useState(initial);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  const counts = OPTIONS.map((o) => ({ ...o, n: Object.values(marks).filter((v) => v === o.key).length }));
  const unmarked = students.filter((s) => !marks[s.id]).length;
  const dirty = students.some((s) => marks[s.id] !== initial[s.id]);

  const set = (id: string, v: Status) => {
    setResult(null);
    setMarks((m) => ({ ...m, [id]: v }));
  };

  const save = () =>
    start(async () => {
      const entries = students.filter((s) => marks[s.id]).map((s) => ({ studentId: s.id, status: marks[s.id] as Status }));
      if (!entries.length) {
        setResult({ ok: false, error: "Mark at least one student before saving." });
        return;
      }
      setResult(await markAttendance({ sessionId, entries }));
    });

  if (!students.length) return <p className="rounded-xl bg-mist px-4 py-5 text-[14px] text-muted">This batch has no students yet.</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]" aria-label="Attendance summary">
          {counts.map((c) => (
            <li key={c.key} className="text-muted"><span className="font-semibold tabular-nums text-ink">{c.n}</span> {c.label.toLowerCase()}</li>
          ))}
          {unmarked > 0 && <li className="text-orange-800"><span className="font-semibold tabular-nums">{unmarked}</span> not marked</li>}
        </ul>
        {markable && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            iconLeft="check"
            onClick={() => {
              setResult(null);
              setMarks(Object.fromEntries(students.map((s) => [s.id, "present"])) as Record<string, Status>);
            }}
          >
            Mark all present
          </Button>
        )}
      </div>

      <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
        {students.map((s) => (
          <li key={s.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar name={s.name} size={32} />
              <div className="min-w-0">
                <p id={`att-${s.id}-name`} className="truncate text-[14.5px] font-medium">{s.name}</p>
                <p className={cn("font-mono text-[11px]", s.rate !== null && s.rate < 75 ? "text-orange-800" : "text-muted")}>
                  {s.rate !== null ? `${s.rate}% overall` : "No history"}
                </p>
              </div>
            </div>
            <div role="radiogroup" aria-labelledby={`att-${s.id}-name`} className="grid grid-cols-4 gap-1 rounded-full border border-line bg-mist/70 p-1 sm:w-[340px]">
              {OPTIONS.map((o) => {
                const checked = marks[s.id] === o.key;
                return (
                  <label
                    key={o.key}
                    className={cn(
                      "relative flex h-9 cursor-pointer items-center justify-center rounded-full border text-[12.5px] font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue",
                      checked ? o.on : "border-transparent text-ink/70 hover:bg-white",
                      !markable && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <input type="radio" name={`att-${s.id}`} value={o.key} checked={checked} disabled={!markable} onChange={() => set(s.id, o.key)} className="sr-only" />
                    {o.label}
                  </label>
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      {markable ? (
        <div className="sticky bottom-20 z-10 mt-4 flex flex-col gap-3 rounded-2xl border border-line bg-white/95 p-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between lg:bottom-4">
          <p className="px-1 text-[13px] text-muted">{dirty ? "You have unsaved changes." : unmarked === students.length ? "Not marked yet — use “Mark all present”, then adjust." : "Attendance is saved."}</p>
          <Button type="button" onClick={save} disabled={pending || !dirty} iconLeft="check">{pending ? "Saving…" : "Save attendance"}</Button>
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-mist px-4 py-3 text-[13.5px] text-muted">This class hasn’t happened yet. You can mark attendance from the day of the class.</p>
      )}
      {result && <div className="mt-3"><FormResult state={result} /></div>}
    </div>
  );
}
