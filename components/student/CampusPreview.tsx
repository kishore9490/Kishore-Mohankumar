import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * "Your learning space" — a concept preview of the student dashboard.
 * All values are illustrative UI only; it will be powered by the LMS later.
 */
export function CampusPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[22px] border border-line bg-white shadow-[0_60px_140px_-60px_rgba(7,26,51,.55)]",
        className,
      )}
      aria-label="Concept preview of the EMC student dashboard (illustrative)"
      role="img"
    >
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-52 shrink-0 border-r border-line bg-mist/70 p-4 md:block" aria-hidden="true">
          <p className="label !text-[10px]">EMC Campus</p>
          <ul className="mt-5 space-y-1 text-[13px]">
            {[
              ["layers", "Overview", true],
              ["book", "My courses"],
              ["file", "Practice cases"],
              ["chart", "Assessments"],
              ["award", "Certificates"],
              ["user", "Mentor & support"],
            ].map(([icon, label, on]) => (
              <li
                key={label as string}
                className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2", on ? "bg-white font-medium text-ink shadow-sm" : "text-muted")}
              >
                <Icon name={icon as "layers"} size={15} /> {label as string}
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0 flex-1 p-4 md:p-6" aria-hidden="true">
          <div className="flex items-center justify-between">
            <div>
              <p className="label !text-[10px]">Welcome back</p>
              <p className="mt-1 text-[18px] font-semibold tracking-tight">Your learning space</p>
            </div>
            <span className="rounded-full bg-soft px-2.5 py-1 text-[11px] font-medium text-blue">Concept preview</span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {/* Progress */}
            <div className="rounded-xl border border-line p-4 sm:col-span-2">
              <p className="label !text-[10px]">Course progress</p>
              <div className="mt-3 flex items-end gap-4">
                <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-line)" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-cyan)" strokeWidth="3.5" strokeDasharray="94" strokeDashoffset="52" strokeLinecap="round" />
                </svg>
                <div className="flex-1">
                  <p className="text-[12px] text-muted">Current module</p>
                  <p className="text-[15px] font-semibold">ICD-10-CM · Conventions</p>
                  <div className="mt-2 h-1.5 rounded-full bg-mist">
                    <div className="h-full w-[45%] rounded-full bg-ink" />
                  </div>
                </div>
              </div>
            </div>
            {/* Streak */}
            <div className="rounded-xl bg-ink p-4 text-white">
              <p className="label !text-[10px] !text-white/50">Learning streak</p>
              <div className="mt-3 flex gap-1">
                {[1, 1, 1, 1, 0.4, 0.15, 0.15].map((o, i) => (
                  <span key={i} className="h-7 flex-1 rounded-[4px] bg-cyan" style={{ opacity: o }} />
                ))}
              </div>
              <p className="mt-2 text-[11.5px] text-white/50">This week</p>
            </div>

            {/* Practice cases */}
            <div className="rounded-xl border border-line p-4">
              <p className="label !text-[10px]">Practice cases</p>
              <ul className="mt-3 space-y-2 text-[12.5px]">
                {["Outpatient · respiratory", "Endocrine · follow-up", "E/M · established"].map((c, i) => (
                  <li key={c} className="flex items-center justify-between">
                    <span className="truncate">{c}</span>
                    {i === 0 ? <Icon name="check" size={14} className="text-cyan-ink" /> : <span className="h-1.5 w-1.5 rounded-full bg-line" />}
                  </li>
                ))}
              </ul>
            </div>
            {/* Assessments */}
            <div className="rounded-xl border border-line p-4">
              <p className="label !text-[10px]">Assessments</p>
              <div className="mt-3 flex h-14 items-end gap-1.5">
                {[40, 62, 55, 78, 70].map((h, i) => (
                  <span key={i} className={cn("flex-1 rounded-t-[3px]", i === 4 ? "bg-blue" : "bg-blue/20")} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            {/* Upcoming */}
            <div className="rounded-xl border border-line p-4">
              <p className="label !text-[10px]">Upcoming session</p>
              <p className="mt-3 text-[13.5px] font-medium">CPT® · E/M basics</p>
              <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted">
                <Icon name="calendar" size={13} /> Scheduled by your batch
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-[12px] text-muted">
                <Icon name="user" size={13} /> Mentor support available
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-line p-4">
            <div className="flex items-center gap-3">
              <Icon name="award" size={20} className="text-blue" />
              <div>
                <p className="text-[13px] font-medium">Certificates</p>
                <p className="text-[11.5px] text-muted">Appear here when you complete a program.</p>
              </div>
            </div>
            <Icon name="lock" size={16} className="text-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
