import Link from "next/link";
import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/session";
import { calendarFor, istDay } from "@/server/repositories/learning";
import { formatTime } from "@/lib/platform/format";
import type { CalendarEvent } from "@/lib/platform/types";
import { EmptyState, PageHeader, Tabs } from "@/components/academy/ui";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Calendar · EMC Academy" };

type View = "day" | "week" | "month";
type Kind = CalendarEvent["kind"];

const KIND: Record<Kind, { label: string; dot: string; chip: string }> = {
  class: { label: "Class", dot: "bg-blue", chip: "border-blue/20 bg-soft text-blue" },
  assessment: { label: "Assessment", dot: "bg-cyan", chip: "border-cyan/30 bg-cyan/10 text-cyan-ink" },
  assignment: { label: "Assignment due", dot: "bg-amber-500", chip: "border-amber-200 bg-amber-50 text-amber-900" },
  event: { label: "Event", dot: "bg-emerald-500", chip: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  deadline: { label: "Deadline", dot: "bg-orange-600", chip: "border-orange-200 bg-orange-50 text-orange-900" },
  counselling: { label: "Counselling", dot: "bg-ink", chip: "border-line bg-mist text-ink" },
};

/* Date helpers on IST calendar days, expressed as YYYY-MM-DD strings. */
const toDate = (d: string) => new Date(`${d}T00:00:00Z`);
const fmt = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: string, n: number) => fmt(new Date(toDate(d).getTime() + n * 86400000));
const addMonths = (d: string, n: number) => {
  const x = toDate(d);
  return fmt(new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + n, 1)));
};
const mondayOf = (d: string) => addDays(d, -((toDate(d).getUTCDay() + 6) % 7));
const label = (d: string, o: Intl.DateTimeFormatOptions) => toDate(d).toLocaleDateString("en-IN", { ...o, timeZone: "UTC" });

function href(view: View, date: string) {
  return `/academy/student/calendar?view=${view}&date=${date}`;
}

function eventHref(e: CalendarEvent) {
  if (e.kind === "assessment") return `/academy/student/assessments/${e.id}`;
  if (e.kind === "assignment") return `/academy/student/assignments/${e.id}`;
  return e.href;
}

function EventChip({ e, compact }: { e: CalendarEvent; compact?: boolean }) {
  const k = KIND[e.kind];
  const to = eventHref(e);
  const body = (
    <>
      <span className={cn("mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full", k.dot)} aria-hidden="true" />
      <span className="min-w-0">
        <span className={cn("block font-medium leading-snug", compact ? "truncate text-[11.5px]" : "text-[13px]")}>{e.title}</span>
        {!compact && <span className="mt-0.5 block font-mono text-[10.5px] opacity-75">{e.kind === "assignment" || e.kind === "deadline" ? "Due" : formatTime(e.startsAt)}{e.kind === "class" && e.endsAt ? `–${formatTime(e.endsAt)}` : ""}</span>}
      </span>
      <span className="sr-only">({k.label})</span>
    </>
  );
  const cls = cn("flex items-start gap-1.5 rounded-md border px-2 py-1", k.chip, to && "transition-opacity hover:opacity-80");
  return to ? <Link href={to} className={cls}>{body}</Link> : <div className={cls}>{body}</div>;
}

function Agenda({ days, byDay, today }: { days: string[]; byDay: Map<string, CalendarEvent[]>; today: string }) {
  const withEvents = days.filter((d) => byDay.get(d)?.length);
  if (!withEvents.length) return <EmptyState icon="calendar" title="Nothing scheduled" text="No classes, assessments or deadlines in this period." />;
  return (
    <ol className="space-y-3">
      {withEvents.map((d) => (
        <li key={d} className="rounded-2xl border border-line bg-white">
          <p className={cn("flex items-center gap-2 border-b border-line px-4 py-2.5 text-[13px] font-semibold", d === today && "text-blue")}>
            {label(d, { weekday: "long", day: "numeric", month: "short" })}
            {d === today && <span className="rounded-full bg-ink px-2 py-0.5 text-[10.5px] text-white">Today</span>}
          </p>
          <ul className="divide-y divide-line">
            {byDay.get(d)!.map((e) => {
              const to = eventHref(e);
              const row = (
                <>
                  <span className="w-[62px] shrink-0 font-mono text-[12px] text-muted">{e.kind === "assignment" || e.kind === "deadline" ? "Due" : formatTime(e.startsAt)}</span>
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", KIND[e.kind].dot)} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-medium leading-snug">{e.title}</span>
                    <span className="mt-0.5 block text-[12.5px] text-muted">{KIND[e.kind].label}{e.meta && e.meta !== KIND[e.kind].label ? ` · ${e.meta}` : ""}</span>
                  </span>
                  {to && <Icon name="chevron" size={14} className="mt-1 shrink-0 text-muted" />}
                </>
              );
              return <li key={`${e.kind}-${e.id}`}>{to ? <Link href={to} className="flex min-h-[52px] items-start gap-3 px-4 py-3 hover:bg-mist/60">{row}</Link> : <div className="flex min-h-[52px] items-start gap-3 px-4 py-3">{row}</div>}</li>;
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ view?: string; date?: string }> }) {
  const user = await requirePermission("learning.access");
  const sp = await searchParams;
  const view: View = sp.view === "day" || sp.view === "month" ? sp.view : "week";
  const today = istDay(new Date());
  const date = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) && !Number.isNaN(toDate(sp.date).getTime()) ? sp.date : today;

  const events = calendarFor(user.id);
  const byDay = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const k = istDay(e.startsAt);
    byDay.set(k, [...(byDay.get(k) ?? []), e]);
  }

  let days: string[];
  let title: string;
  let prev: string;
  let next: string;
  if (view === "day") {
    days = [date];
    title = label(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    prev = addDays(date, -1);
    next = addDays(date, 1);
  } else if (view === "week") {
    const start = mondayOf(date);
    days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    title = `${label(days[0], { day: "numeric", month: "short" })} – ${label(days[6], { day: "numeric", month: "short", year: "numeric" })}`;
    prev = addDays(date, -7);
    next = addDays(date, 7);
  } else {
    const first = `${date.slice(0, 8)}01`;
    const lastDay = addDays(addMonths(first, 1), -1);
    const start = mondayOf(first);
    const end = addDays(mondayOf(lastDay), 6);
    days = [];
    for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
    title = label(first, { month: "long", year: "numeric" });
    prev = addMonths(date, -1);
    next = addMonths(date, 1);
  }
  const month = date.slice(0, 7);
  const rangeDays = view === "month" ? days.filter((d) => d.startsWith(month)) : days;
  const inRange = rangeDays.reduce((n, d) => n + (byDay.get(d)?.length ?? 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader label="Plan" title="Calendar" intro="Classes, assessments, assignment deadlines and academy events. Times are shown in IST." />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Link href={href(view, prev)} aria-label={`Previous ${view}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white hover:border-ink/40"><Icon name="chevron" size={16} className="rotate-180" /></Link>
          <Link href={href(view, today)} className="flex h-10 items-center rounded-full border border-line bg-white px-4 text-[13px] font-medium hover:border-ink/40">Today</Link>
          <Link href={href(view, next)} aria-label={`Next ${view}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white hover:border-ink/40"><Icon name="chevron" size={16} /></Link>
          <h2 className="ml-2 text-[17px] font-semibold tracking-tight" aria-live="polite">{title}</h2>
        </div>
        <Tabs current={view} items={(["day", "week", "month"] as const).map((v) => ({ key: v, label: v[0].toUpperCase() + v.slice(1), href: href(v, date) }))} />
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Legend">
        {(Object.keys(KIND) as Kind[]).filter((k) => k !== "counselling").map((k) => (
          <li key={k} className="flex items-center gap-1.5 text-[12.5px] text-muted"><span className={cn("h-2 w-2 rounded-full", KIND[k].dot)} aria-hidden="true" />{KIND[k].label}</li>
        ))}
      </ul>

      {/* Phones (and the day view everywhere): agenda list */}
      <div className={cn(view !== "day" && "md:hidden")}>
        <Agenda days={rangeDays} byDay={byDay} today={today} />
      </div>

      {view === "week" && (
        <div className="hidden overflow-hidden rounded-2xl border border-line bg-white md:block">
          <div className="grid grid-cols-7 divide-x divide-line">
            {days.map((d) => (
              <div key={d} className={cn("min-h-[360px] min-w-0", d === today && "bg-soft/40")}>
                <Link href={href("day", d)} className="block border-b border-line px-3 py-2.5 hover:bg-mist/60">
                  <span className="label !text-[9.5px]">{label(d, { weekday: "short" })}</span>
                  <span className={cn("mt-1 flex h-7 w-7 items-center justify-center rounded-full text-[15px] font-semibold tabular-nums", d === today && "bg-ink text-white")}>{Number(d.slice(8))}</span>
                </Link>
                <ul className="space-y-1.5 p-2">
                  {(byDay.get(d) ?? []).map((e) => <li key={`${e.kind}-${e.id}`}><EventChip e={e} /></li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "month" && (
        <div className="hidden overflow-hidden rounded-2xl border border-line bg-line md:block">
          <div className="grid grid-cols-7 gap-px">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="label bg-mist/80 px-3 py-2 !text-[9.5px]">{d}</div>)}
            {days.map((d) => {
              const list = byDay.get(d) ?? [];
              const other = !d.startsWith(month);
              return (
                <div key={d} className={cn("min-h-[116px] min-w-0 bg-white p-1.5", other && "bg-mist/50")}>
                  <Link href={href("day", d)} className={cn("mb-1 flex h-7 w-7 items-center justify-center rounded-full text-[12.5px] tabular-nums hover:bg-mist", d === today && "bg-ink font-semibold text-white hover:bg-ink", other && "text-muted")} aria-label={label(d, { weekday: "long", day: "numeric", month: "long" })}>
                    {Number(d.slice(8))}
                  </Link>
                  <ul className="space-y-1">
                    {list.slice(0, 3).map((e) => <li key={`${e.kind}-${e.id}`}><EventChip e={e} compact /></li>)}
                  </ul>
                  {list.length > 3 && <Link href={href("day", d)} className="mt-1 block px-1 text-[11px] font-medium text-blue">+{list.length - 3} more</Link>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[12.5px] text-muted">{inRange} item{inRange === 1 ? "" : "s"} in this {view}. Live class links are shared by your faculty before each class.</p>
    </div>
  );
}
